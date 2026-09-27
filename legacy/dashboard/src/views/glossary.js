import { html } from "../ui/html.js";
import { filterTable } from "../ui/components/table.js";
import { list } from "../domain/catalog.js";

export default {
  id: "glossary",
  label: "Glossary",
  render({ data }) {
    const items = list(data.glossary);
    const kinds = [...new Set(items.map(g => g.kind).filter(Boolean))];
    const t = filterTable({
      id: "gl",
      headers: ["Korean", "Shorthand", "English", "Kind"],
      items,
      placeholder: "Search Korean or English",
      text: g => JSON.stringify(g),
      select: { label: "All kinds", options: kinds.map(k => [k, k]), test: (g, v) => g.kind === v },
      row: g => [g.kr, list(g.kr_short).join(", "), g.en || "?", { v: g.kind || "", cls: "n" }],
    });
    return {
      markup: html`<div><h2>Glossary</h2><p class="lede">Korean names and forum shorthand mapped to the English client.</p></div>${t.markup}`,
      mount: t.mount,
    };
  },
};
