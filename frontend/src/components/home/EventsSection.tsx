import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";

const PLACEHOLDER_EVENTS = [
  {
    id: 1,
    title: "Noche de Salsa & Bachata",
    date: "Sabato, 22 Marzo",
    location: "Milano, Via Tortona",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80"
  },
  {
    id: 2,
    title: "Festival del Taco",
    date: "Domenica, 23 Marzo",
    location: "Roma, Trastevere",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80"
  },
  {
    id: 3,
    title: "Serata Peruviana: Pisco & Ceviche",
    date: "Giovedì, 27 Marzo",
    location: "Torino, Centro",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80"
  }
];

export default function EventsSection() {
  return (
    <section style={{ padding: '100px 0', background: 'white' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '16px' }}>
            Eventi Latini Questa Settimana
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500, maxWidth: '600px', margin: '0 auto' }}>
            Non solo cibo: scopri la cultura, la musica e l'anima del Sud America.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {PLACEHOLDER_EVENTS.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
              style={{
                borderRadius: '28px',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                boxShadow: '0 15px 40px -10px rgba(0,0,0,0.12)',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              <div style={{ height: '240px', position: 'relative' }}>
                <img 
                  src={event.image} 
                  alt={event.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(255, 90, 31, 0.3)'
                }}>
                  EVENTO
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 16px 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {event.title}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                    <Calendar size={18} style={{ color: 'var(--primary)' }} />
                    <span>{event.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
                    <MapPin size={18} style={{ color: 'var(--primary)' }} />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
