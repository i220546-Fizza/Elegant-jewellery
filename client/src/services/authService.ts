import api from './api';
import type { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export const registerUser = async (payload: { name: string; email: string; password: string }): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const loginUser = async (payload: { email: string; password: string }): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const fetchCurrentUser = async (): Promise<User> => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

export const requestPasswordReset = async (email: string): Promise<{ resetToken?: string; message: string }> => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.put(`/auth/reset-password/${token}`, { password });
  return data;
};

export const updateProfile = async (payload: Partial<User> & { password?: string }): Promise<User> => {
  const { data } = await api.put('/users/profile', payload);
  return data.user;
};
