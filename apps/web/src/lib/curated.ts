/**
 * The mark on an element that renders curated research text (a rune line,
 * a why, a note), as opposed to the app's own chrome.
 *
 * @module
 */

/**
 * Spread onto an element whose text comes from a record's curated files.
 * Curated text may still hold Korean forum shorthand until a refresh round
 * translates it, so the app shell's English-chrome test leaves these
 * elements out.
 */
export const CURATED = { "data-curated": "" } as const;
