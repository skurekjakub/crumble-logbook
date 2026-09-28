import { useSourceIndex } from "../api/hooks";
import type { PowerDataPoint } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { BasisMark } from "../components/BasisMark";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { ViewHeader } from "../components/ViewHeader";
import { formatG } from "../lib/format";
import { optionalKey, optionalText } from "../lib/search";
import { sourceLabel } from "../lib/sources";
import { KIND_LABELS, formatPct } from "../lib/team-power";
import type { TeamPowerData } from "./TeamPowerData";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import { PowerSourceLink } from "./TeamPowerParts";
import { SourceChips } from "../components/SourceChips";

/** The data points page's search params: a kind, a power source and a text filter. */
export interface DataPointsSearch {
  kind?: PowerDataPoint["kind"];
  source?: string;
  q?: string;
}

/**
 * Reads the data points page's search params.
 *
 * @param search - the decoded query values
 * @returns the kind, the power source and the text filter, each dropped when unusable
 */
export function validateDataPointsSearch(search: Record<string, unknown>): DataPointsSearch {
  return {
    kind: optionalKey(search.kind, KIND_LABELS),
    source: optionalText(search.source),
    q: optionalText(search.q),
  };
}

/**
 * The power before and after a figure, as posted: `2G → 2.2G`, `→ 4G` for
 * a snapshot, a dash for neither.
 *
 * @param p - the data point
 * @returns the text
 */
export function beforeAfter(p: Pick<PowerDataPoint, "beforeG" | "afterG">): string {
  if (p.beforeG === null && p.afterG === null) return "–";
  return `${p.beforeG === null ? "" : `${formatG(p.beforeG)} `}→ ${p.afterG === null ? "?" : formatG(p.afterG)}`;
}

/** Props for {@link PowerDataPointsView}. */
export interface PowerDataPointsViewProps {
  /** The team-power mode. */
  mode: ModeSection;
  /** Its team-power screens' config. */
  teamPower: TeamPowerConfig;
  /** The current search params. */
  search: DataPointsSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: DataPointsSearch) => void;
}

/**
 * Every team-power figure, in the record's order, each with its date,
 * power source, how it is known, the power before and after, the change,
 * what it took, the note and sources; filtered by kind, power source and
 * text (in the URL as `?kind=`, `?source=` and `?q=`). Nothing is ranked.
 *
 * @param props - the mode, its team-power config, the search params and their setter
 * @returns the view
 */
export function PowerDataPointsView({
  mode,
  teamPower,
  search,
  onSearch,
}: PowerDataPointsViewProps) {
  const index = useSourceIndex();
  const state = useTeamPowerData();
  const { title, lede } = teamPower.dataPoints;
  /**
   * The data points' table columns.
   *
   * @param data - the lists, to name each power source
   * @returns the columns
   */
  const columns = (data: TeamPowerData): Column<PowerDataPoint>[] => [
    { header: "Date", cell: (p) => p.date, className: "n" },
    {
      header: "Power source",
      cell: (p) => <PowerSourceLink mode={mode} slug={p.powerSource} sources={data.sources} />,
    },
    { header: "How known", cell: (p) => <BasisMark basis={p.kind} /> },
    { header: "Before → after", cell: beforeAfter, className: "n" },
    {
      header: "Change",
      cell: (p) => (p.deltaPct === null ? "–" : formatPct(p.deltaPct)),
      className: "n",
    },
    { header: "What it took", cell: (p) => p.cost ?? "–" },
    { header: "Note", cell: (p) => p.note, className: "wide" },
    { header: "Sources", cell: (p) => <SourceChips ids={p.sources} sources={index} /> },
  ];
  return (
    <>
      <ViewHeader title={title} lede={lede} />
      <TeamPowerLoaded state={state}>
        {(data) => (
          <DataTable
            columns={columns(data)}
            rows={data.points.filter(
              (p) =>
                (!search.kind || p.kind === search.kind) &&
                (!search.source || p.powerSource === search.source),
            )}
            rowKey={(p) => p.id}
            layout="stack"
            empty="No data points recorded yet."
            filter={{
              value: search.q ?? "",
              onChange: (q) => onSearch({ q }),
              text: (p) =>
                [
                  p.date,
                  data.sources.find((s) => s.slug === p.powerSource)?.nameEn ?? p.powerSource,
                  p.cost ?? "",
                  p.note,
                  ...p.sources.map(sourceLabel),
                ].join(" "),
              placeholder: "Filter figures",
            }}
            select={{
              name: "How known",
              label: "Every kind",
              options: Object.entries(KIND_LABELS),
              value: search.kind ?? "",
              onChange: (kind) =>
                onSearch({ kind: (kind || undefined) as DataPointsSearch["kind"] }),
            }}
            selects={[
              {
                name: "Power source",
                label: "Every power source",
                options: [...new Set(data.points.map((p) => p.powerSource))].map(
                  (slug) =>
                    [slug, data.sources.find((s) => s.slug === slug)?.nameEn ?? slug] as const,
                ),
                value: search.source ?? "",
                onChange: (source) => onSearch({ source: source || undefined }),
              },
            ]}
          />
        )}
      </TeamPowerLoaded>
    </>
  );
}
