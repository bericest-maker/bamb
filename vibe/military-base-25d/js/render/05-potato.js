/* Military Base 2.5D — 05-potato.js · POTATO MODE: one flat blob per unit / building (for slow machines) */
'use strict';
// ================= potato mode =================
// ⚙ SETTINGS → UNIT GRAPHICS / BUILDING GRAPHICS = Potato replaces every sprite with a single
// coloured "potato": one shadow ellipse + one body ellipse + a rim + an hp bar. No sprite blit,
// no per-model paths — the cheapest thing that still shows WHO owns WHAT and WHERE it is.
// A blob is POTATO.x / POTATO.y (×1.45) bigger than the model it replaces, so crowds stay readable
// when you zoom out. POTATO.squash is the view's 72% vertical squash: dividing by it makes a blob
// LOOK like a circle on screen instead of a pancake.
const POTATO = {x:1.45, y:1.45, squash:.72};
// is potato mode on? (read fresh every frame — the setting can be flipped while the game runs)
const potatoUnits = () => !!(S && S.settings && S.settings.units==='Potato');
const potatoBlds  = () => !!(S && S.settings && S.settings.blds ==='Potato');
// radius of a unit's potato, before the ×POTATO.x boost: taken from its sprite, scaled by troop size
const potatoR = u => u.boss ? 30 : Math.max(11,(SPR[u.type]?SPR[u.type].w*.45:18))*unitScale(u);
function drawPotatoUnit(u,s){
  const R=potatoR(u)*s, rx=R*POTATO.x, ry=R*POTATO.y/POTATO.squash;
  const sea=isSea(u), air=isAir(u);
  const y=u.y+(air?-(56+Math.sin(u.t*2.5)*6):0);
  const hidden=isStealth(u)&&!u.revealed&&u.faction!==0;
  ctx.globalAlpha=hidden?.18:1;
  // shadow (ships get the blue water shadow, planes a faint one)
  ctx.fillStyle=sea?'rgba(20,70,120,.30)':(air?'rgba(0,0,0,.12)':'rgba(0,0,0,.25)');
  ctx.beginPath(); ctx.ellipse(u.x,u.y+2,rx*.62,ry*.3,0,0,pi2); ctx.fill();
  // body: one blob in the owner's colour
  const c=facC(u.faction), cy=y-ry*.7;
  ctx.fillStyle=c;
  ctx.beginPath(); ctx.ellipse(u.x,cy,rx,ry,0,0,pi2); ctx.fill();
  ctx.strokeStyle='rgba(18,24,32,.55)'; ctx.lineWidth=Math.max(1,1.8*s); ctx.stroke();
  // a highlight so it reads as a body instead of a flat disc
  ctx.fillStyle='rgba(255,255,255,.20)';
  ctx.beginPath(); ctx.ellipse(u.x,cy-ry*.42,rx*.5,ry*.4,0,0,pi2); ctx.fill();
  ctx.globalAlpha=1;
  // hp bar (faction colour) — same place as the normal renderer
  if(u.hp<u.maxHp){
    const w=rx*1.9, hy=cy-ry-8;
    ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(u.x-w/2,hy,w,3.5);
    ctx.fillStyle=c; ctx.fillRect(u.x-w/2,hy,w*clamp01(u.hp/u.maxHp),3.5);
  }
}
// a building's potato: a wide dome in the owner's colour sitting on its pad (bw/bh = the model's size)
function drawPotatoBuilding(bw,bh,s,fac,wx,wy){
  const c=facC(fac);
  const rx=bw*.5*POTATO.x*s, ry=Math.max(rx*.62, bh*.34*s)/POTATO.squash;
  const cy=wy-ry*.92;
  ctx.fillStyle=shade(c,.62);
  ctx.beginPath(); ctx.ellipse(wx,cy,rx,ry,0,0,pi2); ctx.fill();
  ctx.strokeStyle=shade(c,.35); ctx.lineWidth=Math.max(1,1.6*s); ctx.stroke();
  ctx.fillStyle=shade(c,1.25);                                   // lighter cap
  ctx.beginPath(); ctx.ellipse(wx,cy-ry*.44,rx*.6,ry*.42,0,0,pi2); ctx.fill();
  ctx.fillStyle=hexA(c,.9);                                      // faction stripe → owner at a glance
  ctx.fillRect(wx-rx*.7,cy+ry*.12,rx*1.4,Math.max(2,ry*.16));
}
