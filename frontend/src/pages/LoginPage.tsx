import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Facebook } from "lucide-react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  // handleGoogleResponse removed

  // Effect to handle URL errors from OAuth redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      console.error("[AUTH-LOG] Auth Error from URL:", urlError);
      
      let message = "Errore durante l'accesso social.";
      if (urlError === 'fb_email_permission_denied') {
        message = "Permesso email negato. Per favore concedi l'accesso all'email per continuare.";
      } else if (urlError === 'fb_email_unverified_or_absent') {
        message = "Il tuo account Facebook non fornisce un’email valida o verificata. Accedi con Google oppure registrati con email e password.";
      } else if (urlError === 'fb_account_conflict') {
        message = "Esiste già un account con questa email. Accedi con il metodo originale o contatta il supporto.";
      } else if (urlError === 'auth_failed' || urlError === 'fb_auth_failed') {
        message = "Autenticazione fallita. Riprova o usa un altro metodo.";
      }
      
      toast.error(message, { duration: 5000 });
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Social SDKs are no longer loaded here to avoid fragile client-side logic
  useEffect(() => {
    console.log("[AUTH-LOG] LoginPage mounted - Using Classic OAuth Redirect Flows");
  }, []);

  const handleGoogleLogin = () => {
    console.log("[AUTH-LOG] Redirecting to Classic Google OAuth Flow");
    // Direct redirect to backend endpoint to start server-side OAuth flow
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleFacebookLogin = () => {
    console.log("[AUTH-LOG] Redirecting to Classic Facebook OAuth Flow");
    // Direct redirect to backend endpoint to start server-side OAuth flow
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/api/auth/facebook`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenziali non valide");
      }

      localStorage.setItem("auth_token", data.token);
      window.dispatchEvent(new Event('auth-change'));
      
      toast.success("Bentornato su MORA!");
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '90vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px',
      background: 'radial-gradient(circle at top right, rgba(255, 51, 102, 0.05), transparent), radial-gradient(circle at bottom left, rgba(67, 97, 238, 0.05), transparent)'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 460, width: '100%' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
           <div style={{ 
             width: 64, height: 64, background: 'var(--primary)', borderRadius: 20, 
             display: 'flex', alignItems: 'center', justifyContent: 'center', 
             margin: '0 auto 20px', color: 'white', boxShadow: '0 10px 20px rgba(255,51,102,0.2)'
           }}>
             <LogIn size={32} />
           </div>
           <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.03em' }}>Bentornato</h1>
           <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 500 }}>Accedi al tuo hub gastronomico.</p>
        </div>

        <div className="card" style={{ padding: '40px', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
          {/* Social Login Section */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
            <button 
              onClick={handleGoogleLogin}
              className="btn btn-google-custom"
              style={{ 
                flex: 1, 
                height: '40px', 
                borderRadius: '8px', 
                background: 'white', 
                border: '1px solid #e2e8f0',
                color: '#1e293b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 10, 
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 16, height: 16 }} />
              <span>Google</span>
            </button>
            <button 
              type="button" 
              onClick={handleFacebookLogin}
              className="btn btn-facebook-hover" 
              style={{ 
                flex: 1, 
                height: '40px', 
                borderRadius: '4px', 
                background: '#1877f2', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 10, 
                border: 'none', 
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              <Facebook size={18} /> <span>Facebook</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Oppure via email</span>
            <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontWeight: 800, fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> EMAIL
              </label>
              <input
                type="email"
                placeholder="nome@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontWeight: 800, fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} /> PASSWORD
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>Dimenticata?</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem' }}
                required
              />
            </div>
            
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', padding: 12, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', fontWeight: 600 }}>
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '18px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem' }}>
              {loading ? "Verifica in corso..." : "Accedi"}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>
            Nuovo su MORA? <Link to="/register" style={{ fontWeight: 800, color: 'var(--primary)', textDecoration: 'none' }}>Crea un account</Link>
          </p>
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <ShieldCheck size={14} />
            Connessione sicura e crittografata
          </div>
        </div>
      </motion.div>

      <style>{`
        .btn-facebook-hover:hover {
          background-color: #166fe5 !important;
          transform: translateY(-1px);
        }
        .btn-facebook-hover:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
