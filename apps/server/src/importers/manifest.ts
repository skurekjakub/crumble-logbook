import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GAME_MODE, RECORD_STATUS, isoDate } from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import { EXTRA_SHAPE } from "./extras";
import { formatIssues } from "./files";

/**
 * Schema of a research record's `import.json`: the record row to create
 * (`mode`, when given, is the game mode it's filed under, and the mode of
 * every curated row that states none; without it, the record takes its
 * mode from `meta.json`'s `modes` block, as `mapMeta` says, and the import
 * fails if there is none), where the curated dataset and the extractions
 * live (one folder, or a list whose earlier folders' summaries win), how
 * to find each source's evidence capture, and one field per
 * extra block (see `EXTRAS` in `extras.ts`). Every path is relative to the
 * record directory; a capture rule's `dir` may climb into another record's
 * evidence (`../<slug>/evidence/...`). An unknown key fails, at the top
 * level as in every block.
 */
export const importManifest = z.strictObject({
  record: z.strictObject({
    slug: z.string().min(1),
    question: z.string().min(1),
    status: z.enum(RECORD_STATUS),
    startedAt: isoDate,
    mode: z.enum(GAME_MODE).optional(),
  }),
  curated: z.string().min(1),
  extractions: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  captures: z.array(
    z.strictObject({
      site: z.enum(["dc", "nv"]),
      dir: z.string().min(1),
      file: z.string().includes("{id}", { message: "expected a file pattern containing {id}" }),
    }),
  ),
  ...EXTRA_SHAPE,
});
/** Output of {@link importManifest}. */
export type ImportManifest = z.output<typeof importManifest>;

/** The `record` block of an {@link ImportManifest}. */
export type ManifestRecord = ImportManifest["record"];

/**
 * Reads and validates a research record's `import.json`.
 *
 * @param recordDir - absolute path to the research record directory
 * @returns the validated manifest
 * @throws {ImportError} naming `import.json`, if it's missing, isn't valid
 *   JSON, or fails validation (the message lists every issue's path)
 */
export function readManifest(recordDir: string): ImportManifest {
  const file = join(recordDir, "import.json");
  if (!existsSync(file)) throw new ImportError(file, null, "file not found");
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf-8"));
  } catch (err) {
    throw new ImportError(file, null, (err as Error).message);
  }
  const result = importManifest.safeParse(raw);
  if (!result.success) throw new ImportError(file, null, formatIssues(result.error));
  return result.data;
}
