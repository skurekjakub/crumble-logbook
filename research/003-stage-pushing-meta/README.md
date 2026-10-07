# 003 — Stage pushing meta: main stages and the Dimensional Rift (Cookie Run: Crumble)

Status: active (started 2026-09-28; captured and curated 2026-09-28; refreshed 2026-10-03 for the Rift and 2026-10-07)

Measured on 2026-09-28 from `main`: the power gate and every stage's recommended power, accuracy and focus requirement from crumblehub's copy of game data 1.4.002; clears, teams and builds from DCInside's 쿠키런 크럼블 gallery, the official Naver cafe and KR YouTube (the top-ranked player ND러너 among them). The research changed no code. The curated dataset imports as the app's `stage` mode (`pnpm import:record 003-stage-pushing-meta`; see "What would change").

## Question

As asked: for regular stage pushing in Cookie Run: Crumble (the main story/world stages, and the new dimension stages past stage 328), what teams, levels, runes, gear and pets do KR and global players use to clear the hardest stages at the lowest power, how does play differ across stage types, elements and boss stages, and what does the power gate (권장 전투력, recommended power) do to damage?

Sharpened by the user on 2026-09-28, mid-session: stage pushing punishes a team whose total power sits below a set value with lower damage, in steps. The user wants the teams that push while that step leaves them 35% of their damage (a 65% cut) and 15% (an 85% cut), and the strategies that make it work.

As a falsifiable statement: for stage pushing there is a small documented set of teams, levels, runes, gear and pets that KR and global players use to clear the hardest stages at the lowest power, and the community sources state them precisely enough that someone with every cookie could reproduce them, including how play differs by stage type and what the recommended-power gate does to damage. In particular, sources document teams that clear at the 35% and 15% damage steps of the power gate, with the power ratio each step starts at.

## Verdict

**Supported for the 35% bracket everywhere, and for 15% in the Dimensional Rift on every boss but GingerCraven.** The gate is an exact step table from game data: 35% of damage is kept from 40% of recommended power, 15% from 20%. In the Rift, read on the power the Rift's header shows, screenshot 15% clears now cover every boss type except GingerCraven: the Werehound Princess to level 18 (29.73G), Cool Mint to level 17 (32.97G), the trucks to level 14 (28.76G) and the Cake Hounds to level 11 (18.55G), with the decks that did it written out cookie by cookie (Refresh 2026-10-07). GingerCraven, every fifth level, is cleared only at 35%. On main stages the 35% bracket reaches 328-30 at 4.00G with a reproducible deck (Brightseeker, Princess Bari and Cherry Cola around the Milk–Pomegranate–Macaron buff core); at 15% the documented clears are mob stages and one -30 Cool Mint (289-30 at 1.29G), while GingerCraven and the Redberry packs fail. The strongest reason: in both modes the pushers' 15% clears come from stacking the ATK-ordered buffs on a few dealers, and the walls they can't pass at 15% they pass by padding power across the 40% line.

## Reasoning

1. **The gate is a step function on final damage.** crumblehub's stage tool code holds the table (<10% → 1%, 10% → 5%, 20% → 15%, 40% → 35%, 60% → 55%, 80% → 75%, 100% → 100%, 120% → 120%); crumb.gg's separately datamined `stages.json` (client 1.4.002) has the same steps from 10% up and the same recommended power for every stage (`evidence/06-derived/crumbgg-comparison.json`: no differences); Sugar Pocket's stage page and the community sheet linked from dc:17487 give the same entry powers, and dc:17035 (record 001) first published the 75%/100%/120% points. It lowers only the damage your team deals, and it comes last in crumblehub's damage formula. `evidence/03-sites/crumblehub_assets_StageBossIndex-C8_ZZo3q.js`, `crumblehub_assets_formulas-B0zZ21YN.js`, `sugarpocket_stages.html`, `gsheet_dc17487_power-correction_gid1647676469.csv`; derived as `evidence/06-derived/brackets.json`.
2. **Every stage's line is known.** The recommended power, accuracy and focus requirement of each main stage and Rift level, with the entry power of every bracket, are in `evidence/06-derived/stage-table.json` and `rift-table.json` (curated per chapter in `curated/stage-chapters.json` and `curated/rift-levels.json`). At 328-30: recommended 10.00G, 35% from 4.00G, 15% from 2.00G; accuracy requirement 1,203.5, focus 1,161.5.
3. **The easing moved the lines.** Update 1.4.002 eased 169-1 to 328-30 and rebalanced the bosses of 169-1 to 248-30 (nv:44477); crumb.gg's digest puts the cut at up to 36% (328-30: 15.61G → 10.00G). Clears before 2026-09-23 were made against higher lines. `evidence/04-naver/nv/nv-44477.md`, `evidence/03-sites/crumbgg_data_patches_v5.json`.
4. **35% reaches the end, with screenshots.**

   | Stage | Boss | Team power | Bracket | Play | Evidence |
   |---|---|---|---|---|---|
   | 328-30 | GingerCraven | 4.00G | 35% | manual | dc:76835 (screenshot) |
   | 312-30 | GingerCraven | 2.74G | 35% | ? | dc:76797 (screenshot) |
   | 288-19 | Ice Cone Lancer ×5 | 1.77G | 35% | semi-auto | dc:76859 (screenshot) |
   | 280-30 | GingerCraven | 1.66G | 35% | first try | nv:46209 (screenshot) |
   | 266-30 | Cool Mint | 1.17G | 35% | auto | dc:75540 (screenshot) |
   | 301-27 | Poison Shroomer ×4 | 2.05G | 15% | manual | dc:76814 (screenshot) |
   | 271-11 | Magma Waffle Lizard ×5 | 971.8M | 15% | ? | dc:75752 (screenshot) |
   | 256-30 (pre-easing) | GingerCraven | 980M | 15% | auto | dc:71892: fail, 41% HP left after an hour |

   Before the easing the documented 35% line ran through GingerCraven from 216-30 (378M, 47.7% of recommended) to 248-30 (801.5M and 855M) and 264-30 (1.23G, 40.8%), from DCInside and the Naver cafe alike. All clears with their era, notes and sources: `curated/stage-clears.json`, built from `evidence/08-extract/dc-*.json` and `naver-*.json`.
