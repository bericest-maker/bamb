/* Military Base 2.5D — 08c-sprites-buildings.js · sprites for new production/special/decor buildings + generated unit buildings */
'use strict';
// Unit buildings are drawn from STYLE templates (tent, tower, garage, barracks, bunker, lab, factory, pad, hangar, pentagon)
// and each carries a small SIGNBOARD with a mini picture of the unit it trains — so 35 buildings stay recognisable.
// Third draw arg `o` = {side, faction} of the owner (used for the flag + signboard unit colours).

const bPal = o => unitPal(o||{side:'p'});
function flagOn(g,x,y,o){ const P=bPal(o); g.fillStyle='#7d8794'; g.fillRect(x,y-16,2.5,16); g.fillStyle=P.body; g.fillRect(x+2.5,y-16,11,7); }
function signboard(g,x,y,unit,t,o){
  g.fillStyle='#4a3a28'; g.fillRect(x-1,y-2,2,8);
  g.fillStyle='#e8dfc8'; g.fillRect(x-11,y-18,22,16); O(g,1.2); g.strokeRect(x-11,y-18,22,16);
  const sp=SPR[unit]; if(!sp) return;
  const sc=Math.min(18/sp.w,13/sp.h);
  g.save(); g.translate(x,y-4); g.scale(sc,sc);
  const air=UNITS[unit]&&(UNITS[unit].cls.includes('air')||UNITS[unit].fly);
  if(air) g.translate(0,4);
  sp.draw(g,t,{side:(o&&o.side)||'p',faction:o&&o.faction});
  g.restore();
}
const BSTYLE = {
  tent(g,W,t,o){ const h=W*.42;
    g.fillStyle='#7c8a5a'; g.beginPath(); g.moveTo(-W/2,0); g.lineTo(-W*.3,-h); g.lineTo(W*.3,-h); g.lineTo(W/2,0); g.closePath(); g.fill(); O(g); g.stroke();
    g.fillStyle='#65714a'; g.beginPath(); g.moveTo(-W*.3,-h); g.lineTo(0,-h-6); g.lineTo(W*.3,-h); g.closePath(); g.fill();
    g.fillStyle='#3a4029'; g.beginPath(); g.moveTo(-6,0); g.lineTo(0,-h*.7); g.lineTo(6,0); g.closePath(); g.fill();
    return {sx:W*.36, fy:-h-6}; },
  tower(g,W,t,o){
    g.fillStyle='#6b5a44'; g.fillRect(-11,-34,3,34); g.fillRect(8,-34,3,34);
    g.strokeStyle='#5a4a36'; g.lineWidth=1.5; g.beginPath(); g.moveTo(-9,-30); g.lineTo(9,-6); g.moveTo(9,-30); g.lineTo(-9,-6); g.stroke();
    g.fillStyle='#8a6f4d'; g.fillRect(-14,-44,28,11); O(g); g.strokeRect(-14,-44,28,11);
    g.fillStyle='#5d4a33'; g.beginPath(); g.moveTo(-16,-44); g.lineTo(0,-52); g.lineTo(16,-44); g.closePath(); g.fill();
    g.fillStyle='#1d2330'; g.fillRect(-9,-41,18,4);
    return {sx:W*.38, fy:-52, noflag:true}; },
  garage(g,W,t,o){ const h=W*.44;
    g.fillStyle='#6f7a84'; g.fillRect(-W/2,-h,W,h); O(g); g.strokeRect(-W/2,-h,W,h);
    g.fillStyle='#5a646d'; g.fillRect(-W/2,-h-5,W,5);
    const dw=W*.3; g.fillStyle='#3a4149';
    g.fillRect(-W*.42,-h*.7,dw,h*.7); g.fillRect(W*.42-dw,-h*.7,dw,h*.7);
    g.strokeStyle='rgba(255,255,255,.12)'; g.lineWidth=1; for(let i=1;i<5;i++){ const y=-h*.7+i*h*.14; g.beginPath(); g.moveTo(-W*.42,y); g.lineTo(-W*.42+dw,y); g.moveTo(W*.42-dw,y); g.lineTo(W*.42,y); g.stroke(); }
    return {sx:0, sy:-h-5, fy:-h-5}; },
  barracks(g,W,t,o){ const h=W*.5;
    g.fillStyle='#5d7a4a'; g.fillRect(-W/2,-h,W,h); O(g); g.strokeRect(-W/2,-h,W,h);
    g.fillStyle='#48603a'; g.fillRect(-W/2,-h-6,W,6);
    g.fillStyle='#3c4f31'; g.fillRect(-6,-16,12,16);
    g.fillStyle='#cfe3a8'; for(let x=-W/2+6;x<W/2-10;x+=14){ if(Math.abs(x+4)<10) continue; g.fillRect(x,-h+6,8,6); }
    return {sx:W*.36, fy:-h-6}; },
  bunker(g,W,t,o){ const h=W*.3;
    g.fillStyle='#7a7466'; g.beginPath(); g.moveTo(-W/2,0); g.lineTo(-W*.4,-h); g.lineTo(W*.4,-h); g.lineTo(W/2,0); g.closePath(); g.fill(); O(g); g.stroke();
    g.fillStyle='#1d2330'; g.fillRect(-W*.28,-h*.62,W*.56,4);
    g.fillStyle='#b3a988'; for(let x=-W/2;x<W/2;x+=9){ g.beginPath(); g.ellipse(x+4,-1,5,3,0,0,pi2); g.fill(); }
    return {sx:W*.3, sy:-h, fy:-h}; },
  lab(g,W,t,o){ const h=W*.5;
    g.fillStyle='#d5dbe4'; g.fillRect(-W/2,-h,W,h); O(g); g.strokeRect(-W/2,-h,W,h);
    g.fillStyle='#aeb7c4'; g.fillRect(-W/2,-h-5,W,5);
    g.fillStyle='#4aa3df'; g.fillRect(-W/2+5,-h+6,W-10,6);
    g.fillStyle='#8a94a4'; g.beginPath(); g.arc(-W*.22,-h-5,W*.16,Math.PI,0); g.fill(); O(g,1.5); g.stroke();
    g.fillStyle=`rgba(120,220,255,${.5+.4*Math.sin(t*3)})`; g.fillRect(-4,-h*.5,8,h*.5);
    return {sx:W*.3, fy:-h-5}; },
  factory(g,W,t,o){ const h=W*.42;
    g.fillStyle='#66725f'; g.fillRect(-W/2,-h,W,h); O(g); g.strokeRect(-W/2,-h,W,h);
    g.fillStyle='#525c4c'; for(let i=0;i<3;i++){ const x=-W/2+i*W/3; g.beginPath(); g.moveTo(x,-h); g.lineTo(x+W/6,-h-9); g.lineTo(x+W/3,-h); g.closePath(); g.fill(); }
    g.fillStyle='#8a8f96'; g.fillRect(W*.3,-h-22,6,22);
    g.fillStyle=`rgba(200,200,210,${.35+.2*Math.sin(t*2)})`; g.beginPath(); g.arc(W*.3+3+Math.sin(t)*2,-h-28,5,0,pi2); g.fill();
    g.fillStyle='#3a4149'; g.fillRect(-W*.3,-h*.65,W*.4,h*.65);
    return {sx:-W*.05, sy:-h-9, fy:-h-9, fx:-W*.42}; },
  pad(g,W,t,o){
    g.fillStyle='#5f6a74'; g.beginPath(); g.ellipse(-W*.1,-3,W*.4,W*.15,0,0,pi2); g.fill(); O(g); g.stroke();
    g.strokeStyle='#f5b53f'; g.lineWidth=1.5; g.beginPath(); g.ellipse(-W*.1,-3,W*.3,W*.1,0,0,pi2); g.stroke();
    g.fillStyle='#fff'; g.font='bold 10px sans-serif'; g.textAlign='center'; g.fillText('H',-W*.1,0); g.textAlign='left';
    g.fillStyle='#8792a6'; g.fillRect(W*.3,-34,10,34); O(g,1.5); g.strokeRect(W*.3,-34,10,34);
    return {sx:W*.36, sy:-34, fy:-34, fx:W*.3}; },
  hangar(g,W,t,o){ const h=W*.38;
    g.fillStyle='#7d8794'; g.beginPath(); g.moveTo(-W/2,0); g.lineTo(-W/2,-h*.6); g.quadraticCurveTo(0,-h*1.5,W/2,-h*.6); g.lineTo(W/2,0); g.closePath(); g.fill(); O(g); g.stroke();
    g.strokeStyle='rgba(255,255,255,.18)'; g.lineWidth=1; for(let i=-2;i<=2;i++){ g.beginPath(); g.moveTo(i*W/6,0); g.lineTo(i*W/6,-h*(1.05-Math.abs(i)*.12)); g.stroke(); }
    g.fillStyle='#2a3038'; g.beginPath(); g.moveTo(-W*.3,0); g.lineTo(-W*.3,-h*.55); g.quadraticCurveTo(0,-h*1.05,W*.3,-h*.55); g.lineTo(W*.3,0); g.closePath(); g.fill();
    g.fillStyle='#f5b53f'; g.fillRect(-W/2,-2,W,2);
    return {sx:W*.4, sy:-h*.55, fy:-h*1.1, fx:-W*.08}; },
  dock(g,W,t,o){ const h=W*.26;                       // pier on stilts + a crane + a ramp into the water
    g.fillStyle='#5b6470'; for(const x of [-W*.42,W*.3]) g.fillRect(x,-2,4,h+4);
    g.fillStyle='#8a6f4d'; g.beginPath(); g.moveTo(-W*.5,-h); g.lineTo(W*.5,-h); g.lineTo(W*.42,0); g.lineTo(-W*.42,0); g.closePath(); g.fill(); O(g); g.stroke();
    g.strokeStyle='rgba(0,0,0,.22)'; g.lineWidth=1;
    for(let i=1;i<6;i++){ const x=-W*.48+i*W*.16; g.beginPath(); g.moveTo(x,-h); g.lineTo(x-.6,0); g.stroke(); }
    g.fillStyle='#8792a6'; g.fillRect(-W*.44,-h-16,9,16); O(g,1.4); g.strokeRect(-W*.44,-h-16,9,16);
    g.fillStyle='#6b7484'; g.fillRect(-W*.44+9,-h-16,W*.62,4);          // crane jib
    g.strokeStyle='#5b6470'; g.lineWidth=1.4; g.beginPath(); g.moveTo(W*.1,-h-12); g.lineTo(W*.1,-h-3); g.stroke();
    g.fillStyle='#4a5361'; g.fillRect(W*.1-3,-h-3,6,3);
    g.fillStyle='#3f6f9e'; g.beginPath(); g.moveTo(W*.5,-h+1); g.lineTo(W*.62,2); g.lineTo(W*.38,2); g.closePath(); g.fill();   // launch ramp
    return {sx:W*.3, sy:-h, fy:-h-16, fx:-W*.5}; },
  silo(g,W,t,o){ const h=W*.62;                       // missile silo: concrete tube + sliding roof
    g.fillStyle='#7a7466'; g.fillRect(-W*.4,0,W*.8,3); O(g); g.strokeRect(-W*.4,0,W*.8,3);
    g.fillStyle='#8a8474'; g.beginPath(); g.moveTo(-W*.36,0); g.lineTo(-W*.3,-h); g.lineTo(W*.3,-h); g.lineTo(W*.36,0); g.closePath(); g.fill(); O(g); g.stroke();
    g.fillStyle='#e0a32e'; g.fillRect(-W*.36,-h*.45,W*.72,3);            // warning stripe
    const open=.5+.5*Math.sin(t*.8);
    g.fillStyle='#5c6675'; g.fillRect(-W*.3-open*W*.22,-h-4,W*.3,4); g.fillRect(open*W*.22,-h-4,W*.3,4);
    g.fillStyle=bPal(o).accent; g.beginPath(); g.moveTo(-W*.12,-h-2); g.lineTo(0,-h-14-open*4); g.lineTo(W*.12,-h-2); g.closePath(); g.fill();
    g.fillStyle=`rgba(255,150,60,${.4+.4*Math.sin(t*6)})`; g.beginPath(); g.arc(0,-h-1,W*.1,0,pi2); g.fill();
    return {sx:W*.34, fy:-h-4, fx:-W*.42}; },
  pentagon(g,W,t,o){ const r=W*.42;
    g.fillStyle='#b9b3a2'; g.beginPath(); for(let i=0;i<5;i++){ const a=-Math.PI/2+i*pi2/5; g.lineTo(Math.cos(a)*r,-r*.45+Math.sin(a)*r*.45); } g.closePath(); g.fill(); O(g); g.stroke();
    g.fillStyle='#9a9484'; g.beginPath(); for(let i=0;i<5;i++){ const a=-Math.PI/2+i*pi2/5; g.lineTo(Math.cos(a)*r*.5,-r*.45+Math.sin(a)*r*.22); } g.closePath(); g.fill();
    g.fillStyle='#5f8a4a'; g.beginPath(); for(let i=0;i<5;i++){ const a=-Math.PI/2+i*pi2/5; g.lineTo(Math.cos(a)*r*.25,-r*.45+Math.sin(a)*r*.11); } g.closePath(); g.fill();
    return {sx:r*.9, sy:0, fy:-r*.9, fx:-r*.2}; },
};
const STYLE_W = {tent:[46,58],tower:[40,40],garage:[58,64],barracks:[58,66],bunker:[52,58],lab:[56,66],factory:[62,80],pad:[60,66],hangar:[66,84],pentagon:[80,90],dock:[60,76],silo:[54,66]};
// generated for EVERY unit building that has a style (the two UNIT_BUILDINGS tables + the naval/expansion ones)
for(const id of Object.keys(BUILD)){
  const d0=BUILD[id]; if(!d0.unit||!d0.style) continue;
  const unit=d0.unit, style=d0.style, w=d0.w;
  const W=(STYLE_W[style]||STYLE_W.garage)[w>=3?1:0], H=Math.round(W*.9);
  reg(id,W,H,(g,t,o)=>{
    const r=BSTYLE[style](g,W,t,o);
    if(!r.noflag) flagOn(g,r.fx??(-W/2+2),r.fy,o);
    signboard(g,r.sx,r.sy??0,unit,t,o);
  });
}
// the 5 original unit buildings get a signboard too (drawn after their hand-made art)
for(const id of ['barracks','tankfac','heliport','afbase','mechi','zeppeldock','stealthlab']){
  const base=SPR[id], unit=BUILD[id].unit;
  reg(id,base.w,base.h,(g,t,o)=>{ base.draw(g,t,o); signboard(g,-base.w*.42,0,unit,t,o); });
}

