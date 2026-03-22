/* ═══════════════════════════════════════════════════════════
   NeoTerm Service Worker v3.0
   Features:
     ✅ Offline-first caching
     ✅ Background sync
     ✅ Push notifications
     ✅ Auto-update on new deploy
     ✅ Cache versioning
═══════════════════════════════════════════════════════════ */

const APP_VERSION  = "neoterm-v3.0.0";
const STATIC_CACHE = `${APP_VERSION}-static`;
const DYNAMIC_CACHE= `${APP_VERSION}-dynamic`;
const API_CACHE    = `${APP_VERSION}-api`;

/* Assets to pre-cache on install */
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/offline.html",
];

/* ── INSTALL ─────────────────────────────────────────────── */
self.addEventListener("install", event => {
  console.log("[SW] Installing NeoTerm SW", APP_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log("[SW] Pre-caching assets");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

/* ── ACTIVATE ────────────────────────────────────────────── */
self.addEventListener("activate", event => {
  console.log("[SW] Activating NeoTerm SW", APP_VERSION);
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
            .map(name => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim()) // Take control of all pages
  );
});

/* ── FETCH — Stale-while-revalidate strategy ─────────────── */
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin API calls (like Anthropic)
  if (request.method !== "GET") return;
  if (url.hostname === "api.anthropic.com") return;
  if (url.protocol === "chrome-extension:") return;

  // Google Fonts — cache first
  if (url.hostname.includes("fonts.googleapis.com") ||
      url.hostname.includes("fonts.gstatic.com")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Static assets (JS, CSS, images) — cache first
  if (request.destination === "script" ||
      request.destination === "style"  ||
      request.destination === "image"  ||
      request.destination === "font") {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML navigation — network first, fallback to cache, then offline page
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Everything else — stale while revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

/* ── STRATEGIES ──────────────────────────────────────────── */

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Return offline page
    const offlinePage = await caches.match("/offline.html");
    return offlinePage || new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>NeoTerm — Offline</title>
        <style>body{background:#0a0e1a;color:#63b3ed;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:12px}
        h1{font-size:24px}p{color:#4a5568;font-size:13px}</style></head>
        <body>
          <div style="font-size:48px">◈</div>
          <h1>NeoTerm</h1>
          <p>You are offline. Reconnect to continue.</p>
          <p style="color:#68d391">Cached sessions still available ↓</p>
          <button onclick="location.reload()" style="margin-top:12px;padding:10px 24px;background:#63b3ed;color:#0a0e1a;border:none;border-radius:8px;font-family:monospace;font-size:14px;cursor:pointer">Retry</button>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache   = await caches.open(cacheName);
  const cached  = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || await fetchPromise || new Response("Offline", { status: 503 });
}

/* ── BACKGROUND SYNC — retry failed requests ─────────────── */
self.addEventListener("sync", event => {
  console.log("[SW] Background sync:", event.tag);
  if (event.tag === "sync-commands") {
    event.waitUntil(syncPendingCommands());
  }
});

async function syncPendingCommands() {
  // In a real app: read from IndexedDB and retry failed API calls
  console.log("[SW] Syncing pending commands...");
}

/* ── PUSH NOTIFICATIONS ──────────────────────────────────── */
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  const title   = data.title   || "NeoTerm";
  const body    = data.body    || "A cron job completed";
  const icon    = data.icon    || "/icons/icon-192.png";
  const badge   = "/icons/icon-72.png";
  const tag     = data.tag     || "neoterm-notif";

  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon, badge, tag,
      vibrate: [100, 50, 100],
      data: { url: data.url || "/" },
      actions: [
        { action: "open",    title: "Open Terminal" },
        { action: "dismiss", title: "Dismiss" },
      ]
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  if (event.action === "dismiss") return;
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(clientList => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(event.notification.data.url || "/");
    })
  );
});

/* ── MESSAGE — communicate with app ─────────────────────── */
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: APP_VERSION });
  }
  if (event.data?.type === "CLEAR_CACHE") {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => event.ports[0].postMessage({ cleared: true }));
  }
});