5. **15% is a mob-stage bracket, with one boss exception.** The first round's 15% clears with screenshots are mob stages sitting just under the 40% line (0.6M and 4.4M short); the 2026-10-07 round adds 289-30 Cool Mint at 1.29G, 33.5% of recommended (dc:77874, screenshot), whose poster still can't take GingerCraven or the Redberry pack at 15%. Posters report the -10/-20/-30 bosses, the bikers, the eagle and the Redberry packs as walls at 15% (dc:77013, dc:77080, dc:67268, dc:75871); a pusher who took about 20% of GingerCraven's HP at 15% cleared it first try at 35% (dc:77154).
6. **The deck and its swaps.** The post-easing general deck and its GingerCraven variant are in `curated/decks.json` (stage-bari-cola-charge, stage-bari-coward-328); the Naver cafe's post-easing template (nv:46348) has the same fixed buffer core (Macaron, Milk, Pomegranate, Skating Queen, Cheesecake, Milk's runes all ATK) with flex slots per boss. Alongside them sit the pre-easing all-in-one deck and its per-boss swaps (dc:70308) and the pre-easing GingerCraven 35% deck (dc:72776) as the documented low-power lines. ND러너's videos confirm the swaps: Panda Dumpling for launch bosses, Jungle Warrior and Rye for Redberry, Wind Archer or Scorpion for GingerCraven (`evidence/08-extract/youtube.json`).
7. **Stage types are predictable.** From chapter 169 every chapter repeats one of eight zone layouts with fixed boss slots (zone = ((chapter − 1) mod 8) + 1), derived from the game data in `evidence/06-derived/zone-cycle.json`; the plan per slot is `curated/stage-zones.json`.
8. **Power is padded, accuracy is capped.** Displayed power sets the bracket, so stage gear is rolled for power, SSR rune lines that add power are kept until the Rift, and a guild's bonus counts (dc:67596, dc:76290, yt:1AyEMtaE-s4). Accuracy requirements stop rising at 1,203.5; pushers call 900–1,000 enough after the easing (dc:75381, yt:BDuQ279mbP4). `curated/gear.json`, `curated/runes.json`.
9. **The Rift's gate is read on Rift power, and only GingerCraven needs 35%.** (First written as "a 35% fight at every level"; the 2026-10-03 round found 15% clears on Rift power, see Refresh 2026-10-03.) Its recommended power runs from 10.00G to about 1,800G over season 1's levels; a Rift-only level (차원의 힘) fills while you are in it and inflates power and stats there. The gate applies (dc:76525, dc:76678, dc:77015; ND러너 at yt:1AyEMtaE-s4 [1:50:35]); only dc:77090 felt no penalty. Rules and reported bosses: `curated/mechanics.json`, `curated/rift-bosses.json`.
10. **What the shared decks use.** Among crumblehub's user-shared clear decks for stage 169-1 or later, Pomegranate and Milk are in every deck, Macaron, Herb and Skating Queen in over 90%, and Brightseeker in 80%; Gold Drop Jr. and Hot Doggie lead the pets. Most of these decks predate the easing and Princess Bari. `evidence/06-derived/clear-deck-usage.json`, `curated/usage.json`.

## The steelman

*The case for pushing bosses at 15%:* the gate cuts only your damage, not the boss's, so a long enough fight is a matter of survival and retries; unattended boss retry exists; a server's #1 was said to push at 15%; and one poster claims 328-30 at about 3G with high-star Bari and Cherry Cola (dc:76779).

*Answer:* the claims have no screenshots, and the measured attempts don't support them: a pre-easing 15% run at 289-4 (a Cake Hound pack) timed out with the pack at 2%, 2M under the 35% line (nv:44742, screenshot); the best documented 15% GingerCraven attempt left 41% HP after an hour (dc:71892), boss fights are timed (the 289-4 screenshot ends at 0.000; the Rift's level-100 fight has a 30 s limit, dc:73646), and the gap between 15% and 35% is a 2.3× damage multiplier that padding a few million power buys outright, as both 15% mob clears show. Retrying at 15% is dominated by crossing the line.

*The case for accuracy and focus over power:* before the easing, pushers reported broken clears when accuracy fell (dc:68826) and planned gear around the requirement.

*Answer:* that held when accuracy requirements were near 1,200 and 35% lines were tight; after the easing players report 900 as enough to 328 (dc:75381) and damage, not misses, as the reason clears fail (dc:76752). It still applies to debuffers (focus) and in the Rift, where the calculator's accuracy and focus climb and ND러너 runs about 1,000.

## Recommendation

