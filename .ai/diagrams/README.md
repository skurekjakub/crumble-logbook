# Diagrams

Orientation maps a fresh agent reads before touching a subsystem: one file per
subsystem at `.ai/diagrams/<subsystem>.md` (Mermaid or ASCII inside Markdown).
A diagram naming a deleted module or a renamed layer is confidently wrong yet
read as ground truth, so the workflows re-verify every path, module, function
and route a touched diagram names before they finish.

- Current state only: no historical framing, branch names or commit SHAs.
- A subsystem that gains a new layer, engine or data-access pattern gets a
  diagram and a row below.
- A diagram never restates a rule the code enforces. The server's layering is
  `apps/server/test/architecture.test.ts`; a diagram of it points there.

## Reading order

Until the first diagram exists, orient from these, in order:

1. `README.md` § What's here and § API — the workspace layout and every
   resource.
2. `apps/server/test/architecture.test.ts` — the import rules between
   `routes → services → repos → db`, the importers, the CLIs and the packages.
3. `apps/server/src/registry.ts` — the content-type registry every server
   layer derives from.
4. `apps/web/src/app/modes/index.ts` — the web app's sections and tabs, as
   data.

| Diagram | Subsystem | Read when |
| --- | --- | --- |
