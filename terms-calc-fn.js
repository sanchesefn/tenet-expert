    const TERMS_DATE = "10.09.2026";
    const KM_CORRIDOR = [
      {model:"t4", name:"T4 2025", km:"-30 / 20", note:"старый T4"},
      {model:"t4l", name:"T4L любая", km:"0 / 50", note:"Active и Prime"},
      {model:"t7", name:"T7 любая", km:"0 / 50", note:"2WD и 4WD"},
      {model:"t8p", name:"T8 приоритет", km:"-20 / 0", note:"VIN из списка приоритета"},
      {model:"t8", name:"T8 остальные", km:"0 / 30", note:""},
      {model:"t9p", name:"Tiggo 9 приоритет", km:"-20 / 0", note:"VIN из списка приоритета"},
      {model:"t9", name:"Tiggo 9 остальные", km:"0 / 30", note:""},
      {model:"a8p", name:"Arrizo 8 приоритет", km:"-30 / 0", note:"VIN из списка приоритета"},
      {model:"a8", name:"Arrizo 8 остальные", km:"0 / 30", note:""}
    ];
    const TERMS_BONUS = [
      {name:"T4 2025", bonus:"3%"},
      {name:"T4L Active", bonus:"1%"},
      {name:"T4L Prime", bonus:"3%"},
      {name:"T7 любые", bonus:"2%"},
      {name:"T8 2WD", bonus:"2%"},
      {name:"T8 4WD", bonus:"3%"},
      {name:"Tiggo 9 Prime", bonus:"0%"},
      {name:"Tiggo 9 Ultra", bonus:"2%"},
      {name:"Arrizo 8 любые", bonus:"2%"}
    ];
