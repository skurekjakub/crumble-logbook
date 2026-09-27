import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, posix, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { repoRoot } from "../src/config";

/** One static import or re-export of a source file. */
interface ImportEdge {
  /** The importing file, repo-relative with forward slashes. */
  file: string;
  /** The module specifier as written. */
  specifier: string;
  /**
   * The imported module, repo-relative, for a relative specifier; the
   * specifier itself for a package.
   */
  target: string;
  /** True when the statement brings in types only (`import type`, or every specifier `type`-marked). */
  typeOnly: boolean;
}

/** A layering rule: which files it covers, and which of their imports break it. */
interface Rule {
  /** What the rule forbids, as a failure reads it. */
  name: string;
  /** Whether the rule covers `file` (repo-relative). */
  covers(file: string): boolean;
  /** Whether `edge` breaks the rule. */
  forbids(edge: ImportEdge): boolean;
}

/** The source roots the rules cover, repo-relative. */
const ROOTS = ["apps/server/src", "apps/web/src", "packages/schema/src"];

/** Lists every `.ts`/`.tsx` file under `dir`, repo-relative with forward slashes. */
function sourceFiles(dir: string): string[] {
  return readdirSync(join(repoRoot, dir), { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .map((entry) => relative(repoRoot, join(entry.parentPath, entry.name)).split(sep).join("/"));
}

const IMPORT_CLAUSE = String.raw`(?:[\w$]+\s*,\s*)?(?:\{[^}]*\}|\*\s+as\s+[\w$]+|\*|[\w$]+)`;
const FROM_STATEMENT = new RegExp(
  String.raw`(?:^|[;\n])\s*(import|export)\s+(type\s+)?(${IMPORT_CLAUSE})\s*from\s*["']([^"']+)["']`,
  "g",
);
const BARE_IMPORT = /(?:^|[;\n])\s*import\s*["']([^"']+)["']/g;
const DYNAMIC_IMPORT = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

/**
 * Lists the static imports, re-exports and literal dynamic imports of one
 * source file. Comments are stripped first, so an import quoted in a JSDoc
 * example doesn't count.
 *
 * @param file - repo-relative path of the file
 * @returns one edge per import statement
 */
function importsOf(file: string): ImportEdge[] {
  const code = readFileSync(join(repoRoot, file), "utf-8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const edge = (specifier: string, typeOnly: boolean): ImportEdge => ({
    file,
    specifier,
    target: specifier.startsWith(".")
      ? posix.normalize(posix.join(posix.dirname(file), specifier))
      : specifier,
    typeOnly,
  });
  const edges: ImportEdge[] = [];
  for (const [, , typeKeyword, clause, specifier] of code.matchAll(FROM_STATEMENT)) {
    const names = /^\{([^}]*)\}$/
      .exec(clause!.trim())?.[1]
      ?.split(",")
      .map((s) => s.trim());
    const everyNameIsType =
      names !== undefined && names.filter(Boolean).every((name) => name.startsWith("type "));
    edges.push(edge(specifier!, typeKeyword !== undefined || everyNameIsType));
  }
  for (const [, specifier] of code.matchAll(BARE_IMPORT)) edges.push(edge(specifier!, false));
  for (const [, specifier] of code.matchAll(DYNAMIC_IMPORT)) edges.push(edge(specifier!, false));
  return edges;
}

/** Whether `path` is `dir` or lies under it. */
const under = (path: string, dir: string) => path === dir || path.startsWith(`${dir}/`);

/** Whether `specifier` is `pkg` or one of its subpaths. */
const isPackage = (specifier: string, pkg: string) =>
  specifier === pkg || specifier.startsWith(`${pkg}/`);

const SERVER = "apps/server/src";
const WEB = "apps/web/src";
const SCHEMA = "packages/schema/src";

const isDrizzle = (edge: ImportEdge) => isPackage(edge.specifier, "drizzle-orm");
const isHono = (edge: ImportEdge) =>
  isPackage(edge.specifier, "hono") || edge.specifier.startsWith("@hono/");

