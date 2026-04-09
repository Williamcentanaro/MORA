import { useEffect, useState, useMemo } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PartnerApplyPage from "./pages/PartnerApplyPage";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerRestaurantManager from "./pages/OwnerRestaurantManager";
import ProfilePage from "./pages/ProfilePage";
import { calculateDistance } from "./utils/distance";
import { getRestaurantStatus } from "./utils/isOpenNow";
import type { OpeningHour } from "./utils/isOpenNow";
import { Toaster } from "react-hot-toast";
import NotificationBell from "./components/NotificationBell";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";

const CUISINE_MAP: Record<string, string> = {
  "messico": "Mexican",
  "argentina": "Argentinian",
  "brasile": "Brazilian",
  "colombia": "Colombian",
  "perù": "Peruvian",
  "venezuela": "Venezuelan",
  "cile": "Other",
  "ecuador": "Ecuadorian",
  "bolivia": "Other",
  "paraguay": "Other",
  "uruguay": "Other",
  "cuba": "Cuban",
  "rep. dominicana": "Other",
  "puerto rico": "Other",
  "guatemala": "Other",
  "honduras": "Other",
  "el salvador": "Other",
  "nicaragua": "Other",
  "costa rica": "Other",
  "panama": "Other",
};

// New premium components
import HeroSection from "./components/home/HeroSection";
import CuisineBubbles from "./components/home/CuisineBubbles";
import PopularRestaurants from "./components/home/PopularRestaurants";
import MapSection from "./components/home/MapSection";
import EventsSection from "./components/home/EventsSection";
import CtaSection from "./components/home/CtaSection";
import SplashScreen from "./components/home/SplashScreen";

type Restaurant = {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number;
  openingHours?: OpeningHour[];
  coverImage?: string | null;
  cuisineType?: string | null;
};

function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | "">("");
  
  // Geolocation states
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; timestamp?: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'loading' | 'success' | 'denied' | 'unsupported'>('prompt');



  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now()
        });
        setLocationStatus('success');
        
        // UX Fix: Scroll to map after short delay to ensure map centering has started
        setTimeout(() => {
          const mapSection = document.getElementById('map-section');
          if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 600);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const loadRestaurants = async (currentLocation: { latitude: number; longitude: number } | null) => {
    try {
      setLoading(true);
      const res = await fetch("/api/restaurants");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let data: Restaurant[] = await res.json();
      
      if (!Array.isArray(data)) data = [];

      // Calculate distances if user location is available
      if (currentLocation) {
        data = data.map(r => {
          if (r.latitude != null && r.longitude != null) {
            return {
              ...r,
              distance: calculateDistance(
                currentLocation.latitude, 
                currentLocation.longitude, 
                r.latitude, 
                r.longitude
              )
            };
          }
          return r;
        });

        // Sort by distance (those with distance first, then others)
        data.sort((a, b) => {
          if (a.distance != null && b.distance != null) return a.distance - b.distance;
          if (a.distance != null) return -1;
          if (b.distance != null) return 1;
          return 0;
        });
      }

      setRestaurants(data);
    } catch (err) {
      console.error(err);
      setError("Errore nel caricamento dei ristoranti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Reload restaurants when location changes
  useEffect(() => {
    loadRestaurants(userLocation);
  }, [userLocation]);



  // Extract unique cities from data safely
  const availableCities = useMemo(() => {
    const cities = restaurants.map(r => r.city).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [restaurants]);

  // Apply filters
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      // 1. Text Search (Name or Address)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(query);
        const matchAddress = r.address.toLowerCase().includes(query);
        const matchDesc = r.description?.toLowerCase().includes(query);
        
        // Exact mapping from CuisineBubbles
        const mappedCuisine = CUISINE_MAP[query];
        const matchCuisine = mappedCuisine ? r.cuisineType === mappedCuisine : r.cuisineType?.toLowerCase() === query;

        if (!matchName && !matchAddress && !matchDesc && !matchCuisine) return false;
      }

      // 2. City Filter
      if (selectedCity && r.city !== selectedCity) return false;

      // 3. Open Now Filter
      if (openNowOnly) {
        if (getRestaurantStatus(r.openingHours) !== 'OPEN') return false;
      }

      // 4. Distance Filter (only if user location is available and a distance is set)
      if (maxDistance !== "" && r.distance != null) {
        if (r.distance > maxDistance) return false;
      }

      return true;
    });
  }, [restaurants, searchQuery, selectedCity, openNowOnly, maxDistance]);


  return (
    <>
        <HeroSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          openNowOnly={openNowOnly}
          setOpenNowOnly={setOpenNowOnly}
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          locationStatus={locationStatus}
          availableCities={availableCities}
          detectLocation={detectLocation}
        />

        <CuisineBubbles 
          selectedCuisine={searchQuery}
          onSelectCuisine={(cuisine) => setSearchQuery(cuisine === searchQuery ? "" : cuisine)}
        />

        {error ? (
          <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ color: 'var(--danger)', background: '#fee2e2', padding: '40px', borderRadius: '24px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>⚠️</div>
              <h3 style={{ fontWeight: 800, marginBottom: 12 }}>Ops! Si è verificato un errore</h3>
              <p>{error}</p>
              <button onClick={() => loadRestaurants(userLocation)} className="btn btn-primary" style={{ marginTop: 24 }}>Riprova</button>
            </div>
          </div>
        ) : (
          <>
            <MapSection 
              restaurants={filteredRestaurants}
              userLocation={userLocation}
            />

            <PopularRestaurants 
              loading={loading}
              restaurants={filteredRestaurants}
              title={searchQuery || selectedCity || openNowOnly || maxDistance ? "Risultati Ricerca" : (userLocation ? "Vicino a te" : "I migliori locali")}
              subtitle={searchQuery || selectedCity || openNowOnly || maxDistance ? `Abbiamo trovato ${filteredRestaurants.length} ristoranti per i tuoi criteri.` : "I ristoranti più amati della nostra community."}
            />

            <EventsSection />

            <CtaSection />
          </>
        )}
    </>
  );
}

