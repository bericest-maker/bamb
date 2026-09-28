/* Military Base 2.5D — 01-power.js · military power: structure power + army power (leaderboard / unlocks) */
'use strict';
// ================= game systems =================
const isMine = b => (b.owner??"p")==="p";
// STRUCTURE POWER (the original's StructurePower) = the score of your BUILDINGS only.
// Army power = your troops. Total power = both — that's what unlocks shop items (RequiredPower).
function structurePower(){
  let p=0;
  for(const b of S.buildings) if(isMine(b)) p+=BUILD[b.type].power;
  return p;
}
function armyPower(){
  let p=0;
  for(const u of S.units) if(u.side==='p'&&!u.dead) p+=(u.boss?BOSS.power:UNITS[u.type].power);
  return p;
}
function totalPower(){ return structurePower()+armyPower(); }
// split of a faction's power (leaderboard shows both columns)
function powerSplit(){
  const st=structurePower();
  return {structure:st, army:armyPower(), total:st+armyPower()};
}
// power of a bot faction (leaderboard) — same split as yours
function botPower(i){
  let st=0, ar=0;
  for(const b of S.buildings) if(b.owner===i) st+=BUILD[b.type].power;
  for(const u of S.units) if(u.bot===i&&!u.boss&&!u.dead) ar+=UNITS[u.type].power;
  return {structure:st, army:ar, total:st+ar};
}
