// Incrémenter VERSION à chaque publication pour forcer la mise à jour du cache
const VERSION = 'sq-v6';
const FILES = [
    './', 'index.html', 'style.css', 'manifest.webmanifest',
    'js/main.js', 'js/state.js', 'js/engine.js', 'js/render.js',
    'js/content/index.js', 'js/content/helpers.js', 'js/content/maths.js', 'js/content/francais.js',
    'js/content/sciences.js', 'js/content/histgeo.js',
    'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f => c.add(new Request(f, { cache: 'reload' }))))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Réseau d'abord (contenu à jour), cache en secours (hors ligne)
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
    e.respondWith(
        fetch(e.request, { cache: 'no-cache' })
            .then(res => {
                const copy = res.clone();
                caches.open(VERSION).then(c => c.put(e.request, copy));
                return res;
            })
            .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
    );
});
