/* Military Base 2.5D — 02-data-world.js · world size, radial map layout (like ref-map-original.png), bot bases, bot presets */
'use strict';
// ================= data: world + map layout =================
// Layout copies the original map: 8 square plots on a ring around an octagon CITY,
// each plot with a small lobe island facing the middle, straight bridges (spokes) to the city,
// 4 outpost islets between the spokes and 4 floating water crystals in the other gaps.
const WORLD  = {w:4800, h:4800};   // v6: plots are rotated to face the city (like the original) → ring a bit wider so diamonds don't touch
const ISLAND = {x:60, y:60, w:WORLD.w-120, h:WORLD.h-120};   // camera clamp area
const SLOT   = 16;                                            // px per build-grid cell (v6: fine grid — 64 → 16; footprints come from each sprite's real size)
const GRID_K = 4;                                             // old coarse slot = 4×4 fine cells (presets + old saves are converted with this)
const PLOT_W = 52, PLOT_H = 36;                               // every plot is 52×36 cells (= 832×576 px, same land as before)
const MAP_C  = {x:WORLD.w/2, y:WORLD.h/2};                    // map centre = CITY
const RING   = 1700;                                          // distance city → plot centre
// forest margin around each build grid; taller than wide because the view squashes y to 72% → plots LOOK square
const PLOT_MX = 40, PLOT_MY = 168;   // v6: island is a 912×912 square in plot-local space (grid centred), rotated with the plot
const DEG    = Math.PI/180;
const ringPos = (angDeg, r) => ({x:MAP_C.x+Math.cos(angDeg*DEG)*r, y:MAP_C.y+Math.sin(angDeg*DEG)*r});
const plotTL  = angDeg => { const c=ringPos(angDeg,RING); return {x:Math.round(c.x-PLOT_W*SLOT/2), y:Math.round(c.y-PLOT_H*SLOT/2)}; };

// player plot = SOUTH (screen-down = +90°)
const plotRot = angDeg => (angDeg-90)*DEG;   // local 'up' (−y) always points at the city; player (south) = 0
const PLOT = {...plotTL(90), w:PLOT_W, h:PLOT_H, ang:90, rot:0};

// 7 bot bases on the ring (angles in degrees, 0 = east, 90 = south)
const BOT_DEFS = [
  {name:'BOT 1', dir:'NORTH',     ang:-90 },
  {name:'BOT 2', dir:'NORTHEAST', ang:-45 },
  {name:'BOT 3', dir:'EAST',      ang:0   },
  {name:'BOT 4', dir:'SOUTHEAST', ang:45  },
  {name:'BOT 5', dir:'SOUTHWEST', ang:135 },
  {name:'BOT 6', dir:'WEST',      ang:180 },
  {name:'BOT 7', dir:'NORTHWEST', ang:-135},
].map(b=>({...b, plot:{...plotTL(b.ang), rot:plotRot(b.ang)}, rot:plotRot(b.ang)}));

// outposts sit between spokes (like the original), crystals float in the other 4 gaps
const OUTPOST_ANGS = [-67.5, 22.5, -157.5, 112.5];   // N-ish, E-ish, W-ish, S-ish (order matches POINTS_DEFS)
const OUTPOST_R    = 760;
const CRYSTALS     = [-112.5, -22.5, 67.5, 157.5].map(a=>({...ringPos(a,900), ang:a}));

