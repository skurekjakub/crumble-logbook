# UI surface rules

Read this before landing any feature that adds UI surface to `apps/web`: a
view, a component, a tab, a chart, a stylesheet, anything that lands a colour,
background or border in styles or markup. `AGENTS.md` § UI (scannable, not
prose) is mandatory and comes first; these rules are how the code meets it.

- **Tokens, never literals.** Colours, the type scale, spacing, radii and the
  verdict tints (`--good`, `--warn`, `--bad` and their `-soft` backgrounds)
  come from `apps/web/src/styles/tokens.css`. No hex value appears in any
  other stylesheet or in markup today; keep it that way. A chart's series take
  `--s1`…`--s5` in their fixed order; a new colour is a new token, defined for
  every theme block in `tokens.css`.
- **Every theme, every surface.** `tokens.css` defines light, dark by
  `prefers-color-scheme`, and dark forced by `data-theme`. A new surface
  renders correctly in both themes and at phone width before it ships: check
  it in the Phase 5 smoke test.
- **One styling approach.** Plain CSS classes in `apps/web/src/styles/`, one
  file per area (`conquest.css`, `stage.css`, `attempts.css`, …) imported in
  `apps/web/src/main.tsx`; shared primitives (cards, chips, pills, tables) in
  `components.css`, `ui.css` and `shell.css`. Inline `style` only for a value
  computed at render (a bar's width, a CSS variable like `--clamp`), never for
  a colour literal.
- **Reuse the primitives.** A verdict is a `Pill` (`components/Pill.tsx`), a
  cookie is a `CookieName` or `CookieIcon` (with its initials-badge fallback),
  sources are `SourceChips` at the end of the row, a `why` or note longer than
  one line is a `Clamp`, a loading or failed query goes through `QueryResult`.
  A new view in a mode reads its title and lede from the mode's config
  (`apps/web/src/app/modes/`), with the lede kept to `AGENTS.md`'s bullet limit.
- **Reference component:** `apps/web/src/components/RuneBuilds.tsx`
  (`RuneCard`) — the shape new UI copies. It leads with the verdict (the
  cookie's icon and name, then the recommended/avoid and disputed pills before
  any text), clamps the `why` and the dispute so they expand on demand, puts
  the sources last as chips, styles only through classes over tokens, takes
  the heading level as a prop so it nests correctly, and documents every
  export.
