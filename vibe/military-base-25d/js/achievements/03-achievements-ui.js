/* Military Base 2.5D — 03-achievements-ui.js · the 🏆 TROPHIES panel with progress bars */
'use strict';
// ---- achievements ----
function renderAchievements(){
  const list=$('#achList'); list.innerHTML='';
  let done=0;
  for(const a of ACHIEVEMENTS){
    let c=0,g=1; try{ [c,g]=a.prog(); }catch(e){}
    const got=S.achievements&&S.achievements[a.id]!=null; if(got) done++;
    const el=document.createElement('div'); el.className='rw-item'+(got?' done':'');
    const rw=a.give.cash?'$'+fmt(a.give.cash):a.give.crate.toUpperCase()+' CRATE';
    el.innerHTML=`<div class="rw-ico">${a.ico}</div><div class="rw-mid"><div class="rw-name">${a.name}</div>
      <div class="rw-sub">${a.desc} — ${fmt(Math.min(c,g))}/${fmt(g)}</div><div class="rw-reward">REWARD: ${rw}</div>
      <div class="ach-prog"><i style="width:${got?100:clamp01(c/g)*100}%"></i></div></div>
      <button class="rw-claim" disabled>${got?'✔ DONE':'LOCKED'}</button>`;
    list.appendChild(el);
  }
  $('#achSummary').textContent=`${done} / ${ACHIEVEMENTS.length} unlocked — rewards are paid automatically.`;
}
