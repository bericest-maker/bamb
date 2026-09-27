/* Military Base 2.5D — 12-units.js · units: garrisons, waves, boss, captures, AI, movement, combat */
'use strict';
// points & garrison
function garrisonCount(i){
  return S.units.filter(u=>u.home===i).length;
}
function pointFaction(p){ return p.owner==='player'?0:(p.owner==='enemy'?(p.faction??1):-1); }
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
    order:null,home:ex.home??null,bot:ex.bot??null,raid:!!ex.raid,boss:!!ex.boss,
    stealth:d.cls.includes('stealth'),revealed:false,fightT:0,cityGoal:!!ex.cityGoal,
    path:null,wp:0,repath:0,_tcx:-1,_tcy:-1,
    tx:ex.tx??x,ty:ex.ty??y,hist:ex.hist||[]};
}

// waves & boss
function spawnWave(){
  S.wave++;
  const n=3+S.wave, tanks=Math.floor(S.wave/2);
  const hpM=1+S.wave*.12;
  const fromBots=S.bots.map((b,i)=>b.down||botBuildings(i).length===0?-1:i).filter(i=>i>=0);
  if(!fromBots.length) return;
  const bi=pick(fromBots);
  const c=botCenter(bi);
  const pool=wavePool(S.wave);
  for(let i=0;i<n+tanks;i++){
    const x=clamp(c.x+rnd(-260,260),150,WORLD.w-150);
    const y=clamp(c.y+rnd(-180,180),150,WORLD.h-150);
    const type = i<tanks?'tank':pick(pool);
    const u=mkUnit(type,'e',x,y,{raid:true,faction:bi+1});
    u.hp=u.maxHp=UNITS[type].hp*hpM;
    u.order={point:CITY_IDX}; u.cityGoal=true; // surge the CITY
    S.units.push(u);
  }
  toast(`⚠️ WAVE ${S.wave}: ${facN(bi+1)} reinforcements surge the CITY!`,facC(bi+1));
  sfx('horn');
}
// wave unit pool — unlocks tougher troops as waves go on
const WAVE_POOL=[[1,['rifle']],[2,['scout','hinf']],[3,['atv']],[5,['humvee','rocket','heli']],[8,['apc','sniper','flak','spectre']],[12,['heavy','jet','cobra']],[18,['phantom','mech']]];
function wavePool(w){ const out=[]; for(const [at,list] of WAVE_POOL) if(w>=at) out.push(...list); return out; }
function spawnBoss(){
  const pc=plotCenter(pick(MAP_PLOTS));
  const x=pc.x+rnd(-120,120), y=pc.y+rnd(-70,70);
  const hpM=1+S.wave*.1;
  const bf=1+Math.floor(Math.random()*7);
  const u=mkUnit('rifle','e',x,y,{boss:true,faction:bf});
  u.type='boss';
  u.hp=u.maxHp=BOSS.hp*hpM;
  u.hist=[];
  S.units.push(u);
  toast(`🐍 MECHA WORM emerges from ${BOT_DEFS[bf-1].dir}! KILL IT FOR A PREMIUM CRATE!`,'#ef5350');
  sfx('horn');
}

// capture check — the faction with the most troops at a point holds it
let capTimer=0;
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

// ---- spatial hash grid (v5 perf) — rebuilt once per update, so neighbour searches only look at nearby cells ----
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

