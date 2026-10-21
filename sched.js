/* График сотрудников · октябрь 2026. Коды дня:
   . выходной  8 смена  M мероприятие  D дежурство
   T обучение  S собрание  V отпуск
   1 смена «1»  e мероприятие «1»  4/2 число в салоне */
var SCHED_STATE = { day: 0, person: "", group: "all" };

var SCHED = {
  year: 2026,
  month: 10,
  title: "Октябрь",
  groups: [
    {
      id: "sales",
      title: "Продажи",
      note: "В салоне по графику — 4",
      floor: "4444444444444444444444444444444",
      people: [
        { id: "spitsyn", last: "Спицын", first: "Александр", days: ".8M.S88.8M.888.8M.888.8M.888.8M" },
        { id: "ahmad", last: "Ахмадуллин", first: "Тимур", days: "D..MS...DMM...D8M..D88..D8..88D" },
        { id: "velid", last: "Велиджанов", first: "Артем", days: ".DMMSTD88..D88..MM..D88...8D8.." },
        { id: "dem", last: "Демьянов", first: "Глеб", days: "8..MD..88D..8D8..MD..88M..D88.." },
        { id: "lav", last: "Лавров", first: "Михаил", days: "8..DS8...MM.D88..D88...DM8...DM" },
        { id: "sid", last: "Сидоров", first: "Вадим", days: ".8D.S88D..M8..8D..88..DMM..8D8." },
        { id: "tal", last: "Тальков", first: "Сергей", days: "88M.SD88..D8...8DM..8D..MD8...M" }
      ]
    },
    {
      id: "spec",
      title: "Специалисты",
      note: "Отдельная лента графика",
      people: [
        { id: "shab", last: "Шабакаева", first: "Алиса", days: ".8M..88..MM..888MM..888MM..888M" },
        { id: "man", last: "Манукян", first: "Анна", days: "8..M8..88..8..................." }
      ]
    },
    {
      id: "office",
      title: "Офис",
      note: "В салоне по графику — 2",
      floor: "2222222222222222222222222222222",
      people: [
        { id: "myas", last: "Мясоедова", first: "", days: "8...888...M88...MM8...8MMVVVVVV" },
        { id: "vor", last: "Воронина", first: "", days: "..MM8..88M..888...888..MM8.8..M" },
        { id: "nes", last: "Неськина", first: "", days: "88...8...MM8...8MM...88...8888M" },
        { id: "akh", last: "Ахметов", first: "", days: ".8MM..888....888...888...88.88." }
      ]
    },
    {
      id: "one",
      title: "Смена «1»",
      note: "В клетке графика стоит 1, не 8",
      people: [
        { id: "ish", last: "Ишмедов", first: "", days: "..ee1..11...11..ee1..11...e1..e" },
        { id: "nag", last: "Нагриманов", first: "", days: "11..11...ee...11e....111.e..11e" },
        { id: "kri", last: "Кривцов", first: "", days: "11...11..ee1..11...11..11e..11." }
      ]
    },
    {
      id: "extra",
      title: "Дополнительно",
      note: "",
      people: [
        { id: "oso", last: "Осокин", first: "Сергей", days: ".8MM...88M...888...888...MM8..." },
        { id: "mol", last: "Молчанов", first: "Владимир", days: "8...888...M88...MM8...888...88M" }
      ]
    }
  ]
};

var SCHED_KIND = {
  ".": { label: "Выходной", short: "", cls: "off" },
  "8": { label: "Смена", short: "8", cls: "s8" },
  "M": { label: "Мероприятие", short: "8", cls: "ev" },
  "D": { label: "Дежурство", short: "8", cls: "du" },
  "T": { label: "Обучение", short: "тр", cls: "tr" },
  "S": { label: "Собрание", short: "С", cls: "mt" },
  "V": { label: "Отпуск", short: "", cls: "va" },
  "1": { label: "Смена", short: "1", cls: "s1" },
  "e": { label: "Мероприятие", short: "1", cls: "ev" },
  "4": { label: "В салоне", short: "4", cls: "fl" },
  "2": { label: "В салоне", short: "2", cls: "fl" }
};

