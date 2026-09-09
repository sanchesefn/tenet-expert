    const TERMS_DATE = "10.09.2026";
    const KM_CORRIDOR = [
      {name:"T4 2025", km:"-30 / 20", note:"старый T4"},
      {name:"T4L любая", km:"0 / 50", note:"Active и Prime"},
      {name:"T7 любая", km:"0 / 50", note:"2WD и 4WD"},
      {name:"T8 приоритет", km:"-20 / 0", note:"VIN из списка"},
      {name:"T8 остальные", km:"0 / 30", note:""},
      {name:"Tiggo 9 приоритет", km:"-20 / 0", note:"VIN из списка"},
      {name:"Tiggo 9 остальные", km:"0 / 30", note:""},
      {name:"Arrizo 8 приоритет", km:"-30 / 0", note:"VIN из списка"},
      {name:"Arrizo 8 остальные", km:"0 / 30", note:""}
    ];
    const TERMS_BONUS = [
      {name:"T4 2025", bonus:"3%"},{name:"T4L Active", bonus:"1%"},{name:"T4L Prime", bonus:"3%"},
      {name:"T7 любые", bonus:"2%"},{name:"T8 2WD", bonus:"2%"},{name:"T8 4WD", bonus:"3%"},
      {name:"Tiggo 9 Prime", bonus:"0%"},{name:"Tiggo 9 Ultra", bonus:"2%"},{name:"Arrizo 8 любые", bonus:"2%"}
    ];
    const TERMS_MPT = [
      {line:"T7 2WD", rows:[["до 14.03","субс. бренда"],["с 14.03 до 15.04","МПТ"],["с 15.04 до 7.05","субс. бренда"],["с 8.05 и далее","МПТ"]]},
      {line:"T7 4WD", rows:[["до 7.04","субс. бренда"],["с 8.04 до 15.04","МПТ"],["с 16.04 до 7.05","субс. бренда"],["с 8.05 и далее","МПТ"]]}
    ];
    const TERMS_INV = [
      {name:"T4L Active", cash:"2 200 000", ti:"2 150 000"},
      {name:"T4L Prime", cash:"2 300 000", ti:"2 250 000"},
      {name:"T7 Prime 2WD", cash:"2 550 000", ti:"2 450 000"},
      {name:"T8 Prime 4WD", cash:"3 100 000", ti:"3 000 000"},
      {name:"T8 Ultra 4WD", cash:"3 300 000", ti:"3 200 000"}
    ];
    const TERMS_PRIO = [
      {model:"T4", vin:"EDEED31B1SE053704", trim:"Prime 4WD", year:"2025", color:"Белый", extra:"Сидоров", pay:500, bonus:1000},
      {model:"T7", vin:"EDXFB32B4TE041659", trim:"Active", year:"2026", color:"Чёрный", extra:"", pay:500, bonus:1000},
      {model:"T7", vin:"EDXFB32B2TE041658", trim:"Active", year:"2026", color:"Чёрный", extra:"", pay:500, bonus:1000},
      {model:"T7", vin:"EDXFB32B7TE062327", trim:"Active", year:"2026", color:"Чёрный", extra:"Антихром", pay:500, bonus:1000},
      {model:"T8", vin:"EDXGD34B1TE022143", trim:"Prime 4WD", year:"2026", color:"Светло-серый", extra:"", pay:500, bonus:2000},
      {model:"T8", vin:"EDXGD34B6TE031162", trim:"Prime 4WD", year:"2026", color:"Чёрный", extra:"", pay:500, bonus:2000},
      {model:"T8", vin:"EDXGD34B3TE031815", trim:"Ultra 4WD", year:"2026", color:"Белый", extra:"", pay:500, bonus:2000},
      {model:"Tiggo 9", vin:"EDEDD24B2SG003755", trim:"Ultra", year:"2025", color:"Светло-серый", extra:"", pay:500, bonus:3000},
      {model:"Tiggo 9", vin:"EDEDD24B3SG003926", trim:"Ultra", year:"2025", color:"Матовый", extra:"", pay:500, bonus:3000},
      {model:"Tiggo 9", vin:"EDEDD24B1SG002595", trim:"Ultra", year:"2025", color:"Чёрный", extra:"Новиков", pay:500, bonus:0},
      {model:"Arrizo 8", vin:"LVVDC21B7SD594110", trim:"Prime", year:"2025", color:"Белый", extra:"", pay:500, bonus:3000},
      {model:"Arrizo 8", vin:"LVVDC21B0SD594112", trim:"Prime", year:"2025", color:"Белый", extra:"", pay:500, bonus:3000},
      {model:"Arrizo 8", vin:"LVVDC21B2SDJ34062", trim:"Prime", year:"2025", color:"Чёрный", extra:"", pay:500, bonus:3000},
      {model:"8 Pro Max", vin:"LVTDD24B5RD409189", trim:"Ultimate", year:"2024", color:"Белый", extra:"ТЕСТ", pay:500, bonus:10000}
    ];
