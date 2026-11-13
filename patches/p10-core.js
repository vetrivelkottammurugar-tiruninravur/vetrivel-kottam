/* =====================================================================
   v10 CORE — patch framework · automatic updates · app name · status page
   Loaded by the loader from patches.json. Later patch files use window.PX10.mod(...) and the helpers below.
   ===================================================================== */
(function(){
'use strict';
if(window.PX10&&window.PX10.core)return;
const PX10=window.PX10={v:'10.0.0',core:true,mods:[],errs:[],upd:{last:0,pending:null,pollMs:20*60*1000,idleMs:12000}};
/* ---------- helpers every patch file uses ---------- */
const have=(...n)=>n.every(x=>{try{return (0,eval)('typeof '+x)!=='undefined';}catch(e){return false;}});
const setG=(n,f)=>{window.__pxt10=f;try{(0,eval)(n+'=window.__pxt10');return true;}catch(e){PX10.errs.push('set '+n+': '+e.message);return false;}finally{try{delete window.__pxt10;}catch(e){}}};
const mod=(name,req,fn)=>{const m={name,ok:false,msg:''};PX10.mods.push(m);const miss=(req||[]).filter(r=>!have(r));if(miss.length){m.msg='missing in the app: '+miss.join(', ');return false;}
 try{fn();m.ok=true;return true;}catch(e){m.msg=e.message;PX10.errs.push(name+': '+(e.stack||e.message));return false;}};
const tx=s=>{try{return L(s);}catch(e){return s;}};
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $q=(s,r)=>(r||document).querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const addDict=rows=>{try{rows.forEach(r=>{DICT[r[0]]=r.slice(1);});}catch(e){}};
const dl=(f)=>{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name||'file';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},900);};
Object.assign(PX10,{have,setG,mod,tx,E,$q,sleep,addDict,dl});
/* all visible text can carry its Tamil version through addDict([['English','தமிழ்'],...]) */
/* ---------- app name: Vetrivel Kottam ---------- */
mod('App name “Vetrivel Kottam”',['resolveTheme','applyTheme'],()=>{
 const NAME='Vetrivel Kottam';PX10.APPNAME=NAME;
 const _rt=resolveTheme;setG('resolveTheme',function(t){const o=_rt.apply(this,arguments);const nm=String((t&&t.appName)||'').trim().slice(0,22);o.appName=nm||NAME;return o;});
 const _ap=applyTheme;setG('applyTheme',function(t){const r=_ap.apply(this,arguments);try{document.title=(TH&&TH.appName)||NAME;}catch(e){}return r;});
 document.title=NAME;
 try{applyTheme((typeof db!=='undefined'&&db&&db.settings&&db.settings.theme)||JSON.parse(store.get('tmgr_theme')||'null'));}catch(e){}
 /* the Appearance screen limited the name to 14 letters */
 const _r=render;setG('render',function(){const r=_r.apply(this,arguments);try{const i=document.querySelector('input[data-th=appName]');if(i){i.maxLength=22;i.placeholder=NAME;}}catch(e){}return r;});
 try{if(PWA_FILES&&PWA_FILES['manifest.json']){const m=JSON.parse(PWA_FILES['manifest.json']);m.name=NAME;m.short_name=NAME;PWA_FILES['manifest.json']=JSON.stringify(m,null,2);}}catch(e){}
});
/* ---------- automatic updates ---------- */
const U=PX10.upd;let lastTouch=Date.now();
['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,()=>{lastTouch=Date.now();},{passive:true,capture:true}));
const manKey=m=>JSON.stringify([m.v||'',m.html||'',(m.patches||[]).map(p=>p.f+'@'+(p.v||'')),m.disabled||[]]);
function idle(){try{const a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&!a.closest('#pxbar'))return false;
  if(typeof S!=='undefined'&&(S.dirty||S.saving||S.mOpen||S.vOpen||S.listening))return false;if(document.getElementById('lockov'))return false;}catch(e){}
 return Date.now()-lastTouch>=U.idleMs;}
