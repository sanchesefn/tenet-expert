    let offerTab = "home";
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
      const tabs=[["home","Разделы"],["new","КП Новый а/м"],["service","КП Сервис"],["lease","КП Лизинг"]];
      return `<div class="down-mode" style="margin:0 0 14px">${tabs.map(([id,l])=>`<button type="button" class="chip ${offerTab===id?"on":""}" data-offer-tab="${id}">${l}</button>`).join("")}</div>`;
    }
    function offerHome(){
      const cards=[["new","Н","КП Новый а/м","Прайс, скидки, каско, кредит и PDF"],["service","С","КП Сервис","Пакет, состав и PDF"],["lease","Л","КП Лизинг","Компания, флит, аванс и PDF"]];
      return banner("Коммерческое предложение","TENET · Отдел продаж","КП")+`
        <p class="lead">Слева условия, справа бланк. Клиенту уходит PDF: его скачивают и пересылают.</p>
        ${offerNav()}
        <div class="hub-grid offer-grid">${cards.map(([id,mark,title,lead])=>`<button class="card hub-card" data-offer-tab="${id}" type="button"><span class="hub-mark">${mark}</span><div class="txt"><h3>${title}</h3><p>${lead}</p></div></button>`).join("")}</div>`;
    }
    function offerDeal(){
      const models=typeof KM_MODELS!=="undefined"?KM_MODELS:[];
      const mid=offerVal("ofModel", models[0]?models[0].id:"t7a");
      const m=models.find(x=>x.id===mid)||models[0]||{id:"t7a",name:"TENET",rrc:0,ti:0,cr:0};
      const prevModel=offerVal("ofPrevModel", mid);
      const client=offerVal("ofClient","");
      const color=offerVal("ofColor","");
      let price=offerNum("ofPrice", m.rrc)||m.rrc;
      if(prevModel!==mid) price=m.rrc;
      const useTi=offerOn("ofTi");
      const useLoan=offerOn("ofLoan");
      const showDealCr=(m.cr||0)>0 && (m.id!=="t7p" || useLoan);
      const useCr=showDealCr && offerOn("ofCr");
      const spec=offerNum("ofSpec", 0)||0;
      const useDcTi=useTi && offerOn("ofDcTi");
      const useDcCr=useLoan && offerOn("ofDcCr");
      const dcDef=typeof KM_DC_DEF==="number"?KM_DC_DEF:100000;
      const dcTi=useDcTi?offerNum("ofDcTiAmt", dcDef)||0:0;
      const dcCr=useDcCr?offerNum("ofDcCrAmt", dcDef)||0:0;
      const addons=offerNum("ofDo", 0)||0;
      let casco=0, pack=0;
      if(useLoan){ pack=offerNum("ofPack", 150000)||0; casco=Math.min(pack, 80000); }
      else casco=offerNum("ofCasco", 0)||0;
      const months=offerNum("ofMonths", 60)||60;
      const downMode=offerVal("ofDownMode","pct");
      let downPct=offerNum("ofDownPct", 20);
      let down=offerNum("ofDown", Math.round(price*0.2));
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
      return {m, mid, models, client, color, price, useTi, useLoan, showDealCr, useCr, spec, useDcTi, useDcCr, dcDef, dcTi, dcCr, addons, casco, pack, months, downMode, downPct, down, carPrice, clientPay, credit, fee, valid, packEq, banks, discs, discount};
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
    function offerPreview(doc){
      const meta=(doc.meta||[]).map(([k,v])=>`<div class="op-line"><span>${escape(k)}</span><b>${escape(offerDash(v))}</b></div>`).join("");
      const rows=(doc.rows||[]).map(([k,v])=>`<div class="op-line"><span>${escape(k)}</span><b>${escape(v)}</b></div>`).join("");
      const total=doc.total?`<div class="op-total"><span>${escape(doc.total[0])}</span><b>${escape(doc.total[1])}</b></div>`:"";
      const photos=(doc.photos||[]).slice(0,4).map(u=>`<img src="${escape(u)}" alt="">`).join("");
      const sections=(doc.sections||[]).map(sec=>{
        const pairs=(sec.pairs||[]).length?`<div class="op-specs">${(sec.pairs||[]).map(([k,v])=>`<div class="op-pair"><b>${escape(k)}</b><span>${escape(v)}</span></div>`).join("")}</div>`:"";
        const lines=(sec.lines||[]).map(t=>`<p>${escape(t)}</p>`).join("");
        const groups=(sec.groups||[]).length?`<div class="op-cols">${(sec.groups||[]).map(([title,items])=>`<p class="op-g">${escape(title)}</p><ul>${(items||[]).map(it=>`<li>${escape(it)}</li>`).join("")}</ul>`).join("")}</div>`:"";
        return `<section><h3>${escape(sec.title||"")}</h3>${pairs}${lines}${groups}</section>`;
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
    function offerDocNew(d){
      const rows=[["РРЦ", rub(d.price)+" ₽"]];
      d.discs.forEach(([name,amt])=>rows.push([name, "− "+rub(amt)+" ₽"]));
      rows.push(["Автомобиль", rub(d.carPrice)+" ₽"]);
      if(d.addons) rows.push(["Дополнительное оборудование", rub(d.addons)+" ₽"]);
      if(d.useLoan) rows.push(["Каско расширенное / пакет СЖ", rub(d.pack)+" ₽"]);
      else if(d.casco) rows.push(["КАСКО", rub(d.casco)+" ₽"]);
      const sections=[];
      if(d.useLoan){
        sections.push({title:"Кредит", pairs:[
          ["Первый взнос", rub(d.down)+" ₽ ("+d.downPct+"%)"],
          ["Срок", d.months+" мес."],
          ["Тело кредита", rub(d.credit)+" ₽"],
          ["Комиссия банка", rub(d.fee)+" ₽"]
        ], lines:(d.banks||[]).map(b=>b.name+": "+b.rate+"% · "+b.term+" мес. · "+rub(b.pay)+" ₽ / мес.")});
      }
      if(d.packEq && d.packEq.specs) sections.push({title:"Характеристики", pairs:d.packEq.specs});
      if(d.packEq && d.packEq.groups) sections.push({title:"Оснащение", groups:d.packEq.groups});
      const src=(d.packEq&&d.packEq.src)||"официальный прайс";
      return {
        kicker:"Новый автомобиль",
        title:"Коммерческое предложение",
        headline:d.m.name,
        file:"КП "+d.m.name+" "+d.client,
        meta:[["Клиент", d.client],["Цвет", d.color],["Менеджер", offerMgr()]],
        rows:rows,
        total:["Итого клиенту", rub(d.clientPay)+" ₽"],
        sections:sections,
        photos:offerPhotoUrls(d.m.id),
        note:"Оснащение — все отмеченные позиции. Источник: "+src+". Не оферта. Итоговые условия — в договоре салона. Действует "+d.valid+"."
      };
    }
    function offerField(label, inner){
      return `<label class="field" style="max-width:none"><span>${label}</span>${inner}</label>`;
    }
    function offerNew(){
      const d=offerDeal();
      const doc=offerDocNew(d);
      const form=`
        <p class="eyebrow">Клиент</p>
        <input type="hidden" id="ofPrevModel" value="${escape(d.mid)}" />
        ${offerField("Клиент", `<input id="ofClient" value="${escape(d.client)}" placeholder="ФИО" />`)}
        ${d.client?"":`<p class="calc-note">Клиент пустой. В PDF будет прочерк, пока не впишете имя.</p>`}
        <p class="eyebrow">Автомобиль</p>
        ${offerField("Комплектация", `<select id="ofModel">${d.models.map(x=>`<option value="${x.id}" ${x.id===d.mid?"selected":""}>${escape(x.name)} · ${rub(x.rrc)}</option>`).join("")}</select>`)}
        ${offerField("Цвет", `<input id="ofColor" value="${escape(d.color)}" placeholder="не указан" />`)}
        ${offerField("РРЦ, ₽", `<input id="ofPrice" inputmode="numeric" value="${d.price}" />`)}
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
        ${d.useLoan?offerField("Каско расширенное / СЖ, ₽", `<input id="ofPack" inputmode="numeric" value="${d.pack}" />`):offerField("КАСКО, ₽", `<input id="ofCasco" inputmode="numeric" value="${d.casco}" />`)}
        ${d.useLoan?`<p class="eyebrow">Кредит</p><div class="down-mode"><button type="button" class="chip ${d.downMode==="sum"?"on":""}" data-offer-down="sum">Сумма, ₽</button><button type="button" class="chip ${d.downMode!=="sum"?"on":""}" data-offer-down="pct">Проценты</button></div><input type="hidden" id="ofDownMode" value="${d.downMode==="sum"?"sum":"pct"}" />${d.downMode==="sum"?offerField("Первый взнос, ₽", `<input id="ofDown" inputmode="numeric" value="${d.down}" />`):offerField("Первый взнос, %", `<input id="ofDownPct" inputmode="decimal" value="${d.downPct}" />`)}${offerField("Срок, мес.", `<input id="ofMonths" inputmode="numeric" value="${d.months}" />`)}`:""}
        ${offerField("Срок действия", `<input id="ofValid" value="${escape(d.valid)}" />`)}`;
      return offerScreen("КП Новый а/м", form, doc);
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
        ${offerField("Комплектация", `<select id="osModel">${models.map(x=>`<option value="${x.id}" ${x.id===mid?"selected":""}>${escape(x.name)}</option>`).join("")}</select>`)}
        ${offerField("VIN", `<input id="osVin" value="${escape(vin)}" placeholder="необязательно" />`)}
        ${offerField("Пакет", `<select id="osPack">${packs.map(p=>`<option value="${p.id}" ${p.id===packId?"selected":""}>${escape(p.name)} · ${rub(p.price)}</option>`).join("")}</select>`)}
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
      const options=fleetIds.length?fleetIds.map(id=>({id,name:(fset[id]&&fset[id].name)||id,rrc:(fset[id]&&(fset[id].rrc||fset[id].tidy))||0})):models;
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
        ${offerField("Комплектация", `<select id="olModel">${options.map(x=>`<option value="${x.id}" ${x.id===fid?"selected":""}>${escape(x.name)}${x.rrc?" · "+rub(x.rrc):""}</option>`).join("")}</select>`)}
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
      ["ofClient","ofModel","ofColor","ofPrice","ofSpec","ofDo","ofPack","ofCasco","ofDown","ofDownPct","ofMonths","ofValid","ofTi","ofLoan","ofCr","ofDcTi","ofDcCr","ofDcTiAmt","ofDcCrAmt","osClient","osModel","osCar","osVin","osPack","osPrice","osNote","osValid","olCo","olInn","olModel","olPrice","olAdv","olMonths","olValid"].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener("change", ()=>{ view="offer"; render(); }); });
    }
