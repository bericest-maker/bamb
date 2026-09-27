/* Military Base 2.5D — 01-render.js · the frame: y-sorted drawables, fx, selection, placement ghost */
'use strict';
// ================= render =================
const mini=$('#mini'), mctx=mini.getContext('2d');
// v5: a building's picture fills its footprint (w slots wide) — "stuff is ACTUALLY its size"
const bScale = type => BLD_K;   // v6: every model is drawn at the same scale; its footprint was sized from the model (see 08c)
// path a plot-local rectangle (px, grid top-left origin) in world space — follows the plot's rotation
function plotRectPath(owner,x,y,w,h){
  const a=plotToWorld(owner,x,y), b=plotToWorld(owner,x+w,y), c=plotToWorld(owner,x+w,y+h), d=plotToWorld(owner,x,y+h);
  ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.lineTo(c.x,c.y); ctx.lineTo(d.x,d.y); ctx.closePath();
}
let miniT=-1e9;
function render(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle='#2a7fd0'; ctx.fillRect(0,0,W,H);
  ctx.setTransform(DPR*cam.z,0,0,DPR*cam.z*.72,DPR*(W/2-cam.x*cam.z),DPR*(H/2-cam.y*cam.z*.72));

  const vb=viewBounds();
  drawGround(vb);

  // drawables
  const items=[];
  for(const b of S.buildings){
    const c=bPos(b);
    if(c.x<vb.x0||c.x>vb.x1||c.y<vb.y0||c.y>vb.y1) continue;
    items.push({y:c.y,kind:'b',b,x:c.x});
  }
  for(const u of S.units){
    if(u.x<vb.x0||u.x>vb.x1||u.y<vb.y0||u.y>vb.y1) continue;
    items.push({y:u.y,kind:'u',u});
  }
  for(const p of S.points){
    if(p.x<vb.x0||p.x>vb.x1||p.y<vb.y0||p.y>vb.y1) continue;
    items.push({y:p.y,kind:'flag',p});
  }
  items.sort((a,b)=>a.y-b.y);

  for(const it of items){
    if(it.kind==='b'){
      const d=BUILD[it.b.type], sp=SPR[it.b.type];
      const bs=bScale(it.b.type), s=depth(it.y)*bs;   // footprint scale × depth
      const isBot=typeof(it.b.owner??"p")==="number", fac=bFaction(it.b);
      // concrete foundation = the building's real footprint, edged in its faction colour
      const fw=d.w*SLOT, fh=d.h*SLOT, own=it.b.owner??'p';
      plotRectPath(own,it.b.gx*SLOT+1,it.b.gy*SLOT+1,fw-2,fh-2);
      ctx.fillStyle='rgba(120,126,134,.6)'; ctx.fill();
      ctx.strokeStyle=hexA(facC(fac),.7); ctx.lineWidth=1.5; ctx.stroke();
      if(potatoBlds()){                                  // v8: POTATO MODE — one blob per building
        drawPotatoBuilding(sp.w,sp.h,s,fac,it.x,it.y-3);
      } else {
        ctx.fillStyle='rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(it.x,it.y-3,sp.w*bs*.45,Math.min(fh*.3,sp.w*bs*.16)+2,0,0,pi2); ctx.fill();
        if(it.b.flash>0){ ctx.globalAlpha=.5+Math.sin(performance.now()/30)*.3; }
        drawSpr(ctx,it.b.type,it.x,it.y-3,s,isBot?'e':'p',fac,performance.now()/1000);
        ctx.globalAlpha=1;
      }
      // hp bar if damaged
      if(it.b.hp<it.b.maxHp){
        const w=Math.max(28,sp.w*bs*.8), by=it.y-3-sp.h*s-8;
        ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(it.x-w/2,by,w,5);
        ctx.fillStyle='#5bc24e'; ctx.fillRect(it.x-w/2,by,w*clamp01(it.b.hp/it.b.maxHp),5);
      }
      // bot base overlays
      if(isBot){
        const bb=S.bots[it.b.owner];
        if(bb&&bb.down){
          ctx.globalAlpha=1;
          ctx.fillStyle='rgba(13,18,25,.8)';
          ctx.fillRect(it.x-70,it.y-sp.h*s-30,140,16);
          ctx.fillStyle='#ef5350'; ctx.font='900 12px "Segoe UI"'; ctx.textAlign='center';
          ctx.fillText(`REBUILDING ${Math.max(0,Math.ceil(bb.downT))}s`,it.x,it.y-sp.h*s-18);
        } else if(bb&&bb.raidT<10){
          ctx.fillStyle='#ff8a5c'; ctx.font='900 14px "Segoe UI"'; ctx.textAlign='center';
          ctx.fillText('⚠',it.x,it.y-sp.h*s-24*s);
        }
      }
    } else if(it.kind==='u'){
      drawUnit(it.u,depth(it.u.y),false);
    } else if(it.kind==='flag'){
      drawPointFlag(it.p,depth(it.p.y));
    }
  }

  // boss (drawn on top of ground, under fx) — actually draw within items? boss is a unit; handled in drawUnit via kind u (boss flag)
  // tracers
  for(const t of fx.tracers){
    ctx.strokeStyle=t.col; ctx.lineWidth=2.5; ctx.globalAlpha=t.life/.07;
    ctx.beginPath(); ctx.moveTo(t.x1,t.y1); ctx.lineTo(t.x2,t.y2); ctx.stroke(); ctx.globalAlpha=1;
  }
  // booms
  for(const b of fx.booms){
    const p=1-b.life/.45, r=lerp(4,b.max,p);
    ctx.globalAlpha=(1-p)*.8;
    ctx.fillStyle='#ffb066'; ctx.beginPath(); ctx.arc(b.x,b.y,r,0,pi2); ctx.fill();
    ctx.fillStyle='#fff2c9'; ctx.beginPath(); ctx.arc(b.x,b.y,r*.5,0,pi2); ctx.fill();
    ctx.globalAlpha=1;
  }
  // particles
  for(const p of fx.parts){
    ctx.globalAlpha=clamp01(p.life*2);
    ctx.fillStyle=p.col; ctx.fillRect(p.x-p.sz/2,p.y-p.sz/2,p.sz,p.sz);
  }
  ctx.globalAlpha=1;
  // floats
  ctx.font='bold 13px sans-serif'; ctx.textAlign='center';
  for(const f of fx.floats){
    ctx.globalAlpha=clamp01(f.life);
    ctx.fillStyle=f.col; ctx.fillText(f.txt,f.x,f.y);
  }
  ctx.globalAlpha=1; ctx.textAlign='left';

  // selection
  for(const u of selUnits){   // fixed: selUnits holds unit OBJECTS (rings were never drawn)
    if(u.dead) continue;
    ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=1.5;
    ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.arc(u.x,u.y, (u.boss?30:10+8*unitScale(u)),0,pi2); ctx.stroke();
    ctx.setLineDash([]);
  }
  // drag band
  if(dragBand){
    ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.lineWidth=1.2;
    ctx.fillStyle='rgba(74,144,226,.15)';
    const x=Math.min(dragBand.x1,dragBand.x2), y=Math.min(dragBand.y1,dragBand.y2);
    const w=Math.abs(dragBand.x2-dragBand.x1), h=Math.abs(dragBand.y2-dragBand.y1);
    ctx.fillRect(x,y,w,h); ctx.strokeRect(x,y,w,h);
  }
  // placement ghost
  if(S.placing){
    const g=ghostSlot();
    const q=plotAt(g.gx,g.gy), d=BUILD[S.placing];
    ctx.fillStyle=g.ok?'rgba(91,194,78,.25)':'rgba(214,73,63,.3)';
    ctx.strokeStyle=g.ok?'#5bc24e':'#d6493f';
    ctx.lineWidth=2;
    ctx.fillRect(q.x,q.y,d.w*SLOT,d.h*SLOT);
    ctx.strokeRect(q.x,q.y,d.w*SLOT,d.h*SLOT);
    // fixed: the ghost used d.w*50 / d.h*100 (old slot size) — now anchored exactly like a placed building
    const gy=q.y+d.h*SLOT, gs=depth(gy)*bScale(S.placing);
    ctx.globalAlpha=.75;
    drawSpr(ctx,S.placing,q.x+d.w*SLOT/2,gy-3,gs,'p',0,performance.now()/1000);
    ctx.globalAlpha=1;
  }
  // minimap (v5 perf: redrawn 10×/s instead of every frame)
  const nowMs=performance.now();
  if(nowMs-miniT>=100||nowMs<miniT){ miniT=nowMs; drawMini(); }
}
