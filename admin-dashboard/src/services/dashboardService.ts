import api from '../config/api';

export interface DashboardStats {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
  };
  growth: {
    revenue: number;
    orders: number;
    customers: number;
    products: number;
  };
  revenueData: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data.stats;
  },
};
