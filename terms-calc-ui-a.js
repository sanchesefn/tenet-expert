    function termCard(title, value, note){
      return `<article class="term-card"><b>${escape(title)}</b>${value?`<div class="num">${value}</div>`:""}${note?`<small>${note}</small>`:""}</article>`;
    }
    function termGroup(rows, valKey){
      const order=[], map={};
      rows.forEach(r=>{
        const k=r.model;
        if(!map[k]){ map[k]=[]; order.push(k); }
        map[k].push(r);
      });
      return order.map(model=>{
        const list=map[model];
        const body=list.map(r=>`<div class="term-row"><span>${escape(r.trim)}</span><b class="num">${escape(r[valKey]||"")}</b></div>${r.note?`<small>${escape(r.note)}</small>`:""}`).join("");
        return `<article class="term-card term-group"><b>${escape(model)}</b>${body}</article>`;
      }).join("");
    }
    function prioList(){
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
    }
    function kmTrimFit(m, car){
      const t=(car.trim||"").toLowerCase();
      const id=m.id;
      if(id==="t4la") return t.includes("актив");
      if(id==="t4lp") return t.includes("прайм");
      if(id==="t7a") return t.includes("актив") && !t.includes("4wd");
      if(id==="t7p") return t.includes("прайм") && !t.includes("4wd");
      if(id==="t7a4") return t.includes("актив") && t.includes("4wd");
      if(id==="t7p4") return t.includes("прайм") && t.includes("4wd");
      if(id==="t8a") return t.includes("актив");
      if(id==="t8p") return t.includes("прайм") && !t.includes("4wd");
      if(id==="t8p4") return t.includes("прайм") && t.includes("4wd");
      if(id==="t8u4") return t.includes("ультра");
      if(id==="tt9p") return t.includes("прайм");
      if(id==="tt9u") return t.includes("ультра");
      if(id==="t9p") return t.includes("прайм");
      if(id==="t9u") return t.includes("ультра");
      if(id==="a8a") return t.includes("актив");
      if(id==="a8p") return t.includes("прайм");
      if(id==="a8u") return t.includes("ультра");
      if(id==="t7l") return true;
      return true;
    }
    function kmIdFromCar(car){
      const t=(car.trim||"").toLowerCase();
      if(car.model==="t4") return "t4p";
      if(car.model==="t4l") return t.includes("прайм")?"t4lp":"t4la";
      if(car.model==="t7"){
        if(t.includes("4wd") && t.includes("прайм")) return "t7p4";
        if(t.includes("4wd")) return "t7a4";
        if(t.includes("прайм")) return "t7p";
        return "t7a";
      }
      if(car.model==="t8"){
        if(t.includes("ультра")) return "t8u4";
        if(t.includes("4wd")) return "t8p4";
        if(t.includes("прайм")) return "t8p";
        return "t8a";
      }
      if(car.model==="tt9" || String(car.vin||"").toUpperCase().indexOf("EDEHD24")===0) return t.includes("прайм")?"tt9p":"tt9u";
      if(car.model==="t9") return t.includes("прайм")?"t9p":"t9u";
      if(car.model==="a8"){
        if(t.includes("ультра")) return "a8u";
        if(t.includes("актив")) return "a8a";
        return "a8p";
      }
      if(car.model==="t7l") return "t7l";
      return "";
    }
    function kmLineOf(id){
      if(id==="t4p") return "T4";
      if(id==="t4la"||id==="t4lp") return "T4L";
      if(id==="t7a"||id==="t7p"||id==="t7a4"||id==="t7p4") return "T7";
      if(id==="t8a"||id==="t8p"||id==="t8p4"||id==="t8u4") return "T8";
      if(id==="tt9p"||id==="tt9u") return "TENET T9";
      if(id==="ta8p"||id==="ta8u") return "TENET A8";
      if(id==="t9p"||id==="t9u") return "Tiggo 9";
      if(id==="a8a"||id==="a8p"||id==="a8u") return "Arrizo 8";
      if(id==="t7l") return "Tiggo 7 L";
      return "Другие";
    }
    function kmStockCars(m){
      const list=typeof STOCK!=="undefined"?STOCK:[];
      return list.filter(c=>!(typeof stockIsDemo==="function"?stockIsDemo(c):c.demo) && c.model===m.stock && kmTrimFit(m,c));
    }
    function terms(){
      if(needAuth()) return login();
      return banner("Торговые условия","Файл «Торговые условия» · с "+TERMS_DATE,"TENET")+
        `<div class="terms-col">`+
        `<p class="lead">Клиенту называть рекомендованную цену. Максимум с выгодами — после расчёта РОП. КМ — коридор доходности без НДС, тыс. руб.</p>`+
        `<div class="note-box">Скидки импортёра не обещать, если их нет в прайсе. Цифры внутренние.</div>`+
        `<h2>Доходность</h2>`+
        `<div class="terms-cards">`+termGroup(KM_CORRIDOR,"km")+`</div>`+
        `<h2>Бонусы</h2>`+
        `<div class="terms-cards">`+termGroup(TERMS_BONUS,"bonus")+`</div>`+
        `<h2>Спец инвойс</h2>`+
        `<div class="terms-cards">`+TERMS_INV.map(r=>termCard(r.model+" · "+r.trim, escape(r.price), "")).join("")+`</div>`+
        `<h2>МПТ / субсидия TENET</h2>`+
        `<div class="terms-cards">`+TERMS_MPT.map(g=>`<article class="term-card"><b>${escape(g.line)}</b>`+g.rows.map(r=>`<small>${escape(r[0])} · <b>${escape(r[1])}</b></small>`).join("")+`</article>`).join("")+`</div>`+
        `<h2>Приоритет · ${TERMS_PRIO.length} авто</h2>`+
        `<p class="lead">Личный план 2 · командный план 12. Всего 14. Порядок как в файле.</p>`+
        prioList()+
        `<p class="lead">Доплата за 4WD на T7 — 205 000 ₽. Мотор T7 везде 1.6T 150.</p>`+
        `<div class="who-line"><button class="btn ivory" data-go="calc">В калькулятор</button><button class="btn ghost" data-go="docs">Документы</button></div>`+
        `</div>`;
    }
    function calcPay(price, down, months, rate){
      const S=Math.max(0, (Number(price)||0)-(Number(down)||0));
      const n=Math.max(1, Number(months)||12);
      const i=(Number(rate)||0)/100/12;
      if(i<=0) return S/n;
      const k=Math.pow(1+i,n);
      return S*i*k/(k-1);
    }
    function kmVal(id, def){
      const el=document.getElementById(id);
      if(!el) return def;
      if(el.type==="checkbox") return !!el.checked;
      const n=Number(String(el.value||"").replace(/\s+/g,""));
      return Number.isFinite(n)?n:def;
    }
    function kmStr(id, def){
      const el=document.getElementById(id);
      if(!el) return def;
      const v=String(el.value||"").trim();
      return v||def;
    }
    function kmChipGroups(active){
      const rows=[["T4","T4L"],["T7","Tiggo 7 L"],["T8"],["Tiggo 9","TENET T9"],["Arrizo 8","TENET A8"]];
      const groups={};
      KM_MODELS.forEach(x=>{
        const g=kmLineOf(x.id);
        (groups[g]=groups[g]||[]).push(x);
      });
      const line=(g,tone)=>`<div class="km-line tone-${tone}"><p class="stock-h">${escape(g)}</p><div class="km-grid">${groups[g].map(x=>`<button type="button" class="chip ${x.id===active?"on":""}" data-km-id="${x.id}">${escape(x.name)}<small>${x.brand} · РРЦ ${rub(x.rrc)}</small></button>`).join("")}</div></div>`;
      return rows.map(pair=>{
        const present=pair.filter(g=>groups[g]&&groups[g].length);
        if(!present.length) return "";
        return `<div class="km-pair${present.length>1?" is-2":""}">${present.map((g,i)=>line(g,i?"b":"a")).join("")}</div>`;
      }).join("");
    }
    function kmPrioRecRows(cur, carPrice, downPct, months, extras){
      const list=typeof STOCK!=="undefined"?STOCK:[];
      const price0=Number(carPrice)|| (cur&&cur.rrc)||0;
      const pct=Number(downPct)||20;
      const term=Number(months)||60;
      const extra=Number(extras)||0;
      const refPay=typeof calcPay==="function"?calcPay(price0+extra, Math.round(price0*pct/100), term, 10):0;
      return list.filter(c=>PRIO_VINS.has(c.vin) && c.vin!==kmVin && !(typeof stockIsDemo==="function"?stockIsDemo(c):c.demo)).map(c=>{
        const id=typeof kmIdFromCar==="function"?kmIdFromCar(c):"";
        const mm=KM_MODELS.find(x=>x.id===id);
        const price=mm?mm.rrc:price0;
        const group=typeof kmRateGroup==="function"?kmRateGroup(mm||cur):"t4l_t7";
        const look=typeof kmBankRate==="function"?kmBankRate("sber", group, term, pct):{rate:10, term};
        const down=Math.round(price*Math.max(0,pct)/100);
        const pay=typeof calcPay==="function"?calcPay(price+extra, down, look.term||term, look.rate):0;
        return {c, mm, price, pay, d:Math.abs(price-price0)+Math.abs(pay-refPay)};
      }).sort((a,b)=>a.d-b.d).slice(0,4);
    }
    function kmSideList(m, carPrice, downPct, months, extras){
      const cars=kmStockCars(m).slice().sort((a,b)=>{
        const pa=PRIO_VINS.has(a.vin)?0:1;
        const pb=PRIO_VINS.has(b.vin)?0:1;
        if(pa!==pb) return pa-pb;
        if(a.status!==b.status) return a.status==="in"?-1:1;
        return (a.color||"").localeCompare(b.color||"");
      });
      const inn=cars.filter(c=>c.status==="in");
      const way=cars.filter(c=>c.status==="way");
      const recs=kmPrioRecRows(m, carPrice!=null?carPrice:m.rrc, downPct!=null?downPct:20, months!=null?months:60, extras||0);
      const hereVins=new Set(cars.map(c=>c.vin));
      const recVins=new Set(recs.map(r=>r.c.vin));
      const recOther=recs.filter(r=>!hereVins.has(r.c.vin));
      const carBtn=(c)=>{
        const prio=PRIO_VINS.has(c.vin);
        const rec=recVins.has(c.vin) || prio;
        const on=kmVin===c.vin;
        const st=c.status==="in"?"в наличии":"в пути";
        return `<button type="button" class="stock-car${prio?" prio":""}${rec?" rec":""}${(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)?" mpt":""}${(typeof carIsCorp==="function"?carIsCorp(c):(c.corp||(typeof kmIsCorp==="function"&&kmIsCorp(c.vin))))?" corp":""}${c.demo?" demo":""}${c.invoice?" invoice":""}${on?" on":""}" data-km-vin="${escape(c.vin)}">
          <b>${escape(c.color||"—")} · ${escape(c.trim||"")}${prio?" · приоритет":""}</b>
          ${c.invoice?`<span class="mpt-tag inv-tag">Спец инвойс</span>`:""}${(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}${(typeof carIsCorp==="function"?carIsCorp(c):(c.corp||(typeof kmIsCorp==="function"&&kmIsCorp(c.vin))))?`<span class="mpt-tag corp-tag">Корп · лизинг</span>`:""}${c.demo?`<span class="mpt-tag demo-tag">ДЕМО</span>`:""}
          <span class="vin">${escape(c.vin)}</span>
          <span class="stock-meta">${st}${c.invoice?" · спец инвойс":""}${(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)?" · МПТ":""}${(typeof carIsCorp==="function"?carIsCorp(c):c.corp)?" · корп":""}${c.demo?" · ДЕМО":""}${c.note?" · "+escape(c.note):""}</span>
        </button>`;
      };
      if(!cars.length && !recOther.length){
        return `<div class="card stock-side"><p class="eyebrow">В наличии · ${escape(m.name)}</p><p class="lead" style="max-width:none">Нет этой комплектации в наличии и в пути.</p></div>`;
      }
      const recBlock=!recOther.length?"":recOther.map(r=>{
          const st=r.c.status==="in"?"в наличии":"в пути";
          return `<button type="button" class="stock-car prio rec${(typeof carIsMpt==="function"?carIsMpt(r.c):r.c.mpt)?" mpt":""}${(typeof carIsCorp==="function"?carIsCorp(r.c):r.c.corp)?" corp":""}" data-km-vin="${escape(r.c.vin)}">
            <b>${escape((r.mm&&r.mm.name)||r.c.name)} · ${escape(r.c.color||"—")}</b>
            ${(typeof carIsMpt==="function"?carIsMpt(r.c):r.c.mpt)?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}${(typeof carIsCorp==="function"?carIsCorp(r.c):r.c.corp)?`<span class="mpt-tag corp-tag">Корп · лизинг</span>`:""}
            <span class="vin">${escape(r.c.vin)} · ${escape(r.c.trim||"")} · ${st}</span>
            <span class="stock-meta">РРЦ ${rub(r.price)} · платёж ~${rub(Math.round(r.pay))} ₽ · приоритет</span>
          </button>`;
        }).join("");
      const recCard=recBlock?`<div class="card stock-rec"><p class="eyebrow">Рекомендуем</p>${recBlock}</div>`:"";
      const stockCard=cars.length?`<div class="card stock-side"><p class="eyebrow">В наличии · ${escape(m.name)}</p><p class="lead" style="max-width:none;margin:0 0 10px">${inn.length} в салоне · ${way.length} в пути.</p>${inn.length?`<p class="stock-h">Эта комплектация · ${inn.length}</p>`+inn.map(c=>carBtn(c)).join(""):""}${way.length?`<p class="stock-h">В пути · ${way.length}</p>`+way.map(c=>carBtn(c)).join(""):""}</div>`:"";
      return recCard+stockCard;
    }
    function kmPrioRecs(cur, carPrice, downPct, months, extras){
      return "";
    }
