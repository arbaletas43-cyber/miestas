'use strict';
(()=>{
const TW=96,TH=48,VS=0.55,/* v7: villagers scaled so a door ≈ villager height on the 3×3 plots */DAY=180,VER=1,DEERF=1;const FX=[];
let MAP,N,TER,WW,HH;
const $=id=>document.getElementById(id);
const cv=$('cv'),ctx=cv.getContext('2d');
// ---------- images ----------
const IM={};
// v11: painted v14 walk-cycle atlases (8 frames, 3 px per world px): [frameW,frameH,anchorX,anchorY(feet),idleFrame]
const VK=3,VM={"klaj_vyras_sw":[53,112,25.5,103.6,2],"klaj_vyras_ne":[48,105,24.6,103.6,6],"klaj_moteris_sw":[40,99,19.8,97.5,2],"klaj_moteris_ne":[35,99,17.2,97.6,1],"klaj_vaikas_sw":[35,82,16.7,76.4,2],"klaj_vaikas_ne":[34,80,17.0,76.5,6],"avis_ne":[103,118,55.5,114.2,0],"avis_sw":[104,105,52.0,98.4,0],"elnias_ne":[106,138,59.7,133.3,0],"elnias_sw":[112,126,55.0,116.6,3],"karve_ne":[139,133,71.7,129.8,2],"karve_sw":[146,129,73.0,119.9,0],"mergaite_ne":[34,81,17.7,76.5,3],"mergaite_sw":[30,81,14.9,76.5,3],"moteris_ne":[35,99,17.8,97.6,5],"moteris_sw":[40,103,20.0,97.6,2],"vaikas_ne":[33,81,17.2,76.5,6],"vaikas_sw":[35,82,16.8,76.4,2],"vyras_ne":[48,105,23.3,103.6,6],"vyras_sw":[53,112,25.9,103.6,2]};
function img(n){let i=IM[n];if(!i){i=new Image();i.src='img/'+n+'.webp';IM[n]=i;}return i.complete&&i.naturalWidth?i:null;}
// ---------- definitions ----------
const B={
 namas:{n:'Gyvenamasis namas',ic:'🏠',lv:['Šiaudinė troba','Medinis namas','Namas su akmeniniu pamatu','Mūrinis namas','Dviaukštis miestiečio namas'],size:[3,3,3,3,3],cap:[2,4,6,8,10],spr:['b_namas_1','b_namas_2','b_namas_3','b_namas_4','b_namas_5'],cost:[{m:10},{m:20},{m:25,a:15},{m:30,a:30},{m:40,a:50}],rev:6,d:'Čia gyvena šeima. Moterys parneša maisto ir malkų, gamina valgį.'},
 malkine:{n:'Malkinė',ic:'🪓',cat:'mediena',lv:['Malkų stoginė','Medkirčio trobelė','Medkirčių stovykla','Medienos dirbtuvės','Didžioji lentpjūvė'],size:[3,3,3,3,3],wk:[1,2,3,4,4],spr:['b_malkine_1','b_malkine_2','b_malkine_3','b_malkine_4','b_malkine_5'],cost:[{m:15},{m:25},{m:30,a:10},{m:40,a:25},{m:50,a:40}],rev:7,d:'Medkirčiai kerta medžius ir neša malkas į sandėlį. Nuo pirmo lygio patys sodina naujus medžius, o kai aplink medžių nebelieka – eina kirsti toliau.'},
 sulinys:{n:'Šulinys',ic:'💧',lv:['Paprastas šulinys','Šulinys su stogeliu','Šulinys su loviu','Šulinys su skridiniu','Akmeninis fontanas'],size:[3,3,3,3,3],spr:['b_sulinys_1','b_sulinys_2','b_sulinys_3','b_sulinys_4','b_sulinys_5'],cost:[{m:8,a:4},{m:10,a:8},{m:12,a:15},{m:15,a:25},{m:20,a:35}],rad:[6,7,8,9,10],rev:5,d:'Namai netoli šulinio laimingesni. Iš šulinio nešamas vanduo gaisrams gesinti.'},
 sandelis:{n:'Sandėlis',ic:'📦',lv:['Rąstinis sandėlis','Didesnis sandėlis','Daržinė','Mūrinis sandėlis','Didysis sandėlis'],size:[3,3,3,3,3],scap:[100,160,240,350,500],spr:['b_sandelis_1','b_sandelis_2','b_sandelis_3','b_sandelis_4','b_sandelis_5'],cost:[{m:30},{m:40},{m:50,a:20},{m:60,a:40},{m:80,a:60}],rev:9,d:'Čia laikomi visi ištekliai.'},
 medziotojas:{n:'Medžiotojo namelis',ic:'🦌',cat:'maistas',lv:['Medžiotojo trobelė','Medžiotojo namelis','Namelis su rūkykla','Medžiotojų namas','Medžioklės sodyba'],size:[3,3,3,3,3],wk:[1,1,2,2,3],spr:['b_medziotojas_1','b_medziotojas_2','b_medziotojas_3','b_medziotojas_4','b_medziotojas_5'],cost:[{m:15},{m:25},{m:30,a:10},{m:40,a:25},{m:50,a:40}],rev:7,d:'Medžiotojai medžioja elnius miške ir parneša mėsos.'},
 zvejas:{n:'Žvejo trobelė',ic:'🐟',cat:'maistas',water:1,lv:['Žvejo trobelė','Žvejo namelis','Žuvų džiovykla','Žvejų namas ant polių','Didžioji žvejų sodyba'],size:[3,3,3,3,3],wk:[1,1,2,2,3],spr:['b_zvejas_1','b_zvejas_2','b_zvejas_3','b_zvejas_4','b_zvejas_5'],cost:[{m:15},{m:25},{m:30,a:10},{m:40,a:25},{m:50,a:40}],rev:7,d:'Statoma prie vandens. Žvejai gaudo žuvį.'},
 skaldykla:{n:'Akmens skaldykla',ic:'⛏',cat:'akmuo',sx:'m',mtn:1,lv:['Skaldytojų urvas','Skaldykla su pastoge','Skaldykla su bėgiais','Akmentašių dirbtuvės','Didžioji skaldykla'],size:[3,3,3,3,3],wk:[1,2,2,3,4],spr:['b_skaldykla_1','b_skaldykla_2','b_skaldykla_3','b_skaldykla_4','b_skaldykla_5'],cost:[{m:20},{m:25,a:5},{m:30,a:15},{m:40,a:25},{m:50,a:40}],rev:6,d:'Statoma kalno ar uolos papėdėje. Vyrai nuolat skaldo uolą ir neša akmenis į sandėlį.'},
 lentpjuve:{n:'Lentpjūvė',ic:'🪚',cat:'mediena',sx:'m',lv:['Pjovėjų pastogė','Lentpjūvės stoginė','Lentpjūvė ant pamato','Lentpjūvė su vandens ratu','Didžioji lentpjūvė'],size:[3,3,3,3,3],wk:[1,1,2,2,3],spr:['b_lentpjuve_1','b_lentpjuve_2','b_lentpjuve_3','b_lentpjuve_4','b_lentpjuve_5'],cost:[{m:25},{m:30,a:10},{m:35,a:20},{m:45,a:30},{m:55,a:45}],rev:6,d:'Vyrai parsineša malkų iš malkinės ir supjauna jas į lentas. Lentų reikia pastatams tobulinti nuo 3 lygio.'},
 ukis:{n:'Ūkis',ic:'🌾',cat:'maistas',sx:'mf',fld:1,lv:['Klėtelė su lauku','Kluonas su lauku','Klėtis ant pamato','Ūkis su džiovykla','Didysis ūkis'],size:[3,3,3,3,3],wk:[2,2,3,4,4],spr:['b_ukis_1','b_ukis_2','b_ukis_3','b_ukis_4','b_ukis_5'],cost:[{m:25},{m:30,a:10},{m:35,a:20},{m:45,a:30},{m:55,a:45}],rev:6,d:'Moterys sėja grūdus, laukas auga, o prinokusius javus vyrai nupjauna ir neša grūdus į sandėlį.'},
 gyvuliai:{n:'Gyvulių ūkis',ic:'🐄',cat:'maistas',sx:'mf',fld:1,lv:['Gardas su pašiūre','Tvartelis','Tvartas ant pamato','Mūrinis tvartas','Didysis tvartas'],size:[3,3,3,3,3],wk:[2,2,3,3,4],spr:['b_gyvuliai_1','b_gyvuliai_2','b_gyvuliai_3','b_gyvuliai_4','b_gyvuliai_5'],cost:[{m:30},{m:35,a:10},{m:40,a:20},{m:50,a:30},{m:60,a:45}],rev:6,d:'Moterys šeria karves ir avis – avys duoda vilnos, bandą gausėja. Kai gyvulių daug, vyrai skerdžia ir neša mėsą į sandėlį.'},
 malunas:{n:'Malūnas',ic:'🌬',cat:'maistas',sx:'m',lv:['Medinis malūnėlis','Stiebinis malūnas','Mūrinis malūnas','Malūnas su galerija','Didysis malūnas'],size:[3,3,3,3,3],wk:[1,1,2,2,3],spr:['b_malunas_1','b_malunas_2','b_malunas_3','b_malunas_4','b_malunas_5'],cost:[{m:30,a:5},{m:35,a:15},{m:40,a:25},{m:50,a:35},{m:60,a:50}],rev:8,d:'Vyrai atsineša grūdų iš sandėlio ir mala juos į miltus.'},
 kepykla:{n:'Kepykla',ic:'🍞',cat:'maistas',sx:'f',lv:['Trobelė su krosnimi','Kepyklėlė','Kepykla su mūrine krosnimi','Mūrinė kepykla','Didžioji kepykla'],size:[3,3,3,3,3],wk:[1,1,2,2,3],spr:['b_kepykla_1','b_kepykla_2','b_kepykla_3','b_kepykla_4','b_kepykla_5'],cost:[{m:25,a:10},{m:30,a:15},{m:35,a:25},{m:45,a:35},{m:55,a:50}],rev:6,d:'Moterys kepa duoną iš miltų, krosniai kūrena malkas. Duona – sočiausias maistas (1 kepalas = 2 porcijos).'},
 zolininke:{n:'Žolininkės trobelė',ic:'🌿',cat:'gydymas',lv:['Žolininkės trobelė','Žolininkės namelis','Namelis su šiltnamiu','Gydytojos namas','Ligoninė'],size:[3,3,3,3,3],wk:[1,1,1,2,2],spr:['b_zolininke_1','b_zolininke_2','b_zolininke_3','b_zolininke_4','b_zolininke_5'],cost:[{m:15},{m:25},{m:30,a:10},{m:40,a:25},{m:50,a:40}],rev:6,d:'Žolininkė gydo susirgusius gyventojus. Sergantis nedirba.'}
};
for(const t in B){const c=B[t].cost;c[2].l=(c[2].l||0)+5;c[3].l=(c[3].l||0)+10;c[4].l=(c[4].l||0)+15;}
// v13: nomad era (klajokliai) – single-level buildings, era 1..4; S.era 5 = full village game
const NB={
 lauzas:{n:'Laužas',ic:'🔥',era:1,cap:100,d:'Klajoklių stovyklos širdis: čia laikomos visos atsargos (iki 100 kiekvieno ištekliaus, puodžiai prideda daugiau).'},
 pastoge:{n:'Pastogė',ic:'🛖',era:1,home:4,cost:{m:6},nx:'palapine',d:'Šakų pastogė šeimai (4 vietos). Vėliau ją galima patobulinti į kailių palapinę.'},
 palapine:{n:'Kailių palapinė',ic:'⛺',era:2,home:5,cost:{m:6,k:4},nx:'zemine',d:'Palapinė iš medžioklės kailių (5 vietos). Nuo 3 lygio – į žeminę.'},
 kstovykla:{n:'Medžiotojų stovykla',ic:'🏹',era:2,cat:'maistas',wk:2,cost:{m:10},d:'Medžiotojai su lankais nuolat medžioja elnius – mėsa ir kailiai.'},
 dziovykla:{n:'Džiovykla',ic:'🥩',era:2,cost:{m:8},d:'Ant karčių džiovinama mėsa, žuvis ir uogos – maistas nebegenda.'},
 zemine:{n:'Žeminė',ic:'🏚',era:3,home:6,cost:{m:14},nx:'namas',d:'Įkasta į žemę troba (6 vietos). 5 lygyje ją galima perstatyti į rąstinį namą.'},
 titnagas:{n:'Titnago dirbtuvė',ic:'🪓',era:3,cat:'akmuo',wk:1,cost:{m:10},d:'Meistras skaldo titnago įrankius – visi dirba ~30% greičiau.'},
 zvejyba:{n:'Žvejybos vieta',ic:'🎣',era:3,cat:'maistas',wk:1,water:1,cost:{m:10},d:'Žvejai prie vandens gaudo žuvį. Statoma prie upės ar ežero.'},
 aptvaras:{n:'Ožkų aptvaras',ic:'🐐',era:4,cat:'maistas',wk:1,sx:'f',cost:{m:16},d:'Moteris prižiūri ožkas – pienas ir mėsa.'},
 javai:{n:'Javų lopinėlis',ic:'🌾',era:4,cat:'maistas',wk:2,sx:'f',cost:{m:10},d:'Moterys augina ir titnaginiais pjautuvais pjauna grūdus.'},
 puodzerija:{n:'Puodžių dirbtuvė',ic:'🏺',era:4,cost:{m:14},d:'Moliniai puodai – +40 vietos kiekvienam ištekliui prie laužo.'}};
const NSPR={lauzas:'k_lauzas',pastoge:'k_pastoge',palapine:'k_palapine',kstovykla:'k_stovykla',dziovykla:'k_dziovykla',zemine:'k_zemine',titnagas:'k_titnagas',zvejyba:'k_zvejyba',aptvaras:'k_aptvaras',javai:'k_javai',puodzerija:'k_puodzerija'};
for(const t in NB){const n=NB[t];B[t]={n:n.n,ic:n.ic,cat:n.cat,k:1,era:n.era,lv:[n.n],size:[3],wk:[n.wk||0],spr:['b_'+NSPR[t]],cost:[n.cost||{}],rev:7,d:n.d,nx:n.nx,water:n.water,sx:n.sx};if(n.home)B[t].cap=[n.home];}
const NORDER=['pastoge','palapine','zemine','kstovykla','dziovykla','zvejyba','aptvaras','javai','titnagas','puodzerija'];
// era advancement requirements (tunable): p = people, f = food, m = wood(logs), g = grain
const ERA=[null,{nm:'Klajokliai',p:8,f:30},{nm:'Medžiotojų stovykla',p:12,f:60},{nm:'Sėslieji',p:16,m:40},{nm:'Pirmieji ūkininkai',p:20,g:30},{nm:'Kaimas'}];
const isH=t=>t=='namas'||!!(B[t]&&B[t].k&&B[t].cap);
const hcap=b=>B[b.t].cap[b.lv-1];
const ORDER=['namas','malkine','sulinys','sandelis','medziotojas','zvejas','zolininke','skaldykla','lentpjuve','ukis','gyvuliai','malunas','kepykla'];
const CATN={statyba:'Statyba',maistas:'Maistas',akmuo:'Akmuo',mediena:'Malkos ir lentos',gydymas:'Gydymas'};
const RN={u:'uogas',k:'kailius',m:'malkas',a:'akmenis',l:'lentas',g:'grūdus',mi:'miltus',d:'duoną',v:'vilną',mesa:'mėsą',zuvis:'žuvį'};
const RI={u:'🫐',k:'🦌',m:'🪵',a:'🪨',l:'🪚',g:'🌾',mi:'🥣',d:'🍞',v:'🧶',mesa:'🍖',zuvis:'🐟'};
const RES0={u:0,k:0,m:0,a:0,mesa:0,zuvis:0,l:0,g:0,mi:0,d:0,v:0};
const PROC={lentpjuve:{inp:{m:3},out:{l:2},t:8,act:'pjauna lentas'},malunas:{inp:{g:3},out:{mi:3},t:8,act:'mala miltus'},kepykla:{inp:{mi:2,m:1},out:{d:3},t:10,act:'kepa duoną'}};
let RD=new Set();
const MN=['Jonas','Petras','Antanas','Kazys','Juozas','Povilas','Vytautas','Mindaugas','Algirdas','Tomas','Rokas','Matas','Lukas','Domas','Jokūbas','Stasys','Vincas','Benas','Adomas','Kęstutis'];
const FNm=['Ona','Marija','Elena','Rūta','Aldona','Birutė','Jūratė','Danutė','Eglė','Gabija','Austėja','Milda','Ieva','Agnė','Rasa','Laima','Vaiva','Saulė','Kotryna','Barbora'];
// ---------- state ----------
let S, occ, objAt, BR=new Set(), wearDirty=true;
const R=Math.random;
const rnd=(a,b)=>a+R()*(b-a), pick=a=>a[Math.floor(R()*a.length)];
const idx=(x,y)=>y*N+x, inM=(x,y)=>x>=0&&y>=0&&x<N&&y<N;
function terr(x,y){return TER[y][x];}
function addForest(){const has=new Set(S.objs.map(o=>o.x+','+o.y));const nz=(x,y)=>{const f=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v);};const X=x/7,Y=y/7,ix=Math.floor(X),iy=Math.floor(Y),fx=X-ix,fy=Y-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);return (f(ix,iy)*(1-sx)+f(ix+1,iy)*sx)*(1-sy)+(f(ix,iy+1)*(1-sx)+f(ix+1,iy+1)*sx)*sy;};
 const sx0=MAP.start.reduce((a,b)=>a+b[1],0)/MAP.start.length,sy0=MAP.start.reduce((a,b)=>a+b[2],0)/MAP.start.length;
 for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){if(has.has(x+','+y))continue;const t=terr(x,y);if(!'fg'.includes(t)||BR.has(idx(x,y)))continue;const d=Math.hypot(x-sx0,y-sy0);if(d<9)continue;let n=nz(x,y);if(d<16)n-=(16-d)/16*0.5;
  const pr=t=='f'?0.55+0.35*n:(n>0.58?(n-0.58)*2.2:0);if(R()<pr){const k=t=='f'?(R()<.7?(R()<.5?'pusis':'pusys'):pick(['berzas','azuolas'])):pick(['pusis','berzas','azuolas','pusis']);S.objs.push({x,y,k,s:0.85+R()*0.35,amt:0});has.add(x+','+y);}}}
function newGame(){
 S={v:VER,t:0,res:{...RES0,m:95,a:20,mesa:20,zuvis:12},b:[],p:[],deer:[],objs:MAP.objs.map(o=>{const r=o[2]=='akmenys'||o[2]=='uola';return{x:o[0],y:o[1],k:o[2],s:r?(o[2]=='uola'?1.1:0.9):o[3],amt:r?o[3]:0}}),wear:new Float32Array(4*N*N),fog:new Uint8Array(N*N),prio:['statyba','maistas','akmuo','mediena','gydymas'],roads:[],id:1,newT:0,cam:null,hint:{}};RD=new Set();
 addForest();
 rebuildGrids();
 S.era=1;
 if(S.era<5){const[,x,y]=MAP.start[0];for(let i=0;i<3;i++)for(let j=0;j<3;j++){const q=idx(x+i,y+j);if(objAt[q]){S.objs=S.objs.filter(o=>o!==objAt[q]);objAt[q]=null;}}addB('lauzas',x,y,1);
  S.res={...RES0,m:12,mesa:6,u:8};const d=door(S.b[0]);let k=0;for(const[sx,ch]of[['m',0],['f',0],['m',0],['f',0],['m',1],['f',1]]){const p=spawnP(sx,!!ch,null,d.x+(k%3)-1,d.y+1+(k/3|0));if(ch)p.age=1.5;k++;}
  reveal(44,41,11);for(let i=0;i<80&&S.deer.length<14;i++)deerTick(40);return;}
 for(const [t,x,y] of MAP.start){for(let i=0;i<3;i++)for(let j=0;j<3;j++){const q=idx(x+i,y+j);if(objAt[q]){S.objs=S.objs.filter(o=>o!==objAt[q]);objAt[q]=null;}}const b=addB(t,x,y,1);}
 const hs=S.b.filter(b=>b.t=='namas');
 for(const h of hs){spawnP('m',false,h);spawnP('f',false,h);}
 reveal(44,41,11);
 for(let i=0;i<80&&S.deer.length<14;i++)deerTick(40);
}
function grow3(){for(const b of S.b){if(b.s>=3)continue;let ok=true;for(let i=0;i<3&&ok;i++)for(let j=0;j<3;j++){const X=b.x+i,Y=b.y+j,q=idx(X,Y);if(!inM(X,Y)||'wuc'.includes(terr(X,Y))||(occ[q]&&occ[q]!=b.id)||objAt[q]||BR.has(q)||RD.has(q)){ok=false;break;}}
 if(ok){markB(b,0);b.s=3;markB(b,b.id);b.an=null;}}}
function rebuildGrids(){RCH=null;LZ.clear();occ=new Int32Array(N*N);objAt=new Array(N*N).fill(null);
 for(const o of S.objs)objAt[idx(o.x,o.y)]=o;
 for(const b of S.b)markB(b,b.id);}
let RCH=null;
const LZ=new Set();// v13: the open campfire plot is walkable so huts around it never cut the camp into pockets
function markB(b,v){RCH=null;if(b.t=='lauzas'){if(v>0)LZ.add(v);else LZ.delete(b.id);}const s=b.s;for(let i=0;i<s;i++)for(let j=0;j<s;j++)occ[idx(b.x+i,b.y+j)]=v;b.door=null;if(S)for(const q of S.b){q.door=null;q.fish=null;}}
function addB(t,x,y,lv){const d=B[t];const b={id:S.id++,t,x,y,lv,s:d.size[Math.max(0,lv-1)],st:'ok',wk:[],pan:0,wood:2,fire:0,burn:0,hap:60};if(t=='malkine')b.mk=0;if(t=='ukis')b.f={st:0,sow:0,g:0,cut:0};if(t=='gyvuliai'){b.herd={c:2,s:3};b.vb=0;}if(t=='namas')b.cl=0;
 for(let i=0;i<b.s;i++)for(let j=0;j<b.s;j++)if(RD.has(idx(x+i,y+j))){RD.delete(idx(x+i,y+j));}S.roads=[...RD];
 if(!lv){b.st='site';b.s=d.size[0];b.site=mkSite(t,0);}
 S.b.push(b);markB(b,b.id);if(lv)reveal(x+b.s/2,y+b.s/2,d.rev+lv);return b;}
function mkSite(t,lv){const c=B[t].cost[lv];const need={m:c.m||0,a:c.a||0,l:c.l||0};const got={m:0,a:0,l:0},inb={m:0,a:0,l:0};if(c.k){need.k=c.k;got.k=0;inb.k=0;}return{to:lv+1,need,got,inb,prog:0,tot:(need.m+need.a+need.l+(need.k||0))*0.6+6,bld:0};}
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
function spawnP(sex,child,home,x,y){const d=home?door(home):{x:44,y:44};
 const p={id:S.id++,sex,ch:child,age:0,nm:sex=='m'?pick(MN):pick(FNm),home:home?home.id:0,job:0,x:(x??d.x)+0.5,y:(y??d.y)+0.5,q:[],hu:rnd(0,30),en:100,sick:0,carry:null,in:0,fl:R()<.5?1:-1,ph:R()*6,off:[rnd(-.22,.22),rnd(-.22,.22)],act:''};
 S.p.push(p);return p;}
const byId=id=>S.b.find(b=>b.id==id)||S.p.find(p=>p.id==id);
const bId=id=>S.b.find(b=>b.id==id);
// ---------- fog ----------
let fogCv=document.createElement('canvas');fogCv.width=fogCv.height=80;let fogDirty=true;
function reveal(cx,cy,r){for(let y=Math.max(0,Math.floor(cy-r));y<=Math.min(N-1,cy+r);y++)for(let x=Math.max(0,Math.floor(cx-r));x<=Math.min(N-1,cx+r);x++)if(Math.hypot(x+.5-cx,y+.5-cy)<=r)S.fog[idx(x,y)]=1;fogDirty=true;}
function buildFog(){fogCv.width=N;fogCv.height=N;const c=fogCv.getContext('2d'),id=c.createImageData(N,N);
 const dist=new Uint8Array(N*N).fill(9);const q=[];for(let i=0;i<N*N;i++)if(S.fog[i]){dist[i]=0;q.push(i);}
 for(let h=0;h<q.length;h++){const i=q[h],x=i%N,y=(i/N)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(inM(X,Y)&&dist[idx(X,Y)]>dist[i]+1){dist[idx(X,Y)]=dist[i]+1;if(dist[i]+1<4)q.push(idx(X,Y));}}}
 const A=[0,140,200,225,235];for(let i=0;i<N*N;i++){id.data[i*4]=20;id.data[i*4+1]=24;id.data[i*4+2]=30;id.data[i*4+3]=A[Math.min(4,dist[i])];}
 c.putImageData(id,0,0);fogDirty=false;}
