    function splitStudy(raw){
      const text=String(raw||"").trim();
      if(!text) return "";
      const rivalSplit=text.split(/(?=(?:Haval |Geely |Belgee |Changan |Jaecoo |Jetour |Tank |GAC |Volga |Jolion:|Arrizo ))/);
      if(rivalSplit.filter(x=>x.trim()).length>1){
        return rivalSplit.map(x=>x.trim()).filter(Boolean).map(block=>{
          const i=block.indexOf(":");
          const name=i>0?block.slice(0,i).trim():block;
          const rest=i>0?block.slice(i+1).trim():"";
          return `<article class="spec-card"><h3>${escape(name)}</h3>${rest?`<p>${escape(rest)}</p>`:""}</article>`;
        }).join("");
      }
      const bits=text.split(/(?<=\.)\s+/).map(x=>x.trim()).filter(Boolean);
      return `<div class="spec-card">${bits.map(b=>`<p class="spec-line">${escape(b)}</p>`).join("")}</div>`;
    }
    function study(){
      if(!state.surname) return login();
      if(!canStudy()){
        return `<p class="eyebrow">Справочник</p><h2 class="study-title">Пока закрыт</h2><p class="study-sub">Откроется после аттестации №1 по выбранной модели.</p><button class="btn ivory" data-go="home">Назад</button>`;
      }
      state.seenStudy[model]=true; save();
      const m=MODELS[model]||MODELS.t4l;
      const s=STUDY[model];
      const tabs=[["tech","Техника"],["trims","Комплектации"],["price","Цены"],["rival","Конкуренты"],["safety","Безопасность"]];
      return `<p class="eyebrow">${m.brand} · справочник</p>
        <h2 class="study-title">${m.name}</h2>
        <div class="study-pick">${Object.values(MODELS).map(x=>`<button class="chip ${x.id===model?"on":""}" data-model="${x.id}">${x.name}</button>`).join("")}</div>
        <div class="tabs">${tabs.map(([id,l])=>`<button class="${studyTab===id?"on":""}" data-tab="${id}">${l}</button>`).join("")}</div>
        ${splitStudy(s[studyTab]||s.tech)}
        <p style="color:var(--muted);font-size:13px;margin-top:10px;line-height:1.45">${needsRetake()?"Просмотр засчитан для допуска к пересдаче.":expertLocked()?"Справочник открыт. Тренировки по желанию.":"Справочник открыт после аттестации."}</p>
        <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
          ${canPractice()?`<button class="btn ghost" data-practice="all">Тренировка</button>`:needsRetake()?`<span class="chip">Тренировка — после кода РОП</span>`:""}
          <button class="btn ghost" data-go="home">Назад</button>
        </div>`;
    }
