// 오프라인 지원: 앱 파일·AI 모델을 기기에 저장해 창고 안 약한 인터넷에서도 동작.
// 화면(index.html)은 네트워크 우선(업데이트 반영), 나머지는 저장본 우선.
const VERSION = 'inbound-v3';
const FILES = [
  './', 'index.html', 'css/app.css', 'manifest.webmanifest',
  'js/app.js', 'js/store.js', 'js/counter.js', 'js/report.js', 'js/camera.js', 'js/recognizer.js',
  'js/barcode.js', 'js/democam.js', 'js/gs1.js', 'js/identify.js', 'js/expected.js',
  'vendor/tf.min.js', 'vendor/zxing.min.js',
  'models/mobilenet_v2_035/model.json', 'models/mobilenet_v2_035/group1-shard1of1.bin',
  'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || req.url.endsWith('/index.html');
  if (isPage) {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  })));
});
