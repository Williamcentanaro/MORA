import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token mancante.");
      return;
    }

    if (password.length < 8) {
      toast.error("La password deve contenere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Le password non coincidono.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password aggiornata con successo!");
        navigate("/login");
      } else {
        toast.error(data.message || "Errore nel ripristino password.");
      }
    } catch (err) {
      toast.error("Errore di connessione.");
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
        style={{ maxWidth: 440, width: '100%' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
           <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.04em' }}>Nuova Password</h1>
           <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 500 }}>Scegli una password sicura per il tuo account.</p>
        </div>

        <div className="card" style={{ padding: '40px', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> NUOVA PASSWORD
              </label>
              <input
                type="password"
                placeholder="Almeno 8 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                CONFERMA PASSWORD
              </label>
              <input
                type="password"
                placeholder="Ripeti la password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.95rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5, fontWeight: 500 }}>
                La tua password verrà aggiornata istantaneamente.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '18px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: 700 }}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Aggiorna Password"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPasswordPage;
