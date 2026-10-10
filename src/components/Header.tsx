import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  MapPin,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onSearch }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemCount } = useCart();
  const { wishlistIds } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      onNavigate('shop');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Free Delivery across Pakistan on orders over PKR 5,000!</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Payment Options: COD, JazzCash, Easypaisa & Bank</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline font-mono text-amber-400">Helpline: +92 300 1234567</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-950/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900 font-heading leading-none flex items-center gap-1">
                AHTI <span className="text-amber-600">STORE</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Pakistan Online Shopping
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl mx-4 items-center relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search headphones, smartwatches, chargers, laptops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm text-slate-800 rounded-full border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <button
              onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'login', 'wishlist')}
              className="relative p-2.5 text-slate-700 hover:text-amber-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2.5 text-slate-700 hover:text-amber-600 hover:bg-slate-100 rounded-full transition-colors flex items-center"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Authentication / User Profile Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center text-xs font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          <ShieldCheck className="w-3 h-3 text-amber-600" /> STORE ADMIN
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-900 font-semibold flex items-center gap-2"
                      >
                        <SettingsIcon className="w-4 h-4 text-amber-600" /> Admin Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('dashboard', 'orders');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <Package className="w-4 h-4 text-slate-500" /> My Orders
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('dashboard', 'profile');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" /> Account Profile
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('dashboard', 'addresses');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-slate-500" /> Saved Addresses
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        onNavigate('home');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-full shadow-xs transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 pt-3 border-t border-slate-100 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-amber-600 transition-colors ${
              currentView === 'home' ? 'text-amber-600 font-bold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className={`hover:text-amber-600 transition-colors ${
              currentView === 'shop' ? 'text-amber-600 font-bold' : ''
            }`}
          >
            Shop All
          </button>
          <button
            onClick={() => onNavigate('shop', 'cat-electronics')}
            className="hover:text-amber-600 transition-colors"
          >
            Electronics
          </button>
          <button
            onClick={() => onNavigate('shop', 'cat-mobile-accessories')}
            className="hover:text-amber-600 transition-colors"
          >
            Mobile Accessories
          </button>
          <button
            onClick={() => onNavigate('shop', 'cat-computers-laptops')}
            className="hover:text-amber-600 transition-colors"
          >
            Computers & Laptops
          </button>
          <button
            onClick={() => onNavigate('shop', 'cat-fashion')}
            className="hover:text-amber-600 transition-colors"
          >
            Fashion
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`hover:text-amber-600 transition-colors ${
              currentView === 'about' ? 'text-amber-600 font-bold' : ''
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className={`hover:text-amber-600 transition-colors ${
              currentView === 'contact' ? 'text-amber-600 font-bold' : ''
            }`}
          >
            Contact Us
          </button>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products in Pakistan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2 bg-slate-100 text-sm rounded-xl border border-slate-200 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Go
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm font-medium">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('home');
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Home
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('shop');
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Shop All
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('shop', 'cat-electronics');
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Electronics
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('shop', 'cat-mobile-accessories');
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Mobile Accessories
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('shop', 'cat-computers-laptops');
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Computers & Laptops
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('shop', 'cat-fashion');
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Fashion
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('about');
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              About Us
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('contact');
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Contact Us
            </button>
          </div>

          {isAdmin && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('admin');
                }}
                className="w-full py-2 px-3 bg-amber-50 text-amber-900 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
