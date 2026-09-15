#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(".")
SITE = Path("_site/index.html")
JS = ROOT / "duty-fn.js"
STOCK_JS = ROOT / "stock-fn.js"

CSS = """
.st.lease{display:none!important}
.cl{display:flex;flex-direction:column;gap:10px}
.cl-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.cl-bar input{min-height:34px;padding:6px 10px;border-radius:10px}
.cl-prog{flex:1;min-width:160px;height:10px;background:#efe6d8;border-radius:99px;overflow:hidden;position:relative}
.cl-prog i{display:block;height:100%;background:#2e7d32;border-radius:99px}
.cl-prog span{position:absolute;right:8px;top:-18px;font-size:11px;color:#6d6458}
.cl-cars{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
@media (max-width:1100px){.cl-cars{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:720px){.cl-cars{grid-template-columns:1fr 1fr}}
.cl-car{background:#fff;border:1px solid #eadfcf;border-radius:14px;padding:10px}
.cl-car h3{margin:0 0 8px;font-size:14px}
.cl-item{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px;cursor:pointer}
.cl-item input{appearance:none;-webkit-appearance:none;width:18px;height:18px;border:1.5px solid #8d7f6a;border-radius:4px;background:#fff;flex:none;position:relative;print-color-adjust:exact;-webkit-print-color-adjust:exact}
.cl-mark{width:18px;height:18px;margin-left:-26px;pointer-events:none;display:inline-flex;align-items:center;justify-content:center;font:800 14px/1 Inter,Arial,sans-serif;color:transparent}
.cl-item input:checked{background:#e8f5e9;border-color:#1b5e20}
.cl-item input:checked + .cl-mark{color:#145a1f}
.cl-nums{display:flex;gap:6px;margin-top:6px}
.cl-nums label{flex:1;font-size:10px;color:#7a7166}
.cl-nums input,.cl-car select{width:100%;min-height:30px;border:1px solid #eadfcf;border-radius:8px;padding:4px 6px}
.cl-foot{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.cl-box{background:#fff;border:1px solid #eadfcf;border-radius:14px;padding:10px}
.cl-box b{display:block;margin-bottom:6px;font-size:12px}
.cl-chips{display:flex;flex-wrap:wrap;gap:6px}
.cl-chips label{display:inline-flex;gap:6px;align-items:center;padding:6px 8px;border:1px solid #eadfcf;border-radius:999px;font-size:12px;background:#fbf7f0}
.st-filters{display:flex;flex-wrap:wrap;gap:8px}
.st-acc{border:1px solid #eadfcf;border-radius:14px;background:#fff;margin:8px 0;overflow:hidden}
.st-acc summary{list-style:none;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer}
.st-acc summary::-webkit-details-marker{display:none}
.st-acc summary small{display:block;font-size:11px;color:#7a7166;font-weight:500}
.st-acc summary b{font-size:16px}
.st-count{font-size:12px;color:#6d6458;white-space:nowrap}
.st-list{border-top:1px solid #f0e6d8}
.st-row{display:grid;grid-template-columns:1fr auto;gap:6px 12px;padding:10px 14px;border-top:1px solid #f3eadc}
.st-row:first-child{border-top:0}
.st-row small{display:block;color:#7a7166;font-size:12px;line-height:1.35}
.st-vin{word-break:break-all;font-family:ui-monospace,Menlo,monospace;font-size:11px}
.st-side{text-align:right;min-width:92px}
.st-flags{margin-top:6px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px}
.study-pick{flex-wrap:wrap}
@media print{
  header,nav,.who-line,.hub-grid,.cl-bar .btn{display:none!important}
  .cl-item input{appearance:none!important;border:1.4px solid #000!important;background:#fff!important}
  .cl-item input:checked + .cl-mark{color:#000!important}
  .cl-mark{color:#000}
  .st-acc{break-inside:avoid}
}
"""

def patch(html: str) -> str:
    js = JS.read_text(encoding="utf-8") if JS.exists() else ""
    if js:
        if "function stockBlob(c){" in html:
            html = re.sub(r"    function stockBlob\(c\)\{[\s\S]*?(?=    function login\(\)\{)", js, count=1)
            print("duty fn replaced")
        elif "    function login(){" in html:
            html = html.replace("    function login(){", js + "    function login(){", 1)
            print("duty fn insert")
    stock_js = STOCK_JS.read_text(encoding="utf-8") if STOCK_JS.exists() else ""
    if stock_js and "function stock(){" in html:
        new_html, n = re.subn(
            r"    function salonLabel\(s\)\{[\s\S]*?\n    function stock\(\)\{[\s\S]*?\n    function ",
            stock_js + "    function ",
            html,
            count=1,
        )
        if n:
            html = new_html
            print("stock fn replaced via salonLabel")
        else:
            new_html, n = re.subn(
                r"    function stock\(\)\{[\s\S]*?\n    function ",
                stock_js + "    function ",
                html,
                count=1,
            )
            if n:
                html = new_html
                print("stock fn replaced")
    html = html.replace(
        '${(typeof stockHasSovcom==="function"&&stockHasSovcom(r))?` <span class="st lease">Совкомбанк лизинг</span>`:""}',
        "",
    )
    if ".st-acc{" not in html:
        html = html.replace("</style>", CSS + "\n</style>", 1)
        print("stock/duty css")
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
    if 'if(typeof dutyBind==="function") dutyBind();' not in html:
        html = html.replace(
            'if(typeof eptsBind==="function") eptsBind();',
            'if(typeof eptsBind==="function") eptsBind();\n      if(typeof dutyBind==="function") dutyBind();',
            1,
        )
    html = html.replace(
        '["kmRrc","kmInv","kmUseTi","kmFleetDisc","kmFleetMpt"',
        '["kmRrc","kmInv","kmUseTi","kmFleetDisc","kmFleetMpt","cDownMode","cDown","cDownPct","cMonths"',
    )
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
