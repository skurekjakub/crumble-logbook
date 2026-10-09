/**
 * The daily dungeon mode's curated collections: each file's schema, its
 * checks and its mapping onto the daily dungeon tables. Every row is one
 * the record owns, cited to its own sources. The seed schemas take each
 * field's rule from the table's insert schema, so a row the importer
 * accepts is one the API would. A deck's run facts come with the deck
 * (`decks.json`); see `seedDeck`.
 *
 * @module
 */
import {
  clearDeckProblem,
  dailyDeckProblem,
  dailyDungeonClearInsert,
  dailyDungeonInsert,
  isoDate,
  sourceId,
  withPowerG,
} from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import type { Repos } from "../repos";
import type { RowRefs } from "./collection-kit";
import { assertDistinct, checkDeckModes, collection, parseRows } from "./collection-kit";
import type { SeedDeck } from "./seed/schema";
import { assertUnclaimed } from "./shared";
import type { WriteStep } from "./steps";
import { insertCited } from "./steps";

/** The source ids a curated row cites: at least one. */
const cited = z.array(z.string()).min(1);

const dungeon = dailyDungeonInsert.shape;
const clear = dailyDungeonClearInsert.shape;
/** A stage a run reached: a positive whole number, as a clear's `stage` takes it. */
const clearStage = clear.stage;

/**
 * One entry of `daily-dungeons.json`: a dungeon by its curated id, its
 * names, drops, entry, boss, the highest stage the record found cleared
 * (with the day and the source that shows it) and short notes. A field
 * that may be `null` may also be left out; `null` means the record
 * doesn't know.
 */
export const seedDailyDungeon = z.strictObject({
  id: dungeon.slug,
  name_en: dungeon.nameEn,
  name_kr: dungeon.nameKr,
  drops: dungeon.drops,
  entry: z.strictObject({
    keys: dungeon.entryKeys,
    ticket_back_on_loss: dungeon.ticketBackOnLoss,
    quick_clear: dungeon.quickClear,
    note: dungeon.entryNote,
  }),
  boss: z.strictObject({
    kr: dungeon.bossKr,
    en: dungeon.bossEn,
    element: dungeon.bossElement,
    weakness: dungeon.bossWeakness,
    rotates: dungeon.bossRotates,
    rotation: dungeon.bossRotation,
  }),
  top_stage: z
    .strictObject({
      stage: clearStage,
      date: isoDate,
      source: sourceId,
    })
    .nullish(),
  notes: dungeon.notes.default([]),
  sources: cited,
});
/** Output of {@link seedDailyDungeon}. */
export type SeedDailyDungeon = z.output<typeof seedDailyDungeon>;

/**
 * One entry of `dungeon-clears.json`: a documented clear of a daily
 * dungeon's stage, with the team power as posted, the deck when the
 * lineup matches one, how far it played itself, when, who and what backs
 * it. A field that may be `null` may also be left out.
 */
export const seedDailyDungeonClear = z.strictObject({
  dungeon: clear.dungeon,
  stage: clear.stage,
  power: clear.power,
  deck: clear.deckId,
  auto: clear.auto,
  date: clear.date,
  player: clear.player,
  evidence: clear.evidence,
  note: clear.note,
  sources: cited,
});
/** Output of {@link seedDailyDungeonClear}. */
export type SeedDailyDungeonClear = z.output<typeof seedDailyDungeonClear>;

/**
 * Checks a curated deck's run facts: `dungeon` and `auto` come together,
 * the other run facts only with them, and the deck keeps the daily
 * dungeon rules (`dailyDeckProblem`).
 *
 * @param deck - the curated deck, its mode resolved
 * @returns what is wrong with the deck's run facts, or `undefined` when nothing is
 */
export function dailyRunProblem(deck: SeedDeck): string | undefined {
  const named = deck.dungeon !== undefined || deck.auto !== undefined;
  if (named && (deck.dungeon === undefined || deck.auto === undefined)) {
    return "a deck's run facts name both dungeon and auto";
  }
  const facts = [deck.stage, deck.power, deck.recommended_power, deck.gear_preset, deck.captain];
  if (!named && facts.some((field) => field !== undefined)) {
    return "stage, power, recommended_power, gear_preset and captain are a daily dungeon deck's; name its dungeon and auto too";
  }
  return dailyDeckProblem({
    mode: deck.mode,
    cookies: deck.cookies.map((cookie) => cookie.kr),
    run: named ? { captainKr: deck.captain } : null,
  });
}

/**
 * The slugs of the daily dungeons stored when a step runs: this record's,
 * written before the step, and other records'.
 *
 * @param repos - the write's repos
 * @returns the slugs
 */
