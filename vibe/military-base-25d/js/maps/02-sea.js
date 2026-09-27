/* Military Base 2.5D — 02-sea.js · water lanes: the SEA grid, shipping lanes, ship navigation */
'use strict';
// ================= the ocean (maps: water lanes for the naval line) =================
// Everything that is NOT land is open water, so ships can in principle sail anywhere.
// On top of that the ocean now has real SHIPPING LANES (like the original's sea routes):
//   • a ring lane circling the CITY, between the outpost islets and the inner coast of the plots
//   • 8 radial lanes running out between the plots into the open sea
//   • an outer ring that ties the radial lanes together
// They are drawn as buoy lines, used as patrol routes and kept in the minimap.
const SEA_MARGIN = 2;                        // cells kept clear of the world edge
const SEA = new Uint8Array(GW*GH);
for(let gy=0;gy<GH;gy++) for(let gx=0;gx<GW;gx++)
  SEA[gy*GW+gx] = (gx>=SEA_MARGIN && gy>=SEA_MARGIN && gx<GW-SEA_MARGIN && gy<GH-SEA_MARGIN && !WALK[gy*GW+gx]) ? 1 : 0;

const isSeaAt = (x,y)=>{ const [cx,cy]=cellOf(x,y); return SEA[cy*GW+cx]===1; };
const seaCell = (x,y)=>{ const [cx,cy]=cellOf(x,y); return cy*GW+cx; };

// ---- lane geometry ----
const LANE_RING   = 955;    // inner ring: squeezed between the outpost islets (≤927) and the plot lobes (≥974)
const LANE_OUT    = 2320;   // how far the radial lanes reach
const LANE_OUTER  = 2260;   // outer ring that closes the loop (clears the plots, which reach r≈2178)
const LANE_SPOKES = [-157.5,-112.5,-67.5,-22.5,22.5,67.5,112.5,157.5];   // the 8 gaps between plots
const SEA_LANES = [];       // {ax,ay,bx,by} segments (polylines, so they draw as one path)
{ const N=64;
  for(let i=0;i<N;i++){
    const a=ringPos(i/N*360-180,LANE_RING), b=ringPos((i+1)/N*360-180,LANE_RING);
    SEA_LANES.push({ax:a.x,ay:a.y,bx:b.x,by:b.y,lane:'ring'});
  }
  for(let i=0;i<N;i++){
    const a=ringPos(i/N*360-180,LANE_OUTER), b=ringPos((i+1)/N*360-180,LANE_OUTER);
    SEA_LANES.push({ax:a.x,ay:a.y,bx:b.x,by:b.y,lane:'outer'});
  }
  for(const ang of LANE_SPOKES){
    const a=ringPos(ang,LANE_RING), b=ringPos(ang,LANE_OUT);
    SEA_LANES.push({ax:a.x,ay:a.y,bx:b.x,by:b.y,lane:'spoke'});
  }
}
// buoys: every 4th vertex of the ring lanes (drawn as little floats)
const SEA_BUOYS=[];
for(let i=0;i<32;i++){
  const a=(i/32)*360-180;
  for(const p of [{...ringPos(a,LANE_RING), ph:i*0.7},{...ringPos(a+5.6,LANE_OUTER), ph:i*0.7+1.3}])
    if(!walkableAt(p.x,p.y)) SEA_BUOYS.push(p);      // never plant a buoy on an island
}

// ---- nearest water to a point (spawning ships, coastal approach) ----
function nearestSea(x,y,maxR=40){
  const [cx0,cy0]=cellOf(x,y);
  if(SEA[cy0*GW+cx0]) return {x,y};
  for(let r=1;r<=maxR;r++) for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue;
    const nx=cx0+dx, ny=cy0+dy;
    if(nx<0||ny<0||nx>=GW||ny>=GH) continue;
    if(SEA[ny*GW+nx]) return {x:nx*CELL+CELL/2, y:ny*CELL+CELL/2};
  }
  return null;
}
// where a ship should stand to shell a LAND target: the closest water to it (cached per target cell)
const COAST_CACHE=new Map();
function coastGoal(tx,ty){
  const [cx,cy]=cellOf(tx,ty);
  if(SEA[cy*GW+cx]) return {x:tx,y:ty};
  const k=cy*GW+cx;
  let g=COAST_CACHE.get(k);
  if(!g){ g=nearestSea(tx,ty) || {x:tx,y:ty}; if(COAST_CACHE.size>4000) COAST_CACHE.clear(); COAST_CACHE.set(k,g); }
  return g;
}
// ---- A* on the water ----
const seaAstar = (sx,sy,tx,ty) => astar(sx,sy,tx,ty,SEA);
