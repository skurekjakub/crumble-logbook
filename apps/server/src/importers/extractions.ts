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
 */
function postSourceId(post: ExtractionPost): string {
  const prefix = post.source === "dc" ? "dc:" : post.source === "naver" ? "nv:" : "web:";
  return prefix + String(post.id ?? "").replaceAll("nv-", "");
}

/**
 * Collects the English summary of every extracted post, keyed by source id.
 *
 * Reads every `*.json` file of `dir` in file-name order; each holds a
 * `posts` array. The first non-empty `summary_en` seen for a source id wins.
 *
 * @param dir - absolute path to the extraction directory
 * @returns a map from source id (`dc:…`, `nv:…`, `web:…`) to its summary
 * @throws {ImportError} naming the file, if one can't be read or isn't
 *   valid JSON
 */
export function loadSummaries(dir: string): Map<string, string> {
  const summaries = new Map<string, string>();
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort();
  for (const name of files) {
    const file = join(dir, name);
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
