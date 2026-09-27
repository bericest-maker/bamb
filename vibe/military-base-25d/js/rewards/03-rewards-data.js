/* Military Base 2.5D — 03-rewards-data.js · the checklist of one-time rewards (tutorial, kills, boss, playtime) */
'use strict';
const REWARDS = [
  {id:'tut',  ico:'📖', name:'Complete the tutorial', sub:'Learn the ropes',           reward:'$100',      give:{cash:100},       check:()=>S.stats.tut},
  {id:'play', ico:'⏱', name:'Play 60 seconds',       sub:'Stay for a minute',          reward:'$1,000',    give:{cash:1000},     check:()=>S.time>=60},
  {id:'k10',  ico:'💥', name:'Defeat 10 enemies',     sub:'Kill 10 hostile units',      reward:'$2,500',    give:{cash:2500},     check:()=>S.stats.kills>=10},
  {id:'cap1', ico:'🚩', name:'Capture a point',       sub:'Take any capture point',     reward:'$5,000',    give:{cash:5000},     check:()=>S.stats.captures>=1},
  {id:'boss', ico:'🐍', name:'Defeat the MECHA WORM', sub:'Slay the giant',             reward:'Premium Crate',give:{crate:'premium'}, check:()=>S.stats.bosses>=1},
  {id:'p10',  ico:'🕐', name:'Play 10 minutes',       sub:'You dedicated one',          reward:'Standard Crate',give:{crate:'standard'},check:()=>S.time>=600},
];