import { html, when } from "../ui/html.js";
import { sourceChips } from "../ui/components/chips.js";
import { list } from "../domain/catalog.js";

export default {
  id: "overview",
  label: "Overview",
  /** Takeaways plus the reader's own lineup compared with the meta. */
  render({ cat, data }) {
    const takeaways = list(data.takeaways);
    const you = data.meta?.you;
    return {
      markup: html`
        ${when(data.meta?.caveat, () => html`<div class="note">${data.meta.caveat}</div>`)}
        <div><h2>What the top players do</h2><p class="lede">The load-bearing findings, each with the posts it stands on.</p></div>
        ${takeaways.length
          ? html`<ol class="take">${takeaways.map(t => html`<li><div>
              <div>${t.text}</div>
              ${when(t.detail, () => html`<div class="muted">${t.detail}</div>`)}
              ${sourceChips(cat, t.sources)}
            </div></li>`)}</ol>`
          : html`<div class="empty">No takeaways yet.</div>`}
        ${when(you, () => html`<div class="card">
          <h3>Your lineup against the meta</h3>
          <div>${you.summary}</div>
          ${when(list(you.changes).length, () => html`<ul class="clean">${list(you.changes).map(c => html`<li>${c}</li>`)}</ul>`)}
          ${sourceChips(cat, you.sources)}
        </div>`)}`,
    };
  },
};
