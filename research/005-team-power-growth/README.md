# 005 — Team power growth: what raises 전투력, at what cost (Cookie Run: Crumble)

Status: active (started 2026-09-28; captured and curated 2026-09-28; corrected after the Opus review on 2026-09-28; refreshed 2026-10-07, see Refresh 2026-10-07)

Measured on 2026-09-28 from the worktree lane `worktree-agent-a088760dcf93fccb3` (base `12ecfb9`), against the community sources and store pages listed under Sources and captured in `evidence/`, plus the game data (1.4.002) that record 001 captured. The research changed no code. The curated dataset imports as the app's `team_power` mode (`pnpm import:record 005-team-power-growth`, after records 001 to 004); the app's Team power section shows it.

## Question

As asked: what are the best ways to raise team power (the combat power the game shows for a team, 전투력) in Cookie Run: Crumble, free and pay-to-win alike? Assess each on cost (in-game currencies and materials, time for free players, real money for paid routes, package prices in KRW and USD where shown) and efficiency (team power gained per unit of cost, and how that changes with account progress). Cover every power source the game has, with the power it adds (real before/after numbers where players post them), what it costs and whether that is free, time-gated or paid, its caps and diminishing returns, and the order players recommend spending in. Finish with a ranked spending order for a free player and for a paying one at the account stages the sources discuss, one of them a team near 2.2G. Link each source to what it does for the stage-pushing and Dimensional Rift brackets of record 003.

As a falsifiable statement: the community sources name every system that adds displayed team power, and for each they give (or let us derive) a cost and a power gain precise enough to rank the systems by power per unit of cost, separately for a free and a paying player, and to say which one moves a 2.2G team across the next bracket line of record 003 soonest.

## Verdict

**Partly supported.** The sources name every power source and give a cost, a cap and a recommended order for each (`curated/power-sources.json`), but a posted before/after team-power gain exists only for the rows of the table under Reasoning 3, and most of those have no posted cost. So the orders below are the community's stated orders, checked against those few measurements, not a ranking by power per unit. The one posted gain that moved a 2G team a whole step is still Stellar Link: opening the third point of constellation 8 took a player from 2.0G to 2.2G (+10%, dc:77329). That step is within reach of free pulls (free pulls stop at 8-3, dc:76290); the points past 8-3 need paid pulls. The 2026-10-07 round adds the next free lever, which lands on 2026-10-08: the cookie level cap goes from 100 to 120 (nv:50417), and a level-120 cookie has about 64% more base stats than at 100 (inferred from crumb.gg's level-120 stats, `evidence/r2026-10-07/07-derived/level-120.json`); one poster's calculation from the leaked tables puts level 119 at about +25% power (dc:81689, claimed). No one has a level-120 cookie yet, so no gain is posted. The round also posted a lab gain (special research 19, ATK +30%: +2.3% at 3.4G, dc:82156) and the first sizes for the guild: leaving one cost a player about 23% of account total power (13G → ~10G, dc:81826). Plating and Stellar can't be compared per won: a plating step near 15 is about +1.5% for about ₩14,700 (inferred from dc:75684 and dc:53079), while the next Stellar points need about 45 cookie stars, which at the TSSR pickup rate would cost on the order of ₩2.3–4.2 million (inferred upper bound; SSR stars cost less but no capture prices them) for a gain no one posted. The guild's size is still known only in account total power, not team power. Paid, the community's growth engine is Ad Removal and the Crumble Pass ($4.99 / ₩7,500 each), the weekly dungeon keys ($3.99 / ₩6,000) and the ₩55,000 permanent membership; none of them has a posted power figure.

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
   | Gnome Lab special research 19, ATK amp 30% (2026-10-07) | 3.4G (team or total not stated) | +76.87M (+2.3%) | special research stones (not posted) | dc:82156 (screenshot) |
   | Leaving a guild (2026-10-06) | 13G account total | 13G → ~10G (−23%); joining earlier gave +2G | — | dc:81826, dc:78400 |
   | Cookie level 100 → 119 (from 10-08) | — | ~+25% power | Crumble level 195 | dc:81689, dc:82104 (claimed: a reverse calculation from the leak) |

   All rows: `curated/power-datapoints.json`; the posts: `evidence/08-extract/dc.json` and `evidence/r2026-10-07/08-extract/dc-*.json`.
