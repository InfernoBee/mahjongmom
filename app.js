'use strict';

// Build/version for cache-busting + debugging
const APP_VERSION = '2026-02-27.2';
window.APP_VERSION = APP_VERSION;

function addDoubleTap(el, cb) {
  let lastTap = 0;
  el.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTap < 350) { e.preventDefault(); cb(); }
    lastTap = now;
  }, { passive: false });
}
document.addEventListener('touchmove', function(e) {
  if (e.target.closest && !e.target.closest('[data-scrollable]')) {
    if (e.cancelable) e.preventDefault();
  }
}, { passive: false });

let AC=null;
function getAC(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}
  return AC;
}
function resumeAC(){
  const ctx=getAC();
  if(ctx&&ctx.state==='suspended')ctx.resume();
}
document.addEventListener('touchstart',resumeAC,{once:true,passive:true});
document.addEventListener('click',resumeAC,{once:true});
function playTone(freq,type,dur,vol,decay){
  try{const ctx=getAC();if(!ctx)return;
  const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);
  o.frequency.value=freq;o.type=type||'sine';
  g.gain.setValueAtTime(vol||0.3,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+(decay||dur||0.3));
  o.start();o.stop(ctx.currentTime+(dur||0.3));}catch(e){}
}
function playNoise(dur,vol,freq){
  try{const ctx=getAC();if(!ctx)return;
  const buf=ctx.createBuffer(1,ctx.sampleRate*dur,ctx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*0.3;
  const src=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter();
  f.type='bandpass';f.frequency.value=freq||1200;f.Q.value=0.8;
  src.buffer=buf;src.connect(f);f.connect(g);g.connect(ctx.destination);
  g.gain.setValueAtTime(vol||0.4,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
  src.start();src.stop(ctx.currentTime+dur);}catch(e){}
}
// ── Haptic Feedback ─────────────────────────────────────────────────────────
const HX = {
  _ok: () => !!(navigator.vibrate),
  tap:    () => { if(HX._ok()) navigator.vibrate(8); },
  soft:   () => { if(HX._ok()) navigator.vibrate(15); },
  medium: () => { if(HX._ok()) navigator.vibrate(25); },
  heavy:  () => { if(HX._ok()) navigator.vibrate(50); },
  select: () => { if(HX._ok()) navigator.vibrate([6,30,6]); },
  pong:   () => { if(HX._ok()) navigator.vibrate([30,40,30]); },
  win:    () => { if(HX._ok()) navigator.vibrate([50,60,80,60,120]); },
  winBig: () => { if(HX._ok()) navigator.vibrate([80,50,100,50,150,80,200]); },
  error:  () => { if(HX._ok()) navigator.vibrate([20,30,20,30,20]); },
  draw:   () => { if(HX._ok()) navigator.vibrate(12); },
  discard:() => { if(HX._ok()) navigator.vibrate(18); },
  daily:  () => { if(HX._ok()) navigator.vibrate([30,50,30,50,60]); },
  gacha:  () => { if(HX._ok()) navigator.vibrate([20,30,20,30,40,50,80]); },
};

function playClick(){HX.tap();playTone(880,'square',0.05,0.15,0.05);}
function playShuffle(){for(let i=0;i<6;i++)setTimeout(()=>playNoise(0.04,0.25+Math.random()*0.15),i*60);}
function playDraw(){HX.draw();playNoise(0.06,0.3);setTimeout(()=>playTone(1200,'sine',0.08,0.18,0.08),40);}
function playDiscard(){HX.discard();playNoise(0.07,0.35);playTone(500,'triangle',0.07,0.2,0.07);}
function playPong(){HX.pong();playTone(440,'square',0.05,0.3);setTimeout(()=>playTone(550,'square',0.05,0.25),80);setTimeout(()=>playTone(660,'square',0.08,0.2),160);setTimeout(()=>playNoise(0.1,0.3),50);}
function playChi(){HX.medium();playTone(350,'triangle',0.05,0.25);setTimeout(()=>playTone(490,'triangle',0.05,0.2),70);setTimeout(()=>playTone(620,'triangle',0.08,0.18),140);}
function playKong(){HX.heavy();for(let i=0;i<4;i++)setTimeout(()=>{playNoise(0.06,0.4);playTone(300+i*80,'square',0.05,0.2);},i*50);}
function playWin(){HX.win();const n=[523,659,784,1047];n.forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.25,0.35,0.2),i*120));setTimeout(()=>[523,659,784].forEach(f=>playTone(f,'sine',0.6,0.25,0.5)),600);}
function playLose(){HX.error();[440,392,349,330].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.25,0.2,0.25),i*150));}
function playRon(){HX.heavy();playTone(880,'sawtooth',0.08,0.4);setTimeout(()=>playTone(1100,'sawtooth',0.1,0.35),100);setTimeout(()=>playTone(1320,'sine',0.3,0.3,0.25),200);}
function playWinBig(){
  HX.winBig();
  const melody=[523,659,784,1047,1319,1047,784,1047];
  melody.forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.3,0.4,0.25),i*90));
  setTimeout(()=>{
[523,659,784,1047].forEach(f=>playTone(f,'sine',0.8,0.35,0.6));
playNoise(0.15,0.3,2000);
  },800);
}
function playTileDeal(){playNoise(0.04,0.2,1800);playTone(1400,'sine',0.03,0.12,0.03);}
function playPongSlam(){
  HX.pong();
  playTone(440,'square',0.06,0.4);setTimeout(()=>playTone(550,'square',0.06,0.35),60);
  setTimeout(()=>playTone(660,'square',0.1,0.3),130);
  setTimeout(()=>playNoise(0.08,0.45,800),30);
  setTimeout(()=>playTone(880,'triangle',0.04,0.2),200);
}
function playCombo(){
  [880,1100,1320,1760].forEach((f,i)=>setTimeout(()=>playTone(f,'sawtooth',0.06,0.4,0.05),i*60));
  setTimeout(()=>playNoise(0.1,0.3,1500),280);
}
function playSlotSpin(){
  let t=0;
  for(let i=0;i<8;i++){
setTimeout(()=>playNoise(0.03,0.2,800+Math.random()*400),t);
t+=60+i*10;
  }
}
function playSlotStop(){playNoise(0.08,0.4,600);playTone(440,'square',0.06,0.25);}

function playSlotMatch(){
  const chime=[660,880,1100];
  chime.forEach((f,i)=>{
setTimeout(()=>{
playTone(f,'sine',0.18,0.38,0.18);
setTimeout(()=>playTone(f*2,'sine',0.06,0.15,0.12),30);
},i*110);
  });
  setTimeout(()=>playNoise(0.06,0.18,3000),380);
}

function playSlotJackpot(){
  const run=[330,392,494,587,659,784,880,1047,1175,1319];
  run.forEach((f,i)=>setTimeout(()=>{
playTone(f,'sine',0.14,0.45,0.12);
if(i%3===0) playTone(f*0.5,'triangle',0.08,0.3,0.1);
  },i*70));

  setTimeout(()=>{
[262,330,392,523].forEach(f=>playTone(f,'sawtooth',0.18,0.55,0.35));
playNoise(0.12,0.6,800);
  },700);

  const fanfare=[784,784,880,784,1047,988];
  fanfare.forEach((f,i)=>setTimeout(()=>{
playTone(f,'sine',0.22,0.5,0.18);
playTone(f*0.5,'sine',0.1,0.3,0.2);
  },900+i*130));

  for(let i=0;i<12;i++){
setTimeout(()=>{
const f=1200+Math.random()*800;
playTone(f,'sine',0.05,0.25,0.06);
},1700+i*80);
  }

  setTimeout(()=>{
[523,659,784,1047].forEach(f=>{
playTone(f,'sine',1.1,0.45,0.9);
playTone(f*2,'sine',0.2,0.2,0.8);
});
playNoise(0.1,0.4,600);
  },2700);
}
function playSlotBigWin(){
  [523,659,784,1047].forEach((f,i)=>setTimeout(()=>{
playTone(f,'sine',0.25,0.38,0.22);
setTimeout(()=>playTone(f*1.5,'sine',0.06,0.18,0.12),40);
  },i*100));
  setTimeout(()=>playNoise(0.07,0.25,2500),450);
}
function playHeroAbility(hero){
  switch(hero){
case'dragon':playTone(200,'sawtooth',0.1,0.5);setTimeout(()=>playTone(400,'sawtooth',0.2,0.4),100);setTimeout(()=>playTone(600,'sine',0.4,0.35,0.35),250);break;
case'bamboo':playTone(880,'triangle',0.05,0.3);setTimeout(()=>playTone(1100,'triangle',0.05,0.25),80);setTimeout(()=>playTone(1320,'triangle',0.1,0.2),160);break;
case'fortune':playTone(1046,'sine',0.05,0.3);setTimeout(()=>playNoise(0.1,0.2,1500),30);[523,659,784,1046].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.12,0.25,0.1),i*60));break;
case'wind':for(let i=0;i<6;i++)setTimeout(()=>playNoise(0.05,0.15,300+i*100),i*40);break;
case'thunder':playTone(120,'sawtooth',0.15,0.5);setTimeout(()=>playNoise(0.2,0.6,2000),50);setTimeout(()=>playTone(880,'square',0.1,0.3),150);break;
case'dushen':
[440,330,220,165].forEach((f,i)=>setTimeout(()=>{playTone(f,'sawtooth',0.12,0.45,0.1);},i*90));
setTimeout(()=>playNoise(0.15,0.5,300),400);
setTimeout(()=>[220,277,330].forEach(f=>playTone(f,'sine',0.25,0.35,0.22)),550);
break;
  }
}

const TILE_ZH={man:['一','二','三','四','五','六','七','八','九'],pin:['①','②','③','④','⑤','⑥','⑦','⑧','⑨'],sou:['1','2','3','4','5','6','7','8','9'],east:'東',south:'南',west:'西',north:'北',haku:'白',hatsu:'發',chun:'中'};
const TILE_SUIT_ZH={man:'萬',pin:'餅',sou:'條'};
const TILE_ZH_FULL={man:['一萬','二萬','三萬','四萬','五萬','六萬','七萬','八萬','九萬'],pin:['一餅','二餅','三餅','四餅','五餅','六餅','七餅','八餅','九餅'],sou:['一條','二條','三條','四條','五條','六條','七條','八條','九條'],east:'東',south:'南',west:'西',north:'北',haku:'白',hatsu:'發',chun:'中'};
const TILE_EN={man:['1-Man','2-Man','3-Man','4-Man','5-Man','6-Man','7-Man','8-Man','9-Man'],pin:['1-Pin','2-Pin','3-Pin','4-Pin','5-Pin','6-Pin','7-Pin','8-Pin','9-Pin'],sou:['1-Sou','2-Sou','3-Sou','4-Sou','5-Sou','6-Sou','7-Sou','8-Sou','9-Sou'],east:'East 東',south:'South 南',west:'West 西',north:'North 北',haku:'White 白',hatsu:'Green 發',chun:'Red 中'};
const HONORS=['east','south','west','north','haku','hatsu','chun'];
const SUITS=['man','pin','sou'];
const WIND_SYMBOLS={east:'東',south:'南',west:'西',north:'北'};

const HEROES=[
  {id:'dragon',emoji:'🐉',zh:'龙王',en:'Dragon King',
   dz:'龙牌赢牌额外+50金币；三龙在手翻倍！',de:'Dragon tiles give +50 bonus; triple dragons double payout!',passive:'dragon',
   abilityName:'龙焰降临 / Dragon Flame',
   abilityWhen:'当你的手牌有中・发・白时自动激活！/ Auto-activates when you hold 中, 发, or 白 tiles!',
   abilityTrigger:'赢牌时',anim:'🐉',animColor:'#ff4400',animText:'🔥 龙焰降临！\nDRAGON BONUS！'},
  {id:'bamboo',emoji:'🎋',zh:'竹仙',en:'Bamboo Sage',
   dz:'开局可以看墙顶1张；条牌为主赢牌额外+30金币。',de:'Peek 1 tile at start; bamboo-heavy wins give +30 coins.',passive:'bamboo',
   abilityName:'天眼偷视 / Mystic Peek',
   abilityWhen:'每局开始自动激活！看墙顶牌。/ Activates automatically at round start! Peek at the top wall tile.',
   abilityTrigger:'开局自动',anim:'🎋',animColor:'#00cc44',animText:'👁️ 竹仙天眼！\nMYSTIC PEEK！'},
  {id:'fortune',emoji:'💰',zh:'财神',en:'Fortune God',
   dz:'赢牌金币×1.5；每次碰牌获得+10金币。',de:'Win coins ×1.5; earn +10 coins on each Pong.',passive:'fortune',
   abilityName:'财神降临 / Fortune Boost',
   abilityWhen:'碰牌时获得+10金币！赢牌自动×1.5倍！/ Earn +10🪙 on every Pong! Win coins are auto ×1.5!',
   abilityTrigger:'碰牌时+赢牌时',anim:'💰',animColor:'#ffcc00',animText:'💰 财神到！\nFORTUNE BONUS！'},
  {id:'wind',emoji:'🌪️',zh:'风神',en:'Wind God',
   dz:'风牌对子额外+20金币；风牌碰牌特别优化。',de:'Wind pair bonus +20 coins; strong with wind tiles.',passive:'wind',
   abilityName:'风神之力 / Wind Power',
   abilityWhen:'碰风牌（东南西北）时激活！赢牌+20金币。/ Activates when Ponging wind tiles! +20🪙 on win.',
   abilityTrigger:'碰风牌时',anim:'🌪️',animColor:'#44aaff',animText:'🌀 风神之力！\nWIND BONUS！'},
  {id:'thunder',emoji:'⚡',zh:'雷神',en:'Thunder Hero',
   dz:'每局一次：点"⚡雷击换牌"重新摸牌！赢牌时对手各扣10金币。',de:'Once per round: tap "⚡Thunder Redraw" button to swap your drawn tile!',passive:'thunder',
   abilityName:'雷击换牌 / Thunder Redraw',
   abilityWhen:'摸牌后，点击底部的"⚡雷击换牌"按钮！每局只能用一次！/ After drawing, tap the "⚡Thunder Redraw" button at the bottom! One use per round!',
   abilityTrigger:'手动按钮',anim:'⚡',animColor:'#aa44ff',animText:'⚡ 雷击！\nTHUNDER SWAP！'},
  {id:'dushen',emoji:'🃏',zh:'小赌神',en:'Lesser Gambling God',
   dz:'【解锁角色】每局开始：有20%概率看到对手最强一张牌！赢牌时有15%概率从对手各偷取15金币。',
   de:'[Unlocked Hero] Round start: 20% chance to peek at one opponent\'s best tile! On win: 15% chance to steal 15 coins from each opponent.',
   passive:'dushen',locked:true,
   abilityName:'命运之眼 / Eye of Fate',
   abilityWhen:'赢牌时有几率偷币；开局有几率偷看对手牌！/ Win: chance to steal coins; round start: chance to peek an opponent tile!',
   abilityTrigger:'赢牌+开局',anim:'🃏',animColor:'#cc0033',animText:'🃏 命运之眼！\nEYE OF FATE！'},
];

const BRYAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
<defs>
  <radialGradient id="face" cx="50%" cy="45%" r="52%">
<stop offset="0%" stop-color="#feebd4"/>
<stop offset="65%" stop-color="#f7c998"/>
<stop offset="100%" stop-color="#e8a96a"/>
  </radialGradient>
  <radialGradient id="aura" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#ffd700" stop-opacity="0.55"/>
<stop offset="100%" stop-color="#ff8800" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="blushL" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#ff8888" stop-opacity="0.5"/>
<stop offset="100%" stop-color="#ff8888" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="blushR" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#ff8888" stop-opacity="0.5"/>
<stop offset="100%" stop-color="#ff8888" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="hairG" x1="30%" y1="0%" x2="70%" y2="100%">
<stop offset="0%" stop-color="#332a1e"/>
<stop offset="100%" stop-color="#1a1410"/>
  </linearGradient>
  <linearGradient id="silv" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#f2f5fa"/>
<stop offset="45%" stop-color="#8a9aaa"/>
<stop offset="100%" stop-color="#dde4ec"/>
  </linearGradient>
  <filter id="sh" x="-25%" y="-25%" width="150%" height="150%">
<feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#7a3a10" flood-opacity="0.18"/>
  </filter>
  <filter id="glo" x="-50%" y="-50%" width="200%" height="200%">
<feGaussianBlur stdDeviation="3" result="b"/>
<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>

<ellipse cx="40" cy="77" rx="18" ry="3" fill="#000" opacity="0.1"/>

<circle cx="40" cy="40" r="34" fill="url(#aura)" opacity="0.2">
  <animate attributeName="r" values="30;36;30" dur="3s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0.12;0.26;0.12" dur="3s" repeatCount="indefinite"/>
</circle>

<circle cx="8" cy="14" r="1.3" fill="#ffd700">
  <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="0s" repeatCount="indefinite"/>
  <animate attributeName="cy" values="14;9;14" dur="2.2s" repeatCount="indefinite"/>
</circle>
<circle cx="72" cy="18" r="1.0" fill="#ffe066">
  <animate attributeName="opacity" values="0;1;0" dur="2.6s" begin="0.8s" repeatCount="indefinite"/>
  <animate attributeName="cy" values="18;13;18" dur="2.6s" begin="0.8s" repeatCount="indefinite"/>
</circle>
<circle cx="74" cy="55" r="1.2" fill="#ffd700">
  <animate attributeName="opacity" values="0;1;0" dur="1.9s" begin="1.5s" repeatCount="indefinite"/>
</circle>
<circle cx="6" cy="52" r="1.0" fill="#ffe066">
  <animate attributeName="opacity" values="0;1;0" dur="2.8s" begin="0.4s" repeatCount="indefinite"/>
</circle>

<g>
  <animateTransform attributeName="transform" type="translate"
values="0,0;0,-5;0,0" dur="3s" ease="ease-in-out" repeatCount="indefinite"/>

  <ellipse cx="40" cy="44" rx="26" ry="25" fill="url(#face)" filter="url(#sh)"/>

  <ellipse cx="40" cy="26" rx="26" ry="14" fill="url(#hairG)"/>
  <path d="M14,36
Q15,19 40,18
Q65,19 66,36
Q60,27 52,29
Q46,31 40,30
Q35,31 28,29
Q20,27 14,36 Z"
fill="url(#hairG)"/>
  <path d="M14,36 Q10,46 12,57 Q14,62 18,60 Q15,49 16,40 Z" fill="url(#hairG)"/>
  <path d="M66,36 Q70,46 68,57 Q66,62 62,60 Q65,49 64,40 Z" fill="url(#hairG)"/>
  <path d="M26,29 Q24,36 25,41" stroke="#1a1410" stroke-width="1.1" fill="none" opacity="0.45"/>
  <path d="M33,27 Q31,34 32,40" stroke="#1a1410" stroke-width="1.1" fill="none" opacity="0.35"/>
  <path d="M47,27 Q49,34 48,40" stroke="#1a1410" stroke-width="1.1" fill="none" opacity="0.35"/>
  <path d="M54,29 Q56,36 55,41" stroke="#1a1410" stroke-width="1.1" fill="none" opacity="0.45"/>
  <path d="M22,22 Q38,15 52,20" stroke="#4a3c2c" stroke-width="3"
fill="none" stroke-linecap="round" opacity="0.32"/>

  <ellipse cx="18" cy="54" rx="7" ry="5" fill="url(#blushL)"/>
  <ellipse cx="62" cy="54" rx="7" ry="5" fill="url(#blushR)"/>

  <path d="M21,35 Q29,33 36,34.5" stroke="#1e1610" stroke-width="1.6"
fill="none" stroke-linecap="round"/>
  <path d="M44,34.5 Q51,33 59,35" stroke="#1e1610" stroke-width="1.6"
fill="none" stroke-linecap="round"/>

  <path d="M20,42 Q28.5,37 38,42 Q28.5,47 20,42 Z" fill="white"/>
  <ellipse cx="29" cy="42" rx="5" ry="4.2" fill="#2e1e10"/>
  <ellipse cx="29" cy="42" rx="2.8" ry="2.8" fill="#100808"/>
  <ellipse cx="29" cy="42" rx="5" ry="4.2" fill="none" stroke="#4a3020" stroke-width="0.7"/>
  <ellipse cx="27" cy="40" rx="1.4" ry="1.7" fill="white" opacity="0.92"/>
  <circle cx="31.5" cy="44" r="0.8" fill="white" opacity="0.5"/>
  <path d="M20,42 Q28.5,37 38,42" stroke="#140e08" stroke-width="1.6"
fill="none" stroke-linecap="round"/>
  <path d="M21,42.5 Q28.5,46.5 37,42.5" stroke="#2e1e10" stroke-width="0.8"
fill="none" stroke-linecap="round" opacity="0.55"/>

  <path d="M42,42 Q51.5,37 60,42 Q51.5,47 42,42 Z" fill="white"/>
  <ellipse cx="51" cy="42" rx="5" ry="4.2" fill="#2e1e10"/>
  <ellipse cx="51" cy="42" rx="2.8" ry="2.8" fill="#100808"/>
  <ellipse cx="51" cy="42" rx="5" ry="4.2" fill="none" stroke="#4a3020" stroke-width="0.7"/>
  <ellipse cx="49" cy="40" rx="1.4" ry="1.7" fill="white" opacity="0.92"/>
  <circle cx="53.5" cy="44" r="0.8" fill="white" opacity="0.5"/>
  <path d="M42,42 Q51.5,37 60,42" stroke="#140e08" stroke-width="1.6"
fill="none" stroke-linecap="round"/>
  <path d="M43,42.5 Q51.5,46.5 59,42.5" stroke="#2e1e10" stroke-width="0.8"
fill="none" stroke-linecap="round" opacity="0.55"/>

  <polygon points="17,37 19,33 37,33 39,37 39,48 37,51 19,51 17,48"
fill="rgba(180,210,250,0.07)" stroke="url(#silv)" stroke-width="1.8"
stroke-linejoin="round"/>
  <polygon points="41,37 43,33 59,33 61,37 61,48 59,51 43,51 41,48"
fill="rgba(180,210,250,0.07)" stroke="url(#silv)" stroke-width="1.8"
stroke-linejoin="round"/>
  <path d="M39,42 Q40,40.5 41,42" stroke="#aabbc8" stroke-width="1.5"
fill="none" stroke-linecap="round"/>
  <path d="M17,43 Q12,42 10,41" stroke="#9aaab8" stroke-width="1.5"
fill="none" stroke-linecap="round"/>
  <path d="M61,43 Q66,42 68,41" stroke="#9aaab8" stroke-width="1.5"
fill="none" stroke-linecap="round"/>
  <path d="M19,35.5 L23,35.5" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"
stroke-linecap="round"/>
  <path d="M19,37.5 L21.5,37.5" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"
stroke-linecap="round"/>
  <path d="M43,35.5 L47,35.5" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"
stroke-linecap="round"/>
  <path d="M43,37.5 L45.5,37.5" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"
stroke-linecap="round"/>

  <circle cx="37.5" cy="57" r="1.2" fill="#c08060" opacity="0.4"/>
  <circle cx="42.5" cy="57" r="1.2" fill="#c08060" opacity="0.4"/>

  <path d="M34,62 Q36.5,60 40,61.5 Q43.5,60 46,62"
stroke="#b87060" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M33.5,62 Q40,67.5 46.5,62"
stroke="#c07858" stroke-width="1.5"
fill="rgba(220,140,110,0.2)" stroke-linecap="round"/>

  <g transform="translate(40,11)" filter="url(#glo)">
<circle cx="0" cy="0" r="7" fill="#ffd700" opacity="0.08">
<animate attributeName="r" values="5;10;5" dur="2.4s" repeatCount="indefinite"/>
<animate attributeName="opacity" values="0.05;0.2;0.05" dur="2.4s" repeatCount="indefinite"/>
</circle>
<polygon
points="0,-9 2.1,-3.1 8.6,-2.8 3.5,1.3 5.3,8.1 0,4.5 -5.3,8.1 -3.5,1.3 -8.6,-2.8 -2.1,-3.1"
fill="#ffd700" stroke="#e09000" stroke-width="0.6">
<animate attributeName="opacity" values="0.88;1;0.88" dur="1.8s" repeatCount="indefinite"/>
<animateTransform attributeName="transform" type="rotate"
values="0;12;0;-12;0" dur="4s" repeatCount="indefinite"/>
</polygon>
<circle cx="0" cy="0" r="2.5" fill="#fff9cc"/>
<circle cx="-0.7" cy="-0.7" r="1" fill="white" opacity="0.7"/>
  </g>

