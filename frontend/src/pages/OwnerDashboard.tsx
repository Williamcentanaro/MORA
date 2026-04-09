import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

import { motion, AnimatePresence } from "framer-motion";
import { getRestaurantStatus } from "../utils/isOpenNow";
import type { OpeningHour } from "../utils/isOpenNow";

type Restaurant = {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  coverImage?: string | null;
  followerCount: number;
  eventCount: number;
  hasTodayMenu: boolean;
  openingHours: OpeningHour[];
};

// Component to handle map clicks
function LocationPickerMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

// Component to handle map centering and movement
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom() < 13 ? 15 : map.getZoom());
  }, [center, map]);
  return null;
}

function OwnerDashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [user, setUser] = useState<{ name: string, plan: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "", // Combined address for backend
    city: "",
    streetName: "",
    streetNumber: "",
    postalCode: "",
    country: "Italia",
    latitude: "",
    longitude: "",
    coverImage: "",
    cuisineType: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<any[] | null>(null);
  const [streetSuggestions, setStreetSuggestions] = useState<any[] | null>(null);
  const [activeTimeout, setActiveTimeout] = useState<any>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUserInfo();
    fetchMyRestaurants();
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const fetchMyRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/restaurants", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
          if (res.status === 403) {
              navigate("/");
              return;
          }
          throw new Error("Errore nel caricamento dei dati");
      }
      const data = await res.json();
      setRestaurants(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalFollowers = restaurants.reduce((acc, r) => acc + (r.followerCount || 0), 0);
  const activeMenusCount = restaurants.filter(r => r.hasTodayMenu).length;
  const totalEvents = restaurants.reduce((acc, r) => acc + (r.eventCount || 0), 0);
  const approvedCount = restaurants.filter(r => r.status === 'APPROVED').length;

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Require all mandatory fields
    if (!formData.name.trim()) {
      setError("Il nome del ristorante è obbligatorio.");
      return;
    }
    if (!formData.streetName.trim() || !formData.streetNumber.trim()) {
      setError("Via e numero civico sono obbligatori.");
      return;
    }
    if (!formData.city.trim()) {
      setError("La città è obbligatoria.");
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      setError("Per favore, verifica l'indirizzo cliccando su 'Verifica Indirizzo' o seleziona la posizione sulla mappa.");
      return;
    }

    setSubmitting(true);
    setMsg("");
    setError("");

    // Build the final address string for the backend before submitting
    const finalAddress = `${formData.streetName} ${formData.streetNumber}, ${formData.city}`;

    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          address: finalAddress
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Errore durante la creazione");
      }

      setMsg("Ristorante inviato con successo e in attesa di approvazione! 🎉");
      setFormData({ 
        name: "", 
        description: "", 
        address: "", 
        city: "", 
        streetName: "", 
        streetNumber: "", 
        postalCode: "", 
        country: "Italia",
        latitude: "", 
        longitude: "",
        coverImage: "",
        cuisineType: ""
      });
      setShowForm(false);
      fetchMyRestaurants(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const searchNominatim = async (params: Record<string, string>, setter: (data: any) => void) => {
    try {
      const q = new URLSearchParams({ format: 'json', limit: '5', addressdetails: '1', ...params }).toString();
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${q}`);
      const data = await res.json();
      setter(data.length > 0 ? data : []);
    } catch(e) {
      setter([]);
    }
  };

  const handleCityChange = (val: string) => {
    setFormData({ ...formData, city: val });
    if (activeTimeout) clearTimeout(activeTimeout);
    if (val.length < 2) { setCitySuggestions(null); return; }
    setActiveTimeout(setTimeout(() => {
      searchNominatim({ city: val, featuretype: 'settlement' }, setCitySuggestions);
    }, 400));
  };

  const handleStreetChange = (val: string) => {
    setFormData({ ...formData, streetName: val });
    if (activeTimeout) clearTimeout(activeTimeout);
    if (val.length < 3) { setStreetSuggestions(null); return; }
    setActiveTimeout(setTimeout(() => {
      const streetQuery = `${val}, ${formData.city}`;
      searchNominatim({ q: streetQuery }, setStreetSuggestions);
    }, 400));
  };

  const selectCity = (s: any) => {
    setFormData({ ...formData, city: s.name || s.display_name.split(',')[0] });
    setCitySuggestions(null);
  };

  const selectStreet = (s: any) => {
    const street = s.address?.road || s.address?.pedestrian || s.name || s.display_name.split(',')[0];
    setFormData({ 
      ...formData, 
      streetName: street,
      latitude: s.lat,
      longitude: s.lon
    });
    setStreetSuggestions(null);
  };

  const handleHouseNumberBlur = () => {
    // Optional: could trigger a final verification here
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError("Formato immagine non valido. Usa JPG, PNG o WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'immagine è troppo grande. Massimo 5MB consentiti.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, coverImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Caricamento...</div>;

  const mapCenter: [number, number] = formData.latitude && formData.longitude 
    ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
    : [41.8719, 12.5674]; // Default to center of Italy

  const markerPosition = formData.latitude && formData.longitude 
    ? L.latLng(parseFloat(formData.latitude), parseFloat(formData.longitude))
    : null;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header & Stats Section */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', padding: '60px 0 100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.2 }} />
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: 'white' }}>Gestione Locali</h1>
                {user && (
                    <span style={{ 
                        background: user.plan === 'PRO' ? 'linear-gradient(45deg, #f59e0b, #fbbf24)' : 'rgba(255,255,255,0.1)',
                        color: user.plan === 'PRO' ? '#78350f' : 'rgba(255,255,255,0.7)',
                        padding: '4px 12px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        border: user.plan === 'PRO' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {user.plan} PLAN
                    </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.7, fontWeight: 500 }}>Dashboard Operativa Proprietario</p>
            </div>
            {!showForm && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowForm(true); setActiveStep(1); }}
                className="btn btn-primary"
                style={{ padding: '14px 28px', borderRadius: '16px', fontSize: '1rem', boxShadow: '0 10px 20px rgba(255,51,102,0.3)' }}
              >
                + Nuovo Ristorante
              </motion.button>
            )}
          </div>

          {/* Operational Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { label: 'Followers Totali', value: totalFollowers, icon: '📈', color: '#3b82f6' },
              { label: 'Menu Attivi Oggi', value: activeMenusCount, icon: '📋', color: '#10b981' },
              { label: 'Eventi in Programma', value: totalEvents, icon: '🎭', color: '#f59e0b' },
              { label: 'Status Account', value: approvedCount === restaurants.length ? 'APPROVATO' : 'IN ATTESA', icon: '🛡️', color: '#8b5cf6' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '24px', 
                  padding: '24px', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <main className="container" style={{ marginTop: '-40px', position: 'relative' }}>
        {/* Quick Actions Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: 'white', 
            borderRadius: '24px', 
            padding: '20px', 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '40px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ alignSelf: 'center', marginRight: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Azioni Rapide:</span>
          </div>
          <button onClick={() => { setShowForm(true); setActiveStep(1); }} className="btn" style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>+ Nuovo Ristorante</button>
          <button onClick={() => { setMsg("Scorri sotto e clicca su 'Manage Menu' nel locale desiderato."); setTimeout(() => { document.getElementById('managed-restaurants')?.scrollIntoView({ behavior: 'smooth' }); }, 500); }} className="btn" style={{ background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>Aggiungi Menu di Oggi</button>
          <button onClick={() => { setMsg("Scorri sotto e clicca su 'Create Event' nel locale desiderato."); setTimeout(() => { document.getElementById('managed-restaurants')?.scrollIntoView({ behavior: 'smooth' }); }, 500); }} className="btn" style={{ background: '#fffbeb', color: '#d97706', border: 'none', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>Crea Evento</button>
        </motion.div>

        {user?.plan === 'FREE' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              style={{ 
                background: 'linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%)', 
                color: '#1e40af', 
                padding: '16px 24px', 
                borderRadius: '20px', 
                marginBottom: '24px', 
                fontWeight: 700, 
                border: '1px solid #bfdbfe',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(37,99,235,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🚀</span>
                <span>Passa a <strong>PRO</strong> per inviare notifiche push ai tuoi follower quando pubblichi nuovi menu o eventi!</span>
              </div>
              <button className="btn" style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.8rem', padding: '8px 16px' }}>Scopri di più</button>
            </motion.div>
        )}

        {msg && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#dcfce7', color: '#166534', padding: '16px 24px', borderRadius: '16px', marginBottom: '24px', fontWeight: 600, border: '1px solid #bbf7d0', textAlign: 'center' }}>
            {msg} <button onClick={() => setMsg("")} style={{ background: 'none', border: 'none', marginLeft: '10px', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fee2e2', color: '#991b1b', padding: '16px 24px', borderRadius: '16px', marginBottom: '24px', fontWeight: 600, border: '1px solid #fecaca', textAlign: 'center' }}>
            {error} <button onClick={() => setError("")} style={{ background: 'none', border: 'none', marginLeft: '10px', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
          </motion.div>
        )}

        {/* Multi-Step Creation Form */}
        <AnimatePresence>
          {showForm && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="card" style={{ marginBottom: 40, border: 'none', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>Nuovo Ristorante</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {[1, 2, 3].map(step => (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '8px', 
                            borderRadius: '4px', 
                            backgroundColor: activeStep >= step ? 'var(--primary)' : '#e2e8f0',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: activeStep === step ? '0 0 10px rgba(255,51,102,0.3)' : 'none'
                          }} />
                          {step < 3 && <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>•</span>}
                        </div>
                      ))}
                      <span style={{ marginLeft: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', opacity: 0.8 }}>{activeStep}/3</span>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '20px', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                </div>

                <form onSubmit={handleCreateRestaurant}>
                  {activeStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontWeight: 800, fontSize: "0.85rem", color: '#64748b', textTransform: 'uppercase' }}>Nome Locale</label>
                        <input required type="text" placeholder="Es. Osteria del Mare" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '16px', borderRadius: '14px' }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontWeight: 800, fontSize: "0.85rem", color: '#64748b', textTransform: 'uppercase' }}>Descrizione</label>
                        <textarea rows={3} placeholder="Racconta la storia del tuo ristorante..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '16px', borderRadius: '14px', resize: 'vertical' }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontWeight: 800, fontSize: "0.85rem", color: '#64748b', textTransform: 'uppercase' }}>Cucina / Nazionalità</label>
                        <select 
                          required 
                          value={formData.cuisineType} 
                          onChange={e => setFormData({...formData, cuisineType: e.target.value})} 
                          style={{ padding: '16px', borderRadius: '14px', background: '#fff', border: '1px solid #e2e8f0' }}
                        >
                          <option value="">Seleziona una cucina...</option>
                          <option value="Peruvian">Peruviana 🇵🇪</option>
                          <option value="Ecuadorian">Ecuadoriana 🇪🇨</option>
                          <option value="Argentinian">Argentina 🇦🇷</option>
                          <option value="Brazilian">Brasiliana 🇧🇷</option>
                          <option value="Mexican">Messicana 🇲🇽</option>
                          <option value="Venezuelan">Venezuelana 🇻🇪</option>
                          <option value="Colombian">Colombiana 🇨🇴</option>
                          <option value="Cuban">Cubana 🇨🇺</option>
                          <option value="Other">Altro / Mista</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <button type="button" onClick={() => setActiveStep(2)} className="btn btn-primary" style={{ padding: '14px 40px', borderRadius: '14px' }}>Prossimo Step →</button>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, position: 'relative' }}>
                          <label style={{ fontWeight: 800, fontSize: "0.85rem", color: '#64748b', textTransform: 'uppercase' }}>Città</label>
                          <input required type="text" value={formData.city} onChange={e => handleCityChange(e.target.value)} onFocus={() => setStreetSuggestions(null)} onBlur={() => setTimeout(() => setCitySuggestions(null), 200)} style={{ padding: '16px', borderRadius: '14px' }} />
                          {citySuggestions && (
                            <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 2000, borderRadius: '12px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', background: 'white' }}>
                              {citySuggestions.map((s, i) => (
                                <div key={i} onClick={() => selectCity(s)} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>{s.display_name}</div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, position: 'relative' }}>
                          <label style={{ fontWeight: 800, fontSize: "0.85rem", color: '#64748b', textTransform: 'uppercase' }}>Via</label>
                          <input required type="text" value={formData.streetName} onChange={e => handleStreetChange(e.target.value)} onBlur={() => setTimeout(() => setStreetSuggestions(null), 200)} style={{ padding: '16px', borderRadius: '14px' }} />
                          {streetSuggestions && (
                            <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 2000, borderRadius: '12px', marginTop: '4px', background: 'white' }}>
                              {streetSuggestions.map((s, i) => (
                                <div key={i} onClick={() => selectStreet(s)} style={{ padding: '12px', cursor: 'pointer' }}>{s.display_name}</div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <label style={{ fontWeight: 800, fontSize: "0.85rem", color: '#64748b', textTransform: 'uppercase' }}>N° Civico</label>
                          <input required type="text" value={formData.streetNumber} onChange={e => setFormData({...formData, streetNumber: e.target.value})} onBlur={handleHouseNumberBlur} style={{ padding: '16px', borderRadius: '14px' }} />
                        </div>
                      </div>

                      <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <MapContainer center={mapCenter} zoom={formData.latitude ? 15 : 5} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <MapController center={mapCenter} />
                          <LocationPickerMarker position={markerPosition} setPosition={(pos) => setFormData({...formData, latitude: pos.lat.toString(), longitude: pos.lng.toString()})} />
                        </MapContainer>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                        <button type="button" onClick={() => setActiveStep(1)} className="btn" style={{ background: '#f1f5f9', padding: '14px 30px', borderRadius: '14px' }}>Indietro</button>
                        <button type="button" onClick={() => setActiveStep(3)} className="btn btn-primary" style={{ padding: '14px 40px', borderRadius: '14px' }}>Ultimo Passo →</button>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontWeight: 800, fontSize: "0.85rem", color: '#64748b', textTransform: 'uppercase' }}>Immagine di Copertina</label>
                        <div style={{ border: '2px dashed #e2e8f0', borderRadius: '20px', padding: '40px', textAlign: 'center', background: '#f8fafc', transition: 'all 0.3s ease' }}>
                          <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                          {formData.coverImage ? (
                            <div style={{ position: 'relative' }}>
                              <img src={formData.coverImage} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '16px' }} />
                              <button type="button" onClick={() => setFormData({...formData, coverImage: ""})} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '10px' }}>Rimuovi</button>
                            </div>
                          ) : (
                            <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📸</div>
                              <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>Clicca per caricare</p>
                              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>JPG, PNG o WEBP fino a 5MB</p>
                            </label>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                        <button type="button" onClick={() => setActiveStep(2)} className="btn" style={{ background: '#f1f5f9', padding: '14px 30px', borderRadius: '14px' }}>Indietro</button>
                        <button disabled={submitting} type="submit" className="btn btn-primary" style={{ padding: '14px 50px', borderRadius: '14px', fontWeight: 800 }}>
                          {submitting ? "Invio in corso..." : "Invia per Approvazione ✨"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div id="managed-restaurants" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>I tuoi Ristoranti</h2>
          </div>

          {restaurants.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '80px 40px', background: 'white', borderRadius: '32px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🏠</div>
              <h3 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Nessun ristorante ancora registrato</h3>
              <p style={{ color: '#64748b', marginBottom: '32px' }}>Inizia registrando il tuo primo locale per iniziare a ricevere follower e gestire menu.</p>
              <button onClick={() => { setShowForm(true); setActiveStep(1); }} className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: '14px' }}>Inizia Ora</button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
              {restaurants.map((r, idx) => {
                const status = getRestaurantStatus(r.openingHours);
                const isOpen = status === 'OPEN';

                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="card"
                    style={{ 
                      padding: 0, 
                      overflow: 'hidden', 
                      borderRadius: '28px', 
                      border: '1px solid #f1f5f9',
                      background: 'white',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ position: 'relative', height: '200px' }}>
                      <img src={r.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                        <span style={{ 
                          background: r.status === 'APPROVED' ? '#dcfce7' : r.status === 'PENDING' ? '#fffbeb' : '#fee2e2',
                          color: r.status === 'APPROVED' ? '#166534' : r.status === 'PENDING' ? '#9a3412' : '#991b1b',
                          padding: '6px 14px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}>
                          {r.status}
                        </span>
                      </div>
                      <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                        <span style={{ background: isOpen ? '#22c55e' : '#64748b', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                          {isOpen ? 'Aperto' : 'Chiuso'}
                        </span>
                        {r.hasTodayMenu && (
                          <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                            Menu Oggi ✨
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '24px', flex: 1 }}>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>{r.name}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 500 }}>📍 {r.address}, {r.city}</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <button onClick={() => navigate(`/owner/restaurants/${r.id}`)} className="btn" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>Edit</button>
                        <button onClick={() => navigate(`/owner/restaurants/${r.id}?tab=menu`)} className="btn" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>Manage Menu</button>
                        <button onClick={() => navigate(`/owner/restaurants/${r.id}?tab=events`)} className="btn" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>Create Event</button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          onClick={() => navigate(`/restaurants/${r.id}`)} 
                          className="btn" 
                          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}
                        >
                          View Public
                        </motion.button>
                      </div>
                    </div>
                    
                    <div style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ opacity: 0.7 }}>👥</span> {r.followerCount}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ opacity: 0.7 }}>🎉</span> {r.eventCount}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        ID: {r.id.split('-')[0]}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .card:hover { transform: translateY(-8px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1) !important; }
        input:focus, textarea:focus { border-color: var(--primary) !important; ring: 2px solid rgba(255,51,102,0.1); }
        .glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
      `}</style>
    </div>
  );
}

export default OwnerDashboard;
