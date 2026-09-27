import { html } from "../ui/html.js";
import { sourceChips } from "../ui/components/chips.js";
import { list } from "../domain/catalog.js";

export default {
  id: "timeline",
  label: "Timeline",
  render({ cat, data }) {
    const events = [...list(data.timeline)].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return {
      markup: html`
        <div><h2>How the meta moved</h2><p class="lede">Patches, new cookies and the decks that followed, oldest first.</p></div>
        <ol class="tl">${events.map(t => html`<li><span class="d">${t.date}</span><span>${t.event}</span>${sourceChips(cat, t.sources)}</li>`)}</ol>`,
    };
  },
};
