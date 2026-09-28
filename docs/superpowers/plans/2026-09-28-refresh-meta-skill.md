# Refresh-Meta Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The skill itself is authored with **REQUIRED SUB-SKILL: superpowers:writing-skills**, whose RED-GREEN-REFACTOR cycle Tasks 3 to 6 follow.
>
> **Execution (decided 2026-09-28):** one Opus agent runs the whole plan on `main`, after the obsolete-lifecycle plan has landed, then one Opus review of the result, then one fix agent if the review finds anything, then push. No per-task reviewer. The acceptance round is the first real refresh and its data is merged.

**Goal:** A project skill, `.claude/skills/refresh-meta/`, that turns "refresh" into a dated round inside every existing research record: rescraped, re-curated, obsolete-marked, cited, re-imported and reviewed, with a changelog per record.

**Architecture:** The main session is the orchestrator (`SKILL.md`): preflight, patch window and round brief, one Opus area agent per record in its own worktree (briefed from `area-brief.md`), merge one area at a time, a fresh-import snapshot gate, one Opus review, a report. Each record's README gains a `## Refresh <date>` section written from `refresh-section.md`. The skill is written against the failures a baseline run without it produces, and rerun until they are gone; the last task is a real round on one area.

**Tech Stack:** Claude Code skills (Markdown), the Agent tool (Opus, worktree isolation), `pnpm capture`, `pnpm import:record`, `pnpm db:export`, `pnpm db:scope`, agent-browser.

**Spec:** `docs/superpowers/specs/2026-09-28-meta-refresh-design.md`, sections 1 to 5. Section 6 is the app plan.

**Depends on:** `docs/superpowers/plans/2026-09-28-obsolete-lifecycle.md` having landed on `main`: the `obsolete` curated block, the `?current=` filter, the Obsolete sections, the `searches.json` schema (`packages/capture/src/searches.ts`) and `pnpm db:scope`. Task 1 checks it. Don't start before it has.

## Global Constraints

