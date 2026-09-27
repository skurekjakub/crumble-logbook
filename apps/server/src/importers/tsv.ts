/**
 * Parses tab-separated text whose first line is the header into one record
 * per data line, keyed by header cell. Cells are kept as written, including
 * empty strings. `\r\n` line endings are tolerated and trailing blank lines
 * are ignored.
 *
 * @param text - the whole file's contents
 * @returns the data rows, in file order; `[]` for a header-only or empty text
 * @throws `Error("line N: expected H cells, got C")` for a line (1-based,
 *   counting the header) whose cell count differs from the header's
 */
export function parseTsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/);
  while (lines.length > 0 && lines[lines.length - 1]!.trim() === "") lines.pop();
  if (lines.length === 0) return [];

  const header = lines[0]!.split("\t");
  return lines.slice(1).map((line, index) => {
    const cells = line.split("\t");
    if (cells.length !== header.length) {
      throw new Error(`line ${index + 2}: expected ${header.length} cells, got ${cells.length}`);
    }
    return Object.fromEntries(header.map((name, i) => [name, cells[i]!]));
  });
}
