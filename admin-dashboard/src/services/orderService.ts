import api from '../config/api';
import type { Order } from '../types';

export const orderService = {
  getAll: async (params?: any): Promise<{ orders: Order[]; total: number }> => {
    const response = await api.get('/orders/admin/all', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/admin/${id}`);
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

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/admin/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.delete('/orders/admin/orders/bulk', { data: { ids } });
  },

  bookShipment: async (id: string, packageDetails?: any): Promise<any> => {
    const response = await api.post(`/orders/admin/${id}/book-shipment`, packageDetails);
    return response.data;
  },

  getShippingRates: async (id: string, packageDetails: any): Promise<any> => {
    const response = await api.post(`/orders/admin/${id}/shipping-rates`, packageDetails);
    return response.data;
  },

  getPickupLocations: async (): Promise<any> => {
    const response = await api.get('/orders/admin/shiprocket/pickup-locations');
    return response.data;
  },

  updateShippingAddress: async (id: string, addressData: any): Promise<any> => {
    const response = await api.put(`/orders/admin/${id}/shipping-address`, addressData);
    return response.data;
  },
};
