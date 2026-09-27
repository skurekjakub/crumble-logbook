import { html } from "../ui/html.js";

const STORE_KEY = "prl-tab";

/**
 * Tab router: renders the tab strip, swaps the active view into `main`,
 * and keeps the choice in the URL hash (bare token, e.g. #runes) and localStorage.
 * @param {object} opts
 * @param {Element} opts.tabs - container for the tab buttons
 * @param {Element} opts.main - container the active view renders into
 * @param {object[]} opts.views - view modules (see views/index.js)
 * @param {object} opts.ctx - context passed to every view's render
 * @returns {{open: (id: string) => void}}
 */
export function createRouter({ tabs, main, views, ctx }) {
  const byId = new Map(views.map(v => [v.id, v]));
  tabs.innerHTML = String(html`${views.map(v => html`<button role="tab" id="tab-${v.id}" data-tab="${v.id}" aria-selected="false">${v.label}</button>`)}`);

  const open = id => {
    const view = byId.get(id) || views[0];
    tabs.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === view.id)));
    let out;
    try {
      out = view.render(ctx);
    } catch (e) {
      console.error(`view "${view.id}" failed to render`, e);
      main.innerHTML = String(html`<div class="error">The ${view.label} tab hit an error: ${e.message}. The data for this tab is probably malformed; check the console.</div>`);
      return;
    }
    main.innerHTML = String(html`<section class="panel" role="tabpanel" aria-labelledby="tab-${view.id}">${out.markup}</section>`);
    out.mount?.(main);
    try { localStorage.setItem(STORE_KEY, view.id); } catch { /* storage may be blocked */ }
    if (location.hash.slice(1) !== view.id) history.replaceState(null, "", `#${view.id}`);
  };

  tabs.addEventListener("click", e => {
    const b = e.target.closest("button[data-tab]");
    if (b) open(b.dataset.tab);
  });
  window.addEventListener("hashchange", () => open(location.hash.slice(1)));

  let start = location.hash.slice(1);
  if (!start) { try { start = localStorage.getItem(STORE_KEY) || ""; } catch { /* storage may be blocked */ } }
  open(start);
  return { open };
}
