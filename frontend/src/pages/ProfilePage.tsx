import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LogOut, LayoutDashboard, ChevronRight, 
  MapPin, User, Shield, Bell, Smartphone, Key,
  UserCircle, SmartphoneIcon, Edit3, X, Save, Lock,
  Download, Info, Share, MapPinOff
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { usePWA } from "../hooks/usePWA";
import { useGeolocation } from "../hooks/useGeolocation";

type UserType = {
  id: string;
  email: string;
  name: string;
  surname: string | null;
  role: string;
  avatar?: string;
};

const SettingRow = ({ icon: Icon, label, value, status, onClick, color = "var(--primary)" }: any) => (
  <div 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '16px', 
      background: 'white', 
      borderRadius: '20px', 
      marginBottom: '12px',
      border: '1px solid #f1f5f9',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease'
    }}
    className={onClick ? "setting-row-hover" : ""}
  >
    <div style={{ 
      width: '42px', 
      height: '42px', 
      borderRadius: '12px', 
      backgroundColor: `${color}15`, 
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '16px'
    }}>
      <Icon size={20} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{label}</p>
      {value && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{value}</p>}
    </div>
    {status && (
      <span style={{ 
        padding: '4px 10px', 
        borderRadius: '10px', 
        fontSize: '0.65rem', 
        fontWeight: 800, 
        textTransform: 'uppercase',
        backgroundColor: status === 'Attivo' || status === 'ON' || status === 'Installata' ? '#dcfce7' : '#f1f5f9',
        color: status === 'Attivo' || status === 'ON' || status === 'Installata' ? '#166534' : '#64748b'
      }}>
        {status}
      </span>
    )}
    {onClick && <ChevronRight size={18} style={{ color: '#cbd5e1', marginLeft: '8px' }} />}
  </div>
);

