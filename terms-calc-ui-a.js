    function sheet(headers, rows){
      return `<div class="sheet-wrap"><table class="sheet"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
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
    function kmStockCars(m){
      const list=typeof STOCK!=="undefined"?STOCK:[];
      return list.filter(c=>c.model===m.stock);
    }
    function terms(){
      if(needAuth()) return login();
      return banner("Торговые условия","Файл «Торговые условия» · с "+TERMS_DATE,"TENET")+
        `<div class="terms-col">`+
        `<p class="lead">Клиенту называть рекомендованную цену. Максимум с выгодами — после расчёта РОП. КМ — коридор доходности без НДС, тыс. руб.</p>`+
        `<div class="note-box">Скидки импортёра не обещать, если их нет в прайсе. Цифры внутренние.</div>`+
        `<div class="terms-grid">`+
        `<section class="terms-span"><h2>Доходность</h2>`+
        sheet(["Модель","Комплектация","КМ","Доп. условия"], KM_CORRIDOR.map(r=>`<tr><td><b>${escape(r.model)}</b></td><td>${escape(r.trim)}</td><td class="num">${escape(r.km)}</td><td style="color:var(--muted);font-size:12px">${escape(r.note||"")}</td></tr>`).join(""))+
        `</section>`+
        `<section><h2>Бонусы</h2>`+
        sheet(["Модель","Комплектация","Бонус"], TERMS_BONUS.map(r=>`<tr><td><b>${escape(r.model)}</b></td><td>${escape(r.trim)}</td><td class="num">${escape(r.bonus)}</td></tr>`).join(""))+
        `</section>`+
        `<section><h2>Спец инвойс</h2>`+
        sheet(["Модель","Комплектация","Цена с уч. допов"], TERMS_INV.map(r=>`<tr><td><b>${escape(r.model)}</b></td><td>${escape(r.trim)}</td><td class="num">${escape(r.price)}</td></tr>`).join(""))+
        `</section>`+
        `<section class="terms-span"><h2>МПТ / субсидия TENET</h2>`+
        `<div class="terms-grid">`+
        TERMS_MPT.map(g=>`<div><h3 style="margin:8px 0 6px;font-size:16px">${escape(g.line)}</h3>`+sheet(["Дата производства","Условие"], g.rows.map(r=>`<tr><td>${escape(r[0])}</td><td><b>${escape(r[1])}</b></td></tr>`).join(""))+`</div>`).join("")+
        `</div></section>`+
        `<section class="terms-span"><h2>Приоритет · ${TERMS_PRIO.length} авто</h2>`+
        `<p class="lead">Личный план 2 · командный план 12. Всего 14.</p>`+
        sheet(["Авто","VIN","Цвет","Взнос","Бонус"], TERMS_PRIO.map(r=>`<tr><td><b>${escape(r.model)}</b><div style="color:var(--muted);font-size:12px">${escape(r.trim)} · ${escape(r.year)}${r.extra?" · "+escape(r.extra):""}</div></td><td class="vin">${escape(r.vin)}</td><td>${escape(r.color)}</td><td class="num">${r.pay?rub(r.pay):"—"}</td><td class="num">${r.bonus?rub(r.bonus):"—"}</td></tr>`).join(""))+
        `</section>`+
        `</div>`+
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
    function kmSideList(m){
      const cars=kmStockCars(m).slice().sort((a,b)=>{
        const pa=PRIO_VINS.has(a.vin)?0:1;
        const pb=PRIO_VINS.has(b.vin)?0:1;
        if(pa!==pb) return pa-pb;
        const fa=kmTrimFit(m,a)?0:1;
        const fb=kmTrimFit(m,b)?0:1;
        if(fa!==fb) return fa-fb;
        if(a.status!==b.status) return a.status==="in"?-1:1;
        return (a.color||"").localeCompare(b.color||"");
      });
      const inn=cars.filter(c=>c.status==="in").length;
      const way=cars.filter(c=>c.status==="way").length;
      if(!cars.length){
        return `<div class="card stock-side"><p class="eyebrow">Склад</p><p class="lead" style="max-width:none">Нет машин этой модели в наличии и в пути.</p></div>`;
      }
      const block=(title, arr)=>!arr.length?"":`<p class="stock-h">${title} · ${arr.length}</p>`+arr.map(c=>{
        const prio=PRIO_VINS.has(c.vin);
        const on=kmVin===c.vin;
        const st=c.status==="in"?"в наличии":"в пути";
        return `<button type="button" class="stock-car${prio?" prio":""}${on?" on":""}" data-km-vin="${escape(c.vin)}">
          <b>${escape(c.color||"—")} · ${escape(c.trim||"")}${prio?" · приоритет":""}</b>
          <span class="vin">${escape(c.vin)}</span>
          <span class="stock-meta">${st}${c.invoice?" · спец инвойс":""}${c.mpt?" · МПТ":""}${c.note?" · "+escape(c.note):""}</span>
        </button>`;
      }).join("");
      return `<div class="card stock-side">
        <p class="eyebrow">Склад · ${escape(m.name)}</p>
        <p class="lead" style="max-width:none;margin:0 0 10px">В наличии ${inn} · в пути ${way}. Приоритет подсвечен.</p>
        ${block("В наличии", cars.filter(c=>c.status==="in"))}
        ${block("В пути", cars.filter(c=>c.status==="way"))}
      </div>`;
    }
