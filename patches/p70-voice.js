/* =====================================================================
   v10 VOICE STUDIO — AI voice (Google Gemini, your own key) + background music made by the app itself (no copyrighted music)
   → voice note / music file you can send to WhatsApp groups; also feeds the short-video maker
   ===================================================================== */
(function(){
'use strict';
const X=window.PX10;if(!X||!X.core)return;const {mod,setG,tx,E,$q,addDict,sleep,have}=X;
const RATE=24000;
/* ---------------- music made from scratch (OfflineAudioContext) ---------------- */
const MOODS=[['none','No music'],['dawn','Dawn · flute & tanpura'],['tanpura','Tanpura drone'],['bells','Temple bells & drone'],['veena','Veena-like plucks']];
const SCALE=[0,2,4,7,9]; /* Mohanam / major pentatonic — gentle and devotional */
const hz=(base,st)=>base*Math.pow(2,st/12);
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
X.musicBuffer=async function(mood,seconds,seed){
 seconds=Math.max(1,Math.min(180,seconds));const N=Math.round(seconds*RATE),oc=new OfflineAudioContext(1,N,RATE),R=rng(seed||20260101),out=oc.createGain();out.gain.value=.9;
 /* soft room: two feedback delays */
 const mk=(t,fb)=>{const d=oc.createDelay(1);d.delayTime.value=t;const g=oc.createGain();g.gain.value=fb;const lp=oc.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;d.connect(lp);lp.connect(g);g.connect(d);return{d,g};},r1=mk(.173,.42),r2=mk(.271,.36),wet=oc.createGain();wet.gain.value=.35;r1.d.connect(wet);r2.d.connect(wet);wet.connect(out);out.connect(oc.destination);
 const send=n=>{n.connect(out);n.connect(r1.d);n.connect(r2.d);};
 const env=(g,t,a,d,peak)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);};
 const tanpura=(vol)=>{const f0=146.83,strs=[f0*1.5,f0*2,f0*2,f0];let t=.2,k=0;while(t<seconds){const f=strs[k%4];k++;
   for(const det of[-4,4]){const o=oc.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=det;const lp=oc.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(1500,t);lp.frequency.exponentialRampToValueAtTime(450,t+3);const g=oc.createGain();env(g,t,.012,3.6,vol*.5);o.connect(lp);lp.connect(g);send(g);o.start(t);o.stop(Math.min(seconds,t+4.2));}
   t+=k%4===0?1.35:.95;}};
 const flute=(vol)=>{let t=1.2,idx=2;const base=293.66;while(t<seconds-.5){const step=Math.round((R()-.5)*3.2);idx=Math.max(0,Math.min(9,idx+step));const deg=SCALE[idx%5]+12*Math.floor(idx/5),len=.55+R()*1.1,f=hz(base,deg);
   const o=oc.createOscillator(),o2=oc.createOscillator();o.type='sine';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f*2.003;const lfo=oc.createOscillator(),lg=oc.createGain();lfo.frequency.value=5.2;lg.gain.value=f*.006;lfo.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);
   const g=oc.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol*.5,t+.09);g.gain.setValueAtTime(vol*.46,t+len-.18);g.gain.linearRampToValueAtTime(0,t+len+.12);const g2=oc.createGain();g2.gain.value=.18;o.connect(g);o2.connect(g2);g2.connect(g);send(g);o.start(t);o2.start(t);lfo.start(t);o.stop(Math.min(seconds,t+len+.2));o2.stop(Math.min(seconds,t+len+.2));lfo.stop(Math.min(seconds,t+len+.2));
   t+=len+(R()<.3?.9:.15);}};
 const bells=(vol)=>{let t=2.5;while(t<seconds-1){const f=392*(R()<.5?1:1.5);[[1,1],[2.76,.45],[5.4,.22],[8.93,.1]].forEach(([m,a])=>{const o=oc.createOscillator();o.type='sine';o.frequency.value=f*m;const g=oc.createGain();env(g,t,.004,4.2/m**.35,vol*a*.45);o.connect(g);send(g);o.start(t);o.stop(Math.min(seconds,t+4.6));});t+=6+R()*5;}};
 const veena=(vol)=>{let t=1,idx=3;const base=220;while(t<seconds-.4){idx=Math.max(0,Math.min(9,idx+Math.round((R()-.5)*3)));const f=hz(base,SCALE[idx%5]+12*Math.floor(idx/5)),o=oc.createOscillator();o.type='triangle';o.frequency.value=f;const o2=oc.createOscillator();o2.type='sine';o2.frequency.value=f*2;const g=oc.createGain();env(g,t,.006,1.6,vol*.55);const g2=oc.createGain();g2.gain.value=.3;o.connect(g);o2.connect(g2);g2.connect(g);send(g);o.start(t);o2.start(t);o.stop(Math.min(seconds,t+1.8));o2.stop(Math.min(seconds,t+1.8));t+=.45+R()*.75;}};
 if(mood==='tanpura'){tanpura(.9);}else if(mood==='dawn'){tanpura(.55);flute(.75);}else if(mood==='bells'){tanpura(.55);bells(.9);}else if(mood==='veena'){tanpura(.45);veena(.85);}else{}
 return oc.startRendering();};
