    let offerTab = "home";
    function offerVal(id, def){
      const el=document.getElementById(id);
      if(!el) return def;
      const v=String(el.value||"").trim();
      return v||def;
    }
    function offerNum(id, def){
      const el=document.getElementById(id);
      if(!el) return def;
      const n=Number(String(el.value||"").replace(/\s+/g,""));
      return Number.isFinite(n)?n:def;
    }
    function offerOn(id){
      const el=document.getElementById(id);
      return !!(el && el.checked);
    }
    function offerMgr(){
      return (typeof state!=="undefined" && state.display) ? state.display : "отдел продаж";
    }
    function offerCopy(id){
      const el=document.getElementById(id);
      if(!el) return;
      const t=el.innerText||el.textContent||"";
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(t).catch(function(){
          const ta=document.createElement("textarea");
          ta.value=t; document.body.appendChild(ta); ta.select();
          try{ document.execCommand("copy"); }catch(e){}
          ta.remove();
        });
        return;
      }
      const ta=document.createElement("textarea");
      ta.value=t; document.body.appendChild(ta); ta.select();
      try{ document.execCommand("copy"); }catch(e){}
      ta.remove();
    }
    function offerNav(){
      const tabs=[["home","Разделы"],["new","КП Новый а/м"],["service","КП Сервис"],["lease","КП Лизинг"]];
      return `<div class="down-mode" style="margin:0 0 14px">${tabs.map(([id,l])=>`<button type="button" class="chip ${offerTab===id?"on":""}" data-offer-tab="${id}">${l}</button>`).join("")}</div>`;
    }
    function offerHome(){
      const cards=[
        ["new","Н","КП Новый а/м","Прайс, лист оснащения, скидки и PDF"],
        ["service","С","КП Сервис","ТО, сезон, гарантия и пакеты ДЦ"],
        ["lease","Л","КП Лизинг","Компания, флит / BFS, аванс и срок"]
      ];
      return banner("Коммерческое предложение","TENET · Отдел продаж","КП")+`
        <p class="lead">Выберите модель — в КП подтянется лист оснащения из официального прайса.</p>
        ${offerNav()}
        <div class="hub-grid offer-grid">${cards.map(([id,mark,title,lead])=>`
          <button class="card hub-card" data-offer-tab="${id}" type="button">
            <span class="hub-mark">${mark}</span>
            <div class="txt"><h3>${title}</h3><p>${lead}</p></div>
          </button>`).join("")}</div>`;
    }
    function offerDeal(){
      const models=typeof KM_MODELS!=="undefined"?KM_MODELS:[];
      const mid=offerVal("ofModel", models[0]?models[0].id:"t7a");
      const m=models.find(x=>x.id===mid)||models[0]||{id:"t7a",name:"TENET",rrc:0,ti:0,cr:0};
      const prev=offerVal("ofPrevModel", mid);
      const client=offerVal("ofClient","Уважаемый клиент");
      const color=offerVal("ofColor","на выбор");
      let price=offerNum("ofPrice", m.rrc)||m.rrc||0;
      if(prev!==mid) price=m.rrc||0;
      const valid=offerVal("ofValid","7 дней");
      const packEq=typeof offerPack==="function"?offerPack(m.id):null;
      const equip=typeof offerPackText==="function"?offerPackText(packEq):"";
      const rubFn=typeof rub==="function"?rub:String;
      const text=`Коммерческое предложение · новый автомобиль
ООО «ЭКСПЕРТ АВТО САМАРА» · TENET

Клиент: ${client}
Автомобиль: ${m.name}
Цвет: ${color}

РРЦ: ${rubFn(price)} ₽
Итого за автомобиль: ${rubFn(price)} ₽

Предложение действует ${valid}.
Не оферта. Итоговые условия — в договоре салона.
Менеджер: ${offerMgr()}
${equip}`;
      return {m, mid, models, client, color, price, valid, packEq, text};
    }
    function offerNew(){
      const d=offerDeal();
      const rubFn=typeof rub==="function"?rub:String;
      return banner("КП Новый а/м","Коммерческое предложение","КП")+`
        ${offerNav()}
        <div class="km-layout">
          <div class="card">
            <p class="eyebrow">Данные</p>
            <input type="hidden" id="ofPrevModel" value="${escape(d.mid)}" />
            <label class="field" style="max-width:none"><span>Клиент</span><input id="ofClient" value="${escape(d.client)}" /></label>
            <label class="field" style="max-width:none"><span>Комплектация</span>
              <select id="ofModel">${d.models.map(x=>`<option value="${x.id}" ${x.id===d.mid?"selected":""}>${escape(x.name)} · ${rubFn(x.rrc)}</option>`).join("")}</select>
            </label>
            <label class="field" style="max-width:none"><span>Цвет</span><input id="ofColor" value="${escape(d.color)}" /></label>
            <label class="field" style="max-width:none"><span>РРЦ, ₽</span><input id="ofPrice" inputmode="numeric" value="${d.price}" /></label>
            <label class="field" style="max-width:none"><span>Срок действия</span><input id="ofValid" value="${escape(d.valid)}" /></label>
          </div>
          <div class="card">
            <p class="eyebrow">Текст КП</p>
            <pre id="ofTextNew" class="offer-sheet">${escape(d.text)}</pre>
            <div class="who-line" style="margin-top:12px">
              <button type="button" class="btn ivory" data-offer-copy="ofTextNew">Скопировать</button>
            </div>
          </div>
        </div>
        <div class="card offer-equip-card" id="ofEquipCard">
          <p class="eyebrow">Лист оснащения</p>
          <h3 style="margin:0 0 10px">${escape(d.m.name)}</h3>
          ${typeof offerPackHtml==="function"?offerPackHtml(d.packEq):""}
        </div>`;
    }
    function offerService(){
      const packs={"ТО-1":18900,"ТО-2":28900,"Сезонное ТО":12900,"Расширенная гарантия":45000};
      const client=offerVal("osClient","Уважаемый клиент");
      const car=offerVal("osCar","TENET");
      const pack=offerVal("osPack","ТО-1");
      const price=offerNum("osPrice", packs[pack]||18900)||packs[pack]||18900;
      const rubFn=typeof rub==="function"?rub:String;
      const text=`Коммерческое предложение · сервис
ООО «ЭКСПЕРТ АВТО САМАРА» · TENET

Клиент: ${client}
Автомобиль: ${car}
Пакет: ${pack}
Стоимость: ${rubFn(price)} ₽
Менеджер: ${offerMgr()}`;
      return banner("КП Сервис","Коммерческое предложение","КП")+`
        ${offerNav()}
        <div class="km-layout">
          <div class="card">
            <p class="eyebrow">Данные</p>
            <label class="field" style="max-width:none"><span>Клиент</span><input id="osClient" value="${escape(client)}" /></label>
            <label class="field" style="max-width:none"><span>Автомобиль</span><input id="osCar" value="${escape(car)}" /></label>
            <label class="field" style="max-width:none"><span>Пакет</span>
              <select id="osPack">${Object.keys(packs).map(p=>`<option ${p===pack?"selected":""}>${p}</option>`).join("")}</select>
            </label>
            <label class="field" style="max-width:none"><span>Стоимость, ₽</span><input id="osPrice" inputmode="numeric" value="${price}" /></label>
          </div>
          <div class="card">
            <p class="eyebrow">Текст КП</p>
            <pre id="ofTextSvc" class="offer-sheet">${escape(text)}</pre>
            <button type="button" class="btn ivory" data-offer-copy="ofTextSvc">Скопировать</button>
          </div>
        </div>`;
    }
    function offerLease(){
      const fset=typeof FLEET_BFS!=="undefined"?FLEET_BFS:{};
      const ids=Object.keys(fset);
      const fid=offerVal("olModel", ids[0]||"t7a");
      const f=fset[fid]||{name:"TENET",rrc:0,tidy:0};
      const company=offerVal("olCo","ООО «Компания»");
      const months=offerNum("olMonths", 36)||36;
      const advPct=offerNum("olAdv", 20)||20;
      const price=f.tidy||f.rrc||0;
      const adv=Math.round(price*advPct/100);
      const rubFn=typeof rub==="function"?rub:String;
      const text=`Коммерческое предложение · лизинг
ООО «ЭКСПЕРТ АВТО САМАРА» · TENET

Лизингополучатель: ${company}
Автомобиль: ${f.name}
Цена флит: ${rubFn(price)} ₽
Аванс: ${advPct}% · ${rubFn(adv)} ₽
Срок: ${months} мес.
Менеджер: ${offerMgr()}`;
      return banner("КП Лизинг","Коммерческое предложение","КП")+`
        ${offerNav()}
        <div class="km-layout">
          <div class="card">
            <p class="eyebrow">Данные</p>
            <label class="field" style="max-width:none"><span>Компания</span><input id="olCo" value="${escape(company)}" /></label>
            <label class="field" style="max-width:none"><span>Комплектация</span>
              <select id="olModel">${ids.map(id=>`<option value="${id}" ${id===fid?"selected":""}>${escape((fset[id]||{}).name||id)}</option>`).join("")}</select>
            </label>
            <label class="field" style="max-width:none"><span>Аванс, %</span><input id="olAdv" inputmode="numeric" value="${advPct}" /></label>
            <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="olMonths" inputmode="numeric" value="${months}" /></label>
          </div>
          <div class="card">
            <p class="eyebrow">Текст КП</p>
            <pre id="ofTextLease" class="offer-sheet">${escape(text)}</pre>
            <button type="button" class="btn ivory" data-offer-copy="ofTextLease">Скопировать</button>
          </div>
        </div>`;
    }
    function offer(){
      if(typeof needAuth==="function" && needAuth()) return login();
      if(offerTab==="new") return offerNew();
      if(offerTab==="service") return offerService();
      if(offerTab==="lease") return offerLease();
      return offerHome();
    }
    function offerBind(){
      document.querySelectorAll("[data-offer-tab]").forEach(b=>b.onclick=()=>{ offerTab=b.dataset.offerTab||"home"; view="offer"; render(); });
      document.querySelectorAll("[data-offer-copy]").forEach(b=>b.onclick=()=>{
        offerCopy(b.dataset.offerCopy);
        b.textContent="Скопировано";
        setTimeout(()=>{ b.textContent="Скопировать"; }, 1200);
      });
      ["ofClient","ofModel","ofColor","ofPrice","ofValid","osClient","osCar","osPack","osPrice","olCo","olModel","olAdv","olMonths"].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.addEventListener("change", ()=>{ view="offer"; render(); });
      });
    }
