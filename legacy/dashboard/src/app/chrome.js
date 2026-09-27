import { html } from "../ui/html.js";
import { list } from "../domain/catalog.js";

/**
 * Fill the page header (lede, stat stamp) and footer from dataset metadata.
 * @param {{lede: Element, stamp: Element, foot: Element}} el
 * @param {Record<string, any>} data
 */
export function renderChrome(el, data) {
  const meta = data.meta || {};
  el.lede.textContent = meta.lede || "";
  const stats = [
    ["Updated", meta.updated],
    ["Season", meta.season],
    ["Sources", Object.keys(data.sources || {}).length],
    ["Decks", list(data.decks).length],
  ].filter(([, v]) => v != null && v !== "");
  el.stamp.innerHTML = String(html`${stats.map(([k, v]) => html`<div><span class="label">${k}</span><b>${v}</b></div>`)}`);
  el.foot.innerHTML = String(html`${meta.footer || ""}${meta.record ? html` Research record: <span class="mono">${meta.record}</span>.` : ""}`);
}
