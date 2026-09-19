#!/usr/bin/env python3
"""Phone rating board: 2 columns, not 6 squeezed. Do not touch stock."""
from pathlib import Path

MARK = "/* rate-mobile-v1 */"
CSS = """/* rate-mobile-v1 */
@media(max-width:719px){
  .rate-board{
    display:grid !important;
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
    gap:8px !important;
    overflow-x:visible !important;
    padding-bottom:4px !important;
    margin-top:12px !important;
  }
  .rate-col{
    flex:none !important;
    min-width:0 !important;
    padding:10px 10px 8px !important;
  }
  .rate-col h3{font-size:16px !important;margin:0 0 8px !important;}
  .rate-head{letter-spacing:.04em !important;font-size:9px !important;}
  .rate-person{padding:7px 0 !important;}
  .rate-person b{white-space:normal !important;overflow:visible !important;line-height:1.25 !important;}
  .rate-person .pct,.rate-avg .pct{font-size:13px !important;}
  .rate-head,.rate-person,.rate-avg{grid-template-columns:minmax(0,1fr) 40px 40px !important;gap:2px !important;}
  .rate-col-avg .rate-head,.rate-col-avg .rate-person,.rate-col-avg .rate-avg{grid-template-columns:minmax(0,1fr) 40px !important;}
}
@media(min-width:720px) and (max-width:1099px){
  .rate-board{
    display:grid !important;
    grid-template-columns:repeat(3,minmax(0,1fr)) !important;
    gap:10px !important;
    overflow-x:visible !important;
  }
  .rate-col{flex:none !important;min-width:0 !important;}
}
"""


def patch(text: str) -> str:
    if MARK in text:
        return text
    if "</style>" not in text:
        return text
    return text.replace("</style>", CSS + "\n</style>", 1)


def main():
    n = 0
    for path in (Path("_site/index.html"), Path("index.html"), Path("TENET_T4L_netlify/index.html")):
        if not path.exists() or path.stat().st_size < 1000:
            continue
        src = path.read_text(encoding="utf-8")
        out = patch(src)
        if out != src:
            path.write_text(out, encoding="utf-8")
            print("rate-mobile", path)
            n += 1
        else:
            print(path, "skip")
    print("changed", n)


if __name__ == "__main__":
    main()