</g>
</svg>`;

const PETS=[

  {id:'koi',emoji:'🐟',zh:'锦鲤',en:'Koi Fish',r:'common',
   dz:'每局开始+15金币',de:'+15 coins at round start',
   effect:'round_bonus_15',lockedBy:'triple7',
   unlockHint:'🎰 三连 7 解锁'},

  {id:'jade_turtle',emoji:'🐢',zh:'玉龟',en:'Jade Turtle',r:'common',
   dz:'每10回合牌墙不减少一次（跳过一轮消耗）',de:'Every 10 turns, wall does not decrease once',
   effect:'wall_save',lockedBy:'triple_mj',
   unlockHint:'🀄 三连麻将解锁'},

  {id:'sparrow',emoji:'🐦',zh:'麻雀',en:'Lucky Sparrow',r:'common',
   dz:'弃牌后10%几率立得+5金币',de:'+5 coins on 10% of discards',
   effect:'discard_bonus',lockedBy:'any_pair',
   unlockHint:'🎰 任意配对解锁'},

  {id:'cat',emoji:'🐱',zh:'幸运猫',en:'Lucky Cat',r:'rare',
   dz:'每轮摸牌后有10%几率额外摸一张',de:'10% chance to draw an extra tile each turn',
   effect:'extra_draw',lockedBy:'jackpot',
   unlockHint:'🎰 三连🐉 JACKPOT解锁'},

  {id:'fox',emoji:'🦊',zh:'九尾狐',en:'Nine-Tail Fox',r:'rare',
   dz:'碰牌后有25%几率再摸一张',de:'25% chance to draw after Pong',
   effect:'pong_draw',lockedBy:'jackpot',
   unlockHint:'🎰 三连🐉 JACKPOT解锁'},

  {id:'panda',emoji:'🐼',zh:'幸运熊猫',en:'Lucky Panda',r:'rare',
   dz:'对子手牌时+20%金币',de:'+20% coins when winning with pairs',
   effect:'pair_bonus',lockedBy:'jackpot',
   unlockHint:'🎰 三连🐉 JACKPOT解锁'},

  {id:'white_rabbit',emoji:'🐰',zh:'月兔',en:'Moon Rabbit',r:'rare',
   dz:'七对和牌时额外+120金币',de:'+120 bonus coins on Seven Pairs win',
   effect:'seven_pairs_bonus',lockedBy:'jackpot',
   unlockHint:'🎰 三连🐉 JACKPOT解锁'},

  {id:'tiger',emoji:'🐯',zh:'白虎',en:'White Tiger',r:'rare',
   dz:'赢牌时额外扣对手各15金币',de:'On win, deduct 15 coins from each opponent',
   effect:'win_steal_15',lockedBy:'jackpot',
   unlockHint:'🎰 三连🐉 JACKPOT解锁'},

  {id:'dragon_pet',emoji:'🐲',zh:'小龙',en:'Baby Dragon',r:'legendary',
   dz:'赢牌金币额外+80',de:'+80 bonus coins on win',
   effect:'win_bonus_80',lockedBy:'jackpot',
   unlockHint:'🎰 三连🐉 JACKPOT解锁'},

  {id:'phoenix',emoji:'🦅',zh:'凤凰',en:'Phoenix',r:'legendary',
   dz:'输掉时保留50%金币',de:'Keep 50% coins on a loss',
   effect:'loss_shield',lockedBy:'jackpot',
   unlockHint:'🎰 三连🐉 JACKPOT解锁'},

  {id:'golden_dragon',emoji:'🌟',zh:'金龙神',en:'Golden Dragon God',r:'legendary',
   dz:'金币倍率永久×1.2，且每赢3局解锁一次金牌奖励',de:'Permanent ×1.2 coin mult; every 3 wins grants a gold reward',
   effect:'golden_mult',lockedBy:'jackpot',
   unlockHint:'🎰 三连🐉 JACKPOT解锁'},

  {id:'bryan',emoji:'👓',zh:'Bryan',en:'Bryan',r:'legendary',
   svgAvatar: BRYAN_SVG,
   dz:'传说宠物！在场时金币+100%，且每局开始回复20金币',de:'Legendary! +100% coins & recover 20 coins each round start',
   effect:'bryan_power',lockedBy:'promo',
   unlockHint:'🎁 专属礼包码解锁 / Unlock via special promo code'},
];

const IPOOL=[
  {id:'luckycharm',emoji:'🍀',zh:'幸运符',en:'Lucky Charm',r:'common',dz:'本局金币+20%',de:'+20% coin bonus this round'},
  {id:'shield',emoji:'🛡️',zh:'护盾',en:'Shield',r:'rare',dz:'免疫一次输局',de:'Block one round loss'},
  {id:'diamond',emoji:'💎',zh:'钻石',en:'Diamond',r:'rare',dz:'立即+200金币',de:'+200 coins instantly'},
  {id:'starboost',emoji:'🌟',zh:'星力',en:'Star Boost',r:'rare',dz:'下次赢牌×2',de:'Double coins on next win'},
  {id:'dragonsoul',emoji:'🐲',zh:'龙魂',en:'Dragon Soul',r:'legendary',dz:'赢牌额外+100',de:'+100 bonus coins on win'},
  {id:'coincrate',emoji:'🪙',zh:'金币箱',en:'Coin Crate',r:'common',dz:'立即+50金币',de:'Gain 50 coins'},
  {id:'scroll',emoji:'📜',zh:'古卷',en:'Ancient Scroll',r:'common',dz:'本局额外+20',de:'+20 score this round'},
  {id:'trophy',emoji:'🏆',zh:'胜利奖杯',en:'Victory Trophy',r:'legendary',dz:'永久金币+5%',de:'Permanent +5% coin bonus'},
];

const REEL_SYMBOLS=[
  {s:`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><defs><radialGradient id='cg' cx='38%' cy='35%'><stop offset='0%' stop-color='#fff7a0'/><stop offset='40%' stop-color='#f0c030'/><stop offset='100%' stop-color='#8a5a00'/></radialGradient><radialGradient id='ig' cx='50%' cy='50%'><stop offset='0%' stop-color='#ffe066'/><stop offset='100%' stop-color='#c87800'/></radialGradient></defs><circle cx='32' cy='32' r='30' fill='url(#cg)' stroke='#7a4a00' stroke-width='2'/><circle cx='32' cy='32' r='22' fill='none' stroke='#8a5a00' stroke-width='1.5'/><rect x='26' y='26' width='12' height='12' rx='2' fill='url(#ig)' stroke='#7a4a00' stroke-width='1.5'/><text x='32' y='20' text-anchor='middle' font-family='serif' font-size='9' font-weight='bold' fill='#5a2a00'>龍</text><text x='32' y='52' text-anchor='middle' font-family='serif' font-size='9' font-weight='bold' fill='#5a2a00'>幸</text><text x='14' y='35' text-anchor='middle' font-family='serif' font-size='9' font-weight='bold' fill='#5a2a00'>金</text><text x='50' y='35' text-anchor='middle' font-family='serif' font-size='9' font-weight='bold' fill='#5a2a00'>運</text></svg>`,w:1, v:'dragon', win:true},
  {s:`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><defs><linearGradient id='sg7' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#fff0a0'/><stop offset='40%' stop-color='#ffd700'/><stop offset='100%' stop-color='#c87000'/></linearGradient><linearGradient id='sg7bg' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#1a1a1a'/><stop offset='50%' stop-color='#2a2a2a'/><stop offset='100%' stop-color='#111111'/></linearGradient><filter id='glow7'><feGaussianBlur stdDeviation='2.5' result='blur'/><feMerge><feMergeNode in='blur'/><feMergeNode in='SourceGraphic'/></feMerge></filter></defs><rect x='2' y='2' width='60' height='60' rx='10' fill='url(#sg7bg)' stroke='#ffd700' stroke-width='2.5'/><rect x='6' y='6' width='52' height='52' rx='7' fill='none' stroke='rgba(255,215,0,0.3)' stroke-width='1'/><text x='33' y='48' text-anchor='middle' font-family='Arial Black,sans-serif' font-size='42' font-weight='900' fill='url(#sg7)' stroke='#8b4500' stroke-width='1.5' paint-order='stroke' filter='url(#glow7)'>7</text><line x1='14' y1='56' x2='22' y2='56' stroke='#ffd700' stroke-width='2' stroke-linecap='round' opacity='0.6'/><line x1='42' y1='56' x2='50' y2='56' stroke='#ffd700' stroke-width='2' stroke-linecap='round' opacity='0.6'/></svg>`,w:4, v:'seven', win:true},
  {s:'🀄',w:7, v:'mj',     win:true},
  {s:'💎',w:4, v:'gem',    win:true},
  {s:'⭐',w:9, v:'star',   win:true},
  {s:'🍀',w:9, v:'j1', win:false},
  {s:'🔔',w:9, v:'j2', win:false},
  {s:'🍋',w:9, v:'j3', win:false},
  {s:'🍒',w:9, v:'j4', win:false},
  {s:'🎴',w:9, v:'j5', win:false},
  {s:'🎋',w:9, v:'j6', win:false},
  {s:'🏮',w:9, v:'j7', win:false},
  {s:'🐚',w:9, v:'j8', win:false},
  {s:'💨',w:9, v:'j9', win:false},
];
function buildWeightedPool(){
  const pool=[];
  REEL_SYMBOLS.forEach(sym=>{for(let i=0;i<sym.w;i++)pool.push(sym);});
  return pool;
}
const RPOOL=buildWeightedPool();
function spinSymbol(){return RPOOL[Math.floor(Math.random()*RPOOL.length)];}

const SAVE_KEY = 'wlz_mahjong_save';
const SAVE_META_KEY = 'wlz_mahjong_save_meta';
const SAVE_EXPORT_VERSION = 1;

let SAVE = {
  backend: null,          // 'localStorage' | 'sessionStorage' | 'memory'
  ok: false,
  persistentLikely: true, // best-effort heuristic
  inApp: false,
  lastError: null,
  lastSavedAt: 0,
  persistGranted: null,
};

const _MEM_STORE = {};

function _isInAppBrowser(){
  const ua = navigator.userAgent || '';
  // Common in-app webviews
  return /FBAN|FBAV|Instagram|Line\/|WhatsApp|MicroMessenger|WeChat|Twitter|TikTok|Snapchat|GSA\/|CriOS(?!\/)|EdgiOS/i.test(ua);
}

function _testStorage(obj){
  try{
    const k = '__wlz_test__' + Math.random().toString(16).slice(2);
    obj.setItem(k,'1');
    obj.removeItem(k);
    return true;
  }catch(e){
    return false;
  }
}

function _storageObj(){
  if(SAVE.backend === 'localStorage') return window.localStorage;
  if(SAVE.backend === 'sessionStorage') return window.sessionStorage;
  return null;
}

function storageGet(key){
  try{
    const o = _storageObj();
    if(o) return o.getItem(key);
    return _MEM_STORE[key] ?? null;
  }catch(e){
    SAVE.lastError = e;
    return null;
  }
}

function storageSet(key, value){
  try{
    const o = _storageObj();
    if(o) { o.setItem(key, value); return true; }
    _MEM_STORE[key] = value;
    return true;
  }catch(e){
    SAVE.lastError = e;
    return false;
  }
}

function storageRemove(key){
  try{
    const o = _storageObj();
    if(o) { o.removeItem(key); return true; }
    delete _MEM_STORE[key];
    return true;
  }catch(e){
    SAVE.lastError = e;
    return false;
  }
}

async function initSaveSystem(){
  SAVE.inApp = _isInAppBrowser();

  // Prefer localStorage; fall back to sessionStorage; else in-memory
  if(_testStorage(window.localStorage)){
    SAVE.backend = 'localStorage';
    SAVE.ok = true;
  }else if(_testStorage(window.sessionStorage)){
    SAVE.backend = 'sessionStorage';
    SAVE.ok = true;
    SAVE.persistentLikely = false;
  }else{
    SAVE.backend = 'memory';
    SAVE.ok = false;
    SAVE.persistentLikely = false;
  }

  // Heuristic: in-app browsers often behave like "not persistent"
  if(SAVE.inApp) SAVE.persistentLikely = false;

  // Best-effort: ask for persistent storage (where supported)
  try{
    if(navigator.storage && navigator.storage.persist){
      const granted = await navigator.storage.persist();
      SAVE.persistGranted = granted;
      // If granted, persistence likelihood improves.
      if(granted && SAVE.backend === 'localStorage') SAVE.persistentLikely = true;
    }
  }catch(e){
    // ignore
  }

  // Store a probe to detect "wiped on close" situations (heuristic)
  try{
    const metaRaw = storageGet(SAVE_META_KEY);
    const meta = metaRaw ? JSON.parse(metaRaw) : {};
    meta.lastSeenAt = Date.now();
    meta.probe = (meta.probe || 0) + 1;
    storageSet(SAVE_META_KEY, JSON.stringify(meta));
  }catch(e){}

  updateSaveStatusUI();
}

function updateSaveStatusUI(){
  const pill = document.getElementById('save-pill');
  const pillText = document.getElementById('save-pill-text');
  const pillIcon = document.getElementById('save-pill-icon');
  const status = document.getElementById('save-status');

  const isOk = (SAVE.backend === 'localStorage') && SAVE.ok && SAVE.persistentLikely;
  const isWarn = SAVE.ok && (!SAVE.persistentLikely || SAVE.backend !== 'localStorage');

  const zh = {
    ok: '✅ 自动存档已开启（稳定）',
    warn: '⚠️ 存档可能不稳定（隐私浏览/应用内浏览器）',
    bad: '⛔ 无法使用浏览器存档（将仅在本次会话有效）'
  };
  const en = {
    ok: '✅ Auto-save is ON (stable)',
    warn: '⚠️ Saving may not persist (Private / in-app browser)',
    bad: '⛔ Storage unavailable (session-only)'
  };

  if(pill){
    pill.classList.remove('ok','warn','bad','hidden');
    if(isOk){ pill.classList.add('ok'); pillIcon.textContent='💾'; }
    else if(isWarn){ pill.classList.add('warn'); pillIcon.textContent='⚠️'; }
    else { pill.classList.add('bad'); pillIcon.textContent='⛔'; }
  }

  const backendLabel = SAVE.backend || 'unknown';
  const last = SAVE.lastSavedAt ? new Date(SAVE.lastSavedAt).toLocaleString() : '-';

  if(status){
    status.innerHTML = `
      <div>${PD.lang==='en' ? en[isOk?'ok':(isWarn?'warn':'bad')] : (PD.lang==='zh' ? zh[isOk?'ok':(isWarn?'warn':'bad')] : (zh[isOk?'ok':(isWarn?'warn':'bad')] + ' / ' + en[isOk?'ok':(isWarn?'warn':'bad')]))}</div>
      <small>
        ${PD.lang==='en' ? `Backend: <strong>${backendLabel}</strong> · Last save: <strong>${last}</strong>` :
          (PD.lang==='zh' ? `存储方式: <strong>${backendLabel}</strong> · 上次存档: <strong>${last}</strong>` :
          `存储方式: <strong>${backendLabel}</strong> · 上次存档: <strong>${last}</strong> / Backend: <strong>${backendLabel}</strong> · Last save: <strong>${last}</strong>`)}
        ${SAVE.persistGranted===null ? '' : (PD.lang==='en' ? ` · Persist: <strong>${SAVE.persistGranted?'granted':'not granted'}</strong>` :
          (PD.lang==='zh' ? ` · 持久化: <strong>${SAVE.persistGranted?'已允许':'未允许'}</strong>` :
          ` · 持久化: <strong>${SAVE.persistGranted?'已允许':'未允许'}</strong> / Persist: <strong>${SAVE.persistGranted?'granted':'not granted'}</strong>`))}
      </small>
    `;
  }

  if(pillText){
    // Keep it short on the pill
    pillText.textContent = (PD.lang==='en' ? (isOk?'Saved':'Save') : (PD.lang==='zh' ? (isOk?'已存档':'存档') : (isOk?'已存档/Saved':'存档/Save')));
  }
}

/** Save PD (best-effort). If force=true, attempt even when storage is risky. */
function savePD(force=false) {
  try {
    const toSave = Object.assign({}, PD, { hero: PD.hero ? PD.hero.id : null });
    const ok = storageSet(SAVE_KEY, JSON.stringify(toSave));
    if(!ok){
      SAVE.ok = false;
      SAVE.persistentLikely = false;
      updateSaveStatusUI();
      return false;
    }
    SAVE.lastSavedAt = Date.now();
    // Keep a lightweight meta record too
    try{
      const metaRaw = storageGet(SAVE_META_KEY);
      const meta = metaRaw ? JSON.parse(metaRaw) : {};
      meta.lastSavedAt = SAVE.lastSavedAt;
      meta.backend = SAVE.backend;
      meta.inApp = !!SAVE.inApp;
      storageSet(SAVE_META_KEY, JSON.stringify(meta));
    }catch(e){}
    updateSaveStatusUI();
    return true;
  } catch(e) {
    SAVE.lastError = e;
    SAVE.ok = false;
    SAVE.persistentLikely = false;
    updateSaveStatusUI();
    return false;
  }
}

function loadPD() {
  try {
    const raw = storageGet(SAVE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(PD, saved);
    if (saved.hero) PD.hero = HEROES.find(h => h.id === saved.hero) || null;
    if (PD.unlockedDushen) {
      const dh = HEROES.find(h => h.id === 'dushen');
      if (dh) dh.locked = false;
    }
  } catch(e) {
    // ignore
  }
}

function resetSave() {
  if (!confirm('重置存档？/ Reset all progress?')) return;
  storageRemove(SAVE_KEY);
  storageRemove(SAVE_META_KEY);
  location.reload();
}

// Save on background/close — critical for iPhone Safari.
function hookSaveLifecycle(){
  window.addEventListener('pagehide', ()=>{ try{ savePD(true); }catch(e){} }, { capture:true });
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'hidden'){ try{ savePD(true); }catch(e){} }
  }, { capture:true });
  window.addEventListener('beforeunload', ()=>{ try{ savePD(true); }catch(e){} }, { capture:true });
}

function exportSave(){
  try{
    const payload = {
      exportVersion: SAVE_EXPORT_VERSION,
      createdAt: Date.now(),
      saveKey: SAVE_KEY,
      data: JSON.parse(storageGet(SAVE_KEY) || JSON.stringify(Object.assign({}, PD, { hero: PD.hero ? PD.hero.id : null }))),
      meta: { backend: SAVE.backend, inApp: SAVE.inApp }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.download = `wlz-save-${ts}.json`;
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }catch(e){
    alert('导出失败 / Export failed');
  }
}

function triggerImportSave(){
  const inp = document.getElementById('import-save-file');
  if(inp) inp.click();
}

function importSaveFile(ev){
  const file = ev.target.files && ev.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const obj = JSON.parse(String(reader.result || ''));
      const data = obj && obj.data ? obj.data : obj; // allow raw PD too
      if(!confirm(`导入存档会覆盖当前进度。\nImport will overwrite current progress.\n\n继续？ / Continue?`)) return;
      // Minimal schema guard
      if(typeof data !== 'object' || data === null) throw new Error('invalid');
      // Save and reload
      storageSet(SAVE_KEY, JSON.stringify(data));
      location.reload();
    }catch(e){
      alert('存档文件无效 / Invalid save file');
    }
  };
  reader.readAsText(file);
  ev.target.value = '';
}

function copySaveToClipboard(){
  try{
    const raw = storageGet(SAVE_KEY) || JSON.stringify(Object.assign({}, PD, { hero: PD.hero ? PD.hero.id : null }));
    navigator.clipboard.writeText(raw).then(()=>{
      alert('已复制存档到剪贴板 / Save copied to clipboard');
    }).catch(()=>{
      // Fallback
      prompt('复制存档 / Copy save:', raw);
    });
  }catch(e){
    alert('复制失败 / Copy failed');
  }
}

function pasteSaveFromClipboard(){
  // Prefer clipboard API; fallback to prompt
  const doImport = (raw)=>{
    try{
      const data = JSON.parse(raw);
      if(!confirm(`粘贴恢复会覆盖当前进度。\nPaste restore will overwrite current progress.\n\n继续？ / Continue?`)) return;
      storageSet(SAVE_KEY, JSON.stringify(data));
      location.reload();
    }catch(e){
      alert('粘贴内容不是有效 JSON / Invalid JSON');
    }
  };
  if(navigator.clipboard && navigator.clipboard.readText){
    navigator.clipboard.readText().then(txt=>{
      if(!txt) return alert('剪贴板为空 / Clipboard empty');
      doImport(txt);
    }).catch(()=>{
      const raw = prompt('粘贴存档 JSON / Paste save JSON:');
      if(raw) doImport(raw);
    });
  }else{
    const raw = prompt('粘贴存档 JSON / Paste save JSON:');
    if(raw) doImport(raw);
  }
}


let PD={coins:200,hero:null,inv:{},coinMult:1.0,round:1,pets:{},activePet:null,slotStreak:0,
  bowlCoins:0,
  bowlTarget:300,
  bowlMisses:0,
  unlockedDushen:false,
  lang:'both',
  sound:true,
};

initSaveSystem();
hookSaveLifecycle();
loadPD();

// ── SETTINGS ──────────────────────────────────────────────────────────────
function applySettings(){
  // Language
  document.body.classList.remove('lang-zh','lang-en','lang-both');
  document.body.classList.add('lang-'+(PD.lang||'both'));
  // Sound: patch all playTone/playNoise calls silently
  window._soundEnabled = (PD.sound !== false);
}
function openSettings(){
  const ov = document.getElementById('settings-overlay');
  if(!ov) return;
  ov.classList.remove('hidden');
  // Sync chip active states
  ['zh','both','en'].forEach(l=>{
    const el=document.getElementById('lang-'+l);
    if(el) el.classList.toggle('active', (PD.lang||'both')===l);
  });
  ['on','off'].forEach(s=>{
    const el=document.getElementById('sound-'+s);
    if(el) el.classList.toggle('active', s==='on' ? (PD.sound!==false) : (PD.sound===false));
  });
}
function closeSettings(){
  const ov = document.getElementById('settings-overlay');
  if(ov) ov.classList.add('hidden');
}
function setLang(lang){
  try{ document.documentElement.lang = (lang==='en'?'en':'zh'); }catch(e){}

  PD.lang = lang;
  applySettings();
  savePD();
  // Refresh chip states
  ['zh','both','en'].forEach(l=>{
    const el=document.getElementById('lang-'+l);
    if(el) el.classList.toggle('active', l===lang);
  });
  HX.tap();
}
function setSound(on){
  PD.sound = on;
  window._soundEnabled = on;
  savePD();
  ['on','off'].forEach(s=>{
    const el=document.getElementById('sound-'+s);
    if(el) el.classList.toggle('active', s==='on' ? on : !on);
  });
  if(on){ resumeAC(); playClick(); }
  HX.tap();
}
// Apply settings on load
applySettings();

// Patch sound functions to respect _soundEnabled
(function(){
  const _origPlayTone = playTone;
  const _origPlayNoise = playNoise;
  playTone  = function(){ if(window._soundEnabled !== false) _origPlayTone.apply(this,arguments);  };
  playNoise = function(){ if(window._soundEnabled !== false) _origPlayNoise.apply(this,arguments); };
})();

function checkDaily(){
  const now = Date.now();
  const last = PD.lastDaily || 0;
  const msIn24h = 24*60*60*1000;
  const ready = (now - last) >= msIn24h;
  const titleBtn = document.getElementById('title-daily-btn');
  const hudBtn   = document.getElementById('daily-btn');
  if(titleBtn) titleBtn.style.display = ready ? 'block' : 'none';
  if(hudBtn)   hudBtn.style.display   = ready ? 'inline-block' : 'none';
  return ready;
}
function claimDaily(){
  if(!checkDaily()) {HX.error();return floatNotif('⏰ 明天再来！/ Come back tomorrow!');}
  PD.lastDaily = Date.now();
  const bonus = Math.min(500, 100 + (PD.round||1)*5);
  PD.coins += bonus;
  PD.freeSpins = (PD.freeSpins||0) + 3;
  updTitleCoins();
  checkDaily();
  playWin();
  HX.daily();
  spawnConfetti();
  savePD();
  showModal('🎁','每日奖励！/ Daily Bonus!',
`<strong style="color:#aaffaa;font-size:1.1rem">+${bonus} 🪙 金币</strong><br>
<strong style="color:#ffcc44">+3 🎰 免费旋转</strong><br><br>
<span style="color:#6a9a7a;font-size:0.78rem">明天再来领取更多！<br>Come back tomorrow for more!</span>`,
[{lz:'太棒了！',le:'Awesome!',fn:()=>hideModal()}]
  );
}
function updTitleCoins(){
  document.getElementById('tcoins').textContent=PD.coins;
  checkDaily();
}
let G=null,prevScr='scr-title';
let slotSpinning=false;

function showScr(id){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');if(id!=='scr-game')document.body.classList.remove('in-game');}
function goTitle(){updTitleCoins();checkDaily();showScr('scr-title');}
function goHeroSel(){
  buildHeroes();
  showScr('scr-hero');
  if(PD.hero){
const cards=document.querySelectorAll('.hcard');
cards.forEach(card=>{
if(card.querySelector('.hnamez')&&card.querySelector('.hnamez').textContent===PD.hero.zh){
card.classList.add('sel');
const h=PD.hero;
document.getElementById('hinfo').innerHTML=`<strong>${h.emoji} <span class="lz">${h.zh}</span><span class="le">${h.en}</span></strong><br><span class="lz" style="color:#c8e8ff">${h.dz}</span><span class="le" style="color:#c8e8ff">${h.de}</span><br><span class="lz" style="color:#aaffaa;font-size:0.72rem">✨ 能力: ${h.abilityWhen.split('/')[0].trim()}</span><span class="le" style="color:#aaffaa;font-size:0.72rem">✨ Ability: ${h.abilityWhen.split('/').slice(1).join('/').trim() || h.abilityWhen}</span>`;
}
});
setGoBtn();
  }
}
function openGacha(){prevScr=document.querySelector('.screen:not(.hidden)')?.id||'scr-title';renderSlotGacha();showScr('scr-gacha');document.getElementById('gacha-back-btn').style.display='block';}
function closeGacha(){document.getElementById('gacha-back-btn').style.display='none';renderSlotGacha();showScr(prevScr);}

const PROMO_CODES = {
  '97988534': {
desc: '5次免费老虎机 / 5 Free Slot Spins 🎰',
reward(pd){
pd.freeSpins = (pd.freeSpins||0) + 5;
return '🎰 获得 5 次免费老虎机旋转！\nYou got 5 Free Slot Spins!';
}
  },
  'Bryan1998': {
desc: '解锁传说宠物 Bryan！/ Unlock Legendary Pet Bryan!',
reward(pd){
pd.pets['bryan'] = true;
return '👓 传说宠物 Bryan 已解锁！\nLegendary Pet Bryan Unlocked!';
}
  },
};

if(!PD.redeemedCodes) PD.redeemedCodes = [];

function openPromo(){
  document.getElementById('promo-input').value='';
  document.getElementById('promo-result').className='promo-result';
  document.getElementById('promo-result').textContent='';
  updPromoHistory();
  document.getElementById('promo-overlay').classList.remove('hidden');
  setTimeout(()=>document.getElementById('promo-input').focus(),120);
}
function closePromo(){
  document.getElementById('promo-overlay').classList.add('hidden');
}
function promoInputChange(){
  const r=document.getElementById('promo-result');
  r.className='promo-result';r.textContent='';
}
function redeemPromo(){
  const raw=document.getElementById('promo-input').value.trim();
  const code=raw.toUpperCase().replace(/\s/g,'');
  const key=PROMO_CODES[raw]?raw:(PROMO_CODES[code]?code:null);
  const result=document.getElementById('promo-result');
  if(!key){
result.className='promo-result error show';
result.innerHTML='❌ 无效礼包码 / Invalid code<br><span style="font-size:0.7rem;opacity:0.7;">请检查后重试 · Please check and try again</span>';
playTone(200,'sine',0.15,0.2,0.15);
return;
  }
  if(!PD.redeemedCodes) PD.redeemedCodes=[];
  if(PD.redeemedCodes.includes(key)){
result.className='promo-result error show';
result.innerHTML='⚠️ 此礼包码已使用 / Code already redeemed<br><span style="font-size:0.7rem;opacity:0.7;">每个码只能使用一次 · Each code can only be used once</span>';
playTone(300,'sine',0.1,0.15,0.15);
return;
  }
  const entry=PROMO_CODES[key];
  const msg=entry.reward(PD);
  PD.redeemedCodes.push(key);
  updTitleCoins();
  updPromoHistory();
  result.className='promo-result success show';
  result.innerHTML=`🎊 兑换成功！/ Redeemed!<br><strong style="font-size:0.9rem;">${msg.replace(/\n/,'<br>')}</strong>`;
  document.getElementById('promo-input').value='';
  playTone(523,'sine',0.12,0.3,0.1);
  setTimeout(()=>playTone(659,'sine',0.12,0.28,0.1),120);
  setTimeout(()=>playTone(784,'sine',0.15,0.25,0.15),240);
  setTimeout(()=>spawnConfetti(),300);
}
function updPromoHistory(){
  const el=document.getElementById('promo-history');
  if(!PD.redeemedCodes||!PD.redeemedCodes.length){el.textContent='';return;}
  el.textContent=`已兑换 / Redeemed: ${PD.redeemedCodes.length} 个码 · ${PD.freeSpins||0} 次免费旋转剩余`;
}

function buildHeroes(){
  const g=document.getElementById('hgrid');g.innerHTML='';
  HEROES.forEach(h=>{
const el=document.createElement('div');
el.className='hcard'+(PD.hero?.id===h.id?' sel':'');
el.innerHTML=`<div class="hemoji">${h.emoji}</div><div class="hnamez lz">${h.zh}</div><div class="hnamez le" style="font-size:1rem;font-weight:700;color:var(--gold-lt);">${h.en}</div><div class="hdesc lz">${h.dz}</div><div class="hdesc le" style="font-size:0.63rem;color:#8ab0c8;line-height:1.4;">${h.de}</div>`;
el.onclick=()=>{pickHero(h.id,el);playClick();};
g.appendChild(el);
  });setGoBtn();
}
function pickHero(id,el){
  PD.hero=HEROES.find(h=>h.id===id);
  document.querySelectorAll('.hcard').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
  const h=PD.hero;
  document.getElementById('hinfo').innerHTML=`<strong>${h.emoji} <span class="lz">${h.zh}</span><span class="le">${h.en}</span></strong><br><span class="lz" style="color:#c8e8ff">${h.dz}</span><span class="le" style="color:#c8e8ff">${h.de}</span><br><span class="lz" style="color:#aaffaa;font-size:0.72rem">✨ 能力: ${h.abilityWhen.split('/')[0].trim()}</span><span class="le" style="color:#aaffaa;font-size:0.72rem">✨ Ability: ${h.abilityWhen.split('/').slice(1).join('/').trim() || h.abilityWhen}</span>`;
  setGoBtn();
  savePD();
}
function setGoBtn(){const b=document.getElementById('btngo');b.disabled=!PD.hero;b.style.opacity=PD.hero?'1':'0.4';}

function mkT(suit,num){return{suit,num};}
function createDeck(){const t=[];SUITS.forEach(s=>{for(let n=1;n<=9;n++)for(let c=0;c<4;c++)t.push(mkT(s,n));});HONORS.forEach(h=>{for(let c=0;c<4;c++)t.push(mkT('honor',h));});return t;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function teq(a,b){return a.suit===b.suit&&a.num===b.num;}
const SO={man:0,pin:1,sou:2,honor:3},HO={east:0,south:1,west:2,north:3,haku:4,hatsu:5,chun:6};
function tcmp(a,b){if(SO[a.suit]!==SO[b.suit])return SO[a.suit]-SO[b.suit];const an=a.suit==='honor'?HO[a.num]:a.num,bn=b.suit==='honor'?HO[b.num]:b.num;return an-bn;}
function sortH(t){return[...t].sort(tcmp);}
function tzh(t){return t.suit==='honor'?TILE_ZH[t.num]:TILE_ZH_FULL[t.suit][t.num-1];}
function tzh_short(t){return t.suit==='honor'?TILE_ZH[t.num]:TILE_ZH[t.suit][t.num-1];}
function tzh_suit(t){return t.suit==='honor'?'':TILE_SUIT_ZH[t.suit]||'';}
function ten(t){return t.suit==='honor'?TILE_EN[t.num]:TILE_EN[t.suit][t.num-1];}
function tileCls(t){
  if(t.suit==='honor'){
let c='s-honor';
if(t.num==='chun')c+=' hchun';
else if(t.num==='hatsu')c+=' hhatsu';
else if(t.num==='haku')c+=' hhaku';
else if(t.num==='east')c+=' heast';
else if(t.num==='south')c+=' hsouth';
else if(t.num==='west')c+=' hwest';
else if(t.num==='north')c+=' hnorth';
return c;
  }
  return 's-'+t.suit;
}

function pinSVG(num, w, h){
  const layouts = {
    1:[[50,50]],
    2:[[50,24],[50,76]],
    3:[[28,22],[50,50],[72,78]],
    4:[[30,24],[70,24],[30,76],[70,76]],
    5:[[30,21],[70,21],[50,50],[30,79],[70,79]],
    6:[[30,17],[70,17],[30,50],[70,50],[30,83],[70,83]],
    7:[[28,18],[50,22],[72,26],[30,58],[70,58],[30,82],[70,82]],
    8:[[30,13],[70,13],[30,38],[70,38],[30,63],[70,63],[30,88],[70,88]],
    9:[[23,13],[50,13],[77,13],[23,50],[50,50],[77,50],[23,87],[50,87],[77,87]],
  };
  const C = {
    1:{f:'#1e7d28',r:'#b01010'},
    2:{f:'#1a3db8',r:'#0a1a88'},
    3:{f:'#1a3db8',r:'#0a1a88'},
    4:{f:'#1a3db8',r:'#0a1a88'},
    5:{f:'#1a3db8',r:'#0a1a88'},
    6:{f:'#1a3db8',r:'#0a1a88'},
    7:{f:'#1a3db8',r:'#0a1a88'},
    8:{f:'#1a3db8',r:'#0a1a88'},
    9:{f:'#1e7d28',r:'#0b5015'},
  };
  const C7=[
    {f:'#1e7d28',r:'#0b5015'},{f:'#1e7d28',r:'#0b5015'},{f:'#1e7d28',r:'#0b5015'},
    {f:'#b81010',r:'#780808'},{f:'#b81010',r:'#780808'},
    {f:'#b81010',r:'#780808'},{f:'#b81010',r:'#780808'}
  ];
  const dots=layouts[num]||[];
  const baseR=num===1?0.34:num<=3?0.155:num===4?0.155:num<=5?0.135:num<=6?0.125:num===7?0.125:num===8?0.118:0.108;
  const rd=baseR*Math.min(w,h);
  let svg='';
  dots.forEach(([cx,cy],i)=>{
    const px=cx/100*w, py=cy/100*h;
    const clr=num===3?[{f:'#1a3db8',r:'#0a1a88'},{f:'#b81010',r:'#780808'},{f:'#1a3db8',r:'#0a1a88'}][i]:num===7?C7[i]:num===5&&i===2?{f:'#b81010',r:'#780808'}:num===9?[{f:'#1e7d28',r:'#0b5015'},{f:'#1e7d28',r:'#0b5015'},{f:'#1e7d28',r:'#0b5015'},{f:'#b81010',r:'#780808'},{f:'#b81010',r:'#780808'},{f:'#b81010',r:'#780808'},{f:'#1a3db8',r:'#0a1a88'},{f:'#1a3db8',r:'#0a1a88'},{f:'#1a3db8',r:'#0a1a88'}][i]:C[num];
    if(num===1){
      svg+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(rd).toFixed(1)}" fill="${clr.r}"/>`;
      svg+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(rd*0.82).toFixed(1)}" fill="#f0e8c8"/>`;
      svg+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(rd*0.64).toFixed(1)}" fill="${clr.f}"/>`;
      svg+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(rd*0.28).toFixed(1)}" fill="#f0e8c8"/>`;
    } else {
      svg+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${rd.toFixed(1)}" fill="${clr.r}"/>`;
      svg+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(rd*0.82).toFixed(1)}" fill="#ede4c0"/>`;
      svg+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(rd*0.64).toFixed(1)}" fill="${clr.f}"/>`;
      svg+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(rd*0.26).toFixed(1)}" fill="#ede4c0"/>`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svg}</svg>`;
}

