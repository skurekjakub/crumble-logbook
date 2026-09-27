# Regular Arena (아레나): DCInside projectcc synthesis

Lane: regular, per-server Arena (일반 아레나, 일레나, 서버 아레나) on the DCInside Cookie Run: Crumble gallery. Captured 2026-09-27. The meta window is Arena season 5, which started around 2026-09-23 with Princess Bari (바리공주맛 쿠키) and Moon Rabbit (감감술래 놀이 달토끼맛 쿠키), plus older season-4 posts for contrast.

Sources: `dc/<id>.md` with images in `dc/img/`. Search listings: `list-a.tsv` to `list-d.tsv`. Extraction: `../08-extract/dc-arena.json`. Every claim cites `dc:<id>`. Confidence: **H** = several independent posts or a screenshot; **M** = one good post or a consistent thread; **L** = one comment, theory or datamine.

Caveats that apply to everything below:
- Screenshots with `S0xxx` server tags and +100/+125/+175 medal payouts are **Rumble Arena** (와글와글 아레나), not regular Arena. Many "defense log" screenshots on the gallery are Rumble. Where a claim rests only on those, it is marked.
- Formation screens show two rows of six. No post says which row is the front, so formations are written as **top row / bottom row** as displayed, left to right.
- Star counts can't be read reliably from the card art. Levels are nearly always Lv.100. Stars are given only where the text states them.
- In regular Arena, names and power are visible before you attack. Rumble hides names and adds +30% damage reduction (dc:75148, dc:73173).

## 1. The meta in one paragraph

Two decks dominate the top as of 2026-09-27: the **Rye one-carry deck** (호밀 원툴/호밀몰빵덱, "호황") and the **Bari–Oven Wanderer–Cherry Cola dive deck** (바리오방체콜) (dc:76534 **M**, dc:76853 **M**). The matchup is rock-paper-scissors (dc:73777, dc:76556, dc:75681 **M**):
- Rye beats Bari at equal or even higher power unless Bari is very high-star (dc:75463, dc:76368, dc:75148 **M**).
- Very high-star Bari (8–10★) and a big spec lead beat Rye (dc:76712, dc:75878, dc:75761 **M**).
- Crepe–Espresso beats Rye (dc:75681, dc:75724 **M**).
- Bari/charge decks beat Crepe–Espresso (dc:75681, dc:75724 **M**).
- Evasion decks and a Chain (연쇄) deck are niche counters (dc:72977, dc:75993 **M**).

Since 2026-09-27 the upper-middle of servers has drifted back to Rye; Bari–Oven is described as a whale-only tool, used for farming weaker players or locking in #1 (dc:76853 **M**).

For a whale with every cookie built: run **Bari–Oven–Cherry Cola at 8–10★ Bari/Oven** as a farming and defense deck, and keep the **Rye deck (Rockstar version)** as the answer to Bari-heavy opponents. Keep a **stage-gear preset** (with accuracy) to attack evasion defenders.

## 2. Top teams

### Team A: Rye one-carry deck (호밀 원툴덱, "정보탭 호밀덱")

Reference post: dc:74483 (13.87M, preset "아레나/토벌"), reproduced in dc:76602, dc:75910 and dc:76751. **H**

| Row | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| top | Macaron (마카롱) | Pinot Noir (피노누아) | Pomegranate (석류) | **Flex: Grapevine (포도넝쿨) → Rockstar (락스타)** | Nameless Cake Hound (들개) | Herb (허브) |
| bottom | **Rye (호밀)** | Cheesecake (치즈케이크) | Skating Queen (피겨) | Milk Pediatrician (우유), captain | Ion Cookie Robot (이온) | Moon Rabbit (달토끼) |

