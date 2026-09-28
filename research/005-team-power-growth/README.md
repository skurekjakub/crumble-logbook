# 005 — Team power growth: what raises 전투력, at what cost (Cookie Run: Crumble)

Status: active (started 2026-09-28; captured and curated 2026-09-28; corrected after the Opus review on 2026-09-28)

Measured on 2026-09-28 from the worktree lane `worktree-agent-a088760dcf93fccb3` (base `12ecfb9`), against the community sources and store pages listed under Sources and captured in `evidence/`, plus the game data (1.4.002) that record 001 captured. The research changed no code. The curated dataset still needs app work before it imports: a `team_power` mode and the manifest changes in "What would change".

## Question

As asked: what are the best ways to raise team power (the combat power the game shows for a team, 전투력) in Cookie Run: Crumble, free and pay-to-win alike? Assess each on cost (in-game currencies and materials, time for free players, real money for paid routes, package prices in KRW and USD where shown) and efficiency (team power gained per unit of cost, and how that changes with account progress). Cover every power source the game has, with the power it adds (real before/after numbers where players post them), what it costs and whether that is free, time-gated or paid, its caps and diminishing returns, and the order players recommend spending in. Finish with a ranked spending order for a free player and for a paying one at the account stages the sources discuss, one of them a team near 2.2G. Link each source to what it does for the stage-pushing and Dimensional Rift brackets of record 003.

As a falsifiable statement: the community sources name every system that adds displayed team power, and for each they give (or let us derive) a cost and a power gain precise enough to rank the systems by power per unit of cost, separately for a free and a paying player, and to say which one moves a 2.2G team across the next bracket line of record 003 soonest.

## Verdict

**Partly supported.** The sources name every power source and give a cost, a cap and a recommended order for each (`curated/power-sources.json`), but a posted before/after team-power gain exists only for the rows of the table under Reasoning 3, and most of those have no posted cost. So the orders below are the community's stated orders, checked against those few measurements, not a ranking by power per unit. The one posted gain that moved a 2G team a whole step is Stellar Link: opening the third point of constellation 8 took a player from 2.0G to 2.2G (+10%, dc:77329). That step is within reach of free pulls (free pulls stop at 8-3, dc:76290); the points past 8-3 need paid pulls. Plating and Stellar can't be compared per won: a plating step near 15 is about +1.5% for about ₩14,700 (inferred from dc:75684 and dc:53079), while the next Stellar points need about 45 cookie stars, which at the TSSR pickup rate would cost on the order of ₩2.3–4.2 million (inferred upper bound; SSR stars cost less but no capture prices them) for a gain no one posted. The guild's "+20%" is a single unmeasured reply about account total power, not team power. Paid, the community's growth engine is Ad Removal and the Crumble Pass ($4.99 / ₩7,500 each), the weekly dungeon keys ($3.99 / ₩6,000) and the ₩55,000 permanent membership; none of them has a posted power figure.

## Reasoning

1. **The list of power sources comes from the game's own guides.** The cafe's intro guide and newbie guidebook, the in-game Arena guide (quoted by Sugar Pocket) and the global guide sites name the same systems; `curated/power-sources.json` holds them, with lineup padding, the spending track and the Rift's own energy added because posts treat them as power levers. Only stages and the Rift use the number, and Arena leaves several sources out (the `applies_in` field). `research/002-pvp-meta/evidence/04-naver-global/nv/nv-33130.md:48-96`, `nv-43444.md:428-480`, `evidence/04-sites/sugarpocket_guides_rendered.txt`, `evidence/03-naver/nv/nv-41221.md` (the author: "전투력 수치가 관여하는 건 스테이지 뿐").
2. **What a gain buys at 2.2G.** From record 003's stage table: 2.2G reaches 55% to 288-3 and 35% to 304-19; each +0.2G moves the 35% reach about three to four chapters (2.4G → 308-5, 3.0G → 317-8); 328-30 at 35% needs 4.00G. `evidence/07-derived/bracket-reach.json`, `curated/power-planner.json`.
3. **Posted gains.** Every row is a player's own figure; a cause or cost the poster only guessed is marked.

   | Source | Account | Before → after | Cost | Evidence |
   |---|---|---|---|---|
   | Stellar Link, open constellation 8 | 1.5G | 1.5G → 1.7G (+13%) | cookie stars (not posted) | dc:68732 |
   | Stellar Link, third point on 8 (triangle) | 2.0G | 2.0G → 2.2G (+10%) | not posted; the point opens with cookie stars | dc:77329 |
   | Guild lab (claim) | small guild → research 13 | "~+20%" of **account total** power | switching guild | dc:76461 (one reply) |
   | Plating, one level / 14→15 | "1G 600M" (team or total not stated) | about +8M (posed as a question) / +20–30M | 14→15 ≈ 104 Chocosteel + 13 Syrup expected | dc:75684, dc:53079 |
   | Resolve vs gear | late | +200 Resolve → Milk ATK +~1k; one +87 ATK bow line → +6k | coins vs one gear line | dc:76718 |
   | Stellar + Resolve + gear | new player | more than 2× | — | dc:70429 |
   | Arena deck jump | arena deck | 3M → 5M | cause guessed by commenters (gear or formation change) | dc:72901 |
   | Oven, research, Bari 5★, Stellar 8-6 | 2G | 2G → 4G over weeks | oven 36, research, paid pulls | dc:76290 (record 003) |

   All rows: `curated/power-datapoints.json`; the posts: `evidence/08-extract/dc.json`.
