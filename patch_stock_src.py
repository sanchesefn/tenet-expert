from pathlib import Path
import json, re

cars = []
upd = ""
for name in ("stock-part1.json", "stock-part2.json", "stock.json"):
    p = Path(name)
    if not p.exists():
        continue
    payload = json.loads(p.read_text())
    if payload.get("updated"):
        upd = payload["updated"]
    cars.extend(payload.get("cars") or [])

seen = set()
uniq = []
for c in cars:
    vin = c.get("vin")
    if not vin or vin in seen:
        continue
    seen.add(vin)
    uniq.append(c)

DEMO_VINS={"EDXGD34B2TE109064","EDXGB32B0TE110108"}
for c in uniq:
    c["demo"] = c.get("vin") in DEMO_VINS
if len(uniq) < 40:
    print("skip stock inject, only", len(uniq), "cars")
    raise SystemExit(0)

html_path = Path("_site/index.html")
if not html_path.exists():
    print("no _site/index.html")
    raise SystemExit(0)

html = html_path.read_text()
if upd:
    html = re.sub(
        r"const STOCK_META = \{.*?\};",
        "const STOCK_META = {updated:%s, dealer:\"ООО «ЭКСПЕРТ АВТО САМАРА»\"};" % json.dumps(upd, ensure_ascii=False),
        html,
        count=1,
    )
m = re.search(r"const STOCK = (\[.*?\]);", html, re.S)
if not m:
    print("STOCK array not found")
    raise SystemExit(1)
html = html[: m.start(1)] + json.dumps(uniq, ensure_ascii=False) + html[m.end(1) :]
html_path.write_text(html)
print("patched _site STOCK", len(uniq), "updated", upd)
