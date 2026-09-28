/* Military Base 2.5D — 07-unit-buildings.js · one building per unit (depot/hangar/pad/lab…) + shop tabs */
'use strict';
// ----- UNIT BUILDINGS: one per unit, grouped by class (shop UNITS → LIGHT / ARMORED / AIR / STEALTH) -----
// [id, unit, name, cost, spawnEvery(s), power, w, h, req, hp, style]   (style = generated sprite template)
const UNIT_BUILDINGS = [
  // LIGHT
  ['barracks',      'rifle',      'Barracks',               1500,     8,  150,    2,1, 0,      400,  null],
  ['scouttower',    'scout',      'Scout Watchtower',       1200,     8,  120,    1,1, 0,      300,  'tower'],
  ['atvtent',       'atv',        'ATV Tent',               3000,    12,  250,    2,1, 0,      350,  'tent'],
  ['snipernest',    'sniper',     'Sniper Nest',            5000,    14,  450,    1,1, 500,    300,  'tower'],
  ['commandocamp',  'commando',   'Commando Camp',          9000,    14,  700,    2,1, 1000,   500,  'tent'],
  ['motorpool',     'humvee',     'Motor Pool',             12000,   15,  800,    2,2, 1500,   700,  'garage'],
  ['rocketrange',   'rocket',     'Rocket Range',           15000,   16,  950,    2,1, 2000,   600,  'bunker'],
  ['medtent',       'medic',      'Medic Tent',             18000,   20,  1100,   2,1, 2500,   500,  'tent'],
  ['rangerpost',    'ranger',     'Ranger Outpost',         30000,   18,  2000,   2,2, 5000,   900,  'barracks'],
  ['dronehub',      'drone',      'Drone Hub',              80000,   20,  4500,   2,2, 12000,  900,  'lab'],
  // ARMORED
  ['heavybarracks', 'hinf',       'Heavy Barracks',         4000,    12,  450,    2,1, 300,    600,  'barracks'],
  ['tankfac',       'tank',       'Tank Factory',           6000,    15,  600,    2,1, 0,      700,  null],
  ['apcdepot',      'apc',        'APC Depot',              14000,   16,  1200,   2,2, 2000,   900,  'garage'],
  ['flakyard',      'flak',       'Flak Yard',              16000,   18,  1400,   2,1, 2500,   800,  'garage'],
  ['aabattery',     'aav',        'AA Battery Works',       45000,   22,  3500,   2,2, 8000,   1000, 'factory'],
  ['artypark',      'arty',       'Artillery Park',         55000,   24,  4200,   2,2, 10000,  1000, 'garage'],
  ['heavyarmory',   'heavy',      'Heavy Armory',           150000,  30,  15000,  3,2, 25000,  1800, 'factory'],
  ['mechi',         'mech',       'Mech Bay',               600000,  40,  60000,  3,3, 50000,  2000, null],
  ['mammothworks',  'mammoth',    'Mammoth Works',          1200000, 50,  120000, 3,3, 120000, 2600, 'factory'],
  ['railgunlab',    'railgun',    'Secret Weapons Facility',2000000, 55,  160000, 3,2, 180000, 2400, 'lab'],
  // AIR
  ['heliport',      'heli',       'Heliport',               25000,   20,  2500,   2,2, 2000,   1000, null],
  ['hueypad',       'huey',       'Huey Pad',               30000,   22,  3000,   2,2, 3000,   900,  'pad'],
  ['cobrapad',      'cobra',      'Cobra Hangar',           70000,   24,  7000,   2,2, 8000,   1100, 'hangar'],
  ['afbase',        'jet',        'Air Force Base',         120000,  25,  12000,  3,2, 10000,  1500, null],
  ['blackhawkpad',  'blackhawk',  'Blackhawk Helipad',      160000,  28,  16000,  2,2, 20000,  1300, 'pad'],
  ['a10strip',      'a10',        'A-10 Airstrip',          220000,  30,  20000,  3,2, 30000,  1600, 'hangar'],
  ['raptorhangar',  'f22',        'Raptor Hangar',          380000,  30,  32000,  3,2, 45000,  1700, 'hangar'],
  ['pentagon',      'ac130',      'Pentagon',               800000,  45,  70000,  3,3, 80000,  2600, 'pentagon'],
  ['bomberbase',    'b52',        'Bomber Base',            1000000, 50,  90000,  3,2, 100000, 2200, 'hangar'],
  ['zeppeldock',    'zeppelin',   'Airship Docks',          1500000, 60,  150000, 3,2, 150000, 2500, null],
  // STEALTH
  ['stealthlab',    'spectre',    'Stealth Bay',            15000,   22,  3000,   2,2, 3000,   800,  null],
  ['saboteurcamp',  'saboteur',   'Sentinel Training Center',250000, 30,  22000,  2,2, 35000,  1200, 'lab'],
  ['phantomgarage', 'phantom',    'Phantom Garage',         450000,  35,  40000,  2,2, 50000,  1500, 'garage'],
  ['monitoring',    'stealthheli','Monitoring Center',      600000,  35,  50000,  2,2, 70000,  1500, 'pad'],
  ['b2hangar',      'b2',         'B-2 Stealth Hangar',     2500000, 60,  200000, 3,2, 200000, 2600, 'hangar'],
];
for(const [id,unit,name,cost,every,power,w,h,req,hp,style] of UNIT_BUILDINGS){
  const ud=UNITS[unit];
  const sub = ud.cls.includes('stealth') ? 'stealth' : ud.cls[0];
  BUILD[id]={name, tab:'units', sub, cost, w, h, unit, spawnEvery:every, power, rar:ud.rar, hp, style,
    info:`Trains a ${ud.name} every ${every}s`, ...(req?{req}:{})};
}
const SHOP_TABS = [['production','PRODUCTION'],['units','UNITS'],['special','SPECIAL'],['decor','DECOR']];
const SHOP_SUBS = [...CLASSES,'sea']; // sub-tabs inside UNITS (sea = the naval line)
