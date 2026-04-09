import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY = 'BAXiq2euA5Wzc43ci546ZQYcZGEsQVJlrAlvyOxV84XV-AlzkWTteBGAWy6G0ravBqeBvLz7yaj8Psa81Egmv7c';

export function usePushNotifications() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkSubscription = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setLoading(false);
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
            setPermissionState(Notification.permission);
        } catch (err) {
            console.error('Error checking subscription:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    const [permissionState, setPermissionState] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    const requestPermission = async () => {
        const permission = await Notification.requestPermission();
        setPermissionState(permission);
        return permission;
    };

    const subscribe = async () => {
        setError(null);
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const permission = await requestPermission();
            
            if (permission !== 'granted') {
                throw new Error('Permesso negato. Abilita le notifiche nelle impostazioni del browser.');
            }
// ...

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            console.log('Push subscription created successfully:', subscription.toJSON());

            const res = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ subscription: subscription.toJSON() })
            });

            console.log('Payload sent to backend:', { subscription: subscription.toJSON() });

            if (!res.ok) throw new Error('Errore nel salvataggio della sottoscrizione');

            setIsSubscribed(true);
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setError(null);
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                await subscription.unsubscribe();
                
                // Opzionale: notifiche backend della cancellazione
                await fetch('/api/notifications/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                });
            }

            setIsSubscribed(false);
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { isSubscribed, permissionState, loading, error, subscribe, unsubscribe, requestPermission };
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
