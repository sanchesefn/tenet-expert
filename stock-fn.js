    function salonLabel(s){
      const t=String(s||"");
      if(/korichnev/i.test(t)) return "Brown";
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
        }else if(m==="tt9") id=t.includes("прайм")?"tt9p":"tt9u";
        else if(m==="t9") id=t.includes("прайм")?"t9p":"t9u";
        else if(m==="ta8") id=(t.includes("ultra")||t.includes("ультра")||t.includes("2.0"))?"ta8u":"ta8p";
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
      const map={t4p:2449000,t4la:2329000,t4lp:2479000,t7a:2785000,t7p:2985000,t7a4:2990000,t7p4:3190000,t8a:3099000,t8p:3299000,t8p4:3630000,t8u4:3885000,tt9p:3949000,tt9u:4299000,t9p:4335000,t9u:4640000,ta8p:2999000,ta8u:3499000,a8a:2865000,a8p:3060000,a8u:3275000,t7l:2735000};
      return map[id]||0;
    }
    function stockIsDemo(c){
      if(!c) return false;
      if(c.demo) return true;
      const v=String(c.vin||"").toUpperCase();
      return v==="EDXGD34B2TE109064" || v==="EDXGB32B0TE110108";
    }
    function stockBadges(r){
      const bits=[];
      bits.push(`<span class="st ${r.status}">${(ST_LABEL&&ST_LABEL[r.status])||r.status}</span>`);
      if(r.invoice) bits.push(`<span class="st inv">Спец инвойс</span>`);
      else {
        if(typeof carIsMpt==="function"?carIsMpt(r):r.mpt) bits.push(`<span class="st mpt">МПТ</span>`);
        if(typeof carIsCorp==="function"?carIsCorp(r):(r.corp || (typeof CORP_VINS!=="undefined" && CORP_VINS.has(r.vin)))) bits.push(`<span class="st corp">Корпоративный</span>`);
      }
      if(r.demo) bits.push(`<span class="st demo">ДЕМО</span>`);
      return bits.join(" ");
    }
    function stockCard(r){
      const salon=salonLabel(r.salon);
      const price=stockRrc(r);
      const meta=[r.trim, r.color, salon, r.prod].filter(Boolean).join(" · ");
      const reservedCls=r.reserved?" is-reserved":"";
      const reservedBadge=r.reserved?`<span class="st reserved st-reserved-mid">Забронирован</span>`:"";
      return `<article class="st-row${reservedCls}${r.invoice?" is-invoice":""}">
        <div>
          <b>${escape(r.name||"")}</b>
          <small>${escape(meta)}</small>
          <small class="st-vin">${escape(r.vin||"")}${r.note?" · "+escape(r.note):""}</small>
        </div>
        ${reservedBadge}
        <div class="st-side">
          <b>${price?rub(price)+" ₽":"—"}</b>
          <div class="st-flags">${stockBadges(r)}</div>
        </div>
      </article>`;
    }
    function stock(){
      if(needAuth()) return login();
      const meta=typeof STOCK_META==="object"?STOCK_META:{updated:"11.09.2026"};
      const sale=(typeof STOCK!=="undefined"?STOCK:[]);
      const list=sale.filter(x=>{
        if(stockFilter!=="all" && x.model!==stockFilter) return false;
        if(stockStatus!=="all" && x.status!==stockStatus) return false;
        return true;
      });
      const scoped=stockFilter==="all"?sale:sale.filter(x=>x.model===stockFilter);
      const nIn=scoped.filter(x=>x.status==="in").length;
      const nWay=scoped.filter(x=>x.status==="way").length;
      const byModel={};
      list.forEach(r=>{ (byModel[r.model]=byModel[r.model]||[]).push(r); });
      const modelOrder=["t4","t4l","t7","t8","tt9","t9","t7l","ta8","a8"];
      const ids=modelOrder.filter(id=>byModel[id]);
      const body = list.length
        ? ids.map(id=>{
            const m=MODELS[id]||{id,brand:"TENET",name:id.toUpperCase()};
            const rows=byModel[id];
            const inn=rows.filter(x=>x.status==="in").length;
            const way=rows.filter(x=>x.status==="way").length;
            const bits=[];
            if(inn) bits.push(inn+" в наличии");
            if(way) bits.push(way+" в пути");
            const opened = stockFilter===id || ids.length===1;
            return `<details class="st-acc" ${opened?"open":""}>
              <summary>
                <span><small>${escape(m.brand)}</small><b>${escape(m.name)}</b></span>
                <span class="st-count">${rows.length}${bits.length?" · "+bits.join(" · "):""}</span>
              </summary>
              <div class="st-list">${rows.map(stockCard).join("")}</div>
            </details>`;
          }).join("")
        : `<div class="card" style="margin-top:12px"><p>По этому фильтру машин нет.</p></div>`;
      return banner("Склад", `Logicstars · ${meta.updated}`, "TENET")+`
        <p class="lead">Нажмите модель, чтобы раскрыть список. В наличии — у дилера. В пути — завод или Домодедово.</p>
        <div class="study-pick st-filters">
          <button class="chip ${stockStatus==="all"?"on":""}" data-stock-st="all">Все · ${scoped.length}</button>
          <button class="chip ${stockStatus==="in"?"on":""}" data-stock-st="in">В наличии · ${nIn}</button>
          <button class="chip ${stockStatus==="way"?"on":""}" data-stock-st="way">В пути · ${nWay}</button>
        </div>
        ${body}`;
    }
