import apiClient from './client';
import type { ApiResponse, PaginatedResponse, User, StudyGroup, StudyMaterial } from '../types';

export const usersApi = {
  getProfile: async (id: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  updateProfile: async (id: string, data: { username?: string; bio?: string }) => {
    const res = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
  },

  getUserGroups: async (id: string, params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get<PaginatedResponse<StudyGroup>>(`/users/${id}/groups`, { params });
    return res.data;
  },

  getUserMaterials: async (id: string, params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get<PaginatedResponse<StudyMaterial>>(`/users/${id}/materials`, { params });
    return res.data;
  },
};
