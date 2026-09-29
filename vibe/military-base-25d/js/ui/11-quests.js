/* Military Base 2.5D — 11-quests.js · daily/weekly quests + tokens, weather icon */
'use strict';
// ================= quests (📋 QUESTS panel, per the original-UI screenshot) =================
// Daily: 3 quests, reset every calendar day. Weekly: 2 quests, reset every 7 days.
// Each quest snapshots its stat at roll time (base); progress = now - base.
const QUEST_DAILY=[
  {id:'d_place', ico:'🏗️', name:'Place 8 buildings', stat:'placed', goal:8, cash:5000, tokens:1},
  {id:'d_kill', ico:'💥', name:'Defeat 25 enemies', stat:'kills', goal:25, cash:5000, tokens:1},
  {id:'d_cap', ico:'🚩', name:'Capture 2 points', stat:'captures', goal:2, cash:8000, tokens:1},
  {id:'d_crate', ico:'📦', name:'Open 3 crates', stat:'cratesOpened', goal:3, cash:4000, tokens:1},
  {id:'d_pow', ico:'⭐', name:'Reach 5,000 power', stat:'power', goal:5000, cash:6000, tokens:1},
  {id:'d_play', ico:'🕐', name:'Play 10 minutes', stat:'time', goal:600, cash:3000, tokens:1},
];
const QUEST_WEEKLY=[
  {id:'w_kill', ico:'☠️', name:'Defeat 500 enemies', stat:'kills', goal:500, crate:'premium', tokens:3},
  {id:'w_place', ico:'🏙️', name:'Place 50 buildings', stat:'placed', goal:50, crate:'elite', tokens:3},
  {id:'w_cap', ico:'🗺️', name:'Capture 10 points', stat:'captures', goal:10, cash:50000, tokens:3},
  {id:'w_boss', ico:'🐍', name:'Slay the worm 3 times', stat:'bosses', goal:3, crate:'premium', tokens:4},
  {id:'w_crate', ico:'🎁', name:'Open 25 crates', stat:'cratesOpened', goal:25, crate:'elite', tokens:3},
];
const QUEST_DEFS={}; for(const q of [...QUEST_DAILY,...QUEST_WEEKLY]) QUEST_DEFS[q.id]=q;
const TOKEN_SHOP=[['standard',5],['elite',15],['premium',30]];
function qstat(stat){
  if(stat==='power'){ try{ return totalPower(); }catch(e){ return 0; } }
  if(stat==='time') return S.time||0;
  return (S.stats&&S.stats[stat])||0;
}
function dayStr(d){ d=d||new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function weekStr(){ return Math.floor(Date.now()/604800000); }
function rollQuests(pool,n){
  const ids=pool.map(q=>q.id);
  for(let i=ids.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]]; }
  return ids.slice(0,n).map(qid=>({qid, base:qstat(QUEST_DEFS[qid].stat), done:false}));
}
function ensureQuests(){
  if(!S.quests) S.quests={tokens:0, daily:[], weekly:[], day:'', week:-1};
  const Q=S.quests, d=dayStr();
  if(Q.day!==d){ const had=Q.day!==''; Q.day=d; Q.daily=rollQuests(QUEST_DAILY,3); if(had&&S.time>0) toast('📋 New daily quests!'); }
  const w=weekStr();
  if(Q.week!==w){ const had=Q.week!==-1; Q.week=w; Q.weekly=rollQuests(QUEST_WEEKLY,2); if(had&&S.time>0) toast('📋 New weekly quests!'); }
}
function questProg(q){ const def=QUEST_DEFS[q.qid]; return [Math.max(0,Math.min(def.goal,qstat(def.stat)-q.base)), def.goal]; }
function questRewardTxt(def){ return (def.cash?'$'+fmt(def.cash):def.crate[0].toUpperCase()+def.crate.slice(1)+' Crate')+` + ${def.tokens}🎫`; }
function claimableCount(){
  if(!S.quests) return 0;
  let n=0;
  for(const q of [...S.quests.daily,...S.quests.weekly]){ if(q.done) continue; const [c,g]=questProg(q); if(c>=g) n++; }
  return n;
}
function claimQuest(kind,idx){
  ensureQuests();
  const q=S.quests[kind][idx]; if(!q||q.done) return;
  const def=QUEST_DEFS[q.qid], [c,g]=questProg(q);
  if(c<g) return;
  q.done=true;
  if(def.cash) S.cash+=def.cash;
  if(def.crate) giveItem('c',def.crate);
  S.quests.tokens+=def.tokens;
  toast(`📋 Quest complete: ${def.name} — ${questRewardTxt(def)}`,'#57e389');
  sfx('capture');
  renderQuests();
}
function buyTokenCrate(ct){
  ensureQuests();
  const cost=TOKEN_SHOP.find(r=>r[0]===ct)[1];
  if(S.quests.tokens<cost){ toast('Not enough quest tokens!','#ef5350'); sfx('error'); return; }
  S.quests.tokens-=cost;
  giveItem('c',ct);
  toast(`🎫 ${cost} tokens → ${ct[0].toUpperCase()+ct.slice(1)} Crate`,'#ffd54f');
  sfx('buy');
  renderQuests();
}
function renderQuests(){
  ensureQuests();
  const Q=S.quests;
  $('#qTokens').textContent=Q.tokens;
  qResetIn();
  for(const kind of ['daily','weekly']){
    const el=kind==='daily'?$('#qDaily'):$('#qWeekly');
    el.innerHTML='';
    for(let i=0;i<Q[kind].length;i++){
      const q=Q[kind][i], def=QUEST_DEFS[q.qid], [c,g]=questProg(q);
      const row=document.createElement('div'); row.className='rw-item'+(q.done?' done':'');
      row.innerHTML=`<div class="rw-ico">${def.ico}</div><div class="rw-mid"><div class="rw-name">${def.name}</div>`+
        `<div class="ach-prog"><i style="width:${Math.round(c/g*100)}%"></i></div>`+
        `<div class="rw-sub">${Math.floor(c)}/${g} · ${questRewardTxt(def)}</div></div>`;
      const btn=document.createElement('button'); btn.className='rw-claim';
      btn.textContent=q.done?'CLAIMED':'CLAIM'; btn.disabled=q.done||c<g;
      btn.onclick=()=>claimQuest(kind,i);
      row.appendChild(btn); el.appendChild(row);
    }
  }
  const shop=$('#qShop'); shop.innerHTML='';
  for(const [ct,cost] of TOKEN_SHOP){
    const b=document.createElement('button'); b.className='pill';
    b.textContent=`${ct.toUpperCase()} CRATE — ${cost}🎫`; b.disabled=S.quests.tokens<cost;
    b.onclick=()=>buyTokenCrate(ct); shop.appendChild(b);
  }
}
function fmtDur(s){
  s=Math.max(0,Math.floor(s));
  const h=Math.floor(s/3600),m=Math.floor(s%3600/60),ss=s%60;
  if(h>=48) return Math.floor(h/24)+'d '+(h%24)+'h';
  return h+':'+String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0');
}
function qResetIn(){
  const now=new Date(), mid=new Date(now); mid.setHours(24,0,0,0);
  const de=$('#qDailyIn'); if(de) de.textContent=fmtDur((mid-now)/1000);
  const we=$('#qWeeklyIn'); if(we) we.textContent=fmtDur(((Math.floor(Date.now()/604800000)+1)*604800000-Date.now())/1000);
}
// ================= weather (☀️/🌪️ line in the timer box) =================
let qT=0;
function questTick(dt){
  qT-=dt; if(qT>0) return; qT=2;
  ensureQuests();   // live re-render while open is handled by the HUD block in 07-loop.js
}
function wxTick(dt){
  if(!S.weather) S.weather={cur:'clear', t:150};
  const W=S.weather;
  W.t-=dt;
  if(W.t<=0){
    W.cur=W.cur==='clear'?'sandstorm':'clear';
    W.t=150+Math.random()*90;
    toast(W.cur==='sandstorm'?'🌪️ SANDSTORM rolling in!':'☀️ The skies clear.','#e0a32e');
  }
  const el=$('#tWx'); if(el) el.textContent=W.cur==='clear'?'☀️ CLEAR':'🌪️ SANDSTORM';
  if(W.cur==='sandstorm'&&S.settings.gfx==='High'&&Math.random()<dt*10){
    try{ const vb=viewBounds(); addParts(vb.x0+Math.random()*(vb.x1-vb.x0),vb.y0+Math.random()*(vb.y1-vb.y0),2,'#d9c178'); }catch(e){}
  }
}
