/* Military Base 2.5D — 03-waves.js · raid waves, the wave pool, the MECHA WORM boss */
'use strict';
// raid wave + boss timers (frozen by the admin panel)
function waveTick(dt){
  if(S.admin&&S.admin.freeze) return;
  if(!S.units.some(u=>u.boss)){
    S.nextBoss-=dt;
    if(S.nextBoss<=0){ spawnBoss(); S.nextBoss=300; }
  } else {
    S.nextBoss=Math.max(S.nextBoss,15);
  }
  S.nextWave-=dt;
  if(S.nextWave<=0){ spawnWave(); S.nextWave=120; }
}

// ---- WAVE ALERT: how long the base keeps its garrison up (buildings/02-production.js trains it) ----
// It is on while a wave is fresh, a boss is loose, or hostiles are inside 1300px of YOUR plot.
function updateWaveAlert(dt){
  let a=Math.max(0,(S.waveAlert||0)-dt);
  if(S.admin&&S.admin.freeze) a=0;
  const pc=plotCentre();
  for(const u of S.units){
    if(u.dead||u.side!=='e') continue;
    if(Math.hypot(u.x-pc.x,u.y-pc.y)<1300){ a=Math.max(a,25); break; }
  }
  S.waveAlert=a;
}
const waveAlert = () => Math.max(0,S.waveAlert||0);

// waves & boss
function spawnWave(){
  S.wave++;
  S.waveAlert=Math.max(S.waveAlert||0,60);   // garrisons man their posts
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
// v8.5: the worm surfaces in the MIDDLE (the CITY island) and slams everything around it (units/04-ai.js)
function spawnBoss(){
  // Every boss surfaces on the exact map/CITY centre; the fight begins at the middle, not around it.
  const x=MAP_C.x, y=MAP_C.y;
  const hpM=1+S.wave*.1;
  const bf=1+Math.floor(Math.random()*7);
  const u=mkUnit('rifle','e',x,y,{boss:true,faction:bf});
  u.type='boss';
  u.hp=u.maxHp=(S.admin&&S.admin.bossHp>0?S.admin.bossHp:BOSS.hp)*hpM;   // v8.5: admin can set a custom HP
  u.hist=[];
  u.slam=BOSS_SLAM.every;                       // first slam as soon as it finishes surfacing
  S.units.push(u);
  S.waveAlert=Math.max(S.waveAlert||0,60);
  toast(`🐍 MECHA WORM surfaces in the CITY (${fmt(Math.round(u.maxHp))} HP)! KILL IT FOR A PREMIUM CRATE!`,'#ef5350');
  sfx('horn');
  addBoom(x,y,3);
}
