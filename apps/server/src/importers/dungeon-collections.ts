/**
 * The Crumble Dungeon mode's curated collections: each file's schema, its
 * checks and its mapping onto the dungeon tables. Every row is one the
 * record owns, cited to its own sources.
 *
 * @module
 */
import {
  DUNGEON_BOARD,
  EXCLUSION_CLASS,
  EXCLUSION_STATUS,
  RUN_EVIDENCE,
  deckSlug,
  isoDate,
  runStanding,
} from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import type { RowRefs } from "./collection-kit";
import { checkDeckModes, collection, parseRows } from "./collection-kit";
import { assertUnclaimed } from "./shared";
import { insertCited } from "./steps";

/** The source ids a curated row cites: at least one. */
const cited = z.array(z.string()).min(1);

/** A list of Korean cookie names. */
const names = z.array(z.string().min(1));

/** How many cookies deploy first: a lineup naming another number gets a warning. */
export const FIRST_WAVE = 40;

/**
 * One entry of `dungeon-runs.json`: a documented score in G, the total
 * power the screen shows (the whole collection's) and what the post says
 * about the run. `id` becomes the run's slug.
 */
export const seedDungeonRun = z.strictObject({
  id: deckSlug,
  date: isoDate,
  player: z.string().min(1).nullish(),
  server: z.string().min(1).nullish(),
  score_g: z.number().positive(),
  total_power_g: z.number().positive().nullish(),
  board: z.enum(DUNGEON_BOARD),
  server_rank: z.number().int().positive().nullish(),
  time_left_s: z.number().nonnegative().nullish(),
  cookies_left: z.number().int().nonnegative().nullish(),
  evidence: z.enum(RUN_EVIDENCE),
  deck: deckSlug.nullish(),
  atk_order: z.string().min(1).nullish(),
  perks: z.string().min(1).nullish(),
  preset: z.string().min(1).nullish(),
  note: z.string().min(1).nullish(),
  sources: cited,
});
/** Output of {@link seedDungeonRun}. */
export type SeedDungeonRun = z.output<typeof seedDungeonRun>;

/**
 * One entry of `dungeon-lineups.json`: a published first 40 in the
 * author's order, what the author leaves out, the ATK order from the top
 * and the level rule. `id` becomes the lineup's slug.
 */
export const seedDungeonLineup = z.strictObject({
  id: deckSlug,
  author: z.string().min(1),
  date: isoDate,
  deck: deckSlug.nullish(),
  complete: z.boolean(),
  first40: names.min(1),
  excluded: names,
  atk_order: names,
  level_rule: z.string().min(1),
  sources: cited,
});
/** Output of {@link seedDungeonLineup}. */
export type SeedDungeonLineup = z.output<typeof seedDungeonLineup>;

/** One entry of `dungeon-exclusions.json`: a cookie kept out of the first 40, and why. */
export const seedDungeonExclusion = z.strictObject({
  kr: z.string().min(1),
  class: z.enum(EXCLUSION_CLASS),
  why: z.string().min(1),
  status: z.enum(EXCLUSION_STATUS),
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
 * Checks one lineup's lists against each other: no cookie is both in the
 * first 40 and left out, and every cookie of the ATK order is in the first 40.
 *
 * @param file - the file, as errors name it
 * @param index - the lineup's index, as errors name it
 * @param lineup - the lineup
 * @throws {ImportError} naming the file, the lineup and the first cookie out of place
 */
function checkLineup(file: string, index: number, lineup: SeedDungeonLineup): void {
  const first = new Set(lineup.first40);
  for (const kr of lineup.excluded) {
    if (first.has(kr)) throw new ImportError(file, index, `${kr} is both in first40 and excluded`);
  }
  for (const kr of lineup.atk_order) {
    if (!first.has(kr)) throw new ImportError(file, index, `atk_order names ${kr}, not in first40`);
  }
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
            standing: runStanding(run.evidence),
            deckId: run.deck ?? null,
            atkOrder: run.atk_order ?? null,
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
      lineups.forEach((lineup, index) => checkLineup(file, index, lineup));
      checkDeckModes(
        file,
        "dungeon_lineup",
        "crumble_dungeon",
        lineups.map((lineup, index) => [index, lineup.deck ?? undefined] as const),
        context,
      );
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
    prepare: (exclusions) => [
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
