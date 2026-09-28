# 004 — Golden Drop meta: Crumble Dungeon (크럼블 던전) against the Holy Golden Drop (Cookie Run: Crumble)

Status: active (started 2026-09-28; captured and curated 2026-09-28)

Measured on 2026-09-28 from branch `worktree-agent-afa0d04ad74569023` (off `main` at `cac2374`): the mode's rules from the official Naver cafe patch notes, the Cookie Run Wiki, Sugar Pocket's datamined catalog and in-game screenshots; scores and lineups from DCInside's 쿠키런 크럼블 gallery, the Naver cafe, KR YouTube (ND러너, 그니, VART, 서신우) and EOG's global hub. The research changed no code. The curated dataset imports as the app's `crumble_dungeon` mode (`pnpm import:record 004-golden-drop-meta`, after records 001 to 003; see "What would change"); a run's `standing` there is read from its evidence (a screenshot or video shows it; text alone claims it).

## Question

As asked: what are the best-performing builds for the Golden Drop attack stage in Cookie Run: Crumble? Best means highest damage or score, as players post it, ranked by damage or score and never by 배 (damage ÷ team power). First establish the mode's Korean name and how it works (entry rules, scoring, timer, boss or waves, rewards, resets, any power penalty), then the teams that top it.

As a falsifiable statement: the Golden Drop encounter is a scored mode with documented rules, and KR and global players post scores together with the roster, levels, runes, gear, pets and perks behind them precisely enough that the top-scoring builds can be named and reproduced by someone with every cookie.

## Verdict

**Supported for the rules and the scores, partly for exact reproduction.** The Golden Drop stage is Crumble Dungeon (크럼블 던전): every owned cookie fights the Holy Golden Drop (황금갓방울) for up to a minute, the 40 with the highest combat power deploy first, and the score is the damage dealt, ranked daily and weekly per server. The highest documented score is **379.3G at 15.58G total power** (스미노프TFT, 2026-09-28), then **325.9G at 10.10G** (전치, 2026-09-27), both server firsts with result screenshots. Every top run uses the same engine, stated precisely: Milk captain with the highest ATK, Pomegranate's beam routed down a chosen ATK order, supports low enough that Milk reaches the centre early, and every charger, summoner and Projectile Speed recipient levelled out of the 40. What the top two do not publish is a named 40 with every level: they post the ATK order, the rules and roster screenshots. The fully named 40s come from guides that score lower (ND러너's, record in the high 180s G at 14.14G). The strongest reason: the rules are complete enough to rebuild any of these lineups from your own roster, but the lineups themselves differ in their fillers from account to account.

## Reasoning