4. **Costs and diminishing returns.** Stellar: 10 SP a roll unlocked, 220 with six points locked (`evidence/04-sites/sugarpocket_stella_rendered.txt`); expected costs from the guides, not posted spends: ~550 SP to roll a 3-point maximum from scratch (nv:5693), ~1,900 for the 8-point 91% octagon, ~5,300–7,900 for 95% at 10 points, 150,000–400,000 for 100% (nv:43444, dc:55570, dc:56417, dc:73840, web:yt-mL9MSX3QD94); later constellations give more per % of area (nv:5693; web:yt-y-bxOrnjIeU). Stellar points open with cookie stars: 8-3 → 8-6 is about 45 stars and past 8-3 needs paid pulls (dc:76290). Cookie stars: a pickup TSSR costs ~₩288,800 for 5★ and ~₩972,000 for 10★ (dc:50913), about ₩51,000–94,000 a star on average (inferred from the same table). Plating: success 90% at 0→1, 14% at 14→15, 2% from 19→20 to 24→25; ~414 Chocosteel and 43 Syrup expected per slot to 15; free Chocosteel is 24 a day (`evidence/08-extract/plate-rates.json`, dc:72150, web:yt-l9086mj7hwA). Resolve: flat +2 ATK/DEF and +20 HP per level after 101, cap 1,500 (`evidence/04-sites/data-patches.json`). Levels: 91–100 take ~77% of the EXP to 100 (`evidence/07-derived/level-curve.json`). Oven: gear level = oven × 3, Eternal from oven 31 at 0.002% a draw (`evidence/07-derived/oven-gear.json`). Lab nodes near the top cost 1.6M–6M research stones, ATK 30% ~50M (web:yt-y-bxOrnjIeU, dc:77277, dc:76620). Condensed: `curated/growth-curves.json`.
5. **Prices, KR and global.** KR: crumblehub's plan puts a light spender at ₩85,000, medium ₩217,900, a full buyer ₩2,646,400 (`evidence/04-sites/crumblehub_guides_spending_ko.html`); its value table ranks packages by Crystal value per KRW, which is not team power (`evidence/07-derived/package-value.json`). Global: the US App Store lists the Crumble Pass and Ad Removal at $4.99 (₩7,500 in KR) and the Daily Dungeon Key Set at $3.99 (₩6,000); the other paired tiers are in `evidence/07-derived/price-tiers.json`. The ₩55,000 membership has no captured USD price. Galaxy Store coupons (KR only) cut about 25% (web:yt-l4I2DCv7d0k). Table: `curated/packages.json`.
6. **The community's orders agree.** The cafe guidebook, the KR creators and crumblehub give the same free order (cheap early levers first, Stellar kept at ~70% until later constellations, plating in steps of 5, coin chests banked until a 35% line fails) and the same paid order (the permanent and pass purchases first, TSSR stars last), with Syrup Metal first in every exchange (nv:43444 §7.2, web:yt-njY-LhKqAtM, web:yt-5XXDHBHnISU, dc:76008, web:crumblehub-spending, web:yt-FrKqf5lhZBs, web:yt-l4I2DCv7d0k, dc:77246, dc:73455, web:yt-l9086mj7hwA, web:crumblehub-currency). Ordered by account stage in `curated/spending-orders.json`, which marks each step as measured, claimed or community order.
7. **Patch changes that move the curves.** 2026-08-13 Resolve per-level stats doubled after 101; 2026-08-27 Resolve to 1,000 and quest rewards past 168 cut by up to 97%; 2026-09-10 Fame to 360, Resolve to 1,500, lab to 90-2; 2026-09-17 mileage shop overhaul; 2026-09-23 plating to 25 with a 2-level shatter and Syrup restore, lab to 110-2, stages eased; 2026-10-02 oven auto-open to 200–500 dough at a time from oven 32 (nv:48486). Announced 2026-10-07 for 10-08: cookie cap 120, Lv.79–100 EXP cut ~75% with refunds, lab to 130-2 (special 22) with 12 h per research, Chocosteel and Syrup Metal in the mileage shop and more in the Rift exchange, a free Milk from a check-in (nv:50417). `curated/timeline.json`.
8. **Displayed power is not strength.** Attack-type cookies and the stats a lineup lacks count more; accuracy past ~1,000 adds little; crit resistance pads most (web:yt-EocpkOD5NW0, dc:56391, dc:74089). A synergy team at 614k cleared where a raw 649k did not (web:yt-6DFlOgeXLds). That is why record 003's pushers keep a stage preset padded for power; no capture measures how much team power the padding adds. A formula decompiled from the client and posted on 2026-10-05 fits these observations: a cookie's power is about √(offense × survival) × a role weight, with crit resistance inside survival, and team power is the sum over the lineup (dc:81470, claimed; it can't be checked from outside the client).
9. **Level 120 (from 2026-10-08).** crumb.gg's digest of update 1.5.002 lists the new SSR at level 120, 10★; dividing its stats by its base stats and the 10★ multiplier gives a level-120 multiplier of ×45.1 against ×27.5 at 100, the same method returning Princess Bari's level-100 stats exactly (`evidence/r2026-10-07/07-derived/level-120.json`). That is +64% on a cookie's base stats; gear and Resolve don't grow with level, and power takes a square root (Reasoning 8), so the team-power gain is smaller: one poster's reverse calculation from the leak gives about +25% at level 119 (dc:81689, dc:82104, claimed). The level table leaked on 2026-10-02 (dc:79865, a screenshot) carries the same level-120 multiplier, so the two sources agree; it also prices the levels: 101–120 take about 252M EXP per cookie (cumulative 28.56M at 100, 280.45M at 120), against 28.6M from 1 to 100 after the cut, and each level past 100 needs 5 more Crumble (account) levels, 200 for level 120. Posters sit at Crumble 175–192 (dc:81501), so most can reach levels 115–118 first. The leak's table runs to 150 (Crumble 350, 8.36G EXP), which is where the "150" comes from; the notes say 120 (dc:82186, nv:50417).

## The steelman

*The case for plating and TSSR stars as the main route:* most posted 4G accounts have weapon plates at 19–21 (dc:76272, dc:76816, dc:74431); plating works in every mode, including Arena and Guild Conquest where Stellar and the labs don't; and a server's top three each gained 200–300M at once, which the poster put down to plating great successes (dc:72479). TSSRs raise stats and deck strength and open Stellar points.

*Answer:* not every 4G account got there by plating: the 2G → 4G player in dc:76290 has no plate above 18 ("20강이 어딨어 … 18 2개가 끝임") and credits oven level, research, Bari 5★ and Stellar 8-6. The plating 4G accounts also sit at Stellar 8-5 to 8-6, Resolve ~1,000 and lab HP 30% (dc:76272, dc:76171), so plating is one of several things they did, not the cause. Per unit of cost, the posted plating step near 15 is ~1.5% for about ₩14,700 or four days of free Chocosteel, and past 19 every try is 2% with an 11–15% shatter. The 2026-10-07 round adds a cautionary spend: about ₩350,000 of Chocosteel and Syrup bundles left one staff plate at +17, down from +19 (dc:78966). TSSR stars cost ~₩289,000 for 5★, and heavy spenders themselves say they add little in stages (dc:67616, dc:73455, dc:77420); their power comes mostly through the Stellar points they open, which is why neither can be ranked above the other per won here.

*The case that level 120 doubles team power* (the gallery's first reading of the leak, dc:82104, dc:80209): a level-120 cookie's base stats grow by 64%, and the leak's table ran to 150. *Answer:* the cap shipped at 120, not 150; base stats are one part of a cookie's ATK and HP beside gear, Resolve and amplifications, and power takes the square root of offense × survival (dc:81470), so the one calculation posted puts level 119 at about +25% (dc:81689); and the Crumble-level gate holds most accounts at 115–118 at first (dc:79865, dc:81501). Large, but not double, and not posted until players reach it.

*The case for Resolve:* early it is the cheapest power in the game (a new player doubled with it, dc:70429). *Answer:* agreed, early; late its flat stats shrink against percentage gear (dc:76718), which is why the late advice is to bank coins for crossing a line (dc:77116).

## Recommendation

- **Free player at 2.2G:** the parts backed by a posted gain are the constellation-8 points up to 8-3 (+10% at 2G), the lab's special research 19 (ATK +30%: +2.3% at 3.4G) and, weakly, plating near 15 (+1.5% at 1.6G). From 2026-10-08, bank cookie EXP for levels 101–120: the gain is inferred (+64% base stats) or claimed (~+25% power at 119), not posted, but it is the largest free lever announced. The rest is the community's order: stay in a guild with research (leaving cost one player ~23% of account total power, dc:81826); keep a stage preset padded for power and swap to it within a few % of a line (unmeasured, record 003's practice); put stones into lab HP 30% and the lower ATK nodes, since ATK 30% costs ~50M stones and the lower nodes pay better (dc:76620); plate sword and bow toward 20 with free Chocosteel and exchange Syrup; keep Fame daily; open banked coin chests only to cross a line. Constellation-8 points past 8-3 need paid pulls. Ranked list with each step's basis: `curated/spending-orders.json` (`ranked_at_2_2g.free`).
- **Paying player at 2.2G:** the community's order, with no posted power figure for any package: keep the Crumble Pass and weekly keys running, buy the 5.5 membership if staying (assuming Ad Removal and the Unique pack are owned) and the ₩19,000 Rumble Special Pass while it runs; skip the 3.3 membership and the Bari surprise pack (`curated/packages.json`). For direct power, Stellar Points (₩32,000 for 12,000 SP) are the cheapest way to add area once points are open, and plating packs (₩9,900 for 70 Chocosteel + 30 Syrup) buy about +1.5% per step near 15; opening more Stellar points means buying cookie stars, priced above. Ranked list: `ranked_at_2_2g.paid`.
- **Earlier stages:** `curated/spending-orders.json`, one block per account stage.
- Open sub-choice: 95% or 100% Stellar on an old constellation. Recommendation: stop at 95% (10 points) or 91% (8 points); 100% costs 150,000+ SP (dc:73840).
- Open sub-choice: shatter mitigation past 15. Recommendation: keep the restore Syrup in hand instead until about 18, where the unmitigated shatter is 8% (web:yt-_Vyl0eQz9lU).

## What would change (a map)

For the app lane; this record changed nothing outside its folder and `OPEN-QUESTIONS.md`. The app's needs were written up in `.superpowers/sdd/2026-09-27-pvp/r005-report.md` (local, gitignored). The app build of 2026-09-28 did each of them:

- `GAME_MODE` has `"team_power"`, the mode `import.json` and every curated row state.
- The curated manifest leaves out decks, runes, gear and RNG: those collections became optional, so the record carries no empty files (a record of a mode with lineups that leaves out its decks gets a warning).
- Sources whose captures sit in records 001–003 (dc:67596, dc:76290 and the Naver guides captured by record 002) still raise "no capture under this record's capture rules" warnings on import, as expected.
- Every table-shaped curated file is in `curated/manifest.json` and imports into its own table (`packages/schema/src/tables/team-power.ts`).
- The app's Team power section has the cost-against-efficiency view and a planner that takes the reader's team power and reads record 003's stored brackets and chapters.

After 2026-10-08 (from the 2026-10-07 round; nothing here is done yet):

- Record 003's stage table ends at 328-30 and its bracket reach tops out there; 1.5.002 adds stages to 364-30, so the planner's reach columns stop short of the new stages until record 003 captures their recommended power (new stages near 10G, the last near 9.3–9.7G by posters' recollection, dc:79793, dc:81604, dc:81782).
- The first posted level-120 gains will replace `level-119-claim` and the inferred `level-120-stats` row; the cookie-level step can then be `posted` in the planner.
- Packages first listed on 10-08 (a "new region" pack and an update pack Vol.2, each with 50 Chocosteel and 50 Syrup Metal; dc:82133) have no prices yet.

## Side findings

- **crumb.gg's combat power board is account total power.** Its top 500 run 10.6G–33.4G on 2026-09-28 (`evidence/04-sites/pub-leaderboard.json`); team power is a different, smaller number (record 001's glossary). An app that shows the board next to team power must label it.
- **The power formula is not public.** No site or post gives it; the dynamic weighting (dc:56391) and cookie-type weights (web:yt-EocpkOD5NW0) are observations. A calibrated planner would need the user's own before/after readings. Consciously dropped as a follow-up here: it is the same calibration question OPEN-QUESTIONS.md already asks for the conquest simulator. *2026-10-07:* a gallery poster published a formula decompiled from the client, with role weights and the Guild Conquest recommended power (10,004,798,560) (dc:81470); it fits the observations but is unverified, and a decompiled client is not something this repo stores.
- **crumb.gg's board grew fast.** On 2026-10-07 the top 500 run 21.8G–50.8G account total (09-28: 10.6G–33.4G; `evidence/r2026-10-07/04-sites/pub-leaderboard.json`). No capture says why; the Rift's own power growing account totals is a guess.
- **The guild lab has no table anywhere.** The +20% is one reply about account total power (dc:76461). Follow-up: added to `OPEN-QUESTIONS.md` (read the guild's research level and its stat lines in game to size it). *2026-10-07:* two nodes are now on screen (14-2 Light damage +10%, 15-3 HP amplification +7%; dc:81723, dc:78621), crumb.gg's calculator applies a guild ATK amplification of ×1.30 in its example (dc:82457), and one player lost ~23% of account total power on leaving (dc:81826). Still no team-power figure; the open question stands.
- **Namu.wiki and Sugar Pocket's catalog API were not usable** (a Cloudflare challenge; HTTP 403 to plain requests). Record 001's catalog copies are the same game version, so nothing was lost for 1.4.002; a future record on a later version needs another route.
- **Shared source title drift:** record 002's entry for nv:43444 is titled "(arena chapter)"; this record cites the whole guide but keeps 002's entry so shared sources stay identical.
- **`evidence/build_sources.py` is retired.** Its id pattern missed ids cited inside prose; `evidence/build_sources_2.py` replaces it (the old script stays, unedited, under its ledger line).

## Refresh 2026-10-07

Window: 2026-09-28 to 2026-10-07. Patches in it: the 1.4.002 hotfix of 2026-10-02, oven auto-open of 200/300/400/500 dough at a time from oven 32/34/36/38 and 100 gear held (nv:48486, `evidence/r2026-10-07/03-naver/nv/nv-48486.md`; crumb.gg's `04-sites/data-patches.json`). No balance change to existing cookies or pets. Announced in the window and landing after it, on 2026-10-08 (1.5.002; nv:50417, `03-naver/nv/nv-50417.md`): cookie cap 100 → 120, Lv.79–100 EXP cut with refunds, Gnome Lab to 130-2 and special 22 with 12 h per research, Chocosteel and Syrup Metal in the mileage shop and more in the Rift exchange, a free Milk from a 7-day check-in, Rumble Arena season 2, stages to 364-30. crumb.gg's patch digest answered 200 on 2026-10-07 (the round brief had it at 404) and is captured as `04-sites/data-patches.json`; it already lists 1.5.002 as upcoming.

### Changelog

| Change | Recommendation | Evidence |
|---|---|---|
| changed | power source `cookie_level`: cap 120 from 10-08 with its Crumble-level gate; +64% base stats at 120 (inferred), ~+25% power at 119 (claimed); EXP to 100 cut 98.1M → 28.6M; bank EXP | `evidence/r2026-10-07/07-derived/level-120.json`, `02-dc/dc/79865.md`, `02-dc/dc/81689.md`, `03-naver/nv/nv-50417.md` |
| changed | power source `gnome_lab`: cap 130-2 and special 22 from 10-08; posted gain for special research 19 (+2.3% at 3.4G); the cafe guide's order | `02-dc/dc/82156.md`, `02-dc/dc/79685.md`, `03-naver/nv/nv-48555.md` |
| changed | power source `guild_lab`: first sizes, in account total (13G → ~10G on leaving; +2G on joining) and two node values | `02-dc/dc/81826.md`, `02-dc/dc/78400.md`, `02-dc/dc/81723.md`, `02-dc/dc/78621.md` |
| changed | power source `stellar_link`: stars per point (8-5 at 690, 8-6 at 705) and amplification per area by constellation; open pulls up to 8-6 | `02-dc/dc/78814.md`, `02-dc/dc/78964.md`, `02-dc/dc/81196.md` |
| changed | power sources `gear_oven` (auto-open from 10-02), `plating` (Syrup and Chocosteel sources from 10-08), `lineup` (the decompiled formula, claimed), `cookie_stars` (free Milk) | `03-naver/nv/nv-48486.md`, `03-naver/nv/nv-50417.md`, `02-dc/dc/81470.md` |
| added | packages `rumble-special-pass` (₩19,000, buy), `dungeon-challenger`, `premium-adventure`, `surprise-wisp` (skip) | `06-store/appstore_kr_id6749251466.html`, `02-dc/dc/81113.md`, `02-dc/dc/78666.md`, `02-dc/dc/82058.md`, `02-dc/dc/78599.md` |
| changed | packages `plate-thanks` (buy all three), `permanent-growth` (skip, a decoy), `choco-drop-pet` (only to 20★), `daily-dungeon-keys-weekly`, `arena-tickets`: verdicts | `02-dc/dc/78666.md`, `02-dc/dc/81565.md`, `02-dc/dc/79355.md`, `02-dc/dc/82346.md`, `02-dc/dc/81881.md` |
| added | spending steps: bank EXP for 101–120 (endgame free), the Rumble Special Pass (endgame paid and the ranked paid order) | `02-dc/dc/80209.md`, `02-dc/dc/81113.md` |
| added | data points `lab-special19-atk30-3.4g`, `guild-leave-13g`, `level-120-stats`, `level-119-claim`, `level-150-one-cookie`, account snapshots, `crumbgg-total-top500-1007` | `08-extract/dc-a.json`, `08-extract/dc-b.json`, `04-sites/pub-leaderboard.json` |
| added | planner steps for the lab (posted) and cookie level (claimed) | `02-dc/dc/82156.md`, `02-dc/dc/81689.md` |
| changed | growth curves: cookie level to 120 with EXP and Crumble level; Stellar amplification for constellations 5–8; plating 16→17; lab caps and expansion costs; Resolve snapshots | `02-dc/dc/79865.md`, `08-extract/dc-c.json`, `02-dc/dc/81697.md`, `02-dc/dc/82242.md` |
| re-captured | web:crumblehub-api-efficiency, crumblehub guides, Pocket Gamer, the EN progression guide: unchanged; App Store KR/US: top purchases rotated; crumb.gg board: top 500 now 21.8G–50.8G | `04-sites/`, `06-store/`, earlier `evidence/04-sites/`, `evidence/06-store/` |

No recommendation was marked obsolete: the team-power tables carry no obsolete lifecycle (only decks, rune builds, gear recommendations and counters do), and nothing the record recommends was displaced; the cap raise adds a lever, it doesn't replace one.

### Unconfirmed this round

No source in the window mentioned the Stellar Link Packs, the monthly memberships, the Stage and Level Passes, Wind Archer or Cake Hound packs, Sweet Blessing packs, Fame beyond snapshots, or the shatter-mitigation sub-choice; they stay as they were. The searches that came back without them: `02-dc/list-dc-package.tsv`, `list-dc-pass.tsv`, `list-dc-membership.tsv`, `list-dc-blessing.tsv`, `list-dc-sweet.tsv`, `list-dc-value.tsv`. Plating near 15 (+1.5% at 1.6G) and the constellation-8 steps (+10%, +13%) got no new before/after figure.

### Couldn't settle

- The team-power gain of levels 101–120: no one has them before 10-08. A before/after from a player levelling a lineup past 100 would settle it.
- The EXP for 101–120 in the live game: only the leak's table (dc:79865); the notes give 79–100 only.
- The guild lab in team power: the figures are account total. A team-power reading before and after a guild change (OPEN-QUESTIONS.md § Team power growth) would settle it.
- Whether dc:82156's +76.87M is team or total power: the popup doesn't say.
- Prices of the 10-08 packages with Chocosteel and Syrup (dc:82133): not on sale yet.
- Not captured this round: Sugar Pocket's rendered pages (agent-browser isn't installed on this machine; the pages were saved as served), the videos' subtitles (no yt-dlp), and cookierun.wiki (a Cloudflare challenge).

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
- Refresh 2026-10-07:
  - https://cafe.naver.com/ccrumble/50417, /48486 — the 10-08 notes (cap 120, EXP cut, lab 130-2, mileage Chocosteel and Syrup, free Milk) and the 10-02 oven auto-open.
  - https://cafe.naver.com/ccrumble/48555 — the guide board's newcomer guide: purchase and lab order.
  - https://crumb.gg/data/patches.json (captured 2026-10-07) — update 1.5.002 with the level-120 stats the multiplier is derived from.
  - https://m.dcinside.com/board/projectcc/79865, /79685, /82186 — the leaked level table, lab expansion and the leak against the notes.
  - https://m.dcinside.com/board/projectcc/81689, /82104, /82182 — the level-119 and level-150 power calculations.
  - https://m.dcinside.com/board/projectcc/82156 — the lab's special research 19 gain.
  - https://m.dcinside.com/board/projectcc/81826, /78400, /81723, /78621 — the guild lab's first sizes.
  - https://m.dcinside.com/board/projectcc/78814, /78964, /81196, /77737 — Stellar points by cookie stars and amplification per area.
  - https://m.dcinside.com/board/projectcc/81470 — the decompiled power formula (claimed).
  - https://m.dcinside.com/board/projectcc/81113, /78666, /82058, /78966, /81565, /79355 — package and pass verdicts.
  - Every other cited post is in `curated/sources.json`.

## Files

- `research-trail.md`: the web rounds.
- `import.json`: the importer manifest (record mode `team_power`).
- `curated/`: the dataset; `manifest.json` lists every collection the app imports, the team-power tables named in "What would change" among them. Changed for the app on 2026-09-28, with no value dropped: every step in `spending-orders.json` states its `basis` as data (`posted`, `claimed`, `unmeasured` or `community`; the record's wording moved to `basis_note`, and a step with none is `community`, as the file's `about` says of the whole order), and the ranked order near 2.2G has an id, a label and a basis per entry; `growth-curves.json` holds each curve as a table (`columns`, `rows`, and `row_sources` where rows were cited apart); `power-planner.json`'s `what_a_step_buys` names each step's data point, basis and sources; the price tiers in `packages.json` cite the App Store captures that pair them, which they lacked. Corrected after the app's Opus review, the same day: a step is `posted` only when the step itself is what a player measured, so the endgame plating step toward 19–20 and the plate thanks packs step are `community`, their notes kept (the posted gain is near 15, and no package has a posted figure), and the file's `about` now defines `community` as the step's place being the community's order, whatever figures its why cites; data points a post gives loosely (a range's midpoint, a question, an unclear kind of power) carry `approximate: true`; page text names the app's pages instead of curated or evidence files, and says "your 2.2G team"; `takeaways.json` carries the steelman's answer and the open sub-choices, so the app's overview shows them.
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
- `evidence/r2026-10-07/`: the 2026-10-07 refresh round.
  - `02-dc/list-<search id>.tsv`: one DCInside listing per saved and discovery search; `02-dc/dc/`: the posts read (images local only).
  - `03-naver/list-naver-patch-notes.tsv`, `list-naver-guide-board.tsv`, `list-naver-guide-board-4p.tsv`: the patch board and the guide board; `03-naver/nv/`: the notices and guide posts.
  - `04-sites/`: crumb.gg's patch digest and power board, crumblehub, Sugar Pocket (as served, not rendered), Pocket Gamer, the EN progression guide.
  - `05-youtube/`: the saved searches (`ytq-*.html`), the channel pages (`channel-*-videos.html`) and watch digests (`yt-*.txt`).
  - `06-store/`: the App Store pages.
  - `07-derived/derive_level_120.mjs` and `level-120.json`: the level-120 multiplier and the EXP cut.
  - `08-extract/`: the round's extractions in the first round's shape (`dc-a.json` to `dc-d.json`, `naver.json`, `naver-guide-board.json`, `sites.json`, `youtube.json`).
