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
        '${inn?"\\nИНН: "+inn:""}',
    ),
]

def heal(text):
    n = 0
    for old, new in FIXES:
        if old in text:
            text = text.replace(old, new)
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
