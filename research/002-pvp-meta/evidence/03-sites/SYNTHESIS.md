# 03-sites synthesis: PvP from stats and datamine sites

Captured 2026-09-27 14:34 to 15:13 UTC. The captures are listed in `SOURCES.md`, and the structured extraction is in `../08-extract/sites.json` (its `posts` plus the top-level `usage` array). Korean cookie names follow record 001's glossary.

## What the sites can and cannot tell us

| Site | Rumble Arena (와글와글 아레나) | Arena (아레나) |
|---|---|---|
| crumb.gg | Live top-100 board with each defense (a 12-slot grid plus 3 pets), top-100 usage stats and rating history. No levels, stars, runes or gear. | Nothing: `board=arena` returns 404, and `/pub/rankings?kind=arena` falls back to the guild rankings. The site's "Arena" tab is the Rumble board. |
| crumblehub.co | No mode (`mode=rumble_arena` returns 400 Invalid mode). | 80 community-shared decks (2026-08-04 to 09-25, with votes) and 2 curated meta decks. These are shared decks, not ladder usage. |
| cookieruncrumble.app (Sugar Pocket) | Only the client strings (a `RumbleArena` stage type and the 와글와글 아레나 item names). | 4 low-vote community PvP decks. `/api/pvp-signals` is empty. `/pvp/` is a simplified simulator. The tier list and rune recommendations are general, not for PvP. |
| alkapa.gg | None. | None. The site says its option recommender is PvE only (quote below). |
| crumbleguides.com | None. | A placeholder page with no teams. |

No site publishes win rates for either mode. Every `win_rate` in `usage` is null.

## Rumble Arena (와글와글 아레나)

**Format, from the data:** 12-cookie defenses plus 3 pets. crumb.gg draws a 6-column by 2-row grid, where slot i sits in column ⌊i/2⌋+1 and row i%2+1. Column 1 is the back line: Macaron (range 7) and Oven Wanderer (5.25) sit there. Column 6 is the front: Herb (1.25) and Moon Rabbit (1). The column direction is inferred from those ranges and is not labelled by the site. Season 1 runs 2026-09-23 03:00Z to 2026-10-08 05:00Z (battles end 03:00Z). The score is a rating: #1 had 4095, #10 3473, #100 2835 at 14:33Z.

**Hidden slots.** crumb.gg: "The game hides some defenders, so not all cookies are counted." At 14:33Z, 264 of the 1,200 slots were hidden. Per team, 16 teams had nothing hidden, 3 had 1, 6 had 2, 51 had 3 and 24 had 4. A `?` is therefore unknown, not empty. The same player's revealed count changed within 5 hours: 凱凱の餅乾軍團 went from 8 to 12 and 눈의 from 9 to 8. All usage below is a lower bound.

### Cookie usage in the top 100 (crumb.gg `/pub/stats`, 14:33Z; confidence high for the counts, and each count is a lower bound)

석류 100 · 우유(소아과) 97 · 피노누아 94 · 마카롱 91 · 이온 84 · 치즈케이크 80 · 들개 75 · 달토끼(감감술래) 74 · 허브 67 · 오븐방랑자 53 · 체리콜라 50 · 바리공주 41. After those come 딸기크레페 9, 호밀 6, 포도넝쿨/락스타/피겨 3 each, 라임 2, and 바람궁수/뱀파이어/에스프레소/도넛킹 1 each. 밀키웨이 does not appear at all.

Pets: 근엄한 초코왕방울 (Majestic King Choco Drop, ally max HP +20%) 96, 갓난갓방울 (Holy Baby Drop, ally ATK +20%) 90, 핫도그도그 (Hot Doggie, ally skill AMP +10%) 84, then 얼음과자새 12, 전지멜로우 6, 색동 주머니 5, 달걀머리새 3 and others. The full set of the first three pets is on 73 of the 100 defenses.

### Usage per core (crumb.gg live board, 14:33Z)

"Confirmed" means all members are revealed. "Upper" counts teams whose hidden slots could hold the missing members.

