import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import CuisineBubbles from "../components/home/CuisineBubbles";
import { Search, Map } from "lucide-react";
import FilterChips from "../components/home/FilterChips";
import CtaSection from "../components/home/CtaSection";
import FilterModal from "../components/home/FilterModal";
import { getRestaurantStatus } from "../utils/isOpenNow";

const PopularRestaurants = lazy(() => import("../components/home/PopularRestaurants"));

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
  openingHours?: any[];
  logo?: string | null;
  cuisineType?: string | null;
  reviewsCount?: number;
  averageRating?: number;
};

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

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  
  // New Filter state
  const [minRating, setMinRating] = useState<number | null>(null);
  const [openNow, setOpenNow] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const loadRestaurants = async (query?: string, price?: number | null) => {
    try {
      setLoading(true);
      let url = "/api/restaurants?limit=50";
      if (query) url += `&search=${encodeURIComponent(query)}`;
      if (price) url += `&maxPrice=${price}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let data: Restaurant[] = await res.json();
      if (!Array.isArray(data)) data = [];
      setRestaurants(data);
    } catch (err) {
      console.error(err);
      setError("Errore nel caricamento dei ristoranti");
    } finally {
      setLoading(false);
    }
  };

  // Effect for initial load and filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
        loadRestaurants(searchQuery, maxPrice);
    }, searchQuery ? 400 : 0); // Debounce if typing

    return () => clearTimeout(timer);
  }, [searchQuery, maxPrice]);

  const filteredRestaurants = useMemo(() => {
    let result = restaurants;

    return result.filter(r => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(query);
        const matchAddress = r.address.toLowerCase().includes(query);
        const matchDesc = r.description?.toLowerCase().includes(query);
        const mappedCuisine = CUISINE_MAP[query];
        const matchCuisine = mappedCuisine ? r.cuisineType === mappedCuisine : r.cuisineType?.toLowerCase().includes(query);

        if (!matchName && !matchAddress && !matchDesc && !matchCuisine) return false;
      }
      
      if (minRating && (typeof r.averageRating !== 'number' || r.averageRating < minRating)) return false;
      if (maxDistance && r.distance && r.distance > maxDistance) return false;
      if (openNow && getRestaurantStatus(r.openingHours) !== 'OPEN') return false;
      
      // maxPrice and searchQuery matched items are already filtered by backend
      // so we don't need additional client-side checks for those specific fields.
      
      return true;
    });
  }, [restaurants, searchQuery, minRating, maxDistance, openNow]);

  const navigate = useNavigate();
  const handleOpenMap = () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      navigate(`/map?${params.toString()}`);
  }

  const handleClearAll = () => {
    setSearchQuery("");
    setMinRating(null);
    setOpenNow(false);
    setMaxDistance(null);
    setMaxPrice(null);
  };

  return (
    <div style={{ paddingTop: '0px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Premium Ambient Video Header */}
      <div style={{ padding: '16px 20px 0', background: 'white' }}>
        <div style={{ width: '100%', height: '160px', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', zIndex: 1 }} />
          <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 2, color: 'white' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Cerca e prenota</h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0, fontWeight: 500 }}>Esplora, degusta e vivi nuove esperienze</p>
          </div>
        </div>
      </div>

      {/* Clean Mobile-First Search Header */}
      <div style={{ background: 'white', padding: '16px 20px', borderBottom: '1px solid var(--border)', position: 'sticky', top: '65px', zIndex: 90 }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca piatto, ristorante o città..."
                    style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '20px', border: '1px solid transparent', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '1rem', background: '#f8fafc', fontWeight: 600, color: 'var(--text-main)', transition: 'all 0.3s' }}
                  />
                </div>
                
                <button 
                  onClick={handleOpenMap}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                    padding: '0 16px', borderRadius: '20px', fontSize: '0.95rem', fontWeight: 700,
                    background: 'var(--primary)', color: 'white', 
                    border: 'none', boxShadow: '0 4px 12px rgba(255, 90, 31, 0.2)',
                    transition: 'all 0.2s', cursor: 'pointer'
                  }}
                >
                  <Map size={20} />
                </button>
            </div>
            
            <FilterChips 
              minRating={minRating} setMinRating={setMinRating}
              openNow={openNow} setOpenNow={setOpenNow}
              maxDistance={maxDistance} setMaxDistance={setMaxDistance}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              onOpenFilterModal={() => setIsFilterModalOpen(true)}
              onClearAll={handleClearAll}
            />
          </div>
      </div>

      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)}
        minRating={minRating} setMinRating={setMinRating}
        openNow={openNow} setOpenNow={setOpenNow}
        maxDistance={maxDistance} setMaxDistance={setMaxDistance}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
      />

      <CuisineBubbles 
        selectedCuisine={searchQuery}
        onSelectCuisine={(cuisine) => {
           setSearchQuery(cuisine === searchQuery ? "" : cuisine);
           setSearchParams(cuisine === searchQuery ? {} : { search: cuisine });
        }}
      />

      <div style={{ flex: 1 }}>
        {error ? (
          <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ color: 'var(--danger)', background: '#fee2e2', padding: '40px', borderRadius: '24px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>⚠️</div>
              <h3 style={{ fontWeight: 800, marginBottom: 12 }}>Ops! Si è verificato un errore</h3>
              <p>{error}</p>
              <button onClick={() => loadRestaurants()} className="btn btn-primary" style={{ marginTop: 24 }}>Riprova</button>
            </div>
          </div>
        ) : (
          <Suspense fallback={<div style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Caricamento...</div>}>
            <PopularRestaurants 
              loading={loading}
              restaurants={filteredRestaurants}
              title={searchQuery ? "Risultati Ricerca" : "Esplora i Ristoranti"}
              subtitle={searchQuery ? `Abbiamo trovato ${filteredRestaurants.length} ristoranti.` : "Scegli l'autenticità dei sapori vicino a te."}
            />
          </Suspense>
        )}
      </div>

      <CtaSection />
    </div>
  );
}
