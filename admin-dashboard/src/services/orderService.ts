import api from '../config/api';
import type { Order } from '../types';

export const orderService = {
  getAll: async (params?: any): Promise<{ orders: Order[]; total: number }> => {
    const response = await api.get('/orders/admin/all', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.order;
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.put(`/orders/admin/${id}/status`, { status });
    return response.data.order;
  },

  getStatistics: async (): Promise<any> => {
    const response = await api.get('/orders/admin/statistics');
    return response.data;
  },
};
