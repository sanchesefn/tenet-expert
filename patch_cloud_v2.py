#!/usr/bin/env python3
"""V2: never upload in-progress exams, relay-first, rating reads ntfy, paste-code recovery."""
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
        raise SystemExit("not found: " + start_token)
    return src[:i] + new_fn + src[end:]


PERSIST = """function persistRun(syncCloud){
      if(mode!=="exam" || done || !state.surname || !paper.length) return Promise.resolve();
      const sn=norm(state.surname);
      const prev=(state.runs||{})[sn]||{};
      const run={
        surname:sn, display:state.display, model, exam:examSession||1, status:"running",
        paper:compactPaper(), idx, answers, selected,
        qDeadline, startedAt: prev.startedAt || Date.now(), updatedAt: Date.now()
      };
      state.runs = state.runs || {};
      state.runs[sn] = run;
      save();
      return Promise.resolve();
    }"""

PING = """async function pingRelay(body){
      if(body.status!=="done") return false;
      const slim={surname:body.surname,display:body.display,model:body.model,exam:body.exam,percent:body.percent,at:body.at,attempts:body.attempts||1,status:"done"};
      if(body.ok!=null) slim.ok=body.ok;
      if(body.n!=null) slim.n=body.n;
      const payload=JSON.stringify(slim);
      let beamed=false;
      try{
        if(navigator.sendBeacon){
          beamed=!!navigator.sendBeacon(RELAY, new Blob([payload],{type:"application/json"}));
        }
      }catch(e){ beamed=false; }
      try{
        const r=await withTimeout(fetch(RELAY,{
          method:"POST",
          headers:{"Content-Type":"application/json","Title":(slim.display||slim.surname)+" "+slim.model+" "+slim.percent+"%"},
          body:payload,
          keepalive:true
        }),8000);
        return r.ok || beamed;
      }catch(e){ return beamed; }
    }"""

PULLRELAY = """async function pullRelay(){
      try{
        const r=await withTimeout(fetch(RELAY+"/json?poll=1&since=48h",{cache:"no-store"}),6000);
        if(!r.ok) return [];
        const raw=await r.text();
        const recs=[];
        raw.split("\\n").forEach(line=>{
          if(!line.trim()) return;
          try{
            const msg=JSON.parse(line);
            const rec=typeof msg.message==="string"?JSON.parse(msg.message):null;
            if(rec && rec.surname && rec.surname!=="probe" && rec.model && rec.status==="done") recs.push(rec);
          }catch(e){}
        });
        return recs;
      }catch(e){ return []; }
    }"""

PULLLIST = """async function pullList(){
      let base=[];
      let rentryOk=false;
      try{
        const r = await withTimeout(fetch("https://rentry.co/api/fetch/"+CLOUD_ID, {
          method:"POST",
          headers:{"Content-Type":"application/x-www-form-urlencoded"},
          body: cloudForm({edit_code: CLOUD_KEY})
        }), 10000);
        if(!r.ok) throw new Error("api "+r.status);
        const data = await r.json();
        const text = (data && data.content && data.content.text) || (typeof data.content==="string"?data.content:"[]");
        const parsed = JSON.parse(text || "[]");
        base = Array.isArray(parsed) ? parsed : [];
        rentryOk = true;
      }catch(e){ base=[]; }
      const extra = await pullRelay();
      const merged = mergeCloud(base, extra);
      if(!rentryOk && !extra.length) throw new Error("cloud");
      return merged;
    }"""

WRITE = """async function writeCloud(body){
      let relayOk=false;
      if(body.status==="done"){
        try{ relayOk=await pingRelay(body); }catch(e){ relayOk=false; }
      }
      let rentryOk=false;
      const tries=body.status==="done"?2:0;
      for(let i=0;i<tries;i++){
        const ctrl=typeof AbortController==="function"?new AbortController():null;
        const timer=setTimeout(()=>{ try{ if(ctrl) ctrl.abort(); }catch(e){} }, 9000);
        try{
          const list = mergeCloud(await pullList(), [body]);
          const r = await fetch("https://rentry.co/api/edit/"+CLOUD_ID, {
            method:"POST",
            headers:{"Content-Type":"application/x-www-form-urlencoded"},
            body: cloudForm({edit_code: CLOUD_KEY, text: JSON.stringify(list)}),
            signal: ctrl?ctrl.signal:undefined,
            keepalive:true
          });
          if(!r.ok) throw new Error("edit");
          const out = await r.json().catch(()=>({status:"200"}));
          if(String(out.status)!=="200") throw new Error("edit status");
          rentryOk = true;
          break;
        }catch(e){
          await sleep(400*(i+1));
        }finally{
          clearTimeout(timer);
        }
      }
      syncOk = rentryOk || relayOk;
      if(syncOk){
        try{ remoteLocks = mergeCloud(remoteLocks, [body]); }catch(e){}
      }
      return syncOk;
    }"""

