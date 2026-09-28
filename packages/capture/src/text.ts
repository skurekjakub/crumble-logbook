/**
 * Text handling with Python's semantics, so the ports write what the
 * retired Python scrapers wrote: Python's whitespace set (which differs
 * from JavaScript's `\s` and `trim()`), `repr()` of the values the
 * YouTube digest prints, and newline normalisation for text written to
 * `evidence/`.
 *
 * @module
 */

/**
 * Python's whitespace characters (`str.isspace()`, and `\s` in a `str`
 * regex): JavaScript's `\s` without U+FEFF, plus U+001C–U+001F and U+0085.
 */
const PY_SPACE_CLASS =
  "\\t\\n\\v\\f\\r \\u001c-\\u001f\\u0085\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";

const LEADING = new RegExp(`^[${PY_SPACE_CLASS}]+`);
const TRAILING = new RegExp(`[${PY_SPACE_CLASS}]+$`);
const RUNS = new RegExp(`[${PY_SPACE_CLASS}]+`, "g");

/**
 * Strips leading and trailing whitespace, as Python's `str.strip()`.
 *
 * @param text - the text
 * @returns it without surrounding Python whitespace
 */
export function pyStrip(text: string): string {
  return text.replace(LEADING, "").replace(TRAILING, "");
}

/**
 * Collapses every whitespace run to one space, as `re.sub(r"\s+", " ", text)`.
 *
 * @param text - the text
 * @returns it with each run of Python whitespace replaced by a space
 */
export function pyCollapse(text: string): string {
  return text.replace(RUNS, " ");
}

/**
 * Formats a string as Python's `repr()` does: single quotes unless the
 * string holds a single quote and no double quote, with backslashes, the
 * chosen quote and control characters escaped.
 *
 * @param text - the string
 * @returns its Python repr, e.g. `'ko'`
 */
export function pyReprString(text: string): string {
  const quote = text.includes("'") && !text.includes('"') ? '"' : "'";
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (ch === "\\") out += "\\\\";
    else if (ch === quote) out += `\\${quote}`;
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch === "\t") out += "\\t";
    else if (code < 0x20 || code === 0x7f) out += `\\x${code.toString(16).padStart(2, "0")}`;
    else out += ch;
  }
  return quote + out + quote;
}

/**
 * Formats a value as Python's `str()` would print it inside an f-string:
 * `None` for null, a list and a tuple with their elements' reprs.
 *
 * @param value - a string, number, boolean, null, or an array (a list),
 *   or `{ tuple: [...] }` for a tuple
 * @returns the Python rendering
 */
export function pyRepr(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "string") return pyReprString(value);
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return `[${value.map(pyRepr).join(", ")}]`;
  if (typeof value === "object" && "tuple" in value && Array.isArray(value.tuple)) {
    const items = (value.tuple as unknown[]).map(pyRepr);
    return items.length === 1 ? `(${items[0]},)` : `(${items.join(", ")})`;
  }
  return JSON.stringify(value);
}

/**
 * Formats a value as an f-string interpolates it: a string as is, `None`
 * for null, anything else as {@link pyRepr}.
 *
 * @param value - the value
 * @returns its `str()`
 */
export function pyStr(value: unknown): string {
  return typeof value === "string" ? value : pyRepr(value);
}

/** Python's `json.dumps` escapes for the characters it names instead of `\uXXXX`. */
const JSON_ESCAPES: Record<string, string> = {
  '"': '\\"',
  "\\": "\\\\",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
  "\b": "\\b",
  "\f": "\\f",
};

/**
 * Encodes a string as Python's `json.dumps` does by default (`ensure_ascii`):
 * every character outside printable ASCII as `\uXXXX`, astral ones as a
 * surrogate pair.
 *
 * @param text - the string
 * @returns the quoted JSON string
 */
function pyJsonString(text: string): string {
  let out = '"';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const code = text.charCodeAt(i);
    const escape = JSON_ESCAPES[ch];
    if (escape !== undefined) out += escape;
    else if (code >= 0x20 && code <= 0x7e) out += ch;
    else out += `\\u${code.toString(16).padStart(4, "0")}`;
  }
  return `${out}"`;
}

/**
 * Serialises parsed JSON as Python's `json.dumps(value)` with its defaults:
 * `", "` and `": "` separators, keys in their order, non-ASCII escaped.
 *
 * @param value - parsed JSON
 * @returns the serialisation
 */
export function pyJsonDumps(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return pyJsonString(value);
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NaN";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `[${value.map(pyJsonDumps).join(", ")}]`;
  const entries = Object.entries(value as Record<string, unknown>);
  return `{${entries.map(([k, v]) => `${pyJsonString(k)}: ${pyJsonDumps(v)}`).join(", ")}}`;
}

/**
 * Reads a key of a parsed JSON object as Python's `dict.get(key, default)`:
 * the default only when the key is absent, a present `null` kept.
 *
 * @param value - a parsed JSON object, or anything else
 * @param key - the key
 * @param fallback - what an absent key (or a non-object) gives
 * @returns the key's value, or `fallback`
 */
export function pyGet(value: unknown, key: string, fallback: unknown = null): unknown {
  if (value === null || typeof value !== "object" || !(key in value)) return fallback;
  return (value as Record<string, unknown>)[key];
}

/**
 * Turns every CRLF into LF, the line ending `.gitattributes` gives text
 * under `research/`, so a capture's bytes on disk are the bytes a checkout
 * has and its ledger hash holds on every clone.
 *
 * @param text - the text as received
 * @returns it with LF line endings
 */
export function toLf(text: string): string {
  return text.replaceAll("\r\n", "\n");
}
