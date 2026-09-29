/**
 * What a curated collection is, and the helpers that declare one: the
 * `Collection` contract the reader and writer drive, and builders for the
 * common file shapes. The collections themselves are declared in
 * `collections.ts` and the files it spreads in.
 *
 * @module
 */
import type { GameMode } from "@crumble/schema";
import type { z } from "zod";
import { ImportError } from "../errors";
import type { ContentKey, ValuesOf } from "../registry";
import { deckModeMismatch } from "../services/deck-modes";
import { formatIssues } from "./files";
import type { ImportManifest } from "./manifest";
import type { Moded } from "./seed/schema";
import type { ObsoleteValues, WriteStep } from "./steps";
import { insertCited } from "./steps";

/** What one row of a collection references, checked before anything is written. */
export interface RowRefs {
  /** The row, as an error names it: its index, or a field name. */
  row: string | number;
  /** The source ids the row cites. */
  sources?: readonly string[];
  /** The deck ids the row links to. */
  decks?: readonly string[];
}

/** What a collection's file is validated with, besides the file itself. */
export interface ParseContext {
  /**
   * The record's game mode, from `import.json`'s `record.mode`: a row that
   * states no mode is filed under it. `undefined` when the record states none.
   */
  mode: GameMode | undefined;
}

/** What a collection's own checks can see of the record's other collections. */
export interface CheckContext {
  /** Each curated deck's game mode, by deck id. */
  deckModes: ReadonlyMap<string, GameMode>;
  /** The ids of the curated decks marked obsolete. */
  obsoleteDecks: ReadonlySet<string>;
}

/** What a collection's rows are mapped with, besides the rows themselves. */
export interface PrepareContext {
  /** The collection file's record-relative path, as errors name it. */
  file: string;
  /** Absolute path to the record directory. */
  recordDir: string;
  /** The record's validated `import.json`. */
  manifest: ImportManifest;
  /** English summaries by source id, from the record's extractions. */
  summaries: Map<string, string>;
}

/**
 * One curated collection.
 *
 * @typeParam Parsed - the validated content of the collection's file
 */
export interface Collection<Parsed> {
  /** When true, a record's curated manifest may leave the collection out. */
  optional?: boolean;
  /**
   * Validates the collection's file.
   *
   * @param file - the file's record-relative path, as errors name it
   * @param raw - the parsed JSON
   * @param context - the record's mode, for rows that state none
   * @throws {ImportError} naming the file (and the row) of the first failure
   */
  parse(file: string, raw: unknown, context: ParseContext): Parsed;
  /** Lists every row's source and deck references. */
  refs(parsed: Parsed): RowRefs[];
  /**
   * Checks what the reference checks don't, after they pass.
   *
   * @param file - the file's record-relative path, as errors name it
   * @param parsed - the validated content
   * @param context - what the check can see of the other collections
   * @throws {ImportError} naming the file and the row
   */
  check?(file: string, parsed: Parsed, context: CheckContext): void;
  /** Lists non-fatal findings worth a human's attention. */
  warnings?(parsed: Parsed): string[];
  /**
   * Maps the rows into write steps, doing any file lookups now, so the
   * write phase only writes.
   */
  prepare(parsed: Parsed, context: PrepareContext): WriteStep[];
}

/**
 * Declares a collection, inferring its parsed type.
 *
 * @param collection - the collection
 * @returns the same collection
 */
export function collection<Parsed>(collection: Collection<Parsed>): Collection<Parsed> {
  return collection;
}

/**
 * Checks that every deck the rows of a one-mode collection name is a deck
 * of that mode.
 *
 * @param file - the file, as errors name it
 * @param entity - what the rows are, as the mismatch names it
 * @param mode - the mode the collection belongs to
 * @param decks - each row's deck, by the row as errors name it
 * @param context - the curated decks' modes
 * @throws {ImportError} naming the file and row of the first deck of another mode
 */