- **Levels and stars**: Lv.100 everywhere. The deck is described as the F2P/low-spend deck (무과금들은 이 덱 써라) and works without TSSR cookies. Rye at 5★ is the stated minimum for the Rye/Espresso ancestor (dc:69421 **L**).
- **Pets**: Holy Baby Drop (갓난갓방울) ★20, Hot Doggie (핫도그도그) ★20, and Chargemellow (전지멜로우, the 연타펫) ★17–20 (dc:74483, dc:76602, dc:76751 **H**). Alternatives: King Choco Drop (초코왕방울) (dc:75072 **M**), or Icy Birdie (얼음과자새) for DR against burst (dc:75910, dc:75598 **M**).
- **Perks** (merc captain must be Lv.4): 방어구 수리 특약 (Armor Repair, +10% DR with 3+ tanks) + 열정페이 (Passion Pay) (dc:74483, dc:75598 **H**). One tester runs Armor Repair + 의료보험 (Health Insurance) (dc:76751 **L**). In the mirror match, "you win if the opponent didn't set perks" (dc:76736 **M**).
- **Why each piece**:
  - Rye is the only real damage: piercing pistols, 2.2–2.5M damage per fight in screenshots (dc:74746, dc:75148, dc:67269 **H**).
  - Pomegranate's beam (빨대) goes by ATK order. Give Rye ATK% runes so the order is Milk > (Seeker) > Rye and Rye takes the first beam (dc:74746, dc:71947, dc:67269 **M**).
  - Hound's Range synergy lines up Macaron's march. Rye placed in line with Hound receives Macaron's buff. Without Hound, Macaron's skill "goes out like garbage" (dc:75807, dc:76330, dc:75148 **M**).
  - Three tanks (Hound, Ion, Moon Rabbit) switch on Armor Repair (dc:72838 **M**).
  - Milk + Herb + Ion is what survives the opening burst. Milk can't self-heal, so without Herb, Milk dies alone (dc:75736 **M**). Ion's shields ignore healing reduction (dc:75736 **L**).
  - Moon Rabbit is "mandatory insurance": without it Oven kills in 2s. Its ATK-down and crit-down on the enemy front line (often their Milk) wrecks their buffs (dc:76298, dc:73569 **M**).
- **Flex slot (top row 4)**:
  - **Rockstar is now preferred over Grapevine.** Rockstar cycles in about 5s including skill-ready, against 5.5s for Grapevine, and its shield lands during Bari's first dive, whereas Grapevine's heal often comes too late (dc:76751, dc:75148, dc:76602 **M**).
  - Give Rockstar 3–4 skill-haste lines (dc:76751 **L**).
  - Other variants: Brightseeker + Donut King replacing Grapevine + Skating Queen, or Espresso in the Grapevine slot.
  - On Seeker, see Disagreements.
- **Unorthodox**: Skating Queen in PvP. It's disputed; the tester keeps it for crit damage plus Chain synergy (dc:76751 **L**).

### Team B: Bari–Oven–Cherry Cola dive deck (바리오방체콜)

