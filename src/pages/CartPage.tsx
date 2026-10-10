import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    discountAmount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    settings,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );
  const [couponLoading, setCouponLoading] = useState(false);

  const freeThreshold = settings?.freeShippingThreshold || 5000;
  const remainingForFreeShipping = Math.max(0, freeThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponMessage(null);

    const res = await applyCoupon(couponInput.trim());
    setCouponLoading(false);

    if (res.success) {
      setCouponMessage({ text: res.message, isError: false });
      setCouponInput('');
    } else {
      setCouponMessage({ text: res.message, isError: true });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Explore our wide selection of tech gadgets, accessories, and fashion essentials with fast delivery across Pakistan.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-full shadow-lg transition-transform hover:scale-105"
        >
          Start Shopping Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review selected items and proceed to secure checkout
          </p>
        </div>
        <button
          onClick={() => onNavigate('shop')}
          className="text-xs font-bold text-slate-700 hover:text-amber-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </button>
      </div>

      {/* Free Shipping Progress bar */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-600" />
            {remainingForFreeShipping === 0 ? (
              <span className="font-bold text-emerald-800">
                🎉 Congratulations! You have unlocked FREE Delivery across Pakistan!
              </span>
            ) : (
              <span>
                Add <strong>PKR {remainingForFreeShipping.toLocaleString()}</strong> more to qualify for FREE Delivery!
              </span>
            )}
          </div>
          <span>{freeShippingProgress}%</span>
        </div>
        <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500 rounded-full"
            style={{ width: `${freeShippingProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Cart Grid: Items Table + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {items.map((item) => {
              const unitPrice = item.product.discountPrice || item.product.price;
              const lineTotal = unitPrice * item.quantity;
              const isMaxStock = item.quantity >= item.product.stock;

              return (
                <div key={item.productId} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                  {/* Thumbnail */}
                  <div
                    onClick={() => onNavigate('product', item.productId)}
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0 cursor-pointer border border-slate-200"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.product.categoryName}
                    </span>
                    <h3
                      onClick={() => onNavigate('product', item.productId)}
                      className="font-bold text-slate-800 text-sm hover:text-amber-600 cursor-pointer truncate"
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Unit: PKR {unitPrice.toLocaleString()}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={isMaxStock}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isMaxStock && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          Max stock reached
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="text-right space-y-2 shrink-0">
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 font-heading">
                      PKR {lineTotal.toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors inline-block"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-base font-heading">
              Order Summary
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-slate-900">
                  PKR {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `PKR ${shippingFee.toLocaleString()}`
                  )}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Payable</span>
                <span className="text-xl font-extrabold text-slate-900 font-heading">
                  PKR {total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Coupon input */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" /> Apply Promo Code
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div>
                    <span className="font-bold text-emerald-900">{appliedCoupon.code}</span>
                    <p className="text-[10px] text-emerald-700">Coupon applied successfully</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-800 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponMessage && (
                <p
                  className={`text-[11px] ${
                    couponMessage.isError ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[10px] text-slate-400">
              Orders recalculated & verified securely on server
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
