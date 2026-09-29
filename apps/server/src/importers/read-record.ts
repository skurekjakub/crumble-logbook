import { join } from "node:path";
import type { GameMode } from "@crumble/schema";
import type { z } from "zod";
import { ImportError } from "../errors";
import type {
  CheckContext,
  Collection,
  CollectionName,
  ParseContext,
  ParsedCollections,
  RowRefs,
} from "./collections";
import { COLLECTIONS, curatedManifest } from "./collections";
import type { Extra, ExtraContext, ExtraName } from "./extras";
import { EXTRAS } from "./extras";
import { loadSummaries } from "./extractions";
import { parseFile, readJson } from "./files";
import { readManifest } from "./manifest";
import type { WriteStep } from "./steps";

/** A research record read, validated and mapped: everything its import writes, in order. */
export interface RecordPlan {
  /** The record's slug, from its `import.json`. */
  slug: string;
  /** The writes, in order: the curated collections, then each extra block the manifest carries. */
  steps: WriteStep[];
  /** Non-fatal findings, such as contested glossary lookup keys. */
  warnings: string[];
}

/** Every listed collection's parsed content, and its record-relative file path. */
interface CuratedFiles {
  parsed: Partial<ParsedCollections>;
  files: Partial<Record<CollectionName, string>>;
}

/**
 * The game modes whose research has no lineups: a record filed only under
 * these may leave `decks` out of its curated manifest without a warning.
 */
export const MODES_WITHOUT_DECKS: readonly GameMode[] = ["team_power"];

/**
 * The warning for a record whose curated manifest lists no decks though a
 * mode it covers has lineups.
 *
 * @param parsed - every listed collection's parsed content
 * @param mode - the record's mode from `import.json`, when it states one
 * @returns the warning, or `undefined` when the record lists decks or
 *   covers only modes without lineups
 */
export function missingDecksWarning(
  parsed: Partial<ParsedCollections>,
  mode: GameMode | undefined,
): string | undefined {
  if (parsed.decks !== undefined) return undefined;
  const modes = mode ? [mode] : (Object.keys(parsed.meta?.modes ?? {}) as GameMode[]);
  const withDecks = modes.filter((m) => !MODES_WITHOUT_DECKS.includes(m));
  if (withDecks.length === 0) return undefined;
  return `curated/manifest.json lists no decks, though mode ${withDecks.join(", ")} has lineups; list decks.json if the record has one`;
}

/** The collections in write order, typed for generic iteration. */
const ORDERED = Object.entries(COLLECTIONS) as Array<[CollectionName, Collection<unknown>]>;

/** The extra blocks in write order, typed for generic iteration. */
const ORDERED_EXTRAS = Object.entries(EXTRAS) as unknown as Array<[ExtraName, Extra<z.ZodType>]>;

/**
 * Reads and validates every collection the curated directory's
 * `manifest.json` lists.
 *
 * @param recordDir - absolute path to the research record directory
 * @param curatedDir - the curated directory, relative to `recordDir`
 * @param context - the record's mode, for rows that state none
 * @returns each listed collection's parsed content and file path
 * @throws {ImportError} naming the file (and row) of the first failure
 */
function readCollections(
  recordDir: string,
  curatedDir: string,
  context: ParseContext,
): CuratedFiles {
  const manifestFile = `${curatedDir}/manifest.json`;
  const { collections } = parseFile(
    manifestFile,
    readJson(recordDir, manifestFile),
    curatedManifest,
  );
  const result: CuratedFiles = { parsed: {}, files: {} };
  for (const [name, collection] of ORDERED) {
    const listed = collections[name];
    if (listed === undefined) continue;
    const file = `${curatedDir}/${listed}`;
    result.files[name] = file;
    (result.parsed as Record<string, unknown>)[name] = collection.parse(
      file,
      readJson(recordDir, file),
      context,
    );
  }
  return result;
}

