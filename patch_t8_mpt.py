#!/usr/bin/env python3
"""T8 2WD → корп+мпт + МПТ-калькулятор; не-МПТ (кроме TENET T9) → субсидия бренда AQ."""
from pathlib import Path
import json, re

EXTRA_CORP = ["EDXGB32B0TE110108", "EDXGB32B3TE076049"]

HELPERS = r'''    function isT8TwoWd(c){
      if(!c) return false;
      const vin=String(c.vin||"").toUpperCase();
      if(vin.indexOf("EDXGB32B")===0) return true;
      if(String(c.model||"").toLowerCase()!=="t8") return false;
      const t=String(c.trim||"").toLowerCase();
      if(t.includes("4wd")||t.includes("ультра")||t.includes("7 мест")) return false;
      return t.includes("2wd") || t.includes("актив") || t.includes("прайм") || !t;
    }
    function carIsMpt(c){ return !!(c && (c.mpt || isT8TwoWd(c))); }
    function carIsCorp(c){ return !!(c && (c.corp || (typeof CORP_VINS!=="undefined"&&CORP_VINS.has(c.vin)) || isT8TwoWd(c))); }
    function kmHasBrandSub(m){
      if(!m || m.id==="tt9p" || m.id==="tt9u" || m.stock==="tt9") return false;
      const f=typeof fleetOf==="function"?fleetOf(m.id):null;
      return !!(f && (f.sub||0)>0);
    }
    function kmIsCorp(vin){
      const v=String(vin||"");
      if(typeof CORP_VINS!=="undefined" && CORP_VINS.has(v)) return true;
      if(v.toUpperCase().indexOf("EDXGB32B")===0) return true;
      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===v);
      return !!(car && (typeof carIsCorp==="function"?carIsCorp(car):car.corp));
    }
'''

OLD_KM_IS_CORP = r'''    function kmIsCorp(vin){
      const v=String(vin||"");
      if(CORP_VINS.has(v)) return true;
      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===v);
      return !!(car && car.corp);
    }
'''


def is_t8_2wd(car):
    if not car:
        return False
    vin = str(car.get("vin") or "").upper()
    if vin.startswith("EDXGB32B"):
        return True
    if str(car.get("model") or "").lower() != "t8":
        return False
    t = str(car.get("trim") or "").lower()
    if "4wd" in t or "ультра" in t or "7 мест" in t:
        return False
    return "2wd" in t or "актив" in t or "прайм" in t or not t


def add_corp_vins(text):
    n = 0
    for vin in EXTRA_CORP:
        if f'"{vin}"' in text and "CORP_VINS" in text:
            # already listed somewhere; still ensure inside CORP_VINS
            pass
        if re.search(r'const CORP_VINS = new Set\(\[[^\]]*?"' + vin + r'"', text, re.S):
            continue
        text2, k = re.subn(
            r'(const CORP_VINS = new Set\(\[[^\]]*?"EDXGB32BXTE087470")',
            r'\1,\n      "' + vin + '"',
            text,
            count=1,
            flags=re.S,
        )
        if k:
            text = text2
            n += 1
        else:
            text2, k = re.subn(
                r'(const CORP_VINS = new Set\(\[[^\]]*?)(\]\);)',
                r'\1,"' + vin + r'"\2',
                text,
                count=1,
                flags=re.S,
            )
            if k:
                text = text2
                n += 1
    return text, n


def inject_helpers(text):
    if "function isT8TwoWd(" in text and "function carIsMpt(" in text and "function kmHasBrandSub(" in text:
        # refresh helpers + kmIsCorp in place
        text2, n = re.subn(
            r"    function isT8TwoWd\([\s\S]*?    function kmIsCorp\(vin\)\{[\s\S]*?\n    \}\n",
            HELPERS,
            text,
            count=1,
        )
        if n:
            return text2, "refreshed"
        return text, "present"
    if OLD_KM_IS_CORP in text:
        return text.replace(OLD_KM_IS_CORP, HELPERS, 1), "replaced-old"
    text2, n = re.subn(
        r"    function kmIsCorp\(vin\)\{[\s\S]*?\n    \}\n",
        HELPERS,
        text,
        count=1,
    )
    if n:
        return text2, "replaced-regex"
    if "const FLEET_TI = 50000;" in text:
        return text.replace("    const FLEET_TI = 50000;\n", "    const FLEET_TI = 50000;\n" + HELPERS, 1), "inserted"
    return text, "missing"


