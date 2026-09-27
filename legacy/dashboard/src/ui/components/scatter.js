import { html, esc, raw } from "../html.js";
import { formatG, ratio } from "../../domain/scores.js";

const W = 760, H = 380, M = { l: 58, r: 64, t: 16, b: 42 };
const ISO_RATIOS = [50, 100, 300, 1000, 2000];
const lg = Math.log10;

/**
 * Log–log scatter of damage against team power with dashed 배 reference lines.
 * Render the returned `markup`, then call `mount(root)` to wire the hover tooltip.
 * @param {object[]} points - scores with damage_g > 0 and power_g > 0
 * @param {object} opts
 * @param {(s: object) => string} opts.color - point → CSS color
 * @param {(s: object) => string} opts.label - point → tooltip line under the numbers
 * @returns {{markup: import("../html.js").SafeHtml, mount: (root: Element) => void}}
 */
export function scatter(points, { color, label }) {
  if (!points.length) return { markup: html`<div class="empty">No scores with both damage and power yet.</div>`, mount() {} };

  const xs = points.map(p => lg(p.power_g)), ys = points.map(p => lg(p.damage_g));
  const x0 = Math.floor(Math.min(...xs) * 2) / 2 - 0.25, x1 = Math.ceil(Math.max(...xs) * 2) / 2 + 0.25;
  const y0 = Math.floor(Math.min(...ys)) - 0.1, y1 = Math.ceil(Math.max(...ys) + 0.05);
  const X = v => M.l + (lg(v) - x0) / (x1 - x0) * (W - M.l - M.r);
  const Y = v => H - M.b - (lg(v) - y0) / (y1 - y0) * (H - M.t - M.b);

  const xTicks = [], yTicks = [];
  for (let e = Math.ceil(x0 * 2) / 2; e <= x1; e += 0.5) xTicks.push(10 ** e);
  for (let e = Math.ceil(y0); e <= y1; e++) yTicks.push(10 ** e);

  // A ratio line y = r·x is straight in log space; clip it to the plot box.
  const iso = ISO_RATIOS.map(r => {
    let a = x0, b = x1;
    if (lg(r) + a < y0) a = y0 - lg(r);
    if (lg(r) + b > y1) b = y1 - lg(r);
    return a < b ? { r, pa: 10 ** a, pb: 10 ** b } : null;
  }).filter(Boolean);

  const midY = (M.t + H - M.b) / 2;
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Posted raid scores: damage against team power">
    <g class="grid">${yTicks.map(v => `<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v)}" y2="${Y(v)}"/>`).join("")}</g>
    <g>${yTicks.map(v => `<text x="${M.l - 8}" y="${Y(v) + 4}" text-anchor="end">${formatG(v)}</text>`).join("")}
       ${xTicks.map(v => `<text x="${X(v)}" y="${H - M.b + 18}" text-anchor="middle">${formatG(v)}</text>`).join("")}
       <text x="${(M.l + W - M.r) / 2}" y="${H - 6}" text-anchor="middle">team power</text>
       <text x="14" y="${midY}" text-anchor="middle" transform="rotate(-90 14 ${midY})">damage</text></g>
    <g class="iso">${iso.map(({ r, pa, pb }) => `<line x1="${X(pa)}" y1="${Y(r * pa)}" x2="${X(pb)}" y2="${Y(r * pb)}"/><text x="${X(pb) + 4}" y="${Y(r * pb) + 4}">${r}배</text>`).join("")}</g>
    ${points.map(p => `<circle class="dot ${p.verified ? "" : "claimed"}" cx="${X(p.power_g)}" cy="${Y(p.damage_g)}" r="5.5" style="fill:${esc(color(p))}"/>`).join("")}
    ${points.map((p, i) => `<circle class="hit" data-i="${i}" cx="${X(p.power_g)}" cy="${Y(p.damage_g)}" r="13" tabindex="0" aria-label="${esc(`${formatG(p.damage_g)} at ${formatG(p.power_g)}`)}"/>`).join("")}
  </svg>`;

  const markup = html`<div class="chart">${raw(svg)}<div class="tip" hidden></div></div>`;

  const mount = root => {
    const host = root.querySelector(".chart"), tip = host.querySelector(".tip"), el = host.querySelector("svg");
    const show = hit => {
      const p = points[+hit.dataset.i], k = el.getBoundingClientRect().width / W;
      tip.innerHTML = `<b>${esc(formatG(p.damage_g))}</b> at ${esc(formatG(p.power_g))} power · ${ratio(p)}배<br>${esc(label(p))}`;
      tip.style.left = `${+hit.getAttribute("cx") * k}px`;
      tip.style.top = `${+hit.getAttribute("cy") * k}px`;
      tip.hidden = false;
    };
    const hide = () => { tip.hidden = true; };
    host.querySelectorAll("circle.hit").forEach(h => {
      h.addEventListener("mouseenter", () => show(h));
      h.addEventListener("focus", () => show(h));
      h.addEventListener("mouseleave", hide);
      h.addEventListener("blur", hide);
    });
  };
  return { markup, mount };
}
