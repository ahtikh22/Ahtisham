import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AuthPages } from './pages/AuthPages';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaticPages } from './pages/StaticPages';
import { Order } from './types/index';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [param, setParam] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  const navigate = (view: string, newParam?: string) => {
    setCurrentView(view);
    setParam(newParam);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('shop');
    setParam(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-amber-500 selection:text-white">
            <Header
              currentView={currentView}
              onNavigate={navigate}
              onSearch={handleGlobalSearch}
            />

            <main className="flex-1">
              {currentView === 'home' && <HomePage onNavigate={navigate} />}

              {currentView === 'shop' && (
                <ShopPage
                  initialCategory={param}
                  initialSearch={searchQuery}
                  onNavigate={navigate}
                />
              )}

              {currentView === 'product' && param && (
                <ProductDetailPage productId={param} onNavigate={navigate} />
              )}

              {currentView === 'cart' && <CartPage onNavigate={navigate} />}

              {currentView === 'checkout' && (
                <CheckoutPage
                  onNavigate={navigate}
                  onOrderComplete={(order) => {
                    setLastCompletedOrder(order);
                  }}
                />
              )}

              {currentView === 'order-confirmation' && (
                <OrderConfirmationPage
                  orderId={param}
                  orderData={lastCompletedOrder}
                  onNavigate={navigate}
                />
              )}

              {currentView === 'login' && (
                <AuthPages initialMode="login" onNavigate={navigate} />
              )}

              {currentView === 'register' && (
                <AuthPages initialMode="register" onNavigate={navigate} />
              )}

              {currentView === 'dashboard' && (
                <CustomerDashboard initialTab={param || 'orders'} onNavigate={navigate} />
              )}

              {currentView === 'admin' && <AdminDashboard onNavigate={navigate} />}

              {currentView === 'about' && (
                <StaticPages type="about" onNavigate={navigate} />
              )}

              {currentView === 'contact' && (
                <StaticPages type="contact" onNavigate={navigate} />
              )}

              {currentView === 'shipping-policy' && (
                <StaticPages type="shipping" onNavigate={navigate} />
              )}

              {currentView === 'returns-policy' && (
                <StaticPages type="returns" onNavigate={navigate} />
              )}

              {currentView === 'privacy-policy' && (
                <StaticPages type="privacy" onNavigate={navigate} />
              )}

              {currentView === 'terms' && (
                <StaticPages type="terms" onNavigate={navigate} />
              )}
            </main>

            <Footer onNavigate={navigate} />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
