from pathlib import Path
import json, re, urllib.parse, urllib.request

parts = sorted(Path("parts").glob("p*.txt"))
if parts:
    html = "".join(p.read_text() for p in parts)
else:
    html = Path("TENET_T4L_netlify/index.html").read_text()

html = html.replace(
    'let view = state.surname ? "home" : "login";',
    'let view = (state.surname && state.authed) ? (state.section || "hub") : "login";'
)
html = html.replace(
    'if(state.surname && userRun() && !done)',
    'if(state.authed && state.surname && userRun() && !done)'
)
html = html.replace(
    'stopTick(); state.surname=""; state.display=""; save();',
    'stopTick(); state.surname=""; state.display=""; state.authed=false; save();'
)

login = Path("login-fn.js")
if login.exists():
    extra = login.read_text()
    a = html.find("    function login(){")
    b = html.find("    function homeLeadText(){")
    if a >= 0 and b > a:
        html = html[:a] + extra + html[b:]

ask = Path("ask-pin-fn.js")
if ask.exists():
    extra = ask.read_text()
    if not extra.endswith("\n"):
        extra += "\n"
    needle = '      const logout=document.getElementById("logout");'
    if needle in html:
        html = html.replace(needle, extra + needle, 1)
    else:
        print("askPin bind not found")

old_login = '''const doLogin=document.getElementById("doLogin");\n      if(doLogin) doLogin.onclick=async()=>{\n        const v=(document.getElementById("surname").value||"").trim();\n        const err=document.getElementById("loginErr");\n        if(v.length<2){ err.textContent="Введите фамилию."; return; }\n        state.surname=norm(v); state.display=v.replace(/\\s+/g," "); save();\n        await refreshLocks();\n        if(userRun()){ resumeExam(userRun()); return; }\n        view="home"; render();\n      };'''
new_login = '''const doLogin=document.getElementById("doLogin");\n      if(doLogin) doLogin.onclick=async()=>{\n        const v=(document.getElementById("surname").value||"").trim();\n        const pinRaw=((document.getElementById("loginPin")||{}).value||"").trim();\n        const err=document.getElementById("loginErr");\n        if(!err) return;\n        if(v.length<2){ err.textContent="Введите фамилию."; return; }\n        if(!pinRaw){ err.textContent="Введите личный код от РОП."; return; }\n        err.textContent="Проверяю код…";\n        const sn=norm(v);\n        const baked=await bakedPin(sn);\n        await refreshLocks();\n        const rec=(remoteLocks||[]).find(x=>x && x.type==="login" && x.surname===sn);\n        const cloud=rec && rec.code;\n        const ok=pinEq(pinRaw, cloud) || pinEq(pinRaw, baked);\n        if(!ok){\n          if(!syncOk && !baked){ err.textContent="Нет связи с сервером кодов. Откройте сайт в Chrome или Safari — не из Telegram — и повторите."; return; }\n          if(!cloud && !baked){ err.textContent="Код для этой фамилии ещё не выдан. Нажмите «Запросить код у РОП»."; return; }\n          err.textContent="Неверный код. Только цифры, без пробелов. Откройте сайт в Chrome / Safari, не из Telegram."; return;\n        }\n        state.surname=sn; state.display=v.replace(/\\s+/g," "); state.authed=true; save();\n        if(userRun()){ resumeExam(userRun()); return; }\n        view="home"; render();\n      };'''
if old_login in html:
    html = html.replace(old_login, new_login)
else:
    print("doLogin block not found (ok if already patched in source)")

patch = Path("study-fn.js")
if patch.exists():
    extra = patch.read_text()
    a = html.find("    function study(){")
    b = html.find("    function brief(){")
    if a >= 0 and b > a:
        html = html[:a] + extra + html[b:]

unlock = Path("unlock-fn.js")
if unlock.exists():
    extra = unlock.read_text()
    a = html.find("    function tryUnlock(code){")
    b = html.find("    function compactPaper(){")
    if a >= 0 and b > a:
        html = html[:a] + extra + html[b:]

css_path = Path("theme.css")
if css_path.exists() and css_path.stat().st_size > 1000:
    css = css_path.read_text()
    a = html.find("<style>")
    b = html.find("</style>") + 8
    if a >= 0 and b > a:
        html = html[:a] + "<style>\n" + css + "\n</style>" + html[b:]
else:
    print("skip tiny/missing theme.css")

