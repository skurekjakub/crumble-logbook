import type { ResearchRecordRow } from "@crumble/schema";
import { NotFoundError } from "../errors";
import type { Store } from "../repos";

/** Read access to the research records: one per investigated question. */
export interface RecordsService {
  /** Lists every research record, ordered by `slug`. */
  list(): ResearchRecordRow[];
  /**
   * Returns the record with `slug`.
   * @param slug - the record's slug
   * @throws {NotFoundError} if `slug` doesn't exist
   */
  get(slug: string): ResearchRecordRow;
}

/**
 * Builds a {@link RecordsService} over `store`.
 * @param store - the store to read through
 */
export function createRecordsService(store: Store): RecordsService {
  return {
    list: () => store.repos.records.list(),
    get: (slug) => {
      const row = store.repos.records.get(slug);
      if (!row) throw new NotFoundError("research record", slug);
      return row;
    },
  };
}