def flag_stock(text):
    m = re.search(r"const STOCK = (\[.*?\]);", text, re.S)
    if not m:
        return text, 0
    try:
        stock = json.loads(m.group(1))
    except Exception as e:
        print("STOCK parse fail", e)
        return text, 0
    n = 0
    for x in stock:
        if is_t8_2wd(x):
            if not x.get("mpt") or not x.get("corp"):
                n += 1
            x["mpt"] = True
            x["corp"] = True
    dumped = json.dumps(stock, ensure_ascii=False)
    return text[: m.start(1)] + dumped + text[m.end(1) :], n


def patch_badges(text):
    old = """      if(r.mpt) bits.push(`<span class="st mpt">МПТ</span>`);
      if(r.corp || (typeof CORP_VINS!=="undefined" && CORP_VINS.has(r.vin))) bits.push(`<span class="st corp">Корпоративный</span>`);"""
    new = """      if(typeof carIsMpt==="function"?carIsMpt(r):r.mpt) bits.push(`<span class="st mpt">МПТ</span>`);
      if(typeof carIsCorp==="function"?carIsCorp(r):(r.corp || (typeof CORP_VINS!=="undefined" && CORP_VINS.has(r.vin)))) bits.push(`<span class="st corp">Корпоративный</span>`);"""
    if old in text:
        return text.replace(old, new), True
    if "carIsMpt(r)" in text:
        return text, False
    return text, False


def patch_side_list_tags(text):
    reps = [
        (
            '${c.mpt?" mpt":""}${c.demo?" demo":""}${on?" on":""}" data-km-vin="${escape(c.vin)}">\n          <b>${escape(c.color||"—")} · ${escape(c.trim||"")}${prio?" · приоритет":""}</b>\n          ${c.mpt?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}${c.demo?`<span class="mpt-tag demo-tag">ДЕМО</span>`:""}\n          <span class="vin">${escape(c.vin)}</span>\n          <span class="stock-meta">${st}${c.invoice?" · спец инвойс":""}${c.mpt?" · МПТ":""}${c.demo?" · ДЕМО":""}${c.note?" · "+escape(c.note):""}</span>',
            '${(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)?" mpt":""}${(typeof carIsCorp==="function"?carIsCorp(c):(c.corp||(typeof kmIsCorp==="function"&&kmIsCorp(c.vin))))?" corp":""}${c.demo?" demo":""}${on?" on":""}" data-km-vin="${escape(c.vin)}">\n          <b>${escape(c.color||"—")} · ${escape(c.trim||"")}${prio?" · приоритет":""}</b>\n          ${(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}${(typeof carIsCorp==="function"?carIsCorp(c):(c.corp||(typeof kmIsCorp==="function"&&kmIsCorp(c.vin))))?`<span class="mpt-tag corp-tag">Корп · лизинг</span>`:""}${c.demo?`<span class="mpt-tag demo-tag">ДЕМО</span>`:""}\n          <span class="vin">${escape(c.vin)}</span>\n          <span class="stock-meta">${st}${c.invoice?" · спец инвойс":""}${(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)?" · МПТ":""}${(typeof carIsCorp==="function"?carIsCorp(c):c.corp)?" · корп":""}${c.demo?" · ДЕМО":""}${c.note?" · "+escape(c.note):""}</span>',
        ),
        (
            'return `<button type="button" class="stock-car prio rec${r.c.mpt?" mpt":""}" data-km-vin="${escape(r.c.vin)}">\n            <b>${escape((r.mm&&r.mm.name)||r.c.name)} · ${escape(r.c.color||"—")}</b>\n            ${r.c.mpt?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}',
            'return `<button type="button" class="stock-car prio rec${(typeof carIsMpt==="function"?carIsMpt(r.c):r.c.mpt)?" mpt":""}${(typeof carIsCorp==="function"?carIsCorp(r.c):r.c.corp)?" corp":""}" data-km-vin="${escape(r.c.vin)}">\n            <b>${escape((r.mm&&r.mm.name)||r.c.name)} · ${escape(r.c.color||"—")}</b>\n            ${(typeof carIsMpt==="function"?carIsMpt(r.c):r.c.mpt)?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}${(typeof carIsCorp==="function"?carIsCorp(r.c):r.c.corp)?`<span class="mpt-tag corp-tag">Корп · лизинг</span>`:""}',
        ),
    ]
    n = 0
    for a, b in reps:
        if a in text:
            text = text.replace(a, b)
            n += 1
    return text, n


