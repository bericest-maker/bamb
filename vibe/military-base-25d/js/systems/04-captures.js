/* Military Base 2.5D — 04-captures.js · capture points: faction majority, garrison respawns */
'use strict';
function pointFaction(p){ return p.owner==='player'?0:(p.owner==='enemy'?(p.faction??1):-1); }
// capture check — the faction with the most troops at a point holds it
let capTimer=0;
// capture-point garrison upkeep: the owner's troops are replaced one at a time
function pointRespawnTick(dt){
  for(const p of S.points){
    p.cool=Math.max(0,(p.cool||0)-dt);
    if(p.owner==='neutral') continue;
    if(S.admin&&S.admin.noRespawn) continue;
    p.respawnT-=dt;
    if(p.respawnT<=0){
      if(garrisonCount(p.id)<p.garrison+p.tank) spawnGarrison(p.id,1);
      p.respawnT=p.city?15:22;
    }
  }
}
function checkCaptures(dt){
  capTimer-=dt;
  if(capTimer>0) return;
  capTimer=.25;
  for(const p of S.points){
    if((p.cool||0)>0) continue;
    const counts={};
    for(const u of S.units){
      if(Math.hypot(u.x-p.x,u.y-p.y)>p.r) continue;
      counts[u.faction]=(counts[u.faction]||0)+1;
    }
    let bestF=-1,bestN=0;
    for(const f in counts) if(counts[f]>bestN){ bestN=counts[f]; bestF=+f; }
    if(bestN<1) continue;
    const curF=pointFaction(p);
    if(bestF===curF) continue;
    const curN=curF>=0?(counts[curF]||0):0;
    if(bestN>curN){
      p.owner=bestF===0?'player':'enemy';
      p.faction=bestF;
      p.cool=6; p.respawnT=p.city?15:22;
      removeUnits(u=>u.home===p.id&&u.faction!==bestF);
      if(bestF===0&&curF!==-1) S.stats.captures++;
      const col=facC(bestF);
      toast(`${bestF===0?'🚩 YOU captured':'🚩 '+facN(bestF)+' captured'} ${p.name}!${p.city?' (+20% income)':''}`,col);
      addParts(p.x,p.y,20,col);
      sfx('capture');
      spawnGarrison(p.id,p.garrison+p.tank);
      if(bestF===0&&p.city) S.attackCity=false;
    }
  }
}
