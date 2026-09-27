import { QueryClient } from "@tanstack/react-query";
import { vi } from "vitest";

/** A canned API response: a JSON body, optionally with a non-200 status. */
export type Canned = { status?: number; body: unknown };

/**
 * Replaces the global `fetch` with one that answers `/api/...` paths from
 * `routes` (keyed by path with its query string). Unknown paths answer 404.
 *
 * @param routes - path (e.g. `/api/decks`) → canned response
 * @returns the mock, for asserting on calls
 */
export function stubApi(routes: Record<string, Canned>) {
  const mock = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    const canned = routes[path] ?? { status: 404, body: { error: "not_found", message: path } };
    const status = canned.status ?? 200;
    return new Response(JSON.stringify(canned.body), {
      status,
      statusText: status === 200 ? "OK" : "Error",
      headers: { "content-type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

/** A query client that never retries, so failed queries settle at once in tests. */
export function testQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}
