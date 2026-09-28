/**
 * The `pnpm capture` commands: argument parsing and dispatch to the
 * scrapers and the ledger. Every command names a record by its folder under
 * `research/`, and every capture path is record-relative under `evidence/`.
 *
 * @module
 */
import { existsSync, readdirSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import type { CaptureContext } from "./context";
import { backfill } from "./backfill";
import { crumbggCapture, crumbggClient, ENDPOINTS } from "./crumbgg";
import { dcClient, dcFetch, dcList } from "./dc";
import type { HttpClient, HttpOptions } from "./http";
import { appendCapture, describeProblem, hasLedger, verifyLedger } from "./ledger";
import { contactSheets, downloadVideos, extractFrames, subtitleSheets } from "./media";
import { naverClient, nvFetch, nvList } from "./naver";
import type { OffsetAt } from "./time";
import { isoLocal } from "./time";
import { youtubeClient, youtubeSearch, youtubeWatch } from "./youtube";

/** What the commands run against: the records folder, the terminal and the clock. */
export interface CliEnv {
  /** Absolute path of the `research/` folder. */
  researchDir: string;
  /**
   * Prints a result line.
   *
   * @param line - the line
   */
  out: (line: string) => void;
  /**
   * Prints a progress or error line.
   *
   * @param line - the line
   */
  err: (line: string) => void;
  /**
   * Reads the clock.
   *
   * @returns the current instant
   */
  now: () => Date;
  /** The UTC offset local times are written at. */
  offsetAt: OffsetAt;
  /** Client hooks (fetch, sleep) for tests. */
  http?: Partial<HttpOptions>;
}

/** A command's usage lines, printed on a usage error. */
export const USAGE = [
  "pnpm capture dc list <record> <out.tsv> <pages> <query> [<query> ...]",
  "pnpm capture dc fetch <record> <outdir> <no> [<no> ...]",
  "pnpm capture naver list <record> <out.tsv> <menuId> <pages>",
  "pnpm capture naver fetch <record> <outdir> <articleId> [<articleId> ...]",
  `pnpm capture crumbgg <${Object.keys(ENDPOINTS).join("|")}> <record> <outdir> [args]`,
  "pnpm capture youtube watch <record> <outdir> <videoId> [<videoId> ...]",
  "pnpm capture youtube search <record> <outdir> <query> [<query> ...]",
  "pnpm capture youtube download <record> <outdir> <videoId> [<videoId> ...]",
  "pnpm capture youtube frames <record> <video> <outdir> <prefix> <t0> <t1> [step] [threshold]",
  "pnpm capture youtube sheet <record> <outdir> <prefix> <x0> <y0> <x1> <y1> <cols> <rows> <frame> [<frame> ...]",
  "pnpm capture youtube subs <record> <video> <outdir> <prefix> <y0> <y1> [<x0> <x1>] [step]",
  "pnpm capture log <record> <path> --url <url|-> --tool <tool> [--at <iso time>]",
  "pnpm capture verify [<record>]",
  "pnpm capture backfill <record> [--from <record folder of another checkout>]",
];

/** A command line that doesn't fit its command's usage. */
export class UsageError extends Error {
  /**
   * Builds the error.
   *
   * @param message - what's wrong with the arguments
   */
  constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}

/**
 * Resolves a record argument to its folder.
 *
 * @param env - the environment
 * @param record - the record's folder name under `research/`
 * @returns the folder's absolute path
 * @throws {UsageError} if no such folder exists
 */
function recordDir(env: CliEnv, record: string | undefined): string {
  if (!record) throw new UsageError("missing <record>");
  const dir = join(env.researchDir, record);
  if (!existsSync(dir)) throw new UsageError(`no record folder ${dir}`);
  return dir;
}

/**
 * Checks that a path argument is record-relative under `evidence/`.
 *
 * @param path - the argument
 * @param what - how the error names it
 * @returns the path, trailing slashes removed
 * @throws {UsageError} if it's missing or outside `evidence/`
 */
function evidenceArg(path: string | undefined, what: string): string {
  if (!path) throw new UsageError(`missing <${what}>`);
  const clean = path.replaceAll("\\", "/").replace(/\/+$/, "");
  if (!/^evidence(\/|$)/.test(clean) || clean.split("/").includes("..")) {
    throw new UsageError(`<${what}> must be record-relative under evidence/: ${path}`);
  }
  return clean;
}

/**
 * Parses a numeric argument.
 *
 * @param value - the argument
 * @param what - how the error names it
 * @returns the number
 * @throws {UsageError} if it's missing or not a number
 */
function num(value: string | undefined, what: string): number {
  const n = Number(value);
  if (value === undefined || value === "" || !Number.isFinite(n)) {
    throw new UsageError(`<${what}> must be a number`);
  }
  return n;
}

/**
 * Requires at least one trailing argument.
 *
 * @param values - the arguments
 * @param what - how the error names one
 * @returns them
 * @throws {UsageError} if there are none
 */
function some(values: string[], what: string): string[] {
  if (values.length === 0) throw new UsageError(`missing <${what}>`);
  return values;
}

/**
 * Builds a scraper run's context.
 *
 * @param env - the environment
 * @param dir - the record folder
 * @param http - the client
 * @param tool - the ledger tool
 * @returns the context
 */
function context(env: CliEnv, dir: string, http: HttpClient, tool: string): CaptureContext {
  return { recordDir: dir, http, tool, now: env.now, offsetAt: env.offsetAt, log: env.err };
}

/**
 * Pulls `--name value` options out of an argument list.
 *
 * @param args - the arguments
 * @param names - the option names, without dashes
 * @returns the options found and the remaining positional arguments
 * @throws {UsageError} if an option has no value
 */
function options(args: string[], names: readonly string[]) {
  const found: Record<string, string> = {};
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const name = args[i]!.startsWith("--") ? args[i]!.slice(2) : null;
    if (name && names.includes(name)) {
      const value = args[++i];
      if (value === undefined) throw new UsageError(`--${name} needs a value`);
      found[name] = value;
    } else {
      rest.push(args[i]!);
    }
  }
  return { found, rest };
}

