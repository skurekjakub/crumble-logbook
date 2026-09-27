import type { ContentView } from "./content";

/**
 * A buff value as returned to callers: its sources, and the cookie's
 * English gloss from the glossary (`null` if unresolved).
 */
export type BuffValueView = ContentView<"buffValues">;
