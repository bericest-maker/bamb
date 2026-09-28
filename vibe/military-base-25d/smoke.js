/* Headless smoke test: runs the real game (every js/*.js listed in index.html) against DOM/canvas stubs. */
'use strict';
const fs=require('fs');

const T=require('./test-stubs.js');                 // stubs + loads the game exactly like index.html
const {B,G,pump,store,document,window}=T;
const S=()=>B.S;
// map-derived coordinates (never hard-code: the map layout is computed in js/02-data-world.js)
const PC=B.plotCentre(), MC=G('MAP_C'), BC=i=>G('botCenter')(i);
const WEST=G('plotCenter')(B.MAP_PLOTS[6]);        // BOT 6 = WEST plot
const ARENA={x:WEST.x-300,y:WEST.y-260};          // quiet corner of the WEST plot, away from its bridge
const walkCell=(x,y)=>{ const [cx,cy]=B.cellOf(x,y); return B.WALK[cy*B.GW+cx]; };

const rnd2=(a,b)=>a+Math.random()*(b-a);
function assert(cond,msg){
  if(!cond){ console.error('FAIL:',msg); process.exitCode=1; }
  else console.log('ok  -',msg);
}

// 1. init: fresh island map, points start NEUTRAL (no garrisons yet)
pump(300);
assert(S().units.length===0,`points start neutral — field is clear (${S().units.length} units)`);
// map: islands + water
assert(walkCell(PC.x,PC.y)===1,'player island is walkable');
assert(walkCell(MC.x,MC.y)===1,'city island is walkable');
assert(walkCell(300,300)===0,'open water is not walkable');
// radial map like the original: 8 plots + 8 lobes + octagon city + 4 outpost islets + bridges + crystals in water
assert(B.MAP_PLOTS.length===8 && B.LOBES.length===8,'8 plot islands, each with a lobe');
assert(B.LOBES.every(L=>B.walkableAt(L.x,L.y)),'every lobe island is land');
assert(B.POINTS_DEFS.filter(p=>!p.city&&!p.water).every(p=>B.walkableAt(p.x,p.y)),'4 outpost islets are land');
assert(B.POINTS_DEFS.filter(p=>p.water).length===4 && B.POINTS_DEFS.filter(p=>p.water).every(p=>!B.walkableAt(p.x,p.y)),'4 WATER points (rigs) float in the open sea');
assert(B.BRIDGES.filter(b=>b.spoke).length===8 && B.BRIDGES.length===16,'8 spoke bridges + 8 outpost bridges');
assert(G('CRYSTALS').every(c=>!B.walkableAt(c.x,c.y)),'crystals float in the water');
assert(B.BOT_DEFS.every((b,i)=>Math.abs(Math.hypot(BC(i).x-MC.x,BC(i).y-MC.y)-G('RING'))<2),'bot plots sit on the ring around the city');
{ const mid={x:(PC.x+MC.x)/2,y:(PC.y+MC.y)/2}; assert(B.walkableAt(mid.x,mid.y) && !B.walkableAt(mid.x+120,mid.y),'spoke bridge is walkable, water beside it is not'); }
for(const p of B.POINTS_DEFS.filter(p=>!p.city&&!p.water)){ const pp=B.astar(PC.x,PC.y,p.x,p.y); assert(!!pp,`A* reaches ${p.name} from your base`); }
for(const p of B.POINTS_DEFS.filter(p=>p.water)){ assert(G('isSeaAt')(p.x,p.y),`${p.name} sits on water (only ships can hold it)`); }
// A*: player base -> city stays on land/bridges
const path=B.astar(PC.x,PC.y,MC.x,MC.y);
assert(!!path,'A* found a path: player base -> CITY');
if(path){
  let allW=true;
  for(const w of path){ const [cx,cy]=B.cellOf(w.x,w.y); if(!B.WALK[cy*B.GW+cx]) allW=false; }
  assert(allW,'path stays on land/bridges (no swimming)');
}
// factions: 8 distinct colors
const cols=[...new Set([0,1,2,3,4,5,6,7].map(i=>B.facC(i)))];
assert(cols.length===8,'all 8 factions have distinct colors');

// 2. build solar + barracks, run economy + unit production
B.giveItem('b','solar'); B.placeBuilding('solar',1,1);
B.giveItem('b','barracks'); B.placeBuilding('barracks',3,1);
const cash0=S().cash;
pump(10*1000);
assert(S().units.some(u=>u.side==='p'),'barracks trained first rifleman');
pump(90*1000);
assert(S().cash>cash0+50,`economy running (cash ${Math.floor(cash0)} -> ${Math.floor(S().cash)})`);
let playerU=S().units.filter(u=>u.side==='p');
assert(playerU.length>=1,`barracks trained units (alive=${playerU.length})`);

// 3. boss kill reward (teleport boss next to a player unit to force the kill)
B.spawnBoss();
const boss=S().units.find(u=>u.boss);
assert(!!boss,'boss spawned');
if(boss){
  let pu=S().units.find(u=>u.side==='p');
  if(!pu){ pu=B.mkUnit('rifle','p',PC.x,PC.y); S().units.push(pu); } // bot raiders may have killed early units
  pu.x=PC.x; pu.y=PC.y; pu.order={x:PC.x,y:PC.y}; pu.path=null;  // home plot: nobody else around to steal the kill
  boss.x=pu.x+60; boss.y=pu.y; pu.hp=pu.maxHp=99999; // deterministic kill race
  boss.hp=1;
  pump(2500);
}
assert(S().stats.bosses===1,'boss defeated, reward tracked');
assert(S().inventory.some(i=>i.kind==='c'&&i.type==='premium'),'premium crate dropped in backpack');

// 4. code redeem
const codeBox=document.querySelector('#codeBox');
codeBox.value='LOGI';
codeBox._ls.keydown({key:'Enter',target:codeBox});
assert(S().inventory.some(i=>i.kind==='b'&&i.type==='logistics'),'code LOGI -> logistics warehouse');
codeBox.value='NOTACODE';
codeBox._ls.keydown({key:'Enter',target:codeBox});
assert(true,'bad code handled without crash');

// 5. waves
pump(125*1000);
assert(S().wave>=1,`wave system fired (wave=${S().wave})`);
const raiders=S().units.filter(u=>u.side==='e'&&u.raid).length;
assert(raiders>=0,'raiders present or already fought (raiders='+raiders+')');

// 6. capture: wipe WEST garrison, send a player unit there
const p0=S().points[0];
S().units=S().units.filter(u=>!(u.side==='e'&&u.home===0));
p0.respawnT=9999; // freeze garrison respawn for the capture check
for(let k=0;k<3;k++){ const h=B.mkUnit('rifle','p',p0.x+rnd2(-20,20),p0.y+rnd2(-20,20)); h.hp=h.maxHp=99999; h.order={x:p0.x,y:p0.y}; S().units.push(h); }
pump(1500);
assert(p0.owner==='player','NORTH point captured by player plurality');

// 7. rebirth
for(let i=0;i<9;i++) B.placeBuilding('industrial',(i%5)*2,2+Math.floor(i/5)*2);
S()._power=B.totalPower();
assert(S()._power>=5000,`power threshold met (${Math.floor(S()._power)})`);
const rb=S().rebirth;
document.querySelector('#btnRebirthYes').onclick();
assert(S().rebirth===rb+1,'rebirth incremented');
assert(S().cash===500,'cash reset on rebirth');
assert(S().buildings.filter(b=>(b.owner ?? 'p') === 'p').length===0,'player base cleared (no golden buildings owned)');

// 9. admin panel
window.Admin.renderLists();
window.Admin.renderToggles();
window.Admin.cash(1000000);
assert(S().cash>=1000000,'admin: cash granted');
window.Admin.giveBuild('industrial',false);
assert(S().inventory.some(i=>i.kind==='b'&&i.type==='industrial'),'admin: building to backpack');
window.Admin.spawnUnit('tank',5);
assert(S().units.filter(u=>u.side==='p'&&u.type==='tank').length===5,'admin: 5 tanks summoned');
window.Admin.boss('summon');
assert(S().units.some(u=>u.boss),'admin: boss summoned');
window.Admin.boss('hp1');
assert(S().units.find(u=>u.boss).hp===1,'admin: boss HP set to 1');
window.Admin.boss('kill');
assert(S().stats.bosses>=2,'admin: boss kill + reward fired');
window.Admin.points('take');
assert(S().points.every(p=>p.owner==='player'),'admin: all points captured');
// freeze boss timer
S().admin.freeze=true; S().nextBoss=0.1;
pump(2000);
assert(!S().units.some(u=>u.boss),'admin: freeze stops boss spawning');
S().admin.freeze=false; S().nextBoss=0.1;
pump(2000);
assert(S().units.some(u=>u.boss),'boss spawns again after unfreeze');
window.Admin.boss('kill');
// pause: 0x freezes game time, camera/UI still run
S().admin.speed=0;
const t0=S().time;
pump(2000);
assert(S().time===t0,'admin: 0x (pause) freezes game time');
S().admin.speed=2;
const t1=S().time;
pump(1000);
assert(S().time>t1,'admin: 2x speed advances game time');
S().admin.speed=1;
// god mode
S().admin.god=true;
const gu=B.mkUnit('rifle','p',PC.x,PC.y); S().units.push(gu);
const hpB=gu.hp;
B.damageUnit(gu,{side:'e'},50);
assert(gu.hp===hpB,'admin: god mode blocks damage to player units');
S().admin.god=false;
B.damageUnit(gu,{side:'e'},50);
assert(gu.hp<hpB,'damage applies when god mode off');
// custom cash parse
const aCash=document.querySelector('#aCash');
aCash.value='2.5M';
window.Admin.cashCustom();
assert(S().cash>=2500000,'admin: custom cash "2.5M" parsed');

