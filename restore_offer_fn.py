#!/usr/bin/env python3
from pathlib import Path
import base64
parts = sorted(Path(".").glob("offer-fn.b64.*"))
if not parts:
    print("no offer-fn.b64 parts")
    raise SystemExit(0)
blob = "".join(p.read_text(encoding="ascii").strip() for p in parts)
text = base64.b64decode(blob).decode("utf-8")
Path("offer-fn.js").write_text(text, encoding="utf-8")
print("restored offer-fn.js", len(text), "parts", len(parts))
