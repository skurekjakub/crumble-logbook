---
name: agent-readability
description: Make a website readable by AI agents. Adds llms.txt, content negotiation, structured data, and runs the readability audit.
---

<!-- Vendored verbatim from @vercel/agent-readability 0.6.0 (`skill/SKILL.md`), MIT,
     https://github.com/vercel-labs/agent-readability — captured 2026-08-30 in
     .ai/deep-research/001-markdown-miss-on-negotiated-doors/evidence/vercel-agent-readability-0.6.0/.
     This site already implements its own doors (proxy.ts + lib/proxy/); the audit in step 9 is
     the part worth running here. -->

# Agent Readability

Make a website readable by AI agents by adding discovery files, content negotiation, and structured data.

## When to Use

- user asks to make their site agent-friendly or AI-readable
- user wants to serve markdown to AI agents
- user wants to add llms.txt, content negotiation, or structured data
- user asks about AI agent readability or the agent readability spec
- user wants to run an agent readability audit

## Steps

### 1. Install

```bash
pnpm add @vercel/agent-readability
```

### 2. Add middleware

Detect framework: `next.config.*` → Next.js, `svelte.config.js` → SvelteKit, `nuxt.config.ts` → Nuxt.

#### Next.js — `middleware.ts`

```ts
import { withAgentReadability } from '@vercel/agent-readability/next'

export default withAgentReadability({
  docsPrefix: '/docs',
  rewrite: (pathname) => `/api/docs-md${pathname}`,
})

export const config = {
  matcher: ['/docs/:path*'],
}
```

If middleware already exists, wrap it:

```ts
import { withAgentReadability } from '@vercel/agent-readability/next'
import { existingMiddleware } from './lib/middleware'

export default withAgentReadability(
  { rewrite: (pathname) => `/api/docs-md${pathname}` },
  existingMiddleware,
)
```

#### SvelteKit — `hooks.server.ts`

```ts
import { handleAgentReadability } from '@vercel/agent-readability/sveltekit'
import { sequence } from '@sveltejs/kit/hooks'

export const handle = sequence(
  handleAgentReadability({
    docsPrefix: '/docs',
    rewrite: (pathname) => `/api/docs-md${pathname}`,
  }),
  // other handles...
)
```

The `rewrite` function maps to a `+server.ts` route that returns markdown. SvelteKit's `event.fetch()` resolves it internally with zero network hop.

#### Nuxt — `server/middleware/agent.ts`

```ts
import { defineAgentMiddleware } from '@vercel/agent-readability/nuxt'

export default defineAgentMiddleware({
  docsPrefix: '/docs',
  getMarkdown: async (pathname, event) => {
    const doc = await queryContent(pathname).findOne()
    return doc.body
  },
})
```

`getMarkdown` receives the pathname and h3 event. Return a string (auto-wrapped in `text/markdown` Response) or a full `Response`.

**Note:** Nuxt server middleware does not run for statically generated pages (`nuxt generate` or `{ prerender: true }` route rules). Use the Vercel adapter below instead.

#### Vercel (framework-agnostic, including static Nuxt/SvelteKit/Astro on Vercel) — `middleware.ts`

Create at project root (not in a framework directory):

```ts
import { createAgentMiddleware } from '@vercel/agent-readability/vercel'

export default createAgentMiddleware({
  docsPrefix: '/docs',
  rewrite: (pathname) => `/agent-md${pathname}`,
})

export const config = {
  matcher: '/((?!api|_next|_nuxt|favicon|.*\\..*).*)',
}
```

Requires `@vercel/functions` (optional peer dep). Runs at Vercel's edge before the cache, so it intercepts statically generated pages.

#### Other frameworks — core API

```ts
import { shouldServeMarkdown } from '@vercel/agent-readability'

const { serve } = shouldServeMarkdown(request)
if (serve) {
  return new Response(markdownContent, {
    headers: { 'Content-Type': 'text/markdown', 'Vary': 'Accept' },
  })
}
```

### 3. Add /llms.txt

Create a route that returns a markdown index of your site content. Format follows the llms.txt spec (llmstxt.org):

```ts
// Next.js: app/llms.txt/route.ts
export async function GET() {
  const content = `# Site Name

> Brief description of the site

## Docs
- [Getting Started](/docs/getting-started): How to get started
- [API Reference](/docs/api): Complete API documentation
`
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

### 4. Add /sitemap.md

Create a markdown sitemap with headings and links for AI navigation:

```ts
// Next.js: app/sitemap.md/route.ts
export async function GET() {
  const content = `# Sitemap

## Getting Started
- [Introduction](/docs/introduction): Overview and setup
- [Quick Start](/docs/quickstart): Get running in 5 minutes

## API Reference
- [Authentication](/docs/api/auth): Auth endpoints
- [Users](/docs/api/users): User management
`
  return new Response(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
```

### 5. Add structured data

Add JSON-LD to pages with Schema.org types (Article, TechArticle, WebPage):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Page Title",
  "description": "Page description"
}
</script>
```

### 6. Add link alternate to HTML pages

Add to `<head>` on all pages that have markdown versions:

```html
<link rel="alternate" type="text/markdown" href="/docs/page">
```

### 7. Add frontmatter to markdown responses

All markdown responses should include YAML frontmatter:

```markdown
---
title: Page Title
description: Brief page description
canonical_url: https://example.com/docs/page
last_updated: 2026-03-30
---
```

### 8. Check robots.txt

Verify these AI bots are not blocked: GPTBot, ClaudeBot, CCBot, Google-Extended. Remove any `Disallow: /` rules targeting them.

### 9. Run the audit

```bash
npx @vercel/agent-readability audit https://your-site.com
```

The audit scores your site on 25 checks across reachability, discovery, content delivery, and HTML quality. Failed checks include fix suggestions.

### 10. Add CI check (optional)

```yaml
- name: Agent readability
  run: npx @vercel/agent-readability audit ${{ env.SITE_URL }} --min-score 70 --json
```

## Notes

- Set `Vary: Accept` on all markdown responses for correct CDN caching
- For missing pages, use `createNotFoundResponse()` to return a real 404 or 410 status with a short markdown body linking to discovery files
- Prefer canonical page URLs and negotiate markdown with `Accept: text/markdown` instead of exposing `.md` page URLs
- Next.js: `onDetection` runs via `event.waitUntil()`
- SvelteKit: `onDetection` is fire-and-forget (errors swallowed)
- Nuxt: `onDetection` is fire-and-forget (errors swallowed)
- Vercel: `onDetection` runs via `waitUntil()` from `@vercel/functions`
- Nuxt static pages (`nuxt generate` / `prerender`) bypass server middleware — use the Vercel adapter for those