// unit update
const bFaction = b => (b.owner??"p")==="p"?0:b.owner+1;
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
    return {x:u.x,y:u.y};
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
  if(S.attackCity){
    const city=S.points[CITY_IDX];
    if(pointFaction(city)!==0) return {x:city.x,y:city.y,point:city};
    S.attackCity=false;
  }
  let best=null,bd=1e9;
  for(const p of S.points){
    if(pointFaction(p)===0||pointFaction(p)<0) continue;
    const dd=Math.hypot(p.x-u.x,p.y-u.y);
    if(dd<bd){bd=dd;best=p;}
  }
  if(best) return {x:best.x,y:best.y,point:best};
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
let DETECT={}, detT=0;
function refreshDetectors(dt){
  detT-=dt; if(detT>0) return; detT=.25;
  DETECT={};
  const add=(f,x,y,r)=>(DETECT[f]=DETECT[f]||[]).push({x,y,r});
  for(const u of S.units){ const r=unitDetect(u); if(r>0) add(u.faction,u.x,u.y,r); }
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
  const d = unitDef(u);
  if(d.heal) medicTick(u,d);
  // v5 perf: the strategic target is re-evaluated ~3×/s (instantly when the order changes or the target building dies)
  u._tgT=(u._tgT||0)-dt;
  let tg=u._tg;
  if(!tg||u._tgT<=0||u._tgO!==u.order||(tg.b&&tg.b.dead)){ tg=u._tg=targetFor(u); u._tgT=.25+Math.random()*.15; u._tgO=u.order; }
  if(!d.dmg){ // non-combat unit (Medic): just follow orders / stay with the army
    const dd=dist(u,{x:tg.x,y:tg.y});
    if(dd>(tg.b?d.range:10)) stepUnit(u,tg.x,tg.y,d.speed,dt);
    return;
  }
  // acquire enemy (different faction + visible)
  // v5 perf: enemy scan ~5×/s; the current foe is kept while it is alive and still in reach
  const reach=d.range+(tg.defend?220:60);
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
  // v5: soft separation so crowds spread out instead of marching in single-file columns
  // (grid cells only, stops after 5 neighbours, each unit every other frame → cheap even with 1000+ units)
  if(UGRID_ON&&!u.boss&&((u.id+SEP_TICK)&1)){
    if(u._air===undefined){ u._air=isAir(u); u._sz=unitSize(u); }
    const air=u._air, R=9+5*u._sz, rr0=R+4;
    let px=0,py=0,n=0;
    const cx0=Math.floor((u.x-R-24)/GRID_C), cx1=Math.floor((u.x+R+24)/GRID_C), cy0=Math.floor((u.y-R-24)/GRID_C), cy1=Math.floor((u.y+R+24)/GRID_C);
    outer: for(let cx=cx0;cx<=cx1;cx++) for(let cy=cy0;cy<=cy1;cy++){
      const a=UGRID.get(cx*4096+cy); if(!a) continue;
      for(let k=0;k<a.length;k++){
        const o=a[k]; if(o===u||o.dead||o.boss) continue;
        const dx=u.x-o.x, dy=u.y-o.y; if(dx>50||dx<-50||dy>50||dy<-50) continue;
        if(o._air===undefined){ o._air=isAir(o); o._sz=unitSize(o); }
        if(o._air!==air) continue;
        const rr=rr0+4*o._sz, d2=dx*dx+dy*dy; if(d2>=rr*rr) continue;
        const d=Math.sqrt(d2);
        if(d<.01){ px+=Math.random()-.5; py+=Math.random()-.5; }
        else { const f=(rr-d)/rr; px+=dx/d*f; py+=dy/d*f; }
        if(++n>=5) break outer;
      }
    }
    if(n){ const k=Math.min(1,dt*12)*R*.5, nx=u.x+px*k, ny=u.y+py*k;
      const [wx,wy]=cellOf(nx,ny); if(air||WALK[wy*GW+wx]){ u.x=nx; u.y=ny; } }
  }
  // boss history
  if(u.boss){
    u.hist.unshift({x:u.x,y:u.y});
    if(u.hist.length>40) u.hist.pop();
  }
}
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
function stepUnit(u,tx,ty,sp,dt){
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
function damageUnit(t,from,dmg){
  if(t.dead) return;                                 // v5: already killed this frame (also stops double kill rewards from splash)
  if(S.admin&&S.admin.god&&t.side==='p') return; // admin god mode
  const m=modFor(from,t);                          // class damage modifier (×0 … ×2)
  if(m===0) return;
  dmg=Math.max(1,dmg*m-unitArmor(t));             // then flat armor, min 1
  t.hp-=dmg;
  if(isStealth(t)){ t.revealed=true; t.fightT=3; } // taking fire breaks stealth
  if(S.settings.dmg && from.side==='p') addFloat(t.x+rnd(-6,6),t.y-24,String(Math.round(dmg)),'#ffd54f');
  if(t.hp<=0) killUnit(t,from);
}
function killUnit(u,from){
  if(u.dead) return;
  u.dead=true;
  if(UPDATING) NEED_COMPACT=true;           // v5 perf: removed in one pass at the end of the frame
  else S.units=S.units.filter(x=>x!==u);
  addBoom(u.x,u.y,u.boss?3:1);
  addParts(u.x,u.y,u.boss?26:8,'#c98a4b');
  sfx('boom');
  if(from&&from.side==='p'&&u.faction!==0){
    if(u.boss){
      S.stats.bosses++;
      S.cash+=BOSS.reward;
      S.inventory.push({kind:'c',type:'premium'});
      toast(`🐳 MECHA WORM DESTROYED! +${fmt(BOSS.reward)}$ + Premium Crate`,'#ffd54f');
      addFloat(u.x,u.y-40,'+PREMIUM CRATE!','#ffd54f');
    } else {
      const d=UNITS[u.type];
      S.cash+=d.reward;
      S.stats.kills++;
      addFloat(u.x,u.y-16,'+'+d.reward+'$','#8fe08f');
    }
  }
  if(u.side==='p' && selUnits.includes(u)) selUnits=selUnits.filter(x=>x.id!==u.id);
}
function damageBuilding(b,from,dmg){
  if(S.admin&&S.admin.god&&isMine(b)) return; // admin god mode protects YOUR base (fixed: used to make bots immortal too)
  if(b.dead) return;
  b.hp-=dmg; b.flash=.15;
  if(S.settings.dmg && from.side==='p') addFloat(b.x+rnd(-10,10),b.y-40,String(Math.round(dmg)),'#ffb0a8');
  if(b.hp<=0){
    removeBuildings(x=>x===b);
    addBoom(b.x,b.y,2);
    sfx('boom');
    if(typeof(b.owner??"p")==="number"){
      const d=BUILD[b.type];
      if(from.side==='p'){
        const reward=Math.max(100,Math.round((d.cost||20000)*.25));
        S.cash+=reward;
        toast(`💥 ${facN(b.owner+1)}'s ${d.name} destroyed! +$${fmt(reward)}`,'#ffd54f');
      } else {
        toast(`💥 ${facN(b.owner+1)}'s ${d.name} destroyed`,'#8f9aa8');
      }
    } else {
      toast(`💥 ${BUILD[b.type].name} destroyed!`,'#ef5350');
    }
  }
}

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