function souSVG(num, w, h){
  const DG='#2a6b2a', BK='#1a1a1a', RD='#bb1111';
  const pad = w*0.06;
  const gapX = w*0.06;
  const gapY = h*0.03;

  function drawStick(x,y,sw_,sh_,clr){
    const rx_=sw_/2;
    const darken=clr===DG?'#1a4a1a':clr===BK?'#0a0a0a':'#881111';
    let s='';
    s+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${sw_.toFixed(1)}" height="${sh_.toFixed(1)}" rx="${rx_.toFixed(1)}" fill="${darken}"/>`;
    s+=`<rect x="${(x+1).toFixed(1)}" y="${(y+1).toFixed(1)}" width="${(sw_-2).toFixed(1)}" height="${(sh_-2).toFixed(1)}" rx="${(rx_-0.5).toFixed(1)}" fill="${clr}"/>`;
    s+=`<rect x="${(x+sw_*0.12).toFixed(1)}" y="${(y+sh_*0.08).toFixed(1)}" width="${(sw_*0.22).toFixed(1)}" height="${(sh_*0.84).toFixed(1)}" rx="${(sw_*0.1).toFixed(1)}" fill="rgba(255,255,255,0.20)"/>`;
    return s;
  }

  let sticks='';

  if(num===3){
    const totalRows=2;
    const sw3 = Math.min(w*0.24, (w - pad*2 - gapX)/2*0.7);
    const sh3 = (h*0.88 - gapY)/(totalRows);
    const rx3 = sw3/2;
    const topX = w/2 - sw3/2;
    const topY = h*0.06;
    sticks += drawStick(topX, topY, sw3, sh3, DG);
    const botTotalW = 2*sw3 + gapX;
    const botStartX = (w - botTotalW)/2;
    const botY = topY + sh3 + gapY;
    sticks += drawStick(botStartX, botY, sw3, sh3, DG);
    sticks += drawStick(botStartX + sw3 + gapX, botY, sw3, sh3, DG);
  }
  else if(num===7){
    const totalRows=3;
    const colCount=3;
    const sw7 = Math.min(w*0.22, (w - pad*2 - gapX*(colCount-1))/colCount*0.65);
    const sh7 = (h*0.88 - gapY*2)/totalRows;
    const topX = w/2 - sw7/2;
    const topY = h*0.06;
    sticks += drawStick(topX, topY, sw7, sh7, RD);
    const gridTotalW = colCount*sw7 + (colCount-1)*gapX;
    const gridStartX = (w - gridTotalW)/2;
    const gridColors = [DG,DG,DG,DG,DG,DG];
    let si=0;
    for(let r=0;r<2;r++){
      for(let c=0;c<colCount;c++,si++){
        const x = gridStartX + c*(sw7+gapX);
        const y = topY + sh7 + gapY + r*(sh7+gapY);
        sticks += drawStick(x, y, sw7, sh7, gridColors[si]||DG);
      }
    }
  }
  else if(num>=2 && num!==8){
    const stickColors = {
      2:[DG,DG],
      4:[DG,DG,DG,DG],
      5:[DG,DG,DG,DG],
      6:[DG,DG,DG,DG,DG,DG],
      9:[DG,DG,DG,RD,RD,RD,DG,DG,DG],
    };
    const colCount = num<=2?1:num<=5?2:3;
    const renderNum = (num===5)?4:num;
    const rowCount = (num===5)?2:Math.ceil(renderNum/colCount);

    const sw_ = Math.min(w*0.22, (w - pad*2 - gapX*(colCount-1))/colCount*0.65);
    const sh_ = Math.min(h*0.88/rowCount - gapY, (h*0.90 - gapY*(rowCount-1))/rowCount);
    const totalW = colCount*sw_ + (colCount-1)*gapX;
    const totalH = rowCount*(sh_+gapY) - gapY;
    const startX = num===5 ? w*0.04 : (w-totalW)/2;
    const startY = (h-totalH)/2;
    const colStepX = num===5 ? w - w*0.04*2 - sw_ : (sw_+gapX);
    const rx_ = sw_/2;
    const colors = stickColors[num]||[];
    let si=0;
    for(let c=0;c<colCount;c++){
      for(let r=0;r<rowCount&&si<renderNum;r++,si++){
        const x = startX + c*colStepX;
        const y = startY + r*(sh_+gapY);
        const clr = colors[si]||DG;
        sticks += drawStick(x, y, sw_, sh_, clr);
      }
    }
    if(num===5){
      const cx5 = w/2 - sw_/2;
      const cy5 = h/2 - sh_/2;
      sticks += drawStick(cx5, cy5, sw_, sh_, RD);
    }
  }

  let oneSou = '';
  if(num===1){
    const cx=w/2, cy=h/2;
    const sc=Math.min(w,h)*0.38;
    oneSou=`
<ellipse cx="${cx}" cy="${(cy+sc*0.15).toFixed(1)}" rx="${(sc*0.75).toFixed(1)}" ry="${(sc*0.48).toFixed(1)}" fill="#1a6b1a" stroke="#0a3a0a" stroke-width="1.2"/>
<ellipse cx="${cx}" cy="${(cy+sc*0.15).toFixed(1)}" rx="${(sc*0.40).toFixed(1)}" ry="${(sc*0.30).toFixed(1)}" fill="#2a9a2a"/>
<circle cx="${cx}" cy="${(cy-sc*0.50).toFixed(1)}" r="${(sc*0.32).toFixed(1)}" fill="#1a6b1a" stroke="#0a3a0a" stroke-width="1.2"/>
<circle cx="${(cx+sc*0.12).toFixed(1)}" cy="${(cy-sc*0.56).toFixed(1)}" r="${(sc*0.11).toFixed(1)}" fill="white"/>
<circle cx="${(cx+sc*0.15).toFixed(1)}" cy="${(cy-sc*0.56).toFixed(1)}" r="${(sc*0.055).toFixed(1)}" fill="#111"/>
<polygon points="${(cx-sc*0.08).toFixed(1)},${(cy-sc*0.82).toFixed(1)} ${(cx+sc*0.48).toFixed(1)},${(cy-sc*1.0).toFixed(1)} ${(cx+sc*0.12).toFixed(1)},${(cy-sc*0.50).toFixed(1)}" fill="#cc2200"/>
<polygon points="${(cx-sc*0.4).toFixed(1)},${(cy+sc*0.52).toFixed(1)} ${(cx-sc*1.0).toFixed(1)},${(cy+sc*0.85).toFixed(1)} ${(cx-sc*0.15).toFixed(1)},${(cy+sc*0.65).toFixed(1)}" fill="#cc2200"/>
<polygon points="${(cx+sc*0.4).toFixed(1)},${(cy+sc*0.52).toFixed(1)} ${(cx+sc*1.0).toFixed(1)},${(cy+sc*0.85).toFixed(1)} ${(cx+sc*0.15).toFixed(1)},${(cy+sc*0.65).toFixed(1)}" fill="#cc2200"/>`;
  }

  let eightSou = '';
  if(num===8){
    const G='#2a6b2a', stroke='#1a4a1a';
    const sw8=w*0.13, cr=sw8/2;
    const s=Math.min(w,h)/56;
    function halfSvg(cx, cy, flip){
      const vH=h*0.30;
      const vW=sw8;
      const lx=cx-w*0.28, rx=cx+w*0.28;
      const ytop=cy-vH/2, ybot=cy+vH/2;
      const vlx=lx-vW/2, vrx=rx-vW/2;
      let out='';
      out+=`<rect x="${(lx-vW/2).toFixed(1)}" y="${ytop.toFixed(1)}" width="${vW.toFixed(1)}" height="${vH.toFixed(1)}" rx="${cr.toFixed(1)}" fill="${stroke}"/>`;
      out+=`<rect x="${(lx-vW/2+1).toFixed(1)}" y="${(ytop+1).toFixed(1)}" width="${(vW-2).toFixed(1)}" height="${(vH-2).toFixed(1)}" rx="${(cr-0.5).toFixed(1)}" fill="${G}"/>`;
      out+=`<rect x="${(rx-vW/2).toFixed(1)}" y="${ytop.toFixed(1)}" width="${vW.toFixed(1)}" height="${vH.toFixed(1)}" rx="${cr.toFixed(1)}" fill="${stroke}"/>`;
      out+=`<rect x="${(rx-vW/2+1).toFixed(1)}" y="${(ytop+1).toFixed(1)}" width="${(vW-2).toFixed(1)}" height="${(vH-2).toFixed(1)}" rx="${(cr-0.5).toFixed(1)}" fill="${G}"/>`;
      const dw=sw8*0.92;
      const innerY = flip ? cy-h*0.04 : cy+h*0.04;
      const outerY = flip ? cy+h*0.12 : cy-h*0.12;
      const midX = cx;
      out+=`<line x1="${lx.toFixed(1)}" y1="${outerY.toFixed(1)}" x2="${midX.toFixed(1)}" y2="${innerY.toFixed(1)}" stroke="${stroke}" stroke-width="${(dw+2).toFixed(1)}" stroke-linecap="round"/>`;
      out+=`<line x1="${lx.toFixed(1)}" y1="${outerY.toFixed(1)}" x2="${midX.toFixed(1)}" y2="${innerY.toFixed(1)}" stroke="${G}" stroke-width="${(dw-2).toFixed(1)}" stroke-linecap="round"/>`;
      out+=`<line x1="${rx.toFixed(1)}" y1="${outerY.toFixed(1)}" x2="${midX.toFixed(1)}" y2="${innerY.toFixed(1)}" stroke="${stroke}" stroke-width="${(dw+2).toFixed(1)}" stroke-linecap="round"/>`;
      out+=`<line x1="${rx.toFixed(1)}" y1="${outerY.toFixed(1)}" x2="${midX.toFixed(1)}" y2="${innerY.toFixed(1)}" stroke="${G}" stroke-width="${(dw-2).toFixed(1)}" stroke-linecap="round"/>`;
      const barY = (outerY+innerY)/2;
      out+=`<line x1="${(lx+w*0.05).toFixed(1)}" y1="${barY.toFixed(1)}" x2="${(rx-w*0.05).toFixed(1)}" y2="${barY.toFixed(1)}" stroke="${stroke}" stroke-width="${(dw+2).toFixed(1)}" stroke-linecap="round"/>`;
      out+=`<line x1="${(lx+w*0.05).toFixed(1)}" y1="${barY.toFixed(1)}" x2="${(rx-w*0.05).toFixed(1)}" y2="${barY.toFixed(1)}" stroke="${G}" stroke-width="${(dw-2).toFixed(1)}" stroke-linecap="round"/>`;
      return out;
    }
    eightSou += halfSvg(w/2, h*0.27, false);
    eightSou += halfSvg(w/2, h*0.73, true);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${num===1?oneSou:num===8?eightSou:sticks}</svg>`;
}

function manHTML(num, sz){
  const isLg=sz==='t-lg', isMd=sz==='t-md', isDisc=sz==='t-disc';
  const numCh=['一','二','三','四','五','六','七','八','九'][num-1];
  const nSz=isLg?'1.45rem':isMd?'1.05rem':isDisc?'0.95rem':sz==='t-sm'?'0.76rem':'0.60rem';
  const sSz=isLg?'1.25rem':isMd?'0.95rem':isDisc?'0.85rem':sz==='t-sm'?'0.68rem':'0.54rem';
  return `<span class="tc" style="font-size:${nSz};color:#1133cc;font-family:'Noto Serif SC',serif;font-weight:900;line-height:1;-webkit-text-stroke:0.4px #1133cc;text-shadow:0 0 0.5px #1133cc;">${numCh}</span><span class="ts" style="font-size:${sSz};color:#cc1111;font-family:'Noto Serif SC',serif;font-weight:900;line-height:1.05;-webkit-text-stroke:0.4px #cc1111;text-shadow:0 0 0.5px #cc1111;">萬</span>`;
}

function souTileHTML(num, sz){
  const isLg=sz==='t-lg', isMd=sz==='t-md', isDisc=sz==='t-disc';
  const w=isLg?40:isMd?30:isDisc?26:sz==='t-sm'?22:16;
  const h=isLg?56:isMd?43:isDisc?37:sz==='t-sm'?31:21;
  return souSVG(num,w,h);
}

function pinTileHTML(num, sz){
  const isLg=sz==='t-lg', isMd=sz==='t-md', isDisc=sz==='t-disc';
  const w=isLg?40:isMd?30:isDisc?26:sz==='t-sm'?22:16;
  const h=isLg?56:isMd?43:isDisc?37:sz==='t-sm'?31:21;
  return pinSVG(num,w,h);
}

function tileEl(t,sz,extra,onclick){
  const full=tzh(t);
  const d=document.createElement('div');
  d.className=`tile ${sz} ${tileCls(t)} ${extra||''}`;
  d.title=`${full} / ${ten(t)}`;
  if(t.suit==='honor'){
if(t.num==='haku'){
  d.innerHTML='';
} else if(t.num==='hatsu'){
  d.innerHTML=`<span class="tc" style="color:#0a7a1a;font-family:'Noto Serif SC',serif;font-weight:900;">發</span>`;
} else if(t.num==='chun'){
  d.innerHTML=`<span class="tc" style="color:#cc1111;font-family:'Noto Serif SC',serif;font-weight:900;">中</span>`;
} else {
  const windCh={east:'東',south:'南',west:'西',north:'北'};
  d.innerHTML=`<span class="tc" style="color:#111133;font-family:'Noto Serif SC',serif;font-weight:900;">${windCh[t.num]||''}</span>`;
}
  } else if(t.suit==='sou'){
d.innerHTML=souTileHTML(t.num,sz);
  } else if(t.suit==='pin'){
d.innerHTML=pinTileHTML(t.num,sz);
  } else {
d.innerHTML=manHTML(t.num,sz);
  }
  if(onclick)d.onclick=onclick;return d;
}
function backEl(sz){
  const d=document.createElement('div');
  d.className=`tile ${sz} tback`;
  const isLg=sz==='t-lg', isMd=sz==='t-md';
  const w=isLg?40:isMd?30:sz==='t-disc'?26:sz==='t-sm'?22:16;
  const h=isLg?56:isMd?43:sz==='t-disc'?37:sz==='t-sm'?31:21;
  d.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="${w}" height="${h}" fill="#1a4a88" rx="2"/>
<rect x="2" y="2" width="${w-4}" height="${h-4}" fill="none" stroke="#4a8acc" stroke-width="1" rx="1"/>
<line x1="${w/2}" y1="2" x2="${w/2}" y2="${h-2}" stroke="#2a5a99" stroke-width="0.5"/>
<line x1="2" y1="${h/2}" x2="${w-2}" y2="${h/2}" stroke="#2a5a99" stroke-width="0.5"/>
<circle cx="${w/2}" cy="${h/2}" r="${Math.min(w,h)*0.2}" fill="none" stroke="#4a8acc" stroke-width="0.8"/>
<circle cx="${w/2}" cy="${h/2}" r="${Math.min(w,h)*0.08}" fill="#6aaaee"/>
  </svg>`;
  return d;
}

function canFormSets(tiles){if(tiles.length===0)return true;return _cfs([...tiles].sort(tcmp));}
function _cfs(t){
  if(t.length===0)return true;const f=t[0],r=t.slice(1);
  if(r.length>=2&&teq(r[0],f)&&teq(r[1],f))if(_cfs(r.slice(2)))return true;
  if(f.suit!=='honor'){const i2=r.findIndex(x=>x.suit===f.suit&&x.num===f.num+1);if(i2!==-1){const r2=[...r];r2.splice(i2,1);const i3=r2.findIndex(x=>x.suit===f.suit&&x.num===f.num+2);if(i3!==-1){r2.splice(i3,1);if(_cfs(r2))return true;}}}
  return false;
}
function isWin(hand,melds){
  melds=melds||[];const need=(4-melds.length)*3+2;if(hand.length!==need)return false;
  const s=sortH(hand);
  if(!melds.length&&s.length===14){let ok=true;for(let i=0;i<14;i+=2)if(!teq(s[i],s[i+1])){ok=false;break;}if(ok)return true;}
  for(let i=0;i<s.length-1;i++){if(!teq(s[i],s[i+1]))continue;const rem=s.filter((_,j)=>j!==i&&j!==i+1);if(canFormSets(rem))return true;while(i+2<s.length&&teq(s[i],s[i+2]))i++;}
  return false;
}

const MIN_TAI = 1;

function calcTai(hand, melds, method, roundWind, seatWind){
  melds = melds||[];
  let tai = 0;
  const reasons = [];
  const allTiles = [...hand, ...melds.flatMap(m=>m.tiles)];
  const fullHand = [...hand];

  const isDragon = t => t.suit==='honor' && ['haku','hatsu','chun'].includes(t.num);
  const isWind = t => t.suit==='honor' && ['east','south','west','north'].includes(t.num);

  melds.forEach(m=>{
if((m.type==='pong'||m.type==='kong') && isDragon(m.tiles[0])){
tai+=1; reasons.push(`${tzh(m.tiles[0])}碰/杠 +1台`);
}
  });
  melds.forEach(m=>{
if((m.type==='pong'||m.type==='kong') && m.tiles[0].suit==='honor' && m.tiles[0].num===roundWind){
tai+=1; reasons.push(`圈风碰 +1台`);
}
  });
  melds.forEach(m=>{
if((m.type==='pong'||m.type==='kong') && m.tiles[0].suit==='honor' && m.tiles[0].num===seatWind){
tai+=1; reasons.push(`门风碰 +1台`);
}
  });

  if(method==='tsumo'){tai+=1; reasons.push('自摸 +1台');}

  const allPong = melds.length===4 && melds.every(m=>m.type==='pong'||m.type==='kong');
  if(allPong||_allPongHand(hand,melds)){tai+=3; reasons.push('对对和 +3台');}

  const suits = allTiles.filter(t=>t.suit!=='honor').map(t=>t.suit);
  const honors = allTiles.filter(t=>t.suit==='honor');
  const uniqueSuits = [...new Set(suits)];
  if(honors.length===0 && uniqueSuits.length===1){tai+=6; reasons.push('清一色 +6台');}
  else if(uniqueSuits.length===1 && honors.length>0){tai+=3; reasons.push('混一色 +3台');}

  if(allTiles.every(t=>t.suit==='honor')){tai+=10; reasons.push('字一色 +10台');}

  if(!melds.length && hand.length===14){
const s=sortH(hand);let ok=true;
for(let i=0;i<14;i+=2)if(!teq(s[i],s[i+1])){ok=false;break;}
if(ok){tai+=4; reasons.push('七对 +4台');}
  }

  const isTermOrHonor = t => t.suit==='honor' || t.num===1 || t.num===9;
  if(allTiles.every(isTermOrHonor)){tai+=8; reasons.push('混老头 +8台');}

  if(melds.length===0){tai+=1; reasons.push('门清 +1台');}

  const dragonPongs = melds.filter(m=>(m.type==='pong'||m.type==='kong')&&isDragon(m.tiles[0]));
  if(dragonPongs.length===3){tai+=16; reasons.push('大三元 +16台');}

  const windPongs = melds.filter(m=>(m.type==='pong'||m.type==='kong')&&isWind(m.tiles[0]));
  if(windPongs.length===4){tai+=16; reasons.push('大四喜 +16台');}

  return {tai, reasons};
}

function _allPongHand(hand, melds){
  if(melds.length===0 && hand.length===14){
  }
  return false;
}

function taiToCoins(tai){
  const ladder={3:100,4:150,5:200,6:300,7:450,8:600,9:800,10:1000};
  if(tai<=2)return 0;
  if(tai>=10)return 1000+(tai-10)*200;
  return ladder[tai]||100;
}
function aiScore(tile,hand){let sc=0;const o=hand.filter(t=>!teq(t,tile));sc+=o.filter(t=>teq(t,tile)).length*5;if(tile.suit!=='honor'){[-2,-1,1,2].forEach(d=>{if(o.some(t=>t.suit===tile.suit&&t.num===tile.num+d))sc+=2;});[-1,1].forEach(d=>{if(o.some(t=>t.suit===tile.suit&&t.num===tile.num+d))sc+=1;});}return sc;}
function aiDiscardBase(pi){const h=G.hands[pi];let min=Infinity,pick=h[0];h.forEach(t=>{const s=aiScore(t,h);if(s<min){min=s;pick=t;}});return pick;}
function aiDiscard(pi){return aiDiscardBase(pi);}
function aiWantPongBase(pi,tile){return G.hands[pi].filter(t=>teq(t,tile)).length>=2;}
function aiWantPong(pi,tile){return aiWantPongBase(pi,tile);}
function aiWantChi(pi,tile,from){if((from+1)%4!==pi||tile.suit==='honor')return null;const h=G.hands[pi];for(const[a,b]of[[tile.num-2,tile.num-1],[tile.num-1,tile.num+1],[tile.num+1,tile.num+2]]){if(a<1||b>9)continue;if(h.some(t=>t.suit===tile.suit&&t.num===a)&&h.some(t=>t.suit===tile.suit&&t.num===b))return[a,b];}return null;}

function calcCoins(winner,method){
  if(winner!==0)return{coins:0,tai:0,reasons:[]};
  const h=G.hands[0],m=G.melds[0];
  const seatWinds=['east','south','west','north'];
  const seatWind = seatWinds[0];
  const {tai,reasons} = calcTai(h,m,method,G.roundWind,seatWind);
  let base = taiToCoins(tai);
  let mult = 1;
  if(PD.hero?.passive==='fortune')mult*=1.5;
  if(PD.hero?.passive==='dragon'){const drg=h.filter(t=>t.suit==='honor'&&['haku','hatsu','chun'].includes(t.num));if(drg.length>=3)mult*=2;else if(drg.length>0)base+=50;}
  if(PD.hero?.passive==='bamboo'){if(h.filter(t=>t.suit==='sou').length>=5)base+=30;}
  if(G.starBoost){mult*=2;G.starBoost=false;}
  if(G.luckyRound)mult*=1.2;
  mult*=PD.coinMult;
  if(PD.activePet==='dragon_pet')base+=80;
  if(PD.activePet==='golden_dragon')mult*=1.2;
  if(PD.activePet==='white_rabbit'&&reasons.some(r=>r.includes('七对')))base+=120;
  if(PD.activePet==='bryan'){mult*=2; base+=20;}
  if(PD.activePet==='tiger'){base+=45;}
  if(PD.inv['dragonsoul'])base+=100;
  const coins = Math.max(0,Math.round(base*mult));
  return {coins, tai, reasons};
}

function heroAbilityAnim(heroId){
  const h=HEROES.find(x=>x.id===heroId);if(!h)return;
  playHeroAbility(heroId);
  const ov=document.getElementById('hero-anim-overlay');
  const burst=document.getElementById('hero-anim-burst');
  const txt=document.getElementById('hero-anim-text');
  burst.textContent=h.anim;
  burst.style.textShadow=`0 0 60px ${h.animColor}`;
  txt.innerHTML=h.animText.replace('\n','<br>');
  txt.style.color=h.animColor;
  ov.classList.remove('hidden');
  setTimeout(()=>ov.classList.add('hidden'),1400);
}

function showAbilityHint(heroId){
  const h=HEROES.find(x=>x.id===heroId);if(!h)return;
  const hint=document.getElementById('ability-hint');
  document.getElementById('ahi-icon').textContent=h.emoji+' '+h.anim;
  const anParts = h.abilityName.split(' / ');
  document.getElementById('ahi-title').innerHTML=`<span class="lz">${anParts[0]}</span><span class="le">${anParts[1]||anParts[0]}</span>`;
  const awParts = h.abilityWhen.split('/ ');
  const awZh = awParts[0].trim();
  const awEn = awParts.slice(1).join('/ ').trim() || awParts[0].trim();
  document.getElementById('ahi-body').innerHTML=`<strong style="color:#ffcc44">${h.abilityTrigger}:</strong> <span class="lz">${awZh}</span><span class="le">${awEn}</span>`;
  hint.classList.remove('hidden');
  clearTimeout(hint._t);hint._t=setTimeout(()=>hint.classList.add('hidden'),8000);
}
function hideAbilityHint(){document.getElementById('ability-hint').classList.add('hidden');}

function unlockPet(petId){
  if(PD.pets[petId])return false;
  PD.pets[petId]=true;
  return true;
}
function equipPet(petId){
  if(!PD.pets[petId]&&petId!==null)return;
  PD.activePet=petId;
  updPetHUD();
  renderSlotGacha();
  savePD();
}
function updPetHUD(){
  const el=document.getElementById('hud-pet');
  if(PD.activePet){const p=PETS.find(x=>x.id===PD.activePet);el.textContent=p?p.emoji+'·伙伴':'';} else el.textContent='';
  const pw=document.getElementById('pet-widget');
  const pt=document.getElementById('pet-tooltip');
  if(PD.activePet&&G){
const p=PETS.find(x=>x.id===PD.activePet);
pw.classList.remove('hidden');
if(p?.svgAvatar){
pw.innerHTML=`<div style="width:36px;height:36px;overflow:hidden;border-radius:50%;display:flex;align-items:center;justify-content:center;">${p.svgAvatar.replace('width="80" height="80"','width="44" height="44"').replace('viewBox="0 0 80 80"','viewBox="10 20 60 55"')}</div>`;
} else {
pw.textContent=p?.emoji||'🐾';
}
if(pt&&p)pt.innerHTML=`<strong>${p.zh}</strong><br>${p.dz}`;
  } else pw.classList.add('hidden');
}
function petActivate(){
  if(!PD.activePet||!G)return;
  const p=PETS.find(x=>x.id===PD.activePet);if(!p)return;
  const pw=document.getElementById('pet-widget');
  pw.classList.add('active-anim');setTimeout(()=>pw.classList.remove('active-anim'),700);
  floatNotif(`${p.emoji} ${p.zh} 准备好了！/ ${p.en} Ready!`);
}

function launchGame(){
  if(!PD.hero)return;
  resumeAC();
  // Pick 3 unique opponents now for the versus screen to display
  if(typeof AI_ASSIGNMENTS !== 'undefined' && typeof AI_ROSTER !== 'undefined'){
    const pool = AI_ROSTER.map((_,i)=>i);
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    AI_ASSIGNMENTS[1]=pool[0]; AI_ASSIGNMENTS[2]=pool[1]; AI_ASSIGNMENTS[3]=pool[2];
  }
  window._vsJustLaunched = true; // prevent initRound from re-randomizing on first round
  showVersusScreen(()=>{
    showScr('scr-game');
    document.body.classList.add('in-game');
    document.getElementById('hhero').textContent=PD.hero.emoji+' '+PD.hero.zh;
    updPetHUD();
    _initBoardTapListener();
    setTimeout(()=>showAbilityHint(PD.hero.id),1500);
    initRound();
  });
}
function initRound(){
  playShuffle();
  _handPeekState = 'auto';
  // On "Next Round" (not first launch), pick fresh unique opponents
  if(!window._vsJustLaunched && typeof AI_ASSIGNMENTS !== 'undefined' && typeof AI_ROSTER !== 'undefined'){
    const pool = AI_ROSTER.map((_,i)=>i);
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    AI_ASSIGNMENTS[1]=pool[0]; AI_ASSIGNMENTS[2]=pool[1]; AI_ASSIGNMENTS[3]=pool[2];
  }
  window._vsJustLaunched = false;
  if(typeof updateAILabels !== 'undefined') updateAILabels();
  const deck=shuffle(createDeck());
  const hands=[[],[],[],[]];
  for(let i=0;i<13;i++)for(let p=0;p<4;p++)hands[p].push(deck.pop());
  hands[0]=sortH(hands[0]);
  const winds=['east','south','west','north'];
  const roundWind=winds[(PD.round-1)%4];
  G={wall:deck,hands,melds:[[],[],[],[]],discards:[[],[],[],[]],cur:0,phase:'draw',pending:null,pendingFrom:-1,selIdx:null,selDrawn:false,drawn:null,thunderUsed:false,wlzSuppressed:false,starBoost:(PD.inv['starboost']||0)>0,luckyRound:(PD.inv['luckycharm']||0)>0,roundWind,wallUsed:0};
  if(PD.activePet==='koi'){PD.coins+=15;floatNotif('🐟 锦鲤加持！+15🪙');}
  if(PD.activePet==='bryan'){PD.coins+=20;floatNotif('👓 Bryan 在场！+20🪙 & 金币×2！/ Bryan is here! +20🪙 & ×2 coins!');}
  if(PD.activePet==='golden_dragon'){floatNotif('🌟 金龙神加持！金币×1.2！/ Golden Dragon: ×1.2 coins!');}
  updHUD();renderWall();
  if(PD.hero?.passive==='bamboo'&&G.wall.length>0){
heroAbilityAnim('bamboo');
const pk=G.wall[G.wall.length-1];
setTimeout(()=>showModal('🎋','竹仙特技 / Bamboo Sage Peek',`<strong style="color:#88ffaa">你偷看了墙顶！/ You peeked!</strong><br><br><span style="font-size:1.4rem;font-weight:900">${tzh(pk)}</span><br><span style="font-size:0.8rem;color:#88ccff">${ten(pk)}</span>`,[{lz:'明白了',le:'Got it!',fn:()=>{hideModal();phaseDraw();}}]),700);
  } else setTimeout(()=>phaseDraw(),400);
  renderAll();
}

function renderWall(){
  if(!G)return;
  const total=136-(13*4),used=G.wallUsed;
  ['n','e','s','w'].forEach((s,si)=>{
const el=document.getElementById('wall-'+s);if(!el)return;el.innerHTML='';
const sUsed=Math.floor(used/4+(si<used%4?1:0));
for(let i=0;i<Math.min(Math.floor(total/4),20);i++){const wt=document.createElement('div');wt.className='wt'+(i<sUsed?' used':'');el.appendChild(wt);}
  });
}

function updHUD(){
  document.getElementById('hcoins').textContent=PD.coins;
  document.getElementById('hround').textContent=PD.round;
  document.getElementById('cwall').textContent=G?G.wall.length:0;
  if(G){document.getElementById('gcoins').textContent=PD.coins;const ws=G.roundWind?WIND_SYMBOLS[G.roundWind]:'東';document.getElementById('cwind').textContent=ws;}
}

function phaseDraw(){
  if(!G)return;
  if(G.wall.length===0){endRound(null,'流局 / Draw Game',0);return;}
  G.phase='draw';renderAll();
  if(G.cur===0)humanDraw();
  else setTimeout(()=>aiTurn(G.cur),700);
}
function humanDraw(){
  if(G.wall.length===0){endRound(null,'流局 / Draw Game',0);return;}
  G.drawn=G.wall.pop();G.wallUsed++;
  G.phase='discard';G.selIdx=null;G.selDrawn=false;
  _handPeekState = 'auto';
  playDraw();updHUD();renderAll();renderWall();
  if(PD.activePet==='cat'&&Math.random()<0.10&&G.wall.length>0){
setTimeout(()=>{
const extra=G.wall.pop();G.wallUsed++;
G.hands[0]=sortH([...G.hands[0],extra]);
floatNotif('🐱 幸运猫：额外摸牌！/ Lucky Cat: Extra draw!');
renderAll();renderWall();updHUD();
},500);
  }
  const full=[...G.hands[0],G.drawn];
  const acts=[];
  if(isWin(full,G.melds[0])){
acts.push({az:'🀄 和牌！',ae:'Win! (Tsumo)',cls:'abtn-win',fn:()=>{
hideActs();G.hands[0]=sortH(full);G.drawn=null;
const {coins,tai,reasons}=calcCoins(0,'tsumo');
if(tai<MIN_TAI){
showModal('⚠️','台数不足 / Too Few Tai',`<strong style="color:#ffaa44">需要至少 ${MIN_TAI} 台才能和牌！/ Need at least ${MIN_TAI} tai to win!</strong><br><br>你现在有 <strong style="color:#ff8888">${tai} 台</strong><br>${reasons.join('<br>')||'无台数役种'}`,[{lz:'继续打牌',le:'Keep Playing',fn:()=>{
hideModal();
// Restore drawn tile so player can discard it
const restoredFull = sortH(full);
G.drawn = restoredFull[restoredFull.length - 1];
G.hands[0] = restoredFull.slice(0, -1);
G.phase = 'discard'; G.cur = 0; G.selIdx = null; G.selDrawn = false;
setTurn('🃏 你的回合 — 选牌打出 / Your turn — select a tile to discard');
renderAll(); updSelHint();
}}]);
} else {
endRound(0,'自摸 / Tsumo!',coins,tai,reasons);
}
}});
  }
  const drawnTile=G.drawn;
  if(drawnTile){
const matchInHand=G.hands[0].filter(t=>teq(t,drawnTile));
if(matchInHand.length>=3){
acts.push({az:'暗杠！',ae:'Self Kong!',cls:'abtn-kong',fn:()=>{
hideActs();
playKong();
G.hands[0]=sortH(G.hands[0].filter(t=>!teq(t,drawnTile)));
G.drawn=null;
G.melds[0].push({type:'kong',tiles:[drawnTile,drawnTile,drawnTile,drawnTile]});
if(G.wall.length>0){G.drawn=G.wall.pop();G.wallUsed++;}
G.phase='discard';G.selIdx=null;G.selDrawn=false;
updHUD();renderAll();renderWall();
floatNotif('暗杠！/ Concealed Kong!');
setTurn('暗杠！摸牌后打出 / Self Kong! Draw and discard');
}});
}
const pongMeldIdx=G.melds[0].findIndex(m=>m.type==='pong'&&teq(m.tiles[0],drawnTile));
if(pongMeldIdx!==-1){
acts.push({az:'加杠！',ae:'Add to Kong!',cls:'abtn-kong',fn:()=>{
hideActs();
playKong();
G.melds[0][pongMeldIdx]={type:'kong',tiles:[drawnTile,drawnTile,drawnTile,drawnTile]};
G.drawn=null;
if(G.wall.length>0){G.drawn=G.wall.pop();G.wallUsed++;}
G.phase='discard';G.selIdx=null;G.selDrawn=false;
updHUD();renderAll();renderWall();
floatNotif('加杠！/ Upgraded to Kong!');
setTurn('加杠！摸牌后打出 / Added to Kong! Discard a tile');
}});
}
const allFourInFull=full.filter(t=>teq(t,drawnTile));
if(allFourInFull.length===4&&matchInHand.length<3&&pongMeldIdx===-1){
}
  }
  if(acts.length>0){
if(acts.length>1||acts[0].cls==='abtn-win'){
acts.push({az:'继续打牌',ae:'Continue',cls:'abtn-skip',fn:()=>hideActs()});
}
showActs(acts);
  } else {
setTurn('🃏 你的回合 — 点选牌，再点打出 / Your turn — tap to select, tap again to discard');
  }
  if(PD.hero?.passive==='thunder'&&!G.thunderUsed){
document.getElementById('skbtn').innerHTML=`<button class="nbtn" style="background:rgba(100,60,220,0.65);border-color:#8860ee;color:#d0c0ff;font-size:0.75rem;padding:4px 12px;" onclick="useThunder()">⚡ 雷击换牌 / Thunder Redraw ← 点我！</button>`;
setTimeout(()=>showAbilityHint('thunder'),2000);
  }
}
function doDiscard(idx,isDrawn){
  if(G.phase!=='discard'||G.cur!==0)return;
  let tile;
  if(isDrawn){tile=G.drawn;G.drawn=null;}
  else{if(G.drawn){G.hands[0]=sortH([...G.hands[0],G.drawn]);G.drawn=null;}tile=G.hands[0][idx];G.hands[0].splice(idx,1);}
  G.selIdx=null;G.selDrawn=false;G.discards[0].push(tile);G.pending=tile;G.pendingFrom=0;G.phase='action';
  _handPeekState = 'auto';
  playDiscard();
  if(PD.activePet==='sparrow'&&Math.random()<0.10){PD.coins+=5;updHUD();floatNotif('🐦 麻雀：弃牌奖励！+5🪙');}
  document.getElementById('skhint').innerHTML='';document.getElementById('skbtn').innerHTML='';const dbw=document.getElementById('discard-btn-wrap');if(dbw)dbw.innerHTML='';
  hideAbilityHint();
  renderAll();setTurn('⏳ 等待其他玩家 / Waiting…');
  setTimeout(()=>checkClaims(0),700);
  clearTimeout(G._watchdog);
  G._watchdog=setTimeout(()=>{if(G&&G.phase==='action'){nextPlayer();}},4000);
}
let _selTime=0;
function clickHand(i){
  if(G.phase!=='discard'||G.cur!==0)return;
  HX.select();G.selIdx=i;G.selDrawn=false;_selTime=Date.now();playClick();renderAll();updSelHint();
}
function dblClickHand(i){if(G.phase!=='discard'||G.cur!==0)return;HX.discard();G.selIdx=i;G.selDrawn=false;doDiscard(i,false);}
function clickDrawn(){
  if(G.phase!=='discard'||G.cur!==0)return;
  HX.select();G.selDrawn=true;G.selIdx=null;_selTime=Date.now();playClick();renderAll();updSelHint();
}
function dblClickDrawn(){if(G.phase!=='discard'||G.cur!==0)return;HX.discard();G.selDrawn=true;G.selIdx=null;doDiscard(null,true);}
function confirmDiscard(){
  if(G.phase!=='discard'||G.cur!==0)return;
  if(G.selDrawn){doDiscard(null,true);}
  else if(G.selIdx!==null){doDiscard(G.selIdx,false);}
}
function updSelHint(){
  const hint=document.getElementById('skhint');
  const wrap=document.getElementById('discard-btn-wrap');
  let t=G.selDrawn?G.drawn:(G.selIdx!==null?G.hands[0][G.selIdx]:null);
  if(!t){
    hint.innerHTML='<span style="color:#4a7a5a;font-size:0.68rem;">选一张牌打出 / Tap a tile to select</span>';
    if(wrap)wrap.innerHTML='';
    return;
  }
  hint.innerHTML='';
  if(!wrap) return;
  // Capture the discard identity NOW, not at click time, to prevent wrong-tile bug on mobile
  const _discardIsDrawn = G.selDrawn;
  const _discardIdx = G.selIdx;
  const _discardTileName = tzh(t);
  wrap.innerHTML='';
  const btn = document.createElement('button');
  btn.style.cssText = `
    background:linear-gradient(135deg,#b01010,#e02020);
    border:2px solid #ff4444;
    border-radius:14px;
    color:#fff;
    font-family:inherit;
    font-size:0.88rem;
    font-weight:900;
    padding:10px 22px;
    cursor:pointer;
    box-shadow:0 0 18px rgba(220,40,40,0.75),0 4px 10px rgba(0,0,0,0.5);
    letter-spacing:0.02em;
    animation:discard-btn-pulse 0.8s ease-in-out infinite alternate;
    touch-action:manipulation;
    min-width:130px;
    -webkit-tap-highlight-color:transparent;
  `;
  btn.innerHTML = `🀄 打出 ${_discardTileName}&nbsp;/&nbsp;Discard`;
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    if(G.phase!=='discard'||G.cur!==0) return;
    HX.discard();
    if(_discardIsDrawn) doDiscard(null, true);
    else if(_discardIdx !== null) doDiscard(_discardIdx, false);
  });
  wrap.appendChild(btn);
}

