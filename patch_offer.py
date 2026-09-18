from pathlib import Path
import base64
import re

ROOT = Path(".")
src = ROOT / "offer-fn.js"
body = src.read_text(encoding="utf-8") if src.exists() else ""
equip = ""
for cand in ("offer-equip-mini.js", "offer-equip.js"):
    p = ROOT / cand
    if p.exists():
        equip = p.read_text(encoding="utf-8")
        break

if "function offerPack(" in body:
    fn = body
elif body and equip:
    fn = equip.rstrip() + "\n" + body
else:
    fn = body or equip

css = """
.hub-card[data-go="offer"]::before{
  background-image:url("hub/offer.jpg?v=8");
  background-position:50% 48%;
  background-size:cover;
}
.hub-card[data-offer-tab="new"]::before{
  background-image:url("hub/offer-new.jpg?v=8");
  background-position:48% 52%;
  background-size:cover;
}
.hub-card[data-offer-tab="service"]::before{
  background-image:url("hub/offer-service.jpg?v=8");
  background-position:50% 46%;
  background-size:cover;
}
.hub-card[data-offer-tab="lease"]::before{
  background-image:url("hub/offer-lease.jpg?v=8");
  background-position:50% 42%;
  background-size:cover;
}
.offer-grid{margin-top:12px;}
@media(min-width:900px){
  .offer-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;}
}
.offer-sheet{
  white-space:pre-wrap;
  font:13px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  background:#fff;
  border:1px solid var(--border);
  border-radius:12px;
  padding:14px;
  margin:0 0 12px;
  max-height:520px;
  overflow:auto;
}
.offer-equip-card{margin-top:14px;}
.offer-eq{margin:0 0 12px;padding:0 0 0 18px;font-size:13px;line-height:1.45;}
.offer-eq li{margin:0 0 4px;}
.offer-eq-h{margin:12px 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;}
.offer-step{margin:14px 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700;}
.offer-fams{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:8px 0 4px}
@media(min-width:800px){.offer-fams{grid-template-columns:repeat(5,minmax(0,1fr))}}
.offer-fam{border:1px solid var(--border);background:var(--surface);border-radius:16px;padding:0;overflow:hidden;text-align:left;box-shadow:var(--shadow);cursor:pointer}
.offer-fam img{width:100%;height:78px;object-fit:cover;display:block;background:#ece8df}
.offer-fam .txt{padding:8px 10px 10px;display:block}
.offer-fam .txt b{display:block;font-size:13px;letter-spacing:-.02em}
.offer-fam .txt span{display:block;margin-top:2px;font-size:11px;color:var(--muted);font-weight:600}
.offer-fam.on{border-color:var(--primary);box-shadow:0 0 0 2px var(--primary)}
.offer-trims{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0 12px}
@media(min-width:800px){.offer-trims{grid-template-columns:repeat(3,minmax(0,1fr))}}
.offer-trim{border:1px solid var(--border);background:var(--surface);border-radius:14px;padding:12px;text-align:left;cursor:pointer}
.offer-trim b{display:block;font-size:13px}
.offer-trim span{display:block;margin-top:4px;font-size:12px;color:var(--muted);font-weight:700}
.offer-trim.on{background:var(--fg);color:#fff;border-color:var(--fg)}
.offer-trim.on span{color:rgba(255,255,255,.82)}
"""

EQUIP_CSS = """
.offer-sheet{max-height:520px;overflow:auto;}
.offer-equip-card{margin-top:14px;}
.offer-eq{margin:0 0 12px;padding:0 0 0 18px;font-size:13px;line-height:1.45;}
.offer-eq li{margin:0 0 4px;}
.offer-eq-h{margin:12px 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;}
.offer-step{margin:14px 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700;}
.offer-fams{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:8px 0 4px}
@media(min-width:800px){.offer-fams{grid-template-columns:repeat(5,minmax(0,1fr))}}
.offer-fam{border:1px solid var(--border);background:var(--surface);border-radius:16px;padding:0;overflow:hidden;text-align:left;box-shadow:var(--shadow);cursor:pointer}
.offer-fam img{width:100%;height:78px;object-fit:cover;display:block;background:#ece8df}
.offer-fam .txt{padding:8px 10px 10px;display:block}
.offer-fam .txt b{display:block;font-size:13px}
.offer-fam .txt span{display:block;margin-top:2px;font-size:11px;color:var(--muted);font-weight:600}
.offer-fam.on{border-color:var(--primary);box-shadow:0 0 0 2px var(--primary)}
.offer-trims{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0 12px}
@media(min-width:800px){.offer-trims{grid-template-columns:repeat(3,minmax(0,1fr))}}
.offer-trim{border:1px solid var(--border);background:var(--surface);border-radius:14px;padding:12px;text-align:left;cursor:pointer}
.offer-trim b{display:block;font-size:13px}
.offer-trim span{display:block;margin-top:4px;font-size:12px;color:var(--muted);font-weight:700}
.offer-trim.on{background:var(--fg);color:#fff;border-color:var(--fg)}
.offer-trim.on span{color:rgba(255,255,255,.82)}
"""


