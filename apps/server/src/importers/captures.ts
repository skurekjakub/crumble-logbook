import { existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { repoRoot } from "../config";

/**
 * Where a record keeps the raw capture of one site's posts: `dir` is
 * relative to the record directory, and `file` is a file name pattern in
 * which `{id}` stands for the source id without its `<site>:` prefix.
 */
export interface CaptureRule {
  site: "dc" | "nv";
  dir: string;
  file: string;
}

/**
 * Finds the evidence capture of a source by trying each rule of the
 * source's site, in order, against the file system.
 *
 * @param recordDir - absolute path to the research record directory
 * @param rules - capture rules, tried in order
 * @param sourceId - a `<site>:<key>` source id
 * @param root - the directory the returned path is relative to; defaults
 *   to the repo root
 * @returns the `/`-separated path of the first existing match, relative to
 *   `root`, or `null` if no rule of the source's site names an existing
 *   file (always `null` for a `web:` id)
 */
export function findCapture(
  recordDir: string,
  rules: CaptureRule[],
  sourceId: string,
  root: string = repoRoot,
): string | null {
  const colon = sourceId.indexOf(":");
  const site = sourceId.slice(0, colon);
  const key = sourceId.slice(colon + 1);
  for (const rule of rules) {
    if (rule.site !== site) continue;
    const path = join(recordDir, rule.dir, rule.file.replaceAll("{id}", key));
    if (existsSync(path)) return relative(root, path).split(sep).join("/");
  }
  return null;
}