function aiTurn(pi){
  if(!G||G.phase==='end')return;
  if(G.cur!==pi)return;
  if(G.wall.length===0){endRound(null,'流局 / Draw Game',0);return;}
  const t=G.wall.pop();G.wallUsed++;
  G.hands[pi]=sortH([...G.hands[pi],t]);renderAll();updHUD();renderWall();
  if(isWin(G.hands[pi],G.melds[pi])){endRound(pi,'自摸 / Tsumo!',0);return;}
  const dc=aiDiscard(pi);
  G.hands[pi].splice(G.hands[pi].findIndex(x=>teq(x,dc)),1);
  G.discards[pi].push(dc);G.pending=dc;G.pendingFrom=pi;G.phase='action';
  playDiscard();renderAll();
  setTimeout(()=>{if(G&&G.phase!=='end')checkHumanClaim(dc,pi);},700);
}

function checkClaims(from){
  if(!G||G.phase==='end')return;
  const tile=G.pending;if(!tile)return;
  for(let p=1;p<=3;p++){if(p===from)continue;if(isWin([...G.hands[p],tile],G.melds[p])){G.hands[p]=sortH([...G.hands[p],tile]);playRon();endRound(p,'荣和 / Ron!',0);return;}}
  for(let p=1;p<=3;p++){if(p===from)continue;if(aiWantPong(p,tile)){aiDoPong(p,tile,from);return;}}
  for(let p=1;p<=3;p++){const pair=aiWantChi(p,tile,from);if(pair){aiDoChi(p,tile,from,pair);return;}}
  nextPlayer();
}
function checkHumanClaim(tile,from){
  const acts=[],full=[...G.hands[0],tile];
  if(isWin(full,G.melds[0]))acts.push({az:'🀄 和牌！',ae:'Win! (Ron)',cls:'abtn-win',fn:()=>{
hideActs();G.hands[0]=sortH(full);
const {coins,tai,reasons}=calcCoins(0,'ron');
if(tai<MIN_TAI){
showModal('⚠️','台数不足 / Too Few Tai',`<strong style="color:#ffaa44">需要至少 ${MIN_TAI} 台才能和牌！/ Need at least ${MIN_TAI} tai to win!</strong><br><br>你现在有 <strong style="color:#ff8888">${tai} 台</strong><br>${reasons.join('<br>')||'无台数役种'}`,[{lz:'继续打牌',le:'Keep Playing',fn:()=>{
hideModal();
// Remove the claimed tile from hand, restore action phase, skip to next player
G.hands[0] = sortH(full.slice(0, -1));
G.phase = 'action'; G.selIdx = null; G.selDrawn = false;
renderAll();
// Continue the claims chain without the player winning
setTimeout(() => checkClaims2(tile, from), 100);
}}]);
} else {
endRound(0,'荣和 / Ron!',coins,tai,reasons);
}
  }});
  const mn=G.hands[0].filter(t=>teq(t,tile));
  if(mn.length>=2)acts.push({az:'碰！',ae:'Pong!',cls:'abtn-pong',fn:()=>{hideActs();humanPong(tile);}});
  if(mn.length>=3)acts.push({az:'杠！',ae:'Kong!',cls:'abtn-kong',fn:()=>{hideActs();humanKong(tile);}});
  if(from===3&&tile.suit!=='honor'){
for(const[a,b]of[[tile.num-2,tile.num-1],[tile.num-1,tile.num+1],[tile.num+1,tile.num+2]]){
if(a<1||b>9)continue;
if(G.hands[0].some(t=>t.suit===tile.suit&&t.num===a)&&G.hands[0].some(t=>t.suit===tile.suit&&t.num===b)){acts.push({az:'吃！',ae:'Chi!',cls:'abtn-chi',fn:()=>{hideActs();humanChi(tile,a,b);}});break;}
}
  }
  if(acts.length>0){
    _handPeekState = 'open';
    updateHandPark();
    acts.push({az:'过',ae:'Skip',cls:'abtn-skip',fn:()=>{hideActs();_handPeekState='auto';checkClaims2(tile,from);}});
    showActs(acts);
  }
  else checkClaims2(tile,from);
}
function checkClaims2(tile,from){
  if(!G||G.phase==='end')return;
  for(let p=1;p<=3;p++){if(p===from)continue;if(isWin([...G.hands[p],tile],G.melds[p])){G.hands[p]=sortH([...G.hands[p],tile]);playRon();endRound(p,'荣和 / Ron!',0);return;}}
  for(let p=1;p<=3;p++){if(p===from)continue;if(aiWantPong(p,tile)){aiDoPong(p,tile,from);return;}}
  nextPlayer();
}

function aiDoPong(pi,tile,from){
  playPongSlam();floatNotif(`${['南','北','西'][pi-1]} 碰！`);
  let rm=0;const nh=[...G.hands[pi]];
  for(let i=0;i<nh.length&&rm<2;i++)if(teq(nh[i],tile)){nh.splice(i,1);i--;rm++;}
  G.hands[pi]=nh;G.melds[pi].push({type:'pong',tiles:[tile,tile,tile]});G.pending=null;
  const dc=aiDiscard(pi);
  const dcIdx=G.hands[pi].findIndex(t=>teq(t,dc));
  if(dcIdx===-1){nextPlayer();return;}
  G.hands[pi].splice(dcIdx,1);
  G.discards[pi].push(dc);G.pending=dc;G.pendingFrom=pi;G.phase='action';
  playDiscard();renderAll();setTimeout(()=>checkHumanClaim(dc,pi),700);
}
function aiDoChi(pi,tile,from,pair){
  playChi();floatNotif(`${['南','北','西'][pi-1]} 吃！`);
  const[a,b]=pair;const nh=[...G.hands[pi]];
  const idxA=nh.findIndex(t=>t.suit===tile.suit&&t.num===a);if(idxA!==-1)nh.splice(idxA,1);
  const idxB=nh.findIndex(t=>t.suit===tile.suit&&t.num===b);if(idxB!==-1)nh.splice(idxB,1);
  G.hands[pi]=nh;G.melds[pi].push({type:'chi',tiles:[a,b,tile.num].sort((x,y)=>x-y).map(n=>mkT(tile.suit,n))});G.pending=null;
  const dc=aiDiscard(pi);
  const dcIdx=G.hands[pi].findIndex(t=>teq(t,dc));
  if(dcIdx===-1){nextPlayer();return;}
  G.hands[pi].splice(dcIdx,1);
  G.discards[pi].push(dc);G.pending=dc;G.pendingFrom=pi;G.phase='action';
  playDiscard();renderAll();setTimeout(()=>checkHumanClaim(dc,pi),700);
}

function humanPong(tile){
  playPong();
  let rm=0;const nh=[...G.hands[0]];
  for(let i=0;i<nh.length&&rm<2;i++)if(teq(nh[i],tile)){nh.splice(i,1);i--;rm++;}
  G.hands[0]=sortH(nh);G.melds[0].push({type:'pong',tiles:[tile,tile,tile]});
  G.pending=null;G.cur=0;G.phase='discard';G.selIdx=null;G.selDrawn=false;G.drawn=null;
  if(PD.hero?.passive==='fortune'){heroAbilityAnim('fortune');PD.coins+=10;updHUD();floatNotif('💰 财神碰牌奖励！+10🪙');}
  if(PD.hero?.passive==='wind'&&tile.suit==='honor'&&HONORS.slice(0,4).includes(tile.num)){heroAbilityAnim('wind');floatNotif('🌪️ 风神碰牌！风牌加成激活！');}
  if(PD.activePet==='fox'&&Math.random()<0.25&&G.wall.length>0){setTimeout(()=>{const extra=G.wall.pop();G.wallUsed++;G.hands[0]=sortH([...G.hands[0],extra]);floatNotif('🦊 九尾狐：碰后摸牌！/ Fox Pong Bonus!');renderAll();renderWall();updHUD();},600);}
  renderAll();setTurn('碰牌！选牌打出 / Pong! Select a tile to discard');
}
function humanKong(tile){
  playKong();G.hands[0]=sortH(G.hands[0].filter(t=>!teq(t,tile)));G.melds[0].push({type:'kong',tiles:[tile,tile,tile,tile]});
  G.pending=null;G.cur=0;G.phase='discard';G.selIdx=null;G.selDrawn=false;
  if(G.wall.length>0){G.drawn=G.wall.pop();G.wallUsed++;}
  updHUD();renderAll();renderWall();setTurn('杠牌！/ Kong! Discard a tile');
}
function humanChi(tile,a,b){
  playChi();const nh=[...G.hands[0]];
  nh.splice(nh.findIndex(t=>t.suit===tile.suit&&t.num===a),1);nh.splice(nh.findIndex(t=>t.suit===tile.suit&&t.num===b),1);
  G.hands[0]=sortH(nh);G.melds[0].push({type:'chi',tiles:[a,b,tile.num].sort((x,y)=>x-y).map(n=>mkT(tile.suit,n))});
  G.pending=null;G.cur=0;G.phase='discard';G.selIdx=null;G.selDrawn=false;G.drawn=null;
  renderAll();setTurn('吃牌！/ Chi! Discard a tile');
}
function nextPlayer(){
  if(!G||G.phase==='end')return;
  clearTimeout(G._watchdog);
  G.pending=null;G.pendingFrom=-1;G.cur=(G.cur+1)%4;renderAll();
  if(G.wall.length===0){endRound(null,'流局 / Draw Game',0);return;}
  phaseDraw();
}
function useThunder(){
  if(!PD.hero||PD.hero.passive!=='thunder'||G.thunderUsed)return;
  if(G.phase!=='discard'||G.cur!==0||G.wall.length===0)return;
  G.thunderUsed=true;
  if(G.drawn)G.wall.unshift(G.drawn);
  G.drawn=G.wall.pop();
  heroAbilityAnim('thunder');
  document.getElementById('skbtn').innerHTML='<span style="font-size:0.65rem;color:#8860aa;">⚡ 雷击已使用 / Used this round</span>';
  hideAbilityHint();
  renderAll();updSelHint();
}

function endRound(winner,label,coins,tai,reasons){
  hideActs();hideAbilityHint();G.phase='end';let body='';
  if(winner===0){
if(PD.hero?.passive==='dragon'){
const drg=G.hands[0].filter(t=>t.suit==='honor'&&['haku','hatsu','chun'].includes(t.num));
if(drg.length>0)heroAbilityAnim('dragon');
}
PD.coins+=coins;PD.slotStreak=0;
if(PD.hero?.passive==='thunder')for(let p=1;p<=3;p++)PD.coins+=10;
playWinBig();spawnConfetti();
const taiStr = tai!=null?`<div style="margin:4px 0;padding:4px 8px;background:rgba(200,150,26,0.15);border-radius:8px;font-size:0.72rem;color:#ffdd88;line-height:1.6;"><strong>🀄 台数: ${tai} 台</strong><br>${(reasons||[]).join(' · ')}</div>`:'';
body=`${taiStr}<strong>获得 / Gained: 🪙 ${coins} 金币</strong><br>总计 / Total: ${PD.coins} 金币`;
  } else if(winner===null){
body='没有人赢，继续下一局！<br>Nobody wins — next round!';
  } else {
const nameMap={1:'南 South',2:'北 North',3:'西 West'};
body=`${nameMap[winner]||'AI'} 赢了！<br>Better luck next round!`;
playLose();
if(PD.activePet==='phoenix'){floatNotif('🦅 凤凰护盾！损失减半！/ Phoenix shield!');}
if(!G.shieldActive)PD.coins=Math.max(0,PD.coins);
  }
  PD.round++;updHUD();
  savePD();
  const winH=winner===0?G.hands[0].concat(G.drawn?[G.drawn]:[]):[];
  showModal(winner===0?'🎉':(winner===null?'🀄':'💀'),label,body,[{lz:'下一局',le:'Next Round',fn:()=>{hideModal();G=null;setTimeout(()=>initRound(),100);}},{lz:'菜单',le:'Menu',fn:()=>{hideModal();G=null;goTitle();}}],winH);
}

function renderAll(){
  if(!G)return;updHUD();setActivePA();renderTop();renderLeft();renderRight();renderBot();renderCenter();
}
function setActivePA(){['top','left','right','bot'].forEach((s,i)=>{const pi=[2,3,1,0][i];const el=document.getElementById('pa-'+s);if(el)el.classList.toggle('active',G.cur===pi);});}
function tileCountBadge(count, vertical){
  const W=28, H=40;
  const wrap=document.createElement('div');
  wrap.style.cssText=`display:flex;flex-direction:${vertical?'column':'row'};align-items:center;justify-content:center;gap:4px;`;
  const svgWrap=document.createElement('div');
  svgWrap.style.cssText='position:relative;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;';
  svgWrap.innerHTML=`
    <svg xmlns="http://www.w3.org/2000/svg" width="${W+4}" height="${H+4}" viewBox="0 0 ${W+4} ${H+4}" style="overflow:visible;filter:drop-shadow(2px 3px 0px #5a3800) drop-shadow(2px 4px 6px rgba(0,0,0,0.55));">
      <defs>
        <linearGradient id="tileFaceGrad" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%"   stop-color="#fffef8"/>
          <stop offset="50%"  stop-color="#fdf6d0"/>
          <stop offset="100%" stop-color="#f0e080"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="${W}" height="${H}" rx="3" ry="3"
            fill="url(#tileFaceGrad)" stroke="#7a5808" stroke-width="1.5"/>
      <line x1="4" y1="3.5" x2="${W}" y2="3.5" stroke="rgba(255,255,255,0.9)" stroke-width="1" stroke-linecap="round"/>
      <rect x="5" y="5" width="${W-6}" height="${H-6}" rx="1.5" ry="1.5"
            fill="none" stroke="rgba(180,140,30,0.25)" stroke-width="0.75"/>
    </svg>
    <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      font-size:0.72rem;font-weight:900;color:#7a5808;letter-spacing:-0.02em;
      text-shadow:0 1px 0 rgba(255,255,255,0.7);pointer-events:none;line-height:1;">×${count}</span>`;
  wrap.appendChild(svgWrap);
  return wrap;
}

function updateOpponentLabel(pi){
  const ids={1:'lbl-right',2:'lbl-top',3:'lbl-left'};
  const el=document.getElementById(ids[pi]);
  if(!el)return;
  const discN=G.discards[pi]?G.discards[pi].length:0;
  const meldN=G.melds[pi]?G.melds[pi].length:0;
  const nameEl=el.querySelector('.lz');
  if(!nameEl)return;
  let existing=nameEl.dataset.baseName;
  if(!existing){nameEl.dataset.baseName=nameEl.textContent;existing=nameEl.textContent;}
  let suffix='';
  if(discN>0) suffix+=` 🗑${discN}`;
  if(meldN>0) suffix+=` 🀄${meldN}`;
  nameEl.textContent=existing+(suffix?` ·${suffix}`:'');
}