Reference: dc:75598 (a foreign top player's defense, pets all max). The same 12 appear in the Rumble logs of dc:75148 and dc:76717. **H**

| Row | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| top | Herb | Ion | Milk (captain, merc Lv.4) | Pomegranate | Pinot Noir | Macaron |
| bottom | Moon Rabbit | **Cherry Cola (체리콜라)** | Hound | **Princess Bari (바리공주)** | Cheesecake | **Oven Wanderer (오븐방랑자)** |

- **Stars**: this deck lives or dies on Bari's and Oven's stars. Reported thresholds:
  - Bari 5★ is the minimum (dc:76712 **M**).
  - 7★ Bari with 8–9★ Oven is still "meh" at the top; those players went back to Rye (dc:76853, dc:76712 **M**).
  - At 8★+ it "punches through" Moon Rabbit (dc:76313 **L**).
  - At 10★ Rye "can't hold at all" (dc:76712, dc:75878 **M**).
  - An older 1★ Bari version at 6.14M beat pre-Bari decks at twice its power in launch week (dc:74285 **L**).
- **Pets**: Holy Baby Drop, Hot Doggie, King Choco Drop (dc:75598 **H**). Rumble variants use Icy Birdie (dc:74285, dc:75148 **M**).
- **Perks**: Armor Repair + Passion Pay. The Lv.4 merc captain was the deciding difference in dc:75598 **M**.
- **Why**:
  - Bari's aura wraps every charge-type ally (Oven, Cherry Cola, Bari herself) with DR, lift and push immunity, and periodic damage around them.
  - Datamine: DR 40% at 9★ (dc:73113 **L**).
  - Per a leak, the aura damage scales on the wrapped cookie's ATK, which is why people put ATK% on Oven (dc:72449, dc:76389 **L**).
  - Oven and Cherry Cola dash at the highest-ATK enemy, which is usually Milk, especially under Passion Pay's −20% HP (dc:73569 **M**).
  - The three dive together and do about 2M each within about 3.5s at equal power (dc:75546 **M**).
  - Whoever loses Milk or Bari first loses (dc:75761 **M**).
- **Builds**:
  - Bari runes: Skill Haste + DR, about 45 skill haste for permanent aura uptime. The alternative is ATK to catch Pomegranate's beam (dc:75636 **L**).
  - Oven runes: damage (ATK%/Skill AMP), not HP-amp stacks (dc:76389 **L**).
  - Some Bari players drop skill haste from gear (dc:76242 **L**).
- **Variants**:
  - Crepe instead of Cherry Cola: 14.2M beat 15.17M, with Bari 2.09M and Oven 1.93M damage (dc:73497 **M**).
  - Brightseeker plus the same core, as run by a server #2 at 20.4M (dc:75148 **M**).

### Team C: Evasion deck (회피덱, "회슝좍")

Reference: dc:72977 and dc:69591 (same player, GM3 then GM2 finishing 9th overall in season 4). **H** for "it works"; **M** for the build.

| Row | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| top | Macaron | Donut King (도넛킹) | Cheesecake | **Vampire (뱀파이어)** | Milk (captain) | Ion |
| bottom | Rye | Pinot Noir | Pomegranate | Lime (라임) | Hound | Strawberry Crepe (딸크) |

- **Pets**: Mango Toucan (망고부리새, evasion rate) ★20 and Holy Baby Drop ★20, plus Chargemellow ★19 or Hot Doggie ★18 as the third (dc:72977, dc:69591 **H**). Cheese Drop (치즈방울) goes back in if raw evasion is under about 1000.
- **Gear** (preset "아레나 회피"):
  - Upper-left: Skill AMP.
  - Upper-right: Focus + Skill Haste. Focus lands Vampire's accuracy-down and Donut's polymorph.
  - Lower row: Evasion + crit RES and Evasion + Skill Haste.
  - Six skill-haste pieces are mandatory.
  - Evasion runes (2–3 lines) only on Ion, Hound and Vampire.
  - Target is about 1000 evasion (dc:72977, dc:69591, dc:72581 **M**).
- **Why**: normal Arena presets carry no accuracy, and typical enemy evasion is about 650 (dc:75812 **M**), so a 900–1000 evasion team makes attackers miss. Vampire's bat hits the highest-ATK enemy and lowers its accuracy.
- **Bari version** (dc:74043 **M**): top row Macaron, Pinot Noir, Vampire, Bari, Milk, Cherry Cola; bottom row Donut King, Pomegranate, Skating Queen, Peach (복숭아), Ion, Moon Rabbit. Pets: Mango Toucan, Eggbeak (달걀머리새, charge DR) and Hot Doggie. It beat a 21.43M team at 16.51M. A Bari 10★ version is in dc:73879.
- **Weakness**: an attacker who switches to their stage preset with accuracy lines beats it. It loses even to 7M teams with accuracy (dc:69591, dc:73173, dc:74043 **M**). In regular Arena, names are visible, so people remember evasion defenders (dc:73173 **L**).

### Team D: Chain deck (연쇄덱, "해골덱")

dc:75982 (17.59M defense) and dc:75966 (battle stats). **M**

- **Formation**: top row Ion, Milk (captain), Schwarzwälder (찰스), Vampire, Cheesecake, Macaron; bottom row Dr. Bones (닥터 뼈다귀), Hound (Lv.90), Twizzly Gummy (트위즐젤리), Skating Queen, Pomegranate, Pinot Noir.
- **Pets**: Hot Doggie, an evasion-type pet (unconfirmed) and Fluffy Cheese Cat (치즈뭉치 고양이, the Chain pet).
- **Why**: Chain synergy from Skating Queen and the Chain pet feeds Pinot, Vampire, Dr. Bones and Twizzly. In the stats Vampire did 1.78M, Pinot 979K and Twizzly 832K.
- **Result**: it beat a 17–18M Rye one-carry deck 3 times out of 3, despite the attacker's 1,100 accuracy (dc:75993).

### Team E: Crepe–Espresso (딸크에소), the Rye counter

Talked about a lot; no confirmed formation screenshot. **M** for the concept, **L** for the lineup.

- **Guessed lineup**: Milk, Pomegranate, Macaron, Crepe, Espresso, Moon Rabbit, Ion, Donut, Herb, Hound, plus Rye and Cheesecake (dc:75738).
- **Mechanism**: Crepe's knockback pushes the enemy Moon Rabbit before its debuff lands, and Espresso's black hole launches Rye out from the back (dc:75681, dc:75726).
- A related idea: give Crepe ATK% so it takes Pomegranate's first beam, plus 2 move-speed lines for a turn-one front-line nuke. One player says he has been losing to exactly that (dc:72014 **L**).

### Pre-Bari reference: five-ranged "spear" deck (5사격 죽창덱)

This was season-4 meta, now outclassed by Teams A and B.

- **Lineup**: Wind Archer, Macaron, Brightseeker, Rye, Donut, Milky Way, Pinot, Cheesecake, Pomegranate, Espresso, Milk, Hound (dc:70980, dc:71947 **M**).
- **Perks**: Passion Pay + 탄약비 전액 지원 (All Ammo Provided, +15 skill haste with 5+ ranged).
- **Pets**: Holy Baby Drop, Hot Doggie, and Icy Birdie or King Choco Drop.

## 3. Counter matrix

| Team | Beaten by | Why | Conditions | Sources | Conf. |
|---|---|---|---|---|---|
| Rye one-carry (A) | Bari–Oven–Cherry Cola (B) with 8–10★ Bari/Oven | 3-charger dive kills Milk/Rye before heals and shields; Rye is the only damage | Big star or spec lead; equal-power fights split | dc:76712, dc:75878, dc:75761, dc:74972, dc:74846 | M |
| Bari–Oven (B), ≤8★ Bari | Rye one-carry (A) | If the opening dive fails, B has no sustain; A's 3 tanks + Armor Repair + Ion/Rockstar shields absorb it | Similar power; 13.27M Rye beat 20.4M server #2 once | dc:75463, dc:76368, dc:75148, dc:75000, dc:75546 | M |
| Rye one-carry (A) | Crepe–Espresso (E) | Crepe knocks Moon Rabbit back before its debuff; Espresso launches Rye | Theory plus anecdotes | dc:75681, dc:75724, dc:75726, dc:76368 | M |
| Crepe–Espresso (E) | Bari / charge decks (B) | Bari's aura gives chargers push and lift immunity, cancelling E's displacement | | dc:75681, dc:75724 | M |
| Rye one-carry (A) | Chain deck (D) | Isolated Schwarzwälder soaks Rye's first volley; many sub-dealers take apart A's supports | 17.59M vs 17–18M, 3 of 3 | dc:75993, dc:75982 | M |
| Rye one-carry (A) | Rye mirror with Lv.4 merc perks set | Perks decide the mirror | | dc:76736, dc:75598 | M |
| Rye, Seeker/Donut/Crepe version | Rye, Grapevine/Skating version | Second healer; Seeker's drones vanish when their target dies | ~2M power deficit | dc:76602, dc:76349, dc:75148 | M |
| Evasion deck (C) | Any attacker using stage gear with accuracy | Accuracy cancels evasion | Even 7M vs 9.69M | dc:69591, dc:73173, dc:74043 | M |
| Unprepared decks (arena gear, no accuracy) | Evasion deck (C) | ~650 typical evasion vs ~1000; misses | Power gap "meaningless" | dc:74043, dc:69591 | M |
| Seeker/Milk all-10★ deck | Moon Rabbit 10★ + Bari + Cherry Cola | Moon Rabbit's ATK-down and crit-down on enemy Milk; dive kills Milk | One fight on launch day | dc:73569 | L |
| Pre-Bari five-ranged decks | Bari–Oven (B), even at 1★ Bari | Dive on Milk | Launch week, up to 2× power | dc:74285, dc:73497 | M |
| Multi-ranged decks (Wind Archer/Milky Way/Seeker) | Rye one-carry (A) | | 3–4M power deficit | dc:67269, dc:74792 | M |

## 4. Builds

### Gear: the arena preset (장비 프리셋 "아레나")

The consensus grid (dc:75766 top comment, dc:71947, dc:76242, dc:73838) **H**:

| Slot group | Substats |
|---|---|
| Upper-left: weapons (검/활/지팡이) | Skill AMP + crit **rate** |
| Upper-right: accessories (목걸이/반지/브로치) | Skill Haste + Skill AMP |
| Lower-left: armour (투구/갑옷/방패) | crit RES + DR |
| Lower-right: specials | Skill Haste + crit RES (or DR) |

- **Six skill-haste pieces on the right are non-negotiable** for healing and shield decks (dc:76242, dc:75761, dc:73838 **H**). The exception is Bari dive decks (dc:76242 **L**).
- **Skill AMP stays**: removing two Skill AMP lines flipped a 10–0 matchup, and a commenter says Skill AMP also scales buffs (dc:75253 **M**).
- **Crit rate over crit damage in Arena** (dc:71947, dc:75569, dc:76269 **M**). Opponents stack crit RES and Moon Rabbit cuts crit rate, so crit damage often never procs.
- **crit RES**: 4–6 of the lower pieces (dc:76474 **M**).
- **DR vs crit RES**: past about 60% crit RES, DR is worth more. A winning Milk was seen with 60.8% crit RES and 38.4% DR, against 83.6% and 24.7% on the losing side (dc:74327 **L**).
- **HP**: at most 1–2 lines. It's worse than DR when stacked (dc:76389, dc:75294 **L**).
- **No accuracy or focus**: they're not effective Arena stats (dc:75812, dc:76095 **M**). The exception is the evasion deck's Focus.
- **Why a separate preset**: crit RES is useless in Guild Conquest, and arena presets show lower displayed power because of their skill-haste and crit-RES lines (dc:71166, dc:75680 **M**).

### Sugar runes

| Cookie | Runes | Why | Source | Conf. |
|---|---|---|---|---|
| Rye | ATK% (a few lines; one user runs 4), Skill AMP, Skill Haste (confirmed useful) | Top-3 in ATK order for Pomegranate's first beam | dc:74746, dc:75072, dc:71947, dc:76408 | M |
| Rockstar | Skill Haste 3–4 lines (8 total from runes); HP/DR/Skill AMP otherwise | Shield must land during Bari's first dive | dc:76751, dc:75148 | L |
| Ion | HP, crit RES, DR, Skill Haste | Survive the opening | dc:71947 | L |
| Macaron | Skill AMP + Skill Haste | | dc:71947 | L |
| Moon Rabbit | Focus, Skill Haste, HP, DR (SR+) | Land the debuff fast | dc:73569 | L |
| Princess Bari | Skill Haste + DR, about 45 Skill Haste for permanent aura (alt: ATK) | Aura uptime | dc:75636 | L |
| Oven Wanderer | ATK% / Skill AMP rather than HP amp | Aura damage scales on the wrapped cookie's ATK; must kill in the opening | dc:76389 | L |
| Evasion deck tanks + Vampire | 2–3 Evasion lines | ~1000 evasion target | dc:69591, dc:72977 | M |
| Crepe (Crepe nuke idea) | ATK%, 2 move speed, Skill Haste | Take the first beam, reach the front | dc:72014 | L |

### Perks (용병단 복지)

- **Standard**: 방어구 수리 특약 (Armor Repair, +10% DR with 3+ tanks) + 열정페이 (Passion Pay, +20% ATK / −20% max HP on the highest-ATK ally). This needs a Lv.4 merc captain (dc:74483, dc:75598, dc:72838, dc:76808 **H**).
- Passion Pay's −20% HP is felt in Arena, and it lands on Milk, which is why dive decks target Milk (dc:72836, dc:73569 **M**).
- Alternatives: 종합 복지 패키지 (General Perks) or HP 5% instead of Passion Pay (dc:72836 **L**); 의료보험 (Health Insurance) (dc:76751 **L**).
- 초고속 승진 (Rapid Promotion) is weak in Arena because Milk warms up slowly (dc:72836 **L**).
- Element-damage perks are unused (dc:69173 **L**).
- "4대보험 퇴직금별도" is a joke answer, not a perk (dc:76582, dc:76808).

### Pets

The usual Arena set is Holy Baby Drop, King Choco Drop, Hot Doggie and Icy Birdie (dc:75900 **M**). Chargemellow goes in Rapid Fire–heavy Rye decks. Deck-specific pets:
- Evasion decks: Mango Toucan and Cheese Drop.
- Charge decks: Eggbeak (달걀머리새), which gives charge-type allies DR.
- Chain decks: Fluffy Cheese Cat (치즈뭉치 고양이).

## 5. Mechanics that decide Arena

1. **The dive targets the highest-ATK enemy.** Oven, Cherry Cola and Bari's dash all pick the top-ATK enemy, as does Vampire's bat (catalog skill text). That is almost always Milk, whose ATK is inflated by Passion Pay (dc:73569, dc:75761). **H**
2. **Bari's aura** gives DR, lift and push immunity, and periodic damage around each charge-type ally. Datamine: 40% DR at 9★. It makes Crepe and Espresso displacement useless against chargers (dc:73113, dc:75148, dc:75681). **M**
3. **Moon Rabbit's debuff** is ATK −50% and crit −130% at 9★ per datamine, and hits only enemies near it, so mostly their front line (dc:73113, dc:76298, dc:75736). Knocking it back before it transforms avoids the debuff (dc:75726). **M/L**
4. **Opening survival decides everything.** Ion and Rockstar shields after their skill-ready (스킬준비) buff, Donut polymorph and Herb healing Milk are what stop the one-shot (dc:75546, dc:75148, dc:75736). **M**
5. **ATK order decides buffs.** Pomegranate's Skill AMP beam goes by ATK ranking, and players tune ATK runes to steer it (dc:74746, dc:71947, dc:69421). **M**
6. **Synergy geometry**: Hound's Range synergy lines up Macaron's march; Milky Way breaks it (dc:75807, dc:76330). **M**
7. **Decoys**: Rye's first volley goes where it faces; an isolated Schwarzwälder absorbed it (dc:75993 **M**). Donut polymorph and Wind Archer's ultimate may target the highest-HP and nearest enemy, so a tanky Oven can soak them (dc:67619 **L**).
8. **No Rumble DR**: regular Arena lacks Rumble's +30% DR, so the Bari burst is deadlier here. Several players run Rye in Rumble and Bari–Oven in regular Arena (dc:75148, dc:76712). **M**
9. **Scoring**: a defense loss to a lower player costs up to −5, while the attacker gains +15 to +25, and a revenge win recoups the loss. Promotion rewards: Elite Master 1 pays 4,000 diamonds (3,000 trophies and top 30 overall), GM3 pays 4,000 and GM2 pays 6,000 (3,000 trophies and top 5) (dc:76100, dc:72977, dc:69591). **H** for the screenshots.
10. **Crit overflow**: one user claims crit rate above 100% becomes "strong crits" up to 300% (dc:76269). **L**, unverified.

## 6. Disagreements

- **Rye vs Bari at equal power.**
  - Rye side: Rye shreds same-power 5★ Bari, and a server #1 with 8★ Bari switched to Rye (dc:75463, dc:76368, dc:75148).
  - Bari side: Bari wins at equal power, and a 10★ Bari can't be beaten (dc:75501, dc:75761, dc:75878).
  - Resolution offered: it depends on Bari and Oven stars, gear, and merc Lv.4 perks (dc:75501, dc:76712).
- **Rye deck flex slot.**
  - Grapevine + Skating Queen (dc:76349, dc:76602).
  - Seeker + Donut (dc:75773: three votes, but only with 5★+ Seeker).
  - Rockstar over Grapevine (dc:76751, dc:75148, dc:76602 comments).
  - Brightseeker is judged worse than Rye as a carry: single target, and drones vanish when the target dies (dc:75148, dc:76751).
- **Skating Queen in Arena**: pointless, add a dealer or another healer (dc:76751 comments), versus worth it for crit damage and Chain synergy (dc:76751 poster).
- **Moon Rabbit**: bad because it only debuffs the front line (dc:76298) versus mandatory insurance (dc:76298, dc:76313).
- **Crit rate vs Skill AMP on weapons**: dc:76269, dc:75569, dc:73838.
- **Surviving the dive**: a player ranked 100–200 says a defensive deck survives it; others say the damage is too high (dc:75546).

## 7. Open questions

1. **Which row is the front line?** No post states it. Herb in the top row "dies first" (dc:76349), which hints that the top row is the front, but that isn't confirmed.
2. **Exact star levels** for the top Bari–Oven and Rye teams. Stars weren't legible in any screenshot, and the thresholds above come from text.
3. **Bari and Moon Rabbit coefficients.** Only a rough datamine exists (dc:73113). Does the aura damage use Bari's ATK or the wrapped cookie's ATK (dc:72449)?
4. **Crepe–Espresso** has no confirmed formation or pets, and no measured results.
5. **Win rates**: none measured. The only numbers are anecdotes such as "10/10" (dc:75253), "under 50%" (dc:75878) and "50–60% defense" (dc:69421).
6. **Merc Lv.4 perk interaction**: whether Armor Repair counts Moon Rabbit, Ion and Hound (all tanks per the catalog) is assumed but unverified in-game.
7. **Many "Rye beats Bari" logs are Rumble** (for example dc:76717 and dc:76751), where the extra DR favours Rye. Regular-Arena-only evidence for that edge is thinner: dc:75148's season-5 Arena win, dc:75463 and dc:76368.