function schedWd(i){
  return ["чт","пт","сб","вс","пн","вт","ср"][i % 7];
}
function schedWeekend(day){
  var w = (day - 1) % 7;
  return w === 2 || w === 3;
}
function schedPeople(){
  var out = [];
  SCHED.groups.forEach(function(g){
    g.people.forEach(function(p){ out.push(Object.assign({ group: g.id, groupTitle: g.title }, p)); });
  });
  return out;
}
function schedPerson(id){
  return schedPeople().filter(function(p){ return p.id === id; })[0] || null;
}
function schedCode(person, day){
  return (person.days || "")[day - 1] || ".";
}
function schedFull(p){
  return (p.last + " " + (p.first || "")).trim();
}
function schedTodayDay(){
  var n = new Date();
  if(n.getFullYear() === SCHED.year && n.getMonth() + 1 === SCHED.month) return n.getDate();
  return 0;
}
function schedDayWord(day){
  return ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"][new Date(SCHED.year, SCHED.month - 1, day).getDay()];
}
function schedStats(p){
  var s = { work: 0, duty: 0, event: 0, train: 0, meet: 0, off: 0, vac: 0 };
  for(var i = 0; i < 31; i++){
    var c = p.days[i] || ".";
    if(c === ".") s.off++;
    else if(c === "D"){ s.work++; s.duty++; }
    else if(c === "M" || c === "e"){ s.work++; s.event++; }
    else if(c === "T") s.train++;
    else if(c === "S") s.meet++;
    else if(c === "V") s.vac++;
    else s.work++;
  }
  return s;
}
function schedOnFloor(code){
  return code === "8" || code === "M" || code === "D" || code === "1" || code === "e" || code === "T" || code === "S";
}

function schedRoster(day){
  var buckets = { duty: [], work: [], event: [], train: [], meet: [], vac: [], off: [] };
  schedPeople().forEach(function(p){
    var c = schedCode(p, day);
    var row = { p: p, c: c, k: SCHED_KIND[c] || SCHED_KIND["."] };
    if(c === "D") buckets.duty.push(row);
    else if(c === "M" || c === "e") buckets.event.push(row);
    else if(c === "T") buckets.train.push(row);
    else if(c === "S") buckets.meet.push(row);
    else if(c === "V") buckets.vac.push(row);
    else if(c === "." ) buckets.off.push(row);
    else buckets.work.push(row);
  });
  return buckets;
}

function schedNames(rows){
  if(!rows.length) return "—";
  return rows.map(function(r){ return schedFull(r.p); }).join(", ");
}

function schedCopy(day){
  var b = schedRoster(day);
  var lines = [
    day + " октября, " + schedDayWord(day),
    "Дежурство: " + schedNames(b.duty),
    "Смена: " + schedNames(b.work),
    "Мероприятие: " + schedNames(b.event),
    "Обучение: " + schedNames(b.train),
    "Собрание: " + schedNames(b.meet),
    "Отпуск: " + schedNames(b.vac),
    "Выходной: " + schedNames(b.off),
    "В салоне, продажи: 4 · офис: 2"
  ];
  return lines.join("\n");
}

function schedCell(code, day, opts){
  opts = opts || {};
  var k = SCHED_KIND[code] || SCHED_KIND["."];
  var cls = "sc-c k-" + k.cls;
  if(schedWeekend(day)) cls += " we";
  if(day === SCHED_STATE.day) cls += " pick";
  if(opts.today) cls += " tod";
  var label = k.short;
  if(code === "V"){
    label = "";
  }
  var title = (opts.name ? opts.name + " · " : "") + day + " октября · " + k.label;
  var attrs = " data-sched-day=\"" + day + "\"" + (opts.person ? " data-sched-person=\"" + opts.person + "\"" : "");
  return "<button type=\"button\" class=\"" + cls + "\" title=\"" + title + "\"" + attrs + "><span>" + label + "</span></button>";
}

function schedRow(p, today){
  var cells = "";
  var vacOpen = false;
  for(var d = 1; d <= 31; d++){
    var c = schedCode(p, d);
    var start = c === "V" && !vacOpen;
    if(c === "V") vacOpen = true; else vacOpen = false;
    cells += schedCell(c, d, { person: p.id, name: schedFull(p), today: d === today, vacStart: start });
  }
  var st = schedStats(p);
  var on = SCHED_STATE.person === p.id ? " on" : "";
  var code = schedCode(p, SCHED_STATE.day || today || 1);
  var now = SCHED_KIND[code] || SCHED_KIND["."];
  return "<div class=\"sc-row" + on + "\">" +
    "<button type=\"button\" class=\"sc-name\" data-sched-person=\"" + p.id + "\">" +
      "<b>" + p.last + "</b>" +
      (p.first ? "<small>" + p.first + "</small>" : "") +
      "<em class=\"k-" + now.cls + "\">" + (SCHED_STATE.day ? now.label : "") + "</em>" +
    "</button>" +
    "<div class=\"sc-days\">" + cells + "</div>" +
    "<div class=\"sc-sum\"><b>" + st.work + "</b>" + (st.duty ? "<i>" + st.duty + "</i>" : "<i class=\"ghost\">·</i>") + "</div>" +
  "</div>";
}

function schedFloorRow(title, pattern, today){
  var cells = "";
  for(var d = 1; d <= 31; d++){
    var c = pattern[d - 1];
    cells += schedCell(c, d, { today: d === today, name: title });
  }
  return "<div class=\"sc-row floor\">" +
    "<div class=\"sc-name\"><b>" + title + "</b><small>по графику</small></div>" +
    "<div class=\"sc-days\">" + cells + "</div>" +
    "<div class=\"sc-sum\"><b></b><i class=\"ghost\"></i></div>" +
  "</div>";
}

