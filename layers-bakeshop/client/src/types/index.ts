export type ProductCategory =
  | 'Cakes'
  | 'Cupcakes'
  | 'Brownies'
  | 'Cookies'
  | 'Donuts'
  | 'Desserts'
  | 'Sundaes'
  | 'Beverages';

export interface ProductReview {
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
  ingredients?: string[];
  category: ProductCategory;
  price: number;
  sizes?: { label: string; price: number }[];
  images: string[];
  rating: number;
  numReviews: number;
  reviews?: ProductReview[];
  stock: number;
  isAvailable: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isLimitedEdition?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  size?: string;
  quantity: number;
  stock: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  size?: string;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: string;
  items: OrderItem[];
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
  status: OrderStatus;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

export interface AuthResponse extends User {
  token: string;
}
