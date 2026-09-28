/* Military Base 2.5D — 02-production.js · what buildings DO: money capacity, unit training, wave-defense garrisons */
'use strict';
// ================= buildings: production =================
// 1. MONEY CAPACITY — a $ building stores what it earns (up to d.cap) and pays out every d.cycle
//    seconds, or the instant you click it. STORED cash is what the Bank pays its 5% on.
// 2. UNIT PRODUCTION — one unit per cycle, if the troop cap has room for the unit's footprint (size).
// 3. WAVE-DEFENSE GARRISON (the original's WaveDefenseUnitProduction) — while a raid is incoming every
//    one of your unit buildings trains FREE defenders of its own type, up to wdCapOf() each
//    (max WAVE_DEF_SLOTS troop slots for the whole base). They stand down when the raid is over.

// ---------- stored cash ----------
function storedTotal(){ let n=0; for(const b of S.buildings) if(isMine(b)) n+=b.stored||0; return n; }
function storedCap(){ let n=0; for(const b of S.buildings) if(isMine(b)) n+=BUILD[b.type].cap||0; return n; }
// empty one building's safe into your wallet (returns the amount paid)
function collectStored(b){
  const pay=Math.floor(b.stored||0);
  if(pay<=0) return 0;
  b.stored=0; b.payT=BUILD[b.type].cycle||MONEY_CYCLE;
  S.cash+=pay;
  if(b.x!=null){ addFloat(b.x,b.y-34,'+'+fmt(pay),'#8fe08f'); addParts(b.x,b.y-10,6,'#ffd54f'); }
  sfx('coin');
  return pay;
}
function collectAllStored(){ let n=0; for(const b of S.buildings) if(isMine(b)&&(b.stored||0)>0) n+=collectStored(b); return n; }

// ---------- where a trained unit appears ----------
// Ships launch from the nearest water; land units take the closest free spot around the building where
// their FOOTPRINT (UnitSize) doesn't overlap another unit — no more soldiers stacked in one pixel.
function spawnSpotFor(b,type){
  const c=bPos(b), ud=UNITS[type];
  if(ud&&ud.sea){ const w=nearestSea(c.x,c.y); if(w) return {x:w.x,y:w.y}; }
  if(!ud||!ud.size||ud.size<=1) return {x:c.x+rnd(-20,20), y:c.y+rnd(-10,10)};
  const R=9+5*ud.size;
  for(let ring=1;ring<10;ring++){
    const rr=(ud.size*4)+ring*Math.max(9,R*.85), steps=6+ring*3;
    for(let k=0;k<steps;k++){
      const a=(k/steps)*pi2+ring*.8;
      const x=c.x+Math.cos(a)*rr, y=c.y+Math.sin(a)*rr*.8;
      if(!walkableAt(x,y)) continue;
      let free=true;
      forNear(x,y,R+16,o=>{ if(!free||o===b||o.boss) return;
        if(Math.hypot(o.x-x,o.y-y) < R+(9+5*(o.boss?4:unitSize(o)))) free=false; });
      if(free) return {x,y};
    }
  }
  return {x:c.x+rnd(-24,24), y:c.y+rnd(-12,12)};
}

// ---------- wave-defense garrison ----------
// cheap buildings field a squad, the top-end ones a single vehicle (like the original's MaxCap)
const wdCapOf = d => d.wd != null ? d.wd : clamp(Math.round(20/Math.sqrt((d.power||100)/50+1)),1,4);
const WAVE_DEF_SLOTS = 24;                     // troop slots the whole base garrison may use
function wdCount(bid){ let n=0; for(const u of S.units) if(u.wd===bid&&!u.dead) n++; return n; }
function wdSlots(){ let n=0; for(const u of S.units) if(u.wd!=null&&!u.dead) n+=unitSize(u); return n; }
function standDownDefenders(){
  let n=0;
  for(const u of S.units) if(u.wd!=null&&!u.dead){ u.dead=true; n++; }
  if(n){ S.units=S.units.filter(u=>!u.dead); toast(`🛡 ${n} garrison unit${n>1?'s':''} stood down — base is safe`,'#7fc4ff'); }
  return n;
}
function updateWaveDefense(dt){
  if(waveAlert()<=0){ if(wdSlots()>0) standDownDefenders(); return; }
  if(S.admin&&S.admin.noRespawn) return;
  for(const b of S.buildings){
    const d=BUILD[b.type];
    if(!d.unit||(b.owner??'p')!=='p') continue;
    b.wdT=(b.wdT==null?d.spawnEvery*1.2:b.wdT)-dt;
    if(b.wdT>0) continue;
    b.wdT=d.spawnEvery*1.2;
    if(wdCount(b.id)>=wdCapOf(d)) continue;
    if(wdSlots()+(UNITS[d.unit].size||1)>WAVE_DEF_SLOTS) continue;
    const sp=spawnSpotFor(b,d.unit);
    const u=mkUnit(d.unit,'p',sp.x,sp.y,{wd:b.id});
    S.units.push(u);
    if(S.settings.dmg) addFloat(sp.x,sp.y-26,'GARRISON','#7fc4ff');
  }
}

// ---------- the per-building tick ----------
function productionTick(dt){
  const cap=unitCap(), mult=incomeMult();
  for(const b of S.buildings){
    const d=BUILD[b.type];
    // --- money: earn → store → pay out (or straight to the wallet for buildings with no safe) ---
    if(d.income){
      const dmg = b.hp < b.maxHp*.5 ? .5 : 1;
      if(d.cap){
        b.stored=Math.min(d.cap,(b.stored||0)+d.income*dmg*mult*dt);
        b.payT=(b.payT==null?(d.cycle||MONEY_CYCLE):b.payT)-dt;
        if(b.payT<=0){
          b.payT=d.cycle||MONEY_CYCLE;
          const pay=Math.floor(b.stored||0);
          if(pay>0){ b.stored=0; S.cash+=pay; if(b.x!=null) addFloat(b.x,b.y-30,'+'+fmt(pay),'#8fe08f'); }
        }
      } else S.cash += d.income*dmg*mult*dt;
    }
    // --- units ---
    if(!d.unit) continue;
    b.t-=dt;
    if(b.t>0) continue;
    const owner=b.owner??"p", size=UNITS[d.unit].size||1;
    if(owner==="p"&&capUsed()+size<=cap){
      const sp=spawnSpotFor(b,d.unit);
      S.units.push(mkUnit(d.unit,'p',sp.x,sp.y));
      b.t=d.spawnEvery; sfx('spawn');
    } else if(typeof owner==="number"&&!S.bots[owner].down&&botUnits(owner).length<botCap(owner)){
      const sp=spawnSpotFor(b,d.unit);
      S.units.push(mkUnit(d.unit,'e',sp.x,sp.y,{bot:owner,faction:owner+1}));
      b.t=d.spawnEvery;
    } else b.t=.5;
  }
}
