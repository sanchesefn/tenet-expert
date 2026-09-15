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
      {id:"a8",title:"ARRIZO 8"},
      {id:"t7",title:"TENET T7"},
      {id:"t9",title:"TIGGO 9"}
    ];
    function dutyCheck(k, label, on){
      return `<label class="check-row duty-check"><input type="checkbox" data-duty="${k}" ${on?"checked":""} /> <span>${label}</span></label>`;
    }
    function dutyField(k, label, val, mode){
      return `<label class="field" style="max-width:none"><span>${label}</span><input data-duty="${k}" inputmode="${mode||"text"}" value="${escape(val||"")}" /></label>`;
    }
    function duty(){
      if(needAuth()) return login();
      const d=dutyLoad();
      if(!d.date) d.date=dutyToday();
      if(!d.manager && state && state.display) d.manager=state.display;
      const cars=DUTY_CARS.map(car=>{
        const body=d[car.id+"_body"]||"ok";
        return `<div class="card duty-car">
          <p class="eyebrow">${car.title}</p>
          <div class="duty-grid">
            ${dutyCheck(car.id+"_wash","Омывающая жидкость", d[car.id+"_wash"])}
            <label class="field" style="max-width:none"><span>Чистый кузов</span>
              <select data-duty="${car.id}_body">
                <option value="ok" ${body==="ok"?"selected":""}>да</option>
                <option value="pm" ${body==="pm"?"selected":""}>±</option>
                <option value="no" ${body==="no"?"selected":""}>нет</option>
              </select>
            </label>
            ${dutyCheck(car.id+"_mats","Чистые коврики и пороги", d[car.id+"_mats"])}
            ${dutyCheck(car.id+"_err","Нет ошибок", d[car.id+"_err"])}
            ${dutyField(car.id+"_km","Пробег", d[car.id+"_km"], "numeric")}
            ${dutyField(car.id+"_fuel","Уровень топлива, %", d[car.id+"_fuel"], "numeric")}
            ${dutyCheck(car.id+"_dust","Нет пыли на панели и дисплеях", d[car.id+"_dust"])}
            ${dutyCheck(car.id+"_trunk","Чистый багажник", d[car.id+"_trunk"])}
          </div>
        </div>`;
      }).join("");
      return banner("Чек-лист дежурного","Заполняется на смене · сохраняется на этом компьютере","TENET")+`
        <div class="duty-sheet">
          <div class="card duty-head">
            ${dutyField("manager","Менеджер", d.manager)}
            ${dutyField("date","Дата", d.date)}
          </div>
          <h2>Тестовые автомобили</h2>
          ${cars}
          <div class="card">${dutyField("note","Заметки", d.note)}</div>
          <h2>ДЦ</h2>
          <div class="card duty-grid">
            ${dutyCheck("dc_light","Включен свет", d.dc_light)}
            ${dutyCheck("dc_avito","Авито объявления активны", d.dc_avito)}
            ${dutyCheck("dc_music","Музыка включена", d.dc_music)}
            ${dutyCheck("dc_price_avito","Актуальные цены на Авито", d.dc_price_avito)}
            ${dutyCheck("dc_price_hold","Актуальные цены на прайсхолдерах", d.dc_price_hold)}
            ${dutyCheck("dc_desk","Нет пыли на столах", d.dc_desk)}
            ${dutyCheck("dc_trash","Нет мусора и лишних бумаг", d.dc_trash)}
          </div>
          <h2>Демонстрационные автомобили</h2>
          <div class="card duty-grid">
            ${dutyCheck("dm_body","Чистый кузов", d.dm_body)}
            ${dutyCheck("dm_mats","Чистые коврики и пороги", d.dm_mats)}
            ${dutyCheck("dm_trunk","Чистый багажник", d.dm_trunk)}
            ${dutyCheck("dm_dust","Отсутствует пыль на панели и дисплеях", d.dm_dust)}
            ${dutyCheck("dm_wheel","Начерненные колеса", d.dm_wheel)}
            ${dutyCheck("dm_bat","Заряжен аккумулятор", d.dm_bat)}
          </div>
          <div class="card">${dutyField("sign","Подпись дежурного", d.sign||d.manager)}</div>
          <div class="who-line">
            <button type="button" class="btn ivory" id="dutySave">Сохранить</button>
            <button type="button" class="btn ghost" id="dutyPrint">Печать</button>
            <button type="button" class="btn ghost" id="dutyClear">Очистить</button>
          </div>
        </div>`;
    }
    function gibdd(){
      if(needAuth()) return login();
      const links=[
        {t:"ФССП",u:"https://fssp.gov.ru/",n:"Исполнительные производства по клиенту и собственнику трейд-ин."},
        {t:"Реестр залогов",u:"https://www.reestr-zalogov.ru/search",n:"Проверка VIN и собственника перед приёмом в трейд-ин."},
        {t:"Реестр банкротов",u:"https://bankrot.fedresurs.ru/",n:"Не принимаем авто в трейд-ин, если банкротство было в течение последних 3 лет."}
      ];
      return banner("Проверки ГИБДД","Трейд-ин · официальные реестры","TENET")+`
        <p class="lead">Перед приёмом авто пройти три реестра. Ссылки открываются в новой вкладке.</p>
        <div class="terms-cards">${links.map(x=>`<article class="term-card">
          <b>${escape(x.t)}</b>
          <small>${escape(x.n)}</small>
          <p class="calc-note" style="margin-top:10px"><a href="${x.u}" target="_blank" rel="noopener">${x.u.replace("https://","")}</a></p>
        </article>`).join("")}</div>`;
    }
    function dutyBind(){
      if(view!=="duty") return;
      const persist=()=>dutySave(dutyRead());
      document.querySelectorAll("[data-duty]").forEach(el=>{
        el.addEventListener("change", persist);
        el.addEventListener("input", persist);
      });
      const save=document.getElementById("dutySave");
      if(save) save.onclick=()=>{ dutySave(dutyRead()); save.textContent="Сохранено"; setTimeout(()=>save.textContent="Сохранить",1200); };
      const pr=document.getElementById("dutyPrint");
      if(pr) pr.onclick=()=>{ dutySave(dutyRead()); window.print(); };
      const cl=document.getElementById("dutyClear");
      if(cl) cl.onclick=()=>{ localStorage.removeItem("tenet-duty-v1"); render(); };
    }
