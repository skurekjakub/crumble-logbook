import { and, eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import { describe, expect, it } from "vitest";
import * as schemas from "../src/zod";
import * as tables from "../src/tables";
import { createTestDb } from "./helpers";

type TestDb = ReturnType<typeof createTestDb>;

/**
 * Parses `fixture` through `insertSchema`, inserts it, re-selects it by
 * `where`, and asserts the reselected row matches the inserted row and
 * parses through `selectSchema` to an identical value.
 *
 * @param db - the test database to run against
 * @param table - the drizzle table to insert into and select from
 * @param insertSchema - the zod insert schema `fixture` must satisfy
 * @param selectSchema - the zod select schema the reselected row must satisfy
 * @param fixture - a raw insert payload
 * @param where - builds the predicate that selects exactly the inserted row
 * @returns the reselected row
 * @throws if `fixture` fails `insertSchema`, no row is found by `where`, the
 *   reselected row does not equal the inserted row, or it fails `selectSchema`
 */
function roundtrip<TTable extends AnySQLiteTable>(
  db: TestDb,
  table: TTable,
  insertSchema: { parse: (v: unknown) => InferInsertModel<TTable> },
  selectSchema: { parse: (v: unknown) => InferSelectModel<TTable> },
  fixture: unknown,
  where: (table: TTable) => ReturnType<typeof eq>,
): InferSelectModel<TTable> {
  const values = insertSchema.parse(fixture);
  const inserted = db.insert(table).values(values).returning().get();
  const selected = db.select().from(table).where(where(table)).get();
  expect(selected).toEqual(inserted);
  expect(selectSchema.parse(selected)).toEqual(selected);
  return selected as InferSelectModel<TTable>;
}

describe("round trip: insert schema -> insert -> select -> select schema", () => {
  it("round-trips every table in FK order", () => {
    const db = createTestDb();

    const source = roundtrip(
      db,
      tables.sources,
      schemas.sourceInsert,
      schemas.sourceSelect,
      {
        id: "dc:76135",
        site: "dc",
        url: "https://discord.com/channels/1/2/76135",
        date: "2026-01-01",
        relevance: 3,
      },
      (s) => eq(s.id, "dc:76135"),
    );

    roundtrip(
      db,
      tables.researchRecords,
      schemas.researchRecordInsert,
      schemas.researchRecordSelect,
      {
        slug: "gc-meta",
        question: "Which decks clear 3-star Guild Conquest?",
        status: "active",
        startedAt: "2026-01-01",
        updatedAt: "2026-01-02",
      },
      (r) => eq(r.slug, "gc-meta"),
    );

    roundtrip(
      db,
      tables.glossary,
      schemas.glossaryInsert,
      schemas.glossarySelect,
      { kr: "피겨", shorthand: ["피겨"], kind: "cookie" },
      (g) => eq(g.kr, "피겨"),
    );

    const deck = roundtrip(
      db,
      tables.decks,
      schemas.deckInsert,
      schemas.deckSelect,
      {
        id: "burn-rush",
        position: 1,
        nameEn: "Burn Rush",
        status: "meta",
        atkOrder: ["front", "back"],
      },
      (d) => eq(d.id, "burn-rush"),
    );

    roundtrip(
      db,
      tables.deckCookies,
      schemas.deckCookieInsert,
      schemas.deckCookieSelect,
      { deckId: deck.id, position: 1, cookieKr: "불꽃정령맛", why: "primary burn dealer" },
      (dc) => eq(dc.deckId, deck.id),
    );

    roundtrip(
      db,
      tables.deckPets,
      schemas.deckPetInsert,
      schemas.deckPetSelect,
      { deckId: deck.id, position: 1, petKr: "복슬양" },
      (dp) => eq(dp.deckId, deck.id),
    );

    roundtrip(
      db,
      tables.deckNotes,
      schemas.deckNoteInsert,
      schemas.deckNoteSelect,
      { deckId: deck.id, position: 1, kind: "substitution", text: "swap in a shielder if no cleanse" },
      (dn) => eq(dn.deckId, deck.id),
    );

    const runeBuild = roundtrip(
      db,
      tables.runeBuilds,
      schemas.runeBuildInsert,
      schemas.runeBuildSelect,
      { cookieKr: "불꽃정령맛", lines: "ATK/ATK/CRIT DMG", why: "maximizes burst" },
      (rb) => eq(rb.cookieKr, "불꽃정령맛"),
    );

    roundtrip(
      db,
      tables.runeBuildDecks,
      schemas.runeBuildDeckInsert,
      schemas.runeBuildDeckSelect,
      { runeBuildId: runeBuild.id, deckId: deck.id },
      (rbd) => and(eq(rbd.runeBuildId, runeBuild.id), eq(rbd.deckId, deck.id))!,
    );

    roundtrip(
      db,
      tables.gearRecs,
      schemas.gearRecInsert,
      schemas.gearRecSelect,
      { slot: "top_left", substats: "crit damage / crit rate", context: "raid", why: "best burst substats" },
      (gr) => eq(gr.substats, "crit damage / crit rate"),
    );

    roundtrip(
      db,
      tables.scores,
      schemas.scoreInsert,
      schemas.scoreSelect,
      {
        damageG: 123456.7,
        powerG: 50000,
        deckId: deck.id,
        verified: true,
        date: "2026-01-05",
        season: 12,
        player: "someone",
        note: "personal record",
      },
      (sc) => eq(sc.deckId, deck.id),
    );

    roundtrip(
      db,
      tables.rankings,
      schemas.rankingInsert,
      schemas.rankingSelect,
      {
        season: 12,
        board: "guilds",
        rank: 1,
        name: "Guild X",
        guild: "Guild X",
        valueG: 999999,
        powerG: 12345,
        ref: "screenshot",
        capturedAt: "2026-01-05T00:00:00Z",
        sourceId: source.id,
      },
      (rk) => eq(rk.capturedAt, "2026-01-05T00:00:00Z"),
    );

    roundtrip(
      db,
      tables.mechanics,
      schemas.mechanicInsert,
      schemas.mechanicSelect,
      { title: "Shield stacking", body: "Shields absorb before defense buffs apply.", confidence: "high" },
      (m) => eq(m.title, "Shield stacking"),
    );

    roundtrip(
      db,
      tables.rngFactors,
      schemas.rngFactorInsert,
      schemas.rngFactorSelect,
      { factor: "crit chance variance", effect: "damage swings roughly ±10%", mitigation: "stack crit rate to the soft cap" },
      (rf) => eq(rf.factor, "crit chance variance"),
    );

    roundtrip(
      db,
      tables.timeline,
      schemas.timelineEventInsert,
      schemas.timelineEventSelect,
      { date: "2026-01-01", event: "patch notes released" },
      (tl) => eq(tl.event, "patch notes released"),
    );

    roundtrip(
      db,
      tables.takeaways,
      schemas.takeawayInsert,
      schemas.takeawaySelect,
      { position: 1, text: "burn decks lead the meta", detail: "see research/001" },
      (tk) => eq(tk.text, "burn decks lead the meta"),
    );

    roundtrip(
      db,
      tables.recommendations,
      schemas.recommendationInsert,
      schemas.recommendationSelect,
      { summary: "retune gear substats", changes: ["increase crit rate", "reduce crit damage"] },
      (rc) => eq(rc.summary, "retune gear substats"),
    );

    roundtrip(
      db,
      tables.citations,
      schemas.citationInsert,
      schemas.citationSelect,
      { entity: "deck", entityId: deck.id, sourceId: source.id },
      (c) => and(eq(c.entity, "deck"), eq(c.entityId, deck.id))!,
    );

    roundtrip(
      db,
      tables.jobs,
      schemas.jobInsert,
      schemas.jobSelect,
      { kind: "import:record", params: { recordSlug: "gc-meta" }, status: "queued", createdAt: "2026-01-01T00:00:00Z" },
      (j) => eq(j.kind, "import:record"),
    );
  });
});
