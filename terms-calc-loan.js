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
