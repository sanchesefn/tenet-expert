#!/usr/bin/env python3
"""Read the green LS «Такси» tag; keep its VINs in live stock parts.
LS tag text is a tooltip, not CSV: /images/Tags/Confirm.svg => hover == «Такси».
Read-only except for the JSON files --out1/--out2. TENET, CHERY and TENET+:
Непроданные, Отложенные, Неоплаченные; Корпоративные if present.
Confirm.svg additionally inspected for red BallRed; multiple tags stay independent.
Do not run without a saved authenticated browser on 9238. Set LOGIN=1 to log into
missing sessions using LOGIN_USER and LOGICSTARS_PASSWORD (never printed).
"""
import os,re,json,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright

COLLECTOR_MODELS=('Непроданные','Отложенные','Неоплаченные','Корпоративные','Факторинг')
CABINETS=[
 ('TENET',['Непроданные','Отложенные','Неоплаченные','Корпоративные','Факторинг'],'https://tenet.oldcabinet.prod.logicstars.ru'),
 ('CHERY',['Непроданные','Отложенные','Неоплаченные','Факторинг'],'https://tenet.oldcabinet.prod.logicstars.ru'),
 ('TENET+',['Непроданные','Отложенные','Неоплаченные','Факторинг'],'https://tenetplus.oldcabinet.prod.logicstars.ru'),
]
VINRE=re.compile(r'E[A-Z0-9]{16}')

def label_vins(row_html,vin,tooltips):
    """True iff a tag cell contains a confirmed green Taxi tooltip, never red alone."""
    return any('Confirm.svg' in src and name.strip()=='Такси' for src,name in tooltips.items()) and '/images/Tags/Confirm.svg' in row_html

def wait_data(pg,timeout=210):
    for _ in range(timeout):
        text=pg.inner_text('body')
        if (pg.locator('tr.dxbs-data-row').count() or 'Нет данных для отображения' in text) and 'Loading...' not in text and 'Пожалуйста, подождите...' not in text and not pg.locator('div.busyindicator.show').count():return
        pg.wait_for_timeout(1000)
    raise TimeoutError('stock data not settled')

def select_brand(pg,brand):
    for _ in range(180):
        if pg.locator('button').filter(has_text='Непроданные').count():break
        pg.wait_for_timeout(1000)
    corporate=bool(pg.locator('button').filter(has_text='Корпоративные').count())
    if (brand=='TENET') != corporate:
        pg.get_by_text(brand,exact=True).first.evaluate('e=>e.click()');wait_data(pg)

def click_tab(pg,tab):
    q=pg.locator('button').filter(has_text=tab).first
    for _ in range(180):
        if q.count():break
        pg.wait_for_timeout(1000)
    else:return False
    for _ in range(120):
        if q.is_enabled():break
        pg.wait_for_timeout(1000)
    # Already selected tabs are disabled in some layouts; current grid is already usable.
    if not q.is_enabled():
        wait_data(pg)
        return bool(pg.locator('tr.dxbs-data-row').count())
    q.click();wait_data(pg);return True

def read_vins(pg,port,label):
    out={}
    for i in range(pg.locator('tr.dxbs-data-row').count()):
        row=pg.locator('tr.dxbs-data-row').nth(i)
        text=row.inner_text();hits=VINRE.findall(text)
        if not hits:continue
        vin=hits[0]
        if not row.locator('img[src$="/Tags/Confirm.svg"]').count():continue
        img=row.locator('img[src$="/Tags/Confirm.svg"]').first
        try:
            img.hover();pg.wait_for_timeout(450)
            tooltips=pg.locator('.tippy-content').all_inner_texts()
        except Exception as e:raise RuntimeError(f'Taxi tooltip needed for {label}: {str(e)[:250]}')
        if any(t.strip()=='Такси' for t in tooltips):out[vin]={'brand':port,'tab':label,'taxi':True,'ls_tag':'Confirm.svg / Такси'}
    pg.mouse.move(0,0)
    return out

def annotate(path,taxi):
    p=Path(path);d=json.loads(p.read_text())
    for c in d['cars']:
        if c['vin'] in taxi:c['taxi']=True
    assert 'EDEDB21B7SD723791' not in {c['vin'] for c in d['cars']}
    p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
    return sum(c.get('taxi') is True for c in d['cars'])

def main():
    args={a.split('=',1)[0]:a.split('=',1)[1] for a in sys.argv[1:] if '=' in a}
    out1=args.get('--out1','taxi-stock-part1.json');out2=args.get('--out2','taxi-stock-part2.json')
    taxi={};report=[]
    with sync_playwright() as p:
        browser=p.chromium.connect_over_cdp('http://127.0.0.1:9238');ctx=browser.contexts[0]
        for brand,tabs,base in CABINETS:
            pg=ctx.new_page();pg.set_default_timeout(90000);pg.set_viewport_size({'width':1920,'height':1080})
            pg.goto(base+'/sales/cars',timeout=120000)
            if 'login' in pg.url.lower():
                if os.environ.get('LOGIN')!='1':raise RuntimeError('LOGIN_REQUIRED '+brand)
                pg.fill('input[type=text], input[name*=ogin i]',os.getenv('LOGIN_USER','LEONTEV24722'))
                pw=os.environ['LOGICSTARS_PASSWORD'];pg.fill('input[type=password]',pw)
                pg.click('text=ВХОД >> nth=0');pg.wait_for_timeout(7000);del pw
                pg.goto(base+'/sales/cars',timeout=120000)
            if brand=='CHERY':select_brand(pg,'CHERY')
            for tab in tabs:
                if not click_tab(pg,tab):report.append({'brand':brand,'tab':tab,'missing':True});continue
                vins=read_vins(pg,brand,tab)
                taxi.update(vins)
                print(f'{brand} / {tab}: {len(vins)} taxi' if vins else f'{brand} / {tab}: 0')
                report.append({'brand':brand,'tab':tab,'count':len(vins),'vins':list(vins)})
                # Restore a fresh page between tabs, avoids stale busy Blazor indicators.
                if tab!=tabs[-1]:pg.goto(base+'/sales/cars',timeout=120000);select_brand(pg,brand)
            pg.close()
    Path('taxi-vins.json').write_text(json.dumps(sorted(taxi),ensure_ascii=False,indent=2)+'\n')
    Path('taxi-extraction-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    counts=[annotate(out1,taxi),annotate(out2,taxi)]
    print('TOTAL_TAXI',len(taxi),'IN_PARTS',sum(counts),'JSON',out1,out2)

if __name__=='__main__':main()
