import { html } from "../html.js";

/**
 * Static table.
 * @param {string[]} headers
 * @param {any[][]} rows - cells as SafeHtml or text; a cell object {v, cls} sets a td class
 * @param {string} [empty="Nothing to show."] - message when rows is empty
 * @returns {import("../html.js").SafeHtml}
 */
export function table(headers, rows, empty = "Nothing to show.") {
  return html`<div class="tablewrap"><table>
    <thead><tr>${headers.map(h => html`<th>${h}</th>`)}</tr></thead>
    <tbody>${rows.length ? rows.map(r => html`<tr>${r.map(cell)}</tr>`) : html`<tr><td colspan="${headers.length}" class="muted">${empty}</td></tr>`}</tbody>
  </table></div>`;
}

function cell(c) {
  return c && typeof c === "object" && "v" in c ? html`<td class="${c.cls || ""}">${c.v}</td>` : html`<td>${c}</td>`;
}

/**
 * Table with a text filter and optional select filter, re-rendered in place.
 * Render the returned `markup`, then call `mount(root)` once it is in the DOM.
 * @param {object} opts
 * @param {string} opts.id - unique prefix for control ids
 * @param {string[]} opts.headers
 * @param {object[]} opts.items - records to filter
 * @param {(item: object) => any[]} opts.row - record → cells
 * @param {(item: object) => string} opts.text - record → searchable text
 * @param {string} [opts.placeholder]
 * @param {{label: string, options: [string, string][], test: (item: object, value: string) => boolean}} [opts.select]
 * @returns {{markup: import("../html.js").SafeHtml, mount: (root: Element) => void}}
 */
export function filterTable({ id, headers, items, row, text, placeholder = "Filter", select }) {
  const markup = html`<div class="tools">
      <input id="${id}-q" type="search" placeholder="${placeholder}" aria-label="${placeholder}">
      ${select ? html`<select id="${id}-s" aria-label="${select.label}"><option value="">${select.label}</option>${select.options.map(([v, l]) => html`<option value="${v}">${l}</option>`)}</select>` : ""}
    </div>
    <div id="${id}-t"></div>`;
  const mount = root => {
    const q = root.querySelector(`#${id}-q`), s = root.querySelector(`#${id}-s`), out = root.querySelector(`#${id}-t`);
    const draw = () => {
      const t = q.value.trim().toLowerCase(), v = s ? s.value : "";
      const kept = items.filter(it => (!t || text(it).toLowerCase().includes(t)) && (!v || select.test(it, v)));
      out.innerHTML = String(table(headers, kept.map(row), "Nothing matches."));
    };
    q.addEventListener("input", draw);
    s?.addEventListener("change", draw);
    draw();
  };
  return { markup, mount };
}
