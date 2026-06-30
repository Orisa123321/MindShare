import { prisma } from '../config/database.js';

export async function saveMessage(groupId: string, userId: string, content: string) {
  return prisma.chatMessage.create({
    data: {
      groupId,
      userId,
      content,
    },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });
}

export async function getGroupMessages(groupId: string, limit = 50) {
  return prisma.chatMessage.findMany({
    where: { groupId },
    orderBy: { createdAt: 'asc' },
    take: limit,
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });
}
