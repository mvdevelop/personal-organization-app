// ─── Smart Agenda Service Worker ──────────────────────────────
// Cache de assets estáticos + estratégia offline com IndexedDB.
// Registrado em main.tsx (apenas em produção)

const STATIC_CACHE = 'orgapp-static-v1';
const DATA_CACHE = 'orgapp-data-v1';
const API_CACHE = 'orgapp-api-v1';

// Assets pré-cacheados
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json',
];

// Instalação — cacheia assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

// Ativação — limpa caches antigos
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

// Intercepta fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora WebSocket HMR do Vite
  if (url.pathname.startsWith('/ws')) return;

  // Ignora arquivos do Vite em dev
  if (url.pathname.startsWith('/node_modules/.vite/')) return;
  if (url.pathname.startsWith('/@vite/')) return;
  if (url.pathname.startsWith('/@react-refresh')) return;
  if (url.pathname.startsWith('/src/')) return;

  // API calls — Network First with fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // Cache First para dados estáticos
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(cacheFirst(request, DATA_CACHE));
    return;
  }

  // Cache First para imagens, fontes e ícones
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname === '/icon.svg'
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Network First para páginas HTML (SPA fallback)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstSPA(request));
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

// Cache First: tenta cache, fallback pra rede
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request);
  }
}

// Network First: tenta rede, fallback pra cache
async function networkFirst(request, cacheName = STATIC_CACHE) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(null, { status: 503, statusText: 'Offline' });
  }
}

// Network First for API — no caching for mutations
async function networkFirstAPI(request) {
  try {
    const response = await fetch(request);
    // Cache successful GET responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // For GET requests, try cache
    if (request.method === 'GET') {
      const cached = await caches.match(request);
      if (cached) return cached;
    }
    // For mutations while offline, queue for sync
    if (request.method !== 'GET') {
      if ('serviceWorker' in self.registration && 'sync' in self.registration) {
        const syncRegistration = await self.registration.sync.register('sync-queue');
      }
    }
    return new Response(
      JSON.stringify({ error: 'Offline — ação será sincronizada quando conectar' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

// SPA fallback for navigation requests
async function networkFirstSPA(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match('/') || await caches.match('/index.html');
    if (cached) return cached;
    return new Response(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Smart Agenda</title></head><body><div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b1020;color:#f8fafc;font-family:sans-serif;text-align:center"><h1 style="color:#7778f6">Smart Agenda</h1><p>Voce esta offline. Conecte-se para continuar.</p></div></body></html>',
      { headers: { 'Content-Type': 'text/html' } },
    );
  }
}

// Background sync for offline mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue() {
  if (typeof indexedDB === 'undefined') return;

  const db = await openIndexedDB();
  if (!db) return;

  const tx = db.transaction('sync-queue', 'readwrite');
  const store = tx.objectStore('sync-queue');
  const items = await store.getAll();

  for (const item of items) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: item.body ? JSON.stringify(item.body) : undefined,
        credentials: 'include',
      });

      if (response.ok) {
        await store.delete(item.id);
      } else {
        // Increment retry count
        item.retryCount += 1;
        if (item.retryCount >= 3) {
          await store.delete(item.id);
        } else {
          await store.put(item);
        }
      }
    } catch {
      // Network still down, keep in queue
    }
  }
}

function openIndexedDB() {
  return new Promise(null); // Placeholder — will be replaced in actual browser context
}
