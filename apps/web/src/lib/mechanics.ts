/**
 * Pure helpers over mechanics rows.
 *
 * @module
 */

/**
 * Selects the mechanics filed under `topic`, in their stored order.
 *
 * @typeParam M - the mechanic row; `/api/mechanics` rows fit as they are
 * @param mechanics - the mechanics
 * @param topic - the topic to keep
 * @returns the matching mechanics
 */
export function byTopic<M extends { topic: string | null }>(
  mechanics: readonly M[],
  topic: string,
): M[] {
  return mechanics.filter((m) => m.topic === topic);
}
