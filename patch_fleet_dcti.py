#!/usr/bin/env python3
"""Fleet trade-in: deduct FLEET_TI (100 000) only when «Скидка от ДЦ за трейд-ин»
(kmUseDcTi / ofDcTi) is checked, not on the manufacturer trade-in (kmUseTi).
The DC checkbox is shown and effective on its own. Direct column logic for
kmUseTi (table trade-in / возмещение) is unchanged. Corporate-VIN BFS mode
(calcFleet) is not touched. Also trims the blank lines that patch_board.py
adds before BOARD_OCT on every build. Idempotent; every substitution is
re-applied independently on each build (earlier steps may revert pieces);
node --check guard.
"""
import json, os, re, shutil, subprocess, tempfile
from pathlib import Path

DONE = "/*fleet-dcti*/"
SUBS = [
    # calcKm: DC trade-in discount independent of manufacturer trade-in
    ('const useDcTi=useTi && kmVal("kmUseDcTi", false);',
     'const useDcTi=kmVal("kmUseDcTi", false);' + DONE),
    # fleet column + T7 «от 2 333» (uses tiMpt)
    ('const tiMpt=useTi?(typeof FLEET_TI==="number"?FLEET_TI:100000):0;',
     'const tiMpt=useDcTi?(typeof FLEET_TI==="number"?FLEET_TI:100000):0;'),
    ('rrc:mptRrc, trade:!!useTi}', 'rrc:mptRrc, trade:!!useDcTi}'),
    ('Старт 2 333 000${useTi?" − трейд-ин "+rub(tiMpt):""}',
     'Старт 2 333 000${useDcTi?" − трейд-ин "+rub(tiMpt):""}'),
    # TENET / TENET PLUS comparison (fleet part)
    ('const altTi=useTi?(typeof FLEET_TI==="number"?FLEET_TI:100000):0;',
     'const altTi=useDcTi?(typeof FLEET_TI==="number"?FLEET_TI:100000):0;'),
    ('<span>${useTi?"Флит + трейд-ин":"Флит"}${altSub?',
     '<span>${useDcTi?"Флит + трейд-ин":"Флит"}${altSub?'),
    # sidebar recommended cars (kmPrioRecRows)
    ('const tiFleet=useTi?(typeof FLEET_TI==="number"?FLEET_TI:50000):0;',
     'const tiFleet=d.useDcTi?(typeof FLEET_TI==="number"?FLEET_TI:50000):0;'),
    # calcKm UI: DC checkbox always visible
    ('${useTi?`<label class="check-row"><input id="kmUseDcTi"',
     '${true?`<label class="check-row"><input id="kmUseDcTi"'),
    ('${useTi&&useDcTi?`<label class="field" style="max-width:none"><span>Сумма скидки ДЦ за трейд-ин',
     '${useDcTi?`<label class="field" style="max-width:none"><span>Сумма скидки ДЦ за трейд-ин'),
    # КП (offer)
    ('const useDcTi=useTi && (S?!!S.useDcTi:offerOn("ofDcTi"));',
     'const useDcTi=(S?!!S.useDcTi:offerOn("ofDcTi"));'),
    ('useDcTi:useTi && on("kmUseDcTi"),', 'useDcTi:on("kmUseDcTi"),'),
    ('${d.useTi?`<label class="check-row"><input id="ofDcTi"',
     '${true?`<label class="check-row"><input id="ofDcTi"'),
    ('${d.useTi&&d.useDcTi?offerField("Скидка ДЦ за трейд-ин',
     '${d.useDcTi?offerField("Скидка ДЦ за трейд-ин'),
    ('      const ti=typeof FLEET_TI==="number"?FLEET_TI:100000;\n'
     '      const months=Math.max(1, Math.round(Number(d.months)||60));\n'
     '      const down=Math.max(0, Math.round(Number(d.down)||0));\n'
     '      const have=',
     '      const ti=d.useDcTi?(typeof FLEET_TI==="number"?FLEET_TI:100000):0;\n'
     '      const months=Math.max(1, Math.round(Number(d.months)||60));\n'
     '      const down=Math.max(0, Math.round(Number(d.down)||0));\n'
     '      const have='),
    ('"Цена по госпрограмме с учётом субсидии и трейд-ин "+rub(gov)+" ₽",',
     '"Цена по госпрограмме с учётом субсидии"+(ti?" и трейд-ин ":" ")+rub(gov)+" ₽",'),
]
DONE2 = "/*fleet-2389*/"
# Stage 2: special T7 Active 2WD fleet base 2 333 000 -> 2 389 000 (ФЛИТ 08.10),
# and КП fleet payment computed from the same price as «Цена по госпрограмме».
SUBS2 = [
    ('const FLEET_PIN = {"EDXFB32B7TE062327":2333000};',
     'const FLEET_PIN = {"EDXFB32B7TE062327":2389000};' + DONE2),
    ('fleetSubQuote(Math.max(0, 2333000-tiMpt),', 'fleetSubQuote(Math.max(0, 2389000-tiMpt),'),
    ('<p class="eyebrow">Флит · от 2 333</p>', '<p class="eyebrow">Флит · от 2 389</p>'),
    ('Старт 2 333 000${useDcTi?', 'Старт 2 389 000${useDcTi?'),
    ('const q=typeof fleetSubQuote==="function"?fleetSubQuote(base, sub, have, f.do||70000',
     'const q=typeof fleetSubQuote==="function"?fleetSubQuote(Math.max(0, base-ti), sub, have, f.do||70000'),
]
DONE3 = "/*fleet-pin2*/"
# Stage 3: both special T7 Active 2WD cars pinned at 2 389 000; column names both VINs.
SUBS3 = [
    ('const FLEET_PIN = {"EDXFB32B7TE062327":2389000};' + DONE2,
     'const FLEET_PIN = {"EDXFB32B7TE062327":2389000,"EDXFB32B2TE041658":2389000};' + DONE2 + DONE3),
    ('<p class="calc-note">EDXFB32B7TE062327${fleetPin?" · этот VIN":""}. Старт 2 389 000',
     '<p class="calc-note">EDXFB32B2TE041658 · EDXFB32B7TE062327${fleetPin?" · этот VIN":""}. Старт 2 389 000'),
]
BLANKS = re.compile(r"\n(?:[ \t]*\n){2,}(    const BOARD_OCT = )")


