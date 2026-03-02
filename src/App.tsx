import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import Products from '@/sections/Products';
import Categories from '@/sections/Categories';
import Testimonials from '@/sections/Testimonials';
import Footer from '@/sections/Footer';
import Events from '@/sections/Events';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';
import Checkout from '@/components/Checkout';
import CategoryPage from '@/components/CategoryPage';
import EventPage from '@/components/EventPage';

// ── Route detection ───────────────────────────────────────────────────────
const getPath = () => window.location.pathname;

// ══════════════════════════════════════════════════════════════════════════
// Admin shell: handles login → panel flow
// ══════════════════════════════════════════════════════════════════════════
function AdminShell() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('admin_authenticated') === 'true'
  );

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <AdminPanel
      onLogout={() => {
        sessionStorage.removeItem('admin_authenticated');
        setAuthenticated(false);
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Main store content
// ══════════════════════════════════════════════════════════════════════════
function AppContent() {
  const { i18n } = useTranslation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(getPath());

  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [i18n.language]);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(getPath());
    window.addEventListener('popstate', handlePopState);

    const handleHashChange = () => {
      if (window.location.hash === '#auth') {
        setIsAuthOpen(true);
      } else {
        setIsAuthOpen(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <h1 className="font-display text-4xl text-[#d4af37] tracking-[0.3em] animate-pulse">
            LUMIÈRE
          </h1>
          <div className="mt-4 w-32 h-[2px] bg-white/20 mx-auto overflow-hidden">
            <div className="w-full h-full bg-[#d4af37] animate-[shimmer_1s_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPath === '/admin') {
    return <AdminShell />;
  }

  if (currentPath === '/checkout') {
    return (
      <div className="bg-black min-h-screen text-white">
        <Checkout
          onBack={() => navigate('/')}
          onSuccess={() => navigate('/')}
        />
      </div>
    );
  }

  if (currentPath.startsWith('/category/')) {
    const slug = currentPath.replace('/category/', '');
    return (
      <div className="bg-black min-h-screen text-white overflow-x-hidden">
        <Navigation />
        <CategoryPage slug={slug} onBack={() => navigate('/')} />
        <Footer />
        <CartDrawer onCheckout={() => navigate('/checkout')} />
      </div>
    );
  }

  if (currentPath.startsWith('/event/')) {
    const id = currentPath.replace('/event/', '');
    return (
      <div className="bg-black min-h-screen text-white overflow-x-hidden">
        <Navigation />
        <EventPage eventId={id} onBack={() => navigate('/')} />
        <Footer />
        <CartDrawer onCheckout={() => navigate('/checkout')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />
      <main>
        <Hero />
        <Products />
        <Categories onCategoryClick={(slug) => navigate(`/category/${slug}`)} />
        <Testimonials />
        <Events onEventClick={(id) => navigate(`/event/${id}`)} />
      </main>
      <Footer />
      <CartDrawer onCheckout={() => navigate('/checkout')} />
      <AuthModal isOpen={isAuthOpen} onClose={() => {
        setIsAuthOpen(false);
        window.location.hash = '';
      }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Root
// ══════════════════════════════════════════════════════════════════════════
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