// 8. save/load roundtrip
pump(13*1000); // let autosave fire
const raw=store['bmb25'];
assert(!!raw && raw.length>50,`autosave wrote state (${raw?raw.length:0} bytes)`);
const parsed=JSON.parse(raw);
assert(parsed.rebirth===rb+1,'save contains rebirth count');

// 10. bot bases: presets, production, raids, destroy + rebuild
assert(S().bots.length===7,'7 bot bases defined');
const botB0=B.botBuildings(0);
assert(botB0.length>=4,`bot 1 has preset buildings (${botB0.length})`);
assert(S().buildings.every(b=>(b.owner??"p")==="p"||typeof b.owner==="number"),'every building has a valid owner');
assert(S().buildings.filter(b=>b.owner==='p').every(b=>{ const x=(1100+b.gx*50), y=(2500+b.gy*50); return true; }),'player buildings on player plot');
B.setBotPreset(0,'fortified');
assert(B.botBuildings(0).length>=10,`setBotPreset(0,fortified) replaced base (${B.botBuildings(0).length})`);
assert(S().bots[0].preset==='fortified','bot 1 preset recorded');
// player stats must exclude bot buildings
const powBefore=B.totalPower();
B.setBotPreset(1,'golden');
assert(B.totalPower()===powBefore,'totalPower ignores bot buildings');
// bot production
pump(15*1000);
assert(S().units.some(u=>u.bot===0),'bot 1 trained units (barracks)');
const trained=S().units.find(u=>u.bot===0);
assert(trained&&trained.faction===1,'bot 1 troops carry its own faction (troop colors = team colors)');
// bot offense dispatch: default = march on the CITY
for(let k=0;k<4;k++) S().units.push(B.mkUnit('rifle','e',BC(0).x,BC(0).y,{bot:0}));
S().bots[0].raidT=1;
pump(2000);
assert(S().units.some(u=>u.bot===0&&u.order&&u.order.point===B.CITY_IDX),'bot 1 dispatched troops to the CITY (the middle)');
// ---- factions fight EACH OTHER (isolated arena: quiet SW island) ----
S().nextWave=9999; S().nextBoss=9999; // freeze global spawners during bot section
for(let i=0;i<7;i++) B.setBotPreset(i,'empty',true);
S().units=[];
const ua=B.mkUnit('rifle','e',ARENA.x,ARENA.y,{faction:1}); ua.hp=10;
const ub=B.mkUnit('rifle','e',ARENA.x+10,ARENA.y,{faction:2});
S().units.push(ua,ub);
pump(6000);
assert(!S().units.some(u=>u.id===ua.id),'different factions attack each other (bot-vs-bot)');
assert(S().units.some(u=>u.id===ub.id),'survivor of the faction fight is alive');
// ---- armored type: damage mitigation ----
S().units=[];
const at=B.mkUnit('tank','e',ARENA.x+50,ARENA.y+50,{faction:1});
const ar2=B.mkUnit('rifle','e',ARENA.x+60,ARENA.y+50,{faction:2});
S().units.push(at,ar2);
pump(4000);
const taken=at.maxHp-at.hp;
assert(taken>0&&taken<8,`armored tank mitigates damage (took ${Math.round(taken)} vs raw ~16 in 4s)`);
// ---- stealth type: needs detection ----
S().units=[];
const sp2=B.mkUnit('spectre','e',ARENA.x+100,ARENA.y,{faction:1});
const rf2=B.mkUnit('rifle','e',ARENA.x+500,ARENA.y,{faction:2});  // 400px away: outside both ranges -> no fight yet
S().units.push(sp2,rf2);
pump(200);
assert(B.canSee(rf2,sp2)===false,'stealth hidden from rifle (no detector, >70px)');
const jt=B.mkUnit('jet','e',ARENA.x+100,ARENA.y+150,{faction:2});      // 150px: inside jet's 340 sensor
S().units.push(jt);
pump(100);
assert(B.canSee(jt,sp2)===true,'jet detects spectre (340px sensor)');
sp2.fightT=3;
assert(B.canSee(rf2,sp2)===true,'stealth revealed while in combat');
sp2.fightT=0;
pump(6000);
assert(!S().units.some(u=>u.id===sp2.id),'detected stealth spectre was found & destroyed by the jet');
// ---- air flies over water; land must use the bridge ----
S().units=[];
for(const p of S().points){ p.owner='neutral'; p.faction=-1; p.cool=0; p.respawnT=8; } // no garrison interference
const hx=ARENA.x, hy=ARENA.y; // corner of the WEST island, off its bridge
const heli=B.mkUnit('heli','e',hx,hy,{bot:5,faction:6});
heli.order={point:B.CITY_IDX}; heli.cityGoal=false; // air flies straight
const land=B.mkUnit('rifle','e',hx+5,hy+5,{bot:5,faction:6});
land.order={point:B.CITY_IDX}; land.cityGoal=true;   // land follows the bridge
S().units.push(heli,land);
for(let ss=0;ss<26;ss++){   // v8 big map: heli (140 px/s) needs ~21s for the 2900px run; the rifleman ~31s
  pump(1000);
  if(process.env.DBGAIR) console.log('  [air t'+(ss+1)+'] units='+S().units.length+' heli=('+Math.round(heli.x)+','+Math.round(heli.y)+') d='+Math.round(Math.hypot(heli.x-MC.x,heli.y-MC.y))+' other='+S().units.filter(u=>u!==heli&&u!==land).map(u=>u.type+':f'+u.faction+'@'+Math.round(u.x)+','+Math.round(u.y)).join(' | '));
}
const heliD=Math.hypot(heli.x-MC.x,heli.y-MC.y);
const landD=Math.hypot(land.x-MC.x,land.y-MC.y);
assert(heliD<300,`air unit flew straight over water to the city (dist ${Math.round(heliD)})`);
assert(landD>250,`land unit still en route via bridge (dist ${Math.round(landD)})`);
// ---- the war for the MIDDLE: bots converge on the CITY ----
S().units=S().units.filter(u=>u.faction!==6);
B.setBotPreset(0,'fortified',true);
B.setBotPreset(1,'fortified',true);
{ const cp=S().points[B.CITY_IDX]; cp.owner='neutral'; cp.faction=-1; cp.cool=0; }
for(let k=0;k<6;k++) S().units.push(B.mkUnit('rifle','e',BC(0).x+(k%2)*80,BC(0).y+((k/2)|0)*60,{bot:0,faction:1}));
for(let k=0;k<6;k++) S().units.push(B.mkUnit('rifle','e',BC(1).x-(k%2)*80,BC(1).y+((k/2)|0)*60,{bot:1,faction:2}));
S().bots[0].raidT=1; S().bots[1].raidT=3;
pump(60*1000);
const cf=B.pointFaction(S().points[B.CITY_IDX]);
assert(cf>=0,`the middle is contested — CITY now held by ${cf<0?'?':(cf===0?'YOU':B.facN(cf))}`);

// destroy bot 1 base entirely -> down -> rebuilds
// v8: buildings are PERMANENT by default, so this section switches the setting off first
B.setBotPreset(0,'fortified');
{ const hp0=B.botBuildings(0)[0].hp;
  B.damageBuilding(B.botBuildings(0)[0],{side:'p'},999999);
  assert(B.botBuildings(0)[0].hp===hp0,'v8: INDESTRUCTIBLE BUILDINGS — a hit changes nothing'); }
