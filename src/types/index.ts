export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  role: UserRole;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number; // in PKR
  discountPrice?: number; // in PKR
  categoryId: string;
  categoryName?: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isDemo?: boolean;
  featured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  specifications?: Record<string, string>;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'JazzCash'
  | 'Easypaisa'
  | 'Bank Transfer';

export type PaymentStatus =
  | 'Unpaid'
  | 'Verification Pending'
  | 'Verified'
  | 'Rejected';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  price: number; // price at time of purchase in PKR
  quantity: number;
  subtotal: number;
}

export interface PaymentDetails {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  proofNote?: string;
  proofImageUrl?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    country: string;
    city: string;
    addressLine: string;
    orderNotes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  status: OrderStatus;
  payment: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 for 10% or 500 for PKR 500
  minOrderAmount: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  storeAddress: string;
  currency: string;
  standardShippingFee: number;
  freeShippingThreshold: number;
  jazzcashNumber: string;
  jazzcashTitle: string;
  jazzcashInstructions: string;
  easypaisaNumber: string;
  easypaisaTitle: string;
  easypaisaInstructions: string;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankIban: string;
  bankBranch: string;
  bankInstructions: string;
}
