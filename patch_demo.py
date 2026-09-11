from pathlib import Path
import json, re

DEMO_VINS = {"EDXGD34B2TE109064", "EDXGB32B0TE110108"}

def apply(stock):
    n = 0
    for x in stock:
        want = x.get("vin") in DEMO_VINS
        if bool(x.get("demo")) != want:
            n += 1
        x["demo"] = want
    return n

changed = 0
sj = Path("stock.json")
if sj.exists():
    payload = json.loads(sj.read_text())
    cars = payload.get("cars", payload)
    if isinstance(cars, list):
        changed += apply(cars)
        if isinstance(payload, dict) and "cars" in payload:
            payload["cars"] = cars
            sj.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        print("stock.json demo applied", changed)

html_path = Path("_site/index.html")
if not html_path.exists():
    html_path = Path("TENET_T4L_netlify/index.html")
if html_path.exists():
    html = html_path.read_text()
    m = re.search(r"const STOCK = (\[.*?\]);", html, re.S)
    if m:
        stock = json.loads(m.group(1))
        n = apply(stock)
        html = html[:m.start(1)] + json.dumps(stock, ensure_ascii=False) + html[m.end(1):]
        html_path.write_text(html)
        print("html demo applied", n, "of", len(stock), html_path)
    else:
        print("STOCK not found in", html_path)
else:
    print("no html to patch")