| Core | Confirmed /100 | Upper /100 | Top-10 confirmed |
|---|---|---|---|
| Support core: 마카롱 + 피노누아 + 치즈케이크 + 석류 + 우유 | 70 | 100 | 5 |
| Tank line: 들개 + 이온 + 달토끼 | 52 | 98 | 7 |
| "Turtle 8" (support core + tank line) | 34 | 98 | 4 |
| Charge pair: 오븐방랑자 + 바리공주 | 34 | 98 | 4 |
| Charge trio: 오븐방랑자 + 바리공주 + 체리콜라 | 24 | 96 | 3 |
| 허브 | 67 | 98 | 4 |
| All twelve standard cookies | 12 | 82 | 1 |

**The top 100 run one team, not two.** The DC lane reads the board as 8–9-cookie support "turtle" defenses plus a separate Oven Wanderer + Princess Bari charge deck. The site data does not support two decks:

- Every fully revealed team (16) carries 마카롱, 피노누아, 치즈케이크, 석류, 우유, 이온 and 달토끼. 15 of those 16 also carry 오븐방랑자 and 바리공주, and 14 carry 들개, 체리콜라 and 허브.
- On 29 of the 34 teams where 오븐 and 바리 are both confirmed, at least four of the five support-core cookies are also showing.
- 82 teams contain only cookies from the standard twelve.

