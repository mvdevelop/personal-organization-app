// Smart Agenda Service Worker
// Static/API caching is deliberately separate from authenticated mutations.

const STATIC_CACHE = 'orgapp-static-v2';
const DATA_CACHE = 'orgapp-data-v1';
const API_CACHE = 'orgapp-api-v1';
const PRECACHE_URLS = ['/', '/index.html', '/icon.svg', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DATA_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

// Updates are controlled by the app so a new worker does not interrupt a
// session. The app can send this message after displaying an update prompt.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();

  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/ws')) return;
  if (url.pathname.startsWith('/node_modules/.vite/')) return;
  if (url.pathname.startsWith('/@vite/')) return;
  if (url.pathname.startsWith('/@react-refresh')) return;
  if (url.pathname.startsWith('/src/')) return;

  // Never cache authentication or CSRF responses.
  if (url.pathname === '/api/csrf-token' || url.pathname.startsWith('/api/auth/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  if (url.pathname.startsWith('/data/')) {
    event.respondWith(cacheFirst(request, DATA_CACHE));
    return;
  }

  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname === '/icon.svg'
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstSPA(request));
    return;
  }

  event.respondWith(networkFirst(request, STATIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request);
  }
}

async function networkFirst(request, cacheName = STATIC_CACHE) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(null, { status: 503, statusText: 'Offline' });
  }
}

async function networkFirstAPI(request) {
  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (request.method === 'GET') {
      const cached = await caches.match(request);
      if (cached) return cached;
    }
    // Mutations are not queued here: the authenticated app client owns the
    // queue and can obtain fresh Authorization/CSRF headers safely.
    return new Response(
      JSON.stringify({ error: 'Offline — ação não foi enviada. Tente novamente quando conectar.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

async function networkFirstSPA(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match('/') || await caches.match('/index.html');
    if (cached) return cached;
    return new Response(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Smart Agenda</title></head><body><div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b1020;color:#f8fafc;font-family:sans-serif;text-align:center"><h1 style="color:#7778f6">Smart Agenda</h1><p>Você está offline. Conecte-se para continuar.</p></div></body></html>',
      { headers: { 'Content-Type': 'text/html' } },
    );
  }
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.tag === 'welcome') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      }),
    );
  }
});
