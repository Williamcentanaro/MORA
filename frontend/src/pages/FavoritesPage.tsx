import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, Trash2, ChevronRight, Clock, Filter, Heart
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getRestaurantStatus } from "../utils/isOpenNow";
import type { OpeningHour } from "../utils/isOpenNow";

type Restaurant = {
  id: string;
  name: string;
  city: string;
  coverImage?: string | null;
  openingHours: OpeningHour[];
  hasTodayMenu: boolean;
};

const LoadingSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
    {[1, 2, 3].map(i => (
      <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', height: '420px', background: 'white', border: '1px solid #f1f5f9' }}>
        <div className="skeleton" style={{ height: '220px', borderRadius: 0 }} />
        <div style={{ padding: '24px' }}>
          <div className="skeleton" style={{ height: '24px', width: '70%', marginBottom: '12px' }} />
          <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '24px' }} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="skeleton" style={{ height: '48px', flex: 2, borderRadius: '14px' }} />
            <div className="skeleton" style={{ height: '48px', flex: 1, borderRadius: '14px' }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

function FavoritesPage() {
  const [followedRestaurants, setFollowedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "status">("name");
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/restaurants/followed", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFollowedRestaurants(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Errore nel caricamento dei favoriti");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (restaurantId: string) => {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/follow`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Rimosso dai preferiti");
        setFollowedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      }
    } catch (err) {
      toast.error("Errore di connessione");
    }
  };

  const filteredRestaurants = followedRestaurants
    .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.city.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const statusA = getRestaurantStatus(a.openingHours);
      const statusB = getRestaurantStatus(b.openingHours);
      if (statusA === "OPEN" && statusB !== "OPEN") return -1;
      if (statusA !== "OPEN" && statusB === "OPEN") return 1;
      return 0;
    });

  return (
    <div style={{ backgroundColor: '#fdfcfe', minHeight: '100vh', padding: '40px 0 100px' }}>
      <div className="container">
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
             <div style={{ 
               width: '42px', height: '42px', borderRadius: '12px', 
               background: 'linear-gradient(135deg, var(--primary) 0%, #ff6b6b 100%)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
             }}>
               <Heart size={22} fill="currentColor" />
             </div>
             <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Favoriti</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>Tutti i locali che segui su MORA.</p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Cerca tra i tuoi locali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '16px 16px 16px 52px',
                fontSize: '1rem',
                fontWeight: 600,
                outline: 'none',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                appearance: 'none',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '16px 40px 16px 44px',
                fontSize: '0.95rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
                minWidth: '180px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
              }}
            >
              <option value="name">Alfabetico</option>
              <option value="status">Aperti ora</option>
            </select>
          </div>
        </div>

        {loading ? <LoadingSkeleton /> : (
          <AnimatePresence mode="popLayout">
            {followedRestaurants.length > 0 ? (
              filteredRestaurants.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
                  {filteredRestaurants.map((restaurant, idx) => {
                    const status = getRestaurantStatus(restaurant.openingHours);
                    const isOpen = status === 'OPEN';
                    return (
                      <motion.div
                        key={restaurant.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="card"
                        style={{ 
                          padding: 0, borderRadius: '24px', overflow: 'hidden', 
                          background: 'white', border: '1px solid #f1f5f9',
                          display: 'flex', flexDirection: 'column',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                          <img 
                            src={restaurant.coverImage || '/mora-logo.png'} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            alt={restaurant.name} 
                          />
                          <div style={{ 
                            position: 'absolute', top: 16, left: 16, 
                            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)',
                            padding: '6px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 
                          }}>
                            {restaurant.city}
                          </div>
                          <button 
                              onClick={() => handleUnfollow(restaurant.id)}
                              style={{ 
                                position: 'absolute', top: 16, right: 16, 
                                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)',
                                border: 'none', color: '#ef4444', width: 38, height: 38, 
                                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                          >
                              <Trash2 size={18} />
                          </button>
                        </div>
                        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#1e293b' }}>{restaurant.name}</h3>
                              <span style={{ 
                                fontSize: '0.65rem', fontWeight: 800, color: isOpen ? '#166534' : '#64748b', 
                                background: isOpen ? '#dcfce7' : '#f1f5f9', padding: '4px 8px', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', gap: '4px'
                              }}>
                                <Clock size={12} />
                                {isOpen ? 'Aperto' : 'Chiuso'}
                              </span>
                          </div>
                          
                          <div style={{ marginTop: 'auto' }}>
                            <Link 
                              to={`/restaurants/${restaurant.id}`} 
                              className="btn btn-primary" 
                              style={{ 
                                width: '100%', textAlign: 'center', textDecoration: 'none', 
                                padding: '14px', borderRadius: '16px', fontSize: '0.95rem', 
                                fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                              }}
                            >
                              Vedi Locale
                              <ChevronRight size={18} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                   <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
                   <h3 style={{ fontWeight: 800, color: '#1e293b' }}>Nessun risultato</h3>
                   <p style={{ color: '#64748b' }}>Prova a cambiare i termini di ricerca.</p>
                   <button onClick={() => setSearchQuery("")} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>Resetta</button>
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '40px', border: '2px dashed #e2e8f0' }}>
                <div style={{ fontSize: '5rem', marginBottom: '32px' }}>🍽️</div>
                <h2 style={{ fontWeight: 900, color: '#1e293b', marginBottom: '12px' }}>Nessun preferito</h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                  Esplora i migliori locali della tua zona e aggiungili qui per trovarli subito.
                </p>
                <Link to="/" className="btn btn-primary" style={{ padding: '16px 40px', borderRadius: '18px', fontWeight: 800, display: 'inline-block', textDecoration: 'none' }}>Scopri ora</Link>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
