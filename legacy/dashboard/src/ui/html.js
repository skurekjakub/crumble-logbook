/**
 * Minimal HTML templating. `html` escapes every interpolated value unless it is
 * already a SafeHtml (another `html` result or `raw(...)`); arrays are joined.
 * Components return SafeHtml so they compose without double-escaping.
 */

export class SafeHtml {
  /** @param {string} s - markup trusted to be safe */
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/**
 * Escape a value for HTML text or attribute context.
 * @param {any} v
 * @returns {string}
 */
export const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ESC[c]);

/**
 * Mark a string as trusted markup. Use only for strings built by this codebase.
 * @param {string} s
 * @returns {SafeHtml}
 */
export const raw = s => new SafeHtml(String(s));

/** Render one interpolated value: SafeHtml passes through, arrays join, null/false vanish. */
function part(v) {
  if (v instanceof SafeHtml) return v.s;
  if (Array.isArray(v)) return v.map(part).join("");
  if (v == null || v === false) return "";
  return esc(v);
}

/**
 * Tagged template that escapes interpolations.
 * @example html`<b>${userText}</b>`
 * @returns {SafeHtml}
 */
export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((v, i) => { out += part(v) + strings[i + 1]; });
  return new SafeHtml(out);
}

/**
 * Conditionally render: `when(cond, () => html`...`)`.
 * @param {any} cond
 * @param {() => SafeHtml} fn - called only when cond is truthy
 * @returns {SafeHtml|string}
 */
export const when = (cond, fn) => (cond ? fn() : "");
