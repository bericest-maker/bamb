/* Military Base 2.5D — 17-loop.js · main loop: frame + update + HUD, wheel zoom, test hook */
'use strict';
// ================= main loop =================
let last=performance.now(), hudT=0, powT=0, saveT=0, fpsFrames=0, fpsLast=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  let dt=(now-last)/1000; last=now;
  if(dt>0.05) dt=0.05;
  fpsFrames++;
  if(now-fpsLast>=1000){ if(S) S._fps=fpsFrames; fpsFrames=0; fpsLast=now; }
  update(dt,now/1000);
  render();
}
function update(dt,t){
  const gdt=dt*(S.admin?(S.admin.speed==null?1:S.admin.speed):1); // admin time scale (0 = paused)
  // camera (real time — you can look around even while paused)
  const sp=520*dt;
  if(keys['w']||keys['arrowup']) cam.ty-=sp;
  if(keys['s']||keys['arrowdown']) cam.ty+=sp;
  if(keys['a']||keys['arrowleft']) cam.tx-=sp;
  if(keys['d']||keys['arrowright']) cam.tx+=sp;
  clampCam();   // v8: keeps you over the island, or locks to the map centre once the view covers the world
  cam.x=lerp(cam.x,cam.tx,1-Math.pow(.001,dt));
  cam.y=lerp(cam.y,cam.ty,1-Math.pow(.001,dt));
  const cap=unitCap();
  if(gdt>0){
  S.time+=gdt;
  // buildings: money capacity (earn → store → pay out), unit training, wave-defense garrison
  productionTick(gdt);
  updateWaveAlert(gdt);
  // bot offense dispatch: default = march on the CITY (the middle)
  botRaidTick(gdt);
  // v5 perf: one spatial-hash rebuild per frame; kills are flagged and compacted after the unit pass
  UPDATING=true; ASTAR_BUDGET=24; SEP_TICK++; buildUnitGrid();
  // stealth detection (shared sensors + radar), officer auras, turrets, hospitals, banks, garrisons
  refreshDetectors(gdt);
  updateTurrets(gdt);
  hospitalTick(gdt);
  bankTick(gdt);
  updateWaveDefense(gdt);
  // destroyed bot bases rebuild
  botRebuildTick(gdt);
  // units
  for(const u of [...S.units]) if(!u.dead) updateUnit(u,gdt);
  UPDATING=false; UGRID_ON=false; ASTAR_BUDGET=1e9; compactUnits();
  // point respawns: maintain the OWNER's garrison
  pointRespawnTick(gdt);
  // waves & boss
  waveTick(gdt);
  checkCaptures(gdt);
  // fx
  fxTick(gdt);
  for(const b of S.buildings) if(b.flash>0) b.flash-=gdt;
  } // end if(gdt>0)
  // power + achievements (throttled)
  powT-=dt;
  if(powT<=0){ S._power=totalPower(); powT=.5; checkAchievements(); }
  // HUD (throttled)
  hudT-=dt;
  if(hudT<=0){
    hudT=.2;
    $('#stPower').textContent=fmt(S._power||0);
    $('#stUnits').textContent=`${capUsed()}/${cap}`;
    $('#stCash').textContent='$'+fmt(S.cash);
    const st=storedTotal(), sc=storedCap();
    const row=$('#stStoredRow');
    if(row){ row.hidden = sc<=0;
      if(sc>0){ $('#stStored').textContent='$'+fmt(st);
        $('#stCap').textContent='/ $'+fmt(sc);
        row.title='Cash stored inside your money buildings (click one to collect). The Bank pays 5% interest on it every 60s.'; } }
    const IB=incomeBonus(), bonus=IB.rebirth+IB.outposts+IB.city+IB.logistics;   // fixed: city was counted twice (+30% instead of +20%)
    $('#stIncome').title=`Rebirth +${IB.rebirth}% · Outposts +${IB.outposts}% · City +${IB.city}% · Logistics +${IB.logistics}%`;
    $('#stIncome').textContent=`$${fmt(incomeRate())}/s +${bonus}%`;
    $('#tWave').textContent=`⏱ WAVE ${fmtTime(S.nextWave)}${waveAlert()>0?` · 🛡️ ${Math.ceil(waveAlert())}s`:''}`;
    const boss=S.units.find(u=>u.boss);
    const tb=$('#tBoss');
    if(boss){ tb.textContent='🐳 WORM ACTIVE!'; tb.classList.add('danger'); }
    else { tb.textContent=`🐍 BOSS ${fmtTime(S.nextBoss)}`; tb.classList.remove('danger'); }
    $('#bossbar').hidden=!boss;
    if(boss) $('#bbFill').style.width=clamp01(boss.hp/boss.maxHp)*100+'%';
    const T=5000*Math.pow(2.2,S.rebirth);
    $('#rbBadge').hidden=!(S._power>=T);
    if(document.querySelector('#p-rebirth.show')) renderRebirth();
    if(document.querySelector('#p-rewards.show')) renderRewards();
    if(document.querySelector('#p-achieve.show')) renderAchievements();
    if(document.querySelector('#p-leader.show')) renderLeaderboard();
    if(window.Admin && $('#p-admin').classList.contains('open')) Admin.tickStats();
  }
  saveT-=dt;
  if(saveT<=0){ save(); saveT=12; }
}
// wheel zoom (bound once)
cv.addEventListener('wheel',e=>{
  e.preventDefault();
  const before=s2w(e.clientX,e.clientY);
  cam.z=clamp(cam.z*(e.deltaY>0?.9:1.1),MINZ,3);   // v8: zoom out until the WHOLE map fits (was .5)
  const after=s2w(e.clientX,e.clientY);
  cam.tx+=before.x-after.x; cam.ty+=before.y-after.y;
  clampCam();
  cam.x=cam.tx; cam.y=cam.ty;
},{passive:false});

// unlock/resume audio on first interaction anywhere
document.addEventListener('pointerdown',()=>{
  initAudio();
  if(AC&&AC.state==='suspended') AC.resume();
},{passive:true});

// debug/test hook (harmless in browser)
if (typeof window!=='undefined'){
  window.__BMB={
    get S(){ return S; },
    get totalPower(){ return totalPower; },
    placeBuilding, giveItem, spawnBoss, spawnWave, mkUnit, killUnit, damageUnit,
    setBotPreset, damageBuilding, botBuildings, botUnits, bPos,
    astar, flowStep, cellOf, canSee, pointFaction,
    WALK, GW, GH, CELL,
    facC, facN, isAir, isStealth, modFor, modVs, capUsed, unitCap, incomeRate, incomeBonus,
    updateTurrets, hospitalTick, bankTick, checkAchievements, buyBlock, canPlaceAt, walkableAt,
    POINTS_DEFS, BOT_DEFS, MAP_PLOTS, LOBES, BRIDGES, PLOT, CITY_IDX, plotCentre, botPower,
  };
}
