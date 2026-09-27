/* Military Base 2.5D — 08-rarities.js · rarity ladder (common → rebirth + golden) and its colours */
'use strict';
// full rarity ladder of the original (minus Dev) + our crate-only golden tier
const RAR = {
  common:{c:'#8f9aa8',label:'COMMON'}, uncommon:{c:'#5bc24e',label:'UNCOMMON'}, rare:{c:'#4a90e2',label:'RARE'},
  epic:{c:'#a35ad6',label:'EPIC'}, legend:{c:'#f5a53f',label:'LEGENDARY'}, myth:{c:'#ef5350',label:'MYTHIC'},
  limited:{c:'#ec407a',label:'LIMITED'}, unique:{c:'#26c6da',label:'UNIQUE'}, rebirth:{c:'#ff7043',label:'REBIRTH'},
  gold:{c:'#ffd54f',label:'GOLDEN'},
};
const RAR_ORDER = ['common','uncommon','rare','epic','legend','myth','limited','unique','rebirth','gold'];
