import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SourceSite } from "@crumble/schema";
import { openDb } from "../src/db/client";
import { createStore } from "../src/repos";
import type { Store } from "../src/repos";

/**
 * Creates a fresh in-memory {@link Store} with every migration applied.
 * Each call gets its own isolated database, so tests don't share state.
 *
 * @returns a new store backed by an in-memory SQLite database
 */
export function testStore(): Store {
  return createStore(openDb(":memory:"));
}

/**
 * Inserts a minimal source row, for use as a citation target in tests. The
 * site is derived from the id's `<site>:` prefix.
 *
 * @param store - the store to insert into
 * @param id - a `<site>:<key>` source id, e.g. `dc:1`
 * @throws if `id` already exists, or has no recognizable `<site>:` prefix
 */
export function addSource(store: Store, id: string): void {
  const site = id.split(":")[0] as SourceSite;
  store.repos.sources.insert({ id, site, url: `https://example.test/${id}` });
}

/**
 * Builds a JSON POST/PATCH request init, for use with `app.request`.
 *
 * @param body - the value to send, serialized as JSON
 * @returns a `POST` request init with a JSON content type; override
 *   `method` for a `PATCH`
 */
export function jsonBody(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

/** A curated gear build's citations: its own sources, and its obsolete reason's. */
export interface CuratedGearBuild {
  sources: string[];
  obsolete?: { sources: string[] };
}

/**
 * Reads a record's curated gear builds, from the file its curated manifest
 * lists under `gearBuilds`.
 *
 * @param recordDir - absolute path to the record directory
 * @returns the builds, unchecked; `[]` when the manifest lists no gear builds
 */
export function curatedGearBuilds(recordDir: string): CuratedGearBuild[] {
  const curated = join(recordDir, "curated");
  const manifest = JSON.parse(readFileSync(join(curated, "manifest.json"), "utf-8")) as {
    collections: { gearBuilds?: string };
  };
  const file = manifest.collections.gearBuilds;
  if (file === undefined) return [];
  return (JSON.parse(readFileSync(join(curated, file), "utf-8")) as { builds: CuratedGearBuild[] })
    .builds;
}

/**
 * Parses a response body as JSON with a caller-asserted shape, for test assertions only.
 *
 * @param res - the response
 * @returns the parsed body, unchecked
 */
export async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}
