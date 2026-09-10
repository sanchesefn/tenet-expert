MPT_VINS={"EDXFB32B2TE041658","EDXFB32B4TE041659","EDXFB32B7TE062327","EDXFD32B3TE070113","EDXFB32B3TE091114","EDXFB32B1TE087336","EDXFD32B4TE092590","EDXFD32B4TE092587"}
m=re.search(r"const STOCK = (\[.*?\]);\s*\n\s*const ST_LABEL", html, re.S)
if not m:
    m=re.search(r"const STOCK = (\[.*?\]);", html, re.S)
if m:
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
html=html.replace('Object.values(MODELS)', 'Object.values(MODELS).filter(x=>x.id!=="t7l"&&x.id!=="t4")')
html=html.replace(
    '<p style="color:var(--muted);font-size:13px">Облако рейтинга: ${syncOk?"онлайн, все видят одни результаты":"пока не отвечает — нажмите обновить"}. <button class="btn ghost" id="syncNow">Обновить</button></p>',
    ''
)
html=html.replace(
    '${r.invoice?` <span class="st inv">Спец инвойс</span>`:""}</td>',
    '${r.invoice?` <span class="st inv">Спец инвойс</span>`:""}${r.mpt?` <span class="st mpt">МПТ</span>`:""}</td>'
)
if ".st.mpt{" not in html:
    html=html.replace("</style>", ".st.mpt{background:#cfe8d1;color:#1b5e20;}\n</style>", 1)
if ".stock-car.mpt{" not in html:
    html=html.replace("</style>", ".stock-car.mpt{border-color:#2e7d32;background:#e8f5e9}.mpt-tag{display:block;color:#1b5e20;font-weight:700;font-size:12px;margin:4px 0 2px}\n</style>", 1)

html=html.replace(
    '["terms","₽","Торговые условия","Прайс 01.09.2026, трейд-ин и кредит T7"]',
    '["terms","₽","Торговые условия","Доходность, бонусы, МПТ, спец инвойс, приоритет"]'
)
html=html.replace(
    '["calc","%","Калькулятор","Ежемесячный платёж с выбранной комплектации"]',
    '["calc","%","Калькулятор","Платёж и калькулятор КМ от 10.09"]'
)
if "let calcMode" not in html:
    html=html.replace(
        'let stockStatus = "all";',
        'let stockStatus = "all";\n    let calcMode = "pay";\n    let kmId = "t4lp";\n    let kmShown = "";\n    let kmVin = "";'
    )
if "let kmVin" not in html:
    html=html.replace(
        'let kmShown = "";',
        'let kmShown = "";\n    let kmVin = "";'
    )
if "let mptDay" not in html:
    html=html.replace(
        'let kmVin = "";',
        'let kmVin = "";\n    let mptMonth = 3;\n    let mptDay = "";'
    )
if 'if(model==="t7l")' not in html:
    html=html.replace(
        'let stockStatus = "all";',
        'let stockStatus = "all";\n    if(model==="t7l") model="t7";'
    )

tc = Path("terms-calc-fn.js")
if tc.exists():
    extra = tc.read_text()
    if not extra.endswith("\n"):
        extra += "\n"
    a = html.find("    function terms(){")
    b = html.find("    function stock(){")
    if a >= 0 and b > a:
        html = html[:a] + extra + html[b:]
        print("terms-calc spliced", len(extra))
    else:
        print("terms/stock anchors not found", a, b)

sf = Path("stock-fn.js")
if sf.exists():
    extra = sf.read_text()
    if not extra.endswith("\n"):
        extra += "\n"
    a = html.find("    function salonLabel(")
    if a < 0:
        a = html.find("    function stock(){")
    b = html.find("    function docs(){")
    if a >= 0 and b > a:
        html = html[:a] + extra + html[b:]
        print("stock fn spliced", len(extra))
    else:
        print("stock/docs anchors not found", a, b)

BIND_IDS = '["kmRrc","kmInv","kmUseTi","kmUseLoan","kmUseCr","kmSpec","kmUseDcTi","kmUseDcCr","kmDcTi","kmDcCr","kmDo","kmPack","kmCasco","cDown","cDownPct","cDownMode","cMonths"]'
NEW_BIND = '''      document.querySelectorAll("[data-calc-mode]").forEach(b=>b.onclick=()=>{ calcMode=b.dataset.calcMode; view="calc"; render(); });
      document.querySelectorAll("[data-km-id]").forEach(b=>b.onclick=()=>{ kmId=b.dataset.kmId; kmShown=""; kmVin=""; view="calc"; render(); });
      document.querySelectorAll("[data-down-mode]").forEach(b=>b.onclick=()=>{
        const el=document.getElementById("cDownMode");
        if(el) el.value=b.dataset.downMode||"pct";
        view="calc"; render();
      });
      document.querySelectorAll("[data-km-vin]").forEach(b=>b.onclick=()=>{
        const vin=b.dataset.kmVin||"";
        kmVin=vin;
        const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===vin);
        if(car && typeof kmIdFromCar==="function"){
          const nid=kmIdFromCar(car);
          if(nid && nid!==kmId){ kmId=nid; kmShown=""; }
        }
        view="calc"; render();
      });
      ''' + BIND_IDS + '''.forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.addEventListener("change", ()=>{ view="calc"; render(); });
      });
'''
if 'querySelectorAll("[data-km-id]")' not in html:
    for needle in (
        '      const cPreset=document.getElementById("cPreset");',
        '      document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{',
    ):
        if needle in html:
            html = html.replace(needle, NEW_BIND + needle, 1)
            print("calc bind inserted")
            break
    else:
        print("calc bind not found")
