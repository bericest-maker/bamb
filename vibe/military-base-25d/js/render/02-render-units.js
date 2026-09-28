/* Military Base 2.5D — 02-render-units.js · unit sprites, the boss worm, capture-point flags */
'use strict';
function drawUnit(u,s){
  let sp;
  if(blockUnits()){ drawBlockUnit(u,s); return; }   // v8: BLOCK MODE — one rectangle per troop
  if(u.boss){ drawBoss(u); return; }
  sp=SPR[u.type];
  s*=unitScale(u);                       // v5: bigger units look bigger
  const air=isAir(u);
  const flyY = air ? -(56+Math.sin(u.t*2.5)*6) : 0;
  // stealth: hidden units are nearly invisible (never to their own commander)
  const hidden = isStealth(u)&&!u.revealed&&u.faction!==0;
  ctx.globalAlpha = hidden?.16:1;
  // shadow on the ground (ships get a ripple — they're on the water)
  const sea=isSea(u);
  ctx.fillStyle = sea?'rgba(20,70,120,.30)':(air?'rgba(0,0,0,.12)':'rgba(0,0,0,.25)');
  ctx.beginPath();
  ctx.ellipse(u.x,u.y+2, sp.w*.45*s, (sea?sp.w*.22:(air?4:sp.w*.17))*s,0,0,pi2);
  ctx.fill();
  if(sea){
    ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.ellipse(u.x,u.y+2, sp.w*.45*s*(1.1+Math.sin(performance.now()/260)*.08), sp.w*.24*s,0,0,pi2); ctx.stroke();
  }
  drawSpr(ctx,u.type,u.x,u.y+flyY,s,u.side,u.faction,performance.now()/1000);
  ctx.globalAlpha=1;
  // detected-stealth shimmer
  if(isStealth(u)&&u.revealed&&u.fightT<=0){
    ctx.strokeStyle=hexA(facC(u.faction),.5+Math.sin(performance.now()/120)*.3);
    ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(u.x,u.y-10,14*s,0,pi2); ctx.stroke();
  }
  // hp bar (faction color)
  if(u.hp<u.maxHp){
    const w=sp.w*.9*unitScale(u), hy=u.y-unitTop(u)*depth(u.y)-10;
    ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(u.x-w/2,hy, w,3.5);
    ctx.fillStyle=facC(u.faction);
    ctx.fillRect(u.x-w/2,hy, w*clamp01(u.hp/u.maxHp),3.5);
  }
}
function drawBoss(u){
  // segments
  for(let i=Math.min(30,u.hist.length-1);i>=0;i-=2){
    const h=u.hist[i]; if(!h) break;
    const r=15-i*.42;
    if(r<6) break;
    const s=depth(h.y);
    ctx.save(); ctx.translate(h.x,h.y); ctx.scale(s,s);
    ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0,3,r*.9,r*.35,0,0,pi2); ctx.fill();
    ctx.fillStyle='#5a616c'; ctx.beginPath(); ctx.arc(0,0,r,0,pi2); ctx.fill();
    ctx.strokeStyle='#33383f'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#6d7581'; ctx.beginPath(); ctx.arc(0,-r*.3,r*.55,0,pi2); ctx.fill();
    ctx.fillStyle='#33383f';
    ctx.beginPath(); ctx.moveTo(-r*.4,-r*.85); ctx.lineTo(0,-r-6); ctx.lineTo(r*.4,-r*.85); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const s=depth(u.y);
  ctx.save(); ctx.translate(u.x,u.y); ctx.scale(s,s);
  const r=20;
  ctx.fillStyle='rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0,4,r,r*.4,0,0,pi2); ctx.fill();
  ctx.fillStyle='#4a4f58'; ctx.beginPath(); ctx.arc(0,0,r,0,pi2); ctx.fill();
  ctx.strokeStyle='#22262c'; ctx.lineWidth=2.5; ctx.stroke();
  ctx.fillStyle='#6d7581'; ctx.beginPath(); ctx.arc(0,-r*.3,r*.6,0,pi2); ctx.fill();
  // jaw
  ctx.fillStyle='#33383f'; ctx.beginPath(); ctx.arc(0,r*.25,r*.7,0,Math.PI); ctx.closePath(); ctx.fill();
  // eyes
  const gl=.6+Math.sin(performance.now()/150)*.4;
  ctx.fillStyle=`rgba(255,70,50,${gl})`;
  ctx.beginPath(); ctx.arc(-7,-4,3.4,0,pi2); ctx.arc(7,-4,3.4,0,pi2); ctx.fill();
  // horns
  ctx.fillStyle='#e0a32e';
  ctx.beginPath(); ctx.moveTo(-12,-r+4); ctx.lineTo(-16,-r-9); ctx.lineTo(-7,-r+1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(12,-r+4); ctx.lineTo(16,-r-9); ctx.lineTo(7,-r+1); ctx.closePath(); ctx.fill();
  ctx.restore();
  // boss hp handled in HUD bar
}
function drawPointFlag(p,s){
  const f=pointFaction(p);
  const col=f<0?'#8f9aa8':facC(f);
  ctx.save(); ctx.translate(p.x,p.y); ctx.scale(s,s);
  ctx.fillStyle='#7d8794'; ctx.fillRect(-2,-52,4,52);
  ctx.fillStyle=col;
  ctx.beginPath(); ctx.moveTo(2,-52);
  ctx.quadraticCurveTo(18,-49+Math.sin(performance.now()/250)*3,30,-46);
  ctx.lineTo(30,-33); ctx.quadraticCurveTo(16,-36,2,-36);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  // label
  ctx.save(); ctx.translate(p.x,p.y); ctx.scale(s,s);
  ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
  ctx.fillStyle='rgba(20,26,34,.75)';
  const t=p.name+' · '+(f<0?'NEUTRAL':(f===0?'YOU':facN(f)));
  const tw=ctx.measureText(t).width;
  ctx.fillRect(-tw/2-5,-70,tw+10,14);
  ctx.fillStyle=col; ctx.fillText(t,0,-59);
  ctx.textAlign='left';
  ctx.restore();
}
