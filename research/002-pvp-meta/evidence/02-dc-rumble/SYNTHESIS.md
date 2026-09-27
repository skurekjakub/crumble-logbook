# Rumble Arena (와글와글 아레나): DCInside projectcc synthesis

Lane: Rumble Arena on the DCInside Cookie Run: Crumble gallery. Captured 2026-09-27. Season 1 ran 2026-09-23 to 2026-10-08.
Sources are cited as `dc:<post no>` (capture at `dc/<no>.md`, images at `dc/img/`). Confidence: **H**igh means shown in an in-game screenshot or an official notice. **M**edium means stated by several players, or by one top player. **L**ow means a single claim, a leak or an inference.

## Naming, which the search depends on

- The Korean name is **와글와글 아레나**. Gallery shorthand is **와레나**, **와글레나** and **와글 아레나**, and people also say 전섭/전서버/통합 아레나 (dc:71572, dc:73855). **H**
- On DCInside, searching `럼블` only finds the game's own name 크럼블 and the separate mode 크럼블 던전, so every `럼블` query was noise (`01-list-rumble.tsv`). All useful posts came from the `와글`/`와레나` queries (`03-list-wagle.tsv`).
- 바궁 means **Wind Archer** (바람궁수) in these threads, not Princess Bari (dc:75153, dc:75189, dc:75169). Record 001's glossary maps 바궁 to Bari, so that entry needs a caveat.

## Rules of the mode

| Rule | Detail | Source | Conf. |
|---|---|---|---|
| Pool | All servers share one ladder with no server-age brackets. It runs alongside regular per-server Arena (일반 아레나) and doesn't replace it. | dc:71572, dc:71640, dc:71806 | H |
| Format | Asynchronous auto-battle: you attack another player's saved **defense team**. Defense team and attack team are set separately, and there are 5 presets. No draft, bans or picks. | dc:76790, dc:74627, dc:72556 | H |
| Team size | Up to **12 cookies** (two rows of 6 on the team card) plus 3 pets. Empty slots are allowed, and some players deliberately leave a 1-cookie defense. | dc:73722, dc:74028, dc:75379 | H |
| Battle | About a **60 s** countdown, speed x0.5 to x2, an auto-repeat toggle (연속 도전) and skip. | dc:74028 images | H |
| Season buffs (S1) | ① **Charge (돌격형) cookies +30% Max HP**. ② **All cookies and summons +30% DMG Reduction**. Commenters say the buff changes each season. | dc:73855, dc:75091, dc:73795 | H (buffs), L (rotation) |
| What counts | Cookie stars and gear. Per commenters, breakthrough, research lab and Stella are excluded, and there are no guild effects. | dc:72542, dc:75168 | M |
| Tickets | Separate Rumble ticket. The free cap is 5 and refills daily; unused refills don't bank. The UI wrongly showed 8, which an official notice acknowledged. Extra tickets cost 1,000 mileage each with no limit. | dc:73299, dc:75128, dc:76364, dc:73284 | H |
| Points | The win value is shown before the fight (+6 and +10 seen). A loss at the top cost −5. Defense results run from +1/+2 to −1/−4. | dc:73955, dc:74627, dc:74344, dc:75250 | H |
| Hiding | At 2,000+ points, the opponent's name, power and levels show as ??? (익명의 도전자); the lineup and pets stay visible. | dc:74074 | H |
| Revenge | You can attack back from the defense log (복수). | dc:74074 | H |
| Leagues | Platinum, then Diamond, then Master (Master 5 up to Master 1), then **Champion 1** (max). Promotion needs points plus a percentile, e.g. Master 5 needs 2,000 pts and top 80%, and pays 1,500 gems. | dc:76790, dc:74356, dc:75168, dc:73871 | H |
| Season rewards | 1st: 60,000 gems + 25,000 medals. 2nd: 50k. 3rd: 45k (needs 3,200 pts). Top 10: 40k. Top 30: 35k. Top 100: 30k (needs 3,000 pts). Master top 5/10/20/30%: 25k/24k/23k/22k gems (needs 2,000 pts). Also a daily ranking and a limited-reward tab. Paid out automatically at season end. | dc:75881 | H |
| Medals | Each successful defense pays **+125 Rumble medals**, which players say is the main medal source. The medals buy keys, chocolate bars, syrup, Stella rune rewards, time-skips and a random box (SR 0.2%). | dc:75250, dc:76237, dc:73284, dc:73641, dc:76788 | H |
| Event | '격돌! 와글와글 아레나': daily missions for 5/10/15/20 challenges and a 20-step track (about 20 days). There is also a paid Rumble pass, 19,000 KRW per a thread title. | dc:72326, dc:73500, dc:74023 | H/M |
| Season 1 end | 2026-10-08 12:00 KST (matches crumb.gg `battle_end`). | dc:73855; crumb.gg JSON | H |

