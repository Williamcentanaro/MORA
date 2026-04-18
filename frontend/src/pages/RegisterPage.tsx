import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";

function RegisterPage() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend Validations
    if (password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Errore nella registrazione");
      }

      toast.success("Registrazione completata! Controlla la tua email per verificare l'account.", { duration: 6000 });
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px',
      background: 'radial-gradient(circle at top left, rgba(255, 51, 102, 0.05), transparent), radial-gradient(circle at bottom right, rgba(67, 97, 238, 0.05), transparent)'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 500, width: '100%' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
           <div style={{ 
             width: 64, height: 64, background: 'linear-gradient(135deg, var(--primary) 0%, #ff6b6b 100%)', 
             borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', 
             margin: '0 auto 20px', color: 'white', boxShadow: '0 10px 20px rgba(255,51,102,0.2)'
           }}>
             <UserPlus size={32} />
           </div>
           <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.04em' }}>Unisciti a MORA</h1>
           <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>La tua esperienza gastronomica inizia qui.</p>
        </div>

        <div className="card" style={{ padding: '40px', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> NOME
                </label>
                <input
                  type="text"
                  placeholder="Mario"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem', width: '100%' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   COGNOME
                </label>
                <input
                  type="text"
                  placeholder="Rossi"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem', width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> EMAIL
              </label>
              <input
                type="email"
                placeholder="mario@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} /> PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem' }}
                  minLength={8}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  CONFERMA
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem' }}
                  minLength={8}
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
              <ShieldCheck size={18} color="#10b981" />
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5, fontWeight: 500 }}>
                Il tuo account sarà attivo dopo la verifica email.
              </p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', padding: 12, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', fontWeight: 600 }}>
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '18px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: 700, transition: 'all 0.3s ease' }}>
              {loading ? "Creazione in corso..." : "Crea Il Tuo Account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>
            Hai già un account? <Link to="/login" style={{ fontWeight: 800, color: 'var(--primary)', textDecoration: 'none' }}>Accedi ora</Link>
          </p>
        </div>
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
          Registrandoti, accetti la nostra <Link to="/privacy" style={{ color: '#64748b', fontWeight: 600 }}>Privacy Policy</Link> e i <Link to="/terms" style={{ color: '#64748b', fontWeight: 600 }}>Termini di Servizio</Link>.
        </div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
