#!/usr/bin/env python3
"""DC credit discount = max that keeps KM at corridor floor, not a flat 100k."""
from pathlib import Path

HELPERS = r"""    function kmProfit(p){
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
"""

OLD_DCCR = """      const useDcCr=useLoan && kmVal("kmUseDcCr", false);
      const dcTi=useDcTi?kmVal("kmDcTi", typeof KM_DC_DEF==="number"?KM_DC_DEF:100000):0;
      const dcCr=useDcCr?kmVal("kmDcCr", typeof KM_DC_DEF==="number"?KM_DC_DEF:100000):0;
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
      const hi=prio?m.prioMax:m.kmMax;"""

NEW_DCCR = """      const useDcCr=useLoan && kmVal("kmUseDcCr", false);
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
      }"""

OLD_LABEL = """            ${useLoan?`<label class="check-row"><input id="kmUseDcCr" type="checkbox" ${useDcCr?"checked":""} /> <span>Скидка от ДЦ за кредит ${rub(KM_DC_DEF)}</span></label>`:""}
            ${useLoan&&useDcCr?`<label class="field" style="max-width:none"><span>Сумма скидки ДЦ за кредит, ₽</span><input id="kmDcCr" inputmode="numeric" value="${dcCr||KM_DC_DEF}" /></label>`:""}"""

NEW_LABEL = """            ${useLoan?`<label class="check-row"><input id="kmUseDcCr" type="checkbox" ${useDcCr?"checked":""} /> <span>Скидка от ДЦ за кредит${dcFit?` · до ${rub(dcFit)} в коридоре`:""}</span></label>`:""}
            ${useLoan&&useDcCr?`<label class="field" style="max-width:none"><span>Сумма скидки ДЦ за кредит, ₽ · коридор от ${lo} тыс.</span><input id="kmDcCr" inputmode="numeric" value="${dcCr}" /></label>`:""}"""


def patch_text(text):
    if "function kmDcCrFit(" not in text and "    function calcKm(){" in text:
        text = text.replace("    function calcKm(){", HELPERS + "    function calcKm(){", 1)
    if OLD_DCCR in text:
        text = text.replace(OLD_DCCR, NEW_DCCR, 1)
    if OLD_LABEL in text:
        text = text.replace(OLD_LABEL, NEW_LABEL, 1)
    return text


def main():
    for path in (Path("index.html"), Path("_site/index.html"), Path("TENET_T4L_netlify/index.html"), Path("terms-calc-ui-b.js"), Path("terms-calc-fn.js")):
        if not path.exists() or path.stat().st_size < 200:
            continue
        src = path.read_text(encoding="utf-8")
        out = patch_text(src)
        if out != src:
            path.write_text(out, encoding="utf-8")
            print("km dccr patched", path, path.stat().st_size)
        else:
            print(path, "km dccr already")


if __name__ == "__main__":
    main()
