/* Military Base 2.5D — 01-achievements-data.js · the achievement list: ico, desc, progress fn, payout */
'use strict';
const ACHIEVEMENTS = [
  {id:'build1',  ico:'🏗️', name:'Groundbreaker',     desc:'Place your first building',      prog:()=>[S.stats.placed,1],       give:{cash:500}},
  {id:'build25', ico:'🏙️', name:'Urban Planner',     desc:'Place 25 buildings',             prog:()=>[S.stats.placed,25],      give:{cash:25000}},
  {id:'cap1',    ico:'🚩', name:'Flag Planter',      desc:'Capture a point',                prog:()=>[S.stats.captures,1],     give:{cash:5000}},
  {id:'allpts',  ico:'🗺️', name:'Map Control',       desc:'Hold all 5 points at once',      prog:()=>[S.points.filter(p=>p.owner==='player').length,5], give:{crate:'elite'}},
  {id:'kill100', ico:'💥', name:'Centurion',         desc:'Defeat 100 enemies',             prog:()=>[S.stats.kills,100],      give:{cash:20000}},
  {id:'kill1k',  ico:'☠️', name:'War Machine',       desc:'Defeat 1,000 enemies',           prog:()=>[S.stats.kills,1000],     give:{crate:'premium'}},
  {id:'boss1',   ico:'🐍', name:'Worm Slayer',       desc:'Defeat the MECHA WORM',          prog:()=>[S.stats.bosses,1],       give:{cash:10000}},
  {id:'boss5',   ico:'🐉', name:'Worm Hunter',       desc:'Defeat the MECHA WORM 5 times',  prog:()=>[S.stats.bosses,5],       give:{crate:'premium'}},
  {id:'classes', ico:'🎖️', name:'Combined Arms',     desc:'Field all 4 unit classes at once',prog:()=>[CLASSES.filter(c=>S.units.some(u=>u.side==='p'&&!u.boss&&UNITS[u.type].cls.includes(c))).length,4], give:{cash:50000}},
  {id:'pow10k',  ico:'⭐', name:'Rising Power',      desc:'Reach 10,000 military power',    prog:()=>[S._power||0,10000],      give:{cash:10000}},
  {id:'pow100k', ico:'🌟', name:'Superpower',        desc:'Reach 100,000 military power',   prog:()=>[S._power||0,100000],     give:{crate:'premium'}},
  {id:'pow1m',   ico:'💫', name:'Hegemon',           desc:'Reach 1,000,000 military power', prog:()=>[S._power||0,1000000],    give:{crate:'golden'}},
  {id:'reb1',    ico:'🔥', name:'Born Again',        desc:'Rebirth once',                   prog:()=>[S.rebirth,1],            give:{cash:100000}},
  {id:'reb3',    ico:'🔥', name:'Phoenix',           desc:'Rebirth 3 times',                prog:()=>[S.rebirth,3],            give:{crate:'premium'}},
  {id:'reb5',    ico:'☄️', name:'Eternal',           desc:'Rebirth 5 times',                prog:()=>[S.rebirth,5],            give:{crate:'golden'}},
];
