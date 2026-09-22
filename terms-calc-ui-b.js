    function kmProfit(p){
      const discount=(p.tiAmt||0)+(p.spec||0)+(p.dcTi||0)+(p.dcCr||0)+(p.crAmt||0);
      const bonusAmt=p.invoice>0?(p.invoice/p.vat)*p.bonus:0;
      const margin=p.rrc-p.invoice;
      const carPrice=p.rrc-discount;
      const iron=margin-discount+(p.tiBack||0)+(p.crBack||0)+bonusAmt*1.2;
      return ((p.addons||0)*0.3+(p.casco||0)*0.3+(p.card||0)*0.8+iron)/p.vat-carPrice*p.fee;
    }
    function kmDcCrAt(p, kmTarget, roundFn){
      const km0=kmProfit(Object.assign({}, p, {dcCr:0}));
      const coeff=1/p.vat-p.fee;
      if(!(coeff>0)) return 0;
      const raw=(km0-Number(kmTarget))/coeff;
      if(!(raw>0)) return 0;
      return roundFn(raw/1000)*1000;
    }
    function kmDcCrFit(p, lo){
      return kmDcCrAt(p, Number(lo)*1000, Math.floor);
    }
    function kmDcCrMin(p, hi){
      const km0=kmProfit(Object.assign({}, p, {dcCr:0}));
      if(km0<=Number(hi)*1000+50) return 0;
      return kmDcCrAt(p, Number(hi)*1000, Math.ceil);
    }
    function calcKm(){
      if(typeof kmId!=="string" || !KM_MODELS.some(x=>x.id===kmId)) kmId=KM_MODELS[0].id;
      if(typeof kmVin!=="string") kmVin="";
      const m=KM_MODELS.find(x=>x.id===kmId)||KM_MODELS[0];
      if(typeof kmIsCorp==="function" && kmIsCorp(kmVin) && typeof calcFleet==="function") return calcFleet(m);
      const fresh=(typeof kmShown==="undefined")||kmShown!==kmId;
      kmShown=kmId;
      const rrc=fresh?m.rrc:kmVal("kmRrc", m.rrc);
      const invoice=fresh?m.dealer:kmVal("kmInv", m.dealer);
      const useTi=kmVal("kmUseTi", false);
      const useLoan=kmVal("kmUseLoan", false);
      const hasDealCr=m.cr>0;
      const dealCrLabel=m.id==="t7p"?"Выгодный кредит":"Прямая скидка";
      const dealCrNeedsLoan=m.id==="t7p";
      const showDealCr=hasDealCr && (!dealCrNeedsLoan || useLoan);
      const useCr=showDealCr && kmVal("kmUseCr", false);
      const spec=kmVal("kmSpec", 0);
      const useDcTi=useTi && kmVal("kmUseDcTi", false);
      const useDcCr=useLoan && kmVal("kmUseDcCr", false);
      const dcTi=useDcTi?kmVal("kmDcTi", typeof KM_DC_DEF==="number"?KM_DC_DEF:100000):0;
      const addons=kmVal("kmDo", 70000);
      let casco=0, card=0, pack=0;
      if(useLoan){
        pack=kmVal("kmPack", 150000);
        casco=Math.min(pack, 80000);
        card=Math.max(0, pack-80000);
      }else{
        casco=kmVal("kmCasco", 80000);
        card=0;
      }
      const prio=PRIO_VINS.has(kmVin);
      const tiAmt=useTi?m.ti:0;
      const tiBack=useTi?m.tiBack:0;
      const crAmt=useCr?m.cr:0;
      const crBack=useCr?m.crBack:0;
      const lo=prio?m.prioMin:m.kmMin;
      const hi=prio?m.prioMax:m.kmMax;
      const dcPack={rrc,invoice,vat:m.vat,fee:m.fee,bonus:m.bonus,tiAmt,tiBack,spec,dcTi,crAmt,crBack,addons,casco,card};
      const dcFit=typeof kmDcCrFit==="function"?kmDcCrFit(dcPack, lo):(typeof KM_DC_DEF==="number"?KM_DC_DEF:100000);
      const dcMin=typeof kmDcCrMin==="function"?kmDcCrMin(dcPack, hi):0;
      const dcDef=typeof KM_DC_DEF==="number"?KM_DC_DEF:100000;
      let dcCr=0;
      if(useDcCr){
        const typedEl=document.getElementById("kmDcCr");
        const typed=typedEl?kmVal("kmDcCr", NaN):NaN;
        const want=(fresh || !typedEl || !Number.isFinite(typed))?dcDef:typed;
        dcCr=Math.min(Math.max(0, want, dcMin), dcFit);
        dcCr=Math.max(0, Math.round(dcCr));
      }
      const discount=tiAmt+spec+dcTi+dcCr+crAmt;
      const bonus=invoice>0?(invoice/m.vat)*m.bonus:0;
      const margin=rrc-invoice;
      const carPrice=rrc-discount;
      const client=carPrice+addons;
      const iron=margin-discount+tiBack+crBack+bonus*1.2;
      const km=(addons*0.3+casco*0.3+card*0.8+iron)/m.vat-carPrice*m.fee;
      const kmK=km/1000;
      const ok=kmK+0.05>=lo && kmK-0.05<=hi;
      const price=Math.round(carPrice);
      const fee=typeof KM_BANK_FEE==="number"?KM_BANK_FEE:30000;
      const extras=useLoan?(addons+(pack||0)+fee):0;
      const downMode=kmStr("cDownMode","pct");
      const months=kmVal("cMonths", 60);
      let downPct=kmVal("cDownPct", 20);
      let down=kmVal("cDown", Math.round(price*0.2));
      if(fresh){ downPct=20; down=Math.round(price*0.2); }
      if(downMode==="pct") down=Math.round(price*Math.max(0,downPct)/100);
      else downPct=price>0?Math.round(down*1000/price)/10:0;
      down=Math.max(0, Math.min(price, down));
      const credit=Math.max(0,price-down+extras);
      const rateGroup=typeof kmRateGroup==="function"?kmRateGroup(m):"t4l_t7";
      const stockCars=typeof kmStockCars==="function"?kmStockCars(m):[];
      const mptCars=stockCars.filter(c=>typeof carIsMpt==="function"?carIsMpt(c):c.mpt);
      const hasMpt=mptCars.length>0;
      const hasReg=stockCars.some(c=>!(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)) || !stockCars.length;
      const selected=(typeof STOCK!=="undefined"?STOCK:[]).find(c=>c && c.vin===kmVin);
      const pickMpt=!!(selected && (typeof carIsMpt==="function"?carIsMpt(selected):selected.mpt));
      const fMpt=typeof fleetOf==="function"?fleetOf(m.id):null;
      const canSub=typeof kmHasBrandSub==="function"?kmHasBrandSub(m):!!(fMpt&&(fMpt.sub||0)>0&&m.id!=="tt9p"&&m.id!=="tt9u");
      const showMpt=pickMpt || (!selected && hasMpt);
      const showSub=!showMpt && canSub;
      const showSplit=showMpt || showSub;
      const mptSample=mptCars[0]||(pickMpt&&selected?selected:null);
      const mptRrc=fMpt&&fMpt.rrc?fMpt.rrc:price;
      const mptTidy=fMpt&&fMpt.tidy?fMpt.tidy:mptRrc;
      const fleetCutMpt=Math.max(0, mptRrc-mptTidy);
      const tiMpt=useTi?(typeof FLEET_TI==="number"?FLEET_TI:50000):0;
      const beforeMptPct=Math.max(0, mptTidy-tiMpt);
      const subAmt=(fMpt&&fMpt.sub)||0;
      const priceMpt=showSub?Math.max(0, beforeMptPct-subAmt):Math.round(beforeMptPct*0.9);
      const MPT_EXTRA=200000;
      const downMptShow=Math.max(0, Math.min(priceMpt, down));
      const downMptCar=Math.max(0, downMptShow-MPT_EXTRA);
      const creditMpt=Math.max(0, priceMpt-downMptCar);
      const mptTermMax=84;
      const mptTerm=Math.min(Math.max(1, months), mptTermMax);
      const mptRate=19.2;
      const payMptOne=calcPay(priceMpt, downMptCar, mptTerm, mptRate);
      const overMptOne=payMptOne*mptTerm-creditMpt;
      const banksMpt=[{id:"sovcom", name:"Совкомбанк", rate:mptRate, term:mptTerm, capped:mptTerm!==months, payMpt:payMptOne, overMpt:overMptOne}];
      const mptBreak=`<div class="mpt-break">
                <div class="bank-row"><span>Комплектация</span><span class="pay">${escape((fMpt&&fMpt.name)||m.name)}</span></div>
                ${mptSample?`<div class="bank-row"><span>На складе</span><span class="pay">${escape(mptSample.color||"—")} · ${escape(mptSample.vin||"")}</span></div>`:""}
                <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(mptRrc)}</span></div>
                <div class="bank-row"><span>Флит</span><span class="pay">${rub(mptTidy)}</span></div>
                ${useTi?`<div class="bank-row"><span>Трейд-ин</span><span class="pay">− ${rub(tiMpt)}</span></div>`:""}
                <div class="bank-row"><span>${showSub?"Субсидия бренда −"+rub(subAmt):"МПТ −10%"}</span><span class="pay">${rub(priceMpt)}</span></div>
                <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(downMptShow)}</span></div>
                <div class="bank-row"><span>из них каско и Д/О</span><span class="pay">${rub(Math.min(MPT_EXTRA, downMptShow))}</span></div>
                <div class="bank-row"><span>ПВ в авто</span><span class="pay">${rub(downMptCar)}</span></div>
                <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
              </div>`;
      const banks=(typeof KM_BANKS!=="undefined"?KM_BANKS:[]).map(b=>{
        const look=typeof kmBankRate==="function"?kmBankRate(b.id, rateGroup, months, downPct):{rate:b.rate||0, term:months, capped:false};
        const term=look.term||months;
        const pay=calcPay(price+extras, down, term, look.rate);
        return Object.assign({}, b, {rate:look.rate, term, capped:!!look.capped, pay, over:pay*term-credit});
      });
      function kmPayRows(list, payKey, overKey){
        return list.map(b=>{
          const yearsWant=Math.round(months/12);
          const yearsHave=Math.round(b.term/12);
          const note=b.capped?`нет ${yearsWant} ${yearsWant===1?"года":"лет"} · считаем ${b.term} мес. (${yearsHave} ${yearsHave===1?"год":yearsHave<5?"года":"лет"})`: `${b.term} мес.`;
          const pay=Math.round(b[payKey]||0);
          const over=Math.round(b[overKey]||0);
          return `<div class="bank-row"><span><b>${escape(b.name)}</b><br/><small>${b.rate}% · ${note} · переплата ~${rub(over)}</small></span><span class="pay">${rub(pay)} ₽</span></div>`;
        }).join("");
      }
      return banner("Калькулятор","КМ и платёж · база "+TERMS_DATE,"TENET")+`
        <p class="lead">Сначала комплектация. Кредит и СЖ открываются галочкой «Кредит».</p>
        ${kmChipGroups(m.id)}
        <div class="km-layout${useLoan&&showSplit?" km-3":""}">
          <div class="card km-disc">
            <p class="eyebrow">Калькулятор КМ · ${escape(m.name)}</p>
            <label class="field" style="max-width:none;margin-top:8px"><span>РРЦ, ₽ · из условий ${TERMS_DATE}</span><input id="kmRrc" inputmode="numeric" value="${rrc}" /></label>
            <label class="field" style="max-width:none"><span>Сумма счёта, ₽ · из условий ${TERMS_DATE}</span><input id="kmInv" inputmode="numeric" value="${invoice}" /></label>
            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин ${m.ti?rub(m.ti)+" / возмещение "+rub(m.tiBack):"нет в базе"}</span></label>
            <label class="check-row"><input id="kmUseLoan" type="checkbox" ${useLoan?"checked":""} /> <span>Кредит</span></label>
            ${showDealCr?`<label class="check-row"><input id="kmUseCr" type="checkbox" ${useCr?"checked":""} /> <span>${dealCrLabel} · ${rub(m.cr)}${m.crBack?` / возмещение ${rub(m.crBack)}`:""}</span></label>`:""}
            <label class="field" style="max-width:none"><span>Спецпредложение, ₽</span><input id="kmSpec" inputmode="numeric" value="${spec}" /></label>
            ${useTi?`<label class="check-row"><input id="kmUseDcTi" type="checkbox" ${useDcTi?"checked":""} /> <span>Скидка от ДЦ за трейд-ин ${rub(KM_DC_DEF)}</span></label>`:""}
            ${useTi&&useDcTi?`<label class="field" style="max-width:none"><span>Сумма скидки ДЦ за трейд-ин, ₽</span><input id="kmDcTi" inputmode="numeric" value="${dcTi||KM_DC_DEF}" /></label>`:""}
            ${useLoan?`<label class="check-row"><input id="kmUseDcCr" type="checkbox" ${useDcCr?"checked":""} /> <span>Скидка от ДЦ за кредит${dcFit?` · до ${rub(dcFit)} в коридоре`:""}</span></label>`:""}
            ${useLoan&&useDcCr?`<label class="field" style="max-width:none"><span>Сумма скидки ДЦ за кредит, ₽ · коридор от ${lo} тыс.</span><input id="kmDcCr" inputmode="numeric" value="${dcCr}" /></label>`:""}
            <label class="field" style="max-width:none"><span>Д/О, ₽</span><input id="kmDo" inputmode="numeric" value="${addons}" /></label>
            <div class="note-box" style="margin-top:14px">
              <p class="eyebrow" style="margin:0 0 6px">Итоговая цена для клиента</p>
              ${Math.round(rrc+addons)>Math.round(client)?`<div class="calc-out" style="text-decoration:line-through;opacity:.42;margin-bottom:2px">${rub(Math.round(rrc+addons))} ₽</div>`:""}
              <div class="calc-out">${rub(Math.round(client))} ₽</div>
              <p class="calc-note">Авто ${rub(Math.round(carPrice))} + Д/О ${rub(Math.round(addons))}. Каско не входит.${discount?` Скидка ${rub(Math.round(discount))}.`:""}</p>
            </div>
            ${useLoan
              ?`<label class="field" style="max-width:none"><span>Каско расширенное, ₽</span><input id="kmPack" inputmode="numeric" value="${pack}" /></label>`
              :`<label class="field" style="max-width:none"><span>КАСКО, ₽</span><input id="kmCasco" inputmode="numeric" value="${casco}" /></label>`}
            ${prio?`<div class="note-box">Приоритетный VIN ${escape(kmVin)}. Коридор ${lo} … ${hi} тыс.</div>`:""}
            ${useLoan?`<p class="eyebrow" style="margin-top:12px">Первый взнос</p>
              <div class="down-mode">
                <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
                <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
              </div>
              <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
              ${downMode==="sum"
                ?`<label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
                :`<label class="field" style="max-width:none"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
              <p class="calc-note">${rub(down)} ₽ · ${downPct}% от цены авто${(showMpt||showSub)?` · ${showSub?"субс. бренда":"МПТ"}: ${rub(priceMpt)} − ПВ в авто ${rub(downMptCar)} = тело ${rub(creditMpt)}`:""}</p>
              <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>`:""}
          </div>
          ${useLoan&&showSplit?`
          <div class="pay-col std km-pay">
            <p class="eyebrow">Стандартный кредит</p>
            <p class="calc-note">ПВ ${rub(down)} · тело ${rub(credit)}</p>
            ${kmPayRows(banks,"pay","over")}
            <p class="calc-note">Ставки TENET ФИНАНС, ИП 1890/И. Кредит = авто ${rub(price)} − ПВ + Д/О ${rub(addons)} + каско ${rub(pack)} + комиссия банка.</p>
          </div>
          <div class="pay-col ${showSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${showSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            ${showSub?`<p class="calc-note">Машина не проходит под МПТ. Это не стандартный кредит: цена флита минус субсидия бренда (AQ), Совкомбанк 19,2%.</p>
            ${mptBreak}
            <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${kmPayRows(banksMpt,"payMpt","overMpt")}`
            :`<p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${kmPayRows(banksMpt,"payMpt","overMpt")}
            ${mptBreak}`}
          </div>`:`<div class="km-right">
            ${useLoan?`<div class="card">
              <p class="eyebrow">Кредит · ${escape(m.name)}</p>
              <p class="calc-note">ПВ от цены авто ${rub(price)} ₽, без Д/О и каско. В кредит входят авто − ПВ, Д/О, каско расширенное и комиссия банка.${pickMpt?" Выбран VIN с меткой МПТ.":""}</p>
              ${showMpt||showSub?`<p class="eyebrow" style="margin-top:16px">${showSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
              <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
              ${kmPayRows(banksMpt,"payMpt","overMpt")}
              ${mptBreak}`
              :`<p class="eyebrow" style="margin-top:16px">Платёж в месяц</p>
              ${kmPayRows(banks,"pay","over")}`}
              <p class="calc-note">${showMpt?"МПТ. ":showSub?"Субсидия бренда. ":""}Ставки TENET ФИНАНС, ИП 1890/И. Кредит = авто ${rub(price)} − ПВ + Д/О ${rub(addons)} + каско ${rub(pack)} + комиссия банка.</p>
            </div>`:`<div class="card"><p class="eyebrow">Кредит</p><p class="lead" style="max-width:none">Включите галочку «Кредит», чтобы открыть расчёт платежа${hasMpt?" и сравнение с МПТ":canSub?" и сравнение с субсидией бренда":""}.</p></div>`}
            ${kmSideList(m, price, downPct, months, extras)}
          </div>`}
        </div>
        ${useLoan&&showSplit?kmSideList(m, price, downPct, months, extras):""}
        <div class="card dc-result ${ok?"ok":"bad"}">
          <p class="eyebrow">Доходность ДЦ · КМ без НДС</p>
          <div class="calc-out">${rub(Math.round(km))} ₽</div>
          <p class="calc-note">Коридор ${lo} … ${hi} тыс. · сейчас ${kmK.toFixed(1)} тыс. · ${ok?"в коридоре":"вне коридора"}</p>
          <div class="note-box">Цена авто <b>${rub(Math.round(carPrice))} ₽</b> · клиенту с Д/О <b>${rub(Math.round(client))} ₽</b><br/>Скидка ${rub(Math.round(discount))} · маржа 1С ${rub(Math.round(margin))}<br/>Бонус ${rub(Math.round(bonus))} (${Math.round(m.bonus*100)}%) · доход на железе ${rub(Math.round(iron))}<br/>НДС ${m.vat===1.22?"22%":"20%"} · сбор ${Math.round(m.fee*100)}% от цены авто${prio?" · приоритет":""}</div>
        </div>`;
    }
    function calc(){
      if(needAuth()) return login();
      calcMode="km";
      return calcKm();
    }
