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
new_login = '''const doLogin=document.getElementById("doLogin");\n      if(doLogin) doLogin.onclick=async()=>{\n        const v=(document.getElementById("surname").value||"").trim();\n        const pinRaw=((document.getElementById("loginPin")||{}).value||"").trim();\n        const err=document.getElementById("loginErr");\n        if(!err) return;\n        if(v.length<2){ err.textContent="Введите фамилию."; return; }\n        if(!pinRaw){ err.textContent="Введите личный код от РОП."; return; }\n        err.textContent="Проверяю код…";\n        const sn=norm(v);\n        const baked=await bakedPin(sn);\n        await refreshLocks();\n        const rec=(remoteLocks||[]).find(x=>x && x.type==="login" && x.surname===sn);\n        const cloud=rec and rec.code;\n        const ok=pinEq(pinRaw, cloud) or pinEq(pinRaw, baked);\n        if(!ok):\n          pass\n''