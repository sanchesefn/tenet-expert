from pathlib import Path
html_path = Path("_site/index.html")
css_path = Path("terms-ui.css")
if html_path.exists() and css_path.exists():
    html = html_path.read_text()
    css = css_path.read_text()
    if ".mpt-cal{" not in html or ".prio-list{" not in html or ".stock-car.mpt{" not in html or ".terms-cards{" not in html or ".bank-row{" not in html:
        html = html.replace("</style>", css + "\n</style>", 1)
        html_path.write_text(html)
        print("terms-ui css injected", len(css))
    else:
        tint = """
.terms-top section{border-radius:16px;padding:10px 10px 2px}
.terms-top section:nth-child(1){background:#eef3f8}
.terms-top section:nth-child(2){background:#eef6ee}
.terms-top section:nth-child(3){background:#fbf6ee}
.terms-top section:nth-child(1) h2{color:#1f4e79}
.terms-top section:nth-child(2) h2{color:#1e5c24}
.terms-top section:nth-child(3) h2{color:#8a5a10}
.terms-top section:nth-child(1) .term-card{background:#f7fbff;border-color:#c9d8e8}
.terms-top section:nth-child(2) .term-card{background:#f7fbf7;border-color:#c9e0c8}
.terms-top section:nth-child(3) .term-card{background:#fffaf3;border-color:#ead4b0}
"""
        if ".terms-top section:nth-child(1){" not in html:
            html = html.replace("</style>", tint + "\n</style>", 1)
            print("terms column tint")
        html_path.write_text(html)
        print("terms-ui css already present")
else:
    print("skip terms-ui css")
