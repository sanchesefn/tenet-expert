#!/usr/bin/env python3
"""ДО и каско сверх 70 000 / 150 000 входят в тело МПТ и PANGO."""
from pathlib import Path

PAIRS = [
    (
        "const extras=(useLoan||_pgTrim)?(addons+(pack||0)+fee):0;\n",
        "const extras=(useLoan||_pgTrim)?(addons+(pack||0)+fee):0;\n"
        "      const finDelta=(addons-70000)+((useLoan||_pgTrim)?((pack||0)-150000):0);\n",
    ),
    (
        "      const downMptCar=Math.max(0, downMptShow-MPT_EXTRA);\n"
        "      const creditMpt=Math.max(0, priceMpt-downMptCar);\n"
        "      const mptTerm=Math.min(Math.max(1, months), 84);\n"
        "      const payMpt=typeof calcPay==\"function\"?calcPay(priceMpt, downMptCar, mptTerm, 19.2):0;\n",
        "      const downMptCar=Math.max(0, downMptShow-MPT_EXTRA);\n"
        "      const addons=typeof kmVal===\"function\"?kmVal(\"kmDo\", 70000):70000;\n"
        "      const pack=typeof kmVal===\"function\"?kmVal(\"kmPack\", 150000):150000;\n"
        "      const finDelta=(addons-70000)+(pack-150000);\n"
        "      const creditMpt=Math.max(0, priceMpt-downMptCar+finDelta);\n"
        "      const mptTerm=Math.min(Math.max(1, months), 84);\n"
        "      const payMpt=typeof calcPay===\"function\"?calcPay(priceMpt+finDelta, downMptCar, mptTerm, 19.2):0;\n",
    ),
    (
        "      const addons=70000;\n      const pack=150000;\n",
        "",
    ),
    (
        "const creditMpt=Math.max(0, priceMpt-downMptCar);",
        "const creditMpt=Math.max(0, priceMpt-downMptCar+finDelta);",
    ),
    (
        "calcPay(priceMpt, downMptCar",
        "calcPay(priceMpt+finDelta, downMptCar",
    ),
    (
        "pFix-pDownP)+pBundle;",
        "pFix-pDownP)+pBundle+finDelta;",
    ),
    (
        '<div class="bank-row"><span>ПВ в авто</span><span class="pay">${rub(downMptCar)}</span></div>\n'
        '                <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>',
        '<div class="bank-row"><span>ПВ в авто</span><span class="pay">${rub(downMptCar)}</span></div>\n'
        '                ${finDelta?`<div class="bank-row"><span>Д/О и каско сверх нормы</span><span class="pay">${finDelta>0?"+":"−"} ${rub(Math.abs(finDelta))}</span></div>`:""}\n'
        '                <div class="bank-row"><span>Тело кредита</span><span class="pay">${rub(creditMpt)}</span></div>',
    ),
    (
        '<div class="bank-row"><span>Каско + GAP + ДМС</span><span class="pay">${rub(pBundle)}</span></div>\n'
        '              <div class="bank-row"><span>НСС 0,89% × ${pYearsLabel} ${pYearsWord}</span><span class="pay">${rub(pNss)}</span></div>',
        '<div class="bank-row"><span>Каско + GAP + ДМС</span><span class="pay">${rub(pBundle)}</span></div>\n'
        '              ${finDelta?`<div class="bank-row"><span>Д/О и каско сверх нормы</span><span class="pay">${finDelta>0?"+":"−"} ${rub(Math.abs(finDelta))}</span></div>`:""}\n'
        '              <div class="bank-row"><span>НСС 0,89% × ${pYearsLabel} ${pYearsWord}</span><span class="pay">${rub(pNss)}</span></div>',
    ),
]


def patch_pages(text):
    needle = "if [ -f patch_km_line.py ]; then python3 patch_km_line.py || true; fi"
    add = needle + "\n          if [ -f patch_km_fin.py ]; then python3 patch_km_fin.py || true; fi"
    if "patch_km_fin.py" in text:
        return text, 0
    if needle not in text:
        return text, 0
    return text.replace(needle, add, 1), 1


def patch_text(text):
    if "priceMpt-downMptCar+finDelta" in text and "pBundle+finDelta" in text and "сверх нормы" in text:
        return text, 0
    n = 0
    for old, new in PAIRS:
        if old and old in text:
            text = text.replace(old, new)
            n += 1
    return text, n


def main():
    files = [
        Path("index.html"),
        Path("_site/index.html"),
        Path("terms-calc-ui-b.js"),
        Path("terms-fleet.js"),
        Path("terms-calc-fn.js"),
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
            print("fin", p.name, n)
        else:
            print(p.name, "unchanged", n)


if __name__ == "__main__":
    main()
