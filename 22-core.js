// © 2026 Medhat Saaed. All rights reserved.
'use strict';
// ===== البيانات (المواد حسب قرارات وزارة التربية والتعليم) =====
var DAYS = [{ id: 6, n: 'السبت' }, { id: 0, n: 'الأحد' }, { id: 1, n: 'الاتنين' }, { id: 2, n: 'التلات' }, { id: 3, n: 'الأربع' }, { id: 4, n: 'الخميس' }, { id: 5, n: 'الجمعة' }];
var GRADES = [['1', 'الصف الأول'], ['2', 'الصف التاني'], ['3', 'الصف التالت']];
var TRACKS = [
  { v: 'med', l: 'الطب وعلوم الحياة', el: ['الفيزياء', 'الرياضيات'], g3: ['الأحياء (متقدم)', 'الكيمياء (متقدم)'] },
  { v: 'eng', l: 'الهندسة وعلوم الحاسب', el: ['الكيمياء', 'البرمجة والذكاء الاصطناعي'], g3: ['الرياضيات (متقدم)', 'الفيزياء (متقدم)'] },
  { v: 'biz', l: 'الأعمال', el: ['المحاسبة', 'إدارة الأعمال'], g3: ['الاقتصاد (متقدم)', 'الرياضيات'] },
  { v: 'arts', l: 'الآداب والفنون', el: ['علم النفس', 'لغة أجنبية تانية'], g3: ['الجغرافيا (متقدم)', 'الإحصاء'] }
];
var GRADE1 = ['اللغة العربية', 'لغة أجنبية أولى (إنجليزي)', 'تاريخ مصر', 'الرياضيات', 'العلوم المتكاملة', 'الفلسفة والمنطق', 'لغة أجنبية تانية (مثلاً فرنسي)', 'البرمجة والذكاء الاصطناعي', 'التربية الدينية'];
var FOCUS = [25, 45, 60];

