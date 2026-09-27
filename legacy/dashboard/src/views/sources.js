import { html } from "../ui/html.js";
import { filterTable } from "../ui/components/table.js";
import { sourceLabel } from "../ui/components/chips.js";

export default {
  id: "sources",
  label: "Sources",
  render({ cat }) {
    const rows = cat.sources().map(([id, s]) => ({ id, ...s }));
    const sites = [...new Set(rows.map(r => r.id.split(":")[0]))];
    const t = filterTable({
      id: "src",
      headers: ["Source", "Title", "Date", "Signal"],
      items: rows,
      placeholder: "Search titles",
      text: r => `${r.id} ${r.title || ""} ${r.title_en || ""}`,
      select: { label: "All sites", options: sites.map(s => [s, sourceLabel(`${s}:`).trim() || s]), test: (r, v) => r.id.startsWith(`${v}:`) },
      row: r => [
        { v: r.url ? html`<a href="${r.url}" target="_blank" rel="noopener">${sourceLabel(r.id)}</a>` : sourceLabel(r.id), cls: "n" },
        html`${r.title || ""}${r.title_en ? html`<div class="muted">${r.title_en}</div>` : ""}`,
        { v: r.date || "", cls: "n" },
        { v: r.signal || "", cls: "n" },
      ],
    });
    return {
      markup: html`<div><h2>Sources</h2><p class="lede">Every post this logbook cites. Raw captures are in the research record's evidence folder.</p></div>${t.markup}`,
      mount: t.mount,
    };
  },
};
