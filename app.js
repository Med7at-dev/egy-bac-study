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

var TABS = [['home', 'الرئيسية'], ['plan', 'الجدول'], ['timer', 'التركيز'], ['syl', 'المنهج'], ['exams', 'الامتحانات'], ['more', 'المزيد']];
var ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  plan: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  exams: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  syl: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M9 8h6M9 12h6"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'
};
function icon(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg>'; }
function nextExam() {
  return S.exams.filter(function (e) { return daysUntil(e.date) >= 0; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; })[0];
}
function whenLabel(n) { return n === 0 ? 'النهارده' : n === 1 ? 'بكرة' : n === 2 ? 'بعد بكرة' : n < 0 ? 'عدّى' : 'باقي ' + ar(n) + ' يوم'; }
function planLine(x) {
  var names = x.rest.slice(0, x.per).map(function (l) { return l.t; });
  return names.join('، ');
}
function sec(id, title, sum, body) {
  var o = !!(U.open && U.open[id]);
  return '<section class="card sec' + (o ? ' open' : '') + '"><button class="sec-h" type="button" data-a="tog" data-v="' + id + '" aria-expanded="' + o + '"><span><b>' + title + '</b><small>' + sum + '</small></span><i aria-hidden="true"></i></button>' + (o ? '<div class="sec-b">' + body + '</div>' : '') + '</section>';
}
function viewHome(subs) {
  var today = new Date().getDay(), tl = S.tasks.filter(function (t) { return t.day === today; }), dn = tl.filter(function (t) { return t.done; }).length;
  var mins = S.mins[dkey(new Date())] || 0, nx = nextExam(), pl = examPlan(), rv = reviewsDue(), j = jkc(), g = j.goal, n = streak(), rk = rank(n);
  var nextT = tl.filter(function (t) { return !t.done; })[0];
  // ===== النهارده (بس اللي محتاجه دلوقتي) =====
  var h = '<section class="card lift today"><h2>النهارده</h2>';
  if (nextT) h += '<div class="nexttask"><small>المهمة الجاية</small><b>' + esc(nextT.subject) + '</b><span>' + ar(nextT.minutes) + ' دقيقة</span></div><button class="btn" type="button" data-a="startsub" data-v="' + esc(nextT.subject) + '">ابدأ جلسة تركيز</button>';
  else h += '<div class="nexttask"><small>' + (tl.length ? 'خلصت كل مهام النهارده' : 'مفيش مهام في الجدول النهارده') + '</small><b>' + (tl.length ? 'برافو عليك' : 'ابدأ بجلسة تركيز أو ضيف حصة') + '</b></div><button class="btn" type="button" data-a="tab" data-v="timer">ابدأ جلسة تركيز</button>';
  h += '<div class="stat"><span>مذاكرة النهارده</span><b>' + fmtMin(mins) + ' من ' + fmtMin(g) + '</b></div>' + bar(Math.min(100, Math.round(mins * 100 / g))) +
    '<div class="stat"><span>أيام السلسلة</span><b>' + ar(n) + ' · ' + esc(rk.t) + '</b></div><p class="note msgl">' + esc(dailyMsg()) + '</p></section>';
  // ===== باقي الأقسام: مقفولة، دوس تفتح =====
  var eb, es;
  if (nx) { var d = daysUntil(nx.date); es = (d === 0 ? 'امتحان ' + esc(nx.subject) + ' النهارده' : 'باقي ' + ar(d) + ' يوم على ' + esc(nx.subject)); eb = '<div class="count' + (d <= 3 ? ' urgent' : '') + '"><b>' + ar(d) + '</b><span>' + (d === 0 ? 'امتحان ' + esc(nx.subject) + ' النهارده' : 'يوم لحد امتحان ' + esc(nx.subject)) + '</span></div><button class="btn sec" type="button" data-a="tab" data-v="exams">كل الامتحانات</button>'; }
  else { es = 'مفيش ميعاد لسه'; eb = '<p class="note">ضيف أول ميعاد امتحان شامل وهيظهر هنا العدّاد.</p><button class="btn" type="button" data-a="tab" data-v="exams">ضيف ميعاد</button>'; }
  var SC = {};
  SC.exam = sec('exam', 'الامتحانات الشاملة', es, eb);
  var pb = pl.length ? pl.slice(0, 3).map(function (x) { return '<div class="row"><div class="days">' + ar(x.per) + '</div><div class="grow"><b>' + esc(x.e.subject) + '</b><small>' + esc(planLine(x)) + '</small></div></div>'; }).join('') + '<p class="note">متوزّع على الأيام الباقية لحد الامتحان.</p>' : '<p class="note">هتظهر هنا لما تضيف امتحان وتدخل دروس المنهج.</p>';
  SC.plan = sec('plan', 'المطلوب من المنهج', pl.length ? ar(pl.length) + ' مادة النهارده' : 'مفيش حاجة دلوقتي', pb);
  var rb = rv.length ? rv.slice(0, 6).map(function (r) { return '<div class="row"><button class="check" type="button" data-a="rvdone" data-v="' + r.l.id + '" data-s="' + esc(r.sub) + '" aria-pressed="false" aria-label="راجعت"></button><div class="grow"><b>' + esc(r.l.t) + '</b><small>' + esc(r.sub) + ' · ' + (r.st === 0 ? 'مراجعة بعد يوم' : 'مراجعة بعد أسبوع') + '</small></div></div>'; }).join('') + (rv.length > 6 ? '<p class="note">وفيه ' + ar(rv.length - 6) + ' كمان في تبويب المنهج.</p>' : '') : '<p class="note">مفيش مراجعات مستنياك.</p>';
  SC.rev = sec('rev', 'وقت المراجعة', rv.length ? ar(rv.length) + ' درس مستني مراجعة' : 'مفيش مراجعات', rb);
  SC.tasks = sec('tasks', 'جدول النهارده', tl.length ? ar(dn) + ' من ' + ar(tl.length) + ' خلصوا' : 'فاضي', taskList(tl, 'ضيف أول مادة في الجدول.') + '<button class="btn" type="button" data-a="tab" data-v="plan">ضيف حصة مذاكرة</button>');
  SC.subs = sec('subs', 'موادك', ar(subs.length) + ' مواد', subs.map(function (sb) { var p = progress(sb); return '<div class="sp"><span>' + esc(sb) + '</span><b>' + (p.total ? ar(p.pct) + '٪' : '-') + '</b></div>' + bar(p.pct); }).join(''));
  SC.more = sec('more', 'السلسلة والإحصائيات', 'رتبتك والتقرير الأسبوعي', '<button class="btn sec" type="button" data-a="gosub" data-v="streak">السلسلة والتقرير</button> <button class="btn sec" type="button" data-a="gosub" data-v="stats">إحصائياتي</button> <button class="btn sec" type="button" data-a="tab" data-v="timer">مؤقت التركيز</button>');
  var zo = S.todos.filter(function (x) { return !x.done; }), zd = S.todos.filter(function (x) { return x.done; });
  var zb = '<div class="custom"><input type="text" id="todot" placeholder="مهمة جديدة" value="' + esc(U.todoText) + '"><button class="btn sec" type="button" data-a="zadd">ضيف</button></div>' + (S.todos.length ? '' : '<p class="note">اكتب أي حاجة لازم تتعمل، مش لازم تبقى مذاكرة.</p>') + zo.concat(zd).map(function (x) { return '<div class="row"><button class="check" type="button" data-a="zdone" data-v="' + x.id + '" aria-pressed="' + x.done + '" aria-label="خلصت">' + (x.done ? '✓' : '') + '</button><div class="grow' + (x.done ? ' done' : '') + '"><b>' + esc(x.t) + '</b></div><button class="del" type="button" data-a="zdel" data-v="' + x.id + '">مسح</button></div>'; }).join('') + (zd.length ? '<button class="btn ghost" type="button" data-a="zclear">امسح اللي خلص</button>' : '');
  SC.todo = sec('todo', 'قائمة المهام', S.todos.length ? ar(zo.length) + ' لسه من ' + ar(S.todos.length) : 'فاضية', zb);
  h += ['tasks', 'todo', 'rev', 'exam', 'plan', 'subs', 'more'].map(function (k) { return SC[k]; }).join('');
  return h;
}

function viewAuto() {
  var b = S.auto.b || 90, ap = autoPlan(b), h = '<section class="card lift"><h2>خطة الأسبوع التلقائية</h2><p class="note">من مواعيد امتحاناتك والدروس الباقية (ونقط الضعف بتاخد وقت أكتر).</p><div class="label">هتذاكر كام في اليوم؟</div>' + chips('ab', [60, 90, 120, 180].map(function (m) { return [String(m), fmtMin(m)]; }), String(b));
  if (!ap.length) h += '<p class="note">ضيف ميعاد امتحان شامل أو علّم دروس «ضعيف» وهتظهر الخطة هنا.</p>';
  else {
    var by = {}; ap.forEach(function (x) { (by[x.key] = by[x.key] || []).push(x); });
    Object.keys(by).sort().forEach(function (k) { var dn = DAYS.filter(function (d) { return d.id === by[k][0].day; })[0].n; h += '<div class="aday"><b>' + dn + (k === dkey(new Date()) ? ' (النهارده)' : '') + '</b><span>' + by[k].map(function (x) { return esc(x.subject) + ' ' + ar(x.minutes) + 'د'; }).join(' · ') + '</span></div>'; });
    h += '<div class="actions"><button class="btn" type="button" data-a="aapply">حطها في جدولي</button>' + (S.tasks.some(function (t) { return t.auto; }) ? '<button class="btn ghost" type="button" data-a="aclear">امسح الخطة القديمة</button>' : '') + '</div>';
  }
  if (U.msg) h += '<div class="callout pop">' + esc(U.msg) + '</div>';
  return h + '</section>';
}
function spark(l) {
  var w = 120, hh = 34, n = l.length, lo = Math.min.apply(null, l.map(pct)), hi = Math.max.apply(null, l.map(pct)), sp = Math.max(hi - lo, 10), pts = l.map(function (p, i) { return (n === 1 ? w / 2 : 4 + i * (w - 8) / (n - 1)).toFixed(1) + ',' + (hh - 4 - (pct(p) - lo) * (hh - 8) / sp).toFixed(1); });
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + hh + '" aria-hidden="true">' + (n > 1 ? '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--copper)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' : '') + pts.map(function (q) { var z = q.split(','); return '<circle cx="' + z[0] + '" cy="' + z[1] + '" r="2.6" fill="var(--copper)"/>'; }).join('') + '</svg>';
}
function viewPapers(subs) {
  if (subs.indexOf(U.psub) < 0) U.psub = subs[0];
  var h = '<section class="card lift"><h2>اختبارات سابقة</h2><p class="note">سجّل درجة كل اختبار أو امتحان تجريبي وشوف اتجاهك لكل مادة.</p><div class="label">المادة</div>' + chips('pps', subjOpts(subs), U.psub) +
    '<div class="label">درجتك</div><div class="custom"><input type="number" id="pscore" inputmode="decimal" min="0" placeholder="الدرجة" value="' + esc(U.pscore) + '"><input type="number" id="pmax" inputmode="decimal" min="1" placeholder="من كام" value="' + esc(U.pmax) + '"></div>' +
    '<div class="label">التاريخ (اختياري، النهارده لو سبته فاضي)</div><input type="date" id="pdate" value="' + esc(U.pdate) + '"><button class="btn" type="button" data-a="padd">سجّل الدرجة</button>' + (U.msg ? '<div class="callout pop">' + esc(U.msg) + '</div>' : '') + '</section>';
  var any = false;
  subs.forEach(function (sb) {
    var t = paperTrend(sb); if (!t) return; any = true;
    h += '<section class="card"><div class="sp"><span><b>' + esc(sb) + '</b></span><b>' + ar(t.last) + '٪ آخر درجة</b></div><div class="trend">' + spark(t.list) + '<div><small>' + ar(t.n) + ' اختبار، المتوسط ' + ar(t.avg) + '٪</small>' + (t.n > 1 ? '<small class="' + (t.diff >= 0 ? 'up' : 'down') + '">' + (t.diff >= 0 ? '▲ أحسن بـ ' : '▼ أقل بـ ') + ar(Math.abs(t.diff)) + '٪ من متوسط اللي قبله</small>' : '') + '</div></div>';
    t.list.slice().reverse().forEach(function (p) { h += '<div class="row"><div class="grow"><b>' + ar(p.score) + ' من ' + ar(p.max) + '</b><small>' + esc(p.date) + '</small></div><b class="pcb">' + ar(pct(p)) + '٪</b><button class="del" type="button" data-a="pdel" data-v="' + p.id + '">مسح</button></div>'; });
    h += '</section>';
  });
  if (!any) h += '<section class="card"><p class="note">لسه ماسجلتش أي درجة.</p></section>';
  return h;
}
function viewPlan(subs) {
  var today = new Date().getDay();
  if (subs.indexOf(U.subj) < 0) U.subj = subs[0];
  var h = viewAuto() + '<section class="card"><h2>ضيف حصة مذاكرة</h2><div class="label">اليوم</div>' + chips('pd', DAYS.map(function (d) { return [String(d.id), d.n]; }), U.day);
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
function treeSvg(p) {
  p = Math.max(0, Math.min(1, p)); var th = 8 + 46 * p, cr = 8 + 34 * p, cy = 118 - th - cr * 0.6, col = p >= 1 ? '#2c5247' : '#4f7a56';
  return '<svg viewBox="0 0 160 130" aria-hidden="true"><ellipse cx="80" cy="120" rx="46" ry="7" fill="#e6dccd"/><rect x="' + (80 - 4 - 3 * p) + '" y="' + (118 - th) + '" width="' + (8 + 6 * p) + '" height="' + th + '" rx="3" fill="#8a5a2b"/><circle cx="80" cy="' + cy + '" r="' + cr + '" fill="' + col + '"/>' + (p > 0.5 ? '<circle cx="' + (80 - cr * 0.45) + '" cy="' + (cy - cr * 0.2) + '" r="' + (cr * 0.5) + '" fill="#5f8d66"/>' : '') + (p >= 1 ? '<circle cx="72" cy="' + (cy + 4) + '" r="3" fill="#c98a4b"/><circle cx="90" cy="' + (cy - 6) + '" r="3" fill="#c98a4b"/>' : '') + '</svg>';
}
function viewTimer(subs) {
  if (subs.indexOf(U.fsub) < 0) U.fsub = subs[0];
  var dk = dkey(new Date()), today = S.mins[dk] || 0, week = 0, nsess = (S.sess || {})[dk] || 0, brk = T.mode === 'break';
  for (var k in S.mins) { var n = daysUntil(k); if (n <= 0 && n > -7) week += S.mins[k]; }
  var off = RC * (1 - T.left / total());
  var h = '<section class="card lift timercard"><h2>' + (brk ? 'وقت الراحة' : 'مؤقت التركيز') + '</h2><div class="ringwrap"><svg class="ring" viewBox="0 0 200 200" aria-hidden="true"><circle class="ringbg" cx="100" cy="100" r="90"/><circle id="ringfg" class="ringfg' + (brk ? ' brk' : '') + '" cx="100" cy="100" r="90" stroke-dasharray="' + RC + '" stroke-dashoffset="' + off + '"/></svg>' +
    '<div class="clock" role="timer" id="clock">' + mmss(T.left) + '</div></div>';
  if (!brk) {
    h += '<div class="label">مدة التركيز</div>' + chips('fl', FOCUS.map(function (m) { return [String(m), ar(m) + ' دقيقة']; }), String(T.len)) +
      '<div class="custom"><input type="number" id="cmin" inputmode="numeric" min="1" max="300" placeholder="أو اكتب أي عدد دقايق" value="' + (FOCUS.indexOf(T.len) < 0 ? T.len : '') + '"><button class="btn sec" type="button" data-a="cset">اضبط</button></div>';
  }
  if (!brk) h += '<div class="tree" id="tree">' + treeSvg(T.running || T.left < total() ? 1 - T.left / total() : 0) + '</div><div class="label">بتذاكر إيه؟ (الجلسة بتتسجل على المادة دي)</div>' + chips('fs', subjOpts(subs), T.running ? T.sub : U.fsub);
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
  var trees = 0, kk; for (kk in (S.sess || {})) trees += S.sess[kk];
  h += '<section class="card"><h2>حديقتك</h2><div class="garden">' + (nsess ? new Array(Math.min(nsess, 12) + 1).join('<span class="gt">' + treeSvg(1) + '</span>') : '<p class="note">كل جلسة تخلصها بتزرع شجرة النهارده.</p>') + '</div><div class="stat"><span>أشجار النهارده</span><b>' + ar(nsess) + '</b></div><div class="stat"><span>كل أشجارك</span><b>' + ar(trees) + '</b></div></section>';
  h += '<p class="note">سيب الصفحة مفتوحة وإنت بتذاكر. الوقت بيتسجل لما الجلسة تخلص بس.</p><section class="card"><h2>مذاكرتك</h2>' +
    '<div class="stat"><span>جلسات النهارده</span><b>' + ar(nsess) + '</b></div><div class="stat"><span>النهارده</span><b>' + ar(today) + ' دقيقة</b></div><div class="stat"><span>آخر ٧ أيام</span><b>' + ar(week) + ' دقيقة</b></div></section>';
  return h;
}
function sw(name, on) { return '<button type="button" class="sw" role="switch" data-a="' + name + '" aria-checked="' + on + '"><i></i></button>'; }
function viewTheme() {
  var cur = (S.settings && S.settings.theme) || 'classic';
  return '<section class="card lift"><h2>المظهر</h2><p class="note">اختار اللون اللي مريحك. التغيير فوري ومتحفوظ.</p><div class="themes">' + THEMES.map(function (t) { return '<button class="themeb" type="button" data-a="theme" data-v="' + t[0] + '" aria-pressed="' + (t[0] === cur) + '"><i><s style="background:' + t[2][0] + '"></s><s style="background:' + t[2][1] + '"></s><s style="background:' + t[2][2] + '"></s></i><span>' + t[1] + '</span></button>'; }).join('') + '</div></section>';
}
function viewSettings() {
  var st = S.settings, A = window.Android, ok = !!(A && A.sync), n = ok && A.notifOk && A.notifOk(), u = ok && A.usageOk && A.usageOk();
  var h = '<section class="card lift"><h2>الأذونات</h2>';
  if (!ok) {
    var perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    if (perm === 'unsupported') h += '<div class="callout">المتصفح ده مش بيدعم التنبيهات. افتح الموقع في Chrome على الأندرويد (وثبّته من «إضافة إلى الشاشة الرئيسية»)، أو استخدم تطبيق الـAPK.</div>';
    else if (perm === 'default') h += '<div class="row"><div class="grow"><b>التنبيهات</b><small>لازم تسمح للمتصفح يبعتلك تنبيهات</small></div><button class="btn perm" type="button" data-a="askn">فعّل التنبيهات</button></div>';
    else if (perm === 'granted') h += '<div class="row"><div class="grow"><b>التنبيهات</b><small>شغالة على الموقع ده</small></div><span class="okb">تمام ✓</span></div>';
    else h += '<div class="callout"><b>التنبيهات مقفولة.</b><br>دوس على أيقونة القفل أو النقط التلاتة جنب رابط الموقع، بعدين «إعدادات الموقع» أو «الأذونات»، واختار «الإشعارات» وغيّرها لـ«السماح». وبعدين ارجع هنا وحدّث الصفحة. لو مثبّت التطبيق: إعدادات الموبايل > التطبيقات > مذاكرتي > الإشعارات.</div>';
    h += '<p class="note">التنبيهات بتوصل وإنت فاتح التطبيق أو سايبه في الخلفية. لو قفلته خالص ممكن تتأخر لحد ما تفتحه. لو عايز تنبيهات مضمونة وهو مقفول استخدم تطبيق الأندرويد.</p>';
  }
  else {
    var bo = A.battOk && A.battOk(), eo = A.exactOk && A.exactOk();
    var pr = function (name, why, good, act, lbl) { return '<div class="row"><div class="grow"><b>' + name + '</b><small>' + why + '</small></div>' + (good ? '<span class="okb">تمام ✓</span>' : '<button class="btn sec perm" type="button" data-a="' + act + '">' + lbl + '</button>') + '</div>'; };
    h += pr('الإشعارات', 'عشان التذكيرات والتنبيهات تظهر', n, 'askn', 'اسمح') +
      pr('المنبّهات الدقيقة', 'عشان التذكير يوصل في ميعاده بالظبط', eo, 'openx', 'اسمح') +
      pr('من غير توفير البطارية', 'عشان المؤقت والتذكيرات ما يتقفلوش', bo, 'openb', 'اسمح') +
      pr('الوصول لبيانات الاستخدام (اختياري)', 'لتنبيه استخدام الموبايل بس. بتدّيه بإيدك من إعدادات الأندرويد. بنشوف مجموع الوقت فقط، ومحليا على موبايلك', u, 'openu', 'افتح الإعداد');
    var dd = A.dndOk && A.dndOk();
    h += pr('عدم الإزعاج أثناء التركيز', 'عشان الموبايل يسكّت كل حاجة وإنت بتذاكر، ويرجع زي ما كان لما الجلسة تخلص. بتدّيه من «الوصول لعدم الإزعاج»', dd, 'opend', 'افتح الإعداد');
    h += '<p class="note">وفيه إذن بيشتغل من غير سؤال: إعادة التذكيرات بعد ما الموبايل يتفتح من تاني، والاهتزاز.</p>';
  }
  h += '</section><section class="card"><h2>التنبيهات</h2>';
  h += '<div class="row"><div class="grow"><b>تذكير المذاكرة كل يوم</b><small>رسالة في الميعاد اللي تختاره</small></div>' + sw('sw-study', st.study.on) + '</div>';
  if (st.study.on) h += '<div class="custom"><label for="stime" class="note">الميعاد</label><input type="time" id="stime" value="' + esc(st.study.t) + '"></div>';
  h += '<div class="row"><div class="grow"><b>تذكير الامتحانات</b><small>قبلها بـ٣ أيام وبيوم وصباح يوم الامتحان</small></div>' + sw('sw-exam', st.exam.on) + '</div>' +
    '<div class="row"><div class="grow"><b>تنبيه نهاية التركيز والراحة</b><small>يرن حتى لو التطبيق في الخلفية</small></div>' + sw('sw-focus', st.focus.on) + '</div>' +
    (ok ? '<div class="row"><div class="grow"><b>رنّ زي المنبّه حتى لو الموبايل صامت</b><small>التذكيرات ونهاية التركيز بترن بصوت المنبّه وبتفضل ترن لحد ما توقفها. اتأكد إن صوت المنبّه عالي (الصوت والاهتزاز > صوت المنبّه)</small></div>' + sw('sw-alarm', st.alarm.on) + '</div>' : '') +
    (ok ? '<div class="row"><div class="grow"><b>سكّت الموبايل أثناء التركيز</b><small>بيشغّل «عدم الإزعاج» (المنبّهات بس) طول الجلسة وبيرجّعه لما تخلص أو توقف. منبّه نهاية التركيز بيرن عادي</small></div>' + sw('sw-dnd', st.dnd.on) + '</div>' : '<p class="note">تسكيت الموبايل أثناء التركيز متاح في تطبيق الأندرويد بس.</p>') +
    (ok ? '<div class="row"><div class="grow"><b>تنبيه استخدام الموبايل</b><small>رسالة لما تقعد على الموبايل وقت طويل في اليوم (اختياري)</small></div>' + sw('sw-usage', st.usage.on) + '</div>' : '<p class="note">تنبيه استخدام الموبايل متاح في تطبيق الأندرويد بس.</p>');
  if (ok && st.usage.on) {
    h += '<div class="label">نبّهني بعد</div>' + chips('uh', [2, 3, 4, 5, 6].map(function (x) { return [String(x), ar(x) + ' ساعات']; }), String(st.usage.h));
    if (ok && !u) h += '<div class="callout">عشان ده يشتغل لازم تدي التطبيق إذن «الوصول لبيانات الاستخدام» بإيدك من إعدادات الأندرويد. التطبيق بيشوف مجموع وقت الاستخدام بس، مش محتوى أي حاجة، وكل ده على موبايلك. <button class="btn sec" type="button" data-a="openu">افتح الإعداد</button></div>';
    else if (ok) h += '<p class="note">الإذن شغال. المراجعة بتحصل تقريباً كل نص ساعة، فالتنبيه ممكن يتأخر شوية.</p>';
  }
  if (ok || webNotifOk()) h += '<button class="btn sec" type="button" data-a="testn">جرّب تنبيه دلوقتي</button>';
  if (U.msg) h += '<div class="callout pop">' + esc(U.msg) + '</div>';
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
function viewSyl(subs) {
  if (subs.indexOf(U.ssub) < 0) U.ssub = subs[0];
  var sb = U.ssub, list = lessonsOf(sb), p = progress(sb), rv = reviewsDue();
  var h = '<section class="card lift"><h2>تقدّمك في المنهج</h2>' + subs.map(function (x) { var q = progress(x); return '<div class="sp"><span>' + esc(x) + '</span><b>' + (q.total ? ar(q.done) + '/' + ar(q.total) + ' · ' + ar(q.pct) + '٪' : 'لسه مفيش دروس') + '</b></div>' + bar(q.pct); }).join('') + '</section>';
  if (rv.length) {
    h += '<section class="card"><h2>مراجعات مستنياك (' + ar(rv.length) + ')</h2>' + rv.map(function (r) {
      return '<div class="row"><button class="check" type="button" data-a="rvdone" data-v="' + r.l.id + '" data-s="' + esc(r.sub) + '" aria-pressed="false" aria-label="راجعت"></button><div class="grow"><b>' + esc(r.l.t) + '</b><small>' + esc(r.sub) + ' · ' + (r.st === 0 ? 'مراجعة بعد يوم' : 'مراجعة بعد أسبوع') + '</small></div></div>';
    }).join('') + '</section>';
  }
  var wk = []; subs.forEach(function (x) { lessonsOf(x).forEach(function (l) { if (l.weak && !l.done) wk.push({ s: x, l: l }); }); });
  if (wk.length) h += '<section class="card"><h2>نقط ضعف (' + ar(wk.length) + ')</h2><p class="note">الخطة التلقائية بتدّيها وقت أكتر.</p>' + wk.map(function (x) { return '<div class="row"><div class="grow"><b>' + esc(x.l.t) + '</b><small>' + esc(x.s) + '</small></div></div>'; }).join('') + '</section>';
  h += '<section class="card"><h2>دروس المادة</h2>' + chips('ys', subjOpts(subs), sb);
  h += '<div class="label">' + (list.length ? ar(p.done) + ' من ' + ar(list.length) + ' اتخلصوا' : 'ضيف دروس المادة دي') + '</div>' + (list.length ? bar(p.pct) : '');
  list.forEach(function (l) {
    h += '<div class="row"><button class="check" type="button" data-a="ldone" data-v="' + l.id + '" aria-pressed="' + !!l.done + '" aria-label="خلصت">' + (l.done ? '✓' : '') + '</button><div class="grow' + (l.done ? ' done' : '') + '"><b>' + esc(l.t) + '</b>' + (l.done && l.at ? '<small>اتخلص ' + esc(l.at) + '</small>' : '') + '</div><button class="weakb" type="button" data-a="lweak" data-v="' + l.id + '" aria-pressed="' + !!l.weak + '">ضعيف</button><button class="del" type="button" data-a="ldel" data-v="' + l.id + '">مسح</button></div>';
  });
  h += '<div class="label">درس جديد</div><div class="custom"><input type="text" id="lesson" placeholder="اسم الدرس" value="' + esc(U.lessonText) + '"><button class="btn sec" type="button" data-a="ladd">ضيف</button></div>' +
    '<div class="label">أو ضيف كذا درس مرة واحدة (هيتسموا درس ١، درس ٢...)</div><div class="custom"><input type="number" id="bulk" inputmode="numeric" min="1" max="100" placeholder="عدد الدروس" value="' + esc(U.bulkN) + '"><button class="btn sec" type="button" data-a="lbulk">ضيف</button></div></section>';
  return h;
}
function viewStats() {
  var h = '<section class="card lift"><h2>إحصائياتك</h2>', days = [], i, tot = 0, mx = 1, now = new Date(), names = ['الأحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت'];
  for (i = 6; i >= 0; i--) { var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i), m = S.mins[dkey(d)] || 0; days.push({ n: names[d.getDay()], m: m }); tot += m; if (m > mx) mx = m; }
  h += '<div class="stat"><span>الأيام المتتالية</span><b>' + ar(streak()) + '</b></div><div class="stat"><span>النهارده</span><b>' + fmtMin(S.mins[dkey(now)] || 0) + '</b></div><div class="stat"><span>آخر ٧ أيام</span><b>' + fmtMin(tot) + '</b></div><div class="stat"><span>المتوسط في اليوم</span><b>' + fmtMin(Math.round(tot / 7)) + '</b></div>';
  h += '<div class="chart" role="img" aria-label="ساعات المذاكرة آخر ٧ أيام">' + days.map(function (x) { return '<div class="col"><em>' + (x.m ? ar(Math.round(x.m / 6) / 10) : '') + '</em><i style="height:' + Math.round(x.m * 100 / mx) + '%"></i><span>' + x.n + '</span></div>'; }).join('') + '</div><p class="note">الأرقام فوق الأعمدة بالساعات. اليوم بيتحسب لما تخلّص جلسة تركيز.</p></section>';
  var hm = '<div class="heat" role="img" aria-label="خريطة أيام المذاكرة">', wk, dy;
  var start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 83 - ((now.getDay() + 1) % 7));
  for (wk = 0; wk < 13; wk++) { hm += '<div class="hcol">'; for (dy = 0; dy < 7; dy++) { var hd = new Date(start.getFullYear(), start.getMonth(), start.getDate() + wk * 7 + dy), hmn = hd > now ? -1 : (S.mins[dkey(hd)] || 0), lv = hmn < 0 ? 'f' : hmn === 0 ? '0' : hmn < 30 ? '1' : hmn < 60 ? '2' : hmn < 120 ? '3' : '4'; hm += '<i class="hc l' + lv + '" title="' + dkey(hd) + ': ' + hmn + '"></i>'; } hm += '</div>'; }
  hm += '</div>';
  h += '<section class="card"><h2>خريطة أيام المذاكرة</h2>' + hm + '<p class="note">كل مربع يوم، وكل ما كان أغمق كل ما ذاكرت أكتر. آخر ١٣ أسبوع.</p></section>';
  var sm = {}, dk2, sb2; for (dk2 in S.smins) { if (daysUntil(dk2) > -30 && daysUntil(dk2) <= 0) for (sb2 in S.smins[dk2]) sm[sb2] = (sm[sb2] || 0) + S.smins[dk2][sb2]; }
  var sl = Object.keys(sm).sort(function (a, b) { return sm[b] - sm[a]; }), smx = sl.length ? sm[sl[0]] : 1;
  h += '<section class="card"><h2>ساعات كل مادة (آخر ٣٠ يوم)</h2>' + (sl.length ? sl.map(function (x) { return '<div class="sp"><span>' + esc(x) + '</span><b>' + fmtMin(sm[x]) + '</b></div>' + bar(Math.round(sm[x] * 100 / smx)); }).join('') : '<p class="note">اختار المادة قبل جلسة التركيز وهتظهر هنا.</p>') + '</section>';
  var mo = 0, k; for (k in S.mins) { var n = daysUntil(k); if (n <= 0 && n > -30) mo += S.mins[k]; }
  h += '<section class="card"><h2>آخر ٣٠ يوم</h2><div class="stat"><span>إجمالي المذاكرة</span><b>' + fmtMin(mo) + '</b></div></section>';
  return h;
}
function viewNotes(subs) {
  if (subs.indexOf(U.nsub) < 0) U.nsub = subs[0];
  var list = S.notes.filter(function (x) { return U.nfilter === 'all' || !x.done; });
  var open = S.notes.filter(function (x) { return !x.done; }).length;
  var h = '<section class="card lift"><h2>دفتر الأسئلة</h2><p class="note">اكتب أي حاجة مفهمتهاش، وراجعها قبل الامتحان.</p><div class="label">المادة</div>' + chips('ns', subjOpts(subs), U.nsub) +
    '<div class="label">السؤال أو اللي مش فاهمه</div><textarea id="note" rows="3" placeholder="اكتب هنا">' + esc(U.noteText) + '</textarea><button class="btn" type="button" data-a="nadd">احفظ في الدفتر</button></section>';
  h += '<section class="card"><h2>' + ar(open) + ' لسه محتاجة مراجعة</h2>' + chips('nf', [['open', 'اللي لسه'], ['all', 'الكل']], U.nfilter);
  if (!list.length) h += '<p class="note">' + (S.notes.length ? 'كل أسئلتك اتفهمت. برافو.' : 'الدفتر فاضي.') + '</p>';
  list.slice().reverse().forEach(function (x) {
    h += '<div class="row"><button class="check" type="button" data-a="ndone" data-v="' + x.id + '" aria-pressed="' + !!x.done + '" aria-label="اتفهمت">' + (x.done ? '✓' : '') + '</button><div class="grow' + (x.done ? ' done' : '') + '"><b>' + esc(x.q) + '</b><small>' + esc(x.sub) + (x.done ? ' · اتفهمت' : '') + '</small></div><button class="del" type="button" data-a="ndel" data-v="' + x.id + '">مسح</button></div>';
  });
  return h + '</section>';
}
function backupString() { return JSON.stringify({ app: 'mozakarty', v: 2, at: new Date().toISOString(), data: S }); }
function parseBackup(txt) {
  var o; try { o = JSON.parse(String(txt).trim()); } catch (e) { return null; }
  if (!o || o.app !== 'mozakarty' || !o.data || typeof o.data !== 'object') return null;
  var d = o.data; if (!d.profile || typeof d.profile !== 'object') return null;
  return d;
}
function viewBackup() {
  var h = '<section class="card lift"><h2>نسخة احتياطية</h2><p class="note">كل بياناتك (الجدول والامتحانات والدروس والدفتر والإحصائيات) على موبايلك بس. خد نسخة عشان لو غيّرت الموبايل أو مسحت التطبيق.</p>' +
    '<div class="actions"><button class="btn" type="button" data-a="bexp">' + (window.Android ? 'احفظ / ابعت النسخة' : 'نزّل ملف النسخة') + '</button><button class="btn sec" type="button" data-a="bcopy">انسخ كود النسخة</button></div>' +
    '<div class="label">استرجاع</div>' + (window.Android ? '' : '<input type="file" id="bfile" accept=".json,application/json,text/plain"><div class="label">أو الصق كود النسخة هنا</div>') + (window.Android ? '<div class="label">الصق كود النسخة هنا</div>' : '') + '<textarea id="btext" rows="3" placeholder="الصق الكود">' + esc(U.bkText) + '</textarea><button class="btn sec" type="button" data-a="bimp">استرجع من الكود</button>';
  if (U.pend) h += '<div class="callout pop"><b>النسخة سليمة.</b><br>الاسترجاع هيستبدل كل بياناتك الحالية بالنسخة دي.<div class="actions"><button class="btn" type="button" data-a="bok">أيوه، استرجع</button><button class="btn ghost" type="button" data-a="bno">إلغاء</button></div></div>';
  if (U.bmsg) h += '<div class="callout pop">' + esc(U.bmsg) + '</div>';
  return h + '</section>';
}
function feedbackBody() { return (U.fbKind === 'complaint' ? 'نوع الرسالة: شكوى' : 'نوع الرسالة: اقتراح') + '\n\n' + U.fbText.trim() + '\n\n--\nمذاكرتي ' + APP_VERSION; }
function viewFeedback() {
  var h = '<section class="card lift"><h2>اقتراحات وشكاوى</h2><p class="note">رأيك بيفرق. اكتب اللي عايزه وهيتفتح عندك تطبيق الإيميل والرسالة جاهزة تبعتها.</p>' + chips('fk', [['suggestion', 'اقتراح'], ['complaint', 'شكوى']], U.fbKind) +
    '<div class="label">رسالتك</div><textarea id="fbt" rows="5" placeholder="اكتب هنا">' + esc(U.fbText) + '</textarea><div class="actions"><button class="btn" type="button" data-a="fbsend">ابعت</button><button class="btn sec" type="button" data-a="fbcopy">انسخ الرسالة</button></div>' +
    '<p class="note">الرسالة بتتبعت من تطبيق الإيميل بتاعك. مش بنضيف عليها أي بيانات شخصية غير اللي بتكتبها.</p>';
  if (U.msg) h += '<div class="callout pop">' + esc(U.msg) + '</div>';
  return h + '</section>';
}
function viewRem(subs) {
  if (subs.indexOf(U.rsub) < 0) U.rsub = subs[0];
  var h = '<section class="card lift"><h2>تذكيرات المواد</h2><p class="note">اختار المادة والميعاد. لو فعّلت التكرار، التنبيه بيتكرر كل فترة لحد ما تبدأ جلسة تركيز في المادة دي أو تعلّم درس منها.</p><div class="label">المادة</div>' + chips('rs', subjOpts(subs), U.rsub) +
    '<div class="label">إمتى؟</div>' + chips('rk', [['study', 'يوم مذاكرتها في الجدول'], ['exam', 'يوم الامتحان وقبلها بيوم']], U.rkind) +
    '<div class="custom"><label for="rtime" class="note">الميعاد</label><input type="time" id="rtime" value="' + esc(U.rtime) + '"></div>' +
    '<div class="label">كرّر التنبيه</div>' + chips('rr', [['0', 'مرة واحدة'], ['30', 'كل ٣٠ دقيقة'], ['60', 'كل ساعة'], ['120', 'كل ساعتين'], ['180', 'كل ٣ ساعات']], U.rrep) +
    (U.rrep !== '0' ? '<div class="custom"><label for="runtil" class="note">وقف التكرار الساعة</label><input type="time" id="runtil" value="' + esc(U.runtil) + '"></div>' : '') +
    '<button class="btn" type="button" data-a="radd">ضيف التذكير</button>';
  if (U.msg) h += '<div class="callout pop">' + esc(U.msg) + '</div>';
  h += '</section><section class="card"><h2>' + (S.rem.length ? ar(S.rem.length) + ' تذكير' : 'مفيش تذكيرات لسه') + '</h2>';
  S.rem.forEach(function (r) { h += '<div class="row"><div class="grow"><b>' + esc(r.subject) + '</b><small>' + (r.kind === 'exam' ? 'الامتحان' : 'يوم المذاكرة') + ' · ' + esc(r.time) + (+r.rep ? ' · كل ' + (+r.rep >= 60 ? ar(r.rep / 60) + ' ساعة' : ar(r.rep) + ' دقيقة') + ' لحد ' + esc(r.until) : '') + '</small></div><button class="del" type="button" data-a="rdel" data-v="' + r.id + '">مسح</button></div>'; });
  var nx = remEvents(S, new Date())[0];
  h += (S.rem.length ? '<p class="note">' + (nx ? 'أقرب تنبيه: ' + esc(nx.title) + ' · ' + esc(new Date(nx.at).toLocaleString('ar-EG', { weekday: 'long', hour: 'numeric', minute: '2-digit' })) : 'مفيش تنبيه جاي في ٣ أسابيع. تأكد إن المادة في الجدول أو ضيف ميعاد الامتحان.') + '</p>' : '') + '</section>';
  return h;
}
function viewMist(subs) {
  if (subs.indexOf(U.msub) < 0) U.msub = subs[0];
  var ls = lessonsOf(U.msub), h = '<section class="card lift"><h2>سجل أخطاء الامتحانات التجريبية</h2><p class="note">بعد ما تحل امتحان تجريبي سجّل الدرس اللي غلطت فيه. الدرس بيرجع لقايمة المراجعة.</p><div class="label">المادة</div>' + chips('ms', subjOpts(subs), U.msub);
  if (ls.length) h += '<div class="label">الدرس</div>' + chips('ml', ls.map(function (l) { return [String(l.id), l.t]; }), U.mlesson);
  else h += '<div class="label">الدرس (اكتب اسمه)</div><input type="text" id="mtext" value="' + esc(U.mtext) + '" placeholder="اسم الدرس">';
  h += '<div class="label">عدد الأسئلة اللي غلطت فيها</div><div class="custom"><input type="number" id="mcount" inputmode="numeric" min="1" max="200" value="' + esc(U.mcount) + '"></div><button class="btn" type="button" data-a="madd">سجّل</button></section>';
  var by = {}; S.mist.forEach(function (m) { var k = m.sub + '|' + m.lesson; by[k] = by[k] || { sub: m.sub, lesson: m.lesson, n: 0 }; by[k].n += m.n; });
  var top = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.n - a.n; });
  h += '<section class="card"><h2>الدروس اللي بتغلط فيها</h2>' + (top.length ? top.slice(0, 8).map(function (x) { return '<div class="row"><div class="days">' + ar(x.n) + '</div><div class="grow"><b>' + esc(x.lesson) + '</b><small>' + esc(x.sub) + '</small></div></div>'; }).join('') : '<p class="note">لسه مفيش أخطاء متسجلة.</p>') + '</section>';
  h += '<section class="card"><h2>آخر التسجيلات</h2>' + (S.mist.length ? S.mist.slice().reverse().slice(0, 10).map(function (m) { return '<div class="row"><div class="grow"><b>' + esc(m.lesson) + '</b><small>' + esc(m.sub) + ' · ' + ar(m.n) + ' غلطة · ' + esc(m.at) + '</small></div><button class="del" type="button" data-a="mdel" data-v="' + m.id + '">مسح</button></div>'; }).join('') : '<p class="note">فاضي.</p>') + '</section>';
  return h;
}
var MORE = [['pp', 'papers', 'اختبارات سابقة', 'درجاتك واتجاهها لكل مادة'], ['exams2', 'stats', 'إحصائياتي', 'ساعات المذاكرة والأيام المتتالية'], ['n', 'notes', 'دفتر الأسئلة', 'اللي مفهمتوش وراجعه قبل الامتحان'], ['b', 'backup', 'نسخة احتياطية', 'تصدير واسترجاع بياناتك'], ['s', 'settings', 'الإعدادات والتنبيهات', 'الأذونات والتذكيرات'], ['r', 'rem', 'تذكيرات المواد', 'ميعاد التذكير والتكرار لحد ما تذاكر'], ['k', 'streak', 'السلسلة والهدف والتقرير', 'رتبتك والجوكر والتقرير الأسبوعي'], ['t', 'theme', 'المظهر', 'فاتح، داكن، وألوان تانية'], ['m', 'mist', 'سجل أخطاء الامتحانات', 'الدروس اللي غلطت فيها ترجع للمراجعة'], ['f', 'feedback', 'اقتراحات وشكاوى', 'قولنا رأيك']];
function viewMore(subs) {
  if (!U.sub) return '<section class="card lift"><h2>المزيد</h2>' + MORE.map(function (m) { return '<button class="menu" type="button" data-a="gosub" data-v="' + m[1] + '"><b>' + m[2] + '</b><small>' + m[3] + '</small></button>'; }).join('') + '</section>';
  var back = '<button class="pill dark" type="button" data-a="gosub" data-v="">رجوع للمزيد</button>';
  var body = U.sub === 'stats' ? viewStats() : U.sub === 'notes' ? viewNotes(subs) : U.sub === 'backup' ? viewBackup() : U.sub === 'feedback' ? viewFeedback() : U.sub === 'rem' ? viewRem(subs) : U.sub === 'mist' ? viewMist(subs) : U.sub === 'streak' ? viewStreak() : U.sub === 'papers' ? viewPapers(subs) : U.sub === 'theme' ? viewTheme() : viewSettings();
  return '<div class="backrow">' + back + '</div>' + body;
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
  else h += U.tab === 'home' ? viewHome(subs) : U.tab === 'plan' ? viewPlan(subs) : U.tab === 'timer' ? viewTimer(subs) : U.tab === 'syl' ? viewSyl(subs) : U.tab === 'more' ? viewMore(subs) : viewExams(subs);
  h += '<p class="offline">بيشتغل من غير نت وبياناتك على موبايلك بس.</p><p class="offline">تطوير: Medhat Saaed · © ٢٠٢٦ جميع الحقوق محفوظة</p></div>';
  if (!needSetup) h += '<nav class="nav" aria-label="التنقل">' + TABS.map(function (x) { return '<button type="button" class="navb" data-a="tab" data-v="' + x[0] + '" aria-current="' + (U.tab === x[0]) + '">' + icon(x[0]) + '<span>' + x[1] + '</span></button>'; }).join('') + '</nav>';
  U.anim = '';
  var y = window.scrollY; app.innerHTML = h; window.scrollTo(0, y);
}

