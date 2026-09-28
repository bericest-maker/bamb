/* Military Base 2.5D — 02-economy.js · income, bonuses, troop cap, bank interest */
'use strict';
S && (S._power=0);
function countMine(pred){ let n=0; for(const b of S.buildings) if(isMine(b)&&pred(BUILD[b.type],b)) n++; return n; }
// income bonus % pieces (shown in the HUD): rebirth, outposts, city, logistics
function incomeBonus(){
  let outposts=0, city=false;
  for(const p of S.points) if(p.owner==='player'){ if(p.city) city=true; else outposts++; }
  const logi=Math.min(5,countMine(d=>d.special==='logistics'));
  return {rebirth:S.rebirth*10, outposts:outposts*10, city:city?20:0, logistics:logi*10};
}
// the one number every money building is multiplied by (rebirth × outposts+city × logistics)
function incomeMult(){
  const B=incomeBonus();
  return (1+B.rebirth/100)*(1+(B.city+B.outposts)/100)*(1+B.logistics/100);
}
function incomeRate(){
  let base=0;
  for(const b of S.buildings){
    if(!isMine(b)) continue;
    const d=BUILD[b.type];
    const dmg = b.hp < b.maxHp*.5 ? .5 : 1;
    base += (d.income||0)*dmg;
  }
  return base*incomeMult();
}
function unitCap(){
  return Math.min(100, 10+countMine(d=>d.special==='depot')*10);
}
function playerUnits(){ return S.units.filter(u=>u.side==='p'); }
// troop cap is counted in unit SIZE (a Mammoth uses 5 slots, a Rifleman 1).
// Point garrisons and wave-defense garrisons are FREE — they never eat your cap.
function capUsed(){ let n=0; for(const u of S.units) if(u.side==='p'&&!u.boss&&u.home==null&&u.wd==null) n+=unitSize(u); return n; }
// bank: every 60s each Bank pays 5% of the cash STORED inside your buildings
// (the original's IncomePercent=0.05 on ResourceProduction capacity, Minimum 1000). Max 3 banks.
function bankTick(dt){
  const banks=Math.min(3,countMine(d=>d.special==='bank'));
  if(!banks){ S.bankT=60; return; }
  S.bankT-=dt;
  if(S.bankT>0) return;
  S.bankT=60;
  const stored=storedTotal();
  if(stored<1000) return;
  const pay=Math.round(stored*.05*banks);
  if(pay>0){ S.cash+=pay; toast(`🏦 Bank interest +$${fmt(pay)} (5% of $${fmt(stored)} stored)`,'#ffd54f'); sfx('coin'); }
}
