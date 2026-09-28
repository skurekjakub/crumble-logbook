/**
 * crumb.gg's public JSON: the endpoints its rankings, live boards, stats
 * and data pages load, on the site (`/pub/*`, `/data/*`) and on its API
 * host (`/api/*`). Each call saves the body as received under a file name
 * derived from the endpoint and its arguments.
 *
 * @module
 */
import type { CaptureContext } from "./context";
import { exists, logCapture, writeText } from "./context";
import type { HttpOptions } from "./http";
import { DESKTOP_UA, HttpClient } from "./http";

/** The site, which serves `/pub/*` and `/data/*`. */
export const SITE = "https://crumb.gg";

/** The API host, which serves `/api/*`. */
export const API = "https://api.crumb.gg";

/** The pause between requests, in milliseconds. */
export const CRUMBGG_DELAY_MS = 500;

/** One crumb.gg endpoint: how many arguments it takes, and its URL and file name from them. */
export interface Endpoint {
  /** What the arguments are, for the usage line. */
  args: readonly string[];
  /**
   * Builds the endpoint's URL.
   *
   * @param args - the arguments, as many as `args` names
   * @returns the absolute URL
   */
  url: (args: readonly string[]) => string;
  /**
   * Builds the capture's file name.
   *
   * @param args - the arguments
   * @returns the file name, without a folder
   */
  file: (args: readonly string[]) => string;
}

/**
 * Makes an argument safe in a file name.
 *
 * @param text - the argument
 * @returns it with each run of characters other than letters, digits, `_`
 *   and `-` replaced by `_`
 */
function slug(text: string): string {
  return text.replace(/[^\p{L}\p{N}_-]+/gu, "_");
}

/** Every endpoint by command name. */
export const ENDPOINTS: Readonly<Record<string, Endpoint>> = {
  live: {
    args: ["board"],
    url: ([board]) => `${SITE}/pub/live?board=${encodeURIComponent(board!)}`,
    file: ([board]) => `pub-live-${slug(board!)}.json`,
  },
  "live-history": {
    args: ["board", "hours"],
    url: ([board, hours]) =>
      `${SITE}/pub/live-history?board=${encodeURIComponent(board!)}&hours=${encodeURIComponent(hours!)}`,
    file: ([board, hours]) => `pub-live-history-${slug(board!)}-${slug(hours!)}h.json`,
  },
  leaderboard: {
    args: [],
    url: () => `${SITE}/pub/leaderboard`,
    file: () => "pub-leaderboard.json",
  },
  stats: { args: [], url: () => `${SITE}/pub/stats`, file: () => "pub-stats.json" },
  guilds: { args: [], url: () => `${SITE}/pub/guilds`, file: () => "pub-guilds.json" },
  rankings: {
    args: ["kind"],
    url: ([kind]) => `${SITE}/pub/rankings?kind=${encodeURIComponent(kind!)}`,
    file: ([kind]) => `pub-rankings-${slug(kind!)}.json`,
  },
  data: {
    args: ["name"],
    url: ([name]) => `${SITE}/data/${encodeURIComponent(name!)}.json`,
    file: ([name]) => `data-${slug(name!)}.json`,
  },
  "api-meta": { args: [], url: () => `${API}/api/meta`, file: () => "api-meta.json" },
  "api-live": {
    args: ["board"],
    url: ([board]) => `${API}/api/live?board=${encodeURIComponent(board!)}`,
    file: ([board]) => `api-live-${slug(board!)}.json`,
  },
  "api-live-history": {
    args: ["board", "hours"],
    url: ([board, hours]) =>
      `${API}/api/live/history?board=${encodeURIComponent(board!)}&hours=${encodeURIComponent(hours!)}`,
    file: ([board, hours]) => `api-live-history-${slug(board!)}-${slug(hours!)}h.json`,
  },
  "api-rankings": {
    args: ["kind"],
    url: ([kind]) => `${API}/api/rankings?kind=${encodeURIComponent(kind!)}`,
    file: ([kind]) => `api-rankings-${slug(kind!)}.json`,
  },
  "api-lookup-status": {
    args: [],
    url: () => `${API}/api/lookup/status`,
    file: () => "api-lookup-status.json",
  },
  "api-lookup-suggest": {
    args: ["name"],
    url: ([name]) => `${API}/api/lookup/suggest?q=${encodeURIComponent(name!)}`,
    file: ([name]) => `api-lookup-suggest-${slug(name!)}.json`,
  },
};

/**
 * Builds a crumb.gg client: a desktop user agent and the site as referer.
 *
 * @param overrides - hooks for tests (fetch, sleep, log)
 * @returns the client
 */
export function crumbggClient(overrides: Partial<HttpOptions> = {}): HttpClient {
  return new HttpClient({
    userAgent: DESKTOP_UA,
    headers: { Referer: `${SITE}/`, Accept: "application/json" },
    delayMs: CRUMBGG_DELAY_MS,
    ...overrides,
  });
}

/**
 * Captures one endpoint's body as `<outdir>/<file>`, with its ledger line.
 *
 * @param context - the run
 * @param outdir - the record-relative folder, under `evidence/`
 * @param command - an {@link ENDPOINTS} key
 * @param args - the endpoint's arguments
 * @returns the record-relative path written
 * @throws if the command is unknown or takes other arguments, the file
 *   already exists, the endpoint doesn't answer 200 after its retries, or
 *   the file or its ledger line can't be written
 */
export async function crumbggCapture(
  context: CaptureContext,
  outdir: string,
  command: string,
  args: readonly string[],
): Promise<string> {
  const endpoint = ENDPOINTS[command];
  if (!endpoint) throw new Error(`unknown crumb.gg endpoint: ${command}`);
  if (args.length !== endpoint.args.length) {
    throw new Error(`crumbgg ${command} takes: ${endpoint.args.join(" ") || "no arguments"}`);
  }
  const path = `${outdir}/${endpoint.file(args)}`;
  if (exists(context, path)) throw new Error(`${path} already exists`);
  const url = endpoint.url(args);
  const response = await context.http.get(url);
  if (!response) throw new Error(`${url} did not answer 200`);
  const at = context.now();
  writeText(context, path, await response.text());
  logCapture(context, path, url, at);
  context.log(`saved ${path}`);
  return path;
}
