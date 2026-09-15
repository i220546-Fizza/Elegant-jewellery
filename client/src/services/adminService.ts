import api from './api';
import type { DashboardStats } from '../types';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get('/admin/stats');
  return data.stats;
};
