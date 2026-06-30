import apiClient from './client';
import type { ApiResponse, AuthResponse } from '../types';

export const authApi = {
  register: async (data: { username: string; email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  getMe: async () => {
    const res = await apiClient.get<ApiResponse<{ user: AuthResponse['user'] }>>('/auth/me');
    return res.data.data;
  },
};
