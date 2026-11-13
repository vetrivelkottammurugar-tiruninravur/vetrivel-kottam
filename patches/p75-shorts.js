/* =====================================================================
   v10 SHORTS MAKER — photos/text → vertical video with AI voice + original music (15 / 30 / 60 s)
   · automatic length limit + cut for every video that enters Create & share
   ===================================================================== */
(function(){
'use strict';
const X=window.PX10;if(!X||!X.core)return;const {mod,setG,tx,E,$q,addDict,sleep,have}=X;
const W=720,H=1280,LIMITS=[15,30,60,90,180];
const vidMax=()=>Math.max(5,Math.min(180,+DEV.get().vidMax||30));
X.vidMax=vidMax;
const pickMime=()=>['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(t=>{try{return MediaRecorder.isTypeSupported(t);}catch(e){return false;}})||'';
/* ---------- render: slides + caption + audio → file ---------- */
X.renderShort=async function(o){
 const slides=o.slides.map(s=>Object.assign({},s)),total=slides.reduce((a,s)=>a+s.dur,0),cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
 const lg=await (async()=>{try{return await bnLogoImg();}catch(e){return null;}})();
 const nm=(db.settings.templeNameTa&&o.lang==='ta')?db.settings.templeNameTa:db.settings.templeName,shortNm=nm.split(',').slice(-2).join(',').trim();
 const dateTxt=o.date?X.dateStr(X.isoNow(),o.lang==='ta'?'ta':'en'):'';
 function bg(s,p,idx,alpha){x.save();x.globalAlpha=alpha;
  if(s.bmp){const iw=s.bmp.width,ih=s.bmp.height,k=Math.max(W/iw,H/ih)*(1+.09*(idx%2?1-p:p)),w=iw*k,h=ih*k,ox=(W-w)/2+(idx%2?1:-1)*(p-.5)*40,oy=(H-h)/2;x.drawImage(s.bmp,ox,oy,w,h);}
  else{const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,TH.pri);g.addColorStop(1,TH.pri2||TH.pri);x.fillStyle=g;x.fillRect(0,0,W,H);x.globalAlpha=alpha*.08;x.fillStyle='#fff';for(let i=0;i<5;i++){x.beginPath();x.arc(W*(.1+.2*i),H*(i%2?.2:.85),W*.3,0,7);x.fill();}x.globalAlpha=alpha;}
  const sh=x.createLinearGradient(0,H*.45,0,H);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.72)');x.fillStyle=sh;x.fillRect(0,0,W,H);const tp=x.createLinearGradient(0,0,0,H*.2);tp.addColorStop(0,'rgba(0,0,0,.5)');tp.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=tp;x.fillRect(0,0,W,H*.2);x.restore();}
 function caption(s,p,alpha){if(!s.text)return;x.save();x.globalAlpha=alpha*Math.min(1,p*6);x.textAlign='center';x.textBaseline='top';x.shadowColor='rgba(0,0,0,.7)';x.shadowBlur=14;
  const f=s._f||(s._f=fitText(x,s.text,W-110,520,64,30,'800',1.22));x.font=`${f.weight} ${f.sz}px ${BN_FONT}`;x.fillStyle='#fff';const y0=H-250-f.h-(o.ribbon?90:0)+Math.round((1-Math.min(1,p*5))*18);f.lines.forEach((l,i)=>x.fillText(l,W/2,y0+i*f.sz*f.lh));x.restore();}
 function chrome(t){x.save();x.textAlign='center';x.textBaseline='top';
  if(o.logo&&lg){x.beginPath();x.arc(70,78,40,0,7);x.fillStyle='#f2b632';x.fill();x.save();x.beginPath();x.arc(70,78,36,0,7);x.clip();x.fillStyle='#fff';x.fillRect(34,42,72,72);x.drawImage(lg,34,42,72,72);x.restore();}
  x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=8;x.fillStyle='#fff';x.font=`700 26px ${BN_FONT}`;x.textAlign='left';const f=fitText(x,shortNm,W-190,70,26,18,'700',1.25);x.font=`700 ${f.sz}px ${BN_FONT}`;f.lines.forEach((l,i)=>x.fillText(l,124,56+i*f.sz*1.25));
  if(dateTxt){x.textAlign='center';x.shadowBlur=0;x.fillStyle='rgba(0,0,0,.45)';const dw=Math.min(W-60,x.measureText(dateTxt).width+60);x.font=`600 26px ${BN_FONT}`;const w=Math.min(W-60,x.measureText(dateTxt).width+60);rr(W/2-w/2,H-(o.ribbon?150:110),w,50,25);x.fill();x.fillStyle='#fff';x.fillText(dateTxt,W/2,H-(o.ribbon?150:110)+10);}
  if(o.ribbon){x.shadowBlur=0;x.fillStyle='#f2b632';x.fillRect(0,H-70,W,70);x.fillStyle='#3b1c00';x.textAlign='center';x.font=`800 30px ${BN_FONT}`;x.fillText(o.lang==='ta'?'வெற்றிவேல் முருகனுக்கு அரோகரா!':'Vetri Vel Muruganukku Arohara!',W/2,H-52);}
  x.restore();}
 const rr=(a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();};
 const starts=[];let acc=0;slides.forEach(s=>{starts.push(acc);acc+=s.dur;});
 function draw(t){let i=0;while(i<slides.length-1&&t>=starts[i]+slides[i].dur)i++;const s=slides[i],p=Math.max(0,Math.min(1,(t-starts[i])/s.dur)),xf=.45,rest=s.dur-(t-starts[i]);
  x.fillStyle='#000';x.fillRect(0,0,W,H);bg(s,p,i,1);if(rest<xf&&slides[i+1]){const n=slides[i+1];bg(n,0,i+1,1-rest/xf);caption(n,0,1-rest/xf);}caption(s,p,rest<xf?rest/xf:1);chrome(t);}
 draw(0);const stream=cv.captureStream(30);let ac=null,src=null;
 if(o.audio){try{ac=new (window.AudioContext||window.webkitAudioContext)({sampleRate:24000});await ac.resume();const dst=ac.createMediaStreamDestination();src=ac.createBufferSource();src.buffer=o.audio;src.connect(dst);dst.stream.getAudioTracks().forEach(tr=>stream.addTrack(tr));}catch(e){ac=null;X.errs.push('short audio: '+e.message);}}
 const mime=pickMime();let rec;try{rec=new MediaRecorder(stream,{mimeType:mime||undefined,videoBitsPerSecond:2200000,audioBitsPerSecond:96000});}catch(e){rec=new MediaRecorder(stream);}
 const ch=[];rec.ondataavailable=e=>e.data&&e.data.size&&ch.push(e.data);const done=new Promise(r=>rec.onstop=r);
 rec.start(500);if(src)src.start();const t0=performance.now();let cancelled=false;X._shCancel=()=>{cancelled=true;};
 await new Promise(res=>{const loop=()=>{const t=(performance.now()-t0)/1000;if(cancelled||t>=total){draw(Math.min(t,total-.001));res();return;}draw(t);if(o.onProgress)o.onProgress(t/total);requestAnimationFrame(loop);};loop();});
 await sleep(250);try{rec.stop();}catch(e){}await done;try{ac&&ac.close();}catch(e){}stream.getTracks().forEach(t=>t.stop());
 if(cancelled)return null;const type=(rec.mimeType||mime||'video/webm').split(';')[0],f=new File([new Blob(ch,{type})],'short_'+X.isoNow()+'.'+(/mp4/.test(type)?'mp4':'webm'),{type});f.pxDur=total;return f;};
/* ---------- cut any video to a limit (used automatically) ---------- */
X.cutVideo=function(file,o){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),v=document.createElement('video');v.playsInline=true;v.src=url;v.preload='auto';let ac=null;const fin=(f,e)=>{try{v.pause();}catch(x){}try{ac&&ac.close();}catch(x){}URL.revokeObjectURL(url);e?reject(e):resolve(f);};
 v.onerror=()=>fin(null,new Error(tx('This phone cannot play that video here.')));
 v.onloadedmetadata=async()=>{try{const vw=v.videoWidth,vh=v.videoHeight,crop=!!o.crop,OW=crop?720:Math.min(vw,1280),OH=crop?1280:Math.round(OW*vh/vw),cv=document.createElement('canvas');cv.width=OW;cv.height=OH;const cx=cv.getContext('2d'),stream=cv.captureStream(30);
  try{ac=new (window.AudioContext||window.webkitAudioContext)();await Promise.race([ac.resume(),sleep(800)]);const s=ac.createMediaElementSource(v),d=ac.createMediaStreamDestination();s.connect(d);d.stream.getAudioTracks().forEach(t=>stream.addTrack(t));}catch(e){}
  const mime=pickMime();let rec;try{rec=new MediaRecorder(stream,{mimeType:mime||undefined,videoBitsPerSecond:2000000,audioBitsPerSecond:96000});}catch(e){rec=new MediaRecorder(stream);}const ch=[];rec.ondataavailable=e=>e.data&&e.data.size&&ch.push(e.data);
  rec.onstop=()=>{const type=(rec.mimeType||mime||'video/webm').split(';')[0],f=new File([new Blob(ch,{type})],'cut_'+Date.now()+'.'+(/mp4/.test(type)?'mp4':'webm'),{type});f.pxDur=o.len;fin(f);};
  v.currentTime=o.start||0;await new Promise(r=>{v.onseeked=r;setTimeout(r,3000);});rec.start(500);try{await v.play();}catch(e){}
  const s0=o.start||0,loop=()=>{const el=v.currentTime-s0;if(crop){const tr=OW/OH;let sw=vw,sh=vw/tr;if(sh>vh){sh=vh;sw=vh*tr;}cx.drawImage(v,(vw-sw)/2,(vh-sh)/2,sw,sh,0,0,OW,OH);}else cx.drawImage(v,0,0,OW,OH);
   if(o.onProgress)o.onProgress(Math.min(1,el/o.len));if(el>=o.len||v.ended){try{v.pause();}catch(e){}try{rec.stop();}catch(e){}return;}requestAnimationFrame(loop);};loop();}catch(e){fin(null,e);}};});};
