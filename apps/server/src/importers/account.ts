/**
 * Loads the reader's account audits from `account/` into the database:
 * snapshots (`snapshots/<date>.json`) and roadmaps (`roadmap-<date>.json`),
 * each keyed by its file's name, so older ones stay loaded next to the
 * latest. Everything is read and checked before anything is written, and
 * the write is one transaction.
 *
 * @module
 */
import type {
  AccountRef,
  AccountRoadmapInput,
  AccountSnapshotInput,
  GlossaryRow,
} from "@crumble/schema";
import { accountRoadmapFile, accountSnapshotFile, isoDate } from "@crumble/schema";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ImportError } from "../errors";
import type { Repos, Store } from "../repos";
import { refText, resolveRef } from "../services/account-refs";
import { createNameResolver } from "../services/names";
import { parseFile, readJson } from "./files";

/** The folder under `account/` that holds the snapshots. */
const SNAPSHOT_DIR = "snapshots";

/** A roadmap file's name: `roadmap-<id>.json`. */
const ROADMAP_FILE = /^roadmap-(.+)\.json$/;

/** Words a roadmap item's action should stay within. */
const ACTION_WORDS = 12;

/** Characters past which a roadmap item's `why` no longer reads as one line. */
const WHY_CHARS = 120;

/** One account file found on disk, before it is read. */
export interface AccountFile {
  /** The file's name without `.json` (and without `roadmap-` for a roadmap). */
  id: string;
  /** The day the id leads with, `YYYY-MM-DD`. */
  date: string;
  /** The file's path relative to `account/`. */
  file: string;
}

/** Every snapshot and roadmap file under `account/`, oldest id first. */
export interface AccountFiles {
  snapshots: AccountFile[];
  roadmaps: AccountFile[];
}

/**
 * The day an id leads with, when it leads with one.
 *
 * @param id - a file's id, e.g. `2026-10-07` or `2026-10-07-evening`
 * @returns the `YYYY-MM-DD` day, or `null` when the id doesn't start with a calendar date
 */
function leadingDate(id: string): string | null {
  const day = id.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}(?:$|[^\d])/.test(id) && isoDate.safeParse(day).success ? day : null;
}

/**
 * Lists the snapshot and roadmap files under `account/` whose ids lead
 * with a date, sorted by id; other files are skipped.
 *
 * @param accountDir - absolute path to the account folder
 * @returns the files found
 */
export function listAccountFiles(accountDir: string): AccountFiles {
  /**
   * Lists a folder's JSON files, or none when it doesn't exist.
   *
   * @param dir - the folder
   * @returns the file names, sorted
   */
  const jsonIn = (dir: string) =>
    existsSync(dir)
      ? readdirSync(dir)
          .filter((name) => name.endsWith(".json"))
          .sort()
      : [];
  const snapshots = jsonIn(join(accountDir, SNAPSHOT_DIR)).flatMap((name) => {
    const id = name.slice(0, -".json".length);
    const date = leadingDate(id);
    return date === null ? [] : [{ id, date, file: `${SNAPSHOT_DIR}/${name}` }];
  });
  const roadmaps = jsonIn(accountDir).flatMap((name) => {
    const id = ROADMAP_FILE.exec(name)?.[1];
    const date = id === undefined ? null : leadingDate(id);
    return id === undefined || date === null ? [] : [{ id, date, file: name }];
  });
  return { snapshots, roadmaps };
}

/** Which account files {@link importAccount} loads. */
export interface AccountImportOptions {
  /** Every snapshot and roadmap, not only the latest of each. */
  all?: boolean;
  /** Load these ids (snapshot or roadmap) instead of the latest. */
  ids?: readonly string[];
  /**
   * Replace a snapshot or roadmap that is already loaded. Without it, one
   * named by `ids` is refused, and any other is skipped.
   */
  replace?: boolean;
}

/** A snapshot file, read and validated. */
interface SnapshotPlan extends AccountFile {
  data: AccountSnapshotInput;
}

/** A roadmap file, read and validated. */
interface RoadmapPlan extends AccountFile {
  data: AccountRoadmapInput;
}

/** What {@link importAccount} did. */
export interface AccountImportResult {
  /** The ids of the snapshots loaded, oldest first. */
  snapshots: string[];
  /** The ids of the roadmaps loaded, oldest first. */
  roadmaps: string[];
  /** The files left alone because they are already loaded, relative to `account/`. */
  skipped: string[];
  /** Rows inserted per account table. */
  counts: Record<"snapshots" | "lineups" | "cookies" | "roadmaps" | "items", number>;
  /**
   * Non-fatal findings: a cookie name the glossary doesn't know, an action
   * longer than a line, a roadmap naming a snapshot that isn't loaded, a
   * reference naming nothing loaded, a `same as` note naming no lineup.
   */
  warnings: string[];
}

/**
 * Picks the files to load: every one, the ids asked for, or the latest
 * snapshot and the latest roadmap.
 *
 * @param files - the files found
 * @param opts - what to load
 * @returns the files to load
 * @throws {ImportError} naming an id asked for that no file has
 */
