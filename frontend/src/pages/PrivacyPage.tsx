import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

function PrivacyPage() {
  return (
    <div style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', textDecoration: 'none', fontWeight: 700, marginBottom: 32 }}>
        <ArrowLeft size={16} /> Torna alla Home
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
        <div style={{ width: 48, height: 48, background: '#f0f9ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
          <Shield size={24} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Privacy Policy</h1>
      </div>

      <div style={{ color: '#334155', lineHeight: 1.8, fontSize: '1.1rem' }}>
        <p><em>Ultimo aggiornamento: 16 Aprile 2026</em></p>
        
        <h2 style={{ fontSize: '1.5rem', marginTop: 40, marginBottom: 16 }}>1. Informazioni Generali</h2>
        <p>MORA si impegna a proteggere la tua privacy. Questa informativa spiega come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali quando utilizzi la nostra piattaforma.</p>

        <h2 style={{ fontSize: '1.5rem', marginTop: 40, marginBottom: 16 }}>2. Dati Raccolti</h2>
        <p>Raccogliamo dati necessari per fornirti il miglior servizio possibile:</p>
        <ul>
          <li><strong>Dati di Account:</strong> Nome, email e preferenze salvate.</li>
          <li><strong>Preferenze Social:</strong> Se accedi tramite Google o Facebook, riceviamo il tuo ID univoco e l'avatar.</li>
          <li><strong>Interazioni:</strong> Locali seguiti e recensioni pubblicate.</li>
        </ul>

        <h2 style={{ fontSize: '1.5rem', marginTop: 40, marginBottom: 16 }}>3. Utilizzo dei Dati</h2>
        <p>I tuoi dati sono utilizzati esclusivamente per:</p>
        <ul>
          <li>Gestire il tuo account e l'autenticazione.</li>
          <li>Inviarti notifiche importanti (menu del giorno, eventi).</li>
          <li>Personalizzare la tua esperienza su MORA.</li>
        </ul>

        <h2 style={{ fontSize: '1.5rem', marginTop: 40, marginBottom: 16 }}>4. Diritti dell'Utente</h2>
        <p>In conformità con il GDPR, hai il diritto di accedere, rettificare o cancellare i tuoi dati in qualsiasi momento tramite le impostazioni del profilo o contattando il nostro supporto.</p>
      </div>

      <div style={{ marginTop: 60, padding: 30, background: '#f8fafc', borderRadius: 24, textAlign: 'center' }}>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>Hai domande sulla tua privacy?</p>
        <p style={{ color: '#64748b', margin: 0 }}>Contattaci a: <a href="mailto:privacy@mora-app.com" style={{ color: 'var(--primary)' }}>privacy@mora-app.com</a></p>
      </div>
    </div>
  );
}

export default PrivacyPage;
