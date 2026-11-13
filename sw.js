/* Murugar Temple Manager - central service (version 3)
   Paste ALL of this into script.google.com (New project), then:
   Deploy > New deployment > type: Web app > Execute as: Me > Who has access: Anyone > Deploy > allow access.
   Updating later: Deploy > Manage deployments > pencil > Version: New version > Deploy (allow access again if asked). */
var ADMIN = 'Up31BeNs85gWFgcSHhIT9XuW';
var V = 3, FILE = 'murugar_temple_db.json', BKDIR = 'Temple DB backups', KEEP = 14;
var GALDIR = 'Temple Gallery', GIDX = 'gallery_index.json', OUTF = 'murugar_outbox.json', LOGF = 'murugar_outlog.json';

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function P_() { return PropertiesService.getScriptProperties(); }
function hex_(a) { var s = ''; for (var i = 0; i < a.length; i++) s += ('0' + (a[i] & 255).toString(16)).slice(-2); return s; }
function H_(s) { return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8)); }
function jget_(k, d) { var v = P_().getProperty(k); if (!v) return d; try { return JSON.parse(v); } catch (e) { return d; } }
function jset_(k, o) { P_().setProperty(k, JSON.stringify(o)); }
function file_(name) { var it = DriveApp.getFilesByName(name); return it.hasNext() ? it.next() : null; }
function dread_(name, def) { var f = file_(name); if (!f) return def; try { return JSON.parse(f.getBlob().getDataAsString()); } catch (e) { return def; } }
function dwrite_(name, obj) { var s = JSON.stringify(obj), f = file_(name); if (f) f.setContent(s); else DriveApp.createFile(name, s, 'text/plain'); }
function dir_(name) { var it = DriveApp.getFoldersByName(name); return it.hasNext() ? it.next() : DriveApp.createFolder(name); }
function locked_(fn, ms) {
  var l = LockService.getScriptLock();
  try { l.waitLock(ms || 25000); } catch (e) { throw new Error('busy'); }
  try { return fn(); } finally { l.releaseLock(); }
}
function today_(tz) { return Utilities.formatDate(new Date(), tz || 'Asia/Kolkata', 'yyyy-MM-dd'); }

function doGet() { return out_({ ok: true, app: 'temple-db', v: V }); }
function doPost(e) {
  var q;
  try { q = JSON.parse(e.postData.contents); } catch (x) { return out_({ ok: false, err: 'bad' }); }
  try { return out_(route_(q)); }
  catch (x) { var m = String((x && x.message) || x); return out_(m === 'busy' ? { ok: false, err: 'busy' } : { ok: false, err: 'fail', msg: m.slice(0, 200) }); }
}

