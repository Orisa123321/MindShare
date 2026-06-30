import { prisma } from '../config/database.js';
import { SearchQuery, NotFoundError, ForbiddenError } from '../types/index.js';
import { deleteFile } from '../middleware/upload.middleware.js';

// ============================================================================
// Study Materials Service
// ============================================================================

/**
 * Create a new study material record.
 * Returns the material with uploader info.
 */
export async function createMaterial(data: {
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  groupId?: string;
}) {
  return prisma.studyMaterial.create({
    data: {
      title: data.title,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      uploadedById: data.uploadedById,
      groupId: data.groupId || null,
    },
    include: {
      uploadedBy: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });
}

/**
 * List materials with pagination. Supports search by title and
 * optional filtering by group_id. Includes uploader info.
 */
export async function getMaterials(
  query: SearchQuery & { group_id?: string }
) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (query.search) {
    where.title = { contains: query.search, mode: 'insensitive' };
  }

  if (query.group_id) {
    where.groupId = query.group_id;
  }

  const [materials, total] = await Promise.all([
    prisma.studyMaterial.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    }),
    prisma.studyMaterial.count({ where }),
  ]);

  return {
    data: materials,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single material by ID with uploader and group info.
 * @throws NotFoundError if the material does not exist.
 */
export async function getMaterialById(materialId: string) {
  const material = await prisma.studyMaterial.findUnique({
    where: { id: materialId },
    include: {
      uploadedBy: {
        select: { id: true, username: true, avatarUrl: true },
      },
      group: {
        select: { id: true, title: true },
      },
    },
  });

  if (!material) {
    throw new NotFoundError('Study material');
  }

  return material;
}

/**
 * Delete a material. Only the original uploader can delete.
 * Also removes the file from disk.
 * @throws NotFoundError if the material does not exist.
 * @throws ForbiddenError if the user is not the uploader.
 */
export async function deleteMaterial(materialId: string, userId: string) {
  const material = await prisma.studyMaterial.findUnique({
    where: { id: materialId },
  });

  if (!material) {
    throw new NotFoundError('Study material');
  }

  if (material.uploadedById !== userId) {
    throw new ForbiddenError('Only the uploader can delete this material');
  }

  // Delete the physical file from S3
  await deleteFile(material.fileUrl);

  await prisma.studyMaterial.delete({ where: { id: materialId } });
}

/**
 * Global search across groups, materials, AND forum questions.
 * Returns combined results with type labels for the frontend.
 */
export async function searchAll(query: string, page: number, limit: number) {
  const skip = (page - 1) * limit;

  const searchFilter = { contains: query, mode: 'insensitive' as const };

  const [groups, materials, questions, groupCount, materialCount, questionCount] =
    await Promise.all([
      prisma.studyGroup.findMany({
        where: {
          OR: [
            { title: searchFilter },
            { description: searchFilter },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, username: true, avatarUrl: true },
          },
          _count: { select: { members: true } },
        },
      }),
      prisma.studyMaterial.findMany({
        where: { title: searchFilter },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      }),
      prisma.forumQuestion.findMany({
        where: {
          OR: [
            { title: searchFilter },
            { content: searchFilter },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
          _count: { select: { answers: true } },
        },
      }),
      prisma.studyGroup.count({
        where: {
          OR: [
            { title: searchFilter },
            { description: searchFilter },
          ],
        },
      }),
      prisma.studyMaterial.count({
        where: { title: searchFilter },
      }),
      prisma.forumQuestion.count({
        where: {
          OR: [
            { title: searchFilter },
            { content: searchFilter },
          ],
        },
      }),
    ]);

  const total = groupCount + materialCount + questionCount;

  return {
    data: {
      groups: groups.map((g) => ({ ...g, type: 'group' as const })),
      materials: materials.map((m) => ({ ...m, type: 'material' as const })),
      questions: questions.map((q) => ({ ...q, type: 'question' as const })),
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
