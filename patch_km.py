#!/usr/bin/env python3
"""Restore KM bank tables if they were dropped from terms-calc-data.js."""
from pathlib import Path
import urllib.request

SRC = "https://raw.githubusercontent.com/sanchesefn/tenet-expert/3c546270ea6f075d4c1c84d7e4f4032a8faced33/terms-calc-data.js"
NEEDLE = "    const KM_BANK_FEE = 30000;"
BROKEN = "      tbank:[12,24,36,48,60,72,84,96]\n    ];"
FIXED = "      tbank:[12,24,36,48,60,72,84,96]\n    };"
ERR_OLD = (
    '<button class="btn ivory" id="hardReset">Обновить</button></div>`;\n'
    '        const r=document.getElementById("hardReset");\n'
    "        if(r) r.onclick=()=>{ location.reload(); };"
)
ERR_NEW = (
    '<button class="btn ivory" id="hardReset">Обновить</button>\n'
    '          <button class="btn ghost" id="backHub">В кабинет</button></div>`;\n'
    '        const r=document.getElementById("hardReset");\n'
    '        if(r) r.onclick=()=>{ view="hub"; state.section="hub"; try{save();}catch(e){} location.assign(location.pathname); };\n'
    '        const b=document.getElementById("backHub");\n'
    '        if(b) b.onclick=()=>{ view="hub"; state.section="hub"; try{save();}catch(e){} render(); };'
)


def bank_block():
    raw = urllib.request.urlopen(SRC, timeout=30).read().decode()
    a = raw.find("    const KM_DC_DEF")
    b = raw.find("    function kmBankRate")
    if a < 0 or b < 0:
        raise SystemExit("bank block not found in source")
    return raw[a:b].replace(BROKEN, FIXED)


def patch_text(text: str, block: str) -> str:
    if "const KM_BANK_MONTHS" not in text and NEEDLE in text:
        text = text.replace(NEEDLE, block + NEEDLE, 1)
    text = text.replace(BROKEN, FIXED)
    if 'id="backHub"' not in text and ERR_OLD in text:
        text = text.replace(ERR_OLD, ERR_NEW, 1)
    return text


def main():
    block = bank_block()
    n = 0
    data = Path("terms-calc-data.js")
    if data.exists():
        src = data.read_text()
        out = src.replace(BROKEN, FIXED)
        if "const KM_BANK_MONTHS" not in out:
            out = out.rstrip() + "\n" + block
        if out != src:
            data.write_text(out)
            print("fixed terms-calc-data.js")
            n += 1
    for path in (Path("_site/index.html"), Path("TENET_T4L_netlify/index.html")):
        if not path.exists():
            continue
        src = path.read_text()
        out = patch_text(src, block)
        if out != src:
            path.write_text(out)
            print("km patched", path)
            n += 1
        else:
            print(path, "km already")
    print("km changed", n)


if __name__ == "__main__":
    main()
