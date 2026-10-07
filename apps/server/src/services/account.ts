import type {
  AccountCookieRow,
  AccountParked,
  AccountPet,
  AccountRef,
  AccountResource,
  AccountRoadmapItemRow,
  GameMode,
  GlossaryRow,
} from "@crumble/schema";
import { NotFoundError } from "../errors";
import type { Repos, Store } from "../repos";
import type { NameResolver } from "./names";
import { createNameResolver } from "./names";
import { recordsCovering } from "./records";

/**
 * A cookie or pet name as the account view shows it: the glossary's
 * Korean name and English gloss when the name resolves, and the game
 * resource key its icon is drawn from, when known.
 */
export interface AccountName {
  /** The glossary's Korean name, or the name as the snapshot gives it when unresolved. */
  kr: string;
  /** The glossary's English name, or `null` when unresolved. */
  en: string | null;
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

/**
 * A roadmap item's reference, resolved: the deck or research record it
 * names, with the game mode whose screens show it.
 */
export interface AccountRefView extends AccountRef {
  /** What the chip reads: the roadmap's label, else the deck's name, else the id. */
  label: string;
  /** The game mode whose screens show the row: the deck's, else the record's. */
  mode: GameMode | null;
  /** Whether the named deck or record is loaded. */
  found: boolean;
  /** Whether the named deck is marked obsolete. */
  obsolete: boolean;
}

/** One roadmap item as the account view shows it. */
export type AccountItemView = Omit<AccountRoadmapItemRow, "roadmapId" | "extra" | "refs"> & {
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
 * the Korean name it is keyed by, then by the game resource key, then by
 * any name, shorthand or English gloss, preferring the entries of the
 * records covering the lineup's mode.
 *
 * @param repos - the repos to read the glossary and records from
 * @returns a function from a name, its resource key and its lineup's mode to the view's name
 */
function nameResolver(repos: Repos) {
  const glossary = repos.glossary.list();
  const byKr = new Map(glossary.map((entry) => [entry.kr, entry]));
  const byKey = new Map<string, GlossaryRow>();
  const byEn = new Map<string, GlossaryRow>();
  for (const entry of glossary) {
    const key = entry.extra.resource_key;
    if (typeof key === "string" && !byKey.has(key)) byKey.set(key, entry);
    if (entry.en !== null && !byEn.has(entry.en)) byEn.set(entry.en, entry);
  }
  const resolve: NameResolver = createNameResolver(glossary);
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
    const key = resourceKey ?? (RESOURCE_KEY.test(name) ? name : null);
    const entry = (key === null ? undefined : byKey.get(key)) ?? byKr.get(name);
    if (entry) {
      const own = entry.extra.resource_key;
      return {
        kr: entry.kr,
        en: entry.en ?? en,
        resourceKey: key ?? (typeof own === "string" ? own : null),
      };
    }
    const records = recordsFor(mode);
    const gloss = resolve(name, records).en ?? (en === null ? null : resolve(en, records).en);
    const named = gloss === null ? undefined : byEn.get(gloss);
    if (named) {
      const own = named.extra.resource_key;
      return {
        kr: named.kr,
        en: gloss,
        resourceKey: key ?? (typeof own === "string" ? own : null),
      };
    }
    return { kr: name, en: gloss ?? en, resourceKey: key };
  };
}

/** A game resource key: `cookie` or `pet`, then digits. */
const RESOURCE_KEY = /^(?:cookie|pet)\d+$/;

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
 * Resolves a roadmap reference to the deck or record it names.
 *
 * @param repos - the repos to read decks and records from
 * @param ref - the reference
 * @returns the reference with its label, mode and whether it is loaded
 */
function resolveRef(repos: Repos, ref: AccountRef): AccountRefView {
  const deck = ref.entity === null || ref.entity === "deck" ? repos.decks.get(ref.id) : undefined;
  if (deck) {
    return {
      ...ref,
      entity: "deck",
      label: ref.label ?? deck.nameEn,
      mode: deck.mode,
      found: true,
      obsolete: deck.obsoleteSince !== null,
    };
  }
  const record = ref.record === null ? undefined : repos.records.get(ref.record);
  const source =
    ref.entity === null || ref.entity === "power_source"
      ? repos.powerSources.list().find((row) => row.slug === ref.id)
      : undefined;
  if (source) {
    return {
      ...ref,
      entity: "power_source",
      label: ref.label ?? source.nameEn,
      mode: "team_power",
      found: true,
      obsolete: false,
    };
  }
  return {
    ...ref,
    label: ref.label ?? ref.id,
    mode: record?.mode ?? null,
    found: record !== undefined,
    obsolete: false,
  };
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
    items: repos.account
      .items(id)
      .map(({ roadmapId: _roadmapId, extra: _extra, refs, ...item }) => ({
        ...item,
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
