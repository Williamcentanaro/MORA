import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

type OwnerRequest = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  businessName: string;
  city: string;
  message?: string;
};

function PartnerApplyPage() {
  const [formData, setFormData] = useState({ businessName: "", city: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [request, setRequest] = useState<OwnerRequest | null>(null);
  const [error, setError] = useState("");


  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    if (!token) {
      setFetching(false);
      return;
    }
    fetchRequestStatus();
  }, [token]);

  const fetchRequestStatus = async () => {
    try {
      const res = await fetch("/api/owner-requests/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequest(data);
      }
    } catch (err) {
      console.error("Error fetching status:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Devi effettuare l'accesso per inviare una richiesta.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/owner-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Errore durante l'invio");

      setRequest(data.request);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: 40, textAlign: 'center' }}>Caricamento...</div>;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: 20 }}>Diventa un Partner</h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', maxWidth: 700, margin: '0 auto' }}>
            Unisciti alla prima piattaforma dedicata esclusivamente alla ristorazione latino-americana. Fai crescere il tuo business.
          </p>
        </div>
      </section>

      <main className="container" style={{ marginTop: -40 }}>
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: '40px' }}>
          {!token ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>👋</div>
              <h2 style={{ marginBottom: 15 }}>Iniziamo?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>Devi effettuare l'accesso per poter inviare la tua candidatura.</p>
              <Link to="/login" className="btn btn-primary" style={{ padding: '14px 30px' }}>Accedi o Registrati</Link>
            </div>
          ) : request ? (
            <div style={{ textAlign: 'center' }}>
              {request.status === 'PENDING' && (
                <div style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: 'var(--radius)', border: '2px solid var(--warning)' }}>
                  <h2 style={{ color: 'var(--warning)', margin: '0 0 10px 0' }}>Richiesta in elaborazione ⏳</h2>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Grazie per aver scelto MORA! Stiamo esaminando la tua proposta per <strong>{request.businessName}</strong>.</p>
                </div>
              )}
              {request.status === 'APPROVED' && (
                <div style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: 'var(--radius)', border: '2px solid var(--success)' }}>
                  <h2 style={{ color: 'var(--success)', margin: '0 0 10px 0' }}>Sei dei nostri! 🎉</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>La tua richiesta per <strong>{request.businessName}</strong> è stata approvata. Ora puoi gestire il tuo profilo.</p>
                  <Link to="/owner/dashboard" className="btn btn-primary">Vai alla Dashboard</Link>
                </div>
              )}
              {request.status === 'REJECTED' && (
                <div style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: 'var(--radius)', border: '2px solid var(--danger)' }}>
                  <h2 style={{ color: 'var(--danger)', margin: '0 0 10px 0' }}>Richiesta Rifiutata</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>La tua richiesta non ha potuto essere soddisfatta in questo momento.</p>
                  <button onClick={() => setRequest(null)} className="btn btn-primary">Riprova</button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: 'column', gap: 25 }}>
              <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Candidati ora</h2>

              {error && (
                <div className="card" style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: 12, textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nome del Ristorante</label>
                <input
                  required
                  type="text"
                  placeholder="Es: La Parrilla"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Città</label>
                <input
                  required
                  type="text"
                  placeholder="Es: Roma"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Messaggio (opzionale)</label>
                <textarea
                  rows={4}
                  placeholder="Parlaci brevemente del tuo locale..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button disabled={loading} type="submit" className="btn btn-primary" style={{ padding: 16 }}>
                {loading ? "Invio in corso..." : "Invia Candidatura"}
              </button>
            </form>
          )}
        </div>
      </main>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>← Torna alla Home</Link>
      </div>
    </div>
  );
}

export default PartnerApplyPage;
