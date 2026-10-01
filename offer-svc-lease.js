    function offerSvcPacks(){
      return [
        {id:"to1",name:"ТО-1",price:18900,note:"Первое регламентное ТО",items:[["Масло ДВС","замена, оригинал / аналог по регламенту"],["Фильтр масла","замена"],["Фильтр салона","замена"],["Диагностика","ходовая, тормоза, уровни, ЭБУ"]]},
        {id:"to2",name:"ТО-2",price:28900,note:"Второе регламентное ТО",items:[["ТО-1","масло, фильтры масла и салона"],["Фильтр воздушный","замена"],["Свечи","по регламенту"],["Интервал","сброс в ЭБУ"]]},
        {id:"season",name:"Сезонное ТО",price:12900,note:"Подготовка к сезону",items:[["Диагностика","АКБ, щётки, жидкости"],["Шины","осмотр и давление"],["Тормоза","колодки и диски"]]},
        {id:"warranty",name:"Расширенная гарантия",price:45000,note:"+1 год, условия в договоре ДЦ",items:[["Срок","+12 месяцев к заводской"],["Покрытие","агрегаты по договору"],["Лимит","пробег по договору"]]},
        {id:"tyre",name:"Шиномонтаж + хранение",price:8900,note:"Сезонная смена и склад ДЦ",items:[["Шиномонтаж","4 колеса, балансировка"],["Хранение","сезон на складе"],["Запись","у сервис-менеджера"]]}
      ];
    }
    function offerService(){
      const models=typeof KM_MODELS!=="undefined"?KM_MODELS:[];
      const packs=offerSvcPacks();
      const mid=offerVal("osModel", models[0]?models[0].id:"t7a");
      const m=models.find(x=>x.id===mid)||models[0]||{id:"t7a",name:"TENET"};
      const client=offerVal("osClient","");
      const vin=offerVal("osVin","");
      const packId=offerVal("osPack", packs[0].id);
      const prevPack=offerVal("osPrevPack", packId);
      const pack=packs.find(x=>x.id===packId)||packs[0];
      let price=(typeof offerNum==="function"?offerNum("osPrice", pack.price):Number(offerVal("osPrice", String(pack.price))))||pack.price;
      if(prevPack!==packId) price=pack.price;
      const valid=offerVal("osValid","7 дней");
      const note=prevPack!==packId?pack.note:offerVal("osNote", pack.note);
      const doc={
        kicker:"Сервис",
        title:"Коммерческое предложение",
        headline:pack.name,
        file:"КП сервис "+(m.name||"")+" "+client,
        meta:[["Клиент", client],["Автомобиль", m.name],["VIN", vin],["Менеджер", offerMgr()]],
        rows:[["Пакет", pack.name],["Примечание", note||"—"],["Срок действия", valid]],
        total:["Стоимость пакета", rub(price)+" ₽"],
        sections:[
          {title:"Состав", pairs:pack.items},
          {title:"Перед отправкой", lines:["Сумма — ориентир ДЦ. Сверьте её с прайсом сервиса, это не заказ-наряд."]}
        ],
        note:"Не оферта. Итоговые условия — в заказ-наряде сервиса. Действует "+valid+"."
      };
      const form=`
        <p class="eyebrow">Клиент</p>
        <input type="hidden" id="osPrevPack" value="${escape(packId)}" />
        ${offerField("Клиент", `<input id="osClient" value="${escape(client)}" placeholder="ФИО" />`)}
        ${client?"":`<p class="calc-note">Клиент пустой. В PDF будет прочерк.</p>`}
        <p class="eyebrow">Автомобиль и пакет</p>
        ${offerField("Комплектация", offerModelSelect("osModel", models, mid))}
        ${offerField("VIN", `<input id="osVin" value="${escape(vin)}" placeholder="необязательно" />`)}
        ${offerField("Пакет", `<select id="osPack" class="of-select">${packs.map(p=>`<option value="${p.id}" ${p.id===packId?"selected":""}>${escape(p.name)} · ${rub(p.price)}</option>`).join("")}</select>`)}
        ${offerField("Стоимость, ₽", `<input id="osPrice" inputmode="numeric" value="${price}" />`)}
        <p class="calc-note">Цены пакетов — ориентир. Перед PDF сверьте сумму с прайсом сервиса.</p>
        ${offerField("Срок действия", `<input id="osValid" value="${escape(valid)}" />`)}
        ${offerField("Примечание", `<input id="osNote" value="${escape(note)}" />`)}`;
      return offerScreen("КП Сервис", form, doc);
    }
    function offerLease(){
      const models=typeof KM_MODELS!=="undefined"?KM_MODELS:[];
      const fset=typeof FLEET_BFS!=="undefined"?FLEET_BFS:{};
      const fleetIds=Object.keys(fset);
      const options=fleetIds.length?fleetIds.map(id=>{ const km=models.find(x=>x.id===id); return {id,brand:km&&km.brand,name:(fset[id]&&fset[id].name)||id,rrc:(fset[id]&&(fset[id].rrc||fset[id].tidy))||0}; }):models;
      const fid=offerVal("olModel", options[0]?options[0].id:(models[0]?models[0].id:"t7a"));
      const m=models.find(x=>x.id===fid)||options.find(x=>x.id===fid)||{id:fid,name:"TENET",rrc:0};
      const f=fset[fid]||{name:m.name,rrc:m.rrc||0,tidy:m.rrc||0};
      const prev=offerVal("olPrevModel", fid);
      const company=offerVal("olCo","");
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
      const doc={
        kicker:"Лизинг",
        title:"Коммерческое предложение",
        headline:f.name||m.name,
        file:"КП лизинг "+(f.name||m.name||"")+" "+company,
        meta:[["Лизингополучатель", company],["ИНН", inn],["Менеджер", offerMgr()]],
        rows:[
          ["РРЦ", rub(f.rrc||m.rrc||price)+" ₽"],
          ["Цена AP / флит", rub(price)+" ₽"],
          ["Аванс", advPct+"% · "+rub(adv)+" ₽"],
          ["Срок", months+" мес."],
          ["К финансированию", rub(body)+" ₽"],
          ["Срок действия", valid]
        ],
        total:["Цена AP / флит", rub(price)+" ₽"],
        sections:[{
          title:"Как читать",
          lines:[
            "График и удорожание считает лизинговая компания. Здесь нет платежа и нет графика.",
            "Партнёры BFS: "+partners+"."
          ]
        }],
        note:"Не оферта. Итоговые условия — в договоре лизинга. Действует "+valid+"."
      };
      const form=`
        <p class="eyebrow">Компания</p>
        <input type="hidden" id="olPrevModel" value="${escape(fid)}" />
        ${offerField("Компания", `<input id="olCo" value="${escape(company)}" placeholder="ООО" />`)}
        ${company?"":`<p class="calc-note">Компания пустая. В PDF будет прочерк.</p>`}
        ${offerField("ИНН", `<input id="olInn" value="${escape(inn)}" placeholder="необязательно" />`)}
        <p class="eyebrow">Автомобиль</p>
        ${offerField("Комплектация", offerModelSelect("olModel", options, fid))}
        ${offerField("Цена флит, ₽", `<input id="olPrice" inputmode="numeric" value="${price}" />`)}
        ${offerField("Аванс, %", `<input id="olAdv" inputmode="numeric" value="${advPct}" />`)}
        ${offerField("Срок, мес.", `<input id="olMonths" inputmode="numeric" value="${months}" />`)}
        ${offerField("Срок действия", `<input id="olValid" value="${escape(valid)}" />`)}
        <p class="calc-note">Платёж не считаем: график делает лизинговая компания.</p>`;
      return offerScreen("КП Лизинг", form, doc);
    }
