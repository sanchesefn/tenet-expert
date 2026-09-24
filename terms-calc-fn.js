    const TERMS_DATE = "24.09.2026";
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
      ]},
      {line:"T8 2WD",rows:[
        ["Active / Prime 5 мест", "МПТ"]
      ]}
    ];
    const TERMS_INV = [
      {model:"T4L",trim:"Active",price:"2 150 нал, 2 100 ТИ"},
      {model:"T4L",trim:"Prime",price:"2 250 нал, 2 200 ТИ"},
      {model:"T7",trim:"Prime 2WD",price:"2 550 нал, 2 450 ТИ"},
      {model:"T8",trim:"Prime 4WD",price:"3 100 нал, 3 000 ТИ"},
      {model:"T8",trim:"Ultra 4WD",price:"3 300 нал, 3 200 ТИ"}
    ];
    const PANGO_FIX = {
      t4la:{cash:2150000,ti:2100000},
      t4lp:{cash:2250000,ti:2200000},
      t7p:{cash:2550000,ti:2450000},
      t8p4:{cash:3100000,ti:3000000},
      t8u4:{cash:3300000,ti:3200000}
    };
    const PANGO_BUNDLE = 150000;
    const PANGO_RATE_A = 17.4;
    const PANGO_RATE_B = 14.4;
    const PANGO_NSS = 0.0089;
    function pangoOf(id){ return (typeof PANGO_FIX!=="undefined" && PANGO_FIX[id]) || null; }
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
      {id:"t8p",brand:"TENET",name:"T8 Prime 2WD",stock:"t8",rrc:3299000,dealer:3149000,ti:200000,tiBack:150000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"t8p4",brand:"TENET",name:"T8 Prime 4WD",stock:"t8",rrc:3630000,dealer:3465000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"t8u4",brand:"TENET",name:"T8 Ultra 4WD",stock:"t8",rrc:3885000,dealer:3705000,ti:150000,tiBack:100000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:0,kmMax:30,prioMin:-30,prioMax:0},
      {id:"ta8p",brand:"TENET",name:"A8 Prime 1.6",stock:"ta8",rrc:2999000,dealer:2874000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"ta8u",brand:"TENET",name:"A8 Ultra 2.0",stock:"ta8",rrc:3499000,dealer:3354000,ti:0,tiBack:0,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"tt9p",brand:"TENET",name:"T9 Prime 5-seat",stock:"tt9",rrc:3949000,dealer:3799000,ti:200000,tiBack:130000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"tt9u",brand:"TENET",name:"T9 Ultra 5-seat",stock:"tt9",rrc:4299000,dealer:4099000,ti:200000,tiBack:130000,cr:0,crBack:0,bonus:0.02,vat:1.22,fee:0.01,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"t9p",brand:"CHERY",name:"Tiggo 9 Prime 4WD",stock:"t9",rrc:4335000,dealer:3895000,ti:300000,tiBack:250000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"t9u",brand:"CHERY",name:"Tiggo 9 Ultra 4WD",stock:"t9",rrc:4640000,dealer:4200000,ti:200000,tiBack:150000,cr:200000,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"a8a",brand:"CHERY",name:"Arrizo 8 Active",stock:"a8",rrc:2865000,dealer:2649000,ti:250000,tiBack:230000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"a8p",brand:"CHERY",name:"Arrizo 8 Prime",stock:"a8",rrc:3060000,dealer:2699000,ti:200000,tiBack:180000,cr:261000,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"a8u",brand:"CHERY",name:"Arrizo 8 Ultra Black",stock:"a8",rrc:3275000,dealer:2899000,ti:200000,tiBack:180000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:-30,kmMax:0,prioMin:-30,prioMax:0},
      {id:"t7l",brand:"CHERY",name:"Tiggo 7 L Active",stock:"t7l",rrc:2735000,dealer:2620000,ti:100000,tiBack:70000,cr:0,crBack:0,bonus:0.02,vat:1.2,fee:0.02,kmMin:0,kmMax:30,prioMin:0,prioMax:30}
    ];
    const PRIO_VINS = new Set(["EDEED31B1SE053704", "EDXFB32B4TE041659", "EDXFB32B2TE041658", "EDXFB32B7TE062327", "EDXGD34B1TE022143", "EDXGD34B6TE031162", "EDXGD34B3TE031815", "EDEDD24B2SG003755", "EDEDD24B3SG003926", "EDEDD24B1SG002595", "LVVDC21B7SD594110", "LVVDC21B0SD594112", "LVVDC21B2SDJ34062", "LVTDD24B5RD409189"]);
    const KM_DC_DEF = 100000;
    const KM_BANKS = [
      {id:"sber", name:"Сбер"},
      {id:"sovcom", name:"Совкомбанк"},
      {id:"alfa", name:"Альфа"},
      {id:"tbank", name:"Т-Банк"}
    ];
    const KM_BANK_MONTHS = {
      sber:[12,24,36,48,60,72,84,96,108,120],
      sovcom:[12,24,36,48,60,72,84],
      alfa:[12,24,36,48,60,72,84,96],
      tbank:[12,24,36,48,60,72,84,96]
    };
    const KM_BANK_RATES = {
      sber:{
        t4l_t7:{
          80:[0.01,0.01,0.01,0.01,0.01,0.01,0.01,1.20,2.80,4.80],
          70:[0.01,0.01,0.01,0.01,0.80,1.80,2.80,3.80,5.70,7.30],
          60:[0.01,0.01,0.01,2.50,4.70,5.30,5.30,5.80,8.20,9.00],
          50:[0.01,0.01,2.50,4.80,6.40,7.60,8.60,9.30,9.90,11.40],
          40:[0.01,0.30,4.50,6.60,8.00,9.00,9.70,10.50,11.00,11.60],
          30:[0.01,2.30,5.80,7.90,9.20,10.10,10.80,11.40,11.80,12.40],
          20:[0.01,4.00,7.10,9.00,10.10,11.00,11.60,12.10,12.40,12.90],
          10:[0.01,5.10,8.20,9.80,10.80,11.60,12.20,12.60,12.90,13.40],
          0:[0.01,7.00,9.70,11.20,12.30,13.00,13.50,13.90,14.20,14.90]
        },
        t4_t8:{
          80:[0.01,0.01,0.01,0.01,1.00,1.80,3.10,4.80,5.40,6.40],
          70:[0.01,0.01,1.00,2.40,4.40,6.10,6.25,7.40,8.80,10.10],
          60:[0.01,1.00,2.90,5.40,6.60,7.90,8.80,9.60,10.90,11.80],
          50:[0.01,1.40,5.70,7.40,8.70,9.60,10.30,11.10,12.30,13.40],
          40:[0.01,4.10,7.50,9.00,10.10,10.90,11.40,12.20,13.60,14.10],
          30:[0.01,6.20,9.20,10.40,11.40,12.00,12.40,13.00,14.10,14.60],
          20:[0.90,7.90,10.50,11.50,12.30,12.80,13.20,13.90,14.80,15.60],
          10:[4.80,9.10,11.40,12.40,13.00,13.50,13.80,14.40,15.50,15.90],
          0:[6.00,10.70,12.40,13.40,14.10,14.60,15.00,15.30,15.50,16.00]
        },
        a8:{
          80:[0.01,0.01,0.01,2.00,4.50,6.20,7.50,8.00,8.60,10.10],
          70:[0.01,0.01,3.50,6.50,8.10,9.90,10.20,10.90,11.40,13.10],
          60:[0.01,2.00,7.00,8.90,10.60,11.30,12.00,12.50,13.00,14.30],
          50:[0.01,5.00,8.90,10.80,11.70,12.60,13.10,13.40,14.10,15.20],
          40:[0.01,7.90,10.40,11.90,12.90,13.60,14.00,14.40,14.90,15.20],
          30:[2.00,9.10,11.40,13.00,13.60,14.50,14.60,15.10,15.40,15.80],
          20:[4.30,10.50,12.30,13.50,14.30,14.80,15.20,15.50,16.10,16.30],
          10:[5.80,10.90,12.90,14.00,14.80,15.30,15.40,15.90,16.40,16.80],
          0:[5.80,10.90,12.90,14.00,14.80,15.30,15.40,15.90,16.40,16.80]
        }
      },
      sovcom:{
        t4l_t7:{
          80:[0.01,0.01,0.01,0.01,0.01,0.01,0.01],
          70:[0.01,0.01,0.01,0.01,1.10,2.40,3.70],
          60:[0.01,0.01,0.10,2.70,4.30,6.20,6.80],
          50:[0.01,0.01,3.80,5.60,7.80,8.30,9.00],
          40:[0.01,2.70,5.70,7.60,8.90,9.40,10.00],
          30:[0.01,4.50,7.00,8.80,9.80,10.20,11.00],
          20:[0.01,6.70,8.70,10.40,11.20,12.00,12.00],
          10:[1.90,8.10,9.70,11.70,11.80,12.50,12.50],
          0:[4.10,9.40,10.50,13.10,12.80,13.30,13.30]
        },
        t4_t8:{
          80:[0.01,0.01,0.01,0.01,0.01,2.40,3.10],
          70:[0.01,0.01,0.01,2.20,3.70,5.10,5.50],
          60:[0.01,0.01,2.80,4.90,6.10,7.10,7.90],
          50:[0.01,2.00,5.90,7.50,9.40,9.50,10.20],
          40:[0.01,5.10,7.80,8.75,10.60,10.60,11.10],
          30:[0.01,5.90,9.30,10.20,11.00,11.20,11.90],
          20:[3.80,7.90,10.10,11.90,12.20,12.80,12.70],
          10:[4.90,9.85,11.10,12.55,12.80,13.20,13.20],
          0:[6.50,10.85,12.00,13.10,13.30,13.60,13.60]
        },
        a8:{
          80:[0.01,0.01,0.01,0.70,2.60,4.80,5.00],
          70:[0.01,0.01,3.20,5.40,6.80,8.20,8.55],
          60:[0.01,2.95,6.20,8.75,9.45,10.00,9.70],
          50:[0.01,6.25,8.90,10.80,10.50,13.05,13.15],
          40:[1.85,8.85,10.40,12.40,13.00,14.00,14.10],
          30:[4.75,10.30,11.10,13.30,13.85,14.65,14.65],
          20:[7.55,11.80,13.50,14.65,14.80,15.55,15.40],
          10:[9.15,12.90,14.05,15.00,15.30,16.00,16.00],
          0:[10.00,13.80,14.65,15.55,15.80,16.45,16.45]
        }
      },
      alfa:{
        t4l_t7:{
          80:[0.01,0.01,0.01,0.01,0.01,0.01,0.01,4.30],
          70:[0.01,0.01,0.01,0.01,2.70,4.70,6.20,8.10],
          60:[0.01,0.01,1.40,4.10,5.80,7.50,8.60,10.10],
          50:[0.01,0.01,4.60,6.60,7.80,9.30,10.20,11.60],
          40:[0.01,2.60,6.70,8.30,9.50,10.70,11.30,12.30],
          30:[0.01,4.80,8.40,9.80,10.80,11.80,12.50,13.50],
          20:[0.01,6.80,9.70,11.10,12.00,12.90,13.50,14.30],
          10:[2.80,8.20,10.70,12.00,12.80,13.60,14.10,14.90],
          0:[2.80,8.20,10.70,12.00,12.80,13.60,14.10,14.90]
        },
        t4_t8:{
          80:[0.01,0.01,0.01,0.01,0.01,1.90,3.50,5.90],
          70:[0.01,0.01,3.40,4.50,6.30,7.40,9.20,9.20],
          60:[0.01,0.01,3.80,6.00,7.50,8.90,9.70,11.10],
          50:[0.01,2.30,6.60,8.30,9.50,10.60,11.30,12.30],
          40:[0.01,5.00,8.40,9.90,10.90,11.90,12.40,13.40],
          30:[2.20,7.10,10.10,11.30,12.20,13.00,13.40,14.20],
          20:[3.90,8.90,11.40,12.40,13.20,13.90,14.30,15.00],
          10:[5.90,10.20,12.30,13.30,13.90,14.60,14.90,15.50],
          0:[5.90,10.20,12.30,13.30,13.90,14.60,14.90,15.50]
        },
        a8:{
          80:[0.01,0.01,0.01,1.30,2.60,4.70,6.30,8.20],
          70:[0.01,0.01,3.40,5.70,7.30,8.80,9.90,11.30],
          60:[0.01,2.80,7.00,8.50,9.80,11.10,11.90,12.90],
          50:[0.01,6.00,9.30,10.60,11.50,12.40,12.80,13.90],
          40:[2.80,8.20,10.70,11.80,12.50,13.30,13.90,14.60],
          30:[5.30,10.00,12.00,12.90,13.50,14.20,14.70,15.30],
          20:[7.80,11.20,13.00,13.80,14.30,14.90,15.40,15.90],
          10:[9.60,12.20,13.60,14.40,14.90,15.40,15.80,16.30],
          0:[9.60,12.20,13.60,14.40,14.90,15.40,15.80,16.30]
        }
      },
      tbank:{
        t4l_t7:{
          80:[0.01,0.01,0.01,0.01,1.50,2.60,3.80,4.70],
          70:[0.01,0.01,0.01,0.02,2.30,3.60,4.90,6.70],
          60:[0.01,0.01,1.00,4.20,5.20,5.80,6.90,7.90],
          50:[0.01,0.02,4.20,5.90,7.70,8.40,9.10,9.70],
          40:[0.01,3.10,6.30,8.80,9.80,10.90,11.40,11.90],
          30:[0.01,5.00,8.00,10.00,11.00,11.50,12.30,12.60],
          20:[0.02,7.10,9.90,11.40,12.30,13.10,13.50,13.90],
          10:[2.50,9.10,11.10,12.90,13.90,14.50,14.90,15.20],
          0:[4.50,10.00,12.80,14.00,14.90,15.20,15.90,16.40]
        },
        t4_t8:{
          80:[0.01,0.01,0.01,0.01,0.01,1.40,2.60,3.60],
          70:[0.01,0.01,0.01,3.10,5.00,5.40,6.30,6.90],
          60:[0.01,0.01,4.00,6.00,7.40,8.40,9.00,9.50],
          50:[0.01,3.20,6.20,8.30,9.50,10.20,10.80,11.10],
          40:[0.01,5.40,8.20,10.00,10.90,11.50,12.00,12.30],
          30:[0.01,7.30,9.70,11.20,12.00,12.50,12.90,13.10],
          20:[2.80,8.80,10.80,12.10,12.80,13.20,13.50,13.80],
          10:[4.80,9.90,11.70,12.80,13.40,13.80,14.10,14.30],
          0:[6.30,10.90,12.40,13.40,13.90,14.30,14.50,14.70]
        },
        a8:{
          80:[0.01,0.01,0.01,1.60,3.70,5.10,5.10,5.90],
          70:[0.01,0.01,3.80,5.80,7.30,8.30,9.00,9.50],
          60:[0.01,3.70,6.60,8.70,9.80,10.60,11.10,11.50],
          50:[0.01,6.20,8.90,10.50,11.40,12.00,12.50,12.80],
          40:[2.10,8.30,10.40,11.80,12.60,13.10,13.40,13.70],
          30:[4.70,9.90,11.60,12.80,13.40,13.80,14.10,14.40],
          20:[6.60,11.00,12.50,13.50,14.00,14.40,14.70,14.90],
          10:[8.20,12.00,13.20,14.10,14.50,14.80,15.10,15.30],
          0:[9.60,12.80,13.90,14.60,15.00,15.30,15.50,15.70]
        }
      }
    };
    function kmRateGroup(m){
      const s=(m&&m.stock)||"";
      if(s==="t4l"||s==="t7"||s==="t7l") return "t4l_t7";
      if(s==="t4"||s==="t8"||s==="t9") return "t4_t8";
      if(s==="a8"||s==="ta8") return "a8";
      return "t4l_t7";
    }
    function kmDownBand(pct){
      const p=Number(pct)||0;
      if(p>=80) return 80;
      if(p>=70) return 70;
      if(p>=60) return 60;
      if(p>=50) return 50;
      if(p>=40) return 40;
      if(p>=30) return 30;
      if(p>=20) return 20;
      if(p>=10) return 10;
      return 0;
    }
    const KM_BANK_FEE = 30000;
    function kmBankRate(bankId, group, months, downPct){
      const terms=KM_BANK_MONTHS[bankId]||KM_BANK_MONTHS.sber;
      const n=Math.max(1, Number(months)||60);
      let idx=0;
      const exact=terms.indexOf(n);
      if(exact>=0) idx=exact;
      else if(n>=terms[terms.length-1]) idx=terms.length-1;
      else if(n<=terms[0]) idx=0;
      else {
        let best=Math.abs(terms[0]-n);
        for(let i=1;i<terms.length;i++){
          const d=Math.abs(terms[i]-n);
          if(d<best){ best=d; idx=i; }
        }
      }
      const band=kmDownBand(downPct);
      const table=(KM_BANK_RATES[bankId]||{})[group]||(KM_BANK_RATES[bankId]||{}).t4l_t7||{};
      const row=table[band]||table[10]||table[20]||[];
      let rate=row[idx];
      if(!(rate>=0)){
        for(let i=idx;i>=0;i--){ if(row[i]>=0){ rate=row[i]; break; } }
      }
      return {rate: Number(rate)||0, term: terms[idx], band, capped: terms[idx]!==n};
    }
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
    const CORP_VINS = new Set([
      "EDXFB32B2TE041658",
      "EDXFB32B4TE041659",
      "EDXFB32B1TE087336",
      "EDXFB32B3TE091114",
      "EDXFD32B4TE092587",
      "EDXFD32B4TE092590"
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
      t8u4:{name:"T8 Ultra 4WD",rrc:3885000,dealer:3705000,an:536000,client:3379950,prem:402750,km:38320,tidy:3349000,sub:130000,do:70000,casco:80000},
      tt9p:{name:"T9 Prime 5-seat",rrc:3949000,dealer:3799000,an:550000,client:3435630,prem:442350,km:34713,tidy:3399000,sub:0,do:70000,casco:80000},
      tt9u:{name:"T9 Ultra 5-seat",rrc:4299000,dealer:4099000,an:650000,client:3697140,prem:487840,km:31016,tidy:3649000,sub:0,do:70000,casco:80000},
      ta8p:{name:"A8 Prime 1.6",rrc:2999000,dealer:2874000,an:400000,client:2639120,prem:294860,km:16279,tidy:2599000,sub:150000,do:70000,casco:80000},
      ta8u:{name:"A8 Ultra 2.0",rrc:3499000,dealer:3354000,an:500000,client:3044130,prem:379850,km:20369,tidy:2999000,sub:150000,do:70000,casco:80000}
    };
    const FLEET_TI = 50000;
    function isT8TwoWd(c){
      if(!c || c.invoice) return false;
      const vin=String(c.vin||"").toUpperCase();
      if(vin.indexOf("EDXGB32B")===0) return true;
      if(String(c.model||"").toLowerCase()!=="t8") return false;
      const t=String(c.trim||"").toLowerCase();
      if(t.includes("4wd")||t.includes("ультра")||t.includes("7 мест")) return false;
      return t.includes("2wd") || t.includes("актив") || t.includes("прайм") || !t;
    }
    function carIsMpt(c){ return !!(c && !c.invoice && (c.mpt || isT8TwoWd(c))); }
    function carIsCorp(c){ return !!(c && !c.invoice && (c.corp || (typeof CORP_VINS!=="undefined"&&CORP_VINS.has(c.vin)) || isT8TwoWd(c))); }
    function kmHasBrandSub(m){
      if(!m || m.id==="tt9p" || m.id==="tt9u" || m.stock==="tt9") return false;
      const f=typeof fleetOf==="function"?fleetOf(m.id):null;
      return !!(f && (f.sub||0)>0);
    }
    function kmIsCorp(vin){
      const v=String(vin||"");
      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===v);
      if(car && car.invoice) return false;
      if(typeof isT8TwoWd==="function" ? isT8TwoWd(car||{vin:v}) : String(v).toUpperCase().indexOf("EDXGB32B")===0) return false;
      if(typeof CORP_VINS!=="undefined" && CORP_VINS.has(v)) return true;
      if(car && car.corp) return true;
      return false;
    }
    function stockIsDemo(c){
      if(!c) return false;
      if(c.demo) return true;
      const v=String(c.vin||"").toUpperCase();
      return v==="EDXGD34B2TE109064" || v==="EDXGB32B0TE110108";
    }
    function fleetOf(id){
      return FLEET_BFS[id] || FLEET_BFS.t9u;
    }
    function fleetPayRows(list, payKey, overKey, months){
      return list.map(b=>{
        const yearsWant=Math.round(months/12);
        const yearsHave=Math.round(b.term/12);
        const note=b.capped?`нет ${yearsWant} ${yearsWant===1?"года":"лет"} · считаем ${b.term} мес. (${yearsHave} ${yearsHave===1?"год":yearsHave<5?"года":"лет"})`: `${b.term} мес.`;
        const pay=Math.round(b[payKey]||0);
        const over=Math.round(b[overKey]||0);
        return `<div class="bank-row"><span><b>${escape(b.name)}</b><br/><small>${b.rate}% · ${note} · переплата ~${rub(over)}</small></span><span class="pay">${rub(pay)} ₽</span></div>`;
      }).join("");
    }
    function fleetCreditBox(price, m, f, useFleet, useTi, mode){
      const isSub=mode==="sub";
      const cutLabel=isSub?"Субсидия бренда":"МПТ −10%";
      const headLabel=isSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%";

      const downMode=(typeof kmStr==="function"?kmStr("cDownMode","sum"):"sum");
      const months=typeof kmVal==="function"?kmVal("cMonths", 84):84;
      let downPct=typeof kmVal==="function"?kmVal("cDownPct", 20):20;
      const priceMpt=Math.round(price);
      let down=typeof kmVal==="function"?kmVal("cDown", Math.round(priceMpt*0.2)):Math.round(priceMpt*0.2);
      if(downMode==="pct") down=Math.round(priceMpt*Math.max(0,downPct)/100);
      else downPct=priceMpt>0?Math.round(down*1000/priceMpt)/10:0;
      down=Math.max(0,Math.min(priceMpt,down));
      const MPT_EXTRA=200000;
      const downMptShow=down;
      const downMptCar=Math.max(0, downMptShow-MPT_EXTRA);
      const addons=typeof kmVal==="function"?kmVal("kmDo", 70000):70000;
      const pack=typeof kmVal==="function"?kmVal("kmPack", 150000):150000;
      const finDelta=(addons-70000)+(pack-150000);
      const creditMpt=Math.max(0, priceMpt-downMptCar+finDelta);
      const mptTerm=Math.min(Math.max(1, months), 84);
      const payMpt=typeof calcPay==="function"?calcPay(priceMpt+finDelta, downMptCar, mptTerm, 19.2):0;
      const overMpt=payMpt*mptTerm-creditMpt;
      const banksMpt=[{id:"sovcom", name:"Совкомбанк", rate:19.2, term:mptTerm, capped:mptTerm!==months, payMpt, overMpt}];
      const priceReg=Math.max(0, (m&&m.rrc?m.rrc:f.rrc)-(useTi&&m&&m.ti?m.ti:0));
      const fee=typeof KM_BANK_FEE==="number"?KM_BANK_FEE:30000;
      const extras=addons+pack+fee;
      const downReg=downMode==="pct"?Math.round(priceReg*Math.max(0,downPct)/100):Math.max(0,Math.min(priceReg,down));
      const creditReg=Math.max(0, priceReg-downReg+extras);
      const rateGroup=typeof kmRateGroup==="function"?kmRateGroup(m):"t4l_t7";
      const banks=(typeof KM_BANKS!=="undefined"?KM_BANKS:[{id:"sovcom",name:"Совкомбанк",rate:19.2}]).map(b=>{
        const look=typeof kmBankRate==="function"?kmBankRate(b.id, rateGroup, months, downMode==="pct"?downPct:(priceReg>0?Math.round(downReg*1000/priceReg)/10:0)):{rate:b.rate||19.2, term:months, capped:false};
        const term=look.term||months;
        const pay=typeof calcPay==="function"?calcPay(priceReg+extras, downReg, term, look.rate):0;
        return Object.assign({}, b, {rate:look.rate, term, capped:!!look.capped, pay, over:pay*term-creditReg});
      });
      const stockCars=typeof kmStockCars==="function"?kmStockCars(m):[];
      const analog=stockCars.find(c=>!(typeof carIsMpt==="function"?carIsMpt(c):c.mpt) && !(typeof carIsCorp==="function"?carIsCorp(c):c.corp)) || stockCars.find(c=>!(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)) || null;
      const mptBreak=`<div class="mpt-break">
                <div class="bank-row"><span>Комплектация</span><span class="pay">${escape((f&&f.name)||(m&&m.name)||"")}</span></div>
                <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(f.rrc)}</span></div>
                <div class="bank-row"><span>Флит</span><span class="pay">${rub(useFleet?f.tidy:f.rrc)}</span></div>
                ${useTi?`<div class="bank-row"><span>Трейд-ин</span><span class="pay">− ${rub(FLEET_TI)}</span></div>`:""}
                <div class="bank-row"><span>${cutLabel}</span><span class="pay">${rub(priceMpt)}</span></div>
                <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(downMptShow)}</span></div>
                <div class="bank-row"><span>из них каско и Д/О</span><span class="pay">${rub(Math.min(MPT_EXTRA, downMptShow))}</span></div>
                <div class="bank-row"><span>ПВ в авто</span><span class="pay">${rub(downMptCar)}</span></div>
                ${finDelta?`<div class="bank-row"><span>Д/О и каско сверх нормы</span><span class="pay">${finDelta>0?"+":"−"} ${rub(Math.abs(finDelta))}</span></div>`:""}
                <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
              </div>`;
      const regBreak=`<div class="mpt-break">
                <div class="bank-row"><span>Комплектация</span><span class="pay">${escape((m&&m.name)||(f&&f.name)||"")}</span></div>
                ${analog?`<div class="bank-row"><span>Аналог на складе</span><span class="pay">${escape(analog.color||"—")} · ${escape(analog.vin||"")}</span></div>`:`<div class="bank-row"><span>Аналог</span><span class="pay">та же комплектация, обычный кредит</span></div>`}
                <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(m&&m.rrc?m.rrc:f.rrc)}</span></div>
                ${useTi?`<div class="bank-row"><span>Трейд-ин</span><span class="pay">− ${rub(m&&m.ti?m.ti:0)}</span></div>`:""}
                <div class="bank-row"><span>Цена авто</span><span class="pay">${rub(priceReg)}</span></div>
                <div class="bank-row"><span>ПВ</span><span class="pay">${rub(downReg)}</span></div>
                <div class="bank-row"><span>В кредит ещё Д/О + каско + комиссия</span><span class="pay">${rub(extras)}</span></div>
                <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditReg)}</span></div>
              </div>`;
      const inputs=`<div class="card km-pv">
        <p class="eyebrow">Первый взнос</p>
        <div class="km-pv-row">
          <div class="down-mode">
            <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
            <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
          </div>
          ${downMode==="sum"
            ?`<label class="field"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
            :`<label class="field"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
          <label class="field"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>
        </div>
        <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
        <p class="calc-note">${rub(down)} ₽ · ${downPct}% · одинаковые ПВ и срок для обоих расчётов</p>
      </div>`;
      const stdCol=`<div class="pay-col std km-pay">
            <p class="eyebrow">Стандартный кредит</p>
            <p class="calc-note">Та же комплектация без флита. ПВ ${rub(downReg)} · тело ${rub(creditReg)}</p>
            ${fleetPayRows(banks,"pay","over",months)}
            ${regBreak}
          </div>`;
      const altCol=`<div class="pay-col ${isSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${isSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            ${fleetPayRows(banksMpt,"payMpt","overMpt",months)}
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
            <details class="calc-more">
              <summary>Подробности расчёта</summary>
              <p class="calc-note">${isSub?"Машина не проходит под МПТ. Это не стандартный кредит: сначала флит, затем субсидия бренда (AQ), Совкомбанк 19,2%.":"МПТ −10% от флита. Совкомбанк 19,2%."}</p>
              ${mptBreak}
            </details>
          </div>`;
      let pangoCol="";
      const _pgF=(m && typeof pangoOf==="function")?pangoOf(m.id):null;
      if(_pgF){
        const pFix=useTi?_pgF.ti:_pgF.cash;
        const pDownP=Math.max(0, Math.min(pFix, down));
        const pBundle=typeof PANGO_BUNDLE==="number"?PANGO_BUNDLE:150000;
        const pRateA=typeof PANGO_RATE_A==="number"?PANGO_RATE_A:17.4;
        const pRateB=typeof PANGO_RATE_B==="number"?PANGO_RATE_B:14.4;
        const pNssRate=typeof PANGO_NSS==="number"?PANGO_NSS:0.0089;
        const pYears=months/12;
        const pYearsLabel=Math.abs(pYears-Math.round(pYears))<0.05?String(Math.round(pYears)):pYears.toFixed(1);
        const yNum=Number(pYearsLabel);
        const pYearsWord=(yNum===1)?"год":(yNum>1&&yNum<5&&Math.abs(yNum-Math.round(yNum))<0.05?"года":"лет");
        const pBase=Math.max(0, pFix-pDownP)+pBundle+finDelta;
        const pNss=Math.round(pBase*pNssRate*pYears);
        const pCreditB=pBase+pNss;
        const pPayA=typeof calcPay==="function"?calcPay(pBase+pDownP, pDownP, months, pRateA):0;
        const pPayB=typeof calcPay==="function"?calcPay(pCreditB+pDownP, pDownP, months, pRateB):0;
        const pOverA=pPayA*months-pBase;
        const pOverB=pPayB*months-pCreditB;
        pangoCol=`<div class="pay-col pango km-pay">
            <p class="eyebrow">Спеццена · PANGO</p>
            <p class="eyebrow" style="margin-top:8px">17,4% без комиссий</p>
            <div class="bank-row pay-top"><span><b>Платёж</b><br/><small>${pRateA}% · ${months} мес. · переплата ~${rub(Math.round(pOverA))}</small></span><span class="pay">${rub(Math.round(pPayA))} ₽</span></div>
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(pBase)}</span></div>
            <p class="eyebrow" style="margin-top:8px">14,4% · НСС в теле</p>
            <div class="bank-row pay-top"><span><b>Платёж</b><br/><small>${pRateB}% · ${months} мес. · переплата ~${rub(Math.round(pOverB))}</small></span><span class="pay">${rub(Math.round(pPayB))} ₽</span></div>
            <div class="bank-row"><span>Тело с НСС</span><span class="pay">${rub(pCreditB)}</span></div>
            <details class="calc-more">
              <summary>Подробности расчёта</summary>
              <p class="calc-note">Если машина по спеццене. Фикс ${useTi?"с трейд-ин":"без трейд-ин"} ${rub(pFix)}. Каско + GAP + ДМС ${rub(pBundle)} всегда в кредите.</p>
              <div class="bank-row"><span>Цена авто</span><span class="pay">${rub(pFix)}</span></div>
              <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(pDownP)}</span></div>
              <div class="bank-row"><span>Каско + GAP + ДМС</span><span class="pay">${rub(pBundle)}</span></div>
              ${finDelta?`<div class="bank-row"><span>Д/О и каско сверх нормы</span><span class="pay">${finDelta>0?"+":"−"} ${rub(Math.abs(finDelta))}</span></div>`:""}
              <div class="bank-row"><span>НСС 0,89% × ${pYearsLabel} ${pYearsWord}</span><span class="pay">${rub(pNss)}</span></div>
            </details>
          </div>`;
      }
      return {inputs, stdCol, altCol, pangoCol};
    }
    function calcFleet(m){
      const f=fleetOf(m.id);
      const useFleet=kmVal("kmFleetDisc", true);
      const useTi=kmVal("kmUseTi", false);
      let price=f.rrc;
      const fleetCut=Math.max(0, f.rrc-(f.tidy||f.rrc));
      const steps=[];
      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===kmVin);
      const carMpt=typeof carIsMpt==="function"?carIsMpt(car):!!(car&&car.mpt);
      const canSub=typeof kmHasBrandSub==="function"?kmHasBrandSub(m):((f.sub||0)>0 && m.id!=="tt9p" && m.id!=="tt9u");
      const useMpt=carMpt && kmVal("kmFleetMpt", true);
      const useSub=!useMpt && canSub && kmVal("kmFleetSub", true);
      if(useFleet){ price=f.tidy; steps.push("флит −"+rub(fleetCut)); }
      if(useTi){ price=Math.max(0, price-FLEET_TI); steps.push("трейд-ин −"+rub(FLEET_TI)); }
      if(useMpt){ price=Math.round(price*0.9); steps.push("МПТ −10%"); }
      else if(useSub){ price=Math.max(0, price-(f.sub||0)); steps.push("субс. бренда −"+rub(f.sub||0)); }
      const mptCut=Math.round((useFleet?f.tidy:f.rrc)*(useTi?0.9:1)*0.1);
      const subCut=f.sub||0;
      const fleetBox=(useMpt||useSub)?fleetCreditBox(price, m, f, useFleet, useTi, useMpt?"mpt":"sub"):null;
      return banner("Калькулятор","Флит · BFS Совкомбанк лизинг","TENET")+`
        <p class="lead">${fleetBox?(fleetBox.pangoCol?"Три расчёта рядом: стандартный кредит, "+(useSub?"флит с субсидией бренда":"МПТ")+" и спеццена PANGO.":(useSub?"Три блока: скидки флита, стандартный кредит той же комплектации и справа флит с субсидией бренда — машина не под МПТ.":"Три блока: скидки флита, стандартный кредит и МПТ.")):"Корпоративный VIN. Сбер / Альфа / Т-Банк на этот VIN нельзя."}</p>
        <div class="km-stage${fleetBox?(fleetBox.pangoCol?" km-4":" km-3"):""}">
        <div class="km-chips">${kmChipGroups(m.id)}</div>
        <div class="km-layout${fleetBox?(fleetBox.pangoCol?" km-4":" km-3"):""}">
          <div class="card km-disc">
            <p class="eyebrow">BFS Совкомбанк лизинг · ${escape(f.name)}</p>
            ${car?`<p class="calc-note">${escape(car.vin)} · ${escape(car.color||"")} · ${escape(car.trim||"")}${carMpt?" · МПТ":""}${carIsCorp(car)?" · корп":""}</p>`:""}
            <div class="note-box">Сбер / Альфа / Т-Банк на этот VIN нельзя. По центру — стандартный кредит той же комплектации. Справа — ${useSub?"флит с субсидией бренда, не МПТ":useMpt?"МПТ":"лист флита"}.</div>
            <label class="check-row"><input id="kmFleetDisc" type="checkbox" ${useFleet?"checked":""} /> <span>Флит скидка ${rub(fleetCut)} · макс. выгода ${rub(f.an)}</span></label>
            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин ${rub(FLEET_TI)}</span></label>
            ${carMpt?`<label class="check-row"><input id="kmFleetMpt" type="checkbox" ${useMpt?"checked":""} /> <span>МПТ −10%</span></label>`:""}
            ${!useMpt&&canSub?`<label class="check-row"><input id="kmFleetSub" type="checkbox" ${useSub?"checked":""} /> <span>Субсидия бренда ${rub(subCut)}</span></label>`:""}
            <div class="note-box" style="margin-top:14px">
              <p class="eyebrow" style="margin:0 0 6px">Итоговая цена</p>
              ${price<f.rrc?`<div class="calc-out" style="text-decoration:line-through;opacity:.42;margin-bottom:2px">${rub(f.rrc)} ₽</div>`:""}
              <div class="calc-out">${rub(Math.round(price))} ₽</div>
              <p class="calc-note">${steps.length?steps.join(" → "):"Базовая цена без скидок."}${useFleet?" · AP без тюнинга "+rub(f.tidy):""}</p>
            </div>
          </div>
          ${fleetBox?`<div class="km-credit">${fleetBox.inputs}<div class="km-pays">${fleetBox.stdCol}${fleetBox.altCol}${fleetBox.pangoCol||""}</div></div>`:""}
        </div>
        </div>
        <div class="card">
              <p class="eyebrow">Лист «Флит» BFS</p>
              <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(f.rrc)} ₽</span></div>
              <div class="bank-row"><span>Макс. выгода AN</span><span class="pay">${rub(f.an)} ₽</span></div>
              <div class="bank-row"><span>Цена AP без тюнинга</span><span class="pay">${rub(f.tidy)} ₽</span></div>
              ${useMpt
                ? `<div class="bank-row"><span>МПТ −10%</span><span class="pay">${rub(mptCut)} ₽</span></div>`
                : (useSub?`<div class="bank-row"><span>Субсидия бренда AQ</span><span class="pay">${rub(subCut)} ₽</span></div>`:`<div class="bank-row"><span>Субсидия TENET</span><span class="pay">${rub(f.sub||0)} ₽</span></div>`)}
              <p class="calc-note">${useMpt?"На цену действует МПТ −10%, не субсидия бренда.":useSub?"Порядок: флит скидка → трейд-ин → субсидия бренда (AQ). МПТ и субсидия не суммируются.":"Порядок: флит скидка → трейд-ин."}</p>
            </div>
        <div class="km-bottom">
          <div class="card dc-result ok">
            <p class="eyebrow">Доходность ДЦ · КМ без НДС · флит BFS</p>
            <div class="calc-out">${rub(f.km)} ₽</div>
            <p class="calc-note">КМ с листа «Флит», блок BFS. Пауза банка, ориентир 21.09.</p>
          </div>
          ${kmSideList(m)}
        </div>`;
    }
    function termCard(title, value, note){
      return `<article class="term-card"><b>${escape(title)}</b>${value?`<div class="num">${value}</div>`:""}${note?`<small>${note}</small>`:""}</article>`;
    }
    function termGroup(rows, valKey){
      const order=[], map={};
      rows.forEach(r=>{
        const k=r.model;
        if(!map[k]){ map[k]=[]; order.push(k); }
        map[k].push(r);
      });
      return order.map(model=>{
        const list=map[model];
        const body=list.map(r=>`<div class="term-row"><span>${escape(r.trim)}</span><b class="num">${escape(r[valKey]||"")}</b></div>${r.note?`<small>${escape(r.note)}</small>`:""}`).join("");
        return `<article class="term-card term-group"><b>${escape(model)}</b>${body}</article>`;
      }).join("");
    }
    function prioList(){
      const soldBy={};
      TERMS_PRIO.forEach(r=>{
        if(r.sold && r.seller) soldBy[r.seller]=(soldBy[r.seller]||0)+1;
      });
      return `<ol class="prio-list">`+TERMS_PRIO.map((r,i)=>{
        const sold=!!r.sold;
        const n=r.seller?soldBy[r.seller]||0:0;
        const mark=sold&&r.seller?`<span class="sold-mark">Продано · ${escape(r.seller)} <i>${n>=2?"2":"1"}</i></span>`:"";
        const extra=r.extra?` · ${escape(r.extra)}`:"";
        return `<li class="prio-item${sold?" sold":""}">
          <div class="prio-top"><b>${i+1}. ${escape(r.model)} · ${escape(r.trim)}</b>${mark}</div>
          <div class="prio-meta">${escape(r.vin)} · ${escape(r.color)} · ${escape(r.year)}${extra}</div>
          <div class="prio-pay">${r.pay?rub(r.pay):"—"} / ${r.bonus?rub(r.bonus):"—"}</div>
        </li>`;
      }).join("")+`</ol>`;
    }
    function kmTrimFit(m, car){
      const t=(car.trim||"").toLowerCase();
      const id=m.id;
      if(id==="t4la") return t.includes("актив");
      if(id==="t4lp") return t.includes("прайм");
      if(id==="t7a") return t.includes("актив") && !t.includes("4wd");
      if(id==="t7p") return t.includes("прайм") && !t.includes("4wd");
      if(id==="t7a4") return t.includes("актив") && t.includes("4wd");
      if(id==="t7p4") return t.includes("прайм") && t.includes("4wd");
      if(id==="t8a") return t.includes("актив");
      if(id==="t8p") return t.includes("прайм") && !t.includes("4wd");
      if(id==="t8p4") return t.includes("прайм") && t.includes("4wd");
      if(id==="t8u4") return t.includes("ультра");
      if(id==="tt9p") return t.includes("прайм");
      if(id==="tt9u") return t.includes("ультра");
      if(id==="t9p") return t.includes("прайм");
      if(id==="t9u") return t.includes("ультра");
      if(id==="a8a") return t.includes("актив");
      if(id==="a8p") return t.includes("прайм");
      if(id==="a8u") return t.includes("ультра");
      if(id==="t7l") return true;
      return true;
    }
    function kmIdFromCar(car){
      const t=(car.trim||"").toLowerCase();
      if(car.model==="t4") return "t4p";
      if(car.model==="t4l") return t.includes("прайм")?"t4lp":"t4la";
      if(car.model==="t7"){
        if(t.includes("4wd") && t.includes("прайм")) return "t7p4";
        if(t.includes("4wd")) return "t7a4";
        if(t.includes("прайм")) return "t7p";
        return "t7a";
      }
      if(car.model==="t8"){
        if(t.includes("ультра")) return "t8u4";
        if(t.includes("4wd")) return "t8p4";
        if(t.includes("прайм")) return "t8p";
        return "t8a";
      }
      if(car.model==="tt9" || String(car.vin||"").toUpperCase().indexOf("EDEHD24")===0) return t.includes("прайм")?"tt9p":"tt9u";
      if(car.model==="t9") return t.includes("прайм")?"t9p":"t9u";
      if(car.model==="a8"){
        if(t.includes("ультра")) return "a8u";
        if(t.includes("актив")) return "a8a";
        return "a8p";
      }
      if(car.model==="t7l") return "t7l";
      return "";
    }
    function kmLineOf(id){
      if(id==="t4p") return "T4";
      if(id==="t4la"||id==="t4lp") return "T4L";
      if(id==="t7a"||id==="t7p"||id==="t7a4"||id==="t7p4") return "T7";
      if(id==="t8a"||id==="t8p"||id==="t8p4"||id==="t8u4") return "T8";
      if(id==="tt9p"||id==="tt9u") return "TENET T9";
      if(id==="ta8p"||id==="ta8u") return "TENET A8";
      if(id==="t9p"||id==="t9u") return "Tiggo 9";
      if(id==="a8a"||id==="a8p"||id==="a8u") return "Arrizo 8";
      if(id==="t7l") return "Tiggo 7 L";
      return "Другие";
    }
    function kmStockCars(m){
      const list=typeof STOCK!=="undefined"?STOCK:[];
      return list.filter(c=>!(typeof stockIsDemo==="function"?stockIsDemo(c):c.demo) && c.model===m.stock && kmTrimFit(m,c));
    }
    function terms(){
      if(needAuth()) return login();
      return banner("Торговые условия","Файл «Торговые условия» · с "+TERMS_DATE,"TENET")+
        `<div class="terms-col">`+
        `<p class="lead">Клиенту называть рекомендованную цену. Максимум с выгодами — после расчёта РОП. КМ — коридор доходности без НДС, тыс. руб.</p>`+
        `<div class="note-box">Скидки импортёра не обещать, если их нет в прайсе. Цифры внутренние.</div>`+
        `<h2>Доходность</h2>`+
        `<div class="terms-cards">`+termGroup(KM_CORRIDOR,"km")+`</div>`+
        `<h2>Бонусы</h2>`+
        `<div class="terms-cards">`+termGroup(TERMS_BONUS,"bonus")+`</div>`+
        `<h2>Спец инвойс</h2>`+
        `<div class="terms-cards">`+TERMS_INV.map(r=>termCard(r.model+" · "+r.trim, escape(r.price), "")).join("")+`</div>`+
        `<h2>МПТ / субсидия TENET</h2>`+
        `<div class="terms-cards">`+TERMS_MPT.map(g=>`<article class="term-card"><b>${escape(g.line)}</b>`+g.rows.map(r=>`<small>${escape(r[0])} · <b>${escape(r[1])}</b></small>`).join("")+`</article>`).join("")+`</div>`+
        `<h2>Приоритет · ${TERMS_PRIO.length} авто</h2>`+
        `<p class="lead">Личный план 2 · командный план 12. Всего 14. Порядок как в файле.</p>`+
        prioList()+
        `<p class="lead">Доплата за 4WD на T7 — 205 000 ₽. Мотор T7 везде 1.6T 150.</p>`+
        `<div class="who-line"><button class="btn ivory" data-go="calc">В калькулятор</button><button class="btn ghost" data-go="docs">Документы</button></div>`+
        `</div>`;
    }
    function calcPay(price, down, months, rate){
      const S=Math.max(0, (Number(price)||0)-(Number(down)||0));
      const n=Math.max(1, Number(months)||12);
      const i=(Number(rate)||0)/100/12;
      if(i<=0) return S/n;
      const k=Math.pow(1+i,n);
      return S*i*k/(k-1);
    }
    function kmVal(id, def){
      const el=document.getElementById(id);
      if(!el) return def;
      if(el.type==="checkbox") return !!el.checked;
      const n=Number(String(el.value||"").replace(/\s+/g,""));
      return Number.isFinite(n)?n:def;
    }
    function kmStr(id, def){
      const el=document.getElementById(id);
      if(!el) return def;
      const v=String(el.value||"").trim();
      return v||def;
    }
    function kmChipGroups(active){
      const groups={};
      KM_MODELS.forEach(x=>{
        const g=kmLineOf(x.id);
        (groups[g]=groups[g]||[]).push(x);
      });
      const line=(g,tone)=>groups[g]&&groups[g].length?`<div class="km-line tone-${tone}"><p class="stock-h">${escape(g)}</p><div class="km-grid">${groups[g].map(x=>`<button type="button" class="chip ${x.id===active?"on":""}" data-km-id="${x.id}">${escape(x.name)}<small>${x.brand} · РРЦ ${rub(x.rrc)}</small></button>`).join("")}</div></div>`:"";
      const slot=(cls,html)=>html?`<div class="km-slot ${cls}">${html}</div>`:"";
      return `<div class="km-board"><span class="km-brand tenet">TENET</span><span class="km-brand chery">CHERY</span>`
        +slot("s-t4",`<div class="km-pair is-2">${line("T4","a")}${line("T4L","a")}</div>`)
        +slot("s-t7",line("T7","a"))
        +slot("s-c7",line("Tiggo 7 L","b"))
        +slot("s-t8",line("T8","a"))
        +slot("s-t9",line("TENET T9","a"))
        +slot("s-c9",line("Tiggo 9","b"))
        +slot("s-a8",line("TENET A8","a"))
        +slot("s-ca",line("Arrizo 8","b"))
        +`</div>`;
    }
    function kmPrioRecRows(cur, carPrice, downPct, months, extras){
      const list=typeof STOCK!=="undefined"?STOCK:[];
      const price0=Number(carPrice)|| (cur&&cur.rrc)||0;
      const pct=Number(downPct)||20;
      const term=Number(months)||60;
      const extra=Number(extras)||0;
      const refPay=typeof calcPay==="function"?calcPay(price0+extra, Math.round(price0*pct/100), term, 10):0;
      return list.filter(c=>PRIO_VINS.has(c.vin) && c.vin!==kmVin && !(typeof stockIsDemo==="function"?stockIsDemo(c):c.demo)).map(c=>{
        const id=typeof kmIdFromCar==="function"?kmIdFromCar(c):"";
        const mm=KM_MODELS.find(x=>x.id===id);
        const price=mm?mm.rrc:price0;
        const group=typeof kmRateGroup==="function"?kmRateGroup(mm||cur):"t4l_t7";
        const look=typeof kmBankRate==="function"?kmBankRate("sber", group, term, pct):{rate:10, term};
        const down=Math.round(price*Math.max(0,pct)/100);
        const pay=typeof calcPay==="function"?calcPay(price+extra, down, look.term||term, look.rate):0;
        return {c, mm, price, pay, d:Math.abs(price-price0)+Math.abs(pay-refPay)};
      }).sort((a,b)=>a.d-b.d).slice(0,4);
    }
    function kmSideList(m, carPrice, downPct, months, extras){
      const cars=kmStockCars(m).slice().sort((a,b)=>{
        const pa=PRIO_VINS.has(a.vin)?0:1;
        const pb=PRIO_VINS.has(b.vin)?0:1;
        if(pa!==pb) return pa-pb;
        if(a.status!==b.status) return a.status==="in"?-1:1;
        return (a.color||"").localeCompare(b.color||"");
      });
      const inn=cars.filter(c=>c.status==="in");
      const way=cars.filter(c=>c.status==="way");
      const recs=kmPrioRecRows(m, carPrice!=null?carPrice:m.rrc, downPct!=null?downPct:20, months!=null?months:60, extras||0);
      const hereVins=new Set(cars.map(c=>c.vin));
      const recVins=new Set(recs.map(r=>r.c.vin));
      const recOther=recs.filter(r=>!hereVins.has(r.c.vin));
      const carBtn=(c)=>{
        const prio=PRIO_VINS.has(c.vin);
        const rec=recVins.has(c.vin) || prio;
        const on=kmVin===c.vin;
        const st=c.status==="in"?"в наличии":"в пути";
        return `<button type="button" class="stock-car${prio?" prio":""}${rec?" rec":""}${(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)?" mpt":""}${(typeof carIsCorp==="function"?carIsCorp(c):(c.corp||(typeof kmIsCorp==="function"&&kmIsCorp(c.vin))))?" corp":""}${c.demo?" demo":""}${c.invoice?" invoice":""}${on?" on":""}" data-km-vin="${escape(c.vin)}">
          <b>${escape(c.color||"—")} · ${escape(c.trim||"")}${prio?" · приоритет":""}</b>
          ${c.invoice?`<span class="mpt-tag inv-tag">Спец инвойс</span>`:""}${(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}${(typeof carIsCorp==="function"?carIsCorp(c):(c.corp||(typeof kmIsCorp==="function"&&kmIsCorp(c.vin))))?`<span class="mpt-tag corp-tag">Корп · лизинг</span>`:""}${c.demo?`<span class="mpt-tag demo-tag">ДЕМО</span>`:""}
          <span class="vin">${escape(c.vin)}</span>
          <span class="stock-meta">${st}${c.invoice?" · спец инвойс":""}${(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)?" · МПТ":""}${(typeof carIsCorp==="function"?carIsCorp(c):c.corp)?" · корп":""}${c.demo?" · ДЕМО":""}${c.note?" · "+escape(c.note):""}</span>
        </button>`;
      };
      if(!cars.length && !recOther.length){
        return `<div class="card stock-side"><p class="eyebrow">В наличии · ${escape(m.name)}</p><p class="lead" style="max-width:none">Нет этой комплектации в наличии и в пути.</p></div>`;
      }
      const recBlock=!recOther.length?"":recOther.map(r=>{
          const st=r.c.status==="in"?"в наличии":"в пути";
          return `<button type="button" class="stock-car prio rec${(typeof carIsMpt==="function"?carIsMpt(r.c):r.c.mpt)?" mpt":""}${(typeof carIsCorp==="function"?carIsCorp(r.c):r.c.corp)?" corp":""}" data-km-vin="${escape(r.c.vin)}">
            <b>${escape((r.mm&&r.mm.name)||r.c.name)} · ${escape(r.c.color||"—")}</b>
            ${(typeof carIsMpt==="function"?carIsMpt(r.c):r.c.mpt)?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}${(typeof carIsCorp==="function"?carIsCorp(r.c):r.c.corp)?`<span class="mpt-tag corp-tag">Корп · лизинг</span>`:""}
            <span class="vin">${escape(r.c.vin)} · ${escape(r.c.trim||"")} · ${st}</span>
            <span class="stock-meta">РРЦ ${rub(r.price)} · платёж ~${rub(Math.round(r.pay))} ₽ · приоритет</span>
          </button>`;
        }).join("");
      const recCard=recBlock?`<div class="card stock-rec"><p class="eyebrow">Рекомендуем</p>${recBlock}</div>`:"";
      const stockCard=cars.length?`<div class="card stock-side"><p class="eyebrow">В наличии · ${escape(m.name)}</p><p class="lead" style="max-width:none;margin:0 0 10px">${inn.length} в салоне · ${way.length} в пути.</p>${inn.length?`<p class="stock-h">Эта комплектация · ${inn.length}</p>`+inn.map(c=>carBtn(c)).join(""):""}${way.length?`<p class="stock-h">В пути · ${way.length}</p>`+way.map(c=>carBtn(c)).join(""):""}</div>`:"";
      return recCard+stockCard;
    }
    function kmPrioRecs(cur, carPrice, downPct, months, extras){
      return "";
    }
    function kmProfit(p){
      const discount=(p.tiAmt||0)+(p.spec||0)+(p.dcTi||0)+(p.dcCr||0)+(p.crAmt||0);
      const bonusAmt=p.invoice>0?(p.invoice/p.vat)*p.bonus:0;
      const margin=p.rrc-p.invoice;
      const carPrice=p.rrc-discount;
      const iron=margin-discount+(p.tiBack||0)+(p.crBack||0)+bonusAmt*1.2;
      return ((p.addons||0)*0.3+(p.casco||0)*0.3+(p.card||0)*0.8+iron)/p.vat-carPrice*p.fee;
    }
    function kmDcCrAt(p, kmTarget, roundFn){
      const km0=kmProfit(Object.assign({}, p, {dcCr:0}));
      const coeff=1/p.vat-p.fee;
      if(!(coeff>0)) return 0;
      const raw=(km0-Number(kmTarget))/coeff;
      if(!(raw>0)) return 0;
      return roundFn(raw/1000)*1000;
    }
    function kmDcCrFit(p, lo){
      return kmDcCrAt(p, Number(lo)*1000, Math.floor);
    }
    function kmDcCrMin(p, hi){
      const km0=kmProfit(Object.assign({}, p, {dcCr:0}));
      if(km0<=Number(hi)*1000+50) return 0;
      return kmDcCrAt(p, Number(hi)*1000, Math.ceil);
    }
    function calcKm(){
      if(typeof kmId!=="string" || !KM_MODELS.some(x=>x.id===kmId)) kmId=KM_MODELS[0].id;
      if(typeof kmVin!=="string") kmVin="";
      const m=KM_MODELS.find(x=>x.id===kmId)||KM_MODELS[0];
      if(typeof kmIsCorp==="function" && kmIsCorp(kmVin) && typeof calcFleet==="function") return calcFleet(m);
      const fresh=(typeof kmShown==="undefined")||kmShown!==kmId;
      kmShown=kmId;
      const rrc=fresh?m.rrc:kmVal("kmRrc", m.rrc);
      const invoice=fresh?m.dealer:kmVal("kmInv", m.dealer);
      const useTi=kmVal("kmUseTi", false);
      const useLoan=kmVal("kmUseLoan", false);
      const hasDealCr=m.cr>0;
      const dealCrLabel=m.id==="t7p"?"Выгодный кредит":"Прямая скидка";
      const dealCrNeedsLoan=m.id==="t7p";
      const showDealCr=hasDealCr && (!dealCrNeedsLoan || useLoan);
      const useCr=showDealCr && kmVal("kmUseCr", false);
      const spec=kmVal("kmSpec", 0);
      const useDcTi=useTi && kmVal("kmUseDcTi", false);
      const useDcCr=useLoan && kmVal("kmUseDcCr", false);
      const dcTi=useDcTi?kmVal("kmDcTi", typeof KM_DC_DEF==="number"?KM_DC_DEF:100000):0;
      const addons=kmVal("kmDo", 70000);
      let casco=0, card=0, pack=0;
      if(useLoan){
        pack=kmVal("kmPack", 150000);
        casco=Math.min(pack, 80000);
        card=Math.max(0, pack-80000);
      }else{
        casco=kmVal("kmCasco", 80000);
        card=0;
      }
      const prio=PRIO_VINS.has(kmVin);
      const tiAmt=useTi?m.ti:0;
      const tiBack=useTi?m.tiBack:0;
      const crAmt=useCr?m.cr:0;
      const crBack=useCr?m.crBack:0;
      const lo=prio?m.prioMin:m.kmMin;
      const hi=prio?m.prioMax:m.kmMax;
      const dcPack={rrc,invoice,vat:m.vat,fee:m.fee,bonus:m.bonus,tiAmt,tiBack,spec,dcTi,crAmt,crBack,addons,casco,card};
      const dcFit=typeof kmDcCrFit==="function"?kmDcCrFit(dcPack, lo):(typeof KM_DC_DEF==="number"?KM_DC_DEF:100000);
      const dcMin=typeof kmDcCrMin==="function"?kmDcCrMin(dcPack, hi):0;
      const dcDef=typeof KM_DC_DEF==="number"?KM_DC_DEF:100000;
      let dcCr=0;
      if(useDcCr){
        const typedEl=document.getElementById("kmDcCr");
        const typed=typedEl?kmVal("kmDcCr", NaN):NaN;
        const want=(fresh || !typedEl || !Number.isFinite(typed))?dcDef:typed;
        dcCr=Math.min(Math.max(0, want, dcMin), dcFit);
        dcCr=Math.max(0, Math.round(dcCr));
      }
      const discount=tiAmt+spec+dcTi+dcCr+crAmt;
      const bonus=invoice>0?(invoice/m.vat)*m.bonus:0;
      const margin=rrc-invoice;
      const carPrice=rrc-discount;
      const client=carPrice+addons;
      const iron=margin-discount+tiBack+crBack+bonus*1.2;
      const km=(addons*0.3+casco*0.3+card*0.8+iron)/m.vat-carPrice*m.fee;
      const kmK=km/1000;
      const ok=kmK+0.05>=lo && kmK-0.05<=hi;
      const price=Math.round(carPrice);
      const fee=typeof KM_BANK_FEE==="number"?KM_BANK_FEE:30000;
      const _pgTrim=(typeof pangoOf==="function")?pangoOf(m.id):null;
      if(_pgTrim && !useLoan) pack=150000;
      const extras=(useLoan||_pgTrim)?(addons+(pack||0)+fee):0;
      const finDelta=(addons-70000)+((useLoan||_pgTrim)?((pack||0)-150000):0);
      const downMode=kmStr("cDownMode","pct");
      const months=kmVal("cMonths", 60);
      let downPct=kmVal("cDownPct", 20);
      let down=kmVal("cDown", Math.round(price*0.2));
      if(fresh){ downPct=20; down=Math.round(price*0.2); }
      if(downMode==="pct") down=Math.round(price*Math.max(0,downPct)/100);
      else downPct=price>0?Math.round(down*1000/price)/10:0;
      down=Math.max(0, Math.min(price, down));
      const credit=Math.max(0,price-down+extras);
      const rateGroup=typeof kmRateGroup==="function"?kmRateGroup(m):"t4l_t7";
      const stockCars=typeof kmStockCars==="function"?kmStockCars(m):[];
      const mptCars=stockCars.filter(c=>typeof carIsMpt==="function"?carIsMpt(c):c.mpt);
      const hasMpt=mptCars.length>0;
      const hasReg=stockCars.some(c=>!(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)) || !stockCars.length;
      const selected=(typeof STOCK!=="undefined"?STOCK:[]).find(c=>c && c.vin===kmVin);
      const pickMpt=!!(selected && (typeof carIsMpt==="function"?carIsMpt(selected):selected.mpt));
      const fMpt=typeof fleetOf==="function"?fleetOf(m.id):null;
      const canSub=typeof kmHasBrandSub==="function"?kmHasBrandSub(m):!!(fMpt&&(fMpt.sub||0)>0&&m.id!=="tt9p"&&m.id!=="tt9u");
      const showMpt=pickMpt || (!selected && hasMpt);
      const showSub=!showMpt && canSub;
      const showSplit=showMpt || showSub;
      const mptSample=mptCars[0]||(pickMpt&&selected?selected:null);
      const mptRrc=fMpt&&fMpt.rrc?fMpt.rrc:price;
      const mptTidy=fMpt&&fMpt.tidy?fMpt.tidy:mptRrc;
      const fleetCutMpt=Math.max(0, mptRrc-mptTidy);
      const tiMpt=useTi?(typeof FLEET_TI==="number"?FLEET_TI:50000):0;
      const beforeMptPct=Math.max(0, mptTidy-tiMpt);
      const subAmt=(fMpt&&fMpt.sub)||0;
      const priceMpt=showSub?Math.max(0, beforeMptPct-subAmt):Math.round(beforeMptPct*0.9);
      const MPT_EXTRA=200000;
      const downMptShow=Math.max(0, Math.min(priceMpt, down));
      const downMptCar=Math.max(0, downMptShow-MPT_EXTRA);
      const creditMpt=Math.max(0, priceMpt-downMptCar+finDelta);
      const mptTermMax=84;
      const mptTerm=Math.min(Math.max(1, months), mptTermMax);
      const mptRate=19.2;
      const payMptOne=calcPay(priceMpt+finDelta, downMptCar, mptTerm, mptRate);
      const overMptOne=payMptOne*mptTerm-creditMpt;
      const banksMpt=[{id:"sovcom", name:"Совкомбанк", rate:mptRate, term:mptTerm, capped:mptTerm!==months, payMpt:payMptOne, overMpt:overMptOne}];
      const mptBreak=`<div class="mpt-break">
                <div class="bank-row"><span>Комплектация</span><span class="pay">${escape((fMpt&&fMpt.name)||m.name)}</span></div>
                ${mptSample?`<div class="bank-row"><span>На складе</span><span class="pay">${escape(mptSample.color||"—")} · ${escape(mptSample.vin||"")}</span></div>`:""}
                <div class="bank-row"><span>РРЦ</span><span class="pay">${rub(mptRrc)}</span></div>
                <div class="bank-row"><span>Флит</span><span class="pay">${rub(mptTidy)}</span></div>
                ${useTi?`<div class="bank-row"><span>Трейд-ин</span><span class="pay">− ${rub(tiMpt)}</span></div>`:""}
                <div class="bank-row"><span>${showSub?"Субсидия бренда −"+rub(subAmt):"МПТ −10%"}</span><span class="pay">${rub(priceMpt)}</span></div>
                <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(downMptShow)}</span></div>
                <div class="bank-row"><span>из них каско и Д/О</span><span class="pay">${rub(Math.min(MPT_EXTRA, downMptShow))}</span></div>
                <div class="bank-row"><span>ПВ в авто</span><span class="pay">${rub(downMptCar)}</span></div>
                ${finDelta?`<div class="bank-row"><span>Д/О и каско сверх нормы</span><span class="pay">${finDelta>0?"+":"−"} ${rub(Math.abs(finDelta))}</span></div>`:""}
                <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
              </div>`;
      const banks=(typeof KM_BANKS!=="undefined"?KM_BANKS:[]).map(b=>{
        const look=typeof kmBankRate==="function"?kmBankRate(b.id, rateGroup, months, downPct):{rate:b.rate||0, term:months, capped:false};
        const term=look.term||months;
        const pay=calcPay(price+extras, down, term, look.rate);
        return Object.assign({}, b, {rate:look.rate, term, capped:!!look.capped, pay, over:pay*term-credit});
      });
      function kmPayRows(list, payKey, overKey){
        return list.map(b=>{
          const yearsWant=Math.round(months/12);
          const yearsHave=Math.round(b.term/12);
          const note=b.capped?`нет ${yearsWant} ${yearsWant===1?"года":"лет"} · считаем ${b.term} мес. (${yearsHave} ${yearsHave===1?"год":yearsHave<5?"года":"лет"})`: `${b.term} мес.`;
          const pay=Math.round(b[payKey]||0);
          const over=Math.round(b[overKey]||0);
          return `<div class="bank-row"><span><b>${escape(b.name)}</b><br/><small>${b.rate}% · ${note} · переплата ~${rub(over)}</small></span><span class="pay">${rub(pay)} ₽</span></div>`;
        }).join("");
      }
      const _pg=(typeof pangoOf==="function")?pangoOf(m.id):null;
      const pShow=!!(_pg && (showMpt || showSub || canSub));
      let pFix=0, pDownP=0, pBundle=150000, pBase=0, pCreditB=0, pRateA=17.4, pRateB=14.4, pNss=0, pPayA=0, pPayB=0, pOverA=0, pOverB=0, pYears=0, pYearsLabel="0", pYearsWord="лет", pKm=km, pKmK=kmK, pOk=ok, pDiscount=0, pTiBack=0, pCard=0, pBonus=0, pMargin=0, pIron=0;
      if(_pg){
        pFix=useTi?_pg.ti:_pg.cash;
        pDownP=Math.max(0, Math.min(pFix, down));
        pBundle=typeof PANGO_BUNDLE==="number"?PANGO_BUNDLE:150000;
        pRateA=typeof PANGO_RATE_A==="number"?PANGO_RATE_A:17.4;
        pRateB=typeof PANGO_RATE_B==="number"?PANGO_RATE_B:14.4;
        const pNssRate=typeof PANGO_NSS==="number"?PANGO_NSS:0.0089;
        pYears=months/12;
        pYearsLabel=Math.abs(pYears-Math.round(pYears))<0.05?String(Math.round(pYears)):pYears.toFixed(1);
        const yNum=Number(pYearsLabel);
        pYearsWord=(yNum===1)?"год":(yNum>1&&yNum<5&&Math.abs(yNum-Math.round(yNum))<0.05?"года":"лет");
        pBase=Math.max(0, pFix-pDownP)+pBundle+finDelta;
        pNss=Math.round(pBase*pNssRate*pYears);
        pCreditB=pBase+pNss;
        pPayA=calcPay(pBase+pDownP, pDownP, months, pRateA);
        pPayB=calcPay(pCreditB+pDownP, pDownP, months, pRateB);
        pOverA=pPayA*months-pBase;
        pOverB=pPayB*months-pCreditB;
        pDiscount=Math.max(0, rrc-pFix);
        pTiBack=useTi?(m.tiBack||0):0;
        const pCasco=80000; pCard=Math.max(0, pBundle-pCasco);
        pBonus=invoice>0?(invoice/m.vat)*m.bonus:0;
        pMargin=rrc-invoice;
        pIron=pMargin-pDiscount+pTiBack+pBonus*1.2;
        pKm=(pCasco*0.3+pCard*0.8+pIron)/m.vat-pFix*m.fee;
        pKmK=pKm/1000;
        pOk=pKmK+0.05>=lo && pKmK-0.05<=hi;
      }
      return banner("Калькулятор","КМ и платёж · база "+TERMS_DATE,"TENET")+`
        <p class="lead">${pShow?"Три расчёта рядом: стандартный кредит, "+(showSub?"флит с субсидией бренда":"МПТ")+" и спеццена PANGO.":"Сначала комплектация. Кредит и СЖ открываются галочкой «Кредит»."}</p>
        <div class="km-stage${pShow?" km-4":useLoan&&showSplit?" km-3":""}">
        <div class="km-chips">${kmChipGroups(m.id)}</div>
        <div class="km-layout${pShow?" km-4":useLoan&&showSplit?" km-3":""}">
          <div class="card km-disc">
            <p class="eyebrow">Калькулятор КМ · ${escape(m.name)}</p>
            <label class="field" style="max-width:none;margin-top:8px"><span>РРЦ, ₽ · из условий ${TERMS_DATE}</span><input id="kmRrc" inputmode="numeric" value="${rrc}" /></label>
            <label class="field" style="max-width:none"><span>Сумма счёта, ₽ · из условий ${TERMS_DATE}</span><input id="kmInv" inputmode="numeric" value="${invoice}" /></label>
            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин ${m.ti?rub(m.ti)+" / возмещение "+rub(m.tiBack):"нет в базе"}</span></label>
            <label class="check-row"><input id="kmUseLoan" type="checkbox" ${useLoan?"checked":""} /> <span>Кредит</span></label>
            ${showDealCr?`<label class="check-row"><input id="kmUseCr" type="checkbox" ${useCr?"checked":""} /> <span>${dealCrLabel} · ${rub(m.cr)}${m.crBack?` / возмещение ${rub(m.crBack)}`:""}</span></label>`:""}
            <label class="field" style="max-width:none"><span>Спецпредложение, ₽</span><input id="kmSpec" inputmode="numeric" value="${spec}" /></label>
            ${useTi?`<label class="check-row"><input id="kmUseDcTi" type="checkbox" ${useDcTi?"checked":""} /> <span>Скидка от ДЦ за трейд-ин ${rub(KM_DC_DEF)}</span></label>`:""}
            ${useTi&&useDcTi?`<label class="field" style="max-width:none"><span>Сумма скидки ДЦ за трейд-ин, ₽</span><input id="kmDcTi" inputmode="numeric" value="${dcTi||KM_DC_DEF}" /></label>`:""}
            ${useLoan?`<label class="check-row"><input id="kmUseDcCr" type="checkbox" ${useDcCr?"checked":""} /> <span>Скидка от ДЦ за кредит${dcFit?` · до ${rub(dcFit)} в коридоре`:""}</span></label>`:""}
            ${useLoan&&useDcCr?`<label class="field" style="max-width:none"><span>Сумма скидки ДЦ за кредит, ₽ · коридор от ${lo} тыс.</span><input id="kmDcCr" inputmode="numeric" value="${dcCr}" /></label>`:""}
            <label class="field" style="max-width:none"><span>Д/О, ₽</span><input id="kmDo" inputmode="numeric" value="${addons}" /></label>
            <div class="note-box" style="margin-top:14px">
              <p class="eyebrow" style="margin:0 0 6px">Итоговая цена для клиента</p>
              ${Math.round(rrc+addons)>Math.round(client)?`<div class="calc-out" style="text-decoration:line-through;opacity:.42;margin-bottom:2px">${rub(Math.round(rrc+addons))} ₽</div>`:""}
              <div class="calc-out">${rub(Math.round(client))} ₽</div>
              <p class="calc-note">Авто ${rub(Math.round(carPrice))} + Д/О ${rub(Math.round(addons))}. Каско не входит.${discount?` Скидка ${rub(Math.round(discount))}.`:""}</p>
            </div>
            ${_pg?`<div class="note-box">Спеццена ${rub(_pg.cash)} без трейд-ин · ${rub(_pg.ti)} с трейд-ин. ${(selected&&selected.invoice)?"Этот VIN по спеццене — блок PANGO.":"Блок PANGO — спеццена для сравнения."}</div>`:""}
            ${useLoan
              ?`<label class="field" style="max-width:none"><span>Каско расширенное, ₽</span><input id="kmPack" inputmode="numeric" value="${pack}" /></label>`
              :`<label class="field" style="max-width:none"><span>КАСКО, ₽</span><input id="kmCasco" inputmode="numeric" value="${casco}" /></label>`}
            ${prio?`<div class="note-box">Приоритетный VIN ${escape(kmVin)}. Коридор ${lo} … ${hi} тыс.</div>`:""}
            ${useLoan&&!showSplit&&!pShow?`<p class="eyebrow" style="margin-top:12px">Первый взнос</p>
              <div class="down-mode">
                <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
                <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
              </div>
              <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
              ${downMode==="sum"
                ?`<label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
                :`<label class="field" style="max-width:none"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
              <p class="calc-note">${rub(down)} ₽ · ${downPct}% от цены авто${(showMpt||showSub)?` · ${showSub?"субс. бренда":"МПТ"}: ${rub(priceMpt)} − ПВ в авто ${rub(downMptCar)} = тело ${rub(creditMpt)}`:""}</p>
              <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>`:""}
          </div>
          ${(useLoan&&showSplit)||pShow?`<div class="km-credit"><div class="card km-pv">
          <p class="eyebrow">Первый взнос</p>
          <div class="km-pv-row">
            <div class="down-mode">
              <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
              <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
            </div>
            ${downMode==="sum"
              ?`<label class="field"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
              :`<label class="field"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
            <label class="field"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>
          </div>
          <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
          <p class="calc-note">${rub(down)} ₽ · ${downPct}% от цены авто${(showMpt||showSub)?` · ${showSub?"субс. бренда":"МПТ"}: ${rub(priceMpt)} − ПВ в авто ${rub(downMptCar)} = тело ${rub(creditMpt)}`:""}</p>
        </div><div class="km-pays">
          <div class="pay-col std km-pay">
            <p class="eyebrow">Стандартный кредит</p>
            <p class="calc-note">ПВ ${rub(down)} · тело ${rub(credit)}</p>
            ${kmPayRows(banks,"pay","over")}
            <p class="calc-note">Ставки TENET ФИНАНС, ИП 1890/И. Кредит = авто ${rub(price)} − ПВ + Д/О ${rub(addons)} + каско ${rub(pack)} + комиссия банка.</p>
          </div>
          <div class="pay-col ${showSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${showSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            ${kmPayRows(banksMpt,"payMpt","overMpt")}
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
            <details class="calc-more">
              <summary>Подробности расчёта</summary>
              <p class="calc-note">${showSub?"Машина не проходит под МПТ. Это не стандартный кредит: цена флита минус субсидия бренда (AQ), Совкомбанк 19,2%.":"ПВ "+rub(downMptShow)+" · из них "+rub(Math.min(MPT_EXTRA, downMptShow))+" на каско и Д/О."}</p>
              ${mptBreak}
            </details>
          </div>
          ${pShow?`<div class="pay-col pango km-pay">
            <p class="eyebrow">Спеццена · PANGO</p>
            <p class="eyebrow" style="margin-top:8px">17,4% без комиссий</p>
            <div class="bank-row pay-top"><span><b>Платёж</b><br/><small>${pRateA}% · ${months} мес. · переплата ~${rub(Math.round(pOverA))}</small></span><span class="pay">${rub(Math.round(pPayA))} ₽</span></div>
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(pBase)}</span></div>
            <p class="eyebrow" style="margin-top:8px">14,4% · НСС в теле</p>
            <div class="bank-row pay-top"><span><b>Платёж</b><br/><small>${pRateB}% · ${months} мес. · переплата ~${rub(Math.round(pOverB))}</small></span><span class="pay">${rub(Math.round(pPayB))} ₽</span></div>
            <div class="bank-row"><span>Тело с НСС</span><span class="pay">${rub(pCreditB)}</span></div>
            <details class="calc-more">
              <summary>Подробности расчёта</summary>
              <p class="calc-note">${selected&&selected.invoice?"Этот VIN по спеццене.":"Если машина по спеццене."} Фикс ${useTi?"с трейд-ин":"без трейд-ин"} ${rub(pFix)}. Каско + GAP + ДМС ${rub(pBundle)} всегда в кредите.</p>
              <div class="bank-row"><span>Цена авто</span><span class="pay">${rub(pFix)}</span></div>
              <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(pDownP)}</span></div>
              <div class="bank-row"><span>Каско + GAP + ДМС</span><span class="pay">${rub(pBundle)}</span></div>
              ${finDelta?`<div class="bank-row"><span>Д/О и каско сверх нормы</span><span class="pay">${finDelta>0?"+":"−"} ${rub(Math.abs(finDelta))}</span></div>`:""}
              <div class="bank-row"><span>НСС 0,89% × ${pYearsLabel} ${pYearsWord}</span><span class="pay">${rub(pNss)}</span></div>
            </details>
          </div>`:""}</div></div>`: `<div class="km-right">
            ${useLoan?`<div class="card">
              <p class="eyebrow">Кредит · ${escape(m.name)}</p>
              <p class="calc-note">ПВ от цены авто ${rub(price)} ₽, без Д/О и каско. В кредит входят авто − ПВ, Д/О, каско расширенное и комиссия банка.${pickMpt?" Выбран VIN с меткой МПТ.":""}</p>
              ${showMpt||showSub?`<p class="eyebrow" style="margin-top:16px">${showSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
              ${kmPayRows(banksMpt,"payMpt","overMpt")}
              <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
              <details class="calc-more"><summary>Подробности расчёта</summary>
              <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О.</p>
              ${mptBreak}</details>`
              :`<p class="eyebrow" style="margin-top:16px">Платёж в месяц</p>
              ${kmPayRows(banks,"pay","over")}`}
              <p class="calc-note">${showMpt?"МПТ. ":showSub?"Субсидия бренда. ":""}Ставки TENET ФИНАНС, ИП 1890/И. Кредит = авто ${rub(price)} − ПВ + Д/О ${rub(addons)} + каско ${rub(pack)} + комиссия банка.</p>
            </div>`:`<div class="card"><p class="eyebrow">Кредит</p><p class="lead" style="max-width:none">Включите галочку «Кредит», чтобы открыть расчёт платежа${hasMpt?" и сравнение с МПТ":canSub?" и сравнение с субсидией бренда":""}.</p></div>`}
            ${kmSideList(m, price, downPct, months, extras)}
          </div>`}
        </div>
        </div>
        <div class="${(useLoan&&showSplit)||pShow?"km-bottom":""}">
          <div class="card dc-result ${(selected&&selected.invoice&&_pg?pOk:ok)?"ok":"bad"}">
            <p class="eyebrow">Доходность ДЦ · КМ без НДС${selected&&selected.invoice&&_pg?" · спеццена":""}</p>
            <div class="calc-out">${rub(Math.round(selected&&selected.invoice&&_pg?pKm:km))} ₽</div>
            <p class="calc-note">Коридор ${lo} … ${hi} тыс. · сейчас ${(selected&&selected.invoice&&_pg?pKmK:kmK).toFixed(1)} тыс. · ${(selected&&selected.invoice&&_pg?pOk:ok)?"в коридоре":"вне коридора"}</p>
            <div class="note-box">${selected&&selected.invoice&&_pg?`Спеццена <b>${rub(pFix)} ₽</b> · скидка от РРЦ ${rub(pDiscount)}<br/>Маржа 1С ${rub(Math.round(pMargin))} · бонус ${rub(Math.round(pBonus))} · доход на железе ${rub(Math.round(pIron))}<br/>Каско 80 000 + GAP/ДМС ${rub(pCard)} внутри PANGO${useTi?" · возмещение трейд-ин "+rub(pTiBack):""}`:`Цена авто <b>${rub(Math.round(carPrice))} ₽</b> · клиенту с Д/О <b>${rub(Math.round(client))} ₽</b><br/>Скидка ${rub(Math.round(discount))} · маржа 1С ${rub(Math.round(margin))}<br/>Бонус ${rub(Math.round(bonus))} (${Math.round(m.bonus*100)}%) · доход на железе ${rub(Math.round(iron))}<br/>НДС ${m.vat===1.22?"22%":"20%"} · сбор ${Math.round(m.fee*100)}% от цены авто${prio?" · приоритет":""}`}</div>
          </div>
          ${(useLoan&&showSplit)||pShow?kmSideList(m, price, downPct, months, extras):""}
        </div>`;
    }
    function calc(){
      if(needAuth()) return login();
      calcMode="km";
      return calcKm();
    }
