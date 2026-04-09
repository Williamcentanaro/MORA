import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Image as ImageIcon, 
  List, 
  Upload, 
  AlertCircle,
  X
} from "lucide-react";

type MenuItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  category?: string;
};

type MenuEditorProps = {
  restaurant: any;
  token: string;
  onUpdate: () => void;
};

export default function MenuEditor({ restaurant, token, onUpdate }: MenuEditorProps) {
  const [activeMenuType, setActiveMenuType] = useState<"REGULAR" | "DAILY">("REGULAR");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  
  const [menuMode, setMenuMode] = useState<"MANUAL" | "PDF" | "IMAGE">(restaurant.menuMode || "MANUAL");
  
  // Separate states for Regular and Daily items
  const [regularItems, setRegularItems] = useState<MenuItem[]>(
    restaurant.menus?.filter((m: any) => m.type === "REGULAR").map((m: any) => ({
      id: m.id || Math.random().toString(36).substr(2, 9),
      title: m.title,
      description: m.description || "",
      price: m.price?.toString() || "",
      category: m.category || ""
    })) || []
  );

  const [dailyItems, setDailyItems] = useState<MenuItem[]>([]);
  
  // Load daily items when date changes
  useEffect(() => {
    if (activeMenuType === "DAILY") {
      const filtered = restaurant.menus?.filter((m: any) => {
        if (m.type !== "DAILY" || !m.date) return false;
        const menuDate = new Date(m.date).toISOString().split('T')[0];
        return menuDate === selectedDate;
      }).map((m: any) => ({
        id: m.id || Math.random().toString(36).substr(2, 9),
        title: m.title,
        description: m.description || "",
        price: m.price?.toString() || "",
        category: m.category || ""
      })) || [];
      setDailyItems(filtered);
    }
  }, [selectedDate, activeMenuType, restaurant.menus]);

  const [menuPdf, setMenuPdf] = useState<string | null>(restaurant.menuPdf || null);
  const [menuImages, setMenuImages] = useState<string[]>(restaurant.menuImages || []);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const currentItems = activeMenuType === "REGULAR" ? regularItems : dailyItems;
  const setCurrentItems = activeMenuType === "REGULAR" ? setRegularItems : setDailyItems;

  const addItem = () => {
    setCurrentItems([
      ...currentItems,
      { id: Math.random().toString(36).substr(2, 9), title: "", description: "", price: "", category: "" }
    ]);
  };

  const removeItem = (id: string) => {
    setCurrentItems(currentItems.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof MenuItem, value: string) => {
    setCurrentItems(currentItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      toast.error("Per favore, carica un file PDF");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuPdf(reader.result as string);
      toast.success("PDF caricato");
    };
    reader.readAsDataURL(file);
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenuImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} immagini caricate`);
  };

  const removeImage = (index: number) => {
    setMenuImages(menuImages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validation
    if (menuMode === "MANUAL") {
      for (const item of currentItems) {
        if (!item.title.trim()) {
          toast.error("Tutti i piatti devono avere un titolo.");
          return;
        }
      }
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/owner/restaurants/${restaurant.id}/menus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          menuMode,
          menuPdf,
          menuImages,
          type: activeMenuType,
          date: activeMenuType === "DAILY" ? selectedDate : null,
          menus: currentItems.map(item => ({
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category
          }))
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Errore durante il salvataggio");
      }
      
      toast.success("Salvato con successo");
      onUpdate();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Gestione Menu</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Distingui tra menu stabile e piatti preparati oggi
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontWeight: 600 }}
        >
          {saving ? "Salvataggio..." : <><Save size={18} /> Salva Sezione</>}
        </button>
      </div>

      {/* Concept Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button 
          onClick={() => setActiveMenuType("REGULAR")}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            background: activeMenuType === "REGULAR" ? 'var(--primary)' : 'white',
            color: activeMenuType === "REGULAR" ? 'white' : 'var(--text-main)',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: activeMenuType === "REGULAR" ? '0 4px 12px rgba(255, 90, 31, 0.2)' : 'none',
            border: activeMenuType === "REGULAR" ? 'none' : '1px solid var(--border)'
          }}
        >
          📖 Menu Permanente
        </button>
        <button 
          onClick={() => setActiveMenuType("DAILY")}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            background: activeMenuType === "DAILY" ? '#22c55e' : 'white',
            color: activeMenuType === "DAILY" ? 'white' : 'var(--text-main)',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: activeMenuType === "DAILY" ? '0 4px 12px rgba(34, 197, 94, 0.2)' : 'none',
            border: activeMenuType === "DAILY" ? 'none' : '1px solid var(--border)'
          }}
        >
          🍳 Preparati Oggi
        </button>
      </div>

      {activeMenuType === "DAILY" && (
        <div className="card" style={{ marginBottom: 24, padding: 16, background: '#f0fdf4', borderColor: '#bbf7d0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, color: '#166534' }}>Data:</span>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #bbf7d0' }}
          />
          <span style={{ fontSize: '0.85rem', color: '#15803d' }}>
            I piatti inseriti qui saranno visibili solo in questa data.
          </span>
        </div>
      )}

      {/* Mode Selector (Only for Regular Menu) */}
      {activeMenuType === "REGULAR" && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 12, 
          marginBottom: 32 
        }}>
          {[
            { id: "MANUAL", label: "Manuale", icon: List, desc: "Crea il menu online" },
            { id: "PDF", label: "PDF", icon: FileText, desc: "Carica un file PDF" },
            { id: "IMAGE", label: "Immagini", icon: ImageIcon, desc: "Foto del menu" }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setMenuMode(mode.id as any)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${menuMode === mode.id ? 'var(--primary)' : 'var(--border)'}`,
                background: menuMode === mode.id ? 'rgba(255, 90, 31, 0.04)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s'
              }}
            >
              <mode.icon size={24} color={menuMode === mode.id ? 'var(--primary)' : 'var(--text-muted)'} />
              <span style={{ fontWeight: 700, color: menuMode === mode.id ? 'var(--primary)' : 'var(--text-main)' }}>{mode.label}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mode.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Editor Content */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>
            {activeMenuType === "REGULAR" ? "Voci del Menu Permanente" : `Specialità del ${new Date(selectedDate).toLocaleDateString('it-IT')}`}
          </h4>
          <button onClick={addItem} className="btn" style={{ fontSize: '0.85rem', background: activeMenuType === "REGULAR" ? '#fff7ed' : '#f0fdf4', color: activeMenuType === "REGULAR" ? 'var(--primary)' : '#166534', border: 'none' }}>
            <Plus size={16} /> Aggiungi Piatto
          </button>
        </div>

        {currentItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p>Nessun elemento presente in questa sezione.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {currentItems.map((item) => (
              <div key={item.id} className="card" style={{ 
                padding: 16, 
                background: '#f8fafc', 
                border: '1px solid var(--border)',
                position: 'relative'
              }}>
                <button 
                  onClick={() => removeItem(item.id)}
                  style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 16, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nome Piatto</label>
                    <input 
                      value={item.title} 
                      onChange={(e) => updateItem(item.id, "title", e.target.value)}
                      placeholder="E.g. Taco al Pastor"
                      style={{ padding: '8px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Prezzo (€)</label>
                    <input 
                      value={item.price} 
                      onChange={(e) => updateItem(item.id, "price", e.target.value)}
                      placeholder="0.00"
                      style={{ padding: '8px 12px' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Categoria</label>
                    <input 
                      value={item.category} 
                      onChange={(e) => updateItem(item.id, "category", e.target.value)}
                      placeholder="Antipasti, Secondi..."
                      style={{ padding: '8px 12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Descrizione / Ingredienti</label>
                    <input 
                      value={item.description} 
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="E.g. Carne di maiale, ananas..."
                      style={{ padding: '8px 12px' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF/Image renders only if they were already there, or we can keep them for Regular only */}
      {activeMenuType === "REGULAR" && menuMode === "PDF" && (
        <div className="card" style={{ padding: 32, textAlign: 'center', marginTop: 24 }}>
          {menuPdf ? (
            <div>
              <div style={{ marginBottom: 16, padding: 16, background: '#f8fafc', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <FileText size={32} color="var(--primary)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Menu_Personalizzato.pdf</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visualizzazione attiva per i clienti</div>
                </div>
                <button 
                  onClick={() => setMenuPdf(null)}
                  className="btn" 
                  style={{ padding: 8, background: '#fee2e2', color: 'var(--danger)', marginLeft: 16 }}
                >
                  <X size={16} /> Rimuovi
                </button>
              </div>
              <iframe src={menuPdf} style={{ width: '100%', height: '500px', border: '1px solid var(--border)', borderRadius: 12 }} title="Menu Preview" />
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--border)', padding: '60px 20px', borderRadius: 16, cursor: 'pointer' }}>
              <Upload size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <h4 style={{ margin: '0 0 8px' }}>Carica il tuo PDF</h4>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Clicca o trascina il file qui per caricarlo</p>
              <input type="file" ref={fileInputRef} onChange={handlePdfUpload} accept=".pdf" style={{ display: 'none' }} />
            </div>
          )}
        </div>
      )}

      {activeMenuType === "REGULAR" && menuMode === "IMAGE" && (
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Foto Menu</h4>
            <button onClick={() => imageInputRef.current?.click()} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <ImageIcon size={16} /> Aggiungi Immagini
            </button>
            <input type="file" multiple ref={imageInputRef} onChange={handleImagesUpload} accept="image/*" style={{ display: 'none' }} />
          </div>

          {menuImages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '2px dashed var(--border)', borderRadius: 12 }}>
              <p style={{ color: 'var(--text-muted)' }}>Nessuna immagine del menu caricata.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
              {menuImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', height: 200, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img loading="lazy" src={img} alt={`Menu ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={14} color="var(--danger)" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
