/**
 * Shape rules for each collection. Validation reports problems; it never throws,
 * so one malformed record degrades a view instead of blanking the page.
 *
 * Each rule: `required` fields every record must have, `refs` fields whose values
 * must be ids in another collection (`"sources"` or `"decks"`).
 */
export const SCHEMA = {
  meta:      { kind: "object", required: ["updated"] },
  takeaways: { kind: "array",  required: ["text"], refs: { sources: "sources" } },
  decks:     { kind: "array",  required: ["id", "name_en"], refs: { sources: "sources" } },
  runes:     { kind: "array",  required: ["cookie", "lines"], refs: { sources: "sources", decks: "decks" } },
  gear:      { kind: "array",  required: ["slot", "substats"], refs: { sources: "sources" } },
  scores:    { kind: "array",  required: ["damage_g"], refs: { sources: "sources", deck: "decks" } },
  rng:       { kind: "array",  required: ["factor", "effect"], refs: { sources: "sources" } },
  mechanics: { kind: "array",  required: ["title", "body"], refs: { sources: "sources" } },
  timeline:  { kind: "array",  required: ["date", "event"], refs: { sources: "sources" } },
  sources:   { kind: "object" },
  glossary:  { kind: "array",  required: ["kr"] },
};

/**
 * Check a loaded dataset against SCHEMA.
 * @param {Record<string, any>} data - output of loadDataset
 * @returns {string[]} human-readable problems, empty when the dataset is clean
 */
export function validate(data) {
  const problems = [];
  const ids = {
    sources: new Set(Object.keys(data.sources || {})),
    decks: new Set((data.decks || []).map(d => d.id)),
  };
  for (const [name, rule] of Object.entries(SCHEMA)) {
    const value = data[name];
    if (value == null) continue;
    if (rule.kind === "array" && !Array.isArray(value)) { problems.push(`${name}: expected an array`); continue; }
    if (rule.kind === "object" && (typeof value !== "object" || Array.isArray(value))) { problems.push(`${name}: expected an object`); continue; }
    if (rule.kind !== "array") continue;
    value.forEach((rec, i) => {
      for (const f of rule.required || []) if (rec[f] == null || rec[f] === "") problems.push(`${name}[${i}]: missing "${f}"`);
      for (const [field, target] of Object.entries(rule.refs || {})) {
        for (const ref of [].concat(rec[field] ?? [])) {
          if (!ids[target].has(ref)) problems.push(`${name}[${i}].${field}: unknown ${target} id "${ref}"`);
        }
      }
    });
  }
  return problems;
}
