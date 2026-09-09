from pathlib import Path
html_path = Path("_site/index.html")
css_path = Path("terms-ui.css")
if html_path.exists() and css_path.exists():
    html = html_path.read_text()
    css = css_path.read_text()
    if ".stock-car.mpt{" not in html or ".terms-cards{" not in html or ".bank-row{" not in html:
        html = html.replace("</style>", css + "\n</style>", 1)
        html_path.write_text(html)
        print("terms-ui css injected", len(css))
    else:
        print("terms-ui css already present")
else:
    print("skip terms-ui css")
