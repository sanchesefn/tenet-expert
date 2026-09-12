#!/usr/bin/env python3
from pathlib import Path
import shutil

ROOT = Path(".")
SITE = Path("_site")

OLD_PLACE = '''      const payTop=y;
      eptsWrap(ctx, body2, maxW).forEach(ln=>{ ctx.fillText(ln, L, y); y+=36; });
      if(eptsStamp){
        const sw=360, sh=sw*(eptsStamp.height/eptsStamp.width);
        ctx.save();
        ctx.globalAlpha=0.93;
        ctx.drawImage(eptsStamp, L+70, payTop+8, sw, sh);
        ctx.restore();
        y=Math.max(y, payTop+8+sh-40);
      }
      if(eptsSign){
        const nw=200, nh=nw*(eptsSign.height/eptsSign.width);
        ctx.save();
        ctx.translate(L+175, payTop+118);
        ctx.rotate(-8*Math.PI/180);
        ctx.drawImage(eptsSign, 0, 0, nw, nh);
        ctx.restore();
      }
      y+=28;
      ctx.fillText("Леонтьев А. А. __________", L, y); y+=64;
      y+=28;'''

NEW_PLACE = '''      eptsWrap(ctx, body2, maxW).forEach(ln=>{ ctx.fillText(ln, L, y); y+=36; });
      y+=70;
      const signY=y;
      ctx.fillText("Леонтьев А. А. __________", L, signY);
      if(eptsStamp){
        const sw=250, sh=sw*(eptsStamp.height/eptsStamp.width);
        ctx.save();
        ctx.globalAlpha=0.95;
        ctx.drawImage(eptsStamp, L+290, signY-78, sw, sh);
        ctx.restore();
        y=Math.max(signY+56, signY-78+sh+8);
      } else {
        y=signY+64;
      }
      if(eptsSign){
        const nw=176, nh=nw*(eptsSign.height/eptsSign.width);
        ctx.save();
        ctx.translate(L+248, signY-18);
        ctx.rotate(-7*Math.PI/180);
        ctx.drawImage(eptsSign, 0, 0, nw, nh);
        ctx.restore();
      }
      y+=28;'''

def copy_if(rel):
    src = ROOT / rel
    if not src.exists():
        return
    dest = SITE / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    print("epts asset", dest, dest.stat().st_size)

def patch_html(html: str) -> str:
    css = (ROOT / "epts.css").read_text() if (ROOT / "epts.css").exists() else ""
    js = (ROOT / "epts-fn.js").read_text() if (ROOT / "epts-fn.js").exists() else ""
    if css and '.hub-card[data-go="epts"]::before' not in html:
        needle = '.hub-card[data-go="docs"]::before{background-image:url("hub/docs.jpg?v=1");background-position:50% 50%;}'
        if needle in html:
            html = html.replace(needle, needle + "\n" + css, 1)
            print("epts css")
        elif "</style>" in html:
            html = html.replace("</style>", css + "\n</style>", 1)
            print("epts css via style")
    old_font = '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");'
    new_font = '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Tinos:wght@400;700&display=swap");'
    if old_font in html:
        html = html.replace(old_font, new_font, 1)
        print("tinos")
    if '["epts","Э"' not in html:
        alt = '["docs","D","Документы","Прайсы, PDF и материалы моделей"]'
        if alt in html:
            html = html.replace(alt, alt + ',\n        ["epts","Э","Заказ ЭПТС","Гарантийное письмо: VIN, PDF и отправка"]', 1)
            print("hub card")
    old_map = "const map={login,hub,home,study,quiz:brief,play,rate,hist:rate,terms,calc,stock,docs};"
    new_map = "const map={login,hub,home,study,quiz:brief,play,rate,hist:rate,terms,calc,stock,docs,epts};"
    if old_map in html:
        html = html.replace(old_map, new_map, 1)
        print("render map")
    elif "docs,epts}" not in html and "stock,docs}" in html:
        html = html.replace("stock,docs}", "stock,docs,epts}", 1)
        print("render map loose")
    if 'epts:"ЭПТС"' not in html:
        old_nav = '      else items=[["hub","Кабинет"],["home","Аттестация"]];'
        new_nav = """      else {
        items=[["hub","Кабинет"],["home","Аттестация"]];
        const extra={terms:"Условия",calc:"Калькулятор",stock:"Склад",docs:"Документы",epts:"ЭПТС"};
        if(extra[active]) items.push([active, extra[active]]);
      }"""
        if old_nav in html:
            html = html.replace(old_nav, new_nav, 1)
            print("nav")
    if "function epts()" not in html and js:
        marker = "    function login(){"
        if marker in html:
            html = html.replace(marker, js + "    function login(){", 1)
            print("epts fn")
        elif "    function docs(){" in html:
            html = html.replace("    function docs(){", js + "    function docs(){", 1)
            print("epts fn before docs")
    if "typeof eptsBind" not in html:
        key = 'if(uhi) uhi.onclick=()=>tryUnlock((document.getElementById("pin")||{}).value);'
        if key in html:
            html = html.replace(key, key + '\n      if(typeof eptsBind==="function") eptsBind();', 1)
            print("bind")
    if OLD_PLACE in html:
        html = html.replace(OLD_PLACE, NEW_PLACE, 1)
        print("epts stamp place")
    return html

def main():
    SITE.mkdir(parents=True, exist_ok=True)
    copy_if("hub/epts.jpg")
    copy_if("epts/stamp.jpg")
    copy_if("epts/sign.jpg")
    copy_if("epts/stamp.png")
    copy_if("epts/sign.png")
    html_path = SITE / "index.html"
    if not html_path.exists():
        print("no _site/index.html")
        return
    html = html_path.read_text()
    new = patch_html(html)
    if new != html:
        html_path.write_text(new)
        print("patched", html_path.stat().st_size)
    else:
        print("html unchanged has_epts", "function epts()" in html)

if __name__ == "__main__":
    main()