/** The layering rules: the PvP plan's step R1 set, plus downward-only rules per layer. */
const RULES: Rule[] = [
  {
    name: "routes import only services, never repos, db or drizzle-orm",
    covers: (file) => under(file, `${SERVER}/routes`),
    forbids: (edge) =>
      under(edge.target, `${SERVER}/repos`) ||
      under(edge.target, `${SERVER}/db`) ||
      isDrizzle(edge),
  },
  {
    name: "services import no drizzle-orm query builders, no hono and no routes",
    covers: (file) => under(file, `${SERVER}/services`),
    forbids: (edge) =>
      (isDrizzle(edge) && !edge.typeOnly) || isHono(edge) || under(edge.target, `${SERVER}/routes`),
  },
  {
    name: "repos import no services, routes or hono",
    covers: (file) => under(file, `${SERVER}/repos`),
    forbids: (edge) =>
      under(edge.target, `${SERVER}/services`) ||
      under(edge.target, `${SERVER}/routes`) ||
      isHono(edge),
  },
  {
    name: "only repos/ and db/ import drizzle-orm values",
    covers: (file) =>
      under(file, SERVER) && !under(file, `${SERVER}/repos`) && !under(file, `${SERVER}/db`),
    forbids: (edge) => isDrizzle(edge) && !edge.typeOnly,
  },
  {
    name: "the web imports @crumble/server types only, and no server file",
    covers: (file) => under(file, WEB),
    forbids: (edge) =>
      (isPackage(edge.specifier, "@crumble/server") && !edge.typeOnly) ||
      under(edge.target, "apps/server") ||
      isDrizzle(edge),
  },
  {
    name: "packages/schema imports nothing from apps/",
    covers: (file) => under(file, SCHEMA),
    forbids: (edge) =>
      under(edge.target, "apps") ||
      isPackage(edge.specifier, "@crumble/server") ||
      isPackage(edge.specifier, "@crumble/web"),
  },
  {
    name: "components stay props-only: no src/api import",
    covers: (file) => under(file, `${WEB}/components`),
    forbids: (edge) => under(edge.target, `${WEB}/api`),
  },
  {
    name: "web lib/ stays pure: no src/api, app, views or routes import",
    covers: (file) => under(file, `${WEB}/lib`),
    forbids: (edge) =>
      ["api", "app", "views", "routes"].some((dir) => under(edge.target, `${WEB}/${dir}`)),
  },
  {
    name: "the web's api layer imports no app, views, components or routes",
    covers: (file) => under(file, `${WEB}/api`),
    forbids: (edge) =>
      ["app", "views", "components", "routes"].some((dir) => under(edge.target, `${WEB}/${dir}`)),
  },
];

/**
 * Lists every import that breaks a rule, as `rule: file imports specifier`.
 *
 * @param edges - the imports to check
 * @returns one line per violation; `[]` when the layering holds
 */
function violations(edges: ImportEdge[]): string[] {
  return RULES.flatMap((rule) =>
    edges
      .filter((edge) => rule.covers(edge.file) && rule.forbids(edge))
      .map((edge) => `${rule.name}: ${edge.file} imports "${edge.specifier}"`),
  );
}

const edges = ROOTS.flatMap(sourceFiles).flatMap(importsOf);

describe("architecture", () => {
  it("scans every source root and finds their imports", () => {
    for (const root of ROOTS) {
      expect(
        edges.some((edge) => under(edge.file, root)),
        `no imports found under ${root}`,
      ).toBe(true);
    }
  });

  it("every import respects the layering rules", () => {
    expect(violations(edges)).toEqual([]);
  });

  it("tells type-only imports apart from value imports", () => {
    const fake = (typeOnly: boolean, file = `${SERVER}/services/x.ts`): ImportEdge => ({
      file,
      specifier: "drizzle-orm",
      target: "drizzle-orm",
      typeOnly,
    });
    expect(violations([fake(true)])).toEqual([]);
    expect(violations([fake(false)])).toHaveLength(2);
    expect(violations([fake(true, `${SERVER}/routes/x.ts`)])).toHaveLength(1);
  });

  it("reads import type, inline type specifiers, multi-line clauses and re-exports", () => {
    const client = edges.find((edge) => edge.file === `${WEB}/api/client.ts`);
    expect(client).toMatchObject({ specifier: "@crumble/server", typeOnly: true });
    const schemaIndex = edges.filter((edge) => edge.file === `${SCHEMA}/index.ts`);
    expect(schemaIndex.map((edge) => edge.target)).toContain(`${SCHEMA}/tables`);
  });
});
