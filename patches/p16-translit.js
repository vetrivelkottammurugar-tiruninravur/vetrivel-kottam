/* ENGLISH <-> TAMIL NAME CONVERTER */
/* English <-> Tamil name converter (phonetic rules + a dictionary of common names). Output is a suggestion: always editable. */
(function(root){
'use strict';
const EX={ // exact, hand-checked spellings
 murugan:'முருகன்',murugu:'முருகு',murugesan:'முருகேசன்',valli:'வள்ளி',devasena:'தேவசேனா',deivanai:'தெய்வானை',subramanya:'சுப்பிரமணிய',subramaniam:'சுப்பிரமணியம்',subramanian:'சுப்பிரமணியன்',subbu:'சுப்பு',karthikeyan:'கார்த்திகேயன்',karthik:'கார்த்திக்',karthick:'கார்த்திக்',kartik:'கார்த்திக்',saravanan:'சரவணன்',saravana:'சரவண',velan:'வேலன்',velmurugan:'வேல்முருகன்',vel:'வேல்',vetrivel:'வெற்றிவேல்',vetri:'வெற்றி',selvam:'செல்வம்',selvi:'செல்வி',selvan:'செல்வன்',selvaraj:'செல்வராஜ்',kumar:'குமார்',kumaran:'குமரன்',kumari:'குமாரி',kumaresan:'குமரேசன்',aravind:'அரவிந்த்',arvind:'அரவிந்த்',aravindan:'அரவிந்தன்',arun:'அருண்',arumugam:'ஆறுமுகம்',arulmigu:'அருள்மிகு',anand:'ஆனந்த்',anandan:'ஆனந்தன்',ananth:'அனந்த்',anantha:'அனந்தா',anitha:'அனிதா',anita:'அனிதா',ashok:'அசோக்',ashwin:'அஷ்வின்',ajith:'அஜித்',ajay:'அஜய்',balaji:'பாலாஜி',balu:'பாலு',balan:'பாலன்',bala:'பாலா',balakrishnan:'பாலகிருஷ்ணன்',bharathi:'பாரதி',bharathy:'பாரதி',bhuvana:'புவனா',chandra:'சந்திரா',chandran:'சந்திரன்',chandrasekar:'சந்திரசேகர்',deepa:'தீபா',deepak:'தீபக்',deepika:'தீபிகா',devi:'தேவி',dhanush:'தனுஷ்',dhanalakshmi:'தனலட்சுமி',divya:'திவ்யா',durga:'துர்கா',elango:'இளங்கோ',ganesh:'கணேஷ்',ganesan:'கணேசன்',gayathri:'காயத்ரி',gopal:'கோபால்',gopi:'கோபி',govindan:'கோவிந்தன்',govindarajan:'கோவிந்தராஜன்',gunasekaran:'குணசேகரன்',hari:'ஹரி',haran:'ஹரன்',harish:'ஹரீஷ்',indira:'இந்திரா',ilango:'இளங்கோ',jaya:'ஜெயா',jayakumar:'ஜெயகுமார்',jayaraman:'ஜெயராமன்',jayanthi:'ஜெயந்தி',jegan:'ஜெகன்',kala:'கலா',kalyani:'கல்யாணி',kamala:'கமலா',kamalakannan:'கமலக்கண்ணன்',kannan:'கண்ணன்',kavitha:'கவிதா',kavya:'காவ்யா',krishnan:'கிருஷ்ணன்',krishna:'கிருஷ்ணா',kumaravel:'குமரவேல்',lakshmi:'லட்சுமி',laxmi:'லட்சுமி',lalitha:'லலிதா',latha:'லதா',madhavan:'மாதவன்',mahalakshmi:'மகாலட்சுமி',mahesh:'மகேஷ்',manikandan:'மணிகண்டன்',mani:'மணி',manoj:'மனோஜ்',meena:'மீனா',meenakshi:'மீனாட்சி',mohan:'மோகன்',mohana:'மோகனா',muthu:'முத்து',muthukumar:'முத்துக்குமார்',muthulakshmi:'முத்துலட்சுமி',nagarajan:'நாகராஜன்',natarajan:'நடராஜன்',nataraj:'நடராஜ்',nithya:'நித்யா',nithin:'நிதின்',pandian:'பாண்டியன்',parvathi:'பார்வதி',prabhu:'பிரபு',prabhakaran:'பிரபாகரன்',prakash:'பிரகாஷ்',pradeep:'பிரதீப்',priya:'பிரியா',punitha:'புனிதா',radha:'ராதா',rajan:'ராஜன்',raja:'ராஜா',raj:'ராஜ்',rajesh:'ராஜேஷ்',rajendran:'ராஜேந்திரன்',rajkumar:'ராஜ்குமார்',rajeswari:'ராஜேஸ்வரி',ram:'ராம்',rama:'ராமா',ramesh:'ரமேஷ்',ramachandran:'ராமச்சந்திரன்',ramakrishnan:'ராமகிருஷ்ணன்',ramu:'ராமு',ravi:'ரவி',ravichandran:'ரவிச்சந்திரன்',revathi:'ரேவதி',rukmani:'ருக்மணி',sakthi:'சக்தி',sakthivel:'சக்திவேல்',sankar:'சங்கர்',shankar:'ஷங்கர்',sathish:'சதீஷ்',satish:'சதீஷ்',santhosh:'சந்தோஷ்',sasikala:'சசிகலா',saraswathi:'சரஸ்வதி',sekar:'சேகர்',shanmugam:'சண்முகம்',shanmugasundaram:'சண்முகசுந்தரம்',sivakumar:'சிவகுமார்',siva:'சிவா',sivan:'சிவன்',sridhar:'ஸ்ரீதர்',srinivasan:'ஸ்ரீனிவாசன்',srinivas:'ஸ்ரீனிவாஸ்',sri:'ஸ்ரீ',suresh:'சுரேஷ்',sundar:'சுந்தர்',sundaram:'சுந்தரம்',suganya:'சுகன்யா',sumathi:'சுமதி',swamy:'சுவாமி',swami:'சுவாமி',tamilselvi:'தமிழ்ச்செல்வி',tamil:'தமிழ்',thangam:'தங்கம்',thirumurugan:'திருமுருகன்',thiru:'திரு',umapathy:'உமாபதி',uma:'உமா',usha:'உஷா',vasanthi:'வசந்தி',venkatesh:'வெங்கடேஷ்',venkatesan:'வெங்கடேசன்',venkat:'வெங்கட்',vignesh:'விக்னேஷ்',vijay:'விஜய்',vijayakumar:'விஜயகுமார்',vijaya:'விஜயா',vinoth:'வினோத்',vinod:'வினோத்',vinayagam:'விநாயகம்',viswanathan:'விஸ்வநாதன்',yamuna:'யமுனா',yogesh:'யோகேஷ்',zubair:'ஜுபைர்',mr:'திரு',mrs:'திருமதி',smt:'திருமதி',shri:'ஸ்ரீ'};
const EXT={};Object.keys(EX).forEach(k=>{if(!EXT[EX[k]])EXT[EX[k]]=k.charAt(0).toUpperCase()+k.slice(1);});
Object.assign(EXT,{'திரு':'Thiru','முருகன்':'Murugan','குமார்':'Kumar','குமரன்':'Kumaran','ராஜா':'Raja','ராஜ்':'Raj','ஜெயா':'Jaya','சுவாமி':'Swami','அருள்மிகு':'Arulmigu','செல்வி':'Selvi','சக்தி':'Sakthi'});
/* ---------- English -> Tamil ---------- */
const VS={a:'',aa:'ா',i:'ி',ee:'ீ',u:'ு',oo:'ூ',e:'ெ',ae:'ே',ai:'ை',o:'ொ',oa:'ோ',au:'ௌ'},VI={a:'அ',aa:'ஆ',i:'இ',ee:'ஈ',u:'உ',oo:'ஊ',e:'எ',ae:'ஏ',ai:'ஐ',o:'ஒ',oa:'ஓ',au:'ஔ'};
const CONS=[['ksh','க்ஷ'],['shn','ஷ்ண'],['tth','த்த'],['ngk','ங்க'],['nch','ஞ்ச'],['nj','ஞ்ஜ'],['chh','ச'],['ch','ச'],['sh','ஷ'],['th','த'],['dh','த'],['bh','ப'],['ph','ப'],['kh','க'],['gh','க'],['jh','ஜ'],['zh','ழ'],['ng','ங'],['tt','ட்ட'],['kk','க்க'],['pp','ப்ப'],['ll','ல்ல'],['nn','ன்ன'],['mm','ம்ம'],['rr','ர்ர'],['ss','ஸ்ஸ'],['dd','ட்ட'],['k','க'],['g','க'],['c','க'],['j','ஜ'],['t','த'],['d','த'],['n','ன'],['p','ப'],['b','ப'],['m','ம'],['y','ய'],['r','ர'],['l','ல'],['v','வ'],['w','வ'],['s','ச'],['h','ஹ'],['f','ஃப'],['q','க'],['x','க்ஸ'],['z','ஜ']];
const VOW=[['aa','aa'],['ai','ai'],['au','au'],['ee','ee'],['ii','ee'],['oo','oo'],['uu','oo'],['ou','au'],['ow','au'],['ea','ee'],['a','a'],['e','e'],['i','i'],['o','o'],['u','u']];
const isV=c=>'aeiou'.indexOf(c)>=0;
const ENDS=[['esh','ேஷ்'],['ish','ீஷ்'],['ash','ாஷ்'],['osh','ோஷ்'],['ush','ூஷ்'],['eshwar','ேஷ்வர்'],['eswar','ேஸ்வர்'],['eswari','ேஸ்வரி'],['kumar','குமார்'],['kumari','குமாரி'],['devi','தேவி'],['nathan','நாதன்'],['natha','நாதா'],['raj','ராஜ்'],['raja','ராஜா'],['rajan','ராஜன்'],['chandran','சந்திரன்'],['moorthy','மூர்த்தி'],['murthy','மூர்த்தி'],['murthi','மூர்த்தி'],['sekar','சேகர்'],['shekar','ஷேகர்'],['swamy','சுவாமி'],['swami','சுவாமி'],['lakshmi','லட்சுமி'],['laxmi','லட்சுமி'],['pathy','பதி'],['pathi','பதி'],['thy','தி'],['moorthi','மூர்த்தி']];
const PRE=[['bala','பால'],['vasu','வாசு'],['maha','மகா'],['jaya','ஜெய'],['jeya','ஜெய'],['siva','சிவ'],['sakthi','சக்தி'],['mani','மணி'],['muthu','முத்து'],['sundara','சுந்தர'],['kanna','கண்ண'],['hema','ஹேம'],['rama','ராம'],['krishna','கிருஷ்ண'],['thiru','திரு'],['vel','வேல்'],['velu','வேலு'],['tamil','தமிழ்'],['pon','பொன்'],['nava','நவ'],['gnana','ஞான'],['deiva','தெய்வ'],['dhana','தன'],['arul','அருள்'],['anbu','அன்பு'],['ezhil','எழில்'],['senthil','செந்தில்'],['yuva','யுவ'],['sri','ஸ்ரீ']];
function enWord(w,noMorph,openEnd){
 const lw=w.toLowerCase().replace(/[^a-z]/g,'');if(EX[lw])return EX[lw];if(!lw)return w;
 for(const [e,t] of ENDS){if(lw.length>e.length+1&&lw.endsWith(e)){const head=lw.slice(0,lw.length-e.length);let h=/^[\u0BBE-\u0BCC]/.test(t)?enWord(head,false,true):enWord(head,false,'join');return h+t;}}
 if(!noMorph)for(const [p,t] of PRE){if(lw.length>p.length+1&&lw.startsWith(p)){const rest=lw.slice(p.length);if(EX[rest]||rest.length>=3){let r=enWord(rest,true);return t+r;}}}
 // phonemes
 const out=[];let i=0;let s=lw+(openEnd===true?'a':'');
 s=s.replace(/^(p|b|g|k|t|d|f)r(?=[aeiou])/,'$1ir').replace(/ndr/g,'ndir').replace(/shn/g,'shn').replace(/([aeiou])h(?=[aeiou])/g,'$1g').replace(/rth/g,'rtth').replace(/([aeiou])tr(?=[aeiou])/g,'$1thr');
 if(!s)return w;
 const toks=[];while(i<s.length){let hit=null;
  for(const [k,v] of VOW){if(s.startsWith(k,i)){hit=['V',v,k.length];break;}}
  if(!hit){for(const [k,v] of CONS){if(s.startsWith(k,i)){hit=['C',v,k.length,k];break;}}}
  if(!hit){i++;continue;}toks.push(hit);i+=hit[2];}
 let res='';const n=toks.length;
 for(let t=0;t<n;t++){const k=toks[t];
  if(k[0]==='V'){if(t===0||toks[t-1][0]==='V'){res+=VI[k[1]];}else{/* sign goes on the previous consonant, handled below */}continue;}
  /* consonant */
  let ch=k[1];const nx=toks[t+1],pv=toks[t-1];
  const raw=k[3];
  if(raw==='c'&&nx&&nx[0]==='V'&&'ei'.includes(nx[1][0]))ch='ச';
  if(raw==='n'){if(!nx)ch='ன';else if(t===0)ch='ந';else if(nx[0]==='C'&&['த','ட','ட்ட'].includes(nx[1].slice(0,1)==='ட'?'ட':nx[1].slice(0,1)))ch=nx[3]==='t'||nx[3]==='th'||nx[3]==='d'||nx[3]==='dh'?'ந':'ண';else if(nx[0]==='C'&&['க','ங'].includes(nx[1][0]))ch='ங';else if(nx[0]==='C'&&nx[3]==='sh')ch='ண';else if(nx[0]==='V'&&pv&&pv[0]==='V')ch='ன';}
  if(raw==='t'&&!(pv&&pv[0]==='C'&&pv[3]==='n')&&nx&&nx[0]==='C'&&nx[3]==='r')ch='ற';
  if(raw==='d'&&nx&&nx[0]==='C'&&nx[3]==='r')ch='த';
  /* vowel after this consonant? */
  if(nx&&nx[0]==='V'){let v=nx[1];if(v==='e'&&toks[t+2]&&toks[t+2][0]==='C'&&toks[t+2][3]==='sh')v='ae';res+=ch.replace(/்$/,'')+VS[v];}
  else if(!nx){/* word-final consonant -> pulli */res+=ch.endsWith('்')?ch:ch+'்';}
  else{/* consonant cluster: pulli */res+=ch.endsWith('்')?ch:ch+'்';}
  }
 /* inherent 'a' between consonants is just the bare consonant: if next token is consonant we already added pulli; fix cases like 'ka' + consonant */
 // re-walk to restore the inherent a (consonant + 'a' + consonant): handled by VS.a='' -> consonant bare, then next consonant follows
 let fixed='';
 for(let t=0,pos=0;t<n;t++){/* placeholder: rebuild with inherent-a awareness */}
 return rebuild(toks,lw,openEnd);
}
function rebuild(toks,lw,openEnd){
 let res='';const n=toks.length;
 for(let t=0;t<n;t++){const k=toks[t],nx=toks[t+1],pv=toks[t-1],nx2=toks[t+2];
  if(k[0]==='V'){if(t===0||pv[0]==='V')res+=VI[k[1]];continue;}
  let ch=k[1];const raw=k[3];
  if(raw==='c'&&nx&&nx[0]==='V'&&'ei'.includes(nx[1][0]))ch='ச';
  if(raw==='n'){
   if(!nx)ch='ன';else if(t===0)ch='ந';
   else if(nx[0]==='C'&&(nx[3]==='t'||nx[3]==='th'||nx[3]==='d'||nx[3]==='dh'))ch='ந';
   else if(nx[0]==='C'&&(nx[3]==='k'||nx[3]==='g'||nx[3]==='kh'||nx[3]==='gh'))ch='ங';
   else if(nx[0]==='C'&&(nx[3]==='sh'||nx[3]==='ksh'))ch='ண';
   else if(nx[0]==='C'&&nx[3]==='j')ch='ஞ';
   else if(nx&&nx[0]==='V'&&nx[1]==='i'&&pv&&pv[0]==='V'&&toks[t-2]&&toks[t-2][0]==='C'&&['r','h','v','k','g'].includes(toks[t-2][3])&&['a','i','o'].includes(pv[1]))ch='ண';
   else ch='ன';}
  if(raw==='t'&&nx&&nx[0]==='C'&&nx[3]==='r'&&pv&&pv[0]==='V')ch='ற';
  if(raw==='t'&&pv&&pv[0]==='C'&&pv[3]==='n')ch='த';
  if(raw==='d'&&pv&&pv[0]==='C'&&pv[3]==='n')ch='த';
  const bare=ch.replace(/்$/,'');
  if(nx&&nx[0]==='V'){let v=nx[1];
   if(v==='e'&&nx2&&nx2[0]==='C'&&nx2[3]==='sh')v='ae';
   if(v==='a'&&!nx2&&!openEnd&&lw.length>3&&pv&&k[3]!=='h')v='aa';
   if((v==='e'||v==='o')&&nx2&&nx2[0]==='C'&&toks[t+3]&&toks[t+3][0]==='V')v=v==='e'?'ae':'oa';   /* word-final a is long in most Indian names: Priya, Radha, Anitha */
   res+=bare+VS[v];continue;}
  if(!nx){res+=bare+'்';continue;}
  /* consonant followed by consonant: if this is a stop right after a vowel that had no sign, the bare form is already used */
  res+=bare+'்';
 }
 return res;}
function enToTa(text){return String(text||'').split(/(\s+|[.,;:()\-\/])/).map(p=>{if(!p||/^(\s+|[.,;:()\-\/])$/.test(p))return p;if(/[\u0B80-\u0BFF]/.test(p))return p;if(/^[A-Za-z]$/.test(p)){const L={a:'ஏ',b:'பி',c:'சி',d:'டி',e:'ஈ',f:'எஃப்',g:'ஜி',h:'ஹெச்',i:'ஐ',j:'ஜே',k:'கே',l:'எல்',m:'எம்',n:'என்',o:'ஓ',p:'பி',q:'க்யூ',r:'ஆர்',s:'எஸ்',t:'டி',u:'யூ',v:'வி',w:'டபிள்யூ',x:'எக்ஸ்',y:'ஒய்',z:'இசட்'};return L[p.toLowerCase()];}if(!/[A-Za-z]/.test(p))return p;return enWord(p);}).join('');}
/* ---------- Tamil -> English ---------- */
const TC={'க':'k','ங':'ng','ச':'s','ஞ':'nj','ட':'t','ண':'n','த':'th','ந':'n','ப':'p','ம':'m','ய':'y','ர':'r','ல':'l','வ':'v','ழ':'zh','ள':'l','ற':'r','ன':'n','ஜ':'j','ஷ':'sh','ஸ':'s','ஹ':'h','க்ஷ':'ksh'};
const TV={'அ':'a','ஆ':'a','இ':'i','ஈ':'ee','உ':'u','ஊ':'oo','எ':'e','ஏ':'e','ஐ':'ai','ஒ':'o','ஓ':'o','ஔ':'au'},TS={'ா':'a','ி':'i','ீ':'ee','ு':'u','ூ':'oo','ெ':'e','ே':'e','ை':'ai','ொ':'o','ோ':'o','ௌ':'au'};
function taWord(w){
 if(EXT[w])return EXT[w];
 const ch=Array.from(w),syl=[];let i=0;
 while(i<ch.length){const c=ch[i];
  if(TV[c]){syl.push({v:TV[c]});i++;continue;}
  if(c==='க'&&ch[i+1]==='்'&&ch[i+2]==='ஷ'){let v='a',j=i+3;if(ch[j]==='்'){v='';j++;}else if(TS[ch[j]]!==undefined){v=TS[ch[j]];j++;}syl.push({c:'ksh',v});i=j;continue;}
  if(TC[c]){let v='a',j=i+1;if(ch[j]==='்'){v='';j++;}else if(TS[ch[j]]!==undefined){v=TS[ch[j]];j++;}syl.push({c:c,v});i=j;continue;}
  syl.push({raw:c});i++;}
 let out='';
 for(let s=0;s<syl.length;s++){const y=syl[s],pv=syl[s-1],nx=syl[s+1];
  if(y.raw!==undefined){out+=y.raw;continue;}
  if(y.c===undefined){out+=y.v;continue;}
  let k=TC[y.c]||(y.c==='ksh'?'ksh':y.c);const first=s===0,afterV=pv&&pv.c!==undefined&&pv.v!==''||pv&&pv.c===undefined,afterNasal=pv&&pv.c&&pv.v===''&&['ங','ஞ','ண','ந','ன','ம'].includes(pv.c);
  const gem=pv&&pv.c===y.c&&pv.v==='';
  if(y.c==='க'){k=(first||gem||(pv&&pv.c&&pv.v===''&&!afterNasal))?'k':'g';if(afterNasal&&pv.c==='ங')k='k';}
  else if(y.c==='ச'){k=(first||gem||(pv&&pv.v===''))?'s':'s';if(first&&nx&&nx.v&&'ei'.includes(nx.v[0])&&false)k='ch';if(gem||afterNasal&&pv.c==='ஞ')k='ch';}
  else if(y.c==='ட'){k=(first||gem||(pv&&pv.c&&pv.v===''))?'t':'d';}
  else if(y.c==='த'){k=(first||gem)?'th':(afterNasal?'th':'th');if(afterNasal&&(pv.c==='ந'||pv.c==='ன'))k='d';else if(!first&&!gem&&afterV)k='th';}
  else if(y.c==='ப'){k=(first||gem||(pv&&pv.c&&pv.v===''))?'p':'b';}
  else if(y.c==='ந'||y.c==='ன'||y.c==='ண'){k='n';}
  if(gem&&out.endsWith(k))out=out.slice(0,-k.length);
  out+=k+y.v;
 }
 return out.charAt(0).toUpperCase()+out.slice(1);}
function taToEn(text){return String(text||'').split(/(\s+|[.,;:()\-\/])/).map(p=>{if(!p||/^(\s+|[.,;:()\-\/])$/.test(p))return p;if(!/[\u0B80-\u0BFF]/.test(p))return p;return taWord(p);}).join('');}
const api={enToTa,taToEn,EX};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TRL=api;
})(typeof window!=='undefined'?window:globalThis);

(function(){const X=window.PX10;if(!X)return;
 X.trl=TRL;
 /* Tamil spelling of a person's name: used for message greetings when the message is Tamil */
 X.nameTa=v=>{if(!v)return'';if(v.nameTa&&String(v.nameTa).trim())return String(v.nameTa).trim();try{return TRL.enToTa(v.name||'');}catch(e){return v.name;}};
 X.mod('Name converter',[],()=>{if(TRL.enToTa('Murugan')!=='முருகன்')throw new Error('self-test failed');});
})();