**How it differs from regular Arena:** it's cross-server; it has seasonal buffs that change who wins (Charge HP +30% and DR +30%); tickets are scarcer (5 per day, then mileage); it has league tiers and hides top-player info; the reward table is wider (top 100 plus Master percentiles, versus about top 30 in regular Arena per dc:75881); and it pays its own medals.

## Top teams

The top-player defenses come from crumb.gg's board (`research/001-guild-conquest-meta/evidence/16-top-players/13-crumbgg-rumble-arena.json`, fetched 2026-09-27 09:52 UTC, top 100). Across the top 100, the most-used cookies are Pomegranate (100), Milk (97), Pinot (95), Macaron (91), Ion (85), Cheesecake (79), Hound (75), Moon Rabbit (74), Herb (63), Oven (52), Cherry Cola (46) and Bari (42). Rye appears in only 7, all ranked 30–100. Pets: Majestic King Choco Drop 97, Holy Baby Drop 89, Hot Doggie 82, Icy Birdie 14. **Defense sizes: 76 of the top 100 field only 8–9 cookies, and all of the top 10 do.** The forum explanations below are what the players say about these lineups.

### 1. Oven–Bari charge deck (오바리 / 바리오방 / 돌격덱), the Season-1 signature. **H**
- **Lineup** (the order the top tier ran on day 1, dc:74221; it matches crumb.gg's slot order): 마카롱, 오븐방랑자, 피노누아, 치즈케이크, 석류, 바리공주, 우유(소아과), 들개, 이온, 체리콜라, 허브, 달토끼. All at Lv.100 (dc:74481 card, dc:75250).
- **crumb.gg #1** 凱凱の餅乾軍團 (4,000 pts) runs the 8-cookie version: Macaron, Oven, Pinot, Pomegranate, Bari, Milk, Cherry Cola, Herb. It drops Cheesecake, Hound, Ion and Moon Rabbit.
- **Pets:** 근엄한 초코왕방울 + 핫도그도그 + 갓난갓방울. Icy Birdie substitutes if you don't have King Choco Drop (dc:74463).
- **Stars:** people report it working with Bari at 2★ and 3★ (dc:74463, dc:74794). The common advice is Oven 7★ and Bari 5★ (dc:75037, M). The #3 player had Bari 6★ (dc:74344).
- **Why it works:** Charge divers get +30% HP, so they survive the dive into the backline. Milk and Pomegranate buffs make them delete ranged carries on contact. Bari, Oven and Cherry Cola top the damage charts at 1–2.8M each (dc:74794, dc:73857, dc:74463). **H**
- **Build notes:**
  - Bari and Ion: 피감 체력 스증 스가, from the then-#1 player (dc:75168, M).
  - Oven: defensive lines; avoid Skill Haste, or it runs in alone before the buffs land (dc:74417, dc:73722, L–M).
  - Route Pomegranate's buff onto Bari by making her the highest-ATK ally (strip Cherry Cola's ATK), or give up on it at 5★ (dc:74618, dc:75083, M).

