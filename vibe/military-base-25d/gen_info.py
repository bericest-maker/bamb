#!/usr/bin/env python3
"""
gen_info.py (v3) — regenerates INFO.md from the live source of the game.

RULE (standing): every time anything in js/ / index.html / style.css / smoke.js changes,
add a CHANGELOG line below, describe any new function/handler/file, and run:

    python3 gen_info.py

Code facts (functions, handlers, globals, ids, css, asserts) are parsed from the source files.
Data tables (units, buildings, presets, points, crates, codes, …) come LIVE from the running
game via `node dump_data.js`, so INFO.md can never drift from the code.
"""
import os, re, json, datetime, subprocess, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
WS = os.path.dirname(HERE)  # the workspace folder that contains military-base-25d/
def rd(p):
    try: return open(p, encoding='utf-8', errors='replace').read()
    except Exception: return ''

HTML = rd(os.path.join(HERE, 'index.html'))
CSS = rd(os.path.join(HERE, 'style.css'))
SMOKE = rd(os.path.join(HERE, 'smoke.js'))
NOTES = rd(os.path.join(HERE, 'NOTES.md'))

# ---------- the game = every <script src> of index.html, in load order ----------
JS_FILES = re.findall(r'<script src="([^"]+)"></script>', HTML)
SRC = {f: rd(os.path.join(HERE, f)).splitlines() for f in JS_FILES}
ALL_JS = '\n'.join('\n'.join(v) for v in SRC.values())

# ---------- live data ----------
# v8.4: dump_data.js prints ~66 KB of JSON — pipes cap at 64 KB here, so it writes to a temp FILE
# (capturing stdout silently truncated the dump and broke every generated table).
DUMP_PATH = os.path.join(tempfile.gettempdir(), 'bmb_dump_data.json')
try:
    with open(DUMP_PATH, 'w', encoding='utf-8') as _dump:
        subprocess.run(['node', os.path.join(HERE, 'dump_data.js')], stdout=_dump,
                       stderr=subprocess.PIPE, text=True, check=True, cwd=HERE)
    DATA = json.loads(open(DUMP_PATH, encoding='utf-8').read())
except Exception as e:
    raise SystemExit(f"dump_data.js failed — is node installed / does the game load? ({e})")

def fmt_money(v):
    v = float(v)
    if v >= 1e6: return f"${v/1e6:.1f}M".replace('.0M', 'M')
    if v >= 1e3: return f"${v/1e3:.1f}k".replace('.0k', 'k')
    return f"${v:g}"
def human(n):
    if n >= 1 << 20: return f"{n/(1<<20):.1f} MB"
    if n >= 1 << 10: return f"{n/(1<<10):.1f} KB"
    return f"{n} B"
esc = lambda s: str(s).replace('|', '\\|')

# ---------- extract per file ----------
FN_RE = [re.compile(r'^function (\w+)\(([^)]*)\)'),
         re.compile(r'^const (\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>'),
         re.compile(r'^const (\w+)\s*=\s*(\w+)\s*=>')]
funcs, nested, handlers, globals_, sections, sprites_src = [], [], [], [], [], {}
file_head = {}
for f, L in SRC.items():
    m = re.match(r'/\*\s*Military Base 2\.5D — [\w.-]+ · (.*?)\s*\*/', L[0] if L else '')
    file_head[f] = m.group(1) if m else ''
    depth, parent = 0, None
    for i, l in enumerate(L):
        ln = i + 1
        s = l.strip()
        mb = re.match(r'// =+ (.+?) =+', s)
        if mb: sections.append((f, ln, mb.group(1)))
        # top-level functions
        for rx in FN_RE:
            m = rx.match(l)
            if m: funcs.append((f, ln, m.group(1), m.group(2).strip())); break
        # nested helpers (indented arrow consts)
        m = re.match(r'\s+const (\w+)\s*=\s*\(([^)]*)\)\s*=>', l)
        if m and depth > 0:
            nested.append((f, ln, m.group(1), m.group(2).strip(), parent or '(top-level { } block)'))
        # parent tracking by brace depth (good enough for this code style)
        if depth == 0:
            pm = re.match(r'(?:function (\w+)|const (\w+)\s*=|(\{))', l)
            parent = (pm.group(1) or pm.group(2) or '(top-level { } block)') if pm else None
            if parent == 'Admin': parent = 'Admin'
        depth += l.count('{') - l.count('}')
        if depth < 0: depth = 0
        # event bindings
        m = re.match(r"\$\('([^']+)'\)\.(onclick)\s*=", s) or re.match(r"\$\('([^']+)'\)\.addEventListener\('(\w+)'", s)
        if m: handlers.append((f, ln, m.group(1), m.group(2)))
        else:
            m = re.match(r"(window|document|cv|mini)\.addEventListener\('(\w+)'", s)
            if m: handlers.append((f, ln, m.group(1), m.group(2)))
            else:
                m = re.match(r"document\.querySelectorAll\('([^']+)'\)\.forEach", s)
                if m: handlers.append((f, ln, m.group(1), 'forEach'))
                elif s.startswith('bindToggle('):
                    for t in re.findall(r"bindToggle\('(#\w+)','(\w+)'\)", s):
                        handlers.append((f, ln, t[0], f"toggle → S.settings.{t[1]}"))
                else:
                    m = re.search(r"window\.addEventListener\('(\w+)'", s)
                    if m: handlers.append((f, ln, 'window', m.group(1)))
        # globals
        m = re.match(r'(const|let) (\w+)\s*=\s*(.*)', l)
        if m and not any(rx.match(l) for rx in FN_RE):
            val = m.group(3).strip()
            if len(val) > 80: val = val[:77] + '…'
            globals_.append((f, ln, m.group(1), m.group(2), esc(val)))
        # sprite registrations
        m = re.match(r"reg\('(\w+)',\s*(\d+),\s*(\d+),", s)
        if m: sprites_src[m.group(1)] = (f, ln)

# Admin methods
admin_methods = []
for f, L in SRC.items():
    st = next((i for i, l in enumerate(L) if l.startswith('const Admin={')), None)
    if st is None: continue
    for j in range(st + 1, len(L)):
        if L[j].startswith('};'): break
        m = re.match(r'  (\w+)\(([^)]*)\)\s*\{', L[j])
        if m: admin_methods.append((f, j + 1, m.group(1), m.group(2)))
inline_onclick = re.findall(r'<button[^>]*onclick="([^"]+)"[^>]*>(.*?)</button>', HTML)

def block_in(pat_start, pat_end):
    for f, L in SRC.items():
        for i, l in enumerate(L):
            if re.search(pat_start, l):
                for k in range(i + 1, len(L)):
                    if re.search(pat_end, L[k]): return f, '\n'.join(L[i:k + 1])
    return '', ''
_, state_src = block_in(r'^function defaultState\(\)\{', r'^\}')
_, sfx_src = block_in(r'^function sfx\(name\)\{', r'^\}')
sfx_names = [(m.group(1), esc(m.group(2).replace('break;', '').strip())) for m in re.finditer(r"case '(\w+)':\s*(.*)", sfx_src)]
_, bmb = block_in(r'^\s*window\.__BMB=\{', r'^\s*\};')
bmb_keys = sorted(set(re.findall(r'\b([A-Za-z_]\w*)\b(?=\s*[,}\n(])', re.sub(r'get (\w+)\(\)\{[^}]*\}', r'\1,', bmb))) - {'window', '__BMB', 'return', 'get'})