4. **Costs and diminishing returns.** Stellar: 10 SP a roll unlocked, 220 with six points locked (`evidence/04-sites/sugarpocket_stella_rendered.txt`); expected costs from the guides, not posted spends: ~550 SP to roll a 3-point maximum from scratch (nv:5693), ~1,900 for the 8-point 91% octagon, ~5,300–7,900 for 95% at 10 points, 150,000–400,000 for 100% (nv:43444, dc:55570, dc:56417, dc:73840, web:yt-mL9MSX3QD94); later constellations give more per % of area (nv:5693; web:yt-y-bxOrnjIeU). Stellar points open with cookie stars: 8-3 → 8-6 is about 45 stars and past 8-3 needs paid pulls (dc:76290). Cookie stars: a pickup TSSR costs ~₩288,800 for 5★ and ~₩972,000 for 10★ (dc:50913), about ₩51,000–94,000 a star on average (inferred from the same table). Plating: success 90% at 0→1, 14% at 14→15, 2% from 19→20 to 24→25; ~414 Chocosteel and 43 Syrup expected per slot to 15; free Chocosteel is 24 a day (`evidence/08-extract/plate-rates.json`, dc:72150, web:yt-l9086mj7hwA). Resolve: flat +2 ATK/DEF and +20 HP per level after 101, cap 1,500 (`evidence/04-sites/data-patches.json`). Levels: 91–100 take ~77% of the EXP to 100 (`evidence/07-derived/level-curve.json`). Oven: gear level = oven × 3, Eternal from oven 31 at 0.002% a draw (`evidence/07-derived/oven-gear.json`). Lab nodes near the top cost 1.6M–6M research stones, ATK 30% ~50M (web:yt-y-bxOrnjIeU, dc:77277, dc:76620). Condensed: `curated/growth-curves.json`.
5. **Prices, KR and global.** KR: crumblehub's plan puts a light spender at ₩85,000, medium ₩217,900, a full buyer ₩2,646,400 (`evidence/04-sites/crumblehub_guides_spending_ko.html`); its value table ranks packages by Crystal value per KRW, which is not team power (`evidence/07-derived/package-value.json`). Global: the US App Store lists the Crumble Pass and Ad Removal at $4.99 (₩7,500 in KR) and the Daily Dungeon Key Set at $3.99 (₩6,000); the other paired tiers are in `evidence/07-derived/price-tiers.json`. The ₩55,000 membership has no captured USD price. Galaxy Store coupons (KR only) cut about 25% (web:yt-l4I2DCv7d0k). Table: `curated/packages.json`.
6. **The community's orders agree.** The cafe guidebook, the KR creators and crumblehub give the same free order (cheap early levers first, Stellar kept at ~70% until later constellations, plating in steps of 5, coin chests banked until a 35% line fails) and the same paid order (the permanent and pass purchases first, TSSR stars last), with Syrup Metal first in every exchange (nv:43444 §7.2, web:yt-njY-LhKqAtM, web:yt-5XXDHBHnISU, dc:76008, web:crumblehub-spending, web:yt-FrKqf5lhZBs, web:yt-l4I2DCv7d0k, dc:77246, dc:73455, web:yt-l9086mj7hwA, web:crumblehub-currency). Ordered by account stage in `curated/spending-orders.json`, which marks each step as measured, claimed or community order.
7. **Patch changes that move the curves.** 2026-08-13 Resolve per-level stats doubled after 101; 2026-08-27 Resolve to 1,000 and quest rewards past 168 cut by up to 97%; 2026-09-10 Fame to 360, Resolve to 1,500, lab to 90-2; 2026-09-17 mileage shop overhaul; 2026-09-23 plating to 25 with a 2-level shatter and Syrup restore, lab to 110-2, stages eased. `curated/timeline.json`.
8. **Displayed power is not strength.** Attack-type cookies and the stats a lineup lacks count more; accuracy past ~1,000 adds little; crit resistance pads most (web:yt-EocpkOD5NW0, dc:56391, dc:74089). A synergy team at 614k cleared where a raw 649k did not (web:yt-6DFlOgeXLds). That is why record 003's pushers keep a stage preset padded for power; no capture measures how much team power the padding adds.