1. **The mode and its name.** Sugar Pocket's catalog names the key "크럼블 던전 입장 열쇠" ("your ticket to meet the Holy Golden Drop") and the rewards tied to it; EOG, Crumble Guides and the Cookie Run Wiki describe the whole collection against the Holy Golden Drop for score. The gallery shortens the mode to 크던; 갓방울 alone is the pet 갓난갓방울, not the boss. `research/001-guild-conquest-meta/evidence/12-glossary-src/cookieruncrumble_app_api_catalog_database.json`, `evidence/03-sites/eoggg_cookierun-crumble.html`, `evidence/07-web/02-cookierunwiki-crumble-dungeon.txt`.
2. **Entry, deployment and timer.** One key per run; the wiki and the newbie guide give three entries a day, while mid-September lobby screens show a counter out of 5 (dc:67621, dc:68857) and mileage-shop keys stack above it (dc:70768). All cookies enter; the top 40 by combat power deploy at once and each death brings in the next (dc:62042, dc:76922, yt XeD4c3AuQAs, EOG). No formation, no pet slots (dc:72051), no manual control since 2026-09-10 (nv:37730; in-game banner in dc:71448). The HUD shows the running score and a countdown from up to a minute; the run ends at 0 or when all cookies die (wiki; dc:71956 mid-fight frame at 27.767 s; result screens with 0.000–6.3 s left).
3. **The boss.** The wiki lists a knockback squash, lightning strikes and summoned Golden Soldier Drops; players time a slam at about 20 s left (dc:57218) and a late sweep (dc:62042 comments); EOG's model adds rising damage reduction and adds that score nothing (EOG simulator section, a model, not published data). No recommended-power gate is reported.
4. **Rewards and resets.** Per server (nv:43444). Daily board: best run of the day, closes at midnight, pays research stones, one-minute speed-ups and, in the top 10, pet tickets; weekly board: best run of the week, closes Wednesday 00:00 KST, pays coins, XP and top-10 crystals; both mail 12:00–13:00 KST the next day (since 8/13, nv:16132). The tables are in-game screens in dc:67615 and match the wiki; the weekly top 100 earns the 황금빛 광채 title (nv:43444, catalog); milestones pay from 400,000 to 1,000,000,000,000 points (wiki).
5. **The top runs, ranked by score.**

   | Score | Total power | Player | Date | Board | Evidence | Lineup |
   |---|---|---|---|---|---|---|
   | 379.3G | 15.58G | 스미노프TFT | 2026-09-28 | server 1st | dc:77306 (screenshot) | dungeon-milk-scorpion-figure |
   | 325.9G | 10.10G | 전치 | 2026-09-27 | server 1st | dc:76916 (screenshot) | dungeon-milk-seeker-scorpion |
   | 244.7G | 6.62G | anonymous | 2026-09-17 | server 1st | dc:68804 (screenshot) | not posted |
   | 221.4G | 9.23G | VART | 2026-09-26 | server 1st | yt 4v2xDWV13fg (frames) | dungeon-milk-seeker-scorpion |
   | 219.5G | 7.26G | 섬영 | 2026-09-15 | weekly best, 1st | dc:67621 (lobby) | ATK order only |
   | 174.7G (record high 180s) | 14.14G | ND러너 | 2026-09-18 | — | yt XeD4c3AuQAs (frames; record in text) | dungeon-macaron-figure-beam |
   | 159.6G | 8.57G | 스미노프TFT | 2026-09-22 | server 1st | dc:72051 (screenshot) | dungeon-milk-scorpion-figure |

   Text-only claims reach 350G on server 1 and 284G on server 34 (dc:72084, 2026-09-22) and 250G for VART. Every run with its time left and cookies left: `curated/dungeon-runs.json`. Score ÷ power runs from about 24× (379.3G) to 37× (244.7G) among the top runs; that ratio is only a normaliser.
