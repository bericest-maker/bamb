/* Military Base 2.5D — 03-classes.js · unit classes (light/armored/air/stealth) + their colours/labels */
'use strict';
// ================= data: units =================
// CLASSES (from the original game): a unit can hold several.
//   light   — infantry / light vehicles
//   armored — tanks, APCs, mechs (also get flat `armor`)
//   air     — flies straight over water (no pathfinding)
//   stealth — invisible + untargetable unless DETECTED (detect range, radar, in combat, or <70px)
// DAMAGE MODIFIERS  mods:{class:multiplier}  vs the TARGET's classes.
//   missing = ×1 · 0 = CANNOT damage that class (unit won't even target it)
//   multi-class target: if any class is 0 → 0, otherwise the best (highest) multiplier applies.
// Other fields: rate = seconds per shot · size = troop-cap slots used · detect = stealth sensor px
//   heal = hp/s to nearby allies (medic) · splash = area radius px (50% dmg) · bld = ×dmg vs buildings
//   fly = moves like air but keeps its class (Drone is Light — anti-air can't touch it)
const CLASSES = ['light','armored','air','stealth'];
const CLASS_INFO = {
  light:  {ico:'🪖', label:'LIGHT',   col:'#8fd47a'},
  armored:{ico:'🛡️', label:'ARMORED', col:'#c9a86b'},
  air:    {ico:'✈️', label:'AIR',     col:'#7fc4ff'},
  stealth:{ico:'👻', label:'STEALTH', col:'#c79bff'},
  sea:    {ico:'⚓', label:'NAVAL',   col:'#58c8e8'},   // not a combat class — shop sub-tab for ships
};