function schedHead(today){
  var days = "";
  for(var d = 1; d <= 31; d++){
    var cls = "sc-h";
    if(schedWeekend(d)) cls += " we";
    if(d === SCHED_STATE.day) cls += " pick";
    if(d === today) cls += " tod";
    days += "<button type=\"button\" class=\"" + cls + "\" data-sched-day=\"" + d + "\"><small>" + schedWd(d - 1) + "</small><b>" + d + "</b></button>";
  }
  return "<div class=\"sc-row head\">" +
    "<div class=\"sc-name\"><b>Сотрудник</b><small>" + SCHED.title + " " + SCHED.year + "</small></div>" +
    "<div class=\"sc-days\">" + days + "</div>" +
    "<div class=\"sc-sum\"><b>см</b><i>дж</i></div>" +
  "</div>";
}

function schedList(rows, empty){
  if(!rows.length) return "<p class=\"sc-empty\">" + empty + "</p>";
  return "<ul>" + rows.map(function(r){
    var kind = r.k && r.k.label && r.k.label !== "Смена" ? r.k.label : r.p.groupTitle;
    return "<li><button type=\"button\" data-sched-person=\"" + r.p.id + "\"><b>" + schedFull(r.p) + "</b><span>" + kind + "</span></button></li>";
  }).join("") + "</ul>";
}

function schedPersonCard(p, day){
  if(!p) return "";
  var st = schedStats(p);
  var c = schedCode(p, day);
  var k = SCHED_KIND[c] || SCHED_KIND["."];
  var bits = [];
  for(var d = 1; d <= 31; d++){
    var cd = schedCode(p, d);
    var kk = SCHED_KIND[cd] || SCHED_KIND["."];
    var cls = "pip k-" + kk.cls + (d === day ? " pick" : "");
    bits += "<button type=\"button\" class=\"" + cls + "\" data-sched-person=\"" + p.id + "\" data-sched-day=\"" + d + "\" title=\"" + d + " · " + kk.label + "\">" + d + "</button>";
  }
  return "<aside class=\"sc-card\">" +
    "<div class=\"sc-card-top\">" +
      "<div><p class=\"eyebrow\">Карточка</p><h3>" + schedFull(p) + "</h3><p>" + p.groupTitle + "</p></div>" +
      "<button type=\"button\" class=\"btn ghost\" data-sched-clear>Закрыть</button>" +
    "</div>" +
    "<div class=\"sc-card-now k-" + k.cls + "\"><b>" + day + " октября</b><span>" + k.label + (k.short ? " · " + k.short : "") + "</span></div>" +
    "<div class=\"sc-metrics\">" +
      "<div><b>" + st.work + "</b><span>смен</span></div>" +
      "<div><b>" + st.duty + "</b><span>дежурств</span></div>" +
      "<div><b>" + st.event + "</b><span>мероприятий</span></div>" +
      "<div><b>" + st.off + "</b><span>выходных</span></div>" +
    "</div>" +
    "<div class=\"sc-pips\">" + bits + "</div>" +
  "</aside>";
}