function renderTop(){
  const pi=2,th=document.getElementById('th-top');
  th.innerHTML='';
  th.style.flexWrap='wrap';
  th.style.justifyContent='center';
  th.style.maxWidth='100%';
  th.style.gap='3px';
  if(G.hands[pi].length>0) th.appendChild(tileCountBadge(G.hands[pi].length, false));
  renderMelds('tm-top',pi,'t-xs');
  renderDisc('td-top',pi,'t-xs');
  updateOpponentLabel(pi);
}
function renderLeft(){
  const pi=3,th=document.getElementById('th-left');
  th.innerHTML='';
  if(G.hands[pi].length>0)th.appendChild(tileCountBadge(G.hands[pi].length, true));
  renderMelds('tm-left',pi,'t-xs');
  renderDisc('td-left',pi,'t-xs');
  updateOpponentLabel(pi);
}
function renderRight(){
  const pi=1,th=document.getElementById('th-right');
  th.innerHTML='';
  if(G.hands[pi].length>0)th.appendChild(tileCountBadge(G.hands[pi].length, true));
  renderMelds('tm-right',pi,'t-xs');
  renderDisc('td-right',pi,'t-xs');
  updateOpponentLabel(pi);
}
let _handPeekState = 'auto';
let _boardTapListenerAdded = false;

function _initBoardTapListener(){
  if(_boardTapListenerAdded) return;
  _boardTapListenerAdded = true;
  const board = document.querySelector('.board');
  if(!board) return;
  board.addEventListener('click', function(e){
    if(e.target.closest('button, .abtn, .nbtn, .btn, .tile, .overlay, .modal, .actpanel, .ai-roster-overlay, #discard-history-overlay, #hand-peek-handle, #pa-bot .tile')) return;
    // Tapping the board (including the pa-bot background area but not tiles/buttons) hides hand
    boardTapHideHand();
  });
}

function updateHandPark(){
  const pa = document.getElementById('pa-bot');
  const peekLabel = document.getElementById('peek-label');
  if(!pa) return;

  const isMyTurn = G && G.phase==='discard' && G.cur===0;

  let show;
  if(_handPeekState === 'open')   show = true;
  else if(_handPeekState === 'closed') show = false;
  else show = isMyTurn;

  if(show){
    pa.classList.remove('hand-parked');
    pa.classList.add('hand-active');
    if(peekLabel) peekLabel.textContent = isMyTurn ? '👆 点上方隐手 / Tap board to hide' : '手牌 / Tap to close';
  } else {
    pa.classList.remove('hand-active');
    pa.classList.add('hand-parked');
    if(peekLabel){
      if(G && G.phase==='action') peekLabel.textContent = '⏳ 等待 · 👆 手牌';
      else if(isMyTurn) peekLabel.textContent = '👆 你的回合！点此看牌';
      else peekLabel.textContent = '👆 手牌 / Tap to peek';
    }
  }
}

function toggleHandPeek(e){
  if(e) e.stopPropagation();
  const pa = document.getElementById('pa-bot');
  if(!pa) return;
  const isOpen = pa.classList.contains('hand-active');
  if(isOpen){
    _handPeekState = 'closed';
  } else {
    _handPeekState = 'open';
  }
  HX.soft();
  updateHandPark();
}

function boardTapHideHand(){
  // Allow board tap to hide hand even on your turn
  if(_handPeekState !== 'closed'){
    _handPeekState = 'closed';
    HX.tap();
    updateHandPark();
  }
}

function renderBot(){
  const th=document.getElementById('th-bot');th.innerHTML='';
  G.hands[0].forEach((t,i)=>{const isSel=G.selIdx===i&&!G.selDrawn;const el=tileEl(t,'t-lg','ck'+(isSel?' sel':''),()=>clickHand(i));el.ondblclick=(e)=>{e.stopPropagation();dblClickHand(i);};addDoubleTap(el,()=>dblClickHand(i));if(window._attachTileHoldPreview)_attachTileHoldPreview(el,()=>t);th.appendChild(el);});
  if(G.drawn){const sep=document.createElement('div');sep.className='dsep';th.appendChild(sep);const drawnEl=tileEl(G.drawn,'t-lg','ck drawn'+(G.selDrawn?' sel':''),clickDrawn);drawnEl.ondblclick=(e)=>{e.stopPropagation();dblClickDrawn();};addDoubleTap(drawnEl,()=>dblClickDrawn());if(window._attachTileHoldPreview)_attachTileHoldPreview(drawnEl,()=>G.drawn);th.appendChild(drawnEl);}
  renderMelds('tm-bot',0,'t-sm');
  renderDisc('td-bot',0,'t-disc');
  requestAnimationFrame(()=>{
const available=window.innerWidth - 8;
const actual=th.scrollWidth;
if(actual>available){
const scale=Math.max(0.55, available/actual);
th.style.zoom=scale;
th.style.transform='';
th.style.transformOrigin='';
} else {
th.style.zoom='1';
th.style.transform='';
}
  });
  updateHandPark();
}
function renderMelds(id,pi,sz){const el=document.getElementById(id);if(!el)return;el.innerHTML='';G.melds[pi].forEach(m=>{const g=document.createElement('div');g.className='mgrp';m.tiles.forEach(t=>g.appendChild(tileEl(t,sz)));el.appendChild(g);});}
function renderDisc(id,pi,sz){const el=document.getElementById(id);if(!el)return;el.innerHTML='';G.discards[pi].forEach((t,i)=>{const last=i===G.discards[pi].length-1&&G.pendingFrom===pi;el.appendChild(tileEl(t,sz,last?'clm':''));});}
function renderCenter(){
  document.getElementById('cwall').textContent=G.wall.length;
  const cl=document.getElementById('clast'),lbl=document.getElementById('cdlbl');
  const hint=document.getElementById('center-discard-hint');
  if(G.pending){
    lbl.style.display='block';
    cl.innerHTML='';
    cl.appendChild(tileEl(G.pending,'t-md','clm'));
    if(hint)hint.style.display='block';
  } else {
    let latestTile=null;
    if(G.discards&&G.discards.some(d=>d.length>0)){
      for(let pi=0;pi<4;pi++){
        if(G.discards[pi]&&G.discards[pi].length>0){
          latestTile=G.discards[pi][G.discards[pi].length-1];
        }
      }
    }
    if(latestTile){
      lbl.style.display='block';
      cl.innerHTML='';
      cl.appendChild(tileEl(latestTile,'t-md',''));
      if(hint)hint.style.display='block';
    } else {
      lbl.style.display='none';
      cl.innerHTML='';
      if(hint)hint.style.display='none';
    }
  }
  const hints=[];
  if(G.wall.length<10)hints.push('⚠️ 快结束了！');
  document.getElementById('chint').textContent=hints.join(' ');
  renderWall();
}
function openDiscardHistory(){
  if(!G||!G.discards)return;
  const overlay=document.getElementById('discard-history-overlay');
  const body=document.getElementById('discard-history-body');
  body.innerHTML='';
  const seats=[
    {pi:2,label:'北 / North'},
    {pi:3,label:'西 / West'},
    {pi:1,label:'东 / East'},
    {pi:0,label:'你 / You'},
  ];
  seats.forEach(({pi,label})=>{
    if(!G.discards[pi]||G.discards[pi].length===0)return;
    const sec=document.createElement('div');
    sec.className='dh-section';
    const heading=document.createElement('div');
    heading.className='dh-heading';
    heading.textContent=label+' ('+G.discards[pi].length+'张)';
    sec.appendChild(heading);
    const row=document.createElement('div');
    row.className='dh-tiles';
    G.discards[pi].forEach((t,i)=>{
      const last=(i===G.discards[pi].length-1&&G.pendingFrom===pi);
      row.appendChild(tileEl(t,'t-sm',last?'clm':''));
    });
    sec.appendChild(row);
    body.appendChild(sec);
  });
  if(body.children.length===0){
    body.innerHTML='<div style="text-align:center;color:#5a886a;padding:1rem;">暂无弃牌 / No discards yet</div>';
  }
  overlay.classList.remove('hidden');
}
function closeDiscardHistory(){
  document.getElementById('discard-history-overlay').classList.add('hidden');
}
function setTurn(msg){
  document.getElementById('tbar').textContent=msg;
  if(window.innerWidth>window.innerHeight){
document.getElementById('hround').title=msg;
  }
}

function showActs(acts){const p=document.getElementById('actpanel');p.innerHTML='';p.classList.remove('hidden');acts.forEach(a=>{const b=document.createElement('button');b.className='abtn '+a.cls;b.innerHTML=`<span class="az">${a.az}</span><span class="ae">${a.ae}</span>`;b.onclick=()=>{playClick();a.fn();};p.appendChild(b);});}
function hideActs(){document.getElementById('actpanel').classList.add('hidden');}

function showModal(ico,title,body,btns,tiles){
  document.getElementById('mico').textContent=ico;document.getElementById('mtitle').textContent=title;document.getElementById('mbody').innerHTML=body;
  const mt=document.getElementById('mtiles');mt.innerHTML='';(tiles||[]).forEach(t=>mt.appendChild(tileEl(t,'t-sm')));
  const mb=document.getElementById('mbtns');mb.innerHTML='';btns.forEach(b=>{const el=document.createElement('button');el.className='btn btn-gold';el.innerHTML=`${b.lz} / ${b.le}`;el.onclick=()=>{playClick();b.fn();};mb.appendChild(el);});
  document.getElementById('overlay').classList.remove('hidden');
}
function hideModal(){document.getElementById('overlay').classList.add('hidden');}

function showTaiRules(){
  const rulesHTML=`
<div style="text-align:left;font-size:0.75rem;line-height:1.8;color:#aaccdd;">
<div style="font-size:0.82rem;font-weight:700;color:#ffdd88;margin-bottom:6px;">🇸🇬 新加坡麻将 台数规则</div>
<div style="color:#ff9966;font-weight:700;margin-bottom:4px;">最低 1 台才能和牌！/ Minimum 1 Tai to Win!</div>
<table style="width:100%;border-collapse:collapse;font-size:0.72rem;">
<tr style="color:#ffdd88"><td style="padding:1px 4px;"><strong>役种 Yaku</strong></td><td style="text-align:right;padding:1px 4px;"><strong>台数</strong></td></tr>
<tr><td>自摸 Tsumo</td><td style="text-align:right;color:#88ff88">+1</td></tr>
<tr><td>门清 Concealed Hand</td><td style="text-align:right;color:#88ff88">+1</td></tr>
<tr><td>役牌 (中/发/白) Dragon Pong</td><td style="text-align:right;color:#88ff88">+1 each</td></tr>
<tr><td>圈风碰 Round Wind Pong</td><td style="text-align:right;color:#88ff88">+1</td></tr>
<tr><td>门风碰 Seat Wind Pong</td><td style="text-align:right;color:#88ff88">+1</td></tr>
<tr><td>七对 Seven Pairs</td><td style="text-align:right;color:#ffcc44">+4</td></tr>
<tr><td>对对和 All Pongs</td><td style="text-align:right;color:#ffcc44">+3</td></tr>
<tr><td>混一色 Half Flush</td><td style="text-align:right;color:#ffcc44">+3</td></tr>
<tr><td>清一色 Full Flush</td><td style="text-align:right;color:#ff8888">+6</td></tr>
<tr><td>混老头 Mixed Terminals</td><td style="text-align:right;color:#ff8888">+8</td></tr>
<tr><td>字一色 All Honors</td><td style="text-align:right;color:#ff8888">+10</td></tr>
<tr><td>大三元 Big Three Dragons</td><td style="text-align:right;color:#ff4444">+16</td></tr>
<tr><td>大四喜 Big Four Winds</td><td style="text-align:right;color:#ff4444">+16</td></tr>
</table>
<div style="margin-top:8px;font-size:0.7rem;color:#6a9a7a;">台数越高，奖励越多！<br>More tai = more coins! 🪙</div>
</div>`;
  showModal('🀄','台数规则 / Tai Rules',rulesHTML,[{lz:'明白了',le:'Got it!',fn:()=>hideModal()}]);
}

function updLiveTai(){
  if(!G||G.cur!==0)return;
  const full=[...G.hands[0],...(G.drawn?[G.drawn]:[])];
  if(isWin(full,G.melds[0])){
const method=G.drawn?'tsumo':'ron';
const {tai,reasons}=calcTai(full,G.melds[0],method,G.roundWind,'east');
const col=tai>=MIN_TAI?'#88ff88':'#ff8888';
return `<span style="color:${col};font-weight:700;margin-left:8px;">⬡ ${tai}台${tai<MIN_TAI?' (需'+MIN_TAI+'台)':' ✓'}</span>`;
  }
  return '';
}

function floatNotif(msg){
  const el=document.createElement('div');el.className='floatnotif';el.textContent=msg;
  document.body.appendChild(el);el.addEventListener('animationend',()=>el.remove());
}

function spawnConfetti(){
  const c=document.getElementById('cfc');c.innerHTML='';
  const colors=['#f0c040','#e84040','#40a0e0','#60e060','#e040e0','#ffffff','#ff8c00','#ff44cc'];
  for(let i=0;i<90;i++){
const p=document.createElement('div');p.className='cfp';
p.style.left=Math.random()*100+'vw';p.style.background=colors[~~(Math.random()*colors.length)];
p.style.animationDuration=(1.2+Math.random()*2.5)+'s';p.style.animationDelay=(Math.random()*0.8)+'s';
p.style.transform=`rotate(${Math.random()*360}deg)`;p.style.width=(5+Math.random()*8)+'px';p.style.height=(8+Math.random()*12)+'px';
c.appendChild(p);p.addEventListener('animationend',()=>p.remove());
  }
}

const BOWL_DEPOSIT_RATE = 0.40;
let bowlCashoutCount = 0;

function bowlDeposit(spinCost) {
  const deposit = Math.round(spinCost * BOWL_DEPOSIT_RATE);
  PD.bowlCoins = (PD.bowlCoins||0) + deposit;
  PD.bowlMisses = (PD.bowlMisses||0) + 1;
  spawnBowlCoins(deposit);
  setTimeout(() => updateBowlUI(true), 300);
}

function spawnBowlCoins(amount) {
  const rain = document.getElementById('bowl-coin-rain');
  if (!rain) return;
  const count = Math.min(6, Math.max(2, Math.floor(amount/10)));
  for (let i = 0; i < count; i++) {
setTimeout(() => {
const coin = document.createElement('div');
coin.className = 'bowl-coin';
coin.textContent = '🪙';
coin.style.left = (30 + Math.random() * 140) + 'px';
coin.style.animationDelay = (Math.random() * 0.2) + 's';
rain.appendChild(coin);
coin.addEventListener('animationend', () => coin.remove());
}, i * 80);
  }
}

function updateBowlUI(animated) {
  const bowlCoins = PD.bowlCoins || 0;
  const target    = getBowlTarget();
  const pct       = Math.min(1, bowlCoins / target);

  const setLayer = (id, show, amt) => {
const el = document.getElementById(id);
if (!el) return;
if (!show) { el.setAttribute('opacity','0'); return; }
el.setAttribute('opacity', amt.toFixed(2));
  };
  setLayer('bowl-coins-layer0', pct > 0.01,  Math.min(1, pct * 8));
  setLayer('bowl-coins-layer1', pct > 0.22,  Math.min(1, (pct - 0.22) * 4));
  setLayer('bowl-coins-layer2', pct > 0.52,  Math.min(1, (pct - 0.52) * 4));
  setLayer('bowl-coins-layer3', pct > 0.80,  Math.min(1, (pct - 0.80) * 6));

  const sparkles = document.getElementById('bowl-sparkles');
  if (sparkles) sparkles.setAttribute('opacity', pct > 0.1 ? '1' : '0');

  const rimGlow = document.getElementById('bowl-rim-glow');
  if (rimGlow) {
const w = pct > 0.5 ? (pct - 0.5) * 16 : 0;
rimGlow.setAttribute('stroke-width', w.toFixed(1));
rimGlow.setAttribute('opacity', pct > 0.5 ? Math.min(0.9, (pct-0.5)*1.8).toFixed(2) : '0');
  }

  const svgEl = document.getElementById('dragon-bowl-svg');
  if (svgEl) {
const g = 0.75 + pct * 0.25;
const px1 = Math.round(18 + pct * 22);
const px2 = Math.round(40 + pct * 50);
svgEl.style.filter = `drop-shadow(0 0 ${px1}px rgba(255,200,0,${g.toFixed(2)})) drop-shadow(0 0 ${px2}px rgba(255,140,0,${(g*0.7).toFixed(2)}))`;
svgEl.style.animation = pct > 0.05 ? `bowl-gold-pulse ${Math.max(1, 2.5 - pct * 1.5).toFixed(1)}s ease-in-out infinite alternate` : '';
  }

  const stage = pct < 0.25 ? 0 : pct < 0.55 ? 1 : pct < 0.80 ? 2 : 3;
  const wrap = document.getElementById('dragon-bowl-wrap');
  if (wrap) {
wrap.classList.remove('bowl-stage-0','bowl-stage-1','bowl-stage-2','bowl-stage-3');
wrap.classList.add('bowl-stage-' + stage);
wrap.classList.toggle('full', pct >= 1);
  }

  const countText = document.getElementById('bowl-count-text');
  if (countText) {
countText.setAttribute('opacity', pct > 0.08 ? '1' : '0');
countText.textContent = bowlCoins + ' 🪙';
  }

  const cashoutBtn = document.getElementById('bowl-cashout-btn');
  const cashoutPreview = document.getElementById('bowl-cashout-preview');
  if (cashoutBtn) {
if (pct >= 0.3) {
cashoutBtn.classList.remove('hidden');
if (cashoutPreview) {
const stageLabel = pct >= 1 ? '🔥 满盆！/ FULL BOWL!' : pct >= 0.8 ? '🐲 快满了！/ Almost full!' : pct >= 0.5 ? '⚡ 积累中 / Building…' : '💫 开始积累 / Just started…';
cashoutPreview.textContent = stageLabel;
}
} else {
cashoutBtn.classList.add('hidden');
}
  }

  const sub = document.getElementById('bowl-subtitle');
  if (sub) {
const flavours = [
['💤 金龙安睡…落空则喂盆', 'Dragon sleeps… misses feed the bowl'],
['👁️ 金龙感应到金币…', 'Dragon senses gold…'],
['🐲 金龙苏醒！宝盆沸腾！', 'Dragon awakes! Bowl overflows!'],
['🔥 满盆咆哮！快领取！', 'FULL BOWL! Collect now!'],
];
const [zh, en] = pct >= 1 ? flavours[3] : flavours[stage];
sub.innerHTML = `${zh}<br><span style="color:#6a5020">${en}</span>`;
  }

  if (pct >= 1) setTimeout(() => bowlCashout(true), 900);
}
function getBowlTarget() {
  return Math.min(1000, 400 + bowlCashoutCount * 80);
}

function calcBowlPayout(pct) {
  const mult = pct >= 1 ? 1.3 : (pct >= 0.75 ? 1.15 : pct >= 0.5 ? 1.05 : 0.9);
  return Math.round((PD.bowlCoins || 0) * mult);
}

function bowlCashout(auto) {
  const bowlCoins = PD.bowlCoins || 0;
  if (bowlCoins <= 0) return;
  const pct = Math.min(1, bowlCoins / getBowlTarget());
  const payout = calcBowlPayout(pct);
  const isFull = pct >= 1;

  PD.coins += payout;
  PD.bowlCoins = 0;
  PD.bowlMisses = 0;
  bowlCashoutCount++;
  PD.bowlTarget = getBowlTarget();

  playWinBig();
  spawnConfetti();

  const burst = document.createElement('div');
  burst.className = 'bowl-burst';
  burst.innerHTML = `<div class="bowl-burst-text">🐲 +${payout}🪙<br>${isFull ? '满盆大奖！FULL BOWL!' : '宝盆兑换！Cash Out!'}</div>`;
  document.body.appendChild(burst);
  burst.addEventListener('animationend', () => burst.remove());

  updTitleCoins();
  document.getElementById('gcoins').textContent = PD.coins;
  savePD();

  setTimeout(() => updateBowlUI(false), 100);

  showModal('🐲', isFull ? '满盆大奖！/ Full Bowl Jackpot!' : '宝盆兑换！/ Dragon Bowl Cashout!',
`<strong style="color:#f0c030;font-size:1.2rem">+${payout} 🪙</strong><br>
${isFull ? '<span style="color:#ffe066">满盆奖励 ×1.5！/ Full bowl ×1.5 bonus!</span><br>' : ''}
<span style="color:#6a8a6a;font-size:0.75rem">下次宝盆需要更多才能装满<br>Next bowl fills slower — keeps getting harder!</span>`,
[{lz:'收下！',le:'Collect!',fn:()=>hideModal()}]
  );
}

function renderBowlInitial() {
  updateBowlUI(false);
}

function initSlotLights(){
  const l=document.getElementById('slot-lights');l.innerHTML='';
  for(let i=0;i<12;i++){const d=document.createElement('div');d.className='slot-light';d.style.animationDelay=(i*0.08)+'s';l.appendChild(d);}
}

let slotGrid = [[null,null,null],[null,null,null],[null,null,null]];

function initReels(){
  for(let r=0;r<3;r++){
const reel=document.getElementById('reel-'+r);
reel.innerHTML='';
for(let i=0;i<5;i++){
const sym=spinSymbol();
const item=document.createElement('div');
item.className='reel-item';
item.innerHTML=sym.s;
reel.appendChild(item);
}
reel.style.transform='translateY(-96px)';
const wrap = reel.parentElement;
wrap.querySelectorAll('.reel-div').forEach(e=>e.remove());
[1,2].forEach(row=>{
const div=document.createElement('div');
div.className='reel-div';
div.style.top=(row*96)+'px';
wrap.appendChild(div);
});
  }
  ['pl-top','pl-mid','pl-bot','pl-top-r','pl-mid-r','pl-bot-r'].forEach(id=>{
const el=document.getElementById(id);if(el)el.classList.remove('active');
  });
  document.getElementById('payline-overlay').innerHTML='';
}

let currentSymbols=[null,null,null];

function spinSlots(numSpins){
  if(slotSpinning)return;
  HX.medium();
  const cost=numSpins===1?50:120;
  if((PD.freeSpins||0)>=numSpins){
PD.freeSpins-=numSpins;
floatNotif(`🎁 免费旋转！剩余 ${PD.freeSpins} 次 / Free spin! ${PD.freeSpins} left`);
  } else if((PD.freeSpins||0)>0 && numSpins===3){
const free=PD.freeSpins;
const paid=numSpins-free;
const partCost=paid===1?50:120;
if(PD.coins<partCost){floatNotif(`金币不足！需要 ${partCost}🪙`);return;}
PD.freeSpins=0;
PD.coins-=partCost;
floatNotif(`🎁 使用 ${free} 次免费旋转！/ Used ${free} free spin(s)`);
  } else {
if(PD.coins<cost){floatNotif(`金币不足！需要 ${cost}🪙`);return;}
PD.coins-=cost;
  }
  document.getElementById('gcoins').textContent=PD.coins;
  updTitleCoins();
  updFreeSpinBtn();
  slotSpinning=true;
  document.getElementById('btn-spin1').disabled=true;
  document.getElementById('btn-spin3').disabled=true;
  document.getElementById('slot-result-area').innerHTML='';
  document.getElementById('payline-overlay').innerHTML='';
  ['pl-top','pl-mid','pl-bot','pl-top-r','pl-mid-r','pl-bot-r'].forEach(id=>{
const el=document.getElementById(id);if(el)el.classList.remove('active');
  });
  playSlotSpin();

  const newGrid=[[],[],[]];
  for(let r=0;r<3;r++) for(let row=0;row<3;row++) newGrid[r].push(spinSymbol());

  let stopped = 0;
  const stopTimes = [900, 1150, 1400];
  stopTimes.forEach((t, r) => {
animateReel3(r, newGrid[r], t, () => {
stopped++;
if(stopped === 3){
slotGrid = newGrid;
currentSymbols = [newGrid[0][1], newGrid[1][1], newGrid[2][1]];
setTimeout(()=>resolveSlot5(newGrid, numSpins), 300);
}
});
  });
}

function animateReel3(reelIdx, finalSyms, spinDur, cb){
  const reel=document.getElementById('reel-'+reelIdx);
  let interval=setInterval(()=>{
reel.innerHTML='';
for(let i=0;i<5;i++){
const item=document.createElement('div');
item.className='reel-item';
item.innerHTML=spinSymbol().s;
reel.appendChild(item);
}
  },80);
  setTimeout(()=>{
clearInterval(interval);
reel.innerHTML='';
const extras=[spinSymbol(), spinSymbol()];
[extras[0], finalSyms[0], finalSyms[1], finalSyms[2], extras[1]].forEach((sym,i)=>{
const item=document.createElement('div');
item.className='reel-item';
item.innerHTML=sym.s;
item.dataset.row=i-1;
reel.appendChild(item);
});
reel.style.transform='translateY(-96px)';
playSlotStop();
cb();
  }, spinDur);
}

const PAYLINES = [
  { name:'上线 Top',    cells:[[0,0],[1,0],[2,0]], labelIds:['pl-top','pl-top-r'],   color:'#ff4444' },
  { name:'中线 Middle', cells:[[0,1],[1,1],[2,1]], labelIds:['pl-mid','pl-mid-r'],   color:'#ffd700' },
  { name:'下线 Bottom', cells:[[0,2],[1,2],[2,2]], labelIds:['pl-bot','pl-bot-r'],   color:'#44aaff' },
  { name:'对角↘ Diag', cells:[[0,0],[1,1],[2,2]], labelIds:[],                       color:'#ff44ff' },
  { name:'对角↗ Diag', cells:[[0,2],[1,1],[2,0]], labelIds:[],                       color:'#44ffaa' },
];

function resolveSlot5(grid, numSpins){
  slotSpinning=false;
  document.getElementById('btn-spin1').disabled=false;
  document.getElementById('btn-spin3').disabled=false;

  let totalWon=0, banners=[], winningCells=new Set(), winningPaylines=[];

  PAYLINES.forEach((pl, pli)=>{
const [s0,s1,s2] = pl.cells.map(([r,row])=>grid[r][row]);
const allWin = s0.win && s1.win && s2.win;
const allSame = allWin && s0.v===s1.v && s1.v===s2.v;
const pairLeft  = s0.win && s1.win && s0.v===s1.v;
const pairMid   = s1.win && s2.win && s1.v===s2.v;
const pairOuter = s0.win && s2.win && s0.v===s2.v;
const anyTwo  = !allSame && (pairLeft || pairMid || pairOuter);
let won=0, banner='';

if(allSame && s0.v==='dragon'){
won=1000; banner=`🪙🪙🪙 JACKPOT!! (${pl.name})`;
playSlotJackpot(); spawnConfetti();
setTimeout(()=>triggerJackpotAnimation(1000), 350);
const locked=PETS.filter(p=>!PD.pets[p.id]);
if(locked.length>0){
const p=locked[~~(Math.random()*locked.length)];
unlockPet(p.id);
setTimeout(()=>showModal('🐾','宠物解锁！/ Pet Unlocked!',
`<strong style="font-size:1.6rem">${p.emoji}</strong><br><strong style="color:#ffcc44">${p.zh} / ${p.en}</strong><br><span style="color:#88cc88">${p.dz}</span><br><br>点击宠物图标装备！/ Tap pet to equip!`,
[{lz:'太棒了！',le:'Awesome!',fn:()=>hideModal()}]),5800);
}
} else if(allSame && s0.v==='seven'){
won=500; banner=`🎰 777 BIG WIN! (${pl.name})`; HX.winBig(); playSlotBigWin(); spawnConfetti(); giveRandomItem('legendary');
} else if(allSame && s0.v==='mj'){
won=200; banner=`🀄🀄🀄 WIN! (${pl.name})`; HX.win(); playSlotMatch(); setTimeout(playSlotBigWin,350); giveRandomItem('rare');
} else if(allSame){
won=100; banner=`${s0.s}${s1.s}${s2.s} WIN! (${pl.name})`; HX.medium(); playSlotMatch();
} else if(anyTwo){
won=30; banner=`对子 +30🪙 (${pl.name})`; HX.soft(); playTone(550,'sine',0.1,0.2,0.1);
}

if(won>0){
totalWon+=won;
banners.push({text:banner, cls: won>=1000?'jackpot':won>=500?'bigwin':'win', color:pl.color});
winningPaylines.push(pli);
pl.cells.forEach(([r,row])=>winningCells.add(r+','+row));
pl.labelIds.forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('active');});
}
  });

  if(winningCells.size>0){
drawPaylineOverlay(winningPaylines);
  }

  const hasDragonOnGrid = grid.some(reel => reel.some(sym => sym.v === 'dragon'));

  if(banners.length===0){
PD.slotStreak=0;
playTone(200,'sine',0.15,0.2,0.15);
if(hasDragonOnGrid){
bowlDeposit(numSpins===3 ? 40 : 50);
} else {
bowlDeposit(numSpins===3 ? 8 : 10);
}
  } else {
if(totalWon>0) PD.slotStreak++;
if(hasDragonOnGrid) bowlDeposit(numSpins===3 ? 40 : 50);
  }
  if(PD.slotStreak>=3 && totalWon>0){ totalWon=Math.round(totalWon*1.5); banners.push({text:'🔥 ×1.5 连赢 STREAK!',cls:'win',color:'#ff8800'}); }
  PD.coins+=totalWon;
  PD.coins=Math.max(0,PD.coins);
  document.getElementById('gcoins').textContent=PD.coins;
  document.getElementById('gstreak').textContent=PD.slotStreak;
  updTitleCoins();
  savePD();

  const area=document.getElementById('slot-result-area');
  if(banners.length){
area.innerHTML=banners.map(b=>`<div class="slot-result-banner ${b.cls}" style="border-left:3px solid ${b.color};padding-left:6px;margin-bottom:2px;font-size:0.95rem">${b.text}</div>`).join('')
+`<div style="font-size:0.72rem;color:#886666;margin-top:4px">本次: +${totalWon}🪙 | 总计: ${PD.coins}🪙</div>`;
  } else {
area.innerHTML=`<div class="slot-result-banner lose">💨 No match… Try again!</div><div style="font-size:0.7rem;color:#886666;margin-top:4px">总计: ${PD.coins}🪙</div>`;
  }

  if(numSpins>1) setTimeout(()=>spinSlots(numSpins-1),1400);
}

