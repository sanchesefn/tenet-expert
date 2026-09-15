#!/usr/bin/env python3
from pathlib import Path
import base64, urllib.request

DEST = Path("_site/hub")
ALSO = [Path("hub"), Path("TENET_T4L_netlify/hub")]
URLS = {
    "epts.jpg": "https://rentry.co/5fzomvui/raw",
    "gibdd.jpg": "https://rentry.co/ydc3ogpv/raw",
    "duty.jpg": "https://rentry.co/sisrbheb/raw",
}

def fetch():
    DEST.mkdir(parents=True, exist_ok=True)
    for name, url in URLS.items():
        try:
            raw = urllib.request.urlopen(url, timeout=40).read()
            text = raw.decode("utf-8", "ignore").strip()
            data = base64.b64decode(text)
            targets = [DEST / name] + [p / name for p in ALSO]
            for t in targets:
                t.parent.mkdir(parents=True, exist_ok=True)
                t.write_bytes(data)
            print("hub preview", name, len(data))
        except Exception as e:
            print("hub preview fail", name, e)

if __name__ == "__main__":
    fetch()
