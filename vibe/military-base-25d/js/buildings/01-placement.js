/* Military Base 2.5D — 01-placement.js · build grid: fits / free spot / place / sell */
'use strict';
// placement (only YOUR buildings block your grid — bot bases live on other islands)
function canPlaceAt(type,gx,gy){ return fitsAt(type,gx,gy,'p'); }
// does `type` fit at (gx,gy) on owner's plot? (inside the grid + no overlap with that owner's buildings)
function fitsAt(type,gx,gy,owner){
  const d=BUILD[type];
  if(gx<0||gy<0||gx+d.w>PLOT_W||gy+d.h>PLOT_H) return false;
  for(const b of S.buildings){
    if((b.owner??'p')!==owner) continue;
    const bd=BUILD[b.type];
    if(gx < b.gx+bd.w && gx+d.w > b.gx && gy < b.gy+bd.h && gy+d.h > b.gy) return false;
  }
  return true;
}
// nearest free spot to (gx,gy) for type on owner's plot (square spiral), or null
function findFreeSpot(type,gx,gy,owner){
  if(fitsAt(type,gx,gy,owner)) return {gx,gy};
  for(let r=1;r<Math.max(PLOT_W,PLOT_H);r++)
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){
      if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue;
      if(fitsAt(type,gx+dx,gy+dy,owner)) return {gx:gx+dx,gy:gy+dy};
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
function ghostSlot(){
  const d=BUILD[S.placing];
  let gx=Math.floor((mouse.wx-PLOT.x)/SLOT)-(d.w-1)/2;
  let gy=Math.floor((mouse.wy-PLOT.y)/SLOT)-(d.h-1)/2;
  gx=Math.round(gx); gy=Math.round(gy);
  return {gx:clamp(gx,0,PLOT.w-d.w), gy:clamp(gy,0,PLOT.h-d.h), ok:canPlaceAt(S.placing,gx,gy)};
}
function placeBuilding(type,gx,gy,owner='p'){
  placeBuildingRaw(type,gx,gy,owner);
  const c=bPos(S.buildings[S.buildings.length-1]);
  addParts(c.x,c.y,8,'#b0a58c');
  sfx('place');
}
function placeBuildingRaw(type,gx,gy,owner){
  const d=BUILD[type];
  S.buildings.push({id:nid(),type,gx,gy,owner,hp:d.hp,maxHp:d.hp,t:d.spawnEvery||0,flash:0,cool:0});
  if(owner==='p'&&S.stats) S.stats.placed=(S.stats.placed||0)+1;
}
function removeBuildingRefund(b){
  const d=BUILD[b.type];
  removeBuildings(x=>x===b);
  if(d.cost){ S.cash+=d.cost*.5; toast(`Sold ${d.name} for ${fmt(d.cost*.5)}$`,'#8f9aa8'); }
  sfx('click');
}
