import type {
  CitationRow,
  DeckCookieRow,
  DeckNoteRow,
  DeckPetRow,
  DeckRow,
  GearRecRow,
  GlossaryRow,
  MechanicRow,
  RankingRow,
  RecommendationRow,
  ResearchRecordRow,
  RngFactorRow,
  RuneBuildDeckRow,
  RuneBuildRow,
  ScoreRow,
  SourceRow,
  TakeawayRow,
  TimelineEventRow,
} from "@crumble/schema";
import { ConflictError } from "../errors";
import type { Repos, Store } from "../repos";

/**
 * Every table a {@link Snapshot} captures, keyed by name in FK-safe insert
 * order (a table only lists ids that an earlier table already defined).
 * `jobs` (transient background-job state) is never captured.
 */
export interface SnapshotTables {
  sources: SourceRow[];
  researchRecords: ResearchRecordRow[];
  glossary: GlossaryRow[];
  decks: DeckRow[];
  deckCookies: DeckCookieRow[];
  deckPets: DeckPetRow[];
  deckNotes: DeckNoteRow[];
  runeBuilds: RuneBuildRow[];
  runeBuildDecks: RuneBuildDeckRow[];
  gearRecs: GearRecRow[];
  scores: ScoreRow[];
  rankings: RankingRow[];
  mechanics: MechanicRow[];
  rngFactors: RngFactorRow[];
  timeline: TimelineEventRow[];
  takeaways: TakeawayRow[];
  recommendations: RecommendationRow[];
  citations: CitationRow[];
}

/** A full, versioned dump of every durable table, for the committed `data/snapshot.json`. */
export interface Snapshot {
  /** Snapshot format version; {@link restoreSnapshot} accepts only `1`. */
  version: 1;
  /** The captured tables, each sorted by its own primary key. */
  tables: SnapshotTables;
}

/** Ascending comparator for any row with an integer `id`, for tables keyed by a surrogate id. */
function byNumId<T extends { id: number }>(a: T, b: T): number {
  return a.id - b.id;
}

/**
 * Returns a copy of `rows` sorted ascending by the text field `key` (a
 * table's text primary key, e.g. `sources.id` or `glossary.kr`).
 */
function sortedByTextKey<T, K extends keyof T>(rows: readonly T[], key: K): T[] {
  return [...rows].sort((a, b) => {
    // `key` always names a text primary-key column here; the cast makes
    // that assumption explicit rather than relying on structural luck.
    const av = a[key] as unknown as string;
    const bv = b[key] as unknown as string;
    return av < bv ? -1 : av > bv ? 1 : 0;
  });
}

/** Ascending comparator over the `(runeBuildId, deckId)` composite primary key of `rune_build_decks`. */
function byRuneBuildDeckKey(a: RuneBuildDeckRow, b: RuneBuildDeckRow): number {
  return a.runeBuildId - b.runeBuildId || (a.deckId < b.deckId ? -1 : a.deckId > b.deckId ? 1 : 0);
}

/**
 * Builds a full {@link Snapshot} of every durable table.
 *
 * Reads every table independent of each repo's own list order (several are
 * ordered for UI display, e.g. `sources` newest-first) and re-sorts every
 * table by its primary key, in the fixed FK-safe order {@link restoreSnapshot}
 * later inserts them back in.
 *
 * @param store - the store to snapshot
 * @returns the snapshot, at format `version` `1`
 */
export function exportSnapshot(store: Store): Snapshot {
  const repos = store.repos;
  return {
    version: 1,
    tables: {
      sources: sortedByTextKey(repos.sources.list(), "id"),
      researchRecords: sortedByTextKey(repos.records.list(), "slug"),
      glossary: sortedByTextKey(repos.glossary.list(), "kr"),
      decks: sortedByTextKey(repos.decks.list(), "id"),
      deckCookies: repos.decks.allCookies().sort(byNumId),
      deckPets: repos.decks.allPets().sort(byNumId),
      deckNotes: repos.decks.allNotes().sort(byNumId),
      runeBuilds: repos.runeBuilds.list().sort(byNumId),
      runeBuildDecks: repos.runeBuilds.allLinks().sort(byRuneBuildDeckKey),
      gearRecs: repos.gearRecs.list().sort(byNumId),
      scores: repos.scores.list().sort(byNumId),
      rankings: repos.rankings.list().sort(byNumId),
      mechanics: repos.mechanics.list().sort(byNumId),
      rngFactors: repos.rngFactors.list().sort(byNumId),
      timeline: repos.timeline.list().sort(byNumId),
      takeaways: repos.takeaways.list().sort(byNumId),
      recommendations: repos.recommendations.list().sort(byNumId),
      citations: repos.citations.all().sort(byNumId),
    },
  };
}

/**
 * Guards `pnpm db:export` against silently overwriting the committed
 * `data/snapshot.json` with nothing, e.g. because `CRUMBLE_DB` pointed at a
 * missing or freshly-migrated database (`openDb` creates and migrates a
 * database file that doesn't exist yet, rather than failing).
 *
 * @param snapshot - the snapshot about to be written
 * @throws {ConflictError} if every table in `snapshot.tables` is empty
 */