EXTRA_CSS = """
.terms-col{max-width:720px}
.terms-grid{display:grid;gap:4px 28px}
@media(min-width:900px){
  .terms-grid{grid-template-columns:1fr 1fr;max-width:860px}
  .terms-span{grid-column:1/-1}
}
.sheet-wrap{overflow:auto;max-width:720px}
.sheet{width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 18px}
.km-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:8px;margin:8px 0 16px}
.km-grid .chip{width:100%;text-align:left;white-space:normal;line-height:1.25;padding:10px 12px;min-height:54px}
.km-grid .chip small{display:block;opacity:.72;font-size:11px;font-weight:600;margin-top:3px}
.check-row{display:flex;gap:12px;align-items:center;margin-top:14px;padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:#fff;cursor:pointer}
.check-row input{width:22px;height:22px;accent-color:var(--primary);flex:0 0 22px}
.check-row span{font-size:15px;font-weight:600;line-height:1.3}
.km-layout{display:grid;gap:14px;margin-top:8px}
@media(min-width:960px){.km-layout{grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr);align-items:start}}
.stock-side{max-height:720px;overflow:auto}
.stock-h{margin:12px 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:700}
.stock-car{width:100%;text-align:left;border:1px solid var(--border);background:#fff;border-radius:12px;padding:10px 12px;margin:0 0 8px;display:block}
.stock-car.on{border-color:var(--fg);box-shadow:0 0 0 1px var(--fg)}
.stock-car.prio{background:#fff6d8;border-color:#e0b84a}
.stock-car.prio.on{border-color:#b88912;box-shadow:0 0 0 1px #b88912}
.stock-car b{display:block;font-size:13px;letter-spacing:-.02em}
.stock-car .vin{display:block;margin-top:3px}
.stock-meta{display:block;margin-top:4px;font-size:12px;color:var(--muted);line-height:1.35}
.dc-result{margin-top:14px}
"""
if ".km-grid{" not in html:
    html = html.replace("</style>", EXTRA_CSS + "\n</style>", 1)
    print("extra css injected")
elif ".dc-result{" not in html:
    html = html.replace("</style>", EXTRA_CSS + "\n</style>", 1)
    print("extra css refreshed")

head = html[: html.find("<style>")] if "<style>" in html else html[:400]
if "<title>" in head and "</title>" not in head:
    i = html.find("<style>")
    html = html[:i] + "</title>\n  " + html[i:]