/**
 * Runs `verify` over one record or every record with a ledger.
 *
 * @param env - the environment
 * @param record - the record, or `undefined` for every record
 * @returns `0` when every ledger holds, `1` otherwise
 */
function verify(env: CliEnv, record: string | undefined): number {
  const dirs = record
    ? [recordDir(env, record)]
    : readdirSync(env.researchDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => join(env.researchDir, d.name))
        .filter(hasLedger);
  let failed = false;
  for (const dir of dirs) {
    const name = dir.slice(env.researchDir.length + 1);
    if (!hasLedger(dir)) {
      env.err(`${name}: no ledger`);
      failed = true;
      continue;
    }
    const problems = verifyLedger(dir);
    for (const problem of problems) env.err(`${name}: ${describeProblem(problem)}`);
    env.out(`${name}: ${problems.length === 0 ? "ok" : "FAILED"}`);
    failed ||= problems.length > 0;
  }
  return failed ? 1 : 0;
}

/**
 * Runs one `pnpm capture` command.
 *
 * @param argv - the arguments after `pnpm capture`
 * @param env - the records folder, terminal and clock
 * @returns the exit code
 * @throws {UsageError} if the arguments don't fit the command
 * @throws whatever the command throws: a network failure, a ledger refusal
 *   ({@link LedgerError}), a file that already exists
 */
export async function runCli(argv: readonly string[], env: CliEnv): Promise<number> {
  const [command, ...rest] = argv;
  switch (command) {
    case "dc": {
      const [sub, record, target, ...args] = rest;
      const dir = recordDir(env, record);
      const ctx = context(env, dir, dcClient({ log: env.err, ...env.http }), "capture:dc");
      if (sub === "list") {
        const [pages, ...queries] = args;
        await dcList(
          ctx,
          evidenceArg(target, "out.tsv"),
          num(pages, "pages"),
          some(queries, "query"),
        );
      } else if (sub === "fetch") {
        await dcFetch(ctx, evidenceArg(target, "outdir"), some(args, "no"));
      } else throw new UsageError(`unknown dc command: ${sub ?? ""}`);
      return 0;
    }
    case "naver": {
      const [sub, record, target, ...args] = rest;
      const dir = recordDir(env, record);
      const ctx = context(env, dir, naverClient({ log: env.err, ...env.http }), "capture:naver");
      if (sub === "list") {
        const [menu, pages] = args;
        if (!menu) throw new UsageError("missing <menuId>");
        await nvList(ctx, evidenceArg(target, "out.tsv"), menu, num(pages, "pages"));
      } else if (sub === "fetch") {
        await nvFetch(ctx, evidenceArg(target, "outdir"), some(args, "articleId"));
      } else throw new UsageError(`unknown naver command: ${sub ?? ""}`);
      return 0;
    }
    case "crumbgg": {
      const [endpoint, record, outdir, ...args] = rest;
      if (!endpoint || !(endpoint in ENDPOINTS)) {
        throw new UsageError(`unknown crumbgg endpoint: ${endpoint ?? ""}`);
      }
      const dir = recordDir(env, record);
      const ctx = context(
        env,
        dir,
        crumbggClient({ log: env.err, ...env.http }),
        "capture:crumbgg",
      );
      await crumbggCapture(ctx, evidenceArg(outdir, "outdir"), endpoint, args);
      return 0;
    }
    case "youtube":
      return youtube(env, rest);
    case "log": {
      const { found, rest: positional } = options(rest, ["url", "tool", "at"]);
      const [record, path] = positional;
      const dir = recordDir(env, record);
      if (!found.url || !found.tool) throw new UsageError("log needs --url and --tool");
      const line = appendCapture(dir, evidenceArg(path, "path"), {
        url: found.url === "-" ? null : found.url,
        capturedAt: found.at ?? isoLocal(env.now(), env.offsetAt),
        tool: found.tool,
      });
      env.out(JSON.stringify(line));
      return 0;
    }
    case "verify":
      return verify(env, rest[0]);
    case "backfill": {
      const { found, rest: positional } = options(rest, ["from"]);
      const dir = recordDir(env, positional[0]);
      const from = found.from === undefined ? undefined : resolve(found.from);
      if (from !== undefined && (!isAbsolute(from) || !existsSync(from))) {
        throw new UsageError(`--from: no folder ${found.from}`);
      }
      const lines = backfill(dir, { from });
      env.out(`${positional[0]}: wrote ${lines.length} ledger lines`);
      return 0;
    }
    default:
      throw new UsageError(`unknown command: ${command ?? ""}`);
  }
}

