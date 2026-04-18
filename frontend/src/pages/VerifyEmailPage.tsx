import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    const vEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token di verifica mancante.");
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
          toast.success("Email verificata! Benvenuto su MORA.");
        } else {
          setStatus("error");
          setMessage(data.message || "Verifica fallita.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Errore di connessione al server.");
      }
    };

    vEmail();
  }, [token]);

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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}
      >
        <div className="card" style={{ padding: '48px', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
          {status === "loading" && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <Loader2 className="animate-spin" size={48} color="var(--primary)" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Verifica in corso...</h2>
              <p style={{ color: '#64748b' }}>Stiamo attivando il tuo account MORA.</p>
            </div>
          )}

          {status === "success" && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: 80, height: 80, background: '#10b98115', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={48} color="#10b981" />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Account Verificato!</h2>
              <p style={{ color: '#64748b', marginBottom: 12 }}>Grazie per aver verificato la tua email. Il tuo viaggio in MORA inizia ora.</p>
              <button 
                onClick={() => navigate("/login")}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
              >
                Vai al Login <ArrowRight size={18} />
              </button>
            </div>
          )}

          {status === "error" && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: 80, height: 80, background: '#ef444415', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={48} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Ops! Qualcosa è andato storto</h2>
              <p style={{ color: '#64748b', marginBottom: 12 }}>{message}</p>
              <button 
                onClick={() => navigate("/login")}
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 700 }}
              >
                Torna al Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmailPage;
