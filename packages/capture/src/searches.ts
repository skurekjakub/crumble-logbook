/**
 * A research record's saved searches, `searches.json` at the record's
 * root: what a refresh round reruns before its discovery searches. Each
 * entry names where it runs and what to run there, why it exists, the
 * round that added it, and the last round it found something (a search
 * that finds nothing keeps that date and is never deleted).
 *
 * @module
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isoDate } from "@crumble/schema";
import { z } from "zod";
import { ENDPOINTS } from "./crumbgg";

/** The file's name, at the record folder's root. */
export const SEARCHES_FILE = "searches.json";

/** Where a saved search runs. */
export const SEARCH_KIND = ["dc", "naver", "crumbgg", "youtube", "web"] as const;
/** Where a saved search runs. */
export type SearchKind = (typeof SEARCH_KIND)[number];

/** What every saved search carries besides what to run. */
const common = {
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "expected a lowercase slug"),
  why: z.string().min(1),
  added: isoDate,
  lastHit: isoDate.nullable(),
};

/** A DCInside gallery search: one `pnpm capture dc list` query (`subject:…`, `name:…`, a bare term, `@recommend`). */
const dcSearch = z.strictObject({ ...common, kind: z.literal("dc"), query: z.string().min(1) });

/** A Naver cafe board listing, by the board's menu id (`pnpm capture naver list`). */
const naverBoard = z.strictObject({
  ...common,
  kind: z.literal("naver"),
  menuId: z.number().int().positive(),
});

/** A Naver cafe search, run in the browser. */
const naverSearch = z.strictObject({
  ...common,
  kind: z.literal("naver"),
  query: z.string().min(1),
});

/** A crumb.gg endpoint of `pnpm capture crumbgg`, captured whole every round. */
const crumbggEndpoint = z
  .strictObject({
    ...common,
    kind: z.literal("crumbgg"),
    endpoint: z.string().min(1),
    args: z.array(z.string().min(1)),
  })
  .refine((s) => Object.hasOwn(ENDPOINTS, s.endpoint), {
    message: "not an endpoint of pnpm capture crumbgg",
    path: ["endpoint"],
  })
  .refine(
    (s) =>
      !Object.hasOwn(ENDPOINTS, s.endpoint) || ENDPOINTS[s.endpoint]!.args.length === s.args.length,
    { message: "the wrong number of arguments for the endpoint", path: ["args"] },
  );

/** A YouTube search (`pnpm capture youtube search`). */
const youtubeQuery = z.strictObject({
  ...common,
  kind: z.literal("youtube"),
  query: z.string().min(1),
});

/** A YouTube channel's uploads, by its handle. */
const youtubeChannel = z.strictObject({
  ...common,
  kind: z.literal("youtube"),
  channel: z.string().regex(/^@\S+$/, "expected a channel handle, @name"),
});

/** A web page, captured whole every round. */
const webPage = z.strictObject({ ...common, kind: z.literal("web"), url: z.url() });

/** One saved search. Its last hit, when it has one, is no earlier than the round that added it. */
export const savedSearch = z
  .union([
    dcSearch,
    naverBoard,
    naverSearch,
    crumbggEndpoint,
    youtubeQuery,
    youtubeChannel,
    webPage,
  ])
  .refine((s) => s.lastHit === null || s.lastHit >= s.added, {
    message: "lastHit can't be before added",
    path: ["lastHit"],
  });
/** Output of {@link savedSearch}. */
export type SavedSearch = z.output<typeof savedSearch>;

/** A record's `searches.json`: its saved searches, each id once. */
export const searchesFile = z.array(savedSearch).superRefine((searches, ctx) => {
  const seen = new Set<string>();
  searches.forEach((search, index) => {
    if (seen.has(search.id)) {
      ctx.addIssue({ code: "custom", message: `duplicate id "${search.id}"`, path: [index, "id"] });
    }
    seen.add(search.id);
  });
});

/**
 * Reads and validates a record's saved searches.
 *
 * @param recordDir - absolute path to the record folder
 * @returns the searches, or `null` when the record has no `searches.json`
 * @throws `SyntaxError` when the file isn't JSON, and `ZodError` when it
 *   isn't a valid search list
 */
export function readSearches(recordDir: string): SavedSearch[] | null {
  const file = join(recordDir, SEARCHES_FILE);
  if (!existsSync(file)) return null;
  return searchesFile.parse(JSON.parse(readFileSync(file, "utf-8")));
}
