import { describe, expect, it } from "vitest";
import { captureStamp } from "../../src/services/captures";
import { testStore } from "../helpers";

const LINE = {
  url: null,
  capturedAt: "2026-09-27T10:39:53+02:00",
  approx: null,
  tool: "curl",
  sha256: "0".repeat(64),
};

describe("CapturesRepo", () => {
  it("reads one record's capture of one path", () => {
    const store = testStore();
    store.repos.captures.insertMany([
      { recordSlug: "r1", path: "evidence/a.md", ...LINE },
      { recordSlug: "r2", path: "evidence/a.md", ...LINE, tool: "manual" },
    ]);
    expect(store.repos.captures.byPath("r2", "evidence/a.md")).toMatchObject({
      recordSlug: "r2",
      tool: "manual",
    });
    expect(store.repos.captures.byPath("r1", "evidence/b.md")).toBeUndefined();
    expect(store.repos.captures.byPath("r3", "evidence/a.md")).toBeUndefined();
  });

  it("stamps a source's capture path from its record's line alone", () => {
    const store = testStore();
    store.repos.captures.insertMany([{ recordSlug: "r1", path: "evidence/dc/1.md", ...LINE }]);
    expect(captureStamp(store.repos, "research/r1/evidence/dc/1.md")).toEqual({
      capturedAt: LINE.capturedAt,
      tool: "curl",
      approx: null,
    });
    expect(captureStamp(store.repos, "research/r2/evidence/dc/1.md")).toBeNull();
    expect(captureStamp(store.repos, "docs/x.md")).toBeNull();
  });
});