## The steelman

*The case for plating and TSSR stars as the main route:* most posted 4G accounts have weapon plates at 19–21 (dc:76272, dc:76816, dc:74431); plating works in every mode, including Arena and Guild Conquest where Stellar and the labs don't; and a server's top three each gained 200–300M at once, which the poster put down to plating great successes (dc:72479). TSSRs raise stats and deck strength and open Stellar points.

*Answer:* not every 4G account got there by plating: the 2G → 4G player in dc:76290 has no plate above 18 ("20강이 어딨어 … 18 2개가 끝임") and credits oven level, research, Bari 5★ and Stellar 8-6. The plating 4G accounts also sit at Stellar 8-5 to 8-6, Resolve ~1,000 and lab HP 30% (dc:76272, dc:76171), so plating is one of several things they did, not the cause. Per unit of cost, the posted plating step near 15 is ~1.5% for about ₩14,700 or four days of free Chocosteel, and past 19 every try is 2% with an 11–15% shatter. TSSR stars cost ~₩289,000 for 5★, and heavy spenders themselves say they add little in stages (dc:67616, dc:73455, dc:77420); their power comes mostly through the Stellar points they open, which is why neither can be ranked above the other per won here.

*The case for Resolve:* early it is the cheapest power in the game (a new player doubled with it, dc:70429). *Answer:* agreed, early; late its flat stats shrink against percentage gear (dc:76718), which is why the late advice is to bank coins for crossing a line (dc:77116).

## Recommendation

