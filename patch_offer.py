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
  background-image:url("hub/offer.jpg?v=3");
  background-position:50% 48%;
  background-size:cover;
}
.hub-card[data-offer-tab="new"]::before{
  background-image:url("hub/offer-new.jpg?v=3");
  background-position:48% 52%;
  background-size:cover;
}
.hub-card[data-offer-tab="service"]::before{
  background-image:url("hub/offer-service.jpg?v=3");
  background-position:50% 46%;
  background-size:cover;
}
.hub-card[data-offer-tab="lease"]::before{
  background-image:url("hub/offer-lease.jpg?v=3");
  background-position:50% 58%;
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
"""

EQUIP_CSS = """
.offer-sheet{max-height:520px;overflow:auto;}
.offer-equip-card{margin-top:14px;}
.offer-eq{margin:0 0 12px;padding:0 0 0 18px;font-size:13px;line-height:1.45;}
.offer-eq li{margin:0 0 4px;}
.offer-eq-h{margin:12px 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;}
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


def bake_offer_new(text):
    """Surgical: add pack/equip to existing offerNew without rewriting the whole block."""
    if "const pack=typeof offerPack" not in text:
        old_pay = (
            '      const pay=typeof calcPay==="function"?Math.round(calcPay(out, down, months, 19.2)):0;\n'
            "      const text=`Коммерческое предложение · новый автомобиль"
        )
        new_pay = (
            '      const pay=typeof calcPay==="function"?Math.round(calcPay(out, down, months, 19.2)):0;\n'
            '      const pack=typeof offerPack==="function"?offerPack(m.id):null;\n'
            '      const equip=typeof offerPackText==="function"?offerPackText(pack):"";\n'
            "      const text=`Коммерческое предложение · новый автомобиль"
        )
        if old_pay in text:
            text = text.replace(old_pay, new_pay, 1)
            print("bake pack vars")
        else:
            print("WARN no pay-anchor for pack vars")

    if "${equip}" not in text:
        old_line = (
            'Ориентир платежа (Совкомбанк 19,2%): ${pay?rub(pay)+" ₽ / мес.":"—"}\n'
            "\nПредложение действует ${valid}."
        )
        new_line = (
            'Ориентир платежа (Совкомбанк 19,2%): ${pay?rub(pay)+" ₽ / мес.":"—"}\n'
            "${equip}\n"
            "\nПредложение действует ${valid}."
        )
        if old_line in text:
            text = text.replace(old_line, new_line, 1)
            print("bake equip in text")
        else:
            print("WARN no pay-line for equip text")

    if 'class="card offer-equip-card"' not in text and "Лист оснащения" not in text:
        old_end = (
            '            <button type="button" class="btn ivory" data-offer-copy="ofTextNew">Скопировать</button>\n'
            "          </div>\n"
            "        </div>`;"
        )
        new_end = (
            '            <button type="button" class="btn ivory" data-offer-copy="ofTextNew">Скопировать</button>\n'
            "          </div>\n"
            "        </div>\n"
            '        <div class="card offer-equip-card">\n'
            '          <p class="eyebrow">Лист оснащения</p>\n'
            '          <h3 style="margin:0 0 10px">${escape(m.name)}</h3>\n'
            '          ${typeof offerPackHtml==="function"?offerPackHtml(pack):""}\n'
            "        </div>`;"
        )
        if old_end in text:
            text = text.replace(old_end, new_end, 1)
            print("bake equip card")
        else:
            print("WARN no card-end for equip html")
    return text


def inject_equip(html):
    if "function offerPack(" in html:
        print("equip functions already in html")
        return html
    if not equip:
        print("WARN no equip source")
        return html
    block = equip.rstrip() + "\n"
    if '    let offerTab = "home";' in html:
        html = html.replace('    let offerTab = "home";', block + '    let offerTab = "home";', 1)
        print("equip inject before offerTab")
        return html
    if "    function offerNew(){" in html:
        html = html.replace("    function offerNew(){", block + "    function offerNew(){", 1)
        print("equip inject before offerNew")
        return html
    print("WARN no inject anchor for equip")
    return html


write_jpgs()
fn = bake_offer_new(fn)

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
    if "hub/offer.jpg?v=3" not in html or ".offer-grid" not in html:
        html2, n = re.subn(
            r'\.hub-card\[data-go="offer"\]::before\{[\s\S]*?background-size:cover;\n\}',
            "",
            html,
            count=1,
        )
        if n:
            html = html2
        if "hub/offer.jpg?v=3" not in html:
            html = html.replace("</style>", css + "\n</style>", 1)
            print(p, "css inject")
    if ".offer-equip-card{" not in html:
        html = html.replace("</style>", EQUIP_CSS + "\n</style>", 1)
        print(p, "equip css")
    if '["offer","КП"' not in html:
        html = html.replace(HUB_OLD, HUB_NEW, 1)
        print(p, "hub card")
    html = html.replace(NAV_OLD, NAV_NEW, 1)
    html = html.replace(MAP_OLD, MAP_NEW, 1)
    if "offerBind()" not in html:
        html = html.replace(BIND_OLD, BIND_NEW, 1)
        print(p, "bind")

    html = inject_equip(html)
    html = bake_offer_new(html)

    if fn and "function offer()" not in html:
        anchor = "    function docs(){"
        if anchor in html:
            html = html.replace(anchor, fn + "\n    function docs(){", 1)
            print(p, "functions")
        else:
            html = html.replace("</script>", fn + "\n</script>", 1)
            print(p, "functions at script end")

    p.write_text(html, encoding="utf-8")
    print(
        "offer patched",
        p,
        p.stat().st_size,
        "pack",
        "function offerPack(" in html,
        "equipText",
        "${equip}" in html,
        "card",
        "offer-equip-card" in html,
    )
