# 005 — Team power growth: what raises 전투력, at what cost (Cookie Run: Crumble)

Status: active (started 2026-09-28; captured and curated 2026-09-28)

Measured on 2026-09-28 from the worktree lane `worktree-agent-a088760dcf93fccb3` (base `12ecfb9`): DCInside's 쿠키런 크럼블 gallery, the official Naver cafe, KR and global YouTube (subtitles), crumblehub's spending, currency and plating guides and its package value table, Sugar Pocket's Stellar simulator, crumb.gg's patch digest and power board, the US and KR App Store listings, and the game data (1.4.002) that record 001 captured. The research changed no code. The curated dataset is ready to import as a `team_power` mode once the app has one (see "What would change" and `.superpowers/sdd/2026-09-27-pvp/r005-report.md`).

## Question

As asked: what are the best ways to raise team power (the combat power the game shows for a team, 전투력) in Cookie Run: Crumble, free and pay-to-win alike? Assess each on cost (in-game currencies and materials, time for free players, real money for paid routes, package prices in KRW and USD where shown) and efficiency (team power gained per unit of cost, and how that changes with account progress). Cover every power source the game has, with the power it adds (real before/after numbers where players post them), what it costs and whether that is free, time-gated or paid, its caps and diminishing returns, and the order players recommend spending in. Finish with a ranked spending order for a free player and for a paying one at the account stages the sources discuss, one of them a team near 2.2G. Link each source to what it does for the stage-pushing and Dimensional Rift brackets of record 003.

As a falsifiable statement: the community sources name every system that adds displayed team power, and for each they give (or let us derive) a cost and a power gain precise enough to rank the systems by power per unit of cost, separately for a free and a paying player, and to say which one moves a 2.2G team across the next bracket line of record 003 soonest.

## Verdict

**Partly supported.** The sources name every power source and give a cost, a cap and a recommended order for each (`curated/power-sources.json`), but measured before/after gains exist only for the sources in the table under Reasoning 3; the rest are ranked by the community's stated order, not by power per unit. Those measurements are enough to rank the top of both orders. For a 2.2G team the fastest free movers are the guild (a research-13 guild is claimed at about +20%; leaving a guild dropped a pusher a bracket), a pure-power stage preset, and the next Stellar Link points on constellation 8 (one step took a player from 2.0G to 2.2G, +10%, for a few hundred to two thousand Stellar Points). Paid, the growth engine is Ad Removal and the Crumble Pass ($4.99 / ₩7,500 each), the weekly dungeon keys ($3.99 / ₩6,000) and the ₩55,000 permanent membership; for direct power, Stellar Points beat plating (a plating step near 15 is ~+1.5% for ~₩14,700) and TSSR stars (~₩289,000 for 5★). The single strongest reason: at 2G+ a Stellar step bought +10% where the same money in plating buys about a tenth of that.

## Reasoning

1. **The list of power sources comes from the game's own guides.** The cafe's intro guide and newbie guidebook, the in-game Arena guide (quoted by Sugar Pocket) and the global guide sites name the same systems; `curated/power-sources.json` holds them, with lineup padding, the spending track and the Rift's own energy added because posts treat them as power levers. Only stages and the Rift use the number, and Arena leaves several sources out (the `applies_in` field). `research/002-pvp-meta/evidence/04-naver-global/nv/nv-33130.md:48-96`, `nv-43444.md:428-480`, `evidence/04-sites/sugarpocket_guides_rendered.txt`, `evidence/03-naver/nv/nv-41221.md` (the author: "전투력 수치가 관여하는 건 스테이지 뿐"). Table: `curated/power-sources.json`.
2. **What a gain buys at 2.2G.** From record 003's stage table: 2.2G reaches 55% to 288-3 and 35% to 304-19; each +0.2G moves the 35% reach about three to four chapters (2.4G → 308-5, 3.0G → 317-8); 328-30 at 35% needs 4.00G. `evidence/07-derived/bracket-reach.json`, `curated/power-planner.json`.
3. **Measured gains (posted).**

   | Source | Account | Before → after | Cost | Evidence |
   |---|---|---|---|---|
   | Stellar Link, open constellation 8 | 1.5G | 1.5G → 1.7G (+13%) | cookie stars | dc:68732 |
   | Stellar Link, 3-point triangle on 8 | 2.0G | 2.0G → 2.2G (+10%) | stars + Stellar Points | dc:77329 |
   | Guild lab (claim) | small guild → research 13 | ~+20% total power | switching guild | dc:76461 |
   | Plating, one level / 14→15 | 1.6G | +8M / +20–30M (~0.5% / ~1.5%) | 14→15 ≈ 104 Chocosteel + 13 Syrup expected | dc:75684, dc:53079 |
   | Resolve vs gear | late | +200 Resolve → Milk ATK +~1k; one +87 ATK bow line → +6k | coins vs one gear line | dc:76718 |
   | Stellar + Resolve + gear | new player | more than 2× | — | dc:70429 |
   | Oven gear, rarity step | arena deck | 3M → 5M | a draw | dc:72901 |
   | Oven, research, Bari 5★, Stellar 8-6 | 2G | 2G → 4G over weeks | oven 36, research | dc:76290 (record 003) |

   All rows: `curated/power-datapoints.json`; the posts: `evidence/08-extract/dc.json`.
