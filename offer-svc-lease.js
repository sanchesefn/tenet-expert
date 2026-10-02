    function offerService(){
      const d=offerDeal();
      return offerScreen("Оценка сервиса", offerFormNew(d), offerDocNew(d));
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
