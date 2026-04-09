import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Utensils, Rocket, Heart } from "lucide-react";

export default function CtaSection() {
  return (
    <section style={{ padding: '120px 0', background: 'linear-gradient(135deg, #FF5A1F 0%, #E63946 100%)', color: 'white', overflow: 'hidden', position: 'relative' }}>
      {/* Decorative background elements */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '80px' }}
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', bottom: '-150px', left: '-50px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '120px' }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '80px', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
              Hai un ristorante latino? 🌮
            </h2>
            <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '48px', lineHeight: 1.6, fontWeight: 500 }}>
              Unisciti alla nostra community e porta la tua cucina sotto i riflettori. Aiutiamo migliaia di persone a scoprire i veri sapori dell'America Latina.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px' }}>
                  <Rocket size={24} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Più visibilità</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px' }}>
                  <Heart size={24} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Sostegno culturale</span>
              </div>
            </div>

            <Link to="/partner/apply" className="btn" style={{ 
              background: 'white', 
              color: 'var(--primary)', 
              padding: '20px 48px', 
              fontSize: '1.15rem', 
              fontWeight: 900, 
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              transition: 'all 0.3s'
            }}>
              <Utensils size={20} />
              Diventa Partner
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
          >
            <div style={{ 
              width: '100%', 
              maxWidth: '500px', 
              aspectRatio: '1/1',
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '40px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=800&q=80" 
                alt="Chef Latin Food"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }}
              />
            </div>
            {/* Floating badge */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: 'absolute',
                top: '-30px',
                right: '-10px',
                background: 'var(--accent)',
                color: 'var(--text-main)',
                padding: '16px 24px',
                borderRadius: '24px',
                fontWeight: 900,
                fontSize: '1.1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                zIndex: 3
              }}
            >
              +100 Partner 🚀
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
