import { mechanics, takeaways } from "@crumble/schema";
import { asc } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "../../src/db/client";
import { openDb } from "../../src/db/client";
import { createTableRepo } from "../../src/repos/table-repo";

describe("createTableRepo", () => {
  let db: Db;

  beforeEach(() => {
    db = openDb(":memory:");
  });

  it("insert returns the row with its assigned id", () => {
    const repo = createTableRepo(db, mechanics);
    const row = repo.insert({
      title: "Boss enrage timer",
      body: "Enrages at 30s.",
      confidence: "high",
    });
    expect(row.id).toBeTypeOf("number");
    expect(row).toMatchObject({ title: "Boss enrage timer", confidence: "high" });
  });

  it("update of an unknown id returns undefined", () => {
    const repo = createTableRepo(db, mechanics);
    expect(repo.update(999, { title: "unknown" })).toBeUndefined();
  });

  it("remove returns true, then false for the same id", () => {
    const repo = createTableRepo(db, mechanics);
    const row = repo.insert({
      title: "Shield stacking",
      body: "Absorbs before defense.",
      confidence: "medium",
    });
    expect(repo.remove(row.id)).toBe(true);
    expect(repo.remove(row.id)).toBe(false);
  });

  it("list respects a custom orderBy", () => {
    const repo = createTableRepo(db, takeaways, [asc(takeaways.position)]);
    repo.insert({ position: 2, text: "second" });
    repo.insert({ position: 1, text: "first" });
    repo.insert({ position: 3, text: "third" });
    expect(repo.list().map((r) => r.text)).toEqual(["first", "second", "third"]);
  });

  it("count and clear reflect the current row set", () => {
    const repo = createTableRepo(db, mechanics);
    repo.insert({ title: "a", body: "a", confidence: "high" });
    repo.insert({ title: "b", body: "b", confidence: "low" });
    expect(repo.count()).toBe(2);
    repo.clear();
    expect(repo.count()).toBe(0);
    expect(repo.list()).toEqual([]);
  });
});