function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Account State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSurname, setNewSurname] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Device & Permissions
  const { isInstallable, isInstalled, platform: pwaPlatform, install } = usePWA();
  const { permission: geoPermission, request: requestGeo } = useGeolocation();

  const { isSubscribed, permissionState, subscribe, unsubscribe } = usePushNotifications();
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!token) {
      setError("Richiesto login");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userRes = await fetch("/api/auth/me", { headers: { "Authorization": `Bearer ${token}` } });

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
        setNewName(userData.user.name || "");
        setNewSurname(userData.user.surname || "");
      } else {
        throw new Error("Impossibile caricare i dati utente");
      }
    } catch (err: any) {
      console.error(err);
      setError("Si è verificato un errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data: { name?: string; surname?: string; currentPassword?: string; newPassword?: string }) => {
    try {
      setIsUpdating(true);
      const res = await fetch("/api/auth/me", {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        setUser(result.user);
        toast.success("Profilo aggiornato con successo");
        setIsEditingInfo(false);
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(result.message || "Errore durante l'aggiornamento");
      }
    } catch (err) {
      toast.error("Errore di connessione");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    toast.success("Logout effettuato");
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '300px', borderRadius: '32px', maxWidth: '600px', margin: '0 auto' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px', background: '#fff', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '4rem', marginBottom: 20, display: 'block' }}>🔐</span>
          <h2 style={{ marginBottom: 12, fontWeight: 900 }}>Accesso richiesto</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '1.1rem' }}>{error}</p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '14px 40px', borderRadius: '16px' }}>Vai al Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fdfcfe', minHeight: '100vh', paddingBottom: 100 }}>
      <div className="profile-header-section" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
        padding: '80px 0 60px', 
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.3 }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: '#ff6b6b', filter: 'blur(150px)', opacity: 0.2 }} />

        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 2 }}>
            <div style={{ position: 'relative' }}>
              <div 
                style={{ 
                  width: '90px', height: '90px', 
                  background: user?.avatar ? `url(${user.avatar}) center/cover no-repeat` : 'linear-gradient(45deg, var(--primary), #ff6b6b)', 
                  borderRadius: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem', color: 'white', fontWeight: 900,
                  boxShadow: '0 10px 30px rgba(255,51,102,0.3)', border: '3px solid rgba(255,255,255,0.2)'
                }}
              >
                {!user?.avatar && (user?.name?.[0] || 'U').toUpperCase()}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{user?.name} {user?.surname}</h1>
                <span style={{ 
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    padding: '2px 8px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase'
                }}>
                    {user?.role === 'owner' || user?.role === 'RESTAURANT_OWNER' ? 'Owner' : 'Explorer'}
                </span>
              </div>
              <p style={{ margin: 0, opacity: 0.7, fontWeight: 500, fontSize: '0.95rem' }}>{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-30px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCircle size={20} color="var(--primary)" />
              Informazioni Personali
            </h3>
            
            {!isEditingInfo ? (
              <SettingRow 
                icon={User} 
                label="Dati Identità" 
                value={`${user?.name} ${user?.surname || ""}`} 
                onClick={() => setIsEditingInfo(true)} 
              />
            ) : (
              <div style={{ background: 'white', padding: '24px', borderRadius: '24px', marginBottom: '12px', border: '2px solid var(--primary-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>NOME</label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>COGNOME</label>
                   <input 
                      type="text" 
                      value={newSurname} 
                      onChange={e => setNewSurname(e.target.value)}
                      style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '12px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem' }}
                   />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button onClick={() => setIsEditingInfo(false)} className="btn btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: '12px' }}>Annulla</button>
                  <button onClick={() => handleUpdateProfile({ name: newName, surname: newSurname })} disabled={isUpdating} className="btn btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px' }}>Salva</button>
                </div>
              </div>
            )}

            {/* MANAGEMENT AREA (ADMIN/OWNER ONLY) */}
            {(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'OWNER' || user?.role?.toUpperCase() === 'RESTAURANT_OWNER') && (
              <div style={{ marginBottom: '24px', padding: '20px', background: 'linear-gradient(135deg, #fffcf0 0%, #fff9e6 100%)', borderRadius: '28px', border: '1px solid #fef3c7' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#92400e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LayoutDashboard size={20} color="#d97706" />
                  Area Gestione
                </h3>

                {user?.role?.toUpperCase() === 'ADMIN' && (
                  <SettingRow 
                    icon={Shield} 
                    label="Dashboard Amministratore" 
                    value="Gestione globale della piattaforma" 
                    onClick={() => navigate('/admin/dashboard')}
                    color="#2563eb"
                  />
                )}

                {(user?.role?.toUpperCase() === 'OWNER' || user?.role?.toUpperCase() === 'RESTAURANT_OWNER') && (
                  <SettingRow 
                    icon={LayoutDashboard} 
                    label="Dashboard Ristoratore" 
                    value="Gestione locali e prenotazioni" 
                    onClick={() => navigate('/owner/dashboard')}
                    color="#f59e0b"
                  />
                )}
              </div>
            )}

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="var(--primary)" />
              Sicurezza Account
            </h3>

            <SettingRow 
              icon={Key} 
              label="Cambia Password" 
              value="Proteggi il tuo account" 
              onClick={() => setShowPasswordModal(true)} 
            />
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={20} color="var(--primary)" />
              App & Dispositivo
            </h3>

            {/* PWA SECTION */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '20px', marginBottom: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isInstalled ? '#dcfce7' : 'var(--primary-light)', color: isInstalled ? '#166534' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SmartphoneIcon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800 }}>MORA Web App</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                    {isInstalled 
                      ? "L'applicazione è correttamente installata sul tuo dispositivo." 
                      : "Installa MORA sul tuo dispositivo per un accesso più veloce."}
                  </p>
                </div>
                {isInstalled && <span style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#166534', textTransform: 'uppercase' }}>ATTIVA ✔️</span>}
              </div>

              {!isInstalled && (
                <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px' }}>
                  {isInstallable ? (
                    <button 
                      onClick={install}
                      style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Download size={18} /> Installa app
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                      <p style={{ margin: 0, color: '#64748b', lineHeight: 1.5 }}>
                        Apri il menu del browser ({pwaPlatform === 'ios' ? <Share size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> : 'in alto a destra'}) e seleziona <strong>“Installa app”</strong> oppure <strong>“Aggiungi alla schermata principale”</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <SettingRow 
              icon={Bell} 
              label="Notifiche Smart" 
              value="Ricevi alert su menu ed eventi"
              status={permissionState === 'granted' ? 'ON' : 'OFF'}
              onClick={() => isSubscribed ? unsubscribe() : subscribe()}
            />

            {/* LOCATION SECTION */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '20px', marginBottom: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: geoPermission === 'granted' ? 0 : '16px' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '14px', 
                  background: geoPermission === 'granted' ? '#dcfce7' : (geoPermission === 'denied' ? '#fee2e2' : '#fef3c7'), 
                  color: geoPermission === 'granted' ? '#166534' : (geoPermission === 'denied' ? '#ef4444' : '#d97706'), 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {geoPermission === 'denied' ? <MapPinOff size={24} /> : <MapPin size={24} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800 }}>
                    {geoPermission === 'denied' ? 'Permesso posizione negato' : 'Posizione'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                    {geoPermission === 'granted' && "Posizione attiva"}
                    {geoPermission === 'prompt' && "Attiva la posizione per trovare locali vicino a te"}
                    {geoPermission === 'denied' && "Attiva la posizione dalle impostazioni del browser per usare questa funzione"}
                    {geoPermission === 'loading' && "Verifica permessi in corso..."}
                  </p>
                </div>
                {geoPermission === 'granted' && <span style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#166534', textTransform: 'uppercase' }}>ATTIVA ✔️</span>}
              </div>

              {geoPermission === 'prompt' && (
                <button 
                  onClick={() => requestGeo().catch(() => toast.error("Permesso negato"))}
                  style={{ width: '100%', marginTop: '16px', padding: '12px', border: '2px solid var(--primary)', background: 'transparent', color: 'var(--primary)', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Consenti posizione
                </button>
              )}
            </div>
          </div>
        </div>

        <button 
           onClick={handleLogout}
           style={{ 
             width: '100%', marginTop: '40px', padding: '16px', borderRadius: '18px', 
             border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', 
             fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' 
           }}
        >
          <LogOut size={20} />
          Chiudi Sessione
        </button>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: 'white', borderRadius: '32px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>Sicurezza Password</h3>
                <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={12}/> PASSWORD ATTUALE</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '14px', fontWeight: 600 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>NUOVA PASSWORD</label>
                  <input 
                    type="password" 
                    placeholder="Minimo 8 caratteri" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '14px', fontWeight: 600 }}
                  />
                </div>
                
                <button 
                  onClick={() => handleUpdateProfile({ currentPassword, newPassword })}
                  disabled={isUpdating || newPassword.length < 8 || !currentPassword}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '18px', borderRadius: '16px', fontWeight: 800, marginTop: '12px' }}
                >
                  {isUpdating ? 'Sincronizzazione...' : 'Aggiorna Credenziali'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .setting-row-hover:active { transform: scale(0.98); }
        .setting-row-hover:hover { background-color: #f8fafc !important; border-color: var(--primary-light) !important; }
      `}</style>
    </div>
  );
}

export default ProfilePage;
