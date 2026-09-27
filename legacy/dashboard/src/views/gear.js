import { html, when } from "../ui/html.js";
import { sourceChips } from "../ui/components/chips.js";
import { gearBoard, generalGear } from "../ui/components/gearBoard.js";
import { list } from "../domain/catalog.js";

export default {
  id: "gear",
  label: "Gear",
  render({ cat, data }) {
    const gear = list(data.gear);
    const general = generalGear(gear);
    return {
      markup: html`
        <div><h2>Gear substats</h2><p class="lede">Laid out like the equipment screen. Since the 9/23 patch raid gear has its own preset, so it doesn't have to double as arena gear.</p></div>
        ${gearBoard(cat, gear, data.meta?.gear_slot_names)}
        ${when(general.length, () => html`<div class="card"><h3>General gear notes</h3>${general.map(g => html`<div><b>${g.substats}</b>${g.why ? html` · <span class="muted">${g.why}</span>` : ""} ${sourceChips(cat, g.sources)}</div>`)}</div>`)}`,
    };
  },
};
