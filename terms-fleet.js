    const CORP_VINS = new Set([
      "EDXFB32B2TE041658",
      "EDXFB32B4TE041659",
      "EDXFB32B1TE087336",
      "EDXFB32B3TE091114",
      "EDXFD32B4TE092587",
      "EDXFD32B4TE092590"
    ]);
    const FLEET_BFS = {
      t9p:{name:"Tiggo 9 Prime 4WD",rrc:4335000,dealer:3895000,an:546000,client:3814800,prem:166900,km:49918,tidy:3789000,sub:241000,do:70000,casco:80000},
      t9u:{name:"Tiggo 9 Ultra 4WD",rrc:4640000,dealer:4200000,an:591000,client:4083200,prem:209600,km:48033,tidy:4049000,sub:241000,do:70000,casco:80000},
      a8a:{name:"Arrizo 8 Active",rrc:2865000,dealer:2649000,an:376000,client:2492550,prem:213750,km:44057,tidy:2489000,sub:150000,do:70000,casco:80000},
      a8p:{name:"Arrizo 8 Prime",rrc:3060000,dealer:2699000,an:491000,client:2570400,prem:189800,km:49016,tidy:2569000,sub:150000,do:70000,casco:80000},
      a8u:{name:"Arrizo 8 Ultra Black",rrc:3275000,dealer:2899000,an:596000,client:2685500,prem:279000,km:48361,tidy:2679000,sub:150000,do:70000,casco:80000},
      t4p:{name:"T4 Prime 2025",rrc:2449000,dealer:2369000,an:200000,client:2253080,prem:164900,km:36803,tidy:2249000,sub:120000,do:70000,casco:80000},
      t4la:{name:"T4L Active",rrc:2329000,dealer:2234000,an:140000,client:2189260,prem:91320,km:37967,tidy:2189000,sub:100000,do:70000,casco:80000},
      t4lp:{name:"T4L Prime",rrc:2479000,dealer:2389000,an:230000,client:2255890,prem:182690,km:34992,tidy:2249000,sub:100000,do:70000,casco:80000},
      t7a:{name:"T7 Active 2WD",rrc:2785000,dealer:2645000,an:396000,client:2395100,prem:305600,km:40656,tidy:2389000,sub:150000,do:70000,casco:80000},
      t7p:{name:"T7 Prime 2WD",rrc:2985000,dealer:2840000,an:456000,client:2537250,prem:362450,km:42172,tidy:2529000,sub:150000,do:70000,casco:80000},
      t7a4:{name:"T7 Active 4WD",rrc:2990000,dealer:2860000,an:461000,client:2541500,prem:378300,km:38770,tidy:2529000,sub:150000,do:70000,casco:80000},
      t7p4:{name:"T7 Prime 4WD",rrc:3190000,dealer:3045000,an:491000,client:2711500,prem:397300,km:42049,tidy:2699000,sub:150000,do:70000,casco:80000},
      t8a:{name:"T8 Active 2WD",rrc:3099000,dealer:2999000,an:310000,client:2789100,prem:271880,km:50721,tidy:2789000,sub:130000,do:70000,casco:80000},
      t8p:{name:"T8 Prime 2WD",rrc:3299000,dealer:3149000,an:430000,client:2870130,prem:344850,km:53156,tidy:2869000,sub:130000,do:70000,casco:80000},
      t8p4:{name:"T8 Prime 4WD",rrc:3630000,dealer:3465000,an:481000,client:3158100,prem:379500,km:52049,tidy:3149000,sub:130000,do:70000,casco:80000},
      t8u4:{name:"T8 Ultra 4WD",rrc:3885000,dealer:3705000,an:536000,client:3379950,prem:402750,km:38320,tidy:3349000,sub:130000,do:70000,casco:80000},
      tt9p:{name:"T9 Prime 5-seat",rrc:3949000,dealer:3799000,an:550000,client:3435630,prem:442350,km:34713,tidy:3399000,sub:0,do:70000,casco:80000},
      tt9u:{name:"T9 Ultra 5-seat",rrc:4299000,dealer:4099000,an:650000,client:3697140,prem:487840,km:31016,tidy:3649000,sub:0,do:70000,casco:80000},
      ta8p:{name:"A8 Prime 1.6",rrc:2999000,dealer:2874000,an:400000,client:2639120,prem:294860,km:16279,tidy:2599000,sub:150000,do:70000,casco:80000},
      ta8u:{name:"A8 Ultra 2.0",rrc:3499000,dealer:3354000,an:500000,client:3044130,prem:379850,km:20369,tidy:2999000,sub:150000,do:70000,casco:80000},
      l4s:{name:"L4 Style",rrc:2540000,dealer:2438400,an:0,client:2235200,prem:0,km:0,tidy:2235200,sub:100000,do:70000,casco:80000},
      l4e:{name:"L4 Elegant",rrc:2690000,dealer:2582400,an:0,client:2313400,prem:0,km:0,tidy:2313400,sub:100000,do:70000,casco:80000},
      l6e:{name:"L6 Elegant",rrc:2890000,dealer:2745500,an:0,client:2456500,prem:0,km:0,tidy:2456500,sub:150000,do:70000,casco:80000},
      l6u:{name:"L6 Ultra",rrc:3040000,dealer:2888000,an:0,client:2584000,prem:0,km:0,tidy:2584000,sub:150000,do:70000,casco:80000}
    };
    const FLEET_TI = 100000;
    function fleetMonthsLeft(principal, payment, annual){
      if(!(principal>0)) return 0;
      const r=(Number(annual)||0)/100/12;
      const p=Number(payment)||0;
      if(!(p>0)) return null;
      if(r<=0) return Math.ceil(principal/p);
      if(p<=principal*r+1e-6) return null;
      const n=Math.log(p/(p-principal*r))/Math.log(1+r);
      const months=Math.ceil(n-1e-6);
      return months<1?1:months;
    }
    function fleetSubQuote(base, sub, down, doAmt, cascoAmt, months, limitPv){
      base=Math.max(0, Math.round(Number(base)||0));
      sub=Math.max(0, Math.min(base, Math.round(Number(sub)||0)));
      const price=Math.max(0, base-sub);
      const want=Math.max(0, Math.round(Number(down)||0));
      const doCasco=Math.max(0, Math.round(Number(doAmt)||0))+Math.max(0, Math.round(Number(cascoAmt)||0));
      const cap49=Math.round(base*0.49);
      const maxPv=Math.max(0, cap49-sub);
      const earlyCap=Math.round(base*0.25);
      const limited=!!limitPv && sub>0;
      let pv, early=0, earlyOver=0;
      if(limited){
        pv=Math.min(want, maxPv);
        const raw=Math.max(0, want-pv);
        early=Math.min(raw, earlyCap);
        earlyOver=raw-early;
      }else pv=Math.min(want, price+doCasco);
      const pvExtras=Math.min(pv, doCasco);
      const pvCar=Math.max(0, pv-pvExtras);
      const extrasCredit=Math.max(0, doCasco-pvExtras);
      const credit=Math.max(0, price-pvCar+extrasCredit);
      const term=Math.min(Math.max(1, Math.round(Number(months)||84)), 84);
      const rate=19.2;
      const pay=typeof calcPay==="function"?calcPay(credit+pvCar, pvCar, term, rate):0;
      let termAfter=term;
      if(early>0){
        const left=Math.max(0, credit-early);
        const n=fleetMonthsLeft(left, pay, rate);
        termAfter=n==null?term:Math.min(term, n);
      }
      const owe=Math.max(0, credit-early);
      const over=termAfter>0?pay*termAfter-owe:0;
      return {base, sub, price, cap49, maxPv, earlyCap, limited, pv, early, earlyOver, doCasco, pvExtras, pvCar, extrasCredit, credit, term, termAfter, rate, pay, over};
    }
    function fleetSubBreak(q, o){
      o=o||{};
      const rows=[];
      if(o.name) rows.push(`<div class="bank-row"><span>Комплектация</span><span class="pay">${escape(o.name)}</span></div>`);
      if(o.stock) rows.push(`<div class="bank-row"><span>На складе</span><span class="pay">${o.stock}</span></div>`);
      if(o.rrc!=null) rows.push(`<div class="bank-row"><span>РРЦ</span><span class="pay">${rub(o.rrc)}</span></div>`);
      rows.push(`<div class="bank-row"><span>${o.trade?"Флит + трейд-ин":"Флит"}</span><span class="pay">${rub(q.base)}</span></div>`);
      if(q.sub) rows.push(`<div class="bank-row"><span>Субсидия бренда</span><span class="pay">− ${rub(q.sub)}</span></div>`);
      rows.push(`<div class="bank-row"><span>Цена для кредита</span><span class="pay">${rub(q.price)}</span></div>`);
      rows.push(`<div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(q.pv)}</span></div>`);
      rows.push(`<div class="bank-row"><span>из них каско и Д/О</span><span class="pay">${rub(q.pvExtras)}</span></div>`);
      rows.push(`<div class="bank-row"><span>ПВ в авто</span><span class="pay">${rub(q.pvCar)}</span></div>`);
      if(q.extrasCredit) rows.push(`<div class="bank-row"><span>Д/О и каско в кредите</span><span class="pay">${rub(q.extrasCredit)}</span></div>`);
      if(q.early) rows.push(`<div class="bank-row"><span>Досрочно · сокращает срок, не платёж</span><span class="pay">${rub(q.early)}</span></div>`);
      if(q.earlyOver) rows.push(`<div class="bank-row"><span>Сверх 25% в программу не входит</span><span class="pay">${rub(q.earlyOver)}</span></div>`);
      rows.push(`<div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(q.credit)}</span></div>`);
      return `<div class="mpt-break">${rows.join("")}</div>`;
    }
    function fleetSubNote(q){
      const bits=[];
      if(q.limited) bits.push("ПВ "+rub(q.pv)+" + субсидия "+rub(q.sub)+" не больше 49% от "+rub(q.base));
      bits.push("Каско и Д/О "+rub(q.doCasco)+" из взноса");
      if(q.extrasCredit) bits.push(rub(q.extrasCredit)+" Д/О и каско остаются в кредите");
      if(q.early) bits.push(rub(q.early)+" досрочно: срок "+q.term+" → "+q.termAfter+" мес., платёж тот же. Потолок 25% ("+rub(q.earlyCap)+")");
      if(q.earlyOver) bits.push(rub(q.earlyOver)+" сверх 25% в программу не входит");
      return bits.join(". ")+".";
    }
    function isT8TwoWd(c){
      if(!c || c.invoice) return false;
      const vin=String(c.vin||"").toUpperCase();
      if(vin.indexOf("EDXGB32B")===0) return true;
      if(String(c.model||"").toLowerCase()!=="t8") return false;
      const t=String(c.trim||"").toLowerCase();
      if(t.includes("4wd")||t.includes("ультра")||t.includes("7 мест")) return false;
      return t.includes("2wd") || t.includes("актив") || t.includes("прайм") || !t;
    }
    function carIsMpt(c){ return !!(c && !c.invoice && (c.mpt || isT8TwoWd(c))); }
    function carIsCorp(c){ return !!(c && !c.invoice && (c.corp || (typeof CORP_VINS!=="undefined"&&CORP_VINS.has(c.vin)) || isT8TwoWd(c))); }
    function kmHasBrandSub(m){
      if(!m || m.id==="tt9p" || m.id==="tt9u" || m.stock==="tt9") return false;
      const f=typeof fleetOf==="function"?fleetOf(m.id):null;
      return !!(f && (f.sub||0)>0);
    }
    function kmIsCorp(vin){
      const v=String(vin||"");
      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===v);
      if(car && car.invoice) return false;
      if(typeof isT8TwoWd==="function" ? isT8TwoWd(car||{vin:v}) : String(v).toUpperCase().indexOf("EDXGB32B")===0) return false;
      if(typeof CORP_VINS!=="undefined" && CORP_VINS.has(v)) return true;
      if(car && car.corp) return true;
      return false;
    }
    function stockIsDemo(c){
      if(!c) return false;
      if(c.demo) return true;
      const v=String(c.vin||"").toUpperCase();
      return v==="EDXGD34B2TE109064" || v==="EDXGB32B0TE110108";
    }
    function fleetOf(id){
      return FLEET_BFS[id] || FLEET_BFS.t9u;
    }
    function fleetPayRows(list, payKey, overKey, months){
      return list.map(b=>{
        const yearsWant=Math.round(months/12);
        const yearsHave=Math.round(b.term/12);
        const note=b.termNote?b.termNote:(b.capped?`нет ${yearsWant} ${yearsWant===1?"года":"лет"} · считаем ${b.term} мес. (${yearsHave} ${yearsHave===1?"год":yearsHave<5?"года":"лет"})`: `${b.term} мес.`);
        const pay=Math.round(b[payKey]||0);
        const over=Math.round(b[overKey]||0);
        return `<div class="bank-row"><span><b>${escape(b.name)}</b><br/><small>${b.rate}% · ${note} · переплата ~${rub(over)}</small></span><span class="pay">${rub(pay)} ₽</span></div>`;
      }).join("");
    }
    function fleetCreditBox(price, m, f, useFleet, useTi, mode){
      const isSub=mode==="sub";
      const base=Math.max(0, Math.round((useFleet?(f.tidy||f.rrc):(f.rrc||0))-(useTi?FLEET_TI:0)));
      const subAmt=isSub?Math.max(0, Math.round((f&&f.sub)||0)):0;
      const months=typeof kmVal==="function"?kmVal("cMonths", 84):84;
      const _down=typeof kmDownRead==="function"?kmDownRead(base, false, false):null;
      const downMode=_down?_down.downMode:(typeof kmStr==="function"?kmStr("cDownMode","sum"):"sum");
      let downPct=_down?_down.downPct:20;
      let down=_down?_down.down:Math.round(base*0.2);
      const addons=typeof kmVal==="function"?kmVal("kmDo", 70000):70000;
      const pack=typeof kmVal==="function"?kmVal("kmPack", 150000):150000;
      const finDelta=(addons-70000)+(pack-150000);
      const q=fleetSubQuote(base, subAmt, down, addons, pack, months, isSub);
      const creditMpt=q.credit;
      const banksMpt=[{id:"sovcom", name:"Совкомбанк", rate:q.rate, term:q.termAfter, capped:!q.early && q.term!==months, termNote:q.early?(q.termAfter+" мес. вместо "+q.term+" · досрочное не меняет платёж"):"", payMpt:q.pay, overMpt:q.over}];
      const priceReg=Math.max(0, (m&&m.rrc?m.rrc:f.rrc)-(useTi&&m&&m.ti?m.ti:0));
      const fee=typeof KM_BANK_FEE==="number"?KM_BANK_FEE:30000;
      const extras=addons+pack+fee;
      const downReg=downMode==="pct"?Math.round(priceReg*Math.max(0,downPct)/100):Math.max(0,Math.min(priceReg,down));
      const creditReg=Math.max(0, priceReg-downReg+extras);
      const rateGroup=typeof kmRateGroup==="function"?kmRateGroup(m):"t4l_t7";
      const banks=(typeof KM_BANKS!=="undefined"?KM_BANKS:[{id:"sovcom",name:"Совкомбанк",rate:19.2}]).map(b=>{
        const look=typeof kmBankRate==="function"?kmBankRate(b.id, rateGroup, months, downMode==="pct"?downPct:(priceReg>0?Math.round(downReg*1000/priceReg)/10:0)):{rate:b.rate||19.2, term:months, capped:false};
        const term=look.term||months;
        const pay=typeof calcPay==="function"?calcPay(priceReg+extras, downReg, term, look.rate):0;
        return Object.assign({}, b, {rate:look.rate, term, capped:!!look.capped, pay, over:pay*term-creditReg});
      });
      const stockCars=typeof kmStockCars==="function"?kmStockCars(m):[];
      const analog=stockCars.find(c=>!(typeof carIsMpt==="function"?carIsMpt(c):c.mpt) && !(typeof carIsCorp==="function"?carIsCorp(c):c.corp)) || stockCars.find(c=>!(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)) || null;
      const mptBreak=fleetSubBreak(q, {name:(f&&f.name)||(m&&m.name)||"", rrc:f.rrc, trade:!!useTi});
      const regBreak=`<div class="mpt-break">
                <div class="bank-row"><span>Комплектация</span><span class="pay">${escape((m&&m.name)||(f&&f.name)||"")}</span></div>
                ${analog?`<div class="bank-row"><span>Аналог на складе</span><span class="pay">${escape(analog.color||"—")} · ${escape(analog.vin||"")}</span></div>`:`<div class="bank-row"><span>Аналог</span><span class="pay">та же комплектация, обычный кредит</span></div>`}
                <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(m&&m.rrc?m.rrc:f.rrc)}</span></div>
                ${useTi?`<div class="bank-row"><span>Трейд-ин</span><span class="pay">− ${rub(m&&m.ti?m.ti:0)}</span></div>`:""}
                <div class="bank-row"><span>Цена авто</span><span class="pay">${rub(priceReg)}</span></div>
                <div class="bank-row"><span>ПВ</span><span class="pay">${rub(downReg)}</span></div>
                <div class="bank-row"><span>В кредит ещё Д/О + каско + комиссия</span><span class="pay">${rub(extras)}</span></div>
                <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditReg)}</span></div>
              </div>`;
      const inputs=`<div class="card km-pv">
        <p class="eyebrow">Первый взнос</p>
        <div class="km-pv-row">
          <div class="down-mode">
            <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
            <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
          </div>
          ${downMode==="sum"
            ?`<label class="field"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
            :`<label class="field"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
          <label class="field"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>
        </div>
        <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
        <p class="calc-note">${rub(down)} ₽ · ${downPct}% · одинаковые ПВ и срок для обоих расчётов</p>
      </div>`;
      const stdCol=`<div class="pay-col std km-pay">
            <p class="eyebrow">Стандартный кредит</p>
            <p class="calc-note">Та же комплектация без флита. ПВ ${rub(downReg)} · тело ${rub(creditReg)}</p>
            ${fleetPayRows(banks,"pay","over",months)}
            ${regBreak}
          </div>`;
      const altCol=`<div class="pay-col sub km-pay">
            <p class="eyebrow">${isSub?"Флит · субсидия бренда":"Флит · Совкомбанк 19,2%"}</p>
            ${fleetPayRows(banksMpt,"payMpt","overMpt",months)}
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
            <details class="calc-more">
              <summary>Подробности расчёта</summary>
              <p class="calc-note">${fleetSubNote(q)}</p>
              ${mptBreak}
            </details>
          </div>`;
      let pangoCol="";
      const _pgF=(m && typeof pangoOf==="function")?pangoOf(m.id):null;
      if(_pgF){
        const pFix=useTi?_pgF.ti:_pgF.cash;
        const pDownP=Math.max(0, Math.min(pFix, down));
        const pBundle=typeof PANGO_BUNDLE==="number"?PANGO_BUNDLE:150000;
        const pRateA=typeof PANGO_RATE_A==="number"?PANGO_RATE_A:17.4;
        const pRateB=typeof PANGO_RATE_B==="number"?PANGO_RATE_B:14.4;
        const pNssRate=typeof PANGO_NSS==="number"?PANGO_NSS:0.0089;
        const pYears=months/12;
        const pYearsLabel=Math.abs(pYears-Math.round(pYears))<0.05?String(Math.round(pYears)):pYears.toFixed(1);
        const yNum=Number(pYearsLabel);
        const pYearsWord=(yNum===1)?"год":(yNum>1&&yNum<5&&Math.abs(yNum-Math.round(yNum))<0.05?"года":"лет");
        const pBase=Math.max(0, pFix-pDownP)+pBundle+finDelta;
        const pNss=Math.round(pBase*pNssRate*pYears);
        const pCreditB=pBase+pNss;
        const pPayA=typeof calcPay==="function"?calcPay(pBase+pDownP, pDownP, months, pRateA):0;
        const pPayB=typeof calcPay==="function"?calcPay(pCreditB+pDownP, pDownP, months, pRateB):0;
        const pOverA=pPayA*months-pBase;
        const pOverB=pPayB*months-pCreditB;
        pangoCol=`<div class="pay-col pango km-pay">
            <p class="eyebrow">Спеццена · PANGO</p>
            <p class="eyebrow" style="margin-top:8px">17,4% без комиссий</p>
            <div class="bank-row pay-top"><span><b>Платёж</b><br/><small>${pRateA}% · ${months} мес. · переплата ~${rub(Math.round(pOverA))}</small></span><span class="pay">${rub(Math.round(pPayA))} ₽</span></div>
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(pBase)}</span></div>
            <p class="eyebrow" style="margin-top:8px">14,4% · НСС в теле</p>
            <div class="bank-row pay-top"><span><b>Платёж</b><br/><small>${pRateB}% · ${months} мес. · переплата ~${rub(Math.round(pOverB))}</small></span><span class="pay">${rub(Math.round(pPayB))} ₽</span></div>
            <div class="bank-row"><span>Тело с НСС</span><span class="pay">${rub(pCreditB)}</span></div>
            <details class="calc-more">
              <summary>Подробности расчёта</summary>
              <p class="calc-note">Если машина по спеццене. Фикс ${useTi?"с трейд-ин":"без трейд-ин"} ${rub(pFix)}. Каско + GAP + ДМС ${rub(pBundle)} всегда в кредите.</p>
              <div class="bank-row"><span>Цена авто</span><span class="pay">${rub(pFix)}</span></div>
              <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(pDownP)}</span></div>
              <div class="bank-row"><span>Каско + GAP + ДМС</span><span class="pay">${rub(pBundle)}</span></div>
              ${finDelta?`<div class="bank-row"><span>Д/О и каско сверх нормы</span><span class="pay">${finDelta>0?"+":"−"} ${rub(Math.abs(finDelta))}</span></div>`:""}
              <div class="bank-row"><span>НСС 0,89% × ${pYearsLabel} ${pYearsWord}</span><span class="pay">${rub(pNss)}</span></div>
            </details>
          </div>`;
      }
      return {inputs, stdCol, altCol, pangoCol};
    }
    function calcFleet(m){
      const f=fleetOf(m.id);
      const useFleet=kmVal("kmFleetDisc", true);
      const useTi=kmVal("kmUseTi", false);
      let price=f.rrc;
      const fleetCut=Math.max(0, f.rrc-(f.tidy||f.rrc));
      const steps=[];
      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===kmVin);
      const carMpt=typeof carIsMpt==="function"?carIsMpt(car):!!(car&&car.mpt);
      const canSub=typeof kmHasBrandSub==="function"?kmHasBrandSub(m):((f.sub||0)>0 && m.id!=="tt9p" && m.id!=="tt9u");
      const useMpt=false;
      const useSub=canSub && kmVal("kmFleetSub", true);
      if(useFleet && useTi){ price=Math.max(0, f.tidy-FLEET_TI); steps.push("флит + трейд-ин"); }
      else if(useFleet){ price=f.tidy; steps.push("флит −"+rub(fleetCut)); }
      else if(useTi){ price=Math.max(0, f.rrc-FLEET_TI); steps.push("флит + трейд-ин"); }
      if(useSub){ price=Math.max(0, price-(f.sub||0)); steps.push("субс. бренда −"+rub(f.sub||0)); }
      const mptCut=Math.round((useFleet?f.tidy:f.rrc)*(useTi?0.9:1)*0.1);
      const subCut=f.sub||0;
      const fleetBox=fleetCreditBox(price, m, f, useFleet, useTi, useSub?"sub":"fleet");
      return banner("Калькулятор","Флит · BFS Совкомбанк лизинг","TENET")+`
        <p class="lead">${fleetBox.pangoCol?"Три расчёта рядом: стандартный кредит, "+(useSub?"флит с субсидией бренда":"флит")+" и спеццена PANGO.":(useSub?"Скидки флита, стандартный кредит и справа флит с субсидией бренда.":"Скидки флита, стандартный кредит и флит Совкомбанк 19,2%.")}</p>
        <div class="km-stage${fleetBox?(fleetBox.pangoCol?" km-4":" km-3"):""}">
        <div class="km-chips">${kmChipGroups(m.id)}</div>
        <div class="km-layout${fleetBox?(fleetBox.pangoCol?" km-4":" km-3"):""}">
          <div class="card km-disc">
            <p class="eyebrow">BFS Совкомбанк лизинг · ${escape(f.name)}</p>
            ${car?`<p class="calc-note">${escape(car.vin)} · ${escape(car.color||"")} · ${escape(car.trim||"")}${carIsCorp(car)?" · корп":""}</p>`:""}
            <div class="note-box">Сбер / Альфа / Т-Банк на этот VIN нельзя. По центру — стандартный кредит той же комплектации. Справа — ${useSub?"флит с субсидией бренда":"флит Совкомбанк 19,2%"}.</div>
            <label class="check-row"><input id="kmFleetDisc" type="checkbox" ${useFleet?"checked":""} /> <span>Флит скидка ${rub(fleetCut)} · макс. выгода ${rub(f.an)}</span></label>
            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин ${rub(FLEET_TI)}</span></label>
            ${!useMpt&&canSub?`<label class="check-row"><input id="kmFleetSub" type="checkbox" ${useSub?"checked":""} /> <span>Субсидия бренда ${rub(subCut)}</span></label>`:""}
            <div class="note-box" style="margin-top:14px">
              <p class="eyebrow" style="margin:0 0 6px">Итоговая цена</p>
              ${price<f.rrc?`<div class="calc-out" style="text-decoration:line-through;opacity:.42;margin-bottom:2px">${rub(f.rrc)} ₽</div>`:""}
              <div class="calc-out">${rub(Math.round(price))} ₽</div>
              <p class="calc-note">${steps.length?steps.join(" → "):"Базовая цена без скидок."}${useFleet?" · AP без тюнинга "+rub(f.tidy):""}</p>
            </div>
          </div>
          ${fleetBox?`<div class="km-credit">${fleetBox.inputs}<div class="km-pays">${fleetBox.stdCol}${fleetBox.altCol}${fleetBox.pangoCol||""}</div></div>`:""}
        </div>
        </div>
        <div class="card">
              <p class="eyebrow">Лист «Флит» BFS</p>
              <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(f.rrc)} ₽</span></div>
              <div class="bank-row"><span>Макс. выгода AN</span><span class="pay">${rub(f.an)} ₽</span></div>
              <div class="bank-row"><span>Цена AP без тюнинга</span><span class="pay">${rub(f.tidy)} ₽</span></div>
              ${useMpt
                ? `<div class="bank-row"><span>МПТ −10%</span><span class="pay">${rub(mptCut)} ₽</span></div>`
                : (useSub?`<div class="bank-row"><span>Субсидия бренда AQ</span><span class="pay">${rub(subCut)} ₽</span></div>`:`<div class="bank-row"><span>Субсидия TENET</span><span class="pay">${rub(f.sub||0)} ₽</span></div>`)}
              <p class="calc-note">${useSub?"Порядок: флит"+(useTi?" + трейд-ин":"")+" → субсидия бренда. ПВ + субсидия не больше 49%. Остаток до 25% сокращает срок, не платёж.":"Порядок: флит"+(useTi?" + трейд-ин":"")+"."}</p>
            </div>
        <div class="km-bottom">
          <div class="card dc-result ok">
            <p class="eyebrow">КМ без НДС · флит BFS</p>
            <div class="calc-out">${rub(f.km)} ₽</div>
            <p class="calc-note">КМ с листа «Флит», блок BFS. Пауза банка, ориентир 21.09.</p>
          </div>
          ${kmSideList(m)}
        </div>`;
    }
