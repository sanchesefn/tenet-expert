from pathlib import Path
import json, re

sj = Path("stock.json")
html_path = Path("_site/index.html")
if not sj.exists() or not html_path.exists():
    raise SystemExit(0)

payload = json.loads(sj.read_text())
cars = payload.get("cars", payload)
upd = payload.get("updated") or ""
html = html_path.read_text()

if upd:
    html, nmeta = re.subn(
        r"const STOCK_META = \{.*?\};",
        "const STOCK_META = {updated:%s, dealer:\"ООО «ЭКСПЕРТ АВТО САМАРА»\"};" % json.dumps(upd, ensure_ascii=False),
        html,
        count=1,
    )
    print("STOCK_META", nmeta, upd)

m = re.search(r"const STOCK = (\[.*?\]);", html, re.S)
if not m:
    print("STOCK array not found")
    raise SystemExit(1)
html = html[: m.start(1)] + json.dumps(cars, ensure_ascii=False) + html[m.end(1) :]
html_path.write_text(html)
print("patched _site STOCK", len(cars))