else:
    print("calc bind already in html")
if 'querySelectorAll("[data-mpt-day]")' not in html:
    html=html.replace(
        'document.querySelectorAll("[data-km-id]")',
        'document.querySelectorAll("[data-mpt-day]").forEach(b=>b.onclick=()=>{ mptDay=b.dataset.mptDay||""; view="terms"; render(); });\n      document.querySelectorAll("[data-mpt-month]").forEach(b=>b.onclick=()=>{ mptMonth=Number(b.dataset.mptMonth)||3; view="terms"; render(); });\n      document.querySelectorAll("[data-km-id]")',
        1
    )

html=html.replace(
    '{model:"T4",vin:"EDEED31B1SE053704",trim:"Prime 4WD",year:"2025",color:"Белый",extra:"Сидоров",pay:500,bonus:1000}',
    '{model:"T4",vin:"EDEED31B1SE053704",trim:"Prime 4WD",year:"2025",color:"Белый",extra:"",seller:"Сидоров",sold:true,pay:500,bonus:1000}'
)
html=html.replace(
    '{model:"Tiggo 9",vin:"EDEDD24B1SG002595",trim:"Ultra",year:"2025",color:"Чёрный",extra:"Новиков",pay:500,bonus:0}',
    '{model:"Tiggo 9",vin:"EDEDD24B1SG002595",trim:"Ultra",year:"2025",color:"Чёрный",extra:"",seller:"Новиков",sold:true,pay:500,bonus:0}'
)
html=html.replace('      {model:"T4",trim:"T4 2025",km:"−30 / 20",note:""},\n','')
html=html.replace('      {model:"T4",trim:"T4 2025",bonus:"3%"},\n','')
html=html.replace(
    '`<div class="terms-cards">`+TERMS_MPT.map(g=>`<article class="term-card"><b>${escape(g.line)}</b>`+g.rows.map(r=>`<small>${escape(r[0])} · <b>${escape(r[1])}</b></small>`).join("")+`</article>`).join("")+`</div>`+',
    '`<p class="lead">По дате производства T7. Зелёный — МПТ, песочный — субсидия бренда. Нажмите день.</p>`+mptCal()+'
)
html=html.replace(
    "      persistRun(true);\n      next(); closing=false;",
    "      if(idx+1>=paper.length){ finish(); return; }\n      persistRun(true);\n      next(); closing=false;"
)
html=html.replace(
    "answers[idx]={id:q.id,ok:false,cat:q.cat,p:q.p,x:q.x};",
    "answers[idx]={id:q.id,ok:false,cat:q.cat,p:q.p,x:q.x,pick:(selected||[]).map(id=>((q.o||[]).find(p=>p[0]===id)||[id,\"не выбран\"])[1])};"
)
html=html.replace(
    "answers[idx]={id:q.id,ok:!!ok,cat:q.cat,p:q.p,x:q.x};",
    "answers[idx]={id:q.id,ok:!!ok,cat:q.cat,p:q.p,x:q.x,pick:(selected||[]).map(id=>((q.o||[]).find(p=>p[0]===id)||[id,id])[1])};"
)
html=html.replace(
    "missed=rows.filter(r=>!r.ok).map(r=>({id:r.id,p:r.p,x:r.x}));",
    "missed=rows.filter(r=>!r.ok).map(r=>({id:r.id,p:r.p,x:r.x,pick:r.pick||[]}));"
)
html=html.replace(
    "missed.map(x=>`<div class=\"card\" style=\"margin:8px 0\"><b>${escape(x.p)}</b><p>${escape(x.x)}</p></div>`).join(\"\")",
    "missed.map(x=>`<div class=\"card\" style=\"margin:8px 0\"><b>${escape(x.p)}</b><p style=\"margin:8px 0 0\"><span class=\"eyebrow\">Ответ</span><br>${escape((x.pick&&x.pick.length?x.pick.join(\"; \"):\"не выбран\"))}</p><p>${escape(x.x)}</p></div>`).join(\"\")"
)

Path("_site").mkdir(exist_ok=True)
Path("_site/index.html").write_text(html)
Path("_site/pins.json").write_text(json.dumps(pins, ensure_ascii=False))
print("wrote site", len(html))
