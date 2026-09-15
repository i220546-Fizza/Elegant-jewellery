import api from './api';
import type { PaginatedProducts, Product } from '../types';

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
  bestseller?: boolean;
  page?: number;
  limit?: number;
}

export const fetchProducts = async (query: ProductQuery = {}): Promise<PaginatedProducts> => {
  const { data } = await api.get('/products', { params: query });
  return data;
};

export const fetchProductByIdOrSlug = async (idOrSlug: string): Promise<Product> => {
  const { data } = await api.get(`/products/${idOrSlug}`);
  return data.product;
};

export const fetchRelatedProducts = async (id: string): Promise<Product[]> => {
  const { data } = await api.get(`/products/${id}/related`);
  return data.products;
};

export const createProduct = async (payload: Partial<Product>): Promise<Product> => {
  const { data } = await api.post('/products', payload);
  return data.product;
};

export const updateProduct = async (id: string, payload: Partial<Product>): Promise<Product> => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data.product;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const submitProductReview = async (
  id: string,
  payload: { rating: number; comment: string }
): Promise<void> => {
  await api.post(`/products/${id}/reviews`, payload);
};

export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const { data } = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.images;
};
