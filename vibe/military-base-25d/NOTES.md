# Military Base 2.5D — Project Notes

**Reference data (uploaded by user — full raw files kept in `ref/`, not duplicated here):**
- `ref/units-original.txt` — 116 units from the original game (stats, classes, damage modifiers)
- `ref/buildings-original.txt` — 154 buildings from the original game (categories, production, power)
- `ref/traits-original.txt` — 80 building traits + `TraitsConfig` roll pools/weights (parsed index in 🧬 Traits below)
- `uploads/Buildings_01_of_04.txt` … `Buildings_04_of_04.txt` — 172 original buildings as 3D-model dumps (parts, meshes, `bounds` footprints; parsed index in 🏗️ Models below)
- `ref-map-original.png` — screenshot of the original game's map (see MAPS)

---

## 🎯 GOALS (roadmap — everything below is "do later")

### UI
- [x] Shop tabs like the original: PRODUCTION / UNITS / DECORATION / SPECIAL (+ UNITS sub-tabs per class) — v4
- [x] Tooltips with full stats: classes, damage modifiers, footprint (UnitSize)
- [x] Achievements panel (see ACHIEVEMENTS) — v4 🏆
- [x] Leaderboard stub — v4 📊 (8 factions by power + flags held + v7 structure/army split)
- [x] Crate UI for the full rarity ladder (new colors for Limited / Unique / Rebirth)
- [x] **📜 PATCH NOTES panel** (v7) — every build's changes, readable in game (left rail)

