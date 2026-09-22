#!/usr/bin/env python3
"""Align КП Сервис / КП Лизинг with КП Новый а/м: two cards, equip sheet, PDF."""
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
SVC_LEASE = (HERE / "offer-svc-lease.js").read_text(encoding="utf-8")
if not SVC_LEASE.endswith("\n"):
    SVC_LEASE += "\n"

PDF_FN = """    function offerPdf(){
      const src=document.getElementById("ofPrint");
      if(!src){ window.print(); return; }
      const w=window.open("","offerpdf","width=900,height=1200");
      if(!w){ window.print(); return; }
      w.document.write('<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>КП TENET</title><style>@page{size:A4;margin:14mm}body{margin:0;font:13px/1.45 Inter,system-ui,sans-serif;color:#111}h1{font-size:22px;margin:0 0 6px}h2{font-size:15px;margin:18px 0 8px;text-transform:uppercase}table{width:100%;border-collapse:collapse;margin:0 0 12px}td,th{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left}ul{margin:0 0 10px;padding:0 0 0 18px}pre{white-space:pre-wrap;font:12px/1.4 ui-monospace,Menlo,monospace}.offer-print-brand{letter-spacing:.16em;text-transform:uppercase;font-size:11px;color:#c81e2b;font-weight:700}.offer-print-note{color:#666;font-size:12px;margin-top:18px}</style></head><body>'+src.innerHTML+'</body></html>');
      w.document.close();
      setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} }, 250);
    }
"""

SANCHE_PDF_OLD = '''      const id=offerTab==="service"?"ofTextSvc":"ofTextLease";
      const el=document.getElementById(id);
      const t=el?(el.innerText||el.textContent||""):"";
      offerPdfOpen("<!doctype html><html lang=ru><head><meta charset=utf-8><title>КП</title><style>body{font-family:Inter,system-ui,sans-serif;padding:28px;white-space:pre-wrap;font-size:14px;line-height:1.45}@media print{body{padding:12px}}</style></head><body>"+escape(t)+"</body></html>");'''

SANCHE_PDF_NEW = '''      const src=document.getElementById("ofPrint");
      if(src && src.innerHTML){
        offerPdfOpen('<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>КП TENET</title><style>@page{size:A4;margin:14mm}body{margin:0;font:13px/1.45 Inter,system-ui,sans-serif;color:#111}h1{font-size:22px;margin:0 0 6px}h2{font-size:15px;margin:18px 0 8px;text-transform:uppercase}table{width:100%;border-collapse:collapse;margin:0 0 12px}td,th{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left}ul{margin:0 0 10px;padding:0 0 0 18px}.offer-print-brand{letter-spacing:.16em;text-transform:uppercase;font-size:11px;color:#c81e2b;font-weight:700}.offer-print-note{color:#666;font-size:12px;margin-top:18px}</style></head><body>'+src.innerHTML+'</body></html>');
        return;
      }
      const id=offerTab==="service"?"ofTextSvc":"ofTextLease";
      const el=document.getElementById(id);
      const t=el?(el.innerText||el.textContent||""):"";
      offerPdfOpen("<!doctype html><html lang=ru><head><meta charset=utf-8><title>КП</title><style>body{font-family:Inter,system-ui,sans-serif;padding:28px;white-space:pre-wrap;font-size:14px;line-height:1.45}@media print{body{padding:12px}}</style></head><body>"+escape(t)+"</body></html>");'''

CSS = """
.offer-print-price{display:flex;justify-content:space-between;align-items:baseline;background:#f4f1ea;border-radius:12px;padding:14px 16px;margin:12px 0 18px}
.offer-print-price b{font-size:22px}
"""

