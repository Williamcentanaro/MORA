import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Star, User, MapPin, Phone, Globe, Utensils, Info, 
  ChevronLeft, Share2, Map as MapIcon, Calendar, 
  Users, Clock, MessageSquare, ChevronRight, X,
  MapPinOff, Navigation, Heart, Edit2, Trash2,
  Camera
} from "lucide-react";
import { getRestaurantStatus } from "../utils/isOpenNow";
import type { OpeningHour } from "../utils/isOpenNow";

type Review = {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: { name: string; avatar?: string };
};

type Restaurant = {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  openingHours: OpeningHour[];
  menus: any[];
  coverImage?: string | null;
  gallery?: string[] | null;
  averageRating?: number;
  reviewsCount?: number;
  followerCount?: number;
  reviews?: Review[];
  cuisineType?: string;
};

const DAYS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop";

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Reservation form state
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 2,
    date: "",
    time: "",
    notes: ""
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Refs for Scroll Spy
  const overviewRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const infoRef = useRef<HTMLElement>(null);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    // Decode user from token simple way
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload);
      } catch (e) {}
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/restaurants/${id}`, { headers });
        if (!res.ok) throw new Error("Ristorante non trovato");
        const data = await res.json();
        setRestaurant(data);

        // Fetch follow status
        const fRes = await fetch(`/api/restaurants/${id}/follow/status`, { headers });
        if (fRes.ok) {
          const fData = await fRes.json();
          setIsFollowing(fData.isFollowing);
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  // Scroll Spy and Header Background
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 150);

      const offset = 120;
      if (infoRef.current && scrollY >= infoRef.current.offsetTop - offset) {
        setActiveTab("info");
      } else if (reviewsRef.current && scrollY >= reviewsRef.current.offsetTop - offset) {
        setActiveTab("reviews");
      } else if (menuRef.current && scrollY >= menuRef.current.offsetTop - offset) {
        setActiveTab("menu");
      } else {
        setActiveTab("overview");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (tabName: string, ref: React.RefObject<HTMLElement>) => {
    setActiveTab(tabName);
    if (ref.current) {
        window.scrollTo({
            top: ref.current.offsetTop - 110,
            behavior: "smooth"
        });
    }
  };

  const handleFollowToggle = async () => {
    if (!token) {
      toast.error("Effettua l'accesso per seguire il locale");
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/restaurants/${id}/follow`, {
        method,
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
        setRestaurant(prev => prev ? { 
            ...prev, 
            followerCount: (prev.followerCount || 0) + (isFollowing ? -1 : 1) 
        } : null);
        toast.success(isFollowing ? "Non segui più questo locale" : "Ora segui questo locale!");
      }
    } catch (e) {
      toast.error("Errore di connessione");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Effettua l'accesso per lasciare una recensione");
      navigate("/login", { state: { from: location } });
      return;
    }
    if (rating === 0) return toast.error("Seleziona un punteggio");

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/restaurants/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      if (!res.ok) throw new Error("Errore durante l'invio");
      
      toast.success(editingReviewId ? "Recensione aggiornata!" : "Grazie per la tua recensione!");
      setRating(0);
      setComment("");
      setEditingReviewId(null);
      
      // Refresh data
      const headersFetch: Record<string, string> = {};
      if (token) headersFetch["Authorization"] = `Bearer ${token}`;
      const res2 = await fetch(`/api/restaurants/${id}`, { headers: headersFetch });
      if (res2.ok) setRestaurant(await res2.json());
    } catch (err) {
      toast.error("Errore di connessione");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = (rev: Review) => {
    setRating(rev.rating);
    setComment(rev.comment || "");
    setEditingReviewId(rev.id);
    scrollToSection("reviews", reviewsRef);
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare la tua recensione?")) return;
    
    try {
      const res = await fetch(`/api/restaurants/${id}/reviews`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Recensione eliminata");
        // Refresh data
        const headersFetch: Record<string, string> = {};
        if (token) headersFetch["Authorization"] = `Bearer ${token}`;
        const res2 = await fetch(`/api/restaurants/${id}`, { headers: headersFetch });
        if (res2.ok) setRestaurant(await res2.json());
      }
    } catch (e) {
      toast.error("Errore durante l'eliminazione");
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBooking(true);
    try {
      const res = await fetch(`/api/restaurants/${id}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowBookingModal(false);
        setBookingData({ name: "", email: "", phone: "", guests: 2, date: "", time: "", notes: "" });
      } else {
        toast.error(data.message || "Errore nella prenotazione");
      }
    } catch (err) {
      toast.error("Errore di connessione");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: restaurant.name,
      text: `Guarda questo ristorante su MORA: ${restaurant.name}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiato negli appunti! 📋");
      } catch (err) {
        toast.error("Impossibile copiare il link");
      }
    }
  };

  const openMaps = () => {
    if (!restaurant) return;
    const addr = `${restaurant.address}, ${restaurant.city}`;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIos 
      ? `maps://maps.apple.com/?q=${encodeURIComponent(addr)}` 
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    window.open(url, '_blank');
  };

  const openPhone = () => {
    if (restaurant?.phone) window.open(`tel:${restaurant.phone}`);
  };

  if (loading) return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffcf9' }}>Caricamento in corso...</div>;
  if (!restaurant) return <div style={{ padding: 40, textAlign: 'center' }}>Ristorante non trovato.</div>;

  const images = (() => {
    let galleryArr: string[] = [];
    if (restaurant.gallery) {
        if (Array.isArray(restaurant.gallery)) {
            galleryArr = restaurant.gallery;
        } else if (typeof restaurant.gallery === 'string') {
            try {
                const parsed = JSON.parse(restaurant.gallery);
                if (Array.isArray(parsed)) galleryArr = parsed;
            } catch (e) {}
        }
    }

    if (galleryArr.length > 0) {
      return [restaurant.coverImage, ...galleryArr].filter(Boolean) as string[];
    }

    if (restaurant.images && typeof restaurant.images === 'string') {
        const fallbacks = restaurant.images.split(',').filter(Boolean);
        if (fallbacks.length > 0) return [restaurant.coverImage, ...fallbacks].filter(Boolean) as string[];
    }
    return [restaurant.coverImage].filter(Boolean) as string[];
  })();

  const heroImage = images.length > 0 ? images[currentImageIndex] : FALLBACK_IMAGE;

  return (
    <div style={{ minHeight: '100dvh', background: '#fffcf9', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
      
      {/* HEADER OVERLAY */}
      <header style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, 
        padding: 'calc(env(safe-area-inset-top) + 12px) 20px 12px',
        background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255, 90, 31, 0.1)' : 'none',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            width: 40, height: 40, borderRadius: '16px', background: isScrolled ? '#fff' : 'rgba(0,0,0,0.3)', 
            border: isScrolled ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isScrolled ? 'var(--primary)' : 'white',
            boxShadow: isScrolled ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <ChevronLeft size={24} />
        </button>
        
        {isScrolled && (
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, flex: 1, textAlign: 'center', color: '#1e293b' }}>
            {restaurant.name}
          </h1>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleShare}
            style={{ 
              width: 40, height: 40, borderRadius: '16px', background: isScrolled ? '#fff' : 'rgba(0,0,0,0.3)', 
              border: isScrolled ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isScrolled ? 'var(--primary)' : 'white'
            }}
          >
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* HERO SECTION - IMAGE SWIPE */}
      <div style={{ position: 'relative', height: '48dvh', overflow: 'hidden', background: '#f8fafc' }}>
        <img 
          src={heroImage} 
          alt={restaurant.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 100%)'
        }} />
        
        {!restaurant.coverImage && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
             <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '50%', backdropFilter: 'blur(5px)' }}>
                <Camera size={48} color="white" strokeWidth={1.5} />
             </div>
          </div>
        )}

        {images.length > 1 && (
          <div style={{ 
            position: 'absolute', bottom: 20, right: 20, background: 'rgba(255,255,255,0.2)', 
            backdropFilter: 'blur(10px)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* MAIN TITLE CARD */}
      <div style={{ 
        marginTop: '-40px', position: 'relative', background: '#fffcf9', 
        borderTopLeftRadius: '36px', borderTopRightRadius: '36px', padding: '32px 24px 0',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ 
                    padding: '4px 10px', background: 'rgba(255, 90, 31, 0.1)', color: 'var(--primary)', 
                    borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' 
                }}>
                  {restaurant.cuisineType || "Gastronomia"}
                </span>
            </div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a', lineHeight: 1 }}>
              {restaurant.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFF1CC', padding: '4px 8px', borderRadius: '10px' }}>
                <Star size={16} fill="#FFB800" color="#FFB800" />
                <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#996E00' }}>{restaurant.averageRating?.toFixed(1) || "5.0"}</span>
              </div>
              <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>({restaurant.reviewsCount || 0} reviews)</span>
              <span style={{ color: '#e2e8f0' }}>•</span>
              <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{restaurant.followerCount || 0} followers</span>
            </div>
          </div>
          
          <button 
            onClick={handleFollowToggle}
            style={{ 
              padding: '12px 20px', borderRadius: '20px', 
              background: isFollowing ? 'white' : 'var(--primary)', 
              color: isFollowing ? 'var(--primary)' : 'white',
              border: `2px solid var(--primary)`,
              fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: isFollowing ? 'none' : '0 4px 12px rgba(255, 90, 31, 0.2)'
            }}
          >
            <Heart size={18} fill={isFollowing ? "var(--primary)" : "none"} />
            {isFollowing ? "Seguito" : "Segui"}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem', padding: '12px 0' }}>
          <MapPin size={18} color="var(--primary)" />
          <span>{restaurant.address}, {restaurant.city}</span>
          <span style={{ color: '#e2e8f0' }}>•</span>
          {(() => {
                const status = getRestaurantStatus(restaurant.openingHours);
                return (
                  <span style={{ fontWeight: 700, color: status === 'OPEN' ? '#10b981' : '#ef4444' }}>
                    {status === 'OPEN' ? 'Aperto ora' : 'Chiuso'}
                  </span>
                );
          })()}
        </div>
      </div>

      {/* STICKY TABS */}
      <nav style={{ 
        position: 'sticky', top: isScrolled ? 'calc(env(safe-area-inset-top) + 64px)' : 0, 
        zIndex: 900, background: '#fffcf9', borderBottom: '1px solid rgba(255, 90, 31, 0.1)',
        display: 'flex', padding: '0 10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch'
      }}>
        {[
          { id: "overview", label: "Overview", ref: overviewRef },
          { id: "menu", label: "Menu", ref: menuRef },
          { id: "reviews", label: "Reviews", ref: reviewsRef },
          { id: "info", label: "Info", ref: infoRef }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => scrollToSection(tab.id, tab.ref)}
            style={{ 
              padding: '20px 24px', background: 'none', border: 'none', 
              fontSize: '0.9rem', fontWeight: 800, color: activeTab === tab.id ? 'var(--primary)' : '#94a3b8',
              borderBottom: activeTab === tab.id ? '4px solid var(--primary)' : '4px solid transparent',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* SECTIONS */}
      <div className="container" style={{ padding: '32px 24px' }}>
        
        {/* OVERVIEW */}
        <section ref={overviewRef} style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.03em' }}>La nostra storia</h2>
          <div style={{ 
            background: 'white', padding: '24px', borderRadius: '28px', border: '1px solid rgba(255, 90, 31, 0.05)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative'
          }}>
            <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>
              {restaurant.description || "Nessuna descrizione disponibile. Contattaci per saperne di più su questo speciale angolo di sapori."}
            </p>
          </div>
        </section>

        {/* MENU PREVIEW */}
        <section ref={menuRef} style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>Esplora il Menu 🍽️</h2>
            <button 
              onClick={() => navigate(`/restaurants/${id}/menu`)}
              style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', background: 'rgba(255, 90, 31, 0.05)', padding: '8px 16px', borderRadius: '12px', border: 'none' }}
            >
              Vedi tutto
            </button>
          </div>
          <div 
            onClick={() => navigate(`/restaurants/${id}/menu`)}
            style={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
              borderRadius: '28px', padding: '32px', color: 'white', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)'
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 900 }}>Il Gusto Tradizionale</h3>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.5 }}>Piatti stagionali, ingredienti freschi e ricette latine autentiche.</p>
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: 'rgba(255, 90, 31, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '20px', transform: 'rotate(-5deg)' }}>
              <Utensils size={28} color="white" />
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section ref={reviewsRef} style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>Cosa dicono di noi</h2>
             {editingReviewId && (
                <button onClick={() => { setEditingReviewId(null); setRating(0); setComment(""); }} style={{ fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', fontWeight: 700 }}>Annulla Modifica</button>
             )}
          </div>
          
          {/* Review Summary & Input Card - WARMER DESIGN */}
          <div style={{ background: '#fff', borderRadius: '28px', padding: '24px', border: '2px solid rgba(255, 184, 0, 0.1)', marginBottom: '24px', boxShadow: '0 8px 30px rgba(255, 184, 0, 0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>
              {editingReviewId ? "Modifica la tua recensione" : "Lascia un segno della tua visita"}
            </h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} onClick={() => setRating(s)}
                  style={{ background: 'none', border: 'none', padding: 0, transition: 'transform 0.1s' }}
                >
                  <Star size={36} fill={s <= rating ? "#FFB800" : "none"} stroke={s <= rating ? "#FFB800" : "#e2e8f0"} strokeWidth={2} />
                </button>
              ))}
            </div>
            <textarea 
              value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Raccontaci i sapori che hai scoperto..." 
              style={{ 
                width: '100%', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', 
                fontSize: '1rem', marginBottom: '16px', minHeight: '120px', outline: 'none',
                background: '#fafafa'
              }}
            />
            <button 
              onClick={handleReviewSubmit}
              disabled={isSubmittingReview}
              style={{ 
                width: '100%', padding: '16px', borderRadius: '20px', background: 'var(--primary)', 
                color: 'white', border: 'none', fontWeight: 900, fontSize: '1rem',
                boxShadow: '0 6px 20px rgba(255, 90, 31, 0.3)'
              }}
            >
              {isSubmittingReview ? "Salvataggio..." : (editingReviewId ? "Aggiorna Recensione" : "Pubblica Esperienza")}
            </button>
          </div>

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {restaurant.reviews && restaurant.reviews.length > 0 ? (
              restaurant.reviews.map((rev) => {
                const isOwn = currentUser && rev.userId === currentUser.id;
                return (
                    <div key={rev.id} style={{ 
                        background: isOwn ? 'rgba(255, 90, 31, 0.02)' : 'transparent',
                        padding: '20px', borderRadius: '24px', border: isOwn ? '1px dashed var(--primary)' : 'none'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--primary)' }}>
                            {rev.user?.name?.charAt(0).toUpperCase() || "M"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#1e293b' }}>{rev.user?.name || "Ospite"}</div>
                            <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < rev.rating ? "#FFB800" : "none"} stroke={i < rev.rating ? "#FFB800" : "#e2e8f0"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                              {new Date(rev.updatedAt).toLocaleDateString("it-IT", { day: 'numeric', month: 'short' })}
                            </div>
                            {isOwn && (
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => handleEditReview(rev)} style={{ background: 'none', border: 'none', color: '#64748b', padding: 0 }}><Edit2 size={16} /></button>
                                    <button onClick={handleDeleteReview} style={{ background: 'none', border: 'none', color: '#ef4444', padding: 0 }}><Trash2 size={16} /></button>
                                </div>
                            )}
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>{rev.comment}</p>
                    </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#cbd5e1' }}>
                <MessageSquare size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p style={{ margin: 0, fontWeight: 700 }}>Ancora nessuna recensione.</p>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Sii il primo ad inaugurare il locale!</p>
              </div>
            )}
          </div>
        </section>

        {/* INFORMATION */}
        <section ref={infoRef}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.03em' }}>Dove trovarci</h2>
          
          <div style={{ background: 'white', borderRadius: '28px', padding: '24px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 90, 31, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>Posizione</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{restaurant.address}, {restaurant.city}</div>
                  </div>
                </div>
                {restaurant.phone && (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 90, 31, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Phone size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>Contatto diretto</div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{restaurant.phone}</div>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 90, 31, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={20} color="var(--primary)" />
                  </div>
                  <div style={{ width: '100%' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', marginBottom: '10px' }}>Orari della settimana</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {restaurant.openingHours?.length > 0 ? (
                        [...restaurant.openingHours].sort((a,b) => (a.dayOfWeek || 0) - (b.dayOfWeek || 0)).map((oh) => (
                          <div key={oh.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: '#64748b', fontWeight: 600 }}>{DAYS[oh.dayOfWeek]}</span>
                            <span style={{ fontWeight: 800, color: '#1e293b' }}>{oh.openTime} - {oh.closeTime}</span>
                          </div>
                        ))
                      ) : (<p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Orari non specificati.</p>)}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </section>

      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100,
        background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 90, 31, 0.05)',
        padding: '16px 24px calc(16px + env(safe-area-inset-bottom))',
        display: 'flex', gap: '12px', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={openPhone} style={{ width: '56px', height: '56px', borderRadius: '20px', background: 'white', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
            <Phone size={24} color="#1e293b" />
          </button>
          <button onClick={openMaps} style={{ width: '56px', height: '56px', borderRadius: '20px', background: 'white', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
            <Navigation size={24} color="#1e293b" />
          </button>
        </div>
        <button 
          onClick={() => setShowBookingModal(true)}
          style={{ 
            flex: 1, height: '56px', borderRadius: '22px', background: 'var(--primary)', 
            color: 'white', border: 'none', fontWeight: 900, fontSize: '1.05rem',
            boxShadow: '0 8px 24px rgba(255, 90, 31, 0.3)', letterSpacing: '-0.01em'
          }}
        >
          Prenota ora
        </button>
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ 
            width: '100%', background: '#fffcf9', borderTopLeftRadius: '40px', borderTopRightRadius: '40px',
            padding: '36px 24px calc(48px + env(safe-area-inset-bottom))',
            animation: 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.04em' }}>Prenota un tavolo</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Esperienza garantita a {restaurant.name}</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '10px', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', marginLeft: '4px' }}>Data</label>
                    <input type="date" required value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', outline: 'none', fontSize: '0.95rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', marginLeft: '4px' }}>Orario</label>
                    <input type="time" required value={bookingData.time} onChange={e => setBookingData({...bookingData, time: e.target.value})} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', outline: 'none', fontSize: '0.95rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', marginLeft: '4px' }}>Quanti sarete?</label>
                <input type="number" min="1" required value={bookingData.guests} onChange={e => setBookingData({...bookingData, guests: parseInt(e.target.value)})} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              <input placeholder="Il tuo nome e cognome" required value={bookingData.name} onChange={e => setBookingData({...bookingData, name: e.target.value})} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', outline: 'none', fontSize: '0.95rem' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <input placeholder="Telefono" type="tel" required value={bookingData.phone} onChange={e => setBookingData({...bookingData, phone: e.target.value})} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', outline: 'none', fontSize: '0.95rem' }} />
                <input placeholder="Email" type="email" required value={bookingData.email} onChange={e => setBookingData({...bookingData, email: e.target.value})} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              
              <textarea placeholder="Hai allergie o richieste particolari?" value={bookingData.notes} onChange={e => setBookingData({...bookingData, notes: e.target.value})} style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', outline: 'none', fontSize: '0.95rem', minHeight: '100px', resize: 'none' }} />
              
              <div style={{ background: '#FFF8E6', padding: '16px', borderRadius: '20px', border: '1px solid #FFEBB3', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#996E00', fontWeight: 600, lineHeight: 1.5 }}>
                  Inviando la richiesta, il ristorante verificherà la disponibilità e ti confermerà la prenotazione via telefono o email.
                </p>
              </div>
              
              <button 
                type="submit" disabled={isSubmittingBooking}
                style={{ 
                    width: '100%', padding: '18px', borderRadius: '22px', background: 'var(--primary)', 
                    color: 'white', border: 'none', fontWeight: 900, fontSize: '1.1rem',
                    boxShadow: '0 8px 24px rgba(255, 90, 31, 0.3)', marginTop: '8px'
                }}
              >
                {isSubmittingBooking ? "Invio in corso..." : "Invia Richiesta"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        nav::-webkit-scrollbar { display: none; }
        input:focus, textarea:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 4px rgba(255, 90, 31, 0.05) !important; }
      `}</style>
    </div>
  );
}
