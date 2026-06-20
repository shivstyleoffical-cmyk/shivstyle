import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:6006/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const fetchProductBySlug = async (slug: string) => {
  const response = await api.get(`/products/slug/${slug}`);
  return response.data;
};

export const fetchRecommendedProducts = async (params = {}) => {
  const response = await api.get('/products/recommended', { params });
  return response.data;
};

export default api;
