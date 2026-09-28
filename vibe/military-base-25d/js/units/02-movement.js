/* Military Base 2.5D — 02-movement.js · movement: A* (cached per cell), the city flow field, straight-line steering */
'use strict';
// movement: air flies straight over water; land pathfinds (A*) or follows the city flow field
// v5 perf: units in the same walk cell heading for the same target cell share one A* result for ~1.5s
let PATH_CACHE=new Map(), PATH_CACHE_T=0;
function astarShared(x,y,tx,ty,tcx,tcy){
  if(!UPDATING) return astar(x,y,tx,ty);
  if(S.time-PATH_CACHE_T>1.5||S.time<PATH_CACHE_T){ PATH_CACHE=new Map(); PATH_CACHE_T=S.time; }
  const [sx,sy]=cellOf(x,y), k=((sy*GW+sx)*GW+tcx)*GH+tcy;
  let p=PATH_CACHE.get(k);
  if(p===undefined){ p=astar(x,y,tx,ty); PATH_CACHE.set(k,p); } else ASTAR_BUDGET++;   // cache hits are free
  return p;
}
// ---- ships: they sail the water (maps/02-sea.js) and shell the shore from the closest water ----
let SEA_PATH_CACHE=new Map(), SEA_CACHE_T=0;
function seaAstarShared(x,y,tx,ty,tcx,tcy){
  if(!UPDATING) return seaAstar(x,y,tx,ty);
  if(S.time-SEA_CACHE_T>2||S.time<SEA_CACHE_T){ SEA_PATH_CACHE=new Map(); SEA_CACHE_T=S.time; }
  const [sx,sy]=cellOf(x,y), k=((sy*GW+sx)*GW+tcx)*GH+tcy;
  let p=SEA_PATH_CACHE.get(k);
  if(p===undefined){ p=seaAstar(x,y,tx,ty); SEA_PATH_CACHE.set(k,p); } else ASTAR_BUDGET++;
  return p;
}
function stepSeaUnit(u,tx,ty,sp,dt){
  const [cx,cy]=cellOf(u.x,u.y);
  if(!SEA[cy*GW+cx]){                                  // launched on land / beached → back to the water
    if(!u._seaExit||dist(u,u._seaExit)<CELL) u._seaExit=nearestSea(u.x,u.y);
    if(u._seaExit){ moveToward(u,u._seaExit.x,u._seaExit.y,sp,dt); return; }
    moveToward(u,tx,ty,sp*.5,dt); return;
  }
  u._seaExit=null;
  const goal=coastGoal(tx,ty);                          // land targets: fire from the nearest water
  if(dist(u,{x:goal.x,y:goal.y})<220){ u.path=null; moveToward(u,goal.x,goal.y,sp,dt); return; }
  const [tcx,tcy]=cellOf(goal.x,goal.y);
  u.repath-=dt;
  if(!u.path||u.repath<=0||u._tcx!==tcx||u._tcy!==tcy){
    if(ASTAR_BUDGET>0){
      ASTAR_BUDGET--;
      const p=seaAstarShared(u.x,u.y,goal.x,goal.y,tcx,tcy);
      if(p&&p.length){ u.path=p; u.wp=0; u.repath=1.6+Math.random()*.6; u._tcx=tcx; u._tcy=tcy; }
      else { moveToward(u,goal.x,goal.y,sp*.5,dt); return; }
    } else if(!u.path){ moveToward(u,goal.x,goal.y,sp*.5,dt); return; }
  }
  while(u.path&&u.wp<u.path.length){
    const w=u.path[u.wp];
    if(dist(u,w)<CELL*.7){ u.wp++; continue; }
    moveToward(u,w.x,w.y,sp,dt); return;
  }
  moveToward(u,goal.x,goal.y,sp,dt);
}
function stepUnit(u,tx,ty,sp,dt){
  if(isSea(u)){ stepSeaUnit(u,tx,ty,sp,dt); return; }
  const dd=dist(u,{x:tx,y:ty});
  if(isAir(u)||dd<240){ u.path=null; moveToward(u,tx,ty,sp,dt); return; }
  if(u.cityGoal){
    const f=flowStep(u.x,u.y);
    if(f){ u.path=null; moveToward(u,f.x,f.y,sp,dt); return; }
    u.cityGoal=false;
  }
  u.repath-=dt;
  const [tcx,tcy]=cellOf(tx,ty);
  if((!u.path||u.repath<=0||u._tcx!==tcx||u._tcy!==tcy) && ASTAR_BUDGET>0){
    ASTAR_BUDGET--;                         // v5 perf: at most ~24 A* searches per frame; the rest keep their old path a bit longer
    const p=astarShared(u.x,u.y,tx,ty,tcx,tcy);
    if(p&&p.length){ u.path=p; u.wp=0; u.repath=1.1+Math.random()*.5; u._tcx=tcx; u._tcy=tcy; }
    else if(!u.path){ moveToward(u,tx,ty,sp*.4,dt); return; }
  } else if(!u.path){ u.repath=0; return; }   // no path yet and no budget → wait a frame
  while(u.path&&u.wp<u.path.length){
    const w=u.path[u.wp];
    if(dist(u,w)<CELL*.7){ u.wp++; continue; }
    moveToward(u,w.x,w.y,sp,dt);
    return;
  }
  moveToward(u,tx,ty,sp,dt);
}
// tiny helpers to keep tracer coords sane
const d2 = u=> unitTop(u)*.55;   // aim roughly at the body (fixed: used to depend on the unit NAME length)

function moveToward(u,tx,ty,sp,dt){
  const dd=dist(u,{x:tx,y:ty});
  if(dd<1) return;
  u.x+=(tx-u.x)/dd*sp*dt;
  u.y+=(ty-u.y)/dd*sp*dt;
}
