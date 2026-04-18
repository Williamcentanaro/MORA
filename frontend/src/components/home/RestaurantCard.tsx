import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Star, Navigation } from "lucide-react";
import { getRestaurantStatusDetailed } from "../../utils/isOpenNow";

export const CUISINE_FLAGS: Record<string, string> = {
  "messico": "🇲🇽",
  "argentina": "🇦🇷",
  "brasile": "🇧🇷",
  "colombia": "🇨🇴",
  "perù": "🇵🇪",
  "venezuela": "🇻🇪",
  "cile": "🇨🇱",
  "ecuador": "🇪🇨",
  "bolivia": "🇧🇴",
  "cuba": "🇨🇺",
  "spagna": "🇪🇸",
  "italia": "🇮🇹"
};

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
    logo?: string | null;
    reviewsCount?: number;
    averageRating?: number;
    cuisineType?: string | null;
    matchedItem?: {
      name: string;
      price: number | null;
    } | null;
  }
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const statusDetailed = getRestaurantStatusDetailed(restaurant.openingHours);
  
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
            src={restaurant.coverImage || restaurant.logo || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop`} 
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
              background: statusDetailed.status === 'OPEN' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(100, 116, 139, 0.9)',
              color: 'white',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {statusDetailed.text.toUpperCase()}
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', background: '#fffbeb', padding: '4px 8px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800 }}>
                <Star size={14} fill={(restaurant.reviewsCount ?? 0) > 0 ? "var(--accent)" : "transparent"} />
                <span>{restaurant.averageRating ? parseFloat(restaurant.averageRating.toString()).toFixed(1) : parseFloat("0").toFixed(1)}</span>
              </div>
              {(restaurant.reviewsCount ?? 0) > 0 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>({restaurant.reviewsCount} recensioni)</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} style={{ color: 'var(--primary)' }} />
              <span>{restaurant.city}</span>
            </div>
            {restaurant.cuisineType && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                  {CUISINE_FLAGS[restaurant.cuisineType.toLowerCase()] || ''} {restaurant.cuisineType}
                </span>
              </div>
            )}
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
            justifyContent: 'space-between',
            gap: 12
          }}>
            {restaurant.matchedItem ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '0.8rem', 
                color: '#1e293b', 
                fontWeight: 600, 
                background: '#f1f5f9', 
                padding: '6px 12px', 
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                flex: 1,
                overflow: 'hidden'
              }}>
                <span style={{ opacity: 0.6 }}>📖</span>
                <span style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {restaurant.matchedItem.name}
                </span>
                {restaurant.matchedItem.price != null && (
                  <span style={{ color: 'var(--primary)', fontWeight: 800, marginLeft: 'auto' }}>
                    {restaurant.matchedItem.price}€
                  </span>
                )}
              </div>
            ) : restaurant.distance != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, background: '#fff7ed', padding: '6px 12px', borderRadius: '12px' }}>
                <Navigation size={14} />
                <span>{restaurant.distance.toFixed(1)} km</span>
              </div>
            )}

            {restaurant.matchedItem && restaurant.distance != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <Navigation size={12} />
                <span>{restaurant.distance.toFixed(1)}km</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
