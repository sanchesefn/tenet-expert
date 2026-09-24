#!/usr/bin/env python3
"""Pair model plates on desktop: T4/T4L, T7/7L, Tiggo 9/T9, Arrizo 8/A8."""
from pathlib import Path

OLD_FN = '''    function kmChipGroups(active){
      const order=["T4","T4L","T7","T8","TENET T9","TENET A8","Tiggo 9","Arrizo 8","Tiggo 7 L"];
      const groups={};
      KM_MODELS.forEach(x=>{
        const g=kmLineOf(x.id);
        (groups[g]=groups[g]||[]).push(x);
      });
      return order.filter(g=>groups[g]).map(g=>`<div class="km-line"><p class="stock-h">${g}</p><div class="km-grid">${groups[g].map(x=>`<button type="button" class="chip ${x.id===active?"on":""}" data-km-id="${x.id}">${escape(x.name)}<small>${x.brand} · РРЦ ${rub(x.rrc)}</small></button>`).join("")}</div></div>`).join("");
    }'''

NEW_FN = '''    function kmChipGroups(active){
      const rows=[["T4","T4L"],["T7","Tiggo 7 L"],["T8"],["Tiggo 9","TENET T9"],["Arrizo 8","TENET A8"]];
      const groups={};
      KM_MODELS.forEach(x=>{
        const g=kmLineOf(x.id);
        (groups[g]=groups[g]||[]).push(x);
      });
      const line=(g,tone)=>`<div class="km-line tone-${tone}"><p class="stock-h">${escape(g)}</p><div class="km-grid">${groups[g].map(x=>`<button type="button" class="chip ${x.id===active?"on":""}" data-km-id="${x.id}">${escape(x.name)}<small>${x.brand} · РРЦ ${rub(x.rrc)}</small></button>`).join("")}</div></div>`;
      return rows.map(pair=>{
        const present=pair.filter(g=>groups[g]&&groups[g].length);
        if(!present.length) return "";
        return `<div class="km-pair${present.length>1?" is-2":""}">${present.map((g,i)=>line(g,i?"b":"a")).join("")}</div>`;
      }).join("");
    }'''

CSS = '''
.km-chips{display:flex;flex-direction:column;gap:10px}
.km-pair{display:grid;gap:10px;min-width:0}
.km-pair > .km-line{margin:0;padding:8px 10px 10px;border-radius:14px;min-width:0}
.km-line.tone-a{background:#f4efe6;border:1px solid #e3d5c2;border-left:3px solid #c4a574}
.km-line.tone-b{background:#e8eef3;border:1px solid #d0dbe3;border-left:3px solid #7f97ab}
.km-pair > .km-line .stock-h{margin:2px 2px 8px}
@media(min-width:1100px){
  .km-pair.is-2{grid-template-columns:1fr 1fr;align-items:start}
}
'''


def patch_pages(text):
    needle = "if [ -f patch_km_fin.py ]; then python3 patch_km_fin.py || true; fi"
    add = needle + "\n          if [ -f patch_km_pair.py ]; then python3 patch_km_pair.py || true; fi"
    if "patch_km_pair.py" in text:
        return text, 0
    if needle not in text:
        return text, 0
    return text.replace(needle, add, 1), 1


def patch_text(text):
    n = 0
    if "km-pair" not in text and OLD_FN in text:
        text = text.replace(OLD_FN, NEW_FN, 1)
        n += 1
    if ".km-pair{" not in text and "</style>" in text:
        text = text.replace("</style>", CSS + "\n</style>", 1)
        n += 1
    return text, n


def main():
    files = [
        Path("index.html"),
        Path("_site/index.html"),
        Path("terms-calc-ui-a.js"),
        Path("terms-calc-fn.js"),
        Path("terms-ui.css"),
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
            print("pair", p.name, n)
        else:
            print(p.name, "unchanged", n)


if __name__ == "__main__":
    main()
