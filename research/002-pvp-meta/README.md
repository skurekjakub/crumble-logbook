# 002 — PvP meta: Arena and Rumble Arena (Cookie Run: Crumble)

Status: in progress (started 2026-09-27; curated 2026-09-27; refreshed 2026-10-07)

## Question

As asked: the same research as record 001 did for Guild Conquest, now for PvP, covering both regular Arena (아레나) and the new Rumble Arena (럼블 아레나; officially 와글와글 아레나, 와레나). For each mode: the meta teams and their counter-teams, every cookie's level, star level and position, sugar runes, gear, pets, perks and synergies, and why each choice is made. The user has a whale account with every cookie built.

As a falsifiable statement: for each PvP mode there is a small documented set of top teams, and for each one the community sources name the lineup, formation, levels, stars, runes, gear, pets and the teams that beat it precisely enough that someone with every cookie could reproduce it and pick a counter.

## Verdict

**Arena: supported.** A built Bari–Oven–Cherry Cola deck (`arena-bari-oven-cola`) is the strongest: from Bari 7★ it usually beats the Rye deck at equal spec, though Rye wins over 8–10★ Bari are reported. The Rye decks (`arena-rye-onecarry`, `arena-rye-rockstar`) are the value pick and beat Bari up to about 6★. Owner formation screens now give lineup, slots, levels, stars and pets for both, and crumb.gg's new meta page gives the first ladder shares: the Rye / Skating Queen / Grapevine lineup is the most run.

**Rumble Arena: supported for the lineup, partly for the build.** The top 100 still run one 12-cookie team (`rumble-standard-12`) on Season 1's last day, with Herb shown less often in the top 10 (hidden slots may hold her) and Icy Birdie on half of them. Slots come from owner attack panels; stars, gear and perks of the top-10 defenses stay hidden above 2,000 points. Season 2's buff, which decides whether the charge core survives, was unannounced on 10-07.

## Reasoning

