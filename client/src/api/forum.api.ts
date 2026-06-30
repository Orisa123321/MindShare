import apiClient from './client';
import type { ApiResponse, PaginatedResponse, ForumQuestion, ForumAnswer } from '../types';

export const forumApi = {
  // Questions
  createQuestion: async (data: { title: string; content: string }) => {
    const res = await apiClient.post<ApiResponse<ForumQuestion>>('/forum/questions', data);
    return res.data.data;
  },

  getQuestions: async (params?: { search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<PaginatedResponse<ForumQuestion>>('/forum/questions', { params });
    return res.data;
  },

  getQuestionById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<ForumQuestion>>(`/forum/questions/${id}`);
    return res.data.data;
  },

  deleteQuestion: async (id: string) => {
    await apiClient.delete(`/forum/questions/${id}`);
  },

  // Answers
  createAnswer: async (questionId: string, data: { content: string }) => {
    const res = await apiClient.post<ApiResponse<ForumAnswer>>(`/forum/questions/${questionId}/answers`, data);
    return res.data.data;
  },

  generateAIAnswer: async (questionId: string) => {
    const res = await apiClient.post<ApiResponse<ForumAnswer>>(`/forum/questions/${questionId}/ai-answer`);
    return res.data.data;
  },

  deleteAnswer: async (id: string) => {
    await apiClient.delete(`/forum/answers/${id}`);
  },

  // Voting
  vote: async (answerId: string, value: 1 | -1) => {
    const res = await apiClient.post<ApiResponse<{ voteScore: number }>>(`/forum/answers/${answerId}/vote`, { value });
    return res.data.data;
  },
};