export function checkDeckModes(
  file: string,
  entity: string,
  mode: GameMode,
  decks: ReadonlyArray<readonly [row: string | number, deck: string | undefined]>,
  { deckModes }: CheckContext,
): void {
  for (const [row, deck] of decks) {
    if (deck === undefined) continue;
    const mismatch = deckModeMismatch(entity, mode, deck, deckModes.get(deck));
    if (mismatch) throw new ImportError(file, row, mismatch);
  }
}

/**
 * Checks that no row of a collection of current recommendations names an
 * obsolete deck: a recommendation can't point at a displaced deck, so the
 * round that marks the deck obsolete updates the row too.
 *
 * @param file - the file, as errors name it
 * @param entity - what the rows are, as the message names it
 * @param decks - each row's deck, by the row as errors name it
 * @param context - the curated decks marked obsolete
 * @throws {ImportError} naming the file and row of the first row that names an obsolete deck
 */
export function checkCurrentDecks(
  file: string,
  entity: string,
  decks: ReadonlyArray<readonly [row: string | number, deck: string | undefined]>,
  { obsoleteDecks }: CheckContext,
): void {
  for (const [row, deck] of decks) {
    if (deck !== undefined && obsoleteDecks.has(deck)) {
      throw new ImportError(
        file,
        row,
        `${entity} names obsolete deck ${deck}; point it at a current deck`,
      );
    }
  }
}

/**
 * Validates every row of an array file with `schema`.
 *
 * @param file - the file's record-relative path, as errors name it
 * @param raw - the parsed JSON
 * @param schema - the schema of one row
 * @returns the validated rows, in file order
 * @throws {ImportError} naming `file` if it isn't an array, or naming
 *   `file`, the row index and every issue's path for the first bad row
 */
export function parseRows<S extends z.ZodType>(
  file: string,
  raw: unknown,
  schema: S,
): Array<z.output<S>> {
  if (!Array.isArray(raw)) throw new ImportError(file, null, "expected an array");
  return raw.map((row, index) => {
    const result = schema.safeParse(row);
    if (!result.success) throw new ImportError(file, index, formatIssues(result.error));
    return result.data;
  });
}

/**
 * Validates every row of an array file whose rows may state a game mode,
 * filing a row that states none under the record's mode.
 *
 * @param file - the file's record-relative path, as errors name it
 * @param raw - the parsed JSON
 * @param schema - the schema of one row
 * @param mode - the record's mode, or `undefined` when the record states none
 * @returns the validated rows, in file order, each with its mode
 * @throws {ImportError} as {@link parseRows} does, or naming `file` and the
 *   index of the first row that states no mode when the record states none
 */
export function parseModedRows<S extends z.ZodType<{ mode?: GameMode | undefined }>>(
  file: string,
  raw: unknown,
  schema: S,
  mode: GameMode | undefined,
): Array<Moded<z.output<S>>> {
  return parseRows(file, raw, schema).map((row, index) => {
    const resolved = row.mode ?? mode;
    if (resolved === undefined) {
      throw new ImportError(
        file,
        index,
        "the row states no mode, and import.json's record has none to file it under",
      );
    }
    return { ...row, mode: resolved };
  });
}

/**
 * A collection's `parse` for an array file of rows that may state a game mode.
 *
 * @param schema - the schema of one row
 * @returns the parse function: see {@link parseModedRows}
 */
export function modedRows<S extends z.ZodType<{ mode?: GameMode | undefined }>>(schema: S) {
  return (file: string, raw: unknown, { mode }: ParseContext) =>
    parseModedRows(file, raw, schema, mode);
}

/**
 * Declares an array collection of a registered content type whose rows
 * each cite their own `sources` and map onto one row of the type. A row's
 * `obsolete` block, when it has one, is checked and written with it.
 *
 * @param key - the content type's registry key
 * @param parse - validates the file into its rows (see {@link modedRows})
 * @param map - maps a validated row, and its index, onto the type's column values
 * @param decks - the deck ids a row links to, when rows reference decks
 * @returns the collection
 */
export function citedRows<
  K extends ContentKey,
  Row extends { sources: string[]; obsolete?: ObsoleteValues | undefined },
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