- **Arena's order.** Set Bari > set Rye >>> plain Bari > plain Rye (dc:80465). Rye usually holds Bari up to 6★ and loses from 7★: the OP of dc:81134 and one reply say so, and a 6★-Bari server #1 can't stop a 10★ Bari with any Rye deck in regular Arena (dc:77192). It isn't absolute: in the same thread a reply says an Angel Rye deck beat Bari up to 8★ and another that at similar spec the attacker wins either way; dc:77672 has a Rockstar Rye deck repeatedly beating a 10★ Bari (its poster then lost to set Bari decks over about 50 fights; mode unclear); dc:78543 shows an 8★ Rye beating a 10★ Oven–Bari deck (mode not shown). Under 5★ a Bari deck is "a junk deck" (dc:80465, dc:82022).
- **Ruling kept: "Rye beats Bari" is mostly Rumble.** Rumble's +30% DR keeps Rye's tanks alive through the dive; regular Arena has no such buff (dc:77192, dc:74229). Medium confidence.
- **Arena gear changed.** Six Skill Haste lines lost the opening: three lines won more for a Rye deck (dc:79067), and Bari decks run none, with Skill AMP + crit rate up top and DR + crit RES below (dc:78977, dc:82006). The Arena six-haste rows are obsolete: dc:79067 calls six haste a scam with a reply confirming it, replies on dc:79151 and dc:78977 drop the bottom-right haste, and a reply on `evidence/r2026-10-07/01-dc-arena/dc/81451.md` says the gear meta moved with Bari. Two uncaptured listing titles dissent (80142 "6 haste seems better", 80391 "3 haste seems a scam", `evidence/r2026-10-07/01-dc-arena/list-dc-subject-arena.tsv`). Rumble's six-haste row stays current and is marked disputed: dc:79238 is one author's three-line choice, a reply there says six holds up better than expected, the same author's newer dc:81227 runs six on purpose, and dc:81511 is hearsay.
- **Stars are readable.** Yellow stars count to 5 and each pink star adds one; two posts' text matches the reading (dc:78977, dc:78543). The Bari deck's own screen shows Bari 7★ and Oven 9★ at 22.14M (dc:77158).
- **First regular-Arena ladder data.** crumb.gg's meta page: the Rye / Skating / Grapevine lineup 13.0%, the Rumble standard 12 11.3%; grouped, Rye builds 31% and the old five-ranged deck 15% and falling (`web:crumbgg-meta-page-1007`). Its sample is unstated.
- **Rumble's top drifts at the edges.** Herb fell from 67 to 44 revealed top-100 slots and Icy Birdie rose from 12 to 45; 9 of 12 fully revealed teams are exactly the standard 12 (`evidence/r2026-10-07/08-extract/crumbgg-figures.txt`).
- **Ruling kept: Rumble's "turtle vs charge" is one team.** Above 2,000 points 2–3 defender slots show as placeholders on attack screens, while defense logs show all 12 (dc:77491, dc:77636, dc:80927, dc:81227). High confidence now.
- **Rye decks win Rumble's middle, not its top.** 20.86M beat 32.27M (dc:78990) and an Angel/Lime list held 254th (dc:79238), but finished Bari wins higher up (dc:77408, dc:80446).
- **crumb.gg grids sort by attack range.** Every board grid and meta-page lineup lists cookies in falling range (`03-sites/SYNTHESIS.md`), matching the game's auto-placement datamine (dc:81770). Board grids give membership, not slots; the standard 12's slots are re-sourced to owner attack panels, which agree.
- **Attacker advantage.** Many players report equal defenses losing; the in-game help lists what counts in Arena and omits merc perks (dc:81024). The 10-08 update only adds help text on perks (nv:50417). Cause untested.
- **"Conquest arena" doesn't exist.** Guild Conquest (길드 토벌전) is PvE (record 001). The closest PvP mode is 부스러기 쟁탈전 (Crumb Clash), unreleased: a datamine describes base raids with 6 cookies plus bear troops, ELO and 29 tiers (dc:79879), and a coming-soon tab sits in the dungeon menu (dc:78556, nv:48555). Its tables were emptied in the latest data.
- **바궁 means Wind Archer in PvP threads**, while record 001's glossary lists it under Princess Bari. In PvP it sits in the pre-Bari ranged decks and is called the last-place TSSR; PvP posts call Princess Bari 바리, 바공 or 비리. Record 001 stays unedited, so a name resolver needs a mode-aware rule or the post's context. `curated/glossary.json` flags the clash.
- **Rumble Arena's other names:** TW 熱鬧開戰競技場; a JP video tags it わちゃわちゃアリーナ (`curated/glossary.json` sources).
- **Reading `formation_slots`.** Column 1 as the back line and column 6 as the front is inferred from attack ranges. Slots come only from owner formation screens: opponent cards look mirrored, and crumb.gg grids list cookies by attack range, not position.
- **Rumble usage bars (`curated/usage.json`).** A core's bar is an upper bound: it counts top-100 teams whose hidden slots could hold the missing members. The confirmed share counts only teams with every member revealed. The turtle 8 isn't a separate team (see the one-team ruling above); the standard-12 row's deck is `rumble-standard-12`.

## Refresh 2026-10-07

Window: 2026-09-27 (`curated/meta.json` `updated`) to 2026-10-07. Patches in it: none applied. The official board lists the 10-08 update's notes, posted 10-07 (nv:50417, maintenance nv:50393, `evidence/r2026-10-07/04-naver-global/list-naver-patch-notes.tsv`): new SSR support Chardonnay, cookie level cap 100 → 120 (level counts in Arena), Rumble Arena Season 2 opens with no passive stated (10-08 14:00 to 10-21 12:00 KST in both the Sugar Pocket page text and its client JSON's `rumble` block; the 10-08 13:30 to 10-22 12:00 dates in the same JSON are the `dimension` block's, another mode), Arena help text on merc perks, free Milk by attendance; no balance change to any cookie, pet or Arena rule. crumb.gg's patch digest now answers 404 (`evidence/r2026-10-07/03-sites/crumbgg_data-patches-404.html`). Arena is still Season 5 (dc:81572). The captures are in `evidence/r2026-10-07/`, the extractions in its `08-extract/`, the searches in `research-trail.md`.