// ================= v8.12 MODEL MATCH — LIMITED buildings (top 12 by power) =================
// Redrawn from uploads/Buildings_01..04_of_04.txt part dumps. Same W,H as the generated/hand
// sprites they replace → footprints, saves and balance untouched. Flag/signboard kept.
reg('b2hangar',84,76,(g,t,o)=>{   // ← Stealth Hangar 6.4×6.3: angular dark-blue hangar, black door
  g.fillStyle='#1c2936'; g.fillRect(-40,-3,80,3);
  g.fillStyle='#3a3a40'; g.beginPath(); g.moveTo(-38,0); g.lineTo(-30,-34); g.lineTo(30,-34); g.lineTo(38,0); g.closePath(); g.fill(); O(g); g.stroke();
  g.fillStyle='#565662'; g.beginPath(); g.moveTo(-30,-34); g.lineTo(-24,-40); g.lineTo(24,-40); g.lineTo(30,-34); g.closePath(); g.fill(); O(g,1.2); g.stroke();
  g.fillStyle='#10151c'; g.beginPath(); g.moveTo(-16,0); g.lineTo(-12,-24); g.lineTo(12,-24); g.lineTo(16,0); g.closePath(); g.fill();
  g.strokeStyle='rgba(255,255,255,.14)'; g.lineWidth=1;
  g.beginPath(); g.moveTo(-24,-2); g.lineTo(-19,-30); g.moveTo(24,-2); g.lineTo(19,-30); g.stroke();
  g.fillStyle='#6e99c9'; g.fillRect(-14,-26,3,3); g.fillRect(11,-26,3,3);
  flagOn(g,-6.7,-35,o); signboard(g,33.6,-17.6,'b2',t,o);
});
reg('railgunlab',66,59,(g,t,o)=>{   // ← Secret Weapons Facility 12.7×7.1: dark lab, giant cyan window
  g.fillStyle='#2e2e2e'; g.fillRect(-30,-4,60,4);
  g.fillStyle='#404040'; g.fillRect(-29,-34,58,30); O(g); g.strokeRect(-29,-34,58,30);
  g.fillStyle='#2e2e2e'; g.fillRect(-26,-31,52,25);
  const gl=.7+.3*Math.sin(t*3);
  g.fillStyle='#141a24'; g.fillRect(-25,-29,50,14);
  g.fillStyle=`rgba(128,191,214,${gl})`; g.fillRect(-24,-28,48,12);
  g.fillStyle='#141a24'; g.fillRect(-1,-28,2,12);
  g.fillStyle='#1c2936'; g.fillRect(-10,-15,20,11); O(g,1); g.strokeRect(-10,-15,20,11);
  g.fillStyle=`rgba(128,191,214,${gl})`; g.fillRect(-8,-11,16,2);
  g.fillStyle='#2e2e2e'; g.fillRect(-20,-38,8,4); g.fillRect(-4,-38,8,4); g.fillRect(12,-38,8,4);
  flagOn(g,-31,-38,o); signboard(g,19.8,0,'railgun',t,o);
});
reg('zeppeldock',70,64,(g,t,o)=>{   // ← Airship Docks: mooring mast + yellow neon rigging
  g.fillStyle='#4a4f54'; g.fillRect(-30,-8,60,8); O(g,1.2); g.strokeRect(-30,-8,60,8);
  g.fillStyle='#2b2f36'; g.fillRect(-30,-3,60,3);
  g.fillStyle='#666b75'; g.fillRect(-26,-20,12,12); O(g,1.2); g.strokeRect(-26,-20,12,12);
  g.fillStyle='#3b3d45'; g.beginPath(); g.moveTo(-4,-8); g.lineTo(4,-8); g.lineTo(2,-52); g.lineTo(-2,-52); g.closePath(); g.fill(); O(g,1.2); g.stroke();
  const gl=.65+.35*Math.sin(t*2.5);
  g.fillStyle=`rgba(255,232,158,${gl})`;
  g.fillRect(-3.4,-22,6.8,2.4); g.fillRect(-3,-34,6,2.4); g.fillRect(-2.6,-46,5.2,2.4);
  g.fillStyle='#4a4f54'; g.fillRect(2,-53,20,3); O(g,1); g.strokeRect(2,-53,20,3);
  g.strokeStyle='#9aa4b1'; g.lineWidth=1.2; g.beginPath(); g.moveTo(22,-50); g.lineTo(22,-38); g.stroke();
  g.fillStyle='#ffe89e'; g.beginPath(); g.arc(22,-36,2,0,pi2); g.fill();
  flagOn(g,-33,-28,o); signboard(g,-29.4,0,'zeppelin',t,o);
});
reg('icbmsilo',54,49,(g,t,o)=>{   // ← Nuclear Silo 6.3×6.5: olive base, grey tube, red-tipped missile
  g.fillStyle='#2e3321'; g.fillRect(-20,-8,40,8); O(g,1.2); g.strokeRect(-20,-8,40,8);
  g.fillStyle='#4f4f4f'; g.fillRect(-12,-30,24,22); O(g,1.2); g.strokeRect(-12,-30,24,22);
  g.fillStyle='#1c2936'; g.fillRect(-12,-12,24,4);
  g.fillStyle='#d9c778'; g.fillRect(-12,-32,24,2);
  g.fillStyle='#c9ccd1'; g.fillRect(4,-26,4,8);
  g.fillStyle='#383838'; g.fillRect(-9,-34,4,2); g.fillRect(5,-34,4,2);
  g.fillStyle='#636363'; g.fillRect(15,-32,7,24); O(g,1); g.strokeRect(15,-32,7,24);
  g.fillStyle='#823d3d'; g.beginPath(); g.moveTo(15,-32); g.lineTo(22,-32); g.lineTo(18.5,-38); g.closePath(); g.fill();
  g.fillStyle='#4a4a4a'; g.fillRect(13,-10,3,5); g.fillRect(21,-10,3,5);
  if(Math.floor(t*2)%2){ g.fillStyle='#ff5a4e'; g.beginPath(); g.arc(18.5,-39,1.8,0,pi2); g.fill(); }
  flagOn(g,-27,-44,o); signboard(g,-17,-30,'icbm',t,o);
});
reg('bomberbase',84,76,(g,t,o)=>{   // ← Strategic Command Center 13.1×14.8: rose walls, window strip, radar
  g.fillStyle='#8f5c5c'; g.fillRect(-38,-20,76,20); O(g); g.strokeRect(-38,-20,76,20);
  g.fillStyle='#1c2936'; g.fillRect(-8,-12,16,12);
  g.fillStyle='#3d3d3d'; g.fillRect(-38,-26,76,7);
  g.fillStyle='#141a24'; g.fillRect(-37,-34,74,8);
  g.fillStyle='#6e99c9'; g.fillRect(-36,-33,72,6);
  g.fillStyle='#141a24'; for(let i=0;i<6;i++) g.fillRect(-26+i*12,-33,1.5,6);
  g.fillStyle='#7d7d7d'; g.fillRect(-38,-38,76,5); O(g,1.2); g.strokeRect(-38,-38,76,5);
  g.fillStyle='#8a8a8a'; g.fillRect(-30,-41,60,3);
  g.fillStyle='#4a4a4a'; g.fillRect(-30,-47,4,7);
  g.save(); g.translate(-28,-47); g.rotate(t*1.5);
  g.fillStyle='#9aa4b1'; g.fillRect(-1,-1,14,2); g.beginPath(); g.arc(0,0,3,0,pi2); g.fill();
  g.restore();
  flagOn(g,-6.7,-35,o); signboard(g,33.6,-17.6,'b52',t,o);
});
reg('pentagon',90,81,(g,t,o)=>{   // ← Pentagon: sand 5-sided block, pillars, dark blue roof
  g.fillStyle='#b3a37f';
  g.beginPath(); g.moveTo(-30,-30); g.lineTo(-40,-24); g.lineTo(-40,0); g.lineTo(-30,0); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(30,-30); g.lineTo(40,-24); g.lineTo(40,0); g.lineTo(30,0); g.closePath(); g.fill(); O(g,1.2); g.stroke();
  g.fillStyle='#c9ba91'; g.fillRect(-30,-30,60,30); O(g); g.strokeRect(-30,-30,60,30);
  g.fillStyle='#e6d1a3'; g.fillRect(-30,-27,60,5);
  g.fillStyle='#b3a37f'; for(let i=0;i<10;i++) g.fillRect(-29+i*6,-27,1.5,5);
  g.fillStyle='#141a24'; g.fillRect(-30,-20,60,7);
  g.fillStyle='#6e99c9'; g.fillRect(-29,-19,58,5);
  g.fillStyle='#594d42'; g.fillRect(-30,-6,60,6);
  g.fillStyle='#3d332a'; g.fillRect(-24,-6,8,6); g.fillRect(-4,-6,8,6); g.fillRect(16,-6,8,6);
  g.fillStyle='#212e3d'; g.fillRect(-32,-36,64,6); O(g,1.2); g.strokeRect(-32,-36,64,6);
  g.fillStyle='#3d3d3d'; g.fillRect(-32,-37,64,1.5);
  g.fillStyle='#10151c'; g.fillRect(-6,-35,12,3);
  g.fillStyle='#6e99c9'; g.fillRect(-2,-35,4,3);
  flagOn(g,-7.5,-34,o); signboard(g,34,0,'ac130',t,o);
});
reg('f35hangar',84,76,(g,t,o)=>{   // ← Joint Strike Facility 7.8³: dark bay, glass front, yellow trim
  g.fillStyle='#404040'; g.fillRect(-36,-36,72,36); O(g); g.strokeRect(-36,-36,72,36);
  g.fillStyle='#7d7d7d'; g.fillRect(-36,-36,6,36); g.fillRect(30,-36,6,36);
  g.fillStyle='#54574d'; g.fillRect(-28,-31,56,31);
  g.fillStyle='#141a24'; g.fillRect(-25,-29,50,22);
  g.fillStyle='#6e99c9'; g.fillRect(-24,-28,48,20);
  g.fillStyle='rgba(255,255,255,.16)'; g.beginPath(); g.moveTo(-24,-8); g.lineTo(-4,-28); g.lineTo(6,-28); g.lineTo(-14,-8); g.closePath(); g.fill();
  g.fillStyle='#141a24'; g.fillRect(-1,-28,2,20);
  g.fillStyle='#b38729'; g.fillRect(-30,-35,60,3); g.fillRect(-28,-3,56,3);
  g.fillStyle='#c9ccd1'; g.fillRect(-8,-42,16,6); O(g,1); g.strokeRect(-8,-42,16,6);
  g.fillStyle=`rgba(223,230,238,${.5+.3*Math.sin(t*3)})`; g.fillRect(-24,-32,48,1.5);
  flagOn(g,-6.7,-35,o); signboard(g,33.6,-17.6,'f35',t,o);
});
reg('raptorhangar',84,76,(g,t,o)=>{   // ← Wing Command 8.7×7: light grey hangar, glass band, beacon mast
  g.fillStyle='#b0b0b0'; g.fillRect(-36,-30,72,30); O(g); g.strokeRect(-36,-30,72,30);
  g.fillStyle='#969696'; g.fillRect(-36,-25,72,5);
  g.fillStyle='#141a24'; g.fillRect(-33,-19,66,9);
  g.fillStyle='#6e99c9'; g.fillRect(-32,-18,64,7);
  g.fillStyle='#141a24'; for(let i=0;i<5;i++) g.fillRect(-22+i*13,-18,1.5,7);
  g.fillStyle='#2b2f36'; g.fillRect(-36,-4,72,4);
  g.fillStyle='#705c54'; g.fillRect(-31,-12,8,8); O(g,1); g.strokeRect(-31,-12,8,8);
  g.fillStyle='#4a4a4a'; g.fillRect(-1.5,-44,3,14);
  g.fillStyle=(Math.floor(t*2)%2)?'#ff5a4e':'#5a2323'; g.beginPath(); g.arc(0,-45,2.4,0,pi2); g.fill();
  flagOn(g,-6.7,-35,o); signboard(g,33.6,-17.6,'f22',t,o);
});
reg('monitoring',60,54,(g,t,o)=>{   // ← Monitoring Center 3×7.75: dark tower, pulsing blue core, dish
  g.fillStyle='#4f5245'; g.fillRect(-20,-8,40,8); O(g,1.2); g.strokeRect(-20,-8,40,8);
  g.fillStyle='#3b3b3b'; g.fillRect(-13,-44,26,36); O(g,1.2); g.strokeRect(-13,-44,26,36);
  const gl=.6+.4*Math.sin(t*2.5);
  g.fillStyle=`rgba(59,69,115,${gl})`; g.fillRect(-8,-41,16,26);
  g.fillStyle='#3b4573'; g.fillRect(-8,-41,16,3);
  g.fillStyle='#000'; g.fillRect(-13,-22,26,4);
  g.fillStyle='#e8e8e8'; g.beginPath(); g.arc(16,-32,5,0,pi2); g.fill(); O(g,1); g.stroke();
  g.fillStyle='#3b3b3b'; g.beginPath(); g.arc(16,-32,1.8,0,pi2); g.fill();
  g.fillStyle='#7d8794'; g.fillRect(-1,-50,2,6);
  g.fillStyle='#ff5a4e'; g.fillRect(-1.5,-52,3,3);
  flagOn(g,18,-34,o); signboard(g,21.6,-34,'stealthheli',t,o);
});
reg('saboteurcamp',56,50,(g,t,o)=>{   // ← Sentinel Training Center 5.2×10.4: long blue-grey block, dark roof
  g.fillStyle='#404a54'; g.fillRect(-26,-18,52,18); O(g); g.strokeRect(-26,-18,52,18);
  g.fillStyle='#2b2f36'; g.fillRect(-28,-22,56,4); O(g,1); g.strokeRect(-28,-22,56,4);
  g.fillStyle='#1c2936'; g.fillRect(-20,-10,6,10); g.fillRect(-3,-10,6,10); g.fillRect(14,-10,6,10);
  g.fillStyle='#59636e'; g.fillRect(-24,-16,48,2);
  g.fillStyle='#141a24'; g.fillRect(-26,-2,52,2);
  flagOn(g,-26,-33,o); signboard(g,16.8,0,'saboteur',t,o);
});
reg('swarmhive',56,50,(g,t,o)=>{   // ← Mechanical Hive 9.3²: dark hive, hazard base, neon strip, hex cells
  g.fillStyle='#a16e00'; g.fillRect(-26,-6,52,6); O(g,1.2); g.strokeRect(-26,-6,52,6);
  g.fillStyle='#1c2936';
  for(let i=0;i<4;i++){ g.beginPath(); g.moveTo(-24+i*13,-1); g.lineTo(-19+i*13,-6); g.lineTo(-14+i*13,-1); g.closePath(); g.fill(); }
  g.fillStyle='#3d3d3d'; g.fillRect(-24,-32,48,26); O(g); g.strokeRect(-24,-32,48,26);
  g.fillStyle='#595959'; g.fillRect(-24,-36,48,4);
  g.fillStyle=`rgba(201,204,209,${.55+.35*Math.sin(t*3)})`; g.fillRect(-24,-28,48,3);
  g.fillStyle='#6e99c9'; g.fillRect(-14,-24,5,12); g.fillRect(9,-24,5,12);
  g.strokeStyle='rgba(255,255,255,.22)'; g.lineWidth=1;
  for(const [hx,hy] of [[-4,-18],[4,-14],[-4,-10]]){
    g.beginPath(); for(let i=0;i<6;i++){ const a=i*pi2/6+pi2/12; const px=hx+Math.cos(a)*4, py=hy+Math.sin(a)*4; i?g.lineTo(px,py):g.moveTo(px,py); } g.closePath(); g.stroke();
  }
  g.fillStyle='#1c2936'; g.fillRect(-22,-12,8,6);
  g.fillStyle='#7d8794'; g.fillRect(17,-39,2,3);
  g.fillStyle='#9ea1ab'; g.beginPath(); g.arc(18,-40,2.4,0,pi2); g.fill();
  flagOn(g,-26,-33,o); signboard(g,16.8,0,'swarmdrone',t,o);
});
reg('fusion',68,62,(g,t)=>{   // ← Fusion Reactor 9.1×9.8: olive base, metal stack, floating blue orb
  g.fillStyle='#1c2936'; g.fillRect(-30,-4,60,4); O(g,1.2); g.strokeRect(-30,-4,60,4);
  g.fillStyle='#2e3321'; g.fillRect(-28,-16,56,12); O(g); g.strokeRect(-28,-16,56,12);
  g.fillStyle='#3d3d3d'; g.fillRect(-24,-28,48,12); O(g,1.2); g.strokeRect(-24,-28,48,12);
  g.fillStyle='#7d7d7d'; g.fillRect(-16,-36,32,8); O(g,1); g.strokeRect(-16,-36,32,8);
  g.fillStyle='#6e99c9'; g.fillRect(-1,-30,2,14);
  const oy=-46+Math.sin(t*2)*1.5, gl=.6+.4*Math.sin(t*4);
  g.fillStyle=`rgba(110,153,201,${.25*gl})`; g.beginPath(); g.arc(0,oy,11,0,pi2); g.fill();
  g.fillStyle='#6e99c9'; g.beginPath(); g.arc(0,oy,7,0,pi2); g.fill(); O(g,1.2); g.stroke();
  g.fillStyle='#f7f7f7'; g.beginPath(); g.arc(0,oy,2.6,0,pi2); g.fill();
  g.fillStyle='#f7f7f7';
  for(let i=0;i<2;i++){ const a=t*2+i*Math.PI; g.fillRect(Math.cos(a)*11-1.5,oy+Math.sin(a)*4-1.5,3,3); }
});

