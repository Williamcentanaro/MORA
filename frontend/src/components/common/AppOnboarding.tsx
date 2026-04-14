import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, MapPin } from 'lucide-react';

export default function AppOnboarding() {
  const [step, setStep] = useState(0); // 0 = hidden, 1 = notifications, 2 = location
  
  useEffect(() => {
    // Only show if not previously completed
    const onboardingComplete = localStorage.getItem('app_onboarding_completed');
    if (!onboardingComplete) {
      // Delay prompt slightly to let the app load
      const t = setTimeout(() => {
        setStep(1);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const completeOnboarding = () => {
    setStep(0);
    localStorage.setItem('app_onboarding_completed', 'true');
  };

  const requestNotification = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
    setStep(2);
  };

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => { completeOnboarding() }, 
        () => { completeOnboarding() }
      );
    } else {
      completeOnboarding();
    }
  };

  if (step === 0) return null;

  return (
    <AnimatePresence>
      <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9998,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
      }}>
        <motion.div
          key={`step-${step}`}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          style={{
            width: 'calc(100% - 32px)',
            maxWidth: 380,
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            textAlign: 'center'
          }}
        >
          {step === 1 ? (
             <>
               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                 <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef08a', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <BellRing size={36} />
                 </div>
               </div>
               <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 900 }}>Non perderti nulla</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: 1.5 }}>
                    Attiva le notifiche per ricevere eventi esclusivi o per sapere esattamente a che punto è la tua comanda in locale.
                  </p>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                 <button 
                   onClick={requestNotification}
                   style={{ width: '100%', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                 >
                   Attiva Notifiche
                 </button>
                 <button 
                   onClick={() => setStep(2)}
                   style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontWeight: 600, padding: '8px', fontSize: '0.95rem' }}
                 >
                   Non ora
                 </button>
               </div>
             </>
          ) : (
             <>
               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                 <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#bbf7d0', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <MapPin size={36} />
                 </div>
               </div>
               <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 900 }}>Trova l'Eccellenza</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: 1.5 }}>
                    Attiva la posizione per vedere i ristoranti e gli eventi culinari più vicini a te in tempo reale.
                  </p>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                 <button 
                   onClick={requestLocation}
                   style={{ width: '100%', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                 >
                   Attiva Posizione
                 </button>
                 <button 
                   onClick={completeOnboarding}
                   style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontWeight: 600, padding: '8px', fontSize: '0.95rem' }}
                 >
                   Più tardi
                 </button>
               </div>
             </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