const seen=(x,y)=>inM(x|0,y|0)&&S.fog[idx(x|0,y|0)];
// ---------- map helpers ----------
function isMtn(x,y){return 'uc'.includes(terr(x,y));}
function walk(x,y){if(!inM(x,y))return false;const t=terr(x,y);if(t=='w')return BR.has(idx(x,y));if(t=='u'||t=='c')return false;const o=occ[idx(x,y)];return !o||LZ.has(o);}
// v11: tiles reachable on foot from the storehouses (or the start) – builders/carriers can only work on sites whose door is in this set
function reach(){if(RCH)return RCH;const R=new Uint8Array(N*N),Q=[];const add=(x,y)=>{if(inM(x,y)&&walk(x,y)&&!R[idx(x,y)]){R[idx(x,y)]=1;Q.push(x,y);}};
 const st=S?S.b.filter(b=>(b.t=='sandelis'||b.t=='lauzas')&&b.st!='site'):[];for(const b of st)for(let i=-1;i<=b.s;i++)for(const[x,y]of[[b.x+i,b.y-1],[b.x+i,b.y+b.s],[b.x-1,b.y+i],[b.x+b.s,b.y+i]])add(x,y);if(!Q.length)add(44,44);
 for(let k=0;k<Q.length;k+=2){const x=Q[k],y=Q[k+1];add(x+1,y);add(x-1,y);add(x,y+1);add(x,y-1);}return RCH=R;}
function reachB(b,R){R=R||reach();for(let i=-1;i<=b.s;i++)for(const[x,y]of[[b.x+i,b.y-1],[b.x+i,b.y+b.s],[b.x-1,b.y+i],[b.x+b.s,b.y+i]])if(inM(x,y)&&R[idx(x,y)])return true;return false;}
const siteOK=b=>{const d=door(b);return inM(d.x,d.y)&&!!reach()[idx(d.x,d.y)];};
function door(b){if(b.door)return b.door;const s=b.s,c=[[b.x+(s>>1),b.y+s],[b.x+s,b.y+(s>>1)],[b.x+(s>>1),b.y-1],[b.x-1,b.y+(s>>1)],[b.x+s,b.y+s],[b.x-1,b.y+s],[b.x+s,b.y-1],[b.x-1,b.y-1]];
 {const R=reach();for(const[x,y]of c)if(walk(x,y)&&R[idx(x,y)])return b.door={x,y};for(let i=-1;i<=s;i++)for(const[x,y]of[[b.x+i,b.y-1],[b.x+i,b.y+s],[b.x-1,b.y+i],[b.x+s,b.y+i]])if(inM(x,y)&&R[idx(x,y)])return b.door={x,y};}
 for(const[x,y]of c)if(walk(x,y))return b.door={x,y};for(let r=2;r<6;r++)for(let i=-r;i<s+r;i++)for(const[x,y]of[[b.x+i,b.y+s-1+r],[b.x+s-1+r,b.y+i]])if(walk(x,y))return b.door={x,y};return b.door={x:b.x,y:b.y+s};}
// ---------- A* ----------
const G=new Float32Array(6400),CF=new Int32Array(6400),ST=new Int32Array(6400);let stamp=1;
function astar(sx,sy,tx,ty){sx|=0;sy|=0;tx|=0;ty|=0;if(!inM(tx,ty))return null;
 if(!walk(tx,ty)){let best=null,bd=1e9;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=tx+dx,Y=ty+dy;if(walk(X,Y)){const d=Math.abs(dx)+Math.abs(dy);if(d<bd){bd=d;best=[X,Y];}}}if(!best)return null;[tx,ty]=best;}
 if(!walk(sx,sy)){let f=0;for(let r=1;r<4&&!f;r++)for(let dy=-r;dy<=r&&!f;dy++)for(let dx=-r;dx<=r&&!f;dx++)if(walk(sx+dx,sy+dy)){sx+=dx;sy+=dy;f=1;}}
 stamp++;const h=[],T=idx(tx,ty);const push=(i,f)=>{h.push([f,i]);let k=h.length-1;while(k>0){const p=(k-1)>>1;if(h[p][0]<=h[k][0])break;[h[p],h[k]]=[h[k],h[p]];k=p;}};
 const pop=()=>{const t=h[0],l=h.pop();if(h.length){h[0]=l;let k=0;for(;;){let a=2*k+1,b=a+1,m=k;if(a<h.length&&h[a][0]<h[m][0])m=a;if(b<h.length&&h[b][0]<h[m][0])m=b;if(m==k)break;[h[m],h[k]]=[h[k],h[m]];k=m;}}return t;};
 const s0=idx(sx,sy);ST[s0]=stamp;G[s0]=0;CF[s0]=-1;push(s0,0);let n=0;
 while(h.length&&n++<7000){const[,i]=pop();if(i==T)break;const x=i%N,y=(i/N)|0;
  for(let d=0;d<8;d++){const dx=[1,-1,0,0,1,1,-1,-1][d],dy=[0,0,1,-1,1,-1,1,-1][d],X=x+dx,Y=y+dy;if(!walk(X,Y))continue;if(d>3&&(!walk(x+dx,y)||!walk(x,y+dy)))continue;
   const j=idx(X,Y);const w=S.wear[(Y*2)*2*N+X*2]||0;const c=(d>3?1.414:1)*(objAt[j]&&objAt[j].k!='kelmas'?1.6:1)*(w>8?0.8:1)*(RD.has(j)?0.55:1);const g=G[i]+c;
   if(ST[j]!=stamp||g<G[j]){ST[j]=stamp;G[j]=g;CF[j]=i;push(j,g+Math.hypot(X-tx,Y-ty));}}}
 if(ST[T]!=stamp)return null;const path=[];for(let i=T;i!=-1;i=CF[i])path.push([i%N,(i/N)|0]);return path.reverse();}
function smooth(p,off){let pts=p.map(([x,y],i)=>[x+.5+(i&&i<p.length-1?off[0]:0),y+.5+(i&&i<p.length-1?off[1]:0)]);
 for(let k=0;k<2;k++){if(pts.length<3)break;const o=[pts[0]];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];o.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);}o.push(pts[pts.length-1]);pts=o;}return pts;}
// ---------- resources ----------
const stores=()=>S.b.filter(b=>(b.t=='sandelis'||b.t=='lauzas')&&b.st!='site');
function cap(){let c=0;for(const b of stores())c+=b.t=='lauzas'?NB.lauzas.cap:B.sandelis.scap[b.lv-1];for(const b of S.b)if(b.t=='puodzerija'&&b.lv)c+=40;return c;}
const food=()=>S.res.mesa+S.res.zuvis+2*S.res.d+(S.res.u||0);
const sheds=()=>S.b.filter(b=>b.t=='malkine'&&b.lv&&b.st!='demo');
const mkCap=b=>30+15*b.lv;
function woodTot(){let n=S.res.m;for(const b of sheds())n+=b.mk||0;return n;}
function avail(k){return k=='m'?woodTot():S.res[k]||0;}
// nearest place to pick up resource k (woodsheds hold firewood; everything else is in stores)
function srcFor(k,x,y,n){n=n||1;let c=[];if(k=='m'){c=sheds().filter(b=>(b.mk||0)>=n);if(S.res.m>=n)c.push(...stores());if(!c.length){c=sheds().filter(b=>(b.mk||0)>=1);if(S.res.m>=1)c.push(...stores());}}else if((S.res[k]||0)>=1)c=stores();return nearest(c,x,y);}
function takeAt(src,k,n){if(!src)return 0;if(k=='m'&&src.t=='malkine'){const b=bId(src.id);if(!b)return 0;const g=Math.min(n,Math.floor(b.mk||0));b.mk-=g;return g;}const g=Math.min(n,Math.floor(S.res[k]||0));S.res[k]-=g;return g;}
function nearest(list,x,y){let b=null,bd=1e9;for(const o of list){const d=door(o),dd=Math.hypot(d.x-x,d.y-y);if(dd<bd){bd=dd;b=o;}}return b;}
function deposit(k,n){const c=cap();const room=Math.max(0,c-S.res[k]);const put=Math.min(room,n);S.res[k]+=put;if(put<n)S.hint.full=S.t;return put;}
function takeFood(n){let g=0;while(g<n&&food()>=1){if(S.res.d>=1){S.res.d--;g+=2;}else if(S.res.mesa>=S.res.zuvis&&S.res.mesa>=1){S.res.mesa--;g++;}else if(S.res.zuvis>=1){S.res.zuvis--;g++;}else if(S.res.u>=1){S.res.u--;g++;}else break;}return g;}
// ---------- villagers: actions ----------
function release(p){const r=p.res;if(!r)return;p.res=null;
 if(r.k=='obj')r.o.res=0;else if(r.k=='inb'){const b=bId(r.b);if(b&&b.site)b.site.inb[r.r]=Math.max(0,b.site.inb[r.r]-r.n);}else if(r.k=='deer'){r.o.res=0;r.o.st=0;}else if(r.k=='heal'){const s=S.p.find(q=>q.id==r.p);if(s)s.treat=0;}}
function abort(p){release(p);p.help=0;if(p.meat){deposit('mesa',p.meat);p.meat=0;}p.q=[];p.path=null;if(p.hold){for(const k in p.hold)if(p.hold[k]>0)deposit(k,p.hold[k]);p.hold=null;p.carry=null;}}
const GO=(x,y)=>({a:'go',x,y}),WAIT=(t,l,inside)=>({a:'w',t,l,inside}),FN=f=>({a:'f',f});
const toB=b=>{const d=door(b);return GO(d.x,d.y);};
function workMul(p){const h=home(p);return (0.7+0.5*((h?h.hap:50)/100))*(S.tools?1.3:1);}
const home=p=>bId(p.home);
function stepP(p,dt){
 if(p.ch)p.age+=dt/DAY;
 p.hu=Math.min(100,p.hu+dt*100/130);
 if(p.sick){p.sick-=dt*(p.herbSelf?2.5:1);if(p.sick<=0){p.sick=0;p.treat=0;p.herbSelf=0;if(!p.ch)toast(p.nm+' pasveiko pats');}}
 const a=p.q[0];if(!a){brain(p);return;}
 if(a.a=='go'){
  p.fade=0;if(!p.path&&a.free&&lineOK(p.x,p.y,a.x+.5,a.y+.5)){p.path=[[p.x,p.y],[a.x+.5,a.y+.5]];p.pi=1;}
  if(!p.path){const r=astar(p.x,p.y,a.x,a.y);if(!r){abort(p);p.idle=2;return;}p.path=smooth(r,p.off);p.pi=1;}
  const sp=(p.ch?1.3:1.5)*(p.sick?0.6:1)*(RD.has(idx(p.x|0,p.y|0))?1.6:1)*dt;let left=sp;
  while(left>0&&p.pi<p.path.length){const[tx,ty]=p.path[p.pi],dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);
   if(d<=left){p.x=tx;p.y=ty;left-=d;p.pi++;}else{p.x+=dx/d*left;p.y+=dy/d*left;left=0;}
   const sx=dx-dy,sy=dx+dy;if(Math.abs(sx)>0.01)p.fl=sx>0?1:-1;if(Math.abs(sy)>0.01)p.bk=sy<0?1:0;}
  p.ph+=dt*9;p.in=0;p.mv=1;
  const wi=((p.y*2)|0)*2*N+((p.x*2)|0);if(S.wear[wi]<100){S.wear[wi]+=dt*1.2;if(S.wear[wi]>5&&S.wear[wi]-dt*1.2<=5)wearDirty=true;}
  if(p.pi>=p.path.length){p.q.shift();p.path=null;}
 }else if(a.a=='st'){const dx=a.x-p.x,dy=a.y-p.y,d=Math.hypot(dx,dy),st=(p.ch?1.0:1.1)*dt;if(Math.abs(dx-dy)>.01)p.fl=dx-dy>0?1:-1;if(Math.abs(dx+dy)>.01)p.bk=dx+dy<0?1:0;
  if(a.fi)p.fade=Math.max(0,(p.fade||0)-dt*3);else p.fade=0;
  if(d<=st){p.x=a.x;p.y=a.y;p.mv=0;p.fade=0;p.q.shift();}else{p.x+=dx/d*st;p.y+=dy/d*st;p.mv=1;p.ph+=dt*9;}
 }else if(a.a=='w'){p.mv=0;
  // v12: walk visibly across the yard to the painted door, fade only on the threshold
  if(a.inside&&!a.ent&&!p.in){if(a.ex==null){let b=null,bd=1.3;for(const q of S.b){if(q.st=='site'||!q.lv)continue;const dd=Math.hypot(door(q).x+.5-p.x,door(q).y+.5-p.y)-(q.id==p.home?0.3:0);if(dd<bd){bd=dd;b=q;}}if(b){const ad=artDoor(b);a.ox=p.x;a.oy=p.y;a.bid=b.id;if(ad){a.ex=ad.x;a.ey=ad.y;a.ha=1;if(!hidden(ad.x+0.1,ad.y+0.8,b)){a.wx=ad.x+0.1;a.wy=ad.y+0.8;}}else{const dx=b.x+b.s/2-p.x,dy=b.y+b.s/2-p.y,l=Math.hypot(dx,dy)||1,k=Math.min(0.8,l)/l;a.ex=p.x+dx*k;a.ey=p.y+dy*k;}}else a.ent=1;}
   if(!a.ent&&a.wx!=null){const dx=a.wx-p.x,dy=a.wy-p.y,d=Math.hypot(dx,dy),st=1.1*dt;if(Math.abs(dx-dy)>.01)p.fl=dx-dy>0?1:-1;if(Math.abs(dx+dy)>.01)p.bk=dx+dy<0?1:0;if(d<=st){p.x=a.wx;p.y=a.wy;a.wx=null;}else{p.x+=dx/d*st;p.y+=dy/d*st;}p.mv=1;p.ph+=dt*9;p.fade=0;p.act=a.l||p.act;return;}
   if(!a.ent){const dx=a.ex-p.x,dy=a.ey-p.y,d=Math.hypot(dx,dy),st=1.1*dt;if(Math.abs(dx-dy)>.01)p.fl=dx-dy>0?1:-1;if(Math.abs(dx+dy)>.01)p.bk=dx+dy<0?1:0;
    if(d<=st){a.ent=1;p.x=a.ex;p.y=a.ey;p.fade=0;}else{p.x+=dx/d*st;p.y+=dy/d*st;p.mv=1;p.ph+=dt*9;p.fade=d<0.35?(1-d/0.35)*0.9:0;p.act=a.l||p.act;return;}}}
  if(a.inside&&a.ent&&a.ex!=null&&a.t-dt<=0){p.q.shift();p.in=0;p.fade=0.9;p.q.unshift(...(a.ha&&!hidden(a.ex+0.1,a.ey+0.8,bId(a.bid))?[{a:'st',x:a.ex+0.1,y:a.ey+0.8,fi:1}]:[]),{a:'st',x:a.ox,y:a.oy,fi:1});return;}
  p.fade=0;p.in=a.inside?1:0;p.act=a.l||p.act;a.t-=dt;if(a.t<=0)p.q.shift();}
 else{p.q.shift();const r=a.f(p);if(r===false)abort(p);}
}
function brain(p){
 if(!p.in&&inM(p.x|0,p.y|0)){const ob=bId(occ[idx(p.x|0,p.y|0)]);if(ob&&ADP[ob.t]){const d=door(ob);p.q=[{a:'st',x:d.x+.5,y:d.y+.5,fi:1}];return;}}
 if(p.idle>0){p.idle-=0.1;p.q=[WAIT(1,'laukia')];return;}
 const h=home(p);
 if(p.sick){p.q=[...(h?[toB(h)]:[]),WAIT(3,'serga',1)];p.act='serga';return;}
 if(p.dem){const b=bId(p.dem);if(b&&b.st=='demo'){p.q=[toB(b),FN(o=>{face(o,b.x+b.s/2,b.y+b.s/2);}),WAIT(2,'griauna'),FN(o=>{const bb=bId(o.dem);if(!bb||bb.st!='demo'){o.dem=0;return;}bb.demo-=2*workMul(o);if(bb.demo<=0)finishDemo(bb);})];p.act='griauna';return;}p.dem=0;}
 if(p.carry){const s=nearest(stores(),p.x,p.y);if(s){p.q=[toB(s),FN(q=>{if(q.carry){if(q.carry.k=='food'){S.res.mesa+=q.carry.n;}else deposit(q.carry.k=='woodh'?'m':q.carry.k,q.carry.n);}q.carry=null;})];return;}p.carry=null;}
 if(isNight()&&h&&h.st!='demo'&&h.lv){p.q=[toB(h),WAIT(untilDawn(),'miega',1),FN(o=>{o.en=100;})];p.act='eina miegoti';return;}
 if(isNight()&&!h){p.q=[WAIT(4,'miega po atviru dangumi')];p.act='miega lauke';return;}
 if(p.ch){
  if(p.hu>60&&h&&meals(h)>=1){p.q=[toB(h),WAIT(2,'mama maitina',1),FN(q=>{eat(q);})];return;}
  if(h&&h.st!='site'&&h.lv&&ADP[h.t]&&R()<0.8&&yardPt(h)){const d=door(h),q=[GO(d.x,d.y)];let n=2+(R()*3|0);for(let i=0;i<n;i++){const y=yardPt(h);if(!y)continue;q.push({a:'st',x:y[0],y:y[1]},WAIT(rnd(1.5,4),'žaidžia kieme'));}q.push({a:'st',x:d.x+.5,y:d.y+.5});p.q=q;p.act='žaidžia kieme';return;}
  const d=h?door(h):{x:44,y:44},ys=yardSpot(d,p);p.q=[ys?{a:'go',x:ys[0],y:ys[1],free:1}:GO(d.x+Math.round(rnd(-3,3)),d.y+Math.round(rnd(-2,3))),WAIT(rnd(2,5),'žaidžia')];p.act='žaidžia';return;}
 // hunger / rest
 if((p.hu>70||p.en<20)&&h&&(S.era>=5||p.en<20||meals(h)>=1||food()>=1)){
  const q=[];const mom=S.p.find(z=>z.home==h.id&&z.sex=='f'&&!z.ch&&!z.sick&&!z.job);if(meals(h)<1&&mom&&(S.era>=5||mom!==p)&&food()>=1){q.push(toB(h),WAIT(6,'laukia vakarienės',1));}else if(meals(h)<1&&food()>=1){const s=nearest(stores(),p.x,p.y);if(s)q.push(toB(s),FN(o=>{const g=takeFood(2);if(g)o.carry={k:'food',n:g};}),toB(h),FN(o=>{const hh=home(o);if(o.carry&&hh){hh.dry=(hh.dry||0)+o.carry.n;o.carry=null;}}));}
  else q.push(toB(h));
  q.push(WAIT(3,'valgo',1),FN(o=>{eat(o);}));
  if(p.en<50)q.push(WAIT(10,'ilsisi',1),FN(o=>{o.en=100;}));
  p.q=q;p.act='eina namo';return;}
 if(p.hu>70&&!h&&S.era<5&&food()>=1){const s=nearest(stores(),p.x,p.y);if(s){p.q=[toB(s),WAIT(3,'valgo prie laužo'),FN(o=>{if(takeFood(1))o.hu=10;})];p.act='valgo prie laužo';return;}}
 // women household
 if(p.sex=='f'&&h&&h.st!='site'){
  const res=S.p.filter(q=>q.home==h.id).length;
  if((h.water||0)<1){const ws=waterSrc(p);if(ws){p.q=[ws.go,FN(o=>{o.tgt=null;const wl=nearest(S.b.filter(b=>b.t=='sulinys'&&b.lv),o.x,o.y);if(wl&&Math.hypot(wl.x+.5-o.x,wl.y+.5-o.y)<3)face(o,wl.x+.5,wl.y+.5);}),WAIT(ws.t+1,'semia vandenį'),FN(o=>{o.wb=1;}),toB(h),FN(o=>{const hh=home(o);o.wb=0;if(hh)hh.water=Math.min(4,(hh.water||0)+3);})];p.act='eina vandens';return;}}
  if((h.pan||0)+(h.dry||0)<Math.max(2,res)&&food()>=1){const s=nearest(stores(),p.x,p.y);if(s){p.q=[toB(s),FN(o=>{const g=takeFood(4);if(!g)return false;o.carry={k:'food',n:g};}),toB(h),WAIT(5,'verda sriubą',1),FN(o=>{const hh=home(o);if(o.carry&&hh){if((hh.water||0)>=1){hh.water-=1;hh.pan+=o.carry.n;}else hh.dry=(hh.dry||0)+o.carry.n;}o.carry=null;})];p.act='neša maistą';return;}}
  if(h.wood<1.5&&woodTot()>=1){const s=srcFor('m',p.x,p.y,3);if(s){p.q=[toB(s),FN(o=>{const g=takeAt(s,'m',3);if(!g)return false;o.carry={k:'woodh',n:g};}),toB(h),FN(o=>{const hh=home(o);if(o.carry&&hh)hh.wood+=o.carry.n;o.carry=null;})];p.act=s.t=='malkine'?'eina malkų į malkinę':'neša malkas namo';return;}}
  if(h.lv>=3&&(h.cl||0)<1&&S.res.v>=2&&!S.p.some(z=>z!==p&&z.home==h.id&&z.act=='siuva drabužius')){const s=nearest(stores(),p.x,p.y);if(s){p.q=[toB(s),FN(o=>{const g=takeAt(s,'v',2);if(!g)return false;o.carry={k:'v',n:g};}),toB(h),FN(o=>{o.carry=null;o.act='siuva drabužius';}),WAIT(12,'siuva drabužius',1),FN(o=>{const hh=home(o);if(hh)hh.cl=(hh.cl||0)+2;})];p.act='siuva drabužius';return;}}
  // feed: if men of the house are eating, stay home
 }
 const j=bId(p.job);
 if(j){if(doJob(p,j))return;}
 if(p.role){const b=bId(p.role);if(b&&b.site&&siteOK(b)){const s=b.site;const frac=sum(s.got)/Math.max(1,sum(s.need));if(s.prog>=s.tot*frac-0.01&&s.got.a<s.need.a&&S.res.a+s.inb.a<s.need.a-s.got.a&&p.sex=='m'&&stoneTask(p,1))return;builderTask(p,b);return;}p.role=0;}
 if(p.sg&&!j){if(stoneTask(p,1))return;p.sg=0;}
 if(!j&&carrierTask(p))return;
 if(!j&&p.sex=='m'&&!p.ch&&helperTask(p))return;
 if(!j&&S.era<5&&!p.ch&&nomadTask(p))return;
 if(!j&&p.sex=='m'&&stoneTask(p))return;
 if(p.sex=='f'&&h&&!j){p.q=[toB(h),WAIT(6,'gamina valgį',1)];p.act='namuose';return;}
 const c=nearest(stores(),p.x,p.y)||h;if(c){const d=door(c);p.q=[GO(d.x+Math.round(rnd(-3,3)),d.y+Math.round(rnd(-1,3))),WAIT(rnd(3,6),'laisvas')];}else p.q=[WAIT(3,'laisvas')];p.act='laisvas';
}
// v11: children play on grass in yards (straight line when clear, not only along paths)
const ADP={namas:[[118,207],[105,222],[200,254],[202,258],[200,264]]};
function artDoor(b){const t=ADP[b.t];if(!t||b.st=='site'||!b.lv)return null;if(b.adl===b.lv&&b.adx!=null)return{x:b.adx,y:b.ady};const d=spriteDims(b,b.lv);if(!d)return null;const[ix,iy]=t[b.lv-1],X=d.x+ix*d.w/d.im.width,Y=d.y+iy*d.h/d.im.height-TH*0.12;
 const u=(X-WW/2)/(TW/2),v=Y/(TH/2);b.adl=b.lv;b.adx=(u+v)/2;b.ady=(v-u)/2;return{x:b.adx,y:b.ady};}
