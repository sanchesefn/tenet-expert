    let eptsVin="";
    let eptsModel="";
    let eptsStep=1;
    let eptsDraft=null;
    let eptsMsg="";
    const EPTS_STAMP_DATA="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCAGpAggDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAQFAgMGAQj/xABBEAABBAIABAQEAwcDAwQABwABAAIDBAUREiExQQYTUWEUInGBMpGhFSNCUrHB0TND8CRi4Qc0cvEWJSY1Y5Ki/8QAGQEBAAMBAQAAAAAAAAAAAAAAAAECAwQF/8QAMhEAAgIBAwEGBQMDBQAAAAAAAAECEQMSITFBEyIyUWFxBIGRobHR4fBSwfEUIyQzQv/aAAwDAQACEQMRAD8A+kUREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBEWqzagpwmazMyGMdXPOglWODai5e144qeaYcdXluy9uEab/laY5fFWUG3iLHxO7D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ElPjpuI3+5eWa37dP0XQLVJWhm/1Imu+oVu0M+ySdohRwXK8TW/EtnIb1kbpxPPmSPstYyFyOM/FY57Tr/Zf5g/z+ikyYxj+MsllY5x3trzyUJ9bNwOHlzxWGjoDyJ+qmKi/IO0zRJkMRWtizNA+GUnXEYHdfXlyCnMzeNLxH8ZG1x6Bx0f1Wls+XZI3zKcbotAOLXEO330N9FhLYlfZcyXDmWNm9SaB2fYFS4J/5K62v8Mmwz0xJI6OZhc87do9dDSi3LmJlfCZrcfEx/ycMmufTt9V7XuveeB2KnhcP+waI9lhM9sDRIzDPe/lotY3fNFHff8AJOrY1tyuJoRyGKaR4BAcGB8h5dFGl8RusODKeGtWiHaDns4Gj32eisXWrbZQyDGSEbHE4kNH/laZos9Ow+Ua9bi+7h/zmrRjG9/yV1S6fgxbJnZydQ1qLfVzvMP5dFHtMrVXPky2VfOw71EDwtA16N6qXBg7pY03MtPK4/ja3QaR6KbBhaMDGsEIeG8xx/NpTrjH9v1ChNnO0rkDHFmDw29/7pbw/cqwGEvZDhdk7fygkmOMaGvT/m10DWNY0Na0NA7AaXqq839Kr7lo4UuWRqmPq0WBsELWa/i1sn7qSiLFtt2zZJLZBERQSEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAf/Z";
    const EPTS_SIGN_DATA="data:image/jpeg;base64,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";
    const EPTS_CC=["Daria.Lukina@tenet.ru","Ejukavina@vip-avto.ru","credit@vip-avto.ru","aleontiev@vip-avto.ru"];
    const EPTS_TO_WORK="Anton.Kokhanov@tenet.ru";
    const EPTS_TO_WEEKEND="team.elpts@chery.ru";
    const EPTS_PREFIX=[
      ["EDELB31","t4l"],["EDEEB31","t4l"],
      ["EDEFB32","t7"],["EDXFB32","t7"],["EDEFD32","t7"],["EDXFD32","t7"],
      ["EDXGB32","t8"],["EDXGD34","t8"],
      ["EDEHD24","tt9"],["EDEDD24","t9"],
      ["LVVDC21","a8"]
    ];
    function eptsCleanVin(v){
      return String(v||"").toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,"").slice(0,17);
    }
    function eptsMoscowNow(){
      const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Moscow",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
      const g=t=>Number(parts.find(p=>p.type===t).value);
      return {y:g("year"),m:g("month"),d:g("day")};
    }
    function eptsUtcDate(y,m,d){ return new Date(Date.UTC(y,m-1,d)); }
    function eptsDow(dt){ return dt.getUTCDay(); }
    function eptsIsWeekend(dt){ const d=eptsDow(dt); return d===0||d===6; }
    function eptsFmt(dt){
      const dd=String(dt.getUTCDate()).padStart(2,"0");
      const mm=String(dt.getUTCMonth()+1).padStart(2,"0");
      return dd+"."+mm+"."+dt.getUTCFullYear();
    }
    function eptsAddDays(dt,n){ const x=new Date(dt.getTime()); x.setUTCDate(x.getUTCDate()+n); return x; }
    function eptsPayBy(issued){
      let d=new Date(issued.getTime());
      if(eptsIsWeekend(d)){
        while(eptsIsWeekend(d)) d=eptsAddDays(d,1);
      }
      let count=1;
      while(count<3){
        d=eptsAddDays(d,1);
        if(!eptsIsWeekend(d)) count++;
      }
      return d;
    }
    function eptsMailPack(draft){
      const weekend=eptsIsWeekend(draft.issuedDt);
      const vin=draft.vin;
      const pay=draft.payBy;
      const line="Прошу согласовать передачу ЭПТС для заключения договора с клиентом. Оплата до "+pay+", отзывных нет, гарантийное письмо во вложении.";
      const who=weekend?"Коллеги, добрый день! ":"Антон, добрый день! ";
      return {
        weekend,
        to: weekend?EPTS_TO_WEEKEND:EPTS_TO_WORK,
        cc: (weekend?[EPTS_TO_WORK]:[]).concat(EPTS_CC).join(", "),
        subj: "ЭКСПЕРТ АВТО САМАРА_ЭПТС VIN "+vin,
        body: who+line+"\n\nVIN "+vin,
        label: weekend?"Выходной · team.elpts@chery.ru":"Рабочий день · Anton.Kokhanov@tenet.ru"
      };
    }
    function eptsLetterName(id, fallback){
      if(id==="t4l") return "TENET Т4L";
      if(id==="t7") return "TENET Т7";
      if(id==="t8") return "TENET Т8";
      if(id==="tt9") return "TENET T9";
      if(id==="t9") return "CHERY Tiggo 9";
      if(id==="a8") return "CHERY Arrizo 8";
      const m=MODELS[id];
      if(m) return m.brand+" "+m.name;
      return fallback||"TENET";
    }
    function eptsLookup(vinRaw){
      const vin=eptsCleanVin(vinRaw);
      if(!vin) return {vin:"", ok:false};
      const stock=(typeof STOCK!=="undefined"?STOCK:[]).find(x=>String(x.vin||"").toUpperCase()===vin);
      if(stock){
        const m=MODELS[stock.model]||{};
        return {
          vin, ok:true, fromStock:true, model:stock.model,
          letter:eptsLetterName(stock.model, (m.brand||"TENET")+" "+(stock.name||"")),
          title:(m.brand||"TENET")+" "+(stock.name||""),
          trim:stock.trim||"", color:stock.color||"", note:stock.note||"", status:stock.status||""
        };
      }
      const pref=EPTS_PREFIX.find(([p])=>vin.startsWith(p));
      if(pref){
        const id=pref[1];
        const m=MODELS[id]||{};
        return {
          vin, ok:true, fromStock:false, model:id,
          letter:eptsLetterName(id),
          title:(m.brand||"")+" "+(m.name||id.toUpperCase()),
          trim:"", color:"", note:"Модель по префиксу VIN, в складе салона нет.", status:""
        };
      }
      if(eptsModel && MODELS[eptsModel]){
        const m=MODELS[eptsModel];
        return {
          vin, ok:vin.length>=11, fromStock:false, model:eptsModel,
          letter:eptsLetterName(eptsModel),
          title:m.brand+" "+m.name,
          trim:"", color:"", note:"Модель указана вручную.", status:""
        };
      }
      return {vin, ok:false, note:"VIN не найден. Выберите модель вручную."};
    }
    function eptsLookupHtml(vinRaw){
      const hit=eptsLookup(vinRaw);
      if(!hit.vin) return `<p class="lead" style="margin-top:12px">17 символов, латиница и цифры. Склад подставит модель сам.</p>`;
      if(!hit.ok && !hit.model){
        return `<div class="epts-found"><b>VIN не распознан</b><span>${escape(hit.note||"Выберите модель чипом ниже.")}</span></div>`;
      }
      const st=hit.status==="in"?"В наличии":hit.status==="way"?"В пути":hit.fromStock?"На складе":"Не на складе";
      return `<div class="epts-found">
        <b>${escape(hit.letter)} · ${escape(hit.vin)}</b>
        <span>${escape([hit.trim, hit.color, st, hit.note].filter(Boolean).join(" · "))}</span>
      </div>`;
    }
    function eptsLoadImg(src){
      return new Promise((resolve,reject)=>{
        const im=new Image();
        im.onload=()=>resolve(im);
        im.onerror=()=>reject(new Error(src));
        im.src=src;
      });
    }
    let eptsStamp=null, eptsSign=null;
    async function eptsEnsureImgs(){
      try{ await document.fonts.ready; }catch(e){}
      try{ await document.fonts.load("28px Tinos"); }catch(e){}
      if(eptsStamp && eptsSign) return;
      const [a,b]=await Promise.all([
        eptsLoadImg("epts/stamp.png").catch(()=>eptsLoadImg("epts/stamp.jpg")).catch(()=>eptsLoadImg(EPTS_STAMP_DATA)),
        eptsLoadImg("epts/sign.png").catch(()=>eptsLoadImg("epts/sign.jpg")).catch(()=>eptsLoadImg(EPTS_SIGN_DATA))
      ]);
      eptsStamp=a; eptsSign=b;
    }
    function eptsWrap(ctx, text, maxW){
      const words=String(text||"").split(/\s+/);
      const lines=[];
      let line="";
      for(const w of words){
        const t=line?line+" "+w:w;
        if(ctx.measureText(t).width<=maxW) line=t;
        else { if(line) lines.push(line); line=w; }
      }
      if(line) lines.push(line);
      return lines;
    }
    function eptsDrawLetter(canvas, draft){
      const W=1240, H=1754;
      canvas.width=W; canvas.height=H;
      const ctx=canvas.getContext("2d");
      ctx.fillStyle="#fff";
      ctx.fillRect(0,0,W,H);
      const L=118, R=W-118, maxW=R-L;
      let y=108;
      ctx.fillStyle="#111";
      ctx.textBaseline="top";
      ctx.textAlign="center";
      ctx.font="700 30px Arial, Helvetica, sans-serif";
      ctx.fillText("Общество с ограниченной ответственностью", W/2, y); y+=42;
      ctx.fillText("«ЭКСПЕРТ АВТО САМАРА»", W/2, y); y+=48;
      ctx.textAlign="left";
      ctx.font="400 22px Arial, Helvetica, sans-serif";
      const addr=[
        "Юридический адрес: 443031, Самарская обл, Самара г, Демократическая ул, влд. 55, оф. 2",
        "Фактический адрес: 443031, Самарская обл, Самара г, Демократическая ул, влд. 55, оф. 2",
        "ИНН: 6312147970",
        "КПП: 631201001",
        "ОГРН: 1156312002989"
      ];
      addr.forEach(line=>{ ctx.fillText(line, L, y); y+=30; });
      y+=8;
      ctx.font="400 26px Tinos, 'Times New Roman', Times, serif";
      ctx.fillText("_________________________________________________________", L, y); y+=44;
      ctx.fillText("Исх. № б/н от "+draft.issued+" г.", L, y); y+=46;
      ctx.textAlign="right";
      ctx.font="400 28px Tinos, 'Times New Roman', Times, serif";
      ctx.fillText("Генеральному директору ООО \"ТЕНЕТ РУС\"", R, y); y+=36;
      ctx.fillText("Яну Хуа", R, y); y+=52;
      ctx.textAlign="center";
      ctx.fillText("Уважаемый Ян Хуа!", W/2, y); y+=52;
      ctx.textAlign="left";
      const body1="Просим Вас направить в наш адрес выписки из ЭПТС для подписания договоров с клиентами на следующие а/м:";
      const firstIndent=70;
      const lines1=eptsWrap(ctx, body1, maxW-firstIndent);
      lines1.forEach((ln,i)=>{
        ctx.fillText(ln, i===0?L+firstIndent:L, y);
        y+=36;
      });
      y+=8;
      ctx.font="700 28px Tinos, 'Times New Roman', Times, serif";
      ctx.fillText(draft.carLine, L, y); y+=44;
      ctx.font="400 28px Tinos, 'Times New Roman', Times, serif";
      const body2="ООО «ЭКСПЕРТ АВТО САМАРА» обязуется оплатить вышеуказанные а/м до "+draft.payBy+" и гарантирует передачу перечисленных а/м конечным покупателям только после проведения сервисных мероприятий и авторизации ЭПТС в системе электронных паспортов.";
      eptsWrap(ctx, body2, maxW).forEach(ln=>{ ctx.fillText(ln, L, y); y+=36; });
      y+=96;
      const signY=y;
      ctx.fillText("Леонтьев А. А. __________", L, signY);
      const nameW=ctx.measureText("Леонтьев А. А. ").width;
      const stampBox=eptsInkBox(eptsStamp);
      const signBox=eptsInkBox(eptsSign);
      const stampSize=196;
      const stampCX=L+nameW+78;
      const stampCY=signY+14;
      if(eptsStamp && stampBox){
        ctx.save();
        ctx.globalAlpha=0.93;
        ctx.drawImage(eptsStamp, stampBox.x, stampBox.y, stampBox.w, stampBox.h,
          Math.round(stampCX-stampSize/2), Math.round(stampCY-stampSize/2), stampSize, stampSize);
        ctx.restore();
      }
      if(eptsSign && signBox){
        const nw=152, nh=nw*(signBox.h/signBox.w);
        ctx.save();
        ctx.translate(stampCX-8, stampCY-4);
        ctx.rotate(-8*Math.PI/180);
        ctx.drawImage(eptsSign, signBox.x, signBox.y, signBox.w, signBox.h, -nw*0.32, -nh*0.42, nw, nh);
        ctx.restore();
      }
      y=signY+Math.max(120, stampSize/2+64);
      ctx.font="700 20px Tinos, 'Times New Roman', Times, serif";
      ctx.fillText("Исполнитель: руководитель отдела продаж Леонтьев А. А.", L, y); y+=28;
      ctx.fillText("Тел.: +7 927 724 92 77", L, y);
    }
    function eptsJpegToPdf(jpeg, w, h){
      const pageW=595, pageH=842;
      const encoder=new TextEncoder();
      const chunks=[];
      const pushStr=s=>chunks.push(encoder.encode(s));
      const pushBytes=u=>chunks.push(u);
      const objects=[];
      const addObj=(bodyBytes)=>{
        objects.push(bodyBytes);
        return objects.length;
      };
      const cat=addObj(encoder.encode("<< /Type /Catalog /Pages 2 0 R >>"));
      const pages=addObj(encoder.encode("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));
      const page=addObj(encoder.encode("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+pageW+" "+pageH+"] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>"));
      const content="q "+pageW+" 0 0 "+pageH+" 0 0 cm /Im0 Do Q\n";
      const contentBytes=encoder.encode(content);
      const stream1=new Uint8Array(encoder.encode("<< /Length "+contentBytes.length+" >>\nstream\n").length+contentBytes.length+encoder.encode("\nendstream").length);
      const h1=encoder.encode("<< /Length "+contentBytes.length+" >>\nstream\n");
      const t1=encoder.encode("\nendstream");
      stream1.set(h1,0); stream1.set(contentBytes,h1.length); stream1.set(t1,h1.length+contentBytes.length);
      const cont=addObj(stream1);
      const imgHead=encoder.encode("<< /Type /XObject /Subtype /Image /Width "+w+" /Height "+h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+jpeg.length+" >>\nstream\n");
      const imgTail=encoder.encode("\nendstream");
      const imgBody=new Uint8Array(imgHead.length+jpeg.length+imgTail.length);
      imgBody.set(imgHead,0); imgBody.set(jpeg,imgHead.length); imgBody.set(imgTail,imgHead.length+jpeg.length);
      const img=addObj(imgBody);
      void cat; void pages; void page; void cont; void img;
      const header=encoder.encode("%PDF-1.4\n");
      const parts=[header];
      let offset=header.length;
      const xref=[0];
      objects.forEach((body,i)=>{
        xref.push(offset);
        const o=encoder.encode((i+1)+" 0 obj\n");
        const e=encoder.encode("\nendobj\n");
        parts.push(o, body, e);
        offset+=o.length+body.length+e.length;
      });
      const xrefStart=offset;
      let xrefStr="xref\n0 "+(objects.length+1)+"\n0000000000 65535 f \n";
      xref.slice(1).forEach(off=>{
        xrefStr+=String(off).padStart(10,"0")+" 00000 n \n";
      });
      xrefStr+="trailer << /Size "+(objects.length+1)+" /Root 1 0 R >>\nstartxref\n"+xrefStart+"\n%%EOF";
      parts.push(encoder.encode(xrefStr));
      let total=0; parts.forEach(p=>total+=p.length);
      const out=new Uint8Array(total);
      let p=0; parts.forEach(b=>{ out.set(b,p); p+=b.length; });
      return out;
    }
    async function eptsBuildPdf(draft){
      await eptsEnsureImgs();
      const canvas=document.createElement("canvas");
      eptsDrawLetter(canvas, draft);
      const dataUrl=canvas.toDataURL("image/jpeg",0.86);
      const bin=atob(dataUrl.split(",")[1]);
      const jpeg=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) jpeg[i]=bin.charCodeAt(i);
      const pdf=eptsJpegToPdf(jpeg, canvas.width, canvas.height);
      const blob=new Blob([pdf],{type:"application/pdf"});
      const url=URL.createObjectURL(blob);
      return {blob,url,bytes:pdf,preview:dataUrl,name:"EPTS-"+draft.vin+"-"+draft.issued.replace(/\./g,"")+".pdf"};
    }
    function eptsB64(bytes){
      let s="", chunk=0x8000;
      for(let i=0;i<bytes.length;i+=chunk){
        s+=String.fromCharCode.apply(null, bytes.subarray(i,i+chunk));
      }
      return btoa(s);
    }
    function eptsFoldB64(s){
      return s.replace(/(.{76})/g,"$1\r\n");
    }
    function eptsBuildEml(draft, pdf){
      const mail=eptsMailPack(draft);
      const to=draft.to||mail.to;
      const cc=draft.cc||mail.cc;
      const subj=draft.subj||mail.subj;
      const body=(draft.body||mail.body).replace(/\n/g,"\r\n");
      const filename=pdf.name;
      const bound="=_epts_"+Date.now().toString(36);
      const b64=eptsFoldB64(eptsB64(pdf.bytes));
      const eml=[
        "X-Unsent: 1",
        "MIME-Version: 1.0",
        "To: "+to,
        "Cc: "+cc,
        "Subject: =?UTF-8?B?"+btoa(unescape(encodeURIComponent(subj)))+"?=",
        "Content-Type: multipart/mixed; boundary=\""+bound+"\"",
        "",
        "--"+bound,
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        body,
        "--"+bound,
        "Content-Type: application/pdf; name=\""+filename+"\"",
        "Content-Transfer-Encoding: base64",
        "Content-Disposition: attachment; filename=\""+filename+"\"",
        "",
        b64,
        "--"+bound+"--"
      ].join("\r\n");
      return new Blob([eml],{type:"message/rfc822"});
    }
    function eptsDownload(blob, name){
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download=name;
      document.body.appendChild(a);
      a.click();
      setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    }
    function eptsMailto(draft){
      const mail=eptsMailPack(draft);
      const to=encodeURIComponent(draft.to||mail.to);
      const cc=encodeURIComponent(draft.cc||mail.cc);
      const subj=encodeURIComponent(draft.subj||mail.subj);
      const body=encodeURIComponent(draft.body||mail.body);
      return "mailto:"+to+"?cc="+cc+"&subject="+subj+"&body="+body;
    }
    function eptsGrabMail(draft){
      const toEl=document.getElementById("eptsTo");
      const ccEl=document.getElementById("eptsCc");
      const subEl=document.getElementById("eptsSubj");
      const bodyEl=document.getElementById("eptsBody");
      if(toEl) draft.to=toEl.value.trim();
      if(ccEl) draft.cc=ccEl.value.trim();
      if(subEl) draft.subj=subEl.value.trim();
      if(bodyEl) draft.body=bodyEl.value;
      return draft;
    }
    async function eptsMakeDraft(){
      const hit=eptsLookup(eptsVin);
      if(!hit.vin || hit.vin.length<11) throw new Error("Введите VIN — не короче 11 символов.");
      if(!hit.ok && !hit.model) throw new Error("VIN не распознан. Выберите модель чипом.");
      const msk=eptsMoscowNow();
      const issuedDt=eptsUtcDate(msk.y,msk.m,msk.d);
      const payDt=eptsPayBy(issuedDt);
      const draft={
        vin:hit.vin,
        model:hit.model||eptsModel,
        letter:hit.letter,
        carLine:hit.letter+" "+hit.vin,
        issued:eptsFmt(issuedDt),
        payBy:eptsFmt(payDt),
        issuedDt, payDt,
        hit
      };
      const pdf=await eptsBuildPdf(draft);
      draft.pdf=pdf;
      const mail=eptsMailPack(draft);
      draft.to=mail.to;
      draft.cc=mail.cc;
      draft.subj=mail.subj;
      draft.body=mail.body;
      draft.weekend=mail.weekend;
      draft.mailLabel=mail.label;
      return draft;
    }
    function eptsStepClass(n){
      if(eptsStep===n) return "is-on";
      if(eptsStep>n) return "is-done";
      return "is-wait";
    }
    function epts(){
      if(needAuth()) return login();
      const hit=eptsLookup(eptsVin);
      const d=eptsDraft;
      const step1body = eptsStep===1 ? `<div class="epts-body">
        <label class="field" style="max-width:none;margin-top:0"><span>VIN</span>
          <input id="eptsVin" class="epts-vin" maxlength="17" placeholder="EDEFB32B4TE105370" value="${escape(eptsVin)}" autocomplete="off" list="eptsVinList" />
        </label>
        <datalist id="eptsVinList">${(STOCK||[]).map(x=>`<option value="${escape(x.vin)}">${escape(x.name)} ${escape(x.trim||"")} · ${escape(x.color||"")}</option>`).join("")}</datalist>
        <div id="eptsLookup">${eptsLookupHtml(eptsVin)}</div>
        <div class="study-pick" style="margin-top:12px">
          ${Object.values(MODELS).map(m=>`<button class="chip ${eptsModel===m.id?"on":""}" type="button" data-epts-model="${m.id}">${escape(m.brand)} ${escape(m.name)}</button>`).join("")}
        </div>
        ${eptsMsg?`<p id="loginErr" style="color:var(--primary);font-size:13px">${escape(eptsMsg)}</p>`:""}
        <div class="who-line">
          <button class="btn ivory" id="eptsBuild" type="button">Собрать письмо</button>
        </div>
      </div>` : (d?`<div class="epts-body"><div class="epts-found"><b>${escape(d.carLine)}</b><span>Можно вернуться и поправить VIN.</span></div>
        <div class="who-line"><button class="btn ghost" id="eptsBack1" type="button">Изменить VIN</button></div></div>`:"");
      const step2body = eptsStep>=2 && d ? `<div class="epts-body">
        <div class="epts-meta">
          <div class="card"><h4>Исх. б/н</h4><b>${escape(d.issued)}</b><p class="lead" style="margin-top:6px">Сегодня по Москве. Так стоит в шапке письма.</p></div>
          <div class="card"><h4>Оплатить до</h4><b>${escape(d.payBy)}</b><p class="lead" style="margin-top:6px">3 рабочих дня включая сегодня. Выходные не считаются: с пятницы срок падает на вторник.</p></div>
          <div class="card"><h4>Авто</h4><b>${escape(d.letter)}</b><p class="lead" style="margin-top:6px">${escape(d.vin)}</p></div>
        </div>
        <div class="epts-sheet-wrap">
          <img alt="Гарантийное письмо PDF" src="${d.pdf.preview}" />
        </div>
        <div class="who-line">
          <button class="btn ivory" id="eptsDlPdf" type="button">Скачать PDF</button>
          ${eptsStep===2?`<button class="btn ghost" id="eptsOkPdf" type="button">Да, даты и данные верные</button>`:""}
        </div>
      </div>` : (eptsStep===2?`<div class="epts-body"><p class="lead">Сначала соберите письмо на шаге 1.</p></div>`:"");
      const step3body = eptsStep===3 && d ? `<div class="epts-body">
        <div class="epts-ok"><b>${escape(d.mailLabel||(d.weekend?"Выходной":"Рабочий день"))}.</b> Кому, копия, тема и текст уже собраны. Браузер не кладёт PDF в Outlook сам — кнопка ниже скачает письмо .eml уже с вложением.</div>
        <div class="card" style="margin-top:12px">
          <label class="field" style="max-width:none;margin-top:0"><span>Кому</span>
            <input id="eptsTo" value="${escape(d.to||"")}" />
          </label>
          <label class="field" style="max-width:none"><span>Копия</span>
            <input id="eptsCc" value="${escape(d.cc||"")}" />
          </label>
          <label class="field" style="max-width:none"><span>Тема</span>
            <input id="eptsSubj" value="${escape(d.subj||"")}" />
          </label>
          <label class="field" style="max-width:none"><span>Текст</span>
            <textarea id="eptsBody" rows="5">${escape(d.body||"")}</textarea>
          </label>
          <div class="epts-mail">
            <span class="eyebrow" style="margin:10px 0 0">Вложение</span>
            <code>${escape(d.pdf.name)}</code>
          </div>
        </div>
        <div class="who-line">
          <button class="btn ivory" id="eptsOutlook" type="button">Открыть в Outlook (.eml)</button>
          <button class="btn ghost" id="eptsDlPdf2" type="button">Скачать PDF</button>
          <button class="btn ghost" id="eptsMailto" type="button">Письмо без вложения</button>
        </div>
        <p class="lead">Файл .eml открывается в Outlook как неотправленное письмо с PDF, адресами и текстом. Если система спросит программу — выберите Outlook.</p>
      </div>` : (eptsStep<3?`<div class="epts-body"><p class="lead">После проверки PDF — отправка.</p></div>`:"");
      return banner("Заказ ЭПТС","Гарантийное письмо импортёру","ЭПТС")+`
        <p class="lead">Три шага: VIN, проверка готового PDF, отправка. Печать и подпись Леонтьева уже в бланке. Даты считает календарь рабочих дней Москвы.</p>
        <div class="epts-steps">
          <section class="epts-step ${eptsStepClass(1)}">
            <div class="epts-head"><span class="epts-n">1</span><div><h3>Модель и VIN</h3><p>Менеджер вводит VIN. Модель подставляется со склада.</p></div></div>
            ${step1body}
          </section>
          <section class="epts-step ${eptsStepClass(2)}">
            <div class="epts-head"><span class="epts-n">2</span><div><h3>Проверь даты и данные в PDF</h3><p>Готовое гарантийное письмо по бланку салона.</p></div></div>
            ${step2body}
          </section>
          <section class="epts-step ${eptsStepClass(3)}">
            <div class="epts-head"><span class="epts-n">3</span><div><h3>Отправить запрос</h3><p>Будни — Коханову, выходные — Chery ELPTS. PDF во вложении через .eml.</p></div></div>
            ${step3body}
          </section>
        </div>
        <div class="who-line">
          <button class="btn ghost" data-go="hub" type="button">В кабинет</button>
          <button class="btn ghost" data-go="stock" type="button">Склад</button>
        </div>`;
    }
    function eptsBind(){
      const vinEl=document.getElementById("eptsVin");
      if(vinEl){
        vinEl.oninput=()=>{
          eptsVin=eptsCleanVin(vinEl.value);
          if(vinEl.value!==eptsVin){ const c=vinEl.selectionStart; vinEl.value=eptsVin; try{ vinEl.setSelectionRange(c,c);}catch(e){} }
          const box=document.getElementById("eptsLookup");
          if(box) box.innerHTML=eptsLookupHtml(eptsVin);
        };
      }
      document.querySelectorAll("[data-epts-model]").forEach(b=>b.onclick=()=>{
        eptsModel=b.dataset.eptsModel;
        eptsMsg="";
        view="epts"; render();
        const el=document.getElementById("eptsVin"); if(el){ el.focus(); el.value=eptsVin; }
      });
      const build=document.getElementById("eptsBuild");
      if(build) build.onclick=async()=>{
        eptsMsg="";
        build.disabled=true; build.textContent="Собираю PDF…";
        try{
          eptsVin=eptsCleanVin((document.getElementById("eptsVin")||{}).value||eptsVin);
          if(eptsDraft && eptsDraft.pdf && eptsDraft.pdf.url){ try{ URL.revokeObjectURL(eptsDraft.pdf.url);}catch(e){} }
          eptsDraft=await eptsMakeDraft();
          eptsStep=2;
          view="epts"; render();
        }catch(err){
          eptsMsg=err.message||String(err);
          view="epts"; render();
        }
      };
      const back1=document.getElementById("eptsBack1");
      if(back1) back1.onclick=()=>{ eptsStep=1; view="epts"; render(); };
      const ok=document.getElementById("eptsOkPdf");
      if(ok) ok.onclick=()=>{ eptsStep=3; view="epts"; render(); };
      const dl=document.getElementById("eptsDlPdf");
      const dl2=document.getElementById("eptsDlPdf2");
      const savePdf=()=>{ if(eptsDraft&&eptsDraft.pdf) eptsDownload(eptsDraft.pdf.blob, eptsDraft.pdf.name); };
      if(dl) dl.onclick=savePdf;
      if(dl2) dl2.onclick=savePdf;
      ["eptsTo","eptsCc","eptsSubj","eptsBody"].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.oninput=()=>{ if(eptsDraft) eptsGrabMail(eptsDraft); };
      });
      const em=document.getElementById("eptsOutlook");
      if(em) em.onclick=()=>{
        if(!eptsDraft||!eptsDraft.pdf) return;
        eptsGrabMail(eptsDraft);
        const eml=eptsBuildEml(eptsDraft, eptsDraft.pdf);
        eptsDownload(eml, eptsDraft.pdf.name.replace(/\.pdf$/i,"")+".eml");
      };
      const mt=document.getElementById("eptsMailto");
      if(mt) mt.onclick=()=>{
        if(!eptsDraft) return;
        eptsGrabMail(eptsDraft);
        location.href=eptsMailto(eptsDraft);
      };
    }
