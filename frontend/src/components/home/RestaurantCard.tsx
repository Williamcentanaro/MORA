import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Clock, Star, Navigation } from "lucide-react";
import { getRestaurantStatus } from "../../utils/isOpenNow";

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    distance?: number;
    openingHours?: any[];
    coverImage?: string | null;
  };
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const status = getRestaurantStatus(restaurant.openingHours);
  
  return (
    <motion.div
      whileHover={{ y: -12 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08)',
        border: '1px solid var(--border)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <Link to={`/restaurants/${restaurant.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Card Image Wrapper */}
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
          <img 
            src={restaurant.coverImage || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop`} 
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2
          }}>
            <span style={{ 
              padding: '6px 12px', 
              borderRadius: '12px', 
              fontSize: '0.75rem', 
              fontWeight: 800,
              background: status === 'OPEN' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(100, 116, 139, 0.9)',
              color: 'white',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {status === 'OPEN' ? 'APERTO' : 'CHIUSO'}
            </span>
          </div>
          
          {/* Brand Accent at bottom of image */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'var(--primary)',
            zIndex: 2
          }}></div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {restaurant.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', background: '#fffbeb', padding: '4px 8px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800 }}>
              <Star size={14} fill="var(--accent)" />
              <span>4.8</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', fontWeight: 500 }}>
            <MapPin size={14} style={{ color: 'var(--primary)' }} />
            <span>{restaurant.city}</span>
          </div>

          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-muted)', 
            marginBottom: '24px', 
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1
          }}>
            {restaurant.description || "Un'esperienza autentica nel cuore della cucina latino-americana."}
          </p>

          <div style={{ 
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            {restaurant.distance != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, background: '#fff7ed', padding: '6px 12px', borderRadius: '12px' }}>
                <Navigation size={14} />
                <span>{restaurant.distance.toFixed(1)} km</span>
              </div>
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} />
              Presto
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