// ===== المؤقت =====
function tick() {
  var s = Math.max(0, Math.round((T.end - Date.now()) / 1000)); T.left = s;
  if (s === 0) {
    clearInterval(T.id); T.running = false; var wasBreak = T.mode === 'break';
    if (T.mode === 'break') { T.finished = 'break'; T.mode = 'focus'; T.left = T.len * 60; }
    else {
      T.finished = true; var k = dkey(new Date()); S.mins[k] = (S.mins[k] || 0) + T.len; if (T.sub) { S.smins[k] = S.smins[k] || {}; S.smins[k][T.sub] = (S.smins[k][T.sub] || 0) + T.len; stopToday(T.sub); } S.sess = S.sess || {}; S.sess[k] = (S.sess[k] || 0) + 1; save();
    }
    if (S.settings.focus.on) notify(wasBreak ? 'الراحة خلصت' : 'برافو، خلصت الجلسة', wasBreak ? 'ارجع كمّل مذاكرة.' : 'قوم اتحرك وخد راحة قصيرة.', 'focus');
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
    render();
  } else {
    var c = document.getElementById('clock'); if (c) c.textContent = mmss(s);
    var tr = document.getElementById('tree'); if (tr && T.mode === 'focus') tr.innerHTML = treeSvg(1 - s / total());
    var r = document.getElementById('ringfg'); if (r) r.setAttribute('stroke-dashoffset', RC * (1 - s / total()));
  }
}
function restore(d) {
  var keep = S.settings;
  ['profile', 'tasks', 'exams', 'mins', 'sess', 'lessons', 'notes', 'mist', 'rem', 'smins', 'jk', 'mg', 'papers', 'auto', 'todos'].forEach(function (k) { if (d[k] !== undefined) S[k] = d[k]; });
  if (d.settings) S.settings = d.settings; else S.settings = keep;
  ['study', 'exam', 'focus', 'usage', 'dnd', 'alarm'].forEach(function (k) { if (!S.settings[k]) S.settings[k] = keep[k]; });
  S.lessons = S.lessons || {}; S.notes = S.notes || []; S.mist = S.mist || []; S.rem = S.rem || []; S.smins = S.smins || {}; S.stop = S.stop || {}; S.jk = (S.jk && typeof S.jk === 'object') ? S.jk : {}; S.mg = (S.mg && typeof S.mg === 'object') ? S.mg : {}; S.mins = S.mins || {}; S.exams = S.exams || []; S.tasks = S.tasks || [];
  S.papers = Array.isArray(S.papers) ? S.papers : []; S.todos = Array.isArray(S.todos) ? S.todos : []; S.auto = (S.auto && typeof S.auto === 'object') ? S.auto : { b: 90 };
  applyTheme();
  save();
}
document.addEventListener('change', function (e) {
  if (e.target.id !== 'bfile' || !e.target.files || !e.target.files[0]) return;
  var r = new FileReader();
  r.onload = function () { var pd = parseBackup(r.result); U.pend = pd; U.bmsg = pd ? '' : 'الملف مش نسخة سليمة من مذاكرتي.'; render(); };
  r.onerror = function () { U.bmsg = 'مقدرتش أقرا الملف.'; render(); };
  r.readAsText(e.target.files[0]);
});
function andr(f) { try { if (window.Android && Android[f]) return Android[f].apply(Android, Array.prototype.slice.call(arguments, 1)); } catch (e) {} }
document.addEventListener('visibilitychange', function () { if (!document.hidden) { if (T.running) tick(); swPost({ type: 'check' }); render(); } });
setInterval(function () { if (!window.Android) swPost({ type: 'check' }); }, 30000);
setTimeout(function () { syncAndroid(); if (webNotifOk()) regPeriodic(); }, 1500);
window.addEventListener('focus', function () { if (U.tab === 'more' && U.sub === 'settings') render(); });

