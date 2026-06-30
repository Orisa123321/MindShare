import apiClient from './client';

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  groupId: string;
  userId: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

export const chatApi = {
  getGroupMessages: async (groupId: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get(`/chat/groups/${groupId}/messages`);
    return res.data.data;
  },
};