# ---------- hand-written function descriptions ----------
D = {
 # ---- v8.5 ----
 'rarRank':'how good a rarity is (higher = better) — the sort key for every auto-sorted list',
 'bestFirst':'sort an id list best-rarity-first, ties by name (shop / admin lists)',
 'placeSpots':'SHIFT-DRAG: every footprint-sized spot in the rectangle from cell a to cell b, each with its stack level',
 'placeLeft':'how many of the held item you can still put down (the one in your hand + the rest of the stack)',
 'refillHand':'hand the next item of the stack to the cursor — false = that was the last one',
 'keepPlacing':'v8.5: after placing one, keep the item in hand so you can build a row without reopening the backpack',
 'placeRun':'v8.5: place every footprint of a SHIFT-drag when the mouse is released',
 'nearestLand':'closest walkable ground to a point — a land unit that ends up in the water is put back on the shore',
 'bossSlam':'v8.5: the worm\u2019s special attack — every few seconds it slams every enemy unit and building around it',
 # ---- v8.4 ----
 'stackTopAt':'how high the pile under a footprint is — the level a new building lands on (0 = the ground)',
 'invFind':'the backpack entry (stack) for one kind+type', 'invCount':'how many of an item you hold',
 'takeItem':'take n out of a backpack stack (removes the card when the last one goes) → how many you really got',
 'mergeInventory':'fold an old per-item backpack into stacks (one card per kind+type with an n)',
 'askOpenCount':'v8.4 "open how many?" chooser (1 / 5 / 10 / ALL) before a bulk crate opening',
 'buyCrates':'robux shop: pay cash for n crates, they stack in the backpack',
 # ---- v8.3 ----
 'inYard':'is this world point inside your WATER YARD?',
 'startPlacing':'hand a building to the cursor; water items also pan the camera to your water yard',
 'unitAt':'the unit under a world point, via the spatial hash (O(cells) not O(units)) — powers the hover card',
 'unitTipHTML':'hover card for a troop: hp, damage, DPS, range, speed, troop-cap size, armour, detect, splash, aura, bounty, modifiers, current order',
 'showUnitTip':'fill #tip with a troop card and place it by the cursor',
 'hoverUnit':'throttled hover inspect: re-tests ~12\u00d7/s, rebuilds the card ~2.5\u00d7/s (free in a 1000-unit battle)',
 # ---- v8 ----
 'defaultSettings':'⚙ SETTINGS defaults: gfx High, units/blds Normal, decor on, enemy grids off, buildings permanent',
 'aggroReach':'how far a unit looks for a fight: holders get range+AGGRO.hold, marching units min(range+push, AGGRO.march)',
 'indestructible':'true while ⚙ INDESTRUCTIBLE BUILDINGS is on → buildings take no damage at all',
 'blockUnits':'is UNIT GRAPHICS = Blocks? (read fresh every frame — the setting can be flipped live)',
 'blockBlds':'is BUILDING GRAPHICS = Blocks?',
 'drawBlockUnit':'BLOCK MODE troop: one plain faction-coloured rectangle, EXACTLY its sprite\'s w×h, feet on the ground — no sprite',
 'clampCam':'camera limits: keeps you over the island, or — once the view covers the world (MINZ) — locks to the map centre',
 'drawBlockBuilding':'BLOCK MODE building: its footprint rectangle (w×h cells) filled with the owner\'s colour — nothing else',
 # ---- v6 ----
 'plotRot':'plot rotation from its ring angle: local up (−y) faces the city; player (south) = 0',
 'plotRotOf':'rotation of a plot by owner ("p" = 0)', 'plotToWorld':'plot-local px (grid top-left origin) → world, honouring rotation',
 'worldToPlot':'world → plot-local px (inverse of plotToWorld) — used for clicks on rotated bot plots',
 'fitsAt':'does a building fit at (gx,gy) on an owner\'s plot (inside 52×36 + no overlap with that owner)',
 'findFreeSpot':'nearest free spot (square spiral) — bot presets slide here when the real footprint collides',
 'plotRectPath':'path a plot-local rectangle in world space (rotated pads, grids, outlines)',
 # ---- v5 ----
 'unitScale':'draw scale by troop size (size 1 ×1.15 … size 5 ×1.75) — bigger units look bigger',
 'bScale':'building draw scale = BLD_K (1.3) for every model; the footprint is sized from the model instead',
 'sprUsesTime':'true if a sprite draw fn uses its time arg → animated (gets SPR_FRAMES cached frames)',
 'sprCanvas':'sprite cache: paints (type,side,faction,frame,res) once into an offscreen canvas; applies unit-only lighting; cleared above 1200 entries',
 'drawSpr':'blit a cached sprite with its ground anchor at (x,y) — replaces per-frame path drawing (perf)',
 'unitPolish':'v8.9: cached sprite-only top sheen + lower shade, clipped to unit pixels; buildings and Blocks stay unchanged',
 'buildUnitGrid':'spatial hash of live units (160px cells + per-cell faction bitmask), rebuilt once per update',
 'forNear':'visit units in grid cells overlapping radius r (full scan outside update → exact in tests)',
 'forNearFoes':'like forNear but skips cells holding only faction fac (friendly crowds cost nothing)',
 'removeUnits':'flag matching units dead and drop them (cached targets see .dead instantly)',
 'removeBuildings':'flag matching buildings dead and drop them',
 'compactUnits':'drop units killed during this update in one pass (deferred killUnit)',
 'botThreat':'nearest foreign unit within 700 of a bot base, shared by all its defenders (≤4×/s)',
 'astarShared':'A* result shared by units in the same cell going to the same target cell for 1.5s',
 # 01 helpers
 'clamp':'clamp v into [a,b]', 'clamp01':'clamp into [0,1]', 'dist':'euclidean distance between two {x,y}',
 'rnd':'random float in [a,b)', 'pick':'random element of an array', 'fmt':'number → 1.2M / 12.3k', 'fmtTime':'seconds → m:ss', 'lerp':'linear interpolation',
 # 02 world
 'ringPos':'angle (deg, 0=east, 90=south) + radius → world point around MAP_C',
 'plotTL':'angle → top-left of a 52×36-cell plot (unrotated box) centred on the ring (RING px from the city)',
 'plotAt':'player grid (gx,gy) → world px', 'plotOrigin':'owner (\'p\' | bot index) → plot top-left',
 'bPos':'recompute + cache a building\'s world anchor (bottom-centre) from plot origin + gx/gy',
 'botCenter':'world centre of bot i\'s plot', 'plotCentre':'world centre of YOUR plot (replaces the old buggy PLOT.w*50)',
 # 02b units
 'unitDef':'unit → its data row (UNITS[type] or BOSS)', 'unitCls':'unit → class list [light|armored|air|stealth]',
 'isAir':'flies? (class air OR fly:true like the Drone)', 'isStealth':'has the stealth class', 'unitArmor':'flat armor of a unit',
 'unitDetect':'stealth-sensor radius of a unit (0 = none)', 'unitSize':'troop-cap slots a unit uses (boss 0)',
 'modVs':'attacker data × target classes → damage multiplier (any ×0 class → 0, else best multiplier, default 1)',
 'modFor':'unit-vs-unit damage multiplier (plain stubs like {side} → ×1)', 'canHurt':'attacker has damage AND a non-zero multiplier vs target',
 'unitTop':'sprite height above the feet (HP bar / tracer aim)',
 # 03 state
 'nid':'next unique id', 'defaultState':'fresh v4 state: $500, 7 bots with presets, neutral points, achievements {}, bank timer, shop sub-tab',
 'defaultStats':'fresh stats {kills,bosses,captures,tut,cratesOpened,placed}',
 # 04 factions
 'facC':'faction index → colour', 'hexA':'#rrggbb + alpha → rgba()', 'facN':'faction index → name', 'shade':'multiply a hex colour (f<1 darker)',
 'unitPal':'unit/owner → faction palette {body,dark,accent,metal,skin} (tints troops AND building flags/signboards)',
 # 05 map
 'plotCenter':'plot {x,y} → centre', 'distSeg':'point-to-segment distance', 'wob':'big-island coastline wobble ±22px', 'wobS':'small wobble ±10px',
 'sqExit':'how far a ray at θ travels before leaving a hw×hh rectangle',
 'plotRadius':'plot island radius at θ = rectangle(grid + PLOT_MX/PLOT_MY forest margin) + 10 + wob',
 'lobeRadius':'lobe island radius at θ (≈230 + wob) — the organic bump facing the city, like the original',
 'cityRadius':'octagon city radius at θ (flat sides, r 300) + tiny wobble', 'isletRadius':'outpost islet radius at θ (rounded square)',
 'walkableAt':'THE land test: plot / lobe / city / islet shapes or within BRIDGE_W of any bridge',
 'cellOf':'world px → walk-grid cell', 'astar':'A* on the walk grid (8-dir, no corner cutting, 14000-iter cap) → waypoints | null',
 'flowStep':'next step on the precomputed CITY flow field (cheap highway for land units)',
 # 06 save
 'save':'write state to localStorage "bmb25" (player units incl. garrison home)', 'load':'read save; v1/v2 → fresh map keeping progression; v3 → v4 (same shape); v4 → as-is',
 # 07 audio
 'initAudio':'lazy WebAudio on first gesture', 'tone':'one oscillator note (optional slide)', 'noise':'filtered noise burst', 'sfx':'named one-shots (see Sound effects)', 'musicTick':'soft 4-chord chiptune loop',
 # 08 sprites
 'reg':'register a sprite {w,h,draw(g,t,u)} into SPR', 'O':'shared dark outline style', 'drawCrateIcon':'crate box + rarity colour + label',
 'ship':'TEMPLATE → ship sprite (wake, hull, waterline, superstructure, mast, turrets, flight deck, VLS, missile rack)',
 'infantry':'TEMPLATE → soldier sprite (helmet type, gun length, scope, rocket tube, medic cross, bulk)',
 'vehicle':'TEMPLATE → ground vehicle (tracks/wheels, hull, turret, twin gun, flak, rocket rack, artillery barrel, radar dish, rail glow)',
 'heliT':'TEMPLATE → helicopter (size, door gunner, guns, twin tail, angular stealth body)',
 'plane':'TEMPLATE → aircraft (length, wings, props, twin tail, guns, flying-wing B-2)',
 'bPal':'building owner → faction palette', 'flagOn':'faction flag pole on a building', 'signboard':'small sign with a mini picture of the unit a building trains',
 # 09 camera
 'resize':'canvas = window × DPR', 'viewBounds':'visible world rect (+80px)', 's2w':'screen → world (incl. 0.72 vertical squash)', 'depth':'pseudo-2.5D scale by y',
 # 10 fx
 'addFloat':'floating text', 'addBoom':'expanding ring', 'addParts':'particle burst', 'tracer':'bullet tracer line',
 # 11 economy
 'isMine':'building belongs to the player', 'totalPower':'player power = buildings + units', 'botPower':'power of bot i (leaderboard)',
 'countMine':'count your buildings matching a predicate', 'incomeBonus':'income bonus pieces % {rebirth, outposts, city, logistics} (HUD tooltip)',
 'incomeRate':'$/s = Σ income (½ if damaged) × (1+rebirth%) × (1+(city+outposts)%) × (1+logistics%)',
 'unitCap':'troop cap = min(100, 10 + 10·Supply Depots)', 'playerUnits':'units with side "p"',
 'capUsed':'troop slots used = Σ unit size of your non-garrison units', 'bankTick':'every 60s: each Bank (max 3) pays min(5% cash, $50k)',
 'canPlaceAt':'slot free on YOUR plot (only your buildings block — fixed: bot buildings used to block)',
 'buyBlock':'shop rule check → reason string or null (power req, rebirth req, bank max 3)',
 'ghostSlot':'mouse → player grid slot for the ghost', 'placeBuilding':'place + fx + sfx', 'placeBuildingRaw':'place without fx (bots/admin); counts stats.placed for you',
 'botBuildings':'buildings of bot i', 'botUnits':'units of bot i', 'botTier':'tier of bot i\'s preset', 'botCap':'bot unit cap = 8 + 2·tier',
 'setBotPreset':'(re)build a bot base from a preset; clears its units', 'removeBuildingRefund':'sell: 50% refund',
 'weightedPick':'weighted random from [[id,w],…]', 'featuredPremium':'daily-rotating featured item from WEEKLY (fixed WEEK.length crash)',
 'rollCrate':'roll a crate (premium: 15% featured, pity 80)', 'giveItem':'add n (default 1) of an item to the backpack, merging into the stack that is already there', 'openCrateModal':'open n crates at once: suspense, then the rarest win on display + a list of everything you got',
 'checkAchievements':'unlock + pay any ACHIEVEMENTS whose progress reached its goal (runs every 0.5s)',
 # 12 units
 'garrisonCount':'units with home===point', 'pointFaction':'point → faction (0 you, 1-7 bots, -1 neutral)',
 'spawnGarrison':'spawn garrison troops (rifle; city also tanks) for the owner', 'mkUnit':'create a unit (stealth flag from its classes)',
 'spawnWave':'wave from a random surviving bot, mixed troops from wavePool, ordered to the CITY', 'wavePool':'unit types allowed at wave w (WAVE_POOL unlocks)',
 'spawnBoss':'v8.5: MECHA WORM — it surfaces in the CITY (the middle) with the admin\u2019s custom HP if one is set, then slams everything in reach', 'checkCaptures':'strict faction plurality inside a pad captures it (6s cooldown)',
 'bFaction':'building → faction index', 'targetFor':'THE unit brain: ground troops skip water-only RIG points; bots march CITY / hold base; player orders and land-point selection → enemy buildings → plot centre',
 'refreshDetectors':'4×/s rebuild each faction\'s sensor list (detect units + Radar Stations) + stealth reveal flags',
 'factionSees':'is a point inside any sensor of faction f', 'canSee':'stealth visible if fighting, <70px, own detect, or any friendly sensor/radar',
 'findEnemyOf':'nearest enemy the unit can SEE and HURT (×0 targets skipped)', 'splashAt':'50% damage to all other-faction units in radius',
 'medicTick':'medic heals the most-injured ally in range', 'updateUnit':'per-unit tick: medic heal, shoot (mods, splash), attack buildings (bld ×), move',
 'stepUnit':'movement: air straight; cityGoal flow field; else A*', 'd2':'tracer aim height (fixed: used to depend on unit NAME length)',
 'moveToward':'step toward a point', 'damageUnit':'dmg × class mod − armor (min 1); ×0 = no damage; god mode protects you',
 'killUnit':'death fx + rewards to player killers', 'damageBuilding':'HP/flash/destroy + rewards; god mode protects only YOUR buildings (fixed)',
 'updateTurrets':'Pillbox / SAM Site / Fortress Cannon: target visible + hurtable enemies in range, splash for the cannon',
 'hospitalTick':'Field Hospitals heal their faction\'s units in range every second',
 # 13 render
 'render':'camera → ground → y-sorted buildings/units/flags → fx → minimap', 'drawUnit':'shadow + faction sprite + stealth alpha + HP bar',
 'drawBoss':'worm body + head', 'drawPointFlag':'owner flag + label', 'islandPoly':'closed polygon from a radius function (72 samples)',
 'drawTree':'round tree or pine (t.k)', 'landShape':'sand rim + grass fill from a radius function', 'drawBridges':'plank bridges: shadow, beams, deck, planks',
 'drawCrystal':'floating glowing crystal in the water (decor, like the original)', 'inView':'point+radius inside the view rect',
 'drawGround':'ocean + glints → bridges → islets → plots + lobes → octagon city + roads + plaza → crystals → patches → rocks → trees → plot grid/labels → pads',
 'miniPoly':'minimap island polygon', 'drawMini':'square minimap: ocean, bridges, island shapes, plot squares (you gold / bots faction / down red), crystals, points, units, camera',
 # 14 ui
 'toast':'temporary message bubble', 'openPanel':'show one panel (renders it), hide the rest', 'closePanel':'hide a panel',
 'rarCol':'rarity → colour', 'rarBadge':'rarity badge HTML (inline colours)', 'renderShop':'tabs + UNITS sub-tabs (LIGHT/ARMORED/AIR/STEALTH) + cards with lock reasons + hover tooltips',
 'modTxt':'damage modifiers → coloured HTML', 'tipHTML':'full stat tooltip for a building (+ its unit\'s stats/mods, turret, detect, heal…)',
 'showTip':'show the #tip tooltip', 'moveTip':'keep the tooltip next to the cursor, inside the window', 'hideTip':'hide the tooltip',
 'renderAchievements':'🏆 panel: progress bars + rewards', 'renderLeaderboard':'📊 panel: 8 factions ranked by power, flags held',
 'drawItemIcon':'building icon for cards', 'renderBackpack':'backpack cards — identical items STACK (xN badge); place one building or open 1/5/10/ALL crates', 'drawCrateIconMini':'small crate icon',
 'renderRewards':'REWARDS claim list', 'renderRobux':'premium crate offers (in-game cash)', 'renderSettings':'settings toggles',
 'renderRebirth':'rebirth preview', 'doRebirth':'rebirth: reset base except golden + Monument, points neutral, cash 500', 'bindToggle':'wire a settings toggle',
 # ---- v7: money capacity, garrisons, naval line ----
 'isSea':'unit is a SHIP (UNITS.sea) — it sails the water grid, not the land grid',
 'unitRadius':'footprint radius of a unit (9 + 5·size) — spawn spacing + crowd separation',
 'killReward':'BOUNTY for a kill = base reward × wave HP buff × tier (1 + power/40000, capped at ×3)',
 'isSeaAt':'is this world point open water? (SEA grid)', 'seaCell':'world point → SEA grid index',
 'nearestSea':'closest water cell to a point (spawning ships / getting un-beached)',
 'coastGoal':'where a ship should stand to shell a LAND target (cached per target cell)',
 'seaAstar':'A* on the SEA grid (same code as land A*, different grid)',
 'seaAstarShared':'sea A* with a 2s per-cell-pair cache (perf, like astarShared)',
 'stepSeaUnit':'ship movement: straight to the water if beached, then sea A* / coastal approach',
 'storedTotal':'cash sitting inside all your buildings (what the Bank pays interest on)',
 'storedCap':'total money capacity of all your buildings',
 'collectStored':'empty one building’s safe into your wallet (click a building to do this)',
 'collectAllStored':'empty every safe (admin button)',
 'spawnSpotFor':'pick a spawn point for a trained unit: water for ships, else the closest spot where its FOOTPRINT fits',
 'wdCapOf':'wave-defense MaxCap of a unit building (cheap buildings field a squad, the top-end one vehicle)',
 'wdCount':'defenders currently fielded by one building', 'wdSlots':'troop slots used by your whole garrison',
 'standDownDefenders':'dismiss the garrison when the raid is over',
 'updateWaveDefense':'while waveAlert > 0 every unit building trains FREE defenders up to its MaxCap',
 'productionTick':'per-building tick: earn → store (capped) → pay out every cycle; train units; garrison upkeep',
 'structurePower':'StructurePower = Σ power of YOUR buildings', 'armyPower':'Σ power of YOUR units',
 'powerSplit':'{structure, army, total} — shown in the leaderboard',
 'incomeMult':'the combined income multiplier (rebirth × outposts+city × logistics)',
 'updateWaveAlert':'keeps the "raid incoming" timer alive while a wave is fresh or hostiles are near your plot',
 'waveAlert':'seconds of raid alert left (>0 → garrisons muster)',
 'waveTick':'wave + boss countdown (skipped when the admin freezes them)',
 'pointRespawnTick':'capture-point garrison upkeep (one replacement troop per timer)',
 'botRaidTick':'bots dispatch idle troops to march on the CITY',
 'botRebuildTick':'destroyed bot bases rebuild after 25s',
 'fxTick':'advance tracers / floats / booms / particles one frame',
 'auraFor':'support aura multiplier of an attacker (Officer: ×1.25 to allies in 280px)',
 'drawSeaLanes':'the water lanes: dashed route + bobbing buoys (drawn under the islands)',
 'renderPatchNotes':'the 📜 PATCHES panel',
 # 15/16/17/19
 'buildingAt':'world point → building under it (a stack: the floor you aimed at, lift-aware)', 'cancelPlacement':'drop placement ghost (the item goes back into its backpack stack)', 'showTut':'first-launch tutorial',
 'frame':'RAF wrapper → update + render', 'update':'THE tick: camera, income, production (cap by size), bot raids, detectors, turrets, hospitals, banks, bot rebuilds, units, garrisons, waves/boss, captures, fx, power+achievements, HUD, autosave',
 'init':'load → migrate (fill new fields, drop unknown types, fold the backpack into stacks, stack buildings that now overlap instead of binning them) → bot bases → restore units → garrisons → start',
}
ADMIN_D = {
 'qty':'admin QTY box value clamped to 1…1000', 'owner':'admin FOR select: "p" (you) or bot index',
 'filter':'admin search: hide building/unit rows not matching the text, update n/total counters',
 'toggle':'open/close the admin drawer (F1 or `)', 'renderLists':'populate building + unit lists, bind toggles', 'renderToggles':'highlight speed/god/freeze/noRespawn',
 'renderBots':'bot preset rows + SET ALL', 'cash':'grant cash', 'giveBuild':'n copies → backpack, or auto-place up to n on free plot space', 'spawnUnit':'spawn n (1…1000) units for you or a bot in a spiral block on walkable ground',
 'boss':'summon | hp1 | more | kill', 'wave':'now | horde (×3) | reset timers', 'points':'take all | release to neutral', 'setBot':'preset for one bot',
 'go':'camera teleport — coords derived from the map (base/city/n/ne/e/se/sw/w/nw/boss)', 'tickStats':'live debug readout',
 'setBotAll':'one preset for all bots', 'cashCustom':'cash from #aCash (K/M/B)', 'giveAllBuildings':'one of every building → backpack',
 'crate':'give n crates (they stack)', 'pile':'v8.4: stack n of a building on top of each other on one spot (unlimited height)',
 'bossHp':'v8.5: custom boss HP (K/M/B allowed) — sets the live worm\u2019s HP and every boss that spawns later; empty = default', 'rebirth':'add rebirths or force one', 'claimRewards':'claim all ready rewards', 'exportSave':'state JSON → #aSave',
 'collectAll':'v7: empty every money building’s safe into your wallet',
 'garrison':'v7: muster the wave-defense garrison / stand it down', 'raid':'v7: raise the raid alert (60s)',
 'importSave':'#aSave JSON (v1–v4) → save → reload', 'wipe':'delete save → reload',
}
NESTED_D = {
 'sr':'seeded pseudo-random 0..1 (Park–Miller) — identical coastlines / trees every load', 'hPush':'A* heap push', 'hPop':'A* heap pop',
 'col':'random grass-patch tint', 'nearBridge':'is a point on/near a bridge (keeps trees off bridges)', 'putTree':'push a tree unless it would block a bridge',
 'add':'push a sensor {x,y,r} for a faction', 'hit':'turret damage to one target (mods, armor, god mode, kill)', 'row':'append a tooltip grid row',
}
HANDLER_D = {
 ".a-q|forEach":'admin QTY preset buttons (1/10/100/1K) → #aQty',
 "#codeBox|keydown":'Enter → redeem code once per save', "#btnWipe|onclick":'HARD RESET', "#btnShop|onclick":'open SHOP',
 "#btnHome|onclick":'cancel placement, close panels, pan to your plot centre', ".rail-btn|forEach":'left rail → openPanel(data-panel)',
 "[data-close]|forEach":'✕ closes its panel', "#shopTabs button|forEach":'shop tab → S.shopTab', "#btnAttack|onclick":'ATTACK: non-garrison units march the CITY',
 "mini|mousedown":'minimap click → pan (uses the real rendered size)', "window|keydown":'keys map, Esc, F1/` admin', "window|keyup":'release key',
 "cv|contextmenu":'no browser menu', "cv|mousedown":'RMB cancel/assault/deselect (v8: selling is blocked while buildings are permanent) · LMB place or drag',
 "#setTrees|toggle":'v8: TREES & DECOR — trees, rocks, grass patches, crystals', "#setBotGrid|toggle":'v8: ENEMY BASE GRIDS — dashed pad + name label over each bot base',
 "#setIndestruct|toggle":'v8: INDESTRUCTIBLE BUILDINGS — no damage, no selling', "#setUnits|toggle":'v8: UNIT GRAPHICS Normal|Potato', "#setBlds|toggle":'v8: BUILDING GRAPHICS Normal|Potato',"cv|mousemove":'mouse pos + drag band',
 "window|mouseup":'finish drag select / click / Ctrl-move', "#tutNext|onclick":'advance tutorial', "cv|wheel":'zoom around cursor',
 "document|pointerdown":'unlock WebAudio', "window|beforeunload":'save on close', "#btnAdmin|onclick":'open admin', "#aClose|onclick":'close admin',
 "window|resize":'resize canvas (also recomputes MINZ — the zoom that fits the whole map)',
 "window|blur":'v8.3: releases Q (and every held key) when the tab loses focus', "#btnCrateDone|onclick":'close crate reveal', "#btnRebirthYes|onclick":'confirm rebirth',
 "#aSpeed .abtn|forEach":'admin time scale',
 "#stStoredRow|n/a":'v7 HUD: cash stored inside your buildings (click a building to empty it)',
 "#p-patch|rail":'v7: 📜 PATCHES panel — what changed in every build', "#aGod|onclick":'GOD MODE: your units + YOUR buildings take no damage',
 "#aFreeze|onclick":'freeze wave/boss timers', "#aNoResp|onclick":'stop garrison respawn',
}
FILE_D = {
 'military-base-25d/index.html':'page shell: canvas + HUD, rail (🏆 📊 added), admin drawer, panels, #tip tooltip, and the ordered <script> list of js/*.js',
 'military-base-25d/style.css':'dark-slate theme (+ v4: sub-tabs, tooltip, achievements, leaderboard)',
 'military-base-25d/smoke.js':'headless Node test (~115 checks): map, combat classes, turrets, bank, achievements, save migration…',
 'military-base-25d/test-stubs.js':'shared headless loader: DOM/canvas/localStorage stubs + loads every script of index.html (used by smoke.js + dump_data.js)',
 'military-base-25d/dump_data.js':'prints the LIVE data tables as JSON for gen_info.py',
 'military-base-25d/NOTES.md':'goals/roadmap (what to do NEXT) + original-game index',
 'military-base-25d/INFO.md':'THIS file — what the game IS (generated, do not hand-edit)',
 'military-base-25d/gen_info.py':'regenerates INFO.md (hand-written descriptions, CHANGELOG, KNOWN_ISSUES live here)',
 'military-base-25d/ref/units-original.txt':'original game\'s units (raw upload)', 'military-base-25d/ref/buildings-original.txt':'original game\'s buildings (raw upload)',
 'military-base-25d/ref/traits-original.txt':'original game\'s building traits + TraitsConfig roll pools (raw user paste)',
 'uploads/Buildings_01_of_04.txt':'original game building 3D-model dump, part 1/4 (50 buildings: parts, meshes, bounds footprints)',
 'uploads/Buildings_02_of_04.txt':'original game building 3D-model dump, part 2/4 (50 buildings)',
 'uploads/Buildings_03_of_04.txt':'original game building 3D-model dump, part 3/4 (50 buildings)',
 'uploads/Buildings_04_of_04.txt':'original game building 3D-model dump, part 4/4 (22 buildings)',
 'military-base-25d/ref-map-original.png':'screenshot of the original map — the v4 map copies this layout',
 'notes/build-a-military-base-research.md':'web research on the original Roblox game',
 'uploads/Vehicle Depot Rarity=Legendary,Buil.txt':'user upload — copy of ref/units-original.txt',
 'uploads/Vehicle Depot Rarity=Legendary,Buil2.txt':'user upload — copy of ref/buildings-original.txt',
 'uploads/image-1.png':'user upload — screenshot of an EARLIER build of this remake',
 'uploads/Screenshot 2026-09-27 173841.png':'user upload — reference screenshot of the ORIGINAL game UI (mostly blank capture: shop/home pills, left rail, ATTACK button, quests panel)',
}
for f in JS_FILES:
    FILE_D.setdefault('military-base-25d/' + f, file_head.get(f, '') or '⚠️ add a header comment')
