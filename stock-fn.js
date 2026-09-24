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
    function stockYear(c){
      const code=(String(c&&c.vin||"")[9]||"").toUpperCase();
      const vinYear={A:2010,B:2011,C:2012,D:2013,E:2014,F:2015,G:2016,H:2017,J:2018,K:2019,L:2020,M:2021,N:2022,P:2023,R:2024,S:2025,T:2026,V:2027,W:2028,X:2029,Y:2030};
      if(vinYear[code]) return vinYear[code];
      const prod=String(c&&c.prod||"");
      const m=prod.match(/(20\d{2})/);
      return m?Number(m[1]):0;
    }
    function stockTrimRank(t){
      const s=String(t||"").toLowerCase();
      let r=50;
      if(s.includes("актив")||s.includes("active")) r=10;
      else if(s.includes("прайм")||s.includes("prime")) r=20;
      else if(s.includes("ультра")||s.includes("ultra")) r=30;
      if(s.includes("4wd")) r+=3;
      else if(s.includes("2wd")) r+=1;
      if(s.includes("7 мест")) r+=1;
      return r;
    }
    function stockCmp(a,b){
      const dir=(typeof stockSortDir==="number"?stockSortDir:1)||1;
      const key=(typeof stockSort==="string"&&stockSort)||"trim";
      let d=0;
      if(key==="price") d=stockRrc(a)-stockRrc(b);
      else if(key==="color") d=String(a.color||"").localeCompare(String(b.color||""),"ru");
      else if(key==="year") d=stockYear(a)-stockYear(b);
      else d=stockTrimRank(a.trim)-stockTrimRank(b.trim)||String(a.trim||"").localeCompare(String(b.trim||""),"ru");
      if(!d) d=String(a.color||"").localeCompare(String(b.color||""),"ru");
      if(!d) d=String(a.vin||"").localeCompare(String(b.vin||""));
      return d*dir;
    }
    function stockTrimGroups(rows){
      const map={};
      rows.forEach(r=>{
        const t=String(r.trim||"").trim()||"Без комплектации";
        (map[t]=map[t]||[]).push(r);
      });
      const groups=Object.keys(map).map(trim=>({trim, rows:map[trim].slice().sort(stockCmp)}));
      const dir=(typeof stockSortDir==="number"?stockSortDir:1)||1;
      const key=(typeof stockSort==="string"&&stockSort)||"trim";
      groups.sort((A,B)=>{
        if(key==="price") return (Math.min.apply(null,A.rows.map(stockRrc))-Math.min.apply(null,B.rows.map(stockRrc)))*dir;
        if(key==="year") return (Math.max.apply(null,A.rows.map(stockYear))-Math.max.apply(null,B.rows.map(stockYear)))*dir;
        if(key==="color") return String((A.rows[0]&&A.rows[0].color)||"").localeCompare(String((B.rows[0]&&B.rows[0].color)||""),"ru")*dir;
        return (stockTrimRank(A.trim)-stockTrimRank(B.trim)||A.trim.localeCompare(B.trim,"ru"))*dir;
      });
      return groups;
    }
    function stockIds(byModel){
      const modelOrder=["t4","t4l","t7","t8","tt9","t9","t7l","ta8","a8"];
      const ids=modelOrder.filter(id=>byModel[id]);
      const key=(typeof stockSort==="string"&&stockSort)||"trim";
      const dir=(typeof stockSortDir==="number"?stockSortDir:1)||1;
      if(key==="trim") return ids;
      const nums=(id,fn,how)=>{
        const vals=(byModel[id]||[]).map(fn).filter(v=>v||v===0);
        if(!vals.length) return how==="max"?-1:1e15;
        return how==="max"?Math.max.apply(null,vals):Math.min.apply(null,vals);
      };
      return ids.slice().sort((a,b)=>{
        let d=0;
        if(key==="price") d=nums(a,stockRrc,"min")-nums(b,stockRrc,"min");
        else if(key==="year") d=nums(a,stockYear,"max")-nums(b,stockYear,"max");
        else if(key==="color"){
          const ca=((byModel[a]||[]).slice().sort(stockCmp)[0]||{}).color||"";
          const cb=((byModel[b]||[]).slice().sort(stockCmp)[0]||{}).color||"";
          d=String(ca).localeCompare(String(cb),"ru");
        }
        if(!d) d=modelOrder.indexOf(a)-modelOrder.indexOf(b);
        return d*dir;
      });
    }
    function stockOpened(key, fallback){
      if(typeof stockOpen==="object" && stockOpen && Object.prototype.hasOwnProperty.call(stockOpen, key)) return !!stockOpen[key];
      return !!fallback;
    }
    function stockCard(r){
      const salon=salonLabel(r.salon);
      const price=stockRrc(r);
      const year=stockYear(r);
      const meta=[r.color, year?String(year):"", salon].filter(Boolean).join(" · ");
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
      if(typeof stockSort!=="string") stockSort="trim";
      if(typeof stockSortDir!=="number") stockSortDir=1;
      if(typeof stockOpen!=="object" || !stockOpen) stockOpen={};
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
      const ids=stockIds(byModel);
      const sorts=[["price","Цена"],["color","Цвет"],["year","Год"],["trim","Комплектация"]];
      const sortBtns=sorts.map(([k,lab])=>{
        const on=stockSort===k;
        const arrow=on?(stockSortDir<0?" ↓":" ↑"):"";
        return `<button type="button" class="chip ${on?"on":""}" data-stock-sort="${k}">${lab}${arrow}</button>`;
      }).join("");
      const body = list.length
        ? `<div class="st-board">`+ids.map(id=>{
            const titles={t4:["TENET","T4"],t4l:["TENET","T4L"],t7:["TENET","T7"],t8:["TENET","T8"],tt9:["TENET","T9"],t9:["CHERY","Tiggo 9"],t7l:["CHERY","Tiggo 7 L"],ta8:["TENET","A8"],a8:["CHERY","Arrizo 8"]};
            const known=titles[id];
            const base=MODELS[id]||{id,brand:"TENET",name:id.toUpperCase()};
            const m=known?Object.assign({},base,{brand:known[0],name:known[1]}):base;
            const rows=byModel[id];
            const inn=rows.filter(x=>x.status==="in").length;
            const way=rows.filter(x=>x.status==="way").length;
            const bits=[];
            if(inn) bits.push(inn+" в наличии");
            if(way) bits.push(way+" в пути");
            if(stockSort==="price"){
              const prices=rows.map(stockRrc).filter(Boolean);
              if(prices.length) bits.unshift("от "+rub(Math.min.apply(null,prices))+" ₽");
            }else if(stockSort==="year"){
              const years=rows.map(stockYear).filter(Boolean);
              if(years.length) bits.unshift(String(Math.max.apply(null,years)));
            }else if(stockSort==="color"){
              const color=((rows.slice().sort(stockCmp)[0])||{}).color;
              if(color) bits.unshift(color);
            }
            const opened = stockOpened("m:"+id, stockFilter===id || ids.length===1);
            const groups=stockTrimGroups(rows);
            const trims=groups.map(g=>{
              const prices=g.rows.map(stockRrc).filter(Boolean);
              const from=prices.length?Math.min.apply(null,prices):0;
              const tkey="t:"+id+"|"+g.trim;
              const tOpen=stockOpened(tkey, groups.length===1);
              return `<details class="st-trim" data-acc="${escape(tkey)}" ${tOpen?"open":""}>
                <summary>
                  <b>${escape(g.trim)}</b>
                  <span class="st-meta"><span class="st-count">${g.rows.length}${from?" · от "+rub(from)+" ₽":""}</span><i class="st-chev" aria-hidden="true"></i></span>
                </summary>
                <div class="st-list">${g.rows.map(stockCard).join("")}</div>
              </details>`;
            }).join("");
            const tone=m.brand==="CHERY"?" chery":"";
            return `<details class="st-acc${tone}" data-acc="m:${id}" ${opened?"open":""}>
              <summary>
                <span class="st-id"><small>${escape(m.brand)}</small><b>${escape(m.name)}</b></span>
                <span class="st-meta"><span class="st-count">${rows.length}${bits.length?" · "+bits.join(" · "):""}</span><i class="st-chev" aria-hidden="true"></i></span>
              </summary>
              <div class="st-trims">${trims}</div>
            </details>`;
          }).join("")+`</div>`
        : `<div class="card" style="margin-top:12px"><p>По этому фильтру машин нет.</p></div>`;
      return banner("Склад", `Logicstars · ${meta.updated}`, "TENET")+`
        <p class="lead">Сначала модель, внутри — комплектация. Сортировка меняет порядок машин и групп.</p>
        <div class="study-pick st-filters">
          <button class="chip ${stockStatus==="all"?"on":""}" data-stock-st="all">Все · ${scoped.length}</button>
          <button class="chip ${stockStatus==="in"?"on":""}" data-stock-st="in">В наличии · ${nIn}</button>
          <button class="chip ${stockStatus==="way"?"on":""}" data-stock-st="way">В пути · ${nWay}</button>
        </div>
        <div class="study-pick st-filters st-sorts">
          <span class="st-sort-lab">Сортировка</span>
          ${sortBtns}
        </div>
        ${body}`;
    }
