import { useState, useEffect } from 'react';
import { Download, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'other'>('other');

  useEffect(() => {
    // Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    setPlatform(isIos ? 'ios' : (isAndroid ? 'android' : 'other'));

    // Handle Android/Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show if not already dismissed in this session
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show if not standalone and not dismissed
    if (isIos && !(window.navigator as any).standalone) {
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9998,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
      }}>
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <div style={{ 
              width: 72, 
              height: 72, 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, #FF5A1F 0%, #ff7e4b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(255, 90, 31, 0.2)'
            }}>
              <img src="/mora-logo.png" alt="MORA" style={{ width: '48px', height: '48px', borderRadius: '10px' }} />
            </div>
          </div>
          
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 900 }}>Aggiungi MORA al telefono</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: 1.5 }}>
              Installa l'app per un'esperienza più veloce, notifiche in tempo reale e mappa sempre a portata di mano.
            </p>
          </div>

          {platform === 'ios' ? (
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '16px', 
              borderRadius: '16px', 
              fontSize: '0.9rem',
              color: '#1e293b'
            }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: 600 }}>Per installare su iPhone:</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                1. Premi <Share size={18} color="var(--primary)" /> 
                <span style={{color: '#cbd5e1'}}>|</span>
                2. "Aggiungi a Home"
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={handleInstallClick}
                style={{
                  width: '100%',
                  backgroundColor: '#FF5A1F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px rgba(255, 90, 31, 0.2)'
                }}
              >
                <Download size={20} />
                Installa App
              </button>
            </div>
          )}

          <button 
            onClick={dismissPrompt}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              color: '#94a3b8', fontWeight: 600, padding: '8px', 
              fontSize: '0.95rem', marginTop: '-4px'
            }}
          >
            Più tardi
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
