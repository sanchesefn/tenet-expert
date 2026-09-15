#!/usr/bin/env python3
"""Keep rating results visible: name aliases, cloud cache, ntfy since fix."""
from pathlib import Path

SEED = r"""    const RATE_SEED = [{\"surname\":\"леонтьев\",\"display\":\"Леонтьев\",\"model\":\"t8\",\"exam\":1,\"percent\":94,\"status\":\"done\"},{\"surname\":\"леонтьев\",\"display\":\"Леонтьев\",\"model\":\"t4l\",\"exam\":1,\"percent\":86,\"status\":\"done\"},{\"surname\":\"леонтьев\",\"display\":\"Леонтьев\",\"model\":\"t7\",\"exam\":1,\"percent\":79,\"status\":\"done\"},{\"surname\":\"леонтьев\",\"display\":\"Леонтьев\",\"model\":\"t9\",\"exam\":1,\"percent\":100,\"status\":\"done\"},{\"surname\":\"леонтьев\",\"display\":\"Леонтьев\",\"model\":\"a8\",\"exam\":1,\"percent\":97,\"status\":\"done\"},{\"surname\":\"извеков\",\"display\":\"Извеков\",\"model\":\"t8\",\"exam\":1,\"percent\":97,\"status\":\"done\"},{\"surname\":\"коропец\",\"display\":\"Коропец\",\"model\":\"t4l\",\"exam\":1,\"percent\":85,\"status\":\"done\"},{\"surname\":\"коропец\",\"display\":\"Коропец\",\"model\":\"a8\",\"exam\":1,\"percent\":92,\"status\":\"done\"},{\"surname\":\"коропец\",\"display\":\"Коропец\",\"model\":\"t8\",\"exam\":1,\"percent\":94,\"status\":\"done\"},{\"surname\":\"коропец\",\"display\":\"Коропец\",\"model\":\"t7\",\"exam\":1,\"percent\":90,\"status\":\"done\"},{\"surname\":\"коропец\",\"display\":\"Коропец\",\"model\":\"t9\",\"exam\":1,\"percent\":92,\"status\":\"done\"},{\"surname\":\"ахмадуллин\",\"display\":\"Ахмадуллин\",\"model\":\"t7\",\"exam\":1,\"percent\":78,\"status\":\"done\"},{\"surname\":\"сидоров\",\"display\":\"Сидоров\",\"model\":\"t4l\",\"exam\":1,\"percent\":98,\"status\":\"done\"},{\"surname\":\"сидоров\",\"display\":\"Сидоров\",\"model\":\"t7\",\"exam\":1,\"percent\":100,\"status\":\"done\"},{\"surname\":\"сидоров\",\"display\":\"Сидоров\",\"model\":\"t8\",\"exam\":1,\"percent\":97,\"status\":\"done\"},{\"surname\":\"сидоров\",\"display\":\"Сидоров\",\"model\":\"t9\",\"exam\":1,\"percent\":100,\"status\":\"done\"},{\"surname\":\"сидоров\",\"display\":\"Сидоров\",\"model\":\"a8\",\"exam\":1,\"percent\":94,\"status\":\"done\"}];
"""

HELPERS = r"""    function staffKey(s){
      const n=norm(s);
      if(!n) return "";
      if(STAFF.includes(n)) return n;
      const parts=n.split(/[\s.,/]+/).filter(Boolean);
      for(const p of parts){ if(STAFF.includes(p)) return p; }
      return n;
    }
    function canonPerson(rec){
      if(!rec) return rec;
      const key=staffKey(rec.surname||rec.display);
      const out=Object.assign({}, rec);
      if(key){
        out.surname=key;
        const i=STAFF.indexOf(key);
        if(i>=0) out.display=STAFF_SHOW[i];
        else if(!out.display) out.display=rec.display||rec.surname;
      }
      if(out.percent!=null) out.percent=Number(out.percent);
      if(out.exam!=null) out.exam=Number(out.exam||1);
      if(!out.status) out.status="done";
      return out;
    }
    function loadCloudCache(){
      try{
        const x=JSON.parse(localStorage.getItem(\"tenet-cloud-locks-v1\")||\"[]\");
        return Array.isArray(x)?x:[];
      }catch(e){ return []; }
    }
    function saveCloudCache(list){
      try{
        const slim=(list||[]).filter(x=>x && x.surname);
        localStorage.setItem(\"tenet-cloud-locks-v1\", JSON.stringify(slim));
      }catch(e){}
    }
"""


