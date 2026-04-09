import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

type MediaEditorProps = {
  restaurant: any;
  token: string;
  onUpdate: () => void;
};

type GalleryImage = {
  id: string;
  url: string;
  caption?: string;
};

export default function MediaEditor({ restaurant, token, onUpdate }: MediaEditorProps) {
  const [gallery, setGallery] = useState<GalleryImage[]>(restaurant.gallery || []);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error("Alcuni file hanno un formato non supportato (usa JPG, PNG, WEBP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Alcune immagini sono troppo grandi (Max 5MB).");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setGallery(prev => [
          ...prev, 
          { id: Date.now().toString() + Math.random(), url: reader.result as string, caption: "" }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id: string) => {
    setGallery(gallery.filter(img => img.id !== id));
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    setGallery(gallery.map(img => img.id === id ? { ...img, caption } : img));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch(`/api/owner/restaurants/${restaurant.id}/media`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gallery })
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
    <div className="card" style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Galleria Immagini</h2>
        <div style={{ position: 'relative' }}>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleImageUpload} 
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
          />
          <button type="button" className="btn" style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '8px 16px', fontWeight: 600 }}>
            + Aggiungi Foto
          </button>
        </div>
      </div>
      
      {gallery.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
          Nessuna immagine nella galleria. Trascina qui o clicca "+ Aggiungi Foto".
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {gallery.map((img) => (
              <div key={img.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'white', position: 'relative' }}>
                <div style={{ height: '150px', position: 'relative' }}>
                  <img loading="lazy" src={img.url} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveImage(img.id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}
                    title="Rimuovi"
                  >
                    ×
                  </button>
                </div>
                <div style={{ padding: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Aggiungi una didascalia..." 
                    value={img.caption || ""} 
                    onChange={e => handleUpdateCaption(img.id, e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '6px', width: '100%' }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 24px' }}>
            {saving ? "Salvataggio..." : "Salva Galleria"}
          </button>
        </form>
      )}
    </div>
  );
}
