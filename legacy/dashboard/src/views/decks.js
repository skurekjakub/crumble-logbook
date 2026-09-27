import { html, when } from "../ui/html.js";
import { sourceChips, pill, cookieName } from "../ui/components/chips.js";
import { lineup, lineupLegend, atkOrder } from "../ui/components/lineup.js";
import { kv } from "../ui/components/kv.js";
import { table } from "../ui/components/table.js";
import { list } from "../domain/catalog.js";

/**
 * Per-cookie level requirements with the reason for each (cookies[].level, cookies[].why).
 * @returns {import("../ui/html.js").SafeHtml|string} empty when no cookie carries a `why`
 */
function levelTable(cat, cookies) {
  const rows = list(cookies);
  if (!rows.some(c => c.why)) return "";
  return html`<details class="levels" open><summary class="label">Levels and why</summary>
    ${table(["Cookie", "Level", "Why"], rows.map(c => [
      cookieName(cat, c.kr),
      { v: c.level_rule || (c.level != null ? `Lv.${c.level}` : "–"), cls: "n" },
      c.why || "",
    ]))}
  </details>`;
}

/** One deck as a card: lineup grid, per-cookie levels, ATK order, pets, swaps, RNG notes and unorthodox choices. */
function deckCard(cat, d) {
  const bullets = xs => when(list(xs).length, () => html`<ul class="clean">${list(xs).map(x => html`<li>${x}</li>`)}</ul>`);
  return html`<article class="card" id="deck-${d.id}">
    <div class="card-head">
      <div><h3>${d.name_en} <span class="kr">${d.name_kr || ""}</span></h3><div class="muted">${d.summary || ""}</div></div>
      <div class="chips">${pill(d.status)}${when(d.ceiling, () => html`<span class="chip">ceiling ${d.ceiling}</span>`)}</div>
    </div>
    ${lineup(cat, d.cookies)}
    ${levelTable(cat, d.cookies)}
    ${kv([
      ["ATK order", when(list(d.atk_order).length, () => html`${atkOrder(cat, d.atk_order)}${when(d.atk_order_note, () => html`<div class="muted">${d.atk_order_note}</div>`)}`)],
      ["Pets", when(list(d.pets).length, () => html`${list(d.pets).map((p, i) => html`${i ? " · " : ""}${cookieName(cat, p)}`)}`)],
      ["Perks", d.perks],
      ["Formation", d.formation],
      ["Swaps", bullets(d.substitutions)],
      ["RNG", d.rng],
    ])}
    ${list(d.unorthodox).map(u => html`<div class="flag">${u}</div>`)}
    ${sourceChips(cat, d.sources)}
  </article>`;
}

export default {
  id: "decks",
  label: "Decks",
  render({ cat }) {
    const decks = cat.decks();
    return {
      markup: decks.length
        ? html`<div><h2>Decks</h2><p class="lede">Lineups as the guides post them. Striped slots are deliberate Lv.1 fillers: they're there for a synergy or passive and kept low so Pomegranate's buff never lands on them.</p></div>
            ${lineupLegend()}
            ${decks.map(d => deckCard(cat, d))}`
        : html`<div class="empty">No decks recorded yet.</div>`,
    };
  },
};
