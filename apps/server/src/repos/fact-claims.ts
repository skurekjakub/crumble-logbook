import type { CitedEntity } from "@crumble/schema";
import { factClaims } from "@crumble/schema";
import { and, eq } from "drizzle-orm";
import type { Db } from "../db/client";

/** A game fact, by its citation entity and its id as citations store it. */
export interface FactRef {
  /** The fact's citation entity. */
  entity: CitedEntity;
  /** The fact's id, as a string. */
  entityId: string;
}

/**
 * Research records' claims to game facts: which record supplied a fact,
 * citing which sources.
 */
export interface FactClaimsRepo {
  /**
   * Records that `record` claims the fact, citing `sourceIds`; a source it
   * already cites for the fact is kept once.
   *
   * @param fact - the fact
   * @param record - the claiming record's slug
   * @param sourceIds - the sources the record cites for the fact
   * @throws if a `sourceIds` entry doesn't exist in `sources`
   */
  add(fact: FactRef, record: string, sourceIds: readonly string[]): void;
  /**
   * Returns the sources every claim to the fact cites.
   *
   * @param fact - the fact
   * @returns the source ids, each once, in the order they were claimed;
   *   `[]` when no record claims it
   */
  sourcesOf(fact: FactRef): string[];
  /**
   * Returns the facts `record` claims.
   *
   * @param record - the record's slug
   * @returns each claimed fact once, in claim order
   */
  claimedBy(record: string): FactRef[];
  /**
   * Deletes every claim to the fact, whichever record made it.
   *
   * @param fact - the fact
   */
  removeFor(fact: FactRef): void;
}

/**
 * Builds a {@link FactClaimsRepo}.
 *
 * @param db - database or transaction handle
 * @returns the repo
 */
export function createFactClaimsRepo(db: Db): FactClaimsRepo {
  /**
   * The condition selecting a fact's claims.
   *
   * @param fact - the fact
   * @returns the `WHERE` condition
   */
  const of = ({ entity, entityId }: FactRef) =>
    and(eq(factClaims.entity, entity), eq(factClaims.entityId, entityId));
  return {
    /** @inheritdoc */
    add: ({ entity, entityId }, record, sourceIds) => {
      const distinct = [...new Set(sourceIds)];
      if (distinct.length === 0) return;
      db.insert(factClaims)
        .values(distinct.map((sourceId) => ({ entity, entityId, recordSlug: record, sourceId })))
        .onConflictDoNothing()
        .run();
    },
    /** @inheritdoc */
    sourcesOf: (fact) => [
      ...new Set(
        db
          .select({ sourceId: factClaims.sourceId })
          .from(factClaims)
          .where(of(fact))
          .orderBy(factClaims.id)
          .all()
          .map((row) => row.sourceId),
      ),
    ],
    /** @inheritdoc */
    claimedBy: (record) => {
      const rows = db
        .select({ entity: factClaims.entity, entityId: factClaims.entityId })
        .from(factClaims)
        .where(eq(factClaims.recordSlug, record))
        .orderBy(factClaims.id)
        .all();
      const seen = new Map(rows.map((row) => [`${row.entity}|${row.entityId}`, row]));
      return [...seen.values()];
    },
    /** @inheritdoc */
    removeFor: (fact) => {
      db.delete(factClaims).where(of(fact)).run();
    },
  };
}
