export type Category = 'earrings' | 'rings' | 'necklaces' | 'bracelets';

export interface Review {
  _id?: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  category: Category;
  material: string;
  images: string[];
  sizes: string[];
  stock: number;
  featured: boolean;
  bestseller: boolean;
  isNewArrival: boolean;
  rating: number;
  numReviews: number;
  reviews: Review[];
  inStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: Address;
}

export interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
  stock: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  size?: string;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  _id: string;
  user?: string | null;
  orderItems: OrderItem[];
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  orderNotes?: string;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: OrderStatus;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  statusCounts: Record<OrderStatus, number>;
  salesTrend: { date: string; total: number }[];
}