def patch_terms_mpt(text):
    old = '''      {line:"T7 4WD",rows:[
        ["до 7.04", "субс. бренда"],
        ["с 8.04 до 15.04", "МПТ"],
        ["с 16.04 до 7.05", "субс. бренда"],
        ["с 8.05 и далее", "МПТ"]
      ]}
    ];'''
    new = '''      {line:"T7 4WD",rows:[
        ["до 7.04", "субс. бренда"],
        ["с 8.04 до 15.04", "МПТ"],
        ["с 16.04 до 7.05", "субс. бренда"],
        ["с 8.05 и далее", "МПТ"]
      ]},
      {line:"T8 2WD",rows:[
        ["Active / Prime 5 мест", "МПТ"]
      ]}
    ];'''
    if '{line:"T8 2WD"' in text:
        return text, False
    if old in text:
        return text.replace(old, new, 1), True
    return text, False


def patch_bind(text):
    # collapse bloated kmFleetDisc repeats and add kmFleetSub once
    def clean(m):
        raw = m.group(0)
        ids = re.findall(r'"([^"]+)"', raw)
        keep = []
        seen = set()
        extra = ["kmFleetDisc", "kmFleetMpt", "kmFleetSub"]
        for i in ids + extra:
            if i not in seen:
                keep.append(i)
                seen.add(i)
        return "[" + ",".join(f'"{x}"' for x in keep) + "]"

    text2, n = re.subn(
        r'\[(?:\s*"kmRrc"[\s\S]*?"cMonths")(?:\s*,\s*"(?:kmFleetDisc|kmFleetMpt|kmFleetSub|kmRrc|kmInv|kmUseTi|cDown|cDownPct|cDownMode|cMonths)")*\s*\]',
        clean,
        text,
        count=1,
    )
    if n:
        return text2, True
    if '"kmFleetSub"' in text:
        return text, False
    if '"kmFleetMpt"' in text:
        return text.replace('"kmFleetMpt"', '"kmFleetMpt","kmFleetSub"', 1), True
    return text, False


