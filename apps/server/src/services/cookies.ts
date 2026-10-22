import type { GameMode, GlossaryRow } from "@crumble/schema";
import { GAME_MODE } from "@crumble/schema";
import { NotFoundError } from "../errors";
import type { Store } from "../repos";
import type { ContentView, RegisteredService } from "./content";
import type { DeckCookieView, DeckService, DeckView } from "./decks";
import { cookieKey, createEntryFinder, recordsOf } from "./names";
import type { RuneBuildService, RuneBuildView } from "./rune-builds";

/** A usage figure as the usage route returns it. */
export type UsageView = ContentView<"usageStats">;

/** A cookie as the cookie index lists it. */
export interface CookieSummary {
  /** The cookie's key (`cookieKey`): its page's path segment. */
  key: string;
  /** The glossary's Korean name. */
  kr: string;
  /** The glossary's English name, or `null` when it has none. */
  en: string | null;
  /** The element's English half (`Fire` of `불/Fire`), or `null` when unknown. */
  element: string | null;
  /** The class's English half (`Tank` of `방어/Tank`), or `null` when unknown. */
  class: string | null;
  rarity: string | null;
  /** The game modes a rune build, deck slot or usage figure names it in, in `GAME_MODE` order. */
  modes: GameMode[];
}

/** A name a rune build, deck slot or usage figure gives that no glossary entry matches. */
export interface UnresolvedName {
  /** The name as written. */
  name: string;
  /** The game modes it is written in, in `GAME_MODE` order. */
  modes: GameMode[];
}

/** The cookie index: every cookie the glossary holds, and the names it doesn't know. */
export interface CookieIndex {
  /** Ordered by English name, then the cookies without one by Korean name. */
  cookies: CookieSummary[];
  /** Ordered by name. */
  unresolved: UnresolvedName[];
}

/** A deck a cookie plays in, and the slot it holds there. */
export interface CookieDeckSlot {
  deck: DeckView;
  /** The cookie's first slot in the deck. */
  slot: DeckCookieView;
}

/** What one game mode's research says about a cookie. */
export interface CookieModeBlock {
  mode: GameMode;
  /** Its rune builds, obsolete ones included, in the rune builds' list order. */
  runeBuilds: RuneBuildView[];
  /** The decks it plays in, obsolete ones included, in the decks' list order. */
  decks: CookieDeckSlot[];
  /** The usage figures of it, or of a core or team it belongs to, highest first. */
  usage: UsageView[];
}

/** One cookie's page: its summary, skill, and a block per game mode that names it. */
export interface CookieDetail extends CookieSummary {
  /** The English name of its skill, or `null` when the glossary has none. */
  skill: string | null;
  /** In `GAME_MODE` order; a mode that names the cookie nowhere has no block. */
  blocks: CookieModeBlock[];
}

/**
 * Read access to the cookies: each glossary cookie with what every mode's
 * rune builds, decks and usage figures say about it. A row's name resolves
 * against its own record's glossary entries first, and counts for a cookie
 * only when the entry it resolves to is one; pets never count.
 */
export interface CookieService {
  /**
   * Lists every cookie the glossary holds, once per key, and every name
   * that matches no glossary entry.
   *
   * @returns the index
   */
  list(): CookieIndex;
  /**
   * Builds one cookie's page.
   *
   * @param key - the cookie's key
   * @returns the cookie's summary, skill and blocks
   * @throws {NotFoundError} if no glossary cookie has `key`
   */
  get(key: string): CookieDetail;
}

/** The services whose views the cookies service gathers. */
export interface CookieSources {
  runeBuilds: RuneBuildService;
  decks: DeckService;
  usageStats: RegisteredService<"usageStats">;
}

/** What every mode says about each cookie, and the names no entry matches. */
interface Gathered {
  /** Cookie key → mode → that mode's block. */
  blocks: Map<string, Map<GameMode, CookieModeBlock>>;
  /** Name as written → the modes it is written in. */
  unresolved: Map<string, Set<GameMode>>;
}

/**
 * Reads the English half of a bilingual glossary value.
 *
 * @param value - the stored value, e.g. `불/Fire`, `Grass` or `null`
 * @returns the part after the last `/`, trimmed; `null` when that is empty
 *   or there is no value
 */
function englishHalf(value: string | null): string | null {
  const half = value?.split("/").at(-1)?.trim();
  return half ? half : null;
}

/**
 * Sorts a set of game modes into `GAME_MODE` order.
 *
 * @param modes - the modes
 * @returns them, ordered
 */
function inModeOrder(modes: Iterable<GameMode>): GameMode[] {
  const present = new Set(modes);
  return GAME_MODE.filter((mode) => present.has(mode));
}

/**
 * Orders cookie rows by English name, the rows without one after them by
 * Korean name.
 *
 * @param a - one row
 * @param b - the other
 * @returns a negative number when `a` sorts first, positive when `b` does
 */
