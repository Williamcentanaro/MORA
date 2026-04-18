import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import RestaurantMenuPage from "./pages/RestaurantMenuPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PartnerApplyPage from "./pages/PartnerApplyPage";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerRestaurantManager from "./pages/OwnerRestaurantManager";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { Toaster } from "react-hot-toast";
import NotificationBell from "./components/NotificationBell";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";
import BottomNav from "./components/common/BottomNav";
import AppOnboarding from "./components/common/AppOnboarding";
import SplashScreen from "./components/home/SplashScreen";

import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import EventsPage from "./pages/EventsPage";

function App() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 600); // Drastically reduced from 2000ms for perceived performance
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Intercept token from URL (Classic OAuth redirect flow)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
      console.log("[AUTH-LOG] Token captured from URL");
      localStorage.setItem('auth_token', urlToken);
      
      // Clean up URL to hide token
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Force App to re-load user
      setToken(urlToken);
      window.dispatchEvent(new Event('auth-change'));
    }

    const handleAuthChange = () => {
      setToken(localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const loadUser = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (err) {
      console.error("Error loading user:", err);
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '70px', background: '#f8fafc' }}>
      <PWAInstallPrompt />
      <AppOnboarding />
      
      {/* Mobile-First Minimal Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid var(--border)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        padding: '12px 0',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/mora-logo.png" alt="MORA Logo" style={{ height: '36px', width: 'auto', borderRadius: '8px' }} />
            <h1 style={{ fontSize: '1.4rem', margin: 0, color: '#000', fontWeight: 900, letterSpacing: '-0.04em' }}>
              MORA
            </h1>
          </Link>
          
          <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {token && <NotificationBell />}
            {!token ? (
              <Link to="/login" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', background: '#fffbeb', padding: '6px 12px', borderRadius: '12px' }}>
                Accedi
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(user?.role === 'owner' || user?.role === 'RESTAURANT_OWNER') && (
                  <Link to="/owner/dashboard" style={{
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: 'white', background: 'var(--primary)', border: 'none', padding: '6px 12px', borderRadius: '12px', textDecoration: 'none', cursor: 'pointer'
                  }}>
                    <LayoutDashboard size={14} />
                    Owner
                  </Link>
                )}
                
                <Link to="/profile">
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </Link>

                <button 
                  onClick={() => {
                     localStorage.removeItem('auth_token');
                     window.location.href = '/login';
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer' }}>
                  <LogOut size={14} />
                  Esci
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/restaurants/:id/menu" element={<RestaurantMenuPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/partner/apply" element={<PartnerApplyPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/restaurants/:id" element={<OwnerRestaurantManager />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      <BottomNav user={user} />

      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '12px 20px',
          fontWeight: 600,
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        },
      }} />
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>
    </div>
  );
}

export default App;