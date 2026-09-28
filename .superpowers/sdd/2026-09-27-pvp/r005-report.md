# R005 — what the app would need for team power growth

Record: `research/005-team-power-growth/` (2026-09-28). This note is for the app lane: what a later build needs to load the record and show it. It touches no code; file and line references are a map.

## The mode

- Add `"team_power"` to `GAME_MODE` (`packages/schema/src/enums.ts:47`). The record's `import.json` sets `record.mode` to it, and every curated row states `mode: "team_power"`. Record 003's `"stage"` needs the same step; the two can land together.
- The importable collections already fit the seed schemas (`apps/server/src/importers/seed/schema.ts`): `meta`, `takeaways`, `mechanics`, `timeline`, `sources`, `glossary`. With the mode swapped for a known one they parse cleanly (checked 2026-09-28 against the worktree's base).
- The glossary leaves out the names records 001–003 already define, so no conflicting entries; shared sources copy the earlier records' entries verbatim, so the import raises no source-drift warnings for them.

## New collections

Each needs a Zod seed schema, a Drizzle table and a mapping, like record 003's table-shaped files. They are not in `curated/manifest.json` because the importer rejects unknown keys.

| File | Rows | Shape (key fields) | Used by |
|---|---|---|---|
| `power-sources.json` | one per power source | `id`, `name_en`, `name_kr`, `raises`, `applies_in` {stage, rift, arena, conquest}, `materials[]` {name, free, paid, note}, `cost_type` (free / time_gated / paid / mixed), `cap`, `diminishing`, `posted_gains[]` {account, before, after, delta, cost, kind, sources}, `efficiency` {early, mid, late, at_2_2g}, `bracket_effect`, `spend_order`, `patch_notes`, `confidence`, `sources` | the cost-versus-efficiency view; source detail pages |
| `power-datapoints.json` | one per measured change or snapshot | `id`, `kind` (posted / inferred), `system` (a power-source id), `date`, `before_g`, `after_g`, `delta_pct`, `cost`, `note`, `sources` | a scatter or bar of gains per source; the evidence behind each efficiency label |
| `packages.json` | one per package | `id`, `name_kr`, `name_en`, `price_krw`, `price_usd` (listed) / `usd_tier` (inferred), `usd_source`, `kind` (permanent / monthly / weekly / pass / one-off), `feeds[]` (power-source ids), `crystal_value_pct`, `contents`, `verdict`, `tier` (light / medium / whale / none), `sources`; plus `price_tiers[]` {krw, usd, paired_by} | the paid filter; KRW/USD toggle |
| `spending-orders.json` | per account stage: `free[]` and `paid[]` steps {step, source or package, why, sources}; plus `ranked_at_2_2g` {free[], paid[]} | the ordered lists; the planner's "next step" |
| `growth-curves.json` | per source: odds, costs, checkpoints (plating rows by level, Stellar shapes and roll costs, TSSR star costs, level and star checkpoints, oven bands, Resolve caps and snapshots, lab costs, rune reroll costs) | curve charts; the planner's cost estimates |
| `power-planner.json` | per team power: the last stage in the 55/35/15% brackets; `from_2_2g` notes | the planner (with record 003's per-chapter lines) |

Sources in all of these are the usual `<site>:<key>` ids resolved through `sources.json`, so they plug into the existing citation display.

## Views

1. **Cost versus efficiency.** One row or card per power source from `power-sources.json`: what it raises, cost type (badge), cap, the efficiency label for the reader's stage (early / mid / late / near 2.2G), and the posted gains from `power-datapoints.json` with their evidence links. Filters: **free / paid** (on `cost_type` and on whether a package feeds it), **applies in** (stage, Rift, Arena, conquest — Arena leaves several sources out), and **posted only / include inferred** (on `kind`). Packages list beside it (from `packages.json`) with KRW or USD, the Crystal value as a secondary figure, clearly labelled "Crystal value, not team power".
2. **Planner.** Input: the reader's team power (default 2.2G) and, optionally, current stage. Output: the stage reach at 55%, 35% and 15% (from record 003's per-chapter lines, `research/003-stage-pushing-meta/curated/stage-chapters.json`, which already has `power_for_55/35/15`), the power needed for the next line, and the ranked next steps from `spending-orders.json` for that account stage, each with its posted gain translated into chapters of reach (the planner multiplies team power by the posted `delta_pct` and looks the result up). Record 003's calculator view (team power in, bracket per stage out) is the same computation; the planner adds the "what moves me" column.
3. **Curves.** Small charts from `growth-curves.json`: plating success and expected cost by level (with the 1.4.002 cap and restore costs), Stellar SP cost by shape, TSSR cost by star, level stat versus EXP.

## Services and checks

- A planner service that takes a team power and returns the bracket per chapter and the next lines needs only `stage-chapters.json` (record 003) and `power-planner.json`; no new game data.
- Validation worth enforcing at import: every `system` in `power-datapoints.json` and every `feeds[]` entry in `packages.json` names an `id` in `power-sources.json`; every package or source named in `spending-orders.json` exists; `kind` is `posted` or `inferred`.
- `price_usd` is only what the US App Store listed on 2026-09-28; `usd_tier` is an inference from paired KRW tiers and should be shown as approximate.

## Caveats to surface in the UI

- Displayed power is not strength: it matters only for stages and the Rift; Arena and Guild Conquest ignore it (record 005 `mechanics.json`).
- crumb.gg's power board is account total power (총투), not team power.
- The guild lab's +20% is one unmeasured claim; the planner should label it low confidence.
- Prices and packages rotate; the dataset is a 2026-09-28 snapshot of game 1.4.002.
