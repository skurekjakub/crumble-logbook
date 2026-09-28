# Obsolete Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A recommendation (deck, rune build, gear rec, counter edge) can be marked obsolete in a record's curated files with a dated, cited reason; the importer validates and stores it, the API returns it with a `?current=` filter, and every list page shows current rows as today with the obsolete ones in a collapsed, dated section at the end.

**Architecture:** Nullable lifecycle columns on the recommendation tables (plus `superseded_by` on `decks`), and a new cited entity, `obsolescence`, whose citation entity id is `<entity>:<row id>`. The importer reads an `obsolete` block per curated row and writes the columns and the reason's citations; the registry derives a `?current=` list filter for every table with the columns, as it derives `?mode=`; views carry `obsoleteSources`. The web splits each list into current and obsolete rows with pure helpers and renders the obsolete ones in a shared `<details>` section.

**Tech Stack:** Drizzle ORM 1.0 beta over `node:sqlite`, drizzle-kit migrations, Zod 4, Hono, React 19 with TanStack Router and Query, Vitest with Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-28-meta-refresh-design.md`, section 2 (the obsolete lifecycle), section 3 (`searches.json`) and section 6 (the app work). Section 4's merge step needs the snapshot scope check in Task 13.

**Built against:** `main` at `7a2704a` (the Crumble Dungeon mode has landed: `c518151`, `3ab7273`, `7a2704a`). Files this plan edits that the dungeon work also touched: `packages/schema/src/enums.ts` (`CITED_ENTITY`), `packages/schema/src/zod.ts`, `packages/schema/src/inputs.ts`, `apps/server/src/registry.ts`, `apps/server/test/registry.test.ts`, `apps/web/src/views/DungeonRunsView.tsx`, `apps/web/test/dungeon-views.test.tsx`, `README.md`, `data/snapshot.json`. If `main` has moved past `7a2704a` when you start, re-read those files before editing them; the edits below are written against their content at `7a2704a`.

## Global Constraints

- Layering is routes → services → repos → db, enforced by `apps/server/test/architecture.test.ts`. `registry.ts` stays declarative (it imports only `@crumble/schema`, zod and drizzle types). Importers import only what `importerMayImport` allows: shared names go in `@crumble/schema`, never in a service. Web `components/` never import `src/api`; web `lib/` imports nothing from `api`, `app`, `views` or `routes`.
- JSDoc, TSDoc-style, on every function, method, class, interface method and `const` arrow (test files' `it()` bodies excepted; helpers in test files still need it): a summary, `@param name - …` for each parameter, `@returns …` when it returns a value, `@throws …` for how it fails. Types stay in TypeScript. ESLint enforces it.
- Files split along responsibility, not line count.
- `rtk proxy pnpm verify` (typecheck, lint, prettier check, every test) passes before every commit. The `prefer-verify-script` hook blocks chained gates and unscoped test runs: run a single test file as `pnpm vitest run <path>`.
- Rank by damage or score, never by 배 (damage ÷ power) or score ÷ power. A normaliser column may show; it never orders a list.
- Evidence under `research/*/evidence/` is never edited after capture, and every evidence file gets a ledger line in the same commit. This plan writes no evidence.
- Captured media stays local (`.gitignore` excludes it under `research/`).
- No enumerating and no gratuitous counting in docs, comments, test names or commit messages: point at the file that holds a list (`OBSOLETE_ENTITIES`, the curated schema) instead of typing its roster into a sentence.
- Windows: run shell steps in the Bash tool (Git Bash), one simple command per step, no `&&` chains. Set an environment variable inline: `CRUMBLE_DB=<scratchpad>/gate.db pnpm import:record …`, where `<scratchpad>` is your session's scratchpad directory as an absolute path with forward slashes.
- Commits: write the message (a subject line, then a body giving the problem, the justification and what was discarded) with the Write tool to `.git/crumble-commit-msg.txt`, `git add` any new files, then run `git commit -F .git/crumble-commit-msg.txt -- <paths>`. The `require-commit-format` hook blocks `-m`. End the message with the `Co-Authored-By` line your session's attribution reminder gives.
- The snapshot gate: build `data/snapshot.json` only from a fresh import into a scratch database (`CRUMBLE_DB` pointing at a new file in your scratchpad, never `data/crumble.db`), importing the records the README's "The database" block imports, in number order, one command each, then `pnpm db:export`. At `7a2704a` those are `001-guild-conquest-meta` to `004-golden-drop-meta`; `005-team-power-growth`'s `import.json` names the mode `team_power`, which `GAME_MODE` doesn't have, so it doesn't import.
- Curated files keep their snake_case field names. The `obsolete` block's successor field is `superseded_by`, not the spec's `supersededBy`: every other curated field (`name_en`, `level_rule`, `beaten_by`, `also_topics`) is snake_case, and the table column and API field stay `supersededBy`.
- Only a record's import marks a row obsolete. The API's `POST` and `PATCH` inputs leave the lifecycle columns out, so a reason is never written without its citations.
- Reviews run on Opus. Build agents run one at a time on `main`; commit on `main` and push to `origin` once the final review passes.

## Review Focus

- A link to an obsolete deck's card (`/arena/teams#deck-<id>`, which the dungeon runs, lineups and stage zones already make) lands inside the collapsed Obsolete section: the section must open, or the link goes nowhere. Pinned in Task 7.
- A snapshot exported before this change has no lifecycle keys on its rows; `pnpm db:restore` and the startup reseed must still load it, every row current. Pinned in Task 2.
- A record re-imported with `--replace` after a round cleared an `obsolete` block must come back current with no stale reason citations, since `clearRecord` only removed citations of the table's own entity. Pinned in Task 3.
- A source cited only for an obsolete reason must still count as cited: `DELETE /api/sources/:id` answers 409, and `?record=` lists it under the record whose row cites it. Pinned in Task 5.
- A current counter edge that names an obsolete deck: the import refuses it, and one written through the API drops out of the matrix into the Obsolete section under the deck's notice. Pinned in Tasks 3 and 9.

---

### Task 1: Baseline: the snapshot reproduces before any change

No code. The spec's gate is that a fresh import reproduces `data/snapshot.json` byte for byte before any record uses `obsolete`; this task proves it holds on the starting commit, so a later difference is this plan's doing.

**Files:** none.

- [ ] **Step 1: Check the tree is clean and on main**

Run: `git status --short`
Expected: no output.

Run: `git log --oneline -1`
Expected: the commit you are building on (at writing, `7a2704a`).

- [ ] **Step 2: Import every record into a scratch database, in number order**

Run each as its own command:

```
CRUMBLE_DB=<scratchpad>/gate-before.db pnpm import:record 001-guild-conquest-meta
CRUMBLE_DB=<scratchpad>/gate-before.db pnpm import:record 002-pvp-meta
CRUMBLE_DB=<scratchpad>/gate-before.db pnpm import:record 003-stage-pushing-meta
CRUMBLE_DB=<scratchpad>/gate-before.db pnpm import:record 004-golden-drop-meta
```

Expected: each prints its table counts. If the README's database block lists more records by now, import them too, in number order.

- [ ] **Step 3: Export and compare**

Run: `CRUMBLE_DB=<scratchpad>/gate-before.db pnpm db:export`

Run: `git diff --exit-code --stat data/snapshot.json`
Expected: no output, exit code 0. If it differs, stop: run `git checkout -- data/snapshot.json` and report the difference to the user; the gate fails before this plan changes anything.

- [ ] **Step 4: Check the gates**

Run: `rtk proxy pnpm verify`
Expected: passes.

No commit.

---

### Task 2: Schema: the lifecycle columns, the obsolescence entity, the migration

**Files:**
- Create: `packages/schema/src/obsolete.ts`
- Modify: `packages/schema/src/index.ts`, `packages/schema/src/enums.ts` (`CITED_ENTITY`), `packages/schema/src/tables/columns.ts`, `packages/schema/src/tables/decks.ts`, `packages/schema/src/tables/runes.ts`, `packages/schema/src/tables/gear.ts`, `packages/schema/src/tables/counters.ts`, `packages/schema/src/zod.ts` (`deckInsert`, `runeBuildInsert`, `gearRecInsert`, `counterInsert`), `packages/schema/src/inputs.ts`
- Create: `packages/schema/migrations/<timestamp>_obsolete_lifecycle/` (generated)
- Test: `packages/schema/test/obsolete.test.ts` (create), `apps/server/test/services/export.test.ts`, `apps/server/test/registry.test.ts`
- Modify: `apps/web/test/helpers.tsx` and every web fixture typecheck names
- Modify: `data/snapshot.json` (regenerated)

**Interfaces:**
- Produces, from `@crumble/schema`:
  - `OBSOLETE_ENTITIES: readonly ["deck", "rune_build", "gear_rec", "counter"]` and `type ObsoleteEntity`
  - `OBSOLESCENCE: "obsolescence"`, a new `CITED_ENTITY` member
  - `isObsoleteEntity(entity: CitedEntity): entity is ObsoleteEntity`
  - `obsolescenceKey(entity: ObsoleteEntity, id: string | number): string` returning `<entity>:<id>`
  - `parseObsolescenceKey(key: string): { entity: ObsoleteEntity; id: string } | undefined`
  - `obsoleteColumns()` in `tables/columns.ts`
  - Columns `obsoleteSince: string | null` and `obsoleteReason: string | null` on `decks`, `runeBuilds`, `gearRecs`, `counters`; `supersededBy: string | null` on `decks`
- Produces, in `apps/web/test/helpers.tsx`: `CURRENT` and `CURRENT_DECK`, the lifecycle fields of a current row, spread into fixtures.

- [ ] **Step 1: Write the failing schema test**

Create `packages/schema/test/obsolete.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CITED_ENTITY } from "../src/enums";
import { counterInput, deckInput, gearRecInput, runeBuildInput } from "../src/inputs";
import {
  OBSOLESCENCE,
  OBSOLETE_ENTITIES,
  isObsoleteEntity,
  obsolescenceKey,
  parseObsolescenceKey,
} from "../src/obsolete";
import { counters, decks, gearRecs, runeBuilds } from "../src/tables";
import { deckInsert, gearRecInsert } from "../src/zod";
import { createTestDb } from "./helpers";

describe("the obsolete lifecycle", () => {
  it("names only cited entities, and cites reasons under an entity of its own", () => {
    for (const entity of OBSOLETE_ENTITIES) expect(CITED_ENTITY).toContain(entity);
    expect(CITED_ENTITY).toContain(OBSOLESCENCE);
    expect(isObsoleteEntity("deck")).toBe(true);
    expect(isObsoleteEntity("score")).toBe(false);
    expect(isObsoleteEntity(OBSOLESCENCE)).toBe(false);
  });

  it("keys a reason by its row's entity and id, and reads the key back", () => {
    expect(obsolescenceKey("deck", "arena-five-ranged")).toBe("deck:arena-five-ranged");
    expect(obsolescenceKey("counter", 12)).toBe("counter:12");
    expect(parseObsolescenceKey("counter:12")).toEqual({ entity: "counter", id: "12" });
    expect(parseObsolescenceKey("deck:a:b")).toEqual({ entity: "deck", id: "a:b" });
    expect(parseObsolescenceKey("score:1")).toBeUndefined();
    expect(parseObsolescenceKey("deck:")).toBeUndefined();
    expect(parseObsolescenceKey("deck")).toBeUndefined();
  });

  it("leaves every lifecycle column null on a row that doesn't set it", () => {
    const db = createTestDb();
    const deck = db
      .insert(decks)
      .values({ id: "d", position: 0, nameEn: "d", status: "meta" })
      .returning()
      .get();
    expect(deck).toMatchObject({ obsoleteSince: null, obsoleteReason: null, supersededBy: null });
    db.insert(decks).values({ id: "e", position: 1, nameEn: "e", status: "meta" }).run();
    const rune = db
      .insert(runeBuilds)
      .values({ cookieKr: "c", lines: "l", why: "w" })
      .returning()
      .get();
    const gear = db
      .insert(gearRecs)
      .values({ slot: "top_left", substats: "s", context: "raid", why: "w" })
      .returning()
      .get();
    const edge = db
      .insert(counters)
      .values({ slug: "d-vs-e", teamDeckId: "d", beatenByDeckId: "e", why: "w", confidence: "low" })
      .returning()
      .get();
    for (const row of [rune, gear, edge]) {
      expect(row).toMatchObject({ obsoleteSince: null, obsoleteReason: null });
    }
  });

  it("stores an obsolete deck's date, reason and successor", () => {
    const db = createTestDb();
    db.insert(decks).values({ id: "rye", position: 0, nameEn: "Rye", status: "meta" }).run();
    const ranged = db
      .insert(decks)
      .values({
        id: "ranged",
        position: 1,
        nameEn: "Ranged",
        status: "legacy",
        obsoleteSince: "2026-10-12",
        obsoleteReason: "Patched out.",
        supersededBy: "rye",
      })
      .returning()
      .get();
    expect(ranged).toMatchObject({
      status: "legacy",
      obsoleteSince: "2026-10-12",
      obsoleteReason: "Patched out.",
      supersededBy: "rye",
    });
  });

  it("validates the lifecycle columns on insert: an ISO date, a deck slug", () => {
    const base = { id: "d", position: 0, nameEn: "d", status: "meta" };
    expect(deckInsert.safeParse({ ...base, obsoleteSince: "2026-10-12", supersededBy: "rye" }).success).toBe(true);
    expect(deckInsert.safeParse({ ...base, obsoleteSince: "12/10/2026" }).success).toBe(false);
    expect(deckInsert.safeParse({ ...base, supersededBy: "Not A Slug" }).success).toBe(false);
    const gear = { slot: "top_left", substats: "s", context: "raid", why: "w" };
    expect(gearRecInsert.safeParse({ ...gear, obsoleteSince: "soon" }).success).toBe(false);
  });

  it("keeps the lifecycle columns out of every API input", () => {
    const lifecycle = { obsoleteSince: "2026-10-12", obsoleteReason: "r" };
    const gear = gearRecInput.parse({
      slot: "top_left",
      substats: "s",
      context: "raid",
      why: "w",
      sources: ["dc:1"],
      ...lifecycle,
    });
    expect(gear).not.toHaveProperty("obsoleteSince");
    const rune = runeBuildInput.parse({ cookieKr: "c", lines: "l", why: "w", sources: ["dc:1"], ...lifecycle });
    expect(rune).not.toHaveProperty("obsoleteSince");
    const edge = counterInput.parse({
      slug: "a-vs-b",
      teamDeckId: "a",
      beatenByDeckId: "b",
      why: "w",
      confidence: "low",
      sources: ["dc:1"],
      ...lifecycle,
    });
    expect(edge).not.toHaveProperty("obsoleteReason");
    const deck = deckInput.parse({
      id: "d",
      nameEn: "d",
      status: "meta",
      cookies: [{ cookieKr: "c", level: "1", why: "w" }],
      sources: ["dc:1"],
      ...lifecycle,
      supersededBy: "rye",
    });
    expect(deck).not.toHaveProperty("obsoleteSince");
    expect(deck).not.toHaveProperty("supersededBy");
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm vitest run packages/schema/test/obsolete.test.ts`
Expected: FAIL, `Cannot find module '../src/obsolete'`.

- [ ] **Step 3: Add the obsolescence entity**

In `packages/schema/src/enums.ts`, append `"obsolescence"` as the last member of `CITED_ENTITY` and extend its JSDoc:

```ts
/**
 * Entities that carry citations; `citations.entity` takes one of these.
 * `obsolescence` cites why a recommendation became obsolete: its entity id
 * is the row's `obsolescenceKey` (see `obsolete.ts`), not a row of its own.
 */
export const CITED_ENTITY = [
  // … every existing member, unchanged …
  "dungeon_exclusion",
  "obsolescence",
] as const;
```

Create `packages/schema/src/obsolete.ts`:

```ts
/**
 * The obsolete lifecycle's shared names: which cited entities' rows can be
 * marked obsolete, and how the citations of an obsolete row's reason are
 * keyed. The server's importer and services both read these.
 *
 * @module
 */
import type { CitedEntity } from "./enums";

/** The cited entities whose rows carry the obsolete lifecycle: the recommendation tables. */
export const OBSOLETE_ENTITIES = [
  "deck",
  "rune_build",
  "gear_rec",
  "counter",
] as const satisfies readonly CitedEntity[];
/** A cited entity whose rows carry the obsolete lifecycle. */
export type ObsoleteEntity = (typeof OBSOLETE_ENTITIES)[number];

/** The citation entity an obsolete row's reason is cited under. */
export const OBSOLESCENCE: Extract<CitedEntity, "obsolescence"> = "obsolescence";

/**
 * Reports whether rows of `entity` carry the obsolete lifecycle.
 *
 * @param entity - a cited entity
 * @returns `true` for an entity {@link OBSOLETE_ENTITIES} lists
 */
export function isObsoleteEntity(entity: CitedEntity): entity is ObsoleteEntity {
  return (OBSOLETE_ENTITIES as readonly CitedEntity[]).includes(entity);
}

/**
 * The citation entity id of an obsolete row's reason.
 *
 * @param entity - the row's cited entity
 * @param id - the row's id: a deck's slug, another row's integer id
 * @returns `<entity>:<id>`, e.g. `deck:arena-five-ranged` or `counter:12`
 */
export function obsolescenceKey(entity: ObsoleteEntity, id: string | number): string {
  return `${entity}:${id}`;
}

/**
 * Reads an obsolescence citation's entity id back into the row it names.
 *
 * @param key - a citation entity id {@link obsolescenceKey} wrote
 * @returns the row's entity and id (as text), or `undefined` when `key`
 *   names no entity {@link OBSOLETE_ENTITIES} lists, or no id
 */
export function parseObsolescenceKey(
  key: string,
): { entity: ObsoleteEntity; id: string } | undefined {
  const at = key.indexOf(":");
  if (at < 0) return undefined;
  const entity = key.slice(0, at);
  const id = key.slice(at + 1);
  if (id === "" || !(OBSOLETE_ENTITIES as readonly string[]).includes(entity)) return undefined;
  return { entity: entity as ObsoleteEntity, id };
}
```

In `packages/schema/src/index.ts`, add `export * from "./obsolete";` after `export * from "./enums";`.

- [ ] **Step 4: Add the columns**

In `packages/schema/src/tables/columns.ts`, add:

```ts
/**
 * Builds the obsolete lifecycle's columns: since when a recommendation is
 * no longer current, and why. Both are `null` while it is current; a
 * record's import sets both together, and cites the reason under
 * `obsolescence`.
 *
 * @returns `obsoleteSince` (an ISO date) and `obsoleteReason` (text), both nullable
 */
export function obsoleteColumns() {
  return {
    obsoleteSince: text("obsolete_since"),
    obsoleteReason: text("obsolete_reason"),
  };
}
```

In `packages/schema/src/tables/decks.ts`, import `obsoleteColumns` from `./columns`, add the columns after `recordSlug`, and extend the table's JSDoc:

```ts
/**
 * A deck: a named cookie/pet lineup for one game mode, with a meta tier and
 * formation notes. An obsolete deck keeps its `status`; `supersededBy` names
 * the deck that displaced it, when one did. It has no foreign key: the
 * importer checks it names a curated deck of the same mode, and the deck
 * service refuses to delete a deck another names.
 */
export const decks = sqliteTable("decks", {
  // … every existing column, unchanged, ending with …
  recordSlug: recordSlugColumn(),
  ...obsoleteColumns(),
  supersededBy: text("superseded_by"),
});
```

In `tables/runes.ts` (`runeBuilds`), `tables/gear.ts` (`gearRecs`) and `tables/counters.ts` (`counters`), import `obsoleteColumns` and add `...obsoleteColumns(),` after `recordSlug: recordSlugColumn(),`. Keep the new columns last, so the snapshot's existing keys keep their order.

- [ ] **Step 5: Validate them, and keep them out of the API inputs**

In `packages/schema/src/zod.ts`:

```ts
export const deckInsert = createInsertSchema(t.decks, {
  id: () => deckSlug,
  nameEn: (s) => s.min(1),
  atkOrder: () => nameList.nullish(),
  obsoleteSince: () => isoDate.nullish(),
  supersededBy: () => deckSlug.nullish(),
});
```

```ts
/** Insert schema for `rune_builds`. `obsoleteSince`, when present, must be `YYYY-MM-DD`. */
export const runeBuildInsert = createInsertSchema(t.runeBuilds, {
  obsoleteSince: () => isoDate.nullish(),
});
```

```ts
/** Insert schema for `gear_recs`. `obsoleteSince`, when present, must be `YYYY-MM-DD`. */
export const gearRecInsert = createInsertSchema(t.gearRecs, {
  obsoleteSince: () => isoDate.nullish(),
});
```

Add `obsoleteSince: () => isoDate.nullish(),` to `counterInsert`'s refinements, and extend each JSDoc to name the date rule. Update `deckInsert`'s JSDoc: "`obsoleteSince`, when present, must be `YYYY-MM-DD`; `supersededBy`, when present, a lowercase slug."

In `packages/schema/src/inputs.ts`, add after `sourceIds`:

```ts
/**
 * The obsolete lifecycle's columns, which only a record's import writes:
 * the API's inputs leave them out, so a reason is never stored without the
 * citations the import gives it.
 */
