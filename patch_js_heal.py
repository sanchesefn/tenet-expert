#!/usr/bin/env python3
"""Heal broken template literals in index (do not touch stock/offer catalogs)."""
from pathlib import Path

FIXES = [
    (
        '${vin?"\nVIN: "+vin:""}',
        '${vin?"\\nVIN: "+vin:""}',
    ),
    (
        '${inn?"\nИНН: "+inn:""}',
        '${inn?"\\nИНН: "+inn:""}',
    ),
    (
        "${vin?\"\nVIN: \"+vin:\"\"}",
        '${vin?"\\nVIN: "+vin:""}',
    ),
    (
        "${inn?\"\nИНН: \"+inn:\"\"}",
        '${inn?"\\nVIN: "+vin:""}',
    ),
]

STAFF_KEY = r'''    function staffKey(s){
      const n=norm(s);
      if(!n) return "";
      if(typeof STAFF!=="undefined" && Array.isArray(STAFF) && STAFF.includes(n)) return n;
      const parts=n.split(/[\s.,/]+/).filter(Boolean);
      if(typeof STAFF!=="undefined" && Array.isArray(STAFF)){
        for(const p of parts){ if(STAFF.includes(p)) return p; }
      }
      return n;
    }
'''

NORM = '    function norm(s){ return (s||"").trim().replace(/\\s+/g," ").replace(/ё/g,"е").replace(/Ё/g,"е").toLowerCase(); }'


def heal(text):
    n = 0
    for old, new in FIXES:
        if old in text:
            text = text.replace(old, new)
            n += 1
    if "function staffKey(" not in text and "staffKey(" in text:
        if NORM in text:
            text = text.replace(NORM, NORM + "\n" + STAFF_KEY, 1)
            n += 1
        else:
            text = text.replace("function pinDigits(s){", STAFF_KEY + "\n    function pinDigits(s){", 1)
            n += 1
    return text, n

def main():
    changed = 0
    for path in (Path("index.html"), Path("_site/index.html"), Path("TENET_T4L_netlify/index.html")):
        if not path.exists() or path.stat().st_size < 1000:
            continue
        src = path.read_text(encoding="utf-8")
        out, n = heal(src)
        if out != src:
            path.write_text(out, encoding="utf-8")
            print("healed", path, "fixes", n)
            changed += 1
        else:
            print(path, "clean")
    print("changed", changed)

if __name__ == "__main__":
    main()
