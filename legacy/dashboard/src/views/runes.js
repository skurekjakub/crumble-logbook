import { html } from "../ui/html.js";
import { sourceChips, pill, cookieName } from "../ui/components/chips.js";
import { filterTable } from "../ui/components/table.js";
import { list } from "../domain/catalog.js";

export default {
  id: "runes",
  label: "Sugar runes",
  render({ cat, data }) {
    const runes = list(data.runes);
    const deckIds = [...new Set(runes.flatMap(r => list(r.decks)))];
    const t = filterTable({
      id: "runes",
      headers: ["Cookie", "Rune lines", "Target / why", "Decks", "Sources"],
      items: runes,
      placeholder: "Filter by cookie or stat (e.g. 시커, haste)",
      text: r => `${JSON.stringify(r)} ${cat.name(r.cookie).en}`,
      select: { label: "All decks", options: deckIds.map(id => [id, cat.deckName(id)]), test: (r, v) => list(r.decks).includes(v) },
      row: r => [
        html`${cookieName(cat, r.cookie)} ${r.disputed ? pill("disputed") : ""}`,
        html`<b>${r.lines}</b>`,
        html`${r.why || ""}${r.disputed ? html`<div class="muted">${r.disputed}</div>` : ""}`,
        list(r.decks).map(cat.deckName).join(", "),
        sourceChips(cat, r.sources),
      ],
    });
    return {
      markup: html`<div><h2>Sugar runes</h2><p class="lede">Raid rune lines per cookie. "All" means every line rolls the same stat. Disputed rows are where posters disagreed; both sides are kept.</p></div>${t.markup}`,
      mount: t.mount,
    };
  },
};
