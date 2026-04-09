import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

type Restaurant = {
    id: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    latitude?: number | null;
    longitude?: number | null;
};

interface MapComponentProps {
    restaurants: Restaurant[];
    userLocation?: { latitude: number; longitude: number; timestamp?: number } | null;
}

// Custom Pulsing User Icon
const userIcon = L.divIcon({
    className: 'user-location-icon',
    html: `
        <div class="pulsing-container">
            <div class="pulsing-dot"></div>
            <div class="pulsing-ring"></div>
        </div>
        <style>
            .pulsing-container {
                position: relative;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .pulsing-dot {
                width: 12px;
                height: 12px;
                background-color: #3b82f6;
                border: 2px solid white;
                border-radius: 50%;
                z-index: 2;
                box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
            }
            .pulsing-ring {
                position: absolute;
                width: 24px;
                height: 24px;
                border: 3px solid #3b82f6;
                border-radius: 50%;
                animation: pulse 2s infinite;
                z-index: 1;
                opacity: 0;
            }
            @keyframes pulse {
                0% { transform: scale(0.5); opacity: 0; }
                50% { opacity: 0.5; }
                100% { transform: scale(1.5); opacity: 0; }
            }
        </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Custom Brand Marker for Restaurants
const restaurantIcon = L.divIcon({
    className: 'restaurant-marker',
    html: `<div style="
        background-color: var(--primary); 
        width: 32px; 
        height: 32px; 
        border-radius: 50% 50% 50% 0; 
        transform: rotate(-45deg); 
        display: flex; 
        align-items: center; 
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(255, 90, 31, 0.4);
    ">
        <div style="transform: rotate(45deg); font-size: 16px;">🍴</div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Helper component to handle map movement
function MapController({ center, zoom, timestamp }: { center: [number, number], zoom: number, timestamp?: number }) {
    const map = useMap();
    
    const { latitude, longitude } = center ? { latitude: center[0], longitude: center[1] } : { latitude: 0, longitude: 0 };

    useEffect(() => {
        if (center && latitude !== 0 && longitude !== 0) {
            map.flyTo([latitude, longitude], zoom, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [latitude, longitude, zoom, map, timestamp]);

    return null;
}

const MapComponent = ({ restaurants, userLocation }: MapComponentProps) => {
    // Initial center: if user available, fly there. Otherwise center of Italy
    const position: [number, number] = userLocation 
        ? [userLocation.latitude, userLocation.longitude] 
        : [41.8719, 12.5674];

    const zoom = userLocation ? 16 : 5;

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '24px', overflow: 'hidden', border: 'none' }}>
            <MapContainer 
                center={position} 
                zoom={zoom} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <MapController center={position} zoom={zoom} timestamp={userLocation?.timestamp} />
                
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {userLocation && (
                    <>
                        <Circle 
                            center={[userLocation.latitude, userLocation.longitude]}
                            radius={1000}
                            pathOptions={{ 
                                fillColor: '#3b82f6', 
                                fillOpacity: 0.1, 
                                color: '#3b82f6', 
                                weight: 1,
                                dashArray: '5, 5'
                            }}
                            interactive={false}
                        />
                        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                            <Popup>
                                <div style={{ fontWeight: 800, color: '#3b82f6' }}>La tua posizione</div>
                            </Popup>
                        </Marker>
                    </>
                )}

                {restaurants.map((restaurant) => {
                    if (restaurant.latitude && restaurant.longitude) {
                        return (
                            <Marker 
                                key={restaurant.id} 
                                position={[restaurant.latitude, restaurant.longitude]}
                                icon={restaurantIcon}
                            >
                                <Popup>
                                    <div style={{ padding: '8px', minWidth: '150px' }}>
                                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 900 }}>
                                            {restaurant.name}
                                        </strong>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                            {restaurant.address}, {restaurant.city}
                                        </p>
                                        <Link 
                                            to={`/restaurants/${restaurant.id}`} 
                                            style={{ 
                                                display: 'block',
                                                textAlign: 'center',
                                                backgroundColor: 'var(--primary)',
                                                color: 'white',
                                                padding: '8px 12px',
                                                borderRadius: '10px',
                                                fontWeight: 800,
                                                textDecoration: 'none',
                                                fontSize: '0.8rem',
                                                boxShadow: '0 4px 10px rgba(255, 90, 31, 0.2)'
                                            }}
                                        >
                                            Vedi dettagli →
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }
                    return null;
                })}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
