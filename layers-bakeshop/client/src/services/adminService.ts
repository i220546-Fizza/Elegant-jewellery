import api from './api';
import type { User } from '../types';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; sold: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/admin/stats');
  return data;
}

export async function getCustomers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return data;
}