function hidden(x,y,self){const[X,Y0]=wpos(x,y),Y=Y0-14;for(const q of S.b){if(q===self||!q.lv||q.st=='site')continue;const dep=q.s>=3?q.x+q.y+3:q.x+q.y+2*q.s-1.5;if(dep<=x+y)continue;const d=spriteDims(q,q.lv);if(!d)continue;if(X>d.x+d.w*0.12&&X<d.x+d.w*0.88&&Y>d.y+d.h*0.05&&Y<d.y+d.h*0.97)return true;}return false;}
function yardPt(b){for(let k=0;k<30;k++){const u=rnd(1.5,2.8),v=rnd(1.6,2.8);if(u+v>=3.4&&!hidden(b.x+u,b.y+v,b))return[b.x+u,b.y+v];}return null;}
function yardSpot(d,p){for(let k=0;k<25;k++){const r=rnd(1.5,5.5),a=R()*6.283,x=Math.round(d.x+Math.cos(a)*r),y=Math.round(d.y+Math.sin(a)*r);if(inM(x,y)&&walk(x,y)&&'gp'.includes(terr(x,y))&&!RD.has(idx(x,y))&&!(objAt[idx(x,y)]&&isTree(objAt[idx(x,y)]))&&!hidden(x+.5,y+.5,null))return[x,y];}return null;}
function lineOK(x0,y0,x1,y1){const l=Math.hypot(x1-x0,y1-y0),n=Math.ceil(l/0.3);if(l>8)return false;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(!walk(x|0,y|0))return false;}return true;}
function siteLim(s){return s.tot*sum(s.got)/Math.max(1,sum(s.need));}
function builderTask(p,b){const s0=b.site;if(s0&&s0.prog>=siteLim(s0)-1e-6&&!(s0.prog>=s0.tot-1e-6)){p.q=[toB(b),FN(o=>{face(o,b.x+b.s/2,b.y+b.s/2);}),WAIT(2,'laukia medžiagų')];p.act='laukia medžiagų';return;}
 p.q=[toB(b),FN(o=>{o.act='stato';face(o,b.x+b.s/2,b.y+b.s/2);}),WAIT(1,'stato'),FN(o=>{const bb=bId(o.role);if(!bb||!bb.site)return false;const s=bb.site;
 const frac=sum(s.got)/Math.max(1,sum(s.need));const lim=s.tot*frac;if(s.prog<lim){s.prog=Math.min(lim,s.prog+workMul(o));o.act='stato';}else o.act='laukia medžiagų';
 if(s.prog>=s.tot-1e-6&&frac>=1)finishSite(bb);})];p.act='stato';}
// v11: idle men help on construction sites that have materials waiting to be built in (max 2 helpers per site)
function helperTask(p){let best=null,bd=1e9;for(const b of S.b){if(!b.site||!siteOK(b))continue;const s=b.site;if(s.prog>=siteLim(s)-1.5)continue;if(S.p.filter(q=>q.help==b.id).length>=2)continue;const d=Math.hypot(b.x-p.x,b.y-p.y);if(d<bd&&d<45){bd=d;best=b;}}
 if(!best)return false;const b=best,R=reach(),ring=[];for(let i=-1;i<=b.s;i++)for(const[x,y]of[[b.x+i,b.y+b.s],[b.x+b.s,b.y+i],[b.x+i,b.y-1],[b.x-1,b.y+i]])if(inM(x,y)&&R[idx(x,y)])ring.push([x,y]);const sp=ring.length?ring[(p.id*3)%ring.length]:[door(b).x,door(b).y];
 p.help=b.id;const cyc=()=>[FN(o=>{o.act='stato';face(o,b.x+b.s/2,b.y+b.s/2);}),WAIT(1,'stato'),FN(o=>{const bb=bId(b.id);if(!bb||!bb.site){o.help=0;return false;}const s=bb.site,lim=siteLim(s);if(s.prog>=lim-1e-6){o.help=0;return false;}s.prog=Math.min(lim,s.prog+0.8*workMul(o));if(s.prog>=s.tot-1e-6&&lim>=s.tot-1e-6)finishSite(bb);})];
 p.q=[GO(sp[0],sp[1]),...cyc(),...cyc(),...cyc(),...cyc(),...cyc(),FN(o=>{o.help=0;})];p.act='padeda statyti';return true;}
function finishSite(b){const s=b.site;if(s.nt){b.t=s.nt;if(s.nt=='namas')b.cl=0;b.adl=null;}b.lv=s.to;b.st='ok';b.site=null;const ns=B[b.t].size[b.lv-1];if(ns!=b.s){markB(b,0);b.s=ns;markB(b,b.id);}markB(b,b.id);
 for(const p of S.p){if(p.role==b.id)p.role=0;if(p.help==b.id)p.help=0;}reveal(b.x+b.s/2,b.y+b.s/2,B[b.t].rev+b.lv);toast((b.lv>1?'Patobulinta: ':'Pastatyta: ')+B[b.t].lv[b.lv-1]);save();}
function carrierTask(p){
 for(const b of S.b){if(!b.site||!siteOK(b))continue;const s=b.site;for(const r of(s.need.k?['m','a','l','k']:['m','a','l'])){const want=(s.need[r]||0)-(s.got[r]||0)-(s.inb[r]||0);if(want<=0||avail(r)<1)continue;
  const st=srcFor(r,p.x,p.y,Math.min(want,4));if(!st)continue;const n=Math.min(want,p.sex=='m'?5:4,Math.floor(r=='m'&&st.t=='malkine'?st.mk:S.res[r]));if(n<1)continue;s.inb[r]=(s.inb[r]||0)+n;p.res={k:'inb',b:b.id,r,n};
  p.q=[toB(st),FN(o=>{const g=takeAt(st,r,n);if(!g)return false;o.carry={k:r,n:g,site:1};}),toB(b),FN(o=>{const bb=bId(b.id);release(o);if(bb&&bb.site&&o.carry){bb.site.got[r]=Math.min(bb.site.need[r],(bb.site.got[r]||0)+o.carry.n);}else if(o.carry)deposit(r,o.carry.n);o.carry=null;})];p.act='neša '+RN[r];return true;}}
 return false;}
function stoneNeed(){let n=0;for(const b of S.b)if(b.site)n+=b.site.need.a-b.site.got.a;return n;}
function stoneWant(){return Math.min(cap(),Math.max(40,stoneNeed()+10));}
function gatherWant(){if(!S.objs.some(o=>o.amt>0&&(o.k=='akmenys'||o.k=='uola')))return 0;const n=stoneNeed();if(n>S.res.a)return S.p.filter(p=>!p.ch&&p.sex=='m').length>3?2:1;return S.res.a<15?1:0;}
function stoneTask(p,force){if(S.res.a>=(force?cap():stoneWant()))return false;
 let best=null,bd=1e9;for(const o of S.objs){if(o.amt<=0||o.res||!(o.k=='akmenys'||o.k=='uola'))continue;if(p.badS&&p.badS.has(o.x+','+o.y))continue;const d=Math.hypot(o.x-p.x,o.y-p.y);if(d<bd){bd=d;best=o;}}
 if(!best||bd>(force?90:45))return false;
 if(p.stChk!==best){p.stChk=best;const sp0=beside(best);if(!astar(p.x,p.y,sp0[0],sp0[1])){(p.badS||(p.badS=new Set())).add(best.x+','+best.y);p.q=[WAIT(0.3,'ieško akmenų')];return true;}}
 best.res=1;p.res={k:'obj',o:best};
 const sp=beside(best);p.q=[GO(sp[0],sp[1]),FN(o=>{face(o,best.x+.5,best.y+.5);o.tgt=best;}),WAIT(6/workMul(p),'skaldo akmenį'),FN(o=>{o.tgt=null;release(o);best.amt-=3;o.carry={k:'a',n:3};if(best.amt<=0)removeObj(best);})];p.act='renka akmenis';return true;}
function removeObj(o){const i=S.objs.indexOf(o);if(i>=0)S.objs.splice(i,1);if(objAt[idx(o.x,o.y)]===o)objAt[idx(o.x,o.y)]=null;}
// v13: nomad era – jobless adults forage (women: berries & mushrooms) or hunt / bring branches (men; from era 3 they fell trees for logs)
function nomadTask(p){const st=nearest(stores(),p.x,p.y);if(!st)return false;const sd=door(st),m=workMul(p),c=cap();
 const back=(k)=>FN(o=>{const s=nearest(stores(),o.x,o.y);if(s)o.q.unshift(toB(s),FN(z=>{if(z.carry)deposit(z.carry.k,z.carry.n);z.carry=null;}));});
 const near=(f,r)=>{const L=[];for(const o of S.objs){if(o.res||o.grow||o.fallT||!f(o))continue;const dd=Math.hypot(o.x-sd.x,o.y-sd.y);if(dd<r)L.push([dd,o]);}L.sort((a,b)=>a[0]-b[0]);return L.length?L[Math.floor(R()*Math.min(6,L.length))][1]:(r<60?near(f,r*1.6):null);};
 if(p.sex=='f'){if(S.res.u>=c)return false;const o=near(q=>q.k=='krumas'||isTree(q),22);if(!o)return false;o.res=1;p.res={k:'obj',o};const sp=beside(o);
  p.q=[GO(sp[0],sp[1]),FN(z=>face(z,o.x+.5,o.y+.5)),WAIT(6/m,o.k=='krumas'?'renka uogas':'renka grybus'),FN(z=>{release(z);z.carry={k:'u',n:3};}),back()];p.act='renka uogas ir grybus';return true;}
 const hunt=(S.res.mesa<c*0.8)&&(R()<0.5||S.res.m>=c);
 if(hunt){let best=null,bd=1e9;for(const o of S.deer){if(o.res||o.dead||o.st)continue;const dd=Math.hypot(o.x-sd.x,o.y-sd.y);if(dd<bd&&dd<30){bd=dd;best=o;}}
  if(best){best.res=1;p.res={k:'deer',o:best};const hs=shootSpot(best,p);
   p.q=[GO(hs[0],hs[1]),FN(o=>{if(Math.hypot(best.x-o.x,best.y-o.y)>6){release(o);o.q=[];return;}best.st=1;best.mv=0;face(o,best.x,best.y);o.tgt=best;o.shot=S.t;}),WAIT(Math.max(2.4,3/m),'šaudo iš lanko'),FN(o=>{best.dead=S.t;o.tgt=null;}),WAIT(0.8,'medžioja'),GO(best.x,best.y),FN(o=>{release(o);const i=S.deer.indexOf(best);if(i>=0)S.deer.splice(i,1);o.carry={k:'mesa',n:3};deposit('k',1);o.en-=15;}),back()];p.act='medžioja';return true;}}
 if(S.res.m>=c)return false;
 const o=near(isTree,24);if(!o)return false;o.res=1;p.res={k:'obj',o};const sp=beside(o);
 if(S.era>=3){const cd=4/m;p.q=[GO(sp[0],sp[1]),FN(z=>{face(z,o.x+.5,o.y+.5);z.tgt=o;o.chop={t0:S.t,d:cd};o.ph=z.id*0.37;}),WAIT(cd,'kerta medį'),FN(z=>{o.chop=null;o.fallT=S.t;o.fdir=z.fl;}),WAIT(1.3,'medis krenta'),FN(z=>{z.tgt=null;release(z);o.fallT=null;o.k='kelmas';o.stump=DAY*2;o.s=0.6;z.carry={k:'m',n:5};z.en-=10;}),back()];p.act='kerta rąstus';return true;}
 p.q=[GO(sp[0],sp[1]),FN(z=>face(z,o.x+.5,o.y+.5)),WAIT(4/m,'renka šakas'),FN(z=>{release(z);z.carry={k:'m',n:2};}),back()];p.act='neša šakas';return true;}
// v13: simple nomad workplaces (goat pen, grain patch, flint workshop)
const NJ={aptvaras:{out:'mesa',n:3,t:14,act:'melžia ožkas'},javai:{out:'g',n:4,t:12,act:'pjauna javus'},titnagas:{out:null,t:10,act:'skaldo titnagą'}};
function nJob(p,b,J,m){const d=door(b);p.q=[GO(d.x,d.y),FN(o=>{face(o,b.x+1.5,b.y+1.5);o.tgt={x:b.x+1,y:b.y+1,ph:o.id*.37};}),WAIT(J.t/m,J.act),FN(o=>{o.tgt=null;if(J.out){o.carry={k:J.out,n:J.n};o.en-=8;}}),
 FN(o=>{const s=nearest(stores(),o.x,o.y);if(s&&o.carry)o.q.unshift(toB(s),FN(z=>{if(z.carry)deposit(z.carry.k,z.carry.n);z.carry=null;}));})];p.act=J.act;return true;}
function doJob(p,b){if(b.st=='demo')return false;const d=door(b),lvm=1+0.2*(b.lv-1),m=workMul(p)*lvm;p.en-=0;
 if(b.st=='site')return false;
 if(NJ[b.t])return nJob(p,b,NJ[b.t],m);
 if(b.t=='malkine'){
  if((b.mk||0)>=mkCap(b)){const ps=R()<.5&&plantSpot(b);if(ps){p.q=[GO(ps[0],ps[1]),WAIT(2.5,'sodina medį'),FN(o=>plantAt(ps))];p.act='sodina medį';}else{p.q=[toB(b),WAIT(6,'malkinė pilna',1)];p.act='malkinė pilna';}return true;}
  let best=null,bd=1e9;for(const o of S.objs){if(o.res||!isTree(o)||o.grow||o.fallT)continue;if(p.badT&&p.badT.has(o.x+','+o.y))continue;const dd=Math.hypot(o.x-d.x,o.y-d.y);if(dd<bd){bd=dd;best=o;}}
  if(!best){const ps=plantSpot(b);if(ps){p.q=[GO(ps[0],ps[1]),WAIT(2.5,'sodina medį'),FN(o=>plantAt(ps))];p.act='sodina medį';}else{p.q=[toB(b),WAIT(5,'nėra medžių',1)];p.act='nėra medžių';}return true;}
  if(!p.astarChk||p.astarChk!==best){p.astarChk=best;if(!astar(p.x,p.y,best.x,best.y)){(p.badT||(p.badT=new Set())).add(best.x+','+best.y);p.q=[WAIT(0.5,'ieško medžių')];return true;}}
  const far=bd>16+2*b.lv;
  best.res=1;p.res={k:'obj',o:best};const sp=beside(best),cd=(S.t<DAY*2?3.2:4)/m;
  p.q=[GO(sp[0],sp[1]),FN(o=>{face(o,best.x+.5,best.y+.5);o.tgt=best;best.chop={t0:S.t,d:cd};best.ph=o.id*0.37;}),WAIT(cd,'kerta medį'),FN(o=>{best.chop=null;best.fallT=S.t;best.fdir=o.fl;o.act='medis krenta';}),WAIT(1.3,'medis krenta'),FN(o=>{o.tgt=null;o.act='neša malkas';release(o);best.fallT=null;best.k='kelmas';best.stump=DAY*2;best.s=0.6;o.carry={k:'m',n:5+b.lv};o.en-=10;}),
   toB(b),FN(o=>{const bb=bId(b.id);if(o.carry){if(bb){bb.mk=Math.min(mkCap(bb),(bb.mk||0)+o.carry.n);}else deposit('m',o.carry.n);}o.carry=null;o.act='krauna malkas';}),WAIT(1.2,'krauna malkas į rietuvę'),
   FN(o=>{const bb=bId(b.id);if(!bb)return;const n=nearTrees(bb)<10?2:(R()<.6?1:0);const add=[];for(let i=0;i<n;i++){const ps=plantSpot(bb);if(ps)add.push(GO(ps[0],ps[1]),FN(q=>{face(q,ps[0]+.5,ps[1]+.5);}),WAIT(2.5,'sodina medį'),FN(q=>plantAt(ps)));}o.q.splice(0,0,...add);}),toB(b),WAIT(2,'ilsisi',1)];p.act=far?'eina toli kirsti':'kerta medžius';return true;}
 if(b.t=='medziotojas'||b.t=='kstovykla'){
  let best=null,bd=1e9;for(const o of S.deer){if(o.res)continue;if(o.dead||o.st)continue;const dd=Math.hypot(o.x-d.x,o.y-d.y);if(dd<bd){bd=dd;best=o;}}
  if(!best){p.q=[toB(b),WAIT(6,'nėra žvėrių',1)];p.act='nėra žvėrių';return true;}
  best.res=1;p.res={k:'deer',o:best};
  const hs=shootSpot(best,p);
  p.q=[GO(hs[0],hs[1]),FN(o=>{if(Math.hypot(best.x-o.x,best.y-o.y)>6){release(o);o.q=[];return;}best.st=1;best.mv=0;face(o,best.x,best.y);o.tgt=best;o.shot=S.t;}),WAIT(Math.max(2.4,3/m),'šaudo iš lanko'),FN(o=>{best.dead=S.t;o.tgt=null;}),WAIT(0.8,'medžioja'),GO(best.x,best.y),FN(o=>{release(o);const i=S.deer.indexOf(best);if(i>=0)S.deer.splice(i,1);o.carry={k:'mesa',n:3+b.lv};if(b.t=='kstovykla')deposit('k',1);o.en-=15;}),
   FN(o=>{const s=nearest(stores(),o.x,o.y);if(s)o.q.unshift(toB(s),FN(q=>{if(q.carry)deposit('mesa',q.carry.n);q.carry=null;}),toB(b),WAIT(2,'ilsisi',1));})];p.act='medžioja';return true;}
 if(b.t=='zvejas'||b.t=='zvejyba'){const w=b.fish||(b.fish=fishSpot(b));if(!w){p.q=[WAIT(5,'nėra vandens')];return true;}
  p.q=[GO(w.lx,w.ly),FN(o=>{face(o,w.x+.5,w.y+.5);o.tgt={x:w.x+.5,y:w.y+.5};o.cast=S.t;}),WAIT(9/m,'žvejoja'),FN(o=>{o.tgt=null;}),FN(o=>{o.carry={k:'zuvis',n:2+b.lv};o.en-=10;}),
   FN(o=>{const s=nearest(stores(),o.x,o.y);if(s)o.q.unshift(toB(s),FN(q=>{if(q.carry)deposit('zuvis',q.carry.n);q.carry=null;}),toB(b),WAIT(2,'ilsisi',1));})];p.act='žvejoja';return true;}
 if(PROC[b.t])return procJob(p,b,PROC[b.t],m);
 if(b.t=='skaldykla'){const r=b.rock||(b.rock=rockSpot(b));if(!r){p.q=[toB(b),WAIT(5,'nėra uolos',1)];return true;}
  p.q=[GO(r.lx,r.ly),FN(o=>{face(o,r.x+.5,r.y+.5);o.tgt={x:r.x,y:r.y,ph:o.id*.37};}),WAIT(7/m,'skaldo uolą'),FN(o=>{o.tgt=null;o.carry={k:'a',n:3+b.lv};o.en-=10;}),
   FN(o=>{const s=nearest(stores(),o.x,o.y);if(s)o.q.unshift(toB(s),FN(q=>{if(q.carry)deposit('a',q.carry.n);q.carry=null;}));})];p.act='skaldo uolą';return true;}
 if(b.t=='ukis')return farmJob(p,b,m);
 if(b.t=='gyvuliai')return herdJob(p,b,m);
 if(b.t=='zolininke'){const s=S.p.find(q=>q.sick&&!q.treat);
  if(!s){p.q=[toB(b),WAIT(4,'ruošia vaistažoles',1)];p.act='ruošia vaistažoles';return true;}
  s.treat=p.id;p.res={k:'heal',p:s.id};const sh=home(s);
  p.q=[sh?toB(sh):GO(s.x,s.y),WAIT((b.lv>=5?3:6)/m,'gydo',1),FN(o=>{release(o);const q=S.p.find(z=>z.id==s.id);if(q){q.sick=0;q.treat=0;toast(q.nm+' pasveiko 🌿');}}),toB(b),WAIT(2,'',1)];p.act='gydo';return true;}
 return false;}
function rockSpot(b){let best=null,bd=1e9;for(let y=b.y-3;y<b.y+b.s+3;y++)for(let x=b.x-3;x<b.x+b.s+3;x++){if(!inM(x,y)||!isMtn(x,y))continue;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const lx=x+dx,ly=y+dy;if(walk(lx,ly)){const d=Math.hypot(lx-b.x-b.s/2,ly-b.y-b.s/2);if(d<bd){bd=d;best={x,y,lx,ly};}}}}return best;}
function procJob(p,b,P,m){const miss=Object.keys(P.inp).filter(k=>avail(k)<P.inp[k]);
 if(miss.length){p.q=[toB(b),WAIT(5,'trūksta: '+miss.map(k=>RN[k]).join(', '),1)];p.act='trūksta: '+miss.map(k=>RN[k]).join(', ');return true;}
 const q=[];p.hold={};for(const k in P.inp){const n=P.inp[k];q.push(FN(o=>{const s=srcFor(k,o.x,o.y,n);if(!s)return false;o.q.unshift(toB(s),FN(z=>{const g=takeAt(s,k,n);if(g<n){if(g)deposit(k,g);return false;}z.hold[k]=g;z.carry={k,n:g};}));}));}
 const ok=Object.keys(P.out)[0];
 q.push(toB(b),FN(o=>{o.carry=null;}),WAIT(P.t/m,P.act,1),FN(o=>{o.hold=null;o.carry={k:ok,n:P.out[ok]+(b.lv>=4?1:0)};o.en-=8;}),
  FN(o=>{const s=nearest(stores(),o.x,o.y);if(s)o.q.unshift(toB(s),FN(z=>{if(z.carry)deposit(z.carry.k,z.carry.n);z.carry=null;}));}));
 p.q=q;p.act=P.act;return true;}
function fieldTiles(b){const o=[];for(let j=0;j<3;j++)for(let i=0;i<3;i++)if(i==2||j==2)o.push([b.x+i,b.y+j]);return o;}
function fieldSpot(b,k){const t=fieldTiles(b)[k%5];const c=[[t[0]+1,t[1]],[t[0],t[1]+1],[t[0]+1,t[1]+1],[t[0]-1,t[1]+1],[t[0]+1,t[1]-1]];for(const[x,y]of c)if(walk(x,y))return[x,y];const d=door(b);return[d.x,d.y];}
function farmJob(p,b,m){const f=b.f||(b.f={st:0,sow:0,g:0,cut:0});const W=S.p.filter(q=>q.job==b.id);const hasF=W.some(q=>q.sex=='f'),hasM=W.some(q=>q.sex=='m');
 const k=(p.id+Math.floor(S.t/9))%5,sp=fieldSpot(b,k),ft=fieldTiles(b)[k];
 if(f.st==0&&(p.sex=='f'||!hasF)){p.q=[GO(sp[0],sp[1]),FN(o=>{face(o,ft[0]+.5,ft[1]+.5);o.tgt={x:ft[0],y:ft[1]};}),WAIT(5/m,'sėja grūdus'),FN(o=>{o.tgt=null;const bb=bId(b.id);if(!bb||!bb.f||bb.f.st)return;bb.f.sow=Math.min(1,bb.f.sow+0.25);if(bb.f.sow>=1){bb.f.st=1;bb.f.g=0;}})];p.act='sėja grūdus';return true;}
 if(f.st==2&&(p.sex=='m'||!hasM)){p.q=[GO(sp[0],sp[1]),FN(o=>{face(o,ft[0]+.5,ft[1]+.5);o.tgt={x:ft[0],y:ft[1],ph:o.id*.37};}),WAIT(5/m,'pjauna javus'),FN(o=>{o.tgt=null;const bb=bId(b.id);if(!bb||!bb.f||bb.f.st!=2)return;bb.f.cut=Math.min(1,bb.f.cut+0.25);const n=Math.round((10+5*bb.lv)/4);o.carry={k:'g',n};if(bb.f.cut>=1){bb.f.st=0;bb.f.sow=0;bb.f.cut=0;bb.f.g=0;}}),
  FN(o=>{const s=nearest(stores(),o.x,o.y);if(s&&o.carry)o.q.unshift(toB(s),FN(z=>{if(z.carry)deposit('g',z.carry.n);z.carry=null;}));})];p.act='pjauna javus';return true;}
 const l=f.st==1?'laukia, kol užaugs javai':p.sex=='m'?'laukia, kol moterys pasės':'laukia pjūties';p.q=[toB(b),WAIT(5,l,1)];p.act=l;return true;}
