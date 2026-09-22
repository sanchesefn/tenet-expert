#!/usr/bin/env python3
"""Visually split standard credit vs MPT / brand-subsidy columns."""
from pathlib import Path

OLD_CSS = """
.pay-split{display:grid;grid-template-columns:1fr;gap:10px;margin-top:12px}
@media (min-width:720px){.pay-split{grid-template-columns:1fr 1fr;align-items:start}}
.pay-col{border:1px solid #eadfcf;border-radius:14px;padding:10px 12px;background:#fff}
.pay-col.mpt{background:#f3eee4;border-style:dashed;border-color:#d9cbb6}
.pay-col .eyebrow{margin:0 0 6px}
.pay-col .bank-row{margin-top:8px}
"""

NEW_CSS = """
.pay-split{display:grid;grid-template-columns:1fr;gap:14px;margin-top:14px}
@media (min-width:720px){.pay-split{grid-template-columns:1fr 1fr;align-items:start;gap:16px}}
.pay-col{border:1.5px solid #9bb0c7;border-radius:14px;padding:12px 14px;background:#f4f7fb;box-shadow:inset 4px 0 0 #1f4e79}
.pay-col.std{border-color:#9bb0c7;background:#f4f7fb;box-shadow:inset 4px 0 0 #1f4e79}
.pay-col.mpt{background:#eef6ee;border:1.5px solid #7fb084;border-style:solid;box-shadow:inset 4px 0 0 #2e7d32}
.pay-col.sub{background:#fbf4e6;border:1.5px solid #d4a84a;border-style:solid;box-shadow:inset 4px 0 0 #c28b2a}
.pay-col .eyebrow{margin:0 0 6px}
.pay-col.std .eyebrow{color:#1f4e79}
.pay-col.mpt .eyebrow{color:#1e5c24}
.pay-col.sub .eyebrow{color:#8a5a10}
.pay-col .bank-row{margin-top:8px}
.pay-col.std .mpt-break{border-top-color:rgba(31,78,121,.28)}
.pay-col.mpt .mpt-break{border-top-color:rgba(46,125,50,.32)}
.pay-col.sub .mpt-break{border-top-color:rgba(194,139,42,.4)}
"""


def patch_text(text):
    n = 0
    if NEW_CSS.strip() in text and 'class="pay-col std"' in text:
        return text, 0
    if OLD_CSS in text:
        text = text.replace(OLD_CSS, NEW_CSS)
        n += 1
    elif ".pay-col.std{" not in text and ".pay-split{" in text:
        text = text.replace(
            ".pay-col{border:1px solid #eadfcf;border-radius:14px;padding:10px 12px;background:#fff}\n.pay-col.mpt{background:#f3eee4;border-style:dashed;border-color:#d9cbb6}",
            ".pay-col{border:1.5px solid #9bb0c7;border-radius:14px;padding:12px 14px;background:#f4f7fb;box-shadow:inset 4px 0 0 #1f4e79}\n.pay-col.std{border-color:#9bb0c7;background:#f4f7fb;box-shadow:inset 4px 0 0 #1f4e79}\n.pay-col.mpt{background:#eef6ee;border:1.5px solid #7fb084;border-style:solid;box-shadow:inset 4px 0 0 #2e7d32}\n.pay-col.sub{background:#fbf4e6;border:1.5px solid #d4a84a;border-style:solid;box-shadow:inset 4px 0 0 #c28b2a}",
            1,
        )
        if ".pay-col.std .eyebrow{" not in text:
            text = text.replace(
                ".pay-col .eyebrow{margin:0 0 6px}",
                ".pay-col .eyebrow{margin:0 0 6px}\n.pay-col.std .eyebrow{color:#1f4e79}\n.pay-col.mpt .eyebrow{color:#1e5c24}\n.pay-col.sub .eyebrow{color:#8a5a10}",
                1,
            )
        n += 1
    elif ".pay-col.std{" not in text and "</style>" in text:
        text = text.replace("</style>", NEW_CSS + "\n</style>", 1)
        n += 1
    if 'class="pay-col std"' not in text:
        c = text.count('<div class="pay-col">')
        if c:
            text = text.replace('<div class="pay-col">', '<div class="pay-col std">')
            n += 1
    fleet_old = '''          <div class="pay-col mpt">
            <p class="eyebrow">${headLabel}</p>'''
    fleet_new = '''          <div class="pay-col ${isSub?"sub":"mpt"}">
            <p class="eyebrow">${headLabel}</p>'''
    if fleet_old in text:
        text = text.replace(fleet_old, fleet_new)
        n += 1
    km_old = '''                <div class="pay-col mpt">
                  <p class="eyebrow">${showSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>'''
    km_new = '''                <div class="pay-col ${showSub?"sub":"mpt"}">
                  <p class="eyebrow">${showSub?"Субсидия бренда · Совкомбанк 19,2%":"Гос. программа · МПТ · Совкомбанк 19,2%"}</p>'''
    if km_old in text:
        text = text.replace(km_old, km_new)
        n += 1
    return text, n


def main():
    files = [
        Path("index.html"),
        Path("_site/index.html"),
        Path("TENET_T4L_netlify/index.html"),
        Path("terms-ui.css"),
        Path("terms-fleet.js"),
        Path("terms-calc-ui-b.js"),
        Path("terms-calc-fn.js"),
    ]
    for p in files:
        if not p.exists() or p.stat().st_size < 50:
            continue
        src = p.read_text(encoding="utf-8")
        out, n = patch_text(src)
        if n and out != src:
            p.write_text(out, encoding="utf-8")
            print("mpt-split", p, n)
        else:
            print(p, "unchanged")


if __name__ == "__main__":
    main()
