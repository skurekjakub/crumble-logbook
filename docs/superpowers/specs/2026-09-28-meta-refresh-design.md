# Meta refresh: design

Date: 2026-09-28. Status: draft for the user's approval.

## Purpose

After a patch, or every couple of weeks, the user says "refresh" and every mode's recommendations (decks, teams, gear, rune builds, counters) come back current: rescraped, re-curated, dated, cited, and imported into the app, with a changelog of what moved. The procedure is a project skill, `refresh-meta`, authored with `superpowers:writing-skills`.

What the user decided (2026-09-28):

- A refresh is a dated round inside each existing record, not a new record.
- The agents update the recommendations themselves. Displaced decks stay, marked obsolete with a date.
- Searching combines the record's saved searches with fresh discovery; rerunning old searches alone isn't enough.
- One orchestrator, and one subagent per area.

Constraints that still hold: evidence is never edited after capture; every evidence file gets a capture-ledger line in its commit; captured media stays local; rank by damage or score, never by 배; every deck cookie carries a level or level rule and a mechanism "why"; `pnpm verify` passes before every commit; reviews run on Opus.

## 1. A round inside a record

An area is a record under `research/` whose `import.json` names a mode. A round is named for the day it starts (`2026-10-12`) and only ever adds to the record.

- **Evidence.** The round's captures go into `evidence/r<date>/`, with the same subfolder layout the record's first round uses (`02-dc/`, `04-naver/`, `05-youtube/`, `03-sites/`, `08-extract/`, `06-derived/`). Each capture gets its ledger line in the record's single `evidence/captures.jsonl`. Nothing from an earlier round is touched; a changed page is a new capture in the new round.
- **Searches.** Baseline plus discovery (section 3).
- **Curated data.** Updated in place from the round's evidence together with earlier evidence that still holds. A deck still in use keeps its id and gets its figures, levels and whys refreshed. A new build becomes a new deck. A displaced recommendation is marked obsolete (section 2), not deleted.
- **README.** The verdict and the sections under it are rewritten to the current answer. A new `## Refresh <date>` section records the patch window the round covered, the changelog (recommendations added, obsoleted, changed and un-obsoleted, each with its evidence pointer), and what the round couldn't settle. Earlier refresh sections stay, newest first. The record's `updatedAt` in `import.json` moves to the round date.
- **Trail.** The round's queries and syntheses are appended to `research-trail.md` under the round's date.

## 2. The obsolete lifecycle

Applies to every recommendation table: `decks`, `rune_builds`, `gear_recs` and `counters`.

- **Columns.** `obsolete_since` (ISO date, null while current) and `obsolete_reason` (text). Decks also get `superseded_by`, a nullable deck id. The reason is cited like any other claim: its sources become citations of a new cited-entity kind for obsolescence, keyed by the entity and its id. A deck keeps its `status` (`meta`, `alt`, `niche`, `legacy`), so the page can say what it was.
- **Curated shape.** A recommendation in a curated file may carry `"obsolete": { "since": "2026-10-12", "reason": "…", "sources": ["dc:…"], "supersededBy": "…" }`. The importer validates it (the date, the sources exist, `supersededBy` names a deck of the same mode) and fills the columns and citations.
- **When a recommendation becomes obsolete.** Only on evidence in the round: a patch changed a mechanic it depends on and the round's scores or usage show it dropped out, or sources say outright that it no longer works, or a documented build beats it on damage or score in the same slot. Not being mentioned in the round is not evidence. That recommendation stays current, and the refresh section lists it as unconfirmed this round.
- **`since`** is the date of the patch that displaced it, when the evidence ties it to one, or the round's date otherwise.
- **Reversal.** A later round can clear `obsolete` on evidence; the changelog lists it as un-obsoleted.
- **In the app.** Current recommendations list as today. Each list page ends with an "Obsolete" section, collapsed by default, dated, each item showing since, reason, sources and, for decks, a link to the deck that superseded it. Ranking, usage and counter views count current decks only; an obsolete deck's own page still renders in full, headed with its obsolete notice. The API returns both, with a `current=true` filter the views use.

## 3. Searches: baseline plus discovery

