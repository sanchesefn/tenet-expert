#!/usr/bin/env python3
"""Keep reserved («Забронирован») CSS in sync: centered badge + row tint. Logic lives in stock-fn.js."""
from pathlib import Path

CSS_BADGE = ".st.reserved{background:#e3f2fd;color:#0d47a1;border:1px solid #90caf9}"
CSS_ROW = (
    ".st-row.is-reserved{background:#e8f1fc;position:relative}\n"
    ".st-row .st-reserved-mid{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);"
    "z-index:1;pointer-events:none;box-shadow:0 1px 4px rgba(13,71,161,.18)}"
)
CSS_BLOCK = CSS_BADGE + "\n" + CSS_ROW

LEGACY = '      if(r.reserved) bits.push(`<span class="st reserved">Забронирован</span>`);'

def patch_one(p: Path) -> None:
    html = p.read_text(encoding="utf-8")
    changed = False
    if ".st-row.is-reserved{" not in html:
        if CSS_BADGE in html:
            html = html.replace(CSS_BADGE, CSS_BLOCK, 1)
        elif ".st.corp{background:#ede7f6;color:#4527a0}" in html:
            html = html.replace(
                ".st.corp{background:#ede7f6;color:#4527a0}",
                ".st.corp{background:#ede7f6;color:#4527a0}\n" + CSS_BLOCK,
                1,
            )
        else:
            html = html.replace("</style>", CSS_BLOCK + "\n</style>", 1)
        changed = True
    if LEGACY in html:
        html = html.replace(LEGACY + "\n", "").replace(LEGACY, "")
        changed = True
    print(("patched" if changed else "unchanged"), p)
    p.write_text(html, encoding="utf-8")

for rel in ("index.html", "_site/index.html", "TENET_T4L_netlify/index.html"):
    path = Path(rel)
    if path.exists():
        patch_one(path)
