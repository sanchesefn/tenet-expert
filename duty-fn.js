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
      {id:"t4l",title:"TENET T4L"},
      {id:"t8",title:"TENET T8"},
      {id:"a8",title:"Arrizo 8"},
      {id:"t7",title:"TENET T7"},
      {id:"t9",title:"Tiggo 9"}
    ];
    function dutyTri(v){
      if(v==="ok" || v==="bad") return v;
      if(v===true || v==="true") return "ok";
      if(v==="no") return "bad";
      return "";
    }
    function dutyOk(v){ return dutyTri(v)==="ok"; }
    function dutyCount(d){
      let tot=0, on=0;
      DUTY_CARS.forEach(car=>{
        ["_wash","_mats","_err","_dust","_trunk","_body"].forEach(s=>{ tot++; if(dutyOk(d[car.id+s])) on++; });
        tot+=2; if(d[car.id+"_km"]) on++; if(d[car.id+"_fuel"]) on++;
      });
      ["dc_light","dc_music","dc_price_hold","dc_desk","dm_body","dm_mats","dm_trunk","dm_dust","dm_wheel","dm_bat"].forEach(k=>{ tot++; if(dutyOk(d[k])) on++; });
      return {on, tot};
    }
    function dutyPaintProg(){
      const p=dutyCount(dutyRead());
      const pct=p.tot?Math.round(p.on*100/p.tot):0;
      const bar=document.querySelector(".cl-prog i");
      const lab=document.querySelector(".cl-prog span");
      if(bar) bar.style.width=pct+"%";
      if(lab) lab.textContent=pct+"%";
    }
    function dutyItem(k, label, raw){
      const st=dutyTri(raw);
      const cls=st==="bad"?" is-bad":(st==="ok"?" is-ok":"");
      return `<div class="cl-item${cls}">
        <span class="cl-lab">${label}</span>
        <span class="cl-pair">
          <button type="button" class="cl-sq ok${st==="ok"?" on":""}" data-duty-pick="${k}" data-val="ok" aria-label="Норма">✓</button>
          <button type="button" class="cl-sq bad${st==="bad"?" on":""}" data-duty-pick="${k}" data-val="bad" aria-label="Проблема">✕</button>
        </span>
        <input type="hidden" data-duty="${k}" value="${st}" />
      </div>`;
    }
    function dutyFuel(id, raw){
      const num=Number(raw);
      const n=raw===""||raw==null||Number.isNaN(num)?0:Math.max(0,Math.min(100,Math.round(num/10)*10));
      const ticks=[0,10,20,30,40,50,60,70,80,90,100].map(x=>`<i>${x}</i>`).join("");
      return `<div class="cl-fuel${n<=50?" is-low":""}"><div class="cl-fuel-top"><span>Топливо</span><b>${n}%</b></div><input type="range" min="0" max="100" step="10" data-duty="${id}_fuel" value="${n}" /><div class="cl-ticks">${ticks}</div></div>`;
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
        return `<article class="cl-car">
          <h3>${car.title}</h3>
          ${dutyItem(car.id+"_wash","Омывающая", d[car.id+"_wash"])}
          ${dutyItem(car.id+"_mats","Коврики и пороги", d[car.id+"_mats"])}
          ${dutyItem(car.id+"_err","Нет ошибок", d[car.id+"_err"])}
          ${dutyItem(car.id+"_dust","Нет пыли", d[car.id+"_dust"])}
          ${dutyItem(car.id+"_trunk","Багажник", d[car.id+"_trunk"])}
          ${dutyItem(car.id+"_body","Кузов", d[car.id+"_body"])}
          <div class="cl-nums">
            <label>Пробег<input data-duty="${car.id}_km" inputmode="numeric" value="${escape(d[car.id+"_km"]||"")}" /></label>
          </div>
          ${dutyFuel(car.id, d[car.id+"_fuel"])}
          <label class="cl-note-lab">Заметка
            <textarea data-duty="${car.id}_note" class="cl-note" rows="2" placeholder="Царапина, не заводится, помыть…">${escape(d[car.id+"_note"]||"")}</textarea>
          </label>
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
              ${dutyItem("dc_music","Музыка", d.dc_music)}
              ${dutyItem("dc_price_hold","Прайсхолдеры", d.dc_price_hold)}
              ${dutyItem("dc_desk","Столы", d.dc_desk)}
            </div>
            <label class="cl-note-lab">Заметка
              <textarea data-duty="dc_note" class="cl-note" rows="2" placeholder="Заметка по дилерскому центру">${escape(d.dc_note||"")}</textarea>
            </label></div>
            <div class="cl-box"><b>Шоурум</b><div class="cl-chips">
              ${dutyItem("dm_body","Кузов", d.dm_body)}
              ${dutyItem("dm_mats","Коврики", d.dm_mats)}
              ${dutyItem("dm_trunk","Багажник", d.dm_trunk)}
              ${dutyItem("dm_dust","Нет пыли", d.dm_dust)}
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
    function gibddMaskDob(el){
      const raw=String(el.value||"").replace(/\D/g,"").slice(0,8);
      let out=raw.slice(0,2);
      if(raw.length>2) out+="."+raw.slice(2,4);
      if(raw.length>4) out+="."+raw.slice(4,8);
      el.value=out;
    }
    function gibddLoad(){
      try{ return JSON.parse(localStorage.getItem("tenet-gibdd-v1")||"{}"); }catch(e){ return {}; }
    }
    function gibddSaveForm(){
      const o={vin:(document.getElementById("gVin")||{}).value||"", fio:(document.getElementById("gFio")||{}).value||"", dob:(document.getElementById("gDob")||{}).value||""};
      try{ localStorage.setItem("tenet-gibdd-v1", JSON.stringify(o)); }catch(e){}
      return o;
    }
    function gibddLinks(form){
      const vin=String((form&&form.vin)||"").replace(/\s+/g,"").toUpperCase();
      const fio=String((form&&form.fio)||"").trim();
      const dob=gibddDob((form&&form.dob)||"");
      const nm=gibddSplitFio(fio);
      const fssp="https://fssp.gov.ru/iss/ip?is%5Blast_name%5D="+encodeURIComponent(nm.last)+
        "&is%5Bfirst_name%5D="+encodeURIComponent(nm.first)+
        "&is%5Bpatronymic%5D="+encodeURIComponent(nm.mid)+
        "&is%5Bdate%5D="+encodeURIComponent(dob)+
        "&is%5Bregion_id%5D%5B0%5D=-1";
      const zalog="https://www.reestr-zalogov.ru/search/index?vin="+encodeURIComponent(vin);
      const bankrot="https://fedresurs.ru/bankrupts?searchString="+encodeURIComponent(fio);
      const bankrotOld="https://bankrot.fedresurs.ru/Debtors.search.aspx?Name="+encodeURIComponent(fio);
      return {vin,fio,dob,nm,fssp,zalog,bankrot,bankrotOld};
    }
    function gibddCopy(text){
      const t=String(text||"");
      try{ navigator.clipboard.writeText(t); }catch(e){
        const a=document.createElement("textarea"); a.value=t; document.body.appendChild(a); a.select(); try{ document.execCommand("copy"); }catch(x){} a.remove();
      }
    }
    function gibddOpen(kind){
      const L=gibddLinks(gibddSaveForm());
      if(kind==="zalog"){ gibddCopy(L.vin); window.open(L.zalog,"_blank","noopener"); }
      if(kind==="fssp"){ gibddCopy([L.nm.last,L.nm.first,L.nm.mid,L.dob].filter(Boolean).join(" ")); window.open(L.fssp,"_blank","noopener"); }
      if(kind==="bankrot"){ gibddCopy(L.fio); window.open(L.bankrot,"_blank","noopener"); window.open(L.bankrotOld,"_blank","noopener"); }
    }
    async function gibddFetch(url){
      const ctrl=typeof AbortController==="function"?new AbortController():null;
      const t=setTimeout(()=>{ try{ if(ctrl) ctrl.abort(); }catch(e){} }, 8000);
      try{
        const r=await fetch(url,{signal:ctrl?ctrl.signal:undefined, cache:"no-store"});
        const text=await r.text();
        return {ok:r.ok, status:r.status, text:text.slice(0,12000)};
      }catch(e){
        return {ok:false, status:0, text:String(e&&e.message||e)};
      }finally{ clearTimeout(t); }
    }
    function gibddParseZalog(text, vin){
      const t=String(text||"");
      if(/ничего не найдено|не найдено уведомлен/i.test(t)) return {hit:false, n:0, detail:"Записей по VIN нет"};
      const recs=t.match(/20\d{2}-\d{3}-\d+/g)||[];
      if(recs.length) return {hit:true, n:recs.length, detail:"Найдены уведомления: "+recs.slice(0,6).join(", ")};
      return {hit:null, n:0, detail:"Нужна капча на сайте. VIN скопирован."};
    }
    function gibddParseFssp(text){
      const t=String(text||"");
      if(/Ничего не найдено|не найдено исполнительн/i.test(t)) return {hit:false, n:0, detail:"ИП не найдено"};
      const ips=t.match(/\d+\/\d+\/\d+-?И?П?/g)||[];
      if(ips.length) return {hit:true, n:ips.length, detail:"Найдены ИП: "+ips.slice(0,8).join(", ")};
      return {hit:null, n:0, detail:"ФССП просит капчу. Регион — Все. ФИО и дата в ссылке."};
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
      return {hit:null, n:0, detail:"Откройте Федресурс — ФИО в поиске."};
    }
    function gibddVerdict(z,f,b){
      const bad=[];
      if(z&&z.hit) bad.push("залог");
      if(f&&f.hit) bad.push("ФССП");
      if(b&&b.hit) bad.push("банкротство");
      if(bad.length) return {ok:false, text:"Риск: "+bad.join(", ")};
      if([z,f,b].some(x=>x && x.hit===null)) return {ok:null, text:"Откройте реестры и пройдите капчу"};
      return {ok:true, text:"По автопроверке записей нет"};
    }
    async function gibddRun(){
      try{
        const form=gibddSaveForm();
        const L=gibddLinks(form);
        const box=document.getElementById("gOut");
        if(!L.vin || !L.nm.last || !L.nm.first || !L.dob){
          if(box) box.innerHTML=`<div class="note-box">Нужны VIN, фамилия, имя и дата рождения в формате ДД.ММ.ГГГГ.</div>`;
          return;
        }
        if(box) box.innerHTML=`<div class="note-box">Собираю сводку и ссылки с заполненными полями…</div>`;
        const [zRaw, fRaw, bRaw]=await Promise.all([
          gibddFetch(L.zalog),
          gibddFetch(L.fssp),
          gibddFetch("https://fedresurs.ru/backend/persons?limit=15&offset=0&searchString="+encodeURIComponent(L.fio))
        ]);
        const z=gibddParseZalog(zRaw.text, L.vin);
        const f=gibddParseFssp(fRaw.text);
        const b=gibddParseBankrot(bRaw.text, L.fio);
        const v=gibddVerdict(z,f,b);
        const pack={at:new Date().toISOString(), vin:L.vin, fio:L.fio, dob:L.dob, z, f, b, v, links:L};
        window.__gibddLast=pack;
        try{ localStorage.setItem("tenet-gibdd-last", JSON.stringify(pack)); }catch(e){}
        const row=(title, rec, kind)=>`<div class="bank-row"><span><b>${title}</b><br/><small>${escape(rec.detail||"")}</small></span><span class="pay">${rec.hit===true?"Есть":rec.hit===false?"Нет":"Сайт"}</span></div>
          <p class="calc-note"><button type="button" class="btn ghost" data-gopen="${kind}">Открыть и подставить данные</button></p>`;
        if(box) box.innerHTML=`<div class="card dc-result ${v.ok===true?"ok":v.ok===false?"bad":""}">
          <p class="eyebrow">Сводка</p>
          <div class="calc-out" style="font-size:22px">${escape(v.text)}</div>
          <p class="calc-note">${escape(L.vin)} · ${escape(L.fio)} · ${escape(L.dob)}</p>
          ${row("Реестр залогов · VIN", z, "zalog")}
          ${row("ФССП · все регионы", f, "fssp")}
          ${row("Реестр банкротов · ФИО", b, "bankrot")}
          <p class="calc-note">Сайты с другого домена не дают вставить значения скриптом. Открываем с параметрами в ссылке и копируем значение в буфер. Капчу всё равно нужно ввести руками.</p>
          <div class="who-line" style="margin-top:10px"><button type="button" class="btn ivory" id="gPdf">PDF</button></div>
        </div>`;
      }catch(err){
        const box=document.getElementById("gOut");
        if(box) box.innerHTML=`<div class="note-box">${escape(String(err&&err.message||err))}</div>`;
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
        <p class="lead">Дата — ДД.ММ.ГГГГ. «Открыть» передаёт VIN / ФИО / дату в ссылку реестра.</p>
        <div class="card">
          <div class="cl-bar">
            <label class="field" style="max-width:none"><span>VIN</span><input id="gVin" value="${escape(g.vin||"")}" placeholder="X7L…" /></label>
            <label class="field" style="max-width:none"><span>ФИО</span><input id="gFio" value="${escape(g.fio||"")}" placeholder="Иванов Иван Иванович" /></label>
            <label class="field" style="width:180px"><span>Дата рождения</span><input id="gDob" inputmode="numeric" maxlength="10" value="${escape(g.dob||"")}" placeholder="ДД.ММ.ГГГГ" /></label>
          </div>
          <div class="who-line"><button type="button" class="btn ivory" id="gRun">Проверить</button></div>
        </div>
        <div id="gOut"></div>`;
    }
    function dutyBind(){
      if(view==="duty"){
        const persist=()=>{ dutySave(dutyRead()); dutyPaintProg(); };
        document.querySelectorAll("[data-duty]").forEach(el=>{
          el.addEventListener("change", persist);
          el.addEventListener("input", persist);
        });
        document.querySelectorAll("[data-duty-pick]").forEach(btn=>{
          btn.addEventListener("click", ()=>{
            const row=btn.closest(".cl-item");
            if(!row) return;
            const k=btn.getAttribute("data-duty-pick");
            const val=btn.getAttribute("data-val");
            const hid=row.querySelector('input[type="hidden"]');
            const cur=hid?hid.value:"";
            const next=cur===val?"":val;
            if(hid) hid.value=next;
            row.classList.toggle("is-ok", next==="ok");
            row.classList.toggle("is-bad", next==="bad");
            row.querySelectorAll(".cl-sq").forEach(b=>b.classList.toggle("on", b.getAttribute("data-val")===next));
            persist();
          });
        });
        document.querySelectorAll(".cl-fuel input").forEach(el=>{
          el.addEventListener("input", ()=>{
            const box=el.closest(".cl-fuel");
            const b=box && box.querySelector("b");
            if(b) b.textContent=el.value+"%";
            if(box) box.classList.toggle("is-low", Number(el.value)<=50);
          });
        });
        dutyPaintProg();
      }
      if(view==="gibdd"){
        const dob=document.getElementById("gDob");
        if(dob){
          dob.addEventListener("input", ()=>{ gibddMaskDob(dob); gibddSaveForm(); });
          dob.addEventListener("blur", ()=>{ dob.value=gibddDob(dob.value); gibddSaveForm(); });
        }
        ["gVin","gFio"].forEach(id=>{
          const el=document.getElementById(id);
          if(el) el.addEventListener("change", gibddSaveForm);
        });
      }
    }
    if(!window.__dutyClick){
      window.__dutyClick=true;
      document.addEventListener("click", function(ev){
        const open=ev.target && ev.target.closest ? ev.target.closest("[data-gopen]") : null;
        if(open){ ev.preventDefault(); gibddOpen(open.getAttribute("data-gopen")); return; }
        const t=ev.target && ev.target.closest ? ev.target.closest("#gRun,#gPdf,#gPdfLast,#dutySave,#dutyPrint,#dutyClear") : ev.target;
        if(!t || !t.id) return;
        if(t.id==="gRun"){ ev.preventDefault(); gibddRun(); }
        if(t.id==="gPdf" || t.id==="gPdfLast"){ ev.preventDefault(); gibddPdf(window.__gibddLast); }
        if(t.id==="dutySave"){ ev.preventDefault(); dutySave(dutyRead()); dutyPaintProg(); t.textContent="Ок"; setTimeout(()=>t.textContent="Сохранить",900); }
        if(t.id==="dutyPrint"){ ev.preventDefault(); dutySave(dutyRead()); window.print(); }
        if(t.id==="dutyClear"){ ev.preventDefault(); localStorage.removeItem("tenet-duty-v1"); if(typeof render==="function") render(); }
      });
    }