/**
 * Checks, before anything is written, that every cited source id is a
 * curated source and every linked deck is a curated deck, then runs each
 * collection's own checks.
 *
 * @param curated - every listed collection's parsed content and file path
 * @throws {ImportError} naming the file and row of the first bad reference
 */
function checkCollections({ parsed, files }: CuratedFiles): void {
  const known = {
    sources: new Set(Object.keys(parsed.sources ?? {})),
    decks: new Set((parsed.decks ?? []).map((deck) => deck.id)),
  };
  const refs = ORDERED.flatMap(([name, collection]) =>
    parsed[name] === undefined
      ? []
      : collection.refs(parsed[name]).map((ref) => ({ file: files[name]!, ref })),
  );
  /**
   * Checks that every id the rows reference under `key` is curated.
   *
   * @param kind - how the error names the ids
   * @param key - which reference list to check
   * @throws {ImportError} naming the file and row of the first unknown id
   */
  const assertKnown = (kind: "source" | "deck", key: keyof RowRefs & keyof typeof known) => {
    for (const { file, ref } of refs) {
      const unknown = [...new Set((ref[key] ?? []).filter((id) => !known[key].has(id)))];
      if (unknown.length > 0) {
        throw new ImportError(file, ref.row, `unknown ${kind} ids: ${unknown.join(", ")}`);
      }
    }
  };
  assertKnown("source", "sources");
  assertKnown("deck", "decks");
  const context: CheckContext = {
    deckModes: new Map((parsed.decks ?? []).map((deck) => [deck.id, deck.mode])),
    obsoleteDecks: new Set(
      (parsed.decks ?? []).filter((deck) => deck.obsolete !== undefined).map((deck) => deck.id),
    ),
    updated: parsed.meta?.updated,
  };
  for (const [name, collection] of ORDERED) {
    if (parsed[name] !== undefined) collection.check?.(files[name]!, parsed[name], context);
  }
}

/**
 * Reads a research record without writing anything: its `import.json`, its
 * curated collections, its extractions' summaries and every extra block
 * the manifest carries (see `EXTRAS`). Every file is validated and every
 * reference checked, and every row is mapped into a write step.
 *
 * @param recordDir - absolute path to the record directory (the one
 *   holding `import.json`)
 * @returns the record's slug, its write steps in order, and warnings
 * @throws {ImportError} naming the file and row, if a file is missing or
 *   malformed, a row fails its schema, a row cites an unknown source or
 *   deck, a counter's mode isn't its decks' mode, two ranking rows share
 *   a key, or neither `import.json` nor `meta.json` names the record's mode
 */
export function readRecord(recordDir: string): RecordPlan {
  const manifest = readManifest(recordDir);
  const curated = readCollections(recordDir, manifest.curated, { mode: manifest.record.mode });
  checkCollections(curated);
  const { parsed } = curated;
  const extraContext: ExtraContext = {
    recordDir,
    sourceIds: new Set(Object.keys(parsed.sources ?? {})),
    glossaryKrs: new Set((parsed.glossary ?? []).map((entry) => entry.kr)),
  };
  const context = {
    recordDir,
    manifest,
    summaries: loadSummaries(
      (typeof manifest.extractions === "string"
        ? [manifest.extractions]
        : manifest.extractions
      ).map((dir) => join(recordDir, dir)),
    ),
  };

  const steps: WriteStep[] = [];
  const decksWarning = missingDecksWarning(parsed, manifest.record.mode);
  const warnings: string[] = decksWarning ? [decksWarning] : [];
  for (const [name, collection] of ORDERED) {
    if (parsed[name] === undefined) continue;
    steps.push(...collection.prepare(parsed[name], { ...context, file: curated.files[name]! }));
    warnings.push(...(collection.warnings?.(parsed[name]) ?? []));
  }
  for (const [name, block] of ORDERED_EXTRAS) {
    const spec = manifest[name];
    if (spec !== undefined) steps.push(...block.read(spec, extraContext));
  }
  return { slug: manifest.record.slug, steps, warnings };
}
