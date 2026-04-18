import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scale } from "lucide-react";

function TermsPage() {
  return (
    <div style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', textDecoration: 'none', fontWeight: 700, marginBottom: 32 }}>
        <ArrowLeft size={16} /> Torna alla Home
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
        <div style={{ width: 48, height: 48, background: '#fff7ed', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
          <Scale size={24} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Termini di Servizio</h1>
      </div>

      <div style={{ color: '#334155', lineHeight: 1.8, fontSize: '1.1rem' }}>
        <p><em>Ultimo aggiornamento: 16 Aprile 2026</em></p>
        
        <h2 style={{ fontSize: '1.5rem', marginTop: 40, marginBottom: 16 }}>1. Accettazione dei Termini</h2>
        <p>Utilizzando MORA, accetti di rispettare i presenti Termini e Condizioni. Se non concordi con una qualsiasi parte di essi, ti preghiamo di non utilizzare il servizio.</p>

        <h2 style={{ fontSize: '1.5rem', marginTop: 40, marginBottom: 16 }}>2. Account Utente</h2>
        <p>L'utente è responsabile della riservatezza delle proprie credenziali di accesso (Email, Google, Facebook) e di tutte le attività svolte tramite il proprio account.</p>

        <h2 style={{ fontSize: '1.5rem', marginTop: 40, marginBottom: 16 }}>3. Utilizzo Corretto</h2>
        <p>MORA è una piattaforma per scoprire locali e menu. È vietato ogni uso improprio, incluso lo scraping di dati o la pubblicazione di contenuti offensivi nelle recensioni.</p>

        <h2 style={{ fontSize: '1.5rem', marginTop: 40, marginBottom: 16 }}>4. Limitazione di Responsabilità</h2>
        <p>MORA non è responsabile per eventuali inesattezze nei menu o negli orari forniti dai ristoratori. Ti invitiamo sempre a verificare direttamente con il locale.</p>
      </div>

      <div style={{ marginTop: 60, textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        <p>&copy; 2026 MORA App. Tutti i diritti riservati.</p>
      </div>
    </div>
  );
}

export default TermsPage;
