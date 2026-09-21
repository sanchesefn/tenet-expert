from pathlib import Path
import json, re

DEMO_VINS = {"EDXGD34B2TE109064", "EDXGB32B0TE110108"}

def drop(stock):
    if not isinstance(stock, list):
        return stock, 0
    keep = [x for x in stock if str(x.get("vin") or "") not in DEMO_VINS and not x.get("demo")]
    return keep, len(stock) - len(keep)

def strip_json(path: Path):
    if not path.exists():
        return
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, dict) and "cars" in payload:
        cars, n = drop(payload.get("cars") or [])
        if n:
            payload["cars"] = cars
            path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        print(path, "dropped", n, "kept", len(cars))
    elif isinstance(payload, list):
        cars, n = drop(payload)
        if n:
            path.write_text(json.dumps(cars, ensure_ascii=False), encoding="utf-8")
        print(path, "dropped", n, "kept", len(cars))

def inject_helper(html: str) -> str:
    if "function stockIsDemo(" in html:
        return html
    helper = '''    function stockIsDemo(c){
      if(!c) return false;
      if(c.demo) return true;
      const v=String(c.vin||"").toUpperCase();
      return v==="EDXGD34B2TE109064" || v==="EDXGB32B0TE110108";
    }
'''
    needle = "    function kmIsCorp(vin){"
    i = html.find(needle)
    if i >= 0:
        j = html.find("    function fleetOf(", i)
        if j > i:
            return html[:j] + helper + html[j:]
    needle2 = "    function stockBadges(r){"
    k = html.find(needle2)
    if k >= 0:
        return html[:k] + helper + html[k:]
    return html

def fix_stock_fn(html: str) -> str:
    old = '''      const list=STOCK.filter(x=>{
        if(stockFilter!=="all" && x.model!==stockFilter) return false;
        if(stockStatus!=="all" && x.status!==stockStatus) return false;
        return true;
      });
      const scoped=stockFilter==="all"?STOCK:STOCK.filter(x=>x.model===stockFilter);'''
    new = '''      const sale=(typeof STOCK!=="undefined"?STOCK:[]).filter(x=>typeof stockIsDemo==="function"?!stockIsDemo(x):!x.demo);
      const list=sale.filter(x=>{
        if(stockFilter!=="all" && x.model!==stockFilter) return false;
        if(stockStatus!=="all" && x.status!==stockStatus) return false;
        return true;
      });
      const scoped=stockFilter==="all"?sale:sale.filter(x=>x.model===stockFilter);'''
    if old in html:
        html = html.replace(old, new)
    old_km = '''    function kmStockCars(m){
      const list=typeof STOCK!=="undefined"?STOCK:[];
      return list.filter(c=>c.model===m.stock && kmTrimFit(m,c));
    }'''
    new_km = '''    function kmStockCars(m){
      const list=typeof STOCK!=="undefined"?STOCK:[];
      return list.filter(c=>!(typeof stockIsDemo==="function"?stockIsDemo(c):c.demo) && c.model===m.stock && kmTrimFit(m,c));
    }'''
    if old_km in html:
        html = html.replace(old_km, new_km)
    old_prio = "return list.filter(c=>PRIO_VINS.has(c.vin) && c.vin!==kmVin).map(c=>{"
    new_prio = "return list.filter(c=>PRIO_VINS.has(c.vin) && c.vin!==kmVin && !(typeof stockIsDemo===\"function\"?stockIsDemo(c):c.demo)).map(c=>{"
    if old_prio in html:
        html = html.replace(old_prio, new_prio)
    return html

changed_json = 0
for name in ("stock.json", "stock-part1.json", "stock-part2.json"):
    p = Path(name)
    if p.exists():
        strip_json(p)

broken = """    const KM_BANK_MONTHS = {
      sber:[12,24,36,48,60,72,84,96,108,120],
      sovcom:[12,24,36,48,60,72,84],
      alfa:[12,24,36,48,60,72,84,96],
      tbank:[12,24,36,48,60,72,84,96]
    ];"""
fixed = broken[:-2] + "}"

for html_path in (Path("index.html"), Path("_site/index.html"), Path("TENET_T4L_netlify/index.html")):
    if not html_path.exists() or html_path.stat().st_size < 1000:
        print("skip", html_path)
        continue
    html = html_path.read_text(encoding="utf-8")
    if broken in html:
        html = html.replace(broken, fixed)
        print("fixed KM_BANK_MONTHS closer")
    elif "const KM_BANK_MONTHS = {" in html and re.search(r"const KM_BANK_MONTHS = \{[^}]+\];", html):
        html = re.sub(r"(const KM_BANK_MONTHS = \{[^}]+)\];", r"\1};", html, count=1)
        print("fixed KM_BANK_MONTHS closer via regex")
    m = re.search(r"const STOCK = (\[.*?\]);", html, re.S)
    n = 0
    if m:
        stock = json.loads(m.group(1))
        stock, n = drop(stock)
        html = html[:m.start(1)] + json.dumps(stock, ensure_ascii=False) + html[m.end(1):]
    html = inject_helper(html)
    html = fix_stock_fn(html)
    html_path.write_text(html, encoding="utf-8")
    print("html demo dropped", n, html_path, "sale", "stockIsDemo" in html)
