#!/usr/bin/env python3
from pathlib import Path
import shutil

ROOT = Path(".")
SITE = Path("_site")

def copy_if(rel):
    src = ROOT / rel
    if not src.exists():
        return
    dest = SITE / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    print("epts asset", dest, dest.stat().st_size)

INK_HELPER = r'''    const eptsInkCache=typeof WeakMap==="function"?new WeakMap():null;
    function eptsInkBox(img){
      if(!img) return null;
      if(eptsInkCache && eptsInkCache.has(img)) return eptsInkCache.get(img);
      const c=document.createElement("canvas");
      c.width=img.width; c.height=img.height;
      const g=c.getContext("2d");
      g.drawImage(img,0,0);
      const data=g.getImageData(0,0,c.width,c.height).data;
      let minX=c.width,minY=c.height,maxX=0,maxY=0,found=0;
      for(let yy=0;yy<c.height;yy++){
        for(let xx=0;xx<c.width;xx++){
          const i=(yy*c.width+xx)*4;
          if(data[i+3]<18) continue;
          if(data[i]>246 && data[i+1]>246 && data[i+2]>246) continue;
          found++;
          if(xx<minX) minX=xx; if(xx>maxX) maxX=xx;
          if(yy<minY) minY=yy; if(yy>maxY) maxY=yy;
        }
      }
      const box=found?{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1}:{x:0,y:0,w:img.width,h:img.height};
      if(eptsInkCache) eptsInkCache.set(img, box);
      return box;
    }
    function eptsDrawLetter(canvas, draft){'''

OLD_DRAW = '''      eptsWrap(ctx, body2, maxW).forEach(ln=>{ ctx.fillText(ln, L, y); y+=36; });
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
      y+=28;
      ctx.font="700 20px Tinos, 'Times New Roman', Times, serif";
      ctx.fillText("Исполнитель: руководитель отдела продаж Леонтьев А. А.", L, y); y+=28;
      ctx.fillText("Тел.: +7 927 724 92 77", L, y);'''

NEW_DRAW = '''      eptsWrap(ctx, body2, maxW).forEach(ln=>{ ctx.fillText(ln, L, y); y+=36; });
      y+=96;
      const signY=y;
      ctx.fillText("Леонтьев А. А. __________", L, signY);
      const nameW=ctx.measureText("Леонтьев А. А. ").width;
      const stampBox=eptsInkBox(eptsStamp);
      const signBox=eptsInkBox(eptsSign);
      const stampSize=196;
      const stampCX=L+nameW+78;
      const stampCY=signY+14;
      if(eptsStamp && stampBox){
        ctx.save();
        ctx.globalAlpha=0.93;
        ctx.drawImage(eptsStamp, stampBox.x, stampBox.y, stampBox.w, stampBox.h,
          Math.round(stampCX-stampSize/2), Math.round(stampCY-stampSize/2), stampSize, stampSize);
        ctx.restore();
      }
      if(eptsSign && signBox){
        const nw=152, nh=nw*(signBox.h/signBox.w);
        ctx.save();
        ctx.translate(stampCX-8, stampCY-4);
        ctx.rotate(-8*Math.PI/180);
        ctx.drawImage(eptsSign, signBox.x, signBox.y, signBox.w, signBox.h, -nw*0.32, -nh*0.42, nw, nh);
        ctx.restore();
      }
      y=signY+Math.max(120, stampSize/2+64);
      ctx.font="700 20px Tinos, 'Times New Roman', Times, serif";
      ctx.fillText("Исполнитель: руководитель отдела продаж Леонтьев А. А.", L, y); y+=28;
      ctx.fillText("Тел.: +7 927 724 92 77", L, y);'''

PAYTOP_DRAW = '''      const payTop=y;
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
      y+=28;
      ctx.font="700 20px Tinos, 'Times New Roman', Times, serif";
      ctx.fillText("Исполнитель: руководитель отдела продаж Леонтьев А. А.", L, y); y+=28;
      ctx.fillText("Тел.: +7 927 724 92 77", L, y);'''

FOOTER = '''      ctx.font="700 20px Tinos, 'Times New Roman', Times, serif";
      ctx.fillText("Исполнитель: руководитель отдела продаж Леонтьев А. А.", L, y); y+=28;
      ctx.fillText("Тел.: +7 927 724 92 77", L, y);'''

def dedupe_footer(html: str) -> str:
    double = FOOTER + "\n" + FOOTER
    n = 0
    while double in html:
        html = html.replace(double, FOOTER, 1)
        n += 1
    if n:
        print("epts footer deduped", n)
    # leftover footer glued after NEW_DRAW tel line
    glued = FOOTER.rstrip() + "\n" + FOOTER
    while glued in html:
        html = html.replace(glued, FOOTER, 1)
        print("epts footer glued deduped")
    return html

def fix_stamp(html: str) -> str:
    if "function eptsInkBox" not in html and "function eptsDrawLetter" in html:
        html = html.replace("    function eptsDrawLetter(canvas, draft){", INK_HELPER, 1)
        print("epts ink helper")
    if PAYTOP_DRAW in html:
        html = html.replace(PAYTOP_DRAW, NEW_DRAW, 1)
        print("epts stamp from payTop to signer line")
    if OLD_DRAW in html:
        html = html.replace(OLD_DRAW, NEW_DRAW, 1)
        print("epts stamp on signer line")
    elif "stampCX=L+nameW+78" in html:
        print("epts stamp already on signer line")
        html = html.replace(
            "y=signY+Math.max(72, stampSize/2+36);",
            "y=signY+Math.max(120, stampSize/2+64);",
            1,
        )
    else:
        print("epts stamp block not matched")
    html = dedupe_footer(html)
    return html

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
    html = fix_stamp(html)
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
