#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(".")
SITE = Path("_site/index.html")
JS = ROOT / "duty-fn.js"

CSS = """
.st.lease{background:#e8f5e9;color:#1b5e20;border:1px solid #a5d6a7}
.duty-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}
.duty-head,.duty-car{margin-bottom:12px}
.duty-sheet h2{margin:18px 0 8px;font-size:16px}
@media print{
  header,nav,.who-line,.hub-grid{display:none!important}
  .duty-sheet{background:#fff}
}
"""

def patch(html: str) -> str:
    js = JS.read_text(encoding="utf-8") if JS.exists() else ""
    if js and "function duty()" not in html:
        if "    function login(){" in html:
            html = html.replace("    function login(){", js + "    function login(){", 1)
        print("duty fn")
    if '.st.lease{' not in html:
        html = html.replace("</style>", CSS + "\n</style>", 1)
        print("duty css")
    if '["duty","Ч"' not in html:
        needle = '["epts","Э","Заказ ЭПТС","Гарантийное письмо: VIN, PDF и отправка"]'
        if needle in html:
            html = html.replace(
                needle,
                needle + ',\n        ["duty","Ч","Чек-лист дежурного","Тест-драйв, ДЦ и демо"]' +
                ',\n        ["gibdd","Г","Проверки ГИБДД","ФССП, залоги, банкроты"]',
                1,
            )
            print("hub cards")
        elif '["docs","D","Документы"' in html:
            html = html.replace(
                '["docs","D","Документы","Прайсы, PDF и материалы моделей"]',
                '["docs","D","Документы","Прайсы, PDF и материалы моделей"],\n        ["duty","Ч","Чек-лист дежурного","Тест-драйв, ДЦ и демо"],\n        ["gibdd","Г","Проверки ГИБДД","ФССП, залоги, банкроты"]',
                1,
            )
            print("hub cards docs")
    html = html.replace("stock,docs,epts}", "stock,docs,epts,duty,gibdd}")
    html = html.replace("terms,calc,stock,docs}", "terms,calc,stock,docs,epts,duty,gibdd}")
    if 'duty:"Чек-лист"' not in html:
        html = html.replace(
            'const extra={terms:"Условия",calc:"Калькулятор",stock:"Склад",docs:"Документы",epts:"ЭПТС"};',
            'const extra={terms:"Условия",calc:"Калькулятор",stock:"Склад",docs:"Документы",epts:"ЭПТС",duty:"Чек-лист",gibdd:"ГИБДД"};',
        )
    if "dutyBind" not in html:
        html = html.replace(
            'if(typeof eptsBind==="function") eptsBind();',
            'if(typeof eptsBind==="function") eptsBind();\n      if(typeof dutyBind==="function") dutyBind();',
            1,
        )
    html = html.replace(
        '${r.demo?` <span class="st demo">ДЕМО</span>`:""}',
        '${r.demo?` <span class="st demo">ДЕМО</span>`:""}${(typeof stockHasSovcom==="function"&&stockHasSovcom(r))?` <span class="st lease">Совкомбанк лизинг</span>`:""}',
    )
    old_bank = "        const look=typeof kmBankRate===\"function\"?kmBankRate(b.id, rateGroup, months, downPct):{rate:b.rate||0, term:months, capped:false};\n        const term=look.term||months;"
    new_bank = "        const look=typeof kmBankRate===\"function\"?kmBankRate(b.id, rateGroup, months, downPct):{rate:b.rate||0, term:months, capped:false};\n        const kmCar=(typeof STOCK!==\"undefined\"?STOCK:[]).find(x=>x.vin===kmVin);\n        if(typeof stockMptSovcom===\"function\" && stockMptSovcom(kmCar)){ look.rate=19.2; }\n        const term=look.term||months;"
    if old_bank in html:
        html = html.replace(old_bank, new_bank, 1)
        print("fixed 19.2 in calcKm")
    html = html.replace(
        '<p class="calc-note">Кредит ${rub(credit)} ₽ = авто ${rub(price)} − ПВ ${rub(down)} + Д/О ${rub(addons)} + каско ${rub(pack)} + комиссия банка. Ставки TENET ФИНАНС, ИП 1890/И.</p>',
        '<p class="calc-note">Кредит ${rub(credit)} ₽ = авто ${rub(price)} − ПВ ${rub(down)} + Д/О ${rub(addons)} + каско ${rub(pack)} + комиссия банка. ${((typeof stockMptSovcom==="function")&&stockMptSovcom((typeof STOCK!=="undefined"?STOCK:[]).find(x=>x.vin===kmVin)))?"МПТ + Совкомбанк лизинг: ставка фикс. 19,2%.":"Ставки TENET ФИНАНС, ИП 1890/И."}</p>',
    )
    fleet_mark = '<p class="calc-note">Порядок: флит скидка → трейд-ин → МПТ −10%.</p>'
    fleet_extra = '''<p class="calc-note">Порядок: флит скидка → трейд-ин → МПТ −10%.</p>
            ${useMpt?`<div class="note-box" style="margin-top:12px"><p class="eyebrow" style="margin:0 0 6px">Кредит 19,2% · МПТ + Совкомбанк лизинг</p>
              <p class="calc-note">Доп. расчёт к лизингу. Цена ${rub(Math.round(price))} ₽, ставка 19,2%.</p>
              ${[12,24,36,48,60,72,84].map(mo=>{ const pay=calcPay(price, Math.round(price*0.2), mo, 19.2); return `<div class="bank-row"><span>${mo} мес. · ПВ 20%</span><span class="pay">${rub(Math.round(pay))} ₽</span></div>`; }).join("")}
            </div>`:""}'''
    if fleet_mark in html and "Кредит 19,2%" not in html:
        html = html.replace(fleet_mark, fleet_extra, 1)
        print("fleet 19.2")
    return html

def main():
    if not SITE.exists():
        print("no _site/index.html")
        return
    html = SITE.read_text(encoding="utf-8")
    out = patch(html)
    SITE.write_text(out, encoding="utf-8")
    print("ops patched", SITE.stat().st_size)

if __name__ == "__main__":
    main()
