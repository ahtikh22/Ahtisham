import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, StoreSettings } from '../types/index';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: {
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  totalItemCount: number;
  settings: StoreSettings | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ahti_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);

  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Fetch store settings for shipping threshold
  useEffect(() => {
    api.public
      .getSettings()
      .then((res) => setSettings(res.settings))
      .catch((err) => console.error('Failed to fetch public settings:', err));
  }, []);

  // Save to local storage on cart change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    if (isAuthenticated) {
      api.cart
        .sync(items.map((it) => ({ productId: it.productId, quantity: it.quantity })))
        .catch(() => {});
    }
  }, [items, isAuthenticated]);

  // If user signs in, load server cart if local is empty or merge
  useEffect(() => {
    if (isAuthenticated) {
      api.cart
        .get()
        .then((res) => {
          if (res.items && res.items.length > 0 && items.length === 0) {
            setItems(res.items);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const addToCart = (product: Product, quantity = 1): { success: boolean; message: string } => {
    if (product.stock <= 0) {
      return { success: false, message: `"${product.name}" is currently out of stock.` };
    }

    let resultMessage = '';
    let success = true;

    setItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stock) {
          resultMessage = `Cannot add more. Maximum available stock is ${product.stock}.`;
          success = false;
          return prev;
        }
        resultMessage = `Updated ${product.name} quantity to ${nextQty}.`;
        return prev.map((it) =>
          it.productId === product.id ? { ...it, quantity: nextQty } : it
        );
      } else {
        if (quantity > product.stock) {
          resultMessage = `Cannot add ${quantity} units. Only ${product.stock} in stock.`;
          success = false;
          return prev;
        }
        resultMessage = `Added ${product.name} to cart.`;
        return [...prev, { productId: product.id, product, quantity }];
      }
    });

    return { success, message: resultMessage || `Added to cart.` };
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((it) => {
        if (it.productId === productId) {
          const validQty = Math.min(quantity, it.product.stock);
          return { ...it, quantity: validQty };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Calculations
  const subtotal = items.reduce((sum, it) => {
    const price = it.product.discountPrice || it.product.price;
    return sum + price * it.quantity;
  }, 0);

  const standardFee = settings?.standardShippingFee ?? 250;
  const freeThreshold = settings?.freeShippingThreshold ?? 5000;
  const shippingFee = subtotal === 0 ? 0 : subtotal >= freeThreshold ? 0 : standardFee;

  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalItemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.public.verifyCoupon(code, subtotal);
      setAppliedCoupon(res.coupon);
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Invalid coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        shippingFee,
        discountAmount,
        total,
        totalItemCount,
        settings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