The "turtle" and the "charge deck" are therefore partial views of the same 12-cookie team. (Confidence: medium-high. It rests on crumb.gg's statement about hidden defenders.)

**The standard 12 and their usual slots.** Each entry reads: cookie, class, slot and share of revealed values in that slot.

| Column | Row 1 | Row 2 |
|---|---|---|
| 1 (back) | 마카롱 (Supporter), slot 0, 90/91 | 오븐방랑자 (Attacker), slot 1, 53/60 |
| 2 | 피노누아 (Supporter), slot 2, 89/90 | 치즈케이크 (Supporter), slot 3, 75/83 |
| 3 | 석류 (Supporter), slot 4, 92/99 | 바리공주 (Attacker), slot 5, 37/47 |
| 4 | 우유(소아과) (Supporter), slot 6, 69/74 | 들개 (Tanker), slot 7, 52/77 |
| 5 | 이온 (Tanker), slot 8, 56/86 | 체리콜라 (Attacker), slot 9, 47/69 |
| 6 (front) | 허브 (Supporter), slot 10, 67/86 | 달토끼 (Tanker), slot 11, 74/74 |

Some teams shift the middle one slot back, for example #4 살라딘 with 우유 in slot 7, 들개 in 8 and 이온 in 9.

**Substitutions seen** (each with its count in the top 100):

- 딸기크레페 (Tanker) 9, usually in 이온's or 허브's slot.
- 호밀 6, in 오븐's slot. This is the only Shooter.
- 포도넝쿨 3, in 바리's slot.
- 피겨여왕, 락스타 and 라임, 1 to 3 each.
- 바람궁수 (#14 돌아온어나더) and 도넛킹 (#90) once each.

### Top players' teams (14:33Z; `cp` is crumb.gg's raw combat-power value from `api.crumb.gg/api/lookup/suggest`)

Columns run from back to front, and each cell is row1/row2. Pets are listed as crumb.gg orders them.

| # | Player (guild) | Rating | cp | Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 | Pets |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 凱凱の餅乾軍團 (史萊姆遊樂區) | 4095 | 27.66e9 | 마카롱/오븐 | 피노/치케 | 석류/바리 | 우유/들개 | 이온/콜라 | 허브/달토끼 | 핫도그도그, 갓난갓방울, 초코왕방울 |
| 2 | ㄹㄹ노아 (버터쿠키바구니) | 3946 | 21.36e9 | 마카롱/? | 피노/치케 | 석류/? | 우유/들개 | 이온/? | ?/달토끼 | same three |
| 3 | 날씨의아이 (카페) | 3944 | 26.15e9 | 마카롱/? | 피노/치케 | 석류/? | 우유/들개 | 이온/? | ?/달토끼 | same three |
| 4 | 살라딘 (ShivanScimitar) | 3938 | 22.15e9 | 마카롱/? | 피노/치케 | 석류/바리 | ?/우유 | 들개/이온 | ?/달토끼 | same three |
| 5 | 군무원 (카페) | 3733 | 22.96e9 | 마카롱/? | 피노/? | 석류/? | 우유/들개 | 이온/? | 허브/달토끼 | same three |
| 6 | 검은반장 (바삭젤리단) | 3722 | 22.87e9 | 마카롱/? | 피노/치케 | 석류/**포도넝쿨** | ?/? | 우유/? | 이온/달토끼 | 핫도그도그, **얼음과자새**, 초코왕방울 |
| 7 | 코코는자는중 (밤낮) | 3630 | 26.91e9 | 마카롱/오븐 | ?/? | 석류/바리 | 우유/? | ?/콜라 | 허브/달토끼 | same three |
| 8 | 슈퍼땅콩 (각성) | 3594 | 27.94e9 | ?/오븐 | 피노/치케 | 석류/? | 우유/들개 | 이온/콜라 | ?/달토끼 | same three |
| 9 | 아키 (Carpediem) | 3587 | 23.99e9 | ?/오븐 | 피노/? | 석류/바리 | ?/들개 | 이온/콜라 | ?/달토끼 | same three |
| 10 | 눈의 (Carpediem) | 3473 | 24.15e9 | 마카롱/오븐 | 피노/? | 석류/바리 | 우유/? | ?/? | 허브/달토끼 | same three |

Ranks 11–20 are in `sites.json` (post `crumbgg-rumble-live`). Of those, #13 newbiee plays 딸기크레페 in 이온's slot and moves 이온 to column 4, and #14 plays 바람궁수 in column 1 with the whole grid shifted one slot. On this board, power does not decide rank: #13 has the highest cp in the top 20 (31.19e9) and #16 the lowest (14.20e9).

### Trends (crumb.gg live-history, 480 snapshots from 2026-09-24 06:00Z to 09-27 14:30Z)

The history rows hold only ratings, so there is no trend for teams. Ratings climbed steadily. At the first and last snapshots, #1 went from 3311 to 4089, #10 from 2854 to 3473, #50 from 2477 to 3039 and #100 from 2367 to 2835. The #1 spot was held by, in snapshot counts: 날씨의아이 181, ㄹㄹ노아 167, 타미 47, 凱凱の餅乾軍團 40, 아키 32, 코코는자는중 13. Comparing record 001's board (09:33Z) with this one (14:33Z), 6 of the 91 players present in both changed their visible grid. Most of those changes were reveal changes or a swap of one or two cookies (for example 웨더리포트 dropped 락스타 and 들개 and added 이온 and 딸기크레페).

## Arena (아레나, regular)

No site has ladder data. The only evidence is shared and curated decks, and they are mostly from August.

**crumblehub curated meta decks** (2026-08-17; confidence medium, because they are curated but a month old):

- **호밀 (Rye):** "5성 호밀맛 쿠키 필수" (requires a 5-star Rye).
  - Cookies: 바람궁수, 밀키웨이, 석류, 우유, 도넛킹, 들개, 허브, 호밀, 마카롱, 포도넝쿨, 악마, 탐험가.
  - Pets: 핫도그도그, 갓난갓방울, 근엄한 초코왕방울.
- **에스프레소 (Espresso):** "5성 에스프레소 필수".
  - Cookies: the same ten, plus 에스프레소 and 치즈케이크.
  - Pets: the same three.
- Unorthodox picks in both: 탐험가 (U rarity) and 포도넝쿨 (R rarity) are in the core.

**crumblehub shared Arena decks.** There are 80. Count of decks containing each cookie:

- 석류 70, 우유 68, 들개 67, 마카롱 61, 도넛킹 51, 바람궁수 50, 허브 50, 밀키웨이 46, 포도넝쿨 42, 치즈케이크 40.
- 피노누아 31, 탐험가 26, 호밀 26, 이온 26, 피겨 22, 에스프레소 20, 치약초코 20.

Pets: 갓난갓방울 60, 핫도그도그 40, 사바나나 사자 15, 전지멜로우 15, 근엄한 초코왕방울 14.

The most-voted decks:

- "아레나 CC기 범위 관통덱" by 기운, +127/−86, 2026-08-08.
  - Cookies: 밀키웨이, 에스프레소, 딸기쇼트케이크, 바람궁수, 들개, 마카롱, 허브, 탐험가, 석류, 도넛킹, 우유, 포도넝쿨.
  - Pets: 갓난갓방울, 사바나나 사자, 핫도그도그.
- "아레나 방관 덱 (Devil)" by S299, +23/−4.
- "5 Star Rye", +16/−1.

Decks posted since Rumble launched (2026-09-23 onwards) switch to the Rumble cookies. An example is "Sentry"/"Dive", 09-25: 바리, 석류, 도넛킹, 크림소다, 우유, 이온, 들개, 피노, 콜라, 달토끼, 마카롱, 치케, with pets 사바나나 사자, 달걀머리새, 갓난갓방울, captain slot 4 and mercenary band Lv4. crumblehub has only one PvP mode, so which mode these decks are for is unclear.

**Sugar Pocket PvP decks.** 4 decks, each with 0–2 likes, all from August. They repeat the same regular-Arena core.

## Recommended PvP runes per cookie

**No site gives PvP-specific rune advice.**

- alkapa leaves PvP out on purpose: "이 추천은 스테이지(PVE) 기준입니다. 아레나처럼 상대가 다른 사람의 쿠키인 곳은 상대 저항을 알 방법이 없어서 넣지 않았습니다." That translates as: this is PvE-based, and the Arena is excluded because the opponent's resist can't be known. It adds that for Arena-mainly cookies such as 도넛킹, players should adjust rather than follow its ranking.
- Sugar Pocket's per-cookie list is mode-agnostic and ranks rune stats by skill relevance. Its PvP-meta entries at max stars follow. "Priority" marks the site's firm pick, and "cond." marks a conditional candidate.

| Cookie | Sugar Pocket rune candidates |
|---|---|
| 우유(소아과) | **ATK (priority)**: its buffs scale with its own ATK. Skill haste (cond.) |
| 이온 | **HP (priority)**: its buffs scale with its own max HP. ATK, haste (cond.) |
| 피노누아, 달토끼 | Focus rate (cond., up to +6% per slot, helps debuffs land). ATK, haste (cond.) |
| 석류 | Skill haste only (cond.) |
| 치즈케이크 | No recommendation: the site says the evidence is insufficient |
| 마카롱, 허브, 호밀 | ATK (cond., up to +5.1% per slot) and haste (up to +3) |
| 오븐방랑자, 바리공주, 체리콜라, 들개, 바람궁수, 밀키웨이, 에스프레소 | ATK and skill haste (cond.) |
| 탐험가, 악마 | Focus rate (cond.) |

Gear and plate data for PvP: none on any site.

## Mechanics the sites state

- **The power adjustment is off in PvP.** A crumblehub stage-guide string reads "아레나 등 PvP의 해당 보정은 100%로 고정되어 있습니다": the final-damage power bracket used in PvE is fixed at 100% in PvP. Confidence medium, because it is a site statement and not checked in-game.
- **Growth that applies in the Arena.** Sugar Pocket quotes the in-game Arena guide: cookie level-ups and promotion, pet ownership effects, the encyclopedia, gear, plate enhancement and sugar runes all apply. Whether mercenary-band (용병단) captain and perk effects apply is unconfirmed.
- **Battle settings.** In the client stage table (Sugar Pocket bundle), both `Arena` and `RumbleArena` use `LastWaveAnnihilate` with a 60-second limit and attack/defense/health rates of 1.

## Where the sites disagree

- **Tier list vs Rumble usage.** Sugar Pocket's general tier list rates 체리콜라 C 52.4, 치즈케이크 C 48.3, 오븐방랑자 C 56.2, 바리공주 B 67.8 and 달토끼 B 66.4, yet each is on 41–80% of the Rumble top 100. Its S-tier 바람궁수 and 밀키웨이 are nearly absent there.
- **Regular Arena vs Rumble Arena.** The August consensus for regular Arena is built on 바람궁수, 밀키웨이, 도넛킹, 포도넝쿨 and 탐험가, with a 5-star 호밀 or 에스프레소 carry. The Rumble board is built on 오븐방랑자, 바리공주, 체리콜라, 달토끼 and 이온. The shared core is 석류, 우유, 마카롱, 들개, 허브 and 치즈케이크. It is unknown whether the gap comes from Rumble's rules or from the September releases (바리, 콜라, 달토끼), because no site has current regular-Arena data.
- **One deck or two.** See the DC lane's two-deck reading above. The crumb.gg data points to a single 12-cookie team.

## Gaps

- No levels, stars, runes, gear, plates or perks for any PvP team on any site. The only exception is crumblehub's note that the Rye and Espresso carries must be 5-star.
- No win rates and no counter data anywhere.
- No regular-Arena ladder, usage or top-player data on any stats site.
- Rumble teams are partly hidden, so per-cookie usage is a lower bound, and the history holds ratings only, with no teams over time.
- Sugar Pocket `/api/pvp-signals` is empty.
