import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
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

type RestaurantInfoEditorProps = {
  restaurant: any;
  token: string;
  onUpdate: () => void;
};

function LocationPickerMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position} />;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom() < 13 ? 15 : map.getZoom());
  }, [center, map]);
  return null;
}

export default function RestaurantInfoEditor({ restaurant, token, onUpdate }: RestaurantInfoEditorProps) {
  const [formData, setFormData] = useState({
    name: restaurant.name || "",
    description: restaurant.description || "",
    address: restaurant.address || "",
    city: restaurant.city || "",
    latitude: restaurant.latitude || "",
    longitude: restaurant.longitude || "",
    coverImage: restaurant.coverImage || "",
    cuisineType: restaurant.cuisineType || "",
    gallery: (() => {
        if (!restaurant.gallery) return [];
        if (Array.isArray(restaurant.gallery)) return restaurant.gallery;
        if (typeof restaurant.gallery === 'string') {
            try {
                const parsed = JSON.parse(restaurant.gallery);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    })()
  });

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ 
        ...prev, 
        gallery: [...prev.gallery, reader.result as string] 
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };
  const [saving, setSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Formato non valido. Usa JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Immagine troppo grande (Max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, coverImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const verifyAddress = async () => {
    if (!formData.city || !formData.address) {
      toast.error("Inserisci città e indirizzo completo.");
      return;
    }
    setSaving(true);
    try {
      const q = `${formData.address}, ${formData.city}, Italia`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        setFormData({ ...formData, latitude: data[0].lat, longitude: data[0].lon });
        toast.success("Posizione verificata!");
      } else {
        toast.error("Impossibile trovare l'indirizzo. Selezionalo sulla mappa.");
      }
    } catch (err) {
      toast.error("Errore durante la verifica.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      toast.error("Compila tutti i campi obbligatori.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/owner/restaurants/${restaurant.id}/info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Errore durante il salvataggio");
      }
      toast.success("Salvato con successo");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const mapCenter: [number, number] = formData.latitude && formData.longitude 
    ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
    : [41.8719, 12.5674];

  const markerPosition = formData.latitude && formData.longitude 
    ? L.latLng(parseFloat(formData.latitude), parseFloat(formData.longitude))
    : null;

  return (
    <div className="card animate-slide-up" style={{ padding: '30px' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Informazioni Base</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Nome Ristorante</label>
          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '16px 20px', borderRadius: '14px', fontSize: '1.05rem', border: '2px solid #e2e8f0' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Città</label>
            <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ padding: '16px 20px', borderRadius: '14px', fontSize: '1.05rem', border: '2px solid #e2e8f0' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Indirizzo</label>
                <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ padding: '16px 20px', borderRadius: '14px', fontSize: '1.05rem', border: '2px solid #e2e8f0' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Civico</label>
                <input type="text" placeholder="N°" value={formData.address.split(',')[0].split(' ').pop() === formData.address ? "" : formData.address.split(',')[0].split(' ').pop()} onChange={e => {
                    // This is a bit complex because the editor uses a single address field in existing data
                    // We'll just let them edit the address field as a whole for now to avoid breaking existing logic
                    // but we ensure the style is correct.
                }} disabled style={{ padding: '16px 10px', borderRadius: '14px', fontSize: '1.05rem', border: '2px solid #f1f5f9', textAlign: 'center', background: '#f8fafc' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-8px' }}>
            <button type="button" onClick={verifyAddress} className="btn" style={{ background: '#eff6ff', color: '#2563eb', padding: '12px 24px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, border: '1px solid #bfdbfe' }}>🔍 Verifica Posizione sulla Mappa</button>
        </div>

        <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
            <MapContainer center={mapCenter} zoom={formData.latitude ? 15 : 5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapController center={mapCenter} />
                <LocationPickerMarker position={markerPosition} setPosition={(pos) => setFormData({...formData, latitude: pos.lat.toString(), longitude: pos.lng.toString()})} />
            </MapContainer>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Cucina / Nazionalità</label>
          <select 
            value={formData.cuisineType} 
            onChange={e => setFormData({...formData, cuisineType: e.target.value})}
            style={{ padding: '16px 20px', borderRadius: '14px', border: '2px solid #e2e8f0', background: '#fff', fontSize: '1.05rem' }}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Descrizione</label>
          <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '16px 20px', borderRadius: '14px', fontSize: '1.05rem', border: '2px solid #e2e8f0' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Immagine Principale (Cover)</label>
          <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
          {formData.coverImage && (
            <div style={{ marginTop: '10px', height: '180px', width: '320px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img loading="lazy" src={formData.coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Galleria Immagini</label>
              <label className="btn" style={{ background: '#fff', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}>
                + Aggiungi Foto
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGalleryUpload} />
              </label>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                {formData.gallery.map((img: string, idx: number) => (
                    <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <img src={img} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >✕</button>
                    </div>
                ))}
                {formData.gallery.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.9rem', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
                        Nessuna immagine in galleria.
                    </div>
                )}
           </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
          {saving ? "Salvataggio in corso..." : "Salva Modifiche"}
        </button>
      </form>
    </div>
  );
}
