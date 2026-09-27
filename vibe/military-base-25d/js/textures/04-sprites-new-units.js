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
  g.fillStyle=P.metal; g.fillRect(-19,-2+step*2,11,3); g.fillRect(8,-2-step*2,11,3);
  g.fillStyle=P.body; g.fillRect(-16,-40,32,23); O(g,1.8); g.strokeRect(-16,-40,32,23);    // torso
  g.fillStyle=P.accent; g.fillRect(-9,-36,18,5);
  g.fillStyle=P.dark; g.fillRect(-25,-42,9,16); g.fillRect(16,-42,9,16);                    // shoulder pods
  g.fillStyle=P.metal; g.fillRect(18,-38,20,6); g.fillRect(-30,-30,12,6);
  g.fillStyle=P.body; g.fillRect(-10,-52,20,12); O(g,1.6); g.strokeRect(-10,-52,20,12);     // head
  g.fillStyle=`rgba(255,90,78,${.6+.4*Math.sin(t*4)})`; g.fillRect(-7,-48,14,3.4);
  g.save(); g.translate(6,-30); g.rotate(-.12);                                             // main gun
  g.fillStyle=P.metal; g.fillRect(0,-5,34,9); O(g,1.5); g.strokeRect(0,-5,34,9);
  g.fillStyle=P.dark; g.fillRect(32,-6,6,11); g.restore();
  g.fillStyle=`rgba(120,220,255,${.45+.35*Math.sin(t*3)})`; g.beginPath(); g.arc(0,-30,7,0,pi2); g.fill();   // core
});
// ----- AIR -----
reg('f15',  40,18, plane({len:17, wing:8,  twinTail:true}));
reg('f35',  38,18, plane({len:16, wing:7,  twinTail:true}));
reg('su47', 42,18, plane({len:19, wing:9,  twinTail:true}));
reg('ka52', 42,24, heliT({len:12, fat:5,   guns:true, door:true, twin:true}));
