    let offerTab = "home";
    let offerOwnCar = "";
    let offerOwnVal = 0;
    let offerSeed = null;
    let offerDocCurrent = null;
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
      const tabs=[["home","Разделы"],["new","КП Новый а/м"],["service","Оценка сервиса"],["lease","КП Лизинг"]];
      return `<div class="down-mode" style="margin:0 0 14px">${tabs.map(([id,l])=>`<button type="button" class="chip ${offerTab===id?"on":""}" data-offer-tab="${id}">${l}</button>`).join("")}</div>`;
    }
    function offerHome(){
      const cards=[["new","Н","КП Новый а/м","Прайс, скидки, каско, кредит и PDF"],["service","С","Оценка сервиса","Клиенту из сервиса: меняем его машину на новую"],["lease","Л","КП Лизинг","Компания, флит, аванс и PDF"]];
      return banner("Коммерческое предложение","TENET · Отдел продаж","КП")+`
        <p class="lead">Слева условия, справа бланк. Клиенту уходит PDF: его скачивают и пересылают.</p>
        ${offerNav()}
        <div class="hub-grid offer-grid">${cards.map(([id,mark,title,lead])=>`<button class="card hub-card" data-offer-tab="${id}" type="button"><span class="hub-mark">${mark}</span><div class="txt"><h3>${title}</h3><p>${lead}</p></div></button>`).join("")}</div>`;
    }
    function offerDeal(){
      const models=typeof KM_MODELS!=="undefined"?KM_MODELS:[];
      const seeded=!!(offerSeed && !document.getElementById("ofModel"));
      const S=seeded?offerSeed:null;
      if(seeded) offerSeed=null;
      const mid=S?S.mid:offerVal("ofModel", models[0]?models[0].id:"t7a");
      const m=models.find(x=>x.id===mid)||models[0]||{id:"t7a",name:"TENET",rrc:0,ti:0,cr:0};
      const prevModel=S?mid:offerVal("ofPrevModel", mid);
      const client=offerVal("ofClient","");
      const color=offerVal("ofColor","");
      let price=S?(Number(S.price)||0):(offerNum("ofPrice", m.rrc)||m.rrc);
      if(!S && prevModel!==mid) price=m.rrc;
      const useTi=S?!!S.useTi:offerOn("ofTi");
      const useLoan=S?!!S.useLoan:offerOn("ofLoan");
      const showDealCr=(m.cr||0)>0 && (m.id!=="t7p" || useLoan);
      const useCr=showDealCr && (S?!!S.useCr:offerOn("ofCr"));
      const spec=S?(Number(S.spec)||0):(offerNum("ofSpec", 0)||0);
      const useDcTi=useTi && (S?!!S.useDcTi:offerOn("ofDcTi"));
      const useDcCr=useLoan && (S?!!S.useDcCr:offerOn("ofDcCr"));
      const dcDef=typeof KM_DC_DEF==="number"?KM_DC_DEF:100000;
      const dcTi=useDcTi?(S?(Number(S.dcTi)||0):(offerNum("ofDcTiAmt", dcDef)||0)):0;
      const dcCr=useDcCr?(S?(Number(S.dcCr)||0):(offerNum("ofDcCrAmt", dcDef)||0)):0;
      const addons=S?(Number(S.addons)||0):(offerNum("ofDo", 0)||0);
      let casco=0, pack=0;
      if(useLoan){
        pack=S?(Number(S.pack)||0):(offerNum("ofPack", 150000)||0);
        casco=Math.min(pack, 80000);
      }else casco=S?(Number(S.casco)||0):(offerNum("ofCasco", 0)||0);
      const months=S?(Number(S.months)||60):(offerNum("ofMonths", 60)||60);
      const downMode=S?(S.downMode==="sum"?"sum":"pct"):offerVal("ofDownMode","pct");
      let downPct=S?(Number(S.downPct)||0):offerNum("ofDownPct", 20);
      let down=S?(Number(S.down)||0):offerNum("ofDown", Math.round(price*0.2));
      const tiAmt=useTi?(m.ti||0):0;
      const crAmt=useCr?(m.cr||0):0;
      const discs=[];
      if(tiAmt) discs.push(["Трейд-ин импортёра", tiAmt]);
      if(useCr && crAmt) discs.push([m.id==="t7p"?"Выгодный кредит":"Программа кредита", crAmt]);
      if(spec) discs.push(["Спецпредложение", spec]);
      if(dcTi) discs.push(["Скидка ДЦ за трейд-ин", dcTi]);
      if(dcCr) discs.push(["Скидка ДЦ за кредит", dcCr]);
      const discount=discs.reduce((s,x)=>s+x[1],0);
      const carPrice=Math.max(0, price-discount);
      if(downMode==="pct") down=Math.round(carPrice*Math.max(0,downPct)/100);
      else downPct=carPrice>0?Math.round(down*1000/carPrice)/10:0;
      down=Math.max(0, Math.min(carPrice, down));
      const fee=useLoan?(typeof KM_BANK_FEE==="number"?KM_BANK_FEE:30000):0;
      const extras=useLoan?(addons+pack+fee):0;
      const credit=Math.max(0, carPrice-down+extras);
      const clientPay=carPrice+addons+(useLoan?0:casco);
      const valid=offerVal("ofValid","7 дней");
      const packEq=typeof offerPack==="function"?offerPack(m.id):null;
      const rateGroup=typeof kmRateGroup==="function"?kmRateGroup(m):"t4l_t7";
      const banks=(useLoan && typeof KM_BANKS!=="undefined"?KM_BANKS:[]).map(b=>{
        const look=typeof kmBankRate==="function"?kmBankRate(b.id, rateGroup, months, downPct):{rate:19.2, term:months};
        const term=look.term||months;
        const pay=typeof calcPay==="function"?calcPay(carPrice+extras, down, term, look.rate):0;
        return {name:b.name, rate:look.rate, term, pay:Math.round(pay)};
      });
      const rivals=offerRivalsPicked(m, months, downPct, banks);
      const ownEl=document.getElementById("ofOwnCar");
      if(ownEl) offerOwnCar=String(ownEl.value||"").trim();
      const valEl=document.getElementById("ofOwnVal");
      if(valEl){
        const n=Number(String(valEl.value||"").replace(/\s+/g,""));
        offerOwnVal=Number.isFinite(n)?Math.max(0, Math.round(n)):0;
      }
      const service=offerTab==="service";
      return {m, mid, models, client, color, price, useTi, useLoan, showDealCr, useCr, spec, useDcTi, useDcCr, dcDef, dcTi, dcCr, addons, casco, pack, months, downMode, downPct, down, carPrice, clientPay, credit, fee, valid, packEq, banks, discs, discount, rivals, service, ownCar:offerOwnCar, ownVal:service?offerOwnVal:0};
    }
    function offerDash(v){ const s=String(v||"").trim(); return s||"—"; }
    function offerPhotoKey(id){
      return ({
        t4p:"t4",
        t4la:"t4l",t4lp:"t4l",
        t7a:"t7",t7p:"t7",t7a4:"t7",t7p4:"t7",
        t8a:"t8",t8p:"t8",t8p4:"t8",t8u4:"t8",
        tt9p:"t9",tt9u:"t9",
        ta8p:"a8",ta8u:"a8",
        t9p:"tiggo9",t9u:"tiggo9",
        t7l:"t7l",
        a8a:"arrizo",a8p:"arrizo",a8u:"arrizo"
      })[id]||"";
    }
    function offerPhotoUrls(id){
      const k=offerPhotoKey(id);
      if(!k) return [];
      return [1,2,3,4].map(n=>"cars/kp-"+k+"-"+n+".jpg");
    }
    function offerCmpHtml(cmp){
      const rows=cmp.rows||[];
      const body=rows.map(row=>{
        const cls=row.win==="us"?"win":row.win==="them"?"lose":"tie";
        const tag=row.win==="them"?`<em>сильнее конкурент</em>`:"";
        return `<div class="op-vs ${cls}"><div class="k">${escape(row.k)}${tag}</div><div class="us"><small>${escape(cmp.ours||"Мы")}</small><b>${escape(row.us)}</b></div><div class="them"><small>${escape(cmp.them||"Конкурент")}</small><b>${escape(row.them)}</b></div></div>`;
      }).join("");
      const only=(cmp.only||[]);
      const onlyHtml=only.length?`<div class="op-vs-only"><b>В нашем прайсе есть, у них в прайсе нет</b><ul>${only.map(t=>`<li>${escape(t)}</li>`).join("")}</ul></div>`:"";
      const pay=`<div class="op-vs-pay"><b>Кредит · ${escape(cmp.them||"")}</b><span>${cmp.rate}% · ${cmp.term} мес. · взнос ${rub(cmp.down)} ₽ (${cmp.pct}%) · тело ${rub(cmp.credit)} ₽</span><span class="big">${rub(cmp.pay)} ₽ <small style="letter-spacing:0;font-size:13px;opacity:1">/ мес.</small></span><span class="sub">Наша ставка ${cmp.ourRate}%${cmp.ourName?" · "+escape(cmp.ourName):""}${cmp.ourPay?" · наш платёж "+rub(cmp.ourPay)+" ₽":""}. У конкурента на 2,5 п.п. выше. Цена без наших скидок и допов.</span></div>`;
      return `<div class="op-vs-card"><div class="op-vs-top"><div><small>наш автомобиль</small><b>${escape(cmp.ours||"")}</b></div><div><small>конкурент</small><b>${escape(cmp.them||"")}</b></div></div>${body}${onlyHtml}<p class="op-vs-src">${escape(cmp.trim||"")} · ${escape(cmp.src||"")}</p>${pay}</div>`;
    }
    function offerPreview(doc){
      const meta=(doc.meta||[]).map(([k,v])=>`<div class="op-line"><span>${escape(k)}</span><b>${escape(offerDash(v))}</b></div>`).join("");
      const rows=(doc.rows||[]).map(([k,v])=>`<div class="op-line"><span>${escape(k)}</span><b>${escape(v)}</b></div>`).join("");
      const total=doc.total?`<div class="op-total"><span>${escape(doc.total[0])}</span><b>${escape(doc.total[1])}</b></div>`:"";
      const photos=(doc.photos||[]).slice(0,4).map(u=>`<img src="${escape(u)}" alt="">`).join("");
      const sections=(doc.sections||[]).map(sec=>{
        const cmp=sec.cmp?offerCmpHtml(sec.cmp):"";
        const deals=sec.deals?offerDealsHtml(sec.deals):"";
        const pairs=!sec.cmp && !sec.deals && (sec.pairs||[]).length?`<div class="op-specs">${(sec.pairs||[]).map(([k,v])=>`<div class="op-pair"><b>${escape(k)}</b><span>${escape(v)}</span></div>`).join("")}</div>`:"";
        const lines=!sec.cmp && !sec.deals?(sec.lines||[]).map(t=>`<p>${escape(t)}</p>`).join(""):"";
        const groups=(sec.groups||[]).length?`<div class="op-cols">${(sec.groups||[]).map(([title,items])=>`<p class="op-g">${escape(title)}</p><ul>${(items||[]).map(it=>`<li>${escape(it)}</li>`).join("")}</ul>`).join("")}</div>`:"";
        const head=(sec.cmp||sec.deals)?"":`<h3>${escape(sec.title||"")}</h3>`;
        return `<section>${head}${cmp}${deals}${pairs}${lines}${groups}</section>`;
      }).join("");
      return `<article class="op-doc"><p class="op-brand">ООО «ЭКСПЕРТ АВТО САМАРА» · TENET · +7 927 724 92 77</p>${photos?`<div class="op-photos">${photos}</div>`:""}<p class="op-kicker">${escape(doc.kicker||"")}</p><h2>${escape(doc.title||"Коммерческое предложение")}</h2><p class="op-head">${escape(doc.headline||"")}</p>${meta}${rows}${total}${sections}<p class="op-foot">${escape(doc.note||"")}</p></article>`;
    }
    function offerPlain(doc){
      const lines=[doc.title||"Коммерческое предложение","ООО «ЭКСПЕРТ АВТО САМАРА» · TENET",""];
      if(doc.headline) lines.push(doc.headline,"");
      (doc.meta||[]).forEach(([k,v])=>lines.push(k+": "+offerDash(v)));
      lines.push("");
      (doc.rows||[]).forEach(([k,v])=>lines.push(k+": "+v));
      if(doc.total) lines.push(doc.total[0]+": "+doc.total[1]);
      (doc.sections||[]).forEach(sec=>{
        lines.push("",sec.title||"");
        if(sec.cmp){
          const c=sec.cmp;
          lines.push((c.ours||"Мы")+" против "+(c.them||""));
          (c.rows||[]).forEach(row=>{
            const mark=row.win==="us"?" — мы сильнее":row.win==="them"?" — сильнее конкурент":"";
            lines.push(row.k+mark);
            lines.push("  мы: "+row.us);
            lines.push("  они: "+row.them);
          });
          if((c.only||[]).length){
            lines.push("В нашем прайсе есть, у них в прайсе нет:");
            c.only.forEach(t=>lines.push("• "+t));
          }
          lines.push("Кредит "+(c.them||"")+": "+c.rate+"% · "+c.term+" мес. · платёж "+rub(c.pay)+" ₽");
          lines.push("Наша ставка "+c.ourRate+"%"+(c.ourPay?" · наш платёж "+rub(c.ourPay)+" ₽":"")+" · у них на 2,5 п.п. выше.");
          return;
        }
        if(sec.deals){
          ["credit","fleet","spec"].forEach(function(key){
            const card=sec.deals[key];
            if(!card) return;
            lines.push(card.title||"");
            if(card.pay) lines.push(card.pay);
            (card.lines||[]).forEach(t=>lines.push(t));
            (card.pays||[]).forEach(t=>lines.push(t));
          });
          return;
        }
        (sec.pairs||[]).forEach(([k,v])=>lines.push(k+": "+v));
        (sec.lines||[]).forEach(t=>lines.push(t));
        (sec.groups||[]).forEach(([t,items])=>{ lines.push(t); (items||[]).forEach(it=>lines.push("• "+it)); });
      });
      lines.push("",doc.note||"");
      return lines.join("\n");
    }
    function offerActions(){
      return `<div class="who-line" style="margin-top:12px"><button type="button" class="btn ivory" data-offer-pdf>Скачать PDF</button><button type="button" class="btn ghost" data-offer-copy="ofPlain">Текст в мессенджер</button></div>`;
    }
    function offerScreen(title, formHtml, doc){
      offerDocCurrent=doc;
      return banner(title,"Коммерческое предложение","КП")+`
        ${offerCss()}
        ${offerNav()}
        <div class="km-layout">
          <div class="card">${formHtml}</div>
          <div class="card">
            <p class="eyebrow">Бланк PDF</p>
            ${offerPreview(doc)}
            ${offerActions()}
            <pre id="ofPlain" class="offer-plain">${escape(offerPlain(doc))}</pre>
          </div>
        </div>`;
    }
    function offerCarsWord(n){
      n=Math.abs(n|0);
      const n10=n%10, n100=n%100;
      if(n10===1 && n100!==11) return "машина";
      if(n10>=2 && n10<=4 && (n100<12 || n100>14)) return "машины";
      return "машин";
    }
    function offerInStock(m){
      const list=typeof kmStockCars==="function"?kmStockCars(m):[];
      return (list||[]).filter(c=>c && c.status==="in");
    }
    function offerCreditCard(d){
      const banks=d.banks||[];
      let best=null;
      banks.forEach(b=>{ if(!best || (Number(b.pay)||0)<(Number(best.pay)||0)) best=b; });
      return {
        title:"Кредит",
        pay:best?rub(best.pay)+" ₽ / мес.":"",
        lines:[
          "Первый взнос "+rub(d.down)+" ₽ ("+d.downPct+"%)",
          "Срок "+d.months+" мес.",
          "Тело кредита "+rub(d.credit)+" ₽"
        ],
        pays:banks.map(b=>b.name+": "+b.rate+"% · "+b.term+" мес. · "+rub(b.pay)+" ₽ / мес.")
      };
    }
    function offerFleetCard(d, f, n){
      const base=Math.max(0, Math.round(f.tidy||f.rrc||0));
      const sub=Math.max(0, Math.round(f.sub||0));
      const ti=typeof FLEET_TI==="number"?FLEET_TI:100000;
      const months=Math.max(1, Math.round(Number(d.months)||60));
      const down=Math.max(0, Math.round(Number(d.down)||0));
      const have=(d.service && d.ownVal)?Math.max(0, Math.round(d.ownVal)):down;
      const q=typeof fleetSubQuote==="function"?fleetSubQuote(base, sub, have, f.do||70000, f.casco||80000, months, true):null;
      const gov=Math.max(0, base-sub-ti);
      const lines=[
        "Цена по госпрограмме с учётом субсидии и трейд-ин "+rub(gov)+" ₽",
        "Ставка 19,2%, Совкомбанк",
        "ПВ и субсидия не больше 49%"+(q?" · взнос до "+rub(q.maxPv)+" ₽":"")
      ];
      if(have) lines.push("Досрочно "+rub(have)+" ₽ — короче срок, платёж тот же");
      lines.push("Д/О "+rub(f.do||70000)+" и каско "+rub(f.casco||80000));
      let pay="";
      if(q && q.pay){
        pay=rub(Math.round(q.pay))+" ₽ / мес.";
        if(q.termAfter && q.termAfter!==q.term) lines.push("Срок с досрочным "+q.term+" → "+q.termAfter+" мес.");
      }
      return {title:"Госпрограмма", lines, pay};
    }
    function offerSpecCard(d, pg, n){
      const cash=Math.round(pg.cash||0);
      const ti=Math.round(pg.ti||0);
      const fix=d.useTi?ti:cash;
      const months=Math.max(1, Math.round(Number(d.months)||60));
      const down=Math.max(0, Math.min(fix, Math.round(Number(d.down)||0)));
      const bundle=typeof PANGO_BUNDLE==="number"?PANGO_BUNDLE:150000;
      const base=Math.max(0, fix-down)+bundle;
      const nss=Math.round(base*0.0089*(months/12));
      const payA=typeof calcPay==="function"?Math.round(calcPay(base+down, down, months, 17.4)):0;
      const payB=typeof calcPay==="function"?Math.round(calcPay(base+nss+down, down, months, 14.4)):0;
      return {
        title:"Спеццена",
        pay:payA?rub(payA)+" ₽ / мес.":"",
        lines:[
          "Без трейд-ина "+rub(cash)+" ₽",
          "С трейд-ином "+rub(ti)+" ₽",
          "Каско, GAP и ДМС "+rub(bundle)+" всегда в кредите",
          "17,4% без комиссий"+(payA?" · "+rub(payA)+" ₽":""),
          "14,4% · комиссия в теле"+(payB?" · "+rub(payB)+" ₽ · тело "+rub(base+nss)+" ₽":"")
        ]
      };
    }
    function offerDeals(d){
      const cars=offerInStock(d.m);
      const f=(typeof FLEET_BFS!=="undefined" && d.m && FLEET_BFS[d.m.id])?FLEET_BFS[d.m.id]:null;
      const sub=f?Math.max(0, Math.round(f.sub||0)):0;
      const fleetCars=cars.filter(c=>{
        if(c.invoice || c.demo) return false;
        if(typeof carIsMpt==="function" && carIsMpt(c)) return false;
        if(typeof carIsCorp==="function" && carIsCorp(c)) return false;
        return true;
      });
      const pg=typeof pangoOf==="function"?pangoOf(d.m.id):null;
      const specCars=pg?cars.filter(c=>!!c.invoice):[];
      const credit=d.useLoan?offerCreditCard(d):null;
      const fleet=(fleetCars.length && f && sub)?offerFleetCard(d, f, fleetCars.length):null;
      const spec=specCars.length?offerSpecCard(d, pg, specCars.length):null;
      if(!credit && !fleet && !spec) return null;
      return {credit, fleet, spec};
    }
    function offerDealCard(card, cls){
      if(!card) return "";
      const lines=(card.lines||[]).map(t=>`<p>${escape(t)}</p>`).join("");
      const pays=(card.pays||[]).map(t=>`<p class="pay">${escape(t)}</p>`).join("");
      const big=card.pay?`<p class="big">${escape(card.pay)}</p>`:"";
      return `<div class="op-deal ${cls}"><h3>${escape(card.title||"")}</h3>${big}${lines}${pays}</div>`;
    }
    function offerDealsHtml(deals){
      const side=[offerDealCard(deals.fleet,"fleet"), offerDealCard(deals.spec,"spec")].filter(Boolean).join("");
      const credit=offerDealCard(deals.credit,"credit");
      if(credit && side) return `<div class="op-deals">${credit}<div class="op-side">${side}</div></div>`;
      if(credit) return `<div class="op-deals solo">${credit}</div>`;
      return `<div class="op-deals solo">${side}</div>`;
    }
    function offerDocNew(d){
      const rows=[["РРЦ", rub(d.price)+" ₽"]];
      if(d.discount) rows.push(["Скидка", "− "+rub(d.discount)+" ₽"]);
      rows.push(["Автомобиль", rub(d.carPrice)+" ₽"]);
      if(d.addons) rows.push(["Дополнительное оборудование", rub(d.addons)+" ₽"]);
      if(d.useLoan) rows.push(["Каско расширенное", rub(d.pack)+" ₽"]);
      else if(d.casco) rows.push(["КАСКО", rub(d.casco)+" ₽"]);
      const due=Math.max(0, d.clientPay-(d.service&&d.ownVal?d.ownVal:0));
      if(d.service && d.ownVal){
        rows.push(["Итого за новый", rub(d.clientPay)+" ₽"]);
        rows.push(["Оценка вашего а/м", "− "+rub(d.ownVal)+" ₽"]);
      }
      const sections=[];
      const deals=offerDeals(d);
      if(deals) sections.push({deals:deals});
      if(d.packEq && d.packEq.specs) sections.push({title:"Характеристики", pairs:d.packEq.specs});
      if(d.packEq && d.packEq.groups) sections.push({title:"Оснащение", groups:d.packEq.groups});
      (d.rivals||[]).forEach(r=>{
        sections.push({
          title:"Сравнение с "+r.name,
          cmp:{
            ours:r.ours, them:r.name, trim:r.trim+" · "+rub(r.price)+" ₽", src:r.src, rows:r.board, only:r.only||[],
            rate:r.rate, term:r.term, down:r.down, pct:r.pct, credit:r.credit, pay:r.pay,
            ourRate:r.ourRate, ourName:r.ourName, ourPay:r.ourPay
          }
        });
      });
      const src=(d.packEq&&d.packEq.src)||"официальный прайс";
      if(d.service){
        const who=String(d.ownCar||"").trim();
        sections.unshift({title:"Предложение", lines:["Предлагаем заменить ваш автомобиль"+(who?" («"+who+"»)":"")+" на новый."]});
      }
      const meta=[["Клиент", d.client]];
      if(d.service && String(d.ownCar||"").trim()) meta.push(["Сейчас у вас", String(d.ownCar).trim()]);
      meta.push(["Цвет", d.color],["Менеджер", offerMgr()]);
      return {
        kicker:d.service?"Замена автомобиля":"Новый автомобиль",
        title:"Коммерческое предложение",
        headline:d.m.name,
        file:(d.service?"Замена ":"КП ")+d.m.name+" "+d.client,
        meta:meta,
        rows:rows,
        total:(d.service&&d.ownVal)?["К доплате", rub(due)+" ₽"]:["Итого клиенту", rub(d.clientPay)+" ₽"],
        sections:sections,
        photos:offerPhotoUrls(d.m.id),
        note:"Оснащение — все отмеченные позиции. Источник: "+src+". Не оферта. Итоговые условия — в договоре салона. Действует "+d.valid+"."
      };
    }
    function offerField(label, inner){
      return `<label class="field" style="max-width:none"><span>${label}</span>${inner}</label>`;
    }
    function offerCss(){
      return `<style>
.of-select{appearance:none;-webkit-appearance:none;width:100%;background:#fff url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><path fill='%238a6840' d='M3.2 5.6 8 10.4 12.8 5.6'/></svg>") no-repeat right 14px center;border:1px solid #e4d3b8;border-radius:14px;padding:13px 42px 13px 14px;font:600 15px/1.35 Inter,Arial,sans-serif;color:#161618;box-shadow:0 1px 0 #fff inset,0 8px 18px rgba(90,60,20,.05);}
.of-select:focus{outline:none;border-color:#c81e2b;box-shadow:0 0 0 3px rgba(200,30,43,.14);}
.of-select optgroup{font:700 13px Inter,Arial,sans-serif;color:#8a6840;}
.of-rivals{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0 4px;}
.of-rival{position:relative;display:flex;flex-direction:column;gap:2px;border:1px solid #eadfcf;border-radius:14px;padding:10px 12px 10px 36px;background:#fff;cursor:pointer;}
.of-rival input{position:absolute;left:12px;top:13px;width:18px;height:18px;margin:0;padding:0;border:0;border-radius:4px;background:transparent;box-shadow:none;accent-color:#c81e2b;}
.of-rival.on{border-color:#c81e2b;background:#fff7f6;box-shadow:0 0 0 1px #c81e2b;}
.of-rival b{font-size:14px;line-height:1.25;}
.of-rival small{color:#7a7166;font-size:12px;line-height:1.3;}
@media(max-width:720px){.of-rivals{grid-template-columns:1fr;}}
.op-vs-card{margin:6px 0 4px;border:1px solid #eadfcf;border-radius:18px;background:#fffdf9;overflow:hidden;}
.op-vs-top{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 14px 4px;}
.op-vs-top small{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#8a6840;font-weight:700;}
.op-vs-top b{font-size:18px;line-height:1.25;color:#161618;}
.op-vs{display:flex;flex-direction:column;gap:4px;padding:0 12px 8px;}
.op-vs .k{margin:8px 2px 0;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#5c5146;}
.op-vs .k em{margin-left:8px;font-style:normal;font-weight:700;letter-spacing:0;text-transform:none;color:#8a6840;background:#f3eadb;border-radius:999px;padding:2px 8px;font-size:11px;}
.op-vs .us,.op-vs .them{border-radius:12px;padding:8px 12px 10px;font-size:15px;line-height:1.35;}
.op-vs .us b,.op-vs .them b{font-weight:600;}
.op-vs small{display:block;font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;margin-bottom:2px;opacity:.72;}
.op-vs.win .us{background:#e3f6ea;color:#135c34;}
.op-vs.win .us b{font-weight:800;}
.op-vs.win .them{background:#fde8ea;color:#8f1d2a;}
.op-vs.lose .us,.op-vs.lose .them,.op-vs.tie .us,.op-vs.tie .them{background:#f6f3ec;color:#3d3832;}
.op-vs-src{margin:0;padding:2px 14px 8px;color:#8a8074;font-size:12px;line-height:1.4;}
.op-vs-pay{margin:0 12px 12px;background:#f8f1e4;border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:2px;}
.op-vs-pay b{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8a6840;}
.op-vs-pay .big{font-size:22px;font-weight:800;color:#161618;line-height:1.2;}
.op-vs-pay span{font-size:13px;line-height:1.4;color:#3d3832;}
.op-vs-pay .sub{color:#7a7166;font-size:12px;}
.op-vs-only{margin:0 12px 12px;background:#e3f6ea;border-radius:14px;padding:12px 14px;}
.op-vs-only b{display:block;color:#135c34;font-size:13px;margin:0 0 6px;}
.op-vs-only ul{margin:0;padding:0 0 0 16px;}
.op-vs-only li{color:#135c34;font-size:13.5px;line-height:1.4;margin:0 0 3px;}
.op-deals{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:10px;align-items:start;margin:8px 0 4px;}
.op-deals.solo{grid-template-columns:1fr;}
.op-side{display:flex;flex-direction:column;gap:10px;}
.op-deal{border:1.5px solid #e4d3b8;border-radius:16px;padding:12px 14px 10px;background:#fff;}
.op-deal.credit{border-color:#c81e2b;background:#fffdf8;}
.op-deal.fleet{border-color:#7dba96;background:#f3faf6;}
.op-deal.spec{border-color:#c4a574;background:#f8f4ec;}
.op-deal h3{margin:0 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8a6840;}
.op-deal p{margin:0 0 3px;font-size:13.5px;line-height:1.35;color:#3d3832;}
.op-deal .big{margin:0 0 8px;font-size:22px;font-weight:800;color:#161618;line-height:1.15;}
.op-deal .pay{font-weight:700;color:#161618;}
@media(max-width:720px){.op-vs-top,.op-deals{grid-template-columns:1fr;}}
</style>`;
    }
    function offerModelSelect(id, models, current){
      const map={}, order=[];
      (models||[]).forEach(x=>{
        const g=x.brand||"Модели";
        if(!map[g]){ map[g]=[]; order.push(g); }
        map[g].push(x);
      });
      const groups=order.map(g=>`<optgroup label="${escape(g)}">${map[g].map(x=>`<option value="${escape(x.id)}"${x.id===current?" selected":""}>${escape(x.name)}${x.rrc?" · "+rub(x.rrc):""}</option>`).join("")}</optgroup>`).join("");
      return `<select id="${id}" class="of-select">${groups}</select>`;
    }
    const OFFER_RIVALS = {
      t4l:[
        {id:"jolion",name:"Haval Jolion",trim:"Оптимум 2WD",price:2499000,src:"haval.ru, Оптимум 2WD, каталог с 17.08.2026",board:[
          {k:"Клиренс",us:"203 мм",them:"190 мм",win:"us"},
          {k:"Багажник",us:"475 л, со сложенным рядом 1500 л",them:"337 л и 1133 л со сложенным рядом",win:"us"},
          {k:"Кузов",us:"4506×1828×1701 мм — выше посадка",them:"4472×1874×1581 мм",win:"us"},
          {k:"База",us:"2650 мм",them:"2700 мм — база длиннее",win:"them"},
          {k:"Привод",us:"робот DCT6 уже на входе линейки",them:"Комфорт — только механика и передний привод. 4WD появляется с Оптимум, 150 л.с.",win:"us"},
          {k:"Топливо",us:"официально АИ-92, два экрана и CarPlay уже в Актив",them:"входная версия скромнее по оснащению",win:"us"}
        ]},
        {id:"x50",name:"Belgee X50+",trim:"Стиль",price:2505990,src:"прайс импортёра, Стиль",board:[
          {k:"Багажник",us:"475–1500 л",them:"330 л — самый маленький багажник в этом классе",win:"us"},
          {k:"Клиренс",us:"203 мм",them:"182 мм",win:"us"},
          {k:"Габариты",us:"4506×1828×1701 мм",them:"4380×1810×1615 мм, база 2600",win:"us"},
          {k:"Мотор",us:"1.5T 147 л.с. и 210 Н·м",them:"1.5T 147 л.с. и 270 Н·м, 0–100 за 8,1 с — бодрее на разгоне",win:"them"},
          {k:"Привод",us:"передний",them:"только передний, полного привода нет",win:"tie"},
          {k:"Топливо",us:"официально АИ-92",them:"обычно АИ-95",win:"us"}
        ]},
        {id:"j6",name:"Jaecoo J6",trim:"Актив",price:2290000,src:"прайс импортёра, Актив",board:[
          {k:"Клиренс",us:"203 мм",them:"176 мм",win:"us"},
          {k:"Багажник",us:"475 л и 1500 л со сложенным рядом",them:"480 л и 1180 л — в пяти местах почти так же, сложенный ряд меньше",win:"us"},
          {k:"Габариты",us:"4506×1828×1701, база 2650",them:"4509×1860×1650, база 2610",win:"tie"},
          {k:"Привод",us:"передний",them:"вся линейка только 2WD",win:"tie"},
          {k:"Мотор",us:"1.5T 147 л.с. / 210 Н·м / DCT6, АИ-92",them:"тот же класс: 1.5T 147 / 210 / DCT6, АИ-92",win:"tie"}
        ]}
      ],
      t7:[
        {id:"cityray",name:"Geely Cityray",trim:"Comfort",price:2699990,src:"прайс Geely, Comfort",board:[
          {k:"Привод",us:"в линейке есть полный привод",them:"в РФ вся линейка только передний привод",win:"us"},
          {k:"Клиренс",us:"197 мм",them:"185 мм",win:"us"},
          {k:"Посадка",us:"4553×1862×1696 мм — длиннее и выше",them:"4510×1865×1650 мм, база 2701",win:"us"},
          {k:"Багажник",us:"475 л и до 1500 л со сложенным рядом",them:"571 л в пяти местах — больше каждый день, сложенный ряд 1271 л",win:"them"},
          {k:"Мотор",us:"1.6T 150 л.с. и 275 Н·м",them:"1.5T 147 л.с. и 270 Н·м, 0–100 за 8,9 с",win:"us"},
          {k:"Разгон",us:"паспорт T7 спокойнее, около 9,7–9,8 с",them:"8,9 с — быстрее до сотни",win:"them"}
        ]},
        {id:"h3",name:"Haval H3",trim:"Оптимум 2WD",price:2749000,price4:3099000,trim4:"Оптимум 4WD",src:"haval.ru: от 2 549 000 с лояльным трейд-ином 200 000, здесь РРЦ без него",board:[
          {k:"Мотор",us:"1.6T 150 л.с. и 275 Н·м",them:"1.5T 143 л.с. и 210 Н·м на переднем приводе",win:"us"},
          {k:"Багажник",us:"475 л и до 1500 л",them:"493–1298 л",win:"us"},
          {k:"Кузов",us:"несущий кроссовер, не рамник",them:"тоже несущий, рамы нет. 4520×1875×1745, база 2710",win:"tie"},
          {k:"Клиренс",us:"197 мм",them:"196 мм",win:"tie"}
        ],board4:[
          {k:"Мотор",us:"1.6T 150 л.с. и 275 Н·м, полный привод",them:"1.5T 177 л.с. и 270 Н·м, полный привод — по силам выше",win:"them"},
          {k:"Багажник",us:"475 л и до 1500 л",them:"493–1298 л",win:"us"},
          {k:"Кузов",us:"несущий кроссовер",them:"несущий, рамы нет",win:"tie"},
          {k:"Клиренс",us:"197 мм",them:"196 мм",win:"tie"}
        ]},
        {id:"dashing",name:"Jetour Dashing",trim:"от",price:2239900,src:"jetour-ru.com, от 2 239 900 с учётом всех выгод, Люкс 2025",board:[
          {k:"Привод",us:"в линейке T7 есть полный привод",them:"на официальном сайте полный привод не заявлен",win:"us"},
          {k:"Мотор",us:"1.6T 150 л.с. и 275 Н·м, DCT7",them:"1.5T 147 л.с. и 6DCT, выше по линейке 1.6 на 186 л.с. и 8AT",win:"tie"},
          {k:"Класс",us:"кроссовер с клиренсом 197 мм",them:"городской кроссовер, не рамный внедорожник",win:"us"},
          {k:"Цена на сайте",us:"в КП наш РРЦ, без спрятанной выгоды",them:"2 239 900 ₽ — это Люкс 2025 уже со всеми выгодами, до 600 000 ₽",win:"them"}
        ]}
      ],
      t8:[
        {id:"f7",name:"Haval F7",trim:"Оптимум 1.5 2WD",price:2899000,price4:3399000,trim4:"Оптимум 2.0 4WD",src:"haval.ru от 2 899 000 Оптимум 1.5 2WD; Оптимум 4WD 3 399 000",board:[
          {k:"Клиренс",us:"213 мм у пятиместной версии",them:"183–191 мм",win:"us"},
          {k:"Багажник",us:"889 л и до 1930 л",them:"376 л и 1328 л",win:"us"},
          {k:"Мотор",us:"1.6T 186 л.с.",them:"1.5T на входе, Оптимум 2WD",win:"us"},
          {k:"Габариты",us:"4725×1860×1705, база 2710",them:"4780×1890, база 2800 — кузов длиннее",win:"them"}
        ],board4:[
          {k:"Клиренс",us:"у пяти мест 213 мм. Семиместная версия ниже по багажнику за счёт третьего ряда",them:"183–191 мм, третьего ряда нет",win:"us"},
          {k:"Багажник",us:"у 5 мест 889–1930 л",them:"376 / 1328 л",win:"us"},
          {k:"Мотор",us:"2.0T 197 л.с. и 375 Н·м, DCT7, полный привод",them:"2.0T и 7DCT, Оптимум 4WD 3 399 000 ₽",win:"tie"},
          {k:"Габариты",us:"4725×1860×1705, база 2710",them:"4780×1890, база 2800",win:"them"}
        ]},
        {id:"h7",name:"Haval H7",trim:"Премиум 4WD",price:3799000,src:"haval.ru, Премиум от 3 799 000 уже с лояльным трейд-ином 200 000",board:[
          {k:"Багажник",us:"у 5 мест 889–1930 л",them:"483 л и 1362 л",win:"us"},
          {k:"Клиренс",us:"213 мм у пяти мест",them:"200 мм",win:"us"},
          {k:"Места",us:"5 мест, на полном приводе есть 5+2",them:"только 5 мест и только полный привод",win:"us"},
          {k:"Мотор",us:"2.0T 197 л.с. и 375 Н·м",them:"2.0T 231 л.с. и 380 Н·м — по мощности выше",win:"them"}
        ]},
        {id:"atlas",name:"Geely Atlas",trim:"Люкс 2WD",price:3259990,src:"прайс Geely, Люкс 2WD",board:[
          {k:"Мотор",us:"1.6T 186 л.с.",them:"1.5T 147 л.с. и 270 Н·м, 7DCT",win:"us"},
          {k:"Багажник",us:"889–1930 л у пяти мест",them:"650 л и 1610 л",win:"us"},
          {k:"Клиренс",us:"213 мм",them:"215 мм",win:"them"},
          {k:"Габариты",us:"4725×1860×1705, база 2710",them:"4670×1900×1705, база 2777",win:"tie"}
        ],board4:[
          {k:"Мотор",us:"2.0T 197 л.с. и 375 Н·м, DCT7",them:"2.0T 200 л.с. и 325 Н·м, 8AT, топливо АИ-95",win:"us"},
          {k:"Багажник",us:"пятиместная версия 889–1930 л. У 7 мест объём меньше из‑за третьего ряда",them:"650 / 1610 л, только 5 мест",win:"us"},
          {k:"Клиренс",us:"213 мм у 5 мест",them:"215 мм",win:"them"},
          {k:"Габариты",us:"4725×1860×1705, база 2710",them:"4670×1900×1705, база 2777",win:"tie"}
        ]},
        {id:"x70",name:"Jetour X70+",trim:"от",price:2839000,src:"jetour-ru.com, от 2 839 000 с учётом выгод",board:[
          {k:"Мотор",us:"1.6T 186 л.с. на пяти местах 2WD, на 4WD — 2.0T 197 л.с.",them:"1.6T 190 л.с. и 275 Н·м, 7DCT",win:"tie"},
          {k:"Семья",us:"на полном приводе есть третий ряд",them:"семейный кроссовер, Комфорт и Престиж",win:"us"},
          {k:"Цена на сайте",us:"в КП наш РРЦ",them:"от 2 839 000 ₽ уже с выгодами на сайте",win:"them"}
        ]}
      ],
      t9:[
        {id:"monjaro",name:"Geely Monjaro",trim:"Люкс",price:4349990,priceHi:4749990,trimHi:"Флагман",src:"прайс Geely: Люкс 4 349 990, Флагман 4 749 990",board:[
          {k:"Места",us:"7 мест, третий ряд уже в машине",them:"только 5 мест, третьего ряда нет",win:"us"},
          {k:"Мотор",us:"2.0T около 249 л.с. и 375 Н·м, классический автомат 8AT",them:"2.0T 238 л.с. и 350 Н·м, автомат 8AT",win:"us"},
          {k:"Топливо",us:"АИ-92",them:"не ниже АИ-95",win:"us"},
          {k:"Кузов",us:"4810×1925×1741 мм — выше и шире",them:"4770×1895×1689 мм",win:"us"},
          {k:"Салон",us:"14 динамиков, натуральная кожа и шпон",them:"10 динамиков, экокожа и алькантара",win:"us"},
          {k:"Багажник",us:"в семи местах около 200 л, максимум до 2150 л",them:"каждый день просторнее: 562 л, максимум 1532 л",win:"them"},
          {k:"Разгон",us:"около 8,0 с, максимум 220 км/ч",them:"7,7 с и 215 км/ч — чуть быстрее до сотни",win:"them"},
          {k:"Клиренс",us:"200 мм",them:"210 мм",win:"them"},
          {k:"Экраны",us:"щиток 10,3″, медиа 15,6″ и проекция",them:"щиток 12,3″ и широкая медиа 24,6″",win:"them"}
        ],board5:[
          {k:"Мотор",us:"2.0T 245 л.с. и 375 Н·м",them:"2.0T 238 л.с. и 350 Н·м",win:"us"},
          {k:"Привод",us:"классический автомат 8AT, полный привод и 7 режимов",them:"8AT и полный привод",win:"us"},
          {k:"Топливо",us:"АИ-92",them:"не ниже АИ-95",win:"us"},
          {k:"Кузов",us:"4810×1925×1741 мм — выше и шире",them:"4770×1895×1689 мм",win:"us"},
          {k:"Клиренс",us:"200 мм",them:"210 мм",win:"them"},
          {k:"Багажник",us:"со сложенными сиденьями до 2065 л",them:"562 л в пяти местах и максимум 1532 л",win:"us"},
          {k:"Салон",us:"14 динамиков с сабвуфером, шпон. В Ультра — натуральная кожа и проекция",them:"10 динамиков, экокожа и алькантара",win:"us"},
          {k:"Места",us:"сейчас в продаже 5 мест. Семь мест — это Tiggo 9, не эта машина",them:"5 мест",win:"tie"},
          {k:"Разгон",us:"9,3 с до 100 км/ч у пятиместной версии",them:"7,7 с — заметно быстрее",win:"them"},
          {k:"Экраны",us:"щиток 10,3″ и медиа 15,6″",them:"щиток 12,3″ и медиа 24,6″ — экран крупнее",win:"them"}
        ],
        only:[
          "7 мест и третий ряд — в прайсе Monjaro только 5 мест",
          "14 динамиков — в прайсе Monjaro 10",
          "Натуральная кожа и деревянный шпон — у Monjaro экокожа и алькантара",
          "Проекция на лобовое стекло",
          "7 режимов полного привода во всех комплектациях",
          "АИ-92 — у Monjaro не ниже АИ-95"
        ],
        only5:[
          "14 динамиков с сабвуфером — в прайсе Monjaro 10",
          "7 режимов движения",
          "Деревянный шпон в салоне",
          "АИ-92 — у Monjaro не ниже АИ-95",
          "В Ультра — натуральная кожа и проекция на стекло"
        ]},
        {id:"j8",name:"Jaecoo J8",trim:"Комфорт 2026",price:4130000,src:"прайс Jaecoo, Комфорт 2026",board:[
          {k:"Места",us:"7 мест",them:"5 мест",win:"us"},
          {k:"Коробка",us:"классический автомат 8AT и полный привод",them:"робот 7DCT и полный привод",win:"us"},
          {k:"Мотор",us:"2.0T около 249 л.с. и 375 Н·м",them:"2.0T 249 л.с.",win:"tie"},
          {k:"Багажник",us:"максимум до 2150 л, в семи местах около 200 л",them:"717 л каждый день и до 2021 л",win:"them"},
          {k:"Клиренс",us:"200 мм",them:"210 мм",win:"them"},
          {k:"Кузов",us:"4810×1925×1741, база 2800",them:"4820×1930×1710, база 2820",win:"tie"}
        ],board5:[
          {k:"Мотор",us:"2.0T 245 л.с. и 375 Н·м, классический автомат 8AT",them:"2.0T 249 л.с., робот 7DCT",win:"us"},
          {k:"Привод",us:"полный, 7 режимов движения",them:"полный привод",win:"us"},
          {k:"Багажник",us:"до 2065 л со сложенным рядом",them:"717 л и до 2021 л",win:"us"},
          {k:"Клиренс",us:"200 мм",them:"210 мм",win:"them"},
          {k:"Кузов",us:"4810×1925×1741, база 2800",them:"4820×1930×1710, база 2820 — чуть крупнее",win:"them"},
          {k:"Места",us:"5 мест",them:"5 мест",win:"tie"}
        ]},
        {id:"t2",name:"Jetour T2",trim:"от",price:3699000,src:"jetour-ru.com, от 3 699 000 с учётом выгод",board:[
          {k:"Места",us:"7 мест",them:"5 мест",win:"us"},
          {k:"Класс",us:"семиместный флагман 4810 мм, 2.0 и автомат 8AT",them:"кроссовер, не семиместный флагман",win:"us"},
          {k:"Цена на сайте",us:"в КП наш РРЦ",them:"от 3 699 000 ₽ уже со всеми выгодами. На Премиум 2026 цена с выгодами выше",win:"them"}
        ],board5:[
          {k:"Мотор",us:"2.0T 245 л.с. и 375 Н·м, 8AT, полный привод, 7 режимов",them:"кроссовер со стартом цены на сайте, без раскрытого полного прайса",win:"us"},
          {k:"Багажник",us:"до 2065 л со сложенным рядом",them:"на сайте указан старт цены, не объём багажника",win:"tie"},
          {k:"Места",us:"5 мест",them:"5 мест",win:"tie"},
          {k:"Цена на сайте",us:"наш РРЦ",them:"от 3 699 000 ₽ уже с выгодами, не голый прайс",win:"them"}
        ]}
      ],
      a8:[
        {id:"preface",name:"Geely Preface",trim:"Люкс",price:3079990,priceHi:3264990,trimHi:"Флагман",src:"прайс Geely: Люкс 3 079 990, Флагман 3 264 990",board:[
          {k:"Клиренс",us:"около 144 мм",them:"135 мм",win:"us"},
          {k:"Топливо",us:"официально АИ-92",them:"не ниже АИ-95",win:"us"},
          {k:"Багажник",us:"около 535 л",them:"500 л",win:"us"},
          {k:"Разгон",us:"седан спокойнее по характеру",them:"2.0T 200 л.с. и 325 Н·м, 0–100 за 7,1 с",win:"them"},
          {k:"Кузов",us:"4757×1832×1469 мм",them:"4825×1880×1469 мм, база 2800 — длиннее",win:"them"}
        ],board5:[
          {k:"Характер",us:"седан TENET: 1.6T 150 л.с. и DCT7 в Прайм, 2.0 и автомат 8AT в Ультра",them:"2.0T 200 л.с. и 325 Н·м, 0–100 за 7,1 с — быстрее",win:"them"},
          {k:"Кузов",us:"4780×1843×1469, база 2790, багажник 500 л",them:"4825×1880×1469, база 2800, багажник 500 л, клиренс 135 мм",win:"tie"}
        ]},
        {id:"univ",name:"Changan UNI-V",trim:"Спорт",price:3499900,src:"прайс Changan, Спорт",board:[
          {k:"Комфорт",us:"климат и зимний пакет богаче",them:"однозонный климат, зимний пакет короче",win:"us"},
          {k:"Кузов",us:"классический седан",them:"лифтбек 4740×1838×1430, база 2750",win:"tie"},
          {k:"Клиренс",us:"около 144 мм",them:"152 мм",win:"them"},
          {k:"Багажник",us:"седан около 535 л",them:"465 л и до 1110 л — лифтбек практичнее в максимуме",win:"them"},
          {k:"Мотор",us:"не спортивная версия",them:"2.0T 235 л.с. и 390 Н·м",win:"them"}
        ]}
      ]
    };
    function offerRivalKey(m){
      const s=(m&&m.stock)||"";
      return {t4:"t4l",t4l:"t4l",pl4:"t4l",t7:"t7",t7l:"t7",pl6:"t7",t8:"t8",t9:"t9",tt9:"t9",a8:"a8",ta8:"a8"}[s]||"";
    }
    function offerRivalList(m){ return OFFER_RIVALS[offerRivalKey(m)]||[]; }
    function offerRich(m){ return /ultra|ультра|4wd|2\.0/i.test((m&&m.name)||""); }
    function offerRivalPrice(r, m){
      if(offerRich(m) && r.priceHi) return {price:r.priceHi, trim:r.trimHi||r.trim};
      if(/4wd/i.test((m&&m.name)||"") && r.price4) return {price:r.price4, trim:r.trim4||r.trim};
      return {price:r.price, trim:r.trim};
    }
    function offerOurShort(m){
      const s=(m&&m.stock)||"";
      return ({t4:"T4L",t4l:"T4L",pl4:"T4L",t7:"T7",t7l:"Tiggo 7L",pl6:"T7",t8:"T8",t9:"Tiggo 9",tt9:"TENET T9",a8:"Arrizo 8",ta8:"TENET A8"})[s]||(m&&m.name)||"Мы";
    }
    function offerRivalBoard(r, m){
      const name=(m&&m.name)||"";
      const stock=(m&&m.stock)||"";
      let src;
      if((stock==="tt9"||stock==="ta8") && r.board5) src=r.board5;
      else if(/4wd/i.test(name) && r.board4) src=r.board4;
      else src=r.board||[];
      return src.map(x=>({k:x.k, us:x.us, them:x.them, win:x.win||"tie"}));
    }
    function offerOurRate(banks, m, months, downPct){
      if(banks && banks.length){
        let best=banks[0];
        banks.forEach(b=>{ if((Number(b.rate)||99)<(Number(best.rate)||99)) best=b; });
        return {rate:Number(best.rate)||0, name:best.name||"наш банк", pay:best.pay||0};
      }
      const group=typeof kmRateGroup==="function"?kmRateGroup(m):"t4l_t7";
      const look=typeof kmBankRate==="function"?kmBankRate("sovcom", group, months, downPct):{rate:19.2};
      return {rate:Number(look&&look.rate)||19.2, name:"Совкомбанк", pay:0};
    }
    function offerRivalOnly(r, m){
      const name=(m&&m.name)||"";
      const stock=(m&&m.stock)||"";
      let list;
      if((stock==="tt9"||stock==="ta8") && r.only5) list=r.only5;
      else if(/4wd/i.test(name) && r.only4) list=r.only4;
      else list=r.only||[];
      return (list||[]).slice();
    }
    function offerRivalCalc(r, m, months, downPct, banks){
      const pick=offerRivalPrice(r, m);
      const price=pick.price;
      const pct=Math.max(0, Number(downPct)||0);
      const down=Math.min(price, Math.round(price*pct/100));
      const ours=offerOurRate(banks, m, months, pct);
      const rate=Math.round((ours.rate+2.5)*10)/10;
      const term=Math.max(1, Math.round(Number(months)||60));
      const pay=typeof calcPay==="function"?Math.round(calcPay(price, down, term, rate)):0;
      const credit=Math.max(0, price-down);
      const board=offerRivalBoard(r, m).slice();
      const ourPrice=Number(m&&m.rrc)||0;
      if(ourPrice && price){
        const gap=price-ourPrice;
        board.push({k:"Цена", us:rub(ourPrice)+" ₽ — наш РРЦ", them:rub(price)+" ₽"+(gap>0?" · дороже на "+rub(gap):gap<0?" · дешевле на "+rub(-gap):" · столько же"), win:gap>0?"us":gap<0?"them":"tie"});
      }
      return {name:r.name, trim:pick.trim, price, src:r.src, board, only:offerRivalOnly(r, m), ours:offerOurShort(m), down, pct, rate, term, pay, credit, ourRate:ours.rate, ourName:ours.name, ourPay:ours.pay||0};
    }
    function offerRivalsPicked(m, months, downPct, banks){
      return offerRivalList(m).filter(r=>offerOn("ofRv_"+r.id)).map(r=>offerRivalCalc(r, m, months, downPct, banks));
    }
    function offerRivalChecks(m){
      const list=offerRivalList(m);
      if(!list.length) return `<p class="calc-note">Для этой модели нет карточек конкурентов с ценой.</p>`;
      return `<div class="of-rivals">${list.map(r=>{
        const on=offerOn("ofRv_"+r.id);
        const pick=offerRivalPrice(r, m);
        return `<label class="of-rival${on?" on":""}"><input data-offer-rival type="checkbox" id="ofRv_${r.id}" ${on?"checked":""} /><b>${escape(r.name)}</b><small>${escape(pick.trim)} · ${rub(pick.price)} ₽</small></label>`;
      }).join("")}</div>`;
    }
    function offerFormNew(d){
      const own=d.service?`
        <p class="eyebrow">Его автомобиль</p>
        ${offerField("На чём приехал", `<input id="ofOwnCar" value="${escape(d.ownCar||"")}" placeholder="марка и модель" />`)}
        ${offerField("Оценка вашего а/м, ₽", `<input id="ofOwnVal" inputmode="numeric" value="${d.ownVal||""}" placeholder="0" />`)}
        <p class="calc-note">Клиент приехал в сервис на своей машине. Оценка — зачёт его автомобиля: в бланке она уменьшает доплату. Кредит и взнос сами не пересчитываются.</p>`:"";
      return `
        ${own}
        <p class="eyebrow">Клиент</p>
        <input type="hidden" id="ofPrevModel" value="${escape(d.mid)}" />
        ${offerField("Клиент", `<input id="ofClient" value="${escape(d.client)}" placeholder="ФИО" />`)}
        ${d.client?"":`<p class="calc-note">Клиент пустой. В PDF будет прочерк, пока не впишете имя.</p>`}
        <p class="eyebrow">Автомобиль</p>
        ${offerField("Комплектация", offerModelSelect("ofModel", d.models, d.mid))}
        ${offerField("Цвет", `<input id="ofColor" value="${escape(d.color)}" placeholder="не указан" />`)}
        ${offerField("РРЦ, ₽", `<input id="ofPrice" inputmode="numeric" value="${d.price}" />`)}
        <p class="eyebrow">Конкуренты</p>
        <p class="calc-note">Галочка кладёт в PDF сравнение: зелёным, где мы сильнее, красным, где конкурент слабее. Плюс кредит на 2,5 п.п. выше нашей ставки.</p>
        ${offerRivalChecks(d.m)}
        <p class="eyebrow">Скидки</p>
        <label class="check-row"><input id="ofTi" type="checkbox" ${d.useTi?"checked":""} /> <span>Трейд-ин ${d.m.ti?rub(d.m.ti):"нет в базе"}</span></label>
        <label class="check-row"><input id="ofLoan" type="checkbox" ${d.useLoan?"checked":""} /> <span>Кредит</span></label>
        ${d.showDealCr?`<label class="check-row"><input id="ofCr" type="checkbox" ${d.useCr?"checked":""} /> <span>${d.m.id==="t7p"?"Выгодный кредит":"Программа кредита"} · ${rub(d.m.cr||0)}</span></label>`:""}
        ${offerField("Спецпредложение, ₽", `<input id="ofSpec" inputmode="numeric" value="${d.spec}" />`)}
        ${d.useTi?`<label class="check-row"><input id="ofDcTi" type="checkbox" ${d.useDcTi?"checked":""} /> <span>Скидка ДЦ за трейд-ин</span></label>`:""}
        ${d.useTi&&d.useDcTi?offerField("Скидка ДЦ за трейд-ин, ₽", `<input id="ofDcTiAmt" inputmode="numeric" value="${d.dcTi||d.dcDef}" />`):""}
        ${d.useLoan?`<label class="check-row"><input id="ofDcCr" type="checkbox" ${d.useDcCr?"checked":""} /> <span>Скидка ДЦ за кредит</span></label>`:""}
        ${d.useLoan&&d.useDcCr?offerField("Скидка ДЦ за кредит, ₽", `<input id="ofDcCrAmt" inputmode="numeric" value="${d.dcCr||d.dcDef}" />`):""}
        ${offerField("Д/О, ₽", `<input id="ofDo" inputmode="numeric" value="${d.addons}" />`)}
        ${d.useLoan?offerField("Каско расширенное, ₽", `<input id="ofPack" inputmode="numeric" value="${d.pack}" />`):offerField("КАСКО, ₽", `<input id="ofCasco" inputmode="numeric" value="${d.casco}" />`)}
        ${d.useLoan?`<p class="eyebrow">Кредит</p><div class="down-mode"><button type="button" class="chip ${d.downMode==="sum"?"on":""}" data-offer-down="sum">Сумма, ₽</button><button type="button" class="chip ${d.downMode!=="sum"?"on":""}" data-offer-down="pct">Проценты</button></div><input type="hidden" id="ofDownMode" value="${d.downMode==="sum"?"sum":"pct"}" />${d.downMode==="sum"?offerField("Первый взнос, ₽", `<input id="ofDown" inputmode="numeric" value="${d.down}" />`):offerField("Первый взнос, %", `<input id="ofDownPct" inputmode="decimal" value="${d.downPct}" />`)}${offerField("Срок, мес.", `<input id="ofMonths" inputmode="numeric" value="${d.months}" />`)}`:""}
        ${offerField("Срок действия", `<input id="ofValid" value="${escape(d.valid)}" />`)}`;
    }
    function offerFromCalc(){
      const models=typeof KM_MODELS!=="undefined"?KM_MODELS:[];
      const mid=(typeof kmId==="string" && models.some(x=>x.id===kmId))?kmId:(models[0]?models[0].id:"t7a");
      const m=models.find(x=>x.id===mid)||{};
      function num(id, def){
        const el=document.getElementById(id);
        if(!el) return def;
        const n=Number(String(el.value||"").replace(/\s+/g,""));
        return Number.isFinite(n)?n:def;
      }
      function on(id){ const el=document.getElementById(id); return !!(el && el.checked); }
      const price=num("kmRrc", m.rrc||0);
      const useTi=on("kmUseTi");
      const useLoan=on("kmUseLoan");
      const modeEl=document.getElementById("cDownMode");
      const downMode=modeEl && String(modeEl.value||"")==="sum"?"sum":"pct";
      const keep=typeof kmDownKeep==="object" && kmDownKeep?kmDownKeep:{};
      offerSeed={
        mid:mid,
        price:price,
        useTi:useTi,
        useLoan:useLoan,
        useCr:on("kmUseCr"),
        spec:num("kmSpec", 0),
        useDcTi:useTi && on("kmUseDcTi"),
        dcTi:num("kmDcTi", typeof KM_DC_DEF==="number"?KM_DC_DEF:100000),
        useDcCr:useLoan && on("kmUseDcCr"),
        dcCr:num("kmDcCr", typeof KM_DC_DEF==="number"?KM_DC_DEF:100000),
        addons:num("kmDo", 0),
        pack:num("kmPack", 150000),
        casco:num("kmCasco", 0),
        months:num("cMonths", 60),
        downMode:downMode,
        downPct:num("cDownPct", keep.pct!=null?keep.pct:20),
        down:num("cDown", keep.sum!=null?keep.sum:Math.round((price||0)*0.2))
      };
      offerTab="new";
      view="offer";
      if(typeof state!=="undefined" && state){
        state.section="offer";
        try{ save(); }catch(e){}
      }
      render();
    }
    function offerNew(){
      const d=offerDeal();
      return offerScreen("КП Новый а/м", offerFormNew(d), offerDocNew(d));
    }
    function offerWrap(ctx, text, maxW){
      const words=String(text||"").split(/\s+/).filter(Boolean);
      const lines=[];
      let cur="";
      words.forEach(w=>{
        const t=cur?cur+" "+w:w;
        if(ctx.measureText(t).width>maxW && cur){ lines.push(cur); cur=w; }
        else cur=t;
      });
      if(cur) lines.push(cur);
      if(!lines.length) lines.push("");
      const out=[];
      lines.forEach(line=>{
        if(ctx.measureText(line).width<=maxW){ out.push(line); return; }
        let buf="";
        for(const ch of line){
          const t=buf+ch;
          if(ctx.measureText(t).width>maxW && buf){ out.push(buf); buf=ch; }
          else buf=t;
        }
        if(buf) out.push(buf);
      });
      return out;
    }
    function offerCover(ctx, img, x, y, w, h){
      const rad=12;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x+rad, y);
      ctx.arcTo(x+w, y, x+w, y+h, rad);
      ctx.arcTo(x+w, y+h, x, y+h, rad);
      ctx.arcTo(x, y+h, x, y, rad);
      ctx.arcTo(x, y, x+w, y, rad);
      ctx.closePath();
      ctx.clip();
      const ir=img.width/Math.max(1,img.height), r=w/h;
      let sx=0, sy=0, sw=img.width, sh=img.height;
      if(ir>r){ sw=img.height*r; sx=(img.width-sw)/2; }
      else { sh=img.width/r; sy=(img.height-sh)/2; }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
      ctx.restore();
    }
    function offerPaint(doc, imgs){
      const W=1240, H=1754, pad=56;
      const pages=[];
      let c, ctx, y;
      function font(w, size){ ctx.font=w+" "+size+"px Inter, Arial, sans-serif"; }
      function offerPaintCmp(cmp){
        function box(x,yy,w,h,fill){
          const r=12;
          ctx.beginPath();
          ctx.moveTo(x+r,yy);
          ctx.arcTo(x+w,yy,x+w,yy+h,r);
          ctx.arcTo(x+w,yy+h,x,yy+h,r);
          ctx.arcTo(x,yy+h,x,yy,r);
          ctx.arcTo(x,yy,x+w,yy,r);
          ctx.closePath();
          ctx.fillStyle=fill;
          ctx.fill();
        }
        need(36);
        y+=8;
        font("800", 20);
        ctx.fillStyle="#161618";
        ctx.fillText("Сравнение", pad, y);
        y+=22;
        const wide=W-pad*2;
        function sideBar(label, lines, fill, color, bold){
          const lh=21;
          const h=14+16+lines.length*lh+8;
          need(h+4);
          box(pad, y, wide, h, fill);
          font("800", 10);
          ctx.fillStyle=color;
          ctx.fillText(label, pad+14, y+16);
          font(bold?"800":"600", 16);
          lines.forEach((ln,i)=>{
            ctx.fillStyle=color;
            ctx.fillText(ln, pad+14, y+16+18+i*lh);
          });
          y+=h+5;
        }
        (cmp.rows||[]).forEach(row=>{
          const win=row.win==="us";
          const tag=row.win==="them"?"    ·  сильнее конкурент":"";
          need(16);
          font("800", 12);
          ctx.fillStyle="#8a6840";
          ctx.fillText(String(row.k||"").toUpperCase()+tag, pad, y);
          y+=8;
          font(win?"800":"600", 16);
          const L=offerWrap(ctx, row.us||"", wide-28);
          font("600", 16);
          const R=offerWrap(ctx, row.them||"", wide-28);
          const usFill=win?"#e3f6ea":"#f6f3ec";
          const themFill=win?"#fde8ea":"#f6f3ec";
          sideBar(String(cmp.ours||"МЫ").toUpperCase(), L.length?L:[""], usFill, win?"#135c34":"#3d3832", win);
          sideBar(String(cmp.them||"КОНКУРЕНТ").toUpperCase(), R.length?R:[""], themFill, win?"#8f1d2a":"#3d3832", false);
          y+=4;
        });
        const only=cmp.only||[];
        if(only.length){
          font("600", 14);
          const items=[];
          only.forEach(t=>{
            offerWrap(ctx, "•  "+t, W-pad*2-36).forEach(ln=>items.push(ln));
          });
          const oh=28+items.length*20+14;
          need(oh+8);
          box(pad, y, W-pad*2, oh, "#e3f6ea");
          font("800", 13);
          ctx.fillStyle="#135c34";
          ctx.fillText("В нашем прайсе есть, у них в прайсе нет", pad+16, y+22);
          items.forEach((ln,i)=>{
            font("600", 14);
            ctx.fillStyle="#135c34";
            ctx.fillText(ln, pad+16, y+46+i*20);
          });
          y+=oh+12;
        }
        font("700", 13);
        const p1=offerWrap(ctx, "Кредит "+(cmp.them||"")+" · "+cmp.rate+"% · "+cmp.term+" мес. · взнос "+rub(cmp.down)+" ₽ ("+cmp.pct+"%) · тело "+rub(cmp.credit)+" ₽", W-pad*2-28);
        font("500", 13);
        const p3=offerWrap(ctx, "Наша ставка "+cmp.ourRate+"%"+(cmp.ourName?" · "+cmp.ourName:"")+(cmp.ourPay?" · наш платёж "+rub(cmp.ourPay)+" ₽":"")+". У конкурента на 2,5 п.п. выше, без наших скидок и допов.", W-pad*2-28);
        const bh=24+p1.length*18+30+p3.length*18+18;
        need(bh+8);
        box(pad, y, W-pad*2, bh, "#f8f1e4");
        let yy=y+22;
        p1.forEach(ln=>{ font("700", 13); ctx.fillStyle="#8a6840"; ctx.fillText(ln, pad+16, yy); yy+=18; });
        yy+=8;
        font("800", 22);
        ctx.fillStyle="#161618";
        ctx.fillText(rub(cmp.pay)+" ₽ / мес.", pad+16, yy);
        yy+=28;
        p3.forEach(ln=>{ font("500", 13); ctx.fillStyle="#6d5c48"; ctx.fillText(ln, pad+16, yy); yy+=18; });
        y+=bh+18;
      }
      function offerPaintDeals(deals){
        function rbox(x,yy,w,h,fill,stroke){
          const r=16;
          ctx.beginPath();
          ctx.moveTo(x+r,yy);
          ctx.arcTo(x+w,yy,x+w,yy+h,r);
          ctx.arcTo(x+w,yy+h,x,yy+h,r);
          ctx.arcTo(x,yy+h,x,yy,r);
          ctx.arcTo(x,yy,x+w,yy,r);
          ctx.closePath();
          ctx.fillStyle=fill;
          ctx.fill();
          ctx.strokeStyle=stroke;
          ctx.lineWidth=2;
          ctx.stroke();
        }
        function paintLines(lines, x, yy){
          lines.forEach(ln=>{
            font(ln.w, ln.s);
            ctx.fillStyle=ln.c;
            ctx.fillText(ln.t, x, yy);
            yy += ln.s>=18?24:18;
          });
        }
        function cardLines(card, w){
          const out=[];
          if(!card) return out;
          out.push({t:String(card.title||"").toUpperCase(), s:12, w:"800", c:"#8a6840"});
          if(card.pay){
            font("800", 18);
            offerWrap(ctx, card.pay, w-28).forEach(ln=>out.push({t:ln, s:18, w:"800", c:"#161618"}));
          }
          font("500", 13);
          (card.lines||[]).forEach(line=>{
            offerWrap(ctx, line, w-28).forEach(ln=>out.push({t:ln, s:13, w:"500", c:"#3d3832"}));
          });
          font("700", 13);
          (card.pays||[]).forEach(line=>{
            offerWrap(ctx, line, w-28).forEach(ln=>out.push({t:ln, s:13, w:"700", c:"#161618"}));
          });
          return out;
        }
        function cardH(lines){
          let h=20;
          lines.forEach(ln=>{ h += ln.s>=18?24:18; });
          return h+14;
        }
        function tone(card){
          if(!card) return ["#fff","#e4d3b8"];
          if(card.title==="Кредит") return ["#fffdf8","#c81e2b"];
          if(card.title==="Госпрограмма") return ["#f3faf6","#7dba96"];
          return ["#f8f4ec","#c4a574"];
        }
        const gap=12;
        const full=W-pad*2;
        const credit=deals.credit||null;
        const side=[deals.fleet, deals.spec].filter(Boolean);
        y+=8;
        if(credit && side.length){
          const leftW=Math.round(full*0.52);
          const rightW=full-leftW-gap;
          const L=cardLines(credit, leftW);
          const packs=side.map(card=>cardLines(card, rightW));
          const hL=cardH(L);
          const sideHs=packs.map(cardH);
          const hR=sideHs.reduce((s,h)=>s+h,0)+gap*(side.length-1);
          const h=Math.max(hL, hR);
          need(h+6);
          const y0=y;
          const tc=tone(credit);
          rbox(pad, y0, leftW, Math.max(hL, h), tc[0], tc[1]);
          paintLines(L, pad+14, y0+24);
          let yy=y0;
          side.forEach((card,i)=>{
            const ts=tone(card);
            rbox(pad+leftW+gap, yy, rightW, sideHs[i], ts[0], ts[1]);
            paintLines(packs[i], pad+leftW+gap+14, yy+24);
            yy+=sideHs[i]+gap;
          });
          y=y0+h+16;
          return;
        }
        [credit].concat(side).filter(Boolean).forEach(card=>{
          const lines=cardLines(card, full);
          const h=cardH(lines);
          need(h+8);
          const ts=tone(card);
          rbox(pad, y, full, h, ts[0], ts[1]);
          paintLines(lines, pad+14, y+24);
          y+=h+10;
        });
      }
      function newPage(){
        c=document.createElement("canvas");
        c.width=W; c.height=H;
        ctx=c.getContext("2d");
        ctx.fillStyle="#f6f3ec";
        ctx.fillRect(0,0,W,H);
        ctx.fillStyle="#c81e2b";
        ctx.fillRect(0,0,W,14);
        font("800", 22);
        ctx.fillStyle="#161618";
        ctx.fillText("ЭКСПЕРТ АВТО САМАРА", pad, 58);
        font("700", 13);
        ctx.fillStyle="#8a6840";
        ctx.fillText("TENET  ·  ОТДЕЛ ПРОДАЖ  ·  +7 927 724 92 77", pad, 82);
        ctx.strokeStyle="#eadfcf";
        ctx.beginPath();
        ctx.moveTo(pad, 98);
        ctx.lineTo(W-pad, 98);
        ctx.stroke();
        font("500", 12);
        ctx.fillStyle="#9a9186";
        ctx.fillText("Не оферта · ООО «ЭКСПЕРТ АВТО САМАРА»", pad, H-36);
        y=118;
        pages.push(c);
      }
      function paintPhotos(){
        const list=(imgs||[]).filter(Boolean).slice(0,4);
        if(!list.length) return;
        const n=list.length, gap=10;
        const pw=(W-pad*2-(n-1)*gap)/n;
        const ph=Math.round(pw*9/16);
        need(ph+18);
        list.forEach((im,i)=>offerCover(ctx, im, pad+i*(pw+gap), y, pw, ph));
        y+=ph+18;
      }
      function need(h){ if(y+h>H-64) newPage(); }
      newPage();
      paintPhotos();
      need(70);
      font("700", 12);
      ctx.fillStyle="#c81e2b";
      ctx.fillText(String(doc.kicker||"").toUpperCase(), pad, y);
      y+=28;
      font("800", 30);
      ctx.fillStyle="#161618";
      ctx.fillText(doc.title||"Коммерческое предложение", pad, y);
      y+=26;
      font("600", 16);
      offerWrap(ctx, doc.headline||"", W-pad*2).forEach(line=>{
        need(24);
        font("600", 16);
        ctx.fillStyle="#3d3832";
        ctx.fillText(line, pad, y);
        y+=24;
      });
      y+=8;
      (doc.meta||[]).forEach(([k,v])=>{
        const val=offerDash(v);
        font("700", 15);
        const max=W-pad*2-220;
        if(ctx.measureText(val).width<=max){
          need(26);
          font("500", 15);
          ctx.fillStyle="#7a7166";
          ctx.fillText(k, pad, y);
          ctx.textAlign="right";
          font("700", 15);
          ctx.fillStyle="#161618";
          ctx.fillText(val, W-pad, y);
          ctx.textAlign="left";
          y+=26;
        }else{
          need(22);
          font("700", 14);
          ctx.fillStyle="#7a7166";
          ctx.fillText(k, pad, y);
          y+=20;
          font("600", 15);
          offerWrap(ctx, val, W-pad*2).forEach(part=>{
            need(22);
            font("600", 15);
            ctx.fillStyle="#161618";
            ctx.fillText(part, pad, y);
            y+=22;
          });
        }
      });
      y+=8;
      (doc.rows||[]).forEach(([k,v])=>{
        need(32);
        ctx.strokeStyle="#eadfcf";
        ctx.beginPath();
        ctx.moveTo(pad, y+10);
        ctx.lineTo(W-pad, y+10);
        ctx.stroke();
        font("500", 15);
        ctx.fillStyle="#3d3832";
        ctx.fillText(k, pad, y);
        ctx.textAlign="right";
        font("700", 15);
        ctx.fillText(String(v), W-pad, y);
        ctx.textAlign="left";
        y+=32;
      });
      if(doc.total){
        need(56);
        ctx.fillStyle="#efe4cf";
        ctx.fillRect(pad, y-22, W-pad*2, 44);
        font("700", 16);
        ctx.fillStyle="#161618";
        ctx.fillText(doc.total[0], pad+14, y+6);
        ctx.textAlign="right";
        font("800", 20);
        ctx.fillText(doc.total[1], W-pad-14, y+6);
        ctx.textAlign="left";
        y+=48;
      }
      (doc.sections||[]).forEach(sec=>{
        if(sec.cmp){ offerPaintCmp(sec.cmp); return; }
        if(sec.deals){ offerPaintDeals(sec.deals); return; }
        need(36);
        y+=10;
        font("800", 13);
        ctx.fillStyle="#8a6840";
        ctx.fillText(String(sec.title||"").toUpperCase(), pad, y);
        y+=22;
        const pairs=sec.pairs||[];
        if(pairs.length){
          const colW=(W-pad*2-28)/2;
          for(let i=0;i<pairs.length;i+=2){
            font("500", 15);
            const cells=[pairs[i], pairs[i+1]].filter(Boolean).map(([k,v])=>offerWrap(ctx, k+" — "+v, colW));
            const n=Math.max.apply(null, cells.map(a=>a.length));
            need(n*20+4);
            cells.forEach((lines,ci)=>{
              lines.forEach((ln,li)=>{
                font("500", 15);
                ctx.fillStyle="#3d3832";
                ctx.fillText(ln, pad+ci*(colW+28), y+li*20);
              });
            });
            y+=n*20+6;
          }
        }
        (sec.lines||[]).forEach(line=>{
          font("500", 15);
          offerWrap(ctx, line, W-pad*2).forEach(part=>{
            need(22);
            font("500", 15);
            ctx.fillStyle="#161618";
            ctx.fillText(part, pad, y);
            y+=22;
          });
        });
        const gap=22, colW=(W-pad*2-gap)/2;
        (sec.groups||[]).forEach(([title, items])=>{
          need(24);
          font("700", 16);
          ctx.fillStyle="#161618";
          ctx.fillText(String(title||""), pad, y);
          y+=22;
          const list=items||[];
          for(let i=0;i<list.length;i+=2){
            font("500", 15);
            const L=offerWrap(ctx, list[i], colW-18);
            const R=list[i+1]?offerWrap(ctx, list[i+1], colW-18):[];
            const n=Math.max(L.length, R.length||1);
            need(n*19+2);
            const draw=(lines, x)=>{
              lines.forEach((ln,li)=>{
                font("500", 15);
                ctx.fillStyle="#3d3832";
                ctx.fillText((li?"  ":"• ")+ln, x, y+li*19);
              });
            };
            draw(L, pad);
            if(R.length) draw(R, pad+colW+gap);
            y+=n*19+2;
          }
          y+=8;
        });
      });
      if(doc.note){
        y+=8;
        font("500", 13);
        offerWrap(ctx, doc.note, W-pad*2).forEach(part=>{
          need(20);
          font("500", 13);
          ctx.fillStyle="#7a7166";
          ctx.fillText(part, pad, y);
          y+=20;
        });
      }
      pages.forEach((pg,i)=>{
        const x=pg.getContext("2d");
        x.fillStyle="#f6f3ec";
        x.fillRect(W-pad-90, H-54, 90, 26);
        x.fillStyle="#9a9186";
        x.font="500 12px Inter, Arial, sans-serif";
        x.textAlign="right";
        x.fillText((i+1)+" / "+pages.length, W-pad, H-36);
        x.textAlign="left";
      });
      return pages;
    }
    function offerJpeg(canvas){
      const bin=atob(canvas.toDataURL("image/jpeg", 0.86).split(",")[1]);
      const u=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
      return u;
    }
    function offerPdfBytes(images){
      const enc=new TextEncoder();
      const chunks=[];
      let len=0;
      function add(x){
        if(typeof x==="string") x=enc.encode(x);
        chunks.push(x);
        len+=x.length;
      }
      const offsets=[0];
      function objStart(){
        offsets.push(len);
        add((offsets.length-1)+" 0 obj\n");
      }
      function objEnd(){ add("\nendobj\n"); }
      add("%PDF-1.4\n");
      const n=images.length;
      objStart();
      add("<< /Type /Catalog /Pages 2 0 R >>");
      objEnd();
      objStart();
      const kids=[];
      for(let i=0;i<n;i++) kids.push((3+i*3)+" 0 R");
      add("<< /Type /Pages /Count "+n+" /Kids ["+kids.join(" ")+"] >>");
      objEnd();
      images.forEach(im=>{
        const contentId=offsets.length+1;
        const imageId=offsets.length+2;
        objStart();
        add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents "+contentId+" 0 R /Resources << /XObject << /Im0 "+imageId+" 0 R >> >> >>");
        objEnd();
        const content="q 595.28 0 0 841.89 0 0 cm /Im0 Do Q\n";
        objStart();
        add("<< /Length "+content.length+" >>\nstream\n"+content+"endstream");
        objEnd();
        objStart();
        add("<< /Type /XObject /Subtype /Image /Width "+im.w+" /Height "+im.h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+im.jpeg.length+" >>\nstream\n");
        add(im.jpeg);
        add("\nendstream");
        objEnd();
      });
      const start=len;
      const size=offsets.length;
      let xref="xref\n0 "+size+"\n0000000000 65535 f \n";
      for(let i=1;i<size;i++) xref+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
      add(xref);
      add("trailer\n<< /Size "+size+" /Root 1 0 R >>\nstartxref\n"+start+"\n%%EOF");
      const out=new Uint8Array(len);
      let o=0;
      chunks.forEach(ch=>{ out.set(ch, o); o+=ch.length; });
      return out;
    }
    function offerFileName(doc){
      const raw=String((doc&&doc.file)||"КП").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim().slice(0,80);
      return (raw||"КП")+".pdf";
    }
    function offerLoadImgs(urls){
      const list=(urls||[]).slice(0,4);
      return Promise.all(list.map(src=>new Promise(resolve=>{
        const im=new Image();
        im.onload=()=>resolve(im.naturalWidth?im:null);
        im.onerror=()=>resolve(null);
        im.src=src;
      }))).then(arr=>arr.filter(Boolean));
    }
    async function offerPdf(){
      const doc=offerDocCurrent;
      if(!doc || typeof document==="undefined") return;
      const imgs=await offerLoadImgs(doc.photos||[]);
      const pages=offerPaint(doc, imgs).map(c=>({w:c.width,h:c.height,jpeg:offerJpeg(c)}));
      const bytes=offerPdfBytes(pages);
      const blob=new Blob([bytes], {type:"application/pdf"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download=offerFileName(doc);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 8000);
    }
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

    function offer(){
      if(needAuth()) return login();
      if(offerTab==="new") return offerNew();
      if(offerTab==="service") return offerService();
      if(offerTab==="lease") return offerLease();
      return offerHome();
    }
    function offerBind(){
      document.querySelectorAll("[data-offer-tab]").forEach(b=>b.onclick=()=>{ offerTab=b.dataset.offerTab||"home"; view="offer"; render(); });
      document.querySelectorAll("[data-offer-copy]").forEach(b=>b.onclick=()=>{
        offerCopy(b.dataset.offerCopy);
        const prev=b.getAttribute("data-label")||b.textContent;
        b.setAttribute("data-label", prev);
        b.textContent="Скопировано";
        setTimeout(()=>{ b.textContent=b.getAttribute("data-label")||"Текст в мессенджер"; }, 1200);
      });
      document.querySelectorAll("[data-offer-pdf]").forEach(b=>b.onclick=()=>offerPdf());
      document.querySelectorAll("[data-offer-down]").forEach(b=>b.onclick=()=>{ const hid=document.getElementById("ofDownMode"); if(hid) hid.value=b.dataset.offerDown||"pct"; view="offer"; render(); });
      document.querySelectorAll("[data-offer-rival]").forEach(el=>el.addEventListener("change", ()=>{ view="offer"; render(); }));
      ["ofClient","ofOwnCar","ofOwnVal","ofModel","ofColor","ofPrice","ofSpec","ofDo","ofPack","ofCasco","ofDown","ofDownPct","ofMonths","ofValid","ofTi","ofLoan","ofCr","ofDcTi","ofDcCr","ofDcTiAmt","ofDcCrAmt","osClient","osModel","osCar","osVin","osPack","osPrice","osNote","osValid","olCo","olInn","olModel","olPrice","olAdv","olMonths","olValid"].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener("change", ()=>{ view="offer"; render(); }); });
    }