- **In the Rift, push every boss but GingerCraven at 15% with the Milk-first decks, to about level 18 on screenshots (it stalls by 28, dc:80706), and park at GingerCraven until 차원의 힘 reaches its 35% line.** The decks, best clear first, are in Refresh 2026-10-07; every attempt is in `curated/rift-clears.json`.
- **On main stages, push at 35% with the Bari–Cherry Cola–Brightseeker deck (or the Witchberry auto deck on mob stages), swap per boss slot, and use 15% only on mob stages and Cool Mint.** Before GingerCraven or a Redberry pack at 15%, pad displayed power across the 40% line instead: power gear preset, SSR power runes, guild. The per-chapter lines are in `curated/stage-chapters.json`.
- **For the user's account:** a stage preset showing about 2.2G sits at 55% to 288-3, 35% to 304-19, and 15% everywhere to 328-30 (computed from `evidence/06-derived/stage-table.json`); a power-rolled stage preset usually shows more than the conquest preset. Reaching 328-30 at 35% needs 4.00G, and entering the Rift early compounds 차원의 힘.
- Open sub-choice: auto versus manual at 35%. Recommendation: auto with boss auto-summon on mob stages and Cool Mint; manual for GingerCraven, the bikers and the Redberry packs.

## What would change (a map)

For the app lane; this record changed nothing outside its folder.

