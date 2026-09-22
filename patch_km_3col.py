#!/usr/bin/env python3
"""KM calc: 3 columns — compact discounts | standard credit | MPT/sub."""
from pathlib import Path

NEW_CSS = """
.km-layout > *{min-width:0}
.km-disc{padding:12px}
.km-disc .check-row{padding:8px 10px;margin-top:8px;gap:8px}
.km-disc .check-row span{font-size:13px;font-weight:600}
.km-disc .check-row input{width:18px;height:18px;flex:0 0 18px}
.km-disc label.field{margin-top:8px}
.km-disc input{padding:8px 10px;font-size:14px}
.km-disc .calc-out{font-size:clamp(22px,3.2vw,30px);margin:2px 0 4px}
.km-disc .note-box{padding:10px 12px;margin-top:10px}
.km-pay{min-width:0;align-self:start}
.km-pay .bank-row,.pay-col .bank-row{align-items:flex-start;gap:8px}
.km-pay .bank-row span:first-child,.pay-col .bank-row span:first-child{min-width:0;overflow-wrap:anywhere}
@media(min-width:720px){
  .km-layout.km-3{grid-template-columns:1fr 1fr;align-items:start;gap:16px}
  .km-layout.km-3 > .km-disc{grid-column:1 / -1}
}
@media(min-width:1100px){
  .km-layout.km-3{grid-template-columns:minmax(220px,.7fr) minmax(300px,1.2fr) minmax(300px,1.2fr)}
  .km-layout.km-3 > .km-disc{grid-column:auto}
  body:has(.km-layout.km-3) .wrap{max-width:1360px}
}
"""

OLD_OPEN = '''        <div class="km-layout">
          <div class="card">
            <p class="eyebrow">Калькулятор КМ · ${escape(m.name)}</p>'''

NEW_OPEN = '''        <div class="km-layout${useLoan&&showSplit?" km-3":""}">
          <div class="card km-disc">
            <p class="eyebrow">Калькулятор КМ · ${escape(m.name)}</p>'''

OLD_TAIL = '''            ${prio?`<div class="note-box">Приоритетный VIN ${escape(kmVin)}. Коридор ${lo} … ${hi} тыс.</div>`:""}
          </div>
          <div class="km-right">
            ${useLoan?`<div class="card">
              <p class="eyebrow">Кредит · ${escape(m.name)}</p>
              <p class="calc-note">ПВ от цены авто ${rub(price)} ₽, без Д/О и каско. В кредит входят авто − ПВ, Д/О, каско расширенное и комиссия банка.${showSplit?(showSub?" Сравнение: стандартный кредит и субсидия бренда.":" Сравнение: стандартный кредит и МПТ рядом."):""}${pickMpt?" Выбран VIN с меткой МПТ.":""}</p>
              <p class="eyebrow" style="margin-top:12px">Первый взнос</p>
              <div class="down-mode">
                <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
                <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
              </div>
              <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
              ${downMode==="sum"
                ?`<label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
                :`<label class="field" style="max-width:none"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
              <p class="calc-note">${rub(down)} ₽ · ${downPct}% от цены авто${(showMpt||showSub)?` · ${showSub?"субс. бренда":"МПТ"}: ${rub(priceMpt)} − ПВ в авто ${rub(downMptCar)} = тело ${rub(creditMpt)}`:""}</p>
              <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>
              ${showSplit?`<div class="pay-split">
                <div class="pay-col std">
                  <p class="eyebrow">Стандартный кредит</p>
                  <p class="calc-note">ПВ ${rub(down)} · тело ${rub(credit)}</p>
                  ${kmPayRows(banks,"pay","over")}
                </div>
                <div class="pay-col ${showSub?"sub":"mpt"}">
                  <p class="eyebrow">${showSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
                  <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
                  ${kmPayRows(banksMpt,"payMpt","overMpt")}
                  ${mptBreak}
                </div>
              </div>`
              :showMpt||showSub?`<p class="eyebrow" style="margin-top:16px">${showSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
              <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
              ${kmPayRows(banksMpt,"payMpt","overMpt")}
              ${mptBreak}`
              :`<p class="eyebrow" style="margin-top:16px">Платёж в месяц</p>
              ${kmPayRows(banks,"pay","over")}`}
              <p class="calc-note">${showMpt&&!showSplit?"МПТ. ":showSub&&!showSplit?"Субсидия бренда. ":""}Ставки TENET ФИНАНС, ИП 1890/И. Кредит = авто ${rub(price)} − ПВ + Д/О ${rub(addons)} + каско ${rub(pack)} + комиссия банка.</p>
            </div>`:`<div class="card"><p class="eyebrow">Кредит</p><p class="lead" style="max-width:none">Включите галочку «Кредит», чтобы открыть расчёт платежа${hasMpt?" и сравнение с МПТ":canSub?" и сравнение с субсидией бренда":""}.</p></div>`}
            ${kmSideList(m, price, downPct, months, extras)}
          </div>
        </div>'''

