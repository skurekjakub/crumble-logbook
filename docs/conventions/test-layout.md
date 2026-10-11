# Test layout

Where tests live, so `rubber-duk-tests` puts a new file where the next reader looks for it.

- **Every test is `*.test.ts` or `*.test.tsx`, in its package's `test/` folder**, never beside the
  source. The root `vitest.config.ts` lists the projects; a package outside that list runs no tests.
- **`apps/server/test/`** mirrors the server's layers: a test of `src/routes/decks.ts` is
  `test/routes/decks.test.ts`, and so on for `services/`, `repos/`, `importers/` and `db/`. Tests of the
  app as a whole (`architecture`, `registry`, `app.smoke`) sit at the top.
- **`apps/web/test/`** is flat, named for what it covers:
  - `<area>-view.test.tsx` or `<area>-views.test.tsx` renders the app at a URL through
    `renderRoute` (`view-harness.tsx`);
  - `<module>-lib.test.ts` covers a pure module of `src/lib/`;
  - a component test is named after the component (`data-table.test.tsx`) and calls `render` itself.
- **`packages/*/test/` and `tools/conquest-hud/test/`** are flat, named for the source module (`ledger.test.ts`) or the contract (`records.test.ts`) they
  cover.
- **Integration tests** (real modules together, fakes only at the process boundary):
  - server route tests build the real app over an in-memory database,
    `createApp(createServices(testStore()))`, and call `app.request()`; a route that reads local files
    gets a temp folder (`createAttemptsRepo(dir)`);
  - importer tests and `app.smoke.test.ts` import committed research records from `research/` into
    `testStore()`;
  - web view tests render the whole router; only `fetch` is stubbed, by `stubApi`, and a path with no
    canned answer gets a 404;
  - capture tests run the scrapers against `fakeFetch` and frozen captures;
  - `packages/capture/test/records.test.ts` verifies every research record's capture ledger against
    the evidence on disk, so a missing ledger line or an edited capture fails `pnpm verify`.
- **Helpers** live in each package's `test/helpers.ts` (`helpers.tsx` in the web app), plus
  `apps/web/test/view-harness.tsx` and `apps/web/test/setup.ts`. A helper shared across files gets
  full JSDoc; ESLint exempts only `*.test.*` files.
- **Fixtures** are frozen and committed:
  - `packages/capture/test/fixtures/` holds verbatim captures, kept byte for byte (prettier skips them);
  - `apps/server/test/importers/fixtures/` holds small records and account files;
  - the HUD tests draw synthetic screens in `tools/conquest-hud/test/helpers.ts`;
  - web fixtures are typed constants in the test file or in `view-harness.tsx`.
- **Live data:** committed research records are fair input; the local `data/crumble.db`, `account/`
  screenshots and the macro's run files never are.
- **Run one file:** `pnpm exec vitest run <path>`; a folder works too (`pnpm exec vitest run packages/schema`).
  A bare `vitest run` is blocked by the `prefer-verify-script` hook; the whole suite runs in `pnpm verify`.
