/**
 * `pnpm icons:fetch [--force] [--soft]`: downloads the cookie and pet icons
 * into `apps/web/public/icons/`, which Vite serves at `/icons/` and copies
 * into the build. The folder is gitignored: the icons are game assets and
 * the repo is public, so they are fetched, never committed.
 *
 * The source is crumb.gg, which serves every cookie at
 * `/cookies/<resource key>.webp` and every pet at `/pets/<resource key>.webp`
 * and lists the keys in `/data/meta.json`. The keys the committed snapshot's
 * glossary names (`extra.resource_key`) are fetched too, so an icon the app
 * asks for is tried even when crumb.gg's list lags a patch.
 *
 * A file already on disk is kept unless `--force` is given. A key crumb.gg
 * doesn't serve is a warning: the app shows that name's badge. When no icon
 * could be had at all it exits 1, unless `--soft`, which the Vercel build
 * passes so an outage at crumb.gg never fails a deploy.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resourceKey } from "../src/lib/cookie-icons";

/** crumb.gg, the icons' source. */
export const ICON_SITE = "https://crumb.gg";

/** The pause between downloads, in milliseconds, to stay polite. */
const DELAY_MS = 100;

/** The web app's folder. */
const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Where the icons are written: Vite's public folder, served at `/icons/`. */
export const ICON_FOLDER = join(webRoot, "public", "icons");

/** The committed snapshot whose glossary names the keys the app uses. */
const SNAPSHOT = join(webRoot, "..", "..", "data", "snapshot.json");

/**
 * Lists the resource keys crumb.gg's `meta.json` names: each cookie's `key`
 * and each pet's `icon`.
 *
 * @param meta - the parsed `meta.json`, of any shape
 * @returns the keys, in file order; empty when the shape is unexpected
 */
export function keysFromMeta(meta: unknown): string[] {
  if (typeof meta !== "object" || meta === null) return [];
  const { cookies, pets } = meta as { cookies?: unknown; pets?: unknown };
  /**
   * Reads one field of each item of a list, keeping the strings.
   *
   * @param list - the list, of any shape
   * @param field - the field to read
   * @returns the field's string values
   */
  const pick = (list: unknown, field: string): string[] =>
    Array.isArray(list)
      ? list
          .map((x: unknown) =>
            typeof x === "object" && x !== null ? (x as Record<string, unknown>)[field] : null,
          )
          .filter((v): v is string => typeof v === "string")
      : [];
  return [...pick(cookies, "key"), ...pick(pets, "icon")].filter((k) =>
    resourceKey({ resource_key: k }),
  );
}

/**
 * Lists the resource keys a snapshot's glossary names.
 *
 * @param snapshot - the parsed `data/snapshot.json`, of any shape
 * @returns the keys, in glossary order
 */
export function keysFromSnapshot(snapshot: unknown): string[] {
  const tables = (snapshot as { tables?: { glossary?: unknown } } | null)?.tables;
  const glossary = tables?.glossary;
  if (!Array.isArray(glossary)) return [];
  return glossary
    .map((g: unknown) => resourceKey((g as { extra?: unknown } | null)?.extra))
    .filter((k): k is string => k != null);
}

/**
 * The URL crumb.gg serves a resource key's icon at.
 *
 * @param key - a resource key, e.g. `cookie0038` or `pet0001`
 * @returns the icon's URL
 */
export function iconUrl(key: string): string {
  return `${ICON_SITE}/${key.startsWith("pet") ? "pets" : "cookies"}/${key}.webp`;
}

/**
 * Fetches a URL with a desktop user agent and crumb.gg as referer.
 *
 * @param url - the URL
 * @returns the response
 * @throws on a network failure
 */
async function get(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      referer: `${ICON_SITE}/`,
    },
  });
}

/**
 * Downloads every icon the meta list and the snapshot name, skipping files
 * already on disk unless `force`.
 *
 * @param options - `force` re-downloads existing files; `soft` reports
 *   failures as warnings
 * @returns the process exit code: 1 when no icon could be fetched and none
 *   was on disk (unless `soft`), else 0
 */
async function main({ force, soft }: { force: boolean; soft: boolean }): Promise<number> {
  const keys = new Set<string>();
  try {
    const res = await get(`${ICON_SITE}/data/meta.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    for (const k of keysFromMeta(await res.json())) keys.add(k);
  } catch (e) {
    console.warn(`icons: crumb.gg meta.json unavailable (${String(e)}); using the snapshot's keys`);
  }
  if (existsSync(SNAPSHOT)) {
    for (const k of keysFromSnapshot(JSON.parse(readFileSync(SNAPSHOT, "utf8")))) keys.add(k);
  }
  mkdirSync(ICON_FOLDER, { recursive: true });

  let fetched = 0;
  let kept = 0;
  const failed: string[] = [];
  for (const key of keys) {
    const file = join(ICON_FOLDER, `${key}.webp`);
    if (!force && existsSync(file)) {
      kept++;
      continue;
    }
    try {
      const res = await get(iconUrl(key));
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || !type.startsWith("image/")) throw new Error(`HTTP ${res.status} ${type}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      fetched++;
    } catch (e) {
      failed.push(`${key} (${String(e)})`);
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(
    `icons: ${fetched} fetched, ${kept} already present, ${failed.length} failed → ${ICON_FOLDER}`,
  );
  if (failed.length) console.warn(`icons: no icon for ${failed.join(", ")}`);
  return failed.length && fetched + kept === 0 && !soft ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = new Set(process.argv.slice(2));
  process.exitCode = await main({ force: args.has("--force"), soft: args.has("--soft") });
}