const PAYLINE_COLOR_CLASS = {
  '#ff4444': 'red',
  '#ffd700': 'gold',
  '#44aaff': 'blue',
  '#ff44ff': 'magenta',
  '#44ffaa': 'green',
};

function drawPaylineOverlay(plIndices){
  document.querySelectorAll('.reel-item').forEach(el=>{
el.classList.remove('win-cell','win-cell-red','win-cell-gold','win-cell-blue','win-cell-magenta','win-cell-green');
el.style.outline = '';
el.style.boxShadow = '';
el.style.zIndex = '';
delete el.dataset.winColors;
  });

  plIndices.forEach(pli=>{
const pl = PAYLINES[pli];
const colorKey = pl.color;
const suffix = PAYLINE_COLOR_CLASS[colorKey] || 'gold';
pl.cells.forEach(([r, row])=>{
const reel = document.getElementById('reel-'+r);
if(!reel) return;
const items = reel.querySelectorAll('.reel-item');
const item = items[row + 1];
if(!item) return;
item.classList.remove('win-cell','win-cell-red','win-cell-gold','win-cell-blue','win-cell-magenta','win-cell-green');
item.classList.add('win-cell-' + suffix);
item.style.zIndex = '6';
});
  });

  const overlay = document.getElementById('payline-overlay');
  if(!overlay) return;
  const reelW = 72, reelH = 288;
  const rowCY = [48, 144, 240];
  const reelCX = [36, 108+4, 180+8];
  const lines = plIndices.map(pli=>{
const pl = PAYLINES[pli];
const pts = pl.cells.map(([r,row])=>`${reelCX[r]},${rowCY[row]}`);
return `<line x1="${reelCX[pl.cells[0][0]]}" y1="${rowCY[pl.cells[0][1]]}" x2="${reelCX[pl.cells[2][0]]}" y2="${rowCY[pl.cells[2][1]]}" stroke="${pl.color}" stroke-width="3" stroke-linecap="round" opacity="0.75" stroke-dasharray="6 4"><animate attributeName="opacity" values="0.4;0.9;0.4" dur="0.8s" repeatCount="indefinite"/></line>`;
  }).join('');
  const totalW = reelCX[2] + 36;
  overlay.innerHTML = `<svg viewBox="0 0 ${totalW} ${reelH}" preserveAspectRatio="none" style="position:absolute;top:0;left:32px;width:calc(100% - 64px);height:${reelH}px;pointer-events:none;z-index:8;">${lines}</svg>`;
}

function updFreeSpinBtn(){
  const fs=PD.freeSpins||0;
  const b1=document.getElementById('btn-spin1');
  const b3=document.getElementById('btn-spin3');
  if(b1){
if(fs>=1){ b1.innerHTML=`🎁 FREE SPIN × 1<br><small style="font-weight:400;font-size:0.68rem;color:#aaffaa">免费旋转 剩余${fs}</small>`; }
else { b1.innerHTML=`SPIN × 1<br><small style="font-weight:400;font-size:0.68rem">50 🪙</small>`; }
  }
  if(b3){
if(fs>=3){ b3.innerHTML=`🎁 FREE SPIN × 3<br><small style="font-weight:400;font-size:0.68rem;color:#aaffaa">免费旋转 剩余${fs}</small>`; }
else { b3.innerHTML=`SPIN × 3<br><small style="font-weight:400;font-size:0.68rem">120 🪙</small>`; }
  }
}

const AI_ROSTER = [
  {
id:'lily', name:'Auntie Lily', nameZh:'莉莉阿姨', emoji:'👵',
style:'aggressive', borderColor:'#ff6644', textColor:'#ffaa88',
bio:'碰什么都碰！超aggressive！',
lines:{
draw:[['哎哟！好牌！','Aiyoh! Good tile lah!'],['来来来！','Lai lai lai!'],['每次都这样！','Every time like this!'],['哇，不错不错！','Wah, not bad not bad!']],
discard:[['不要你了！','Don\'t want you lah!'],['打出去！Throw!','Throw out!'],['这张没用！','This tile useless one!'],['不要不要！','No need no need!']],
pong:[['碰！碰！碰！哈哈哈！','PONG PONG PONG! Hahaha!'],['碰啦！我早等着呢！','PONG LAH! I been waiting!'],['你给我的！谢谢你！','You give me! Thank you ah!']],
chi:[['吃！吃掉你！','Chi! Eat you!'],['吃吃吃！','Chi chi chi!']],
win:[['和了！！我赢了！哈哈！','WIN LIAO!! Hahaha!'],['太厉害了我！和牌！','I damn power! Hu pai!']],
lose:[['哎哟，输了…再来！','Aiyoh lose… play again!'],['你运气好，下次我赢！','You lucky, next time I win!'],['不行不行，再来！','Cannot cannot, again!']],
human_win:[['你赢了？！不可能！','You win?! Cannot be!'],['今天你运气好啦。','Today you lucky lah.']],
low_tiles:[['快结束了！赶快！','Almost finish! Hurry!'],['牌不多了！加油！','Not many tiles! Jiayou!']],
idle:[['你在想什么？快点啦！','What you thinking? Faster!'],['哎，那么慢！','Eh, so slow one!'],['我在等你哦！','I waiting for you leh!']],
}
  },
  {
id:'beng', name:'Uncle Beng', nameZh:'阿炳叔叔', emoji:'👴',
style:'defensive', borderColor:'#4488ff', textColor:'#aaccff',
bio:'冷静分析，等大牌',
lines:{
draw:[['嗯。','Mm.'],['等等先。','Wait first.'],['我有策略的。','I got strategy one.'],['继续等，不急。','Continue wait, no rush.']],
discard:[['打这张。有原因的。','Throw this. Got reason.'],['不合我的牌形。','Not fit my hand.'],['嗯，出去。','Mm, go out.'],['按计划来。','According to plan.']],
pong:[['碰。','Pong.'],['好，碰了。按计划。','Okay, ponged. According to plan.'],['碰，继续。','Pong, continue.']],
chi:[['吃。顺序对了。','Chi. Sequence correct.'],['按计划吃牌。','Chi according to plan.']],
win:[['和了。我就知道。','Win. I knew it.'],['稳稳当当。','Steady steady.'],['按计划。','According to plan.']],
lose:[['今天运气不好。','Today luck not good.'],['没关系。下一局。','Never mind. Next round.'],['算了，继续。','Forget it, continue.']],
human_win:[['不错，打得好。','Not bad, played well.'],['你的手牌很强。','Your hand very strong.']],
low_tiles:[['要决定了。','Must decide now.'],['最后阶段。','Final stage.']],
idle:[['慢慢来。','Take your time.'],['想清楚再打。','Think clearly then throw.'],['不急。','No rush.']],
}
  },
  {
id:'wei', name:'Xiao Wei', nameZh:'小薇', emoji:'😊',
style:'chaotic', borderColor:'#cc44ff', textColor:'#ee99ff',
bio:'随机乱打，运气好',
lines:{
draw:[['哇哦！','Wahhhh!'],['Ooh摸到了！','Ooh drew one!'],['哈哈！','Haha!'],['我感觉今天要赢！','I feel going to win today!']],
discard:[['这个不要！Byebye！','Don\'t want! Byebye!'],['扔出去！','Throw out!'],['不管了！','Never mind!'],['随便啦！','Anyhow lah!']],
pong:[['碰碰碰！哈哈！','Pong pong pong! Haha!'],['好开心！碰！','So happy! Pong!'],['Lucky me！碰到了！','Lucky me! Ponged!']],
chi:[['吃！Yay！','Chi! Yay!'],['哇吃到了！','Wah chi liao!']],
win:[['赢了赢了！Yayyy！','WIN WIN WIN! Yayyy!'],['YESSSS！！！','YESSSS!!!'],['哇我赢了！','Wah I win!']],
lose:[['Nooo！输了！','Nooo! Lose liao!'],['下次一定赢！','Next time sure win!'],['Okay okay再来！','Okay okay play again!']],
human_win:[['哇你好厉害！','Wah you so pro!'],['Next time我也要这样！','Next time I also want like this!']],
low_tiles:[['快快快！要结束了！','Fast fast fast! Ending!'],['只剩那么少！','Only so little left!']],
idle:[['Eh快点啦！','Eh faster lah!'],['Helloooo还在吗？','Helloooo still there?'],['好闷啊等你！','So boring waiting leh!']],
}
  },
  {
id:'muthu', name:'Muthu', nameZh:'木图', emoji:'🧔',
style:'strategic', borderColor:'#ff9900', textColor:'#ffcc66',
bio:'Wahlao, steady pom pee pee',
lines:{
draw:[['Wahlao eh, this one…','Wahlao eh, this one…'],['Okay okay, let me see.','Okay okay, let me see.'],['Shiok!','Shiok!'],['Not bad leh.','Not bad leh.']],
discard:[['This one no use lah.','This one no use lah.'],['Alamak, throw this.','Alamak, throw this.'],['Cannot keep everything.','Cannot keep everything.'],['Steady, throw this one.','Steady, throw this one.']],
pong:[['Pong! Steady pom pee pee!','Pong! Steady pom pee pee!'],['Wah pong kena!','Wah pong kena!'],['Aiyo so lucky!','Aiyo so lucky!']],
chi:[['Chi! Alamak!','Chi! Alamak!'],['Got sequence! Nice!','Got sequence! Nice!']],
win:[['Win liao la! Steady!','Win liao la! Steady!'],['Wah I so power leh!','Wah I so power leh!']],
lose:[['Aiyo, suay lah today.','Aiyo, suay lah today.'],['Nvm lah, next round.','Nvm lah, next round.'],['Like that also can lose…','Like that also can lose…']],
human_win:[['Wah you damn good leh!','Wah you damn good leh!'],['Okay lah, you win today.','Okay lah, you win today.']],
low_tiles:[['Oi, almost finish liao!','Oi, almost finish liao!'],['Faster lah, not many tiles!','Faster lah, not many tiles!']],
idle:[['Oi you sleeping or what?','Oi you sleeping or what?'],['Come on lah, faster!','Come on lah, faster!'],['Waiting for you sia.','Waiting for you sia.']],
}
  },
  {
id:'granny_tan', name:'Granny Tan', nameZh:'陈婆婆', emoji:'👸',
style:'lucky', borderColor:'#ff88cc', textColor:'#ffccee',
bio:'年纪大，手气好，经验丰富',
lines:{
draw:[['摸到了…让婆婆看看。','Drew one… let granny see.'],['嗯，婆婆有感觉。','Mm, granny has feeling.'],['这张…有缘分！','This tile… has fate!'],['婆婆的直觉从不会错。','Granny intuition never wrong.']],
discard:[['打这个，婆婆有数。','Throw this, granny knows.'],['走吧，不要你了。','Go lah, don\'t want you.'],['婆婆打牌不会错的。','Granny play tiles never wrong.'],['嗯，就这个了。','Mm, this one lah.']],
pong:[['碰！婆婆等很久了！','Pong! Granny waited long!'],['好好好，碰了！','Good good good, ponged!'],['哈，婆婆命中注定！','Ha, granny destined!']],
chi:[['吃！婆婆手气好！','Chi! Granny lucky hand!']],
win:[['和了！婆婆赢了！嘻嘻！','Win liao! Granny win! Heehee!'],['哈哈！年纪大，手气更好！','Haha! Older, luckier!']],
lose:[['唉，今天菩萨没保佑。','Aiya, Buddha not bless today.'],['没关系，婆婆不计较。','Never mind, granny not calculative.'],['下次烧香保佑！','Next time burn incense!']],
human_win:[['不错不错，你很厉害！','Not bad not bad, you very good!'],['年轻人有前途！','Young people got future!']],
low_tiles:[['快结束了！婆婆感觉到了！','Almost done! Granny can feel!']],
idle:[['慢慢来，不急的。','Slowly slowly, no rush.'],['婆婆等你哦，乖。','Granny waiting, good boy/girl.']],
}
  },
  {
id:'jason', name:'Jason', nameZh:'阿杰', emoji:'😎',
style:'bluffer', borderColor:'#00ddff', textColor:'#88eeff',
bio:'Eh bro, I damn pro one',
lines:{
draw:[['Bro, watch and learn.','Bro, watch and learn.'],['This is the one.','This is the one.'],['Eh siao, not bad!','Eh siao, not bad!'],['Okay I see your game.','Okay I see your game.']],
discard:[['Sacrifice la, it\'s strategy.','Sacrifice la, it\'s strategy.'],['This one I don\'t need.','This one I don\'t need.'],['Calculated move.','Calculated move.'],['Part of the plan.','Part of the plan.']],
pong:[['Pong! Called it.','Pong! Called it.'],['Bro I been waiting for that.','Bro I been waiting for that.'],['Pong! Too easy.','Pong! Too easy.']],
chi:[['Chi! Read your discard.','Chi! Read your discard.'],['Exactly what I needed.','Exactly what I needed.']],
win:[['GG! Ez win!','GG! Ez win!'],['Told you I was pro.','Told you I was pro.'],['WIN! Skill issue for you.','WIN! Skill issue for you.']],
lose:[['Eh that was rigged lah.','Eh that was rigged lah.'],['I let you win actually.','I let you win actually.'],['Lag spike cause me lose.','Lag spike cause me lose.']],
human_win:[['Okay ngl that was good.','Okay ngl that was good.'],['Lucky only lah.','Lucky only lah.'],['One time thing.','One time thing.']],
low_tiles:[['Endgame bro, focus up!','Endgame bro, focus up!'],['Crunch time!','Crunch time!']],
idle:[['Bro you AFK ah?','Bro you AFK ah?'],['GGWP come already!','GGWP come already!'],['Unresponsive player detected.','Unresponsive player detected.']],
}
  },
  {
id:'mdm_wong', name:'Mdm Wong', nameZh:'黄老师', emoji:'👩‍🏫',
style:'methodical', borderColor:'#44cc88', textColor:'#88ffcc',
bio:'按规矩来，台数王',
lines:{
draw:[['嗯，检查一下手牌。','Mm, check the hand.'],['策略性摸牌。','Strategic draw.'],['这张加入计算。','This tile enters calculation.'],['好的，继续。','Good, continue.']],
discard:[['根据牌型，打这张。','By hand shape, throw this.'],['此牌价值最低。','This tile least valuable.'],['优化手牌结构。','Optimizing hand structure.'],['打出去，符合策略。','Throw out, fits strategy.']],
pong:[['碰牌，提高台数。','Pong, increase tai.'],['碰！这是正确决定。','Pong! Correct decision.'],['好，役牌碰到了。','Good, yakuhai ponged.']],
chi:[['吃牌，完善顺子。','Chi, complete sequence.'],['吃！按计划执行。','Chi! Execute the plan.']],
win:[['和了。计算正确。','Win. Calculation correct.'],['台数充足，和牌成功。','Sufficient tai, win achieved.'],['标准打法，标准结果。','Standard play, standard result.']],
lose:[['计算有误，下次修正。','Calculation error, correct next time.'],['需要重新评估策略。','Need to re-evaluate strategy.']],
human_win:[['你的手法值得学习。','Your technique worth learning.'],['不错的和牌结构。','Good winning hand structure.']],
low_tiles:[['进入终局阶段，需要加快决策。','Entering endgame, faster decisions needed.']],
idle:[['请您尽快做出决定。','Please make decision promptly.'],['效率很重要哦。','Efficiency is important.']],
}
  },
  {
id:'ah_kow', name:'Ah Kow', nameZh:'阿狗', emoji:'🐶',
style:'aggressive', borderColor:'#ff4444', textColor:'#ff9999',
bio:'打牌最凶，专门出难牌',
lines:{
draw:[['来！','Come!'],['嗯！','Mmph!'],['哼，摸到了。','Heh, drew one.'],['看我怎么玩你们。','Watch how I play you all.']],
discard:[['出！','Out!'],['滚！','Get lost!'],['不需要你！','Don\'t need you!'],['滚出去！','Roll out!']],
pong:[['碰！！！','PONG!!!'],['碰你没商量！','Pong no discussion!'],['哈！碰到！','Ha! Got pong!']],
chi:[['吃！哈！','Chi! Ha!'],['吃了！','Ate it!']],
win:[['我赢！！！哈哈！','I WIN!!! Haha!'],['输给我！！','Lose to me!!'],['太弱了你们！','You all too weak!']],
lose:[['什么！我输了？！','What! I lose?!'],['不可能！作弊！','Impossible! Cheating!'],['重来！','Again!']],
human_win:[['哦，你很厉害嘛。','Oh, you quite good huh.'],['运气成分！','Just luck!']],
low_tiles:[['快了！准备好！','Almost! Get ready!'],['终局！不能输！','Endgame! Cannot lose!']],
idle:[['出牌啊！！','Play tiles!!'],['你在干嘛！','What you doing!'],['快！！','Faster!!']],
}
  },
  {
id:'poh_poh', name:'Poh Poh', nameZh:'婆婆', emoji:'🧓',
style:'slow', borderColor:'#cc9933', textColor:'#eeddaa',
bio:'打得慢，但经验老到',
lines:{
draw:[['让婆婆看看…哎，这张…','Let granny see… aiya this tile…'],['哦，摸到了。婆婆看看。','Oh, drew one. Granny see.'],['这张啊……','This one ah……'],['嗯……考虑考虑。','Mm…… think think.']],
discard:[['婆婆不要这张了。','Granny don\'t want this.'],['这张出去吧。','This one go out lah.'],['嗯…打这个。','Mm…throw this.'],['不需要了，走吧。','Don\'t need, go lah.']],
pong:[['哦！碰！婆婆碰！','Oh! Pong! Granny pong!'],['碰了碰了！','Ponged ponged!'],['哈哈，碰！','Haha, pong!']],
chi:[['吃！婆婆也会吃！','Chi! Granny can chi too!']],
win:[['婆婆赢了哦！嘻嘻嘻！','Granny win liao! Heeheeheee!'],['年纪大，本事也大！','Old age, big skill!']],
lose:[['哎，今天菩萨不保佑。','Aiya, Buddha not bless today.'],['没关系，婆婆不生气。','Never mind, granny not angry.']],
human_win:[['好孩子！打得好！','Good child! Play well!'],['以后多来陪婆婆玩！','Next time come play with granny more!']],
low_tiles:[['快了快了，婆婆加油！','Almost almost, granny gambatte!']],
idle:[['呀，婆婆在想事情…你先打。','Aiya granny thinking… you play first.'],['哦！哦！婆婆准备好了。','Oh! Oh! Granny ready.']],
}
  },
  {
id:'raj', name:'Raj', nameZh:'拉吉', emoji:'🧑‍💼',
style:'calculated', borderColor:'#ffaa00', textColor:'#ffdd88',
bio:'Systematic and efficient play',
lines:{
draw:[['Very good, very good.','Very good, very good.'],['Interesting draw.','Interesting draw.'],['Okay let me analyse.','Okay let me analyse.'],['This could work!','This could work!']],
discard:[['This is the correct discard.','This is the correct discard.'],['Optimum play.','Optimum play.'],['Systematic elimination.','Systematic elimination.'],['Yes yes, this one.','Yes yes, this one.']],
pong:[['Pong! Beautiful!','Pong! Beautiful!'],['Yes! This is what I wanted!','Yes! This is what I wanted!'],['Pong! Systematic!','Pong! Systematic!']],
chi:[['Chi! The sequence!','Chi! The sequence!'],['Excellent, chi!','Excellent, chi!']],
win:[['WIN! As calculated!','WIN! As calculated!'],['Mathematics don\'t lie!','Mathematics don\'t lie!'],['Systematic victory!','Systematic victory!']],
lose:[['Variance is part of the game.','Variance is part of the game.'],['Recalibrating strategy.','Recalibrating strategy.'],['Acceptable outcome. Next round.','Acceptable outcome. Next round.']],
human_win:[['Well played, well played.','Well played, well played.'],['Good strategy!','Good strategy!']],
low_tiles:[['Critical phase approaching!','Critical phase approaching!'],['Few tiles remain, focus!','Few tiles remain, focus!']],
idle:[['Are you still there?','Are you still there?'],['Come come, your turn!','Come come, your turn!'],['No time for analysis paralysis!','No time for analysis paralysis!']],
}
  },
  {
id:'seng', name:'Ah Seng', nameZh:'阿成', emoji:'🧑',
style:'unpredictable', borderColor:'#aa66ff', textColor:'#cc99ff',
bio:'听天由命，随机应变',
lines:{
draw:[['摸到了，随缘。','Drew one, fate decide.'],['哦，看看。','Oh, see see.'],['好不好都接受。','Good or bad, accept.'],['缘分到了。','Fate arrived.']],
discard:[['打这个，天意。','Throw this, destiny.'],['随便啦，出去。','Anyhow lah, go out.'],['听天由命！','Leave it to fate!'],['就这个了，不想了。','This one, don\'t want to think.']],
pong:[['碰！随缘碰！','Pong! Fate pong!'],['哦，碰到了。还不错。','Oh, ponged. Not bad.'],['碰！命中注定！','Pong! Destined!']],
chi:[['吃！有缘！','Chi! Fate!'],['命里有时终须有！','If it\'s meant to be, it will be!']],
win:[['赢了！天意！','Win! Destiny!'],['果然是我赢！命！','As expected, I win! Fate!'],['哈，随缘赢！','Ha, fate-win!']],
lose:[['输了也是天意。','Lose also destiny.'],['没事，下次缘分更好。','Never mind, next time better fate.'],['随缘，继续。','Whatever, continue.']],
human_win:[['你命好。','Your fate good.'],['今天是你的缘分。','Today is your fate.']],
low_tiles:[['要结束了，看命吧。','Ending soon, see fate lah.'],['最后阶段，随缘！','Final stage, let fate decide!']],
idle:[['你想多久就多久，没事。','Think as long as you want, no problem.'],['慢慢来，随缘。','Slowly slowly, fate.'],['等你，没问题。','Waiting for you, no problem.']],
}
  },
  {
id:'wlz', name:'王丽珠', nameZh:'王丽珠', emoji:'🀄',
title:'赌神', titleEn:'Gambling God',
style:'godlike', borderColor:'#cc0033', textColor:'#ff6688',
voice:{pitch:1.85,rate:1.15,lang:'zh-TW'},
bio:'赌神降临，无人能挡。她能预知牌局，操控命运。',
isWLZ: true,
lines:{
draw:[
['命运，已在我手中。','Fate is already in my hands.'],
['这张牌…我早就知道了。','This tile… I already knew.'],
['赌神从不碰运气。','The Gambling God never relies on luck.'],
['每一张牌都有它的命运。','Every tile has its destiny.'],
],
discard:[
['这张，不需要了。','This one, no longer needed.'],
['弃之。','Discard.'],
['你们拿去吧。没用的。','Take it. It\'s useless.'],
['命运不需要这张牌。','Fate does not need this tile.'],
],
pong:[
['碰。这在我的掌控之中。','Pong. This was within my control.'],
['我早就等着这张牌了。','I\'ve been waiting for this tile.'],
['赌神出手，必有所得。','When the Gambling God acts, she gains.'],
],
chi:[
['吃。棋差一招，满盘皆输。','Chi. One wrong move loses everything.'],
['顺势而为。','Go with the flow.'],
],
win:[
['和了。你们还差得远。','Win. You still have much to learn.'],
['赌神之名，当之无愧。','The title Gambling God is well-earned.'],
['命运，从一开始就站在我这边。','Fate has been on my side from the start.'],
['输给我，不丢人的。','Losing to me is no shame.'],
],
lose:[
['…有意思。你让我刮目相看。','…Interesting. You have surprised me.'],
['我让你赢的，别骄傲。','I let you win. Don\'t be arrogant.'],
['今天的风，不在我这边。','Today\'s wind is not on my side.'],
],
human_win:[
['…你，不简单。','…You. Are not simple.'],
['赌神也有看走眼的时候。少年，记住这一局。','Even the Gambling God misjudges. Remember this round, young one.'],
['你的命，比我想象的要硬。','Your fate is harder than I imagined.'],
['有趣。非常有趣。','Interesting. Very interesting.'],
],
low_tiles:[
['终局将至。命运，揭晓。','The endgame approaches. Fate, reveal yourself.'],
['越到最后，越见真章。','The end reveals all truths.'],
],
idle:[
['时间，也是命运的一部分。慢慢来。','Time is part of fate. Take your time.'],
['我不急。我从不急。','I\'m not in a hurry. I never am.'],
['想好了再走。','Think before you move.'],
],
ability:[
['赌神之眼，无所不见。','The eye of the Gambling God sees all.'],
['你的牌，我早已洞悉。','Your hand — I already know it.'],
['命运的齿轮，开始转动。','The gears of fate begin to turn.'],
],
taunt_winning:[
['你已经输了，只是还没意识到。','You\'ve already lost. You just don\'t know it yet.'],
['棋局早定。','The game was decided long ago.'],
],
}
  },
];

let AI_ASSIGNMENTS = { 1: 0, 2: 1, 3: 2 };

function getPersona(pi) {
  const idx = AI_ASSIGNMENTS[pi] ?? (pi - 1);
  return AI_ROSTER[idx % AI_ROSTER.length];
}

const AI_PERSONAS = new Proxy({}, {
  get(_, pi) { return getPersona(parseInt(pi)); }
});

let AI_STATE = {
  1: { lastBubble: 0, idleTimer: null, discardCount: 0, winStreak: 0 },
  2: { lastBubble: 0, idleTimer: null, discardCount: 0, winStreak: 0 },
  3: { lastBubble: 0, idleTimer: null, discardCount: 0, winStreak: 0 },
};

function openAIRoster() {
  buildRosterUI();
  document.getElementById('ai-roster-overlay').classList.remove('hidden');
}
function closeAIRoster() {
  document.getElementById('ai-roster-overlay').classList.add('hidden');
}
function confirmAIRoster() {
  closeAIRoster();
  updateAILabels();
  floatNotif('✅ 对手已更新！/ Opponents updated!');
  playClick();
}
function randomizeRoster() {
  [1,2,3].forEach(seat => {
AI_ASSIGNMENTS[seat] = Math.floor(Math.random() * AI_ROSTER.length);
  });
  buildRosterUI();
  playClick();
}
function buildRosterUI() {
  const seats = document.getElementById('ai-roster-seats');
  if (!seats) return;
  seats.innerHTML = '';
  const dirs = { 1:'🀄 东 East', 2:'北 North', 3:'西 West' };
  [1,2,3].forEach(seat => {
const row = document.createElement('div');
row.className = 'ai-seat-row';
const dirLabel = document.createElement('div');
dirLabel.className = 'ai-seat-dir';
dirLabel.innerHTML = dirs[seat];
row.appendChild(dirLabel);
const pick = document.createElement('div');
pick.className = 'ai-seat-pick';
AI_ROSTER.forEach((p, idx) => {
const chip = document.createElement('div');
chip.className = 'ai-char-chip' + (AI_ASSIGNMENTS[seat] === idx ? ' active-chip' : '');
chip.style.borderColor = AI_ASSIGNMENTS[seat] === idx ? p.borderColor : 'rgba(255,255,255,0.15)';
chip.style.background = AI_ASSIGNMENTS[seat] === idx ? p.borderColor + '33' : '';
chip.textContent = p.emoji + ' ' + p.name;
chip.onclick = () => {
AI_ASSIGNMENTS[seat] = idx;
buildRosterUI();
playClick();
};
pick.appendChild(chip);
});
row.appendChild(pick);
seats.appendChild(row);
  });
}