function choose(files: AccountFiles, opts: AccountImportOptions): AccountFiles {
  if (opts.all) return files;
  const ids = opts.ids ?? [];
  if (ids.length === 0) {
    return { snapshots: files.snapshots.slice(-1), roadmaps: files.roadmaps.slice(-1) };
  }
  const known = new Set([...files.snapshots, ...files.roadmaps].map((f) => f.id));
  const unknown = ids.find((id) => !known.has(id));
  if (unknown !== undefined) {
    throw new ImportError("account", null, `no snapshot or roadmap file has the id ${unknown}`);
  }
  return {
    snapshots: files.snapshots.filter((f) => ids.includes(f.id)),
    roadmaps: files.roadmaps.filter((f) => ids.includes(f.id)),
  };
}

/**
 * Checks a roadmap's items against the copy rules: an action of a dozen
 * words or fewer, a `why` of one line.
 *
 * @param plan - the roadmap
 * @returns a warning per item that breaks one
 */
function copyWarnings(plan: RoadmapPlan): string[] {
  return plan.data.items.flatMap((item, index) => {
    const at = `${plan.file} [items.${index}]`;
    const warnings: string[] = [];
    if (item.action.split(/\s+/).length > ACTION_WORDS) {
      warnings.push(`${at}: action is longer than ${ACTION_WORDS} words`);
    }
    if ((item.why?.length ?? 0) > WHY_CHARS) warnings.push(`${at}: why is longer than one line`);
    return warnings;
  });
}

/**
 * Lists the cookie names of a snapshot the glossary doesn't know, by
 * Korean name, resource key, shorthand or English.
 *
 * @param plan - the snapshot
 * @param glossary - every glossary entry
 * @returns a warning per unknown name
 */
function nameWarnings(plan: SnapshotPlan, glossary: readonly GlossaryRow[]): string[] {
  const resolve = createNameResolver(glossary);
  const keys = new Set(glossary.map((entry) => entry.extra.resource_key));
  const unknown = new Set(
    plan.data.lineups.flatMap((lineup) =>
      lineup.cookies
        .filter(
          (c) =>
            resolve(c.name).en === null && (c.resourceKey === null || !keys.has(c.resourceKey)),
        )
        .map((c) => c.name),
    ),
  );
  return [...unknown].map(
    (name) => `${plan.file}: cookie ${name} isn't in the glossary; its icon shows as a badge`,
  );
}

/**
 * Lists the references of a snapshot's lineups and a roadmap's items and
 * parked avenues that name nothing loaded (see `resolveRef`).
 *
 * @param repos - the repos to resolve against
 * @param file - the file the references come from
 * @param refs - each reference with where in the file it sits, e.g. `items.3`
 * @returns a warning per unresolved reference
 */
function refWarnings(
  repos: Repos,
  file: string,
  refs: ReadonlyArray<{ at: string; ref: AccountRef }>,
): string[] {
  return refs
    .filter(({ ref }) => !resolveRef(repos, ref).found)
    .map(({ at, ref }) => `${file} [${at}]: ${refText(ref)} names nothing loaded`);
}

/**
 * Lists every reference of a snapshot (its lineups' matching decks) with
 * where it sits.
 *
 * @param plan - the snapshot
 * @returns the references
 */
function snapshotRefs(plan: SnapshotPlan): Array<{ at: string; ref: AccountRef }> {
  return plan.data.lineups.flatMap((lineup) =>
    lineup.deck === null ? [] : [{ at: `lineups.${lineup.lineup}`, ref: lineup.deck }],
  );
}

/**
 * Lists every reference of a roadmap (its items' and parked avenues'
 * refs) with where it sits.
 *
 * @param plan - the roadmap
 * @returns the references
 */
function roadmapRefs(plan: RoadmapPlan): Array<{ at: string; ref: AccountRef }> {
  return [
    ...plan.data.items.flatMap((item, i) => item.refs.map((ref) => ({ at: `items.${i}`, ref }))),
    ...plan.data.parked.flatMap((avenue, i) =>
      avenue.refs.map((ref) => ({ at: `parked.${i}`, ref })),
    ),
  ];
}

/** What {@link write} wrote, and what it left alone. */
interface Written {
  snapshots: SnapshotPlan[];
  roadmaps: RoadmapPlan[];
  /** The files already loaded and left alone. */
  skipped: string[];
}

/**
 * Writes the snapshots and roadmaps. One already loaded under the same id
 * is replaced when `replace` is set; otherwise it is refused when it was
 * asked for by id, and skipped when it was picked as the latest or as one
 * of every file.
 *
 * @param repos - the transaction's repos
 * @param snapshots - the snapshots to write
 * @param roadmaps - the roadmaps to write
 * @param opts - whether the files were asked for by id, and whether to replace loaded ones
 * @returns what was written and the files skipped
 * @throws {ImportError} naming a snapshot or roadmap asked for by id that is already
 *   loaded, without `replace`
 */
