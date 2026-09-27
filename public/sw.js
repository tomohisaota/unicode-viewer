const CACHE_NAME = "unicode-viewer-v2";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Only cache same-origin GET responses that actually succeeded. Caching an
// error response (e.g. a transient 403 from the edge) would make it sticky:
// the offline fallback below would keep serving it long after the origin
// recovered.
const isCacheable = (req, res) =>
  req.method === "GET" &&
  new URL(req.url).origin === self.location.origin &&
  res.ok &&
  res.type === "basic";

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // Leave navigations to the browser. We have no offline HTML to serve, and
  // re-issuing the request from the worker drops headers the browser would
  // otherwise attach.
  if (e.request.mode === "navigate") return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (isCacheable(e.request, res)) {
          const clone = res.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(e.request, clone))
            .catch(() => {});
        }
        return res;
      })
      .catch(async (err) => {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        throw err;
      })
  );
});
