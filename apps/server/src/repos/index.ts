import type { Db } from "../db/client";
import type { CitationsRepo } from "./citations";
import { createCitationsRepo } from "./citations";
import type { SourcesRepo } from "./sources";
import { createSourcesRepo } from "./sources";

/** Every repo the server exposes, keyed by name. Later tasks add keys. */
export interface Repos {
  sources: SourcesRepo;
  citations: CitationsRepo;
}

/**
 * Builds every repo over a shared database or transaction handle.
 * @param db - database or transaction handle
 * @returns the repo set
 */
export function createRepos(db: Db): Repos {
  return {
    sources: createSourcesRepo(db),
    citations: createCitationsRepo(db),
  };
}

/** The server's single entry point to persistence: repos plus transactions. */
export interface Store {
  /** Repos bound to the store's main database connection. */
  repos: Repos;
  /**
   * Runs `work` inside a database transaction, with repos bound to the
   * transaction handle. Rolls back and rethrows if `work` throws.
   *
   * The underlying session is fully synchronous: it commits as soon as
   * `work` returns, before an async callback's returned promise could ever
   * settle, so a rejection after that point would never roll back. `work`
   * is therefore constrained to a synchronous callback at compile time — a
   * callback returning `Promise<X>` is a type error, not a caught bug.
   *
   * @param work - callback invoked with transaction-scoped repos; must be
   *   synchronous
   * @returns whatever `work` returns
   * @throws whatever `work` throws, after rolling back
   */
  transaction<T>(work: (repos: Repos) => T extends Promise<unknown> ? never : T): T;
}

/**
 * Builds a {@link Store} over `db`.
 * @param db - the database to persist to
 */
export function createStore(db: Db): Store {
  return {
    repos: createRepos(db),
    // The generic result of `work` doesn't distribute over drizzle's
    // `T extends Promise<any> ? Error : T` transaction return-type gate, so
    // the inner callback is cast to `never` (assignable to anything) and the
    // outer result is cast back to `T` to restore the real return type. The
    // public parameter type above (not this cast) is what actually rejects
    // an async `work`.
    transaction<T>(work: (repos: Repos) => T extends Promise<unknown> ? never : T): T {
      return db.transaction((tx) => work(createRepos(tx)) as never) as T;
    },
  };
}
