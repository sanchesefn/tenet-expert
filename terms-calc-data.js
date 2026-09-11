    const TERMS_DATE = "11.09.2026";
    const KM_CORRIDOR = [
      {model:"T4L",trim:"Все",km:"0 / 50",note:""},
      {model:"T7",trim:"Все",km:"30 / 80",note:"Антихром 0/50"},
      {model:"T8",trim:"Приоритет",km:"−30 / 0",note:"VIN из списка"},
      {model:"T8",trim:"Остальные",km:"0 / 30",note:""},
      {model:"T9",trim:"Все",km:"−30 / 0",note:""},
      {model:"A8",trim:"Все",km:"−30 / 0",note:""}
    ];
    const TERMS_BONUS = [
      {model:"T4L",trim:"Все",bonus:"2%"},
      {model:"T7",trim:"Любые",bonus:"2%"},
      {model:"T8",trim:"Все",bonus:"2%"},
      {model:"T9",trim:"Все",bonus:"2%"},
      {model:"A8",trim:"Любые",bonus:"2%"}
    ];
    const TERMS_MPT = [
      {line:"T7 2WD",rows:[
        ["до 14.03", "субс. бренда"],
        ["с 14.03 до 15.04", "МПТ"],
        ["с 16.04 до 7.05", "субс. бренда"],
        ["с 8.05 и далее", "МПТ"]
      ]},
      {line:"T7 4WD",rows:[
        ["до 7.04", "субс. бренда"],
        ["с 8.04 до 15.04", "МПТ"],
        ["с 16.04 до 7.05", "субс. бренда"],
        ["с 8.05 и далее", "МПТ"]
      ]}
    ];
    const TERMS_INV = [
      {model:"T4L",trim:"Active",price:"2 200 нал, 2 150 ТИ"},
      {model:"T4L",trim:"Prime",price:"2 300 нал, 2 250 ТИ"},
      {model:"T7",trim:"Prime 2WD",price:"2 550 нал, 2 450 ТИ"},
      {model:"T8",trim:"Prime 4WD",price:"3 100 нал, 3 000 ТИ"},
      {model:"T8",trim:"Ultra 4WD",price:"3 300 нал, 3 200 ТИ"}
    ];
    const TERMS_PRIO = [
      {model:"T4",vin:"EDEED31B1SE053704",trim:"Prime 4WD",year:"2025",color:"Белый",extra:"Сидоров",pay:500,bonus:1000,sold:true,seller:"Сидоров"},
      {model:"T7",vin:"EDXFB32B4TE041659",trim:"Active",year:"2026",color:"Чёрный",extra:"",pay:500,bonus:1000},
      {model:"T7",vin:"EDXFB32B2TE041658",trim:"Active",year:"2026",color:"Чёрный",extra:"",pay:500,bonus:1000},
      {model:"T7",vin:"EDXFB32B7TE062327",trim:"Active",year:"2026",color:"Чёрный",extra:"Антихром",pay:500,bonus:1000},
      {model:"T8",vin:"EDXGD34B1TE022143",trim:"Prime 4WD",year:"2026",color:"Светло-серый",extra:"",pay:500,bonus:2000},
      {model:"T8",vin:"EDXGD34B6TE031162",trim:"Prime 4WD",year:"2026",color:"Чёрный",extra:"",pay:500,bonus:2000},
      {model:"T8",vin:"EDXGD34B3TE031815",trim:"Ultra 4WD",year:"2026",color:"Белый",extra:"",pay:500,bonus:2000},
      {model:"Tiggo 9",vin:"EDEDD24B2SG003755",trim:"Ultra",year:"2025",color:"Светло-серый",extra:"",pay:500,bonus:3000},
      {model:"Tiggo 9",vin:"EDEDD24B3SG003926",trim:"Ultra",year:"2025",color:"Матовый",extra:"",pay:500,bonus:3000},
      {model:"Tiggo 9",vin:"EDEDD24B1SG002595",trim:"Ultra",year:"2025",color:"Чёрный",extra:"Новиков",pay:500,bonus:0,sold:true,seller:"Новиков"},
      {model:"Arrizo 8",vin:"LVVDC21B7SD594110",trim:"Prime",year:"2025",color:"Белый",extra:"",pay:500,bonus:3000},
      {model:"Arrizo 8",vin:"LVVDC21B0SD594112",trim:"Prime",year:"2025",color:"Белый",extra:"",pay:500,bonus:3000},
      {model:"Arrizo 8",vin:"LVVDC21B2SDJ34062",trim:"Prime",year:"2025",color:"Чёрный",extra:"",pay:500,bonus:3000},
      {model:"8 Pro Max",vin:"LVTDD24B5RD409189",trim:"Ultimate",year:"2024",color:"Белый",extra:"ТЕСТ // 2850",pay:500,bonus:10000}
    ];
    const KM_MODELS = [
      {id:"t4p",brand:"TENET",name:"T4 Prime 2025",stock:"t4",rrc:2449000,dealer:2369000,ti:100000,tiBack:80000,cr:0,crBack:0,bonus:0.03,vat:1.22,fee:0.01,kmMin:-30,kmMax:20,prioMin:-30,prioMax:20},
      {id:"t4la",brand:"TENET",name:"T4L Active",stock:"t4l",rrc:2329000,dealer:2234000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50},
      {id:"t4lp",brand:"TENET",name:"T4L Prime",stock:"t4l",rrc:2479000,dealer:2389000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:50,prioMin:0,prioMax:50},
      {id:"t7a",brand:"TENET",name:"T7 Active 2WD",stock:"t7",rrc:2785000,dealer:2645000,ti:180000,tiBack:130000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:30,kmMax:80,prioMin:30,prioMax:80},
      {id:"t7p",brand:"TENET",name:"T7 Prime 2WD",stock:"t7",rrc:2985000,dealer:2840000,ti:200000,tiBack:150000,cr:50000,crBack:30000,bonus:0.02,vat:1.22,fee:0.01,kmMin:30,kmMax:80,prioMin:30,prioMax:80},
      {id:"t7a4",brand:"TENET",name:"T7 Active 4WD",stock:"t7",rrc:2990000,dealer:2860000,ti:130000,tiBack:90000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:30,kmMax:80,prioMin:30,prioMax:80},
      {id:"t7p4",brand:"TENET",name:"T7 Prime 4WD",stock:"t7",rrc:3190000,dealer:3045000,ti:150000,tiBack:110000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:30,kmMax:80,prioMin:30,prioMax:80},
      {id:"t8a",brand:"TENET",name:"T8 Active 2WD",stock:"t8",rrc:3099000,dealer:2999000,ti:200000,tiBack:150000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"t8p",brand:"TENET",name:"T8 Prime 2WD",stock:"t8",rrc:3299000,dealer:3149000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"t8p4",brand:"TENET",name:"T8 Prime 4WD",stock:"t8",rrc:3630000,dealer:3465000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"t8u4",brand:"TENET",name:"T8 Ultra 4WD",stock:"t8",rrc:3885000,dealer:3705000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"ta8p",brand:"TENET",name:"A8 Prime 1.6",stock:"ta8",rrc:2999000,dealer:2874000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"ta8u",brand:"TENET",name:"A8 Ultra 2.0",stock:"ta8",rrc:3499000,dealer:3354000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"t9p",brand:"CHERY",name:"Tiggo 9 Prime 4WD",stock:"t9",rrc:4335000,dealer:3895000,ti:300000,tiBack:250000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"t9u",brand:"CHERY",name:"Tiggo 9 Ultra 4WD",stock:"t9",rrc:4640000,dealer:4200000,ti:200000,tiBack:150000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"a8a",brand:"CHERY",name:"Arrizo 8 Active",stock:"a8",rrc:2865000,dealer:2649000,ti:250000,tiBack:230000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"a8p",brand:"CHERY",name:"Arrizo 8 Prime",stock:"a8",rrc:3060000,dealer:2699000,ti:200000,tiBack:180000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"a8u",brand:"CHERY",name:"Arrizo 8 Ultra Black",stock:"a8",rrc:3275000,dealer:2899000,ti:200000,tiBack:180000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"t7l",brand:"CHERY",name:"Tiggo 7 L Active",stock:"t7l",rrc:2735000,dealer:2620000,ti:100000,tiBack:70000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:0,kmMax:30,prioMin:0,prioMax:30}
    ];
    const PRIO_VINS = new Set(["EDEED31B1SE053704", "EDXFB32B4TE041659", "EDXFB32B2TE041658", "EDXFB32B7TE062327", "EDXGD34B1TE022143", "EDXGD34B6TE031162", "EDXGD34B3TE031815", "EDEDD24B2SG003755", "EDEDD24B3SG003926", "EDEDD24B1SG002595", "LVVDC21B7SD594110", "LVVDC21B0SD594112", "LVVDC21B2SDJ34062", "LVTDD24B5RD409189"]);
