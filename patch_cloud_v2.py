#!/usr/bin/env python3
"""Always patch cloud write: never hang the result screen on rentry/ntfy."""
from pathlib import Path


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
        print("not found:", start_token)
        return src
    return src[:i] + new_fn + src[end:]


PING = r'''async function pingRelay(body){
      if(body.status!=="done") return false;
      const slim={surname:body.surname,display:body.display,model:body.model,exam:body.exam,percent:body.percent,at:body.at,attempts:body.attempts||1,status:"done"};
      if(body.ok!=null) slim.ok=body.ok;
      if(body.n!=null) slim.n=body.n;
      const payload=JSON.stringify(slim);
      let beamed=false;
      try{
        if(navigator.sendBeacon){
          beamed=!!navigator.sendBeacon(RELAY, payload);
        }
      }catch(e){ beamed=false; }
      try{
        await withTimeout(fetch(RELAY,{method:"POST", body:payload, mode:"no-cors"}), 4000);
        return true;
      }catch(e){ return beamed; }
    }'''

WRITE = r'''async function writeCloud(body){
      if(body.status!=="done") return false;
      let relayOk=false;
      try{ relayOk=await pingRelay(body); }catch(e){ relayOk=false; }
      let rentryOk=false;
      try{
        let base=remoteLocks||[];
        try{
          const fresh=await Promise.race([pullList(), sleep(4000).then(()=>null)]);
          if(Array.isArray(fresh) && fresh.length) base=fresh;
        }catch(e){}
        const list=mergeCloud(base, [body]);
        if(!list.length) throw new Error("empty");
        const r=await withTimeout(fetch("https://rentry.co/api/edit/"+CLOUD_ID, {
          method:"POST",
          headers:{"Content-Type":"application/x-www-form-urlencoded"},
          body: cloudForm({edit_code: CLOUD_KEY, text: JSON.stringify(list)})
        }), 6000);
        if(r && r.ok){
          const out=await r.json().catch(()=>({status:"200"}));
          if(String(out.status)==="200") rentryOk=true;
        }
      }catch(e){ rentryOk=false; }
      syncOk = rentryOk || relayOk;
      if(syncOk){
        try{ remoteLocks = mergeCloud(remoteLocks, [body]); if(typeof saveCloudCache==="function") saveCloudCache(remoteLocks); }catch(e){}
      }
      return syncOk;
    }'''

CONFIRM = r'''async function confirmCloud(rec){
      const slim=Object.assign({}, rec, {status:"done"});
      delete slim.missed;
      delete slim.run;
      try{
        const ok=await Promise.race([
          upsertLock(slim),
          sleep(12000).then(()=>false)
        ]);
        if(ok){
          remoteLocks=mergeCloud(remoteLocks||[], [slim]);
          try{ saveCloudCache(remoteLocks); }catch(e){}
          return true;
        }
      }catch(e){}
      return false;
    }'''

FINISH = r'''async function finish(){
      stopTick(); done=true; closing=false;
      const pct=tally();
      const item={id:Date.now().toString(36),name:state.display,model,mode,percent:pct,ok:correct,n:paper.length,date:new Date().toISOString()};
      state.history=[item,...state.history].slice(0,50);
      save();
      if(mode!=="exam"){ render(); return; }
      const n=examSession||1;
      const prev=examRec(n)||{attempts:0};
      if(n===2) delete state.unlock[lockKey(state.surname, model, 2)];
      const rec={surname:norm(state.surname),display:state.display,model,exam:n,percent:pct,ok:correct,n:paper.length,missed:missed.map(r=>({id:r.id,p:r.p,x:r.x,pick:r.pick||[]})),at:item.date,attempts:(prev.attempts||0)+1,status:"done"};
      const sn=norm(state.surname);
      if(state.runs && state.runs[sn]) state.runs[sn].status="done";
      state.lastCode=packResult(rec); save();
      savingCloud=true; cloudVerified=false; syncOk=false;
      render();
      try{
        cloudVerified = await Promise.race([
          confirmCloud(rec),
          sleep(15000).then(()=>false)
        ]);
      }catch(e){ cloudVerified=false; }
      savingCloud=false; syncOk=cloudVerified;
      render();
    }'''

RETRY = '''const retryCloud=document.getElementById("retryCloud");
      if(retryCloud) retryCloud.onclick=async ()=>{
        if(savingCloud) return;
        savingCloud=true; cloudVerified=false; render();
        let rec=null;
        try{ rec=unpackResult(state.lastCode||""); }catch(e){ rec=examRec(examSession||1); }
        if(rec){ rec.status="done"; cloudVerified=await confirmCloud(rec); }
        savingCloud=false; syncOk=cloudVerified; render();
      };
      const copyBtn=document.getElementById("copyCode");'''


def patch(text: str) -> str:
    if "const RELAY =" not in text:
        text = text.replace(
            "    let cloudChain = Promise.resolve();",
            '    let cloudChain = Promise.resolve();\n    const RELAY = "https://ntfy.sh/tenet-expert-o6nq7rki";',
            1,
        )
    text = replace_fn(text, "async function pingRelay(body)", PING)
    text = replace_fn(text, "async function writeCloud(body)", WRITE)
    if "async function confirmCloud(" in text:
        text = replace_fn(text, "async function confirmCloud(rec)", CONFIRM)
    else:
        text = text.replace("    async function finish(){", CONFIRM + "\n    async function finish(){", 1)
    text = replace_fn(text, "async function finish()", FINISH)
    if 'retryCloud.onclick=()=>finish()' in text:
        text = text.replace(
            'const retryCloud=document.getElementById("retryCloud");\n      if(retryCloud) retryCloud.onclick=()=>finish();\n      const copyBtn=document.getElementById("copyCode");',
            RETRY,
            1,
        )
    elif 'id="retryCloud"' in text and "confirmCloud(rec)" not in text.split("retryCloud")[1][:400]:
        text = text.replace(
            'const copyBtn=document.getElementById("copyCode");',
            RETRY,
            1,
        )
    return text


def main():
    n = 0
    for path in (Path("_site/index.html"),):
        if not path.exists():
            continue
        src = path.read_text()
        out = patch(src)
        if out != src:
            path.write_text(out)
            print("v2 patched", path, "bytes", path.stat().st_size)
            n += 1
        else:
            print(path, "v2 already")
    print("v2 changed", n)


if __name__ == "__main__":
    main()
