import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Clock,
  ShieldCheck,
  Users,
  AlertTriangle,
  Download,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  DollarSign,
  Tag,
  Settings,
  Smartphone,
  Building,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Product,
  Category,
  Order,
  User as UserType,
  Coupon,
  StoreSettings,
  OrderStatus,
  PaymentStatus,
} from '../types/index';

interface AdminDashboardProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'categories' | 'customers' | 'coupons' | 'settings'
  >('overview');

  // KPI Metrics
  const [metrics, setMetrics] = useState<{
    totalOrders: number;
    totalSalesVerified: number;
    pendingOrders: number;
    pendingPaymentVerifications: number;
    totalCustomers: number;
    lowStockCount: number;
  } | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Customers
  const [customers, setCustomers] = useState<(UserType & { ordersCount: number; totalSpent: number })[]>([]);

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponVal, setNewCouponVal] = useState('');
  const [newCouponMin, setNewCouponMin] = useState('1000');

  // Store Settings
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  // Rejection note modal
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Product Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCatId, setFormCatId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formDesc, setFormDesc] = useState('');
  const [formImages, setFormImages] = useState('');
  const [formIsDemo, setFormIsDemo] = useState(false);
  const [formFeatured, setFormFeatured] = useState(false);

  // Load all initial data
  const loadData = async () => {
    try {
      const [metricRes, orderRes, prodRes, catRes, custRes, coupRes, setRes] =
        await Promise.all([
          api.admin.getMetrics(),
          api.admin.getOrders(),
          api.products.getAll({ limit: 100 }),
          api.products.getCategories(),
          api.admin.getCustomers(),
          api.admin.getCoupons(),
          api.admin.getSettings(),
        ]);

      setMetrics(metricRes.metrics);
      setLowStockProducts(metricRes.lowStockProducts);
      setOrders(orderRes.orders);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
      setCustomers(custRes.customers);
      setCoupons(coupRes.coupons);
      setSettings(setRes.settings);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Administrator Access Required</h2>
        <p className="text-xs text-slate-500">
          This secure control panel is restricted to authorized store managers.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  // --- Order Status & Payment Actions ---
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await api.admin.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrderModal?.id === orderId) setSelectedOrderModal(res.order);
      // Reload metrics
      api.admin.getMetrics().then((m) => setMetrics(m.metrics));
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleVerifyPayment = async (orderId: string, status: PaymentStatus, reason?: string) => {
    try {
      const res = await api.admin.verifyPayment(orderId, status, reason);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrderModal?.id === orderId) setSelectedOrderModal(res.order);
      setRejectingOrder(null);
      setRejectionReason('');
      // Reload metrics
      api.admin.getMetrics().then((m) => setMetrics(m.metrics));
    } catch (err: any) {
      alert(err.message || 'Failed to verify payment');
    }
  };

  // --- Product CRUD ---
  const openNewProductModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`AHTI-${Math.floor(100 + Math.random() * 900)}`);
    setFormCatId(categories[0]?.id || 'cat-electronics');
    setFormPrice('');
    setFormDiscountPrice('');
    setFormStock('20');
    setFormDesc('');
    setFormImages('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80');
    setFormIsDemo(false);
    setFormFeatured(true);
    setProductModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormCatId(p.categoryId);
    setFormPrice(String(p.price));
    setFormDiscountPrice(p.discountPrice ? String(p.discountPrice) : '');
    setFormStock(String(p.stock));
    setFormDesc(p.description);
    setFormImages(p.images.join('\n'));
    setFormIsDemo(Boolean(p.isDemo));
    setFormFeatured(Boolean(p.featured));
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArr = formImages
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const data: Partial<Product> = {
      name: formName.trim(),
      sku: formSku.trim(),
      categoryId: formCatId,
      price: Number(formPrice),
      discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
      stock: parseInt(formStock, 10),
      description: formDesc.trim(),
      images: imagesArr.length > 0 ? imagesArr : undefined,
      isDemo: formIsDemo,
      featured: formFeatured,
    };

    try {
      if (editingProduct) {
        const res = await api.admin.updateProduct(editingProduct.id, data);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? res.product : p)));
      } else {
        const res = await api.admin.createProduct(data);
        setProducts((prev) => [res.product, ...prev]);
      }
      setProductModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.admin.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // --- Coupon CRUD ---
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponVal) return;
    try {
      const res = await api.admin.createCoupon({
        code: newCouponCode.trim().toUpperCase(),
        discountType: newCouponType,
        discountValue: Number(newCouponVal),
        minOrderAmount: Number(newCouponMin) || 0,
        isActive: true,
      });
      setCoupons((prev) => [...prev, res.coupon]);
      setNewCouponCode('');
      setNewCouponVal('');
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await api.admin.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  // --- Save Settings ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSettingsSaving(true);
    setSettingsMsg(null);
    try {
      const res = await api.admin.updateSettings(settings);
      setSettings(res.settings);
      setSettingsMsg('Store & payment configurations updated successfully!');
      setTimeout(() => setSettingsMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const filteredOrders =
    orderFilterStatus === 'all'
      ? orders
      : orderFilterStatus === 'pending-verification'
      ? orders.filter((o) => o.payment.status === 'Verification Pending')
      : orders.filter((o) => o.status === orderFilterStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Authorized Admin Control
              </span>
            </div>
            <h1 className="text-2xl font-black font-heading mt-1">Ahti Store Management</h1>
            <p className="text-xs text-slate-400">Inventory, Verified Sales, Pakistan Mobile Wallets & Logistics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export-csv"
            download
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" /> Export Orders CSV
          </a>

          <button
            onClick={openNewProductModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & KPIs', icon: TrendingUp },
          { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
          { id: 'products', label: `Products (${products.length})`, icon: Tag },
          { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: DollarSign },
          { id: 'settings', label: 'Store & Payment Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Verified Sales
              </span>
              <div className="text-2xl font-black text-slate-900 font-heading">
                PKR {metrics?.totalSalesVerified?.toLocaleString() || '0'}
              </div>
              <p className="text-[10px] text-emerald-600 font-bold">
                Strictly from verified/paid orders only
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Orders
              </span>
              <div className="text-2xl font-black text-slate-900 font-heading">
                {metrics?.totalOrders || 0}
              </div>
              <p className="text-[10px] text-slate-500">
                {metrics?.pendingOrders || 0} pending processing
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                Pending Verifications
              </span>
              <div className="text-2xl font-black text-amber-600 font-heading">
                {metrics?.pendingPaymentVerifications || 0}
              </div>
              <p className="text-[10px] text-amber-700 font-medium">
                JazzCash / Easypaisa TRX awaiting review
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Low Stock Alert
              </span>
              <div className="text-2xl font-black text-rose-600 font-heading">
                {metrics?.lowStockCount || 0}
              </div>
              <p className="text-[10px] text-rose-600 font-medium">Items with ≤ 5 units left</p>
            </div>
          </div>

          {/* Low Stock Items Table */}
          {lowStockProducts.length > 0 && (
            <div className="bg-rose-50/50 rounded-3xl border border-rose-200 p-6 space-y-4">
              <div className="flex items-center gap-2 font-bold text-rose-950 text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Low Inventory Notice (Requires Replenishment)</span>
              </div>
              <div className="bg-white rounded-2xl border border-rose-200 divide-y divide-slate-100 overflow-hidden">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-slate-400 font-mono text-[10px]">{p.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-rose-600">Only {p.stock} left</span>
                      <button
                        onClick={() => openEditProductModal(p)}
                        className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-500">Filter Status:</span>
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
              >
                <option value="all">All Orders ({orders.length})</option>
                <option value="pending-verification">
                  Pending Payment Verifications ({metrics?.pendingPaymentVerifications || 0})
                </option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <a
              href="/api/admin/export-csv"
              download
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download Orders CSV
            </a>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Amount (PKR)</th>
                    <th className="p-4">Payment Method & Status</th>
                    <th className="p-4">Order Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900">{ord.orderNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleString()}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-500">{ord.customerPhone}</div>
                        <div className="text-[10px] text-slate-400">{ord.shippingAddress.city}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900 font-heading">
                          PKR {ord.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ord.items.length} items
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{ord.payment.method}</div>
                        {ord.payment.transactionId && (
                          <div className="font-mono text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            TID: {ord.payment.transactionId}
                          </div>
                        )}
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                              ord.payment.status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.payment.status === 'Verification Pending'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : ord.payment.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ord.payment.status}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                          }
                          className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {/* Verify Payment Action */}
                        {ord.payment.status !== 'Verified' &&
                          ord.payment.method !== 'Cash on Delivery' && (
                            <button
                              onClick={() => handleVerifyPayment(ord.id, 'Verified')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px]"
                              title="Approve & Mark Paid"
                            >
                              Verify
                            </button>
                          )}

                        {ord.payment.status === 'Verification Pending' && (
                          <button
                            onClick={() => setRejectingOrder(ord)}
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-[11px] border border-rose-200"
                            title="Reject Payment"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedOrderModal(ord)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg inline-block"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="font-bold text-slate-900 text-base font-heading">
              Product Inventory ({products.length} Items)
            </h2>
            <button
              onClick={openNewProductModal}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price in PKR</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border" />
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="font-mono text-slate-400 text-[10px]">{p.sku}</p>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600">{p.categoryName}</td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900">
                          PKR {p.price.toLocaleString()}
                        </span>
                        {p.discountPrice && (
                          <div className="text-[10px] text-rose-600 font-semibold">
                            Disc: PKR {p.discountPrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`font-bold ${
                            p.stock <= 5 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      <td className="p-4">
                        {p.isDemo ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            DEMO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            LIVE
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg inline-block"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg inline-block"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <h2 className="font-bold text-slate-900 text-base font-heading pb-3 border-b border-slate-200">
            Registered Customers ({customers.length})
          </h2>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Country</th>
                    <th className="p-4">Registered</th>
                    <th className="p-4">Total Orders</th>
                    <th className="p-4 text-right">Verified Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="p-4 font-bold text-slate-900">{c.fullName}</td>
                      <td className="p-4 text-slate-600">{c.email}</td>
                      <td className="p-4 font-mono text-slate-600">{c.phone}</td>
                      <td className="p-4 text-slate-600">{c.country}</td>
                      <td className="p-4 text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-bold text-slate-800">{c.ordersCount}</td>
                      <td className="p-4 text-right font-bold text-slate-900">
                        PKR {c.totalSpent.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6 max-w-3xl">
          <h2 className="font-bold text-slate-900 text-base font-heading pb-3 border-b border-slate-200">
            Coupons & Promo Codes
          </h2>

          {/* Create Coupon Form */}
          <form
            onSubmit={handleCreateCoupon}
            className="p-5 bg-white rounded-3xl border border-slate-200 space-y-4 text-xs shadow-xs"
          >
            <h4 className="font-bold text-slate-900">Create New Discount Coupon</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER15"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Type</label>
                <select
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed PKR Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Discount Value</label>
                <input
                  type="number"
                  required
                  placeholder="10 or 500"
                  value={newCouponVal}
                  onChange={(e) => setNewCouponVal(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Min Order (PKR)</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={newCouponMin}
                  onChange={(e) => setNewCouponMin(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
            >
              Add Coupon
            </button>
          </form>

          {/* Existing Coupons Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="p-4 font-mono font-bold text-slate-900">{c.code}</td>
                    <td className="p-4 text-slate-700">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% Off`
                        : `PKR ${c.discountValue} Off`}
                    </td>
                    <td className="p-4 text-slate-500">PKR {c.minOrderAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="text-rose-600 font-bold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: STORE & PAYMENT SETTINGS */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="font-bold text-slate-900 text-base font-heading">
              Store & Payment Gateways Configuration
            </h2>
            <button
              type="submit"
              disabled={settingsSaving}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-xs disabled:opacity-50"
            >
              {settingsSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {settingsMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
              {settingsMsg}
            </div>
          )}

          {/* Shipping Charges */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              Delivery & Shipping Rates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Standard Shipping Fee (PKR)
                </label>
                <input
                  type="number"
                  value={settings.standardShippingFee}
                  onChange={(e) =>
                    setSettings({ ...settings, standardShippingFee: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Free Shipping Minimum Threshold (PKR)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* JazzCash Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs">
            <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-rose-600" />
              JazzCash Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">JazzCash Mobile Number</label>
                <input
                  type="text"
                  value={settings.jazzcashNumber}
                  onChange={(e) => setSettings({ ...settings, jazzcashNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Title</label>
                <input
                  type="text"
                  value={settings.jazzcashTitle}
                  onChange={(e) => setSettings({ ...settings, jazzcashTitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Payment Instructions</label>
                <textarea
                  rows={2}
                  value={settings.jazzcashInstructions}
                  onChange={(e) => setSettings({ ...settings, jazzcashInstructions: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Easypaisa Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs">
            <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Easypaisa Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Easypaisa Phone Number</label>
                <input
                  type="text"
                  value={settings.easypaisaNumber}
                  onChange={(e) => setSettings({ ...settings, easypaisaNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Title</label>
                <input
                  type="text"
                  value={settings.easypaisaTitle}
                  onChange={(e) => setSettings({ ...settings, easypaisaTitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Payment Instructions</label>
                <textarea
                  rows={2}
                  value={settings.easypaisaInstructions}
                  onChange={(e) => setSettings({ ...settings, easypaisaInstructions: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Bank Transfer Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs">
            <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Direct Bank Transfer (IBAN)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bank Name</label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Title</label>
                <input
                  type="text"
                  value={settings.bankAccountTitle}
                  onChange={(e) => setSettings({ ...settings, bankAccountTitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">IBAN Number</label>
                <input
                  type="text"
                  value={settings.bankIban}
                  onChange={(e) => setSettings({ ...settings, bankIban: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Branch Details</label>
                <input
                  type="text"
                  value={settings.bankBranch}
                  onChange={(e) => setSettings({ ...settings, bankBranch: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Product Add/Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-extrabold text-slate-900 text-lg font-heading">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCatId}
                    onChange={(e) => setFormCatId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Regular Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Price (PKR)</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Available Stock Units</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                    />
                    <span>Featured Item</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsDemo}
                      onChange={(e) => setFormIsDemo(e.target.checked)}
                    />
                    <span>Flag as Demo</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Image URLs (One per line)</label>
                  <textarea
                    rows={2}
                    value={formImages}
                    onChange={(e) => setFormImages(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Payment Reason Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-rose-900 text-base">Reject Payment Submission</h3>
            <p className="text-xs text-slate-500">
              Provide reason for rejecting TID "{rejectingOrder.payment.transactionId}" on order {rejectingOrder.orderNumber}:
            </p>
            <textarea
              rows={2}
              placeholder="e.g. TID not found in bank statement / Invalid amount"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectingOrder(null)}
                className="flex-1 py-2 bg-slate-100 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyPayment(rejectingOrder.id, 'Rejected', rejectionReason)}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-heading">
                  Order Details: {selectedOrderModal.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(selectedOrderModal.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-800">Customer & Delivery:</p>
                <p className="text-slate-600">{selectedOrderModal.customerName} ({selectedOrderModal.customerEmail})</p>
                <p className="text-slate-600">Phone: {selectedOrderModal.shippingAddress.phone}</p>
                <p className="text-slate-600">
                  {selectedOrderModal.shippingAddress.addressLine}, {selectedOrderModal.shippingAddress.city}
                </p>
                {selectedOrderModal.shippingAddress.orderNotes && (
                  <p className="italic text-slate-500 mt-1">
                    Notes: {selectedOrderModal.shippingAddress.orderNotes}
                  </p>
                )}
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-2">Ordered Items:</p>
                <div className="divide-y border rounded-xl overflow-hidden">
                  {selectedOrderModal.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={it.productImage} alt="" className="w-8 h-8 rounded object-cover" />
                        <span>{it.productName} × {it.quantity}</span>
                      </div>
                      <span className="font-bold">PKR {it.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>PKR {selectedOrderModal.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>PKR {selectedOrderModal.shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t">
                  <span>Total Amount:</span>
                  <span>PKR {selectedOrderModal.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl space-y-1">
                <p className="font-bold text-amber-900">Payment Information:</p>
                <p>Method: {selectedOrderModal.payment.method}</p>
                <p>Status: {selectedOrderModal.payment.status}</p>
                {selectedOrderModal.payment.transactionId && (
                  <p className="font-mono">Transaction ID: {selectedOrderModal.payment.transactionId}</p>
                )}
                {selectedOrderModal.payment.verifiedBy && (
                  <p>Verified By: {selectedOrderModal.payment.verifiedBy}</p>
                )}
                {selectedOrderModal.payment.rejectionReason && (
                  <p className="text-rose-700 font-semibold">
                    Rejection Reason: {selectedOrderModal.payment.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
