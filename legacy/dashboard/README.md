# Piñata Raid Logbook

A static single-page app for the Cookie Run: Crumble Guild Conquest (길드 토벌전) meta. It has no build step and no dependencies: plain ES modules plus JSON.

## Run it

Browsers block `fetch()` and module scripts on `file://`, so serve the folder:

```sh
cd "Games/crumble/dashboard"
python -m http.server 8000   # then open http://localhost:8000
```

It also runs as a published Artifact, with every file under this folder published alongside `index.html`.

## Layers

Dependencies point downward only.

| Layer | Folder | Responsibility |
|---|---|---|
| app | `src/app/`, `src/main.js` | Bootstrap, header/footer chrome, tab routing (`#hash` + localStorage) |
| views | `src/views/` | One module per tab. Turns catalog data into markup and wires its own interactions |
| ui | `src/ui/html.js`, `src/ui/components/` | Escaping template helper and reusable, data-agnostic components (chips, lineup grid, tables, gear board, scatter chart) |
| domain | `src/domain/` | Lookups and rules: name resolution via the glossary, deck colours, score math (배 = damage ÷ power, G/T formatting) |
| data | `src/data/` | Loading the manifest and collections; schema validation (reports, never throws) |
| content | `data/*.json` | The research itself. The only thing you edit to add findings |
| style | `styles/` | `tokens.css` (theme tokens, light + dark), `base.css` (frame/type), `components.css` (per-component blocks) |

## Extending

- **New finding in an existing tab:** add a record to the matching `data/*.json`. Cite sources by id (`"dc:76135"`, `"nv:43653"`) and add the id to `data/sources.json`. On load the console lists any record that is missing a required field or references an unknown id.
- **New collection:** add the file, list it in `data/manifest.json`, and add a rule to `SCHEMA` in `src/data/schema.js`.
- **New tab:** create `src/views/<name>.js` that default-exports `{ id, label, render(ctx) → { markup, mount? } }`, then add it to `VIEWS` in `src/views/index.js`. `ctx.cat` is the catalog (`src/domain/catalog.js`), and `ctx.data` is the raw dataset.
- **New component:** put it in `src/ui/components/`. It returns `SafeHtml` from the `html` tag, takes data as arguments and never reads collections itself. Add its CSS block to `components.css`.

## Record conventions

- Damage and power are in **G** (1e9): `1312` is 1.31T. `verified: true` means a screenshot shows the number; otherwise it's a text claim.
- Cookie and pet names are stored in Korean exactly as the community writes them. `glossary.json` maps names and shorthand to the English client names, and components resolve them on display.
- Deck cookies: `{ kr, level, level_rule?, stars?, note?, why }`. `level_rule` states the requirement when a fixed number would be wrong (e.g. "highest possible while ATK < Milk"). `why` is the rationale shown in the deck's "Levels and why" table. Write it as the mechanism, e.g. "kept Lv.1 so Pomegranate's buff never targets it", not as advice.
- Gear slots: `top-left`, `top-right`, `bottom-left`, `bottom-right`; anything else shows as a general note.
- The evidence behind every source id lives in `Games/crumble/research/NNN-*/evidence/`.
