    async function tryUnlock(code){
      const c=(code||"").trim().toUpperCase();
      if(!hasExam1()){ pinErr="Сначала аттестация №1."; render(); return; }
      if(expertLocked()){ pinErr="90%+ уже засчитаны. Пересдача не нужна."; render(); return; }
      if(hasExam2()){ pinErr="Пересдача по этой модели уже использована."; render(); return; }
      let ok = c===PIN;
      if(!ok){
        await refreshLocks();
        const pass=(remoteLocks||[]).find(x=>x && x.type==="pass" && !x.used && x.surname===norm(state.surname) && x.model===model && String(x.code||"").toUpperCase()===c);
        if(pass){
          pass.used=true;
          pass.usedAt=new Date().toISOString();
          pass.usedBy=state.display;
          await upsertPass(pass);
          ok=true;
        }
      }
      if(!ok){ pinErr="Неверный или уже использованный код."; render(); return; }
      state.unlock[lockKey(state.surname, model, 2)]=true; save(); pinErr=""; render();
    }
    async function upsertPass(pass){
      for(let i=0;i<3;i++){
        try{
          const list=await pullList();
          const idx=list.findIndex(x=>x && x.type==="pass" && x.surname===pass.surname && x.model===pass.model && String(x.code||"").toUpperCase()===String(pass.code||"").toUpperCase());
          if(idx>=0) list[idx]=Object.assign({}, list[idx], pass);
          else list.push(pass);
          const r=await withTimeout(fetch("https://rentry.co/api/edit/"+CLOUD_ID,{
            method:"POST",
            headers:{"Content-Type":"application/x-www-form-urlencoded"},
            body:cloudForm({edit_code:CLOUD_KEY, text:JSON.stringify(list)})
          }),10000);
          if(!r.ok) throw new Error("edit");
          remoteLocks=list; syncOk=true; return;
        }catch(e){ if(i===2) syncOk=false; }
      }
    }
