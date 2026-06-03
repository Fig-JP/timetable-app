// Tsuruoka NIT Timetable PWA - Service Worker
const CACHE_NAME = 'tsuruoka-timetable-v2';

// index.html と manifest.json はネットワーク優先（常に最新を取得）
const NETWORK_FIRST = ['./index.html', './', './manifest.json'];

// フォント等の静的アセットはキャッシュ優先
self.addEventListener('install', event => {
  // index.html をキャッシュに入れない（ネットワーク優先のため）
  event.waitUntil(caches.open(CACHE_NAME));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Fonts: ネットワーク優先、失敗時キャッシュ
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  const pathname = url.pathname;
  const isNetworkFirst =
    pathname.endsWith('/') ||
    pathname.endsWith('/index.html') ||
    pathname.endsWith('/manifest.json');

  if (isNetworkFirst) {
    // Network first: 常に最新HTMLを取得、失敗時のみキャッシュフォールバック
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first: sw.js以外の静的リソース
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});

// 通知タップ → アプリを前面に
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('index.html') || client.url.endsWith('/')) {
          return client.focus();
        }
      }
      return clients.openWindow('./index.html');
    })
  );
});
