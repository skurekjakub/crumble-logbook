import { html } from "../html.js";

/**
 * Definition list of label → content rows; rows with empty content are dropped.
 * @param {[string, any][]} rows - [label, SafeHtml|string|falsy]
 * @returns {import("../html.js").SafeHtml}
 */
export function kv(rows) {
  const kept = rows.filter(([, v]) => v && String(v).trim() !== "");
  return html`<dl class="kv">${kept.map(([k, v]) => html`<dt>${k}</dt><dd>${v}</dd>`)}</dl>`;
}
