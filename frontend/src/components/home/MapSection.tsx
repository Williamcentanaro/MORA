import { motion } from "framer-motion";
import MapComponent from "../MapComponent";

interface MapSectionProps {
  restaurants: any[];
  userLocation: { latitude: number; longitude: number; timestamp?: number } | null;
}

export default function MapSection({ restaurants, userLocation }: MapSectionProps) {
  return (
    <section id="map-section" style={{ padding: '80px 0', background: '#fcfcfc' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'white',
            padding: '40px',
            borderRadius: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
            border: '1px solid var(--border)'
          }}
        >
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '12px' }}>
              Ristoranti Latinoamericani Vicino a Te
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
              Esplora la mappa per trovare il locale perfetto per la tua serata.
            </p>
          </div>

          <div style={{ borderRadius: '24px', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 0 0 1px var(--border)' }}>
            <MapComponent 
              restaurants={restaurants} 
              userLocation={userLocation} 
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
