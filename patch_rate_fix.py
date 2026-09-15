#!/usr/bin/env python3
from pathlib import Path
import json

def helpers():
    return (
        "    function staffKey(s){\n"
        "      const n=norm(s);\n"
        "      if(!n) return '';\n"
        "      if(STAFF.includes(n)) return n;\n"
        "      const parts=n.split(/[\\s.,/]+/).filter(Boolean);\n"
        "      for(const p of parts){ if(STAFF.includes(p)) return p; }\n"
        "      return n;\n"
        "    }\n"
        "    function canonPerson(rec){\n"
        "      if(!rec) return rec;\n"
        "      const key=staffKey(rec.surname||rec.display);\n"
        "      const out=Object.assign({}, rec);\n"
        "      if(key){\n"
        "        out.surname=key;\n"
        "        const i=STAFF.indexOf(key);\n"
        "        if(i>=0) out.display=STAFF_SHOW[i];\n"
        "        else if(!out.display) out.display=rec.display||rec.surname;\n"
        "      }\n"
        "      if(out.percent!=null) out.percent=Number(out.percent);\n"
        "      if(out.exam!=null) out.exam=Number(out.exam||1);\n"
        "      if(!out.status) out.status='done';\n"
        "      return out;\n"
        "    }\n"
        "    function loadCloudCache(){\n"
        "      try{\n"
        "        const x=JSON.parse(localStorage.getItem('tenet-cloud-locks-v1')||'[]');\n"
        "        return Array.isArray(x)?x:[];\n"
        "      }catch(e){ return []; }\n"
        "    }\n"
        "    function saveCloudCache(list){\n"
        "      try{\n"
        "        const slim=(list||[]).filter(x=>x && x.surname);\n"
        "        localStorage.setItem('tenet-cloud-locks-v1', JSON.stringify(slim));\n"
        "      }catch(e){}\n"
        "    }\n"
    )


def seed_js():
    p = Path("rating-seed.json")
    if not p.exists():
        p = Path(__file__).with_name("rating-seed.json")
    data = json.loads(p.read_text(encoding="utf-8"))
    return "    const RATE_SEED = " + json.dumps(data, ensure_ascii=False) + ";\n"


def patch(text: str) -> str:
    if "function staffKey(" not in text:
        marker = "function norm(s){"
        i = text.find(marker)
        if i >= 0:
            text = text[:i] + helpers() + "    " + text[i:]
    if "const RATE_SEED" not in text:
        text = text.replace(
            '    const CLOUD_KEY = "4fmBrr2H";',
            '    const CLOUD_KEY = "4fmBrr2H";\n' + seed_js(),
            1,
        )
    text = text.replace("since=48h", "since=72h")
    text = text.replace("since=3d", "since=72h")
    text = text.replace(
        "const k=norm(r.surname||r.display);",
        "const k=staffKey(r.surname||r.display);",
    )
    old_merge = (
        "      const extra = await pullRelay();\n"
        "      const merged = mergeCloud(base, extra);\n"
        '      if(!rentryOk && !extra.length) throw new Error("cloud");\n'
        "      return merged;"
    )
    new_merge = (
        "      const extra = await pullRelay();\n"
        "      const cached = loadCloudCache();\n"
        "      const merged = mergeCloud(mergeCloud(RATE_SEED, cached), mergeCloud(base, extra));\n"
        "      if(merged.length) saveCloudCache(merged);\n"
        "      return merged;"
    )
    if old_merge in text:
        text = text.replace(old_merge, new_merge, 1)
    old_refresh = (
        "        remoteLocks = await pullList();\n"
        "        syncOk = true;\n"
        "        await flushLocalDone();"
    )
    new_refresh = (
        "        remoteLocks = await pullList();\n"
        "        syncOk = true;\n"
        "        saveCloudCache(remoteLocks);\n"
        "        await flushLocalDone();"
    )
    if old_refresh in text:
        text = text.replace(old_refresh, new_refresh, 1)
    old_apply = (
        "          const rec=unpackResult(v);\n"
        '          if(!rec || !rec.surname || !rec.model) throw new Error("bad");\n'
        '          await upsertLock(Object.assign({status:"done"}, rec));\n'
        "          await refreshLocks();\n"
        "          render();\n"
        "        }catch(e){ applyBtn.textContent=\"\u041a\u043e\u0434 \u043d\u0435 \u043f\u0440\u0438\u043d\u044f\u0442\"; }"
    )
    new_apply = (
        "          const rec=canonPerson(unpackResult(v));\n"
        '          if(!rec || !rec.surname || !rec.model || rec.percent==null) throw new Error("bad");\n'
        '          rec.status="done";\n'
        "          const ok=await upsertLock(rec);\n"
        "          await refreshLocks();\n"
        '          applyBtn.textContent=ok?"\u0417\u0430\u0447\u0442\u0435\u043d\u043e \u0432 \u043e\u0431\u0449\u0438\u0439 \u0440\u0435\u0439\u0442\u0438\u043d\u0433":"\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u043e, \u043e\u0431\u043b\u0430\u043a\u043e \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e";\n'
        "          render();\n"
        "        }catch(e){ applyBtn.textContent=\"\u041a\u043e\u0434 \u043d\u0435 \u043f\u0440\u0438\u043d\u044f\u0442\"; }"
    )
    if old_apply in text:
        text = text.replace(old_apply, new_apply, 1)
    return text


def main():
    n = 0
    for path in (Path("_site/index.html"), Path("TENET_T4L_netlify/index.html")):
        if not path.exists():
            continue
        src = path.read_text(encoding="utf-8")
        out = patch(src)
        if out != src:
            path.write_text(out, encoding="utf-8")
            print("rate-fix patched", path)
            n += 1
        else:
            print(path, "unchanged")
    print("rate-fix changed", n)


if __name__ == "__main__":
    main()
