/**
 * The Crumble Dungeon mode's curated collections: each file's schema, its
 * checks and its mapping onto the dungeon tables. Every row is one the
 * record owns, cited to its own sources. The seed schemas take each
 * field's rule from the table's insert schema, so a row the importer
 * accepts is one the API would.
 *
 * @module
 */
import {
  dungeonExclusionInsert,
  dungeonLineupInsert,
  dungeonRunInsert,
  lineupProblem,
  runStanding,
} from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import type { Repos } from "../repos";
import type { RowRefs } from "./collection-kit";
import { checkCurrentDecks, checkDeckModes, collection, parseRows } from "./collection-kit";
import { assertUnclaimed } from "./shared";
import type { WriteStep } from "./steps";
import { insertCited } from "./steps";

/** The source ids a curated row cites: at least one. */
const cited = z.array(z.string()).min(1);

/** How many cookies deploy first: a lineup naming another number gets a warning. */
export const FIRST_WAVE = 40;

const run = dungeonRunInsert.shape;
/**
 * One entry of `dungeon-runs.json`: a documented score in G, the total
 * power the screen shows (the whole collection's) and what the post says
 * about the run, its ATK order as Korean names. `id` becomes the run's slug.
 */
export const seedDungeonRun = z.strictObject({
  id: run.slug,
  date: run.date,
  player: run.player,
  server: run.server,
  score_g: run.scoreG,
  total_power_g: run.totalPowerG,
  board: run.board,
  server_rank: run.serverRank,
  time_left_s: run.timeLeftS,
  cookies_left: run.cookiesLeft,
  evidence: run.evidence,
  deck: run.deckId,
  atk_order: run.atkOrder,
  atk_order_note: run.atkOrderNote,
  perks: run.perks,
  preset: run.preset,
  note: run.note,
  sources: cited,
});
/** Output of {@link seedDungeonRun}. */
export type SeedDungeonRun = z.output<typeof seedDungeonRun>;

const lineup = dungeonLineupInsert.shape;
/**
 * One entry of `dungeon-lineups.json`: a published first 40 in the
 * author's order, what the author leaves out, the ATK order from the top
 * and the level rule. `id` becomes the lineup's slug.
 */
export const seedDungeonLineup = z.strictObject({
  id: lineup.slug,
  author: lineup.author,
  date: lineup.date,
  deck: lineup.deckId,
  complete: lineup.complete,
  first40: lineup.first40,
  excluded: lineup.excluded,
  atk_order: lineup.atkOrder,
  level_rule: lineup.levelRule,
  sources: cited,
});
/** Output of {@link seedDungeonLineup}. */
export type SeedDungeonLineup = z.output<typeof seedDungeonLineup>;

const exclusion = dungeonExclusionInsert.shape;
/** One entry of `dungeon-exclusions.json`: a cookie kept out of the first 40, and why. */
export const seedDungeonExclusion = z.strictObject({
  kr: exclusion.cookieKr,
  class: exclusion.kind,
  why: exclusion.why,
  status: exclusion.status,
  sources: cited,
});
/** Output of {@link seedDungeonExclusion}. */
export type SeedDungeonExclusion = z.output<typeof seedDungeonExclusion>;

/**
 * Checks that every value of `values` is new.
 *
 * @param file - the file, as errors name it
 * @param what - the field, as errors name it
 * @param values - the values, in file order
 * @throws {ImportError} naming the file, the index and the value of the first repeat
 */
function assertDistinct(file: string, what: string, values: readonly string[]): void {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value)) throw new ImportError(file, index, `duplicate ${what} "${value}"`);
    seen.add(value);
  });
}

/**
 * A step checking that every cookie name the rows give is a glossary
 * entry's Korean name, as the glossary stands when it runs (this record's
 * entries are written before it, another record's before this import). It
 * writes nothing.
 *
 * @param file - the file, as errors name it
 * @param rows - each row's cookie names, by the row as errors name it
 * @returns the step
 * @throws {ImportError} (from the step) naming the file, the row and the
 *   first name no glossary entry has; the import then writes nothing
 */
function checkNames(file: string, rows: ReadonlyArray<readonly string[]>): WriteStep {
  return (repos: Repos) => {
    rows.forEach((names, index) => {
      for (const kr of names) {
        if (!repos.glossary.get(kr)) {
          throw new ImportError(file, index, `${kr} is no glossary entry's Korean name`);
        }
      }
    });
  };
}