def patch_calc_fleet(text):
    """Apply brand subsidy when MPT is off; keep MPT -10% when on. Do not stack."""
    old_price = '''      if(useFleet){ price=f.tidy; steps.push("флит −"+rub(fleetCut)); }
      if(useTi){ price=Math.max(0, price-FLEET_TI); steps.push("трейд-ин −"+rub(FLEET_TI)); }
      if(useMpt){ price=Math.round(price*0.9); steps.push("МПТ −10%"); }
      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===kmVin);
      const mptCut=Math.round((useFleet?f.tidy:f.rrc)*(useTi?0.9:1)*0.1);'''
    new_price = '''      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===kmVin);
      const carMpt=typeof carIsMpt==="function"?carIsMpt(car):!!(car&&car.mpt);
      const canSub=typeof kmHasBrandSub==="function"?kmHasBrandSub(m):((f.sub||0)>0 && m.id!=="tt9p" && m.id!=="tt9u");
      const useMpt=carMpt && kmVal("kmFleetMpt", true);
      const useSub=!useMpt && canSub && kmVal("kmFleetSub", true);
      if(useFleet){ price=f.tidy; steps.push("флит −"+rub(fleetCut)); }
      if(useTi){ price=Math.max(0, price-FLEET_TI); steps.push("трейд-ин −"+rub(FLEET_TI)); }
      if(useMpt){ price=Math.round(price*0.9); steps.push("МПТ −10%"); }
      else if(useSub){ price=Math.max(0, price-(f.sub||0)); steps.push("субс. бренда −"+rub(f.sub||0)); }
      const mptCut=Math.round((useFleet?f.tidy:f.rrc)*(useTi?0.9:1)*0.1);
      const subCut=f.sub||0;'''
    n = 0
    # drop the early useMpt so we recompute after carMpt
    old_head = '''      const useFleet=kmVal("kmFleetDisc", true);
      const useMpt=kmVal("kmFleetMpt", true);
      const useTi=kmVal("kmUseTi", false);
      let price=f.rrc;
      const fleetCut=Math.max(0, f.rrc-(f.tidy||f.rrc));
      const steps=[];
      if(useFleet){ price=f.tidy; steps.push("флит −"+rub(fleetCut)); }
      if(useTi){ price=Math.max(0, price-FLEET_TI); steps.push("трейд-ин −"+rub(FLEET_TI)); }
      if(useMpt){ price=Math.round(price*0.9); steps.push("МПТ −10%"); }
      const car=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===kmVin);
      const mptCut=Math.round((useFleet?f.tidy:f.rrc)*(useTi?0.9:1)*0.1);'''
    new_head = '''      const useFleet=kmVal("kmFleetDisc", true);
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
      const subCut=f.sub||0;'''
    if "const useSub=!useMpt && canSub" in text:
        pass
    elif old_head in text:
        text = text.replace(old_head, new_head, 1)
        n += 1
    else:
        old_head2 = old_head.replace('kmVal("kmFleetDisc", true)', 'kmVal("kmFleetDisc", false)').replace(
            'kmVal("kmFleetMpt", true)', 'kmVal("kmFleetMpt", false)'
        )
        if old_head2 in text:
            text = text.replace(old_head2, new_head, 1)
            n += 1

    old_chk = '''            <label class="check-row"><input id="kmFleetMpt" type="checkbox" ${useMpt?"checked":""} /> <span>МПТ −10%</span></label>'''
    new_chk = '''            ${carMpt?`<label class="check-row"><input id="kmFleetMpt" type="checkbox" ${useMpt?"checked":""} /> <span>МПТ −10%</span></label>`:""}
            ${!useMpt&&canSub?`<label class="check-row"><input id="kmFleetSub" type="checkbox" ${useSub?"checked":""} /> <span>Субсидия бренда ${rub(subCut)}</span></label>`:""}'''
    if old_chk in text:
        text = text.replace(old_chk, new_chk, 1)
        n += 1

    old_box = "${fleetCreditBox(price, m, f, useFleet, useTi)}"
    new_box = "${(useMpt||useSub)?fleetCreditBox(price, m, f, useFleet, useTi, useMpt?\"mpt\":\"sub\"):\"\"}"
    if old_box in text:
        text = text.replace(old_box, new_box, 1)
        n += 1

    old_note = '''              ${useMpt
                ? `<div class="bank-row"><span>МПТ −10%</span><span class="pay">${rub(mptCut)} ₽</span></div>`
                : `<div class="bank-row"><span>Субсидия TENET</span><span class="pay">${rub(f.sub)} ₽</span></div>`}
              <p class="calc-note">${useMpt?"На цену действует МПТ −10%, не субсидия бренда.":"Порядок: флит скидка → трейд-ин → МПТ −10%."}</p>'''
    new_note = '''              ${useMpt
                ? `<div class="bank-row"><span>МПТ −10%</span><span class="pay">${rub(mptCut)} ₽</span></div>`
                : (useSub?`<div class="bank-row"><span>Субсидия бренда AQ</span><span class="pay">${rub(subCut)} ₽</span></div>`:`<div class="bank-row"><span>Субсидия TENET</span><span class="pay">${rub(f.sub||0)} ₽</span></div>`)}
              <p class="calc-note">${useMpt?"На цену действует МПТ −10%, не субсидия бренда.":useSub?"Порядок: флит скидка → трейд-ин → субсидия бренда (AQ). МПТ и субсидия не суммируются.":"Порядок: флит скидка → трейд-ин."}</p>'''
    if old_note in text:
        text = text.replace(old_note, new_note, 1)
        n += 1

    old_car = '${car?`<p class="calc-note">${escape(car.vin)} · ${escape(car.color||"")} · ${escape(car.trim||"")}${car.mpt?" · МПТ":""}</p>`:""}'
    new_car = '${car?`<p class="calc-note">${escape(car.vin)} · ${escape(car.color||"")} · ${escape(car.trim||"")}${carMpt?" · МПТ":""}${carIsCorp(car)?" · корп":""}</p>`:""}'
    if old_car in text:
        text = text.replace(old_car, new_car, 1)
        n += 1

    return text, n


