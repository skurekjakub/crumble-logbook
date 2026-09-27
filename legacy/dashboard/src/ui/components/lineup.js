import { html, when } from "../html.js";
import { list } from "../../domain/catalog.js";

/**
 * Classify a cookie slot by level: "max" for Lv.100, "filler" for deliberate Lv.1.
 * @param {string|number} level
 * @returns {""|"max"|"filler"}
 */
export function slotKind(level) {
  const lv = String(level ?? "");
  return lv === "1" ? "filler" : lv === "100" ? "max" : "";
}

/**
 * Team grid laid out like the in-game formation screen (6 per row).
 * @param {import("../../domain/catalog.js").Catalog} cat
 * @param {{kr: string, level?: string|number, stars?: string|number, note?: string}[]} cookies
 * @returns {import("../html.js").SafeHtml}
 */
export function lineup(cat, cookies) {
  return when(list(cookies).length, () => html`<div class="lineup">${list(cookies).map(c => {
    const n = cat.name(c.kr);
    const lv = c.level != null && c.level !== "" ? `Lv.${c.level}` : "";
    const stars = c.stars ? ` · ${c.stars}★` : "";
    return html`<div class="slot ${slotKind(c.level)}" title="${c.note || ""}">
      <span class="lv">${lv}${stars}</span>
      <span class="nm">${n.en || c.kr}</span>
      <span class="sub">${n.en ? n.kr : ""}${c.note ? ` · ${c.note}` : ""}</span>
    </div>`;
  })}</div>`);
}

/** Legend explaining the slot styles used by `lineup`. */
export const lineupLegend = () => html`<div class="legend-row">
  <span><i class="sw" style="background:var(--accent-soft);border:1px solid var(--accent)"></i>Lv.100 carry or buffer</span>
  <span><i class="sw" style="background:repeating-linear-gradient(135deg,var(--surface-2) 0 3px,var(--surface) 3px 6px);border:1px dashed var(--ink-3)"></i>Lv.1 filler</span>
</div>`;

/**
 * ATK-order chain (the order that steers Pomegranate's buff).
 * @param {import("../../domain/catalog.js").Catalog} cat
 * @param {string[]} order - Korean names, highest ATK first
 * @returns {import("../html.js").SafeHtml}
 */
export function atkOrder(cat, order) {
  return html`<div class="order">${list(order).map((c, i) => html`${when(i, () => html`<span class="arr">›</span>`)}<span class="step">${cat.name(c).en || c}</span>`)}</div>`;
}
