      const askPin=document.getElementById("askPin");
      if(askPin) askPin.onclick=async()=>{
        const v=(document.getElementById("surname").value||"").trim();
        const err=document.getElementById("loginErr");
        if(v.length<2){ err.textContent="Сначала введите фамилию, затем запросите код."; return; }
        err.textContent="Отправляю запрос РОП…";
        try{
          await refreshLocks();
          const list=await pullList();
          const rec={type:"pin_request", kind:"login", surname:norm(v), display:v.replace(/\s+/g," "), at:new Date().toISOString(), tgSent:false};
          const i=list.findIndex(x=>x && x.type==="pin_request" && x.kind==="login" && x.surname===rec.surname && !x.tgSent);
          if(i>=0) list[i]=rec; else list.push(rec);
          const r=await withTimeout(fetch("https://rentry.co/api/edit/"+CLOUD_ID,{
            method:"POST",
            headers:{"Content-Type":"application/x-www-form-urlencoded"},
            body:cloudForm({edit_code:CLOUD_KEY, text:JSON.stringify(list)})
          }),10000);
          if(!r.ok) throw new Error("edit");
          remoteLocks=list; syncOk=true;
          err.textContent="Запрос ушёл РОП в Telegram. Код придёт ему — он назовёт его вам.";
        }catch(e){
          err.textContent="Не удалось отправить запрос. Скажите РОП лично.";
        }
      };