def patch_credit_box_labels(text):
    """fleetCreditBox: 6th arg mode mpt|sub changes labels."""
    if "function fleetCreditBox(price, m, f, useFleet, useTi, mode)" in text:
        return text, False
    old_sig = "    function fleetCreditBox(price, m, f, useFleet, useTi){"
    new_sig = """    function fleetCreditBox(price, m, f, useFleet, useTi, mode){
      const isSub=mode==="sub";
      const cutLabel=isSub?"Субсидия бренда":"МПТ −10%";
      const headLabel=isSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%";
"""
    if old_sig not in text:
        return text, False
    text = text.replace(old_sig, new_sig, 1)
    text = text.replace(
        '<div><span>МПТ −10%</span><b>${rub(priceMpt)}</b></div>',
        '<div><span>${cutLabel}</span><b>${rub(priceMpt)}</b></div>',
        1,
    )
    text = text.replace(
        '<p class="eyebrow">Гос. программа · МПТ · Совкомбанк 19,2%</p>',
        '<p class="eyebrow">${headLabel}</p>',
        1,
    )
    text = text.replace(
        '<p class="eyebrow" style="margin:0 0 6px">Сравнение · стандартный кредит и МПТ</p>',
        '<p class="eyebrow" style="margin:0 0 6px">Сравнение · стандартный кредит и ${isSub?"субсидия бренда":"МПТ"}</p>',
        1,
    )
    text = text.replace(
        "Одинаковые ПВ и срок. Слева — обычная машина этой комплектации. Справа — эта МПТ.",
        "Одинаковые ПВ и срок. Слева — обычный кредит. Справа — ${isSub?\"субсидия бренда (AQ)\":\"эта МПТ\"}.",
        1,
    )
    text = text.replace(
        'const analog=stockCars.find(c=>!c.mpt && !c.corp) || stockCars.find(c=>!c.mpt) || null;',
        'const analog=stockCars.find(c=>!(typeof carIsMpt==="function"?carIsMpt(c):c.mpt) && !(typeof carIsCorp==="function"?carIsCorp(c):c.corp)) || stockCars.find(c=>!(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)) || null;',
        1,
    )
    return text, True


