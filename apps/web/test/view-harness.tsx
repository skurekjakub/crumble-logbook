import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { Source } from "../src/api/types";
import type { ModeSection } from "../src/app/modes";
import { CONQUEST } from "../src/app/modes";
import { createAppRouter } from "../src/router";
import type { Canned } from "./helpers";
import { stubApi, testQueryClient } from "./helpers";

/** Sources every view test can cite; also answers the root's `/api/sources` query. */
export const VIEW_SOURCES = [
  {
    id: "dc:76135",
    site: "dc",
    url: "https://example.test/dc/76135",
    title: "1T 인증",
    titleEn: "1T screenshot",
    date: "2026-09-20",
    relevance: 3,
    note: null,
    summaryEn: null,
    capturePath: "research/001-guild-conquest-meta/evidence/03-dc-posts/76135.md",
    recordSlug: null,
    records: ["001-guild-conquest-meta"],
  },
  {
    id: "nv:43653",
    site: "nv",
    url: "https://example.test/nv/43653",
    title: "체리덱 정리",
    titleEn: null,
    date: "2026-09-25",
    relevance: 2,
    note: null,
    summaryEn: null,
    capturePath: null,
    recordSlug: null,
    records: ["001-guild-conquest-meta"],
  },
  {
    id: "web:crumbgg:rankings-s5",
    site: "web",
    url: "https://example.test/crumbgg/s5",
    title: "crumb.gg season 5",
    titleEn: null,
    date: null,
    relevance: null,
    note: null,
    summaryEn: null,
    capturePath: "research/001-guild-conquest-meta/evidence/12-crumbgg/s5.json",
    recordSlug: null,
    records: ["001-guild-conquest-meta"],
  },
] satisfies Source[];

/** Options for {@link renderRoute}. */
export interface RenderOptions {
  /** The mode whose research record is answered by default; Guild Conquest unless given. */
  mode?: ModeSection;
}

/**
 * Renders the whole app at `path` against a stubbed API. The mode's
 * research record and the unfiltered source list are answered unless `api`
 * overrides them.
 *
 * @param path - the URL to open, query string included
 * @param api - extra (or overriding) canned responses by request path
 * @param options - the mode the default record belongs to
 * @returns the router, for asserting on its location
 */
export async function renderRoute(
  path: string,
  api: Record<string, Canned> = {},
  { mode = CONQUEST }: RenderOptions = {},
) {
  const slug = mode.recordSlug;
  stubApi({
    ...(slug
      ? {
          [`/api/records/${slug}`]: {
            body: { slug, lede: `${mode.label} research.`, modes: [] },
          },
        }
      : {}),
    "/api/sources": { body: VIEW_SOURCES },
    ...api,
  });
  const router = createAppRouter({
    queryClient: testQueryClient(),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  render(
    <QueryClientProvider client={router.options.context.queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

/**
 * The text of each body row of the table under `root`, cell by cell.
 *
 * @param root - an element containing exactly one table
 * @returns one array of cell texts per `<tbody>` row
 */
export function bodyRows(root: ParentNode): string[][] {
  return [...root.querySelectorAll("tbody tr")].map((tr) =>
    [...tr.querySelectorAll("td")].map((td) => td.textContent),
  );
}
