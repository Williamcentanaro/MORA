import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Restaurant = {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
};

type OwnerRequest = {
  id: string;
  businessName: string;
  city: string;
  message?: string;
  user: {
    name: string;
    email: string;
  };
};

function AdminDashboard() {
  const [pending, setPending] = useState<Restaurant[]>([]);
  const [ownerRequests, setOwnerRequests] = useState<OwnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    pendingRestaurants: 0,
    pendingOwnerRequests: 0
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    const fetchProfile = async () => {
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            const res = await fetch("/api/auth/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok || data.user.role !== 'ADMIN') {
                alert("Accesso negato. Solo gli amministratori possono accedere a questa pagina.");
                navigate("/");
                return;
            }
            fetchInitialData();
        } catch (err) {
            console.error(err);
            navigate("/");
        }
    };

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const resStats = await fetch("/api/admin/stats", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (resStats.ok) {
            const dataStats = await resStats.json();
            setStats(dataStats);
        }

        // Fetch pending restaurants
        const resRest = await fetch("/api/admin/restaurants/pending", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!resRest.ok) throw new Error("Errore nel caricamento dei ristoranti");
        const dataRest = await resRest.json();
        setPending(dataRest);

        // Fetch pending owner requests
        const resOwner = await fetch("/api/admin/owner-requests/pending", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!resOwner.ok) throw new Error("Errore nel caricamento delle richieste owner");
        const dataOwner = await resOwner.json();
        setOwnerRequests(dataOwner);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
        const res = await fetch(`/api/admin/restaurants/${id}/${action}`, {
            method: 'PATCH',
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Impossibile ${action === 'approve' ? 'approvare' : 'rifiutare'} il ristorante`);
        
        // Remove from list
        setPending(prev => prev.filter(r => r.id !== id));
        alert(`Ristorante ${action === 'approve' ? 'approvato' : 'rifiutato'} con successo!`);
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleOwnerAction = async (id: string, action: 'approve' | 'reject') => {
    try {
        const res = await fetch(`/api/admin/owner-requests/${id}/${action}`, {
            method: 'PATCH',
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Impossibile ${action === 'approve' ? 'approvare' : 'rifiutare'} la richiesta`);
        
        // Remove from list
        setOwnerRequests(prev => prev.filter(req => req.id !== id));
        alert(`Richiesta ${action === 'approve' ? 'approvata' : 'rifiutata'} con successo!`);
    } catch (err: any) {
        alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Caricamento...</div>;

  return (
    <div style={{ padding: '40px 0' }}>
      <main className="container">
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 4px 0' }}>Pannello Amministratore</h1>
          <p style={{ margin: '0 0 30px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gestione e approvazione partner</p>
        </div>
        {error && (
            <div className="card" style={{ background: 'var(--danger)', color: 'white', marginBottom: 20, border: 'none', textAlign: 'center' }}>
                {error}
            </div>
        )}

        {/* Statistics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
            <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{stats.totalUsers}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Utenti Totali</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{stats.totalRestaurants}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Ristoranti Totali</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pendingRestaurants}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Ristoranti Pendenti</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '20px', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{stats.pendingOwnerRequests}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Richieste Owner</div>
            </div>
        </div>

        <div style={{ display: "flex", flexDirection: 'column', gap: 40 }}>
          
          {/* Section 1: Restaurants */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Ristoranti in Sospeso</h2>
              <span className="badge badge-pending">{pending.length}</span>
            </div>
            
            {pending.length === 0 ? (
                <div style={{ padding: 40, background: "transparent", border: "2px dashed var(--border)", borderRadius: 12, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nessun ristorante in attesa di approvazione.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {pending.map(r => (
                        <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{r.name}</h3>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>📍 {r.address}, {r.city}</p>
                                <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{r.description}"</p>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                                <button onClick={() => handleAction(r.id, 'approve')} className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.85rem', background: 'var(--success)' }}>Approva</button>
                                <button onClick={() => handleAction(r.id, 'reject')} className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.85rem', color: 'var(--danger)', border: '1px solid var(--danger)', background: 'white' }}>Rifiuta</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </section>

          {/* Section 2: Owner Requests */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Richieste Partnership</h2>
              <span className="badge badge-pending">{ownerRequests.length}</span>
            </div>
            
            {ownerRequests.length === 0 ? (
                <div style={{ padding: 40, background: "transparent", border: "2px dashed var(--border)", borderRadius: 12, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nessuna richiesta di partnership in sospeso.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {ownerRequests.map(req => (
                        <div key={req.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{req.businessName}</h3>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}>📍 {req.city}</p>
                                <div style={{ margin: '10px 0 0 0', padding: 12, background: 'var(--bg-main)', borderRadius: 8, fontSize: '0.85rem' }}>
                                    <p style={{ margin: 0 }}>Richiedente: <strong>{req.user.name}</strong></p>
                                    <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>{req.user.email}</p>
                                </div>
                                {req.message && (
                                    <p style={{ margin: '10px 0 0 0', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>"{req.message}"</p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                                <button onClick={() => handleOwnerAction(req.id, 'approve')} className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>Diventa Partner</button>
                                <button onClick={() => handleOwnerAction(req.id, 'reject')} className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.85rem', color: 'var(--danger)', border: '1px solid var(--danger)', background: 'white' }}>Rifiuta</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
