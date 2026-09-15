#!/usr/bin/env python3
from pathlib import Path
import json

OLD_BEST = "        const rows=all.filter(r=>Number(r.exam||1)===examNo && (r.model||\"t4l\")===modelId && r.status!==\"running\");"
NEW_BEST = "        const rows=all.filter(r=>r && !r.type && r.percent!=null && Number(r.exam||1)===examNo && (r.model||\"t4l\")===modelId && r.status!==\"running\");"

OLD_ROW = (
    "      function personRow(p, wait){\n"
    "        const extra=wait && p.was==null && p.now==null ? `<p>ещё не сдавал</p>` : \"\";\n"
    "        return `<div class=\"rate-person\"><div><b>${escape(p.name)}</b>${extra}</div>${pctCell(p.was)}${pctCell(p.now)}</div>`;\n"
    "      }"
)
NEW_ROW = (
    "      function personRow(p, wait){\n"
    "        const extra=wait && p.was==null && p.now==null ? `<p>ещё не сдавал</p>` : \"\";\n"
    "        if(!wait && ((p.was===100 && p.now==null) || (p.now===100 && p.was==null))){\n"
    "          return `<div class=\"rate-person is-100\"><div><b>${escape(p.name)}</b></div><span class=\"pct ok span2\">100%</span></div>`;\n"
    "        }\n"
    "        return `<div class=\"rate-person\"><div><b>${escape(p.name)}</b>${extra}</div>${pctCell(p.was)}${pctCell(p.now)}</div>`;\n"
    "      }"
)

OLD_SPLIT = (
    "          <div class=\"rate-split\">гости</div>\n"
    "          ${guests.length?guests.map(p=>personRow(p,false)).join(\"\"):`<p class=\"empty\">Нет гостевых сдач</p>`}"
)
NEW_SPLIT = "          ${guests.length?`<div class=\"rate-split\">гости</div>${guests.map(p=>personRow(p,false)).join(\"\")}`:\"\"}"

OLD_CSS = ".rate-person{display:grid;grid-template-columns:minmax(0,1fr) 44px 44px;gap:4px;align-items:center;}"
NEW_CSS = OLD_CSS + ".rate-person .pct.span2{grid-column:2/4;text-align:center;}"


def patch(text: str) -> str:
    if "r.percent!=null && Number(r.exam" not in text:
        text = text.replace(OLD_BEST, NEW_BEST)
    if "is-100" not in text:
        text = text.replace(OLD_ROW, NEW_ROW)
    if "filter(p=>p.was!=null || p.now!=null)" not in text:
        idx = text.find("const guests=")
        if idx >= 0:
            text = text[:idx] + text[idx:].replace(
                "}).sort((a,b)=>(b.was||0)-(a.was||0) || a.name.localeCompare(b.name,\"ru\"));",
                "}).filter(p=>p.was!=null || p.now!=null).sort((a,b)=>(b.was||0)-(a.was||0) || a.name.localeCompare(b.name,\"ru\"));",
                1,
            )
    if "Нет гостевых сдач" in text:
        text = text.replace(OLD_SPLIT, NEW_SPLIT, 1)
    if "pct.span2" not in text:
        text = text.replace(OLD_CSS, NEW_CSS, 1)
    text = text.replace('\"спицын\": \"6669\"', '\"спицын\": \"3759\"')
    text = text.replace('\"спицын\":\"6669\"', '\"спицын\":\"3759\"')
    text = text.replace(\"const sn=norm(v);\", \"const sn=staffKey(v)||norm(v);\")
    return text


def write_pins():
    for folder in (Path(\"_site\"), Path(\".\")):
        p = folder / \"pins.json\"
        if not p.exists() and folder.name != \"_site\":
            continue
        if folder.name == \"_site\":
            folder.mkdir(exist_ok=True)
        data = {}
        if p.exists():
            try:
                data = json.loads(p.read_text(encoding=\"utf-8\"))
            except Exception:
                data = {}
        if not isinstance(data, dict):
            data = {}
        data[\"спицын\"] = \"3759\"
        p.write_text(json.dumps(data, ensure_ascii=False), encoding=\"utf-8\")
        print(\"pins.json updated\", p)


def main():
    n = 0
    for path in (Path(\"_site/index.html\"), Path(\"TENET_T4L_netlify/index.html\")):
        if not path.exists():
            continue
        src = path.read_text(encoding=\"utf-8\")
        out = patch(src)
        if out != src:
            path.write_text(out, encoding=\"utf-8\")
            print(\"rate-ui patched\", path)
            n += 1
        else:
            print(path, \"rate-ui unchanged\")
    write_pins()
    print(\"rate-ui changed\", n)


if __name__ == \"__main__\":
    main()
