import api from './api';
import type { Order, OrderStatus, CartItem } from '../types';

export interface CreateOrderPayload {
  items: CartItem[];
  shippingInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    notes?: string;
  };
  paymentMethod: 'Cash on Delivery' | 'Online Payment';
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post<Order>('/orders', payload);
  return data;
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/orders/mine');
  return data;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/orders');
  return data;
}

export async function getOrderById(id: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data } = await api.put<Order>(`/orders/${id}/status`, { status });
  return data;
}