// ----- PRODUCTION -----
// v8.11 MODEL MATCH: palette/shapes from uploads/Buildings_01_of_04.txt (Wind Turbine: dark base
// disc, tapered white tower #c9ccd1, grey nacelle, 3 light-grey blades #a6a6ab on the rotationJoint)
reg('wind',40,64,(g,t)=>{
  g.fillStyle='#2b2f36'; g.fillRect(-7,-3,14,3); O(g,1); g.strokeRect(-7,-3,14,3);
  g.fillStyle='#c9ccd1'; g.beginPath(); g.moveTo(-3.5,-3); g.lineTo(-1.5,-48); g.lineTo(1.5,-48); g.lineTo(3.5,-3); g.closePath(); g.fill(); O(g,1.2); g.stroke();
  g.fillStyle='#141a24'; g.fillRect(-1.5,-8,3,5);
  g.fillStyle='#4f4f4f'; g.beginPath(); g.arc(0,-48,3.4,0,pi2); g.fill(); O(g,1); g.stroke();
  g.save(); g.translate(0,-48); g.rotate(t*2.4);
  g.fillStyle='#a6a6ab'; for(let i=0;i<3;i++){ g.rotate(pi2/3); g.beginPath(); g.moveTo(0,-1.5); g.lineTo(18,-2.5); g.lineTo(18,0); g.lineTo(0,1.5); g.closePath(); g.fill(); O(g,1); g.stroke(); }
  g.restore(); g.fillStyle='#e8ecf1'; g.beginPath(); g.arc(0,-48,2.2,0,pi2); g.fill();
});
reg('ironmine',46,36,(g,t)=>{
  g.fillStyle='#6b5a44'; g.beginPath(); g.moveTo(-22,0); g.lineTo(-12,-18); g.lineTo(12,-18); g.lineTo(22,0); g.closePath(); g.fill(); O(g); g.stroke();
  g.fillStyle='#1d1a16'; g.beginPath(); g.moveTo(-8,0); g.lineTo(-8,-10); g.quadraticCurveTo(0,-17,8,-10); g.lineTo(8,0); g.closePath(); g.fill();
  g.fillStyle='#8a6f4d'; g.fillRect(-10,-12,3,12); g.fillRect(7,-12,3,12); g.fillRect(-10,-14,20,3);
  const x=Math.sin(t*1.3)*6; g.fillStyle='#5a646d'; g.fillRect(x-5,-5,10,4); g.fillStyle='#9a6b4b'; g.fillRect(x-4,-8,8,3);
  g.fillStyle='#22282f'; g.beginPath(); g.arc(x-3,-1,1.5,0,pi2); g.arc(x+3,-1,1.5,0,pi2); g.fill();
});
reg('steel',64,48,(g,t)=>{
  g.fillStyle='#6f6a66'; g.fillRect(-30,-26,60,26); O(g); g.strokeRect(-30,-26,60,26);
  g.fillStyle='#57524e'; g.fillRect(-30,-30,60,4);
  g.fillStyle='#8a8f96'; g.fillRect(14,-44,7,18); g.fillRect(-20,-40,6,14);
  g.fillStyle=`rgba(255,140,40,${.6+.3*Math.sin(t*5)})`; g.fillRect(-12,-16,24,10);
  g.fillStyle=`rgba(190,190,200,${.3+.15*Math.sin(t*2)})`; g.beginPath(); g.arc(17+Math.sin(t)*2,-50,5,0,pi2); g.fill();
});
reg('refinery',66,54,(g,t)=>{
  g.fillStyle='#c7ccd4'; g.beginPath(); g.ellipse(-16,-14,12,14,0,0,pi2); g.fill(); O(g); g.stroke();
  g.fillStyle='#b2b8c2'; g.beginPath(); g.ellipse(8,-12,10,12,0,0,pi2); g.fill(); O(g); g.stroke();
  g.fillStyle='#8a8f96'; g.fillRect(22,-46,5,46); O(g,1.2); g.strokeRect(22,-46,5,46);
  g.fillStyle=`rgba(255,160,50,${.6+.4*Math.sin(t*9)})`; g.beginPath(); g.moveTo(22,-46); g.lineTo(24.5,-54-Math.random()*4); g.lineTo(27,-46); g.closePath(); g.fill();
  g.strokeStyle='#6a717c'; g.lineWidth=2; g.beginPath(); g.moveTo(-4,-10); g.lineTo(0,-10); g.moveTo(18,-8); g.lineTo(22,-8); g.stroke();
});
reg('powerplant',66,60,(g,t)=>{
  g.fillStyle='#a9adb4'; g.beginPath(); g.moveTo(-28,0); g.quadraticCurveTo(-20,-24,-26,-48); g.lineTo(-6,-48); g.quadraticCurveTo(-12,-24,-4,0); g.closePath(); g.fill(); O(g); g.stroke();
  g.fillStyle=`rgba(230,230,235,${.5+.2*Math.sin(t*1.5)})`; g.beginPath(); g.arc(-16+Math.sin(t)*2,-54,8,0,pi2); g.arc(-10,-60,6,0,pi2); g.fill();
  g.fillStyle='#6f7a84'; g.fillRect(0,-26,28,26); O(g); g.strokeRect(0,-26,28,26);
  g.fillStyle='#f5d547'; g.beginPath(); g.moveTo(14,-22); g.lineTo(9,-12); g.lineTo(14,-12); g.lineTo(11,-4); g.lineTo(19,-15); g.lineTo(14,-15); g.closePath(); g.fill();
});
reg('skyscraper',50,96,(g,t)=>{
  g.fillStyle='#4f6a8a'; g.fillRect(-16,-86,32,86); O(g); g.strokeRect(-16,-86,32,86);
  g.fillStyle='#3d5470'; g.fillRect(4,-86,12,86);
  for(let y=-80;y<-4;y+=8) for(let x=-12;x<14;x+=7){ g.fillStyle=((x*7+y*3)&8)?'#9fd0ff':'#6f9cc7'; g.fillRect(x,y,4,5); }
  g.fillStyle='#8792a6'; g.fillRect(-1,-98,2,12);
  g.fillStyle=(Math.sin(t*4)>0)?'#ef5350':'#6b2a28'; g.beginPath(); g.arc(0,-98,2,0,pi2); g.fill();
});
// (fusion lives in the v8.12 LIMITED overrides above — deleted here so it isn't registered twice)
// ----- SPECIAL -----
reg('pillbox',44,30,(g,t,o)=>{
  g.fillStyle='#8a8474'; g.beginPath(); g.ellipse(0,-8,19,10,0,Math.PI,0); g.lineTo(19,0); g.lineTo(-19,0); g.closePath(); g.fill(); O(g); g.stroke();
  g.fillStyle='#1d2330'; g.fillRect(-10,-12,20,3.5);
  g.fillStyle='#2b3138'; g.fillRect(8,-12,12,2.5);
  g.fillStyle=bPal(o).body; g.fillRect(-3,-19,6,3);
});
reg('radar',44,58,(g,t,o)=>{
  g.fillStyle='#6f7a84'; g.fillRect(-14,-14,28,14); O(g); g.strokeRect(-14,-14,28,14);
  g.fillStyle='#8792a6'; g.fillRect(-2,-34,4,20);
  g.save(); g.translate(0,-38); g.scale(Math.cos(t*1.6),1);
  g.fillStyle='#d5dbe4'; g.beginPath(); g.ellipse(0,0,16,10,0,0,pi2); g.fill(); O(g,1.5); g.stroke();
  g.strokeStyle='#8792a6'; g.beginPath(); g.moveTo(0,0); g.lineTo(0,-8); g.stroke(); g.restore();
  g.fillStyle=bPal(o).body; g.fillRect(-10,-10,20,3);
});
reg('aaturret',44,42,(g,t,o)=>{
  g.fillStyle='#6f7a84'; g.fillRect(-18,-8,36,8); O(g); g.strokeRect(-18,-8,36,8);
  g.save(); g.translate(0,-10); g.rotate(-.6+Math.sin(t*.8)*.15);
  g.fillStyle=bPal(o).metal; g.fillRect(-10,-12,22,12); O(g,1.5); g.strokeRect(-10,-12,22,12);
  g.fillStyle='#e0592b'; for(let r=0;r<2;r++) for(let c=0;c<3;c++){ g.beginPath(); g.arc(14,-9+r*6+c*0,1.8,0,pi2); g.fill(); }
  g.fillStyle='#d5dbe4'; for(let c=0;c<3;c++) g.fillRect(-8+c*6,-10,4,8);
  g.restore();
});
reg('hospital',64,44,(g,t,o)=>{
  g.fillStyle='#eef1f4'; g.fillRect(-28,-30,56,30); O(g); g.strokeRect(-28,-30,56,30);
  g.fillStyle='#d5dbe4'; g.fillRect(-28,-34,56,4);
  g.fillStyle='#e53935'; g.fillRect(-4,-27,8,20); g.fillRect(-10,-21,20,8);
  g.fillStyle='#9fd0ff'; g.fillRect(-22,-24,8,6); g.fillRect(14,-24,8,6);
  g.fillStyle=`rgba(125,255,154,${.25+.2*Math.sin(t*3)})`; g.beginPath(); g.arc(0,-17,15,0,pi2); g.fill();
});
reg('cannon',68,48,(g,t,o)=>{
  g.fillStyle='#7a7466'; g.fillRect(-30,-14,60,14); O(g); g.strokeRect(-30,-14,60,14);
  g.fillStyle='#8a8474'; g.beginPath(); g.arc(-4,-14,16,Math.PI,0); g.fill(); O(g); g.stroke();
  g.save(); g.translate(-4,-22); g.rotate(-.25); g.fillStyle='#3a4149'; g.fillRect(0,-4,36,8); O(g,1.5); g.strokeRect(0,-4,36,8); g.fillRect(32,-5,5,10); g.restore();
  g.fillStyle=bPal(o).body; g.fillRect(-26,-10,10,4);
});
reg('bank',66,50,(g,t)=>{
  g.fillStyle='#e8dfc8'; g.fillRect(-28,-30,56,30); O(g); g.strokeRect(-28,-30,56,30);
  g.fillStyle='#d6cbb0'; g.beginPath(); g.moveTo(-32,-30); g.lineTo(0,-44); g.lineTo(32,-30); g.closePath(); g.fill(); O(g); g.stroke();
  g.fillStyle='#bfb394'; for(let x=-22;x<=18;x+=10) g.fillRect(x,-28,4,26);
  g.fillStyle='#ffd54f'; g.font='bold 11px sans-serif'; g.textAlign='center'; g.fillText('$',0,-33); g.textAlign='left';
  g.fillStyle='#bfb394'; g.fillRect(-30,-3,60,3);
});
reg('monument',60,80,(g,t)=>{
  g.fillStyle='#8a8474'; g.fillRect(-24,-10,48,10); O(g); g.strokeRect(-24,-10,48,10);
  g.fillStyle='#b9b3a2'; g.fillRect(-16,-16,32,6);
  g.fillStyle='#ff7043'; g.beginPath(); g.moveTo(-7,-16); g.lineTo(-4,-70); g.lineTo(0,-76); g.lineTo(4,-70); g.lineTo(7,-16); g.closePath(); g.fill(); O(g); g.stroke();
  g.fillStyle=`rgba(255,200,120,${.5+.4*Math.sin(t*2.5)})`; g.beginPath(); g.arc(0,-50,4+Math.sin(t*2.5),0,pi2); g.fill();
});
// ----- DECOR -----
reg('flowers',36,18,(g,t)=>{
  g.fillStyle='#6b5a44'; g.fillRect(-16,-6,32,6); O(g,1.2); g.strokeRect(-16,-6,32,6);
  const c=['#ef5350','#ffd54f','#ec407a','#fff','#a35ad6'];
  for(let i=0;i<7;i++){ g.fillStyle='#4f8f3a'; g.fillRect(-13+i*4.3,-10,1.4,5); g.fillStyle=c[i%5]; g.beginPath(); g.arc(-12.3+i*4.3,-11,2.4,0,pi2); g.fill(); }
});
reg('sandbags',44,18,(g,t)=>{
  g.fillStyle='#b3a988'; for(let r=0;r<2;r++) for(let i=0;i<5-r;i++){ g.beginPath(); g.ellipse(-16+i*8+r*4,-3-r*6,5,3.2,0,0,pi2); g.fill(); O(g,1); g.stroke(); }
});
reg('barrels',34,26,(g,t)=>{
  for(const [x,y,c] of [[-8,0,'#c0392b'],[6,0,'#2e7d32'],[-1,-12,'#c0392b']]){
    g.fillStyle=c; g.fillRect(x-5,y-12,10,12); O(g,1.2); g.strokeRect(x-5,y-12,10,12);
    g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(x-5,y-9,10,1.5); g.fillRect(x-5,y-4,10,1.5); }
});
reg('lamp',20,52,(g,t)=>{
  g.fillStyle='#3a4149'; g.fillRect(-1.5,-44,3,44); g.fillRect(-4,-2,8,2);
  g.fillStyle='#3a4149'; g.fillRect(-5,-48,10,5);
  g.fillStyle=`rgba(255,230,140,${.75+.2*Math.sin(t*3)})`; g.beginPath(); g.arc(0,-42,3.5,0,pi2); g.fill();
  g.fillStyle='rgba(255,230,140,.12)'; g.beginPath(); g.arc(0,-40,12,0,pi2); g.fill();
});
reg('fountain',46,30,(g,t)=>{
  g.fillStyle='#b9b3a2'; g.beginPath(); g.ellipse(0,-5,20,7,0,0,pi2); g.fill(); O(g); g.stroke();
  g.fillStyle='#4a90e2'; g.beginPath(); g.ellipse(0,-6,16,5,0,0,pi2); g.fill();
  g.fillStyle='#b9b3a2'; g.fillRect(-2.5,-18,5,12);
  g.fillStyle='rgba(160,210,255,.8)'; for(let i=0;i<5;i++){ const a=t*3+i*1.25, h=(a%1.2)/1.2; g.beginPath(); g.arc(Math.cos(i*1.26)*h*9,-18+h*h*12-h*6,1.4,0,pi2); g.fill(); }
});
reg('statue',36,56,(g,t)=>{
  g.fillStyle='#8a8474'; g.fillRect(-12,-14,24,14); O(g); g.strokeRect(-12,-14,24,14);
  g.fillStyle='#a8a08c'; g.beginPath(); g.moveTo(0,-44); g.lineTo(-16,-36); g.lineTo(-6,-32); g.lineTo(-4,-14); g.lineTo(4,-14); g.lineTo(6,-32); g.lineTo(16,-36); g.closePath(); g.fill(); O(g,1.5); g.stroke();
  g.fillStyle='#c8c0aa'; g.beginPath(); g.arc(0,-44,4,0,pi2); g.fill();
  g.fillStyle='#f5b53f'; g.fillRect(3,-45,4,2);
});

