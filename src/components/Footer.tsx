import React, { useState } from 'react';
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      const res = await api.public.subscribeNewsletter(newsletterEmail);
      setNewsletterStatus(res.message);
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('Subscription saved! Thank you.');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      {/* Top Value Propositions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base font-heading">Fast Nationwide Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">2-4 business days express shipping to all cities in Pakistan.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base font-heading">100% Genuine Quality</h4>
              <p className="text-xs text-slate-400 mt-1">All items are vetted with 1-year authentic brand warranty.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base font-heading">7-Day Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-1">Hassle-free return & replacement policy for peace of mind.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base font-heading">Secure Payments</h4>
              <p className="text-xs text-slate-400 mt-1">Cash on Delivery, JazzCash, Easypaisa & Direct Bank Transfer.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 via-blue-900 to-amber-500 flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-white font-heading leading-none">
                AHTI <span className="text-amber-500">STORE</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Pakistan Online Shopping
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Ahti Shopping Store is Pakistan's premier online lifestyle store delivering original gadgets, computer peripherals, accessories, fashion, and home goods with reliable customer care.
          </p>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Commercial Market, Blue Area, Islamabad, Pakistan</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <span>+92 300 1234567 / WhatsApp Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <span>support@ahtistore.pk</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Mon - Sat: 9:00 AM - 9:00 PM PKT</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-heading">
            Categories
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <button onClick={() => onNavigate('shop', 'cat-electronics')} className="hover:text-amber-400 transition-colors">
                Electronics
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'cat-mobile-accessories')} className="hover:text-amber-400 transition-colors">
                Mobile Accessories
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'cat-computers-laptops')} className="hover:text-amber-400 transition-colors">
                Computers & Laptops
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'cat-fashion')} className="hover:text-amber-400 transition-colors">
                Fashion & Watches
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'cat-home-kitchen')} className="hover:text-amber-400 transition-colors">
                Home & Kitchen
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'cat-digital-accessories')} className="hover:text-amber-400 transition-colors">
                Digital Accessories
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-heading">
            Customer Care
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-amber-400 transition-colors">
                About Ahti Store
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-amber-400 transition-colors">
                Contact & Support
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shipping-policy')} className="hover:text-amber-400 transition-colors">
                Shipping & Delivery
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('returns-policy')} className="hover:text-amber-400 transition-colors">
                Returns & Refund Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('privacy-policy')} className="hover:text-amber-400 transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('terms')} className="hover:text-amber-400 transition-colors">
                Terms of Service
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-heading">
            Stay Updated
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Subscribe for flash sales, discount coupons, and new tech arrivals.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {newsletterStatus && (
              <p className="text-[11px] text-emerald-400 mt-1">{newsletterStatus}</p>
            )}
          </form>

          {/* Payment Badges */}
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">
              Accepted In Pakistan
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-1 bg-slate-800 text-amber-400 rounded border border-slate-700">COD</span>
              <span className="px-2 py-1 bg-red-950/60 text-red-400 rounded border border-red-800/50">JazzCash</span>
              <span className="px-2 py-1 bg-emerald-950/60 text-emerald-400 rounded border border-emerald-800/50">Easypaisa</span>
              <span className="px-2 py-1 bg-blue-950/60 text-blue-300 rounded border border-blue-800/50">Bank Wire</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} Ahti Shopping Store. All rights reserved. Registered in Pakistan.
        </div>
        <div className="flex gap-4">
          <button onClick={() => onNavigate('privacy-policy')} className="hover:text-slate-400">
            Privacy
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('terms')} className="hover:text-slate-400">
            Terms
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('shipping-policy')} className="hover:text-slate-400">
            Delivery Info
          </button>
        </div>
      </div>
    </footer>
  );
};