S().settings.indestruct=false;
for(const b of [...B.botBuildings(0)]) B.damageBuilding(b,{side:'p'},999999);
assert(B.botBuildings(0).length===0,'bot 1 base fully destroyed (destructible restored)');
pump(1500);
assert(S().bots[0].down===true,'bot 1 marked down');
assert(S().units.filter(u=>u.bot===0).length===0,'bot 1 units disbanded on down');
pump(27*1000);
assert(B.botBuildings(0).length>0,'bot 1 rebuilt its base after down-timer');
assert(S().bots[0].down===false,'bot 1 down flag cleared');
S().settings.indestruct=true;
// empty preset = no buildings, no down flag
B.setBotPreset(2,'empty');
assert(B.botBuildings(2).length===0,'empty preset removes all buildings');
pump(1500);
assert(S().bots[2].down===false,'empty preset does NOT trigger rebuild');
B.setBotPreset(2,'village');
assert(B.botBuildings(2).length>0,'preset restored on request');

// ---- v4: unit roster, classes & damage modifiers ----
const UNITS=G('UNITS'), BUILD=G('BUILD');
const byCls=c=>Object.values(UNITS).filter(u=>u.cls.includes(c)).length;
assert(byCls('light')>=10 && byCls('armored')>=10 && byCls('air')>=10 && byCls('stealth')>=5,`roster: ${byCls('light')} light / ${byCls('armored')} armored / ${byCls('air')} air / ${byCls('stealth')} stealth`);
assert(Object.keys(UNITS).every(k=>Object.values(BUILD).some(b=>b.unit===k)),'every unit has a building that trains it');
assert(Object.keys(BUILD).every(k=>G('SPR')[k]) && Object.keys(UNITS).every(k=>G('SPR')[k]),'every building + unit has a sprite');
{ let ok=true; const g=G('ctx'); for(const k of [...Object.keys(BUILD),...Object.keys(UNITS)]){ try{ G('SPR')[k].draw(g,1.3,{side:'e',faction:3}); }catch(e){ ok=false; console.error('  sprite',k,e.message); } } assert(ok,'all sprites draw without errors'); }
{ let ok=true; for(const k of Object.keys(BUILD)){ try{ G('tipHTML')(k); }catch(e){ ok=false; console.error('  tip',k,e.message);} } assert(ok,'stat tooltip renders for every building'); }
const mk=(t,f,x=ARENA.x,y=ARENA.y)=>B.mkUnit(t,'e',x,y,{faction:f});
assert(B.modFor(mk('flak',1),mk('tank',2))===0,'Mobile Flak cannot hurt armored (×0)');
assert(B.modFor(mk('flak',1),mk('heli',2))===1.5,'Mobile Flak ×1.5 vs air');
assert(B.modFor(mk('rifle',1),mk('spectre',2))===0,'Rifleman cannot hurt stealth (×0)');
assert(B.modFor(mk('rocket',1),mk('tank',2))===1.5,'Rocket Trooper ×1.5 vs armored');
assert(B.modFor(mk('sniper',1),mk('phantom',2))===0,'multi-class target: any ×0 class wins (sniper vs Phantom)');
assert(B.isAir(mk('drone',1)) && !UNITS.drone.cls.includes('air') && B.modFor(mk('flak',1),mk('drone',2))===0,'Drone flies but stays LIGHT (anti-air ignores it)');
// flak ignores a tank standing next to it (never targets ×0)
S().units=[]; S().buildings=S().buildings.filter(b=>b.owner!=='p');
{ const fl=mk('flak',1), tk=mk('tank',2,ARENA.x+80); tk.hp=tk.maxHp=99999; S().units.push(fl,tk); pump(3000);
  assert(tk.hp===tk.maxHp,'Flak never shoots a tank (×0 → no target)'); }
// splash: artillery hits the whole clump
S().units=[];
{ const ar=mk('arty',1); const cl=[0,1,2].map(i=>{ const r=mk('rifle',2,ARENA.x+300+i*12,ARENA.y); r.hp=r.maxHp=200; return r; }); S().units.push(ar,...cl);
  pump(1200); assert(cl.filter(r=>r.hp<200).length>=2,'artillery splash damages several units'); }
// medic heals
S().units=[];
{ const md=mk('medic',1), hurt=mk('rifle',1,ARENA.x+40); hurt.hp=5; S().units.push(md,hurt); pump(3000);
  assert(hurt.hp>5,`medic heals allies (5 → ${Math.round(hurt.hp)})`); }
// troop cap counts unit SIZE
S().units=[];
S().units.push(B.mkUnit('mammoth','p',PC.x,PC.y), B.mkUnit('rifle','p',PC.x,PC.y));
assert(B.capUsed()===6,`troop cap uses unit size (mammoth 5 + rifle 1 = ${B.capUsed()})`);
// ---- turrets, radar, hospital, bank ----
S().units=[]; S().buildings=S().buildings.filter(b=>b.owner!=='p');
B.placeBuilding('pillbox',6,4);
const pbx=S().buildings[S().buildings.length-1]; B.bPos(pbx);
{ const foe=mk('rifle',3,pbx.x+120,pbx.y); foe.hp=foe.maxHp=500; S().units.push(foe); pump(3000);
  assert(foe.hp<500,'Pillbox shoots ground enemies in range'); }
B.placeBuilding('aaturret',8,4);
{ const sam=S().buildings[S().buildings.length-1]; B.bPos(sam); S().units=[];
  const gr=mk('rifle',3,sam.x+60,sam.y); gr.hp=gr.maxHp=500; const ai=mk('heli',3,sam.x+100,sam.y); ai.hp=ai.maxHp=5000; ai.order={x:ai.x,y:ai.y};
  S().buildings=S().buildings.filter(b=>b.type!=='pillbox'); S().units.push(gr,ai); pump(3000);
  assert(ai.hp<5000 && gr.hp===500,'SAM Site hits air only'); }
B.placeBuilding('radar',10,4);
{ const rd=S().buildings[S().buildings.length-1]; B.bPos(rd); S().units=[];
  const sp=B.mkUnit('spectre','e',rd.x+300,rd.y,{faction:3}); const me=B.mkUnit('rifle','p',rd.x-200,rd.y);
  S().units.push(sp,me); pump(500);
  assert(B.canSee(me,sp),'Radar Station reveals stealth for your whole army'); }
B.placeBuilding('hospital',1,6);
{ const hs=S().buildings[S().buildings.length-1]; B.bPos(hs); S().units=[];
  const w=B.mkUnit('tank','p',hs.x+50,hs.y); w.hp=10; S().units.push(w); pump(2200);
  assert(w.hp>=20,'Field Hospital heals nearby units'); }
S().units=[];
S().cash=100000; B.placeBuilding('bank',3,7); B.placeBuilding('industrial',6,7);
{ const ind=S().buildings[S().buildings.length-1]; ind.stored=200000;
  S().bankT=0.01; const c0=S().cash; B.bankTick(0.02);
  assert(S().cash-c0>=9999,`Bank pays 5% of STORED cash (+${Math.round(S().cash-c0)})`);
  ind.stored=0; S().bankT=0.01; const c1=S().cash; B.bankTick(0.02);
  assert(S().cash===c1,'Bank pays nothing when the safes are empty'); }
// ---- shop rules ----
const rbSave=S().rebirth; S().rebirth=0;
assert(!!B.buyBlock('monument'),'Monument needs a rebirth');
S().rebirth=1; assert(!B.buyBlock('monument'),'Monument unlocked after rebirth'); S().rebirth=rbSave;
B.setBotPreset(0,'standard',true);
assert(B.canPlaceAt('solar',1,1)||S().buildings.some(b=>b.owner==='p'&&b.gx<=1&&b.gy<=1),'bot buildings never block YOUR grid');
// ---- achievements + leaderboard + UI panels ----
S().achievements={}; B.checkAchievements();
assert(S().achievements.build1!=null,'achievement "Groundbreaker" unlocked');
{ let ok=true; try{ G('renderAchievements')(); G('renderLeaderboard')(); S().shopTab='units'; for(const c of ['light','armored','air','stealth']){ S().shopSub=c; G('renderShop')(); } S().shopTab='production'; }catch(e){ ok=false; console.error(e); }
  assert(ok,'achievements, leaderboard and UNITS sub-tabs render'); }
// ---- save import accepts v3 + v4 ----
{ const box=document.querySelector('#aSave'); box.value=JSON.stringify({...JSON.parse(store['bmb25']||'{}'),v:3}); store['bmb25']=null;
  window.Admin.importSave(); assert(JSON.parse(store['bmb25']||'{}').v===3,'admin import accepts a v3 save'); }
assert(G('load')().v===4,'v3 save migrates to v4 on load');

