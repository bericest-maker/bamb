/* Military Base 2.5D — 07-rebirth.js · rebirth: power threshold, reset, permanent income bonus */
'use strict';
function renderRebirth(){
  const T=5000*Math.pow(2.2,S.rebirth);
  const cur=S._power;
  $('#rbInfo').innerHTML=`
    Current rebirths: <b>${S.rebirth}</b> (+${S.rebirth*10}% income)<br>
    Next rebirth: <b>+${(S.rebirth+1)*10}% income</b> forever<br>
    Requires power: <b>${fmt(T)}</b> (you have ${fmt(cur)})<br>
    <span class="dim" style="font-size:11px">Resets your base, units, points &amp; cash. Golden buildings and Monuments survive. 1st rebirth unlocks the Monument.</span>
    <div class="rb-prog"><i style="width:${clamp01(cur/T)*100}%"></i></div>`;
  const btn=$('#btnRebirthYes');
  btn.style.filter = cur>=T?'none':'grayscale(.7) opacity(.7)';
}
function doRebirth(force){
  const T=5000*Math.pow(2.2,S.rebirth);
  if(!force && S._power<T){ toast(`Need ${fmt(T)} power to rebirth`,'#ef5350'); sfx('error'); return; }
  const golden=S.buildings.filter(b=>isMine(b)&&(BUILD[b.type].rar==='gold'||BUILD[b.type].keep)); // golden + Monument survive
  S.cash=500; S.rebirth++;
  S.buildings=golden;
  for(let i=0;i<S.bots.length;i++) setBotPreset(i,S.bots[i].preset,true);
  S.units=[];
  for(const p of S.points){ p.owner='neutral'; p.faction=-1; p.cool=0; p.respawnT=8; }
  S.wave=0; S.nextWave=90; S.nextBoss=180; S.attackCity=false; selUnits=[];
  toast(`🔥 REBIRTHED! Income +${S.rebirth*10}% — the war for the CITY restarts`,'#ffd54f');
  sfx('rebirth');
  save();
  closePanel('rebirth');
  { const pc=plotCentre(); cam.tx=pc.x; cam.ty=pc.y; }
}
$('#btnRebirthYes').onclick=()=>doRebirth(false);
