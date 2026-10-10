/**
 * The damage formula's shared rules: a community claim names where it is
 * recorded with a record and a mechanic title together, or names neither.
 * The importer and the API both apply it.
 *
 * @module
 */

/** Where a community claim is recorded: a research record and a mechanic title of it. */
export interface ClaimRef {
  refRecord?: string | null | undefined;
  refTitle?: string | null | undefined;
}

/**
 * Checks that a claim names its record and its mechanic title together.
 *
 * @param claim - the claim's reference fields
 * @returns what is wrong, or `undefined` when both or neither are named
 */
export function claimRefProblem(claim: ClaimRef): string | undefined {
  const record = claim.refRecord != null;
  const title = claim.refTitle != null;
  if (record === title) return undefined;
  return record
    ? "a claim that names refRecord names refTitle too"
    : "a claim that names refTitle names refRecord too";
}
