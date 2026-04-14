import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Navigation, X } from "lucide-react";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCity: string;
  setSelectedCity: (val: string) => void;
  openNowOnly: boolean;
  setOpenNowOnly: (val: boolean) => void;
  maxDistance: number | "";
  setMaxDistance: (val: number | "") => void;
  locationStatus: 'prompt' | 'loading' | 'success' | 'denied' | 'unsupported';
  availableCities: string[];
  detectLocation: () => void;
}

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  openNowOnly,
  setOpenNowOnly,
  maxDistance,
  setMaxDistance,
  locationStatus,
  availableCities,
  detectLocation
}: HeroSectionProps) {
  const hasActiveFilters = searchQuery || selectedCity || openNowOnly || maxDistance !== "";
  
  // Defer heavy video loading to prevent blocking first paint
  const [loadVideo, setLoadVideo] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoadVideo(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setOpenNowOnly(false);
    setMaxDistance("");
  };

  return (
    <section style={{ 
      position: 'relative',
      width: '100%',
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      {/* Optimized fallback poster visible immediately */}
      <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'url(/images/hero-fallback.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0
      }} />

      {/* Video Background (Deferred) */}
      {loadVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'translate(-50%, -50%)',
            zIndex: 1
          }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* Darker Cinematic Overlay with Gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
        backdropFilter: 'blur(1px)',
        zIndex: 2
      }}></div>

      {/* Hero Content */}
      <div className="container" style={{ 
        position: 'relative', 
        zIndex: 3, 
        textAlign: 'center', 
        color: 'white',
        padding: '120px 20px 80px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 style={{ 
            fontSize: 'clamp(2.8rem, 9vw, 5.5rem)', 
            marginBottom: 24, 
            fontWeight: 900,
            textShadow: '0 4px 20px rgba(0,0,0,0.6)',
            lineHeight: 0.95,
            letterSpacing: '-0.05em'
          }}>
            Scopri i migliori ristoranti<br />
            <span style={{ color: 'var(--primary)' }}>d'eccellenza</span> in Italia
          </h2>
          <p style={{ 
            fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', 
            maxWidth: 750, 
            margin: '0 auto 56px',
            opacity: 0.95,
            fontWeight: 500,
            textShadow: '0 2px 10px rgba(0,0,0,0.4)',
            lineHeight: 1.4,
            color: '#f1f5f9'
          }}>
            Trova autentici sapori da tutto il mondo vicino a te.
          </p>
        </motion.div>

        {/* Integrated Filter Bar - Professional Centered Design */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ 
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '12px', 
            borderRadius: '28px',
            background: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.5fr 1fr 1fr auto', 
            gap: '8px',
            alignItems: 'center'
          }}>
            
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                left: 20, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Search size={22} />
              </div>
              <input 
                type="text" 
                placeholder="Cosa vuoi mangiare?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '20px 20px 20px 56px',
                  border: '1px solid transparent',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  background: '#f8fafc',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
              />
            </div>

            {/* City */}
            <div style={{ position: 'relative' }}>
              <MapPin size={22} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '20px 20px 20px 56px',
                  border: '1px solid transparent',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  background: '#f8fafc',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="">Dove?</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Distance */}
            <div style={{ position: 'relative' }}>
              <Navigation size={22} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select 
                value={maxDistance} 
                onChange={(e) => setMaxDistance(e.target.value === "" ? "" : Number(e.target.value))}
                style={{ 
                  width: '100%', 
                  padding: '20px 20px 20px 56px',
                  border: '1px solid transparent',
                  borderRadius: '20px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  background: '#f8fafc',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="">Distanza</option>
                <option value={5}>5 km</option>
                <option value={15}>15 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            {/* Submit btn */}
            <button 
              className="btn btn-primary" 
              style={{ 
                height: '64px',
                width: '64px', 
                borderRadius: '20px', 
                padding: 0,
                boxShadow: '0 10px 20px rgba(255, 90, 31, 0.3)'
              }}
            >
              <Search size={24} />
            </button>
          </div>

          {/* Quick Toggles */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px', 
            padding: '8px 12px 0',
            borderTop: '1px solid #f1f5f9'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              <input 
                type="checkbox" 
                checked={openNowOnly}
                onChange={(e) => setOpenNowOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              Aperto Ora 🟢
            </label>

            <button 
              onClick={detectLocation}
              disabled={locationStatus === 'loading'}
              style={{ 
                background: locationStatus === 'success' ? '#fff7ed' : 'var(--primary)', 
                border: locationStatus === 'success' ? '1px solid var(--primary)' : 'none', 
                color: locationStatus === 'success' ? 'var(--primary)' : 'white', 
                fontSize: '0.95rem', 
                fontWeight: 800, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '16px',
                boxShadow: locationStatus === 'success' ? 'none' : '0 10px 20px rgba(255, 90, 31, 0.2)',
                transition: 'all 0.3s',
                opacity: locationStatus === 'loading' ? 0.7 : 1
              }}
            >
              <Navigation size={18} fill={locationStatus === 'success' ? 'var(--primary)' : 'white'} />
              {locationStatus === 'loading' ? 'Rilevamento...' : 
               locationStatus === 'success' ? 'Posizione Attiva' : 
               'Trova ristoranti vicino a me'}
            </button>

            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                style={{ 
                  marginLeft: 'auto',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--danger)', 
                  fontSize: '0.95rem', 
                  fontWeight: 700, 
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
                Reset
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
