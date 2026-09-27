/* Military Base 2.5D — 06-buildings.js · production / special / decor buildings (cost, income, power, hp, rules) */
'use strict';
// ================= data: buildings =================
// fields: name, tab (production|units|special|decor), cost (null = crate only), w/h (grid slots),
//   income ($/s), power, rar, hp, info, req (military power needed), unit + spawnEvery (unit buildings),
//   special: 'logistics'|'depot'|'bank'|'radar'|'hospital' · turret:{dmg,rate,range,mods} (defence tower)
//   detect (radar px) · heal (hp/s, radius healR) · max (placement cap) · reqRebirth · keep (survives rebirth)
//   style (sprite template for generated unit buildings)
const BUILD = {
  // ----- PRODUCTION (12 buyable + 2 special) -----
  solar:      {name:'Solar Array',       tab:'production', cost:300,    w:1,h:1, income:1,   power:3,    rar:'common',   hp:150,  info:'$1/s passive income'},
  wind:       {name:'Wind Turbine',      tab:'production', cost:650,    w:1,h:1, income:2,   power:6,    rar:'common',   hp:160,  info:'$2/s — spins in the sea breeze'},
  oil:        {name:'Oil Drill',         tab:'production', cost:1000,   w:1,h:1, income:4,   power:10,   rar:'common',   hp:250,  info:'$4/s passive income'},
  ironmine:   {name:'Iron Mines',        tab:'production', cost:1600,   w:1,h:1, income:5,   power:14,   rar:'uncommon', hp:300,  info:'$5/s — dig dig dig'},
  steel:      {name:'Steel Factory',     tab:'production', cost:3500,   w:2,h:1, income:10,  power:30,   rar:'uncommon', hp:420,  info:'$10/s', req:100},
  data:       {name:'Data Center',       tab:'production', cost:5000,   w:2,h:1, income:15,  power:50,   rar:'rare',     hp:400,  info:'$15/s passive income'},
  cookie:     {name:'Cookie Stand',      tab:'production', cost:8000,   w:1,h:1, income:6,   power:20,   rar:'rare',     hp:200,  info:'$6/s • who needs a cookie stand in a military base?'},
  refinery:   {name:'Refinery',          tab:'production', cost:12000,  w:2,h:1, income:32,  power:120,  rar:'rare',     hp:600,  info:'$32/s', req:1000},
  powerplant: {name:'Power Plant',       tab:'production', cost:22000,  w:2,h:2, income:55,  power:220,  rar:'rare',     hp:900,  info:'$55/s', req:1250},
  research:   {name:'Research Lab',      tab:'production', cost:25000,  w:2,h:2, income:45,  power:250,  rar:'epic',     hp:800,  info:'$45/s • looks smart'},
  industrial: {name:'Industrial Drill',  tab:'production', cost:60000,  w:2,h:2, income:120, power:600,  rar:'legend',   hp:1200, info:'$120/s • legendary money machine', req:3000},
  skyscraper: {name:'Skyscraper',        tab:'production', cost:180000, w:2,h:2, income:320, power:2000, rar:'legend',   hp:1600, info:'$320/s • corporate HQ of war', req:20000},
  fusion:     {name:'Fusion Reactor',    tab:'production', cost:600000, w:2,h:2, income:1000,power:8000, rar:'myth',     hp:2400, info:'$1,000/s • tiny sun, big money', req:100000},
  goldenTurbine:{name:'Golden Wind Turbine',tab:'production', cost:null,w:1,h:1, income:400,power:12000, rar:'gold',     hp:2000, info:'$400/s • survives rebirth • crate only'},

  // ----- SPECIAL (9) -----
  logistics:  {name:'Logistics Warehouse',tab:'special',  cost:2500,   w:2,h:1, income:0,   power:25,   rar:'common',   hp:300,  special:'logistics', max:5, info:'+10% total income (max 5 count)'},
  depot:      {name:'Supply Depot',      tab:'special',  cost:2000,   w:1,h:1, income:0,   power:20,   rar:'common',   hp:300,  special:'depot', info:'+10 troop capacity (max 100)'},
  pillbox:    {name:'Pillbox',           tab:'special',  cost:8000,   w:1,h:1, income:0,   power:400,  rar:'uncommon', hp:900,  turret:{dmg:10,rate:1.0,range:260,mods:{air:0,stealth:0}}, info:'Defence turret • shoots ground units (not air)'},
  radar:      {name:'Radar Station',     tab:'special',  cost:20000,  w:1,h:1, income:0,   power:800,  rar:'rare',     hp:500,  special:'radar', detect:450, info:'Reveals STEALTH enemies within 450px for your army'},
  aaturret:   {name:'SAM Site',          tab:'special',  cost:30000,  w:1,h:1, income:0,   power:1500, rar:'epic',     hp:700,  turret:{dmg:22,rate:1.2,range:380,mods:{air:1.5,armored:0,light:0}}, info:'Anti-air turret • only shoots AIR', req:2000},
  hospital:   {name:'Field Hospital',    tab:'special',  cost:40000,  w:2,h:1, income:0,   power:1000, rar:'epic',     hp:800,  special:'hospital', heal:10, healR:320, info:'Heals your units within 320px (10 hp/s)', req:3000},
  cannon:     {name:'Fortress Cannon',   tab:'special',  cost:120000, w:2,h:1, income:0,   power:6000, rar:'legend',   hp:2200, turret:{dmg:70,rate:3.0,range:380,mods:{air:0,stealth:0,armored:1.3},splash:60}, info:'Heavy defence gun • splash, great vs armor', req:20000},
  bank:       {name:'Bank',              tab:'special',  cost:250000, w:2,h:1, income:0,   power:3000, rar:'legend',   hp:1500, special:'bank', max:3, info:'Every 60s pays 5% of your cash (max $50k each, max 3)', req:15000},
  monument:   {name:'Monument',          tab:'special',  cost:500000, w:2,h:2, income:600, power:2500, rar:'rebirth',  hp:2500, reqRebirth:1, keep:true, info:'$600/s • needs 1 rebirth • survives rebirth'},

  // ----- DECOR (10 buyable + 3 golden) -----
  tree:       {name:'Pine Tree',         tab:'decor',    cost:150,    w:1,h:1, income:0,   power:1,    rar:'common', hp:100,  info:'Cosmetic. Protects moths.'},
  rock:       {name:'Rock',              tab:'decor',    cost:150,    w:1,h:1, income:0,   power:1,    rar:'common', hp:100,  info:'Cosmetic. Very natural.'},
  flowers:    {name:'Flower Bed',        tab:'decor',    cost:180,    w:1,h:1, income:0,   power:1,    rar:'common', hp:80,   info:'Cosmetic. Soldiers need nice things too.'},
  flag:       {name:'Flag',              tab:'decor',    cost:200,    w:1,h:1, income:0,   power:2,    rar:'common', hp:100,  info:'Cosmetic. Wave it with pride.'},
  wall:       {name:'Wall',              tab:'decor',    cost:250,    w:1,h:1, income:0,   power:10,   rar:'common', hp:600,  info:'Soaks up enemy fire.'},
  sandbags:   {name:'Sandbags',          tab:'decor',    cost:300,    w:1,h:1, income:0,   power:8,    rar:'common', hp:500,  info:'Cheap cover. Soaks up enemy fire.'},
  barrels:    {name:'Fuel Barrels',      tab:'decor',    cost:400,    w:1,h:1, income:0,   power:3,    rar:'common', hp:120,  info:'Cosmetic. Definitely not flammable.'},
  lamp:       {name:'Lamp Post',         tab:'decor',    cost:500,    w:1,h:1, income:0,   power:3,    rar:'uncommon',hp:120, info:'Cosmetic. Glows a little.'},
  fountain:   {name:'Fountain',          tab:'decor',    cost:5000,   w:1,h:1, income:0,   power:40,   rar:'rare',   hp:400,  info:'Cosmetic. Very fancy.'},
  statue:     {name:'Eagle Statue',      tab:'decor',    cost:25000,  w:1,h:1, income:0,   power:200,  rar:'epic',   hp:800,  info:'Cosmetic. Majestic.'},
  goldenCrane:  {name:'Golden Crane',       tab:'decor', cost:null, w:2,h:1, income:0, power:12000, rar:'gold', hp:2000, info:'Golden decor • crate only'},
  goldenBomb:   {name:'Golden Nuclear Bomb',tab:'decor', cost:null, w:1,h:1, income:0, power:12000, rar:'gold', hp:2000, info:'Golden decor • crate only'},
  goldenMechStat:{name:'Golden Mech Statue', tab:'decor',cost:null, w:1,h:1, income:0, power:12000, rar:'gold', hp:2000, info:'Golden decor • crate only'},
};
