    const CORP_VINS = new Set([
      "EDEDD24BXSG010341","EDEDD24B2SG003755","EDEDD24B3SG003926",
      "LVVDC21B0SD594112","LVVDC21B7SD594110","LVVDC21B2SDJ34062"
    ]);
    const FLEET_BFS = {
      t9p:{name:"Tiggo 9 Prime 4WD",rrc:4335000,dealer:3895000,disc:0.12,client:3814800,prem:166900,km:49918,tidy:3789000,sub:241000,mkt:3548000,do:70000,casco:80000,turnkey:3698000},
      t9u:{name:"Tiggo 9 Ultra 4WD",rrc:4640000,dealer:4200000,disc:0.12,client:4083200,prem:209600,km:48033,tidy:4049000,sub:241000,mkt:3808000,do:70000,casco:80000,turnkey:3958000},
      a8a:{name:"Arrizo 8 Active",rrc:2865000,dealer:2649000,disc:0.13,client:2492550,prem:213750,km:44057,tidy:2489000,sub:150000,mkt:2339000,do:70000,casco:80000,turnkey:2489000},
      a8p:{name:"Arrizo 8 Prime",rrc:3060000,dealer:2699000,disc:0.16,client:2570400,prem:189800,km:49016,tidy:2569000,sub:150000,mkt:2419000,do:70000,casco:80000,turnkey:2569000},
      a8u:{name:"Arrizo 8 Ultra Black",rrc:3275000,dealer:2899000,disc:0.18,client:2685500,prem:279000,km:48361,tidy:2679000,sub:150000,mkt:2529000,do:70000,casco:80000,turnkey:2679000},
      t4p:{name:"T4 Prime 2025",rrc:2449000,dealer:2369000,disc:0.08,client:2253080,prem:164900,km:36803,tidy:2249000,sub:120000,mkt:2129000,do:70000,casco:80000,turnkey:2279000},
      t4la:{name:"T4L Active",rrc:2329000,dealer:2234000,disc:0.06,client:2189260,prem:91320,km:37967,tidy:2189000,sub:100000,mkt:2089000,do:70000,casco:80000,turnkey:2239000},
      t4lp:{name:"T4L Prime",rrc:2479000,dealer:2389000,disc:0.09,client:2255890,prem:182690,km:34992,tidy:2249000,sub:100000,mkt:2149000,do:70000,casco:80000,turnkey:2299000},
      t7a:{name:"T7 Active 2WD",rrc:2785000,dealer:2645000,disc:0.14,client:2395100,prem:305600,km:40656,tidy:2389000,sub:150000,mkt:2239000,do:70000,casco:80000,turnkey:2389000},
      t7p:{name:"T7 Prime 2WD",rrc:2985000,dealer:2840000,disc:0.15,client:2537250,prem:362450,km:42172,tidy:2529000,sub:150000,mkt:2379000,do:70000,casco:80000,turnkey:2529000},
      t7a4:{name:"T7 Active 4WD",rrc:2990000,dealer:2860000,disc:0.15,client:2541500,prem:378300,km:38770,tidy:2529000,sub:150000,mkt:2379000,do:70000,casco:80000,turnkey:2529000},
      t7p4:{name:"T7 Prime 4WD",rrc:3190000,dealer:3045000,disc:0.15,client:2711500,prem:397300,km:42049,tidy:2699000,sub:150000,mkt:2549000,do:70000,casco:80000,turnkey:2699000},
      t8a:{name:"T8 Active 2WD",rrc:3099000,dealer:2999000,disc:0.10,client:2789100,prem:271880,km:50721,tidy:2789000,sub:130000,mkt:2659000,do:70000,casco:80000,turnkey:2809000},
      t8p:{name:"T8 Prime 2WD",rrc:3299000,dealer:3149000,disc:0.13,client:2870130,prem:344850,km:53156,tidy:2869000,sub:130000,mkt:2739000,do:70000,casco:80000,turnkey:2889000},
      t8p4:{name:"T8 Prime 4WD",rrc:3630000,dealer:3465000,disc:0.13,client:3158100,prem:379500,km:52049,tidy:3149000,sub:130000,mkt:3019000,do:70000,casco:80000,turnkey:3169000},
      t8u4:{name:"T8 Ultra 4WD",rrc:3885000,dealer:3705000,disc:0.13,client:3379950,prem:402750,km:38320,tidy:3349000,sub:130000,mkt:3219000,do:70000,casco:80000,turnkey:3369000}
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
      const useTi=kmVal("kmUseTi", false);
      const client=Math.max(0, f.client-(useTi?FLEET_TI:0));
      const mkt=Math.max(0, f.mkt-(useTi?FLEET_TI:0));
      const turnkey=Math.max(0, f.turnkey-(useTi?FLEET_TI:0));
      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===kmVin);
      return banner("Калькулятор","Флит · BFS Совкомбанк лизинг","TENET")+`
        <p class="lead">Корпоративный VIN. Стандартный кредит запрещён. Считаем только BFS Совкомбанк лизинг из листа «Флит».</p>
        ${kmChipGroups(m.id)}
        <div class="km-layout">
          <div class="card">
            <p class="eyebrow">BFS Совкомбанк лизинг · ${escape(f.name)}</p>
            ${car?`<p class="calc-note">${escape(car.vin)} · ${escape(car.color||"")} · ${escape(car.trim||"")}</p>`:""}
            <div class="note-box">Стандартный кредит, Сбер / Альфа / Т-Банк — нельзя. Лизинговые компании BFS: Каркаде, Т-Лизинг, Европлан, Сберлизинг, Газпромбанк Лизинг, Совкомбанк Лизинг.</div>
            <div class="note-box">Пауза: стройка на стороне банка, ориентир 16.09.</div>
            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин флит −${rub(FLEET_TI)}</span></label>
            <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(f.rrc)} ₽</span></div>
            <div class="bank-row"><span>Счёт ДЦ</span><span class="pay">${rub(f.dealer)} ₽</span></div>
            <div class="bank-row"><span>Скидка BFS ${Math.round(f.disc*100)}%</span><span class="pay">${rub(Math.round(f.rrc*f.disc))} ₽</span></div>
            <div class="note-box" style="margin-top:14px">
              <p class="eyebrow" style="margin:0 0 6px">Цена для клиента</p>
              ${useTi?`<div class="calc-out" style="text-decoration:line-through;opacity:.42;margin-bottom:2px">${rub(f.client)} ₽</div>`:""}
              <div class="calc-out">${rub(Math.round(client))} ₽</div>
              <p class="calc-note">Маркетинговая ${rub(Math.round(mkt))} · под ключ ${rub(Math.round(turnkey))} (Д/О ${rub(f.do)} + каско ${rub(f.casco)})</p>
            </div>
          </div>
          <div class="km-right">
            <div class="card">
              <p class="eyebrow">Разбор BFS</p>
              <div class="bank-row"><span>Субсидия TENET</span><span class="pay">${rub(f.sub)} ₽</span></div>
              <div class="bank-row"><span>Премия</span><span class="pay">${rub(f.prem)} ₽</span></div>
              <div class="bank-row"><span>Без учёта тюнинга</span><span class="pay">${rub(f.tidy)} ₽</span></div>
              <div class="bank-row"><span>Д/О / каско</span><span class="pay">${rub(f.do)} / ${rub(f.casco)}</span></div>
              <p class="calc-note">Субсидия TENET и МПТ не суммируются. КМ в файле уже посчитан для этой схемы.</p>
            </div>
            ${kmSideList(m)}
          </div>
        </div>
        <div class="card dc-result ok">
          <p class="eyebrow">Доходность ДЦ · КМ без НДС · флит BFS</p>
          <div class="calc-out">${rub(f.km)} ₽</div>
          <p class="calc-note">Цифра с листа «Флит», блок BFS Совкомбанк лизинг.${useTi?" Трейд-ин −50 000 к цене клиента.":""}</p>
        </div>`;
    }
