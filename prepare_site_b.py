DEMO_VINS={"EDXGD34B2TE109064","EDXGB32B0TE110108"}
MPT_VINS={"EDXFB32B2TE041658","EDXFB32B4TE041659","EDXFB32B7TE062327","EDXFD32B3TE070113","EDXFB32B3TE091114","EDXFB32B1TE087336","EDXFD32B4TE092590","EDXFD32B4TE092587"}
m=re.search(r"const STOCK = (\[.*?\]);\s*\n\s*const ST_LABEL", html, re.S)
if not m:
    m=re.search(r"const STOCK = (\[.*?\]);", html, re.S)
if m:
    stock=json.loads(m.group(1))
    stock=[x for x in stock if str(x.get("vin") or "") not in DEMO_VINS and not x.get("demo")]
    for x in stock:
        x["mpt"]=x.get("vin") in MPT_VINS
        _vin=str(x.get("vin") or "").upper()
        _t=str(x.get("trim") or "").lower()
        _mid=str(x.get("model") or "")
        if x.get("invoice"):
            x["mpt"]=False
            x["corp"]=False
        elif _vin.startswith("EDXGB32B") or (_mid=="t8" and "4wd" not in _t and "ультра" not in _t and "7 мест" not in _t):
            x["mpt"]=True
            x["corp"]=True
        salon=str(x.get("salon") or "")
        if "коричнев" in salon.lower().replace("ё","е"):
            x["salon"]="Brown"
        if x.get("vin")=="EDEEB31B8TE003261":
            x["model"]="t4"
            x["name"]="T4"
        _vinu=str(x.get("vin") or "").upper()
        if _vinu.startswith("EDEHD24"):
            x["model"]="tt9"
            x["name"]="T9"
            x["invoice"]=False
        elif _vinu.startswith("EDEDD24") or str(x.get("model") or "")=="t9":
            x["model"]="t9"
            if str(x.get("name") or "") in ("T9","t9","TT9","tt9") or not x.get("name"):
                x["name"]="Tiggo 9"
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
        elif mid=="tt9": rrc=3949000 if "прайм" in t else 4299000
        elif mid=="t9": rrc=x.get("rrc") or (4335000 if "прайм" in t else 4640000)
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
if not re.search(r'\btt9:\s*\{id:"tt9"', html):
    html=html.replace(
        't9:  {id:"t9", brand:"CHERY", name:"Tiggo 9"',
        'tt9: {id:"tt9", brand:"TENET", name:"T9", rivals:"", examN:0, img:"cars/t9.jpg"},\n      t9:  {id:"t9", brand:"CHERY", name:"Tiggo 9"'
    )
html=html.replace('Object.values(MODELS)', 'Object.values(MODELS).filter(x=>x.id!=="t7l"&&x.id!=="t4"&&x.id!=="tt9")')
html=html.replace('x.id!=="t7l"&&x.id!=="t4")', 'x.id!=="t7l"&&x.id!=="t4"&&x.id!=="tt9")')
html=html.replace(
    '<p style="color:var(--muted);font-size:13px">Облако рейтинга: ${syncOk?"онлайн, все видят одни результаты":"пока не отвечает — нажмите обновить"}. <button class="btn ghost" id="syncNow">Обновить</button></p>',
    ''
)
html=html.replace(
    '${r.invoice?` <span class="st inv">Спец инвойс</span>`:""}</td>',
    '${r.invoice?` <span class="st inv">Спец инвойс</span>`:""}${r.mpt?` <span class="st mpt">МПТ</span>`:""}</td>'
)
if ".terms-top{" not in html:
    html=html.replace("</style>", ".terms-top{display:block}.terms-top h2{margin-top:0}@media(min-width:900px){.terms-top{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;align-items:start}.terms-top .terms-cards{grid-template-columns:1fr}}\n</style>", 1)
if ".st-trim>summary" not in html:
    html=html.replace("</style>", """.st-sorts{margin-top:8px}.st-sort-lab{font-size:12px;color:#6d6458;align-self:center}.st-trims{border-top:1px solid #f0e6d8}.st-trim{border-bottom:1px solid #f3eadc;background:#fff}.st-trim:last-child{border-bottom:0}.st-trim>summary{list-style:none;padding:9px 14px 9px 22px;display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer;background:#fbf7f1}.st-trim>summary::-webkit-details-marker{display:none}.st-trim>summary b{font-size:14px}.st-trim>summary b::before{content:"\\25B8  ";font-size:11px;color:#8a7560}.st-trim[open]>summary b::before{content:"\\25BE  "}.st-trim .st-list{border-top:1px solid #f0e6d8}
</style>""", 1)
if ".st-list{display:grid" not in html:
    html=html.replace("</style>", "@media(min-width:900px){.st-list{display:grid;grid-template-columns:1fr 1fr}.st-row{align-items:center;border-top:0;border-bottom:1px solid #f3eadc}.st-list>.st-row:nth-child(odd){box-shadow:inset -1px 0 0 #f3eadc}}\n</style>", 1)
