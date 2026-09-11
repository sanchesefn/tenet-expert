MPT_VINS={"EDXFB32B2TE041658","EDXFB32B4TE041659","EDXFB32B7TE062327","EDXFD32B3TE070113","EDXFB32B3TE091114","EDXFB32B1TE087336","EDXFD32B4TE092590","EDXFD32B4TE092587"}
sj=Path("stock.json")
m=re.search(r"const STOCK = (\[.*?\]);\s*\n\s*const ST_LABEL", html, re.S)
if not m:
    m=re.search(r"const STOCK = (\[.*?\]);", html, re.S)
if m:
    if sj.exists():
        payload=json.loads(sj.read_text())
        stock=payload.get("cars", payload)
        upd=payload.get("updated") or ""
        if upd:
            html=re.sub(r"const STOCK_META = \{.*?\};", "const STOCK_META = {updated:%s, dealer:\"ООО «ЭКСПЕРТ АВТО САМАРА»\"};" % json.dumps(upd, ensure_ascii=False), html, count=1)
            print("stock.json loaded", len(stock), "updated", upd)
    else:
        stock=json.loads(m.group(1))
    for x in stock:
        x["mpt"]=x.get("vin") in MPT_VINS
        salon=str(x.get("salon") or "")
        if "коричнев" in salon.lower().replace("ё","е"):
            x["salon"]="Brown"
        if x.get("vin")=="EDEEB31B8TE003261":
            x["model"]="t4"
            x["name"]="T4"
        t=str(x.get("trim") or "").lower()
        mid=str(x.get("model") or "")
        rrc=None
        if mid=="t4": rrc=2449000
        elif mid=="t4l": rrc=2479000 if "прайм" in t else 2329000
        elif mid=="t7":
            if "4wd" in t and "прайм" in t: rrc=3190000
            elif "4wd" in t: rrc=2990000
            elif "прайм" in t: rrc=2985000
            else: rrc=2785000
        elif mid=="t8":
            if "ультра" in t: rrc=3885000
            elif "4wd" in t: rrc=3630000
            elif "прайм" in t: rrc=3299000
            else: rrc=3099000
        elif mid=="t9": rrc=4335000 if "прайм" in t else 4640000
        elif mid=="a8":
            if "ультра" in t: rrc=3275000
            elif "актив" in t: rrc=2865000
            else: rrc=3060000
        elif mid=="t7l": rrc=2735000
        if rrc: x["rrc"]=rrc
    if not any(x.get("vin")=="EDEDB21B7SD723791" for x in stock):
        stock.append({"vin":"EDEDB21B7SD723791","model":"t7l","name":"Tiggo 7 L","trim":"Актив","color":"Серебристый","status":"in","note":"В салоне · с 06.08.2026","invoice":False,"salon":"","prod":"","rrc":2735000,"mpt":False})
    html=html[:m.start(1)]+json.dumps(stock, ensure_ascii=False)+html[m.end(1):]
    print("stock patched", sum(1 for x in stock if x.get("mpt")), "mpt", len(stock), "cars")
