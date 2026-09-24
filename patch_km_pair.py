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
      const groups={};
      KM_MODELS.forEach(x=>{
        const g=kmLineOf(x.id);
        (groups[g]=groups[g]||[]).push(x);
      });
      const line=(g,tone)=>groups[g]&&groups[g].length?`<div class="km-line tone-${tone}"><p class="stock-h">${escape(g)}</p><div class="km-grid">${groups[g].map(x=>`<button type="button" class="chip ${x.id===active?"on":""}" data-km-id="${x.id}">${escape(x.name)}<small>${x.brand} · РРЦ ${rub(x.rrc)}</small></button>`).join("")}</div></div>`:"";
      const slot=(cls,html)=>html?`<div class="km-slot ${cls}">${html}</div>`:"";
      return `<div class="km-board"><span class="km-brand tenet">TENET</span><span class="km-brand chery">CHERY</span>`
        +slot("s-t4",`<div class="km-pair is-2">${line("T4","a")}${line("T4L","a")}</div>`)
        +slot("s-t7",line("T7","a"))
        +slot("s-c7",line("Tiggo 7 L","b"))
        +slot("s-t8",line("T8","a"))
        +slot("s-t9",line("TENET T9","a"))
        +slot("s-c9",line("Tiggo 9","b"))
        +slot("s-a8",line("TENET A8","a"))
        +slot("s-ca",line("Arrizo 8","b"))
        +`</div>`;
    }'''

CSS = '''
.km-chips{display:flex;flex-direction:column;gap:10px;margin:4px 0 32px}
.km-board{display:flex;flex-direction:column;gap:10px;min-width:0}
.km-brand{display:none}
.km-slot{min-width:0}
.km-pair{display:grid;gap:10px;min-width:0}
.km-pair > .km-line,.km-slot > .km-line{margin:0;padding:8px 10px 10px;border-radius:14px;min-width:0}
.km-line.tone-a{background:#f4efe6;border:1px solid #e3d5c2;border-left:3px solid #c4a574}
.km-line.tone-b{background:#e8eef3;border:1px solid #d0dbe3;border-left:3px solid #7f97ab}
.km-pair > .km-line .stock-h,.km-slot > .km-line .stock-h{margin:2px 2px 8px}
@media(min-width:1100px){
  .km-board{display:grid;grid-template-columns:minmax(600px,1.32fr) minmax(440px,1fr);gap:10px 12px;align-items:start}
  .km-brand{display:block;margin:0 2px 0;font-size:13px;font-weight:800;letter-spacing:.18em}
  .km-brand.tenet{grid-column:1;grid-row:1;color:#8a6840}
  .km-brand.chery{grid-column:2;grid-row:1;color:#3e5870}
  .km-slot.s-t4{grid-column:1;grid-row:2}
  .km-slot.s-t7{grid-column:1;grid-row:3}
  .km-slot.s-c7{grid-column:2;grid-row:3}
  .km-slot.s-t8{grid-column:1 / -1;grid-row:4}
  .km-slot.s-t9{grid-column:1;grid-row:5}
  .km-slot.s-c9{grid-column:2;grid-row:5}
  .km-slot.s-a8{grid-column:1;grid-row:6}
  .km-slot.s-ca{grid-column:2;grid-row:6}
  .km-pair.is-2{grid-template-columns:1fr 1fr;align-items:start}
  .km-slot.s-t4 .km-pair.is-2{grid-template-columns:minmax(168px,.58fr) minmax(0,1.42fr)}
  .km-slot.s-t4 .km-line:last-child .km-grid{grid-template-columns:1fr 1fr}
  .km-slot.s-t7 .km-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
  .km-slot.s-t7 .chip{min-width:0;padding-left:8px;padding-right:8px}
  .km-slot.s-t7 .chip small{white-space:nowrap}
  body:has(.km-board) .wrap{max-width:1680px !important}
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
    if "km-brand" not in text and OLD_FN in text:
        text = text.replace(OLD_FN, NEW_FN, 1)
        n += 1
    if ".km-brand{" not in text and "</style>" in text:
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
