/* Military Base 2.5D — 05-unit-helpers.js · class helpers: unitDef/unitCls/isAir/isStealth/unitSize/modVs/modFor/canHurt/unitScale */
'use strict';
// ---- class helpers ----
const unitDef   = u => u.boss ? BOSS : UNITS[u.type];
const unitCls   = u => unitDef(u).cls;
const isAir     = u => !u.boss && (UNITS[u.type].cls.includes('air') || !!UNITS[u.type].fly);
const isStealth = u => !u.boss && UNITS[u.type].cls.includes('stealth');
const isSea     = u => !u.boss && !!UNITS[u.type].sea;   // ships: they sail the water lanes (maps/02-sea.js)
const unitArmor = u => unitDef(u).armor||0;
const unitDetect= u => u.boss ? 0 : UNITS[u.type].detect||0;
const unitSize  = u => u.boss ? 0 : UNITS[u.type].size||1;
// damage multiplier of attacker definition `ad` vs a target with classes `tcls`
function modVs(ad,tcls){
  const m=(ad&&ad.mods)||{};
  let best=0, any=false;
  for(const c of tcls){
    const v = m[c]===undefined ? 1 : m[c];
    if(v===0) return 0;
    best=Math.max(best,v); any=true;
  }
  return any?best:1;
}
// unit-vs-unit modifier (attacker object may be a plain {side} stub → ×1)
function modFor(a,t){
  if(!a||(!a.boss&&!UNITS[a.type])) return 1;
  return modVs(unitDef(a),unitCls(t));
}
const canHurt = (a,t) => (unitDef(a).dmg||0)>0 && modFor(a,t)>0;
// visual height of a unit sprite above its feet (HP bar / tracer aim)
// v5: units are drawn bigger in proportion to their troop size (size 1 = ×1.15 … size 5 = ×1.75)
const unitScale = u => u.boss ? 1 : 1.15+.15*(unitSize(u)-1);
const unitTop = u => u.boss ? 34 : (isAir(u) ? 40 : (14+unitSize(u)*5)*unitScale(u));
// radius a unit occupies on the ground (footprint) — used for spawn spacing + separation
const unitRadius = u => u.boss ? 22 : 9+5*unitSize(u);
// the bounty for killing a unit: scales with the WAVE hp buff and with the unit's own tier (power)
function killReward(u){
  if(u.boss) return BOSS.reward;
  const d=UNITS[u.type]; if(!d) return 0;
  const hpScale=u.maxHp/(d.hp||1);                        // buffed waves pay more
  const tier=1+Math.min(2,(d.power||0)/40000);            // ×1 (rifleman) … ×3 (Centurion)
  return Math.max(1,Math.round((d.reward||0)*hpScale*tier));
}
