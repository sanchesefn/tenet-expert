    function mptParseProd(s){
      const m=String(s||"").match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if(!m) return "";
      return m[3]+"-"+("0"+m[2]).slice(-2)+"-"+("0"+m[1]).slice(-2);
    }
    function mptKind(line, iso){
      const d=String(iso||"");
      if(line==="4wd"){
        if(d<"2026-04-08") return "sub";
        if(d<="2026-04-15") return "mpt";
        if(d<="2026-05-07") return "sub";
        return "mpt";
      }
      if(d<"2026-03-14") return "sub";
      if(d<"2026-04-15") return "mpt";
      if(d<="2026-05-07") return "sub";
      return "mpt";
    }
    function mptLabel(k){ return k==="mpt"?"МПТ":"субс. бренда"; }
    function mptCars(iso){
      const list=(typeof STOCK!=="undefined"?STOCK:[]).filter(c=>c.model==="t7" && mptParseProd(c.prod)===iso);
      if(!list.length) return `<small>В снимке склада нет T7 с этой датой производства.</small>`;
      return list.map(c=>{
        const wd=String(c.trim||"").toLowerCase().includes("4wd")?"4WD":"2WD";
        return `<small>${escape(c.trim||"")} · ${escape(c.color||"")} · ${wd} · ${escape(c.vin)}</small>`;
      }).join("");
    }
    function mptCal(){
      const year=2026;
      const month=Math.min(12, Math.max(3, Number(typeof mptMonth==="number"?mptMonth:3)||3));
      const names=["","Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
      const first=new Date(year, month-1, 1);
      const startDow=(first.getDay()+6)%7;
      const dim=new Date(year, month, 0).getDate();
      const cells=[];
      for(let i=0;i<startDow;i++) cells.push(0);
      for(let d=1;d<=dim;d++) cells.push(d);
      while(cells.length%7) cells.push(0);
      const isoOf=d=>year+"-"+String(month).padStart(2,"0")+"-"+String(d).padStart(2,"0");
      const pick=typeof mptDay==="string"?mptDay:"";
      const months=[3,4,5,6,7];
      const head=months.map(mo=>`<button type="button" class="chip ${mo===month?"on":""}" data-mpt-month="${mo}">${names[mo]}</button>`).join("");
      const grid=`<div class="mpt-wd">${["пн","вт","ср","чт","пт","сб","вс"].map(x=>`<span>${x}</span>`).join("")}</div>`+
        `<div class="mpt-grid">${cells.map(d=>{
          if(!d) return `<span class="mpt-cell empty"></span>`;
          const iso=isoOf(d);
          const k2=mptKind("2wd", iso);
          const k4=mptKind("4wd", iso);
          const on=pick===iso?" on":"";
          return `<button type="button" class="mpt-cell${on}" data-mpt-day="${iso}" title="${d}.${String(month).padStart(2,"0")}.${year}">
            <b>${d}</b>
            <i class="${k2}" title="2WD"></i>
            <i class="${k4}" title="4WD"></i>
          </button>`;
        }).join("")}</div>`;
      const panel=pick
        ? `<div class="mpt-info">
            <b>${pick.slice(8)}.${pick.slice(5,7)}.${pick.slice(0,4)} · дата производства</b>
            <div class="mpt-pair"><span>T7 2WD</span><em class="${mptKind("2wd",pick)}">${mptLabel(mptKind("2wd",pick))}</em></div>
            <div class="mpt-pair"><span>T7 4WD</span><em class="${mptKind("4wd",pick)}">${mptLabel(mptKind("4wd",pick))}</em></div>
            ${mptCars(pick)}
          </div>`
        : `<div class="mpt-info"><span>Нажмите день — правило для 2WD и 4WD. Верхняя точка на дате — 2WD, нижняя — 4WD.</span></div>`;
      return `<div class="mpt-cal">
        <div class="mpt-legend"><span class="mpt-dot mpt"></span> МПТ <span class="mpt-dot sub"></span> субс. бренда</div>
        <div class="study-pick">${head}</div>
        ${grid}
        ${panel}
        <div class="mpt-keys">${TERMS_MPT.map(g=>`<small><b>${escape(g.line)}</b> · ${g.rows.map(r=>escape(r[0])+" — "+escape(r[1])).join("; ")}</small>`).join("")}</div>
      </div>`;
    }
