/**
 * Text handling with Python's semantics, so the ports write what the
 * retired Python scrapers wrote: Python's whitespace set (which differs
 * from JavaScript's `\s` and `trim()`), `repr()` of the values the
 * YouTube digest prints, `json.dumps`, URL quoting, and newline
 * normalisation for text written to `evidence/`.
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
 * Formats a float as Python's `repr()` (and so `json.dumps`) does: the
 * shortest digits that round-trip, in positional notation with at least
 * one digit after the point, or in `e` notation with a two-digit exponent
 * when the exponent is below -4 or 16 and above.
 *
 * @param x - the float
 * @returns e.g. `1.0`, `0.0001`, `1e-05`, `1e+16`; `Infinity` or `-Infinity` when not finite
 */
function pyFloatRepr(x: number): string {
  if (!Number.isFinite(x)) return x > 0 ? "Infinity" : "-Infinity";
  if (x === 0) return Object.is(x, -0) ? "-0.0" : "0.0";
  const sign = x < 0 ? "-" : "";
  const [mantissa, exponent] = Math.abs(x).toExponential().split("e") as [string, string];
  const digits = mantissa.replace(".", "");
  const exp = Number(exponent);
  if (exp < -4 || exp >= 16) {
    const rest = digits.length > 1 ? `.${digits.slice(1)}` : "";
    const power = String(Math.abs(exp)).padStart(2, "0");
    return `${sign}${digits[0]!}${rest}e${exp < 0 ? "-" : "+"}${power}`;
  }
  if (exp < 0) return `${sign}0.${"0".repeat(-exp - 1)}${digits}`;
  const whole = digits.slice(0, exp + 1).padEnd(exp + 1, "0");
  return `${sign}${whole}.${digits.slice(exp + 1) || "0"}`;
}

/** JSON whitespace, from the current position. */
const JSON_SPACE = /[ \t\n\r]*/y;
/** A JSON string token's extent, escapes included; `JSON.parse` then checks its content. */
const JSON_STRING = /"(?:[^"\\]|\\.)*"/y;
/** A JSON literal or number token. */
const JSON_SCALAR = /true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;

/**
 * Re-serialises JSON text as Python's `json.dumps(json.loads(text))`
 * prints it with its defaults: `", "` and `": "` separators, keys in the
 * text's order (a repeated key keeps its first place and its last value),
 * integers exactly as written, floats as Python's `repr`, and every
 * character outside printable ASCII escaped. Works from the text, since
 * parsed JavaScript objects put integer-like keys first and lose `1.0`.
 *
 * @param text - JSON text
 * @returns the serialisation
 * @throws {SyntaxError} if the text isn't JSON
 */
export function pyJsonRedump(text: string): string {
  let at = 0;
  /**
   * Matches a sticky token pattern at the current position and moves past it.
   *
   * @param re - a sticky pattern
   * @returns the token, or `null` when it doesn't match here
   */
  const take = (re: RegExp): string | null => {
    re.lastIndex = at;
    const match = re.exec(text);
    if (!match) return null;
    at = re.lastIndex;
    return match[0];
  };
  /**
   * Fails at the current position.
   *
   * @throws {SyntaxError} always
   */
  const fail = (): never => {
    throw new SyntaxError(`invalid JSON at offset ${at}`);
  };
  /**
   * Consumes one character if it's the one expected.
   *
   * @param ch - the character
   * @returns `true` if it was there
   */
  const eat = (ch: string): boolean => {
    take(JSON_SPACE);
    if (text[at] !== ch) return false;
    at += 1;
    return true;
  };
  /**
   * Reads and re-serialises one JSON value at the current position.
   *
   * @returns its serialisation
   * @throws {SyntaxError} if the text there isn't a JSON value
   */
  const value = (): string => {
    if (eat("{")) {
      const members = new Map<string, string>();
      if (eat("}")) return "{}";
      do {
        take(JSON_SPACE);
        const key = take(JSON_STRING) ?? fail();
        if (!eat(":")) fail();
        members.set(JSON.parse(key) as string, value());
      } while (eat(","));
      if (!eat("}")) fail();
      return `{${[...members].map(([k, v]) => `${pyJsonString(k)}: ${v}`).join(", ")}}`;
    }
    if (eat("[")) {
      const items: string[] = [];
      if (eat("]")) return "[]";
      do items.push(value());
      while (eat(","));
      if (!eat("]")) fail();
      return `[${items.join(", ")}]`;
    }
    take(JSON_SPACE);
    const string = take(JSON_STRING);
    if (string !== null) return pyJsonString(JSON.parse(string) as string);
    const scalar = take(JSON_SCALAR) ?? fail();
    if (scalar === "true" || scalar === "false" || scalar === "null") return scalar;
    return /[.eE]/.test(scalar) ? pyFloatRepr(Number(scalar)) : BigInt(scalar).toString();
  };
  const out = value();
  take(JSON_SPACE);
  if (at !== text.length) fail();
  return out;
}

/**
 * Percent-encodes a string as Python's `urllib.parse.quote` (and
 * `requests.utils.quote`) does: UTF-8, keeping letters, digits, `_.-~` and `/`.
 *
 * @param text - the string
 * @returns it percent-encoded, with uppercase hex
 */
export function pyQuote(text: string): string {
  let out = "";
  for (const byte of new TextEncoder().encode(text)) {
    const ch = String.fromCharCode(byte);
    out += /[A-Za-z0-9_.\-~/]/.test(ch)
      ? ch
      : `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
  }
  return out;
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
