# Blog writing guide for skurekjakub-dev

This guide captures the writing principles, patterns, and conventions used across
`content/blog/` articles (`cc-statusline.mdx`, `changelog-automation.mdx`,
`audience-aware-content.mdx`, `agentic-accessibility-afdocs.mdx`).

---

## 1. Perspective & tone

- **Direct developer-to-developer.** Write with first-person perspective ("I ran...",
  "Here are a few prompts I use...", "My first thought was...").
- **Pragmatic and practical.** Explain how things actually work in production, why specific
  decisions were made, and what didn't work as expected.
- **No marketing or academic filler.** Avoid buzzwords ("delve", "tapestry", "realm", "landscape",
  "game-changer", "supercharge") and throat-clearing openers ("In today's fast-paced world...").

## 2. Article structure

- **Frontmatter:** Include `title`, `description`, `date` (`YYYY-MM-DD`), and `tags`.
- **Opening:** 1–3 paragraphs introducing the problem, tool, or motivation directly.
- **Body:** Logical progression under descriptive `##` and `###` headers.
- **Evidence & Artifacts:** Use working code blocks, CLI terminal traces (`<Terminal>` / `<Ink>`),
  draw.io architecture diagrams (`<Image>`), downloadable scripts (`<Download>`), and collapsible
  JSON/data payloads (`<Details>`).
- **Conclusion:** A short, practical wrap-up outlining takeaways and caveats, followed by `Sources:`.

## 3. Formatting & mechanics

- **British English:** `optimised`, `behaviour`, `serialised`, `prioritise`.
- **Inline code:** Wrap CLI tools, flags, parameters, URLs, and code identifiers in backticks.
- **Lists:** Use bold inline lead-ins for key points (`- **Pattern.** Explanation...`).
- **Clean MDX tags:** Ensure every custom component has valid props and targets files that exist.
