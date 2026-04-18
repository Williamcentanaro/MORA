import { Link, useLocation } from "react-router-dom";
import { Compass, CalendarDays, Heart, User, LayoutDashboard, ShieldCheck } from "lucide-react";

interface BottomNavProps {
  user?: {
    role: string;
    name: string;
  } | null;
}

export default function BottomNav({ user }: BottomNavProps) {
  const location = useLocation();

  const navItems = [
    { name: "Esplora", path: "/", icon: <Compass size={24} /> },
    { name: "Eventi", path: "/events", icon: <CalendarDays size={24} /> },
  ];

  // Add Owner Dashboard if user is an owner
  if (user?.role === 'owner' || user?.role === 'RESTAURANT_OWNER') {
    navItems.push({ name: "Gestione", path: "/owner/dashboard", icon: <LayoutDashboard size={24} /> });
  } 
  // Add Admin Dashboard if user is an admin
  else if (user?.role === 'admin') {
    navItems.push({ name: "Admin", path: "/admin/dashboard", icon: <ShieldCheck size={24} /> });
  }

  // Common items
  navItems.push({ name: "Preferiti", path: "/favorites", icon: <Heart size={24} /> });
  navItems.push({ name: "Profilo", path: "/profile", icon: <User size={24} /> });

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: 'env(safe-area-inset-bottom)', // Safe area for iPhone home indicator
      background: 'white',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/restaurants'));
        
        return (
          <Link 
            key={item.name} 
            to={item.path} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              textDecoration: 'none',
              padding: '12px 6px 8px',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              flex: 1,
              minWidth: 0 // Prevent text overflow
            }}
          >
            <div style={{ 
              marginBottom: '4px',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isActive ? 'scale(1.15)' : 'scale(1)'
            }}>
              {item.icon}
            </div>
            <span style={{ 
              fontSize: '0.62rem', 
              fontWeight: isActive ? 800 : 600,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
              textAlign: 'center'
            }}>
              {item.name}
            </span>
          </Link>
        )
      })}
    </div>
  );
}