// ===== الضغطات =====
document.addEventListener('input', function (e) {
  var ids = { rtime: 'rtime', runtil: 'runtil', mtext: 'mtext', mcount: 'mcount', lesson: 'lessonText', bulk: 'bulkN', note: 'noteText', fbt: 'fbText', btext: 'bkText', pscore: 'pscore', pmax: 'pmax', pdate: 'pdate', todot: 'todoText' };
  if (ids[e.target.id]) U[ids[e.target.id]] = e.target.value;
  if (e.target.id === 'extra') U.extra = e.target.value;
  if (e.target.id === 'exdate') U.exDate = e.target.value;
  if (e.target.id === 'jrt' && e.target.value) { jkc().rtime = e.target.value; save(); }
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
  else if (a === 'theme') { S.settings.theme = v; save(); applyTheme(); }
  else if (a === 'tog') { U.open = U.open || {}; U.open[v] = !U.open[v]; }
  else if (a === 'startsub') { U.fsub = v; U.anim = 'in-next'; U.tab = 'timer'; U.sub = ''; window.scrollTo(0, 0); }
  else if (a === 'tab') { if (v !== U.tab) { U.anim = ti(v) > ti(U.tab) ? 'in-next' : 'in-prev'; U.tab = v; U.sub = ''; U.pend = null; U.bmsg = ''; U.msg = ''; window.scrollTo(0, 0); } }
  else if (a === 'pd') U.day = v;
  else if (a === 'ps') U.subj = v;
  else if (a === 'pm') U.dur = v;
  else if (a === 'tadd') { S.tasks.push({ id: Date.now(), day: +U.day, subject: U.subj, minutes: +U.dur, done: false }); save(); }
  else if (a === 'tdone') { S.tasks.forEach(function (t) { if (String(t.id) === v) { t.done = !t.done; if (t.done) stopToday(t.subject); } }); save(); }
  else if (a === 'tdel') { S.tasks = S.tasks.filter(function (t) { return String(t.id) !== v; }); save(); }
  else if (a === 'es') U.exSubj = v;
  else if (a === 'eadd') { var d = document.getElementById('exdate').value; if (d) { S.exams.push({ id: Date.now(), subject: U.exSubj, date: d }); U.exDate = ''; save(); } }
  else if (a === 'edel') { S.exams = S.exams.filter(function (x) { return String(x.id) !== v; }); save(); }
  else if (a === 'sadd') { var x = U.extra.trim(); if (x && subjectsFor(S.profile).indexOf(x) < 0) { S.profile.custom.push(x); U.extra = ''; save(); } }
  else if (a === 'fl') { if (!T.running) { T.len = +v; T.left = T.len * 60; T.finished = false; } }
  else if (a === 'cset') { var m = Math.round(+document.getElementById('cmin').value); if (m >= 1 && m <= 300 && !T.running) { T.len = m; T.left = m * 60; T.finished = false; } }
  else if (a === 'start-t') {
    if (S.settings.focus.on) askPerm();
    if (T.mode === 'focus') { T.sub = U.fsub; stopToday(T.sub); save(); }
    T.end = Date.now() + T.left * 1000; T.finished = false; T.running = true; clearInterval(T.id); T.id = setInterval(tick, 500);
    if (S.settings.focus.on || S.settings.dnd.on) andr('focusEnd', T.end, (T.mode === 'break' ? 'break' : 'focus') + (S.settings.focus.on ? '' : 'q'));
  }
  else if (a === 'pause') { T.running = false; clearInterval(T.id); andr('cancelFocus'); }
  else if (a === 'reset') { T.running = false; clearInterval(T.id); T.finished = false; T.mode = 'focus'; T.left = T.len * 60; andr('cancelFocus'); }
  else if (a === 'brk') { if (S.settings.focus.on) askPerm(); clearInterval(T.id); T.mode = 'break'; T.blen = +v; T.left = T.blen * 60; T.finished = false; T.end = Date.now() + T.left * 1000; T.running = true; T.id = setInterval(tick, 500); if (S.settings.focus.on || S.settings.dnd.on) andr('focusEnd', T.end, 'break' + (S.settings.focus.on ? '' : 'q')); }
  else if (a === 'sw-study') { S.settings.study.on = !S.settings.study.on; save(); if (S.settings.study.on) askPerm(); }
  else if (a === 'sw-exam') { S.settings.exam.on = !S.settings.exam.on; save(); if (S.settings.exam.on) askPerm(); }
  else if (a === 'sw-focus') { S.settings.focus.on = !S.settings.focus.on; save(); if (S.settings.focus.on) askPerm(); }
  else if (a === 'sw-usage') { S.settings.usage.on = !S.settings.usage.on; save(); if (S.settings.usage.on && window.Android && Android.usageOk && !Android.usageOk()) andr('openUsage'); }
  else if (a === 'uh') { S.settings.usage.h = +v; save(); }
  else if (a === 'openn') andr('openNotif');
  else if (a === 'openx') andr('openExact');
  else if (a === 'openb') andr('openBatt');
  else if (a === 'openu') andr('openUsage');
  else if (a === 'opend') andr('openDnd');
  else if (a === 'sw-alarm') { S.settings.alarm.on = !S.settings.alarm.on; save(); }
  else if (a === 'sw-dnd') { S.settings.dnd.on = !S.settings.dnd.on; save(); if (S.settings.dnd.on && window.Android && Android.dndOk && !Android.dndOk()) andr('openDnd'); }
  else if (a === 'testn') {
    if (window.Android) { var rs = andr('test'); U.msg = rs === 'ok' ? 'اتبعت تنبيه. شوفه في شريط الإشعارات.' : rs === 'off' ? 'التنبيهات مقفولة للتطبيق. دوس «اسمح» فوق.' : 'حصلت مشكلة: ' + rs; if (rs === 'off') andr('askNotif'); }
    else { notify('مذاكرتي', 'التنبيهات شغالة تمام ✓', 'test'); U.msg = 'اتبعت تنبيه. شوفه في شريط الإشعارات.'; }
    setTimeout(function () { U.msg = ''; render(); }, 6000);
  }
  else if (a === 'gosub') { U.anim = 'in-up'; U.sub = v; U.pend = null; U.bmsg = ''; U.msg = ''; window.scrollTo(0, 0); if (v === 'stats' || v) U.tab = 'more'; }
  else if (a === 'jg') { jkc().goal = +v; save(); }
  else if (a === 'jd') { jkc().day = +v; save(); }
  else if (a === 'jr') { jkc().rday = +v; save(); }
  else if (a === 'sw-wk') { jkc().wk = !jkc().wk; save(); if (jkc().wk) askPerm(); }
  else if (a === 'jspend') { if (credits() > 0) { jkc().used[v] = 1; save(); } }
  else if (a === 'rs') U.rsub = v;
  else if (a === 'rk') U.rkind = v;
  else if (a === 'rr') U.rrep = v;
  else if (a === 'radd') { if (/^\d\d:\d\d$/.test(U.rtime)) { S.rem.push({ id: Date.now(), subject: U.rsub, kind: U.rkind, time: U.rtime, rep: +U.rrep, until: U.runtil }); U.msg = 'اتضاف التذكير.'; save(); if (window.Android) andr('askNotif'); else askPerm(); } else U.msg = 'اختار ميعاد صح.'; }
  else if (a === 'rdel') { S.rem = S.rem.filter(function (r) { return String(r.id) !== v; }); save(); }
  else if (a === 'ms') { U.msub = v; U.mlesson = ''; }
  else if (a === 'ml') U.mlesson = v;
  else if (a === 'madd') {
    var mn = Math.round(+U.mcount), ml = lessonsOf(U.msub).filter(function (l) { return String(l.id) === U.mlesson; })[0], mt = ml ? ml.t : U.mtext.trim();
    if (mn >= 1 && mt) {
      S.mist.push({ id: Date.now(), sub: U.msub, lesson: mt, n: mn, at: dkey(new Date()) });
      if (ml) { ml.done = true; ml.at = dkey(new Date()); ml.rs = 0; }
      U.mtext = ''; U.mlesson = ''; U.msg = ''; save();
    }
  }
  else if (a === 'mdel') { S.mist = S.mist.filter(function (m) { return String(m.id) !== v; }); save(); }
  else if (a === 'ys') U.ssub = v;
  else if (a === 'fs') { if (!T.running) U.fsub = v; }
  else if (a === 'ladd') { var lt = U.lessonText.trim(); if (lt) { (S.lessons[U.ssub] = S.lessons[U.ssub] || []).push({ id: Date.now(), t: lt, done: false }); U.lessonText = ''; save(); } }
  else if (a === 'lbulk') { var bn = Math.round(+U.bulkN); if (bn >= 1 && bn <= 100) { var bl = (S.lessons[U.ssub] = S.lessons[U.ssub] || []), st0 = bl.length; for (var q = 1; q <= bn; q++) bl.push({ id: Date.now() + q, t: 'درس ' + ar(st0 + q), done: false }); U.bulkN = ''; save(); } }
  else if (a === 'ldone') { lessonsOf(U.ssub).forEach(function (l) { if (String(l.id) === v) { l.done = !l.done; if (l.done) { l.at = dkey(new Date()); l.rs = 0; stopToday(U.ssub); } else { delete l.at; delete l.rs; } } }); save(); }
  else if (a === 'ldel') { S.lessons[U.ssub] = lessonsOf(U.ssub).filter(function (l) { return String(l.id) !== v; }); save(); }
  else if (a === 'lweak') { lessonsOf(U.ssub).forEach(function (l) { if (String(l.id) === v) l.weak = !l.weak; }); save(); }
  else if (a === 'ab') { S.auto.b = +v; save(); }
  else if (a === 'aapply') { var ap = autoPlan(S.auto.b || 90); S.tasks = S.tasks.filter(function (t) { return !t.auto; }); ap.forEach(function (x, ix) { S.tasks.push({ id: Date.now() + ix, day: x.day, subject: x.subject, minutes: x.minutes, done: false, auto: true }); }); U.msg = 'اتحطت الخطة في جدولك.'; save(); setTimeout(function () { U.msg = ''; render(); }, 5000); }
  else if (a === 'aclear') { S.tasks = S.tasks.filter(function (t) { return !t.auto; }); save(); }
  else if (a === 'pps') U.psub = v;
  else if (a === 'padd') { var psc = +U.pscore, pmx = +(U.pmax || 100), pdt = U.pdate || dkey(new Date()); if (U.pscore !== '' && psc >= 0 && pmx > 0 && psc <= pmx) { S.papers.push({ id: Date.now(), sub: U.psub, score: psc, max: pmx, date: pdt }); U.pscore = ''; U.msg = ''; save(); } else U.msg = 'اكتب درجة صحيحة (من صفر لحد الدرجة الكاملة).'; }
  else if (a === 'pdel') { S.papers = S.papers.filter(function (p) { return String(p.id) !== v; }); save(); }
  else if (a === 'zadd') { var zt = U.todoText.trim(); if (zt) { S.todos.push({ id: Date.now(), t: zt, done: false }); U.todoText = ''; save(); } }
  else if (a === 'zdone') { S.todos.forEach(function (x) { if (String(x.id) === v) x.done = !x.done; }); save(); }
  else if (a === 'zdel') { S.todos = S.todos.filter(function (x) { return String(x.id) !== v; }); save(); }
  else if (a === 'zclear') { S.todos = S.todos.filter(function (x) { return !x.done; }); save(); }
  else if (a === 'rvdone') { lessonsOf(b.dataset.s).forEach(function (l) { if (String(l.id) === v) l.rs = (l.rs || 0) + 1; }); save(); }
  else if (a === 'ns') U.nsub = v;
  else if (a === 'nf') U.nfilter = v;
  else if (a === 'nadd') { var nt = U.noteText.trim(); if (nt) { S.notes.push({ id: Date.now(), sub: U.nsub, q: nt, done: false }); U.noteText = ''; save(); } }
  else if (a === 'ndone') { S.notes.forEach(function (x) { if (String(x.id) === v) x.done = !x.done; }); save(); }
  else if (a === 'ndel') { S.notes = S.notes.filter(function (x) { return String(x.id) !== v; }); save(); }
  else if (a === 'bexp') {
    if (window.Android && Android.share) { Android.share('نسخة مذاكرتي ' + dkey(new Date()), backupString()); U.bmsg = 'اختار مكان تحفظ فيه الكود (واتساب، ملاحظات، درايف...). وقت الاسترجاع الصقه هنا.'; }
    else try { var bl2 = new Blob([backupString()], { type: 'application/json' }), ln = document.createElement('a'); ln.href = URL.createObjectURL(bl2); ln.download = 'mozakarty-backup-' + dkey(new Date()) + '.json'; document.body.appendChild(ln); ln.click(); setTimeout(function () { ln.remove(); }, 1000); U.bmsg = 'اتنزّل الملف. لو مفيش ملف ظهر، استخدم «انسخ كود النسخة» واحفظه في أي مكان.'; }
    catch (er) { U.bmsg = 'مقدرتش أنزّل الملف. استخدم «انسخ كود النسخة».'; }
  }
  else if (a === 'bcopy') {
    var code = backupString(), okc = false;
    if (window.Android && Android.copy) { Android.copy(code); okc = true; } else
    try { var ta = document.createElement('textarea'); ta.value = code; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.focus(); ta.select(); okc = document.execCommand('copy'); ta.remove(); } catch (er) {}
    if (!okc && navigator.clipboard) { try { navigator.clipboard.writeText(code); okc = true; } catch (er) {} }
    U.bmsg = okc ? 'اتنسخ الكود. الصقه في رسالة لنفسك أو ملاحظات واحتفظ بيه.' : 'النسخ مش شغال هنا. جرّب «نزّل ملف النسخة».';
  }
  else if (a === 'bimp') { var pd = parseBackup(U.bkText); if (pd) { U.pend = pd; U.bmsg = ''; } else { U.pend = null; U.bmsg = 'الكود مش سليم. تأكد إنك لصقته كامل.'; } }
  else if (a === 'bok') { if (U.pend) { restore(U.pend); U.pend = null; U.bkText = ''; U.bmsg = 'اتسترجعت بياناتك.'; } }
  else if (a === 'bno') { U.pend = null; }
  else if (a === 'fk') U.fbKind = v;
  else if (a === 'fbsend') {
    if (!U.fbText.trim()) U.msg = 'اكتب رسالتك الأول.';
    else if (window.Android && Android.mail) { U.msg = 'بنفتحلك تطبيق الإيميل. لو ماظهرش دوس «انسخ الرسالة».'; Android.mail(FEEDBACK_TO, 'مذاكرتي: ' + (U.fbKind === 'complaint' ? 'شكوى' : 'اقتراح'), feedbackBody()); }
    else { U.msg = 'بنفتحلك تطبيق الإيميل. لو ماظهرش دوس «انسخ الرسالة».'; window.location.href = 'mailto:' + FEEDBACK_TO + '?subject=' + encodeURIComponent('مذاكرتي: ' + (U.fbKind === 'complaint' ? 'شكوى' : 'اقتراح')) + '&body=' + encodeURIComponent(feedbackBody()); }
  }
  else if (a === 'fbcopy') {
    var okf = false;
    if (window.Android && Android.copy) { Android.copy(feedbackBody()); okf = true; } else
    try { var tb = document.createElement('textarea'); tb.value = feedbackBody(); tb.style.position = 'fixed'; tb.style.opacity = '0'; document.body.appendChild(tb); tb.focus(); tb.select(); okf = document.execCommand('copy'); tb.remove(); } catch (er) {}
    U.msg = okf ? 'اتنسخت الرسالة.' : 'النسخ مش شغال هنا.';
  }
  else if (a === 'askn') { if (window.Android) andr('askNotif'); else askPerm(); }
  render();
});

render();
if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
