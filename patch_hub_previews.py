#!/usr/bin/env python3
from pathlib import Path
import re

SITE = Path("_site/index.html")
RULES = {
    "epts": '.hub-card[data-go="epts"]::before{background-image:url("hub/epts.jpg?v=5");background-position:50% 48%;background-size:cover;}',
    "gibdd": '.hub-card[data-go="gibdd"]::before{background-image:url("hub/gibdd.jpg?v=5");background-position:50% 50%;background-size:cover;}',
    "duty": '.hub-card[data-go="duty"]::before{background-image:url("hub/duty.jpg?v=5");background-position:50% 48%;background-size:cover;}',
}

def main():
    if not SITE.exists():
        print("no site html")
        return
    html = SITE.read_text(encoding="utf-8")
    for key, rule in RULES.items():
        html, n = re.subn(
            rf'\.hub-card\[data-go="{key}"\]::before\{{[^}}]*\}}',
            rule,
            html,
        )
        print("hub preview css", key, n)
    if 'data-go="gibdd"]::before' not in html:
        html = html.replace("</style>", "\n".join(RULES.values()) + "\n</style>", 1)
        print("hub preview css injected")
    SITE.write_text(html, encoding="utf-8")

if __name__ == "__main__":
    main()
