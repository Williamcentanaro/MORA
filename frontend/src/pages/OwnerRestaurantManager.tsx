import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import RestaurantInfoEditor from "../components/owner/RestaurantInfoEditor";
import OpeningHoursEditor from "../components/owner/OpeningHoursEditor";
import MenuEditor from "../components/owner/MenuEditor";
import EventsEditor from "../components/owner/EventsEditor";
import MediaEditor from "../components/owner/MediaEditor";

type OpeningHour = {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
};

type Menu = {
  id: string;
  title: string;
  description: string | null;
  type: 'DAILY' | 'REGULAR';
  price: number | null;
  isActive: boolean;
  date?: string | null;
};

type Event = {
  id: string;
  title: string;
  date: string;
};

type Restaurant = {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  coverImage?: string | null;
  openingHours: OpeningHour[];
  menus: Menu[];
  events: Event[];
};

function OwnerRestaurantManager() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchRestaurant();
  }, [id, token]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/owner/restaurants/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          navigate("/owner/dashboard");
          return;
        }
        if (res.status === 404) {
          throw new Error("Ristorante non trovato.");
        }
        throw new Error("Errore nel caricamento del ristorante.");
      }
      const data = await res.json();
      setRestaurant(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Caricamento...</div>;

  if (error || !restaurant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
          <div className="container">
            <Link to="/owner/dashboard" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>← Torna alla Dashboard</Link>
          </div>
        </header>
        <main className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="card" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>Errore</h2>
            <p style={{ margin: 0 }}>{error || "Ristorante non trovato"}</p>
          </div>
        </main>
      </div>
    );
  }

  const actionAreas = [
    {
       id: 'info',
       title: 'Informazioni',
       icon: '📝',
       description: 'Modifica nome, indirizzo e descrizione.',
       hasContent: true // Basic info is always there
    },
    {
       id: 'hours',
       title: 'Orari di Apertura',
       icon: '⏰',
       description: 'Gestisci gli orari di apertura e chiusura.',
       hasContent: restaurant.openingHours.length > 0
    },
    {
       id: 'menus',
       title: 'Menu e Piatti',
       icon: '🍽️',
       description: 'Aggiungi e aggiorna i tuoi menu.',
       hasContent: restaurant.menus.length > 0
    },
    {
       id: 'events',
       title: 'Eventi Speciali',
       icon: '🎉',
       description: 'Promuovi serate, degustazioni e musica.',
       hasContent: restaurant.events.length > 0
    },
    {
       id: 'media',
       title: 'Galleria Immagini',
       icon: '📸',
       description: 'Carica foto del locale e dei piatti.',
       hasContent: !!restaurant.coverImage
    }
  ];

  return (
    <div style={{ padding: '0 0 40px', background: '#f8fafc' }}>
      
      {/* Hero Summary Card */}
      <div style={{ 
        background: restaurant.coverImage 
          ? `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%), url(${restaurant.coverImage}) center/cover no-repeat`
          : 'var(--primary)', 
        color: 'white', 
        padding: '60px 20px 40px',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Link to="/owner/dashboard" style={{ 
              textDecoration: 'none', 
              color: 'white', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              background: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              backdropFilter: 'blur(4px)'
            }}>
              ← Dashboard
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            {restaurant.status === 'APPROVED' && (
              <span className="badge" style={{ backgroundColor: '#22c55e', color: 'white', fontSize: '0.75rem', padding: '4px 10px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                ✓ Approvato
              </span>
            )}
            {restaurant.status === 'PENDING' && (
              <span className="badge" style={{ backgroundColor: '#eab308', color: 'white', fontSize: '0.75rem', padding: '4px 10px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                ⏳ In Attesa di Approvazione
              </span>
            )}
            {restaurant.status === 'REJECTED' && (
              <span className="badge" style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '4px 10px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                ✕ Rifiutato
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '2.2rem', margin: '0 0 10px 0', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {restaurant.name}
          </h1>
          <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
            📍 {restaurant.address}, {restaurant.city}
          </p>
          {restaurant.status === 'REJECTED' && restaurant.rejectionReason && (
            <div style={{ marginTop: 15, background: 'rgba(239, 68, 68, 0.9)', padding: '10px 15px', borderRadius: 8, fontSize: '0.9rem', color: 'white', display: 'inline-block' }}>
              <strong>Motivo rifiuto:</strong> {restaurant.rejectionReason}
            </div>
          )}
        </div>
      </div>

      <main className="container" style={{ padding: '40px 20px', flex: 1 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-muted)' }}>Gestione Ristorante</h2>
        
        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {actionAreas.map(area => (
            <div 
              key={area.id} 
              onClick={() => setActiveTab(area.id)}
              className="card" 
              style={{ 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: area.hasContent ? '1px solid var(--border)' : '1px dashed #cbd5e1',
                background: area.hasContent ? 'white' : '#f8fafc'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <span style={{ fontSize: '2rem' }}>{area.icon}</span>
                {area.hasContent ? (
                  <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Attivo</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Da configurare</span>
                )}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{area.title}</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>{area.description}</p>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {area.hasContent ? 'Gestisci →' : '+ Aggiungi ora'}
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Edit Sections (Below Grid) */}
        {activeTab && (
          <div style={{ marginTop: '40px', borderTop: '2px solid var(--border)', paddingTop: '30px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Gestione {actionAreas.find(a => a.id === activeTab)?.title}</h2>
               <button onClick={() => setActiveTab(null)} className="btn" style={{ background: 'white', border: '1px solid var(--border)', padding: '6px 12px' }}>Chiudi Modifica ✕</button>
             </div>
             
             {activeTab === 'info' && <RestaurantInfoEditor restaurant={restaurant} token={token || ""} onUpdate={fetchRestaurant} />}
             {activeTab === 'hours' && <OpeningHoursEditor restaurant={restaurant} token={token || ""} onUpdate={fetchRestaurant} />}
             {activeTab === 'menus' && <MenuEditor restaurant={restaurant} token={token || ""} onUpdate={fetchRestaurant} />}
             {activeTab === 'events' && <EventsEditor restaurant={restaurant} token={token || ""} onUpdate={fetchRestaurant} />}
             {activeTab === 'media' && <MediaEditor restaurant={restaurant} token={token || ""} onUpdate={fetchRestaurant} />}
          </div>
        )}

      </main>
    </div>
  );
}

export default OwnerRestaurantManager;
