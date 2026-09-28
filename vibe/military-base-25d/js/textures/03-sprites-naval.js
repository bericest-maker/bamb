/* Military Base 2.5D — 03-sprites-naval.js · the NAVAL line: ship sprite template + the 7 ships */
'use strict';
// ================= textures: ships =================
// One `ship()` template keeps the whole navy in the same flat 2.5D style as the tanks and planes:
// wake → hull → waterline → superstructure → turrets → mast → flag. Submarine + Carrier are custom.
function ship(o={}){
  return (g,t,u)=>{
    const P=unitPal(u), L=o.len||34, H=o.hull||10;
    const bob=Math.sin(t*2.1)*1.8, roll=Math.sin(t*1.3)*.02;      // ships ride the swell
    g.save(); g.translate(0,bob); g.rotate(roll);
    // ---- wake ----
    g.fillStyle='rgba(255,255,255,.28)';
    g.beginPath(); g.ellipse(-L*.12,1,L*.9,4.4,0,0,pi2); g.fill();
    g.fillStyle='rgba(200,240,255,.5)';
    g.beginPath(); g.ellipse(-L*.55,1.6,L*.34+Math.sin(t*3.4)*1.6,2.6,0,0,pi2); g.fill();
    // ---- hull ----
    const hl=L*.5;
    g.fillStyle=P.body;
    g.beginPath();
    g.moveTo(-hl,0); g.lineTo(hl*.86,0); g.lineTo(hl*.98,-H*.45); g.lineTo(hl*.74,-H); g.lineTo(-hl*.86,-H);
    g.closePath(); g.fill(); O(g,1.6); g.stroke();
    g.fillStyle=P.dark; g.fillRect(-hl*.9,-3.2,L*.95,3.2);                 // waterline stripe
    g.fillStyle='rgba(255,255,255,.16)'; g.fillRect(-hl*.68,-H+1,L*.62,1);
    g.fillStyle='rgba(8,12,18,.52)';
    const portN=Math.max(3,Math.floor(L/8));
    for(let i=0;i<portN;i++){
      const x=-hl*.68+i*(L*1.36/Math.max(1,portN-1));
      g.beginPath(); g.arc(x,-H*.48,.75,0,pi2); g.fill();
    }
    g.fillStyle=P.accent; g.fillRect(-hl*.86,-H-1.5,L*.8,1.6);             // deck rim
    g.fillStyle=P.metal; g.fillRect(-hl*.7,-H-2.5,L*.56,.8);                // raised deck edge
    // ---- superstructure ----
    if(o.tower!==false){
      const tw=o.towerW||L*.28, th=o.towerH||9;
      g.fillStyle=P.body; g.fillRect(-tw*.2,-H-th,tw,th); O(g,1.5); g.strokeRect(-tw*.2,-H-th,tw,th);
      g.fillStyle='rgba(255,255,255,.18)'; g.fillRect(-tw*.2+1,-H-th+1,tw-2,1);
      g.fillStyle='#9fd0ff'; g.fillRect(-tw*.2+2,-H-th+3,tw-4,3);
      g.fillStyle='rgba(20,28,38,.6)'; for(let i=1;i<Math.max(2,Math.floor(tw/5));i++) g.fillRect(-tw*.2+2+i*4,-H-th+3,1,3);
      g.fillStyle=P.dark; g.fillRect(-tw*.2+1,-H-2,tw-2,2);
      if(o.mast!==false){ g.fillStyle=P.metal; g.fillRect(tw*.05,-H-th-16,2,16);
        g.fillStyle=P.accent; g.fillRect(tw*.05+2,-H-th-16,9,4.5);
        g.fillStyle='rgba(255,255,255,.5)'; g.fillRect(tw*.05+3,-H-th-15,5,.8);
        g.fillStyle=P.metal; g.beginPath(); g.ellipse(tw*.05+5,-H-th-18,4,1.1,0,0,pi2); g.fill(); }
    }
    // ---- flight deck (carrier) ----
    if(o.flightdeck){
      g.fillStyle=P.metal; g.fillRect(-hl*.82,-H-7,L*.92,6); O(g,1.4); g.strokeRect(-hl*.82,-H-7,L*.92,6);
      g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=1.2;
      g.beginPath(); g.moveTo(-hl*.4,-H-4.5); g.lineTo(hl*.5,-H-4.5); g.stroke();
      g.fillStyle=P.dark; g.fillRect(hl*.1,-H-19,10,12); O(g,1.4); g.strokeRect(hl*.1,-H-19,10,12);
      g.fillStyle='#9fd0ff'; g.fillRect(hl*.1+2,-H-17,7,3);
      g.fillStyle=P.accent;                                   // two parked planes
      g.fillRect(-hl*.55,-H-11,12,3); g.fillRect(hl*.02,-H-11,12,3);
    }
    // ---- turrets ----
    if(o.tur){
      const [n,ts]=o.tur;
      for(let i=0;i<n;i++){
        const x=-hl*.45+i*(L*.34/Math.max(1,n-1||1)) - (n>1?0:L*.05);
        g.fillStyle=P.dark; g.beginPath(); g.arc(x,-H-ts*.45,ts*.72,Math.PI,0); g.fill();
        g.fillStyle=P.metal; g.beginPath(); g.arc(x,-H-ts*.45,ts*.62,Math.PI,0); g.fill();
        g.fillRect(x-ts*.62,-H-ts*.45,ts*1.24,ts*.45); O(g,1.3); g.stroke();
        g.fillStyle='rgba(255,255,255,.22)'; g.fillRect(x-ts*.45,-H-ts*.55,ts*.7,1);
        g.fillStyle=P.dark; g.fillRect(x+ts*.4,-H-ts*.62,ts*1.5,Math.max(2,ts*.28));
        g.fillStyle=P.metal; g.fillRect(x+ts*.48,-H-ts*.62,ts*.98,.65);
        g.fillStyle='#1b2027'; g.fillRect(x+ts*1.72,-H-ts*.67,1.3,Math.max(2,ts*.38));
      }
    }
    if(o.vls){    // vertical launch cells (frigate)
      g.fillStyle=P.dark;
      for(let i=0;i<3;i++) g.fillRect(-hl*.3+i*5,-H-4,3.4,4);
    }
    if(o.rack){   // missile rack
      g.save(); g.translate(-hl*.1,-H); g.rotate(-.5);
      g.fillStyle=P.metal; g.fillRect(0,-6,13,6); O(g,1.2); g.strokeRect(0,-6,13,6);
      g.fillStyle='#e0592b'; g.fillRect(11,-5.2,2.4,4.4); g.restore();
    }
    g.restore();
  };
}

