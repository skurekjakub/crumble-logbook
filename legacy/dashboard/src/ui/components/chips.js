import { html, when } from "../html.js";
import { list } from "../../domain/catalog.js";

const PREFIX = { "nv:": "Naver ", "dc:": "DC ", "web:": "" };

/**
 * Short label for a source id: "dc:76135" → "DC 76135".
 * @param {string} id
 * @returns {string}
 */
export function sourceLabel(id) {
  const p = Object.keys(PREFIX).find(k => id.startsWith(k));
  return p ? PREFIX[p] + id.slice(p.length) : id;
}

/**
 * Source ids as link chips; ids without a URL render as plain chips.
 * @param {import("../../domain/catalog.js").Catalog} cat
 * @param {string|string[]} ids
 * @returns {import("../html.js").SafeHtml}
 */
export function sourceChips(cat, ids) {
  const items = list(ids);
  return when(items.length, () => html`<span class="chips">${items.map(id => {
    const s = cat.source(id);
    return s?.url
      ? html`<a class="chip" href="${s.url}" target="_blank" rel="noopener" title="${s.title || ""}">${sourceLabel(id)}</a>`
      : html`<span class="chip">${sourceLabel(id)}</span>`;
  })}</span>`);
}

/**
 * Status pill. `kind` is also the CSS modifier (meta, alt, legacy, niche, high, medium, low, disputed, verified, claimed).
 * @param {string} kind
 * @param {string} [text=kind]
 * @returns {import("../html.js").SafeHtml}
 */
export const pill = (kind, text = kind) => when(kind, () => html`<span class="pill ${kind}">${text}</span>`);

/**
 * A cookie/pet name shown as "English 한국어", or just the source text when unresolved.
 * @param {import("../../domain/catalog.js").Catalog} cat
 * @param {string} s
 * @returns {import("../html.js").SafeHtml}
 */
export function cookieName(cat, s) {
  const n = cat.name(s);
  return n.en ? html`${n.en} <span class="kr">${n.kr}</span>` : html`${s}`;
}
