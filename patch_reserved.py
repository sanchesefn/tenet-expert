#!/usr/bin/env python3
"""Inject reserved («Забронирован») stock badge + CSS into index.html during Pages bake."""
from pathlib import Path

CSS = ".st.reserved{background:#e3f2fd;color:#0d47a1;border:1px solid #90caf9}"
BADGE = '      if(r.reserved) bits.push(`<span class="st reserved">Забронирован</span>`);'
NEEDLES = [
    'if(r.corp || (typeof CORP_VINS!=="undefined" && CORP_VINS.has(r.vin))) bits.push(`<span class="st corp">Корпоративный</span>`);',
    'if(r.corp || (typeof CORP_VINS!=="undefined" && CORP_VINS.has(r.vin))) bits.push(`<span class="st corp">Корпоративный · лизинг</span>`);',
    'if(r.corp) bits.push(`<span class="st corp">Корпоративный</span>`);',
]
DEMO = 'if(r.demo) bits.push(`<span class="st demo">ДЕМО</span>`);'

def patch_one(p: Path) -> None:
    html = p.read_text(encoding="utf-8")
    changed = False
    if ".st.reserved{" not in html:
        if ".st.corp{background:#ede7f6;color:#4527a0}" in html:
            html = html.replace(
                ".st.corp{background:#ede7f6;color:#4527a0}",
                ".st.corp{background:#ede7f6;color:#4527a0}\n" + CSS,
                1,
            )
        else:
            html = html.replace("</style>", CSS + "\n</style>", 1)
        changed = True
    if 'class="st reserved"' not in html:
        placed = False
        for n in NEEDLES:
            if n in html:
                html = html.replace(n, n + "\n" + BADGE, 1)
                placed = True
                break
        if not placed and DEMO in html:
            html = html.replace(DEMO, BADGE + "\n      " + DEMO, 1)
            placed = True
        if placed:
            changed = True
        else:
            print("WARN: stockBadges corp/demo needle not found in", p)
    print(("patched" if changed else "unchanged"), p)
    p.write_text(html, encoding="utf-8")

for rel in ("index.html", "_site/index.html", "TENET_T4L_netlify/index.html"):
    path = Path(rel)
    if path.exists():
        patch_one(path)
