import {
  User,
  Product,
  Category,
  Order,
  ProductReview,
  Address,
  Coupon,
  StoreSettings,
  CartItem,
  OrderStatus,
  PaymentStatus,
} from '../types/index';

const BASE_URL = '/api';

function getHeaders(customHeaders?: HeadersInit): HeadersInit {
  const token = localStorage.getItem('ahti_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return { ...headers, ...(customHeaders as any) };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(options.headers),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ user: User; token: string; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (details: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
      country: string;
    }) =>
      request<{ user: User; token: string; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(details),
      }),
    getMe: () => request<{ user: User }>('/auth/me'),
    updateProfile: (updates: { fullName?: string; phone?: string; country?: string }) =>
      request<{ user: User; message: string }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    changePassword: (passwords: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) =>
      request<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwords),
      }),
    requestReset: (email: string) =>
      request<{ message: string }>('/auth/reset-password-request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    getAddresses: () => request<{ addresses: Address[] }>('/auth/addresses'),
    addAddress: (addr: Omit<Address, 'id' | 'userId'>) =>
      request<{ address: Address; message: string }>('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify(addr),
      }),
    deleteAddress: (id: string) =>
      request<{ message: string }>(`/auth/addresses/${id}`, {
        method: 'DELETE',
      }),
  },

  products: {
    getAll: (params: Record<string, string | number | boolean | undefined> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') query.append(key, String(val));
      });
      const qStr = query.toString() ? `?${query.toString()}` : '';
      return request<{
        products: Product[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>(`/products${qStr}`);
    },
    getById: (idOrSlug: string) =>
      request<{ product: Product; relatedProducts: Product[]; reviews: ProductReview[] }>(
        `/products/${idOrSlug}`
      ),
    getCategories: () => request<{ categories: Category[] }>('/products/categories'),
    addReview: (productId: string, data: { rating: number; comment: string }) =>
      request<{ review: ProductReview; message: string }>(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  cart: {
    get: () => request<{ items: CartItem[] }>('/cart'),
    sync: (items: { productId: string; quantity: number }[]) =>
      request<{ message: string }>('/cart/sync', {
        method: 'POST',
        body: JSON.stringify({ items }),
      }),
  },

  wishlist: {
    get: () => request<{ wishlist: Product[]; ids: string[] }>('/wishlist'),
    toggle: (productId: string) =>
      request<{ ids: string[]; message: string }>('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }),
  },

  orders: {
    create: (data: {
      shippingAddress: {
        fullName: string;
        phone: string;
        email: string;
        country: string;
        city: string;
        addressLine: string;
        orderNotes?: string;
      };
      items: { productId: string; quantity: number }[];
      couponCode?: string;
      paymentMethod: string;
      transactionId?: string;
      proofNote?: string;
    }) =>
      request<{ order: Order; message: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyOrders: () => request<{ orders: Order[] }>('/orders'),
    getById: (id: string) => request<{ order: Order }>(`/orders/${id}`),
    cancel: (id: string) =>
      request<{ order: Order; message: string }>(`/orders/${id}/cancel`, {
        method: 'POST',
      }),
    submitPaymentProof: (id: string, data: { transactionId: string; proofNote?: string }) =>
      request<{ order: Order; message: string }>(`/orders/${id}/payment-proof`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  public: {
    getSettings: () => request<{ settings: StoreSettings }>('/public/settings'),
    verifyCoupon: (code: string, subtotal: number) =>
      request<{
        coupon: { code: string; discountType: string; discountValue: number; discountAmount: number };
        message: string;
      }>('/public/coupons/verify', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      }),
    subscribeNewsletter: (email: string) =>
      request<{ message: string }>('/public/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    contact: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
      request<{ message: string }>('/public/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  admin: {
    getMetrics: () =>
      request<{
        metrics: {
          totalOrders: number;
          totalSalesVerified: number;
          pendingOrders: number;
          pendingPaymentVerifications: number;
          totalCustomers: number;
          lowStockCount: number;
        };
        lowStockProducts: Product[];
      }>('/admin/metrics'),
    createProduct: (data: Partial<Product>) =>
      request<{ product: Product; message: string }>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateProduct: (id: string, updates: Partial<Product>) =>
      request<{ product: Product; message: string }>(`/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    deleteProduct: (id: string) =>
      request<{ message: string }>(`/admin/products/${id}`, {
        method: 'DELETE',
      }),
    createCategory: (data: Partial<Category>) =>
      request<{ category: Category; message: string }>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateCategory: (id: string, updates: Partial<Category>) =>
      request<{ category: Category; message: string }>(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    deleteCategory: (id: string) =>
      request<{ message: string }>(`/admin/categories/${id}`, {
        method: 'DELETE',
      }),
    getOrders: () => request<{ orders: Order[] }>('/admin/orders'),
    updateOrderStatus: (id: string, status: OrderStatus) =>
      request<{ order: Order; message: string }>(`/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    verifyPayment: (id: string, status: PaymentStatus, rejectionReason?: string) =>
      request<{ order: Order; message: string }>(`/admin/orders/${id}/verify-payment`, {
        method: 'PUT',
        body: JSON.stringify({ status, rejectionReason }),
      }),
    getCustomers: () =>
      request<{
        customers: (User & { ordersCount: number; totalSpent: number })[];
      }>('/admin/customers'),
    getCoupons: () => request<{ coupons: Coupon[] }>('/admin/coupons'),
    createCoupon: (coupon: Partial<Coupon>) =>
      request<{ coupon: Coupon; message: string }>('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(coupon),
      }),
    deleteCoupon: (id: string) =>
      request<{ message: string }>(`/admin/coupons/${id}`, {
        method: 'DELETE',
      }),
    getSettings: () => request<{ settings: StoreSettings }>('/admin/settings'),
    updateSettings: (settings: Partial<StoreSettings>) =>
      request<{ settings: StoreSettings; message: string }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),
  },
};
