/* Military Base 2.5D — 19-init.js · init: load save → migrate → start */
'use strict';
// ================= init =================
function init(){
  const loaded=load();
  S=loaded||defaultState();
  S.admin=Object.assign({speed:1,god:false,freeze:false,noRespawn:false}, loaded?loaded.admin:undefined);
  // fill fields added in later versions
  S.stats=Object.assign(defaultStats(), S.stats||{});
  S.settings=Object.assign(defaultSettings(), S.settings||{});   // v8: graphics/perf rows added in later builds
  if(S.settings.units==='Potato') S.settings.units='Blocks';     // v8.2: potato blobs are plain rectangles now
  if(S.settings.blds==='Potato') S.settings.blds='Blocks';
  S.achievements=S.achievements||{};
  S.quests=S.quests||null; S.weather=S.weather||{cur:'clear',t:180};
  S.rewards=S.rewards||{}; S.codes=S.codes||{}; S.inventory=S.inventory||[];
  S.shopSub=S.shopSub||'light'; S.bankT=S.bankT??60;
  // drop anything the current data no longer knows about
  S.buildings=(S.buildings||[]).filter(b=>BUILD[b.type]);
  S.inventory=S.inventory.filter(it=>it.kind==='c'||BUILD[it.type]);
  S.inventory=mergeInventory(S.inventory);                     // v8.4: identical items stack into one card
  // v6+: converts a save from ANY older cell size (S.grid = the px per cell the saved gx/gy use).
  // v8.3 grid is 8px; v7 was 16px; v5 was 64px (coarse 13×9). k = oldCell / newCell.
  { const old=Number(S.grid)||64;
    if(old!==SLOT){ const k=old/SLOT; for(const b of S.buildings) if((b.owner??'p')==='p'){ b.gx=Math.round(b.gx*k); b.gy=Math.round(b.gy*k); } }
    S.grid=SLOT; }
  // player buildings outside the plot, or overlapping another one (footprints changed), are returned to the backpack
  // v8.4: an old save whose footprints now overlap no longer loses the buildings — they STACK instead
  { const mine=S.buildings.filter(b=>(b.owner??'p')==='p');
    S.buildings=S.buildings.filter(b=>(b.owner??'p')!=='p');
    for(const b of mine){
      if(!BUILD[b.type]) continue;
      const zone=b.zone||'land', L=stackTopAt(b.type,b.gx,b.gy,'p',zone);
      if(fitsAt(b.type,b.gx,b.gy,'p',zone,L)){ if(L) b.lvl=L; S.buildings.push(b); }
      else giveItem('b',b.type);
    } }
  // points keep only dynamic fields — coords come from POINTS_DEFS
  S.points=POINTS_DEFS.map((d,i)=>{ const p=(S.points||[])[i]||{}; return {...d, owner:p.owner??'neutral', faction:p.faction??-1, cool:p.cool??0, respawnT:p.respawnT??8}; });
  S._power=totalPower();
  // (re)place bot bases from their presets (idempotent)
  for(let i=0;i<S.bots.length;i++) setBotPreset(i,S.bots[i].preset,true);
  // restore saved player units (before garrisons, so restored troops keep their home point)
  if(loaded){
    S.units=S.units.filter(u=>u.side==='e'&&!u.boss&&UNITS[u.type]);
    for(const su of loaded.units||[]){
      if(!UNITS[su.type]) continue;
      const u=mkUnit(su.type,'p',su.x,su.y,{home:su.home??null});
      u.hp=Math.min(u.hp,su.hp||u.hp);
      u.order=su.order||null;
      S.units.push(u);
    }
    // map moved: anyone standing in water gets relocated
    const pc=plotCentre();
    for(const u of [...S.units]){
      if(isAir(u)||walkableAt(u.x,u.y)) continue;
      if(u.side==='p'){ u.x=pc.x; u.y=pc.y; u.order=null; u.home=null; }
      else if(u.bot!=null){ const c=plotCenter(MAP_PLOTS[u.bot+1]); u.x=c.x; u.y=c.y; u.order=null; u.cityGoal=false; }
      else S.units=S.units.filter(v=>v!==u);
    }
  }
  // restore missing garrisons for owned points
  for(const p of S.points){
    if(p.owner==='neutral') continue;
    const need=p.garrison+p.tank-garrisonCount(p.id);
    if(need>0) spawnGarrison(p.id,need);
  }
  window.addEventListener('beforeunload',save);
  if(!S.stats.tut) showTut();
  requestAnimationFrame(frame);
}
init();
