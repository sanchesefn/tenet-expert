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
      ta8u:{name:"A8 Ultra 2.0",rrc:3499000,dealer:3354000,an:500000,client:3044130,prem:379850,km:20369,tidy:2999000,sub:150000,do:70000,casco:80000}
    };
    const FLEET_TI = 50000;
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
        const note=b.capped?`нет ${yearsWant} ${yearsWant===1?"года":"лет"} · считаем ${b.term} мес. (${yearsHave} ${yearsHave===1?"год":yearsHave<5?"года":"лет"})`: `${b.term} мес.`;
        const pay=Math.round(b[payKey]||0);
        const over=Math.round(b[overKey]||0);
        return `<div class="bank-row"><span><b>${escape(b.name)}</b><br/><small>${b.rate}% · ${note} · переплата ~${rub(over)}</small></span><span class="pay">${rub(pay)} ₽</span></div>`;
      }).join("");
    }
    function fleetCreditBox(price, m, f, useFleet, useTi, mode){
      const isSub=mode==="sub";
      const cutLabel=isSub?"Субсидия бренда":"МПТ −10%";
      const headLabel=isSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%";

      const downMode=(typeof kmStr==="function"?kmStr("cDownMode","sum"):"sum");
      const months=typeof kmVal==="function"?kmVal("cMonths", 84):84;
      let downPct=typeof kmVal==="function"?kmVal("cDownPct", 20):20;
      const priceMpt=Math.round(price);
      let down=typeof kmVal==="function"?kmVal("cDown", Math.round(priceMpt*0.2)):Math.round(priceMpt*0.2);
      if(downMode==="pct") down=Math.round(priceMpt*Math.max(0,downPct)/100);
      else downPct=priceMpt>0?Math.round(down*1000/priceMpt)/10:0;
      down=Math.max(0,Math.min(priceMpt,down));
      const MPT_EXTRA=200000;
      const downMptShow=down;
      const downMptCar=Math.max(0, downMptShow-MPT_EXTRA);
      const creditMpt=Math.max(0, priceMpt-downMptCar);
      const mptTerm=Math.min(Math.max(1, months), 84);
      const payMpt=typeof calcPay==="function"?calcPay(priceMpt, downMptCar, mptTerm, 19.2):0;
      const overMpt=payMpt*mptTerm-creditMpt;
      const banksMpt=[{id:"sovcom", name:"Совкомбанк", rate:19.2, term:mptTerm, capped:mptTerm!==months, payMpt, overMpt}];
      const priceReg=Math.max(0, (m&&m.rrc?m.rrc:f.rrc)-(useTi&&m&&m.ti?m.ti:0));
      const addons=70000;
      const pack=150000;
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
      const mptBreak=`<div class="mpt-break">
                <div class="bank-row"><span>Комплектация</span><span class="pay">${escape((f&&f.name)||(m&&m.name)||"")}</span></div>
                <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(f.rrc)}</span></div>
                <div class="bank-row"><span>Флит</span><span class="pay">${rub(useFleet?f.tidy:f.rrc)}</span></div>
                ${useTi?`<div class="bank-row"><span>Трейд-ин</span><span class="pay">− ${rub(FLEET_TI)}</span></div>`:""}
                <div class="bank-row"><span>${cutLabel}</span><span class="pay">${rub(priceMpt)}</span></div>
                <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(downMptShow)}</span></div>
                <div class="bank-row"><span>из них каско и Д/О</span><span class="pay">${rub(Math.min(MPT_EXTRA, downMptShow))}</span></div>
                <div class="bank-row"><span>ПВ в авто</span><span class="pay">${rub(downMptCar)}</span></div>
                <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
              </div>`;
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
      const inputs=`<p class="eyebrow" style="margin-top:12px">Первый взнос</p>
        <div class="down-mode">
          <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
          <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
        </div>
        <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
        ${downMode==="sum"
          ?`<label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
          :`<label class="field" style="max-width:none"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
        <p class="calc-note">${rub(down)} ₽ · ${downPct}% · одинаковые ПВ и срок для обоих расчётов</p>
        <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>`;
      const stdCol=`<div class="pay-col std km-pay">
            <p class="eyebrow">Стандартный кредит</p>
            <p class="calc-note">Та же комплектация без флита. ПВ ${rub(downReg)} · тело ${rub(creditReg)}</p>
            ${fleetPayRows(banks,"pay","over",months)}
            ${regBreak}
          </div>`;
      const altCol=`<div class="pay-col ${isSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${isSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            <p class="calc-note">${isSub?"Машина не проходит под МПТ. Это не стандартный кредит: сначала флит, затем субсидия бренда (AQ), Совкомбанк 19,2%.":"МПТ −10% от флита. Совкомбанк 19,2%."}</p>
            ${mptBreak}
            <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${fleetPayRows(banksMpt,"payMpt","overMpt",months)}
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
        const pBase=Math.max(0, pFix-pDownP)+pBundle;
        const pNss=Math.round(pBase*pNssRate*pYears);
        const pCreditB=pBase+pNss;
        const pPayA=typeof calcPay==="function"?calcPay(pBase+pDownP, pDownP, months, pRateA):0;
        const pPayB=typeof calcPay==="function"?calcPay(pCreditB+pDownP, pDownP, months, pRateB):0;
        const pOverA=pPayA*months-pBase;
        const pOverB=pPayB*months-pCreditB;
        pangoCol=`<div class="pay-col pango km-pay">
            <p class="eyebrow">Спеццена · PANGO</p>
            <p class="calc-note">Если машина по спеццене. Фикс ${useTi?"с трейд-ин":"без трейд-ин"} ${rub(pFix)}. Каско + GAP + ДМС ${rub(pBundle)} всегда в кредите.</p>
            <div class="bank-row"><span>Цена авто</span><span class="pay">${rub(pFix)}</span></div>
            <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(pDownP)}</span></div>
            <div class="bank-row"><span>Каско + GAP + ДМС</span><span class="pay">${rub(pBundle)}</span></div>
            <p class="eyebrow" style="margin-top:10px">17,4% без комиссий</p>
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(pBase)}</span></div>
            <div class="bank-row"><span><b>Платёж</b><br/><small>${pRateA}% · ${months} мес. · переплата ~${rub(Math.round(pOverA))}</small></span><span class="pay">${rub(Math.round(pPayA))} ₽</span></div>
            <p class="eyebrow" style="margin-top:10px">14,4% · НСС в теле</p>
            <div class="bank-row"><span>НСС 0,89% × ${pYearsLabel} ${pYearsWord}</span><span class="pay">${rub(pNss)}</span></div>
            <div class="bank-row"><span>Тело с НСС</span><span class="pay">${rub(pCreditB)}</span></div>
            <div class="bank-row"><span><b>Платёж</b><br/><small>${pRateB}% · ${months} мес. · переплата ~${rub(Math.round(pPayB))}</small></span><span class="pay">${rub(Math.round(pPayB))} ₽</span></div>
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
      const useMpt=carMpt && kmVal("kmFleetMpt", true);
      const useSub=!useMpt && canSub && kmVal("kmFleetSub", true);
      if(useFleet){ price=f.tidy; steps.push("флит −"+rub(fleetCut)); }
      if(useTi){ price=Math.max(0, price-FLEET_TI); steps.push("трейд-ин −"+rub(FLEET_TI)); }
      if(useMpt){ price=Math.round(price*0.9); steps.push("МПТ −10%"); }
      else if(useSub){ price=Math.max(0, price-(f.sub||0)); steps.push("субс. бренда −"+rub(f.sub||0)); }
      const mptCut=Math.round((useFleet?f.tidy:f.rrc)*(useTi?0.9:1)*0.1);
      const subCut=f.sub||0;
      const fleetBox=(useMpt||useSub)?fleetCreditBox(price, m, f, useFleet, useTi, useMpt?"mpt":"sub"):null;
      return banner("Калькулятор","Флит · BFS Совкомбанк лизинг","TENET")+`
        <p class="lead">${fleetBox?(fleetBox.pangoCol?"Три расчёта рядом: стандартный кредит, "+(useSub?"флит с субсидией бренда":"МПТ")+" и спеццена PANGO.":(useSub?"Три блока: скидки флита, стандартный кредит той же комплектации и справа флит с субсидией бренда — машина не под МПТ.":"Три блока: скидки флита, стандартный кредит и МПТ.")):"Корпоративный VIN. Сбер / Альфа / Т-Банк на этот VIN нельзя."}</p>
        ${kmChipGroups(m.id)}
        <div class="km-layout${fleetBox?(fleetBox.pangoCol?" km-4":" km-3"):""}">
          <div class="card km-disc">
            <p class="eyebrow">BFS Совкомбанк лизинг · ${escape(f.name)}</p>
            ${car?`<p class="calc-note">${escape(car.vin)} · ${escape(car.color||"")} · ${escape(car.trim||"")}${carMpt?" · МПТ":""}${carIsCorp(car)?" · корп":""}</p>`:""}
            <div class="note-box">Сбер / Альфа / Т-Банк на этот VIN нельзя. По центру — стандартный кредит той же комплектации. Справа — ${useSub?"флит с субсидией бренда, не МПТ":useMpt?"МПТ":"лист флита"}.</div>
            <label class="check-row"><input id="kmFleetDisc" type="checkbox" ${useFleet?"checked":""} /> <span>Флит скидка ${rub(fleetCut)} · макс. выгода ${rub(f.an)}</span></label>
            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин ${rub(FLEET_TI)}</span></label>
            ${carMpt?`<label class="check-row"><input id="kmFleetMpt" type="checkbox" ${useMpt?"checked":""} /> <span>МПТ −10%</span></label>`:""}
            ${!useMpt&&canSub?`<label class="check-row"><input id="kmFleetSub" type="checkbox" ${useSub?"checked":""} /> <span>Субсидия бренда ${rub(subCut)}</span></label>`:""}
            <div class="note-box" style="margin-top:14px">
              <p class="eyebrow" style="margin:0 0 6px">Итоговая цена</p>
              ${price<f.rrc?`<div class="calc-out" style="text-decoration:line-through;opacity:.42;margin-bottom:2px">${rub(f.rrc)} ₽</div>`:""}
              <div class="calc-out">${rub(Math.round(price))} ₽</div>
              <p class="calc-note">${steps.length?steps.join(" → "):"Базовая цена без скидок."}${useFleet?" · AP без тюнинга "+rub(f.tidy):""}</p>
            </div>
            ${fleetBox?fleetBox.inputs:""}
          </div>
          ${fleetBox?fleetBox.stdCol+fleetBox.altCol+(fleetBox.pangoCol||""):""}
        </div>
        <div class="card">
              <p class="eyebrow">Лист «Флит» BFS</p>
              <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(f.rrc)} ₽</span></div>
              <div class="bank-row"><span>Макс. выгода AN</span><span class="pay">${rub(f.an)} ₽</span></div>
              <div class="bank-row"><span>Цена AP без тюнинга</span><span class="pay">${rub(f.tidy)} ₽</span></div>
              ${useMpt
                ? `<div class="bank-row"><span>МПТ −10%</span><span class="pay">${rub(mptCut)} ₽</span></div>`
                : (useSub?`<div class="bank-row"><span>Субсидия бренда AQ</span><span class="pay">${rub(subCut)} ₽</span></div>`:`<div class="bank-row"><span>Субсидия TENET</span><span class="pay">${rub(f.sub||0)} ₽</span></div>`)}
              <p class="calc-note">${useMpt?"На цену действует МПТ −10%, не субсидия бренда.":useSub?"Порядок: флит скидка → трейд-ин → субсидия бренда (AQ). МПТ и субсидия не суммируются.":"Порядок: флит скидка → трейд-ин."}</p>
            </div>
        ${kmSideList(m)}
        <div class="card dc-result ok">
          <p class="eyebrow">Доходность ДЦ · КМ без НДС · флит BFS</p>
          <div class="calc-out">${rub(f.km)} ₽</div>
          <p class="calc-note">КМ с листа «Флит», блок BFS. Пауза банка, ориентир 21.09.</p>
        </div>`;
    }
