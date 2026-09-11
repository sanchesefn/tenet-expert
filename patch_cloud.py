#!/usr/bin/env python3
"""Serialize rating cloud writes and stop overlapping upserts from dropping exams."""
from pathlib import Path

OLD_UPSERT = '''    async function upsertLock(rec){
      const body = {
        surname:rec.surname, display:rec.display, model:rec.model, exam:rec.exam||1,
        percent:rec.percent, at:rec.at, attempts:rec.attempts||1,
        status: rec.status || "done"
      };
      if(body.status==="running" && rec.run) body.run = rec.run;
      state.locks[lockKey(rec.display, rec.model, rec.exam||1)] = rec;
      state.locks[lockKey(rec.surname, rec.model, rec.exam||1)] = rec;
      save();
      for(let i=0;i<3;i++){
        try{
          const list = await pullList();
          const idx = list.findIndex(x => x && x.surname===body.surname && x.model===body.model && Number(x.exam||1)===Number(body.exam));
          if(idx>=0){
            const prev = list[idx] || {};
            if(prev.status==="done" && body.status==="running"){
              remoteLocks = list;
              syncOk = true;
              return;
            }
            list[idx] = Object.assign({}, prev, body);
            if(body.status==="done") delete list[idx].run;
          } else list.push(body);
          const r = await withTimeout(fetch("https://rentry.co/api/edit/"+CLOUD_ID, {
            method:"POST",
            headers:{"Content-Type":"application/x-www-form-urlencoded"},
            body: cloudForm({edit_code: CLOUD_KEY, text: JSON.stringify(list)})
          }), 10000);
          if(!r.ok) throw new Error("edit");
          const out = await r.json().catch(()=>({status:"200"}));
          if(String(out.status)!=="200") throw new Error("edit status");
          remoteLocks = list;
          syncOk = true;
          return;
        }catch(e){
          if(i===2){ syncOk = false; }
        }
      }
    }'''

NEW_UPSERT = r'''    function recKey(x){
      if(!x) return "";
      if(x.type==="login") return "login|"+norm(x.surname);
      if(x.type==="pass") return "pass|"+norm(x.surname)+"|"+(x.model||"")+"|"+String(x.code||"").toUpperCase();
      if(x.type==="pin_request") return "pin|"+(x.kind||"login")+"|"+norm(x.surname)+"|"+(x.model||"")+"|"+(x.at||"");
      return "exam|"+norm(x.surname)+"|"+(x.model||"")+"|"+String(Number(x.exam||1));
    }
    function isExamRow(x){ return Boolean(x && x.surname && !x.type); }
    function betterExam(a,b){
      if(!a) return b;
      if(!b) return a;
      const ad=a.status!=="running", bd=b.status!=="running";
      if(ad && !bd) return Object.assign({}, a, {status:"done", tgSent:a.tgSent||false});
      if(bd && !ad) return Object.assign({}, b, {status:"done", tgSent:b.tgSent||false});
      const ap=Number(a.percent||0), bp=Number(b.percent||0);
      let win, lose;
      if(bp>ap){ win=b; lose=a; }
      else if(ap>bp){ win=a; lose=b; }
      else { win = String(b.at||"")>=String(a.at||"") ? b : a; lose = win===b?a:b; }
      const out=Object.assign({}, lose, win);
      if(ad || bd) out.status="done";
      if(a.tgSent || b.tgSent) out.tgSent=true;
      if(out.status==="done") delete out.run;
      return out;
    }
    function mergeCloud(base, extra){
      const map=new Map();
      (base||[]).concat(extra||[]).forEach(x=>{
        if(!x) return;
        const k=recKey(x);
        const prev=map.get(k);
        if(!prev) map.set(k, x);
        else if(isExamRow(prev) || isExamRow(x)) map.set(k, betterExam(prev, x));
        else map.set(k, Object.assign({}, prev, x));
      });
      return Array.from(map.values());
    }
    function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }
    let cloudChain = Promise.resolve();
    async function upsertLock(rec){
      const body = {
        surname:rec.surname, display:rec.display, model:rec.model, exam:rec.exam||1,
        percent:rec.percent, at:rec.at, attempts:rec.attempts||1,
        status: rec.status || "done"
      };
      if(body.status==="running" && rec.run) body.run = rec.run;
      if(body.status==="done"){ body.tgSent = false; delete body.run; }
      state.locks[lockKey(rec.display, rec.model, rec.exam||1)] = rec;
      state.locks[lockKey(rec.surname, rec.model, rec.exam||1)] = rec;
      save();
      const job = cloudChain.then(()=>writeCloud(body), ()=>writeCloud(body));
      cloudChain = job.catch(()=>{});
      return job;
    }
    async function writeCloud(body){
      for(let i=0;i<5;i++){
        try{
          const list = mergeCloud(await pullList(), [body]);
          const r = await withTimeout(fetch("https://rentry.co/api/edit/"+CLOUD_ID, {
            method:"POST",
            headers:{"Content-Type":"application/x-www-form-urlencoded"},
            body: cloudForm({edit_code: CLOUD_KEY, text: JSON.stringify(list)})
          }), 12000);
          if(!r.ok) throw new Error("edit");
          const out = await r.json().catch(()=>({status:"200"}));
          if(String(out.status)!=="200") throw new Error("edit status");
          const check = await pullList();
          const got = (check||[]).find(x => recKey(x)===recKey(body));
          if(body.status==="done"){
            if(!got || got.status==="running" || Number(got.percent||0)<Number(body.percent||0)) throw new Error("verify");
          }
          remoteLocks = check;
          syncOk = true;
          return true;
        }catch(e){
          await sleep(500*(i+1));
          if(i===4){ syncOk = false; return false; }
        }
      }
      return false;
    }
    async function flushLocalDone(){
      const locals=Object.values(state.locks||{}).filter(r=>r && recDone(r) && r.surname && r.model && r.percent!=null);
      for(const rec of locals){
        const rem=(remoteLocks||[]).find(x=>isExamRow(x) && x.surname===rec.surname && x.model===rec.model && Number(x.exam||1)===Number(rec.exam||1));
        if(!rem || rem.status==="running" || Number(rem.percent||0)<Number(rec.percent||0)){
          await upsertLock(Object.assign({}, rec, {status:"done"}));
        }
      }
    }'''

