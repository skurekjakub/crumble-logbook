import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ImportError } from "../../src/errors";
import { loadSummaries } from "../../src/importers/extractions";

const fixtureDir = join(import.meta.dirname, "fixtures", "extract");

describe("loadSummaries", () => {
  it("maps dc posts to dc: ids", () => {
    expect(loadSummaries(fixtureDir).get("dc:76135")).toBe("Cherry deck run at 1.8G team power.");
  });

  it("maps naver posts to nv: ids with the nv- prefix stripped", () => {
    const summaries = loadSummaries(fixtureDir);
    expect(summaries.get("nv:43653")).toBe("The Cherry deck guide.");
    expect(summaries.has("nv:nv-43653")).toBe(false);
  });

  it("maps any other source to web: ids", () => {
    expect(loadSummaries(fixtureDir).get("web:crumbgg-s5")).toBe("Season 5 player rankings.");
  });

  it("keeps the first non-empty summary in file-name order", () => {
    const summaries = loadSummaries(fixtureDir);
    expect(summaries.get("dc:76135")).toBe("Cherry deck run at 1.8G team power.");
    expect(summaries.get("web:crumbgg-s5")).toBe("Season 5 player rankings.");
  });

  it("stringifies numeric ids and skips posts without a summary", () => {
    const summaries = loadSummaries(fixtureDir);
    expect(summaries.get("dc:71135")).toBe("A post whose id is a number.");
    expect(summaries.has("dc:70000")).toBe(false);
  });

  it("throws an ImportError naming a file that fails to parse", () => {
    const dir = mkdtempSync(join(tmpdir(), "crumble-extract-"));
    try {
      writeFileSync(join(dir, "broken.json"), "{ not json");
      expect(() => loadSummaries(dir)).toThrow(ImportError);
      expect(() => loadSummaries(dir)).toThrow(/broken\.json/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