/* ---------- access: one admin key (never given to phones) + one revocable pass per phone ---------- */
function auth_(q) {
  if (q.key && q.key === ADMIN) return { admin: true };
  if (q.tok) {
    var id = P_().getProperty('th:' + H_(q.tok));
    if (id) { var d = jget_('tk:' + id, null); if (d && !d.x) return { dev: id }; }
  }
  return null;
}
function route_(q) {
  if (!q || !q.op) return { ok: false, err: 'bad' };
  if (q.op === 'enroll') return enroll_(q);
  var who = auth_(q);
  if (!who) return { ok: false, err: 'key' };
  if (q.hb && who.dev) beat_(who.dev, q.hb);
  var op = q.op;
  if (op === 'meta') return meta_();
  if (op === 'read') { var f = file_(FILE); return { ok: true, exists: !!f, ver: Number(P_().getProperty('ver')) || 0, text: f ? f.getBlob().getDataAsString() : '' }; }
  if (op === 'write') return write_(q);
  if (op === 'backup') { backup_(file_(FILE), true); return { ok: true }; }
  if (op.indexOf('gal_') === 0) return gal_(op, q);
  if (op === 'outbox') return outbox_(q);
  if (op === 'send') return send_(q);
  if (op === 'tgpost') return tgpost_(q);
  if (op === 'autoLog') return { ok: true, log: dread_(LOGF, { log: [] }).log.slice(-150) };
  if (!who.admin) return { ok: false, err: 'admin' };
  if (op === 'selftest') return selftest_();
  if (op === 'invite') return invite_(q);
  if (op === 'devices') return devices_();
  if (op === 'revoke') return revoke_(q);
  if (op.indexOf('auto') === 0) return auto_(op, q);
  return { ok: false, err: 'op' };
}
function enroll_(q) {
  return locked_(function () {
    var code = String(q.code || '');
    if (code.length < 16) return { ok: false, err: 'invite' };
    var k = 'iv:' + H_(code), iv = jget_(k, null);
    if (!iv) return { ok: false, err: 'invite' };
    P_().deleteProperty(k);
    if (Date.now() > iv.exp) return { ok: false, err: 'expired' };
    var tok = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''), id = Utilities.getUuid().slice(0, 8), h = H_(tok);
    jset_('tk:' + id, { h: h, n: String(q.n || '').slice(0, 40), c: Date.now(), t: Date.now(), u: '' });
    P_().setProperty('th:' + h, id);
    return { ok: true, tok: tok, id: id, v: V };
  }, 10000);
}
function invite_(q) {
  var code = String(q.code || '');
  if (code.length < 16) return { ok: false, err: 'bad' };
  var hrs = Math.max(1, Math.min(168, Number(q.hours) || 24)), all = P_().getProperties(), now = Date.now();
  for (var k in all) { if (k.indexOf('iv:') === 0) { try { if (JSON.parse(all[k]).exp < now) P_().deleteProperty(k); } catch (e) { P_().deleteProperty(k); } } }
  var exp = now + hrs * 3600000;
  jset_('iv:' + H_(code), { exp: exp });
  return { ok: true, exp: exp };
}
function devices_() {
  var all = P_().getProperties(), list = [];
  for (var k in all) { if (k.indexOf('tk:') === 0) { try { var d = JSON.parse(all[k]); list.push({ id: k.slice(3), n: d.n, u: d.u, c: d.c, t: d.t, x: !!d.x }); } catch (e) {} } }
  list.sort(function (a, b) { return b.t - a.t; });
  return { ok: true, devs: list };
}
function revoke_(q) {
  var k = 'tk:' + String(q.id || ''), d = jget_(k, null);
  if (!d) return { ok: false, err: 'none' };
  if (q.forget) { P_().deleteProperty('th:' + d.h); P_().deleteProperty(k); } else { d.x = q.undo ? 0 : 1; jset_(k, d); }
  return { ok: true };
}
function beat_(id, hb) {
  var k = 'tk:' + id, d = jget_(k, null);
  if (!d || (Date.now() - (d.t || 0) < 60000 && (hb.u === undefined || hb.u === d.u) && (!hb.n || hb.n === d.n))) return;
  d.t = Date.now(); if (hb.n) d.n = String(hb.n).slice(0, 40); if (hb.u !== undefined) d.u = String(hb.u).slice(0, 40);
  jset_(k, d);
}
function selftest_() {
  var r = { ok: true, v: V, drive: false, lock: false, props: false };
  try { var f = DriveApp.createFile('__temple_selftest.txt', 'ok', 'text/plain'); r.drive = (f.getBlob().getDataAsString() === 'ok'); f.setTrashed(true); } catch (x) { r.driveErr = String(x && x.message || x).slice(0, 160); }
  try { var l = LockService.getScriptLock(); l.waitLock(3000); l.releaseLock(); r.lock = true; } catch (x) {}
  try { P_().setProperty('selftest', '1'); r.props = P_().getProperty('selftest') === '1'; P_().deleteProperty('selftest'); } catch (x) {}
  var f2 = file_(FILE); r.exists = !!f2; r.ver = Number(P_().getProperty('ver')) || 0; r.size = f2 ? f2.getSize() : 0;
  return r;
}