function sched(){
  var today = schedTodayDay();
  if(!SCHED_STATE.day) SCHED_STATE.day = today || 21;
  var day = SCHED_STATE.day;
  var b = schedRoster(day);
  var focus = schedPerson(SCHED_STATE.person);
  var dow = schedDayWord(day);
  var groups = SCHED.groups.filter(function(g){ return SCHED_STATE.group === "all" || g.id === SCHED_STATE.group; });
  var chips = "<button type=\"button\" class=\"chip" + (SCHED_STATE.group === "all" ? " on" : "") + "\" data-sched-group=\"all\">Все</button>" +
    SCHED.groups.map(function(g){
      return "<button type=\"button\" class=\"chip" + (SCHED_STATE.group === g.id ? " on" : "") + "\" data-sched-group=\"" + g.id + "\">" + g.title + "</button>";
    }).join("");

  var boards = groups.map(function(g){
    return "<section class=\"sc-block\" id=\"sched-" + g.id + "\">" +
      "<header class=\"sc-block-h\"><h2>" + g.title + "</h2>" + (g.note ? "<p>" + g.note + "</p>" : "") + "</header>" +
      "<div class=\"sc-scroll\">" +
        "<div class=\"sc-grid\">" +
          schedHead(today) +
          g.people.map(function(p){ return schedRow(p, today); }).join("") +
          (g.floor ? schedFloorRow("В салоне", g.floor, today) : "") +
        "</div>" +
      "</div>" +
    "</section>";
  }).join("");

  return "<div class=\"sched-page\">" +
    "<div class=\"banner\"><div><p class=\"eyebrow\">TENET · отдел продаж</p><b>График сотрудников</b></div><div class=\"banner-name\">ОКТ</div></div>" +
    "<p class=\"lead\">Октябрь 2026. Нажмите день — увидите, кто в смене, на дежурстве и на собрании. Нажмите фамилию — карточка месяца.</p>" +
    "<div class=\"sc-hero\">" +
      "<button type=\"button\" class=\"sc-date\" data-sched-day=\"" + (today || day) + "\">" +
        "<small>" + (today === day ? "сегодня" : "выбран день") + "</small>" +
        "<strong>" + day + "</strong>" +
        "<em>" + dow + "</em>" +
      "</button>" +
      "<div class=\"sc-hero-grid\">" +
        "<article class=\"sc-hero-col du\"><p class=\"eyebrow\">Дежурство</p>" + schedList(b.duty, "Дежурных нет") + "</article>" +
        "<article class=\"sc-hero-col work\"><p class=\"eyebrow\">В смене</p>" + schedList(b.event.concat(b.work), "Никого в смене") + "</article>" +
        "<article class=\"sc-hero-col meet\"><p class=\"eyebrow\">Особое</p>" +
          (b.meet.length || b.train.length || b.vac.length
            ? "<ul>" +
              b.meet.map(function(r){ return "<li><button type=\"button\" data-sched-person=\"" + r.p.id + "\"><b>" + schedFull(r.p) + "</b><span>Собрание</span></button></li>"; }).join("") +
              b.train.map(function(r){ return "<li><button type=\"button\" data-sched-person=\"" + r.p.id + "\"><b>" + schedFull(r.p) + "</b><span>Обучение</span></button></li>"; }).join("") +
              b.vac.map(function(r){ return "<li><button type=\"button\" data-sched-person=\"" + r.p.id + "\"><b>" + schedFull(r.p) + "</b><span>Отпуск</span></button></li>"; }).join("") +
              "</ul>"
            : "<p class=\"sc-empty\">Собраний, обучения и отпусков нет</p>") +
        "</article>" +
      "</div>" +
    "</div>" +
    "<div class=\"sc-legend\">" +
      "<span class=\"lg k-s8\"><i>8</i> Смена</span>" +
      "<span class=\"lg k-du\"><i>8</i> Дежурство</span>" +
      "<span class=\"lg k-ev\"><i>8</i> Мероприятие</span>" +
      "<span class=\"lg k-tr\"><i>тр</i> Обучение</span>" +
      "<span class=\"lg k-mt\"><i>С</i> Собрание</span>" +
      "<span class=\"lg k-va\"><i></i> Отпуск</span>" +
      "<span class=\"lg k-off\"><i></i> Выходной</span>" +
      "<span class=\"lg k-s1\"><i>1</i> Смена «1»</span>" +
    "</div>" +
    "<div class=\"sc-tools\">" +
      "<div class=\"study-pick\">" + chips + "</div>" +
      "<button type=\"button\" class=\"btn ghost\" id=\"schedCopy\">Скопировать день</button>" +
    "</div>" +
    schedPersonCard(focus, day) +
    boards +
    "<p class=\"sc-foot\">5 октября — собрание. Жёлтая колонка справа у строки: смен и дежурств. Цифра «в салоне» — как в исходном графике, каждый день.</p>" +
  "</div>";
}

if(!window.__schedListen){
  window.__schedListen = true;
  document.addEventListener("click", function(ev){
    var t = ev.target.closest("[data-sched-person],[data-sched-day],[data-sched-group],[data-sched-clear],#schedCopy");
    if(!t) return;
    if(t.id === "schedCopy"){
      var text = schedCopy(SCHED_STATE.day || 21);
      var done = function(){ t.textContent = "Скопировано"; setTimeout(function(){ t.textContent = "Скопировать день"; }, 1400); };
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
      else done();
      return;
    }
    if(t.hasAttribute("data-sched-clear")){ SCHED_STATE.person = ""; }
    if(t.hasAttribute("data-sched-group")) SCHED_STATE.group = t.getAttribute("data-sched-group");
    if(t.hasAttribute("data-sched-day")) SCHED_STATE.day = Number(t.getAttribute("data-sched-day")) || SCHED_STATE.day;
    if(t.hasAttribute("data-sched-person")) SCHED_STATE.person = t.getAttribute("data-sched-person");
    if(typeof render === "function"){
      var scrolls = [];
      document.querySelectorAll(".sc-scroll").forEach(function(el){ scrolls.push(el.scrollLeft); });
      render();
      var nodes = document.querySelectorAll(".sc-scroll");
      for(var i = 0; i < nodes.length; i++) nodes[i].scrollLeft = scrolls[i] || 0;
    }
  });
}
