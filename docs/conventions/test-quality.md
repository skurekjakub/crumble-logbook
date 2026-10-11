# Test quality

`rubber-duk-tests` writes and audits tests against this file. The runner's mechanics are in
`stack-profile.md` § Unit tests; where a file goes is `test-layout.md`.

**North star: would this test fail if the code under test were broken?** If you can invert the unit's
logic (flip a comparison, drop a branch, return the input unchanged) and the test stays green, it is
theater. This outranks every principle below.

## P1 — Behaviour over implementation

- **Server:** assert the HTTP answer, status and JSON body, from `app.request()` (`readJson` in
  `test/helpers.ts`). A service or repo test asserts what it returns, or what a later read returns.
- **Web:** assert what the reader sees. Find elements by role, label or text (`screen.findByRole`,
  `within`), and read a table through `bodyRows`.
- **Classes:** jsdom loads no stylesheet, so a class is the only observable for a visual verdict.
  `toHaveClass` is fine when the class is the contract: a `Pill` tone (`t-good`, `t-bad`), a chip kind.
- **Forbidden:** a class or `querySelector` as a locator where a role or text exists; computed styles or
  colour literals; call counts on a mock when an output exists. A mock is the output only when the call
  is the contract: a component's `onChange`, the `console.error` an unexpected 500 must log.

## P2 — Mock only at boundaries

- **The boundaries here:**
  - `fetch`: `stubApi` in the web tests, `fakeFetch` injected into the scrapers' `HttpClient`;
  - the filesystem: a `mkdtempSync` folder, removed in `afterEach`, passed in where the code takes a
    path (`createAttemptsRepo(dir)`);
  - `console`, and the browser APIs jsdom lacks (`apps/web/test/setup.ts`).
- **Real, not mocked:** the database (`testStore()` is SQLite in memory with every migration applied),
  the Hono app, the router, and the query client (`testQueryClient()`, retries off).
- **Forbidden:** `vi.mock` of a repo, a service or any module of the code under test. The suite has
  none; keep it that way. If a unit can't be tested without mocking its internals, the design is too
  coupled; say so.

## P3 — No brittle assertions

- **Forbidden:** snapshot assertions (`toMatchSnapshot`), whole-DOM comparisons, styles, colour
  literals, the real date, absolute paths, and an order the code doesn't promise.
- **Required:** when an API promises an order (scores by damage, clears by stage reached then lowest
  power), assert the order; it is the contract.
- Importer tests over committed records pin exact figures (row counts, a named score). A change to a
  record's curated data updates them in the same commit; it never loosens them to `> 0`.

## P4 — Mutation-resistant

- **Forbidden as the only assertion:** `toBeDefined`, `toBeTruthy`, `not.toThrow`, `toHaveLength(n)`
  on a shape. `expect(await screen.findByRole(…)).toBeTruthy()` waits for a render; assertions on
  content follow it.
- **Required:** a bare "it throws" only when throwing is the whole contract, and then match the
  error's message (`toThrow(/already has a ledger/)`).
- **Required practice:** break the code on purpose and watch the test go red before you trust it.

## P5 — Isolated and deterministic

- **Required:**
  - a fresh `testStore()` or `createTestDb()` for a test that writes; a store shared through
    `beforeAll`, for an import too slow to repeat (`app.smoke.test.ts`), is only read;
  - `stubApi` per test (`setup.ts` unstubs globals after each);
  - spies restored by the test that made them (`mockRestore`), since no config restores them;
  - dates as literal strings in fixtures; code that needs "now" takes it as an argument, or the test
    uses `vi.setSystemTime`.
- **Forbidden:** live network, the real clock, `data/crumble.db`, the macro's run files, and order
  dependence between tests.
- **Slow suites** (the ledger check, whole-record imports) set their own timeout on the `describe`,
  `it` or `beforeAll`; never raise the global one.

## P6 — Hygiene

- One behaviour per `it()`, named as a sentence about it ("skips a row it can't read, such as one the
  macro is still writing"). `describe` names the unit or the endpoint (`GET /api/attempts`).
- No phase labels: the body reads arrange, act, assert from top to bottom, and no comment restates the
  test's name (`comment-policy.md` § Tests).
- Helper functions in a test file carry JSDoc, as everywhere else.
- No leftover `.only` or `.skip`.

## Severity (for audits)

| Severity  | Meaning                                                                             |
| --------- | ----------------------------------------------------------------------------------- |
| BLOCKER   | False confidence: green while the code is broken, or verifies mocks instead of code |
| IMPORTANT | P1, P2, P3 or P5 violated                                                           |
| NIT       | P6                                                                                  |
