    function study(){
      if(!state.surname) return login();
      if(!canStudy()){
        return `<p class="eyebrow">Справочник</p><h2 class="study-title">Пока закрыт</h2><p class="study-sub">Откроется после аттестации №1. Аргументаторы PDF — внутри справочника, вкладка «Материалы».</p>
        <button class="btn ivory" data-go="home">Назад</button>`;
      }
      state.seenStudy[model]=true; save();
      const m=MODELS[model]||MODELS.t4l;
      const s=STUDY[model];
      const tabs=[["tech","Техника"],["trims","Комплектации"],["price","Цены"],["rival","Конкуренты"],["safety","Безопасность"],["docs","Материалы"]];
      const body = studyTab==="docs"
        ? (typeof docsCards==="function"?docsCards():"")
        : `<div class="card study-body">${(s && (s[studyTab]||s.tech)) || ""}</div>${typeof docsStrip==="function"?docsStrip():""}`;
      return `<p class="eyebrow">${m.brand} · справочник</p>
        <h2 class="study-title">${m.name}</h2>
        <p class="study-sub">${m.rivals}</p>
        <div class="study-pick">${Object.values(MODELS).filter(x=>x.id!=="t7l").map(x=>`<button class="chip ${x.id===model?"on":""}" data-model="${x.id}">${x.name}</button>`).join("")}</div>
        <div class="tabs">${tabs.map(([id,l])=>`<button class="${studyTab===id?"on":""}" data-tab="${id}">${l}</button>`).join("")}</div>
        ${body}
        <p style="color:var(--muted);font-size:13px;margin-top:10px;line-height:1.45">${needsRetake()?"Просмотр засчитан для допуска к пересдаче.":expertLocked()?"Справочник открыт. Тренировки по желанию.":"Справочник открыт после аттестации."} PDF — вкладка «Материалы», «Открыть» / «Скачать».</p>
        <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
          ${canPractice()?`<button class="btn ghost" data-practice="all">Тренировка</button>`:needsRetake()?`<span class="chip">Тренировка — после кода РОП</span>`:""}
          <button class="btn ghost" data-go="home">Назад</button>
        </div>`;
    }
