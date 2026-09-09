    function calcKm(){
      if(typeof kmId!=="string" || !KM_MODELS.some(x=>x.id===kmId)) kmId=KM_MODELS[0].id;
      if(typeof kmVin!=="string") kmVin="";
      const m=KM_MODELS.find(x=>x.id===kmId)||KM_MODELS[0];
      const fresh=(typeof kmShown==="undefined")||kmShown!==kmId;
      kmShown=kmId;
      const rrc=fresh?m.rrc:kmVal("kmRrc", m.rrc);
      const invoice=fresh?m.dealer:kmVal("kmInv", m.dealer);
      const useTi=kmVal("kmUseTi", false);
      const useLoan=kmVal("kmUseLoan", false);
      const hasDealCr=m.id==="t7p" && m.cr>0;
      const useCr=hasDealCr && useLoan && kmVal("kmUseCr", false);
      const spec=kmVal("kmSpec", 0);
      const useDcTi=useTi && kmVal("kmUseDcTi", false);
      const useDcCr=useLoan && kmVal("kmUseDcCr", false);
      const dcTi=useDcTi?kmVal("kmDcTi", typeof KM_DC_DEF==="number"?KM_DC_DEF:100000):0;
      const dcCr=useDcCr?kmVal("kmDcCr", typeof KM_DC_DEF==="number"?KM_DC_DEF:100000):0;
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
      const banks=(typeof KM_BANKS!=="undefined"?KM_BANKS:[]).map(b=>{
        const look=typeof kmBankRate==="function"?kmBankRate(b.id, rateGroup, months, downPct):{rate:b.rate||0, term:months, capped:false};
        const term=look.term||months;
        const pay=calcPay(price+extras, down, term, look.rate);
        return Object.assign({}, b, {rate:look.rate, term, capped:!!look.capped, pay, over:pay*term-credit});
      });
      return banner("Калькулятор","КМ и платёж · база "+TERMS_DATE,"TENET")+`
        <p class="lead">Сначала комплектация. Кредит и СЖ открываются галочкой «Кредит».</p>
        ${kmChipGroups(m.id)}
        <div class="km-layout">
          <div class="card">
            <p class="eyebrow">Калькулятор КМ · ${escape(m.name)}</p>
            <label class="field" style="max-width:none;margin-top:8px"><span>РРЦ, ₽ · из условий ${TERMS_DATE}</span><input id="kmRrc" inputmode="numeric" value="${rrc}" /></label>
            <label class="field" style="max-width:none"><span>Сумма счёта, ₽ · из условий ${TERMS_DATE}</span><input id="kmInv" inputmode="numeric" value="${invoice}" /></label>
            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин ${m.ti?rub(m.ti)+" / возмещение "+rub(m.tiBack):"нет в базе"}</span></label>
            <label class="check-row"><input id="kmUseLoan" type="checkbox" ${useLoan?"checked":""} /> <span>Кредит</span></label>
            ${hasDealCr&&useLoan?`<label class="check-row"><input id="kmUseCr" type="checkbox" ${useCr?"checked":""} /> <span>Выгодный кредит · ${rub(m.cr)} / возмещение ${rub(m.crBack)}</span></label>`:""}
            <label class="field" style="max-width:none"><span>Спецпредложение, ₽</span><input id="kmSpec" inputmode="numeric" value="${spec}" /></label>
            ${useTi?`<label class="check-row"><input id="kmUseDcTi" type="checkbox" ${useDcTi?"checked":""} /> <span>Скидка от ДЦ за трейд-ин ${rub(KM_DC_DEF)}</span></label>`:""}
            ${useTi&&useDcTi?`<label class="field" style="max-width:none"><span>Сумма скидки ДЦ за трейд-ин, ₽</span><input id="kmDcTi" inputmode="numeric" value="${dcTi||KM_DC_DEF}" /></label>`:""}
            ${useLoan?`<label class="check-row"><input id="kmUseDcCr" type="checkbox" ${useDcCr?"checked":""} /> <span>Скидка от ДЦ за кредит ${rub(KM_DC_DEF)}</span></label>`:""}
            ${useLoan&&useDcCr?`<label class="field" style="max-width:none"><span>Сумма скидки ДЦ за кредит, ₽</span><input id="kmDcCr" inputmode="numeric" value="${dcCr||KM_DC_DEF}" /></label>`:""}
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
          </div>
          <div class="km-right">
            ${useLoan?`<div class="card">
              <p class="eyebrow">Кредит · ${escape(m.name)}</p>
              <p class="calc-note">ПВ от цены авто ${rub(price)} ₽, без Д/О и каско. В кредит входят авто − ПВ, Д/О, каско расширенное и комиссия банка.</p>
              <p class="eyebrow" style="margin-top:12px">Первый взнос</p>
              <div class="down-mode">
                <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
                <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
              </div>
              <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
              ${downMode==="sum"
                ?`<label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
                :`<label class="field" style="max-width:none"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
              <p class="calc-note">${rub(down)} ₽ · ${downPct}% от цены авто</p>
              <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>
              <p class="eyebrow" style="margin-top:16px">Платёж в месяц</p>
              ${banks.map(b=>{
                const yearsWant=Math.round(months/12);
                const yearsHave=Math.round(b.term/12);
                const note=b.capped?`нет ${yearsWant} ${yearsWant===1?"года":"лет"} · считаем ${b.term} мес. (${yearsHave} ${yearsHave===1?"год":yearsHave<5?"года":"лет"})`: `${b.term} мес.`;
                return `<div class="bank-row"><span><b>${escape(b.name)}</b><br/><small>${b.rate}% · ПВ ${downPct}% от авто · ${note} · переплата ~${rub(Math.round(b.over))}</small></span><span class="pay">${rub(Math.round(b.pay))} ₽</span></div>`;
              }).join("")}
              <p class="calc-note">Кредит ${rub(credit)} ₽ = авто ${rub(price)} − ПВ ${rub(down)} + Д/О ${rub(addons)} + каско ${rub(pack)} + комиссия банка. Ставки TENET ФИНАНС, ИП 1890/И.</p>
            </div>`:`<div class="card"><p class="eyebrow">Кредит</p><p class="lead" style="max-width:none">Включите галочку «Кредит», чтобы открыть расчёт платежа и каско расширенное.</p></div>`}
            ${typeof kmPrioRecs==="function"?kmPrioRecs(m, price, downPct, months, extras):""}
            ${kmSideList(m)}
          </div>
        </div>
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