- **Free player at 2.2G:** the parts backed by a posted gain are the constellation-8 points up to 8-3 (+10% at 2G) and, weakly, plating near 15 (+1.5% at 1.6G). The rest is the community's order: check the guild's research level (the +20% is one unmeasured claim about account total power); keep a stage preset padded for power and swap to it within a few % of a line (unmeasured, record 003's practice); put stones into lab HP 30% and the lower ATK nodes, since ATK 30% costs ~50M stones and the lower nodes pay better (dc:76620); plate sword and bow toward 20 with free Chocosteel and exchange Syrup; keep Fame daily; open banked coin chests only to cross a line. Constellation-8 points past 8-3 need paid pulls. Ranked list with each step's basis: `curated/spending-orders.json` (`ranked_at_2_2g.free`).
- **Paying player at 2.2G:** the community's order, with no posted power figure for any package: keep the Crumble Pass and weekly keys running and buy the 5.5 membership if staying (assuming Ad Removal and the Unique pack are owned). For direct power, Stellar Points (₩32,000 for 12,000 SP) are the cheapest way to add area once points are open, and plating packs (₩9,900 for 70 Chocosteel + 30 Syrup) buy about +1.5% per step near 15; opening more Stellar points means buying cookie stars, priced above. Ranked list: `ranked_at_2_2g.paid`.
- **Earlier stages:** `curated/spending-orders.json`, one block per account stage.
- Open sub-choice: 95% or 100% Stellar on an old constellation. Recommendation: stop at 95% (10 points) or 91% (8 points); 100% costs 150,000+ SP (dc:73840).
- Open sub-choice: shatter mitigation past 15. Recommendation: keep the restore Syrup in hand instead until about 18, where the unmitigated shatter is 8% (web:yt-_Vyl0eQz9lU).

## What would change (a map)

For the app lane; this record changed nothing outside its folder and `OPEN-QUESTIONS.md`. The app's needs are written up in `.superpowers/sdd/2026-09-27-pvp/r005-report.md` (local, gitignored).

- `packages/schema/src/enums.ts:47` `GAME_MODE`: add `"team_power"` (import.json's `record.mode`; every curated row states `mode: "team_power"`).
- `apps/server/src/importers/collections.ts:496` `curatedManifest` requires every collection not marked optional, so this record's manifest also needs empty `decks`, `runes`, `gear` and `rng` files, or those collections become optional for modes with no decks. The review's scratch import succeeded with empty files.
- Sources whose captures sit in records 001–003 (dc:67596, dc:76290 and the Naver guides captured by record 002) raise "no capture under this record's capture rules" warnings on import; `import.json` would need those records' capture directories if the importer allowed it.
- `apps/server/src/importers/seed/schema.ts` and `packages/schema`: new collections for the table-shaped curated files — `power-sources.json`, `power-datapoints.json`, `packages.json`, `spending-orders.json`, `growth-curves.json`, `power-planner.json`. Not in `curated/manifest.json` yet, since the importer rejects unknown collection keys.
- `apps/web/src/app/modes/`: a team-power section with a cost-versus-efficiency view (free/paid filter) and a planner that takes the reader's team power and reads record 003's stage table.

## Side findings

- **crumb.gg's combat power board is account total power.** Its top 500 run 10.6G–33.4G on 2026-09-28 (`evidence/04-sites/pub-leaderboard.json`); team power is a different, smaller number (record 001's glossary). An app that shows the board next to team power must label it.
- **The power formula is not public.** No site or post gives it; the dynamic weighting (dc:56391) and cookie-type weights (web:yt-EocpkOD5NW0) are observations. A calibrated planner would need the user's own before/after readings. Consciously dropped as a follow-up here: it is the same calibration question OPEN-QUESTIONS.md already asks for the conquest simulator.
- **The guild lab has no table anywhere.** The +20% is one reply about account total power (dc:76461). Follow-up: added to `OPEN-QUESTIONS.md` (read the guild's research level and its stat lines in game to size it).
- **Namu.wiki and Sugar Pocket's catalog API were not usable** (a Cloudflare challenge; HTTP 403 to plain requests). Record 001's catalog copies are the same game version, so nothing was lost for 1.4.002; a future record on a later version needs another route.
- **Shared source title drift:** record 002's entry for nv:43444 is titled "(arena chapter)"; this record cites the whole guide but keeps 002's entry so shared sources stay identical.
- **`evidence/build_sources.py` is retired.** Its id pattern missed ids cited inside prose; `evidence/build_sources_2.py` replaces it (the old script stays, unedited, under its ledger line).

## Sources

Every cited id is in `curated/sources.json` with its URL; YouTube ids are written `web:yt-<id>` throughout. The ones that settled the question:

- https://m.dcinside.com/board/projectcc/77329, /68732 — Stellar constellation-8 steps: +10% and +13%.
- https://m.dcinside.com/board/projectcc/76290 (captured by record 003) — the 2G → 4G path, free pulls stopping at 8-3, 45 stars from 8-3 to 8-6.
- https://m.dcinside.com/board/projectcc/75684, /53079, /72150 — plating gains, odds and costs, the 1.4.002 change.
- https://m.dcinside.com/board/projectcc/76718, /70429, /76008, /77116 — Resolve early and late.
- https://m.dcinside.com/board/projectcc/76461 — the guild lab claim.
- https://m.dcinside.com/board/projectcc/76272, /76171, /77104 — account snapshots at 3–4G.
- https://m.dcinside.com/board/projectcc/50913, /77246, /77420 — TSSR star costs and a light spender's ceiling.
- https://m.dcinside.com/board/projectcc/68116, /68148 — the gallery's package value series.
- https://cafe.naver.com/ccrumble/43444, /33130, /5693, /41221 — the cafe's guides (43444 and 33130 captured by record 002).
- https://crumblehub.co/guides/spending, /guides/currency, /guides/plate-upgrade, https://crumblehub.co/api/efficiency — KRW budgets, exchange priorities, plating order, package values.
- https://apps.apple.com/us/app/cookierun-crumble-idle-rpg/id6749251466, https://apps.apple.com/kr/app/id6749251466 — USD and KRW prices.
- https://crumb.gg/data/patches.json — patch changes to the growth systems.
- The KR creators' videos cited as `web:yt-*` in `curated/sources.json` — power levers, purchase and exchange orders, plating after 1.4.002.
- https://www.pocketgamer.com/cookierun-crumble/best-packs/ — the global view on packs.

## Files

- `research-trail.md`: the web rounds.
- `import.json`: the importer manifest (record mode `team_power`).
- `curated/`: the dataset; `manifest.json` lists the importable collections, and the other files are the team-power tables named in "What would change".
- `evidence/captures.jsonl`: one line per evidence file (path, url, time, tool, sha256).
- `evidence/01-repo-grounding/repo-grounding.md`: what records 001–003 already held, with locators.
- `evidence/02-dc/`: DCInside search listings (`*.tsv`) and posts with comments (`dc/`; images local only).
- `evidence/03-naver/`: the cafe's guide board listing and posts (`nv/`).
- `evidence/04-sites/`: site captures (crumblehub, Sugar Pocket, crumb.gg, Pocket Gamer, a global guide site).
- `evidence/05-youtube/`: search result pages, video metadata (`*.info.json`) and subtitles (`*.vtt`).
- `evidence/06-store/`: the App Store product pages.
- `evidence/07-derived/`: tables derived by `derive_growth_tables.py` from the game data, the value table, the store pages and record 003's stage table.
- `evidence/08-extract/`: this session's extractions (`BRIEF.md` describes the shape), including the transcribed plating odds.
- `evidence/build_sources_2.py`: builds `curated/sources.json` from every cited id; `evidence/build_sources.py` is its retired first version.
