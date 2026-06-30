import { prisma } from '../config/database.js';

export async function getDashboardStats() {
  const [totalUsers, totalGroups, totalMaterials, totalQuestions] = await Promise.all([
    prisma.user.count(),
    prisma.studyGroup.count(),
    prisma.studyMaterial.count(),
    prisma.forumQuestion.count(),
  ]);

  // Aggregate materials by day for the last 7 days (mocked as simple grouping by createdAt)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const materialsByDayRaw = await prisma.studyMaterial.findMany({
    where: { createdAt: { gte: last7Days } },
    select: { createdAt: true },
  });

  const materialsByDay = materialsByDayRaw.reduce((acc: any, mat) => {
    const date = mat.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(materialsByDay)
    .sort()
    .map(date => ({
      date,
      count: materialsByDay[date],
    }));

  return {
    overview: {
      totalUsers,
      totalGroups,
      totalMaterials,
      totalQuestions,
    },
    chartData,
  };
}
