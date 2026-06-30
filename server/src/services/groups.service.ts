import { prisma } from '../config/database.js';
import {
  SearchQuery,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../types/index.js';

// ============================================================================
// Study Groups Service
// ============================================================================

/**
 * Create a new study group and auto-add the creator as OWNER.
 * Uses a transaction to ensure both records are created atomically.
 */
export async function createGroup(
  userId: string,
  data: { title: string; description?: string }
) {
  const group = await prisma.$transaction(async (tx) => {
    const newGroup = await tx.studyGroup.create({
      data: {
        title: data.title,
        description: data.description,
        createdById: userId,
      },
    });

    await tx.groupMember.create({
      data: {
        userId,
        groupId: newGroup.id,
        role: 'OWNER',
      },
    });

    return newGroup;
  });

  // Return the group with member count and creator info
  return prisma.studyGroup.findUniqueOrThrow({
    where: { id: group.id },
    include: {
      createdBy: {
        select: { id: true, username: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
  });
}

/**
 * List groups with pagination. Supports search by title/description.
 * Includes member count and creator info for each group.
 */
export async function getGroups(query: SearchQuery) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where = query.search
    ? {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [groups, total] = await Promise.all([
    prisma.studyGroup.findMany({
      where,
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
    prisma.studyGroup.count({ where }),
  ]);

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
 * Get a single group by ID with creator info and member count.
 * @throws NotFoundError if the group does not exist.
 */
export async function getGroupById(groupId: string) {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    include: {
      createdBy: {
        select: { id: true, username: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
  });

  if (!group) {
    throw new NotFoundError('Study group');
  }

  return group;
}

/**
 * Update a study group. Only the owner can perform this action.
 * @throws NotFoundError if the group does not exist.
 * @throws ForbiddenError if the user is not the group owner.
 */
export async function updateGroup(
  groupId: string,
  userId: string,
  data: { title?: string; description?: string }
) {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new NotFoundError('Study group');
  }

  if (group.createdById !== userId) {
    throw new ForbiddenError('Only the group owner can update this group');
  }

  return prisma.studyGroup.update({
    where: { id: groupId },
    data,
    include: {
      createdBy: {
        select: { id: true, username: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
  });
}

/**
 * Delete a study group. Only the owner can perform this action.
 * @throws NotFoundError if the group does not exist.
 * @throws ForbiddenError if the user is not the group owner.
 */
export async function deleteGroup(groupId: string, userId: string) {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new NotFoundError('Study group');
  }

  if (group.createdById !== userId) {
    throw new ForbiddenError('Only the group owner can delete this group');
  }

  await prisma.studyGroup.delete({ where: { id: groupId } });
}

/**
 * Join a study group as a MEMBER.
 * @throws NotFoundError if the group does not exist.
 * @throws ConflictError if the user is already a member.
 */
export async function joinGroup(groupId: string, userId: string) {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new NotFoundError('Study group');
  }

  const existingMember = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });

  if (existingMember) {
    throw new ConflictError('You are already a member of this group');
  }

  return prisma.groupMember.create({
    data: {
      userId,
      groupId,
      role: 'MEMBER',
    },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
      group: {
        select: { id: true, title: true },
      },
    },
  });
}

/**
 * Leave a study group. Owners cannot leave — they must transfer or delete.
 * @throws NotFoundError if the membership does not exist.
 * @throws ForbiddenError if the user is the group owner.
 */
export async function leaveGroup(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });

  if (!membership) {
    throw new NotFoundError('Group membership');
  }

  if (membership.role === 'OWNER') {
    throw new ForbiddenError(
      'Owners cannot leave their group. Transfer ownership or delete the group instead.'
    );
  }

  await prisma.groupMember.delete({
    where: { id: membership.id },
  });
}

/**
 * Get all members of a study group with user info and role.
 * @throws NotFoundError if the group does not exist.
 */
export async function getGroupMembers(groupId: string) {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new NotFoundError('Study group');
  }

  return prisma.groupMember.findMany({
    where: { groupId },
    orderBy: { joinedAt: 'asc' },
    include: {
      user: {
        select: { id: true, username: true, email: true, avatarUrl: true },
      },
    },
  });
}

/**
 * Get paginated materials belonging to a study group.
 * @throws NotFoundError if the group does not exist.
 */
export async function getGroupMaterials(groupId: string, query: SearchQuery) {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new NotFoundError('Study group');
  }

  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { groupId };

  if (query.search) {
    where.title = { contains: query.search, mode: 'insensitive' };
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
