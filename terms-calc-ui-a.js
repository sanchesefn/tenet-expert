    function termCard(title, value, note){
      return `<article class="term-card"><b>${escape(title)}</b>${value?`<div class="num">${value}</div>`:""}${note?`<small>${note}</small>`:""}</article>`;
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
      if(id==="ta8p"||id==="ta8u") return "TENET A8";
      if(id==="t9p"||id==="t9u") return "Tiggo 9";
      if(id==="a8a"||id==="a8p"||id==="a8u") return "Arrizo 8";
      if(id==="t7l") return "Tiggo 7 L";
      return "Другие";
    }
    function kmStockCars(m){
      const list=typeof STOCK!=="undefined"?STOCK:[];
      return list.filter(c=>c.model===m.stock && kmTrimFit(m,c));
    }
    function terms(){
      if(needAuth()) return login();
      return banner("Торговые условия","Файл «Торговые условия» · с "+TERMS_DATE,"TENET")+
        `<div class="terms-col">`+
        `<p class="lead">Клиенту называть рекомендованную цену. Максимум с выгодами — после расчёта РОП. КМ — коридор доходности без НДС, тыс. руб.</p>`+
        `<div class="note-box">Скидки импортёра не обещать, если их нет в прайсе. Цифры внутренние.</div>`+
        `<h2>Доходность</h2>`+
        `<div class="terms-cards">`+KM_CORRIDOR.map(r=>termCard(r.model+" · "+r.trim, escape(r.km), r.note?escape(r.note):"")).join("")+`</div>`+
        `<h2>Бонусы</h2>`+
        `<div class="terms-cards">`+TERMS_BONUS.map(r=>termCard(r.model+" · "+r.trim, escape(r.bonus), "")).join("")+`</div>`+
        `<h2>Спец инвойс</h2>`+
        `<div class="terms-cards">`+TERMS_INV.map(r=>termCard(r.model+" · "+r.trim, escape(r.price), "")).join("")+`</div>`+
        `<h2>МПТ / субсидия TENET</h2>`+
        `<div class="terms-cards">`+TERMS_MPT.map(g=>`<article class="term-card"><b>${escape(g.line)}</b>`+g.rows.map(r=>`<small>${escape(r[0])} · <b>${escape(r[1])}</b></small>`).join("")+`</article>`).join("")+`</div>`+
        `<h2>Приоритет · ${TERMS_PRIO.length} авто</h2>`+
        `<p class="lead">Личный план 2 · командный план 12. Всего 14.</p>`+
        `<div class="terms-cards">`+TERMS_PRIO.map(r=>termCard(
          r.model+" · "+r.trim,
          (r.pay?rub(r.pay):"—")+" / "+(r.bonus?rub(r.bonus):"—"),
          escape(r.vin)+" · "+escape(r.color)+(r.extra?" · "+escape(r.extra):"")+" · "+escape(r.year)
        )).join("")+`</div>`+
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
      const order=["T4","T4L","T7","T8","TENET A8","Tiggo 9","Arrizo 8","Tiggo 7 L"];
      const groups={};
      KM_MODELS.forEach(x=>{
        const g=kmLineOf(x.id);
        (groups[g]=groups[g]||[]).push(x);
      });
      return order.filter(g=>groups[g]).map(g=>`<div class="km-line"><p class="stock-h">${g}</p><div class="km-grid">${groups[g].map(x=>`<button type="button" class="chip ${x.id===active?"on":""}" data-km-id="${x.id}">${escape(x.name)}<small>${x.brand} · РРЦ ${rub(x.rrc)}</small></button>`).join("")}</div></div>`).join("");
    }
    function kmSideList(m){
      const cars=kmStockCars(m).slice().sort((a,b)=>{
        const pa=PRIO_VINS.has(a.vin)?0:1;
        const pb=PRIO_VINS.has(b.vin)?0:1;
        if(pa!==pb) return pa-pb;
        if(a.status!==b.status) return a.status==="in"?-1:1;
        return (a.color||"").localeCompare(b.color||"");
      });
      const inn=cars.filter(c=>c.status==="in").length;
      const way=cars.filter(c=>c.status==="way").length;
      if(!cars.length){
        return `<div class="card stock-side"><p class="eyebrow">Склад · ${escape(m.name)}</p><p class="lead" style="max-width:none">Нет этой комплектации в наличии и в пути.</p></div>`;
      }
      const block=(title, arr)=>!arr.length?"":`<p class="stock-h">${title} · ${arr.length}</p>`+arr.map(c=>{
        const prio=PRIO_VINS.has(c.vin);
        const on=kmVin===c.vin;
        const st=c.status==="in"?"в наличии":"в пути";
        return `<button type="button" class="stock-car${prio?" prio":""}${c.mpt?" mpt":""}${on?" on":""}" data-km-vin="${escape(c.vin)}">
          <b>${escape(c.color||"—")} · ${escape(c.trim||"")}${prio?" · приоритет":""}</b>
          ${c.mpt?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}
          <span class="vin">${escape(c.vin)}</span>
          <span class="stock-meta">${st}${c.invoice?" · спец инвойс":""}${c.mpt?" · МПТ":""}${c.note?" · "+escape(c.note):""}</span>
        </button>`;
      }).join("");
      return `<div class="card stock-side">
        <p class="eyebrow">Склад · ${escape(m.name)}</p>
        <p class="lead" style="max-width:none;margin:0 0 10px">Только эта комплектация. В наличии ${inn} · в пути ${way}.</p>
        ${block("В наличии", cars.filter(c=>c.status==="in"))}
        ${block("В пути", cars.filter(c=>c.status==="way"))}
      </div>`;
    }
    function kmPrioRecs(cur, carPrice, downPct, months, extras){
      const list=typeof STOCK!=="undefined"?STOCK:[];
      const refPay=typeof calcPay==="function"?calcPay(carPrice+extras, Math.round(carPrice*downPct/100), months, 10):0;
      const rows=list.filter(c=>PRIO_VINS.has(c.vin) && c.vin!==kmVin).map(c=>{
        const id=kmIdFromCar(c);
        const mm=KM_MODELS.find(x=>x.id===id);
        const price=mm?mm.rrc:carPrice;
        const group=typeof kmRateGroup==="function"?kmRateGroup(mm||cur):"t4l_t7";
        const look=typeof kmBankRate==="function"?kmBankRate("sber", group, months, downPct):{rate:10, term:months};
        const down=Math.round(price*Math.max(0,downPct)/100);
        const pay=calcPay(price+extras, down, look.term||months, look.rate);
        return {c, mm, price, pay, d:Math.abs(price-carPrice)+Math.abs(pay-refPay)};
      }).sort((a,b)=>a.d-b.d).slice(0,4);
      if(!rows.length) return "";
      return `<div class="card rec-box">
        <p class="eyebrow">Рекомендуем рассмотреть</p>
        <p class="lead" style="max-width:none;margin:0 0 10px">Приоритетные авто рядом по цене и платежу.</p>
        ${rows.map(r=>{
          const st=r.c.status==="in"?"в наличии":"в пути";
          return `<button type="button" class="stock-car prio rec${r.c.mpt?" mpt":""}" data-km-vin="${escape(r.c.vin)}">
            <b>${escape((r.mm&&r.mm.name)||r.c.name)} · ${escape(r.c.color||"—")}</b>
            ${r.c.mpt?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}
            <span class="vin">${escape(r.c.vin)} · ${escape(r.c.trim||"")} · ${st}</span>
            <span class="stock-meta">РРЦ ${rub(r.price)} · платёж ~${rub(Math.round(r.pay))} ₽ · приоритет</span>
          </button>`;
        }).join("")}
      </div>`;
    }
