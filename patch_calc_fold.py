#!/usr/bin/env python3
"""Highlight special-invoice cars. Payment and body stay visible; MPT and PANGO details fold."""
from pathlib import Path

CSS = """
.stock-car.invoice{border-color:#c81e2b;background:#fdecee}
.stock-car.invoice.on{border-color:#9a1b28;box-shadow:0 0 0 1px #9a1b28}
.inv-tag{color:#9a1b28}
.st-row.is-invoice{background:#fdecee}
.calc-more{margin-top:8px;border-top:1px dashed rgba(109,90,62,.28);padding-top:4px}
.calc-more summary{cursor:pointer;font-size:13px;font-weight:700;color:#6d5a3e;min-height:44px;display:flex;align-items:center;list-style:none}
.calc-more summary::-webkit-details-marker{display:none}
.calc-more summary:before{content:"▸  ";color:#9a1b28}
.calc-more[open] summary:before{content:"▾  "}
.pay-col.pango .bank-row.pay-top .pay,.pay-col.mpt .bank-row:first-of-type .pay,.pay-col.sub .bank-row:first-of-type .pay{font-size:22px;line-height:1.1}
"""

PANGO_KM = r'''${pShow?`<div class="pay-col pango km-pay">
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

PANGO_KM_NEW = r'''${pShow?`<div class="pay-col pango km-pay">
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
              <div class="bank-row"><span>НСС 0,89% × ${pYearsLabel} ${pYearsWord}</span><span class="pay">${rub(pNss)}</span></div>
            </details>
          </div>`:""}'''

PANGO_FLEET = r'''pangoCol=`<div class="pay-col pango km-pay">
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
          </div>`;'''

PANGO_FLEET_NEW = r'''pangoCol=`<div class="pay-col pango km-pay">
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
              <div class="bank-row"><span>НСС 0,89% × ${pYearsLabel} ${pYearsWord}</span><span class="pay">${rub(pNss)}</span></div>
            </details>
          </div>`;'''

MPT_COL = r'''<div class="pay-col ${showSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${showSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            ${showSub?`<p class="calc-note">Машина не проходит под МПТ. Это не стандартный кредит: цена флита минус субсидия бренда (AQ), Совкомбанк 19,2%.</p>
            ${mptBreak}
            <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${kmPayRows(banksMpt,"payMpt","overMpt")}`
            :`<p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${kmPayRows(banksMpt,"payMpt","overMpt")}
            ${mptBreak}`}
          </div>'''

MPT_COL_NEW = r'''<div class="pay-col ${showSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${showSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            ${kmPayRows(banksMpt,"payMpt","overMpt")}
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
            <details class="calc-more">
              <summary>Подробности расчёта</summary>
              <p class="calc-note">${showSub?"Машина не проходит под МПТ. Это не стандартный кредит: цена флита минус субсидия бренда (AQ), Совкомбанк 19,2%.":"ПВ "+rub(downMptShow)+" · из них "+rub(Math.min(MPT_EXTRA, downMptShow))+" на каско и Д/О."}</p>
              ${mptBreak}
            </details>
          </div>'''

MPT_FALL = r'''${showMpt||showSub?`<p class="eyebrow" style="margin-top:16px">${showSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
              <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
              ${kmPayRows(banksMpt,"payMpt","overMpt")}
              ${mptBreak}`'''

MPT_FALL_NEW = r'''${showMpt||showSub?`<p class="eyebrow" style="margin-top:16px">${showSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
              ${kmPayRows(banksMpt,"payMpt","overMpt")}
              <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
              <details class="calc-more"><summary>Подробности расчёта</summary>
              <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О.</p>
              ${mptBreak}</details>`'''

ALT_COL = r'''const altCol=`<div class="pay-col ${isSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${isSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            <p class="calc-note">${isSub?"Машина не проходит под МПТ. Это не стандартный кредит: сначала флит, затем субсидия бренда (AQ), Совкомбанк 19,2%.":"МПТ −10% от флита. Совкомбанк 19,2%."}</p>
            ${mptBreak}
            <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${fleetPayRows(banksMpt,"payMpt","overMpt",months)}
          </div>`;'''

ALT_COL_NEW = r'''const altCol=`<div class="pay-col ${isSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${isSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            ${fleetPayRows(banksMpt,"payMpt","overMpt",months)}
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>
            <details class="calc-more">
              <summary>Подробности расчёта</summary>
              <p class="calc-note">${isSub?"Машина не проходит под МПТ. Это не стандартный кредит: сначала флит, затем субсидия бренда (AQ), Совкомбанк 19,2%.":"МПТ −10% от флита. Совкомбанк 19,2%."}</p>
              ${mptBreak}
            </details>
          </div>`;'''


def patch_pages(text):
    needle = "if [ -f patch_pango_cmp.py ]; then python3 patch_pango_cmp.py || true; fi"
    add = needle + "\n          if [ -f patch_calc_fold.py ]; then python3 patch_calc_fold.py || true; fi"
    if "patch_calc_fold.py" in text:
        return text, 0
    if needle not in text:
        return text, 0
    return text.replace(needle, add, 1), 1


def patch_text(text):
    n = 0
    pairs = [
        (PANGO_KM, PANGO_KM_NEW),
        (PANGO_FLEET, PANGO_FLEET_NEW),
        (MPT_COL, MPT_COL_NEW),
        (MPT_FALL, MPT_FALL_NEW),
        (ALT_COL, ALT_COL_NEW),
    ]
    for old, new in pairs:
        if old in text:
            text = text.replace(old, new)
            n += 1
    old_cls = '${c.demo?" demo":""}${on?" on":""}" data-km-vin='
    new_cls = '${c.demo?" demo":""}${c.invoice?" invoice":""}${on?" on":""}" data-km-vin='
    if old_cls in text and 'c.invoice?" invoice"' not in text:
        text = text.replace(old_cls, new_cls)
        n += 1
    old_tag = '${(typeof carIsMpt==="function"?carIsMpt(c):c.mpt)?`<span class="mpt-tag">Доступна гос программа −20%</span>`:""}'
    new_tag = '${c.invoice?`<span class="mpt-tag inv-tag">Спец инвойс</span>`:""}' + old_tag
    if old_tag in text and "inv-tag" not in text:
        text = text.replace(old_tag, new_tag)
        n += 1
    old_row = 'return `<article class="st-row${reservedCls}">'
    new_row = 'return `<article class="st-row${reservedCls}${r.invoice?" is-invoice":""}">'
    if old_row in text and "is-invoice" not in text:
        text = text.replace(old_row, new_row)
        n += 1
    if ".stock-car.invoice{" not in text and ".stock-car.mpt{border-color:#2e7d32;background:#e8f5e9}" in text:
        text = text.replace(
            ".stock-car.mpt{border-color:#2e7d32;background:#e8f5e9}",
            ".stock-car.mpt{border-color:#2e7d32;background:#e8f5e9}" + CSS,
            1,
        )
        n += 1
    return text, n


def main():
    files = [
        Path("index.html"),
        Path("terms-calc-ui-a.js"),
        Path("terms-calc-ui-b.js"),
        Path("terms-calc-fn.js"),
        Path("terms-fleet.js"),
        Path("terms-ui.css"),
        Path("stock-fn.js"),
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
            print("fold", p.name, n)
        else:
            print(p.name, "unchanged", n)


if __name__ == "__main__":
    main()