### Changelog

| Change | Recommendation | Evidence |
|---|---|---|
| obsoleted since 2026-10-07 | gear rec, arena general "Skill Haste on all six right-side pieces": three lines won more for a Rye deck, and Bari decks run none | `evidence/r2026-10-07/01-dc-arena/dc/79067.md`, `dc/78977.md` |
| obsoleted since 2026-10-07 | gear rec, arena bottom-right "Skill Haste + crit RES (or DR)": DR + crit RES here survived the opening far more often | `evidence/r2026-10-07/01-dc-arena/dc/79067.md`, `dc/78977.md` |
| changed | gear rec, Rumble general "Skill Haste on all six right-side pieces": stays current, marked disputed. One Rye guide runs three lines, a reply says six holds up, the same author's newer guide runs six, and the drop-haste claim is hearsay | `evidence/r2026-10-07/01-dc-arena/dc/79238.md`, `dc/81227.md`, `02-dc-rumble/dc/81511.md` |
| added | gear recs: arena top-right for Bari decks, bottom-right DR + crit RES, haste counts by deck, 230% crit; Rumble haste by deck, two accuracy lines | `evidence/r2026-10-07/01-dc-arena/dc/79067.md`, `dc/78977.md`, `dc/82006.md`, `dc/80465.md`, `02-dc-rumble/dc/77704.md` |
| added | deck `arena-rye-rockstar`, Rye deck with Rockstar (own screen, stars read) | `evidence/r2026-10-07/01-dc-arena/dc/81275.md`, `dc/77725.md`, `dc/80762.md` |
| added | deck `rumble-rye-rockstar`, Rye anti-charge with Rockstar + Skating Queen | `evidence/r2026-10-07/02-dc-rumble/dc/78308.md`, `dc/78990.md` |
| added | deck `rumble-rye-angel-lime`, Rye anti-charge with Angel + Lime | `evidence/r2026-10-07/01-dc-arena/dc/79238.md` |
| added | deck `rumble-oven-rye-decoy`, Oven–Rye decoy deck | `evidence/r2026-10-07/01-dc-arena/dc/81227.md` |
| added | deck `rumble-bari-vampire`, Bari–Oven with Vampire | `evidence/r2026-10-07/01-dc-arena/dc/81227.md`, `dc/80759.md` |
| added | counters: `rye-rockstar-vs-bari-oven`, `rye-onecarry-vs-rye-rockstar`, `bari-oven-vs-evasion`, `standard-12-vs-rye-rockstar`, `rye-rockstar-vs-standard-12`, `standard-12-vs-rye-angel-lime`, `standard-12-vs-oven-rye-decoy`, `oven-rye-decoy-vs-bari-vampire` | `evidence/r2026-10-07/08-extract/dc-arena.json`, `dc-rumble.json` |
| added | runes: Angel, Lime, decoy Oven, Chain Pinot | `evidence/r2026-10-07/01-dc-arena/dc/79238.md`, `dc/81227.md`, `dc/78350.md` |
| added | usage: Rumble top-100 cookie, pet and pet-set counts and the standard-12 count of 10-07; meta-page cookie, pet and lineup shares for both modes | `evidence/r2026-10-07/08-extract/crumbgg-figures.txt` |
| changed | counters `rye-onecarry-vs-bari-oven` and `bari-oven-vs-rye-onecarry`: the flip moves from 8★ to Rye usually holding up to 6★, Bari usually winning from 7★ | `evidence/r2026-10-07/01-dc-arena/dc/81134.md`, `dc/80465.md`, `dc/77192.md` |
| changed | counter `rye-anticharge-vs-standard-12`: Rye on 2 of the top 100 on 10-07; top-end losses re-sourced | `evidence/r2026-10-07/02-dc-rumble/dc/80446.md`, `03-sites/pub-stats.json` |
| changed | deck `arena-bari-oven-cola`: formation re-sourced to the owner screen dc:77158 with stars; ceiling, perks and substitutions refreshed | `evidence/r2026-10-07/01-dc-arena/dc/77158.md`, `dc/78977.md`, `04-naver-global/nv/nv-48978.md` |
| changed | deck `arena-rye-onecarry`: the most-run Arena lineup (13.0%); Rockstar moved to its own deck | `evidence/r2026-10-07/03-sites/crumbgg_pub-meta-page.json` |
| changed | decks `arena-rye-seeker` and `arena-evasion`: new ceilings (8★ Rye beat 10★ Oven–Bari; 14.38M beat 27.35M) | `evidence/r2026-10-07/01-dc-arena/dc/78543.md`, `dc/80136.md` |
| changed | deck `rumble-standard-12`: slots re-sourced from crumb.gg's grid to owner attack panels (same slots); levels, Herb → Rockstar and Icy Birdie substitutions | `evidence/r2026-10-07/02-dc-rumble/dc/77491.md`, `dc/77636.md`, `03-sites/pub-stats.json` |
| changed | every deck, counter, rune, gear, mechanic, takeaway and rule string shortened to the scannable-copy rule, citations kept | `curated/` |
| changed | `meta.json`: caveat, season, `you`, `formation_slots` (no crumb.gg slot mapping), Arena rules (what counts, level cap, tickets) and Rumble rules (Season 2 dates, leagues to Champion, hidden defenders, medals +175, reward cliff) | `evidence/r2026-10-07/01-dc-arena/dc/81024.md`, `03-sites/cookieruncrumble_app_rumble-arena.html`, `02-dc-rumble/dc/82055.md` |
| changed | mechanics: Bari star rulings, attacker advantage, DR stacking, haste formula, stars on cards, grid order, Chardonnay | `evidence/r2026-10-07/01-dc-arena/SYNTHESIS.md`, `04-naver-global/nv/nv-46716.md` |
| re-captured | `web:crumbgg-rumble-live`, `-stats`, `-history`: new numbers filed as `web:crumbgg-rumble-live-1007`, `-stats-1007`, `-history-1007`; rows curated from the earlier text keep their ids | `evidence/r2026-10-07/03-sites/pub-live-rumble_arena.json`, earlier `evidence/03-sites/crumbgg_pub-live-rumble_arena.json` |
| re-captured | `web:crumbgg-no-arena-board`: still 404, but crumb.gg's new meta page now covers regular Arena | `evidence/r2026-10-07/03-sites/crumbgg_pub-live-arena-404.json`, `crumbgg_pub-meta-page.json` |

