/* Military Base 2.5D — 04-crates.js · crate rolls, pity (80), the crate-opening modal */
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
function giveItem(kind,type){
  if(kind==='b') S.inventory.push({kind:'b',type});
  else S.inventory.push({kind:'c',type});
}
function openCrateModal(ct){
  const item=rollCrate(ct);
  S.stats.cratesOpened++;
  let prev=$('#p-crate').classList.contains('show') ? S._prevPanel : (document.querySelector('.panel.show')?.id||'p-backpack').slice(2);
  S._prevPanel = prev.startsWith('p-')?prev.slice(2):prev;
  openPanel('crate');
  const icon=$('#crateIcon'), g=icon.getContext('2d');
  drawCrateIcon(g,ct);
  $('#crateName').textContent='? ? ?';
  $('#crateRar').textContent='';
  $('#crateStage').classList.add('opening');
  sfx('open');
  let i=0;
  const iv=setInterval(()=>{
    i++;
    const fake=pick([...CRATE_TABLES[ct==='premium'?'premium':ct],...CRATE_TABLES.premium]);
    $('#crateName').textContent=BUILD[fake].name;
    if(i>14){
      clearInterval(iv);
      const d=BUILD[item];
      $('#crateName').textContent=d.name;
      $('#crateRar').textContent=d.rar.toUpperCase();
      $('#crateRar').style.color=RAR[d.rar].c;
      $('#crateStage').classList.remove('opening');
      // draw item icon
      g.clearRect(0,0,150,110);
      g.save(); g.translate(75,96);
      const sp=SPR[item];
      const sc=Math.min(84/sp.h,110/sp.w)*.9;
      g.scale(sc,sc); sp.draw(g,performance.now()/1000,{side:'p'});
      g.restore();
      sfx('coin');
    }
  },70);
  giveItem('b',item);
}
$('#btnCrateDone').onclick=()=>{
  closePanel('crate');
  if(S._prevPanel && S._prevPanel!=='crate') openPanel(S._prevPanel);
  sfx('click');
};
