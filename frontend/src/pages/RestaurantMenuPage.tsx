import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Image as ImageIcon, FileText, Utensils } from "lucide-react";
import { toast } from "react-hot-toast";

type Menu = {
  id: string;
  title: string;
  description?: string;
  type: "DAILY" | "REGULAR";
  content: any;
  price?: number | null;
  items?: any[];
};

type Restaurant = {
  id: string;
  name: string;
  menuMode?: string;
  menuPdf?: string | null;
  menuImages?: string[] | null;
  menus?: Menu[];
};

export default function RestaurantMenuPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/restaurants/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
        } else {
          toast.error("Impossibile caricare il menu");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Caricamento menu...</div>;
  if (!restaurant) return <div style={{ padding: 40, textAlign: 'center' }}>Ristorante non trovato</div>;

  const renderContent = () => {
    // 1. PDF Mode
    if (restaurant.menuMode === 'PDF' && restaurant.menuPdf) {
      return (
        <div style={{ height: 'calc(100dvh - 80px)', width: '100%', overflow: 'hidden' }}>
          <iframe 
            src={restaurant.menuPdf} 
            style={{ width: '100%', height: '100%', border: 'none' }} 
            title={`Menu ${restaurant.name}`}
          />
        </div>
      );
    }

    // 2. Images Mode
    if (restaurant.menuMode === 'IMAGE' && restaurant.menuImages && restaurant.menuImages.length > 0) {
      return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {restaurant.menuImages.map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              alt={`Pagina ${idx + 1}`} 
              style={{ width: '100%', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
            />
          ))}
        </div>
      );
    }

    // 3. Manual Mode (Regular + Daily)
    const allMenus = restaurant.menus || [];
    if (allMenus.length > 0) {
      return (
        <div style={{ padding: '20px' }}>
          {allMenus.map((menu) => (
            <div key={menu.id} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Utensils size={20} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{menu.title}</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>{menu.description}</p>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {menu.items && menu.items.length > 0 ? (
                  menu.items.map((item: any) => (
                    <div key={item.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{item.name}</h3>
                        {item.price && <span style={{ fontWeight: 800, color: 'var(--primary)' }}>€{Number(item.price).toFixed(2)}</span>}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{item.description}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>Nessun piatto in questa sezione.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
        <Utensils size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
        <p>Nessun menu disponibile per questo locale.</p>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#ffffff', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        background: 'white', padding: 'calc(env(safe-area-inset-top) + 12px) 20px 12px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Menu</h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{restaurant.name}</p>
          </div>
        </div>
        
        {restaurant.menuMode === 'PDF' && restaurant.menuPdf && (
          <a 
            href={restaurant.menuPdf} 
            download={`${restaurant.name}-menu.pdf`}
            style={{ color: 'var(--primary)', padding: '8px' }}
          >
            <Download size={20} />
          </a>
        )}
      </div>

      <main>
        {renderContent()}
      </main>
    </div>
  );
}
