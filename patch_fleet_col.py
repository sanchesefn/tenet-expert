#!/usr/bin/env python3
"""Put fleet+brand-subsidy (not MPT, not standard credit) in its own column."""
from pathlib import Path

OLD_RETURN = '''      return `<div class="note-box" style="margin-top:12px">
        <p class="eyebrow" style="margin:0 0 6px">Сравнение · стандартный кредит и ${isSub?"субсидия бренда":"МПТ"}</p>
        <p class="calc-note">Одинаковые ПВ и срок. Слева — обычный кредит. Справа — ${isSub?"субсидия бренда (AQ)":"эта МПТ"}.</p>
        <p class="eyebrow" style="margin-top:8px">Первый взнос</p>
        <div class="down-mode">
          <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
          <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
        </div>
        <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
        ${downMode==="sum"
          ?`<label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
          :`<label class="field" style="max-width:none"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
        <p class="calc-note">${rub(down)} ₽ · ${downPct}% от цены МПТ</p>
        <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>
        <div class="pay-split">
          <div class="pay-col std">
            <p class="eyebrow">Стандартный кредит</p>
            <p class="calc-note">ПВ ${rub(downReg)} · тело ${rub(creditReg)}</p>
            ${fleetPayRows(banks,"pay","over",months)}
            ${regBreak}
          </div>
          <div class="pay-col ${isSub?"sub":"mpt"}">
            <p class="eyebrow">${headLabel}</p>
            <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${fleetPayRows(banksMpt,"payMpt","overMpt",months)}
            ${mptBreak}
          </div>
        </div>
      </div>`;'''

NEW_RETURN = '''      const inputs=`<p class="eyebrow" style="margin-top:12px">Первый взнос</p>
        <div class="down-mode">
          <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
          <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
        </div>
        <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
        ${downMode==="sum"
          ?`<label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${down}" /></label>`
          :`<label class="field" style="max-width:none"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${downPct}" /></label>`}
        <p class="calc-note">${rub(down)} ₽ · ${downPct}% · одинаковые ПВ и срок для обоих расчётов</p>
        <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>`;
      const stdCol=`<div class="pay-col std km-pay">
            <p class="eyebrow">Стандартный кредит</p>
            <p class="calc-note">Та же комплектация без флита. ПВ ${rub(downReg)} · тело ${rub(creditReg)}</p>
            ${fleetPayRows(banks,"pay","over",months)}
            ${regBreak}
          </div>`;
      const altCol=`<div class="pay-col ${isSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${isSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            <p class="calc-note">${isSub?"Машина не проходит под МПТ. Это не стандартный кредит: сначала флит, затем субсидия бренда (AQ), Совкомбанк 19,2%.":"МПТ −10% от флита. Совкомбанк 19,2%."}</p>
            ${mptBreak}
            <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${fleetPayRows(banksMpt,"payMpt","overMpt",months)}
          </div>`;
      return {inputs, stdCol, altCol};'''

OLD_FLEET = '''      const subCut=f.sub||0;
      return banner("Калькулятор","Флит · BFS Совкомбанк лизинг","TENET")+`
        <p class="lead">Корпоративный / МПТ VIN. Справа сравнение с обычным кредитом той же комплектации.</p>
        ${kmChipGroups(m.id)}
        <div class="km-layout">
          <div class="card">
            <p class="eyebrow">BFS Совкомбанк лизинг · ${escape(f.name)}</p>'''

NEW_FLEET = '''      const subCut=f.sub||0;
      const fleetBox=(useMpt||useSub)?fleetCreditBox(price, m, f, useFleet, useTi, useMpt?"mpt":"sub"):null;
      return banner("Калькулятор","Флит · BFS Совкомбанк лизинг","TENET")+`
        <p class="lead">${fleetBox?(useSub?"Три блока: скидки флита, стандартный кредит той же комплектации и справа флит с субсидией бренда — машина не под МПТ.":"Три блока: скидки флита, стандартный кредит и МПТ."):"Корпоративный VIN. Сбер / Альфа / Т-Банк на этот VIN нельзя."}</p>
        ${kmChipGroups(m.id)}
        <div class="km-layout${fleetBox?" km-3":""}">
          <div class="card km-disc">
            <p class="eyebrow">BFS Совкомбанк лизинг · ${escape(f.name)}</p>'''

OLD_EMBED = '''            ${(useMpt||useSub)?fleetCreditBox(price, m, f, useFleet, useTi, useMpt?"mpt":"sub"):""}
          </div>
          <div class="km-right">
            <div class="card">'''

