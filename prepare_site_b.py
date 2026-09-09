MPT_VINS={"EDXFB32B2TE041658","EDXFB32B4TE041659","EDXFB32B7TE062327","EDXFD32B3TE070113","EDXFB32B3TE091114","EDXFB32B1TE087336","EDXFD32B4TE092590","EDXFD32B4TE092587"}
m=re.search(r"const STOCK = (\[.*?\]);\s*\n\s*const ST_LABEL", html, re.S)
if not m:
    m=re.search(r"const STOCK = (\[.*?\]);", html, re.S)
if m:
    stock=json.loads(m.group(1))
    for x in stock:
        x["mpt"]=x.get("vin") in MPT_VINS
        salon=str(x.get("salon") or "")
        if "коричнево" in salon.lower().replace("ё","е"):
            x["salon"]="Brown"
        if x.get("vin")=="EDEEB31B8TE003261":
            x["model"]="t4"
            x["name"]="T4"
    if not any(x.get("vin")=="EDEDB21B7SD723791" for x in stock):
        stock.append({"vin":"EDEDB21B7SD723791","model":"t7l","name":"Tiggo 7 L","trim":"Актив","color":"Серебристый","status":"in","note":"В салоне · с 06.08.2026","invoice":False,"salon":"","prod":"","rrc":None,"mpt":False})
    html=html[:m.start(1)]+json.dumps(stock, ensure_ascii=False)+html[m.end(1):]
    print("stock patched", sum(1 for x in stock if x.get("mpt")), "mpt", len(stock), "cars")

if 't7l:' not in html:
    html=html.replace(
        'a8:  {id:"a8", brand:"CHERY", name:"Arrizo 8"',
        't7l: {id:"t7l", brand:"CHERY", name:"Tiggo 7 L", rivals:"Jolion, X70, Dashing", examN:0, img:"cars/t9.jpg"},\n      a8:  {id:"a8", brand:"CHERY", name:"Arrizo 8"'
    )
if 'id:"t4"' not in html:
    html=html.replace(
        't4l: {id:"t4l", brand:"TENET", name:"T4L"',
        't4:  {id:"t4", brand:"TENET", name:"T4", rivals:"", examN:0, img:"cars/t4l.jpg"},\n      t4l: {id:"t4l", brand:"TENET", name:"T4L"'
    )
html=html.replace('Object.values(MODELS)', 'Object.values(MODELS).filter(x=>x.id!="t7l" and False)')