/** The Crumble Dungeon mode's collections, by their key in the curated manifest; every one is optional. */
export const DUNGEON_COLLECTIONS = {
  dungeonRuns: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseRows(file, raw, seedDungeonRun),
    /** @inheritdoc */
    refs: (runs): RowRefs[] =>
      runs.map((run, index) => ({
        row: index,
        sources: run.sources,
        decks: run.deck == null ? [] : [run.deck],
      })),
    /** @inheritdoc */
    check: (file, runs, context) => {
      assertDistinct(
        file,
        "id",
        runs.map((run) => run.id),
      );
      checkDeckModes(
        file,
        "dungeon_run",
        "crumble_dungeon",
        runs.map((run, index) => [index, run.deck ?? undefined] as const),
        context,
      );
    },
    /** @inheritdoc */
    prepare: (runs, { file }) => [
      checkNames(
        file,
        runs.map((run) => run.atk_order ?? []),
      ),
      (repos) => {
        const holders = new Map(repos.dungeonRuns.list().map((row) => [row.slug, row.recordSlug]));
        assertUnclaimed(
          file,
          "dungeon run id",
          runs.map((run) => run.id),
          (slug) => holders.get(slug),
        );
      },
      insertCited(
        "dungeonRuns",
        runs.map((run) => ({
          values: {
            slug: run.id,
            date: run.date,
            player: run.player ?? null,
            server: run.server ?? null,
            scoreG: run.score_g,
            totalPowerG: run.total_power_g ?? null,
            board: run.board,
            serverRank: run.server_rank ?? null,
            timeLeftS: run.time_left_s ?? null,
            cookiesLeft: run.cookies_left ?? null,
            evidence: run.evidence,
            standing: runStanding(run),
            deckId: run.deck ?? null,
            atkOrder: run.atk_order ?? null,
            atkOrderNote: run.atk_order_note ?? null,
            perks: run.perks ?? null,
            preset: run.preset ?? null,
            note: run.note ?? null,
          },
          sources: run.sources,
        })),
      ),
    ],
  }),
  dungeonLineups: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseRows(file, raw, seedDungeonLineup),
    /** @inheritdoc */
    refs: (lineups): RowRefs[] =>
      lineups.map((lineup, index) => ({
        row: index,
        sources: lineup.sources,
        decks: lineup.deck == null ? [] : [lineup.deck],
      })),
    /** @inheritdoc */
    check: (file, lineups, context) => {
      assertDistinct(
        file,
        "id",
        lineups.map((lineup) => lineup.id),
      );
      lineups.forEach((lineup, index) => {
        const problem = lineupProblem({ ...lineup, atkOrder: lineup.atk_order });
        if (problem) throw new ImportError(file, index, problem);
      });
      const decks = lineups.map((lineup, index) => [index, lineup.deck ?? undefined] as const);
      checkDeckModes(file, "dungeon_lineup", "crumble_dungeon", decks, context);
      checkCurrentDecks(file, "dungeon_lineup", decks, context);
    },
    /** @inheritdoc */
    warnings: (lineups) =>
      lineups
        .filter((lineup) => lineup.complete && lineup.first40.length !== FIRST_WAVE)
        .map(
          (lineup) =>
            `dungeon lineup ${lineup.id} is complete but lists ${lineup.first40.length} cookies in first40, not ${FIRST_WAVE}`,
        ),
    /** @inheritdoc */
    prepare: (lineups, { file }) => [
      checkNames(
        file,
        lineups.map((lineup) => [...lineup.first40, ...lineup.excluded, ...lineup.atk_order]),
      ),
      (repos) => {
        const holders = new Map(
          repos.dungeonLineups.list().map((row) => [row.slug, row.recordSlug]),
        );
        assertUnclaimed(
          file,
          "dungeon lineup id",
          lineups.map((lineup) => lineup.id),
          (slug) => holders.get(slug),
        );
      },
      insertCited(
        "dungeonLineups",
        lineups.map((lineup) => ({
          values: {
            slug: lineup.id,
            author: lineup.author,
            date: lineup.date,
            deckId: lineup.deck ?? null,
            complete: lineup.complete,
            first40: lineup.first40,
            excluded: lineup.excluded,
            atkOrder: lineup.atk_order,
            levelRule: lineup.level_rule,
          },
          sources: lineup.sources,
        })),
      ),
    ],
  }),
  dungeonExclusions: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseRows(file, raw, seedDungeonExclusion),
    /** @inheritdoc */
    refs: (exclusions): RowRefs[] =>
      exclusions.map((exclusion, index) => ({ row: index, sources: exclusion.sources })),
    /** @inheritdoc */
    check: (file, exclusions) => {
      assertDistinct(
        file,
        "kr",
        exclusions.map((exclusion) => exclusion.kr),
      );
    },
    /** @inheritdoc */
    prepare: (exclusions, { file }) => [
      checkNames(
        file,
        exclusions.map((exclusion) => [exclusion.kr]),
      ),
      insertCited(
        "dungeonExclusions",
        exclusions.map((exclusion) => ({
          values: {
            cookieKr: exclusion.kr,
            kind: exclusion.class,
            why: exclusion.why,
            status: exclusion.status,
          },
          sources: exclusion.sources,
        })),
      ),
    ],
  }),
};
