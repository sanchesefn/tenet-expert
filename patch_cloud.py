#!/usr/bin/env python3
"""Serialize rating cloud writes so exam results are not overwritten."""
from pathlib import Path

NEW_UPSERT = r'''async function upsertLock(rec){
      const body = {
        surname:rec.surname, display:rec.display, model:rec.model, exam:rec.exam||1,
        percent:rec.percent, at:rec.at, attempts:rec.attempts||1,
        status: rec.status || "done"
      };
      if(body.status==="running" && rec.run) body.run = rec.run;
      if(Array.isArray(rec.missed)) body.missed=rec.missed;
      if(rec.ok!=null) body.ok=rec.ok;
      if(rec.n!=null) body.n=rec.n;
      if(body.status==="done"){ if(body.tgSent==null) body.tgSent=false; delete body.run; }
      state.locks[lockKey(rec.display, rec.model, rec.exam||1)] = rec;
      state.locks[lockKey(rec.surname, rec.model, rec.exam||1)] = rec;
      save();
      const job = cloudChain.then(()=>writeCloud(body), ()=>writeCloud(body));
      cloudChain = job.catch(()=>{});
      return job;
    }
    function recKey(x){
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
      if(ad && !bd) return Object.assign({}, a, {status:"done"});
      if(bd && !ad) return Object.assign({}, b, {status:"done"});
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
    const RELAY = "https://ntfy.sh/tenet-expert-o6nq7rki";
    async function pingRelay(body){
      if(body.status!=="done") return false;
      const slim={surname:body.surname,display:body.display,model:body.model,exam:body.exam,percent:body.percent,at:body.at,attempts:body.attempts||1,status:"done"};
      if(body.ok!=null) slim.ok=body.ok;
      if(body.n!=null) slim.n=body.n;
      const r=await withTimeout(fetch(RELAY,{
        method:"POST",
        headers:{"Content-Type":"application/json","Title":(slim.display||slim.surname)+" "+slim.model+" "+slim.percent+"%"},
        body:JSON.stringify(slim)
      }),8000);
      return r.ok;
    }
    async function writeCloud(body){
      let rentryOk=false;
      const tries=body.status==="done"?3:1;
      for(let i=0;i<tries;i++){
        try{
          const list = mergeCloud(await pullList(), [body]);
          const r = await withTimeout(fetch("https://rentry.co/api/edit/"+CLOUD_ID, {
            method:"POST",
            headers:{"Content-Type":"application/x-www-form-urlencoded"},
            body: cloudForm({edit_code: CLOUD_KEY, text: JSON.stringify(list)})
          }), 10000);
          if(!r.ok) throw new Error("edit");
          const out = await r.json().catch(()=>({status:"200"}));
          if(String(out.status)!=="200") throw new Error("edit status");
          const check = await pullList();
          const got = (check||[]).find(x => recKey(x)===recKey(body));
          if(body.status==="done"){
            if(!got || got.status==="running" || Number(got.percent||0)<Number(body.percent||0)) throw new Error("verify");
          }
          remoteLocks = check;
          rentryOk = true;
          break;
        }catch(e){
          await sleep(400*(i+1));
        }
      }
      let relayOk=false;
      if(body.status==="done"){
        try{ relayOk=await pingRelay(body); }catch(e){ relayOk=false; }
      }
      syncOk = rentryOk || relayOk;
      return syncOk;
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

NEW_REFRESH = '''async function refreshLocks(){
      try {
        remoteLocks = await pullList();
        syncOk = true;
        await flushLocalDone();
      } catch(e) {
        syncOk = false;
        remoteLocks = remoteLocks || [];
      }
    }'''

NEW_REMOTE = '''function remoteExam(n){
      const rows=(remoteLocks||[]).filter(x => x && !x.type && x.surname===norm(state.surname) && x.model===model && Number(x.exam||1)===n);
      return rows.find(x => recDone(x)) || rows[0];
    }'''

NEW_EXAMREC = '''function examRec(n){
      const loc=localExam(n), rem=remoteExam(n);
      if(recDone(loc) && (!recDone(rem) || Number(loc.percent||0)>=Number(rem.percent||0))) return loc;
      return rem || loc;
    }'''


def extract_fn(src, start_token):
    i = src.find(start_token)
    if i < 0:
        return None, -1, -1
    b = src.find("{", i)
    depth = 0
    for j in range(b, len(src)):
        ch = src[j]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return src[i : j + 1], i, j + 1
    return None, i, -1


def replace_fn(src, start_token, new_fn):
    body, i, end = extract_fn(src, start_token)
    if body is None:
        raise SystemExit("not found: " + start_token)
    return src[:i] + new_fn + src[end:]


def patch(text: str) -> str:
    if "function pingRelay(" not in text:
        if "function mergeCloud(" in text:
            text = replace_fn(text, "async function writeCloud(body)", extract_fn(NEW_UPSERT, "async function writeCloud(body)")[0])
            if "function pingRelay(" not in text:
                ping = extract_fn(NEW_UPSERT, "async function pingRelay(body)")[0]
                text = text.replace("    async function writeCloud(body){", ping + "\n    async function writeCloud(body){", 1)
            if 'const RELAY =' not in text:
                text = text.replace(
                    "    let cloudChain = Promise.resolve();",
                    "    let cloudChain = Promise.resolve();\n    const RELAY = \"https://ntfy.sh/tenet-expert-o6nq7rki\";",
                    1,
                )
        else:
            text = replace_fn(text, "async function upsertLock(rec)", NEW_UPSERT)
            text = replace_fn(text, "async function refreshLocks()", NEW_REFRESH)
            text = replace_fn(text, "function remoteExam(n)", NEW_REMOTE)
            text = replace_fn(text, "function examRec(n)", NEW_EXAMREC)
            old_rem = 'const rem=(remoteLocks||[]).find(x=>x && x.surname===sn && x.status==="running");\n      if(!rem) return null;'
            new_rem = 'const rem=(remoteLocks||[]).find(x=>x && !x.type && x.surname===sn && x.status==="running");\n      if(!rem) return null;\n      const localDone=state.locks[lockKey(rem.surname, rem.model, rem.exam||1)];\n      if(recDone(localDone)) return null;'
            if old_rem not in text:
                raise SystemExit("userRun rem line not found")
            text = text.replace(old_rem, new_rem, 1)
            text = text.replace(
                "        await upsertLock(rec);\n        if(state.runs) delete state.runs[sn];",
                "        const saved=await upsertLock(rec);\n        if(!saved){ await sleep(1500); await upsertLock(rec); }\n        if(state.runs) delete state.runs[sn];",
                1,
            )
            text = text.replace("left = QSEC;\n      persistRun(true);", "left = QSEC;\n      persistRun(false);")
            text = text.replace("persistRun(true);\n      next(); closing=", "persistRun(false);\n      next(); closing=")
            text = text.replace(
                "left=QSEC; persistRun(true); render(); } }",
                "left=QSEC; persistRun(false); render(); } }",
            )
    note_old = '<p>${correct} из ${paper.length} · ${escape(state.display)}${mode==="exam"&&examSession===2&&examRec(1)?" · было "+examRec(1).percent+"%":""}</p>'
    note_new = note_old + '\n          ${mode==="exam"?`<p style="margin-top:10px;font-size:14px;color:${syncOk?"#1b7f3a":"#b42318"}">${syncOk?"Результат отправлен в общий рейтинг и Telegram.":"Отправляю в рейтинг… не закрывайте страницу."}</p>`:""}'
    if note_old in text and "общий рейтинг и Telegram" not in text:
        text = text.replace(note_old, note_new, 1)
    return text


def main():
    n = 0
    for path in (Path("_site/index.html"), Path("TENET_T4L_netlify/index.html")):
        if not path.exists():
            continue
        src = path.read_text()
        out = patch(src)
        if out != src:
            path.write_text(out)
            print("patched", path, "bytes", path.stat().st_size)
            n += 1
        else:
            print(path, "already patched")
    if n == 0:
        print("no html files changed")


if __name__ == "__main__":
    main()
