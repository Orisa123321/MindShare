import { prisma } from '../config/database.js';
import { NotFoundError, SearchQuery } from '../types/index.js';

// ============================================================================
// Users Service — Profile, Groups, and Materials
// ============================================================================

/**
 * Get a user's public profile by ID.
 * Excludes passwordHash from the result.
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  const { passwordHash: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

/**
 * Update a user's profile fields (bio, username).
 * Returns the updated user without passwordHash.
 */
export async function updateUser(
  userId: string,
  data: { bio?: string; username?: string }
) {
  // Ensure the user exists first
  const existing = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existing) {
    throw new NotFoundError('User');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.username !== undefined && { username: data.username }),
    },
  });

  const { passwordHash: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

/**
 * Get paginated study groups that a user is a member of.
 * Supports optional search filtering on group title.
 */
export async function getUserGroups(userId: string, query: SearchQuery) {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 10));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    userId,
  };

  // If search is provided, filter on the related group's title
  if (query.search) {
    where.group = {
      title: { contains: query.search, mode: 'insensitive' },
    };
  }

  const [members, total] = await Promise.all([
    prisma.groupMember.findMany({
      where,
      skip,
      take: limit,
      include: {
        group: true,
      },
      orderBy: { joinedAt: 'desc' },
    }),
    prisma.groupMember.count({ where }),
  ]);

  // Extract the group data from each membership record
  const groups = members.map((m) => ({
    ...m.group,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  return {
    data: groups,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get paginated study materials uploaded by a user.
 * Supports optional search filtering on material title.
 */
export async function getUserMaterials(userId: string, query: SearchQuery) {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 10));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    uploadedById: userId,
  };

  if (query.search) {
    where.title = { contains: query.search, mode: 'insensitive' };
  }

  const [materials, total] = await Promise.all([
    prisma.studyMaterial.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
