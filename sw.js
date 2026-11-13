/* Vetrivel Kottam — service worker (v10).
   Network-first for the app's own files, so a new index.html / patch is picked up on the next launch (no "open twice", no reinstall).
   Falls back to the saved copy when there is no signal, so the app still opens offline.            */
var V = 'vk-v10', OCR = 'vk-ocr', SH = 'tmgr-share', CORE = ['./', './index.html', './manifest.json', './patches.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    var core = Promise.all(CORE.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () {}); }));
    /* also save every patch file listed in patches.json, under the exact address the loader will ask for, so the first visit already works offline */
    var pats = fetch('./patches.json', { cache: 'reload' }).then(function (r) { return r.ok ? r.clone().json().then(function (m) { return c.put('./patches.json', r).then(function () { return m; }); }) : null; }).then(function (m) {
      if (!m || !m.patches) return;
      var dis = m.disabled || [];
      return Promise.all(m.patches.filter(function (p) { return dis.indexOf(p.f) < 0; }).map(function (p) { return c.add(new Request(p.f + '?v=' + encodeURIComponent(p.v || m.v || ''), { cache: 'reload' })).catch(function () {}); }));
    }).catch(function () {});
    return Promise.all([core, pats]);
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return (k.indexOf('tmgr-v') === 0 || k.indexOf('vk-v') === 0) && k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (e) { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
function shareTarget(req) {
  return req.formData().then(function (fd) {
    var files = fd.getAll('media').filter(function (f) { return f && f.size; });
    var text = [fd.get('title'), fd.get('text'), fd.get('url')].filter(Boolean).join('\n');
    return caches.open(SH).then(function (c) {
      return c.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return c.delete(k); })); }).then(function () {
        return Promise.all(files.map(function (f, i) { return c.put('/shared/' + i, new Response(f, { headers: { 'Content-Type': f.type || 'image/jpeg' } })); }));
      });
    }).then(function () {
      var url = new URL('./index.html', self.registration.scope); url.searchParams.set('shared', String(files.length)); if (text) url.searchParams.set('text', text.slice(0, 4000));
      return Response.redirect(url.href, 303);
    });
  }).catch(function () { return Response.redirect(new URL('./index.html', self.registration.scope).href, 303); });
}
function netFirst(r, ms) {
  var fresh = new Request(r, { cache: 'no-cache' });
  return new Promise(function (resolve) {
    var done = false, timer = setTimeout(function () { if (done) return; caches.match(r, { ignoreSearch: false }).then(function (hit) { if (hit && !done) { done = true; resolve(hit); } }); }, ms);
    fetch(fresh).then(function (res) {
      clearTimeout(timer);
      if (res && res.ok) { var copy = res.clone(); caches.open(V).then(function (c) { c.put(r, copy); }); }
      if (!done) { done = true; resolve(res); }
      return res;
    }).catch(function () {
      clearTimeout(timer);
      caches.match(r).then(function (hit) { if (!done) { done = true; resolve(hit || caches.match('./index.html') || Response.error()); } });
    });
  });
}
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method === 'POST' && u.origin === location.origin && /\/share-target$/.test(u.pathname)) { e.respondWith(shareTarget(r)); return; }
  if (r.method !== 'GET') return;
  if (u.origin === location.origin) {
    if (/\/(version\.json|patches\.json)$/.test(u.pathname)) {
      var key = new Request(u.origin + u.pathname);
      e.respondWith(fetch(new Request(r, { cache: 'no-store' })).then(function (res) { if (res.ok) { var c2 = res.clone(); caches.open(V).then(function (c) { c.put(key, c2); }); } return res; }).catch(function () { return caches.match(key); }));
      return;
    }
    e.respondWith(netFirst(r, r.mode === 'navigate' ? 4500 : 6000));
  } else if (u.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.open(OCR).then(function (c) { return c.match(r).then(function (hit) { if (hit) return hit; return fetch(r).then(function (res) { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }); }); }));
  }
});
