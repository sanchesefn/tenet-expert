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
      const dcTi=useTi?kmVal("kmDcTi", 0):0;
      const dcCr=useLoan?kmVal("kmDcCr", 0):0;
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
      const iron=margin-discount+tiBack+crBack+spec+bonus*1.2;
      const km=(addons*0.3+casco*0.3+card*0.8+iron)/m.vat-carPrice*m.fee;
      const kmK=km/1000;
      const ok=kmK+0.05>=lo && kmK-0.05<=hi;
      const price=Math.round(carPrice);
      const down=fresh?Math.round(price*0.2):kmVal("cDown", Math.round(price*0.2));
      const months=kmVal("cMonths", 60);
      const rate=kmVal("cRate", 18.9);
      const pay=calcPay(price, down, months, rate);
      const credit=Math.max(0,price-down);
      const over=pay*months-credit;
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
            ${hasDealCr&&useLoan?`<label class="check-row"><input id="kmUseCr" type="checkbox" ${useCr?"checked":""} /> <span>Выгодный кредит ${rub(m.cr)} / возмещение ${rub(m.crBack)}</span></label>`:""}
            <label class="field" style="max-width:none"><span>Спецпредложение, ₽</span><input id="kmSpec" inputmode="numeric" value="${spec}" /></label>
            ${useTi?`<label class="field" style="max-width:none"><span>Скидка от ДЦ за трейд-ин, ₽</span><input id="kmDcTi" inputmode="numeric" value="${dcTi}" /></label>`:""}
            ${useLoan?`<label class="field" style="max-width:none"><span>Скидка от ДЦ за кредит, ₽</span><input id="kmDcCr" inputmode="numeric" value="${dcCr}" /></label>`:""}
            <label class="field" style="max-width:none"><span>Д/О, ₽</span><input id="kmDo" inputmode="numeric" value="${addons}" /></label>
            <div class="note-box" style="margin-top:14px">
              <p class="eyebrow" style="margin:0 0 6px">Итоговая цена для клиента</p>
              <div class="calc-out">${rub(Math.round(client))} ₽</div>
              <p class="calc-note">Авто ${rub(Math.round(carPrice))} + Д/О ${rub(Math.round(addons))}. КАСКО и СЖ / карта не входят.</p>
            </div>
            ${useLoan
              ?`<label class="field" style="max-width:none"><span>КАСКО + СЖ / карта, ₽</span><input id="kmPack" inputmode="numeric" value="${pack}" /></label>`
              :`<label class="field" style="max-width:none"><span>КАСКО, ₽</span><input id="kmCasco" inputmode="numeric" value="${casco}" /></label>`}
            ${prio?`<div class="note-box">Приоритетный VIN ${escape(kmVin)}. Коридор ${lo} … ${hi} тыс.</div>`:""}
          </div>
          <div class="km-right">
            ${useLoan?`<div class="card">
              <p class="eyebrow">Кредит · ${escape(m.name)}</p>
              <p class="calc-note">Считается от цены авто со скидками: ${rub(price)} ₽</p>
              <label class="field" style="max-width:none;margin-top:8px"><span>Цена авто для кредита, ₽</span><input id="cPrice" inputmode="numeric" value="${price}" /></label>
              <label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>
              <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>
              <label class="field" style="max-width:none"><span>Ставка, % годовых</span><input id="cRate" inputmode="decimal" value="${rate}" /></label>
              <p class="eyebrow" style="margin-top:16px">Платёж в месяц</p>
              <div class="calc-out">${rub(Math.round(pay))} ₽</div>
              <p class="calc-note">Кредит ${rub(credit)} ₽ · переплата ~${rub(Math.round(over))} ₽ · ${months} мес.</p>
              <div class="note-box">Д/О, КАСКО и СЖ в сумму кредита не входят. Одобрение и ставка — только банк.</div>
            </div>`:`<div class="card"><p class="eyebrow">Кредит</p><p class="lead" style="max-width:none">Включите галочку «Кредит», чтобы открыть расчёт платежа и СЖ / карту.</p></div>`}
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
