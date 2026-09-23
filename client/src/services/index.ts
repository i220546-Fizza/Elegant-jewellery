import api from '../lib/api';
import type {
  Address,
  CartLineRef,
  CartQuote,
  Category,
  Coupon,
  CustomerRow,
  DashboardStats,
  InventorySummary,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Review,
  User,
} from '../types';

/* ---------- auth ---------- */
export const authApi = {
  me: async () => (await api.get<{ user: User | null }>('/auth/me')).data.user,
  login: async (email: string, password: string) => (await api.post<{ user: User }>('/auth/login', { email, password })).data.user,
  register: async (payload: { name: string; email: string; password: string; newsletter?: boolean }) =>
    (await api.post<{ user: User }>('/auth/register', payload)).data.user,
  logout: async () => {
    await api.post('/auth/logout');
  },
  forgot: async (email: string) => (await api.post<{ message: string; devResetToken?: string }>('/auth/forgot-password', { email })).data,
  reset: async (token: string, password: string) => (await api.put<{ user: User }>(`/auth/reset-password/${token}`, { password })).data.user,
};

/* ---------- catalogue ---------- */
export interface ProductQuery {
  search?: string;
  category?: string;
  gender?: string;
  family?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  page?: number;
  limit?: number;
  all?: boolean;
  stock?: string;
  ids?: string;
}

export interface ProductPage {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

export const productApi = {
  list: async (query: ProductQuery = {}) => (await api.get<ProductPage>('/products', { params: query })).data,
  meta: async () => (await api.get<{ families: string[]; priceRange: { min: number; max: number } }>('/products/meta')).data,
  get: async (idOrSlug: string) => (await api.get<{ product: Product }>(`/products/${idOrSlug}`)).data.product,
  related: async (id: string) => (await api.get<{ products: Product[] }>(`/products/${id}/related`)).data.products,
  reviews: async (id: string, page = 1) =>
    (
      await api.get<{ reviews: Review[]; total: number; page: number; pages: number; distribution: Record<number, number> }>(`/products/${id}/reviews`, {
        params: { page },
      })
    ).data,
  addReview: async (id: string, payload: { rating: number; title?: string; comment: string }) =>
    (await api.post<{ review: Review }>(`/products/${id}/reviews`, payload)).data.review,
  deleteReview: async (id: string, reviewId: string) => {
    await api.delete(`/products/${id}/reviews/${reviewId}`);
  },
  create: async (payload: Record<string, unknown>) => (await api.post<{ product: Product }>('/products', payload)).data.product,
  update: async (id: string, payload: Record<string, unknown>) => (await api.put<{ product: Product }>(`/products/${id}`, payload)).data.product,
  updateStock: async (id: string, variants: { _id: string; stock: number }[]) =>
    (await api.patch<{ product: Product }>(`/products/${id}/stock`, { variants })).data.product,
  remove: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
};

export const categoryApi = {
  list: async (all = false) => (await api.get<{ categories: Category[] }>('/categories', { params: all ? { all: true } : {} })).data.categories,
  create: async (payload: Partial<Category>) => (await api.post<{ category: Category }>('/categories', payload)).data.category,
  update: async (id: string, payload: Partial<Category>) => (await api.put<{ category: Category }>(`/categories/${id}`, payload)).data.category,
  remove: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },
};

/* ---------- cart & wishlist ---------- */
export const cartApi = {
  quote: async (items: CartLineRef[], couponCode?: string) => (await api.post<CartQuote>('/cart/quote', { items, couponCode })).data,
  get: async () => (await api.get<CartQuote>('/cart')).data,
  save: async (items: CartLineRef[], couponCode?: string) => (await api.put<CartQuote>('/cart', { items, couponCode })).data,
  merge: async (items: CartLineRef[], couponCode?: string) => (await api.post<CartQuote>('/cart/merge', { items, couponCode })).data,
};

export const wishlistApi = {
  get: async () => (await api.get<{ products: Product[] }>('/wishlist')).data.products,
  toggle: async (productId: string) => (await api.post<{ added: boolean; ids: string[] }>(`/wishlist/${productId}`)).data,
  merge: async (ids: string[]) => (await api.post<{ products: Product[] }>('/wishlist/merge', { ids })).data.products,
};

