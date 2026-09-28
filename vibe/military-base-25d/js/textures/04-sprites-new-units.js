/* Military Base 2.5D — 04-sprites-new-units.js · sprites for the expansion units (heavies, specialists, Centurion) */
'use strict';
// ================= textures: expansion units =================
// Built from the same 4 templates (infantry / vehicle / heliT / plane) as the rest of the roster,
// plus two hand-made ones: the ICBM Launcher (truck + erected missile) and the Centurion (a walking fortress).

// ----- LIGHT -----
reg('swarmdrone', 22,16, (g,t,u)=>{ const P=unitPal(u);
  g.fillStyle=P.body; g.fillRect(-4,-9,8,4); O(g,1.2); g.strokeRect(-4,-9,8,4);
  g.strokeStyle=P.dark; g.lineWidth=1.2;
  g.beginPath(); g.moveTo(-8,-8); g.lineTo(8,-7); g.moveTo(-8,-7); g.lineTo(8,-8); g.stroke();
  for(const x of [-8,8]){ g.fillStyle=P.metal; g.fillRect(x-1,-11,2,2);
    g.fillStyle='rgba(35,42,52,.55)'; g.beginPath(); g.ellipse(x,-11.5+Math.sin(t*50)*.3,3.6,1,0,0,pi2); g.fill(); }
  g.fillStyle=P.accent; g.fillRect(-1,-5,2,2);
});
reg('officer',    20,26, infantry({helmet:'beret', gun:0, pack:true, flag:true}));
// ----- ARMORED -----
reg('lighttank',  40,24, vehicle({len:30, hullH:8,  tur:[15,7],  gun:[15,3]}));
reg('mantis',     40,26, vehicle({len:30, hullH:7,  flak:true,   dish:true}));
reg('tigr',       36,24, vehicle({len:26, wheels:true, wheelN:3, hullH:7, cab:9, mg:true}));
reg('pzh',        46,26, vehicle({len:34, wheels:true, wheelN:4, hullH:7, cab:8, arty:28}));
reg('leopard',    50,28, vehicle({len:40, hullH:9,  tur:[20,9],  gun:[20,4]}));
reg('icbm',       50,36, (g,t,u)=>{ const P=unitPal(u);
  vehicle({len:34, wheels:true, wheelN:3, hullH:7, cab:8})(g,t,u);
  g.save(); g.translate(-2,-14); g.rotate(Math.sin(t*1.6)*.03);       // erected missile
  g.fillStyle=P.metal; g.fillRect(-5,-24,10,24); O(g,1.4); g.strokeRect(-5,-24,10,24);
  g.fillStyle=P.dark; g.beginPath(); g.moveTo(-5,-24); g.lineTo(0,-34); g.lineTo(5,-24); g.closePath(); g.fill();
  g.fillStyle='#e0592b'; g.fillRect(-5,-8,10,2.6); g.fillRect(-5,-15,10,2.6);
  g.fillStyle=`rgba(255,150,60,${.5+.4*Math.sin(t*8)})`; g.beginPath(); g.arc(0,2,3.4,0,pi2); g.fill();
  g.restore();
});
reg('centurion',  64,64, (g,t,u)=>{ const P=unitPal(u);
  const step=Math.sin(t*2.2);
  g.fillStyle=P.dark; g.fillRect(-16,-18+step*2,7,18); g.fillRect(9,-18-step*2,7,18);      // legs
  g.fillStyle=P.metal; g.beginPath(); g.arc(-12,-13+step*2,3,0,pi2); g.arc(12,-13-step*2,3,0,pi2); g.fill();
  g.fillStyle=P.metal; g.fillRect(-19,-2+step*2,11,3); g.fillRect(8,-2-step*2,11,3);
  g.fillStyle=P.accent; g.fillRect(-18,-1.5+step*2,5,1); g.fillRect(12,-1.5-step*2,5,1);
  g.fillStyle=P.body; g.beginPath(); g.moveTo(-16,-18); g.lineTo(-16,-37); g.lineTo(-10,-40); g.lineTo(10,-40); g.lineTo(16,-36); g.lineTo(16,-18); g.closePath();
  g.fill(); O(g,1.8); g.stroke();                                                        // torso
  g.fillStyle=P.metal; g.fillRect(-12,-37,24,16);
  g.fillStyle=P.dark; g.fillRect(-2,-37,4,16); g.fillRect(-11,-25,22,2);
  g.fillStyle=P.accent; g.fillRect(-9,-36,18,5); g.fillRect(-13,-31,3,6); g.fillRect(10,-31,3,6);
  g.strokeStyle='rgba(18,24,32,.42)'; g.lineWidth=1; g.beginPath(); g.moveTo(-14,-20); g.lineTo(-9,-18); g.moveTo(14,-20); g.lineTo(9,-18); g.stroke();
  g.fillStyle=P.dark; g.fillRect(-25,-42,9,16); g.fillRect(16,-42,9,16);                    // shoulder pods
  g.fillStyle=P.body; g.fillRect(-27,-43,11,13); g.fillRect(16,-43,11,13); O(g,1.4); g.strokeRect(-27,-43,11,13); g.strokeRect(16,-43,11,13);
  g.fillStyle=P.accent; g.fillRect(-26,-41,3,3); g.fillRect(23,-41,3,3);
  g.fillStyle=P.metal; g.fillRect(18,-38,20,6); g.fillRect(-30,-30,12,6);
  g.fillStyle=P.dark; g.fillRect(35,-39,3,8); g.fillRect(-29,-29,2,4);
  g.fillStyle=P.body; g.fillRect(-10,-52,20,12); O(g,1.6); g.strokeRect(-10,-52,20,12);     // head
  g.fillStyle='rgba(255,255,255,.16)'; g.fillRect(-8,-51,15,1.4);
  g.fillStyle=P.dark; g.fillRect(-8,-49,16,5);
  g.fillStyle=`rgba(255,90,78,${.6+.4*Math.sin(t*4)})`; g.fillRect(-7,-48,14,3.4);
  g.save(); g.translate(6,-30); g.rotate(-.12);                                             // main gun
  g.fillStyle=P.metal; g.fillRect(0,-5,34,9); O(g,1.5); g.strokeRect(0,-5,34,9);
  g.fillStyle='rgba(255,255,255,.2)'; g.fillRect(2,-4.5,25,1);
  g.fillStyle=P.dark; g.fillRect(32,-6,6,11); g.fillStyle='#252b33'; g.fillRect(35,-5,3,9); g.restore();
  g.fillStyle=`rgba(120,220,255,${.45+.35*Math.sin(t*3)})`; g.beginPath(); g.arc(0,-30,7,0,pi2); g.fill();   // core
});
// ----- AIR -----
reg('f15',  40,18, plane({len:17, wing:8,  twinTail:true}));
reg('f35',  38,18, plane({len:16, wing:7,  twinTail:true}));
reg('su47', 42,18, plane({len:19, wing:9,  twinTail:true}));
reg('ka52', 42,24, heliT({len:12, fat:5,   guns:true, door:true, twin:true}));
