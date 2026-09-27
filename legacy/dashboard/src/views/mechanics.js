import { html } from "../ui/html.js";
import { sourceChips, pill } from "../ui/components/chips.js";
import { list } from "../domain/catalog.js";

export default {
  id: "mechanics",
  label: "Mechanics",
  render({ cat, data }) {
    const items = list(data.mechanics);
    return {
      markup: html`
        <div><h2>Mechanics</h2><p class="lede">What the community measured or datamined (클뜯). Confidence reflects how well each point is sourced, not how plausible it sounds.</p></div>
        ${items.length
          ? html`<div class="grid g2">${items.map(x => html`<div class="card">
              <div class="card-head"><h3>${x.title}</h3>${pill(x.confidence)}</div>
              <div>${x.body}</div>
              ${sourceChips(cat, x.sources)}
            </div>`)}</div>`
          : html`<div class="empty">No mechanics recorded yet.</div>`}`,
    };
  },
};