function bar(html,cls){let b=document.getElementById('pxbar');if(!b){b=document.createElement('div');b.id='pxbar';document.body.appendChild(b);}b.className=cls||'';b.innerHTML=html;b.style.display='flex';}
function hideBar(){const b=document.getElementById('pxbar');if(b)b.style.display='none';}
const css=document.createElement('style');css.textContent='#pxbar{position:fixed;left:8px;right:8px;bottom:calc(var(--bn,64px) + var(--sab,0px) + 10px);z-index:240;background:#2b1d10;color:#fff;border-radius:14px;padding:10px 12px;display:none;align-items:center;gap:10px;box-shadow:0 6px 22px rgba(0,0,0,.35);font-size:14px}#pxbar button{border:0;border-radius:18px;padding:8px 14px;background:#f2b632;color:#2b1d10;font-weight:700;cursor:pointer;min-height:36px}#pxbar span{flex:1;min-width:0}.pxspin{display:inline-block;width:12px;height:12px;border:2px solid #fff4;border-top-color:#fff;border-radius:50%;animation:pxs 1s linear infinite;margin-right:6px;vertical-align:-1px}@keyframes pxs{to{transform:rotate(360deg)}}';document.head.appendChild(css);
async function applyNow(why){if(PX10.reloading)return;PX10.reloading=true;
 try{if(typeof S!=='undefined'&&S.dirty&&typeof persist==='function'){bar('<span><i class="pxspin"></i>'+E(tx('Saving your work, then updating…'))+'</span>');await Promise.race([persist(),sleep(8000)]);}}catch(e){}
 try{const m=U.pending||(window.PXL&&PXL.man)||{};localStorage.setItem('px_whatsnew',JSON.stringify({v:m.v||'',note:m.note||'',noteTa:m.noteTa||''}));}catch(e){}
 bar('<span><i class="pxspin"></i>'+E(tx('Updating to the latest version…'))+'</span>');setTimeout(()=>{try{location.reload();}catch(e){}},250);}
function offerUpdate(m){U.pending=m;
 if(idle()){applyNow('idle');return;}
 bar('<span>'+E(tx('A new version is ready.'))+'</span><button type="button" id="pxUpdNow">'+E(tx('Update now'))+'</button>');const b=document.getElementById('pxUpdNow');if(b)b.onclick=()=>applyNow('user');
 clearTimeout(U.retry);U.retry=setTimeout(()=>{if(U.pending&&!PX10.reloading)offerUpdate(U.pending);},9000);}
PX10.checkUpdates=async function(manual){
 if(!window.PXL||!PXL.fetchMan){if(manual&&typeof toast==='function')toast(tx('Update files are not set up on this website yet.'));return'none';}
 U.last=Date.now();
 try{const m=await PXL.fetchMan(),cur=PXL.man;
  try{if('serviceWorker' in navigator){const reg=await navigator.serviceWorker.getRegistration();if(reg)reg.update().catch(()=>{});}}catch(e){}
  if(!cur){return'none';}
  const htmlChanged=PXL.html&&m.html&&String(m.html)!==String(PXL.html);
  if(htmlChanged||manKey(m)!==manKey(cur)){offerUpdate(m);return'update';}
  if(manual&&typeof toast==='function')toast(tx('You have the latest version.'));return'same';
 }catch(e){if(manual&&typeof toast==='function')toast(tx('Could not check for updates (offline?)'));return'error';}};
setInterval(()=>{if(document.visibilityState==='visible'&&Date.now()-U.last>=U.pollMs)PX10.checkUpdates(false);},60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-U.last>=5*60*1000)PX10.checkUpdates(false);});
window.addEventListener('online',()=>setTimeout(()=>PX10.checkUpdates(false),1500));
if('serviceWorker' in navigator){let had=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!had){had=true;return;}if(PX10.reloading)return;offerUpdate(U.pending||(window.PXL&&PXL.man)||{});});}
document.addEventListener('px-ready',()=>{setTimeout(()=>PX10.checkUpdates(false),4000);
 try{const w=JSON.parse(localStorage.getItem('px_whatsnew')||'null');if(w){localStorage.removeItem('px_whatsnew');const n=(typeof S!=='undefined'&&S.lang==='ta'&&w.noteTa)?w.noteTa:w.note;if(typeof toast==='function')setTimeout(()=>toast('✅ '+tx('Updated')+(w.v?' · '+w.v:'')+(n?' — '+n:'')),1200);}}catch(e){}
 if(window.PXL&&PXL.failed&&PXL.failed.length)PX10.errs.push('could not load: '+PXL.failed.join(', '));});
