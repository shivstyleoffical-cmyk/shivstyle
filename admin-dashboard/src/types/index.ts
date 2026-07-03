export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  is_verified: boolean;
  created_at?: string;
  createdAt?: string;
  roles?: Role[];
  addresses?: UserAddress[];
}

export interface UserAddress {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  is_default: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  category_name: string;
  url_slug: string;
  description?: string;
  image_url?: string;
  parent_cat_id?: string;
  status: 'active' | 'inactive';
  is_active?: boolean; // Keep for compatibility if needed
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  parent?: {
    id: string;
    category_name: string;
    url_slug: string;
  };
}

export interface Product {
  id: string;
  product_name: string;
  url_slug: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  brand?: string;
  tags?: string;
  image_url?: string;
  is_featured: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  is_best_seller?: boolean;
  discount_percentage?: number;
  original_price?: number;
  status: 'active' | 'inactive';
  is_active?: boolean; // For compatibility
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  material?: string;
  care_instructions?: string;
  fit?: string;
  country_of_origin?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  discount_amount: number;
  gross_amount: number;
  shipping_amount: number;
  net_amount: number;
  final_amount: number; // For compatibility
  payment_method?: string; // For compatibility
  payment_type: 'netbanking' | 'upi' | 'cod';
  payment_status: 'paid' | 'not_paid' | 'pending' | 'completed' | 'failed' | 'refunded';
  status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  order_status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'pending'; // For compatibility
  shipping_address?: string; // For compatibility
  billing_address?: string; // For compatibility
  tracking_number?: string;
  delivery_partner?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  delivery_notes?: string;
  coupon_code?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
  orderItems?: OrderItem[];
  shippingAddress?: OrderShippingAddress;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_variant_id?: string;
  product_name: string;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
  total_amount: number;
  discount_amount?: number;
  product?: Product;
}

export interface OrderShippingAddress {
  id: string;
  order_id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  used_count: number;
  status: 'active' | 'inactive';
  created_at?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}