function App() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PWAInstallPrompt />
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid var(--border)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        padding: '16px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src="/mora-logo.png" alt="MORA Logo" style={{ height: '40px', width: 'auto', borderRadius: '8px' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#000', fontWeight: 900, letterSpacing: '-0.04em' }}>MORA</h1>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Taste the Excellence</span>
            </div>
          </Link>
          
          <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {token && <NotificationBell />}
            {user?.role === 'ADMIN' && (
              <Link to="/admin/dashboard" className="badge badge-rejected" style={{ textDecoration: 'none' }}>Admin</Link>
            )}
            {user?.role === 'OWNER' && (
              <Link to="/owner/dashboard" className="badge badge-approved" style={{ textDecoration: 'none', background: 'var(--success)' }}>Dashboard</Link>
            )}
            {token && (
              <Link to="/profile" className="btn" style={{ textDecoration: 'none', fontSize: '0.9rem', color: 'var(--text-main)', padding: '10px 16px', background: '#f1f5f9', borderRadius: '12px' }}>Profilo</Link>
            )}
            {!token ? (
              <Link to="/login" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '12px' }}>Accedi</Link>
            ) : (
              <button onClick={handleLogout} className="btn" style={{ padding: '10px 16px', fontSize: '0.9rem', background: '#f8fafc', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                Esci
              </button>
            )}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/partner/apply" element={<PartnerApplyPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/restaurants/:id" element={<OwnerRestaurantManager />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      <footer style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '80px 0 40px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '20px' }}>MORA</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>La tua guida definitiva alla scoperta dell'eccellenza culinaria e della cultura internazionale.</p>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Link Utili</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><Link to="/partner/apply" style={{ color: 'var(--text-muted)' }}>Diventa Partner</Link></li>
                <li><Link to="/login" style={{ color: 'var(--text-muted)' }}>Accedi</Link></li>
                <li><Link to="/register" style={{ color: 'var(--text-muted)' }}>Registrati</Link></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p>© 2026 MORA - Taste the Excellence. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>

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