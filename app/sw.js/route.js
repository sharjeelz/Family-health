// Serves the service worker at /sw.js with a per-deploy version baked into the
// cache name. Because the file's bytes change on every deployment, browsers
// detect it as an update — which triggers the auto-reload in RegisterSW.
//
// On Vercel, VERCEL_GIT_COMMIT_SHA is stable per deploy and changes each deploy.
// Locally it falls back to a per-process stamp (only relevant if you ever run
// the SW locally; by default RegisterSW keeps the SW production-only).

const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.VERCEL_DEPLOYMENT_ID ||
  `local-${Date.now()}`;

const SW = `// Family Dashboard service worker (auto-generated per deploy).
const CACHE = "family-dashboard-${BUILD_ID}";
const CORE = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
  "/adhan.mp3",
  "/family/mosque-haram.jpg",
  "/family/mosque-nabawi.jpg",
  "/family/mosque-faisal.jpg",
  "/family/mosque-blue.jpg",
  "/family/mosque-badshahi.jpg",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function isStableMedia(url) {
  return (
    url.pathname.startsWith("/family/") ||
    url.pathname === "/adhan.mp3" ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/manifest.webmanifest"
  );
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) || (await cache.match("/")) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/_next/webpack-hmr") || url.pathname.includes("hot-update")) return;
  if (isStableMedia(url)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});
`;

export function GET() {
  return new Response(SW, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}

export const dynamic = "force-dynamic";
