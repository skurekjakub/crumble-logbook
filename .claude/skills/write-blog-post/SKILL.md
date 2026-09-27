# Write a blog post for skurekjakub-dev

Author a technical post in the style established across `content/blog/`: conversational,
first-person, direct engineer-to-engineer, grounded in real terminal runs, code snippets,
and architecture diagrams, ending with a green build.

Before drafting, consult:
- `AGENTS.md` (repo architecture, frontmatter contract, verify commands)
- `.ai/shared/voice-style-guide.md` (the author's voice, tone, and system prompt)
- `.ai/shared/willison-post-template.md` (post structure and MDX components)
- `.ai/shared/anti-slop-banlist.md` (AI tells and buzzwords to avoid)
- `.claude/skills/write-blog-post/references/blog-writing-guide.md` (style reference & guidelines)

---

## Workflow

### 1. Topic & Angle
- Identify the concrete occasion, discovery, or friction point (e.g. a tool setup, framework
  quirk, automated pipeline, or routing problem).
- Ground the post in real developer experience and first-hand exploration.

### 2. Outline & Flow
- Structure with clear H2 and H3 section headers.
- Plan the artifacts: CLI commands, terminal output (`<Terminal>` / `<Ink>`), code blocks,
  diagrams (`.drawio.svg`), downloadable scripts, or reference JSON (`<Details>`).

### 3. Drafting
- Write in first person with a natural, conversational tone.
- Open directly on what happened or what problem was tackled.
- Keep explanations clear, practical, and honest about tradeoffs and caveats.
- Use British / International spelling (`optimised`, `behaviour`, `serialised`).
- Avoid corporate marketing buzzwords, academic fluff, and AI cliches.

### 4. Verify Code & Components
- Test all code snippets and CLI commands.
- Ensure all MDX components (`<Terminal>`, `<Ink>`, `<Image>`, `<CodeLink>`, `<Details>`, `<Download>`)
  are valid and resolve their target assets.

### 5. Review & Polish
- Check against `.ai/shared/anti-slop-banlist.md`.
- Verify the frontmatter contract matches `AGENTS.md` (`title`, `description`, `date`, `tags`).
- Confirm sources and references are linked at the bottom under `## Conclusion` and `Sources:`.

### 6. Verify & Build
- Run `npm run verify` (or `npm run build:full`).
- Confirm the post renders without errors in `next dev` at `/blog/<slug>`.
