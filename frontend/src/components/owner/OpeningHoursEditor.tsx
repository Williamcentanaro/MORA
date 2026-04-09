import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clock, Trash2 } from 'lucide-react';

type OpeningHoursEditorProps = {
  restaurant: any;
  token: string;
  onUpdate: () => void;
};

const DAYS = [
  { value: 1, label: "Lunedì" },
  { value: 2, label: "Martedì" },
  { value: 3, label: "Mercoledì" },
  { value: 4, label: "Giovedì" },
  { value: 5, label: "Venerdì" },
  { value: 6, label: "Sabato" },
  { value: 0, label: "Domenica" }
];

type EditorOpeningHour = {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
};

export default function OpeningHoursEditor({ restaurant, token, onUpdate }: OpeningHoursEditorProps) {
  const [hours, setHours] = useState<EditorOpeningHour[]>(
    (restaurant.openingHours || []).map((h: any) => ({ ...h, id: h.id || Math.random().toString() }))
  );
  const [saving, setSaving] = useState(false);

  const handleAddSlot = (dayOfWeek: number) => {
    setHours([...hours, { id: Date.now().toString(), dayOfWeek, openTime: "09:00", closeTime: "18:00" }]);
  };

  const handleRemoveSlot = (id: string) => {
    setHours(hours.filter(h => h.id !== id));
  };

  const handleUpdateSlot = (id: string, field: 'openTime' | 'closeTime', value: string) => {
    setHours(hours.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Validate
    for (const h of hours) {
      if (!h.openTime || !h.closeTime) {
        toast.error("Completa tutti gli orari prima di salvare.");
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/owner/restaurants/${restaurant.id}/hours`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ openingHours: hours })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Errore durante il salvataggio");
      }
      toast.success("Orari aggiornati con successo!");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card animate-slide-up" style={{ padding: '30px' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={20} /> Orari di Apertura
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {DAYS.map(day => {
            const daySlots = hours.filter(h => h.dayOfWeek === day.value);
            const isClosed = daySlots.length === 0;

            return (
              <div key={day.value} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: daySlots.length > 0 ? '15px' : '0' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {day.label}
                    {isClosed && <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px' }}>Chiuso</span>}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => handleAddSlot(day.value)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    + Aggiungi Turno
                  </button>
                </div>

                {daySlots.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {daySlots.map((slot, index) => (
                      <div key={slot.id || index} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Apertura</label>
                          <input type="time" required value={slot.openTime} onChange={e => handleUpdateSlot(slot.id, 'openTime', e.target.value)} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Chiusura</label>
                          <input type="time" required value={slot.closeTime} onChange={e => handleUpdateSlot(slot.id, 'closeTime', e.target.value)} />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSlot(slot.id)}
                          style={{ background: '#fee2e2', color: '#991b1b', border: 'none', width: '38px', height: '38px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Rimuovi turno"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px', fontWeight: 600 }}>
          {saving ? "Salvataggio..." : "Salva Orari"}
        </button>
      </form>
    </div>
  );
}
