/* Military Base 2.5D — 06-settings.js · settings toggles, code redemption, hard reset */
'use strict';
function renderSettings(){
  const set=S.settings;
  const map=[['#setMusic',set.music],['#setSfx',set.sfx],['#setDmg',set.dmg]];
  for(const [id,v] of map){
    const b=$(id); b.classList.toggle('on',v); b.textContent=v?'On':'Off';
  }
  const gfx=$('#setGfx'); gfx.classList.toggle('on',set.gfx==='High'); gfx.textContent=set.gfx;
}
function bindToggle(id,key,label){
  $(id).onclick=()=>{
    if(key==='gfx'){ S.settings.gfx = S.settings.gfx==='High'?'Low':'High'; }
    else S.settings[key]=!S.settings[key];
    sfx('click'); renderSettings();
  };
}
bindToggle('#setMusic','music'); bindToggle('#setSfx','sfx'); bindToggle('#setDmg','dmg'); bindToggle('#setGfx','gfx');
$('#codeBox').addEventListener('keydown',e=>{
  if(e.key!=='Enter') return;
  const code=e.target.value.trim().toUpperCase();
  if(!code) return;
  const c=CODES[code];
  if(!c){ toast(`Code "${code}" not found or expired`,'#ef5350'); sfx('error'); return; }
  if(S.codes[code]){ toast('Code already redeemed!','#ef5350'); sfx('error'); return; }
  S.codes[code]=true;
  if(c.cash) S.cash+=c.cash;
  if(c.kind==='b') giveItem('b',c.type);
  if(c.kind==='c') giveItem('c',c.type);
  toast(`✅ CODE ${code}: ${c.msg}`,'#5bc24e');
  sfx('coin');
  e.target.value='';
});
$('#btnWipe').onclick=()=>{
  if(confirm('HARD RESET — delete ALL progress?')){
    localStorage.removeItem('bmb25');
    location.reload();
  }
};
