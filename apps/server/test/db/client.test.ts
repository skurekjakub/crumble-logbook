import { citations } from "@crumble/schema";
import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { openDb } from "../../src/db/client";

const EXPECTED_TABLES = [
  "sources",
  "research_records",
  "glossary",
  "deck_cookies",
  "deck_notes",
  "deck_pets",
  "decks",
  "rune_build_decks",
  "rune_builds",
  "gear_recs",
  "scores",
  "rankings",
  "mechanics",
  "rng_factors",
  "takeaways",
  "timeline",
  "recommendations",
  "citations",
  "jobs",
];

describe("openDb", () => {
  it("migrates every table into a fresh in-memory database", () => {
    const db = openDb(":memory:");
    const rows = db.all<{ name: string }>(sql`select name from sqlite_master where type = 'table'`);
    const names = rows.map((r) => r.name);
    for (const table of EXPECTED_TABLES) {
      expect(names).toContain(table);
    }
  });

  it("enforces foreign keys: a citation referencing an unknown source throws", () => {
    const db = openDb(":memory:");
    expect(() =>
      db
        .insert(citations)
        .values({ entity: "deck", entityId: "deck-a", sourceId: "dc:missing" })
        .run(),
    ).toThrow();
  });
});