/* ---------------- mixing + files ---------------- */
X.mixAudio=async function(voice,music,o){o=Object.assign({vol:.22,lead:.8,tail:1.6},o||{});
 const vd=voice?voice.duration:0,total=Math.max(1,(voice?o.lead+vd+o.tail:(music?music.duration:5))),N=Math.round(total*RATE),oc=new OfflineAudioContext(1,N,RATE);
 if(music){const s=oc.createBufferSource();s.buffer=music;const g=oc.createGain();const hi=Math.min(.6,o.vol*2.2),lo=o.vol;g.gain.setValueAtTime(0,0);g.gain.linearRampToValueAtTime(voice?hi:lo*1.6,Math.min(1.5,total/4));
   if(voice){g.gain.setValueAtTime(hi,Math.max(0,o.lead-.2));g.gain.linearRampToValueAtTime(lo,o.lead+.4);g.gain.setValueAtTime(lo,o.lead+vd-.1);g.gain.linearRampToValueAtTime(hi,o.lead+vd+.9);}
   g.gain.setValueAtTime(g.gain.value||hi,Math.max(0,total-1.4));g.gain.linearRampToValueAtTime(0,total);s.connect(g);g.connect(oc.destination);s.start(0);}
 if(voice){const s=oc.createBufferSource();s.buffer=voice;const g=oc.createGain();g.gain.value=1;s.connect(g);g.connect(oc.destination);s.start(o.lead);}
 return oc.startRendering();};
X.wavFile=function(buf,name){const d=buf.getChannelData(0),n=d.length,ab=new ArrayBuffer(44+n*2),v=new DataView(ab),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
 w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,buf.sampleRate,true);v.setUint32(28,buf.sampleRate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
 for(let i=0;i<n;i++){const s=Math.max(-1,Math.min(1,d[i]));v.setInt16(44+i*2,s<0?s*32768:s*32767,true);}return new File([ab],name||'voice.wav',{type:'audio/wav'});};
