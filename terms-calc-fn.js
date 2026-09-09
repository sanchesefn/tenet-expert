    const TERMS_DATE = "10.09.2026";
    const KM_CORRIDOR = [{model:"T4",trim:"T4 2025",km:"-30 / 20",note:""},{model:"T4L",trim:"Active",km:"0 / 50",note:""},{model:"T4L",trim:"Prime",km:"0 / 50",note:""},{model:"T7",trim:"Все",km:"0 / 50",note:""},{model:"T8",trim:"Приоритет",km:"-20 / 0",note:"VIN из списка"},{model:"T8",trim:"Остальные",km:"0 / 30",note:""},{model:"T9",trim:"Приоритет",km:"-20 / 0",note:"VIN из списка"},{model:"T9",trim:"Остальные",km:"0 / 30",note:""},{model:"A8",trim:"Приоритет",km:"-30 / 0",note:"VIN из списка"},{model:"A8",trim:"Остальные",km:"0 / 30",note:""}];
    const TERMS_BONUS = [{model:"T4",trim:"T4 2025",bonus:"3%"},{model:"T4L",trim:"Active",bonus:"1%"},{model:"T4L",trim:"Prime",bonus:"3%"},{model:"T7",trim:"Любые",bonus:"2%"},{model:"T8",trim:"2WD",bonus:"2%"},{model:"T8",trim:"4WD",bonus:"3%"},{model:"T9",trim:"Prime",bonus:"0%"},{model:"T9",trim:"Ultra",bonus:"2%"},{model:"A8",trim:"Любые",bonus:"2%"}];
    const TERMS_MPT = [{line:"T7 2WD",rows:[["до 14.03","субс. бренда"],["с 14.03 до 15.04","МПТ"],["с 15.04 до 7.05","субс. бренда"],["с 8.05 и далее","МПТ"]]},{line:"T7 4WD",rows:[["до 7.04","субс. бренда"],["с 8.04 до 15.04","МПТ"],["с 16.04 до 7.05","субс. бренда"],["с 8.05 и далее","МПТ"]]}];
    const TERMS_INV = [{model:"T4L",trim:"Active",price:"2 200 нал, 2 150 ТИ"},{model:"T4L",trim:"Prime",price:"2 300 нал, 2 250 ТИ"},{model:"T7",trim:"Prime 2WD",price:"2 550 нал, 2 450 ТИ"},{model:"T8",trim:"Prime 4WD",price:"3 100 нал, 3 000 ТИ"},{model:"T8",trim:"Ultra 4WD",price:"3 300 нал, 3 200 ТИ"}];
    const TERMS_PRIO = [{model:"T4",vin:"EDEED31B1SE053704",trim:"Prime 4WD",year:"2025",color:"Белый",extra:"Сидоров",pay:500,bonus:1000},{model:"T7",vin:"EDXFB32B4TE041659",trim:"Active",year:"2026",color:"Чёрный",extra:"",pay:500,bonus:1000},{model:"T7",vin:"EDXFB32B2TE041658",trim:"Active",year:"2026",color:"Чёрный",extra:"",pay:500,bonus:1000},{model:"T7",vin:"EDXFB32B7TE062327",trim:"Active",year:"2026",color:"Чёрный",extra:"Антихром",pay:500,bonus:1000},{model:"T8",vin:"EDXGD34B1TE022143",trim:"Prime 4WD",year:"2026",color:"Светло-серый",extra:"",pay:500,bonus:2000},{model:"T8",vin:"EDXGD34B6TE031162",trim:"Prime 4WD",year:"2026",color:"Чёрный",extra:"",pay:500,bonus:2000},{model:"T8",vin:"EDXGD34B3TE031815",trim:"Ultra 4WD",year:"2026",color:"Белый",extra:"",pay:500,bonus:2000},{model:"Tiggo 9",vin:"EDEDD24B2SG003755",trim:"Ultra",year:"2025",color:"Светло-серый",extra:"",pay:500,bonus:3000},{model:"Tiggo 9",vin:"EDEDD24B3SG003926",trim:"Ultra",year:"2025",color:"Матовый",extra:"",pay:500,bonus:3000},{model:"Tiggo 9",vin:"EDEDD24B1SG002595",trim:"Ultra",year:"2025",color:"Чёрный",extra:"Новиков",pay:500,bonus:0},{model:"Arrizo 8",vin:"LVVDC21B7SD594110",trim:"Prime",year:"2025",color:"Белый",extra:"",pay:500,bonus:3000},{model:"Arrizo 8",vin:"LVVDC21B0SD594112",trim:"Prime",year:"2025",color:"Белый",extra:"",pay:500,bonus:3000},{model:"Arrizo 8",vin:"LVVDC21B2SDJ34062",trim:"Prime",year:"2025",color:"Чёрный",extra:"",pay:500,bonus:3000},{model:"8 Pro Max",vin:"LVTDD24B5RD409189",trim:"Ultimate",year:"2024",color:"Белый",extra:"ТЕСТ · 2 850",pay:500,bonus:10000}];
    const KM_MODELS = [
      {id:"t4p",brand:"TENET",name:"T4 Prime 2025",rrc:2449000,dealer:2369000,ti:100000,tiBack:80000,cr:0,crBack:0,bonus:0.03,vat:1.22,fee:0.01,kmMin:-30,kmMax:20,prioMin:-30,prioMax:20},
      {id:"t4la",brand:"TENET",name:"T4L Active",rrc:2329000,dealer:2234000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.01,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50},
      {id:"t4lp",brand:"TENET",name:"T4L Prime",rrc:2479000,dealer:2389000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.03,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50},
      {id:"t7a",brand:"TENET",name:"T7 Active 2WD",rrc:2785000,dealer:2645000,ti:180000,tiBack:130000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50},
      {id:"t7p",brand:"TENET",name:"T7 Prime 2WD",rrc:2985000,dealer:2840000,ti:200000,tiBack:150000,cr:50000,crBack:30000,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50},
      {id:"t7a4",brand:"TENET",name:"T7 Active 4WD",rrc:2990000,dealer:2860000,ti:130000,tiBack:90000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50},
      {id:"t7p4",brand:"TENET",name:"T7 Prime 4WD",rrc:3190000,dealer:3045000,ti:150000,tiBack:110000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50},
      {id:"t8a",brand:"TENET",name:"T8 Active 2WD",rrc:3099000,dealer:2999000,ti:200000,tiBack:150000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-20,prioMax:0},
      {id:"t8p",brand:"TENET",name:"T8 Prime 2WD",rrc:3299000,dealer:3149000,ti:200000,tiBack:150000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-20,prioMax:0},
      {id:"t8p4",brand:"TENET",name:"T8 Prime 4WD",rrc:3630000,dealer:3465000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.03,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-20,prioMax:0},
      {id:"t8u4",brand:"TENET",name:"T8 Ultra 4WD",rrc:3885000,dealer:3705000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.03,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-20,prioMax:0},
      {id:"ta8p",brand:"TENET",name:"A8 Prime 1.6",rrc:2999000,dealer:2874000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"ta8u",brand:"TENET",name:"A8 Ultra 2.0",rrc:3499000,dealer:3354000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"t9p",brand:"CHERY",name:"Tiggo 9 Prime 4WD",rrc:4335000,dealer:3895000,ti:300000,tiBack:250000,cr:0,crBack:0,bonus:0,vat:1.2,fee:0.02,kmMin:0,kmMax:30,prioMin:-20,prioMax:0},
      {id:"t9u",brand:"CHERY",name:"Tiggo 9 Ultra 4WD",rrc:4640000,dealer:4200000,ti:200000,tiBack:150000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:0,kmMax:30,prioMin:-20,prioMax:0},
      {id:"a8a",brand:"CHERY",name:"Arrizo 8 Active",rrc:2865000,dealer:2649000,ti:250000,tiBack:230000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"a8p",brand:"CHERY",name:"Arrizo 8 Prime",rrc:3060000,dealer:2699000,ti:200000,tiBack:180000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"a8u",brand:"CHERY",name:"Arrizo 8 Ultra Black",rrc:3275000,dealer:2899000,ti:200000,tiBack:180000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"t7l",brand:"CHERY",name:"Tiggo 7 L Active",rrc:2735000,dealer:2620000,ti:100000,tiBack:70000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:0,kmMax:30,prioMin:0,prioMax:30}
    ];
    function sheet(headers, rows){
      return `<div style="overflow:auto"><table class="sheet"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    function terms(){
      if(needAuth()) return login();
      return banner("Торговые условия","Файл «Торговые условия» · с "+TERMS_DATE,"TENET")+
        `<p class="lead">Клиенту называть рекомендованную цену. Максимум с выгодами — после расчёта РОП. КМ — коридор доходности без НДС, тыс. руб.</p>`+
        `<div class="note-box">Скидки импортёра не обещать, если их нет в прайсе. Цифры внутренние.</div>`+
        `<h2>Доходность</h2>`+sheet(["Модель","Комплектация","КМ","Доп. условия"], KM_CORRIDOR.map(r=>`<tr><td><b>${escape(r.model)}</b></td><td>${escape(r.trim)}</td><td class="num">${escape(r.km)}</td><td style="color:var(--muted);font-size:12px">${escape(r.note||"")}</td></tr>`).join(""))+
        `<h2>Бонусы</h2>`+sheet(["Модель","Комплектация","Бонус"], TERMS_BONUS.map(r=>`<tr><td><b>${escape(r.model)}</b></td><td>${escape(r.trim)}</td><td class="num">${escape(r.bonus)}</td></tr>`).join(""))+
        `<h2>МПТ / субсидия TENET</h2>`+TERMS_MPT.map(g=>`<h3 style="margin:14px 0 6px;font-size:16px">${escape(g.line)}</h3>`+sheet(["Дата производства","Условие"], g.rows.map(r=>`<tr><td>${escape(r[0])}</td><td><b>${escape(r[1])}</b></td></tr>`).join(""))).join("")+
        `<h2>Спец инвойс</h2>`+sheet(["Модель","Комплектация","Цена с уч. допов"], TERMS_INV.map(r=>`<tr><td><b>${escape(r.model)}</b></td><td>${escape(r.trim)}</td><td class="num">${escape(r.price)}</td></tr>`).join(""))+
        `<h2>Приоритет · ${TERMS_PRIO.length} авто</h2><p class="lead">Личный план 2 · командный план 12. Всего 14.</p>`+
        sheet(["Авто","VIN","Цвет","Взнос","Бонус"], TERMS_PRIO.map(r=>`<tr><td><b>${escape(r.model)}</b><div style="color:var(--muted);font-size:12px">${escape(r.trim)} · ${escape(r.year)}${r.extra?" · "+escape(r.extra):""}</div></td><td class="vin">${escape(r.vin)}</td><td>${escape(r.color)}</td><td class="num">${r.pay?rub(r.pay):"—"}</td><td class="num">${r.bonus?rub(r.bonus):"—"}</td></tr>`).join(""))+
        `<h2>Рекомендованные цены</h2>`+sheet(["Модель","Агрегат","Цена"], PRICE_ROWS.map(r=>`<tr><td><b>${escape(r.name)}</b><div style="color:var(--muted);font-size:12px">${r.brand}</div></td><td>${escape(r.motor)}</td><td class="num">${rub(r.price)} ₽</td></tr>`).join(""))+
        `<p class="lead">Доплата за 4WD на T7 — 205 000 ₽. Мотор T7 везде 1.6T 150.</p><div class="who-line"><button class="btn ivory" data-go="calc">В калькулятор</button><button class="btn ghost" data-go="docs">Документы</button></div>`;
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
    function calcKm(){
      if(typeof kmId!=="string" || !KM_MODELS.some(x=>x.id===kmId)) kmId=KM_MODELS[0].id;
      const m=KM_MODELS.find(x=>x.id===kmId)||KM_MODELS[0];
      const fresh=(typeof kmShown==="undefined")||kmShown!==kmId;
      kmShown=kmId;
      const rrc=fresh?m.rrc:kmVal("kmRrc", m.rrc);
      const invoice=fresh?m.dealer:kmVal("kmInv", m.dealer);
      const useTi=kmVal("kmUseTi", false);
      const useCr=kmVal("kmUseCr", false);
      const prio=kmVal("kmPrio", false);
      const family=kmVal("kmFam", 0);
      const spec=kmVal("kmSpec", 0);
      const dealer=kmVal("kmDc", 0);
      const addons=kmVal("kmDo", 50000);
      const card=kmVal("kmCard", 0);
      const casco=kmVal("kmCasco", 0);
      const tiAmt=useTi?m.ti:0;
      const tiBack=useTi?m.tiBack:0;
      const crAmt=useCr?m.cr:0;
      const crBack=useCr?m.crBack:0;
      const lo=prio?m.prioMin:m.kmMin;
      const hi=prio?m.prioMax:m.kmMax;
      const discount=tiAmt+family+spec+dealer+crAmt;
      const bonus=invoice>0?(invoice/m.vat)*m.bonus:0;
      const margin=rrc-invoice;
      const client=rrc-discount;
      const iron=margin-discount+tiBack+crBack+family+spec+bonus*1.2;
      const km=(addons*0.3+casco*0.3+card*0.8+iron)/m.vat-client*m.fee;
      const kmK=km/1000;
      const ok=kmK+0.05>=lo && kmK-0.05<=hi;
      return banner("Калькулятор","КМ по файлу от "+TERMS_DATE,"TENET")+`
        <p class="lead">Расчёт доходности менеджера. Цифры внутренние. Клиенту — только РРЦ и цену после РОП.</p>
        <div class="study-pick" style="margin-top:12px">
          <button class="chip ${calcMode==="pay"?"on":""}" data-calc-mode="pay">Платёж</button>
          <button class="chip ${calcMode==="km"?"on":""}" data-calc-mode="km">Калькулятор КМ</button>
        </div>
        <div class="calc-grid">
          <div class="card">
            <label class="field" style="max-width:none;margin-top:0"><span>Комплектация · база ${TERMS_DATE}</span>
              <select id="kmPreset">${KM_MODELS.map(x=>`<option value="${x.id}" ${x.id===m.id?"selected":""}>${x.brand} · ${x.name} · ${rub(x.rrc)}</option>`).join("")}</select>
            </label>
            <label class="field" style="max-width:none"><span>РРЦ, ₽</span><input id="kmRrc" inputmode="numeric" value="${rrc}" /></label>
            <label class="field" style="max-width:none"><span>Сумма счёта, ₽</span><input id="kmInv" inputmode="numeric" value="${invoice}" /></label>
            <label class="field" style="max-width:none;display:flex;gap:8px;align-items:center"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} style="width:auto" /> <span>Трейд-ин ${m.ti?rub(m.ti)+" / возм. "+rub(m.tiBack):"нет в базе"}</span></label>
            <label class="field" style="max-width:none;display:flex;gap:8px;align-items:center"><input id="kmUseCr" type="checkbox" ${useCr?"checked":""} style="width:auto" /> <span>Выгодный кредит ${m.cr?rub(m.cr)+" / возм. "+rub(m.crBack):"нет в базе"}</span></label>
            <label class="field" style="max-width:none;display:flex;gap:8px;align-items:center"><input id="kmPrio" type="checkbox" ${prio?"checked":""} style="width:auto" /> <span>Приоритетный VIN</span></label>
            <label class="field" style="max-width:none"><span>Семейный, ₽</span><input id="kmFam" inputmode="numeric" value="${family}" /></label>
            <label class="field" style="max-width:none"><span>Спецпредложение, ₽</span><input id="kmSpec" inputmode="numeric" value="${spec}" /></label>
            <label class="field" style="max-width:none"><span>Скидка от ДЦ, ₽</span><input id="kmDc" inputmode="numeric" value="${dealer}" /></label>
            <label class="field" style="max-width:none"><span>Д/О, ₽</span><input id="kmDo" inputmode="numeric" value="${addons}" /></label>
            <label class="field" style="max-width:none"><span>СЖ / карта, ₽</span><input id="kmCard" inputmode="numeric" value="${card}" /></label>
            <label class="field" style="max-width:none"><span>КАСКО, ₽</span><input id="kmCasco" inputmode="numeric" value="${casco}" /></label>
          </div>
          <div class="card ${ok?"ok":"bad"}">
            <p class="eyebrow">Доход без НДС · КМ</p>
            <div class="calc-out">${rub(Math.round(km))} ₽</div>
            <p class="calc-note">Коридор ${lo} … ${hi} тыс. · сейчас ${kmK.toFixed(1)} тыс. · ${ok?"в коридоре":"вне коридора"}</p>
            <div class="note-box">Цена клиенту <b>${rub(Math.round(client))} ₽</b><br/>Скидка ${rub(Math.round(discount))} · маржа 1С ${rub(Math.round(margin))}<br/>Бонус ${rub(Math.round(bonus))} (${Math.round(m.bonus*100)}%) · доход на железе ${rub(Math.round(iron))}<br/>НДС ${m.vat===1.22?"22%":"20%"} · сбор ${Math.round(m.fee*100)}% от цены клиента</div>
          </div>
        </div>`;
    }
    function calc(){
      if(needAuth()) return login();
      if(typeof calcMode==="string" && calcMode==="km") return calcKm();
      const price=Number((document.getElementById("cPrice")||{}).value)||PRICE_ROWS[0].price;
      const down=Number((document.getElementById("cDown")||{}).value)||Math.round(price*0.2);
      const months=Number((document.getElementById("cMonths")||{}).value)||60;
      const rate=Number((document.getElementById("cRate")||{}).value)||18.9;
      const pay=calcPay(price, down, months, rate);
      const credit=Math.max(0,price-down);
      const over=pay*months-credit;
      return banner("Калькулятор","Ориентир платежа и калькулятор КМ","TENET")+`
        <p class="lead">Платёж — цифра для разговора. Одобрение и ставка — только банк.</p>
        <div class="study-pick" style="margin-top:12px">
          <button class="chip ${calcMode!=="km"?"on":""}" data-calc-mode="pay">Платёж</button>
          <button class="chip ${calcMode==="km"?"on":""}" data-calc-mode="km">Калькулятор КМ</button>
        </div>
        <div class="calc-grid">
          <div class="card">
            <label class="field" style="max-width:none;margin-top:0"><span>Комплектация</span>
              <select id="cPreset">${PRICE_ROWS.map(r=>`<option value="${r.price}" ${r.price===price?"selected":""}>${r.name} · ${rub(r.price)} ₽</option>`).join("")}</select>
            </label>
            <label class="field" style="max-width:none"><span>Цена, ₽</span><input id="cPrice" inputmode="numeric" value="${price}" /></label>
            <label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>
            <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>
            <label class="field" style="max-width:none"><span>Ставка, % годовых</span><input id="cRate" inputmode="decimal" value="${rate}" /></label>
          </div>
          <div class="card">
            <p class="eyebrow">Платёж в месяц</p>
            <div class="calc-out">${rub(Math.round(pay))} ₽</div>
            <p class="calc-note">Кредит ${rub(credit)} ₽ · переплата ~${rub(Math.round(over))} ₽ · ${months} мес.</p>
            <div class="note-box">Не путать с «максимальной ценой с выгодами».</div>
          </div>
        </div>`;
    }
