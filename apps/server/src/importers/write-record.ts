import { OBSOLESCENCE, isObsoleteEntity, obsolescenceKey } from "@crumble/schema";
import { ImportError } from "../errors";
import type { ContentKey, LinkTarget, TableKey } from "../registry";
import { CONTENT_KEYS, TABLE_KEYS, recordColumnOf, specOf } from "../registry";
import type { Repos, Store } from "../repos";
import type { FactRef } from "../repos/fact-claims";
import type { TableRepo } from "../repos/table-repo";
import type { RecordPlan } from "./read-record";

/** Rows an import inserted, per registered table, keyed by the table's registry name. */
export type ImportCounts = Record<TableKey, number>;

/** What {@link writeRecord} did. */
export interface WriteResult {
  /** Rows the import inserted, per table. */
  counts: ImportCounts;
  /** Findings the write steps reported, such as shared rows another record already loaded. */
  warnings: string[];
}

/** The tables whose rows a research record owns, in registry order. */
const OWNED_KEYS = TABLE_KEYS.filter((key) => recordColumnOf(key) !== undefined);

/**
 * Settles game facts after their claims changed: a fact no record claims
 * any more is deleted with its citations; a claimed one is cited to every
 * source its claims cite. A fact that no longer exists is skipped.
 *
 * @param repos - the write's repos
 * @param facts - the facts whose claims changed
 */
function settleFacts(repos: Repos, facts: readonly FactRef[]): void {
  for (const fact of facts) {
    const key = TABLE_KEYS.find((k) => specOf(k).entity === fact.entity) as ContentKey;
    const repo = repos[key] as TableRepo<unknown, never>;
    const id = Number(fact.entityId);
    if (!repo.get(id)) continue;
    const sources = repos.factClaims.sourcesOf(fact);
    if (sources.length > 0) {
      repos.citations.replace(fact.entity, fact.entityId, sources);
      continue;
    }
    repos.citations.removeAll(fact.entity, fact.entityId);
    repo.remove(id);
  }
}

/**
 * Deletes the rows record `slug` owns, children before parents, with the
 * citations of every cited row among them, then restarts every table's id
 * counter past its highest id left. Child rows (deck cookies, rune build
 * decks) go with their parents. A shared row that another record's rows
 * still reference, such as a source they cite, stays, still owned by
 * `slug`. The record's claims to game facts go too: a fact no other record
 * claims is deleted, and one another record claims keeps only that
 * record's citations. The citations of an obsolete row's reason go with
 * the row.
 *
 * @param repos - the write's repos
 * @param slug - the record's slug
 */
function clearRecord(repos: Repos, slug: string): void {
  const claimed = repos.factClaims.claimedBy(slug);
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
  settleFacts(repos, claimed);
  for (const key of TABLE_KEYS) repos.tables.restartIds(key);
}

/**
 * Checks that every slug a stored row names through a registry link is a
 * stored row's slug, so a `--replace` that drops a row another record's
 * row still names fails instead of stranding the link.
 *
 * @param repos - the write's repos
 * @param record - the record being written, as the error names it
 * @throws {ImportError} naming the first row whose link names a missing slug
 */
function assertLinksResolve(repos: Repos, record: string): void {
  for (const key of CONTENT_KEYS) {
    const { content, entity } = specOf(key);
    for (const [column, target] of Object.entries(content?.links ?? {})) {
      const slugs = new Set(
        (repos[target as LinkTarget].list() as Array<{ slug: unknown }>).map((r) => r.slug),
      );
      for (const row of repos[key].list() as Array<{ id: number; recordSlug: string | null }>) {
        const named = (row as unknown as Record<string, unknown>)[column];
        const list = (Array.isArray(named) ? named : named == null ? [] : [named]) as string[];
        const missing = list.find((slug) => !slugs.has(slug));
        if (missing === undefined) continue;
        throw new ImportError(
          "<db>",
          null,
          `${entity!} ${row.id} of record ${row.recordSlug ?? "(none)"} names ${missing} in ${column}, which record ${record} no longer loads; load that row again or change the naming row first`,
        );
      }
    }
  }
}

/**
 * Checks that every daily dungeon a deck's run facts name is stored, so a
 * `--replace` that drops a daily dungeon another record's deck runs fails
 * instead of stranding the deck.
 *
 * @param repos - the write's repos
 * @param record - the record being written, as the error names it
 * @throws {ImportError} naming the first deck whose run facts name a missing dungeon
 */
function assertDeckRunsResolve(repos: Repos, record: string): void {
  const dungeons = new Set(repos.dailyDungeons.list().map((row) => row.slug));
  const ids = repos.decks.list().map((deck) => deck.id);
  const stranded = repos.decks.dailyRuns(ids).find((run) => !dungeons.has(run.dungeon));
  if (stranded === undefined) return;
  throw new ImportError(
    "<db>",
    null,
    `deck ${stranded.deckId} runs daily dungeon ${stranded.dungeon}, which record ${record} no longer loads; load that dungeon again or change the deck first`,
  );
}

/**
 * Counts the rows of every registered table.
 *
 * @param repos - the repos to count through
 * @returns each table's row count
 */
function countAll(repos: Repos): ImportCounts {
  return Object.fromEntries(
    TABLE_KEYS.map((key) => [key, repos.tables.count(key)]),
  ) as ImportCounts;
}

/**
 * Writes a read record in one transaction, next to the rows other records
 * own. A record that is already loaded is refused unless `replace` is set,
 * in which case the rows it owns are cleared first (see the registry's
 * `recordColumnOf`), and every table's id counter restarts past its
 * highest id left. Then the plan's steps run in order, every row they
 * write owned by the record.
 *
 * @param store - the store to write to
 * @param plan - the record, read and validated by `readRecord`
 * @param replace - clear the record's own rows first, instead of refusing
 * @returns the rows inserted per table, and the steps' warnings
 * @throws {ImportError} `"record <slug> is already loaded; pass --replace to
 *   load it again"` if any table has a row the record owns and `replace`
 *   isn't set
 * @throws {ImportError} naming a stored row whose slug link, or a deck
 *   whose run facts, name a row that no longer exists after the write (a
 *   `--replace` that dropped a row another record names), after rolling
 *   back every write
 * @throws whatever a step throws (a constraint violation, or a conflict
 *   with a row another record loaded), after rolling back every write, the
 *   clears and the id counter resets included
 */
export function writeRecord(store: Store, plan: RecordPlan, replace: boolean): WriteResult {
  const { slug } = plan;
  // See `DeckService.create`'s implementation for why the inner return is
  // cast `as never` and the outer call `as WriteResult`.
  return store.transaction((repos) => {
    if (OWNED_KEYS.some((key) => repos.tables.countOwned(key, slug) > 0)) {
      if (!replace) {
        throw new ImportError(
          "<db>",
          null,
          `record ${slug} is already loaded; pass --replace to load it again`,
        );
      }
      clearRecord(repos, slug);
    }
    const before = countAll(repos);
    const warnings: string[] = [];
    const context = {
      record: slug,
      warn: (message: string) => void warnings.push(message),
    };
    for (const step of plan.steps) step(repos, context);
    assertLinksResolve(repos, slug);
    assertDeckRunsResolve(repos, slug);
    const after = countAll(repos);
    const counts = Object.fromEntries(TABLE_KEYS.map((key) => [key, after[key] - before[key]]));
    return { counts, warnings } as never;
  });
}
