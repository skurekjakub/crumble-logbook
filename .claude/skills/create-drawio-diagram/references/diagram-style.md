# Diagram style — skurekjakub-dev

Diagrams here are **figures in a printed journal**, not SaaS architecture
posters. The page already has a voice — warm paper, ink lines, one burnt-orange
accent, mono stamps for metadata — and a diagram is typeset in that voice. If a
screenshot of the diagram could sit in a random Medium post without looking out
of place, it is wrong.

The exporter derives dark-theme colors automatically (`light-dark()` pairs:
ink → `#d6d5d2`, muted → `#8b8780`, paper → `#171612` — all close to the site's
dark tokens). Author **light-theme hexes only**; verify dark on the rendered
page, not in the XML.

## Palette — site tokens only

| Role | Hex | Use for |
| --- | --- | --- |
| ink | `#1d1c19` | node strokes, primary edges, label text |
| paper | `#fbfaf6` | node fills, edge-label backgrounds |
| muted | `#7a766d` | stamps (stage labels), edge labels, secondary text |
| faint | `#b8b3a6` | secondary/optional edges |
| rule | `#e6e2d8` | container strokes, mono-chip fills (the code-plate tone) |
| accent | `#b04522` | **one** element per diagram — the focal edge or node stroke |
| ink-green | `#4f7a3f` | success/ok state, only when the post's content calls for it |
| ink-red | `#a32f1f` | failure path, only when the post's content calls for it |
| ink-yellow | `#8a6410` | caution state, only when the post's content calls for it |

Any hex not in this table is a defect. No Tailwind palettes, no `#FFF2CC`
drawio defaults, no semantic rainbow (blue = trigger, teal = agent, …) — roles
are told apart by *shape vocabulary and position*, not by hue.

## Typography — a three-name contract

`globals.css` remaps these exact family keywords onto the site's real webfonts
(`.drawio-svg` rules). Any other family name silently falls back to system
fonts on the page.

| `fontFamily=` | Renders as | Use for |
| --- | --- | --- |
| `Geist` | site sans | node labels, prose annotations — 13px, 12px minimum |
| `JetBrains Mono` | site mono | filenames, commands, code, stamps, edge labels — 10–11px |
| `Fraunces` | site serif | almost never; a serif aside only if a figure truly needs one |

Stamps (stage headers, eyebrows) are the site's `.stamp` voice: JetBrains
Mono, 10px, muted, **typed in UPPERCASE** (drawio has no letter-spacing knob —
uppercase alone is enough).

## Shape vocabulary

Copy these style strings verbatim, then vary only geometry and text.

**Base node** — outlined box on paper; the default for every station:

```
rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor=#fbfaf6;strokeColor=#1d1c19;strokeWidth=1;fontColor=#1d1c19;fontFamily=Geist;fontSize=13;shadow=0;
```

**Focal node** — the single element the diagram is *about* (spend the accent
here or on the focal edge, never both):

```
rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor=#fbfaf6;strokeColor=#b04522;strokeWidth=1.5;fontColor=#1d1c19;fontFamily=Geist;fontSize=13;shadow=0;
```

**Mono chip** — a file, command, or code artifact; reads like inline code:

```
rounded=1;arcSize=4;whiteSpace=wrap;html=1;fillColor=#e6e2d8;strokeColor=none;fontColor=#1d1c19;fontFamily=JetBrains Mono;fontSize=11;shadow=0;
```

**Stamp** — a stage label above a column or region (text cell, no box):

```
text;html=1;align=left;verticalAlign=middle;fontColor=#7a766d;fontFamily=JetBrains Mono;fontSize=10;
```

**Container** — hairline frame grouping related nodes; title in the stamp
voice, top-left:

```
rounded=1;arcSize=4;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#e6e2d8;strokeWidth=1;verticalAlign=top;align=left;spacing=10;fontColor=#7a766d;fontFamily=JetBrains Mono;fontSize=10;container=1;collapsible=0;pointerEvents=0;shadow=0;
```

**Decision** — rhombus, same ink-on-paper treatment:

```
rhombus;perimeter=rhombusPerimeter;whiteSpace=wrap;html=1;fillColor=#fbfaf6;strokeColor=#1d1c19;strokeWidth=1;fontColor=#1d1c19;fontFamily=Geist;fontSize=12;shadow=0;
```

## Edge vocabulary

**Primary flow** — ink, thin block arrow:

```
edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=blockThin;endFill=1;strokeColor=#1d1c19;strokeWidth=1;fontColor=#7a766d;fontFamily=JetBrains Mono;fontSize=10;labelBackgroundColor=#fbfaf6;
```

**Secondary / optional** — faint and dashed:

```
edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=blockThin;endFill=1;strokeColor=#b8b3a6;strokeWidth=1;dashed=1;dashPattern=4 3;fontColor=#7a766d;fontFamily=JetBrains Mono;fontSize=10;labelBackgroundColor=#fbfaf6;
```

**Failure path** — ink-red, dashed, only when the content has one:

```
edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=blockThin;endFill=1;strokeColor=#a32f1f;strokeWidth=1;dashed=1;dashPattern=4 3;fontColor=#a32f1f;fontFamily=JetBrains Mono;fontSize=10;labelBackgroundColor=#fbfaf6;
```

Edge labels are lowercase mono (`note.json`, `merge`, `exit ≠ 0`) — they name
data or events moving along the line, they don't narrate.

## Layout grid — distribution is the whole game

Overlapping labels and cramped, uneven gaps are the #1 failure of generated
diagrams. The grid removes the judgment call:

- **Node size**: 160×60 default. Widen to 200 for long labels; never shrink
  below 120×48.
- **Column pitch 220, row pitch 110** (x = 40 + 220·col, y = 40 + 110·row) —
  a constant 60px horizontal / 50px vertical gap. Place each node on the grid
  **once**; do not nudge afterwards.
- **Canvas width ≤ 840px** (the article column is 848px — wider exports
  shrink and their text with them). Prefer ≤ 720. Grow vertically instead.
- **One flow direction per diagram** — left→right for pipelines, top→bottom
  for hierarchies. Back-edges route around the outside of the grid, never
  through it.
- **≤ 12 nodes.** More than that is two diagrams, or prose.
- **Fan-in/fan-out**: when several edges share a node side, pin distinct
  `exitX/exitY` / `entryX/entryY` values so lines neither stack nor cross.

## Forbidden

Shadows (`shadow=0` everywhere), gradients, sketch/rough style, legends,
swatch rows, titles inside the canvas (the MDX `caption` is the title),
footer/attribution text, badges ("PREFERRED", "NEW"), emoji, icon libraries,
more than one accent element, per-category fill colors, any font family
outside the three-name contract, fills or strokes outside the palette table.

When in doubt, remove the element. The site's rule for its own chrome applies
to figures too: quiet until it has something to say.
