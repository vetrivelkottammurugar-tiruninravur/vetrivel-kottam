/* =====================================================================
   v10 SEND — one-tap batch sending (automatic via WhatsApp Business API, or guided queue) · Alerts one-tap + edit + voice
   · "Share to WhatsApp" chooser (group or one person)
   ===================================================================== */
(function(){
'use strict';
const X=window.PX10;if(!X||!X.core)return;const {mod,setG,tx,E,$q,addDict,sleep,have}=X;
const css=document.createElement('style');css.textContent='.pxov{position:fixed;inset:0;z-index:265;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}.pxov .box{background:#fff;border-radius:22px 22px 0 0;width:100%;max-width:560px;max-height:92vh;overflow:auto;padding:14px 16px calc(14px + var(--sab,0px))}@media(min-width:700px){.pxov{align-items:center}.pxov .box{border-radius:18px}}.pxbar2{height:10px;border-radius:5px;background:var(--bd,#eadfcb);overflow:hidden;margin:8px 0}.pxbar2 i{display:block;height:100%;background:var(--pri,#8c2410);width:0;transition:width .3s}.pxbig{width:100%;min-height:64px;font-size:calc(18px*var(--fs,1))!important;font-weight:700}';document.head.appendChild(css);
const autoOn=()=>{try{return !!(GAS.on()&&S.cenAuto&&S.cenAuto.p&&S.cenAuto.p!=='none');}catch(e){return false;}};
const cfg=()=>Object.assign({batch:10,pause:4},DEV.get().sendCfg||{});
X.greetName=(v,lc)=>v.name;
function ov(html){let o=document.getElementById('pxov');if(!o){o=document.createElement('div');o.id='pxov';o.className='pxov';document.body.appendChild(o);try{S.vOpen=true;}catch(e){}}o.innerHTML='<div class="box">'+html+'</div>';return o;}
function ovClose(){const o=document.getElementById('pxov');if(o)o.remove();try{S.vOpen=false;}catch(e){}}
X.ovClose=ovClose;X.ov=ov;
/* =========== automatic sending in batches =========== */
X.apiRun=async function(o){
 const st={total:o.items.length,done:0,sent:0,failed:0,skipped:0,rate:0,stop:false,paused:false,fails:[],t0:Date.now(),note:''};X._run=st;const c=cfg(),B=o.batch||c.batch,P=(o.pause==null?c.pause:o.pause)*1000;
 const draw=(fin)=>{const pc=st.total?Math.round(st.done/st.total*100):0;
  ov(`<h3 style="margin:0 0 6px">${E(o.title||tx('Sending'))}</h3><div class="mut">${st.done} / ${st.total} · ✅ ${st.sent} · ⏭ ${st.skipped} · ❌ ${st.failed}${st.rate?' · ⏳ '+E(tx('waiting for WhatsApp'))+' '+st.rate:''}</div><div class="pxbar2"><i style="width:${pc}%"></i></div>
   ${st.note?`<p class="mut" style="margin:4px 0">${E(st.note)}</p>`:''}
   ${fin?`${st.fails.length?`<div class="warn" style="max-height:140px;overflow:auto">${st.fails.slice(0,30).map(f=>E(f.name+': '+(f.err||'?'))).join('<br>')}${st.fails.length>30?'<br>…':''}</div>`:''}<div class="bar"><button type="button" class="btn pri" data-act="pxRunClose">${E(tx('Done'))}</button>${st.fails.length&&!st.noRetry?`<button type="button" class="btn" data-act="pxRunRetry">${E(tx('Retry the failed ones'))}</button>`:''}</div>`
   :`<div class="bar"><button type="button" class="btn" data-act="pxRunPause">${E(st.paused?tx('Resume'):tx('Pause'))}</button><button type="button" class="btn bad" data-act="pxRunStop">${E(tx('Stop'))}</button></div><p class="mut" style="margin:0">${E(tx('Keep this screen open. Messages go out in groups of'))} ${B}.</p>`}`);};
 X._runDraw=draw;X._runO=o;draw();
 const queue=o.items.slice();
 while(queue.length&&!st.stop){
  while(st.paused&&!st.stop)await sleep(300);if(st.stop)break;
  const batch=queue.splice(0,B);let res=null,tries=0;
  while(tries<4&&!st.stop){tries++;
   try{const j=await GAS.call('send',{items:batch.map(it=>({id:it.id,to:it.to,dv:it.dv,type:it.type,lang:it.lang,params:it.params,text:it.text,name:it.name})),src:o.src||'batch'});res=j.res||[];}
   catch(e){if(e.code==='nocfg'||e.code==='key'||e.code==='needkey'||e.code==='old'){st.stop=true;st.note=e.message;st.noRetry=true;break;}if(tries>=2){st.note=e.message;res=batch.map(it=>({id:it.id,st:'failed',err:e.message}));break;}await sleep(4000);continue;}
   const rated=res.filter(r=>r.st==='rate');
   if(rated.length&&tries<4){st.rate=rated.length;st.note=tx('WhatsApp asked us to slow down — waiting 30 seconds, then trying again.');draw();
    res.filter(r=>r.st!=='rate').forEach(r=>apply(r));batch.splice(0,batch.length,...batch.filter(it=>rated.some(r=>r.id===it.id)));
    for(let s=0;s<30&&!st.stop;s++)await sleep(1000);st.rate=0;st.note='';res=null;continue;}
   break;}
  if(res){const left=new Set(batch.map(b=>b.id));res.forEach(r=>{apply(r);left.delete(r.id);});}
  draw();
  if(queue.length&&!st.stop&&P)for(let ms=0;ms<P&&!st.stop;ms+=250)await sleep(250);
 }
 function apply(r){const it=o.items.find(x=>x.id===r.id);if(!it)return;st.done++;
  if(r.st==='sent'||r.st==='dup'){st.sent++;try{o.onItem&&o.onItem(it,'sent');}catch(e){}}
  else if(r.st==='off'){st.skipped++;try{o.onItem&&o.onItem(it,'off',r.err);}catch(e){}}
  else if(r.st==='cap'){st.stop=true;st.note=tx('The daily sending limit was reached. The rest can be sent tomorrow.');st.failed++;st.fails.push({name:it.name,err:r.err,it});}
  else{st.failed++;st.fails.push({name:it.name,err:r.err||r.st,it});try{o.onItem&&o.onItem(it,'failed',r.err);}catch(e){}if(r.ec===131026){const v=dev(it.dv);if(v)v.waStatus='no';}}}
 if(st.stop&&queue.length){st.note=st.note||tx('Stopped.');st.skipped+=0;}
 draw(true);try{o.onDone&&o.onDone(st);}catch(e){}return st;};
A.pxRunPause=()=>{const s=X._run;if(s){s.paused=!s.paused;X._runDraw();}};A.pxRunStop=()=>{const s=X._run;if(s){s.stop=true;s.paused=false;}};
A.pxRunClose=()=>{ovClose();render();};
A.pxRunRetry=()=>{const s=X._run,o=X._runO;if(!s||!o)return;const items=s.fails.map(f=>f.it);ovClose();X.apiRun(Object.assign({},o,{items}));};
/* =========== guided one-tap queue (no API needed) =========== */
X.quickRun=function(o){
 const items=o.items.filter(x=>x&&x.url),st={i:0,n:items.length,B:o.batch||cfg().batch,opened:0};if(!items.length)return toast(tx('Nobody to send to.'));
 const draw=()=>{if(st.i>=st.n){ov(`<h3 style="margin:0 0 6px">✅ ${E(tx('All done'))}</h3><p>${st.opened} ${E(tx('chats opened.'))}</p><button type="button" class="btn pri block" data-act="pxQClose">${E(tx('Close'))}</button>`);try{o.onDone&&o.onDone(st);}catch(e){}return;}
  const it=items[st.i],inB=st.i%st.B,pcB=Math.floor(st.i/st.B)+1,tb=Math.ceil(st.n/st.B),pc=Math.round(st.i/st.n*100),brk=st.i>0&&inB===0&&st.brk;
  ov(`<div class="bar" style="justify-content:space-between;margin:0"><b>${E(o.title||tx('Quick send'))}</b><button type="button" class="ib dark" data-act="pxQClose" aria-label="Close">${ico('close')}</button></div><div class="mut">${st.i} / ${st.n} · ${E(tx('group'))} ${pcB}/${tb}</div><div class="pxbar2"><i style="width:${pc}%"></i></div>
   ${brk?`<div class="okbox">${E(tx('A group of'))} ${st.B} ${E(tx('is done. Take a short break if you like — WhatsApp prefers messages that are not sent all at once.'))}</div>`:''}
   <div style="text-align:center;margin:10px 0"><div style="font-size:calc(20px*var(--fs,1));font-weight:700">${E(it.label)}</div><div class="mut">${E(it.sub||'')}</div></div>
   <div class="warn" style="font-size:13px">${E(tx('WhatsApp opens with the message ready. Tap Send there, then come back — the next person is ready.'))}</div>
   <button type="button" class="btn pri pxbig" data-act="pxQGo">${ico('sms')} ${E(it.isSms?tx('Open SMS'):tx('Open WhatsApp'))} → ${E(it.label)}</button>
   <div class="bar" style="margin-top:8px;justify-content:space-between"><button type="button" class="btn" data-act="pxQSkip">${E(tx('Skip'))}</button><button type="button" class="btn" data-act="pxQBack" ${st.i?'':'disabled'}>← ${E(tx('Back'))}</button></div>`);};
 X._q={o,items,st,draw};draw();};
A.pxQGo=()=>{const q=X._q;if(!q)return;const it=q.items[q.st.i];try{it.onOpen&&it.onOpen(it);}catch(e){}if(it.isSms)location.href=it.url;else window.open(it.url,'_blank','noopener');q.st.opened++;q.st.i++;q.st.brk=true;setTimeout(()=>q.draw(),250);};
A.pxQSkip=()=>{const q=X._q;if(q){q.st.i++;q.st.brk=false;q.draw();}};A.pxQBack=()=>{const q=X._q;if(q&&q.st.i>0){q.st.i--;q.st.brk=false;q.draw();}};A.pxQClose=()=>{ovClose();render();};
/* =========== the planning sheet =========== */
X.sendPlan=function(p){ // {title,count,sms,hasImg,api:{items,...},quick:{items,...}}
 const c=cfg(),ok=autoOn(),B=[10,20,50,100],PA=[2,4,10,30];
 ov(`<div class="bar" style="justify-content:space-between;margin:0"><h3 style="margin:0">${E(p.title)}</h3><button type="button" class="ib dark" data-act="pxQClose" aria-label="Close">${ico('close')}</button></div>
  <p class="mut" style="margin:4px 0 8px"><b>${p.count}</b> ${E(tx('people will get this on WhatsApp'))}${p.sms?' · '+p.sms+' '+E(tx('by SMS (opened one by one)')):''}</p>
  <label>${E(tx('Send in groups of'))}</label><div class="chips">${B.map(n=>`<button type="button" class="chip${c.batch===n?' on':''}" data-act="pxSetB" data-k="${n}">${n}</button>`).join('')}</div>
  <label>${E(tx('Pause between groups'))}</label><div class="chips">${PA.map(n=>`<button type="button" class="chip${c.pause===n?' on':''}" data-act="pxSetP" data-k="${n}">${n} ${E(tx('sec'))}</button>`).join('')}</div>
  ${p.hasImg?`<div class="warn" style="margin-top:8px">${E(tx('Automatic sending carries text only. Your picture is not included — use the one-tap queue, or share the picture to a group.'))}</div>`:''}
  <div class="menu" style="margin-top:8px"><button type="button" class="mi" data-act="pxPlanApi" ${ok&&p.api&&p.api.items.length&&!p.hasImg?'':'disabled style="opacity:.5"'}>${ico('sync')}<span><b>${E(tx('Send all now — automatic'))}</b><div class="mut">${ok?E(tx('Through your WhatsApp Business connection. One tap, nothing else to do.')):E(tx('Not set up yet — More → Auto messages.'))}</div></span></button>
  <button type="button" class="mi" data-act="pxPlanQuick">${ico('megaphone')}<span><b>${E(tx('One-tap queue'))}</b><div class="mut">${E(tx('WhatsApp opens for each person with the message ready; you tap Send. No setup needed.'))}</div></span></button></div>
  <details style="margin-top:8px"><summary>${E(tx('WhatsApp’s rules (read once)'))}</summary><ul class="mut" style="padding-left:18px;margin:6px 0 0"><li>${E(tx('Send only to people who agreed to receive your messages. Anyone who replies STOP is skipped automatically.'))}</li><li>${E(tx('Messages you start need an approved template; the reply window is 24 hours after the person writes to you.'))}</li><li>${E(tx('A new WhatsApp number can message only a limited number of different people per 24 hours (it grows with good quality) — see WhatsApp Manager.'))}</li><li>${E(tx('Many reports or blocks lower your number’s quality. Sending in groups with a pause is gentler.'))}</li></ul></details>`);
 X._plan=p;};
A.pxSetB=d=>{DEV.set({sendCfg:Object.assign(cfg(),{batch:+d.k})});if(X._plan)X.sendPlan(X._plan);};A.pxSetP=d=>{DEV.set({sendCfg:Object.assign(cfg(),{pause:+d.k})});if(X._plan)X.sendPlan(X._plan);};
A.pxPlanApi=()=>{const p=X._plan;if(!p||!p.api)return;ovClose();X.apiRun(p.api);};
A.pxPlanQuick=()=>{const p=X._plan;if(!p||!p.quick)return;ovClose();X.quickRun(p.quick);};
/* =========== broadcast: "Send to all" =========== */
mod('Broadcast: one tap for everyone',['bcQueue','bcMark','bcRecCreate','bcText','waLink','smsLink','VIEWS','A','S','db','fill','bcCtx','tidy','bcTitle','bcRefresh'],()=>{
 const body=v=>{const lc=v.lang||db.settings.defLang||'en';let t=S.bc.text||'';t=t.replace(/^\s*(🙏\s*)?\{name\}[\s,:.\-–—]*/u,'');return tidy(fill(t,Object.assign(bcCtx(v,lc),{name:X.greetName(v,lc)}))).replace(/\s*\n\s*/g,' ');};
 X.bcPlan=function(){const q=bcQueue(),pend=q.items.filter(i=>!i.done);if(!pend.length)return toast(tx('Everyone in this list has already been sent this message.'));
  if(!(S.bc.text||'').trim()&&!S.bc.imgFile)return toast(tx('Type a message first.'));
  const rec=()=>bcRecCreate(),wa=pend.filter(i=>i.r.ch==='wa'),sms=pend.length-wa.length,job=uid();
  const apiItems=wa.map(it=>{const v=it.v,lc=v.lang||db.settings.defLang||'en';return{id:'bc|'+job+'|'+v.id,to:waNum(v.whatsapp||v.mobile),dv:v.id,type:'message',lang:lc,params:[X.greetName(v,lc),body(v)],text:it.text,name:v.name};});
  const quickItems=pend.map(it=>({label:it.v.name,sub:it.dest,url:it.r.ch==='wa'?waLink(it.v.whatsapp||it.v.mobile,it.text):smsLink(it.v.mobile||it.v.whatsapp,it.text),isSms:it.r.ch!=='wa',onOpen:()=>bcMark(it.v.id)}));
  X.sendPlan({title:tx('Send this message'),count:wa.length,sms,hasImg:!!S.bc.imgFile,
   api:{title:bcTitle(),items:apiItems,src:'broadcast',onItem:(it,r)=>{if(r==='sent'||r==='off'){const rc=rec();if(!rc.sent.includes(it.dv))rc.sent.push(it.dv);rc.mode='api';rc.n=bcQueue().items.length;}},onDone:s=>{touch('gateway send','Broadcast: '+s.sent+' sent, '+s.failed+' not sent');try{bcRefresh();}catch(e){}}},
   quick:{title:bcTitle(),items:quickItems,onDone:()=>{try{bcRefresh();}catch(e){}}}});};
 A.pxBcAll=()=>X.bcPlan();
 const _m=bcModeHtml;setG('bcModeHtml',function(q){let h=_m.apply(this,arguments);if(S.bc.mode!=='one')return h;
  const n=q.items.filter(i=>!i.done).length;const btn=`<div class="bar" style="margin:0 0 8px"><button type="button" class="btn pri pxbig" data-act="pxBcAll">⚡ ${E(tx('Send to everyone'))} (${n})</button></div><p class="mut" style="margin:0 0 8px">${E(tx('One tap sends to all selected people, in groups of'))} ${cfg().batch}. ${E(tx('Or use “Send next” below to go one by one.'))}</p>`;return btn+h;});
 /* template list in Auto messages gets the broadcast template */
 try{if(typeof NFT!=='undefined'&&!NFT.message){NFT.message={en:'🙏 Vanakkam {{1}}. {{2}} Vetri Vel Muruganukku Arohara!',ta:'🙏 வணக்கம் {{1}}. {{2}} வெற்றிவேல் முருகனுக்கு அரோகரா!'};}if(typeof AUTOT!=='undefined'&&!AUTOT.includes('message'))AUTOT.push('message');if(typeof NFTYPE!=='undefined'&&!NFTYPE.message)NFTYPE.message=['Broadcast message','megaphone'];if(typeof NFPARAMS!=='undefined'&&!NFPARAMS.message)NFPARAMS.message='{{1}} name · {{2}} message';}catch(e){X.errs.push('template list: '+e.message);}
 addDict([['Send to everyone','எல்லோருக்கும் அனுப்பு'],['One tap sends to all selected people, in groups of','ஒரு தொடுதலில் தேர்ந்தெடுத்த அனைவருக்கும், குழுக்களாக:'],['Or use “Send next” below to go one by one.','அல்லது கீழே “அடுத்தது” மூலம் ஒவ்வொருவராக அனுப்பலாம்.'],['Send in groups of','இத்தனை பேர் கொண்ட குழுக்களாக அனுப்பு'],['Pause between groups','குழுக்களுக்கு இடையே இடைவேளை'],['sec','விநா'],['Send all now — automatic','இப்போது அனைவருக்கும் — தானியங்கி'],['One-tap queue','ஒரு-தொடுதல் வரிசை'],['Pause','இடைநிறுத்து'],['Resume','தொடர்'],['Stop','நிறுத்து'],['Done','முடிந்தது'],['Retry the failed ones','தோல்வியுற்றவற்றை மீண்டும் முயல்'],['Open WhatsApp','WhatsApp திற'],['All done','அனைத்தும் முடிந்தது'],['Skip','தவிர்'],['Back','பின்']]);
});
/* =========== alerts: one-tap, edit, voice =========== */
mod('Alerts: one tap, edit, voice',['VIEWS','A','S','db','todaysAlerts','mkAlert','alertRow','occasions','waLink','smsLink','iso','dev'],()=>{
 const lcOf=v=>v.lang||db.settings.defLang||'en';
 const aItem=a=>{const v=a.v,lc=lcOf(v),ds=a.date,id=a.bk?('bk|'+a.bk.id+'|'+iso(new Date())):(a.type+'|'+v.id+'|'+ds),nm=X.greetName(v,lc);
  const params=a.type==='booking'?[nm,a.bk.svcName,fd(a.bk.date),fmtTime(a.bk.time,lc)]:[nm];
  return{id,to:waNum(v.whatsapp||v.mobile),dv:v.id,type:a.type,lang:lc,params,text:a.msg,name:v.name};};
 const mark=(a,ch)=>{if(!db.alerts.some(x=>x.key===a.key)){db.alerts.push({id:uid(),key:a.key,t:new Date().toISOString(),ch,dev:a.v.id,type:a.type,by:S.user.username});if(db.alerts.length>3000)db.alerts.splice(0,500);touch();}};
 X.alertsPlan=function(){const pend=todaysAlerts().filter(a=>!a.sent&&!(a.v.alerts===false));if(!pend.length)return toast(tx('Nothing is waiting — every reminder for today is sent.'));
  const wa=pend.filter(a=>routeFor(a.v).ch==='wa'),sms=pend.length-wa.length,items=wa.map(aItem);
  X.sendPlan({title:tx('Send today’s reminders'),count:wa.length,sms,hasImg:false,
   api:{title:tx('Today’s reminders'),items,src:'alerts',onItem:(it,r)=>{if(r==='sent'||r==='off'){const a=pend.find(x=>x.v.id===it.dv&&aItem(x).id===it.id);if(a)mark(a,'WhatsApp');}},onDone:s=>{touch('gateway send','Alerts: '+s.sent+' sent, '+s.failed+' not sent');}},
   quick:{title:tx('Today’s reminders'),items:pend.map(a=>{const r=routeFor(a.v);return{label:a.v.name,sub:(a.type==='birthday'?'🎂 ':a.type==='anniversary'?'💐 ':'🛕 ')+(a.v.mobile||''),url:r.ch==='wa'?waLink(a.v.whatsapp||a.v.mobile,a.msg):smsLink(a.v.mobile||a.v.whatsapp,a.msg),isSms:r.ch!=='wa',onOpen:()=>mark(a,r.ch==='wa'?'WhatsApp':'SMS')};})}});};
 A.pxAlAll=()=>X.alertsPlan();
 const _v=VIEWS.alerts;VIEWS.alerts=()=>{let h=_v();if(!h||typeof h!=='string')return h;const n=todaysAlerts().filter(a=>!a.sent&&!(a.v.alerts===false)).length;
  const bar=can('write')&&n?`<div class="card" style="display:flex;gap:10px;align-items:center"><div style="flex:1"><b>${n} ${E(tx('reminders waiting today'))}</b></div><button type="button" class="btn pri" data-act="pxAlAll">⚡ ${E(tx('Send all'))}</button></div>`:'';return bar+h;};
 /* edit / voice for one reminder */
 const find=key=>{let a=todaysAlerts().find(x=>x.key===key);if(a)return a;a=occasions(7).map(o=>mkAlert(o.type,o.v,o.date,null)).find(x=>x.key===key);return a||null;};
 const _row=alertRow;setG('alertRow',function(a){let h=_row.apply(this,arguments);if(!can('write'))return h;return h.replace(/<\/div><\/div>$/,`<button type="button" class="btn sm" data-act="pxAlEdit" data-key="${E(a.key)}">✎ ${E(tx('Edit / voice'))}</button></div></div>`);});
 A.pxAlEdit=d=>{const a=find(d.key);if(!a)return toast(tx('Reminder not found.'));S.alE={a,text:a.msg};
  modal(tx('Edit the message'),`<p class="mut" style="margin-top:0"><b>${E(a.v.name)}</b> · ${E(a.v.mobile||'')}</p><div class="pxw" style="position:relative"><textarea id="pxAlT" style="min-height:130px;padding-right:52px">${E(a.msg)}</textarea>${have('PX')&&PX.micBtn?PX.micBtn('pxAlT'):''}</div>
   <div class="bar" style="margin-top:8px"><button type="button" class="btn" data-act="pxAlReset">${E(tx('Reset'))}</button>${have('PX')&&PX.tr?`<button type="button" class="btn" data-act="pxAlTa">${E(tx('→ Tamil'))}</button><button type="button" class="btn" data-act="pxAlEn">${E(tx('→ English'))}</button>`:''}</div>
   <div class="menu" style="margin-top:6px"><button type="button" class="mi" data-act="pxAlWa">${ico('sms')}<span>${E(tx('Send on WhatsApp'))}</span></button><button type="button" class="mi" data-act="pxAlVoice">${ico('mic')}<span>${E(tx('Make a voice note (AI voice)'))}</span></button><button type="button" class="mi" data-act="pxAlCopy">${ico('edit')}<span>${E(tx('Copy'))}</span></button></div>`,null,{bottom:true,noSave:true});};
 const txt=()=>($q('#pxAlT')||{}).value||'';
 A.pxAlReset=()=>{const e=$q('#pxAlT');if(e&&S.alE)e.value=S.alE.a.msg;};
 A.pxAlWa=()=>{const a=S.alE.a;const r=routeFor(a.v),t=txt();mark(a,'WhatsApp');window.open(waLink(a.v.whatsapp||a.v.mobile,t),'_blank','noopener');};
 A.pxAlCopy=async()=>{toast((await X.copy(txt()))?tx('Copied'):tx('Could not copy'));};
 A.pxAlTa=async()=>{const r=await PX.tr(txt(),'en','ta');if(r.text)$q('#pxAlT').value=r.text;else toast(r.err||tx('Could not translate'));};A.pxAlEn=async()=>{const r=await PX.tr(txt(),'ta','en');if(r.text)$q('#pxAlT').value=r.text;};
 A.pxAlVoice=()=>{if(!X.voiceFromText)return toast(tx('The voice studio is not available yet.'));const a=S.alE.a,t=txt();closeModal();setTimeout(()=>X.voiceFromText(t,{lang:/[\u0B80-\u0BFF]/.test(t)?'ta':'en',title:a.v.name}),60);};
 X.copy=X.copy||(async t=>{try{await navigator.clipboard.writeText(t);return true;}catch(e){return false;}});
 addDict([['reminders waiting today','நினைவூட்டல்கள் இன்று காத்திருக்கின்றன'],['Send all','அனைத்தும் அனுப்பு'],['Edit / voice','திருத்து / குரல்'],['Edit the message','செய்தியைத் திருத்து'],['Reset','மீட்டமை'],['Send on WhatsApp','WhatsApp-ல் அனுப்பு'],['Make a voice note (AI voice)','குரல் செய்தி உருவாக்கு (AI குரல்)'],['Send today’s reminders','இன்றைய நினைவூட்டல்களை அனுப்பு']]);
});
/* =========== Share to WhatsApp: choose a group or one person =========== */
mod('Share to WhatsApp chooser',['A','S','db','modal','closeModal','toast','openPicker','waLink'],()=>{
 X.waTarget=function(o){ // {text, files[], title, after}
  X._wt=o;const files=(o.files||[]).filter(Boolean),groups=(db.groups||[]).filter(g=>g.link&&/^https:\/\/chat\.whatsapp\.com\//.test(g.link));
  modal(tx(o.title||'Share on WhatsApp'),`${files.length?`<div class="mut" style="margin:0 0 6px">📎 ${E(files[0].name)}</div>`:''}<div class="okbox" style="white-space:pre-wrap;font-size:13px;max-height:110px;overflow:auto">${E((o.text||'').slice(0,400))}</div>
   <div class="menu"><button type="button" class="mi" data-act="pxWtAny">${ico('sms')}<span><b>${E(tx('WhatsApp — choose a group or person'))}</b><div class="mut">${E(files.length?tx('Opens your phone’s share screen: pick WhatsApp, then the group or contact.'):tx('Opens WhatsApp’s own chat list: tap any group or person.'))}</div></span></button>
   <button type="button" class="mi" data-act="pxWtOne">${ico('people')}<span><b>${E(tx('One devotee'))}</b><div class="mut">${E(tx('Pick a devotee — their chat opens with the message ready.'))}</div></span></button>
   ${groups.length?`<div class="mut" style="padding:8px 4px 0">${E(tx('Our WhatsApp groups'))}</div>${groups.map(g=>`<button type="button" class="mi" data-act="pxWtGroup" data-id="${g.id}">${ico('people')}<span>${E(g.name)}</span></button>`).join('')}`:''}
   <button type="button" class="mi" data-act="pxWtOther">${ico('share')}<span>${E(tx('Another app (Instagram, Telegram…)'))}</span></button></div>
   ${groups.length?`<p class="mut" style="margin:6px 0 0">${E(tx('For a group: the message is copied, the group opens — paste it and tap Send.'))}</p>`:''}`,null,{bottom:true,noSave:true});};
 const done=()=>{const o=X._wt;try{o&&o.after&&o.after();}catch(e){}};
 A.pxWtAny=async()=>{const o=X._wt;if(!o)return;const files=(o.files||[]).filter(Boolean);
  if(!files.length){window.open('https://wa.me/?text='+encodeURIComponent(o.text||''),'_blank','noopener');closeModal();done();return;}
  closeModal();const r=await PX.share({files,text:o.text,title:o.title});if(r==='shared')done();};
 A.pxWtOther=async()=>{const o=X._wt;closeModal();const r=await PX.share({files:(o.files||[]).filter(Boolean),text:o.text,title:o.title});if(r==='shared')done();};
 A.pxWtOne=()=>{const o=X._wt;closeModal();setTimeout(()=>{openPicker(tx('Choose a devotee'),[],ids=>{const v=dev(ids[ids.length-1]);if(!v)return;window.open(waLink(v.whatsapp||v.mobile,o.text||''),'_blank','noopener');done();});},60);};
 A.pxWtGroup=async d=>{const o=X._wt,g=db.groups.find(x=>x.id===d.id);if(!g)return;const files=(o.files||[]).filter(Boolean);await X.copy(o.text||'');closeModal();
  if(files.length){const r=await PX.share({files,text:o.text,title:g.name});if(r==='shared')done();return;}
  toast(tx('Message copied — paste it in the group and tap Send.'));window.open(g.link,'_blank','noopener');done();};
 addDict([['WhatsApp — choose a group or person','WhatsApp — குழு அல்லது நபரைத் தேர்வு செய்'],['One devotee','ஒரு பக்தர்'],['Our WhatsApp groups','எங்கள் WhatsApp குழுக்கள்'],['Another app (Instagram, Telegram…)','வேறு ஆப் (Instagram, Telegram…)'],['Share on WhatsApp','WhatsApp-ல் பகிர்'],['Choose a devotee','பக்தரைத் தேர்வு செய்'],['Message copied — paste it in the group and tap Send.','செய்தி நகலெடுக்கப்பட்டது — குழுவில் ஒட்டி Send தட்டவும்.']]);
});
})();
