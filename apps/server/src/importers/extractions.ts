import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ImportError } from "../errors";

/** The part of an extraction post {@link loadSummaries} reads. */
interface ExtractionPost {
  source?: unknown;
  id?: unknown;
  summary_en?: unknown;
}

/**
 * Derives a post's source id the way the record's `evidence/digest.py`
 * `sid()` does: `dc` → `dc:`, `naver` → `nv:`, anything else → `web:`, with
 * every `nv-` removed from the post id (Python's `str.replace` semantics).
 *
 * @param post - the extraction post
 * @returns the source id; its key part is empty when the post has no string or numeric `id`
 */
function postSourceId(post: ExtractionPost): string {
  const prefix = post.source === "dc" ? "dc:" : post.source === "naver" ? "nv:" : "web:";
  const id = typeof post.id === "string" || typeof post.id === "number" ? String(post.id) : "";
  return prefix + id.replaceAll("nv-", "");
}

/**
 * Collects the English summary of every extracted post, keyed by source id.
 *
 * Reads the folders in the order given, and each folder's `*.json` files in
 * file-name order; each file holds a `posts` array. The first non-empty
 * `summary_en` seen for a source id wins, so an earlier folder's summary
 * (a refresh round's) takes precedence over a later one's.
 *
 * @param dirs - absolute path to the extraction directory, or to each of them
 * @returns a map from source id (`dc:…`, `nv:…`, `web:…`) to its summary
 * @throws {ImportError} naming the file, if one can't be read or isn't
 *   valid JSON
 */
export function loadSummaries(dirs: string | readonly string[]): Map<string, string> {
  const summaries = new Map<string, string>();
  const files = (typeof dirs === "string" ? [dirs] : dirs).flatMap((dir) =>
    readdirSync(dir)
      .filter((name) => name.endsWith(".json"))
      .sort()
      .map((name) => join(dir, name)),
  );
  for (const file of files) {
    let data: { posts?: ExtractionPost[] };
    try {
      data = JSON.parse(readFileSync(file, "utf-8")) as typeof data;
    } catch (err) {
      throw new ImportError(file, null, (err as Error).message);
    }
    for (const post of data.posts ?? []) {
      const summary = post.summary_en;
      if (typeof summary !== "string" || summary.trim() === "") continue;
      const id = postSourceId(post);
      if (!summaries.has(id)) summaries.set(id, summary);
    }
  }
  return summaries;
}