4. **Costs and diminishing returns.** Stellar: 10 SP a roll unlocked, 220 with six points locked (`evidence/04-sites/sugarpocket_stella_rendered.txt`); ~550 SP for a 3-point maximum, ~1,900 for the 8-point 91% octagon, ~5,300–7,900 for 95% at 10 points, 150,000–400,000 for 100% (nv:5693, nv:43444, dc:55570, dc:56417, dc:73840, yt:mL9MSX3QD94); later constellations give more per % of area (nv:5693; yt:y-bxOrnjIeU). Plating: success 90% at 0→1, 14% at 14→15, 2% from 19→20 to 24→25; ~414 Chocosteel and 43 Syrup expected per slot to 15; free Chocosteel is 24 a day (`evidence/08-extract/plate-rates.json`, dc:72150, yt:l9086mj7hwA). Resolve: flat +2 ATK/DEF and +20 HP per level after 101, cap 1,500 (`evidence/04-sites/data-patches.json`). Levels: 91–100 take ~77% of the EXP to 100 (`evidence/07-derived/level-curve.json`). TSSR stars: ~₩288,800 expected for 5★, ~₩972,000 for 10★ (dc:50913). Oven: gear level = oven × 3, Eternal from oven 31 at 0.002% a draw (`evidence/07-derived/oven-gear.json`). Lab nodes near the top cost 1.6M–6M research stones, ATK 30% ~50M (yt:y-bxOrnjIeU, dc:77277, dc:76620). Condensed: `curated/growth-curves.json`.
5. **Prices, KR and global.** KR: crumblehub's plan puts a light spender at ₩85,000, medium ₩217,900, a full buyer ₩2,646,400 (`evidence/04-sites/crumblehub_guides_spending_ko.html`); its value table ranks packages by Crystal value per KRW (`evidence/07-derived/package-value.json`). Global: the US App Store lists the Crumble Pass and Ad Removal at $4.99 (₩7,500 in KR) and the Daily Dungeon Key Set at $3.99 (₩6,000); paired tiers run ₩12,000 = $7.99, ₩19,000 = $11.99, ₩20,000 = $12.99, ₩45,000 = $29.99 (`evidence/07-derived/price-tiers.json`). The ₩55,000 membership has no captured USD price. Galaxy Store coupons (KR only) cut about 25% (yt:l4I2DCv7d0k). Table: `curated/packages.json`.
6. **The community's orders agree.** The cafe guidebook, the KR creators and crumblehub give the same free order (cheap early levers first, Stellar kept at ~70% until later constellations, plating in steps of 5, coin chests banked until a 35% line fails) and the same paid order (the permanent and pass purchases first, TSSR stars last), with Syrup Metal first in every exchange (nv:43444 §7.2, yt:njY-LhKqAtM, yt:5XXDHBHnISU, dc:76008, web:crumblehub-spending, yt:FrKqf5lhZBs, yt:l4I2DCv7d0k, dc:77246, dc:73455, yt:l9086mj7hwA, web:crumblehub-currency). Ordered by account stage in `curated/spending-orders.json`.
7. **Patch changes that move the curves.** 2026-08-13 Resolve per-level stats doubled after 101; 2026-08-27 Resolve to 1,000 and quest rewards past 168 cut by up to 97%; 2026-09-10 Fame to 360, Resolve to 1,500, lab to 90-2; 2026-09-17 mileage shop overhaul; 2026-09-23 plating to 25 with a 2-level shatter and Syrup restore, lab to 110-2, stages eased. `curated/timeline.json`.
8. **Displayed power is not strength.** Attack-type cookies and the stats a lineup lacks count more; accuracy past ~1,000 adds little; crit resistance pads most (yt:EocpkOD5NW0, dc:56391, dc:74089). A synergy team at 614k cleared where a raw 649k did not (yt:6DFlOgeXLds). This is why padding a stage preset is a real, free power source for the gate and useless elsewhere.

