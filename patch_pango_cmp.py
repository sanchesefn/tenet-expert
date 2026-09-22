#!/usr/bin/env python3
"""T4L new special prices, NSS inside the loan, three calcs side by side."""
from pathlib import Path

OLD_PRICES = [
    ('{model:"T4L",trim:"Active",price:"2 150 нал, 2 050 ТИ"}',
     '{model:"T4L",trim:"Active",price:"2 200 нал, 2 150 ТИ"}'),
    ('{model:"T4L",trim:"Prime",price:"2 250 нал, 2 200 ТИ"}',
     '{model:"T4L",trim:"Prime",price:"2 300 нал, 2 250 ТИ"}'),
    ("t4la:{cash:2150000,ti:2050000}", "t4la:{cash:2200000,ti:2150000}"),
    ("t4lp:{cash:2250000,ti:2200000}", "t4lp:{cash:2300000,ti:2250000}"),
]

MATH = r'''      const _pg=(typeof pangoOf==="function")?pangoOf(m.id):null;
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
        pBase=Math.max(0, pFix-pDownP)+pBundle;
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
'''

PANGO_COL = r'''          ${pShow?`<div class="pay-col pango km-pay">
            <p class="eyebrow">Спеццена · PANGO</p>
            <p class="calc-note">${selected&&selected.invoice?"Этот VIN по спеццене.":"Если машина по спеццене."} Фикс ${useTi?"с трейд-ин":"без трейд-ин"} ${rub(pFix)}. Каско + GAP + ДМС ${rub(pBundle)} всегда в кредите.</p>
            <div class="bank-row"><span>Цена авто</span><span class="pay">${rub(pFix)}</span></div>
            <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(pDownP)}</span></div>
            <div class="bank-row"><span>Каско + GAP + ДМС</span><span class="pay">${rub(pBundle)}</span></div>
            <p class="eyebrow" style="margin-top:10px">17,4% без комиссий</p>
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(pBase)}</span></div>
            <div class="bank-row"><span><b>Платёж</b><br/><small>${pRateA}% · ${months} мес. · переплата ~${rub(Math.round(pOverA))}</small></span><span class="pay">${rub(Math.round(pPayA))} ₽</span></div>
            <p class="eyebrow" style="margin-top:10px">14,4% · НСС в теле</p>
            <div class="bank-row"><span>НСС 0,89% × ${pYearsLabel} ${pYearsWord}</span><span class="pay">${rub(pNss)}</span></div>
            <div class="bank-row"><span>Тело с НСС</span><span class="pay">${rub(pCreditB)}</span></div>
            <div class="bank-row"><span><b>Платёж</b><br/><small>${pRateB}% · ${months} мес. · переплата ~${rub(Math.round(pOverB))}</small></span><span class="pay">${rub(Math.round(pPayB))} ₽</span></div>
          </div>`:""}'''

CSS = '''
@media(min-width:900px) and (max-width:1399px){
  .km-layout.km-4{grid-template-columns:1fr 1fr 1fr;align-items:start;gap:14px}
  .km-layout.km-4 > .km-disc{grid-column:1 / -1}
}
@media(min-width:1400px){
  .km-layout.km-4{grid-template-columns:minmax(200px,.56fr) minmax(230px,1fr) minmax(230px,1fr) minmax(250px,1.08fr);align-items:start;gap:14px}
  .km-layout.km-4 > .km-disc{grid-column:auto}
  body:has(.km-layout.km-4) .wrap{max-width:1600px}
}
'''


def cut_old_screen(text):
    start = text.find('      const _pg=')
    ret = text.find('      return banner("Калькулятор","КМ и платёж · база "+TERMS_DATE,"TENET")+`', start if start >= 0 else 0)
    if start < 0 or ret < 0 or "pShow=" in text[start:start+400]:
        return text, 0
    return text[:start] + MATH + text[ret:], 1


