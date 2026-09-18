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
      const tabs=[
        ["home","Разделы"],
        ["new","КП Новый а/м"],
        ["service","КП Сервис"],
        ["lease","КП Лизинг"]
      ];
      return `<div class="down-mode" style="margin:0 0 14px">${tabs.map(([id,l])=>`<button type="button" class="chip ${offerTab===id?"on":""}" data-offer-tab="${id}">${l}</button>`).join("")}</div>`;
    }
    function offerHome(){
      const cards=[
        ["new","Н","КП Новый а/м","Прайс, скидки, каско, кредит / МПТ и PDF"],
        ["service","С","КП Сервис","ТО, сезон, гарантия и пакеты ДЦ"],
        ["lease","Л","КП Лизинг","Компания, флит / BFS, аванс и срок"]
      ];
      return banner("Коммерческое предложение","TENET · Отдел продаж","КП")+`
        <p class="lead">Три шаблона в том же виде, что и разделы кабинета. Новый а/м тянет полный лист из прайса и считает условия как калькулятор.</p>
        ${offerNav()}
        <div class="hub-grid offer-grid">${cards.map(([id,mark,title,lead])=>`
          <button class="card hub-card" data-offer-tab="${id}" type="button">
            <span class="hub-mark">${mark}</span>
            <div class="txt"><h3>${title}</h3><p>${lead}</p></div>
          </button>`).join("")}</div>`;
    }