const LIFECYCLE = { obsoleteSince: true, obsoleteReason: true } as const;
```

Then use it:

```ts
const gearRec = citedInputs(gearRecInsert.omit(LIFECYCLE));
```

```ts
const counter = citedInputs(counterInsert.omit(LIFECYCLE));
```

```ts
const deckFields = deckInsert
  .omit({ id: true, position: true, ...LIFECYCLE, supersededBy: true })
  .extend({
    position: z.number().int().min(0).optional(),
    cookies: z.array(deckCookieInput).min(1),
    pets: nameList,
    notes: z.array(deckNoteInput),
    sources: sourceIds,
  });
```

```ts
export const runeBuildInput = runeBuildInsert.omit({ id: true, ...LIFECYCLE }).extend({
  decks: z.array(deckSlug).default([]),
  sources: sourceIds,
});
```

```ts
export const runeBuildPatch = runeBuildInsert
  .omit({ id: true, ...LIFECYCLE })
  .extend({ decks: z.array(deckSlug), sources: sourceIds })
  .partial();
```

Say so in each input's JSDoc: "The obsolete lifecycle isn't accepted: a record's import sets it."

- [ ] **Step 6: Generate the migration**

Run: `pnpm --filter @crumble/schema db:generate --name obsolete_lifecycle`
Expected: a new folder `packages/schema/migrations/<timestamp>_obsolete_lifecycle/` with `migration.sql` and `snapshot.json`.

Read `migration.sql`. Expected: only `ALTER TABLE … ADD` statements, one per new column, in any order:

```sql
ALTER TABLE `counters` ADD `obsolete_since` text;--> statement-breakpoint
ALTER TABLE `counters` ADD `obsolete_reason` text;--> statement-breakpoint
ALTER TABLE `decks` ADD `obsolete_since` text;--> statement-breakpoint
ALTER TABLE `decks` ADD `obsolete_reason` text;--> statement-breakpoint
ALTER TABLE `decks` ADD `superseded_by` text;--> statement-breakpoint
ALTER TABLE `gear_recs` ADD `obsolete_since` text;--> statement-breakpoint
ALTER TABLE `gear_recs` ADD `obsolete_reason` text;--> statement-breakpoint
ALTER TABLE `rune_builds` ADD `obsolete_since` text;--> statement-breakpoint
ALTER TABLE `rune_builds` ADD `obsolete_reason` text;
```

If it rebuilds a table (`__new_…`) or mentions `citations`, stop: a column was declared with a constraint, or the enum leaked into the DDL. Fix the declaration and generate again after deleting the folder.

- [ ] **Step 7: Run the schema test**

Run: `pnpm vitest run packages/schema/test/obsolete.test.ts`
Expected: PASS.

- [ ] **Step 8: A snapshot from before the change still restores**

In `apps/server/test/services/export.test.ts`, add (importing `addSource` from `../helpers` and `createServices` from `../../src/services` if the file doesn't yet):

```ts
it("restores a snapshot that predates the obsolete lifecycle, every row current", () => {
  const source = testStore();
  addSource(source, "dc:1");
  createServices(source).decks.create({
    id: "rye",
    nameEn: "Rye",
    status: "meta",
    cookies: [{ cookieKr: "호밀", level: "1", levelRule: null, stars: null, why: "w" }],
    pets: [],
    notes: [],
    sources: ["dc:1"],
  });
  const snapshot = exportSnapshot(source);
  for (const row of snapshot.tables.decks as Array<Record<string, unknown>>) {
    delete row.obsoleteSince;
    delete row.obsoleteReason;
    delete row.supersededBy;
  }
  const target = testStore();
  restoreSnapshot(target, snapshot);
  expect(target.repos.decks.get("rye")).toMatchObject({
    obsoleteSince: null,
    obsoleteReason: null,
    supersededBy: null,
  });
});
```

Run: `pnpm vitest run apps/server/test/services/export.test.ts`
Expected: PASS.

- [ ] **Step 9: Keep the registry's entity check true**

`apps/server/test/registry.test.ts`'s "registers every cited entity exactly once" compares the registry's entities with `CITED_ENTITY`, which now holds `obsolescence`, the entity of no table. Replace that test:

```ts
it("registers every cited entity exactly once, but obsolescence, which cites other tables' rows", () => {
  const entities = TABLE_KEYS.flatMap((key) => specOf(key).entity ?? []);
  expect([...entities].sort()).toEqual(CITED_ENTITY.filter((e) => e !== OBSOLESCENCE).sort());
});
```

Import `OBSOLESCENCE` from `@crumble/schema`.

Run: `pnpm vitest run apps/server/test/registry.test.ts`
Expected: PASS.

- [ ] **Step 10: Give the web fixtures the new fields**

The server's views spread their rows, so the web's `Deck`, `RuneBuild`, `GearRec` and `Counter` types now carry the lifecycle fields and fixtures typed as them no longer compile. In `apps/web/test/helpers.tsx`, add:

```ts
/** The lifecycle fields of a current recommendation row, spread into fixtures. */
export const CURRENT = { obsoleteSince: null, obsoleteReason: null };

/** The lifecycle fields of a current deck, spread into fixtures. */
export const CURRENT_DECK = { ...CURRENT, supersededBy: null };
```

Run: `pnpm typecheck`
Expected: FAIL, naming the fixtures in `apps/web/test/` typed as those rows. In each, spread `...CURRENT_DECK` at the top of a deck literal or deck builder's returned object, and `...CURRENT` at the top of a rune build, gear rec or counter literal or builder, importing them from `./helpers`. For example, `pvp-views.test.tsx`'s `deck()` builder:

```ts
function deck(id: string, position: number, nameEn: string, over: Partial<Deck> = {}): Deck {
  return {
    ...CURRENT_DECK,
    id,
    position,
    // … the existing fields, unchanged …
    ...over,
  };
}
```

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 11: Regenerate the snapshot and check it gained only null lifecycle keys**

Import into a new scratch database, one command each:

```
CRUMBLE_DB=<scratchpad>/gate-columns.db pnpm import:record 001-guild-conquest-meta
CRUMBLE_DB=<scratchpad>/gate-columns.db pnpm import:record 002-pvp-meta
CRUMBLE_DB=<scratchpad>/gate-columns.db pnpm import:record 003-stage-pushing-meta
CRUMBLE_DB=<scratchpad>/gate-columns.db pnpm import:record 004-golden-drop-meta
```

Run: `CRUMBLE_DB=<scratchpad>/gate-columns.db pnpm db:export`

Write this check with the Write tool to `<scratchpad>/lifecycle-keys.ts`:

```ts
// Checks that data/snapshot.json differs from HEAD's only by the lifecycle keys, all null.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

type Snap = { tables: Record<string, Array<Record<string, unknown>>> };

const LIFECYCLE: Record<string, string[]> = {
  decks: ["obsoleteSince", "obsoleteReason", "supersededBy"],
  runeBuilds: ["obsoleteSince", "obsoleteReason"],
  gearRecs: ["obsoleteSince", "obsoleteReason"],
  counters: ["obsoleteSince", "obsoleteReason"],
};

const before = JSON.parse(
  execFileSync("git", ["show", "HEAD:data/snapshot.json"], {
    encoding: "utf-8",
    maxBuffer: 1 << 30,
  }),
) as Snap;
const after = JSON.parse(readFileSync("data/snapshot.json", "utf-8")) as Snap;
for (const [table, keys] of Object.entries(LIFECYCLE)) {
  for (const row of after.tables[table] ?? []) {
    for (const key of keys) {
      if (!(key in row)) throw new Error(`${table} row ${String(row.id)} has no ${key}`);
      if (row[key] !== null) throw new Error(`${table} row ${String(row.id)}: ${key} isn't null`);
      delete row[key];
    }
  }
}
if (JSON.stringify(before) !== JSON.stringify(after)) {
  throw new Error("the snapshots differ beyond the lifecycle keys");
}
console.log("only the null lifecycle keys were added");
```

Run: `pnpm exec tsx <scratchpad>/lifecycle-keys.ts`
Expected: `only the null lifecycle keys were added`.

- [ ] **Step 12: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Run: `git add packages/schema/src/obsolete.ts packages/schema/test/obsolete.test.ts packages/schema/migrations`

Message for `.git/crumble-commit-msg.txt`:

```
feat(schema): the obsolete lifecycle's columns and citation entity

A refresh round displaces recommendations without deleting them, so the
recommendation tables need to say since when a row is no longer current
and why. obsolete_since and obsolete_reason are nullable columns on each
table OBSOLETE_ENTITIES names, and decks also get superseded_by. The
reason is cited like any claim, under a new cited entity, obsolescence,
keyed <entity>:<row id> so one citations table keeps serving every row.

superseded_by has no foreign key: the snapshot restores decks in id
order, so a deck superseded by a later-sorting deck would fail the
constraint. The API inputs omit the columns; only a record's import sets
them, with their citations.

The snapshot is regenerated from a fresh import; it differs from the
last one only by the new keys, all null.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- packages/schema apps/server/test/registry.test.ts apps/server/test/services/export.test.ts apps/web/test data/snapshot.json`

---

### Task 3: Importer: the curated `obsolete` block

**Files:**
- Modify: `apps/server/src/importers/seed/schema.ts` (`seedObsolete`, `seedDeckObsolete`; `obsolete` on `seedDeck`, `seedRune`, `seedGear`, `seedCounter`)
- Modify: `apps/server/src/importers/steps.ts` (`ObsoleteValues`, `lifecycleColumns`, `citeObsolescence`, `CitedValues.obsolete`, `insertCited`)
- Modify: `apps/server/src/importers/collection-kit.ts` (`CheckContext.obsoleteDecks`, `citedRows`)
- Modify: `apps/server/src/importers/read-record.ts` (`checkCollections`)
- Modify: `apps/server/src/importers/collections.ts` (`decks`, `runes`, `counters`)
- Modify: `apps/server/src/importers/write-record.ts` (`clearRecord`)
- Test: `apps/server/test/importers/import-obsolete.test.ts` (create)

**Interfaces:**
- Consumes: `OBSOLESCENCE`, `isObsoleteEntity`, `obsolescenceKey`, `ObsoleteEntity` from Task 2.
- Produces:
  - Curated shape on any row of `decks.json`, `runes.json`, `gear.json`, `counters.json`: `"obsolete": { "since": "YYYY-MM-DD", "reason": "…", "sources": ["dc:…"] }`, plus `"superseded_by": "<deck id>"` on a deck only.
  - `ObsoleteValues { since: string; reason: string; sources: readonly string[] }` in `steps.ts`
  - `lifecycleColumns(obsolete: ObsoleteValues | undefined): { obsoleteSince: string | null; obsoleteReason: string | null }`
  - `citeObsolescence(repos: Repos, entity: ObsoleteEntity, id: string | number, obsolete: ObsoleteValues | undefined): void`
  - `CheckContext.obsoleteDecks: ReadonlySet<string>`
  - Import rules: the date is `YYYY-MM-DD`; the reason's sources are curated sources; `superseded_by` names a curated deck of the same mode, not the deck itself; a counter edge that names an obsolete deck is obsolete itself.

- [ ] **Step 1: Write the failing import tests**

Create `apps/server/test/importers/import-obsolete.test.ts`:

```ts
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { repoRoot } from "../../src/config";
import { importRecord } from "../../src/importers/import-record";
import type { Store } from "../../src/repos";
import { testStore } from "../helpers";

const pvpDir = join(repoRoot, "research", "002-pvp-meta");
/** Importing a copy of record 002 reads every curated file; the copy has no ledger to hash. */
const IMPORT = { timeout: 60_000 };

type Row = Record<string, unknown>;

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/**
 * Builds a throwaway copy of record 002's curated dataset, under its own
 * slug, with no evidence, capture rules or ledger, after applying `edit`
 * to its curated array files.
 *
 * @param slug - the copy's record slug
 * @param edit - changes each parsed curated file's rows in place, by file name
 * @returns the copy's directory
 */
function pvpCopy(slug: string, edit: Record<string, (rows: Row[]) => void> = {}): string {
  tmp ??= mkdtempSync(join(tmpdir(), "crumble-obsolete-"));
  const dir = join(tmp, slug);
  cpSync(join(pvpDir, "curated"), join(dir, "curated"), { recursive: true });
  mkdirSync(join(dir, "extract"), { recursive: true });
  for (const [name, change] of Object.entries(edit)) {
    const path = join(dir, "curated", name);
    const rows = JSON.parse(readFileSync(path, "utf-8")) as Row[];
    change(rows);
    writeFileSync(path, JSON.stringify(rows));
  }
  const base = JSON.parse(readFileSync(join(pvpDir, "import.json"), "utf-8")) as {
    record: object;
  };
  writeFileSync(
    join(dir, "import.json"),
    JSON.stringify({
      ...base,
      record: { ...base.record, slug },
      extractions: "extract",
      captures: [],
      ledger: undefined,
    }),
  );
  return dir;
}

/**
 * Finds a curated row by its id.
 *
 * @param rows - the file's rows
 * @param id - the row's `id`
 * @returns the row
 * @throws `Error` when no row has that id
 */
function byId(rows: Row[], id: string): Row {
  const row = rows.find((r) => r.id === id);
  if (!row) throw new Error(`no row ${id}`);
  return row;
}

/**
 * Lists the sources cited for why a row became obsolete.
 *
 * @param store - the store to read
 * @param key - the row's obsolescence key, e.g. `deck:arena-five-ranged`
 * @returns the source ids, sorted
 */
function reasonSources(store: Store, key: string): string[] {
  return store.repos.citations.sourcesFor("obsolescence", [key]).get(key) ?? [];
}

const RETIRED = {
  since: "2026-10-12",
  reason: "A patch cut ranged damage, and no top defense ran the deck in the round.",
  sources: ["dc:71947"],
};

/** Marks the five-ranged deck obsolete, superseded by the Rye one-carry deck, with every edge that names it. */
const retireFiveRanged: Record<string, (rows: Row[]) => void> = {
  "decks.json": (rows) => {
    byId(rows, "arena-five-ranged").obsolete = { ...RETIRED, superseded_by: "arena-rye-onecarry" };
  },
  "counters.json": (rows) => {
    for (const edge of rows) {
      if (edge.team === "arena-five-ranged" || edge.beaten_by === "arena-five-ranged") {
        edge.obsolete = RETIRED;
      }
    }
  },
};

describe("importing a record's obsolete recommendations", IMPORT, () => {
  it("files an obsolete deck with its date, reason, successor and cited reason, keeping its status", () => {
    const store = testStore();
    importRecord(store, pvpCopy("910-pvp-copy", retireFiveRanged));
    expect(store.repos.decks.get("arena-five-ranged")).toMatchObject({
      status: "legacy",
      obsoleteSince: "2026-10-12",
      obsoleteReason: RETIRED.reason,
      supersededBy: "arena-rye-onecarry",
    });
    expect(reasonSources(store, "deck:arena-five-ranged")).toEqual(["dc:71947"]);
    expect(store.repos.decks.get("arena-rye-onecarry")).toMatchObject({
      obsoleteSince: null,
      obsoleteReason: null,
      supersededBy: null,
    });
  });

  it("files an obsolete rune build, gear rec and counter edge with their cited reasons", () => {
    const store = testStore();
    importRecord(
      store,
      pvpCopy("911-pvp-copy", {
        ...retireFiveRanged,
        "runes.json": (rows) => {
          rows[0]!.obsolete = RETIRED;
        },
        "gear.json": (rows) => {
          rows[0]!.obsolete = RETIRED;
        },
      }),
    );
    const runes = store.repos.runeBuilds.list().filter((r) => r.obsoleteSince !== null);
    expect(runes.map((r) => [r.cookieKr, r.obsoleteReason])).toEqual([["우유", RETIRED.reason]]);
    expect(reasonSources(store, `rune_build:${runes[0]!.id}`)).toEqual(["dc:71947"]);
    const gear = store.repos.gearRecs.list().filter((g) => g.obsoleteSince !== null);
    expect(gear.map((g) => g.slot)).toEqual(["top_left"]);
    expect(reasonSources(store, `gear_rec:${gear[0]!.id}`)).toEqual(["dc:71947"]);
    const edges = store.repos.counters.list().filter((c) => c.obsoleteSince !== null);
    expect(edges.map((c) => c.slug).sort()).toEqual([
      "five-ranged-vs-bari-oven",
      "five-ranged-vs-rye-onecarry",
    ]);
    for (const edge of edges) {
      expect(reasonSources(store, `counter:${edge.id}`)).toEqual(["dc:71947"]);
    }
  });
});

