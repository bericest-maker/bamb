/* Military Base 2.5D — 01-placement.js · build grid: fits / free spot / place / sell */
'use strict';
// placement (only YOUR buildings block your grid — bot bases live on other islands)
// v8.3: zone = 'land' (your island) or 'water' (your water yard behind it). Water buildings only fit
// in the yard, land buildings only on the island, and the two zones never collide with each other.
// v8.4: STACKING — buildings can sit ON TOP of each other, as high as you like.
// level 0 = the ground, level n = n buildings underneath it. Two buildings only collide when they
// are on the SAME level, and a new one lands on top of the tallest pile its footprint touches.
function stackTopAt(type,gx,gy,owner,zone){
  const d=BUILD[type]; let top=0;
  for(const b of S.buildings){
    if((b.owner??'p')!==owner) continue;
    if((b.zone||'land')!==(zone||'land')) continue;
    const bd=BUILD[b.type];
    if(gx < b.gx+bd.w && gx+d.w > b.gx && gy < b.gy+bd.h && gy+d.h > b.gy) top=Math.max(top,(b.lvl|0)+1);
  }
  return top;
}
function canPlaceAt(type,gx,gy,zone){ const L=stackTopAt(type,gx,gy,'p',zone); return fitsAt(type,gx,gy,'p',zone,L); }
// does `type` fit at (gx,gy) in owner's zone on stack level `lvl`? (inside that grid + no overlap with that owner's buildings on that level)
function fitsAt(type,gx,gy,owner,zone,lvl){
  const d=BUILD[type], o=plotOrigin(owner,zone);
  if(!o) return false;
  if(!!d.water !== (zone==='water')) return false;         // ships' docks belong in the water, factories don't
  if(gx<0||gy<0||gx+d.w>o.w||gy+d.h>o.h) return false;
  const L=lvl|0;
  for(const b of S.buildings){
    if((b.owner??'p')!==owner) continue;
    if((b.zone||'land')!==(zone||'land')) continue;
    if((b.lvl|0)!==L) continue;                            // a different level = a different floor of the pile
    const bd=BUILD[b.type];
    if(gx < b.gx+bd.w && gx+d.w > b.gx && gy < b.gy+bd.h && gy+d.h > b.gy) return false;
  }
  return true;
}
// nearest free spot to (gx,gy) for type in owner's zone (square spiral), or null — returns {gx,gy,lvl}.
// GROUND FLOOR FIRST: bot bases and admin fills stay spread out; it only climbs on top of a pile when
// there is no free ground left. (Aiming at a pile with the cursor still stacks — see ghostSlot.)
function findFreeSpot(type,gx,gy,owner,zone){
  const o=plotOrigin(owner,zone); if(!o) return null;
  let stack=null;
  for(let r=0;r<Math.max(o.w,o.h);r++)
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){
      if(r&&Math.max(Math.abs(dx),Math.abs(dy))!==r) continue;
      const x=gx+dx, y=gy+dy, L=stackTopAt(type,x,y,owner,zone);
      if(L===0&&fitsAt(type,x,y,owner,zone,0)) return {gx:x,gy:y,lvl:0};
      if(!stack&&L>0&&fitsAt(type,x,y,owner,zone,L)) stack={gx:x,gy:y,lvl:L};
    }
  return stack;
}
// shop/placement rules beyond space: power requirement, rebirth requirement, max placed
function buyBlock(type){
  const d=BUILD[type];
  if(d.req && (S._power||0)<d.req) return `Requires ${fmt(d.req)} military power`;
  if(d.reqRebirth && S.rebirth<d.reqRebirth) return `Requires ${d.reqRebirth} rebirth`;
  if(d.max && d.special==='bank' && countMine(x=>x===d)>=d.max) return `Max ${d.max} ${d.name}s`;
  return null;
}
// v8.3: the ghost follows your cursor on the island — or on the WATER YARD when the item is a water building
function ghostSlot(){
  const d=BUILD[S.placing];
  if(!d.water&&inYard(mouse.wx,mouse.wy)) return {gx:0,gy:0,zone:'land',ok:false,why:'That is your WATER YARD — only ⚓ water buildings go there'};
  const zone=d.water?'water':'land', o=d.water?WATER_YARD:PLOT;
  let gx=Math.floor((mouse.wx-o.x)/SLOT)-(d.w-1)/2;
  let gy=Math.floor((mouse.wy-o.y)/SLOT)-(d.h-1)/2;
  gx=clamp(Math.round(gx),0,o.w-d.w); gy=clamp(Math.round(gy),0,o.h-d.h);
  const lvl=stackTopAt(S.placing,gx,gy,'p',zone);          // v8.4: it lands on top of the pile it touches
  return {gx,gy,zone,lvl,ok:fitsAt(S.placing,gx,gy,'p',zone,lvl)};
}
// v8.3: hand a building to the cursor. Water items pan to your water yard so you can see where they go.
function startPlacing(type){
  S.placing=type;
  if(BUILD[type]&&BUILD[type].water){ const Y=WATER_YARD; cam.tx=Y.x+Y.w*SLOT/2; cam.ty=Y.y+Y.h*SLOT/2; }
  else { const pc=plotCentre(); cam.tx=pc.x; cam.ty=pc.y; }
}
function placeBuilding(type,gx,gy,owner='p',zone,lvl){
  placeBuildingRaw(type,gx,gy,owner,zone,lvl);
  const c=bPos(S.buildings[S.buildings.length-1]);
  addParts(c.x,c.y,8,'#b0a58c');
  sfx('place');
}
// v8.4: `lvl` = the floor of the pile this building sits on (0 = the ground). Every level works on its own.
function placeBuildingRaw(type,gx,gy,owner,zone,lvl){
  const d=BUILD[type], L=lvl|0;
  S.buildings.push({id:nid(),type,gx,gy,owner,hp:d.hp,maxHp:d.hp,t:d.spawnEvery||0,flash:0,cool:0,
    ...(zone==='water'?{zone}:{}), ...(L?{lvl:L}:{})});
  if(owner==='p'&&S.stats) S.stats.placed=(S.stats.placed||0)+1;
}
function removeBuildingRefund(b){
  const d=BUILD[b.type];
  removeBuildings(x=>x===b);
  if(d.cost){ S.cash+=d.cost*.5; toast(`Sold ${d.name} for ${fmt(d.cost*.5)}$`,'#8f9aa8'); }
  sfx('click');
}
