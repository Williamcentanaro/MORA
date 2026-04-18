import { useState, useEffect, useCallback } from 'react';

export type GeolocationState = 'prompt' | 'granted' | 'denied' | 'loading' | 'unsupported';

export function useGeolocation() {
  const [permission, setPermission] = useState<GeolocationState>('loading');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const checkPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setPermission('unsupported');
      return;
    }

    try {
      // Use the Permissions API if available
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermission(result.state as GeolocationState);

        // Listen for changes
        result.onchange = () => {
          setPermission(result.state as GeolocationState);
        };
      } else {
        // Fallback: try to get position to infer permission
        navigator.geolocation.getCurrentPosition(
          () => setPermission('granted'),
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              setPermission('denied');
            } else {
              setPermission('prompt');
            }
          }
        );
      }
    } catch (error) {
      console.error('Error checking geolocation permission:', error);
      setPermission('prompt');
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const request = useCallback(() => {
    return new Promise<{ latitude: number; longitude: number } | null>((resolve, reject) => {
      if (!navigator.geolocation) {
        setPermission('unsupported');
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCoordinates(coords);
          setPermission('granted');
          resolve(coords);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermission('denied');
          }
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  }, []);

  return {
    permission,
    coordinates,
    request,
    refresh: checkPermission
  };
}
