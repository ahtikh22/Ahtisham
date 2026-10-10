import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Clock,
  Flame,
  CheckCircle,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { Product, Category } from '../types/index';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.products.getAll({ limit: 30 }),
          api.products.getCategories(),
        ]);

        const all = prodRes.products;
        setFeaturedProducts(all.filter((p) => p.featured).slice(0, 4));
        setNewArrivals(all.filter((p) => p.isNewArrival).slice(0, 4));
        setBestSellers(all.filter((p) => p.isBestSeller).slice(0, 4));
        setCategories(catRes.categories);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Demo Catalog Notification Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-xs text-amber-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Sample Demo Store Active:</strong> Initial products are marked as demo inventory. Store admins can add real products, update prices in PKR, and manage stock via the Admin Dashboard.
            </span>
          </div>
          <button
            onClick={() => onNavigate('admin')}
            className="underline font-bold text-amber-800 hover:text-amber-950"
          >
            Access Admin Area →
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto mt-4 shadow-2xl">
        {/* Glow gradients */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:py-28 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-amber-400 text-xs font-bold tracking-wide uppercase mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium Online Store in Pakistan</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.1] text-white">
            Smart Tech, Fashion & Essentials Delivered in <span className="text-amber-500 underline decoration-amber-500/40">PKR</span>.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Welcome to Ahti Shopping Store. Discover high-grade wireless audio, GaN chargers, mechanical keyboards, luxury watches, and smart home appliances with Cash on Delivery, JazzCash & Easypaisa across Pakistan.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('shop')}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-full shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <span>Shop All Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('shop', 'cat-electronics')}
              className="px-6 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm rounded-full border border-slate-700 transition-colors"
            >
              Explore Electronics
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-400">
            <div>
              <p className="font-extrabold text-white text-base font-heading">Nationwide Delivery</p>
              <p className="text-slate-400">Karachi, Lahore, Islamabad & 100+ cities</p>
            </div>
            <div>
              <p className="font-extrabold text-white text-base font-heading">Local Wallets</p>
              <p className="text-slate-400">JazzCash & Easypaisa verified</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-extrabold text-white text-base font-heading">100% Guaranteed</p>
              <p className="text-slate-400">7-Day return and replacement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Browse Department
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-sm font-bold text-slate-700 hover:text-amber-600 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('shop', cat.id)}
              className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-4 sm:p-5">
                <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                  {cat.description || `${cat.productCount || 0} Products available`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Handpicked Selection
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Featured Products
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-sm font-bold text-slate-700 hover:text-amber-600 flex items-center gap-1"
          >
            <span>See more</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* Special Offers Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-amber-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" /> Limited Time Deal
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-heading">
              Get Up to 25% Off with Coupon Code{' '}
              <span className="text-amber-400 font-mono">WELCOME10</span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Use code <strong className="text-white">WELCOME10</strong> for 10% off on your first order over PKR 1,000, or <strong className="text-white">AHTI500</strong> for PKR 500 flat discount on orders over PKR 3,000!
            </p>
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-full transition-colors shadow-md"
              >
                Claim Offer Now
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center shrink-0 w-full sm:w-auto">
            <div className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-2">
              Free Shipping Across Pakistan
            </div>
            <div className="text-3xl font-extrabold text-white">PKR 5,000+</div>
            <p className="text-xs text-slate-300 mt-2">Zero shipping fees automatically applied at checkout</p>
          </div>
        </div>
      </section>

      {/* New Arrivals & Best Sellers Tabs/Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Best Sellers */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                  Most Popular
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                  Best Sellers
                </h3>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs font-bold text-slate-600 hover:text-amber-600"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                  Fresh Inventory
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                  New Arrivals
                </h3>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs font-bold text-slate-600 hover:text-amber-600"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Verified Shoppers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              What Customers Say in Pakistan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/60 space-y-3">
              <div className="flex text-amber-400">★★★★★</div>
              <p className="text-sm text-slate-700 italic">
                "Ordered the 65W GaN charger to Lahore. Received within 2 days with proper bubble wrap packaging. Works like a charm with my laptop."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Dr. Hamza Tariq</p>
                  <p className="text-slate-500">Lahore, Punjab</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded">Verified Order</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/60 space-y-3">
              <div className="flex text-amber-400">★★★★★</div>
              <p className="text-sm text-slate-700 italic">
                "I paid via JazzCash and submitted the TRX ID. The store admin confirmed my order and sent a tracking number. Very professional and transparent!"
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Zainab Bibi</p>
                  <p className="text-slate-500">Islamabad</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded">Verified Order</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/60 space-y-3">
              <div className="flex text-amber-400">★★★★★</div>
              <p className="text-sm text-slate-700 italic">
                "The mechanical keyboard is authentic and typing experience is fantastic. Delivery was on time in Karachi with Cash on Delivery."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Bilal Ahmed</p>
                  <p className="text-slate-500">Karachi, Sindh</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded">Verified Order</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