function herdN(b){const h=b.herd||(b.herd={c:2,s:3});return h.c+h.s;}
function herdCap(b){return 4+2*b.lv;}
// v11: wool cap – brief said both "10 + 4*(houses lv>=3)" and "max(10, 4*count)"; using max(10, 4 × houses at level ≥3)
function woolCap(){return Math.max(10,4*S.b.filter(b=>b.t=='namas'&&b.lv>=3).length);}
function woolFull(){return (S.res.v||0)>=woolCap();}
function herdJob(p,b,m){const h=b.herd||(b.herd={c:2,s:3});const W=S.p.filter(q=>q.job==b.id);const hasF=W.some(q=>q.sex=='f');const ft=fieldTiles(b)[(p.id+Math.floor(S.t/7))%5],sp=fieldSpot(b,(p.id+Math.floor(S.t/7))%5);
 if(p.sex=='f'||!hasF){const wf=woolFull();if(wf&&herdN(b)>=herdCap(b)&&p.sex=='f')return false;if(!wf&&(b.vb||0)>=4){const n=Math.floor(b.vb);p.q=[toB(b),FN(o=>{const bb=bId(b.id);if(!bb)return false;const g=Math.floor(bb.vb||0);bb.vb-=g;o.carry={k:'v',n:g};}),FN(o=>{const s=nearest(stores(),o.x,o.y);if(s)o.q.unshift(toB(s),FN(z=>{if(z.carry)deposit('v',z.carry.n);z.carry=null;}));})];p.act='neša vilną';return true;}
  p.q=[GO(sp[0],sp[1]),FN(o=>{face(o,ft[0]+.5,ft[1]+.5);}),WAIT(7/m,'šeria gyvulius'),FN(o=>{const bb=bId(b.id);if(!bb)return;const hh=bb.herd;if(!woolFull())bb.vb=(bb.vb||0)+Math.max(hh.s?1:0,Math.floor(hh.s/2));if(herdN(bb)<herdCap(bb)&&R()<0.3){if(R()<.55)hh.s++;else hh.c++;bb.an=null;}})];p.act='šeria gyvulius';return true;}
 const min=3+b.lv;if(herdN(b)>min){p.q=[toB(b),FN(o=>{const bb=bId(b.id);if(!bb)return false;const hh=bb.herd;if(herdN(bb)<=3+bb.lv)return false;let n;if(woolFull()?(hh.s<=1&&hh.c>1):(hh.c>2&&(hh.c>=hh.s/2||hh.s<=2))){hh.c--;n=8;}else{hh.s--;n=4;}bb.an=null;o.meat=n;}),WAIT(6/m,'skerdžia gyvulį tvarte',1),FN(o=>{o.carry={k:'mesa',n:o.meat||4};o.meat=0;}),
  FN(o=>{const s=nearest(stores(),o.x,o.y);if(s&&o.carry)o.q.unshift(toB(s),FN(z=>{if(z.carry)deposit('mesa',z.carry.n);z.carry=null;}));})];p.act='skerdžia gyvulį tvarte';return true;}
 p.q=[toB(b),WAIT(6,'tvarko tvartą',1)];p.act='tvarko tvartą';return true;}
function isTree(o){return o.k=='pusis'||o.k=='pusys'||o.k=='azuolas'||o.k=='berzas';}
function nearTrees(b){const d=door(b),RR=16+2*b.lv;let n=0;for(const o of S.objs)if(isTree(o)&&Math.hypot(o.x-d.x,o.y-d.y)<RR)n++;return n;}
function plantSpot(b){const d=door(b);for(let k=0;k<40;k++){const r=rnd(2.5,7+b.lv),a=R()*6.283,x=Math.round(d.x+Math.cos(a)*r),y=Math.round(d.y+Math.sin(a)*r);if(inM(x,y)&&walk(x,y)&&!objAt[idx(x,y)]&&!RD.has(idx(x,y))&&'gpf'.includes(terr(x,y))&&!BR.has(idx(x,y))&&!inReserve(x,y)&&!S.p.some(q=>(q.x|0)==x&&(q.y|0)==y))return[x,y];}return null;}
function plantAt(ps){const[x,y]=ps;if(!inM(x,y)||objAt[idx(x,y)]||occ[idx(x,y)]||RD.has(idx(x,y)))return;const o={x,y,k:pick(['pusis','berzas','azuolas','pusis']),s:0.85+R()*0.3,amt:0,grow:DAY*1.5};S.objs.push(o);objAt[idx(x,y)]=o;}
function plant(b){const d=door(b);for(let k=0;k<20;k++){const x=d.x+Math.round(rnd(-6,6)),y=d.y+Math.round(rnd(-6,6));if(inM(x,y)&&walk(x,y)&&!objAt[idx(x,y)]&&!RD.has(idx(x,y))&&'gpf'.includes(terr(x,y))&&Math.hypot(x-d.x,y-d.y)>2){const o={x,y,k:pick(['pusis','berzas','azuolas']),s:1,amt:0,grow:DAY*2};S.objs.push(o);objAt[idx(x,y)]=o;return;}}}
function fishSpot(b){let best=null,bd=1e9;for(let y=b.y-5;y<b.y+b.s+5;y++)for(let x=b.x-5;x<b.x+b.s+5;x++){if(!inM(x,y)||terr(x,y)!='w'||BR.has(idx(x,y)))continue;
 for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const lx=x+dx,ly=y+dy;if(walk(lx,ly)){const d=Math.hypot(lx-b.x-b.s/2,ly-b.y-b.s/2);if(d<bd){bd=d;best={x,y,lx,ly};}}}}return best;}
// ---------- jobs assignment ----------
function sxOf(t){return B[t].sx||(t=='zolininke'?'any':'m');}
function slots(){const out=[];for(const c of S.prio){
 if(c=='statyba'){for(const b of S.b)if(b.site&&siteOK(b)&&!S.p.some(p=>p.role==b.id))out.push({c,b,builder:1,sx:'m'});}
 else{for(const b of S.b){const d=B[b.t];if(d.cat!=c||b.st=='site'||!b.lv||b.st=='demo')continue;const W=S.p.filter(p=>p.job==b.id),n=d.wk[b.lv-1];const sx=sxOf(b.t);
  if(sx=='mf'){const nf=Math.ceil(n/2),nm=n-nf;for(let i=W.filter(p=>p.sex=='f').length;i<nf;i++)out.push({c,b,sx:'f'});for(let i=W.filter(p=>p.sex=='m').length;i<nm;i++)out.push({c,b,sx:'m'});}
  else for(let i=W.length;i<n;i++)out.push({c,b,sx});}
  if(c=='akmuo'){const g=gatherWant()-S.p.filter(p=>p.sg).length;const ref=nearest(stores(),44,44)||{x:44,y:44};for(let i=0;i<g;i++)out.push({c,b:ref,gather:1,sx:'m'});}}}return out;}
function catOf(p){if(p.role)return 'statyba';if(p.sg)return 'akmuo';const j=bId(p.job);return j?B[j.t].cat:null;}
function assign(){
 for(const p of S.p){if(p.job&&!bId(p.job))p.job=0;if(p.role&&!(bId(p.role)||{}).site)p.role=0;
  if(p.job&&p.sick){const jb=bId(p.job);if(jb&&jb.t=='zolininke')p.herbSelf=1;p.job=0;}
  if(p.job){const b=bId(p.job);const n=S.p.filter(q=>q.job==b.id);if(n.length>B[b.t].wk[b.lv-1]&&n[n.length-1]==p)p.job=0;}
  if(p.sg&&(p.job||p.role||p.ch||p.sick))p.sg=0;}
 {const gw=gatherWant();let sg=S.p.filter(p=>p.sg);while(sg.length>gw){const z=sg.pop();if(!z.res)z.sg=0;else break;}}
 for(const sl of slots()){
  const ok=p=>!p.ch&&!p.sick&&(sl.sx=='any'||p.sex==sl.sx);
  let free=S.p.filter(p=>ok(p)&&!p.job&&!p.role&&!p.dem&&!p.sg);
  if(sl.b.t=='zolininke'){const f=free.filter(p=>p.sex=='f');if(f.length)free=f;}
  let cand=free.sort((a,b)=>Math.hypot(a.x-sl.b.x,a.y-sl.b.y)-Math.hypot(b.x-sl.b.x,b.y-sl.b.y))[0];
  if(!cand){const pi=S.prio.indexOf(sl.c);let bestPi=pi;for(const p of S.p){if(!ok(p))continue;const c=catOf(p);if(!c)continue;const ci=S.prio.indexOf(c);if(ci>bestPi){bestPi=ci;cand=p;}}
   if(cand){if(cand.role&&cand.role!=sl.b.id)cand.role=0;cand.job=0;cand.sg=0;}}
  if(!cand)continue;
  if(sl.builder)cand.role=sl.b.id;else if(sl.gather)cand.sg=1;else cand.job=sl.b.id;
  if(!cand.carry&&!cand.res&&!cand.fire){const a=cand.q[0];if(!a||a.a=='w'&&!a.inside)cand.q=[];}
 }}
// ---------- world tick ----------
let acc1=0,acc2=0;
function tick(dt){S.t+=dt;
 for(const b of S.b){if(b.t=='ukis'&&b.lv&&b.f&&b.f.st==1){b.f.g+=dt/(DAY*0.55)*(1+0.1*(b.lv-1));if(b.f.g>=1){b.f.g=1;b.f.st=2;}}}
 for(const p of S.p)stepP(p,dt);
 // houses
 for(const b of S.b){if(!isH(b.t)||b.st=='site'&&!b.lv)continue;b.wood=Math.max(0,b.wood-dt/DAY*(1+0.25*(b.lv-1)));
  if(b.lv>=3&&b.cl>0&&S.p.some(p=>p.home==b.id))b.cl=Math.max(0,b.cl-dt/DAY*0.5);
  if(b.fire>0){b.fire=Math.min(100,b.fire+dt*0.5);b.burn+=dt*b.fire/100*0.6;if(b.burn>=100)burnDown(b);}}
 // objects
 for(const o of S.objs){if(o.stump!=null){o.stump-=dt;if(o.stump<=0)removeObj(o);}if(o.grow){o.grow=Math.max(0,o.grow-dt);if(RD.has(idx(o.x,o.y))&&isTree(o)){removeObj(o);}}}
 deerTick(dt);
 acc1+=dt;if(acc1>=1){acc1=0;perSec();}
}
function perSec(){assign();fireDispatch();demoDispatch();
 if(S.t%5<1)for(const b of S.b){if(b.t!='malkine'||!b.lv)continue;const n=nearTrees(b);const low=n<14;if(low&&!b.lowW){toast('🌲 Aplink malkinę baigiasi miškas – medkirčiai sodins naujus medžius');}b.lowW=low;b.nt=n;}
 const day=Math.floor(S.t/DAY);
 for(const b of S.b){if(!isH(b.t)||!b.lv||b.st=='demo')continue;hapCalc(b);
  const res=S.p.filter(p=>p.home==b.id);const cap_=hcap(b);
  if(res.length<cap_&&res.some(p=>p.sex=='m'&&!p.ch)&&res.some(p=>p.sex=='f'&&!p.ch)&&meals(b)>=1&&b.hap>=45&&(b.lastBirth??-9)<day-0&&R()<0.5/DAY*1.0*3){b.lastBirth=day;const k=spawnP(R()<.5?'m':'f',true,b);toast('Gimė vaikas – '+k.nm+' 👶');}
  if(day>=3&&!S.b.some(q=>q.fire>0)&&b.st=='ok'&&R()<(b.hap>70?0.008:0.016)/DAY*S.b.filter(q=>q.t=='namas').length/Math.max(1,S.b.filter(q=>q.t=='namas').length)){b.fire=30;b.burn=0;toast('🔥 Gaisras! Dega '+B[b.t].lv[b.lv-1].toLowerCase()+'!');}}
 for(const p of S.p){if(p.ch&&p.age>=4){p.ch=false;toast(p.nm+' užaugo ir gali dirbti!');}
  if(!p.sick&&S.t>DAY*1.5){const h=home(p);const hp=h?h.hap:50;if(R()<(hp>70?0.02:hp<40?0.06:0.035)/DAY){p.sick=DAY*1.2;p.treat=0;if(!p.fire)abort(p);p.q=[];toast(p.nm+' susirgo 🤒');}}}
 // homeless families first get any free bed
 const hl=S.p.filter(p=>!p.home);let rehomed=0;
 if(hl.length){const fam=[...hl.filter(p=>!p.ch),...hl.filter(p=>p.ch)];for(const p of fam){const h=S.b.filter(q=>isH(q.t)&&q.lv&&q.st!='demo'&&q.st!='site'&&S.p.filter(z=>z.home==q.id).length<hcap(q)).sort((a,b)=>S.p.filter(z=>z.home==a.id).length-S.p.filter(z=>z.home==b.id).length)[0];if(!h)break;p.home=h.id;rehomed++;}
  if(rehomed)toast(`🏠 Benamiai (${rehomed}) gavo vietą name`);}
 // newcomers only when nobody is homeless
 S.newT+=1;const empty=S.b.find(b=>isH(b.t)&&b.lv&&b.st!='demo'&&!S.p.some(p=>p.home==b.id));
 if(empty&&!S.p.some(p=>!p.home)&&food()>=6&&S.newT>15){S.newT=0;const st=stores()[0];let sx=48,sy=56;if(st){sx=Math.min(N-2,st.x+12);sy=Math.min(N-2,st.y+12);}
  for(let r=0;r<6&&!walk(sx,sy);r++){sx--;sy--;}spawnP('m',false,empty,sx,sy);spawnP('f',false,empty,sx+1,sy);toast('Atsikraustė nauja šeima! 👨‍👩');}
 if(S.t%10<1){for(let i=0;i<S.wear.length;i++)if(S.wear[i]>0)S.wear[i]*=0.997;wearDirty=true;}
 if(S.era<5)eraSec();
 if(S.t%8<1)save();}
function eraReq(e){const q=ERA[e],o=[];const pop=S.p.length;if(q.p)o.push({ic:'👪',l:'žmonių',h:pop,n:q.p});if(q.f)o.push({ic:'🍖',l:'maisto',h:food(),n:q.f});if(q.m)o.push({ic:'🪵',l:'rąstų',h:woodTot(),n:q.m});if(q.g)o.push({ic:'🌾',l:'grūdų',h:S.res.g,n:q.g});return o;}
function eraSec(){S.tools=S.b.some(b=>b.t=='titnagas'&&b.lv&&S.p.some(p=>p.job==b.id));
 if(S.t%10<1&&!S.b.some(b=>b.t=='dziovykla'&&b.lv))for(const k of['mesa','zuvis','u'])if(S.res[k]>3)S.res[k]*=0.99;
 if(eraReq(S.era).every(r=>r.h>=r.n)){S.era++;if(S.era>=5){S.tools=false;for(const b of S.b)if(b.t=='zemine'&&b.lv&&b.st=='ok'){b.t='namas';b.cl=0;b.adl=null;b.wood=Math.max(b.wood,1);}toast('⭐ 5 lygis – Kaimas! Žeminės virsta rąstiniais namais, atsirado sandėlis.');}else toast('⭐ Naujas lygis '+S.era+' – '+ERA[S.era].nm+'! Atsirado naujų pastatų.');buildMenu();save();}}
function tod(){return ((S.t+DAY*0.3)%DAY)/DAY;}
function darkness(){const t=tod();if(t<0.6)return 0;if(t<0.72)return (t-0.6)/0.12;if(t<0.92)return 1;return 1-(t-0.92)/0.08;}
function isNight(){const t=tod();return t>=0.7&&t<0.93;}
function untilDawn(){return Math.max(2,(0.95-tod())*DAY);}
function reserveOf(b){return b.s;}
function inReserve(X,Y,skip){return null;}
// v11: cancel an unfinished construction / upgrade – all delivered materials go back to the store
function cancelSite(b){const s=b.site;if(!s)return;if(s.got.k)deposit('k',s.got.k);for(const p of S.p){if(p.role==b.id)p.role=0;if(p.help==b.id){p.help=0;abort(p);}if(p.res&&p.res.k=='inb'&&p.res.b==b.id)abort(p);}
 const g=s.got;if(g.m)deposit('m',g.m);if(g.a)deposit('a',g.a);if(g.l)deposit('l',g.l);
 if(b.lv>0){b.site=null;b.st='ok';toast('Tobulinimas atšauktas – grąžinta '+costTxt(g));}
 else{const i=S.b.indexOf(b);if(i>=0)S.b.splice(i,1);markB(b,0);rebuildGrids();for(const p of S.p){if(p.home==b.id){p.home=0;}if(p.job==b.id)p.job=0;}if(sel==b.id)closePop();toast('Statyba atšaukta'+(sum(g)?' – grąžinta '+costTxt(g):''));}
 save();}
function demolish(b){if((b.t=='sandelis'||b.t=='lauzas')&&stores().length<=1){toast(b.t=='lauzas'?'Negalima užgesinti vienintelio laužo':'Negalima griauti vienintelio sandėlio');return;}b.demo=6+4*Math.max(1,b.lv);b.st='demo';b.site=null;for(const p of S.p){if(p.job==b.id){p.job=0;abort(p);}if(p.role==b.id)p.role=0;}toast('Griovimas pradėtas – gyventojai išardys pastatą');save();}
function finishDemo(b){let m=0,a=0,lt=0;for(let l=0;l<Math.max(1,b.lv);l++){const c=B[b.t].cost[l];m+=c.m||0;a+=c.a||0;lt+=c.l||0;}m=Math.floor(m/2)+Math.floor(b.mk||0);a=Math.floor(a/2);lt=Math.floor(lt/2);if(lt)deposit('l',lt);if(b.vb)deposit('v',Math.floor(b.vb));
 const i=S.b.indexOf(b);if(i>=0)S.b.splice(i,1);markB(b,0);rebuildGrids();
 deposit('m',m);deposit('a',a);
 for(const p of S.p){if(p.dem==b.id){p.dem=0;p.q=[];p.path=null;}if(p.job==b.id)p.job=0;}
 const ev=S.p.filter(p=>p.home==b.id);let homeless=0;
 for(const p of ev){const h=S.b.find(q=>isH(q.t)&&q.lv&&q.st!='demo'&&S.p.filter(z=>z.home==q.id).length<hcap(q));if(h){p.home=h.id;}else{p.home=0;homeless++;}p.q=[];p.path=null;p.in=0;}
 if(sel==b.id)closePop();
 toast(`Pastatas nugriautas: grąžinta 🪵${m}${a?' 🪨'+a:''}`+(ev.length?(homeless?` · ${homeless} gyv. liko be namų`:' · gyventojai persikėlė'):''));save();}
function demoDispatch(){for(const b of S.b){if(b.st!='demo')continue;const cur=S.p.filter(p=>p.dem==b.id).length;if(cur>=2)continue;
 const c=S.p.filter(p=>!p.ch&&!p.sick&&!p.fire&&!p.dem&&!p.carry&&!p.res).sort((x,y)=>(x.job?1:0)-(y.job?1:0)||Math.hypot(x.x-b.x,x.y-b.y)-Math.hypot(y.x-b.x,y.y-b.y)).slice(0,2-cur);
 for(const p of c){abort(p);p.dem=b.id;p.in=0;}}
 for(const p of S.p)if(p.dem&&!bId(p.dem))p.dem=0;}
function meals(h){return (h.pan||0)+(h.dry||0);}
function eat(o){const hh=home(o);if(hh&&hh.pan>=1){hh.pan-=1;o.hu=0;}else if(hh&&hh.dry>=1){hh.dry-=1;o.hu=40;}else o.hu=Math.min(o.hu,85);}
function face(p,x,y){const sx=(x-p.x)-(y-p.y),sy=(x-p.x)+(y-p.y);if(Math.abs(sx)>0.01)p.fl=sx>0?1:-1;if(Math.abs(sy)>0.01)p.bk=sy<0?1:0;}
function beside(o){const c=[[o.x+1,o.y],[o.x,o.y+1],[o.x+1,o.y+1],[o.x-1,o.y],[o.x,o.y-1]];for(const[x,y]of c)if(inM(x,y)&&walk(x,y)&&!(objAt[idx(x,y)]&&isTree(objAt[idx(x,y)])))return[x,y];return[o.x,o.y];}
function shootSpot(d,p){const dx=p.x-d.x,dy=p.y-d.y,l=Math.hypot(dx,dy)||1;for(const k of[3.5,3,2.5,2]){const x=Math.floor(d.x+dx/l*k),y=Math.floor(d.y+dy/l*k);if(inM(x,y)&&walk(x,y))return[x,y];}return[Math.floor(d.x),Math.floor(d.y)];}
function hapCalc(b){let h=0;if(b.pan>=1)h+=30;else if(b.dry>=1)h+=18;else if(food()>=1)h+=10;if((b.water||0)>=1)h+=5;if(b.wood>0)h+=25;h+=(b.lv-1)*5;
 const c={x:b.x+b.s/2,y:b.y+b.s/2};b.well=S.b.some(w=>w.t=='sulinys'&&w.lv&&Math.hypot(w.x+.5-c.x,w.y+.5-c.y)<=B.sulinys.rad[w.lv-1]);if(b.well)h+=15;
 b.herb=S.b.some(w=>w.t=='zolininke'&&w.lv&&Math.hypot(w.x+1-c.x,w.y+1-c.y)<=14);if(b.herb)h+=10;if(B[b.t].k)h+=15;if(b.lv>=3)h+=(b.cl>0?8:-15);b.hap=Math.min(100,h+10);}
function burnDown(b){b.fire=0;b.burn=0;b.pan=0;b.wood=0;toast('Namas sudegė…');
 if(b.lv>1){const old=b.s;b.lv--;b.site=null;b.st='ok';const ns=B[b.t].size[b.lv-1];if(ns!=old){markB(b,0);b.s=ns;markB(b,b.id);}}
 else{b.lv=0;b.st='site';b.site=mkSite(b.t,0);}}
function fireDispatch(){const f=S.b.find(b=>b.fire>0);if(!f){for(const p of S.p)if(p.fire){p.fire=0;p.bucket=0;p.q=[];}return;}
 const cnt=S.p.filter(p=>p.fire).length;if(cnt>=6)return;
 const c=S.p.filter(p=>!p.ch&&!p.sick&&!p.fire).sort((a,b)=>Math.hypot(a.x-f.x,a.y-f.y)-Math.hypot(b.x-f.x,b.y-f.y)).slice(0,6-cnt);
 for(const p of c){release(p);p.fire=f.id;p.q=fireLoop(p);p.path=null;}}
function waterSrc(p){const w=nearest(S.b.filter(b=>b.t=='sulinys'&&b.lv),p.x,p.y);if(w)return{go:toB(w),t:2.2-0.3*(w.lv-1)};
 let best=null,bd=1e9;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(terr(x,y)=='w'&&!BR.has(idx(x,y))){const d=Math.hypot(x-p.x,y-p.y);if(d<bd){bd=d;best=[x,y];}}return best?{go:GO(best[0],best[1]),t:3}:null;}
function fireLoop(p){const ws=waterSrc(p),f=bId(p.fire);if(!ws||!f)return[WAIT(1)];
 return[ws.go,WAIT(ws.t,'semia vandenį'),FN(o=>{o.bucket=1;}),toB(f),WAIT(0.8,'gesina'),FN(o=>{o.bucket=0;const b=bId(o.fire);if(b&&b.fire>0){b.fire-=18;if(b.fire<=0){b.fire=0;toast('Gaisras užgesintas! 💧');}}
  const bb=S.b.find(x=>x.fire>0);if(bb){o.fire=bb.id;o.q.push(...fireLoop(o));}else{o.fire=0;}})];}
function deerTick(dt){
 const alive=S.deer.filter(d=>!d.dead).length;if(alive<16&&R()<dt/(alive<6?6:20)){for(let k=0;k<60;k++){const x=(R()*N)|0,y=(R()*N)|0;const edge=objAt[idx(x,y)]&&isTree(objAt[idx(x,y)])||[[1,0],[-1,0],[0,1],[0,-1]].some(([a,c])=>{const o=inM(x+a,y+c)&&objAt[idx(x+a,y+c)];return o&&isTree(o);});if('fgp'.includes(terr(x,y))&&(edge||k>45)&&walk(x,y)&&!S.b.some(b=>Math.hypot(b.x-x,b.y-y)<6)){S.deer.push({x:x+.5,y:y+.5,tx:x+.5,ty:y+.5,w:0,fl:1});break;}}}
 for(const d of S.deer){if(d.st)continue;d.w-=dt;if(d.w<=0){const tx=d.x+rnd(-3,3),ty=d.y+rnd(-3,3);if(inM(tx|0,ty|0)&&walk(tx|0,ty|0)&&'fg'.includes(terr(tx|0,ty|0))){d.tx=tx;d.ty=ty;}d.w=rnd(4,10);}
  const dx=d.tx-d.x,dy=d.ty-d.y,l=Math.hypot(dx,dy);if(l>0.05){const s=Math.min(l,0.6*dt);d.x+=dx/l*s;d.y+=dy/l*s;if(Math.abs(dx-dy)>.01)d.fl=dx-dy>0?1:-1;if(Math.abs(dx+dy)>.01)d.bk=dx+dy<0?1:0;d.mv=1;}else d.mv=0;}}
