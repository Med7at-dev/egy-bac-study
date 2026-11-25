// بيخزّن ملفات التطبيق عشان يشتغل من غير نت، وبيبعت التنبيهات
const CACHE = 'egy-bac-study-v7';
const FILES = ['./', './index.html', './style.css', './app.js', './manifest.webmanifest',
  './icons/icon.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).catch(() => caches.match('./index.html'))));
});

// ===== التنبيهات =====
function idb() { return new Promise((res, rej) => { const r = indexedDB.open('mz-notif', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function kvGet(k) { const db = await idb(); return new Promise(res => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); }
async function kvSet(k, v) { const db = await idb(); return new Promise(res => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(); t.onerror = () => res(); }); }
function ymd(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function show(title, body, tag) {
  return self.registration.showNotification(title, { body, tag, lang: 'ar', dir: 'rtl', vibrate: [200, 100, 200], data: { url: './' } });
}
async function runCheck() {
  if (self.Notification && Notification.permission !== 'granted') return;
  const cfg = await kvGet('cfg'); if (!cfg || !cfg.settings) return;
  const shown = (await kvGet('shown')) || {}; const now = new Date(); const st = cfg.settings; let changed = false;
  const mark = k => { shown[k] = Date.now(); changed = true; };
  if (st.study && st.study.on) {
    const p = String(st.study.t || '17:00').split(':'); const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +p[0] || 17, +p[1] || 0);
    const k = 'study-' + ymd(now);
    if (now >= at && now - at < 6 * 36e5 && !shown[k]) { await show('وقت المذاكرة', 'افتح مذاكرتي وابدأ جلسة تركيز. خطوة صغيرة النهارده تفرق.', 'study'); mark(k); }
  }
  if (st.exam && st.exam.on) {
    for (const e of (cfg.exams || [])) {
      const d = String(e.date).split('-').map(Number); if (d.length !== 3) continue;
      for (const off of [3, 1, 0]) {
        const trig = new Date(d[0], d[1] - 1, d[2] - off, 8, 0); const end = new Date(d[0], d[1] - 1, d[2] - off + 1, 0, 0);
        const k = 'exam-' + e.id + '-' + off;
        if (now >= trig && now < end && !shown[k]) {
          await show('تذكير بالامتحان', e.subject + ': ' + (off === 0 ? 'النهارده' : off === 1 ? 'بكرة' : 'بعد ٣ أيام') + '. راجع كويس وربنا يوفقك.', 'exam-' + e.id + '-' + off); mark(k);
        }
      }
    }
  }
  for (const k in shown) if (Date.now() - shown[k] > 30 * 864e5) { delete shown[k]; changed = true; }
  if (changed) await kvSet('shown', shown);
}
self.addEventListener('message', e => {
  const m = e.data || {};
  if (m.type === 'cfg') e.waitUntil(kvSet('cfg', m.cfg).then(runCheck));
  else if (m.type === 'check') e.waitUntil(runCheck());
});
self.addEventListener('periodicsync', e => { if (e.tag === 'mz-check') e.waitUntil(runCheck()); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