## The steelman

*The case for plating and TSSR stars as the main route:* every posted 4G account has weapon plates at 19–21 (dc:76272, dc:76816, dc:74431); plating works in every mode, including Arena and Guild Conquest where Stellar and the labs don't; and a lucky great success moved a server's top three by 200–300M in a day (dc:72479). TSSRs raise stats and deck strength and open Stellar points.

*Answer:* those accounts also sit at Stellar 8-5 to 8-6, Resolve ~1,000 and lab HP 30% (dc:76272, dc:76171), so plating is one of several things they did, not the cause. Per unit of cost, the posted plating step near 15 is ~1.5% for about ₩14,700 or four days of free Chocosteel, and past 19 every try is 2% with an 11–15% shatter; a Stellar step was +10%. TSSR stars cost ~₩289,000 for 5★, and the heavy spenders themselves say they add little in stages (dc:67616, dc:73455, dc:77420). For the stage and Rift brackets the question is displayed power, where Stellar, the guild and padding move more per unit.

*The case for Resolve:* early it is the cheapest power in the game (a new player doubled with it, dc:70429). *Answer:* agreed, early; late its flat stats shrink against percentage gear (dc:76718), which is why the late advice is to bank coins for crossing a line (dc:77116).

## Recommendation

- **Free player at 2.2G:** check the guild's research level first; keep a pure-power stage preset and swap to it within a few % of a line; open and shape the next constellation-8 points; put stones into lab HP 30% and ATK; plate sword and bow toward 20 with free Chocosteel and exchange Syrup; keep Fame daily; open banked coin chests only to cross a line. Ranked list: `curated/spending-orders.json` (`ranked_at_2_2g.free`).
- **Paying player at 2.2G:** assuming Ad Removal and the Unique pack are owned, keep the Crumble Pass and weekly keys running and buy the 5.5 membership if staying; for direct power buy Stellar Points (₩32,000 pack) before plating packs (₩9,900 for 70 Chocosteel + 30 Syrup), and TSSR stars only for Stellar points or a deck need. Ranked list: `ranked_at_2_2g.paid`.
- **Earlier stages:** the per-stage orders in `curated/spending-orders.json` (new to 168, 168–248, 248–300, 300–328, the Rift).
- Open sub-choice: 95% or 100% Stellar on an old constellation. Recommendation: stop at 95% (10 points) or 91% (8 points); 100% costs 150,000+ SP (dc:73840).
- Open sub-choice: shatter mitigation past 15. Recommendation: keep the restore Syrup in hand instead until about 18, where the unmitigated shatter is 8% (yt:_Vyl0eQz9lU).

## What would change (a map)

For the app lane; this record changed nothing outside its folder. The app's needs are written up in `.superpowers/sdd/2026-09-27-pvp/r005-report.md`.

- `packages/schema/src/enums.ts:47` `GAME_MODE`: add `"team_power"` (import.json's `record.mode`; every curated row states `mode: "team_power"`).
- `apps/server/src/importers/seed/schema.ts` and `packages/schema`: new collections for the table-shaped curated files — `power-sources.json`, `power-datapoints.json`, `packages.json`, `spending-orders.json`, `growth-curves.json`, `power-planner.json`. Not in `curated/manifest.json` yet, since the importer rejects unknown collection keys.
- `apps/web/src/app/modes/`: a team-power section with a cost-versus-efficiency view (free/paid filter) and a planner that takes the reader's team power and reads record 003's stage table.

## Side findings

- **crumb.gg's combat power board is account total power.** Its top 500 run 10.6G–33.4G on 2026-09-28 (`evidence/04-sites/pub-leaderboard.json`); team power is a different, smaller number (record 001's glossary). An app that shows the board next to team power must label it.
- **The power formula is not public.** No site or post gives it; the dynamic weighting (dc:56391) and cookie-type weights (yt:EocpkOD5NW0) are observations. A calibrated planner would need the user's own before/after readings. Consciously dropped as a follow-up here: it is the same calibration question OPEN-QUESTIONS.md already asks for the conquest simulator.
- **The guild lab has no table anywhere.** The +20% is one reply (dc:76461). Follow-up for the user: read the guild research level and its stat lines in game, or post-level screenshots, to size it.
- **Namu.wiki and Sugar Pocket's catalog API were not usable** (a Cloudflare challenge; HTTP 403 to plain requests). Record 001's catalog copies are the same game version, so nothing was lost for 1.4.002; a future record on a later version needs another route.
- **Shared source title drift:** record 002's entry for nv:43444 is titled "(arena chapter)"; this record cites the whole guide but keeps 002's entry so shared sources stay identical.
- Follow-up files under `.ai/followups/` were not written: this lane may touch only its record folder and the report.