// ---------- placement ----------
// v9: trees on a new plot are cleared automatically (anyone working on them is released)
function clearPlot(t,x,y){const s=B[t].size[0];for(let i=0;i<s;i++)for(let j=0;j<s;j++){const o=objAt[idx(x+i,y+j)];if(o&&o.k!='uola'){for(const p of S.p)if(p.tgt===o||(p.tgt&&p.tgt.x===o.x&&p.tgt.y===o.y))abort(p);removeObj(o);}}}
function canPlace(t,x,y){const s=B[t].size[0];let water=false;
 for(let i=0;i<s;i++)for(let j=0;j<s;j++){const X=x+i,Y=y+j;if(!inM(X,Y))return 'Už žemėlapio ribų';if(!S.fog[idx(X,Y)])return 'Ši vieta dar neatrasta';
  const te=terr(X,Y);if(te=='w')return 'Trukdo vanduo';if(te=='u'||te=='c')return 'Trukdo kalnas';if(occ[idx(X,Y)])return 'Trukdo kitas pastatas';const o=objAt[idx(X,Y)];if(o&&o.k=='uola')return 'Trukdo didelė uola';if(BR.has(idx(X,Y)))return 'Trukdo tiltas';if(inReserve(X,Y))return 'Ši vieta rezervuota namo plėtrai';}
 {const R0=reach();const fp=[];for(let i=0;i<s;i++)for(let j=0;j<s;j++){const k=idx(x+i,y+j);fp.push([k,occ[k]]);occ[k]=-1;}RCH=null;const R=reach();const okNew=reachB({x,y,s},R);const blk=S.b.find(b=>b.st!='demo'&&reachB(b,R0)&&!reachB(b,R));let lost=0;for(let k=0;k<N*N;k++)if(R0[k]&&!R[k])lost++;for(const[k,v]of fp)occ[k]=v;RCH=null;
  if(!okNew)return 'Statybininkai čia neprieitų';if(blk)return 'Užtvertų kelią į '+B[blk.t].n.toLowerCase();if(lost>s*s+12)return 'Užtvertų praėjimą (pvz. tiltą) – dalis žemės taptų nepasiekiama';}
 if(B[t].mtn){let k=0;for(let i=0;i<s;i++)for(const[X,Y]of[[x+i,y-1],[x+i,y+s],[x-1,y+i],[x+s,y+i]])if(inM(X,Y)&&isMtn(X,Y))k++;if(k<1)return 'Skaldykla turi stovėti prie pat kalno ar uolos';}
 if(B[t].water){if(t=='zvejyba'){let ok=0;for(let i=-1;i<=s;i++)for(let j=-1;j<=s;j++){const X=x+i,Y=y+j;if(inM(X,Y)&&terr(X,Y)=='w')ok=1;}if(!ok)return 'Žvejybos vieta turi būti prie vandens';water=true;}else for(let i=-1;i<=s;i++)for(let j=-1;j<=s;j++){const X=x+i,Y=y+j;if(inM(X,Y)&&terr(X,Y)=='w')water=true;}if(!water)return 'Žvejo trobelė turi būti prie vandens';}
 return '';}
function canUpgrade(b){const d=B[b.t];if(d.k){if(!d.nx)return 'Jau aukščiausias lygis';const ne=B[d.nx].era||5;if((S.era||5)<ne)return 'Reikia '+ne+' lygio';if(b.st!='ok')return 'Jau tobulinama';return '';}if(b.lv>=5)return 'Jau aukščiausias lygis';if(b.st!='ok')return 'Jau tobulinama';if(b.fire)return 'Dega!';
 const ns=B[b.t].size[b.lv];if(ns>b.s){for(let i=0;i<ns;i++)for(let j=0;j<ns;j++){const X=b.x+i,Y=b.y+j;if(i<b.s&&j<b.s)continue;if(!inM(X,Y)||'wuc'.includes(terr(X,Y))||occ[idx(X,Y)]||objAt[idx(X,Y)]||BR.has(idx(X,Y)))return 'Trūksta vietos: reikia laisvo 3×3 sklypo (į dešinę ir žemyn)';}}return '';}
function upgrade(b){const e=canUpgrade(b);if(e){toast(e);return;}if(B[b.t].k){b.site=mkSite(B[b.t].nx,0);b.site.nt=B[b.t].nx;b.st='upg';toast('Perstatymas pradėtas – gyventojai patys atneš medžiagas');save();return;}const ns=B[b.t].size[b.lv];b.site=mkSite(b.t,b.lv);b.st='upg';if(ns>b.s){b.s=ns;markB(b,b.id);}toast('Tobulinimas pradėtas – gyventojai patys atneš medžiagas');save();}
// ---------- save ----------
function save(){try{const o={...S,wear:null,fog:null,p:S.p.map(p=>({...p,q:[],path:null,res:null,fire:0,bucket:0,treat:0,badT:null,astarChk:null,badS:null,stChk:null,tgt:null,role:p.role})),b:S.b.map(b=>({...b,door:null,fish:null,rock:null,an:null,site:b.site?{...b.site,inb:b.site.need.k?{m:0,a:0,l:0,k:0}:{m:0,a:0,l:0}}:null})),deer:S.deer.map(d=>({...d,res:0,st:0})),objs:S.objs.map(o=>({...o,res:0}))};
 const w=[];for(let i=0;i<S.wear.length;i++)if(S.wear[i]>0.5)w.push(i,Math.round(S.wear[i]));o.w=w;let f='';for(let i=0;i<S.fog.length;i++)f+=S.fog[i];o.f=f;o.cam=cam;
 localStorage.setItem('miestas_save',JSON.stringify(o));}catch(e){}}
function load(){try{const s=localStorage.getItem('miestas_save');if(!s)return false;const o=JSON.parse(s);if(o.v!==VER)return false;
 o.wear=new Float32Array(4*N*N);for(let i=0;i<o.w.length;i+=2)o.wear[o.w[i]]=o.w[i+1];o.fog=new Uint8Array(N*N);for(let i=0;i<N*N;i++)o.fog[i]=o.f.charCodeAt(i)==49?1:0;delete o.w;delete o.f;
 // v5 migration
 o.res={...RES0,...o.res};if(o.era==null)o.era=5;if(!o.prio.includes('akmuo'))o.prio.splice(Math.min(2,o.prio.length),0,'akmuo');o.roads=o.roads||[];
 for(const b of o.b){if(b.t=='malkine'&&b.mk==null)b.mk=0;if(b.t=='namas'&&b.cl==null)b.cl=0;if(b.site){for(const k of['need','got','inb'])b.site[k]={m:0,a:0,l:0,...b.site[k]};}}
 for(const p of o.p){if(p.hold){for(const k in p.hold)o.res[k]=(o.res[k]||0)+p.hold[k];p.hold=null;}}
 S=o;RD=new Set(o.roads);S.objs=S.objs.filter(q=>!(isTree(q)&&RD.has(idx(q.x,q.y))));rebuildGrids();grow3();if(o.cam)cam=o.cam;return true;}catch(e){console.warn(e);return false;}}
// ---------- camera & render ----------
let W=0,H=0,DPR=1,cam={x:0,y:0,z:0.45};
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';}
const wpos=(x,y)=>[(x-y)*TW/2+WW/2,(x+y)*TH/2];
function s2w(sx,sy){return[(sx-W/2)/cam.z+cam.x,(sy-H/2)/cam.z+cam.y];}
function w2t(X,Y){const a=(X-WW/2)/(TW/2),b=Y/(TH/2);return[(a+b)/2,(b-a)/2];}
function clampCam(){cam.z=Math.max(0.2,Math.min(1.3,cam.z));cam.x=Math.max(0,Math.min(WW,cam.x));cam.y=Math.max(0,Math.min(HH,cam.y));}
const CH={};let chLoaded=[];
function chunk(cx,cy){const k=cx+'_'+cy;let c=CH[k];if(c===undefined){if(!MAP.ch.includes(k)){CH[k]=null;return null;}c=new Image();c.src='g/'+k+'.webp';CH[k]=c;chLoaded.push(k);
 if(chLoaded.length>48){const o=chLoaded.shift();delete CH[o];}}return c&&c.complete&&c.naturalWidth?c:null;}
let blob=null;function mkBlob(){blob=document.createElement('canvas');blob.width=96;blob.height=48;const c=blob.getContext('2d');const g=c.createRadialGradient(48,24,2,48,24,46);g.addColorStop(0,'rgba(222,190,138,0.95)');g.addColorStop(0.55,'rgba(214,182,130,0.75)');g.addColorStop(1,'rgba(208,176,126,0)');c.setTransform(1,0,0,0.5,0,0);c.fillStyle=g;c.beginPath();c.arc(48,48,46,0,7);c.fill();c.setTransform(1,0,0,1,0,0);
 for(let i=0;i<60;i++){c.fillStyle=`rgba(${170+R()*50|0},${140+R()*40|0},${95+R()*30|0},${R()*.35})`;const a=R()*6.28,r=R()*30;c.fillRect(48+Math.cos(a)*r,24+Math.sin(a)*r*.5,2,1.5);}}
let build=null,sel=null,lastT=0,fps=60;
const SM={"k_lauzas":[400, 0, 400, 200, 196],"k_pastoge":[400, 0, 400, 200, 283],"k_palapine":[400, 0, 400, 200, 314],"k_zemine":[400, 0, 400, 200, 284],"k_stovykla":[400, 0, 400, 200, 236],"k_dziovykla":[400, 0, 400, 200, 264],"k_titnagas":[400, 0, 400, 200, 253],"k_zvejyba":[400, 0, 400, 200, 192],"k_aptvaras":[400, 0, 400, 200, 230],"k_javai":[400, 0, 400, 200, 194],"k_puodzerija":[400, 0, 400, 200, 237],"gyvuliai_1":[373,2,370,192,282],"gyvuliai_2":[392,3,389,196,291],"gyvuliai_3":[392,2,388,194,311],"gyvuliai_4":[385,2,382,191,311],"gyvuliai_5":[471,2,468,217,312],"kepykla_1":[355,1,353,181,270],"kepykla_2":[364,1,362,186,278],"kepykla_3":[375,1,373,189,297],"kepykla_4":[394,1,392,198,303],"kepykla_5":[404,1,402,203,296],"lentpjuve_1":[391,1,389,200,271],"lentpjuve_2":[382,1,380,192,274],"lentpjuve_3":[379,1,377,192,272],"lentpjuve_4":[384,1,382,195,273],"lentpjuve_5":[418,1,416,206,290],"malkine_1":[367,1,365,187,269],"malkine_2":[378,1,376,192,264],"malkine_3":[388,1,386,195,283],"malkine_4":[393,1,391,195,295],"malkine_5":[417,1,415,201,301],"malunas_1":[349,1,347,179,330],"malunas_2":[359,1,357,183,335],"malunas_3":[369,1,367,184,365],"malunas_4":[378,1,376,195,360],"malunas_5":[399,1,397,194,370],"medziotojas_1":[360,1,358,188,294],"medziotojas_2":[374,1,372,196,288],"medziotojas_3":[387,1,385,197,302],"medziotojas_4":[393,1,391,201,303],"medziotojas_5":[411,1,409,210,310],"namas_1":[430,1,428,221,364],"namas_2":[416,1,414,211,376],"namas_3":[413,1,411,209,404],"namas_4":[417,1,415,212,403],"namas_5":[441,1,439,220,409],"sandelis_1":[355,1,353,184,271],"sandelis_2":[372,1,370,189,289],"sandelis_3":[384,1,382,193,300],"sandelis_4":[389,1,387,194,305],"sandelis_5":[411,1,409,206,321],"skaldykla_1":[389,1,387,191,295],"skaldykla_2":[383,1,381,190,286],"skaldykla_3":[376,1,374,191,298],"skaldykla_4":[384,1,382,197,301],"skaldykla_5":[416,1,414,207,296],"sulinys_1":[370,1,368,188,265],"sulinys_2":[379,1,377,195,285],"sulinys_3":[383,1,381,196,294],"sulinys_4":[391,1,389,198,304],"sulinys_5":[413,1,411,208,330],"ukis_1":[372,2,369,190,276],"ukis_2":[391,2,386,194,280],"ukis_3":[391,2,387,195,285],"ukis_4":[384,2,381,191,294],"ukis_5":[467,2,463,196,300],"zolininke_1":[377,1,375,191,299],"zolininke_2":[380,1,378,194,300],"zolininke_3":[385,1,383,199,319],"zolininke_4":[403,1,401,204,319],"zolininke_5":[428,1,426,214,329],"zvejas_1":[380,1,378,193,281],"zvejas_2":[383,1,381,192,300],"zvejas_3":[383,1,381,193,313],"zvejas_4":[407,1,405,203,313],"zvejas_5":[428,1,426,212,334]};
// v7: every sprite is a fenced plot; scale so the plot diamond spans exactly the building footprint, bottom vertex on footprint bottom vertex
const WB={"gyvuliai_1":[36,59,295,253],"gyvuliai_2":[104,38,325,227],"gyvuliai_3":[131,147,306,279],"gyvuliai_4":[109,41,331,249],"gyvuliai_5":[70,124,400,271],"kepykla_1":[149,62,185,96],"kepykla_2":[44,103,237,168],"kepykla_3":[31,99,259,187],"kepykla_4":[118,3,275,210],"kepykla_5":[55,94,169,156],"lentpjuve_1":null,"lentpjuve_2":[91,50,262,133],"lentpjuve_3":[106,83,346,155],"lentpjuve_4":[66,92,383,162],"lentpjuve_5":[11,51,239,194],"malkine_1":[77,62,188,125],"malkine_2":[255,98,289,135],"malkine_3":[47,66,331,180],"malkine_4":[48,79,340,203],"malkine_5":[36,54,371,172],"malunas_1":[129,104,236,199],"malunas_2":[122,100,284,248],"malunas_3":[139,128,206,266],"malunas_4":[45,118,263,245],"malunas_5":[112,117,267,298],"medziotojas_1":[37,76,323,200],"medziotojas_2":[107,65,343,190],"medziotojas_3":[28,61,267,196],"medziotojas_4":[142,53,338,173],"medziotojas_5":[168,76,305,182],"namas_1":[166,101,232,197],"namas_2":[103,105,390,241],"namas_3":[89,149,306,252],"namas_4":[65,165,388,271],"namas_5":[29,147,369,295],"sandelis_1":null,"sandelis_2":[61,72,196,195],"sandelis_3":[70,31,292,124],"sandelis_4":[42,90,327,213],"sandelis_5":[62,97,379,243],"skaldykla_1":[83,28,293,196],"skaldykla_2":[56,39,299,178],"skaldykla_3":[50,83,329,211],"skaldykla_4":[20,12,361,204],"skaldykla_5":[60,22,353,236],"sulinys_1":[36,47,260,143],"sulinys_2":[163,70,282,139],"sulinys_3":[167,73,340,216],"sulinys_4":[59,99,339,207],"sulinys_5":[79,116,233,167],"ukis_1":[52,10,346,243],"ukis_2":[148,17,311,249],"ukis_3":[30,55,310,254],"ukis_4":[54,42,360,263],"ukis_5":[63,25,439,259],"zolininke_1":[77,74,341,166],"zolininke_2":[57,55,311,266],"zolininke_3":[2,100,319,215],"zolininke_4":[81,101,356,246],"zolininke_5":[78,117,382,289],"zvejas_1":[81,38,234,135],"zvejas_2":[51,65,308,219],"zvejas_3":[101,81,259,231],"zvejas_4":[115,86,371,221],"zvejas_5":[31,19,428,265]};
// v9: chimney tops per sprite (sprite px, measured); sprites without a chimney emit no smoke
const CHIM={namas_1:[205,7],namas_3:[231,7],namas_4:[238,7],namas_5:[235,7]};
// v10: yard surface centre y per sprite (sprite px); sprites are pre-clipped to the 2:1 footprint diamond
const SCY={"k_lauzas":95.6,"k_pastoge":182.6,"k_palapine":213.5,"k_zemine":184.2,"k_stovykla":136.0,"k_dziovykla":163.7,"k_titnagas":152.8,"k_zvejyba":92.3,"k_aptvaras":130.1,"k_javai":93.9,"k_puodzerija":137.3,"gyvuliai_1": 152.0, "gyvuliai_2": 160.5, "gyvuliai_3": 182.0, "gyvuliai_4": 179.5, "gyvuliai_5": 184.0, "kepykla_1": 156.0, "kepykla_2": 160.0, "kepykla_3": 180.5, "kepykla_4": 188.0, "kepykla_5": 174.0, "lentpjuve_1": 149.5, "lentpjuve_2": 151.5, "lentpjuve_3": 150.0, "lentpjuve_4": 149.5, "lentpjuve_5": 162.0, "malkine_1": 142.5, "malkine_2": 136.0, "malkine_3": 154.5, "malkine_4": 167.0, "malkine_5": 165.0, "malunas_1": 218.5, "malunas_2": 223.0, "malunas_3": 250.5, "malunas_4": 249.0, "malunas_5": 257.5, "medziotojas_1": 173.5, "medziotojas_2": 163.0, "medziotojas_3": 176.5, "medziotojas_4": 173.0, "medziotojas_5": 181.5, "namas_1": 223.0, "namas_2": 236.0, "namas_3": 263.0, "namas_4": 262.5, "namas_5": 267.5, "sandelis_1": 153.0, "sandelis_2": 167.0, "sandelis_3": 178.5, "sandelis_4": 180.0, "sandelis_5": 189.5, "skaldykla_1": 175.0, "skaldykla_2": 166.5, "skaldykla_3": 170.5, "skaldykla_4": 175.5, "skaldykla_5": 169.0, "sulinys_1": 132.0, "sulinys_2": 150.5, "sulinys_3": 160.0, "sulinys_4": 167.0, "sulinys_5": 196.5, "ukis_1": 146.0, "ukis_2": 136.0, "ukis_3": 153.0, "ukis_4": 150.0, "ukis_5": 169.5, "zolininke_1": 175.0, "zolininke_2": 170.5, "zolininke_3": 188.5, "zolininke_4": 187.5, "zolininke_5": 198.5, "zvejas_1": 155.0, "zvejas_2": 173.5, "zvejas_3": 191.5, "zvejas_4": 191.0, "zvejas_5": 207.0};
// v13b: nomad structures are drawn smaller (~2x2) in the middle of their unchanged 3x3 plot; the rest is a sand yard
const KSC={k_pastoge:.6,k_palapine:.6,k_zemine:.62,k_stovykla:.58,k_puodzerija:.58,k_aptvaras:.64,k_javai:.64,k_titnagas:.5,k_zvejyba:.5,k_dziovykla:.42,k_lauzas:.4};
function kYard(b){const s=b.s||3,[X,Y]=wpos(b.x+s-1,b.y+s-1),cy=Y+TH-s*TH/2,hw=s*TW/2,hh=s*TH/2;ctx.fillStyle='rgba(219,193,146,0.92)';ctx.beginPath();ctx.moveTo(X,cy-hh);ctx.lineTo(X+hw,cy);ctx.lineTo(X,cy+hh);ctx.lineTo(X-hw,cy);ctx.closePath();ctx.fill();}
function spriteDims(b,lv){const nm=B[b.t].spr[lv-1],im=img(nm);if(!im)return null;const s=b.s||3,m=SM[nm.slice(2)];if(!m)return null;
 const sc=s*TW/(m[2]-m[1])*(KSC[nm.slice(2)]||1),w=im.width*sc,h=im.height*sc;const[X,Y]=wpos(b.x+s-1,b.y+s-1);return{im,x:X-m[3]*sc,y:Y+TH-s*TH/2-SCY[nm.slice(2)]*sc,w,h};}