// ---- v5: real sizes, admin quantity spawns, performance structures ----
{ const SPR=G('SPR'), bScale=G('bScale'), unitScale=G('unitScale'), SLOT=G('SLOT');
  const bad=Object.keys(BUILD).filter(id=>{ const mw=SPR[id].w*bScale(id), fw=BUILD[id].w*SLOT; return mw>fw+.01 || (BUILD[id].w>2 && fw-mw>=SLOT); });
  assert(!bad.length,`every footprint hugs its model (model ≤ pad < model + 1 cell) (${bad.slice(0,3)})`);
  assert(G('PLOT_W')===104&&G('PLOT_H')===72&&SLOT===8,`fine build grid: 104×72 cells of 8px (island still 832×576px)`);
  // rotated bot plots: presets still build, and clicking a bot building finds it
  B.setBotPreset(1,'fortified',true);
  const nb=B.botBuildings(1).length, want=G('PRESET_MAP').fortified.b.length;
  assert(nb>=want-2,`fortified preset fits on the fine grid (${nb}/${want})`);
  const bb=B.botBuildings(1)[0]; B.bPos(bb);
  assert(G('buildingAt')(bb.cx,bb.cy,'bot')===bb,'click hit-test works on a rotated (diagonal) bot plot');
  const back=G('worldToPlot')(1,...Object.values(G('plotToWorld')(1,123,45)));
  assert(Math.abs(back.x-123)<1e-6&&Math.abs(back.y-45)<1e-6,'plotToWorld / worldToPlot are inverses');
  assert(Math.abs(G('MAP_PLOTS')[2].rot-(-135*Math.PI/180))<1e-9,'NE plot is rotated to face the city');
  assert(unitScale(B.mkUnit('mammoth','p',0,0))>unitScale(B.mkUnit('rifle','p',0,0)),'bigger units are drawn bigger (mammoth > rifleman)');
  assert(SPR.wind.anim&&!SPR.sandbags.anim,'sprite cache: animated sprites get frames, static ones one image');
  let ok=true; try{ G('drawSpr')(G('ctx'),'wind',100,100,1.3,'p',0,.5); G('drawSpr')(G('ctx'),'tank',100,100,1.3,'e',3,.5); }catch(e){ ok=false; console.error(e); }
  assert(ok&&G('SPR_CACHE').size>=2,'sprite cache paints + blits'); }
{ S().units=[]; S().admin.noRespawn=true;
  const n=window.Admin.spawnUnit('rifle',1000);
  const onLand=S().units.every(u=>B.walkableAt(u.x,u.y));
  assert(n===1000&&S().units.length===1000&&onLand,`admin spawns 1000 units on walkable ground (${n}, onLand=${onLand})`);
  assert(window.Admin.spawnUnit('rifle',5000)===1000,'admin quantity is capped at 1000');
  S().units=[]; assert(window.Admin.spawnUnit('tank',3,2)===3&&S().units.every(u=>u.bot===2&&u.faction===3),'admin can spawn for a bot faction');
  let ok=true; try{ window.Admin.filter('tank'); window.Admin.filter(''); }catch(e){ ok=false; } assert(ok,'admin search filter runs');
  // grid search == full scan
  S().units=[]; for(let i=0;i<300;i++) S().units.push(B.mkUnit(i%2?'rifle':'tank',i%2?'p':'e',MC.x+Math.random()*900-450,MC.y+Math.random()*900-450,{faction:i%2?0:1}));
  const fe=G('findEnemyOf'), probe=S().units.slice(0,60), full=probe.map(u=>fe(u,300));
  G('buildUnitGrid')(); const grid=probe.map(u=>fe(u,300)); G('UGRID_ON=false');
  assert(full.every((f,i)=>f===grid[i]),'spatial grid finds exactly the same targets as a full scan');
  // 300-unit brawl: kills are deferred, the list is compacted, no dead unit survives the frame
  const t0=Date.now(); pump(3000); const ms=Date.now()-t0;
  assert(!S().units.some(u=>u.dead),'dead units are compacted out after the frame');
  console.log(`  [perf] 300-unit brawl: 3s of game time in ${ms}ms (${S().units.length} left)`);
  S().units=[]; S().admin.noRespawn=false; }

// ================= v7: money capacity, naval line, garrisons, bounties, structure power =================
S().units=[]; S().admin.noRespawn=true; S().buildings=S().buildings.filter(b=>b.owner!=='p');
// ---- money capacity: buildings store what they earn, up to their cap, and pay out ----
B.placeBuilding('solar',1,1); B.placeBuilding('solar',3,1);
{ const [s1,s2]=S().buildings.filter(b=>b.owner==='p');
  const CAP=G('BUILD').solar.cap;
  assert(CAP>0,`solar has a money capacity ($${CAP})`);
  S().cash=0; s1.stored=0; pump(20*1000);
  assert((s1.stored||0)>0,`money is STORED inside the building ($${Math.floor(s1.stored)})`);
  const before=S().cash, stored=s1.stored;
  const paid=G('collectStored')(s1);
  assert(paid>0 && Math.abs(S().cash-before-paid)<1 && s1.stored===0,`clicking a building empties its safe (+$${paid})`);
  s1.stored=CAP*5; pump(1000); assert(s1.stored<=CAP+1,`storage never exceeds the cap (${Math.floor(s1.stored)} <= ${CAP})`);
  s1.stored=0; s2.stored=0; }

// ---- structure power vs army power ----
{ S().units=[]; const b0=G('structurePower')();
  S().units.push(B.mkUnit('tank','p',PC.x,PC.y));
  const a0=G('armyPower')(), t0=G('totalPower')();
  assert(t0===b0+a0,`totalPower = structure (${b0}) + army (${a0})`);
  assert(a0===G('UNITS').tank.power,'a tank counts as army power');
  S().units=[]; }

// ---- kill bounty scales with the victim ----
{ const rifle=B.mkUnit('rifle','e',0,0), mammoth=B.mkUnit('mammoth','e',0,0);
  const rBase=G('UNITS').rifle.reward, mBase=G('UNITS').mammoth.reward;
  assert(G('killReward')(rifle)>=rBase,`rifleman bounty >= base (${G('killReward')(rifle)})`);
  assert(G('killReward')(mammoth)>mBase,`heavy bounty scales with tier (${G('killReward')(mammoth)} > ${mBase})`);
  mammoth.maxHp=mammoth.maxHp*2;
  assert(G('killReward')(mammoth)>mBase*1.8,'a wave-buffed unit pays more'); }

// ---- officer aura ----
{ S().units=[]; const off=B.mkUnit('officer','p',PC.x,PC.y), buddy=B.mkUnit('rifle','p',PC.x+40,PC.y);
  S().units.push(off,buddy); G('refreshDetectors')(1);
  const near=G('auraFor')(buddy), far=G('auraFor')(B.mkUnit('rifle','p',PC.x+900,PC.y));
  assert(near===1.25,`officer gives +25% damage to allies nearby (×${near})`);
  assert(far===1,'allies out of range get nothing'); S().units=[]; }

// ---- wave-defense garrison ----
{ S().buildings=S().buildings.filter(b=>b.owner!=='p');
  S().units=[]; S().admin.noRespawn=false;
  B.placeBuilding('barracks',1,1); B.placeBuilding('tankfac',5,1);
  S().waveAlert=60; S().units=[];
  pump(25*1000);
  const defs=S().units.filter(u=>u.wd!=null);
  assert(defs.length>0,`unit buildings train a free garrison while a raid is incoming (${defs.length} defenders)`);
  { const keep=S().units; S().units=defs;
    assert(defs.every(u=>u.home==null)&&G('capUsed')()===0,'garrison units are FREE (they do not eat the troop cap)');
    S().units=keep; }
  const perBuilding={}; for(const u of defs) perBuilding[u.wd]=(perBuilding[u.wd]||0)+1;
  assert(Object.values(perBuilding).every(n=>n<=G('wdCapOf')(G('BUILD').barracks)),`each building respects its MaxCap (${Object.values(perBuilding)})`);
  S().waveAlert=0; S().units=defs; G('updateWaveDefense')(0.1);
  assert(S().units.length===0,'the garrison stands down when the base is safe');
  S().units=[]; S().admin.noRespawn=true; }

