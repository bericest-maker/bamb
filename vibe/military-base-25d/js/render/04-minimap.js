/* Military Base 2.5D — 04-minimap.js · minimap: islands, plots, points, units, camera rect */
'use strict';
function miniPoly(rf,cx,cy,sx,sy){
  mctx.beginPath();
  for(let a=0;a<=28;a++){ const th=a/28*pi2, r=rf(th); const px=(cx+Math.cos(th)*r)*sx, py=(cy+Math.sin(th)*r)*sy; a?mctx.lineTo(px,py):mctx.moveTo(px,py); }
  mctx.closePath(); mctx.fill();
}
function drawMini(){
  const mw=mini.width,mh=mini.height, sx=mw/WORLD.w, sy=mh/WORLD.h;
  mctx.fillStyle='#2a7fd0'; mctx.fillRect(0,0,mw,mh);
  // shipping lanes
  mctx.strokeStyle='rgba(180,235,255,.35)'; mctx.lineWidth=.8; mctx.setLineDash([2,3]);
  mctx.beginPath();
  for(const l of SEA_LANES){ mctx.moveTo(l.ax*sx,l.ay*sy); mctx.lineTo(l.bx*sx,l.by*sy); }
  mctx.stroke(); mctx.setLineDash([]);
  // bridges
  mctx.strokeStyle='rgba(156,132,98,.95)'; mctx.lineWidth=1.6;
  mctx.beginPath();
  for(const b of BRIDGES){ mctx.moveTo(b.ax*sx,b.ay*sy); mctx.lineTo(b.bx*sx,b.by*sy); }
  mctx.stroke();
  // islands
  mctx.fillStyle='#69a54e';
  for(let i=0;i<MAP_PLOTS.length;i++){
    const c=plotCenter(MAP_PLOTS[i]), L=LOBES[i];
    miniPoly(th=>plotRadius(i,th),c.x,c.y,sx,sy); miniPoly(th=>lobeRadius(i,th),L.x,L.y,sx,sy);
  }
  miniPoly(cityRadius,CITY_ISL.x,CITY_ISL.y,sx,sy);
  POINTS_DEFS.forEach((p,i)=>{ if(!p.city&&!p.water) miniPoly(th=>isletRadius(i,th),p.x,p.y,sx,sy); });
  // plot squares: yours highlighted, bots in faction colour (red if rebuilding)
  for(let i=0;i<MAP_PLOTS.length;i++){
    const p=MAP_PLOTS[i];
    mctx.fillStyle = i===0 ? 'rgba(255,224,138,.55)' : (S.bots[i-1].down ? 'rgba(239,83,80,.75)' : hexA(facC(i),.35));
    const own=i===0?'p':i-1; mctx.beginPath();   // v6: rotated plot squares
    for(const [lx,ly] of [[0,0],[PLOT_W*SLOT,0],[PLOT_W*SLOT,PLOT_H*SLOT],[0,PLOT_H*SLOT]]){ const q=plotToWorld(own,lx,ly); mctx.lineTo(q.x*sx,q.y*sy); }
    mctx.closePath(); mctx.fill();
  }
  // v8.3: your water yard (behind your island)
  { const Y=WATER_YARD, sx2=mw/WORLD.w, sy2=mh/WORLD.h;
    mctx.fillStyle='rgba(88,200,232,.35)'; mctx.fillRect(Y.x*sx2,Y.y*sy2,Y.w*SLOT*sx2,Y.h*SLOT*sy2); }
  // crystals
  mctx.fillStyle='#bff3ff'; for(const c of CRYSTALS){ mctx.fillRect(c.x*sx-1.5,c.y*sy-1.5,3,3); }
  // points (owner faction color)
  for(const p of S.points){
    const f=pointFaction(p);
    mctx.fillStyle=f<0?'#a0aab4':facC(f);
    mctx.beginPath(); mctx.arc(p.x*sx,p.y*sy,3,0,pi2); mctx.fill();
  }
  // units (faction color)
  for(const u of S.units){
    if(u.boss){ mctx.fillStyle='#ef5350'; mctx.beginPath(); mctx.arc(u.x*sx,u.y*sy,3.5,0,pi2); mctx.fill(); }
    else { mctx.fillStyle=facC(u.faction); mctx.fillRect(u.x*sx-1,u.y*sy-1,2,2); }
  }
  // camera rect
  const vb=viewBounds();
  mctx.strokeStyle='rgba(255,255,255,.8)'; mctx.lineWidth=1;
  mctx.strokeRect((cam.x-W/2/cam.z)*sx,(cam.y-H/2/(cam.z*.72))*sy,(W/cam.z)*sx,(H/(cam.z*.72))*sy);
}