def js_ok(html):
    node = shutil.which("node")
    if not node:
        return True
    for k, m in enumerate(re.finditer(r"<script>(.*?)</script>", html, re.S)):
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
            f.write(m.group(1))
        r = subprocess.run([node, "--check", f.name], capture_output=True, text=True)
        os.unlink(f.name)
        if r.returncode:
            print("node --check failed for inline script", k, r.stderr[:500])
            return False
    return True


PIN_RE = re.compile(r'const FLEET_PIN = \{[^}]*\};(?:/\*fleet-[a-z0-9]+\*/)*')
PIN_NEW = ('const FLEET_PIN = {"EDXFB32B7TE062327":2389000,"EDXFB32B2TE041658":2389000};'
           + DONE2 + DONE3)
NOTE_RE = re.compile(r'<p class="calc-note">(?:EDXFB32B2TE041658 · )?EDXFB32B7TE062327\$\{fleetPin')
NOTE_NEW = '<p class="calc-note">EDXFB32B2TE041658 · EDXFB32B7TE062327${fleetPin'


def apply_each(text, subs):
    # Each substitution is applied on its own whenever its old text is present
    # exactly once, so pieces reverted by earlier build steps (patch_km.py
    # re-splices the KM block) are re-patched on every build. Markers are
    # informational only.
    out = text
    for old, new in subs:
        if old in new and new in out:
            continue
        n = out.count(old)
        if n == 1:
            out = out.replace(old, new, 1)
        elif n > 1:
            print("fleet: ambiguous anchor", n, "->", old[:70].replace("\n", " "))
    return out


