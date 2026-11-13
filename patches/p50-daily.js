/* =====================================================================
   v10 DAILY — thought picture WITH DATE · Today's panchangam (text or picture) · WhatsApp groups checklist · subscribers get panchangam
   ===================================================================== */
(function(){
'use strict';
const X=window.PX10;if(!X||!X.core)return;const {mod,setG,tx,E,$q,addDict,sleep,have}=X;
mod('Daily thought + panchangam',['VIEWS','A','S','db','thoughtFor','devMsg','CL_L','bannerFile','bnNew','modal','closeModal','toast','iso','devSubscribers','openPicker'],()=>{
 const dp=S.dp=S.dp||{what:'thought',lang:'ta',date:true,pan:false,size:'sq',th:0};
 const saved=()=>Object.assign(dp,DEV.get().dailyOpt||{});saved();
 const keep=()=>DEV.set({dailyOpt:{what:dp.what,lang:dp.lang,date:dp.date,pan:dp.pan,size:dp.size,th:dp.th}});
 const ds=()=>X.isoNow();
 /* ---------- texts ---------- */
 const LB={ta:{pan:'இன்றைய பஞ்சாங்கம்',th:'இன்றைய சிந்தனை'},en:{pan:'Today’s Panchangam',th:'Thought for today'}};
 X.dailyText=function(o){o=Object.assign({},dp,o||{});const out=[],one=lc=>{const d=X.dateStr(ds(),lc),parts=[];if(o.date)parts.push('📅 '+d);
   if(o.what==='thought'||o.what==='both')parts.push('🙏 '+thoughtFor(lc,ds()));
   if(o.what==='panchang'||o.what==='both')parts.push(X.panFull(ds(),lc).replace(/^📅[^\n]*\n/,'').trim());
   if(o.pan&&o.what==='thought'){const l=X.panLine(ds(),lc);if(l)parts.push('🔱 '+l);}
   parts.push(CL_L[lc]);return parts.join('\n\n');};
  if(o.lang==='both')return one('ta')+'\n\n— — —\n\n'+one('en');return one(o.lang==='en'?'en':'ta');};
 /* ---------- picture ---------- */
 const rowsOf=(lc)=>X.panFull(ds(),lc).split('\n').slice(1).filter(Boolean);
 X.dailyDesign=function(o){o=Object.assign({},dp,o||{});const lc=o.lang==='en'?'en':'ta',des=Object.assign(bnNew('blank',lc),{name:'daily',size:o.size,th:o.th,tsz:.8,logo:true,temple:true,frame:true,tl:lc==='ta'&&db.settings.templeNameTa?'ta':'en',date:o.date||o.what==='panchang'?'today':'',pan:!!(o.pan&&o.what==='thought'),sub:'',lines:'',footer:CL_L[lc],qr:'',qrText:''});
  if(o.what==='thought'){des.title=thoughtFor(lc,ds());if(o.lang==='both')des.lines=thoughtFor('en',ds());}
  else if(o.what==='panchang'){des.title=LB[lc].pan;des.lines=rowsOf(lc).join('\n');des.tsz=.7;}
  else{des.title=thoughtFor(lc,ds());des.lines=rowsOf(lc).slice(0,6).join('\n');des.tsz=.7;}
  if((o.what==='panchang'||o.what==='both')&&des.size==='sq')des.size='pt';return des;};
 X.dailyPicture=async function(o){return bannerFile(X.dailyDesign(o),{});};
 /* ---------- the picture sheet ---------- */
 let pf={url:'',file:null,err:''};
 const chip=(act,k,cur,l)=>`<button type="button" class="chip${cur===k?' on':''}" data-act="${act}" data-k="${k}">${E(tx(l))}</button>`;
 const THN=['Temple','Saffron','Green','Blue','Cream','Night'],THC=['#8c2410','#b45309','#14532d','#1e3a8a','#f7d9a3','#1c1b3a'];
 async function make(){const box=$q('#pxDpf');if(!box)return;box.innerHTML=`<p class="mut"><span class="spin"></span>${E(tx('Making the picture…'))}</p>`;
  try{if(pf.url)URL.revokeObjectURL(pf.url);pf.file=await X.dailyPicture();pf.url=URL.createObjectURL(pf.file);pf.err='';}catch(e){pf.err=e.message||String(e);X.errs.push('daily picture: '+(e.stack||e));pf.file=null;}show();}
 function show(){const box=$q('#pxDpf');if(!box)return;
  const opts=`<label>${E(tx('What to show'))}</label><div class="chips">${chip('pxDpWhat','thought',dp.what,'Thought')}${chip('pxDpWhat','panchang',dp.what,'Panchangam')}${chip('pxDpWhat','both',dp.what,'Both')}</div>
   <label>${E(tx('Language'))}</label><div class="chips">${chip('pxDpLang','ta',dp.lang,'தமிழ்')}${chip('pxDpLang','en',dp.lang,'English')}${dp.what==='thought'?chip('pxDpLang','both',dp.lang,'Both'):''}</div>
   <label class="chk" style="padding:6px 0"><input type="checkbox" data-pxdpd ${dp.date?'checked':''}> ${E(tx('Show today’s date'))}</label>${dp.what==='thought'?`<label class="chk" style="padding:6px 0"><input type="checkbox" data-pxdpp ${dp.pan?'checked':''}> ${E(tx('Add the panchangam line'))}</label>`:''}
   <div class="swrow" style="margin:6px 0">${THN.map((n,i)=>`<button type="button" class="swb${dp.th===i?' on':''}" data-act="pxDpTh" data-k="${i}" aria-label="${n}" style="background:linear-gradient(135deg,${THC[i]} 50%,#e8a317 50%)"></button>`).join('')}</div><div class="chips">${chip('pxDpSz','sq',dp.size,'Square')}${chip('pxDpSz','pt',dp.size,'Portrait')}${chip('pxDpSz','st',dp.size,'Status')}</div>`;
  box.innerHTML=pf.file?`<img class="pxprev" src="${pf.url}" alt="" style="display:block;width:100%;max-height:46vh;object-fit:contain;border-radius:12px;background:#111">${opts}
   <div class="menu" style="margin-top:6px"><button type="button" class="mi" data-act="pxDpWa">${ico('sms')}<span><b>${E(tx('Send on WhatsApp'))}</b><div class="mut">${E(tx('Choose a group or one person'))}</div></span></button><button type="button" class="mi" data-act="pxDpSubs">${ico('megaphone')}<span><b>${E(tx('Send the text to my subscribers'))}</b> (${devSubscribers().length})</span></button>${have('PX10')&&X.voiceFromText?`<button type="button" class="mi" data-act="pxDpVoice">${ico('mic')}<span>${E(tx('Make an AI voice note'))}</span></button>`:''}${X.shortFromText?`<button type="button" class="mi" data-act="pxDpShort">${ico('video')}<span>${E(tx('Make a short video with music'))}</span></button>`:''}<button type="button" class="mi" data-act="pxDpSave">${ico('down')}<span>${E(tx('Save to phone'))}</span></button><button type="button" class="mi" data-act="pxDpCopy">${ico('edit')}<span>${E(tx('Copy the text'))}</span></button></div>`
   :`<div class="warn"><b>${E(tx('The picture could not be made.'))}</b><div class="mut" style="margin-top:4px">${E(pf.err)}</div></div>${opts}<div class="bar"><button type="button" class="btn" data-act="pxDpRetry">${E(tx('Try again'))}</button><button type="button" class="btn" data-act="pxDpCopy">${E(tx('Copy the text'))}</button></div>`;}
 X.dailyOpen=function(init){Object.assign(dp,init||{});pf={url:'',file:null,err:''};modal(tx('Daily post'),`<div id="pxDpf"></div>`,null,{bottom:true,noSave:true});make();};
 const re=(patch)=>{Object.assign(dp,patch);if(dp.what!=='thought'&&dp.lang==='both')dp.lang='ta';keep();make();};
 A.pxDpWhat=d=>re({what:d.k});A.pxDpLang=d=>re({lang:d.k});A.pxDpTh=d=>re({th:+d.k});A.pxDpSz=d=>re({size:d.k});A.pxDpRetry=()=>make();
 document.addEventListener('change',e=>{const t=e.target;if(!t.dataset)return;if('pxdpd' in t.dataset)re({date:t.checked});else if('pxdpp' in t.dataset)re({pan:t.checked});else if('pxdpa' in t.dataset){db.settings.devo=db.settings.devo||{};db.settings.devo.pan=t.checked;touch('devotional settings');toast(tx('Saved'));}});
 A.pxDpWa=()=>{if(!pf.file)return;closeModal();setTimeout(()=>X.waTarget({title:'Daily post',text:X.dailyText(),files:[pf.file]}),60);};
 A.pxDpSave=()=>{if(pf.file){X.dl(pf.file);toast(tx('Saved to your phone'));}};A.pxDpCopy=async()=>{toast((await X.copy(X.dailyText()))?tx('Copied'):tx('Could not copy'));};
 A.pxDpSubs=()=>{closeModal();setTimeout(()=>A.dvSendNowV10(),60);};
 A.pxDpVoice=()=>{closeModal();setTimeout(()=>X.voiceFromText(X.dailyText({date:true}).replace(/📅[^\n]*\n\n?/,''),{lang:dp.lang==='en'?'en':'ta',title:tx('Daily post')}),60);};
 A.pxDpShort=()=>{closeModal();setTimeout(()=>X.shortFromText(X.dailyText({date:false}).replace(/[📅🙏🔱]/gu,'').trim(),{lang:dp.lang==='en'?'en':'ta'}),60);};
 A.dvShare=()=>X.dailyOpen({});
 A.dvSendNowV10=()=>{const subs=devSubscribers();if(!subs.length)return toast(tx('No subscribers yet.'));S.bc=BCNEW();S.bc.ids=subs.map(v=>v.id);S.bc.tpl='';S.bc.text='🙏 {name}\n'+X.dailyText({date:true,lang:'ta'===dp.lang?'ta':'en'}).replace(/^📅[^\n]*\n\n?/,'');S.bc.mode='one';go('broadcast');};
 A.dvSendNow=A.dvSendNowV10;
 A.dvCopy=async()=>{toast((await X.copy(X.dailyText()))?tx('Copied'):tx('Could not copy'));};
 /* ---------- WhatsApp groups checklist ---------- */
 const grpList=()=>(db.groups||[]).filter(g=>g.link&&/^https:\/\/chat\.whatsapp\.com\//.test(g.link));
 const dpost=()=>{const t=ds();let o=db.settings.dpost;if(!o||o.d!==t){o=db.settings.dpost={d:t,done:[]};}return o;};
 const daily=g=>g.daily&&g.daily.on;
 X.dailyPending=()=>{const o=db.settings.dpost&&db.settings.dpost.d===ds()?db.settings.dpost:{done:[]};return grpList().filter(g=>daily(g)&&!o.done.includes(g.id));};
 const WH=[['thought','Thought'],['panchang','Panchangam'],['both','Both']],FM=[['text','Text'],['picture','Picture']];
 A.pxGrpAdd=()=>modal(tx('Add a WhatsApp group'),`<label>${E(tx('Group name'))} *</label><input name="n" required autocomplete="off"><label style="margin-top:8px">${E(tx('Group invite link'))} *</label><input name="l" required inputmode="url" autocapitalize="none" placeholder="https://chat.whatsapp.com/…"><p class="mut" style="margin:6px 0 0">${E(tx('In the group: group name → Invite via link → Copy link.'))}</p>`,f=>{const n=(f.get('n')||'').trim(),l=(f.get('l')||'').replace(/\s/g,'');if(!n)throw new Error(tx('Enter the group name.'));if(!X.isGroupLink(l))throw new Error(tx('The link must start with https://chat.whatsapp.com/'));if(db.groups.some(g=>g.link===l))throw new Error(tx('That group is already added.'));
  db.groups.push({id:uid(),name:n,desc:'',link:l,rules:{},manual:[],exclude:[],wa:true,daily:{on:true,what:'both',fmt:'text'},created:new Date().toISOString()});touch('group add',n);render();});
 A.pxGrpCfg=d=>{const g=db.groups.find(x=>x.id===d.id);if(!g)return;g.daily=g.daily||{on:false,what:'thought',fmt:'text'};
  const c=(act,k,cur,l)=>`<button type="button" class="chip${cur===k?' on':''}" data-act="${act}" data-id="${g.id}" data-k="${k}">${E(tx(l))}</button>`;
  modal(E(g.name),`<label class="chk" style="padding:6px 0"><input type="checkbox" data-pxgd="${g.id}" ${g.daily.on?'checked':''}> ${E(tx('Post here every day'))}</label><label>${E(tx('What to post'))}</label><div class="chips">${WH.map(x=>c('pxGrpWhat',x[0],g.daily.what,x[1])).join('')}</div><label>${E(tx('As'))}</label><div class="chips">${FM.map(x=>c('pxGrpFmt',x[0],g.daily.fmt,x[1])).join('')}</div>
   <div class="menu" style="margin-top:8px"><a class="mi" target="_blank" rel="noopener" href="${E(g.link)}">${ico('sms')}<span>${E(tx('Open the group'))}</span></a><button type="button" class="mi bad" data-act="pxGrpDel" data-id="${g.id}">${ico('del')}<span>${E(tx('Remove from the list'))}</span></button></div>`,null,{bottom:true,noSave:true});};
 document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.pxgd){const g=db.groups.find(x=>x.id===t.dataset.pxgd);if(g){g.daily=g.daily||{what:'thought',fmt:'text'};g.daily.on=t.checked;touch('group daily',g.name);render();}}});
 A.pxGrpWhat=d=>{const g=db.groups.find(x=>x.id===d.id);g.daily.what=d.k;touch('group daily',g.name);A.pxGrpCfg({id:g.id});};A.pxGrpFmt=d=>{const g=db.groups.find(x=>x.id===d.id);g.daily.fmt=d.k;touch('group daily',g.name);A.pxGrpCfg({id:g.id});};
 A.pxGrpDel=d=>{const g=db.groups.find(x=>x.id===d.id);if(!g||!confirm(tx('Remove this group from the list? (The WhatsApp group itself is not affected.)')))return;db.groups=db.groups.filter(x=>x.id!==g.id);touch('group delete',g.name);closeModal();render();};
 A.pxGrpPost=async d=>{const g=db.groups.find(x=>x.id===d.id);if(!g)return;const o=dpost(),cf=g.daily||{what:'thought',fmt:'text'},text=X.dailyText({what:cf.what,lang:dp.lang,date:true});
  const markDone=()=>{if(!o.done.includes(g.id)){o.done.push(g.id);touch('daily group post',g.name);}render();};
  if(cf.fmt==='picture'){toast(tx('Making the picture…'));let f;try{f=await X.dailyPicture({what:cf.what,date:true});}catch(e){return toast(e.message);}await X.copy(text);const r=await PX.share({files:[f],text,title:g.name});if(r==='shared')markDone();return;}
  await X.copy(text);toast(tx('Message copied — paste it in the group and tap Send.'));window.open(g.link,'_blank','noopener');markDone();};
 A.pxGrpUndo=d=>{const o=dpost();o.done=o.done.filter(x=>x!==d.id);touch();render();};
 /* ---------- the Daily screen ---------- */
 const _v=VIEWS.devo;
 VIEWS.devo=()=>{const tab=S.dv.tab;if(tab!=='today')return _v();
  const seg=`<div class="seg">${[['today','Today'],['days','Special days'],['people','Subscribers'],['mine','My thoughts']].map(x=>`<button type="button" class="${tab===x[0]?'on':''}" data-act="dvTab" data-v="${x[0]}">${E(tx(x[1]))}</button>`).join('')}</div>`;
  const t=ds(),lc=S.lang==='ta'?'ta':'en',pan=X.pan(t),adm=can('write'),gs=grpList(),o=db.settings.dpost&&db.settings.dpost.d===t?db.settings.dpost:{done:[]};
  const tags=(X.panTags(t)||[]).map(k=>(PCH.TAGL[k]||[k,k])[lc==='ta'?1:0]);
  return seg+`<div class="hero2"><div class="mut2">${E(X.dateStr(t,'ta'))}<br>${E(X.dateStr(t,'en'))}</div><h2 style="font-size:20px;line-height:1.35;margin-top:8px">${E(thoughtFor(lc,t))}</h2><p>${E(CL_L[lc])}</p></div>
  ${pan?`<div class="card"><h3>🔱 ${E(tx('Today’s panchangam'))}</h3><div class="mut" style="white-space:pre-line;font-size:calc(14px*var(--fs,1));line-height:1.55">${E(pan.full[lc].replace(/^📅[^\n]*\n/,'📅 '+X.dateStr(t,lc)+'\n'))}</div><p class="mut" style="margin:6px 0 0;font-size:12px">${E(tx('Calculated from the Sun and Moon positions for Thiruninravur. Times can differ by a few minutes from printed panchangams — check your temple’s own for festivals.'))}</p></div>`:''}
  <div class="card"><h3>${E(tx('Send today’s post'))}</h3><div class="bar" style="margin:0"><button type="button" class="btn pri" data-act="pxDpOpen" data-w="thought" style="flex:1">${ico('photo','sm')} ${E(tx('Thought'))}</button><button type="button" class="btn pri" data-act="pxDpOpen" data-w="panchang" style="flex:1">${ico('photo','sm')} ${E(tx('Panchangam'))}</button><button type="button" class="btn pri" data-act="pxDpOpen" data-w="both" style="flex:1">${ico('photo','sm')} ${E(tx('Both'))}</button></div>
   <div class="bar"><button type="button" class="btn" data-act="pxDpText">${ico('sms','sm')} ${E(tx('Send as text'))}</button><button type="button" class="btn" data-act="dvCopy">📋 ${E(tx('Copy'))}</button>${X.voiceFromText?`<button type="button" class="btn" data-act="pxDpVoice2">${ico('mic','sm')} ${E(tx('Voice'))}</button>`:''}</div>
   <p class="mut" style="margin:0">${E(tx('Each opens the picture or text first, then you choose WhatsApp (a group or one person) or another app.'))}</p></div>
  ${adm?`<div class="card"><h3>${E(tx('My WhatsApp groups'))}</h3>${gs.length?gs.map(g=>{const on=daily(g),done=o.done.includes(g.id);return`<div class="arow" style="padding:8px 0"><div style="flex:1;min-width:0"><b>${E(g.name)}</b><div class="mut">${on?E(tx((WH.find(x=>x[0]===g.daily.what)||[0,'Thought'])[1]))+' · '+E(tx((FM.find(x=>x[0]===g.daily.fmt)||[0,'Text'])[1])):E(tx('Not posted daily'))}</div></div><div class="acts">${on?(done?`<button type="button" class="btn sm" data-act="pxGrpUndo" data-id="${g.id}">✓ ${E(tx('Done'))}</button>`:`<button type="button" class="btn pri sm" data-act="pxGrpPost" data-id="${g.id}">${E(tx('Post now'))}</button>`):''}<button type="button" class="ib dark" data-act="pxGrpCfg" data-id="${g.id}" aria-label="Settings">${ico('edit')}</button></div></div>`;}).join(''):`<p class="mut" style="margin:0 0 6px">${E(tx('Add the temple’s WhatsApp groups with their invite links. Then “Post now” copies the message and opens that exact group — you only paste and tap Send.'))}</p>`}
   <div class="bar" style="margin-top:6px"><button type="button" class="btn sm" data-act="pxGrpAdd">+ ${E(tx('Add a WhatsApp group'))}</button></div>
   <p class="mut" style="margin:6px 0 0;font-size:12px">${E(tx('WhatsApp does not let any app post into a normal group by itself. This checklist makes it two taps per group.'))}</p></div>
  <div class="card"><label class="chk"><input type="checkbox" data-pxdpa ${(db.settings.devo||{}).pan?'checked':''}> ${E(tx('Add the panchangam to the daily message sent to subscribers'))}</label></div>`:''}`;};
 A.pxDpOpen=d=>X.dailyOpen({what:d.w,lang:dp.lang==='both'&&d.w!=='thought'?'ta':dp.lang});
 A.pxDpText=()=>X.waTarget({title:'Daily post',text:X.dailyText({date:true})});
 A.pxDpVoice2=()=>X.voiceFromText(X.dailyText({date:false}).replace(/[📅🙏🔱]/gu,'').trim(),{lang:dp.lang==='en'?'en':'ta',title:tx('Daily post')});
 /* Home card */
 const _d=VIEWS.dash;VIEWS.dash=()=>{let h=_d();if(!can('write'))return h;const n=X.dailyPending().length;if(!n)return h;
  return h.replace('<div class="qa-grid">',`<div class="card" data-act="go" data-v="devo" style="cursor:pointer;border-left:4px solid var(--acc);display:flex;gap:10px;align-items:center"><div style="flex:1"><b>${n} ${E(tx('daily WhatsApp post(s) waiting'))}</b></div><span class="btn pri sm">${E(tx('Open'))}</span></div><div class="qa-grid">`);};
 /* subscribers get the panchangam too (the Google script sends it every morning) */
 if(have('buildOutbox')){const _b=buildOutbox;setG('buildOutbox',function(){const days=_b.apply(this,arguments);if(!(db.settings.devo||{}).pan)return days;
   Object.keys(days).forEach(k=>{(days[k].bulk||[]).forEach(b=>{if(/^dv\|/.test(b.id)){const lc=b.lang==='ta'?'ta':'en',l=X.panLine(k,lc);if(l){b.th=(b.th+' '+(lc==='ta'?'🔱 ':'🔱 ')+l).slice(0,700);b.text=String(b.text||'').replace(/(\n|$)/,' 🔱 '+l+'$1');}}});});return days;});}
 /* panchangam is also remembered for the reply bot */
 addDict([['Daily post','தினசரி பதிவு'],['What to show','எதைக் காட்ட'],['Thought','சிந்தனை'],['Panchangam','பஞ்சாங்கம்'],['Both','இரண்டும்'],['Show today’s date','இன்றைய தேதியைக் காட்டு'],['Add the panchangam line','பஞ்சாங்க வரியைச் சேர்'],['Send on WhatsApp','WhatsApp-ல் அனுப்பு'],['Choose a group or one person','குழு அல்லது ஒருவரைத் தேர்வு செய்'],['Send the text to my subscribers','உரையை என் சந்தாதாரர்களுக்கு அனுப்பு'],['Make an AI voice note','AI குரல் செய்தி உருவாக்கு'],['Make a short video with music','இசையுடன் சிறு வீடியோ உருவாக்கு'],['Copy the text','உரையை நகலெடு'],['Today’s panchangam','இன்றைய பஞ்சாங்கம்'],['Send today’s post','இன்றைய பதிவை அனுப்பு'],['Send as text','உரையாக அனுப்பு'],['My WhatsApp groups','என் WhatsApp குழுக்கள்'],['Add a WhatsApp group','WhatsApp குழுவைச் சேர்'],['Post now','இப்போது பதிவிடு'],['Post here every day','தினமும் இங்கே பதிவிடு'],['What to post','எதைப் பதிவிட'],['As','வடிவம்'],['Text','உரை'],['Picture','படம்'],['Open the group','குழுவைத் திற'],['Group name','குழுவின் பெயர்'],['Group invite link','குழு அழைப்பு இணைப்பு'],['Add the panchangam to the daily message sent to subscribers','சந்தாதாரர்களுக்கு அனுப்பும் தினசரி செய்தியில் பஞ்சாங்கத்தையும் சேர்'],['daily WhatsApp post(s) waiting','தினசரி WhatsApp பதிவு(கள்) காத்திருக்கின்றன']]);
});
})();