OLD_REFRESH = '''    async function refreshLocks(){
      try {
        remoteLocks = await pullList();
        syncOk = true;
      } catch(e) {
        syncOk = false;
        remoteLocks = remoteLocks || [];
      }
    }'''

NEW_REFRESH = '''    async function refreshLocks(){
      try {
        remoteLocks = await pullList();
        syncOk = true;
        await flushLocalDone();
      } catch(e) {
        syncOk = false;
        remoteLocks = remoteLocks || [];
      }
    }'''

OLD_EXAMREC = '''    function remoteExam(n){
      return remoteLocks.find(x => x.surname===norm(state.surname) && x.model===model && Number(x.exam||1)===n);
    }
    function examRec(n){ return remoteExam(n) || localExam(n); }'''

NEW_EXAMREC = '''    function remoteExam(n){
      const rows=(remoteLocks||[]).filter(x => x && !x.type && x.surname===norm(state.surname) && x.model===model && Number(x.exam||1)===n);
      return rows.find(x => recDone(x)) || rows[0];
    }
    function examRec(n){
      const loc=localExam(n), rem=remoteExam(n);
      if(recDone(loc) && (!recDone(rem) || Number(loc.percent||0)>=Number(rem.percent||0))) return loc;
      return rem || loc;
    }'''

OLD_USERRUN = '''      const rem=(remoteLocks||[]).find(x=>x && x.surname===sn && x.status==="running");
      if(!rem) return null;'''

NEW_USERRUN = '''      const rem=(remoteLocks||[]).find(x=>x && !x.type && x.surname===sn && x.status==="running");
      if(!rem) return null;
      const localDone=state.locks[lockKey(rem.surname, rem.model, rem.exam||1)];
      if(recDone(localDone)) return null;'''

REPLACES = [
    ("if(answers[idx]==null) answers[idx]={id:q.id,ok:!!ok,cat:q.cat,p:q.p,x:q.x};\n      persistRun(true);\n      next();",
     "if(answers[idx]==null) answers[idx]={id:q.id,ok:!!ok,cat:q.cat,p:q.p,x:q.x};\n      persistRun(false);\n      next();"),
    ("if(idx+1>=paper.length){ finish(); return; }\n      idx++; selected=[]; locked=false;\n      qDeadline = Date.now() + QSEC*1000;\n      left = QSEC;\n      persistRun(true);",
     "if(idx+1>=paper.length){ finish(); return; }\n      idx++; selected=[]; locked=false;\n      qDeadline = Date.now() + QSEC*1000;\n      left = QSEC;\n      persistRun(false);"),
    ("function next(){ if(idx+1>=paper.length) finish(); else { idx++; selected=[]; locked=false; qDeadline=Date.now()+QSEC*1000; left=QSEC; persistRun(true); render(); } }",
     "function next(){ if(idx+1>=paper.length) finish(); else { idx++; selected=[]; locked=false; qDeadline=Date.now()+QSEC*1000; left=QSEC; persistRun(false); render(); } }"),
    ("await upsertLock(rec);\n        if(state.runs) delete state.runs[sn];",
     "const saved=await upsertLock(rec);\n        if(!saved){ await sleep(1500); await upsertLock(rec); }\n        if(state.runs) delete state.runs[sn];"),
]


def patch(text: str) -> str:
    if OLD_UPSERT not in text:
        raise SystemExit("upsertLock block not found")
    text = text.replace(OLD_UPSERT, NEW_UPSERT, 1)
    if OLD_REFRESH not in text:
        raise SystemExit("refreshLocks not found")
    text = text.replace(OLD_REFRESH, NEW_REFRESH, 1)
    if OLD_EXAMREC not in text:
        raise SystemExit("examRec not found")
    text = text.replace(OLD_EXAMREC, NEW_EXAMREC, 1)
    if OLD_USERRUN not in text:
        raise SystemExit("userRun not found")
    text = text.replace(OLD_USERRUN, NEW_USERRUN, 1)
    for a, b in REPLACES:
        if a not in text:
            raise SystemExit("replace missing: " + a[:60])
        text = text.replace(a, b)
    return text


def main():
    n = 0
    for path in (Path("_site/index.html"), Path("TENET_T4L_netlify/index.html")):
        if not path.exists():
            continue
        src = path.read_text()
        if "function mergeCloud(" in src:
            print(path, "already patched")
            continue
        path.write_text(patch(src))
        print("patched", path, "bytes", path.stat().st_size)
        n += 1
    if n == 0:
        print("no html files patched (ok if already applied)")


if __name__ == "__main__":
    main()