# Суперспец only for T4L (Александр via Склад, 11.10.2026): T8 EDXGD34B6TE031162 is
# no longer суперспец; T4L 103208 / 095545 / 093989 sold 05.10. Removed from EXCL_FIX.
EXCL_DROP = ("EDXGD34B6TE031162", "EDELB31B1TE103208", "EDELB31BXTE095545", "EDELB31B3TE093989")
EXCL_RE = re.compile(r'(const EXCL_FIX = \{)(.*?)(\n?[ \t]*\};)', re.S)


def drop_excl(text):
    m = EXCL_RE.search(text)
    if not m:
        return text
    body = m.group(2)
    lines = [l for l in body.split("\n") if l.strip() and not any(('"%s"' % v) in l for v in EXCL_DROP)]
    if len(lines) == len([l for l in body.split("\n") if l.strip()]):
        return text
    lines = [l.rstrip().rstrip(",") for l in lines]
    new = ("\n" + ",\n".join(lines) + "\n    ") if lines else ""
    return text[:m.start()] + m.group(1) + new + "};" + text[m.end():]


def patch(text):
    out = drop_excl(text)
    out = apply_each(out, SUBS)
    out = apply_each(out, [s for s in SUBS2 if not s[0].startswith("const FLEET_PIN")])
    if len(PIN_RE.findall(out)) == 1:
        out = PIN_RE.sub(lambda m: PIN_NEW, out)
    if len(NOTE_RE.findall(out)) == 1:
        out = NOTE_RE.sub(lambda m: NOTE_NEW, out)
    out = plus_patch(out)
    out = plus_stock(out)
    out = apply_each(out, PLUS_UI_SUBS)
    out = BLANKS.sub(r"\n\n\1", out)
    return out


# ---- TENET PLUS (ИП 1938/И, 1921/И; approved 12.10.2026) ----
# 1) Совкомбанк L6 ПВ 50-59,99% 60/72/84 -> 7,30/8,00/8,40.
# 2) Альфа-Банк L4/L6: no ПВ 0-9,99% row (bank n/a below 10%).
# 3) ВТБ tables L6/L4 (1938/И p.4); ВТБ shown only for TENET PLUS.
# 4) «Elegant Трейд-Ин» (Mazda/KIA/Hyundai) +100 000 / +100 000 for L4/L6, calc + КП.
# 5) Caption: ИП 1938/И пролонгирована.
VTB_ROWS = (
    "      vtb:{\n"
    "        plusL6:{\n"
    "          80:[0.01,0.01,0.01,0.01,0.01,0.01,0.01],\n"
    "          70:[0.01,0.01,0.01,0.01,0.01,0.01,0.01],\n"
    "          60:[0.01,0.01,0.01,0.01,1.00,3.00,4.50],\n"
    "          50:[0.01,0.01,0.01,2.00,4.50,6.50,7.50],\n"
    "          40:[0.01,0.01,2.00,5.50,7.50,8.50,9.50],\n"
    "          30:[0.01,0.01,4.50,7.50,9.00,10.00,11.00],\n"
    "          20:[0.01,2.00,6.50,9.00,10.50,11.50,12.00],\n"
    "          10:[0.01,4.00,8.00,10.00,11.50,12.50,13.00]\n"
    "        },\n"
    "        plusL4:{\n"
    "          80:[0.01,0.01,0.01,0.01,0.01,0.01,0.01],\n"
    "          70:[0.01,0.01,0.01,0.01,0.01,0.01,2.00],\n"
    "          60:[0.01,0.01,0.01,0.01,3.00,5.00,6.00],\n"
    "          50:[0.01,0.01,0.50,4.00,6.00,7.50,8.50],\n"
    "          40:[0.01,0.01,4.00,7.00,8.50,9.50,10.50],\n"
    "          30:[0.01,1.20,6.00,8.50,10.00,11.00,11.50],\n"
    "          20:[0.01,3.50,8.00,10.00,11.30,12.00,12.50],\n"
    "          10:[0.01,5.00,9.00,11.00,12.00,13.00,13.50]\n"
    "        }\n"
    "      }\n"
)
PLUS_ISP = 'const isPlusM=(m&&(m.stock==="pl4"||m.stock==="pl6"));'
LOYAL_LBL_KM = ('${(m.stock==="pl4"||m.stock==="pl6")?`<label class="check-row"><input id="kmUseLoyal" type="checkbox" ${useLoyal?"checked":""} /> '
                '<span>Elegant Трейд-Ин (сдаёт Mazda / KIA / Hyundai) ${rub(100000)} / возмещение ${rub(100000)}</span></label>`:""}')
