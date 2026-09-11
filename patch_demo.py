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
    broken = """    const KM_BANK_MONTHS = {
      sber:[12,24,36,48,60,72,84,96,108,120],
      sovcom:[12,24,36,48,60,72,84],
      alfa:[12,24,36,48,60,72,84,96],
      tbank:[12,24,36,48,60,72,84,96]
    ];"""
    fixed = broken[:-2] + "}"
    if broken in html:
        html = html.replace(broken, fixed)
        print("fixed KM_BANK_MONTHS closer")
    elif "const KM_BANK_MONTHS = {" in html and re.search(r"const KM_BANK_MONTHS = \{[^}]+\];", html):
        html = re.sub(r"(const KM_BANK_MONTHS = \{[^}]+)\];", r"\1};", html, count=1)
        print("fixed KM_BANK_MONTHS closer via regex")
    m = re.search(r"const STOCK = (\[.*?\]);", html, re.S)
    if m:
        stock = json.loads(m.group(1))
        n = apply(stock)
        html = html[:m.start(1)] + json.dumps(stock, ensure_ascii=False) + html[m.end(1):]
        print("html demo applied", n, "of", len(stock), html_path)
    else:
        print("STOCK not found in", html_path)
    html_path.write_text(html)
else:
    print("no html to patch")
