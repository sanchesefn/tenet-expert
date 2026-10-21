#!/usr/bin/env python3
"""Вшивает раздел «График сотрудников» в собранный index.html."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MARKER = "/* График сотрудников · октябрь 2026"

NAV_OLD = """      if(active==="login") items=[];
      else if(active==="hub") items=[];
      else if(attest) items=[["hub","Кабинет"],["home","Аттестация"],["rate","Рейтинг"],["study","Справочник"],["quiz","Тест"]];
      else {
        items=[["hub","Кабинет"],["home","Аттестация"]];
        const extra={terms:"Условия",calc:"Калькулятор",stock:"Склад",docs:"Документы",epts:"ЭПТС",duty:"Чек-лист",gibdd:"ГИБДД",offer:"КП"};
        if(extra[active]) items.push([active, extra[active]]);
      }"""

NAV_NEW = """      if(active==="login") items=[];
      else if(attest) items=[["hub","Кабинет"],["sched","График"],["home","Аттестация"],["rate","Рейтинг"],["study","Справочник"],["quiz","Тест"]];
      else {
        items=[["hub","Кабинет"],["sched","График"]];
        if(active!=="hub" && active!=="sched") items.push(["home","Аттестация"]);
        const extra={terms:"Условия",calc:"Калькулятор",stock:"Склад",docs:"Документы",epts:"ЭПТС",duty:"Чек-лист",gibdd:"ГИБДД",offer:"КП"};
        if(extra[active]) items.push([active, extra[active]]);
      }"""

MAP_OLD = "const map={login,hub,home,study,quiz:brief,play,rate,hist:rate,review,terms,calc,stock,docs,epts,duty,gibdd,offer};"
MAP_NEW = "const map={login,hub,home,study,quiz:brief,play,rate,hist:rate,review,terms,calc,stock,docs,epts,duty,gibdd,offer,sched};"


def patch(html: str, css: str, js: str) -> str:
    if '["sched","График"]' not in html and NAV_OLD in html:
        html = html.replace(NAV_OLD, NAV_NEW, 1)
    if "offer,sched}" not in html and MAP_OLD in html:
        html = html.replace(MAP_OLD, MAP_NEW, 1)
    if "График сотрудников" not in html and "const cards=[" in html:
        html = html.replace(
            "const cards=[\n",
            'const cards=[\n        ["sched","Г","График сотрудников","Октябрь: смены, дежурства, собрание"],\n',
            1,
        )
    if ".sched-page" not in html and "</style>" in html:
        html = html.replace("</style>", "\n" + css + "\n</style>", 1)
    if MARKER not in html:
        anchor = '<nav class="bot" id="navBot"></nav>\n  <script>'
        block = (
            '<nav class="bot" id="navBot"></nav>\n  <script>\n'
            + js.strip()
            + "\n  </script>\n  <script>"
        )
        if anchor in html:
            html = html.replace(anchor, block, 1)
        elif "</body>" in html:
            html = html.replace("</body>", "<script>\n" + js.strip() + "\n</script>\n</body>", 1)
    return html


def main():
    css = (ROOT / "sched.css").read_text(encoding="utf-8")
    js = (ROOT / "sched.js").read_text(encoding="utf-8")
    targets = [Path("_site/index.html"), Path("index.html")]
    done = 0
    for p in targets:
        if not p.exists() or p.stat().st_size < 50000:
            continue
        raw = p.read_text(encoding="utf-8")
        nxt = patch(raw, css, js)
        if nxt != raw:
            p.write_text(nxt, encoding="utf-8")
            print("patched", p, p.stat().st_size)
            done += 1
        else:
            print("unchanged", p)
    if not done:
        print("schedule patch: nothing to write")


if __name__ == "__main__":
    main()