export function storedDungeons(repos: Repos): Set<string> {
  return new Set(repos.dailyDungeons.list().map((row) => row.slug));
}

/**
 * A step checking each clear against the stored rows: it names a stored
 * daily dungeon, and the deck it names, when it names one, runs that
 * dungeon. It writes nothing.
 *
 * @param file - the file, as errors name it
 * @param clears - the clears, in file order
 * @returns the step
 * @throws {ImportError} (from the step) naming the file and row of the
 *   first clear that breaks either rule; the import then writes nothing
 */
function checkClearDungeons(file: string, clears: readonly SeedDailyDungeonClear[]): WriteStep {
  return (repos: Repos) => {
    const dungeons = storedDungeons(repos);
    clears.forEach((row, index) => {
      if (!dungeons.has(row.dungeon)) {
        throw new ImportError(file, index, `daily dungeon ${row.dungeon} isn't loaded`);
      }
      if (row.deck == null) return;
      const runs = repos.decks.dailyRuns([row.deck])[0]?.dungeon;
      const problem = clearDeckProblem(row.dungeon, row.deck, runs);
      if (problem) throw new ImportError(file, index, problem);
    });
  };
}

/** The daily dungeons collection, keyed as in the curated manifest; written before the decks that run them. */
export const DAILY_DUNGEONS = {
  dailyDungeons: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseRows(file, raw, seedDailyDungeon),
    /** @inheritdoc */
    refs: (dungeons): RowRefs[] =>
      dungeons.map((row, index) => ({
        row: index,
        sources: [...row.sources, ...(row.top_stage ? [row.top_stage.source] : [])],
      })),
    /** @inheritdoc */
    check: (file, dungeons) => {
      assertDistinct(
        file,
        "id",
        dungeons.map((row) => row.id),
      );
    },
    /** @inheritdoc */
    prepare: (dungeons, { file }) => [
      (repos) => {
        const holders = new Map(
          repos.dailyDungeons.list().map((row) => [row.slug, row.recordSlug]),
        );
        assertUnclaimed(
          file,
          "daily dungeon id",
          dungeons.map((row) => row.id),
          (slug) => holders.get(slug),
        );
      },
      insertCited(
        "dailyDungeons",
        dungeons.map((row, position) => ({
          values: {
            slug: row.id,
            position,
            nameEn: row.name_en,
            nameKr: row.name_kr ?? null,
            drops: row.drops,
            entryKeys: row.entry.keys ?? null,
            ticketBackOnLoss: row.entry.ticket_back_on_loss ?? null,
            quickClear: row.entry.quick_clear ?? null,
            entryNote: row.entry.note ?? null,
            bossKr: row.boss.kr ?? null,
            bossEn: row.boss.en ?? null,
            bossElement: row.boss.element ?? null,
            bossWeakness: row.boss.weakness ?? null,
            bossRotates: row.boss.rotates ?? null,
            bossRotation: row.boss.rotation ?? null,
            topStage: row.top_stage?.stage ?? null,
            topStageDate: row.top_stage?.date ?? null,
            topStageSource: row.top_stage?.source ?? null,
            notes: row.notes,
          },
          sources: [...new Set([...row.sources, ...(row.top_stage ? [row.top_stage.source] : [])])],
        })),
      ),
    ],
  }),
};

/** The daily dungeon clears collection, keyed as in the curated manifest; written after the decks. */
export const DAILY_DUNGEON_CLEARS = {
  dailyDungeonClears: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseRows(file, raw, seedDailyDungeonClear),
    /** @inheritdoc */
    refs: (clears): RowRefs[] =>
      clears.map((row, index) => ({
        row: index,
        sources: row.sources,
        decks: row.deck == null ? [] : [row.deck],
      })),
    /** @inheritdoc */
    check: (file, clears, context) => {
      checkDeckModes(
        file,
        "daily_dungeon_clear",
        "daily_dungeon",
        clears.map((row, index) => [index, row.deck ?? undefined] as const),
        context,
      );
    },
    /** @inheritdoc */
    prepare: (clears, { file }) => [
      checkClearDungeons(file, clears),
      insertCited(
        "dailyDungeonClears",
        clears.map((row) => ({
          values: withPowerG({
            dungeon: row.dungeon,
            stage: row.stage,
            power: row.power ?? null,
            deckId: row.deck ?? null,
            auto: row.auto ?? null,
            date: row.date,
            player: row.player ?? null,
            evidence: row.evidence,
            note: row.note ?? null,
          }),
          sources: row.sources,
        })),
      ),
    ],
  }),
};