// Bot base presets: [buildingType, gx, gy] on the COARSE 13×9 layout (×GRID_K → fine cells; a free spot nearby is used if the real footprint doesn't fit)
const PRESETS = [
  {id:'empty',    label:'BASE 0 · EMPTY',           tier:0, b:[]},
  {id:'scrap',    label:'BASE 1 · SCRAP (BAD)',     tier:1, b:[['solar',1,1],['solar',3,1],['oil',5,1],['rock',2,4],['tree',8,4],['flag',10,2]]},
  {id:'village',  label:'BASE 2 · VILLAGE (POOR)',  tier:2, b:[['solar',1,1],['solar',3,1],['oil',5,1],['barracks',7,1],['data',1,3],['tree',10,4],['wall',7,0],['wall',8,0],['scouttower',4,3],['sandbags',10,6]]},
  {id:'standard', label:'BASE 3 · STANDARD (AVERAGE)',tier:3, b:[['oil',1,1],['oil',3,1],['data',5,1],['data',5,3],['barracks',8,1],['tankfac',8,3],['logistics',1,4],['depot',3,4],['wall',8,0],['wall',9,0],['wall',10,0],['flag',11,4],['pillbox',11,2],['atvtent',5,5]]},
  {id:'fortified',label:'BASE 4 · FORTIFIED (GOOD)',tier:4, b:[['data',1,1],['data',4,1],['oil',7,1],['research',9,1],['barracks',1,3],['tankfac',4,3],['heliport',7,3],['logistics',1,5],['depot',4,5],['wall',7,0],['wall',8,0],['wall',9,0],['wall',10,0],['wall',11,0],['flag',11,4],['pillbox',11,1],['radar',6,5],['apcdepot',1,7],['rocketrange',4,7]]},
  {id:'industrial',label:'BASE 5 · INDUSTRIAL (GREAT)',tier:5, b:[['industrial',1,1],['data',4,1],['research',7,1],['afbase',9,1],['barracks',1,4],['tankfac',4,4],['heliport',7,4],['logistics',1,6],['depot',4,6],['wall',0,0],['wall',1,0],['wall',2,0],['wall',3,0],['wall',9,0],['wall',10,0],['wall',11,0],['flag',11,6],['aaturret',12,3],['pillbox',12,1],['flakyard',1,7],['artypark',6,7],['cobrapad',9,6]]},
  {id:'mechlab',  label:'BASE 6 · MECH LAB (INSANE)',tier:6, b:[['industrial',1,1],['industrial',4,1],['mechi',7,1],['research',10,1],['afbase',1,4],['barracks',5,4],['tankfac',8,4],['heliport',10,4],['logistics',4,5],['depot',6,5],['wall',7,0],['wall',8,0],['wall',9,0],['flag',0,5],['cannon',1,7],['aaturret',12,1],['heavyarmory',4,7],['radar',8,7],['phantomgarage',10,7]]},
  {id:'golden',   label:'BASE 7 · GOLDEN UTOPIA (MAX)',tier:7, b:[['goldenTurbine',1,1],['goldenTurbine',3,1],['goldenTurbine',5,1],['goldenTurbine',7,1],['zeppeldock',9,1],['industrial',1,3],['industrial',4,3],['mechi',7,3],['goldenCrane',10,4],['afbase',1,5],['barracks',4,5],['tankfac',5,6],['goldenMechStat',11,6],['depot',9,6],['goldenBomb',0,1],['wall',7,0],['wall',8,0],['wall',9,0],['flag',0,6],['b2hangar',1,7],['railgunlab',5,7],['aaturret',12,2],['cannon',10,7],['hospital',10,5]]},
];
const PRESET_MAP = Object.fromEntries(PRESETS.map(p=>[p.id,p]));
const plotAt = (gx,gy)=> ({ x: PLOT.x + gx*SLOT, y: PLOT.y + gy*SLOT });
const plotOrigin = owner => owner==='p' ? PLOT : BOT_DEFS[owner].plot;
const plotRotOf = owner => owner==='p' ? 0 : BOT_DEFS[owner].rot;
// plot-local px (0,0 = grid top-left) → world, honouring the plot's rotation
function plotToWorld(owner,lx,ly){
  const o=plotOrigin(owner), r=plotRotOf(owner), hw=PLOT_W*SLOT/2, hh=PLOT_H*SLOT/2;
  const dx=lx-hw, dy=ly-hh, c=Math.cos(r), s=Math.sin(r);
  return {x:o.x+hw+dx*c-dy*s, y:o.y+hh+dx*s+dy*c};
}
// world → plot-local px (inverse of plotToWorld)
function worldToPlot(owner,x,y){
  const o=plotOrigin(owner), r=plotRotOf(owner), hw=PLOT_W*SLOT/2, hh=PLOT_H*SLOT/2;
  const dx=x-o.x-hw, dy=y-o.y-hh, c=Math.cos(r), s=Math.sin(r);
  return {x:hw+dx*c+dy*s, y:hh-dx*s+dy*c};
}
// anchor = footprint centre pushed down to the footprint's lowest screen point (bottom-centre when unrotated). caches b.x/b.y (+ b.cx/b.cy = centre)
function bPos(b){
  const owner=b.owner??"p", d=BUILD[b.type], r=plotRotOf(owner);
  const c=plotToWorld(owner,(b.gx+d.w/2)*SLOT,(b.gy+d.h/2)*SLOT);
  const ext=Math.abs(Math.sin(r))*d.w*SLOT+Math.abs(Math.cos(r))*d.h*SLOT;
  b.cx=c.x; b.cy=c.y; b.x=c.x; b.y=c.y+ext/2; return {x:b.x,y:b.y};
}
function botCenter(i){ const p=BOT_DEFS[i].plot; return {x:p.x+SLOT*PLOT_W/2, y:p.y+SLOT*PLOT_H/2}; }
const plotCentre = () => ({x:PLOT.x+PLOT.w*SLOT/2, y:PLOT.y+PLOT.h*SLOT/2});   // player plot centre (fixes the old PLOT.w*50 bug)
