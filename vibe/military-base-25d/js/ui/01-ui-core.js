/* Military Base 2.5D — 01-ui-core.js · toasts + panel show/hide + the top-bar / rail / HUD buttons */
'use strict';
// ================= UI =================
function toast(msg,col='#f5b53f'){
  const t=document.createElement('div');
  t.className='toast'; t.style.borderLeftColor=col; t.textContent=msg;
  $('#toasts').appendChild(t);
  setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(),450); },3800);
}
const PANEL_IDS=['shop','backpack','rewards','achieve','leader','robux','settings','rebirth','patch','quests','crate','openq'];
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
  if(name==='quests') renderQuests();
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
  if(!b.dataset.panel) return;   // v8.14: #btnExpand has no panel — bound separately below
  b.onclick=()=>{ sfx('click'); openPanel(b.dataset.panel); };
});
// v8.14: EXPAND rail toggle + cash-bar "+" shortcut (both guarded: absent in preview.html)
let railOpen=false;
function toggleExpand(){
  railOpen=!railOpen;
  document.querySelectorAll('.rail-extra').forEach(b=>b.classList.toggle('show',railOpen));
  const i=$('#expIco'),l=$('#expLbl');
  if(i) i.textContent=railOpen?'➖':'➕';
  if(l) l.textContent=railOpen?'CLOSE':'EXPAND';
}
{ const be=$('#btnExpand'); if(be) be.onclick=()=>{ sfx('click'); toggleExpand(); }; }
{ const bc=$('#btnCashPlus'); if(bc) bc.onclick=()=>{ sfx('click'); openPanel('robux'); }; }
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