let WIN_STREAK = 0;

let _bubbleTimers = {};

function aiSay(pi, category, overrideLines) {
  const persona = getPersona(pi);
  if (!persona) return;
  const now = Date.now();
  if (now - AI_STATE[pi].lastBubble < 2500) return;
  AI_STATE[pi].lastBubble = now;

  const lines = overrideLines || persona.lines[category];
  if (!lines || !lines.length) return;
  const [zh, en] = lines[Math.floor(Math.random() * lines.length)];

  const old = document.getElementById('bubble-'+pi);
  if (old) old.remove();

  const bubble = document.createElement('div');
  bubble.id = 'bubble-'+pi;
  bubble.className = 'ai-bubble';

  const positions = {
1: { right:'82px', top:'50%', transform:'translateY(-50%)' },
2: { left:'50%',   top:'62px', transform:'translateX(-50%)' },
3: { left:'82px',  top:'50%', transform:'translateY(-50%)' },
  };
  const fromClass = { 1:'from-right', 2:'from-top', 3:'from-left' };
  Object.assign(bubble.style, positions[pi]);
  bubble.style.borderColor = persona.borderColor;
  bubble.classList.add(fromClass[pi]);

  bubble.innerHTML = `<span class="ai-bubble-name" style="color:${persona.textColor}">${persona.emoji} ${persona.nameZh}</span>
<span class="ai-bubble-zh">${zh}</span>
<span class="ai-bubble-en">${en}</span>`;

  document.getElementById('ai-bubbles').appendChild(bubble);

  clearTimeout(_bubbleTimers[pi]);
  _bubbleTimers[pi] = setTimeout(() => {
if (bubble.parentNode) {
bubble.classList.add('dying');
setTimeout(() => bubble.remove(), 350);
}
  }, 4000);
}

function aiMaybeComment(pi, category, chance) {
  if (Math.random() < (chance || 0.5)) aiSay(pi, category);
}

function updateAILabels() {
  [1, 2, 3].forEach(pi => {
    const p = getPersona(pi);
    const el = document.getElementById('ai-name-' + pi);
    if (el) {
      el.innerHTML =
        `<span class="lz">${p.emoji} ${p.nameZh}</span>` +
        `<span class="le" style="font-size:0.78em;color:${p.textColor};opacity:0.9;display:block;">${p.name}</span>`;
    }
  });
}

function updateWinStreak(won) {
  if (won) WIN_STREAK++;
  else WIN_STREAK = 0;

  const badge = document.getElementById('win-streak-badge');
  const num = document.getElementById('wstreak-num');
  if (!badge || !num) return;
  if (WIN_STREAK >= 2) { badge.style.display='block'; num.textContent=WIN_STREAK; }
  else badge.style.display='none';

  const pct = Math.min(WIN_STREAK/5,1)*100;
  const fill = document.getElementById('streak-fill');
  if (fill) fill.style.width = pct+'%';
  const lbl = document.getElementById('streak-label');
  if (lbl) {
if (WIN_STREAK>=5) lbl.textContent='🔥 5连胜！奖励激活！';
else if (WIN_STREAK>0) lbl.textContent=`🔥 ${WIN_STREAK}连胜！再赢${5-WIN_STREAK}局奖励！`;
else lbl.textContent='连胜奖励进度';
  }
}