NEW_TAIL = '''            ${prio?`<div class="note-box">Приоритетный VIN ${escape(kmVin)}. Коридор ${lo} … ${hi} тыс.</div>`:""}
            ${useLoan?`<p class="eyebrow" style="margin-top:12px">Первый взнос</p>
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
          ${useLoan&&showSplit?`
          <div class="pay-col std km-pay">
            <p class="eyebrow">Стандартный кредит</p>
            <p class="calc-note">ПВ ${rub(down)} · тело ${rub(credit)}</p>
            ${kmPayRows(banks,"pay","over")}
            <p class="calc-note">Ставки TENET ФИНАНС, ИП 1890/И. Кредит = авто ${rub(price)} − ПВ + Д/О ${rub(addons)} + каско ${rub(pack)} + комиссия банка.</p>
          </div>
          <div class="pay-col ${showSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${showSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${kmPayRows(banksMpt,"payMpt","overMpt")}
            ${mptBreak}
          </div>`:`<div class="km-right">
            ${useLoan?`<div class="card">
              <p class="eyebrow">Кредит · ${escape(m.name)}</p>
              <p class="calc-note">ПВ от цены авто ${rub(price)} ₽, без Д/О и каско. В кредит входят авто − ПВ, Д/О, каско расширенное и комиссия банка.${pickMpt?" Выбран VIN с меткой МПТ.":""}</p>
              ${showMpt||showSub?`<p class="eyebrow" style="margin-top:16px">${showSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
              <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
              ${kmPayRows(banksMpt,"payMpt","overMpt")}
              ${mptBreak}`
              :`<p class="eyebrow" style="margin-top:16px">Платёж в месяц</p>
              ${kmPayRows(banks,"pay","over")}`}
              <p class="calc-note">${showMpt?"МПТ. ":showSub?"Субсидия бренда. ":""}Ставки TENET ФИНАНС, ИП 1890/И. Кредит = авто ${rub(price)} − ПВ + Д/О ${rub(addons)} + каско ${rub(pack)} + комиссия банка.</p>
            </div>`:`<div class="card"><p class="eyebrow">Кредит</p><p class="lead" style="max-width:none">Включите галочку «Кредит», чтобы открыть расчёт платежа${hasMpt?" и сравнение с МПТ":canSub?" и сравнение с субсидией бренда":""}.</p></div>`}
            ${kmSideList(m, price, downPct, months, extras)}
          </div>`}
        </div>
        ${useLoan&&showSplit?kmSideList(m, price, downPct, months, extras):""}'''

OLD_TAIL_ALT = OLD_TAIL.replace(
    '<div class="pay-col std">',
    '<div class="pay-col">',
).replace(
    '<div class="pay-col ${showSub?"sub":"mpt"}">',
    '<div class="pay-col mpt">',
)


def patch_pages_yml(text):
    needle = 'if [ -f patch_mpt_split.py ]; then python3 patch_mpt_split.py || true; fi'
    add = needle + '\n          if [ -f patch_km_3col.py ]; then python3 patch_km_3col.py || true; fi'
    if 'patch_km_3col.py' in text:
        return text, 0
    if needle in text:
        return text.replace(needle, add, 1), 1
    return text, 0


def patch_text(text, path=None):
    n = 0
    name = str(path or "")
    is_js = name.endswith(".js")
    css_mark = "\n.km-layout > *{min-width:0}"
    if is_js and css_mark in text:
        text = text[: text.find(css_mark)].rstrip() + "\n"
        n += 1
    if (not is_js) and ".km-layout.km-3{" not in text:
        if "</style>" in text:
            text = text.replace("</style>", NEW_CSS + "\n</style>", 1)
            n += 1
        elif NEW_CSS.strip() not in text:
            text = text.rstrip() + "\n" + NEW_CSS
            n += 1
    if OLD_OPEN in text:
        text = text.replace(OLD_OPEN, NEW_OPEN)
        n += 1
    if OLD_TAIL in text:
        text = text.replace(OLD_TAIL, NEW_TAIL)
        n += 1
    elif OLD_TAIL_ALT in text:
        text = text.replace(OLD_TAIL_ALT, NEW_TAIL)
        n += 1
    return text, n


def main():
    files = [
        Path("index.html"),
        Path("_site/index.html"),
        Path("terms-ui.css"),
        Path("terms-calc-ui-b.js"),
        Path("terms-calc-fn.js"),
        Path(".github/workflows/pages.yml"),
    ]
    for p in files:
        if not p.exists() or p.stat().st_size < 20:
            print(p, "skip")
            continue
        if p.suffix in {".html", ".js", ".css"} and p.stat().st_size < 2000 and p.name == "index.html":
            print(p, "stub skip")
            continue
        src = p.read_text(encoding="utf-8")
        if p.name == "pages.yml":
            out, n = patch_pages_yml(src)
        else:
            out, n = patch_text(src, p)
        if n and out != src:
            p.write_text(out, encoding="utf-8")
            print("km-3col", p, n)
        else:
            print(p, "unchanged", n)


if __name__ == "__main__":
    main()
