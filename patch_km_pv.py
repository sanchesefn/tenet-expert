#!/usr/bin/env python3
"""Move down-payment and term out of the left card, above the credit columns."""
from pathlib import Path

CSS = """
.km-pv{padding:12px 14px}
.km-pv .eyebrow{margin:0 0 8px}
.km-pv-row{display:grid;grid-template-columns:auto minmax(140px,1fr) minmax(110px,150px);gap:10px 14px;align-items:end}
.km-pv .down-mode{margin:0}
.km-pv label.field{max-width:none;margin:0}
.km-pv .calc-note{margin:8px 0 0}
@media(max-width:720px){
  .km-pv-row{grid-template-columns:1fr}
}
@media(min-width:1100px){
  .km-stage.km-4,.km-stage.km-3{display:grid;align-items:start}
  .km-stage.km-4{grid-template-columns:1fr 1fr 1fr 1fr;gap:14px}
  .km-stage.km-3{grid-template-columns:minmax(220px,.7fr) minmax(300px,1.2fr) minmax(300px,1.2fr);gap:16px}
  .km-stage.km-4 > .km-chips,.km-stage.km-3 > .km-chips{grid-column:1 / -1;grid-row:1;min-width:0}
  .km-stage.km-4 > .km-pv,.km-stage.km-3 > .km-pv{grid-column:2 / -1;grid-row:1;align-self:end;z-index:2;min-width:0}
  .km-stage.km-4 > .km-chips .km-line:nth-last-child(-n+3){max-width:calc((100% - 42px) / 4)}
  .km-stage.km-3 > .km-chips .km-line:nth-last-child(-n+3){max-width:calc((100% - 32px) * 0.226)}
  .km-stage > .km-layout{grid-column:1 / -1;grid-row:2;margin-top:0}
}
"""

PV_OPEN = """${kmChipGroups(m.id)}
        <div class="km-layout${pShow?" km-4":useLoan&&showSplit?" km-3":""}">"""

PV_OPEN_NEW = """<div class="km-stage${pShow?" km-4":useLoan&&showSplit?" km-3":""}">
        <div class="km-chips">${kmChipGroups(m.id)}</div>
        ${(useLoan&&showSplit)||pShow?`<div class="card km-pv">
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
        </div>`:""}
        <div class="km-layout${pShow?" km-4":useLoan&&showSplit?" km-3":""}">"""

PV_CLOSE = """        </div>
        <div class="${(useLoan&&showSplit)||pShow?"km-bottom":""}">"""

PV_CLOSE_NEW = """        </div>
        </div>
        <div class="${(useLoan&&showSplit)||pShow?"km-bottom":""}">"""

FLEET_INPUTS = """      const inputs=`<p class="eyebrow" style="margin-top:12px">Первый взнос</p>
        <div class="down-mode">
          <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
          <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
        </div>
        <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
        ${downMode==="sum"
          ?`<label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
          :`<label class="field" style="max-width:none"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
        <p class="calc-note">${rub(down)} ₽ · ${downPct}% · одинаковые ПВ и срок для обоих расчётов</p>
        <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>`;"""

FLEET_INPUTS_NEW = """      const inputs=`<div class="card km-pv">
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
      </div>`;"""

FLEET_OPEN = """${kmChipGroups(m.id)}
        <div class="km-layout${fleetBox?(fleetBox.pangoCol?" km-4":" km-3"):""}">"""

FLEET_OPEN_NEW = """<div class="km-stage${fleetBox?(fleetBox.pangoCol?" km-4":" km-3"):""}">
        <div class="km-chips">${kmChipGroups(m.id)}</div>
        ${fleetBox?fleetBox.inputs:""}
        <div class="km-layout${fleetBox?(fleetBox.pangoCol?" km-4":" km-3"):""}">"""

FLEET_IN_CARD = """            ${fleetBox?fleetBox.inputs:""}
          </div>"""

FLEET_IN_CARD_NEW = """          </div>"""

FLEET_CLOSE = """        </div>
        <div class="card">
              <p class="eyebrow">Лист «Флит» BFS</p>"""

FLEET_CLOSE_NEW = """        </div>
        </div>
        <div class="card">
              <p class="eyebrow">Лист «Флит» BFS</p>"""


def patch_pages(text):
    needle = "if [ -f patch_km_row.py ]; then python3 patch_km_row.py || true; fi"
    add = needle + "\n          if [ -f patch_km_pv.py ]; then python3 patch_km_pv.py || true; fi"
    if "patch_km_pv.py" in text:
        return text, 0
    if needle not in text:
        return text, 0
    return text.replace(needle, add, 1), 1


def patch_css(text):
    if ".km-stage.km-4" in text:
        return text, 0
    anchor = ".km-bottom .stock-side{max-height:min(72vh,720px)}\n}"
    if anchor in text:
        return text.replace(anchor, anchor + "\n" + CSS, 1), 1
    if "</style>" in text:
        return text.replace("</style>", CSS + "\n</style>", 1), 1
    return text, 0


def patch_js(text):
    if "km-stage" in text and "card km-pv" in text:
        return text, 0
    n = 0
    pairs = [
        ("${useLoan||pShow?`<p class=\"eyebrow\" style=\"margin-top:12px\">Первый взнос</p>",
         "${useLoan&&!showSplit&&!pShow?`<p class=\"eyebrow\" style=\"margin-top:12px\">Первый взнос</p>"),
        (PV_OPEN, PV_OPEN_NEW),
        (PV_CLOSE, PV_CLOSE_NEW),
        (FLEET_INPUTS, FLEET_INPUTS_NEW),
        (FLEET_OPEN, FLEET_OPEN_NEW),
        (FLEET_IN_CARD, FLEET_IN_CARD_NEW),
        (FLEET_CLOSE, FLEET_CLOSE_NEW),
    ]
    for old, new in pairs:
        if old in text:
            text = text.replace(old, new, 1)
            n += 1
    return text, n


def main():
    files = [
        Path("index.html"),
        Path("terms-calc-ui-b.js"),
        Path("terms-calc-fn.js"),
        Path("terms-fleet.js"),
        Path("terms-ui.css"),
        Path("_site/index.html"),
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
        elif p.suffix == ".css":
            out, n = patch_css(src)
        elif p.suffix == ".html":
            out, n = patch_css(src)
            out, n2 = patch_js(out)
            n += n2
        else:
            out, n = patch_js(src)
        if n and out != src:
            p.write_text(out, encoding="utf-8")
            print("pv", p.name, n)
        else:
            print(p.name, "unchanged", n)


if __name__ == "__main__":
    main()
