#!/usr/bin/env python3
"""Read the green LS tag whose Confirm.svg tooltip is exactly «Такси».
BallRed.svg and unrelated green highlights are not taxi. READ-ONLY in LS.
Requires an existing saved LS Chrome session on port 9238. LOGIN=1 permits
filling login via LS_LOGIN/LOGICSTARS_PASSWORD (secret never printed).
Writes only taxi-vins.json and taxi-extraction-report.json and only after ALL
configured tabs complete. The regular stock merge applies these VINs taxi:true
only to cars already in stock; never adds/deletes/restores a sold vehicle.
"""
from pathlib import Path
import os,re,json,sys
from playwright.sync_api import sync_playwright

VIN_RE=re.compile(r'E[A-Z0-9]{16}')
CABINETS=[
 ('TENET',['Непроданные','Отложенные','Неоплаченные','Корпоративные','Факторинг'],'https://tenet.oldcabinet.prod.logicstars.ru'),
 ('CHERY',['Непроданные','Неоплаченные','Факторинг'],'https://tenet.oldcabinet.prod.logicstars.ru'),
 ('TENET+',['Непроданные','Неоплаченные','Факторинг'],'https://tenetplus.oldcabinet.prod.logicstars.ru'),
]

def label_vins(html,vin,tooltips):
    return bool(vin and 'images/Tags/Confirm.svg' in html and any('Confirm.svg' in src and name.strip().lower()=='такси' for src,name in tooltips.items()))

def wait_grid(pg,timeout=240):
    """Require either desired count or an explicitly empty row."""
    stable=0
    for _ in range(timeout):
        match=re.search(r'Строк:\s*(\d+)',pg.inner_text('body'))
        total=int(match.group(1)) if match else None
        rows=pg.locator('tr.dxbs-data-row').count()
        empty=pg.locator('tr.dxbs-empty-data-row').count()
        ready=(total is not None and rows==total) or (total==0 and rows==0 and empty==1)
        if ready:
            stable+=1
            if stable>=3:return total
        else:stable=0
        pg.wait_for_timeout(1000)
    raise RuntimeError('LS: полная таблица не загружена, данные не сохранены')

def open_cars(pg,base):
    pg.goto(base+'/sales/cars',timeout=120000)
    if 'login' not in pg.url.lower():return
    if os.environ.get('LOGIN')!='1':raise RuntimeError('LOGIN_REQUIRED: выполните login.py для '+base)
    pg.fill('input[type=text],input[name*=ogin i]',os.getenv('LOGIN_USER','LEONTEV24722'))
    pg.fill('input[type=password]',os.environ['LOGICSTARS_PASSWORD'])
    pg.click('text=ВХОД >> nth=0');pg.wait_for_timeout(10000)
    pg.goto(base+'/sales/cars',timeout=120000)
    if 'login' in pg.url.lower():raise RuntimeError('LOGIN_FAILED '+base)

def switch_brand(pg,base,brand):
    pg.goto(base+'/sales/cars',timeout=120000)
    for _ in range(180):
        if pg.locator('a.dropdown-item').filter(has_text=brand).count():break
        pg.wait_for_timeout(1000)
    else:raise RuntimeError('LS: отсутствует selector '+brand)
    is_tenet=bool(pg.locator('button').filter(has_text='Корпоративные').count())
    if (brand=='TENET')!=is_tenet:
        pg.locator('a.dropdown-item').filter(has_text=brand).last.evaluate('el=>el.click()')
        pg.wait_for_timeout(6000)
        pg.goto(base+'/sales/cars',timeout=120000)
    # Confirm the brand from its known tab shape; on the same shape wait.
    for _ in range(120):
        corp=bool(pg.locator('button').filter(has_text='Корпоративные').count())
        deferred=bool(pg.locator('button').filter(has_text='Отложенные').count())
        if corp==deferred and (brand=='TENET')==corp:
            if not deferred:wait_grid(pg)
            return
        pg.wait_for_timeout(1000)
    raise RuntimeError('LS: не удалось подтвердить выбор кабинета '+brand)

