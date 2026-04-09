/* eslint-disable no-restricted-globals */
self.addEventListener('push', function (event) {
    let data = {};
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            // Fallback for plain text or manual DevTools push
            data = {
                title: 'Notifica di test',
                body: event.data.text() || 'Nessun contenuto'
            };
        }
    } else {
        data = {
            title: 'Nessun dato',
            body: 'Ricevuta notifica push senza payload'
        };
    }

    const options = {
        body: data.body,
        icon: '/vite.svg', // Fallback icon path (existing in public/)
        badge: '/vite.svg',
        data: {
            url: data.url || '/'
        },
        actions: [
            { action: 'open', title: 'Apri' },
            { action: 'close', title: 'Chiudi' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Notifica', options)
            .catch(err => {
                if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
                    console.warn('Impossibile mostrare la notifica: Permessi non concessi.');
                } else {
                    console.error('Errore durante showNotification:', err);
                }
            })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'close') return;

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});
