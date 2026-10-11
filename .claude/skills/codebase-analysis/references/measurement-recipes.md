# Measurement recipes

Numbers in a follow-up come from one of these, with the method named in the
file. Each recipe lists the trap that produced a wrong number before. Add the
recipes this repo needs as you pay for them.

Shell: the Bash tool runs Git Bash on Windows. Use absolute paths
(`C:/repositories/crumble-logbook/…`), environment variables inline, one
command per call.

## A measuring database

Never measure against `data/crumble.db` (the user's, possibly stale) and never
write it. Build a scratch one from a fresh import of every record, in number
order (the list is `README.md` § The database):

```bash
CRUMBLE_DB=<scratchpad>/measure.db pnpm import:record 001-guild-conquest-meta
```

Then serve it on a spare port so the user's `pnpm dev` stays untouched:

```bash
CRUMBLE_DB=<scratchpad>/measure.db PORT=8788 pnpm dev:server   # in the background
```

Trap: `CRUMBLE_DB` must be absolute; the scripts run from `apps/server`, so a
relative path lands there.

## API response timing and size

```bash
curl -s -o /dev/null -w '%{time_starttransfer} %{size_download}\n' 'http://localhost:8788/api/decks?mode=guild_conquest'
```

Run it repeatedly and report the warm runs (mean, p50, p90, max); the first
requests after a start are slower. `gzip -c <saved body> | wc -c`
for what the wire carries. Trap: `tsx watch` restarts on any source save,
which resets the warm state mid-series.

## Import and seed cost

```bash
time CRUMBLE_DB=<scratchpad>/import.db pnpm import:record 001-guild-conquest-meta
```

The first import of a session also hashes every present evidence file for the
ledger check; the hash cache (`node_modules/.cache/crumble-capture/hashes.json`)
makes later runs cheap. Report cold and warm separately, and say which one
the cost is. The Vercel function's cold start seeds from `data/snapshot.json`:
time the seed in a scratch script that imports the server's own restore code,
not a reimplementation of it.

## Micro-benchmark of a code path

Scripts live in the scratchpad (never the repo) and import the repo's own
modules, run with `tsx` from the package that owns them so its dependencies
resolve:

```bash
pnpm --filter @crumble/server exec tsx <scratchpad>/bench.mts
```

Shape: three passes, report the third (warm); mean / p50 / p90 / max; sample
the real inputs (every record, every mode) plus the outliers by size. Use the
code path's real configuration; a benchmark with different options measures a
different pipeline.

Trap: name the script `.mts`, so ESM-only dependencies resolve.

## Web payload and runtime

- **Bundle:** `pnpm --filter @crumble/web build`, then the sizes Vite prints
  per chunk (raw and gzip). A route's own chunk exists because the router
  plugin runs with `autoCodeSplitting`.
- **In the browser:** agent-browser against `pnpm dev` or `vite preview`,
  driven as `AGENTS.md` sets it up; `agent-browser skills get core` lists the
  commands for network logs and timing. Dev mode serves unbundled modules, so
  a payload question is measured on a build.

## File and corpus statistics

```bash
find <dir> -name '*.<ext>' -type f -printf '%s\n' \
  | awk '{n++; s+=$1; if($1>m)m=$1} END {printf "files=%d total=%.1fMB mean=%.0fB max=%dB\n", n, s/1048576, s/n, m}'
find <dir> -name '*.<ext>' -type f -printf '%s %p\n' | sort -n | tail -5
```

Trap: counting occurrences across many files needs `grep -c` per file summed,
not `grep -rc` eyeballed. Gitignored media under `research/` is on disk only
in the checkout that captured it, so a count over evidence media varies by
machine; say which machine.

## Library facts

1. The installed source (`node_modules/<pkg>/…`, resolved through the package
   that depends on it, e.g. `apps/server/node_modules/drizzle-orm/`): the
   behaviour that ships. Cite `file:line`. Read the function, not the comment
   above it.
2. The version-matched docs `docs/conventions/stack-profile.md` names; cite
   `path:line`.
3. Vendor pages via WebFetch: note the URL and that it was fetched today, and
   confirm the page is for the installed major (drizzle 1.0 beta and the
   TanStack versions move fast).

Repo docs (`README.md`, `docs/`, `.ai/`) are hypotheses, not evidence; they go
stale exactly where the interesting findings are.

## Shell traps that cost a round trip

- A `cd` inside a compound command moves the working directory for later
  calls; use absolute paths.
- `grep` with huge `.{0,N}` windows on minified files hangs; slice by byte
  offset in node instead.
- If a hook or wrapper filters command output, compute facts that come from
  output (a count, a version) with `awk` or `node` so nothing is elided.
- `pnpm verify` and a bare `vitest run` are steered by the
  `prefer-verify-script` hook; a measurement that needs the suite's timing
  reads Vitest's own duration line from `pnpm exec vitest run <path>`.
