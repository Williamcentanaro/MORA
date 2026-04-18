import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Clock, SlidersHorizontal } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  minRating: number | null;
  setMinRating: (val: number | null) => void;
  openNow: boolean;
  setOpenNow: (val: boolean) => void;
  maxDistance: number | null;
  setMaxDistance: (val: number | null) => void;
  maxPrice: number | null;
  setMaxPrice: (val: number | null) => void;
}

export default function FilterModal({
  isOpen, onClose, minRating, setMinRating, openNow, setOpenNow, maxDistance, setMaxDistance, maxPrice, setMaxPrice
}: FilterModalProps) {
  
  // Local state for the modal until "Applica" is clicked
  const [localRating, setLocalRating] = useState(minRating);
  const [localOpenNow, setLocalOpenNow] = useState(openNow);
  const [localDistance, setLocalDistance] = useState(maxDistance);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    if (isOpen) {
      setLocalRating(minRating);
      setLocalOpenNow(openNow);
      setLocalDistance(maxDistance);
      setLocalMaxPrice(maxPrice);
    }
  }, [isOpen, minRating, openNow, maxDistance, maxPrice]);

  const handleApply = () => {
    setMinRating(localRating);
    setOpenNow(localOpenNow);
    setMaxDistance(localDistance);
    setMaxPrice(localMaxPrice);
    onClose();
  };

  const handleReset = () => {
    setLocalRating(null);
    setLocalOpenNow(false);
    setLocalDistance(null);
    setLocalMaxPrice(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              background: 'white',
              position: 'relative',
              zIndex: 1,
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={20} />
                Filtri Avanzati
              </h2>
              <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
                <X size={20} color="var(--text-main)" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
              {/* Stato Apertura */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Disponibilità</h3>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: `2px solid ${localOpenNow ? 'var(--primary)' : '#e2e8f0'}`, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', background: localOpenNow ? '#fff7ed' : 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Clock size={20} color={localOpenNow ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 700, color: localOpenNow ? 'var(--primary)' : 'var(--text-main)' }}>Aperto Ora</span>
                  </div>
                  <input type="checkbox" checked={localOpenNow} onChange={e => setLocalOpenNow(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                </label>
              </div>

              {/* Valutazione */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0' }}>Valutazione minima</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {[null, 1, 2, 3, 4, 5].map((val) => (
                     <button
                       key={String(val)}
                       onClick={() => setLocalRating(val)}
                       style={{
                         flex: val === null ? '1 1 100%' : '1 1 calc(33.333% - 10px)', 
                         padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem',
                         background: localRating === val ? 'var(--primary)' : 'white',
                         color: localRating === val ? 'white' : 'var(--text-main)',
                         border: `1px solid ${localRating === val ? 'var(--primary)' : '#e2e8f0'}`,
                         cursor: 'pointer', transition: 'all 0.2s',
                         display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                       }}
                     >
                       {val === null ? 'Qualsiasi valutazione' : <>{val}+ <Star size={16} fill={localRating === val ? 'white' : (localRating === val ? 'var(--primary)' : 'none')} color={localRating === val ? 'white' : 'var(--text-main)'} /></>}
                     </button>
                  ))}
                </div>
              </div>

              {/* Distanza (Slider) */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Distanza Massima</h3>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', background: '#fff7ed', padding: '6px 14px', borderRadius: '20px' }}>
                    {localDistance === null ? 'Nessun limite' : `Entro ${localDistance} km`}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input 
                    type="range" 
                    min="1" 
                    max="100"
                    disabled={localDistance === null}
                    value={localDistance === null ? 100 : localDistance}
                    onChange={(e) => setLocalDistance(parseInt(e.target.value))}
                    style={{ 
                      width: '100%', 
                      accentColor: 'var(--primary)',
                      opacity: localDistance === null ? 0.3 : 1,
                      cursor: localDistance === null ? 'not-allowed' : 'grab',
                      height: '6px',
                      borderRadius: '8px'
                    }}
                  />
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', alignSelf: 'flex-start', background: 'white', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <input 
                      type="checkbox" 
                      checked={localDistance === null}
                      onChange={(e) => {
                         if (e.target.checked) setLocalDistance(null);
                         else setLocalDistance(10); // Default a nice 10km when re-enabled
                      }}
                      style={{ accentColor: 'var(--primary)', width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Tutti (No limite)</span>
                  </label>
                </div>
              </div>

              {/* Prezzo Massimo (Slider) */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Prezzo Massimo</h3>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', background: '#fff7ed', padding: '6px 14px', borderRadius: '20px' }}>
                    {localMaxPrice === null ? 'Qualsiasi' : `≤ ${localMaxPrice} €`}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input 
                    type="range" 
                    min="5" 
                    max="50"
                    disabled={localMaxPrice === null}
                    value={localMaxPrice === null ? 50 : localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(parseInt(e.target.value))}
                    style={{ 
                      width: '100%', 
                      accentColor: 'var(--primary)',
                      opacity: localMaxPrice === null ? 0.3 : 1,
                      cursor: localMaxPrice === null ? 'not-allowed' : 'grab',
                      height: '6px',
                      borderRadius: '8px'
                    }}
                  />
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', alignSelf: 'flex-start', background: 'white', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <input 
                      type="checkbox" 
                      checked={localMaxPrice === null}
                      onChange={(e) => {
                         if (e.target.checked) setLocalMaxPrice(null);
                         else setLocalMaxPrice(20);
                      }}
                      style={{ accentColor: 'var(--primary)', width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Qualsiasi prezzo</span>
                  </label>
                </div>
                <div style={{ marginTop: '16px', padding: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', lineHeight: 1.4, opacity: 0.8 }}>
                  * Dati parziali: i prezzi dei piatti e del menu potrebbero essere stimati o in continuo aggiornamento da parte dei ristoranti.
                </div>
              </div>

            </div>

            {/* Azioni */}
            <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
               <button onClick={handleReset} style={{ flex: 1, padding: '16px', background: '#f8fafc', color: 'var(--text-main)', fontWeight: 800, border: '1px solid #e2e8f0', cursor: 'pointer', borderRadius: '16px', transition: 'background 0.2s' }}>
                 Azzera
               </button>
               <button onClick={handleApply} style={{ flex: 2, padding: '16px', background: 'var(--primary)', color: 'white', fontWeight: 800, border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(255, 90, 31, 0.3)', transition: 'transform 0.2s' }}>
                 Mostra Risultati
               </button>
            </div>
            
            {/* Safe area padding */}
            <div style={{ height: 'env(safe-area-inset-bottom)' }} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
