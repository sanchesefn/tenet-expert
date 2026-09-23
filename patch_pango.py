#!/usr/bin/env python3
"""Special-price cars: fixed cash/TI price and PANGO credit at 17.4% and 14.4%+NSS."""
from pathlib import Path

DATA = '''    const PANGO_FIX = {
      t4la:{cash:2150000,ti:2100000},
      t4lp:{cash:2250000,ti:2200000},
      t7p:{cash:2550000,ti:2450000},
      t8p4:{cash:3100000,ti:3000000},
      t8u4:{cash:3300000,ti:3200000}
    };
    const PANGO_BUNDLE = 150000;
    const PANGO_RATE_A = 17.4;
    const PANGO_RATE_B = 14.4;
    const PANGO_NSS = 0.0089;
    function pangoOf(id){ return (typeof PANGO_FIX!=="undefined" && PANGO_FIX[id]) || null; }
'''

CSS = '''
.pay-col.pango{background:#f6f3fb;border:1.5px solid #b79bc7;box-shadow:inset 4px 0 0 #6a3d86}
.pay-col.pango .eyebrow{color:#5b2d7a}
.pay-col.pango-nss{background:#fdecee;border:1.5px solid #e3a0a8;box-shadow:inset 4px 0 0 #c81e2b}
.pay-col.pango-nss .eyebrow{color:#9a1b28}
'''

PANGO_JS = r'''      const _pg=(selected && selected.invoice && typeof pangoOf==="function")?pangoOf(m.id):null;
      if(_pg){
        const pFix=useTi?_pg.ti:_pg.cash;
        const pPctWant=downMode==="pct"?Math.max(0, downPct):(pFix>0?Math.round(down*1000/pFix)/10:0);
        let pDown=downMode==="pct"?Math.round(pFix*pPctWant/100):down;
        pDown=Math.max(0, Math.min(pFix, pDown));
        const pPct=pFix>0?Math.round(pDown*1000/pFix)/10:0;
        const pBundle=typeof PANGO_BUNDLE==="number"?PANGO_BUNDLE:150000;
        const pCredit=Math.max(0, pFix-pDown)+pBundle;
        const pRateA=typeof PANGO_RATE_A==="number"?PANGO_RATE_A:17.4;
        const pRateB=typeof PANGO_RATE_B==="number"?PANGO_RATE_B:14.4;
        const pNssRate=typeof PANGO_NSS==="number"?PANGO_NSS:0.0089;
        const pPayA=calcPay(pFix+pBundle, pDown, months, pRateA);
        const pPayB=calcPay(pFix+pBundle, pDown, months, pRateB);
        const pNss=Math.round(pCredit*pNssRate);
        const pOverA=pPayA*months-pCredit;
        const pOverB=pPayB*months-pCredit;
        const pDiscount=Math.max(0, rrc-pFix);
        const pTiBack=useTi?(m.tiBack||0):0;
        const pCasco=80000, pCard=Math.max(0, pBundle-pCasco);
        const pBonus=invoice>0?(invoice/m.vat)*m.bonus:0;
        const pMargin=rrc-invoice;
        const pIron=pMargin-pDiscount+pTiBack+pBonus*1.2;
        const pKm=(pCasco*0.3+pCard*0.8+pIron)/m.vat-pFix*m.fee;
        const pKmK=pKm/1000;
        const pOk=pKmK+0.05>=lo && pKmK-0.05<=hi;
        return banner("Калькулятор","Спеццена · PANGO","TENET")+`
        <p class="lead">Фикс: без трейд-ин ${rub(_pg.cash)}, с трейд-ин ${rub(_pg.ti)}. Кредит PANGO всегда включает каско, GAP и ДМС банка ${rub(pBundle)} и считается по двум ставкам.</p>
        ${kmChipGroups(m.id)}
        <div class="km-layout km-3">
          <div class="card km-disc">
            <p class="eyebrow">Спеццена · ${escape(m.name)}</p>
            ${selected?`<p class="calc-note">${escape(selected.vin)} · ${escape(selected.color||"")} · ${escape(selected.trim||"")}</p>`:""}
            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин · ${rub(_pg.ti)} вместо ${rub(_pg.cash)}</span></label>
            <div class="note-box" style="margin-top:14px">
              <p class="eyebrow" style="margin:0 0 6px">${useTi?"Цена с трейд-ин":"Цена без трейд-ин"}</p>
              ${rrc>pFix?`<div class="calc-out" style="text-decoration:line-through;opacity:.42;margin-bottom:2px">${rub(rrc)} ₽</div>`:""}
              <div class="calc-out">${rub(pFix)} ₽</div>
              <p class="calc-note">Другая цена: ${useTi?rub(_pg.cash)+" без трейд-ин":rub(_pg.ti)+" с трейд-ин"}. Скидки ДЦ и спецпредложение сверху не ставятся.</p>
            </div>
            <p class="eyebrow" style="margin-top:12px">Первый взнос</p>
            <div class="down-mode">
              <button type="button" class="chip ${downMode==="sum"?"on":""}" data-down-mode="sum">Сумма, ₽</button>
              <button type="button" class="chip ${downMode!=="sum"?"on":""}" data-down-mode="pct">Проценты</button>
            </div>
            <input type="hidden" id="cDownMode" value="${downMode==="sum"?"sum":"pct"}" />
            ${downMode==="sum"
              ?`<label class="field" style="max-width:none"><span>Первый взнос, ₽</span><input id="cDown" inputmode="numeric" value="${pDown}" /></label>`
              :`<label class="field" style="max-width:none"><span>Первый взнос, %</span><input id="cDownPct" inputmode="decimal" value="${pPct}" /></label>`}
            <p class="calc-note">${rub(pDown)} ₽ · ${pPct}% от спеццены. В тело кредита сверху ${rub(pBundle)}.</p>
            <label class="field" style="max-width:none"><span>Срок, мес.</span><input id="cMonths" inputmode="numeric" value="${months}" /></label>
          </div>
          <div class="pay-col pango km-pay">
            <p class="eyebrow">PANGO · 17,4%</p>
            <p class="calc-note">Без дополнительных комиссий.</p>
            <div class="bank-row"><span>Цена авто</span><span class="pay">${rub(pFix)}</span></div>
            <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(pDown)}</span></div>
            <div class="bank-row"><span>Каско + GAP + ДМС</span><span class="pay">${rub(pBundle)}</span></div>
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(pCredit)}</span></div>
            <div class="bank-row"><span><b>Платёж</b><br/><small>${pRateA}% · ${months} мес. · переплата ~${rub(Math.round(pOverA))}</small></span><span class="pay">${rub(Math.round(pPayA))} ₽</span></div>
          </div>
          <div class="pay-col pango-nss km-pay">
            <p class="eyebrow">PANGO · 14,4% · НСС</p>
            <p class="calc-note">Назначь свою ставку. НСС ${rub(pNss)} — 0,89% от тела кредита, разово, в платёж не входит.</p>
            <div class="bank-row"><span>Цена авто</span><span class="pay">${rub(pFix)}</span></div>
            <div class="bank-row"><span>Первый взнос</span><span class="pay">${rub(pDown)}</span></div>
            <div class="bank-row"><span>Каско + GAP + ДМС</span><span class="pay">${rub(pBundle)}</span></div>
            <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(pCredit)}</span></div>
            <div class="bank-row"><span>НСС 0,89%</span><span class="pay">${rub(pNss)}</span></div>
            <div class="bank-row"><span><b>Платёж</b><br/><small>${pRateB}% · ${months} мес. · переплата ~${rub(Math.round(pOverB))}</small></span><span class="pay">${rub(Math.round(pPayB))} ₽</span></div>
          </div>
        </div>
        ${kmSideList(m, pFix, pPct, months, pBundle)}
        <div class="card dc-result ${pOk?"ok":"bad"}">
          <p class="eyebrow">Доходность ДЦ · КМ без НДС · спеццена</p>
          <div class="calc-out">${rub(Math.round(pKm))} ₽</div>
          <p class="calc-note">Коридор ${lo} … ${hi} тыс. · сейчас ${pKmK.toFixed(1)} тыс. · ${pOk?"в коридоре":"вне коридора"}</p>
          <div class="note-box">Цена авто <b>${rub(pFix)} ₽</b> · скидка от РРЦ ${rub(pDiscount)}<br/>Маржа 1С ${rub(Math.round(pMargin))} · бонус ${rub(Math.round(pBonus))} · доход на железе ${rub(Math.round(pIron))}<br/>Каско 80 000 + GAP/ДМС ${rub(pCard)} внутри PANGO${useTi?" · возмещение трейд-ин "+rub(pTiBack):""}${prio?" · приоритет":""}</div>
        </div>`;
      }
'''

