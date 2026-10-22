# A player-first app: English on screen, a page per cookie, a gear build per mode

Date: 2026-10-22. Asked by the user, in order:

> "do research on gear presets per gamemode add as new blade or whatever as info to each or wahtever on the app, and make sure to chagne the layout so its more readable ucrrently its ass"

> "the entire app is completele garbage. why is there korean randomly, trying to make sense of wahts good for each cookie sugar runes wise is impossible, everything is scattered everywhere"

> "what do i know ffs, make sure that each mode has the best gear and i can cleaerly find it in the app"

The user picked both gear views offered (a card per mode and a cross-mode comparison) and asked for no further design questions, so every call below is made here and open to their veto.

## Why

The user plays with the app open and asks it one question: *what do I run here?* Today the answer is spread out.

- **Korean shows up in the chrome.** The side nav and the header carry each section's Korean name (`labelKr`, rendered in `routes/__root.tsx` and `components/SideNav.tsx`, and on the research page in `views/ResearchView.tsx`). Cookie names carry their Korean beneath them (`components/CookieName.tsx`), and so do deck names, the boss heading, zone and dungeon names and the team-power views (the `.kr` renders listed under Stage 1). Curated strings mix in forum shorthand ("All ATK% (8 × 공증)"), and the runes filter hint is Korean (`views/RunesView.tsx`). The user reads English.
- **A cookie's runes can't be found.** Rune builds are filed per mode (`/$mode/runes`). Seeing what Milk wants means opening every mode's runes tab and scanning it. No page is about a cookie.
- **The answer is scattered.** A mode's pages are a long nested list in the side nav (`app/modes/*.ts` `tabs`), and its landing page is a list of research findings. Which deck, which runes and which gear live on separate pages, and on a phone the page list sits behind the menu button.
- **Gear can't be read as a build.** The Gear tab is a per-slot board of prose substat notes (`curated/gear.json`). Rift advice exists only as stage notes (record 003 files it under `mode: stage`), and no page says plainly how many skill-haste lines to run or what accuracy to reach. Tonight that was exactly the question for the rift.
- **The meta is behind the game.** Patch v1.6 landed on 2026-10-22 (crumb.gg `patches.json`), and every record's last round predates it (001 and 002 on 2026-10-10, 003 and 004 on 2026-10-07).

## Design

Two halves, in this order: the app work ships first, in stages that each work on their own, then a full refresh round fills the new content type and puts the curated text into English. The app work must merge first because the importer has to know the new collection before a round writes it (`apps/server/src/importers/collections.ts` `curatedManifest` strips unknown keys).

### Stage 1 — English chrome

- **Rule:** the app's chrome (nav, headers, tabs, labels, placeholders, names) is English. Korean stays visible only on the Glossary and on the Sources page, which show the original titles of Korean posts. Elsewhere a Korean name moves into the element's `title` tooltip.
- **`CookieName`:** renders the short English name; the tooltip holds the full English name and the Korean. An unresolved name still shows its stored form, so nothing renders blank. A `showKr` prop keeps the visible Korean line for the Glossary (`views/GlossaryView.tsx`).
- **`labelKr`** is deleted from `SectionBase` (`app/modes/types.ts`) and every section config, and its renders go: `routes/__root.tsx` (header context and nav), `components/SideNav.tsx`, `views/ResearchView.tsx`. `components/PageHeader.tsx`'s docblock example is rewritten.
- **Other Korean renders move to tooltips:** deck names (`views/DeckCard.tsx`), the boss heading (`views/BossView.tsx`), the counter matrix (`components/CounterMatrix.tsx`), daily dungeon names (`views/DailyDungeonsView.tsx`), stage zones and brackets (`views/StageZonesView.tsx`, `views/StageBracketsView.tsx`) and the team-power views (`views/PowerSourcesView.tsx`, `views/PackagesView.tsx`, `views/TeamPowerParts.tsx`). Their CSS rules for the removed lines go with them (`.name-stack .kr`, `.name-inline .kr` in `styles/ui.css`, `.nav-section-link .kr` in `styles/shell.css`, `.mode-chip .kr` in `styles/shared-pages.css`).
- **Glossary `element` and `class`** are stored bilingual ("불/Fire", "방어/Tank"); the views show the English half.
- **Placeholders:** the runes filter reads "Filter by cookie or stat, e.g. Milk, haste…". It already matches Korean too, since it searches the whole row; a test pins that.
- **Curated strings** stay as they are until the refresh round translates them (Stage 5).

