# Comment policy

The `rubber-duk-*` agents grade every comment a diff adds against this file. The rule itself is
`AGENTS.md` (JSDoc on every function); ESLint enforces its shape through `tools/eslint-config/index.ts`.
Where this file and `AGENTS.md` disagree, `AGENTS.md` wins.

A comment takes one of the shapes below. Anything else is a finding.

## 1. JSDoc, TSDoc-style — API documentation

- **Required on** every function, method, class and interface method, exported or not: declarations,
  arrows and function expressions bound to a `const`, object-literal methods, and function-typed
  interface members. Inline callbacks (a column's `cell`, a `queryFn`, a `.map` arrow) need none.
  Interfaces and type aliases get a one-line `/** … */` too, and so does a field whose name doesn't say
  enough.
- **Required content:**
  - a summary of what it does;
  - `@param name - …` for every parameter, saying what the name doesn't (units, range, what `null`
    means, an example such as `` `dc:1` ``);
  - `@returns …` when it returns a value;
  - `@throws …` for how it fails, whenever it throws or lets an error through that a caller must handle.
    The type is optional (`@throws {ConflictError} …` or `@throws if the file is missing`).
- **Tags:** TSDoc's `@typeParam` for a type parameter; `@module` on a file's overview comment. Types stay
  in TypeScript, never in tags.
- **Forbidden:** restating the signature (`@param id - The id.`), walking through the implementation
  step by step, naming the callers.

## 2. Inline comments — at gotchas only

- **Required:** on the line that would surprise a careful reader: a workaround, an ordering constraint, a
  non-obvious invariant, a jsdom or platform quirk. As long as the point needs, and no longer. An
  external constraint carries a locator that resolves (an issue URL, a docs section).
- **Required:** a switched-off lint rule says why on the line above it, as every rule in
  `tools/eslint-config/index.ts` does.
- **Forbidden:** narrating what the next line does, section banners, authorship, a `TODO` with no issue.
  An inline comment that is really a function's contract belongs in that function's JSDoc.

## The voice test

Apply it to every sentence: _would this still be true and useful if a different caller used this
tomorrow?_ If not, it is narrative, and narrative belongs elsewhere:

| It's actually…                                 | It goes in…                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| Why you chose this, alternatives discarded     | the commit message body (`git commit -F <file>`)                           |
| A behaviour that must keep working             | a test, named for the behaviour                                            |
| History ("was X, now Y", "after the refactor") | git log                                                                    |
| A fact about today's data or a record          | the research record's `README.md`, or the repo `README.md` for a procedure |
| A plan, a spec, an open decision               | `docs/superpowers/plans/`, `docs/superpowers/specs/`, `OPEN-QUESTIONS.md`  |

## No archaeology

When code is removed or replaced, remove every comment that mentions the old shape, and write the rest
as if the code had always been this way. No "replaces X", "now uses Y", "kept for compatibility with the
old…".

## No counting

`AGENTS.md` § Key directives applies to comments: don't write how many of something there is, and don't
type a roster into a sentence; name the constant, file or folder that holds the list. A count stays only
when the number is the point (a threshold, a timeout, a measured figure).

## Tests

- An `it()` body needs no JSDoc and no phase labels: the test's name states the behaviour, and the body
  reads arrange, act, assert from top to bottom. Don't restate the name in a comment.
- A helper function in a test file, or in a shared `test/helpers.ts`, carries full JSDoc like any other
  function. ESLint checks the shared helpers; `*.test.*` files are exempt from the lint rule but not
  from `AGENTS.md`.
- An inline comment in a test marks a gotcha, as anywhere else: why a timeout is long, why jsdom needs
  a stub.
