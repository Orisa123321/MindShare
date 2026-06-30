import apiClient from './client';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalGroups: number;
    totalMaterials: number;
    totalQuestions: number;
  };
  chartData: Array<{
    date: string;
    count: number;
  }>;
}

export const analyticsApi = {
  getDashboardStats: async (): Promise<AnalyticsData> => {
    const res = await apiClient.get('/analytics/dashboard');
    return res.data.data;
  },
};
