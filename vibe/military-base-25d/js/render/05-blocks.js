/* Military Base 2.5D — 05-blocks.js · BLOCK MODE: one plain rectangle per unit / building (for slow machines) */
'use strict';
// ================= block mode =================
// ⚙ SETTINGS → UNIT GRAPHICS / BUILDING GRAPHICS = Blocks replaces every sprite with a single plain
// rectangle filled with the owner's colour — nothing else: no shadow, no outline, no highlight.
// Sizes are EXACT: a troop's block is its sprite's box (SPR[type].w × .h), a building's block is its
// footprint (d.w × d.h cells), so what you see is really how much room it takes.
const blockUnits = () => !!(S && S.settings && S.settings.units==='Blocks');
const blockBlds  = () => !!(S && S.settings && S.settings.blds ==='Blocks');
// one rectangle per troop: width/height = the sprite's own box, bottom edge on the unit's feet
function drawBlockUnit(u,s){
  const sp=SPR[u.type];
  const w=(sp?sp.w:44)*s, h=(sp?sp.h:36)*s;                 // the boss has no sprite → a fixed block
  const air=isAir(u);
  const y=u.y+(air?-(56+Math.sin(u.t*2.5)*6):0);            // planes hover, same as their sprite
  const hidden=isStealth(u)&&!u.revealed&&u.faction!==0;
  const c=facC(u.faction);
  ctx.globalAlpha=hidden?.18:1;
  ctx.fillStyle=c;
  ctx.fillRect(u.x-w/2,y-h,w,h);
  ctx.globalAlpha=1;
  // hp bar (faction colour) — the only extra, and only while it is actually hurt
  if(u.hp<u.maxHp){
    const hy=y-h-8;
    ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(u.x-w/2,hy,w,3.5);
    ctx.fillStyle=c; ctx.fillRect(u.x-w/2,hy,w*clamp01(u.hp/u.maxHp),3.5);
  }
}
// one rectangle per building: its real footprint, in the owner's colour
function drawBlockBuilding(own,gx,gy,fw,fh,fac){
  plotRectPath(own,gx*SLOT+1,gy*SLOT+1,fw-2,fh-2);
  ctx.fillStyle=facC(fac); ctx.fill();
}
