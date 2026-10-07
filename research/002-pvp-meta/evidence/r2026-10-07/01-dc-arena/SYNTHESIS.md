# Regular Arena (아레나), DCInside projectcc: round r2026-10-07 (window 2026-09-27 to 2026-10-07)

Derived from this round's captures in `dc/` (posts and `dc/img/`). It is adapted from a same-day pre-round lane on the same post ids: every claim below was re-checked against this round's capture text and images, and corrected where the capture says otherwise. The extraction is `../08-extract/dc-arena.json`.

Every claim cites `dc:<id>`. Confidence: **H** means several independent posts or a screenshot, **M** means one good post or a consistent thread, **L** means one comment, a theory or a datamine.

Reading rules:
- Mode: `S0xxx` tags, "와글와글 아레나", anonymous `???` attackers, +175 medals and 2000+/3000+ brackets are **Rumble Arena**. "시즌 5 아레나", visible names, -2/-3/+11 trophy deltas and 40 medal + 5 silver rewards are **regular Arena**.
- Slots come only from **own** formation or "내 공격팀" screens; opponent and defense-log cards are mirrored (dc:78977 shows both sides of one deck).
- Stars are readable: yellow stars count 1-5, pink stars replace yellow above 5 (4 pink + 1 yellow = 9★). This matches the text in dc:78977 (poster's Bari and Ion one pink star above the #1's; both Ovens 5 yellow = the stated 5★) and dc:78543 (Rye 3 pink + 2 yellow = the title's 8★).

## 1. The meta in one paragraph

The top two are unchanged: **Rye one-carry vs Bari-Oven(-Cherry Cola)**. The ordering most of the gallery accepts is **well-set Bari > well-set Rye >>>> plain Bari > plain Rye** (dc:80465 thread, dc:77408, dc:80420, dc:81838; **M**). In regular Arena a Rye deck holds up to about Bari 6★ and loses from 7★ at similar spec (dc:81134, dc:77192; **M**); a Bari deck under 5★ is called junk that Rye eats (dc:80465, dc:82022; **M**). Server tops do run Bari: a #1 and #2 field the same Bari-Oven-Cherry Cola deck (dc:78977, dc:77213; **H** for the screenshots), and one server's #1 and #2 profile icons are Bari-like (dc:81572; icon only). Rye still wins some top fights (dc:78543, dc:81387; **L**). The loudest complaint is not a deck: **the attacker almost always wins**, so close rivals hoard tickets and attack last before reset (dc:78397, dc:78556, dc:79950, dc:80315, dc:81638, dc:82192; **M** as reports, no controlled test). The 10/8 notes do not touch regular Arena beyond a help-text line about merc effects (dc:82166; **H**).

## 2. What changed in the window

| Change | Evidence | Conf. |
|---|---|---|
| Still "아레나 시즌 5" on 10/2 and 10/6; Rumble Arena Season 2 opens with the 10/8 update. | dc:79971, dc:81572 screenshots; dc:82166 notice; dc:79891 leak (S2 package 10-08 to 10-21) | H |
| 10/8 notes, PvP-relevant: new SSR Chardonnay (grass, support); cookie level cap to **120**; Lv.79-100 exp cost cut with refund; free SSR Milk on day 7 of a new attendance event; "아레나 도움말 내 용병단 효과 적용에 대한 안내 문구가 추가됩니다". No balance change to existing cookies. | dc:82166 (official notice screenshot), dc:82186 (user's leak-vs-notes comparison) | H |
| **Attacker advantage.** Same decks: attacks win, defenses lose, revenges win again. Causes argued: merc perks not applied on defense (dc:81024, dc:81293), layout differs between attack and defense (dc:81304), device or seed (dc:80315, dc:78124). The in-game help lists the growth applied in Arena as cookie level-up and promotion, pet ownership effects, codex, gear, plate enhancement and sugar runes; merc perks are not in that list (dc:81024 screenshot). | dc:78397, dc:78556, dc:79950, dc:80315, dc:80901, dc:81024, dc:81134, dc:81638, dc:82192 | M (reports), L (cause) |
| **Gear: from 6 skill haste to 3 or 0.** Rye deck: lower-right DR + crit RES, keeping 3 SH up top, raised the win rate (dc:79067). Bari-Oven: 0 SH, Skill AMP + crit rate up top, DR + crit RES below (dc:78977, dc:82022, dc:82006, dc:77438, dc:76873). A gear swap from SH to Skill AMP/crit can move displayed power by ~6M (dc:81451). | dc:79067, dc:78977, dc:82022, dc:82006, dc:81451 | M |
| **Rockstar in the Rye deck** (over Espresso, Grapevine or Donut) to absorb the dive. In one Rye mirror the Rockstar version crushed a Skating + Grapevine version. | dc:77672, dc:77725, dc:80762, dc:82266, dc:81275 | M |
| **Angel for Herb** in Rye decks: Herb dies in the opening; Angel with SH + DR runes survives and casts. Its source guide is a Rumble guide, and one commenter says Angel decks blow up in regular Arena. | dc:79238 (Rumble), dc:81275, dc:81134, dc:81536 (Rumble), dc:81556, dc:81838 | L-M |
| **Pinot Noir as the real carry**: Pinot did 1,567,946 and 1,582,031 while Rye did 55K and 128K and still won vs Bari decks; Lime is used for Chain. | dc:78350 (tables, probably regular Arena), dc:77993 (Rumble, Pinot 1.73M), dc:78302 (Lime list, no numbers) | L-M |
| **Bari decks with 2 chargers + flex** (Crepe, Rye, Espresso or Rockstar) over 3 chargers. | dc:80478, dc:80630, dc:77426 | L-M |
| **Evasion decks**: a 14.38M evasion Rye deck with Vampire and Crepe beat 27.35M Bari-Oven-Cherry Cola in regular Arena; a 16.47M one beat 19.27M Rye-Seeker. But one accuracy line, an accuracy preset or a stage set breaks them, and they need focus for Vampire's debuff. | dc:80136, dc:77718, dc:77706, dc:77691, dc:77711; against: dc:78028, dc:78047, dc:79158, dc:80150, dc:81732, dc:81942 | M |
| **Sudden death**: near the time limit the banner reads "종료 임박 - 피해량이 증가합니다" (shown at 28.5 s left in a 6.92M vs 15.49M fight the poster says he can win). | dc:79971 | H (banner), L (outcome) |
| **Placement order by attack range** (left = first priority): Macaron 7; Brightseeker 6; Oven, Chardonnay 5.25; Donut King, Rye 4.75; Cheesecake, Pinot 4.25; Espresso, Grapevine, Skating, Vampire, Pomegranate 4; Adventurer 3.5; Bari 2.5; Ion, Hound, Milk, Rockstar, Lime 2; Cherry Cola, Angel, Crepe 1.5; Herb 1.25; Moon Rabbit 1. | dc:81770 | H (table), M (Arena use) |
| Partly hidden defense cards: the #1's 12-slot defense shows 8 cookies and 4 grey placeholders; ranking cards show the same (dc:78341). | dc:78977, dc:78341 | H (screenshot), cause unknown |
| A server #1 Bari-Oven-Cherry Cola defense runs Ion Lv.1, Hound Lv.1, Herb Lv.70. | dc:77213 | H (screenshot), reason unstated |

**Chardonnay.** Official: "신록의 장벽으로 직선 상의 아군에게 치명확률과 밀어내기 저항을 올려 주고 다발 시너지를 제공하며, 적에게 피해를 입힙니다" (dc:82166, no numbers). Leak: 4 s cycle, 250% ATK, wall move speed 8.5, crit rate +50%->100% per skill level, Volley 100%->200%, knockback resist 40%->60%, 5 s; skill Lv5 at 9-10 stars; receives Projectile Speed, gives Volley (dc:79685; the leak's Lv5 panel disagrees on knockback and Volley, **L**). The wall starts 3 units behind her and travels 8 in total (dc:81833 simulator). PvP talk is speculation: a forecast that Bari decks will shred Rye even at 1★ (dc:79629, **L**), "who gives Range synergy without Macaron" (dc:82179), and Projectile Speed fixing Pomegranate's beam on her (dc:80285, **L**). No measured PvP data.

## 3. Top teams

### Team A: Rye one-carry (호밀 원툴덱)

Own screens: dc:81275 (my attack team, preset 1), dc:82266 (formation, 19.51M), dc:79151 (formation, 10.17M). **M**

| Row | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| top | Macaron | Flex A: Donut King / Skating Queen / Adventurer | Cheesecake | Rockstar (dc:81275) or Adventurer (dc:82266) | Hound | Herb -> Angel |
| bottom | **Rye** | Pinot Noir | Pomegranate | Milk (captain) | Ion | Moon Rabbit |

- dc:81275: all Lv.100; Rye 8★, Pinot, Pomegranate, Milk, Ion 10★, the rest 9★. Pets Hot Doggie, Holy Baby Drop, Icy Birdie, all ★20.
- dc:82266: Pets Icy Birdie ★19, Hot Doggie ★19, Holy Baby Drop ★20; Adventurer replaces the flex; swap Donut -> Rockstar against Bari decks.
- dc:79151 is a different variant: top Macaron, Pinot, Grapevine, Milk, Ion, Herb; bottom Rye, Pomegranate, Rockstar, Hound, Crepe, Moon Rabbit; pets Hot Doggie ★20, King Choco Drop ★10, Icy Birdie ★19.
- The "standard" list in dc:81158 (Macaron, Rye, Pinot, Cheesecake, Pomegranate, Skating, Rockstar, Milk, Hound, Ion, Angel, Moon Rabbit; King Choco Drop, Hot Doggie, Icy Birdie; Passion Pay + DR 10%) is a question with no replies. **L**
- **Why it works**: in battle Rye goes from 17,905 to 146K ATK and from 89.77% to 220.53% crit (dc:77203, **H**), and Moon Rabbit's crit debuff doesn't reach Rye (dc:82097, dc:77414, dc:79629; **M**; "front line only" is an inference). Rye must rank top 3 in ATK for Pomegranate's beam; one player found it 4th behind Milk, Skating and Ion, and ATK order inside Arena differs from outside (dc:80802, dc:78195; **M**).
- **Variants**: Rye + Brightseeker + Rockstar (an 8★ Rye beat a 10★ Oven-Bari deck, mode not shown; dc:78543, dc:77725); Pinot/Lime Chain (dc:78350, dc:78302, dc:77993); evasion with Vampire and Crepe (dc:80136, dc:77718, dc:79920); Oven decoy, Rumble only (dc:81227).

### Team B: Bari-Oven-Cherry Cola (바리오방체콜)

Own screens: dc:77158 (formation, 22.14M, preset 1 "토벌") and dc:78977 (my attack team, 16.4M, preset 2). **H**

| Row | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| top | Macaron | Pinot Noir | Pomegranate | Milk (captain) | Ion | Herb |
| bottom | **Oven Wanderer** | Cheesecake | **Princess Bari** | Hound | **Cherry Cola** | Moon Rabbit |

- dc:77158: all Lv.100; Bari 7★, Oven 9★, others 9-10★; pets Hot Doggie, Holy Baby Drop, King Choco Drop ★20.
- dc:78977: all Lv.100; Oven 5★, Bari 9★, Macaron and Herb 8★, others 9-10★; pets King Choco Drop, Hot Doggie, Holy Baby Drop ★20. The #1 with the same deck (Bari 8★, Ion 9★) beat him 10/10.
- Stars: Bari 5★ is the floor; from 7-8★ it beats same-spec Rye (dc:81134, dc:77428, dc:80798, dc:82022, dc:76904; thresholds vary, **M**).
- Gear: 0 skill haste; 6 Skill AMP, 6 crit rate, 6 crit RES, 6 DR (dc:82006); aim for ~230% unbuffed crit (dc:80465, **L**).
- Variants: 2 chargers + flex (dc:80478, dc:80630, dc:77426); Skating Queen in Hound's place (an attacker in dc:80975's defense log); Rye + Brightseeker inside the Bari deck (dc:81838); Vampire instead of Cherry Cola in Rumble (dc:80759).

### Team C: Evasion deck (회피덱)

A niche attack preset, not a defense: Rye carry with Vampire (required), Crepe or Lime, about 1,300-1,400 evasion plus focus (dc:77706, dc:77711, dc:77718, dc:80136). Weak to any accuracy line and to accuracy presets that regulars bring once they recognise it, and pets give it away (dc:78028, dc:81732, dc:81942). **M**

## 4. Counter matrix

| Team | Beaten by | Why | Conditions | Sources | Conf. |
|---|---|---|---|---|---|
| Rye one-carry | Bari-Oven-Cherry Cola, Bari 7★+ | The dive kills Rye's side before sustain | Similar spec; regular Arena | dc:81134, dc:77192, dc:80465 | M |
| Bari-Oven, Bari <5★ | Rye one-carry | Failed dive, Rye's sustain | | dc:80465, dc:82022 | M |
| Bari-Oven-Cherry Cola | Evasion Rye deck (Vampire, Crepe) | Misses | Attacker has no accuracy; 14.38M vs 27.35M | dc:80136 | M |
| Evasion deck | Any team with an accuracy line or preset | Accuracy removes misses | | dc:78028, dc:81732, dc:80150 | M |
| Rye (Skating + Grapevine) | Rye (Rockstar + Crepe/Donut) | | Mirror | dc:80762 | L |
| Bari-Oven-Cherry Cola(-Crepe) | Rye deck with Pinot + Chain | Pinot finishes after Rye dies | No 10★ Bari | dc:78350 | L |
| Bari-Oven (3 chargers) | Bari-Oven (2 chargers + flex) | More value per slot | Same opponent | dc:80478 | L |
| Bari-Oven with skill-haste gear | Bari-Oven mirror, 0 SH | First hit decides | Similar power | dc:78977 | M |
| Any defense | The same deck attacking | Attacker advantage, cause unknown | Similar power | dc:78556, dc:78397, dc:79950, dc:82192 | M |

## 5. Builds

- **Gear by deck**: Rye/Seeker 3 SH on upper-right with DR + crit RES (or HP) below (dc:79067, dc:79151); Bari-Oven 0 SH (dc:78977, dc:82022, dc:82006). Holdouts: dc:81227 runs 6 SH on purpose; a stage set with crit RES and HP beat a 6-SH Arena set against Bari-Oven (dc:76954); a 0-SH Rye deck on a stage set keeps winning (dc:81791).
- **HP vs crit RES**: two crit RES lines to HP took Rye from 224K to 249K HP and flipped a 10% matchup (dc:78764, dc:78272, **L**); a commenter calculates a flat HP line at ~2.7% on a 10★ Bari (dc:77146, **L**).
- **Crit rate vs crit damage**: crit rate for Arena, crit damage for Guild Conquest (dc:80233, dc:79657, dc:82097; **M**).
- **Runes**: Angel and Lime DR + SH (+1 HP) (dc:79238, dc:81275); Rye ATK 2-3 lines, rest crit dmg (dc:79238); Pinot SH (dc:78350); Rockstar all SH asked (dc:77130). Ion's and Rockstar's shields stack (dc:77130); only Ion's transformation DR ignores Skill AMP (dc:77169, **L**).
- **Perks**: Armor Repair + Passion Pay is most common (dc:79238, dc:77711, dc:81158). Alternatives: Rapid Promotion + General Perks (dc:77094); drop Passion Pay for medical or Rapid Promotion + Armor Repair (dc:77213); 3-tank DR + General Perks (dc:81227).
- **What counts in Arena** (in-game help, dc:81024 **H**): cookie level-up and promotion, pet ownership effects, codex, gear, plate enhancement, sugar runes. Commenters add that breakthrough, fame, research and stellar link don't apply (dc:82022 **M**; dc:78263 asks it as a question). So the Lv.120 cap raises Arena power.

## 6. Disagreements

- **Rye at the top**: Bari only (dc:80465, dc:77192, dc:77408, dc:81838, dc:81913) vs Rye wins top fights (dc:78543, dc:81387, dc:80420 commenters).
- **Why defenses lose**: perks not applied on defense (dc:81024, dc:81293) vs different layout (dc:81304) vs device/seed (dc:80315, dc:78124).
- **Angel vs Herb**: Angel better (dc:79238, dc:81275, dc:81134, dc:81536) vs Angel decks blow up in regular Arena (dc:81556) and an Angel version still melted (dc:81838).
- **Rumble's common buff**: 30% DR (dc:77192 poster, dc:77426) vs 30% max HP for charge cookies (dc:77192 commenter).
- **Skill haste count**: 0, 3 or 6 by deck; dc:79067's "Bari 0, Rye/Seeker 3" reply may refer to the opponent's deck.
- **Evasion**: works as a sniping preset (dc:80136, dc:77718) vs a scam unless fully built, and broken by one accuracy line (dc:80630, dc:78028, dc:81732).
- **Bari star floor**: Oven 8★/Bari 5★ vs Oven 10★/Bari 7★ vs Bari 8★+ (dc:76904, dc:80798).

## 7. "Conquest arena"

No mode by that name exists as of 2026-10-07. Closest matches:
- **길드 토벌전 (Guild Conquest)**: guild PvE boss damage (record 001).
- **아레나**: per-server PvP, Season 5. **와글와글 아레나**: cross-server PvP, Season 2 from 10/8.
- **부스러기 쟁탈전 ("Crumb Clash", internal name Clash)**: unreleased base-building PvP. You build a base up to 20 levels, hire gummy bears from 15 kinds (tank, charge, ranged), capture strongholds and raid other bases; battles are 6 cookies plus the bear squad, 40 s max; ELO starts at 100 (constant 400, K 24); 29 tiers from Chocolate to Grand Master; defense records kept 6 days; stronghold protection 2 h; tech-room research also applies to main stage, Crumble Dungeon, daily dungeons and Impolant Tower (dc:79879 datamine, **L**). Most Clash tables are marked removed in the newest data, which the dataminer reads as a possible restart (dc:79879). A "쟁탈전" button already sits in the dungeon menu (dc:78556, dc:81041 screenshots, **H**). It is not in the 10/8 notes (dc:82166). Release timing is rumour (dc:81906, dc:80804, dc:79863). Whether it is individual or guild play is unsettled: dc:68438 says likely individual, dc:20341 calls it a guild-war genre. No guild PvP exists (dc:77793).

## 8. Open questions

1. Cause of the attacker advantage, and what the 10/8 help line says about merc perks on defense.
2. Chardonnay's real PvP effect, including whether her knockback resist blunts Crepe or Espresso (an inference, unverified).
3. Whether the Lv.120 cap and the cheaper Lv.79-100 exp reshuffle Arena power gaps.
4. Why some defense and ranking cards are hidden (dc:78977, dc:78341), and why a #1 runs Lv.1 Ion and Hound (dc:77213).
5. The Crepe-Espresso deck still has no confirmed list (dc:79368: "퇴물" per a reply).
