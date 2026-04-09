import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Plus } from 'lucide-react';

type EventsEditorProps = {
  restaurant: any;
  token: string;
  onUpdate: () => void;
};

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
};

export default function EventsEditor({ restaurant, token, onUpdate }: EventsEditorProps) {
  const [events, setEvents] = useState<Event[]>(
    (restaurant.events || []).map((e: any) => ({ 
      ...e, 
      id: e.id || Math.random().toString(),
      date: e.date ? new Date(e.date).toISOString().slice(0, 16) : "" // Format for datetime-local
    }))
  );
  const [saving, setSaving] = useState(false);

  const handleAddEvent = () => {
    setEvents([...events, { 
      id: Date.now().toString(), 
      title: "Nuovo Evento", 
      description: "", 
      date: "", 
      location: "", 
      image: "" 
    }]);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleUpdateEvent = (id: string, field: string, value: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Formato non valido. Usa JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'immagine è troppo grande (Max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdateEvent(id, 'image', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validate dates
      for (const ev of events) {
        if (!ev.title || ev.title.trim() === '') {
            throw new Error("Tutti gli eventi devono avere un titolo.");
        }
        if (!ev.date) {
            throw new Error(`La data per l'evento "${ev.title}" è obbligatoria.`);
        }
        if (!ev.description || ev.description.trim() === '') {
            throw new Error(`La descrizione per l'evento "${ev.title}" è obbligatoria.`);
        }
      }

      const res = await fetch(`/api/owner/restaurants/${restaurant.id}/events`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ events })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Errore durante il salvataggio");
      }
      toast.success("Eventi aggiornati con successo!");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card animate-slide-up" style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} /> Gestione Eventi
        </h2>
        <button type="button" onClick={handleAddEvent} className="btn" style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '8px 16px', fontWeight: 600 }}>
          <Plus size={18} /> Aggiungi Evento
        </button>
      </div>
      
      {events.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
          Nessun evento in programma. Clicca su "+ Aggiungi Evento" per iniziare.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {events.map((ev, index) => (
              <div key={ev.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Evento #{index + 1}</h3>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveEvent(ev.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Rimuovi
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Titolo dell'Evento</label>
                    <input type="text" required value={ev.title} onChange={e => handleUpdateEvent(ev.id, 'title', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Data e Ora</label>
                    <input type="datetime-local" required value={ev.date} onChange={e => handleUpdateEvent(ev.id, 'date', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Descrizione</label>
                  <textarea rows={3} value={ev.description || ""} onChange={e => handleUpdateEvent(ev.id, 'description', e.target.value)} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Immagine Copertina (Opzionale)</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleImageUpload(ev.id, e)} style={{ fontSize: '0.8rem' }} />
                  {ev.image && (
                    <div style={{ marginTop: '10px', height: '120px', width: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img loading="lazy" src={ev.image} alt="Event preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px', fontWeight: 600 }}>
            {saving ? "Salvataggio..." : "Salva Eventi"}
          </button>
        </form>
      )}
    </div>
  );
}
