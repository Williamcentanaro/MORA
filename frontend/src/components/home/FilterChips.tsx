import { Star, Clock, MapPin, SlidersHorizontal, Search, Euro } from "lucide-react";
import React from "react";

interface FilterChipsProps {
  minRating: number | null;
  setMinRating: (val: number | null) => void;
  openNow: boolean;
  setOpenNow: (val: boolean) => void;
  maxDistance: number | null;
  setMaxDistance: (val: number | null) => void;
  maxPrice: number | null;
  setMaxPrice: (val: number | null) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onOpenFilterModal: () => void;
  onClearAll: () => void;
}

export default function FilterChips({
  minRating,
  setMinRating,
  openNow,
  setOpenNow,
  maxDistance,
  setMaxDistance,
  maxPrice,
  setMaxPrice,
  searchQuery,
  setSearchQuery,
  onOpenFilterModal,
  onClearAll
}: FilterChipsProps) {
  const toggleRating = () => setMinRating(minRating !== null ? null : 4);
  const toggleOpen = () => setOpenNow(!openNow);
  const toggleDistance = () => setMaxDistance(maxDistance !== null ? null : 15);
  const togglePrice = () => setMaxPrice(maxPrice !== null ? null : 20);

  const hasAnyFilter = minRating !== null || openNow || maxDistance !== null || maxPrice !== null || searchQuery !== '';

  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
    background: active ? '#fff7ed' : '#ffffff',
    color: active ? 'var(--primary)' : 'var(--text-main)',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    boxShadow: active ? '0 2px 8px rgba(255, 90, 31, 0.15)' : 'none',
  });

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      padding: '4px 0',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      marginTop: '12px'
    }} className="hide-scrollbar">
      
      <button style={{ ...chipStyle(false), background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid #e2e8f0', boxShadow: 'none' }} onClick={onOpenFilterModal}>
        <SlidersHorizontal size={14} />
        Filtri
      </button>

      {searchQuery && (
        <button style={{ ...chipStyle(true), paddingRight: '12px' }} onClick={() => setSearchQuery('')}>
          <Search size={14} color="var(--primary)" />
          "{searchQuery}" ✕
        </button>
      )}

      <button style={chipStyle(minRating !== null)} onClick={toggleRating}>
        <Star size={14} fill={minRating !== null ? 'var(--primary)' : 'none'} color={minRating !== null ? 'var(--primary)' : 'var(--text-main)'} />
        {minRating !== null && '✓ '} {minRating !== null ? `${minRating}.0+` : 'Valutazione'}
      </button>

      <button style={chipStyle(openNow)} onClick={toggleOpen}>
        <Clock size={14} color={openNow ? 'var(--primary)' : 'var(--text-main)'} />
        {openNow && '✓ '} Aperto ora
      </button>

      <button style={chipStyle(maxDistance !== null)} onClick={toggleDistance}>
        <MapPin size={14} color={maxDistance !== null ? 'var(--primary)' : 'var(--text-main)'} />
        {maxDistance !== null && '✓ '} {maxDistance !== null ? `Entro ${maxDistance}km` : 'Distanza'}
      </button>

      <button style={chipStyle(maxPrice !== null)} onClick={togglePrice}>
        <Euro size={14} color={maxPrice !== null ? 'var(--primary)' : 'var(--text-main)'} />
        {maxPrice !== null && '✓ '} {maxPrice !== null ? `≤ ${maxPrice}€` : 'Prezzo'}
      </button>

      {hasAnyFilter && (
        <button 
          style={{ 
            ...chipStyle(false), 
            color: 'var(--text-muted)', 
            border: 'none', 
            background: 'transparent', 
            paddingLeft: '12px' 
          }} 
          onClick={onClearAll}
        >
          Resetta tutto
        </button>
      )}

    </div>
  );
}
