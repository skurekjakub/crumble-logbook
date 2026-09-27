/**
 * View registry. Tab order is array order.
 *
 * A view module default-exports:
 *   { id: string, label: string, render(ctx): { markup: SafeHtml, mount?(root: Element): void } }
 * where ctx = { cat: Catalog, data: Record<string, any> }.
 * To add a tab: create a module with that shape and list it here.
 */
import overview from "./overview.js";
import decks from "./decks.js";
import runes from "./runes.js";
import gear from "./gear.js";
import scores from "./scores.js";
import mechanics from "./mechanics.js";
import timeline from "./timeline.js";
import sources from "./sources.js";
import glossary from "./glossary.js";

export const VIEWS = [overview, decks, runes, gear, scores, mechanics, timeline, sources, glossary];
