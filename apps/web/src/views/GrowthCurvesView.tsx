import { Link } from "@tanstack/react-router";
import { useSourceIndex } from "../api/hooks";
import type { GrowthCurve } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { TableTools } from "../components/DataTable";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";
import { optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import type { TeamPowerData } from "./TeamPowerData";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import { PowerSourceLink, useDropUnknown } from "./TeamPowerParts";

/** The curves page's search params: the power source shown, by slug. */
export interface CurvesSearch {
  source?: string;
}

/**
 * Reads the curves page's search params.
 *
 * @param search - the decoded query values
 * @returns the power source's slug, when there is one
 */
export function validateCurvesSearch(search: Record<string, unknown>): CurvesSearch {
  return { source: optionalText(search.source) };
}

/**
 * A curve column's heading, from the record's column name:
 * `success_pct` → "success %", `decline_pct_unprotected` → "decline %
 * unprotected", `cum_expected_syrup` → "cum expected syrup".
 *
 * @param column - the column's name
 * @returns the heading
 */
export function columnLabel(column: string): string {
  return column
    .replaceAll("_pct", " %")
    .replace(/_krw$/, " (₩)")
    .replace(/_sp$/, " SP")
    .replaceAll("_", " ");
}

/**
 * What to search the record's captures for to find a curve's evidence: the
 * name of the first file the curve names.
 *
 * @param evidence - the curve's evidence, one or more record-relative paths
 * @returns the file name
 */
export function evidenceQuery(evidence: string): string {
  const first = evidence.split(",")[0]!.trim();
  return first.slice(first.lastIndexOf("/") + 1);
}

/**
 * Prints a curve cell: a number with thousands separators, a text as it
 * is, nothing as a dash.
 *
 * @param cell - the cell
 * @returns the text
 */
function cellText(cell: GrowthCurve["rows"][number][number]): string {
  if (cell === null) return "–";
  return typeof cell === "number" ? cell.toLocaleString("en-US") : cell;
}

/**
 * One curve: its title and power source, its table (with each row's
 * sources where the record cites rows apart), its note, a link to the
 * record's captures filtered to the evidence it condenses, and its sources.
 *
 * @param props - the curve, the mode, the lists and the source index
 * @returns the card
 */
function CurveCard({
  curve,
  mode,
  data,
  index,
}: {
  curve: GrowthCurve;
  mode: ModeSection;
  data: TeamPowerData;
  index: SourceIndex;
}) {
  return (
    <section className="card" aria-label={curve.title}>
      <div className="card-head">
        <h3>{curve.title}</h3>
        <PowerSourceLink mode={mode} slug={curve.powerSource} sources={data.sources} />
      </div>
      <div className="tablewrap">
        <table className="scroll">
          <thead>
            <tr>
              {curve.columns.map((c) => (
                <th key={c}>{columnLabel(c)}</th>
              ))}
              {curve.rowSources ? <th>Sources</th> : null}
            </tr>
          </thead>
          <tbody>
            {curve.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={typeof cell === "number" ? "n" : undefined}>
                    {cellText(cell)}
                  </td>
                ))}
                {curve.rowSources ? (
                  <td>
                    <SourceChips ids={curve.rowSources[i]} sources={index} />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {curve.note ? <p className="muted">{curve.note}</p> : null}
      {curve.evidence && mode.recordSlug ? (
        <div className="label">
          Condensed from{" "}
          <Link
            to="/research/$slug/captures"
            params={{ slug: mode.recordSlug }}
            search={{ q: evidenceQuery(curve.evidence) }}
          >
            the record's evidence
          </Link>
        </div>
      ) : null}
      <SourceChips ids={curve.sources} sources={index} />
    </section>
  );
}

/** Props for {@link GrowthCurvesView}. */
export interface GrowthCurvesViewProps {
  /** The team-power mode. */
  mode: ModeSection;
  /** Its team-power screens' config. */
  teamPower: TeamPowerConfig;
  /** The current search params. */
  search: CurvesSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: CurvesSearch) => void;
}

/**
 * The power sources' cost and return curves, one table each, filtered by
 * power source (in the URL as `?source=`).
 *
 * @param props - the mode, its team-power config, the search params and their setter
 * @returns the view
 */
export function GrowthCurvesView({ mode, teamPower, search, onSearch }: GrowthCurvesViewProps) {
  const index = useSourceIndex();
  const state = useTeamPowerData();
  const { title, lede } = teamPower.curves;
  const known = state.status === "ready" ? state.data.sources.map((s) => s.slug) : undefined;
  useDropUnknown(search.source, known, () => onSearch({ source: undefined }));
  return (
    <>
      <ViewHeader title={title} lede={lede} />
      <TeamPowerLoaded state={state}>
        {(data) => {
          const bySource = [...new Set(data.curves.map((c) => c.powerSource))];
          const shown = data.curves.filter(
            (c) => !search.source || c.powerSource === search.source,
          );
          return (
            <>
              <TableTools
                select={{
                  name: "Power source",
                  label: "Every power source",
                  options: bySource.map(
                    (slug) =>
                      [slug, data.sources.find((s) => s.slug === slug)?.nameEn ?? slug] as const,
                  ),
                  value: search.source ?? "",
                  onChange: (source) => onSearch({ source: source || undefined }),
                }}
              />
              {shown.length ? (
                shown.map((c) => (
                  <CurveCard key={c.id} curve={c} mode={mode} data={data} index={index} />
                ))
              ) : (
                <EmptyState>
                  {search.source ? "No curves for this power source." : "No curves recorded yet."}
                </EmptyState>
              )}
            </>
          );
        }}
      </TeamPowerLoaded>
    </>
  );
}
