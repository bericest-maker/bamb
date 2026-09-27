/* Military Base 2.5D — 05-rewards-ui.js · the REWARDS panel (claim buttons) */
'use strict';
function renderRewards(){
  const list=$('#rwList'); list.innerHTML='';
  for(const r of REWARDS){
    const el=document.createElement('div'); el.className='rw-item';
    const done=S.rewards[r.id];
    const can=r.check()&&!done;
    el.innerHTML=`
      <div class="rw-ico">${r.ico}</div>
      <div class="rw-mid">
        <div class="rw-name">${r.name}</div>
        <div class="rw-sub">${r.sub}</div>
        <div class="rw-reward">REWARD: ${r.reward}</div>
      </div>
      <button class="rw-claim" ${can?'':'disabled'}>${done?'DONE':'CLAIM'}</button>`;
    el.querySelector('.rw-claim').onclick=()=>{
      if(!can) return;
      S.rewards[r.id]=true;
      if(r.give.cash) S.cash+=r.give.cash;
      if(r.give.crate) giveItem('c',r.give.crate);
      toast(`Reward claimed: ${r.reward}`,'#5bc24e');
      sfx('coin');
      renderRewards();
    };
    list.appendChild(el);
  }
}
