/* Military Base 2.5D — 10-units-expansion.js · the missing P2 heavies, P3 specialists + the UNIQUE Centurion */
'use strict';
// ================= data: expansion units =================
// P2 heavies (Light Tank, ICBM Launcher, Leopard 2A5, PZH 2000) · P1 stragglers (Mantis, TIGR, Swarm Drone)
// P3 specialists (F-15, F-35, SU-47, KA-52, Officer) · the UNIQUE trophy unit (Centurion).
// Officer is the only SUPPORT unit: 0 damage, but `buff` gives every ally in radius +25% damage.
Object.assign(UNITS, {
  // ----- LIGHT (support / swarm) -----
  officer:    {name:'Officer',     cls:['light'],   rar:'myth',    hp:90,  dmg:0,   rate:1.0, range:190, speed:95,  size:2, power:1800,  reward:300,  mods:{}, buff:{dmg:1.25, r:280}},
  swarmdrone: {name:'Swarm Drone', cls:['light'],   rar:'limited', hp:55,  dmg:5,   rate:0.55,range:200, speed:170, size:1, power:2400,  reward:450,  mods:{stealth:0,light:1.2}, fly:true},
  // ----- ARMORED -----
  lighttank:  {name:'Light Tank',  cls:['armored'], rar:'epic',    hp:380, dmg:14,  rate:1.7, range:250, speed:75,  size:3, power:900,   reward:200,  armor:6,  mods:{air:.8,stealth:0,light:.8}},
  mantis:     {name:'Mantis',      cls:['armored'], rar:'legend',  hp:220, dmg:30,  rate:1.7, range:260, speed:105, size:3, power:1600,  reward:400,  armor:4,  mods:{air:1.2,stealth:0,light:.8}},
  tigr:       {name:'TIGR',        cls:['armored'], rar:'legend',  hp:260, dmg:10,  rate:1.0, range:170, speed:120, size:2, power:1300,  reward:350,  armor:4,  mods:{stealth:0}},
  pzh:        {name:'PZH 2000',    cls:['armored'], rar:'myth',    hp:240, dmg:150, rate:10,  range:440, speed:66,  size:3, power:9000,  reward:1000, armor:3,  splash:90,  mods:{air:0,stealth:0}},
  leopard:    {name:'Leopard 2A5', cls:['armored'], rar:'myth',    hp:620, dmg:70,  rate:3.3, range:260, speed:98,  size:4, power:11000, reward:1300, armor:10, mods:{air:0,stealth:0}},
  icbm:       {name:'ICBM Launcher',cls:['armored'],rar:'limited', hp:320, dmg:260, rate:14,  range:470, speed:62,  size:5, power:22000, reward:2800, armor:4,  splash:120, mods:{air:0,stealth:0,armored:1.2}},
  centurion:  {name:'Centurion',   cls:['armored'], rar:'unique',  hp:3200,dmg:1400,rate:8,   range:520, speed:60,  size:8, power:150000,reward:25000,armor:20, splash:120, mods:{}},
  // ----- AIR -----
  f15:        {name:'F-15 Eagle',  cls:['air'],     rar:'legend',  hp:90,  dmg:26,  rate:1.33,range:210, speed:200, size:2, power:2200,  reward:550,  mods:{air:1.2,stealth:1,light:.8}, detect:280},
  f35:        {name:'F-35 Lightning',cls:['air'],   rar:'limited', hp:100, dmg:24,  rate:0.83,range:240, speed:235, size:2, power:4500,  reward:800,  mods:{stealth:1}, detect:300},
  su47:       {name:'SU-47 Berkut',cls:['air'],     rar:'myth',    hp:70,  dmg:40,  rate:1.7, range:240, speed:245, size:2, power:6000,  reward:900,  mods:{stealth:1}},
  ka52:       {name:'KA-52 Alligator',cls:['air'],  rar:'myth',    hp:210, dmg:16,  rate:0.83,range:300, speed:135, size:3, power:7000,  reward:950,  mods:{stealth:1}, armor:4},
});