LOYAL_LBL_OF = ('${(d.m.stock==="pl4"||d.m.stock==="pl6")?`<label class="check-row"><input id="ofLoyal" type="checkbox" ${d.useLoyal?"checked":""} /> '
                '<span>Elegant Трейд-Ин (Mazda / KIA / Hyundai) ${rub(100000)}</span></label>`:""}')
PLUS_SUBS = [
    # bank lists
    ('      {id:"tbank", name:"Т-Банк"}\n    ];',
     '      {id:"tbank", name:"Т-Банк"},\n      {id:"vtb", name:"ВТБ"}\n    ];'),
    ('      tbank:[12,24,36,48,60,72,84,96]\n    };\n    const KM_BANK_RATES',
     '      tbank:[12,24,36,48,60,72,84,96],\n      vtb:[12,24,36,48,60,72,84]\n    };\n    const KM_BANK_RATES'),
    # kmBankRate: n/a handling
    ('      const table=(KM_BANK_RATES[bankId]||{})[group]||(KM_BANK_RATES[bankId]||{}).t4l_t7||{};\n'
     '      const row=table[band]||table[10]||table[20]||[];',
     '      const bankT=KM_BANK_RATES[bankId]||{};/*plus-banks*/\n'
     '      if(bankId==="vtb" && !bankT[group]) return {rate:0, term:n, band, capped:false, na:true};\n'
     '      const table=bankT[group]||bankT.t4l_t7||{};\n'
     '      if(/^plus/.test(String(group||"")) && !table[band]) return {rate:0, term:n, band, capped:false, na:true};\n'
     '      const row=table[band]||table[10]||table[20]||[];'),
    # calcKm loyal trade-in
    ('      const tiAmt=useTi?m.ti:0;\n      const tiBack=useTi?m.tiBack:0;',
     '      const useLoyal=(m.stock==="pl4"||m.stock==="pl6") && kmVal("kmUseLoyal", false);/*plus-loyal*/\n'
     '      const tiAmt=(useTi?m.ti:0)+(useLoyal?100000:0);\n'
     '      const tiBack=(useTi?m.tiBack:0)+(useLoyal?100000:0);'),
    ('            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин ${m.ti?rub(m.ti)+" / возмещение "+rub(m.tiBack):"нет в базе"}</span></label>\n',
     '            <label class="check-row"><input id="kmUseTi" type="checkbox" ${useTi?"checked":""} /> <span>Трейд-ин ${m.ti?rub(m.ti)+" / возмещение "+rub(m.tiBack):"нет в базе"}</span></label>\n'
     '            ' + LOYAL_LBL_KM + '\n'),
    ('["kmRrc","kmInv","kmUseTi","kmFleetDisc"', '["kmRrc","kmInv","kmUseTi","kmUseLoyal","kmFleetDisc"'),
    ('        useTi:useTi,\n        useLoan:useLoan,\n', '        useTi:useTi,\n        useLoyal:on("kmUseLoyal"),\n        useLoan:useLoan,\n'),
    # КП
    ('      const useTi=S?!!S.useTi:offerOn("ofTi");\n',
     '      const useTi=S?!!S.useTi:offerOn("ofTi");\n'
     '      const useLoyal=(m.stock==="pl4"||m.stock==="pl6") && (S?!!S.useLoyal:offerOn("ofLoyal"));/*plus-loyal*/\n'),
    ('      if(tiAmt) discs.push(["Трейд-ин импортёра", tiAmt]);\n',
     '      if(tiAmt) discs.push(["Трейд-ин импортёра", tiAmt]);\n'
     '      if(useLoyal) discs.push(["Elegant Трейд-Ин (Mazda / KIA / Hyundai)", 100000]);\n'),
    ('      return {m, mid, models, client, color, price, useTi, useLoan,',
     '      return {m, mid, models, client, color, price, useTi, useLoyal, useLoan,'),
    ('        <label class="check-row"><input id="ofTi" type="checkbox" ${d.useTi?"checked":""} /> <span>Трейд-ин ${d.m.ti?rub(d.m.ti):"нет в базе"}</span></label>\n',
     '        <label class="check-row"><input id="ofTi" type="checkbox" ${d.useTi?"checked":""} /> <span>Трейд-ин ${d.m.ti?rub(d.m.ti):"нет в базе"}</span></label>\n'
     '        ' + LOYAL_LBL_OF + '\n'),
    ('"ofMonths","ofValid","ofTi","ofLoan"', '"ofMonths","ofValid","ofTi","ofLoyal","ofLoan"'),
]
CAPTION_OLD = '"Ставки TENET PLUS, ИП 1938/И."'
CAPTION_NEW = '"Ставки TENET PLUS, ИП 1938/И (пролонгирована)."'
SOV_L6_50_OLD = "50:[0.01,0.01,2.80,4.30,6.60,7.30,8.00]"
SOV_L6_50_NEW = "50:[0.01,0.01,2.80,4.30,7.30,8.00,8.40]"
BANKS_MAP = re.compile(r'KM_BANKS:\[[^\n]*?\]\)\.map\(b=>\{\n')


