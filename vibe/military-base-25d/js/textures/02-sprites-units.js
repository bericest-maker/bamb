/* Military Base 2.5D — 08b-sprites-units.js · sprites for the new units (built from 4 templates) */
'use strict';
// Templates give the full roster a cohesive, faction-lit tactical style; dimensions remain fixed.
// Every draw fn gets (g, t, u) and uses unitPal(u) → {body,dark,accent,metal,skin} of the unit's FACTION.

// ----- infantry: legs, torso, head + helmet, weapon -----
// o: {gun:len, gunW, helmet:'cap'|'beret'|'hood'|'heavy'|'boonie', pack, cross(medic), scope, tube(rocket), bulk}
function infantry(o={}){
  return (g,t,u)=>{
    const P=unitPal(u), k=o.bulk||1;
    g.save(); g.scale(k,k);
    // Kit sits behind the silhouette; boots, knee plates and a shaped vest add readable depth.
    if(o.pack){ g.fillStyle='#252b33'; g.fillRect(-8.5,-15,3.8,8); g.fillStyle=P.dark; g.fillRect(-8,-14,2.8,5); }
    g.fillStyle='#20262e'; g.fillRect(-4.8,-2,4.1,2); g.fillRect(.7,-2,4.1,2);
    g.fillStyle=P.dark; g.fillRect(-4.4,-7,3.2,5.5); g.fillRect(1,-7,3.2,5.5);
    g.fillStyle=P.metal; g.fillRect(-4.2,-7.5,2.7,1.8); g.fillRect(1.2,-7.5,2.7,1.8);
    g.fillStyle='rgba(255,255,255,.16)'; g.fillRect(-4,-6,1,2.5); g.fillRect(1.5,-6,1,2.5);
    // Sleeves and torso are kept within the original 20x24-ish footprint.
    g.fillStyle=P.dark; g.fillRect(-7,-14,2.5,6); g.fillRect(4.5,-14,2.5,6);
    g.fillStyle=P.body; g.beginPath(); g.moveTo(-4.5,-15); g.lineTo(-5.8,-12.5); g.lineTo(-5,-6); g.lineTo(5,-6); g.lineTo(5.8,-12.5); g.lineTo(4.5,-15); g.closePath(); g.fill(); O(g,1.5); g.stroke();
    g.fillStyle=o.heavy?P.dark:P.metal; g.fillRect(-3.8,-13.7,7.6,5.8);
    g.fillStyle=P.dark; g.fillRect(-4.5,-7.5,9,1.4); g.fillRect(-3.1,-12.8,2,2); g.fillRect(1.2,-12.8,2,2);
    g.fillStyle=P.accent; g.fillRect(-2.6,-13,5.2,1.2);
    g.strokeStyle='rgba(18,24,32,.42)'; g.lineWidth=.8;
    g.beginPath(); g.moveTo(0,-13.4); g.lineTo(0,-8.2); g.moveTo(-3.7,-10.1); g.lineTo(3.7,-10.1); g.stroke();
    if(o.cross){ g.fillStyle='#fff'; g.fillRect(-4,-13,8,6); g.fillStyle='#e53935'; g.fillRect(-1,-12.5,2,5); g.fillRect(-3,-10.5,6,1.8); }
    g.fillStyle=P.skin; g.fillRect(-1,-16.5,4,3); g.beginPath(); g.arc(1,-18,3.6,0,pi2); g.fill();
    g.fillStyle='rgba(255,255,255,.2)'; g.fillRect(1.2,-20,1.6,2);
    const h=o.helmet||'cap';
    g.fillStyle=P.accent;
    if(h==='cap'){ g.beginPath(); g.arc(1,-19,3.8,Math.PI,0); g.closePath(); g.fill(); g.fillRect(-3.5,-19,9,2); }
    else if(h==='beret'){ g.beginPath(); g.ellipse(0,-21,4.6,2.2,-.2,0,pi2); g.fill(); g.fillRect(-2,-22,2,2); }
    else if(h==='boonie'){ g.fillRect(-4.5,-20.5,11,1.8); g.fillRect(-2,-23,6,3); g.fillStyle='rgba(255,255,255,.17)'; g.fillRect(-1,-22.7,4,1); }
    else if(h==='heavy'){ g.fillStyle=P.metal; g.beginPath(); g.arc(1,-18.5,4.6,Math.PI,0); g.closePath(); g.fill(); g.fillStyle=P.accent; g.fillRect(-2,-19,6,2); g.fillStyle='#242a32'; g.fillRect(-3,-17.5,8,1.5); }
    else if(h==='hood'){ g.fillStyle=P.dark; g.beginPath(); g.arc(1,-18.5,4.6,Math.PI*.9,Math.PI*.1); g.fill(); g.fillStyle=P.accent; g.fillRect(1.5,-19,3,1.4); }
    if(o.flag){ g.fillStyle='#7d8794'; g.fillRect(-9.5,-30,1.6,30);
      g.fillStyle=P.accent; g.beginPath(); g.moveTo(-7.9,-30); g.quadraticCurveTo(-3,-29+Math.sin(t*4)*1.6,0,-27.5); g.lineTo(0,-24.5); g.quadraticCurveTo(-3.6,-25.6,-7.9,-26.5); g.closePath(); g.fill(); }
    if(o.tube){
      g.fillStyle='#222831'; g.fillRect(-6,-19,17,3.4); O(g,1); g.strokeRect(-6,-19,17,3.4);
      g.fillStyle=P.metal; g.fillRect(-5,-18.6,14,1.2); g.fillStyle='#e0592b'; g.fillRect(11,-18.8,2.5,3);
    } else if(o.gun!==0){
      const gl=o.gun||10, gw=o.gunW||2.2, gy=-12.2;
      g.fillStyle='#20262e'; g.fillRect(-1,gy,3,gw+.6); g.fillRect(2,gy,gl,gw); g.fillRect(gl+1,gy-.4,1.7,gw+.8);
      g.fillStyle='#8e9aa8'; g.fillRect(3,gy,.7,.7); g.fillRect(Math.min(gl-2,5),gy-1.2,4,.8);
      if(o.scope){ g.fillStyle=P.dark; g.fillRect(5,-14.5,4,2); g.fillStyle=P.metal; g.fillRect(5.5,-14.5,3, .7); }
    }
    g.restore();
  };
}
// ----- ground vehicle: tracks or wheels, hull, turret, gun -----
// o: {len, wheels(bool), hullH, tur:[w,h], gun:[len,thick], twin, rack(rockets), dish, launcher, flak, glow, color}
function vehicle(o={}){
  return (g,t,u)=>{
    const P=unitPal(u), L=o.len||30, hl=L/2, hh=o.hullH||7;
    // Running gear: separate treads and rollers for armour, hubs and arches for wheeled units.
    if(o.wheels){
      const n=Math.max(2,o.wheelN||3), gap=(L-8)/(n-1);
      g.fillStyle='#20262e'; g.fillRect(-hl-2,-8,L+4,8); O(g,1.2); g.strokeRect(-hl-2,-8,L+4,8);
      g.fillStyle='#3b444e'; g.fillRect(-hl,-7, L,1.3);
      for(let i=0;i<n;i++){
        const x=-hl+4+i*gap;
        g.fillStyle='#252b33'; g.beginPath(); g.arc(x,-4,3.1,0,pi2); g.fill();
        g.fillStyle=P.metal; g.beginPath(); g.arc(x,-4,1.45,0,pi2); g.fill();
        g.fillStyle='rgba(255,255,255,.28)'; g.fillRect(x-.4,-6.2,.8,1.1);
      }
    } else {
      g.fillStyle='#20262e'; g.fillRect(-hl-2,-8,L+4,8); O(g,1.2); g.strokeRect(-hl-2,-8,L+4,8);
      g.fillStyle='#3b444e'; g.fillRect(-hl,-7,L,1.3);
      const n=Math.max(3,Math.round(L/8));
      for(let i=0;i<n;i++){
        const x=-hl+2+i*((L-4)/(n-1));
        g.fillStyle='#353d47'; g.beginPath(); g.arc(x,-4,2.7,0,pi2); g.fill();
        g.fillStyle=P.metal; g.beginPath(); g.arc(x,-4,1.35,0,pi2); g.fill();
      }
      for(let i=0;i<Math.ceil(L/4);i++){
        g.fillStyle=i%2?'#171c22':'#525c67'; g.fillRect(-hl+i*4,-1.7,2,1);
      }
    }
    const top=-6-hh;
    g.fillStyle=P.body; g.beginPath();
    g.moveTo(-hl,top+hh); g.lineTo(-hl,top+2); g.lineTo(-hl+3,top); g.lineTo(hl-3,top); g.lineTo(hl,top+2); g.lineTo(hl,top+hh); g.closePath();
    g.fill(); O(g,1.5); g.stroke();
    g.fillStyle='rgba(255,255,255,.18)'; g.fillRect(-hl+4,top+1,L-8,1.2);
    g.fillStyle='rgba(8,12,18,.2)'; g.fillRect(-hl+1,top+hh-2,L-2,1.4);
    g.fillStyle=P.accent; g.fillRect(-hl+2,top+2,2.5,3);
    g.strokeStyle='rgba(18,24,32,.38)'; g.lineWidth=.8;
    g.beginPath(); g.moveTo(-hl+5,top+2); g.lineTo(-hl+5,top+hh-1); g.moveTo(hl-6,top+2); g.lineTo(hl-6,top+hh-1); g.stroke();
    if(o.cab){
      g.fillStyle=P.body; g.beginPath(); g.moveTo(hl-o.cab,top); g.lineTo(hl-o.cab+2,top-6); g.lineTo(hl-1,top-6); g.lineTo(hl,top-3); g.lineTo(hl,top); g.closePath(); g.fill(); O(g,1.2); g.stroke();
      g.fillStyle='#9fd0ff'; g.beginPath(); g.moveTo(hl-o.cab+3,top-5); g.lineTo(hl-3,top-5); g.lineTo(hl-2,top-1.5); g.lineTo(hl-o.cab+2,top-1.5); g.closePath(); g.fill();
      g.fillStyle='rgba(255,255,255,.3)'; g.fillRect(hl-o.cab+3,top-4.8,3,.7);
      g.fillStyle=P.accent; g.fillRect(hl-o.cab+1,top-6,3,1.2);
    }
    if(o.tur){
      const [tw,th]=o.tur;
      g.fillStyle=P.body; g.beginPath(); g.moveTo(-tw/2-2,top); g.lineTo(-tw/2,top-th+2); g.lineTo(-tw/2+2,top-th); g.lineTo(tw/2-1,top-th); g.lineTo(tw/2+1,top-th+2); g.lineTo(tw/2+1,top); g.closePath();
      g.fill(); O(g,1.5); g.stroke();
      g.fillStyle='rgba(255,255,255,.19)'; g.fillRect(-tw/2+1,top-th+1,tw-4,1.1);
      g.fillStyle=P.metal; g.beginPath(); g.ellipse(-tw*.13,top-th,Math.max(2,tw*.16),1.6,0,Math.PI,pi2); g.fill();
      g.fillStyle=P.accent; g.fillRect(-tw/2+1,top-th+2,2,1.5);
      if(o.gun){
        const [gl,gt]=o.gun;
        g.fillStyle=P.dark; g.fillRect(tw/2-1,top-th/2-gt/2-(o.twin?1.8:0),gl,gt);
        g.fillStyle=P.metal; g.fillRect(tw/2,top-th/2-gt/2-(o.twin?1.8:0),Math.max(2,gl-3),.7);
        g.fillStyle='#252b33'; g.fillRect(tw/2+gl-2,top-th/2-gt/2-(o.twin?1.8:0)-.4,2,gt+.8);
        if(o.twin){ g.fillStyle=P.dark; g.fillRect(tw/2-1,top-th/2+.5,gl,gt); g.fillStyle=P.metal; g.fillRect(tw/2,top-th/2+.7,gl-3,.7); }
      }
      if(o.glow){ g.fillStyle=`rgba(120,220,255,${.5+.4*Math.sin(t*6)})`; g.fillRect(tw/2-2,top-th/2-1,o.gun[0],2); }
    }
    if(o.flak){ g.save(); g.translate(0,top); g.rotate(-.7); g.fillStyle='#252b33'; g.fillRect(0,-4,14,2.4); g.fillRect(0,0,14,2.4);
      g.fillStyle=P.metal; g.fillRect(2,-3.6,9,.6); g.fillRect(2,.4,9,.6); g.restore();
      g.fillStyle=P.metal; g.beginPath(); g.arc(0,top,4,Math.PI,0); g.fill(); O(g,1); g.stroke(); }
    if(o.rack){ g.save(); g.translate(-2,top); g.rotate(-.45); g.fillStyle=P.dark; g.fillRect(-8,-7,18,7);
      g.fillStyle=P.metal; g.fillRect(-7,-6.2,16,1); g.fillRect(-7,-3,16,1); O(g,1); g.strokeRect(-8,-7,18,7);
      g.fillStyle='#e0592b'; for(let i=0;i<3;i++) g.fillRect(10,-6+i*2.2,2,1.6); g.restore(); }
    if(o.arty){ g.save(); g.translate(-hl+6,top); g.rotate(-.55); g.fillStyle=P.dark; g.fillRect(0,-2.5,o.arty,5);
      g.fillStyle=P.metal; g.fillRect(2,-2.5,Math.max(1,o.arty-5),.8); O(g,1); g.strokeRect(0,-2.5,o.arty,5); g.restore(); }
    if(o.dish){ g.strokeStyle=P.metal; g.lineWidth=1.4; g.beginPath(); g.moveTo(-hl+6,top); g.lineTo(-hl+6,top-8); g.stroke();
      g.save(); g.translate(-hl+6,top-9); g.rotate(t*2); g.fillStyle=P.metal; g.beginPath(); g.ellipse(0,0,5,2,0,0,pi2); g.fill(); g.strokeStyle='rgba(255,255,255,.4)'; g.lineWidth=.6; g.beginPath(); g.moveTo(-4,0); g.lineTo(4,0); g.stroke(); g.restore(); }
    if(o.mg){ g.fillStyle='#242a32'; g.fillRect(-2,top-5,2,5); g.fillRect(-2,top-5,9,1.8); g.fillStyle=P.metal; g.fillRect(0,top-5,6,.6); }
  };
}
// ----- helicopter: body ellipse, tail boom, skids, rotor -----
// o: {len, fat, twin(rotor), guns, stealth(angular), door, color}
function heliT(o={}){
  return (g,t,u)=>{
    const P=unitPal(u), L=o.len||11, F=o.fat||6;
    // Tail boom, braced skids and a sculpted cabin make the helicopter read in profile.
    g.strokeStyle=P.dark; g.lineWidth=2;
    g.beginPath(); g.moveTo(-L-2,0); g.lineTo(L+8,0); g.moveTo(-L+1,-3); g.lineTo(-L+1,0);
    g.moveTo(L-6,-3); g.lineTo(L-6,0); g.moveTo(2,-3); g.lineTo(4,0); g.stroke();
    g.fillStyle=P.body;
    if(o.stealth){ g.beginPath(); g.moveTo(-L-3,-8); g.lineTo(-L+3,-F*2-3); g.lineTo(L-2,-F*2-2); g.lineTo(L+2,-7); g.lineTo(L-3,-4); g.lineTo(-L+2,-4); g.closePath(); g.fill(); O(g,1.5); g.stroke(); }
    else { g.beginPath(); g.ellipse(-3,-9,L,F,0,0,pi2); g.fill(); O(g,1.5); g.stroke(); }
    g.fillStyle='rgba(255,255,255,.14)'; g.beginPath(); g.ellipse(-4,-11.5,L*.56,F*.28,0,Math.PI,pi2); g.fill();
    g.fillStyle='rgba(8,12,18,.2)'; g.fillRect(-L+1,-7,L*1.45,2);
    // Forward glazing, cabin windows and the side door are separate panels.
    g.fillStyle='#9fd0ff'; g.beginPath(); g.moveTo(-L-1,-10); g.lineTo(-L+2,-13); g.lineTo(-L+5,-12); g.lineTo(-L+5,-7); g.lineTo(-L,-7); g.closePath(); g.fill();
    g.strokeStyle='rgba(20,28,38,.55)'; g.lineWidth=.8; g.beginPath(); g.moveTo(-L+2,-12); g.lineTo(-L+3,-7); g.stroke();
    g.fillStyle=P.metal; g.fillRect(-3,-12,4,3); g.fillRect(3,-11.5,3,2.4);
    if(o.door){ g.fillStyle=P.dark; g.fillRect(-2,-12,6,7); g.fillStyle='#9fd0ff'; g.fillRect(-1,-11,4,2.8); g.strokeStyle='rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(-1,-10.8); g.lineTo(2,-10.8); g.stroke(); }
    g.fillStyle=P.body; g.fillRect(L-4,-11,14,3.5); g.fillRect(L+7,-15,3.5,6);
    g.fillStyle=P.dark; g.fillRect(L-3,-8,12,1); g.fillRect(L+8,-14,1,4);
    g.fillStyle=P.accent; g.fillRect(L+8,-15,2,2); g.fillStyle='#ff6b5e'; g.fillRect(L+8,-8,1.5,1.2);
    if(o.guns){ g.fillStyle=P.dark; g.fillRect(-6,-5,10,2.8); g.fillStyle=P.metal; g.fillRect(-5,-5,7,.8); g.fillStyle='#e0592b'; g.fillRect(4,-5.2,2,3); }
    // Rotor mast + animated blades; the KA-52 uses counter-rotating coaxial rotors.
    const ry=-9-F-2;
    g.fillStyle=P.dark; g.fillRect(-4,ry,2.5,4);
    for(let r=0;r<(o.twin?2:1);r++){
      g.save(); g.translate(-3,ry-r*2.2); g.rotate(t*14*(r?-1:1));
      g.fillStyle=o.stealth?'rgba(35,42,52,.55)':'rgba(35,42,52,.78)';
      g.fillRect(-L-4,-1.2,(L+4)*2,2.4); g.fillRect(-1.1,-L*.4,2.2,L*.8); g.restore();
      g.fillStyle=P.metal; g.beginPath(); g.arc(-3,ry-r*2.2,1.8,0,pi2); g.fill();
    }
    g.save(); g.translate(L+8,-13); g.rotate(-t*18);
    g.fillStyle='rgba(35,42,52,.8)'; g.fillRect(-.8,-4.5,1.6,9); g.fillRect(-4.5,-.8,9,1.6); g.restore();
  };
}
// ----- plane: fuselage, wings, tail, engine glow -----
// o: {len, wing, props(bool), heavy, flying wing (b2), twinTail, color}
function plane(o={}){
  return (g,t,u)=>{
    const P=unitPal(u), L=o.len||14, W=o.wing||8;
    if(o.flyingWing){
      g.fillStyle=P.body; g.beginPath(); g.moveTo(L,-8); g.lineTo(-L*.4,-8-W); g.lineTo(-L,-10); g.lineTo(-L*.7,-7); g.lineTo(-L,-4); g.lineTo(-L*.4,-2+W*.2); g.closePath(); g.fill(); O(g,1.5); g.stroke();
      g.strokeStyle='rgba(255,255,255,.17)'; g.lineWidth=.8; g.beginPath(); g.moveTo(-L*.35,-8-W+1); g.lineTo(-2,-9); g.lineTo(L*.8,-8.2); g.stroke();
      g.fillStyle=P.accent; g.fillRect(L*.2,-8.8,5,1.8); g.fillRect(-L*.35,-8.5,4,1.4);
      g.fillStyle='#9fd0ff'; g.beginPath(); g.ellipse(L*.46,-8.3,2.4,1.1,0,0,pi2); g.fill();
      g.strokeStyle='rgba(20,28,38,.45)'; g.lineWidth=.7; g.beginPath(); g.moveTo(-L*.35,-8-W+2); g.lineTo(-L*.42,-4); g.stroke();
      return;
    }
    if(!o.props){
      g.fillStyle='rgba(255,170,65,.82)'; g.beginPath(); g.moveTo(-L,-7); g.lineTo(-L-7,-5.5); g.lineTo(-L,-4); g.closePath(); g.fill();
      g.fillStyle='#ffdc91'; g.beginPath(); g.moveTo(-L,-6.1); g.lineTo(-L-4,-5.5); g.lineTo(-L,-4.9); g.closePath(); g.fill();
    }
    g.fillStyle=P.body;
    const top=o.heavy?-12:-10.5;
    g.beginPath(); g.moveTo(L+2,-6); g.lineTo(L*.2,top); g.lineTo(-L,top+2); g.lineTo(-L,-3.5); g.lineTo(L*.2,-2); g.closePath(); g.fill(); O(g,1.5); g.stroke();
    // Planform wings, tailplanes and their panel/leading-edge lines.
    g.fillStyle=P.dark;
    g.beginPath(); g.moveTo(L*.1,-8); g.lineTo(-L*.4,-8+W); g.lineTo(-L*.2,-8); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-L,top+2); g.lineTo(-L-4,top-3.5); g.lineTo(-L+3,top+2); g.closePath(); g.fill();
    if(o.twinTail){ g.beginPath(); g.moveTo(-L+4,top+2); g.lineTo(-L+1,top-3); g.lineTo(-L+7,top+2); g.closePath(); g.fill(); }
    g.strokeStyle='rgba(255,255,255,.28)'; g.lineWidth=.8; g.beginPath(); g.moveTo(-L*.2,-8+W-1); g.lineTo(-L*.05,-7.5); g.lineTo(L*.68,-6.2); g.stroke();
    g.fillStyle=P.accent; g.fillRect(-L*.24,-7.4,3.5,1.5); g.fillRect(-L*.3,-5.3,3,1.2);
    if(o.props){ g.fillStyle=P.metal; for(const px of [-L*.25,L*.05]){ g.fillRect(px,-8+W*.5,4,2.5);
      g.fillStyle='rgba(255,255,255,.3)'; g.fillRect(px+.5,-8+W*.5,2,.7);
      g.save(); g.translate(px+5,-7+W*.5); g.rotate(t*25); g.fillStyle='rgba(35,42,52,.7)'; g.fillRect(-.8,-4,1.6,8); g.restore(); } }
    if(o.guns){ g.fillStyle='#2b3138'; g.fillRect(-2,-3,2,4); g.fillRect(3,-3,2,4); g.fillStyle=P.metal; g.fillRect(-1.5,-2.5,1,.8); g.fillRect(3.5,-2.5,1,.8); }
    // Glazed cockpit with a slim frame, positioned forward on every non-stealth airframe.
    g.fillStyle='#9fd0ff'; g.beginPath(); g.moveTo(L*.42,top+1.4); g.lineTo(L*.72,-6.2); g.lineTo(L*.62,-5.1); g.lineTo(L*.37,-6.3); g.closePath(); g.fill();
    g.strokeStyle='rgba(20,28,38,.55)'; g.lineWidth=.7; g.beginPath(); g.moveTo(L*.42,top+1.4); g.lineTo(L*.62,-5.1); g.stroke();
    g.fillStyle='rgba(255,255,255,.4)'; g.fillRect(L*.49,top+1.8,2,.8);
  };
}

