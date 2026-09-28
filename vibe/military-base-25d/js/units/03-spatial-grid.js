/* Military Base 2.5D — 03-spatial-grid.js · spatial hash + batched removals (v5 perf) and shared bot threat scans */
'use strict';
// Outside update() (tests, admin) UGRID_ON is false and every search falls back to a full scan, so results are always exact.
let SEP_TICK=0;
const GRID_C=160; let UGRID=new Map(), UGRID_ON=false, UPDATING=false, NEED_COMPACT=false, ASTAR_BUDGET=1e9;
function buildUnitGrid(){
  UGRID=new Map();
  for(const u of S.units){ if(u.dead) continue; const k=Math.floor(u.x/GRID_C)*4096+Math.floor(u.y/GRID_C); let a=UGRID.get(k); if(!a){ UGRID.set(k,a=[]); a.m=0; } a.push(u); a.m|=1<<(u.faction&31); }   // a.m = bitmask of factions in the cell
  UGRID_ON=true;
}
function forNear(x,y,r,fn){   // calls fn(unit) for every live unit that MAY be within r of (x,y) (caller does the exact distance test)
  if(!UGRID_ON){ for(const e of S.units) if(!e.dead) fn(e); return; }
  const x0=Math.floor((x-r)/GRID_C), x1=Math.floor((x+r)/GRID_C), y0=Math.floor((y-r)/GRID_C), y1=Math.floor((y+r)/GRID_C);
  for(let cx=x0;cx<=x1;cx++) for(let cy=y0;cy<=y1;cy++){ const a=UGRID.get(cx*4096+cy); if(a) for(const e of a) if(!e.dead) fn(e); }
}
// same, but only visits cells that contain at least one unit NOT of faction fac (friendly-only crowds are skipped outright)
function forNearFoes(x,y,r,fac,fn){
  if(!UGRID_ON){ for(const e of S.units) if(!e.dead&&e.faction!==fac) fn(e); return; }
  const own=1<<(fac&31);
  const x0=Math.floor((x-r)/GRID_C), x1=Math.floor((x+r)/GRID_C), y0=Math.floor((y-r)/GRID_C), y1=Math.floor((y+r)/GRID_C);
  for(let cx=x0;cx<=x1;cx++) for(let cy=y0;cy<=y1;cy++){ const a=UGRID.get(cx*4096+cy); if(!a||!(a.m&~own)) continue; for(const e of a) if(!e.dead&&e.faction!==fac) fn(e); }
}
// remove units / buildings matching pred — flags them dead first so cached targets drop them immediately
function removeUnits(pred){ for(const u of S.units) if(pred(u)) u.dead=true; S.units=S.units.filter(u=>!u.dead); }
function removeBuildings(pred){ for(const b of S.buildings) if(pred(b)) b.dead=true; S.buildings=S.buildings.filter(b=>!b.dead); }
function compactUnits(){ if(NEED_COMPACT){ S.units=S.units.filter(u=>!u.dead); NEED_COMPACT=false; } }

// v8.3: the unit under a world point (hover tooltip). Reads the spatial hash directly, so the cost is
// "the few cells around the cursor" instead of "every unit on the map" — hovering stays free in a 1000-unit battle.
function unitAt(x,y,r){
  let best=null, bd=r*r;
  if(UGRID.size){
    const R=Math.ceil(r/GRID_C), gx=Math.floor(x/GRID_C), gy=Math.floor(y/GRID_C);
    for(let cx=gx-R;cx<=gx+R;cx++) for(let cy=gy-R;cy<=gy+R;cy++){
      const a=UGRID.get(cx*4096+cy); if(!a) continue;
      for(const e of a){ if(e.dead) continue; const dx=e.x-x, dy=e.y-y, d2=dx*dx+dy*dy; if(d2<bd){bd=d2;best=e;} }
    }
    return best;
  }
  for(const e of S.units){ if(e.dead) continue; const dx=e.x-x, dy=e.y-y, d2=dx*dx+dy*dy; if(d2<bd){bd=d2;best=e;} }
  return best;
}
// nearest foreign unit within 700 of a bot's base — shared by all its defenders, refreshed ≤ 4×/s (v5 perf)
const BOT_THREAT={};
function botThreat(i,bc,fac){
  const c=BOT_THREAT[i], now=S.time;
  if(c&&UGRID_ON&&now-c.t<.25&&now>=c.t&&!(c.threat&&c.threat.dead)) return c;
  let threat=null,td=1e9;
  forNearFoes(bc.x,bc.y,700,fac,p=>{
    const dd=Math.hypot(p.x-bc.x,p.y-bc.y);
    if(dd<td){td=dd;threat=p;}
  });
  return BOT_THREAT[i]={t:now,threat,td};
}