- Earlier evidence is never edited, moved or deleted; a later measurement is a new file. Every file written under `evidence/` gets its line in the record's `evidence/captures.jsonl` in the same commit: `pnpm capture …` writes it, any other capture goes through `pnpm capture log`.
- Captured media stays local (`.gitignore` excludes it under `research/`). A worktree's media is copied into the main checkout before the worktree is removed.
- Rank by damage or score, never by 배 (damage ÷ power) or score ÷ power.
- Every deck cookie carries a level (or a level rule) and a mechanism "why".
- A displaced recommendation is marked obsolete, never deleted, and only on evidence in the round (spec section 2). The curated block's successor field is `superseded_by` (the importer's snake_case convention; the app plan records why).
- `rtk proxy pnpm verify` passes before every commit. Run a single test file as `pnpm vitest run <path>`.
- No enumerating and no gratuitous counting in docs, skill files, README sections, comments or commit messages: point at the file or folder that holds a list.
- Windows: run shell steps in the Bash tool (Git Bash), one simple command per step, environment variables inline (`CRUMBLE_DB=<scratchpad>/x.db pnpm …`, `<scratchpad>` being your session's scratchpad directory as an absolute path with forward slashes). Use the PowerShell tool for `\\?\` long-path deletes.
- Commits: write the message with the Write tool to `.git/crumble-commit-msg.txt`, `git add` new files, then `git commit -F .git/crumble-commit-msg.txt -- <paths>` (the `-m` flag is blocked). End the message with the `Co-Authored-By` line your session's attribution reminder gives.
- Web access: agent-browser, headed, with `AGENT_BROWSER_EXECUTABLE_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"` and a named `AGENT_BROWSER_SESSION`. Never `agent-browser wait <ms>`, never wrapped in `timeout`. No Playwright. curl only for JSON APIs and server-rendered pages.
- Every subagent this plan dispatches, test scenarios included, runs on Opus (`model: "opus"`); reviews run on Opus.
- Work on `main`; worktree lanes merge into `main`; push to `origin` after a round's review. Build agents run one at a time; area agents inside a round run in parallel, each in its own worktree touching only its record's folder.
- Scratch lives in `.superpowers/` (gitignored by Task 1): the round brief, area reports, and the skill's test logs.

## Review Focus

- A worktree removed before its gitignored media is copied loses the round's images and frames for good, and `pnpm capture verify` still passes (an absent media file verifies). Pinned by the copy-then-hash step in `SKILL.md` and checked in Task 7.
- An area with no refresh section yet has no "last round" heading: the window must start at `curated/meta.json`'s `updated`, not at the record's `startedAt` or at nothing. Pinned by scenario S7 (Task 3) and checked in Task 7.
- A round that finds nothing new for an area still writes a dated refresh section saying so, and leaves the recommendations current; it neither skips the area silently nor obsoletes what went unmentioned. Pinned by scenario S2.
- A round that adds a row to an early record renumbers later records' ids, so the raw snapshot diff looks like it touched every record; the gate must use `pnpm db:scope`, and a real out-of-scope change must still fail it. Pinned in `SKILL.md`'s import gate and checked in Task 7.
- A record created by `deep-research` after this plan has no `searches.json`; the records test fails until it has one, and the skill reconstructs it before the record's first round. Pinned by the tightened records test (Task 2) and `SKILL.md`'s preflight.

---

### Task 1: Preconditions, and scratch space

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Check the app plan landed**

Run: `git status --short`
Expected: no output.

Run: `git log --oneline -20`
Expected: the obsolete-lifecycle plan's commits, ending with its `docs:` commit.

Run: `ls packages/schema/src/obsolete.ts packages/capture/src/searches.ts apps/server/src/cli/snapshot-scope.ts`
Expected: all three listed. If any is missing, stop: the app plan hasn't landed.

Run: `pnpm db:scope HEAD`
Expected: no output, exit 0.

Run: `rtk proxy pnpm verify`
Expected: passes.

- [ ] **Step 2: Ignore the scratch folder**

`.superpowers/` holds the round brief, the area reports and the skill's test logs, which the spec calls gitignored scratch; `.gitignore` doesn't list it yet. In `.gitignore`, under `# local database and scratch`, add:

```
.superpowers/
```

Run: `git check-ignore -v .superpowers/refresh/x/brief.md`
Expected: a line naming `.gitignore` and `.superpowers/`.

- [ ] **Step 3: Commit**

Message:

```
chore: ignore .superpowers/, the refresh rounds' scratch

The refresh-meta skill writes a round's brief, its area reports and its
test logs under .superpowers/, which were meant to stay local.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- .gitignore`

---

### Task 2: Reconstruct every area's `searches.json` from its evidence, and require it

An area is a record under `research/` with an `import.json`. The spec's definition, "whose `import.json` names a mode", would leave out `002-pvp-meta`, whose `import.json` names none (its modes come from `curated/meta.json`); every record with an `import.json` is an area here, `005-team-power-growth` included.

**Files:**
- Create: `research/<area>/searches.json` for every area
- Modify: `packages/capture/test/records.test.ts`

**Interfaces:**
- Consumes: `searchesFile`, `readSearches`, `SEARCHES_FILE` (`packages/capture/src/searches.ts`).
- Produces: a valid `searches.json` at every area's root; `added` is the record's `import.json` `record.startedAt` for every reconstructed entry.

- [ ] **Step 1: Tighten the records test first**

In `packages/capture/test/records.test.ts`, replace the per-area test of "every area's saved searches" (and drop `REFRESH_SECTION`):

```ts
  for (const area of areas) {
    it(`${area}: has a valid searches.json`, () => {
      expect(readSearches(join(researchDir, area)), `${area} has no ${SEARCHES_FILE}`).not.toBeNull();
    });
  }
```

Run: `pnpm vitest run packages/capture/test/records.test.ts`
Expected: FAIL for every area: `has no searches.json`.

- [ ] **Step 2: Write the lead finder**

Write this with the Write tool to `<scratchpad>/search-leads.ts`. It prints what a record's evidence says it searched; you write the file by hand from its output.

```ts
// search-leads.ts <record>: prints the saved-search leads in a record's evidence.
// Run from the repo root: pnpm exec tsx <scratchpad>/search-leads.ts <record>
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const record = process.argv[2];
if (!record) throw new Error("usage: search-leads.ts <record>");
const dir = join("research", record);
const evidence = join(dir, "evidence");
const sources = JSON.parse(readFileSync(join(dir, "curated", "sources.json"), "utf-8")) as Record<
  string,
  { url: string }
>;
const cited = new Set(Object.keys(sources));

/**
 * Lists every file under `root`, recursively.
 *
 * @param root - the folder
 * @returns the files' paths
 */
function files(root: string): string[] {
  return readdirSync(root, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
}

console.log("## dc: each query of the listings, and whether a listed post became a source");
const dc = new Map<string, { files: Set<string>; hit: boolean }>();
for (const file of files(evidence).filter((f) => f.endsWith(".tsv"))) {
  const [header, ...lines] = readFileSync(file, "utf-8").split(/\r?\n/).filter(Boolean);
  const columns = (header ?? "").split("\t");
  const q = columns.indexOf("query");
  const no = columns.indexOf("no");
  if (q < 0 || no < 0) continue;
  for (const line of lines) {
    const cells = line.split("\t");
    for (const query of (cells[q] ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
      const lead = dc.get(query) ?? { files: new Set<string>(), hit: false };
      lead.files.add(relative(dir, file));
      if (cited.has(`dc:${cells[no]}`)) lead.hit = true;
      dc.set(query, lead);
    }
  }
}
for (const [query, lead] of dc) {
  console.log(`${lead.hit ? "hit " : "none"}  ${query}  (${[...lead.files].join(", ")})`);
}

const ledger = readFileSync(join(evidence, "captures.jsonl"), "utf-8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line) as { path: string; url: string | null });

console.log("## naver: the boards listed");
const menus = new Set(ledger.flatMap((l) => /menuid=(\d+)/i.exec(l.url ?? "")?.[1] ?? []));
for (const menu of menus) console.log(`menuId ${menu}`);
console.log(`record cites a Naver post: ${[...cited].some((id) => id.startsWith("nv:"))}`);

console.log("## youtube: each search, and whether a video it listed became a source");
const videos = [...cited].filter((id) => id.startsWith("web:yt-")).map((id) => id.slice(7));
for (const line of ledger) {
  const match = /search_query=([^&]+)/.exec(line.url ?? "");
  if (!match) continue;
  const path = join(dir, line.path);
  const text = existsSync(path) ? readFileSync(path, "utf-8") : "";
  const hit = videos.some((id) => text.includes(id));
  console.log(`${hit ? "hit " : "none"}  ${decodeURIComponent(match[1]!.replace(/\+/g, " "))}  (${line.path})`);
}

console.log("## crumb.gg: every URL captured");
for (const url of new Set(ledger.flatMap((l) => (l.url && /crumb\.gg/.test(l.url) ? [l.url] : [])))) {
  console.log(url);
}

console.log("## web sources other than YouTube and crumb.gg");
for (const [id, entry] of Object.entries(sources)) {
  if (id.startsWith("web:") && !id.startsWith("web:yt-") && !/crumb\.gg/.test(entry.url)) {
    console.log(`${id}  ${entry.url}`);
  }
}
```

- [ ] **Step 3: Write each area's file, in number order**

For each area, in number order (`ls research/` and keep the folders with an `import.json`):

Run: `pnpm exec tsx <scratchpad>/search-leads.ts <area>`

Read the area's `README.md` and `research-trail.md` for why each search was run. Then write `research/<area>/searches.json` with the Write tool, one entry per lead worth rerunning, following `packages/capture/src/searches.ts`:

- `dc`: one entry per query (`"query": "subject:스테이지"`); `lastHit` is `startedAt` for a `hit` lead, `null` for `none`.
- `naver`: one entry per board (`"menuId": 12`); `lastHit` is `startedAt` when the record cites a Naver post, else `null`.
- `youtube`: one entry per search (`"query": "…"`); `lastHit` as the script says.
- `crumbgg`: one entry per endpoint and argument set, mapped from the URL onto `ENDPOINTS` in `packages/capture/src/crumbgg.ts` (`https://crumb.gg/pub/live?board=X` is `"endpoint": "live", "args": ["X"]`); `lastHit` is `startedAt`.
- `web`: only pages that describe the present and change (tier lists, stats pages, living guides), not one-off articles; `lastHit` is `startedAt`.

Every entry: `id` a lowercase slug unique in the file (`dc-subject-stage`, `crumbgg-live-players`), `why` one sentence from the record's own reasons, `added` the `record.startedAt` of its `import.json`. For example:

```json
[
  {
    "id": "dc-subject-stage",
    "kind": "dc",
    "query": "subject:스테이지",
    "why": "The stage-pushing posts title themselves by the word stage.",
    "added": "2026-09-28",
    "lastHit": "2026-09-28"
  },
  {
    "id": "crumbgg-data-stages",
    "kind": "crumbgg",
    "endpoint": "data",
    "args": ["stages"],
    "why": "crumb.gg's stage table: recommended power per stage, which the brackets are computed from.",
    "added": "2026-09-28",
    "lastHit": "2026-09-28"
  }
]
```

Run: `pnpm vitest run packages/capture/test/records.test.ts`
Expected: the area's own test passes (the later areas still fail until their files exist).

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run packages/capture/test/records.test.ts`
Expected: PASS for every area.

Run: `rtk proxy pnpm verify`
Expected: passes.

Run: `git add research/*/searches.json`

Message:

```
research: every area's saved searches, reconstructed from its evidence

A refresh round reruns a record's saved searches before its discovery,
so each area needs a searches.json before its first round. Each file is
rebuilt from what the first round actually ran: the query column of its
DC listings, the boards and searches its capture ledger names, the
crumb.gg endpoints it captured and the living pages it cites. A lead
whose results became a cited source carries the record's start date as
its last hit. The records test now requires the file of every area.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- research packages/capture/test/records.test.ts`

---

### Task 3: RED: the baseline without the skill

writing-skills' iron law: no skill without a failing test first. Run the scenarios below with no `refresh-meta` skill in the repo (it doesn't exist yet) and record what the agents do, verbatim.

**Files:**
- Create: `.superpowers/refresh/skill-tests/baseline.md` (scratch, gitignored)

- [ ] **Step 1: Dropped (2026-09-28): the full baseline round**

Not run: the user cut it for cost, since its captures would be thrown away. The pressure scenarios in Step 3 are the baseline, and the acceptance round (the last task) is the real run, scored with Step 2's checks. The prompt is kept for reference:

One subagent: `subagent_type: "general-purpose"`, `model: "opus"`, `isolation: "worktree"`. Prompt, verbatim:

```
It's been a couple of weeks since we researched Guild Conquest in this repo
(research/001-guild-conquest-meta), and the game has patched since. Refresh the
Guild Conquest recommendations: find what the top players run now, update the
record and its curated data so the app shows the current meta, and commit your
work on your branch. Don't merge and don't push. When you're done, write what you
changed and why to .superpowers/refresh/skill-tests/baseline-round-report.md in
your worktree.
```

Let it run to the end.

- [ ] **Step 2: The scoring checks (not run here; the acceptance round is scored with them)**

In the worktree the agent used (the Agent result names it and its branch), run each as its own command:

Run: `git -C <worktree> diff --name-status main...HEAD -- research/001-guild-conquest-meta/evidence`
Fails "edited an earlier capture" when a line starts with `M` or `D` on anything but `evidence/captures.jsonl`.

Run: `git -C <worktree> diff main...HEAD -- research/001-guild-conquest-meta/curated/decks.json`
Fails "deleted a displaced deck" when a deck's `"id"` line is removed; fails "obsoleted without evidence" when an `obsolete` block's reason is silence ("not mentioned", "no recent posts").

Run: `git -C <worktree> diff main...HEAD -- research/001-guild-conquest-meta/research-trail.md`
Fails "reran only old searches" when the round's queries are the old ones only, with no discovery seeded from the patch, new names, top players or crumb.gg's current boards.

Run: `pnpm --dir <worktree> capture verify 001-guild-conquest-meta`
Fails "skipped the ledger" on any problem it prints. (If the agent never ran `pnpm install` in its worktree, run it there first; note that too.)

Read the README diff and `curated/decks.json`'s order: fails "ranked by 배" when an ordering or a verdict rests on 배 or damage ÷ power.

Also note: captures outside `evidence/r<date>/`; a README whose history was overwritten rather than given a `## Refresh <date>` section; `curated/meta.json`'s `updated` left alone; a Python scraper run (a ledger tool `python:*`); `agent-browser wait`.

- [ ] **Step 3: Run the pressure scenarios, without the skill**

Each scenario is a single-shot subagent (`subagent_type: "general-purpose"`, `model: "opus"`), run once, each prompt being the scenario text followed by:

```
Answer with the exact commands and file edits you would make, in order, then one
paragraph on why. Don't run anything.
```

- **S1, a changed capture.** "You are refreshing research/001-guild-conquest-meta. Its first-round capture evidence/03-dc-posts/76135.md is out of date: the author edited the post and it now shows a different lineup. `pnpm capture dc fetch 001-guild-conquest-meta evidence/03-dc-posts 76135` refuses because the file exists and differs. The user wants the refresh merged tonight." Passes when the new capture goes into this round's folder (`evidence/r<date>/03-dc-posts/`) and the old file is untouched.
- **S2, an unmentioned deck.** "In this round, no post, video or board mentions the Melon Soda deck (`meso` in curated/decks.json). crumb.gg's boards list scores but not lineups. The app still shows it as a current deck." Passes when it stays current and the refresh section lists it as unconfirmed this round.
- **S3, a displaced deck.** "The 2026-10-08 patch halved Cherry Cookie's beam damage. Every top-50 score captured this round uses the new Almond deck, whose documented 1.4T beats Cherry's best of 1.31T in the same slot." Passes when `cherry` stays in `decks.json` with an `obsolete` block: `since` `2026-10-08`, a reason, the sources, `superseded_by` the new deck; its `status` unchanged.
- **S4, ranking.** "Deck A's best documented run is 900G at 2.5G power (360배); deck B's is 800G at 1.8G (444배). The Korean community compares runs by 배. Which deck leads the record's ranking, and in what order do they go in decks.json?" Passes when A leads, by damage.
- **S5, only the old searches.** "The record's saved searches returned 40 new posts this round, enough to refresh every deck. You have used 80% of your time budget." Passes when discovery still runs, seeded from the patch delta, the new names in the results, the players behind the top scores, crumb.gg's current top boards and the iterative search rounds.
- **S6, the ledger.** "You saved crumb.gg's live board with agent-browser into evidence/r2026-10-12/13-sites/live-top.html. `pnpm verify` passed on your last commit." Passes when `pnpm capture log 001-guild-conquest-meta evidence/r2026-10-12/13-sites/live-top.html --url <url> --tool agent-browser` runs before the commit that adds the file, in the same commit.
- **S7, the window.** "Record 003-stage-pushing-meta has never been refreshed: its README has no refresh section. From which date do you keep new posts?" Passes when the window starts at `curated/meta.json`'s `updated` (the last round).

- [ ] **Step 4: Write the baseline log**

Write `.superpowers/refresh/skill-tests/baseline.md` with the Write tool: per scenario, pass or fail, and for each failure the agent's reason quoted verbatim from its answer. Group the failures by kind (a rule skipped under pressure, a wrong-shaped output, an element left out), since writing-skills' "Match the Form to the Failure" picks the guidance's form by kind.

No commit: this task writes scratch only.

---

### Task 4: GREEN: write the skill against the baseline's failures

**Files:**
- Create: `.claude/skills/refresh-meta/SKILL.md`
- Create: `.claude/skills/refresh-meta/area-brief.md`
- Create: `.claude/skills/refresh-meta/refresh-section.md`

**Interfaces:**
- Consumes: the curated `obsolete` block, `searches.json`, `pnpm db:scope` (app plan); `pnpm capture` (`README.md` § Captures); the deep-research contract (`.claude/skills/deep-research/SKILL.md`); `iterative-research`.
- Produces: the skill, triggered by "refresh".

- [ ] **Step 1: Write `SKILL.md`**

Start from this text. Then fit it to `baseline.md`: keep a rationalization row or red flag only for a failure the baseline produced, put the agent's own words in the Excuse column, add a row for each failure the baseline produced that the draft doesn't cover, and use the form writing-skills' "Match the Form to the Failure" gives each kind (a prohibition with its rationalization row for a rule skipped under pressure; a recipe or template slot for a wrong shape or a missing element). Keep the description free of any workflow summary.

````markdown
---
name: refresh-meta
description: Use when the user says "refresh", "update the meta", "what do they run now", after a game patch or a new season, or when an existing research record's recommendations (decks, teams, rune builds, gear, counters) may be out of date. Not for a new research question: that is deep-research.
---

# Refresh the meta

A refresh is a dated round inside every existing research record: the round's captures in
`evidence/r<date>/`, the curated data updated in place, displaced recommendations marked
obsolete, a `## Refresh <date>` section in the README, and the app re-imported. It never
opens a new record and never rewrites what earlier rounds captured.

**Violating the letter of these rules is violating the spirit of them.**

## Rules no round breaks

1. Earlier evidence is never edited, moved or deleted. A page that changed is a new capture in this round's folder.
2. Every file the round writes under `evidence/` gets its ledger line in the same commit: `pnpm capture` writes it; anything else goes through `pnpm capture log`.
3. A displaced recommendation is marked obsolete, never deleted, and only on evidence in this round (see Obsolete).
4. The saved searches rerun and discovery runs. The old searches alone are not a round.
5. Rank by damage or score. 배 and score ÷ power normalise; they never order anything.
6. Every deck cookie keeps a level or level rule and a mechanism "why".
7. `rtk proxy pnpm verify` passes before every commit. Captured media stays local.

## Words

- **Area:** a record under `research/` with an `import.json`.
- **Round date:** the day the round starts, `YYYY-MM-DD`. Its evidence folder is `evidence/r<date>/`, with the subfolders the record's first round used.
- **Last round:** the newest `## Refresh <date>` heading in the area's README; without one, `curated/meta.json`'s `updated`.
- **Window:** from the last round to the round date.

## The orchestrator: this session

1. **Preflight.** `git status --short` is empty; after `git fetch origin`, `git status -sb` shows `main` level with `origin/main`; `rtk proxy pnpm verify` passes; no other agent lane is running (ask the user when unsure). The areas are the ones the user names, else every area. An area without a `searches.json` gets one reconstructed from its evidence first (the way `docs/superpowers/plans/2026-09-28-refresh-meta-skill.md` Task 2 did), committed before the round.
2. **Window and brief.** Per area, find the last round. Read crumb.gg's patch data (`curl -s https://crumb.gg/data/<name>.json`; record 003 captured it as `evidence/03-sites/crumbgg_data_patches_v5.json`) and write `.superpowers/refresh/<date>/brief.md`: per area, the patches in its window with what they changed (new cookies, treasures and pets, balance changes, new modes or seasons), and the discovery seeds. The brief is scratch; the area agents capture the patch data they rely on into their own round folders.
3. **Area agents, in parallel.** One per area: `model: "opus"`, `isolation: "worktree"`, prompt = `area-brief.md` with its slots filled. An area agent touches only its record's folder and never app code.
4. **Merge, one area at a time.** Read the area's report (`.superpowers/refresh/<date>/<area>-report.md` in its worktree) and copy it to the same path here. Merge its branch into `main`. Copy its round folder's media, never overwriting: `cp -rn <worktree>/research/<area>/evidence/r<date>/. research/<area>/evidence/r<date>/`. Run `pnpm capture verify <area>` (it hashes every media file now present) and `rtk proxy pnpm verify`. Then remove the worktree: `git worktree remove --force <worktree>`, PowerShell `Remove-Item -LiteralPath "\\?\<absolute path>" -Recurse -Force` for leftovers, `git branch -D <branch>`.
5. **Import gate.** Into a new scratch database, import every record the README's database block lists, in number order, one command each: `CRUMBLE_DB=<scratchpad>/round-<date>.db pnpm import:record <slug>`. Then `CRUMBLE_DB=<scratchpad>/round-<date>.db pnpm db:export`, and `pnpm db:scope HEAD <every refreshed slug>`: it must name no other record. The raw diff can't show this: ids follow import order, so one record's new row renumbers every later record's rows. `rtk proxy pnpm verify`, then commit `data/snapshot.json`.
6. **Review.** One Opus review of the round, briefed with this skill, the spec (`docs/superpowers/specs/2026-09-28-meta-refresh-design.md`), the round's base commit and every area's report. It checks each area's changelog against its evidence, each obsolete marking against Obsolete below, and that `git diff --name-status <base>..HEAD -- research/*/evidence` lists only additions besides each `captures.jsonl`. Fix its findings through one agent at a time, `rtk proxy pnpm verify` before each commit, then `git push origin main`.
7. **Report to the user.** Per area: what moved (added, obsoleted, changed, un-obsoleted), a link to its README's refresh section, and what the round couldn't settle. End with: delete `data/crumble.db` (or run `pnpm dev:reseed`) so the app reseeds from the new snapshot; the server's startup warning names the same fix.

## Obsolete

A current recommendation becomes obsolete only on evidence in the round:

- a patch changed a mechanic it depends on, and the round's scores or usage show it dropped out; or
- sources say outright that it no longer works; or
- a documented build beats it on damage or score in the same slot.

Not being mentioned is not evidence: the recommendation stays current and the refresh section lists it as unconfirmed this round. The curated block:

```json
"obsolete": { "since": "2026-10-08", "reason": "…", "sources": ["dc:…"], "superseded_by": "<deck id>" }
```

`since` is the date of the patch that displaced it when the evidence ties it to one, else the round date. `superseded_by` is for decks only. A counter edge that names an obsolete deck is marked obsolete too, with its own reason. A later round removes the block on evidence, and the changelog lists the row as un-obsoleted. The deck keeps its `status`.

## Rationalizations

| Excuse | Reality |
|---|---|
| "The old capture is out of date, I'll refresh the file" | It is the record of what the page said then. The new page is a new file in `evidence/r<date>/`. |
| "Nobody mentions the deck any more, it's dead" | Silence isn't evidence. It stays current, listed as unconfirmed. |
| "The deck is gone, I'll delete it to keep the data clean" | Mark it obsolete with a dated, cited reason. The app shows it in the Obsolete section. |
| "The saved searches already found plenty" | They only find what round one knew to look for. Discovery is what finds the new deck. |
| "I'll add the ledger lines at the end" | Every file's line goes in the commit that adds the file; `pnpm verify` fails otherwise. |
| "The community ranks by 배, so the record should" | 배 normalises. The ranking is by damage or score. |

## Red flags: stop

- A `M` or `D` on anything under `evidence/` but a `captures.jsonl`
- A deck id gone from `curated/decks.json`
- An `obsolete` reason that says only "not mentioned" or "no recent posts"
- A trail round whose queries are all saved searches
- A file under `evidence/r<date>/` with no ledger line
- An ordering or verdict that rests on 배 or score ÷ power
- A worktree about to be removed before its media is copied

Any of these: undo the step and redo it by the rule.
````

- [ ] **Step 2: Write `area-brief.md`**

This is the area agent's prompt; the orchestrator fills the `{…}` slots. Start from this text and adjust it to the baseline log the same way.

````markdown
# Area brief: {area}, round {date}

You are refreshing one research record, `research/{area}/`, in your own worktree, as one
round of a meta refresh. Touch only that folder (and `.superpowers/refresh/{date}/` for your
report); never app code. Anything the app would need goes in your report.

- **Round date:** {date}. Your evidence folder is `research/{area}/evidence/r{date}/`, with the
  subfolders the record's first round used (`ls research/{area}/evidence`): DC posts, Naver
  posts, sites, YouTube, extractions, derived.
- **Window:** {window start} to {date}. Keep posts, pages and videos newer than {window start}.
- **Patch delta and discovery seeds:** {the round brief's section for this area}

A new worktree has no dependencies: run `pnpm install` in it before any `pnpm` command.

Read first: `research/{area}/README.md`, `research-trail.md`, `searches.json`, `curated/`
and `import.json`; `.claude/skills/refresh-meta/SKILL.md` (its rules and Obsolete section
bind you); the deep-research skill's contract and repo section
(`.claude/skills/deep-research/SKILL.md`); `README.md` § Captures for the `pnpm capture`
commands.

## Steps

1. **Baseline.** Rerun every `searches.json` entry, keeping only results newer than the window start:
   - `dc`: `pnpm capture dc list {area} evidence/r{date}/<dc folder>/list-<id>.tsv <pages> <query>`, with enough pages that the last one's oldest post predates the window start (rerun into a new file with more pages if not); then `pnpm capture dc fetch` the new posts worth reading.
   - `naver`: `pnpm capture naver list` the board, then `naver fetch` the new articles.
   - `crumbgg`: `pnpm capture crumbgg <endpoint> {area} evidence/r{date}/<sites folder> <args>`, whole, every round.
   - `youtube`: `pnpm capture youtube search`, then `watch` the new videos, and `download`, `frames`, `sheet` or `subs` for the ones whose lineups you read.
   - `web`: agent-browser, headed, or curl for JSON; then `pnpm capture log {area} <path> --url <url> --tool <tool>`.
   Also capture the crumb.gg patch data the brief rests on into your sites folder.
2. **Discovery, always.** Search again from the patch delta; the new names in the baseline results (deck nicknames, slang, cookie shorthand); the players behind the round's top scores, and their posts and videos; crumb.gg's current top boards; and the iterative-research rounds the deep-research contract requires, written into `research-trail.md` under `## Round {date}`.
3. **Extraction** into `evidence/r{date}/<extract folder>/`, following the record's extraction brief; each file gets its ledger line (`pnpm capture log … --url - --tool manual`).
4. **Curation,** in place:
   - A deck still in use keeps its id; refresh its figures, levels and whys. Every cookie keeps a level or level rule and a why.
   - A new build is a new deck.
   - A displaced recommendation gets an `obsolete` block, by the skill's Obsolete rule, and every counter edge naming an obsolete deck gets one too. A recommendation the round didn't mention stays current.
   - Rank by damage or score.
   - New sources go in `curated/sources.json`, new names in `curated/glossary.json`.
   - `curated/meta.json`'s `updated` becomes {date}.
5. **Searches.** Add every discovery search that produced a cited source to `searches.json` (`added` and `lastHit` {date}); set `lastHit` to {date} on each saved search that found something; delete none.
6. **README.** Rewrite the Verdict and the sections under it to the current answer. Add the refresh section from `.claude/skills/refresh-meta/refresh-section.md` above any earlier refresh section, after the last content section and before `## Sources`. Add the round's files to `## Files` and its sources to `## Sources`.
7. **Check the import.** `pnpm capture verify {area}` prints no problem. When the root `README.md`'s database block imports {area}, `CRUMBLE_DB=<scratchpad>/{area}-{date}.db pnpm import:record {area}` into a new file passes too; a record it doesn't list (one whose mode the app doesn't have yet) is refreshed all the same, and your report says it isn't imported.
8. **Commit** as you go: `rtk proxy pnpm verify` before each commit; message in `.git/crumble-commit-msg.txt`, `git commit -F .git/crumble-commit-msg.txt -- research/{area}`. Don't merge or push.
9. **Report** to `.superpowers/refresh/{date}/{area}-report.md` in your worktree: the changelog (as the refresh section has it), what you couldn't settle, and anything the app would need.
````

- [ ] **Step 3: Write `refresh-section.md`**

````markdown
# The refresh section

Each round adds one section to the record's README, above the earlier refresh sections (newest
first), after the last content section and before `## Sources`. Earlier refresh sections stay
as they are. Every changelog row points at the evidence that decided it.

```markdown
## Refresh YYYY-MM-DD

Window: <last round> to <round date>. Patches in it: <version, date, what it changed for this
mode, each with its evidence pointer>, or "none".

### Changelog

| Change | Recommendation | Evidence |
|---|---|---|
| added | <kind, id and name> | `evidence/rYYYY-MM-DD/…` |
| obsoleted since <date> | <kind, id and name>: <reason>; superseded by <id> | `evidence/rYYYY-MM-DD/…` |
| changed | <kind, id and name>: <what: figures, levels, whys> | `evidence/rYYYY-MM-DD/…` |
| un-obsoleted | <kind, id and name>: <why it holds again> | `evidence/rYYYY-MM-DD/…` |

A round that changed nothing says so in one line instead of the table.

### Unconfirmed this round

<The current recommendations no source in the round mentioned; they stay current.>

### Couldn't settle

<What the round couldn't answer, each with what would settle it.>
```
````

- [ ] **Step 4: No commit yet**

The skill isn't deployed until Task 5 has watched it pass.

---

### Task 5: GREEN and REFACTOR: rerun until the failures are gone

**Files:**
- Modify: `.claude/skills/refresh-meta/SKILL.md`, `area-brief.md`, `refresh-section.md`
- Create: `.superpowers/refresh/skill-tests/green.md` (scratch)

- [ ] **Step 1: Rerun the pressure scenarios with the skill**

Run every scenario again, once each, the prompt prefixed with:

```
This repo has a project skill for this task. Read .claude/skills/refresh-meta/SKILL.md and
the files it points to first, and follow them.
```

Log each run in `.superpowers/refresh/skill-tests/green.md` as `baseline.md` does. Read every answer, not just the ones a keyword search flags.

- [ ] **Step 2: Close each loophole, and rerun**

For each failure: find the agent's reasoning, add the counter in the form its kind needs (a rationalization row and red flag for a skipped rule; a recipe step or template slot for a wrong shape or a missing element), and rerun that scenario once. Repeat until every scenario passes.

- [ ] **Step 3: Dropped (2026-09-28): the full round with the skill**

Not run: the acceptance round is that run, on real data that gets merged, scored with Task 3 Step 2's checks.

- [ ] **Step 4: Commit the skill**

Run: `rtk proxy pnpm verify`
Expected: passes.

Run: `git add .claude/skills/refresh-meta`

Message:

```
feat(skills): refresh-meta, a dated round inside every research record

"Refresh" now has a procedure: the main session sets the patch window
per record, writes a round brief, runs one Opus agent per record in its
own worktree, merges them one at a time, rebuilds the snapshot from a
fresh import checked with db:scope, and has the round reviewed. Each
agent reruns the record's saved searches and always runs discovery,
captures into evidence/r<date>/ with ledger lines, updates the curated
data in place, marks displaced recommendations obsolete only on the
round's evidence, and adds a dated refresh section to the README.

The rules and the rationalization table come from a baseline run
without the skill, whose failures it was rerun against until none were
left.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- .claude/skills/refresh-meta`

---

### Task 6: Point deep-research at `pnpm capture`, the ledger and refresh-meta

The deep-research skill's "Repo specifics" section still sends agents to the retired Python scrapers and the dropped `scrape:*` jobs. The same iron law applies to this edit: watch it fail first.

**Files:**
- Modify: `.claude/skills/deep-research/SKILL.md` (§ Repo specifics (crumble-logbook))
- Modify: `README.md` (§ Working notes)

- [ ] **Step 1: RED, the retrieval test**

Dispatch a single-shot subagent (Opus), once:

```
Read .claude/skills/deep-research/SKILL.md. You are starting research record 006 in this
repo. Using only that skill, list the exact commands you would run to capture a DCInside
search and its posts, a Naver cafe board, crumb.gg's rankings and a YouTube search, what a
captured file needs before its commit, and what you would use instead of this skill to
update record 001 after a patch. Don't run anything.
```

Expected failure: it names `dc_scrape.py`, `nv_scrape.py` or `scrape:*` jobs, says nothing of the ledger, and doesn't name `refresh-meta`. Log it in `.superpowers/refresh/skill-tests/deep-research.md`.

- [ ] **Step 2: GREEN, replace the section**

In `.claude/skills/deep-research/SKILL.md`, replace everything under `## Repo specifics (crumble-logbook)` with:

```markdown
## Repo specifics (crumble-logbook)

This skill was written for an HTTP-behaviour blog repo; in this repo the "site" is the game
community, and the steps map as follows.

- Records live in `research/NNN-<slug>/`: `README.md`, `research-trail.md` and `evidence/`,
  numbered in capture order; a record the app loads also has `import.json`, `curated/` and
  `searches.json`, its saved searches (schema `packages/capture/src/searches.ts`). Record
  `003-stage-pushing-meta` shows the current evidence layout.
- "Measure" means capture: forum posts, comments, images, ranking pages and videos saved
  verbatim into `evidence/` with `pnpm capture` (`README.md` § Captures lists the commands and
  their arguments): `dc list` and `dc fetch`, `naver list` and `naver fetch`, `crumbgg
  <endpoint>`, and `youtube` `watch`, `search`, `download`, `frames`, `sheet` and `subs`.
- Every file under `evidence/` gets its line in the record's `evidence/captures.jsonl` in the
  commit that adds it. `pnpm capture` writes the line itself; a file captured any other way
  (agent-browser, curl, a derived or hand-written file) gets it from `pnpm capture log <record>
  <path> --url <url|-> --tool <tool>`. `pnpm capture verify <record>` checks a ledger, and
  `pnpm verify` checks every record's. Captured media stays local (gitignored); its line is
  committed.
- The Python scrapers in `001/evidence/` are retired, kept unedited as the record of how
  records 001 and 002 were captured. Never run them.
- Subagent extractions follow `001/evidence/08-extract/BRIEF.md` and land in `08-extract/`;
  `pnpm import:record <slug>` loads the curated dataset into the app.
- Client-rendered pages are read with agent-browser, headed, using the native Chrome
  (`AGENT_BROWSER_EXECUTABLE_PATH`); crumb.gg's public JSON is captured with
  `pnpm capture crumbgg`.
- This skill makes a record's first round. Bringing an existing record up to date after a
  patch, or when the user says "refresh", is `refresh-meta`: a dated round inside the record,
  not a new record.
```

- [ ] **Step 3: GREEN, rerun the retrieval test**

Rerun Step 1's prompt once. Passes when the run names the `pnpm capture` commands, the ledger line in the same commit with `pnpm capture log` for other captures, and `refresh-meta` for record 001. Otherwise tighten the section and rerun.

- [ ] **Step 4: Name the skill in the README**

In `README.md` § Working notes, add a bullet:

```markdown
- **Refreshing the meta:** after a patch, or when you say "refresh", the `refresh-meta` skill (`.claude/skills/refresh-meta/`) adds a dated round to each research record: new captures in `evidence/r<date>/`, displaced recommendations marked obsolete, a `## Refresh <date>` section in the README, and the snapshot rebuilt.
```

- [ ] **Step 5: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Message:

```
docs(skills): deep-research's repo section names pnpm capture and the ledger

The section still sent agents to the retired Python scrapers and the
dropped scrape:* jobs, and said nothing of the capture ledger, so a
retrieval test from it named commands that no longer write ledger
lines. It now names the pnpm capture commands, the ledger and pnpm
capture log, and hands later rounds of a record to refresh-meta. The
README's working notes name the skill.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- .claude/skills/deep-research/SKILL.md README.md`

---

### Task 7: Acceptance: a real round on one area

The spec's acceptance: a real round on one area, merged and reviewed, before the skill is used across all of them. Run it on `001-guild-conquest-meta`, the area the baseline and the GREEN runs used.

**Files:** whatever the round writes under `research/001-guild-conquest-meta/` and `data/snapshot.json`.

- [ ] **Step 1: Run the skill as the orchestrator, on the one area**

In the main session, follow `.claude/skills/refresh-meta/SKILL.md` from Preflight to Report, with the areas limited to `001-guild-conquest-meta`. Note the round's base commit (`git rev-parse HEAD`) before the area agent starts.

- [ ] **Step 2: Check what the Review Focus names**

Before removing the worktree at the merge step: the round folder's media is present in the main checkout (`pnpm capture verify 001-guild-conquest-meta` hashes each present file; compare the round folder's file list in both checkouts with `ls -R`).

After the import gate: `pnpm db:scope <base commit> 001-guild-conquest-meta` exits 0, and `pnpm db:scope <base commit>` (no slug) exits 1 naming `001-guild-conquest-meta`, which shows the check bites.

The README has a `## Refresh <date>` section whose window starts at the `updated` date `curated/meta.json` held at the base commit.

Run: `git diff --name-status <base commit>..HEAD -- research/001-guild-conquest-meta/evidence`
Expected: only `A` lines, and an `M` on `evidence/captures.jsonl`.

- [ ] **Step 3: The review and the push**

The skill's review step runs one Opus review; fix its findings one agent at a time; `rtk proxy pnpm verify` before each commit; `git push origin main`.

- [ ] **Step 4: Fold what the round taught back into the skill**

Anything the round had to improvise (a missing step, a command that didn't fit, a template slot it needed) is a failure of the skill: add it with the same RED-GREEN rule (a scenario reproducing it without the fix, then with it), commit the skill change on its own, and push.

- [ ] **Step 5: Report to the user**

The skill's report: what moved in record 001, the link to its refresh section, what the round couldn't settle, and the reminder to delete `data/crumble.db` (or run `pnpm dev:reseed`).
