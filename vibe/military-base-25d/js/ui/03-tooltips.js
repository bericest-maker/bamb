/* Military Base 2.5D — 03-tooltips.js · hover stat tooltips (cost, size, damage modifiers, turrets…) */
'use strict';
const modTxt = m => { const e=Object.entries(m||{}); if(!e.length) return '<i class="dim">no modifiers</i>';
  return e.map(([c,v])=>`${CLASS_INFO[c].label} <b class="${v===0?'no':v>=1?'up':'dn'}">${v===0?'✖':'×'+v}</b>`).join(' · '); };
function tipHTML(id){
  const d=BUILD[id]; let h=`<div class="t-h" style="color:${rarCol(d.rar)}">${d.name}</div><div class="dim">${d.info}</div><div class="t-g">`;
  const row=(k,v)=>{ h+=`<span>${k}</span><span>${v}</span>`; };
  if(d.cost) row('Cost','$'+fmt(d.cost));
  row('Size',`${d.w}×${d.h}`); row('Power',fmt(d.power)); row('HP',fmt(d.hp));
  if(d.income) row('Income',`$${fmt(d.income)}/s`);
  if(d.cap) row('Money capacity',`$${fmt(d.cap)} · pays out every ${d.cycle||MONEY_CYCLE}s`);
  if(d.unit&&d.wdCap) row('Wave defense',`${d.wdCap} free defenders`);
  if(d.req) row('Needs',`${fmt(d.req)} PWR`);
  if(d.reqRebirth) row('Needs',`${d.reqRebirth} rebirth`);
  if(d.turret){ const T=d.turret; row('Turret',`${T.dmg} dmg / ${T.rate}s · ${T.range}px${T.splash?' · splash':''}`); }
  if(d.detect) row('Detect',d.detect+'px');
  if(d.heal) row('Heal',`${d.heal} hp/s · ${d.healR}px`);
  if(d.unit){
    const u=UNITS[d.unit];
    row('Trains',`${u.name} / ${d.spawnEvery}s`);
    row('Garrison',`${wdCapOf(d)} free ${u.name}${wdCapOf(d)>1?'s':''} while a raid is incoming`);
    row('Class',u.cls.map(c=>CLASS_INFO[c].ico+' '+CLASS_INFO[c].label).join(' '));
    row('HP',u.hp); if(u.dmg) row('Damage',`${u.dmg} / ${u.rate}s (${(u.dmg/u.rate).toFixed(1)} dps)`);
    if(u.heal) row('Heals',`${u.heal} hp/s`);
    row('Range',u.range); row('Speed',u.speed); row('Troop slots',u.size);
    if(u.sea) row('Terrain','WATER — sails the shipping lanes');
    row('Bounty',`$${fmt(killReward({type:d.unit,maxHp:u.hp}))} (+ more for buffed waves)`);
    if(u.armor) row('Armor',u.armor); if(u.detect) row('Detect',u.detect+'px');
    if(u.splash) row('Splash',u.splash+'px'); if(u.bld) row('vs buildings','×'+u.bld);
    if(u.buff) row('Aura',`allies +${Math.round((u.buff.dmg-1)*100)}% damage within ${u.buff.r}px`);
    h+=`</div><div class="t-m">${modTxt(u.mods)}</div>`;
    if(u.fly) h+=`<div class="t-m dim">Flies, but counts as LIGHT (anti-air can't hit it)</div>`;
    return h;
  }
  if(d.turret) return h+`</div><div class="t-m">${modTxt(d.turret.mods)}</div>`;
  return h+'</div>';
}
function showTip(e,id){ const t=$('#tip'); t.innerHTML=tipHTML(id); t.hidden=false; moveTip(e); }
function moveTip(e){ const t=$('#tip'); if(t.hidden) return;
  const w=t.offsetWidth||220, hh=t.offsetHeight||180;
  let x=e.clientX+16, y=e.clientY+12;
  if(x+w>innerWidth-8) x=e.clientX-w-16;
  if(y+hh>innerHeight-8) y=innerHeight-hh-8;
  t.style.left=x+'px'; t.style.top=y+'px'; }
function hideTip(){ const t=document.getElementById('tip'); if(t) t.hidden=true; }
