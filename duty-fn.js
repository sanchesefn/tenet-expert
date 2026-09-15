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
    const DUTY_CARS=[
      {id:"t4l",title:"T4L"},
      {id:"t8",title:"T8"},
      {id:"a8",title:"A8"},
      {id:"t7",title:"T7"},
      {id:"t9",title:"T9"}
    ];
    function duty(){
      if(needAuth()) return login();
      const d=dutyLoad();
      if(!d.date) d.date=dutyToday();
      if(!d.manager && state && state.display) d.manager=state.display;
      const bodySel=(id)=>{
        const v=d[id+"_body"]||"ok";
        return `<select data-duty="${id}_body" class="duty-mini">
          <option value="ok" ${v==="ok"?"selected":""}>да</option>
          <option value="pm" ${v==="pm"?"selected":""}>±</option>
          <option value="no" ${v==="no"?"selected":""}>нет</option>
        </select>`;
      };
      const box=(k)=>`<input type="checkbox" data-duty="${k}" ${d[k]?"checked":""} />`;
      const inp=(k,w)=>`<input data-duty="${k}" class="duty-mini" style="width:${w||56}px" value="${escape(d[k]||"")}" />`;
      const rows=DUTY_CARS.map(car=>`<tr>
        <td><b>${car.title}</b></td>
        <td>${box(car.id+"_wash")}</td>
        <td>${bodySel(car.id)}</td>
        <td>${box(car.id+"_mats")}</td>
        <td>${box(car.id+"_err")}</td>
        <td>${inp(car.id+"_km",64)}</td>
        <td>${inp(car.id+"_fuel",48)}</td>
        <td>${box(car.id+"_dust")}</td>
        <td>${box(car.id+"_trunk")}</td>
      </tr>`).join("");
      return banner("Чек-лист дежурного",d.date||"","TENET")+`
        <div class="duty-sheet duty-compact">
          <div class="duty-top">
            <label>Менеджер <input data-duty="manager" value="${escape(d.manager||"")}" /></label>
            <label>Дата <input data-duty="date" value="${escape(d.date||"")}" style="width:88px" /></label>
            <label>Подпись <input data-duty="sign" value="${escape(d.sign||d.manager||"")}" /></label>
            <button type="button" class="btn ivory" id="dutySave">Сохранить</button>
            <button type="button" class="btn ghost" id="dutyPrint">Печать</button>
            <button type="button" class="btn ghost" id="dutyClear">Сброс</button>
          </div>
          <table class="sheet duty-table">
            <thead><tr><th>Авто</th><th>Омыв</th><th>Кузов</th><th>Коврики</th><th>Ошибки</th><th>Пробег</th><th>Топливо</th><th>Пыль</th><th>Багажник</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="duty-line">
            <b>ДЦ</b>
            <label>${box("dc_light")} свет</label>
            <label>${box("dc_avito")} Авито</label>
            <label>${box("dc_music")} музыка</label>
            <label>${box("dc_price_avito")} цены Авито</label>
            <label>${box("dc_price_hold")} прайсхолдеры</label>
            <label>${box("dc_desk")} столы</label>
            <label>${box("dc_trash")} бумаги</label>
          </div>
          <div class="duty-line">
            <b>Демо</b>
            <label>${box("dm_body")} кузов</label>
            <label>${box("dm_mats")} коврики</label>
            <label>${box("dm_trunk")} багажник</label>
            <label>${box("dm_dust")} пыль</label>
            <label>${box("dm_wheel")} колёса</label>
            <label>${box("dm_bat")} АКБ</label>
            <input data-duty="note" placeholder="Заметка, например: помыть T7, T4L" value="${escape(d.note||"")}" style="flex:1;min-width:180px" />
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
      const tries=[
        "https://api.allorigins.win/raw?url="+enc,
        "https://corsproxy.io/?"+enc
      ];
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
      if(/ Ничего не найдено |не найдено исполнительн/i.test(t)) return {hit:false, n:0, detail:"Исполнительных производств не найдено"};
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
      if(recs) return {hit:true, n:recs, detail:"Найдено записей: "+recs+" · в трейд-ин не брать, если было за 3 года"};
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
      if(box) box.innerHTML=`<div class="note-box">Проверяю VIN ${escape(vin)} · ${escape(fio)} · ${escape(dob)} · все регионы…</div>`;
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
      if(box) box.innerHTML=`
        <div class="card dc-result ${v.ok===true?"ok":v.ok===false?"bad":""}">
          <p class="eyebrow">Сводка проверки</p>
          <div class="calc-out" style="font-size:22px">${escape(v.text)}</div>
          <p class="calc-note">${escape(vin)} · ${escape(fio)} · ${escape(dob)}</p>
          ${row("Реестр залогов · VIN", z, zalogUrl)}
          ${row("ФССП · все регионы", f, fsspUrl)}
          ${row("Реестр банкротов · ФИО", b, brAlt)}
          <p class="calc-note">Банкротство за 3 года — трейд-ин не брать. ФССП и залоги часто просят капчу: тогда откройте ссылку и допишите результат в PDF.</p>
          <div class="who-line" style="margin-top:10px">
            <button type="button" class="btn ivory" id="gPdf">Сохранить PDF</button>
          </div>
        </div>`;
      const pdf=document.getElementById("gPdf");
      if(pdf) pdf.onclick=()=>gibddPdf(pack);
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
      ctx.fillStyle="#1a1a1a";
      ctx.font="600 22px Inter, Arial, sans-serif";
      let y=190;
      const lines=[
        "VIN: "+p.vin,
        "ФИО: "+p.fio,
        "Дата рождения: "+p.dob,
        "",
        "Итог: "+(p.v&&p.v.text||""),
        "",
        "1. Реестр залогов (VIN)",
        (p.z&&p.z.hit===true?"Результат: ЕСТЬ ЗАПИСИ":p.z&&p.z.hit===false?"Результат: НЕ НАЙДЕНО":"Результат: требуется сайт"),
        p.z&&p.z.detail||"",
        "",
        "2. ФССП, все регионы (ФИО + дата рождения)",
        (p.f&&p.f.hit===true?"Результат: ЕСТЬ ИП":p.f&&p.f.hit===false?"Результат: НЕ НАЙДЕНО":"Результат: требуется сайт"),
        p.f&&p.f.detail||"",
        "",
        "3. Реестр банкротов (только ФИО)",
        (p.b&&p.b.hit===true?"Результат: ЕСТЬ ЗАПИСИ":p.b&&p.b.hit===false?"Результат: НЕ НАЙДЕНО":"Результат: требуется сайт"),
        p.b&&p.b.detail||"",
        "",
        "Правило ДЦ: банкротство за последние 3 года — авто в трейд-ин не принимаем."
      ];
      lines.forEach(ln=>{
        ctx.fillText(String(ln).slice(0,78), 72, y);
        y+=34;
      });
      ctx.fillStyle="#7a7166";
      ctx.font="500 16px Inter, Arial, sans-serif";
      ctx.fillText("fssp.gov.ru  ·  reestr-zalogov.ru  ·  bankrot.fedresurs.ru", 72, 1680);
      c.toBlob(blob=>{
        if(!blob) return;
        const a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download="proverka-"+(p.vin||"gibdd")+".png";
        a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
      }, "image/png");
      const w=window.open("");
      if(w){
        w.document.write("<title>Проверка</title><img style='width:100%' src='"+c.toDataURL("image/png")+"' />");
        w.document.close();
        setTimeout(()=>{ try{ w.print(); }catch(e){} }, 400);
      }
    }
    function gibdd(){
      if(needAuth()) return login();
      const g=gibddLoad();
      return banner("Проверки ГИБДД","Залог · ФССП · банкроты","TENET")+`
        <p class="lead">VIN идёт в реестр залогов. ФИО и дата рождения — в ФССП по всем регионам. Банкроты — только по ФИО.</p>
        <div class="card">
          <div class="duty-top">
            <label class="field" style="max-width:none"><span>VIN</span><input id="gVin" value="${escape(g.vin||"")}" placeholder="X7L…" /></label>
            <label class="field" style="max-width:none"><span>ФИО</span><input id="gFio" value="${escape(g.fio||"")}" placeholder="Иванов Иван Иванович" /></label>
            <label class="field" style="width:180px"><span>Дата рождения</span><input id="gDob" value="${escape(g.dob||"")}" placeholder="01.01.1990" /></label>
          </div>
          <div class="who-line">
            <button type="button" class="btn ivory" id="gRun">Проверить</button>
          </div>
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
        const save=document.getElementById("dutySave");
        if(save) save.onclick=()=>{ dutySave(dutyRead()); save.textContent="Ок"; setTimeout(()=>save.textContent="Сохранить",1000); };
        const pr=document.getElementById("dutyPrint");
        if(pr) pr.onclick=()=>{ dutySave(dutyRead()); window.print(); };
        const cl=document.getElementById("dutyClear");
        if(cl) cl.onclick=()=>{ localStorage.removeItem("tenet-duty-v1"); render(); };
      }
      if(view==="gibdd"){
        const run=document.getElementById("gRun");
        if(run) run.onclick=()=>gibddRun();
        ["gVin","gFio","gDob"].forEach(id=>{
          const el=document.getElementById(id);
          if(el) el.addEventListener("change", gibddSaveForm);
        });
        const last=(()=>{ try{ return JSON.parse(localStorage.getItem("tenet-gibdd-last")||"null"); }catch(e){ return null; } })();
        if(last && last.vin){
          window.__gibddLast=last;
          const box=document.getElementById("gOut");
          if(box) box.innerHTML=`<div class="note-box">Последняя сводка: ${escape(last.v&&last.v.text||"")} · ${escape(last.vin)}. Нажмите «Проверить» ещё раз или сохраните PDF.
            <div class="who-line" style="margin-top:8px"><button type="button" class="btn ghost" id="gPdfLast">PDF последней</button></div></div>`;
          const b=document.getElementById("gPdfLast");
          if(b) b.onclick=()=>gibddPdf(last);
        }
      }
    }
