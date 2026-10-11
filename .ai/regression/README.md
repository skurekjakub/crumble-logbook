# Manual regression suites

Click-through checks for behaviour the Vitest suites don't reach well: one file
per domain at `.ai/regression/<domain>.md` (the domains of
`.ai/followups/README.md`), one checkbox per behaviour, each with the route or
entry point and the exact observation that counts as a pass.

- Run them in agent-browser against `pnpm dev` (http://localhost:5173), headed,
  as `AGENTS.md` sets up the browser. A box covering a screen passes only in
  light and dark themes and at phone width.
- A bugfix whose box passed while the bug was live tightens that box; a
  behaviour with no box gets one.
- Boxes describe observable behaviour ("every deck card shows its cookies'
  icons"), never implementation.

```markdown
# <Domain> — regression

- [ ] <route or entry point> — <action> → <what you must see>
```

For example:

```markdown
- [ ] /conquest/decks — load in dark theme at 390 px → every cookie shows an icon or its initials badge, no row scrolls sideways
```