for i in range(1, 6):
    for ext in ('png', 'jpg'):
        FILE_D[f'image-search/roblox-build-a-military-base-game-ui-scr-{i}.{ext}'] = 'reference screenshot of the original game UI'

# ---------- CHANGELOG (newest first) — ⚠️ one line per change ----------
CHANGELOG = [
 ('2026-09-28', '**DOCS: TRAIT GOALS + BUILDING MODELS.** No gameplay change. Saved the user\'s 80-trait paste + decompiled `TraitsConfig` as `ref/traits-original.txt` and added a roadmap spec: NOTES.md → new GOALS subsection `Traits & reroll` (pools per building model, rarity weights, 10% double trait, stat mapping, collector gap, reroll design, UI, save) + a `🧬 Traits` index (Production/Unit/Logistics/MissileTurret pools, field→model mapping table, family ladders). Pulled the user\'s `uploads/Buildings_01..04_of_04.txt` (172 original buildings as 3D-model dumps, 1884 parts) and indexed them in NOTES.md → `🏗️ Models`: bounds = canonical footprint (median 5.5×5.5 studs), 38/100 exact name matches with our roster, Logistics 3-tier + Missile Turret footprints for the trait pools, Tiny/Titanic scale the bounds. Missing from the trait paste: MissileTurret trait defs, reroll costs/rules, collector stats.'),
 ('2026-09-27', '**v8.10: BOSS SPAWN CENTER.** Bosses now spawn at the exact world/map centre (`MAP_C`, the CITY center) instead of a random offset within the city. This applies to the automatic timer and ADMIN summon; the worm still attacks after surfacing. Smoke verifies the default and custom-HP spawns are exact.'),
 ('2026-09-27', '**v8.9: UNIT VISUAL POLISH.** The full roster gets a cohesive sprite pass: faction-colored infantry gain fitted vests, kit and clearer rifles; tanks and support vehicles get layered hulls, tracks, wheels, hatches and weapons; helicopters and aircraft gain cockpit glass, panel lines and rotor/engine detail; ships gain portholes, deck edges and sharper turrets. A cached, alpha-clipped sheen/shadow pass adds depth to unit sprites only. Sprite dimensions and gameplay are unchanged; buildings and exact-size Blocks mode are untouched. Smoke draws every registered unit through the cache.'),
 ('2026-09-27', '**v8.8: LIMITED CYAN.** The user-facing LIMITED rarity color is now bright cyan (`#00e5ff`) across badges, card borders, tooltips and admin lists; it was incorrectly pink. MYTHIC remains red, the Limited category and item classifications are unchanged, and Limited still sorts above Mythic. Smoke verifies the label/color and rejects both pink and red.'),
 ('2026-09-27', '**v8.7: RARITY AUDIT.** Checked current unit/building rarity against the source lists in `ref/units-original.txt` and `ref/buildings-original.txt`. **Fusion Reactor is LIMITED, not MYTHIC (red); v8.8 corrects its color to cyan.** Corrected exact-source mismatches: Oil Drill EPIC; Iron Mines COMMON; Data Center MYTHIC; Research Lab LEGENDARY; Supply Depot RARE; Hydroponics Facility UNCOMMON; Alloy Foundry LEGENDARY; Offshore Oil Rig EPIC; Naval Beacon MYTHIC; Spectre MYTHIC. New/remake-only entries without a source match keep their current rarity. Smoke verifies the Limited badge label and Limited-over-Mythic sort order; v8.8 sets its color to cyan. 249 assertions.'),
 ('2026-09-27', '**v8.6: LAND ROUTING FIX.** \U0001F6E3\uFE0F **BRIDGES ARE REAL LAND** — `WALK` samples 40px cell centres, so points on diagonal bridge/coast edges can be land even when their cell is marked water; water rescue now confirms the exact point near land before teleporting a soldier. \u2693 **LAND TROOPS LEAVE THE OFFSHORE RIGS TO THE NAVY** — ground target selection skips water-only capture points, while ships still capture them. Regression tests verify a unit stays on a bridge cell mislabelled as water, a rifle reaches the NE island over the bridge, and land AI never targets a RIG. 247 smoke assertions.'),
 ('2026-09-27', '**v8.5: BUILD FLOW UPDATE.** \U0001F9F1 **KEEP PLACING** \u2014 drop a building and the next one from your backpack stack is handed straight to the cursor, so a whole row goes down without reopening the backpack; when the stack empties it stops and says so (`keepPlacing/refillHand/placeLeft`). \U0001F9F1 **SHIFT + DRAG = PLACE A RUN** \u2014 hold SHIFT, press and drag out an area: every footprint-sized spot in the rectangle is previewed live (green where it fits, red where it is taken, lifted to the stack level, with a `N \u00d7 name \u2014 let go to place` label) and placed on release (`placeSpots` + `placeRun`); it stops at the last one you own, and it spreads them side by side instead of stacking them. \U0001F9F1 **THE BACKPACK STAYS OPEN** while you place \u2014 click the next card to switch item. \U0001F4CB **AUTO-SORT**: the SHOP (rarity, then cheapest), the BACKPACK (crates first, then best rarity) and both ADMIN lists now run best-rarity-at-the-top automatically (`rarRank` + `bestFirst`). \U0001F40D **THE WORM**: it surfaces in the MIDDLE (the CITY island) instead of a random bot base, and it FIGHTS \u2014 every 4.5s it SLAMS every enemy unit within 210px for 45 and crushes enemy buildings within 260px for 130, with a shockwave and a SLAM! float (`BOSS_SLAM` + `bossSlam`). \U0001F40D **ADMIN \u2192 CUSTOM BOSS HP**: type `5000` / `250K` / `1.5M` and press SET HP \u2014 it sets the live worm and every boss that spawns later; empty + SET HP restores the default (`Admin.bossHp`). \U0001F41C **NO MORE UNIT COLLISION**: troops never block each other now \u2014 they only drift apart a little when they end up on top of each other (the don\u2019t-touch nudge), soldiers and ships alike, and the nudge is far too weak to stall a march (it used to shove at ~100px/s and froze columns on bridges). \U0001F41C **NO MORE DROWNING**: a land unit that ends up in the water is put straight back on the nearest shore (`nearestLand`). 243 smoke assertions.'),
 ('2026-09-27', '**v8.4: STACKS & CRATES.** \U0001F9F1 **BUILDINGS STACK \u2014 UNLIMITED HEIGHT.** Point at a building you already own and the next one lands ON TOP of it instead of being refused: `stackTopAt()` works out how high the pile under the footprint is, `fitsAt()/findFreeSpot()/ghostSlot()/placeBuilding()/placeBuildingRaw()` all take that `lvl`, and `b.lvl` is stored on the building. Level 0 is the ground, every floor above it is lifted `STACK_UP` (24px) and drawn on top of the one below (y-sort, then level); the ghost shows dashed drop-legs and a LEVEL n label so you can see which floor you are about to build. `buildingAt()` is lift aware, so clicking a stack picks the crate you actually aimed at, and every floor works on its own (4 barracks 4 high = 4 recruits). Bots and mass fills still spread out first: `findFreeSpot()` only climbs a pile when there is no free ground left. Old saves whose footprints now overlap are stacked instead of being returned to the backpack. Admin: `Admin.pile(type,n)` builds a tower n high. \U0001F4E6 **THE BACKPACK STACKS.** One card per item with an \u00d7N badge: `giveItem/takeItem/invCount/invFind` merge and split stacks, `mergeInventory()` folds old per-item saves, and building cards place one at a time. \U0001F381 **BULK CRATE OPENING.** Clicking a crate stack asks "open how many?" (1 / 5 / 10 / ALL \u2014 `askOpenCount()`), then `openCrateModal(ct,n)` rolls them all and lists every win, rarest first, with \u00d7counts and rarity colours. \U0001F48E **THE ROBUX SHOP WORKS** \u2014 it used to call a `renderRobux()` that did not exist, so the tab threw; it now sells Standard / Elite / Premium crates for cash (1 or 10 at a time). 217 smoke assertions.'),
 ('2026-09-27', '**v8.3: HARBOUR UPDATE.** ⚓ **YOUR WATER YARD** \u2014 a buildable 832\u00d7224px strip of open sea BEHIND your island (`WATER_YARD`, drawn as a blue grid + \u2693 label, on the minimap too). Every dock (7 naval docks), the Offshore Oil Rig and the Naval Beacon are `BUILD[].water` and can ONLY be placed there; land buildings are refused with a reason. Ships now launch straight into it. Placement is zone aware throughout: `plotOrigin/plotToWorld/worldToPlot/plotRectPath/fitsAt/findFreeSpot/ghostSlot/placeBuilding` take a `zone` (\u2018land\u2019 or \u2018water\u2019) and `b.zone` is stored on the building. ⚓ **4 WATER CAPTURE POINTS** \u2014 RIG NW/NE/SE/SW at r 2100 in the ocean gaps; only ships can reach them, a held rig garrisons gunboats (`spawnGarrison`), and each one you hold gives +10% production like an outpost. They are drawn as offshore platforms on stilts. ⚓ **BUILD GRID TWICE AS FINE**: SLOT 16\u21928, PLOT 104\u00d772 cells (island unchanged at 832\u00d7576px), GRID_K 8, and save migration now converts from ANY older cell size (`k = oldGrid/SLOT`). ⚓ **BUILDINGS 3\u00d7 SMALLER**: `BLD_K` 1.3\u21921.3/3 \u2014 a Solar panel is 24px wide instead of 64px, so several times more of them fit on an island. ⚓ **HOVER A TROOP FOR ITS STATS**: `unitAt()` (spatial hash) + `unitTipHTML()` show hp, damage, DPS, range, speed, troop-cap size, armour, detect, splash, aura, bounty, damage modifiers and the current order; `hoverUnit()` re-tests ~12\u00d7/s and rebuilds the card ~2.5\u00d7/s so it stays free with 1000 units. ⚓ **HOLD Q TO PAUSE**: `holdQ` zeroes the game clock while the camera, hover cards and panels keep running, with a \u23f8 PAUSED badge on screen.'),
 ('2026-09-27', '**v8: PERFORMANCE & PEACE UPDATE.** ⚡ **POTATO MODE** — ⚙ SETTINGS gained two rows, UNIT GRAPHICS and BUILDING GRAPHICS, each `Normal` or `Potato`. Blocks (v8.2: the blobs became plain rectangles) replaces every troop with a rectangle EXACTLY its the size of its sprite and every building with its footprint rectangle — in the colour of its owner, no shadow/outline (js/render/05-blocks.js); the sprite blit is skipped entirely, the single biggest frame-time win in the game (smoke test: 216 sprite draws per 24 frames → 0). Old `Potato` saves migrate to `Blocks` in init(). ⚡ **TREES & DECOR** toggle — hides trees, rocks, grass patches and the floating crystals (350 tree draws/frame → 0). ⚡ **EFFECTS High/Low** (was GRAPHICS MODE) now also drops the ocean glints, the lane glow and halves the coastline detail (72 → 28 segments). ⚡ **BUILDINGS ARE PERMANENT** — `damageBuilding` returns early while ⚙ INDESTRUCTIBLE BUILDINGS is on (default), so nothing can destroy a building and right-click no longer sells your own; switching it off restores destructible bases and the 50% refund. ⚡ **THE WORLD IS TWICE AS BIG**: WORLD 4800→9600, RING 1700→2600, outposts 760→1150, crystals 900→1400, city r 330→460, lanes 955/2260→1580/3400. Islands sit far apart (1990px between neighbours) with wide ocean for ships. Map load stayed cheap: the land test rejects most of the 57 600 walk cells with a bounding box (PLOT_BB/CITY_BB/ILET_BB/BRIDGE_BB) before any trigonometry — verified identical to the un-optimised test over 319 225 samples. ⚡ **NO MORE DRIVE-BY SHOOTING**: units only engage what is CLOSE — `aggroReach()` gives marching units `min(range+60, AGGRO.march 210)` while holders (garrisons, base defenders, idle troops) keep `range+220`. Artillery used to shell your base from 430px away while walking past. ⚡ **IDLE TROOPS MARCH ON THE MIDDLE**: with no order your army heads for the CITY (then the nearest point you do not own) and fights what it meets en route, instead of beelining for somebody’s base. ⚡ **ENEMY BASES**: their build-grid pads, dashed outlines and name labels are hidden — you see their buildings and their troops. ⚙ ENEMY BASE GRIDS brings the labels back. ⚡ **ZOOM OUT TO THE WHOLE MAP**: the zoom-out limit is no longer a fixed 0.5× but `MINZ = min(W/WORLD.w, H/(WORLD.h·0.72))`, recomputed on resize, so at full zoom-out the entire 9600px world fits your window; `clampCam()` then locks the camera to the map centre so no corner is cut off.'),
 ('2026-09-27', '**v7: NAVAL UPDATE + folder reorganisation + money capacity.** `js/` is no longer one flat list of 24 files — it is now **12 folders**: `core` (helpers/state/save/audio/camera/fx/loop/init), `data` (world, factions, classes, units, unit-helpers, buildings, unit-buildings, rarities + the two new unit/building tables), `maps` (island map + **02-sea.js**: the SEA grid, shipping lanes, ship navigation), `textures` (sprite library: base sprites, unit templates, naval ships, new units, buildings), `systems` (power, economy, waves, captures), `buildings` (placement, **production: money capacity + training + wave-defense garrison**, bots, turrets, support), `units` (spawn, movement, spatial grid, AI, combat), `rewards` (crate tables, codes, rewards data + UI), `achievements` (data, check loop, 🏆 panel), `render` (frame, units, ground, minimap), `ui` (core, shop, tooltips, backpack, leaderboard, settings, rebirth, tutorial, input, patch notes), `admin`. Load order is still index.html; nothing was lost, several 500-line files were split by concern. \u26a1 **Naval line:** 7 ships (Speedboat → Carrier; Submarine + Zumwalt are STEALTH) with 7 dock buildings and a ⚓ NAVAL shop tab. \u26a1 **Water lanes:** a ring of shipping lanes around the CITY (r 955, squeezed between the outpost islets and the plot lobes), 8 radial lanes out to the open sea and an outer loop (r 2260) — drawn as buoy lines, used by ship pathfinding (SEA grid + sea A*, coastal approach to shell land targets). \u26a1 **Money Capacity:** every money building stores what it earns up to its Capacity (≈10 min of production) and pays out every 30s — or the instant you click it (new HUD row shows stored/cap). The **Bank now pays 5% of STORED cash**. 9 new production buildings (Advanced Solar → Automated Factory). \u26a1 **Wave-defense garrisons:** while a raid is incoming (or hostiles are within 1300px of your plot) every unit building trains FREE defenders of its own type up to its MaxCap (24 slots base-wide); they stand down when the base is safe. \u26a1 **StructurePower** split from army power (leaderboard shows both). \u26a1 **Kill bounties** scale with the victim (wave HP buff × tier). \u26a1 Unit **footprints** now matter when spawning (recruits look for a free spot their own size). \u26a1 New units: Light Tank, Mantis, TIGR, Swarm Drone, PZH 2000, Leopard 2A5, ICBM Launcher, **Centurion (UNIQUE)**, F-15, F-35, SU-47, KA-52, **Officer** (support: +25% damage aura) + 20 new buildings incl. Submarine Cavern, Centurion Support Site and Airship Docks. \u26a1 Your own stealth units (incl. submarines) are no longer invisible to you. \u26a1 New 📜 PATCHES panel (left rail) + admin buttons (EMPTY ALL SAFES / MUSTER GARRISON / RAID ALERT).'),
 ('2026-09-26', '**v6: fine grid + rotated plots.** Build grid 13×9 slots of 64px → 52×36 cells of 16px; every footprint is computed from its sprite (width = model × 1.3 rounded up to cells, depth ≈ half) so the pad hugs the model. Bot presets keep their coarse layout (×4) and slide to the nearest free spot; old saves convert (grid field) and overlapping buildings go to the backpack. Bot plots are rotated to face the city like the original (diagonals are diamonds): pads, grids, outlines, trees, minimap, walkable shape and click hit-tests follow the rotation. Square 912px islands, RING 1450→1700, WORLD 4800, city r 330, bigger lobes, outposts r 760 turned to face the city. Max zoom 1.6× → 3×. Stronger grid lines.'),
 ('2026-09-26', '**v5: compact map + real sizes + performance.** Map shrunk like the original (WORLD 5600→4000, SLOT 85→64, RING 2000→1450, city r 400→300, shorter bridges, outposts r 610, crystals r 860). Buildings are drawn at their real footprint size on a faction-edged concrete pad; units scale with troop size. Admin: scrollable + searchable building/unit lists, QTY 1–1000 (BP/PL/SPAWN), FOR (you or any bot), spiral spawn on walkable land. Perf (1400 units: 40→9 ms/frame sim): spatial hash with faction bitmask, cached targets (~3×/s) and foe scans (~5×/s), A* budget 24/frame + shared paths, deferred unit removal, sprite cache (offscreen canvases), minimap 10×/s, fx caps, crowd separation. Fixes: selection rings never drew (selUnits holds objects), placement ghost used old 50/100px slot, typing in inputs panned the camera, splash could kill a unit twice (double reward), dead building could still be hit.'),
 ('2026-09-26', '**v4 big update.** Split game.js into 24 files in js/ (load order = index.html). New radial map copied from ref-map-original.png: 8 square forest plots on a ring, a lobe island each, octagon CITY, 8 long bridges, 4 outpost islets with bridges, 4 floating crystals. 35 units in 4 classes (10 light / 10 armored / 10 air / 5 stealth) with the original damage-modifier system (×0 = can\'t target), splash, medic heal, saboteur ×3 vs buildings, drone = flying light. One building per unit (generated sprites with a unit signboard) + shop sub-tabs. New production (wind, iron mines, steel, refinery, power plant, skyscraper, fusion), special (pillbox, radar, SAM site, field hospital, fortress cannon, bank, Monument [rebirth]) and decor. Hover stat tooltips, 🏆 15 achievements, 📊 leaderboard, troop cap by unit size, rarity colours fixed, faction-coloured building flags. Save v4 (v1–v3 migrate). Tests: 104 checks; gen_info v3 reads live data.'),
 ('2026-09-26', 'Bug fixes: featuredPremium WEEK→WEEKLY crash · admin import rejected v3 saves · PLOT.w*50 centre (btnHome/go/spawnUnit/fallback) · god mode made bots immortal · bot buildings blocked your placement grid · building HP bars drawn at world origin · HP bar/tracer height depended on unit NAME length · HUD city counted twice (+30%) · minimap click used hard-coded 150×112 · bot outlines + minimap used old 12×7 size · reload turned garrisons into free troops · production cap counted garrisons · O(n²) stealth pass every frame · rarity CSS classes never matched.'),
 ('2026-09-26', 'INFO.md generator v2 (documents every file/function/handler/global/id/css/assert). No gameplay change.'),
 ('(before 2026-09-26)', 'Initial upload: island map, 7 bots, capture points, waves, boss, crates, codes, rewards, rebirth, admin, tutorial, smoke test.'),
]
# ---------- KNOWN ISSUES (remove when fixed) ----------
KNOWN_ISSUES = [
 ('buildings', 'v8: buildings are PERMANENT by default (the user asked for it), so bot bases can never be knocked down — the "base destroyed → rebuilding" loop only runs when ⚙ INDESTRUCTIBLE BUILDINGS is off.'),
 ('naval', 'Ships sail the open sea but have no water-lane patrol AI yet: with no orders they head for the nearest enemy building and shell it from the coast.'),
 ('balance', '55 units / 100 buildings use first-pass numbers adapted from the original — expect tuning (especially the naval line and the new production ladder).'),
 ('naval', 'Ships sail the open sea but have no water-lane patrol AI yet: with no orders they head for the nearest enemy building and shell it from the coast.'),
 ('visual check', 'The map/sprites were checked in headless renders only; small overlaps of signboards on 1×1 buildings are possible.'),
]

