import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Richiesta inviata!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Errore nella richiesta.");
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
           <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.04em' }}>Recupero Password</h1>
           <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 500 }}>Inserisci la tua email e ti invieremo un link di ripristino.</p>
        </div>

        <div className="card" style={{ padding: '40px', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> INDIRIZZO EMAIL
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

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '18px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: 700 }}>
                {loading ? "Invio in corso..." : "Invia Link di Ripristino"}
                {!loading && <Send size={18} />}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: '#10b98115', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>Email Inviata!</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
                Se l'email esiste ne nostri sistemi, riceverai a breve un link per reimpostare la tua password.
              </p>
              <button onClick={() => navigate("/login")} className="btn btn-secondary" style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 700 }}>
                Torna al Login
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
            <ArrowLeft size={16} /> Ricordi la password? Accedi
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