def finish(text):
    """Layout, NSS body, fleet column, and CSS brace — idempotent."""
    n = 0
    broken = "body:has(.km-layout.km-3) .wrap{max-width:1360px}\n\n@media(min-width:900px)"
    fixed = "body:has(.km-layout.km-3) .wrap{max-width:1360px}\n}\n@media(min-width:900px)"
    if broken in text:
        text = text.replace(broken, fixed, 1)
        n += 1
        extra = "body:has(.km-layout.km-4) .wrap{max-width:1600px}\n}\n\n}\n"
        tight = "body:has(.km-layout.km-4) .wrap{max-width:1600px}\n}\n"
        if extra in text:
            text = text.replace(extra, tight, 1)
            n += 1
    old_lay = '<div class="km-layout${useLoan&&pShow?" km-4":useLoan&&showSplit?" km-3":""}">'
    new_lay = '<div class="km-layout${pShow?" km-4":useLoan&&showSplit?" km-3":""}">'
    if old_lay in text:
        text = text.replace(old_lay, new_lay)
        n += 1
    old_ex = "const extras=useLoan?(addons+(pack||0)+fee):0;"
    new_ex = 'const _pgTrim=(typeof pangoOf==="function")?pangoOf(m.id):null;\n      if(_pgTrim && !useLoan) pack=150000;\n      const extras=(useLoan||_pgTrim)?(addons+(pack||0)+fee):0;'
    if old_ex in text and "_pgTrim" not in text:
        text = text.replace(old_ex, new_ex)
        n += 1
    marker = 'const _pg=(selected && selected.invoice && typeof pangoOf==="function")?pangoOf(m.id):null;'
    end_pat = 'prio?" · приоритет":""}</div>\n        </div>`;\n      }\n'
    while marker in text:
        i = text.find(marker)
        j = text.find(end_pat, i)
        if j < 0:
            break
        text = text[:i] + text[j + len(end_pat):]
        n += 1
    fleet_ret = "      return {inputs, stdCol, altCol};"
    if "let pangoCol" not in text and fleet_ret in text:
        text = text.replace(fleet_ret, FLEET_PANGO + fleet_ret.replace("altCol}", "altCol, pangoCol}"), 1)
        n += 1
    old_grid = '<div class="km-layout${fleetBox?" km-3":""}">'
    new_grid = '<div class="km-layout${fleetBox?(fleetBox.pangoCol?" km-4":" km-3"):""}">'
    if old_grid in text:
        text = text.replace(old_grid, new_grid)
        n += 1
    old_cols = '${fleetBox?fleetBox.stdCol+fleetBox.altCol:""}'
    new_cols = '${fleetBox?fleetBox.stdCol+fleetBox.altCol+(fleetBox.pangoCol||""):""}'
    if old_cols in text:
        text = text.replace(old_cols, new_cols)
        n += 1
    old_lead = '<p class="lead">${fleetBox?(useSub?"Три блока: скидки флита, стандартный кредит той же комплектации и справа флит с субсидией бренда — машина не под МПТ.":"Три блока: скидки флита, стандартный кредит и МПТ."):"Корпоративный VIN. Сбер / Альфа / Т-Банк на этот VIN нельзя."}</p>'
    new_lead = '<p class="lead">${fleetBox?(fleetBox.pangoCol?"Три расчёта рядом: стандартный кредит, "+(useSub?"флит с субсидией бренда":"МПТ")+" и спеццена PANGO.":(useSub?"Три блока: скидки флита, стандартный кредит той же комплектации и справа флит с субсидией бренда — машина не под МПТ.":"Три блока: скидки флита, стандартный кредит и МПТ.")):"Корпоративный VIN. Сбер / Альфа / Т-Банк на этот VIN нельзя."}</p>'
    if old_lead in text:
        text = text.replace(old_lead, new_lead)
        n += 1
    old_km_note = '<div class="note-box">Цена авто <b>${rub(Math.round(carPrice))} ₽</b> · клиенту с Д/О <b>${rub(Math.round(client))} ₽</b><br/>Скидка ${rub(Math.round(discount))} · маржа 1С ${rub(Math.round(margin))}<br/>Бонус ${rub(Math.round(bonus))} (${Math.round(m.bonus*100)}%) · доход на железе ${rub(Math.round(iron))}<br/>НДС ${m.vat===1.22?"22%":"20%"} · сбор ${Math.round(m.fee*100)}% от цены авто${prio?" · приоритет":""}</div>'
    new_km_note = '<div class="note-box">${selected&&selected.invoice&&_pg?`Спеццена <b>${rub(pFix)} ₽</b> · скидка от РРЦ ${rub(pDiscount)}<br/>Маржа 1С ${rub(Math.round(pMargin))} · бонус ${rub(Math.round(pBonus))} · доход на железе ${rub(Math.round(pIron))}<br/>Каско 80 000 + GAP/ДМС ${rub(pCard)} внутри PANGO${useTi?" · возмещение трейд-ин "+rub(pTiBack):""}`:`Цена авто <b>${rub(Math.round(carPrice))} ₽</b> · клиенту с Д/О <b>${rub(Math.round(client))} ₽</b><br/>Скидка ${rub(Math.round(discount))} · маржа 1С ${rub(Math.round(margin))}<br/>Бонус ${rub(Math.round(bonus))} (${Math.round(m.bonus*100)}%) · доход на железе ${rub(Math.round(iron))}<br/>НДС ${m.vat===1.22?"22%":"20%"} · сбор ${Math.round(m.fee*100)}% от цены авто${prio?" · приоритет":""}`}</div>'
    if old_km_note in text and "внутри PANGO" not in text:
        text = text.replace(old_km_note, new_km_note)
        n += 1
    return text, n


