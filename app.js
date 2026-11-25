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
var S = { settings: { study: { on: false, t: '17:00' }, exam: { on: true }, focus: { on: true }, usage: { on: false, h: 4 } }, sess: {}, profile: { grade: '', track: '', elective: '', electives: {}, custom: [] }, tasks: [], exams: [], mins: {} };
try { var saved = JSON.parse(localStorage.getItem(KEY)); if (saved) { for (var k in S) if (saved[k] !== undefined) S[k] = saved[k]; } } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} syncAndroid(); }
function syncAndroid() { try { if (window.Android && Android.sync) Android.sync(JSON.stringify({ settings: S.settings, exams: S.exams })); } catch (e) {} }

// ===== حالة مؤقتة (مش بتتحفظ) =====
var U = { tab: 'home', anim: '', editing: false, setup: { grade: '', track: '', elective: '' }, day: String(new Date().getDay()), subj: '', dur: '60', exSubj: '', exDate: '', extra: '' };
var T = { mode: 'focus', blen: 5, len: 25, left: 25 * 60, running: false, end: 0, finished: false, id: null };

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
  if (p.grade === '2' && t) base = ['اللغة العربية', 'لغة أجنبية أولى (إنجليزي)', 'التاريخ', p.elective];
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

var TABS = [['home', 'الرئيسية'], ['plan', 'الجدول'], ['timer', 'التركيز'], ['exams', 'الامتحانات الشاملة'], ['settings', 'الإعدادات']];
var ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  plan: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  exams: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'
};
function icon(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg>'; }
function nextExam() {
  return S.exams.filter(function (e) { return daysUntil(e.date) >= 0; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; })[0];
}
function whenLabel(n) { return n === 0 ? 'النهارده' : n === 1 ? 'بكرة' : n === 2 ? 'بعد بكرة' : n < 0 ? 'عدّى' : 'باقي ' + ar(n) + ' يوم'; }
function viewHome(subs) {
  var today = new Date().getDay(), tl = S.tasks.filter(function (t) { return t.day === today; }), dn = tl.filter(function (t) { return t.done; }).length;
  var mins = S.mins[dkey(new Date())] || 0, nx = nextExam();
  var h = '<section class="card lift"><h2>' + (tl.length ? ar(dn) + ' من ' + ar(tl.length) + ' خلصوا النهارده' : 'مفيش حاجة النهارده') + '</h2>' + taskList(tl, 'ضيف أول مادة في الجدول.') +
    '<button class="btn" type="button" data-a="tab" data-v="plan">ضيف حصة مذاكرة</button></section>';
  h += '<section class="card"><h2>الامتحانات الشاملة</h2>' + (nx ? '<div class="row"><div class="days' + (daysUntil(nx.date) <= 3 ? ' urgent' : '') + '">' + ar(daysUntil(nx.date)) + '</div><div class="grow"><b>' + esc(nx.subject) + '</b><small>' + whenLabel(daysUntil(nx.date)) + ' · ' + esc(nx.date) + '</small></div></div>' : '<p class="note">ضيف أول ميعاد امتحان شامل.</p>') +
    '<button class="btn sec" type="button" data-a="tab" data-v="exams">الامتحانات الشاملة</button></section>';
  h += '<section class="card"><h2>مذاكرتك</h2><div class="stat"><span>النهارده</span><b>' + ar(mins) + ' دقيقة</b></div><button class="btn sec" type="button" data-a="tab" data-v="timer">مؤقت التركيز</button></section>';
  h += '<section class="card"><h2>موادك</h2><p>' + esc(subs.join('، ')) + '</p></section>';
  return h;
}
function viewPlan(subs) {
  var today = new Date().getDay();
  if (subs.indexOf(U.subj) < 0) U.subj = subs[0];
  var h = '<section class="card lift"><h2>ضيف حصة مذاكرة</h2><div class="label">اليوم</div>' + chips('pd', DAYS.map(function (d) { return [String(d.id), d.n]; }), U.day);
  h += '<div class="label">المادة</div>' + chips('ps', subjOpts(subs), U.subj);
  h += '<div class="label">المدة</div>' + chips('pm', [30, 60, 90, 120].map(function (m) { return [String(m), ar(m) + ' دقيقة']; }), U.dur);
  h += '<button class="btn" type="button" data-a="tadd">ضيف للجدول</button></section><section class="card"><h2>الأسبوع كله</h2>';
  DAYS.forEach(function (d) {
    h += '<div class="dayname' + (d.id === today ? ' now' : '') + '">' + d.n + (d.id === today ? ' (النهارده)' : '') + '</div>' + taskList(S.tasks.filter(function (t) { return t.day === d.id; }), 'فاضي');
  });
  return h + '</section>';
}
var RC = 565.5;
function total() { return (T.mode === 'break' ? T.blen : T.len) * 60; }
function viewTimer() {
  var dk = dkey(new Date()), today = S.mins[dk] || 0, week = 0, nsess = (S.sess || {})[dk] || 0, brk = T.mode === 'break';
  for (var k in S.mins) { var n = daysUntil(k); if (n <= 0 && n > -7) week += S.mins[k]; }
  var off = RC * (1 - T.left / total());
  var h = '<section class="card lift timercard"><h2>' + (brk ? 'وقت الراحة' : 'مؤقت التركيز') + '</h2><div class="ringwrap"><svg class="ring" viewBox="0 0 200 200" aria-hidden="true"><circle class="ringbg" cx="100" cy="100" r="90"/><circle id="ringfg" class="ringfg' + (brk ? ' brk' : '') + '" cx="100" cy="100" r="90" stroke-dasharray="' + RC + '" stroke-dashoffset="' + off + '"/></svg>' +
    '<div class="clock" role="timer" id="clock">' + mmss(T.left) + '</div></div>';
  if (!brk) {
    h += '<div class="label">مدة التركيز</div>' + chips('fl', FOCUS.map(function (m) { return [String(m), ar(m) + ' دقيقة']; }), String(T.len)) +
      '<div class="custom"><input type="number" id="cmin" inputmode="numeric" min="1" max="300" placeholder="أو اكتب أي عدد دقايق" value="' + (FOCUS.indexOf(T.len) < 0 ? T.len : '') + '"><button class="btn sec" type="button" data-a="cset">اضبط</button></div>';
  }
  h += '<div class="actions">' +
    (T.running ? '<button class="btn sec" type="button" data-a="pause">وقف مؤقت</button>' : '<button class="btn" type="button" data-a="start-t">' + (T.left < total() && T.left > 0 ? 'كمّل' : 'ابدأ') + '</button>') +
    '<button class="btn ghost" type="button" data-a="reset">' + (brk ? 'ارجع للتركيز' : 'من الأول') + '</button>' +
    (!brk && !T.running ? '<button class="btn sec" type="button" data-a="brk" data-v="5">خد راحة ٥ دقايق</button>' : '') + '</div></section>';
  if (T.finished === 'break') h += '<div class="callout pop"><b>خلصت الراحة</b><br>جاهز لجلسة تانية؟ دوس ابدأ.</div>';
  else if (T.finished) {
    h += '<div class="callout pop"><b>برافو، خلصت الجلسة</b><br>اتسجلت لك ' + ar(T.len) + ' دقيقة. خد راحة خمس دقايق وقوم اتحرك.';
    if (nsess > 0 && nsess % 4 === 0) h += '<br>خلصت ' + ar(nsess) + ' جلسات النهارده، يستاهل راحة طويلة ١٥ دقيقة.';
    h += '<div class="actions"><button class="btn" type="button" data-a="brk" data-v="5">راحة ٥ دقايق</button><button class="btn sec" type="button" data-a="brk" data-v="15">راحة ١٥ دقيقة</button></div></div>';
  }
  h += '<p class="note">سيب الصفحة مفتوحة وإنت بتذاكر. الوقت بيتسجل لما الجلسة تخلص بس.</p><section class="card"><h2>مذاكرتك</h2>' +
    '<div class="stat"><span>جلسات النهارده</span><b>' + ar(nsess) + '</b></div><div class="stat"><span>النهارده</span><b>' + ar(today) + ' دقيقة</b></div><div class="stat"><span>آخر ٧ أيام</span><b>' + ar(week) + ' دقيقة</b></div></section>';
  return h;
}
function sw(name, on) { return '<button type="button" class="sw" role="switch" data-a="' + name + '" aria-checked="' + on + '"><i></i></button>'; }
function viewSettings() {
  var st = S.settings, A = window.Android, ok = !!(A && A.sync), n = ok && A.notifOk && A.notifOk(), u = ok && A.usageOk && A.usageOk();
  var h = '<section class="card lift"><h2>الأذونات</h2>';
  if (!ok) h += '<p class="note">الأذونات والتنبيهات بتشتغل في تطبيق الأندرويد بس. هنا تقدر تظبط الإعدادات وتتحفظ.</p>';
  else {
    var bo = A.battOk && A.battOk(), eo = A.exactOk && A.exactOk();
    var pr = function (name, why, good, act, lbl) { return '<div class="row"><div class="grow"><b>' + name + '</b><small>' + why + '</small></div>' + (good ? '<span class="okb">تمام ✓</span>' : '<button class="btn sec perm" type="button" data-a="' + act + '">' + lbl + '</button>') + '</div>'; };
    h += pr('الإشعارات', 'عشان التذكيرات والتنبيهات تظهر', n, 'openn', 'اسمح') +
      pr('المنبّهات الدقيقة', 'عشان التذكير يوصل في ميعاده بالظبط', eo, 'openx', 'اسمح') +
      pr('من غير توفير البطارية', 'عشان المؤقت والتذكيرات ما يتقفلوش', bo, 'openb', 'اسمح') +
      pr('الوصول لبيانات الاستخدام (اختياري)', 'لتنبيه استخدام الموبايل بس. بتدّيه بإيدك من إعدادات الأندرويد. بنشوف مجموع الوقت فقط، ومحليا على موبايلك', u, 'openu', 'افتح الإعداد');
    h += '<p class="note">وفيه إذن بيشتغل من غير سؤال: إعادة التذكيرات بعد ما الموبايل يتفتح من تاني، والاهتزاز.</p>';
  }
  h += '</section><section class="card"><h2>التنبيهات</h2>';
  h += '<div class="row"><div class="grow"><b>تذكير المذاكرة كل يوم</b><small>رسالة في الميعاد اللي تختاره</small></div>' + sw('sw-study', st.study.on) + '</div>';
  if (st.study.on) h += '<div class="custom"><label for="stime" class="note">الميعاد</label><input type="time" id="stime" value="' + esc(st.study.t) + '"></div>';
  h += '<div class="row"><div class="grow"><b>تذكير الامتحانات</b><small>قبلها بـ٣ أيام وبيوم وصباح يوم الامتحان</small></div>' + sw('sw-exam', st.exam.on) + '</div>' +
    '<div class="row"><div class="grow"><b>تنبيه نهاية التركيز والراحة</b><small>يرن حتى لو التطبيق في الخلفية</small></div>' + sw('sw-focus', st.focus.on) + '</div>' +
    '<div class="row"><div class="grow"><b>تنبيه استخدام الموبايل</b><small>رسالة لما تقعد على الموبايل وقت طويل في اليوم (اختياري)</small></div>' + sw('sw-usage', st.usage.on) + '</div>';
  if (st.usage.on) {
    h += '<div class="label">نبّهني بعد</div>' + chips('uh', [2, 3, 4, 5, 6].map(function (x) { return [String(x), ar(x) + ' ساعات']; }), String(st.usage.h));
    if (ok && !u) h += '<div class="callout">عشان ده يشتغل لازم تدي التطبيق إذن «الوصول لبيانات الاستخدام» بإيدك من إعدادات الأندرويد. التطبيق بيشوف مجموع وقت الاستخدام بس، مش محتوى أي حاجة، وكل ده على موبايلك. <button class="btn sec" type="button" data-a="openu">افتح الإعداد</button></div>';
    else if (ok) h += '<p class="note">الإذن شغال. المراجعة بتحصل تقريباً كل نص ساعة، فالتنبيه ممكن يتأخر شوية.</p>';
  }
  if (ok) h += '<button class="btn sec" type="button" data-a="testn">جرّب تنبيه دلوقتي</button>';
  h += '</section>';
  return h;
}
function viewExams(subs) {
  if (subs.indexOf(U.exSubj) < 0) U.exSubj = subs[0];
  var list = S.exams.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  var h = '<section class="card lift"><h2>' + (list.length ? ar(list.length) + ' جاية' : 'ضيف أول ميعاد امتحان شامل') + '</h2>';
  if (!list.length) h += '<p class="note">اكتب ميعاد الامتحانات الشاملة من تحت، وهتشوف كام يوم باقي.</p>';
  list.forEach(function (e) {
    var n = daysUntil(e.date);
    h += '<div class="row"><div class="days' + (n >= 0 && n <= 3 ? ' urgent' : '') + (n < 0 ? ' past' : '') + '">' + (n < 0 ? '-' : ar(n)) + '</div><div class="grow"><b>' + esc(e.subject) + '</b><small>' + whenLabel(n) + ' · ' + esc(e.date) + '</small></div><button class="del" type="button" data-a="edel" data-v="' + e.id + '">مسح</button></div>';
  });
  h += '</section><section class="card"><h2>ضيف ميعاد الامتحانات الشاملة</h2><div class="label">المادة</div>' + chips('es', subjOpts(subs), U.exSubj) +
    '<div class="label">التاريخ</div><input type="date" id="exdate" value="' + esc(U.exDate) + '"><button class="btn" type="button" data-a="eadd">ضيف الميعاد</button></section>';
  return h;
}
function render() {
  var p = S.profile, app = document.getElementById('app'), needSetup = !p.grade || U.editing, subs = subjectsFor(p), nx = nextExam();
  var sub = needSetup ? 'اختار صفك ومسارك، وبعدها جدول أسبوعي ومؤقت تركيز وعدّاد للامتحانات.' : (nx ? esc(nx.subject) + ': ' + (daysUntil(nx.date) === 0 ? 'النهارده' : 'باقي ' + ar(daysUntil(nx.date)) + ' يوم') : 'جدول أسبوعي ومؤقت تركيز وعدّاد للامتحانات.');
  var h = '<header class="hero"><div class="heroin"><h1>مذاكرة البكالوريا المصرية</h1><p class="intro">' + sub + '</p>';
  if (!needSetup) {
    var t = track(p.track), gl = GRADES.filter(function (g) { return g[0] === p.grade; })[0][1];
    h += '<div class="profile"><div><b>' + gl + '</b><span>' + (t ? t.l : 'سنة تمهيدية') + '</span></div><button class="pill" type="button" data-a="edit">غيّر الصف أو المسار</button></div>';
  }
  h += '</div></header><div class="page ' + (U.anim || '') + '" id="page">';
  if (needSetup) h += '<section class="card lift">' + viewSetup() + '</section>';
  else h += U.tab === 'home' ? viewHome(subs) : U.tab === 'plan' ? viewPlan(subs) : U.tab === 'timer' ? viewTimer() : U.tab === 'settings' ? viewSettings() : viewExams(subs);
  h += '<p class="offline">بيشتغل من غير نت وبياناتك على موبايلك بس.</p><p class="offline">تطوير: Medhat Saaed · © ٢٠٢٦ جميع الحقوق محفوظة</p></div>';
  if (!needSetup) h += '<nav class="nav" aria-label="التنقل">' + TABS.map(function (x) { return '<button type="button" class="navb" data-a="tab" data-v="' + x[0] + '" aria-current="' + (U.tab === x[0]) + '">' + icon(x[0]) + '<span>' + x[1] + '</span></button>'; }).join('') + '</nav>';
  U.anim = '';
  var y = window.scrollY; app.innerHTML = h; window.scrollTo(0, y);
}

// ===== المؤقت =====
function tick() {
  var s = Math.max(0, Math.round((T.end - Date.now()) / 1000)); T.left = s;
  if (s === 0) {
    clearInterval(T.id); T.running = false;
    if (T.mode === 'break') { T.finished = 'break'; T.mode = 'focus'; T.left = T.len * 60; }
    else {
      T.finished = true; var k = dkey(new Date()); S.mins[k] = (S.mins[k] || 0) + T.len; S.sess = S.sess || {}; S.sess[k] = (S.sess[k] || 0) + 1; save();
    }
    try { if (window.Android && Android.cancelFocus) Android.cancelFocus(); } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
    render();
  } else {
    var c = document.getElementById('clock'); if (c) c.textContent = mmss(s);
    var r = document.getElementById('ringfg'); if (r) r.setAttribute('stroke-dashoffset', RC * (1 - s / total()));
  }
}
function andr(f) { try { if (window.Android && Android[f]) return Android[f].apply(Android, Array.prototype.slice.call(arguments, 1)); } catch (e) {} }
document.addEventListener('visibilitychange', function () { if (!document.hidden) { if (T.running) tick(); render(); } });
window.addEventListener('focus', function () { if (U.tab === 'settings') render(); });

// ===== الضغطات =====
document.addEventListener('input', function (e) {
  if (e.target.id === 'extra') U.extra = e.target.value;
  if (e.target.id === 'exdate') U.exDate = e.target.value;
  if (e.target.id === 'stime' && e.target.value) { S.settings.study.t = e.target.value; save(); }
});
function ti(k) { for (var i = 0; i < TABS.length; i++) if (TABS[i][0] === k) return i; return 0; }
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-a]'); if (!b) return;
  var a = b.dataset.a, v = b.dataset.v, s = U.setup;
  if (a === 'sg') { if (s.grade !== v) { s.grade = v; if (v === '1') s.track = ''; s.elective = (S.profile.electives || {})[s.track] || ''; } }
  else if (a === 'st') { if (s.track !== v) { s.track = v; s.elective = (S.profile.electives || {})[v] || ''; } }
  else if (a === 'se') { s.elective = v; S.profile.electives = S.profile.electives || {}; S.profile.electives[s.track] = v; save(); }
  else if (a === 'start') { if (setupReady(s)) { U.anim = 'in-up'; U.tab = 'home'; S.profile = { grade: s.grade, track: s.track, elective: s.elective, electives: S.profile.electives || {}, custom: S.profile.custom || [] }; U.editing = false; save(); } }
  else if (a === 'edit') { U.anim = 'in-up'; U.setup = { grade: S.profile.grade, track: S.profile.track, elective: S.profile.elective }; U.editing = true; }
  else if (a === 'tab') { if (v !== U.tab) { U.anim = ti(v) > ti(U.tab) ? 'in-next' : 'in-prev'; U.tab = v; window.scrollTo(0, 0); } }
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
  else if (a === 'cset') { var m = Math.round(+document.getElementById('cmin').value); if (m >= 1 && m <= 300 && !T.running) { T.len = m; T.left = m * 60; T.finished = false; } }
  else if (a === 'start-t') {
    T.end = Date.now() + T.left * 1000; T.finished = false; T.running = true; clearInterval(T.id); T.id = setInterval(tick, 500);
    if (S.settings.focus.on) andr('focusEnd', T.end, T.mode === 'break' ? 'break' : 'focus');
  }
  else if (a === 'pause') { T.running = false; clearInterval(T.id); andr('cancelFocus'); }
  else if (a === 'reset') { T.running = false; clearInterval(T.id); T.finished = false; T.mode = 'focus'; T.left = T.len * 60; andr('cancelFocus'); }
  else if (a === 'brk') { clearInterval(T.id); T.mode = 'break'; T.blen = +v; T.left = T.blen * 60; T.finished = false; T.end = Date.now() + T.left * 1000; T.running = true; T.id = setInterval(tick, 500); if (S.settings.focus.on) andr('focusEnd', T.end, 'break'); }
  else if (a === 'sw-study') { S.settings.study.on = !S.settings.study.on; save(); }
  else if (a === 'sw-exam') { S.settings.exam.on = !S.settings.exam.on; save(); }
  else if (a === 'sw-focus') { S.settings.focus.on = !S.settings.focus.on; save(); }
  else if (a === 'sw-usage') { S.settings.usage.on = !S.settings.usage.on; save(); if (S.settings.usage.on && window.Android && Android.usageOk && !Android.usageOk()) andr('openUsage'); }
  else if (a === 'uh') { S.settings.usage.h = +v; save(); }
  else if (a === 'openn') andr('openNotif');
  else if (a === 'openx') andr('openExact');
  else if (a === 'openb') andr('openBatt');
  else if (a === 'openu') andr('openUsage');
  else if (a === 'testn') andr('test');
  render();
});

render();
if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
