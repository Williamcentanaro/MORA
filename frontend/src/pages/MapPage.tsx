import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MapSection from "../components/home/MapSection";
import { calculateDistance } from "../utils/distance";

type Restaurant = {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number;
  logo?: string | null;
  cuisineType?: string | null;
  reviewsCount?: number;
  averageRating?: number;
};

const CUISINE_MAP: Record<string, string> = {
  "messico": "Mexican",
  "argentina": "Argentinian",
  "brasile": "Brazilian",
  "colombia": "Colombian",
  "perù": "Peruvian"
}; // Simplified map mapping

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search") || "";
  const selectedCity = searchParams.get("city") || "";

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Hidden fetching logic just to get data onto the map
    const fetchAll = async () => {
      try {
        const res = await fetch("/api/restaurants");
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data);
        }
      } catch (err) { }
    };
    fetchAll();

    // Optionally fetch location if available
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      }, () => {}, { timeout: 3000 });
    }
  }, []);

  const filteredRestaurants = useMemo(() => {
    let result = restaurants;
    if (userLocation) {
        result = result.map(r => {
            if (r.latitude != null && r.longitude != null) {
              return { ...r, distance: calculateDistance(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude) };
            }
            return r;
        });
    }

    return result.filter(r => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(query);
        const mappedCuisine = CUISINE_MAP[query] || query;
        const matchCuisine = r.cuisineType?.toLowerCase().includes(mappedCuisine);
        if (!matchName && !matchCuisine) return false;
      }
      if (selectedCity && r.city !== selectedCity) return false;
      return true;
    });
  }, [restaurants, searchQuery, selectedCity, userLocation]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* Absolute Header Overlay over map */}
      <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10000, 
          padding: 'calc(env(safe-area-inset-top) + 16px) 20px 16px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none'
      }}>
          <button 
             onClick={() => navigate(-1)} 
             style={{ 
                 pointerEvents: 'auto',
                 background: 'white', borderRadius: '50%', width: 44, height: 44, 
                 display: 'flex', alignItems: 'center', justifyContent: 'center', 
                 border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer' 
             }}>
             <ArrowLeft size={22} color="var(--text-main)" />
          </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapSection 
           restaurants={filteredRestaurants}
           userLocation={userLocation}
        />
      </div>

    </div>
  );
}
