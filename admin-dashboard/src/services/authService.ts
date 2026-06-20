import api from '../config/api';
import type { User } from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  getUserProfile: async (): Promise<User> => {
    const response = await api.get('/users/user-profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  },
};
