/* Military Base 2.5D — 03-bots.js · bot bases: presets, production, army cap, rebuild */
'use strict';
function botBuildings(i){ return S.buildings.filter(b=>b.owner===i); }
function botUnits(i){ return S.units.filter(u=>u.side==='e'&&u.bot===i); }
function botTier(i){ return (PRESET_MAP[S.bots[i].preset]||PRESETS[0]).tier; }
function botCap(i){ return 8+botTier(i)*2; }
// bot offense dispatch: default = march on the CITY (the middle)
function botRaidTick(dt){
  for(let i=0;i<S.bots.length;i++){
    const bot=S.bots[i];
    if(bot.down||botTier(i)<2) continue;
    bot.raidT-=dt;
    if(bot.raidT>0) continue;
    const idle=botUnits(i).filter(u=>!u.order);
    if(idle.length>=4){
      const n=Math.min(2+Math.floor(botTier(i)/2),Math.floor(idle.length/2));
      for(let k=0;k<n;k++){ idle[k].order={point:CITY_IDX}; idle[k].cityGoal=true; }
      if(n>0) toast(`⚔️ ${facN(i+1)} is marching on the CITY!`,facC(i+1));
    }
    bot.raidT=Math.max(30,90-botTier(i)*8)+rnd(0,25);
  }
}
// destroyed bot bases rebuild after 25s
function botRebuildTick(dt){
  for(let i=0;i<S.bots.length;i++){
    const bot=S.bots[i];
    if(!bot.down&&bot.preset!=="empty"&&botBuildings(i).length===0){
      bot.down=true; bot.downT=25;
      removeUnits(u=>u.bot===i);
      toast(`💥 ${BOT_DEFS[i].name}'s base is DESTROYED — rebuilding in 25s`,'#ef5350');
      sfx('boom');
    }
    if(bot.down){
      bot.downT-=dt;
      if(bot.downT<=0){
        setBotPreset(i,bot.preset,true);
        toast(`🔧 ${BOT_DEFS[i].name} rebuilt its base!`,'#4a90e2');
      }
    }
  }
}
function setBotPreset(i,presetId,silent){
  const bot=S.bots[i];
  removeBuildings(b=>b.owner===i);
  removeUnits(u=>u.bot===i);
  bot.preset=presetId; bot.down=false; bot.downT=0;
  bot.raidT=110-botTier(i)*6+rnd(0,50);
  for(const [t,cx,cy] of (PRESET_MAP[presetId]||PRESETS[0]).b){   // coarse layout → fine cells; slide to a free spot if the real footprint collides
    if(!BUILD[t]) continue;
    const sp=findFreeSpot(t,cx*GRID_K,cy*GRID_K,i); if(sp) placeBuildingRaw(t,sp.gx,sp.gy,i,undefined,sp.lvl);
  }
  if(!silent) toast(`${BOT_DEFS[i].name} → ${(PRESET_MAP[presetId]||PRESETS[0]).label}`,'#4a90e2');
}