if ".st-board{" not in html:
    html=html.replace("</style>", """/* st-look */
.st-filters{display:flex;flex-wrap:wrap;gap:8px}
.st-board{display:flex;flex-direction:column;gap:10px;margin-top:12px}
.st-acc{border:1px solid #eadfcf;border-radius:16px;background:#fff;box-shadow:0 10px 28px rgba(70,50,20,.05);overflow:hidden}
.st-acc>summary,.st-trim>summary{list-style:none;cursor:pointer}
.st-acc>summary::-webkit-details-marker,.st-trim>summary::-webkit-details-marker{display:none}
.st-acc>summary::marker,.st-trim>summary::marker{content:""}
.st-acc>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:#fff}
.st-id{display:flex;flex-direction:column;gap:2px;min-width:0}
.st-id small{display:block;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#8a6840}
.st-acc.chery .st-id small{color:#3e5870}
.st-id b{display:block;font-size:20px;letter-spacing:-.03em;line-height:1.1}
.st-meta{display:flex;align-items:center;gap:10px;margin-left:auto}
.st-count{font-size:13px;color:#6d6458;font-weight:600;white-space:nowrap}
.st-chev{width:32px;height:32px;border-radius:50%;border:1px solid #eadfcf;background:#fbf7f1;display:inline-flex;align-items:center;justify-content:center;flex:none}
.st-chev:before{content:"";width:7px;height:7px;border-right:2px solid #1c1a17;border-bottom:2px solid #1c1a17;transform:rotate(45deg) translateY(-2px)}
.st-acc[open]>summary .st-chev:before,.st-trim[open]>summary .st-chev:before{transform:rotate(225deg) translateY(-1px)}
.st-trims{display:flex;flex-direction:column;gap:8px;padding:0 12px 12px;background:#fff;border-top:0}
.st-trim{border:1px solid #eadfcf;border-radius:12px;background:#fbf7f1;overflow:hidden}
.st-trim>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;background:#fbf7f1}
.st-trim>summary b{font-size:14px;font-weight:700}
.st-trim>summary b::before{content:none!important}
.st-trim .st-chev{width:26px;height:26px;background:#fff}
.st-list{background:#fff;border-top:1px solid #f0e6d8}
.st-row{display:grid;grid-template-columns:1fr auto;gap:6px 12px;padding:12px 14px;border-top:1px solid #f3eadc;background:#fff}
.st-row:first-child{border-top:0}
.st-row small{display:block;color:#7a7166;font-size:12px;line-height:1.35}
.st-vin{word-break:break-all;font-family:ui-monospace,Menlo,monospace;font-size:11px}
.st-side{text-align:right;min-width:110px}
.st-side>b{font-variant-numeric:tabular-nums}
.st-flags{margin-top:6px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px}
.st-sorts{margin-top:8px}
.st-sort-lab{font-size:12px;color:#6d6458;align-self:center}
@media(min-width:900px){
  .st-list{display:grid;grid-template-columns:1fr 1fr}
  .st-row{align-items:center;border-top:0;border-bottom:1px solid #f3eadc}
  .st-list>.st-row:nth-child(odd){box-shadow:inset -1px 0 0 #f3eadc}
}
</style>""", 1)
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
if "let reviewExamN" not in html:
    html=html.replace(
        'let stockStatus = "all";',
        'let stockStatus = "all";\n    let reviewExamN = 1;'
    )
