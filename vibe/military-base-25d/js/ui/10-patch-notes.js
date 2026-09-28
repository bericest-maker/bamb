/* Military Base 2.5D — 10-patch-notes.js · the 📜 PATCHES panel (what changed in each build) */
'use strict';
// ================= UI: patch notes =================
const PATCH_NOTES = [
  { v:'v8.7 \u2014 RARITY AUDIT', date:'2026-09-27', items:[
    '\uD83D\uDCD6 ORIGINAL RARITIES CHECKED: entries that match the original unit/building lists now use their actual rarity. Fusion Reactor is LIMITED (pink), not MYTHIC (red).',
    'Corrected the directly matched rarity mismatches: Oil Drill EPIC; Iron Mines COMMON; Data Center MYTHIC; Research Lab LEGENDARY; Supply Depot RARE; Hydroponics Facility UNCOMMON; Alloy Foundry LEGENDARY; Offshore Oil Rig EPIC; Naval Beacon MYTHIC; Spectre MYTHIC.',
    'The rarity badge renders LIMITED as pink with the LIMITED label; new/remake-only items without an original source entry keep their existing rarity.',
  ]},
  { v:'v8.6 \u2014 LAND ROUTING', date:'2026-09-27', items:[
    '\uD83D\uDEE3\uFE0F BRIDGES ARE REAL LAND: water rescue now checks the exact point at bridge/coast cell edges, so a diagonal road cell sampled as water no longer bounces a soldier back to shore.',
    '\u2693 LAND TROOPS LEAVE THE OFFSHORE RIGS TO THE NAVY: ground armies no longer choose water-only RIG capture points as objectives; ships can still capture them as before.',
    'TESTED: a rifle crosses from the player island to the NE island over the bridge, a soldier stays put on a valid bridge cell, and ground AI ignores offshore RIGs.',
  ]},
  { v:'v8.5 \u2014 BUILD FLOW', date:'2026-09-27', items:[
    '\uD83E\uDDF1 KEEP PLACING: drop a building and the next one from your backpack stack is handed straight to the cursor \u2014 build a whole row without reopening the backpack. It stops (and tells you) when the stack is empty.',
    '\uD83E\uDDF1 SHIFT + DRAG = PLACE A RUN: hold SHIFT, press and drag out an area. Every footprint is previewed live (green where it fits, red where it is taken, floating at the stack level it would land on) with a \u201CN \u00d7 item \u2014 let go to place\u201D label, and they are all placed when you release. It stops at the last one you own.',
    '\uD83D\uDCE6 THE BACKPACK STAYS OPEN while you place \u2014 click the next card to switch building.',
    '\uD83D\uDCCB AUTO-SORT: the SHOP, the BACKPACK and both ADMIN lists are sorted automatically \u2014 best rarity at the top, worst at the bottom (crates first in the backpack).',
    '\uD83D\uDC0D THE WORM SURFACES IN THE MIDDLE (the CITY island) instead of a random base \u2014 and it FIGHTS: every 4.5s it SLAMS every enemy unit within 210px (45 damage) and crushes enemy buildings within 260px (130 damage), with a shockwave you can see.',
    '\uD83D\uDC0D ADMIN \u2192 CUSTOM BOSS HP: type 5000 / 250K / 1.5M and press SET HP. It sets the live worm AND every boss that spawns later. Leave it empty and press SET HP to go back to the default.',
    '\uD83D\uDC1C NO MORE UNIT COLLISION: troops never block each other \u2014 they only drift apart a little when they end up on top of each other (the don\u2019t-touch nudge), soldiers and ships alike. Columns no longer freeze on bridges.',
    '\uD83D\uDC1C NO MORE DROWNING: a soldier that ends up in the water is put straight back on the nearest shore.',
  ]},
  { v:'v8.4 \u2014 STACKS & CRATES', date:'2026-09-27', items:[
    '\uD83E\uDDF1 BUILDINGS STACK \u2014 AS HIGH AS YOU LIKE. Aim at a building you already own and the next one lands ON TOP of it instead of being refused. Each floor is lifted 24px and drawn above the one below; the ghost shows dashed drop-legs and a LEVEL n label so you can see which floor you are building, and clicking a stack picks the crate you actually aimed at.',
    'Every floor works on its own \u2014 4 barracks stacked 4 high train 4 recruits. Turrets, hospitals, depots and money buildings all stack too.',
    'Bots and the admin mass-fill still spread out first: they only climb a pile when your island has no free ground left.',
    '\uD83D\uDCE6 THE BACKPACK STACKS: identical items are now ONE card with an \u00d7N badge instead of forty separate cards. Placing a building takes one out of the stack.',
    '\uD83C\uDF81 OPEN CRATES IN BULK: click a crate stack and choose 1 / 5 / 10 / ALL. It rolls them all and lists everything you got, rarest first, with \u00d7counts and rarity colours.',
    '\uD83D\uDC8E THE ROBUX SHOP WORKS \u2014 the tab used to call a missing function and threw an error. It now sells Standard / Elite / Premium crates for cash, 1 or 10 at a time.',
    'Old saves: overlapping buildings are stacked instead of being returned to the backpack, and your old per-item backpack is folded into stacks.',
  ]},
  { v:'v8.3 \u2014 HARBOUR UPDATE', date:'2026-09-27', items:[
    '\u2693 YOUR WATER YARD: a buildable strip of sea BEHIND your island (832\u00d7224px, as wide as your base). Every dock, the Offshore Oil Rig and the Naval Beacon now go there \u2014 and your ships launch straight into it instead of walking to the coast.',
    '\u2693 4 NEW WATER CAPTURE POINTS \u2014 RIG NW / NE / SE / SW out in the ocean. Only ships can reach them and a held rig is garrisoned by gunboats. Like the outposts, each one you hold is +10% production.',
    '\uD83D\uDDD2\uFE0F BUILD GRID IS TWICE AS FINE: 16px cells \u2192 8px (104\u00d772 cells, your island is the same size).',
    '\uD83C\uDFE2 BUILDINGS ARE 3\u00d7 SMALLER (BLD_K 1.3 \u2192 0.433) \u2014 a Solar panel is 24px wide instead of 64px, so several times more of them fit on your island.',
    '\uD83D\uDD0D HOVER ANY TROOP to read its card: HP, damage, DPS, range, speed, troop-cap size, armour, detection, splash, aura, bounty, damage modifiers and what it is currently doing. It uses the spatial hash, so it stays instant in a 1000-unit battle, and the card is rebuilt ~2.5\u00d7/s instead of every frame.',
    '\u23F8 HOLD Q to freeze the battle \u2014 the camera, hover cards and every panel keep working while you look around. Release Q to resume.',
  ]},
  { v:'v8 \u2014 PERFORMANCE & PEACE UPDATE', date:'2026-09-27', items:[
    '\u26a1 BLOCK MODE (was POTATO MODE): \u2699 SETTINGS has two rows \u2014 UNIT GRAPHICS and BUILDING GRAPHICS, each Normal or Blocks. Blocks replaces every troop with a plain rectangle EXACTLY its sprite\u2019s size and every building with its footprint rectangle \u2014 just the owner\u2019s colour, nothing else (no shadows, no outlines). It is the single biggest frame-time win in the game.',
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
