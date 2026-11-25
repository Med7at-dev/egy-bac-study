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
var S = { profile: { grade: '', track: '', elective: '', custom: [] }, tasks: [], exams: [], mins: {} };
try { var saved = JSON.parse(localStorage.getItem(KEY)); if (saved) { for (var k in S) if (saved[k] !== undefined) S[k] = saved[k]; } } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

// ===== حالة مؤقتة (مش بتتحفظ) =====
var U = { tab: 'plan', editing: false, setup: { grade: '', track: '', elective: '' }, day: String(new Date().getDay()), subj: '', dur: '60', exSubj: '', exDate: '', extra: '' };
var T = { len: 25, left: 25 * 60, running: false, end: 0, finished: false, id: null };

// ===== أدوات =====
var AR = '٠١٢٣٤٥٦٧٨٩';
function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[+d]; }); }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function dkey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function daysUntil(iso) { var p = iso.split('-').map(Number), n = new Date(); return Math.round((new Date(p[0], p[1] - 1, p[2]) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5); }
function mmss(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function track(v) { return TRACKS.filter(function (t) { return t.v === v; })[0]; }
function subjectsFor(p) {
  var t = track(p.track), base = [];
  if (p.grade === '1') base = GRADE1;
  if (p.grade === '2' && t) base = ['اللغة العربية', 'لغة أجنبية أولى (إنجليزي)', 'التاريخ', p.elective, 'الثقافة المالية'];
  if (p.grade === '3' && t) base = t.g3;
  return base.filter(Boolean).concat(p.custom || []);
}
function setupReady(s) { return s.grade === '1' || (s.grade === '3' && s.track) || (s.grade === '2' && s.track && s.elective); }
function chips(name, opts, val) {
  return '<div class="chips">' + opts.map(function (o) { return '<button class="chip" type="button" data-a="' + name + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (o[0] === val) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>';
}
function subjOpts(list) { return list.map(function (s) { return [s, s]; }); }

// ===== الشاشات =====
function viewSetup() {
  var s = U.setup, t = track(s.track), h = '<h2>إنت في أنهي صف؟</h2>' + chips('sg', GRADES, s.grade);
  if (s.grade === '2' || s.grade === '3') {
    h += '<h2>اختار مسارك</h2>' + chips('st', TRACKS.map(function (x) { return [x.v, x.l]; }), s.track);
    if (s.grade === '2' && t) h += '<div class="label">مادة المسار (اختار واحدة)</div>' + chips('se', subjOpts(t.el), s.elective);
  }
  if (s.grade && setupReady(s)) {
    h += '<h2>موادك</h2><p>' + esc(subjectsFor({ grade: s.grade, track: s.track, elective: s.elective, custom: [] }).join('، ')) + '</p>' +
      '<button class="btn" type="button" data-a="start">ابدأ</button>';
  }
  return h;
}
function taskList(list, empty) {
  if (!list.length) return '<p class="note">' + empty + '</p>';
  return list.map(function (t) {
    return '<div class="row"><button class="check" type="button" data-a="tdone" data-v="' + t.id + '" aria-pressed="' + t.done + '" aria-label="خلصت">' + (t.done ? '✓' : '') + '</button>' +
      '<div class="grow' + (t.done ? ' done' : '') + '"><b>' + esc(t.subject) + '</b><small>' + ar(t.minutes) + ' دقيقة</small></div>' +
      '<button class="del" type="button" data-a="tdel" data-v="' + t.id + '">مسح</button></div>';
  }).join('');
}
function viewPlan(subs) {
  var today = new Date().getDay(), tl = S.tasks.filter(function (t) { return t.day === today; }), dn = tl.filter(function (t) { return t.done; }).length;
  if (subs.indexOf(U.subj) < 0) U.subj = subs[0];
  var h = '<h2>' + (tl.length ? ar(dn) + ' من ' + ar(tl.length) + ' خلصوا النهارده' : 'مفيش حاجة النهارده') + '</h2>' + taskList(tl, 'ضيف أول مادة في الجدول من تحت.');
  h += '<h2>ضيف حصة مذاكرة</h2><div class="label">اليوم</div>' + chips('pd', DAYS.map(function (d) { return [String(d.id), d.n]; }), U.day);
  h += '<div class="label">المادة</div>' + chips('ps', subjOpts(subs), U.subj);
  h += '<div class="label">المدة</div>' + chips('pm', [30, 60, 90, 120].map(function (m) { return [String(m), ar(m) + ' دقيقة']; }), U.dur);
  h += '<button class="btn" type="button" data-a="tadd">ضيف للجدول</button><h2>الأسبوع كله</h2>';
  DAYS.forEach(function (d) {
    h += '<div class="dayname">' + d.n + (d.id === today ? ' (النهارده)' : '') + '</div>' + taskList(S.tasks.filter(function (t) { return t.day === d.id; }), 'فاضي');
  });
  return h;
}
function viewTimer() {
  var today = S.mins[dkey(new Date())] || 0, week = 0;
  for (var k in S.mins) { var n = daysUntil(k); if (n <= 0 && n > -7) week += S.mins[k]; }
  var h = '<h2>مؤقت التركيز</h2><div class="clock" role="timer" id="clock">' + mmss(T.left) + '</div><div class="label">مدة التركيز</div>' +
    chips('fl', FOCUS.map(function (m) { return [String(m), ar(m) + ' دقيقة']; }), String(T.len)) + '<div class="actions">' +
    (T.running ? '<button class="btn sec" type="button" data-a="pause">وقف مؤقت</button>' : '<button class="btn" type="button" data-a="start-t">' + (T.left < T.len * 60 && T.left > 0 ? 'كمّل' : 'ابدأ') + '</button>') +
    '<button class="btn ghost" type="button" data-a="reset">من الأول</button></div>';
  if (T.finished) h += '<div class="callout"><b>برافو، خلصت الجلسة</b><br>اتسجلت لك ' + ar(T.len) + ' دقيقة. خد راحة خمس دقايق وقوم اتحرك.</div>';
  h += '<p class="note">سيب الصفحة مفتوحة وإنت بتذاكر. الوقت بيتسجل لما الجلسة تخلص بس.</p><h2>مذاكرتك</h2>' +
    '<div class="stat"><span>النهارده</span><b>' + ar(today) + ' دقيقة</b></div><div class="stat"><span>آخر ٧ أيام</span><b>' + ar(week) + ' دقيقة</b></div>';
  return h;
}
function viewExams(subs) {
  if (subs.indexOf(U.exSubj) < 0) U.exSubj = subs[0];
  var list = S.exams.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  var h = '<h2>' + (list.length ? ar(list.length) + ' جاية' : 'ضيف أول ميعاد امتحان شامل') + '</h2>';
  if (!list.length) h += '<p class="note">اكتب ميعاد الامتحانات الشاملة من تحت، وهتشوف كام يوم باقي.</p>';
  list.forEach(function (e) {
    var n = daysUntil(e.date), lab = n === 0 ? 'النهارده' : n === 1 ? 'بكرة' : n === 2 ? 'بعد بكرة' : n < 0 ? 'عدّى' : 'باقي ' + ar(n) + ' يوم';
    h += '<div class="row"><div class="days' + (n >= 0 && n <= 3 ? ' urgent' : '') + (n < 0 ? ' past' : '') + '">' + (n < 0 ? '-' : ar(n)) + '</div><div class="grow"><b>' + esc(e.subject) + '</b><small>' + lab + ' · ' + esc(e.date) + '</small></div><button class="del" type="button" data-a="edel" data-v="' + e.id + '">مسح</button></div>';
  });
  h += '<h2>ضيف ميعاد الامتحانات الشاملة</h2><div class="label">المادة</div>' + chips('es', subjOpts(subs), U.exSubj) +
    '<div class="label">التاريخ</div><input type="date" id="exdate" value="' + esc(U.exDate) + '"><button class="btn" type="button" data-a="eadd">ضيف الميعاد</button>';
  return h;
}
function render() {
  var p = S.profile, app = document.getElementById('app'), needSetup = !p.grade || U.editing, subs = subjectsFor(p);
  var nxt = S.exams.filter(function (e) { return daysUntil(e.date) >= 0; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; })[0];
  var h = '<h1>مذاكرة البكالوريا المصرية</h1><p class="intro">' + (needSetup ? 'اختار صفك ومسارك، وبعدها جدول أسبوعي ومؤقت تركيز وعدّاد للامتحانات.' : (nxt ? esc(nxt.subject) + ': ' + (daysUntil(nxt.date) === 0 ? 'النهارده' : 'باقي ' + ar(daysUntil(nxt.date)) + ' يوم') : 'جدول أسبوعي ومؤقت تركيز وعدّاد للامتحانات.')) + '</p>';
  if (needSetup) h += viewSetup();
  else {
    var t = track(p.track), gl = GRADES.filter(function (g) { return g[0] === p.grade; })[0][1];
    h += '<div class="profile"><div><b>' + gl + '</b><span>' + (t ? t.l : 'سنة تمهيدية') + '</span></div><button class="btn ghost" type="button" data-a="edit" style="margin:0">غيّر الصف أو المسار</button></div>';
    h += chips('tab', [['plan', 'الجدول'], ['timer', 'التركيز'], ['exams', 'الامتحانات الشاملة']], U.tab);
    h += U.tab === 'plan' ? viewPlan(subs) : U.tab === 'timer' ? viewTimer() : viewExams(subs);
    h += '<h2>موادك</h2><p>' + esc(subs.join('، ')) + '</p>';
  }
  h += '<p class="offline">بيشتغل من غير نت وبياناتك على موبايلك بس.</p>';
  var y = window.scrollY; app.innerHTML = h; window.scrollTo(0, y);
}

// ===== المؤقت =====
function tick() {
  var s = Math.max(0, Math.round((T.end - Date.now()) / 1000)); T.left = s;
  if (s === 0) {
    clearInterval(T.id); T.running = false; T.finished = true;
    var k = dkey(new Date()); S.mins[k] = (S.mins[k] || 0) + T.len; save();
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
    render();
  } else { var c = document.getElementById('clock'); if (c) c.textContent = mmss(s); }
}

// ===== الضغطات =====
document.addEventListener('input', function (e) {
  if (e.target.id === 'extra') U.extra = e.target.value;
  if (e.target.id === 'exdate') U.exDate = e.target.value;
});
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-a]'); if (!b) return;
  var a = b.dataset.a, v = b.dataset.v, s = U.setup;
  if (a === 'sg') { s.grade = v; s.elective = ''; if (v === '1') s.track = ''; }
  else if (a === 'st') { s.track = v; s.elective = ''; }
  else if (a === 'se') s.elective = v;
  else if (a === 'start') { if (setupReady(s)) { S.profile = { grade: s.grade, track: s.track, elective: s.elective, custom: S.profile.custom || [] }; U.editing = false; save(); } }
  else if (a === 'edit') { U.setup = { grade: S.profile.grade, track: S.profile.track, elective: S.profile.elective }; U.editing = true; }
  else if (a === 'tab') U.tab = v;
  else if (a === 'pd') U.day = v;
  else if (a === 'ps') U.subj = v;
  else if (a === 'pm') U.dur = v;
  else if (a === 'tadd') { S.tasks.push({ id: Date.now(), day: +U.day, subject: U.subj, minutes: +U.dur, done: false }); save(); }
  else if (a === 'tdone') { S.tasks.forEach(function (t) { if (String(t.id) === v) t.done = !t.done; }); save(); }
  else if (a === 'tdel') { S.tasks = S.tasks.filter(function (t) { return String(t.id) !== v; }); save(); }
  else if (a === 'es') U.exSubj = v;
  else if (a === 'eadd') { var d = document.getElementById('exdate').value; if (d) { S.exams.push({ id: Date.now(), subject: U.exSubj, date: d }); U.exDate = ''; save(); } }
  else if (a === 'edel') { S.exams = S.exams.filter(function (x) { return String(x.id) !== v; }); save(); }
  else if (a === 'sadd') { var x = U.extra.trim(); if (x && subjectsFor(S.profile).indexOf(x) < 0) { S.profile.custom.push(x); U.extra = ''; save(); } }
  else if (a === 'fl') { if (!T.running) { T.len = +v; T.left = T.len * 60; T.finished = false; } }
  else if (a === 'start-t') { T.end = Date.now() + T.left * 1000; T.finished = false; T.running = true; clearInterval(T.id); T.id = setInterval(tick, 500); }
  else if (a === 'pause') { T.running = false; clearInterval(T.id); }
  else if (a === 'reset') { T.running = false; clearInterval(T.id); T.finished = false; T.left = T.len * 60; }
  render();
});

render();
if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