// ----- LIGHT -----
reg('speedboat', 30,20, ship({len:20, hull:6, tower:true, towerW:7, towerH:5, mast:false, tur:[1,5]}));
// ----- ARMORED -----
reg('gunboat',   38,22, ship({len:26, hull:8,  towerW:9,  towerH:7,  tur:[1,6], vls:false}));
reg('frigate',   50,30, ship({len:34, hull:10, towerW:12, towerH:10, tur:[1,7], vls:true, rack:true}));
reg('battleship',72,36, ship({len:52, hull:14, towerW:16, towerH:14, tur:[2,9]}));
reg('carrier',   78,32, ship({len:56, hull:12, tower:false, flightdeck:true}));
// ----- STEALTH -----
reg('zumwalt',   56,26, (g,t,u)=>{ const P=unitPal(u);
  const bob=Math.sin(t*2.1)*1.6; g.save(); g.translate(0,bob);
  g.fillStyle='rgba(255,255,255,.26)'; g.beginPath(); g.ellipse(-4,1,30,4,0,0,pi2); g.fill();
  g.fillStyle=P.body;                                     // angular wave-piercing hull
  g.beginPath(); g.moveTo(-26,-2); g.lineTo(24,-2); g.lineTo(30,-9); g.lineTo(14,-15); g.lineTo(-22,-12); g.closePath(); g.fill(); O(g,1.6); g.stroke();
  g.fillStyle=P.dark; g.fillRect(-24,-4,46,2.4);
  g.fillStyle=P.metal; g.beginPath(); g.arc(-4,-17,4,0,pi2); g.fill(); O(g,1.2); g.stroke();
  g.fillStyle=P.accent; g.fillRect(-2,-20,10,2.4);
  g.fillStyle=P.metal; g.fillRect(6,-16,14,2.6);           // stealth gun
  g.restore();
});
reg('submarine', 54,24, (g,t,u)=>{ const P=unitPal(u);
  const dive=(Math.sin(t*.9)+1)*.5, bob=Math.sin(t*1.7)*1.2;    // surfaced ⇄ submerged
  g.save(); g.translate(0,bob+dive*3);
  g.fillStyle='rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(-2,2,26,3.4,0,0,pi2); g.fill();
  g.fillStyle=P.body;                                     // cigar hull
  g.beginPath(); g.ellipse(0,-8,26,7,0,0,pi2); g.fill(); O(g,1.6); g.stroke();
  g.fillStyle=P.dark; g.fillRect(-25,-4,50,3);
  g.fillStyle=P.metal;                                    // sail (conning tower)
  g.beginPath(); g.moveTo(-6,-14); g.lineTo(-4,-22-dive*4); g.lineTo(5,-22-dive*4); g.lineTo(7,-14); g.closePath(); g.fill(); O(g,1.4); g.stroke();
  g.fillStyle=P.accent; g.fillRect(-1,-30-dive*6,1.8,9);  // periscope
  g.fillStyle='#9fd0ff'; g.fillRect(1,-29-dive*6,3,2);
  g.fillStyle=P.metal; g.fillRect(-30,-11,7,2.4); g.fillRect(-30,-6,7,2.4);   // dive planes
  g.restore();
});
