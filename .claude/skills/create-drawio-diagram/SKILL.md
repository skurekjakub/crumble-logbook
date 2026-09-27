---
name: create-drawio-diagram
description: Create or edit draw.io diagrams for blog posts and save them as editable .drawio.svg assets under public/blog. Use whenever the user asks for a diagram, flowchart, architecture overview, pipeline/process visual, or any .drawio / .drawio.svg file — creating a new one, restyling an existing one, or changing boxes/arrows/labels in a diagram embedded in a post — even if they don't say "draw.io". Also use when a task involves reading the diagram source out of an existing .drawio.svg asset. For a quick throwaway flowchart where layout control doesn't matter, <Mermaid> is the lighter tool; this skill is for diagrams that must match the site's visual language.
---

# Create draw.io diagrams

Author diagrams as **mxGraphModel XML**, then render them into a `.drawio.svg`
with the bundled export script. One file serves both purposes: browsers render
the SVG body, and the drawio editor opens the XML source embedded in the root
`<svg content="...">` attribute. Never ship a static PNG/WebP export of a
diagram — the next person to touch it needs the editable source.

## Gate — Python is mandatory

Both scripts are Python. Run this before authoring any XML:

```bash
python3 --version
```

If it doesn't answer, stop and tell the user the skill needs Python. Never
hand-write the SVG body instead: it is exporter output, and hand-authored
markup silently diverges (wrong label nesting, dead `content=` payloads that
no longer open in the editor).

Chrome needs no gate — the export script takes it from PATH, else the
Playwright cache, else `npx playwright install chromium`.

## Machine rules (this box)

- **Never put working files in `/tmp`** — it is tmpfs (RAM) on this WSL box
  and has crashed the VM before. Model XML and screenshots go in
  `~/scratch/drawio/`.
- **One export at a time.** Each run launches headless Chrome; parallel runs
  have crashed the VM. Run them sequentially, always.

## Where the file goes

`public/blog/<post-slug>/<diagram-name>.drawio.svg`

Same directory the post's images already use. Create it if it doesn't exist.
The intermediate model XML and the verification screenshot are scratch files:
keep them in `~/scratch/drawio/`, never next to the asset, never committed.

## Before drawing anything

Read [`references/diagram-style.md`](references/diagram-style.md) — it fixes
the palette (site tokens only), typography (three font names that are a
contract with `globals.css`), and the layout grid. The style guide is not
advisory: a diagram in Tailwind-default colors with a legend row and a title
banner reads as AI slop pasted into an editorial page.

## Workflow

**New diagram:**

1. Plan the layout as a table first — rows × columns, which cell each node
   occupies, which edges connect them. Distribution failures (overlaps,
   cramped gaps, crossing edges) are baked in at this step, not at styling.
2. Write the `<mxGraphModel>` XML to `~/scratch/drawio/<name>.xml`.
3. Export:
   ```bash
   python3 scripts/export_drawio_svg.py ~/scratch/drawio/<name>.xml \
     public/blog/<post-slug>/<name>.drawio.svg \
     --background transparent --screenshot ~/scratch/drawio/<name>.png
   ```
4. **Look at the screenshot** (Read the PNG). Overlapping labels, crossed
   edges, clipped text, and uneven spacing are only visible rendered — never
   call a diagram done without viewing it.
5. Embed in the post:
   ```mdx
   <Image
     src="/blog/<post-slug>/<name>.drawio.svg"
     alt="What the diagram conveys"
     caption="Optional figure caption."
   />
   ```
   `PostImage` detects the `.drawio.svg` suffix, sanitizes the markup, and
   inlines it so the page webfonts apply and the export's `light-dark()`
   colors follow the site theme toggle (`lib/drawio-markup.ts`).

**Editing an existing `.drawio.svg`:**

1. `python3 scripts/decode_drawio_svg.py <asset>.drawio.svg -o ~/scratch/drawio/model.xml`
2. Edit the XML, re-export as above. Never hand-edit the rendered SVG body —
   it is a build artifact; the embedded XML is the source of truth.

The export script runs the official diagrams.net viewer in headless Chrome
and serializes `graph.getSvg()`, so output is structurally identical to an
editor-made export, and it verifies the embedded source roundtrips before
exiting.

`--background transparent` is the default choice here: the diagram sits
directly on the page's paper tone in both themes. The exporter still emits
adaptive `light-dark()` pairs for every stroke, fill, and label.

## Authoring notes

- **Bare `<mxGraphModel>` root.** Cells `id="0"` and `id="1" parent="0"` are
  mandatory; every element sits on `parent="1"` unless inside a container.
  Never emit compressed/base64 content or XML comments.
- **Stable, semantic cell ids** (`trigger`, `agentRun`, `humanGate`) — the
  next editing session greps for them.
- **`html=1` labels; XML-escape everything** (`&lt;b&gt;`, `&lt;br&gt;`).
  Line breaks inside a `value` are `&lt;br&gt;`, never `\n`.
- **Edges declare `source` and `target` ids.** Pin `exitX/exitY` +
  `entryX/entryY` (normalized 0–1) whenever more than one edge shares a node
  side — the default router takes ugly paths otherwise. One edge on a side
  needs no pins.
- **Label an edge instead of adding a box** when a step is a transformation
  along a path rather than a station on it. Set
  `labelBackgroundColor=#fbfaf6` so the line doesn't strike through the text.
- **Non-rectangular shapes need a matching perimeter**
  (`ellipse;perimeter=ellipsePerimeter`), or edges aim at the bounding box.
- **Containers**: children use coordinates relative to the container origin
  and `parent="<containerId>"`; add `pointerEvents=0;` to the container
  style. Edges between containers live on `parent="1"`.
- **Keep the default 40px border** (the script's default) — a flush canvas
  looks cropped in the article column.

## Verification checklist

- Screenshot reviewed: no overlaps, no crossed edges, arrows point the right
  way, spacing follows the grid.
- Export reported `roundtrip ok` (file still opens in the drawio editor).
- Style guide honored: site palette only, one accent use, fonts from the
  three-name contract, no legend/title/attribution furniture.
- Post embeds the asset via `<Image …/>` with a real `alt`.
- Only the `.drawio.svg` is staged — no `.png`, no loose model XML.
- `npm run build` passes (a bad `src` fails the build by design).