RET = '      return banner("Калькулятор","КМ и платёж · база "+TERMS_DATE,"TENET")+`\n'


def patch_pages(text):
    needle = "if [ -f patch_fleet_col.py ]; then python3 patch_fleet_col.py || true; fi"
    add = needle + "\n          if [ -f patch_pango.py ]; then python3 patch_pango.py || true; fi"
    if "patch_pango.py" in text:
        return text, 0
    if needle not in text:
        return text, 0
    return text.replace(needle, add, 1), 1


def patch_text(text, path):
    n = 0
    name = path.name
    if name.endswith(".js") or name.endswith(".html"):
        if "const PANGO_FIX" not in text and "const TERMS_PRIO" in text:
            text = text.replace("    const TERMS_PRIO = [", DATA + "    const TERMS_PRIO = [", 1)
            n += 1
        if "PANGO · 17,4%" not in text and "pShow=" not in text and "Спеццена · PANGO" not in text and RET in text:
            text = text.replace(RET, PANGO_JS + RET, 1)
            n += 1
    if name.endswith(".html") or name.endswith(".css"):
        if ".pay-col.pango{" not in text:
            if ".pay-col.sub .eyebrow{color:#8a5a10}" in text:
                text = text.replace(
                    ".pay-col.sub .eyebrow{color:#8a5a10}",
                    ".pay-col.sub .eyebrow{color:#8a5a10}" + CSS,
                    1,
                )
                n += 1
            elif "</style>" in text and name.endswith(".html"):
                text = text.replace("</style>", CSS + "\n</style>", 1)
                n += 1
            elif name.endswith(".css"):
                text = text.rstrip() + "\n" + CSS
                n += 1
    return text, n


def main():
    files = [
        Path("index.html"),
        Path("terms-calc-data.js"),
        Path("terms-calc-ui-b.js"),
        Path("terms-calc-fn.js"),
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
            out, n = patch_text(src, p)
        if n and out != src:
            p.write_text(out, encoding="utf-8")
            print("pango", p, n)
        else:
            print(p, "unchanged", n)


if __name__ == "__main__":
    main()