# ---------- files ----------
SKIP_DIRS = {'.git', 'node_modules', '__pycache__'}
files = []
for root, dirs, fs in os.walk(WS):
    dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
    for fn in sorted(fs):
        p = os.path.join(root, fn)
        rel = os.path.relpath(p, WS).replace(os.sep, '/')
        lines = rd(p).count('\n') + 1 if fn.endswith(('.js', '.py', '.md', '.html', '.css', '.txt')) else ''
        files.append((rel, os.path.getsize(p), lines))

# ---------- misc extraction ----------
html_ids, cur_c = [], 'top'
for i, l in enumerate(HTML.splitlines()):
    c = re.search(r'<!--\s*=*\s*(.*?)\s*=*\s*-->', l)
    if c: cur_c = c.group(1)
    for tag, idv in re.findall(r'<(\w+)[^>]*\bid="([^"]+)"', l):
        txt = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', l)).strip()
        if len(txt) > 60: txt = txt[:57] + '…'
        html_ids.append((i + 1, cur_c, tag, idv, esc(txt)))
html_panels = re.findall(r'id="p-(\w+)"', HTML)
html_datapanels = re.findall(r'data-panel="(\w+)"', HTML)
css_vars = re.findall(r'(--[\w-]+):\s*([^;]+);', CSS)
css_sections, cur, cur_ln, sels = [], 'top', 1, []
for i, l in enumerate(CSS.splitlines()):
    m = re.match(r'/\*\s*-*\s*(.*?)\s*-*\s*\*/', l.strip())
    if m and i > 0:
        css_sections.append((cur_ln, cur, sels)); cur, cur_ln, sels = m.group(1), i + 1, []; continue
    m = re.match(r'([^{}@/][^{}]*)\{', l)
    if m and not l.startswith(' '): sels.append(m.group(1).strip())
