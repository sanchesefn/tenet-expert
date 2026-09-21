from pathlib import Path
import re

src = Path("terms-calc-ui-a.js")
if not src.exists():
    print("skip stock merge: no terms-calc-ui-a.js")
    raise SystemExit(0)
text = src.read_text()
chunk = re.search(
    r"    function kmPrioRecRows[\s\S]*?    function kmPrioRecs\([\s\S]*?\n    \}\n",
    text,
)
if not chunk:
    print("skip stock merge: chunk not found")
    raise SystemExit(0)
block = chunk.group(0)

css = """
.stock-car.rec{border-color:#c28b2a;box-shadow:inset 3px 0 0 #c28b2a}
.rec-tag{color:#8d6e00!important}
"""

for p in (Path("index.html"), Path("_site/index.html")):
    if not p.exists() or p.stat().st_size < 1000:
        print("skip", p)
        continue
    html = p.read_text(encoding="utf-8")
    html2, n = re.subn(
        r"(?:    function kmPrioRecRows\([^)]*\)\{[\s\S]*?\n    \}\n)*    function kmSideList\([^)]*\)\{[\s\S]*?\n    function kmPrioRecs\([\s\S]*?\n    \}\n",
        block if block.startswith("    ") else "    " + block,
        html,
        count=1,
    )
    if n:
        html = html2
        print(p, "replaced kmSideList/kmPrioRecs")
    else:
        print(p, "kmSideList replace missed")
    old_call = '${typeof kmPrioRecs==="function"?kmPrioRecs(m, price, downPct, months, extras):""}\n            ${kmSideList(m)}'
    if old_call in html:
        html = html.replace(old_call, '${kmSideList(m, price, downPct, months, extras)}')
        print(p, "removed separate recs call")
    if "${kmSideList(m)}" in html and "kmSideList(m, price" not in html:
        html = html.replace("${kmSideList(m)}", "${kmSideList(m, price, downPct, months, extras)}")
        print(p, "updated kmSideList call")
    if ".stock-car.rec{" not in html:
        html = html.replace("</style>", css + "\n</style>", 1)
        print(p, "rec css")
    p.write_text(html, encoding="utf-8")
    print("stock merge done", p, p.stat().st_size)
