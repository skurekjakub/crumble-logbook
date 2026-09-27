/**
 * Read-only lookups over a loaded dataset: cookie/pet name resolution, decks, sources.
 * Views ask the catalog; they never index raw collections themselves.
 */

/** Categorical series slots available in tokens.css (--s1 … --s5); later decks share --s0. */
const SERIES_SLOTS = 5;

/**
 * Coerce a value to an array: arrays pass through, null/undefined become [], scalars are wrapped.
 * @param {any} x
 * @returns {any[]}
 */
export const list = x => Array.isArray(x) ? x : (x == null || x === "" ? [] : [x]);

/**
 * Build the catalog.
 * @param {Record<string, any>} data - output of loadDataset
 * @returns {Catalog}
 */
export function createCatalog(data) {
  const names = new Map();
  for (const g of list(data.glossary)) {
    for (const key of [g.kr, ...list(g.kr_short), g.en]) {
      if (key) names.set(normal(key), g);
    }
  }
  const decks = list(data.decks);
  const deckById = new Map(decks.map((d, i) => [d.id, { ...d, order: i }]));
  const sources = data.sources || {};

  return {
    data,

    /**
     * Resolve a Korean name, forum shorthand or English name.
     * @param {string} s
     * @returns {{kr: string, en: string, entry: object|null}} `en` is "" when unknown
     */
    name(s) {
      const g = names.get(normal(s));
      return g ? { kr: g.kr || s, en: g.en || "", entry: g } : { kr: String(s ?? ""), en: "", entry: null };
    },

    /** @returns {object[]} decks in display order */
    decks: () => decks,

    /**
     * @param {string} id
     * @returns {object|undefined} the deck with its display `order`
     */
    deck: id => deckById.get(id),

    /**
     * English display name for a deck id; falls back to the id, or "Other" when empty.
     * @param {string} id
     * @returns {string}
     */
    deckName: id => deckById.get(id)?.name_en || id || "Other",

    /**
     * CSS color for a deck's chart series, stable per deck regardless of filters.
     * @param {string} id
     * @returns {string} a var(--sN) reference
     */
    deckColor(id) {
      const d = deckById.get(id);
      return d && d.order < SERIES_SLOTS ? `var(--s${d.order + 1})` : "var(--s0)";
    },

    /**
     * @param {string} id - e.g. "dc:76135", "nv:43653"
     * @returns {{url?: string, title?: string, date?: string}|undefined}
     */
    source: id => sources[id],

    /** @returns {[string, object][]} all sources, newest first */
    sources: () => Object.entries(sources).sort((a, b) => String(b[1].date || "").localeCompare(String(a[1].date || ""))),
  };
}

/** Normalize a lookup key: trim, lowercase, collapse whitespace. */
function normal(s) {
  return String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** @typedef {ReturnType<typeof createCatalog>} Catalog */
