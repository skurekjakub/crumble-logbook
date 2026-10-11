# The current-state record: README.md

Read this before updating `README.md` in Phase 7.

`README.md` describes the app _as it currently exists_. It is the file a later
session opens to answer "what is here and how do I use it", not "how was this
built" or "what's still pending". Required tone: **spec**: declarative,
current-state, no narrator, nothing anchored to when something happened
("shipped in this round", "previously", "this used to be"), nothing that rots
when the next change lands. A reader who arrives tomorrow should not be able
to tell from it that the feature took several sessions.

## Where a feature's facts go

Edit the section that already owns the fact; don't add a section per feature.

| The feature adds | It lands in |
| --- | --- |
| A folder, package or tool | the **What's here** table, one row |
| A `pnpm` script | the command block under **Development**, **The database** or **Captures** that fits it |
| An `/api` resource or a change to one | the **API** table: verbs, filters, ordering, every 4xx it returns and why |
| An import rule, a curated field, a lifecycle | the prose under **The database** |
| A web section or tab | the `apps/web` row of **What's here**, when it changes what the app covers |
| A working practice an agent needs | **Working notes** |
| A rule the user set | `AGENTS.md`, never the README |
| A tool's tuning or operation | that tool's own README (`tools/conquest-macro/README.md`) |

Always state:

- What the feature does, in active voice, at the level of detail its
  neighbours use (the API table's rows are the bar: ordering, filters,
  validation, each error status).
- The constraint a reader would otherwise break ("ranked by damage, never by
  a ratio"; "`powerG` is read from `teamPower` on every write; a request's
  `powerG` is ignored").
- How to run or check it: the command, the URL, the env var.

Never include:

- Future work or deferred items: follow-up files (`.ai/followups/`) or
  `OPEN-QUESTIONS.md`.
- Status lines, "Track A landed", commit SHAs, branch names, merge dates.
  Dated _measurements_ are fine, as the README's driver note shows.
- Plan or spec file names in prose as the place to learn how something works.
  Specs may be linked as design background ("the design is
  `docs/superpowers/specs/2026-09-28-capture-ledger-design.md`").
- Counts of things the repo holds (`AGENTS.md` § Key directives).

## The update rule

When later work ships, edit the README to describe the new current state. Do
not append a changelog, keep a "shipped" list, or leave a deprecated paragraph
for context: delete it. A removed capability deletes its rows and sentences.
A follow-up whose item ships is deleted by whoever ships it.

Before editing, re-read the section you're changing in full: the README is
dense, and the sentence that contradicts the new behaviour is often two
paragraphs from the one you came to edit.
