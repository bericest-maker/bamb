/* Military Base 2.5D — 04-backpack.js · the BACKPACK: place buildings, open crates */
'use strict';
function drawItemIcon(g,type){
  g.clearRect(0,0,130,64);
  const sp=SPR[type];
  const sc=Math.min(52/sp.h,110/sp.w);
  g.save(); g.translate(65,58); g.scale(sc,sc);
  sp.draw(g,0.6,{side:'p'});
  g.restore();
}
function renderBackpack(){
  const grid=$('#bpGrid'); grid.innerHTML='';
  if(S.inventory.length===0){
    grid.innerHTML='<div style="color:var(--dim);font-size:12px;grid-column:1/-1;padding:20px;text-align:center">Empty. Hit the SHOP →</div>';
    return;
  }
  S.inventory.forEach((it,idx)=>{
    const card=document.createElement('div');
    const d=BUILD[it.type]||{name:'?'};
    card.className=`card r-${it.kind==='c'?'legend':(d.rar||'common')}`;
    card.style.borderColor=rarCol(it.kind==='c'?'legend':(d.rar||'common'))+'aa';
    if(it.kind==='c') card.style.borderColor='#f5b53f';
    const cvc=document.createElement('canvas'); cvc.width=130; cvc.height=64;
    if(it.kind==='c') drawCrateIconMini(cvc.getContext('2d'),it.type);
    else drawItemIcon(cvc.getContext('2d'),it.type);
    card.appendChild(cvc);
    const nm=document.createElement('div'); nm.className='c-name'; nm.textContent= it.kind==='c' ? it.type.toUpperCase()+' CRATE' : d.name;
    card.appendChild(nm);
    const sub=document.createElement('div'); sub.className='c-info';
    sub.textContent= it.kind==='c' ? 'Click to open' : 'Click to place on your plot';
    card.appendChild(sub);
    card.onclick=()=>{
      if(it.kind==='c'){ openCrateModal(it.type); S.inventory.splice(idx,1); }
      else {
        S.inventory.splice(idx,1);
        S.placing=it.type;
        closePanel('backpack');
        toast(`Placing ${d.name} — click a free plot slot. RMB to cancel.`,'#4a90e2');
      }
      renderBackpack();
    };
    grid.appendChild(card);
  });
}
function drawCrateIconMini(g,type){
  g.clearRect(0,0,130,64);
  g.save(); g.translate(65,56); g.scale(1.1,1.1);
  g.fillStyle='#8a6f4d'; g.fillRect(-20,-26,40,28);
  g.fillStyle='#a3865c'; g.fillRect(-20,-26,40,5);
  g.strokeStyle='#6b5436'; g.lineWidth=2; g.strokeRect(-20,-26,40,28);
  const col={standard:'#8f9aa8',elite:'#4a90e2',premium:'#f5a53f',golden:'#ffd54f'}[type]||'#fff';
  g.fillStyle=col; g.fillRect(-20,-15,40,4);
  g.restore();
}
