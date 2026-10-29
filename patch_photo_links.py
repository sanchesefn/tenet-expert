#!/usr/bin/env python3
"""Кнопка «Фото» (папка Drive по VIN) в карточках склада.
Подключается из конца patch_issue.py (pages.yml этим токеном не правится).
Ссылки читаются в рантайме из photo-links.json — файл можно заменить пушем."""
from pathlib import Path
import shutil
ROOT = Path(__file__).resolve().parent
TAG = '<script src="photo-links.js?v=1"></script>'
def main():
    site = ROOT / "_site"; site.mkdir(exist_ok=True)
    for n in ("photo-links.json", "photo-links.js"):
        if (ROOT / n).is_file():
            shutil.copyfile(ROOT / n, site / n); print("photo-links: copied", n)
    for p in (ROOT / "index.html", site / "index.html"):
        if not p.is_file() or p.stat().st_size < 1000: continue
        t = p.read_text(encoding="utf-8")
        if "photo-links.js" in t: continue
        t = t.replace("</body>", TAG + "\n</body>", 1) if "</body>" in t else t + "\n" + TAG + "\n"
        p.write_text(t, encoding="utf-8"); print("photo-links: tag", p)
if __name__ == "__main__":
    main()
