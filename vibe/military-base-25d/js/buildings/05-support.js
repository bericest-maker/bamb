/* Military Base 2.5D — 05-support.js · Field Hospital healing + Radar detection support */
'use strict';
// ---- Field Hospital: heals its faction's units in range every second ----
let healT=1;
function hospitalTick(dt){
  healT-=dt; if(healT>0) return; healT=1;
  for(const b of S.buildings){
    const d=BUILD[b.type]; if(d.special!=='hospital') continue;
    const f=bFaction(b), c=b.x!=null?b:bPos(b);
    for(const u of S.units){
      if(u.faction!==f||u.boss||u.hp>=u.maxHp) continue;
      if(Math.hypot(u.x-c.x,u.y-c.y)>d.healR) continue;
      u.hp=Math.min(u.maxHp,u.hp+d.heal);
    }
  }
}
