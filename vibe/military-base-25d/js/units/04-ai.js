/* Military Base 2.5D — 04-ai.js · unit AI: targets, stealth detection, target acquisition, combat, separation */
'use strict';
const bFaction = b => (b.owner??"p")==="p"?0:b.owner+1;
// ---- v8: how close is "close"? ----
// Units used to lock onto everything inside their firing range (artillery shelled your base from 430px
// away). Now: while a unit is MARCHING (an order, the push to the middle, a raid) it only looks at enemies
// that are basically on top of it. Units that HOLD a spot — garrisons, base defenders, a hold order,
// idle troops — keep the full reach, so a defended position still shoots first.
const AGGRO = {march:210, hold:220, push:60};
// how far a unit will look for a fight (see AGGRO above)
function aggroReach(d,tg){
  const holding = !!(tg&&(tg.defend||tg.hold));
  return holding ? d.range+AGGRO.hold : Math.min(d.range+AGGRO.push, AGGRO.march);
}
function targetFor(u){
  if(u.boss){
    // boss: nearest enemy base building (any other faction)
    let best=null,bd=1e9;
    for(const b of S.buildings){
      if(bFaction(b)===u.faction) continue;
      const c=bPos(b);
      const dd=Math.hypot(c.x-u.x,c.y-u.y);
      if(dd<bd){bd=dd;best={x:c.x,y:c.y,b};}
    }
    if(!best) best={x:CITY_ISL.x,y:CITY_ISL.y};
    best.defend=true;                                  // v8.5: the worm fights everything it reaches
    return best;
  }
  if(u.side==='e'){
    if(u.bot!=null){
      // BOT unit: DEFAULT = march on the CITY (the middle). Enemies en route are handled by findEnemyOf.
      if(u.order){
        if(u.order.point!==undefined){
          const p=S.points[u.order.point];
          return {x:p.x,y:p.y,point:p,defend:true};
        }
        if(u.order.bid){
          const b=S.buildings.find(x=>x.id===u.order.bid);
          if(b){ const c=bPos(b); return {x:c.x,y:c.y,b}; }
          u.order.bid=null;
        }
        return {x:u.order.x,y:u.order.y,hold:true};
      }
      // no order = defender: hold base, chase visible threats near home
      const bc=botCenter(u.bot);
      const {threat,td}=botThreat(u.bot,bc,u.faction);
      if(threat&&td<700&&canSee(u,threat)) return {x:threat.x,y:threat.y};
      return {x:bc.x+(((u.id%7)-3)*70), y:bc.y+(((u.id%5)-2)*55), hold:true};
    }
    if(u.home!==null){
      const p=S.points[u.home];
      return {x:p.x,y:p.y,point:p,defend:true};
    }
    // wave raider
    if(u.raid){
      if(u.order&&u.order.point!==undefined){
        const p=S.points[u.order.point];
        return {x:p.x,y:p.y,point:p};
      }
      let best=null,bd=1e9;
      for(const b of S.buildings){
        if(bFaction(b)===u.faction) continue;
        const c=bPos(b);
        const dd=Math.hypot(c.x-u.x,c.y-u.y);
        if(dd<bd){bd=dd;best={x:c.x,y:c.y,b};}
      }
      if(best) return best;
      u.raid=false;
    }
    return {x:u.x,y:u.y,hold:true};   // v8: idle raider holds its ground (full reach) instead of freezing
  }
  // player (faction 0)
  if(u.order){
    if(u.order.bid){
      const b=S.buildings.find(x=>x.id===u.order.bid);
      if(b){ const c=bPos(b); return {x:c.x,y:c.y,b}; }
      u.order.bid=null;
    }
    return {x:u.order.x,y:u.order.y,hold:true};
  }
  if(u.home!==null){
    const p=S.points[u.home];
    return {x:p.x,y:p.y,point:p,defend:true};
  }
  if(u.wd!=null){                                   // wave-defense garrison: hold the line at its building
    const b=S.buildings.find(x=>x.id===u.wd);
    if(b){ const c=bPos(b); return {x:c.x+(((u.id%7)-3)*46), y:c.y+(((u.id%5)-2)*34), hold:true, defend:true}; }
    u.wd=null;                                      // its building is gone → become a normal unit
  }
  if(S.attackCity){
    const city=S.points[CITY_IDX];
    if(pointFaction(city)!==0) return {x:city.x,y:city.y,point:city,mid:true};
    S.attackCity=false;
  }
  // v8: NO ORDER = march on the MIDDLE (the CITY). idle:true/mid targets only fight what comes CLOSE
  // (aggroReach), so your army streams to the centre instead of shooting up somebody's spawn.
  if(!isSea(u)){                                     // ships can't walk onto an island → they shell buildings
    const city=S.points[CITY_IDX];
    if(pointFaction(city)!==0) return {x:city.x,y:city.y,point:city,mid:true};
    let best=null,bd=1e9,nbest=null,nbd=1e9;         // city held → nearest point you don't own (enemy first)
    for(const p of S.points){
      if(pointFaction(p)===0) continue;
      const dd=Math.hypot(p.x-u.x,p.y-u.y);
      if(pointFaction(p)<0){ if(dd<nbd){nbd=dd;nbest=p;} continue; }
      if(dd<bd){bd=dd;best=p;}
    }
    if(best)  return {x:best.x, y:best.y, point:best, mid:true};
    if(nbest) return {x:nbest.x,y:nbest.y,point:nbest,mid:true};
  }
  // no enemy points → nearest enemy building
  let bb=null,bbd=1e9;
  for(const b of S.buildings){
    if(bFaction(b)===0) continue;
    const c=bPos(b);
    const dd=Math.hypot(c.x-u.x,c.y-u.y);
    if(dd<bbd){bbd=dd;bb={x:c.x,y:c.y,b};}
  }
  if(bb) return bb;
  const pc=plotCentre();   // fixed: was PLOT.w*50 (wrong slot size → off-centre)
  return {x:pc.x,y:pc.y,hold:true};
}
// ---- detection: each faction's sensors (units with `detect`, Radar Stations) — rebuilt 4×/s ----
let DETECT={}, detT=0, AURA={};   // AURA = support buffs (Officer: +25% damage to allies in radius)
function refreshDetectors(dt){
  detT-=dt; if(detT>0) return; detT=.25;
  DETECT={}; AURA={};
  const add=(f,x,y,r)=>(DETECT[f]=DETECT[f]||[]).push({x,y,r});
  for(const u of S.units){
    const r=unitDetect(u); if(r>0) add(u.faction,u.x,u.y,r);
    const bf=unitDef(u).buff;                       // Officer (and any future support unit)
    if(bf) (AURA[u.faction]=AURA[u.faction]||[]).push({x:u.x,y:u.y,r:bf.r,mult:bf.dmg});
  }
  for(const b of S.buildings){ const d=BUILD[b.type]; if(d.detect) add(bFaction(b),b.x??bPos(b).x,b.y,d.detect); }
  // reveal flag (for drawing): stealth units are shown when ANY other faction detects them
  for(const u of S.units){
    if(!isStealth(u)) continue;
    u.revealed = u.fightT>0 || Object.keys(DETECT).some(f=>+f!==u.faction && factionSees(+f,u));
  }
}
function factionSees(f,b){
  for(const s of DETECT[f]||[]) if(Math.hypot(b.x-s.x,b.y-s.y)<=s.r) return true;
  return false;
}
// stealth visibility: can a see b?
function canSee(a,b){
  if(!isStealth(b)) return true;
  if(b.fightT>0) return true;              // in combat → revealed
  const dd=Math.hypot(b.x-a.x,b.y-a.y);
  if(dd<70) return true;                    // point blank
  const det=unitDetect(a);
  if(det>0 && dd<=det) return true;         // own sensor
  return factionSees(a.faction,b);          // shared: allied detectors + radar
}
// nearest enemy the unit can SEE and actually HURT (mod 0 → ignored, e.g. Flak ignores tanks)
function findEnemyOf(u,range){
  let best=null,bd=range;
  const ad=unitDef(u);
  forNearFoes(u.x,u.y,range,u.faction,e=>{
    const dd=Math.hypot(e.x-u.x,e.y-u.y);
    if(dd>=bd) return;
    if(modVs(ad,unitCls(e))===0) return;
    if(!canSee(u,e)) return;
    bd=dd; best=e;
  });
  return best;
}
// v8.5: THE WORM FIGHTS — every few seconds it rears up and SLAMS the ground: every enemy unit in
// range is hit, every enemy building in reach is crushed, with a shockwave + a float so you can see it.
const BOSS_SLAM = {every:4.5, r:210, dmg:45, bld:130};
function bossSlam(u,dt){
  u.slam=(u.slam??BOSS_SLAM.every)-dt;
  if(u.slam>0) return;
  u.slam=BOSS_SLAM.every;
  u.fightT=Math.max(u.fightT,2.5);
  addBoom(u.x,u.y,3); addParts(u.x,u.y,26,'#c98a4b'); addFloat(u.x,u.y-60,'SLAM!','#ef5350');
  sfx('boom');
  forNearFoes(u.x,u.y,BOSS_SLAM.r,u.faction,e=>{
    if(e.dead||Math.hypot(e.x-u.x,e.y-u.y)>BOSS_SLAM.r) return;
    damageUnit(e,u,BOSS_SLAM.dmg);
  });
  for(const b of S.buildings){
    if(b.faction!==undefined&&b.faction===u.faction) continue;
    if(bFaction(b)===u.faction) continue;
    const c=bPos(b);
    if(Math.hypot(c.x-u.x,c.y-u.y)<=BOSS_SLAM.r+50) damageBuilding(b,u,BOSS_SLAM.bld);
  }
}
// splash: everyone of other factions within r around (x,y) takes 50% (after mods/armor)
function splashAt(x,y,r,from,dmg,skip){
  const hit=[];
  forNearFoes(x,y,r,from.faction,e=>{ if(e!==skip&&Math.hypot(e.x-x,e.y-y)<=r) hit.push(e); });
  for(const e of hit) damageUnit(e,from,dmg*.5);
  addBoom(x,y,1);
}
// medic: heal the most injured friendly unit in range
function medicTick(u,d){
  if(u.cool>0) return false;
  let best=null,bh=1;
  forNear(u.x,u.y,d.range,o=>{
    if(o===u||o.faction!==u.faction||o.boss||o.hp>=o.maxHp) return;
    if(Math.hypot(o.x-u.x,o.y-u.y)>d.range) return;
    const r=o.hp/o.maxHp; if(r<bh){bh=r;best=o;}
  });
  if(!best) return false;
  u.cool=d.rate;
  best.hp=Math.min(best.maxHp,best.hp+d.heal*d.rate);
  tracer(u.x,u.y-8,best.x,best.y-8,'#7dff9a');
  return true;
}
function updateUnit(u,dt){
  u.cool-=dt; u.t+=dt;
  u.fightT=Math.max(0,u.fightT-dt);
  // v8.5: a land unit that ends up in the water is put straight back on the nearest shore (no swimming).
  // Cheap: the walk-grid cell decides. Only COAST cells (a water cell next door) get the exact walkableAt
  // test, so an inland crowd costs nothing and nobody is left standing in the surf. Runs before every
  // early return, so medics and other non-combat troops are rescued too.
  if(!isAir(u)&&!isSea(u)){
    const [cx,cy]=cellOf(u.x,u.y), i=cy*GW+cx;
    let wet=!WALK[i];
    if(!wet&&(cx<=0||cy<=0||cx>=GW-1||cy>=GH-1||!WALK[i-1]||!WALK[i+1]||!WALK[i-GW]||!WALK[i+GW])) wet=!walkableAt(u.x,u.y);
    if(wet){
      const p=nearestLand(u.x,u.y);
      if(p){ u.x=p.x; u.y=p.y; u.path=null; u._seaExit=null; }
    }
  }
  const d = unitDef(u);
  if(d.heal) medicTick(u,d);
  if(u.boss) bossSlam(u,dt);                           // v8.5: the worm's special attack
  // v5 perf: the strategic target is re-evaluated ~3×/s (instantly when the order changes or the target building dies)
  u._tgT=(u._tgT||0)-dt;
  let tg=u._tg;
  if(!tg||u._tgT<=0||u._tgO!==u.order||(tg.b&&tg.b.dead)){ tg=u._tg=targetFor(u); u._tgT=.25+Math.random()*.15; u._tgO=u.order;
    // v8: marching on the CITY uses the cheap city flow field (units/02-movement.js) instead of A*
    if(tg.mid) u.cityGoal=!!(tg.point&&tg.point.city)&&!isSea(u); }
  if(!d.dmg){ // non-combat unit (Medic): just follow orders / stay with the army
    const dd=dist(u,{x:tg.x,y:tg.y});
    if(dd>(tg.b?d.range:10)) stepUnit(u,tg.x,tg.y,d.speed,dt);
    return;
  }
  // acquire enemy (different faction + visible)
  // v5 perf: enemy scan ~5×/s; the current foe is kept while it is alive and still in reach
  const reach=aggroReach(d,tg);                      // v8: marching units only fight what gets CLOSE
  u._fT=(u._fT||0)-dt;
  let foe=u._foe;
  if(u._fT<=0||!foe||foe.dead||Math.hypot(foe.x-u.x,foe.y-u.y)>reach){ foe=u._foe=findEnemyOf(u,reach); u._fT=foe?.15+Math.random()*.1:.3+Math.random()*.15; }   // idle units scan less often
  const trc=facC(u.faction);
  if(foe){
    u.fightT=Math.max(u.fightT,2);
    const dd=dist(u,foe);
    if(dd<=d.range){
      if(u.cool<=0){
        u.cool=d.rate;
        damageUnit(foe,u,d.dmg);
        if(d.splash) splashAt(foe.x,foe.y,d.splash,u,d.dmg,foe);
        tracer(u.x,u.y-10,foe.x,foe.y-d2(foe),trc);
        sfx('shot');
      }
    } else {
      stepUnit(u,foe.x,foe.y,d.speed,dt);
    }
  } else if(tg.b){
    const real=dist(u,{x:tg.x,y:tg.y});
    if(real<=d.range+40){
      if(u.cool<=0){
        u.cool=d.rate;
        u.fightT=Math.max(u.fightT,2);
        damageBuilding(tg.b,u,d.dmg*(d.bld??1));
        tracer(u.x,u.y-8,tg.x,tg.y-20,trc);
        sfx('shot');
      }
    } else stepUnit(u,tg.x,tg.y,d.speed,dt);
  } else {
    const dd=dist(u,{x:tg.x,y:tg.y});
    if(dd>10) stepUnit(u,tg.x,tg.y,d.speed,dt);
  }
  // v8.5: NO COLLISION. Units never block each other any more — they only DRIFT apart a little when they
  // end up on top of each other (the "don't touch" nudge), the same for soldiers and ships, and the nudge
  // is far too weak to stop a march. (It used to shove at up to ~100px/s, which stalled columns on bridges.)
  if(UGRID_ON&&!u.boss&&((u.id+SEP_TICK)&1)){
    if(u._air===undefined){ u._air=isAir(u); u._sz=unitSize(u); u._sea=isSea(u); }
    const air=u._air, sea=u._sea, R=9+5*u._sz, rr0=R+2;
    let px=0,py=0,n=0;
    const cx0=Math.floor((u.x-R-24)/GRID_C), cx1=Math.floor((u.x+R+24)/GRID_C), cy0=Math.floor((u.y-R-24)/GRID_C), cy1=Math.floor((u.y+R+24)/GRID_C);
    outer: for(let cx=cx0;cx<=cx1;cx++) for(let cy=cy0;cy<=cy1;cy++){
      const a=UGRID.get(cx*4096+cy); if(!a) continue;
      for(let k=0;k<a.length;k++){
        const o=a[k]; if(o===u||o.dead||o.boss) continue;
        const dx=u.x-o.x, dy=u.y-o.y; if(dx>50||dx<-50||dy>50||dy<-50) continue;
        if(o._air===undefined){ o._air=isAir(o); o._sz=unitSize(o); o._sea=isSea(o); }
        if(o._air!==air) continue;
        const rr=rr0+2*o._sz, d2=dx*dx+dy*dy; if(d2>=rr*rr) continue;
        const d=Math.sqrt(d2);
        if(d<.01){ px+=Math.random()-.5; py+=Math.random()-.5; }
        else { const f=(rr-d)/rr; px+=dx/d*f; py+=dy/d*f; }
        if(++n>=5) break outer;
      }
    }
    if(n){ const k=Math.min(1,dt*4)*R*.22, nx=u.x+px*k, ny=u.y+py*k;
      const [wx,wy]=cellOf(nx,ny);
      if(air||(sea?SEA[wy*GW+wx]:WALK[wy*GW+wx])){ u.x=nx; u.y=ny; } }
  }

  // boss history
  if(u.boss){
    u.hist.unshift({x:u.x,y:u.y});
    if(u.hist.length>40) u.hist.pop();
  }
}