// ===== الحفظ على الموبايل =====
var KEY = 'egy-bac-study.v1';
var S = { settings: { study: { on: false, t: '17:00' }, exam: { on: true }, focus: { on: true }, usage: { on: false, h: 4 }, dnd: { on: false }, alarm: { on: true } }, sess: {}, profile: { grade: '', track: '', elective: '', electives: {}, custom: [] }, tasks: [], exams: [], mins: {}, lessons: {}, notes: [], mist: [], rem: [], smins: {}, stop: {}, jk: {}, mg: {} };
var APP_VERSION = '1.2.0';
// عنوان استقبال الاقتراحات والشكاوى
var FEEDBACK_TO = 'mimoprograming847@gmail.com';
try { var saved = JSON.parse(localStorage.getItem(KEY)); if (saved) { for (var k in S) if (saved[k] !== undefined) S[k] = saved[k]; } } catch (e) {}
S.lessons = (S.lessons && typeof S.lessons === 'object') ? S.lessons : {}; S.notes = Array.isArray(S.notes) ? S.notes : []; S.mist = Array.isArray(S.mist) ? S.mist : []; S.rem = Array.isArray(S.rem) ? S.rem : []; S.smins = S.smins || {}; S.stop = S.stop || {}; S.jk = (S.jk && typeof S.jk === 'object') ? S.jk : {}; S.mg = (S.mg && typeof S.mg === 'object') ? S.mg : {}; S.mins = S.mins || {}; S.exams = S.exams || []; S.tasks = S.tasks || [];
S.settings = S.settings || {}; ['study', 'exam', 'focus', 'usage', 'dnd', 'alarm'].forEach(function (k) { if (!S.settings[k]) S.settings[k] = { study: { on: false, t: '17:00' }, exam: { on: true }, focus: { on: true }, usage: { on: false, h: 4 }, dnd: { on: false }, alarm: { on: true } }[k]; });
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} syncAndroid(); }
function cfgOut() { return { settings: S.settings, exams: S.exams, rem: remEvents(S, new Date()), stop: S.stop }; }
function syncAndroid() {
  try { if (window.Android && Android.sync) Android.sync(JSON.stringify(cfgOut())); else swPost({ type: 'cfg', cfg: cfgOut() }); } catch (e) {}
}
// ===== تذكيرات المواد: بتتحسب كأحداث للـ٢١ يوم الجاية =====
var REM_DAYS = 21, REM_MAX = 60;
function remEvents(st, now) {
  var out = [], nowMs = now.getTime(), todayKey = dkey(now);
  (st.rem || []).forEach(function (r) {
    var tp = String(r.time || '17:00').split(':'), hh = +tp[0] || 0, mm = +tp[1] || 0, up = String(r.until || '22:00').split(':'), uh = +up[0] || 22, um = +up[1] || 0;
    for (var d = 0; d < REM_DAYS; d++) {
      var day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d), key = dkey(day), label = '';
      if (r.kind === 'exam') {
        var hit = (st.exams || []).filter(function (e) { return e.subject === r.subject && e.date === key; }).length, hit1 = (st.exams || []).filter(function (e) { return e.subject === r.subject && e.date === dkey(new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)); }).length;
        if (!hit && !hit1) continue; label = hit ? 'امتحان ' + r.subject + ' النهارده' : 'امتحان ' + r.subject + ' بكرة';
      } else {
        var any = (st.tasks || []).filter(function (t) { return t.subject === r.subject && t.day === day.getDay(); }).length;
        if (!any) continue; label = 'وقت مذاكرة ' + r.subject;
      }
      if (st.stop && st.stop[r.subject] === key) continue;
      var at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hh, mm).getTime(), until = new Date(day.getFullYear(), day.getMonth(), day.getDate(), uh, um).getTime(), rep = +r.rep || 0;
      if (until < at) until = at;
      if (at < nowMs) { if (rep > 0) { at = at + Math.ceil((nowMs - at) / (rep * 60000)) * rep * 60000; } else continue; }
      if (at > until) continue;
      out.push({ at: at, rep: rep, until: until, subject: r.subject, title: label, text: r.kind === 'exam' ? 'افتح مذاكرتي وراجع ' + r.subject + '. التنبيه بيتكرر لحد ما تبدأ مذاكرة المادة دي.' : 'ابدأ جلسة تركيز في ' + r.subject + '. التنبيه بيوقف لما تبدأ.' });
    }
  });
  try { out = out.concat(weeklyEvents(now)); } catch (e) {}
  out.sort(function (a, b) { return a.at - b.at; });
  return out.slice(0, REM_MAX);
}
function stopToday(sub) { if (!sub) return; S.stop[sub] = dkey(new Date()); }
function swPost(msg) { try { if (!('serviceWorker' in navigator)) return; navigator.serviceWorker.ready.then(function (r) { if (r.active) r.active.postMessage(msg); }).catch(function () {}); } catch (e) {} }
function webNotifOk() { return !window.Android && 'Notification' in window && Notification.permission === 'granted'; }
function notify(title, body, tag) {
  if (!webNotifOk()) return;
  var opt = { body: body, tag: tag || 'mz', lang: 'ar', dir: 'rtl', vibrate: [200, 100, 200], data: { url: './' } };
  var fallback = function () { try { new Notification(title, { body: body, lang: 'ar', dir: 'rtl' }); } catch (e) {} };
  try {
    if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then(function (r) { return r.showNotification(title, opt); }).catch(fallback); else fallback();
  } catch (e) { fallback(); }
}
function askPerm() {
  if (window.Android || !('Notification' in window) || Notification.permission !== 'default') return;
  try {
    var p = Notification.requestPermission(function () {});
    var done = function () { syncAndroid(); regPeriodic(); render(); };
    if (p && p.then) p.then(done); else done();
  } catch (e) {}
}
function regPeriodic() { try { navigator.serviceWorker.ready.then(function (r) { if (r.periodicSync) r.periodicSync.register('mz-check', { minInterval: 6 * 3600 * 1000 }).catch(function () {}); }); } catch (e) {} }

// ===== حالة مؤقتة (مش بتتحفظ) =====
var U = { fsub: '', msub: '', mlesson: '', mcount: '1', mtext: '', rsub: '', rkind: 'study', rtime: '17:00', runtil: '22:00', rrep: '0', tab: 'home', anim: '', editing: false, setup: { grade: '', track: '', elective: '' }, day: String(new Date().getDay()), subj: '', dur: '60', exSubj: '', exDate: '', extra: '', msg: '', sub: '', ssub: '', lessonText: '', bulkN: '', nsub: '', noteText: '', nfilter: 'open', fbKind: 'suggestion', fbText: '', bkText: '', pend: null, bmsg: '' };
var T = { sub: '', mode: 'focus', blen: 5, len: 25, left: 25 * 60, running: false, end: 0, finished: false, id: null };