css_sections.append((cur_ln, cur, sels))
css_keyframes = re.findall(r'@keyframes (\w+)', CSS)
smoke_items, cur = [], 'setup'
for i, l in enumerate(SMOKE.splitlines()):
    m = re.match(r'\s*//\s*(?:\d+[a-z]?\.|----)\s*(.*)', l)
    if m: cur = m.group(1).strip(' -')
    for msg in re.findall(r"assert\([^;]*?,\s*[`'\"](.+?)[`'\"]\s*\);", l):
        smoke_items.append((i + 1, cur, esc(re.sub(r'\$\{[^}]*\}', '…', msg))))
notes_heads = [l for l in NOTES.splitlines() if l.startswith('## ') or l.startswith('### ')]

# ---------- coverage ----------
missing_funcs = sorted({n for _, _, n, _ in funcs if n not in D})
missing_nested = sorted({n for *_, n, _, _ in [(a, b, c, d, e) for a, b, c, d, e in nested] if n not in NESTED_D})
missing_nested = sorted({x[2] for x in nested if x[2] not in NESTED_D})
missing_admin = [n for _, _, n, _ in admin_methods if n not in ADMIN_D]
missing_handlers = sorted({f"{t}|{e}" for _, _, t, e in handlers if f"{t}|{e}" not in HANDLER_D and not e.startswith('toggle')})
missing_files = [r for r, _, _ in files if r not in FILE_D]
U, BLD = DATA['UNITS'], DATA['BUILD']
nospr = [k for k in list(BLD) + list(U) if k not in DATA['SPRITES']]

