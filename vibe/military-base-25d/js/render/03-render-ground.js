/* Military Base 2.5D — 03-render-ground.js · ocean, islands, bridges, trees, crystals, grids, capture pads */
'use strict';
function islandPoly(rf,cx,cy,extra=0){
  ctx.beginPath();
  // v8 perf: on EFFECTS = Low the coastline is drawn with 28 segments instead of 72 (invisible at normal zoom)
  const N=((S&&S.settings&&S.settings.gfx)==='Low')?28:72;
  for(let a=0;a<=N;a++){
    const th=a/N*pi2, r=rf(th)+extra;
    const px=cx+Math.cos(th)*r, py=cy+Math.sin(th)*r;
    a?ctx.lineTo(px,py):ctx.moveTo(px,py);
  }
  ctx.closePath();
}
function drawTree(t){
  ctx.save(); ctx.translate(t.x,t.y); ctx.scale(t.s,t.s);
  ctx.fillStyle='rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(2,3,10,4,0,0,pi2); ctx.fill();
  ctx.fillStyle='#6b4a2f'; ctx.fillRect(-2,-6,4,8);
  if(t.k){ // pine
    ctx.fillStyle='#2f6a34'; ctx.beginPath(); ctx.moveTo(-10,-4); ctx.lineTo(0,-30); ctx.lineTo(10,-4); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#3b7d3a'; ctx.beginPath(); ctx.moveTo(-7,-14); ctx.lineTo(0,-32); ctx.lineTo(7,-14); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle='#3e7a34'; ctx.beginPath(); ctx.arc(0,-14,10,0,pi2); ctx.fill();
    ctx.fillStyle='#4a8c3d'; ctx.beginPath(); ctx.arc(-4,-19,7,0,pi2); ctx.fill();
    ctx.beginPath(); ctx.arc(5,-18,6,0,pi2); ctx.fill();
  }
  ctx.restore();
}
// land = sand rim + grass (drawn with a radius function)
function landShape(rf,cx,cy){
  ctx.fillStyle='#d9c68a'; islandPoly(rf,cx,cy,13); ctx.fill();
  ctx.fillStyle='#69a54e'; islandPoly(rf,cx,cy); ctx.fill();
}
function drawBridges(list,w){
  ctx.lineCap='butt';
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=w+10;           // shadow in the water
  ctx.beginPath(); for(const b of list){ ctx.moveTo(b.ax,b.ay+8); ctx.lineTo(b.bx,b.by+8); } ctx.stroke();
  ctx.strokeStyle='#6b5a44'; ctx.lineWidth=w+6;                    // side beams
  ctx.beginPath(); for(const b of list){ ctx.moveTo(b.ax,b.ay); ctx.lineTo(b.bx,b.by); } ctx.stroke();
  ctx.strokeStyle='#9c8462'; ctx.lineWidth=w;                      // deck
  ctx.beginPath(); for(const b of list){ ctx.moveTo(b.ax,b.ay); ctx.lineTo(b.bx,b.by); } ctx.stroke();
  ctx.strokeStyle='rgba(60,45,30,.35)'; ctx.lineWidth=2; ctx.setLineDash([3,11]);   // planks
  ctx.beginPath(); for(const b of list){ ctx.moveTo(b.ax,b.ay); ctx.lineTo(b.bx,b.by); } ctx.stroke();
  ctx.setLineDash([]);
}
// the naval water lanes: a dashed route + floating buoys (maps/02-sea.js)
function drawSeaLanes(t,vb,hiFX){
  ctx.save();
  if(hiFX!==false){   // v8: the wide glow is skipped on EFFECTS = Low
    ctx.strokeStyle='rgba(160,225,255,.20)'; ctx.lineWidth=26; ctx.lineCap='round';
    ctx.beginPath();
    for(const l of SEA_LANES){ if(!inView((l.ax+l.bx)/2,(l.ay+l.by)/2,320,vb)) continue; ctx.moveTo(l.ax,l.ay); ctx.lineTo(l.bx,l.by); }
    ctx.stroke();
  }
  ctx.strokeStyle='rgba(190,240,255,.42)'; ctx.lineWidth=2; ctx.setLineDash([12,14]);
  ctx.beginPath();
  for(const l of SEA_LANES){ if(!inView((l.ax+l.bx)/2,(l.ay+l.by)/2,320,vb)) continue; ctx.moveTo(l.ax,l.ay); ctx.lineTo(l.bx,l.by); }
  ctx.stroke(); ctx.setLineDash([]);
  for(const b of SEA_BUOYS){
    if(!inView(b.x,b.y,40,vb)) continue;
    const bob=Math.sin(t*2+b.ph)*2.5;
    ctx.fillStyle='rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(b.x,b.y+7,7,3,0,0,pi2); ctx.fill();
    ctx.fillStyle='#e0a32e'; ctx.beginPath(); ctx.arc(b.x,b.y+bob,5,0,pi2); ctx.fill();
    ctx.fillStyle='#fff2c9'; ctx.beginPath(); ctx.arc(b.x,b.y+bob-5.5,2,0,pi2); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1; ctx.stroke();
  }
  ctx.restore();
}
function drawCrystal(c,t){
  const bob=Math.sin(t*1.4+c.ang)*6;
  ctx.fillStyle='rgba(120,220,255,.18)'; ctx.beginPath(); ctx.ellipse(c.x,c.y+26,34,11,0,0,pi2); ctx.fill();
  ctx.save(); ctx.translate(c.x,c.y-30+bob);
  ctx.fillStyle='#7fe3ff'; ctx.beginPath(); ctx.moveTo(0,-38); ctx.lineTo(18,0); ctx.lineTo(0,38); ctx.lineTo(-18,0); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#bff3ff'; ctx.beginPath(); ctx.moveTo(0,-38); ctx.lineTo(6,0); ctx.lineTo(0,38); ctx.lineTo(-18,0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,-38); ctx.lineTo(18,0); ctx.lineTo(0,38); ctx.lineTo(-18,0); ctx.closePath(); ctx.stroke();
  ctx.fillStyle=`rgba(255,255,255,${.4+.4*Math.sin(t*3+c.ang)})`; ctx.beginPath(); ctx.arc(-5,-12,3,0,pi2); ctx.fill();
  ctx.restore();
}
const inView=(x,y,r,vb)=> !(x<vb.x0-r||x>vb.x1+r||y<vb.y0-r||y>vb.y1+r);
function drawGround(vb){
  const t=performance.now()/1000;
  const set=(S&&S.settings)||{};               // v8: the graphics settings are read fresh every frame
  const deco=set.trees!==false;                // TREES & DECOR (grass patches, rocks, trees, crystals)
  const hiFX=set.gfx!=='Low';                  // EFFECTS High → wave glints + the wide lane glow
  // ocean + soft wave glints
  ctx.fillStyle='#2a7fd0';
  ctx.fillRect(vb.x0,vb.y0,vb.x1-vb.x0,vb.y1-vb.y0);
  if(hiFX){
    ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=2;
    ctx.beginPath();
    for(let y=Math.floor(vb.y0/160)*160;y<vb.y1;y+=160) for(let x=Math.floor(vb.x0/220)*220;x<vb.x1;x+=220){
      const ox=((x*7+y*3)%90)+Math.sin(t+x*.01)*8; ctx.moveTo(x+ox,y+((x/220)%2)*80); ctx.lineTo(x+ox+26,y+((x/220)%2)*80); }
    ctx.stroke();
  }
  // shipping lanes (water lanes for the naval line)
  drawSeaLanes(t,vb,hiFX);
  // bridges under the land (spokes + outpost links)
  drawBridges(BRIDGES,BRIDGE_W*2-6);
  // outpost islets
  for(let i=0;i<POINTS_DEFS.length;i++){
    const pt=POINTS_DEFS[i]; if(pt.city||!inView(pt.x,pt.y,220,vb)) continue;
    landShape(th=>isletRadius(i,th),pt.x,pt.y);
  }
  // plot islands (0 = player, 1-7 = bots) + their lobes
  for(let i=0;i<MAP_PLOTS.length;i++){
    const p=MAP_PLOTS[i], cx=p.x+PLOT_HW, cy=p.y+PLOT_HH, L=LOBES[i];
    if(!inView(cx,cy,800,vb)) continue;
    ctx.fillStyle='#d9c68a'; islandPoly(th=>plotRadius(i,th),cx,cy,13); ctx.fill(); islandPoly(th=>lobeRadius(i,th),L.x,L.y,13); ctx.fill();
    ctx.fillStyle='#69a54e'; islandPoly(th=>plotRadius(i,th),cx,cy); ctx.fill(); islandPoly(th=>lobeRadius(i,th),L.x,L.y); ctx.fill();
    // build grid pad — v8: YOUR plot only. The other bases are just buildings + troops now.
    if(i===0){ ctx.fillStyle='rgba(255,255,255,.05)'; plotRectPath('p',0,0,PLOT_W*SLOT,PLOT_H*SLOT); ctx.fill(); }
  }
  // central city island (octagon)
  if(inView(CITY_ISL.x,CITY_ISL.y,420,vb)){
    landShape(cityRadius,CITY_ISL.x,CITY_ISL.y);
    // 8 roads from the plaza to the bridges
    ctx.strokeStyle='#8a8f96'; ctx.lineWidth=40; ctx.beginPath();
    for(const b of BRIDGES) if(b.spoke){ const dx=b.bx-b.ax, dy=b.by-b.ay, l=Math.hypot(dx,dy); ctx.moveTo(b.ax,b.ay); ctx.lineTo(b.ax+dx/l*CITY_ISL.r*1.02,b.ay+dy/l*CITY_ISL.r*1.02); }
    ctx.stroke();
    ctx.fillStyle='#9aa0a6'; ctx.beginPath(); ctx.arc(CITY_ISL.x,CITY_ISL.y,155,0,pi2); ctx.fill();
  }
  // floating crystals · terrain patches · rocks · trees (v8: ⚙ SETTINGS → TREES & DECOR hides them all)
  if(deco){
    for(const c of CRYSTALS) if(inView(c.x,c.y,80,vb)) drawCrystal(c,t);
    for(const p of PATCHES){
      if(!inView(p.x,p.y,p.r,vb)) continue;
      ctx.fillStyle=p.c; ctx.beginPath(); ctx.ellipse(p.x,p.y,p.r,p.r*.6,0,0,pi2); ctx.fill();
    }
    ctx.fillStyle='#8a8f96';
    for(const r of ROCKS){ if(!inView(r.x,r.y,30,vb)) continue; ctx.beginPath(); ctx.ellipse(r.x,r.y,14*r.s,8*r.s,0,0,pi2); ctx.fill(); }
    for(const tr of TREES){
      if(!inView(tr.x,tr.y,40,vb)) continue;
      drawTree(tr);
    }
  }
  // player plot grid + label
  { const p=MAP_PLOTS[0], w=PLOT.w*SLOT, h=PLOT.h*SLOT;
    // v6 fine grid: faint line every 16px cell, stronger every 4 cells
    for(const [step,col,lw] of [[1,'rgba(255,255,255,.16)',.8],[GRID_K,'rgba(255,255,255,.3)',1.2]]){
      ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.beginPath();
      for(let gx=step;gx<PLOT.w;gx+=step){ if(step===1&&gx%GRID_K===0) continue; ctx.moveTo(p.x+gx*SLOT,p.y); ctx.lineTo(p.x+gx*SLOT,p.y+h); }
      for(let gy=step;gy<PLOT.h;gy+=step){ if(step===1&&gy%GRID_K===0) continue; ctx.moveTo(p.x,p.y+gy*SLOT); ctx.lineTo(p.x+w,p.y+gy*SLOT); }
      ctx.stroke();
    }
    ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1.5; ctx.strokeRect(p.x,p.y,w,h);
    ctx.fillStyle='#ffe08a'; ctx.font='900 15px "Segoe UI"'; ctx.textAlign='center';
    ctx.fillText('⬆ YOUR BASE',p.x+w/2,p.y-26);
  }
  // bot plot outlines + labels — v8: OFF by default (⚙ SETTINGS → ENEMY BASE GRIDS to bring them back).
  // You see what matters: their buildings and their troops.
  if(set.botGrid) for(let i=0;i<MAP_PLOTS.length;i++){
    if(i===0) continue;
    const p=MAP_PLOTS[i], w=PLOT_W*SLOT, h=PLOT_H*SLOT, bd=BOT_DEFS[i-1], bb=S.bots[i-1];   // fixed: was 12×7 (old plot size)
    ctx.strokeStyle=bb.down?'rgba(239,83,80,.9)':hexA(facC(i),.55); ctx.lineWidth=2.5; ctx.setLineDash([10,7]);
    plotRectPath(i-1,0,0,w,h); ctx.stroke();   // v6: rotated with the plot
    ctx.setLineDash([]);
    // labels stay upright, centred above / below the rotated grid
    const cx=p.x+w/2, cy=p.y+h/2, r=MAP_PLOTS[i].rot, ext=(Math.abs(Math.sin(r))*w+Math.abs(Math.cos(r))*h)/2;
    ctx.fillStyle=hexA(facC(i),.95); ctx.font='900 14px "Segoe UI"'; ctx.textAlign='center';
    ctx.fillText(`BOT ${i} · ${facN(i)} (${bd.dir})`,cx,cy-ext-20);
    ctx.fillStyle='rgba(255,255,255,.55)'; ctx.font='700 10px "Segoe UI"';
    ctx.fillText((PRESET_MAP[S.bots[i-1].preset]||PRESETS[0]).label,cx,cy+ext+22);
    if(bb.down){
      ctx.fillStyle='rgba(13,18,25,.75)'; ctx.fillRect(cx-80,cy-11,160,20);
      ctx.fillStyle='#ef5350'; ctx.font='900 12px "Segoe UI"';
      ctx.fillText(`REBUILDING ${Math.max(0,Math.ceil(bb.downT))}s`,cx,cy+3);
    }
  }
  // capture pads (owner color)
  for(const p of S.points){
    const f=pointFaction(p);
    const c=f<0?'#a0aab4':facC(f);
    ctx.fillStyle='#9aa0a6'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,pi2); ctx.fill();
    ctx.fillStyle=hexA(c,.14); ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,pi2); ctx.fill();
    ctx.strokeStyle=hexA(c,.9); ctx.lineWidth=5; ctx.beginPath(); ctx.arc(p.x,p.y,p.r-4,0,pi2); ctx.stroke();
  }
}