### Game (mechanics)
- [x] **Damage modifiers (matchups)** (v4) — damage multiplied per TARGET class (e.g. Heavy Tank: armored ×1.2, light ×0.7, air ×0.5, stealth ✝; Anti-Air Vehicle: air ×1.5, ground ✝). Replaces/augments current flat armor.
- [x] **Multi-class units** (v4: Phantom, Spectre, Saboteur, Stealth Heli, B-2) — 2+ classes per unit
- [x] **UnitSize footprints** — v4 cap counting + **v7 spawn spacing** (a trained unit looks for a free spot its own size instead of stacking on the building)
- [x] **Wave-defense garrisons** (v7) — while a raid is incoming (or hostiles are within 1300px of your plot) every unit building trains FREE defenders of its own type, up to its MaxCap (24 troop slots base-wide). They stand down when the base is safe. (original's `WaveDefenseUnitProduction`)
- [x] **Money Capacity** (v7) — every money building stores what it earns up to a cap (≈10 min of production) and pays out every 30s, or the instant you click it (new HUD row: stored/cap)
- [x] **Bank building** — v4; v7: pays 5% of the cash **stored inside your buildings** (original: IncomePercent on capacity)
- [x] **StructurePower** (v7) — a building's power score is tracked separately from army power; the leaderboard shows both

### Achievements
(not in the uploaded data — design our own)
- [x] Checklist: first building, first capture, first boss kill, 100 kills, hold all 5 points, rebirth 1/3/5, power milestones
- [x] Toast on unlock + progress in the UI panel

### Rewards
- [x] Extend rarity ladder: Common → Uncommon → Rare → Epic → Legendary → Mythic → **Limited → Unique → Rebirth** (skip Dev)
- [x] Crate drop pools include the new units/buildings (see UNITS / BUILDINGS below)
- [x] **Kill rewards scale with unit power** (v7) — bounty = base reward × wave HP buff × tier (×1 rifleman … ×3 Centurion)

### Boosts
- [x] Outpost points: each held point +10% production (original: 8 outposts; we have city +20% only)
- [x] Supply Depot: +10 troop cap (max 100)
- [x] Bank: % of stored cash (see Game)
- [x] Rebirth +10% each (already in)

### Units
- [x] P1 (cheap, high impact) — v7 adds the stragglers **Mantis, TIGR, Swarm Drone** (Sniper, Commando, Rocket, Humvee, Ranger, APC, Huey, Flak, Drone were v4)
- [x] P2 (heavies) — v7 adds **Light Tank, ICBM Launcher, Leopard 2A5, PZH 2000** (Heavy Tank, Railgun, AC-130, B52, Mammoth, Artillery were v4)
- [x] P3 (specialists) — v7 adds **F-15, F-35, SU-47, KA-52 + Officer** (support, 0 damage, gives allies +25% damage) (F22, Cobra, Blackhawk, A-10, B2, Stealth Heli, Medic were v4)
- [x] **Naval line** (v7) — **Gunboat, Frigate, Battleship, Carrier, Submarine, Zumwalt, Speedboat** (+ the UNIQUE **Centurion**). Ships sail the water lanes; Submarine + Zumwalt are STEALTH.

### Textures (sprites)
- [x] New 2.5D flat sprites for every new unit & building (v7: a **ship template** for the navy, **dock** + **silo** building styles, Centurion walker, ICBM truck)
- [x] Map dressing from `ref-map-original.png`: trees, flowers, floating water crystals, city arena ring
- [x] Rarity colors for the 3 new tiers
- [x] v7: shipping lanes, buoys and ship wakes

### Buildings
- [~] Production ladder — v7: **21 of the original's 48** (9 more added: Advanced Solar → Hydroponics → Gas Storage Tank → Alloy Foundry → Offshore Oil Rig → Naval Beacon → Particle Accelerator → Corporate Campus → Automated Factory)
- [x] One unit building per new unit (depot / hangar / helipad / **dock** naming)
- [x] Special: Supply Depot ✔, Pentagon ✔, **Airship Docks ✔ (v7)**, **Submarine Cavern ✔ (v7)**, **Centurion Support Site ✔ (v7)**

### Traits & reroll (NEW — full spec in 🧬 Traits below; models in 🏗️ Models below)
- [ ] **Trait pools per building model** — Production pool → `tab:'production'` money buildings; Unit pool → `tab:'units'` trainers; Logistics pool → `special:'logistics'` collectors; MissileTurret pool → `turret:{}` defence buildings (trait defs NOT in the paste — stub: Weaponized / Supersonic / Accuracy)
- [ ] **Model-grounded sizes** — `bounds` footprints from `uploads/Buildings_01..04_of_04.txt` are the canonical base size that Tiny (×0.5–0.9) / Titanic (×1.05–1.5) scale; 38/100 of our buildings match the dumps by exact name
- [ ] **Rarity roll, then trait roll** — Unique 0.01 / Mythic 0.04 / Legendary 0.06 / Epic 5 / Rare 13 / Uncommon 27 / Common 54.89, then weighted pick inside the rarity (low tier ×2, high tier ×1; Logistics uses one flat table instead)
- [ ] **10% double trait** — every roll has a 10% chance to grant 2 traits instead of 1 (never the same trait twice)
- [ ] **Stat mapping onto our models** — ResourceProduction → income mult; IncomeSpeed → payout cycle ÷ (1+speed); size → building draw scale; unit UnitDamage/Health/Speed/AttackRate/SpawnCount/Size → trained-unit stats; bounty money → kill-reward pool (see mapping table)
- [ ] **Collector stats need a home** — Overtime (collector speed), Cooldown, Range, Employment Agency assume collector units we don't have; either add collectors or reinterpret as payout-cycle / aura-radius / logistics-cap bonuses
- [ ] **Trait reroll** — spend escalating cash to re-spin a placed building's traits; keep-old vs take-new choice; double-trait chance applies to rerolls too
- [ ] **UI** — trait pips on shop/backpack cards + tooltip rows; reroll button on the building click panel
- [ ] **Save** — `b.traits=[...]` on buildings; backpack stacks split by trait set

### Maps
- [x] Organic blobby coastlines fused around each square plot (v4 radial map like the picture) (see MAPS)
- [x] Trees on islands, floating water crystals
- [x] City center (octagon + plaza)
- [x] **Water lanes for ships** (v7) — a ring of shipping lanes around the CITY (r 955), 8 radial lanes out to the open sea and an outer loop (r 2260), with bobbing buoys. Ships path on a SEA grid (maps/02-sea.js) and shell the shore from the closest water.

### Performance & quality of life (v8)
- [x] **BLOCK MODE** (v8.2, was POTATO MODE) — ⚙ SETTINGS gained UNIT GRAPHICS and BUILDING GRAPHICS rows, each `Normal` or `Blocks`. Blocks draws one plain rectangle per troop EXACTLY its sprite's size (SPR w×h) and per building EXACTLY its footprint — just the owner's colour, no shadow/outline/highlight (`js/render/05-blocks.js`). Old `Potato` saves migrate to `Blocks`.
- [x] **TREES & DECOR** toggle — trees, rocks, grass patches and the floating crystals can be hidden and shown again.
- [x] **EFFECTS High/Low** (was GRAPHICS MODE) — Low now also drops the ocean glints, the lane glow and halves the coastline detail (72 → 28 segments).
- [x] **INDESTRUCTIBLE BUILDINGS** (default ON) — nothing can damage a building and right-click no longer sells yours; switching it off restores destructible bases + the 50% refund.
- [x] **World ×2** — WORLD 4800→9600, RING 1700→2600 (see MAPS). Load stays ~100 ms: `walkableAt` rejects most of the 57 600 walk cells by bounding box before any trig.
- [x] **No drive-by shooting** — `aggroReach()`: MARCHING units engage at `min(range+60, AGGRO.march 210)`; units that HOLD (garrisons, base defenders, idle troops) keep `range+220`.
- [x] **Idle troops march on the MIDDLE** — no order → the CITY, then the nearest point you don't own, fighting only what comes close.
### Harbour & inspection (v8.3)
- [x] **Your WATER YARD** (v8.3) — a buildable 832x224px strip of sea behind your island. Every dock + the Offshore Oil Rig + the Naval Beacon are `water` buildings and only fit there; land buildings are refused. Ships launch straight into it.
- [x] **4 water capture points** (v8.3) — RIG NW/NE/SE/SW at r 2100; only ships can reach them, a held rig garrisons gunboats, +10% production each (8 outposts total like the original).
- [x] **Build grid twice as fine** (v8.3) — SLOT 16 -> 8, PLOT 104x72 cells (island unchanged), GRID_K 8, save migration from any older cell size.
- [x] **Buildings 3x smaller** (v8.3) — `BLD_K` 1.3 -> 1.3/3, so several times more of them fit on an island.
- [x] **Hover a troop -> its stat card** (v8.3) — hp/damage/DPS/range/speed/troop-cap/armour/detect/splash/aura/bounty/modifiers/order, via the spatial hash (`unitAt`), throttled so it stays free with 1000 units.
- [x] **Hold Q to pause** (v8.3) — freezes the battle, keeps the camera + hover cards + panels live.
- [x] **Zoom out to the whole map** — the zoom-out limit is `MINZ = min(W/WORLD.w, H/(WORLD.h·0.72))` (recomputed on resize) instead of a fixed 0.5×; fully zoomed out the camera locks to the map centre (`clampCam()`).
- [x] **Enemy bases show their buildings + troops only** — grid pads, dashed outlines and name labels are hidden (⚙ ENEMY BASE GRIDS brings them back).

### Boss spawn center (v8.10)
- [x] **Bosses surface at the exact map/CITY center** — `spawnBoss()` now uses `MAP_C.x, MAP_C.y` directly, with no random offset. Both the timer and ADMIN → SUMMON share this path; the boss still attacks after surfacing.
- [x] **Exact-position regression coverage** — smoke checks the initial worm plus later custom-HP and default-HP spawns are exactly at the center.

### Unit visual polish (v8.9)
- [x] **Cohesive tactical unit art** — infantry gain layered field kit and more readable rifles; ground vehicles gain shaped armor, track/wheel hardware, hatches and weapon fittings; aircraft gain cockpit glass, panel marks and rotor/engine detail; naval sprites gain portholes, deck edges and turret detail.
- [x] **Cached lighting pass** — `unitPolish()` adds a restrained top sheen and lower shadow clipped to unit pixels only. Faction colors and all sprite dimensions stay unchanged.
- [x] **Buildings and Blocks are untouched** — no building sprite changes; Blocks mode remains one plain faction-colored rectangle at the unit sprite's exact `w×h`. Smoke blits every registered unit through the normal sprite cache.

### Limited color (v8.8)
- [x] **LIMITED is cyan** — the Limited badge, card border, tooltip name, and admin text use bright cyan (`#00e5ff`); Mythic stays red and Limited stays above Mythic in the sorted lists.
- [x] **Smoke-verified** — Limited renders the `LIMITED` label in cyan, never the old pink or Mythic red.

### Rarity audit (v8.7)
- [x] **Limiteds match the original list** — checked current units/buildings against `ref/units-original.txt` and `ref/buildings-original.txt`; Fusion Reactor is **LIMITED**, not Mythic (red).
- [x] **Other direct source mismatches corrected** — Oil Drill Epic, Iron Mines Common, Data Center Mythic, Research Lab Legendary, Supply Depot Rare, Hydroponics Facility Uncommon, Alloy Foundry Legendary, Offshore Oil Rig Epic, Naval Beacon Mythic, and Spectre Mythic. Added/remake-only items with no source match were left unchanged.
- [x] **LIMITED badge & sort verified** — the badge says LIMITED, and Limited ranks above Mythic in the auto-sorted lists; `node smoke.js` passes 249 assertions.

### Land routing (v8.6)
- [x] **Bridge water-rescue fix** — `WALK` samples 40px cell centres, so valid points near diagonal bridge edges can be in cells labelled water. The rescue check now confirms the exact point whenever land is nearby; smoke verifies a soldier is not bounced from the bridge.
- [x] **Land armies ignore water-only capture rigs** — ground target selection skips offshore RIGs; ships still reach and capture them. When there are no land points left, ground units move on to enemy buildings instead.
- [x] **End-to-end route regression** — a rifle follows the bridge from the player island to the NE island; `node smoke.js` passes 247 assertions.

### Build flow, boss & movement (v8.5)
- [x] **Keep placing** (v8.5) — after you drop a building the next one from the backpack stack is handed to the cursor (`keepPlacing` / `refillHand` / `placeLeft`); it stops when the stack is empty.
- [x] **SHIFT + drag = place a run** (v8.5) — press and drag: `placeSpots()` previews every footprint in the rectangle (green / red, lifted to its stack level) and `placeRun()` places them on release, capped by what you own.
- [x] **The backpack stays open while placing** (v8.5) — click the next card to switch item.
- [x] **Auto-sort: best rarity first** (v8.5) — shop (then cheapest), backpack (crates first, then rarity) and both admin lists, via `rarRank()` + `bestFirst()`.
- [x] **The worm surfaces in the MIDDLE** (v8.5) — `spawnBoss()` uses the CITY island, and it SLAMS every 4.5s: 45 damage to enemy units within 210px, 130 to enemy buildings within 260px (`BOSS_SLAM`, `bossSlam`).
- [x] **Admin custom boss HP** (v8.5) — `#aBossHp` + SET HP (K/M/B), applies to the live worm and every later spawn; empty = default.
- [x] **No unit collision** (v8.5) — separation is now a weak don-touch drift (soldiers and ships alike) instead of a shove that stalled columns.
- [x] **No drowning** (v8.5) — `nearestLand()` puts any land unit that ends up in the water back on the nearest shore.

### Stacking & crates (v8.4)
- [x] **Buildings stack — unlimited height** (v8.4) — aim at a building you already own and the next one lands on top of it. `stackTopAt()` = the level a new building lands on, `fitsAt/findFreeSpot/ghostSlot/placeBuilding/placeBuildingRaw` take that `lvl`, `b.lvl` is saved, `STACK_UP` (24px) lifts each floor in the renderer (y-sort, then level). `buildingAt()` is lift aware so clicking picks the floor you aimed at. Every floor works on its own (4 barracks 4 high = 4 recruits).
- [x] **Ground first** — `findFreeSpot()` only climbs a pile when there is no free ground left, so bot bases and admin fills still spread out across the island.
- [x] **The ghost shows the floor** — dashed drop-legs + a LEVEL n label while you hold an item over a pile.
- [x] **Backpack stacks** (v8.4) — one card per item with an ×N badge; `giveItem/takeItem/invCount/invFind` merge and split stacks, `mergeInventory()` folds old saves.
- [x] **Bulk crate opening** (v8.4) — click a crate stack → choose 1 / 5 / 10 / ALL (`askOpenCount`); `openCrateModal(ct,n)` rolls them all and lists every win, rarest first, with ×counts and rarity colours.
- [x] **The ROBUX SHOP works** (v8.4) — it called a `renderRobux()` that did not exist; it now sells Standard / Elite / Premium crates for cash (1 or 10 at a time).
- [x] **Admin.pile(type,n)** — stack n buildings into a tower (quick way to see the feature).

---

## 📁 FOLDER LAYOUT (v7)

`js/` used to be one flat list of 24 files. It is now **12 folders** (load order still comes from `index.html`; every file keeps its `/* Military Base 2.5D — file.js · … */` header so `gen_info.py` can document it):

| Folder | What lives there |
|---|---|
| `js/core/` | the engine — helpers, state, save, audio, camera + ground texture, fx, the main loop, boot/init |
| `js/data/` | pure DATA — world + map layout, factions, classes, units (+ unit helpers), buildings, unit buildings, rarities, the naval units, the expansion units, the new production buildings, the new unit buildings |
| `js/maps/` | the island map (shapes, walk grid, A*, city flow field) **+ the sea** (SEA grid, shipping lanes, ship navigation) |
| `js/textures/` | the whole sprite library — base sprites, unit templates (infantry/vehicle/heli/plane), ships, new units, buildings (+ footprint computation) |
| `js/systems/` | cross-cutting systems — power, economy, waves/boss, capture points |
| `js/buildings/` | what buildings DO — placement, **production (money capacity, training, wave-defense garrison)**, bots, turrets, support |
| `js/units/` | spawn + garrisons, movement (**land + sea**), spatial hash, AI/detection, combat & bounties |
| `js/rewards/` | crate tables, redeem codes, the REWARDS list + its panel |
| `js/achievements/` | the achievement list, the unlock loop, the 🏆 panel |
| `js/render/` | the frame, unit/boss/flag sprites, the ground (ocean, lanes, islands, trees…), the minimap |
| `js/ui/` | core (toasts/panels/buttons), shop, tooltips, backpack, leaderboard, settings, rebirth, tutorial, input, **patch notes** |
| `js/admin/` | the F1 admin/debug drawer |

---

## 🖥️ UI (current state)
- Shop: PRODUCTION / UNITS (**+ ⚓ NAVAL sub-tab**) / SPECIAL / DECOR tabs; backpack placement; crates (Standard/Decorative/Elite/Premium + pity 80)
- Admin drawer (F1): cash, buildings, units, boss, waves, points, speed/pause, god mode, bot presets, **EMPTY ALL SAFES / MUSTER GARRISON / STAND DOWN / RAID ALERT**
- HUD: wave (+ 🛡 garrison alert) + boss timers, minimap (with shipping lanes), toasts, tutorial, **🏦 stored cash / capacity row**
- 📜 PATCH NOTES panel (left rail) — what changed in every build
- Gaps vs original: no DECORATION tab label (we call it DECOR)

## 🎮 Game (mechanics — what the original does that we don't)
1. **Damage modifiers** — each unit has per-target-class multipliers (`DamageModifiers` in the data). `0` = cannot damage that class (e.g. most heavies can't hurt Stealth; Anti-Air can't hurt ground). This is the real counter system — far richer than flat armor.
2. **Classes** = the type system we built (Light ≈ our "land", Armored, Air, Stealth) — original allows **multiple classes per unit**.
3. **AttackRate** is "per 100 ticks" (100 = 1/sec baseline): A10 Warthog 300 = 3 shots/sec, ICBM 7 = 1 shot/14s.
4. **UnitSize** = footprint in cells (1…20; Carrier 18, Behemoth 18, Leviathan 20).
5. **Wave defense** — buildings train garrison units automatically (`WaveDefenseUnitProduction` MaxCap) when waves spawn. ✔ **v7** (buildings/02-production.js).
6. **ResourceProduction Capacity** — buildings store cash up to a cap; Bank converts % of stored cash to income. ✔ **v7** (`BUILD[].cap` + `cycle`, HUD row, click to collect).
7. **StructurePower** — power score of buildings (we track unit+building power; align naming). ✔ **v7** (`structurePower()` / `armyPower()` / `powerSplit()`).
8. **RequiredPower** — power-gated building placement (we have this).

## 🏆 Achievements
See GOALS → Achievements. (Original data didn't include these.)

## 🎁 Rewards
- Rarity ladder in original data: Common, Uncommon, Rare, Epic, Legendary, Mythic, Limited, Unique, Rebirth (+ Dev = debug)
- Crate drop pools should follow rarity; Limited/Unique/Rebirth are the top tiers (e.g. AC-130, Railgun Tank, B52, F22 = Limited; Centurion = Unique; Apache + all monuments = Rebirth)
- Current crates: Standard $10k / Decorative $10k / Elite $1M / Premium + golden (golden = top tier already)

## 📈 Boosts
| Boost | Original | Us now |
|---|---|---|
| City held | +20% production | +20% ✓ |
| Each outpost | +10% production | ✗ (points give no income yet) |
| Supply Depot | +10 troop cap (max 100) | ✓ |
| Rebirth | +10% each | ✓ |
| Bank | 5% of stored cash | ✓ (v7) |

## 🪖 Units — original game (full stats in `ref/units-original.txt`)

Legend: `name [rarity] hp dmg/attackRate range speed szN · damage modifiers`. AttackRate 100 = baseline (100/attackRate = seconds per shot). `✝` = NO damage vs that class, `×1.5` = 150% vs that class. `+X` = second class.
### Light (25)

• **Light Infantry** [Common] 150hp 12dmg/100 16rng spd7 · Stealth✝
• **Scout** [Common] 125hp 16dmg/100 14rng spd9 · Stealth✝
• **ATV** [Uncommon] 400hp 10dmg/100 11rng spd12 · Air✝,Stealth✝
• **Sentinel Speedboat** [Uncommon] 200hp 35dmg/60 16rng spd14 · Air✝,Stealth✝,Light×0.7
• **Sniper** [Uncommon] 40hp 80dmg/30 28rng spd5 · Stealth✝,Light×1.5
• **Commando** [Rare] 350hp 15dmg/100 18rng spd7 · Stealth×1
• **Humvee** [Rare] 850hp 12dmg/100 13rng spd9 sz2 · Stealth✝
• **Rocket Trooper** [Rare] 150hp 90dmg/20 20rng spd6 sz2 · Armored×1.5,Stealth×1
• **Medic** [Epic] 200hp 0dmg/100 15rng spd7 sz4
• **Ranger** [Epic] 600hp 15dmg/180 18rng spd7 sz3 · Stealth✝
• **Drone** [Legendary] 250hp 17dmg/120 19rng spd12 sz2 · Stealth✝,Light×1.2
• **Shredder** [Legendary] 900hp 30dmg/240 20rng spd15 sz2 · Air✝,Stealth✝
• **Airship Marine** [Mythic] 500hp 50dmg/100 20rng spd7 sz2 · Stealth×1
• **Blackhawk Ranger** [Mythic] 600hp 65dmg/60 19rng spd7 sz2 · Stealth×1
• **Goblin** [Mythic] 600hp 60dmg/90 23rng spd13 sz2 · Stealth×1,Light×1.5
• **Headhunter** [Mythic] 225hp 500dmg/12 32rng spd7 sz2 · Stealth×1
• **Officer** [Mythic] 300hp 0dmg/100 15rng spd7 sz2
• **Operative** [Mythic] 750hp 40dmg/100 20rng spd7 sz2 · Stealth✝
• **Party Wagon** [Mythic] 300hp 20dmg/100 16rng spd11 +Armored · Air×1,Stealth✝,Armored×1,Light×1
• **Assault Suit** [Limited] 800hp 60dmg/100 21rng spd7 sz3 +Armored · Air×0.8,Stealth✝,Armored×1.1,Light×0.9
• **Marauder** [Limited] 1700hp 40dmg/180 15rng spd12 sz5 · Stealth✝,Armored×1.5,Light×0.75
• **Martyr** [Limited] 900hp 75dmg/60 22rng spd8 sz4 · Air✝,Stealth×1
• **Sentinel Saboteur** [Limited] 275hp 200dmg/60 15rng spd9 +Stealth · Air×1,Stealth✝
• **Specialist** [Limited] 300hp 1500dmg/10 32rng spd5 sz3 · Air×1,Stealth✝,Armored×1.5,Light×0.5
• **Swarm Drone** [Limited] 250hp 14dmg/180 16rng spd15 · Stealth✝,Light×1.2
### Armored (40)

• **Heavy Infantry** [Uncommon] 550hp 8dmg/180 14rng spd7 sz2 · Stealth✝
• **Gunboat** [Rare] 500hp 30dmg/120 19rng spd12 sz2 · Air✝,Stealth✝,Light×0.7
• **APC** [Epic] 1300hp 10dmg/60 11rng spd9 sz2 · Air✝,Stealth✝
• **Frigate** [Epic] 2200hp 45dmg/120 23rng spd9 sz5 · Stealth×1,Light×0.7
• **Light Tank** [Epic] 2000hp 35dmg/60 20rng spd6 sz4 · Air×0.8,Stealth✝,Light×0.8
• **Mobile Flak** [Epic] 650hp 20dmg/120 22rng spd6 sz3 · Air×1.5,Stealth×1,Armored✝,Light✝
• **Anti-Air Vehicle** [Legendary] 850hp 60dmg/70 25rng spd6 sz5 · Air×1.5,Stealth✝,Armored✝,Light✝
• **Artillery Truck** [Legendary] 900hp 300dmg/20 28rng spd6 sz5 · Air✝,Stealth✝,Light×0.8
• **Assault Trooper** [Legendary] 500hp 100dmg/60 18rng spd10 sz2 · Stealth✝
• **Drop Trooper** [Legendary] 450hp 50dmg/100 14rng spd7 · Stealth✝
• **Experimental Unit** [Legendary] 5000hp 30dmg/240 20rng spd7 sz7 · Stealth✝
• **Heavy Tank** [Legendary] 5000hp 110dmg/30 22rng spd5 sz7 · Air×0.5,Stealth✝,Armored×1.2,Light×0.7
• **Juggernaut** [Legendary] 2000hp 40dmg/100 14rng spd7 sz3 · Stealth✝
• **Mantis** [Legendary] 1000hp 80dmg/60 21rng spd9 sz5 · Air×1.2,Stealth✝,Light×0.8
• **TIGR** [Legendary] 1200hp 25dmg/100 13rng spd10 sz3 · Stealth✝
• **Viper** [Legendary] 2500hp 30dmg/90 11rng spd9 sz4 · Air✝,Stealth✝
• **Battleship** [Mythic] 12500hp 80dmg/120 30rng spd6 sz10 · Air×0.5,Stealth✝
• **Behehemoth** [Mythic] 13000hp 700dmg/20 19rng spd4 sz18 · Air✝,Stealth✝,Armored×1.2,Light×0.7
• **Behemoth** [Mythic] 13000hp 700dmg/20 19rng spd4 sz18 · Air✝,Stealth✝,Armored×1.2,Light×0.7
• **Cannon** [Mythic] 500hp 30dmg/60 20rng spd6 · Air✝,Stealth✝
• **Carrier** [Mythic] 12500hp 100dmg/60 30rng spd6 sz18 · Stealth✝
• **Evade Competitor** [Mythic] 1000hp 1000dmg/60 3rng spd20 · Air✝,Stealth✝
• **Flametrooper** [Mythic] 1000hp 60dmg/120 12rng spd9 sz5 · Air✝,Stealth✝
• **Leopard 2A5** [Mythic] 3000hp 180dmg/30 20rng spd9 sz7 · Air✝,Stealth✝
• **M1 Abrams** [Mythic] 2000hp 100dmg/35 22rng spd6 sz5 · Air×0.7,Stealth✝
• **Mammoth** [Mythic] 5000hp 300dmg/30 20rng spd9 sz10 · Air✝,Stealth✝
• **PZH 2000** [Mythic] 1000hp 600dmg/10 28rng spd6 sz5 · Air✝,Stealth✝
• **T14** [Mythic] 1400hp 80dmg/60 21rng spd8 sz4 · Air✝,Stealth✝
• **Type 99A** [Mythic] 2500hp 80dmg/40 20rng spd7 sz6 · Air×0.7,Stealth✝
• **Valkyrie** [Mythic] 700hp 80dmg/120 26rng spd6 sz5 · Stealth✝,Armored✝,Light✝
• **D4-WG** [Limited] 3000hp 50dmg/90 31rng spd7 sz7 · Air✝,Stealth×1
• **Drone Carrier** [Limited] 2500hp 10dmg/60 30rng spd6 sz8 · Stealth✝
• **Exotrooper** [Limited] 3000hp 30dmg/240 12rng spd7 sz6 · Air×0.5,Stealth×1
• **Flagship** [Limited] 15000hp 70dmg/180 32rng spd6 sz10 · Air×0.5,Stealth✝
• **ICBM Launcher** [Limited] 1500hp 1000dmg/7 31rng spd6 sz7 · Air✝,Stealth✝,Armored×1.2
• **Nemesis** [Limited] 12000hp 100dmg/120 32rng spd8 sz12 · Air×0.7,Stealth×1
• **Precursor** [Limited] 8000hp 30dmg/200 20rng spd4 sz12 · Stealth×1,Armored×0.8,Light×1.2
• **Prowler** [Limited] 1000hp 300dmg/30 29rng spd14 sz5 · Air✝,Stealth✝,Armored×0.8,Light×1.2
• **Railgun Tank** [Limited] 2300hp 800dmg/20 25rng spd5 sz6 · Air×1,Stealth✝,Armored×1.5,Light×0.5
• **Centurion** [Unique] 2500hp 20000dmg/4 10000rng spd6 sz15
### Air (31)

• **Little Bird** [Rare] 300hp 40dmg/60 19rng spd10 sz2 · Air×0.7,Stealth×1,Light×1.1
• **Huey** [Epic] 700hp 20dmg/180 19rng spd9 sz4 · Air×0.8,Stealth✝
• **F15** [Legendary] 250hp 65dmg/75 16rng spd16 sz2 · Air×1.2,Stealth×1,Light×0.8
• **F18** [Legendary] 250hp 65dmg/75 16rng spd16 · Armored×1.2,Stealth✝
• **A10 Warthog** [Mythic] 850hp 16dmg/300 20rng spd12 sz4 · Air×0.8,Stealth✝,Armored×1.2,Light×1.2
• **B1 Lancer** [Mythic] 800hp 300dmg/30 27rng spd18 sz5 · Air✝,Stealth✝
• **Blackhawk** [Mythic] 800hp 70dmg/60 19rng spd11 sz7 · Air×0.7,Stealth✝,Armored×0.5,Light×2
• **Cobra** [Mythic] 400hp 40dmg/120 20rng spd11 sz2 · Armored×0.8,Stealth✝
• **Enforcer** [Mythic] 440hp 35dmg/120 18rng spd16 sz3 · Air×1.2
• **KA-52** [Mythic] 1000hp 40dmg/120 26rng spd11 sz5 · Stealth×1
• **Mini-Mecha** [Mythic] 10000hp 160dmg/60 24rng spd7 sz18 · Stealth✝,Light×0.6
• **SU-47** [Mythic] 200hp 100dmg/60 19rng spd23 sz2 · Stealth×1
• **Spectre** [Mythic] 400hp 50dmg/180 19rng spd20 sz3 · Stealth✝
• **UAV** [Mythic] 500hp 60dmg/60 22rng spd15 sz2 · Air✝,Stealth×1,Light×1.4
• **Wasp** [Mythic] 600hp 80dmg/60 21rng spd15 sz3 · Air×0.7,Stealth×1,Light×1.1
• **AC-130** [Limited] 1500hp 60dmg/100 29rng spd6 sz6 · Armored×1.2,Stealth✝
• **Aerial Assault Carrier** [Limited] 7000hp 100dmg/60 25rng spd5 sz15 +Armored · Air×0.7,Stealth✝,Light×0.7
• **B52** [Limited] 1600hp 300dmg/30 30rng spd9 sz6 · Air✝,Stealth✝,Armored×2,Light×1
• **Chimera** [Limited] 8000hp 45dmg/240 28rng spd8 sz12 · Air×0.8,Stealth✝
• **Colossus** [Limited] 7000hp 140dmg/90 22rng spd6 sz20 · Air×0.7,Stealth✝,Light×0.7
• **Experimental Fighter** [Limited] 200hp 60dmg/60 18rng spd18 · Stealth✝
• **F22** [Limited] 350hp 45dmg/120 18rng spd17 sz2 · Armored×1.2,Stealth×1
• **F35** [Limited] 300hp 60dmg/120 19rng spd21 sz2 · Stealth×1
• **Hawk 2A** [Limited] 400hp 80dmg/100 21rng spd20 sz2 · Stealth✝,Armored×0.5,Light×0.5
• **Hornet** [Limited] 1200hp 30dmg/140 21rng spd10 sz3 · Air×0.8,Stealth✝,Armored×1.2
• **Leviathan** [Limited] 15000hp 45dmg/240 22rng spd6 sz20 · Air×1.5,Stealth×0.3,Light×0.4
• **Liberator** [Limited] 9000hp 50dmg/120 30rng spd6 sz15 · Air×1.3,Stealth✝
• **Seeker** [Limited] 550hp 60dmg/60 18rng spd16 sz2 · Stealth×1
• **Vulture** [Limited] 300hp 80dmg/60 18rng spd12 · Stealth×1
• **Zeppelin** [Limited] 15000hp 250dmg/30 29rng spd6 sz15 · Air✝,Stealth×1
• **Apache** [Rebirth] 900hp 35dmg/120 20rng spd8 sz3 · Air×0.8,Stealth×1,Armored×1.2
### Stealth (6)

• **Phantom** [Mythic] 1200hp 115dmg/40 19rng spd8 sz4 +Armored · Air×0.5,Stealth✝
• **Submarine** [Mythic] 2500hp 120dmg/60 28rng spd9 sz12 · Air✝,Stealth×1
• **Zumwalt** [Mythic] 2000hp 100dmg/60 24rng spd9 sz6 · Stealth×1
• **B2** [Limited] 1000hp 450dmg/20 30rng spd15 sz7 · Air✝,Stealth✝
• **Stealth Helicopter** [Limited] 800hp 80dmg/80 19rng spd13 sz5 · Air×0.7,Stealth×1,Light×1.1
• **Legionnaire** [Unique] 200hp 0dmg/60 19rng spd12

Dev/test units (skip): Animated Unit Rig Test, Animated Unit Test, Artemis, Chonk, Crownguard, Double Mesh, Large Chonk, Providence, Single Mesh, Spiky Rolla, Studio Cube, Test Unit, Test Unit 2, Test Unit 3


## 🎨 Textures
- All sprites are 2.5D flat canvas drawings (see `reg(...)` blocks in game.js)
- To-do: sprites for every unit/building above + map dressing (trees, crystals, arena ring)
- Rarity color palette needs 3 new colors (Limited / Unique / Rebirth)

## 🏗️ Buildings — original game (full stats in `ref/buildings-original.txt`)

### Production (48 — sorted by $/s)
• **Solar Array** [Common, pwr 150] $50/5s cap 2500
• **Golden Wind Turbine** [Legendary, pwr 12,000] $100/10s cap 25000
• **Wind Turbine** [Common, pwr 75] $100/10s cap 25000
• **Iron Mines** [Common, pwr 50] $125/10s cap 10000
• **Hydroponics Facility** [Uncommon, pwr 100] $150/10s cap 12500
• **Advanced Solar Array** [Uncommon, pwr 400] $200/10s cap 10000
• **Golden Advanced Solar Array** [Epic, pwr 5,000] $300/10s cap 100000
• **Steel Factory** [Uncommon, reqPwr 100, pwr 250] $300/10s cap 15000
• **Refinery** [Rare, reqPwr 1,000, pwr 750] $400/10s cap 25000
• **Gas Storage Tank** [Rare, reqPwr 1,000, pwr 750] $650/10s cap 25000
• **Power Plant** [Rare, reqPwr 1,250, pwr 1,000] $650/10s cap 50000
• **Storage Facility** [Epic, reqPwr 15,000, pwr 1,000] $1200/10s cap 75000
• **Radar Complex** [Epic, reqPwr 20,000, pwr 2,000] $1250/10s cap 250000
• **Oil Drill** [Epic, reqPwr 30,000, pwr 2,250] $1350/10s cap 50000
• **Orbital Solar Array** [Legendary, reqPwr 150,000, pwr 15,000] $5000/10s cap 1000000
• **Industrial Drill** [Legendary, reqPwr 150,000, pwr 15,000] $7000/10s cap 1000000
• **Offshore Oil Rig** [Epic, reqPwr 50,000, pwr 5,000] $7000/10s cap 1000000
• **Oceanic Drill** [Legendary, reqPwr 50,000, pwr 5,000] $7500/10s cap 1000000
• **Energy Node** [Mythic, reqPwr 35,000] $9000/10s cap 5000000
• **Research Lab** [Legendary, reqPwr 100,000, pwr 22,500] $9500/10s cap 1000000
• **Monument** [Rebirth, pwr 2,500] $10000/10s cap 1000000
• **Alloy Foundry** [Legendary, reqPwr 80,000, pwr 1,000] $11000/10s cap 2500000
• **Offshore Research Platform** [Legendary, reqPwr 150,000, pwr 15,000] $12000/10s cap 1000000
• **Skyscraper** [Legendary, reqPwr 100,000, pwr 4,000] $14500/10s cap 10000000
• **Particle Accelerator** [Legendary, reqPwr 180,000, pwr 5,000] $17000/10s cap 1500000
• **Materials Research Wing** [Legendary, reqPwr 200,000, pwr 10,000] $25000/10s cap 1500000
• **Semiconductor Plant** [Mythic, reqPwr 250,000, pwr 10,000] $25000/10s cap 5000000
• **Headquarters** [Mythic, reqPwr 35,000] $35000/10s cap 5000000
• **Clocktower** [Rebirth, reqPwr 150,000, pwr 15,000] $40000/10s cap 1500000
• **Luxury Resort** [Mythic, reqPwr 500,000, pwr 35,000] $40000/10s cap 10000000
• **Offshore Crane** [Mythic, reqPwr 250,000, pwr 10,000] $40000/10s cap 2000000
• **Automated Factory** [Mythic, reqPwr 500,000, pwr 11,000] $44000/10s cap 7500000
• **Eiffel Tower** [Rebirth, reqPwr 200,000, pwr 20,000] $45000/10s cap 2000000
• **Science Institute** [Mythic, reqPwr 250,000, pwr 10,000] $50000/10s cap 5000000
• **Statue of Freedom** [Rebirth, reqPwr 250,000, pwr 25,000] $55000/10s cap 5000000
• **Naval Beacon** [Mythic, reqPwr 500,000, pwr 35,000] $57000/10s cap 10000000
• **Data Center** [Mythic, reqPwr 250,000, pwr 10,000] $60000/10s cap 10000000
• **Corporate Campus** [Mythic, reqPwr 250,000, pwr 10,000] $65000/10s cap 3500000
• **Sector Authority** [Limited] $70000/10s cap 50000000
• **Capitol Building** [Rebirth, reqPwr 500,000, pwr 25,000] $80000/10s cap 10000000
• **Executive Residence** [Rebirth, reqPwr 500,000, pwr 25,000] $80000/10s cap 10000000
• **Observation Tower** [Rebirth, reqPwr 750,000, pwr 25,000] $80000/10s cap 3000000
• **Fusion Reactor** [Limited, reqPwr 250,000, pwr 30,000] $88000/10s cap 20000000
• **Fabrication Facility** [Rebirth, reqPwr 750,000, pwr 25,000] $90000/10s cap 5000000
• **Central Office** [Rebirth, reqPwr 1,000,000, pwr 20,000] $100000/10s cap 10000000
• **ProPyramids** [Mythic, reqPwr 450,000, pwr 30,000] $110000/10s cap 50000000
• **Bank** [Legendary] +5% bank
• **Golden Bank** [Mythic] +5% bank

### Units / production buildings (92 — sorted by power requirement)
• **ATV Tent** [Uncommon, pwr 500] ATV /15s×1 · garrison ATV cap4
• **Aegis Security Post** [Limited] Exotrooper /60s×2 r5 · garrison Exotrooper cap2
• **Airship Docks** [Limited] Zeppelin /45s×1 r5 max1 · garrison Zeppelin cap1
• **Armament Forge** [Limited] Assault Suit /40s×1 · garrison Assault Suit cap3
• **Aviation Hub** [Limited] Aerial Assault Carrier /60s×1 r5 max1 · garrison Aerial Assault Carrier cap1
• **Balloon Cart** [Mythic] Party Wagon /10s×1 · garrison Party Wagon cap6
• **Barracks** [Common, pwr 300] Light Infantry /10s×1 · garrison Light Infantry cap2
• **Derelict Factory** [Limited] Precursor /60s×1 · garrison Precursor cap1
• **Global Command Post** [Limited] Colossus /60s×1 max1 · garrison Colossus cap1
• **Hawk's Nest** [Limited] Hawk 2A /30s×2 r3 · garrison Hawk 2A cap4
• **Joint Strike Facility** [Limited] F35 /60s×5 r3 · garrison F35 cap5
• **Liberty Station** [Limited] Liberator /30s×1 max1 · garrison Liberator cap1
• **Marauder Staging Ground** [Limited] Marauder /30s×1 max3 · garrison Marauder cap2
• **Mechanical Hive** [Limited] Drone Carrier /45s×1 max1 · garrison Drone Carrier cap2
• **Missile Foundry** [Limited] ICBM Launcher /30s×1 max1 · garrison ICBM Launcher cap2
• **Monitoring Center** [Limited] Stealth Helicopter /20s×1 max3 · garrison Stealth Helicopter cap3
• **Orbital Outpost** [Limited] Leviathan /60s×1 max1 · garrison Leviathan cap1
• **Pentagon** [Limited] AC-130 /55s×1 · garrison AC-130 cap2
• **Planetary Headquarters** [Limited] Chimera /50s×1 r5 max1 · garrison Chimera cap1
• **Railgun Armory** [Limited] Specialist /30s×2 max2 · garrison Specialist cap4
• **Robotics Lab** [Limited] Prowler /30s×1 r5 max3 · garrison Prowler cap2
• **Scout Watchtower** [Common, pwr 200] Scout /8s×1 · garrison Scout cap4
• **Secret Weapons Facility** [Limited] Railgun Tank /60s×1 · garrison Railgun Tank cap1
• **Sentinel Citadel** [Limited] Nemesis /60s×1 max1 · garrison Nemesis cap1
• **Sentinel Training Center** [Limited] Sentinel Saboteur /30s×1 r5 max2 · garrison Sentinel Saboteur cap2
• **Sentry Station** [Limited] Martyr /40s×1 · garrison Martyr cap2
• **Skyport** [Limited] Hornet /60s×2 r5 · garrison Hornet cap2
• **Stealth Hangar** [Limited] B2 /60s×1 max1 · garrison B2 cap1
• **Strategic Command Center** [Limited] B52 /60s×1 · garrison B52 cap1
• **Synthetic Engineering Site** [Limited] D4-WG /30s×1 r5 max1 · garrison D4-WG cap2
• **Titanic Shipyard** [Limited] Flagship /60s×1 max1 · garrison Flagship cap1
• **Washing Machine** [Mythic] Evade Competitor /10s×1 max1 · garrison Evade Competitor cap1
• **Wing Command** [Limited] F22 /30s×3 r3 · garrison F22 cap6
• **Heavy Infantry Building** [Uncommon, reqPwr 250, pwr 350] Heavy Infantry /12s×1 · garrison Heavy Infantry cap5
• **Sniper's Nest** [Uncommon, reqPwr 500, pwr 750] Sniper /18s×1 · garrison Sniper cap4
• **Special Forces Compound** [Rare, reqPwr 1,000, pwr 1,000] Commando /10s×1 · garrison Commando cap6
• **Hazard Buoy** [Uncommon, reqPwr 2,000, pwr 200] Sentinel Speedboat /20s×1 · garrison Sentinel Speedboat cap3
• **Humvee Plant** [Rare, reqPwr 2,000, pwr 1,750] Humvee /15s×1 · garrison Humvee cap4
• **Ranger Outpost** [Epic, reqPwr 2,000, pwr 1,500] Ranger /20s×1 · garrison Ranger cap3
• **Helipad Outpost** [Rare, reqPwr 2,500, pwr 1,000] Little Bird /25s×1 · garrison Little Bird cap2
• **Munitions Depot** [Rare, reqPwr 2,500, pwr 2,000] Rocket Trooper /15s×1 · garrison Rocket Trooper cap4
• **Patrol Office** [Rare, reqPwr 15,000, pwr 2,000] Gunboat /15s×1 · garrison Gunboat cap3
• **Huey Helipad** [Epic, reqPwr 20,000, pwr 2,000] Huey /20s×1 · garrison Huey cap2
• **Mechanized Armory** [Epic, reqPwr 25,000, pwr 2,000] APC /25s×1 · garrison APC cap3
• **Sentinel Listening Post** [Epic, reqPwr 25,000, pwr 1,000] Mobile Flak /30s×1 · garrison Mobile Flak cap2
• **Air Defense Compound** [Legendary, reqPwr 30,000, pwr 10,000] Anti-Air Vehicle /30s×1 · garrison Anti-Air Vehicle cap2
• **Light Tank Factory** [Epic, reqPwr 30,000, pwr 3,000] Light Tank /30s×1 · garrison Light Tank cap2
• **Artillery Factory** [Legendary, reqPwr 35,000, pwr 10,000] Artillery Truck /30s×1 · garrison Artillery Truck cap2
• **Ocean Terminal** [Epic, reqPwr 35,000, pwr 3,000] Frigate /30s×1 · garrison Frigate cap2
• **Cobra Helipad** [Mythic, reqPwr 50,000, pwr 10,000] Cobra /40s×2 r5 · garrison Cobra cap3
• **Deployment Site** [Legendary, reqPwr 50,000, pwr 10,000] TIGR /30s×1 · garrison TIGR cap2
• **Patrol Station** [Mythic, reqPwr 50,000, pwr 10,000] Enforcer /20s×1 r5 · garrison Enforcer cap3
• **Vehicle Depot** [Legendary, reqPwr 50,000, pwr 10,000] Heavy Tank /30s×1 · garrison Heavy Tank cap2
• **Jet Hangar** [Legendary, reqPwr 60,000, pwr 15,000] F15 /30s×1 · garrison F15 cap2
• **Sentinel Response Center** [Legendary, reqPwr 70,000, pwr 20,000] Viper /30s×1 · garrison Viper cap2
• **Blackhawk Command Post** [Mythic, reqPwr 75,000, pwr 10,000] Blackhawk /60s×1 r5 · garrison Blackhawk cap1
• **Drone Center** [Legendary, reqPwr 75,000, pwr 15,000] Drone /15s×5 r5 · garrison Drone cap20
• **Elevated Helipad** [Mythic, reqPwr 75,000, pwr 10,000] KA-52 /40s×1 r5 · garrison KA-52 cap3
• **Leopard Tankyard** [Mythic, reqPwr 75,000, pwr 1,500] Leopard 2A5 /30s×1 · garrison Leopard 2A5 cap2
• **Valkyrie Nexus** [Mythic, reqPwr 75,000, pwr 10,000] Valkyrie /35s×1 · garrison Valkyrie cap2
• **Hospital** [Epic, reqPwr 80,000, pwr 5,000] Medic /30s×1 · garrison Medic cap2
• **ATC Tower** [Mythic, reqPwr 100,000, pwr 30,000] A10 Warthog /30s×1 · garrison A10 Warthog cap2
• **Apache Helipad** [Rebirth, reqPwr 100,000, pwr 5,000] Apache /20s×1 · garrison Apache cap3
• **Assault Trooper HQ** [Legendary, reqPwr 100,000, pwr 25,000] Assault Trooper /30s×2 r5 · garrison Assault Trooper cap4
• **Conglomerate Skyscraper** [Mythic, reqPwr 100,000] Spectre /45s×1 · garrison Spectre cap3
• **Headhunter Barracks** [Mythic, reqPwr 100,000] Headhunter /30s×1 r3 max1 · garrison Headhunter cap1
• **Heavy Weapons Depot** [Mythic, reqPwr 100,000, pwr 7,000] T14 /30s×1 · garrison T14 cap2
• **Hillside Hangar** [Mythic, reqPwr 100,000, pwr 7,000] SU-47 /25s×1 r5 · garrison SU-47 cap3
• **Mech Gantry** [Mythic, reqPwr 100,000] Mini-Mecha /30s×1 max1 · garrison Mini-Mecha cap2
• **Ordnance Assembly** [Mythic, reqPwr 100,000, pwr 7,000] PZH 2000 /30s×1 max1 · garrison PZH 2000 cap?
• **Reinforced Bunker** [Mythic, reqPwr 100,000, pwr 7,000] Type 99A /30s×1 · garrison Type 99A cap2
• **Sentinel Barracks** [Legendary, reqPwr 100,000, pwr 25,000] Juggernaut /60s×2 r5 · garrison Juggernaut cap2
• **Tank Warehouse** [Mythic, reqPwr 100,000, pwr 7,000] M1 Abrams /30s×1 · garrison M1 Abrams cap2
• **Unstable Testing Facility** [Legendary, reqPwr 100,000, pwr 10,000] Shredder /40s×1 · garrison Shredder cap1
• **Deep Sea Site** [Mythic, reqPwr 125,000, pwr 5,000] Zumwalt /25s×1 max2 · garrison Zumwalt cap2
• **Behehemoth Fortress** [Mythic, reqPwr 150,000, pwr 5,000] Behehemoth /60s×1 · garrison Behehemoth cap1
• **Behemoth Fortress** [Mythic, reqPwr 150,000, pwr 5,000] Behemoth /60s×1 · garrison Behemoth cap1
• **Fleet Command** [Mythic, reqPwr 150,000, pwr 7,500] Carrier /60s×1 max1 · garrison Carrier cap1
• **Naval Shipyard** [Mythic, reqPwr 150,000, pwr 7,500] Battleship /45s×1 max1 · garrison Battleship cap2
• **Officer Quarters** [Mythic, reqPwr 150,000, pwr 10,000] Officer /60s×1 max1 · garrison Officer cap1
• **Sentinel Munitions Assembly** [Legendary, reqPwr 150,000, pwr 25,000] Mantis /45s×1 · garrison Mantis cap2
• **Submarine Cavern** [Mythic, reqPwr 150,000, pwr 7,500] Submarine /60s×1 max1 · garrison Submarine cap1
• **B1 Hangar** [Mythic, reqPwr 200,000, pwr 20,000] B1 Lancer /60s×1 max1 · garrison B1 Lancer cap?
• **Desert Armory** [Mythic, reqPwr 250,000, pwr 30,000] Goblin /60s×2 r3 max2 · garrison Goblin cap2
• **Desert Bastion** [Mythic, reqPwr 250,000, pwr 30,000] Wasp /30s×3 r3 max3 · garrison Wasp cap6
• **Experimental Gantry** [Legendary, reqPwr 250,000, pwr 50,000] Experimental Unit /60s×1 · garrison Experimental Unit cap1
• **Field Tent** [Mythic, reqPwr 250,000, pwr 30,000] UAV /30s×1 · garrison UAV cap1
• **Flamethrower Workshop** [Mythic, reqPwr 250,000, pwr 30,000] Flametrooper /30s×1 r3 · garrison Flametrooper cap2
• **Northern Outpost** [Mythic, reqPwr 250,000, pwr 30,000] Mammoth /45s×1 max1 · garrison Mammoth cap2
• **Phantom Installation** [Mythic, reqPwr 250,000, pwr 10,000] Phantom /60s×1 · garrison Phantom cap2
• **Sentinel Operations Building** [Mythic, reqPwr 250,000, pwr 30,000] Operative /60s×3 r3 · garrison Operative cap3
• **Centurion Support Site** [Unique, reqPwr 1,500,000, pwr 150,000] Centurion /180s×1 max1 · garrison Centurion cap1

### Special
• **Supply Depot** [Rare] $250/10s cap 100000
• **Aircraft Supply Depot** [Epic] $250/10s cap 100000
• **Naval Supply Depot** [Epic] $250/10s cap 100000
• **Advanced Supply Depot** [Mythic] $250/10s cap 100000

Dev/test buildings (skip): Blender, Farm, LARGE Farm, LARGE ProPyramids, Mitosis, Providence Station, Space Elevator, Test Mutation Vehicle Depot, Test Unit Building, Tribute to Honor

### Models (building 3D dumps 1–4/4 — `uploads/Buildings_01_of_04.txt` … `04`)
172 buildings (50+50+50+22), 1884 parts (~11/building: 1841 MeshPart, 42 Part, 1 UnionOperation).
Line format per building: `[Name]` → `ROOT|x,y,z` (world position, ignore) → `bounds|Part|w,h,d|…|a=1|c=1,0,0` (**red = canonical footprint box**) → one line per part: `name|type|sx,sy,sz|px,py,pz|rx,ry,rz|m=meshId|c=r,g,b`.
Scale: footprints median 5.5×5.5 studs, true mesh extents median 6.9×6.1×3.5 (W×D×H).
Caveats: 17 buildings have `bounds` ≪ model (anchor poles, e.g. Global Command Post); same for Missile Turret — its parts were dumped ~1210 studs from ROOT, so `bounds`/`extra` (4×3.8) is the footprint, never the raw extent. Only 1 `extra` (white) box exists (Missile Turret).
Name match vs our 100: **38 exact** (all production ladder steps, Bank, Depot, Barracks, Pentagon, Airship Docks, Submarine Cavern, Centurion Support Site…) + 4 near (Field Hospital ~ Hospital, Tank Factory ~ Light Tank Factory, B-2 Hangar ~ Stealth Hangar, Heavy Barracks ~ Barracks). Most original unit buildings have different names than ours (Vehicle Depot, Drone Center…).
Trait-relevant models (W×D footprint, H height): Logistics Warehouse 3.1×3.2 / Hub 4.5×3.3 / Center 6.3×4.5 (three growing tiers — the Logistics trait pool's buildings); Missile Turret 4×3.8 (the MissileTurret pool's building); Supply Depot 4×5; Bank 5.2×3.5; Centurion Support Site bounds 15×15 but model 25×28 (overhangs); Submarine Cavern model 12.4 tall vs 3.0 bounds (arch above the box).
Size-trait grounding: `bounds` = base size; Tiny ×0.5–0.9 and Titanic ×1.05–1.5 multiply it (see 🧬 Traits mapping table).

## 🧬 Traits — original game (full stats in `ref/traits-original.txt`)

80 traits in 4 roll pools (`TraitsConfig`: Production / Unit / Logistics / MissileTurret + a flat `Test` table). Building models/footprints: 🏗️ Models above (`uploads/Buildings_01..04_of_04.txt`).
Trait rarity ladder: Common → Uncommon → Rare → Epic → Legendary → Mythic → **Unique** (no Limited/Rebirth traits).
Every roll: 10% chance of **2 traits** instead of 1 (never duplicates).

### Roll pools (pool = building model)
| Pool | Our buildings | How it rolls |
|---|---|---|
| Production | `tab:'production'` (Solar … Automated Factory) | rarity first (weights below), then weighted trait inside the rarity |
| Unit | `tab:'units'` (Barracks … Carrier Dock) | same two-step roll, bigger trait list |
| Logistics | `special:'logistics'` (Logistics Warehouse) | ONE flat table (no rarity step): Overtime I .0999 … Employment Agency II .001 |
| MissileTurret | `turret:{}` (Pillbox / SAM / Cannon) | STUB — `Weaponized / Supersonic / Accuracy` ×0.2 each, no definitions in dump 1/4 |
| Test | — | flat debug table, ignore |

Rarity weights (Production + Unit): Unique 0.01 · Mythic 0.04 · Legendary 0.06 · Epic 5 · Rare 13 · Uncommon 27 · Common 54.89.
Inside a rarity the low tier has ×2 weight, the high tier ×1 (e.g. Epic: Overclocked VII ×2, VIII ×1).

### Stat fields → our models
| Original field | Meaning | Maps to |
|---|---|---|
| ResourceProduction | +fraction income (0.2 = +20%) | `BUILD.income` multiplier |
| IncomeSpeed | payout cycle ÷ (1+speed): 0.25→−20% ✓, 2→−2/3 ✓, 3→−3/4 ✓, 4→−4/5 (Arctic desc says −3/4, ≈) | `BUILD.cycle` divisor |
| size | structure draw scale (Tiny ×0.5–0.9, Titanic ×1.05–1.5) applied to the `bounds` footprint from 🏗️ Models | `bScale()` / footprint |
| unit UnitDamage / UnitHealth / UnitSpeed / UnitAttackRate | +fraction on trained units (0.5 = +50%) | `UNITS` dmg/hp/speed/rate at spawn |
| unit UnitSpawnCount | +N units per cycle (Rapid Response +1/+2, Void +3) | `spawnEvery` batch |
| unit UnitSize | ±N troop-cap slots (Supply −1..−3, Gloom −2, Ghostly −1, Void +3) | `unitSize()` |
| bounty money | tier N = N×$1M (all uniques $10M; Elite $10M flat) | kill-reward pool (TBD) |
| Overtime / Cooldown / Range / Employment | collector speed / cooldown / radius / count | NO collector system yet — see goal above |

### Trait families (tiers → rarities C/U/R/E/L/M)
| Family | Effect across tiers I→X | Ladder |
|---|---|---|
| Overclocked ×10 | production +20→500% | C,C,U,U,R,R,E,E,L,M |
| Tiny ×10 | production +10→400% · structure ×0.9→×0.5 · unit dmg +5→52% | same |
| Titanic ×10 | production +20→1400% · structure ×1.05→×1.5 · unit hp +5→125% | same |
| Volatile ×10 | unit dmg +5→80% | same |
| Swift ×10 | unit speed +10→125% | same |
| Overtime I–V | collector speed +10→50% | C,U,R,E,E |
| Cooldown I–V | collector cooldown −20→100% | C,U,R,E,L |
| Range I–III | collection range +2/+4/+6 | R,E,L |
| Employment Agency I–II | +1/+2 collectors | L,M |
| Supply Lines I–III | unit supply −1/−2/−3 | E,L,M |
| Rapid Response I–II | +1/+2 spawned units | E,L |
| Elite (L) | unit dmg +50% · hp +50% | — |
| Uniques ×8 | Sandstorm · Lightning · Arctic · Gloom · Ghostly · Awakened · Unstable · Void (see ref) | — |

Quirks in the dump: Titanic VIII says hp +40% but the value is 0.8 (+80%); Unstable hides ResourceProduction 10 with no mention in its desc; `Reference Trait` (Mythic, all-2s) is dev/test — skip.
Missing from the trait paste: MissileTurret trait definitions (Weaponized / Supersonic / Accuracy), reroll costs/rules, collector system stats. (Missile Turret + Logistics *models* ARE in `uploads/Buildings_02_of_04.txt` / `01` — see 🏗️ Models.)

## 🗺️ Maps
### Reference screenshot (`ref-map-original.png`) — observations
1. Big blue ocean square; one central star layout.
2. 8 plot islands, each = **square grid base fused with an organic natural landmass**
   (irregular blobby coastline, trees on edges, pink flower specks).
3. Straight bridges from the central city across the water into each island, star pattern.
4. Central city = its own island with a **circular arena ring** + inner cross of roads.
5. Point islets: small circular natural islets, **white ring structures** + trees, beside bridges.
6. Small floating pink/white crystals scattered in the ocean between bridges.
7. Player base = bottom-center (SOUTH) plot — matches our layout.

### Map backlog (do later)
- [x] Organic blobby coastlines around each square plot (walk grid + A* follow them)
- [x] Tree clusters on island coasts (pre-rendered decorations)
- [x] Point islet dressing (organic islets + trees beside the bridges)
- [x] City center arena ring
- [x] Plot layout fixed: no more fused/overlapping islands (world 3800², all gaps water-verified by flood fill)
- [x] Troop colors = team colors (bug fixed: bot-trained units now carry their bot's faction; sprites tint by faction)
- [x] Floating water crystals (animated, decorative)
- [x] Water lanes for ships once the naval line lands (v7) — v8 radii: ring 1580, outer loop 3400, radial lanes out to 3460
- [x] **World ×2** (v8) — WORLD 9600², RING 2600, city r 460, outposts r 1150, crystals r 1400; islands 1990px apart, wide ocean for ships

## ✅ Current build status (round 8.3, all green)
- 8 separate organic islands + bridges + city island + point islets; A* pathfinding; air flies over water
- 7 named bot factions (distinct colors, troops tinted per team) fight each other, default-march on the CITY
- Unit types: land / air / armored / stealth (detection: in combat, <70px, or sensor range)
- Spectre (stealth) + Stealth Bay building (elite/premium crates)
- Point capture by faction plurality; owner garrisons; v3 saves auto-migrate
- 65-assertion headless smoke test: `node smoke.js` (**159 assertions in v8**)
- v8: block mode, trees/decor toggle, permanent buildings, 2× world, close-range aggro, troops march on the middle
- v8.3: water yard + water capture points, 8px grid, 3× smaller buildings, hover troop stats, hold-Q pause
- Serve: `python3 -m http.server 8000 --bind 0.0.0.0` from this folder