// ----- LIGHT -----
reg('scout',   20,24, infantry({helmet:'boonie', gun:8}));
reg('atv',     30,20, vehicle({len:20, wheels:true, wheelN:2, hullH:5, mg:true}));
reg('sniper',  24,22, infantry({helmet:'hood', gun:16, gunW:1.8, scope:true}));
reg('commando',20,24, infantry({helmet:'beret', gun:11, pack:true}));
reg('humvee',  36,24, vehicle({len:28, wheels:true, wheelN:2, hullH:7, cab:10, mg:true}));
reg('rocket',  24,24, infantry({helmet:'cap', tube:true, pack:true}));
reg('medic',   20,24, infantry({helmet:'cap', gun:0, cross:true, pack:true}));
reg('ranger',  20,24, infantry({helmet:'boonie', gun:12, pack:true}));
reg('drone',   26,20, (g,t,u)=>{ const P=unitPal(u);
  g.fillStyle='rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0,0,8,2.5,0,0,pi2); g.fill();
  g.fillStyle=P.body; g.fillRect(-5,-15,10,5); O(g,1.2); g.strokeRect(-5,-15,10,5);
  g.strokeStyle=P.dark; g.lineWidth=1.5; g.beginPath(); g.moveTo(-10,-14); g.lineTo(10,-11); g.moveTo(-10,-11); g.lineTo(10,-14); g.stroke();
  g.fillStyle='rgba(35,42,52,.6)'; for(const x of [-10,10]){ g.beginPath(); g.ellipse(x,-14.5+Math.sin(t*40)*.3,4.5,1.2,0,0,pi2); g.fill(); }
  g.fillStyle=P.accent; g.fillRect(-1,-10,2,2); });
