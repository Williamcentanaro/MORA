import RestaurantCard from "./RestaurantCard";
import { motion } from "framer-motion";

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number;
  openingHours?: any[];
  coverImage?: string | null;
}

interface PopularRestaurantsProps {
  restaurants: Restaurant[];
  title: string;
  subtitle?: string;
  loading: boolean;
}

export default function PopularRestaurants({ restaurants, title, subtitle, loading }: PopularRestaurantsProps) {
  if (loading) {
    return (
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '40px' }}>
            <div className="skeleton" style={{ width: '300px', height: '32px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ width: '450px', height: '20px' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', border: 'none' }}>
                <div className="skeleton" style={{ width: '100%', height: '220px', borderRadius: 0 }}></div>
                <div style={{ padding: '24px' }}>
                  <div className="skeleton" style={{ width: '70%', height: '24px', marginBottom: '12px' }}></div>
                  <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '24px' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton" style={{ width: '100px', height: '24px', borderRadius: '12px' }}></div>
                    <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '12px' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '60px 0' }}>
      <div className="container">
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.04em' }}>{title}</h2>
            {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
             <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>({restaurants.length} locali trovati)</span>
          </div>
        </div>

        {restaurants.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              padding: '100px 20px', 
              textAlign: 'center', 
              background: '#f8fafc', 
              borderRadius: '32px',
              border: '2px dashed #e2e8f0'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🏜️</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Nessun ristorante trovato</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
              Purtroppo non abbiamo trovato locali che corrispondano ai tuoi filtri. Prova a resettarli o a cambiare zona.
            </p>
          </motion.div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '32px' 
          }}>
            {restaurants.map((r, index) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RestaurantCard restaurant={r} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
