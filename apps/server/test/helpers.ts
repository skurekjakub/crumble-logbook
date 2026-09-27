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

/** A JSON POST/PATCH request init, for use with `app.request`. */
export function jsonBody(body: unknown): RequestInit {
  return { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

/** Parses a response body as JSON with a caller-asserted shape, for test assertions only. */
export async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}
