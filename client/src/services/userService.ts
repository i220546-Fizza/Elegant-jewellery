import api from './api';
import type { Product } from '../types';

export const fetchWishlist = async (): Promise<Product[]> => {
  const { data } = await api.get('/users/wishlist');
  return data.wishlist;
};

export const toggleWishlistItem = async (productId: string): Promise<{ added: boolean }> => {
  const { data } = await api.post(`/users/wishlist/${productId}`);
  return { added: data.added };
};