window.__pxApplyNow=applyNow;
/* ---------- status page: More → Update & status ---------- */
mod('Status page (v10)',['VIEWS','TITLES','MORE','A','S'],()=>{
 TITLES.pxstat='Update & status';const r=MORE.find(m=>m[0]==='pxstat');if(r)r[2]='Update & status';else MORE.push(['pxstat','gear','Update & status','a']);
 const _v=VIEWS.pxstat;
 VIEWS.pxstat=()=>{const man=(window.PXL&&PXL.man)||{},row=(k,ok,t)=>`<tr><th>${E(k)}</th><td>${ok===null?'':ok?'✅ ':'⚠️ '}${E(t)}</td></tr>`;
  let sw='—';try{sw=('serviceWorker' in navigator)?(navigator.serviceWorker.controller?'active':'not controlling yet'):'not supported';}catch(e){}
  const mods=PX10.mods.map(m=>row(m.name,m.ok,m.ok?tx('active'):m.msg)).join('');
  const html=`<div class="card"><h3>${E(tx('Updates'))}</h3><table class="kv">${row(tx('This phone runs'),null,'v'+PX10.v+(man.v?' · '+man.v:''))}${row(tx('Patch files'),window.PXL&&PXL.failed&&PXL.failed.length?false:true,window.PXL?(PXL.loaded.length+' '+tx('loaded')+(PXL.failed.length?' · '+PXL.failed.length+' '+tx('failed')+': '+PXL.failed.join(', '):'')):tx('not available'))}${row(tx('Service worker'),sw==='active',sw)}${row(tx('Last check'),null,U.last?new Date(U.last).toLocaleTimeString():'—')}</table>
   ${man.note?`<p class="mut" style="margin:6px 0 0">${E(man.note)}</p>`:''}<div class="bar" style="margin-top:8px"><button type="button" class="btn pri" data-act="pxChk">${E(tx('Check for updates now'))}</button><button type="button" class="btn" data-act="pxForce">${E(tx('Refresh app files'))}</button></div>
   <p class="mut" style="margin:8px 0 0">${E(tx('Updates are checked automatically every 20 minutes and whenever the app is opened. You never need to remove and reinstall the app.'))}</p></div>
   <div class="card"><h3>${E(tx('Add-ons'))}</h3><table class="kv">${mods}</table></div>
   ${PX10.errs.length?`<div class="card"><h3>${E(tx('Problems'))}</h3><pre style="white-space:pre-wrap;font-size:11px;max-height:220px;overflow:auto">${E(PX10.errs.slice(-8).join('\n\n'))}</pre></div>`:''}`;
  let old='';try{old=_v?_v():'';}catch(e){}return html+old;};
 A.pxChk=async()=>{const r=await PX10.checkUpdates(true);if(r!=='update')render();};
 A.pxForce=async()=>{try{if('caches' in window){for(const k of await caches.keys())if(/^(vk-|tmgr-v)/.test(k))await caches.delete(k);}const rg=await navigator.serviceWorker.getRegistration();if(rg)await rg.update();}catch(e){}applyNow('force');};
 addDict([['Update & status','புதுப்பிப்பு & நிலை'],['Updates','புதுப்பிப்புகள்'],['This phone runs','இந்த போனில் இயங்குவது'],['Patch files','இணைப்புக் கோப்புகள்'],['Service worker','சர்வீஸ் வொர்க்கர்'],['Last check','கடைசி சோதனை'],['Check for updates now','இப்போது புதுப்பிப்பைச் சோதி'],['Refresh app files','செயலி கோப்புகளைப் புதுப்பி'],['A new version is ready.','புதிய பதிப்பு தயார்.'],['Update now','இப்போது புதுப்பி'],['Updating to the latest version…','சமீபத்திய பதிப்புக்கு புதுப்பிக்கிறது…'],['Saving your work, then updating…','உங்கள் வேலையைச் சேமித்து புதுப்பிக்கிறது…'],['You have the latest version.','நீங்கள் சமீபத்திய பதிப்பில் உள்ளீர்கள்.'],['Updated','புதுப்பிக்கப்பட்டது'],['Add-ons','கூடுதல் வசதிகள்'],['loaded','ஏற்றப்பட்டது'],['failed','தோல்வி']]);
});
})();