### Unconfirmed this round

No source in the round mentioned these; they stay current:

- `arena-chain`, `arena-crepe-espresso` (one reply calls it outdated, dc:79368; no result either way), `arena-five-ranged` (legacy), `rumble-bari-crepe-cola`, `rumble-bari-lowstar`, `rumble-wizard`, `rumble-evasion`, `rumble-ranged`, and their counter edges. Searched: the saved DC searches, `회피`, `명중`, `락스타`, `천사` (`evidence/r2026-10-07/01-dc-arena/list-*.tsv`).

### Couldn't settle

- **Rumble Season 2's passive.** Not in the notes or the client data (`03-sites/cookieruncrumble_app_rumble-arena.html`). Read the in-game Rumble panel after 10-08 16:00 KST.
- **Chardonnay in PvP.** Only datamined numbers (dc:79685) and speculation. Needs post-release fights.
- **The level cap.** The official notes say 120; a datamine wiki says 150 (`03-sites/teamhobby_patchnotes.html`). Check in game.
- **What causes the attacker advantage**, and whether perks apply on defense. Read the new help text after 10-08.
- **crumb.gg's meta-page sample and method.** Unstated; the shares may count defenses, opponents or crumb.gg users.
- **Whether Herb is gone from the top-10 Rumble teams** or only hidden: hidden slots cover it on most.
- **Bari's star floor in Rumble:** 5★ vs 8★ (dc:82000). A ranked 5★ vs 8★ result would settle it.
- **Rumble gear's haste count.** Six, three or none: dc:79238 runs three on a Rye deck, dc:81227 six on its decoy deck, and dc:81511 only heard to drop it. Rumble win rates by haste count would settle it.
- **The Rumble shop reset:** two weeks, monthly or never (dc:82217, dc:82260, dc:81405).

