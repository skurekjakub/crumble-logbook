import type { GlossaryInput, GlossaryKind, GlossaryRow } from "@crumble/schema";
import type { Store } from "../repos";
import type { NameRef } from "./names";
import { createNameResolver } from "./names";

/**
 * The Korean-to-English glossary: lookups and the upsert that keeps it
 * current.
 */
export interface GlossaryService {
  /**
   * Lists glossary entries ordered by `kr`.
   * @param kind - restrict the list to this kind, when given
   */
  list(kind?: GlossaryKind): GlossaryRow[];
  /**
   * Resolves `name` against the current glossary.
   * @param name - a name as it appeared in source data, in Korean or English
   * @returns a {@link NameRef}; `en` is `null` if `name` matches no entry
   */
  resolve(name: string): NameRef;
  /**
   * Inserts a glossary entry, or updates it in place if its `kr` already
   * exists.
   * @param input - the entry to write
   * @returns the written row
   */
  upsert(input: GlossaryInput): GlossaryRow;
}

/**
 * Builds a {@link GlossaryService} over `store`.
 * @param store - the store to persist through
 */
export function createGlossaryService(store: Store): GlossaryService {
  return {
    list: (kind) => store.repos.glossary.list(kind),
    resolve: (name) => createNameResolver(store.repos.glossary.list())(name),
    upsert: (input) => store.repos.glossary.upsert(input),
  };
}