html=html.replace(
    "percent:pct,at:item.date,attempts:(prev.attempts||0)+1,status:\"done\"};",
    "percent:pct,ok:correct,n:paper.length,missed:missed.map(r=>({id:r.id,p:r.p,x:r.x,pick:r.pick||[]})),at:item.date,attempts:(prev.attempts||0)+1,status:\"done\"};"
)
html=html.replace(
    "if(body.status===\"running\" && rec.run) body.run = rec.run;",
    "if(body.status===\"running\" && rec.run) body.run = rec.run;\n      if(Array.isArray(rec.missed)) body.missed=rec.missed;\n      if(rec.ok!=null) body.ok=rec.ok;\n      if(rec.n!=null) body.n=rec.n;"
)
html=html.replace(
    "login,hub,home,study,quiz:brief,play,rate,hist:rate,terms,calc,stock,docs",
    "login,hub,home,study,quiz:brief,play,rate,hist:rate,review,terms,calc,stock,docs"
)
if "function review(){" not in html:
    html=html.replace(
        "function home(){",
        "function review(){\n"
        "      if(!state.surname) return login();\n"
        "      const rec=examRec(reviewExamN||1);\n"
        "      const miss=(rec&&rec.missed)||[];\n"
        "      const title=Number(reviewExamN)===2?\"Разбор пересдачи\":\"Разбор первой попытки\";\n"
        "      const mname=((MODELS[(rec&&rec.model)||model]||{}).name)||((rec&&rec.model)||model);\n"
        "      return banner(title, rec?((rec.percent!=null?rec.percent+\"% · \":\"\")+mname):\"\", \"TENET\")+`\n"
        "        <p class=\"lead\">${rec?escape(rec.display||state.display)+(rec.ok!=null&&rec.n?\" · \"+rec.ok+\" из \"+rec.n:\"\")+(rec.at?\" · \"+String(rec.at).slice(0,10):\"\"):\"Нет сохранённой попытки.\"}</p>\n"
        "        ${miss.length?miss.map(x=>`<div class=\"card\" style=\"margin:8px 0\"><b>${escape(x.p||\"\")}</b><p style=\"margin:8px 0 0\"><span class=\"eyebrow\">Ответ</span><br>${escape((x.pick&&x.pick.length?x.pick.join(\"; \"):\"не выбран\"))}</p><p>${escape(x.x||\"\")}</p></div>`).join(\"\"):`<div class=\"card\"><p>Разбор этой попытки не сохранился. Новые прохождения после обновления сайта будут открываться здесь даже после закрытия вкладки.</p></div>`}\n"
        "        <div style=\"margin-top:16px\"><button class=\"btn ghost\" data-go=\"home\">К модели</button></div>`;\n"
        "    }\n"
        "    function home(){"
    )
html=html.replace(
    ': `<div class="card ok"><h3>Аттестация №1 · ${e1?e1.percent+"%":""}</h3><p>Результат закреплён.${e2?" Стало "+e2.percent+"%.":" Пересдача — по коду РОП."}</p></div>`;',
    ': `<div class="card ok"><h3>Аттестация №1 · ${e1?e1.percent+"%":""}</h3><p>Результат закреплён.${e2?" Стало "+e2.percent+"%.":" Пересдача — по коду РОП."}</p></div>`+`<button class="card ok" data-review="1"><h3>Разбор первой попытки</h3><p>Ошибки и ваши ответы. Доступен после обновления страницы.</p></button>`;'
)
html=html.replace(
    '? `<div class="card ok"><h3>Аттестация сдана · ${e1.percent}%</h3><p>Эксперт. Закреплено в рейтинге. Пересдача не нужна.</p></div>`',
    '? `<div class="card ok"><h3>Аттестация сдана · ${e1.percent}%</h3><p>Эксперт. Закреплено в рейтинге. Пересдача не нужна.</p></div>`+`<button class="card ok" data-review="1"><h3>Разбор первой попытки</h3><p>Ошибки и ваши ответы.</p></button>`'
)
if 'querySelectorAll("[data-review]")' not in html:
    html=html.replace(
        'document.querySelectorAll("[data-go]")',
        'document.querySelectorAll("[data-review]").forEach(b=>b.onclick=()=>{ reviewExamN=Number(b.dataset.review)||1; view="review"; render(); });\n      document.querySelectorAll("[data-go]")',
        1
    )

Path("_site").mkdir(exist_ok=True)
Path("_site/index.html").write_text(html)
Path("_site/pins.json").write_text(json.dumps(pins, ensure_ascii=False))
root = Path("index.html")
if pins and root.exists():
    src = root.read_text(encoding="utf-8")
    baked = "const LOGIN_PINS = " + json.dumps(pins, ensure_ascii=False, separators=(", ", ": ")) + ";"
    src2, n = re.subn(r"const LOGIN_PINS = \{.*?\};", baked, src, count=1, flags=re.S)
    if n:
        root.write_text(src2, encoding="utf-8")
        print("root pins", len(pins))
print("wrote site", len(html))
