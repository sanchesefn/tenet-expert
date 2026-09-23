#!/usr/bin/env python3
"""Align KM card with the down-payment bar. Split recommend and stock into two cards."""
from pathlib import Path

OLD_BOTTOM = """.km-bottom{display:grid;gap:14px;margin-top:14px;align-items:start}
.km-bottom .dc-result{margin-top:0}
@media(min-width:900px){
  .km-bottom{grid-template-columns:1fr 1fr}
  .km-bottom .stock-side{max-height:min(72vh,720px)}
}"""

NEW_BOTTOM = """.km-bottom{display:grid;gap:14px;margin-top:14px;align-items:start}
.km-bottom .dc-result{margin-top:0}
@media(min-width:900px){
  .km-bottom{grid-template-columns:1fr 1fr}
  .km-bottom .stock-side,.km-bottom .stock-rec{max-height:min(72vh,720px);overflow:auto}
}
@media(min-width:1100px){
  .km-bottom:has(.stock-rec){grid-template-columns:1fr 1fr 1fr}
}"""

OLD_STAGE = """@media(min-width:1100px){
  .km-stage.km-4,.km-stage.km-3{display:grid;align-items:start}
  .km-stage.km-4{grid-template-columns:1fr 1fr 1fr 1fr;gap:14px}
  .km-stage.km-3{grid-template-columns:minmax(220px,.7fr) minmax(300px,1.2fr) minmax(300px,1.2fr);gap:16px}
  .km-stage.km-4 > .km-chips,.km-stage.km-3 > .km-chips{grid-column:1 / -1;grid-row:1;min-width:0}
  .km-stage.km-4 > .km-pv,.km-stage.km-3 > .km-pv{grid-column:2 / -1;grid-row:1;align-self:end;z-index:2;min-width:0}
  .km-stage.km-4 > .km-chips .km-line:nth-last-child(-n+3){max-width:calc((100% - 42px) / 4)}
  .km-stage.km-3 > .km-chips .km-line:nth-last-child(-n+3){max-width:calc((100% - 32px) * 0.226)}
  .km-stage > .km-layout{grid-column:1 / -1;grid-row:2;margin-top:0}
}"""

NEW_STAGE = """@media(min-width:1100px){
  .km-stage.km-4,.km-stage.km-3{display:block}
  .km-stage.km-4 > .km-layout,.km-stage.km-3 > .km-layout{display:grid;align-items:start;margin-top:0}
  .km-stage.km-4 > .km-layout{grid-template-columns:1fr 1fr 1fr 1fr;gap:14px}
  .km-stage.km-3 > .km-layout{grid-template-columns:minmax(220px,.7fr) minmax(300px,1.2fr) minmax(300px,1.2fr);gap:16px}
  .km-stage.km-4 > .km-layout > .km-disc,.km-stage.km-3 > .km-layout > .km-disc{grid-column:1;grid-row:1}
  .km-stage.km-4 > .km-layout > .km-credit,.km-stage.km-3 > .km-layout > .km-credit{grid-column:2 / -1;grid-row:1}
}
.km-credit{min-width:0}
.km-pays{display:grid;gap:14px;margin-top:14px;align-items:start}
@media(min-width:960px){
  .km-pays{grid-template-columns:1fr 1fr}
}
@media(min-width:1100px){
  .km-stage.km-4 .km-pays{grid-template-columns:1fr 1fr 1fr;gap:14px}
  .km-stage.km-3 .km-pays{grid-template-columns:1fr 1fr;gap:16px}
}"""

OLD_LIST = """      return `<div class="card stock-side rec-box">
        <p class="eyebrow">В наличии · ${escape(m.name)}</p>
        <p class="lead" style="max-width:none;margin:0 0 10px">${inn.length} в салоне · ${way.length} в пути.</p>
        ${recBlock}
        ${inn.length?`<p class="stock-h">Эта комплектация · ${inn.length}</p>`+inn.map(c=>carBtn(c)).join(""):""}
        ${way.length?`<p class="stock-h">В пути · ${way.length}</p>`+way.map(c=>carBtn(c)).join(""):""}
      </div>`;"""

NEW_LIST = """      const recCard=recBlock?`<div class="card stock-rec"><p class="eyebrow">Рекомендуем</p>${recBlock}</div>`:"";
      const stockCard=cars.length?`<div class="card stock-side"><p class="eyebrow">В наличии · ${escape(m.name)}</p><p class="lead" style="max-width:none;margin:0 0 10px">${inn.length} в салоне · ${way.length} в пути.</p>${inn.length?`<p class="stock-h">Эта комплектация · ${inn.length}</p>`+inn.map(c=>carBtn(c)).join(""):""}${way.length?`<p class="stock-h">В пути · ${way.length}</p>`+way.map(c=>carBtn(c)).join(""):""}</div>`:"";
      return recCard+stockCard;"""


def patch_pages(text):
    needle = "if [ -f patch_km_pv.py ]; then python3 patch_km_pv.py || true; fi"
    add = needle + "\n          if [ -f patch_km_line.py ]; then python3 patch_km_line.py || true; fi"
    if "patch_km_line.py" in text:
        return text, 0
    if needle not in text:
        return text, 0
    return text.replace(needle, add, 1), 1


def patch_text(text):
    n = 0
    if "display:contents" not in text and OLD_STAGE in text:
        text = text.replace(OLD_STAGE, NEW_STAGE, 1)
        n += 1
    if ".km-bottom:has(.stock-rec)" not in text and OLD_BOTTOM in text:
        text = text.replace(OLD_BOTTOM, NEW_BOTTOM, 1)
        n += 1
    if "card stock-rec" not in text and OLD_LIST in text:
        text = text.replace(OLD_LIST, NEW_LIST, 1)
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
            print("line", p.name, n)
        else:
            print(p.name, "unchanged", n)


if __name__ == "__main__":
    main()
