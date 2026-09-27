# crumble-logbook

Research tool for Cookie Run: Crumble: Guild Conquest (길드 토벌전) and PvP (Arena, Rumble Arena) research records, served by a Hono API and a React web app.

**Start every session by reading `README.md`** (layout, commands, API, working notes) and **`OPEN-QUESTIONS.md`** (decisions waiting on the user).

- Design specs: `docs/superpowers/specs/`. Plans: `docs/superpowers/plans/`.
- Research records: `research/NNN-slug/`. Evidence captures are never edited after capture; a later measurement is a new numbered file.

## Rules the user set (don't relitigate)

- Rank by damage, never by 배 (damage ÷ team power). 배 is only a normaliser.
- Every deck cookie carries a level (or a level rule) and a mechanism "why".
- Layered, extensible code: routes → services → repos → db, enforced by `apps/server/test/architecture.test.ts`. No single huge files.
- Local only: no hosting, no auth. All TypeScript. Schemas are Drizzle + Zod.
- The repo is public, and everything is published, raw captures included. Raw APK or decompiled artefacts never go in the repo.
- Work on `main` and push to `origin`; worktree lanes for parallel agents merge into `main`. No feature branches until the app has a working baseline.
- Reviews run on Opus.
- Web access: agent-browser, headed, with `AGENT_BROWSER_EXECUTABLE_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"` and a named `AGENT_BROWSER_SESSION`.
  - Never `agent-browser wait <ms>`, and never wrap it in `timeout`.
  - `open` may not return while Vite runs: launch it in the background and navigate in-page.
  - No Playwright. curl only for JSON APIs and server-rendered pages.
- The research write-up for a record is written at the end of the working session, to the deep-research contract (`.claude/skills/deep-research/SKILL.md`).
