import type { BuffStarRow, BuffValueLike } from "../../lib/buffs";
import {
  buffStars,
  effectLabel,
  formatPct,
  pivotBuffs,
  starCells,
  starLabel,
} from "../../lib/buffs";
import type { SourceIndex } from "../../lib/sources";
import { CookieName } from "../CookieName";
import type { Column } from "../DataTable";
import { DataTable } from "../DataTable";
import { EmptyState } from "../EmptyState";
import { SourceChips } from "../SourceChips";
import type { MechanicLike } from "./notes";
import { MechanicNote } from "./notes";

/** Props for {@link BuffTable}. */
export interface BuffTableProps {
  /** Every buff value, one row per skill grade. */
  rows: readonly BuffValueLike[];
  /** How buffs scale with the caster's skill amp; shown when a row scales with it. */
  buffFormula: readonly MechanicLike[];
  /** How application chances scale; shown when a row is a chance. */
  debuffFormula: readonly MechanicLike[];
  /** Id → URL/title for the source chips. */
  sources: SourceIndex;
}

/**
 * Joins names for prose: "A", "A and B", "A, B and C".
 *
 * @param names - the names, in order
 * @returns the joined text; empty for no names
 */
function joinNames(names: readonly string[]): string {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/**
 * The buffers' values as a cookie × star table, with the cited formulas
 * for how buffs and application chances scale. Self-only buffs are marked
 * and listed last; application chances are marked as such; a value carried
 * over from the column to its left is greyed.
 *
 * @param props - the buff values, the buff and debuff formula mechanics, and the source index
 * @returns the formulas and the table, or an empty state when there are no values
 */
export function BuffTable({ rows, buffFormula, debuffFormula, sources }: BuffTableProps) {
  if (!rows.length) return <EmptyState>No buff values recorded yet.</EmptyState>;
  const pivot = pivotBuffs(rows);
  const stars = buffStars(rows);
  const cells = new Map(pivot.map((r) => [r.key, starCells(r, stars)]));
  /**
   * Names a row's cookie.
   *
   * @param r - the row
   * @returns the English name, or the Korean when unknown
   */
  const name = (r: BuffStarRow) => r.en ?? r.cookieKr;
  const ampScaled = pivot.some((r) => r.scalesWithCasterAmp);
  const chances = [...new Set(pivot.filter((r) => r.chance).map(name))];

  const columns: Column<BuffStarRow>[] = [
    {
      header: "Cookie",
      cell: (r) => <CookieName kr={r.cookieKr} en={r.en} />,
    },
    {
      header: "Effect",
      cell: (r) => (
        <>
          {effectLabel(r.effectType, r.base)}
          {r.selfOnly ? <span className="boss-mark">self only</span> : null}
          {r.chance ? <span className="boss-mark">chance</span> : null}
        </>
      ),
    },
    ...stars.map((s, i): Column<BuffStarRow> => ({
      header: starLabel(s, stars),
      cell: (r) => {
        const c = cells.get(r.key)![i]!;
        return c.carried ? (
          <span className="carried" title="Unchanged from the column to its left">
            {formatPct(c.value)}
          </span>
        ) : (
          formatPct(c.value)
        );
      },
      className: "n",
    })),
    {
      header: "Stacks",
      cell: (r) => (r.maxStack != null && r.maxStack > 1 ? `×${r.maxStack}` : ""),
      className: "n",
    },
    {
      header: "Sources",
      cell: (r) => <SourceChips ids={r.sources} sources={sources} />,
    },
  ];

  return (
    <>
      {ampScaled
        ? buffFormula.map((m) => <MechanicNote key={m.id} m={m} sources={sources} />)
        : null}
      {chances.length ? (
        <>
          <p className="muted">
            {chances.length === 1
              ? `${chances[0]}'s row is an application chance, not a buff size.`
              : `${joinNames(chances.map((c) => `${c}'s`))} rows are application chances, not buff sizes.`}
          </p>
          {debuffFormula.map((m) => (
            <MechanicNote key={m.id} m={m} sources={sources} />
          ))}
        </>
      ) : null}
      <p className="muted">
        Each column holds the value from that star count up to the next column. A greyed value is
        unchanged from the column to its left; a dash means the effect has no value yet at that
        star. Rows marked "self only" buff the caster alone.
      </p>
      <DataTable columns={columns} rows={pivot} rowKey={(r) => r.key} />
    </>
  );
}
