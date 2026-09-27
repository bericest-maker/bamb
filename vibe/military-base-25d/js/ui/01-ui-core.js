/* Military Base 2.5D — 01-ui-core.js · toasts + panel show/hide + the top-bar / rail / HUD buttons */
'use strict';
// ================= UI =================
function toast(msg,col='#f5b53f'){
  const t=document.createElement('div');
  t.className='toast'; t.style.borderLeftColor=col; t.textContent=msg;
  $('#toasts').appendChild(t);
  setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(),450); },3800);
}
const PANEL_IDS=['shop','backpack','rewards','achieve','leader','robux','settings','rebirth','patch','crate'];
function openPanel(name){
  if(name!=='crate') for(const id of PANEL_IDS) $('#p-'+id).classList.toggle('show',id===name);
  else $('#p-crate').classList.add('show');
  if(name==='shop') renderShop();
  if(name==='backpack') renderBackpack();
  if(name==='rewards') renderRewards();
  if(name==='robux') renderRobux();
  if(name==='settings') renderSettings();
  if(name==='rebirth') renderRebirth();
  if(name==='achieve') renderAchievements();
  if(name==='leader') renderLeaderboard();
  if(name==='patch') renderPatchNotes();
  hideTip();
}
function closePanel(name){ $('#p-'+name).classList.remove('show'); if(name!=='crate') for(const id of PANEL_IDS) if(id!==name) $('#p-'+id).classList.remove('show'); }



// buttons
$('#btnShop').onclick=()=>{ sfx('click'); openPanel('shop'); };
$('#btnHome').onclick=()=>{
  sfx('click');
  cancelPlacement();
  for(const id of PANEL_IDS) $('#p-'+id).classList.remove('show');
  { const pc=plotCentre(); cam.tx=pc.x; cam.ty=pc.y; }
};
document.querySelectorAll('.rail-btn').forEach(b=>{
  b.onclick=()=>{ sfx('click'); openPanel(b.dataset.panel); };
});
document.querySelectorAll('[data-close]').forEach(b=>{
  b.onclick=()=>{ sfx('click'); const p=b.closest('.panel'); if(p) closePanel(p.id.slice(2)); };
});
document.querySelectorAll('#shopTabs button').forEach(b=>{
  b.onclick=()=>{ sfx('click'); S.shopTab=b.dataset.tab; renderShop(); };
});
$('#btnAttack').onclick=()=>{
  sfx('click');
  const punits=playerUnits().filter(u=>u.home==null&&u.wd==null);   // point + base garrisons stay home
  if(punits.length===0){ toast('No units to attack with! Build a Barracks first.','#ef5350'); return; }
  S.attackCity=true;
  for(const u of punits) u.order=null;
  toast('⚔️ ATTACK! All units heading to the CITY!','#d6493f');
};
