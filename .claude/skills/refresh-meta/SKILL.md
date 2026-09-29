---
name: refresh-meta
description: Use when the user says "refresh", "grab all the data", "update the meta", "what do they run now", after a game patch or a new season, or when an existing research record's recommended decks and builds may be out of date. Not for a new research question: that is deep-research.
---

# Refresh the meta

A refresh is one dated round inside every existing research record: the round's captures in
`evidence/r<date>/`, the curated data updated in place, displaced recommendations marked
obsolete, a `## Refresh <date>` section in each README, and the snapshot rebuilt. It never
opens a new record and never rewrites what an earlier round captured. "Refresh" with no
areas named means every area, run end to end.

**Violating the letter of these rules is violating the spirit of them.**

## Rules no round breaks

1. Earlier evidence is never edited, moved or deleted. A page that changed is a new capture in this round's folder.
2. Every file the round writes under `evidence/` gets its ledger line in the same commit: `pnpm capture` writes it; anything else goes through `pnpm capture log`.
3. A displaced recommendation is marked obsolete, never deleted, and only on evidence in this round (see Obsolete).
4. The saved searches rerun and discovery runs. The old searches alone are not a round.
5. Rank by damage or score. 배 and score ÷ power normalise; they never order anything.
6. Every deck cookie keeps a level or level rule and a mechanism "why".
7. `rtk proxy pnpm verify` passes before every commit. Captured media stays local.
8. Only the orchestrator merges, commits `data/snapshot.json` and pushes, and it pushes once: after the round's review.

## Words

- **Area:** a record under `research/` with an `import.json`.
- **Round date:** the day the round starts, `YYYY-MM-DD`.
- **Last round:** the newest `## Refresh <date>` heading in the area's README; without one, `curated/meta.json`'s `updated`. Never `import.json`'s `startedAt`.
- **Window:** from the last round to the round date.

## The orchestrator: this session

1. **Preflight.** `git status --short` prints nothing. `git fetch origin`, then `git status -sb`: `main` level with `origin/main`; ahead or behind, stop and ask the user. `rtk proxy pnpm verify` passes. No other agent lane is running (`git worktree list`; ask when unsure). Note the base commit: `git rev-parse HEAD`. An area without a `searches.json` gets one reconstructed from its evidence first (as `docs/superpowers/plans/2026-09-28-refresh-meta-skill.md` Task 2 did), committed before the round.
2. **Window and brief.** Per area, the last round and the window. `curl -s https://crumb.gg/data/patches.json -o <scratchpad>/patches.json` and read it. Write `.superpowers/refresh/<date>/brief.md`: per area, the patches in its window, what each changed for the area's mode, and the discovery seeds. The brief is scratch.
3. **Area agents, in parallel.** One per area, all in one message: `subagent_type: "general-purpose"`, `model: "opus"`, `isolation: "worktree"`, prompt = `area-brief.md` with its slots filled.
4. **Merge, one area at a time.** Copy the area's report (`.superpowers/refresh/<date>/<area>-report.md` in its worktree) to the same path here. `git merge --no-ff <branch>`. Copy the round folder's media before anything removes the worktree, never overwriting: `cp -rn <worktree>/research/<area>/evidence/r<date>/. research/<area>/evidence/r<date>/`. Then `pnpm capture verify <area>` (it hashes each media file now present) and `rtk proxy pnpm verify`. Then `git worktree remove --force <worktree>`, PowerShell `Remove-Item -LiteralPath "\\?\<absolute path>" -Recurse -Force` for leftovers, and `git branch -D <branch>`.
5. **Import gate.** Into a new scratch database, import every record the root README's database block lists, in number order, one command each: `CRUMBLE_DB=<scratchpad>/round-<date>.db pnpm import:record <slug>`. Then `CRUMBLE_DB=<scratchpad>/round-<date>.db pnpm db:export` and `pnpm db:scope <base> <every refreshed slug>`: it must exit 0. It compares rows by content (child rows and citations count as their row), so id renumbering from import order doesn't show; read its `game facts:` line and name each changed fact in the report. `rtk proxy pnpm verify`, then commit `data/snapshot.json`.
6. **Review.** One Opus review of the round, briefed with this skill, the spec (`docs/superpowers/specs/2026-09-28-meta-refresh-design.md`), the base commit and every area's report. It checks each changelog row against its evidence, each obsolete marking against Obsolete below, and that `git diff --name-status <base>..HEAD -- research/*/evidence` lists only `A` lines besides each `captures.jsonl`. Fix its findings through one agent at a time, `rtk proxy pnpm verify` before each commit. Then `git push origin main`.
7. **Report to the user.** Per area: what moved, as its changelog has it, a link to its README's refresh section, and what the round couldn't settle. End with: delete `data/crumble.db` (or run `pnpm dev:reseed`) so the app reseeds from the new snapshot.

Commits, everywhere: the message written with the Write tool to `.git/crumble-commit-msg.txt`, then `git commit -F .git/crumble-commit-msg.txt -- <paths>` (`-m` is blocked). In a worktree, where `.git` is a file, the message goes in the folder `git rev-parse --absolute-git-dir` prints. Shell steps run in the Bash tool, one command each, environment variables inline.

## Obsolete

A current recommendation becomes obsolete only on evidence in the round:

- a patch changed a mechanic it depends on, and the round's scores or usage show it dropped out; or
- sources say outright that it no longer works; or
- a documented build beats it on damage or score in the same slot.

Not being mentioned is not evidence: the recommendation stays current and the refresh section lists it as unconfirmed this round. The curated block:

```json
"obsolete": { "since": "2026-10-08", "reason": "…", "sources": ["dc:…"], "superseded_by": "<deck id>" }
```

- `since` is the date of the patch that displaced it when the evidence ties it to one, else the round date; never after `curated/meta.json`'s `updated`, so `updated` moves to the round date first. The reason's sources are curated sources.
- `superseded_by` is for decks only: a current deck of the same mode. The deck keeps its `status`.
- In the same round, every row that recommends the deck moves off it, or the import fails: a counter edge naming it gets its own `obsolete` block; a stage zone slot or a dungeon lineup naming it points at a current deck.
- A later round removes the block on evidence, and the changelog lists the row as un-obsoleted.

## Rationalizations

| Excuse | Reality |
|---|---|
| "The last round is `startedAt` in `import.json`" | `startedAt` is when the question opened. The window starts at the newest refresh heading, else `meta.json`'s `updated`. |
| "Verify passed and the project works on main, so I push" | A round pushes once, from the orchestrator, after its review. An area agent never pushes, merges or commits the snapshot. |
| "`main` is ahead of origin; preflight wants them level, so I push" | Unpushed commits are someone's unreviewed work. Stop and ask. |
| "One `dc list` with every saved query is faster" | One listing per saved search, or no search's `lastHit` can be set. |

## Red flags: stop

- An `M` or `D` under `evidence/` on anything but a `captures.jsonl`
- A deck id gone from `curated/decks.json`, or an `obsolete` reason that says only "not mentioned"
- A trail round whose queries are all saved searches
- A window that starts at `startedAt`
- A worktree about to be removed before its media is copied
- A push before the review, or from an area agent

Any of these: undo the step and redo it by the rule.
