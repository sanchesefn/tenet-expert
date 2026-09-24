#!/usr/bin/env python3
"""Equal KM columns. Profitability left, stock right, one row."""
from pathlib import Path

OLD_CSS = """@media(min-width:900px) and (max-width:1399px){
  .km-layout.km-4{grid-template-columns:1fr 1fr 1fr;align-items:start;gap:14px}
  .km-layout.km-4 > .km-disc{grid-column:1 / -1}
}
@media(min-width:1400px){
  .km-layout.km-4{grid-template-columns:minmax(200px,.56fr) minmax(230px,1fr) minmax(230px,1fr) minmax(250px,1.08fr);align-items:start;gap:14px}
  .km-layout.km-4 > .km-disc{grid-column:auto}
  body:has(.km-layout.km-4) .wrap{max-width:1600px}
}"""

NEW_CSS = """@media(min-width:1100px){
  .km-layout.km-4{grid-template-columns:1fr 1fr 1fr 1fr;align-items:start;gap:14px}
  .km-layout.km-4 > .km-disc{grid-column:auto}
  body:has(.km-layout.km-4) .wrap{max-width:1680px}
}
.km-bottom{display:grid;gap:14px;margin-top:14px;align-items:start}
.km-bottom .dc-result{margin-top:0}
@media(min-width:900px){
  .km-bottom{grid-template-columns:1fr 1fr}
  .km-bottom .stock-side{max-height:min(72vh,720px)}
}"""

KM_OLD = """        ${(useLoan&&showSplit)||pShow?kmSideList(m, price, downPct, months, extras):""}
        <div class="card dc-result ${(selected&&selected.invoice&&_pg?pOk:ok)?"ok":"bad"}">
          <p class="eyebrow">КМ без НДС${selected&&selected.invoice&&_pg?" · спеццена":""}</p>
          <div class="calc-out">${rub(Math.round(selected&&selected.invoice&&_pg?pKm:km))} ₽</div>
          <p class="calc-note">Коридор ${lo} … ${hi} тыс. · сейчас ${(selected&&selected.invoice&&_pg?pKmK:kmK).toFixed(1)} тыс. · ${(selected&&selected.invoice&&_pg?pOk:ok)?"в коридоре":"вне коридора"}</p>
          <div class="note-box">${selected&&selected.invoice&&_pg?`Спеццена <b>${rub(pFix)} ₽</b> · скидка от РРЦ ${rub(pDiscount)}<br/>Маржа 1С ${rub(Math.round(pMargin))} · бонус ${rub(Math.round(pBonus))} · доход на железе ${rub(Math.round(pIron))}<br/>Каско 80 000 + GAP/ДМС ${rub(pCard)} внутри PANGO${useTi?" · возмещение трейд-ин "+rub(pTiBack):""}`:`Цена авто <b>${rub(Math.round(carPrice))} ₽</b> · клиенту с Д/О <b>${rub(Math.round(client))} ₽</b><br/>Скидка ${rub(Math.round(discount))} · маржа 1С ${rub(Math.round(margin))}<br/>Бонус ${rub(Math.round(bonus))} (${Math.round(m.bonus*100)}%) · доход на железе ${rub(Math.round(iron))}<br/>НДС ${m.vat===1.22?"22%":"20%"} · сбор ${Math.round(m.fee*100)}% от цены авто${prio?" · приоритет":""}`}</div>
        </div>`;"""

KM_NEW = """        <div class="${(useLoan&&showSplit)||pShow?"km-bottom":""}">
          <div class="card dc-result ${(selected&&selected.invoice&&_pg?pOk:ok)?"ok":"bad"}">
            <p class="eyebrow">КМ без НДС${selected&&selected.invoice&&_pg?" · спеццена":""}</p>
            <div class="calc-out">${rub(Math.round(selected&&selected.invoice&&_pg?pKm:km))} ₽</div>
            <p class="calc-note">Коридор ${lo} … ${hi} тыс. · сейчас ${(selected&&selected.invoice&&_pg?pKmK:kmK).toFixed(1)} тыс. · ${(selected&&selected.invoice&&_pg?pOk:ok)?"в коридоре":"вне коридора"}</p>
            <div class="note-box">${selected&&selected.invoice&&_pg?`Спеццена <b>${rub(pFix)} ₽</b> · скидка от РРЦ ${rub(pDiscount)}<br/>Маржа 1С ${rub(Math.round(pMargin))} · бонус ${rub(Math.round(pBonus))} · доход на железе ${rub(Math.round(pIron))}<br/>Каско 80 000 + GAP/ДМС ${rub(pCard)} внутри PANGO${useTi?" · возмещение трейд-ин "+rub(pTiBack):""}`:`Цена авто <b>${rub(Math.round(carPrice))} ₽</b> · клиенту с Д/О <b>${rub(Math.round(client))} ₽</b><br/>Скидка ${rub(Math.round(discount))} · маржа 1С ${rub(Math.round(margin))}<br/>Бонус ${rub(Math.round(bonus))} (${Math.round(m.bonus*100)}%) · доход на железе ${rub(Math.round(iron))}<br/>НДС ${m.vat===1.22?"22%":"20%"} · сбор ${Math.round(m.fee*100)}% от цены авто${prio?" · приоритет":""}`}</div>
          </div>
          ${(useLoan&&showSplit)||pShow?kmSideList(m, price, downPct, months, extras):""}
        </div>`;"""

FLEET_OLD = """        ${kmSideList(m)}
        <div class="card dc-result ok">
          <p class="eyebrow">КМ без НДС · флит BFS</p>
          <div class="calc-out">${rub(f.km)} ₽</div>
          <p class="calc-note">КМ с листа «Флит», блок BFS. Пауза банка, ориентир 21.09.</p>
        </div>`;"""

FLEET_NEW = """        <div class="km-bottom">
          <div class="card dc-result ok">
            <p class="eyebrow">КМ без НДС · флит BFS</p>
            <div class="calc-out">${rub(f.km)} ₽</div>
            <p class="calc-note">КМ с листа «Флит», блок BFS. Пауза банка, ориентир 21.09.</p>
          </div>
          ${kmSideList(m)}
        </div>`;"""


def patch_pages(text):
    needle = "if [ -f patch_calc_fold.py ]; then python3 patch_calc_fold.py || true; fi"
    add = needle + "\n          if [ -f patch_km_row.py ]; then python3 patch_km_row.py || true; fi"
    if "patch_km_row.py" in text:
        return text, 0
    if needle not in text:
        return text, 0
    return text.replace(needle, add, 1), 1


def patch_text(text):
    n = 0
    if OLD_CSS in text and "1fr 1fr 1fr 1fr" not in text:
        text = text.replace(OLD_CSS, NEW_CSS, 1)
        n += 1
    if KM_OLD in text:
        text = text.replace(KM_OLD, KM_NEW, 1)
        n += 1
    if FLEET_OLD in text:
        text = text.replace(FLEET_OLD, FLEET_NEW, 1)
        n += 1
    return text, n


def main():
    files = [
        Path("index.html"),
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
        out, n = patch_pages(src) if p.name == "pages.yml" else patch_text(src)
        if n and out != src:
            p.write_text(out, encoding="utf-8")
            print("row", p.name, n)
        else:
            print(p.name, "unchanged", n)


if __name__ == "__main__":
    main()
