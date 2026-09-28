/* Military Base 2.5D — 02-achievements.js · achievement check loop: unlock once → pay out + toast */
'use strict';
// achievements: unlock once, pay out, toast
function checkAchievements(){
  if(!S.achievements) S.achievements={};
  for(const a of ACHIEVEMENTS){
    if(S.achievements[a.id]) continue;
    let ok=false; try{ const [c,g]=a.prog(); ok=c>=g; }catch(e){}
    if(!ok) continue;
    S.achievements[a.id]=Math.floor(S.time);
    if(a.give.cash) S.cash+=a.give.cash;
    if(a.give.crate) giveItem('c',a.give.crate);
    toast(`🏆 ACHIEVEMENT: ${a.name} — ${a.give.cash?'$'+fmt(a.give.cash):a.give.crate[0].toUpperCase()+a.give.crate.slice(1)+' Crate'}`,'#ffd54f');
    sfx('capture');
  }
}
