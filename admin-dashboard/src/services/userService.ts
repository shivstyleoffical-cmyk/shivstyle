import api from '../config/api';
import type { User } from '../types';

export const userService = {
  getAll: async (params?: any): Promise<{ users: User[]; total: number }> => {
    const response = await api.get('/users/admin/all-users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  },

  updateProfile: async (data: FormData): Promise<User> => {
    const response = await api.put('/users/user-profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.user;
  },
};
