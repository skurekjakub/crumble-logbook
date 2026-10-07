import type {
  AccountCookieRow,
  AccountLineupRow,
  AccountRoadmapItemRow,
  AccountRoadmapRow,
  AccountSnapshotRow,
} from "@crumble/schema";
import {
  accountCookies,
  accountLineups,
  accountRoadmapItems,
  accountRoadmaps,
  accountSnapshots,
} from "@crumble/schema";
import type { InferInsertModel } from "drizzle-orm";
import { asc, desc, eq, inArray } from "drizzle-orm";
import type { Db } from "../db/client";
import { resetIds } from "./sequence";

/** Insert payload for a snapshot row. */
export type AccountSnapshotInsert = InferInsertModel<typeof accountSnapshots>;

/** Insert payload for a roadmap row. */
export type AccountRoadmapInsert = InferInsertModel<typeof accountRoadmaps>;

/** One cookie of a lineup, without the ids and position the repo assigns. */
export type AccountCookieInsert = Omit<
  InferInsertModel<typeof accountCookies>,
  "id" | "lineupId" | "position"
>;

/** One lineup of a snapshot with its cookies, without the ids and position the repo assigns. */
export type AccountLineupInsert = Omit<
  InferInsertModel<typeof accountLineups>,
  "id" | "snapshotId" | "position"
> & { cookies: AccountCookieInsert[] };

/** One roadmap item, without the ids and position the repo assigns. */
export type AccountRoadmapItemInsert = Omit<
  InferInsertModel<typeof accountRoadmapItems>,
  "id" | "roadmapId" | "position"
>;

/** A lineup row with its cookies, in formation order. */
export type AccountLineupWithCookies = AccountLineupRow & { cookies: AccountCookieRow[] };

/**
 * The reader's account snapshots (each with its lineups and their
 * cookies) and roadmaps (each with its items), keyed by the id their file
 * gives them. A snapshot or roadmap is written and deleted as a whole.
 */
export interface AccountRepo {
  /** Lists every snapshot, newest id first. */
  snapshots(): AccountSnapshotRow[];
  /**
   * Returns the snapshot with `id`, or `undefined` if there is none.
   *
   * @param id - the snapshot's id
   */
  snapshot(id: string): AccountSnapshotRow | undefined;
  /**
   * Returns a snapshot's lineups in its order, each with its cookies.
   *
   * @param snapshotId - the snapshot's id
   * @returns the lineups; `[]` for an unknown snapshot
   */
  lineups(snapshotId: string): AccountLineupWithCookies[];
  /** Lists every roadmap, newest id first. */
  roadmaps(): AccountRoadmapRow[];
  /**
   * Returns the roadmap with `id`, or `undefined` if there is none.
   *
   * @param id - the roadmap's id
   */
  roadmap(id: string): AccountRoadmapRow | undefined;
  /**
   * Returns a roadmap's items in its order.
   *
   * @param roadmapId - the roadmap's id
   * @returns the items; `[]` for an unknown roadmap
   */
  items(roadmapId: string): AccountRoadmapItemRow[];
  /**
   * Inserts a snapshot with its lineups and their cookies, each positioned
   * by its array index.
   *
   * @param row - the snapshot
   * @param lineups - its lineups, in order, each with its cookies in formation order
   * @throws if a snapshot with the same id exists
   */
  insertSnapshot(row: AccountSnapshotInsert, lineups: readonly AccountLineupInsert[]): void;
  /**
   * Inserts a roadmap with its items, each positioned by its array index.
   *
   * @param row - the roadmap
   * @param items - its items, in order
   * @throws if a roadmap with the same id exists
   */
  insertRoadmap(row: AccountRoadmapInsert, items: readonly AccountRoadmapItemInsert[]): void;
  /**
   * Deletes a snapshot; its lineups and their cookies cascade.
   *
   * @param id - the snapshot's id
   * @returns `true` if a row was deleted
   */
  removeSnapshot(id: string): boolean;
  /**
   * Deletes a roadmap; its items cascade.
   *
   * @param id - the roadmap's id
   * @returns `true` if a row was deleted
   */
  removeRoadmap(id: string): boolean;
  /**
   * Restarts the id counters of the lineups, cookies and roadmap items, so
   * the next insert gets one past the highest id left, as a fresh import
   * into a database holding the same rows would.
   */
  restartIds(): void;
}

/**
 * Builds an {@link AccountRepo}.
 *
 * @param db - database or transaction handle
 * @returns the repo
 */
export function createAccountRepo(db: Db): AccountRepo {
  return {
    /** @inheritdoc */
    snapshots: () => db.select().from(accountSnapshots).orderBy(desc(accountSnapshots.id)).all(),
    /** @inheritdoc */
    snapshot: (id) => db.select().from(accountSnapshots).where(eq(accountSnapshots.id, id)).get(),
    /** @inheritdoc */
    lineups: (snapshotId) => {
      const lineups = db
        .select()
        .from(accountLineups)
        .where(eq(accountLineups.snapshotId, snapshotId))
        .orderBy(asc(accountLineups.position))
        .all();
      if (lineups.length === 0) return [];
      const cookies = db
        .select()
        .from(accountCookies)
        .where(
          inArray(
            accountCookies.lineupId,
            lineups.map((lineup) => lineup.id),
          ),
        )
        .orderBy(asc(accountCookies.lineupId), asc(accountCookies.position))
        .all();
      return lineups.map((lineup) => ({
        ...lineup,
        cookies: cookies.filter((cookie) => cookie.lineupId === lineup.id),
      }));
    },
    /** @inheritdoc */
    roadmaps: () => db.select().from(accountRoadmaps).orderBy(desc(accountRoadmaps.id)).all(),
    /** @inheritdoc */
    roadmap: (id) => db.select().from(accountRoadmaps).where(eq(accountRoadmaps.id, id)).get(),
    /** @inheritdoc */
    items: (roadmapId) =>
      db
        .select()
        .from(accountRoadmapItems)
        .where(eq(accountRoadmapItems.roadmapId, roadmapId))
        .orderBy(asc(accountRoadmapItems.position))
        .all(),
    /** @inheritdoc */
    insertSnapshot: (row, lineups) => {
      const snapshot = db.insert(accountSnapshots).values(row).returning().get();
      for (const [position, { cookies, ...lineup }] of lineups.entries()) {
        const { id: lineupId } = db
          .insert(accountLineups)
          .values({ ...lineup, snapshotId: snapshot.id, position })
          .returning({ id: accountLineups.id })
          .get();
        if (cookies.length === 0) continue;
        db.insert(accountCookies)
          .values(cookies.map((cookie, index) => ({ ...cookie, lineupId, position: index })))
          .run();
      }
    },
    /** @inheritdoc */
    insertRoadmap: (row, items) => {
      const roadmap = db.insert(accountRoadmaps).values(row).returning().get();
      if (items.length === 0) return;
      db.insert(accountRoadmapItems)
        .values(items.map((item, position) => ({ ...item, roadmapId: roadmap.id, position })))
        .run();
    },
    /** @inheritdoc */
    removeSnapshot: (id) =>
      db
        .delete(accountSnapshots)
        .where(eq(accountSnapshots.id, id))
        .returning({ id: accountSnapshots.id })
        .all().length > 0,
    /** @inheritdoc */
    removeRoadmap: (id) =>
      db
        .delete(accountRoadmaps)
        .where(eq(accountRoadmaps.id, id))
        .returning({ id: accountRoadmaps.id })
        .all().length > 0,
    /** @inheritdoc */
    restartIds: () => {
      resetIds(db, accountLineups, accountCookies, accountRoadmapItems);
    },
  };
}
