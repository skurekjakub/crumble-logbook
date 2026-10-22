# A player-first app: plan

> **For agentic workers:** steps use checkbox (`- [ ]`) syntax; tick a box in the same commit as the work it names.

**Goal:** build `docs/superpowers/specs/2026-10-22-player-first-app-design.md`: English chrome, grouped navigation with a Best setup landing, a page per cookie, gear builds, then a full refresh round that fills the builds and puts the curated text into English.

**Lanes:** the web lane (Tasks 1–5) and the server lane (Tasks 6 and 8) own disjoint files and run in parallel worktrees; Tasks 7 and 9 need both and run after their merges. The orchestrator alone merges, rebuilds `data/snapshot.json` and pushes.

## Global Constraints

- `AGENTS.md`: `routes → services → repos → db`; Drizzle + Zod; JSDoc on every function, method and interface method; no counting or enumerating in prose; rank by damage, never by 배; every deck cookie keeps a level and a why; the UI rules (verdict first, scannable, icons with badge fallback, sources as chips last, clamped long text, visible active state, both themes, phone width).
- `docs/conventions/comment-policy.md` and `.ai/agent-working-rules.md` § 4: no archaeology, no comparative framing; code reads as if it had always been this way.
- `.ai/agent-working-rules.md` § 3: fold duplication in the area touched; the account service's name resolver moves onto the shared helper rather than staying beside it.
- `.claude/skills/feature-development/references/ui-surface-rules.md`: tokens only, one stylesheet per area imported in `apps/web/src/main.tsx`, reuse `Pill`, `CookieName`, `SourceChips`, `Clamp`, `QueryResult`; `RuneCard` is the reference component.
- Tests stage their own fixtures; never a real record's curated values outside the whole-record import tests, which derive from the curated files. Tests pinning old behaviour are rewritten to the new contract in the same commit.
- A new test file or `it()` block is written by `rubber-duk-tests` (WRITE), seen failing first.
- `pnpm verify` passes before every commit; every commit on `main` is pushed (fetch first, fast-forward only). A route file added under `apps/web/src/routes/` regenerates `apps/web/src/routeTree.gen.ts` (`pnpm --filter @crumble/web build`), committed with it.
- The rift macro (`tools/rift-macro/`) may be running against the emulator: don't touch `tools/`, the emulator or the macro's files.
- Don't run the Vercel CLI or any deploy command.

## Stage 1 — English chrome (web lane)

### Task 1: `CookieName` speaks English

Files: `apps/web/src/components/CookieName.tsx`, `apps/web/src/views/GlossaryView.tsx`, `apps/web/src/styles/ui.css`, `apps/web/test/names-and-chips.test.tsx` and every test pinning a name's Korean line.

- [ ] Visible text: the short English name; `title`: the full English name and the Korean; unresolved names show their stored form; a `showKr` prop keeps the Korean line, used by the Glossary's cookie and pet rows. JSDoc rewritten.
- [ ] `.name-stack .kr` and `.name-inline .kr` rules go unless `showKr` uses them.
- [ ] Tests (both layouts, tooltip, unresolved, `showKr`); the Glossary still shows a Korean term.
- Verify: `pnpm exec vitest run apps/web/test/names-and-chips.test.tsx apps/web/test/sources-glossary-views.test.tsx`, then `pnpm verify`.

### Task 2: no Korean in the chrome

Files: `apps/web/src/app/modes/types.ts` and every `apps/web/src/app/modes/*.ts`, `apps/web/src/routes/__root.tsx`, `apps/web/src/components/SideNav.tsx`, `apps/web/src/components/PageHeader.tsx` (docblock), `apps/web/src/views/ResearchView.tsx`, the views the spec's Stage 1 lists (`DeckCard`, `BossView`, `CounterMatrix`, `DailyDungeonsView`, `StageZonesView`, `StageBracketsView`, `PowerSourcesView`, `PackagesView`, `TeamPowerParts`), `apps/web/src/views/RunesView.tsx`, `apps/web/src/lib/` (an `englishHalf` helper for "불/Fire"), `apps/web/src/styles/shell.css`, `apps/web/src/styles/shared-pages.css`, and the tests that pin the Korean.