- **`searches.json`**, one per record at its root, is the saved search list. Each entry names its source kind (`dc`, `naver`, `crumbgg`, `youtube`, `web`), what to run (a board query, a cafe search, a crumb.gg board or endpoint, a channel or a query, a URL), why it exists, the round that added it, and the last round it found something. A Zod schema in `packages/capture` validates it, and a records test requires every area to have a valid one.
- **Baseline.** Every saved search reruns, keeping only posts and pages newer than the last round. crumb.gg's boards and data endpoints are captured whole each round, since they describe the present.
- **Discovery, always required.** Seeded from:
  - the patch delta since the last round: new cookies, treasures and pets, balance changes, new modes or seasons, taken from crumb.gg's patch data;
  - new names in the baseline results: deck nicknames, slang, cookie shorthand;
  - the players behind the round's top scores and their posts and videos;
  - crumb.gg's current top boards;
  - the iterative search rounds the research contract already requires.
- **Growth.** A discovery search that produced a cited source is added to `searches.json` with the round date. A saved search that finds nothing keeps its last-hit round, which shows how long it has been quiet; it is never deleted.
- **First refresh of an existing record.** Its `searches.json` is reconstructed from the record's evidence (the query columns of the DC listings, the YouTube query files, the source lists) before its first round.

## 4. Orchestration

The skill lives in `.claude/skills/refresh-meta/`: `SKILL.md`, the area brief template `area-brief.md`, and the round README section template `refresh-section.md`. It runs in the main session as the orchestrator.

1. **Preflight.** `main` is clean and in step with `origin`, `pnpm verify` passes, and no other lane is running. The user may name areas; the default is every area.
2. **Patch window.** For each area, the last round's date, from its README, bounds the window. The orchestrator reads crumb.gg's patch data and writes the round brief to `.superpowers/refresh/<date>/brief.md`, which is gitignored scratch: the patch delta per area and the discovery seeds. The area agents capture the patch data they rely on into their own round folders, so every record's evidence stands alone.
3. **Area agents, in parallel.** One Opus agent per area, each in its own worktree, briefed from `area-brief.md` with the round brief. Each agent runs:
   - the baseline searches, then discovery, then extraction into `r<date>/08-extract/`;
   - curation, including the obsolete marking;
   - the README refresh section, the trail, and `searches.json` updates;
   - `pnpm verify` before each commit.

   It ends with a report at `.superpowers/refresh/<date>/<area>-report.md`. Agents touch only their record's folder and never app code; anything an area needs from the app goes in its report.
4. **Merge.** The orchestrator merges each area's branch into `main` one at a time, running verify after each merge. It then imports every record into a fresh scratch database in record order, regenerates `data/snapshot.json`, checks that the diff touches only the refreshed records' rows and game facts, runs verify, and commits.
5. **Review.** One Opus review of the whole round. It checks each area's changelog against its evidence, the obsolete markings against section 2's rule, and that no evidence from earlier rounds changed. Findings are fixed through one agent at a time, then the round is pushed.
6. **Report to the user.** Per area: what moved, with a link to the record's refresh section, and what couldn't be settled. The report also reminds the user to delete `data/crumble.db` so the app reseeds; the startup warning names the same fix.

The worktrees' gitignored media is copied into the main checkout before a worktree is removed, and the worktree is removed after merge.

## 5. The skill and how it's tested

- **Authoring** follows `superpowers:writing-skills`.
  - First, a baseline run without the skill: give a subagent a refresh request on one area and record where it goes wrong. The likely failures are editing earlier captures, deleting displaced decks, rerunning only old searches, skipping the ledger, and ranking by 배.
  - Then the skill is written against those failures, and the same scenario reruns with it until the failures are gone.
- **Acceptance** is a real round on one area, merged and reviewed, before the skill is used across all of them.
- **`deep-research`'s repo section** is stale: it points at the Python scrapers and the dropped `scrape:*` jobs. It is updated to the `pnpm capture` commands, the ledger, and a pointer to `refresh-meta` for rounds after a record's first.

## 6. App work this needs

A separate implementation plan, run as one agent after the stage review fixes and the Crumble Dungeon mode land:

- the obsolete columns and the new cited-entity kind, with the migration;
- the importer's `obsolete` validation;
- the API's `current` filter;
- the collapsed, dated "Obsolete" section on every list page;
- excluding obsolete decks from ranking, usage and counter views;
- the obsolete notice on a deck's own page;
- the `searches.json` schema and its records test.

The snapshot gate holds: before any record uses `obsolete`, a fresh import reproduces `data/snapshot.json` byte for byte.

## Out of scope

- Scheduling. The user triggers a refresh; nothing runs on a timer.
- A freshness view. The user declined it on 2026-09-28.
- Changing a record's research question. A different question is a new record.
