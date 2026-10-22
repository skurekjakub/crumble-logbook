import type {
  AccountCookieRow,
  AccountParked,
  AccountPet,
  AccountResource,
  AccountRoadmapItemRow,
  AccountSize,
  GameMode,
  GlossaryRow,
} from "@crumble/schema";
import { accountSize } from "@crumble/schema";
import { NotFoundError } from "../errors";
import type { Repos, Store } from "../repos";
import type { AccountRefView } from "./account-refs";
import { resolveRef } from "./account-refs";
import type { NameRef } from "./names";
import { RESOURCE_KEY, cookieKey, createEntryFinder, resourceKeyOf } from "./names";
import { recordsCovering } from "./records";

/**
 * A cookie or pet name as the account view shows it: the glossary's
 * Korean name, English gloss and cookie key when the name resolves, and
 * the game resource key its icon is drawn from, when known.
 */
export interface AccountName extends NameRef {
  /** The glossary's Korean name, or the name as the snapshot gives it when unresolved. */
  kr: string;
  /** The game resource key (`cookie0038`), from the snapshot or the glossary. */
  resourceKey: string | null;
}

/** One cookie of a lineup as the account view shows it. */
export type AccountCookieView = Omit<AccountCookieRow, "lineupId" | "extra" | "resourceKey"> &
  AccountName;

/** One lineup of a snapshot as the account view shows it. */
export interface AccountLineupView {
  id: number;
  /** The snapshot's key for the lineup, e.g. `arena_def`. */
  lineup: string;
  label: string | null;
  /** The game mode it plays in, when the snapshot names one the app has. */
  gameMode: GameMode | null;
  power: string | null;
  /** The captain, its name resolved; `null` when the snapshot names none. */
  captain: AccountName | null;
  /** The lineup's pets, their names resolved. */
  pets: AccountName[];
  gearPreset: string | null;
  /** The research deck the lineup matches, resolved. */
  deck: AccountRefView | null;
  /** What the snapshot says instead of listing the cookies. */
  note: string | null;
  cookies: AccountCookieView[];
}

/** One pet as the account view shows it. */
export type AccountPetView = Omit<AccountPet, "key"> & AccountName;

/** An account snapshot as the account view shows it. */
export interface AccountSnapshotView {
  id: string;
  date: string;
  capturedAt: string | null;
  file: string;
  /** The account's own figures: level, combat power, rank. */
  profile: AccountResource[];
  lineups: AccountLineupView[];
  pets: AccountPetView[];
  resources: AccountResource[];
  unread: string[];
}

export type { AccountRefView };

/** One roadmap item as the account view shows it. */
export type AccountItemView = Omit<AccountRoadmapItemRow, "roadmapId" | "extra" | "refs"> & {
  /** How big the payoff is, when the roadmap says: it drives the payoff badge. */
  size: AccountSize | null;
  refs: AccountRefView[];
};

/** A parked avenue as the account view shows it, its references resolved. */
export type AccountParkedView = Omit<AccountParked, "refs"> & { refs: AccountRefView[] };

/** A roadmap as the account view shows it. */
export interface AccountRoadmapView {
  id: string;
  date: string;
  snapshotId: string | null;
  verdict: string | null;
  items: AccountItemView[];
  parked: AccountParkedView[];
}

/** One loaded snapshot or roadmap, as the account view lists them. */
export interface AccountEntry {
  id: string;
  date: string;
}

/**
 * The account view: one snapshot and one roadmap (the latest of each, or
 * the ones asked for), and every loaded snapshot and roadmap, newest first.
 */
export interface AccountOverview {
  /** The snapshot shown; `null` when none is loaded. */
  snapshot: AccountSnapshotView | null;
  /** The roadmap shown; `null` when none is loaded. */
  roadmap: AccountRoadmapView | null;
  snapshots: AccountEntry[];
  roadmaps: AccountEntry[];
}

/** Which snapshot and roadmap {@link AccountService.overview} shows. */
export interface AccountChoice {
  /** The snapshot's id; the latest when omitted. */
  snapshot?: string;
  /** The roadmap's id; the latest when omitted. */
  roadmap?: string;
}

/** Read access to the reader's account snapshots and roadmaps. */
export interface AccountService {
  /**
   * Builds the account view: a snapshot with its names resolved against
   * the glossary, and a roadmap with its references resolved to the decks
   * and records they name.
   *
   * @param choice - the snapshot and roadmap to show; the latest of each when omitted
   * @returns the view; its snapshot and roadmap are `null` when none is loaded
   * @throws {NotFoundError} if a snapshot or roadmap asked for isn't loaded
   */
  overview(choice?: AccountChoice): AccountOverview;
}

/**
 * Resolves the account's cookie and pet names against the glossary: by
 * the game resource key, then by the name as any entry's Korean name,
 * shorthand or English gloss, then by the English name the snapshot gave,
 * preferring the entries of the records covering the lineup's mode.
 *
 * @param repos - the repos to read the glossary and records from
 * @returns a function from a name, its resource key, its lineup's mode and
 *   the snapshot's English name to the view's name
 */