X.encodeRealtime=function(buf,wantVideoTrack){return new Promise((res,rej)=>{try{const ac=new (window.AudioContext||window.webkitAudioContext)({sampleRate:RATE}),dst=ac.createMediaStreamDestination(),src=ac.createBufferSource();src.buffer=buf;src.connect(dst);
 const mime=['audio/mp4;codecs=mp4a.40.2','audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>{try{return MediaRecorder.isTypeSupported(t);}catch(e){return false;}});if(!mime)return rej(new Error('This phone cannot make that format.'));
 const rec=new MediaRecorder(dst.stream,{mimeType:mime,audioBitsPerSecond:64000}),ch=[];rec.ondataavailable=e=>e.data.size&&ch.push(e.data);rec.onstop=()=>{ac.close();const t=mime.split(';')[0];res(new File([new Blob(ch,{type:t})],'voice.'+(/mp4/.test(t)?'m4a':'webm'),{type:t}));};
 src.onended=()=>setTimeout(()=>rec.stop(),300);ac.resume().then(()=>{rec.start(500);src.start();});}catch(e){rej(e);}});};
/* ---------------- Gemini text-to-speech ---------------- */
const VOICES=[['Kore','Kore — firm, clear'],['Sulafat','Sulafat — warm'],['Charon','Charon — calm'],['Gacrux','Gacrux — mature'],['Puck','Puck — upbeat'],['Leda','Leda — youthful'],['Fenrir','Fenrir — energetic'],['Aoede','Aoede — breezy']];
const MODELS=['gemini-3.8-flash-tts','gemini-3.8-flash-lite-tts','gemini-2.5-flash-preview-tts'];
const keyOf=()=>{try{const c=DEV.get().ai||{},sh=db.settings.aiShared||{};if(c.key&&c.provider!=='openai')return c.key;if(sh.key&&sh.provider!=='openai')return sh.key;}catch(e){}return'';};
X.ttsKey=keyOf;
const b64buf=b=>{const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;};
async function decodeAudio(mime,b64){const ab=b64buf(b64);
 if(/L16|pcm|raw/i.test(mime||'')){const m=/rate=(\d+)/.exec(mime||''),rate=m?+m[1]:24000,i16=new Int16Array(ab.byteLength>>1);const dv=new DataView(ab);for(let i=0;i<i16.length;i++)i16[i]=dv.getInt16(i*2,true);const ctx=new OfflineAudioContext(1,i16.length,rate),buf=ctx.createBuffer(1,i16.length,rate),ch=buf.getChannelData(0);for(let i=0;i<i16.length;i++)ch[i]=i16[i]/32768;return buf;}
 const ac=new (window.AudioContext||window.webkitAudioContext)();try{return await ac.decodeAudioData(ab);}finally{try{ac.close();}catch(e){}}}
async function resample(buf){if(buf.sampleRate===RATE&&buf.numberOfChannels===1)return buf;const oc=new OfflineAudioContext(1,Math.ceil(buf.duration*RATE),RATE),s=oc.createBufferSource();s.buffer=buf;s.connect(oc.destination);s.start();return oc.startRendering();}
X.tts=async function(text,o){o=Object.assign({lang:'ta',voice:'Kore',style:''},o||{});const key=keyOf();if(!key)throw Object.assign(new Error(tx('Add your Google Gemini key first (Smart Scan setup).')),{code:'nokey'});
 const chunks=[];String(text).trim().split(/\n{2,}/).forEach(p=>{p=p.trim();if(!p)return;while(p.length>1400){let k=p.lastIndexOf('. ',1400);if(k<400)k=1400;chunks.push(p.slice(0,k+1));p=p.slice(k+1).trim();}chunks.push(p);});
 const lang=o.lang==='ta'?'Tamil':o.lang==='hi'?'Hindi':o.lang==='te'?'Telugu':o.lang==='kn'?'Kannada':o.lang==='ml'?'Malayalam':'English';
 const bufs=[];let lastErr=null;
 for(const c of chunks){const prompt=`Read the following text aloud in ${lang}. ${o.style||'Use a calm, warm, devotional voice at a gentle, clear pace.'} Do not add anything.\n\n${c}`;let done=false;
  const order=o.model?[o.model]:(X._ttsModel?[X._ttsModel].concat(MODELS.filter(m=>m!==X._ttsModel)):MODELS);
  for(const m of order){
   let r;try{r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+m+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:o.voice}}}}})});}catch(e){throw new Error(tx('Could not reach Google. Check the internet.'));}
   let j={};try{j=await r.json();}catch(e){}
   if(r.status===404||(r.status===400&&/not found|not supported|invalid model/i.test(JSON.stringify(j.error||{})))){lastErr=(j.error&&j.error.message)||('model '+m+' not available');continue;}
   if(r.status===400&&/API key/i.test(JSON.stringify(j.error||{})))throw Object.assign(new Error(tx('Google rejected the key. Open Smart Scan setup and paste the key again.')),{code:'badkey'});
   if(r.status===401||r.status===403)throw Object.assign(new Error(tx('Google rejected the key or this key cannot use text-to-speech.')+' '+((j.error&&j.error.message)||'')),{code:'badkey'});
   if(r.status===429)throw Object.assign(new Error(tx('Google’s free limit for voices is used up for now. Try again in a minute, or tomorrow.')),{code:'quota'});
   if(!r.ok){lastErr=(j.error&&j.error.message)||('error '+r.status);continue;}
   const part=(((j.candidates||[])[0]||{}).content||{}).parts||[],pd=part.find(p=>p.inlineData&&p.inlineData.data);if(!pd){lastErr=tx('Google returned no audio for this text.');continue;}
   bufs.push(await resample(await decodeAudio(pd.inlineData.mimeType,pd.inlineData.data)));X._ttsModel=m;done=true;break;}
  if(!done)throw new Error(tx('The voice could not be made.')+' '+(lastErr||''));}
 const gap=Math.round(RATE*.35),total=bufs.reduce((s,b)=>s+b.length,0)+gap*(bufs.length-1),oc=new OfflineAudioContext(1,total,RATE),out=oc.createBuffer(1,total,RATE),ch=out.getChannelData(0);let p=0;bufs.forEach(b=>{ch.set(b.getChannelData(0),p);p+=b.length+gap;});return out;};
