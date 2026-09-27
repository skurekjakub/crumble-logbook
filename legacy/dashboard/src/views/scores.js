import { html, when } from "../ui/html.js";
import { sourceChips, pill } from "../ui/components/chips.js";
import { table } from "../ui/components/table.js";
import { scatter } from "../ui/components/scatter.js";
import { list } from "../domain/catalog.js";
import { byDamage, formatG, plottable, ratio } from "../domain/scores.js";

export default {
  id: "scores",
  label: "Scores & RNG",
  render({ cat, data }) {
    const scores = list(data.scores);
    const pts = plottable(scores);
    const chart = scatter(pts, {
      color: s => cat.deckColor(s.deck),
      label: s => `${cat.deckName(s.deck)}${s.verified ? " · screenshot" : " · claimed"}${s.note ? ` · ${s.note}` : ""}`,
    });
    const used = [...new Set(pts.map(p => p.deck))];
    const rng = list(data.rng);
    return {
      markup: html`
        <div><h2>Scores and RNG</h2><p class="lede">Each dot is one posted score: team power across, damage up, both on log scales. Dashed lines mark 배 multiples (damage ÷ power), the unit the Korean community compares runs by. Solid dots have a screenshot behind them; faded dots are claims in text.</p></div>
        <div class="card">${chart.markup}
          <div class="legend-row">${used.map(d => html`<span><i class="sw" style="background:${cat.deckColor(d)};border-radius:50%"></i>${cat.deckName(d)}</span>`)}</div>
        </div>
        ${when(rng.length, () => html`<div class="grid g3">${rng.map(r => html`<div class="card"><h3>${r.factor}</h3><div>${r.effect}</div>${when(r.mitigation, () => html`<div class="flag">${r.mitigation}</div>`)}${sourceChips(cat, r.sources)}</div>`)}</div>`)}
        ${table(["Damage", "Power", "배", "Deck", "Evidence", "Notes", "Date", "Source"], byDamage(scores).map(s => [
          { v: formatG(s.damage_g), cls: "n" },
          { v: formatG(s.power_g), cls: "n" },
          { v: ratio(s) ?? "–", cls: "n" },
          cat.deckName(s.deck),
          s.verified ? pill("verified", "screenshot") : pill("claimed"),
          s.note || "",
          { v: s.date || "", cls: "n" },
          sourceChips(cat, s.sources),
        ]))}`,
      mount: chart.mount,
    };
  },
};
