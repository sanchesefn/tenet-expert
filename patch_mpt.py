from pathlib import Path
p = Path("_site/index.html")
if not p.exists():
    print("skip mpt patch")
else:
    html = p.read_text()
    if "let mptDay" not in html:
        html = html.replace('let kmVin = "";', 'let kmVin = "";\n    let mptMonth = 3;\n    let mptDay = "";')
    if 'querySelectorAll("[data-mpt-day]")' not in html:
        html = html.replace(
            'document.querySelectorAll("[data-km-id]")',
            'document.querySelectorAll("[data-mpt-day]").forEach(b=>b.onclick=()=>{ mptDay=b.dataset.mptDay||""; view="terms"; render(); });\n      document.querySelectorAll("[data-mpt-month]").forEach(b=>b.onclick=()=>{ mptMonth=Number(b.dataset.mptMonth)||3; view="terms"; render(); });\n      document.querySelectorAll("[data-km-id]")',
            1
        )
    html = html.replace(
        '`<div class="terms-cards">`+TERMS_MPT.map(g=>`<article class="term-card"><b>${escape(g.line)}</b>`+g.rows.map(r=>`<small>${escape(r[0])} · <b>${escape(r[1])}</b></small>`).join("")+`</article>`).join("")+`</div>`+',
        '`<p class="lead">По дате производства T7. Зелёный — МПТ, песочный — субсидия бренда. Нажмите день.</p>`+mptCal()+'
    )
    p.write_text(html)
    print("mpt patched")
