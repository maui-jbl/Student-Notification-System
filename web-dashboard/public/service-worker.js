const CACHE = 'studnet-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'StudNet', body: '' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    data = { title: 'StudNet', body: event.data?.text() || '' };
  }

  const options = {
    body: data.body,
    icon: '/pwa-icon.svg',
    badge: '/pwa-icon.svg',
    vibrate: [200, 100, 200],
    tag: data.notificationId || 'studnet-notification',
    renotify: true,
    data: { url: data.url || '/' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
