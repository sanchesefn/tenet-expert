    const CORP_VINS = new Set([
      "EDXFB32B2TE041658","EDXFB32B4TE041659","EDXFB32B1TE087336",
      "EDXFB32B3TE091114","EDXFD32B4TE092587","EDXFD32B4TE092590"
    ]);
    const FLEET_BFS = {
      t9p:{name:"Tiggo 9 Prime 4WD",rrc:4335000,dealer:3895000,an:546000,client:3814800,prem:166900,km:49918,tidy:3789000,sub:241000,do:70000,casco:80000},
      t9u:{name:"Tiggo 9 Ultra 4WD",rrc:4640000,dealer:4200000,an:591000,client:4083200,prem:209600,km:48033,tidy:4049000,sub:241000,do:70000,casco:80000},
      a8a:{name:"Arrizo 8 Active",rrc:2865000,dealer:2649000,an:376000,client:2492550,prem:213750,km:44057,tidy:2489000,sub:150000,do:70000,casco:80000},
      a8p:{name:"Arrizo 8 Prime",rrc:3060000,dealer:2699000,an:491000,client:2570400,prem:189800,km:49016,tidy:2569000,sub:150000,do:70000,casco:80000},
      a8u:{name:"Arrizo 8 Ultra Black",rrc:3275000,dealer:2899000,an:596000,client:2685500,prem:279000,km:48361,tidy:2679000,sub:150000,do:70000,casco:80000},
      t4p:{name:"T4 Prime 2025",rrc:2449000,dealer:2369000,an:200000,client:2253080,prem:164900,km:36803,tidy:2249000,sub:120000,do:70000,casco:80000},
      t4la:{name:"T4L Active",rrc:2329000,dealer:2234000,an:140000,client:2189260,prem:91320,km:37967,tidy:2189000,sub:100000,do:70000,casco:80000},
      t4lp:{name:"T4L Prime",rrc:2479000,dealer:2389000,an:230000,client:2255890,prem:182690,km:34992,tidy:2249000,sub:100000,do:70000,casco:80000},
      t7a:{name:"T7 Active 2WD",rrc:2785000,dealer:2645000,an:396000,client:2395100,prem:305600,km:40656,tidy:2389000,sub:150000,do:70000,casco:80000},
      t7p:{name:"T7 Prime 2WD",rrc:2985000,dealer:2840000,an:456000,client:2537250,prem:362450,km:42172,tidy:2529000,sub:150000,do:70000,casco:80000},
      t7a4:{name:"T7 Active 4WD",rrc:2990000,dealer:2860000,an:461000,client:2541500,prem:378300,km:38770,tidy:2529000,sub:150000,do:70000,casco:80000},
      t7p4:{name:"T7 Prime 4WD",rrc:3190000,dealer:3045000,an:491000,client:2711500,prem:397300,km:42049,tidy:2699000,sub:150000,do:70000,casco:80000},
      t8a:{name:"T8 Active 2WD",rrc:3099000,dealer:2999000,an:310000,client:2789100,prem:271880,km:50721,tidy:2789000,sub:130000,do:70000,casco:80000},
      t8p:{name:"T8 Prime 2WD",rrc:3299000,dealer:3149000,an:430000,client:2870130,prem:344850,km:53156,tidy:2869000,sub:130000,do:70000,casco:80000},
      t8p4:{name:"T8 Prime 4WD",rrc:3630000,dealer:3465000,an:481000,client:3158100,prem:379500,km:52049,tidy:3149000,sub:130000,do:70000,casco:80000},
      t8u4:{name:"T8 Ultra 4WD",rrc:3885000,dealer:3705000,an:536000,client:3379950,prem:402750,km:38320,tidy:3349000,sub:130000,do:70000,casco:80000}
    };
    const FLEET_TI = 50000;
    function kmIsCorp(vin){
      return CORP_VINS.has(String(vin||""));
    }
    function fleetOf(id){
      return FLEET_BFS[id] || FLEET_BFS.t9u;
    }
    function calcFleet(m){
      const f=fleetOf(m.id);
      const useFleet=kmVal("kmFleetDisc", false);
      const useMpt=kmVal("kmFleetMpt", false);
      const useTi=kmVal("kmUseTi", false);
      let price=f.rrc;
      const fleetCut=Math.max(0, f.rrc-(f.tidy||f.rrc));
      const steps=[];
      if(useFleet){ price=f.tidy; steps.push("флит −"+rub(fleetCut)); }
      if(useTi){ price=Math.max(0, price-FLEET_TI); steps.push("трейд-ин −"+rub(FLEET_TI)); }
      if(useMpt){ price=Math.round(price*0.9); steps.push("МПТ −10%"); }
      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===kmVin);
      return banner("Калькулятор","Флит · BFS Совкомбанк лизинг","TENET")+`
        <p class="lead">Корпоративный VIN. Стандартный кредит запрещён. Считаем BFS Совкомбанк лизинг.</p>
        ${kmChipGroups(m.id)}
        <div class="km-layout">
          <div class="card">
            <p class="eyebrow">BFS Совкомбанк лизинг · ${escape(f.name)}</p>
            ${car?`<p class="calc-note">${escape(car.vin)} · ${escape(car.color||"")} · ${escape(car.trim||"")}</p>`:""}
            <div class="note-box">Сбер / Альфа / Т-Банк нельзя. BFS: Каркаде, Т-Лизинг, Европлан, Сберлизинг, Газпромбанк Лизинг, Совкомбанк Лизинг.</div>
            <label class="check-row"><input id="kmFleetDisc" type="checkbox" ${useFleet?"checked":""} /> <span>Флит скидка ${rub(fleetCut)} · макс. выгода ${rub(f.an)}</span></label>
            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин ${rub(FLEET_TI)}</span></label>
            <label class="check-row"><input id="kmFleetMpt" type="checkbox" ${useMpt?"checked":""} /> <span>МПТ −10%</span></label>
            <div class="note-box" style="margin-top:14px">
              <p class="eyebrow" style="margin:0 0 6px">Итоговая цена</p>
              ${price<f.rrc?`<div class="calc-out" style="text-decoration:line-through;opacity:.42;margin-bottom:2px">${rub(f.rrc)} ₽</div>`:""}
              <div class="calc-out">${rub(Math.round(price))} ₽</div>
              <p class="calc-note">${steps.length?steps.join(" → "):"Базовая цена без скидок."}${useFleet?" · AP без тюнинга "+rub(f.tidy):""}</p>
            </div>
          </div>
          <div class="km-right">
            <div class="card">
              <p class="eyebrow">Лист «Флит» BFS</p>
              <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(f.rrc)} ₽</span></div>
              <div class="bank-row"><span>Макс. выгода AN</span><span class="pay">${rub(f.an)} ₽</span></div>
              <div class="bank-row"><span>Цена AP без тюнинга</span><span class="pay">${rub(f.tidy)} ₽</span></div>
              <div class="bank-row"><span>Субсидия TENET</span><span class="pay">${rub(f.sub)} ₽</span></div>
              <p class="calc-note">Порядок: флит скидка → трейд-ин → МПТ −10%.</p>
            </div>
            ${kmSideList(m)}
          </div>
        </div>
        <div class="card dc-result ok">
          <p class="eyebrow">Доходность ДЦ · КМ без НДС · флит BFS</p>
          <div class="calc-out">${rub(f.km)} ₽</div>
          <p class="calc-note">КМ с листа «Флит», блок BFS. Пауза банка, ориентир 16.09.</p>
        </div>`;
    }
