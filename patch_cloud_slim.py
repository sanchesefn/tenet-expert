#!/usr/bin/env python3
"""Legacy slim patch. Skipped when v2 already installed a non-blocking writeCloud."""
from pathlib import Path

html_path = Path("_site/index.html")
if not html_path.exists():
    print("no _site/index.html")
else:
    text = html_path.read_text()
    if "mode:\"no-cors\"" in text or "mode:'no-cors'" in text:
        print("slim skip: v2 writeCloud already present")
    else:
        print("slim skip: leaving cloud to patch_cloud_v2")
