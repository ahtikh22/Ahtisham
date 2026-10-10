import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Clock,
  ArrowRight,
  Truck,
  Copy,
  Check,
  Smartphone,
  Building,
  AlertCircle,
} from 'lucide-react';
import { Order } from '../types/index';
import { api } from '../services/api';

interface OrderConfirmationPageProps {
  orderId?: string;
  orderData?: Order | null;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  orderData: initialOrder,
  onNavigate,
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [copied, setCopied] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofTid, setProofTid] = useState('');
  const [proofMessage, setProofMessage] = useState<string | null>(null);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored if canvas-confetti unavailable
    }

    if (!order && orderId) {
      api.orders
        .getById(orderId)
        .then((res) => setOrder(res.order))
        .catch((err) => console.error(err));
    }
  }, [orderId]);

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !proofTid.trim()) return;
    setSubmittingProof(true);
    try {
      const res = await api.orders.submitPaymentProof(order.id, {
        transactionId: proofTid.trim(),
      });
      setOrder(res.order);
      setProofMessage('Transaction ID updated successfully! Admin review is in progress.');
      setProofTid('');
    } catch (err: any) {
      setProofMessage(err.message || 'Failed to submit Transaction ID.');
    } finally {
      setSubmittingProof(false);
    }
  };

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 font-heading">
          Order Received!
        </h2>
        <p className="text-sm text-slate-500">
          Your order has been recorded. You can view all orders from your Customer Dashboard.
        </p>
        <button
          onClick={() => onNavigate('dashboard', 'orders')}
          className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-full"
        >
          Go to My Orders
        </button>
      </div>
    );
  }

  const isOnlinePayment =
    order.payment.method === 'JazzCash' ||
    order.payment.method === 'Easypaisa' ||
    order.payment.method === 'Bank Transfer';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header Congratulations */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Order Successfully Placed
        </span>
        <h1 className="text-3xl font-black text-slate-900 font-heading">
          Thank You, {order.customerName}!
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          We've received your order. A confirmation SMS/email has been dispatched to{' '}
          <strong className="text-slate-800">{order.customerPhone}</strong>.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Order Reference Number
          </span>
          <div className="text-xl font-mono font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
            <span>{order.orderNumber}</span>
            <button
              onClick={copyOrderNumber}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Current Status
            </span>
            <div className="flex items-center gap-1.5 font-bold text-amber-600 text-sm mt-0.5">
              <Clock className="w-4 h-4" />
              <span>{order.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Special Notice for JazzCash / Easypaisa / Bank */}
      {isOnlinePayment && (
        <div className="p-6 bg-amber-50/80 border border-amber-200 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 font-extrabold text-amber-950 text-base font-heading">
            <Smartphone className="w-5 h-5 text-amber-600" />
            <span>{order.payment.method} Verification Notice</span>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed">
            Payment Method:{' '}
            <strong className="text-slate-900">{order.payment.method}</strong>. Payment status is currently{' '}
            <strong className="text-amber-800">
              "{order.payment.status}"
            </strong>
            . In accordance with store security policies, our Islamabad accounting department reviews and verifies all transactions prior to parcel dispatch.
          </p>

          {order.payment.transactionId ? (
            <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
              <span className="text-slate-500">Submitted Transaction ID (TID): </span>
              <strong className="font-mono text-slate-900">{order.payment.transactionId}</strong>
            </div>
          ) : (
            <form onSubmit={handleTidSubmit} className="space-y-2 pt-2 border-t border-amber-200">
              <label className="block text-xs font-bold text-slate-800">
                Did you complete the transfer? Submit your Transaction ID (TRX/TID):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Transaction ID from SMS"
                  value={proofTid}
                  onChange={(e) => setProofTid(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-mono focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {submittingProof ? 'Saving...' : 'Submit TID'}
                </button>
              </div>
              {proofMessage && <p className="text-xs text-emerald-700 font-bold">{proofMessage}</p>}
            </form>
          )}
        </div>
      )}

      {/* Order Details & Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base font-heading">
          Order Items & Details
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((it, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={it.productImage}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border"
                />
                <div>
                  <p className="font-bold text-slate-800">{it.productName}</p>
                  <p className="text-slate-400 font-mono text-[10px]">
                    Qty: {it.quantity} × PKR {it.price.toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="font-extrabold text-slate-900 font-heading">
                PKR {it.subtotal.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown */}
        <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>PKR {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? 'FREE' : `PKR ${order.shippingFee.toLocaleString()}`}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount</span>
              <span>- PKR {order.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
            <span>Total Payable</span>
            <span className="text-base text-slate-900 font-heading">
              PKR {order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Delivery Destination */}
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">Delivery Address:</p>
          <p>{order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.country}</p>
          <p>Recipient Contact: {order.shippingAddress.phone}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onNavigate('dashboard', 'orders')}
          className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          <span>View in Customer Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('shop')}
          className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
