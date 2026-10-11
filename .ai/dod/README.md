# Definition of done

Per-surface checklists walked item by item before a feature, fix or refactor
is called done. One file per surface: `.ai/dod/<topic>.md` (for example
`api-resource.md` for a new `/api` resource, `web-view.md` for a new tab or
view, `curated-data.md` for a change to a record's `curated/` shape).

- Items are written as **must** (met, or the work isn't done) or **if
  relevant** (met, or the report says why it doesn't apply).
- The code earns the tick. Editing a checklist so the work passes is the one
  move that is never allowed: a wrong item is changed in its own commit, with
  the reason in the commit body.
- "No checklist covers this surface" is a valid outcome; say so in the report
  and the commit body.
- A checklist never restates `AGENTS.md`. Its rules (the UI rules, the
  capture ledger, JSDoc, `pnpm verify`) bind every surface already; walk them
  as part of every DoD pass, and keep these files for what they don't say.
- Add a checklist the second time a reviewer catches the same omission on the
  same kind of surface.

## Template

```markdown
# <Surface> — definition of done

- [ ] **must** — <a checkable statement, with the file or command that proves it>
- [ ] **if relevant** — <…>
```
