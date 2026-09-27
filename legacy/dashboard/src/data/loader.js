/**
 * Loads the dataset described by `data/manifest.json`.
 *
 * The manifest maps collection names to JSON files:
 *   { "collections": { "decks": "decks.json", "runes": "runes.json", ... } }
 * Adding a collection means adding a file and a manifest entry; nothing here changes.
 */

/** Raised when the manifest or a collection file cannot be fetched or parsed. */
export class DataLoadError extends Error {
  /**
   * @param {string} file - the file that failed, relative to the data folder
   * @param {string} reason - what went wrong
   */
  constructor(file, reason) {
    super(`Could not load data/${file}: ${reason}`);
    this.file = file;
  }
}

/**
 * Fetch and parse one JSON file.
 * @param {URL} base - URL of the data folder (with trailing slash)
 * @param {string} file - path relative to `base`
 * @returns {Promise<any>} the parsed JSON
 * @throws {DataLoadError} on HTTP errors, network failure or invalid JSON
 */
async function fetchJson(base, file) {
  let res;
  try {
    res = await fetch(new URL(file, base), { cache: "no-cache" });
  } catch (e) {
    throw new DataLoadError(file, `network error (${e.message}). Opening index.html straight from disk blocks fetch; serve the folder over HTTP instead`);
  }
  if (!res.ok) throw new DataLoadError(file, `HTTP ${res.status}`);
  try {
    return await res.json();
  } catch (e) {
    throw new DataLoadError(file, `invalid JSON (${e.message})`);
  }
}

/**
 * Load every collection listed in the manifest.
 * @param {string|URL} [dataUrl="data/"] - the data folder, resolved against the page URL
 * @returns {Promise<Record<string, any>>} collection name → parsed contents
 * @throws {DataLoadError} if the manifest or any listed file fails to load
 */
export async function loadDataset(dataUrl = "data/") {
  const base = new URL(dataUrl, document.baseURI);
  const manifest = await fetchJson(base, "manifest.json");
  const entries = Object.entries(manifest.collections || {});
  const loaded = await Promise.all(entries.map(([, file]) => fetchJson(base, file)));
  return Object.fromEntries(entries.map(([name], i) => [name, loaded[i]]));
}
