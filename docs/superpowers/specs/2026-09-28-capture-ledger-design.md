# Capture ledger and TypeScript scrapers — design

Status: approved in session 2026-09-28; implemented 2026-09-28. The README's Captures section is the user-facing
guide.

## Decisions (the user's, 2026-09-28)

- Scraping stays out of the UI. Captures keep being taken by scripts and by agent-browser sessions.
- The condition: an audit trail must record what was scraped and when, for every capture.
- The scrapers move to TypeScript, so the whole repo is one stack.
- Replaces the design spec's success criterion 3 ("a scrape can be triggered from the UI") with: every file under a
  record's `evidence/` has a line in that record's capture ledger giving its URL, capture time, tool and hash, and a
  test fails when one is missing or a file's bytes changed. Captured media is local-only (below), so its absence on a
  clone is not a failure.

## The ledger

Each record keeps `research/<slug>/evidence/captures.jsonl`, append-only, one JSON object per line:

```json
{"path":"evidence/03-dc-posts/17035.md","url":"https://m.dcinside.com/board/projectcc/17035","captured_at":"2026-09-27T10:39:53+02:00","tool":"python:dc_scrape","sha256":"…"}
```

| Field | Meaning |
|---|---|
| `path` | Relative to the record folder. Unique within the ledger. |
| `url` | The page or endpoint the bytes came from; `null` for derived files (digests, extracts, scripts). |
| `captured_at` | ISO 8601 with offset. |
| `tool` | `agent-browser`, `curl`, `yt-dlp`, `capture:<scraper>` (the TypeScript scrapers), `python:<script>` (the retired Python scrapers), `manual`, or `unknown` (backfill only). |
| `sha256` | Hex digest of the file's bytes as checked out. `.gitattributes` forces LF for text, so the bytes are the same on every platform. |
| `approx` | Optional, backfill only: `"header"` when the time came from the capture's own `captured:` line, `"post"` when an image inherits its post's time, `"git"` when only the first commit's time is known. |

The Zod schema for a line lives in `packages/schema` (shared by the capture package and the server importer). The
ledger file is the only file under `evidence/` that is appended to after creation; everything else stays immutable,
and the hashes now enforce that.

Captured media (images, video frames, video) is gitignored under `research/` and exists only on the machine that
captured it. It still gets a ledger line, so the trail records what was captured and when, and its hash is checked
wherever the file is present. A fresh clone has the lines but not the files, and that is not a failure. The media
extensions live in one exported constant in `ledger.ts`, kept in step with `.gitignore`.

## `packages/capture` (new workspace package, `@crumble/capture`)

Pure I/O: HTTP, HTML parsing, files and the ledger. It imports `@crumble/schema` for the line schema and nothing from
`apps/*` (an architecture-test rule).

- `ledger.ts`: `readLedger(recordDir)`, `appendCapture(recordDir, file, meta)` (hashes the file it was given and
  appends one line; refuses a path already in the ledger), `verifyLedger(recordDir)` (every evidence file on disk has
  exactly one line; every line's file exists, except that a missing media file is allowed; every present file's hash
  matches).
- `http.ts`: the shared client the Python scrapers each re-implemented: mobile UA, referer, retries with backoff,
  polite delay.
- Scrapers, each a port with the same commands and output format as its Python original, so new captures read like
  old ones:
  - `dc.ts` ← `dc_scrape.py` (`list`, `fetch`: posts, images, comments via the AJAX endpoint);
  - `naver.ts` ← `nv_scrape.py` (the cafe JSON APIs);
  - `crumbgg.ts` (the public JSON endpoints behind the rankings, as the `15-crumbgg/api` captures used);
  - `youtube.ts` ← `14-global/ytv.py`, `ytall.py`, `subs.py` (watch-page HTML and digest), and thin wrappers over the
    external `yt-dlp` and `ffmpeg` binaries for `frames.py`/`sheet.py`.
  HTML parsing uses cheerio.
- `cli.ts`, run as `pnpm capture <command> <record> …`:
  - `pnpm capture dc fetch 003-stage-pushing-meta evidence/04-dc 17035 …` (and the other scrapers' commands);
  - `pnpm capture log <record> <path> --url <url> --tool agent-browser` for a file captured any other way;
  - `pnpm capture verify [record]`;
  - `pnpm capture backfill <record>` (below).

The Python scripts stay where they are, unedited, as evidence of how records 001 and 002 were captured. The README
says they're retired and names their TypeScript replacements.

## Backfill

`capture backfill <record>` writes the ledger for a record's existing files, once, refusing if a ledger exists:
- Markdown captures: `url` and `captured_at` from their `- url:` / `- captured:` header lines, `approx: "header"`,
  tool from the folder's known scraper (`python:dc_scrape` for DC post folders, `python:nv_scrape` for Naver, else
  `unknown`).
- Images referenced by a post (`![[name]]`): the post's URL and time, `approx: "post"`.
- Everything else: `captured_at` = the file's first commit time (`git log --diff-filter=A`), `approx: "git"`,
  `url` from a sibling README or header when one names it, else `null`.

Record 003's lane already writes ledger lines by hand as it captures; backfill skips a record with a ledger.

## Database and import

- A migration drops the unused `jobs` table (and its Zod schemas) and adds `captures`: `id`, `record_slug`, `path`,
  `url`, `captured_at`, `approx`, `tool`, `sha256`, unique on (`record_slug`, `path`).
- The importer reads `evidence/captures.jsonl` as a pluggable manifest block (R3's EXTRAS), validates every line, and
  fails the import when `verifyLedger` fails. Rows are owned by the record, so `--replace` refreshes them.
- `captures` is in the registry and therefore in `data/snapshot.json`.
- API (read-only): `GET /api/captures?record=&path=`. `/api/sources` rows gain `capture` (`capturedAt`, `tool`,
  `approx`) joined on `sources.capturePath`.

## Web

- The Sources page shows each source's capture time and tool next to its chip data, with a marker for approximate
  times.
- Research gets a Captures page per record: the ledger as a table (path, URL, captured, tool, approx), filterable by
  folder and tool. No scrape buttons.

## Rules added to AGENTS.md

- Every file written under `evidence/` gets a ledger line in the same commit: the TypeScript scrapers append it
  themselves; any other capture uses `pnpm capture log`. Gitignored media gets its line too; the line is committed
  and the file stays local.
- `pnpm verify` runs the ledger check (a vitest suite over every record), so a missing line or an edited capture fails
  the gate.

## Testing

- Scrapers are tested against saved HTML/JSON fixtures (no live network in tests): list-page and post-page parsing,
  comment parsing, image naming, the Markdown output format byte-for-byte against a Python-produced capture.
- Ledger: append, duplicate refusal, hash mismatch, missing line, orphan line, a missing media file passes, a present
  media file with a changed hash fails, the media extensions match `.gitignore`.
- Backfill: header parsing, image inheritance, git fallback, refusal when a ledger exists.
- Importer: a ledger block imports, a bad line fails with file and line number, `verifyLedger` failure fails the import.
- Snapshot: 001 then 002 then 003 regenerates it; the change is the new `captures` rows only.

## Out of scope

- A job runner, `/jobs` routes, or any UI trigger.
- Re-capturing old evidence.