## Sources

Every cited id is in `curated/sources.json` with its URL. The ones that settled the question:

- https://m.dcinside.com/board/projectcc/77329, /68732 — Stellar constellation-8 steps: +10% and +13%.
- https://m.dcinside.com/board/projectcc/75684, /53079, /72150 — plating gains, odds and costs, the 1.4.002 change.
- https://m.dcinside.com/board/projectcc/76718, /70429, /76008, /77116 — Resolve early and late.
- https://m.dcinside.com/board/projectcc/76461 — the guild lab claim.
- https://m.dcinside.com/board/projectcc/76272, /76171, /77104, /76290 — account snapshots at 3–4G and the 2G → 4G path.
- https://m.dcinside.com/board/projectcc/50913, /77246, /77420 — TSSR star costs and a light spender's ceiling.
- https://m.dcinside.com/board/projectcc/68116, /68148 — the gallery's package value series.
- https://cafe.naver.com/ccrumble/43444, /33130, /5693, /41221 — the cafe's guides (the first two captured by record 002).
- https://crumblehub.co/guides/spending, /guides/currency, /guides/plate-upgrade, https://crumblehub.co/api/efficiency — KRW budgets, exchange priorities, plating order, package values.
- https://apps.apple.com/us/app/cookierun-crumble-idle-rpg/id6749251466, https://apps.apple.com/kr/app/id6749251466 — USD and KRW prices.
- https://crumb.gg/data/patches.json — patch changes to the growth systems.
- https://www.youtube.com/watch?v=EocpkOD5NW0, 5XXDHBHnISU, njY-LhKqAtM, y-bxOrnjIeU, FrKqf5lhZBs, l4I2DCv7d0k, l9086mj7hwA, _Vyl0eQz9lU — KR creators on power levers, purchase and exchange orders, plating after 1.4.002.
- https://www.pocketgamer.com/cookierun-crumble/best-packs/ — the global view on packs.

## Files

- `research-trail.md`: the web rounds.
- `import.json`: the importer manifest (record mode `team_power`).
- `curated/`: the dataset; `manifest.json` lists the importable collections; `power-sources.json`, `power-datapoints.json`, `packages.json`, `spending-orders.json`, `growth-curves.json` and `power-planner.json` are the team-power tables.
- `evidence/captures.jsonl`: one line per evidence file (path, url, time, tool, sha256).
- `evidence/01-repo-grounding/repo-grounding.md`: what records 001–003 already held, with locators.
- `evidence/02-dc/`: DCInside search listings (`*.tsv`) and posts with comments (`dc/`; images local only).
- `evidence/03-naver/`: the cafe's guide board listing and posts (`nv/`).
- `evidence/04-sites/`: crumblehub guides, value table (rendered text), API and scripts; Sugar Pocket's Stellar and guide pages (rendered text); crumb.gg's patch digest and power board; Pocket Gamer; a global guide site.
- `evidence/05-youtube/`: search result pages, video metadata (`*.info.json`) and subtitles (`*.ko.vtt`, one `*.en.vtt`).
- `evidence/06-store/`: the US and KR App Store product pages.
- `evidence/07-derived/`: tables derived by `derive_growth_tables.py` (level, star, plating, oven, collection, rune reroll, package value, price tiers, bracket reach).
- `evidence/08-extract/`: this session's extractions (`BRIEF.md` describes the shape), including the transcribed plating odds.
- `evidence/build_sources.py`: builds `curated/sources.json` from every cited id.
