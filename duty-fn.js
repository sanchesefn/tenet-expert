    function stockBlob(c){
      if(!c) return "";
      return [c.invoice,c.note,c.lease,c.tag,c.marks,c.label].map(x=>String(x||"")).join(" ").toLowerCase();
    }
    function stockHasSovcom(c){
      if(!c) return false;
      const s=stockBlob(c);
      if(s.includes("совком") || (s.includes("лизинг") && s.includes("совк"))) return true;
      if(c.sovcom || c.bfs) return true;
      if(typeof kmIsCorp==="function" && kmIsCorp(c.vin)) return true;
      return false;
    }
    function stockMptSovcom(c){ return !!(c && c.mpt && stockHasSovcom(c)); }
    function dutyToday(){
      const d=new Date();
      const p=n=>String(n).padStart(2,"0");
      return p(d.getDate())+"."+p(d.getMonth()+1)+"."+String(d.getFullYear()).slice(-2);
    }
    function dutyLoad(){
      try{
        const x=JSON.parse(localStorage.getItem("tenet-duty-v1")||"{}");
        return x && typeof x==="object"?x:{};
      }catch(e){ return {}; }
    }
    function dutySave(data){
      try{ localStorage.setItem("tenet-duty-v1", JSON.stringify(data||{})); }catch(e){}
    }
    function dutyRead(){
      const out=dutyLoad();
      document.querySelectorAll("[data-duty]").forEach(el=>{
        const k=el.getAttribute("data-duty");
        if(!k) return;
        if(el.type==="checkbox") out[k]=!!el.checked;
        else out[k]=el.value;
      });
      return out;
    }
    function dutyCount(d){
      let tot=0, on=0;
      DUTY_CARS.forEach(car=>{
        ["_wash","_mats","_err","_dust","_trunk"].forEach(s=>{ tot++; if(d[car.id+s]) on++; });
        tot++; if((d[car.id+"_body"]||"ok")!=="no") on++;
        tot+=2; if(d[car.id+"_km"]) on++; if(d[car.id+"_fuel"]) on++;
      });
      ["dc_light","dc_avito","dc_music","dc_price_avito","dc_price_hold","dc_desk","dc_trash","dm_body","dm_mats","dm_trunk","dm_dust","dm_wheel","dm_bat"].forEach(k=>{ tot++; if(d[k]) on++; });
      return {on, tot};
    }
    const DUTY_CARS=[
      {id:"t4l",title:"TENET T4L"},
      {id:"t8",title:"TENET T8"},
      {id:"a8",title:"Arrizo 8"},
      {id:"t7",title:"TENET T7"},
      {id:"t9",title:"Tiggo 9"}
    ];
    function dutyItem(k, label, on){
      return `<label class="cl-item"><input type="checkbox" data-duty="${k}" ${on?"checked":""} /><span>${label}</span></label>`;
    }
    function duty(){
      if(needAuth()) return login();
      const d=dutyLoad();
      if(!d.date) d.date=dutyToday();
      const who=(typeof state!=="undefined" && state && state.display)?state.display:"";
      if(!d.manager && who) d.manager=who;
      const prog=dutyCount(d);
      const pct=prog.tot?Math.round(prog.on*100/prog.tot):0;
      const cards=DUTY_CARS.map(car=>{
        const body=d[car.id+"_body"]||"ok";
        return `<article class="cl-car">
          <h3>${car.title}</h3>
          ${dutyItem(car.id+"_wash","Омывающая", d[car.id+"_wash"])}
          ${dutyItem(car.id+"_mats","Коврики и пороги", d[car.id+"_mats"])}
          ${dutyItem(car.id+"_err","Нет ошибок", d[car.id+"_err"])}
          ${dutyItem(car.id+"_dust","Нет пыли", d[car.id+"_dust"])}
          ${dutyItem(car.id+"_trunk","Багажник", d[car.id+"_trunk"])}
          <label class="cl-item" style="display:block">Кузов
            <select data-duty="${car.id}_body">
              <option value="ok" ${body==="ok"?"selected":""}>чистый</option>
              <option value="pm" ${body==="pm"?"selected":""}>±</option>
              <option value="no" ${body==="no"?"selected":""}>грязный</option>
            </select>
          </label>
          <div class="cl-nums">
            <label>Пробег<input data-duty="${car.id}_km" inputmode="numeric" value="${escape(d[car.id+"_km"]||"")}" /></label>
            <label>Топливо %<input data-duty="${car.id}_fuel" inputmode="numeric" value="${escape(d[car.id+"_fuel"]||"")}" /></label>
          </div>
        </article>`;
      }).join("");
      return banner("Чек-лист дежурного", prog.on+" из "+prog.tot,"TENET")+`
        <div class="cl">
          <div class="cl-bar">
            <input data-duty="manager" placeholder="Менеджер" value="${escape(d.manager||"")}" />
            <input data-duty="date" value="${escape(d.date||"")}" style="width:96px" />
            <input data-duty="sign" placeholder="Подпись" value="${escape(d.sign||d.manager||"")}" />
            <div class="cl-prog"><i style="width:${pct}%"></i><span>${pct}%</span></div>
            <button type="button" class="btn ivory" id="dutySave">Сохранить</button>
            <button type="button" class="btn ghost" id="dutyPrint">Печать</button>
            <button type="button" class="btn ghost" id="dutyClear">Сброс</button>
          </div>
          <div class="cl-cars">${cards}</div>
          <div class="cl-foot">
            <div class="cl-box"><b>Дилерский центр</b><div class="cl-chips">
              ${dutyItem("dc_light","Свет", d.dc_light)}
              ${dutyItem("dc_avito","Авито", d.dc_avito)}
              ${dutyItem("dc_music","Музыка", d.dc_music)}
              ${dutyItem("dc_price_avito","Цены Авито", d.dc_price_avito)}
              ${dutyItem("dc_price_hold","Прайсхолдеры", d.dc_price_hold)}
              ${dutyItem("dc_desk","Столы", d.dc_desk)}
              ${dutyItem("dc_trash","Бумаги", d.dc_trash)}
            </div></div>
            <div class="cl-box"><b>Демонстрационные</b><div class="cl-chips">
              ${dutyItem("dm_body","Кузов", d.dm_body)}
              ${dutyItem("dm_mats","Коврики", d.dm_mats)}
              ${dutyItem("dm_trunk","Багажник", d.dm_trunk)}
              ${dutyItem("dm_dust","Пыль", d.dm_dust)}
              ${dutyItem("dm_wheel","Колёса", d.dm_wheel)}
              ${dutyItem("dm_bat","АКБ", d.dm_bat)}
            </div>
            <input data-duty="note" placeholder="Заметка: помыть T7, T4L" value="${escape(d.note||"")}" style="width:100%;margin-top:8px;min-height:34px" />
            </div>
          </div>
        </div>`;
    }
    function gibddSplitFio(s){
      const p=String(s||"").trim().split(/\s+/).filter(Boolean);
      return {last:p[0]||"", first:p[1]||"", mid:p.slice(2).join(" ")};
    }
    function gibddDob(s){
      const t=String(s||"").trim();
      const m=t.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})$/) || t.match(/^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})$/);
      if(!m) return t;
      if(m[1].length===4) return ("0"+m[3]).slice(-2)+"."+("0"+m[2]).slice(-2)+"."+m[1];
      const y=m[3].length===2?("20"+m[3]):m[3];
      return ("0"+m[1]).slice(-2)+"."+("0"+m[2]).slice(-2)+"."+y;
    }
    function gibddLoad(){
      try{ return JSON.parse(localStorage.getItem("tenet-gibdd-v1")||"{}"); }catch(e){ return {}; }
    }
    function gibddSaveForm(){
      const o={vin:(document.getElementById("gVin")||{}).value||"", fio:(document.getElementById("gFio")||{}).value||"", dob:(document.getElementById("gDob")||{}).value||""};
      try{ localStorage.setItem("tenet-gibdd-v1", JSON.stringify(o)); }catch(e){}
      return o;
    }
    async function gibddFetch(url){
      const ctrl=typeof AbortController==="function"?new AbortController():null;
      const t=setTimeout(()=>{ try{ if(ctrl) ctrl.abort(); }catch(e){} }, 12000);
      try{
        const r=await fetch(url,{signal:ctrl?ctrl.signal:undefined, cache:"no-store"});
        const text=await r.text();
        return {ok:r.ok, status:r.status, text:text.slice(0,20000)};
      }catch(e){
        return {ok:false, status:0, text:String(e&&e.message||e)};
      }finally{ clearTimeout(t); }
    }
    async function gibddViaProxy(url){
      const enc=encodeURIComponent(url);
      const tries=["https://api.allorigins.win/raw?url="+enc, "https://corsproxy.io/?"+enc];
      for(const u of tries){
        const r=await gibddFetch(u);
        if(r.ok && r.text && !/^error/i.test(r.text)) return r;
      }
      return {ok:false, status:0, text:"нет доступа без капчи"};
    }
    function gibddParseZalog(text, vin){
      const t=String(text||"");
      if(/ничего не найдено|не найдено уведомлен/i.test(t)) return {hit:false, n:0, detail:"Записей по VIN нет"};
      const recs=t.match(/20\d{2}-\d{3}-\d+/g)||[];
      if(recs.length) return {hit:true, n:recs.length, detail:"Найдены уведомления: "+recs.slice(0,6).join(", ")};
      if(vin && t.toUpperCase().includes(String(vin).toUpperCase()) && /залог/i.test(t)) return {hit:true, n:1, detail:"VIN упомянут в реестре"};
      return {hit:null, n:0, detail:"Сайт не отдал таблицу (капча или CORS). Откройте реестр."};
    }
    function gibddParseFssp(text){
      const t=String(text||"");
      if(/Ничего не найдено|не найдено исполнительн/i.test(t)) return {hit:false, n:0, detail:"Исполнительных производств не найдено"};
      const ips=t.match(/\d+\/\d+\/\d+-?И?П?/g)||[];
      if(ips.length) return {hit:true, n:ips.length, detail:"Найдены ИП: "+ips.slice(0,8).join(", ")};
      return {hit:null, n:0, detail:"ФССП требует капчу. Откройте банк данных, регион — Все."};
    }
    function gibddParseBankrot(text, fio){
      const t=String(text||"");
      if(/ничего не найдено|не найдено сообщен/i.test(t)) return {hit:false, n:0, detail:"В реестре банкротов нет"};
      let recs=0;
      try{
        const j=JSON.parse(t);
        const arr=j.pageData||j.items||j.data||j.records||[];
        if(Array.isArray(arr)) recs=arr.length;
        if(j.total||j.totalCount) recs=Number(j.total||j.totalCount)||recs;
      }catch(e){
        const name=String(fio||"").split(/\s+/)[0];
        if(name && t.toLowerCase().includes(name.toLowerCase()) && /банкрот/i.test(t)) recs=1;
      }
      if(recs) return {hit:true, n:recs, detail:"Найдено записей: "+recs};
      return {hit:null, n:0, detail:"Автопроверка не подтвердила результат. Откройте Федресурс."};
    }
    function gibddVerdict(z,f,b){
      const bad=[];
      if(z&&z.hit) bad.push("залог");
      if(f&&f.hit) bad.push("ФССП");
      if(b&&b.hit) bad.push("банкротство");
      if(bad.length) return {ok:false, text:"Риск: "+bad.join(", ")};
      if([z,f,b].some(x=>x && x.hit===null)) return {ok:null, text:"Часть проверок требует подтверждения на сайте"};
      return {ok:true, text:"По автопроверке записей нет"};
    }
    async function gibddRun(){
      try{
        const form=gibddSaveForm();
        const vin=String(form.vin||"").replace(/\s+/g,"").toUpperCase();
        const fio=String(form.fio||"").trim();
        const dob=gibddDob(form.dob);
        const nm=gibddSplitFio(fio);
        const box=document.getElementById("gOut");
        if(!vin || !nm.last || !nm.first || !dob){
          if(box) box.innerHTML=`<div class="note-box">Нужны VIN, ФИО (фамилия и имя) и дата рождения.</div>`;
          return;
        }
        if(box) box.innerHTML=`<div class="note-box">Проверяю ${escape(vin)} · ${escape(fio)} · ${escape(dob)} …</div>`;
        const zalogUrl="https://www.reestr-zalogov.ru/search/index";
        const fsspUrl="https://fssp.gov.ru/iss/ip";
        const brUrl="https://fedresurs.ru/backend/persons?limit=15&offset=0&searchString="+encodeURIComponent(fio);
        const brAlt="https://bankrot.fedresurs.ru/Debtors.search.aspx";
        const [zRaw, fRaw, bRaw]=await Promise.all([
          gibddViaProxy(zalogUrl+"?vin="+encodeURIComponent(vin)),
          gibddViaProxy(fsspUrl),
          gibddFetch(brUrl)
        ]);
        const z=gibddParseZalog(zRaw.text, vin);
        const f=gibddParseFssp(fRaw.text);
        let b=gibddParseBankrot(bRaw.text, fio);
        if(b.hit===null){
          const b2=await gibddViaProxy(brAlt+"?Name="+encodeURIComponent(fio));
          b=gibddParseBankrot(b2.text, fio);
        }
        const v=gibddVerdict(z,f,b);
        const pack={at:new Date().toISOString(), vin, fio, dob, z, f, b, v};
        window.__gibddLast=pack;
        try{ localStorage.setItem("tenet-gibdd-last", JSON.stringify(pack)); }catch(e){}
        const row=(title, rec, href)=>`<div class="bank-row"><span><b>${title}</b><br/><small>${escape(rec.detail||"")}</small></span><span class="pay">${rec.hit===true?"Есть":rec.hit===false?"Нет":"Проверьте"}</span></div><p class="calc-note"><a href="${href}" target="_blank" rel="noopener">открыть реестр</a></p>`;
        if(box) box.innerHTML=`<div class="card dc-result ${v.ok===true?"ok":v.ok===false?"bad":""}">
          <p class="eyebrow">Сводка проверки</p>
          <div class="calc-out" style="font-size:22px">${escape(v.text)}</div>
          <p class="calc-note">${escape(vin)} · ${escape(fio)} · ${escape(dob)}</p>
          ${row("Реестр залогов · VIN", z, zalogUrl)}
          ${row("ФССП · все регионы", f, fsspUrl)}
          ${row("Реестр банкротов · ФИО", b, brAlt)}
          <div class="who-line" style="margin-top:10px"><button type="button" class="btn ivory" id="gPdf">Сохранить PDF</button></div>
        </div>`;
      }catch(err){
        const box=document.getElementById("gOut");
        if(box) box.innerHTML=`<div class="note-box">Ошибка проверки: ${escape(String(err&&err.message||err))}</div>`;
      }
    }
    function gibddPdf(pack){
      const p=pack||window.__gibddLast;
      if(!p) return;
      const c=document.createElement("canvas");
      c.width=1240; c.height=1754;
      const ctx=c.getContext("2d");
      ctx.fillStyle="#f6f1e8"; ctx.fillRect(0,0,c.width,c.height);
      ctx.fillStyle="#1a1a1a";
      ctx.font="700 36px Inter, Arial, sans-serif";
      ctx.fillText("Проверка трейд-ин", 72, 90);
      ctx.font="500 20px Inter, Arial, sans-serif";
      ctx.fillStyle="#5c5346";
      ctx.fillText("ЭКСПЕРТ АВТО САМАРА · "+new Date(p.at||Date.now()).toLocaleString("ru-RU"), 72, 128);
      ctx.fillStyle="#1a1a1a"; ctx.font="600 22px Inter, Arial, sans-serif";
      let y=190;
      ["VIN: "+p.vin,"ФИО: "+p.fio,"Дата рождения: "+p.dob,"","Итог: "+(p.v&&p.v.text||""),"","1. Залоги: "+(p.z&&p.z.detail||""),"2. ФССП: "+(p.f&&p.f.detail||""),"3. Банкроты: "+(p.b&&p.b.detail||""),"","Банкротство за 3 года — трейд-ин не принимаем."].forEach(ln=>{ ctx.fillText(String(ln).slice(0,78), 72, y); y+=36; });
      const w=window.open("");
      if(w){ w.document.write("<title>Проверка</title><img style='width:100%' src='"+c.toDataURL("image/png")+"' />"); w.document.close(); setTimeout(()=>{ try{ w.print(); }catch(e){} }, 400); }
    }
    function gibdd(){
      if(needAuth()) return login();
      const g=gibddLoad();
      return banner("Проверки ГИБДД","Залог · ФССП · банкроты","TENET")+`
        <p class="lead">VIN — залоги. ФИО и дата рождения — ФССП, все регионы. Банкроты — только ФИО.</p>
        <div class="card">
          <div class="cl-bar">
            <label class="field" style="max-width:none"><span>VIN</span><input id="gVin" value="${escape(g.vin||"")}" placeholder="X7L…" /></label>
            <label class="field" style="max-width:none"><span>ФИО</span><input id="gFio" value="${escape(g.fio||"")}" placeholder="Иванов Иван Иванович" /></label>
            <label class="field" style="width:180px"><span>Дата рождения</span><input id="gDob" value="${escape(g.dob||"")}" placeholder="01.01.1990" /></label>
          </div>
          <div class="who-line"><button type="button" class="btn ivory" id="gRun">Проверить</button></div>
        </div>
        <div id="gOut"></div>`;
    }
    function dutyBind(){
      if(view==="duty"){
        const persist=()=>dutySave(dutyRead());
        document.querySelectorAll("[data-duty]").forEach(el=>{
          el.addEventListener("change", persist);
          el.addEventListener("input", persist);
        });
      }
      if(view==="gibdd"){
        ["gVin","gFio","gDob"].forEach(id=>{
          const el=document.getElementById(id);
          if(el) el.addEventListener("change", gibddSaveForm);
        });
      }
    }
    if(!window.__dutyClick){
      window.__dutyClick=true;
      document.addEventListener("click", function(ev){
        const t=ev.target && ev.target.closest ? ev.target.closest("#gRun,#gPdf,#gPdfLast,#dutySave,#dutyPrint,#dutyClear") : ev.target;
        if(!t || !t.id) return;
        if(t.id==="gRun"){ ev.preventDefault(); gibddRun(); }
        if(t.id==="gPdf" || t.id==="gPdfLast"){ ev.preventDefault(); gibddPdf(window.__gibddLast); }
        if(t.id==="dutySave"){ ev.preventDefault(); dutySave(dutyRead()); t.textContent="Ок"; setTimeout(()=>t.textContent="Сохранить",900); }
        if(t.id==="dutyPrint"){ ev.preventDefault(); dutySave(dutyRead()); window.print(); }
        if(t.id==="dutyClear"){ ev.preventDefault(); localStorage.removeItem("tenet-duty-v1"); if(typeof render==="function") render(); }
      });
    }
