    function salonLabel(s){
      const t=String(s||"");
      if(/коричнев/i.test(t)) return "Brown";
      return t;
    }
    function stockRrc(r){
      if(r && r.rrc) return Number(r.rrc)||0;
      let id="";
      if(typeof kmIdFromCar==="function") id=kmIdFromCar(r)||"";
      if(!id){
        const t=String(r&&r.trim||"").toLowerCase();
        const m=r&&r.model||"";
        if(m==="t4") id="t4p";
        else if(m==="t4l") id=t.includes("прайм")?"t4lp":"t4la";
        else if(m==="t7"){
          if(t.includes("4wd")&&t.includes("прайм")) id="t7p4";
          else if(t.includes("4wd")) id="t7a4";
          else if(t.includes("прайм")) id="t7p";
          else id="t7a";
        }else if(m==="t8"){
          if(t.includes("ультра")) id="t8u4";
          else if(t.includes("4wd")) id="t8p4";
          else if(t.includes("прайм")) id="t8p";
          else id="t8a";
        }else if(m==="t9") id=t.includes("прайм")?"t9p":"t9u";
        else if(m==="a8"){
          if(t.includes("ультра")) id="a8u";
          else if(t.includes("актив")) id="a8a";
          else id="a8p";
        }else if(m==="t7l") id="t7l";
      }
      if(typeof KM_MODELS!=="undefined"){
        const line=(KM_MODELS.find(x=>x.id===id)||{});
        if(line.rrc) return line.rrc;
      }
      const map={t4p:2449000,t4la:2329000,t4lp:2479000,t7a:2785000,t7p:2985000,t7a4:2990000,t7p4:3190000,t8a:3099000,t8p:3299000,t8p4:3630000,t8u4:3885000,t9p:4335000,t9u:4640000,a8a:2865000,a8p:3060000,a8u:3275000,t7l:2735000};
      return map[id]||0;
    }
    function stock(){
      if(needAuth()) return login();
      const meta=typeof STOCK_META==="object"?STOCK_META:{updated:"09.09.2026"};
      const list=STOCK.filter(x=>{
        if(stockFilter!=="all" && x.model!==stockFilter) return false;
        if(stockStatus!=="all" && x.status!==stockStatus) return false;
        return true;
      });
      const scoped=stockFilter==="all"?STOCK:STOCK.filter(x=>x.model===stockFilter);
      const nIn=scoped.filter(x=>x.status==="in").length;
      const nWay=scoped.filter(x=>x.status==="way").length;
      const byModel={};
      list.forEach(r=>{ (byModel[r.model]=byModel[r.model]||[]).push(r); });
      const modelOrder=["t4","t4l","t7","t8","t9","t7l","a8"];
      function block(rows){
        if(!rows.length) return `<p class="empty">Нет машин</p>`;
        const showSalon=rows.some(r=>salonLabel(r.salon));
        const showProd=rows.some(r=>r.prod);
        return `<div style="overflow:auto"><table class="sheet">
          <thead><tr><th>Авто</th><th>Цвет</th>${showSalon?"<th>Салон</th>":""}${showProd?"<th>Производство</th>":""}<th>Цена</th><th>VIN</th><th>Статус</th><th>Где</th></tr></thead>
          <tbody>${rows.map(r=>{
            const salon=salonLabel(r.salon);
            const price=stockRrc(r);
            return `<tr>
            <td><b>${escape(r.name)}</b><div style="color:var(--muted);font-size:12px">${escape(r.trim)}</div></td>
            <td>${escape(r.color)}</td>
            ${showSalon?`<td>${salon?`<b>${escape(salon)}</b>`:"—"}</td>`:""}
            ${showProd?`<td>${escape(r.prod||"—")}</td>`:""}
            <td>${price?`<b>${rub(price)} ₽</b>`:"—"}</td>
            <td class="vin">${escape(r.vin)}</td>
            <td><span class="st ${r.status}">${ST_LABEL[r.status]||r.status}</span>${r.invoice?` <span class="st inv">Спец инвойс</span>`:""}${r.mpt?` <span class="st mpt">МПТ</span>`:""}</td>
            <td>${escape(r.note)}</td>
          </tr>`;
          }).join("")}</tbody>
        </table></div>`;
      }
      const body = list.length
        ? modelOrder.filter(id=>byModel[id]).map(id=>{
            const m=MODELS[id]||{id,brand:"TENET",name:id.toUpperCase()};
            const rows=byModel[id];
            const inn=STOCK.filter(x=>x.model===id && x.status==="in").length;
            const way=STOCK.filter(x=>x.model===id && x.status==="way").length;
            const bits=[];
            if(stockStatus!=="way" && inn) bits.push(inn+" в наличии");
            if(stockStatus!=="in" && way) bits.push(way+" в пути");
            const head=bits.length?` · ${bits.join(" · ")}`:"";
            return `<div class="card" style="margin-top:12px;padding:14px">
              <div class="eyebrow">${escape(m.brand)}</div>
              <h3 style="margin:0 0 8px">${escape(m.name)}${head}</h3>
              ${block(rows)}
            </div>`;
          }).join("")
        : `<div class="card" style="margin-top:12px"><p>По этому фильтру машин нет.</p></div>`;
      return banner("Склад", `Logicstars · ${meta.updated}`, "TENET")+`
        <p class="lead">Непроданные и отложенные из Logicstars, TENET и CHERY. <b>В наличии</b> — у дилера. <b>В пути</b> — завод или Домодедово. У T7 — салон Brown, дата производства и зелёная плашка МПТ. Снимок ${meta.updated}.</p>
        <div class="study-pick" style="margin-top:12px">
          <button class="chip ${stockFilter==="all"?"on":""}" data-stock="all">Все · ${STOCK.length}</button>
          ${["t4","t4l","t7","t8","t9","t7l","a8"].map(id=>{
            const m=MODELS[id]||{id,brand:"TENET",name:id.toUpperCase()};
            const n=STOCK.filter(x=>x.model===id).length;
            return `<button class="chip ${stockFilter===id?"on":""}" data-stock="${id}">${m.name}${n?` · ${n}`:" · нет"}</button>`;
          }).join("")}
        </div>
        <div class="study-pick">
          <button class="chip ${stockStatus==="all"?"on":""}" data-stock-st="all">Все статусы</button>
          <button class="chip ${stockStatus==="in"?"on":""}" data-stock-st="in">В наличии · ${nIn}</button>
          <button class="chip ${stockStatus==="way"?"on":""}" data-stock-st="way">В пути · ${nWay}</button>
        </div>
        ${body}
        <p class="lead">Не обещать срок, если машина в пути. Цвет клиенту — как в карточке, не «примерно синий».</p>`;
    }
