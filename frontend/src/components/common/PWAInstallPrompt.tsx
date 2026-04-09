import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
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
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 400,
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          border: '1px solid #f1f5f9'
        }}
      >
        <button 
          onClick={dismissPrompt}
          style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #FF5A1F 0%, #ff7e4b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img src="/mora-logo.png" alt="MORA" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Scarica l'App MORA</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Installa sul tuo telefono per un'esperienza migliore</p>
          </div>
        </div>

        {platform === 'ios' ? (
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '12px', 
            borderRadius: '16px', 
            fontSize: '0.9rem',
            textAlign: 'center',
            color: '#1e293b'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>Per installare su iPhone:</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700 }}>
              1. Premi <Share size={18} /> 
              2. Scegli "Aggiungi a Home"
            </div>
          </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            style={{
              width: '100%',
              backgroundColor: '#FF5A1F',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '14px',
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
            Scarica l'app
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
