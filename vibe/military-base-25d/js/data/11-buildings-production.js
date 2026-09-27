/* Military Base 2.5D — 11-buildings-production.js · 9 more steps of the production ladder + Money Capacity for all of them */
'use strict';
// ================= data: production ladder (part 2) =================
// The original has 48 money buildings; these 9 fill the gaps above the Skyscraper/Fusion step.
Object.assign(BUILD, {
  advsolar:   {name:'Advanced Solar Array', tab:'production', cost:6000,     w:2,h:1, income:14,   power:90,    rar:'uncommon', hp:320,  info:'$14/s • bigger panels, same sunshine'},
  hydro:      {name:'Hydroponics Facility', tab:'production', cost:12000,    w:2,h:1, income:24,   power:180,   rar:'rare',     hp:400,  info:'$24/s • salads for the whole army', req:800},
  gastank:    {name:'Gas Storage Tank',     tab:'production', cost:28000,    w:2,h:2, income:52,   power:420,   rar:'rare',     hp:700,  info:'$52/s • big tank, big money', req:2000},
  alloy:      {name:'Alloy Foundry',        tab:'production', cost:90000,    w:2,h:2, income:150,  power:1400,  rar:'epic',     hp:1400, info:'$150/s • melts anything', req:8000},
  offshore:   {name:'Offshore Oil Rig',     tab:'production', cost:260000,   w:2,h:2, income:420,  power:4500,  rar:'legend',   hp:1800, info:'$420/s • drills under the lagoon', req:25000},
  navalbeacon:{name:'Naval Beacon',         tab:'production', cost:600000,   w:2,h:2, income:900,  power:12000, rar:'legend',   hp:2000, info:'$900/s • lights up the shipping lanes', req:60000},
  particle:   {name:'Particle Accelerator', tab:'production', cost:1500000,  w:3,h:2, income:2200, power:32000, rar:'legend',   hp:2600, info:'$2,200/s • science that pays', req:150000},
  campus:     {name:'Corporate Campus',     tab:'production', cost:5000000,  w:3,h:2, income:6500, power:95000, rar:'myth',     hp:3200, info:'$6,500/s • quarterly war profits', req:500000},
  automated:  {name:'Automated Factory',    tab:'production', cost:14000000, w:3,h:3, income:16000,power:280000,rar:'myth',     hp:4000, info:'$16,000/s • no workers, no strikes', req:1500000},
});

// ================= Money Capacity (the original's ResourceProduction.Capacity) =================
// Every money building now STORES what it earns instead of dropping it straight into your wallet:
//   • stored cash fills up to `cap` (≈10 minutes of production, like the original's CapacityMinutes=10)
//   • it is paid out automatically every `cycle` seconds — or the moment you click the building
//   • the BANK pays its 5% on STORED cash, so a full base of fat buildings earns real interest
const MONEY_CYCLE = 30;   // seconds between automatic payouts
for(const [id,cap] of Object.entries({
  solar:600, wind:1200, oil:2400, ironmine:3000, steel:6000, data:9000, cookie:3600,
  refinery:19000, powerplant:33000, research:27000, industrial:72000, skyscraper:190000,
  fusion:600000, goldenTurbine:240000, monument:360000,
  advsolar:9000, hydro:15000, gastank:33000, alloy:90000, offshore:250000,
  navalbeacon:600000, particle:1400000, campus:4000000, automated:10000000,
})) if(BUILD[id]){ BUILD[id].cap=cap; BUILD[id].cycle=MONEY_CYCLE; }
