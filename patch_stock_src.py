from pathlib import Path
import json, re, urllib.request

cars = []
upd = ""

def add_payload(payload):
    global upd, cars
    if not isinstance(payload, dict):
        return
    if payload.get("updated"):
        upd = payload["updated"]
    cars.extend(payload.get("cars") or [])

for name in ("stock-part1.json", "stock-part2.json", "stock.json"):
    p = Path(name)
    if not p.exists():
        continue
    try:
        payload = json.loads(p.read_text())
    except Exception:
        continue
    add_payload(payload)

if len({c.get("vin") for c in cars if c.get("vin")}) < 40:
    try:
        from urllib.parse import urlencode
        req = urllib.request.Request(
            "https://rentry.co/api/fetch/r9747p7v",
            data=urlencode({"edit_code": "KLRBcuns"}).encode(),
            method="POST",
            headers={"User-Agent": "tenet-expert-stock"},
        )
        with urllib.request.urlopen(req, timeout=20) as r:
            body = json.loads(r.read().decode("utf-8"))
        text = (body.get("content") or {}).get("text") or ""
        add_payload(json.loads(text))
        print("stock fetched from rentry", len(cars))
    except Exception as e:
        print("rentry stock fetch fail", e)

seen = set()
uniq = []
for c in cars:
    vin = c.get("vin")
    if not vin or vin in seen:
        continue
    seen.add(vin)
    uniq.append(c)

DEMO_VINS = {"EDXGD34B2TE109064", "EDXGB32B0TE110108"}
uniq = [c for c in uniq if c.get("vin") not in DEMO_VINS and not c.get("demo")]

def classify_t9(car):
    vin = str(car.get("vin") or "").upper()
    t = str(car.get("trim") or "").lower()
    if vin.startswith("EDEHD24"):
        car["model"] = "tt9"
        car["name"] = "T9"
        car["invoice"] = False
        rrc = car.get("rrc")
        if not rrc or rrc in (4335000, 4640000, 4710000):
            car["rrc"] = 3949000 if "прайм" in t else 4299000
        return car
    if vin.startswith("EDEDD24") or str(car.get("model") or "") == "t9":
        car["model"] = "t9"
        if str(car.get("name") or "") in ("T9", "t9", "TT9", "tt9") or not car.get("name"):
            car["name"] = "Tiggo 9"
    return car

uniq = [classify_t9(c) for c in uniq]

if len(uniq) < 40:
    print("skip stock inject, only", len(uniq), "cars")
    raise SystemExit(0)

targets = [p for p in (Path("_site/index.html"), Path("index.html")) if p.exists()]
if not targets:
    print("no index.html to patch")
    raise SystemExit(0)

for html_path in targets:
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
        print("STOCK array not found in", html_path)
        raise SystemExit(1)
    html = html[: m.start(1)] + json.dumps(uniq, ensure_ascii=False) + html[m.end(1) :]
    html_path.write_text(html)
    print("patched", html_path, "STOCK", len(uniq), "updated", upd)