6. **The engine every top run shares.** Milk captain with the highest ATK counting the captain's +10%, so Passion Pay and Rapid Promotion land on it (yt UF6zcIkbh_8, dc:62042); Pomegranate's beam goes to Projectile Speed recipients first (Milk always) and then by ATK, so the ATK order decides who gets it (yt UF6zcIkbh_8, yt XeD4c3AuQAs, yt F9BzQ4DAbWg); Milk's stacking ATK buff has a range, so the formation must stay packed and Milk must arrive early (dc:70059, dc:71956). The ATK orders: Milk, Scorpion, Figure, Brightseeker, Macaron, Melon Soda for the 379.3G run (dc:72051); Milk, Brightseeker, Scorpion, Figure, Macaron, Cheesecake for 325.9G and 221.4G (dc:69414, yt 4v2xDWV13fg); Milk then Macaron and Figure for ND러너. `curated/decks.json`, `curated/mechanics.json`.
7. **What stays out.** Projectile Speed recipients (they steal the beam), summoners and chargers (they drag Milk and the healers off the ranged dealers) go to Lv.1 or below the 40th-place cutoff; Bari since 2026-09-23 ("never use", dc:77306). EOG measured 0.40G → 0.57G (+42%) on one account by benching Oven Wanderer and Cool Mint (2026-08-13). Every exclusion with its reason: `curated/dungeon-exclusions.json`; the published lists: `curated/dungeon-lineups.json`.
8. **The patch that moved the meta.** Before 2026-09-10 Cheesecake's ATK buff erased Milk's stacked ATK buff, and guides set Cheesecake to Lv.1 (yt UF6zcIkbh_8, dc:62042); the 9/10 update made the stronger stacked buff win (nv:37730), and from 9/18 the lists bring Cheesecake back, sixth in ATK in the 325.9G run (yt XeD4c3AuQAs, dc:69414, dc:71956). `curated/timeline.json`.
9. **Perks, gear and runes.** Perks: Passion Pay with Rapid Promotion (most) or Like A Family (ND러너's best; 서신우 fills free slots with one element for it). Gear: an arena-style preset of Skill Haste, Skill AMP, crit and damage reduction without accuracy or focus (dc:62042, dc:57218, VART); a move-speed line helped one account from 50–60G to 75.4G while showing less power (dc:65247). Runes: Milk ATK-heavy; Macaron Skill AMP unless it is a beam target; Figure one ATK% line; Brightseeker past 50 Skill Haste fields six drones (그니). `curated/gear.json`, `curated/runes.json`.
10. **What the published lists agree on.** Across the full 40-cookie lists published 2026-09-13 to 09-24 (ND러너, 그니, 쿠키런 연두, 뱅국), the Milk–Pomegranate core and the beam targets appear in every one, with a common body of ranged dealers and fillers; Cheesecake appears in most. `evidence/06-derived/lineup-usage.json` (from `evidence/08-extract/lineups.json` by `derive_usage.py`), curated as `curated/usage.json`.
11. **KR and global.** One client (1.4.002) and one server list: Korean players' boards show English- and Chinese-named rivals (dc:71956, dc:57218) and EOG, a global guild, reports from Server 1. The rules do not differ; the sources do. The global web holds the wiki, EOG's tests and an English restatement of ND러너's 50G method (`evidence/07-web/04-cookieruncrumbles-dungeon-milk-buff-guide.html`); no global source posts scores near the Korean top.

## The steelman

*The case for "there is no best build, only a big collection":* EOG, a global top guild, wrote at launch that "there is no best-in-slot Crumble Dungeon comp", since the mode throws the whole collection in, and one Korean creator calls it a mode of raw account strength (서신우). Scores rise with total power across the table.

*Answer:* power sets the scale, not the ranking within it. At similar power the documented scores differ several-fold: 244.7G at 6.62G against 113.3G at 6.79G; 325.9G at 10.10G against 127.1G at 10.15G. The same account moved from 50–60G to 75.4G by adding move speed while showing less power (dc:65247), a follower moved from 3G to 6G by copying ND러너's levels, and EOG's own A/B test found +42% from benching two strong cookies. EOG itself published the exclusion tech a fortnight later. The lineup rules are the build.

*The case for "the top scores are luck":* runs swing 90–150G on one account (dc:68857), ND러너 sees 150–188G, and posters call a good run a lucky "world line".

*Answer:* the spread is real and the records are best-of-many, so a single score overstates what a lineup gives per run. But the spread sits on top of a level the lineup sets: every documented top run follows the same rules, and players who break them (Bari in, dc:77306: barely past 100G) lose far more than the spread.

## Recommendation

- **Build the 40 by the rules, then retry.** Captain Milk at the top ATK; set the six-deep ATK order (Milk, Scorpion or Brightseeker, Figure, Macaron, then Melon Soda or Cheesecake) by lowering dealers' levels; keep supports near Lv.70; put every cookie in `curated/dungeon-exclusions.json` at Lv.1; perks Passion Pay with Rapid Promotion or Like A Family; arena-style damage preset, plus a move-speed line if Milk lags. Then spend the keys: rewards pay the best run of the day and of the week.
- Open sub-choice: which cookies take the beam after Milk. Recommendation: Scorpion and Figure (or Brightseeker, Scorpion, Figure) — both of the top two runs beam dealers first, while ND러너's buffer-first setting tops out lower; try ND러너's only if Macaron already has high ATK runes.
- Open sub-choice: Cheesecake. Recommendation: in, sixth in ATK, since the 9/10 fix; out only on a client before that update.

## What would change (a map)

For the app lane; this record changed nothing outside its folder. The full list is in the session report (`.superpowers/sdd/2026-09-27-pvp/r004-report.md` in the worktree).

- `packages/schema/src/enums.ts:48` `GAME_MODE`: add `"crumble_dungeon"`. The brief suggested `golden-drop`; the game's own name for the mode is Crumble Dungeon (the Golden Drop is its boss, as the Piñata is Guild Conquest's), and the enum is snake_case.
- `packages/schema/src/enums.ts:35` `GEAR_CONTEXT`: the rows here use `arena`, `raid` and `stage` for the preset players pick; a `dungeon` value is optional.
- New collections, listed in `curated/manifest.json` (the importer strips unknown keys today): `dungeon-runs.json` (the scores with total power, board, rank, time left, cookies left, ATK order, perks, preset, deck), `dungeon-lineups.json` (published 40s and exclusions), `dungeon-exclusions.json` (cookie, class, why, status). The existing `scores` table has no mode column (`docs/architecture/2026-09-28-audit.md:106`).
- A view: a lineup planner (collection in, the 40 by power, the ATK order and the excluded cookies out).

