/* PANCHANGAM ENGINE (Sun/Moon positions, Lahiri ayanamsa) */
/* Panchangam engine — computed from the Sun and Moon positions (no internet needed).
   Moon: Meeus ch.47 (longitude series).  Sun: Meeus ch.25.  Ayanamsa: Lahiri.  Sunrise/sunset: NOAA method (upper limb, 90.833°).
   Default place: Thiruninravur, Tamil Nadu (13.12 N, 80.03 E), IST.  Tithi/nakshatra are "at sunrise", with end times. */
(function(root){
'use strict';
const R=Math.PI/180,D=180/Math.PI,mod=(a,n)=>((a%n)+n)%n;
const jd=ms=>ms/86400000+2440587.5;
const MT=[[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],[2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]];
function moonLon(J){const T=(J-2451545)/36525,T2=T*T,T3=T2*T,T4=T3*T,
 Lp=218.3164477+481267.88123421*T-0.0015786*T2+T3/538841-T4/65194000,
 Dd=297.8501921+445267.1114034*T-0.0018819*T2+T3/545868-T4/113065000,
 M=357.5291092+35999.0502909*T-0.0001536*T2+T3/24490000,
 Mp=134.9633964+477198.8675055*T+0.0087414*T2+T3/69699-T4/14712000,
 F=93.2720950+483202.0175233*T-0.0036539*T2-T3/3526000+T4/863310000,
 E=1-0.002516*T-0.0000074*T2,A1=119.75+131.849*T,A2=53.09+479264.290*T;
 let s=0;for(const t of MT){const ar=(t[0]*Dd+t[1]*M+t[2]*Mp+t[3]*F)*R,e=Math.abs(t[1])===1?E:Math.abs(t[1])===2?E*E:1;s+=t[4]*e*Math.sin(ar);}
 s+=3958*Math.sin(A1*R)+1962*Math.sin((Lp-F)*R)+318*Math.sin(A2*R);
 const om=125.04-1934.136*T;return mod(Lp+s/1e6-0.00478*Math.sin(om*R),360);}
function sunLon(J){const T=(J-2451545)/36525,L0=280.46646+36000.76983*T+0.0003032*T*T,M=357.52911+35999.05029*T-0.0001537*T*T,
 C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M*R)+(0.019993-0.000101*T)*Math.sin(2*M*R)+0.000289*Math.sin(3*M*R),om=125.04-1934.136*T;
 return mod(L0+C-0.00569-0.00478*Math.sin(om*R),360);}
const ayan=J=>{const T=(J-2451545)/36525;return 23.85306+1.396*T+0.0003*T*T;};
const elong=J=>mod(moonLon(J)-sunLon(J),360);
/* sunrise / sunset for a civil date at (lat,lon); returns ms (UTC epoch) */
function sunTimes(y,m,d,lat,lon){const J=jd(Date.UTC(y,m-1,d,12))-lon/360,T=(J-2451545)/36525,
 L0=mod(280.46646+T*(36000.76983+T*0.0003032),360),M=357.52911+T*(35999.05029-0.0001537*T),ec=0.016708634-T*(0.000042037+0.0000001267*T),
 C=Math.sin(M*R)*(1.914602-T*(0.004817+0.000014*T))+Math.sin(2*M*R)*(0.019993-0.000101*T)+Math.sin(3*M*R)*0.000289,tl=L0+C,
 al=tl-0.00569-0.00478*Math.sin((125.04-1934.136*T)*R),mo=23+(26+(21.448-T*(46.815+T*(0.00059-T*0.001813)))/60)/60,ob=mo+0.00256*Math.cos((125.04-1934.136*T)*R),
 dec=Math.asin(Math.sin(ob*R)*Math.sin(al*R))*D,yy=Math.tan(ob*R/2)**2,
 et=4*D*(yy*Math.sin(2*L0*R)-2*ec*Math.sin(M*R)+4*ec*yy*Math.sin(M*R)*Math.cos(2*L0*R)-0.5*yy*yy*Math.sin(4*L0*R)-1.25*ec*ec*Math.sin(2*M*R)),
 ha=Math.acos(Math.cos(90.833*R)/(Math.cos(lat*R)*Math.cos(dec*R))-Math.tan(lat*R)*Math.tan(dec*R))*D,noon=720-4*lon-et;
 const base=Date.UTC(y,m-1,d);return{rise:base+(noon-ha*4)*60000,set:base+(noon+ha*4)*60000,noon:base+noon*60000};}
/* find the time (ms) at which f(ms) crosses zero going upward within [a,b] */
function root1(f,a,b){let fa=f(a),fb=f(b);if(fa>0)return a;for(let i=0;i<60;i++){const c=(a+b)/2,fc=f(c);if(fc<0)a=c;else b=c;if(b-a<5000)break;}return(a+b)/2;}
const TITHI_EN=['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashti','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima','Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashti','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];
const TITHI_TA=['பிரதமை','துவிதியை','திருதியை','சதுர்த்தி','பஞ்சமி','சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி','ஏகாதசி','துவாதசி','திரயோதசி','சதுர்த்தசி','பௌர்ணமி','பிரதமை','துவிதியை','திருதியை','சதுர்த்தி','பஞ்சமி','சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி','ஏகாதசி','துவாதசி','திரயோதசி','சதுர்த்தசி','அமாவாசை'];
const NAK_EN=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const NAK_TA=['அஸ்வினி','பரணி','கிருத்திகை','ரோகிணி','மிருகசீரிடம்','திருவாதிரை','புனர்பூசம்','பூசம்','ஆயில்யம்','மகம்','பூரம்','உத்திரம்','அஸ்தம்','சித்திரை','சுவாதி','விசாகம்','அனுஷம்','கேட்டை','மூலம்','பூராடம்','உத்திராடம்','திருவோணம்','அவிட்டம்','சதயம்','பூரட்டாதி','உத்திரட்டாதி','ரேவதி'];
const YOGA_EN=['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
const YOGA_TA=['விஷ்கம்பம்','ப்ரீதி','ஆயுஷ்மான்','சௌபாக்யம்','சோபனம்','அதிகண்டம்','சுகர்மம்','திருதி','சூலம்','கண்டம்','விருத்தி','துருவம்','வியாகாதம்','ஹர்ஷணம்','வஜ்ரம்','சித்தி','வியதீபாதம்','வரீயான்','பரிகம்','சிவம்','சித்தம்','சாத்தியம்','சுபம்','சுப்ரம்','பிரம்மம்','ஐந்திரம்','வைதிருதி'];
const KAR_EN=['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'],KAR_TA=['பவம்','பாலவம்','கௌலவம்','தைதுலை','கரசை','வணிசை','பத்திரை'];
const KFIX_EN=['Kimstughna','Shakuni','Chatushpada','Naga'],KFIX_TA=['கிம்ஸ்துக்னம்','சகுனி','சதுஷ்பாதம்','நாகவம்'];
const karana=k=>k===1?0:k>=58?k-57:-1;const karName=(k,ta)=>{const f=karana(k);if(k===1)return(ta?KFIX_TA:KFIX_EN)[0];if(k>=58)return(ta?KFIX_TA:KFIX_EN)[k-57];return(ta?KAR_TA:KAR_EN)[(k-2)%7];};
const VARA_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],VARA_TA=['ஞாயிறு','திங்கள்','செவ்வாய்','புதன்','வியாழன்','வெள்ளி','சனி'];
const TM_EN=['Chithirai','Vaikasi','Aani','Aadi','Aavani','Purattasi','Aippasi','Karthigai','Margazhi','Thai','Maasi','Panguni'],TM_TA=['சித்திரை','வைகாசி','ஆனி','ஆடி','ஆவணி','புரட்டாசி','ஐப்பசி','கார்த்திகை','மார்கழி','தை','மாசி','பங்குனி'];
const YR_EN=['Prabhava','Vibhava','Shukla','Pramoduta','Prajotpatti','Angirasa','Srimukha','Bhava','Yuva','Dhatri','Isvara','Bahudhanya','Pramathi','Vikrama','Vrisha','Chitrabhanu','Svabhanu','Tarana','Parthiva','Vyaya','Sarvajit','Sarvadhari','Virodhi','Vikriti','Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukhi','Hevilambi','Vilambi','Vikari','Sarvari','Plava','Shubhakrit','Sobhakrit','Krodhi','Vishvavasu','Parabhava','Plavanga','Kilaka','Saumya','Sadharana','Virodhikrit','Paridhabi','Pramadicha','Ananda','Rakshasa','Nala','Pingala','Kalayukti','Siddharthi','Raudri','Durmati','Dundubhi','Rudhirodgari','Raktakshi','Krodhana','Akshaya'];
const YR_TA=['பிரபவ','விபவ','சுக்ல','பிரமோதூத','பிரசோற்பத்தி','ஆங்கீரச','ஸ்ரீமுக','பவ','யுவ','தாது','ஈஸ்வர','வெகுதான்ய','பிரமாதி','விக்கிரம','விஷு','சித்திரபானு','சுபானு','தாரண','பார்த்திப','விய','சர்வஜித்து','சர்வதாரி','விரோதி','விக்ருதி','கர','நந்தன','விஜய','ஜய','மன்மத','துன்முகி','ஹேவிளம்பி','விளம்பி','விகாரி','சார்வரி','பிலவ','சுபகிருது','சோபகிருது','குரோதி','விசுவாவசு','பராபவ','பிலவங்க','கீலக','சௌமிய','சாதாரண','விரோதகிருது','பரிதாபி','பிரமாதீச','ஆனந்த','ராட்சச','நள','பிங்கள','காளயுக்தி','சித்தார்த்தி','ரௌத்திரி','துன்மதி','துந்துபி','ருத்ரோத்காரி','ரக்தாட்சி','குரோதன','அட்சய'];
const RAHU=[8,2,7,5,6,4,3],YAMA=[5,4,3,2,1,7,6],GULI=[7,6,5,4,3,2,1];
const IST=330*60000,two=n=>String(n).padStart(2,'0');
const ist=ms=>new Date(ms+IST);
const hm=(ms,ta)=>{const d=ist(ms),h=d.getUTCHours(),m=d.getUTCMinutes(),ap=h>=12?'PM':'AM',h12=h%12===0?12:h%12;return two(h12)+':'+two(m)+' '+ap;};
const dmy=(ms)=>{const d=ist(ms);return two(d.getUTCDate())+'-'+two(d.getUTCMonth()+1)+' '+two(d.getUTCHours())+':'+two(d.getUTCMinutes());};
const siderealSun=J=>mod(sunLon(J)-ayan(J),360),siderealMoon=J=>mod(moonLon(J)-ayan(J),360);
/* the state of the sky at an instant */
function at(ms){const J=jd(ms),el=elong(J),sm=siderealMoon(J),ss=siderealSun(J);
 return{tithi:Math.floor(el/12)+1,k:Math.floor(el/6)+1,nak:Math.floor(sm/(360/27))+1,pada:Math.floor(mod(sm,360/27)/(360/108))+1,yoga:Math.floor(mod(sm+ss,360)/(360/27))+1,sunSign:Math.floor(ss/30),el,sm,ss};}
/* when does the current tithi / nakshatra / yoga / karana end? (first time the counter changes) */
function endOf(kind,ms){const f=kind==='tithi'?t=>at(t).tithi:kind==='nak'?t=>at(t).nak:kind==='yoga'?t=>at(t).yoga:t=>at(t).k;const cur=f(ms),n=kind==='tithi'?30:kind==='nak'?27:kind==='yoga'?27:60;let a=ms,step=kind==='k'?3:6;
 for(let i=0;i<200;i++){const b=a+step*3600000;if(f(b)!==cur){let lo=a,hi=b;for(let j=0;j<40;j++){const c=(lo+hi)/2;if(f(c)===cur)lo=c;else hi=c;if(hi-lo<20000)break;}return hi;}a=b;}return null;}
function tamilDate(y,m,d,lat,lon){/* month = the sidereal sign the Sun is in at sunset of the day (month starts on the day the Sun enters a sign before sunset) */
 const sset=(yy,mm,dd)=>sunTimes(yy,mm,dd,lat,lon).set,sign=ms=>Math.floor(siderealSun(jd(ms))/30);
 const s0=sign(sset(y,m,d));let n=1,c=new Date(Date.UTC(y,m-1,d));for(let i=0;i<32;i++){c=new Date(c.getTime()-864e5);if(sign(sset(c.getUTCFullYear(),c.getUTCMonth()+1,c.getUTCDate()))!==s0)break;n++;}
 /* the Tamil year starts with Chithirai (mid-April); Thai, Maasi, Panguni and early-year Margazhi days still belong to the year that began the April before */
 let yy=(s0>=9||(s0===8&&m<=3))?y-1:y;
 return{month:s0,day:n,year:yy};}
function compute(iso,lat,lon){lat=lat==null?13.12:lat;lon=lon==null?80.03:lon;const p=iso.split('-').map(Number),y=p[0],m=p[1],d=p[2],st=sunTimes(y,m,d,lat,lon),sr=st.rise,ss=st.set,wk=new Date(Date.UTC(y,m-1,d)).getUTCDay();
 const A=at(sr),Anoon=at(st.noon),tEnd=endOf('tithi',sr),nEnd=endOf('nak',sr),yEnd=endOf('yoga',sr),kEnd=endOf('k',sr);
 const nxt=t=>at(t+60000);const T2=tEnd?nxt(tEnd):null,N2=nEnd?nxt(nEnd):null,K2=kEnd?nxt(kEnd):null;
 const seg=(n)=>{const len=(ss-sr)/8;return[sr+(n-1)*len,sr+n*len];};
 const td=tamilDate(y,m,d,lat,lon),dayLen=ss-sr,abhi=[st.noon-dayLen/30,st.noon+dayLen/30];
 const paksha=A.tithi<=15?'S':'K',tn=A.tithi;
 const tags=[];const hasT=n=>[A.tithi,Anoon.tithi,(tEnd&&tEnd<ss&&T2)?T2.tithi:0].includes(n);
 if(hasT(6)||hasT(21))tags.push('sashti');if(A.nak===3||Anoon.nak===3||(nEnd&&nEnd<ss&&N2&&N2.nak===3))tags.push('krithigai');
 if(tn===15||Anoon.tithi===15)tags.push('pournami');if(tn===30||Anoon.tithi===30)tags.push('amavasya');if(hasT(13)||hasT(28))tags.push('pradosham');if(hasT(4))tags.push('sankashti-or-vinayaka');if(hasT(11)||hasT(26))tags.push('ekadashi');
 return{date:iso,vara:wk,sunrise:sr,sunset:ss,moonrise:null,tithi:{n:A.tithi,end:tEnd,next:T2?T2.tithi:null},nak:{n:A.nak,pada:A.pada,end:nEnd,next:N2?N2.nak:null},yoga:{n:A.yoga,end:yEnd},karana:{k:A.k,end:kEnd,next:K2?K2.k:null},
  tamil:td,rahu:seg(RAHU[wk]),yama:seg(YAMA[wk]),guli:seg(GULI[wk]),abhijit:abhi,tags,paksha};}
const nm=(arr,i)=>arr[(i-1+arr.length)%arr.length];
function names(p,ta){const T=ta?TITHI_TA:TITHI_EN,N=ta?NAK_TA:NAK_EN,Y=ta?YOGA_TA:YOGA_EN,PK=ta?{S:'வளர்பிறை',K:'தேய்பிறை'}:{S:'Shukla',K:'Krishna'};
 const tn=i=>{const x=nm(T,i);return(i===15||i===30)?x:x;};
 const yrIdx=((p.tamil.year-1987)%60+60)%60;
 return{vara:(ta?VARA_TA:VARA_EN)[p.vara],tithi:tn(p.tithi.n),paksha:PK[p.paksha],tithiNext:p.tithi.next?tn(p.tithi.next):'',nak:nm(N,p.nak.n),nakNext:p.nak.next?nm(N,p.nak.next):'',yoga:nm(Y,p.yoga.n),karana:karName(p.karana.k,ta),karanaNext:p.karana.next?karName(p.karana.next,ta):'',month:(ta?TM_TA:TM_EN)[p.tamil.month],year:(ta?YR_TA:YR_EN)[yrIdx]};}
const TAGL={sashti:['Sashti — Lord Murugan’s special day','சஷ்டி — முருகப்பெருமானுக்கு உகந்த நாள்'],krithigai:['Krithigai — Murugan’s star day','கிருத்திகை — முருகனுக்கு உகந்த நட்சத்திரம்'],pournami:['Pournami (full moon)','பௌர்ணமி'],amavasya:['Amavasya (new moon)','அமாவாசை'],pradosham:['Pradosham','பிரதோஷம்'],'sankashti-or-vinayaka':['Chaturthi','சதுர்த்தி'],ekadashi:['Ekadashi','ஏகாதசி']};
function text(p,lang){const ta=lang==='ta',n=names(p,ta),L=(a,b)=>ta?a:b,at_=ms=>hm(ms);
 const upto=(end)=>end?(ta?' '+hm(end)+' வரை':' until '+hm(end)):'';
 const rows=[];
 rows.push('📅 '+(ta?`${n.year} ஆண்டு, ${n.month} ${p.tamil.day} · ${n.vara}`:`${n.vara} · ${n.month} ${p.tamil.day}, ${n.year} (Tamil calendar)`));
 rows.push(L('திதி: ','Tithi: ')+n.paksha+' '+n.tithi+upto(p.tithi.end)+(n.tithiNext?(ta?`, பின் ${n.tithiNext}`:`, then ${n.tithiNext}`):''));
 rows.push(L('நட்சத்திரம்: ','Nakshatra: ')+n.nak+upto(p.nak.end)+(n.nakNext?(ta?`, பின் ${n.nakNext}`:`, then ${n.nakNext}`):''));
 rows.push(L('யோகம்: ','Yoga: ')+n.yoga+upto(p.yoga.end));rows.push(L('கரணம்: ','Karana: ')+n.karana+upto(p.karana.end));
 rows.push(L('சூரிய உதயம்: ','Sunrise: ')+hm(p.sunrise)+L(' · அஸ்தமனம்: ',' · Sunset: ')+hm(p.sunset));
 rows.push(L('ராகு காலம்: ','Rahu Kalam: ')+hm(p.rahu[0])+' – '+hm(p.rahu[1]));rows.push(L('எமகண்டம்: ','Yamagandam: ')+hm(p.yama[0])+' – '+hm(p.yama[1]));rows.push(L('குளிகை: ','Gulikai: ')+hm(p.guli[0])+' – '+hm(p.guli[1]));
 rows.push(L('அபிஜித் முகூர்த்தம்: ','Abhijit: ')+hm(p.abhijit[0])+' – '+hm(p.abhijit[1]));
 const tg=p.tags.map(t=>(TAGL[t]||[t,t])[ta?1:0]);if(tg.length)rows.push('🙏 '+tg.join(' · '));
 return rows.join('\n');}
const api={compute,names,text,at,moonLon,sunLon,sunTimes,elong,ayan,jd,hm,dmy,endOf,TITHI_EN,TITHI_TA,NAK_EN,NAK_TA,VARA_EN,VARA_TA,TM_EN,TM_TA,YR_EN,YR_TA,TAGL};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PCH=api;
})(typeof window!=='undefined'?window:globalThis);

