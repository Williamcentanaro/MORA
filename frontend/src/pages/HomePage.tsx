import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import CuisineBubbles from "../components/home/CuisineBubbles";
import { Search, Map } from "lucide-react";

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
  
  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/restaurants");
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

  useEffect(() => {
    // Note: To keep things ultra fast on home, we load restaurants without waiting for geolocation.
    loadRestaurants();
  }, []);

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
      return true;
    });
  }, [restaurants, searchQuery]);

  const navigate = useNavigate();
  const handleOpenMap = () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      navigate(`/map?${params.toString()}`);
  }

  return (
    <div style={{ paddingTop: '0px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Clean Mobile-First Search Header */}
      <div style={{ background: 'white', padding: '16px 20px', borderBottom: '1px solid var(--border)', position: 'sticky', top: '65px', zIndex: 90 }}>
          <div className="container" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca un ristorante, un piatto o una città..."
                  style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '1rem', background: '#f8fafc', fontWeight: 500 }}
                />
              </div>
              
              <button 
                onClick={handleOpenMap}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                  padding: '0 20px', borderRadius: '16px', fontSize: '0.95rem', fontWeight: 700,
                  background: 'white', color: 'var(--text-main)', 
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s', cursor: 'pointer'
                }}
              >
                <Map size={18} />
                <span className="hide-on-mobile">Mappa</span>
              </button>
          </div>
      </div>

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
    </div>
  );
}
