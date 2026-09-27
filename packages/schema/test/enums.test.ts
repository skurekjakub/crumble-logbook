import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  BUFF_BASE,
  CITED_ENTITY,
  CONFIDENCE,
  DECK_NOTE_KIND,
  DECK_STATUS,
  GEAR_CONTEXT,
  GEAR_SLOT,
  GLOSSARY_KIND,
  JOB_STATUS,
  RANKING_BOARD,
  RECORD_STATUS,
  SOURCE_SITE,
} from "../src/enums";
import * as schemas from "../src/zod";
import * as tables from "../src/tables";
import { createTestDb } from "./helpers";

describe("enum columns", () => {
  it("source site: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    for (const site of SOURCE_SITE) {
      const values = schemas.sourceInsert.parse({
        id: `${site}:seed`,
        site,
        url: "https://example.com",
      });
      db.insert(tables.sources).values(values).run();
      const selected = db
        .select()
        .from(tables.sources)
        .where(eq(tables.sources.id, `${site}:seed`))
        .get();
      expect(selected?.site).toBe(site);
    }
    expect(
      schemas.sourceInsert.safeParse({ id: "dc:1", site: "bogus", url: "https://example.com" })
        .success,
    ).toBe(false);
  });

  it("record status: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    for (const status of RECORD_STATUS) {
      const values = schemas.researchRecordInsert.parse({
        slug: `slug-${status}`,
        question: "q",
        status,
        startedAt: "2026-01-01",
        updatedAt: "2026-01-01",
      });
      db.insert(tables.researchRecords).values(values).run();
      const selected = db
        .select()
        .from(tables.researchRecords)
        .where(eq(tables.researchRecords.slug, `slug-${status}`))
        .get();
      expect(selected?.status).toBe(status);
    }
    expect(
      schemas.researchRecordInsert.safeParse({
        slug: "bogus-status",
        question: "q",
        status: "bogus",
        startedAt: "2026-01-01",
        updatedAt: "2026-01-01",
      }).success,
    ).toBe(false);
  });

  it("glossary kind: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    for (const kind of GLOSSARY_KIND) {
      const values = schemas.glossaryInsert.parse({ kr: `kr-${kind}`, kind });
      db.insert(tables.glossary).values(values).run();
      const selected = db
        .select()
        .from(tables.glossary)
        .where(eq(tables.glossary.kr, `kr-${kind}`))
        .get();
      expect(selected?.kind).toBe(kind);
    }
    expect(schemas.glossaryInsert.safeParse({ kr: "kr-bogus", kind: "bogus" }).success).toBe(false);
  });

  it("deck status: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    for (const status of DECK_STATUS) {
      const values = schemas.deckInsert.parse({
        id: `deck-${status}`,
        position: 1,
        nameEn: "Deck",
        status,
      });
      db.insert(tables.decks).values(values).run();
      const selected = db
        .select()
        .from(tables.decks)
        .where(eq(tables.decks.id, `deck-${status}`))
        .get();
      expect(selected?.status).toBe(status);
    }
    expect(
      schemas.deckInsert.safeParse({
        id: "deck-bogus",
        position: 1,
        nameEn: "Deck",
        status: "bogus",
      }).success,
    ).toBe(false);
  });

  it("deck note kind: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    const deck = schemas.deckInsert.parse({
      id: "note-host",
      position: 1,
      nameEn: "Host",
      status: "meta",
    });
    db.insert(tables.decks).values(deck).run();
    for (const kind of DECK_NOTE_KIND) {
      const values = schemas.deckNoteInsert.parse({
        deckId: "note-host",
        position: 1,
        kind,
        text: `note-${kind}`,
      });
      db.insert(tables.deckNotes).values(values).run();
      const selected = db
        .select()
        .from(tables.deckNotes)
        .where(eq(tables.deckNotes.text, `note-${kind}`))
        .get();
      expect(selected?.kind).toBe(kind);
    }
    expect(
      schemas.deckNoteInsert.safeParse({
        deckId: "note-host",
        position: 1,
        kind: "bogus",
        text: "x",
      }).success,
    ).toBe(false);
  });

  it("gear slot: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    for (const slot of GEAR_SLOT) {
      const values = schemas.gearRecInsert.parse({
        slot,
        substats: `substats-${slot}`,
        context: "raid",
        why: "why",
      });
      db.insert(tables.gearRecs).values(values).run();
      const selected = db
        .select()
        .from(tables.gearRecs)
        .where(eq(tables.gearRecs.substats, `substats-${slot}`))
        .get();
      expect(selected?.slot).toBe(slot);
    }
    expect(
      schemas.gearRecInsert.safeParse({ slot: "bogus", substats: "s", context: "raid", why: "w" })
        .success,
    ).toBe(false);
  });

  it("gear context: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    for (const context of GEAR_CONTEXT) {
      const values = schemas.gearRecInsert.parse({
        slot: "general",
        substats: `substats-ctx-${context}`,
        context,
        why: "why",
      });
      db.insert(tables.gearRecs).values(values).run();
      const selected = db
        .select()
        .from(tables.gearRecs)
        .where(eq(tables.gearRecs.substats, `substats-ctx-${context}`))
        .get();
      expect(selected?.context).toBe(context);
    }
    expect(
      schemas.gearRecInsert.safeParse({
        slot: "general",
        substats: "s",
        context: "bogus",
        why: "w",
      }).success,
    ).toBe(false);
  });

  it("ranking board: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    const source = schemas.sourceInsert.parse({
      id: "dc:board-source",
      site: "dc",
      url: "https://example.com",
    });
    db.insert(tables.sources).values(source).run();
    for (const board of RANKING_BOARD) {
      const values = schemas.rankingInsert.parse({
        board,
        rank: 1,
        name: `name-${board}`,
        valueG: 1,
        capturedAt: `cap-${board}`,
        sourceId: "dc:board-source",
      });
      db.insert(tables.rankings).values(values).run();
      const selected = db
        .select()
        .from(tables.rankings)
        .where(eq(tables.rankings.capturedAt, `cap-${board}`))
        .get();
      expect(selected?.board).toBe(board);
    }
    expect(
      schemas.rankingInsert.safeParse({
        board: "bogus",
        rank: 1,
        name: "n",
        valueG: 1,
        capturedAt: "c",
        sourceId: "dc:board-source",
      }).success,
    ).toBe(false);
  });

  it("confidence: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    for (const confidence of CONFIDENCE) {
      const values = schemas.mechanicInsert.parse({
        title: `title-${confidence}`,
        body: "body",
        confidence,
      });
      db.insert(tables.mechanics).values(values).run();
      const selected = db
        .select()
        .from(tables.mechanics)
        .where(eq(tables.mechanics.title, `title-${confidence}`))
        .get();
      expect(selected?.confidence).toBe(confidence);
    }
    expect(
      schemas.mechanicInsert.safeParse({ title: "t", body: "b", confidence: "bogus" }).success,
    ).toBe(false);
  });

  it("buff base: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    const buff = {
      effectType: "AttackPointAddition",
      skillGrade: 0,
      fromStar: 0,
      valuePct: 6,
      maxStack: 10,
      scalesWithCasterAmp: true,
    };
    for (const base of BUFF_BASE) {
      const values = schemas.buffValueInsert.parse({ ...buff, cookieKr: `kr-${base}`, base });
      db.insert(tables.buffValues).values(values).run();
      const selected = db
        .select()
        .from(tables.buffValues)
        .where(eq(tables.buffValues.cookieKr, `kr-${base}`))
        .get();
      expect(selected?.base).toBe(base);
    }
    expect(
      schemas.buffValueInsert.safeParse({ ...buff, cookieKr: "kr", base: "CastersDefense" })
        .success,
    ).toBe(false);
  });

  it("job status: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    for (const status of JOB_STATUS) {
      const values = schemas.jobInsert.parse({
        kind: `kind-${status}`,
        params: {},
        status,
        createdAt: "2026-01-01T00:00:00Z",
      });
      db.insert(tables.jobs).values(values).run();
      const selected = db
        .select()
        .from(tables.jobs)
        .where(eq(tables.jobs.kind, `kind-${status}`))
        .get();
      expect(selected?.status).toBe(status);
    }
    expect(
      schemas.jobInsert.safeParse({
        kind: "k",
        params: {},
        status: "bogus",
        createdAt: "2026-01-01T00:00:00Z",
      }).success,
    ).toBe(false);
  });

  it("cited entity: every member inserts and round-trips; a non-member is rejected", () => {
    const db = createTestDb();
    const source = schemas.sourceInsert.parse({
      id: "dc:cite-source",
      site: "dc",
      url: "https://example.com",
    });
    db.insert(tables.sources).values(source).run();
    for (const entity of CITED_ENTITY) {
      const values = schemas.citationInsert.parse({
        entity,
        entityId: `entity-${entity}`,
        sourceId: "dc:cite-source",
      });
      db.insert(tables.citations).values(values).run();
      const selected = db
        .select()
        .from(tables.citations)
        .where(eq(tables.citations.entityId, `entity-${entity}`))
        .get();
      expect(selected?.entity).toBe(entity);
    }
    expect(
      schemas.citationInsert.safeParse({
        entity: "bogus",
        entityId: "x",
        sourceId: "dc:cite-source",
      }).success,
    ).toBe(false);
  });

  it("sourceInsert rejects a malformed date, accepts a null date, and rejects a malformed id", () => {
    expect(
      schemas.sourceInsert.safeParse({
        id: "dc:1",
        site: "dc",
        url: "https://example.com",
        date: "?",
      }).success,
    ).toBe(false);
    expect(
      schemas.sourceInsert.safeParse({
        id: "dc:1",
        site: "dc",
        url: "https://example.com",
        date: null,
      }).success,
    ).toBe(true);
    expect(
      schemas.sourceInsert.safeParse({ id: "76135", site: "dc", url: "https://example.com" })
        .success,
    ).toBe(false);
  });
});