BIND_OLD = '["ofClient","ofModel","ofColor","ofPrice","ofSpec","ofDo","ofPack","ofCasco","ofDown","ofDownPct","ofMonths","ofValid","ofTi","ofLoan","ofCr","ofDcTi","ofDcCr","ofDcTiAmt","ofDcCrAmt","osClient","osCar","osVin","osPack","osPrice","osNote","olCo","olInn","olModel","olPrice","olAdv","olMonths"]'
BIND_NEW = '["ofClient","ofModel","ofColor","ofPrice","ofSpec","ofDo","ofPack","ofCasco","ofDown","ofDownPct","ofMonths","ofValid","ofTi","ofLoan","ofCr","ofDcTi","ofDcCr","ofDcTiAmt","ofDcCrAmt","osClient","osModel","osCar","osVin","osPack","osPrice","osNote","osValid","olCo","olInn","olModel","olPrice","olAdv","olMonths","olValid"]'
BIND_CHIP_OLD = '["ofClient","ofColor","ofPrice","ofValid","osClient","osCar","osPack","osPrice","olCo","olModel","olAdv","olMonths"]'
BIND_CHIP_NEW = '["ofClient","ofColor","ofPrice","ofValid","osClient","osModel","osCar","osVin","osPack","osPrice","osNote","osValid","olCo","olInn","olModel","olPrice","olAdv","olMonths","olValid"]'
BIND_SIMPLE_OLD = '["ofClient","ofModel","ofColor","ofPrice","ofDisc","ofDown","ofMonths","ofValid","osClient","osCar","osVin","osPack","osPrice","osNote","olCo","olInn","olModel","olPrice","olAdv","olMonths"]'
BIND_SIMPLE_NEW = '["ofClient","ofModel","ofColor","ofPrice","ofDisc","ofDown","ofMonths","ofValid","osClient","osModel","osCar","osVin","osPack","osPrice","osNote","osValid","olCo","olInn","olModel","olPrice","olAdv","olMonths","olValid"]'


def sub_literal(pat, repl, text, count=1):
    return re.subn(pat, lambda _m: repl, text, count=count)


def patch_text(text, path):
    n = 0
    if "function offerSvcPacks(" in text:
        text2, k = sub_literal(
            r"    function offerSvcPacks\(\)\{[\s\S]*?(?=\n    function (?:offerPdf|offer)\(\)\{)",
            SVC_LEASE,
            text,
        )
        if k:
            text = text2
            n += 1
            print(path, "replaced existing svc/lease block")
        else:
            print(path, "WARN existing svc/lease block not replaced")
    if "function offerSvcPacks(" not in text:
        text2, k = sub_literal(
            r"    function offerService\(\)\{[\s\S]*?(?=\n    function (?:offerPdf|offer)\(\)\{)",
            SVC_LEASE,
            text,
        )
        if k:
            text = text2
            n += 1
            print(path, "replaced offerService/offerLease")
        else:
            print(path, "WARN service/lease block not found")
    if "function offerPdf(" not in text:
        text2, k = sub_literal(
            r"    function offer\(\)\{",
            PDF_FN + "    function offer(){",
            text,
        )
        if k:
            text = text2
            n += 1
            print(path, "injected offerPdf")
    if SANCHE_PDF_OLD in text and "src && src.innerHTML" not in text:
        text = text.replace(SANCHE_PDF_OLD, SANCHE_PDF_NEW, 1)
        n += 1
        print(path, "sanche pdf uses ofPrint")
    if 'querySelectorAll("[data-offer-pdf]")' not in text and 'querySelectorAll("[data-offer-copy]")' in text:
        text = text.replace(
            'document.querySelectorAll("[data-offer-copy]").forEach',
            'document.querySelectorAll("[data-offer-pdf]").forEach(b=>b.onclick=()=>offerPdf());\n      document.querySelectorAll("[data-offer-copy]").forEach',
            1,
        )
        n += 1
        print(path, "bind pdf click")
    if BIND_OLD in text:
        text = text.replace(BIND_OLD, BIND_NEW, 1)
        n += 1
        print(path, "bind ids")
    elif BIND_SIMPLE_OLD in text:
        text = text.replace(BIND_SIMPLE_OLD, BIND_SIMPLE_NEW, 1)
        n += 1
        print(path, "simple bind ids")
    elif BIND_CHIP_OLD in text:
        text = text.replace(BIND_CHIP_OLD, BIND_CHIP_NEW, 1)
        n += 1
        print(path, "chip bind ids")
    elif "osValid" not in text and "osClient" in text:
        text = text.replace('"osClient","osCar"', '"osClient","osModel","osCar"', 1)
        text = text.replace('"osNote","olCo"', '"osNote","osValid","olCo"', 1)
        text = text.replace('"olMonths"]', '"olMonths","olValid"]', 1)
        n += 1
        print(path, "bind ids fallback")
    if str(path).endswith(".html") and ".offer-print-price{" not in text and "</style>" in text:
        text = text.replace("</style>", CSS + "\n</style>", 1)
        n += 1
        print(path, "print price css")
    return text, n


def main():
    files = []
    for name in ("offer-fn.js", "index.html", "_site/index.html"):
        p = Path(name)
        if p.exists() and p.stat().st_size > 500:
            files.append(p)
    if not files:
        print("no targets")
        return
    for p in files:
        text = p.read_text(encoding="utf-8")
        text2, n = patch_text(text, p)
        if n:
            p.write_text(text2, encoding="utf-8")
            print("wrote", p, p.stat().st_size)
        else:
            print("unchanged", p)


if __name__ == "__main__":
    main()
