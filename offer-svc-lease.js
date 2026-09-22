    function offerSvcPacks(){
      return [
        {id:"to1",name:"ТО-1",price:18900,note:"Первое регламентное ТО",items:[["Масло ДВС","замена, оригинал / аналог по регламенту"],["Фильтр масла","замена"],["Фильтр салона","замена"],["Диагностика","ходовая, тормоза, уровни, ЭБУ"]]},
        {id:"to2",name:"ТО-2",price:28900,note:"Второе регламентное ТО",items:[["ТО-1","масло, фильтры масла и салона"],["Фильтр воздушный","замена"],["Свечи","по регламенту"],["Интервал","сброс в ЭБУ"]]},
        {id:"season",name:"Сезонное ТО",price:12900,note:"Подготовка к сезону",items:[["Диагностика","АКБ, щётки, жидкости"],["Шины","осмотр и давление"],["Тормоза","колодки и диски"]]},
        {id:"warranty",name:"Расширенная гарантия",price:45000,note:"+1 год, условия в договоре ДЦ",items:[["Срок","+12 месяцев к заводской"],["Покрытие","агрегаты по договору"],["Лимит","пробег по договору"]]},
        {id:"tyre",name:"Шиномонтаж + хранение",price:8900,note:"Сезонная смена и склад ДЦ",items:[["Шиномонтаж","4 колеса, балансировка"],["Хранение","сезон на складе"],["Запись","у сервис-менеджера"]]}
      ];
    }
    function offerPrintDoc(d){
      const rows=(d.rows||[]).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join("");
      const total=d.total?`<tr><td>${d.totalLabel||"Итого"}</td><td><b>${d.total}</b></td></tr>`:"";
      return `<div class="offer-print-inner"><p class="offer-print-brand">ООО «ЭКСПЕРТ АВТО САМАРА» · TENET</p><h1>Коммерческое предложение</h1><p>${d.lead||""}</p><p>${d.who||""}</p><table>${rows}${total}</table>${d.extra||""}<p class="offer-print-note">${d.note||"Не оферта. Итоговые условия — в договоре салона."}</p></div>`;
    }
    function offerService(){
      const models=typeof KM_MODELS!=="undefined"?KM_MODELS:[];
      const packs=offerSvcPacks();
      const mid=offerVal("osModel", models[0]?models[0].id:"t7a");
      const m=models.find(x=>x.id===mid)||models[0]||{id:"t7a",name:"TENET"};
      const client=offerVal("osClient","Уважаемый клиент");
      const vin=offerVal("osVin","");
      const packId=offerVal("osPack", packs[0].id);
      const prevPack=offerVal("osPrevPack", packId);
      const pack=packs.find(x=>x.id===packId)||packs[0];
      let price=(typeof offerNum==="function"?offerNum("osPrice", pack.price):Number(offerVal("osPrice", String(pack.price))))||pack.price;
      if(prevPack!==packId) price=pack.price;
      const valid=offerVal("osValid","7 дней");
      const note=prevPack!==packId?pack.note:offerVal("osNote", pack.note);
      const itemLines=pack.items.map(p=>"• "+p[0]+" — "+p[1]).join(`
`);
      const text=`Коммерческое предложение · сервис
ООО «ЭКСПЕРТ АВТО САМАРА» · TENET

Клиент: ${client}
Автомобиль: ${m.name}${vin?`
VIN: ${vin}`:""}

Пакет: ${pack.name}
Стоимость: ${rub(price)} ₽
${note}

Состав:
${itemLines}

Предложение действует ${valid}.
Не оферта. Итоговые условия — в заказ-наряде сервиса.
Менеджер: ${offerMgr()}`;
      const packHtml=`<p class="eyebrow">Лист оснащения</p><h3 style="margin:0 0 10px">${escape(pack.name)}</h3>`+pack.items.map(([k,v])=>`<p class="offer-eq-h">${escape(k)}</p><ul class="offer-eq"><li>${escape(v)}</li></ul>`).join("")+`<p class="calc-note">${escape(note)}</p>`;
      const print=offerPrintDoc({
        lead:"Сервис · "+escape(m.name)+" · "+escape(pack.name),
        who:"Клиент: "+escape(client)+" · менеджер: "+escape(offerMgr()),
        rows:[["Автомобиль",escape(m.name)],["VIN",escape(vin||"—")],["Пакет",escape(pack.name)],["Срок действия",escape(valid)]],
        totalLabel:"Стоимость пакета",
        total:rub(price)+" ₽",
        extra:"<h2>Состав</h2><ul>"+pack.items.map(([k,v])=>"<li><b>"+escape(k)+".</b> "+escape(v)+"</li>").join("")+"</ul>",
        note:"Не оферта. Итоговые условия — в заказ-наряде сервиса. Действует "+escape(valid)+"."
      });
      return banner("КП Сервис","Коммерческое предложение","КП")+`
        ${offerNav()}
        <div class="km-layout">
          <div class="card">
            <p class="eyebrow">Данные и условия</p>
            <input type="hidden" id="osPrevPack" value="${escape(packId)}" />
            <label class="field" style="max-width:none"><span>Клиент</span><input id="osClient" value="${escape(client)}" /></label>
            <label class="field" style="max-width:none"><span>Комплектация</span>
              <select id="osModel">${models.map(x=>`<option value="${x.id}" ${x.id===mid?"selected":""}>${escape(x.name)}</option>`).join("")}</select>
            </label>
            <label class="field" style="max-width:none"><span>VIN</span><input id="osVin" value="${escape(vin)}" /></label>
            <label class="field" style="max-width:none"><span>Пакет</span>
              <select id="osPack">${packs.map(p=>`<option value="${p.id}" ${p.id===packId?"selected":""}>${escape(p.name)} · ${rub(p.price)}</option>`).join("")}</select>
            </label>
            <label class="field" style="max-width:none"><span>Стоимость, ₽</span><input id="osPrice" inputmode="numeric" value="${price}" /></label>
            <label class="field" style="max-width:none"><span>Срок действия</span><input id="osValid" value="${escape(valid)}" /></label>
            <label class="field" style="max-width:none"><span>Примечание</span><input id="osNote" value="${escape(note)}" /></label>
          </div>
          <div class="card">
            <p class="eyebrow">Текст КП</p>
            <pre id="ofTextSvc" class="offer-sheet">${escape(text)}</pre>
            <p class="calc-note">${escape(pack.name)} · ${rub(price)} ₽.</p>
            <div class="who-line" style="margin-top:12px">
              <button type="button" class="btn ivory" data-offer-copy="ofTextSvc">Скопировать</button>
              <button type="button" class="btn ghost" data-offer-pdf>PDF / печать</button>
            </div>
          </div>
        </div>
        <div class="card offer-equip-card">${packHtml}</div>
        <div id="ofPrint" class="offer-print">${print}</div>`;
    }
    function offerLease(){
      const models=typeof KM_MODELS!=="undefined"?KM_MODELS:[];
      const fset=typeof FLEET_BFS!=="undefined"?FLEET_BFS:{};
      const fleetIds=Object.keys(fset);
      const options=fleetIds.length?fleetIds.map(id=>({id,name:(fset[id]&&fset[id].name)||id,rrc:(fset[id]&&(fset[id].rrc||fset[id].tidy))||0})):models;
      const fid=offerVal("olModel", options[0]?options[0].id:(models[0]?models[0].id:"t7a"));
      const m=models.find(x=>x.id===fid)||options.find(x=>x.id===fid)||{id:fid,name:"TENET",rrc:0};
      const f=fset[fid]||{name:m.name,rrc:m.rrc||0,tidy:m.rrc||0,an:0};
      const prev=offerVal("olPrevModel", fid);
      const company=offerVal("olCo","ООО «Компания»");
      const inn=offerVal("olInn","");
      const months=(typeof offerNum==="function"?offerNum("olMonths", 36):Number(offerVal("olMonths","36")))||36;
      const advPct=(typeof offerNum==="function"?offerNum("olAdv", 20):Number(offerVal("olAdv","20")))||20;
      const valid=offerVal("olValid","7 дней");
      const base=f.tidy||f.rrc||m.rrc||0;
      let price=(typeof offerNum==="function"?offerNum("olPrice", base):Number(offerVal("olPrice", String(base))))||base;
      if(prev!==fid) price=base;
      const adv=Math.round(price*advPct/100);
      const body=Math.max(0, price-adv);
      const partners="Каркаде, Т-Лизинг, Европлан, Сберлизинг, Газпромбанк Лизинг, Совкомбанк Лизинг";
      const text=`Коммерческое предложение · лизинг
ООО «ЭКСПЕРТ АВТО САМАРА» · TENET · BFS Совкомбанк лизинг

Лизингополучатель: ${company}${inn?`
ИНН: ${inn}`:""}
Автомобиль: ${f.name||m.name}
РРЦ: ${rub(f.rrc||m.rrc||price)} ₽
Цена AP / флит: ${rub(price)} ₽

Аванс: ${advPct}% · ${rub(adv)} ₽
Срок: ${months} мес.
Остаток к финансированию: ${rub(body)} ₽
${f.an?`Авансовый платёж BFS (ориентир): ${rub(f.an)} ₽
`:""}
Партнёры BFS: ${partners}.
График и удорожание считает лизинговая компания.

Предложение действует ${valid}.
Не оферта. Итоговые условия — в договоре лизинга.
Менеджер: ${offerMgr()}`;
      const packHtml=`<p class="eyebrow">Лист оснащения</p><h3 style="margin:0 0 10px">${escape(f.name||m.name)}</h3>
        <ul class="offer-eq">
          <li><b>РРЦ.</b> ${rub(f.rrc||m.rrc||price)} ₽</li>
          <li><b>Цена AP / флит.</b> ${rub(price)} ₽</li>
          <li><b>Аванс.</b> ${advPct}% · ${rub(adv)} ₽</li>
          <li><b>К финансированию.</b> ${rub(body)} ₽ · ${months} мес.</li>
          ${f.an?`<li><b>Ориентир платежа BFS.</b> ${rub(f.an)} ₽</li>`:""}
        </ul>
        <p class="offer-eq-h">Партнёры</p>
        <ul class="offer-eq"><li>${escape(partners)}</li></ul>
        <p class="calc-note">График и удорожание считает лизинговая компания.</p>`;
      const print=offerPrintDoc({
        lead:"Лизинг · "+escape(f.name||m.name)+" · BFS",
        who:"Лизингополучатель: "+escape(company)+(inn?" · ИНН "+escape(inn):"")+" · менеджер: "+escape(offerMgr()),
        rows:[["Автомобиль",escape(f.name||m.name)],["РРЦ",rub(f.rrc||m.rrc||price)+" ₽"],["Цена AP / флит",rub(price)+" ₽"],["Аванс",advPct+"% · "+rub(adv)+" ₽"],["Срок",months+" мес."],["К финансированию",rub(body)+" ₽"],["Срок действия",escape(valid)]],
        totalLabel:"Цена AP / флит",
        total:rub(price)+" ₽",
        extra:"<h2>Партнёры BFS</h2><p>"+escape(partners)+"</p>",
        note:"Не оферта. График считает лизинговая компания. Действует "+escape(valid)+"."
      });
      return banner("КП Лизинг","Коммерческое предложение","КП")+`
        ${offerNav()}
        <div class="km-layout">
          <div class="card">
            <p class="eyebrow">Данные и условия</p>
            <input type="hidden" id="olPrevModel" value="${escape(fid)}" />
            <label class="field" style="max-width:none"><span>Компания</span><input id="olCo" value="${escape(company)}" /></label>
            <label class="field" style="max-width:none"><span>ИНН</span><input id="olInn" value="${escape(inn)}" /></label>
            <label class="field" style="max-width:none"><span>Комплектация</span>
              <select id="olModel">${options.map(x=>`<option value="${x.id}" ${x.id===fid?"selected":""}>${escape(x.name)}${x.rrc?" · "+rub(x.rrc):""}</option>`).join("")}</select>
            </label>
            <label class="field" style="max-width:none"><span>Цена флит, ₽</span><input id="olPrice" inputmode="numeric" value="${price}" /></label>
            <label class="field" style="max-width:none"><span>Аванс, %</span><input id="olAdv" inputmode="numeric" value="${advPct}" /></label>
            <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="olMonths" inputmode="numeric" value="${months}" /></label>
            <label class="field" style="max-width:none"><span>Срок действия</span><input id="olValid" value="${escape(valid)}" /></label>
          </div>
          <div class="card">
            <p class="eyebrow">Текст КП</p>
            <pre id="ofTextLease" class="offer-sheet">${escape(text)}</pre>
            <p class="calc-note">Аванс ${rub(adv)} ₽ · к финансированию ${rub(body)} ₽.</p>
            <div class="who-line" style="margin-top:12px">
              <button type="button" class="btn ivory" data-offer-copy="ofTextLease">Скопировать</button>
              <button type="button" class="btn ghost" data-offer-pdf>PDF / печать</button>
            </div>
          </div>
        </div>
        <div class="card offer-equip-card">${packHtml}</div>
        <div id="ofPrint" class="offer-print">${print}</div>`;
    }