// ---- naval: the sea grid, water lanes and ships ----
{ const SEA=G('SEA');
  assert(G('SEA_LANES').length>0 && G('SEA_BUOYS').length>0,`shipping lanes exist (${G('SEA_LANES').length} segments, ${G('SEA_BUOYS').length} buoys)`);
  const openSea=G('ringPos')(-22.5,1400);                     // the gap between two plots
  assert(G('isSeaAt')(openSea.x,openSea.y) && !B.walkableAt(openSea.x,openSea.y),'open water is sea, not land');
  assert(!G('isSeaAt')(PC.x,PC.y),'your plot is not sea');
  const lanes=G('SEA_LANES').filter(l=>B.walkableAt((l.ax+l.bx)/2,(l.ay+l.by)/2));
  assert(lanes.length===0,'every shipping lane runs through water');
  // a ship sails across the ocean, a tank cannot
  S().units=[];
  const ship=B.mkUnit('frigate','p',G('nearestSea')(PC.x,PC.y).x,G('nearestSea')(PC.x,PC.y).y);
  S().units.push(ship);
  const goal=G('coastGoal')(MC.x,MC.y), d0=Math.hypot(ship.x-goal.x,ship.y-goal.y);
  S().units.forEach(u=>{ u.order={x:goal.x,y:goal.y}; });
  pump(20*1000);
  const d1=Math.hypot(ship.x-goal.x,ship.y-goal.y);
  assert(d1<d0,`a frigate sailed across the water toward its target (${Math.round(d0)} -> ${Math.round(d1)} px)`);
  assert(G('isSeaAt')(ship.x,ship.y),'the ship stayed in the water');
  // naval buildings launch their ships into the sea
  S().units=[]; S().buildings=S().buildings.filter(b=>b.owner!=='p');
  B.placeBuilding('gunboatpier',1,4);
  const pier=S().buildings[S().buildings.length-1]; B.bPos(pier);
  pier.t=0; G('productionTick')(0.02);
  const boats=S().units.filter(u=>u.type==='gunboat');
  assert(boats.length>0 && boats.every(b=>G('isSeaAt')(b.x,b.y)||B.walkableAt(b.x,b.y)),'the Gunboat Pier launches its boat toward the water');
  S().units=[]; S().buildings=S().buildings.filter(b=>b.owner!=='p'); }

// ---- new content is wired up: shop tabs, sprites, buildings ----
{ const U=G('UNITS'), BLD=G('BUILD'), SPR=G('SPR');
  assert(['speedboat','gunboat','frigate','submarine','zumwalt','battleship','carrier'].every(k=>U[k]&&U[k].sea),'7 ships in the naval line');
  assert(['lighttank','icbm','leopard','pzh','mantis','tigr','swarmdrone','f15','f35','su47','ka52','officer','centurion'].every(k=>U[k]),'P2/P3 expansion units present');
  assert(BLD.submarinecavern&&BLD.submarinecavern.unit==='submarine','Submarine Cavern trains the Submarine');
  assert(BLD.centurionsite&&BLD.centurionsite.unit==='centurion','Centurion Support Site trains the Centurion');
  assert(BLD.zeppeldock.name==='Airship Docks','Airship Docks (Zeppelin) is in');
  assert(Object.values(BLD).filter(b=>b.cap).length>=20,`${Object.values(BLD).filter(b=>b.cap).length} money buildings have a Capacity`);
  S().shopTab='units'; S().shopSub='sea';
  let ok=true; try{ G('renderShop')(); }catch(e){ ok=false; console.error(e.message); }
  assert(ok,'the NAVAL shop tab renders');
  S().shopTab='production'; S().shopSub='light';
  ok=true; try{ for(const k of Object.keys(BLD)) G('tipHTML')(k); }catch(e){ ok=false; console.error('  tip',e.message); }
  assert(ok,'every tooltip still renders (incl. capacity + bounty rows)');
  S().units=[]; }
// ---- v8: POTATO MODE, trees toggle, permanent buildings, bigger world, "march on the middle" ----
{
  const sprN=()=>G('__sprN'), treeN=()=>G('__treeN');
  G('__origSpr = drawSpr; __sprN = 0; drawSpr = function(){ __sprN++; return __origSpr.apply(null, arguments); };');
  G('__origTree = drawTree; __treeN = 0; drawTree = function(t){ __treeN++; return __origTree.apply(null, arguments); };');
  G('selUnits = []');
  const cam=G('cam');
  // a base worth looking at: buildings + troops of every shape, camera parked on your plot
  S().units=[]; S().buildings=S().buildings.filter(b=>(b.owner??'p')!=='p');
  for(const [t,gx,gy] of [['solar',1,1],['barracks',8,1],['tankfac',16,3],['oil',26,5]]) B.placeBuilding(t,gx,gy);
  for(const t of ['rifle','tank','heli','frigate','spectre']) S().units.push(B.mkUnit(t,'p',PC.x+(S().units.length%3-1)*40,PC.y+(S().units.length%2?30:-30)));
  cam.x=cam.tx=PC.x; cam.y=cam.ty=PC.y; cam.z=1;
  S().settings.units='Normal'; S().settings.blds='Normal'; S().settings.trees=true;
  G('__sprN = 0'); pump(400);
  const normalSpr=sprN();
  G('__treeN = 0'); pump(200);
  const treesOn=treeN();
  S().settings.units='Blocks'; S().settings.blds='Blocks'; S().settings.trees=false;
  G('__sprN = 0'); G('__treeN = 0'); pump(400);
  const potatoSpr=sprN(), treesOff=treeN();
  assert(normalSpr>20 && potatoSpr===0,`BLOCK MODE blits no sprites at all (${normalSpr} draws → ${potatoSpr})`);
  assert(treesOn>0 && treesOff===0,`TREES & DECOR off draws no trees (${treesOn} → ${treesOff} per 12 frames)`);
  G('drawSpr = __origSpr; drawTree = __origTree;');
  // every unit + building has a block shape, and every block is EXACTLY its own size
  let ok=true;
  for(const k of Object.keys(G('UNITS'))){ const u=B.mkUnit(k,'e',PC.x,PC.y); try{ G('drawBlockUnit')(u,1); }catch(e){ ok=false; console.error('  block unit',k,e.message); } }
  assert(ok,'block mode draws all 55 unit types as a rectangle (no sprite)');
  ok=true;
  for(const k of Object.keys(G('BUILD'))){ try{ G('drawBlockBuilding')('p',1,1,G('BUILD')[k].w*16,G('BUILD')[k].h*16,3); }catch(e){ ok=false; console.error('  block bld',k,e.message); } }
  assert(ok,'block mode draws all 100 building types as their footprint rectangle');
  { const SPR=G('SPR');
    const rw=SPR.rifle.w, cw=SPR.carrier.w, iw=SPR.industrial.w;
    assert(rw<cw && iw>0,`a block is EXACTLY its model's box: rifle ${rw}px < carrier ${cw}px, industrial bld ${iw}px`); }
  S().units=[];
  // right-click must NOT demolish any more (and does again once destructible is restored)
  S().buildings=S().buildings.filter(b=>(b.owner??'p')!=='p');
  B.placeBuilding('solar',1,1);
  const mine=S().buildings[S().buildings.length-1], mp=B.bPos(mine);
  cam.x=cam.tx=mp.x; cam.y=cam.ty=mp.y;
  const cvEl=document.querySelector('#cv');
  cvEl._ls.mousemove({clientX:(mp.x-cam.x)*cam.z+640, clientY:(mp.y-cam.y)*(cam.z*.72)+400});
  const cash0=S().cash;
  S().settings.indestruct=true;
  cvEl._ls.mousedown({button:2});
  assert(S().buildings.includes(mine)&&S().cash===cash0,'right-click no longer demolishes (buildings are permanent)');
  S().settings.indestruct=false;
  cvEl._ls.mousedown({button:2});
  assert(!S().buildings.includes(mine)&&S().cash>cash0,'INDESTRUCTIBLE off → right-click sells again (+50% refund)');
  S().settings.indestruct=true;
  // ---- "march on the middle": no more drive-by shooting ----
  S().units=[]; S().nextWave=9999; S().nextBoss=9999;
  { const city=S().points[B.CITY_IDX]; city.owner='neutral'; city.faction=-1; city.cool=0; city.respawnT=9999; }
  const me=B.mkUnit('rifle','p',PC.x,PC.y); me.hp=me.maxHp=500;
  const foe=B.mkUnit('rifle','e',PC.x+520,PC.y,{faction:1}); foe.hp=foe.maxHp=500;
  S().units.push(me,foe);
  const d0=Math.hypot(me.x-MC.x,me.y-MC.y);
  pump(5000);
  assert(me.hp===500&&foe.hp===500,'v8: an enemy 520px away is IGNORED (AGGRO.march 210 — no drive-by shooting)');
  const d1=Math.hypot(me.x-MC.x,me.y-MC.y);
  assert(d1<d0-200,`v8: idle troops march on the MIDDLE (${Math.round(d0)} → ${Math.round(d1)} px from the CITY)`);
  foe.x=me.x+90; foe.y=me.y;
  pump(4000);
  assert(me.hp<500||foe.hp<500,'v8: once the enemy is CLOSE the march stops and they fight');
  S().units=[];
  // ---- the world is twice as big ----
  assert(G('WORLD').w===9600 && G('RING')===2600,`world is ${G('WORLD').w}px wide, bases sit on a ${G('RING')}px ring`);
  const nb=Math.hypot(BC(0).x-BC(1).x, BC(0).y-BC(1).y);
  assert(nb>1900,`neighbouring bases are far apart (${Math.round(nb)}px between BOT 1 and BOT 2)`);
  assert(G('SEA_BUOYS').length>0 && G('SEA_LANES').every(l=>!B.walkableAt((l.ax+l.bx)/2,(l.ay+l.by)/2)),'every shipping lane still runs through water on the bigger map');
  // ---- zoom out until the WHOLE map fits ----
  const WO=G('WORLD'), MCc=G('MAP_C'), MINZ=G('MINZ');   // cam is already in scope above
  assert(MINZ<0.5,`zoom-out limit now fits the map (MINZ ${MINZ.toFixed(3)}, was 0.5)`);
  { const o=cam.z; cam.z=MINZ; cam.x=cam.tx=MCc.x; cam.y=cam.ty=MCc.y;
    const vb=G('viewBounds')();
    assert(vb.x0<=0&&vb.x1>=WO.w&&vb.y0<=0&&vb.y1>=WO.h,`at MINZ the whole ${WO.w}px map is on screen`);
    cam.z=o; }
  cam.z=MINZ; G('clampCam')();
  assert(Math.abs(cam.tx-MCc.x)<1&&Math.abs(cam.ty-MCc.y)<1,'fully zoomed out the camera locks to the map centre (nothing cut off)');
  cam.z=1; cam.tx=PC.x; cam.ty=PC.y; G('clampCam')();
  assert(Math.abs(cam.tx-PC.x)<1&&Math.abs(cam.ty-PC.y)<1,'at normal zoom the camera still pans freely');
  // leave the settings as they started
  S().settings.units='Normal'; S().settings.blds='Normal'; S().settings.trees=true; S().settings.botGrid=false;
}

