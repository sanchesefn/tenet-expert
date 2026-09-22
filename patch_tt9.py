#!/usr/bin/env python3
"""Split TENET T9 vs CHERY Tiggo 9 on stock; TENET T9 is not спец инвойс."""
from pathlib import Path
import json, re

TT9_VIN = "EDEHD24"
T9_VIN = "EDEDD24"
TT9_RRC = {True: 3949000, False: 4299000}  # prime / ultra
TIGGO_PRICES = {4335000, 4640000, 4710000}


def is_tenet_t9(car):
    vin = str(car.get("vin") or "").upper()
    return vin.startswith(TT9_VIN)


def classify_car(car):
    if not isinstance(car, dict):
        return car
    vin = str(car.get("vin") or "").upper()
    t = str(car.get("trim") or "").lower()
    prime = "прайм" in t
    if vin.startswith(TT9_VIN):
        car["model"] = "tt9"
        car["name"] = "T9"
        car["invoice"] = False
        rrc = car.get("rrc")
        if not rrc or rrc in TIGGO_PRICES:
            car["rrc"] = TT9_RRC[prime]
        return car
    if vin.startswith(T9_VIN) or str(car.get("model") or "") == "t9":
        car["model"] = "t9"
        if str(car.get("name") or "") in ("T9", "t9", "TT9", "tt9"):
            car["name"] = "Tiggo 9"
        elif not car.get("name"):
            car["name"] = "Tiggo 9"
        return car
    return car


def patch_stock_array(html):
    m = re.search(r"const STOCK = (\[.*?\]);", html, re.S)
    if not m:
        return html, 0
    cars = json.loads(m.group(1))
    n = 0
    for c in cars:
        before = (c.get("model"), c.get("name"), bool(c.get("invoice")))
        classify_car(c)
        after = (c.get("model"), c.get("name"), bool(c.get("invoice")))
        if before != after:
            n += 1
    return html[: m.start(1)] + json.dumps(cars, ensure_ascii=False) + html[m.end(1) :], n


def patch_json_file(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    cars = data.get("cars") if isinstance(data, dict) else data
    if not isinstance(cars, list):
        return 0
    n = 0
    for c in cars:
        before = (c.get("model"), c.get("name"), bool(c.get("invoice")))
        classify_car(c)
        after = (c.get("model"), c.get("name"), bool(c.get("invoice")))
        if before != after:
            n += 1
    if isinstance(data, dict):
        data["cars"] = cars
        path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    else:
        path.write_text(json.dumps(cars, ensure_ascii=False), encoding="utf-8")
    return n


def patch_html(html):
    html, nstock = patch_stock_array(html)

    if not re.search(r'\btt9:\s*\{id:"tt9"', html):
        html = html.replace(
            't9:  {id:"t9", brand:"CHERY", name:"Tiggo 9"',
            'tt9: {id:"tt9", brand:"TENET", name:"T9", rivals:"", examN:0, img:"cars/t9.jpg"},\n      t9:  {id:"t9", brand:"CHERY", name:"Tiggo 9"',
            1,
        )

    html = html.replace(
        '{model:"t9", brand:"TENET", name:"T9 Прайм 5 мест"',
        '{model:"tt9", brand:"TENET", name:"T9 Прайм 5 мест"',
    )
    html = html.replace(
        '{model:"t9", brand:"TENET", name:"T9 Ультра 5 мест"',
        '{model:"tt9", brand:"TENET", name:"T9 Ультра 5 мест"',
    )

    html = html.replace(
        'const modelOrder=["t4","t4l","t7","t8","t9","t7l","a8"];',
        'const modelOrder=["t4","t4l","t7","t8","tt9","t9","t7l","a8"];',
    )

    old_km = '      if(car.model==="t9") return t.includes("прайм")?"t9p":"t9u";'
    new_km = (
        '      if(car.model==="tt9" || String(car.vin||"").toUpperCase().indexOf("EDEHD24")===0) return t.includes("прайм")?"tt9p":"tt9u";\n'
        '      if(car.model==="t9") return t.includes("прайм")?"t9p":"t9u";'
    )
    if 'car.model==="tt9"' not in html:
        html = html.replace(old_km, new_km)

    if 'id==="tt9p"' not in html:
        html = html.replace(
            '      if(id==="t9p") return t.includes("прайм");',
            '      if(id==="tt9p") return t.includes("прайм");\n      if(id==="tt9u") return t.includes("ультра");\n      if(id==="t9p") return t.includes("прайм");',
        )

    html = html.replace(
        '}else if(m==="t9") id=t.includes("прайм")?"t9p":"t9u";',
        '}else if(m==="tt9") id=t.includes("прайм")?"tt9p":"tt9u";\n        else if(m==="t9") id=t.includes("прайм")?"t9p":"t9u";',
    )

    html = html.replace(
        "t8u4:3885000,t9p:4335000,t9u:4640000,",
        "t8u4:3885000,tt9p:3949000,tt9u:4299000,t9p:4335000,t9u:4640000,",
    )

    html = html.replace(
        'x.id!=="t7l"&&x.id!=="t4")',
        'x.id!=="t7l"&&x.id!=="t4"&&x.id!=="tt9")',
    )

    if 'if(m==="tt9")' not in html:
        html = html.replace(
            '      if(m==="t9") return t.indexOf("ультра")>=0?"t9u":"t9p";',
            '      if(m==="tt9") return t.indexOf("ультра")>=0?"tt9u":"tt9p";\n      if(m==="t9") return t.indexOf("ультра")>=0?"t9u":"t9p";',
        )

    if '["EDEHD24","tt9"]' not in html:
        html = html.replace(
            '["EDEDD24","t9"],',
            '["EDEHD24","tt9"],["EDEDD24","t9"],',
        )
    if 'if(id==="tt9") return "TENET T9";' not in html and "if(id===\"tt9\")" not in html:
        html = html.replace(
            'if(id==="t9") return "CHERY Tiggo 9";',
            'if(id==="tt9") return "TENET T9";\n      if(id==="t9") return "CHERY Tiggo 9";',
        )

    return html, nstock


def main():
    for name in ("stock.json", "stock-part1.json", "stock-part2.json"):
        p = Path(name)
        if p.exists():
            n = patch_json_file(p)
            print("json", name, "changed", n)

    for p in (Path("index.html"), Path("_site/index.html")):
        if not p.exists() or p.stat().st_size < 1000:
            print("skip", p)
            continue
        html = p.read_text(encoding="utf-8")
        html2, nstock = patch_html(html)
        p.write_text(html2, encoding="utf-8")
        print(
            "patched",
            p,
            "stock-rows",
            nstock,
            "tt9",
            'id:"tt9"' in html2 or "tt9:" in html2,
            "modelOrder",
            "tt9" in html2 and 'modelOrder=["t4","t4l","t7","t8","tt9"' in html2,
        )


if __name__ == "__main__":
    main()