# =====================================================================
# BUILD MARKDOWN
# =====================================================================
md = []; A = md.append
warn = lambda lst: ('⚠️ ' + ', '.join(f'`{x}`' for x in lst)) if lst else '✅ none'
A("# Military Base 2.5D — INFO (EVERYTHING: files · functions · data · systems)")
A(f"> **Auto-generated by `gen_info.py` on {datetime.date.today().isoformat()} — DO NOT hand-edit.** Edit `gen_info.py` (descriptions, CHANGELOG, KNOWN_ISSUES) and re-run it. Data tables are read LIVE from the game (`node dump_data.js`).")
A(">")
A("> ⚠️ **STANDING RULE — EVERY UPDATE:** whenever anything in this folder changes (js/*.js · index.html · style.css · smoke.js · new files):")
A("> 1. add a line to `CHANGELOG` in `gen_info.py` (and fix/remove `KNOWN_ISSUES` lines),")
A("> 2. describe any new function / handler / file (the coverage report lists what's missing),")
A("> 3. run `python3 gen_info.py` and `node smoke.js` (must end **ALL SMOKE TESTS PASSED**).")
A(">")
A("> `NOTES.md` = what to do NEXT. **This file = what the game IS right now.**")
A("")
toc = ["Coverage report", "Changelog", "Known issues", "Files", "Run / test", "JS file map", "Core constants", "Map layout", "Factions",
       "Unit classes & damage", "Units", "Buildings", "Bot presets", "Points", "Crates", "Redeem codes", "Rewards", "Achievements", "Rarities",
       "How the systems work", "Functions", "Nested helpers", "Admin methods", "Event handlers", "Global variables", "State object",
       "Sprites", "Sound effects", "Tutorial", "Test hook", "index.html elements", "style.css", "Smoke test assertions", "NOTES.md outline"]
A("## 📑 Contents\n\n" + ' · '.join(toc) + "\n")
A("## ✅ Coverage report\n\n| Check | Result |\n|---|---|")
A(f"| Top-level functions without description ({len(funcs)}) | {warn(missing_funcs)} |")
A(f"| Nested helpers without description ({len(nested)}) | {warn(missing_nested)} |")
A(f"| Admin methods without description ({len(admin_methods)}) | {warn(missing_admin)} |")
A(f"| Event bindings without description ({len(handlers)}) | {warn(missing_handlers)} |")
A(f"| Files without description ({len(files)}) | {warn(missing_files)} |")
A(f"| Buildings/units without a sprite ({len(BLD)+len(U)}) | {warn(nospr)} |\n")
A("## 📝 Changelog (newest first)\n\n| Date | Change |\n|---|---|")
for d_, c_ in CHANGELOG: A(f"| {d_} | {c_} |")
A("\n## 🐞 Known issues\n\n| Where | Problem |\n|---|---|")
for w_, p_ in KNOWN_ISSUES: A(f"| {w_} | {p_} |")
A(f"\n## 📁 Files (whole workspace, auto-scanned)\n\nWorkspace root = `{os.path.basename(WS)}/`.\n\n| File | Size | Lines | What it is |\n|---|---|---|---|")
for rel, size, lines in files: A(f"| `{rel}` | {human(size)} | {lines} | {FILE_D.get(rel, '⚠️ undocumented — add to FILE_D')} |")
A("\n## ▶️ Run / test\n\n```bash\ncd military-base-25d\npython3 -m http.server 8000 --bind 0.0.0.0   # play at http://localhost:8000\nnode smoke.js                                 # headless test — must end ALL SMOKE TESTS PASSED\npython3 gen_info.py                           # regenerate THIS file after any change\n```\n")
A("## 🗂️ JS file map (load order = index.html)\n")
A("All files share ONE global scope (classic scripts): a `const` in `02-data-world.js` is visible in every later file. **Order matters** — data before systems before UI before init.\n")
A("| # | File | Lines | Contains | Functions |\n|---|---|---|---|---|")
for i, f in enumerate(JS_FILES):
    fn = [n for ff, _, n, _ in funcs if ff == f]
    A(f"| {i+1} | `{f}` | {len(SRC[f])} | {file_head.get(f,'')} | {len(fn)} |")
A("")
FOLDER_D = {
 'core':'the engine: helpers, state, save, audio, camera+ground texture, fx, the main loop and boot',
 'data':'pure DATA tables: world/map layout, factions, classes, units, buildings, rarities (+ the two new unit/building tables)',
 'maps':'the island map (shapes, walk grid, A*, city flow field) and the SEA: water lanes, sea grid, ship navigation',
 'textures':'the whole sprite library — base sprites, unit templates, ships, new units, buildings (+ footprint computation)',
 'systems':'cross-cutting game systems: power, economy, waves/boss, capture points',
 'buildings':'everything a building DOES: placement, production (money capacity + training + garrison), bots, turrets, support',
 'units':'units: factory + garrisons, movement (land + sea), spatial hash, AI/detection, combat & bounties',
 'rewards':'crate tables, redeem codes, the REWARDS list + its panel',
 'achievements':'the achievement list, the unlock loop and the 🏆 panel',
 'render':'drawing: the frame, unit/boss/flag sprites, the ground (islands, lanes, trees…) and the minimap',
 'ui':'panels & input: core, shop, tooltips, backpack, leaderboard, settings, rebirth, tutorial, input, patch notes',
 'admin':'the F1 admin/debug drawer',
}
flds = {}
for f in JS_FILES:
    d = f.split('/')[1] if '/' in f else '.'
    flds.setdefault(d, []).append(f)
