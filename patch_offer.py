from pathlib import Path
import base64
import re

ROOT = Path(".")
src = ROOT / "offer-fn.js"
body = src.read_text(encoding="utf-8") if src.exists() else ""
equip = ""
for cand in ("offer-equip-mini.js", "offer-equip.js"):
    p = ROOT / cand
    if p.exists() and p.stat().st_size > 200:
        equip = p.read_text(encoding="utf-8")
        print("equip source", cand, len(equip))
        break

if "function offerPack(" in body:
    fn = body
elif body and equip:
    fn = equip.rstrip() + "\n" + body
else:
    fn = body or equip

css = """
.hub-card[data-go="offer"]::before{background-image:url("hub/offer.jpg?v=3");background-position:50% 48%;background-size:cover;}
.hub-card[data-offer-tab="new"]::before{background-image:url("hub/offer-new.jpg?v=3");background-position:48% 52%;background-size:cover;}
.hub-card[data-offer-tab="service"]::before{background-image:url("hub/offer-service.jpg?v=3");background-position:50% 46%;background-size:cover;}
.hub-card[data-offer-tab="lease"]::before{background-image:url("hub/offer-lease.jpg?v=3");background-position:50% 58%;background-size:cover;}
.offer-grid{margin-top:12px;}
@media(min-width:900px){.offer-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;}}
.offer-sheet{white-space:pre-wrap;font:13px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px;margin:0 0 12px;max-height:520px;overflow:auto;}
.offer-equip-card{margin-top:14px;}
.offer-eq{margin:0 0 12px;padding:0 0 0 18px;font-size:13px;line-height:1.45;}
.offer-eq li{margin:0 0 4px;}
.offer-eq-h{margin:12px 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;}
.offer-print{position:absolute;left:-9999px;top:0;width:0;height:0;overflow:hidden;}
.offer-banks{margin:10px 0 0}
@media print{body *{visibility:hidden!important}#ofPrint,.offer-print,#ofPrint *,.offer-print *{visibility:visible!important}#ofPrint,.offer-print{position:absolute;left:0;top:0;width:100%;height:auto;overflow:visible}}
"""

def write_jpgs():
    names = ["offer", "offer-new", "offer-service", "offer-lease"]
    dirs = [ROOT / "hub", ROOT / "_site" / "hub", ROOT / "hub_b64", Path("/home/workdir/artifacts/hub_b64")]
    for name in names:
        raw = None
        for d in dirs:
            for cand in (d / f"{name}.jpg.b64", d / f"{name}.jpg"):
                if cand.exists() and cand.stat().st_size > 1000:
                    raw = base64.b64decode(cand.read_text(encoding="utf-8").strip()) if cand.name.endswith(".b64") else cand.read_bytes()
                    break
            if raw:
                break
        if not raw:
            print("no preview", name)
            continue
        for out in (ROOT / "hub" / f"{name}.jpg", ROOT / "_site" / "hub" / f"{name}.jpg"):
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(raw)

write_jpgs()

HUB_OLD = '        ["gibdd","Г","Проверки ГИБДД","ФССП, залоги, банкроты"]'
HUB_NEW = HUB_OLD + '\n        ,["offer","КП","Коммерческое предложение","Новый а/м, сервис и лизинг"]'
NAV_OLD = 'const extra={terms:"Условия",calc:"Калькулятор",stock:"Склад",docs:"Документы",epts:"ЭПТС",duty:"Чек-лист",gibdd:"ГИБДД"};'
NAV_NEW = 'const extra={terms:"Условия",calc:"Калькулятор",stock:"Склад",docs:"Документы",epts:"ЭПТС",duty:"Чек-лист",gibdd:"ГИБДД",offer:"КП"};'
MAP_OLD = "const map={login,hub,home,study,quiz:brief,play,rate,hist:rate,review,terms,calc,stock,docs,epts,duty,gibdd};"
MAP_NEW = "const map={login,hub,home,study,quiz:brief,play,rate,hist:rate,review,terms,calc,stock,docs,epts,duty,gibdd,offer};"
BIND_OLD = '      document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{'
BIND_NEW = '      if(typeof offerBind==="function") offerBind();\n      document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{'

for p in (Path("index.html"), Path("_site/index.html")):
    if not p.exists() or p.stat().st_size < 1000:
        print("skip", p)
        continue
    html = p.read_text(encoding="utf-8")
    if "hub/offer.jpg?v=3" not in html:
        html = html.replace("</style>", css + "\n</style>", 1)
        print(p, "css inject")
    elif ".offer-print{" not in html:
        html = html.replace("</style>", css + "\n</style>", 1)
        print(p, "print css")
    if '["offer","КП"' not in html:
        html = html.replace(HUB_OLD, HUB_NEW, 1)
    html = html.replace(NAV_OLD, NAV_NEW, 1)
    html = html.replace(MAP_OLD, MAP_NEW, 1)
    if "offerBind()" not in html:
        html = html.replace(BIND_OLD, BIND_NEW, 1)
    if fn and "function offerDeal(" in fn:
        html2, n = re.subn(
            r"(?:    const OFFER_SPEC = \{[\s\S]*?\n    function offerPackHtml[\s\S]*?\n    \}\n)?(?:    function offerSpecOf\([\s\S]*?\n    function offerPackHtml[\s\S]*?\n    \}\n)?    let offerTab = \"home\";[\s\S]*?    function offerBind\(\)\{[\s\S]*?\n    \}\n",
            lambda _m: fn.rstrip() + "\n",
            html,
            count=1,
        )
        if n:
            html = html2
            print(p, "offer block replaced")
        else:
            print(p, "WARN offer block not replaced")
            if "function offerPack(" not in html and equip:
                html = html.replace('    let offerTab = "home";', equip.rstrip() + "\n    let offerTab = \"home\";", 1)
                print(p, "equip fallback inject")
    elif fn and "function offer()" not in html:
        html = html.replace("    function docs(){", fn + "\n    function docs(){", 1)
    p.write_text(html, encoding="utf-8")
    print("offer patched", p, p.stat().st_size, "deal", "function offerDeal(" in html, "pack", "function offerPack(" in html)