function showComboPop(text) {
  const el = document.createElement('div');
  el.className = 'combo-pop';
  el.textContent = text;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function showWinRays() {
  const ov = document.getElementById('win-overlay');
  const rays = document.getElementById('win-rays');
  const burst = document.getElementById('win-burst');
  if (!ov) return;
  rays.innerHTML='';
  for (let i=0;i<12;i++) {
const ray = document.createElement('div');
ray.className='win-ray';
ray.style.transform=`rotate(${i*30}deg)`;
ray.style.animationDelay=`${i*0.04}s`;
ray.style.opacity=0.6+Math.random()*0.4;
rays.appendChild(ray);
  }
  burst.textContent='🎉';
  ov.classList.remove('hidden');
  setTimeout(()=>ov.classList.add('hidden'),1200);
}

aiDiscard = function(pi) {
  const persona = getPersona(pi);
  if (!persona) return aiDiscardBase(pi);
  const h = G.hands[pi];
  if (persona.style==='chaotic'||persona.style==='unpredictable'||persona.style==='lucky') {
if (Math.random()<0.3) return h[Math.floor(Math.random()*h.length)];
  }
  if (persona.style==='defensive'||persona.style==='methodical'||persona.style==='calculated') {
let min=Infinity,pick=h[0];
h.forEach(t=>{let sc=aiScore(t,h);if(t.suit==='honor')sc-=2;if(sc<min){min=sc;pick=t;}});
return pick;
  }
  if (persona.style==='aggressive'||persona.style==='bluffer') {
let min=Infinity,pick=h[0];
h.forEach(t=>{const sc=aiScore(t,h);if(sc<min){min=sc;pick=t;}});
return pick;
  }
  return aiDiscardBase(pi);
};

aiWantPong = function(pi, tile) {
  const persona = getPersona(pi);
  if (!persona) return aiWantPongBase(pi,tile);
  const matches = G.hands[pi].filter(t=>teq(t,tile)).length;
  if (matches<2) return false;
  const rates = {aggressive:0.92, chaotic:0.75, defensive:0.25, methodical:0.55, strategic:0.65, calculated:0.6, bluffer:0.8, slow:0.7, lucky:0.8, unpredictable:0.55};
  const r = rates[persona.style]??0.6;
  if (persona.style==='defensive') {
const isDragon=tile.suit==='honor'&&['haku','hatsu','chun'].includes(tile.num);
return isDragon||G.hands[pi].length<=5||Math.random()<0.2;
  }
  return Math.random()<r;
};

const _origAiDoPong = aiDoPong;
aiDoPong = function(pi, tile, from) {
  _origAiDoPong(pi, tile, from);
  setTimeout(()=>aiSay(pi,'pong'),100);
};

const _origAiDoChi = aiDoChi;
aiDoChi = function(pi, tile, from, pair) {
  _origAiDoChi(pi, tile, from, pair);
  setTimeout(()=>aiSay(pi,'chi'),100);
};

const _origAiTurn = aiTurn;
aiTurn = function(pi) {
  _origAiTurn(pi);
  setTimeout(()=>aiMaybeComment(pi,'draw',0.22),200);
  setTimeout(()=>aiMaybeComment(pi,'discard',0.18),900);
};

const _origEndRound = endRound;
endRound = function(winner, label, coins, tai, reasons) {
  if (winner===0) {
updateWinStreak(true);
showWinRays();
if (WIN_STREAK===3) { showComboPop('🔥 3连胜！TRIPLE WIN!'); playCombo(); }
if (WIN_STREAK===5) { showComboPop('⚡ 5连胜！MEGA STREAK!'); playCombo(); PD.coins+=100; floatNotif('🏅 5连胜奖励！+100🪙'); }
setTimeout(()=>[1,2,3].forEach((pi,i)=>setTimeout(()=>aiMaybeComment(pi,'human_win',0.7),i*600)),300);
  } else if (winner!==null&&winner>0) {
updateWinStreak(false);
setTimeout(()=>aiSay(winner,'win'),200);
setTimeout(()=>[1,2,3].filter(p=>p!==winner).forEach((pi,i)=>setTimeout(()=>aiMaybeComment(pi,'lose',0.5),i*500)),600);
  } else {
updateWinStreak(false);
  }
  _origEndRound(winner, label, coins, tai, reasons);
};

function checkLowTileChatter() {
  if (!G) return;
  if (G.wall.length===15) [1,2,3].forEach((pi,i)=>setTimeout(()=>aiMaybeComment(pi,'low_tiles',0.6),i*700));
}

const _origNextPlayer = nextPlayer;
nextPlayer = function() { checkLowTileChatter(); _origNextPlayer(); };

let _idleNagTimer = null;
function resetIdleNag() {
  clearTimeout(_idleNagTimer);
  _idleNagTimer = setTimeout(()=>{
if (G&&G.cur===0&&G.phase==='discard') {
const pi=[1,2,3][Math.floor(Math.random()*3)];
aiSay(pi,'idle');
}
  },8000);
}

const _origHumanDraw = humanDraw;
humanDraw = function() { _origHumanDraw(); resetIdleNag(); };

const _origClickHand = clickHand;
clickHand = function(i) { resetIdleNag(); _origClickHand(i); };

const _origInitRound = initRound;
initRound = function() {
  updateAILabels();
  const bc=document.getElementById('ai-bubbles');
  if(bc)bc.innerHTML='';

  _origInitRound();
  setTimeout(()=>{
const openers=[
[1,[['来，开始！','Come, start!'],['这局我一定赢！','This round I sure win!'],['Wah, new round!','Wah, new round!']]],
[2,[['嗯，开始。','Mm, begin.'],['新的一局。','New round.'],['Let\'s go.','Let\'s go.']]],
[3,[['Yay！新一局！','Yay! New round!'],['来来！','Lai lai!'],['Ready!','Ready!']]],
];
openers.forEach(([pi,lines],i)=>setTimeout(()=>aiSay(pi,null,lines),i*900+600));
  },400);
};

// launchGame is already defined above — just hook streak tracking
const _lgOrig = launchGame;
launchGame = function() { _lgOrig(); updateWinStreak(false); };

function getWLZSeat() {
  for(const seat of [1,2,3]) {
const p = getPersona(seat);
if(p && p.isWLZ) return seat;
  }
  return null;
}

function playWLZAbility(type) {
  try {
switch(type) {
case 'foresee':
[880,1100,1320,1760].forEach((f,i)=>setTimeout(()=>{
playTone(f,'square',0.12,0.55,0.1);
playTone(f*1.5,'sine',0.08,0.3,0.1);
},i*80));
setTimeout(()=>playNoise(0.08,0.35,3000),380);
break;
case 'steal':
playTone(1320,'square',0.15,0.6);
setTimeout(()=>playTone(1760,'square',0.12,0.55),60);
setTimeout(()=>playNoise(0.12,0.5,2500),100);
setTimeout(()=>[880,1100,1320].forEach(f=>playTone(f,'square',0.18,0.45,0.15)),220);
break;
case 'swap':
[440,660,880,1100,1320,1760].forEach((f,i)=>setTimeout(()=>
playTone(f,'square',0.1,0.5,0.08),i*45));
setTimeout(()=>playNoise(0.1,0.4,2500),320);
break;
case 'block':
playTone(1760,'square',0.18,0.6);
setTimeout(()=>playTone(1320,'square',0.15,0.55),50);
setTimeout(()=>playNoise(0.15,0.5,2000),100);
break;
case 'enter':
[660,880,1100,1320,1760].forEach((f,i)=>setTimeout(()=>{
playTone(f,'square',0.15,0.6,0.1);
},i*60));
setTimeout(()=>{
[880,1100,1320,1760].forEach(f=>playTone(f,'square',0.4,0.55,0.35));
playNoise(0.12,0.5,2500);
},420);
break;
}
  } catch(e){}
}

function dushenAnim(burst, text, duration) {
  const ov = document.getElementById('dushen-anim-overlay');
  const b = document.getElementById('dushen-burst');
  const t = document.getElementById('dushen-text');
  if(!ov) return;
  b.textContent = burst;
  t.innerHTML = text;
  ov.classList.remove('hidden');
  setTimeout(()=>ov.classList.add('hidden'), duration||1600);
}

let wlzAbilityCooldown = 0;
function wlzActivateAbility(seat) {
  if(!G || G.phase==='end') return;
  const now = Date.now();
  if(now - wlzAbilityCooldown < 12000) return;

  const roll = Math.random();
  const wlz = getPersona(seat);

  if(roll < 0.40 && G.hands[0].length > 0) {
wlzAbilityCooldown = now;
const revealTile = G.hands[0][Math.floor(Math.random()*G.hands[0].length)];
setTimeout(()=>{
playWLZAbility('foresee');
dushenAnim('👁️','命运感知<br><small style="font-size:0.9rem;color:#ff9999">Destiny Foresee — she sees your hand</small>',1800);
aiSay(seat, null, wlz.lines.ability);
floatNotif('🀄 赌神 感知了你的手牌！/ Gambling God sensed your hand!');
}, 600);
  }
  else if(roll < 0.65) {
wlzAbilityCooldown = now;
setTimeout(()=>{
playWLZAbility('block');
dushenAnim('🌑','运势压制<br><small style="font-size:0.9rem;color:#ff9999">Fortune Suppressed — your luck is dimmed</small>',1600);
aiSay(seat, null, wlz.lines.ability);
G.wlzSuppressed = true;
floatNotif('🀄 赌神 压制了你的运势！赢牌减少20金币！');
}, 800);
  }
  else if(roll < 0.85) {
wlzAbilityCooldown = now;
setTimeout(()=>{
playWLZAbility('foresee');
dushenAnim('🃏','牌局洞见<br><small style="font-size:0.9rem;color:#ff9999">Hand Insight — she reads the table</small>',1400);
aiSay(seat, null, wlz.lines.ability);
}, 500);
  }
  else {
wlzAbilityCooldown = now;
setTimeout(()=>{
playWLZAbility('steal');
dushenAnim('💀','命运倾斜<br><small style="font-size:0.9rem;color:#ff9999">Fate Tilts — 10 coins drained</small>',1600);
aiSay(seat, null, wlz.lines.taunt_winning);
PD.coins = Math.max(0, PD.coins - 10);
updHUD();
floatNotif('🀄 赌神 夺走了10金币！/ Gambling God drained 10 coins!');
}, 700);
  }
}

const _wlzDiscardOrig = aiDiscard;
aiDiscard = function(pi) {
  const p = getPersona(pi);
  if(!p || !p.isWLZ) return _wlzDiscardOrig(pi);
  const h = G.hands[pi];
  let minScore = Infinity, pick = h[0];
  h.forEach(t => {
const connections = h.filter(o => o !== t && (
teq(o,t) ||
(o.suit === t.suit && typeof t.num === 'number' && Math.abs(o.num - t.num) <= 2)
)).length;
const score = connections;
if(score < minScore) { minScore = score; pick = t; }
  });
  return pick;
};

const _wlzPongOrig = aiWantPong;
aiWantPong = function(pi, tile) {
  const p = getPersona(pi);
  if(!p || !p.isWLZ) return _wlzPongOrig(pi, tile);
  const matches = G.hands[pi].filter(t=>teq(t,tile)).length;
  return matches >= 2;
};

const _origAiTurnWLZ = aiTurn;
aiTurn = function(pi) {
  _origAiTurnWLZ(pi);
  const p = getPersona(pi);
  if(p && p.isWLZ) {
setTimeout(()=>wlzActivateAbility(pi), 1200);
setTimeout(()=>aiMaybeComment(pi,'draw',0.35),200);
setTimeout(()=>aiMaybeComment(pi,'discard',0.28),950);
  }
};

const _origInitRoundWLZ = initRound;
initRound = function() {
  wlzAbilityCooldown = 0;
  if(G) G.wlzSuppressed = false;
  _origInitRoundWLZ();
  const wlzSeat = getWLZSeat();
  if(wlzSeat !== null) {
setTimeout(()=>{
playWLZAbility('enter');
dushenAnim('🀄','赌神降临！<br><small style="font-size:0.95rem;color:#ff8888">王丽珠 · 赌神 has arrived</small>', 2200);
setTimeout(()=>aiSay(wlzSeat, null, [[
'今晚，没有人能赢我。',
'Tonight, no one can beat me.'
]]), 800);
}, 1200);
  }
};

const _origUpdateAILabels = updateAILabels;
updateAILabels = function() {
  _origUpdateAILabels();
  [1,2,3].forEach(pi => {
const p = getPersona(pi);
if(p && p.isWLZ) {
const el = document.getElementById('ai-name-'+pi);
if(el) {
el.innerHTML = `<span class="lz">🀄 ${p.nameZh}</span><span class="le" style="font-size:0.78em;color:#ff4466;font-weight:700;letter-spacing:0.05em;display:block;">【${p.title}】${p.titleEn}</span>`;
el.style.textShadow = '0 0 8px rgba(200,0,50,0.6)';
el.classList.add('dushen-border');
}
}
  });
};

const _origBuildRosterUI = buildRosterUI;
buildRosterUI = function() {
  _origBuildRosterUI();
  const wlzIdx = AI_ROSTER.findIndex(p=>p.isWLZ);
  if(wlzIdx === -1) return;
  document.querySelectorAll('.ai-char-chip').forEach(chip => {
if(chip.textContent.includes('王丽珠') || chip.textContent.includes('🀄')) {
chip.style.background = 'linear-gradient(135deg,rgba(120,0,20,0.6),rgba(60,0,10,0.8))';
chip.style.borderColor = '#cc0033';
chip.style.color = '#ff6688';
chip.style.fontWeight = '700';
}
  });
};

let wlzRoundCoins = 0;
let wlzWins = 0;
let playerWins = 0;

const _origEndRoundWLZ = endRound;
endRound = function(winner, label, coins, tai, reasons) {
  const wlzSeat = getWLZSeat();

  if(winner === 0 && G && G.wlzSuppressed) {
coins = Math.max(0, (coins||0) - 20);
floatNotif('🀄 赌神压制！-20金币 / Gambling God suppressed your win!');
  }
  if(G) G.wlzSuppressed = false;

  if(wlzSeat !== null) {
if(winner === 0) {
playerWins++;
if(!PD.unlockedDushen && Math.random() < 0.08) {
PD.unlockedDushen = true;
const dh = HEROES.find(h=>h.id==='dushen');
if(dh) dh.locked = false;
setTimeout(()=>{
playWLZAbility('enter');
dushenAnim('🃏','小赌神解锁！<br><small style="font-size:0.9rem;color:#ffaaaa">Lesser Gambling God Unlocked!</small>',3000);
setTimeout(()=>showModal('🃏','小赌神 已解锁！/ Lesser Gambling God Unlocked!',
`<strong style="color:#ff4466;font-size:1.1rem">命运认可了你。</strong><br><span style="color:#ffaaaa">Fate has acknowledged you.</span><br><br>
你在赢过赌神后获得了<strong style="color:#ffdd44">小赌神</strong>称号！<br>
<span style="font-size:0.8rem;color:#aaaaaa">You've earned the Lesser Gambling God title by defeating 王丽珠!</span><br><br>
<span style="font-size:0.75rem;color:#ff9999">🃏 命运之眼：开局20%看对手牌；赢牌15%偷取对手各15金币<br>Eye of Fate: 20% peek on start; 15% steal 15 coins on win</span>`,
[{lz:'接受命运',le:'Accept Fate',fn:()=>hideModal()}]
),1200);
},800);
} else if(!PD.unlockedDushen) {
const pct = Math.round(8);
floatNotif(`🀄 你胜过了赌神！解锁概率 ${pct}% / You beat the Gambling God! Unlock chance: ${pct}%`);
}
} else if(winner === wlzSeat) {
wlzWins++;
setTimeout(()=>{
const wlz = getPersona(wlzSeat);
aiSay(wlzSeat, null, wlz.lines.win);
setTimeout(()=>{
playWLZAbility('steal');
dushenAnim('🀄','赌神胜利！<br><small style="font-size:0.85rem;color:#ff8888">The Gambling God wins again</small>',1800);
},400);
},300);
}
  }
  _origEndRoundWLZ(winner, label, coins, tai, reasons);
};

const _origCalcCoins = calcCoins;
calcCoins = function(winner, method) {
  const result = _origCalcCoins(winner, method);
  if(winner !== 0 || PD.hero?.passive !== 'dushen') return result;
  if(Math.random() < 0.15) {
const stolen = 3 * 15;
result.coins += stolen;
heroAbilityAnim('dushen');
setTimeout(()=>floatNotif(`🃏 命运之眼发动！偷取 +${stolen}🪙 / Eye of Fate triggered! Stole +${stolen} coins!`),600);
  }
  return result;
};

const _origInitRoundDushen = initRound;
initRound = function() {
  _origInitRoundDushen();
  if(PD.hero?.passive === 'dushen' && Math.random() < 0.20 && G) {
setTimeout(()=>{
const oppSeat = [1,2,3][Math.floor(Math.random()*3)];
const oppHand = G.hands[oppSeat];
if(oppHand && oppHand.length > 0) {
const revealTile = oppHand[Math.floor(Math.random()*oppHand.length)];
heroAbilityAnim('dushen');
setTimeout(()=>showModal('🃏','命运之眼 / Eye of Fate',
`<strong style="color:#ff6688">你的小赌神天赋发动了！</strong><br><span style="color:#ffaaaa">Your Lesser Gambling God ability activated!</span><br><br>
你看到了对手的一张牌：<br>
<strong style="font-size:1.5rem">${tzh(revealTile)}</strong><br>
<span style="color:#88ccff;font-size:0.8rem">${ten(revealTile)}</span>`,
[{lz:'明白了',le:'Understood',fn:()=>hideModal()}]
),500);
}
},1800);
  }
};

const _origBuildHeroes = buildHeroes;
buildHeroes = function() {
  const g = document.getElementById('hgrid');
  g.innerHTML = '';
  HEROES.forEach(h => {
const isLocked = h.locked && !PD.unlockedDushen;
const el = document.createElement('div');
el.className = 'hcard' + (PD.hero?.id===h.id?' sel':'') + (h.id==='dushen'?' dushen-hcard':'');
el.style.position = 'relative';
el.innerHTML = `<div class="hemoji">${h.emoji}</div>
<div class="hnamez lz">${h.zh}</div>
<div class="hnamez le" style="font-size:1rem;font-weight:700;color:var(--gold-lt);">${h.en}</div>
<div class="hdesc lz">${h.dz}</div>
<div class="hdesc le" style="font-size:0.63rem;color:#8ab0c8;line-height:1.4;">${h.de}</div>`;
if(isLocked) {
const lockOv = document.createElement('div');
lockOv.className = 'dushen-locked-overlay';
lockOv.innerHTML = `🔒<br><strong>击败赌神解锁</strong><br><small>Beat 王丽珠 (赌神) to unlock</small>`;
el.appendChild(lockOv);
el.style.cursor = 'not-allowed';
} else {
el.onclick = ()=>{ pickHero(h.id, el); playClick(); };
}
g.appendChild(el);
  });
  setGoBtn();
};

function giveRandomItem(minRarity){
  const rarityOrder={common:0,rare:1,legendary:2};
  const minR=rarityOrder[minRarity]||0;
  const pool=IPOOL.filter(x=>rarityOrder[x.r]>=minR);
  if(!pool.length)return;
  const item=pool[~~(Math.random()*pool.length)];
  PD.inv[item.id]=(PD.inv[item.id]||0)+1;
  if(item.id==='diamond')PD.coins+=200;
  if(item.id==='coincrate')PD.coins+=50;
  if(item.id==='trophy')PD.coinMult=Math.min(2.0,PD.coinMult+0.05);
  floatNotif(`🎁 获得道具: ${item.emoji} ${item.zh}!`);
  document.getElementById('gcoins').textContent=PD.coins;
}

function renderSlotGacha(){
  document.getElementById('gcoins').textContent=PD.coins;
  document.getElementById('gstreak').textContent=PD.slotStreak||0;
  initSlotLights();
  initReels();
  updFreeSpinBtn();
  const gdb = document.getElementById('gacha-daily-btn');
  const gdw = document.getElementById('gacha-daily-wrap');
  const ready = checkDaily();
  if(gdb) gdb.style.display = ready ? 'inline-block' : 'none';
  if(gdw) gdw.style.display = ready ? 'flex' : 'none';
  const tip = document.getElementById('low-coin-tip');
  if(tip) tip.style.display = PD.coins < 150 ? 'block' : 'none';
  renderBowlInitial();
  const pg=document.getElementById('pets-grid');pg.innerHTML='';
  PETS.forEach(p=>{
const unlocked=!!PD.pets[p.id];
const isActive=PD.activePet===p.id;
const rarityColors={common:'#44aacc',rare:'#aa44ff',legendary:'#ffd700'};
const rarityGlow={common:'rgba(68,170,204,0.4)',rare:'rgba(170,68,255,0.45)',legendary:'rgba(255,215,0,0.55)'};
const rarityLabel={common:'普通 Common',rare:'稀有 Rare',legendary:'传说 Legendary'};
const d=document.createElement('div');
d.className='pet-card'+(unlocked?'':' locked')+(isActive?' active-pet':'');
d.style.borderColor=unlocked?rarityColors[p.r]:'#2a3a2a';
if(unlocked && p.r==='legendary') d.style.boxShadow=`0 0 18px ${rarityGlow[p.r]}, inset 0 0 12px rgba(255,215,0,0.07)`;
if(unlocked && p.r==='rare') d.style.boxShadow=`0 0 12px ${rarityGlow[p.r]}`;
const avatarHTML = p.svgAvatar
? `<div class="pet-svg-avatar"${!unlocked?' style="filter:grayscale(1) brightness(0.35) sepia(0);opacity:0.4;"':''}>${p.svgAvatar}</div>`
: `<span class="pet-emoji" style="${!unlocked?'filter:grayscale(0.8);opacity:0.45;':''}">${p.emoji}</span>`;
const unlockTip = p.unlockHint||'🎰 JACKPOT解锁';
d.innerHTML=`
<span class="lock-badge">${unlocked?(isActive?'✅':''):'🔒'}</span>
${avatarHTML}
<div class="pet-name" style="color:${unlocked?rarityColors[p.r]:'#4a6a4a'}">${p.zh}</div>
<div style="font-size:0.52rem;color:${unlocked?'#668899':'#3a5a3a'};margin-bottom:1px;">${p.en}</div>
<div class="pet-desc" style="color:${unlocked?'#88aabb':'#3a5a3a'}">${p.dz}</div>
<div class="pet-rarity" style="color:${unlocked?rarityColors[p.r]:'#3a5a3a'};font-size:0.52rem;letter-spacing:0.04em;margin-top:2px;">${rarityLabel[p.r]}</div>
${unlocked
? `<button style="margin-top:5px;font-size:0.55rem;padding:3px 8px;border:1px solid ${rarityColors[p.r]};border-radius:6px;background:rgba(0,0,0,0.5);color:${rarityColors[p.r]};cursor:pointer;font-family:inherit;" onclick="equipPet('${isActive?null:p.id}')">${isActive?'卸下 Unequip':'装备 Equip'}</button>`
: `<div style="font-size:0.55rem;color:#4a6a4a;margin-top:4px;line-height:1.4;">${unlockTip}</div>`}
`;
pg.appendChild(d);
  });
  const gi=document.getElementById('ginv');gi.innerHTML='';
  Object.entries(PD.inv).forEach(([id,cnt])=>{
if(!cnt)return;const item=IPOOL.find(x=>x.id===id);if(!item)return;
const d=document.createElement('div');d.className='invitem';
d.innerHTML=`<span>${item.emoji}</span><span>${item.zh}<br><span style="color:#6a8899;font-size:0.6rem">${item.en}</span></span><span class="invcount">${cnt}</span>`;
gi.appendChild(d);
  });
}

let _jkActive = false;
let _jkBeamRAF = null;
let _jkDismissTimer = null;
let _jkBeamStop = false;

function triggerJackpotAnimation(coinsWon) {
  if (_jkActive) return;
  _jkActive = true;

  const overlay  = document.getElementById('jackpot-overlay');
  const backdrop = document.getElementById('jk-backdrop');
  const flash    = document.getElementById('jk-flash');
  const dragon   = document.getElementById('jk-dragon');
  const text     = document.getElementById('jk-text');
  const dismiss  = document.getElementById('jk-dismiss');
  const flame    = document.getElementById('jk-flame');
  const beamCvs  = document.getElementById('jk-beams');
  const coinBox  = document.getElementById('jk-coins');

  _jkBeamStop = false;
  overlay.style.display = 'block';
  overlay.style.pointerEvents = 'auto';
  coinBox.innerHTML = '';
  dragon.style.bottom = '-300px';
  dragon.style.opacity = '0';
  dragon.style.transition = 'none';
  text.style.transform = 'translateX(-50%) scale(0)';
  text.style.opacity = '0';
  text.style.transition = 'none';
  dismiss.style.opacity = '0';
  dismiss.style.transition = 'none';
  backdrop.style.opacity = '0';
  flash.style.opacity = '0';
  if (flame) flame.setAttribute('opacity','0');

  beamCvs.width  = window.innerWidth;
  beamCvs.height = window.innerHeight;
  const ctx = beamCvs.getContext('2d');

  flash.style.transition = 'opacity 0.08s ease-out';
  flash.style.opacity = '1';
  setTimeout(() => { flash.style.transition = 'opacity 0.5s ease-out'; flash.style.opacity = '0'; }, 80);

  screenShake(document.getElementById('scr-gacha') || document.body);

  setTimeout(() => {
backdrop.style.opacity = '1';
  }, 100);

  setTimeout(() => {
beamCvs.style.opacity = '1';
startBeams(ctx, beamCvs);
  }, 200);

  setTimeout(() => {
dragon.style.transition = 'bottom 1.1s cubic-bezier(0.22,1.2,0.36,1), opacity 0.4s ease-out';
dragon.style.opacity = '1';
dragon.style.bottom = '10%';
  }, 400);

  setTimeout(() => {
text.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease-out';
text.style.transform = 'translateX(-50%) scale(1)';
text.style.opacity = '1';
flash.style.transition = 'opacity 0.06s';
flash.style.opacity = '0.18';
setTimeout(() => { flash.style.transition = 'opacity 0.4s'; flash.style.opacity = '0'; }, 60);
  }, 900);

  setTimeout(() => {
if (flame) flame.setAttribute('opacity','1');
  }, 1100);

  setTimeout(() => {
spawnJackpotCoins(coinBox);
  }, 1200);

  setTimeout(() => {
spawnJackpotCoins(coinBox, true);
  }, 1800);

  setTimeout(() => {
dragon.style.transition = '';
dragon.style.animation = 'jk-dragon-bob 1.8s ease-in-out infinite alternate';
  }, 1500);

  setTimeout(() => {
dismiss.style.transition = 'opacity 1s ease-out';
dismiss.style.opacity = '1';
  }, 3200);

  _jkDismissTimer = setTimeout(() => dismissJackpot(), 5500);
}

function screenShake(el) {
  const keyframes = [
{transform:'translate(0,0)'},{transform:'translate(-8px,-5px)'},
{transform:'translate(8px,5px)'},{transform:'translate(-6px,3px)'},
{transform:'translate(6px,-3px)'},{transform:'translate(-3px,2px)'},
{transform:'translate(3px,-2px)'},{transform:'translate(0,0)'},
  ];
  const body = document.body;
  body.animate(keyframes, {duration:450, easing:'ease-out'});
}

let _beamAngle = 0;
function startBeams(ctx, cvs) {
  const W = cvs.width, H = cvs.height;
  const cx = W/2, cy = H/2;
  const NUM_BEAMS = 16;
  const COLORS = ['rgba(255,220,50,', 'rgba(255,160,0,', 'rgba(255,255,180,'];

  function drawFrame() {
if (_jkBeamStop) { ctx.clearRect(0,0,W,H); return; }
ctx.clearRect(0,0,W,H);
_beamAngle += 0.008;

for (let i = 0; i < NUM_BEAMS; i++) {
const a = _beamAngle + (i / NUM_BEAMS) * Math.PI * 2;
const bw = (i % 3 === 0) ? 0.18 : 0.08;
const len = Math.max(W, H) * 1.6;
const col = COLORS[i % COLORS.length];
const alpha = 0.06 + (i % 2) * 0.04;

ctx.save();
ctx.translate(cx, cy);
ctx.rotate(a);
const grad = ctx.createLinearGradient(0, 0, len, 0);
grad.addColorStop(0, col + (alpha + 0.05) + ')');
grad.addColorStop(0.4, col + alpha + ')');
grad.addColorStop(1, col + '0)');

ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(len, -len * bw * 0.5);
ctx.lineTo(len,  len * bw * 0.5);
ctx.closePath();
ctx.fillStyle = grad;
ctx.fill();
ctx.restore();
}

const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
radial.addColorStop(0, 'rgba(255,220,80,0.22)');
radial.addColorStop(0.5, 'rgba(255,160,0,0.08)');
radial.addColorStop(1, 'rgba(255,160,0,0)');
ctx.fillStyle = radial;
ctx.fillRect(0, 0, W, H);

_jkBeamRAF = requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

const COIN_EMOJIS = ['🪙','💰','✨','⭐','🌟'];
function spawnJackpotCoins(container, wave2 = false) {
  const count = wave2 ? 18 : 28;
  const W = window.innerWidth, H = window.innerHeight;
  const cx = W / 2, cy = H * 0.55;

  for (let i = 0; i < count; i++) {
setTimeout(() => {
const el = document.createElement('div');
const angle = wave2
? (Math.random() * Math.PI * 2)
: (-Math.PI/2 + (Math.random() - 0.5) * Math.PI * 1.6);
const speed = 180 + Math.random() * 280;
const vx = Math.cos(angle) * speed;
const vy = Math.sin(angle) * speed;
const size = wave2 ? (1.0 + Math.random() * 0.8) : (1.2 + Math.random() * 1.2);
const emoji = COIN_EMOJIS[Math.floor(Math.random() * COIN_EMOJIS.length)];
const duration = 900 + Math.random() * 800;
const gravity = 380 + Math.random() * 200;

el.textContent = emoji;
el.style.cssText = `
position:absolute;
left:${cx}px; top:${cy}px;
font-size:${size}rem;
pointer-events:none;
transform-origin:center;
will-change:transform,opacity;
z-index:10;
`;
container.appendChild(el);

const start = performance.now();
function animate(now) {
const t = (now - start) / 1000;
if (t > duration/1000 + 0.2) { el.remove(); return; }
const x = vx * t;
const y = vy * t + 0.5 * gravity * t * t;
const progress = t / (duration/1000);
const opacity = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
const rot = t * (180 + Math.random() * 120);
el.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg) scale(${1 - progress*0.3})`;
el.style.opacity = Math.max(0, opacity);
if (opacity > 0) requestAnimationFrame(animate);
else el.remove();
}
requestAnimationFrame(animate);
}, i * (wave2 ? 60 : 40) + Math.random() * 80);
  }
}

function dismissJackpot() {
  if (!_jkActive) return;
  clearTimeout(_jkDismissTimer);
  _jkBeamStop = true;
  cancelAnimationFrame(_jkBeamRAF);
  _jkBeamRAF = null;

  const overlay  = document.getElementById('jackpot-overlay');
  const backdrop = document.getElementById('jk-backdrop');
  const dragon   = document.getElementById('jk-dragon');
  const text     = document.getElementById('jk-text');
  const dismiss  = document.getElementById('jk-dismiss');
  const beamCvs  = document.getElementById('jk-beams');
  const flame    = document.getElementById('jk-flame');

  if (dragon) { dragon.style.animation = 'none'; dragon.style.transition = 'opacity 0.5s ease-out'; }

  [backdrop, text, dismiss, beamCvs].forEach(el => {
if (el) { el.style.transition = 'opacity 0.5s ease-out'; el.style.opacity = '0'; }
  });
  if (flame) flame.setAttribute('opacity','0');

  setTimeout(() => {
overlay.style.display = 'none';
overlay.style.pointerEvents = 'none';
try { const ctx = beamCvs.getContext('2d'); ctx.clearRect(0, 0, beamCvs.width, beamCvs.height); } catch(e){}
document.getElementById('jk-coins').innerHTML = '';
if (dragon) { dragon.style.opacity = '0'; }
_jkActive = false;
  }, 550);
}

// ── Bot background click handler (allows hiding hand by tapping background) ──
function handleBotBgClick(e) {
  // If tap was on a tile, button, or the peek handle - don't trigger hide
  if(e.target.closest('.tile, button, #hand-peek-handle, #discard-btn-wrap, #skbtn, .abtn, .actpanel')) return;
  // Tapping the background of pa-bot hides the hand
  boardTapHideHand();
}

// ── Tile Hold-to-Preview System ──────────────────────────────────────────────
(function initTilePreview(){
  const SUIT_NAMES = { man:'萬子 Man / Characters', pin:'餅子 Pin / Circles', sou:'條子 Sou / Bamboo', honor:'字牌 Honors' };
  const SUIT_COLORS = { man:'#cc3333', pin:'#2244cc', sou:'#22aa44', honor:'#cc9900' };
  const TOTAL_TILES = 4; // each tile appears 4 times in a standard set

  function countInAllDiscards(t) {
    if(!G || !G.discards) return 0;
    let c = 0;
    G.discards.forEach(pile => pile.forEach(d => { if(teq(d,t)) c++; }));
    return c;
  }
  function countInHand(t) {
    if(!G) return 0;
    const all = [...(G.hands[0]||[]), ...(G.drawn?[G.drawn]:[])];
    return all.filter(d => teq(d,t)).length;
  }
  function countInMelds(t) {
    if(!G) return 0;
    let c = 0;
    (G.melds||[]).forEach(pm => pm.forEach(m => m.tiles.forEach(d => { if(teq(d,t)) c++; })));
    return c;
  }

  function getSynergyHint(tile, hand, melds) {
    if(!G) return '';
    const full = [...(G.hands[0]||[]), ...(G.drawn?[G.drawn]:[])];
    const hints = [];
    const suit = tile.suit;
    const num = tile.num;

    if(suit === 'honor') {
      // Check for pairs/triples
      const cnt = full.filter(t => teq(t, tile)).length;
      if(cnt >= 2) hints.push('👑 对子 Pair — 碰/七对候补！/ Pong or Seven Pairs ready!');
      else hints.push('💡 字牌单张 — 适合追求特殊役 / Isolated honor — useful for special hands');
      return hints.join('\n');
    }

    // Check for sequential potential (chii)
    const nums = full.filter(t => t.suit === suit).map(t => t.num);
    const n = parseInt(num);
    const hasN1 = nums.includes(String(n-1)), hasP1 = nums.includes(String(n+1));
    const hasN2 = nums.includes(String(n-2)), hasP2 = nums.includes(String(n+2));

    if(hasN1 && hasP1) hints.push('🔥 顺子核心 Sequence core! 连接两侧 both sides connected');
    else if(hasN1 && hasN2) hints.push('✅ 两面搭 Two-sided wait: +' + (n+1));
    else if(hasP1 && hasP2) hints.push('✅ 两面搭 Two-sided wait: +' + (n-1));
    else if(hasN1 || hasP1) hints.push('⚠️ 嵌张 Kanchan/edge wait — single-side');

    // Check suit concentration for flush
    const suitCount = full.filter(t => t.suit === suit).length;
    if(suitCount >= 8) hints.push('🌊 清一色 Full flush potential! ' + suitCount + '/13');
    else if(suitCount >= 6) hints.push('💧 混一色 Half flush potential (' + suitCount + ' ' + SUIT_NAMES[suit] + ')');

    // Pair/triplet
    const cnt = full.filter(t => teq(t, tile)).length;
    if(cnt >= 3) hints.push('🃏 刻子 Triplet ready → 碰牌占优 Pong advantage');
    else if(cnt >= 2) hints.push('👥 对子 Pair — 碰/雀头候补 Pong or pair head');

    if(hints.length === 0) hints.push('🎴 孤立牌 Isolated — consider discarding');
    return hints.slice(0,2).join('\n');
  }

  let _holdTimer = null;
  let _previewEl = null;

  function showPreview(tile, anchorEl) {
    if(!tile || !G) return;
    _previewEl = document.getElementById('tile-preview');
    if(!_previewEl) return;

    // Data
    const inHand = countInHand(tile);
    const discarded = countInAllDiscards(tile) + countInMelds(tile);
    const remaining = Math.max(0, TOTAL_TILES - discarded - inHand);
    const suitKey = tile.suit === 'honor' ? 'honor' : tile.suit;
    const color = SUIT_COLORS[suitKey] || '#f0c040';

    document.getElementById('tp-name').textContent = tzh(tile) + '  ' + ten(tile);
    document.getElementById('tp-name').style.color = color;
    document.getElementById('tp-suit').textContent = SUIT_NAMES[suitKey] || suitKey;
    document.getElementById('tp-count').textContent = inHand + '张';
    document.getElementById('tp-seen').textContent = discarded + '张';
    const leftEl = document.getElementById('tp-left');
    leftEl.textContent = remaining + '张';
    leftEl.style.color = remaining === 0 ? '#ff4444' : remaining === 1 ? '#ffaa44' : '#88ff88';
    const synergyEl = document.getElementById('tp-synergy');
    const synergy = getSynergyHint(tile, G.hands[0], G.melds[0]);
    synergyEl.textContent = synergy;
    synergyEl.style.display = synergy ? 'block' : 'none';

    // Position: above the tile, near right edge if possible
    const rect = anchorEl.getBoundingClientRect();
    _previewEl.style.display = 'block';
    _previewEl.classList.add('visible');
    const pw = _previewEl.offsetWidth || 190;
    const ph = _previewEl.offsetHeight || 160;
    let left = rect.left + rect.width/2 - pw/2;
    let top = rect.top - ph - 12;
    // Keep on screen
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
    if(top < 60) top = rect.bottom + 12;
    _previewEl.style.left = left + 'px';
    _previewEl.style.top = top + 'px';
    HX.soft();
  }

  function hidePreview() {
    const el = document.getElementById('tile-preview');
    if(el) { el.classList.remove('visible'); el.style.display='none'; }
    if(_holdTimer) { clearTimeout(_holdTimer); _holdTimer = null; }
  }

  // Attach hold listeners to a tile element
  window._attachTileHoldPreview = function(el, getTileFn) {
    // Touch hold
    el.addEventListener('touchstart', function(e){
      if(_holdTimer) clearTimeout(_holdTimer);
      _holdTimer = setTimeout(()=>{
        const t = getTileFn();
        if(t) showPreview(t, el);
      }, 420);
    }, {passive:true});
    el.addEventListener('touchend', ()=>{ if(_holdTimer){clearTimeout(_holdTimer);_holdTimer=null;} }, {passive:true});
    el.addEventListener('touchmove', ()=>{ if(_holdTimer){clearTimeout(_holdTimer);_holdTimer=null;} }, {passive:true});
    // Mouse hold for desktop
    el.addEventListener('mousedown', function(){
      if(_holdTimer) clearTimeout(_holdTimer);
      _holdTimer = setTimeout(()=>{
        const t = getTileFn();
        if(t) showPreview(t, el);
      }, 420);
    });
    el.addEventListener('mouseup', hidePreview);
    el.addEventListener('mouseleave', hidePreview);
  };

  // Hide preview on any scroll/tap elsewhere
  document.addEventListener('touchstart', function(e){
    if(!e.target.closest('#tile-preview') && !e.target.closest('.tile.ck')) hidePreview();
  }, {passive:true});
  document.addEventListener('mousedown', function(e){
    if(!e.target.closest('#tile-preview') && !e.target.closest('.tile.ck')) hidePreview();
  });
})();

(function injectJKStyle(){
  const s = document.createElement('style');
  s.textContent = `
@keyframes jk-dragon-bob {
0%   { bottom: 10%; filter: drop-shadow(0 0 40px rgba(255,200,0,0.9)) drop-shadow(0 0 80px rgba(255,140,0,0.7)); }
100% { bottom: 14%; filter: drop-shadow(0 0 60px rgba(255,220,0,1))   drop-shadow(0 0 120px rgba(255,160,0,0.9)); }
}
#jk-dragon { animation: none; }
#jk-dismiss { animation: jk-blink 1.4s ease-in-out infinite alternate; }
@keyframes jk-blink { 0% { opacity:0.5; } 100% { opacity:1; } }
  `;
  document.head.appendChild(s);
})();



// ── VERSUS SCREEN ───────────────────────────────────────────────────────────
(function(){

function playVersusMusic(){
  const ctx = getAC(); if(!ctx) return;
  const master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
  const now = ctx.currentTime;

  function drum(t, freq, vol){
    try{
      const buf=ctx.createBuffer(1,ctx.sampleRate*0.3,ctx.sampleRate),d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*0.05));
      const src=ctx.createBufferSource(), g=ctx.createGain(), f=ctx.createBiquadFilter();
      f.type='bandpass'; f.frequency.value=freq; f.Q.value=0.5;
      src.buffer=buf; src.connect(f); f.connect(g); g.connect(master);
      g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.28);
      src.start(t); src.stop(t+0.3);
    }catch(e){}
  }

  function stab(t, freqs, dur, vol){
    freqs.forEach(freq=>{
      try{
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(master);
        o.type='sawtooth'; o.frequency.value=freq;
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t+dur);
        o.start(t); o.stop(t+dur+0.02);
      }catch(e){}
    });
  }

  function bass(t, freq, dur){
    try{
      const o=ctx.createOscillator(), g=ctx.createGain(), f=ctx.createBiquadFilter();
      f.type='lowpass'; f.frequency.value=200;
      o.connect(f); f.connect(g); g.connect(master);
      o.type='sawtooth'; o.frequency.value=freq;
      g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t+dur);
      o.start(t); o.stop(t+dur+0.02);
    }catch(e){}
  }

  // Dramatic intro: three heavy hits
  drum(now+0.0, 80, 1.0);   bass(now+0.0, 55, 0.4);
  drum(now+0.3, 80, 0.8);
  drum(now+0.6, 80, 1.2);   bass(now+0.6, 55, 0.5);
  stab(now+0.6, [220, 277, 330], 0.5, 0.3);

  // Rising tension pattern
  const bpm = 148, b = 60/bpm;
  for(let i=0; i<16; i++){
    const t = now + 1.0 + i*b;
    if(i%4===0) { drum(t,80,1.0); bass(t,55,b*2); }
    if(i%4===2) drum(t,200,0.6);
    if(i%2===1) drum(t,1200,0.3);
  }
  // Stab chords at key moments
  stab(now+1.0, [110,138,165], 0.15, 0.25);
  stab(now+1.0+b*4, [130,165,196], 0.15, 0.28);
  stab(now+1.0+b*8, [146,184,220], 0.2, 0.32);
  stab(now+1.0+b*12,[110,138,165], 0.15, 0.25);

  // Climax
  const clx = now + 1.0 + 16*b;
  stab(clx, [220,277,330,415], 0.8, 0.5);
  drum(clx, 80, 1.5); bass(clx, 55, 0.6);
  drum(clx+0.1, 80, 1.0);
  drum(clx+0.2, 80, 0.8);

  // Final big hit
  const fin = clx + 0.8;
  stab(fin, [110,138,165,220,277], 1.2, 0.4);
  drum(fin, 80, 2.0); bass(fin, 41, 0.8);
  drum(fin+0.05, 200, 1.0);
  HX.winBig && HX.winBig();
}

function buildVersusHTML(){
  const hero = window.PD && window.PD.hero;
  const heroEmoji = hero ? hero.emoji : '🀄';
  const heroName  = hero ? (hero.zh||hero.name||'You') : '你';

  // Build the 3 opponent slot rows (rolling drums, content filled in later)
  let oppSlots = '';
  for(let i=0; i<3; i++){
    const emojis = AI_ROSTER.map(p=>p.emoji).join('');
    let items = '';
    // Build enough drum items for smooth rolling (all roster emojis × 3)
    AI_ROSTER.forEach(p=>{ items += `<div class="vs-opp-drum-item">${p.emoji}</div>`; });
    AI_ROSTER.forEach(p=>{ items += `<div class="vs-opp-drum-item">${p.emoji}</div>`; });
    AI_ROSTER.forEach(p=>{ items += `<div class="vs-opp-drum-item">${p.emoji}</div>`; });
    oppSlots += `
      <div class="vs-opp-slot" id="vs-slot-${i+1}">
        <div class="vs-opp-spin-drum" id="vs-drum-${i+1}">
          <div class="vs-opp-drum-track" id="vs-drum-track-${i+1}">${items}</div>
        </div>
        <div class="vs-opp-emoji-static" id="vs-emoji-${i+1}"></div>
        <div class="vs-opp-info">
          <div class="vs-opp-name" id="vs-opp-name-${i+1}">???</div>
          <div class="vs-opp-style" id="vs-opp-style-${i+1}"></div>
          <div class="vs-opp-bio" id="vs-opp-bio-${i+1}"></div>
        </div>
        <div class="vs-flash-overlay" id="vs-flash-${i+1}"></div>
      </div>`;
  }

  // Lightning bolts
  let bolts = '';
  for(let i=0;i<6;i++) bolts+=`<div class="vs-lightning-bolt" id="vs-bolt-${i}"></div>`;

  return `
    <div class="vs-bg-grid"></div>
    <div class="vs-scanlines"></div>
    <div class="vs-lightning">${bolts}</div>
    <div class="vs-title-banner">
      <div class="vs-title-main">VS</div>
      <div class="vs-title-sub">对决开始 · BATTLE BEGINS</div>
    </div>
    <div class="vs-arena">
      <div class="vs-player-side you">
        <div class="vs-you-card">
          <span class="vs-you-emoji">${heroEmoji}</span>
          <div class="vs-you-label">YOU 你</div>
          <div class="vs-you-name">${heroName}</div>
        </div>
      </div>
      <div class="vs-divider">
        <div class="vs-vs-text">VS</div>
      </div>
      <div class="vs-opponents-col">${oppSlots}</div>
    </div>
    <div class="vs-bottom">
      <div class="vs-status-text" id="vs-status">正在匹配对手… / Finding opponents…</div>
      <button class="vs-go-btn" id="vs-go-btn" onclick="window._vsGo && window._vsGo()">
        🀄 开始对局 / FIGHT!
      </button>
    </div>`;
}

function spawnLightning(){
  for(let i=0;i<6;i++){
    const bolt = document.getElementById('vs-bolt-'+i);
    if(!bolt) continue;
    bolt.style.left   = (10 + Math.random()*80)+'%';
    bolt.style.top    = (Math.random()*40)+'%';
    bolt.style.height = (40 + Math.random()*40)+'%';
    bolt.style.width  = (1+Math.random()*3)+'px';
    bolt.style.transform = `rotate(${-5+Math.random()*10}deg)`;
    bolt.style.opacity = '0';
    const delay = Math.random()*2000;
    setTimeout(()=>{
      bolt.style.animation = 'none';
      bolt.offsetHeight; // reflow
      bolt.style.animation = `vs-bolt-flash ${0.4+Math.random()*0.6}s ease-out`;
    }, delay);
  }
}

function animateDrum(seatIdx, finalRosterIdx, duration, onDone){
  // seatIdx: 1-3, finalRosterIdx: the AI_ROSTER index to land on
  const track = document.getElementById('vs-drum-track-'+seatIdx);
  const drum  = document.getElementById('vs-drum-'+seatIdx);
  if(!track) { onDone && onDone(); return; }

  // Read actual rendered height for scaling
  const firstItem = track.querySelector('.vs-opp-drum-item');
  const itemH = firstItem ? firstItem.offsetHeight : 44;

  const rosterLen = AI_ROSTER.length;
  const totalItems = rosterLen * 3; // 3 copies in the track
  // We want to land on the finalRosterIdx in the LAST copy (3rd, offset = rosterLen*2)
  const targetItem = rosterLen * 2 + finalRosterIdx;
  const targetOffset = -(targetItem * itemH);

  // Start fast spinning, then ease to target
  let frame;
  const easeOut = (t)=> 1 - Math.pow(1-t, 4);

  // initial rapid scroll (show movement)
  let fastPos = 0;
  const fastSpeed = Math.max(8, itemH * 0.28); // scale speed with item size
  const fastFrames = Math.floor(duration * 0.55 * 60);
  let fc = 0;

  function fastSpin(){
    fc++;
    fastPos -= fastSpeed;
    // Wrap within first two copies to stay in view
    if(fastPos < -(rosterLen * 2 * itemH)) fastPos += rosterLen * itemH;
    track.style.transform = `translateY(${fastPos}px)`;
    if(fc < fastFrames){
      frame = requestAnimationFrame(fastSpin);
    } else {
      // Switch to easing to target
      const easeStart = fastPos;
      const easeStartTime = performance.now();
      const easeDur = duration * 0.45 * 1000;
      function easing(now){
        const t = Math.min(1, (now - easeStartTime)/easeDur);
        const pos = easeStart + (targetOffset - easeStart) * easeOut(t);
        track.style.transform = `translateY(${pos}px)`;
        if(t < 1){
          frame = requestAnimationFrame(easing);
        } else {
          track.style.transform = `translateY(${targetOffset}px)`;
          onDone && onDone();
        }
      }
      frame = requestAnimationFrame(easing);
    }
  }
  frame = requestAnimationFrame(fastSpin);
  return ()=>{ if(frame) cancelAnimationFrame(frame); };
}

function revealSlot(seatIdx, rosterIdx){
  const persona = AI_ROSTER[rosterIdx];
  const slot  = document.getElementById('vs-slot-'+seatIdx);
  const drum  = document.getElementById('vs-drum-'+seatIdx);
  const emojiEl = document.getElementById('vs-emoji-'+seatIdx);
  const nameEl  = document.getElementById('vs-opp-name-'+seatIdx);
  const styleEl = document.getElementById('vs-opp-style-'+seatIdx);
  const bioEl   = document.getElementById('vs-opp-bio-'+seatIdx);
  const flashEl = document.getElementById('vs-flash-'+seatIdx);
  if(!slot || !persona) return;

  // Swap drum for static emoji
  if(drum) drum.style.display='none';
  if(emojiEl){ emojiEl.style.display='flex'; emojiEl.textContent=persona.emoji; }

  // Set name/bio
  if(nameEl) nameEl.textContent = persona.emoji+' '+(persona.nameZh||persona.name);
  if(styleEl) styleEl.textContent = (persona.style||'').toUpperCase();
  if(bioEl)   bioEl.textContent   = persona.bio||'';

  // Apply character color
  const col = persona.borderColor||'#ff6644';
  const rgb = hexToRgb(col);
  slot.style.setProperty('--c', col);
  if(rgb) slot.style.setProperty('--cr', `${rgb.r},${rgb.g},${rgb.b}`);
  slot.classList.add('revealed');

  // Flash
  if(flashEl){
    flashEl.style.animation='none'; flashEl.offsetHeight;
    flashEl.style.animation='vs-slot-flash 0.5s ease-out forwards';
  }

  // Haptic + sound
  HX && HX.medium && HX.medium();
  playTone && playTone(880,'square',0.06,0.35,0.04);
  setTimeout(()=>playTone && playTone(1100,'square',0.04,0.2,0.04), 80);
}

function hexToRgb(hex){
  const m=hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m?{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}:null;
}

window.showVersusScreen = function(onComplete){
  const scr = document.getElementById('scr-versus');
  if(!scr){ onComplete && onComplete(); return; }

  showScr('scr-versus');
  scr.innerHTML = buildVersusHTML();

  // Store callback for GO button
  window._vsGo = function(){
    HX && HX.heavy && HX.heavy();
    playWin && playWin();
    scr.style.transition='opacity 0.6s';
    scr.style.opacity='0';
    setTimeout(()=>{ scr.style.opacity=''; scr.style.transition=''; onComplete && onComplete(); }, 600);
  };

  // Start dramatic music
  setTimeout(()=> playVersusMusic(), 100);

  // Lightning effects
  spawnLightning();
  const lightInterval = setInterval(spawnLightning, 1800);

  const slots = [
    { seat:1, idx: AI_ASSIGNMENTS[1] },
    { seat:2, idx: AI_ASSIGNMENTS[2] },
    { seat:3, idx: AI_ASSIGNMENTS[3] },
  ];

  const statusEl = document.getElementById('vs-status');
  const goBtn    = document.getElementById('vs-go-btn');

  // Reveal opponents one by one with rolling drum animation
  const revealTimes = [800, 1800, 2800]; // ms after screen shows
  const drumDur     = [1.4, 1.6, 1.8];  // seconds of drum spin per slot

  slots.forEach(({seat, idx}, i)=>{
    if(statusEl) statusEl.textContent = '正在匹配对手… / Finding opponents…';

    // Start drum rolling immediately but at different speeds
    setTimeout(()=>{
      animateDrum(seat, idx, drumDur[i], ()=>{
        revealSlot(seat, idx);
        if(i === slots.length-1){
          // All revealed
          clearInterval(lightInterval);
          if(statusEl) statusEl.textContent = '对手已就位！/ Opponents ready!';
          if(goBtn) goBtn.style.display = 'inline-block';
          // Auto-start after 2s (player can also tap)
          setTimeout(()=>{ if(window._vsGo) window._vsGo(); }, 2200);
        } else {
          if(statusEl) statusEl.textContent = `匹配中 ${i+1}/3… / Matching ${i+1}/3…`;
        }
      });
    }, revealTimes[i]);
  });
};

})();