A("## 📁 Folder map (v7)\n")
A("`js/` is grouped by concern — each folder is a layer, and files inside it load in numeric order.\n")
A("| Folder | Files | Lines | What lives there |\n|---|---|---|---|")
for d, fs in flds.items():
    A(f"| `js/{d}/` | {len(fs)} | {sum(len(SRC[f]) for f in fs)} | {FOLDER_D.get(d,'⚠️ undocumented — add to FOLDER_D')} |")
A("")
W_, P_ = DATA['WORLD'], DATA['PLOT']
A("## 🧮 Core constants\n\n| Const | Value | Meaning |\n|---|---|---|")
A(f"| `WORLD` | {W_['w']}×{W_['h']} | world px (water outside islands) |")
A(f"| `MAP_C` / `RING` | ({DATA['MAP_C']['x']},{DATA['MAP_C']['y']}) / {DATA['RING']} | map centre (CITY) / distance city → plot centre |")
A(f"| `SLOT` | {DATA['SLOT']} | px per build-grid slot |")
A(f"| `PLOT` | ({P_['x']},{P_['y']}) {P_['w']}×{P_['h']} | YOUR plot (SOUTH); every plot is {DATA['PLOT_W']}×{DATA['PLOT_H']} slots |")
A(f"| `PLOT_MX/MY` | {DATA['PLOT_MX']} / {DATA['PLOT_MY']} | forest margin around the grid (taller because the view squashes y to 72%) |")
A(f"| `CITY_ISL` | r {DATA['CITY_ISL']['r']} | octagon city |")
A(f"| `CELL/GW/GH` | {DATA['CELL']} / {DATA['GW']}×{DATA['GH']} | A* walk grid |")
A(f"| `BRIDGE_W` | {DATA['BRIDGE_W']} | walkable half-width of a bridge |")
A(f"| `CITY_IDX` | {DATA['CITY_IDX']} | index of the CITY in S.points |")
A(f"| save | `bmb25` v{DATA['SAVE_V']} | localStorage autosave (12s + on close) |\n")
A("## 🗺️ Map layout (copied from ref-map-original.png)\n")
A(f"- **8 plots** on a ring of radius {DATA['RING']} around the CITY; YOU = south, bots clockwise from north (see Factions).")
A(f"- Each plot = {DATA['PLOT_W']}×{DATA['PLOT_H']} build grid inside a forest ring, plus a **lobe island** ({len(DATA['LOBES'])}) fused on the side facing the city.")
A(f"- **Octagon CITY** (r {DATA['CITY_ISL']['r']}) with 8 roads and a plaza; capture pad r 160.")
A(f"- **{sum(1 for b in DATA['BRIDGES'] if b['spoke'])} spoke bridges** city → every plot, **{sum(1 for b in DATA['BRIDGES'] if not b['spoke'])} outpost bridges** (each outpost links to its 2 neighbouring spokes).")
A(f"- **4 outpost islets** at angles {DATA['OUTPOST_ANGS']} (radius {DATA['OUTPOST_R']}); **4 floating crystals** (decor, not walkable) in the other gaps.\n")
A("| Plot | Top-left | Angle |\n|---|---|---|")
A(f"| YOU (SOUTH) | ({P_['x']},{P_['y']}) | 90° |")
for b in DATA['BOT_DEFS']: A(f"| {b['name']} · {b['dir']} | ({b['plot']['x']},{b['plot']['y']}) | {b['ang']}° |")
A("\n## 🎨 Factions\n\n| # | Name | Colour | Who |\n|---|---|---|---|")
for i, n in enumerate(DATA['FACNAME']):
    who = 'YOU' if i == 0 else f"{DATA['BOT_DEFS'][i-1]['name']} · {DATA['BOT_DEFS'][i-1]['dir']}"
    A(f"| {i} | {n} | `{DATA['FACCOL'][i]}` | {who} |")
A("\nEvery faction fights every other. Troops, building flags and signboards are tinted by faction (`unitPal`).\n")
A("## ⚔️ Unit classes & damage\n")
A("Classes (a unit can have several): " + ' · '.join(f"{v['ico']} **{v['label']}**" for v in DATA['CLASS_INFO'].values()))
A("")
A("- **Damage** = `max(1, dmg × modifier − target armor)`.")
A("- **Modifier** (`mods` vs the TARGET's classes): missing = ×1 · **0 = cannot damage / never targets** · multi-class target: any ×0 → 0, else the highest.")
A("- **Air** flies straight over water. The **Drone** has `fly` but stays LIGHT (anti-air can't touch it).")
A("- **Stealth** is invisible until: in combat, <70px, inside a unit's `detect`, or inside a friendly **Radar Station** (450px) / friendly detector (shared).")
A("- Extras: `splash` (50% to others in radius) · `heal` (medic hp/s) · `bld` (× vs buildings: flak/AA 0.2, Saboteur 3) · `size` (troop-cap slots).\n")
A("## 🪖 Units (live)\n")
A("| id | Name | Class | Rarity | HP | DMG | Rate s | DPS | Range | Speed | Size | Armor | Modifiers | Extras | Power | Kill $ | Trained by |")
A("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|")
trainer = {v['unit']: k for k, v in BLD.items() if v.get('unit')}
for k, u in U.items():
    mods = ', '.join(f"{c} ×{v}" for c, v in u.get('mods', {}).items()) or '–'
    ex = ', '.join(x for x in [f"detect {u['detect']}" if u.get('detect') else '', f"splash {u['splash']}" if u.get('splash') else '',
                              f"heal {u['heal']}/s" if u.get('heal') else '', f"bld ×{u['bld']}" if u.get('bld') else '', 'flies' if u.get('fly') else ''] if x) or '–'
    dps = f"{u['dmg']/u['rate']:.1f}" if u['dmg'] else '0'
    A(f"| `{k}` | {u['name']} | {'/'.join(u['cls'])} | {u['rar']} | {u['hp']} | {u['dmg']} | {u['rate']} | {dps} | {u['range']} | {u['speed']} | {u.get('size',1)} | {u.get('armor',0)} | {mods} | {ex} | {u['power']} | {u['reward']} | `{trainer.get(k,'–')}` |")
bo = DATA['BOSS']
A(f"| (boss) | {bo['name']} | armored | – | {bo['hp']} | {bo['dmg']} | {bo['rate']} | {bo['dmg']/bo['rate']:.1f} | {bo['range']} | {bo['speed']} | – | {bo.get('armor',0)} | – | HP ×(1+0.1·wave) | {bo['power']} | {bo['reward']} | spawns every 300s |")
A("")
cnt = {c: sum(1 for u in U.values() if c in u['cls']) for c in DATA['CLASSES']}
A("Roster: " + ' · '.join(f"{c} {n}" for c, n in cnt.items()) + f" · total {len(U)}\n")
A("## 🏗️ Buildings (live)\n")
for tab, label in DATA['SHOP_TABS']:
    rows = [(k, b) for k, b in BLD.items() if b['tab'] == tab]
    A(f"### {label} ({len(rows)})\n")
    if tab == 'units':
        A("| id | Name | Sub-tab | Trains | Every s | Cost | Size | Power | HP | Needs PWR | Rarity | Sprite style |\n|---|---|---|---|---|---|---|---|---|---|---|---|")
        for k, b in sorted(rows, key=lambda r: ((DATA['CLASSES']+['sea']).index(r[1]['sub']), r[1]['cost'])):
            A(f"| `{k}` | {b['name']} | {b['sub']} | {U[b['unit']]['name']} | {b['spawnEvery']} | {fmt_money(b['cost'])} | {b['w']}×{b['h']} | {b['power']} | {b['hp']} | {b.get('req','–')} | {b['rar']} | {b.get('style') or 'hand-drawn'} |")
    else:
        A("| id | Name | Cost | Size | $/s | Power | HP | Needs | Rarity | Info |\n|---|---|---|---|---|---|---|---|---|---|")
        for k, b in rows:
            need = ', '.join(x for x in [f"{b['req']} PWR" if b.get('req') else '', f"{b['reqRebirth']} rebirth" if b.get('reqRebirth') else ''] if x) or '–'
            A(f"| `{k}` | {b['name']} | {fmt_money(b['cost']) if b['cost'] else 'crate only'} | {b['w']}×{b['h']} | {b.get('income',0)} | {b['power']} | {b['hp']} | {need} | {b['rar']} | {esc(b['info'])} |")
    A("")
A("Special mechanics: **Logistics** +10% income each (max 5 count) · **Supply Depot** +10 troop cap (max 100) · **Pillbox / SAM Site / Fortress Cannon** = turrets (own mods) · **Radar** = shared stealth detection 450px · **Field Hospital** heals 10/s in 320px · **Bank** pays min(5% cash, $50k) every 60s (max 3) · **Monument** needs 1 rebirth and survives rebirth · golden buildings survive rebirth.\n")
A("## 🤖 Bot presets\n\n| id | Label | Tier | # | Buildings |\n|---|---|---|---|---|")
for p in DATA['PRESETS']:
    c = {}
    for t, _, _ in p['b']: c[t] = c.get(t, 0) + 1
    A(f"| `{p['id']}` | {p['label']} | {p['tier']} | {len(p['b'])} | {', '.join(f'{k}×{v}' if v > 1 else k for k, v in c.items()) or '(nothing)'} |")