function render(){
 ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#161a20';ctx.fillRect(0,0,W,H);
 const z=cam.z;ctx.setTransform(DPR*z,0,0,DPR*z,DPR*(W/2-cam.x*z),DPR*(H/2-cam.y*z));
 const[x0,y0]=s2w(0,0),[x1,y1]=s2w(W,H);
 for(let cy=Math.max(0,Math.floor(y0/512));cy<=Math.floor(y1/512);cy++)for(let cx=Math.max(0,Math.floor(x0/512));cx<=Math.floor(x1/512);cx++){const c=chunk(cx,cy);if(c)ctx.drawImage(c,cx*512,cy*512,512.6,512.6);}
 const cs=[w2t(x0,y0),w2t(x1,y0),w2t(x0,y1+500),w2t(x1,y1+500)];const tx0=Math.max(0,Math.floor(Math.min(...cs.map(c=>c[0])))-2),tx1=Math.min(N-1,Math.ceil(Math.max(...cs.map(c=>c[0])))+2),ty0=Math.max(0,Math.floor(Math.min(...cs.map(c=>c[1])))-2),ty1=Math.min(N-1,Math.ceil(Math.max(...cs.map(c=>c[1])))+2);
 // bridge
 for(const i of BR){const x=i%N,y=(i/N)|0;if(x<tx0||x>tx1||y<ty0||y>ty1)continue;const[X,Y]=wpos(x,y);ctx.fillStyle='#6b4a2c';ctx.beginPath();ctx.moveTo(X,Y+TH*0.2);ctx.lineTo(X+TW*0.4,Y+TH*0.4);ctx.lineTo(X,Y+TH*0.8);ctx.lineTo(X-TW*0.4,Y+TH*0.6);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(40,25,12,.7)';ctx.lineWidth=1.5;for(let k=1;k<6;k++){const f=k/6;ctx.beginPath();ctx.moveTo(X-TW*0.4+TW*0.4*f,Y+TH*0.6-TH*0.4*f);ctx.lineTo(X+TW*0.4*f,Y+TH*0.8-TH*0.4*f);ctx.stroke();}
  ctx.fillStyle='#4a321c';ctx.fillRect(X-TW*0.42,Y+TH*0.55,4,-14);ctx.fillRect(X+TW*0.38,Y+TH*0.38,4,-14);}
 // paths
 if(!blob)mkBlob();
 for(let y=ty0*2;y<=ty1*2+1;y++)for(let x=tx0*2;x<=tx1*2+1;x++){const w=S.wear[y*2*N+x];if(w>5){const[X,Y]=wpos((x+.5)/2,(y+.5)/2);ctx.globalAlpha=Math.min(0.9,(w-5)/25);ctx.drawImage(blob,X-TW*0.36,Y-TH*0.36,TW*0.72,TH*0.72);}}
 ctx.globalAlpha=1;
 // roads
 drawRoads(tx0,tx1,ty0,ty1);
 for(const b of S.b){if(!B[b.t].fld||b.st=='site'&&!b.lv||b.s>=3)continue;if(b.x+2<tx0-1||b.x>tx1+1||b.y+2<ty0-1||b.y>ty1+1)continue;if(b.t=='ukis')drawField(b);else drawPen(b,0);}
 // build grid
 if(build){ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.lineWidth=1/z;ctx.beginPath();for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++){if(!S.fog[idx(x,y)]||'wuc'.includes(terr(x,y)))continue;const[X,Y]=wpos(x,y);ctx.moveTo(X,Y);ctx.lineTo(X+TW/2,Y+TH/2);ctx.lineTo(X,Y+TH);ctx.lineTo(X-TW/2,Y+TH/2);ctx.closePath();}ctx.stroke();
  if(build.x!=null){const s=B[build.t].size[0],ok=!canPlace(build.t,build.x,build.y);const P=[wpos(build.x,build.y),wpos(build.x+s,build.y),wpos(build.x+s,build.y+s),wpos(build.x,build.y+s)];
   const dia=(x,y,n)=>{const Q=[wpos(x,y),wpos(x+n,y),wpos(x+n,y+n),wpos(x,y+n)];ctx.beginPath();Q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();};
   ctx.setLineDash([8/z,6/z]);ctx.lineWidth=2/z;ctx.strokeStyle='rgba(255,215,90,.75)';ctx.fillStyle='rgba(255,215,90,.10)';for(const q of S.b)if(q.t=='namas'&&q.s==1){dia(q.x,q.y,2);ctx.fill();ctx.stroke();}
   if(build.t=='namas'){dia(build.x,build.y,2);ctx.fillStyle=ok?'rgba(255,225,110,.25)':'rgba(230,50,40,.18)';ctx.fill();ctx.strokeStyle=ok?'rgba(255,225,110,.95)':'rgba(230,50,40,.8)';ctx.lineWidth=2.5/z;ctx.stroke();}
   ctx.setLineDash([]);
   ctx.fillStyle=ok?'rgba(60,220,70,0.35)':'rgba(230,50,40,0.35)';ctx.strokeStyle=ok?'rgba(60,220,70,0.95)':'rgba(230,50,40,0.95)';ctx.lineWidth=3/z;ctx.beginPath();P.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]-0):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.stroke();}}
 if(sel&&bId(sel)){const b=bId(sel),s=b.s;const P=[wpos(b.x,b.y),wpos(b.x+s,b.y),wpos(b.x+s,b.y+s),wpos(b.x,b.y+s)];ctx.strokeStyle='rgba(255,230,120,.9)';ctx.lineWidth=2.5/z;ctx.beginPath();P.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.stroke();}
 // drawables
 const D=[];
 for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++){const o=objAt[idx(x,y)];if(o&&S.fog[idx(x,y)]>0||o&&nearSeen(x,y))D.push([x+y+0.9,0,o]);}
 const MC=MAP.MC,MR=MAP.MR;D.push([MC[0]+MR+MC[1]+MR+1,3,{k:'gora',x:MC[0]+MR,y:MC[1]+MR,s:2*MR+1}]);const CL=MAP.CL;D.push([CL[0]+CL[1]+2*CL[2],3,{k:'uolynas',x:CL[0]+CL[2]-1,y:CL[1]+CL[2]-1,s:CL[2]}]);
 for(const b of S.b)D.push([b.s>=3?b.x+b.y+3:b.x+b.y+2*(B[b.t].fld?2:b.s)-1.5,2,b]);// v7: 3×3 plot depth
 for(const b of S.b){if(b.t!='gyvuliai'||!b.lv||b.st=='site')continue;for(const a of herdAnim(b))D.push([Math.max(a.x+a.y,b.s>=3?b.x+b.y+3.05:0),5,a]);}
 for(const p of S.p)if(!p.in&&seen(p.x,p.y)){const o=inM(p.x|0,p.y|0)?occ[idx(p.x|0,p.y|0)]:0,ob=o&&bId(o);D.push([ob&&ob.s>=3?Math.max(p.x+p.y,ob.x+ob.y+3.05):p.x+p.y,1,p]);}
 for(const d of S.deer)if(seen(d.x,d.y))D.push([d.x+d.y,4,d]);
 D.sort((a,b)=>a[0]-b[0]);
 const top=[];
 for(const[,k,o]of D){
  if(k==0){const im=img(o.k);if(!im)continue;const[X,Y]=wpos(o.x,o.y);let sc=o.s;if(o.grow)sc*=0.35+0.65*(1-o.grow/(DAY*2));const w=TW*sc*(o.k=='kelmas'?0.5:0.75),h=im.height*w/im.width;drawTree(o,im,X,Y+TH*0.75,w,h);}
  else if(k==3){const im=img(o.k);if(!im)continue;const[X,Y]=wpos(o.x,o.y);const w=TW*o.s,h=im.height*w/im.width;ctx.drawImage(im,X-w/2,Y+TH-h+TH*0.05*o.s,w,h);}
  else if(k==2)drawB(o,top);
  else if(k==1)drawP(o);
  else if(k==5){if(!o.k)continue;const[X,Y]=wpos(o.x,o.y);drawAn(o,o.k,X,Y+TH*0.15,o.mv?S.t*7+o.x*3:null,0);}
  else if(k==4){const[X,Y]=wpos(o.x,o.y);drawAn(o,'elnias',X,Y+TH*0.2,o.mv?S.t*8+o.x*3:null,o.dead?-Math.min(1,(S.t-o.dead)*2.5)*1.45:0);}}
 for(const b of S.b)if(b.t=='gyvuliai'&&b.lv&&b.st!='site'&&b.s<3)drawPen(b,1);
 for(const f of FX)f();FX.length=0;
 // fish ripples
 for(const b of S.b){if(b.t!='zvejas'||!b.lv)continue;const f=b.fish||(b.fish=fishSpot(b));if(!f)continue;const[X,Y]=wpos(f.x+.5,f.y+.5);for(let k=0;k<2;k++){const ph=((S.t*0.5+k*0.5)%1);ctx.strokeStyle=`rgba(230,245,255,${0.7*(1-ph)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(X,Y,4+ph*16,2+ph*8,0,0,7);ctx.stroke();}
  if(Math.sin(S.t*1.3+b.id)>0.97){ctx.fillStyle='#c9d6dc';ctx.beginPath();ctx.ellipse(X+6,Y-6,5,2,-.6,0,7);ctx.fill();}}
 // fog
 if(fogDirty)buildFog();ctx.save();ctx.transform(TW/2,TH/2,-TW/2,TH/2,WW/2,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(fogCv,0,0);ctx.restore();
 // ambient fish splashes
 {const WT=[];for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++){if(terr(x,y)!='w'||BR.has(idx(x,y))||!S.fog[idx(x,y)])continue;const[X,Y]=wpos(x+.5,y+.5);if(X>x0&&X<x1&&Y>y0&&Y<y1)WT.push([X,Y]);}
  if(WT.length){const cnt=Math.min(4,1+(WT.length/40|0));for(let k=0;k<cnt;k++){const per=1.7+k*0.37,slot=Math.floor(S.t/per+k*0.31);const hsh=Math.abs(Math.sin(slot*7.13+k*31.7)*43758.5)%1;const[X,Y]=WT[(hsh*WT.length)|0];const ph=(S.t/per+k*0.31)%1;
  ctx.strokeStyle=`rgba(235,248,255,${0.8*(1-ph)})`;ctx.lineWidth=1.4;for(let r=0;r<2;r++){const q=Math.max(0,ph-r*0.15);ctx.beginPath();ctx.ellipse(X,Y,3+q*18,1.5+q*9,0,0,7);ctx.stroke();}
  if(ph<0.45){const f=ph/0.45,fx=X-10+f*20,fy=Y-Math.sin(f*Math.PI)*16;ctx.save();ctx.translate(fx,fy);ctx.rotate(-1+f*2);ctx.fillStyle='#b8c6cc';ctx.beginPath();ctx.ellipse(0,0,6,2.2,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(-10,-3);ctx.lineTo(-10,3);ctx.fill();ctx.restore();
   ctx.fillStyle='rgba(230,245,255,.8)';for(let d=0;d<4;d++){ctx.beginPath();ctx.arc(X-12+d*3,Y-3-Math.sin(f*6+d)*3,1.1,0,7);ctx.fill();}}}}}
 // chimney smoke
 for(const b of S.b){if(b.t!='namas'||!b.lv||b.st=='demo'||!(b.wood>0))continue;if(!S.p.some(p=>p.home==b.id))continue;const d=spriteDims(b,b.lv);if(!d)continue;const cook=S.p.some(p=>p.home==b.id&&p.act=='verda sriubą');
  const ch=CHIM[B[b.t].spr[b.lv-1].slice(2)];if(!ch)continue;const csc=d.w/SM[B[b.t].spr[b.lv-1].slice(2)][0],cx=d.x+ch[0]*csc,cy=d.y+ch[1]*csc,n=cook?7:4;
  for(let i=0;i<n;i++){const f=((S.t*0.35+i/n+b.id*0.13)%1);const r=(3+f*12)*(cook?1.2:1);ctx.fillStyle=`rgba(${cook?215:200},${cook?210:200},${cook?205:205},${0.55*(1-f)})`;ctx.beginPath();ctx.arc(cx+Math.sin(f*4+i+S.t*0.7)*4*f+f*12,cy-2-f*50,r,0,7);ctx.fill();}}
 // night
 {const dk=darkness();if(dk>0){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(14,20,52,${0.58*dk})`;ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';for(const b of S.b){if(!b.lv||b.st=='demo')continue;const lit=S.p.some(p=>p.in&&!p.mv&&(b.t=='namas'?p.home==b.id:(B[b.t].wk&&p.job==b.id&&!/miega/.test(p.act||'')))&&Math.abs(p.x-(b.x+b.s/2))<=b.s/2+1.6&&Math.abs(p.y-(b.y+b.s/2))<=b.s/2+1.6);if(!lit)continue;const d=spriteDims(b,b.lv);if(!d)continue;
   const nm=B[b.t].spr[b.lv-1].slice(2),wb=WB[nm],wi=wb&&img('w_'+nm);if(!wi)continue;const sc=d.w/SM[nm][0],fl=0.82+0.18*Math.sin(S.t*7+b.id)*Math.sin(S.t*2.3+b.id*1.7);
   ctx.globalAlpha=Math.min(1,dk*1.1*fl);for(let k=0;k<2;k++)ctx.drawImage(wi,d.x+wb[0]*sc,d.y+wb[1]*sc,(wb[2]-wb[0])*sc,(wb[3]-wb[1])*sc);ctx.globalAlpha=1;}
  ctx.restore();}}
 // overlays
 for(const f of top)f();
 if(build&&build.x!=null){const b={t:build.t,x:build.x,y:build.y};const d=spriteDims(b,1);if(d){ctx.globalAlpha=0.6;ctx.drawImage(d.im,d.x,d.y,d.w,d.h);ctx.globalAlpha=1;}}
}
let cobP=null;function mkCobP(){const Z=128,c0=document.createElement('canvas');c0.width=c0.height=Z;const c=c0.getContext('2d');c.fillStyle='#665842';c.fillRect(0,0,Z,Z);
 let sd=11;const r=()=>{sd=(sd*9301+49297)%233280;return sd/233280;};const G=7,st=Z/G;
 for(let gy=0;gy<G;gy++)for(let gx=0;gx<G;gx++){const x=(gx+.5)*st+(gy%2)*st/2+(r()-.5)*2.2,y=(gy+.5)*st+(r()-.5)*2.2,rx=st*(.44+r()*.12),ry=st*(.40+r()*.1),rot=r()*3;
  const v=r(),tone=[138+v*50,127+v*46,106+v*38].map(q=>q|0),warm=r()<.35?14:0;
  for(const[dx,dy]of[[0,0],[Z,0],[-Z,0],[0,Z],[0,-Z],[Z,Z],[-Z,-Z],[Z,-Z],[-Z,Z]]){const X=x+dx,Y=y+dy;if(X<-st||X>Z+st||Y<-st||Y>Z+st)continue;
   c.fillStyle='rgba(40,32,24,.55)';c.beginPath();c.ellipse(X+.8,Y+1,rx,ry,rot,0,7);c.fill();
   c.fillStyle=`rgb(${tone[0]+warm},${tone[1]+warm/2|0},${tone[2]})`;c.beginPath();c.ellipse(X,Y,rx,ry,rot,0,7);c.fill();
   c.fillStyle='rgba(255,246,225,.14)';c.beginPath();c.ellipse(X-rx*.25,Y-ry*.3,rx*.45,ry*.32,rot,0,7);c.fill();}}
 // grit
 for(let i=0;i<260;i++){c.fillStyle=`rgba(${r()<.5?60:200},${r()<.5?50:185},40,.25)`;c.fillRect(r()*Z,r()*Z,1,1);}
 cobP=ctx.createPattern(c0,'repeat');cobP.Z=Z;}
// v9: cobblestone fills the tile width; tiles join into continuous paths, 2×2+ merges into a plaza; soft earthen edges
function roadPath(tx0,tx1,ty0,ty1){const L=[];let P;const nw=()=>{P=new Path2D();L.push(P);return P;},H=0.45,has=(x,y)=>inM(x,y)&&RD.has(idx(x,y));
 for(const i of RD){const x=i%N,y=(i/N)|0;if(x<tx0-1||x>tx1+1||y<ty0-1||y>ty1+1)continue;const cx=x+.5,cy=y+.5;
  const e=has(x+1,y),w=has(x-1,y),s=has(x,y+1),n=has(x,y-1),R0=0.22;
  nw();P.roundRect(cx-H,cy-H,2*H,2*H,[(!n&&!w)?R0:0,(!n&&!e)?R0:0,(!s&&!e)?R0:0,(!s&&!w)?R0:0]);
  if(e)nw().rect(cx,cy-H,1,2*H);if(s)nw().rect(cx-H,cy,2*H,1);
  if(e&&s&&has(x+1,y+1))nw().rect(cx,cy,1,1);
  const D=H*.75;
  if(has(x+1,y+1)&&!e&&!s){nw();P.moveTo(cx-D,cy+D);P.lineTo(cx+D,cy-D);P.lineTo(cx+1+D,cy+1-D);P.lineTo(cx+1-D,cy+1+D);P.closePath();}
  if(has(x-1,y+1)&&!w&&!s){nw();P.moveTo(cx-D,cy-D);P.lineTo(cx+D,cy+D);P.lineTo(cx-1+D,cy+1+D);P.lineTo(cx-1-D,cy+1-D);P.closePath();}
  for(const[dx,dy]of[[1,1],[-1,1],[1,-1],[-1,-1]]){if(has(x+dx,y)&&has(x,y+dy)&&!has(x+dx,y+dy)){const F=0.3,ix=cx+dx*H,iy=cy+dy*H;nw();P.moveTo(ix,iy);P.lineTo(ix+dx*F,iy);P.quadraticCurveTo(ix,iy,ix,iy+dy*F);P.closePath();}}}
 return L;}
function drawRoads(tx0,tx1,ty0,ty1){if(!RD.size)return;if(!cobP)mkCobP();const L=roadPath(tx0,tx1,ty0,ty1);ctx.save();ctx.transform(TW/2,TH/2,-TW/2,TH/2,WW/2,0);ctx.lineJoin='round';
 // soft earthen rim: wide faint strokes underneath (interior strokes are covered by the fill)
 for(const[w,a]of[[0.26,.10],[0.17,.16],[0.09,.28]]){ctx.strokeStyle=`rgba(112,88,56,${a})`;ctx.lineWidth=w;for(const P of L)ctx.stroke(P);}
 cobP.setTransform(new DOMMatrix([1/cobP.Z*1.4,0,0,1/cobP.Z*1.4,0,0]));ctx.fillStyle=cobP;for(const P of L)ctx.fill(P);
 ctx.restore();}
let cob=null;function mkCob(){cob=document.createElement('canvas');cob.width=96;cob.height=48;const c=cob.getContext('2d');c.beginPath();c.moveTo(48,1);c.lineTo(95,24);c.lineTo(48,47);c.lineTo(1,24);c.closePath();c.fillStyle='#8f8578';c.fill();c.save();c.clip();
 let sd=7;const r=()=>{sd=(sd*9301+49297)%233280;return sd/233280;};for(let gy=0;gy<8;gy++)for(let gx=0;gx<14;gx++){const x=gx*7+(gy%2)*3.5+r()*1.5,y=gy*6+r()*1.5;const v=120+r()*60|0;c.fillStyle=`rgb(${v},${v-6|0},${v-16|0})`;c.strokeStyle='rgba(55,48,40,.75)';c.lineWidth=1;c.beginPath();c.ellipse(x,y,3.3,2.4,0,0,7);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.ellipse(x-1,y-1,1.4,0.8,0,0,7);c.fill();}
 c.restore();c.strokeStyle='rgba(70,60,48,.8)';c.lineWidth=2;c.beginPath();c.moveTo(48,1);c.lineTo(95,24);c.lineTo(48,47);c.lineTo(1,24);c.closePath();c.stroke();}
function dia4(x,y){return[wpos(x,y),wpos(x+1,y),wpos(x+1,y+1),wpos(x,y+1)];}
function drawField(b){const f=b.f||{st:0,sow:0,g:0,cut:0};const T=fieldTiles(b);
 T.forEach(([x,y],k)=>{const Q=dia4(x,y);ctx.fillStyle='#6e4f30';ctx.beginPath();Q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(60,40,20,.6)';ctx.lineWidth=1;ctx.stroke();
  // furrows
  ctx.strokeStyle='rgba(50,33,18,.55)';ctx.lineWidth=1.2;for(let r=1;r<6;r++){const a=wpos(x+r/6,y+0.05),c=wpos(x+r/6,y+0.95);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(c[0],c[1]);ctx.stroke();}
  const sown=f.st>0||k<Math.round(f.sow*5)-0;const cut=f.st==2&&k<Math.round(f.cut*5);if(!sown||cut){if(cut){ctx.fillStyle='rgba(220,190,110,.5)';for(let r=0;r<12;r++){const p=wpos(x+((r*37)%10)/10+.05,y+((r*53)%10)/10+.05);ctx.fillRect(p[0],p[1],3,1.5);}}return;}
  const g=f.st==2?1:f.st==1?f.g:0.04;const hgt=3+16*g;const col=f.st==2?['#d9b347','#c99a2e']:g<0.5?['#7fb34a','#5f9637']:['#a8b545','#8c9a33'];
  for(let r=0;r<6;r++)for(let c2=0;c2<6;c2++){const p=wpos(x+(r+.5)/6,y+(c2+.5)/6);const sw=Math.sin(S.t*1.5+p[0]*0.05)*g*1.5;ctx.strokeStyle=col[(r+c2)%2];ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+sw-1.5,p[1]-hgt);ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+sw+1.5,p[1]-hgt*0.9);ctx.stroke();
   if(f.st==2){ctx.fillStyle='#e8c35a';ctx.beginPath();ctx.ellipse(p[0]+sw-1.5,p[1]-hgt-1.5,1.4,3,0.3,0,7);ctx.fill();}}});}
function drawPen(b,front){const T=fieldTiles(b);if(!front){T.forEach(([x,y])=>{const Q=dia4(x,y);ctx.fillStyle='#7d8a45';ctx.beginPath();Q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.fillStyle='rgba(110,85,50,.35)';for(let r=0;r<10;r++){const p=wpos(x+((r*37)%10)/10,y+((r*61)%10)/10);ctx.beginPath();ctx.ellipse(p[0],p[1],4,2,0,0,7);ctx.fill();}});}
 // fence along outer edges of pen (x+3 side and y+3 side, plus inner corner edges)
 const E=front?[[[b.x+3,b.y],[b.x+3,b.y+3]],[[b.x,b.y+3],[b.x+3,b.y+3]]]:[[[b.x+2,b.y],[b.x+3,b.y]],[[b.x,b.y+2],[b.x,b.y+3]],[[b.x+2,b.y],[b.x+2,b.y+2]],[[b.x,b.y+2],[b.x+2,b.y+2]]];
 for(const[[ax,ay],[bx,by]]of E){if(!front&&(ax==b.x+2&&bx==b.x+2||ay==b.y+2&&by==b.y+2))continue;const n=Math.round(Math.hypot(bx-ax,by-ay)*2);const A=wpos(ax,ay),Bp=wpos(bx,by);ctx.strokeStyle='#5a3d22';ctx.lineWidth=2.2;for(const hh of[7,13]){ctx.beginPath();ctx.moveTo(A[0],A[1]-hh);ctx.lineTo(Bp[0],Bp[1]-hh);ctx.stroke();}
  ctx.fillStyle='#4a321c';for(let i=0;i<=n;i++){const X=A[0]+(Bp[0]-A[0])*i/n,Y=A[1]+(Bp[1]-A[1])*i/n;ctx.fillRect(X-1.5,Y-17,3,17);}}}
function herdAnim(b){const h=b.herd||{c:0,s:0};const want=[];for(let i=0;i<h.c;i++)want.push('karve');for(let i=0;i<h.s;i++)want.push(R()<0?'':'avis');
 if(!b.an||b.an.length!=want.length){const T=fieldTiles(b);b.an=want.map((k,i)=>{const t=T[i%5];return{k,x:t[0]+.3+R()*.4,y:t[1]+.3+R()*.4,tx:0,ty:0,w:0,fl:1,mv:0};});}
 const T=fieldTiles(b),dt=0.016;for(const a of b.an){a.w-=dt;if(a.w<=0){const t=T[(R()*5)|0];a.tx=t[0]+.2+R()*.6;a.ty=t[1]+.2+R()*.6;a.w=rnd(3,8);}const dx=a.tx-a.x,dy=a.ty-a.y,l=Math.hypot(dx,dy);if(l>0.03){const sp=Math.min(l,0.25*dt);a.x+=dx/l*sp;a.y+=dy/l*sp;a.mv=1;if(Math.abs(dx-dy)>.01)a.fl=dx-dy>0?1:-1;if(Math.abs(dx+dy)>.01)a.bk=dx+dy<0?1:0;}else a.mv=0;}
 return b.an;}
// v11: animals drawn from v14 walk atlases; SW/NE art, mirrored for SE/NW; phase-driven frames
function drawAn(o,k,X,Y,ph,rot){const n=k+(o.bk?'_ne':'_sw'),M=VM[n],im=img('v_'+n);if(!im)return;const w=M[0]/VK,h=M[1]/VK;
 ctx.save();ctx.translate(X,Y);ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,0,w*0.32,w*0.1,0,0,7);ctx.fill();
 // sw art faces left, ne art faces right; o.fl>0 = moving screen-right
 if(o.bk?o.fl<0:o.fl>0)ctx.scale(-1,1);if(rot)ctx.rotate(rot);const f=ph==null?M[4]:(Math.floor(ph/6.2832*8)%8+8)%8;
 ctx.drawImage(im,f*M[0],0,M[0],M[1],-M[2]/VK,-M[3]/VK,w,h);ctx.restore();}
function drawTree(o,im,X,Y,w,h){ctx.save();ctx.translate(X,Y);
 if(o.chop){const ph=(S.t*1.1+(o.ph||0))%1;if(ph>0.72&&ph<0.9)ctx.rotate(Math.sin((ph-0.72)*60)*0.035);}
 if(o.fallT!=null){const f=Math.min(1,(S.t-o.fallT)/1.1);ctx.rotate(-(o.fdir||1)*f*f*1.45);if(f>=1&&S.t-o.fallT<1.3){ctx.globalAlpha=1-(S.t-o.fallT-1.1)*4;}}
 ctx.drawImage(im,-w/2,-h,w,h);ctx.restore();ctx.globalAlpha=1;
 if(o.chop){const pr=Math.min(1,(S.t-o.chop.t0)/o.chop.d);const bw=TW*0.5,by=Y+8;ctx.fillStyle='rgba(30,20,10,.7)';ctx.fillRect(X-bw/2-2,by-2,bw+4,9);ctx.fillStyle='#e8c25a';ctx.fillRect(X-bw/2,by,bw*pr,5);
  const ph=(S.t*1.1+(o.ph||0))%1;if(ph>0.72&&ph<0.95){const a=1-(ph-0.72)/0.23;ctx.fillStyle=`rgba(225,195,140,${a})`;for(let k=0;k<4;k++){const ang=k*1.7+o.x,r=6+18*(1-a);ctx.fillRect(X+Math.cos(ang)*r,Y-14-Math.abs(Math.sin(ang))*r,3,2);}}}}
// split sprite into body + two legs for walk cycle
const ARMS={vyras:[[0,0.2,0.27,0.6,-1],[0.8,1,0.27,0.57,1]],moteris:[[0,0.2,0.22,0.6,-1],[0.82,1,0.25,0.6,1]]};const PC={};const HIP={vyras:.6,vyras_malkos:.6,vyras_zuvys:.62,vyras_kibiras:.6,statybininkas_lentos:.6,medziotojas_elnias:.62,berniukas:.6,mergaite:.72,moteris:.74,moteris_krepsys:.74};
function parts(n){if(PC[n])return PC[n];const im=img(n);if(!im)return null;const w=im.width,h=im.height,hip=Math.round(h*(HIP[n]||.62));
 const mk=(sx,sy,sw,sh)=>{const c=document.createElement('canvas');c.width=Math.max(1,sw);c.height=Math.max(1,sh);c.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,sw,sh);return c;};
 // find gap between feet in bottom 12%
 let cx=w/2;try{const t=mk(0,Math.round(h*.88),w,h-Math.round(h*.88)),d=t.getContext('2d').getImageData(0,0,t.width,t.height).data;const col=new Array(w).fill(0);for(let y=0;y<t.height;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>60)col[x]++;
  let a=col.findIndex(v=>v>0),b=w-1-[...col].reverse().findIndex(v=>v>0);let best=-1,bl=0;for(let x=a;x<=b;){if(col[x]==0){let e=x;while(e<=b&&col[e]==0)e++;if(e-x>bl){bl=e-x;best=(x+e)/2;}x=e;}else x++;}cx=best>0?best:(a+b)/2;}catch(e){}
 const ov=Math.round(h*.05);const up=mk(0,0,w,hip+ov);let arms=null;const AR=ARMS[n];
 if(AR){arms=AR.map(([x0,x1,y0,y1,f])=>{const X=Math.round(x0*w),Y=Math.round(y0*h),cw=Math.round((x1-x0)*w),chh=Math.round((y1-y0)*h);const c=mk(X,Y,cw,chh);up.getContext('2d').clearRect(X,Y,cw,chh);return{c,x:X,y:Y,px:X+cw/2,py:Y+chh*0.08,f};});}
 const P={im,w,h,hip,cx,up,arms,L:mk(0,hip,Math.round(cx),h-hip),R:mk(Math.round(cx),hip,w-Math.round(cx),h-hip)};PC[n]=P;return P;}
function swingTool(ph,up,down){// returns angle: slow raise, fast strike
 return ph<0.7?down+(up-down)*Math.sin(ph/0.7*Math.PI/2):up+(down-up)*Math.min(1,(ph-0.7)/0.08);}