// ----- PRODUCTION LADDER (part 2: money capacity buildings) -----
reg('advsolar',60,40,(g,t)=>{                      // two banks of panels on one frame
  g.fillStyle='#5a6b52'; g.fillRect(-26,-8,3,8); g.fillRect(23,-8,3,8);
  for(const y of [-14,-30]){ g.save(); g.translate(0,y); g.rotate(-.22);
    g.fillStyle='#2f6fb8'; g.fillRect(-25,-8,50,15); O(g); g.strokeRect(-25,-8,50,15);
    g.strokeStyle='rgba(255,255,255,.4)'; g.lineWidth=1;
    g.beginPath(); g.moveTo(-8,-8); g.lineTo(-8,7); g.moveTo(8,-8); g.lineTo(8,7); g.stroke(); g.restore(); }
  g.fillStyle='#7d8794'; g.fillRect(-2,-8,4,8);
});
reg('hydro',60,46,(g,t)=>{                         // greenhouse with grow lights
  g.fillStyle='#7d8794'; g.fillRect(-28,-6,56,6); O(g); g.strokeRect(-28,-6,56,6);
  g.fillStyle='rgba(160,225,255,.55)';
  g.beginPath(); g.moveTo(-26,-6); g.lineTo(-26,-24); g.quadraticCurveTo(0,-42,26,-24); g.lineTo(26,-6); g.closePath(); g.fill(); O(g,1.4); g.stroke();
  g.fillStyle='#4f8f3a';
  for(let i=0;i<5;i++){ const x=-20+i*10; g.fillRect(x-1.5,-10,3,10); g.beginPath(); g.arc(x,-13,4.5,0,pi2); g.fill(); }
  g.fillStyle=`rgba(255,220,120,${.5+.35*Math.sin(t*3)})`; g.fillRect(-24,-30,48,3);
});
reg('gastank',56,56,(g,t)=>{                       // round storage tank + gauge
  g.fillStyle='#6f7a84'; g.fillRect(-24,-8,48,8); O(g); g.strokeRect(-24,-8,48,8);
  g.fillStyle='#c7ccd4'; g.beginPath(); g.ellipse(0,-30,24,24,0,0,pi2); g.fill(); O(g,1.6); g.stroke();
  g.fillStyle='#aeb7c4'; g.beginPath(); g.ellipse(0,-30,24,7,0,0,pi2); g.fill();
  g.fillStyle='#4a90e2'; g.beginPath(); g.arc(0,-30,11,0,pi2); g.fill(); O(g,1.2); g.stroke();
  g.fillStyle='#fff'; g.font='bold 9px sans-serif'; g.textAlign='center'; g.fillText('GAS',0,-27); g.textAlign='left';
  g.strokeStyle='#8792a6'; g.lineWidth=2; g.beginPath(); g.moveTo(14,-52); g.lineTo(14,-6); g.stroke();
  for(let i=0;i<7;i++){ g.beginPath(); g.moveTo(10,-48+i*6); g.lineTo(18,-48+i*6); g.stroke(); }
});
reg('alloy',64,52,(g,t)=>{                         // foundry: furnace + pour
  g.fillStyle='#6f6a66'; g.fillRect(-30,-30,60,30); O(g); g.strokeRect(-30,-30,60,30);
  g.fillStyle='#57524e'; g.fillRect(-30,-35,60,5);
  g.fillStyle='#8a8f96'; g.fillRect(16,-52,8,22); O(g,1.2); g.strokeRect(16,-52,8,22);
  g.fillStyle=`rgba(255,140,40,${.6+.3*Math.sin(t*5)})`; g.fillRect(-12,-18,24,12);
  g.fillStyle='#e0a32e'; g.fillRect(-6,-12,12,6);                       // molten pour
  g.fillStyle=`rgba(200,200,210,${.3+.15*Math.sin(t*2)})`; g.beginPath(); g.arc(20+Math.sin(t)*2,-58,5,0,pi2); g.fill();
  g.fillStyle='#f5b53f'; g.fillRect(-30,-32,60,3);
});
reg('offshore',66,70,(g,t)=>{                      // oil rig: legs + derrick + flame
  g.strokeStyle='#6b7484'; g.lineWidth=4;
  g.beginPath(); g.moveTo(-20,0); g.lineTo(-12,-30); g.moveTo(20,0); g.lineTo(12,-30); g.moveTo(-12,-30); g.lineTo(12,-30); g.stroke();
  g.fillStyle='#7d8794'; g.fillRect(-26,-36,52,8); O(g); g.strokeRect(-26,-36,52,8);
  g.strokeStyle='#8792a6'; g.lineWidth=2;
  g.beginPath(); g.moveTo(-14,-36); g.lineTo(-6,-64); g.lineTo(6,-64); g.lineTo(14,-36); g.moveTo(-10,-50); g.lineTo(10,-50); g.stroke();
  g.fillStyle=`rgba(255,160,50,${.6+.4*Math.sin(t*9)})`;
  g.beginPath(); g.moveTo(20,-36); g.lineTo(24,-48-Math.random()*4); g.lineTo(28,-36); g.closePath(); g.fill();
  g.fillStyle='#3f6f9e'; g.fillRect(-26,-6,52,6);
});
reg('navalbeacon',50,84,(g,t)=>{                   // lighthouse with a turning beam
  g.fillStyle='#8d9489'; g.fillRect(-14,-6,28,6); O(g); g.strokeRect(-14,-6,28,6);
  g.fillStyle='#eef1f4';
  g.beginPath(); g.moveTo(-11,-6); g.lineTo(-7,-58); g.lineTo(7,-58); g.lineTo(11,-6); g.closePath(); g.fill(); O(g,1.5); g.stroke();
  g.fillStyle='#d6493f';
  for(let i=0;i<3;i++){ const y=-12-i*16; g.beginPath(); g.moveTo(-9-i*.6,y); g.lineTo(9+i*.6,y); g.lineTo(9.6+i*.8,y-8); g.lineTo(-9.6-i*.8,y-8); g.closePath(); g.fill(); }
  g.fillStyle='#5b6470'; g.fillRect(-9,-62,18,5);
  g.save(); g.translate(0,-66); g.rotate(t*1.8);
  g.fillStyle=`rgba(255,240,150,${.55+.25*Math.sin(t*3)})`;
  g.beginPath(); g.moveTo(0,0); g.lineTo(26,-5); g.lineTo(26,5); g.closePath(); g.fill(); g.restore();
  g.fillStyle='#ffd54f'; g.beginPath(); g.arc(0,-66,5,0,pi2); g.fill();
});
reg('particle',70,50,(g,t)=>{                      // accelerator ring
  g.fillStyle='#5a646d'; g.fillRect(-32,-10,64,10); O(g); g.strokeRect(-32,-10,64,10);
  g.strokeStyle='#aeb7c4'; g.lineWidth=9; g.beginPath(); g.ellipse(0,-26,24,13,0,0,pi2); g.stroke();
  g.strokeStyle='#4aa3df'; g.lineWidth=3; g.beginPath(); g.ellipse(0,-26,24,13,0,0,pi2); g.stroke();
  const a=t*4;
  g.fillStyle='#fff2c9'; g.beginPath(); g.arc(Math.cos(a)*24,-26+Math.sin(a)*13,3.4,0,pi2); g.fill();
  g.fillStyle=`rgba(120,220,255,${.4+.4*Math.sin(t*6)})`; g.beginPath(); g.arc(0,-26,6,0,pi2); g.fill();
  g.fillStyle='#8792a6'; g.fillRect(-30,-14,6,6); g.fillRect(24,-14,6,6);
});
reg('campus',70,80,(g,t)=>{                        // glass towers + plaza
  g.fillStyle='#9aa0a6'; g.fillRect(-33,-6,66,6);
  const towers=[[-30,44],[2,64],[26,36]];
  for(const [x,h] of towers){
    g.fillStyle='#4f6a8a'; g.fillRect(x,-6-h,20,h); O(g); g.strokeRect(x,-6-h,20,h);
    for(let y=-h+2;y<-10;y+=7) for(let c=x+3;c<x+18;c+=6){ g.fillStyle=((c*7+y*3)&8)?'#9fd0ff':'#6f9cc7'; g.fillRect(c,y,4,4); }
  }
  g.fillStyle='#5f8a4a'; g.fillRect(-12,-10,24,4);
  g.fillStyle=(Math.sin(t*4)>0)?'#ef5350':'#6b2a28'; g.beginPath(); g.arc(12,-70,2,0,pi2); g.fill();
});
reg('automated',76,60,(g,t)=>{                     // robot factory: arms + solar roof
  g.fillStyle='#66725f'; g.fillRect(-36,-34,72,34); O(g); g.strokeRect(-36,-34,72,34);
  g.fillStyle='#2f6fb8';
  for(let i=0;i<4;i++){ g.save(); g.translate(-30+i*20,-38); g.rotate(-.3); g.fillRect(-8,-4,16,8); O(g,1); g.strokeRect(-8,-4,16,8); g.restore(); }
  g.fillStyle='#3a4149'; g.fillRect(-14,-20,28,20);
  g.fillStyle=`rgba(120,220,255,${.45+.35*Math.sin(t*4)})`; g.fillRect(-10,-16,20,10);
  for(let i=0;i<3;i++){                            // robot arms at work
    const a=Math.sin(t*2+i*2)*.5;
    g.strokeStyle='#e0a32e'; g.lineWidth=3;
    g.beginPath(); g.moveTo(-24+i*24,-34); g.lineTo(-24+i*24+Math.cos(a)*12,-34-Math.abs(Math.sin(a))*14); g.stroke();
  }
  g.fillStyle='#f5b53f'; g.fillRect(-36,-36,72,3);
});

// ---- v6: footprints come from the sprite — the concrete pad is exactly as wide as the model (fine 16px grid) ----
// width  = sprite width × BLD_K, rounded up to whole cells; depth ≈ half the width (it's a 2.5D view). The old coarse size is kept in cw/ch.
const BLD_K = 1.3/3;   // v8.3: buildings are drawn 3× smaller (their footprint follows the model, so ~5× more fit on an island)
for(const id of Object.keys(BUILD)){
  const d=BUILD[id], sp=SPR[id]; if(!sp) continue;
  d.cw=d.w; d.ch=d.h;
  d.w=Math.max(2,Math.ceil(sp.w*BLD_K/SLOT));
  d.h=Math.max(2,Math.ceil(sp.w*BLD_K*.5/SLOT));
}
// v8.3: WATER buildings — they go in your WATER YARD behind the island, never on the land grid
// (every dock = a building that trains a ship, plus the two offshore money makers)
for(const id of Object.keys(BUILD)){
  const d=BUILD[id];
  d.water = !!(d.unit && UNITS[d.unit] && UNITS[d.unit].sea) || id==='offshore' || id==='navalbeacon';
}
