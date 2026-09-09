from pathlib import Path
p = Path("_site/index.html")
if not p.exists():
    print("skip mpt patch")
else:
    html = p.read_text()
    if "let mptDay" not in html:
        html = html.replace('let kmVin = "";', 'let kmVin = "";\n    let mptMonth = 3;\n    let mptDay = "";')
    if 'querySelectorAll("[data-mpt-day]")' not in html:
        html = html.replace(
            'document.querySelectorAll("[data-km-id]")',
            'document.querySelectorAll("[data-mpt-day]").forEach(b=>b.onclick=()=>{ mptDay=b.dataset.mptDay||""; view="terms"; render(); });\n      document.querySelectorAll("[data-mpt-month]").forEach(b=>b.onclick=()=>{ mptMonth=Number(b.dataset.mptMonth)||3; view="terms"; render(); });\n      document.querySelectorAll("[data-prio-go]").forEach(b=>b.onclick=()=>{ kmVin=b.dataset.prioGo||""; const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===kmVin); if(car && typeof kmIdFromCar==="function"){ const nid=kmIdFromCar(car); if(nid){ kmId=nid; kmShown=""; } } calcMode="km"; view="calc"; render(); });\n      document.querySelectorAll("[data-km-id]")',
            1
        )
    elif 'querySelectorAll("[data-prio-go]")' not in html:
        html = html.replace(
            'document.querySelectorAll("[data-mpt-day]")',
            'document.querySelectorAll("[data-prio-go]").forEach(b=>b.onclick=()=>{ kmVin=b.dataset.prioGo||""; const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===kmVin); if(car && typeof kmIdFromCar==="function"){ const nid=kmIdFromCar(car); if(nid){ kmId=nid; kmShown=""; } } calcMode="km"; view="calc"; render(); });\n      document.querySelectorAll("[data-mpt-day]")',
            1
        )
    html = html.replace(
        '`<div class="terms-cards">`+TERMS_MPT.map(g=>`<article class="term-card"><b>${escape(g.line)}</b>`+g.rows.map(r=>`<small>${escape(r[0])} · <b>${escape(r[1])}</b></small>`).join("")+`</article>`).join("")+`</div>`+',
        '`<p class="lead">По дате производства T7. Зелёный — МПТ, песочный — субсидия бренда. Нажмите день.</p>`+mptCal()+'
    )
    old_prio = '''    function prioList(){
      const soldBy={};
      TERMS_PRIO.forEach(r=>{
        if(r.sold && r.seller) soldBy[r.seller]=(soldBy[r.seller]||0)+1;
      });
      return `<ol class="prio-list">`+TERMS_PRIO.map((r,i)=>{
        const sold=!!r.sold;
        const n=r.seller?soldBy[r.seller]||0:0;
        const mark=sold&&r.seller?`<span class="sold-mark">Продано · ${escape(r.seller)} <i>${n>=2?"2":"1"}</i></span>`:"";
        const extra=r.extra?` · ${escape(r.extra)}`:"";
        return `<li class="prio-item${sold?" sold":""}">
          <div class="prio-top"><b>${i+1}. ${escape(r.model)} · ${escape(r.trim)}</b>${mark}</div>
          <div class="prio-meta">${escape(r.vin)} · ${escape(r.color)} · ${escape(r.year)}${extra}</div>
          <div class="prio-pay">${r.pay?rub(r.pay):"—"} / ${r.bonus?rub(r.bonus):"—"}</div>
        </li>`;
      }).join("")+`</ol>`;
    }'''
    new_prio = '''    function prioList(){
      const soldBy={};
      TERMS_PRIO.forEach(r=>{
        if(r.sold && r.seller) soldBy[r.seller]=(soldBy[r.seller]||0)+1;
      });
      return `<ol class="prio-list">`+TERMS_PRIO.map((r,i)=>{
        const sold=!!r.sold;
        const n=r.seller?soldBy[r.seller]||0:0;
        const mark=sold&&r.seller?`<span class="sold-mark"><em>Продано</em> ${escape(r.seller)} <i>${n>=2?"2":"1"}</i></span>`:"";
        const go=!sold?`<button type="button" class="btn ivory prio-go" data-prio-go="${escape(r.vin)}">Перейти к расчету цены и кредита</button>`:"";
        const extra=r.extra?` · ${escape(r.extra)}`:"";
        return `<li class="prio-item${sold?" sold":""}">
          <div class="prio-top">
            <b>${i+1}. ${escape(r.model)} · ${escape(r.trim)}</b>
            <span class="prio-meta">${escape(r.vin)} · ${escape(r.color)} · ${escape(r.year)}${extra}</span>
            <span class="prio-pay">${r.pay?rub(r.pay):"—"} / ${r.bonus?rub(r.bonus):"—"}</span>
            ${mark}${go}
          </div>
        </li>`;
      }).join("")+`</ol>`;
    }'''
    if old_prio in html:
        html = html.replace(old_prio, new_prio, 1)
        print("prio list compact")
    elif "data-prio-go" not in html:
        print("prio list pattern not found")
    extra_css = """
.prio-item{padding:6px 10px}
.prio-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.prio-top b{font-size:13px}
.prio-meta,.prio-pay{color:var(--muted);font-size:12px;margin:0}
.sold-mark{display:inline-flex;align-items:center;gap:8px;margin-left:auto;font-size:18px;font-weight:800;color:#5d4037}
.sold-mark em{font-style:normal;font-size:18px}
.sold-mark i{display:inline-flex;min-width:32px;height:32px;padding:0 8px;border-radius:999px;background:#6d4c41;color:#fff;align-items:center;justify-content:center;font-style:normal;font-size:18px;font-weight:800}
.prio-go{margin-left:auto;min-height:34px;padding:6px 10px;font-size:12px}
"""
    if ".prio-go{" not in html:
        html = html.replace("</style>", extra_css + "\n</style>", 1)
    html = html.replace(
        '''    const KM_CORRIDOR = [
      {model:"T4L",trim:"Active",km:"0 / 50",note:""},
      {model:"T4L",trim:"Prime",km:"0 / 50",note:""},
      {model:"T7",trim:"Все",km:"0 / 50",note:""},
      {model:"T8",trim:"Приоритет",km:"−20 / 0",note:"VIN из списка"},
      {model:"T8",trim:"Остальные",km:"0 / 30",note:""},
      {model:"T9",trim:"Приоритет",km:"−20 / 0",note:"VIN из списка"},
      {model:"T9",trim:"Остальные",km:"0 / 30",note:""},
      {model:"A8",trim:"Приоритет",km:"−30 / 0",note:"VIN из списка"},
      {model:"A8",trim:"Остальные",km:"0 / 30",note:""}
    ];''',
        '''    const KM_CORRIDOR = [
      {model:"T4L",trim:"Все",km:"0 / 50",note:""},
      {model:"T7",trim:"Все",km:"30 / 80",note:""},
      {model:"T8",trim:"Приоритет",km:"−30 / 0",note:"VIN из списка"},
      {model:"T8",trim:"Остальные",km:"0 / 30",note:""},
      {model:"T9",trim:"Все",km:"−30 / 0",note:""},
      {model:"A8",trim:"Все",km:"−30 / 0",note:""}
    ];'''
    )
    html = html.replace(
        '''    const TERMS_BONUS = [
      {model:"T4L",trim:"Active",bonus:"1%"},
      {model:"T4L",trim:"Prime",bonus:"3%"},
      {model:"T7",trim:"Любые",bonus:"2%"},
      {model:"T8",trim:"2WD",bonus:"2%"},
      {model:"T8",trim:"4WD",bonus:"3%"},
      {model:"T9",trim:"Prime",bonus:"0%"},
      {model:"T9",trim:"Ultra",bonus:"2%"},
      {model:"A8",trim:"Любые",bonus:"2%"}
    ];''',
        '''    const TERMS_BONUS = [
      {model:"T4L",trim:"Все",bonus:"2%"},
      {model:"T7",trim:"Любые",bonus:"2%"},
      {model:"T8",trim:"Все",bonus:"2%"},
      {model:"T9",trim:"Все",bonus:"2%"},
      {model:"A8",trim:"Любые",bonus:"2%"}
    ];'''
    )
    html = html.replace('{id:"t7a",brand:"TENET",name:"T7 Active 2WD",stock:"t7",rrc:2785000,dealer:2645000,ti:180000,tiBack:130000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50}',
                        '{id:"t7a",brand:"TENET",name:"T7 Active 2WD",stock:"t7",rrc:2785000,dealer:2645000,ti:180000,tiBack:130000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:30,kmMax:80,prioMin:30,prioMax:80}')
    html = html.replace('{id:"t7p",brand:"TENET",name:"T7 Prime 2WD",stock:"t7",rrc:2985000,dealer:2840000,ti:200000,tiBack:150000,cr:50000,crBack:30000,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50}',
                        '{id:"t7p",brand:"TENET",name:"T7 Prime 2WD",stock:"t7",rrc:2985000,dealer:2840000,ti:200000,tiBack:150000,cr:50000,crBack:30000,bonus:0.02,vat:1.22,fee:0.01,kmMin:30,kmMax:80,prioMin:30,prioMax:80}')
    html = html.replace('{id:"t7a4",brand:"TENET",name:"T7 Active 4WD",stock:"t7",rrc:2990000,dealer:2860000,ti:130000,tiBack:90000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50}',
                        '{id:"t7a4",brand:"TENET",name:"T7 Active 4WD",stock:"t7",rrc:2990000,dealer:2860000,ti:130000,tiBack:90000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:30,kmMax:80,prioMin:30,prioMax:80}')
    html = html.replace('{id:"t7p4",brand:"TENET",name:"T7 Prime 4WD",stock:"t7",rrc:3190000,dealer:3045000,ti:150000,tiBack:110000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50}',
                        '{id:"t7p4",brand:"TENET",name:"T7 Prime 4WD",stock:"t7",rrc:3190000,dealer:3045000,ti:150000,tiBack:110000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:30,kmMax:80,prioMin:30,prioMax:80}')
    html = html.replace('prioMin:-20,prioMax:0}', 'prioMin:-30,prioMax:0}')
    html = html.replace('{id:"t4la",brand:"TENET",name:"T4L Active",stock:"t4l",rrc:2329000,dealer:2234000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.01,',
                        '{id:"t4la",brand:"TENET",name:"T4L Active",stock:"t4l",rrc:2329000,dealer:2234000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.02,')
    html = html.replace('{id:"t9p",brand:"CHERY",name:"Tiggo 9 Prime 4WD",stock:"t9",rrc:4335000,dealer:3895000,ti:300000,tiBack:250000,cr:0,crBack:0,bonus:0,',
                        '{id:"t9p",brand:"CHERY",name:"Tiggo 9 Prime 4WD",stock:"t9",rrc:4335000,dealer:3895000,ti:300000,tiBack:250000,cr:0,crBack:0,bonus:0.02,')
    html = html.replace('{id:"t8p4",brand:"TENET",name:"T8 Prime 4WD",stock:"t8",rrc:3630000,dealer:3465000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.03,',
                        '{id:"t8p4",brand:"TENET",name:"T8 Prime 4WD",stock:"t8",rrc:3630000,dealer:3465000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.02,')
    html = html.replace('{id:"t8u4",brand:"TENET",name:"T8 Ultra 4WD",stock:"t8",rrc:3885000,dealer:3705000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.03,',
                        '{id:"t8u4",brand:"TENET",name:"T8 Ultra 4WD",stock:"t8",rrc:3885000,dealer:3705000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.02,')
    p.write_text(html)
    print("mpt patched")
