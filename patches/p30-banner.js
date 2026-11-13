/* =====================================================================
   v10 BANNER — new layout engine (QR never removes text), QR choices (chat / channel / group / link) with link boxes,
   date + panchangam on the picture, translate buttons
   ===================================================================== */
(function(){
'use strict';
const X=window.PX10;if(!X||!X.core)return;const {mod,setG,tx,E,$q,addDict,have}=X;
const CHAN=/^https:\/\/(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9_-]{6,}/i,GROUP=/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]{8,}/i;
const cleanLink=s=>String(s||'').replace(/[\s\u200B-\u200D\uFEFF]/g,'');
X.isChannelLink=u=>CHAN.test(cleanLink(u));X.isGroupLink=u=>GROUP.test(cleanLink(u));
mod('Banner: layout engine v3 + QR types',['renderBanner','BN_SIZES','bnPal','bnFillStr','fitText','wrapLines','rrect','bnLogoImg','bnQrText','QR','BN_FONT','thGold','loadImg','db','VIEWS','S','A'],()=>{
 /* ---- what each QR code points to ---- */
 setG('bnQrText',function(d){
  if(d.qr==='wa'){const n=String(db.settings.waTemple||'').replace(/\D/g,'');return n.length>=10?'https://wa.me/'+(n.length===10?(db.settings.cc||'91')+n:n):'';}
  if(d.qr==='channel'){const u=cleanLink(db.settings.channelLink);return CHAN.test(u)?u:'';}
  if(d.qr==='group'){const u=cleanLink(db.settings.groupLink);return GROUP.test(u)?u:'';}
  if(d.qr==='text'){const u=String(d.qrText||'').trim();return u.length<=380?u:'';}return'';});
 const CAP={wa:['Scan to chat on WhatsApp','WhatsApp-ல் பேச ஸ்கேன் செய்யவும்'],channel:['Scan to follow our WhatsApp Channel','எங்கள் WhatsApp சேனலைப் பின்தொடர ஸ்கேன் செய்யவும்'],group:['Scan to join our WhatsApp group','WhatsApp குழுவில் சேர ஸ்கேன் செய்யவும்'],text:['Scan for details','விவரங்களுக்கு ஸ்கேன் செய்யவும்']};
 /* attempts, best first: keep ALL the words, shrink the QR / move it beside the footer before dropping anything */
 const SEQ={auto:[[1,'full'],[1,'side'],[.9,'side'],[.9,'compact'],[.8,'compact'],[.7,'compact'],[.7,'mini'],[.62,'mini']],bottom:[[1,'full'],[.9,'full'],[.8,'full'],[.7,'full'],[.7,'compact'],[.62,'mini']],right:[[1,'side'],[.9,'side'],[.8,'side'],[.7,'compact'],[.62,'mini']],left:[[1,'side'],[.9,'side'],[.8,'side'],[.7,'compact'],[.62,'mini']]};
 const NOQR=[[1,'none'],[.92,'none'],[.84,'none'],[.76,'none'],[.68,'none'],[.6,'none']];
 const dateTxt=(d,lc)=>{if(!d.date)return'';const iso=d.date==='today'?X.isoNow():d.date;return X.dateStr(iso,lc);};
 const panTxt=(d,lc)=>{if(!d.pan)return'';const iso=(d.date&&d.date!=='today')?d.date:X.isoNow(),o=X.pan(iso);return o?o.short[lc]:'';};
 async function render3(d,vars,cv,scale){
  const dim=BN_SIZES[d.size]||BN_SIZES.sq,W=dim[0],H=dim[1],pal=bnPal()[d.th]||bnPal()[0],tc=pal[3],ac=pal[4];scale=scale||1;cv.width=Math.round(W*scale);cv.height=Math.round(H*scale);
  const x=cv.getContext('2d');x.save();x.scale(scale,scale);x.textBaseline='top';x.textAlign='center';
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,pal[1]);g.addColorStop(1,pal[2]);x.fillStyle=g;x.fillRect(0,0,W,H);
  if(d.photo){try{const im=await loadImg(d.photo),k=Math.max(W/im.width,H/im.height),w=im.width*k,h=im.height*k;x.drawImage(im,(W-w)/2,(H-h)/2,w,h);x.fillStyle='rgba(0,0,0,'+Math.max(0,Math.min(.85,d.dim))+')';x.fillRect(0,0,W,H);}catch(e){}}
  else{x.globalAlpha=.07;x.fillStyle=tc;for(let i=0;i<7;i++){x.beginPath();x.arc(W*(.1+.14*i),H*(i%2?.12:.9),W*.18,0,7);x.fill();}x.globalAlpha=1;}
  if(d.frame){x.strokeStyle=ac;x.lineWidth=6;rrect(x,26,26,W-52,H-52,30);x.stroke();x.lineWidth=2;rrect(x,44,44,W-88,H-88,22);x.stroke();}
  const P=Math.round(W*.09),cx=W/2,maxW=W-2*P,tsz=d.tsz||1,tl=d.tl==='ta'&&db.settings.templeNameTa?'ta':'en',lc=d.tl==='ta'?'ta':'en';
  const qrTxt=d.qr?bnQrText(d):'',hasQr=!!qrTxt;
  const T={title:bnFillStr(d.title,vars),sub:bnFillStr(d.sub,vars),lines:bnFillStr(d.lines,vars),foot:bnFillStr(d.footer,vars)};
  const nmTxt=tl==='ta'?db.settings.templeNameTa:db.settings.templeName,capFull=hasQr&&d.qrCap!==false?(CAP[d.qr]||CAP.text)[lc==='ta'?1:0]:'';
  const dt=dateTxt(d,lc),pn=panTxt(d,lc);
  function plan(k,qm,drop){
   const R={};let y=P;const lr=d.logo?Math.round(W*.06*Math.min(1,.5+k*.5)):0;R.logo=lr?{x:cx-lr-6,y,w:2*lr+12,h:2*lr+12,r:lr}:null;if(lr)y+=2*lr+12+14;
   R.name=null;if(d.temple&&drop<4&&nmTxt){const f=fitText(x,nmTxt,maxW,Infinity,Math.max(18,W*.032*Math.min(1,.55+k*.45)),16,'700',1.3);R.name={f,x:cx-maxW/2,y,w:maxW,h:f.h};y+=f.h+12;}
   const headerBottom=y,side=qm==='side'||qm==='compact'||qm==='mini',pos=d.qrPos==='left'?'left':'right';
   let qs=0,ps=0,capF=null,qbW=0,qbH=0;
   if(hasQr&&qm!=='none'){qs=Math.round(W*({full:.2,side:.17,compact:.15,mini:.125}[qm]||.17));qs=Math.max(110,qs);ps=qs+24;const capOn=capFull&&(qm==='full'||qm==='side');qbW=side?ps+8:Math.min(maxW,Math.max(ps,ps+150));capF=capOn?fitText(x,capFull,side?ps+20:qbW,Infinity,Math.max(16,W*.024),14,'600',1.25):{h:0,lines:[],sz:0};qbH=ps+(capF.h?capF.h+8:0);}
   const ftW=side&&hasQr?maxW-qbW-18:maxW,ft=T.foot?fitText(x,T.foot,Math.max(120,ftW-60),Infinity,Math.max(20,W*.04*tsz*Math.min(1,.55+k*.45)),18,'600',1.32):null;
   if(ft&&k<.7&&ft.lines.length>2){ft.lines=ft.lines.slice(0,2);ft.lines[1]=ft.lines[1].replace(/\s*\S{0,3}$/,'')+'…';ft.h=2*ft.sz*ft.lh;}
   const ftH=ft?ft.h+34:0;let chip=null,chipH=0;
   if(dt||pn){const lines=[dt,pn].filter(Boolean),fs=Math.max(18,W*.03*Math.min(1,.6+k*.4)),cf=lines.map(l=>fitText(x,l,maxW-60,Infinity,fs,16,'600',1.25));const th=cf.reduce((s,f)=>s+f.h,0);chip={cf,h:th+22};chipH=chip.h;}
   let bottom=H-P;
   if(hasQr&&qm!=='none'&&!side){R.qr={x:cx-qbW/2,y:bottom-qbH,w:qbW,h:qbH,ps,qs,capF};bottom-=qbH+(ftH||chipH?14:0);}
   if(ftH||(side&&hasQr)){const rowH=side&&hasQr?Math.max(ftH,qbH):ftH,top=bottom-rowH;
    if(side&&hasQr){const qx=pos==='left'?cx-maxW/2:cx+maxW/2-qbW;R.qr={x:qx,y:top+(rowH-qbH)/2,w:qbW,h:qbH,ps,qs,capF};R.footer=ft?{f:ft,x:pos==='left'?cx-maxW/2+qbW+18:cx-maxW/2,y:top,w:maxW-qbW-18,h:rowH}:null;}
    else R.footer={f:ft,x:cx-maxW/2,y:top,w:maxW,h:rowH};bottom=top-(chipH?12:0);}
   if(chip){R.chip={x:cx-maxW/2,y:bottom-chipH,w:maxW,h:chipH,cf:chip.cf};bottom-=chipH+14;}
   const bodyTop=headerBottom+8,bodyH=bottom-bodyTop;
   const bf=(txt,base,min,w,lh)=>txt?fitText(x,txt,maxW,Infinity,Math.max(min,base*k),min,w,lh):null;
   const ti=bf(T.title,W*.12*tsz,34,'800',1.18),su=drop<2?bf(T.sub,W*.056*tsz,24,'600',1.25):null,li=drop<1?bf(T.lines,W*.046*tsz,22,'500',1.4):null;
   const parts=[ti,su,li].filter(Boolean),rule=ti&&(su||li)?28:0,total=parts.reduce((s,b)=>s+b.h,0)+Math.max(0,parts.length-1)*16+rule;
   return{R,bodyTop,bodyH,ti,su,li,total,rule,fits:total<=bodyH+.5,k,qm,drop};}
  const base=hasQr?(SEQ[d.qrPos&&SEQ[d.qrPos]?d.qrPos:'auto']):NOQR;let best=null;
  outer:for(const drop of [0,1,2,4]){for(const [k,qm] of base){const p=plan(k,qm,drop);best=p;if(p.fits)break outer;}}
  if(!best.fits&&best.ti){const f=best.ti,maxL=Math.max(1,Math.floor((best.bodyH-best.rule)/(f.sz*f.lh)));if(f.lines.length>maxL){f.lines=f.lines.slice(0,maxL);f.lines[maxL-1]=f.lines[maxL-1].replace(/\s*\S{0,3}$/,'')+'…';f.h=f.lines.length*f.sz*f.lh;}best.su=null;best.li=null;best.total=f.h;best.rule=0;}
  const B=best,R=B.R,rects={};
  if(R.logo){const l=R.logo;x.save();x.shadowColor='transparent';x.beginPath();x.arc(cx,l.y+l.h/2,l.r+6,0,7);x.fillStyle=ac;x.fill();x.beginPath();x.arc(cx,l.y+l.h/2,l.r,0,7);x.clip();x.fillStyle='#fff';x.fillRect(cx-l.r,l.y+6,2*l.r,2*l.r);try{x.drawImage(await bnLogoImg(),cx-l.r,l.y+6,2*l.r,2*l.r);}catch(e){}x.restore();rects.logo={x:l.x,y:l.y,w:l.w,h:l.h};}
  if(R.name){const n=R.name;x.fillStyle=tc;x.font=`700 ${n.f.sz}px ${BN_FONT}`;n.f.lines.forEach((ln,i)=>x.fillText(ln,cx,n.y+i*n.f.sz*1.3));rects.name={x:n.x,y:n.y,w:n.w,h:n.h};}
  const sh=!!d.photo;if(sh){x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=10;}
  let by=B.bodyTop+Math.max(0,(B.bodyH-B.total)/2);const put=(b,col,key)=>{if(!b)return;x.font=`${b.weight} ${b.sz}px ${BN_FONT}`;x.fillStyle=col;b.lines.forEach((ln,i)=>x.fillText(ln,cx,by+i*b.sz*b.lh));rects[key]={x:cx-maxW/2,y:by,w:maxW,h:b.h};by+=b.h;};
  put(B.ti,tc,'title');if(B.ti&&(B.su||B.li)){x.save();x.shadowColor='transparent';x.strokeStyle=ac;x.lineWidth=4;x.beginPath();x.moveTo(cx-90,by+10);x.lineTo(cx+90,by+10);x.stroke();x.restore();by+=28;}
  if(B.su){put(B.su,d.th===4?ac:'#fff3c4','sub');if(B.li)by+=16;}put(B.li,tc,'lines');x.shadowColor='transparent';x.shadowBlur=0;
  if(R.chip){const c=R.chip;x.save();x.fillStyle=d.th===4?'rgba(140,36,16,.14)':'rgba(255,255,255,.16)';rrect(x,c.x,c.y,c.w,c.h,c.h/2>40?30:c.h/2);x.fill();x.restore();let yy=c.y+11;c.cf.forEach((f,i)=>{x.font=`${f.weight} ${f.sz}px ${BN_FONT}`;x.fillStyle=i===0?tc:(d.th===4?ac:'#fff3c4');f.lines.forEach((ln,j)=>x.fillText(ln,cx,yy+j*f.sz*f.lh));yy+=f.h;});rects.chip={x:c.x,y:c.y,w:c.w,h:c.h};}
  if(R.qr){const q=R.qr,px0=q.x+(q.w-q.ps)/2;x.save();x.shadowColor='transparent';x.fillStyle='#fff';rrect(x,px0,q.y,q.ps,q.ps,16);x.fill();try{QR.draw(x,qrTxt,px0+12,q.y+12,q.qs,{margin:1});}catch(e){}x.restore();
   if(q.capF&&q.capF.h){x.fillStyle=tc;x.font=`600 ${q.capF.sz}px ${BN_FONT}`;q.capF.lines.forEach((ln,i)=>x.fillText(ln,q.x+q.w/2,q.y+q.ps+8+i*q.capF.sz*1.25));}rects.qr={x:q.x,y:q.y,w:q.w,h:q.h};rects.qrPlate={x:px0,y:q.y,w:q.ps,h:q.ps,qs:q.qs};}
  if(R.footer){const f=R.footer;x.save();x.shadowColor='transparent';x.fillStyle=d.th===4?'rgba(140,36,16,.12)':'rgba(0,0,0,.30)';if(f.f){const fh=f.f.h+34,fy=f.y+(f.h-fh)/2;rrect(x,f.x,fy,f.w,fh,26);x.fill();x.restore();x.font=`${f.f.weight} ${f.f.sz}px ${BN_FONT}`;x.fillStyle=tc;f.f.lines.forEach((ln,i)=>x.fillText(ln,f.x+f.w/2,fy+17+i*f.f.sz*f.f.lh));rects.footer={x:f.x,y:fy,w:f.w,h:fh};}else x.restore();}
  x.restore();cv.__rects=rects;cv.__dim=[W,H];cv.__plan={k:B.k,qm:B.qm,drop:B.drop,fits:B.fits};
  if(cv.id==='bnCv'){const w=document.getElementById('pxBnWarn');if(w){const m=B.drop>=4?'The temple name was left out so everything fits. Choose the Portrait or Status shape for more room.':B.drop===2?'The subtitle was left out so everything fits. Choose the Portrait or Status shape for more room.':B.drop===1?'The “More lines” text was left out so everything fits. Choose the Portrait or Status shape for more room.':(B.qm==='compact'||B.qm==='mini')&&hasQr?'The QR code was made smaller to keep all your text. The Portrait shape gives a bigger QR.':'';w.style.display=m?'block':'none';w.textContent=m?tx(m):'';}}
  X.lastBanner={rects,W,H,plan:cv.__plan};return cv;}
 setG('renderBanner',render3);X.renderBanner3=render3;
 /* ---- banner screen: QR choice + the link boxes that were missing, date / panchangam, translate ---- */
 const _vb=VIEWS.banner;
 VIEWS.banner=()=>{let h=_vb();if(!h||typeof h!=='string'||!S.bn)return h;const d=S.bn;
  /* replace the old QR select by one with all the choices */
  const i=h.indexOf('<select data-bnsel="qr"');if(i>=0){const j=h.indexOf('</select>',i)+9;
   const sel=`<select data-bnsel="qr" style="width:100%"><option value=""${!d.qr?' selected':''}>${E(tx('None'))}</option><option value="wa"${d.qr==='wa'?' selected':''}>${E(tx('Chat with the temple on WhatsApp'))}</option><option value="channel"${d.qr==='channel'?' selected':''}>${E(tx('WhatsApp Channel'))}</option><option value="group"${d.qr==='group'?' selected':''}>${E(tx('WhatsApp group invite'))}</option><option value="text"${d.qr==='text'?' selected':''}>${E(tx('Another link (website, YouTube…)'))}</option></select>`;
   let box='';const ok=d.qr&&bnQrText(d);
   if(d.qr==='wa')box=`<label style="margin-top:8px">${E(tx('Temple WhatsApp number'))}</label><input data-bnwa inputmode="tel" value="${E(db.settings.waTemple||'')}" placeholder="98xxxxxxxx" style="width:100%">`;
   if(d.qr==='channel')box=`<label style="margin-top:8px">${E(tx('WhatsApp Channel link'))}</label><div class="bar" style="flex-wrap:nowrap;margin:0"><input data-pxlink="channelLink" inputmode="url" autocapitalize="none" autocorrect="off" spellcheck="false" value="${E(db.settings.channelLink||'')}" placeholder="https://whatsapp.com/channel/…" style="flex:1;min-width:0"><button type="button" class="btn sm" data-act="pxLinkPaste" data-k="channelLink">${E(tx('Paste'))}</button></div><p class="mut" style="margin:4px 0 0">${E(tx('In WhatsApp: Updates → your channel → ⋮ → Share → Copy link.'))}</p>`;
   if(d.qr==='group')box=`<label style="margin-top:8px">${E(tx('WhatsApp group invite link'))}</label><div class="bar" style="flex-wrap:nowrap;margin:0"><input data-pxlink="groupLink" inputmode="url" autocapitalize="none" autocorrect="off" spellcheck="false" value="${E(db.settings.groupLink||'')}" placeholder="https://chat.whatsapp.com/…" style="flex:1;min-width:0"><button type="button" class="btn sm" data-act="pxLinkPaste" data-k="groupLink">${E(tx('Paste'))}</button></div><p class="mut" style="margin:4px 0 0">${E(tx('In the group: group name → Invite via link → Copy link.'))}</p>`;
   if(d.qr==='text')box=`<input data-bn="qrText" value="${E(d.qrText||'')}" placeholder="https://…" style="width:100%;margin-top:8px">`;
   const st=d.qr&&!ok?`<div class="warn" style="margin-top:8px">${E(tx(d.qr==='channel'?'Paste your WhatsApp Channel link above — it starts with https://whatsapp.com/channel/':d.qr==='group'?'Paste your group invite link above — it starts with https://chat.whatsapp.com/':d.qr==='wa'?'Enter the temple’s WhatsApp number above (10 digits).':'Type the link to show as a QR code.'))}</div>`:'';
   const pos=d.qrPos||'auto',posUi=d.qr?`<label style="margin-top:8px">${E(tx('QR position'))}</label><div class="chips">${[['auto','Automatic (best fit)'],['bottom','Bottom centre'],['right','Bottom right'],['left','Bottom left']].map(a=>`<button type="button" class="chip${pos===a[0]?' on':''}" data-act="pxQp3" data-k="${a[0]}">${E(tx(a[1]))}</button>`).join('')}</div><label class="chk" style="padding:6px 0"><input type="checkbox" data-pxqcap3 ${d.qrCap===false?'':'checked'}> ${E(tx('Show the label under the QR'))}</label>`:'';
   /* drop the v9.1 position / label controls that follow the select (replaced by the ones below) */
   const rest=h.slice(j).replace(/<label style="margin-top:8px">QR position<\/label><div class="chips">[\s\S]*?<\/div><label class="chk"[^>]*><input type="checkbox" data-pxqcap[^>]*>[\s\S]*?<\/label>/,'');
   h=h.slice(0,i)+sel+box+st+posUi+rest;}
  const tools=`<div class="card"><h3>${E(tx('Date & language'))}</h3><label class="chk" style="padding:6px 0"><input type="checkbox" data-pxdate ${d.date?'checked':''}> ${E(tx('Show the date on the picture'))}</label>${d.date?`<label class="chk" style="padding:6px 0"><input type="checkbox" data-pxpan ${d.pan?'checked':''}> ${E(tx('Also show the panchangam line (tithi · nakshatra)'))}</label><label>${E(tx('Date'))}</label><div class="chips"><button type="button" class="chip${d.date==='today'?' on':''}" data-act="pxDateT">${E(tx('Today (automatic)'))}</button></div><input type="date" data-pxdv value="${d.date&&d.date!=='today'?E(d.date):''}" style="width:100%;margin-top:6px">`:''}
   <div class="bar" style="margin-top:8px"><button type="button" class="btn sm" data-act="pxBnTa">${E(tx('Translate the text to Tamil'))}</button><button type="button" class="btn sm" data-act="pxBnEn">${E(tx('Translate the text to English'))}</button></div><div id="pxBnTrSt" class="mut" style="margin-top:4px"></div></div>`;
  const k=h.indexOf('<div class="sbar">');return k>=0?h.slice(0,k)+tools+h.slice(k):h+tools;};
 document.addEventListener('input',e=>{const t=e.target;if(!t.dataset||S.view!=='banner'||!S.bn)return;
  if(t.dataset.pxlink){db.settings[t.dataset.pxlink]=cleanLink(t.value);clearTimeout(S.pxlT);S.pxlT=setTimeout(()=>{touch('banner link');if(S.view==='banner'){render();}},700);}
  else if('pxdv' in t.dataset){S.bn.date=t.value||'today';try{bnDraw();}catch(x){}}});
 document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||S.view!=='banner'||!S.bn)return;
  if('pxdate' in t.dataset){S.bn.date=t.checked?'today':'';if(!t.checked)S.bn.pan=false;render();}
  else if('pxpan' in t.dataset){S.bn.pan=t.checked;try{bnDraw();}catch(x){}}
  else if('pxqcap3' in t.dataset){S.bn.qrCap=t.checked;try{bnDraw();}catch(x){}}});
 A.pxLinkPaste=async d=>{try{const t=cleanLink(await navigator.clipboard.readText());if(!t)return toast(tx('The clipboard is empty.'));db.settings[d.k]=t;touch('banner link');render();}catch(e){toast(tx('Could not read the clipboard — paste into the box by hand.'));}};
 A.pxQp3=d=>{if(S.bn){S.bn.qrPos=d.k;render();}};A.pxDateT=()=>{S.bn.date='today';render();};
 const tr=async(to)=>{const st=$q('#pxBnTrSt'),d=S.bn;if(st)st.innerHTML='<span class="spin"></span>';let n=0;
  for(const k of ['title','sub','lines','footer']){const src=d[k];if(!src||!src.trim())continue;if(have('PXT')){}
   const r=await (window.PX&&PX.tr?PX.tr(src,to==='ta'?'en':'ta',to):Promise.resolve({text:''}));if(r&&r.text){d[k]=r.text;n++;}}
  if(to==='ta')d.tl='ta';else d.tl='en';render();const s=$q('#pxBnTrSt');if(s)s.textContent=n?tx('Done — please check the words.'):tx('Could not translate — type it by hand.');};
 A.pxBnTa=()=>tr('ta');A.pxBnEn=()=>tr('en');
 addDict([['WhatsApp Channel','WhatsApp சேனல்'],['WhatsApp group invite','WhatsApp குழு அழைப்பு'],['Another link (website, YouTube…)','வேறு இணைப்பு (இணையதளம், YouTube…)'],['Temple WhatsApp number','கோயிலின் WhatsApp எண்'],['WhatsApp Channel link','WhatsApp சேனல் இணைப்பு'],['WhatsApp group invite link','WhatsApp குழு அழைப்பு இணைப்பு'],['Automatic (best fit)','தானியங்கி (சிறந்த பொருத்தம்)'],['Show the label under the QR','QR-க்குக் கீழே குறிப்பைக் காட்டு'],['Date & language','தேதி & மொழி'],['Show the date on the picture','படத்தில் தேதியைக் காட்டு'],['Also show the panchangam line (tithi · nakshatra)','பஞ்சாங்க வரியையும் காட்டு (திதி · நட்சத்திரம்)'],['Today (automatic)','இன்று (தானியங்கி)'],['Translate the text to Tamil','உரையைத் தமிழுக்கு மொழிபெயர்'],['Translate the text to English','உரையை ஆங்கிலத்துக்கு மொழிபெயர்'],['Done — please check the words.','முடிந்தது — சொற்களைச் சரிபார்க்கவும்.'],['Paste','ஒட்டு']]);
});
})();