def select_tab(pg,tab):
    button=pg.locator('button').filter(has_text=tab).first
    for _ in range(180):
        if button.count():break
        pg.wait_for_timeout(1000)
    else:raise RuntimeError('LS: обязательная вкладка не найдена: '+tab)
    for _ in range(120):
        if button.is_enabled():break
        pg.wait_for_timeout(1000)
    # TENET carries (N) on selected tab, CHERY and TENET+ do not always.
    # Do not require the previously selected tab's (N) -- it belongs elsewhere.
    needs_counter=bool(pg.locator('button').filter(has_text='Отложенные').count())
    if button.is_enabled():button.click()
    for _ in range(240):
        current=pg.locator('button').filter(has_text=tab).first
        match=re.search(r'\((\d+)\)',current.inner_text()) if current.count() else None
        expected=int(match.group(1)) if match else None
        if expected is not None or not needs_counter:
            count=wait_grid(pg)
            if expected is None or count==expected:return count
        pg.wait_for_timeout(1000)
    raise TimeoutError('LS: вкладка '+tab+' не выдала подтверждённый полный набор; сохранение отменено')

def read_taxi(pg,brand,tab):
    total=select_tab(pg,tab)
    print(brand+'/'+tab+': полных строк '+str(total),flush=True)
    found={};rows=pg.locator('tr.dxbs-data-row')
    for index in range(total):
        row=rows.nth(index);vin=VIN_RE.findall(row.inner_text())
        if not vin:raise RuntimeError(f'{brand}/{tab}: строка {index} без VIN; сохранение запрещено')
        icons=row.locator('img[src*="/Tags/Confirm.svg"]')
        for k in range(icons.count()):
            icons.nth(k).hover();pg.wait_for_timeout(600)
            # Tippy is hidden after a later hover within the same row; this probe is the one row with a current tooltip.
            tips=pg.locator('.tippy-content').all_inner_texts()
            if not tips:
                icons.nth(k).hover(force=True);pg.wait_for_timeout(1500)
                tips=pg.locator('.tippy-content').all_inner_texts()
            if not tips:raise RuntimeError(f'{brand}/{tab}: tooltip Confirm у {vin[0]} не прочитан')
            if any(t.strip().lower()=='такси' for t in tips):
                found[vin[0]]={'brand':brand,'tab':tab,'taxi':True,'icons':[{'src':icons.nth(k).get_attribute('src'),'tooltip':'Такси'}]}
        pg.mouse.move(0,0)
    return found

def main():
    if '-h' in sys.argv or '--help' in sys.argv:print(__doc__);return
    taxis={};report=[]
    with sync_playwright() as driver:
        browser=driver.chromium.connect_over_cdp('http://127.0.0.1:9238');ctx=browser.contexts[0]
        for brand,tabs,base in CABINETS:
            pg=ctx.new_page();pg.set_default_timeout(90000);pg.set_viewport_size({'width':1920,'height':1080})
            open_cars(pg,base)
            if brand!='TENET+':switch_brand(pg,base,brand)
            else:wait_grid(pg)
            corp=bool(pg.locator('button').filter(has_text='Корпоративные').count())
            deferred=bool(pg.locator('button').filter(has_text='Отложенные').count())
            if brand=='TENET':assert corp and deferred,'Cabinet identity TENET not confirmed'
            if brand=='CHERY':assert not corp and not deferred,'Cabinet identity CHERY not confirmed'
            for tab in tabs:
                found=read_taxi(pg,brand,tab)
                taxis.update(found)
                report.append({'brand':brand,'tab':tab,'taxi':len(found),'complete':True})
                print(' → такси: '+str(len(found)),flush=True)
            pg.close()
    path=Path('taxi-vins.json')
    Path('taxi-vins.json.tmp').write_text(json.dumps(sorted(taxis),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    Path('taxi-extraction-report.json.tmp').write_text(json.dumps({'complete':True,'count':len(taxis),'tabs':report},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    Path('taxi-vins.json.tmp').replace(path);Path('taxi-extraction-report.json.tmp').replace('taxi-extraction-report.json')
    print('TAXI_EXTRACT_OK',len(taxis),'все вкладки полностью загружены; сохранено')

if __name__=='__main__':main()