NEW_EMBED = '''            ${fleetBox?fleetBox.inputs:""}
          </div>
          ${fleetBox?fleetBox.stdCol+fleetBox.altCol:""}
        </div>
        <div class="card">'''

OLD_CLOSE = '''            ${kmSideList(m)}
          </div>
        </div>
        <div class="card dc-result ok">'''

NEW_CLOSE = '''        ${kmSideList(m)}
        <div class="card dc-result ok">'''

OLD_KM_COL = '''          <div class="pay-col ${showSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${showSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${kmPayRows(banksMpt,"payMpt","overMpt")}
            ${mptBreak}
          </div>'''

NEW_KM_COL = '''          <div class="pay-col ${showSub?"sub":"mpt"} km-pay">
            <p class="eyebrow">${showSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>
            ${showSub?`<p class="calc-note">Машина не проходит под МПТ. Это не стандартный кредит: цена флита минус субсидия бренда (AQ), Совкомбанк 19,2%.</p>
            ${mptBreak}
            <p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${kmPayRows(banksMpt,"payMpt","overMpt")}`
            :`<p class="calc-note">ПВ ${rub(downMptShow)} · из них ${rub(Math.min(MPT_EXTRA, downMptShow))} на каско и Д/О · тело ${rub(creditMpt)}</p>
            ${kmPayRows(banksMpt,"payMpt","overMpt")}
            ${mptBreak}`}
          </div>'''

OLD_KM_FALLBACK = '''${showSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%"}'''
NEW_KM_FALLBACK = '''${showSub?"Флит · субсидия бренда":"Гос. программа · МПТ · Совкомбанк 19,2%"}'''


def patch_pages(text):
    needle = "if [ -f patch_km_3col.py ]; then python3 patch_km_3col.py || true; fi"
    add = needle + "\n          if [ -f patch_fleet_col.py ]; then python3 patch_fleet_col.py || true; fi"
    if "patch_fleet_col.py" in text:
        return text, 0
    if needle not in text:
        return text, 0
    return text.replace(needle, add, 1), 1


def patch_text(text):
    n = 0
    if "return {inputs, stdCol, altCol};" not in text and OLD_RETURN in text:
        text = text.replace(OLD_RETURN, NEW_RETURN, 1)
        n += 1
    if "const fleetBox=" not in text and OLD_FLEET in text:
        text = text.replace(OLD_FLEET, NEW_FLEET, 1)
        n += 1
    if OLD_EMBED in text:
        text = text.replace(OLD_EMBED, NEW_EMBED, 1)
        n += 1
    if "fleetBox?`<div class=\"card\"><p class=\"eyebrow\">Лист" not in text and OLD_CLOSE in text:
        text = text.replace(OLD_CLOSE, NEW_CLOSE, 1)
        n += 1
    if OLD_KM_COL in text:
        text = text.replace(OLD_KM_COL, NEW_KM_COL)
        n += 1
    old_note = '<div class="note-box">Сбер / Альфа / Т-Банк на этот VIN нельзя. Сравнение справа — платёж обычной машины этой комплектации.</div>'
    new_note = '<div class="note-box">Сбер / Альфа / Т-Банк на этот VIN нельзя. По центру — стандартный кредит той же комплектации. Справа — ${useSub?"флит с субсидией бренда, не МПТ":useMpt?"МПТ":"лист флита"}.</div>'
    if old_note in text:
        text = text.replace(old_note, new_note)
        n += 1
    if OLD_KM_FALLBACK in text:
        text = text.replace(OLD_KM_FALLBACK, NEW_KM_FALLBACK)
        n += 1
    return text, n


def main():
    files = [
        Path("index.html"),
        Path("_site/index.html"),
        Path("terms-fleet.js"),
        Path("terms-calc-fn.js"),
        Path("terms-calc-ui-b.js"),
        Path(".github/workflows/pages.yml"),
    ]
    for p in files:
        if not p.exists() or p.stat().st_size < 20:
            print(p, "skip")
            continue
        if p.name == "index.html" and p.stat().st_size < 2000:
            print(p, "stub skip")
            continue
        src = p.read_text(encoding="utf-8")
        if p.name == "pages.yml":
            out, n = patch_pages(src)
        else:
            out, n = patch_text(src)
        if n and out != src:
            p.write_text(out, encoding="utf-8")
            print("fleet-col", p, n)
        else:
            print(p, "unchanged", n)


if __name__ == "__main__":
    main()