### 2. Support-core "turtle" 8-cookie defense, the crumb.gg #2–#4 template.
- **Lineup:** Macaron, Pinot, Cheesecake, Pomegranate, Milk, Nameless Cake Hound, Ion, Moon Rabbit, with pets Hot Doggie, King Choco Drop and Holy Baby Drop. 날씨의아이, ㄹㄹ노아 and 군무원 run it (군무원 adds Herb).
- **No dedicated DPS.** Pinot is the damage source, doing about 1M in dc:73857.
- **Forum explanation: partial.**
  - Moon Rabbit's ATK-down on the enemy Milk collapses the enemy's buff chain (dc:73659, M).
  - Leaked 9★ values give Moon Rabbit ATK −50% and crit −130% (dc:73113, L).
  - Rabbit + Ion front lines are called a "rice-cake wall" that charge decks can't break (dc:73857, M).
- **Inference (L):** the 30% DR buff plus the ~60 s timer favours a defense that doesn't die. No post confirms what happens at time-out.

### 3. Rye (호밀) anti-charge deck, the mid-spec counter. **M**
- **Lineup (러너, 18.77M, dc:74721):** Macaron, Doughnut King Lv.96, Cheesecake, Grapevine, Hound Lv.88, Herb / Rye, Pinot Lv.94, Pomegranate, Milk, Ion Lv.83, Moon Rabbit. Pets: Holy Baby Drop 20, Icy Birdie 20, King Choco Drop 16.
- It beat a 27M Oven/Bari/Brightseeker deck: Rye did 2.29M and Hound 1.30M.
- **Variants:**
  - dc:74229 (12.92M) holds against Bari–Oven–Cherry Cola up to +6M in Rumble but loses in regular Arena.
  - dc:74316 is a no-Bari list with Melon Soda and Espresso and pets Holy Baby Drop / Hot Doggie / Chargemellow.
- **ATK-order rule (dc:75189, M):** make the top three by ATK Milk > Rye ≥ Pomegranate so Pomegranate's buff goes to Rye. Put Macaron on ATK% runes. The sub-100 levels on supports (Pinot 94/99, Hound 88, Ion 83) are there to steer buffs (dc:73955, dc:74721). This matches record 001's routing rules.

### 4. Wizard (마법사맛) underdog deck. **M** (one player, many screenshots)
- **Lineup (dc:74028, 12.28M):** Macaron, Rye, Cheesecake, Skating Queen, Hound Lv.82, Herb / **Wizard** (runes 스증 치피 치확), Pinot Lv.92, Pomegranate, Milk, Strawberry Crepe Lv.91, Moon Rabbit. Pets: ? 19 (maybe Chargemellow), Holy Baby Drop 20, Hot Doggie 20.
- Wizard does 1.75–2.33M per fight. The deck beat 17–21M Brightseeker/Rye/Espresso/Wind Archer decks.
- If it survives the first 10 s it wins; early-sweep Bari decks kill it. Crepe can swap for Ion, but Crepe is better against Moon Rabbit.

### 5. Other working decks. **M/L**
- **Rye/Espresso ranged deck** (dc:73955, 12.12M): Espresso ends up on the front line and is weak to Moon Rabbit. The poster puts the ceiling at about 1,900 pts at 12M.
- **Vampire evasion Rye deck** (dc:74627): an 8.41M team with 1,005 evasion beat 16.5M, winning 5 of 5 revenges. Runes: 스증 스가 피감 회피.
- **Bari–Crepe–Cherry Cola** (dc:73857): beats Bari+Oven, loses to Rye plus Rabbit.
- **Crepe–Espresso 5-Ranged-perk deck** (dc:75153): the old meta deck.

## Counter matrix (row loses to column)

