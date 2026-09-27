/* Military Base 2.5D — 09-units-naval.js · the NAVAL line: ships (sea:true → they sail the water lanes) */
'use strict';
// ================= data: naval units =================
// sea:true  → the unit moves on the SEA grid (maps/02-sea.js) and shoots the shore from the water.
//             Land units can't reach it, air can; big guns out-range most coastal defences.
// Ships keep the ORIGINAL classes (Gunboat/Frigate/Battleship/Carrier = Armored · Submarine/Zumwalt = Stealth),
// so the counter system still works: Rocket Trooper ×1.5 vs armored, stealth needs detection…
Object.assign(UNITS, {
  speedboat:  {name:'Sentinel Speedboat', cls:['light'],   rar:'uncommon', hp:45,  dmg:14, rate:1.6, range:190, speed:150, size:1, power:260,   reward:120,  sea:true, mods:{air:0,stealth:0,light:.7}},
  gunboat:    {name:'Gunboat',            cls:['armored'], rar:'rare',     hp:110, dmg:12, rate:0.8, range:240, speed:135, size:2, power:620,   reward:210,  sea:true, armor:3,  mods:{air:0,stealth:0,light:.7}},
  frigate:    {name:'Frigate',            cls:['armored'], rar:'epic',     hp:460, dmg:18, rate:0.8, range:300, speed:110, size:3, power:2700,  reward:420,  sea:true, armor:6,  mods:{stealth:1,light:.7}},
  submarine:  {name:'Submarine',          cls:['stealth'], rar:'myth',     hp:520, dmg:46, rate:1.7, range:360, speed:105, size:4, power:9000,  reward:950,  sea:true, armor:6,  bld:1.5, mods:{air:0,stealth:1}},
  zumwalt:    {name:'Zumwalt',            cls:['stealth'], rar:'myth',     hp:460, dmg:40, rate:1.7, range:320, speed:105, size:3, power:7500,  reward:800,  sea:true, armor:8,  mods:{stealth:1}},
  battleship: {name:'Battleship',         cls:['armored'], rar:'myth',     hp:2400,dmg:34, rate:0.9, range:400, speed:72,  size:6, power:14000, reward:1500, sea:true, armor:14, splash:70, mods:{air:.5,stealth:0}},
  carrier:    {name:'Carrier',            cls:['armored'], rar:'myth',     hp:2600,dmg:40, rate:1.4, range:380, speed:68,  size:7, power:18000, reward:1900, sea:true, armor:12, mods:{stealth:0}},
});
// ships are the only units that may stand on water
const NAVAL_UNITS = Object.keys(UNITS).filter(k=>UNITS[k].sea);
