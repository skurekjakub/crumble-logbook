import { join } from "node:path";
import { ImportError } from "../errors";
import { insertBuffValues, readBuffValues, readFightEvents } from "./boss";
import type { Collection, CollectionName, ParsedCollections, RowRefs } from "./collections";
import { COLLECTIONS, curatedManifest } from "./collections";
import { loadSummaries } from "./extractions";
import { parseFile, readJson } from "./files";
import { readManifest } from "./manifest";
import { readRankings } from "./rankings";
import type { WriteStep } from "./steps";
import { insertCited } from "./steps";

/** A research record read, validated and mapped: everything its import writes, in order. */
export interface RecordPlan {
  /** The record's slug, from its `import.json`. */
  slug: string;
  /** The writes, in order: the curated collections, then the rankings, fight events and buffs. */
  steps: WriteStep[];
  /** Non-fatal findings, such as contested glossary lookup keys. */
  warnings: string[];
}

/** Every listed collection's parsed content, and its record-relative file path. */
interface CuratedFiles {
  parsed: Partial<ParsedCollections>;
  files: Partial<Record<CollectionName, string>>;
}

/** The collections in write order, typed for generic iteration. */
const ORDERED = Object.entries(COLLECTIONS) as Array<[CollectionName, Collection<unknown>]>;

/**
 * Reads and validates every collection the curated directory's
 * `manifest.json` lists.
 * @throws {ImportError} naming the file (and row) of the first failure
 */
function readCollections(recordDir: string, curatedDir: string): CuratedFiles {
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
    );
  }
  return result;
}

/**
 * Checks, before anything is written, that every cited source id is a
 * curated source and every linked deck is a curated deck, then runs each
 * collection's own checks.
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
  const context = {
    deckModes: new Map((parsed.decks ?? []).map((deck) => [deck.id, deck.mode])),
  };
  for (const [name, collection] of ORDERED) {
    if (parsed[name] !== undefined) collection.check?.(files[name]!, parsed[name], context);
  }
}

/**
 * Reads a research record without writing anything: its `import.json`, its
 * curated collections, its ranking TSVs, its extractions' summaries and,
 * when the manifest names them, its fight timeline and buff capture. Every
 * file is validated and every reference checked, and every row is mapped
 * into a write step.
 *
 * @param recordDir - absolute path to the record directory (the one
 *   holding `import.json`)
 * @returns the record's slug, its write steps in order, and warnings
 * @throws {ImportError} naming the file and row, if a file is missing or
 *   malformed, a row fails its schema, a row cites an unknown source or
 *   deck, a counter's mode isn't its decks' mode, or two ranking rows
 *   share a key
 */
export function readRecord(recordDir: string): RecordPlan {
  const manifest = readManifest(recordDir);
  const curated = readCollections(recordDir, manifest.curated);
  checkCollections(curated);
  const { parsed } = curated;
  const sourceIds = new Set(Object.keys(parsed.sources ?? {}));
  const rankings = readRankings(recordDir, manifest, sourceIds);
  const context = {
    recordDir,
    manifest,
    summaries: loadSummaries(join(recordDir, manifest.extractions)),
  };

  const steps: WriteStep[] = [];
  const warnings: string[] = [];
  for (const [name, collection] of ORDERED) {
    if (parsed[name] === undefined) continue;
    steps.push(...collection.prepare(parsed[name], { ...context, file: curated.files[name]! }));
    warnings.push(...(collection.warnings?.(parsed[name]) ?? []));
  }
  steps.push(rankings);
  if (manifest.fightEvents) {
    steps.push(
      insertCited("fightEvents", readFightEvents(recordDir, manifest.fightEvents, sourceIds)),
    );
  }
  if (manifest.buffValues) {
    const glossaryKrs = new Set((parsed.glossary ?? []).map((entry) => entry.kr));
    steps.push(
      insertBuffValues(
        manifest.buffValues.file,
        readBuffValues(recordDir, manifest.buffValues, sourceIds, glossaryKrs),
      ),
    );
  }
  return { slug: manifest.record.slug, steps, warnings };
}
