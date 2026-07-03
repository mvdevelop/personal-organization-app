// ─── OrgApp Service Worker ────────────────────────────────
// Cache de assets estáticos para melhor performance offline.
// Registrado em main.tsx (apenas em produção)

const STATIC_CACHE = "orgapp-static-v1";
const DATA_CACHE = "orgapp-data-v1";

// Assets pré-cacheados no install (apenas produção)
const PRECACHE_URLS = ["/", "/index.css", "/icon.svg"];

// Instalação — cacheia assets estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

// Ativação — limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DATA_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

// Intercepta fetch
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora WebSocket HMR do Vite
  if (url.pathname.startsWith("/ws")) return;

  // Ignora arquivos do Vite em dev (HMR, módulos otimizados)
  if (url.pathname.startsWith("/node_modules/.vite/")) return;
  if (url.pathname.startsWith("/@vite/")) return;
  if (url.pathname.startsWith("/@react-refresh")) return;
  if (url.pathname.startsWith("/src/")) return;

  // Ignora API calls — sempre busca da rede
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache First para dados estáticos
  if (url.pathname.startsWith("/data/")) {
    event.respondWith(cacheFirst(request, DATA_CACHE));
    return;
  }

  // Cache First para imagens, fontes e ícones
  if (
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Network First para páginas HTML
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }
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
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      "<html><body style='text-align:center;padding:2rem;font-family:sans-serif;background:#111;color:#f0f0f0'><h1 style='color:#3b82f6'>◆ OrgApp</h1><p>Você está offline. Conecte-se à internet para continuar.</p></body></html>",
      { headers: { "Content-Type": "text/html" } },
    );
  }
}
