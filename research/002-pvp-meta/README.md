# 002 — PvP meta: Arena and Rumble Arena (Cookie Run: Crumble)

Status: in progress (started 2026-09-27; curated 2026-09-27)

## Question

As asked: the same research as record 001 did for Guild Conquest, now for PvP, covering both regular Arena (아레나) and the new Rumble Arena (럼블 아레나; officially 와글와글 아레나, 와레나). For each mode: the meta teams and their counter-teams, every cookie's level, star level and position, sugar runes, gear, pets, perks and synergies, and why each choice is made. The user has a whale account with every cookie built.

As a falsifiable statement: for each PvP mode there is a small documented set of top teams, and for each one the community sources name the lineup, formation, levels, stars, runes, gear, pets and the teams that beat it precisely enough that someone with every cookie could reproduce it and pick a counter.

## Verdict

**Arena: partly supported.** Two decks lead: the Rye one-carry deck (`arena-rye-onecarry`) and Bari–Oven–Cherry Cola (`arena-bari-oven-cola`). Lineups, formation slots, levels, pets, perks, runes and gear are documented well enough to reproduce, and the counters between them are known with their conditions. Stars are mostly unreadable, and no stats site covers regular Arena, so the ranking rests on forum posts and screenshots.

**Rumble Arena: supported for the lineup, partly for the build.** The top 100 run one 12-cookie team (`rumble-standard-12`) with fixed slots and pets, measured on crumb.gg. Levels come from forum screenshots of the same lineup, runes from one fully documented video (`rumble-bari-lowstar`); stars, gear and perks of the top-10 defenses aren't published.

## Reasoning

- **Arena's top two and the flip between them.** Rye wins at similar power while Bari is at 8★ or less; Bari–Oven wins at 8–10★ (dc:75148, dc:75463, dc:76368, dc:76712, dc:75878). Most of one server's top returned to Rye on 2026-09-27 (dc:76853). See `curated/counters.json` and the rulings in `curated/mechanics.json`.
- **Ruling: "Rye beats Bari" is mostly Rumble evidence.** Rumble's +30% DR lets the Rye deck's tanks survive the dive; the same deck dies in 0.5 s in regular Arena (dc:74229). Many gallery "Rye beats Bari" logs carry Rumble markers (dc:76717, dc:75501). Medium confidence.
- **Ruling: Bari's 5★ is a floor, not a win condition, against Rye heal-tank decks.** 5★ adds the second soul target (nv:45718, nv:45312), but same-power Rye still beats 5★ and 8★ Bari decks, and only 10★ is called unbeatable (dc:75878, dc:76712). Medium confidence.
- **Ruling: Rumble's "turtle vs charge" is one team.** The game hides some defenders; every fully revealed top-100 team carries the support core and nearly always Oven and Bari (`web:crumbgg-rumble-live`, `evidence/03-sites/SYNTHESIS.md`). Empty slots are legal (dc:73722), so a few true 8–9-cookie defenses can't be excluded. Medium confidence.
- **The Rumble Season 1 buff drives the Rumble meta.** Charge cookies +30% max HP, all cookies and summons +30% DR: official GIF (nv:44477, `evidence/04-naver-global/frames/nv-44477-7-rumble-gif-*.png`), in-game panel (dc:73855) and EN client (`web:yt-skUx_J1TinA`).
- **Formation slots** are read from owner formation screens and crumb.gg's grid; left to right is back to front, inferred from attack ranges (`curated/meta.json` `formation_slots`). Opponent defense cards appear mirrored, so decks known only from one carry no slots.
- **바궁 means Wind Archer in PvP threads**, while record 001's glossary lists it under Princess Bari. Record 001 is unchanged; `curated/glossary.json` flags the clash.

## Sources

Each lane's synthesis explains its captures:

- `evidence/01-dc-arena/SYNTHESIS.md`: DCInside, regular Arena.
- `evidence/02-dc-rumble/SYNTHESIS.md`: DCInside, Rumble Arena.
- `evidence/03-sites/SYNTHESIS.md` and `SOURCES.md`: crumb.gg, crumblehub, Sugar Pocket, alkapa.
- `evidence/04-naver-global/SYNTHESIS.md`: the official Naver cafe, YouTube and EN guides.

Every cited id is listed with its URL in `curated/sources.json`.

## Files

- `import.json`: the importer manifest (record row, capture rules, no rankings).
- `curated/manifest.json`: which file holds each collection.
- `curated/meta.json`: header copy, the account recommendation (`you`), `formation_slots`, and per-mode `lede`, `caveat` and `rules` (rules are mechanics rows with `topic: "rules"`).
- `curated/decks.json`: teams per mode, ordered by demonstrated results, with slot, level, stars and why per cookie.
- `curated/counters.json`: directed "team is beaten by" edges with conditions, mechanism and confidence.
- `curated/usage.json`: crumb.gg Rumble top-100 usage (lower bounds) and crumblehub's shared Arena decks.
- `curated/runes.json`, `curated/gear.json`: builds per mode.
- `curated/mechanics.json`: mechanics and the rulings on the disagreements.
- `curated/takeaways.json`: ranked takeaways per mode.
- `curated/timeline.json`, `curated/rng.json`: dated events and variance.
- `curated/scores.json`: empty; PvP has no damage scores.
- `curated/glossary.json`: PvP names that record 001's glossary lacks.
- `curated/sources.json`: every source.
- `evidence/NN-*/`: verbatim captures, never edited after capture. `evidence/08-extract/`: per-lane extractions in the schema of `evidence/08-extract/BRIEF.md`.
