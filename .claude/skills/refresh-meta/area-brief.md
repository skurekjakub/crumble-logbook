# Area brief: {area}, round {date}

You are refreshing one research record, `research/{area}/`, in your own worktree, as one
round of a meta refresh. Touch only that folder, and `.superpowers/refresh/{date}/` for your
report; never app code, never `data/`. Anything the app would need goes in your report. You
never merge, never push and never commit `data/snapshot.json`: the orchestrator does, after
the round's review.

- **Round date:** {date}.
- **Window:** {window start} to {date}. Keep posts, pages and videos newer than {window start}; a post dated {window start} is new only if its id has no capture under `evidence/` yet.
- **Patch delta and discovery seeds:** {the round brief's section for this area}

A new worktree has no dependencies: run `pnpm install` in it before any `pnpm` command.
Shell steps run in the Bash tool, one command each, environment variables inline
(`CRUMBLE_DB=<scratchpad>/x.db pnpm …`).

Read first: `research/{area}/README.md`, `research-trail.md`, `searches.json`, `import.json`
and `curated/`; `.claude/skills/refresh-meta/SKILL.md` (its rules and Obsolete section bind
you); the deep-research skill's contract and repo section (`.claude/skills/deep-research/SKILL.md`);
`README.md` § Captures for the `pnpm capture` commands.

## Where the round's files go

The round folder is `research/{area}/evidence/r{date}/`, and inside it each capture goes to
the counterpart of the first-round folder that holds the same kind of file:
`evidence/<path>` becomes `evidence/r{date}/<path>`. Read the first round's folders with
`ls research/{area}/evidence` and the `captures` block of `import.json`; never invent a
folder name. Before the first capture of a site's posts, add the round's rule to
`import.json`'s `captures`, ahead of the first-round rules of the same site, so the app
links each source to its newest capture:

```json
{ "site": "dc", "dir": "evidence/r{date}/<the first round's dc path>", "file": "{id}.md" }
```

## Steps

1. **Baseline.** Rerun every `searches.json` entry, one capture per entry, each named for its id:
   - `dc`: `pnpm capture dc list {area} evidence/r{date}/<dc listing folder>/list-<id>.tsv <pages> <query>`, with enough pages that the last page's oldest post predates the window start (else rerun into a new file with more pages); then `pnpm capture dc fetch` the new posts worth reading.
   - `naver` with a `menuId`: `pnpm capture naver list {area} <out>/list-<id>.tsv <menuId> <pages>`, then `naver fetch` the new articles. With a `query`: agent-browser, then `pnpm capture log`.
   - `crumbgg`: `pnpm capture crumbgg <endpoint> {area} evidence/r{date}/<crumb.gg folder> <args>`, whole, every round.
   - `youtube` with a `query`: `pnpm capture youtube search`. With a `channel`: save `https://www.youtube.com/<channel>/videos` (agent-browser, or curl, since it's server-rendered), then `pnpm capture log`. Then `youtube watch` the new videos, and `download`, `frames`, `sheet` or `subs` for those whose lineups you read.
   - `web`: agent-browser, headed, or curl for JSON; then `pnpm capture log {area} <path> --url <url> --tool <tool>`.
   Also `pnpm capture crumbgg data {area} evidence/r{date}/<crumb.gg or sites folder> patches`: the patch data the round rests on.
2. **Discovery, always.** Search again from the patch delta; the new names in the baseline results (deck nicknames, slang, cookie shorthand); the players behind the round's top scores, and their posts and videos; crumb.gg's current top boards; and the iterative-research rounds the deep-research contract requires. Write each round's queries and synthesis into `research-trail.md` under `## Round {date}`.
3. **Extraction** into the round's counterpart of the record's extraction folder, following the record's extraction brief; each file gets its ledger line (`pnpm capture log {area} <path> --url - --tool manual`).
4. **Curation,** in place:
   - `curated/meta.json`'s `updated` becomes {date}; rewrite its caveat and season to the round.
   - A deck still in use keeps its id; refresh its figures, levels and whys. Every cookie keeps a level or level rule and a why. A new build is a new deck.
   - A displaced recommendation gets an `obsolete` block by the skill's Obsolete rule, and in the same commit every row recommending it moves off it: counter edges get their own block, zone slots and dungeon lineups point at a current deck. A recommendation the round didn't mention stays current.
   - Measurements (scores, runs, clears) are added, never replaced: an old row stays, a new run is a new row. Rank by damage or score.
   - New sources go in `curated/sources.json`, new names in `curated/glossary.json`.
   - A record with a `rankings` block in `import.json` gets a new entry for each board the round derives into a TSV, with `capturedAt` {date}; earlier entries stay.
5. **Searches.** Set `lastHit` to {date} on each saved search that found something; delete none. Add each discovery search that produced a cited source, `added` and `lastHit` {date}. A web search engine's query can't be rerun as a saved search: save the page it found as a `web` entry, and leave the query in the trail.
6. **README.** Rewrite the Verdict and the sections under it to the current answer. Add the refresh section from `.claude/skills/refresh-meta/refresh-section.md` above any earlier refresh section, after the last content section and before `## Sources`. Add the round's files to `## Files` and its sources to `## Sources`. The records test accepts a `searches.json` date only once the README has that round's heading, so the heading goes in no later than the commit that first writes {date} into `searches.json`.
7. **Check the import.** `pnpm capture verify {area}` prints no problem. `CRUMBLE_DB=<scratchpad>/{area}-{date}.db pnpm import:record {area}` into a new file passes; a record that names another record's glossary entries (the root README's multi-record gotchas) imports after them into the same file.
8. **Commit as you go,** each capture with its ledger line: `rtk proxy pnpm verify`, then the message written with the Write tool to `<git dir>/crumble-commit-msg.txt`, then `git commit -F <git dir>/crumble-commit-msg.txt -- research/{area}`. In a worktree `.git` is a file, not a folder: `<git dir>` is the absolute path `git rev-parse --absolute-git-dir` prints.
9. **Report** to `.superpowers/refresh/{date}/{area}-report.md` in your worktree: the changelog as the refresh section has it, what you couldn't settle, and anything the app would need.
