import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getRestaurantStatus } from "../utils/isOpenNow";
import type { OpeningHour } from "../utils/isOpenNow";

type Menu = {
  id: string;
  title: string;
  description?: string;
  type: "DAILY" | "REGULAR";
  content: any;
  price?: number | null;
  date?: string | null;
};

type Event = {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  image?: string;
};

type Restaurant = {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  openingHours: OpeningHour[];
  menus: Menu[];
  events: Event[];
  coverImage?: string | null;
  menuMode?: string;
  menuPdf?: string | null;
  menuImages?: string[] | null;
};

const days = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem('auth_token');

  const fetchFollowStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/restaurants/${id}/follow-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (err) {
      console.error("Error fetching follow status:", err);
    }
  };


  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/restaurants/${id}`);
        if (!res.ok) throw new Error("Ristorante non trovato");
        const data = await res.json();
        setRestaurant(data);
        await fetchFollowStatus();
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Errore nel caricamento dei dettagli");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id, token]);

  const handleFollowAction = async () => {
    if (!token) {
      toast.error("Accedi o registrati per seguire i ristoranti");
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`/api/restaurants/${id}/follow`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
      } else {
        const data = await res.json();
        alert(data.message || "Errore durante l'azione.");
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      alert("Errore di connessione.");
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Caricamento...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error} <br/> <Link to="/">Torna alla home</Link></div>;
  if (!restaurant) return <div style={{ padding: 40 }}>Ristorante non trovato.</div>;

  const today = new Date().getDay();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* Immersive Header / Hero */}
      <div style={{ 
        background: restaurant.coverImage 
          ? `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%), url(${restaurant.coverImage}) center/cover no-repeat`
          : 'var(--primary)', 
        color: 'white', 
        padding: '40px 0 60px',
        position: 'relative'
      }}>
        <div className="container">
          <div style={{ paddingTop: '20px' }}>
            {/* Space for the global header */}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                <h1 style={{ color: 'white', fontSize: '2.5rem', margin: 0, lineHeight: 1.1 }}>{restaurant.name}</h1>
                <div style={{ alignSelf: 'flex-start' }}>
                  {(() => {
                    const status = getRestaurantStatus(restaurant.openingHours);
                    const badgeColors = {
                      OPEN: { bg: '#10b981', text: '#ffffff', label: '🟢 Aperto ora' },
                      CLOSED: { bg: '#ef4444', text: '#ffffff', label: '🔴 Chiuso' },
                      UNKNOWN: { bg: 'rgba(255,255,255,0.2)', text: '#ffffff', label: '⚪ Orari non disponibili' }
                    };
                    const badge = badgeColors[status];
                    return (
                      <span style={{
                        background: badge.bg, 
                        color: badge.text,
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem', 
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', maxWidth: 600, marginBottom: 15 }}>{restaurant.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                <span>📍 {restaurant.address}, {restaurant.city}</span>
                {restaurant.phone && <span>📞 {restaurant.phone}</span>}
              </div>
            </div>
            <button 
              onClick={handleFollowAction}
              className="btn"
              style={{
                backgroundColor: isFollowing ? 'rgba(255,255,255,0.2)' : 'white',
                color: isFollowing ? 'white' : 'var(--primary)',
                backdropFilter: 'blur(10px)',
                borderRadius: '999px',
                padding: '10px 24px',
                border: isFollowing ? '1px solid rgba(255,255,255,0.3)' : 'none'
              }}
            >
              {isFollowing ? "✓ Seguito" : "Segui"}
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -30, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 30 }}>
          
          <section id="menu" className="card" style={{ border: 'none', borderLeft: '6px solid var(--primary)', background: '#f8fafc', scrollMarginTop: '100px' }}>
            {/* Daily Menu Section (Highlighted) */}
            {(() => {
              const now = new Date();
              const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
              const dailyItems = restaurant.menus?.filter((m: Menu) => {
                if (m.type !== "DAILY" || !m.date) return false;
                const menuDate = new Date(m.date).toISOString().split('T')[0];
                return menuDate === todayStr;
              }) || [];

              if (dailyItems.length === 0) return null;

              return (
                <div style={{ marginBottom: 40, background: '#f0fdf4', padding: 24, borderRadius: 16, border: '2px solid #22c55e' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: '1.5rem' }}>🍳</span>
                    <h2 style={{ color: '#166534', fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>Preparato Oggi</h2>
                    <span style={{ background: '#22c55e', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>SPECIALITÀ GIORNALIERA</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {dailyItems.map((m: Menu) => (
                      <div key={m.id} className="card animate-slide-up" style={{ padding: '20px', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #bbf7d0' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: '#166534' }}>{m.title}</h3>
                            {m.price && <span style={{ fontWeight: 800, color: '#15803d' }}>€{Number(m.price).toFixed(2)}</span>}
                          </div>
                          <p style={{ fontSize: '0.9rem', color: '#15803d', opacity: 0.8, margin: 0 }}>{m.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Permanent Menu Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.25rem', margin: 0 }}>
                  <span>📖</span> Menu Permanente
                </h2>
                {restaurant.menuMode === 'PDF' && restaurant.menuPdf && (
                  <a href={restaurant.menuPdf} download="menu.pdf" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    Scarica PDF
                  </a>
                )}
              </div>

              {/* Manual Mode (Regular Items) */}
              {(restaurant.menuMode === 'MANUAL' || !restaurant.menuMode) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {restaurant.menus?.filter((m: any) => m.type === "REGULAR").length > 0 ? (
                    restaurant.menus.filter((m: any) => m.type === "REGULAR").map((m: Menu) => (
                      <div key={m.id} className="card animate-slide-up" style={{ padding: '20px', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>{m.title}</h3>
                            {m.price && <span style={{ fontWeight: 800, color: 'var(--primary)' }}>€{Number(m.price).toFixed(2)}</span>}
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{m.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nessun piatto inserito nel menu permanente.</p>
                  )}
                </div>
              )}
            </div>

            {/* PDF Mode */}
            {restaurant.menuMode === 'PDF' && (
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', height: '800px' }}>
                {restaurant.menuPdf ? (
                  <iframe src={restaurant.menuPdf} style={{ width: '100%', height: '100%', border: 'none' }} title="Restaurant Menu" />
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Menu PDF non disponibile.</div>
                )}
              </div>
            )}

            {/* Images Mode */}
            {restaurant.menuMode === 'IMAGE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {restaurant.menuImages && restaurant.menuImages.length > 0 ? (
                  restaurant.menuImages.map((img, idx) => (
                    <img loading="lazy" key={idx} src={img} alt={`Menu Page ${idx + 1}`} style={{ width: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nessuna immagine del menu caricata.</p>
                )}
              </div>
            )}
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
            {/* Info + Hours */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
              <section className="card">
                <h2 style={{ fontSize: '1.1rem', marginBottom: 20, fontWeight: 700, color: 'var(--text-main)' }}>Orari di apertura</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {restaurant.openingHours && restaurant.openingHours.length > 0 ? (
                    [...restaurant.openingHours].sort((a,b) => (a.dayOfWeek === 0 ? 7 : a.dayOfWeek) - (b.dayOfWeek === 0 ? 7 : b.dayOfWeek)).map((oh) => (
                      <div key={oh.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '12px 0', 
                        borderBottom: '1px solid var(--border)',
                        fontWeight: oh.dayOfWeek === today ? 700 : 400,
                        color: oh.dayOfWeek === today ? 'var(--primary)' : 'var(--text-main)'
                      }}>
                        <span>{days[oh.dayOfWeek]}</span>
                        <span>{oh.openTime} - {oh.closeTime}</span>
                        {oh.dayOfWeek === today && <span className="badge badge-approved" style={{ fontSize: '0.6rem', marginLeft: 8, padding: '2px 6px' }}>Oggi</span>}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Orari non disponibili</p>
                  )}
                </div>
              </section>
            </div>

            {/* Events */}
            <section id="events" className="card" style={{ scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: 20, fontWeight: 700, color: 'var(--text-main)' }}>Eventi e Serate</h2>
              {restaurant.events && restaurant.events.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  {[...restaurant.events].sort((a, b) => {
                    const now = new Date().getTime();
                    const isPastA = new Date(a.date).getTime() < now;
                    const isPastB = new Date(b.date).getTime() < now;
                    if (isPastA === isPastB) {
                      return new Date(a.date).getTime() - new Date(b.date).getTime();
                    }
                    return isPastA ? 1 : -1;
                  }).map((event: Event) => {
                    const isPast = new Date(event.date).getTime() < new Date().getTime();
                    return (
                      <div key={event.id} className="card animate-slide-up" style={{ 
                        padding: '0', 
                        overflow: 'hidden', 
                        border: '1px solid var(--border)',
                        opacity: isPast ? 0.6 : 1,
                        filter: isPast ? 'grayscale(0.5)' : 'none'
                      }}>
                        {event.image && (
                          <div style={{ position: 'relative' }}>
                            <img loading="lazy" src={event.image} alt={event.title} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                            {isPast && (
                              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600 }}>
                                Evento passato
                              </div>
                            )}
                          </div>
                        )}
                        <div style={{ padding: 15 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ color: isPast ? 'var(--text-muted)' : 'var(--primary)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                              {new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} • {new Date(event.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {isPast && !event.image && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, background: '#f1f5f9', padding: '2px 6px', borderRadius: 10 }}>Evento passato</span>
                            )}
                          </div>
                          <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', fontWeight: 700 }}>{event.title}</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{event.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '30px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed var(--border)' }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>Nessun evento programmato</p>
                </div>
              )}
            </section>
          </div>


        </div>
      </div>
    </div>
  );
}

export default RestaurantDetailPage;