def patch(text: str) -> str:
    if \"function staffKey(\" not in text:
        old = '    function norm(s){ return (s||\"\").trim().replace(/\\\\s+/g,\" \").replace(/ё/g,\"е\").replace(/Ё/g,\"е\").toLowerCase(); }'
        if old in text:
            text = text.replace(old, old + \"\\n\" + HELPERS, 1)
        else:
            text = text.replace(
                \"function norm(s){\",
                HELPERS + \"\\n    function norm(s){\",
                1,
            )

    if \"const RATE_SEED\" not in text:
        text = text.replace(
            '    const CLOUD_KEY = \"4fmBrr2H\";',
            '    const CLOUD_KEY = \"4fmBrr2H\";\\n' + SEED,
            1,
        )

    text = text.replace(\"since=48h\", \"since=3d\")
    text = text.replace(\"since=7d\", \"since=3d\")

    text = text.replace(
        \"const k=norm(r.surname||r.display);\",
        \"const k=staffKey(r.surname||r.display);\",
    )
    text = text.replace(
        'const k=norm(r.surname)+\"|\"+r.model+\"|\"+String(Number(r.exam||1));',
        'const k=staffKey(r.surname||r.display)+\"|\"+r.model+\"|\"+String(Number(r.exam||1));',
    )

    old_merge = \"\"\"      const extra = await pullRelay();\n      const merged = mergeCloud(base, extra);\n      if(!rentryOk && !extra.length) throw new Error(\"cloud\");\n      return merged;\"\"\"
    new_merge = \"\"\"      const extra = await pullRelay();\n      const cached = loadCloudCache();\n      const merged = mergeCloud(mergeCloud(RATE_SEED, cached), mergeCloud(base, extra));\n      if(merged.length) saveCloudCache(merged);\n      if(!rentryOk && !extra.length && !cached.length && !(RATE_SEED||[]).length) throw new Error(\"cloud\");\n      return merged;\"\"\"
    if old_merge in text:
        text = text.replace(old_merge, new_merge, 1)

    old_refresh = \"\"\"        remoteLocks = await pullList();\n        syncOk = true;\n        await flushLocalDone();\"\"\"
    new_refresh = \"\"\"        remoteLocks = await pullList();\n        syncOk = true;\n        saveCloudCache(remoteLocks);\n        await flushLocalDone();\"\"\"
    if old_refresh in text:
        text = text.replace(old_refresh, new_refresh, 1)

    old_apply = \"\"\"          const rec=unpackResult(v);\n          if(!rec || !rec.surname || !rec.model) throw new Error(\"bad\");\n          await upsertLock(Object.assign({status:\"done\"}, rec));\n          await refreshLocks();\n          render();\n        }catch(e){ applyBtn.textContent=\"Код не принят\"; }\"\"\"
    new_apply = \"\"\"          const rec=canonPerson(unpackResult(v));\n          if(!rec || !rec.surname || !rec.model || rec.percent==null) throw new Error(\"bad\");\n          rec.status=\"done\";\n          const ok=await upsertLock(rec);\n          await refreshLocks();\n          applyBtn.textContent=ok?\"Зачтено в общий рейтинг\":\"Сохранено локально, облако недоступно\";\n          render();\n        }catch(e){ applyBtn.textContent=\"Код не принят\"; }\"\"\"
    if old_apply in text:
        text = text.replace(old_apply, new_apply, 1)

    old_up = \"\"\"        surname:rec.surname, display:rec.display, model:rec.model, exam:rec.exam||1,\"\"\"
    new_up = \"\"\"        surname:staffKey(rec.surname||rec.display)||norm(rec.surname), display:canonPerson(rec).display, model:rec.model, exam:rec.exam||1,\"\"\"
    if \"staffKey(rec.surname||rec.display)\" not in text and old_up in text:
        text = text.replace(old_up, new_up, 1)

    old_flush_find = \"\"\"        const rem=(remoteLocks||[]).find(x=>isExamRow(x) && x.surname===norm(rec.surname) && x.model===rec.model && Number(x.exam||1)===Number(rec.exam||1));\"\"\"
    new_flush_find = \"\"\"        const rem=(remoteLocks||[]).find(x=>isExamRow(x) && staffKey(x.surname)===staffKey(rec.surname) && x.model===rec.model && Number(x.exam||1)===Number(rec.exam||1));\"\"\"
    if old_flush_find in text:
        text = text.replace(old_flush_find, new_flush_find, 1)

    return text


def main():
    n = 0
    for path in (Path(\"_site/index.html\"), Path(\"TENET_T4L_netlify/index.html\")):
        if not path.exists():
            continue
        src = path.read_text()
        out = patch(src)
        if out != src:
            path.write_text(out)
            print(\"rate-fix patched\", path, path.stat().st_size)
            n += 1
        else:
            print(path, \"rate-fix unchanged\")
    print(\"rate-fix changed\", n)


if __name__ == \"__main__\":
    main()
