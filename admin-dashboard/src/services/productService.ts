import api from '../config/api';
import type { Product } from '../types';

export interface ProductListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  category_id?: string;
  brand?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export const productService = {
  getAll: async (params?: ProductListParams): Promise<ProductListResponse> => {
    const response = await api.get('/products', { params });
    return {
      products: response.data.products || [],
      pagination: response.data.pagination || {
        total: response.data.total || 0,
        currentPage: params?.page || 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: params?.limit || 10,
      },
    };
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.product;
  },

  create: async (data: FormData): Promise<Product> => {
    const response = await api.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.product;
  },

  update: async (id: string, data: FormData): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.product;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getFeatured: async (): Promise<Product[]> => {
    const response = await api.get('/products/featured');
    return response.data.products || [];
  },

  getTrending: async (): Promise<Product[]> => {
    const response = await api.get('/products/trending');
    return response.data.products || [];
  },
};