- `packages/schema/src/enums.ts:47` `GAME_MODE`: add `"stage"` (import.json's `record.mode` is `"stage"`, every curated row states `mode: "stage"`). `GEAR_CONTEXT` already has `"stage"`.
- `apps/web/src/app/modes.ts` (now under `app/modes/` per commit 29688f5): a stage section.
- New collections for the table-shaped curated files, with their seed schemas in `apps/server/src/importers/seed/schema.ts` and tables in `packages/schema`: `stage-chapters.json` (chapter rows), `rift-levels.json` (level rows plus season groups), `stage-zones.json` (zone × boss slot × plan × deck id), `stage-clears.json` (clears with stage, boss, power, bracket, result, play, evidence, deck id, sources), `rift-bosses.json`. Since imported: `curated/manifest.json` lists them, and the importer loads them as the stage tables.
- A calculator view: team power in, bracket per stage out (the reach presets at 75%/55%/35% in crumblehub's tool code are the model).

## Side findings

- **Media is local-only now.** The images and video frames under `evidence/` are gitignored since the user's change of 2026-09-28; their `captures.jsonl` lines keep their hashes. The frame transcription is committed as `evidence/08-extract/youtube-frames.json`.
- **OPEN-QUESTIONS.md numbers the simulator calibration data "record 003"** (the grounding report, `evidence/01-repo-grounding/report.md`, flags it); this record took 003. Follow-up for the user: renumber that plan to the next free record.
- **crumblehub's clear-deck API marks empty slots with -1.** Any scraper mapping ids by index must guard it; this record's first derivation read every empty pet slot as the Rift pet (fixed in `evidence/06-derived/derive_stage_data.py`). Consciously dropped as a follow-up: the app has no crumblehub scraper yet.

## Refresh 2026-10-07

Window: 2026-10-03 to 2026-10-07 for the Rift (the 10-03 round covered it to there) and 2026-09-28 to 2026-10-07 for the main stages. Patches in it: none that changed a stage, the Rift's numbers or a cookie. The official patch-notes board's 10-01/10-02 notes (nv:48486, captured in the 10-03 round) cover the oven's auto-open and dungeons (`evidence/r2026-10-07/04-naver/list-naver-patch-notes.tsv`). crumb.gg's patch digest, which answered 200 this round, adds an undated 1.4 hotfix that raised Cool Mint's Rift HP from 800 to 900 (`evidence/r2026-10-07/03-sites/data-patches.json`); with no date it re-files nothing. Update 1.5.002 lands on 2026-10-08, after the window (nv:50417): see "What would change". The captures are in `evidence/r2026-10-07/`, the extractions in its `08-extract/`.

### The Rift 15% push teams

Ranked by the highest level each has cleared at 15% with the Rift's header power on screen, lowest power first at the same level, as the app's Rift view orders them. Every cookie's level, slot and why, the pets, perks and substitutions are in `curated/decks.json`; every attempt is in `curated/rift-clears.json`.

| Deck | Best 15% clear | Its other 15% clears | Evidence |
|---|---|---|---|
| `rift-15-levelled-rye` (10-03 round) | level 18 Werehound Princess, 29.73G (29.0%) | [^l19] | dc:78865 |
| `rift-15-milk-first-seeker` (new) | level 17 Cool Mint, 32.97G (35.2%) | trucks: level 14 at 28.76G (39.6%), level 9 at 16.07G (38.0%), level 4 at 7.34G (37.8%) | `05-youtube/frames/kMw3e-05m34.0s.jpg`, `kMw3e-03m09.0s.jpg`, `IAFNe-03m22.0s.jpg`, `z9nK-00m30.0s.jpg` |
| `rift-15-bari-scorpion` (10-03 round) | level 12 Cool Mint, 18.40G (31.2%) | level 8 Werehound Princess at 12.15G | dc:78353, dc:77709 |
| `rift-15-milk-first-mobs` (new) | level 12 Cool Mint, 18.55G (31.5%) | level 11 Cake Hounds at 18.55G (34.6%); with Wind Archer, levels 6 and 7 at 10.23G | `kMw3e-01m40.0s.jpg`, `kMw3e-00m53.0s.jpg`, `IAFNe-00m58.0s.jpg`, `IAFNe-01m48.0s.jpg` |
| `rift-15-devil-shred` (10-03 round) | level 12 Cool Mint, 20.45G (34.7%) | | dc:77612 |
| `rift-15-milk-first-hammer` (new) | level 8 Werehound Princess, 13.84G (37.2%) | | `IAFNe-02m36.0s.jpg` |
| no deck: 머핀이's all-Lv.100 shred line | level 7 Cool Mint, 11.20G (35.1%) | | `04-naver/nv/img/nv-50328-1.jpg` |

[^l19]: 롤로노아's L19/L23 trucks (nv:48662): claimed at 15%, lobby power only, no bracket.

The new decks are 그니's (Rift rank about 210th-280th, lobby 4.5-5.0G), from his level 6-10 and 11-20 guides (yt:IAFNvjeqUqw, yt:kMw3E6KXUAo). His `rift-15-milk-first-seeker`, by slot (row 1 then row 2): Macaron 100, Rye 88, Cheesecake 100, Skating Queen 100, Tiger Lily 96, Strawberry Crepe 82; Brightseeker 100, Pinot Noir 82, Pomegranate 100, Princess Bari 100, Milk (captain) 100, Cherry Cola 80. Its trucks variant takes Witchberry at 80 for Cherry Cola; Rye is 88 (77–91 on trucks). Stars weren't legible on his screens. His deck rule: Milk captains and tops the on-screen attack order (posted), so both perks (열정페이, 초고속승진) land on her, with the buffers and the main dealer below her. Mid dealers sit at 77–97, read as 렙따 (inferred, dc:80625), the 10-03 round's levelled-Rye idea. The overlay names a top six, but a cut there is inferred too and isn't strict: Rye is Lv.100 and outside the overlay at levels 6-7 (`IAFN-00m32.0s.jpg`), and Pomegranate is Lv.100 and outside the six in every 그니 deck. For Cool Mint and the Werehound Princess, which launch, the third pet is an airborne-resist pouch; GingerCraven gets Octo Wasabi. GingerCraven itself is `rift-35-gingercraven-wasabi`: cleared at 35% at levels 10, 15 and 20 (49.31G, 41.9%, `kMw3f-08m05.0s.jpg`), never at 15%.

### Reasoning

1. **The new 15% clears are read off the header, with the result on screen.** Each row above shows the in-Rift header power and the boss at 0.000% or the clear banner (`05-youtube/frames/`, `04-naver/nv/img/nv-50328-1.jpg`); the bracket is that power ÷ the level's recommended power in `curated/rift-levels.json`. 그니's lobby power stays at 4.67-5.02G while his header climbs from 18.55G to 49.31G between sessions, the 차원의 힘 growth the 10-03 round described.
2. **Every boss but GingerCraven now has a 15% screenshot.** The Cake Hounds and the trucks, claimed but not shown on 10-03, are shown (levels 11 and 14). GingerCraven, in every screenshot, is cleared at 35% (그니 at levels 5, 10, 15 and 20); DC's posters run the same loop: 15% on the other bosses with the conquest gear set, then park and idle at GingerCraven (dc:80812, dc:80625).
3. **The field outran the 15% data.** crumb.gg's Rift board on 10-07 has the leaders at level 54 and rank 100 at level 37 (`06-derived/rift-ranking-2026-10-07.tsv`), but no 15% screenshot passes level 18; at level 28 the 15% attempts stall around 20% of the Werehound Princess's HP (dc:80706, text).
4. **Main stages.** 289-30 Cool Mint fell at 15% (dc:77874). The 35% line runs through GingerCraven at 40-49% of recommended from 299-30 to 328-30 with screenshots (nv:47338, nv:47585, nv:49008, nv:49276, nv:48211, dc:82411, nv:49540), the same picture as the first round. The Witchberry auto deck (`stage-witch-idle`, now with Rockstar) is the round's stage deck for mob stages (dc:78074, dc:78081); the extraction is `08-extract/dc-stage.json` and `naver.json`.

### What would change (10-08, update 1.5.002; a map, not this round's data)

- **Level cap 100 → 120** (nv:50417): team power rises, by about +25% at Lv.119 on a leaked table (dc:82104, dc:79865), so every preset reaches further on the same stage and Rift lines. The existing stages' recommended power doesn't change (`03-sites/data-stages_v15.json`, `06-derived/crumbgg-diff-r2026-10-07.json`).
- **Stages to 364-30**: 329-1 at 10.01G to 364-30 at 24.20G, whose 35% line is 9.68G (`data-stages_v15.json`). A comment on nv:50417 says entering Rift season 2 needs 364-30 cleared; unconfirmed.
- **Main-stage boss fights**: the adds that come with a boss get lower ATK than the boss (nv:50417). Clears after 10-08 aren't comparable with this round's, so they need a new stage era.
- **Rift season 2**: on the 1.5.002 data its recommended power is about 1.448× the 1.4.002 values `curated/rift-levels.json` holds for levels 101-200 (level 101: 16.72G → 24.20G), and its cycle has six bosses, with Well-Aged Archangel (숙성의 대천사) at 105, 111, … and GingerCraven every sixth level (`03-sites/data-rift_v15.json`). Level-clear rewards add syrup ore, SSR select boxes and speed-ups (nv:50417, dc:82279).
- **Chardonnay** (SSR Grass support): crit rate and knockback resistance on a line of allies; knockback is what breaks a 15% truck formation (dc:78865), so it may enter the truck decks.

### Changelog

| Change | Recommendation | Evidence |
|---|---|---|
| added | deck `rift-15-milk-first-seeker`, Rift Milk-first Brightseeker deck (15%) | `evidence/r2026-10-07/05-youtube/yt-kMw3E6KXUAo.txt`, `frames/kMw3e-05m34.0s.jpg`, `frames/kMw3e-03m09.0s.jpg` |
| added | deck `rift-15-milk-first-mobs`, Rift Milk-first mob deck (15%) | `evidence/r2026-10-07/05-youtube/frames/kMw3e-01m40.0s.jpg`, `frames/IAFNe-00m58.0s.jpg` |
| added | deck `rift-15-milk-first-hammer`, Rift Milk-first Werehound deck (15%) | `evidence/r2026-10-07/05-youtube/frames/IAFNe-02m36.0s.jpg` |
| added | deck `rift-35-gingercraven-wasabi`, Rift GingerCraven Wasabi deck (35%) | `evidence/r2026-10-07/05-youtube/frames/kMw3f-08m05.0s.jpg`, `yt-lyctKWAZdYI.txt` |
| added | `curated/rift-clears.json`: 그니's 15% and 35% clears of levels 4-20, 머핀이's level 7, stanley's and 앙파's 35% clears, and the attempts that bound them (levels 6, 20, 28, 30) | `evidence/r2026-10-07/08-extract/youtube.json`, `naver.json`, `dc-rift.json` |
| added | `curated/stage-clears.json`: 289-30 Cool Mint at 15%, GingerCraven at 35% from 235-30 to 328-30, 237-1, and the 320-30 and 318-10 failures | `evidence/r2026-10-07/02-dc/dc/77874.md`, `04-naver/nv/nv-49540.md`, `08-extract/dc-stage.json`, `naver.json` |
| changed | deck `stage-witch-idle`: Rockstar in Herb's slot, the ceiling (auto past 300 at 35%, 324-18 at 3.75G) and the pet and Bari-deck swaps | `evidence/r2026-10-07/02-dc/dc/78074.md`, `dc/78081.md`, `dc/77654.md` |
| changed | `curated/rift-bosses.json`: the bosses of levels 7, 13, 16, 17, 28 and 30 | `evidence/r2026-10-07/08-extract/youtube.json`, `dc-rift.json` |
| changed | `curated/takeaways.json` and `mechanics.json`: the Rift line (every boss but GingerCraven at 15%, to about level 18), 289-30 in the 15% stage line, Rift gear readings, 차원의 힘's pace and the Cool Mint HP hotfix | `evidence/r2026-10-07/03-sites/data-patches.json`, `02-dc/dc/81032.md`, `dc/81393.md` |
| changed | `curated/meta.json`: season, caveat, slots note and the Rift advice | this section |
| re-captured | web:crumbgg-rift: boss names now the game's own, every number unchanged; rows curated from the earlier text | `evidence/r2026-10-07/03-sites/data-rift.json`, earlier `evidence/r2026-10-03/03-sites/data-rift.json` |
| re-captured | web:crumbgg-patches: answers 200 (not 404), with the 1.5.002 entry and the 1.4 hotfix | `evidence/r2026-10-07/03-sites/data-patches.json`, earlier `evidence/03-sites/crumbgg_data_patches_v5.json` |

No recommendation was marked obsolete. The new decks overlap the 10-03 ones: level 12 Cool Mint (`rift-15-milk-first-mobs` at 18.55G, `rift-15-bari-scorpion` at 18.40G, `rift-15-devil-shred` at 20.45G), level 8 Werehound Princess (`rift-15-milk-first-hammer` at 13.84G, `rift-15-bari-scorpion` at 12.15G) and level 11 Cake Hounds (`rift-15-milk-first-mobs` against `rift-15-mob-witchberry`'s unverified mid-fight screenshot). At the same level the score is the same, and the higher levels the new decks reach came with more 차원의 힘, so none beats an old deck in the same boss slot. `rift-15-mob-witchberry` is the borderline case: it has no accepted clear of its own.

### Unconfirmed this round

No new source named `rift-shred`, `rift-15-devil-shred`, `rift-15-bari-scorpion`, `rift-15-mob-witchberry` or `rift-15-levelled-rye` (the DC Rift listings in `02-dc/list-dc-*.tsv` and the YouTube and Naver searches); DC comments describe their levelled-down Scorpion, Dark Choco and Devil stacking in general (dc:80625). On main stages the Bari charge deck appears as a split beside the Witchberry deck (dc:78074) and GingerCraven decks keep the Scorpion core (dc:82287), but no source in the round names `stage-seeker-allinone`, `stage-coward-35` or `stage-aoe-rapidfire`. All stay current.

### Couldn't settle

- The 차원의 힘 level behind 그니's clears: his header shows 축복 Lv.6, not 차원의 힘. A screen with both would settle it.
- When 그니 played them: the on-screen season countdown puts levels 4-17 at about 09-28 to 10-02, before this round's Rift window; the videos went up on 10-04 and 10-05.
- Some pets on 그니's screens (a yellow 20★ pet, a red-brown 20★ pet); whether his 복주머니 is 색동 주머니.
- The yellow-haired Lv.100 cookie in 그니's level-15 and -20 GingerCraven copies (the last card in `kMw3f-08m05.0s.jpg`) may be Moon Rabbit (감감술래 놀이 달토끼맛 쿠키), low confidence: its rabbit-eared, cherry-bowed portrait (`kMw3-07m12.0s.jpg`) and Grass defense card match 머핀이's row 2 slot 6 in `04-naver/nv/img/nv-50328-2.jpg`, which that round's extraction reads as Moon Rabbit.
- A boss-HP table from an unnamed site (dc:80968) claims big Rift HP raises next patch (Cake Hounds +478%); crumb.gg's 1.5.002 data shows 0.7-1.4% boss HP changes. Season 2's first clears will settle it.
- The level cap: 150 in a leak (dc:79865), 120 in the patch notes (nv:50417).
- The date the Cool Mint Rift HP hotfix went live.
- Naver articles that need a login (50068, 49886, 50302, 49380, 49332), listed in `04-naver/nv/`.

## Refresh 2026-10-03: Rift at 15%

A focused round on one question, not a full refresh: the user asked for the teams that clear Dimensional Rift levels at the 15% bracket. Window: 2026-09-23 (the Rift's opening) to 2026-10-03, for the Rift only; the main-stage saved searches weren't rerun for their own sake, so the next full refresh starts its main-stage window at 2026-09-28, not at this heading's date (also in `todo.md`). Patches in it: none (the official patch-notes board lists nothing after nv:44477, `evidence/r2026-10-03/04-naver/list-naver-patch-notes.tsv`). The captures are in `evidence/r2026-10-03/` and the extractions in its `08-extract/`.

**Question, falsifiable.** Rift levels are documented cleared at the 15% bracket (Rift power from 20% to under 40% of the level's recommended power), with the team, the power and a result screen, on more than one boss.

**Verdict: supported, up to level 18, for the Werehound Princess and Cool Mint; claimed but not shown for the Cake Hounds and the trucks; not for GingerCraven.** Screenshot clears at 15% on Rift power: level 18 Werehound Princess at 29.73G (29.0%, dc:78865), level 12 Cool Mint at 20.45G and 18.40G (34.7% and 31.2%, dc:77612, dc:78353), level 8 Werehound Princess at 12.15G (32.6%, dc:77709). The Cake Hound screenshot stops mid-fight with the pack at 4% (level 11, dc:78353); the truck levels rest on text claims (dc:78164, dc:79406) and the one truck screenshot is a failure with 6% HP left (level 14, dc:78412). GingerCraven, every fifth level, is a 35% fight: the screenshot attempt at level 15 left 62% HP at 28.9% (dc:76997), and every poster who tried it at 15% failed or calls it impossible. The strongest reason the verdict holds: the bracket is read off the Rift's own header power, and the screenshots show it.

### Reasoning

1. **The Rift uses the main stages' damage table.** crumb.gg's Rift data (client 1.4.002) has `dmg` 10% → 5, 20% → 15, 40% → 35, 60% → 55, 80% → 75, 100% → 100, 120% → 120 (`evidence/r2026-10-03/03-sites/data-rift.json`), the table Reasoning 1 gives for stages. So a level's 15% line is 20% of its recommended power in `curated/rift-levels.json`.
2. **The bracket reads the power the Rift shows, with 차원의 힘 in it; formation-screen power doesn't count.** 서신우 gives each level's line "on the Rift's basis" as 5.167G, 6.39G and 7.776G, exactly the 35% lines of levels 2-4 (nv:49183, nv:49192, nv:49254; his subtitles in yt:In-nfQKm21g and yt:WmEItY7JYtE). Consistent with it, players at 17G (dc:78242) and 17.2G (a comment on dc:78353) deal no damage to level-10 GingerCraven, whose 35% line is 18.76G; neither names the power, and 17G is read as Rift power because no lobby power in this round's sources comes near it (the round's lobby figures run about 4-6.4G). The header equals lobby power at 차원의 힘 Lv.1 (서신우 at 4G 153M 598K, `05-youtube/frames/51Mk-02m57.0s.jpg`; dc:80338) and grows with it: 카린, who entered at 4.00G, shows 12.15G at level 8 and 18.40G at level 12; one player shows 63.23G at 차원의 힘 Lv.19 against about 6.4G of stage power (dc:78225). This corrects Reasoning 9's "a 35% fight at every level": that holds for GingerCraven, not for the Rift as a whole. By the user's rule, a source that shows only formation-screen power has no Rift bracket, so 서신우's level 2-4 guides (4.14-4.28G on the formation screen, most likely 35% clears on Rift power by his own words) and 롤로노아's level-19 and -23 trucks (4.3G formation screen, nv:48662) are strategy sources here, not 15% clears.
3. **차원의 힘 is what makes 15% reachable.** Its levels add about 10% ATK, DEF and HP each, plus crit damage, crit rate, focus and accuracy (Lv.2: +10/10/10%, +30%, +10%, +5%, +10%; `data-rift.json`, matching 서신우's screen in `05-youtube/frames/51Mk-03m45.0s.jpg`). It fills only through the Rift idle reward, at the level reached per minute (`data-rift.json` `idle`; dc:78283; 서신우's idle screen at level 2, "1분 당 2개"). The posters climb by twisting (비틀기) the levels between GingerCraven levels at 15%, then park at GingerCraven until 차원의 힘 lifts their Rift power over its 35% line (dc:80294 comments, dc:80225 comments, dc:77620).
4. **The 15% teams** are the `rift-15-*` decks in `curated/decks.json`, each with its levels, whys and the clears it backs; the furthest, `rift-15-levelled-rye` (dc:78865), levels the cookies that mustn't take the ATK-ordered buffs down to 64-70 so the buffs pile on the dealers, as in Guild Conquest. Every attempt with its standing is in `curated/rift-clears.json`.
5. **How far the field is.** The all-server Rift ranking on 2026-10-03 had the top two at level 39 and #100 at level 22 (dc:80056, screenshot). No 15% clear past level 18 has a screenshot; a text claim takes every level to 19 at 15% at 차원의 힘 Lv.14 (dc:79406).

### The steelman

*The case that 15% in the Rift is a mirage:* every 15% clear comes from an early, heavily invested account (Lv.188-191, ranked in the Rift's top 100) whose Rift power had already been multiplied by 차원의 힘, so "15%" there means a team far stronger than its bracket suggests; a newcomer entering on 2026-10-03 with a 3★ Bari couldn't get the Werehound Princess under 36% HP at 15% (dc:80390).

*Answer:* the first half is right and is the point: 15% is reached by building 차원의 힘, not by under-powering a fresh team. The bracket is still the measure the game applies, and the screenshots show those teams dealing the 15% share and winning. The newcomer's failure is a 차원의 힘 Lv.1-2 account against a level whose 15% line it barely crossed; the remedy the posters give is one more 차원의 힘 level (dc:80390 comments).

### Recommendation

- **Read your Rift bracket off the Rift's header power only.** 15% from 20% of the level's recommended power (`curated/rift-levels.json` lists `power_for_15`), 35% from 40%.
- **Twist the levels between GingerCraven levels at 15%, and park on each GingerCraven level** until 차원의 힘 lifts you to its 35% line. The decks and the bosses each one cleared are the `rift-15-*` entries of `curated/decks.json`; the truck levels at 15% rest on text claims, so expect to need a 차원의 힘 level more there (bring a knockback pet, dc:78865).
- **For the user's account (about 2.2G lobby):** the Rift opens at 328-30, whose 35% line is 4.00G; at 2.2G that fight is at 15%, where no main-stage boss clear is documented. Once inside, at 차원의 힘 Lv.1 the header is the lobby power, so 2.2G is 22.0% of level 1's 10.00G (15%), and level 2's 15% line is 2.58G; 차원의 힘 Lv.2 needs 30 XP, half an hour of idling at level 1 by `data-rift.json`. No source in this round entered the Rift under 4.0G, so how far 15% carries a 2.2G entrant is unmeasured.

### Changelog

| Change | Recommendation | Evidence |
|---|---|---|
| added | deck `rift-15-levelled-rye`, Rift levelled Rye deck (15%) | `evidence/r2026-10-03/02-dc/dc/78865.md`, `04-naver/nv/nv-48662.md` |
| added | deck `rift-15-devil-shred`, Rift Devil DEF-shred deck (15%) | `evidence/r2026-10-03/02-dc/dc/77612.md` |
| added | deck `rift-15-bari-scorpion`, Rift Bari–Scorpion deck (15%) | `evidence/r2026-10-03/02-dc/dc/77709.md`, `dc/78353.md` |
| added | deck `rift-15-mob-witchberry`, Rift mob-level Witchberry–Rockstar deck (15%) | `evidence/r2026-10-03/02-dc/dc/78353.md`, `dc/77572.md`, `dc/78199.md` |
| added | `curated/rift-clears.json`, the Rift attempts at 15% and their bounds | `evidence/r2026-10-03/08-extract/` |
| changed | `curated/rift-bosses.json`: the bosses of the levels this round's sources name, and the five-level cycle | `evidence/r2026-10-03/08-extract/dc-rift15.json`, `youtube-rift15.json` |
| changed | `curated/meta.json`: caveat and the Rift advice for the user's account | this section |

### Unconfirmed this round

`rift-shred` (the partial shred deck of the first round) wasn't contradicted; `rift-15-devil-shred` is its documented full form, and it stays current. No main-stage recommendation was in scope.

### Couldn't settle

- The 차원의 힘 level behind each screenshot clear: battle screens don't show it. A post showing the Rift profile header and the 차원의 힘 level beside a clear would.
- Whether the game itself names the header figure as the gate's input: every bracket and every stall just under a line fits it, but no source quotes the game.
- 롤로노아's level-23 truck (nv:48662) against the five-level boss cycle every screenshot fits (level 23 would be the Werehound Princess).
- ND러너's level-34 stream (yt:RFwK4e4tu9I) at 480p: the header power isn't legible, so it gave no data point.
- Other sources came back empty for the Rift: arca.live's Cookie Run channel, keyword searches and its listing back to 2026-09-22 (`03-sites/arca_cookierun_*.tsv`); Reddit's Crumble subreddit (`03-sites/reddit_cookieruncrumble_search_rift.txt`); Namu Wiki, which has no Rift article and blocked the session at Cloudflare; Naver's free board, whose articles need a login (`04-naver/list-naver-free-board.tsv`).

## Sources

Every cited id is in `curated/sources.json` with its URL. The ones that settled the question:

- https://crumblehub.co/stages and https://crumblehub.co/assets/StageBossIndex-C8_ZZo3q.js — the bracket table, per-stage recommended power, accuracy and focus requirements, Rift levels (game data 1.4.002).
- https://crumblehub.co/data/stage-boss-index-v2.json — every stage's boss.
- https://crumb.gg/data/stages.json and https://crumb.gg/data/patches.json?v=5 — an independent datamine of the same brackets and powers, and the 9/23 patch figures.
- https://crumblehub.co/api/clear-decks?mode=stage — shared clear decks.
- https://cookieruncrumble.app/stages/ — the same brackets, independently.
- https://cafe.naver.com/ccrumble/44477 — the 2026-09-23 patch note: the easing and the Rift.
- https://m.dcinside.com/board/projectcc/76835, /76797, /76814, /75752, /75540, /71892, /70308, /72776, /77015 — the clears, failures, decks and Rift tech.
- https://www.youtube.com/watch?v=1AyEMtaE-s4, BDuQ279mbP4, tZJ5wzhcUA8, _d_7z1UD2p8 — ND러너 on the Rift, power and stage presets.
- https://www.pocketgamer.com/cookierun-crumble/new-update-sept-2026/ — press corroboration of the Rift's opening date.
- https://crumb.gg/data/rift.json — the Rift's damage table, 차원의 힘 levels, idle gain and seasons (refresh 2026-10-03).
- https://m.dcinside.com/board/projectcc/78865, /77612, /78353, /77709, /76997, /78242, /78283, /78225, /80056 — the Rift's 15% clears and failures, the power basis and the ranking (refresh 2026-10-03).
- https://cafe.naver.com/ccrumble/48662, /48025, /49183, /49192, /49254 — the levelled truck deck and 서신우's lines "on the Rift's basis" (refresh 2026-10-03).
- https://www.youtube.com/watch?v=51MkrIh2vJY, hx9Y_5HpSps, In-nfQKm21g, WmEItY7JYtE — 서신우's Rift entry and level 2-4 guides (refresh 2026-10-03).
- https://www.youtube.com/watch?v=kMw3E6KXUAo, IAFNvjeqUqw, z9nKY8Z7Ius, NEmo5DDllPI — 그니's Rift decks and header-power clears of levels 4-20, the Milk-first 15% decks (refresh 2026-10-07).
- https://www.youtube.com/watch?v=lyctKWAZdYI, uk9BbWZXnWY — 서신우's GingerCraven deck and stanley's 35% clears (refresh 2026-10-07).
- https://cafe.naver.com/ccrumble/50328 — 머핀이's level-7 Cool Mint at 15% (refresh 2026-10-07).
- https://cafe.naver.com/ccrumble/50417 — the 10-08 patch notes: level cap 120, stages to 364-30, Rift season 2 rewards, Chardonnay (refresh 2026-10-07).
- https://cafe.naver.com/ccrumble/49540, /49276, /49008, /48211, /47585, /47338 — post-easing GingerCraven clears at 35% from 299-30 to 328-30 (refresh 2026-10-07).
- https://m.dcinside.com/board/projectcc/77874, /80812, /80625, /80706, /81198, /78074, /78081 — 289-30 Cool Mint at 15%, the Rift's 15% loop and stalls, the Witchberry auto deck (refresh 2026-10-07).
- https://crumb.gg/pub/live?board=dimension_stage, https://crumb.gg/data/patches.json, /data/rift_v15.json, /data/stages_v15.json — the Rift ranking, the 1.5.002 patch digest and the 10-08 client's Rift and stage data (refresh 2026-10-07).

## Files

- `research-trail.md`: the web rounds.
- `import.json`: the importer manifest (record mode `stage`).
- `curated/`: the dataset; `manifest.json` lists every collection the app imports, the stage-mode tables among them. `power-brackets.json` copies the bracket table from `evidence/06-derived/brackets.json` with its sources, for the app's bracket calculator. For the app's clears ranking and Rift page, `stage-clears.json` also states whether this README accepts each attempt (`standing`) and a boss's English where the stage tables lack it, `rift-levels.json` the stage that opens the Rift with its sources, and `mechanics.json` the further topics a mechanic bears on (`also_topics`); the `about` of the clears and Rift files says where their additions come from.
- `evidence/captures.jsonl`: one line per evidence file (path, url, time, tool, sha256), written when the file is captured and never rewritten; a path has exactly one line, and a second one fails `pnpm verify`. New captures get their line from `pnpm capture` (a scraper, or `pnpm capture log`).
- `evidence/01-repo-grounding/report.md`: what records 001/002 already held, quoted with file:line.
- `evidence/02-dc/`: DCInside search listings (`01-list-stage.tsv`, `02-list-targeted.tsv`) and posts with comments (`dc/`).
- `evidence/03-sites/`: crumblehub, Sugar Pocket, alkapa, the power-correction sheet and press pages; `SOURCES.md` describes each.
- `evidence/04-naver/`: the Naver cafe board listings and posts (`nv/`), including the patch notes.
- `evidence/05-youtube/`: video metadata and Korean captions; `frames/` (local only) holds stills from yt:RLuI96lGgGg.
- `evidence/06-derived/`: tables derived from the captures by the scripts beside them.
- `evidence/08-extract/`: per-lane extractions in the shape of `BRIEF.md`.
- `evidence/r2026-10-03/`: the Rift-at-15% round's captures, laid out like the first round's folders: `02-dc/` (listings `list-<search id>.tsv`, posts `dc/`), `03-sites/` (crumb.gg's `data-rift.json`, the arca.live and Reddit searches), `04-naver/` (listings, posts `nv/`), `05-youtube/` (searches, watch digests, and local-only videos and `frames/`), `08-extract/` (the round's extractions; `import.json` reads them ahead of the first round's).
- `evidence/r2026-10-07/`: the 2026-10-07 round's captures, laid out like the first round's folders: `02-dc/` (listings `list-<search id>.tsv` and discovery `list-disc-*.tsv`, posts `dc/` with some comment pages as `dc/<no>-page.html` where the scraper's comment fetch came back empty, and a duplicate test refetch in `dc/refetch/`), `03-sites/` (crumb.gg's data, patch digest and Rift board, crumblehub, Sugar Pocket, arca.live and Reddit), `04-naver/` (listings, posts `nv/`, cafe searches `search-*.txt`), `05-youtube/` (channel pages, searches, watch digests, and local-only `frames/`, `subs/` and `sheets/`), `06-derived/` (`crumbgg-diff-r2026-10-07.json` and `rift-ranking-2026-10-07.tsv`, from `derive_web_r2026-10-07.mjs`), `08-extract/` (the round's extractions; `import.json` reads them first).
- `evidence/*.py`: `ledger_backfill.py` (wrote the ledger's first lines; retired, since a rerun would repeat paths), `digest.py` (facet digests of the extractions), `build_sources.py` (`curated/sources.json`).
