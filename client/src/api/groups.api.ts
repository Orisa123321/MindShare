import apiClient from './client';
import type { ApiResponse, PaginatedResponse, StudyGroup, GroupMember, StudyMaterial } from '../types';

export const groupsApi = {
  create: async (data: { title: string; description?: string }) => {
    const res = await apiClient.post<ApiResponse<StudyGroup>>('/groups', data);
    return res.data.data;
  },

  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<PaginatedResponse<StudyGroup>>('/groups', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<StudyGroup>>(`/groups/${id}`);
    return res.data.data;
  },

  update: async (id: string, data: { title?: string; description?: string }) => {
    const res = await apiClient.put<ApiResponse<StudyGroup>>(`/groups/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/groups/${id}`);
  },

  join: async (id: string) => {
    const res = await apiClient.post<ApiResponse<GroupMember>>(`/groups/${id}/join`);
    return res.data.data;
  },

  leave: async (id: string) => {
    await apiClient.delete(`/groups/${id}/leave`);
  },

  getMembers: async (id: string) => {
    const res = await apiClient.get<ApiResponse<GroupMember[]>>(`/groups/${id}/members`);
    return res.data.data;
  },

  getMaterials: async (id: string, params?: { search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<PaginatedResponse<StudyMaterial>>(`/groups/${id}/materials`, { params });
    return res.data;
  },
};
