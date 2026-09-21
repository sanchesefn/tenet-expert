#!/usr/bin/env python3
"""Keep MPT breakdown rows from colliding on phone."""
from pathlib import Path
import re

NEW_CSS = """
.mpt-break{margin-top:12px;padding-top:10px;border-top:1px dashed #d9cbb6}
.mpt-break .bank-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:8px 0;margin-top:0;font-size:13px;border-bottom:1px solid rgba(109,90,62,.12)}
.mpt-break .bank-row:last-child{border-bottom:0}
.mpt-break .bank-row > span:first-child{color:var(--muted,#6d5a3e);flex:0 1 42%;min-width:7em;padding-right:8px;line-height:1.35}
.mpt-break .bank-row .pay,.mpt-break .bank-row > span:last-child{font-weight:700;text-align:right;font-variant-numeric:tabular-nums;flex:1 1 58%;min-width:0;overflow-wrap:anywhere;word-break:break-word;line-height:1.35}
@media (max-width:720px){
  .mpt-break .bank-row{flex-direction:column;align-items:stretch;gap:2px;padding:8px 0}
  .mpt-break .bank-row > span:first-child{flex:none;max-width:none;min-width:0;padding-right:0;font-size:11px;letter-spacing:.06em;text-transform:uppercase}
  .mpt-break .bank-row .pay,.mpt-break .bank-row > span:last-child{text-align:left;flex:none}
}
"""
OLD_CSS = """
.mpt-break{margin-top:12px;padding-top:10px;border-top:1px dashed #d9cbb6}
.mpt-break div{display:flex;justify-content:space-between;gap:10px;align-items:baseline;padding:3px 0;font-size:13px}
.mpt-break span{color:var(--muted,#6d5a3e)}
.mpt-break b{font-variant-numeric:tabular-nums;font-weight:700;text-align:right}
.mpt-break small{display:block;color:var(--muted,#6d5a3e);margin-top:6px}
"""

def fix_mpt_html(text):
    def repl_block(m):
        block = m.group(0)
        block2, _ = re.subn(
            r'<div><span>([\s\S]*?)</span><b>([\s\S]*?)</b></div>',
            r'<div class="bank-row"><span>\1</span><span class="pay">\2</span></div>',
            block,
        )
        return block2
    out, _ = re.subn(r'<div class="mpt-break">[\s\S]*?</div>`;', repl_block, text)
    return out

def patch_text(text):
    if OLD_CSS in text:
        text = text.replace(OLD_CSS, NEW_CSS)
    elif ".mpt-break .bank-row{" not in text and ".mpt-break{" in text:
        text = text.replace("</style>", NEW_CSS + "\n</style>", 1)
    if '<div class="mpt-break">' in text and '<div><span>Комплектация</span><b>' in text:
        text = fix_mpt_html(text)
    return text

def main():
    for path in (Path("index.html"), Path("_site/index.html"), Path("TENET_T4L_netlify/index.html"),
                 Path("terms-ui.css"), Path("terms-fleet.js"), Path("terms-calc-ui-b.js"), Path("terms-calc-fn.js")):
        if not path.exists() or path.stat().st_size < 50:
            continue
        src = path.read_text(encoding="utf-8")
        out = patch_text(src)
        if out != src:
            path.write_text(out, encoding="utf-8")
            print("mpt-break patched", path)
        else:
            print(path, "mpt-break already")

if __name__ == "__main__":
    main()
