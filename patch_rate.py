#!/usr/bin/env python3
"""Make rating show every exam in a list and wrap model columns."""
from pathlib import Path

CSS_OLD = ".rate-board{display:flex;gap:10px;overflow-x:auto;margin-top:16px;padding-bottom:8px;-webkit-overflow-scrolling:touch;}"
CSS_NEW = (
    ".rate-board{display:grid;grid-template-columns:repeat(auto-fit,minmax(196px,1fr));gap:10px;margin-top:16px;padding-bottom:8px;}"
    ".rate-feed{margin:12px 0;display:grid;gap:6px;}"
    ".rate-feed .row{display:flex;justify-content:space-between;gap:8px;padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--surface);font-size:14px;}"
)

LEAD = '<p class="lead">Все модели в одном блоке. Основной список — состав салона. Гости в той же колонке, под чертой. «Стало» появляется только после пересдачи (если №1 была ниже 90%).</p>'

FEED = LEAD + """
        <h2 style=\"margin:18px 0 8px;font-size:16px\">Все сдачи</h2>
        <div class=\"rate-feed\">${(function(){
          const names={\"t4l\":\"T4L\",\"t7\":\"T7\",\"t8\":\"T8\",\"t9\":\"Tiggo 9\",\"a8\":\"Arrizo 8\"};
          const rows=all.filter(r=>r && !r.type && r.status!==\"running\" && r.percent!=null && r.model);
          const map={};
          rows.forEach(r=>{
            const k=norm(r.surname)+\"|\"+r.model+\"|\"+String(Number(r.exam||1));
            if(!map[k] || Number(r.percent||0)>Number(map[k].percent||0)) map[k]=r;
          });
          return Object.values(map).sort((a,b)=>String(b.at||\"\").localeCompare(String(a.at||\"\"))).map(r=>`<div class=\"row\"><span><b>${escape(r.display||r.surname)}</b> · ${names[r.model]||r.model}${Number(r.exam||1)===2?\" · пересдача\":\"\"}</span><b>${r.percent}%</b></div>`).join(\"\") || `<p class=\"empty\">Пока нет сдач</p>`;
        })()}</div>
"""
