import api from './api';
import type { Product, ProductCategory } from '../types';

export interface ProductQuery {
  category?: ProductCategory | 'All';
  search?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  limitedEdition?: boolean;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const params: Record<string, string> = {};
  if (query.category && query.category !== 'All') params.category = query.category;
  if (query.search) params.search = query.search;
  if (query.featured) params.featured = 'true';
  if (query.bestseller) params.bestseller = 'true';
  if (query.newArrival) params.newArrival = 'true';
  if (query.limitedEdition) params.limitedEdition = 'true';

  const { data } = await api.get<Product[]>('/products', { params });
  return data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${slug}`);
  return data;
}

export async function createProduct(payload: FormData): Promise<Product> {
  const { data } = await api.post<Product>('/products', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateProduct(id: string, payload: FormData): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
