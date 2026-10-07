/**
 * Resolves the account audit's references (a roadmap item's `refs`, a
 * lineup's matching deck) to the research rows they name. The account
 * view shows them as chips, and `pnpm import:account` warns about the
 * ones that name nothing loaded.
 *
 * @module
 */
import type { AccountRef, GameMode } from "@crumble/schema";
import { CONTENT_KEYS, specOf } from "../registry";
import type { Repos } from "../repos";
import type { TableRepo } from "../repos/table-repo";

/**
 * A reference, resolved: the deck or research row it names, with the game
 * mode whose screens show it.
 */
export interface AccountRefView extends AccountRef {
  /** What the chip reads: the reference's label, else the row's name, else the id. */
  label: string;
  /** The game mode whose screens show the row: the row's own, else its record's. */
  mode: GameMode | null;
  /**
   * Whether what it names is loaded: the row, owned by the record it names
   * when it names one; for a record `file` or a bare record, the record.
   */
  found: boolean;
  /** Whether the named deck is marked obsolete. */
  obsolete: boolean;
}

/** A row read generically, for its record, name and mode. */
type AnyRow = Readonly<Record<string, unknown>>;

/** The entities a reference may name that stand for a whole record rather than a row. */
const RECORD_LEVEL = ["file", "record"];

/** A row id written as a whole number. */
const ROW_ID = /^\d+$/;

/**
 * Finds the row a cited entity's id names: a deck by its id, a rune build
 * by its number, and a row of any other content type by its number or its
 * `slug`.
 *
 * @param repos - the repos to read through
 * @param entity - the citation entity, e.g. `mechanic`
 * @param id - the row's id or slug
 * @returns the row, or `undefined` when none has that id or the entity is unknown
 */
function entityRow(repos: Repos, entity: string, id: string): AnyRow | undefined {
  if (entity === "deck") return repos.decks.get(id);
  if (entity === "rune_build")
    return ROW_ID.test(id) ? repos.runeBuilds.get(Number(id)) : undefined;
  const key = CONTENT_KEYS.find((k) => specOf(k).entity === entity);
  if (key === undefined) return undefined;
  const repo = repos[key] as unknown as TableRepo<AnyRow, never>;
  return (
    (ROW_ID.test(id) ? repo.get(Number(id)) : undefined) ??
    repo.list().find((row) => row.slug === id)
  );
}

/**
 * Reads a text column of a generic row.
 *
 * @param row - the row
 * @param column - the column's name
 * @returns its value, or `null` when it isn't text
 */
function textColumn(row: AnyRow, column: string): string | null {
  const value = row[column];
  return typeof value === "string" && value !== "" ? value : null;
}

/**
 * Resolves a reference to the row it names. One with no entity names a
 * deck, else a power source, by its id; one with an entity names that
 * entity's row; a record `file` or a bare record names the record. When
 * the reference names a record, the row must belong to it.
 *
 * @param repos - the repos to read decks, rows and records from
 * @param ref - the reference
 * @returns the reference with its label, mode, whether it is loaded and whether it is obsolete
 */
export function resolveRef(repos: Repos, ref: AccountRef): AccountRefView {
  const record = ref.record === null ? undefined : repos.records.get(ref.record);
  if (ref.entity !== null && RECORD_LEVEL.includes(ref.entity)) {
    return {
      ...ref,
      label: ref.label ?? ref.id,
      mode: record?.mode ?? null,
      found: record !== undefined,
      obsolete: false,
    };
  }
  /**
   * Reports whether a row belongs to the record the reference names; a row
   * no record column marks (a game fact) belongs to any.
   *
   * @param row - the row found
   * @returns `true` when it may stand for the reference
   */
  const owned = (row: AnyRow | undefined): row is AnyRow =>
    row !== undefined &&
    (ref.record === null || !("recordSlug" in row) || row.recordSlug === ref.record);
  const tried = ref.entity === null ? ["deck", "power_source"] : [ref.entity];
  for (const entity of tried) {
    const row = entityRow(repos, entity, ref.id);
    if (!owned(row)) continue;
    const mode = textColumn(row, "mode") as GameMode | null;
    return {
      ...ref,
      entity,
      label:
        ref.label ??
        textColumn(row, "nameEn") ??
        textColumn(row, "title") ??
        textColumn(row, "slug") ??
        ref.id,
      mode: mode ?? (entity === "power_source" ? "team_power" : (record?.mode ?? null)),
      found: true,
      obsolete: row.obsoleteSince !== null && row.obsoleteSince !== undefined,
    };
  }
  return {
    ...ref,
    label: ref.label ?? ref.id,
    mode: record?.mode ?? null,
    found: false,
    obsolete: false,
  };
}

/**
 * Words a reference as a warning names it: `<record>#<entity>:<id>`.
 *
 * @param ref - the reference
 * @returns the reference in its string form
 */
export function refText(ref: AccountRef): string {
  const target = ref.entity === null ? ref.id : `${ref.entity}:${ref.id}`;
  return ref.record === null ? target : `${ref.record}#${target}`;
}
