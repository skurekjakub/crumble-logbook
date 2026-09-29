# To do

Pending work, newest decisions first. Decisions that need the user live in [`OPEN-QUESTIONS.md`](OPEN-QUESTIONS.md); this file points at them. Delete an entry once it lands.

## In progress

- **First refresh round (2026-09-29), Guild Conquest only.** The `refresh-meta` skill's acceptance round on `001-guild-conquest-meta`: Season 5's final boards, the S5 leaders' teams, whether Season 6 opened, Princess Bari in conquest lineups. Then merge, snapshot, `db:scope`, one Opus review, push. Brief: `.superpowers/refresh/2026-09-29/brief.md` (local scratch).

## Next

- **Refresh every record.** Once the acceptance round is merged, "refresh" runs every area in parallel (`.claude/skills/refresh-meta/SKILL.md`).
- **Short glossary names.** English names are long ("Milk Cookie's Crunchy Strong Pediatrician") on every page. Add a short name to glossary entries and use it in tables and chips.
- **One Korean name, different English per record.** The glossary holds one English name per key, so 비겁한 쿠키 reads "Cowardly Cookie" (record 001) where record 003 calls it GingerCraven. The stage clears view works around it; the gap is general.

## Waiting on the user

- **Guild Conquest simulator.** Calibration data, whether it may be committed, what the game shows in battle, and survival scope: `OPEN-QUESTIONS.md` § Guild Conquest simulator. Spec: `docs/superpowers/specs/2026-09-27-conquest-simulator-design.md`.
- **Guild research reading for record 005.** The guild research screen (level and the stat lines it grants), so the team power planner can count the guild: `OPEN-QUESTIONS.md` § Team power growth.
- **Power-source slug ownership.** Which record owns a power source's row when a later record researches it again: `OPEN-QUESTIONS.md`.
- **Plating in the team power ranked order.** It stays `posted` with its gain shown as approximate (measured loosely near +15). Say if it should read as community order instead.

## Known gaps

- **Obsolete lifecycle coverage.** It covers decks, rune builds, gear recs and counters. Crumble Dungeon lineups, stage zone slots, account advice and the team power steps, orders, packages and planner steps have no obsolete marking (`.superpowers/sdd/2026-09-27-pvp/obsolete-report.md`).
- **Crumble Dungeon lineup planner.** A collection in, the first 40 out, the ATK order checked. Needs a way to enter the reader's roster and levels, which the app lacks.
- **Next stage patch.** `STAGE_ERA` has no value after `post-easing`; clears after a later stage patch need one before they import.
- **Rift ranking structure.** Decoded from the APK's protocol (`crumble-re` notes, outside the repo), not yet in record 003.
- **Conquest simulator spec route.** It still names `routes/conquest/sim.tsx`; under the shared mode routes it becomes `routes/$mode/sim.tsx` with a `sim` guard.
- **deep-research leftovers.** Steps outside its repo section still come from the blog repo it was copied from.
- **Capture warnings across records.** Sources whose captures live in another record warn on import; a manifest capture rule can point into another record's evidence to silence them.
- **Slow tests under load.** `snapshot-drift.test.ts` and `ledger.test.ts` sometimes time out at the default under the full suite and pass on rerun.

## Cleanup

- `data/stale-2026-09-27/`: the database set aside on 2026-09-27; safe to delete.
