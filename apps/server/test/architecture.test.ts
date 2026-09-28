import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";
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

const SERVER = "apps/server/src";
const WEB = "apps/web/src";
const SCHEMA = "packages/schema/src";
const SIM = "packages/sim/src";

/** The source roots the rules cover, repo-relative; the sim package's once it exists. */
const ROOTS = [SERVER, WEB, SCHEMA, ...(existsSync(join(repoRoot, SIM)) ? [SIM] : [])];

/**
 * Lists every `.ts`/`.tsx` file under `dir`, repo-relative with forward slashes.
 *
 * @param dir - the directory, repo-relative
 * @returns the files' paths
 */
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

/**
 * Reports whether `path` is `dir` or lies under it.
 *
 * @param path - a repo-relative path
 * @param dir - a repo-relative directory
 * @returns `true` if `path` is `dir` or inside it
 */
const under = (path: string, dir: string) => path === dir || path.startsWith(`${dir}/`);

/**
 * Reports whether `specifier` is `pkg` or one of its subpaths.
 *
 * @param specifier - an import specifier
 * @param pkg - a package name
 * @returns `true` if `specifier` imports from `pkg`
 */
const isPackage = (specifier: string, pkg: string) =>
  specifier === pkg || specifier.startsWith(`${pkg}/`);

const isDrizzle = (edge: ImportEdge) => isPackage(edge.specifier, "drizzle-orm");
const isHono = (edge: ImportEdge) =>
  isPackage(edge.specifier, "hono") || edge.specifier.startsWith("@hono/");
const isSim = (edge: ImportEdge) =>
  isPackage(edge.specifier, "@crumble/sim") || under(edge.target, SIM);

/** The server files, besides their own folder, that importers may import values from. */
const IMPORTER_DEPENDENCIES = [
  "errors",
  "registry",
  "config",
  "services/names",
  "services/deck-modes",
].map((path) => `${SERVER}/${path}`);

/**
 * Reports whether an importer may make `edge`: its own files, the schema
 * package, zod, node builtins, drizzle-orm and repos types, and the shared
 * server files in {@link IMPORTER_DEPENDENCIES}.
 *
 * @param edge - an import of a file under `importers/`
 * @returns `true` if the import is allowed
 */
