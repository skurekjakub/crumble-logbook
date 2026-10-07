# crumble-logbook

Research tool for Cookie Run: Crumble: Guild Conquest (길드 토벌전) and PvP (Arena, Rumble Arena) research records, served by a Hono API and a React web app.

**Start every session by reading `README.md`** (layout, commands, API, working notes) and **`OPEN-QUESTIONS.md`** (decisions waiting on the user).

- Design specs: `docs/superpowers/specs/`. Plans: `docs/superpowers/plans/`.
- Research records: `research/NNN-slug/`. Evidence captures are never edited after capture; a later measurement is a new numbered file.
- Every file written under `evidence/` gets a line in the record's capture ledger (`evidence/captures.jsonl`) in the same commit: the TypeScript scrapers (`pnpm capture …`) append it themselves; any other capture uses `pnpm capture log`. Gitignored media gets its line too; the line is committed and the file stays local.
- `pnpm verify` runs the ledger check (a vitest suite over every record), so a missing line or an edited capture fails the gate.

## Key directives

- No enumerating and no gratuitous counting, in docs, comments, commit messages and replies to the user. Don't write how many of something there is ("three agents", "the same four stages", "nine questions, five need you") and don't type a roster into a sentence; point at the file or folder that holds the list. A count stays only when the number is the point: a threshold in a rule, a dated measurement in a record, a test or damage figure.

## Rules the user set (don't relitigate)

- Rank by damage, never by 배 (damage ÷ team power). 배 is only a normaliser.
- Every deck cookie carries a level (or a level rule) and a mechanism "why".
- Layered, extensible code: routes → services → repos → db, enforced by `apps/server/test/architecture.test.ts`. Files split along semantic and logical responsibility, not line count: don't pile unrelated concerns into one file, and a file that needs to be long stays long.
- JSDoc, TSDoc-style, on every function, method, class and interface method, tests' `it()` bodies excepted: a summary of what it does, `@param name - …` for each parameter, `@returns …` when it returns a value, and `@throws …` for how it fails. Types stay in TypeScript, not in tags. ESLint enforces it (`tools/eslint-config`), and `pnpm verify` (typecheck, lint, format, tests) must pass before a commit.
- No auth. The only hosting is the read-only Vercel deployment of the committed snapshot (README § Deployment); every write still happens locally. All TypeScript. Schemas are Drizzle + Zod.
- The repo is public, and everything is published, raw text and JSON captures included. Captured media (images, video frames, video) stays local: `.gitignore` excludes it under `research/`. Raw APK or decompiled artefacts never go in the repo.
- Work on `main` and push to `origin`; worktree lanes for parallel agents merge into `main`. No feature branches until the app has a working baseline.
- Reviews run on Opus.
- Web access: agent-browser, headed, with `AGENT_BROWSER_EXECUTABLE_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"` and a named `AGENT_BROWSER_SESSION`.
  - Never `agent-browser wait <ms>`, and never wrap it in `timeout`.
  - `open` may not return while Vite runs: launch it in the background and navigate in-page.
  - No Playwright. curl only for JSON APIs and server-rendered pages.
- The research write-up for a record is written at the end of the working session, to the deep-research contract (`.claude/skills/deep-research/SKILL.md`).
- **UI: scannable, not prose (MANDATORY).**
  - Every screen answers "what's good, what's not" at a glance. Rank, tier, good/avoid, win/lose and confidence show as badges, colour, icons and position before any text.
  - Default-view explainers are 1–3 short bullets of about 12 words or fewer, never paragraphs.
  - Any `why`, lede, caveat, mechanism or note longer than one line is clamped and expands on demand.
  - No filler copy, no "Understanding X" headings, no marketing tone.
  - A cookie's icon shows wherever the cookie appears, with a badge fallback.
  - Sources are small chips at the end of a row, never inline text.
  - Navigation is obvious, with a visible active state.
  - Modern, sleek, simple: a restrained palette from the tokens, generous spacing, light and dark themes, phone width.
  - Curated strings follow the same rule: a cookie `why` is one line, and other strings lead with the verdict in under ~25 words.
  - Before a UI change is done, check every screen it touches in agent-browser.
