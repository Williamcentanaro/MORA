import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  restaurantId: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const lastSeenIdsRef = useRef<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');

  const fetchNotifications = useCallback(async (isPoll = false) => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Notification[] = await res.json();
        
        // Trigger toasts for NEW unread notifications during polling
        if (isPoll && lastSeenIdsRef.current.size > 0) {
          const newUnread = data.filter(n => !n.isRead && !lastSeenIdsRef.current.has(n.id));
          newUnread.forEach(n => {
            toast((t) => (
              <div 
                onClick={() => {
                  handleNotificationClick(n);
                  toast.dismiss(t.id);
                }} 
                style={{ cursor: 'pointer' }}
              >
                <b>{n.title}</b>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>{n.message}</p>
              </div>
            ), { icon: '🔔', duration: 5000 });
          });
        }

        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
        
        // Update seen IDs ref
        data.forEach(n => lastSeenIdsRef.current.add(n.id));
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [token]);

  // Initial fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling interval
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => fetchNotifications(true), 30000);
    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

  // Re-fetch when opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) {
      handleMarkAsRead(n.id);
    }
    setIsOpen(false);
    let path = `/restaurants/${n.restaurantId}`;
    if (n.type === 'NEW_EVENT') path += '#events';
    if (n.type === 'NEW_DAILY_MENU') path += '#menu';
    navigate(path);
  };

  if (!token) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          padding: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          color: 'var(--text-muted)',
          position: 'relative'
        }}
        title="Notifiche"
      >
        <Bell size={22} color={unreadCount > 0 ? 'var(--primary)' : 'currentColor'} />
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '4px', 
            right: '4px', 
            background: '#ef4444', 
            color: 'white', 
            fontSize: '10px', 
            fontWeight: 700, 
            minWidth: '16px', 
            height: '16px', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="notifications-dropdown"
          style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '10px', 
            width: '320px', 
            maxHeight: '400px', 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: 'var(--shadow-lg)', 
            border: '1px solid var(--border)', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          <div style={{ padding: '15px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Notifiche</span>
            {unreadCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{unreadCount} nuove</span>}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Nessuna notifica presente.
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  style={{ 
                    padding: '12px 15px', 
                    borderBottom: '1px solid var(--border)', 
                    background: n.isRead ? 'transparent' : 'rgba(37, 99, 235, 0.05)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--primary)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: n.isRead ? 'var(--text-muted)' : 'var(--text)', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n.id, e);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      >
                        Letta
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                    {n.message}
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#94a3b8' }}>
                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid var(--border)', background: '#f8fafc' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Mostrate le ultime {notifications.length} notifiche</span>
          </div>
        </div>
      )}
    </div>
  );
}
