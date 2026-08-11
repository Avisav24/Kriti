/* ==========================================================
   KOKO — Service Worker
   Cache-first for static assets, network-only for media,
   explicit offline messaging.
   ========================================================== */

const CACHE_NAME = 'koko-v1';
const PRECACHE_ASSETS = [
  '/',
  '/fonts/instrument-serif-regular.woff2',
  '/fonts/inter-variable.woff2',
  '/fonts/lora-regular.woff2',
  '/fonts/lora-italic.woff2',
  '/fonts/dancing-script-variable.woff2',
  '/images/hero-static.png',
  '/manifest.json',
];

// Assets that should NEVER be cached (too large / streaming)
const NETWORK_ONLY_PATTERNS = [
  /\.mp4$/,
  /\.mp3$/,
  /\.mov$/,
  /\/api\//,
];

function isNetworkOnly(url) {
  return NETWORK_ONLY_PATTERNS.some((pattern) => pattern.test(url));
}

// Install: precache shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Network-only for videos, music, API calls
  if (isNetworkOnly(url.pathname)) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return a meaningful offline response for API calls
        if (url.pathname.startsWith('/api/')) {
          return new Response(
            JSON.stringify({
              error: "You're offline — your message is saved locally and you can try again when you're back online.",
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        // For media files — return a minimal offline response
        return new Response(
          'Offline — this content requires an internet connection.',
          {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          }
        );
      })
    );
    return;
  }

  // Cache-first for everything else (HTML, CSS, JS, fonts, images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache, and update cache in background
        event.waitUntil(
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {}) // Ignore network errors for background update
        );
        return cachedResponse;
      }

      // Not in cache — fetch from network and cache for next time
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline and not cached — return offline page for navigation
          if (request.destination === 'document') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});
