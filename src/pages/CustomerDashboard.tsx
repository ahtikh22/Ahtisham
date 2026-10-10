import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  Lock,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Smartphone,
  Building,
  Plus,
  Trash2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';
import { Order, Address, Product, OrderStatus } from '../types/index';

interface CustomerDashboardProps {
  initialTab?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  initialTab = 'orders',
  onNavigate,
}) => {
  const { user, logout, refreshUser } = useAuth();
  const { addToCart } = useCart();
  const { wishlistIds, toggleWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState(initialTab);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // TID modal state
  const [tidModalOrder, setTidModalOrder] = useState<Order | null>(null);
  const [newTid, setNewTid] = useState('');
  const [tidSubmitting, setTidSubmitting] = useState(false);
  const [tidMessage, setTidMessage] = useState<string | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editCountry, setEditCountry] = useState(user?.country || 'Pakistan');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddrModalOpen, setNewAddrModalOpen] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrCity, setAddrCity] = useState('Islamabad');
  const [addrLine, setAddrLine] = useState('');

  // Wishlist Products State
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // Load orders
  useEffect(() => {
    api.orders
      .getMyOrders()
      .then((res) => setOrders(res.orders))
      .catch((err) => console.error(err))
      .finally(() => setOrdersLoading(false));
  }, []);

  // Load addresses
  useEffect(() => {
    api.auth
      .getAddresses()
      .then((res) => setAddresses(res.addresses))
      .catch((err) => console.error(err));
  }, []);

  // Load wishlist items
  useEffect(() => {
    if (activeTab === 'wishlist') {
      api.wishlist
        .get()
        .then((res) => setWishlistProducts(res.wishlist))
        .catch((err) => console.error(err));
    }
  }, [activeTab, wishlistIds]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await api.auth.updateProfile({
        fullName: editName,
        phone: editPhone,
        country: editCountry,
      });
      await refreshUser();
      setProfileMsg({ text: res.message });
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'Failed to update profile.', error: true });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      const res = await api.auth.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPwdMsg({ text: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMsg({ text: err.message || 'Failed to change password.', error: true });
    } finally {
      setPwdSaving(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.orders.cancel(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(res.order);
      }
      alert('Order cancelled successfully.');
    } catch (err: any) {
      alert(err.message || 'Cannot cancel order.');
    }
  };

  const handleTidModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tidModalOrder || !newTid.trim()) return;

    setTidSubmitting(true);
    setTidMessage(null);
    try {
      const res = await api.orders.submitPaymentProof(tidModalOrder.id, {
        transactionId: newTid.trim(),
      });
      setOrders((prev) => prev.map((o) => (o.id === tidModalOrder.id ? res.order : o)));
      if (selectedOrder?.id === tidModalOrder.id) {
        setSelectedOrder(res.order);
      }
      setTidMessage('Transaction ID updated! Admin verification is in progress.');
      setNewTid('');
      setTimeout(() => {
        setTidModalOrder(null);
        setTidMessage(null);
      }, 2500);
    } catch (err: any) {
      setTidMessage(err.message || 'Failed to update TID.');
    } finally {
      setTidSubmitting(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.auth.addAddress({
        fullName: addrName,
        phone: addrPhone,
        city: addrCity,
        addressLine: addrLine,
        country: 'Pakistan',
        isDefault: addresses.length === 0,
      });
      setAddresses((prev) => [...prev, res.address]);
      setNewAddrModalOpen(false);
      setAddrName('');
      setAddrPhone('');
      setAddrLine('');
    } catch (err: any) {
      alert(err.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.auth.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pending</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'Processing':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Processing</span>;
      case 'Shipped':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Shipped</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      case 'Refunded':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">Refunded</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Welcome Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-2xl font-heading shadow-md">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
              Customer Account
            </div>
            <h1 className="text-2xl font-black font-heading">{user?.fullName}</h1>
            <p className="text-xs text-slate-400">{user?.email} • {user?.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold"
            >
              Admin Dashboard
            </button>
          )}
          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" /> My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" /> Edit Profile
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'addresses'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" /> Delivery Addresses ({addresses.length})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-4 h-4" /> My Wishlist ({wishlistIds.length})
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              activeTab === 'password'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" /> Change Password
          </button>
        </aside>

        {/* Content Pane */}
        <main className="md:col-span-3">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h2 className="font-extrabold text-slate-900 text-lg font-heading">
                  My Orders & Tracking
                </h2>
                <span className="text-xs text-slate-500">{orders.length} total orders</span>
              </div>

              {ordersLoading ? (
                <div className="py-12 text-center text-slate-400">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-slate-800">No orders placed yet</h3>
                  <p className="text-xs text-slate-500">
                    Browse our store and make your first order with COD or mobile wallet!
                  </p>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => {
                    const isCanCancel = ord.status === 'Pending' || ord.status === 'Confirmed';
                    const isOnline =
                      ord.payment.method === 'JazzCash' ||
                      ord.payment.method === 'Easypaisa' ||
                      ord.payment.method === 'Bank Transfer';

                    return (
                      <div
                        key={ord.id}
                        className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                          <div>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {ord.orderNumber}
                            </span>
                            <span className="text-slate-400 ml-2">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(ord.status)}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ord.payment.status === 'Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.payment.status === 'Verification Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              Payment: {ord.payment.status}
                            </span>
                          </div>
                        </div>

                        {/* Items in order */}
                        <div className="space-y-2">
                          {ord.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs py-1"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.productImage}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover border"
                                />
                                <span className="font-semibold text-slate-800">
                                  {item.productName} × {item.quantity}
                                </span>
                              </div>
                              <span className="font-bold text-slate-900">
                                PKR {item.subtotal.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Summary & actions */}
                        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                          <div>
                            <span className="text-slate-500">Method: </span>
                            <strong className="text-slate-900">{ord.payment.method}</strong>
                            {ord.payment.transactionId && (
                              <span className="ml-2 font-mono text-[11px] text-slate-600">
                                (TID: {ord.payment.transactionId})
                              </span>
                            )}
                            <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                              Total: PKR {ord.totalAmount.toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Update TID Button */}
                            {isOnline && ord.payment.status !== 'Verified' && (
                              <button
                                onClick={() => setTidModalOrder(ord)}
                                className="px-3 py-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded-xl font-bold border border-amber-200 transition-colors"
                              >
                                {ord.payment.transactionId ? 'Update TID' : 'Submit TID'}
                              </button>
                            )}

                            {/* Cancel Order */}
                            {isCanCancel && (
                              <button
                                onClick={() => handleCancelOrder(ord.id)}
                                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold border border-rose-200 transition-colors"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-xl">
              <h2 className="font-extrabold text-slate-900 text-lg font-heading">
                Edit Contact Details
              </h2>

              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    profileMsg.error
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h2 className="font-extrabold text-slate-900 text-lg font-heading">
                  Saved Delivery Addresses
                </h2>
                <button
                  onClick={() => setNewAddrModalOpen(true)}
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500">No saved delivery addresses yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="p-5 bg-white rounded-3xl border border-slate-200 space-y-2 text-xs relative"
                    >
                      {a.isDefault && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                          Default Address
                        </span>
                      )}
                      <h4 className="font-bold text-slate-900 text-sm">{a.fullName}</h4>
                      <p className="text-slate-600">{a.addressLine}</p>
                      <p className="text-slate-500">{a.city}, {a.country}</p>
                      <p className="font-mono text-slate-400">{a.phone}</p>

                      <button
                        onClick={() => handleDeleteAddress(a.id)}
                        className="text-rose-600 font-bold hover:underline pt-2 inline-block text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-extrabold text-slate-900 text-lg font-heading pb-3 border-b border-slate-200">
                My Saved Wishlist
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                  <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800">Your wishlist is empty</h3>
                  <p className="text-xs text-slate-500">
                    Click the heart icon on any product to save it here for later.
                  </p>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold"
                  >
                    Browse Store
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-xs"
                    >
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-full aspect-square rounded-2xl object-cover cursor-pointer"
                        onClick={() => onNavigate('product', p.id)}
                      />
                      <h4
                        className="font-bold text-slate-800 text-sm truncate cursor-pointer hover:text-amber-600"
                        onClick={() => onNavigate('product', p.id)}
                      >
                        {p.name}
                      </h4>
                      <p className="text-sm font-extrabold text-slate-900">
                        PKR {(p.discountPrice || p.price).toLocaleString()}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => addToCart(p, 1)}
                          disabled={p.stock <= 0}
                          className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl disabled:opacity-40"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="p-2 border border-slate-200 text-rose-600 rounded-xl hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PASSWORD */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-xl">
              <h2 className="font-extrabold text-slate-900 text-lg font-heading">
                Change Password
              </h2>

              {pwdMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    pwdMsg.error
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {pwdMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New Password (Min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pwdSaving}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  {pwdSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Submit / Update TID Modal */}
      {tidModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-extrabold text-slate-900 text-base font-heading">
              Update {tidModalOrder.payment.method} Transaction ID
            </h3>
            <p className="text-xs text-slate-500">
              Order: <strong className="font-mono">{tidModalOrder.orderNumber}</strong> • Total: PKR {tidModalOrder.totalAmount.toLocaleString()}
            </p>

            <form onSubmit={handleTidModalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  11 or 12-Digit Transaction ID (TRX/TID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter TID from confirmation SMS"
                  value={newTid}
                  onChange={(e) => setNewTid(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none"
                />
              </div>

              {tidMessage && (
                <p className="text-xs text-emerald-700 font-bold p-2 bg-emerald-50 rounded-xl">
                  {tidMessage}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTidModalOrder(null)}
                  className="flex-1 py-2.5 bg-slate-100 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tidSubmitting}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold"
                >
                  {tidSubmitting ? 'Saving...' : 'Submit TID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {newAddrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-extrabold text-slate-900 text-base font-heading">
              Add New Delivery Address
            </h3>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address Details</label>
                <textarea
                  rows={2}
                  required
                  value={addrLine}
                  onChange={(e) => setAddrLine(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewAddrModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white rounded-xl font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