### Stage 2 — Navigation that answers "what do I run"

- **Side nav groups,** from a `navGroup` field on `SectionBase` (`"play" | "builds" | "you" | "reference"`), each group with a visible label tied to its list (`aria-labelledby`):
  - **Play:** the game modes, in their current order (`app/modes/index.ts`).
  - **Builds:** Cookies and Gear builds (new shared sections, `app/modes/shared.ts`).
  - **You:** Account and Team power.
  - **Reference:** Damage formula, Research, Sources, Glossary.
- **A mode's pages split in two,** from a required `group: "setup" | "details"` on `SectionTab` (`app/modes/types.ts`), passed through `modeTab()` (`app/modes/links.ts`) and `pvpTabs()` (`app/modes/pvp-shared.ts`) so the typecheck finds every tab:
  - **Setup:** the landing page, Teams or Decks, Sugar runes, Gear, and each mode's player tools: the stage's Rift, Rift at 15% and Bracket calculator, the dungeon's lineups, daily's board.
  - **Details:** Findings, Scores & RNG, Mechanics, Timeline, Usage, Counters, the boss screen, Attempts and the remaining research tabs.
  - Every mode config assigns each of its tabs; a test asserts each tab sits in exactly one group.
- **Where they render:**
  - In the side nav, a mode's page list becomes two labelled lists ("Setup", "Details").
  - At the top of every mode page, a strip of `<Link aria-current>` elements (not ARIA tabs; `apps/web/test/app-shell.test.tsx` checks no `role="tab"` exists) lists the Setup pages, so a phone shows them without opening the menu. Touch targets are at least 44px tall at phone width.