def patch_calc_km(text):
    old = '''      const stockCars=typeof kmStockCars==="function"?kmStockCars(m):[];
      const mptCars=stockCars.filter(c=>c.mpt);
      const hasMpt=mptCars.length>0;
      const hasReg=stockCars.some(c=>!c.mpt) || !stockCars.length;
      const selected=(typeof STOCK!=="undefined"?STOCK:[]).find(c=>c && c.vin===kmVin);
      const pickMpt=!!(selected && selected.mpt);
      const showMpt=hasMpt || pickMpt;
      const showSplit=showMpt;
      const mptSample=mptCars[0]||(pickMpt&&selected?selected:null);
      const fMpt=typeof fleetOf==="function"?fleetOf(m.id):null;
      const mptRrc=fMpt&&fMpt.rrc?fMpt.rrc:price;
      const mptTidy=fMpt&&fMpt.tidy?fMpt.tidy:mptRrc;
      const fleetCutMpt=Math.max(0, mptRrc-mptTidy);
      const tiMpt=useTi?(typeof FLEET_TI==="number"?FLEET_TI:50000):0;
      const beforeMptPct=Math.max(0, mptTidy-tiMpt);
      const priceMpt=Math.round(beforeMptPct*0.9);'''
    new = '''      const stockCars=typeof kmStockCars==="function"?kmStockCars(m):[];
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
      const priceMpt=showSub?Math.max(0, beforeMptPct-subAmt):Math.round(beforeMptPct*0.9);'''
    n = 0
    if "const showSub=!showMpt && canSub" in text:
        pass
    elif old in text:
        text = text.replace(old, new, 1)
        n += 1

    old_break = '''                <div><span>МПТ −10%</span><b>${rub(priceMpt)}</b></div>'''
    new_break = '''                <div><span>${showSub?"Субсидия бренда −"+rub(subAmt):"МПТ −10%"}</span><b>${rub(priceMpt)}</b></div>'''
    # only the calcKm copy — first remaining after fleet box already patched to cutLabel
    if old_break in text:
        text = text.replace(old_break, new_break, 1)
        n += 1

    reps = [
        (
            '${showSplit?" Сравнение: стандартный кредит и МПТ рядом.":""}${pickMpt?" Выбран VIN с меткой МПТ.":""}',
            '${showSplit?(showSub?" Сравнение: стандартный кредит и субсидия бренда.":" Сравнение: стандартный кредит и МПТ рядом."):""}${pickMpt?" Выбран VIN с меткой МПТ.":""}',
        ),
        (
            '${showSplit?" Справа МПТ: цена аналога с флит и МПТ −10%, трейд-ин как слева, только Совкомбанк 19,2%.":showMpt?" По этой комплектации в наличии есть МПТ.":""}${pickMpt?" Выбран VIN с меткой МПТ.":""}',
            '${showSplit?(showSub?" Справа субсидия бренда (AQ), та же схема что МПТ, фиксированная сумма.":" Справа МПТ: цена аналога с флит и МПТ −10%, трейд-ин как слева, только Совкомбанк 19,2%."):showMpt?" По этой комплектации в наличии есть МПТ.":""}${pickMpt?" Выбран VIN с меткой МПТ.":""}',
        ),
        (
            '${rub(down)} ₽ · ${downPct}% от цены авто${showMpt?` · МПТ: ${rub(priceMpt)} − ПВ в авто ${rub(downMptCar)} = тело ${rub(creditMpt)}`:""}',
            '${rub(down)} ₽ · ${downPct}% от цены авто${(showMpt||showSub)?` · ${showSub?"субс. бренда":"МПТ"}: ${rub(priceMpt)} − ПВ в авто ${rub(downMptCar)} = тело ${rub(creditMpt)}`:""}',
        ),
        (
            '<p class="eyebrow">Гос. программа · МПТ · Совкомбанк 19,2%</p>\n                  <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>',
            '<p class="eyebrow">${showSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>\n                  <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>',
        ),
        (
            ':showMpt?`<p class="eyebrow" style="margin-top:16px">Гос. программа · МПТ · Совкомбанк 19,2%</p>',
            ':showMpt||showSub?`<p class="eyebrow" style="margin-top:16px">${showSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>',
        ),
        (
            '${showMpt&&!showSplit?"МПТ. ":""}Ставки TENET ФИНАНС',
            '${showMpt&&!showSplit?"МПТ. ":showSub&&!showSplit?"Субсидия бренда. ":""}Ставки TENET ФИНАНС',
        ),
        (
            'чтобы открыть расчёт платежа${hasMpt?" и сравнение с МПТ":""}.',
            'чтобы открыть расчёт платежа${hasMpt?" и сравнение с МПТ":canSub?" и сравнение с субсидией бренда":""}.',
        ),
    ]
    for a, b in reps:
        if a in text:
            text = text.replace(a, b, 1)
            n += 1
    return text, n


