/* Military Base 2.5D — 04-turrets.js · defence turrets (Pillbox / SAM Site / Fortress Cannon) */
'use strict';
// ---- defence turrets (Pillbox / SAM Site / Fortress Cannon) ----
function updateTurrets(dt){
  for(const b of S.buildings){
    const d=BUILD[b.type], T=d.turret; if(!T) continue;
    if(typeof b.owner==='number'&&S.bots[b.owner].down) continue;
    b.cool=(b.cool||0)-dt; if(b.cool>0) continue;
    const f=bFaction(b), c=b.x!=null?b:bPos(b);
    const eye={faction:f,x:c.x,y:c.y-30,type:null};
    let best=null,bd=T.range;
    forNearFoes(c.x,c.y,T.range,f,e=>{
      const dd=Math.hypot(e.x-c.x,e.y-c.y); if(dd>=bd) return;
      if(modVs(T,unitCls(e))===0) return;
      if(isStealth(e)&&!(e.fightT>0||dd<70||factionSees(f,e))) return;
      bd=dd; best=e;
    });
    if(!best){ b.cool=.25; continue; }
    b.cool=T.rate;
    const hit=(tgt,mult)=>{
      if(tgt.dead) return;
      if(S.admin&&S.admin.god&&tgt.side==='p') return;
      const dmg=Math.max(1,T.dmg*mult*modVs(T,unitCls(tgt))-unitArmor(tgt));
      tgt.hp-=dmg;
      if(isStealth(tgt)){ tgt.revealed=true; tgt.fightT=3; }
      if(S.settings.dmg&&f===0) addFloat(tgt.x+rnd(-6,6),tgt.y-24,String(Math.round(dmg)),'#ffd54f');
      if(tgt.hp<=0) killUnit(tgt,{side:f===0?'p':'e',faction:f});
    };
    hit(best,1);
    if(T.splash){ const bx=best.x,by=best.y,near=[]; forNearFoes(bx,by,T.splash,f,e=>{ if(e!==best&&Math.hypot(e.x-bx,e.y-by)<=T.splash&&modVs(T,unitCls(e))>0) near.push(e); }); for(const e of near) hit(e,.5); addBoom(bx,by,1); }
    tracer(eye.x,eye.y,best.x,best.y-d2(best),facC(f));
    sfx('shot');
  }
}