/* ---------- the database file ---------- */
function meta_() {
  var f = file_(FILE), c = jget_('cfg', null);
  return { ok: true, v: V, exists: !!f, ver: Number(P_().getProperty('ver')) || 0, size: f ? f.getSize() : 0, bk: Number(P_().getProperty('bk')) || 0, auto: c ? { p: c.provider || '', on: autoOn_(), hour: c.hour || 7 } : null };
}
function backup_(f, force) {
  if (!f) return;
  var P = P_(), last = Number(P.getProperty('bkt')) || 0;
  if (!force && Date.now() - last < 86400000) return;
  var dir = dir_(BKDIR);
  f.makeCopy('murugar_temple_db_' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd_HHmm') + '.json', dir);
  P.setProperty('bkt', String(Date.now()));
  var fs = dir.getFiles(), a = []; while (fs.hasNext()) a.push(fs.next());
  a.sort(function (x, y) { return y.getDateCreated() - x.getDateCreated(); });
  a.slice(KEEP).forEach(function (x) { x.setTrashed(true); });
  P.setProperty('bk', String(Math.min(a.length, KEEP)));
}
function write_(q) {
  return locked_(function () {
    var P = P_(), f = file_(FILE), ver = Number(P.getProperty('ver')) || 0;
    if (q.ifVer !== null && q.ifVer !== undefined && Number(q.ifVer) !== ver) return { ok: false, conflict: true, ver: ver };
    if ((q.ifVer === null || q.ifVer === undefined) && q.create && f) return { ok: false, conflict: true, ver: ver, exists: true };
    if (typeof q.text !== 'string' || q.text.length < 2) return { ok: false, err: 'empty' };
    if (f) backup_(f, false);
    var g = f || DriveApp.createFile(FILE, '', 'text/plain'); g.setContent(q.text);
    P.setProperty('ver', String(ver + 1));
    return { ok: true, ver: ver + 1 };
  });
}

/* ---------- gallery (photos live in your Drive folder "Temple Gallery") ---------- */
function gal_(op, q) {
  if (op === 'gal_index') return { ok: true, items: dread_(GIDX, []) };
  if (op === 'gal_img') {
    var idx0 = dread_(GIDX, []), map = {}, ids = (q.ids || []).slice(0, 15);
    ids.forEach(function (id) {
      for (var i = 0; i < idx0.length; i++) if (idx0[i].id === id) {
        var fid = q.k === 'f' ? idx0[i].ff : idx0[i].tf;
        if (fid) { try { map[id] = Utilities.base64Encode(DriveApp.getFileById(fid).getBlob().getBytes()); } catch (e) { map[id] = ''; } }
        return;
      }
    });
    return { ok: true, imgs: map };
  }
  return locked_(function () {
    var idx = dread_(GIDX, []);
    if (op === 'gal_put') {
      var it = { id: Utilities.getUuid().slice(0, 12), k: q.k === 'vid' ? 'vid' : 'img', n: String(q.n || '').slice(0, 80), al: String(q.al || '').slice(0, 40), cp: String(q.cp || '').slice(0, 300), t: Date.now(), by: String(q.by || '').slice(0, 30), w: q.w | 0, h: q.h | 0 };
      if (it.k === 'vid') { it.url = String(q.url || '').slice(0, 500); it.yt = String(q.yt || '').slice(0, 20); }
      else {
        if (!q.full || q.full.length > 3500000 || !q.thumb || q.thumb.length > 90000) return { ok: false, err: 'size' };
        var d = dir_(GALDIR);
        var f1 = d.createFile(Utilities.newBlob(Utilities.base64Decode(q.full), 'image/jpeg', it.id + '.jpg'));
        var f2 = d.createFile(Utilities.newBlob(Utilities.base64Decode(q.thumb), 'image/jpeg', it.id + '_t.jpg'));
        it.ff = f1.getId(); it.tf = f2.getId();
      }
      idx.unshift(it); if (idx.length > 1500) idx.length = 1500;
      dwrite_(GIDX, idx);
      return { ok: true, item: it };
    }
    var pos = -1; for (var i = 0; i < idx.length; i++) if (idx[i].id === q.id) pos = i;
    if (pos < 0) return { ok: false, err: 'none' };
    if (op === 'gal_edit') {
      if (q.n !== undefined) idx[pos].n = String(q.n).slice(0, 80);
      if (q.al !== undefined) idx[pos].al = String(q.al).slice(0, 40);
      if (q.cp !== undefined) idx[pos].cp = String(q.cp).slice(0, 300);
      dwrite_(GIDX, idx); return { ok: true, item: idx[pos] };
    }
    if (op === 'gal_del') {
      var x = idx.splice(pos, 1)[0];
      [x.ff, x.tf].forEach(function (fid) { if (fid) { try { DriveApp.getFileById(fid).setTrashed(true); } catch (e) {} } });
      dwrite_(GIDX, idx); return { ok: true };
    }
    return { ok: false, err: 'op' };
  });
}

/* ---------- automatic messages (daily reminders + instant receipts) ---------- */
function outbox_(q) {
  return locked_(function () {
    var ob = dread_(OUTF, { days: {} }), n = 0, d;
    for (d in (q.days || {})) { ob.days[d] = q.days[d]; n++; }
    var keep = q.today ? String(q.today) : '', old = [];
    for (d in ob.days) { if (keep && d < keep) old.push(d); }
    old.forEach(function (k) { delete ob.days[k]; });
    dwrite_(OUTF, ob);
    return { ok: true, n: n };
  });
}
function mask_(c) {
  var o = JSON.parse(JSON.stringify(c || {}));
  function m(s) { s = String(s || ''); return s ? '\u2022\u2022\u2022\u2022' + s.slice(-4) : ''; }
  if (o.wa && o.wa.token) o.wa.token = m(o.wa.token);
  if (o.tg && o.tg.token) o.tg.token = m(o.tg.token);
  if (o.hook && o.hook.url) o.hook.url = String(o.hook.url).slice(0, 28) + '\u2026' + String(o.hook.url).slice(-4);
  return o;
}
function keep_(n, o) { return (n === undefined || n === '' || String(n).indexOf('\u2022\u2022\u2022\u2022') === 0 || String(n).indexOf('\u2026') > 0) ? o : n; }
function autoOn_() { var t = ScriptApp.getProjectTriggers(); for (var i = 0; i < t.length; i++) if (t[i].getHandlerFunction() === 'daily_') return true; return false; }
function setTrigger_(on, hour, tz) {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'daily_') ScriptApp.deleteTrigger(t); });
  if (on) ScriptApp.newTrigger('daily_').timeBased().everyDays(1).atHour(hour).inTimezone(tz || 'Asia/Kolkata').create();
}
function auto_(op, q) {
  var old = jget_('cfg', {});
  if (op === 'autoGet') return { ok: true, cfg: mask_(old), on: autoOn_(), v: V };
  if (op === 'autoSet') {
    var n = q.cfg || {}, c = {
      provider: n.provider || 'none', hour: Math.max(0, Math.min(23, Number(n.hour) || 7)), tz: String(n.tz || 'Asia/Kolkata').slice(0, 40), max: Math.max(1, Math.min(5000, Number(n.max) || 500)), types: n.types || {},
      wa: { pid: String((n.wa && n.wa.pid) || '').replace(/\D/g, ''), token: keep_(n.wa && n.wa.token, old.wa && old.wa.token) || '', ver: String((n.wa && n.wa.ver) || 'v21.0').slice(0, 10), mode: (n.wa && n.wa.mode) === 'text' ? 'text' : 'template', prefix: String((n.wa && n.wa.prefix) || 'temple_').slice(0, 30), fallback: String((n.wa && n.wa.fallback) || 'en').slice(0, 5), codes: (n.wa && n.wa.codes) || {} },
      hook: { url: keep_(n.hook && n.hook.url, old.hook && old.hook.url) || '' },
      tg: { token: keep_(n.tg && n.tg.token, old.tg && old.tg.token) || '', admin: String((n.tg && n.tg.admin) || '').slice(0, 40), channel: String((n.tg && n.tg.channel) || '').slice(0, 60) }
    };
    jset_('cfg', c);
    if (autoOn_()) setTrigger_(true, c.hour, c.tz);
    return { ok: true, cfg: mask_(c), on: autoOn_() };
  }
  if (op === 'autoOn') { if (!old.provider && !(old.tg && old.tg.token)) return { ok: false, err: 'nocfg' }; setTrigger_(true, old.hour || 7, old.tz); return { ok: true, on: autoOn_() }; }
  if (op === 'autoOff') { setTrigger_(false); return { ok: true, on: autoOn_() }; }
  if (op === 'autoRun') return runDay_('manual');
  if (op === 'autoTest') {
    if (!old.provider || old.provider === 'none') return { ok: false, err: 'nocfg' };
    return locked_(function () {
      var lg = dread_(LOGF, { sent: {}, log: [], cnt: {} }), res = sendItems_([{ id: 'test|' + Date.now(), to: String(q.to || ''), type: 'test', lang: 'en', params: [], text: String(q.text || 'Test message from the temple app 🙏'), name: 'test' }], old, lg, 'test');
      dwrite_(LOGF, lg); return { ok: true, res: res };
    });
  }
  return { ok: false, err: 'op' };
}
function clean_(s) { return String(s == null ? '' : s).replace(/[\r\n\t]+/g, ' ').replace(/ {4,}/g, '   ').trim().slice(0, 900); }
function waSend_(todo, cfg, res) {
  var w = cfg.wa || {};
  if (!w.pid || !w.token) { todo.forEach(function (it) { res.push({ id: it.id, st: 'failed', err: 'WhatsApp is not set up' }); }); return; }
  var url = 'https://graph.facebook.com/' + (w.ver || 'v21.0') + '/' + w.pid + '/messages';
  function codeOf(lang) { return (w.codes && w.codes[lang]) || lang; }
  function payload(it, lang) {
    var to = String(it.to).replace(/\D/g, ''), b = { messaging_product: 'whatsapp', to: to };
    if (it.type === 'test' && w.mode !== 'text') { b.type = 'template'; b.template = { name: 'hello_world', language: { code: 'en_US' } }; return b; }
    if (w.mode === 'text' || it.type === 'test') { b.type = 'text'; b.text = { body: String(it.text || '').slice(0, 3800), preview_url: true }; return b; }
    b.type = 'template'; b.template = { name: (w.prefix || 'temple_') + it.type + '_' + lang, language: { code: codeOf(lang) } };
    var ps = (it.params || []).map(function (p) { return { type: 'text', text: clean_(p) }; });
    if (ps.length) b.template.components = [{ type: 'body', parameters: ps }];
    return b;
  }
  function run(list, langOf) {
    var out = [];
    for (var i = 0; i < list.length; i += 25) {
      var chunk = list.slice(i, i + 25), reqs = chunk.map(function (it) { return { url: url, method: 'post', contentType: 'application/json', headers: { Authorization: 'Bearer ' + w.token }, payload: JSON.stringify(payload(it, langOf(it))), muteHttpExceptions: true }; }), rs;
      try { rs = UrlFetchApp.fetchAll(reqs); } catch (e) { rs = null; }
      chunk.forEach(function (it, k) {
        var r = rs && rs[k], code = r ? r.getResponseCode() : 0, j = {}; try { j = JSON.parse(r.getContentText()); } catch (e) {}
        if (code >= 200 && code < 300) out.push({ it: it, ok: true, mid: j.messages && j.messages[0] && j.messages[0].id });
        else out.push({ it: it, ok: false, ec: j.error && j.error.code, err: (j.error && (j.error.message || j.error.error_user_msg)) || ('HTTP ' + code) });
      });
    }
    return out;
  }
  var first = run(todo, function (it) { return it.lang || w.fallback || 'en'; }), again = [];
  first.forEach(function (x) {
    if (x.ok) res.push({ id: x.it.id, st: 'sent', mid: x.mid });
    else if (x.ec === 132001 && w.mode !== 'text' && (x.it.lang || '') !== (w.fallback || 'en')) again.push(x.it);
    else res.push({ id: x.it.id, st: 'failed', err: String(x.err).slice(0, 160), ec: x.ec });
  });
  if (again.length) run(again, function () { return w.fallback || 'en'; }).forEach(function (x) { res.push(x.ok ? { id: x.it.id, st: 'sent', mid: x.mid, note: 'fallback template' } : { id: x.it.id, st: 'failed', err: String(x.err).slice(0, 160), ec: x.ec }); });
}
function hookSend_(todo, cfg, res) {
  if (!todo.length) return;
  var u = cfg.hook && cfg.hook.url, ok = false, err = '';
  if (!u) { todo.forEach(function (it) { res.push({ id: it.id, st: 'failed', err: 'Webhook address missing' }); }); return; }
  try {
    var r = UrlFetchApp.fetch(u, { method: 'post', contentType: 'application/json', muteHttpExceptions: true, payload: JSON.stringify({ app: 'MurugarTempleManager', kind: 'auto', messages: todo.map(function (it) { return { id: it.id, to: String(it.to).replace(/\D/g, ''), name: it.name, lang: it.lang, type: it.type, params: it.params, text: it.text }; }) }) });
    ok = r.getResponseCode() >= 200 && r.getResponseCode() < 300; if (!ok) err = 'HTTP ' + r.getResponseCode();
  } catch (e) { err = String(e && e.message || e).slice(0, 120); }
  todo.forEach(function (it) { res.push(ok ? { id: it.id, st: 'sent' } : { id: it.id, st: 'failed', err: err }); });
}
function tg_(token, chat, text) {
  try { var r = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', { method: 'post', muteHttpExceptions: true, payload: { chat_id: chat, text: String(text).slice(0, 4000) } }); return r.getResponseCode() === 200; } catch (e) { return false; }
}
function sendItems_(items, cfg, lg, src) {
  var res = [], day = today_(cfg.tz), byId = {};
  lg.sent = lg.sent || {}; lg.log = lg.log || []; lg.cnt = lg.cnt || {};
  var used = lg.cnt[day] || 0, max = cfg.max || 500, todo = [];
  items.forEach(function (it) {
    if (!it || !it.id || !it.to) return;
    byId[it.id] = it;
    if (lg.sent[it.id]) { res.push({ id: it.id, st: 'dup' }); return; }
    if (cfg.types && cfg.types[it.type] === false) { res.push({ id: it.id, st: 'off' }); return; }
    if (used + todo.length >= max) { res.push({ id: it.id, st: 'cap', err: 'Daily limit reached' }); return; }
    todo.push(it);
  });
  if (cfg.provider === 'wa') waSend_(todo, cfg, res);
  else if (cfg.provider === 'webhook') hookSend_(todo, cfg, res);
  else todo.forEach(function (it) { res.push({ id: it.id, st: 'none', err: 'No sending service is set up' }); });
  var now = Date.now(), cut = now - 10 * 864e5;
  res.forEach(function (r) {
    if (r.st === 'sent') { lg.sent[r.id] = now; used++; }
    if (r.st === 'sent' || r.st === 'failed' || r.st === 'cap') { var it = byId[r.id] || {}; lg.log.push({ t: now, id: r.id, dv: it.dv || '', ty: it.type || '', st: r.st, err: r.err || '', mid: r.mid || '', src: src, to: String(it.to || '').slice(-4) }); }
  });
  lg.cnt[day] = used;
  for (var k in lg.sent) if (lg.sent[k] < cut) delete lg.sent[k];
  if (lg.log.length > 400) lg.log = lg.log.slice(-400);
  return res;
}
function send_(q) {
  var cfg = jget_('cfg', null);
  if (!cfg || !cfg.provider || cfg.provider === 'none') return { ok: false, err: 'nocfg' };
  var items = (q.items || []).slice(0, 60);
  return locked_(function () {
    var lg = dread_(LOGF, { sent: {}, log: [], cnt: {} }), res = sendItems_(items, cfg, lg, 'live');
    dwrite_(LOGF, lg); return { ok: true, res: res };
  });
}
function runDay_(src) {
  var cfg = jget_('cfg', null);
  if (!cfg) return { ok: false, err: 'nocfg' };
  return locked_(function () {
    var day = today_(cfg.tz), ob = dread_(OUTF, { days: {} }), d = ob.days[day] || {}, lg = dread_(LOGF, { sent: {}, log: [], cnt: {} }), items = (d.items || []).slice();
    (d.bulk || []).forEach(function (b) { (b.r || []).forEach(function (r) { items.push({ id: b.id + '|' + r[1], to: r[1], dv: r[2] || '', type: b.type, lang: b.lang, params: [r[0], b.th], text: String(b.text || '').replace(/\{name\}/g, r[0]), name: r[0] }); }); });
    var res = (cfg.provider && cfg.provider !== 'none') ? sendItems_(items, cfg, lg, src) : [], tgOk = null;
    if (cfg.tg && cfg.tg.token) {
      lg.sent = lg.sent || {};
      if (d.digest && cfg.tg.admin && !lg.sent['dg|' + day]) { tgOk = tg_(cfg.tg.token, cfg.tg.admin, d.digest); if (tgOk) lg.sent['dg|' + day] = Date.now(); }
      if (d.channel && cfg.tg.channel && !lg.sent['ch|' + day]) { if (tg_(cfg.tg.token, cfg.tg.channel, d.channel)) lg.sent['ch|' + day] = Date.now(); }
    }
    dwrite_(LOGF, lg);
    var c = { sent: 0, failed: 0, skipped: 0 }; res.forEach(function (r) { if (r.st === 'sent') c.sent++; else if (r.st === 'failed') c.failed++; else c.skipped++; });
    return { ok: true, day: day, sent: c.sent, failed: c.failed, skipped: c.skipped, tg: tgOk };
  });
}
function tgpost_(q) {
  var cfg = jget_('cfg', null);
  if (!cfg || !cfg.tg || !cfg.tg.token || !cfg.tg.channel) return { ok: false, err: 'nocfg' };
  var text = String(q.text || '').trim().slice(0, 3800);
  if (!text) return { ok: false, err: 'empty' };
  var k = 'tgc:' + today_(cfg.tz), n = Number(P_().getProperty(k)) || 0;
  if (n >= 40) return { ok: false, err: 'cap' };
  var good = tg_(cfg.tg.token, cfg.tg.channel, text);
  if (good) P_().setProperty(k, String(n + 1));
  return { ok: true, sent: good };
}
function daily_() { runDay_('daily'); }
