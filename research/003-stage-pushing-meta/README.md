# 003 — Stage pushing meta: main stages and the Dimensional Rift (Cookie Run: Crumble)

Status: active (started 2026-09-28; captured and curated 2026-09-28)

Measured on 2026-09-28 from `main`: the power gate and every stage's recommended power, accuracy and focus requirement from crumblehub's copy of game data 1.4.002; clears, teams and builds from DCInside's 쿠키런 크럼블 gallery, the official Naver cafe and KR YouTube (the top-ranked player ND러너 among them). The research changed no code. The curated dataset imports as the app's `stage` mode (`pnpm import:record 003-stage-pushing-meta`; see "What would change").

## Question

As asked: for regular stage pushing in Cookie Run: Crumble (the main story/world stages, and the new dimension stages past stage 328), what teams, levels, runes, gear and pets do KR and global players use to clear the hardest stages at the lowest power, how does play differ across stage types, elements and boss stages, and what does the power gate (권장 전투력, recommended power) do to damage?

Sharpened by the user on 2026-09-28, mid-session: stage pushing punishes a team whose total power sits below a set value with lower damage, in steps. The user wants the teams that push while that step leaves them 35% of their damage (a 65% cut) and 15% (an 85% cut), and the strategies that make it work.

As a falsifiable statement: for stage pushing there is a small documented set of teams, levels, runes, gear and pets that KR and global players use to clear the hardest stages at the lowest power, and the community sources state them precisely enough that someone with every cookie could reproduce them, including how play differs by stage type and what the recommended-power gate does to damage. In particular, sources document teams that clear at the 35% and 15% damage steps of the power gate, with the power ratio each step starts at.

## Verdict

**Supported for the 35% bracket, partly for 15%.** The gate is an exact step table from game data: 35% of damage is kept from 40% of recommended power, 15% from 20%. Since the 2026-09-23 easing, screenshot clears show the 35% bracket reaching the last stage, 328-30, at 4.00G with a reproducible deck (Brightseeker, Princess Bari and Cherry Cola around the Milk–Pomegranate–Macaron buff core), and the boss swaps, pets, perks, gear and accuracy targets are stated precisely. At 15% only mob stages are documented (301-27 at 2.05G, 271-11 at 971.8M, both by hand); every 15% boss attempt on record fails, and the lone 328-30-at-15% claim has no screenshot. The strongest reason: the documented 15% clears sit a few million under the 40% line, so the pushers' own practice is to pad displayed power across the line rather than fight a boss a step lower.

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
5. **15% is a mob-stage bracket.** Both 15% clears with screenshots are mob stages sitting just under the 40% line (0.6M and 4.4M short). Posters report the -10/-20/-30 bosses, the bikers, the eagle and the Redberry packs as walls at 15% (dc:77013, dc:77080, dc:67268, dc:75871); a pusher who took about 20% of GingerCraven's HP at 15% cleared it first try at 35% (dc:77154).
6. **The deck and its swaps.** The post-easing general deck and its GingerCraven variant are in `curated/decks.json` (stage-bari-cola-charge, stage-bari-coward-328); the Naver cafe's post-easing template (nv:46348) has the same fixed buffer core (Macaron, Milk, Pomegranate, Skating Queen, Cheesecake, Milk's runes all ATK) with flex slots per boss. Alongside them sit the pre-easing all-in-one deck and its per-boss swaps (dc:70308) and the pre-easing GingerCraven 35% deck (dc:72776) as the documented low-power lines. ND러너's videos confirm the swaps: Panda Dumpling for launch bosses, Jungle Warrior and Rye for Redberry, Wind Archer or Scorpion for GingerCraven (`evidence/08-extract/youtube.json`).
7. **Stage types are predictable.** From chapter 169 every chapter repeats one of eight zone layouts with fixed boss slots (zone = ((chapter − 1) mod 8) + 1), derived from the game data in `evidence/06-derived/zone-cycle.json`; the plan per slot is `curated/stage-zones.json`.
8. **Power is padded, accuracy is capped.** Displayed power sets the bracket, so stage gear is rolled for power, SSR rune lines that add power are kept until the Rift, and a guild's bonus counts (dc:67596, dc:76290, yt:1AyEMtaE-s4). Accuracy requirements stop rising at 1,203.5; pushers call 900–1,000 enough after the easing (dc:75381, yt:BDuQ279mbP4). `curated/gear.json`, `curated/runes.json`.
9. **The Rift is a 35% fight at every level.** Its recommended power runs from 10.00G to about 1,800G over season 1's levels; a Rift-only level (차원의 힘) fills while you are in it and inflates power and stats there. The gate applies (dc:76525, dc:76678, dc:77015; ND러너 at yt:1AyEMtaE-s4 [1:50:35]); only dc:77090 felt no penalty. Rules and reported bosses: `curated/mechanics.json`, `curated/rift-bosses.json`.
10. **What the shared decks use.** Among crumblehub's user-shared clear decks for stage 169-1 or later, Pomegranate and Milk are in every deck, Macaron, Herb and Skating Queen in over 90%, and Brightseeker in 80%; Gold Drop Jr. and Hot Doggie lead the pets. Most of these decks predate the easing and Princess Bari. `evidence/06-derived/clear-deck-usage.json`, `curated/usage.json`.

## The steelman

*The case for pushing bosses at 15%:* the gate cuts only your damage, not the boss's, so a long enough fight is a matter of survival and retries; unattended boss retry exists; a server's #1 was said to push at 15%; and one poster claims 328-30 at about 3G with high-star Bari and Cherry Cola (dc:76779).

*Answer:* the claims have no screenshots, and the measured attempts don't support them: a pre-easing 15% run at 289-4 (a Cake Hound pack) timed out with the pack at 2%, 2M under the 35% line (nv:44742, screenshot); the best documented 15% GingerCraven attempt left 41% HP after an hour (dc:71892), boss fights are timed (the 289-4 screenshot ends at 0.000; the Rift's level-100 fight has a 30 s limit, dc:73646), and the gap between 15% and 35% is a 2.3× damage multiplier that padding a few million power buys outright, as both 15% mob clears show. Retrying at 15% is dominated by crossing the line.

*The case for accuracy and focus over power:* before the easing, pushers reported broken clears when accuracy fell (dc:68826) and planned gear around the requirement.

*Answer:* that held when accuracy requirements were near 1,200 and 35% lines were tight; after the easing players report 900 as enough to 328 (dc:75381) and damage, not misses, as the reason clears fail (dc:76752). It still applies to debuffers (focus) and in the Rift, where the calculator's accuracy and focus climb and ND러너 runs about 1,000.

## Recommendation

- **Push at 35% with the Bari–Cherry Cola–Brightseeker deck, swap per boss slot, and use 15% only on mob stages.** Before a boss at 15%, pad displayed power across the 40% line instead: power gear preset, SSR power runes, guild. The per-chapter lines are in `curated/stage-chapters.json`.
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
- `evidence/*.py`: `ledger_backfill.py` (wrote the ledger's first lines; retired, since a rerun would repeat paths), `digest.py` (facet digests of the extractions), `build_sources.py` (`curated/sources.json`).