// ===== أدوات =====
var AR = '٠١٢٣٤٥٦٧٨٩';
function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function dkey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function daysUntil(iso) { var p = iso.split('-').map(Number), n = new Date(); return Math.round((new Date(p[0], p[1] - 1, p[2]) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5); }
function addDays(key, n) { var p = key.split('-').map(Number), d = new Date(p[0], p[1] - 1, p[2] + n); return dkey(d); }
function fmtMin(m) { var h = Math.floor(m / 60), r = m % 60; return h ? ar(h) + ' ساعة' + (r ? ' و' + ar(r) + ' دقيقة' : '') : ar(r) + ' دقيقة'; }
var MSGS = {
  start: [
    ['s1', 'أول خطوة هي أصعب واحدة، وإنت لسه ماشي فيها. ابدأ بعشر دقايق وخلاص.'],
    ['s2', 'مفيش مشكلة لو النهارده بداية جديدة. الدفتر لسه أبيض.'],
    ['s3', 'جلسة صغيرة النهارده تفرق عن أي خطة كبيرة بكرة.'],
    ['s4', 'مش لازم تبقى مثالي. يكفي إنك تفتح الكتاب النهارده.'],
    ['s5', 'ابدأ بأسهل درس. الحماس بييجي بعد ما تبدأ مش قبلها.'],
    ['s6', 'سلسلتك مستنياك تبدأها. يوم واحد وتبقى شغالة.'],
    ['s7', 'كل دحيح كبير كان يوم من الأيام قاعد قدام أول صفحة.'],
    ['s8', 'خمس دقايق تركيز أحسن من ساعة وإنت ماسك الموبايل.']
  ],
  streak: [
    ['k1', 'سلسلتك شغالة، ومحدش بيعمل كده غير اللي بجد عايز. كمّل.'],
    ['k2', 'يوم ورا يوم، وإنت بتبني حاجة كبيرة من غير ما تحس.'],
    ['k3', 'الاستمرار هو السر، وإنت ماسكه بإيدك.'],
    ['k4', 'فخور بالتزامك. حتى في الأيام التقيلة إنت بتظهر.'],
    ['k5', 'مش بالسرعة، بالانتظام. وإنت منتظم جدا.'],
    ['k6', 'كل يوم بتذاكر فيه بيخفف حمل يوم الامتحان.'],
    ['k7', 'شايف التقدم بتاعك؟ ده مش حظ، ده شغلك.'],
    ['k8', 'اللي بيواظب بيوصل. وإنت واظبت أكتر من أغلب الناس.'],
    ['k9', 'سلسلة زي دي تستاهل تحافظ عليها، بس من غير ما تضغط على نفسك.'],
    ['k10', 'استمر بنفس الهدوء ده. مش محتاج تجري.']
  ],
  missed: [
    ['m1', 'فاتك يوم؟ عادي. اللي يهم إنك رجعت النهارده.'],
    ['m2', 'مفيش عقاب هنا. ابدأ من جديد بجلسة صغيرة.'],
    ['m3', 'الراحة جزء من المذاكرة. كمّل النهارده بخفة.'],
    ['m4', 'يوم واحد مش بيهد حاجة. الأهم اللي جاي.'],
    ['m5', 'مهما كانت السلسلة اتقطعت، اللي ذاكرته فضل معاك.'],
    ['m6', 'خد نفس، وابدأ بدرس خفيف. هتلاقي نفسك رجعت للإيقاع.'],
    ['m7', 'كلنا بنقع في أيام مش قادرين فيها. المهم نقوم.'],
    ['m8', 'ابدأ النهارده بهدف صغير جدا، وخليه يفتح لك الطريق.']
  ],
  goal: [
    ['g1', 'هدف النهارده خلص. تستاهل ترتاح من غير ذنب.'],
    ['g2', 'برافو عليك. النهارده اتحسبت في سلسلتك.'],
    ['g3', 'خلصت اللي عليك، والباقي بونص لو حبيت.'],
    ['g4', 'يوم كويس. اشرب حاجة حلوة وارتاح شوية.'],
    ['g5', 'ده الالتزام اللي بيفرق في الآخر. شغل جامد.'],
    ['g6', 'حققت هدفك من غير ما حد يفكرك. ده أحسن حاجة.'],
    ['g7', 'يوم تاني اتسجل في صالحك. كمّل بكرة بنفس الروح.'],
    ['g8', 'الهدف اتحقق. شجرتك كبرت وسلسلتك كمان.'],
    ['g9', 'عملتها النهارده. فكر بس إزاي هتبدأ بكرة بسهولة.'],
    ['g10', 'تمام جدا. نام بدري النهارده، الراحة بتثبت المعلومة.']
  ],
  exam: [
    ['e1', 'الامتحان قرّب، بس إنت مش لوحدك ومعاك خطة. راجع بهدوء.'],
    ['e2', 'ركز على الدروس اللي بتغلط فيها، هي اللي هتفرق.'],
    ['e3', 'مش لازم تخلص كل حاجة. راجع الأهم وسيب الباقي على ربنا.'],
    ['e4', 'نوم كويس قبل الامتحان يساوي ساعتين مراجعة.'],
    ['e5', 'جرّب حل امتحان تجريبي واحد وسجّل أخطاءك. هتشوف الفرق.'],
    ['e6', 'التوتر طبيعي. نفس عميق وكمّل خطوة خطوة.'],
    ['e7', 'اللي ذاكرته فعلا معاك. ثق في نفسك شوية.'],
    ['e8', 'ربنا يوفقك. راجع كويس وبعدين ارتاح.']
  ],
  plain: [
    ['p1', 'خطوة النهارده كفاية. ماتقارنش نفسك بحد.'],
    ['p2', 'ذاكر على قد طاقتك، وخلي الباقي لبكرة.'],
    ['p3', 'التعب مؤقت والمعلومة بتفضل. كمّل بالراحة.'],
    ['p4', 'وقتك ثمين. اتفق مع نفسك على جلسة واحدة وابدأها.'],
    ['p5', 'كل درس بتخلصه هو حاجة أقل تقلق منها بعدين.'],
    ['p6', 'اشرب مية واقعد ذاكر، وهتبقى أحسن مما تتخيل.']
  ]
};

// ===== السلسلة: يوم الراحة (جوكر) + رصيد الجوكر + الهدف اليومي =====
function jkc() { var j = S.jk; if (j.day === undefined) j.day = 5; if (!j.goal) j.goal = 20; if (j.rday === undefined) j.rday = 5; if (!j.rtime) j.rtime = '20:00'; if (j.wk === undefined) j.wk = true; j.used = j.used || {}; j.earned = j.earned || 0; j.lastW = j.lastW || 0; return j; }
function dayOf(k) { var p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]).getDay(); }
function goalMet(k) { return (S.mins[k] || 0) >= jkc().goal; }
function neutral(k) { var j = jkc(); return dayOf(k) === +j.day || !!j.used[k]; }
function streak() {
  var n = 0, k = dkey(new Date()), guard = 0;
  if (!goalMet(k)) k = addDays(k, -1);
  while (guard++ < 2000) {
    if (goalMet(k)) n++; else if (!neutral(k)) break;
    k = addDays(k, -1);
  }
  return n;
}
function credits() {
  var j = jkc(), w = Math.floor(streak() / 7);
  if (w > j.lastW) { j.earned += w - j.lastW; j.lastW = w; } else if (w < j.lastW) j.lastW = w;
  var spent = Object.keys(j.used).length;
  return Math.max(0, j.earned - spent);
}
function missedDays() {
  var out = [], k = addDays(dkey(new Date()), -1), i, j = jkc();
  for (i = 0; i < 7; i++) { if (!goalMet(k) && !neutral(k)) out.push(k); k = addDays(k, -1); }
  return out.filter(function (d) { var b = addDays(d, -1), g = 0; while (g++ < 14) { if (goalMet(b)) return true; if (!neutral(b)) return false; b = addDays(b, -1); } return false; });
}
var RANKS = [[0, 'مبتدئ'], [3, 'بداية حلوة'], [7, 'مجتهد'], [14, 'شاطر'], [30, 'دحيح'], [60, 'دحيح كبير'], [100, 'أسطورة المذاكرة'], [150, 'ملك المذاكرة']];
function rank(n) { var r = RANKS[0], nx = null; RANKS.forEach(function (x) { if (n >= x[0]) r = x; }); RANKS.forEach(function (x) { if (!nx && x[0] > n) nx = x; }); return { t: r[1], next: nx }; }
function hashS(str) { var h = 0, i; for (i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
function situation() {
  var t = dkey(new Date()), nx = nextExam(), n = streak();
  if (nx && daysUntil(nx.date) <= 7 && daysUntil(nx.date) >= 0 && !goalMet(t)) return 'exam';
  if (goalMet(t)) return 'goal';
  if (n === 0) { var y = addDays(t, -1), any = Object.keys(S.mins).some(function (k) { return S.mins[k] > 0; }); return any && !goalMet(y) ? 'missed' : 'start'; }
  return n >= 3 ? 'streak' : 'plain';
}
function dailyMsg() {
  var t = dkey(new Date()), sit = situation(), g = S.mg || (S.mg = {});
  if (g.d === t && g.sit === sit && g.id) return textOf(g.id);
  var pool = MSGS[sit].slice(), last = g.d === t ? g.p : g.id;
  var cand = pool.filter(function (m) { return m[0] !== last; }), pick = cand[hashS(t + sit) % cand.length];
  if (g.d !== t) g.p = g.id;
  g.d = t; g.sit = sit; g.id = pick[0]; save();
  return pick[1];
}
function textOf(id) { var r = ''; for (var k in MSGS) MSGS[k].forEach(function (m) { if (m[0] === id) r = m[1]; }); return r; }
function weekStats(endKey) {
  var i, tot = 0, days = 0, met = 0, best = { k: '', m: 0 }, subj = {};
  for (i = 0; i < 7; i++) { var k = addDays(endKey, -i), m = S.mins[k] || 0; tot += m; if (m > 0) days++; if (goalMet(k)) met++; if (m > best.m) best = { k: k, m: m }; var sm = S.smins[k] || {}; for (var q in sm) subj[q] = (subj[q] || 0) + sm[q]; }
  var prev = 0; for (i = 7; i < 14; i++) prev += S.mins[addDays(endKey, -i)] || 0;
  var top = '', tm = 0; for (var s2 in subj) if (subj[s2] > tm) { tm = subj[s2]; top = s2; }
  var pb = { k: '', m: 0 }; for (var kk in S.mins) if (S.mins[kk] > pb.m) pb = { k: kk, m: S.mins[kk] };
  return { tot: tot, days: days, met: met, best: best, prev: prev, top: top, topm: tm, pb: pb };
}
function viewStreak() {
  var j = jkc(), n = streak(), r = rank(n), cr = credits(), mm = missedDays(), t = dkey(new Date()), m = S.mins[t] || 0, dn = ['الأحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت'].map(function (x, i) { return [String(i), x]; });
  var h = '<section class="card lift"><h2>سلسلتك ورتبتك</h2><div class="stat"><span>الرتبة</span><b>' + esc(r.t) + '</b></div><div class="stat"><span>أيام السلسلة</span><b>' + ar(n) + '</b></div>' + (r.next ? '<p class="note">باقي ' + ar(r.next[0] - n) + ' يوم وتبقى «' + esc(r.next[1]) + '».</p>' : '') +
    '<div class="stat"><span>رصيد الجوكر</span><b>' + ar(cr) + '</b></div><p class="note">بتكسب جوكر عن كل أسبوع سلسلة. تقدر تستخدمه في يوم فاتك عشان السلسلة ماتتقطعش.</p>';
  if (mm.length && cr > 0) h += mm.slice(0, 3).map(function (d) { return '<div class="row"><div class="grow"><b>يوم فاتك</b><small>' + esc(d) + '</small></div><button class="pill" type="button" data-a="jspend" data-v="' + d + '">استخدم جوكر</button></div>'; }).join('');
  h += '<div class="label">رتب المذاكرة</div><p class="note">' + RANKS.map(function (x) { return esc(x[1]) + ' (' + ar(x[0]) + ')'; }).join(' · ') + '</p></section>';
  h += '<section class="card"><h2>هدفك اليومي</h2><p class="note">السلسلة بتتحسب لما توصل للهدف. النهارده: ' + fmtMin(m) + ' من ' + fmtMin(j.goal) + '</p>' + bar(Math.min(100, Math.round(m * 100 / j.goal))) +
    chips('jg', [['10', '١٠ دقايق'], ['20', '٢٠ دقيقة'], ['30', '٣٠ دقيقة'], ['45', '٤٥ دقيقة'], ['60', 'ساعة'], ['120', 'ساعتين']], String(j.goal)) + '</section>';
  h += '<section class="card"><h2>يوم الراحة (جوكر الأسبوع)</h2><p class="note">اليوم ده مش بيقطع السلسلة حتى لو ماذاكرتش فيه.</p>' + chips('jd', dn, String(j.day)) + '</section>';
  h += '<section class="card"><h2>تقريرك الأسبوعي</h2>' + weeklyHtml() + '<div class="label">يوصلك إشعار بالتقرير يوم</div>' + chips('jr', dn, String(j.rday)) + '<div class="custom"><label for="jrt" class="note">الساعة</label><input type="time" id="jrt" value="' + esc(j.rtime) + '"></div>' +
    '<button class="btn sec" type="button" data-a="sw-wk">' + (j.wk ? 'إشعار التقرير شغال، اضغط للإيقاف' : 'إشعار التقرير واقف، اضغط للتشغيل') + '</button></section>';
  return h;
}
function weeklyHtml() {
  var w = weekStats(dkey(new Date())), d = w.tot - w.prev;
  return '<div class="stat"><span>مذاكرة آخر ٧ أيام</span><b>' + fmtMin(w.tot) + '</b></div><div class="stat"><span>أيام وصلت فيها للهدف</span><b>' + ar(w.met) + ' من ٧</b></div>' +
    '<div class="stat"><span>أحسن يوم في الأسبوع</span><b>' + (w.best.m ? fmtMin(w.best.m) : '-') + '</b></div>' + (w.top ? '<div class="stat"><span>أكتر مادة</span><b>' + esc(w.top) + '</b></div>' : '') +
    '<div class="stat"><span>أحسن يوم عندك على الإطلاق</span><b>' + (w.pb.m ? fmtMin(w.pb.m) : '-') + '</b></div><p class="note">' + (w.prev ? (d >= 0 ? 'أكتر من الأسبوع اللي قبله بـ ' + fmtMin(d) + '.' : 'أقل من الأسبوع اللي قبله بـ ' + fmtMin(-d) + '، عادي والأسبوع الجاي أحسن.') : 'كمّل وهنقارن أسبوعك بالأسبوع اللي قبله.') + '</p>';
}
function weeklyEvents(now) {
  var j = jkc(), out = [], d, nowMs = now.getTime(), tp = String(j.rtime).split(':');
  if (!j.wk) return out;
  for (d = 0; d < REM_DAYS; d++) { var day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d); if (day.getDay() !== +j.rday) continue; var at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), +tp[0] || 20, +tp[1] || 0).getTime(); if (at >= nowMs) out.push({ at: at, rep: 0, until: at, subject: 'تقرير', title: 'تقريرك الأسبوعي جاهز', text: 'افتح مذاكرتي وشوف أسبوعك وأحسن يوم عندك.' }); }
  return out;
}
function lessonsOf(sub) { return S.lessons[sub] || []; }
function progress(sub) { var l = lessonsOf(sub), d = l.filter(function (x) { return x.done; }).length; return { done: d, total: l.length, pct: l.length ? Math.round(d * 100 / l.length) : 0 }; }
function bar(pc) { return '<div class="bar"><i style="width:' + pc + '%"></i></div>'; }
function reviewsDue() {
  var out = [], t = dkey(new Date());
  for (var sub in S.lessons) lessonsOf(sub).forEach(function (l) {
    if (!l.done || !l.at) return;
    var st = l.rs || 0; if (st >= 2) return;
    var due = addDays(l.at, st === 0 ? 1 : 7);
    if (due <= t) out.push({ sub: sub, l: l, st: st });
  });
  return out;
}
function examPlan() {
  var out = [];
  S.exams.forEach(function (e) {
    var n = daysUntil(e.date); if (n < 0) return;
    var rest = lessonsOf(e.subject).filter(function (x) { return !x.done; });
    if (!rest.length) return;
    var days = Math.max(1, n), per = Math.ceil(rest.length / days);
    out.push({ e: e, n: n, rest: rest, per: per, days: days });
  });
  return out.sort(function (a, b) { return a.e.date < b.e.date ? -1 : 1; });
}
function mmss(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function track(v) { return TRACKS.filter(function (t) { return t.v === v; })[0]; }
function subjectsFor(p) {
  var t = track(p.track), base = [];
  if (p.grade === '1') base = GRADE1;
  if (p.grade === '2' && t) base = ['اللغة العربية', 'لغة أجنبية أولى (إنجليزي)', 'التاريخ', p.elective];
  if (p.grade === '3' && t) base = t.g3;
  return base.filter(Boolean).concat(p.custom || []);
}
function setupReady(s) { return s.grade === '1' || (s.grade === '3' && s.track) || (s.grade === '2' && s.track && s.elective); }
function chips(name, opts, val) {
  return '<div class="chips">' + opts.map(function (o) { return '<button class="chip" type="button" data-a="' + name + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (o[0] === val) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>';
}
function subjOpts(list) { return list.map(function (s) { return [s, s]; }); }

