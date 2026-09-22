    let offerTab = "home";
    let offerFam = "";
    let offerMid = "";
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
    function offerLineId(r){
      const t=String((r&&(r.name||r.trim))||"").toLowerCase();
      const m=(r&&r.model)||"";
      if(m==="t4") return "t4p";
      if(m==="t4l") return t.indexOf("прайм")>=0?"t4lp":"t4la";
      if(m==="t7"){
        if(t.indexOf("4wd")>=0 && t.indexOf("прайм")>=0) return "t7p4";
        if(t.indexOf("4wd")>=0) return "t7a4";
        if(t.indexOf("прайм")>=0) return "t7p";
        return "t7a";
      }
      if(m==="t8"){
        if(t.indexOf("ультра")>=0 && t.indexOf("4wd")>=0) return "t8u4";
        if(t.indexOf("прайм")>=0 && t.indexOf("4wd")>=0) return "t8p4";
        if(t.indexOf("ультра")>=0) return "t8u";
        if(t.indexOf("прайм")>=0) return "t8p";
        return "t8a";
      }
      if(m==="tt9") return t.indexOf("ультра")>=0?"tt9u":"tt9p";
      if(m==="t9") return t.indexOf("ультра")>=0?"t9u":"t9p";
      if(m==="a8"){
        if(t.indexOf("ультра")>=0) return "a8u";
        if(t.indexOf("прайм")>=0) return "a8p";
        return "a8a";
      }
      return m||"";
    }
    function offerLines(){
      if(typeof PRICE_ROWS!=="undefined" && PRICE_ROWS.length){
        return PRICE_ROWS.map(r=>({id:offerLineId(r), fam:r.model, name:r.name, motor:r.motor||"", rrc:r.price||0, brand:r.brand||"TENET"}));
      }
      const km=typeof KM_MODELS!=="undefined"?KM_MODELS:[];
      return km.map(x=>({id:x.id, fam:x.stock||"", name:x.name, motor:"", rrc:x.rrc||0, brand:x.brand||"TENET"}));
    }
    function offerFams(){
      const mods=typeof MODELS!=="undefined"?Object.values(MODELS):[];
      if(mods.length){
        return mods.map(m=>({id:m.id, name:(m.brand&&m.brand!=="TENET"?m.brand+" ":"")+m.name, img:m.img||("cars/"+m.id+".jpg"), brand:m.brand||"TENET"}));
      }
      const seen={}, out=[];
      offerLines().forEach(l=>{
        if(l.fam && !seen[l.fam]){ seen[l.fam]=1; out.push({id:l.fam, name:String(l.fam).toUpperCase(), img:"cars/"+l.fam+".jpg", brand:l.brand}); }
      });
      return out;
    }
    function offerHome(){
      const cards=[
        ["new","Н","КП Новый а/м","Модель → комплектация → PDF"],
        ["service","С","КП Сервис","ТО, сезон, гарантия и пакеты ДЦ"],
        ["lease","Л","КП Лизинг","Компания, флит / BFS, аванс и срок"]
      ];
      return banner("Коммерческое предложение","TENET · Отдел продаж","КП")+`
        <p class="lead">Сначала выберите модель плашкой, затем комплектацию — КП уйдёт в PDF.</p>
        ${offerNav()}
        <div class="hub-grid offer-grid">${cards.map(([id,mark,title,lead])=>`
          <button class="card hub-card" data-offer-tab="${id}" type="button">
            <span class="hub-mark">${mark}</span>
            <div class="txt"><h3>${title}</h3><p>${lead}</p></div>
          </button>`).join("")}</div>`;
    }
    function offerDeal(){
      const lines=offerLines();
      const fams=offerFams();
      let fam=offerFam || offerVal("ofFam","");
      let mid=offerMid || offerVal("ofModel","");
      const line=lines.find(x=>x.id===mid);
      if(line && !fam) fam=line.fam;
      if(line && fam && line.fam!==fam){ mid=""; }
      const trims=lines.filter(x=>!fam || x.fam===fam);
      const m=trims.find(x=>x.id===mid) || {id:"", name:"", rrc:0, fam:fam, motor:"", brand:"TENET"};
      const prev=offerVal("ofPrevModel", mid);
      const client=offerVal("ofClient","Уважаемый клиент");
      const color=offerVal("ofColor","на выбор");
      let price=offerNum("ofPrice", m.rrc)||m.rrc||0;
      if(prev!==mid) price=m.rrc||0;
      const valid=offerVal("ofValid","7 дней");
      const packEq=(m.id && typeof offerPack==="function")?offerPack(m.id):null;
      const equip=(packEq && typeof offerPackText==="function")?offerPackText(packEq):"";
      const rubFn=typeof rub==="function"?rub:String;
      const famObj=fams.find(x=>x.id===fam)||null;
      const text=m.id?`Коммерческое предложение · новый автомобиль
ООО «ЭКСПЕРТ АВТО САМАРА» · TENET

Клиент: ${client}
Автомобиль: ${m.name}
Мотор: ${m.motor||"—"}
Цвет: ${color}

РРЦ: ${rubFn(price)} ₽
Итого за автомобиль: ${rubFn(price)} ₽

Предложение действует ${valid}.
Не оферта. Итоговые условия — в договоре салона.
Менеджер: ${offerMgr()}
${equip}`:"";
      return {m, mid, fam, fams, trims, lines, famObj, client, color, price, valid, packEq, text};
    }
    function offerFamHtml(d){
      const rubFn=typeof rub==="function"?rub:String;
      return `<p class="offer-step">1 · Модель</p><div class="offer-fams">${d.fams.map(f=>{
        const prices=d.lines.filter(x=>x.fam===f.id && x.rrc).map(x=>x.rrc);
        const from=prices.length?Math.min.apply(null, prices):0;
        return `<button type="button" class="offer-fam ${f.id===d.fam?"on":""}" data-offer-fam="${f.id}">
          <img src="${escape(f.img)}" alt="${escape(f.name)}" />
          <span class="txt"><b>${escape(f.name)}</b><span>${from?"от "+rubFn(from)+" ₽":"линейка"}</span></span>
        </button>`;
      }).join("")}</div>`;
    }
    function offerTrimHtml(d){
      if(!d.fam) return `<p class="calc-note">Выберите модель — затем откроется комплектация.</p>`;
      const rubFn=typeof rub==="function"?rub:String;
      const list=d.trims;
      if(!list.length) return `<p class="calc-note">Для этой модели комплектации не найдены.</p>`;
      return `<p class="offer-step">2 · Комплектация</p><div class="offer-trims">${list.map(x=>`
        <button type="button" class="offer-trim ${x.id===d.mid?"on":""}" data-offer-trim="${x.id}">
          <b>${escape(x.name)}</b>
          <span>${x.motor?escape(x.motor)+" · ":""}${rubFn(x.rrc)} ₽</span>
        </button>`).join("")}</div>`;
    }
    function offerNew(){
      const d=offerDeal();
      const ready=!!d.mid;
      return banner("КП Новый а/м","Модель → комплектация → PDF","КП")+`
        ${offerNav()}
        <div class="card">
          <p class="eyebrow">Клиент</p>
          <input type="hidden" id="ofFam" value="${escape(d.fam||"")}" />
          <input type="hidden" id="ofModel" value="${escape(d.mid||"")}" />
          <input type="hidden" id="ofPrevModel" value="${escape(d.mid||"")}" />
          <label class="field" style="max-width:none"><span>Клиент</span><input id="ofClient" value="${escape(d.client)}" /></label>
          ${offerFamHtml(d)}
          ${offerTrimHtml(d)}
          ${ready?`
          <label class="field" style="max-width:none"><span>Цвет</span><input id="ofColor" value="${escape(d.color)}" /></label>
          <label class="field" style="max-width:none"><span>РРЦ, ₽</span><input id="ofPrice" inputmode="numeric" value="${d.price}" /></label>
          <label class="field" style="max-width:none"><span>Срок действия</span><input id="ofValid" value="${escape(d.valid)}" /></label>
          `:""}
        </div>
        ${ready?`
        <div class="km-layout" style="margin-top:14px">
          <div class="card">
            <p class="eyebrow">Текст КП</p>
            <pre id="ofTextNew" class="offer-sheet">${escape(d.text)}</pre>
            <div class="who-line" style="margin-top:12px">
              <button type="button" class="btn ivory" data-offer-copy="ofTextNew">Скопировать</button>
              <button type="button" class="btn" data-offer-pdf="1">Скачать PDF</button>
            </div>
          </div>
          <div class="card offer-equip-card" id="ofEquipCard">
            <p class="eyebrow">Лист оснащения</p>
            <h3 style="margin:0 0 10px">${escape(d.m.name)}</h3>
            ${typeof offerPackHtml==="function"?offerPackHtml(d.packEq):""}
          </div>
        </div>`:`<p class="lead" style="margin-top:12px">После выбора комплектации соберём КП и откроем PDF.</p>`}`;
    }
    function offerPrintHtml(d){
      const rubFn=typeof rub==="function"?rub:String;
      const dt=new Date().toLocaleDateString("ru-RU");
      const specs=(d.packEq&&d.packEq.specs||[]).map(p=>"<tr><td>"+escape(p[0])+"</td><td>"+escape(p[1])+"</td></tr>").join("");
      const groups=(d.packEq&&d.packEq.groups||[]).map(g=>"<h3>"+escape(g[0])+"</h3><ul>"+g[1].map(it=>"<li>"+escape(it)+"</li>").join("")+"</ul>").join("");
      return "<!doctype html><html lang=ru><head><meta charset=utf-8><title>КП "+escape(d.m.name)+"</title><style>"+
        "body{font-family:Inter,system-ui,sans-serif;color:#111;margin:0;background:#fff}"+ 
        ".page{max-width:820px;margin:0 auto;padding:28px 32px}"+ 
        ".top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #c81e2b;padding-bottom:12px;margin-bottom:18px}"+ 
        ".top b{font-size:22px}.muted{color:#5c5a54;font-size:12px}"+ 
        "table{width:100%;border-collapse:collapse;margin:8px 0 16px}td{padding:6px 8px;border-bottom:1px solid #eee;vertical-align:top;font-size:13px}td:first-child{color:#5c5a54;width:38%}"+ 
        ".price{background:#f4f1ea;border-radius:12px;padding:14px 16px;margin:12px 0 18px;display:flex;justify-content:space-between;align-items:baseline}"+ 
        ".price b{font-size:22px}h3{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#5c5a54;margin:16px 0 6px}"+ 
        "ul{margin:0 0 8px;padding:0 0 0 18px;font-size:13px;line-height:1.45}"+ 
        ".foot{margin-top:24px;font-size:11px;color:#5c5a54;border-top:1px solid #e4dfd4;padding-top:10px}"+ 
        "@media print{.hint{display:none}.page{padding:12px}}"+ 
        "</style></head><body><div class=page>"+
        "<div class=top><div><p class=muted>ООО «ЭКСПЕРТ АВТО САМАРА» · TENET</p><b>Коммерческое предложение</b></div><div class=muted>"+escape(dt)+"</div></div>"+
        "<table><tr><td>Клиент</td><td>"+escape(d.client)+"</td></tr>"+
        "<tr><td>Автомобиль</td><td>"+escape(d.m.name)+"</td></tr>"+
        "<tr><td>Мотор</td><td>"+escape(d.m.motor||"—")+"</td></tr>"+
        "<tr><td>Цвет</td><td>"+escape(d.color)+"</td></tr>"+
        "<tr><td>Срок действия</td><td>"+escape(d.valid)+"</td></tr>"+
        "<tr><td>Менеджер</td><td>"+escape(offerMgr())+"</td></tr></table>"+
        "<div class=price><span>Итого за автомобиль</span><b>"+rubFn(d.price)+" ₽</b></div>"+
        (specs?"<h3>Характеристики</h3><table>"+specs+"</table>":"")+
        groups+
        "<div class=foot>Не оферта. Итоговые условия — в договоре салона. Источник оснащения: "+escape((d.packEq&&d.packEq.src)||"официальный прайс")+".</div>"+
        "<p class=\"muted hint\">В диалоге печати выберите «Сохранить как PDF».</p>"+
        "</div></body></html>";
    }
    function offerPdfOpen(html){
      const w=window.open("","offerpdf","width=920,height=1200");
      if(!w) return;
      w.document.open();
      w.document.write(html);
      w.document.close();
      setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} }, 280);
    }
    function offerPdf(){
      if(offerTab==="new"){
        const d=offerDeal();
        if(!d.mid) return;
        offerPdfOpen(offerPrintHtml(d));
        return;
      }
      const src=document.getElementById("ofPrint");
      if(src && src.innerHTML){
        offerPdfOpen('<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>КП TENET</title><style>@page{size:A4;margin:14mm}body{margin:0;font:13px/1.45 Inter,system-ui,sans-serif;color:#111}h1{font-size:22px;margin:0 0 6px}h2{font-size:15px;margin:18px 0 8px;text-transform:uppercase}table{width:100%;border-collapse:collapse;margin:0 0 12px}td,th{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left}ul{margin:0 0 10px;padding:0 0 0 18px}.offer-print-brand{letter-spacing:.16em;text-transform:uppercase;font-size:11px;color:#c81e2b;font-weight:700}.offer-print-note{color:#666;font-size:12px;margin-top:18px}</style></head><body>'+src.innerHTML+'</body></html>');
        return;
      }
      const id=offerTab==="service"?"ofTextSvc":"ofTextLease";
      const el=document.getElementById(id);
      const t=el?(el.innerText||el.textContent||""):"";
      offerPdfOpen("<!doctype html><html lang=ru><head><meta charset=utf-8><title>КП</title><style>body{font-family:Inter,system-ui,sans-serif;padding:28px;white-space:pre-wrap;font-size:14px;line-height:1.45}@media print{body{padding:12px}}</style></head><body>"+escape(t)+"</body></html>");
    }
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

    function offer(){
      if(typeof needAuth==="function" && needAuth()) return login();
      if(offerTab==="new") return offerNew();
      if(offerTab==="service") return offerService();
      if(offerTab==="lease") return offerLease();
      return offerHome();
    }
    function offerBind(){
      document.querySelectorAll("[data-offer-tab]").forEach(b=>b.onclick=()=>{ offerTab=b.dataset.offerTab||"home"; view="offer"; render(); });
      document.querySelectorAll("[data-offer-fam]").forEach(b=>b.onclick=()=>{
        offerFam=b.dataset.offerFam||"";
        const ok=offerLines().some(x=>x.fam===offerFam && x.id===offerMid);
        if(!ok) offerMid="";
        offerTab="new"; view="offer"; render();
      });
      document.querySelectorAll("[data-offer-trim]").forEach(b=>b.onclick=()=>{
        offerMid=b.dataset.offerTrim||"";
        const line=offerLines().find(x=>x.id===offerMid);
        if(line) offerFam=line.fam;
        offerTab="new"; view="offer"; render();
      });
      document.querySelectorAll("[data-offer-copy]").forEach(b=>b.onclick=()=>{
        offerCopy(b.dataset.offerCopy);
        b.textContent="Скопировано";
        setTimeout(()=>{ b.textContent="Скопировать"; }, 1200);
      });
      document.querySelectorAll("[data-offer-pdf]").forEach(b=>b.onclick=()=>offerPdf());
      ["ofClient","ofColor","ofPrice","ofValid","osClient","osModel","osCar","osVin","osPack","osPrice","osNote","osValid","olCo","olInn","olModel","olPrice","olAdv","olMonths","olValid"].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.addEventListener("change", ()=>{ view="offer"; render(); });
      });
    }