function byName(a: GlossaryRow, b: GlossaryRow): number {
  if (a.en && b.en) return a.en.localeCompare(b.en, "en");
  if (a.en || b.en) return a.en ? -1 : 1;
  return a.kr.localeCompare(b.kr, "ko");
}

/**
 * Builds a {@link CookieService} over `store`, gathering the views of
 * `sources`.
 *
 * @param store - the store to read the glossary through
 * @param sources - the services whose views each cookie's blocks hold
 * @returns the service
 */
export function createCookieService(store: Store, sources: CookieSources): CookieService {
  /**
   * The glossary's cookies, the first entry of each key standing for it.
   *
   * @returns key → entry, in {@link byName} order
   */
  const cookieEntries = (): Map<string, GlossaryRow> => {
    const byKey = new Map<string, GlossaryRow>();
    for (const entry of store.repos.glossary.list("cookie").sort(byName)) {
      const key = cookieKey(entry)!;
      if (!byKey.has(key)) byKey.set(key, entry);
    }
    return byKey;
  };

  /**
   * Resolves every name the rune builds, deck slots and usage figures give,
   * and files each row under the cookies it names.
   *
   * @returns the blocks per cookie and the unresolved names
   */
  const gather = (): Gathered => {
    const find = createEntryFinder(store.repos.glossary.list());
    const gathered: Gathered = { blocks: new Map(), unresolved: new Map() };
    /**
     * Resolves one name a row gives, noting it when nothing matches.
     *
     * @param name - the name as written
     * @param row - the row, whose own record's entries win
     * @param mode - the row's game mode
     * @returns the cookie's key, or `undefined` when the name isn't a cookie's
     */
    const cookieOf = (name: string, row: unknown, mode: GameMode): string | undefined => {
      const entry = find(name, recordsOf(row));
      if (entry) return cookieKey(entry) ?? undefined;
      const modes = gathered.unresolved.get(name) ?? new Set();
      gathered.unresolved.set(name, modes.add(mode));
      return undefined;
    };
    /**
     * The block of a cookie in a mode, made empty on first use.
     *
     * @param key - the cookie's key
     * @param mode - the game mode
     * @returns the block
     */
    const blockOf = (key: string, mode: GameMode): CookieModeBlock => {
      const modes = gathered.blocks.get(key) ?? new Map<GameMode, CookieModeBlock>();
      gathered.blocks.set(key, modes);
      const block = modes.get(mode) ?? { mode, runeBuilds: [], decks: [], usage: [] };
      modes.set(mode, block);
      return block;
    };
    for (const build of sources.runeBuilds.list()) {
      const key = cookieOf(build.cookieKr, build, build.mode);
      if (key) blockOf(key, build.mode).runeBuilds.push(build);
    }
    for (const deck of sources.decks.list()) {
      const placed = new Set<string>();
      for (const slot of deck.cookies) {
        const key = cookieOf(slot.cookieKr, deck, deck.mode);
        if (!key || placed.has(key)) continue;
        placed.add(key);
        blockOf(key, deck.mode).decks.push({ deck, slot });
      }
    }
    for (const figure of sources.usageStats.list()) {
      if (figure.kind === "pet") continue;
      const names = figure.kind === "cookie" ? [figure.subject] : (figure.members ?? []);
      const keys = new Set(names.map((name) => cookieOf(name, figure, figure.mode)));
      for (const key of keys) if (key) blockOf(key, figure.mode).usage.push(figure);
    }
    return gathered;
  };

  /**
   * Builds a cookie's summary.
   *
   * @param key - its key
   * @param entry - the glossary entry standing for it
   * @param blocks - its blocks, by mode
   * @returns the summary
   */
  const summaryOf = (
    key: string,
    entry: GlossaryRow,
    blocks: ReadonlyMap<GameMode, CookieModeBlock> | undefined,
  ): CookieSummary => ({
    key,
    kr: entry.kr,
    en: entry.en,
    element: englishHalf(entry.element),
    class: englishHalf(entry.class),
    rarity: entry.rarity,
    modes: inModeOrder(blocks?.keys() ?? []),
  });

  return {
    /** @inheritdoc */
    list: () => {
      const { blocks, unresolved } = gather();
      return {
        cookies: [...cookieEntries()].map(([key, entry]) => summaryOf(key, entry, blocks.get(key))),
        unresolved: [...unresolved]
          .map(([name, modes]) => ({ name, modes: inModeOrder(modes) }))
          .sort((a, b) => a.name.localeCompare(b.name, "en")),
      };
    },
    /** @inheritdoc */
    get: (key) => {
      const entry = cookieEntries().get(key);
      if (!entry) throw new NotFoundError("cookie", key);
      const modes = gather().blocks.get(key);
      const skill = entry.extra.skill_en;
      return {
        ...summaryOf(key, entry, modes),
        skill: typeof skill === "string" && skill !== "" ? skill : null,
        blocks: inModeOrder(modes?.keys() ?? []).map((mode) => modes!.get(mode)!),
      };
    },
  };
}
