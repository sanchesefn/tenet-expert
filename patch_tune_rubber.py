#!/usr/bin/env python3
"""Keep T9 R19 tire note in sync with Drive «Резина Чери.xlsx»: под заказ 3 раб дня."""
from pathlib import Path

OLD = '["T9 R19",[["235/55 R19",15750,63000,"0 · под заказ"]]]'
NEW = '["T9 R19",[["235/55 R19",15750,63000,"0 · под заказ 3 раб дня"]]]'
OLD2 = '["235/55 R19",15750,63000,"0 · под заказ"]'
NEW2 = '["235/55 R19",15750,63000,"0 · под заказ 3 раб дня"]'

def patch(path: Path) -> bool:
    if not path.exists():
        return False
    t = path.read_text(encoding="utf-8")
    if NEW in t or NEW2 in t:
        print(path, "already has 3 раб дня")
        return False
    if OLD in t:
        t = t.replace(OLD, NEW, 1)
    elif OLD2 in t:
        t = t.replace(OLD2, NEW2, 1)
    else:
        print(path, "T9 R19 order note not found")
        return False
    path.write_text(t, encoding="utf-8")
    print(path, "patched")
    return True

def main():
    changed = False
    for p in (Path("index.html"), Path("_site/index.html")):
        changed = patch(p) or changed
    if not changed:
        print("no file changed")

if __name__ == "__main__":
    main()