- [ ] `labelKr` deleted from `SectionBase` and every config; its renders removed.
- [ ] Each listed `.kr` render moves into its element's `title`; their CSS goes.
- [ ] Glossary `element` and `class` render their English half wherever shown.
- [ ] Runes filter placeholder "Filter by cookie or stat, e.g. Milk, haste…"; a test types a Korean name and keeps the row.
- [ ] `apps/web/test/app-shell.test.tsx`'s every-mode-every-page loop asserts no `/\p{Script=Hangul}/u` in the body text, `placeholder` or `aria-label`, outside `/glossary` and `/sources`. Curated strings still carry Korean until Stage 5, so the loop checks the chrome only: it strips the text of curated-data containers marked `data-curated` (added to the curated text nodes the views render: rune lines, whys, titles, notes) and the assertion tightens to the whole body in Task 12.
- Verify: `pnpm exec vitest run apps/web/test/app-shell.test.tsx`, then `pnpm verify`.

## Stage 2 — Navigation (web lane)

### Task 3: grouped side nav

Files: `apps/web/src/app/modes/types.ts`, `apps/web/src/app/modes/index.ts`, `apps/web/src/app/modes/shared.ts`, `apps/web/src/components/SideNav.tsx`, `apps/web/src/routes/__root.tsx`, `apps/web/src/styles/shell.css`, `apps/web/test/app-shell.test.tsx`.

- [ ] `navGroup: "play" | "builds" | "you" | "reference"` on `SectionBase`, set on every section; Team power in "you". The nav renders a labelled list per group (`aria-labelledby`), in the spec's order; the "builds" group renders once it has sections (Tasks 7 and 9 add them).
- [ ] Tests: the groups, their labels and members; the active state survives.
- Verify: `pnpm exec vitest run apps/web/test/app-shell.test.tsx apps/web/test/modes.test.ts`, then `pnpm verify`.

### Task 4: Setup and Details

Files: `apps/web/src/app/modes/types.ts`, `apps/web/src/app/modes/links.ts`, `apps/web/src/app/modes/pvp-shared.ts`, every mode config, `apps/web/src/components/SideNav.tsx`, `apps/web/src/components/ModePageStrip.tsx` (new), `apps/web/src/routes/__root.tsx`, `apps/web/src/styles/shell.css`, `apps/web/test/modes.test.ts`, `apps/web/test/app-shell.test.tsx`.

- [ ] Required `group: "setup" | "details"` on `SectionTab`, through `modeTab()` and `pvpTabs()`; every tab assigned per the spec's Stage 2 lists.
- [ ] The side nav renders a mode's pages as two labelled lists; `ModePageStrip` renders the Setup pages as `<Link aria-current>` at the top of every mode page, 44px touch targets at phone width, no `role="tab"`.
- [ ] Tests: each tab in exactly one group; the stage mode's Setup list in order with Rift active; the strip on a mode page.
- Verify: `pnpm exec vitest run apps/web/test/modes.test.ts apps/web/test/app-shell.test.tsx`, then `pnpm verify`.

### Task 5: Best setup lands, Findings moves

Files: `apps/web/src/app/modes/types.ts` (`SharedView` `setup`, `overview` → `findings`), every mode config (copy `setup`, `findings`; tabs), `apps/web/src/routes/$mode/index.tsx`, `apps/web/src/routes/$mode/findings.tsx` (new), `apps/web/src/routes/$mode/overview.tsx` (redirect), `apps/web/src/views/BestSetupView.tsx` (new), `apps/web/src/views/OverviewView.tsx` (copy key), `apps/web/src/views/DeckLink.tsx`, `apps/web/src/views/AccountRoadmap.tsx`, `apps/web/src/styles/` (a `setup.css`), `apps/web/src/routeTree.gen.ts`, the tests that render a mode root expecting findings (`app-shell`, `conquest-views`, `pvp-views`, `team-power-views`, `mode-isolation`, `daily-dungeon-views`), `apps/web/test/best-setup-view.test.tsx` (new).