/* ---------- every video that enters Create & share is checked ---------- */
mod('Video length limit (auto cut)',['PX'],()=>{
 const _sm=PX.setMedia;
 PX.setMedia=async function(file,kind,link){
  if(kind==='video'&&file&&PX.vmeta){let m=null;try{m=await PX.vmeta(file);}catch(e){}const lim=vidMax();
   if(m&&m.dur>lim+.6&&!file.pxCut){return new Promise(res=>{X._cutAsk={file,m,lim,res,link};askCut();});}}
  return _sm.apply(this,arguments);};
 function askCut(){const {file,m,lim}=X._cutAsk,land=m.w>m.h;
  modal(tx('This video is long'),`<div class="warn"><b>${E(X.fmtDur?PX.fmtDur(m.dur):Math.round(m.dur)+' s')}</b> — ${E(tx('longer than your safety limit of'))} <b>${lim} ${E(tx('seconds'))}</b>. ${E(tx('Long videos are often refused by WhatsApp (about 16 MB), do not count as a Short (3 minutes or less), and take a long time to send.'))}</div>
   <label>${E(tx('Start the short part at'))} <b id="pxCutS">0:00</b></label><input type="range" id="pxCutStart" min="0" max="${Math.max(0,Math.floor(m.dur-Math.min(lim,m.dur)))}" value="0" style="width:100%;min-height:30px">
   <label class="chk" style="padding:6px 0"><input type="checkbox" id="pxCutCrop" ${land?'checked':''}> ${E(tx('Crop to upright 9:16 (for Shorts / Reels)'))}</label>
   <div class="menu"><button type="button" class="mi" data-act="pxCutGo">${ico('video')}<span><b>${E(tx('Cut it to'))} ${lim} ${E(tx('seconds'))}</b><div class="mut">${E(tx('The cut is recorded while it plays, so it takes about as long as the cut.'))}</div></span></button><button type="button" class="mi" data-act="pxCutAny">${ico('video')}<span>${E(tx('Use it anyway (not recommended)'))}</span></button><button type="button" class="mi" data-act="pxCutNo">${ico('close')}<span>${E(tx('Cancel'))}</span></button></div>`,null,{bottom:true,noSave:true});}
 document.addEventListener('input',e=>{if(e.target&&e.target.id==='pxCutStart'){const s=$q('#pxCutS');if(s)s.textContent=PX.fmtDur(+e.target.value);}});
 A.pxCutNo=()=>{const c=X._cutAsk;closeModal();if(c)c.res(undefined);X._cutAsk=null;};
 A.pxCutAny=()=>{const c=X._cutAsk;closeModal();if(!c)return;c.file.pxCut=1;_sm.call(PX,c.file,'video',c.link).then(c.res);X._cutAsk=null;};
 A.pxCutGo=async()=>{const c=X._cutAsk;if(!c)return;const start=+($q('#pxCutStart')||{}).value||0,crop=!!($q('#pxCutCrop')||{}).checked;closeModal();X._cutAsk=null;
  ov(`<h3 style="margin:0 0 6px">${E(tx('Cutting the video…'))}</h3><div class="pxbar2"><i id="pxCutB" style="width:0"></i></div><p class="mut" style="margin:0">${E(tx('Keep this screen open.'))}</p>`);
  try{const f=await X.cutVideo(c.file,{start,len:Math.min(c.lim,c.m.dur-start),crop,onProgress:p=>{const b=$q('#pxCutB');if(b)b.style.width=Math.round(p*100)+'%';}});X.ovClose();f.pxCut=1;toast(tx('Done — the video is now')+' '+Math.round(f.pxDur)+' '+tx('seconds'));await _sm.call(PX,f,'video',c.link);c.res();}
  catch(e){X.ovClose();toast(e.message);c.res();}};
 function ov(h){return X.ov(h);}
 /* limit picker inside Create & share */
 if(typeof VIEWS!=='undefined'&&VIEWS.social){const _v=VIEWS.social;VIEWS.social=()=>{let h=_v();if(!h||typeof h!=='string')return h;const lim=vidMax();
   const card=`<div class="card" style="padding:10px 12px"><div class="bar" style="margin:0;align-items:center"><b>${E(tx('Longest video'))}</b>${LIMITS.map(n=>`<button type="button" class="chip${lim===n?' on':''}" data-act="pxVidLim" data-k="${n}">${n} ${E(tx('sec'))}</button>`).join('')}</div><div class="mut" style="font-size:12px;margin-top:4px">${E(tx('Longer videos are cut automatically (you choose the part).'))}</div></div>
   ${X.shortOpen?`<button type="button" class="btn pri block" data-act="pxShortOpen" style="margin:0 8px 8px;width:calc(100% - 16px)">${ico('video','sm')} ${E(tx('Make a Short: photos + text + AI voice + music'))}</button>`:''}`;
   const i=h.indexOf('<div class="card"><h3>'+E(tx('Your post'))+'</h3>');return i>=0?h.slice(0,i)+card+h.slice(i):card+h;};}
 A.pxVidLim=d=>{DEV.set({vidMax:+d.k,pxmax:Math.min(+d.k,+DEV.get().pxmax||60)});render();};
 addDict([['This video is long','இந்த வீடியோ நீளமானது'],['longer than your safety limit of','உங்கள் பாதுகாப்பு வரம்பை விட நீளம்:'],['seconds','விநாடிகள்'],['Cut it to','இதற்கு வெட்டு:'],['Use it anyway (not recommended)','பரவாயில்லை, இப்படியே பயன்படுத்து (பரிந்துரைக்கப்படவில்லை)'],['Cutting the video…','வீடியோவை வெட்டுகிறது…'],['Longest video','நீளமான வீடியோ'],['Longer videos are cut automatically (you choose the part).','நீளமான வீடியோக்கள் தானாக வெட்டப்படும் (பகுதியை நீங்கள் தேர்வு செய்யலாம்).'],['Start the short part at','சிறு பகுதி தொடங்கும் இடம்']]);
});
/* ---------- the Shorts maker screen ---------- */
mod('Shorts maker',['VIEWS','TITLES','A','S','db','go','render','toast','pickFiles','imgToCanvas','fitText','bnLogoImg','BN_FONT','TH'],()=>{
 TITLES.short='Make a Short';try{VIEW_MOD.short='social';}catch(e){}
 const sh=S.sh=S.sh||{slides:[],limit:30,mood:'dawn',voice:false,date:true,logo:true,ribbon:true,vol:.2,lang:'ta',busy:'',prog:0,file:null,url:'',err:''};
 const lim=()=>Math.min(sh.limit,vidMax());
 const mkSlide=(text,bmp,url)=>({id:uid(),text:text||'',bmp:bmp||null,url:url||'',dur:4});
 X.shortOpen=()=>{if(!sh.slides.length)sh.slides=[mkSlide('')];go('short');};
 X.shortFromText=(text,o)=>{o=o||{};sh.lang=o.lang||sh.lang;const parts=String(text||'').split(/(?<=[.!?।])\s+|\n+/).map(s=>s.trim()).filter(s=>s.length>1);const grp=[];let cur='';parts.forEach(p=>{if((cur+' '+p).trim().length>90&&cur){grp.push(cur);cur=p;}else cur=(cur+' '+p).trim();});if(cur)grp.push(cur);
  sh.slides=(grp.length?grp:[String(text||'')]).slice(0,8).map(t=>mkSlide(t));sh.file=null;sh.url='';sh.voice=!!X.ttsKey();sh.txtAll=String(text||'');go('short');};
 X.shortFromAudio=(buf,o)=>{sh._audio=buf;sh.lang=(o&&o.lang)||sh.lang;if(o&&o.text&&!sh.slides.some(s=>s.text)){X.shortFromText(o.text,o);}else go('short');sh.useAudio=true;};
 const chip=(a,k,cur,l)=>`<button type="button" class="chip${cur===k?' on':''}" data-act="${a}" data-k="${k}">${E(l)}</button>`;
 const total=()=>sh.slides.reduce((a,s)=>a+s.dur,0);
 VIEWS.short=()=>{const t=total(),L=lim();
  return `<div class="card"><h3>${E(tx('Slides'))} <span class="tag" style="background:${t>L?'#f6d6d2':'#d4f0dd'}">${Math.round(t)} / ${L} ${E(tx('sec'))}</span></h3>
   ${sh.slides.map((s,i)=>`<div class="arow" style="align-items:flex-start;padding:8px 0"><div style="width:64px;height:92px;border-radius:10px;overflow:hidden;background:linear-gradient(135deg,var(--pri),var(--pri2,var(--pri)));flex:none;position:relative">${s.url?`<img src="${s.url}" alt="" style="width:100%;height:100%;object-fit:cover">`:'<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px">'+(i+1)+'</span>'}</div>
    <div style="flex:1;min-width:0"><textarea data-pxsl="${s.id}" style="min-height:70px" placeholder="${E(tx('Words shown on this slide…'))}">${E(s.text)}</textarea><div class="bar" style="margin:4px 0 0;align-items:center"><span class="mut">${s.dur} ${E(tx('sec'))}</span><button type="button" class="btn sm" data-act="pxSlDur" data-id="${s.id}" data-d="-1">−</button><button type="button" class="btn sm" data-act="pxSlDur" data-id="${s.id}" data-d="1">+</button><button type="button" class="btn sm" data-act="pxSlPhoto" data-id="${s.id}">${ico('camera','sm')}</button>${i?`<button type="button" class="btn sm" data-act="pxSlUp" data-id="${s.id}">↑</button>`:''}<button type="button" class="btn sm bad" data-act="pxSlDel" data-id="${s.id}">✕</button></div></div></div>`).join('')}
   <div class="bar"><button type="button" class="btn" data-act="pxSlAdd">+ ${E(tx('Add a slide'))}</button><button type="button" class="btn" data-act="pxSlPhotos">${ico('photo','sm')} ${E(tx('Add photos'))}</button><button type="button" class="btn" data-act="pxSlFit">${E(tx('Fit to'))} ${L} ${E(tx('sec'))}</button></div></div>
  <div class="card"><h3>${E(tx('Length'))}</h3><div class="chips">${LIMITS.filter(n=>n<=vidMax()).map(n=>chip('pxShLim',String(n),String(sh.limit),n+' '+tx('sec'))).join('')}</div><div class="mut" style="font-size:12px">${E(tx('Your safety limit is'))} ${vidMax()} ${E(tx('seconds'))} (${E(tx('change it in Create & share'))}).</div></div>
  <div class="card"><h3>${E(tx('Sound'))}</h3><label class="chk"><input type="checkbox" data-pxshv ${sh.voice?'checked':''} ${X.ttsKey()?'':'disabled'}> ${E(tx('AI voice reads the slides'))}${X.ttsKey()?'':' <span class="mut">('+E(tx('needs your Gemini key — AI voice & music screen'))+')</span>'}</label>
   <div class="chips" style="margin-top:6px">${chip('pxShLang','ta',sh.lang,'தமிழ்')}${chip('pxShLang','en',sh.lang,'English')}</div>
   <label>${E(tx('Background music (made by the app — no copyright)'))}</label><div class="chips" style="flex-wrap:wrap;overflow:visible">${[['none','No music'],['dawn','Dawn'],['tanpura','Tanpura'],['bells','Bells'],['veena','Veena']].map(m=>chip('pxShMood',m[0],sh.mood,tx(m[1]))).join('')}</div>
   <label class="chk" style="padding:6px 0"><input type="checkbox" data-pxsho="date" ${sh.date?'checked':''}> ${E(tx('Show the date'))}</label><label class="chk" style="padding:6px 0"><input type="checkbox" data-pxsho="logo" ${sh.logo?'checked':''}> ${E(tx('Temple logo & name'))}</label><label class="chk" style="padding:6px 0"><input type="checkbox" data-pxsho="ribbon" ${sh.ribbon?'checked':''}> ${E(tx('Arohara ribbon at the bottom'))}</label></div>
  <div class="bar"><button type="button" class="btn pri" data-act="pxShMake" style="flex:1" ${sh.busy?'disabled':''}>${sh.busy?'<span class="spin"></span>'+E(sh.busy)+' '+Math.round(sh.prog*100)+'%':ico('video','sm')+' '+E(tx('Make the video'))}</button>${sh.busy?`<button type="button" class="btn bad" data-act="pxShCancel">${E(tx('Stop'))}</button>`:''}</div>
  ${sh.busy?`<div class="pxbar2"><i style="width:${Math.round(sh.prog*100)}%"></i></div><p class="mut">${E(tx('The video is recorded while it plays — keep this screen open.'))}</p>`:''}${sh.err?`<div class="warn">${E(sh.err)}</div>`:''}
  ${sh.url?`<div class="card"><h3>${E(tx('Ready'))}</h3><video src="${sh.url}" controls playsinline style="width:100%;max-height:60vh;border-radius:12px;background:#000"></video><div class="mut" style="margin:4px 0">${Math.round(sh.file.pxDur||0)} ${E(tx('sec'))} · ${Math.max(1,Math.round(sh.file.size/1024))} KB · ${E(sh.file.type)}${sh.file.size>16*1048576?' ⚠️ '+E(tx('over about 16 MB — WhatsApp may refuse it')):''}</div>
   <div class="menu"><button type="button" class="mi" data-act="pxShWa">${ico('sms')}<span><b>${E(tx('Send on WhatsApp'))}</b><div class="mut">${E(tx('A group, or one person'))}</div></span></button><button type="button" class="mi" data-act="pxShStudio">${ico('megaphone')}<span>${E(tx('Open in Create & share (YouTube Shorts, Instagram, devotees)'))}</span></button><button type="button" class="mi" data-act="pxShSave">${ico('down')}<span>${E(tx('Save to phone'))}</span></button></div></div>`:''}`;};
 document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.pxsl){const s=sh.slides.find(x=>x.id===t.dataset.pxsl);if(s)s.text=t.value;}});
 document.addEventListener('change',e=>{const t=e.target;if(!t.dataset)return;if('pxshv' in t.dataset){sh.voice=t.checked;}else if(t.dataset.pxsho){sh[t.dataset.pxsho]=t.checked;}});
 const sl=id=>sh.slides.find(s=>s.id===id);
 A.pxSlAdd=()=>{if(sh.slides.length>=10)return toast(tx('Up to 10 slides.'));sh.slides.push(mkSlide(''));render();};
 A.pxSlDel=d=>{sh.slides=sh.slides.filter(s=>s.id!==d.id);if(!sh.slides.length)sh.slides=[mkSlide('')];render();};
 A.pxSlUp=d=>{const i=sh.slides.findIndex(s=>s.id===d.id);if(i>0){const t=sh.slides[i];sh.slides[i]=sh.slides[i-1];sh.slides[i-1]=t;}render();};
 A.pxSlDur=d=>{const s=sl(d.id);s.dur=Math.max(2,Math.min(12,s.dur+(+d.d)));render();};
 A.pxSlFit=()=>{const L=lim(),n=sh.slides.length,per=Math.max(2,Math.min(8,Math.floor(L/n*2)/2));sh.slides.forEach(s=>s.dur=per);render();};
 const addPhoto=async(f,s)=>{const cv=await imgToCanvas(f,1400),bmp=await createImageBitmap(cv);s.bmp=bmp;s.url=cv.toDataURL('image/jpeg',.6);};
 A.pxSlPhoto=d=>{const s=sl(d.id);pickFiles(false,false,async fl=>{try{await addPhoto(fl[0],s);render();}catch(e){toast(e.message);}});};
 A.pxSlPhotos=()=>pickFiles(true,false,async fl=>{try{for(const f of fl.slice(0,10-sh.slides.length+(sh.slides.length===1&&!sh.slides[0].text&&!sh.slides[0].bmp?1:0))){let s=sh.slides.find(x=>!x.bmp&&!x.text);if(!s||sh.slides.length===1&&s&&false){s=mkSlide('');sh.slides.push(s);}await addPhoto(f,s);}render();}catch(e){toast(e.message);}});
 A.pxShLim=d=>{sh.limit=+d.k;render();};A.pxShLang=d=>{sh.lang=d.k;render();};A.pxShMood=d=>{sh.mood=d.k;render();};
 A.pxShCancel=()=>{if(X._shCancel)X._shCancel();};
 A.pxShMake=async()=>{sh.err='';const L=lim();let slides=sh.slides.filter(s=>s.text.trim()||s.bmp);if(!slides.length)return toast(tx('Add some words or a photo first.'));slides=slides.map(s=>Object.assign({},s));
  try{let audio=null,voice=null;
   if(sh.voice&&X.ttsKey()){sh.busy=tx('Making the voice…');sh.prog=0;render();const txt=slides.map(s=>s.text).filter(Boolean).join('\n\n')||sh.txtAll||'';voice=await X.tts(txt,{lang:sh.lang,voice:(X.voiceState&&X.voiceState.voice)||'Kore'});
    if(voice.duration+1>L)throw new Error(tx('The voice is')+' '+Math.round(voice.duration)+' '+tx('seconds — longer than the limit. Shorten the words or raise the length.'));
    const tot=slides.reduce((a,s)=>a+Math.max(1,s.text.length),0),span=voice.duration+1.2;slides.forEach(s=>{s.dur=Math.max(2,span*Math.max(1,s.text.length)/tot);});}
   else if(sh.useAudio&&sh._audio){voice=sh._audio;}
   const tt=slides.reduce((a,s)=>a+s.dur,0);if(tt>L+.01){const k=L/tt;slides.forEach(s=>s.dur=Math.max(1.5,s.dur*k));}
   const dur=slides.reduce((a,s)=>a+s.dur,0);
   if(sh.mood!=='none'||voice){sh.busy=tx('Making the sound…');render();let music=null;if(sh.mood!=='none')music=await X.musicBuffer(sh.mood,dur+2,Date.now()&0xffff);audio=await X.mixAudio(voice,music,{vol:sh.vol,lead:.6,tail:Math.max(.4,dur-(voice?voice.duration:0)-.6)});}
   sh.busy=tx('Recording the video…');sh.prog=0;render();
   const f=await X.renderShort({slides,audio,lang:sh.lang,date:sh.date,logo:sh.logo,ribbon:sh.ribbon,onProgress:p=>{sh.prog=p;const b=document.querySelector('.pxbar2 i');if(b)b.style.width=Math.round(p*100)+'%';}});
   sh.busy='';if(!f){render();return;}if(sh.url)URL.revokeObjectURL(sh.url);sh.file=f;sh.url=URL.createObjectURL(f);render();}
  catch(e){sh.busy='';sh.err=e.message||String(e);if(!/key|Google|voice is/i.test(sh.err))X.errs.push('short: '+(e.stack||e));render();}};
 A.pxShWa=()=>{if(sh.file)X.waTarget({title:'Short video',text:(sh.slides.map(s=>s.text).filter(Boolean).join('\n')).slice(0,300),files:[sh.file]});};
 A.pxShSave=()=>{if(sh.file){X.dl(sh.file);toast(tx('Saved to your phone'));}};
 A.pxShStudio=async()=>{if(!sh.file)return;go('social');await PX.setMedia(sh.file,'video');};
 A.pxShortOpen=()=>X.shortOpen();
 addDict([['Make a Short','சிறு வீடியோ உருவாக்கு'],['Make a Short: photos + text + AI voice + music','சிறு வீடியோ: படங்கள் + உரை + AI குரல் + இசை'],['Slides','ஸ்லைடுகள்'],['Add a slide','ஸ்லைடைச் சேர்'],['Add photos','படங்களைச் சேர்'],['Fit to','பொருத்து:'],['Length','நீளம்'],['Sound','ஒலி'],['AI voice reads the slides','AI குரல் ஸ்லைடுகளைப் படிக்கும்'],['Show the date','தேதியைக் காட்டு'],['Temple logo & name','கோயில் லோகோ & பெயர்'],['Arohara ribbon at the bottom','கீழே அரோகரா பட்டை'],['Make the video','வீடியோவை உருவாக்கு'],['Words shown on this slide…','இந்த ஸ்லைடில் காட்டும் சொற்கள்…']]);
});
})();
/* Create & share: the "WhatsApp group / Status / any app" tile now offers a group or one person */
(function(){const X=window.PX10;if(!X||!X.core)return;
 X.mod('Create & share → WhatsApp chooser',['A','PX'],()=>{
  if(!A.pxSendShare)throw new Error('studio missing');
  A.pxSendShare=()=>{const s=PX.st,cap=(PX.cap('social')||'')+(s.kind==='link'?'\n'+s.link:'');if(!cap.trim()&&!s.file)return toast(X.tx('Write something or add a picture first.'));
   X.waTarget({title:'Create & share',text:cap,files:s.file?[s.file]:[],after:()=>{try{PX.logP&&0;}catch(e){}}});};
 });
})();