// ---- v8.3: finer grid, 3x smaller buildings, the water yard, water points, hover inspect, hold Q ----
{
  // grid + building size
  assert(SLOT===8 && G('PLOT_W')===104,`build grid is twice as fine (${G('PLOT_W')}x${G('PLOT_H')} cells of ${SLOT}px)`);
  assert(G('BLD_K')<0.5,`buildings are drawn 3x smaller (BLD_K ${G('BLD_K').toFixed(3)} = 1.3/3)`);
  assert(G('BUILD').solar.w*SLOT<64,`a Solar panel went from 64px wide to ${G('BUILD').solar.w*SLOT}px`);
  // ---- your WATER YARD behind the island ----
  const Y=G('WATER_YARD');
  assert(Y.w*SLOT===832 && Y.h*SLOT===224,`the water yard is ${Y.w*SLOT}x${Y.h*SLOT}px — as wide as your island, behind it`);
  assert(!B.walkableAt(Y.x+10,Y.y+10)&&!B.walkableAt(Y.x+Y.w*SLOT-10,Y.y+Y.h*SLOT-10),'the whole yard is water, not land');
  assert(G('isSeaAt')(Y.x+40,Y.y+40),'the yard counts as SEA (ships can sail into it)');
  assert(G('BUILD').gunboatpier.water && G('BUILD').offshore.water && !G('BUILD').barracks.water,'docks + the offshore rig are WATER buildings, the barracks is not');
  assert(!G('fitsAt')('gunboatpier',2,2,'p','land') && G('fitsAt')('gunboatpier',2,2,'p','water'),'a dock fits in the yard and nowhere else');
  assert(!G('fitsAt')('barracks',2,2,'p','water') && G('fitsAt')('barracks',2,2,'p','land'),'a barracks fits on the island and not in the water');
  const mouse=G('mouse'); mouse.wx=Y.x+200; mouse.wy=Y.y+100; S().placing='gunboatpier';
  const gh=G('ghostSlot')();
  assert(gh.zone==='water'&&gh.ok,`the placement ghost snaps into the water yard (zone ${gh.zone})`);
  S().placing='barracks';
  assert(!G('ghostSlot')().ok && /WATER YARD/.test(G('ghostSlot')().why||''),'a land building over the yard is refused with a reason');
  mouse.wx=PC.x; mouse.wy=PC.y;
  assert(G('ghostSlot')().zone==='land','over your island the ghost goes back to the land grid');
  S().placing=null;
  S().buildings=S().buildings.filter(b=>(b.owner??'p')!=='p');
  B.placeBuilding('gunboatpier',4,4,'p','water');
  const pier=S().buildings[S().buildings.length-1], pp=B.bPos(pier);
  assert(G('inYard')(pp.x,pp.y),`the pier stands in the yard (${Math.round(pp.x)},${Math.round(pp.y)})`);
  pier.t=0; G('productionTick')(0.02);
  const boats=S().units.filter(u=>u.type==='gunboat');
  assert(boats.length>0&&G('isSeaAt')(boats[0].x,boats[0].y),'the pier launched its gunboat straight into the sea');
  // ---- WATER POINTS: 4 rigs, held by boats ----
  const rigs=S().points.filter(p=>p.water);
  assert(rigs.length===4,`4 water capture points (${rigs.map(r=>r.name).join(', ')})`);
  { const r=rigs[0]; r.owner='player'; r.faction=0; r.respawnT=0;
    S().units=S().units.filter(u=>u.home!==r.id);
    const made=G('spawnGarrison')(r.id,2), g=S().units.filter(u=>u.home===r.id);
    assert(made>0&&g.every(u=>G('isSea')(u)),`a held rig is garrisoned by BOATS (${g.map(u=>u.type).join(', ')})`);
    S().units=S().units.filter(u=>u.home!==r.id); r.owner='neutral'; r.faction=-1; }
  // ---- hover a troop → its stat card ----
  const spy=B.mkUnit('rifle','p',PC.x,PC.y); S().units=[spy]; pump(50);
  assert(G('unitAt')(PC.x,PC.y,26)===spy,'unitAt finds the troop under the cursor (spatial hash, not a full scan)');
  assert(G('unitAt')(PC.x+400,PC.y,26)===null,'unitAt finds nothing when the cursor is over empty ground');
  { let ok=true, html='';
    for(const k of Object.keys(G('UNITS'))){ const u=B.mkUnit(k,'e',PC.x,PC.y); try{ html=G('unitTipHTML')(u); }catch(e){ ok=false; console.error('  tip',k,e.message); } }
    assert(ok,'every one of the 55 unit types has a hover stat card');
    assert(/Troop cap/.test(html)&&/DPS/.test(html)&&/HP/.test(html),'the card shows troop-cap size, DPS and HP');
    const boss=B.mkUnit('rifle','e',PC.x,PC.y,{boss:true});
    try{ G('unitTipHTML')(boss); assert(true,'the MECHA WORM has a hover card too'); }catch(e){ assert(false,'boss hover card: '+e.message); } }
  // ---- hold Q = pause ----
  S().units=[];
  G('holdQ = true');
  const tq=S().time; pump(1000);
  assert(S().time===tq,'holding Q freezes the battle (game time does not move)');
  G('holdQ = false');
  pump(1000);
  assert(S().time>tq,'releasing Q resumes it');
}
// ---- v8.4: STACK buildings on top of each other, backpack stacks, bulk crate opening ----
{
  const STACK_UP=G('STACK_UP'), SLOT8=G('SLOT');
  S().buildings=S().buildings.filter(b=>(b.owner??'p')!=='p');
  assert(STACK_UP>0,`STACK_UP = ${STACK_UP}px of lift per floor of a stack`);
  // 4 barracks clicked on the EXACT same spot — they stack instead of refusing to place
  const bd=G('BUILD').barracks, cv=document.querySelector('#cv'), mouse=G('mouse');
  const wc=G('plotToWorld')('p',(12+bd.w/2)*SLOT8,(12+bd.h/2)*SLOT8);
  for(let i=0;i<4;i++){ mouse.wx=wc.x; mouse.wy=wc.y; S().placing='barracks'; cv._ls.mousedown({button:0}); }
  const pile=S().buildings.filter(b=>(b.owner??'p')==='p');
  assert(pile.length===4 && new Set(pile.map(b=>b.gx+','+b.gy)).size===1 && pile.every((b,i)=>(b.lvl|0)===i),
    `4 barracks stack on one spot (floors ${pile.map(b=>b.lvl|0).join(' / ')})`);
  const px=pile[0].gx, py=pile[0].gy;
  assert(!G('fitsAt')('barracks',px,py,'p','land',0) && G('fitsAt')('barracks',px,py,'p','land',4),'the ground floor is taken, the top of the pile is free');
  assert(G('stackTopAt')('barracks',px,py,'p')===4,'stackTopAt reports how high the pile is');
  // bots / fills stay spread out on the ground and only stack when the island is full
  assert(G('findFreeSpot')('barracks',px,py,'p','land').lvl===0,'findFreeSpot takes a free GROUND spot next to a pile before climbing it');
  // every floor works on its own
  S().units=[];
  for(const b of pile) b.t=0;
  G('productionTick')(0.02);
  assert(S().units.filter(u=>u.side==='p').length===4,'every floor of the pile trains its own unit (4 barracks = 4 troops)');
  S().units=[];
  // the ghost tells you which floor it will land on
  const w2=G('plotToWorld')('p',(px+bd.w/2)*SLOT8,(py+bd.h/2)*SLOT8);
  mouse.wx=w2.x; mouse.wy=w2.y; S().placing='solar';
  const gh=G('ghostSlot')();
  assert((gh.lvl|0)===4 && gh.ok,`the ghost lands on LEVEL ${(gh.lvl|0)+1} of the pile`);
  S().placing=null;
  // clicking picks the building you aimed at (the one on top wins)
  const pick=l=>G('buildingAt')(w2.x,w2.y-l*STACK_UP+4,'p');
  assert(pick(0)===pile[0] && pick(3)===pile[3],'clicking a stack picks the floor you clicked, not the one underneath');
  // ---- backpack STACKS ----
  S().inventory=[];
  B.giveItem('b','solar'); B.giveItem('b','solar'); B.giveItem('b','solar');
  assert(S().inventory.length===1 && (S().inventory[0].n||1)===3,`3 solar panels = ONE backpack card (x${S().inventory[0].n})`);
  assert(G('invCount')('b','solar')===3,'invCount reads the stack');
  assert(G('takeItem')('b','solar',2)===2 && G('invCount')('b','solar')===1,'takeItem pulls 2 out of the stack');
  G('takeItem')('b','solar',9);
  assert(S().inventory.filter(i=>i.type==='solar').length===0,'emptying a stack removes the card');
  assert(G('mergeInventory')([{kind:'c',type:'premium'},{kind:'c',type:'premium'},{kind:'c',type:'standard'}]).length===2,'old saves (one entry per crate) fold into stacks');
  // ---- open 5 crates at once ----
  S().inventory=[{kind:'c',type:'premium',n:5}];
  const co=S().stats.cratesOpened;
  const opened=G('openCrateModal')('premium',5);
  assert(opened===5,'openCrateModal opens 5 crates in one go');
  assert(G('invCount')('c','premium')===0,'all 5 crates leave the backpack');
  assert(S().stats.cratesOpened===co+5,'cratesOpened counts every crate you opened');
  const won=S().inventory.filter(i=>i.kind==='b');
  assert(won.reduce((a,i)=>a+(i.n||1),0)===5,`the 5 wins are stacked as cards (${won.map(i=>i.type+' x'+(i.n||1)).join(', ')})`);
  assert(typeof G('askOpenCount')==='function','the "open how many?" chooser exists (1 / 5 / 10 / ALL)');
  assert(G('BUILD')[G('pick')(G('CRATE_TABLES').premium)[0]]!==undefined,'a crate row is [id,weight] — the opening shuffle reads the id (it used to read the row and throw, so crates never revealed)');
  G('askOpenCount')('premium');   // no crates left: must not throw
  // ---- the ROBUX SHOP finally works (it called a function that did not exist) ----
  G('renderRobux')();
  S().cash=1e9; G('buyCrates')('premium',10);
  assert(G('invCount')('c','premium')===10,'the ROBUX SHOP sells 10 premium crates at once → one stacked card');
  G('renderBackpack')();
  // ---- Admin.pile: 7 solar panels, 7 high, unlimited stacking ----
  S().buildings=S().buildings.filter(b=>(b.owner??'p')!=='p');
  const made=G('Admin').pile('solar',7);
  const tower=S().buildings.filter(b=>(b.owner??'p')==='p');
  assert(made===7 && tower.length===7 && tower.every((b,i)=>(b.lvl|0)===i),`Admin.pile stacks ${tower.length} solar panels ${tower.length} high`);
  pump(400);
  assert(tower.every(b=>b.hp===b.maxHp) && tower.every(b=>Number.isFinite(b.x??B.bPos(b).x)),'a 7-high tower survives 400 frames of rendering');
  S().inventory=[{kind:'b',type:'solar',n:2}];
  G('renderBackpack')();
}