def patch_pages(text):
    needle = "if [ -f patch_pango.py ]; then python3 patch_pango.py || true; fi"
    add = needle + "\n          if [ -f patch_pango_cmp.py ]; then python3 patch_pango_cmp.py || true; fi"
    if "patch_pango_cmp.py" in text:
        return text, 0
    if needle not in text:
        return text, 0
    return text.replace(needle, add, 1), 1


FLEET_PANGO = r'''      let pangoCol="";
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
        const pBase=Math.max(0, pFix-pDownP)+pBundle;
        const pNss=Math.round(pBase*pNssRate*pYears);
        const pCreditB=pBase+pNss;
        const pPayA=typeof calcPay==="function"?calcPay(pBase+pDownP, pDownP, months, pRateA):0;
        const pPayB=typeof calcPay==="function"?calcPay(pCreditB+pDownP, pDownP, months, pRateB):0;
        const pOverA=pPayA*months-pBase;
        const pOverB=pPayB*months-pCreditB;
        pangoCol=`<div class="pay-col pango km-pay">
            <p class="eyebrow">Спеццена · PANGO</p>
            <p class="calc-note">Если машина по спеццене. Фикс ${useTi?"с трейд-ин":"без трейд-ин"} ${rub(pFix)}. Каско + GAP + ДМС ${rub(pBundle)} всегда в кредите.</p>
            <div class="bank-row"><span>Цена авто</span><span class="pay">${rub(pFix)}</span></div>
            <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(pDownP)}</span></div>
            <div class="bank-row"><span>Каско + GAP + ДМС</span><span class="pay">${rub(pBundle)}</span></div>
            <p class="eyebrow" style="margin-top:10px">17,4% без комиссий</p>
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(pBase)}</span></div>
            <div class="bank-row"><span><b>Платёж</b><br/><small>${pRateA}% · ${months} мес. · переплата ~${rub(Math.round(pOverA))}</small></span><span class="pay">${rub(Math.round(pPayA))} ₽</span></div>
            <p class="eyebrow" style="margin-top:10px">14,4% · НСС в теле</p>
            <div class="bank-row"><span>НСС 0,89% × ${pYearsLabel} ${pYearsWord}</span><span class="pay">${rub(pNss)}</span></div>
            <div class="bank-row"><span>Тело с НСС</span><span class="pay">${rub(pCreditB)}</span></div>
            <div class="bank-row"><span><b>Платёж</b><br/><small>${pRateB}% · ${months} мес. · переплата ~${rub(Math.round(pPayB))}</small></span><span class="pay">${rub(Math.round(pPayB))} ₽</span></div>
          </div>`;
      }
'''


