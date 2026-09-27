/* Military Base 2.5D — 02-shop.js · the SHOP: tabs (production / units / special / decor) + class sub-tabs */
'use strict';
const rarCol = r => (RAR[r]||RAR.common).c;
const rarBadge = r => `<span class="c-rar" style="background:${rarCol(r)}33;color:${rarCol(r)}">${(RAR[r]||RAR.common).label}</span>`;
function renderShop(){
  document.querySelectorAll('#shopTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===S.shopTab));
  // UNITS tab: sub-tabs per class (LIGHT / ARMORED / AIR / STEALTH)
  const subs=$('#shopSubs');
  subs.hidden = S.shopTab!=='units';
  if(!subs.hidden){
    subs.innerHTML='';
    for(const c of SHOP_SUBS){
      const bt=document.createElement('button');
      bt.textContent=`${CLASS_INFO[c].ico} ${CLASS_INFO[c].label}`;
      bt.classList.toggle('on',S.shopSub===c);
      bt.onclick=()=>{ sfx('click'); S.shopSub=c; renderShop(); };
      subs.appendChild(bt);
    }
  }
  const grid=$('#shopGrid'); grid.innerHTML='';
  const ids=Object.keys(BUILD).filter(k=>BUILD[k].tab===S.shopTab && BUILD[k].cost!==null && (S.shopTab!=='units'||BUILD[k].sub===S.shopSub));
  for(const id of ids){
    const d=BUILD[id];
    const card=document.createElement('div');
    card.className=`card r-${d.rar}`;
    card.style.borderColor=rarCol(d.rar)+'aa';
    const block=buyBlock(id);
    const locked=!!block;
    if(locked) card.classList.add('locked');
    const cvc=document.createElement('canvas'); cvc.width=130; cvc.height=64;
    drawItemIcon(cvc.getContext('2d'),id);
    card.appendChild(cvc);
    const nm=document.createElement('div'); nm.className='c-name';
    nm.innerHTML=rarBadge(d.rar);
    card.appendChild(nm);
    const nm2=document.createElement('div'); nm2.className='c-name'; nm2.textContent=d.name;
    card.appendChild(nm2);
    if(d.unit){ const u=UNITS[d.unit], cl=document.createElement('div'); cl.className='c-cls';
      cl.textContent=`${u.name} · ${u.cls.map(c=>CLASS_INFO[c].label).join('/')}`; card.appendChild(cl); }
    const cost=document.createElement('div'); cost.className='c-cost';
    cost.textContent=locked?(d.req&&S._power<d.req?`PWR ${fmt(d.req)}`:'LOCKED'):`${fmt(d.cost)}$`;
    card.appendChild(cost);
    const info=document.createElement('div'); info.className='c-info'; info.textContent=d.info;
    card.appendChild(info);
    card.onmouseenter=e=>showTip(e,id); card.onmousemove=moveTip; card.onmouseleave=hideTip;
    card.onclick=()=>{
      const blk=buyBlock(id);
      if(blk){ toast(blk,'#ef5350'); sfx('error'); return; }
      if(S.cash<d.cost){ toast('Not enough cash!','#ef5350'); sfx('error'); return; }
      S.cash-=d.cost;
      giveItem('b',id);
      toast(`Bought ${d.name} — check your BACKPACK`,'#5bc24e');
      sfx('buy');
      renderShop();
    };
    grid.appendChild(card);
  }
}