| Team ↓ loses to → | Oven–Bari charge | Rye anti-charge | Crepe–Espresso ranged | Wizard | Moon Rabbit + Ion wall |
|---|---|---|---|---|---|
| **Oven–Bari charge** | mirror; Bari–Crepe–Cola wins (dc:73857) | at mid spec, similar power (dc:75553, 74721, 74229) M | — | — | yes: couldn't win at +2M (dc:73857) M |
| **Rye anti-charge** | at whale top-end (SR 10★), where buffed divers kill on contact (dc:75553) M | — | yes (dc:75153) L | yes (dc:74028) M | — |
| **Crepe–Espresso** | yes (dc:75153) L | — | — | yes (dc:74028) M | yes, Espresso up front (dc:73955) M |
| **Brightseeker / Wind Archer ranged** | yes, even at +3–4M (dc:74794, 74463, 75322) H | — | — | yes (dc:74028) M | — |
| **Wizard** | yes, killed in the opening (dc:74028) M | — | — | — | Crepe helps (dc:74028) |

Evasion is a wildcard. It beat a charge deck at half the power (dc:74627), but people disagree on whether it matters below about +400 over accuracy (dc:71672 vs dc:75453). Top rankers reportedly attack with their **stage (accuracy) gear preset**, possibly to beat evasion (dc:75391, dc:76490, L). The generic advice is still to use the arena preset, not the stage preset (dc:73554).

## Key mechanics

1. The **DR +30% buff blunts burst**. The same Rye deck survives Bari–Oven in Rumble and gets deleted in 0.5 s in regular Arena (dc:74229). **M**
2. **Charge HP +30%** is the whole reason Oven Wanderer went from unused to meta. Many commenters expect Bari and Oven to fall off when the buff rotates (dc:74177, dc:75083, dc:75517). **M**
3. **Buff routing by ATK order.** Pomegranate's buff (빨대) and Macaron's crit buff pick targets by ATK rank, and players tune levels and runes to steer them (dc:75189, dc:74618, dc:73955). **M**
4. **Moon Rabbit's ATK-down on Milk** undoes the enemy buff chain (dc:73659). Leaked 9★ values: Moon Rabbit ATK −50% and crit −130%; Bari DR 40% (dc:73113, L).
5. **Displayed power predicts outcomes poorly.** Frequent reports of 2x power upsets (dc:73589, dc:76592, dc:74721), explained by the gear preset, the charge buff and matchup.
6. **Matchmaking follows your points.** Players drop points on purpose with a 1-cookie defense to get easy targets (dc:75379). **M**

## Open questions

- **Why the top 10 field only 8 cookies.** Is it buff concentration, the timer, or something else? No post explains it. The crumb.gg day-1 data (dc:73722) still showed 12-cookie teams at the top.
- **What happens at time-out** (about 60 s), and whether a surviving defense wins by default.
- **Exact point formula** (the +6/+10 win values, −1 to −5 losses) and how matchmaking brackets opponents.
- **Whether levels and stars are normalised.** Commenters say breakthrough, research and Stella are excluded, but nothing official confirms it.
- **Sugar runes and gear for the #1 defense**, beyond "피감 체력 스증 스가" for Bari and Ion. The substats per slot are not posted.
- **Stars for the top-team cookies.** Screenshots show stars, but the forum names none for the top 10, apart from ㄹㄹ노아's Bari 6★ and Moon Rabbit 7★.
- **Season-2 buff.** Commenters say it rotates; the notice wasn't captured.
- **Images not transcribed:** dc/img 74028-8, 74481-2/3, 74589 (gif) and 73299-1 (notice banner). They are battle or result screens and the text around them was used instead.

## Stats

87 posts captured and read in `dc/` (69 relevant enough to extract, into `research/002-pvp-meta/evidence/08-extract/dc-rumble.json`). The four `.tsv` search listings are at the top of this folder. Stopped when the `와글`/`와레나` searches and the 개념글 list stopped turning up unseen relevant posts.
