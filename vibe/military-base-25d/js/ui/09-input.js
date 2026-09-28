/* Military Base 2.5D — 15-input.js · input: minimap, keyboard, mouse */
'use strict';
// minimap click
mini.addEventListener('mousedown',e=>{
  const r=mini.getBoundingClientRect();
  const wx=(e.clientX-r.left)/r.width*WORLD.w;   // fixed: used hard-coded 150×112 (wrong when CSS scales the canvas)
  const wy=(e.clientY-r.top)/r.height*WORLD.h;
  cam.tx=wx; cam.ty=wy;
});

// input
window.addEventListener('keydown',e=>{
  if(/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  switch(e.key.toLowerCase()){
    case 'w': case 'arrowup': cam.ty-=90; break;
    case 's': case 'arrowdown': cam.ty+=90; break;
    case 'a': case 'arrowleft': cam.tx-=90; break;
    case 'd': case 'arrowright': cam.tx+=90; break;
    case 'escape':
      if(S.placing) cancelPlacement();
      else { selUnits=[]; for(const id of PANEL_IDS) $('#p-'+id).classList.remove('show'); }
      break;
  }
});
window.addEventListener('keyup',e=>{});
// continuous camera with held keys
const keys={};
window.addEventListener('keydown',e=>{ if(/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return; const k=e.key.toLowerCase(); keys[k]=true;
  if(k==='q'&&!holdQ){ holdQ=true; sfx('click'); }   // v8.3: hold Q → freeze the battle and look around
});
window.addEventListener('keyup',e=>{ const k=e.key.toLowerCase(); delete keys[k]; if(k==='q'){ holdQ=false; sfx('click'); } });
window.addEventListener('blur',()=>{ holdQ=false; });

let placeDrag=null;              // v8.5: SHIFT-drag placement: {gx,gy,zone} where the drag started
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('mousedown',e=>{
  initAudio();
  if(e.button===2){
    if(S.placing){ cancelPlacement(); }
    else {
      // right-click a BOT building with units selected = assault order
      const bb=selUnits.length?buildingAt(mouse.wx,mouse.wy,'bot'):null;
      if(bb){
        const c=bPos(bb);
        for(const u of selUnits) u.order={x:c.x,y:c.y,bid:bb.id};
        toast('⚔️ Units ordered to ASSAULT that building!','#d6493f');
        sfx('click');
      } else {
        const b=buildingAt(mouse.wx,mouse.wy,'p');
        if(b){
          // v8: buildings are permanent — no more accidental demolish on right-click.
          // ⚙ SETTINGS → INDESTRUCTIBLE BUILDINGS off restores selling (50% refund).
          if(indestructible()){ toast('🚫 Buildings are permanent — turn off INDESTRUCTIBLE in ⚙ SETTINGS to sell','#8f9aa8'); sfx('error'); }
          else removeBuildingRefund(b);
        }
        else selUnits=[];
      }
    }
    return;
  }
  if(e.button!==0) return;
  mouse.down=true; mouse.dragX=e.clientX; mouse.dragY=e.clientY; mouse.dragging=false;
  if(S.placing){
    const g=ghostSlot();
    if(!g.ok){ toast(g.why||'Can\'t place there','#ef5350'); sfx('error'); return; }
    // v8.5: SHIFT + hold + drag = lay down a whole row / block; it is placed when you let go (with a preview)
    if(e.shiftKey){ placeDrag={gx:g.gx,gy:g.gy,zone:g.zone}; return; }
    placeBuilding(S.placing,g.gx,g.gy,'p',g.zone,g.lvl);   // v8.4: lands on the level the ghost showed
    keepPlacing(1);
    return;
  }
});
cv.addEventListener('mousemove',e=>{
  mouse.x=e.clientX; mouse.y=e.clientY;
  const w=s2w(e.clientX,e.clientY);
  mouse.wx=w.x; mouse.wy=w.y;
  if(mouse.down && !mouse.dragging && Math.hypot(e.clientX-mouse.dragX,e.clientY-mouse.dragY)>7) mouse.dragging=true;
  if(mouse.dragging && !S.placing){
    dragBand={x1:mouse.dragX,y1:mouse.dragY,x2:e.clientX,y2:e.clientY};
  }
  hoverUnit(e);   // v8.3: hover a troop → its stat card (throttled + spatial-hash lookup = free with 1000 units)
});
// v8.3: HOVER INSPECT — the unit under the cursor, at most ~12×/s, html rebuilt only when it changes
let hoverU=null, hoverAt=0, hoverBuilt=0;
function hoverUnit(e){
  const now=performance.now();
  if(now-hoverAt<80) return; hoverAt=now;
  if(S.placing||mouse.dragging){ if(hoverU){ hoverU=null; hideTip(); } return; }
  let u=unitAt(mouse.wx,mouse.wy,26);
  if(u&&(u.dead||(isStealth(u)&&!u.revealed&&u.faction!==0))) u=null;   // can't inspect what you can't see
  if(u!==hoverU){ hoverU=u; hoverBuilt=now; if(u) showUnitTip(e,u); else hideTip(); return; }
  if(!u) return;
  if(now-hoverBuilt>400){ hoverBuilt=now; showUnitTip(e,u); }          // keep hp/dps live while it fights
  else moveTip(e);
}
window.addEventListener('mouseup',e=>{
  if(e.button!==0) return;
  if(!mouse.down) return;
  mouse.down=false;
  if(placeDrag){                                   // v8.5: SHIFT-drag → place the whole run on release
    const g=ghostSlot();
    if(S.placing) placeRun(placeDrag,g);
    placeDrag=null;
    mouse.dragging=false;
    return;
  }
  if(mouse.dragging){
    if(!S.placing && dragBand){
      const a=s2w(Math.min(dragBand.x1,dragBand.x2),Math.min(dragBand.y1,dragBand.y2));
      const b=s2w(Math.max(dragBand.x1,dragBand.x2),Math.max(dragBand.y1,dragBand.y2));
      if(e.ctrlKey){
        for(const u of playerUnits()){
          if(u.x>=a.x&&u.x<=b.x&&u.y>=a.y&&u.y<=b.y){ u.order={x:(a.x+b.x)/2,y:(a.y+b.y)/2}; if(!selUnits.includes(u)) selUnits.push(u); }
        }
      } else {
        const found=playerUnits().filter(u=>u.x>=a.x&&u.x<=b.x&&u.y>=a.y&&u.y<=b.y);
        selUnits = e.shiftKey ? [...new Set([...selUnits,...found])] : found;
      }
    }
    dragBand=null;
  } else {
    // click
    if(e.ctrlKey){
      for(const u of playerUnits()){
        if(Math.hypot(u.x-mouse.wx,u.y-mouse.wy)<18) u.order={x:mouse.wx,y:mouse.wy};
      }
    } else {
      const cb=buildingAt(mouse.wx,mouse.wy,'p');
      if(cb&&(cb.stored||0)>=1){
        const pay=collectStored(cb);
        if(pay>0){ toast(`💰 Collected $${fmt(pay)} from ${BUILD[cb.type].name}`,'#ffd54f'); return; }
      }
      const u=playerUnits().find(u=>Math.hypot(u.x-mouse.wx,u.y-mouse.wy)<18);
      if(u){
        if(e.shiftKey) selUnits.push(u);
        else selUnits=[u];
      } else selUnits=[];
    }
  }
  mouse.dragging=false;
});

// v8.4: with STACKS the TOP building wins. A stacked building is drawn lvl*STACK_UP px higher, so the
// click point is pushed back down by that lift before the footprint test = you click the crate you see.
// v8.5: KEEP PLACING — after dropping one, the next one from the stack is handed to the cursor, so you can
// build a whole row without going back to the backpack. When the stack runs out you get a nudge and it stops.
function keepPlacing(made){
  const t=S.placing; if(!t) return;
  if(refillHand()) return;                       // still holding one → keep going
  const d=BUILD[t];
  if(made>1) toast(`${made}\u00d7 ${d.name} placed — that was the last one`,'#5bc24e');
  else toast(`${d.name} placed — that was the last one`,'#5bc24e');
}
// v8.5: SHIFT-DRAG — lay out every footprint in the rectangle you dragged, stacking where the ground is taken
function placeRun(a,b){
  const t=S.placing, d=BUILD[t]; if(!t||!d) return 0;
  const spots=placeSpots(t,a,b,a.zone);
  let made=0;
  for(const sp of spots){
    if(made>0 && !refillHand()) break;           // out of stock
    if(!sp.ok) continue;
    placeBuilding(t,sp.gx,sp.gy,'p',a.zone,sp.lvl);
    made++;
  }
  if(made) toast(`${made}\u00d7 ${d.name} placed${made<spots.length?' (some spots were taken)':''}`,'#5bc24e');
  else { toast('Nothing placed — those spots are taken','#ef5350'); sfx('error'); }
  keepPlacing(made);
  return made;
}
function buildingAt(wx,wy,who){
  let best=null, bestLvl=-1;
  for(const b of S.buildings){
    const d=BUILD[b.type], lvl=b.lvl|0;
    const l=worldToPlot(b.owner??"p",wx,wy+lvl*STACK_UP,b.zone);   // v6: plot-local test (bot plots are rotated)
    const x=b.gx*SLOT, y=b.gy*SLOT;
    if(l.x>=x&&l.x<=x+d.w*SLOT&&l.y>=y&&l.y<=y+d.h*SLOT){
      if(who==="p"&&(b.owner??"p")!=="p") continue;
      if(who==="bot"&&(b.owner??"p")==="p") continue;
      if(lvl>=bestLvl){ bestLvl=lvl; best=b; }
    }
  }
  return best;
}
function cancelPlacement(){
  placeDrag=null;
  if(!S.placing) return;
  giveItem('b',S.placing);                     // v8.4: give it back (merges into its backpack stack)
  S.placing=null;
  toast('Placement cancelled — item returned to backpack','#8f9aa8');
}
