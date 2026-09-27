/* Military Base 2.5D — 06-settings.js · settings toggles, graphics modes, code redemption, hard reset */
'use strict';
// on/off rows: [button id, S.settings key]
const SET_BOOL=[['#setMusic','music'],['#setSfx','sfx'],['#setDmg','dmg'],
                ['#setTrees','trees'],['#setBotGrid','botGrid'],['#setIndestruct','indestruct']];
// two-mode rows: [button id, S.settings key, "high quality" value] — clicking flips to the other mode
const SET_MODE=[['#setGfx','gfx','High'],['#setUnits','units','Normal'],['#setBlds','blds','Normal']];
function renderSettings(){
  const set=S.settings;
  for(const [id,key] of SET_BOOL){
    const b=$(id); b.classList.toggle('on',!!set[key]); b.textContent=set[key]?'On':'Off';
  }
  for(const [id,key,hi] of SET_MODE){
    const b=$(id), v=set[key];
    b.textContent=v; b.classList.toggle('on',v===hi);
  }
}
function bindToggle(id,key,label){
  $(id).onclick=()=>{
    const mode=SET_MODE.find(m=>m[1]===key);
    if(mode) S.settings[key] = S.settings[key]===mode[2] ? (mode[2]==='High'?'Low':'Potato') : mode[2];
    else S.settings[key]=!S.settings[key];
    sfx('click'); save(); renderSettings();
  };
}
for(const [id,key] of SET_BOOL) bindToggle(id,key);
for(const [id,key] of SET_MODE) bindToggle(id,key);
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
