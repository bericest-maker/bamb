/* Military Base 2.5D — 01-spawn.js · unit factory (mkUnit) + capture-point garrisons */
'use strict';
// points & garrison
function garrisonCount(i){
  return S.units.filter(u=>u.home===i).length;
}
function spawnGarrison(i,n=1){
  const p=S.points[i];
  const f=pointFaction(p);
  if(f<0) return 0; // neutral points have no garrison
  const cap=p.garrison+p.tank;
  let made=0;
  for(let k=0;k<n;k++){
    if(garrisonCount(i)>=cap) break;
    const isTank = p.city && Math.random()<.4;
    const a=rnd(0,pi2), rr=rnd(p.r*.4,p.r*.8);
    S.units.push(mkUnit(isTank?'tank':'rifle', f===0?'p':'e', p.x+Math.cos(a)*rr,p.y+Math.sin(a)*rr,{home:i,faction:f}));
    made++;
  }
  return made;
}
function mkUnit(type,side,x,y,ex={}){
  const d=UNITS[type];
  const faction = ex.faction!=null?ex.faction:(side==='p'?0:1);
  return {id:nid(),type,side,faction,x,y,hp:d.hp,maxHp:d.hp,cool:rnd(.2,1),t:0,
    order:null,home:ex.home??null,bot:ex.bot??null,raid:!!ex.raid,boss:!!ex.boss,wd:ex.wd??null,
    stealth:d.cls.includes('stealth'),revealed:false,fightT:0,cityGoal:!!ex.cityGoal,
    path:null,wp:0,repath:0,_tcx:-1,_tcy:-1,
    tx:ex.tx??x,ty:ex.ty??y,hist:ex.hist||[]};
}
