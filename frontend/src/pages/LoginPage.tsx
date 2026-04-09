import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

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

      // Store token as auth_token as requested
      localStorage.setItem("auth_token", data.token);
      window.dispatchEvent(new Event('auth-change'));
      
      toast.success("Login effettuato con successo!");
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: '1.75rem' }}>Bentornato</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Accedi per scoprire i migliori sapori latini.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</label>
            <input
              type="email"
              placeholder="latino@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center', padding: 10, background: '#fee2e2', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: 16 }}>
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>

        <p style={{ marginTop: 30, textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Non hai un account? <Link to="/register" style={{ fontWeight: 700 }}>Registrati</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
