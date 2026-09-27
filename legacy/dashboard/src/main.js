/**
 * Entry point: data → validation → catalog → chrome → router.
 * Layers depend downward only: app → views → ui/components → domain → data.
 */
import { loadDataset } from "./data/loader.js";
import { validate } from "./data/schema.js";
import { createCatalog } from "./domain/catalog.js";
import { renderChrome } from "./app/chrome.js";
import { createRouter } from "./app/router.js";
import { VIEWS } from "./views/index.js";
import { html } from "./ui/html.js";

const $ = s => document.querySelector(s);

try {
  const data = await loadDataset("data/");
  const problems = validate(data);
  if (problems.length) console.warn(`Dataset has ${problems.length} problem(s):\n` + problems.join("\n"));
  const cat = createCatalog(data);
  renderChrome({ lede: $("#lede"), stamp: $("#stamp"), foot: $("#foot") }, data);
  createRouter({ tabs: $("#tabs"), main: $("#main"), views: VIEWS, ctx: { cat, data } });
} catch (e) {
  console.error(e);
  $("#main").innerHTML = String(html`<div class="error">${e.message}</div>`);
}
