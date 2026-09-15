#!/usr/bin/env python3
from pathlib import Path

OLD = """      if(body.status===\"running\" && rec.run) body.run = rec.run;\n      if(Array.isArray(rec.missed)) body.missed=rec.missed;\n      if(rec.ok!=null) body.ok=rec.ok;\n      if(rec.n!=null) body.n=rec.n;"""

NEW = """      if(body.status===\"running\" && rec.run) body.run = rec.run;\n      if(rec.ok!=null) body.ok=rec.ok;\n      if(rec.n!=null) body.n=rec.n;"""

OLD_TRIES = "      const tries=body.status===\"done\"?2:0;"
NEW_TRIES = "      const tries=body.status===\"done\"?4:0;"

OLD_TO = "      const timer=setTimeout(()=>{ try{ if(ctrl) ctrl.abort(); }catch(e){} }, 9000);"
NEW_TO = "      const timer=setTimeout(()=>{ try{ if(ctrl) ctrl.abort(); }catch(e){} }, 15000);"

OLD_CONF = """    async function confirmCloud(rec){\n      for(let i=0;i<4;i++){\n        try{\n          await upsertLock(rec);\n          const list=await pullList();\n          const got=(list||[]).find(x=>x && recKey(x)===recKey(rec));\n          if(got && got.status!==\"running\" && Number(got.percent||0)>=Number(rec.percent||0)){\n            remoteLocks=mergeCloud(remoteLocks||[], [got]);\n            return true;\n          }\n        }catch(e){}\n        await sleep(700);\n      }\n      return false;\n    }"""

NEW_CONF = """    async function confirmCloud(rec){\n      const slim=Object.assign({}, rec);\n      delete slim.missed;\n      delete slim.run;\n      for(let i=0;i<5;i++){\n        try{\n          const ok=await upsertLock(slim);\n          const list=await pullList();\n          const got=(list||[]).find(x=>x && recKey(x)===recKey(slim));\n          if(got && got.status!==\"running\" && Number(got.percent||0)>=Number(slim.percent||0)){\n            remoteLocks=mergeCloud(remoteLocks||[], [got]);\n            return true;\n          }\n          if(ok){\n            remoteLocks=mergeCloud(remoteLocks||[], [slim]);\n            return true;\n          }\n        }catch(e){}\n        await sleep(800);\n      }\n      return false;\n    }"""

def patch(text: str) -> str:
    text = text.replace(OLD, NEW)
    text = text.replace(OLD_TRIES, NEW_TRIES)
    text = text.replace(OLD_TO, NEW_TO)
    text = text.replace(OLD_CONF, NEW_CONF)
    return text

html_path = Path("_site/index.html")
if html_path.exists():
    html_path.write_text(patch(html_path.read_text()))
    print("patched confirmCloud/writeCloud")
else:
    print("no _site/index.html")