function write(
  repos: Repos,
  snapshots: readonly SnapshotPlan[],
  roadmaps: readonly RoadmapPlan[],
  opts: { named: boolean; replace: boolean },
): Written {
  const isLoaded = {
    snapshot: (s: SnapshotPlan) => repos.account.snapshot(s.id) !== undefined,
    roadmap: (r: RoadmapPlan) => repos.account.roadmap(r.id) !== undefined,
  };
  const loaded = [
    ...snapshots.filter(isLoaded.snapshot).map((s) => s.file),
    ...roadmaps.filter(isLoaded.roadmap).map((r) => r.file),
  ];
  if (loaded.length > 0 && opts.named && !opts.replace) {
    throw new ImportError(loaded[0]!, null, "already loaded; pass --replace to load it again");
  }
  const keep = opts.replace
    ? { snapshots: [...snapshots], roadmaps: [...roadmaps], skipped: [] }
    : {
        snapshots: snapshots.filter((s) => !isLoaded.snapshot(s)),
        roadmaps: roadmaps.filter((r) => !isLoaded.roadmap(r)),
        skipped: loaded,
      };
  for (const s of keep.snapshots) repos.account.removeSnapshot(s.id);
  for (const r of keep.roadmaps) repos.account.removeRoadmap(r.id);
  repos.account.restartIds();
  for (const { id, date, file, data } of keep.snapshots) {
    const { lineups, issues: _issues, ...rest } = data;
    repos.account.insertSnapshot({ id, date, file, ...rest }, lineups);
  }
  for (const { id, date, file, data } of keep.roadmaps) {
    const { items, ...rest } = data;
    repos.account.insertRoadmap({ id, date, file, ...rest }, items);
  }
  return keep;
}

/**
 * Loads account snapshots and roadmaps from `accountDir`: by default the
 * latest snapshot and the latest roadmap, by id. Each is validated (see
 * `@crumble/schema`'s account schemas) before anything is written, and
 * all of them are written in one transaction. A file already loaded is
 * skipped, unless it was asked for by id (refused) or `replace` is set.
 *
 * @param store - the store to load into
 * @param accountDir - absolute path to the account folder
 * @param opts - which files to load, and whether to replace loaded ones
 * @returns what was loaded and skipped, the rows inserted and any warnings
 * @throws {ImportError} when the folder holds no snapshot or roadmap, an id
 *   asked for has no file, a file is missing, malformed or fails its
 *   schema (naming the file and every issue's path), or a snapshot or
 *   roadmap asked for by id is already loaded and `replace` isn't set;
 *   nothing is written
 */
export function importAccount(
  store: Store,
  accountDir: string,
  opts: AccountImportOptions = {},
): AccountImportResult {
  const found = listAccountFiles(accountDir);
  if (found.snapshots.length + found.roadmaps.length === 0) {
    throw new ImportError(
      accountDir,
      null,
      `no snapshots/<date>.json or roadmap-<date>.json to import`,
    );
  }
  const chosen = choose(found, opts);
  const snapshots = chosen.snapshots.map((f) => ({
    ...f,
    data: parseFile(f.file, readJson(accountDir, f.file), accountSnapshotFile),
  }));
  const roadmaps = chosen.roadmaps.map((f) => ({
    ...f,
    data: parseFile(f.file, readJson(accountDir, f.file), accountRoadmapFile),
  }));
  const outcome = store.transaction<Written & { warnings: string[] }>((repos) => {
    const glossary = repos.glossary.list();
    const written = write(repos, snapshots, roadmaps, {
      named: !opts.all && (opts.ids ?? []).length > 0,
      replace: opts.replace ?? false,
    });
    const loaded = new Set(repos.account.snapshots().map((s) => s.id));
    const warnings = [
      ...written.snapshots.flatMap((plan) =>
        plan.data.issues.map((issue) => `${plan.file}: ${issue}`),
      ),
      ...written.snapshots.flatMap((plan) => nameWarnings(plan, glossary)),
      ...written.snapshots.flatMap((plan) => refWarnings(repos, plan.file, snapshotRefs(plan))),
      ...written.roadmaps.flatMap(copyWarnings),
      ...written.roadmaps.flatMap((plan) => refWarnings(repos, plan.file, roadmapRefs(plan))),
      ...written.roadmaps.flatMap((r) =>
        r.data.snapshotId !== null && !loaded.has(r.data.snapshotId)
          ? [`${r.file}: names snapshot ${r.data.snapshotId}, which isn't loaded`]
          : [],
      ),
    ];
    return { ...written, warnings };
  });
  const lineups = outcome.snapshots.flatMap((s) => s.data.lineups);
  return {
    snapshots: outcome.snapshots.map((s) => s.id),
    roadmaps: outcome.roadmaps.map((r) => r.id),
    skipped: outcome.skipped,
    counts: {
      snapshots: outcome.snapshots.length,
      lineups: lineups.length,
      cookies: lineups.reduce((n, lineup) => n + lineup.cookies.length, 0),
      roadmaps: outcome.roadmaps.length,
      items: outcome.roadmaps.reduce((n, r) => n + r.data.items.length, 0),
    },
    warnings: outcome.warnings,
  };
}
