import api from '../config/api';
import type { Coupon } from '../types';

export const offerService = {
  getAll: async (params?: any): Promise<{ offers: Coupon[]; total: number }> => {
    const response = await api.get('/offers', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Coupon> => {
    const response = await api.get(`/offers/${id}`);
    return response.data.offer;
  },

  create: async (data: any): Promise<Coupon> => {
    const response = await api.post('/offers', data);
    return response.data.offer;
  },

  update: async (id: string, data: any): Promise<Coupon> => {
    const response = await api.put(`/offers/${id}`, data);
    return response.data.offer;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/offers/${id}`);
  },
};
