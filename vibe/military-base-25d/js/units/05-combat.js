/* Military Base 2.5D — 05-combat.js · damage (class modifiers + armor), kills, building damage, kill payouts */
'use strict';
// support aura: an Officer nearby gives every ally +25% damage
function auraFor(u){
  if(!u||u.faction==null) return 1;
  let m=1;
  for(const a of AURA[u.faction]||[]) if(Math.hypot(u.x-a.x,u.y-a.y)<=a.r) m=Math.max(m,a.mult);
  return m;
}
function damageUnit(t,from,dmg){
  if(t.dead) return;                                 // v5: already killed this frame (also stops double kill rewards from splash)
  if(S.admin&&S.admin.god&&t.side==='p') return; // admin god mode
  const m=modFor(from,t);                          // class damage modifier (×0 … ×2)
  if(m===0) return;
  dmg=Math.max(1,dmg*m*auraFor(from)-unitArmor(t));   // aura, then flat armor, min 1
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
      // BOUNTY scales with the kill: the wave HP buff × the unit's own tier (data/05-unit-helpers.js)
      const bounty=killReward(u);
      S.cash+=bounty;
      S.stats.kills++;
      addFloat(u.x,u.y-16,'+'+fmt(bounty)+'$','#8fe08f');
    }
  }
  if(u.side==='p' && selUnits.includes(u)) selUnits=selUnits.filter(x=>x.id!==u.id);
}
// v8: buildings are PERMANENT by default. Nothing — raids, the MECHA WORM, artillery — can knock one down,
// and you can't sell/demolish your own by right-clicking either (see the right-click handler in ui/09-input.js).
// Switch it off in ⚙ SETTINGS → INDESTRUCTIBLE BUILDINGS to get destructible bases (and the sell refund) back.
const indestructible = () => !!(S && S.settings && S.settings.indestruct);
function damageBuilding(b,from,dmg){
  if(S.admin&&S.admin.god&&isMine(b)) return; // admin god mode protects YOUR base (fixed: used to make bots immortal too)
  if(b.dead) return;
  if(indestructible()) return;                // v8: permanent buildings — no damage, no destruction, no reward
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
