export type Gender = 'women' | 'men' | 'unisex';
export type BottleShape = 'classic' | 'tall' | 'round' | 'facet' | 'flacon';
export type CapStyle = 'gold' | 'black' | 'ivory';
export type GlassStyle = 'clear' | 'smoke' | 'black';

export interface BottleSpec {
  shape: BottleShape;
  liquid: string;
  cap: CapStyle;
  glass: GlassStyle;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  kind: 'audience' | 'collection';
  order: number;
  isActive: boolean;
  productCount?: number;
}

export interface Variant {
  _id: string;
  size: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface Notes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  story?: string;
  gender: Gender;
  categories: Category[];
  fragranceFamily: string;
  concentration: string;
  notes: Notes;
  ingredients: string;
  longevity: string;
  sillage: string;
  variants: Variant[];
  discountPercent: number;
  images: string[];
  model3d?: string;
  bottle: BottleSpec;
  featured: boolean;
  signatureOrder: number;
  bestseller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  lowStockThreshold: number;
  rating: number;
  numReviews: number;
  soldCount: number;
  price: number;
  stock: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: string;
  user: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Address {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: Address[];
  newsletter?: boolean;
  createdAt?: string;
}

/** A line the client stores (guest cart / sync payload). */
export interface CartLineRef {
  product: string;
  variantId: string;
  quantity: number;
}

/** A priced line returned by the server. */
export interface CartLine extends CartLineRef {
  slug: string;
  name: string;
  image: string;
  bottle: BottleSpec;
  fragranceFamily: string;
  size: string;
  price: number;
  originalPrice: number;
  stock: number;
  requestedQuantity: number;
}

export interface CartQuote {
  items: CartLine[];
  couponCode: string;
  couponError: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'Cash on Delivery' | 'Card Payment' | 'Online Payment';
export type PaymentStatus = 'Pending' | 'Paid' | 'Awaiting Transfer' | 'Refunded' | 'Failed';

export interface OrderItem {
  product: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: string | null;
  orderItems: OrderItem[];
  customerInfo: { name: string; email: string; phone: string };
  shippingAddress: { address: string; city: string; postalCode: string; country: string };
  orderNotes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: { brand?: string; last4?: string; provider?: string; reference?: string };
  couponCode?: string;
  itemsPrice: number;
  discountPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; note: string; at: string }[];
  trackingNumber?: string;
  deliveredAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  page: number;
  pages: number;
  total: number;
  items: T[];
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export interface LowStockRow {
  productId: string;
  name: string;
  slug: string;
  image: string;
  bottle?: BottleSpec;
  variantId: string;
  size: string;
  stock: number;
}

export interface InventorySummary {
  totalUnits: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStock: LowStockRow[];
  productCount: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  newCustomers: number;
  averageOrderValue: number;
  periodRevenue: number;
  periodDays: number;
  statusCounts: Record<OrderStatus, number>;
  salesTrend: { date: string; total: number; orders: number }[];
  paymentBreakdown: { method: PaymentMethod; total: number; count: number }[];
  bestsellers: { productId: string; name: string; image: string; units: number; revenue: number; slug: string; bottle?: BottleSpec }[];
  inventory: InventorySummary;
  recentOrders: Order[];
}

export interface CustomerRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: string;
}
