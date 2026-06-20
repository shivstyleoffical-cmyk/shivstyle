import api from '../config/api';
import type { Category } from '../types';

export interface CategoryListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export const categoryService = {
  getAll: async (params?: CategoryListParams): Promise<CategoryListResponse> => {
    const response = await api.get('/categories', { params: { status: 'all', ...params } });
    return {
      categories: response.data.categories || [],
      pagination: response.data.pagination || {
        total: response.data.categories?.length || 0,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: params?.limit || 20,
      },
    };
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.category;
  },

  create: async (data: FormData): Promise<Category> => {
    const response = await api.post('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.category;
  },

  update: async (id: string, data: FormData): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.category;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  getCategoryTree: async (): Promise<Category[]> => {
    const response = await api.get('/categories/tree');
    return response.data.categories || [];
  },
};
