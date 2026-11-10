/* Service worker for Murugar Temple Manager.
   - lets the app open without internet (app shell only; your data is in your database file / OneDrive)
   - caches the on-device OCR engine after first use
   - receives photos shared from the Gallery / Camera ("Share > Temple") and hands them to the app
   Raise V when you replace index.html so phones pick up the new version. */
var V = 'tmgr-v8', OCR = V + '-ocr', SH = 'tmgr-share';
var SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('tmgr-v') === 0 && k !== V && k !== OCR; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function shareTarget(req) {
  return req.formData().then(function (fd) {
    var files = fd.getAll('media').filter(function (f) { return f && f.size; });
    var text = [fd.get('title'), fd.get('text'), fd.get('url')].filter(Boolean).join('\n');
    return caches.open(SH).then(function (c) {
      return c.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return c.delete(k); })); }).then(function () {
        return Promise.all(files.map(function (f, i) {
          return c.put('/shared/' + i, new Response(f, { headers: { 'Content-Type': f.type || 'image/jpeg' } }));
        }));
      });
    }).then(function () {
      var url = new URL('./index.html', self.registration.scope);
      url.searchParams.set('shared', String(files.length));
      if (text) url.searchParams.set('text', text.slice(0, 4000));
      return Response.redirect(url.href, 303);
    });
  }).catch(function () { return Response.redirect(new URL('./index.html', self.registration.scope).href, 303); });
}
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method === 'POST' && u.origin === location.origin && /\/share-target$/.test(u.pathname)) { e.respondWith(shareTarget(r)); return; }
  if (r.method !== 'GET') return;
  if (u.origin === location.origin && /\/app-config\.json$/.test(u.pathname)) { e.respondWith(fetch(r).catch(function () { return caches.match(r); })); return; }
  if (u.origin === location.origin) {
    e.respondWith(caches.open(V).then(function (c) {
      return c.match(r, { ignoreSearch: true }).then(function (hit) {
        var net = fetch(r).then(function (res) { if (res.ok) c.put(r, res.clone()); return res; }).catch(function () { return hit; });
        return hit || net;
      });
    }));
  } else if (u.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.open(OCR).then(function (c) {
      return c.match(r).then(function (hit) {
        if (hit) return hit;
        return fetch(r).then(function (res) { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; });
      });
    }));
  }
});