/**
 * Runs a `pnpm capture youtube` command.
 *
 * @param env - the environment
 * @param args - the arguments after `youtube`
 * @returns the exit code
 * @throws {UsageError} if the arguments don't fit the command
 * @throws whatever the command throws
 */
async function youtube(env: CliEnv, args: readonly string[]): Promise<number> {
  const [sub, record, ...rest] = args;
  const dir = recordDir(env, record);
  const ctx = context(env, dir, youtubeClient({ log: env.err, ...env.http }), "capture:youtube");
  switch (sub) {
    case "watch": {
      const [outdir, ...vids] = rest;
      for (const digest of await youtubeWatch(
        ctx,
        evidenceArg(outdir, "outdir"),
        some(vids, "videoId"),
      )) {
        env.out(digest);
        env.out("==========");
      }
      return 0;
    }
    case "search": {
      const [outdir, ...queries] = rest;
      for (const line of await youtubeSearch(
        ctx,
        evidenceArg(outdir, "outdir"),
        some(queries, "query"),
      )) {
        env.out(line);
      }
      return 0;
    }
    case "download": {
      const [outdir, ...vids] = rest;
      downloadVideos(ctx, evidenceArg(outdir, "outdir"), some(vids, "videoId"));
      return 0;
    }
    case "frames": {
      const [video, outdir, prefix, t0, t1, step, threshold] = rest;
      if (!prefix) throw new UsageError("missing <prefix>");
      const saved = extractFrames(ctx, evidenceArg(outdir, "outdir"), prefix, {
        video: join(dir, evidenceArg(video, "video")),
        t0: num(t0, "t0"),
        t1: num(t1, "t1"),
        step: step === undefined ? 0.5 : num(step, "step"),
        threshold: threshold === undefined ? 6 : num(threshold, "threshold"),
      });
      env.out(`saved ${saved.length}`);
      return 0;
    }
    case "sheet": {
      const [outdir, prefix, x0, y0, x1, y1, cols, rows, ...frames] = rest;
      if (!prefix) throw new UsageError("missing <prefix>");
      contactSheets(
        ctx,
        evidenceArg(outdir, "outdir"),
        prefix,
        {
          x0: num(x0, "x0"),
          y0: num(y0, "y0"),
          x1: num(x1, "x1"),
          y1: num(y1, "y1"),
          cols: num(cols, "cols"),
          rows: num(rows, "rows"),
        },
        some(frames, "frame").map((f) => evidenceArg(f, "frame")),
      );
      return 0;
    }
    case "subs": {
      const [video, outdir, prefix, y0, y1, ...more] = rest;
      if (!prefix) throw new UsageError("missing <prefix>");
      const band = more.length >= 2 ? { x0: num(more[0], "x0"), x1: num(more[1], "x1") } : {};
      const step = more.length === 1 || more.length === 3 ? num(more.at(-1), "step") : 0.5;
      const sheets = subtitleSheets(ctx, evidenceArg(outdir, "outdir"), prefix, {
        video: join(dir, evidenceArg(video, "video")),
        y0: num(y0, "y0"),
        y1: num(y1, "y1"),
        ...band,
        step,
      });
      env.out(`${sheets.length} sheets`);
      return 0;
    }
    default:
      throw new UsageError(`unknown youtube command: ${sub ?? ""}`);
  }
}