- **Landing page:**
  - Guild Conquest, Arena, Rumble Arena, Stages and Crumble Dungeon land on **Best setup** at `/$mode` (the index route keeps its path, so `mode.link`, the `/` redirect, the record lede and the nav's active state are untouched).
  - Today's overview moves to `/$mode/findings` for those modes. Daily Dungeons keeps its board at `/$mode` and its overview at `/$mode/overview`, renamed to `findings` with the others. Team power keeps its own landing.
  - The `SharedView` key `overview`, each mode's `copy.overview`, the copy that says "the rules are on its overview" (`pvp-shared.ts`, `stage.ts`), `views/DeckLink.tsx`'s tab list and `views/AccountRoadmap.tsx`'s fallback all follow the rename. `/daily-dungeons/overview` answers with a redirect to `/daily-dungeons/findings`.
- **Best setup** (`views/BestSetupView.tsx`), copy from a new `SharedView` key `setup` in each mode config (title and a lede of three bullets or fewer):
  1. **The deck:** the mode's first current deck of status `meta` in curated `position` order. Each record orders `position` by its mode's measure (Guild Conquest by its decks' best score damage, Crumble Dungeon by run score, stages by stage reached then lowest power, Arena and Rumble by status and usage), never by 배 (AGENTS.md), and the refresh round re-checks that order, so the app adds no ranking of its own. It shows the deck's head only: formation or lineup, status pill, ceiling chip, and a link to its full card (`deckPage()`, `deckId()` from `views/DeckCard.tsx`).
  2. **The gear build** for the mode (Stage 4); until a mode has one, the mode's current gear rows through `GearBoard`, as the Gear tab shows them.
  3. **The runes:** for each cookie in the deck, the mode's rune build linked to that deck (`runeBuildsQuery(scope, deckId, { current: true })`), else the cookie's build linked to no deck, else a muted "no build recorded" row. Each row: icon, the verdict pill (`StancePill`), the lines, the why clamped to one line, sources as chips. The Crumble Dungeon's first-wave list shows its first twelve cookies.
  - **Stages** show one such block per deck the stage config names for the rift (`stage.rift.decks`, `app/modes/stage.ts`) after the main-stage block, laid out with `TocLayout`. Its gear block uses the build whose `deck` field names that deck, else the mode's default build.

### Stage 3 — A page per cookie

- **Routes:** `routes/cookies.tsx` (the grid) and `routes/cookies_.$key.tsx` (one cookie, un-nested as `routes/research_.$slug.captures.tsx` is), with `/cookies` in `SHARED_SECTIONS` so the nav marks it active. Links use `<Link to="/cookies/$key" params={{ key }}>`.
- **`/cookies`:** every cookie the glossaries list, grouped by class (an "Unknown class" group for rows without one), used cookies first within each group. Each tile is one link of at least 44×44px with the icon, the English name and the modes it appears in as small chips; a tile with none says "No builds yet" in text. The filter is in the URL (`?q=`, through `useSearchPatch`) and matches English and Korean. Pets and other glossary kinds aren't tiles.
- **`/cookies/$key`:** the cookie's name is the page's `<h2>` under the shared header. Under it: icon, element, class, rarity and skill name (English halves). Then one block per game mode (`<h3>`) holding:
  - its rune builds (`RuneCard`, `headingLevel={4}`), each labelled with the decks it's linked to;
  - the decks it's in, each with its level or level rule and the slot's why (the existing `levelText`, moved from `views/DeckCard.tsx` into `lib/`);
  - its usage where the mode records it (`UsageBars`).
  - Obsolete builds and decks sit in each block's `ObsoleteSection`.
  - Modes with nothing for the cookie are named once at the bottom: "Not used in: …", over the modes that have a record (`MODES` minus team power).
- **Links:** the `RuneCard` heading and the cookie cell of a deck's level table link to the cookie page. `CookieName` itself stays a plain name, since it sits inside other links (counter tiles) and names pets.
- **Identity:** a cookie's key is its stored glossary row's `resource_key` (`extra.resource_key`; e.g. `cookie0018`), else a slug of its English name, else, when `en` is null, a slug of its Korean name. Glossary rows are shared across records and keyed by `kr`, the first record to load a name keeping it (`apps/server/src/importers/collections.ts`), so key, element and class come from the stored row, not each record's file.
- **Resolution:** one helper in `apps/server/src/services/names.ts` returns the winning glossary entry for a name, per row with the row's own records (`recordsOf`), so a shorthand that means different things in different records lands right (바궁: Princess Bari in 001, a term in 002). A cookie lookup keeps only `kind: "cookie"` entries. The account service's private name-to-key resolver (`apps/server/src/services/account.ts`) moves onto the same helper. Every API name ref (`{ kr, en }`) gains `key` (null for non-cookies), so the web never derives a key itself.
- **What counts:** rune builds and deck cookies whose name resolves to a cookie; usage rows whose subject is a cookie, and the cookie members of `core` and `team` rows; pets never. A rune row that names no single cookie (record 003's "all", record 004's "minor dealers in the 40") stays on its mode's runes tab and isn't a cookie. A name that matches no glossary row is listed at the bottom of `/cookies` as unresolved.
- **API:** `GET /api/cookies` (index rows: key, names, element, class, rarity, the modes it appears in) and `GET /api/cookies/:key` (the aggregate; 404 `not_found` for an unknown key), in a new `cookies` service that composes the existing services' views (`runeBuilds.list()`, the deck service's views, `usageStats`), so sources, obsolete marks and English names come out as every other page shows them. Element and class come back as their English halves. Spelled-out `.route()` lines in `apps/server/src/app.ts` so `AppType` sees them. No new table. Routes → services → repos → db (`apps/server/test/architecture.test.ts` covers the new service as it stands). The Vercel build needs no change: `apps/server/src/cli/build-vercel.ts` sends every `/api` path to the function and falls back to `index.html` for client routes.

### Stage 4 — Gear builds

**Name:** "gear preset" already means the in-game preset a lineup wears (`account_lineups.gear_preset`, `deck_daily_dungeons.gear_preset`, `GEAR_CONTEXT`). The new content type is a **gear build**: what to aim for when rolling a mode's gear.

**Curated shape: `curated/gear-builds.json`** (new, optional per record, listed in the record's `curated/manifest.json`):

```json
{
  "about": "What to roll for, per mode or boss.",
  "measured": "YYYY-MM-DD",
  "builds": [
    {
      "id": "example-build",
      "mode": "stage",
      "variant": "Boss name",
      "deck": "example-deck",
      "position": 1,
      "confidence": "medium",
      "haste_lines": { "min": 1, "max": 4, "note": "Fewer with a long-cooldown buffer" },
      "accuracy": 1000,
      "focus": null,
      "slots": {
        "top_left": ["Skill AMP", "Skill AMP"],
        "top_right": ["Skill AMP", "Skill Haste"],
        "bottom_left": ["Damage reduction", "HP"],
        "bottom_right": ["Damage reduction"]
      },
      "avoid": ["Crit damage over Skill AMP"],
      "why": "One line: what the build is for.",
      "sources": ["dc:00000"]
    }
  ]
}
```

- `id`: stored as a `slug` column beside the table's integer id, unique across records through the counter pattern (`assertUnclaimed`, `apps/server/src/importers/shared.ts`); a clash fails naming file, row and record.
- `mode`: the row's own mode, else the record's, by the existing moded-row rule (`apps/server/src/importers/collection-kit.ts`); record 002 holds arena and rumble arena.
- `variant`: English boss or situation name, `null` for the mode's default build. One current build per (mode, variant): the importer checks it over current rows only, since the registry's `unique` counts obsolete rows too.
- `deck`: a curated deck id the build is for, or `null`.
- `position`: order within the mode; the default build comes first.
- `confidence`: `high` | `medium` | `low`, shown as a badge (AGENTS.md § UI).
- `haste_lines`: integers, `0 ≤ min ≤ max ≤ 12`. Twelve is the board's item count (the in-game equipment screen holds three items in each of its board slots, `account/snapshots/2026-10-22.json` `presets`), each rolling at most one Skill Haste line. `note` English or `null`.
- `accuracy`, `focus`: target integers ≥ 0, or `null` when the mode has no gate.
- `slots`: every board slot (`GEAR_SLOTS` in `components/GearBoard.tsx`), each the English substats to aim for across that slot's items, a stat repeated once per line. Main stats are fixed per item in the game, so the build doesn't name them.
- `avoid`: English, may be empty. `why`: one non-empty line. `sources`: at least one id the record's `sources.json` lists.
- An `obsolete` block per `.claude/skills/refresh-meta/SKILL.md` § Obsolete marks a displaced build; an obsolete build never leads a page.

**Relation to `gear_recs`:** the build is the headline a player copies; the existing per-slot notes stay as its supporting detail, beneath it. The round marks a note obsolete only on evidence, never because a build now exists.

**App:**

- Table `gear_builds` in `packages/schema` with its migration and Zod schemas (JSON-column overrides for `slots`, `avoid` and `haste_lines`, as `packages/schema/src/zod.ts` does for its other JSON columns), record-owned, cited, obsolete-aware: `CITED_ENTITY` and `OBSOLETE_ENTITIES` gain `gear_build`. The API input omits the obsolete columns, as `gearRec`'s does, and refines `min ≤ max` after the omit (`packages/schema/src/inputs.ts`), so the import and the API enforce the same rules.
- The importer collection `gearBuilds` reads a file with a header (`about`, `measured`, `builds`), so it is a `collection()` like the stage files (`apps/server/src/importers/stage-collections.ts`), with `checkObsoleteDates`; it is optional, and the curated manifest key is `gearBuilds`.
- A registry entry declared once in `apps/server/src/registry.ts` (its module comment's steps), `/api/gear-builds` with its derived `?mode=` and `?current=` filters, ordered by `position`, with its `.route()` line.
- **Build card** (`components/GearBuild.tsx`, styles in a new `styles/gear.css` over tokens):
  - Header: the variant (or "Default"), the confidence badge, and the obsolete pill if any.
  - Haste: a segmented meter of twelve with the range written beside it ("2–4 of 12"), with an accessible name.
  - Accuracy and focus targets as stat chips, formatted with `Intl.NumberFormat`, tabular figures.
  - The board: each slot's substats as chips under a short slot name ("Weapons", "Accessories", "Armour", "Special"), 2×2 from tablet width up and stacked on a phone.
  - Avoid: `Pill kind="avoid"` per entry.
  - The why clamped to one line; sources last as chips.
- **Mode Gear tab:** the builds first (position order), then today's board under "Notes per slot", then the general notes.
- **`/gear` ("Gear builds"):** a `DataTable` in its scroll layout with the attributes as rows (haste, accuracy, focus, each slot, avoid, sources) and one column per mode's builds, the first column pinned. Each column header links to that mode's Gear tab. Daily Dungeons and Team power have no gear builds and no column; the Crumble Dungeon reuses another mode's preset (`app/modes/dungeon.ts`), so its column shows that mode's build with a "same as" chip. At phone width the page renders the build cards instead of the table, one copy of the content at a time.

### Stage 5 — The refresh round

A full round of `.claude/skills/refresh-meta/SKILL.md` over every research area, dated the day it starts, once Stages 1–4 are on `main`. The skill runs it end to end: saved searches, discovery, v1.6 in every area's window, decks, scores and the README sections. On top of the skill's usual work, each area agent's brief carries:

- **Gear builds:** what the best players roll per mode and per boss in v1.6, written to `curated/gear-builds.json`, every figure from a capture in the round's folder. The GingerCraven rift findings gathered on 2026-10-22 (session scratch, fetched outside the scrapers) are leads for record 003's agent to re-capture with `pnpm capture`, never copied in as evidence.
- **English text:** every display field in the area's `curated/` files is put into English, forum shorthand expanded (공증 → ATK%, 스증 → Skill AMP, 스가 → Skill Haste, 피감 → damage reduction, 치피 → crit damage), missing terms added to `glossary.json`, glossary `en` and `skill_en` included. A player's handle stays in Korean only in the fields that hold handles (the allow-list below); in prose it is romanized, with a glossary row of kind `player` holding the Korean. The skill gains a changelog row kind `translated` (the file and field, citing the glossary term), written into `.claude/skills/refresh-meta/references/refresh-section.md`, and `.claude/skills/refresh-meta/area-brief.md` carries both jobs, before the round starts. The skill's Obsolete section names gear builds beside rune builds and gear recs.
- **The English guard** lands in the round's final commit, with no list of known violations: a server test walks every record's `curated/*.json` (the files the round edits, so a snapshot that wasn't rebuilt can't hide a regression) and fails on `/\p{Script=Hangul}/u` in any string outside an explicit allow-list of file and field paths, kept in the test: the Korean name fields (`kr`, `kr_short`, `boss_kr`, `zone_kr`, `cookie_kr` and the like, and the name arrays `atk_order`, `first40`, `members`, `excluded`), player-handle fields (`player`, `author`, a ranking's `name` and `guild`), source titles and summaries, and the Korean halves of glossary `element` and `class`. Its self-test stages a fixture record and asserts that Hangul in a rune build's `why` and in a nested note is reported with its file, path and row, and that an allow-listed field isn't. The exact field names are read off the curated files when the test is written.

## Refactoring & reorganization

- **Web module tree:**
  - `app/modes/types.ts`: `SectionBase` gains `navGroup` and loses `labelKr`; `SectionTab` gains a required `group`; `SharedView` gains `setup`, and `overview` becomes `findings`.
  - `app/modes/links.ts`, `app/modes/pvp-shared.ts`, every `app/modes/*.ts`: tabs carry `group`; landing tabs point at Best setup; Findings tabs at `/$mode/findings`; copy keys renamed.
  - `app/modes/shared.ts`: `/cookies` and `/gear` sections.
  - `routes/$mode/index.tsx`: renders `BestSetupView` for the modes that land on it, the daily board and team power's landing as today. `routes/$mode/overview.tsx` → `routes/$mode/findings.tsx`, serving every mode, with a redirect left at `routes/$mode/overview.tsx` for the old daily URL.
  - New: `views/BestSetupView.tsx`, `views/CookiesView.tsx`, `views/CookieView.tsx`, `views/GearBuildsView.tsx`, `components/GearBuild.tsx`, `components/ModePageStrip.tsx`, `routes/cookies.tsx`, `routes/cookies_.$key.tsx`, `routes/gear.tsx`, `styles/gear.css`, `lib/levels.ts` (`levelText` moved out of `views/DeckCard.tsx`).
  - `components/SideNav.tsx`, `routes/__root.tsx`: grouped nav, two-list mode pages, the page strip.
  - `components/CookieName.tsx`: English line, tooltip, `showKr`.
  - `views/GearView.tsx`: builds first.
- **Server and schema:**
  - `apps/server/src/services/names.ts`: the resolver returns the entry and key; every name ref gains `key`.
  - `apps/server/src/services/cookies.ts` and its route file, registered in `apps/server/src/app.ts`.
  - `gear_builds`: table, migration, Zod, enums (`CITED_ENTITY`), `OBSOLETE_ENTITIES`, seed schema, importer collection, registry entry, its `.route()` line.
- **Ripple:** `apps/web/src/routeTree.gen.ts`; `apps/server/test/registry.test.ts` (`SEEDS`/`SeededKey` gain `gearBuilds`); the whole-record importer tests that list every table (`apps/server/test/importers/import-record.test.ts` and its siblings for records 002–004) derive the new table's count from the curated file; `README.md`'s API table, What's here and the app's sections; `data/snapshot.json` rebuilt from a fresh import of every record.
- **Deleted:** `labelKr` and its renders; the visible Korean lines listed in Stage 1; the `overview` view key and tab id.

## Tests

Every test stages its own fixture; none reads a real record's curated values beyond the whole-record import tests, which derive their expectations from the curated files (`.ai/agent-working-rules.md` § Tests). Existing tests that pin the old behaviour (Korean beside names, "Overview" landings, tab lists) are rewritten to the new contract in the same commit, never deleted or loosened.

- **Stage 1 (web):**
  - `CookieName` in both layouts: the visible text is English, the `title` holds the full English and the Korean, an unresolved name shows its stored form, `showKr` shows the Korean line.
  - `app-shell.test.tsx`'s loop over every mode's every page asserts no Hangul in the body text or in `placeholder` and `aria-label` attributes, outside `/glossary` and `/sources`. Until Stage 5 translates the curated strings, the views mark the elements that render curated text with `data-curated` and the loop skips their text; Stage 5 drops the exemption. The Glossary still shows a Korean term.
  - Typing a Korean cookie name into the runes filter keeps that cookie's row.
- **Stage 2 (web):**
  - The nav's groups and labels; each mode's Setup and Details lists in order, with the stage mode's Rift page active inside Setup; the page strip on a mode page; every tab sits in exactly one group.
  - `/conquest` lands on Best setup; `/conquest/findings` shows the findings; `/daily-dungeons` keeps its board; `/daily-dungeons/overview` redirects to `/daily-dungeons/findings`; team power's landing is unchanged.
  - Best setup with a fixture of an obsolete deck at position 1, an `alt` deck at 2 and a `meta` deck at 3: it shows the `meta` deck. Its cookies: one with a build linked to the deck, one with only an unlinked build, one with none (the muted row). The stage mode shows a block per rift deck.
- **Stage 3:**
  - Server service and route (`apps/server/test/services/cookies.test.ts`, `apps/server/test/routes/cookies.test.ts`, through `createApp(createServices(store))`): one cookie with two rune builds in one mode and a deck slot in another (its modes are counted, not its rows), named by its full Korean name in one record and its shorthand in another (one tile), the 바궁 shorthand in two records landing on two keys, a cookie without `resource_key` keyed by its slug, a pet that never becomes a tile, an unresolved name listed, 404 for an unknown key.
  - Web: the cookie page shows a block per mode with the build, the decks and levels, and "Not used in"; a cookie page doesn't show the grid; a rune card and a deck's cookie link to the cookie's page by the key the API sent.
- **Stage 4:**
  - Shared input schema (`packages/schema/test/inputs.test.ts`): rejects `min > max`, haste 13, −1 or 2.5, a missing slot, a negative or fractional target, an empty `why`.
  - Seed schema and importer (`apps/server/test/importers/seed-map.test.ts`, a fixture staged from `apps/server/test/importers/fixtures/006-daily-dungeons/` as `import-daily-dungeon.test.ts` stages it): a source id the record doesn't list and an id another record loaded fail with file and row named; a mode the record doesn't own fails; an obsolete build imports with its block; `GET /api/gear-builds?mode=` returns the fixture's builds in `position` order, inserted out of order.
  - Enum and table round trips (`packages/schema/test/enums.test.ts`, `roundtrip.test.ts`).
  - Web: the build card shows "1–4 of 12" for a fixture with different `min` and `max`, the targets, the slot chips, the avoid pills and the confidence badge; the Gear tab's headings run builds, then "Notes per slot", then the general notes; `/gear` has a column per build with header links, and an obsolete build gets none.
- **Stage 5:** the English guard and its self-test, as Stage 5 describes.
- **Browser:** every touched screen in agent-browser, light and dark, at phone width, including the `/gear` cards on a phone.

## Out of scope

- Writing to the user's game (equipping gear, changing lineups).
- The account page's layout beyond the shared components it inherits.
- Gear builds for Daily Dungeons and Team power, which have no gear tab.

## Open questions

Unknowns pass: skipped by the person ("what do i know ffs").

- None blocking. The round decides each mode's builds and their confidence from its captures.
