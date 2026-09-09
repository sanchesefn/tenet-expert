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
.terms-col{max-width:1080px}
.terms-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin:8px 0 22px}
.term-card{border:1px solid var(--border);background:#fff;border-radius:12px;padding:12px 14px;box-shadow:var(--shadow)}
.term-card b{display:block;font-size:15px;letter-spacing:-.02em}
.term-card .num{font-weight:800;margin-top:6px;font-variant-numeric:tabular-nums}
.term-card small{display:block;color:var(--muted);font-size:12px;line-height:1.35;margin-top:6px}
.km-line{margin:4px 0 12px}
.km-line .stock-h{margin:10px 0 6px}
.km-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:8px;margin:0}
.km-grid .chip{width:100%;text-align:left;white-space:normal;line-height:1.25;padding:10px 12px;min-height:54px}
.km-grid .chip small{display:block;opacity:.72;font-size:11px;font-weight:600;margin-top:3px}
.check-row{display:flex;gap:12px;align-items:center;margin-top:14px;padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:#fff;cursor:pointer}
.check-row input{width:22px;height:22px;accent-color:var(--primary);flex:0 0 22px}
.check-row span{font-size:15px;font-weight:600;line-height:1.3}
.km-layout{display:grid;gap:14px;margin-top:8px}
@media(min-width:960px){.km-layout{grid-template-columns:minmax(0,1.05fr) minmax(300px,.95fr);align-items:start}}
.km-right{display:flex;flex-direction:column;gap:14px}
.stock-side{max-height:520px;overflow:auto}
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
if ".terms-cards{" not in html or ".km-right{" not in html:
    html = html.replace("</style>", EXTRA_CSS + "\n</style>", 1)
    print("extra css injected")

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