// ----- ARMORED -----
reg('hinf',    24,26, infantry({helmet:'heavy', gun:11, gunW:3, heavy:true, bulk:1.15}));
reg('apc',     40,24, vehicle({len:32, wheels:true, wheelN:4, hullH:9, tur:[8,4], gun:[8,1.8]}));
reg('flak',    38,26, vehicle({len:30, hullH:7, flak:true}));
reg('aav',     40,28, vehicle({len:32, hullH:8, rack:true, dish:true}));
reg('arty',    44,26, vehicle({len:34, wheels:true, wheelN:3, hullH:7, cab:9, arty:26}));
reg('heavy',   48,28, vehicle({len:38, hullH:9, tur:[20,9], gun:[18,4]}));
reg('mammoth', 56,32, vehicle({len:46, hullH:11, tur:[24,10], gun:[20,3.4], twin:true, rack:true}));
reg('railgun', 50,28, vehicle({len:38, hullH:8, tur:[16,7], gun:[26,2.6], glow:true}));
// ----- AIR -----
reg('huey',     40,24, heliT({len:12, fat:6, door:true}));
reg('cobra',    40,20, heliT({len:12, fat:4.5, guns:true}));
reg('blackhawk',44,24, heliT({len:14, fat:6.5, door:true, guns:true}));
reg('a10',      40,20, plane({len:16, wing:9, guns:true, twinTail:true}));
reg('f22',      40,18, plane({len:17, wing:7, twinTail:true}));
reg('ac130',    56,24, plane({len:24, wing:12, props:true, heavy:true, guns:true}));
reg('b52',      62,26, plane({len:28, wing:14, heavy:true}));
// ----- STEALTH -----
reg('saboteur',   20,24, infantry({helmet:'hood', gun:6, pack:true}));
reg('phantom',    44,24, vehicle({len:34, hullH:7, tur:[14,5], gun:[16,2.6]}));
reg('stealthheli',44,22, heliT({len:13, fat:5, stealth:true}));
reg('b2',         56,20, plane({len:24, wing:12, flyingWing:true}));
