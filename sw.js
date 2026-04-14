// Amico Service Worker - 安定版
const CACHE = 'amico-v2';

// インストール時：キャッシュしない（ネットワーク優先）
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 古いキャッシュを全削除
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ネットワーク優先・失敗時のみキャッシュ
self.addEventListener('fetch', e => {
  // Amazon等の外部リンクはスルー
  if (!e.request.url.includes('pages.dev') && !e.request.url.includes('localhost')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 成功したらキャッシュに保存
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => {
        // オフライン時のみキャッシュから返す
        return caches.match(e.request);
      })
  );
});