## Side findings

- **The frames wrapper failed on ffmpeg 9.** `pnpm capture youtube frames` passed `-vsync`, which ffmpeg 9.0.2 rejects ("Unrecognized option 'vsync'"); frames here were cut with ffmpeg directly and logged as manual captures. The wrapper now passes `-fps_mode` (`packages/capture/src/media.ts`, `framesArgs`).
- **Sugar Pocket's catalog now refuses curl** (403, "Catalog access denied."), kept as captured in `evidence/03-sites/cookieruncrumble_app_api_catalog_database.json`; record 001's copy is cited instead. Follow-up: any future catalog refresh needs another route.
- **Entries per day are unsettled:** three per the wiki and the newbie guide, a counter out of 5 on September lobbies. Consciously left open.
- **One capture is empty:** `evidence/04-naver/nv/img/nv-46592-1.jpg` has 0 bytes; the post's second image carries the score.

## Sources

Every cited id is in `curated/sources.json` with its URL. The ones that settled the question:

- https://m.dcinside.com/board/projectcc/77306, /76916, /68804, /72051, /62042, /69414, /67621, /67615 — the top scores, the lineup rules and the reward tables.
- https://www.youtube.com/watch?v=XeD4c3AuQAs, UF6zcIkbh_8 — ND러너's two guides: deployment by power, the beam rule, the named 40, the Cheesecake conflict.
- https://www.youtube.com/watch?v=4v2xDWV13fg — VART's 221.4G run and ATK order; https://www.youtube.com/watch?v=_mvTZSI8hY8 — 그니's 40 and exclusions; https://www.youtube.com/watch?v=F9BzQ4DAbWg — 서신우's 127G guide.
- https://cafe.naver.com/ccrumble/37730, /16132, /44477 — the official patch notes (manual control, buff stacking, daily settlement, level control).
- https://cafe.naver.com/ccrumble/43444, /45597, /41500 — Naver guides: rules, per-server boards, lineups.
- https://cookierun.wiki/w/Crumble_Dungeon — fight length, entries, boss attacks, reward tables.
- https://eog.gg/games/cookierun-crumble/ — the global guild's exclusion test and simulator model.
- https://crumb.gg/data/patches.json — dated patch lines for the mode.

## Files

- `research-trail.md`: the search rounds.
- `import.json`: the importer manifest (record mode `crumble_dungeon`).
- `curated/`: the dataset; `manifest.json` lists every collection, the dungeon tables among them. Corrected for the app on 2026-09-28, after its review: a run's `atk_order` is a list of Korean names (the app glosses them; `atk_order_note` keeps what the post adds), 전치's run is the highest score per power among runs with a published lineup (the anonymous 244.7G run is higher, at about 37x), the page texts name the app's Runs, Lineups and Exclusions pages instead of curated files, 그니's formation breakers are named in the deck note instead of pointing at `evidence/08-extract/lineups.json`, and `takeaways.json` carries the Recommendation's open choices and the steelman's answers, so the Overview shows them.
- `evidence/captures.jsonl`: one line per evidence file (path, url, time, tool, sha256).
- `evidence/01-repo-grounding/repo-quotes.md`: what the repo already held, quoted with file:line.
- `evidence/02-dc/`: DCInside search listings (`01-list-dungeon.tsv`, `02-list-terms.tsv`, `03-list-round3.tsv`) and posts with comments (`dc/`; images local only).
- `evidence/03-sites/`: EOG, Crumble Guides, crumb.gg data and the refused catalog; `SOURCES.md` describes each and the probes that found nothing.
- `evidence/04-naver/`: the guide-board listing and posts (`nv/`; login refusals kept as stubs).
- `evidence/05-youtube/`: searches, watch pages with digests, Korean captions (`subs/`); `video/` and `frames/` are local only.
- `evidence/06-derived/`: `derive_usage.py` and its output `lineup-usage.json`.
- `evidence/07-web/`: the global search round (agent-browser) and the pages it found.
- `evidence/08-extract/`: per-lane post summaries (`dc.json`, `naver.json`, `youtube.json`, `sites.json`, `web.json`) and the transcribed lineups (`lineups.json`).
- `evidence/build_curated.py`, `evidence/build_curated_2.py`: build `curated/usage.json` and `curated/sources.json`; the second supersedes the first.
