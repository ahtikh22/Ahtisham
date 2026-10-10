import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, PaymentMethod, Address } from '../types/index';

interface CheckoutPageProps {
  onNavigate: (view: string, param?: string) => void;
  onOrderComplete: (order: Order) => void;
}

const PAKISTAN_CITIES = [
  'Islamabad',
  'Lahore',
  'Karachi',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Mardan',
  'Other City',
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onNavigate,
  onOrderComplete,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, shippingFee, discountAmount, total, appliedCoupon, clearCart, settings } =
    useCart();

  // Delivery form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [country, setCountry] = useState(user?.country || 'Pakistan');
  const [city, setCity] = useState('Islamabad');
  const [addressLine, setAddressLine] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Saved addresses if logged in
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState<string>('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [transactionId, setTransactionId] = useState('');
  const [proofNote, setProofNote] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync user info if loaded late
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.fullName);
      if (!phone) setPhone(user.phone);
      if (!email) setEmail(user.email);
      if (user.country) setCountry(user.country);
    }
  }, [user]);

  // Load saved addresses for user
  useEffect(() => {
    if (isAuthenticated) {
      api.auth
        .getAddresses()
        .then((res) => {
          setSavedAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
          if (defaultAddr) {
            setSelectedSavedAddr(defaultAddr.id);
            setFullName(defaultAddr.fullName);
            setPhone(defaultAddr.phone);
            setCity(defaultAddr.city);
            setAddressLine(defaultAddr.addressLine);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleSavedAddressChange = (addrId: string) => {
    setSelectedSavedAddr(addrId);
    const addr = savedAddresses.find((a) => a.id === addrId);
    if (addr) {
      setFullName(addr.fullName);
      setPhone(addr.phone);
      setCity(addr.city);
      setAddressLine(addr.addressLine);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim() || !phone.trim() || !city.trim() || !addressLine.trim()) {
      setErrorMessage('Please fill in all mandatory delivery fields (Name, Phone, City, and Address).');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.orders.create({
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          country: country.trim(),
          city: city.trim(),
          addressLine: addressLine.trim(),
          orderNotes: orderNotes.trim() || undefined,
        },
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
        couponCode: appliedCoupon?.code,
        paymentMethod,
        transactionId: transactionId.trim() || undefined,
        proofNote: proofNote.trim() || undefined,
      });

      clearCart();
      onOrderComplete(res.order);
      onNavigate('order-confirmation', res.order.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please review and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete your shipping address and choose your payment method
          </p>
        </div>
        <button
          onClick={() => onNavigate('cart')}
          className="text-xs font-bold text-slate-700 hover:text-amber-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Cart
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Guest registration prompt */}
      {!isAuthenticated && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-blue-900">
            <strong>Have an account?</strong> Log in to access your saved addresses and track orders in your dashboard.
          </div>
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-1.5 bg-blue-900 text-white rounded-xl font-bold shrink-0 hover:bg-blue-800"
          >
            Log In
          </button>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery Form & Payment Method */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Delivery Address */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-mono">
                  1
                </span>
                Shipping Address
              </h2>
            </div>

            {/* Saved Addresses Selector */}
            {savedAddresses.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700">Choose from Saved Addresses</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`p-3 rounded-xl border text-xs cursor-pointer block transition-all ${
                        selectedSavedAddr === addr.id
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                          : 'border-slate-200 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddr"
                        value={addr.id}
                        checked={selectedSavedAddr === addr.id}
                        onChange={() => handleSavedAddressChange(addr.id)}
                        className="sr-only"
                      />
                      <div className="font-bold text-slate-800">{addr.fullName}</div>
                      <div className="text-slate-500 text-[11px] truncate">{addr.addressLine}, {addr.city}</div>
                      <div className="text-slate-400 text-[10px]">{addr.phone}</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ahtisham"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Complete Delivery Address (House / Street / Sector / Area){' '}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="House #, Street name, Sector / Block, Landmark..."
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Order Notes & Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Call before arrival / Leave at gate with security..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-mono">
                2
              </span>
              Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Cash on Delivery */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-amber-600 bg-amber-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Cash on Delivery (COD)
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Pay in cash directly to courier upon receiving your parcel at your doorstep.
                  </p>
                </div>
              </label>

              {/* JazzCash */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'JazzCash'
                    ? 'border-amber-600 bg-amber-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'JazzCash'}
                  onChange={() => setPaymentMethod('JazzCash')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-rose-600" />
                    JazzCash Mobile Account
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Transfer order amount via JazzCash App or *786#. Fast manual admin confirmation.
                  </p>
                </div>
              </label>

              {/* Easypaisa */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'Easypaisa'
                    ? 'border-amber-600 bg-amber-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Easypaisa'}
                  onChange={() => setPaymentMethod('Easypaisa')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Easypaisa Wallet
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Send funds using Easypaisa App or *786# to our official merchant account.
                  </p>
                </div>
              </label>

              {/* Bank Transfer */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'Bank Transfer'
                    ? 'border-amber-600 bg-amber-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Bank Transfer'}
                  onChange={() => setPaymentMethod('Bank Transfer')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-blue-600" />
                    Direct Bank Transfer (IBAN)
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Transfer from Meezan, HBL, UBL, or any bank app via 1Link / Raast.
                  </p>
                </div>
              </label>
            </div>

            {/* DYNAMIC PAYMENT INSTRUCTIONS: APPEAR ONLY AFTER CUSTOMER SELECTS METHOD */}
            {paymentMethod === 'JazzCash' && (
              <div className="p-5 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-rose-950 text-sm">
                  <Smartphone className="w-4 h-4 text-rose-600" />
                  <span>JazzCash Payment Instructions</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-rose-200/80 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">JazzCash Account Number:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {settings?.jazzcashNumber || '0300-1234567'}
                    </span>
                    <span className="text-slate-500">Account Title:</span>
                    <span className="font-bold text-slate-900">
                      {settings?.jazzcashTitle || 'Ahti Store / Muhammad Ahtisham'}
                    </span>
                    <span className="text-slate-500">Exact Payable Amount:</span>
                    <span className="font-bold text-amber-700 text-sm">
                      PKR {total.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    {settings?.jazzcashInstructions ||
                      'Send exact amount via JazzCash App. Enter your 12-digit Transaction ID below.'}
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-slate-800">
                    Enter JazzCash Transaction ID (TID / TRX)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 102938475612"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl font-mono text-xs focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Note: Your order will be placed as "Verification Pending" until payment is verified by our admin.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'Easypaisa' && (
              <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Easypaisa Payment Instructions</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-emerald-200/80 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">Easypaisa Number:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {settings?.easypaisaNumber || '0345-9876543'}
                    </span>
                    <span className="text-slate-500">Account Title:</span>
                    <span className="font-bold text-slate-900">
                      {settings?.easypaisaTitle || 'Ahti Store / Muhammad Ahtisham'}
                    </span>
                    <span className="text-slate-500">Exact Payable Amount:</span>
                    <span className="font-bold text-amber-700 text-sm">
                      PKR {total.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    {settings?.easypaisaInstructions ||
                      'Send funds using Easypaisa. Provide the 11-digit TRX ID from the Easypaisa confirmation SMS.'}
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-slate-800">
                    Enter Easypaisa Transaction ID (TRX ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 98765432101"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl font-mono text-xs focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Note: Your order will remain pending until payment verification is approved by our admin team.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'Bank Transfer' && (
              <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-blue-950 text-sm">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Bank Wire / IBAN Transfer Details</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-200/80 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-bold text-slate-900">{settings?.bankName || 'Meezan Bank Limited'}</span>
                    <span className="text-slate-500">Account Title:</span>
                    <span className="font-bold text-slate-900">{settings?.bankAccountTitle || 'Ahti Store Private Limited'}</span>
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-bold text-slate-900">{settings?.bankAccountNumber || '01020304050607'}</span>
                    <span className="text-slate-500">IBAN:</span>
                    <span className="font-mono font-bold text-blue-900">{settings?.bankIban || 'PK64MEZN0001020304050607'}</span>
                    <span className="text-slate-500">Branch:</span>
                    <span className="text-slate-700">{settings?.bankBranch || 'Blue Area Branch, Islamabad'}</span>
                    <span className="text-slate-500">Payable:</span>
                    <span className="font-bold text-amber-700 text-sm">PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-slate-800">
                    Bank Reference / Transaction Number / Deposit Note
                  </label>
                  <input
                    type="text"
                    placeholder="Enter bank transaction reference number"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl font-mono text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Optional: Sender Bank Name / Account Name"
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs focus:outline-none mt-2"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Confirmation Button */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs sticky top-24">
            <h3 className="font-extrabold text-slate-900 text-base font-heading">
              Order Review
            </h3>

            {/* Items mini list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 max-w-[180px]">
                    <img
                      src={item.product.images[0]}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{item.product.name}</p>
                      <p className="text-slate-400 text-[10px]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    PKR {((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `PKR ${shippingFee.toLocaleString()}`}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Payable</span>
                <span className="text-xl font-extrabold text-slate-900 font-heading">
                  PKR {total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Prices & stock are locked securely on the server.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? 'Placing Order...' : `Place Order (PKR ${total.toLocaleString()})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
