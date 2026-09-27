/* Military Base 2.5D — 10-patch-notes.js · the 📜 PATCHES panel (what changed in each build) */
'use strict';
// ================= UI: patch notes =================
const PATCH_NOTES = [
  { v:'v8 \u2014 PERFORMANCE & PEACE UPDATE', date:'2026-09-27', items:[
    '\u26a1 POTATO MODE: \u2699 SETTINGS has two new rows \u2014 UNIT GRAPHICS and BUILDING GRAPHICS, each Normal or Potato. Potato replaces every troop/building with one coloured blob (drawn 1.45\u00d7 bigger in x and y so crowds stay readable). It is the single biggest frame-time win in the game.',
    '\u2699 TREES & DECOR toggle \u2014 hide the trees, rocks, grass patches and floating crystals.',
    '\u2699 EFFECTS High/Low (was GRAPHICS MODE) \u2014 Low also drops the ocean glints, the lane glow and halves the coastline detail.',
    '\uD83D\uDEAB BUILDINGS ARE PERMANENT: nothing can destroy a building any more (raids, the worm, artillery) and right-click no longer sells your own. \u2699 SETTINGS \u2192 INDESTRUCTIBLE BUILDINGS turns destructible bases (and the 50% refund) back on.',
    '\uD83D\uDCCF THE WORLD IS TWICE AS BIG: 4800\u2192 9600 px, base ring 1700\u2192 2600. Islands sit far apart with wide ocean between them \u2014 the march to the middle is a real journey and ships have room to sail. Shipping lanes, outposts, crystals and the city all scaled with it.',
    '\u2694\uFE0F NO MORE ATTACKING PEOPLE AT THEIR SPAWN: units only pick a fight when the enemy is CLOSE (AGGRO.march 210px). Snipers and artillery used to shell your base from 320-430px away while marching past \u2014 now they walk on. Units that HOLD a position (garrisons, base defenders, idle troops) keep their full reach.',
    '\uD83C\uDFAF IDLE TROOPS MARCH ON THE MIDDLE: with no order your army heads for the CITY (then the nearest point you don\u2019t own) and fights what it meets on the way, instead of beelining for somebody\u2019s base.',
    '\uD83D\uDDD1\uFE0F ENEMY BASES: their build grids, dashed outlines and name labels are hidden now \u2014 you see their buildings and their troops, nothing else. \u2699 SETTINGS \u2192 ENEMY BASE GRIDS brings the labels back.',
    '\uD83D\uDD0D YOU CAN ZOOM OUT TO SEE THE WHOLE MAP: the zoom-out limit is now whatever fits the 9600px world in your window (MINZ, recomputed on resize) instead of a fixed 0.5\u00d7. Zoom all the way out and the camera locks to the map centre so nothing is cut off.',
    'Map load got cheaper: the land test rejects most of the (now 57 600) walk cells with a bounding box before any trigonometry.',
  ]},
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
