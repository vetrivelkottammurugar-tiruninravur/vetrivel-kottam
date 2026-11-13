/* =====================================================================
   v10 NAMES — Tamil name for every devotee (auto-suggested, always editable) · Tamil greeting in Tamil messages
   · names screen · translator that never leaves English words behind
   ===================================================================== */
(function(){
'use strict';
const X=window.PX10;if(!X||!X.core)return;const {mod,setG,tx,E,$q,addDict,sleep,have}=X;
const TAM=/[\u0B80-\u0BFF]/g;
const isTamilText=t=>((String(t).match(TAM)||[]).length>=6);
/* ---------- translator: finish any English words that were left in a Tamil result ---------- */
mod('Translator fills the gaps',['PX','TRL'],()=>{
 const _tr=PX.tr;
 const WORDS={night:'இரவு',morning:'காலை',evening:'மாலை',afternoon:'மதியம்',family:'குடும்பம்',families:'குடும்பங்கள்',day:'நாள்',week:'வாரம்',month:'மாதம்',year:'ஆண்டு',first:'முதல்',new:'புதிய',annual:'ஆண்டு',daily:'தினசரி',weekly:'வார',monthly:'மாத',prayer:'பிரார்த்தனை',prayers:'பிரார்த்தனைகள்',devotee:'பக்தர்',devotees:'பக்தர்கள்',please:'தயவுசெய்து',join:'இணைவீர்',us:'எங்களுடன்',come:'வாருங்கள்',invited:'அழைக்கப்படுகிறீர்கள்',invitation:'அழைப்பு',program:'நிகழ்ச்சி',programme:'நிகழ்ச்சி',programs:'நிகழ்ச்சிகள்',music:'இசை',concert:'இசை நிகழ்ச்சி',lamp:'விளக்கு',lamps:'விளக்குகள்',flower:'பூ',flowers:'பூக்கள்',garland:'மாலை',prasadam:'பிரசாதம்',offering:'காணிக்கை',donation:'நன்கொடை',donations:'நன்கொடைகள்',service:'சேவை',volunteers:'தொண்டர்கள்',volunteer:'தொண்டர்',free:'இலவசம்',food:'உணவு',meal:'உணவு',lunch:'மதிய உணவு',dinner:'இரவு உணவு',breakfast:'காலை உணவு',time:'நேரம்',date:'தேதி',place:'இடம்',venue:'இடம்',from:'',at:'',by:'',the:'',of:'',in:'',on:'',to:'',for:'',with:'',a:'',an:'',is:'',are:'',will:'',be:'',our:'எங்கள்',your:'உங்கள்',and:'மற்றும்',or:'அல்லது',all:'அனைத்து',every:'ஒவ்வொரு',this:'இந்த',that:'அந்த',today:'இன்று',tomorrow:'நாளை',yesterday:'நேற்று',now:'இப்போது',soon:'விரைவில்',live:'நேரலை',video:'வீடியோ',photos:'புகைப்படங்கள்',news:'செய்தி',update:'புதுப்பிப்பு',important:'முக்கியம்',notice:'அறிவிப்பு',message:'செய்தி',thank:'நன்றி',thanks:'நன்றி',you:'உங்களுக்கு',blessings:'ஆசீர்வாதம்',bless:'அருள்',grace:'அருள்',lord:'பகவான்',god:'இறைவன்',temple:'கோயில்'};
 const ext=s=>String(s).replace(/(\{[^}]*\})|(https?:\/\/\S+)|([A-Za-z][A-Za-z'-]*)/g,(m,ph,url,w)=>{if(!w)return m;const k=w.toLowerCase();return Object.prototype.hasOwnProperty.call(WORDS,k)?WORDS[k]:m;}).replace(/[ \t]{2,}/g,' ').trim();
 const latin=s=>/[A-Za-z]{2,}/.test(String(s).replace(/\{[^}]*\}|https?:\/\/\S+/g,''));
 const fixTa=s=>String(s).replace(/(\{[^}]*\})|(https?:\/\/\S+)|([A-Za-z][A-Za-z'.-]*)/g,(m,ph,url,w)=>w?TRL.enToTa(w):m);
 PX.tr=async function(text,from,to){
  if(from==='en'&&to==='ta'){const src=String(text||'').trim();if(src){const g=PX.gloss(src),o=ext(g&&g.out?g.out:src);
    if(g&&g.hit&&!latin(o))return{text:o,via:'glossary'};
    /* names + temple words only (no real sentence): finish by sound, no network needed */
    const words=o.replace(/\{[^}]*\}|https?:\/\/\S+/g,'').split(/\s+/).filter(Boolean),latinWords=words.filter(w=>/[A-Za-z]/.test(w));
    if(g&&g.hit&&latinWords.length<=2&&latinWords.every(w=>/^[A-Z]/.test(w)))return{text:fixTa(o),via:'partial'};}}
  const r=await _tr.apply(this,arguments);
  if(from==='en'&&to==='ta'){if(r&&r.text&&latin(r.text)&&r.via!=='glossary')return{text:fixTa(ext(r.text)),via:'partial'};
   if(r&&(r.via==='error'||!r.text)){const g=PX.gloss(String(text||''));return{text:fixTa(ext(g&&g.out?g.out:String(text||''))),via:'partial'};}}
  if(from==='ta'&&to==='en'&&r&&(r.via==='error'||!r.text))return{text:TRL.taToEn(String(text||'')),via:'partial'};
  return r;};
});
/* ---------- the devotee form: Tamil name ---------- */
mod('Devotee Tamil name',['devForm','readDev','modal','dev'],()=>{
 const _f=devForm;setG('devForm',function(d){d=d||{};let h=_f.apply(this,arguments);
  const field=`<div class="full"><label>${E(tx('Tamil name'))} <span class="mut">(${E(tx('fills in by itself — you can correct it'))})</span></label><div class="pxw" style="position:relative"><input name="nameTa" value="${E(d.nameTa||'')}" placeholder="${E(tx('தமிழ் பெயர்'))}" autocomplete="off" style="width:100%;padding-right:52px">${have('PX')&&PX.micBtn?'':''}</div><div id="pxNmSt" class="mut" style="min-height:18px;font-size:13px"></div></div>`;
  const i=h.indexOf('name="name"');if(i<0)return h;const j=h.indexOf('</div>',i);return h.slice(0,j+6)+field+h.slice(j+6);});
 const _r=readDev;setG('readDev',function(f,old){const r=_r.apply(this,arguments);if(r&&typeof r==='object'){const v=(f.get('nameTa')||'').trim();if(v)r.nameTa=v;else delete r.nameTa;}return r;});
 const _m=modal;setG('modal',function(){const f=_m.apply(this,arguments);try{wire(document.getElementById('modal'));}catch(e){X.errs.push('name wire: '+e.message);}return f;});
 function wire(root){if(!root)return;const en=root.querySelector('#mf [name=name]'),ta=root.querySelector('#mf [name=nameTa]');if(!en||!ta||en.dataset.pxNm)return;en.dataset.pxNm='1';
  const st=root.querySelector('#pxNmSt');let auto=!ta.value.trim(),sugg=(ta.value.trim()===TRL.enToTa(en.value.trim()));
  const set=(v,msg)=>{ta.value=v;if(st)st.textContent=msg||'';};
  en.addEventListener('input',()=>{const v=en.value.trim();if(!v){if(auto)set('');return;}if(auto||ta.dataset.px==='auto'){set(TRL.enToTa(v),tx('Suggested spelling — please check'));ta.dataset.px='auto';auto=true;}});
  ta.addEventListener('input',()=>{auto=false;ta.dataset.px='';const t=ta.value.trim();if(st)st.textContent=t?tx('Your Tamil spelling will be used in Tamil messages.'):'';if(t&&!en.value.trim()){en.value=TRL.taToEn(t);}});
  if(ta.value.trim()===''&&en.value.trim()){set(TRL.enToTa(en.value.trim()),tx('Suggested spelling — please check'));ta.dataset.px='auto';}
  else if(st&&ta.value.trim())st.textContent=tx('Your Tamil spelling will be used in Tamil messages.');}
 addDict([['Tamil name','தமிழ் பெயர்'],['fills in by itself — you can correct it','தானாக நிரம்பும் — திருத்தலாம்'],['Suggested spelling — please check','பரிந்துரைக்கப்பட்ட எழுத்துப்பிழை — சரிபார்க்கவும்'],['Your Tamil spelling will be used in Tamil messages.','உங்கள் தமிழ் எழுத்துக்கூட்டல் தமிழ் செய்திகளில் பயன்படுத்தப்படும்.']]);
});
/* ---------- Tamil greeting inside Tamil messages ---------- */
mod('Tamil names in Tamil messages',['dev','bcText','mkAlert','qsText','db'],()=>{
 X.greetName=(v,lc)=>{if(!v)return'';if(lc!=='ta')return v.name;if(v.nameTa&&v.nameTa.trim())return v.nameTa.trim();if((db.settings||{}).autoTaName)return X.nameTa(v);return v.name;};
 const swap=(t,v)=>{if(!t||!v||!v.name||!isTamilText(t))return t;const n=X.greetName(v,'ta');if(!n||n===v.name)return t;return String(t).split(v.name).join(n);};
 const _b=bcText;setG('bcText',function(v){return swap(_b.apply(this,arguments),v);});
 const _m=mkAlert;setG('mkAlert',function(type,v){const a=_m.apply(this,arguments);if(a&&a.msg)a.msg=swap(a.msg,v);return a;});
 const _q=qsText;setG('qsText',function(type,v){return swap(_q.apply(this,arguments),v);});
 if(have('nfBuild')){const _n=nfBuild;setG('nfBuild',function(r){const b=_n.apply(this,arguments);if(b&&b.v&&b.lc==='ta'){const n=X.greetName(b.v,'ta');if(b.params&&b.params[0]===b.v.name)b.params[0]=n;b.text=swap(b.text,b.v);}return b;});}
 if(have('buildOutbox')){const _o=buildOutbox;setG('buildOutbox',function(){const days=_o.apply(this,arguments);Object.keys(days).forEach(k=>{const d=days[k];(d.items||[]).forEach(it=>{if(it.lang==='ta'){const v=dev(it.dv);if(v){const n=X.greetName(v,'ta');if(it.params&&it.params[0]===v.name)it.params[0]=n;it.text=swap(it.text,v);}}});
   (d.bulk||[]).forEach(b=>{if(b.lang==='ta'&&Array.isArray(b.r))b.r.forEach(r=>{const v=dev(r[2]);if(v)r[0]=X.greetName(v,'ta');});});});return days;});}
});
/* ---------- Names screen ---------- */
mod('Names screen (Tamil)',['VIEWS','TITLES','MORE','A','S','db','dev','render'],()=>{
 TITLES.names='Tamil names';try{VIEW_MOD.names='devotees';}catch(e){}if(!MORE.some(m=>m[0]==='names'))MORE.splice(Math.max(0,MORE.findIndex(m=>m[0]==='backup')),0,['names','people','Tamil names']);
 const nm=S.nm=S.nm||{q:'',only:true,n:40};
 const list=()=>{const q=(nm.q||'').toLowerCase();return db.devotees.filter(v=>(!nm.only||!(v.nameTa&&v.nameTa.trim()))&&(!q||(v.name+' '+(v.nameTa||'')).toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name));};
 VIEWS.names=()=>{const all=db.devotees.length,have_=db.devotees.filter(v=>v.nameTa&&v.nameTa.trim()).length,l=list(),shown=l.slice(0,nm.n);
  return `<div class="card"><p class="mut" style="margin:0 0 6px"><b>${have_}</b> / ${all} ${E(tx('devotees have a Tamil name.'))} ${E(tx('Tamil messages use it in the greeting. Suggestions are made from the English spelling — please check each one.'))}</p>
   <div class="bar" style="margin:0"><button type="button" class="btn pri" data-act="pxNmAll" ${l.length?'':'disabled'}>${E(tx('Accept all suggestions shown'))} (${l.length})</button></div>
   <label class="chk" style="padding:8px 0"><input type="checkbox" data-pxnmauto ${(db.settings||{}).autoTaName?'checked':''}> ${E(tx('Also use suggestions in messages when no Tamil name is saved (not recommended before checking)'))}</label></div>
   <div class="search" style="margin:8px 0">${ico('search')}<input data-pxnmq type="search" value="${E(nm.q)}" placeholder="${E(tx('Search…'))}" autocomplete="off"></div>
   <div class="chips" style="margin-bottom:6px"><button type="button" class="chip${nm.only?' on':''}" data-act="pxNmOnly" data-k="1">${E(tx('Missing only'))}</button><button type="button" class="chip${!nm.only?' on':''}" data-act="pxNmOnly" data-k="0">${E(tx('Everyone'))}</button></div>
   ${shown.map(v=>{const sg=TRL.enToTa(v.name),cur=v.nameTa||'';return`<div class="arow" style="padding:8px 0;align-items:flex-start"><div style="flex:1;min-width:0"><div><b>${E(v.name)}</b> <span class="mut">${E(v.mobile||'')}</span></div><input data-pxnmv="${v.id}" value="${E(cur||sg)}" style="width:100%;margin-top:4px;${cur?'':'border-style:dashed'}" autocomplete="off"><div class="mut" style="font-size:12px">${cur?'✅ '+E(tx('saved')):E(tx('suggestion — tap Save to keep'))}</div></div><button type="button" class="btn sm ${cur?'':'pri'}" data-act="pxNmSave" data-id="${v.id}">${E(tx('Save'))}</button></div>`;}).join('')||`<div class="empty"><p>${E(tx('Nothing to show.'))}</p></div>`}
   ${l.length>nm.n?`<button type="button" class="btn block" data-act="pxNmMore">${E(tx('Show more'))}</button>`:''}`;};
 const save=(id,val)=>{const v=dev(id);if(!v)return;val=String(val||'').trim();if(val)v.nameTa=val;else delete v.nameTa;v.updated=new Date().toISOString();touch('devotee edit',v.name+' (Tamil name)');};
 A.pxNmSave=d=>{const i=document.querySelector('[data-pxnmv="'+d.id+'"]');save(d.id,i&&i.value);render();};
 A.pxNmAll=()=>{if(!confirm(tx('Save all the suggestions shown? You can still correct any name later.')))return;list().slice(0,500).forEach(v=>{const i=document.querySelector('[data-pxnmv="'+v.id+'"]');v.nameTa=((i&&i.value)||TRL.enToTa(v.name)).trim();v.updated=new Date().toISOString();});touch('devotee edit','Tamil names added');render();};
 A.pxNmOnly=d=>{nm.only=d.k==='1';nm.n=40;render();};A.pxNmMore=()=>{nm.n+=60;render();};
 document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&'pxnmq' in t.dataset){nm.q=t.value;nm.n=40;clearTimeout(S.nmT);S.nmT=setTimeout(()=>{render();const i=document.querySelector('[data-pxnmq]');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length);}},350);}});
 document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&'pxnmauto' in t.dataset){db.settings.autoTaName=t.checked;touch('settings','auto Tamil names '+t.checked);}});
 addDict([['Tamil names','தமிழ் பெயர்கள்'],['devotees have a Tamil name.','பக்தர்களுக்கு தமிழ் பெயர் உள்ளது.'],['Accept all suggestions shown','காட்டப்பட்ட அனைத்து பரிந்துரைகளையும் ஏற்கவும்'],['Missing only','இல்லாதவை மட்டும்'],['Everyone','அனைவரும்'],['saved','சேமிக்கப்பட்டது'],['Search…','தேடு…'],['Show more','மேலும் காட்டு'],['Nothing to show.','காட்ட எதுவும் இல்லை.']]);
});
})();