function nameResolver(repos: Repos) {
  const glossary = repos.glossary.list();
  const byResourceKey = new Map<string, GlossaryRow>();
  for (const entry of glossary) {
    const key = resourceKeyOf(entry.extra);
    if (key !== null && !byResourceKey.has(key)) byResourceKey.set(key, entry);
  }
  const find = createEntryFinder(glossary);
  const covering = new Map<GameMode, string[]>();
  /**
   * The records whose glossary entries win a name inside a mode's lineup.
   *
   * @param mode - the lineup's mode
   * @returns their slugs; `[]` without a mode
   */
  const recordsFor = (mode: GameMode | null): string[] => {
    if (mode === null) return [];
    if (!covering.has(mode)) covering.set(mode, recordsCovering(repos, mode));
    return covering.get(mode)!;
  };
  return (
    name: string,
    resourceKey: string | null,
    mode: GameMode | null,
    en: string | null = null,
  ): AccountName => {
    const given = resourceKey ?? (RESOURCE_KEY.test(name) ? name : null);
    const records = recordsFor(mode);
    const entry =
      (given === null ? undefined : byResourceKey.get(given)) ??
      find(name, records) ??
      (en === null ? undefined : find(en, records));
    if (!entry) return { kr: name, en, key: null, resourceKey: given };
    return {
      kr: entry.kr,
      en: entry.en ?? en,
      key: cookieKey(entry),
      resourceKey: given ?? resourceKeyOf(entry.extra),
    };
  };
}

/**
 * Reads the English name a snapshot gave a cookie, kept under its `extra`.
 *
 * @param extra - the cookie's unmapped fields
 * @returns the English name, or `null`
 */
function englishOf(extra: Record<string, unknown>): string | null {
  return typeof extra.en === "string" && extra.en !== "" ? extra.en : null;
}

/**
 * Builds a snapshot's view.
 *
 * @param repos - the repos to read through
 * @param id - the snapshot's id
 * @returns the view
 * @throws {NotFoundError} if the snapshot isn't loaded
 */
function snapshotView(repos: Repos, id: string): AccountSnapshotView {
  const row = repos.account.snapshot(id);
  if (!row) throw new NotFoundError("account snapshot", id);
  const name = nameResolver(repos);
  return {
    id: row.id,
    date: row.date,
    capturedAt: row.capturedAt,
    file: row.file,
    profile: row.profile,
    lineups: repos.account.lineups(id).map((lineup) => ({
      id: lineup.id,
      lineup: lineup.lineup,
      label: lineup.label,
      gameMode: lineup.gameMode,
      power: lineup.power,
      captain: lineup.captain === null ? null : name(lineup.captain, null, lineup.gameMode),
      pets: lineup.pets.map((pet) => name(pet, null, lineup.gameMode)),
      gearPreset: lineup.gearPreset,
      deck: lineup.deck === null ? null : resolveRef(repos, lineup.deck),
      note: lineup.note,
      cookies: lineup.cookies.map(({ lineupId: _lineupId, extra, resourceKey, ...cookie }) => ({
        ...cookie,
        ...name(cookie.name, resourceKey, lineup.gameMode, englishOf(extra)),
      })),
    })),
    pets: row.pets.map(({ key, ...pet }) => ({ ...pet, ...name(pet.name, key, null) })),
    resources: row.resources,
    unread: row.unread,
  };
}

/**
 * Builds a roadmap's view.
 *
 * @param repos - the repos to read through
 * @param id - the roadmap's id
 * @returns the view
 * @throws {NotFoundError} if the roadmap isn't loaded
 */
function roadmapView(repos: Repos, id: string): AccountRoadmapView {
  const row = repos.account.roadmap(id);
  if (!row) throw new NotFoundError("account roadmap", id);
  return {
    id: row.id,
    date: row.date,
    snapshotId: row.snapshotId,
    verdict: row.verdict,
    items: repos.account.items(id).map(({ roadmapId: _roadmapId, extra, refs, ...item }) => ({
      ...item,
      size: accountSize(extra.size),
      refs: refs.map((ref) => resolveRef(repos, ref)),
    })),
    parked: row.parked.map((avenue) => ({
      ...avenue,
      refs: avenue.refs.map((ref) => resolveRef(repos, ref)),
    })),
  };
}

/**
 * Builds an {@link AccountService} over `store`.
 *
 * @param store - the store to read through
 * @returns the service
 */
export function createAccountService(store: Store): AccountService {
  return {
    /** @inheritdoc */
    overview: (choice = {}) => {
      const repos = store.repos;
      const snapshots = repos.account.snapshots().map(({ id, date }) => ({ id, date }));
      const roadmaps = repos.account.roadmaps().map(({ id, date }) => ({ id, date }));
      const snapshot = choice.snapshot ?? snapshots[0]?.id;
      const roadmap = choice.roadmap ?? roadmaps[0]?.id;
      return {
        snapshot: snapshot === undefined ? null : snapshotView(repos, snapshot),
        roadmap: roadmap === undefined ? null : roadmapView(repos, roadmap),
        snapshots,
        roadmaps,
      };
    },
  };
}
