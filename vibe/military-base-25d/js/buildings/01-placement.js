/* Military Base 2.5D — 01-placement.js · build grid: fits / free spot / place / sell */
'use strict';
// placement (only YOUR buildings block your grid — bot bases live on other islands)
// v8.3: zone = 'land' (your island) or 'water' (your water yard behind it). Water buildings only fit
// in the yard, land buildings only on the island, and the two zones never collide with each other.
function canPlaceAt(type,gx,gy,zone){ return fitsAt(type,gx,gy,'p',zone); }
// does `type` fit at (gx,gy) in owner's zone? (inside that grid + no overlap with that owner's buildings there)
function fitsAt(type,gx,gy,owner,zone){
  const d=BUILD[type], o=plotOrigin(owner,zone);
  if(!o) return false;
  if(!!d.water !== (zone==='water')) return false;         // ships' docks belong in the water, factories don't
  if(gx<0||gy<0||gx+d.w>o.w||gy+d.h>o.h) return false;
  for(const b of S.buildings){
    if((b.owner??'p')!==owner) continue;
    if((b.zone||'land')!==(zone||'land')) continue;
    const bd=BUILD[b.type];
    if(gx < b.gx+bd.w && gx+d.w > b.gx && gy < b.gy+bd.h && gy+d.h > b.gy) return false;
  }
  return true;
}
// nearest free spot to (gx,gy) for type in owner's zone (square spiral), or null
function findFreeSpot(type,gx,gy,owner,zone){
  if(fitsAt(type,gx,gy,owner,zone)) return {gx,gy};
  const o=plotOrigin(owner,zone); if(!o) return null;
  for(let r=1;r<Math.max(o.w,o.h);r++)
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){
      if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue;
      if(fitsAt(type,gx+dx,gy+dy,owner,zone)) return {gx:gx+dx,gy:gy+dy};
    }
  return null;
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
  return {gx,gy,zone,ok:fitsAt(S.placing,gx,gy,'p',zone)};
}
// v8.3: hand a building to the cursor. Water items pan to your water yard so you can see where they go.
function startPlacing(type){
  S.placing=type;
  if(BUILD[type]&&BUILD[type].water){ const Y=WATER_YARD; cam.tx=Y.x+Y.w*SLOT/2; cam.ty=Y.y+Y.h*SLOT/2; }
  else { const pc=plotCentre(); cam.tx=pc.x; cam.ty=pc.y; }
}
function placeBuilding(type,gx,gy,owner='p',zone){
  placeBuildingRaw(type,gx,gy,owner,zone);
  const c=bPos(S.buildings[S.buildings.length-1]);
  addParts(c.x,c.y,8,'#b0a58c');
  sfx('place');
}
function placeBuildingRaw(type,gx,gy,owner,zone){
  const d=BUILD[type];
  S.buildings.push({id:nid(),type,gx,gy,owner,hp:d.hp,maxHp:d.hp,t:d.spawnEvery||0,flash:0,cool:0,...(zone==='water'?{zone}:{})});
  if(owner==='p'&&S.stats) S.stats.placed=(S.stats.placed||0)+1;
}
function removeBuildingRefund(b){
  const d=BUILD[b.type];
  removeBuildings(x=>x===b);
  if(d.cost){ S.cash+=d.cost*.5; toast(`Sold ${d.name} for ${fmt(d.cost*.5)}$`,'#8f9aa8'); }
  sfx('click');
}
