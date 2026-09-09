    function calcKm(){
      if(typeof kmId!=="string" || !KM_MODELS.some(x=>x.id===kmId)) kmId=KM_MODELS[0].id;
      if(typeof kmVin!=="string") kmVin="";
      const m=KM_MODELS.find(x=>x.id===kmId)||KM_MODELS[0];
      const fresh=(typeof kmShown==="undefined")||kmShown!==kmId;
      kmShown=kmId;
      const rrc=fresh?m.rrc:kmVal("kmRrc", m.rrc);
      const invoice=fresh?m.dealer:kmVal("kmInv", m.dealer);
      const useTi=kmVal("kmUseTi", false);
      const useCr=kmVal("kmUseCr", false);
      const spec=kmVal("kmSpec", 0);
      const dealer=kmVal("kmDc", 0);
      const addons=kmVal("kmDo", 50000);
      const card=kmVal("kmCard", 0);
      const casco=kmVal("kmCasco", 0);
      const prio=PRIO_VINS.has(kmVin);
      const tiAmt=useTi?m.ti:0;
      const tiBack=useTi?m.tiBack:0;
      const crAmt=useCr?m.cr:0;
      const crBack=useCr?m.crBack:0;
      const lo=prio?m.prioMin:m.kmMin;
      const hi=prio?m.prioMax:m.kmMax;
      const discount=tiAmt+spec+dealer+crAmt;
      const bonus=invoice>0?(invoice/m.vat)*m.bonus:0;
      const margin=rrc-invoice;
      const client=rrc-discount;
      const iron=margin-discount+tiBack+crBack+spec+bonus*1.2;
      const km=(addons*0.3+casco*0.3+card*0.8+iron)/m.vat-client*m.fee;
      const kmK=km/1000;
      const ok=kmK+0.05>=lo && kmK-0.05<=hi;
      return banner("Калькулятор","КМ по файлу от "+TERMS_DATE,"TENET")+`
        <p class="lead">Расчёт доходности менеджера. Цифры внутренние. Клиенту — только РРЦ и цену после РОП.</p>
        <div class="study-pick" style="margin-top:12px">
          <button class="chip ${calcMode==="pay"?"on":""}" data-calc-mode="pay">Платёж</button>
          <button class="chip ${calcMode==="km"?"on":""}" data-calc-mode="km">Калькулятор КМ</button>
        </div>
        <p class="eyebrow" style="margin-top:16px">Комплектация · база ${TERMS_DATE}</p>
        <div class="km-grid">${KM_MODELS.map(x=>`<button type="button" class="chip ${x.id===m.id?"on":""}" data-km-id="${x.id}">${escape(x.name)}<small>${x.brand} · РРЦ ${rub(x.rrc)}</small></button>`).join("")}</div>
        <div class="km-layout">
          <div class="card">
            <label class="field" style="max-width:none;margin-top:0"><span>РРЦ, ₽ · из условий ${TERMS_DATE}</span><input id="kmRrc" inputmode="numeric" value="${rrc}" /></label>
            <label class="field" style="max-width:none"><span>Сумма счёта, ₽ · из условий ${TERMS_DATE}</span><input id="kmInv" inputmode="numeric" value="${invoice}" /></label>
            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин ${m.ti?rub(m.ti)+" / возмещение "+rub(m.tiBack):"нет в базе"}</span></label>
            <label class="check-row"><input id="kmUseCr" type="checkbox" ${useCr?"checked":""} /> <span>Выгодный кредит ${m.cr?rub(m.cr)+" / возмещение "+rub(m.crBack):"нет в базе"}</span></label>
            <label class="field" style="max-width:none"><span>Спецпредложение, ₽</span><input id="kmSpec" inputmode="numeric" value="${spec}" /></label>
            <label class="field" style="max-width:none"><span>Скидка от ДЦ, ₽</span><input id="kmDc" inputmode="numeric" value="${dealer}" /></label>
            <label class="field" style="max-width:none"><span>Д/О, ₽</span><input id="kmDo" inputmode="numeric" value="${addons}" /></label>
            <label class="field" style="max-width:none"><span>СЖ / карта, ₽</span><input id="kmCard" inputmode="numeric" value="${card}" /></label>
            <label class="field" style="max-width:none"><span>КАСКО, ₽</span><input id="kmCasco" inputmode="numeric" value="${casco}" /></label>
            ${prio?`<div class="note-box">Выбран приоритетный VIN ${escape(kmVin)}. Коридор КМ: ${lo} … ${hi} тыс.</div>`:""}
          </div>
          ${kmSideList(m)}
        </div>
        <div class="card dc-result ${ok?"ok":"bad"}">
          <p class="eyebrow">Доходность ДЦ · КМ без НДС</p>
          <div class="calc-out">${rub(Math.round(km))} ₽</div>
          <p class="calc-note">Коридор ${lo} … ${hi} тыс. · сейчас ${kmK.toFixed(1)} тыс. · ${ok?"в коридоре":"вне коридора"}</p>
          <div class="note-box">Цена клиенту <b>${rub(Math.round(client))} ₽</b><br/>Скидка ${rub(Math.round(discount))} · маржа 1С ${rub(Math.round(margin))}<br/>Бонус ${rub(Math.round(bonus))} (${Math.round(m.bonus*100)}%) · доход на железе ${rub(Math.round(iron))}<br/>НДС ${m.vat===1.22?"22%":"20%"} · сбор ${Math.round(m.fee*100)}% от цены клиента${prio?" · приоритет":""}</div>
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