pins = {}
try:
    body = urllib.parse.urlencode({"edit_code": "4fmBrr2H"}).encode()
    req = urllib.request.Request("https://rentry.co/api/fetch/o6nq7rki", data=body, headers={"Content-Type":"application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode())
    content = data.get("content")
    text = content.get("text") if isinstance(content, dict) else (content if isinstance(content, str) else "[]")
    lst = json.loads(text or "[]")
    for x in lst:
        if x and x.get("type")=="login" and x.get("surname") and x.get("code"):
            pins[str(x["surname"]).replace("ё","е").replace("Ё","е").lower()] = str(x["code"])
    print("baked pins", pins)
except Exception as e:
    print("pins fetch fail", e)

if pins:
    html = re.sub(r"const LOGIN_PINS = \{.*?\};", "const LOGIN_PINS = " + json.dumps(pins, ensure_ascii=False) + ";", html, count=1, flags=re.S)

MPT_VINS={"EDXFB32B2TE041658","EDXFB32B4TE041659","EDXFB32B7TE062327","EDXFD32B3TE070113","EDXFB32B3TE091114","EDXFB32B1TE087336","EDXFD32B4TE092590","EDXFD32B4TE092587"}
m=re.search(r"const STOCK = (\[.*?\]);\s*\n\s*const ST_LABEL", html, re.S)
if not m:
    m=re.search(r"const STOCK = (\[.*?\]);", html, re.S)
if m:
    stock=json.loads(m.group(1))
    for x in stock:
        x["mpt"]=x.get("vin") in MPT_VINS
    if not any(x.get("vin")=="EDEDB21B7SD723791" for x in stock):
        stock.append({"vin":"EDEDB21B7SD723791","model":"t7l","name":"Tiggo 7 L","trim":"Актив","color":"Серебристый","status":"in","note":"В салоне · с 06.08.2026","invoice":False,"salon":"","prod":"","rrc":None,"mpt":False})
    html=html[:m.start(1)]+json.dumps(stock, ensure_ascii=False)+html[m.end(1):]
    print("stock patched", sum(1 for x in stock if x.get("mpt")), "mpt", len(stock), "cars")

if 't7l:' not in html:
    html=html.replace(
        'a8:  {id:"a8", brand:"CHERY", name:"Arrizo 8"',
        't7l: {id:"t7l", brand:"CHERY", name:"Tiggo 7 L", rivals:"Jolion, X70, Dashing", examN:0, img:"cars/t9.jpg"},\n      a8:  {id:"a8", brand:"CHERY", name:"Arrizo 8"'
    )
html=html.replace('const modelOrder=["t4l","t7","t8","t9","a8"];','const modelOrder=["t4l","t7","t8","t9","t7l","a8"];')
html=html.replace('${["t4l","t7","t8","t9","a8"].map(id=>{','${["t4l","t7","t8","t9","t7l","a8"].map(id=>{')
html=html.replace(
    '${r.invoice?` <span class="st inv">Спец инвойс</span>`:""}</td>',
    '${r.invoice?` <span class="st inv">Спец инвойс</span>`:""}${r.mpt?` <span class="st mpt">МПТ</span>`:""}</td>'
)
if ".st.mpt{" not in html:
    html=html.replace("</style>", ".st.mpt{background:#cfe8d1;color:#1b5e20;}\n</style>", 1)

html=html.replace(
    '["terms","₽","Торговые условия","Прайс 01.09.2026, трейд-ин и кредит T7"]',
    '["terms","₽","Торговые условия","Доходность, бонусы, МПТ, спец инвойс, приоритет"]'
)
html=html.replace(
    '["calc","%","Калькулятор","Ежемесячный платёж с выбранной комплектации"]',
    '["calc","%","Калькулятор","Платёж и калькулятор КМ от 10.09"]'
)
if "let calcMode" not in html:
    html=html.replace(
        'let stockStatus = "all";',
        'let stockStatus = "all";\n    let calcMode = "pay";\n    let kmId = "t4lp";\n    let kmShown = "";\n    let kmVin = "";'
    )
if "let kmVin" not in html:
    html=html.replace(
        'let kmShown = "";',
        'let kmShown = "";\n    let kmVin = "";'
    )

tc = Path("terms-calc-fn.js")
if tc.exists():
    extra = tc.read_text()
    if not extra.endswith("\n"):
        extra += "\n"
    a = html.find("    function terms(){")
    b = html.find("    function stock(){")
    if a >= 0 and b > a:
        html = html[:a] + extra + html[b:]
        print("terms-calc spliced", len(extra))
    else:
        print("terms/stock anchors not found", a, b)

NEW_BIND = '''      document.querySelectorAll("[data-calc-mode]").forEach(b=>b.onclick=()=>{ calcMode=b.dataset.calcMode; view="calc"; render(); });
      document.querySelectorAll("[data-km-id]").forEach(b=>b.onclick=()=>{ kmId=b.dataset.kmId; kmShown=""; kmVin=""; view="calc"; render(); });
      document.querySelectorAll("[data-km-vin]").forEach(b=>b.onclick=()=>{
        const vin=b.dataset.kmVin||"";
        kmVin=vin;
        const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===vin);
        if(car && typeof kmIdFromCar==="function"){
          const nid=kmIdFromCar(car);
          if(nid && nid!==kmId){ kmId=nid; kmShown=""; }
        }
        view="calc"; render();
      });
      ["kmRrc","kmInv","kmUseTi","kmUseCr","kmSpec","kmDc","kmDo","kmCard","kmCasco"].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.addEventListener("change", ()=>{ view="calc"; render(); });
      });
'''
OLD_BINDS = [
'''      document.querySelectorAll("[data-calc-mode]").forEach(b=>b.onclick=()=>{ calcMode=b.dataset.calcMode; view="calc"; render(); });
      const kmPreset=document.getElementById("kmPreset");
      if(kmPreset) kmPreset.onchange=()=>{ kmId=kmPreset.value; kmShown=""; view="calc"; render(); };
      ["kmRrc","kmInv","kmUseTi","kmUseCr","kmPrio","kmFam","kmSpec","kmDc","kmDo","kmCard","kmCasco"].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.addEventListener("change", ()=>{ view="calc"; render(); });
      });
''',
'''      document.querySelectorAll("[data-calc-mode]").forEach(b=>b.onclick=()=>{ calcMode=b.dataset.calcMode; view="calc"; render(); });
      document.querySelectorAll("[data-km-id]").forEach(b=>b.onclick=()=>{ kmId=b.dataset.kmId; kmShown=""; kmVin=""; view="calc"; render(); });
      document.querySelectorAll("[data-km-vin]").forEach(b=>b.onclick=()=>{ kmVin=b.dataset.kmVin||""; view="calc"; render(); });
      ["kmRrc","kmInv","kmUseTi","kmUseCr","kmSpec","kmDc","kmDo","kmCard","kmCasco"].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.addEventListener("change", ()=>{ view="calc"; render(); });
      });
'''
]
replaced = False
for old in OLD_BINDS:
    if old in html:
        html = html.replace(old, NEW_BIND)
        replaced = True
        print("calc bind replaced")
        break
if not replaced:
    needle = '      const cPreset=document.getElementById("cPreset");'
    if needle in html and "data-km-id" not in html[html.find("function bind()"):html.find("function bind()")+2800]:
        html = html.replace(needle, NEW_BIND + needle, 1)
        print("calc bind inserted")
    elif "data-km-id" in html:
        print("calc bind already current")
    else:
        print("calc bind not found")

Path("_site").mkdir(exist_ok=True)
Path("_site/index.html").write_text(html)
Path("_site/pins.json").write_text(json.dumps(pins, ensure_ascii=False))
print("wrote site", len(html))