/* ---------- account ---------- */
export const accountApi = {
  updateProfile: async (payload: { name?: string; phone?: string; newsletter?: boolean }) =>
    (await api.put<{ user: User }>('/users/profile', payload)).data.user,
  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.put('/users/password', { currentPassword, newPassword });
  },
  addresses: async () => (await api.get<{ addresses: Address[] }>('/users/addresses')).data.addresses,
  addAddress: async (a: Address) => (await api.post<{ addresses: Address[] }>('/users/addresses', a)).data.addresses,
  updateAddress: async (id: string, a: Partial<Address>) => (await api.put<{ addresses: Address[] }>(`/users/addresses/${id}`, a)).data.addresses,
  deleteAddress: async (id: string) => (await api.delete<{ addresses: Address[] }>(`/users/addresses/${id}`)).data.addresses,
  subscribe: async (email: string) => (await api.post<{ message: string }>('/newsletter', { email })).data.message,
};

/* ---------- orders ---------- */
export interface PlaceOrderPayload {
  items: CartLineRef[];
  customerInfo: { name: string; email: string; phone: string };
  shippingAddress: { address: string; city: string; postalCode: string; country: string };
  orderNotes?: string;
  paymentMethod: string;
  onlineProvider?: string;
  card?: { number: string; expiry: string; cvc: string; name: string };
  couponCode?: string;
  saveAddress?: boolean;
}

export const orderApi = {
  place: async (payload: PlaceOrderPayload) => (await api.post<{ order: Order }>('/orders', payload)).data.order,
  get: async (id: string, email?: string) => (await api.get<{ order: Order }>(`/orders/${id}`, { params: email ? { email } : {} })).data.order,
  lookup: async (orderNumber: string, email: string) => (await api.get<{ order: Order }>('/orders/lookup', { params: { orderNumber, email } })).data.order,
  mine: async () => (await api.get<{ orders: Order[] }>('/orders/my-orders')).data.orders,
  cancel: async (id: string) => (await api.put<{ order: Order }>(`/orders/${id}/cancel`)).data.order,
  all: async (params: { status?: string; payment?: string; search?: string; page?: number; limit?: number }) =>
    (await api.get<{ orders: Order[]; page: number; pages: number; total: number }>('/orders', { params })).data,
  updateStatus: async (id: string, payload: { status?: OrderStatus; note?: string; trackingNumber?: string; paymentStatus?: PaymentStatus }) =>
    (await api.put<{ order: Order }>(`/orders/${id}/status`, payload)).data.order,
};

/* ---------- admin ---------- */
export const adminApi = {
  stats: async (days = 30) => (await api.get<{ stats: DashboardStats }>('/admin/stats', { params: { days } })).data.stats,
  inventory: async (status = 'all') =>
    (await api.get<{ products: (Product & { totalStock: number; isLow: boolean; isOut: boolean })[]; summary: InventorySummary }>('/admin/inventory', { params: { status } }))
      .data,
  customers: async (params: { search?: string; page?: number; role?: string }) =>
    (await api.get<{ customers: CustomerRow[]; total: number; page: number; pages: number }>('/admin/customers', { params })).data,
  customer: async (id: string) =>
    (await api.get<{ customer: User & { isActive: boolean; lastLoginAt?: string }; orders: Order[]; reviews: (Review & { product: { name: string; slug: string } })[] }>(`/admin/customers/${id}`))
      .data,
  updateCustomer: async (id: string, payload: { isActive?: boolean; role?: string }) => (await api.put(`/admin/customers/${id}`, payload)).data,
  deleteCustomer: async (id: string) => {
    await api.delete(`/admin/customers/${id}`);
  },
  coupons: async () => (await api.get<{ coupons: Coupon[] }>('/coupons')).data.coupons,
  createCoupon: async (c: Partial<Coupon>) => (await api.post<{ coupon: Coupon }>('/coupons', c)).data.coupon,
  updateCoupon: async (id: string, c: Partial<Coupon>) => (await api.put<{ coupon: Coupon }>(`/coupons/${id}`, c)).data.coupon,
  deleteCoupon: async (id: string) => {
    await api.delete(`/coupons/${id}`);
  },
  uploadImages: async (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    return (await api.post<{ images: string[] }>('/uploads/images', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 })).data.images;
  },
  uploadModel: async (file: File) => {
    const form = new FormData();
    form.append('model', file);
    return (await api.post<{ url: string }>('/uploads/model', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 300000 })).data.url;
  },
};

/* ---------- contact ---------- */
export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const contactApi = {
  send: async (payload: { name: string; email: string; subject?: string; message: string }) => (await api.post<{ message: string }>('/contact', payload)).data.message,
  list: async () => (await api.get<{ messages: ContactMessage[] }>('/contact')).data.messages,
  markRead: async (id: string, isRead: boolean) => {
    await api.put(`/contact/${id}`, { isRead });
  },
  remove: async (id: string) => {
    await api.delete(`/contact/${id}`);
  },
};
