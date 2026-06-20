import api from '../config/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'all' | 'specific';
  user_id?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  getAll: async (params?: any): Promise<{ notifications: Notification[]; total: number }> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  create: async (data: any): Promise<Notification> => {
    const response = await api.post('/notifications', data);
    return response.data.notification;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};
