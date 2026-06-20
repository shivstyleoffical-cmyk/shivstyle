import api from '../config/api';

export interface Location {
  id: string;
  city_name: string;
  state: string;
  pincode: string;
  is_active: boolean;
  delivery_charge: number;
  min_order_amount: number;
}

export const locationService = {
  getAll: async (params?: any): Promise<{ locations: Location[]; total: number }> => {
    const response = await api.get('/locations/admin/all', { params });
    // Support both old (array) and new (object with locations) response shapes
    if (Array.isArray(response.data.locations)) {
      return { locations: response.data.locations, total: response.data.total ?? response.data.locations.length };
    }
    return response.data;
  },

  create: async (data: Partial<Location>): Promise<Location> => {
    const response = await api.post('/locations/admin/create', data);
    return response.data.location;
  },

  update: async (id: string, data: Partial<Location>): Promise<Location> => {
    const response = await api.put(`/locations/admin/${id}`, data);
    return response.data.location;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/locations/admin/${id}`);
  },
};