def _block(text, name, start=0, end=None):
    """Return (i, j) span of '<name>:{ ... }' (brace matched) inside text[start:end]."""
    end = len(text) if end is None else end
    i = text.find(name + ":{", start, end)
    if i < 0:
        return None
    k = i + len(name) + 1
    depth = 0
    for q in range(k, end):
        c = text[q]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return (i, q + 1)
    return None


def plus_rates(text):
    a = text.find("const KM_BANK_RATES = {")
    b = text.find("    function kmRateGroup(m){", a)
    if a < 0 or b < 0:
        return text
    rates = text[a:b]
    # 1) Совкомбанк plusL6 row 50
    sv = _block(rates, "sovcom")
    if sv:
        l6 = _block(rates, "plusL6", sv[0], sv[1])
        if l6 and rates.count(SOV_L6_50_OLD, l6[0], l6[1]) == 1:
            seg = rates[l6[0]:l6[1]].replace(SOV_L6_50_OLD, SOV_L6_50_NEW, 1)
            rates = rates[:l6[0]] + seg + rates[l6[1]:]
    # 2) Альфа plusL6 / plusL4 without row 0
    for grp in ("plusL6", "plusL4"):
        al = _block(rates, "alfa")
        if not al:
            break
        g = _block(rates, grp, al[0], al[1])
        if not g:
            continue
        seg = rates[g[0]:g[1]]
        seg2 = re.sub(r',\n[ \t]*0:\[[^\]]*\]', '', seg, count=1)
        rates = rates[:g[0]] + seg2 + rates[g[1]:]
    # 3) ВТБ tables
    if "      vtb:{" not in rates:
        m = re.search(r'\n      \}\n    \};\n$', rates)
        if m:
            rates = rates[:m.start()] + "\n      },\n" + VTB_ROWS + "    };\n" + rates[m.end():]
    return text[:a] + rates + text[b:]


