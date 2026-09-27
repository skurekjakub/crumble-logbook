import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { CaptureRule } from "../../src/importers/captures";
import { findCapture } from "../../src/importers/captures";

const rules: CaptureRule[] = [
  { site: "dc", dir: "evidence/03-dc-posts", file: "{id}.md" },
  { site: "dc", dir: "evidence/11-dc-posts-extra", file: "{id}.md" },
  { site: "nv", dir: "evidence/07-nv-posts", file: "nv-{id}.md" },
];

let root: string;
let recordDir: string;

/** Creates an empty file at `path` relative to the record directory, with its parents. */
function touch(path: string): void {
  const full = join(recordDir, path);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, "");
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "crumble-captures-"));
  recordDir = join(root, "research", "001-test");
  touch("evidence/03-dc-posts/100.md");
  touch("evidence/11-dc-posts-extra/100.md");
  touch("evidence/11-dc-posts-extra/200.md");
  touch("evidence/07-nv-posts/nv-300.md");
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("findCapture", () => {
  it("returns the first existing match in rule order, as a root-relative POSIX path", () => {
    expect(findCapture(recordDir, rules, "dc:100", root)).toBe(
      "research/001-test/evidence/03-dc-posts/100.md",
    );
  });

  it("falls through to a later rule when earlier ones have no file", () => {
    expect(findCapture(recordDir, rules, "dc:200", root)).toBe(
      "research/001-test/evidence/11-dc-posts-extra/200.md",
    );
  });

  it("only applies rules of the source's own site", () => {
    expect(findCapture(recordDir, rules, "nv:300", root)).toBe(
      "research/001-test/evidence/07-nv-posts/nv-300.md",
    );
    expect(findCapture(recordDir, rules, "nv:100", root)).toBeNull();
  });

  it("returns null when no rule matches an existing file", () => {
    expect(findCapture(recordDir, rules, "dc:999", root)).toBeNull();
    expect(findCapture(recordDir, rules, "web:100", root)).toBeNull();
  });

  it("defaults to paths relative to the repo root", () => {
    const path = findCapture(recordDir, rules, "dc:100");
    expect(path).not.toBeNull();
    expect(path).not.toContain("\\");
    expect(path!.endsWith("research/001-test/evidence/03-dc-posts/100.md")).toBe(true);
  });
});