// ---- v8.5: keep placing, SHIFT-drag runs, auto rarity sort, boss in the middle, no unit collision ----
{
  const SLOT8=G('SLOT'), mouse=G('mouse'), cvEl=document.querySelector('#cv');
  const click=(gx,gy,opt)=>{ const w=G('plotToWorld')('p',(gx+3)*SLOT8,(gy+2)*SLOT8); mouse.wx=w.x; mouse.wy=w.y; cvEl._ls.mousedown(Object.assign({button:0},opt)); };
  const mouseUp=()=>window._ls.mouseup[0]({button:0});
  S().buildings=S().buildings.filter(b=>(b.owner??'p')!=='p');
  // ---- KEEP PLACING: one click per building, the next one is handed straight to the cursor ----
  S().inventory=[]; B.giveItem('b','solar',3); G('renderBackpack')();
  document.querySelector('#bpGrid').children[0].onclick();
  assert(S().placing==='solar','the backpack hands you the first solar panel');
  click(10,10); click(16,10);
  assert(S().placing==='solar','after 2 of 3 you are STILL placing (the stack refills your hand)');
  click(22,10);
  assert(S().placing===null && S().buildings.filter(b=>(b.owner??'p')==='p').length===3,
    `3 placed in a row without reopening the backpack, then it stops (${S().buildings.filter(b=>(b.owner??'p')==='p').length} buildings)`);
  assert(G('invCount')('b','solar')===0,'the stack is empty at the end');
  // the backpack stays open while you place
  S().inventory=[{kind:'b',type:'solar',n:2}];
  G('openPanel')('backpack');                          // (in the game you opened it to click the card)
  document.querySelector('#bpGrid').children[0].onclick();
  assert(document.querySelector('#p-backpack').classList.contains('show'),'the BACKPACK STAYS OPEN while you are placing');
  click(30,10); S().placing=null; G('closePanel')('backpack');
  // ---- SHIFT + DRAG = lay a whole run ----
  S().buildings=S().buildings.filter(b=>(b.owner??'p')!=='p');
  S().inventory=[]; B.giveItem('b','solar',30); G('renderBackpack')();
  document.querySelector('#bpGrid').children[0].onclick();
  click(20,20,{shiftKey:true});
  assert(!!G('placeDrag'),'SHIFT+mousedown starts a drag-place instead of dropping one');
  { const w=G('plotToWorld')('p',48*SLOT8,26*SLOT8); mouse.wx=w.x; mouse.wy=w.y; }   // drag out the area
  { const g=G('ghostSlot')(), sp=G('placeSpots')('solar',G('placeDrag'),g,'land');
    assert(sp.length>5 && sp.every(s=>s.gx>=0&&s.gy>=0&&s.gx<G('PLOT_W')&&s.gy<G('PLOT_H')),`the preview lays out ${sp.length} footprints inside the grid`); }
  pump(30);                                   // renders the drag preview
  mouseUp();
  const run=S().buildings.filter(b=>(b.owner??'p')==='p');
  assert(run.length>5,`letting go places the whole run (${run.length} solar panels)`);
  assert(new Set(run.map(b=>b.gx+','+b.gy)).size===run.length,'a drag spreads them SIDE BY SIDE (nothing stacked by accident)');
  assert(G('invCount')('b','solar')+run.length+(S().placing?1:0)===30,'every panel of the run came out of the backpack stack');
  // a run bigger than your stack: it stops at the last one you own
  S().buildings=S().buildings.filter(b=>(b.owner??'p')!=='p'); S().placing=null;
  S().inventory=[]; B.giveItem('b','solar',5); G('renderBackpack')();
  document.querySelector('#bpGrid').children[0].onclick();
  click(20,20,{shiftKey:true});
  { const w=G('plotToWorld')('p',90*SLOT8,60*SLOT8); mouse.wx=w.x; mouse.wy=w.y; }
  mouseUp();
  const run2=S().buildings.filter(b=>(b.owner??'p')==='p');
  assert(run2.length===5 && S().placing===null && G('invCount')('b','solar')===0,`a run stops at the last one you own (${run2.length} of 5 placed)`);
  // ---- ORIGINAL RARITY AUDIT: exact reference matches use the source game's labels ----
  {
    const expected={oil:'epic',ironmine:'common',data:'myth',research:'legend',fusion:'limited',depot:'rare',hydro:'uncommon',alloy:'legend',offshore:'epic',navalbeacon:'myth'};
    const wrong=Object.entries(expected).filter(([id,rar])=>G('BUILD')[id]?.rar!==rar);
    assert(!wrong.length&&G('UNITS').spectre.rar==='myth'&&G('rarRank')(G('BUILD').fusion.rar)>G('rarRank')(G('BUILD').campus.rar),
      `source rarities corrected (Fusion Reactor LIMITED; Spectre MYTHIC)${wrong.length?': '+wrong.map(([id])=>id).join(', '):''}`);
  }
  { const badge=G('rarBadge')('limited');
    assert(badge.includes('LIMITED')&&badge.includes('#00e5ff')&&!badge.includes('#ef5350')&&!badge.includes('#ec407a'),'LIMITED is shown in cyan, not pink or red MYTHIC'); }
  // ---- AUTO SORT: best rarity first ----
  const order=G('bestFirst')(Object.keys(G('BUILD')),G('BUILD'));
  let mono=true; for(let i=1;i<order.length;i++) if(G('rarRank')(G('BUILD')[order[i-1]].rar)<G('rarRank')(G('BUILD')[order[i]].rar)) mono=false;
  assert(mono && G('rarRank')(G('BUILD')[order[0]].rar)>G('rarRank')(G('BUILD')[order[order.length-1]].rar),
    `every list is auto-sorted: ${G('BUILD')[order[0]].rar} at the top, ${G('BUILD')[order[order.length-1]].rar} at the bottom`);
  S().shopTab='production'; G('renderShop')();
  { const names=document.querySelector('#shopGrid').children.map(c=>c.children[2].textContent);
    const byName=Object.fromEntries(Object.keys(G('BUILD')).map(k=>[G('BUILD')[k].name,k]));
    let ok=names.length>2;
    for(let i=1;i<names.length;i++) if(G('rarRank')(G('BUILD')[byName[names[i-1]]].rar)<G('rarRank')(G('BUILD')[byName[names[i]]].rar)) ok=false;
    assert(ok,`the SHOP shows the best first (${names.slice(0,3).join(' / ')})`); }
  G('Admin').renderLists();
  assert(/golden/.test(document.querySelector('#aBuilds').children[0].dataset.find),'the ADMIN building list starts with the golden items');
  // ---- BOSS: surfaces in the CITY (the middle) and SLAMS ----
  S().units=[]; S().nextWave=9999; S().nextBoss=9999;
  G('spawnBoss')();
  const boss=S().units.find(u=>u.boss), MCc=G('MAP_C');
  assert(!!boss && Math.hypot(boss.x-MCc.x,boss.y-MCc.y)<250,`the worm surfaces in the MIDDLE (${Math.round(Math.hypot(boss.x-MCc.x,boss.y-MCc.y))}px from the city centre)`);
  const bait=[];
  for(let i=0;i<4;i++){ const u=B.mkUnit('rifle','p',boss.x+50+i*30,boss.y+30); u.hp=u.maxHp=200; bait.push(u); S().units.push(u); }
  const hp0=bait.map(u=>u.hp);
  pump(5200);
  assert(bait.some((u,i)=>u.hp<hp0[i]),`the worm SLAMS everything around it (hp ${hp0.map(h=>Math.round(h)).join(',')} → ${bait.map(u=>Math.round(u.hp)).join(',')})`);
  // ---- admin custom boss HP ----
  document.querySelector('#aBossHp').value='250K'; G('Admin').bossHp();
  assert(Math.round(boss.maxHp)===250000,`admin set a custom boss HP (${fmtN(boss.maxHp)})`);
  S().units=S().units.filter(u=>!u.boss); G('spawnBoss')();
  assert(Math.round(S().units.find(u=>u.boss).maxHp)===250000,'the NEXT boss spawns with that HP too');
  document.querySelector('#aBossHp').value=''; G('Admin').bossHp();
  S().units=S().units.filter(u=>!u.boss); G('spawnBoss')();
  assert(Math.round(S().units.find(u=>u.boss).maxHp)===G('BOSS').hp,'clearing the box puts the boss HP back to default');
  S().units=[];
  // ---- a land unit that ends up in the water is put back on the shore ----
  const swim=B.mkUnit('rifle','p',PC.x-900,PC.y);
  assert(!B.walkableAt(swim.x,swim.y),'the test soldier really is in open water');
  S().units.push(swim); pump(100);
  assert(B.walkableAt(swim.x,swim.y),`it is teleported back onto the nearest ground (${Math.round(swim.x)},${Math.round(swim.y)})`);
  // ---- the bridge is land even when its 40px grid cell was sampled as water ----
  {
    const b=B.BRIDGES[2], len=Math.hypot(b.bx-b.ax,b.by-b.ay), ux=(b.bx-b.ax)/len, uy=(b.by-b.ay)/len, nx=-uy, ny=ux;
    let deck=null;
    outer: for(let d=80;d<len-80;d+=5) for(let off=-40;off<=40;off+=5){
      const x=b.ax+ux*d+nx*off, y=b.ay+uy*d+ny*off, [cx,cy]=B.cellOf(x,y);
      if(!B.WALK[cy*B.GW+cx]&&B.walkableAt(x,y)){ deck={x,y}; break outer; }
    }
    assert(!!deck,'the diagonal bridge has valid land points inside some cells sampled as water');
    if(deck){
      const walker=B.mkUnit('rifle','p',deck.x,deck.y); walker.order={x:deck.x,y:deck.y}; S().units=[walker];
      G('updateUnit')(walker,.001);
      assert(Math.hypot(walker.x-deck.x,walker.y-deck.y)<1,'a land unit stays on the bridge instead of being bounced to shore');
    }
  }
  // ---- land armies leave water-only RIG captures to the navy ----
  {
    const before=S().points.map(p=>({owner:p.owner,faction:p.faction})), attackCity=S().attackCity;
    for(const p of S().points){ if(p.water){p.owner='enemy';p.faction=1;} else {p.owner='player';p.faction=0;} }
    const scout=B.mkUnit('rifle','p',PC.x,PC.y), target=G('targetFor')(scout);
    assert(!target.point||!target.point.water,`a land soldier does not choose an offshore RIG (${target.point?.name||'other target'})`);
    S().points.forEach((p,i)=>{p.owner=before[i].owner;p.faction=before[i].faction;}); S().attackCity=attackCity;
  }
  // ---- land can follow the diagonal bridge all the way to another island ----
  {
    S().units=[];
    const dest=G('plotCenter')(G('MAP_PLOTS')[2]), walker=B.mkUnit('rifle','p',PC.x,PC.y);
    walker.order={x:dest.x,y:dest.y}; S().units.push(walker);
    for(let i=0;i<2000;i++) G('updateUnit')(walker,.05);
    const left=Math.hypot(walker.x-dest.x,walker.y-dest.y);
    assert(left<100&&B.walkableAt(walker.x,walker.y),`a rifle crosses the bridge to the NE island (${Math.round(left)}px left)`);
  }
  // ---- NO COLLISION: units never block each other, they just drift apart ----
  S().units=[];
  const m1=B.mkUnit('rifle','p',PC.x,PC.y), m2=B.mkUnit('rifle','p',PC.x+4,PC.y);
  m1.hp=m1.maxHp=m2.hp=m2.maxHp=99999;
  m1.order={x:PC.x+600,y:PC.y}; m2.order={x:PC.x+600,y:PC.y};
  S().units.push(m1,m2);
  pump(4000);
  const left=Math.hypot(m1.x-(PC.x+600),m1.y-PC.y), gap=Math.hypot(m1.x-m2.x,m1.y-m2.y);
  assert(left<400 && Math.hypot(m2.x-(PC.x+600),m2.y-PC.y)<400,`two troops on the same spot still march (${Math.round(left)}px left to go)`);
  assert(gap>6,`they keep a little distance instead of overlapping (${Math.round(gap)}px apart)`);
  // ---- nobody is left swimming: 25s of war with waves, bots and a crowded base ----
  S().units=[]; S().nextWave=2; S().nextBoss=9999;
  for(const id of ['rifle','tank','sniper','heavy']) G('Admin').spawnUnit(id,15,'p');
  for(let i=0;i<7;i++) for(const id of ['rifle','tank']) G('Admin').spawnUnit(id,5,String(i));
  pump(25000);
  { const wet=S().units.filter(u=>{
      if(G('isAir')(u)||G('isSea')(u)||B.walkableAt(u.x,u.y)) return false;
      for(const d of [[14,0],[-14,0],[0,14],[0,-14]]) if(B.walkableAt(u.x+d[0],u.y+d[1])) return false;  // at the waterline is fine
      return true;
    });
    assert(wet.length===0,`25s of war (${S().units.length} troops, wave ${S().wave}): nobody is left swimming (${wet.length})`);
    const stranded=S().units.filter(u=>G('isSea')(u)&&!G('isSeaAt')(u.x,u.y));
    assert(stranded.length===0,`no ship is stranded on land either (${stranded.length})`); }
  S().units=[]; S().nextWave=9999; S().inventory=[];
}
function fmtN(n){ return Math.round(n).toLocaleString('en-US'); }

S().admin.noRespawn=false;

console.log(`\n${T.frames} frames simulated. ${process.exitCode?'SMOKE TEST FAILED':'ALL SMOKE TESTS PASSED'}`);
process.exit(process.exitCode||0);