function nearSeen(x,y){return false;}
function drawB(b,top){const z=cam.z;let d;
 if(b.st=='site'){const s=b.s,sc=img('statybviete');const t=b.site.to;const dd=spriteDims(b,t);const[X,Y]=wpos(b.x+s-1,b.y+s-1);const pr=b.site.prog/b.site.tot;
  if(dd&&pr>0.02){const f=Math.min(1,pr);ctx.drawImage(dd.im,0,dd.im.height*(1-f),dd.im.width,dd.im.height*f,dd.x,dd.y+dd.h*(1-f),dd.w,dd.h*f);}
  if(sc){const w=TW*s*1.05,h=sc.height*w/sc.width;ctx.globalAlpha=1-0.6*pr;ctx.drawImage(sc,X-w/2,Y+TH-h+TH*0.1*s,w,h);ctx.globalAlpha=1;}
  d=dd;}
 else{d=spriteDims(b,b.lv);if(d&&KSC[B[b.t].spr[b.lv-1].slice(2)])kYard(b);if(d)ctx.drawImage(d.im,d.x,d.y,d.w,d.h);
  if(b.st=='upg'){const sc=img('statybviete');if(sc&&d){const w=d.w*0.8,h=sc.height*w/sc.width;ctx.globalAlpha=0.85;ctx.drawImage(sc,d.x+d.w*0.1,d.y+d.h-h*0.95,w,h);ctx.globalAlpha=1;}}}
 if(!d)return;
 if(b.fire>0){top.push(()=>drawFire(b,d));}
 if(b.t=='malkine'&&b.lv&&b.mk>0){const[X,Y]=wpos(b.x+b.s,b.y+b.s*0.5);const n=Math.min(12,Math.ceil(b.mk/mkCap(b)*12));let k=0;for(let r=0;r<4&&k<n;r++)for(let c=0;c<4-r&&k<n;c++,k++){const lx=X-14+c*8+r*4,ly=Y-6-r*6;ctx.fillStyle='#7a4f2a';ctx.strokeStyle='#3e2612';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(lx,ly,4.2,3.4,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#d8b07a';ctx.beginPath();ctx.ellipse(lx,ly,2.6,2,0,0,7);ctx.fill();}}
 if(b.st=='demo'){for(let i=0;i<5;i++){const f=((S.t*0.6+i/5)%1);ctx.fillStyle=`rgba(170,150,120,${0.45*(1-f)})`;ctx.beginPath();ctx.arc(d.x+d.w*(0.2+0.6*((i*0.37)%1)),d.y+d.h*0.8-f*30,4+f*10,0,7);ctx.fill();}}
 top.push(()=>{const icons=[];if(b.st=='demo')icons.push('⛏ griaunama');if(b.st=='site'||b.st=='upg'){const s=b.site,pr=Math.floor(100*s.prog/s.tot);icons.push('🔨'+pr+'%');}
  if(b.t=='namas'&&b.lv){if(b.pan<1&&food()<1)icons.push('🍖');if(b.wood<=0)icons.push('🪵');if(b.well===false||!(b.water>=1)&&!(b.pan>=1))icons.push('💧');if(S.p.some(p=>p.home==b.id&&p.sick))icons.push('🤒');}
  else if(B[b.t].wk&&b.st!='site'&&!S.p.some(p=>p.job==b.id))icons.push('💤');
  if(b.t=='malkine'&&b.lowW)icons.push('🌲❗');
  if(b.t=='malkine'&&b.lv)icons.push('🪵'+Math.floor(b.mk||0)+'/'+mkCap(b));
  if(b.t=='ukis'&&b.lv&&b.f){icons.push(b.f.st==0?'🌱 sėja':b.f.st==1?'🌾 '+Math.floor(b.f.g*100)+'%':'🌾 pjūtis');}
  if(b.t=='gyvuliai'&&b.lv&&b.herd)icons.push('🐄'+b.herd.c+' 🐑'+b.herd.s);
  if(b.t=='namas'&&b.lv>=3&&!(b.cl>0))icons.push('👕');
  const cx=d.x+d.w/2;let y=d.y+d.h*0.08;const sz=13/z;
  if(icons.length){ctx.font=`${sz}px system-ui,sans-serif`;ctx.textAlign='center';const txt=icons.join(' ');const tw=ctx.measureText(txt).width+10;ctx.fillStyle='rgba(30,20,10,.65)';rr(cx-tw/2,y-sz*1.15,tw,sz*1.4,6);ctx.fillStyle='#fff';ctx.fillText(txt,cx,y);}
  if(B[b.t].cat&&b.lv&&z>0.28){const ex=d.x+d.w*0.18,ey=d.y+d.h*0.82,r=11/z;ctx.fillStyle='rgba(92,60,30,.92)';ctx.strokeStyle='#e7c98f';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ex,ey,r,0,7);ctx.fill();ctx.stroke();ctx.font=`${r*1.15}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(B[b.t].ic,ex,ey+1);ctx.textBaseline='alphabetic';}});}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.fill();}
function drawFire(b,d){const n=6,I=b.fire/100;for(let i=0;i<n;i++){const fx=d.x+d.w*(0.25+0.5*((i*0.37+0.1)%1)),fy=d.y+d.h*(0.35+0.25*((i*0.61)%1));const fl=Math.sin(S.t*12+i*2)*0.2+1,h=(18+30*I)*fl,w=h*0.5;
 const g=ctx.createRadialGradient(fx,fy-h*0.3,1,fx,fy-h*0.3,h*0.7);g.addColorStop(0,'rgba(255,240,150,.95)');g.addColorStop(0.4,'rgba(255,140,30,.85)');g.addColorStop(1,'rgba(200,40,10,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(fx,fy-h*0.3,w,h*0.7,0,0,7);ctx.fill();}
 for(let i=0;i<5;i++){const ph=(S.t*0.4+i/5)%1;ctx.fillStyle=`rgba(60,55,55,${0.45*(1-ph)})`;ctx.beginPath();ctx.arc(d.x+d.w*0.5+Math.sin(ph*6+i)*10,d.y+d.h*0.3-ph*90,8+ph*22,0,7);ctx.fill();}}
function drawP(p){const work=!p.mv&&p.act;
 const base=(S.era<5?'klaj_':'')+(p.ch?(S.era<5?'vaikas':p.sex=='m'?'vaikas':'mergaite'):p.sex=='m'?'vyras':'moteris'),dn=base+(p.bk?'_ne':'_sw'),M=VM[dn],at=img('v_'+dn);if(!at)return;
 let[X,Y]=wpos(p.x,p.y);if(!p.mv&&p.tgt&&(p.act=='kerta medį'||p.act=='skaldo akmenį'||p.act=='skaldo uolą')){const[TX,TY]=wpos(p.tgt.x+.5,p.tgt.y+.5);X+=(TX-X)*0.22;Y+=(TY-Y)*0.22;}
 const fw=M[0]/VK,fh=M[1]/VK,tH=M[3]/VK,P={w:fw,h:tH,hip:tH*0.55,cx:fw/2},h=tH,dw=TW*VS*(p.ch?0.25:0.33);
 const hop=(p.ch&&!p.mv&&p.act&&p.act.startsWith('žaidžia'))?-Math.abs(Math.sin(S.t*5+p.id*1.7))*TH*0.12:0;if(hop&&Math.sin(S.t*1.3+p.id)>0.6)p.fl=Math.sin(S.t*0.7+p.id)>0?1:-1;ctx.save();ctx.translate(X,Y+TH*0.12+hop);if(p.fade)ctx.globalAlpha=Math.max(0,1-p.fade);
 ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,-dw*0.04,dw*0.38,dw*0.15,0,0,7);ctx.fill();
 if(p.fl>0)ctx.scale(-1,1); // forward = -x
 ctx.save();const fr=p.mv?(Math.floor(p.ph/6.2832*8)%8+8)%8:M[4];
 const working=!p.mv&&(p.act=='kerta medį'||p.act=='skaldo akmenį'||p.act=='skaldo uolą'||p.act=='pjauna javus'||p.act=='stato'||p.act=='griauna');let tA=0;
 ctx.save();if(p.bk)ctx.scale(-1,1);ctx.drawImage(at,fr*M[0],0,M[0],M[1],-M[2]/VK,-M[3]/VK,fw,fh);ctx.restore();
 ctx.translate(0,-tH+P.hip);
 if(working){const ph=(S.t*((p.act=='stato'||p.act=='griauna')?1.6:1.1)+(p.tgt&&p.tgt.ph||p.id*0.37))%1;tA=(p.act=='stato'||p.act=='griauna')?swingTool(ph,-1.3,0.55):swingTool(ph,-2.1,0.45);}
 // carried loads: held in the arms in front of the body (no shoulder blob)
 if(p.carry&&!p.ch){const k=p.carry.k,L0=tH,cx=-P.w*0.12,cy=-P.hip+L0*0.5;ctx.lineWidth=L0*0.012;
  if(k=='a'){ctx.fillStyle='#8d8a84';ctx.strokeStyle='#55524d';for(const[a,b,r]of[[-0.07,0,0.07],[0.03,0.01,0.06],[-0.02,-0.06,0.055]]){ctx.beginPath();ctx.ellipse(cx+a*L0,cy+b*L0,r*L0,r*L0*0.75,0.4,0,7);ctx.fill();ctx.stroke();}}
  else if(k=='m'||k=='woodh'){for(let i=0;i<3;i++){const yy=cy-L0*0.03+i*L0*0.045;ctx.fillStyle='#8a5a2e';ctx.strokeStyle='#4a2e14';ctx.beginPath();ctx.rect(cx-L0*0.17,yy,L0*0.3,L0*0.04);ctx.fill();ctx.stroke();ctx.fillStyle='#d9b07a';ctx.beginPath();ctx.ellipse(cx-L0*0.17,yy+L0*0.02,L0*0.012,L0*0.02,0,0,7);ctx.fill();}}
  else if(k=='l'){ctx.save();ctx.translate(cx,cy-L0*0.12);ctx.rotate(-0.35);ctx.fillStyle='#c79a5e';ctx.strokeStyle='#6b4a26';for(let i=0;i<2;i++){ctx.beginPath();ctx.rect(-L0*0.32,i*L0*0.035,L0*0.6,L0*0.03);ctx.fill();ctx.stroke();}ctx.restore();}
  else if(k=='zuvis'){ctx.strokeStyle='#5b4a30';ctx.beginPath();ctx.moveTo(cx,cy-L0*0.04);ctx.lineTo(cx,cy+L0*0.04);ctx.stroke();ctx.fillStyle='#9fb3bd';ctx.strokeStyle='#4d5d66';for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx+(i-1)*L0*0.05,cy+L0*0.1,L0*0.022,L0*0.07,0,0,7);ctx.fill();ctx.stroke();}}
  else if(k=='mesa'&&!(bId(p.job)&&bId(p.job).t=='gyvuliai')){const da=img('v_elnias_sw'),DM=VM.elnias_sw;if(da){ctx.save();ctx.translate(cx,cy+L0*0.02);ctx.rotate(Math.PI/2);ctx.scale(0.55,0.55);ctx.drawImage(da,DM[4]*DM[0],0,DM[0],DM[1],-DM[2]/VK,-DM[3]/VK*0.6,DM[0]/VK,DM[1]/VK);ctx.restore();}}
  else if(k=='food'&&p.sex=='f'||k=='v'&&p.sex=='f'){ctx.fillStyle='#a87a42';ctx.strokeStyle='#5d4020';ctx.beginPath();ctx.moveTo(cx-L0*0.11,cy);ctx.lineTo(cx+L0*0.11,cy);ctx.lineTo(cx+L0*0.08,cy+L0*0.13);ctx.lineTo(cx-L0*0.08,cy+L0*0.13);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,L0*0.1,Math.PI,0);ctx.stroke();ctx.fillStyle=k=='v'?'#f2eee2':'#c8783a';ctx.beginPath();ctx.ellipse(cx,cy,L0*0.1,L0*0.025,0,0,7);ctx.fill();}
  else{const c={g:'#d4b26a',mi:'#efe9da',d:'#b5763a',v:'#f2eee2',mesa:'#a8443a',food:'#c8b089'}[k]||'#c8b089';ctx.fillStyle=c;ctx.strokeStyle='#5d4a30';ctx.beginPath();ctx.ellipse(cx,cy+L0*0.04,L0*0.09,L0*0.11,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(cx-L0*0.03,cy-L0*0.06);ctx.lineTo(cx+L0*0.03,cy-L0*0.09);ctx.stroke();}}
 const sh=[-P.w*0.16,-P.hip+P.h*0.36];// shoulder (forward = -x)
 const L=P.h;
 if(working){ctx.save();ctx.translate(sh[0],sh[1]);ctx.rotate(-tA);// tool pointing forward(-x) rotated
  const len=(p.act=='stato'||p.act=='griauna')?L*0.4:L*0.5;ctx.strokeStyle='#6b4423';ctx.lineWidth=L*0.03;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-len,0);ctx.stroke();
  // hands
  ctx.strokeStyle='#6e4a2c';ctx.lineWidth=L*0.045;ctx.beginPath();ctx.moveTo(L*0.04,0);ctx.lineTo(-len*0.32,0);ctx.stroke();ctx.fillStyle='#d9a882';ctx.beginPath();ctx.arc(-len*0.34,0,L*0.026,0,7);ctx.fill();ctx.strokeStyle='#6b4423';ctx.lineWidth=L*0.03;
  if(p.act=='kerta medį'){ctx.fillStyle=S.era<5?'#6e6357':'#9aa3a8';ctx.strokeStyle=S.era<5?'#2f2a24':'#4a4f52';ctx.lineWidth=L*0.008;ctx.beginPath();ctx.moveTo(-len*0.98,-L*0.015);ctx.lineTo(-len*0.9,L*0.075);ctx.quadraticCurveTo(-len*1.03,L*0.09,-len*1.12,L*0.07);ctx.lineTo(-len*1.08,-L*0.01);ctx.closePath();ctx.fill();ctx.stroke();}
  else if(p.act=='pjauna javus'){ctx.strokeStyle=S.era<5?'#7a6e60':'#b8c0c4';ctx.lineWidth=L*0.016;ctx.beginPath();ctx.moveTo(-len*1.0,0);ctx.quadraticCurveTo(-len*0.9,L*0.12,-len*0.55,L*0.16);ctx.stroke();}
  else if(p.act=='skaldo akmenį'||p.act=='skaldo uolą'){ctx.strokeStyle='#7d858a';ctx.lineWidth=L*0.022;ctx.beginPath();ctx.moveTo(-len*0.98,-L*0.09);ctx.quadraticCurveTo(-len*1.06,0,-len*0.98,L*0.09);ctx.stroke();}
  else{ctx.fillStyle='#8a9196';ctx.strokeStyle='#3c4044';ctx.lineWidth=L*0.008;ctx.fillRect(-len*1.08,-L*0.07,L*0.09,L*0.14);ctx.strokeRect(-len*1.08,-L*0.07,L*0.09,L*0.14);}
  ctx.restore();}
 if(!p.mv&&p.act=='žvejoja'){const ph=((S.t-(p.cast||0))%7)/7;const ra=ph<0.08?-1.2+ph/0.08*1.6:0.4+Math.sin(S.t*2)*0.03;
  ctx.save();ctx.translate(sh[0],sh[1]);ctx.rotate(-ra);ctx.strokeStyle='#c99a5b';ctx.lineWidth=L*0.022;ctx.beginPath();ctx.moveTo(L*0.05,0);ctx.lineTo(-L*0.75,0);ctx.stroke();ctx.strokeStyle='#4a3018';ctx.lineWidth=L*0.008;ctx.stroke();
   ctx.fillStyle='#e0b48c';ctx.beginPath();ctx.arc(-L*0.08,0,L*0.025,0,7);ctx.fill();
   const tip=[-L*0.75,0];ctx.restore();
   const tx=sh[0]+tip[0]*Math.cos(ra)+0,ty=sh[1]+tip[0]*Math.sin(-ra);
   if(ph>=0.08){const bx=-L*1.15,by=-P.hip+P.h*0.92+Math.sin(S.t*3)*L*0.01;ctx.strokeStyle='rgba(235,235,235,.8)';ctx.lineWidth=L*0.005;ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo((tx+bx)/2,by-L*0.05,bx,by);ctx.stroke();ctx.fillStyle='#d23a2a';ctx.beginPath();ctx.arc(bx,by,L*0.018,0,7);ctx.fill();}}
 if(!p.mv&&p.act=='šaudo iš lanko'){ctx.save();ctx.translate(sh[0]-L*0.16,sh[1]+L*0.03);ctx.strokeStyle='#5b3a1c';ctx.lineWidth=L*0.017;ctx.beginPath();ctx.arc(L*0.12,0,L*0.2,Math.PI*0.68,Math.PI*1.32);ctx.stroke();
  const ph=((S.t-(p.shot||0))%1.2)/1.2;const pull=ph<0.6?ph/0.6:0;ctx.strokeStyle='#ddd';ctx.lineWidth=L*0.004;ctx.beginPath();const ex=L*0.12+L*0.2*Math.cos(Math.PI*0.68),ey=L*0.2*Math.sin(Math.PI*0.68);ctx.moveTo(ex,ey);ctx.lineTo(ex+L*0.12*pull,0);ctx.lineTo(ex,-ey);ctx.stroke();
  if(ph<0.6){ctx.strokeStyle='#8a6a3a';ctx.lineWidth=L*0.008;ctx.beginPath();ctx.moveTo(ex+L*0.12*pull,0);ctx.lineTo(ex+L*0.12*pull-L*0.3,0);ctx.stroke();}
  ctx.fillStyle='#e0b48c';ctx.beginPath();ctx.arc(-L*0.08,0,L*0.025,0,7);ctx.fill();ctx.restore();
  if(ph>=0.6&&p.tgt){const f=(ph-0.6)/0.4,[DX,DY]=wpos(p.tgt.x,p.tgt.y);const sx=X,sy=Y-h*0.6,ex2=DX,ey2=DY-TH*0.1;FX.push(()=>{const ax=sx+(ex2-sx)*f,ay=sy+(ey2-sy)*f-Math.sin(f*Math.PI)*12,an=Math.atan2(ey2-sy,ex2-sx);ctx.save();ctx.translate(ax,ay);ctx.rotate(an);ctx.strokeStyle='#6b4a2a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(4,0);ctx.stroke();ctx.restore();});}}
 if(p.wb||p.bucket||(!p.mv&&p.act=='semia vandenį')){const bx=-P.w*0.32,by=-P.hip+P.h*0.62+(p.mv?Math.sin(p.ph||0)*L*0.01:0);ctx.strokeStyle='#4a3420';ctx.lineWidth=L*0.008;ctx.beginPath();ctx.arc(bx,by-L*0.02,L*0.05,Math.PI,0);ctx.stroke();ctx.fillStyle='#7a5532';ctx.beginPath();ctx.moveTo(bx-L*0.05,by-L*0.02);ctx.lineTo(bx+L*0.05,by-L*0.02);ctx.lineTo(bx+L*0.04,by+L*0.07);ctx.lineTo(bx-L*0.04,by+L*0.07);ctx.closePath();ctx.fill();ctx.strokeStyle='#3e2a16';ctx.stroke();if(p.wb){ctx.fillStyle='#6fb6d6';ctx.beginPath();ctx.ellipse(bx,by-L*0.02,L*0.048,L*0.012,0,0,7);ctx.fill();}}
 if(!p.mv&&(p.act=='sėja grūdus'||p.act=='šeria gyvulius')){const ph=(S.t*0.9+p.id*0.3)%1;ctx.save();ctx.translate(sh[0],sh[1]);ctx.rotate(-(ph<0.5?-0.4+ph*2:0.6-(ph-0.5)*2));ctx.fillStyle='#e0b48c';ctx.beginPath();ctx.arc(-L*0.18,0,L*0.025,0,7);ctx.fill();ctx.restore();
  if(ph>0.45&&ph<0.85){const f=(ph-0.45)/0.4;ctx.fillStyle=p.act=='sėja grūdus'?'#e8d27a':'#b9c46a';for(let i=0;i<5;i++)ctx.fillRect(sh[0]-L*0.25-f*L*0.25-i*L*0.02,sh[1]+f*L*0.35+i*L*0.015,L*0.012,L*0.012);}}
 ctx.restore();ctx.restore();
 if(p.sick&&!p.in){ctx.font='12px system-ui';ctx.textAlign='center';ctx.fillText('🤒',X,Y-h);}}

function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;$('toasts').appendChild(e);setTimeout(()=>e.classList.add('out'),2600);setTimeout(()=>e.remove(),3200);while($('toasts').children.length>3)$('toasts').firstChild.remove();}
function fmt(n){return Math.floor(n);}
function costTxt(c){return [c.m?`🪵${c.m}`:'',c.a?`🪨${c.a}`:'',c.l?`🪚${c.l}`:'',c.k?`🦌${c.k}`:''].filter(Boolean).join(' ');}
const TABS=[['namai','🏠 Namai'],['maistas','🍖 Maistas'],['zaliavos','🪵 Žaliavos'],['gamyba','⚒ Gamyba'],['kita','✨ Kita']];
function tabOf(t){if(isH(t))return 'namai';const c=B[t].cat;if(t=='titnagas'||t=='puodzerija'||t=='lentpjuve'||t=='malunas'||t=='kepykla'||t=='dziovykla')return 'gamyba';if(c=='maistas')return 'maistas';if(c=='akmuo'||c=='mediena')return 'zaliavos';return 'kita';}
let curTab='namai';
function menuList(){if(S&&S.era<5)return NORDER.filter(t=>B[t].era<=S.era);return [...ORDER,'kelias'];}
function buildMenu(){const m=$('buildbar'),tb=$('btabs');m.innerHTML='';const L=menuList(),tab=t=>t=='kelias'?'kita':tabOf(t);
 const used=TABS.filter(([k])=>L.some(t=>tab(t)==k));if(!used.some(([k])=>k==curTab))curTab=used[0][0];
 tb.innerHTML='';for(const[k,l]of used){const e=document.createElement('button');e.className='btab'+(k==curTab?' on':'');e.textContent=l;e.onclick=()=>{curTab=k;buildMenu();};tb.appendChild(e);}
 for(const t of L){if(tab(t)!=curTab)continue;if(t=='kelias'){mkRoadCard(m);continue;}const d=B[t];const e=document.createElement('button');e.className='bcard';e.dataset.t=t;
 e.innerHTML=`<img src="img/${d.spr[0]}.webp"><b>${d.n}</b><small>${costTxt(d.cost[0])}</small>`;e.onclick=()=>startBuild(t);m.appendChild(e);}}
function mkRoadCard(m){const e=document.createElement('button');e.className='bcard';e.dataset.t='kelias';if(!cob)mkCob();e.innerHTML=`<img src="${cob.toDataURL()}"><b>Grįstas kelias</b><small>🪨1 / langelis</small>`;e.onclick=startRoad;m.appendChild(e);}
let roadMode=null;
function startRoad(){closePop();endBuild();roadMode={del:false};$('buildbar').classList.add('hidden');$('buildmode').classList.remove('hidden');updRoad();}
function updRoad(){$('bmText').textContent=roadMode.del?`🧹 Kelio šalinimas: bakstelėkite arba braukite pirštu per grindinį – grąžinama pusė akmens už langelį (turite ${fmt(S.res.a)}).`:`🪨 Kelio tiesimas: bakstelėkite arba braukite pirštu – 1 akmuo už langelį (turite ${fmt(S.res.a)}). Žmonės keliu eina ~1,6 karto greičiau. Žemėlapį judinkite dviem pirštais.`;$('bmNo').textContent='✔ Baigti';$('bmOk').textContent=roadMode.del?'🪨 Tiesti kelią':'🧹 Šalinti kelią';$('bmOk').disabled=false;}
function endRoad(){roadMode=null;$('bmNo').textContent='✕ Atšaukti';$('bmOk').textContent='✔ Statyti';$('buildbar').classList.remove('hidden');$('buildmode').classList.add('hidden');save();}
function roadAt(tx,ty){tx|=0;ty|=0;if(!inM(tx,ty))return;const i=idx(tx,ty);
 if(roadMode.del){if(RD.has(i)){RD.delete(i);S.roads=[...RD];S.rdRef=(S.rdRef||0)+0.5;const g=Math.floor(S.rdRef);if(g>0){S.rdRef-=g;S.res.a+=g;}}return;}
 if(RD.has(i))return;if(!S.fog[i]){roadMode.err='Ši vieta dar neatrasta';return;}const te=terr(tx,ty);if(!'gpf'.includes(te)||BR.has(i)){roadMode.err='Čia kelio nutiesti negalima';return;}if(occ[i]){roadMode.err='Čia stovi pastatas';return;}const o=objAt[i];if(o&&o.k=='uola'){roadMode.err='Trukdo didelė uola';return;}
 if(S.res.a<1){roadMode.err='Trūksta akmens (reikia 1 🪨)';return;}S.res.a-=1;RD.add(i);S.roads=[...RD];if(o){for(const p of S.p)if(p.tgt===o||(p.res&&p.res.o===o)||(p.tgt&&p.tgt.x===o.x&&p.tgt.y===o.y))abort(p);removeObj(o);}}
function startBuild(t){closePop();if(roadMode)endRoad();build={t,x:null,y:null};$('buildbar').classList.add('hidden');$('buildmode').classList.remove('hidden');
 const[a,b]=w2t(cam.x,cam.y);build.x=Math.floor(a)-(B[t].size[0]>>1);build.y=Math.floor(b)-(B[t].size[0]>>1);updBuild();}
function updBuild(){const e=canPlace(build.t,build.x,build.y);$('bmText').textContent=e?('✖ '+e):`✔ ${B[build.t].n} – ${costTxt(B[build.t].cost[0])}. Bakstelėkite kitą vietą arba patvirtinkite.`;$('bmOk').disabled=!!e;}
function endBuild(){if(roadMode){endRoad();return;}build=null;$('buildbar').classList.remove('hidden');$('buildmode').classList.add('hidden');}
$('bmOk').onclick=()=>{if(roadMode){roadMode.del=!roadMode.del;updRoad();return;}if(!build)return;const e=canPlace(build.t,build.x,build.y);if(e){toast(e);return;}clearPlot(build.t,build.x,build.y);addB(build.t,build.x,build.y,0);toast('Statybvietė pažymėta – gyventojai patys atneš medžiagas ir pastatys');save();endBuild();};
$('bmNo').onclick=endBuild;
function jobTitle(p){if(p.ch)return 'vaikas';if(p.sick)return 'serga';if(p.fire)return 'gesina gaisrą';if(p.role)return 'statybininkas';if(p.help)return 'padeda statyti';const j=bId(p.job);if(j)return {malkine:'medkirtys',medziotojas:'medžiotojas',zvejas:'žvejys',zolininke:p.sex=='f'?'žolininkė':'žolininkas',skaldykla:'akmenskaldys',lentpjuve:'lentpjovys',ukis:p.sex=='f'?'sėjėja':'pjovėjas',kstovykla:'medžiotojas',zvejyba:'žvejys',titnagas:'titnago meistras',aptvaras:'ožkų piemenė',javai:'javų augintoja',gyvuliai:p.sex=='f'?'gyvulių šėrėja':'skerdikas',malunas:'malūnininkas',kepykla:'kepėja'}[j.t];if(p.sg)return 'akmenų rinkėjas';if(S.era<5)return p.sex=='f'?'rinkėja':'medžiotojas';return p.sex=='f'?'šeimininkė':'nešikas';}
let popT=0;function popGuard(){return performance.now()-popT<600;}
function openPop(b){if(sel!==b.id)popT=performance.now();sel=b.id;renderPop();$('pop').classList.remove('hidden');}
function closePop(){sel=null;$('pop').classList.add('hidden');}
function renderPop(){const b=bId(sel);if(!b){closePop();return;}const d=B[b.t];let h=`<div class="ph"><img src="img/${d.spr[Math.max(0,b.lv-1)]}.webp"><div><h3>${d.n}</h3><div class="sub">${d.k?(b.lv?'Klajoklių pastatas':'Statoma'):b.lv?`${b.lv} lygis iš 5 – ${d.lv[b.lv-1]}`:'Statoma'}</div></div><button class="x" id="popX">✕</button></div>`;
 if(b.site){const s=b.site;h+=`<div class="row">🔨 ${b.st=='upg'?'Tobulinama į '+s.to+' lygį':'Statoma'}: ${Math.floor(100*s.prog/s.tot)}%</div><div class="row">Atnešta: 🪵${s.got.m}/${s.need.m}${s.need.a?` 🪨${s.got.a}/${s.need.a}`:''}${s.need.l?` 🪚${s.got.l}/${s.need.l}`:''}${s.need.k?` 🦌${s.got.k}/${s.need.k}`:''}</div>`;
  const bl=S.p.find(p=>p.role==b.id);h+=`<div class="row">${bl?'Statybininkas: '+bl.nm:'⚠ Nėra laisvo vyro statybininko'}</div>`;
  const miss=[];if(woodTot()<s.need.m-s.got.m-s.inb.m)miss.push('malkų');if(S.res.a<s.need.a-s.got.a-s.inb.a)miss.push('akmens');if(S.res.l<(s.need.l||0)-(s.got.l||0)-(s.inb.l||0))miss.push('lentų (reikia lentpjūvės)');if(miss.length)h+=`<div class="row warn">Sandėlyje trūksta ${miss.join(' ir ')}</div>`;}
 if(isH(b.t)&&b.lv){const r=S.p.filter(p=>p.home==b.id);h+=`<div class="row">👪 Gyventojai: ${r.length}/${d.cap[b.lv-1]}</div><div class="fam">${r.map(p=>`<span>${p.ch?'🧒':p.sex=='m'?'👨':'👩'} ${p.nm} – ${jobTitle(p)}</span>`).join('')||'<i>Tuščias – netrukus atsikraustys šeima</i>'}</div>`;
  h+=`<div class="row">${b.hap>=70?'😊':b.hap>=45?'😐':'☹️'} Pasitenkinimas: ${Math.round(b.hap)}%</div><div class="needs"><span class="${b.pan>=1?'ok':'no'}">🍖 Maistas namuose: ${fmt(b.pan)}</span><span class="${b.wood>0?'ok':'no'}">🪵 Malkos šildymui: ${b.wood.toFixed(1)}</span><span class="${b.well?'ok':'no'}">💧 Šulinys netoli</span><span class="${b.herb?'ok':'no'}">🌿 Žolininkė netoli</span>${b.lv>=3?`<span class="${b.cl>0?'ok':'no'}">👕 Drabužiai: ${(b.cl||0).toFixed(1)}</span>`:''}</div>${b.lv>=3&&!(b.cl>0)?`<div class="row warn">Nuo 3 lygio šeimai reikia drabužių – moterys juos siuva iš vilnos (🧶 ${fmt(S.res.v)} sandėlyje). Be jų pasitenkinimas mažesnis.</div>`:''}`;}
 if(d.wk&&b.lv){const w=S.p.filter(p=>p.job==b.id);h+=`<div class="row">👷 Darbininkai: ${w.length}/${d.wk[b.lv-1]}</div><div class="fam">${w.map(p=>`<span>${p.sex=='m'?'👨':'👩'} ${p.nm} – ${p.sick?'serga':p.act||'dirba'}</span>`).join('')||'<i>Nėra laisvų gyventojų – pastatas stovi tuščias</i>'}</div>`;}
 if(b.t=='malkine'&&b.lv)h+=`<div class="row">🪵 Malkų rietuvėje: <b>${Math.floor(b.mk||0)}/${mkCap(b)}</b> – iš čia malkų pasiima namai, statybos, lentpjūvė ir kepykla</div>`;
 if(b.t=='ukis'&&b.lv&&b.f){const f=b.f;h+=`<div class="row">🌾 Laukas: ${f.st==0?'sėjama '+Math.round(f.sow*100)+'%':f.st==1?'javai auga '+Math.round(f.g*100)+'%':'prinoko – pjaunama '+Math.round(f.cut*100)+'%'}</div><div class="row">Derlius: ~${10+5*b.lv} 🌾 grūdų</div>`;}
 if(b.t=='gyvuliai'&&b.lv&&b.herd)h+=`<div class="row">🐄 Karvės: ${b.herd.c} · 🐑 Avys: ${b.herd.s} (telpa ${herdCap(b)})</div><div class="row">🧶 Vilnos tvarte: ${Math.floor(b.vb||0)} · skerdžiama, kai gyvulių daugiau nei ${3+b.lv}</div>`;
 if(PROC[b.t]&&b.lv){const P=PROC[b.t];h+=`<div class="row">⚙ Gamyba: ${Object.entries(P.inp).map(([k,n])=>RI[k]+n).join(' + ')} → ${Object.entries(P.out).map(([k,n])=>RI[k]+(n+(b.lv>=4?1:0))).join('')}</div>`;}
 if(b.t=='skaldykla'&&b.lv)h+=`<div class="row">⛏ Kiekvienas darbininkas atneša ${3+b.lv} 🪨 per ciklą</div>`;
 if(b.t=='malkine'&&b.lv)h+=`<div class="row ${b.lowW?'warn':''}">🌲 Medžių aplink: ${b.nt??nearTrees(b)}${b.lowW?' – Aplink baigiasi miškas! Medkirčiai sodina naujus, kertama toliau.':''}</div>`;
 if(b.t=='sandelis'&&b.lv)h+=`<div class="row">Talpa: ${d.scap[b.lv-1]} kiekvieno ištekliaus</div>`;
 if(b.t=='sulinys'&&b.lv)h+=`<div class="row">Aptarnauja namus ${d.rad[b.lv-1]} langelių spinduliu</div>`;
 if(b.fire)h+=`<div class="row warn">🔥 Dega! Gyventojai neša vandenį.</div>`;
 h+=`<div class="desc">${d.d}</div>`;
 if(d.k&&b.lv&&d.nx&&b.st=='ok'){const e=canUpgrade(b);const nd=B[d.nx];h+=`<button class="up" id="popUp" ${e?'disabled':''}>⬆ Perstatyti į: ${nd.lv[0]}<br><small>${costTxt(nd.cost[0])}${nd.cap?` · ${nd.cap[0]} gyventojai`:''}${e?' · '+e:''}</small></button>`;}
 else if(d.k){}
 else if(b.lv&&b.lv<5&&b.st=='ok'){const e=canUpgrade(b);h+=`<button class="up" id="popUp" ${e?'disabled':''}>⬆ Tobulinti į ${b.lv+1} lygį: ${d.lv[b.lv]}<br><small>${costTxt(d.cost[b.lv])}${d.cap?` · ${d.cap[b.lv]} gyventojai`:''}${d.wk?` · ${d.wk[b.lv]} darbininkai`:''}${e?' · '+e:''}</small></button>`;}
 else if(b.lv==5)h+=`<div class="row">⭐ Aukščiausias lygis</div>`;
 if(b.site)h+=`${siteOK(b)?'':'<div class="row warn">⚠ Statybininkai negali prieiti prie statybvietės</div>'}<div class="demorow"><button class="demo" id="popCancel">✖ Atšaukti ${b.lv?'tobulinimą':'statybą'}</button></div>`;
 if(b.st=='demo')h+=`<div class="row warn">⛏ Griaunama… liko ${Math.max(0,Math.ceil(b.demo))} darbo s.</div>`;
 else if(b.st=='ok'&&!b.fire)h+=`<div class="demorow"><button class="demo" id="popDemo" title="Grąžins apie pusę medžiagų į sandėlį">🔨 Griauti</button></div>`;
 $('pop').innerHTML=h;$('popX').onclick=closePop;const u=$('popUp');if(u)u.onclick=()=>{if(popGuard())return;upgrade(b);renderPop();};const cn=$('popCancel');if(cn)cn.onclick=e=>{e.preventDefault();e.stopPropagation();if(popGuard())return;const g=b.site.got;if(confirm(`Atšaukti ${b.lv?'tobulinimą':'statybą'}?`+(sum(g)?`\n\nAtneštos medžiagos bus grąžintos į sandėlį: ${costTxt(g)}`:''))){cancelSite(b);if(bId(b.id))renderPop();}};const dm=$('popDemo');if(dm)dm.onclick=e=>{e.preventDefault();e.stopPropagation();if(popGuard())return;const r=S.p.filter(p=>p.home==b.id).length;let free=0;for(const q of S.b)if(q!==b&&isH(q.t)&&q.lv&&q.st!='demo')free+=Math.max(0,hcap(q)-S.p.filter(z=>z.home==q.id).length);
  if(confirm(`Ar tikrai griauti „${d.n}“?`+(r?(free>=r?`\n\n⚠ Šeima liks be namų! Gyventojai (${r}) persikels į kitą laisvą namą.`:`\n\n⚠ Šeima liks be namų! Kituose namuose vietos yra tik ${free} iš ${r} – kiti gyvens lauke, kol atsiras vietos.`):'')+'\n\nBus grąžinta apie pusė medžiagų.')){demolish(b);renderPop();}};}
function renderPrio(){const l=$('prioList');l.innerHTML='';S.prio.forEach((c,i)=>{const n=S.p.filter(p=>catOf(p)==c).length;const e=document.createElement('div');e.className='prow';e.innerHTML=`<b>${i+1}.</b> ${CATN[c]} <small>(${n} dirba)</small><span><button data-i="${i}" data-d="-1">▲</button><button data-i="${i}" data-d="1">▼</button></span>`;l.appendChild(e);});
 l.querySelectorAll('button').forEach(bt=>bt.onclick=()=>{const i=+bt.dataset.i,j=i+ +bt.dataset.d;if(j<0||j>=S.prio.length)return;[S.prio[i],S.prio[j]]=[S.prio[j],S.prio[i]];renderPrio();save();});}
$('btnPrio').onclick=()=>{renderPrio();$('prio').classList.toggle('hidden');};$('prioX').onclick=()=>$('prio').classList.add('hidden');
$('btnMenu').onclick=()=>$('menu').classList.toggle('hidden');$('menuX').onclick=()=>$('menu').classList.add('hidden');
$('btnNew').onclick=()=>{if(confirm('Pradėti naują žaidimą? Dabartinis miestas bus ištrintas.')){localStorage.removeItem('miestas_save');newGame();centerStart();buildMenu();$('menu').classList.add('hidden');save();}};
function hint(){const has=t=>S.b.some(b=>b.t==t);let h='';
 if(S.era<5){eraBar();if(S.b.some(b=>b.fire))h='🔥 Gaisras! Gyventojai neša vandenį.';else if(S.hint.full&&S.t-S.hint.full<20)h='📦 Prie laužo nebėra vietos atsargoms'+(S.era>=4?' – pastatykite puodžių dirbtuvę.':'.');else if(S.p.some(p=>!p.home&&!p.ch))h='🛖 Yra benamių – pastatykite '+(S.era>=3?'žeminę':S.era>=2?'pastogę ar palapinę':'pastogę')+'.';
  else if(S.era==2&&!has('kstovykla'))h='🏹 Pastatykite medžiotojų stovyklą – mėsa ir kailiai palapinėms.';else if(S.era==2&&!has('dziovykla'))h='🥩 Džiovykla – maistas nebegenda.';else if(S.era==3&&!has('titnagas'))h='🪓 Titnago dirbtuvė – visi dirba greičiau.';else if(S.era==4&&!has('javai'))h='🌾 Pasėkite javų lopinėlį – reikia grūdų.';
  $('hint').textContent=h;$('hint').classList.toggle('hidden',!h);return;}
 $('era').classList.add('hidden');
 if(S.b.some(b=>b.fire))h='🔥 Gaisras! Gyventojai patys neša vandenį iš artimiausio šulinio.';
 else if(S.hint.full&&S.t-S.hint.full<20)h='📦 Sandėlis pilnas – patobulinkite jį arba pastatykite dar vieną.';
 else if(!has('malkine'))h='🪓 Pastatykite malkinę – gyventojai patys kirs medžius.';
 else if(!has('medziotojas')&&!has('zvejas'))h='🍖 Pastatykite medžiotojo namelį arba žvejo trobelę prie upės – reikės maisto.';
 else if(!has('sulinys'))h='💧 Pastatykite šulinį – namai šalia jo laimingesni, o iš jo gesinami gaisrai.';
 else if(food()<5)h='⚠ Baigiasi maistas – reikia daugiau medžiotojų ar žvejų (prioritetai).';
 else if(S.p.some(p=>!p.home&&!p.ch))h='🏠 Yra benamių – pastatykite ar patobulinkite namą.';
 else if(S.b.some(b=>b.site&&(b.site.need.l||0)>(b.site.got.l||0))&&!has('lentpjuve')&&S.res.l<1)h='🪚 Tobulinimui nuo 3 lygio reikia lentų – pastatykite lentpjūvę.';
 else if(S.b.some(b=>b.site)&&!S.p.some(p=>p.role))h='🔨 Nėra laisvo vyro statybai – pakeiskite prioritetus arba palaukite.';
 else if(S.p.some(p=>p.sick)&&!has('zolininke'))h='🤒 Kažkas serga – žolininkės trobelė pagydytų greičiau.';
 else if(S.b.some(b=>b.t=='namas'&&b.lv&&!S.p.some(p=>p.home==b.id)))h='🏠 Į tuščią namą netrukus atsikraustys nauja šeima.';
 else if(!S.b.some(b=>b.t=='namas'&&b.lv>1))h='⬆ Bakstelėkite pastatą, kad jį patobulintumėte.';
 $('hint').textContent=h;$('hint').classList.toggle('hidden',!h);}
function eraBar(){const e=$('era');const r=eraReq(S.era);e.innerHTML=`<b>🔥 ${S.era} lygis iš 5 · ${ERA[S.era].nm}</b><span>Kitam lygiui: ${r.map(q=>`<i class="${q.h>=q.n?'ok':''}">${q.ic} ${fmt(Math.min(q.h,q.n))}/${q.n} ${q.l}</i>`).join(' ')}</span>`;e.classList.remove('hidden');}
function hud(){const c=cap();$('vM').textContent=fmt(woodTot());
 for(const k of['u','k','l','g','mi','d','v']){const e=$('v_'+k);if(e){e.textContent=fmt(S.res[k]);e.parentNode.style.display=(S.res[k]>0||S.b.some(b=>({l:'lentpjuve',g:'ukis',mi:'malunas',d:'kepykla',v:'gyvuliai'})[k]==b.t))?'':'none';}}$('vA').textContent=fmt(S.res.a);$('vMe').textContent=fmt(S.res.mesa);$('vZ').textContent=fmt(S.res.zuvis);$('vCap').textContent=c;
 const ad=S.p.filter(p=>!p.ch);$('vV').textContent=ad.filter(p=>p.sex=='m').length;$('vF').textContent=ad.filter(p=>p.sex=='f').length;$('vK').textContent=S.p.filter(p=>p.ch).length;$('vDay').textContent=Math.floor(S.t/DAY)+1;
 const hs=S.b.filter(b=>isH(b.t)&&b.lv);const hp=hs.length?hs.reduce((a,b)=>a+b.hap,0)/hs.length:0;$('vH').textContent=(hp>=70?'😊':hp>=45?'😐':'☹️')+Math.round(hp)+'%';}
// ---------- input ----------
const ptr=new Map();let drag=null,pinch=null,moved=false;
function roadPt(x,y){const[X,Y]=s2w(x,y);const[tx,ty]=w2t(X,Y);roadMode.err='';roadAt(tx,ty);if(roadMode.err&&!roadMode.del&&S.t-(roadMode.et||-9)>1.5){roadMode.et=S.t;toast(roadMode.err);}updRoad();}
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=false;if(roadMode&&ptr.size==1){roadMode.paint=1;roadPt(e.clientX,e.clientY);}if(roadMode&&ptr.size>1)roadMode.paint=0;
 if(ptr.size==1)drag={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y};
 if(ptr.size==2){const[a,b]=[...ptr.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.z,mx:(a.x+b.x)/2,my:(a.y+b.y)/2,cx:cam.x,cy:cam.y};drag=null;moved=true;}});
cv.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId))return;ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinch&&ptr.size>=2){const[a,b]=[...ptr.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  const wx=(pinch.mx-W/2)/pinch.z+pinch.cx,wy=(pinch.my-H/2)/pinch.z+pinch.cy;cam.z=Math.max(0.2,Math.min(1.3,pinch.z*d/pinch.d));cam.x=wx-(mx-W/2)/cam.z;cam.y=wy-(my-H/2)/cam.z;clampCam();}
 else if(roadMode&&roadMode.paint&&ptr.size==1){roadPt(e.clientX,e.clientY);moved=true;}
 else if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>8)moved=true;if(moved){cam.x=drag.cx-dx/cam.z;cam.y=drag.cy-dy/cam.z;clampCam();}}});
function up(e){if(!ptr.has(e.pointerId))return;ptr.delete(e.pointerId);if(roadMode){if(ptr.size==0)roadMode.paint=0;if(ptr.size==0){drag=null;pinch=null;return;}}if(ptr.size<2)pinch=null;if(ptr.size==0){if(!moved&&drag)tap(e.clientX,e.clientY);drag=null;}
 else if(ptr.size==1){const[a]=[...ptr.values()];drag={x:a.x,y:a.y,cx:cam.x,cy:cam.y};}}
cv.addEventListener('pointerup',up);cv.addEventListener('touchend',e=>{if(e.cancelable)e.preventDefault();},{passive:false});cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();const[wx,wy]=s2w(e.clientX,e.clientY);cam.z*=Math.exp(-e.deltaY*0.0015);clampCam();cam.x=wx-(e.clientX-W/2)/cam.z;cam.y=wy-(e.clientY-H/2)/cam.z;clampCam();},{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());
function tap(sx,sy){const[X,Y]=s2w(sx,sy);const[tx,ty]=w2t(X,Y);
 if(build){const s=B[build.t].size[0];build.x=Math.floor(tx)-(s>>1);build.y=Math.floor(ty)-(s>>1);updBuild();return;}
 let hit=null;const list=[...S.b].sort((a,b)=>(b.x+b.y+2*b.s)-(a.x+a.y+2*a.s));
 for(const b of list){const d=b.st=='site'?{x:wpos(b.x,b.y)[0]-TW*b.s/2,y:wpos(b.x,b.y)[1]-TH*b.s,w:TW*b.s,h:TH*b.s*2}:spriteDims(b,b.lv);if(!d)continue;if(X>d.x+d.w*0.12&&X<d.x+d.w*0.88&&Y>d.y+d.h*0.1&&Y<d.y+d.h){hit=b;break;}}
 if(!hit&&inM(tx|0,ty|0)){const o=occ[idx(tx|0,ty|0)];if(o)hit=bId(o);}
 if(hit)openPop(hit);else closePop();}
// ---------- loop ----------
let speed=1,paused=false;
function frame(t){const dt=Math.min(0.1,(t-lastT)/1000||0.016);lastT=t;fps=fps*0.95+0.05/Math.max(dt,1e-3);
 if(!paused){let g=dt*speed;while(g>0){const s=Math.min(0.1,g);tick(s);g-=s;}}
 render();if(t-(frame.h||0)>400){frame.h=t;hud();hint();if(sel&&!$('pop').classList.contains('hidden'))renderPop();}requestAnimationFrame(frame);}
document.addEventListener('visibilitychange',()=>{if(document.hidden){save();paused=true;}else{paused=false;lastT=performance.now();}});
addEventListener('pagehide',save);addEventListener('resize',resize);
function centerStart(){const st=S.b.find(b=>b.t=='sandelis'||b.t=='lauzas')||{x:44,y:40};const[X,Y]=wpos(st.x+1,st.y);cam={x:X,y:Y,z:0.45};}
Object.assign(window,{nearTrees,saveGame:save,isTree,startBuild,updBuild,endBuild,darkness,openPop,demolish,inM,terr,__bld:()=>build});window.__dbg={get S(){return S},door,astar,walk,reach,grow3,rebuildGrids,load,speed:k=>speed=k,tick:(sec)=>{for(let i=0;i<sec*10;i++)tick(0.1);},fps:()=>fps,cam:()=>cam,setCam:(x,y,z)=>{const[X,Y]=wpos(x,y);cam={x:X,y:Y,z:z||cam.z};},
 era:e=>{S.era=e;buildMenu();},place:(t,x,y)=>{const e=canPlace(t,x,y);if(e)return e;clearPlot(t,x,y);addB(t,x,y,0);return 'ok';},canPlace,cancelSite:id=>cancelSite(bId(id)),addB:(t,x,y)=>addB(t,x,y,0),upgrade:id=>upgrade(bId(id)),save,load,fire:id=>{const b=bId(id);b.fire=30;},sick:id=>{const p=S.p.find(q=>q.id==id);p.sick=DAY*2;abort(p);},reveal,openPop:id=>openPop(bId(id)),startBuild,tap,roadAt:(x,y)=>{roadMode=roadMode||{del:false};roadAt(x,y);},spawnP,startRoad,get RD(){return RD},finish:id=>{const b=bId(id);if(b.site)finishSite(b);},w2s:(x,y)=>{const[X,Y]=wpos(x,y);return[(X-cam.x)*cam.z+W/2,(Y-cam.y)*cam.z+H/2];}};
fetch('map.json').then(r=>r.json()).then(m=>{MAP=m;N=m.N;TER=m.T;WW=N*TW;HH=N*TH;
 for(let x=0;x<N;x++)if(TER[44][x]=='w'&&x>25&&x<40)BR.add(idx(x,44));
 resize();if(!load()){newGame();centerStart();}buildMenu();clampCam();
 for(const t in VM)img('v_'+t);
 for(const t of ['statybviete','gora','uolynas','pusis','pusys','azuolas','berzas','krumas','akmenys','uola','kelmas'])img(t);
 for(const t of [...ORDER,...NORDER,'lauzas'])for(const s of B[t].spr)img(s);
 $('loading').remove();requestAnimationFrame(frame);});
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
})();