/* ---------------- screen ---------------- */
mod('AI voice studio',['VIEWS','TITLES','MORE','A','S','db','DEV','modal','closeModal','toast','go','render','can'],()=>{
 TITLES.voice='AI voice & music';if(!MORE.some(m=>m[0]==='voice'))MORE.splice(Math.max(0,MORE.findIndex(m=>m[0]==='backup')),0,['voice','mic','AI voice & music']);
 try{VIEW_MOD.voice='social';}catch(e){}
 const vo=S.vo=S.vo||{text:'',lang:'ta',voice:'Kore',mood:'dawn',vol:.22,style:'',buf:null,url:'',file:null,busy:'',err:'',title:'',musicOnly:false};
 const sv=()=>DEV.get().voiceOpt||{};Object.assign(vo,{lang:sv().lang||vo.lang,voice:sv().voice||vo.voice,mood:sv().mood||vo.mood,vol:sv().vol||vo.vol});
 const keep=()=>DEV.set({voiceOpt:{lang:vo.lang,voice:vo.voice,mood:vo.mood,vol:vo.vol}});
 X.voiceFromText=function(text,o){o=o||{};vo.text=String(text||'');vo.lang=o.lang||vo.lang;vo.title=o.title||'';vo.buf=null;vo.file=null;vo.err='';if(vo.url){URL.revokeObjectURL(vo.url);vo.url='';}go('voice');};
 const presets=()=>{const t=X.isoNow(),lc=vo.lang==='en'?'en':'ta',o=[['thought','Today’s thought',()=>thoughtFor(lc,t)+' '+CL_L[lc]],['panchang','Today’s panchangam',()=>X.panFull(t,lc).replace(/^📅[^\n]*\n/,'').replace(/[🙏🔱📅]/gu,'').replace(/\n/g,'. ')]];
  const ev=(db.events||[]).filter(e=>e.date>=t).sort((a,b)=>a.date.localeCompare(b.date))[0];if(ev)o.push(['event','Next function',()=>{const ti=lc==='ta'?(ev.titleTa||ev.title):(ev.title||ev.titleTa);return lc==='ta'?`${ti} ${X.dateStr(ev.date,'ta')} ${ev.time||''} அன்று நடைபெறும். அனைவரும் வருக. வெற்றிவேல் முருகனுக்கு அரோகரா.`:`${ti} will be held on ${X.dateStr(ev.date,'en')} ${ev.time||''}. All devotees are welcome. Vetri Vel Muruganukku Arohara.`;}]);
  o.push(['notice','Important notice',()=>lc==='ta'?'அன்புள்ள பக்தர்களே, முக்கிய அறிவிப்பு: ':'Dear devotees, an important announcement: ']);return o;};
 const chip=(a,k,cur,l)=>`<button type="button" class="chip${cur===k?' on':''}" data-act="${a}" data-k="${k}">${E(l)}</button>`;
 VIEWS.voice=()=>{if(!can('write'))return`<div class="empty"><p>${E(tx('Staff or admin access is required.'))}</p></div>`;const key=keyOf(),len=vo.text.length;
  return `${key?'':`<div class="warn"><b>${E(tx('No Google Gemini key yet.'))}</b> ${E(tx('The AI voice needs your own free Google key (the same one used for Smart Scan).'))} <button type="button" class="btn sm pri" data-act="aiSetup">${E(tx('Add the key'))}</button></div>`}
  <div class="card"><h3>${E(tx('What should it say?'))}</h3><div class="ph">${presets().map(p=>`<button type="button" data-act="pxVoPre" data-k="${p[0]}">${E(tx(p[1]))}</button>`).join('')}</div>
   <div style="position:relative"><textarea id="pxVoT" style="min-height:130px;padding-right:52px" placeholder="${E(tx('Type or speak the message…'))}">${E(vo.text)}</textarea>${have('PX')&&PX.micBtn?PX.micBtn('pxVoT'):''}</div>
   <div class="mut" style="margin-top:4px">${len} ${E(tx('characters'))} · ${E(tx('about'))} ${Math.max(1,Math.round(len/14))} ${E(tx('seconds of speech'))}${len>1500?' ⚠️ '+E(tx('long messages take longer and may hit Google’s free limit')):''}</div>
   <div class="bar" style="margin-top:6px">${have('PX')&&PX.tr?`<button type="button" class="btn sm" data-act="pxVoTa">${E(tx('→ Tamil'))}</button><button type="button" class="btn sm" data-act="pxVoEn">${E(tx('→ English'))}</button>`:''}</div></div>
  <div class="card"><h3>${E(tx('Voice'))}</h3><label>${E(tx('Language'))}</label><div class="chips">${[['ta','தமிழ்'],['en','English'],['hi','हिन्दी'],['te','తెలుగు'],['kn','ಕನ್ನಡ'],['ml','മലയാളം']].map(l=>chip('pxVoLang',l[0],vo.lang,l[1])).join('')}</div>
   <label>${E(tx('Voice'))}</label><div class="chips">${VOICES.map(v=>chip('pxVoVoice',v[0],vo.voice,v[0])).join('')}</div><div class="mut" style="font-size:12px">${E((VOICES.find(v=>v[0]===vo.voice)||[0,''])[1])}</div>
   <label style="margin-top:6px">${E(tx('Style (optional)'))}</label><input id="pxVoSt" value="${E(vo.style)}" placeholder="${E(tx('e.g. slow and soft, like a prayer'))}" autocomplete="off" style="width:100%">
   <p class="mut" style="margin:6px 0 0;font-size:12px">${E(tx('Language and accent come from Google’s AI. Listen before you send — names of deities and places can be pronounced differently.'))}</p></div>
  <div class="card"><h3>${E(tx('Background music'))}</h3><div class="chips" style="flex-wrap:wrap;overflow:visible">${MOODS.map(m=>chip('pxVoMood',m[0],vo.mood,tx(m[1]))).join('')}</div>
   <label>${E(tx('Music volume'))}</label><input type="range" min="5" max="60" value="${Math.round(vo.vol*100)}" data-pxvovol style="width:100%;min-height:30px">
   <p class="mut" style="margin:4px 0 0;font-size:12px">🎼 ${E(tx('The music is created by this app from scratch each time (no recording, no sample) — so there is no third-party music copyright. The voice is AI-generated by Google Gemini; keep the temple’s own wording.'))}</p></div>
  <div class="bar"><button type="button" class="btn pri" data-act="pxVoMake" style="flex:1" ${vo.busy?'disabled':''}>${vo.busy?'<span class="spin"></span>'+E(vo.busy):ico('mic','sm')+' '+E(tx('Make the voice message'))}</button>${vo.mood!=='none'?`<button type="button" class="btn" data-act="pxVoMusic" ${vo.busy?'disabled':''}>🎼 ${E(tx('Music only'))}</button>`:''}</div>
  ${vo.err?`<div class="warn" style="margin-top:8px">${E(vo.err)}</div>`:''}
  ${vo.url?`<div class="card"><h3>${E(tx('Ready'))}</h3><audio controls src="${vo.url}" style="width:100%"></audio><div class="mut" style="margin:4px 0">${X.fmtDur?X.fmtDur(vo.buf.duration):Math.round(vo.buf.duration)+'s'} · ${vo.file?Math.max(1,Math.round(vo.file.size/1024)):''} KB · ${E(vo.file?vo.file.name:'')}</div>
   <div class="menu"><button type="button" class="mi" data-act="pxVoWa">${ico('sms')}<span><b>${E(tx('Send on WhatsApp'))}</b><div class="mut">${E(tx('Choose a group (daily thoughts, function notice…) or one person'))}</div></span></button>
   ${X.shortFromAudio?`<button type="button" class="mi" data-act="pxVoShort">${ico('video')}<span>${E(tx('Make a short video with this voice'))}</span></button>`:''}
   <button type="button" class="mi" data-act="pxVoM4a">${ico('down')}<span>${E(tx('Convert to voice-note format (M4A) — takes as long as the audio'))}</span></button><button type="button" class="mi" data-act="pxVoSave">${ico('down')}<span>${E(tx('Save to phone'))}</span></button></div></div>`:''}
  <p class="mut">${E(tx('WhatsApp rule: an audio file can be shared to groups and chats by hand. Automatic sending can carry text and links only — so you can attach the voice file when you post the daily thought.'))}</p>`;};
 document.addEventListener('input',e=>{const t=e.target;if(t.id==='pxVoT')vo.text=t.value;else if(t.id==='pxVoSt')vo.style=t.value;else if(t.dataset&&'pxvovol' in t.dataset){vo.vol=+t.value/100;keep();}});
 A.pxVoPre=d=>{const p=presets().find(x=>x[0]===d.k);if(p){vo.text=p[2]();render();}};A.pxVoLang=d=>{vo.lang=d.k;keep();render();};A.pxVoVoice=d=>{vo.voice=d.k;keep();render();};A.pxVoMood=d=>{vo.mood=d.k;keep();render();};
 A.pxVoTa=async()=>{const r=await PX.tr(vo.text,'en','ta');if(r.text){vo.text=r.text;vo.lang='ta';render();}else toast(r.err||tx('Could not translate'));};A.pxVoEn=async()=>{const r=await PX.tr(vo.text,'ta','en');if(r.text){vo.text=r.text;vo.lang='en';render();}};
 const finish=async(buf,name)=>{vo.buf=buf;vo.file=X.wavFile(buf,name);if(vo.url)URL.revokeObjectURL(vo.url);vo.url=URL.createObjectURL(vo.file);vo.busy='';render();};
 A.pxVoMake=async()=>{if(!vo.text.trim())return toast(tx('Type the message first.'));vo.err='';vo.busy=tx('Making the voice…');render();
  try{const voice=await X.tts(vo.text,{lang:vo.lang,voice:vo.voice,style:vo.style});let music=null;if(vo.mood!=='none'){vo.busy=tx('Making the music…');render();music=await X.musicBuffer(vo.mood,voice.duration+3,Date.now()&0xffff);}
   vo.busy=tx('Mixing…');render();const mix=await X.mixAudio(voice,music,{vol:vo.vol});vo._voice=voice;await finish(mix,'voice_'+X.isoNow()+'.wav');}
  catch(e){vo.busy='';vo.err=e.message||String(e);if(e.code!=='nokey'&&e.code!=='badkey'&&e.code!=='quota')X.errs.push('voice: '+(e.stack||e));render();}};
 A.pxVoMusic=async()=>{vo.err='';vo.busy=tx('Making the music…');render();try{const m=await X.musicBuffer(vo.mood,30,Date.now()&0xffff),mix=await X.mixAudio(null,m,{vol:vo.vol});await finish(mix,'music_'+vo.mood+'.wav');}catch(e){vo.busy='';vo.err=e.message;render();}};
 A.pxVoWa=()=>{if(!vo.file)return;X.waTarget({title:'Voice message',text:vo.text.slice(0,300),files:[vo.file]});};
 A.pxVoSave=()=>{if(vo.file){X.dl(vo.file);toast(tx('Saved to your phone'));}};
 A.pxVoM4a=async()=>{if(!vo.buf)return;vo.busy=tx('Converting — this takes as long as the audio…');render();try{const f=await X.encodeRealtime(vo.buf);vo.file=f;if(vo.url)URL.revokeObjectURL(vo.url);vo.url=URL.createObjectURL(f);vo.busy='';render();toast(tx('Ready:')+' '+f.name);}catch(e){vo.busy='';vo.err=e.message;render();}};
 A.pxVoShort=()=>{if(vo.buf&&X.shortFromAudio)X.shortFromAudio(vo.buf,{text:vo.text,lang:vo.lang});};
 X.voiceState=vo;
 addDict([['AI voice & music','AI குரல் & இசை'],['What should it say?','என்ன சொல்ல வேண்டும்?'],['Today’s thought','இன்றைய சிந்தனை'],['Today’s panchangam','இன்றைய பஞ்சாங்கம்'],['Next function','அடுத்த விழா'],['Important notice','முக்கிய அறிவிப்பு'],['Type or speak the message…','செய்தியைத் தட்டச்சு செய்க அல்லது பேசுக…'],['Voice','குரல்'],['Style (optional)','பாணி (விருப்பம்)'],['Background music','பின்னணி இசை'],['Music volume','இசையின் ஒலி அளவு'],['Make the voice message','குரல் செய்தியை உருவாக்கு'],['Music only','இசை மட்டும்'],['Ready','தயார்'],['Voice message','குரல் செய்தி'],['No music','இசை இல்லை'],['Dawn · flute & tanpura','அதிகாலை · புல்லாங்குழல் & தம்புரா'],['Tanpura drone','தம்புரா'],['Temple bells & drone','கோயில் மணி & தம்புரா'],['Veena-like plucks','வீணை போன்ற இசை'],['Add the key','விசையைச் சேர்'],['Making the voice…','குரலை உருவாக்குகிறது…'],['Making the music…','இசையை உருவாக்குகிறது…'],['Mixing…','கலக்கிறது…']]);
});
})();
