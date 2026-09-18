#!/usr/bin/env python3
"""Add offer to render() map so hub card data-go=offer opens KP."""
from pathlib import Path

NEEDLES = [
    "const map={login,hub,home,study,quiz:brief,play,rate,hist:rate,review,terms,calc,stock,docs,epts,duty,gibdd};",
    "const map={login,hub,home,study,quiz:brief,play,rate,hist:rate,terms,calc,stock,docs,epts,duty,gibdd};",
]

def patch(text):
    if "duty,gibdd,offer}" in text:
        return text, 0
    n = 0
    for old in NEEDLES:
        if old in text:
            text = text.replace(old, old[:-2] + ",offer};", 1)
            n += 1
            break
    if n == 0 and "duty,gibdd}" in text and "function render()" in text:
        text = text.replace(
            "docs,epts,duty,gibdd};",
            "docs,epts,duty,gibdd,offer};",
            1,
        )
        n += 1
    return text, n

def main():
    changed = 0
    for path in (Path("_site/index.html"), Path("index.html"), Path("TENET_T4L_netlify/index.html")):
        if not path.exists() or path.stat().st_size < 1000:
            continue
        src = path.read_text(encoding="utf-8")
        out, n = patch(src)
        if out != src:
            path.write_text(out, encoding="utf-8")
            print("routed", path, "fixes", n, "offer-in-map", "duty,gibdd,offer}" in out)
            changed += 1
        else:
            print(path, "map", "duty,gibdd,offer}" in src)
    print("changed", changed)

if __name__ == "__main__":
    main()
