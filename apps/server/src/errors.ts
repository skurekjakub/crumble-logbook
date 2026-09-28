/** Thrown when a lookup by id finds no matching row. */
export class NotFoundError extends Error {
  /**
   * Builds the error, with message `<entity> not found: <id>`.
   *
   * @param entity - the kind of thing that was looked up, e.g. `"deck"`
   * @param id - the id that had no match
   */
  constructor(entity: string, id: string | number) {
    super(`${entity} not found: ${id}`);
    this.name = "NotFoundError";
  }
}

/** Thrown when an input references source or deck ids that don't exist. */
export class UnknownRefsError extends Error {
  /** Which kind of id was referenced, `"sources"` or `"decks"`. */
  readonly kind: "sources" | "decks";
  /** The referenced ids that don't exist. */
  readonly ids: string[];

  /**
   * Builds the error, with message `unknown <kind>: <ids>`.
   *
   * @param kind - which kind of id was referenced, `"sources"` or `"decks"`
   * @param ids - the referenced ids that don't exist
   */
  constructor(kind: "sources" | "decks", ids: string[]) {
    super(`unknown ${kind}: ${ids.join(", ")}`);
    this.name = "UnknownRefsError";
    this.kind = kind;
    this.ids = ids;
  }
}

/** Thrown when an operation conflicts with existing state. */
export class ConflictError extends Error {
  /**
   * Builds the error.
   *
   * @param message - description of the conflict
   */
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/** Thrown when importing external data fails for one row of a file. */
export class ImportError extends Error {
  /**
   * Builds the error, with message `<file> [<row>]: <message>` (no `[<row>]` when `row` is `null`).
   *
   * @param file - path to the file being imported
   * @param row - the row identifier the failure occurred at, or `null` if
   *   the failure isn't tied to a specific row
   * @param message - description of the failure
   */
  constructor(file: string, row: string | number | null, message: string) {
    super(`${file}${row == null ? "" : ` [${row}]`}: ${message}`);
    this.name = "ImportError";
  }
}
