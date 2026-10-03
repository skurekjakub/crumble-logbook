# Dimensional Rift clears at the 15% bracket

Date: 2026-10-03. Asked by the user: "search for dimension rift 15% clear teams, add them to the project in a dedicated subtab".

## Why

Record 003 (`research/003-stage-pushing-meta/`) holds the Rift's levels, rules and reported bosses, and one partial Rift deck (`rift-shred`). It holds no Rift clears: `stage_clears` is keyed by `<chapter>-<stageNo>`, and a Rift attempt is keyed by level and season. Its README says the Rift is a 35% fight at every level and that 15% boss clears are claimed, never shown (2026-09-28). The Rift's first level recommends 10.00G, so its 15% bracket starts at 2.00G, which is about where the user's preset sits (record 003, Recommendation). The question this round answers: which teams clear Rift levels while the power gate leaves them 15% of their damage, and how far they get.

## Research (record 003, one dated round)

- Captures in `research/003-stage-pushing-meta/evidence/r2026-10-03/`, every file with its ledger line (`pnpm capture …`, else `pnpm capture log`). Earlier evidence is never touched.
- Sources: DCInside 쿠키런 크럼블 gallery, the official Naver cafe, KR YouTube, crumb.gg and crumblehub, and global sources where they exist. Discovery past the saved searches is part of the round; new useful queries go into `searches.json`.
- Which power the gate compares in the Rift (displayed power with 차원의 힘 or without) decides a clear's bracket; the round states what the sources say and computes brackets from `curated/rift-levels.json`.
- Curated output:
  - `curated/rift-clears.json` (shape below): every documented Rift attempt the round finds at the 15% bracket, plus the 35% attempts and failures that bound it.
  - `curated/decks.json`: a deck per distinct 15% Rift team, `mode: "stage"`, every cookie with a level or level rule and a mechanism "why", sources on every deck. `rift-shred` stays; it is marked obsolete only on evidence, per `.claude/skills/refresh-meta/SKILL.md` § Obsolete.
  - `curated/sources.json`, `curated/glossary.json` for every new source and name; `curated/meta.json` `updated` moves to 2026-10-03.
  - `README.md`: a `## Rift at 15% (2026-10-03)` section to the deep-research contract (`.claude/skills/deep-research/SKILL.md`): verdict, reasoning with evidence paths, steelman, recommendation for a ~2.2G account.

### `curated/rift-clears.json`

```json
{
  "about": "What the file holds and how standing was decided.",
  "measured": "2026-10-03",
  "clears": [
    {
      "season": 1,
      "level": 12,
      "boss_kr": "비겁한 쿠키",
      "boss_en": null,
      "team_power": "2.31G (as the post shows it)",
      "power_basis": "rift",
      "rift_power_level": 14,
      "recommended_power": 12345678900,
      "bracket": 15,
      "result": "clear",
      "play": "manual",
      "evidence": "screenshot",
      "standing": "accepted",
      "deck": "rift-15-example",
      "note": "What the post adds.",
      "sources": ["dc:77777"]
    }
  ]
}
```

- `season`, `level`: integers; the level exists in `rift-levels.json`.
- `boss_kr` required; `boss_en` or `null` when the glossary already names the boss.
- `team_power`: verbatim. `power_basis`: `"rift"` when the figure is the power the Rift shows (차원의 힘 included), `"lobby"` when it's the formation screen's power outside the Rift, `null` when the post doesn't say.
- `rift_power_level`: the 차원의 힘 level when posted, else `null`.
- `recommended_power`: the level's recommended power from `rift-levels.json`, or `null`.
- `bracket`: the kept damage % (15, 35, …); `result`: `clear` | `fail`; `play`: `manual` | `auto` | `semi-auto` | `null`; `evidence`: `screenshot` | `video` | `text`; `standing`: `accepted` | `unverified` | `rejected`, as the README section decides.
- `deck`: a curated deck id when the lineup matches one, else `null`.

## App

- Table `rift_clears` in `packages/schema/src/tables/stage.ts`, beside `stage_clears`, with its migration and Zod schemas; record-owned (`recordSlug`), the deck reference `onDelete: "set null"`, `powerG` read from `teamPower` by the server with the shared parser (`@crumble/schema/power`), as stage clears do.
- Seed schema and importer for the `riftClears` collection; the import checks each level against the loaded Rift levels and each deck is a stage deck.
- `/api/rift-clears`: `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id`, layered routes → services → repos. Order: accepted first, ranked by season, then level reached (highest first), then lowest power first; accepted failures, then unverified and rejected, each in the same order. Never by a ratio. `?bracket=`, `?result=`, `?season=`, `?deck=` filter.
- Web: a stage-mode tab, "Rift at 15%" (`/$mode/rift-15`), after "Dimensional Rift". It shows the 15% bracket's clears in that order, each with its team (the deck card when it names a deck), the level's recommended power and the bracket line, and the attempts that bound it (35% clears, 15% failures) under their own heading. Copy lives in `apps/web/src/app/modes/stage.ts`.
- Root README: the API table row and the stage tables sentence.
