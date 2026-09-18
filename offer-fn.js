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
      const id=offerTab==="service"?"ofTextSvc":"ofTextLease";
      const el=document.getElementById(id);
      const t=el?(el.innerText||el.textContent||""):"";
      offerPdfOpen("<!doctype html><html lang=ru><head><meta charset=utf-8><title>КП</title><style>body{font-family:Inter,system-ui,sans-serif;padding:28px;white-space:pre-wrap;font-size:14px;line-height:1.45}@media print{body{padding:12px}}</style></head><body>"+escape(t)+"</body></html>");
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
            <div class="who-line">
              <button type="button" class="btn ivory" data-offer-copy="ofTextSvc">Скопировать</button>
              <button type="button" class="btn" data-offer-pdf="svc">PDF</button>
            </div>
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
            <label class="field" style="max-width:none" marign="0"><span>Аванс, %</span><input id="olAdv" inputmode="numeric" value="${advPct}" /></label>
            <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="olMonths" inputmode="numeric" value="${months}" /></label>
          </div>
          <div class="card">
            <p class="eyebrow">Текст КП</p>
            <pre id="ofTextLease" class="offer-sheet">${escape(text)}</pre>
            <div class="who-line">
              <button type="button" class="btn ivory" data-offer-copy="ofTextLease">Скопировать</button>
              <button type="button" class="btn" data-offer-pdf="lease">PDF</button>
            </div>
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
      ["ofClient","ofColor","ofPrice","ofValid","osClient","osCar","osPack","osPrice","olCo","olModel","olAdv","olMonths"].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.addEventListener("change", ()=>{ view="offer"; render(); });
      });
    }
