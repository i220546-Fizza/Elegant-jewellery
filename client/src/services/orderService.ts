import api from './api';
import type { CustomerInfo, Order, OrderItem, OrderStatus, ShippingAddress } from '../types';

export interface CreateOrderPayload {
  orderItems: OrderItem[];
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  orderNotes?: string;
  paymentMethod: string;
}

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const { data } = await api.post('/orders', payload);
  return data.order;
};

export const fetchOrderById = async (id: string, guestEmail?: string): Promise<Order> => {
  const { data } = await api.get(`/orders/${id}`, { params: guestEmail ? { email: guestEmail } : {} });
  return data.order;
};

export const fetchMyOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders/my-orders');
  return data.orders;
};

export const fetchAllOrders = async (params: { status?: string; page?: number } = {}) => {
  const { data } = await api.get('/orders', { params });
  return data as { orders: Order[]; page: number; pages: number; total: number };
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data.order;
};