function importerMayImport(edge: ImportEdge): boolean {
  return (
    under(edge.target, `${SERVER}/importers`) ||
    isPackage(edge.specifier, "@crumble/schema") ||
    isPackage(edge.specifier, "zod") ||
    edge.specifier.startsWith("node:") ||
    ((isDrizzle(edge) || under(edge.target, `${SERVER}/repos`)) && edge.typeOnly) ||
    IMPORTER_DEPENDENCIES.includes(edge.target)
  );
}

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
    name: "registry.ts imports only @crumble/schema, zod and drizzle-orm types",
    covers: (file) => file === `${SERVER}/registry.ts`,
    forbids: (edge) =>
      !(
        isPackage(edge.specifier, "@crumble/schema") ||
        isPackage(edge.specifier, "zod") ||
        (isDrizzle(edge) && edge.typeOnly)
      ),
  },
  {
    name: "importers/ import only what importerMayImport allows",
    covers: (file) => under(file, `${SERVER}/importers`),
    forbids: (edge) => !importerMayImport(edge),
  },
  {
    name: "cli/ is a composition root: it imports anything below routes, and nothing of the HTTP layer",
    covers: (file) => under(file, `${SERVER}/cli`),
    forbids: (edge) =>
      under(edge.target, `${SERVER}/routes`) ||
      edge.target === `${SERVER}/app` ||
      edge.target === `${SERVER}/main` ||
      isHono(edge),
  },
  {
    name: "nothing imports cli/",
    covers: (file) => under(file, SERVER) && !under(file, `${SERVER}/cli`),
    forbids: (edge) => under(edge.target, `${SERVER}/cli`),
  },
  {
    name: "packages/sim is pure: it imports only zod and its own files",
    covers: (file) => under(file, SIM),
    forbids: (edge) => !(isPackage(edge.specifier, "zod") || under(edge.target, SIM)),
  },
  {
    name: "only server services import @crumble/sim values (routes may import its input schemas; repos and db nothing)",
    covers: (file) => under(file, SERVER) && !under(file, `${SERVER}/services`),
    forbids: (edge) => {
      if (!isSim(edge)) return false;
      if (under(edge.file, `${SERVER}/repos`) || under(edge.file, `${SERVER}/db`)) return true;
      if (edge.typeOnly) return false;
      return !(under(edge.file, `${SERVER}/routes`) && edge.specifier === "@crumble/sim/input");
    },
  },
  {
    name: "the web imports nothing from @crumble/sim",
    covers: (file) => under(file, WEB),
    forbids: isSim,
  },
  {
    name: "packages/schema imports nothing from @crumble/sim",
    covers: (file) => under(file, SCHEMA),
    forbids: isSim,
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

/**
 * Builds the edge an import statement in `file` would make, for testing a rule.
 *
 * @param file - the importing file, repo-relative
 * @param specifier - the module specifier as written
 * @param typeOnly - whether the import brings in types only
 * @returns the edge, with a relative specifier resolved against `file`
 */
function fake(file: string, specifier: string, typeOnly = false): ImportEdge {
  return {
    file,
    specifier,
    target: specifier.startsWith(".")
      ? posix.normalize(posix.join(posix.dirname(file), specifier))
      : specifier,
    typeOnly,
  };
}

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
    const service = `${SERVER}/services/x.ts`;
    expect(violations([fake(service, "drizzle-orm", true)])).toEqual([]);
    expect(violations([fake(service, "drizzle-orm")])).toHaveLength(2);
    expect(violations([fake(`${SERVER}/routes/x.ts`, "drizzle-orm", true)])).toHaveLength(1);
  });

  it("keeps registry.ts declarative and importers/ off the HTTP layer", () => {
    const registry = `${SERVER}/registry.ts`;
    expect(violations([fake(registry, "@crumble/schema"), fake(registry, "zod")])).toEqual([]);
    expect(violations([fake(registry, "drizzle-orm/sqlite-core", true)])).toEqual([]);
    expect(violations([fake(registry, "./repos")])).toHaveLength(1);
    expect(violations([fake(registry, "./services/names", true)])).toHaveLength(1);
    const importer = `${SERVER}/importers/x.ts`;
    expect(violations([fake(importer, "../routes/content", true)])).toHaveLength(1);
    expect(violations([fake(importer, "hono")])).toHaveLength(1);
    expect(violations([fake(importer, "../services/names")])).toEqual([]);
  });

  it("lets importers/ import only what the allow-list names", () => {
    const importer = `${SERVER}/importers/seed/x.ts`;
    const allowed = [
      fake(importer, "./map"),
      fake(importer, "../steps"),
      fake(importer, "@crumble/schema"),
      fake(importer, "zod"),
      fake(importer, "node:fs"),
      fake(importer, "drizzle-orm", true),
      fake(importer, "../../repos", true),
      fake(importer, "../../repos/glossary", true),
      fake(importer, "../../errors"),
      fake(importer, "../../registry"),
      fake(importer, "../../config"),
      fake(importer, "../../services/names"),
      fake(importer, "../../services/deck-modes"),
    ];
    expect(violations(allowed)).toEqual([]);
    for (const forbidden of [
      fake(importer, "../../repos"),
      fake(importer, "../../services/content"),
      fake(importer, "../../db/client", true),
      fake(importer, "../../app", true),
      fake(importer, "../../cli/export"),
      fake(importer, "left-pad"),
    ]) {
      expect(violations([forbidden]).length, forbidden.specifier).toBeGreaterThan(0);
    }
  });

  it("treats cli/ as a composition root that nothing else imports", () => {
    const cli = `${SERVER}/cli/x.ts`;
    const below = ["../db/client", "../repos", "../services/export", "../importers/import-record"];
    expect(violations(below.map((specifier) => fake(cli, specifier)))).toEqual([]);
    for (const specifier of ["../routes/content", "../app", "../main", "hono"]) {
      expect(violations([fake(cli, specifier)]), specifier).toHaveLength(1);
    }
    expect(violations([fake(`${SERVER}/services/x.ts`, "../cli/export", true)])).toHaveLength(1);
  });

  it("keeps packages/sim pure and its values in the server's services", () => {
    const sim = `${SIM}/kernel/x.ts`;
    expect(violations([fake(sim, "zod"), fake(sim, "../formulas/damage")])).toEqual([]);
    expect(violations([fake(sim, "node:fs")])).toHaveLength(1);
    expect(violations([fake(sim, "@crumble/schema", true)])).toHaveLength(1);

    expect(violations([fake(`${SERVER}/services/sim.ts`, "@crumble/sim")])).toEqual([]);
    const route = `${SERVER}/routes/sim.ts`;
    expect(
      violations([fake(route, "@crumble/sim/input"), fake(route, "@crumble/sim", true)]),
    ).toEqual([]);
    expect(violations([fake(route, "@crumble/sim")])).toHaveLength(1);
    expect(violations([fake(`${SERVER}/repos/x.ts`, "@crumble/sim", true)])).toHaveLength(1);
    expect(violations([fake(`${SERVER}/db/x.ts`, "@crumble/sim/input", true)])).toHaveLength(1);
    expect(violations([fake(`${WEB}/views/x.tsx`, "@crumble/sim", true)])).toHaveLength(1);
    expect(violations([fake(`${SCHEMA}/x.ts`, "@crumble/sim", true)])).toHaveLength(1);
  });

  it("catches a relative path into packages/sim/src as it catches @crumble/sim", () => {
    const sim = "../../../../packages/sim/src/index";
    expect(violations([fake(`${SERVER}/services/x.ts`, sim)])).toEqual([]);
    expect(violations([fake(`${SERVER}/routes/x.ts`, sim)])).toHaveLength(1);
    expect(violations([fake(`${SERVER}/repos/x.ts`, sim, true)])).toHaveLength(1);
    expect(violations([fake(`${WEB}/views/x.tsx`, sim, true)])).toHaveLength(1);
    expect(violations([fake(`${SCHEMA}/x.ts`, "../../sim/src/index", true)])).toHaveLength(1);
  });

  it("reads import type, inline type specifiers, multi-line clauses and re-exports", () => {
    const client = edges.find((edge) => edge.file === `${WEB}/api/client.ts`);
    expect(client).toMatchObject({ specifier: "@crumble/server", typeOnly: true });
    const schemaIndex = edges.filter((edge) => edge.file === `${SCHEMA}/index.ts`);
    expect(schemaIndex.map((edge) => edge.target)).toContain(`${SCHEMA}/tables`);
  });
});