def write_jpgs():
    names = ["offer", "offer-new", "offer-service", "offer-lease"]
    dirs = [
        ROOT / "hub",
        ROOT / "_site" / "hub",
        ROOT / "hub_b64",
        Path("/home/workdir/artifacts/hub_b64"),
        Path("/home/workdir/artifacts/hub_previews"),
    ]
    for name in names:
        raw = None
        for d in dirs:
            for cand in (d / f"{name}.jpg.b64", d / f"{name}.b64", d / f"{name}.jpg"):
                if cand.exists() and cand.stat().st_size > 1000:
                    if cand.name.endswith(".b64"):
                        raw = base64.b64decode(cand.read_text(encoding="utf-8").strip())
                    else:
                        raw = cand.read_bytes()
                    break
            if raw:
                break
        jpg = ROOT / "hub" / f"{name}.jpg"
        if not raw and jpg.exists():
            raw = jpg.read_bytes()
        if not raw:
            print("no preview", name)
            continue
        for out in (ROOT / "hub" / f"{name}.jpg", ROOT / "_site" / "hub" / f"{name}.jpg"):
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(raw)
            print("jpg", out, out.stat().st_size)


def replace_offer_block(html, block):
    if not block or "function offer(" not in block:
        return html, False
    starts = []
    for m in (
        "    function offerSpecOf(id){",
        '    let offerTab = "home";',
        "    let offerTab=\"home\";",
    ):
        i = html.find(m)
        if i >= 0:
            starts.append(i)
    end = html.find("    function docs(){")
    if starts and end > min(starts):
        start = min(starts)
        html = html[:start] + block.rstrip() + "\n" + html[end:]
        print("replaced offer block", end - start, "->", len(block))
        return html, True
    if "function offer()" not in html and "    function docs(){" in html:
        html = html.replace("    function docs(){", block.rstrip() + "\n    function docs(){", 1)
        print("injected offer before docs")
        return html, True
    if "function offer()" not in html:
        html = html.replace("</script>", block + "\n</script>", 1)
        print("injected offer at script end")
        return html, True
    print("offer block already present, no replace anchor")
    return html, False


write_jpgs()

HUB_OLD = '        ["gibdd","Г","Проверки ГИБДД","ФССП, залоги, банкроты"]'
HUB_NEW = HUB_OLD + '\n        ,["offer","КП","Коммерческое предложение","Новый а/м, сервис и лизинг"]'

NAV_OLD = 'const extra={terms:"Условия",calc:"Калькулятор",stock:"Склад",docs:"Документы",epts:"ЭПТС",duty:"Чек-лист",gibdd:"ГИБДД"};'
NAV_NEW = 'const extra={terms:"Условия",calc:"Калькулятор",stock:"Склад",docs:"Документы",epts:"ЭПТС",duty:"Чек-лист",gibdd:"ГИБДД",offer:"КП"};'

MAP_NEEDLES = [
    "const map={login,hub,home,study,quiz:brief,play,rate,hist:rate,review,terms,calc,stock,docs,epts,duty,gibdd};",
    "const map={login,hub,home,study,quiz:brief,play,rate,hist:rate,terms,calc,stock,docs,epts,duty,gibdd};",
]

BIND_OLD = '      document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{'
BIND_NEW = '      if(typeof offerBind==="function") offerBind();\n      document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{'

for p in (Path("index.html"), Path("_site/index.html")):
    if not p.exists() or p.stat().st_size < 1000:
        print("skip", p)
        continue
    html = p.read_text(encoding="utf-8")
    html, n_v = re.subn(
        r"hub/(offer(?:-new|-service|-lease)?)\.jpg\?v=\d+",
        r"hub/\1.jpg?v=8",
        html,
    )
    if n_v:
        print(p, "preview cache", n_v)
    if "hub/offer.jpg?v=8" not in html or ".offer-grid" not in html:
        html2, n = re.subn(
            r'\.hub-card\[data-go="offer"\]::before\{[\s\S]*?background-size:cover;\n\}',
            "",
            html,
            count=1,
        )
        if n:
            html = html2
        if "hub/offer.jpg?v=8" not in html:
            html = html.replace("</style>", css + "\n</style>", 1)
            print(p, "css inject")
    if ".offer-fams{" not in html:
        html = html.replace("</style>", EQUIP_CSS + "\n</style>", 1)
            print(p, "fam/trim css")
    if '["offer","КП"' not in html:
        html = html.replace(HUB_OLD, HUB_NEW, 1)
        print(p, "hub card")
    html = html.replace(NAV_OLD, NAV_NEW, 1)
    if "duty,gibdd,offer}" not in html:
        for old in MAP_NEEDLES:
            if old in html:
                html = html.replace(old, old[:-2] + ",offer};", 1)
                print(p, "map offer")
                break
        else:
            if "docs,epts,duty,gibdd};" in html:
                html = html.replace("docs,epts,duty,gibdd};", "docs,epts,duty,gibdd,offer};", 1)
                print(p, "map offer fallback")
    if "offerBind()" not in html:
        html = html.replace(BIND_OLD, BIND_NEW, 1)
        print(p, "bind")

    html, _ = replace_offer_block(html, fn)

    p.write_text(html, encoding="utf-8")
    print(
        "offer patched",
        p,
        p.stat().st_size,
        "pack",
        "function offerPack(" in html,
        "pdf",
        "function offerPdf(" in html,
        "fams",
        "data-offer-fam" in html,
        "map",
        "duty,gibdd,offer}" in html,
    )
