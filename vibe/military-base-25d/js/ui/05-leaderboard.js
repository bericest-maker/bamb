/* Military Base 2.5D — 05-leaderboard.js · the 📊 leaderboard: 8 factions by power, flags held */
'use strict';
// ---- leaderboard (structure power + army power, like the original's StructurePower) ----
function renderLeaderboard(){
  const ps=powerSplit();
  const rows=[{f:0,name:'YOU',power:ps.total,structure:ps.structure,army:ps.army}];
  for(let i=0;i<S.bots.length;i++){
    const bp=botPower(i), down=S.bots[i].down;
    rows.push({f:i+1,name:`${facN(i+1)} · ${BOT_DEFS[i].name}`,power:down?0:bp.total,
      structure:down?0:bp.structure,army:down?0:bp.army,down});
  }
  for(const r of rows) r.pts=S.points.filter(p=>pointFaction(p)===r.f).map(p=>p.city?'🏙️':'🚩').join('');
  rows.sort((a,b)=>b.power-a.power);
  const list=$('#lbList'); list.innerHTML='';
  rows.forEach((r,i)=>{
    const el=document.createElement('div'); el.className='lb-row'+(r.f===0?' me':'');
    el.innerHTML=`<span class="lb-rank">${['🥇','🥈','🥉'][i]||'#'+(i+1)}</span><span class="lb-dot" style="background:${facC(r.f)}"></span>
      <span>${r.name}${r.down?' <span class="dim">(rebuilding)</span>':''}</span><span class="lb-pts">${r.pts||'—'}</span>
      <span class="lb-pwr" title="structure power / army power">⭐ ${fmt(r.power)} <span class="dim">🏗️${fmt(r.structure||0)} · 🪖${fmt(r.army||0)}</span></span>`;
    list.appendChild(el);
  });
}
