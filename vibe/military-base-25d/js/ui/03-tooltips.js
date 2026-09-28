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
  if(d.water) row('Terrain','\u2693 WATER — place it in your water yard behind the island');
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
// v8.3: hover a troop → its card. Same skin as the building tooltip.
function unitTipHTML(u){
  const d=unitDef(u), cls=unitCls(u);
  const col = u.boss?'#ef5350' : (u.faction===0?'#5bc24e':facC(u.faction));
  let h=`<div class="t-h" style="color:${col}">${u.boss?'MECHA WORM':d.name}</div>`;
  h+=`<div class="dim">${u.side==='p'?'YOUR TROOP':facN(u.faction)+' TROOP'} \u00b7 ${cls.map(c=>CLASS_INFO[c].ico+' '+CLASS_INFO[c].label).join(' ')}`
    + `${d.sea?' \u00b7 \u2693 NAVAL':''}${d.fly?' \u00b7 FLYER':''}${d.heal?' \u00b7 MEDIC':''}</div><div class="t-g">`;
  const row=(k,v)=>{ h+=`<span>${k}</span><span>${v}</span>`; };
  row('HP',`${Math.ceil(u.hp)} / ${Math.round(u.maxHp)}`);
  if(d.dmg){ row('Damage',`${d.dmg} / ${d.rate}s`); row('DPS',(d.dmg/d.rate).toFixed(1)); row('vs buildings','\u00d7'+(d.bld??1)); }
  else if(d.heal) row('Heals',`${d.heal} hp/s`);
  if(d.splash) row('Splash',d.splash+'px');
  row('Range',d.range); row('Speed',d.speed);
  row('Troop cap',`${u.boss?0:(d.size||1)} slot${(d.size||1)>1?'s':''}`);
  if(d.armor) row('Armor',d.armor);
  if(d.detect) row('Detect',d.detect+'px');
  if(d.buff) row('Aura',`allies +${Math.round((d.buff.dmg-1)*100)}% dmg within ${d.buff.r}px`);
  if(!u.boss) row('Bounty',`$${fmt(killReward(u))}`);
  row('Order', u.order ? (u.order.bid?'assault that base':(u.order.point!==undefined?'capture point':'move here'))
      : (u.home!=null?'garrison':(u.wd!=null?'base defence':(isSea(u)?'sail the lanes':'march on the CITY'))));
  h+='</div>';
  if(d.mods&&Object.keys(d.mods).length) h+=`<div class="t-m">${modTxt(d.mods)}</div>`;
  if(u.revealed&&isStealth(u)) h+='<div class="t-m dim">DETECTED</div>';
  return h;
}
function showUnitTip(e,u){ const t=$('#tip'); t.innerHTML=unitTipHTML(u); t.hidden=false; moveTip(e); }
function showTip(e,id){ const t=$('#tip'); t.innerHTML=tipHTML(id); t.hidden=false; moveTip(e); }
function moveTip(e){ const t=$('#tip'); if(t.hidden) return;
  const w=t.offsetWidth||220, hh=t.offsetHeight||180;
  let x=e.clientX+16, y=e.clientY+12;
  if(x+w>innerWidth-8) x=e.clientX-w-16;
  if(y+hh>innerHeight-8) y=innerHeight-hh-8;
  t.style.left=x+'px'; t.style.top=y+'px'; }
function hideTip(){ const t=document.getElementById('tip'); if(t) t.hidden=true; }