describe("the obsolete block's checks", IMPORT, () => {
  it("rejects a reason citing a source the record doesn't list, naming the file and row", () => {
    const dir = pvpCopy("912-pvp-copy", {
      "gear.json": (rows) => {
        rows[0]!.obsolete = { ...RETIRED, sources: ["dc:999999999"] };
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /curated\/gear\.json \[0\]: unknown source ids: dc:999999999/,
    );
  });

  it("rejects a successor that isn't a curated deck", () => {
    const dir = pvpCopy("913-pvp-copy", {
      ...retireFiveRanged,
      "decks.json": (rows) => {
        byId(rows, "arena-five-ranged").obsolete = { ...RETIRED, superseded_by: "arena-nothing" };
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /curated\/decks\.json \[\d+\]: unknown deck ids: arena-nothing/,
    );
  });

  it("rejects a successor of another mode, and a deck that supersedes itself", () => {
    const otherMode = pvpCopy("914-pvp-copy", {
      ...retireFiveRanged,
      "decks.json": (rows) => {
        byId(rows, "arena-five-ranged").obsolete = { ...RETIRED, superseded_by: "rumble-standard-12" };
      },
    });
    expect(() => importRecord(testStore(), otherMode)).toThrow(
      /deck mode arena doesn't match deck rumble-standard-12's mode rumble_arena/,
    );
    const itself = pvpCopy("915-pvp-copy", {
      ...retireFiveRanged,
      "decks.json": (rows) => {
        byId(rows, "arena-five-ranged").obsolete = { ...RETIRED, superseded_by: "arena-five-ranged" };
      },
    });
    expect(() => importRecord(testStore(), itself)).toThrow(
      /deck arena-five-ranged can't supersede itself/,
    );
  });

  it("rejects a malformed date and a missing reason", () => {
    const date = pvpCopy("916-pvp-copy", {
      "gear.json": (rows) => {
        rows[0]!.obsolete = { ...RETIRED, since: "12 Oct" };
      },
    });
    expect(() => importRecord(testStore(), date)).toThrow(/obsolete\.since: expected YYYY-MM-DD/);
    const reason = pvpCopy("917-pvp-copy", {
      "gear.json": (rows) => {
        rows[0]!.obsolete = { since: RETIRED.since, sources: RETIRED.sources };
      },
    });
    expect(() => importRecord(testStore(), reason)).toThrow(/obsolete\.reason/);
  });

  it("rejects an obsolete block where the lifecycle doesn't reach, and a successor on anything but a deck", () => {
    const mechanic = pvpCopy("918-pvp-copy", {
      "mechanics.json": (rows) => {
        rows[0]!.obsolete = RETIRED;
      },
    });
    expect(() => importRecord(testStore(), mechanic)).toThrow(
      /curated\/mechanics\.json \[0\]: .*obsolete/,
    );
    const gear = pvpCopy("919-pvp-copy", {
      "gear.json": (rows) => {
        rows[0]!.obsolete = { ...RETIRED, superseded_by: "arena-rye-onecarry" };
      },
    });
    expect(() => importRecord(testStore(), gear)).toThrow(/curated\/gear\.json \[0\]: .*superseded_by/);
  });

  it("rejects a current counter edge that names an obsolete deck", () => {
    const dir = pvpCopy("920-pvp-copy", { "decks.json": retireFiveRanged["decks.json"]! });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /counter five-ranged-vs-\S+ names obsolete deck arena-five-ranged; mark the counter obsolete too/,
    );
  });
});

describe("re-importing a record whose recommendations changed state", IMPORT, () => {
  it("replaces the reasons' citations with the rows, and un-obsoletes a row whose block is gone", () => {
    const store = testStore();
    const dir = pvpCopy("921-pvp-copy", retireFiveRanged);
    importRecord(store, dir);
    /**
     * Lists the entity ids of every obsolescence citation.
     *
     * @returns the ids, sorted
     */
    const reasons = () =>
      store.repos.citations
        .all()
        .filter((c) => c.entity === "obsolescence")
        .map((c) => c.entityId)
        .sort();
    const first = reasons();
    expect(first).toContain("deck:arena-five-ranged");
    importRecord(store, dir, { replace: true });
    expect(reasons()).toEqual(first);
    for (const file of ["decks.json", "counters.json"]) {
      cpSync(join(pvpDir, "curated", file), join(dir, "curated", file));
    }
    importRecord(store, dir, { replace: true });
    expect(reasons()).toEqual([]);
    expect(store.repos.decks.get("arena-five-ranged")).toMatchObject({
      obsoleteSince: null,
      obsoleteReason: null,
      supersededBy: null,
    });
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run apps/server/test/importers/import-obsolete.test.ts`
Expected: FAIL. The first test fails on `Unrecognized key: "obsolete"` from `curated/decks.json`.

- [ ] **Step 3: Accept the block in the curated schemas**

In `apps/server/src/importers/seed/schema.ts`, before `seedDeckCookie`:

```ts
/**
 * A recommendation's `obsolete` block: since when it is no longer current
 * (the date of the patch that displaced it, else the round's), why, and the
 * sources that say so. A row without the block is current.
 */
export const seedObsolete = z.strictObject({
  since: isoDate,
  reason: z.string().min(1),
  sources: cited,
});
/** Output of {@link seedObsolete}. */
export type SeedObsolete = z.output<typeof seedObsolete>;

/** A deck's `obsolete` block: {@link seedObsolete}, plus the deck that superseded it, when one did. */
export const seedDeckObsolete = seedObsolete.extend({ superseded_by: deckSlug.optional() });
```

Add `obsolete: seedDeckObsolete.optional(),` to `seedDeck` and `obsolete: seedObsolete.optional(),` to `seedRune`, `seedGear` and `seedCounter`, each before `sources`. Note the block in each entry's JSDoc ("`obsolete`, when present, marks it obsolete").

- [ ] **Step 4: Write the lifecycle in the generic insert step**

In `apps/server/src/importers/steps.ts`, add the imports and helpers:

```ts
import type { ObsoleteEntity } from "@crumble/schema";
import { OBSOLESCENCE, isObsoleteEntity, obsolescenceKey } from "@crumble/schema";
```

```ts
/** A curated row's `obsolete` block, as the write steps use it. */
export interface ObsoleteValues {
  /** Since when the row is no longer current, `YYYY-MM-DD`. */
  since: string;
  /** Why. */
  reason: string;
  /** The curated source ids that say so. */
  sources: readonly string[];
}

/**
 * The lifecycle column values of a curated row.
 *
 * @param obsolete - the row's `obsolete` block, or `undefined` for a current row
 * @returns `obsoleteSince` and `obsoleteReason`, both `null` for a current row
 */
export function lifecycleColumns(obsolete: ObsoleteValues | undefined): {
  obsoleteSince: string | null;
  obsoleteReason: string | null;
} {
  return { obsoleteSince: obsolete?.since ?? null, obsoleteReason: obsolete?.reason ?? null };
}

/**
 * Cites why a row became obsolete, under its obsolescence key; does nothing
 * for a current row.
 *
 * @param repos - the write's repos
 * @param entity - the row's cited entity
 * @param id - the row's id
 * @param obsolete - the row's `obsolete` block, or `undefined` for a current row
 */
export function citeObsolescence(
  repos: Repos,
  entity: ObsoleteEntity,
  id: string | number,
  obsolete: ObsoleteValues | undefined,
): void {
  if (obsolete) repos.citations.replace(OBSOLESCENCE, obsolescenceKey(entity, id), [...obsolete.sources]);
}
```

Extend `CitedValues`:

```ts
export interface CitedValues<V> {
  /** The row's column values. */
  values: V;
  /** The curated source ids the row cites. */
  sources: readonly string[];
  /** The row's `obsolete` block, when it is obsolete. */
  obsolete?: ObsoleteValues;
}
```

And `insertCited`:

```ts
/**
 * A step inserting rows of a registered content type, in order, each owned
 * by the record being written and cited to its sources under the type's
 * registered entity. A row with an `obsolete` block gets the lifecycle
 * columns and its reason's citations.
 *
 * @param key - the content type's registry key
 * @param rows - the rows, with their sources and any `obsolete` block
 * @returns the step
 * @throws `Error`, when the step runs, if a row has an `obsolete` block and
 *   the type has no obsolete lifecycle
 */
export function insertCited<K extends ContentKey>(
  key: K,
  rows: readonly CitedValues<ValuesOf<K>>[],
): WriteStep {
  const entity = specOf(key).entity!;
  return (repos, { record }) => {
    const repo = repos[key] as unknown as TableRepo<{ id: number }, ValuesOf<K>>;
    for (const { values, sources, obsolete } of rows) {
      if (obsolete && !isObsoleteEntity(entity)) {
        throw new Error(`${entity} rows have no obsolete lifecycle`);
      }
      const lifecycle = obsolete ? lifecycleColumns(obsolete) : {};
      const row = repo.insert({ ...values, ...lifecycle, recordSlug: record } as ValuesOf<K>);
      repos.citations.replace(entity, String(row.id), [...sources]);
      if (obsolete && isObsoleteEntity(entity)) citeObsolescence(repos, entity, row.id, obsolete);
    }
  };
}
```

- [ ] **Step 5: Check references and pass the block through `citedRows`**

In `apps/server/src/importers/collection-kit.ts`, import `type { ObsoleteValues }` from `./steps`, extend `CheckContext`:

```ts
export interface CheckContext {
  /** Each curated deck's game mode, by deck id. */
  deckModes: ReadonlyMap<string, GameMode>;
  /** The ids of the curated decks marked obsolete. */
  obsoleteDecks: ReadonlySet<string>;
}
```

and `citedRows` (its JSDoc gains "A row's `obsolete` block, when it has one, is checked and written with it."):

```ts
export function citedRows<
  K extends ContentKey,
  Row extends { sources: string[]; obsolete?: ObsoleteValues },
>(
  key: K,
  parse: (file: string, raw: unknown, context: ParseContext) => Row[],
  map: (row: Row, index: number) => ValuesOf<K>,
  decks?: (row: Row) => readonly string[],
): Collection<Row[]> {
  return collection({
    parse,
    /** @inheritdoc */
    refs: (rows) =>
      rows.map((row, index) => ({
        row: index,
        sources: [...row.sources, ...(row.obsolete?.sources ?? [])],
        decks: decks?.(row),
      })),
    /** @inheritdoc */
    prepare: (rows) => [
      insertCited(
        key,
        rows.map((row, index) => ({
          values: map(row, index),
          sources: row.sources,
          obsolete: row.obsolete,
        })),
      ),
    ],
  });
}
```

In `apps/server/src/importers/read-record.ts`'s `checkCollections`, build the new context field:

```ts
  const context: CheckContext = {
    deckModes: new Map((parsed.decks ?? []).map((deck) => [deck.id, deck.mode])),
    obsoleteDecks: new Set(
      (parsed.decks ?? []).filter((deck) => deck.obsolete !== undefined).map((deck) => deck.id),
    ),
  };
```

If `pnpm typecheck` later names a test that builds a `CheckContext` by hand, add `obsoleteDecks: new Set()` to it.

- [ ] **Step 6: Write decks, runes and counters with the lifecycle**

In `apps/server/src/importers/collections.ts`, import `lifecycleColumns` and `citeObsolescence` from `./steps`. Replace the `decks` collection's `refs` and add a `check`, and write the columns and citations in `prepare`:

```ts
  decks: collection({
    /** @inheritdoc */
    parse: (file, raw, { mode }) => parseModedRows(file, raw, seedDeck, mode),
    /** @inheritdoc */
    refs: (decks) =>
      decks.map((deck, index) => ({
        row: index,
        sources: [...deck.sources, ...(deck.obsolete?.sources ?? [])],
        decks: deck.obsolete?.superseded_by ? [deck.obsolete.superseded_by] : [],
      })),
    /** @inheritdoc */
    check: (file, decks, { deckModes }) => {
      decks.forEach((deck, index) => {
        const successor = deck.obsolete?.superseded_by;
        if (successor === undefined) return;
        if (successor === deck.id) {
          throw new ImportError(file, index, `deck ${deck.id} can't supersede itself`);
        }
        const mismatch = deckModeMismatch("deck", deck.mode, successor, deckModes.get(successor));
        if (mismatch) throw new ImportError(file, index, mismatch);
      });
    },
    /** @inheritdoc */
    prepare: (decks, { file }) => {
      const mapped = decks.map((seed, position) => ({ ...mapDeck(seed, position), seed }));
      return [
        (repos, { record }) => {
          assertUnclaimed(
            file,
            "deck id",
            decks.map((deck) => deck.id),
            (id) => repos.decks.get(id)?.recordSlug,
          );
          for (const { deck, cookies, pets, notes, seed } of mapped) {
            repos.decks.insert({
              ...deck,
              ...lifecycleColumns(seed.obsolete),
              supersededBy: seed.obsolete?.superseded_by ?? null,
              recordSlug: record,
            });
            repos.decks.replaceCookies(deck.id, cookies);
            repos.decks.replacePets(deck.id, pets);
            repos.decks.replaceNotes(deck.id, notes);
            repos.citations.replace("deck", deck.id, seed.sources);
            citeObsolescence(repos, "deck", deck.id, seed.obsolete);
          }
        },
      ];
    },
  }),
```

The `runes` collection:

```ts
    /** @inheritdoc */
    refs: (runes) =>
      runes.map((rune, index) => ({
        row: index,
        sources: [...rune.sources, ...(rune.obsolete?.sources ?? [])],
        decks: rune.decks,
      })),
    /** @inheritdoc */
    prepare: (runes) => [
      (repos, { record }) => {
        for (const rune of runes) {
          const row = repos.runeBuilds.insert({
            cookieKr: rune.cookie,
            lines: rune.lines,
            why: rune.why,
            disputed: rune.disputed ?? null,
            mode: rune.mode,
            recordSlug: record,
            ...lifecycleColumns(rune.obsolete),
          });
          repos.runeBuilds.replaceDecks(row.id, rune.decks);
          repos.citations.replace("rune_build", String(row.id), rune.sources);
          citeObsolescence(repos, "rune_build", row.id, rune.obsolete);
        }
      },
    ],
```

The `gear` and `counters` collections go through `citedRows`, which now writes the block. Extend the `counters` collection's `check`:

```ts
    check: (file, edges, { deckModes, obsoleteDecks }) => {
      edges.forEach((edge, index) => {
        for (const deck of [edge.team, edge.beaten_by]) {
          const mismatch = deckModeMismatch("counter", edge.mode, deck, deckModes.get(deck));
          if (mismatch) throw new ImportError(file, index, mismatch);
          if (edge.obsolete === undefined && obsoleteDecks.has(deck)) {
            throw new ImportError(
              file,
              index,
              `counter ${edge.id} names obsolete deck ${deck}; mark the counter obsolete too`,
            );
          }
        }
      });
    },
```

- [ ] **Step 7: Clear the reasons' citations with the record's rows**

In `apps/server/src/importers/write-record.ts`, import `OBSOLESCENCE`, `isObsoleteEntity` and `obsolescenceKey` from `@crumble/schema`, and in `clearRecord` replace the loop:

```ts
  for (const key of [...OWNED_KEYS].reverse()) {
    const { entity } = specOf(key);
    const owned = repos.tables.ownedIds(key, slug);
    if (entity) repos.citations.removeFor(entity, owned);
    if (entity && isObsoleteEntity(entity)) {
      repos.citations.removeFor(
        OBSOLESCENCE,
        owned.map((id) => obsolescenceKey(entity, id)),
      );
    }
    repos.tables.clearOwned(key, slug);
  }
```

Add to `clearRecord`'s JSDoc: "The citations of an obsolete row's reason go with the row."

- [ ] **Step 8: Run the import tests**

Run: `pnpm vitest run apps/server/test/importers/import-obsolete.test.ts`
Expected: PASS.

- [ ] **Step 9: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes. The existing imports are unchanged: no curated file has an `obsolete` block yet.

Run: `git add apps/server/test/importers/import-obsolete.test.ts`

Message:

```
feat(import): a curated recommendation can be marked obsolete

A refresh round marks a displaced deck, rune build, gear rec or counter
edge obsolete in the record's curated files instead of deleting it. The
row's obsolete block gives since when, why and the sources that say so,
and a deck's names the deck that superseded it. The importer validates
the date, the sources and the successor (a curated deck of the same
mode, not itself), writes the lifecycle columns and cites the reason.

A current counter edge that names an obsolete deck fails the import:
the matchup it describes is gone with the deck, so the edge is marked
too, with its own reason. Deriving it silently was discarded; it would
hide the edge's reason. --replace clears the reasons' citations with
the rows, so a later round's un-obsoleted row comes back clean.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- apps/server/src/importers apps/server/test/importers`

---

### Task 4: API: the `?current=` list filter

**Files:**
- Modify: `apps/server/src/registry.ts` (`FilterMatch`, `AnyListFilter`, `currentFilter`, `Entry`, `entry`, module JSDoc)
- Modify: `apps/server/src/services/filters.ts` (`matcher`)
- Test: `apps/server/test/registry.test.ts`, `apps/server/test/routes/obsolete.test.ts` (create)

**Interfaces:**
- Consumes: the lifecycle columns from Task 2.
- Produces:
  - `FilterMatch` variant `{ isNull: ColumnOf<Row> }`: the value `"true"` keeps views whose column is null, `"false"` those whose column isn't.
  - `REGISTRY.<key>.filters.current` on every table with an `obsoleteSince` column, schema `z.enum(["true", "false"])`, derived like `mode`.
  - Typed client: `api.decks.$get({ query: { current?: "true" | "false" } })`, and the same on `rune-builds`, `gear-recs` and `counters`.

- [ ] **Step 1: Write the failing registry and route tests**

In `apps/server/test/registry.test.ts`, import `OBSOLETE_ENTITIES` from `@crumble/schema`, add after `MODE_CASE`:

```ts
/** The case every derived `?current=` filter runs: a current row, and one obsolete since a date. */
const CURRENT_CASE: FilterCase = {
  match: {},
  other: { obsoleteSince: "2026-10-12", obsoleteReason: "r" },
  value: "true",
};
```

change the probe lookup in "serves every declared list filter" to:

```ts
        const probe =
          FILTER_CASES[key]?.[name] ??
          (name === "mode" ? MODE_CASE : name === "current" ? CURRENT_CASE : undefined);
```

(the seeds pass `over` to the services, which write it as given, so an obsolete row needs no other seeding), and add:

```ts
  it("gives every table with an obsolete_since column a ?current= filter on it, and no other table one", () => {
    for (const key of TABLE_KEYS) {
      const { table, filters } = specOf(key);
      const lifecycle = Object.values(getTableConfig(table).columns).some(
        (c) => c.name === "obsolete_since",
      );
      if (lifecycle) expect(filters?.current?.match, key).toEqual({ isNull: "obsoleteSince" });
      else expect(filters?.current, key).toBeUndefined();
    }
    expect(REGISTRY.decks.filters.current.schema.safeParse("true").success).toBe(true);
    expect(REGISTRY.decks.filters.current.schema.safeParse("yes").success).toBe(false);
  });

  it("gives the obsolete lifecycle to the tables whose entity OBSOLETE_ENTITIES names, and to no other", () => {
    const withLifecycle = TABLE_KEYS.filter((key) =>
      Object.values(getTableConfig(specOf(key).table).columns).some(
        (c) => c.name === "obsolete_since",
      ),
    );
    expect(withLifecycle.map((key) => specOf(key).entity).sort()).toEqual(
      [...OBSOLETE_ENTITIES].sort(),
    );
  });
```

Create `apps/server/test/routes/obsolete.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, readJson, testStore } from "../helpers";

/**
 * Builds an app over a store holding record `r1`'s current and obsolete
 * recommendations. Arena decks `rye` and `bari` are current and `ranged`
 * is obsolete, superseded by `rye`; the Rumble Arena deck `wizard` is
 * current. Each lifecycle table has a current row and an obsolete one.
 * Every row cites `dc:1`, and every obsolete row cites `dc:2` for its reason.
 *
 * @returns the app, its store, and the ids of the integer-keyed rows
 */
function setup() {
  const store = testStore();
  addSource(store, "dc:1");
  addSource(store, "dc:2");
  const { decks, runeBuilds, gearRecs, counters, citations } = store.repos;
  const retired = { obsoleteSince: "2026-10-12", obsoleteReason: "Patched out." };
  const owned = { mode: "arena" as const, recordSlug: "r1" };
  decks.insert({ id: "rye", position: 0, nameEn: "Rye", status: "meta", ...owned });
  decks.insert({
    id: "ranged",
    position: 1,
    nameEn: "Ranged",
    status: "legacy",
    ...owned,
    ...retired,
    supersededBy: "rye",
  });
  decks.insert({ id: "bari", position: 2, nameEn: "Bari", status: "meta", ...owned });
  decks.insert({
    id: "wizard",
    position: 3,
    nameEn: "Wizard",
    status: "niche",
    mode: "rumble_arena",
    recordSlug: "r1",
  });
  const rune = { cookieKr: "호밀", why: "w", ...owned };
  const liveRune = runeBuilds.insert({ ...rune, lines: "ATK" });
  const oldRune = runeBuilds.insert({ ...rune, lines: "CRIT", ...retired });
  const gear = { slot: "top_left" as const, context: "arena" as const, why: "w", ...owned };
  const liveGear = gearRecs.insert({ ...gear, substats: "ATK" });
  const oldGear = gearRecs.insert({ ...gear, substats: "HP", ...retired });
  const edge = { why: "w", confidence: "low" as const, ...owned };
  const liveEdge = counters.insert({ ...edge, slug: "rye-vs-bari", teamDeckId: "rye", beatenByDeckId: "bari" });
  const oldEdge = counters.insert({
    ...edge,
    slug: "ranged-vs-rye",
    teamDeckId: "ranged",
    beatenByDeckId: "rye",
    ...retired,
  });
  for (const id of ["rye", "ranged", "bari", "wizard"]) citations.replace("deck", id, ["dc:1"]);
  for (const { id } of [liveRune, oldRune]) citations.replace("rune_build", String(id), ["dc:1"]);
  for (const { id } of [liveGear, oldGear]) citations.replace("gear_rec", String(id), ["dc:1"]);
  for (const { id } of [liveEdge, oldEdge]) citations.replace("counter", String(id), ["dc:1"]);
  citations.replace("obsolescence", "deck:ranged", ["dc:2"]);
  citations.replace("obsolescence", `rune_build:${oldRune.id}`, ["dc:2"]);
  citations.replace("obsolescence", `gear_rec:${oldGear.id}`, ["dc:2"]);
  citations.replace("obsolescence", `counter:${oldEdge.id}`, ["dc:2"]);
  return {
    app: createApp(createServices(store)),
    store,
    ids: { liveRune: liveRune.id, oldRune: oldRune.id, liveGear: liveGear.id, oldGear: oldGear.id, liveEdge: liveEdge.id, oldEdge: oldEdge.id },
  };
}

describe("the ?current= list filter", () => {
  it("keeps the current rows with ?current=true and the obsolete ones with ?current=false", async () => {
    const { app, ids } = setup();
    /**
     * Lists the ids a list request returns.
     *
     * @param url - the request path
     * @returns each row's `id`, in list order
     */
    const listed = async (url: string) =>
      (await readJson<Array<{ id: unknown }>>(await app.request(url))).map((row) => row.id);
    expect(await listed("/api/decks")).toEqual(["rye", "ranged", "bari", "wizard"]);
    expect(await listed("/api/decks?current=true")).toEqual(["rye", "bari", "wizard"]);
    expect(await listed("/api/decks?current=false")).toEqual(["ranged"]);
    expect(await listed("/api/rune-builds?current=true")).toEqual([ids.liveRune]);
    expect(await listed("/api/rune-builds?current=false")).toEqual([ids.oldRune]);
    expect(await listed("/api/gear-recs?current=true")).toEqual([ids.liveGear]);
    expect(await listed("/api/gear-recs?current=false")).toEqual([ids.oldGear]);
    expect(await listed("/api/counters?current=true")).toEqual([ids.liveEdge]);
    expect(await listed("/api/counters?current=false")).toEqual([ids.oldEdge]);
    expect(await listed("/api/decks?mode=arena&current=true")).toEqual(["rye", "bari"]);
  });

  it("answers 400 for a ?current= that isn't true or false", async () => {
    const { app } = setup();
    expect((await app.request("/api/decks?current=yes")).status).toBe(400);
    expect((await app.request("/api/counters?current=1")).status).toBe(400);
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run apps/server/test/routes/obsolete.test.ts`
Expected: FAIL: `?current=true` returns every row, since no filter is declared.

Run: `pnpm vitest run apps/server/test/registry.test.ts`
Expected: FAIL: `filters?.current` is undefined for `decks`.

- [ ] **Step 3: Declare the match and derive the filter**

In `apps/server/src/registry.ts`, extend the module JSDoc's last sentence: "A table with a `mode` column gets the `?mode=` list filter, and a table with the obsolete lifecycle (an `obsoleteSince` column) the `?current=` filter, without declaring them."

Extend `FilterMatch` and its JSDoc list:

```ts
 * - `includes`: the view's array field (e.g. a rune build's `decks`)
 *   contains the value;
 * - `isNull`: the value `true` keeps the views whose column is null, and
 *   `false` those whose column isn't.
 */
export type FilterMatch<Row> =
  | { equals: ColumnOf<Row> }
  | { anyOf: readonly ColumnOf<Row>[] }
  | { sameName: ColumnOf<Row> }
  | { includes: string }
  | { isNull: ColumnOf<Row> };
```

and `AnyListFilter.match`:

```ts
  match:
    | { equals: string }
    | { anyOf: readonly string[] }
    | { sameName: string }
    | { includes: string }
    | { isNull: string };
```

After `modeFilter`:

```ts
/**
 * The `?current=` filter every table with the obsolete lifecycle gets:
 * `true` keeps the current rows, `false` the obsolete ones.
 */
const currentFilter = {
  schema: z.enum(["true", "false"]),
  match: { isNull: "obsoleteSince" },
} as const;
```

Replace `Entry` and `entry`:

```ts
/** A column of the rows of `T`. */
type Columns<T extends SQLiteTable> = ColumnOf<InferSelectModel<T>>;

/**
 * A registry entry: the declared spec and its table, plus the derived
 * `mode` filter when the table has a `mode` column and the derived
 * `current` filter when it has the obsolete lifecycle.
 */
type Entry<T extends SQLiteTable, S> = S & { table: T } & ("mode" extends Columns<T>
    ? { filters: { mode: typeof modeFilter } }
    : unknown) &
  ("obsoleteSince" extends Columns<T> ? { filters: { current: typeof currentFilter } } : unknown);

/**
 * Declares one registry entry, keeping its literal types (the route path
 * above all) for the typed client. A table with a `mode` column gets the
 * `mode` list filter, and one with an `obsoleteSince` column the `current`
 * filter, without declaring them.
 *
 * @param table - the drizzle table
 * @param spec - everything else about it; a `filters.mode` or
 *   `filters.current` it declares is replaced by the derived one
 * @returns the entry
 */
function entry<T extends SQLiteTable, const S extends Omit<TableSpec<T>, "table">>(
  table: T,
  spec: S,
): Entry<T, S> {
  const columns = table as unknown as Record<string, unknown>;
  const derived = {
    ...(columns.mode !== undefined ? { mode: modeFilter } : {}),
    ...(columns.obsoleteSince !== undefined ? { current: currentFilter } : {}),
  };
  const filters =
    Object.keys(derived).length > 0 ? { ...spec.filters, ...derived } : spec.filters;
  return { ...spec, table, ...(filters ? { filters } : {}) } as Entry<T, S>;
}
```

- [ ] **Step 4: Match it**

In `apps/server/src/services/filters.ts`'s `matcher`, after the `includes` branch:

```ts
  if ("isNull" in match) {
    const wanted = value === "true";
    return (view) => (field(view, match.isNull) == null) === wanted;
  }
```

The decks and rune build services already apply `REGISTRY.<key>.filters`, and the content service its spec's filters, so no service changes.

- [ ] **Step 5: Run the tests**

Run: `pnpm vitest run apps/server/test/routes/obsolete.test.ts`
Expected: PASS.

Run: `pnpm vitest run apps/server/test/registry.test.ts`
Expected: PASS.

- [ ] **Step 6: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Run: `git add apps/server/test/routes/obsolete.test.ts`

Message:

```
feat(api): a ?current= filter on every list with the obsolete lifecycle

The views that rank or recommend need the current rows only, and the
list pages need both. The registry now derives ?current=true|false for
every table with an obsoleteSince column, as it derives ?mode= from a
mode column, through a new isNull filter match, so the decks, rune
build and content services apply it with no change of their own.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- apps/server/src/registry.ts apps/server/src/services/filters.ts apps/server/test/registry.test.ts apps/server/test/routes/obsolete.test.ts`

---

### Task 5: API: views carry the reason's sources; deletes and source attribution follow

**Files:**
- Modify: `apps/server/src/services/decks.ts` (`DeckView`, `toViews`, `remove`)
- Modify: `apps/server/src/repos/decks.ts` (`supersededDecks`)
- Modify: `apps/server/src/services/rune-builds.ts` (`RuneBuildView`, `toViews`, `remove`)
- Modify: `apps/server/src/services/content.ts` (`ContentServiceSpec.lifecycle`, `createContentService`, `ContentView`, `registeredService`)
- Modify: `apps/server/src/services/sources.ts` (`citingRecords`)
- Modify: `apps/web/test/helpers.tsx` (`CURRENT`)
- Test: `apps/server/test/routes/obsolete.test.ts`

**Interfaces:**
- Consumes: `setup()` in `apps/server/test/routes/obsolete.test.ts` from Task 4; `OBSOLESCENCE`, `obsolescenceKey`, `parseObsolescenceKey`, `isObsoleteEntity` from Task 2.
- Produces:
  - `obsoleteSources: string[]` on every deck, rune build, gear rec and counter view (empty for a current row).
  - `DecksRepo.supersededDecks(id: string): string[]`
  - `DELETE /api/decks/:id` answers 409 while another deck names it as `supersededBy`.
  - `ContentServiceSpec.lifecycle?: ObsoleteEntity`

- [ ] **Step 1: Write the failing tests**

Append to `apps/server/test/routes/obsolete.test.ts` (add `jsonBody` to the `../helpers` import):

```ts
describe("obsolete recommendations in the API's views", () => {
  it("carries a deck's lifecycle and its reason's sources, keeping its status", async () => {
    const { app } = setup();
    const ranged = await readJson<Record<string, unknown>>(await app.request("/api/decks/ranged"));
    expect(ranged).toMatchObject({
      status: "legacy",
      obsoleteSince: "2026-10-12",
      obsoleteReason: "Patched out.",
      supersededBy: "rye",
      sources: ["dc:1"],
      obsoleteSources: ["dc:2"],
    });
    const rye = await readJson<Record<string, unknown>>(await app.request("/api/decks/rye"));
    expect(rye).toMatchObject({ obsoleteSince: null, supersededBy: null, obsoleteSources: [] });
  });

  it("carries the reason's sources on rune builds, gear recs and counter edges", async () => {
    const { app, ids } = setup();
    for (const [path, live, old] of [
      ["/api/rune-builds", ids.liveRune, ids.oldRune],
      ["/api/gear-recs", ids.liveGear, ids.oldGear],
      ["/api/counters", ids.liveEdge, ids.oldEdge],
    ] as const) {
      const rows = await readJson<Array<{ id: number; obsoleteSources: string[] }>>(
        await app.request(path),
      );
      expect(rows.find((r) => r.id === old)?.obsoleteSources, path).toEqual(["dc:2"]);
      expect(rows.find((r) => r.id === live)?.obsoleteSources, path).toEqual([]);
      const one = await readJson<{ obsoleteSources: string[] }>(await app.request(`${path}/${old}`));
      expect(one.obsoleteSources, `${path}/${old}`).toEqual(["dc:2"]);
    }
  });

  it("ignores the lifecycle fields on POST: a row becomes obsolete only through its record's import", async () => {
    const { app } = setup();
    const gear = await app.request(
      "/api/gear-recs",
      jsonBody({
        slot: "top_right",
        substats: "DEF",
        context: "arena",
        why: "w",
        mode: "arena",
        sources: ["dc:1"],
        obsoleteSince: "2026-10-12",
        obsoleteReason: "x",
      }),
    );
    expect(gear.status).toBe(201);
    expect(await readJson<unknown>(gear)).toMatchObject({
      obsoleteSince: null,
      obsoleteReason: null,
      obsoleteSources: [],
    });
    const deck = await app.request(
      "/api/decks",
      jsonBody({
        id: "chain",
        nameEn: "Chain",
        status: "niche",
        mode: "arena",
        cookies: [{ cookieKr: "체인", level: "1", why: "w" }],
        sources: ["dc:1"],
        obsoleteSince: "2026-10-12",
        supersededBy: "rye",
      }),
    );
    expect(deck.status).toBe(201);
    expect(await readJson<unknown>(deck)).toMatchObject({ obsoleteSince: null, supersededBy: null });
  });

  it("deletes an obsolete row's reason citations with the row", async () => {
    const { app, store, ids } = setup();
    for (const path of [
      `/api/rune-builds/${ids.oldRune}`,
      `/api/gear-recs/${ids.oldGear}`,
      `/api/counters/${ids.oldEdge}`,
    ]) {
      expect((await app.request(path, { method: "DELETE" })).status, path).toBe(204);
    }
    const reasons = store.repos.citations.all().filter((c) => c.entity === "obsolescence");
    expect(reasons.map((c) => c.entityId)).toEqual(["deck:ranged"]);
  });

  it("refuses to delete a deck another deck names as its successor, and deletes the obsolete deck with its reason", async () => {
    const { app, store, ids } = setup();
    for (const id of [ids.liveEdge, ids.oldEdge]) {
      await app.request(`/api/counters/${id}`, { method: "DELETE" });
    }
    const refused = await app.request("/api/decks/rye", { method: "DELETE" });
    expect(refused.status).toBe(409);
    expect(await refused.text()).toMatch(/deck rye is named as the successor of ranged/);
    expect((await app.request("/api/decks/ranged", { method: "DELETE" })).status).toBe(204);
    expect(store.repos.citations.all().some((c) => c.entityId === "deck:ranged")).toBe(false);
    expect((await app.request("/api/decks/rye", { method: "DELETE" })).status).toBe(204);
  });

  it("counts a source cited only for an obsolete reason as cited, under the record whose row cites it", async () => {
    const { app } = setup();
    const listed = await readJson<Array<{ id: string; records: string[] }>>(
      await app.request("/api/sources?record=r1"),
    );
    expect(listed.find((s) => s.id === "dc:2")?.records).toEqual(["r1"]);
    expect((await app.request("/api/sources/dc:2", { method: "DELETE" })).status).toBe(409);
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run apps/server/test/routes/obsolete.test.ts`
Expected: FAIL: the views have no `obsoleteSources`, `DELETE /api/decks/rye` answers 204, and `dc:2` lists no record.

- [ ] **Step 3: Decks: the view, the successor guard, the delete**

In `apps/server/src/repos/decks.ts`, add to the `DecksRepo` interface:

```ts
  /**
   * Returns the ids of the decks that name `id` as the deck that superseded them.
   *
   * @param id - the deck's slug id
   * @returns their ids, sorted; `[]` when none does
   */
  supersededDecks(id: string): string[];
```

and to `createDecksRepo`:

```ts
    /** @inheritdoc */
    supersededDecks: (id) =>
      db
        .select({ id: decks.id })
        .from(decks)
        .where(eq(decks.supersededBy, id))
        .orderBy(asc(decks.id))
        .all()
        .map((row) => row.id),
```

In `apps/server/src/services/decks.ts`, import `OBSOLESCENCE` and `obsolescenceKey` from `@crumble/schema`. Extend `DeckView`:

```ts
/**
 * A deck as returned to callers: … (the existing text) …, and the sources
 * that say why it became obsolete (`obsoleteSources`, empty while it is current).
 */
export type DeckView = Omit<Cited<DeckRow>, "atkOrder"> & {
  cookies: Array<Omit<DeckCookieRow, "deckId"> & { en: string | null }>;
  pets: NameRef[];
  notes: Array<{ kind: DeckNoteKind; text: string }>;
  atkOrder: NameRef[] | null;
  obsoleteSources: string[];
};
```

In `toViews`, next to `sourcesById`:

```ts
    const reasonsById = repos.citations.sourcesFor(
      OBSOLESCENCE,
      ids.map((id) => obsolescenceKey("deck", id)),
    );
```

and in the returned object, after `sources`:

```ts
        obsoleteSources: reasonsById.get(obsolescenceKey("deck", row.id)) ?? [],
```

Replace `remove`, and extend its interface JSDoc with "Its obsolete reason's citations go with it." and `@throws {ConflictError} "deck <id> is named as the successor of <ids>"` if another deck names it as `supersededBy`:

```ts
    /** @inheritdoc */
    remove: (id) =>
      store.transaction((repos) => {
        if (!repos.decks.exists(id)) throw new NotFoundError("deck", id);
        const edges = repos.decks.counterEdges(id);
        if (edges > 0) throw new ConflictError(`deck ${id} is named by ${edges} counter edges`);
        const superseded = repos.decks.supersededDecks(id);
        if (superseded.length > 0) {
          throw new ConflictError(`deck ${id} is named as the successor of ${superseded.join(", ")}`);
        }
        repos.citations.removeAll("deck", id);
        repos.citations.removeAll(OBSOLESCENCE, obsolescenceKey("deck", id));
        repos.decks.remove(id);
      }),
```

- [ ] **Step 4: Rune builds**

In `apps/server/src/services/rune-builds.ts`, import `OBSOLESCENCE` and `obsolescenceKey`. Extend the view type and its JSDoc ("…, and the sources that say why it became obsolete, empty while it is current"):

```ts
export type RuneBuildView = Cited<RuneBuildRow> & {
  en: string | null;
  decks: string[];
  obsoleteSources: string[];
};
```

In `toViews`:

```ts
    const reasonsById = repos.citations.sourcesFor(
      OBSOLESCENCE,
      ids.map((id) => obsolescenceKey("rune_build", id)),
    );
    return rows.map((row) => ({
      ...row,
      sources: sourcesById.get(String(row.id)) ?? [],
      obsoleteSources: reasonsById.get(obsolescenceKey("rune_build", row.id)) ?? [],
      en: resolve(row.cookieKr, recordsOf(row)).en,
      decks: decksById.get(row.id) ?? [],
    }));
```

In `remove`, after the `rune_build` citations: `repos.citations.removeAll(OBSOLESCENCE, obsolescenceKey("rune_build", id));`.

- [ ] **Step 5: The generic content service**

In `apps/server/src/services/content.ts`, import `type { ObsoleteEntity }` and `OBSOLESCENCE`, `isObsoleteEntity`, `obsolescenceKey` from `@crumble/schema`. Add to `ContentServiceSpec`:

```ts
  /** The table's entity when its rows carry the obsolete lifecycle: views then carry `obsoleteSources`. */
  lifecycle?: ObsoleteEntity;
```

In `createContentService`, destructure `lifecycle` with the other spec fields and replace `toView` and `withSources`:

```ts
  /**
   * Reads the sources that say why each of `rows` became obsolete.
   *
   * @param repos - the repos to read citations from
   * @param rows - the rows
   * @returns each row's id → its reason's sources; empty for a table without the lifecycle
   */
  const reasonsOf = (repos: Repos, rows: readonly Row[]): Map<number, string[]> => {
    if (lifecycle === undefined) return new Map();
    const cited = repos.citations.sourcesFor(
      OBSOLESCENCE,
      rows.map((row) => obsolescenceKey(lifecycle, row.id)),
    );
    return new Map(rows.map((row) => [row.id, cited.get(obsolescenceKey(lifecycle, row.id)) ?? []]));
  };
  /**
   * Builds a row's view.
   *
   * @param row - the row
   * @param sources - the row's cited source ids
   * @param reasons - the sources of the row's obsolete reason
   * @param resolve - the glossary resolver; without one, the view has no `en`
   * @returns the row with `sources`, `obsoleteSources` when the table has
   *   the obsolete lifecycle, and `en` when `gloss` names a column
   */
  const toView = (row: Row, sources: string[], reasons: string[], resolve?: NameResolver): View => {
    const view: Record<string, unknown> = { ...row, sources };
    if (lifecycle !== undefined) view.obsoleteSources = reasons;
    if (gloss !== undefined && resolve) {
      view.en = resolve(String((row as Record<string, unknown>)[gloss]), recordsOf(row)).en;
    }
    return view as View;
  };
  /**
   * Builds a row's view with its stored citations.
   *
   * @param repos - the repos to read citations and the glossary from
   * @param row - the row
   * @returns the row's view
   */
  const withSources = (repos: Repos, row: Row): View => {
    const sources = repos.citations.sourcesFor(entity, [String(row.id)]).get(String(row.id)) ?? [];
    return toView(row, sources, reasonsOf(repos, [row]).get(row.id) ?? [], resolver(repos));
  };
```

Update the callers: in `list`, `const reasons = reasonsOf(repos, rows);` and `toView(row, sourcesById.get(String(row.id)) ?? [], reasons.get(row.id) ?? [], resolve)`; in `create`, `toView(row, sources, [], resolver(repos))`; in `update`, `toView(row, sources, reasonsOf(repos, [row]).get(row.id) ?? [], resolver(repos))`. In `remove`, after the row's citations:

```ts
        if (lifecycle !== undefined) {
          repos.citations.removeAll(OBSOLESCENCE, obsolescenceKey(lifecycle, id));
        }
```

Extend `ContentView`:

```ts
/**
 * What a registered content type's reads and writes return: the row, its
 * `sources`, `obsoleteSources` when the type has the obsolete lifecycle,
 * and `en` when the type glosses a name column.
 */
export type ContentView<K extends ContentKey> = Cited<RowOf<K>> &
  (Registry[K]["content"] extends { gloss: string } ? { en: string | null } : unknown) &
  (RowOf<K> extends { obsoleteSince: string | null } ? { obsoleteSources: string[] } : unknown);
```

In `registeredService`, pass `lifecycle: entity !== undefined && isObsoleteEntity(entity) ? entity : undefined,` to `createContentService`.

- [ ] **Step 6: Attribute a reason's sources to the record whose row cites them**

In `apps/server/src/services/sources.ts`, import `OBSOLESCENCE` and `parseObsolescenceKey`, and replace the loop of `citingRecords`:

```ts
  for (const { entity, entityId, sourceId } of repos.citations.all()) {
    const target = entity === OBSOLESCENCE ? parseObsolescenceKey(entityId) : { entity, id: entityId };
    const record = target && owners.get(target.entity)?.get(target.id);
    if (!record) continue;
    const records = bySource.get(sourceId) ?? new Set<string>();
    records.add(record);
    bySource.set(sourceId, records);
  }
```

Add to its JSDoc: "A source cited for an obsolete row's reason counts for the row's record."

- [ ] **Step 7: Run the tests**

Run: `pnpm vitest run apps/server/test/routes/obsolete.test.ts`
Expected: PASS.

- [ ] **Step 8: Give the web fixtures the new field**

In `apps/web/test/helpers.tsx`, change `CURRENT`:

```ts
/** The lifecycle fields of a current recommendation row, spread into fixtures. */
export const CURRENT = { obsoleteSince: null, obsoleteReason: null, obsoleteSources: [] as string[] };
```

Run: `pnpm typecheck`
Expected: PASS (every fixture already spreads `CURRENT` or `CURRENT_DECK`).

- [ ] **Step 9: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Message:

```
feat(api): views carry the sources of an obsolete row's reason

A list page shows an obsolete recommendation with its reason's sources,
so every deck, rune build, gear rec and counter view now carries
obsoleteSources, read from the obsolescence citations. Deleting a row
deletes them, a deck another deck names as its successor can't be
deleted, and a source cited only for a reason still counts as cited:
it can't be deleted, and ?record= lists it under the record whose row
cites it.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- apps/server/src apps/server/test/routes/obsolete.test.ts apps/web/test/helpers.tsx`

---

### Task 6: Web: lifecycle helpers, the notice, the collapsed section, the `current` query option

**Files:**
- Create: `apps/web/src/lib/obsolete.ts`
- Create: `apps/web/src/components/ObsoleteNotice.tsx`
- Create: `apps/web/src/components/ObsoleteSection.tsx`
- Create: `apps/web/src/styles/obsolete.css`
- Modify: `apps/web/src/main.tsx` (import the stylesheet)
- Modify: `apps/web/src/api/queries.ts` (`LifecycleOptions`; `decksQuery`, `runeBuildsQuery`, `gearRecsQuery`, `countersQuery`)
- Test: `apps/web/test/obsolete-lib.test.ts` (create), `apps/web/test/obsolete-components.test.tsx` (create), `apps/web/test/modes.test.ts`

**Interfaces:**
- Produces:
  - `lib/obsolete.ts`: `interface Lifecycle { obsoleteSince?: string | null }`; `interface LifecycleDeck extends Lifecycle { id: string }`; `isCurrent(row: Lifecycle): boolean`; `splitObsolete<T extends Lifecycle>(rows: readonly T[]): { current: T[]; obsolete: T[] }` (obsolete newest `obsoleteSince` first); `splitByDeck<T extends { deckId: string | null }>(rows: readonly T[], decks: readonly LifecycleDeck[]): { current: T[]; obsolete: T[] }`; `groupByObsoleteDeck<T extends { deckId: string | null }, D extends LifecycleDeck>(rows: readonly T[], decks: readonly D[]): Array<{ deck: D; rows: T[] }>`
  - `<ObsoleteNotice since reason sources sourceIndex superseded? />`: a `role="note"` block, "Obsolete since <since>: <reason> Superseded by <superseded>." with source chips
  - `<ObsoleteSection id latest open?>{children}</ObsoleteSection>`: a `<details class="obsolete">` closed unless `open`, summary "Obsolete · latest <latest>"; renders nothing when `latest` is null
  - `queries.ts`: `interface LifecycleOptions { current?: boolean }`; `decksQuery(scope?, options?)`, `runeBuildsQuery(scope?, deck?, options?)`, `gearRecsQuery(scope?, options?)`, `countersQuery(scope?, options?)`; `current: true` sends `&current=true` and keys the cache apart

- [ ] **Step 1: Write the failing tests**

Create `apps/web/test/obsolete-lib.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { groupByObsoleteDeck, isCurrent, splitByDeck, splitObsolete } from "../src/lib/obsolete";

const current = { id: "rye", obsoleteSince: null };
const older = { id: "ranged", obsoleteSince: "2026-10-01" };
const newer = { id: "chain", obsoleteSince: "2026-10-12" };

describe("the obsolete lifecycle helpers", () => {
  it("counts a row without obsoleteSince as current", () => {
    expect(isCurrent(current)).toBe(true);
    expect(isCurrent({})).toBe(true);
    expect(isCurrent(older)).toBe(false);
  });

  it("splits rows into the current ones in order and the obsolete ones newest first", () => {
    expect(splitObsolete([older, current, newer])).toEqual({
      current: [current],
      obsolete: [newer, older],
    });
  });

  it("keeps a row current unless the deck it names is obsolete", () => {
    const rows = [
      { id: 1, deckId: "rye" },
      { id: 2, deckId: "ranged" },
      { id: 3, deckId: null },
      { id: 4, deckId: "unlisted" },
    ];
    expect(splitByDeck(rows, [current, older])).toEqual({
      current: [rows[0], rows[2], rows[3]],
      obsolete: [rows[1]],
    });
  });

  it("groups the rows of obsolete decks by deck, the most recently obsoleted first", () => {
    const rows = [
      { id: 1, deckId: "ranged" },
      { id: 2, deckId: "chain" },
      { id: 3, deckId: "ranged" },
      { id: 4, deckId: "rye" },
    ];
    expect(groupByObsoleteDeck(rows, [current, older, newer])).toEqual([
      { deck: newer, rows: [rows[1]] },
      { deck: older, rows: [rows[0], rows[2]] },
    ]);
  });
});
```

Create `apps/web/test/obsolete-components.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ObsoleteNotice } from "../src/components/ObsoleteNotice";
import { ObsoleteSection } from "../src/components/ObsoleteSection";
import { indexSources } from "../src/lib/sources";
import { VIEW_SOURCES } from "./view-harness";

const SOURCES = indexSources(VIEW_SOURCES);

describe("ObsoleteNotice", () => {
  it("says since when, why, what superseded it, and links the reason's sources", () => {
    render(
      <ObsoleteNotice
        since="2026-10-12"
        reason="Patched out."
        sources={["dc:76135"]}
        sourceIndex={SOURCES}
        superseded={<a href="#deck-rye">Rye deck</a>}
      />,
    );
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("Obsolete since 2026-10-12: Patched out. Superseded by Rye deck.");
    expect(within(note).getByRole("link", { name: "Rye deck" })).toHaveAttribute("href", "#deck-rye");
    expect(within(note).getByRole("link", { name: "DC 76135" })).toBeVisible();
  });

  it("leaves out the reason and the successor when there are none", () => {
    render(<ObsoleteNotice since="2026-10-12" reason={null} sources={[]} sourceIndex={SOURCES} />);
    expect(screen.getByRole("note")).toHaveTextContent(/^Obsolete since 2026-10-12$/);
  });
});

describe("ObsoleteSection", () => {
  it("renders nothing without an obsolete item", () => {
    const { container } = render(
      <ObsoleteSection id="x" latest={null}>
        <p>old</p>
      </ObsoleteSection>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("is collapsed, dated by its latest item, and opens when asked", () => {
    const { rerender } = render(
      <ObsoleteSection id="decks-obsolete" latest="2026-10-12">
        <p>old deck</p>
      </ObsoleteSection>,
    );
    const section = document.getElementById("decks-obsolete")!;
    expect(section.tagName).toBe("DETAILS");
    expect(section).not.toHaveAttribute("open");
    expect(section.querySelector("summary")).toHaveTextContent("Obsolete · latest 2026-10-12");
    expect(within(section).getByText("old deck")).toBeInTheDocument();
    rerender(
      <ObsoleteSection id="decks-obsolete" latest="2026-10-12" open>
        <p>old deck</p>
      </ObsoleteSection>,
    );
    expect(document.getElementById("decks-obsolete")).toHaveAttribute("open");
  });
});
```

In `apps/web/test/modes.test.ts`'s "send the mode's ?mode= on each list request" test, import `gearRecsQuery` and `runeBuildsQuery` from `../src/api/queries` if missing, and add:

```ts
    expect(await get(decksQuery(CONQUEST.scope, { current: true }))).toBe(
      "/api/decks?mode=guild_conquest&current=true",
    );
    expect(await get(runeBuildsQuery(CONQUEST.scope, undefined, { current: true }))).toBe(
      "/api/rune-builds?mode=guild_conquest&current=true",
    );
    expect(await get(gearRecsQuery(ARENA.scope, { current: true }))).toBe(
      "/api/gear-recs?mode=arena&current=true",
    );
    expect(await get(countersQuery(ARENA.scope, { current: true }))).toBe(
      "/api/counters?mode=arena&current=true",
    );
    expect(decksQuery(ARENA.scope).queryKey).not.toEqual(
      decksQuery(ARENA.scope, { current: true }).queryKey,
    );
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run apps/web/test/obsolete-lib.test.ts`
Expected: FAIL, `Cannot find module '../src/lib/obsolete'`.

Run: `pnpm vitest run apps/web/test/obsolete-components.test.tsx`
Expected: FAIL, cannot find the components.

Run: `pnpm vitest run apps/web/test/modes.test.ts`
Expected: FAIL: the request has no `&current=true`.

- [ ] **Step 3: The pure helpers**

Create `apps/web/src/lib/obsolete.ts`:

```ts
/**
 * The obsolete lifecycle in the web app: telling current recommendation
 * rows from obsolete ones, and rows that name a deck by that deck's state.
 * `/api` rows fit these shapes as they are.
 *
 * @module
 */

/** A row with the obsolete lifecycle: `obsoleteSince` is unset or null while it is current. */
export interface Lifecycle {
  obsoleteSince?: string | null;
}

/** A deck as the lifecycle helpers read it. */
export interface LifecycleDeck extends Lifecycle {
  id: string;
}

/**
 * Reports whether a row is a current recommendation.
 *
 * @param row - the row
 * @returns `true` when it has no `obsoleteSince`
 */
export function isCurrent(row: Lifecycle): boolean {
  return row.obsoleteSince == null;
}

/**
 * Orders obsolete rows the most recently obsoleted first.
 *
 * @param a - a row
 * @param b - another row
 * @returns a negative number when `a` became obsolete after `b`
 */
function bySinceDesc(a: Lifecycle, b: Lifecycle): number {
  return (b.obsoleteSince ?? "").localeCompare(a.obsoleteSince ?? "");
}

/**
 * Splits rows into the current ones, in their order, and the obsolete ones,
 * the most recently obsoleted first (ties keep their order).
 *
 * @param rows - the rows, in list order
 * @returns `current` and `obsolete`
 */
export function splitObsolete<T extends Lifecycle>(
  rows: readonly T[],
): { current: T[]; obsolete: T[] } {
  return {
    current: rows.filter(isCurrent),
    obsolete: rows.filter((row) => !isCurrent(row)).sort(bySinceDesc),
  };
}

/**
 * Splits rows that name a deck by that deck's state: a row whose deck is
 * obsolete is obsolete; a row with no deck, or with a deck `decks` doesn't
 * list, stays current.
 *
 * @param rows - the rows, in list order
 * @param decks - the decks the rows may name
 * @returns `current` and `obsolete`, each in list order
 */
export function splitByDeck<T extends { deckId: string | null }>(
  rows: readonly T[],
  decks: readonly LifecycleDeck[],
): { current: T[]; obsolete: T[] } {
  const retired = new Set(decks.filter((deck) => !isCurrent(deck)).map((deck) => deck.id));
  return {
    current: rows.filter((row) => row.deckId === null || !retired.has(row.deckId)),
    obsolete: rows.filter((row) => row.deckId !== null && retired.has(row.deckId)),
  };
}

/**
 * Groups the rows that name an obsolete deck by that deck, the most
 * recently obsoleted deck first.
 *
 * @param rows - the rows, in list order
 * @param decks - the decks the rows may name
 * @returns one group per obsolete deck some row names, its rows in list order
 */
export function groupByObsoleteDeck<T extends { deckId: string | null }, D extends LifecycleDeck>(
  rows: readonly T[],
  decks: readonly D[],
): Array<{ deck: D; rows: T[] }> {
  return splitObsolete(decks)
    .obsolete.map((deck) => ({ deck, rows: rows.filter((row) => row.deckId === deck.id) }))
    .filter((group) => group.rows.length > 0);
}
```

- [ ] **Step 4: The notice and the section**

Create `apps/web/src/components/ObsoleteNotice.tsx`:

```tsx
import type { ReactNode } from "react";
import type { SourceIndex } from "../lib/sources";
import { SourceChips } from "./SourceChips";

/** Props for {@link ObsoleteNotice}. */
export interface ObsoleteNoticeProps {
  /** Since when the item is obsolete, `YYYY-MM-DD`. */
  since: string;
  /** Why; null renders no reason. */
  reason: string | null;
  /** The ids of the sources that say why. */
  sources: readonly string[];
  /** Id → URL/title for the source chips. */
  sourceIndex: SourceIndex;
  /** What superseded the item, e.g. a link to the deck that did. */
  superseded?: ReactNode;
}

/**
 * The line that heads an obsolete item: since when, why, what superseded
 * it, and the sources that say so.
 *
 * @param props - the date, the reason, its sources, the source index and the successor
 * @returns the notice
 */
export function ObsoleteNotice({ since, reason, sources, sourceIndex, superseded }: ObsoleteNoticeProps) {
  return (
    <div className="obsolete-notice" role="note">
      <b>Obsolete since {since}</b>
      {reason ? <>: {reason}</> : null}
      {superseded ? <> Superseded by {superseded}.</> : null}
      {sources.length ? " " : null}
      <SourceChips ids={sources} sources={sourceIndex} />
    </div>
  );
}
```

Create `apps/web/src/components/ObsoleteSection.tsx`:

```tsx
import type { ReactNode } from "react";

/** Props for {@link ObsoleteSection}. */
export interface ObsoleteSectionProps {
  /** The section's element id, which a contents list links to. */
  id: string;
  /** The most recent `obsoleteSince` among its items; null renders nothing. */
  latest: string | null;
  /** Renders the section open, e.g. when the address names an item inside it. */
  open?: boolean;
  /** The obsolete items, the most recently obsoleted first. */
  children: ReactNode;
}

/**
 * The collapsed section that ends a list page with its obsolete items,
 * dated by the latest of them.
 *
 * @param props - the id, the latest date, whether it starts open, and the items
 * @returns the section, or null when there is nothing obsolete
 */
export function ObsoleteSection({ id, latest, open = false, children }: ObsoleteSectionProps) {
  if (latest === null) return null;
  return (
    <details className="obsolete" id={id} open={open}>
      <summary>
        <span className="label">Obsolete</span> <span className="muted">· latest {latest}</span>
      </summary>
      <div className="obsolete-body">{children}</div>
    </details>
  );
}
```

Create `apps/web/src/styles/obsolete.css`:

```css
/* The obsolete lifecycle: the collapsed section that ends a list page, and
   the notice that heads an obsolete item. Colours come from tokens.css only. */
details.obsolete {
  margin-top: var(--sp-5);
  border-top: 1px solid var(--line);
  padding-top: var(--sp-3);
}
details.obsolete > summary {
  cursor: pointer;
  width: fit-content;
}
details.obsolete .obsolete-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-top: var(--sp-3);
}
.obsolete-notice {
  border-left: 3px solid var(--warn);
  padding: 2px 0 2px var(--sp-3);
  color: var(--ink-2);
  font-size: var(--fs-s);
}
```

In `apps/web/src/main.tsx`, add `import "./styles/obsolete.css";` after the dungeon stylesheet.

- [ ] **Step 5: The `current` query option**

In `apps/web/src/api/queries.ts`, after `ModeScope`:

```ts
/** Options of a list whose rows carry the obsolete lifecycle. */
export interface LifecycleOptions {
  /** Asks for the current rows only (`?current=true`); every row otherwise. */
  current?: boolean;
}
```

Replace the four factories (their JSDoc gains `@param options - \`current: true\` asks for the current rows only`):

```ts
export const decksQuery = (scope?: ModeScope, options: LifecycleOptions = {}) =>
  queryOptions({
    queryKey: ["decks", { ...scopeKey(scope), current: options.current ?? false }],
    queryFn: () =>
      parseResponse(
        api.decks.$get({
          query: { mode: scope?.mode, current: options.current ? "true" : undefined },
        }),
      ),
  });
```

```ts
export const runeBuildsQuery = (scope?: ModeScope, deck?: string, options: LifecycleOptions = {}) =>
  queryOptions({
    queryKey: [
      "rune-builds",
      { ...scopeKey(scope), deck: deck ?? null, current: options.current ?? false },
    ],
    queryFn: () =>
      parseResponse(
        api["rune-builds"].$get({
          query: { mode: scope?.mode, deck, current: options.current ? "true" : undefined },
        }),
      ),
  });
```

```ts
export const gearRecsQuery = (scope?: ModeScope, options: LifecycleOptions = {}) =>
  queryOptions({
    queryKey: ["gear-recs", { ...scopeKey(scope), current: options.current ?? false }],
    queryFn: () =>
      parseResponse(
        api["gear-recs"].$get({
          query: { mode: scope?.mode, current: options.current ? "true" : undefined },
        }),
      ),
  });
```

```ts
export const countersQuery = (scope?: ModeScope, options: LifecycleOptions = {}) =>
  queryOptions({
    queryKey: ["counters", { ...scopeKey(scope), current: options.current ?? false }],
    queryFn: () =>
      parseResponse(
        api.counters.$get({
          query: { mode: scope?.mode, current: options.current ? "true" : undefined },
        }),
      ),
  });
```

`deckQuery(id)` (one deck) is unchanged.

- [ ] **Step 6: Run the tests**

Run: `pnpm vitest run apps/web/test/obsolete-lib.test.ts`
Expected: PASS.

Run: `pnpm vitest run apps/web/test/obsolete-components.test.tsx`
Expected: PASS.

Run: `pnpm vitest run apps/web/test/modes.test.ts`
Expected: PASS.

- [ ] **Step 7: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Run: `git add apps/web/src/lib/obsolete.ts apps/web/src/components/ObsoleteNotice.tsx apps/web/src/components/ObsoleteSection.tsx apps/web/src/styles/obsolete.css apps/web/test/obsolete-lib.test.ts apps/web/test/obsolete-components.test.tsx`

Message:

```
feat(web): the pieces every list page's Obsolete section is built from

Pure helpers split a list into current and obsolete rows (newest first)
and rows naming a deck by the deck's state; ObsoleteNotice heads an
obsolete item with since, reason, successor and sources; ObsoleteSection
is the collapsed, dated <details> that ends a list page. The list
queries take current: true, which sends ?current=true and caches apart.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- apps/web/src apps/web/test`

---

### Task 7: Web: the decks and teams pages, the deck's notice, the header count

**Files:**
- Modify: `apps/web/src/views/DeckCard.tsx` (`DeckCard`)
- Modify: `apps/web/src/views/DecksView.tsx` (`DecksView`)
- Modify: `apps/web/src/routes/__root.tsx` (`RootLayout`'s deck count)
- Test: `apps/web/test/pvp-views.test.tsx`, `apps/web/test/app-shell.test.tsx`

**Interfaces:**
- Consumes: `splitObsolete`, `isCurrent` (Task 6); `ObsoleteNotice`, `ObsoleteSection` (Task 6); `Deck.obsoleteSince`, `obsoleteReason`, `obsoleteSources`, `supersededBy` (Tasks 2 and 5).
- Produces: `DeckCard` prop `deckName?: (id: string) => string`, which names the successor in an obsolete deck's notice; the decks page's Obsolete section has id `decks-obsolete` and opens when the address's hash is an obsolete deck's card id.

- [ ] **Step 1: Write the failing tests**

In `apps/web/test/pvp-views.test.tsx`, after the `DECKS` constant:

```ts
const RANGED = deck("ranged", 4, "Five-ranged deck", {
  status: "legacy",
  obsoleteSince: "2026-10-12",
  obsoleteReason: "The patch cut ranged damage.",
  obsoleteSources: ["dc:75148"],
  supersededBy: "rye",
});
```

and a describe block after "PvP teams":

```ts
describe("PvP teams, obsolete", () => {
  const withRanged = { "/api/decks?mode=arena": { body: [...DECKS, RANGED] } };

  it("lists the current teams, then a collapsed, dated Obsolete section with the obsolete team's full card under its notice", async () => {
    await renderAt("/arena/teams", ARENA, withRanged);
    const section = (await panel().findByText("Obsolete", { selector: "summary .label" })).closest(
      "details",
    )!;
    expect(section).not.toHaveAttribute("open");
    expect(section.querySelector("summary")).toHaveTextContent("latest 2026-10-12");
    const card = section.querySelector("article#deck-ranged")!;
    expect(card).toHaveTextContent("Five-ranged deck");
    const notice = within(card as HTMLElement).getByRole("note");
    expect(notice).toHaveTextContent(
      "Obsolete since 2026-10-12: The patch cut ranged damage. Superseded by Rye one-carry deck.",
    );
    expect(within(notice).getByRole("link", { name: "Rye one-carry deck" })).toHaveAttribute(
      "href",
      "#deck-rye",
    );
    expect(within(card as HTMLElement).getByText("legacy")).toHaveClass("pill", "legacy");
    const outside = [...document.querySelectorAll("main article.card")].filter(
      (a) => !section.contains(a),
    );
    expect(outside.map((a) => a.id)).toEqual(["deck-rye", "deck-bari", "deck-crepe"]);
    const toc = panel().getByRole("navigation", { name: "On this page" });
    expect(within(toc).getByRole("link", { name: "Obsolete" })).toHaveAttribute(
      "href",
      "#decks-obsolete",
    );
  });

  it("opens the Obsolete section when the address names an obsolete team's card", async () => {
    await renderAt("/arena/teams#deck-ranged", ARENA, withRanged);
    const section = (await panel().findByText("Obsolete", { selector: "summary .label" })).closest(
      "details",
    )!;
    expect(section).toHaveAttribute("open");
  });

  it("says so when every team is obsolete", async () => {
    await renderAt("/arena/teams", ARENA, { "/api/decks?mode=arena": { body: [RANGED] } });
    expect(await panel().findByText("No current decks.")).toHaveClass("empty");
    expect(document.querySelector("details.obsolete article#deck-ranged")).not.toBeNull();
  });
});
```

In `apps/web/test/app-shell.test.tsx`, add:

```ts
  it("counts only the current decks in the header", async () => {
    await renderAt("/conquest", {
      ...API,
      "/api/decks?mode=guild_conquest": {
        body: [...DECKS.slice(0, 2), { id: "herb", obsoleteSince: "2026-10-12" }],
      },
    });
    await waitFor(() => expect(stamp().Decks).toBe("2"));
  });
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run apps/web/test/pvp-views.test.tsx`
Expected: FAIL: no Obsolete section; the obsolete card renders among the current ones.

Run: `pnpm vitest run apps/web/test/app-shell.test.tsx`
Expected: FAIL: the stamp says `3`.

- [ ] **Step 3: Head an obsolete deck's card with its notice**

In `apps/web/src/views/DeckCard.tsx`, import `ObsoleteNotice` from `../components/ObsoleteNotice`. Change the component's signature and JSDoc, and its opening:

```tsx
/**
 * One deck as a card: formation (or plain lineup when it has no slots),
 * levels, ATK order, pets, perks, formation, swaps, RNG, unorthodox flags
 * and sources. An obsolete deck's card renders in full, headed with its
 * obsolete notice and a link to the deck that superseded it.
 *
 * @param props - the deck, the source index, and a namer for the successor
 * @returns the card
 */
export function DeckCard({
  deck: d,
  sources,
  deckName,
}: {
  deck: Deck;
  sources: SourceIndex;
  /** Names a deck by id, for the successor in an obsolete deck's notice; the id when absent. */
  deckName?: (id: string) => string;
}) {
```

and as the article's first child:

```tsx
    <article className="card" id={deckId(d)}>
      {d.obsoleteSince ? (
        <ObsoleteNotice
          since={d.obsoleteSince}
          reason={d.obsoleteReason}
          sources={d.obsoleteSources}
          sourceIndex={sources}
          superseded={
            d.supersededBy ? (
              <a href={`#${deckId({ id: d.supersededBy })}`}>
                {deckName?.(d.supersededBy) ?? d.supersededBy}
              </a>
            ) : null
          }
        />
      ) : null}
      <div className="card-head">
```

- [ ] **Step 4: Split the decks page**

Replace `apps/web/src/views/DecksView.tsx`'s component:

```tsx
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useSourceIndex } from "../api/hooks";
import { decksQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { LineupLegend } from "../components/Lineup";
import { ObsoleteSection } from "../components/ObsoleteSection";
import { QueryResult } from "../components/QueryResult";
import { TocLayout } from "../components/TocLayout";
import { splitObsolete } from "../lib/obsolete";
import { DeckCard, deckId } from "./DeckCard";
import { ModeViewHeader } from "./ModeViewHeader";

/** The id of the page's Obsolete section. */
const OBSOLETE_ID = "decks-obsolete";

/**
 * A mode's decks, each as a card, under the mode's heading and the slot
 * legend, with an "On this page" list linking to each current card and to
 * the Obsolete section. The obsolete decks end the page in that collapsed
 * section, each card in full under its notice; it opens when the address
 * names one of them. "No decks recorded yet." when there are none, and
 * "No current decks." above the section when every deck is obsolete.
 *
 * @param mode - the mode whose decks and copy the view shows
 * @returns the decks view
 */
export function DecksView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const decks = useQuery(decksQuery(mode.scope));
  const hash = useLocation({ select: (l) => l.hash.replace(/^#/, "") });
  return (
    <QueryResult query={decks} resource="decks">
      {(rows) => {
        if (!rows.length) return <EmptyState>No decks recorded yet.</EmptyState>;
        const { current, obsolete } = splitObsolete(rows);
        const names = new Map(rows.map((d) => [d.id, d.nameEn] as const));
        /**
         * Names a deck by id.
         *
         * @param id - the deck's id
         * @returns its English name, or the id when it isn't listed
         */
        const deckName = (id: string) => names.get(id) ?? id;
        const toc = [
          ...current.map((d) => ({ id: deckId(d), label: d.nameEn })),
          ...(obsolete.length ? [{ id: OBSOLETE_ID, label: "Obsolete" }] : []),
        ];
        return (
          <>
            <ModeViewHeader mode={mode} view="decks" fallbackTitle="Decks" />
            <TocLayout items={toc}>
              <LineupLegend />
              {current.length ? (
                current.map((d) => <DeckCard key={d.id} deck={d} sources={sources} />)
              ) : (
                <EmptyState>No current decks.</EmptyState>
              )}
              <ObsoleteSection
                id={OBSOLETE_ID}
                latest={obsolete[0]?.obsoleteSince ?? null}
                open={obsolete.some((d) => deckId(d) === hash)}
              >
                {obsolete.map((d) => (
                  <DeckCard key={d.id} deck={d} sources={sources} deckName={deckName} />
                ))}
              </ObsoleteSection>
            </TocLayout>
          </>
        );
      }}
    </QueryResult>
  );
}
```

- [ ] **Step 5: Count only the current decks in the header**

In `apps/web/src/routes/__root.tsx`, import `isCurrent` from `../lib/obsolete` and change the stamp's value:

```ts
    decks: decks.data?.filter(isCurrent).length,
```

- [ ] **Step 6: Run the tests**

Run: `pnpm vitest run apps/web/test/pvp-views.test.tsx`
Expected: PASS.

Run: `pnpm vitest run apps/web/test/app-shell.test.tsx`
Expected: PASS.

Run: `pnpm vitest run apps/web/test/conquest-views.test.tsx`
Expected: PASS (the conquest deck tests are unchanged: no deck is obsolete).

- [ ] **Step 7: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Message:

```
feat(web): obsolete decks end the decks page, each card under its notice

The decks and teams pages list the current decks as before and end with
the collapsed Obsolete section, where each obsolete deck still renders
in full, headed with since, reason, sources and a link to its successor.
Other pages already link a deck as /<mode>/teams#deck-<id>, so the
section opens when the address names a card inside it. The header's
deck count leaves obsolete decks out.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- apps/web/src/views/DeckCard.tsx apps/web/src/views/DecksView.tsx apps/web/src/routes/__root.tsx apps/web/test/pvp-views.test.tsx apps/web/test/app-shell.test.tsx`

---

### Task 8: Web: the rune and gear pages

**Files:**
- Modify: `apps/web/src/views/RunesView.tsx` (`RunesView`)
- Modify: `apps/web/src/views/GearView.tsx` (`GearView`)
- Test: `apps/web/test/pvp-views.test.tsx`

**Interfaces:**
- Consumes: `splitObsolete` (Task 6), `ObsoleteNotice`, `ObsoleteSection` (Task 6), `GEAR_SLOT_NAMES` (`components/GearBoard.tsx`), `RuneBuild.obsoleteSources`, `GearRec.obsoleteSources` (Task 5).
- Produces: the runes page's Obsolete section (`runes-obsolete`) and the gear page's (`gear-obsolete`).

- [ ] **Step 1: Write the failing tests**

In `apps/web/test/pvp-views.test.tsx`, add a describe block. Build the obsolete rows from the file's existing `RUNES` and `GEAR` fixtures:

```ts
describe("PvP runes and gear, obsolete", () => {
  const retired = {
    obsoleteSince: "2026-10-12",
    obsoleteReason: "The patch changed the rune's stat.",
    obsoleteSources: ["dc:75148"],
  };
  const oldRune = { ...RUNES[0]!, id: 90, lines: "CRIT ×5", ...retired };
  const oldGear = { ...GEAR[0]!, id: 91, substats: "HP only", ...retired };

  it("keeps an obsolete rune build out of the cards and lists it in the Obsolete section under its notice", async () => {
    await renderAt("/arena/runes", ARENA, { "/api/rune-builds?mode=arena": { body: [...RUNES, oldRune] } });
    const section = (await panel().findByText("Obsolete", { selector: "summary .label" })).closest(
      "details",
    )!;
    expect(section.querySelector("summary")).toHaveTextContent("latest 2026-10-12");
    expect(within(section).getByRole("note")).toHaveTextContent(
      "Obsolete since 2026-10-12: The patch changed the rune's stat.",
    );
    expect(section).toHaveTextContent("CRIT ×5");
    const outside = [...document.querySelectorAll("main .rune-card")].filter((c) => !section.contains(c));
    expect(outside.some((c) => (c.textContent ?? "").includes("CRIT ×5"))).toBe(false);
  });

  it("keeps an obsolete gear rec off the board and lists it in the Obsolete section under its notice", async () => {
    await renderAt("/arena/gear", ARENA, { "/api/gear-recs?mode=arena": { body: [...GEAR, oldGear] } });
    const section = (await panel().findByText("Obsolete", { selector: "summary .label" })).closest(
      "details",
    )!;
    expect(section).toHaveTextContent("HP only");
    expect(within(section).getByRole("note")).toHaveTextContent("Obsolete since 2026-10-12");
    expect(document.querySelector(".gearboard")).not.toHaveTextContent("HP only");
  });

  it("shows no Obsolete section when nothing is obsolete", async () => {
    await renderAt("/arena/gear", ARENA);
    await waitFor(() => expect(document.querySelector(".gearboard")).not.toBeNull());
    expect(document.querySelector("details.obsolete")).toBeNull();
  });
});
```

If `RUNES` or `GEAR` in that file has a different shape (for example no element whose substats text renders as-is), pick the fixture fields the existing gear and runes tests assert on.

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run apps/web/test/pvp-views.test.tsx`
Expected: FAIL: no Obsolete section on either page.

- [ ] **Step 3: The runes page**

In `apps/web/src/views/RunesView.tsx`, import `ObsoleteNotice`, `ObsoleteSection` and `splitObsolete`. Replace the render function's body after `const kept = applyFilters(rows, filter, select);`:

```tsx
          const { current, obsolete } = splitObsolete(kept);
          return (
            <>
              <TableTools filter={filter} select={select} />
              {current.length ? (
                <div className="grid g2">
                  {current.map((b) => (
                    <RuneCard
                      key={b.id}
                      build={b}
                      sources={sources}
                      headingLevel={3}
                      deckName={deckName}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState>
                  {rows.length === 0
                    ? "No rune builds recorded yet."
                    : kept.length === 0
                      ? "Nothing matches."
                      : "No current rune builds."}
                </EmptyState>
              )}
              <ObsoleteSection id="runes-obsolete" latest={obsolete[0]?.obsoleteSince ?? null}>
                {obsolete.map((b) => (
                  <div key={b.id} className="obsolete-item">
                    <ObsoleteNotice
                      since={b.obsoleteSince!}
                      reason={b.obsoleteReason}
                      sources={b.obsoleteSources}
                      sourceIndex={sources}
                    />
                    <RuneCard build={b} sources={sources} headingLevel={3} deckName={deckName} />
                  </div>
                ))}
              </ObsoleteSection>
            </>
          );
```

Add to the view's JSDoc: "Obsolete builds that pass the filters end the page in the collapsed Obsolete section, each card under its notice."

- [ ] **Step 4: The gear page**

In `apps/web/src/views/GearView.tsx`, import `GEAR_SLOT_NAMES`, `ObsoleteNotice`, `ObsoleteSection` and `splitObsolete`, and replace the render function:

```tsx
        {(rows) => {
          const { current, obsolete } = splitObsolete(rows);
          const general = generalGear(current);
          return (
            <>
              <GearBoard gear={current} sources={sources} />
              {general.length ? (
                <div className="card">
                  <h3>General gear notes</h3>
                  {general.map((g) => (
                    <div key={g.id}>
                      <b>{g.substats}</b>
                      {g.why ? (
                        <>
                          {" · "}
                          <span className="muted">{g.why}</span>
                        </>
                      ) : null}{" "}
                      <SourceChips ids={g.sources} sources={sources} />
                    </div>
                  ))}
                </div>
              ) : null}
              <ObsoleteSection id="gear-obsolete" latest={obsolete[0]?.obsoleteSince ?? null}>
                {obsolete.map((g) => (
                  <div key={g.id} className="obsolete-item">
                    <ObsoleteNotice
                      since={g.obsoleteSince!}
                      reason={g.obsoleteReason}
                      sources={g.obsoleteSources}
                      sourceIndex={sources}
                    />
                    <div>
                      <b>{g.substats}</b>{" "}
                      <span className="muted">
                        · {(GEAR_SLOT_NAMES as Readonly<Record<string, string>>)[g.slot] ?? "General"} ·{" "}
                        {g.context}
                      </span>
                    </div>
                    {g.why ? <div className="muted">{g.why}</div> : null}
                    <SourceChips ids={g.sources} sources={sources} />
                  </div>
                ))}
              </ObsoleteSection>
            </>
          );
        }}
```

Add to the view's JSDoc: "Obsolete recommendations stay off the board; they end the page in the collapsed Obsolete section, each under its notice."

- [ ] **Step 5: Run the tests**

Run: `pnpm vitest run apps/web/test/pvp-views.test.tsx`
Expected: PASS.

Run: `pnpm vitest run apps/web/test/conquest-views.test.tsx`
Expected: PASS.

- [ ] **Step 6: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Message:

```
feat(web): obsolete rune builds and gear recs end their pages

The runes and gear pages show the current recommendations as before,
and list the obsolete ones in the collapsed Obsolete section, each under
its notice. The runes page's filters apply to both.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- apps/web/src/views/RunesView.tsx apps/web/src/views/GearView.tsx apps/web/test/pvp-views.test.tsx`

---

### Task 9: Web: the counters page counts current decks only

**Files:**
- Modify: `apps/web/src/views/CountersView.tsx` (`CounterCard`, new `matchups`, `CountersView`)
- Test: `apps/web/test/pvp-views.test.tsx`

**Interfaces:**
- Consumes: `isCurrent` (Task 6), `ObsoleteNotice`, `ObsoleteSection` (Task 6), `Counter.obsoleteSince`, `obsoleteReason`, `obsoleteSources`.
- Produces: `CounterCard` prop `notice?: ReactNode`; the matrix and the edge list show current edges between current decks; the Obsolete section (`counters-obsolete`) lists obsolete edges under their own notice and current edges that name an obsolete deck under that deck's.

- [ ] **Step 1: Write the failing tests**

In `apps/web/test/pvp-views.test.tsx`, inside `describe("PvP counters", …)`:

```ts
  it("leaves obsolete teams and edges out of the matrix and lists the edges in the Obsolete section", async () => {
    const retiredEdge = {
      ...COUNTERS[0]!,
      id: 7,
      slug: "ranged-vs-rye",
      teamDeckId: "ranged",
      beatenByDeckId: "rye",
      conditions: null,
      obsoleteSince: "2026-10-12",
      obsoleteReason: "The ranged deck is gone.",
      obsoleteSources: ["dc:75148"],
    } satisfies Counter;
    const strandedEdge = {
      ...COUNTERS[1]!,
      id: 8,
      slug: "bari-vs-ranged",
      teamDeckId: "bari",
      beatenByDeckId: "ranged",
    } satisfies Counter;
    await renderAt("/arena/counters", ARENA, {
      "/api/decks?mode=arena": { body: [...DECKS, RANGED] },
      "/api/counters?mode=arena": { body: [...COUNTERS, retiredEdge, strandedEdge] },
    });
    await panel().findByRole("table", { name: /beaten by/i });
    expect(matrix().columns).toEqual(["Rye one-carry deck", "Bari–Oven deck", "Crepe–Espresso deck"]);
    expect([...document.querySelectorAll(".counter-list > [id]")].map((el) => el.id)).toEqual([
      "counter-rye-vs-bari",
      "counter-bari-vs-crepe",
      "counter-crepe-vs-rye",
    ]);
    const section = document.querySelector("details.obsolete")!;
    expect(section.querySelector("summary")).toHaveTextContent("latest 2026-10-12");
    const retired = section.querySelector("#counter-ranged-vs-rye")!;
    expect(within(retired as HTMLElement).getByRole("note")).toHaveTextContent(
      "Obsolete since 2026-10-12: The ranged deck is gone.",
    );
    const stranded = section.querySelector("#counter-bari-vs-ranged")!;
    expect(within(stranded as HTMLElement).getByRole("note")).toHaveTextContent(
      "Obsolete since 2026-10-12: Five-ranged deck is obsolete: The patch cut ranged damage.",
    );
  });
```

(`RANGED` is the constant Task 7 added at the top of this file.)

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm vitest run apps/web/test/pvp-views.test.tsx`
Expected: FAIL: the matrix has a "Five-ranged deck" column and the edge list has the obsolete edges.

- [ ] **Step 3: Split the edges**

In `apps/web/src/views/CountersView.tsx`, import `type { ReactNode }` from `react`, `ObsoleteNotice`, `ObsoleteSection` and `isCurrent`. Give `CounterCard` a notice:

```tsx
/**
 * One edge as a card: "team is beaten by team", its conditions, mechanism,
 * confidence and sources, headed by `notice` when given.
 *
 * @param props - the edge, the deck lookup, the source index and an optional notice
 * @returns the card
 */
function CounterCard({
  edge,
  deck,
  sources,
  notice,
}: {
  edge: Counter;
  /** Finds a listed deck by id. */
  deck: (id: string) => DeckName | undefined;
  sources: SourceIndex;
  /** What heads the card, e.g. an obsolete notice. */
  notice?: ReactNode;
}) {
  return (
    <article className="card" id={edgeId(edge)}>
      {notice}
      <div className="card-head">
```

(the rest unchanged). Add, after `byMatrixOrder`:

```tsx
/** The id of the page's Obsolete section. */
const OBSOLETE_ID = "counters-obsolete";

/** An edge the Obsolete section lists, with what its notice says. */
interface RetiredEdge {
  edge: Counter;
  since: string;
  reason: string | null;
  sources: readonly string[];
}

/**
 * Splits edges into the matrix's, current edges between current decks, and
 * the Obsolete section's: obsolete edges, under their own reason, and
 * current edges that name an obsolete deck, under that deck's; the most
 * recently obsoleted first.
 *
 * @param edges - every edge, in list order
 * @param decks - every deck of the mode
 * @returns `live` in list order, and `retired`
 */
function matchups(
  edges: readonly Counter[],
  decks: readonly Deck[],
): { live: Counter[]; retired: RetiredEdge[] } {
  const obsoleteDecks = new Map(decks.filter((d) => !isCurrent(d)).map((d) => [d.id, d] as const));
  const live: Counter[] = [];
  const retired: RetiredEdge[] = [];
  for (const edge of edges) {
    if (edge.obsoleteSince) {
      retired.push({
        edge,
        since: edge.obsoleteSince,
        reason: edge.obsoleteReason,
        sources: edge.obsoleteSources,
      });
      continue;
    }
    const gone = obsoleteDecks.get(edge.teamDeckId) ?? obsoleteDecks.get(edge.beatenByDeckId);
    if (gone?.obsoleteSince) {
      retired.push({
        edge,
        since: gone.obsoleteSince,
        reason: `${gone.nameEn} is obsolete${gone.obsoleteReason ? `: ${gone.obsoleteReason}` : ""}`,
        sources: gone.obsoleteSources,
      });
    } else {
      live.push(edge);
    }
  }
  retired.sort((a, b) => b.since.localeCompare(a.since));
  return { live, retired };
}
```

Replace the component's body from `const decks = …`:

```tsx
export function CountersView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const counters = useQuery(countersQuery(mode.scope));
  const decks = useQuery(decksQuery(mode.scope)).data ?? [];
  const current = decks.filter(isCurrent);
  /**
   * Finds a listed deck by id.
   *
   * @param id - the deck's id
   * @returns the deck, or `undefined` if it isn't listed
   */
  const deck = (id: string) => decks.find((d) => d.id === id);
  const order = new Map(current.map((d, i) => [d.id, i] as const));

  return (
    <>
      <ModeViewHeader mode={mode} view="counters" fallbackTitle="Counters" />
      <QueryResult query={counters} resource="counters">
        {(edges) => {
          if (!edges.length) return <EmptyState>No counters recorded yet.</EmptyState>;
          const { live, retired } = matchups(edges, decks);
          const toc = [...TOC, ...(retired.length ? [{ id: OBSOLETE_ID, label: "Obsolete" }] : [])];
          return (
            <TocLayout items={toc}>
              {live.length ? (
                <>
                  <div className="grid" id={TOC[0].id}>
                    <CounterMatrix edges={live} decks={current} href={(e) => `#${edgeId(e)}`} />
                    <CounterLegend />
                  </div>
                  <h3 id={TOC[1].id}>Every edge</h3>
                  <div className="counter-list">
                    {[...live].sort(byMatrixOrder(order)).map((e) => (
                      <CounterCard key={e.id} edge={e} deck={deck} sources={sources} />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState>No current counters.</EmptyState>
              )}
              <ObsoleteSection id={OBSOLETE_ID} latest={retired[0]?.since ?? null}>
                {retired.map((r) => (
                  <CounterCard
                    key={r.edge.id}
                    edge={r.edge}
                    deck={deck}
                    sources={sources}
                    notice={
                      <ObsoleteNotice
                        since={r.since}
                        reason={r.reason}
                        sources={r.sources}
                        sourceIndex={sources}
                      />
                    }
                  />
                ))}
              </ObsoleteSection>
            </TocLayout>
          );
        }}
      </QueryResult>
    </>
  );
}
```

Update the view's JSDoc: "The matrix and the edge list count current decks only: obsolete edges, and current edges that name an obsolete deck, end the page in the collapsed Obsolete section, each under its notice."

- [ ] **Step 4: Run the tests**

Run: `pnpm vitest run apps/web/test/pvp-views.test.tsx`
Expected: PASS, the existing counters tests included.

- [ ] **Step 5: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Message:

```
feat(web): the counter matrix counts current decks only

The matrix and the edge list now leave out obsolete decks and every edge
that is obsolete or names an obsolete deck. Those edges end the page in
the Obsolete section: an obsolete edge under its own reason, a current
edge written through the API on an obsolete deck under that deck's (the
import refuses one).
```

Run: `git commit -F .git/crumble-commit-msg.txt -- apps/web/src/views/CountersView.tsx apps/web/test/pvp-views.test.tsx`

---

### Task 10: Web: score rankings count current decks only

The spec's "ranking views" in the app are the ones that order documented results by damage or score and name a deck: the Guild Conquest scores table and chart, and the Crumble Dungeon runs board. Their results on an obsolete deck move to an Obsolete section, grouped by deck under the deck's notice. The stage clears board orders attempts by stage reached, not by a deck's strength, and stays whole. `/api/usage` rows name no deck (a usage figure is a dated share of a sample), so the usage page has nothing to exclude.

**Files:**
- Create: `apps/web/src/views/ObsoleteDeckRows.tsx`
- Modify: `apps/web/src/views/ScoresView.tsx` (`PARTS`, `ScoresView`)
- Modify: `apps/web/src/views/DungeonRunsView.tsx` (`DungeonRunsView`)
- Test: `apps/web/test/scores-view.test.tsx`, `apps/web/test/dungeon-views.test.tsx`

**Interfaces:**
- Consumes: `splitByDeck`, `groupByObsoleteDeck` (Task 6), `ObsoleteSection`, `ObsoleteNotice` (Task 6).
- Produces: `<ObsoleteDeckRows groups columns rowKey sources />`, one `<section aria-label="<deck>, obsolete">` per obsolete deck with its notice and its rows in the page's table layout.

- [ ] **Step 1: Write the failing tests**

In `apps/web/test/scores-view.test.tsx`:

```ts
describe("scores of obsolete decks", () => {
  const withRanged: Record<string, Canned> = {
    ...API,
    "/api/decks?mode=guild_conquest": {
      body: [
        ...DECKS,
        {
          id: "ranged",
          nameEn: "Ranged deck",
          obsoleteSince: "2026-10-12",
          obsoleteReason: "Patched out.",
          obsoleteSources: ["dc:76135"],
        },
      ],
    },
    "/api/scores": {
      body: [...SCORES, score({ id: 4, damageG: 2000, powerG: 30, deckId: "ranged", ratio: 66 })],
    },
  };

  it("ranks by damage among current decks only, and lists an obsolete deck's scores under its notice", async () => {
    await renderRoute("/conquest/scores", withRanged);
    await waitFor(() => expect(bodyRows(scoresTable())).toHaveLength(3));
    expect(bodyRows(scoresTable()).map((r) => r[0])).toEqual(["1.31T", "1T", "867G"]);
    const group = screen.getByRole("region", { name: "Ranged deck, obsolete", hidden: true });
    expect(bodyRows(group).map((r) => r[0])).toEqual(["2T"]);
    expect(within(group).getByRole("note", { hidden: true })).toHaveTextContent(
      "Obsolete since 2026-10-12: Patched out.",
    );
    expect(group.closest("details")).not.toHaveAttribute("open");
  });
});
```

In `apps/web/test/dungeon-views.test.tsx`:

```ts
describe("the runs board's obsolete teams", () => {
  it("keeps an obsolete team's runs out of the ranking and lists them under the team's notice", async () => {
    const retiredDeck: Deck = {
      ...DECK,
      id: "dungeon-old-beam",
      nameEn: "Old beam lineup",
      obsoleteSince: "2026-10-12",
      obsoleteReason: "A patch capped the beam.",
      obsoleteSources: ["dc:77306"],
    };
    await renderRoute(
      "/dungeon/runs",
      {
        ...API,
        "/api/decks?mode=crumble_dungeon": { body: [DECK, retiredDeck] },
        "/api/dungeon-runs": { body: [run(5, "run-old", 400, { deckId: retiredDeck.id }), ...RUNS] },
      },
      { mode: DUNGEON },
    );
    const ranked = await screen.findByRole("region", { name: "Ranked runs" });
    await waitFor(() =>
      expect(bodyRows(ranked).map((r) => [r[0], r[1]])).toEqual([
        ["1", "379.3G"],
        ["2", "244.7G"],
        ["3", "219.5G"],
      ]),
    );
    const group = screen.getByRole("region", { name: "Old beam lineup, obsolete", hidden: true });
    expect(bodyRows(group).map((r) => [r[0], r[1]])).toEqual([["–", "400G"]]);
    expect(within(group).getByRole("note", { hidden: true })).toHaveTextContent(
      "Obsolete since 2026-10-12: A patch capped the beam.",
    );
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run apps/web/test/scores-view.test.tsx`
Expected: FAIL: the table leads with `2T`.

Run: `pnpm vitest run apps/web/test/dungeon-views.test.tsx`
Expected: FAIL: the 400G run ranks first.

- [ ] **Step 3: The grouped rows**

Create `apps/web/src/views/ObsoleteDeckRows.tsx`:

```tsx
import type { Key } from "react";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { ObsoleteNotice } from "../components/ObsoleteNotice";
import type { SourceIndex } from "../lib/sources";

/** An obsolete deck as its group reads it. */
export interface RetiredDeck {
  id: string;
  nameEn: string;
  obsoleteSince?: string | null;
  obsoleteReason?: string | null;
  obsoleteSources?: readonly string[];
}

/** Props for {@link ObsoleteDeckRows}. */
export interface ObsoleteDeckRowsProps<T> {
  /** Each obsolete deck's rows, the most recently obsoleted deck first (see `groupByObsoleteDeck`). */
  groups: ReadonlyArray<{ deck: RetiredDeck; rows: readonly T[] }>;
  /** The columns of the page's ranked table. */
  columns: Column<T>[];
  /** Keys a row. */
  rowKey: (row: T, index: number) => Key;
  /** Id → URL/title for the source chips. */
  sources: SourceIndex;
}

/**
 * The results of each obsolete deck, set apart from a page's ranking: the
 * deck's name, its obsolete notice, and its rows in the page's table layout.
 *
 * @param props - the groups, the table's columns and row key, and the source index
 * @returns one labelled section per deck
 */
export function ObsoleteDeckRows<T>({ groups, columns, rowKey, sources }: ObsoleteDeckRowsProps<T>) {
  return (
    <>
      {groups.map(({ deck, rows }) => (
        <section key={deck.id} aria-label={`${deck.nameEn}, obsolete`}>
          <h4>{deck.nameEn}</h4>
          <ObsoleteNotice
            since={deck.obsoleteSince ?? ""}
            reason={deck.obsoleteReason ?? null}
            sources={deck.obsoleteSources ?? []}
            sourceIndex={sources}
          />
          <DataTable columns={columns} rows={rows} rowKey={rowKey} layout="stack" />
        </section>
      ))}
    </>
  );
}
```

- [ ] **Step 4: The scores page**

In `apps/web/src/views/ScoresView.tsx`, import `ObsoleteSection`, `groupByObsoleteDeck`, `splitByDeck` and `ObsoleteDeckRows`. Add `obsolete: "scores-obsolete",` to `PARTS`. In `ScoresView`, after `series`:

```tsx
  const allDecks = decks.data ?? [];
  const retired = scores.data
    ? groupByObsoleteDeck(scores.data, allDecks).map((g) => ({ ...g, rows: byDamage(g.rows) }))
    : [];
```

add the TOC entry after the table's:

```tsx
    ...(retired.length ? [{ id: PARTS.obsolete, label: "Obsolete" }] : []),
```

plot and rank the current decks only:

```tsx
        <QueryResult query={scores} resource="scores">
          {(rows) => <ScoreChart scores={splitByDeck(rows, allDecks).current} series={series} />}
        </QueryResult>
```

```tsx
            <DataTable
              columns={scoreColumns(series, sources)}
              rows={byDamage(splitByDeck(scores.data, allDecks).current)}
              rowKey={(s) => s.id}
              layout="stack"
            />
```

and after the table's region, before the leaderboard:

```tsx
        <ObsoleteSection id={PARTS.obsolete} latest={retired[0]?.deck.obsoleteSince ?? null}>
          <ObsoleteDeckRows
            groups={retired}
            columns={scoreColumns(series, sources)}
            rowKey={(s) => s.id}
            sources={sources}
          />
        </ObsoleteSection>
```

Add to the view's JSDoc: "The chart and the damage-ordered table hold the scores of current decks and of none; an obsolete deck's scores end the ranking in the collapsed Obsolete section, under the deck's notice."

- [ ] **Step 5: The dungeon runs board**

In `apps/web/src/views/DungeonRunsView.tsx`, import `ObsoleteSection`, `groupByObsoleteDeck`, `splitByDeck` and `ObsoleteDeckRows`. Replace the decks query:

```tsx
  const deckRows = useQuery(decksQuery(mode.scope)).data;
  const decks = deckRows ? new Map(deckRows.map((d) => [d.id, d.nameEn] as const)) : undefined;
```

In the render function, split before ranking, rank and filter the current rows only, and end with the section:

```tsx
          if (!rows.length) return <EmptyState>No runs recorded yet.</EmptyState>;
          const { current: live, obsolete: retiredRuns } = splitByDeck(rows, deckRows ?? []);
          const rank = new Map(
            live.filter((r) => r.standing === "verified").map((r, i) => [r.id, i + 1] as const),
          );
```

change `applyFilters(rows, filter, select, selects)` to `applyFilters(live, filter, select, selects)`, and after the groups (inside the fragment the function returns):

```tsx
              <ObsoleteSection
                id="runs-obsolete"
                latest={retired[0]?.deck.obsoleteSince ?? null}
              >
                <ObsoleteDeckRows
                  groups={retired}
                  columns={columns}
                  rowKey={(r) => r.id}
                  sources={sources}
                />
              </ObsoleteSection>
```

with `const retired = groupByObsoleteDeck(retiredRuns, deckRows ?? []);` declared after `groups`. Add to the view's JSDoc: "A run on an obsolete team is left out of the ranking and the filters; those runs end the board in the collapsed Obsolete section, under the team's notice."

- [ ] **Step 6: Run the tests**

Run: `pnpm vitest run apps/web/test/scores-view.test.tsx`
Expected: PASS.

Run: `pnpm vitest run apps/web/test/dungeon-views.test.tsx`
Expected: PASS.

- [ ] **Step 7: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Run: `git add apps/web/src/views/ObsoleteDeckRows.tsx`

Message:

```
feat(web): score rankings count current decks only

The Guild Conquest scores chart and table and the Crumble Dungeon runs
board rank by damage and score among current decks. A result on an
obsolete deck is still a true measurement, so it isn't dropped: it ends
the page in the Obsolete section, grouped by deck under the deck's
notice. The stage clears board ranks attempts by stage reached, not by
deck, and stays whole; usage figures name no deck.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- apps/web/src/views apps/web/test/scores-view.test.tsx apps/web/test/dungeon-views.test.tsx`

---

### Task 11: Web: the boss and Rift screens ask for current rows

The boss screen and the Rift page recommend what to run and show no Obsolete section, so they ask the API for current rows (`?current=true`), the filter the spec says the views use.

**Files:**
- Modify: `apps/web/src/views/BossView.tsx` (`BossView`), `apps/web/src/views/RiftView.tsx` (its decks query), `apps/web/src/views/RiftFindings.tsx` (its runes and decks queries)
- Test: `apps/web/test/boss-view.test.tsx`, `apps/web/test/stage-views.test.tsx`

**Interfaces:**
- Consumes: `LifecycleOptions` on `decksQuery`, `runeBuildsQuery`, `gearRecsQuery` (Task 6).

- [ ] **Step 1: Point the tests' canned API at the current rows**

In `apps/web/test/boss-view.test.tsx`, in both `FULL` and `EMPTY`, change the keys `"/api/rune-builds?mode=guild_conquest"`, `"/api/decks?mode=guild_conquest"` and `"/api/gear-recs?mode=guild_conquest"` to the same paths with `&current=true` appended. Keep a plain `"/api/decks?mode=guild_conquest"` entry too, with the same body, since the header's deck count asks for every deck. Add:

```ts
  it("asks the API for current rune builds, decks and gear only", async () => {
    await renderRoute("/conquest/boss", FULL);
    await waitFor(() => {
      const asked = vi.mocked(globalThis.fetch).mock.calls.map(([input]) => requestPath(input));
      expect(asked).toContain("/api/rune-builds?mode=guild_conquest&current=true");
      expect(asked).toContain("/api/decks?mode=guild_conquest&current=true");
      expect(asked).toContain("/api/gear-recs?mode=guild_conquest&current=true");
    });
  });
```

importing `vi` from `vitest`, `waitFor` from `@testing-library/react` and `requestPath` from `./helpers`. If the file renders through a helper instead of `renderRoute` directly, use that helper with `FULL`.

In `apps/web/test/stage-views.test.tsx`, add `"/api/decks?mode=stage&current=true": { body: DECKS }` and `"/api/rune-builds?mode=stage&current=true": { body: [] }` to the canned API next to the plain keys, and in any Rift test that overrides `"/api/decks?mode=stage"`, override the `&current=true` key the same way.

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm vitest run apps/web/test/boss-view.test.tsx`
Expected: FAIL: the screen still asks for the plain paths, which now answer 404 for runes and gear.

- [ ] **Step 3: Ask for current rows**

In `apps/web/src/views/BossView.tsx`:

```tsx
  const runes = useQuery(runeBuildsQuery(mode.scope, undefined, { current: true }));
  const decks = useQuery(decksQuery(mode.scope, { current: true }));
  const gear = useQuery(gearRecsQuery(mode.scope, { current: true }));
```

In `apps/web/src/views/RiftView.tsx`, the decks query becomes `...decksQuery(mode.scope, { current: true }),`. In `apps/web/src/views/RiftFindings.tsx`:

```tsx
  const runes = useQuery(runeBuildsQuery(mode.scope, undefined, { current: true })).data ?? [];
```

```tsx
  const decks = useQuery(decksQuery(mode.scope, { current: true })).data ?? [];
```

Add "current … only" to each view's JSDoc where it names what it reads.

- [ ] **Step 4: Run the tests**

Run: `pnpm vitest run apps/web/test/boss-view.test.tsx`
Expected: PASS.

Run: `pnpm vitest run apps/web/test/stage-views.test.tsx`
Expected: PASS.

- [ ] **Step 5: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Message:

```
feat(web): the boss and Rift screens show current recommendations only

These screens say what to run and have no Obsolete section, so they ask
the API for ?current=true rune builds, decks and gear instead of
filtering in the browser.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- apps/web/src/views/BossView.tsx apps/web/src/views/RiftView.tsx apps/web/src/views/RiftFindings.tsx apps/web/test/boss-view.test.tsx apps/web/test/stage-views.test.tsx`

---

### Task 12: Capture: the `searches.json` schema and its records test

**Files:**
- Create: `packages/capture/src/searches.ts`
- Modify: `packages/capture/src/index.ts`
- Test: `packages/capture/test/searches.test.ts` (create), `packages/capture/test/records.test.ts`

**Interfaces:**
- Consumes: `isoDate` from `@crumble/schema`; `ENDPOINTS` from `packages/capture/src/crumbgg.ts`.
- Produces:
  - `SEARCHES_FILE = "searches.json"`, `SEARCH_KIND`, `savedSearch`, `searchesFile` (Zod), `type SavedSearch`
  - `readSearches(recordDir: string): SavedSearch[] | null`
  - An entry: `id` (slug, unique in the file), `kind` (`dc` with `query`; `naver` with `menuId` or `query`; `crumbgg` with `endpoint` and `args`; `youtube` with `query` or `channel`; `web` with `url`), `why`, `added` (the round that added it, `YYYY-MM-DD`), `lastHit` (the last round it found something, or null)
  - The records test: an area (a record with an `import.json`) with a `searches.json` has a valid one, and an area whose README has a `## Refresh <date>` section has one. The refresh-meta plan tightens this to every area once it has reconstructed them.

- [ ] **Step 1: Write the failing schema test**

Create `packages/capture/test/searches.test.ts`:

```ts
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readSearches, SEARCHES_FILE, searchesFile } from "../src/searches";

const base = { why: "The stage-pushing board's own term.", added: "2026-09-28", lastHit: "2026-09-28" };

const VALID = [
  { ...base, id: "dc-stage", kind: "dc", query: "subject:스테이지" },
  { ...base, id: "nv-guide", kind: "naver", menuId: 12 },
  { ...base, id: "nv-search", kind: "naver", query: "크럼블 던전" },
  { ...base, id: "crumbgg-leaderboard", kind: "crumbgg", endpoint: "leaderboard", args: [] },
  { ...base, id: "crumbgg-live", kind: "crumbgg", endpoint: "live", args: ["players"] },
  { ...base, id: "yt-dungeon", kind: "youtube", query: "크럼블 던전 고득점" },
  { ...base, id: "yt-channel", kind: "youtube", channel: "@crumblehub", lastHit: null },
  { ...base, id: "web-tier", kind: "web", url: "https://example.test/tier" },
];

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

describe("searches.json", () => {
  it("accepts every kind of saved search", () => {
    expect(searchesFile.safeParse(VALID).success).toBe(true);
  });

  it("rejects an entry that names no way to run it, or two", () => {
    expect(searchesFile.safeParse([{ ...base, id: "x", kind: "dc" }]).success).toBe(false);
    expect(
      searchesFile.safeParse([{ ...base, id: "x", kind: "youtube", query: "q", channel: "@c" }]).success,
    ).toBe(false);
  });

  it("rejects a crumb.gg endpoint pnpm capture doesn't know, and one given the wrong arguments", () => {
    expect(
      searchesFile.safeParse([{ ...base, id: "x", kind: "crumbgg", endpoint: "nope", args: [] }]).success,
    ).toBe(false);
    expect(
      searchesFile.safeParse([{ ...base, id: "x", kind: "crumbgg", endpoint: "live", args: [] }]).success,
    ).toBe(false);
    expect(
      searchesFile.safeParse([
        { ...base, id: "x", kind: "crumbgg", endpoint: "leaderboard", args: ["extra"] },
      ]).success,
    ).toBe(false);
  });

  it("rejects a duplicate id, a last hit before the round that added it, and an unknown key", () => {
    expect(searchesFile.safeParse([VALID[0], VALID[0]]).success).toBe(false);
    expect(searchesFile.safeParse([{ ...VALID[0], lastHit: "2026-09-01" }]).success).toBe(false);
    expect(searchesFile.safeParse([{ ...VALID[0], pages: 3 }]).success).toBe(false);
  });

  it("reads a record's file, and says so when there is none", () => {
    tmp = mkdtempSync(join(tmpdir(), "crumble-searches-"));
    expect(readSearches(tmp)).toBeNull();
    writeFileSync(join(tmp, SEARCHES_FILE), JSON.stringify(VALID));
    expect(readSearches(tmp)?.map((s) => s.id)).toEqual(VALID.map((s) => s.id));
    writeFileSync(join(tmp, SEARCHES_FILE), JSON.stringify([{ id: "x" }]));
    expect(() => readSearches(tmp!)).toThrow();
  });
});
```

(`ENDPOINTS` in `packages/capture/src/crumbgg.ts` has `leaderboard` taking no argument and `live` taking a board.)

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm vitest run packages/capture/test/searches.test.ts`
Expected: FAIL, `Cannot find module '../src/searches'`.

- [ ] **Step 3: The schema**

Create `packages/capture/src/searches.ts`:

```ts
/**
 * A research record's saved searches, `searches.json` at the record's
 * root: what a refresh round reruns before its discovery searches. Each
 * entry names where it runs and what to run there, why it exists, the
 * round that added it, and the last round it found something (a search
 * that finds nothing keeps that date and is never deleted).
 *
 * @module
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isoDate } from "@crumble/schema";
import { z } from "zod";
import { ENDPOINTS } from "./crumbgg";

/** The file's name, at the record folder's root. */
export const SEARCHES_FILE = "searches.json";

/** Where a saved search runs. */
export const SEARCH_KIND = ["dc", "naver", "crumbgg", "youtube", "web"] as const;
/** Where a saved search runs. */
export type SearchKind = (typeof SEARCH_KIND)[number];

/** What every saved search carries besides what to run. */
const common = {
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "expected a lowercase slug"),
  why: z.string().min(1),
  added: isoDate,
  lastHit: isoDate.nullable(),
};

/** A DCInside gallery search: one `pnpm capture dc list` query (`subject:…`, `name:…`, a bare term, `@recommend`). */
const dcSearch = z.strictObject({ ...common, kind: z.literal("dc"), query: z.string().min(1) });

/** A Naver cafe board listing, by the board's menu id (`pnpm capture naver list`). */
const naverBoard = z.strictObject({
  ...common,
  kind: z.literal("naver"),
  menuId: z.number().int().positive(),
});

/** A Naver cafe search, run in the browser. */
const naverSearch = z.strictObject({ ...common, kind: z.literal("naver"), query: z.string().min(1) });

/** A crumb.gg endpoint of `pnpm capture crumbgg`, captured whole every round. */
const crumbggEndpoint = z
  .strictObject({
    ...common,
    kind: z.literal("crumbgg"),
    endpoint: z.string().min(1),
    args: z.array(z.string().min(1)),
  })
  .refine((s) => Object.hasOwn(ENDPOINTS, s.endpoint), {
    message: "not an endpoint of pnpm capture crumbgg",
    path: ["endpoint"],
  })
  .refine((s) => !Object.hasOwn(ENDPOINTS, s.endpoint) || ENDPOINTS[s.endpoint]!.args.length === s.args.length, {
    message: "the wrong number of arguments for the endpoint",
    path: ["args"],
  });

/** A YouTube search (`pnpm capture youtube search`). */
const youtubeQuery = z.strictObject({ ...common, kind: z.literal("youtube"), query: z.string().min(1) });

/** A YouTube channel's uploads, by its handle. */
const youtubeChannel = z.strictObject({
  ...common,
  kind: z.literal("youtube"),
  channel: z.string().regex(/^@\S+$/, "expected a channel handle, @name"),
});

/** A web page, captured whole every round. */
const webPage = z.strictObject({ ...common, kind: z.literal("web"), url: z.url() });

/** One saved search. Its last hit, when it has one, is no earlier than the round that added it. */
export const savedSearch = z
  .union([dcSearch, naverBoard, naverSearch, crumbggEndpoint, youtubeQuery, youtubeChannel, webPage])
  .refine((s) => s.lastHit === null || s.lastHit >= s.added, {
    message: "lastHit can't be before added",
    path: ["lastHit"],
  });
/** Output of {@link savedSearch}. */
export type SavedSearch = z.output<typeof savedSearch>;

/** A record's `searches.json`: its saved searches, each id once. */
export const searchesFile = z.array(savedSearch).superRefine((searches, ctx) => {
  const seen = new Set<string>();
  searches.forEach((search, index) => {
    if (seen.has(search.id)) {
      ctx.addIssue({ code: "custom", message: `duplicate id "${search.id}"`, path: [index, "id"] });
    }
    seen.add(search.id);
  });
});

/**
 * Reads and validates a record's saved searches.
 *
 * @param recordDir - absolute path to the record folder
 * @returns the searches, or `null` when the record has no `searches.json`
 * @throws `SyntaxError` when the file isn't JSON, and `ZodError` when it
 *   isn't a valid search list
 */
export function readSearches(recordDir: string): SavedSearch[] | null {
  const file = join(recordDir, SEARCHES_FILE);
  if (!existsSync(file)) return null;
  return searchesFile.parse(JSON.parse(readFileSync(file, "utf-8")));
}
```

In `packages/capture/src/index.ts`, add `export * from "./searches";` after `export * from "./ledger";`.

- [ ] **Step 4: Run the schema test**

Run: `pnpm vitest run packages/capture/test/searches.test.ts`
Expected: PASS.

- [ ] **Step 5: The records test**

In `packages/capture/test/records.test.ts`, import `readSearches` and `SEARCHES_FILE` from `../src/searches`, and add after the existing describe block:

```ts
/** The areas a refresh round covers: the records with an `import.json`. */
const areas = readdirSync(researchDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(researchDir, entry.name, "import.json")))
  .map((entry) => entry.name);

/** A README section a refresh round adds: `## Refresh YYYY-MM-DD`. */
const REFRESH_SECTION = /^## Refresh \d{4}-\d{2}-\d{2}\b/m;

describe("every area's saved searches", () => {
  it("finds the areas", () => {
    expect(areas.length).toBeGreaterThan(0);
  });

  for (const area of areas) {
    it(`${area}: its searches.json is a valid search list, and present once a refresh round ran`, () => {
      const dir = join(researchDir, area);
      const refreshed = REFRESH_SECTION.test(readFileSync(join(dir, "README.md"), "utf-8"));
      const searches = readSearches(dir);
      expect(searches !== null || !refreshed, `${area} has a refresh section and no ${SEARCHES_FILE}`).toBe(
        true,
      );
    });
  }
});
```

`readSearches` throws on an invalid file, which fails the test with the Zod issues.

Run: `pnpm vitest run packages/capture/test/records.test.ts`
Expected: PASS (no record has a `searches.json` or a refresh section yet).

- [ ] **Step 6: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Run: `git add packages/capture/src/searches.ts packages/capture/test/searches.test.ts`

Message:

```
feat(capture): the searches.json schema, and a records test for it

A refresh round reruns a record's saved searches before its discovery,
so each record gets a searches.json at its root: where each search runs
and what to run, why it exists, the round that added it and the last
round it found something. A crumb.gg entry must name an endpoint pnpm
capture knows, with its arguments. The records test holds every area's
file to the schema, and requires one once the README records a refresh
round; requiring it of every area waits until the existing records'
files are reconstructed from their evidence.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- packages/capture`

---

### Task 13: Server: `pnpm db:scope`, the records a snapshot change touches

Spec section 4's merge step checks that the regenerated snapshot's diff touches only the refreshed records' rows. A raw `git diff` can't show that: integer ids are assigned in import order, so a round that adds a rune build to record 001 renumbers every later record's rune builds, citations and child rows. This command compares each record's owned rows by content instead.

**Files:**
- Create: `apps/server/src/services/snapshot-scope.ts`
- Create: `apps/server/src/cli/snapshot-scope.ts`
- Modify: `apps/server/package.json` (script `db:scope`), `package.json` (script `db:scope`)
- Test: `apps/server/test/services/snapshot-scope.test.ts` (create)

**Interfaces:**
- Consumes: `Snapshot` (`services/export.ts`), `TABLE_KEYS`, `recordColumnOf` (`registry.ts`).
- Produces:
  - `interface RecordChange { record: string; tables: TableKey[] }`
  - `changedRecords(before: Snapshot, after: Snapshot): RecordChange[]`
  - `pnpm db:scope <rev> [<slug> …]`: prints each record whose owned rows differ between `git show <rev>:data/snapshot.json` and `data/snapshot.json`, with its tables; exits 1 when a changed record isn't among the slugs.

- [ ] **Step 1: Write the failing test**

Create `apps/server/test/services/snapshot-scope.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Store } from "../../src/repos";
import { exportSnapshot } from "../../src/services/export";
import { changedRecords } from "../../src/services/snapshot-scope";
import { testStore } from "../helpers";

/**
 * Adds a gear rec that `record` owns.
 *
 * @param store - the store
 * @param record - the owning record's slug
 * @param substats - the rec's substats, which tell rows apart
 */
function gear(store: Store, record: string, substats: string): void {
  store.repos.gearRecs.insert({ slot: "top_left", substats, context: "raid", why: "w", recordSlug: record });
}

describe("changedRecords", () => {
  it("names only the record whose rows changed, though a later record's rows were renumbered", () => {
    const before = testStore();
    gear(before, "r1", "ATK");
    gear(before, "r2", "CRIT");
    const after = testStore();
    gear(after, "r1", "ATK");
    gear(after, "r1", "HP");
    gear(after, "r2", "CRIT");
    expect(changedRecords(exportSnapshot(before), exportSnapshot(after))).toEqual([
      { record: "r1", tables: ["gearRecs"] },
    ]);
  });

  it("names a record whose row changed content, and one that appeared", () => {
    const before = testStore();
    gear(before, "r1", "ATK");
    const after = testStore();
    gear(after, "r1", "ATK%");
    gear(after, "r3", "DEF");
    expect(changedRecords(exportSnapshot(before), exportSnapshot(after))).toEqual([
      { record: "r1", tables: ["gearRecs"] },
      { record: "r3", tables: ["gearRecs"] },
    ]);
  });

  it("names nothing when the snapshots hold the same rows", () => {
    const store = testStore();
    gear(store, "r1", "ATK");
    expect(changedRecords(exportSnapshot(store), exportSnapshot(store))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm vitest run apps/server/test/services/snapshot-scope.test.ts`
Expected: FAIL, cannot find `../../src/services/snapshot-scope`.

- [ ] **Step 3: The comparison**

Create `apps/server/src/services/snapshot-scope.ts`:

```ts
import type { TableKey } from "../registry";
import { TABLE_KEYS, recordColumnOf } from "../registry";
import type { Snapshot } from "./export";

/** A research record whose owned rows differ between two snapshots. */
export interface RecordChange {
  /** The record's slug. */
  record: string;
  /** The tables its rows differ in, in registry order. */
  tables: TableKey[];
}

/**
 * Collects the rows each record owns in `snapshot`, per table, each as
 * JSON without an integer `id`: import order assigns those, so a record
 * that gains or loses a row renumbers every later record's rows.
 *
 * @param snapshot - the snapshot
 * @returns record slug → table → the owned rows' JSON, sorted
 */
function ownedContent(snapshot: Snapshot): Map<string, Map<TableKey, string[]>> {
  const result = new Map<string, Map<TableKey, string[]>>();
  const tables = snapshot.tables as Partial<Record<TableKey, Array<Record<string, unknown>>>>;
  for (const key of TABLE_KEYS) {
    const owner = recordColumnOf(key);
    if (owner === undefined) continue;
    for (const row of tables[key] ?? []) {
      const record = row[owner];
      if (typeof record !== "string") continue;
      const { id, ...rest } = row;
      const content = JSON.stringify(typeof id === "number" ? rest : row);
      const byTable = result.get(record) ?? new Map<TableKey, string[]>();
      byTable.set(key, [...(byTable.get(key) ?? []), content]);
      result.set(record, byTable);
    }
  }
  for (const byTable of result.values()) for (const rows of byTable.values()) rows.sort();
  return result;
}

/**
 * Lists the research records whose owned rows differ between two
 * snapshots, compared by content, integer ids aside.
 *
 * @param before - the earlier snapshot
 * @param after - the later snapshot
 * @returns each record whose rows differ, sorted by slug, with the tables they differ in
 */
export function changedRecords(before: Snapshot, after: Snapshot): RecordChange[] {
  const was = ownedContent(before);
  const is = ownedContent(after);
  const records = [...new Set([...was.keys(), ...is.keys()])].sort();
  return records.flatMap((record) => {
    const tables = TABLE_KEYS.filter(
      (key) =>
        JSON.stringify(was.get(record)?.get(key) ?? []) !==
        JSON.stringify(is.get(record)?.get(key) ?? []),
    );
    return tables.length > 0 ? [{ record, tables }] : [];
  });
}
```

- [ ] **Step 4: The command**

Create `apps/server/src/cli/snapshot-scope.ts`:

```ts
/**
 * Reports which research records' rows a change to `data/snapshot.json`
 * touches, by content, against the snapshot at a git revision. Run via
 * `pnpm db:scope <rev> [<record slug> ...]`: prints each changed record
 * with its tables, and exits 1 when a record not named among the slugs
 * changed, 2 on a usage error.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { repoRoot, snapshotPath } from "../config";
import type { Snapshot } from "../services/export";
import { changedRecords } from "../services/snapshot-scope";

const [rev, ...named] = process.argv.slice(2);
if (rev === undefined) {
  console.error("usage: pnpm db:scope <rev> [<record slug> ...]");
  process.exit(2);
}
const before = JSON.parse(
  execFileSync("git", ["show", `${rev}:data/snapshot.json`], {
    cwd: repoRoot,
    encoding: "utf-8",
    maxBuffer: 1 << 30,
  }),
) as Snapshot;
const after = JSON.parse(readFileSync(snapshotPath, "utf-8")) as Snapshot;
const changes = changedRecords(before, after);
for (const { record, tables } of changes) console.log(`${record}: ${tables.join(", ")}`);
const unexpected = changes.filter((change) => !named.includes(change.record));
if (unexpected.length > 0) {
  console.error(`rows changed for records not named: ${unexpected.map((c) => c.record).join(", ")}`);
  process.exit(1);
}
```

In `apps/server/package.json`'s scripts, add `"db:scope": "tsx src/cli/snapshot-scope.ts"`. In the root `package.json`'s scripts, add `"db:scope": "pnpm --filter @crumble/server db:scope"` after `db:restore`.

- [ ] **Step 5: Run the test and the command**

Run: `pnpm vitest run apps/server/test/services/snapshot-scope.test.ts`
Expected: PASS.

Run: `pnpm db:scope HEAD`
Expected: no output, exit 0 (the working snapshot is the committed one).

- [ ] **Step 6: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Run: `git add apps/server/src/services/snapshot-scope.ts apps/server/src/cli/snapshot-scope.ts apps/server/test/services/snapshot-scope.test.ts`

Message:

```
feat(server): pnpm db:scope names the records a snapshot change touches

A refresh round regenerates data/snapshot.json from a fresh import and
must touch only the refreshed records' rows. The raw diff can't show
that: ids follow import order, so a row added to an early record
renumbers every later record's rows. db:scope compares each record's
owned rows by content, integer ids aside, against the snapshot at a git
revision, and fails when a record it wasn't told about changed.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- apps/server package.json`

---

### Task 14: Docs, and the closing snapshot gate

**Files:**
- Modify: `README.md` (the "What's here" table's `research/` row, "The database", the "API" intro and table, the commands blocks)

- [ ] **Step 1: Document the lifecycle and the new commands**

In `README.md`:

- In "What's here", the `research/` row: add "A record the app can load also has … and `searches.json`, its saved searches (schema `packages/capture/src/searches.ts`)."
- In "The database", after the paragraph on `import:record`, add:

```markdown
A recommendation (a row of a table `OBSOLETE_ENTITIES` in `packages/schema/src/obsolete.ts` names) is marked obsolete in its curated file, never deleted: `"obsolete": { "since": "YYYY-MM-DD", "reason": "…", "sources": ["dc:…"] }`, and on a deck also `"superseded_by": "<deck id>"`. `since` is the date of the patch that displaced it, or the round's. The import checks the date, that the reason's sources are curated sources, and that the successor is a curated deck of the same mode other than the deck itself; a counter edge that names an obsolete deck must be obsolete too. It writes `obsoleteSince`, `obsoleteReason` and `supersededBy`, keeps the row's `status`, and cites the reason under the cited entity `obsolescence`, keyed `<entity>:<id>`. Removing the block and re-importing makes the row current again.
```

- In the database commands block, add `pnpm db:scope HEAD 001-guild-conquest-meta   # the records whose rows data/snapshot.json changed, against HEAD; fails on any other`.
- In "API", after the sentence on `?mode=`, add: "Every list whose rows carry the obsolete lifecycle takes `?current=true|false` (`true` keeps the current rows, `false` the obsolete ones), and its rows carry `obsoleteSince`, `obsoleteReason` and `obsoleteSources` (the sources of the reason, empty while current); a deck also carries `supersededBy`. Only a record's import marks a row obsolete: `POST` and `PATCH` ignore those fields."
- In the API table's `/api/decks` row, add: "A deck another deck names as `supersededBy` can't be deleted (409)."

- [ ] **Step 2: The closing gate: a fresh import reproduces the committed snapshot**

Import into a new scratch database, one command each:

```
CRUMBLE_DB=<scratchpad>/gate-after.db pnpm import:record 001-guild-conquest-meta
CRUMBLE_DB=<scratchpad>/gate-after.db pnpm import:record 002-pvp-meta
CRUMBLE_DB=<scratchpad>/gate-after.db pnpm import:record 003-stage-pushing-meta
CRUMBLE_DB=<scratchpad>/gate-after.db pnpm import:record 004-golden-drop-meta
```

Run: `CRUMBLE_DB=<scratchpad>/gate-after.db pnpm db:export`

Run: `git diff --exit-code --stat data/snapshot.json`
Expected: no output, exit 0: no record uses `obsolete` yet, and Task 2's regenerated snapshot is reproduced byte for byte.

Run: `pnpm db:scope HEAD`
Expected: no output, exit 0.

- [ ] **Step 3: Verify and commit**

Run: `rtk proxy pnpm verify`
Expected: passes.

Message:

```
docs: the obsolete lifecycle, ?current= and pnpm db:scope

The README says how a curated recommendation is marked obsolete and what
the import checks, what the API returns for it and how ?current=
filters, and how db:scope checks a regenerated snapshot's reach. A fresh
import still reproduces data/snapshot.json byte for byte.
```

Run: `git commit -F .git/crumble-commit-msg.txt -- README.md`

- [ ] **Step 4: Final review, push, and the reseed reminder**

Dispatch one review of the whole plan's commits on Opus (`model: "opus"`), briefed with this plan, the spec, and `git log --oneline <Task 1's commit>..HEAD`. Fix its findings one at a time, `rtk proxy pnpm verify` before each commit. Then run `git push origin main`.

Tell the user to delete `data/crumble.db` (or run `pnpm dev:reseed`): the migration adds columns, so the server's startup drift warning names the lifecycle tables until the database is reseeded from the new snapshot.
