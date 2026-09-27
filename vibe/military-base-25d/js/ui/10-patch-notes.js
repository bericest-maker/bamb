/* Military Base 2.5D — 10-patch-notes.js · the 📜 PATCHES panel (what changed in each build) */
'use strict';
// ================= UI: patch notes =================
const PATCH_NOTES = [
  { v:'v7 \u2014 NAVAL UPDATE', date:'2026-09-27', items:[
    'Codebase split into folders \u2014 core, data, textures, maps, units, buildings, systems, rewards, achievements, render, ui, admin (same load order, nothing lost).',
    '\u2693 NAVAL LINE: Speedboat, Gunboat, Frigate, Submarine, Zumwalt, Battleship, Carrier \u2014 7 ships with their own dock buildings and a \u2693 NAVAL shop tab.',
    'WATER LANES: a ring of shipping lanes around the CITY, 8 lanes out to the open sea and an outer loop. Ships sail them; land units ignore them.',
    'MONEY CAPACITY: every money building stores what it earns (up to its Capacity) and pays out every 30s \u2014 or the instant you click the building.',
    'BANK reworked: it now pays 5% of the cash STORED inside your buildings (was a flat 5% of your wallet).',
    'WAVE-DEFENSE GARRISON: while a raid is incoming every unit building trains FREE defenders of its own type. They stand down when the base is safe.',
    'STRUCTURE POWER split from army power \u2014 the leaderboard shows both.',
    'KILL BOUNTIES scale with the victim: wave HP buff \u00d7 unit tier (a Mammoth pays far more than a Rifleman).',
    'Unit FOOTPRINTS now matter when spawning: recruits look for a free spot their own size instead of stacking on the building.',
    'New units: Light Tank, Mantis, TIGR, Swarm Drone, PZH 2000, Leopard 2A5, ICBM Launcher, Centurion (UNIQUE), F-15, F-35, SU-47, KA-52 and the OFFICER (support: +25% damage to nearby allies).',
    'New buildings: 9 more steps of the production ladder (Advanced Solar \u2192 Automated Factory), 20 new unit buildings incl. Submarine Cavern + Centurion Support Site, and Airship Docks (Zeppelin).',
  ]},
  { v:'v6 \u2014 RADIAL MAP', date:'2026-09-26', items:[
    'Plots are rotated to face the city, fine 16px build grid, footprints sized from each model.',
  ]},
  { v:'v5 \u2014 SIZE & PERF', date:'2026-09-25', items:[
    'Units are drawn in proportion to their troop size, sprite cache + spatial hash, admin quantity spawns.',
  ]},
  { v:'v4 \u2014 BIG UPDATE', date:'2026-09-25', items:[
    'Radial island map from ref-map-original.png, 35 units with the original damage-modifier system, one building per unit, achievements, leaderboard.',
  ]},
];
function renderPatchNotes(){
  const list=$('#patchList'); if(!list) return;
  list.innerHTML='';
  for(const p of PATCH_NOTES){
    const head=document.createElement('div');
    head.className='rw-item done';
    head.innerHTML=`<div class="rw-ico">\uD83D\uDCDC</div><div class="rw-mid"><div class="rw-name">${p.v}</div><div class="rw-sub">${p.date}</div></div>`;
    list.appendChild(head);
    for(const it of p.items){
      const el=document.createElement('div');
      el.className='rw-item';
      el.innerHTML=`<div class="rw-ico">\u2022</div><div class="rw-mid"><div class="rw-sub">${it}</div></div>`;
      list.appendChild(el);
    }
  }
}
