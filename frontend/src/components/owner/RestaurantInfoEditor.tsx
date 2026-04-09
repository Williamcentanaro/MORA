import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

type RestaurantInfoEditorProps = {
  restaurant: any;
  token: string;
  onUpdate: () => void;
};

export default function RestaurantInfoEditor({ restaurant, token, onUpdate }: RestaurantInfoEditorProps) {
  const [formData, setFormData] = useState({
    name: restaurant.name || "",
    description: restaurant.description || "",
    address: restaurant.address || "",
    city: restaurant.city || "",
    coverImage: restaurant.coverImage || "",
    cuisineType: restaurant.cuisineType || ""
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      toast.error("Compila tutti i campi obbligatori (Nome, Indirizzo, Città).");
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

  return (
    <div className="card animate-slide-up" style={{ padding: '30px' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Informazioni Base</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Nome Ristorante</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Indirizzo</label>
            <input 
              type="text" 
              required 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Città</label>
            <input 
              type="text" 
              required 
              value={formData.city} 
              onChange={e => setFormData({...formData, city: e.target.value})} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cucina / Nazionalità</label>
          <select 
            value={formData.cuisineType} 
            onChange={e => setFormData({...formData, cuisineType: e.target.value})}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Descrizione</label>
          <textarea 
            rows={4} 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Immagine Principale (Ricoprirà l'intestazione)</label>
          <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
          {formData.coverImage && (
            <div style={{ marginTop: '10px', height: '150px', width: '250px', borderRadius: '8px', overflow: 'hidden' }}>
              <img loading="lazy" src={formData.coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
          {saving ? "Salvataggio in corso..." : "Salva Modifiche"}
        </button>
      </form>
    </div>
  );
}