## Sources

Each lane's synthesis explains its captures:

- `evidence/01-dc-arena/SYNTHESIS.md`, `evidence/r2026-10-07/01-dc-arena/SYNTHESIS.md`: DCInside, regular Arena.
- `evidence/02-dc-rumble/SYNTHESIS.md`, `evidence/r2026-10-07/02-dc-rumble/SYNTHESIS.md`: DCInside, Rumble Arena.
- `evidence/03-sites/SYNTHESIS.md` and `SOURCES.md`, `evidence/r2026-10-07/03-sites/SYNTHESIS.md`: crumb.gg, crumblehub, Sugar Pocket, alkapa, 삥스크럼블.
- `evidence/04-naver-global/SYNTHESIS.md`, `evidence/r2026-10-07/04-naver-global/SYNTHESIS.md`: the official Naver cafe, YouTube and EN guides.

The round's new sources that settled it:

- https://cafe.naver.com/ccrumble/50417 — the 10-08 update notes.
- https://crumb.gg/pub/meta-page — lineup shares for regular Arena and Rumble.
- https://crumb.gg/pub/live?board=rumble_arena and https://crumb.gg/pub/stats — the Rumble top 100 on 10-07.
- https://cookieruncrumble.app/rumble-arena/ — the season calendar and tiers from client data.
- https://m.dcinside.com/board/projectcc/80465, /81134, /77192 — the Bari star thresholds; /79067, /78977 — the gear change; /77158, /81275 — owner formation screens; /81227, /79238 — the Rumble Rye guides; /79879 — the Crumb Clash datamine.

Every cited id is listed with its URL in `curated/sources.json`.

## Files

- `import.json`: the importer manifest (record row, capture rules for both rounds, no rankings).
- `searches.json`: the saved searches, with each one's last hit.
- `research-trail.md`: the searches each round ran.
- `curated/manifest.json`: which file holds each collection.
- `curated/meta.json`: header copy, the account recommendation (`you`), `formation_slots`, and per-mode `lede`, `caveat` and `rules`.
- `curated/decks.json`: teams per mode, with slot, level, stars and why per cookie; displaced decks carry an `obsolete` block.
- `curated/counters.json`: directed "team is beaten by" edges.
- `curated/usage.json`: crumb.gg usage and meta-page shares, and crumblehub's shared Arena decks, each dated.
- `curated/runes.json`, `curated/gear.json`: builds per mode; obsolete rows carry an `obsolete` block.
- `curated/mechanics.json`, `curated/takeaways.json`, `curated/timeline.json`, `curated/rng.json`: rulings, takeaways, dated events, variance.
- `curated/scores.json`: empty; PvP has no damage scores.
- `curated/glossary.json`: PvP names that record 001's glossary lacks.
- `curated/sources.json`: every source.
- `evidence/NN-*/`: the first round's verbatim captures. `evidence/08-extract/`: its extractions, in the schema of `evidence/08-extract/BRIEF.md`.
- `evidence/r2026-10-07/`: the 2026-10-07 round, in the same folders: `01-dc-arena/` and `02-dc-rumble/` (listings per search id and posts), `03-sites/` (crumb.gg, crumblehub, Sugar Pocket, crumbleguides, 삥스크럼블), `04-naver-global/` (cafe listings and articles, YouTube searches, channels and watch digests), `08-extract/` (per-lane extractions, the sites summaries, and `crumbgg-figures.mjs` with its output).