/* ---------- shared helpers: dates + panchangam for banners, messages, the bot ---------- */
(function(){const X=window.PX10;if(!X)return;
 const MEN=['January','February','March','April','May','June','July','August','September','October','November','December'],MTA=['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];
 const isoNow=(d)=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
 X.isoNow=isoNow;
 /* the temple's calendar day (India time) whatever the phone's own time zone is — used for the reply bot and the daily script */
 X.istIso=(offsetDays)=>{const t=Date.now()+(+offsetDays||0)*864e5,d=new Date(t+330*60000);return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');};
 X.dateStr=(iso,lc)=>{const p=String(iso||isoNow()).split('-').map(Number),wd=new Date(Date.UTC(p[0],p[1]-1,p[2])).getUTCDay();return lc==='ta'?`${PCH.VARA_TA[wd]}, ${p[2]} ${MTA[p[1]-1]} ${p[0]}`:`${PCH.VARA_EN[wd]}, ${p[2]} ${MEN[p[1]-1]} ${p[0]}`;};
 const geo=()=>{try{const g=(db.settings||{}).geo||{};return[+g.lat||13.12,+g.lon||80.03];}catch(e){return[13.12,80.03];}};
 const cache=new Map();
 X.pan=iso=>{iso=iso||isoNow();const g=geo(),k=iso+'|'+g.join(',');if(cache.has(k))return cache.get(k);let o=null;
  try{const p=PCH.compute(iso,g[0],g[1]),en=PCH.names(p,false),ta=PCH.names(p,true);
   o={p,en,ta,short:{ta:`${ta.month} ${p.tamil.day} · ${ta.paksha} ${ta.tithi} · ${ta.nak}`,en:`${en.month} ${p.tamil.day} · ${en.paksha} ${en.tithi} · ${en.nak}`},full:{ta:PCH.text(p,'ta'),en:PCH.text(p,'en')},tags:p.tags};}catch(e){X.errs.push('panchang '+e.message);}
  cache.set(k,o);if(cache.size>40)cache.delete(cache.keys().next().value);return o;};
 /* one line for template parameters (no new lines, WhatsApp limit) */
 X.panLine=(iso,lc)=>{const o=X.pan(iso);if(!o)return'';const p=o.p,n=lc==='ta'?o.ta:o.en,h=PCH.hm;return lc==='ta'?`${n.month} ${p.tamil.day}, திதி ${n.paksha} ${n.tithi}, நட்சத்திரம் ${n.nak}, ராகு காலம் ${h(p.rahu[0])}-${h(p.rahu[1])}`:`${n.month} ${p.tamil.day}, Tithi ${n.paksha} ${n.tithi}, Nakshatra ${n.nak}, Rahu Kalam ${h(p.rahu[0])}-${h(p.rahu[1])}`;};
 X.panFull=(iso,lc)=>{const o=X.pan(iso);return o?o.full[lc==='ta'?'ta':'en']:'';};
 X.panTags=(iso)=>{const o=X.pan(iso);return o?o.tags:[];};
 X.mod('Panchangam engine',[],()=>{const o=X.pan(isoNow());if(!o)throw new Error('could not compute');});
})();
