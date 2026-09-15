#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(".")
SITE = Path("_site/index.html")
JS = ROOT / "duty-fn.js"

CSS = """
.st.lease{background:#e8f5e9;color:#1b5e20;border:1px solid #a5d6a7}
.duty-compact{font-size:13px}
.duty-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 8px}
.duty-top label{display:flex;gap:6px;align-items:center;font-size:12px}
.duty-top input,.duty-mini{min-height:28px;padding:2px 6px;font-size:13px}
.duty-table th,.duty-table td{padding:4px 6px;text-align:center;white-space:nowrap}
.duty-table td:first-child{text-align:left}
.duty-line{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;margin-top:8px;padding:8px 10px;border:1px solid var(--line,#e6ddd0);border-radius:10px}
.duty-line label{display:inline-flex;gap:4px;align-items:center;font-size:12px}
@media print{
  header,nav,.who-line,.hub-grid{display:none!important}
  .duty-sheet{background:#fff}
}
"""

def patch(html: str) -> str:
    js = JS.read_text(encoding="utf-8") if JS.exists() else ""
    if js:
        if "function duty()" in html:
            import re
            html = re.sub(r"    function stockBlob\(c\)\{[\s\S]*?    function login\(\)\{", js + "    function login(){", count=1)
            if "function stockBlob(c){" in html and html.find("function stockBlob(c){") < html.find("function login(){"):
                pass
            print("duty fn replace")
        elif "    function login(){" in html:
            html = html.replace("    function login(){", js + "    function login(){", 1)
            print("duty fn insert")
    if ".duty-compact{" not in html:
        html = html.replace("</style>", CSS + "\n</style>", 1)
        print("duty css")
    elif ".duty-table th" not in html:
        html = html.replace(".duty-sheet h2{margin:18px 0 8px;font-size:16px}", CSS, 1)
    if '["duty","Ч"' not in html:
        needle = '["epts","Э","Заказ ЭПТС","Гарантийное письмо: VIN, PDF и отправка"]'
        if needle in html:
            html = html.replace(
                needle,
                needle + ',\n        ["duty","Ч","Чек-лист дежурного","Тест-драйв, ДЦ и демо"]' +
                ',\n        ["gibdd","Г","Проверки ГИБДД","ФССП, залоги, банкроты"]',
                1,
            )
    html = html.replace("stock,docs,epts}", "stock,docs,epts,duty,gibdd}")
    html = html.replace("terms,calc,stock,docs}", "terms,calc,stock,docs,epts,duty,gibdd}")
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
    html = html.replace(
        '["kmRrc","kmInv","kmUseTi","kmFleetDisc","kmFleetMpt"',
        '["kmRrc","kmInv","kmUseTi","kmFleetDisc","kmFleetMpt","cDownMode","cDown","cDownPct","cMonths"',
    )
    old_static = "${[12,24,36,48,60,72,84].map(mo=>{ const pay=calcPay(price, Math.round(price*0.2), mo, 19.2); return `<div class=\"bank-row\"><span>${mo} мес. · ПВ 20%</span><span class=\"pay\">${rub(Math.round(pay))} ₽</span></div>`; }).join(\"\")}"
    new_loan = """${(()=>{ const downMode=kmStr(\"cDownMode\",\"pct\"); const months=kmVal(\"cMonths\", 60); let downPct=kmVal(\"cDownPct\", 20); let down=kmVal(\"cDown\", Math.round(price*0.2)); if(downMode===\"pct\") down=Math.round(price*Math.max(0,downPct)/100); else downPct=price>0?Math.round(down*1000/price)/10:0; down=Math.max(0,Math.min(price,down)); const pay=calcPay(price, down, months, 19.2); return `<p class=\"eyebrow\" style=\"margin-top:8px\">Первый взнос</p>
              <div class=\"down-mode\">
                <button type=\"button\" class=\"chip ${downMode===\"sum\"?\"on\":\"\"}\" data-down-mode=\"sum\">Сумма, ₽</button>
                <button type=\"button\" class=\"chip ${downMode!==\"sum\"?\"on\":\"\"}\" data-down-mode=\"pct\">Проценты</button>
              </div>
              <input type=\"hidden\" id=\"cDownMode\" value=\"${downMode===\"sum\"?\"sum\":\"pct\"}\" />
              ${downMode===\"sum\"
                ?`<label class=\"field\" style=\"max-width:none\"><span>Первый взнос, ₽</span><input id=\"cDown\" inputmode=\"numeric\" value=\"${down}\" /></label>`
                :`<label class=\"field\" style=\"max-width:none\"><span>Первый взнос, %</span><input id=\"cDownPct\" inputmode=\"decimal\" value=\"${downPct}\" /></label>`}
              <p class=\"calc-note\">${rub(down)} ₽ · ${downPct}% от цены</p>
              <label class=\"field\" style=\"max-width:none\"><span>Срок, мес.</span><input id=\"cMonths\" inputmode=\"numeric\" value=\"${months}\" /></label>
              <div class=\"bank-row\"><span><b>Кредит 19,2%</b><br/><small>${months} мес. · ПВ ${downPct}%</small></span><span class=\"pay\">${rub(Math.round(pay))} ₽</span></div>`; })()}"""
    if old_static in html:
        html = html.replace(old_static, new_loan, 1)
        print("fleet loan fields")
    elif "Доп. расчёт к лизингу" in html and "id=\"cMonths\"" not in html.split("Доп. расчёт к лизингу")[1][:1200]:
        html = html.replace(old_static, new_loan, 1)
    fleet_mark = '<p class="calc-note">Порядок: флит скидка → трейд-ин → МПТ −10%.</p>'
    fleet_extra = '''<p class="calc-note">Порядок: флит скидка → трейд-ин → МПТ −10%.</p>
            ${useMpt?`<div class="note-box" style="margin-top:12px"><p class="eyebrow" style="margin:0 0 6px">Кредит 19,2% · МПТ + Совкомбанк лизинг</p>
              <p class="calc-note">Доп. расчёт к лизингу. Цена ${rub(Math.round(price))} ₽, ставка 19,2%.</p>
              ''' + new_loan + '''
            </div>`:""}'''
    if fleet_mark in html and "Кредит 19,2%" not in html:
        html = html.replace(fleet_mark, fleet_extra, 1)
        print("fleet 19.2 insert")
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