A("\nDefault bots: " + ', '.join(f"BOT {i+1}=`{b['preset']}`" for i, b in enumerate(DATA['defaultState']['bots'])) + ". Bot unit cap 8+2·tier. A destroyed base is down 25s, then rebuilds.\n")
A("## 🚩 Points\n\n| id | Name | Position | Pad r | Garrison | Tanks |\n|---|---|---|---|---|---|")
for p in DATA['POINTS_DEFS']: A(f"| {p['id']} | {p['name']} | ({round(p['x'])},{round(p['y'])}) | {p['r']} | {p['garrison']} | {p['tank']} |")
A("\nCapture = strict faction plurality inside the pad (6s cooldown). Income: CITY +20%, each outpost +10%. Garrison respawns: city 15s, outposts 22s.\n")
A("## 📦 Crates\n")
A(f"- Standard {fmt_money(DATA['CRATE_PRICES']['standard'])} · Elite {fmt_money(DATA['CRATE_PRICES']['elite'])} · Premium {fmt_money(DATA['PREMIUM_PRICE'])} (15% featured, pity 80; featured rotates daily through `{DATA['WEEKLY']}`)\n")
A("| Table | Drops (×weight) |\n|---|---|")
for n, items in DATA['CRATE_TABLES'].items(): A(f"| {n} | {', '.join(f'{a}×{w}' for a, w in items)} |")
A("\n## 🎟️ Redeem codes\n\n| Code | Reward |\n|---|---|")
for c, v in DATA['CODES'].items(): A(f"| `{c}` | {v['msg']} |")
A("\n## 🎁 Rewards (claim in REWARDS)\n\n| id | Icon | Goal | Reward |\n|---|---|---|---|")
for r in DATA['REWARDS']: A(f"| `{r['id']}` | {r['ico']} | {r['name']} — {r['sub']} | {r['reward']} |")
A(f"\n## 🏆 Achievements ({len(DATA['ACHIEVEMENTS'])}, auto-unlock, paid automatically)\n\n| id | Icon | Name | Goal | Reward |\n|---|---|---|---|---|")
for a in DATA['ACHIEVEMENTS']:
    g = a['give']; rw = fmt_money(g['cash']) if g.get('cash') else f"{g['crate']} crate"
    A(f"| `{a['id']}` | {a['ico']} | {a['name']} | {a['desc']} | {rw} |")
A("\n## 💎 Rarities\n\n| key | Label | Colour |\n|---|---|---|")
for k in DATA['RAR_ORDER']: A(f"| `{k}` | {DATA['RAR'][k]['label']} | `{DATA['RAR'][k]['c']}` |")
A("""
## 🧠 How the systems work

### Combat
- `findEnemyOf` picks the nearest enemy that is **visible** (`canSee`) and **hurtable** (modifier > 0). Shots every `rate` s; `splash` hits others at 50%.
- Buildings take `dmg × bld`. Turret buildings (`updateTurrets`) fire on their own with their own modifiers.
- Kill rewards go only to the player. God mode protects only YOUR units and buildings.

### Unit AI (`targetFor` → `updateUnit` → `stepUnit`)
- **Bots**: ordered units march the CITY (flow field / A*); others defend their base (chase threats <700px).
- **Player**: explicit order → ATTACK flag → nearest enemy point → nearest enemy building → plot centre. Garrisons hold their point.
- **Medics** don't fight: they follow orders and heal the most injured ally in range.
- **Movement**: air (and the Drone) flies straight; land uses the CITY flow field or A* (0.7s repath).

### Waves & boss
- First wave 90s, then every 120s: `3+wave` troops + `wave/2` tanks from a random surviving bot, troop types unlock with `WAVE_POOL`: """ + '; '.join(f"wave {a}+ {', '.join(l)}" for a, l in DATA['WAVE_POOL']) + """.
- MECHA WORM: first at 180s, then every 300s after the last one dies. Kill = cash + Premium crate.

### Economy
- Income formula in `incomeRate`; the HUD shows the bonus % with a breakdown tooltip. Troop cap is counted in unit **size**.
- Rebirth: needs 5000·2.2^n power, +10% income forever; keeps golden buildings + Monuments.

### Save (localStorage `bmb25`, v4)
- Whole state; player units saved with `home` (garrison). v1/v2 → fresh map keeping progression; v3 → v4 (buildings outside the plot go back to the backpack, unknown types dropped, missing fields filled).

### Controls
- WASD/arrows pan · wheel zoom · drag select (Shift add) · Ctrl+click move · RMB cancel / sell 50% / assault · Esc · F1 admin · hover shop cards for full stats.
""")
A("## ⚙️ Functions (every top-level function, auto-extracted)\n")
cur = None
for f, ln, name, args in funcs:
    if f != cur:
        cur = f; A(f"\n### `{f}` — {file_head.get(f,'')}\n\n| Line | Function | What it does |\n|---|---|---|")
    A(f"| {ln} | `{name}({esc(args)})` | {D.get(name, '⚠️ undocumented — add to D')} |")
A("\n## 🧩 Nested helpers\n\n| File:Line | Helper | Inside | What it does |\n|---|---|---|---|")
for f, ln, name, args, parent in nested: A(f"| {f}:{ln} | `{name}({esc(args)})` | `{parent}` | {NESTED_D.get(name, '⚠️ undocumented — add to NESTED_D')} |")
A("\n## 🛠️ Admin methods (`window.Admin`)\n\nOpen with **F1**, **`** or 🛠 ADMIN.\n\n| File:Line | Method | What it does |\n|---|---|---|")
for f, ln, name, args in admin_methods: A(f"| {f}:{ln} | `Admin.{name}({args})` | {ADMIN_D.get(name, '⚠️ undocumented — add to ADMIN_D')} |")
A(f"\n### Admin drawer buttons (inline onclick — {len(inline_onclick)})\n\n| Button | Calls |\n|---|---|")
for call, label in inline_onclick: A(f"| {esc(re.sub(r'<[^>]+>', '', label).strip())} | `{esc(call)}` |")
A("\n## 🖱️ Event handlers\n\n| File:Line | Target | Event | What it does |\n|---|---|---|---|")
for f, ln, t, e in handlers:
    A(f"| {f}:{ln} | `{t}` | {e} | {'settings toggle' if e.startswith('toggle') else HANDLER_D.get(f'{t}|{e}', '⚠️ undocumented — add to HANDLER_D')} |")
A("\n## 🌐 Global variables (top-level const/let, not functions)\n\n| File:Line | Kind | Name | Value (truncated) |\n|---|---|---|---|")
for f, ln, k, n, v in globals_: A(f"| {f}:{ln} | {k} | `{n}` | `{v}` |")
_, settings_src = block_in(r'^function defaultSettings\(\)\{', r'^\}')
SETTINGS_D = {
 'music':'chiptune loop', 'sfx':'place/shot/boom/coin clicks', 'dmg':'floating damage numbers',
 'gfx':'EFFECTS High = particles, booms, ocean glints, lane glow, detailed coastline \xb7 Low = none of that',
 'units':'UNIT GRAPHICS Normal = sprites \xb7 Blocks = one rectangle per troop (its sprite\'s exact size)',
 'blds':'BUILDING GRAPHICS Normal = sprites \xb7 Blocks = the footprint rectangle in the owner\'s colour',
 'trees':'TREES & DECOR: trees, rocks, grass patches, floating crystals',
 'botGrid':'ENEMY BASE GRIDS: dashed pad + name label over each bot base (off = buildings + troops only)',
 'indestruct':'INDESTRUCTIBLE BUILDINGS: nothing can damage or sell a building',
}
A("\n## 💾 State object (`S`) — `defaultState()`\n\nRuntime extras: `S.admin` {speed,god,freeze,noRespawn}, `S._power`, `S._fps`, `S._prevPanel`. Units: id, type, side, faction, x, y, hp, maxHp, cool, order, home, bot, raid, boss, stealth, revealed, fightT, cityGoal, path, wp, repath, tx, ty, hist. Buildings: id, type, gx, gy, owner, hp, maxHp, t, flash, cool, x, y.\n\n```js\n" + state_src + "\n\n// ⚙ SETTINGS (see the table below)\n" + settings_src + "\n```\n\n"
+ f"**\u2699 SETTINGS rows**\n\n| Setting | Default | What it does |\n|---|---|---|\n" + "".join(f"| `{k}` | `{v}` | {SETTINGS_D.get(k,'⚠️ undocumented')} |\n" for k, v in DATA['defaultState']['settings'].items()))
A(f"## 🎨 Sprites ({len(DATA['SPRITES'])} registered)\n\n| Sprite | w×h | Kind | Where |\n|---|---|---|---|")
for k, v in DATA['SPRITES'].items():
    kind = 'unit' if k in U else ('building' if k in BLD else 'other')
    if k in BLD and BLD[k].get('style'): where = f"generated: `{BLD[k]['style']}` template (08c)"
    elif k in sprites_src: where = f"{sprites_src[k][0]}:{sprites_src[k][1]}"
    else: where = 'wrapped/generated'
    A(f"| `{k}` | {v['w']}×{v['h']} | {kind} | {where} |")
A(f"\n## 🔊 Sound effects ({len(sfx_names)})\n\n| Name | Recipe |\n|---|---|")
for n, r in sfx_names: A(f"| `{n}` | `{r}` |")
A(f"\n## 📖 Tutorial ({len(DATA['TUT'])} steps)\n")
for i, t in enumerate(DATA['TUT']): A(f"{i+1}. {re.sub(r'<[^>]+>', '', t).replace(chr(10), ' ')}")
A("\n## 🧪 Test hook (`window.__BMB`)\n\n" + ', '.join(f'`{k}`' for k in bmb_keys) + "\n")
A(f"## 🧱 index.html elements ({len(html_ids)} ids)\n\nPanels: {', '.join('`'+p+'`' for p in html_panels)} · rail: {', '.join('`'+p+'`' for p in html_datapanels)}\n\n| Line | Group | Tag | id | Text |\n|---|---|---|---|---|")
for ln, g, tag, idv, txt in html_ids: A(f"| {ln} | {g} | {tag} | `#{idv}` | {txt} |")
A("\n## 🎨 style.css\n\n| Var | Value |\n|---|---|")
for k, v in css_vars: A(f"| `{k}` | `{v.strip()}` |")
A(f"\nKeyframes: {', '.join('`'+k+'`' for k in css_keyframes)}\n\n| Line | Section | Selectors |\n|---|---|---|")
for ln, name, sels in css_sections:
    s_ = esc(' · '.join(f'`{x}`' for x in sels[:40])) + (f' … (+{len(sels)-40})' if len(sels) > 40 else '')
    A(f"| {ln} | {name} | {s_} |")
A(f"\n## ✔️ Smoke test assertions ({len(smoke_items)})\n\n| Line | Group | Asserts |\n|---|---|---|")
for ln, g, msg in smoke_items: A(f"| {ln} | {esc(g)} | {msg} |")
A("\n## 🗒️ NOTES.md outline\n")
for h in notes_heads: A(('  - ' if h.startswith('### ') else '- ') + h.lstrip('#').strip())
A("\n---\n*Generated by gen_info.py v3. If a table looks wrong, fix the parser, not the doc.*")

open(os.path.join(HERE, 'INFO.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')
print(f"INFO.md written: {len(md)} blocks · {len(files)} files · {len(JS_FILES)} js files · {len(funcs)} functions · {len(nested)} nested · "
      f"{len(admin_methods)} admin · {len(handlers)} handlers · {len(globals_)} globals · {len(U)} units · {len(BLD)} buildings · {len(smoke_items)} assertions")
miss = missing_funcs + missing_nested + missing_admin + missing_handlers + missing_files + nospr
print(("⚠️  UNDOCUMENTED: " + ', '.join(miss)) if miss else "✅ coverage: everything documented")
