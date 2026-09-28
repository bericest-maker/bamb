/* Military Base 2.5D — 01-helpers.js · helpers: $, clamp, dist, rnd, fmt… */
'use strict';
// ================= helpers =================
const $ = s => document.querySelector(s);
const clamp = (v,a,b)=> v<a?a:(v>b?b:v);
const clamp01 = v => clamp(v,0,1);
const dist = (a,b)=> Math.hypot(a.x-b.x, a.y-b.y);
const rnd = (a=1,b)=> b===undefined ? Math.random()*a : a+Math.random()*(b-a);
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
// v8.5: how good a rarity is (higher = better) — every list shows the best stuff first
const rarRank = r => { const i=RAR_ORDER.indexOf(r); return i<0?-1:i; };
// v8.5: sort an id list best-rarity-first (ties broken by name) — shop, backpack and admin all use it
const bestFirst = (ids,table) => ids.slice().sort((a,b)=>{
  const d=table[a]||{}, e=table[b]||{};
  return rarRank(e.rar)-rarRank(d.rar) || String(d.name||a).localeCompare(String(e.name||b));
});
const fmt = n => {
  n = Math.floor(n);
  if (n>=1e9) return (n/1e9).toFixed(2)+'B';
  if (n>=1e6) return (n/1e6).toFixed(2)+'M';
  if (n>=1e4) return (n/1e3).toFixed(1)+'k';
  return n.toLocaleString('en-US');
};
const fmtTime = s => { s=Math.max(0,Math.ceil(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
const lerp=(a,b,t)=>a+(b-a)*t;
const pi2=Math.PI*2;
