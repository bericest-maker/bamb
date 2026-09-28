/* Military Base 2.5D — 03-state.js · state: S + defaultState + POINTS_DEFS */
'use strict';
// ================= state =================
let S = null;
let uid = 1;
const nid = ()=> uid++;
const SAVE_V = 4;   // v4 = radial map + 35 units (v1-v3 saves migrate on load)

// ================= settings (⚙ SETTINGS panel) =================
// v8: the graphics/perf rows. Every one of them is live — no reload needed.
//   gfx        High | Low    — Low drops particles, booms, the ocean glint, the lane glow and coastline detail
//   units      Normal | Blocks — Blocks draws every troop as one plain rectangle its sprite's exact size
//   blds       Normal | Blocks — the same for buildings: the footprint rectangle, nothing else
//   trees      on/off        — trees, rocks, grass patches and the floating crystals
//   botGrid    on/off        — dashed grid + name label over each enemy base (off = only their buildings/troops)
//   indestruct on/off        — buildings can never be damaged or sold (see damageBuilding)
function defaultSettings(){
  return {music:true, sfx:true, dmg:true, gfx:'High', units:'Normal', blds:'Normal', trees:true, botGrid:false, indestruct:true};
}
function defaultState(){
  return {
    v:SAVE_V, grid:SLOT, cash:500, rebirth:0, time:0, wave:0,   // grid = cell size the saved gx/gy use
    nextWave:90, nextBoss:180,
    buildings:[], units:[], waveAlert:0,   // waveAlert = seconds of "incoming raid" left (garrison on)
    points: POINTS_DEFS.map(p=>({...p, owner:'neutral', faction:-1, respawnT:8, cool:0})),
    inventory:[], stats:defaultStats(),
    rewards:{}, codes:{}, achievements:{}, premiumPity:0,
    settings:defaultSettings(),
    attackCity:false, placing:null,
    bankT:60,
    bots:[
      {preset:'standard',   down:false, downT:0, raidT:50},
      {preset:'fortified',  down:false, downT:0, raidT:65},
      {preset:'village',    down:false, downT:0, raidT:80},
      {preset:'standard',   down:false, downT:0, raidT:55},
      {preset:'scrap',      down:false, downT:0, raidT:90},
      {preset:'fortified',  down:false, downT:0, raidT:60},
      {preset:'industrial', down:false, downT:0, raidT:45},
    ],
    shopTab:'production', shopSub:'light',
  };
}
function defaultStats(){ return {kills:0, bosses:0, captures:0, tut:false, cratesOpened:0, placed:0}; }

// 5 capture points: 4 outpost islets between the spokes + the CITY (index 2 = CITY_IDX, kept for old saves)
// v8.3: the 4 RIGS are WATER points — only ships can reach them, and they are held by a boat garrison.
const RIG_ANGS = [-112.5,-22.5,67.5,157.5], RIG_R = 2100, RIG_NAMES = ['RIG NW','RIG NE','RIG SE','RIG SW'];
const POINTS_DEFS = [
  {id:0, name:'OUTPOST N', ...ringPos(OUTPOST_ANGS[0],OUTPOST_R), r:65,  garrison:3, tank:0, ang:OUTPOST_ANGS[0]},
  {id:1, name:'OUTPOST E', ...ringPos(OUTPOST_ANGS[1],OUTPOST_R), r:65,  garrison:3, tank:0, ang:OUTPOST_ANGS[1]},
  {id:2, name:'CITY',      x:MAP_C.x, y:MAP_C.y,                  r:130, garrison:4, tank:2, city:true},
  {id:3, name:'OUTPOST W', ...ringPos(OUTPOST_ANGS[2],OUTPOST_R), r:65,  garrison:3, tank:0, ang:OUTPOST_ANGS[2]},
  {id:4, name:'OUTPOST S', ...ringPos(OUTPOST_ANGS[3],OUTPOST_R), r:65,  garrison:3, tank:0, ang:OUTPOST_ANGS[3]},
  ...RIG_ANGS.map((a,i)=>({id:5+i, name:RIG_NAMES[i], ...ringPos(a,RIG_R), r:80, garrison:2, tank:0, ang:a, water:true})),
];
const CITY_IDX = 2;
