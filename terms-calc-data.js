    const TERMS_DATE = "10.09.2026";
    const KM_CORRIDOR = [
      {model:"T4",trim:"T4 2025",km:"−30 / 20",note:""},
      {model:"T4L",trim:"Active",km:"0 / 50",note:""},
      {model:"T4L",trim:"Prime",km:"0 / 50",note:""},
      {model:"T7",trim:"Все",km:"0 / 50",note:""},
      {model:"T8",trim:"Приоритет",km:"−20 / 0",note:"VIN из списка"},
      {model:"T8",trim:"Остальные",km:"0 / 30",note:""},
      {model:"T9",trim:"Приоритет",km:"−20 / 0",note:"VIN из списка"},
      {model:"T9",trim:"Остальные",km:"0 / 30",note:""},
      {model:"A8",trim:"Приоритет",km:"−30 / 0",note:"VIN из списка"},
      {model:"A8",trim:"Остальные",km:"0 / 30",note:""}
    ];
    const TERMS_BONUS = [
      {model:"T4",trim:"T4 2025",bonus:"3%"},
      {model:"T4L",trim:"Active",bonus:"1%"},
      {model:"T4L",trim:"Prime",bonus:"3%"},
      {model:"T7",trim:"Любые",bonus:"2%"},
      {model:"T8",trim:"2WD",bonus:"2%"},
      {model:"T8",trim:"4WD",bonus:"3%"},
      {model:"T9",trim:"Prime",bonus:"0%"},
      {model:"T9",trim:"Ultra",bonus:"2%"},
      {model:"A8",trim:"Любые",bonus:"2%"}
    ];
    const TERMS_MPT = [
      {line:"T7 2WD",rows:[["до 14.03","субс. бренда"],["с 14.03 до 15.04","МПТ"],["с 15.04 до 7.05","субс. бренда"],["с 8.05 и далее","МПТ"]]},
      {line:"T7 4WD",rows:[["до 7.04","субс. бренда"],["с 8.04 до 15.04","МПТ"],["с 16.04 до 7.05","субс. бренда"],["с 8.05 и далее","МПТ"]]}
    ];
    const TERMS_INV = [
      {model:"T4L",trim:"Active",price:"2 200 нал, 2 150 ТИ"},
      {model:"T4L",trim:"Prime",price:"2 300 нал, 2 250 ТИ"},
      {model:"T7",trim:"Prime 2WD",price:"2 550 нал, 2 450 ТИ"},
      {model:"T8",trim:"Prime 4WD",price:"3 100 нал, 3 000 ТИ"},
      {model:"T8",trim:"Ultra 4WD",price:"3 300 нал, 3 200 ТИ"}
    ];
    const TERMS_PRIO = [
      {model:"T4",vin:"EDEED31B1SE053704",trim:"Prime 4WD",year:"2025",color:"Белый",extra:"Сидоров",pay:500,bonus:1000},
      {model:"T7",vin:"EDXFB32B4TE041659",trim:"Active",year:"2026",color:"Чёрный",extra:"",pay:500,bonus:1000},
      {model:"T7",vin:"EDXFB32B2TE041658",trim:"Active",year:"2026",color:"Чёрный",extra:"",pay:500,bonus:1000},
      {model:"T7",vin:"EDXFB32B7TE062327",trim:"Active",year:"2026",color:"Чёрный",extra:"Антихром",pay:500,bonus:1000},
      {model:"T8",vin:"EDXGD34B1TE022143",trim:"Prime 4WD",year:"2026",color:"Светло-серый",extra:"",pay:500,bonus:2000},
      {model:"T8",vin:"EDXGD34B6TE031162",trim:"Prime 4WD",year:"2026",color:"Чёрный",extra:"",pay:500,bonus:2000},
      {model:"T8",vin:"EDXGD34B3TE031815",trim:"Ultra 4WD",year:"2026",color:"Белый",extra:"",pay:500,bonus:2000},
      {model:"Tiggo 9",vin:"EDEDD24B2SG003755",trim:"Ultra",year:"2025",color:"Светло-серый",extra:"",pay:500,bonus:3000},
      {model:"Tiggo 9",vin:"EDEDD24B3SG003926",trim:"Ultra",year:"2025",color:"Матовый",extra:"",pay:500,bonus:3000},
      {model:"Tiggo 9",vin:"EDEDD24B1SG002595",trim:"Ultra",year:"2025",color:"Чёрный",extra:"Новиков",pay:500,bonus:0},
      {model:"Arrizo 8",vin:"LVVDC21B7SD594110",trim:"Prime",year:"2025",color:"Белый",extra:"",pay:500,bonus:3000},
      {model:"Arrizo 8",vin:"LVVDC21B0SD594112",trim:"Prime",year:"2025",color:"Белый",extra:"",pay:500,bonus:3000},
      {model:"Arrizo 8",vin:"LVVDC21B2SDJ34062",trim:"Prime",year:"2025",color:"Чёрный",extra:"",pay:500,bonus:3000},
      {model:"8 Pro Max",vin:"LVTDD24B5RD409189",trim:"Ultimate",year:"2024",color:"Белый",extra:"ТЕСТ · 2 850",pay:500,bonus:10000}
    ];
    const PRIO_VINS = new Set(TERMS_PRIO.map(x=>x.vin));
    const KM_DC_DEF = 100000;
    const KM_BANKS = [
      {id:"sber", name:"Сбер", rate:19.9},
      {id:"sovcom", name:"Совкомбанк", rate:18.9},
      {id:"alfa", name:"Альфа", rate:20.5},
      {id:"tbank", name:"Т-Банк", rate:21.9}
    ];