- [ ] `/$mode` renders `BestSetupView` for Guild Conquest, Arena, Rumble Arena, Stages and Crumble Dungeon; Daily Dungeons' board and Team power's landing as today. `/$mode/findings` renders the findings for every mode; `/daily-dungeons/overview` redirects to it.
- [ ] Best setup per the spec: the first current `meta` deck by `position` (head only, link to its card), the gear block (the mode's `GearBoard` until Task 9), the runes per deck cookie (linked build, else unlinked, else the muted row), the Crumble Dungeon's first twelve, the stage's block per rift deck in a `TocLayout`.
- [ ] Tests per the spec's Stage 2 list (landings, redirect, the obsolete/alt/meta fixture, the three rune cases, the rift blocks).
- Verify: `pnpm exec vitest run apps/web/test/best-setup-view.test.tsx apps/web/test/app-shell.test.tsx`, then `pnpm verify`.

## Stage 3 — Cookies

### Task 6: the cookies service (server lane)

Files: `apps/server/src/services/names.ts`, `apps/server/src/services/account.ts`, every service that builds a name ref (`{ kr, en }`), `packages/schema/src/` (the name-ref type gains `key`), `apps/server/src/services/cookies.ts` (new), `apps/server/src/routes/cookies.ts` (new), `apps/server/src/services/index.ts` (or wherever services are composed), `apps/server/src/app.ts`, `apps/server/test/services/cookies.test.ts`, `apps/server/test/routes/cookies.test.ts` (new), the tests that assert name refs.

- [x] One resolver helper returning the winning glossary entry per row and its records; the cookie lookup keeps `kind: "cookie"`; key = `extra.resource_key`, else English slug, else Korean slug; the account service uses it.
- [x] Every API name ref gains `key` (null for non-cookies).
- [x] `GET /api/cookies` and `GET /api/cookies/:key` per the spec, composing the rune-build, deck and usage services; English halves of element and class; 404 `not_found`.
- [x] Tests per the spec's Stage 3 server list.
- Verify: `pnpm exec vitest run apps/server/test/services/cookies.test.ts apps/server/test/routes/cookies.test.ts apps/server/test/architecture.test.ts`, then `pnpm verify`.

### Task 7: the cookie pages (after Tasks 1–6 merge)

Files: `apps/web/src/routes/cookies.tsx`, `apps/web/src/routes/cookies_.$key.tsx` (new), `apps/web/src/views/CookiesView.tsx`, `apps/web/src/views/CookieView.tsx` (new), `apps/web/src/api/queries.ts`, `apps/web/src/api/types.ts`, `apps/web/src/lib/levels.ts` (`levelText` moved from `views/DeckCard.tsx`), `apps/web/src/components/RuneBuilds.tsx` and the deck level table (links), `apps/web/src/app/modes/shared.ts` (`/cookies` in "builds"), `apps/web/src/styles/cookies.css`, `apps/web/src/routeTree.gen.ts`, `apps/web/test/cookie-views.test.tsx` (new).

- [ ] The grid and the cookie page per the spec's Stage 3; links from the rune card heading and the deck's cookie cell by the API's key.
- [ ] Tests per the spec's Stage 3 web list.
- Verify: `pnpm exec vitest run apps/web/test/cookie-views.test.tsx`, then `pnpm verify`.

## Stage 4 — Gear builds

### Task 8: the `gear_builds` content type (server lane)

Files: `packages/schema/src/tables/gear.ts` (or a new table file beside it), `packages/schema/src/zod.ts`, `packages/schema/src/inputs.ts`, `packages/schema/src/enums.ts`, `packages/schema/src/obsolete.ts`, the generated migration (`pnpm --filter @crumble/schema db:generate`), `apps/server/src/importers/` (seed schema, mapping, the `gearBuilds` collection, the manifest key), `apps/server/src/registry.ts`, `apps/server/src/app.ts`, `apps/server/test/registry.test.ts`, `apps/server/test/importers/` (seed-map, a staged fixture from `fixtures/006-daily-dungeons/`), `packages/schema/test/inputs.test.ts`, `packages/schema/test/enums.test.ts`, `packages/schema/test/roundtrip.test.ts`, the whole-record import tests.

- [x] The table, its Zod (JSON overrides), input (obsolete columns omitted, `min ≤ max` refined after the omit), enums and obsolete entity.
- [x] The importer collection: header file, optional, `slug` uniqueness across records, one current build per (mode, variant), moded-row rule, sources checked, `checkObsoleteDates`.
- [x] The registry entry and route, ordered by `position`, `?mode=` and `?current=` filters.
- [x] Tests per the spec's Stage 4 schema and importer list; whole-record tests derive the table's count from `curated/gear-builds.json` when present.
- Verify: `pnpm exec vitest run packages/schema apps/server/test/registry.test.ts apps/server/test/importers`, then `pnpm verify`.

### Task 9: the build card and the Gear builds page (after Task 8 merges)

Files: `apps/web/src/components/GearBuild.tsx` (new), `apps/web/src/styles/gear.css` (new, imported in `main.tsx`), `apps/web/src/views/GearView.tsx`, `apps/web/src/views/GearBuildsView.tsx` (new), `apps/web/src/routes/gear.tsx` (new), `apps/web/src/views/BestSetupView.tsx` (gear block), `apps/web/src/api/queries.ts`, `apps/web/src/app/modes/shared.ts` (`/gear` in "builds"), `apps/web/src/routeTree.gen.ts`, `apps/web/test/gear-views.test.tsx` (new).

- [ ] The card, the Gear tab order, the `/gear` table with its phone cards, the Best setup gear block preferring the build whose `deck` matches, per the spec's Stage 4.
- [ ] Tests per the spec's Stage 4 web list.
- Verify: `pnpm exec vitest run apps/web/test/gear-views.test.tsx apps/web/test/best-setup-view.test.tsx`, then `pnpm verify`.

## Smoke, review, finish (Stages 1–4)

- [ ] Smoke: every touched screen in agent-browser, light and dark, at phone width, zero console errors; `curl` `/api/cookies`, `/api/cookies/<key>`, `/api/gear-builds?mode=stage`.
- [ ] Review: `rubber-duk-review` over the range, with `rubber-duk-frontend` and `rubber-duk-backend` (REVIEW) and `rubber-duk-tests` (AUDIT), all on Opus; findings fixed or rebutted.
- [ ] `README.md` (What's here, the API table, the app's sections), the touched diagrams in `.ai/diagrams/`, the `.ai/dod/` checklists walked, the explainer published, its roster row, the final commit pushed.

## Stage 5 — The refresh round

### Task 10: the skill learns both jobs (orchestrator)

Files: `.claude/skills/refresh-meta/SKILL.md` (Obsolete names gear builds), `.claude/skills/refresh-meta/area-brief.md` (the gear-builds and English jobs), `.claude/skills/refresh-meta/references/refresh-section.md` (the `translated` row kind).

- [ ] The three edits; `pnpm verify`; commit.

### Task 11: the round (orchestrator, per `.claude/skills/refresh-meta/SKILL.md`)

- [ ] Preflight, brief, an area agent per record in worktrees, merges, import gate, snapshot, review, one push, report: as the skill sets out.

### Task 12: the English guard (in the round's final commit)

Files: `apps/server/test/curated-english.test.ts` (new), its staged fixture; `apps/web/test/app-shell.test.tsx` (the loop drops its `data-curated` exemption).

- [ ] The curated-file walk with the allow-list and its self-test, per the spec's Stage 5; green on the round's tree with no known-violations list.
- Verify: `pnpm exec vitest run apps/server/test/curated-english.test.ts apps/web/test/app-shell.test.tsx`, then `pnpm verify`.
