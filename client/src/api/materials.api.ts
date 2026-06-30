import apiClient from './client';
import type { ApiResponse, PaginatedResponse, StudyMaterial, GlobalSearchResponse } from '../types';

export const materialsApi = {
  upload: async (formData: FormData) => {
    const res = await apiClient.post<ApiResponse<StudyMaterial>>('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  getAll: async (params?: { search?: string; page?: number; limit?: number; group_id?: string }) => {
    const res = await apiClient.get<PaginatedResponse<StudyMaterial>>('/materials', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<StudyMaterial>>(`/materials/${id}`);
    return res.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/materials/${id}`);
  },

  searchAll: async (query: string, page?: number, limit?: number) => {
    const res = await apiClient.get<GlobalSearchResponse>('/materials/search', {
      params: { q: query, page, limit },
    });
    return res.data.data;
  },
};