export function assertSnapshotNonEmpty(snapshot: Snapshot): void {
  const everyTableEmpty = Object.values(snapshot.tables).every((rows) => rows.length === 0);
  if (everyTableEmpty) {
    throw new ConflictError("snapshot is entirely empty; refusing to export (check CRUMBLE_DB)");
  }
}

/**
 * Every repo with a `count()`/`clear()`, used to test the whole database for
 * emptiness before a restore. Deck children (`deck_cookies`/`deck_pets`/
 * `deck_notes`) and `rune_build_decks` aren't listed separately: their rows
 * cascade-delete with their parent, so an empty `decks`/`runeBuilds` implies
 * they're empty too.
 */
function everyRepo(repos: Repos) {
  return [
    repos.sources,
    repos.citations,
    repos.decks,
    repos.glossary,
    repos.runeBuilds,
    repos.rankings,
    repos.records,
    repos.mechanics,
    repos.rngFactors,
    repos.timeline,
    repos.takeaways,
    repos.gearRecs,
    repos.recommendations,
    repos.scores,
  ];
}

/** Groups `rows` by `runeBuildId`, preserving each group's `deckId` order. */
function groupRuneBuildDecks(rows: RuneBuildDeckRow[]): Map<number, string[]> {
  const result = new Map<number, string[]>();
  for (const row of rows) {
    const group = result.get(row.runeBuildId);
    if (group) group.push(row.deckId);
    else result.set(row.runeBuildId, [row.deckId]);
  }
  return result;
}

/**
 * Restores every table of `snapshot` into `store`, preserving every row's
 * id, inside a single transaction.
 *
 * @param store - the store to restore into; must be empty (every repo's
 *   `count()` is `0`)
 * @param snapshot - the snapshot to restore
 * @returns the number of rows written, per table
 * @throws {ConflictError} if `snapshot.version` isn't `1`
 * @throws {ConflictError} `"database is not empty; restore needs a fresh
 *   database"` if any table already has rows
 * @throws whatever the underlying inserts throw (e.g. a foreign-key
 *   violation from a row referencing an id that doesn't exist), after
 *   rolling back every write this call made
 */
export function restoreSnapshot(store: Store, snapshot: Snapshot): Record<keyof Snapshot["tables"], number> {
  if (snapshot.version !== 1) {
    throw new ConflictError(`unsupported snapshot version: ${String(snapshot.version)}`);
  }
  const { tables } = snapshot;
  // See `DeckService.create`'s implementation for why the inner return is
  // cast `as never` and the outer call `as Record<...>`: `Store.transaction`
  // can't infer its type parameter through its own conditional return type.
  return store.transaction((repos) => {
    if (everyRepo(repos).some((repo) => repo.count() > 0)) {
      throw new ConflictError("database is not empty; restore needs a fresh database");
    }

    for (const row of tables.sources) repos.sources.insert(row);
    for (const row of tables.researchRecords) repos.records.upsert(row);
    for (const row of tables.glossary) repos.glossary.upsert(row);
    for (const row of tables.decks) repos.decks.insert(row);
    repos.decks.insertRawCookies(tables.deckCookies);
    repos.decks.insertRawPets(tables.deckPets);
    repos.decks.insertRawNotes(tables.deckNotes);
    for (const row of tables.runeBuilds) repos.runeBuilds.insert(row);
    for (const [runeBuildId, deckIds] of groupRuneBuildDecks(tables.runeBuildDecks)) {
      repos.runeBuilds.replaceDecks(runeBuildId, deckIds);
    }
    for (const row of tables.gearRecs) repos.gearRecs.insert(row);
    for (const row of tables.scores) repos.scores.insert(row);
    repos.rankings.insertMany(tables.rankings);
    for (const row of tables.mechanics) repos.mechanics.insert(row);
    for (const row of tables.rngFactors) repos.rngFactors.insert(row);
    for (const row of tables.timeline) repos.timeline.insert(row);
    for (const row of tables.takeaways) repos.takeaways.insert(row);
    for (const row of tables.recommendations) repos.recommendations.insert(row);
    repos.citations.insertRaw(tables.citations);

    const counts: Record<keyof Snapshot["tables"], number> = {
      sources: tables.sources.length,
      researchRecords: tables.researchRecords.length,
      glossary: tables.glossary.length,
      decks: tables.decks.length,
      deckCookies: tables.deckCookies.length,
      deckPets: tables.deckPets.length,
      deckNotes: tables.deckNotes.length,
      runeBuilds: tables.runeBuilds.length,
      runeBuildDecks: tables.runeBuildDecks.length,
      gearRecs: tables.gearRecs.length,
      scores: tables.scores.length,
      rankings: tables.rankings.length,
      mechanics: tables.mechanics.length,
      rngFactors: tables.rngFactors.length,
      timeline: tables.timeline.length,
      takeaways: tables.takeaways.length,
      recommendations: tables.recommendations.length,
      citations: tables.citations.length,
    };
    return counts as never;
  }) as Record<keyof Snapshot["tables"], number>;
}

/** Read-only access to a full snapshot of the current database, for the export route. */
export interface ExportService {
  /** Builds a full {@link Snapshot} of the current database. */
  run(): Snapshot;
}

/**
 * Builds an {@link ExportService} over `store`.
 * @param store - the store to snapshot
 */
export function createExportService(store: Store): ExportService {
  return { run: () => exportSnapshot(store) };
}
