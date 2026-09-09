from pathlib import Path
from attest_repl_a import REPLACES_A
from attest_repl_b import REPLACES_B

REPLACES = REPLACES_A + REPLACES_B
DELETE_IDS = ["terms", "child", "store80", "t7s4", "t8s4", "t9p5", "t9s3", "t9obj", "a8p5", "a8s4", "a8arg"]

def strip_obj(html, qid):
    token = '{id:"%s"' % qid
    i = html.find(token)
    if i < 0:
        print("missing delete", qid)
        return html
    j = html.find("},", i)
    if j < 0:
        print("no end", qid)
        return html
    return html[:i] + html[j + 2 :]

def main():
    p = Path("_site/index.html")
    if not p.exists():
        print("skip attest, no _site")
        return
    html = p.read_text(encoding="utf-8")
    n = 0
    for old, new in REPLACES:
        if old in html:
            html = html.replace(old, new, 1)
            n += 1
        else:
            print("MISS", old[:80])
    for qid in DELETE_IDS:
        before = html
        html = strip_obj(html, qid)
        if html != before:
            n += 1
            print("deleted", qid)
    p.write_text(html, encoding="utf-8")
    print("attest patched", n)

if __name__ == "__main__":
    main()