def plus_banks_filter(text):
    out, pos = [], 0
    for m in BANKS_MAP.finditer(text):
        ls = text.rfind("\n", 0, m.start()) + 1
        indent = re.match(r"[ \t]*", text[ls:]).group(0)
        look = text.find("const look=", m.end())
        look_end = text.find("\n", look)
        close = text.find("\n" + indent + "});", m.end())
        if look < 0 or close < 0 or look > close:
            continue
        nxt = text[look_end + 1:look_end + 80]
        if "if(look&&look.na) return null;" in nxt:
            continue
        li = re.match(r"[ \t]*", text[text.rfind("\n", 0, look) + 1:]).group(0)
        out.append(text[pos:look_end + 1])
        out.append(li + "if(look&&look.na) return null;\n")
        out.append(text[look_end + 1:close])
        out.append("\n" + indent + "}).filter(Boolean);")
        pos = close + len("\n" + indent + "});")
    out.append(text[pos:])
    return "".join(out)


def plus_patch(text):
    out = plus_rates(text)
    out = apply_each(out, PLUS_SUBS)
    if CAPTION_OLD in out:
        out = out.replace(CAPTION_OLD, CAPTION_NEW)
    out = plus_banks_filter(out)
    return out


# TENET PLUS stock (Logicstars TENET PLUS portal, 20.10.2026): 26 cars.
# Exact site objects, field order vin, model, name, trim, color, status, note, rrc.
# RRC only; purchase cost is never published. Every build drops existing pl4/pl6
# (and EFEDB21/EDEMB31 VINs) from STOCK and inserts this list, so a stale baked
# block cannot survive the Pages workflow. stock-part1/part2/stock.json are not
# the source of these cars and are left untouched.
PLUS_MODELS = {"pl4", "pl6"}
PLUS_VIN_PREFIXES = ("EFEDB21", "EDEMB31")
PLUS_CARS = [
    {"vin": "EDEMB31B1TE136973", "model": "pl6", "name": "L6", "trim": "Элегант", "color": "Чёрный", "status": "way", "note": "На заводе (Калуга) · отгрузка 27.10.2026", "rrc": 2890000},
    {"vin": "EDEMB31B1TE137072", "model": "pl6", "name": "L6", "trim": "Элегант", "color": "Чёрный", "status": "way", "note": "На заводе (Калуга) · отгрузка 27.10.2026", "rrc": 2890000},
    {"vin": "EDEMB31B1TE137153", "model": "pl6", "name": "L6", "trim": "Элегант", "color": "Чёрный", "status": "way", "note": "На заводе (Калуга) · отгрузка 27.10.2026", "rrc": 2890000},
    {"vin": "EFEDB21B5T3000583", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Серый", "status": "way", "note": "На заводе (СПб Сестрорецк)", "rrc": 2540000},
    {"vin": "EFEDB21B0T3003360", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Серый", "status": "way", "note": "На заводе (СПб Сестрорецк) · отгрузка 27.10.2026", "rrc": 2540000},
    {"vin": "EFEDB21B0T3002547", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Белый", "status": "way", "note": "На заводе (СПб Сестрорецк) · отгрузка 18.10.2026", "rrc": 2690000},
    {"vin": "EFEDB21B3T3002798", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Серый", "status": "way", "note": "На заводе (СПб Сестрорецк)", "rrc": 2540000},
    {"vin": "EFEDB21B0T3003665", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Белый", "status": "way", "note": "На заводе (СПб Сестрорецк) · отгрузка 27.10.2026", "rrc": 2540000},
    {"vin": "EFEDB21B1T3003786", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Чёрный", "status": "way", "note": "На заводе (СПб Сестрорецк) · отгрузка 27.10.2026", "rrc": 2540000},
    {"vin": "EFEDB21B1T3003402", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Красный", "status": "way", "note": "На заводе (СПб Сестрорецк) · отгрузка 27.10.2026", "rrc": 2540000},
    {"vin": "EFEDB21B0T3004119", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Красный", "status": "way", "note": "На заводе (СПб Сестрорецк) · отгрузка 27.10.2026", "rrc": 2690000},
    {"vin": "EFEDB21B3T3003949", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Чёрный", "status": "way", "note": "На заводе (СПб Сестрорецк)", "rrc": 2540000},
    {"vin": "EFEDB21B4T3003944", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Чёрный", "status": "way", "note": "На заводе (СПб Сестрорецк)", "rrc": 2540000},
    {"vin": "EFEDB21B1T3003996", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Белый", "status": "way", "note": "На заводе (СПб Сестрорецк)", "rrc": 2540000},
    {"vin": "EFEDB21B1T3004257", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Серый", "status": "way", "note": "На заводе (СПб Сестрорецк)", "rrc": 2690000},
    {"vin": "EFEDB21B1T3000922", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Красный", "status": "in", "note": "В салоне · с 17.09.2026", "rrc": 2540000},
    {"vin": "EFEDB21B0T3001236", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Белый", "status": "in", "note": "В салоне · с 17.09.2026", "rrc": 2690000},
    {"vin": "EFEDB21B1T3000094", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Белый", "status": "in", "note": "В салоне · с 23.09.2026", "rrc": 2690000},
    {"vin": "EFEDB21B1T3002041", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Белый", "status": "in", "note": "В салоне · с 01.10.2026", "rrc": 2690000},
    {"vin": "EFEDB21B2T3002176", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Серый", "status": "in", "note": "В салоне · с 01.10.2026", "rrc": 2690000},
    {"vin": "EFEDB21B0T3001351", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Серый", "status": "in", "note": "В салоне · с 01.10.2026", "rrc": 2540000},
    {"vin": "EDEMB31B9TE119337", "model": "pl6", "name": "L6", "trim": "Ультра", "color": "Оранжевый", "status": "in", "note": "В салоне · с 19.10.2026", "rrc": 3040000},
    {"vin": "EFEDB21B0T3002466", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Чёрный", "status": "in", "note": "В салоне · с 20.10.2026", "rrc": 2690000},
    {"vin": "EFEDB21B0T3002595", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Белый", "status": "in", "note": "В салоне · с 20.10.2026", "rrc": 2690000},
    {"vin": "EDEMB31B7TE100589", "model": "pl6", "name": "L6", "trim": "Ультра", "color": "Белый", "status": "in", "note": "В салоне · с 28.09.2026", "rrc": 3040000},
    {"vin": "EDEMB31B4TE100291", "model": "pl6", "name": "L6", "trim": "Ультра", "color": "Чёрный", "status": "in", "note": "В салоне · с 30.09.2026", "rrc": 3040000},
    {"vin": "EDEMB31B3TE113985", "model": "pl6", "name": "L6", "trim": "Ультра", "color": "Белый", "status": "in", "note": "В салоне · с 30.09.2026", "rrc": 3040000},
    {"vin": "EFEDB21B2T3000637", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Белый", "status": "in", "note": "В салоне · с 30.09.2026", "rrc": 2540000},
    {"vin": "EFEDB21B2T3000394", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Белый", "status": "in", "note": "В салоне · с 28.09.2026", "rrc": 2540000},
    {"vin": "EFEDB21B0T3000135", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Чёрный", "status": "in", "note": "В салоне · с 28.09.2026", "rrc": 2690000},
    {"vin": "EFEDB21B1T3001374", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Серый", "status": "in", "note": "В салоне · с 14.10.2026", "rrc": 2540000},
    {"vin": "EFEDB21B2T3002128", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Красный", "status": "in", "note": "В салоне · с 08.10.2026", "rrc": 2690000},
    {"vin": "EFEDB21B1T3001911", "model": "pl4", "name": "L4", "trim": "Стайл", "color": "Белый", "status": "in", "note": "В салоне · с 09.10.2026", "rrc": 2540000},
    {"vin": "EFEDB21B2T3001755", "model": "pl4", "name": "L4", "trim": "Элегант", "color": "Чёрный", "status": "in", "note": "В салоне · с 12.10.2026", "rrc": 2690000},
    {"vin": "EDEMB31B1TE126640", "model": "pl6", "name": "L6", "trim": "Элегант", "color": "Оранжевый", "status": "in", "note": "В салоне · с 13.10.2026", "rrc": 2890000},
]
STOCK_RE = re.compile(r'(const STOCK = \[)(.*?)(\];)', re.S)


def _is_plus_car(obj):
    if not isinstance(obj, dict):
        return False
    if obj.get("model") in PLUS_MODELS:
        return True
    vin = str(obj.get("vin") or "")
    return vin.startswith(PLUS_VIN_PREFIXES)


def plus_stock(text):
    m = STOCK_RE.search(text)
    if not m:
        return text
    body = m.group(2)
    dec = json.JSONDecoder()
    i, n = 0, len(body)
    kept = []
    removed = 0
    try:
        while i < n:
            while i < n and body[i] in " \t\r\n,":
                i += 1
            if i >= n:
                break
            obj, end = dec.raw_decode(body, i)
            if _is_plus_car(obj):
                removed += 1
            else:
                kept.append(body[i:end])
            i = end
    except json.JSONDecodeError as e:
        print("plus stock parse fail", e)
        return text
    add = [json.dumps(c, ensure_ascii=False) for c in PLUS_CARS]
    new_body = ", ".join(kept + add)
    if new_body == body:
        return text
    print("plus stock: removed", removed, "inserted", len(add))
    return text[:m.start(2)] + new_body + text[m.end(2):]


PLUS_UI_SUBS = [
    ('      if(id==="t7l") return true;\n      return true;',
     '      if(id==="l4s") return t.includes("стайл")||t.includes("style");\n'
     '      if(id==="l4e"||id==="l6e") return t.includes("элегант")||t.includes("elegant");\n'
     '      if(id==="l6u") return t.includes("ультра")||t.includes("ultra");\n'
     '      if(id==="t7l") return true;\n      return true;'),
    ('      if(car.model==="t7l") return "t7l";\n      return "";',
     '      if(car.model==="t7l") return "t7l";\n'
     '      if(car.model==="pl4") return (t.includes("стайл")||t.includes("style"))?"l4s":"l4e";\n'
     '      if(car.model==="pl6") return (t.includes("ультра")||t.includes("ultra"))?"l6u":"l6e";\n      return "";'),
    ('const modelOrder=["t4","t4l","t7","t8","tt9","t9","t7l","ta8","a8"];',
     'const modelOrder=["t4","t4l","t7","t8","tt9","t9","t7l","ta8","a8","pl4","pl6"];'),
    ('ta8:["TENET","A8"],a8:["CHERY","Arrizo 8"]};',
     'ta8:["TENET","A8"],a8:["CHERY","Arrizo 8"],pl4:["TENET PLUS","L4"],pl6:["TENET PLUS","L6"]};'),
]


def main():
    for p in (Path("terms-calc-data.js"), Path("_site/terms-calc-data.js")):
        if p.exists():
            src = p.read_text(encoding="utf-8")
            out = drop_excl(src)
            if out != src:
                p.write_text(out, encoding="utf-8")
                print(p, "excl-fix: dropped")
    for p in (Path("index.html"), Path("_site/index.html")):
        if not p.exists() or p.stat().st_size < 100000:
            continue
        src = p.read_text(encoding="utf-8")
        out = patch(src)
        if out == src:
            print(p, "fleet-dcti: nothing to do")
            continue
        if not js_ok(out):
            print(p, "fleet-dcti: JS check failed -> not written")
            continue
        p.write_text(out, encoding="utf-8")
        print(p, "fleet-dcti: patched")


if __name__ == "__main__":
    main()
