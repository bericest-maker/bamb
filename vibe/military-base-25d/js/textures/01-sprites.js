/* Military Base 2.5D — 08-sprites.js · sprites: flat 2D canvas drawings */
'use strict';
// ================= sprites (flat 2D pictures) =================
// each draw fn: ctx is translated so (0,0)=ground anchor, y up = negative
const SPR = {};
function reg(type,w,h,draw){ SPR[type]={w,h,draw,anim:sprUsesTime(draw)}; }
// does the draw fn use its time argument? (static sprites get ONE cached frame, animated ones SPR_FRAMES)
function sprUsesTime(fn){
  const src=String(fn), m=src.match(/^\s*\(?\s*\w+\s*,\s*(\w+)/); if(!m) return false;
  const body=src.slice(src.indexOf('=>')+2);
  return new RegExp('(^|[^\\w.$])'+m[1]+'([^\\w$]|$)').test(body);
}
// ---- v5 perf: sprite cache — each sprite is painted once per (type, side, faction, frame, res) into an offscreen canvas
// and then blitted with drawImage, which is far cheaper than re-running dozens of path commands per unit per frame ----
const SPR_CACHE=new Map(), SPR_FPS=8, SPR_FRAMES=8;
function sprCanvas(type,side,faction,t,res){
  const sp=SPR[type];
  const f=sp.anim?Math.floor(t*SPR_FPS)%SPR_FRAMES:0;
  const key=type+'|'+side+'|'+faction+'|'+f+'|'+res;
  let c=SPR_CACHE.get(key);
  if(c) return c;
  if(SPR_CACHE.size>1200) SPR_CACHE.clear();   // memory guard
  const padX=sp.w*.45+22, top=sp.h*.55+34, bot=14;   // sprites overhang their nominal box (flags, rotors, smoke)
  const lw=sp.w+padX*2, lh=sp.h+top+bot;
  c=document.createElement('canvas'); c.width=Math.ceil(lw*res); c.height=Math.ceil(lh*res);
  const g=c.getContext('2d');
  g.scale(res,res); g.translate(lw/2,sp.h+top);
  sp.draw(g,f/SPR_FPS,{side,faction});
  if(UNITS[type]) unitPolish(g,sp.w,sp.h);       // v8.9: shared lighting pass for units only
  c._ax=lw/2; c._ay=sp.h+top; c._lw=lw; c._lh=lh;
  SPR_CACHE.set(key,c);
  return c;
}
// draw a sprite with its ground anchor at (x,y), scaled by sc (world units). res = cache resolution bucket.
function drawSpr(g,type,x,y,sc,side,faction,t){
  const z=(typeof cam!=='undefined'?cam.z:1)*(typeof DPR!=='undefined'?DPR:1)*sc;
  const res=z<1.2?1.5:z<2.2?2.5:z<3.5?3.5:5;
  const c=sprCanvas(type,side,faction,t,res);
  g.drawImage(c,x-c._ax*sc,y-c._ay*sc,c._lw*sc,c._lh*sc);
}
// v8.9: a restrained top sheen + lower shadow, clipped to unit pixels; footprints and buildings stay untouched.
function unitPolish(g,w,h){
  g.save();
  g.globalCompositeOperation='source-atop';
  for(let i=0;i<4;i++){
    g.globalAlpha=.12*(1-i/4);
    g.fillStyle='#fff';
    g.fillRect(-w/2+1,-h+1+i*h*.035,w-2,Math.max(1,h*.035));
  }
  g.globalAlpha=.075;
  g.fillStyle='#fff'; g.fillRect(-w*.39,-h*.76,Math.max(1,w*.08),h*.4);
  for(let i=0;i<3;i++){
    g.globalAlpha=.045*(i+1);
    g.fillStyle='#090d13';
    g.fillRect(-w/2+1,-h*.13+i*h*.035,w-2,Math.max(1,h*.035));
  }
  g.restore();
}
function O(g,w=2){ g.lineWidth=w; g.strokeStyle='rgba(18,24,32,.5)'; }

// ----- buildings -----
reg('solar',44,38,(g,t)=>{
  g.fillStyle='#5a6b52'; g.fillRect(-15,-22,3,22); g.fillRect(12,-22,3,22);
  g.save(); g.translate(0,-28); g.rotate(-.2);
  g.fillStyle='#2f6fb8'; g.fillRect(-19,-9,38,18); O(g); g.strokeRect(-19,-9,38,18);
  g.strokeStyle='rgba(255,255,255,.45)'; g.lineWidth=1;
  g.beginPath(); g.moveTo(-6,-9); g.lineTo(-6,9); g.moveTo(7,-9); g.lineTo(7,9); g.moveTo(-19,0); g.lineTo(19,0); g.stroke();
  g.restore();
});
reg('oil',44,46,(g,t)=>{
  g.fillStyle='#6b5a44'; g.fillRect(-18,-8,36,8); O(g); g.strokeRect(-18,-8,36,8);
  g.fillStyle='#8a6f4d'; g.fillRect(-14,-14,28,6); g.fillRect(-10,-20,20,6); g.fillRect(-6,-26,12,6);
  g.fillStyle='#a3865c'; g.fillRect(-5,-40,10,14); O(g); g.strokeRect(-5,-40,10,14);
  g.save(); g.translate(0,-26); g.rotate(Math.sin(t*2.2)*.5);
  g.fillStyle='#b8452e'; g.fillRect(-2,-3,20,6); g.fillRect(-12,-3,6,6);
  g.fillStyle='#8a3322'; g.beginPath(); g.arc(-9,0,4,0,pi2); g.fill();
  g.restore();
});
reg('data',48,48,(g,t)=>{
  g.fillStyle='#77839a'; g.fillRect(-22,-40,44,40); O(g); g.strokeRect(-22,-40,44,40);
  g.fillStyle='#5c6880'; g.fillRect(-22,-45,44,6);
  g.fillStyle='#5c6880'; g.fillRect(-17,-33,8,3); g.fillRect(-17,-28,8,3); g.fillRect(9,-33,8,3); g.fillRect(9,-28,8,3);
  g.fillStyle= (Math.floor(t*2)%2)?'#57e389':'#2c4a3a'; g.fillRect(-20,-22,5,4);
  g.fillStyle= (Math.floor(t*2+1)%2)?'#57e389':'#2c4a3a'; g.fillRect(15,-22,5,4);
  g.fillStyle='#414b60'; g.fillRect(-6,-16,12,16);
});
reg('cookie',48,42,(g,t)=>{
  g.fillStyle='#caa06a'; g.fillRect(-18,-22,36,22); O(g); g.strokeRect(-18,-22,36,22);
  g.fillStyle='#8a6f4d'; g.fillRect(-18,-9,36,3);
  for(let i=0;i<6;i++){ g.fillStyle=i%2?'#d6493f':'#f0e8d8'; g.fillRect(-20+i*7,-34,7,10); }
  O(g,1.5); g.strokeRect(-20,-34,42,10);
  g.fillStyle='#c98a4b'; g.beginPath(); g.arc(10,-14,5.5,0,pi2); g.fill();
  g.fillStyle='#6b4423'; g.beginPath(); g.arc(8,-15,1.2,0,pi2); g.arc(12,-12,1.2,0,pi2); g.arc(11,-16,1,0,pi2); g.fill();
});
reg('research',54,52,(g,t)=>{
  g.fillStyle='#9aa4b2'; g.fillRect(-24,-14,48,14);
  g.fillStyle='#cfd6e0'; g.beginPath(); g.arc(0,-14,23,Math.PI,0); g.closePath(); g.fill(); O(g); g.stroke();
  g.fillStyle='#5aa0d8'; g.fillRect(-6,-11,12,11);
  g.fillStyle='#8792a6'; g.fillRect(15,-42,2.5,28);
  g.fillStyle=(Math.floor(t*1.5)%2)?'#ff5a4e':'#7a352e'; g.beginPath(); g.arc(16,-43,3,0,pi2); g.fill();
});
reg('industrial',60,62,(g,t)=>{
  g.fillStyle='#7b8593'; g.fillRect(-27,-12,54,12); O(g); g.strokeRect(-27,-12,54,12);
  g.fillStyle='#e0a32e'; g.fillRect(-13,-48,26,36); O(g); g.strokeRect(-13,-48,26,36);
  g.strokeStyle='#8a5f1a'; g.lineWidth=2;
  g.beginPath(); g.moveTo(-13,-44); g.lineTo(13,-18); g.moveTo(13,-44); g.lineTo(-13,-18); g.stroke();
  g.fillStyle='#c98a1f'; g.fillRect(-9,-55,18,8);
  g.save(); g.translate(0,-12);
  g.fillStyle='#aab4c0'; g.beginPath(); g.moveTo(-6,0); g.lineTo(6,0); g.lineTo(0, 5+Math.sin(t*10)*2.5); g.closePath(); g.fill();
  g.restore();
  g.fillStyle='#f5b53f'; g.fillRect(-27,-14,54,3);
});
reg('logistics',68,36,(g,t)=>{
  g.fillStyle='#8792a6'; g.fillRect(-32,-28,64,28); O(g); g.strokeRect(-32,-28,64,28);
  g.fillStyle='#6a7488'; g.fillRect(-32,-33,64,6);
  g.fillStyle='#5c6678'; g.fillRect(-14,-14,22,14);
  g.fillStyle='#4a90e2'; g.fillRect(-32,-5,64,3);
  g.fillStyle='#fff';
  g.beginPath(); g.moveTo(16,-24); g.lineTo(24,-18); g.lineTo(16,-12); g.lineTo(16,-17); g.lineTo(11,-18); g.lineTo(16,-19); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(24,-24); g.lineTo(32,-18); g.lineTo(24,-12); g.lineTo(24,-17); g.lineTo(19,-18); g.lineTo(24,-19); g.closePath(); g.fill();
});
reg('depot',44,32,(g,t)=>{
  g.fillStyle='#7a8a5a';
  g.fillRect(-17,-12,15,12); g.fillRect(2,-12,15,12); g.fillRect(-7,-24,14,12);
  O(g,1.5); g.strokeRect(-17,-12,15,12); g.strokeRect(2,-12,15,12); g.strokeRect(-7,-24,14,12);
  g.strokeStyle='#55613f'; g.beginPath(); g.moveTo(-17,-12); g.lineTo(-2,0); g.moveTo(2,-12); g.lineTo(17,0); g.stroke();
  g.fillStyle='#7d8794'; g.fillRect(14,-34,2.5,34);
  g.fillStyle='#d6493f'; g.fillRect(16,-34,12,7);
});
reg('barracks',56,40,(g,t)=>{
  g.fillStyle='#5d7a4a'; g.fillRect(-26,-30,52,30); O(g); g.strokeRect(-26,-30,52,30);
  g.fillStyle='#48603a'; g.fillRect(-26,-35,52,6);
  g.fillStyle='#3c4f31'; g.fillRect(-6,-16,12,16);
  g.fillStyle='#cfe3a8'; g.fillRect(-21,-25,9,6); g.fillRect(12,-25,9,6);
  g.fillStyle='#7d8794'; g.fillRect(20,-46,2.5,16);
  g.fillStyle='#4a90e2'; g.fillRect(22,-46,13,8);
});
reg('tankfac',60,42,(g,t)=>{
  g.fillStyle='#66725f'; g.fillRect(-28,-32,56,32); O(g); g.strokeRect(-28,-32,56,32);
  g.fillStyle='#525c4c'; g.fillRect(-28,-37,56,6);
  g.fillStyle='#3a4149'; g.fillRect(-17,-18,34,18);
  g.fillStyle='#5b6d7c'; g.fillRect(-10,-12,17,6); g.fillRect(-6,-17,9,6);
  g.fillStyle='#7d8794'; g.fillRect(7,-14,11,3);
  g.fillStyle='#f5b53f'; g.beginPath(); g.arc(21,-27,5,0,pi2); g.fill();
});
reg('heliport',66,56,(g,t)=>{
  g.fillStyle='#5f6a74'; g.beginPath(); g.ellipse(-6,-3,27,10,0,0,pi2); g.fill(); O(g); g.stroke();
  g.fillStyle='#fff'; g.font='bold 11px sans-serif'; g.fillText('H',-10,-6);
  g.fillStyle='#8792a6'; g.fillRect(16,-46,10,44); O(g); g.strokeRect(16,-46,10,44);
  g.fillStyle='#9fb4cc'; g.fillRect(12,-54,18,10); O(g); g.strokeRect(12,-54,18,10);
  g.fillStyle='#2f4a66'; g.fillRect(15,-51,12,5);
});
reg('afbase',76,42,(g,t)=>{
  g.fillStyle='#5a6472'; g.fillRect(-36,-30,72,30); O(g); g.strokeRect(-36,-30,72,30);
  g.fillStyle='#4a5361'; g.fillRect(-36,-35,72,6);
  g.fillStyle='#3c434e'; g.beginPath(); g.moveTo(-15,0); g.lineTo(-15,-15); g.arc(0,-15,15,Math.PI,0); g.lineTo(15,0); g.closePath(); g.fill();
  g.fillStyle='#f5b53f';
  g.beginPath();
  for(let i=0;i<5;i++){
    const a=-Math.PI/2+i*pi2/5, a2=a+pi2/10;
    g.lineTo(24+Math.cos(a)*7,-22+Math.sin(a)*7); g.lineTo(24+Math.cos(a2)*3,-22+Math.sin(a2)*3);
  }
  g.closePath(); g.fill();
  g.fillStyle='#4a90e2'; g.fillRect(-36,-8,72,3);
});
reg('mechi',84,52,(g,t)=>{
  g.fillStyle='#4a4f5a'; g.fillRect(-40,-42,80,42); O(g); g.strokeRect(-40,-42,80,42);
  g.fillStyle='#d6493f'; g.fillRect(-40,-47,80,5);
  g.fillStyle='#33383f'; g.fillRect(-23,-26,46,26);
  g.fillStyle='#22262c'; g.fillRect(-11,-20,22,13);
  g.fillStyle=`rgba(255,90,78,${.6+Math.sin(t*3)*.3})`; g.fillRect(-8,-17,16,3.5);
  for(let i=0;i<8;i++){ g.fillStyle=i%2?'#e0a32e':'#2b3138'; g.fillRect(-40+i*10,-6,10,6); }
});
reg('stealthlab',64,60,(g,t)=>{
  // dark hangar + rotating sensor dome
  g.fillStyle='#2b3138'; g.fillRect(-28,-44,56,44); O(g); g.strokeRect(-28,-44,56,44);
  g.fillStyle='#1d2229'; g.fillRect(-28,-49,56,5);
  g.fillStyle='#33383f'; g.fillRect(-18,-36,36,28);
  const gl=.45+Math.sin(t*4)*.35;
  g.fillStyle=`rgba(91,194,78,${gl})`; g.fillRect(-13,-30,26,3);
  g.beginPath(); g.arc(0,-52,11,0,pi2); g.fillStyle='#33383f'; g.fill();
  g.strokeStyle='#5b6470'; g.lineWidth=2; g.stroke();
  const a=t*2.4;
  g.strokeStyle=`rgba(91,194,78,${.5+gl*.4})`; g.lineWidth=2.5;
  g.beginPath(); g.moveTo(0,-52); g.lineTo(Math.cos(a)*9,-52+Math.sin(a)*9); g.stroke();
  g.fillStyle=`rgba(91,194,78,${gl})`; g.beginPath(); g.arc(Math.cos(a)*13,-52+Math.sin(a)*13,2.5,0,pi2); g.fill();
});
reg('zeppeldock',70,64,(g,t)=>{
  g.fillStyle='#7d8794'; g.fillRect(-3,-58,6,58); O(g); g.strokeRect(-3,-58,6,58);
  g.fillRect(-15,-54,30,4); g.fillRect(-15,-42,30,4);
  g.strokeStyle='#5b6470'; g.lineWidth=1.5;
  g.beginPath(); g.moveTo(0,-52); g.quadraticCurveTo(30,-32,46,-10); g.stroke();
  g.fillStyle='#6b7484'; g.fillRect(-12,-8,24,8);
});
reg('goldenTurbine',50,56,(g,t)=>{
  g.fillStyle='rgba(245,181,63,.12)'; g.beginPath(); g.arc(0,-46,26,0,pi2); g.fill();
  g.fillStyle='#d9a92f'; g.fillRect(-2.5,-46,5,46);
  g.save(); g.translate(0,-46); g.rotate(t*1.6);
  g.fillStyle='#f5b53f';
  for(let i=0;i<3;i++){ g.rotate(pi2/3); g.beginPath(); g.moveTo(0,-2.5); g.lineTo(21,-1.2); g.lineTo(21,1.2); g.lineTo(0,2.5); g.closePath(); g.fill(); }
  g.restore();
  g.fillStyle='#ffd54f'; g.beginPath(); g.arc(0,-46,4.5,0,pi2); g.fill();
});
reg('tree',38,48,(g,t)=>{
  g.fillStyle='#6b4a2e'; g.fillRect(-3,-10,6,10);
  g.fillStyle='#3e7a3e'; g.beginPath(); g.moveTo(0,-46); g.lineTo(15,-14); g.lineTo(-15,-14); g.closePath(); g.fill();
  g.fillStyle='#356b35'; g.beginPath(); g.moveTo(0,-32); g.lineTo(19,-2); g.lineTo(-19,-2); g.closePath(); g.fill();
});
reg('rock',34,22,(g,t)=>{
  g.fillStyle='#8d9489'; g.beginPath(); g.ellipse(-4,-6,11,8,0,0,pi2); g.fill(); O(g,1.5); g.stroke();
  g.fillStyle='#a3a99e'; g.beginPath(); g.ellipse(7,-4,8,5.5,0,0,pi2); g.fill();
});
reg('flag',30,50,(g,t)=>{
  g.fillStyle='#7d8794'; g.fillRect(-1.5,-46,3,46); O(g,1.5); g.strokeRect(-1.5,-46,3,46);
  g.fillStyle='#d6493f';
  g.beginPath(); g.moveTo(1.5,-46);
  g.quadraticCurveTo(13,-44+Math.sin(t*4)*2.5, 21,-42);
  g.lineTo(21,-33); g.quadraticCurveTo(12,-34.5, 1.5,-35);
  g.closePath(); g.fill();
});
reg('wall',48,16,(g,t)=>{
  g.fillStyle='#7b8593'; g.fillRect(-22,-13,44,13); O(g); g.strokeRect(-22,-13,44,13);
  g.strokeStyle='rgba(0,0,0,.25)'; g.lineWidth=1;
  g.beginPath();
  for(let i=0;i<3;i++){ g.moveTo(-22,-13+i*4.5); g.lineTo(22,-13+i*4.5); }
  for(let i=0;i<5;i++){ g.moveTo(-18+i*9,-13); g.lineTo(-18+i*9,-8.5); g.moveTo(-14+i*9,-4.5); g.lineTo(-14+i*9,0); }
  g.stroke();
});
reg('goldenCrane',56,56,(g,t)=>{
  g.fillStyle='#d9a92f'; g.fillRect(-13,-7,26,7);
  g.fillRect(-3.5,-42,7,35); O(g,1.5); g.strokeRect(-3.5,-42,7,35);
  g.fillStyle='#e0a32e'; g.fillRect(-5,-46,38,5); g.fillRect(-20,-44,13,7);
  g.strokeStyle='#8a6a1f'; g.lineWidth=1.5; g.beginPath(); g.moveTo(27,-41); g.lineTo(27,-22); g.stroke();
  g.fillStyle='#f5b53f'; g.fillRect(23,-22,8,6);
});
reg('goldenBomb',40,42,(g,t)=>{
  g.fillStyle='#8a6f4d'; g.fillRect(-9,-7,18,7);
  g.fillStyle='rgba(245,181,63,.14)'; g.beginPath(); g.arc(0,-16,15,0,pi2); g.fill();
  g.fillStyle='#f5b53f'; g.beginPath(); g.arc(0,-16,10,0,pi2); g.fill(); O(g,1.5); g.stroke();
  g.fillStyle='#d9a92f'; g.fillRect(-2,-29,4,7);
  g.fillStyle='#fff2c9'; g.beginPath(); g.arc(-3.5,-19,2.5,0,pi2); g.fill();
});
reg('goldenMechStat',48,58,(g,t)=>{
  g.fillStyle='#8d9489'; g.fillRect(-17,-9,34,9);
  g.fillStyle='#f5b53f';
  g.fillRect(-7,-44,14,9); g.fillRect(-10,-35,20,16); g.fillRect(-17,-35,7,14); g.fillRect(10,-35,7,14);
  g.fillRect(-9,-19,8,10); g.fillRect(1,-19,8,10);
  g.fillStyle='#3a2c10'; g.fillRect(-5,-41,10,3.5);
  O(g,1.5); g.strokeRect(-10,-35,20,16);
});

// ----- units (side 'p' blue, 'e' red) -----
// (palettes moved to FACPAL — units are tinted by FACTION, not just p/e)

reg('rifle',20,22,(g,t,u)=>{
  const P=unitPal(u);
  // Boots, knees and a fitted field vest keep the silhouette readable at game zoom.
  g.fillStyle='#222831'; g.fillRect(-4.8,-2,4.1,2); g.fillRect(.7,-2,4.1,2);
  g.fillStyle=P.dark; g.fillRect(-4.4,-7,3.2,5.5); g.fillRect(1,-7,3.2,5.5);
  g.fillStyle='rgba(255,255,255,.18)'; g.fillRect(-4,-6,1,3); g.fillRect(1.5,-6,1,3);
  g.fillStyle=P.body; g.fillRect(-5.5,-15,11,9.5); O(g,1.5); g.strokeRect(-5.5,-15,11,9.5);
  g.fillStyle=P.metal; g.fillRect(-3.5,-13.5,7,5.5);
  g.fillStyle=P.dark; g.fillRect(-3.5,-8,7,1.3); g.fillRect(-8,-14,3,6); g.fillRect(5,-14,2.5,5);
  g.fillStyle=P.accent; g.fillRect(-2.5,-13,5,1.3);
  g.strokeStyle='rgba(18,24,32,.42)'; g.lineWidth=.8;
  g.beginPath(); g.moveTo(0,-13.5); g.lineTo(0,-9); g.moveTo(-3,-11); g.lineTo(-1,-11); g.moveTo(1,-11); g.lineTo(3,-11); g.stroke();
  g.fillStyle=P.skin; g.fillRect(-1,-16.5,4,3); g.beginPath(); g.arc(1,-18,3.6,0,pi2); g.fill();
  g.fillStyle=P.accent; g.beginPath(); g.arc(1,-19,3.8,Math.PI,0); g.closePath(); g.fill(); g.fillRect(-3.5,-19,9,2);
  g.fillStyle='rgba(255,255,255,.22)'; g.fillRect(-.5,-21.8,3.5,1);
  // Receiver, stock, top rail and muzzle are distinct, but stay inside the original sprite box.
  g.fillStyle='#242a32'; g.fillRect(-1,-12,3,2.5); g.fillRect(2,-12,10,2.2); g.fillRect(11,-12.4,1.5,3);
  g.fillStyle='#8e9aa8'; g.fillRect(3,-12,7,.65); g.fillRect(4,-13,3,.8);
});
reg('tank',40,22,(g,t,u)=>{
  const P=unitPal(u);
  g.fillStyle='#20262e'; g.fillRect(-18,-8,36,8); O(g,1.2); g.strokeRect(-18,-8,36,8);
  g.fillStyle='#3b444e'; g.fillRect(-16,-7,32,1.4);
  for(let i=0;i<8;i++){ g.fillStyle=i%2?'#171c22':'#525c67'; g.fillRect(-16+i*4,-1.8,2,1.1); }
  g.fillStyle='#353d47';
  for(let i=0;i<4;i++){ g.beginPath(); g.arc(-12+i*8,-4,2.9,0,pi2); g.fill(); }
  g.fillStyle=P.metal;
  for(let i=0;i<4;i++){ g.beginPath(); g.arc(-12+i*8,-4,1.45,0,pi2); g.fill(); }
  g.fillStyle=P.body; g.beginPath(); g.moveTo(-15,-7); g.lineTo(-14,-13); g.lineTo(-10,-14); g.lineTo(12,-14); g.lineTo(15,-11); g.lineTo(15,-7); g.closePath(); g.fill(); O(g,1.5); g.stroke();
  g.fillStyle='rgba(255,255,255,.18)'; g.fillRect(-10,-13,19,1.2);
  g.fillStyle='rgba(9,13,19,.2)'; g.fillRect(-14,-9,28,1.5);
  g.fillStyle=P.accent; g.fillRect(-13,-12,2,3);
  g.strokeStyle='rgba(18,24,32,.4)'; g.lineWidth=.8; g.beginPath(); g.moveTo(-5,-13); g.lineTo(-5,-8); g.moveTo(4,-13); g.lineTo(4,-9); g.stroke();
  g.fillStyle=P.body; g.beginPath(); g.moveTo(-8,-14); g.lineTo(-6,-19); g.lineTo(5,-20); g.lineTo(8,-17); g.lineTo(8,-14); g.closePath(); g.fill(); O(g,1.5); g.stroke();
  g.fillStyle='rgba(255,255,255,.17)'; g.fillRect(-5,-18.7,9,1.1);
  g.fillStyle=P.metal; g.beginPath(); g.ellipse(-1,-19.2,3,1.2,0,Math.PI,pi2); g.fill();
  g.fillStyle=P.dark; g.fillRect(7,-18,13,2.6); g.fillRect(18,-18.4,2,3.4);
  g.fillStyle='#97a4b3'; g.fillRect(9,-18,9,.6);
});
reg('heli',38,22,(g,t,u)=>{
  const P=unitPal(u);
  // Skids and struts sit below a tapered cabin; glass faces left, tail faces right.
  g.strokeStyle=P.dark; g.lineWidth=2;
  g.beginPath(); g.moveTo(-13,0); g.lineTo(10,0); g.moveTo(-9,-3); g.lineTo(-9,0); g.moveTo(5,-3); g.lineTo(5,0); g.stroke();
  g.fillStyle=P.body; g.beginPath(); g.ellipse(-3,-9,11,6,0,0,pi2); g.fill(); O(g,1.5); g.stroke();
  g.fillStyle='rgba(255,255,255,.13)'; g.beginPath(); g.ellipse(-4,-11.4,6,2,0,Math.PI,pi2); g.fill();
  g.fillStyle='rgba(8,13,20,.2)'; g.fillRect(-8,-6,14,2);
  g.fillStyle='#9fd0ff'; g.beginPath(); g.moveTo(-13,-10); g.lineTo(-9,-13); g.lineTo(-6,-12); g.lineTo(-6,-7); g.lineTo(-11,-7); g.closePath(); g.fill();
  g.strokeStyle='rgba(20,28,38,.5)'; g.lineWidth=.8; g.beginPath(); g.moveTo(-9,-12); g.lineTo(-8,-7); g.stroke();
  g.fillStyle=P.metal; g.fillRect(-3,-12,4,3); g.fillRect(3,-11,3,2.5);
  g.fillStyle='#20262e'; g.fillRect(8,-11,13,3.5); g.fillStyle=P.body; g.fillRect(8,-12,13,2.2);
  g.fillStyle=P.dark; g.fillRect(18,-15,3.5,6); g.fillStyle=P.accent; g.fillRect(19,-14,1.4,3);
  g.fillStyle='#ff6b5e'; g.fillRect(19,-8,1.5,1.2);
  // Rotor mast, blurred blades and a bright hub make the aircraft read clearly from above.
  g.fillStyle=P.dark; g.fillRect(-4,-18,2.5,4);
  g.save(); g.translate(-3,-18); g.rotate(t*14);
  g.fillStyle='rgba(35,42,52,.78)'; g.fillRect(-14,-1.2,28,2.4); g.fillRect(-1.1,-7,2.2,14);
  g.restore();
  g.fillStyle=P.metal; g.beginPath(); g.arc(-3,-18,1.8,0,pi2); g.fill();
  g.save(); g.translate(20,-13); g.rotate(-t*18);
  g.fillStyle='rgba(35,42,52,.8)'; g.fillRect(-.8,-4.5,1.6,9); g.fillRect(-4.5,-.8,9,1.6); g.restore();
});
reg('jet',36,18,(g,t,u)=>{
  const P=unitPal(u);
  g.fillStyle='rgba(255,170,65,.82)'; g.beginPath(); g.moveTo(-12,-7); g.lineTo(-20,-5.5); g.lineTo(-12,-4); g.closePath(); g.fill();
  g.fillStyle='#ffdc91'; g.beginPath(); g.moveTo(-12,-6.1); g.lineTo(-17,-5.5); g.lineTo(-12,-4.9); g.closePath(); g.fill();
  // Fuselage and wings, with a glass canopy, intake and restrained squadron markings.
  g.fillStyle=P.body;
  g.beginPath(); g.moveTo(15,-6); g.lineTo(2,-10.5); g.lineTo(-12,-8); g.lineTo(-12,-3.5); g.lineTo(2,-2); g.closePath(); g.fill(); O(g,1.5); g.stroke();
  g.fillStyle=P.dark;
  g.beginPath(); g.moveTo(2,-7.8); g.lineTo(-5,-1.2); g.lineTo(-1,-7.8); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-10,-7.8); g.lineTo(-16,-13.5); g.lineTo(-7,-8); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-12,-4); g.lineTo(-17,-.6); g.lineTo(-7,-3.4); g.closePath(); g.fill();
  g.fillStyle=P.metal; g.fillRect(-11,-6.8,2,2.8);
  g.fillStyle='#9fd0ff'; g.beginPath(); g.moveTo(5,-8.8); g.lineTo(10,-7.2); g.lineTo(8,-5.9); g.lineTo(4,-6.7); g.closePath(); g.fill();
  g.strokeStyle='rgba(255,255,255,.34)'; g.lineWidth=.8; g.beginPath(); g.moveTo(-8,-7.3); g.lineTo(1,-8.2); g.lineTo(12,-6.4); g.stroke();
  g.fillStyle=P.accent; g.fillRect(-2,-8.3,2.2,1.2); g.fillRect(-8,-5.2,2.3,.9);
  g.fillStyle='#2b3138'; g.fillRect(12,-6.7,2,1.2);
});
reg('mech',28,42,(g,t,u)=>{
  const P=unitPal(u);
  // Split greaves, knee joints and broad feet give the walker weight without enlarging it.
  g.fillStyle=P.dark; g.fillRect(-8,-15,6,13); g.fillRect(2,-15,6,13);
  g.fillStyle=P.metal; g.beginPath(); g.arc(-5,-13,2.1,0,pi2); g.arc(5,-13,2.1,0,pi2); g.fill();
  g.fillStyle='#252b34'; g.fillRect(-10,-3,9,3); g.fillRect(1,-3,9,3);
  g.fillStyle=P.accent; g.fillRect(-9,-2.8,4,1); g.fillRect(4,-2.8,4,1);
  g.fillStyle=P.body; g.fillRect(-9,-29,18,15); O(g,1.5); g.strokeRect(-9,-29,18,15);
  g.fillStyle=P.metal; g.fillRect(-6,-27,12,7);
  g.fillStyle=P.dark; g.fillRect(-1,-27,2,7); g.fillRect(-5,-22,10,2);
  g.fillStyle=P.accent; g.fillRect(-3,-25,6,4);
  g.fillStyle='rgba(255,255,255,.18)'; g.fillRect(-7,-28,6,1.2);
  g.fillStyle=P.dark; g.fillRect(-15,-29,6,9); g.fillRect(9,-29,6,9);
  g.fillStyle=P.body; g.fillRect(-16,-30,7,7); g.fillRect(9,-30,7,7); O(g,1.2); g.strokeRect(-16,-30,7,7); g.strokeRect(9,-30,7,7);
  g.fillStyle=P.accent; g.fillRect(-15,-29,2,2); g.fillRect(14,-29,2,2);
  g.fillStyle=P.metal; g.fillRect(9,-23,13,4); g.fillStyle=P.dark; g.fillRect(19,-24,3,6);
  g.fillStyle=P.body; g.fillRect(-5,-36,10,8); O(g,1.5); g.strokeRect(-5,-36,10,8);
  g.fillStyle=P.dark; g.fillRect(-3.5,-34,7,3.2);
  g.fillStyle='#ff6257'; g.fillRect(-3,-33.3,6,1.3);
  g.fillStyle='rgba(255,255,255,.17)'; g.fillRect(-3,-35.5,6,1);
});
reg('zeppelin',54,28,(g,t,u)=>{
  const P=unitPal(u);
  g.fillStyle=P.body; g.beginPath(); g.ellipse(0,-15,25,9.5,0,0,pi2); g.fill(); O(g,1.5); g.stroke();
  g.fillStyle='rgba(255,255,255,.16)'; g.beginPath(); g.ellipse(-2,-18.6,17,3.2,-.04,Math.PI,pi2); g.fill();
  g.strokeStyle='rgba(18,24,32,.34)'; g.lineWidth=.8;
  g.beginPath(); g.moveTo(-16,-21); g.quadraticCurveTo(-11,-15,-16,-9); g.moveTo(-7,-23); g.quadraticCurveTo(-3,-15,-7,-7); g.moveTo(4,-23); g.quadraticCurveTo(8,-15,4,-7); g.stroke();
  g.fillStyle=P.accent; g.fillRect(-23,-17,46,2.6);
  g.fillStyle=P.dark; g.beginPath(); g.moveTo(22,-15); g.lineTo(29,-21); g.lineTo(27,-14); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(22,-13); g.lineTo(29,-8); g.lineTo(27,-13); g.closePath(); g.fill();
  g.fillStyle=P.accent; g.fillRect(24,-18,3,2); g.fillRect(24,-12,3,2);
  g.fillStyle=P.metal; g.fillRect(-8,-8,16,5); O(g,1); g.strokeRect(-8,-8,16,5);
  g.fillStyle='#9fd0ff'; for(let i=0;i<4;i++) g.fillRect(-6+i*4,-7,2,1.5);
  g.fillStyle=P.dark; g.fillRect(-5,-3,10,1.2);
  g.save(); g.translate(-25,-15); g.rotate(t*20);
  g.fillStyle='rgba(120,128,140,.85)'; g.fillRect(-1.5,-7,3,14); g.fillRect(-6,-1,12,2); g.restore();
});
reg('spectre',20,26,(g,t,u)=>{
  const P=unitPal(u);
  // Faceted cloak, shadowed face and a crisp energy blade keep this elite silhouette distinct.
  g.fillStyle=P.dark;
  g.beginPath(); g.moveTo(-7,0); g.lineTo(-6,-14); g.quadraticCurveTo(0,-25,6,-14); g.lineTo(7,0); g.quadraticCurveTo(0,-3,-7,0); g.closePath(); g.fill(); O(g,1.5); g.stroke();
  g.fillStyle=P.body; g.beginPath(); g.moveTo(-5,-13); g.lineTo(-2,-20); g.lineTo(2,-20); g.lineTo(5,-13); g.lineTo(4,-6); g.lineTo(-4,-6); g.closePath(); g.fill();
  g.fillStyle='#10151d'; g.beginPath(); g.ellipse(0,-15,3.6,4.4,0,0,pi2); g.fill();
  g.fillStyle=P.accent; g.fillRect(-2.4,-16,1.8,1.7); g.fillRect(.6,-16,1.8,1.7);
  g.fillStyle='rgba(255,72,95,.28)'; g.beginPath(); g.ellipse(0,-15.2,4.5,5.4,0,0,pi2); g.fill();
  g.fillStyle=P.metal; g.fillRect(-8,-13,3,5); g.fillRect(5,-13,3,5);
  g.strokeStyle=P.accent; g.lineWidth=1.2; g.beginPath(); g.moveTo(-7,0); g.quadraticCurveTo(0,-4,7,0); g.moveTo(-4,-5); g.lineTo(-2,-10); g.moveTo(4,-5); g.lineTo(2,-10); g.stroke();
  g.fillStyle='#242a32'; g.save(); g.translate(7,-8); g.rotate(-.5); g.fillRect(-1.5,-7,3,9); g.restore();
  g.fillStyle='#c9f8ff'; g.save(); g.translate(7,-8); g.rotate(-.5); g.fillRect(-.5,-7,1,6); g.restore();
});
function drawCrateIcon(g,type,opened,t=0){
  // wooden crate, rarity stripe, label
  g.clearRect(0,0,150,110);
  g.save(); g.translate(75,92); g.scale(1.6,1.6);
  g.fillStyle='#8a6f4d'; g.fillRect(-24,-34,48,34);
  g.fillStyle='#a3865c'; g.fillRect(-24,-34,48,6);
  g.strokeStyle='#6b5436'; g.lineWidth=2;
  g.strokeRect(-24,-34,48,34);
  g.beginPath(); g.moveTo(-24,-34); g.lineTo(24,0); g.moveTo(24,-34); g.lineTo(-24,0); g.stroke();
  const col = {standard:'#8f9aa8',elite:'#4a90e2',premium:'#f5a53f',golden:'#ffd54f'}[type]||'#fff';
  g.fillStyle=col; g.fillRect(-24,-20,48,5);
  g.restore();
}
