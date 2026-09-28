/* Military Base 2.5D — 04-crates.js · crate rolls, pity (80), BACKPACK STACKS + bulk opening (v8.4) */
'use strict';
function weightedPick(entries){
  let tot=0; for(const e of entries) tot+=e[1];
  let r=Math.random()*tot;
  for(const e of entries){ r-=e[1]; if(r<=0) return e[0]; }
  return entries[0][0];
}
function featuredPremium(){ return WEEKLY[Math.floor(Date.now()/86400000)%WEEKLY.length]; }  // fixed: was WEEK.length (ReferenceError)
function rollCrate(ct){
  if(ct==='premium'){
    S.premiumPity=(S.premiumPity||0)+1;
    if(S.premiumPity>=80){ S.premiumPity=0; return featuredPremium(); }
    if(Math.random()<.15) return featuredPremium();
    return weightedPick(CRATE_TABLES.premium);
  }
  return weightedPick(CRATE_TABLES[ct]);
}
// ---- v8.4: BACKPACK STACKS — one card per (kind,type); `n` is how many you hold ----
function invFind(kind,type){ return S.inventory.find(it=>it.kind===kind&&it.type===type); }
function invCount(kind,type){ const it=invFind(kind,type); return it?(it.n||1):0; }
// add n (default 1) of an item — merges into the stack that is already there
function giveItem(kind,type,n=1){
  n=Math.max(1,Math.round(Number(n))||1);
  const it=invFind(kind,type);
  if(it){ it.n=(it.n||1)+n; return n; }
  S.inventory.push({kind,type,...(n>1?{n}:{})});
  return n;
}
// take n out of a stack (removes the card when the last one goes) → how many you really got
function takeItem(kind,type,n=1){
  n=Math.max(1,Math.round(Number(n))||1);
  const it=invFind(kind,type); if(!it) return 0;
  const have=it.n||1, got=Math.min(n,have);
  if(got>=have) S.inventory=S.inventory.filter(x=>x!==it); else it.n=have-got;
  return got;
}
// v8.4: saves made before stacking hold one entry per item — fold the duplicates together
function mergeInventory(list){
  const out=[];
  for(const it of list||[]){
    if(!it) continue;
    const f=out.find(x=>x.kind===it.kind&&x.type===it.type);
    if(f) f.n=(f.n||1)+(it.n||1);
    else out.push({kind:it.kind,type:it.type,n:it.n||1});
  }
  for(const it of out) if((it.n||1)<=1) delete it.n;   // a single item stays a plain card
  return out;
}
// v8.4: open 1, 5, 10 or ALL at once — every roll is listed when the crates finish opening
function openCrateModal(ct,want){
  const n=takeItem('c',ct,Math.max(1,Math.round(Number(want))||1));
  if(!n){ toast(`No ${ct} crates in your backpack`,'#ef5350'); sfx('error'); return 0; }
  const wins=[]; for(let i=0;i<n;i++) wins.push(rollCrate(ct));
  for(const w of wins) giveItem('b',w);
  S.stats.cratesOpened+=n;
  const showing=document.querySelector('.panel.show');
  const prevId=showing?String(showing.id||'').replace(/^p-/,''):'';
  if(!S._prevPanel||S._prevPanel==='crate'||S._prevPanel==='openq')
    S._prevPanel=(prevId&&prevId!=='crate'&&prevId!=='openq')?prevId:'backpack';
  openPanel('crate');
  const icon=$('#crateIcon'), g=icon.getContext('2d');
  drawCrateIcon(g,ct);
  $('#crateName').textContent=n>1?`OPENING ${n}\u2026`:'? ? ?';
  $('#crateRar').textContent='';
  $('#crateList').innerHTML='';
  $('#crateStage').classList.add('opening');
  sfx('open');
  let best=wins[0];                                   // the rarest win is the one on display
  for(const w of wins) if(RAR_ORDER.indexOf(BUILD[w].rar)>RAR_ORDER.indexOf(BUILD[best].rar)) best=w;
  let i=0;
  const iv=setInterval(()=>{
    i++;
    // fixed (v8.4): a table row is [id,weight] — the shuffle showed the ROW, so BUILD[fake] was undefined and the reveal never happened
    const fake=pick([...CRATE_TABLES[ct==='premium'?'premium':ct],...CRATE_TABLES.premium])[0];
    $('#crateName').textContent=BUILD[fake].name;
    if(i>12){
      clearInterval(iv);
      const d=BUILD[best];
      $('#crateName').textContent = n>1 ? `${n}\u00d7 ${ct.toUpperCase()} CRATE` : d.name;
      $('#crateRar').textContent  = n>1 ? `YOU GOT ${wins.length} ITEM${wins.length>1?'S':''}` : d.rar.toUpperCase();
      $('#crateRar').style.color  = n>1 ? '#ffd54f' : RAR[d.rar].c;
      $('#crateStage').classList.remove('opening');
      // results list: one row per different item, rarest first
      const tally=new Map();
      for(const w of wins) tally.set(w,(tally.get(w)||0)+1);
      const rows=[...tally.entries()].sort((a,b)=>RAR_ORDER.indexOf(BUILD[b[0]].rar)-RAR_ORDER.indexOf(BUILD[a[0]].rar));
      $('#crateList').innerHTML=rows.map(([w,c])=>{
        const dd=BUILD[w], col=(RAR[dd.rar]||RAR.common).c;
        return `<div class="cl-row"><i class="cl-dot" style="background:${col}"></i>`
             + `<span class="cl-name" style="color:${col}">${dd.name}</span>`
             + `<span class="cl-n">${c>1?'\u00d7'+c:''}</span></div>`;
      }).join('');
      // draw the best item's icon
      g.clearRect(0,0,150,110);
      g.save(); g.translate(75,96);
      const sp=SPR[best];
      if(sp){ const sc=Math.min(84/sp.h,110/sp.w)*.9; g.scale(sc,sc); sp.draw(g,performance.now()/1000,{side:'p'}); }
      g.restore();
      sfx('coin');
    }
  },70);
  return n;
}
// v8.4: "open how many?" — the chooser you get when you click a stack of crates
let openQType=null;
function askOpenCount(ct){
  const have=invCount('c',ct);
  if(have<=0){ toast(`No ${ct} crates in your backpack`,'#ef5350'); sfx('error'); return; }
  if(have<=1){ openCrateModal(ct,1); return; }   // just one? open it
  openQType=ct;
  openPanel('openq');
  $('#oqName').textContent=ct.toUpperCase()+' CRATE';
  $('#oqSub').textContent=`You have ${have}. Open how many?`;
  const btns=$('#oqBtns'); btns.innerHTML='';
  const opts=[1,5,10,have].filter(v=>v<=have).filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a-b);
  for(const v of opts){
    const b=document.createElement('button');
    b.className='pill big'+(v===have?'':' ghost');
    b.textContent=v===have?`ALL (${v})`:`\u00d7${v}`;
    b.onclick=()=>{ sfx('click'); closePanel('openq'); openCrateModal(ct,v); renderBackpack(); };
    btns.appendChild(b);
  }
}
$('#btnCrateDone').onclick=()=>{
  closePanel('crate');
  if(S._prevPanel && S._prevPanel!=='crate') openPanel(S._prevPanel);
  sfx('click');
};
