import { html } from "../html.js";
import { sourceChips } from "./chips.js";

/** Slot ids in the order the in-game equipment screen shows them (2×2). */
export const SLOTS = ["top-left", "top-right", "bottom-left", "bottom-right"];

/**
 * 2×2 gear board with each slot's substat recommendations.
 * @param {import("../../domain/catalog.js").Catalog} cat
 * @param {object[]} gear - records {slot, substats, why?, context?, sources?}
 * @param {Record<string, string>} [slotNames] - display names per slot id
 * @returns {import("../html.js").SafeHtml}
 */
export function gearBoard(cat, gear, slotNames = {}) {
  const entry = g => html`<div>
    <div class="stat">${g.substats}</div>
    ${g.why ? html`<div class="muted">${g.why}</div>` : ""}
    <div class="chips">${g.context ? html`<span class="chip">${g.context}</span>` : ""}${sourceChips(cat, g.sources)}</div>
  </div>`;
  return html`<div class="gearboard">${SLOTS.map(slot => {
    const rows = gear.filter(g => g.slot === slot);
    return html`<div class="gslot"><div class="label">${slotNames[slot] || slot}</div>${rows.length ? rows.map(entry) : html`<div class="muted">No data yet.</div>`}</div>`;
  })}</div>`;
}

/**
 * Gear records that don't belong to one of the four slots (general notes).
 * @param {object[]} gear
 * @returns {object[]}
 */
export const generalGear = gear => gear.filter(g => !SLOTS.includes(g.slot));
