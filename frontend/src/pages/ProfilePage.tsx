import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getRestaurantStatus } from "../utils/isOpenNow";
import type { OpeningHour } from "../utils/isOpenNow";
import { usePushNotifications } from "../hooks/usePushNotifications";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

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

function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [followedRestaurants, setFollowedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isSubscribed, permissionState, loading: pushLoading, subscribe, unsubscribe } = usePushNotifications();

  const token = localStorage.getItem('auth_token');

  const fetchData = async () => {
    if (!token) {
      setError("Richiesto login");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [userRes, followsRes] = await Promise.all([
        fetch("/api/auth/me", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/restaurants/followed", { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      } else {
        throw new Error("Impossibile caricare i dati utente");
      }

      if (followsRes.ok) {
        const followsData = await followsRes.json();
        setFollowedRestaurants(followsData);
      }
    } catch (err: any) {
      console.error(err);
      setError("Si è verificato un errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnfollow = async (restaurantId: string) => {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/follow`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Locale rimosso dai seguiti");
        setFollowedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      } else {
        toast.error("Errore durante l'azione");
      }
    } catch (err) {
      console.error(err);
      toast.error("Errore di connessione");
    }
  };

  if (error) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px', background: '#fff', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '4rem', marginBottom: 20, display: 'block' }}>🔐</span>
          <h2 style={{ marginBottom: 12, fontWeight: 900 }}>Accesso richiesto</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '1.1rem' }}>{error}</p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '14px 40px', borderRadius: '16px' }}>Vai al Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fdfcfe', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Premium Header Section */}
      <div className="profile-header-section" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
        padding: '100px 0 80px', 
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.3 }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: '#ff6b6b', filter: 'blur(150px)', opacity: 0.2 }} />

        <div className="container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="profile-card"
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              backdropFilter: 'blur(20px)', 
              borderRadius: '32px', 
              padding: '40px',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '40px',
              flexWrap: 'wrap',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="profile-card-inner">
              <div 
                className="profile-avatar"
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  background: 'linear-gradient(45deg, var(--primary), #ff6b6b)', 
                  borderRadius: '30px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '3.5rem',
                  color: 'white',
                  fontWeight: 900,
                  boxShadow: '0 10px 30px rgba(255,51,102,0.3)',
                  border: '4px solid rgba(255,255,255,0.2)'
                }}
              >
                {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h1 className="profile-name" style={{ margin: 0, fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'white' }}>{user?.name || "Utente"}</h1>
                    <span 
                      className="profile-badge"
                      style={{ 
                        background: 'linear-gradient(to right, #fbbf24, #f59e0b)', 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '0.7rem', 
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#451a03',
                        boxShadow: '0 4px 12px rgba(245,158,11,0.2)'
                      }}
                    >
                      ✨ Food Explorer
                    </span>
                    <button 
                      onClick={() => {
                        if (permissionState === 'denied') {
                          toast.error("Permesso negato. Abilita le notifiche nelle impostazioni del browser.");
                          return;
                        }
                        isSubscribed ? unsubscribe() : subscribe();
                      }}
                      disabled={pushLoading}
                      className="profile-badge"
                      style={{
                        background: permissionState === 'denied' ? 'rgba(239, 68, 68, 0.2)' : (isSubscribed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)'),
                        border: `1px solid ${permissionState === 'denied' ? '#ef4444' : 'rgba(255, 255, 255, 0.2)'}`,
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: permissionState === 'denied' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {pushLoading ? '...' : (permissionState === 'denied' ? '🚫 Permesso' : (isSubscribed ? '🔔 ON' : '🔕 OFF'))}
                    </button>
                  </div>
                <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.7, fontWeight: 500 }}>{user?.email}</p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '24px' }}>
                  <div>
                    <span className="profile-stats-value" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900 }}>{followedRestaurants.length}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600, textTransform: 'uppercase' }}>Locali Seguiti</span>
                  </div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <div>
                    <span className="profile-stats-value" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900 }}>Account</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600, textTransform: 'uppercase' }}>{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              I tuoi locali seguiti
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>
              Gestisci i ristoranti che ami e resta aggiornato sulle loro novità.
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <AnimatePresence mode="popLayout">
            {followedRestaurants.length > 0 ? (
              <motion.div 
                layout
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}
              >
                {followedRestaurants.map((restaurant, idx) => {
                  const status = getRestaurantStatus(restaurant.openingHours);
                  const isOpen = status === 'OPEN';

                  return (
                    <motion.div
                      key={restaurant.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      transition={{ delay: idx * 0.05 }}
                      className="card"
                      style={{ 
                        padding: 0, 
                        overflow: 'hidden', 
                        display: 'flex', 
                        flexDirection: 'column',
                        border: '1px solid #f1f5f9',
                        borderRadius: '24px',
                        background: 'white',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                        <img 
                          src={restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'} 
                          alt={restaurant.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                        />
                        <div style={{ 
                          position: 'absolute', 
                          top: '16px', 
                          left: '16px',
                          display: 'flex',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            background: isOpen ? '#22c55e' : '#64748b', 
                            color: 'white', 
                            padding: '6px 12px', 
                            borderRadius: '12px', 
                            fontSize: '0.7rem', 
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}>
                            {isOpen ? 'Aperto ora' : 'Chiuso'}
                          </span>
                          {restaurant.hasTodayMenu && (
                            <span style={{ 
                              background: 'var(--primary)', 
                              color: 'white', 
                              padding: '6px 12px', 
                              borderRadius: '12px', 
                              fontSize: '0.7rem', 
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                              Menu del giorno ✨
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '20px' }}>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>{restaurant.name}</h3>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📍 {restaurant.city}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                          <Link 
                            to={`/restaurants/${restaurant.id}`} 
                            className="btn btn-primary" 
                            style={{ 
                              flex: 2, 
                              textAlign: 'center', 
                              fontSize: '0.95rem', 
                              fontWeight: 700,
                              padding: '14px',
                              borderRadius: '14px'
                            }}
                          >
                            Vai al ristorante
                          </Link>
                          <button 
                            onClick={() => handleUnfollow(restaurant.id)} 
                            className="btn" 
                            style={{ 
                              flex: 1,
                              background: '#fef2f2', 
                              color: '#ef4444', 
                              border: 'none',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              padding: '14px',
                              borderRadius: '14px'
                            }}
                          >
                            Rimuovi
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  textAlign: 'center', 
                  padding: '100px 40px', 
                  backgroundColor: 'white', 
                  borderRadius: '40px',
                  border: '2px dashed #e2e8f0',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ fontSize: '5rem', marginBottom: '32px' }}>🍽️</div>
                <h3 style={{ fontWeight: 900, fontSize: '1.8rem', marginBottom: '12px', color: '#1e293b' }}>Non segui ancora nessun locale</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 32px' }}>
                  Inizia a esplorare i migliori locali intorno a te e aggiungili ai tuoi preferiti!
                </p>
                <Link to="/" className="btn btn-primary" style={{ padding: '16px 40px', borderRadius: '18px', fontSize: '1.1rem', fontWeight: 700 }}>Scopri ristoranti</Link>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
        .card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
          border-color: var(--primary-light) !important;
        }
        .card:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;
