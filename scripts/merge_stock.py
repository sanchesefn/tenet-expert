#!/usr/bin/env python3
"""Merge stock-part1.json + stock-part2.json into stock.json and apply manual reservations.

reserved = reserved already set in parts (PISEC etc., never cleared)  OR  VIN listed in manual-reserved.json.
Usage: python3 scripts/merge_stock.py [--pretty]   (default: one-line compact, as on the live site)
"""
import json
import sys
from pathlib import Path

MANUAL = Path("manual-reserved.json")


def load_manual():
    if not MANUAL.exists():
        print("manual-reserved.json: not found, no manual reservations")
        return set()
    try:
        d = json.loads(MANUAL.read_text(encoding="utf-8"))
    except Exception as e:  # never break the stock rebuild because of this file
        print("WARN manual-reserved.json unreadable:", e)
        return set()
    items = d.get("vins", []) if isinstance(d, dict) else d
    out = set()
    for it in items or []:
        v = it.get("vin") if isinstance(it, dict) else it
        if isinstance(v, str) and v.strip():
            out.add(v.strip().upper())
    return out


def main():
    pretty = "--pretty" in sys.argv[1:]
    cars, seen, upd, dealer = [], set(), "", "ООО «ЭКСПЕРТ АВТО САМАРА»"
    for name in ("stock-part1.json", "stock-part2.json"):
        p = json.loads(Path(name).read_text(encoding="utf-8"))
        upd = p.get("updated") or upd
        dealer = p.get("dealer") or dealer
        for c in p.get("cars") or []:
            v = c.get("vin")
            if v and v not in seen:
                seen.add(v)
                cars.append(c)
    if len(cars) < 40:
        raise SystemExit(f"too few cars: {len(cars)}")

    manual = load_manual()
    applied = []
    for c in cars:
        if str(c.get("vin", "")).strip().upper() in manual and c.get("reserved") is not True:
            c["reserved"] = True  # new key is appended last, same as parts' own reserved flags
            applied.append(c["vin"])

    out = {"updated": upd, "dealer": dealer, "cars": cars}
    if pretty:
        text = json.dumps(out, ensure_ascii=False, indent=2) + "\n"
    else:
        text = json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n"
    Path("stock.json").write_text(text, encoding="utf-8")

    reserved = [c["vin"] for c in cars if c.get("reserved")]
    missing = sorted(manual - {str(c["vin"]).upper() for c in cars})
    print("wrote stock.json", len(cars), upd)
    print("manual applied:", len(applied), applied)
    print("reserved total:", len(reserved), reserved)
    if missing:
        print("manual VINs not in stock (ignored):", missing)


if __name__ == "__main__":
    main()