def patch_sovcom(text):
    old = "function stockMptSovcom(c){ return !!(c && c.mpt && stockHasSovcom(c)); }"
    new = 'function stockMptSovcom(c){ return !!(c && (typeof carIsMpt==="function"?carIsMpt(c):c.mpt) && stockHasSovcom(c)); }'
    if old in text:
        return text.replace(old, new), True
    return text, False


def apply_text(text, label):
    log = [label]
    text, how = inject_helpers(text)
    log.append("helpers:" + how)
    text, n = add_corp_vins(text)
    log.append("corp_vins:+" + str(n))
    text, n = flag_stock(text)
    log.append("stock_flags:" + str(n))
    text, ok = patch_badges(text)
    log.append("badges:" + str(ok))
    text, n = patch_side_list_tags(text)
    log.append("side:" + str(n))
    text, ok = patch_terms_mpt(text)
    log.append("terms_mpt:" + str(ok))
    text, n = patch_calc_fleet(text)
    log.append("fleet:" + str(n))
    text, ok = patch_credit_box_labels(text)
    log.append("creditbox:" + str(ok))
    text, n = patch_calc_km(text)
    log.append("calckm:" + str(n))
    text, ok = patch_bind(text)
    log.append("bind:" + str(ok))
    text, ok = patch_sovcom(text)
    log.append("sovcom:" + str(ok))
    print(" | ".join(log))
    return text


def patch_prepare_b(p: Path):
    if not p.exists():
        return
    t = p.read_text(encoding="utf-8")
    needle = '        x["mpt"]=x.get("vin") in MPT_VINS\n'
    extra = '''        x["mpt"]=x.get("vin") in MPT_VINS
        _vin=str(x.get("vin") or "").upper()
        _t=str(x.get("trim") or "").lower()
        _mid=str(x.get("model") or "")
        if _vin.startswith("EDXGB32B") or (_mid=="t8" and "4wd" not in _t and "ультра" not in _t and "7 мест" not in _t):
            x["mpt"]=True
            x["corp"]=True
'''
    if "EDXGB32B" in t and 'x["corp"]=True' in t:
        print(p, "prepare_b already t8")
        return
    if needle in t:
        t = t.replace(needle, extra, 1)
        p.write_text(t, encoding="utf-8")
        print("prepare_b t8 rule", p)
    else:
        print("prepare_b needle missed", p)


def patch_pages_yml(p: Path):
    if not p.exists():
        return
    t = p.read_text(encoding="utf-8")
    line = "          if [ -f patch_t8_mpt.py ]; then python3 patch_t8_mpt.py || true; fi\n"
    if "patch_t8_mpt.py" in t:
        print(p, "pages.yml already has t8 patch")
        return
    # after last stock_merge / before heal
    needle = "          if [ -f patch_js_heal.py ]; then python3 patch_js_heal.py || true; fi\n"
    if needle in t:
        t = t.replace(needle, line + needle, 1)
        p.write_text(t, encoding="utf-8")
        print("pages.yml inserted t8 patch before heal", p)
        return
    print("pages.yml heal needle missed", p)


def main():
    here = Path(".")
    patch_prepare_b(Path("prepare_site_b.py"))
    patch_pages_yml(Path(".github/workflows/pages.yml"))
    files = [
        Path("terms-fleet.js"),
        Path("terms-calc-ui-a.js"),
        Path("terms-calc-ui-b.js"),
        Path("terms-calc-data.js"),
        Path("terms-calc-fn.js"),
        Path("stock-fn.js"),
        Path("index.html"),
        Path("_site/index.html"),
        Path("TENET_T4L_netlify/index.html"),
    ]
    for p in files:
        if not p.exists() or p.stat().st_size < 200:
            print("skip", p)
            continue
        src = p.read_text(encoding="utf-8")
        out = apply_text(src, str(p))
        if out != src:
            p.write_text(out, encoding="utf-8")
            print("wrote", p, p.stat().st_size)
        else:
            print("unchanged", p)


if __name__ == "__main__":
    main()