def patch_text(text):
    n = 0
    for a, b in OLD_PRICES:
        if a in text:
            text = text.replace(a, b)
            n += 1
    text, k = cut_old_screen(text)
    n += k
    old_lead = '<p class="lead">Сначала комплектация. Кредит и СЖ открываются галочкой «Кредит».</p>'
    new_lead = '<p class="lead">${pShow?"Три расчёта рядом: стандартный кредит, "+(showSub?"флит с субсидией бренда":"МПТ")+" и спеццена PANGO.":"Сначала комплектация. Кредит и СЖ открываются галочкой «Кредит»."}</p>'
    if old_lead in text and "Три расчёта рядом" not in text:
        text = text.replace(old_lead, new_lead, 1)
        n += 1
    old_lay = '<div class="km-layout${useLoan&&showSplit?" km-3":""}">'
    new_lay = '<div class="km-layout${pShow?" km-4":useLoan&&showSplit?" km-3":""}">'
    if old_lay in text:
        text = text.replace(old_lay, new_lay, 1)
        n += 1
    old_pv = "${useLoan?`<p class=\"eyebrow\" style=\"margin-top:12px\">Первый взнос</p>"
    new_pv = "${useLoan||pShow?`<p class=\"eyebrow\" style=\"margin-top:12px\">Первый взнос</p>"
    if old_pv in text:
        text = text.replace(old_pv, new_pv, 1)
        n += 1
    old_note = 'Каско не входит.${discount?` Скидка ${rub(Math.round(discount))}.`:""}</p>\n            </div>'
    new_note = 'Каско не входит.${discount?` Скидка ${rub(Math.round(discount))}.`:""}</p>\n            </div>\n            ${_pg?`<div class="note-box">Спеццена ${rub(_pg.cash)} без трейд-ин · ${rub(_pg.ti)} с трейд-ин. ${(selected&&selected.invoice)?"Этот VIN по спеццене — блок PANGO.":"Блок PANGO — спеццена для сравнения."}</div>`:""}'
    if old_note in text and "Блок PANGO" not in text:
        text = text.replace(old_note, new_note, 1)
        n += 1
    old_split = "${useLoan&&showSplit?`"
    new_split = "${(useLoan&&showSplit)||pShow?`"
    if old_split in text and "(useLoan&&showSplit)||pShow" not in text:
        text = text.replace(old_split, new_split, 1)
        n += 1
    anchor = "            ${mptBreak}`}\n          </div>`:`<div class=\"km-right\">"
    if anchor in text and "Спеццена · PANGO" not in text:
        text = text.replace(anchor, "            ${mptBreak}`}\n          </div>\n" + PANGO_COL + "`: `<div class=\"km-right\">", 1)
        n += 1
    old_side = "${useLoan&&showSplit?kmSideList(m, price, downPct, months, extras):\"\"}"
    new_side = "${(useLoan&&showSplit)||pShow?kmSideList(m, price, downPct, months, extras):\"\"}"
    if old_side in text:
        text = text.replace(old_side, new_side, 1)
        n += 1
    old_km = '''        <div class="card dc-result ${ok?"ok":"bad"}">
          <p class="eyebrow">Доходность ДЦ · КМ без НДС</p>
          <div class="calc-out">${rub(Math.round(km))} ₽</div>
          <p class="calc-note">Коридор ${lo} … ${hi} тыс. · сейчас ${kmK.toFixed(1)} тыс. · ${ok?"в коридоре":"вне коридора"}</p>'''
    new_km = '''        <div class="card dc-result ${(selected&&selected.invoice&&_pg?pOk:ok)?"ok":"bad"}">
          <p class="eyebrow">Доходность ДЦ · КМ без НДС${selected&&selected.invoice&&_pg?" · спеццена":""}</p>
          <div class="calc-out">${rub(Math.round(selected&&selected.invoice&&_pg?pKm:km))} ₽</div>
          <p class="calc-note">Коридор ${lo} … ${hi} тыс. · сейчас ${(selected&&selected.invoice&&_pg?pKmK:kmK).toFixed(1)} тыс. · ${(selected&&selected.invoice&&_pg?pOk:ok)?"в коридоре":"вне коридора"}</p>'''
    if old_km in text:
        text = text.replace(old_km, new_km, 1)
        n += 1
    css_anchor = "body:has(.km-layout.km-3) .wrap{max-width:1360px}"
    closed = css_anchor + "\n}"
    if ".km-layout.km-4" not in text and closed in text:
        text = text.replace(closed, css_anchor + "\n}\n" + CSS.strip() + "\n", 1)
        n += 1
    elif ".km-layout.km-4" not in text and css_anchor in text:
        text = text.replace(css_anchor, css_anchor + "\n" + CSS, 1)
        n += 1
    text, n2 = finish(text)
    return text, n + n2


def main():
    files = [
        Path("index.html"),
        Path("terms-calc-data.js"),
        Path("terms-calc-ui-b.js"),
        Path("terms-calc-fn.js"),
        Path("terms-fleet.js"),
        Path("terms-ui.css"),
        Path(".github/workflows/pages.yml"),
    ]
    for p in files:
        if not p.exists() or p.stat().st_size < 20:
            print(p, "skip")
            continue
        if p.name == "index.html" and p.stat().st_size < 8000:
            print(p, "stub skip")
            continue
        src = p.read_text(encoding="utf-8")
        if p.name == "pages.yml":
            out, n = patch_pages(src)
        else:
            out, n = patch_text(src)
        if n and out != src:
            p.write_text(out, encoding="utf-8")
            print("cmp", p.name, n)
        else:
            print(p.name, "unchanged", n)


if __name__ == "__main__":
    main()
