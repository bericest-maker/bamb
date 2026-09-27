/* Military Base 2.5D — 12-buildings-expansion.js · one building per new unit (naval line + heavies/specialists/Centurion) */
'use strict';
// ================= data: unit buildings (part 2) =================
// [id, unit, name, cost, spawnEvery(s), power, w, h, req, hp, style]
const UNIT_BUILDINGS_NAVAL = [
  ['speedboatdock',  'speedboat',  'Speedboat Dock',        9000,      10,  700,    2,1, 600,     500,  'dock'],
  ['gunboatpier',    'gunboat',    'Gunboat Pier',          22000,     14,  1800,   2,1, 2000,    700,  'dock'],
  ['frigatedock',    'frigate',    'Frigate Dock',          70000,     20,  6000,   3,1, 8000,    1000, 'dock'],
  ['submarinecavern','submarine',  'Submarine Cavern',      300000,    35,  26000,  3,2, 40000,   1500, 'dock'],
  ['zumwaltdock',    'zumwalt',    'Zumwalt Drydock',       450000,    40,  40000,  3,2, 60000,   1600, 'dock'],
  ['battleshipyard', 'battleship', 'Battleship Yard',       900000,    50,  90000,  3,2, 120000,  2200, 'dock'],
  ['carrieryard',    'carrier',    'Carrier Dock',          2000000,   70,  200000, 3,3, 300000,  3000, 'dock'],
];
const UNIT_BUILDINGS_EXPANSION = [
  // P1 stragglers
  ['mantisbay',      'mantis',     'Mantis Bay',            60000,     22,  5000,   2,2, 8000,    1000, 'garage'],
  ['tigrgarage',     'tigr',       'TIGR Garage',           55000,     20,  4600,   2,2, 7000,    950,  'garage'],
  ['swarmhive',      'swarmdrone', 'Swarm Hive',            250000,    12,  22000,  2,2, 30000,   1100, 'lab'],
  // P2 heavies
  ['lighttankfac',   'lighttank',  'Light Tank Factory',    25000,     20,  2200,   2,2, 2500,    900,  'factory'],
  ['pzhbattery',     'pzh',        'PZH Artillery Battery', 500000,    40,  55000,  2,2, 70000,   1600, 'bunker'],
  ['leopardworks',   'leopard',    'Leopard Works',         700000,    45,  70000,  3,2, 90000,   2000, 'factory'],
  ['icbmsilo',       'icbm',       'ICBM Silo',             1200000,   55,  110000, 2,2, 130000,  2400, 'silo'],
  // P3 specialists
  ['f15hangar',      'f15',        'F-15 Hangar',           150000,    26,  14000,  3,2, 15000,   1500, 'hangar'],
  ['ka52pad',        'ka52',       'KA-52 Helipad',         200000,    24,  20000,  2,2, 25000,   1300, 'pad'],
  ['f35hangar',      'f35',        'F-35 Hangar',           400000,    28,  36000,  3,2, 50000,   1700, 'hangar'],
  ['su47hangar',     'su47',       'SU-47 Hangar',          650000,    30,  60000,  3,2, 80000,   1800, 'hangar'],
  ['officeracademy', 'officer',    'Officer Academy',       180000,    30,  16000,  2,2, 20000,   1200, 'barracks'],
  // UNIQUE
  ['centurionsite',  'centurion',  'Centurion Support Site',25000000,  180, 600000, 3,3, 2000000, 6000, 'lab'],
];
for(const list of [UNIT_BUILDINGS_NAVAL, UNIT_BUILDINGS_EXPANSION])
for(const [id,unit,name,cost,every,power,w,h,req,hp,style] of list){
  const ud=UNITS[unit];
  const sub = ud.sea ? 'sea' : (ud.cls.includes('stealth') ? 'stealth' : ud.cls[0]);
  BUILD[id]={name, tab:'units', sub, cost, w, h, unit, spawnEvery:every, power, rar:ud.rar, hp, style,
    info:`Trains a ${ud.name} every ${every}s`, ...(req?{req}:{})};
}