FLUSH = """async function flushLocalDone(){
      const seen={};
      function add(rec){
        if(!rec || !rec.surname || !rec.model || rec.percent==null) return;
        const k=norm(rec.surname)+"|"+rec.model+"|"+String(Number(rec.exam||1));
        const prev=seen[k];
        if(!prev || Number(rec.percent||0)>=Number(prev.percent||0)) seen[k]=Object.assign({}, rec, {status:"done"});
      }
      Object.values(state.locks||{}).forEach(add);
      (state.history||[]).forEach(h=>{
        if(!h || h.mode!=="exam" || h.percent==null) return;
        add({surname:norm(state.surname||h.name),display:state.display||h.name,model:h.model,exam:1,percent:h.percent,ok:h.ok,n:h.n,at:h.date,attempts:1,status:"done"});
      });
      if(state.lastCode){
        try{ add(unpackResult(state.lastCode)); }catch(e){}
      }
      for(const rec of Object.values(seen)){
        const rem=(remoteLocks||[]).find(x=>isExamRow(x) && x.surname===norm(rec.surname) && x.model===rec.model && Number(x.exam||1)===Number(rec.exam||1));
        if(!rem || rem.status==="running" || Number(rem.percent||0)<Number(rec.percent||0)){
          await upsertLock(rec);
        }
      }
    }"""

BIND_EXTRA = """function bind(){
      const copyBtn=document.getElementById("copyCode");
      if(copyBtn) copyBtn.onclick=()=>{ try{ navigator.clipboard.writeText(state.lastCode||""); copyBtn.textContent="Скопировано"; }catch(e){} };
      const applyBtn=document.getElementById("applyCode");
      if(applyBtn) applyBtn.onclick=async ()=>{
        const v=((document.getElementById("pasteCode")||{}).value||"").trim();
        try{
          const rec=unpackResult(v);
          if(!rec || !rec.surname || !rec.model) throw new Error("bad");
          await upsertLock(Object.assign({status:"done"}, rec));
          await refreshLocks();
          render();
        }catch(e){ applyBtn.textContent="Код не принят"; }
      };
"""

PASTE_CARD = """<div class="card" style="margin:12px 0"><p class="eyebrow">Код результата с компьютера менеджера</p><input id="pasteCode" placeholder="TENET1...." style="width:100%;margin-top:6px"><button class="btn ivory" id="applyCode" style="margin-top:8px">Зачесть в рейтинг</button></div>"""

COPY_NOTE = (
    '${mode==="exam"?`<p style="margin-top:10px;font-size:14px;color:${syncOk?"#1b7f3a":"#b42318"}">'
    '${syncOk?"Результат отправлен в общий рейтинг и Telegram.":"Отправляю в рейтинг… не закрывайте страницу."}</p>'
    '${state.lastCode?`<p class="eyebrow" style="margin-top:10px">Если у РОП не появилось — скопируйте код и перешлите</p>'
    '<button class="btn ghost" id="copyCode">Скопировать код результата</button>`:""}`:""}'
)


def patch(text: str) -> str:
    if "function pullRelay(" in text:
        return text
    if "const RELAY =" not in text:
        text = text.replace(
            "    let cloudChain = Promise.resolve();",
            '    let cloudChain = Promise.resolve();\n    const RELAY = "https://ntfy.sh/tenet-expert-o6nq7rki";',
            1,
        )
    text = replace_fn(text, "function persistRun(syncCloud)", PERSIST)
    text = replace_fn(text, "async function pingRelay(body)", PING)
    text = replace_fn(text, "async function writeCloud(body)", WRITE)
    text = replace_fn(text, "async function flushLocalDone()", FLUSH)
    if "async function pullRelay(" not in text:
        text = text.replace("    async function pullList(){", PULLRELAY + "\n    async function pullList(){", 1)
    text = replace_fn(text, "async function pullList()", PULLLIST)
    note_old = (
        '<p>${correct} из ${paper.length} · ${escape(state.display)}'
        '${mode==="exam"&&examSession===2&&examRec(1)?" · было "+examRec(1).percent+"%":""}</p>'
    )
    if "copyCode" not in text and note_old in text:
        text = text.replace(note_old, note_old + "\n          " + COPY_NOTE, 1)
    if 'id="pasteCode"' not in text:
        for cand in ("<h1>Рейтинг</h1>", "<h1>Рейтинг аттестаций</h1>", "Рейтинг</h1>"):
            if cand in text:
                text = text.replace(cand, cand + PASTE_CARD, 1)
                break
    if "getElementById(\"copyCode\")" not in text and "function bind(){" in text:
        text = text.replace("function bind(){", BIND_EXTRA, 1)
    if 'http-equiv="Cache-Control"' not in text and "<head>" in text:
        text = text.replace("<head>", '<head>\n<meta http-equiv="Cache-Control" content="no-store">', 1)
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
            print("v2 patched", path, "bytes", path.stat().st_size)
            n += 1
        else:
            print(path, "v2 already")
    print("v2 changed", n)


if __name__ == "__main__":
    main()
