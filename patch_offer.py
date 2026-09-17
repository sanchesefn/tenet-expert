from pathlib import Path

src = Path("offer-fn.js")
fn = src.read_text(encoding="utf-8") if src.exists() else ""

css = """
.hub-card[data-go="offer"]::before{
  background-image:linear-gradient(135deg,#1f4e79 0%,#8d6e3c 55%,#e8d5b0 100%);
  background-position:50% 50%;
}
.offer-sheet{
  white-space:pre-wrap;
  font:13px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  background:#fff;
  border:1px solid var(--border);
  border-radius:12px;
  padding:14px;
  margin:0 0 12px;
}
"""

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
    if ".hub-card[data-go=\"offer\"]" not in html:
        html = html.replace("</style>", css + "\n</style>", 1)
        print(p, "css")
    if '["offer","КП"' not in html:
        html = html.replace(HUB_OLD, HUB_NEW, 1)
        print(p, "hub card")
    html = html.replace(NAV_OLD, NAV_NEW, 1)
    html = html.replace(MAP_OLD, MAP_NEW, 1)
    if "offerBind()" not in html:
        html = html.replace(BIND_OLD, BIND_NEW, 1)
        print(p, "bind")
    if "function offer()" not in html and fn:
        anchor = "    function docs(){"
        if anchor in html:
            html = html.replace(anchor, fn + "\n    function docs(){", 1)
            print(p, "functions")
        else:
            html = html.replace("</script>", fn + "\n</script>", 1)
            print(p, "functions at script end")
    p.write_text(html, encoding="utf-8")
    print("offer patched", p, p.stat().st_size)
