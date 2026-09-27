import type { ContentView } from "./content";

/**
 * A fight event with the source ids that back it. `GET /api/fight-events`
 * lists them in elapsed-time order, events with no time last.
 */
export type FightEventView = ContentView<"fightEvents">;
