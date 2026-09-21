from pathlib import Path
import re

fleet_src = Path("terms-fleet.js")
src = fleet_src.read_text() if fleet_src.exists() else ""
chunk = re.search(r"function fleetPayRows[\s\S]*function calcFleet\(m\)\{[\s\S]*?\n    \}\n", src) if src else None
if not chunk and src:
    chunk = re.search(r"function fleetCreditBox[\s\S]*function calcFleet\(m\)\{[\s\S]*?\n    \}\n", src)
block = chunk.group(0) if chunk else ""

for p in (Path("index.html"), Path("_site/index.html")):
    if not p.exists():
        print("skip fleet patch", p)
        continue
    html = p.read_text()
    html = html.replace(
        '"EDEDD24BXSG010341","EDEDD24B2SG003755","EDEDD24B3SG003926",\n      "LVVDC21B0SD594112","LVVDC21B7SD594110","LVVDC21B2SDJ34062"',
        '"EDXFB32B2TE041658","EDXFB32B4TE041659","EDXFB32B1TE087336",\n      "EDXFB32B3TE091114","EDXFD32B4TE092587","EDXFD32B4TE092590"'
    )
    html = html.replace(
        'const m=KM_MODELS.find(x=>x.id===kmId)||KM_MODELS[0];',
        'const m=KM_MODELS.find(x=>x.id===kmId)||KM_MODELS[0];\n      if(typeof kmIsCorp==="function" && kmIsCorp(kmVin) && typeof calcFleet==="function") return calcFleet(m);',
        1
    )
    html = html.replace(
        '${r.invoice?` <span class="st inv">Спец инвойс</span>`:""}${r.mpt?` <span class="st mpt">МПТ</span>`:""}${r.demo?` <span class="st demo">ДЕМО</span>`:""}',
        '${r.invoice?` <span class="st inv">Спец инвойс</span>`:""}${r.mpt?` <span class="st mpt">МПТ</span>`:""}${r.demo?` <span class="st demo">ДЕМО</span>`:""}${(r.corp|| (typeof CORP_VINS!=="undefined"&&CORP_VINS.has(r.vin)))?` <span class="st corp">Корпоративный · лизинг</span>`:""}'
    )
    html = html.replace(
        '${c.mpt?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}',
        '${c.mpt?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}${(c.corp|| (typeof kmIsCorp==="function"&&kmIsCorp(c.vin)))?`<span class="mpt-tag corp-tag">Корпоративный · кредит нельзя · BFS лизинг</span>`:""}'
    )
    extra_css = """
.st.demo{background:#fff3e0;color:#e65100;border:1px solid #ffcc80}
.st.corp{background:#ede7f6;color:#4527a0}
.corp-tag{color:#4527a0}
.stock-car.corp{border-color:#673ab7;background:#f3e5f5}
"""
    if ".st.corp{" not in html:
        html = html.replace("</style>", extra_css + "\n</style>", 1)
    html = html.replace(
        '["kmRrc","kmInv","kmUseTi"',
        '["kmRrc","kmInv","kmUseTi","kmFleetDisc","kmFleetMpt"'
    )
    if block:
        html2, n = re.subn(
            r"(?:    function fleetPayRows\([^)]*\)\{[\s\S]*?\n    \}\n)*    function fleetCreditBox\([\s\S]*?    function calcFleet\(m\)\{[\s\S]*?\n    \}\n",
            block if block.startswith("    ") else "    " + block,
            html,
            count=1,
        )
        if n:
            html = html2
            print(p, "fleet credit compare spliced", n)
        else:
            print(p, "fleet compare splice skipped")
    p.write_text(html)
    print("fleet patched", p)
