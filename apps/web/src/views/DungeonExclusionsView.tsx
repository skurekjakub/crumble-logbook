import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSourceIndex } from "../api/hooks";
import { dungeonExclusionsQuery, dungeonLineupsQuery } from "../api/queries";
import type { DungeonExclusion, DungeonLineup } from "../api/types";
import type { DungeonConfig, ModeSection } from "../app/modes";
import { modeLink } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { CookieName } from "../components/CookieName";
import type { TableSelect } from "../components/DataTable";
import { applyFilters, TableTools } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import type { PillKind } from "../components/Pill";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { EXCLUSION_KINDS, EXCLUSION_STATUSES } from "../lib/dungeon";
import { optionalKey } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { lineupId } from "./DungeonLineupsView";
import { CopyHeader } from "./ModeViewHeader";

/** The exclusions view's search params: a kind of reason and a status. */
export interface ExclusionsSearch {
  kind?: DungeonExclusion["kind"];
  status?: DungeonExclusion["status"];
}

/**
 * Reads the exclusions view's search params.
 *
 * @param search - the decoded query values
 * @returns the kind and status, each dropped when unusable
 */
export function validateExclusionsSearch(search: Record<string, unknown>): ExclusionsSearch {
  return {
    kind: optionalKey(search.kind, EXCLUSION_KINDS),
    status: optionalKey(search.status, EXCLUSION_STATUSES),
  };
}

/** Props for {@link DungeonExclusionsView}. */
export interface DungeonExclusionsViewProps {
  /** The Crumble Dungeon mode. */
  mode: ModeSection;
  /** Its dungeon screens' config. */
  dungeon: DungeonConfig;
  /** The current search params. */
  search: ExclusionsSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: ExclusionsSearch) => void;
}

/** The pill each status shows: excluded reads as "level it out", disputed as caution, patched as retired. */
const STATUS_PILLS: Readonly<Record<DungeonExclusion["status"], PillKind>> = {
  excluded: "avoid",
  disputed: "claimed",
  patched: "obsolete",
};

/**
 * Links to the published lineups, each by author and date.
 *
 * @param props - the mode, for the links, and the lineups
 * @returns the links, or "–" when there are none
 */
function LineupLinks({ mode, lineups }: { mode: ModeSection; lineups: readonly DungeonLineup[] }) {
  if (!lineups.length) return <span className="muted">–</span>;
  return (
    <>
      {lineups.map((l, i) => (
        <span key={l.id}>
          {i > 0 ? ", " : null}
          <Link {...modeLink(mode.id, "/$mode/lineups")} hash={lineupId(l)}>
            {l.author} {l.date}
          </Link>
        </span>
      ))}
    </>
  );
}

/**
 * One exclusion as a portrait row: the cookie, its status pill and kind,
 * why (one line, expanding on demand), the lineups that leave it out and
 * those that keep it, and sources at the end.
 *
 * @param props - the exclusion, the mode, the published lineups and the source index
 * @returns the row
 */
function ExclusionRow({
  exclusion: e,
  mode,
  lineups,
  sources,
}: {
  exclusion: DungeonExclusion;
  mode: ModeSection;
  lineups: readonly DungeonLineup[];
  sources: SourceIndex;
}) {
  return (
    <li className={`excl s-${e.status}`}>
      <span className="excl-who">
        <CookieName kr={e.cookieKr} en={e.en} size={40} />
      </span>
      <span className="excl-tags">
        <Pill kind={STATUS_PILLS[e.status]}>{EXCLUSION_STATUSES[e.status]}</Pill>
        <span className="chip">{EXCLUSION_KINDS[e.kind]}</span>
      </span>
      <span className="excl-why">
        <Clamp lines={1}>{e.why}</Clamp>
      </span>
      <span className="excl-by">
        <span>
          <span className="label">Left out by</span>{" "}
          <LineupLinks
            mode={mode}
            lineups={lineups.filter((l) => l.excluded.includes(e.cookieKr))}
          />
        </span>
        <span>
          <span className="label">Kept by</span>{" "}
          <LineupLinks
            mode={mode}
            lineups={lineups.filter((l) => l.first40.includes(e.cookieKr))}
          />
        </span>
      </span>
      <SourceChips ids={e.sources} sources={sources} max={2} />
    </li>
  );
}

/**
 * The cookies kept out of Crumble Dungeon's first wave, one portrait row
 * each (see {@link ExclusionRow}). The kind and status filters live in the URL.
 *
 * @param props - the mode, its dungeon config, the search params and their setter
 * @returns the exclusions view
 */
export function DungeonExclusionsView({
  mode,
  dungeon,
  search,
  onSearch,
}: DungeonExclusionsViewProps) {
  const sources = useSourceIndex();
  const exclusions = useQuery(dungeonExclusionsQuery());
  const lineups = useQuery(dungeonLineupsQuery()).data ?? [];
  const select: TableSelect<DungeonExclusion> = {
    name: "Kind",
    label: "Any kind",
    options: Object.entries(EXCLUSION_KINDS),
    value: search.kind ?? "",
    onChange: (value) => onSearch({ kind: optionalKey(value, EXCLUSION_KINDS) }),
    test: (e, value) => e.kind === value,
  };
  const selects: TableSelect<DungeonExclusion>[] = [
    {
      name: "Status",
      label: "Any status",
      options: Object.entries(EXCLUSION_STATUSES),
      value: search.status ?? "",
      onChange: (value) => onSearch({ status: optionalKey(value, EXCLUSION_STATUSES) }),
      test: (e, value) => e.status === value,
    },
  ];
  return (
    <>
      <CopyHeader scope={mode.scope} copy={dungeon.exclusions} fallbackTitle="Exclusions" />
      <QueryResult query={exclusions} resource="dungeon exclusions">
        {(rows) => {
          if (!rows.length) return <EmptyState>No exclusions recorded yet.</EmptyState>;
          const kept = applyFilters(rows, undefined, select, selects);
          return (
            <>
              <TableTools select={select} selects={selects} />
              {kept.length ? (
                <ul className="excl-list" aria-label="Exclusions">
                  {kept.map((e) => (
                    <ExclusionRow
                      key={e.id}
                      exclusion={e}
                      mode={mode}
                      lineups={lineups}
                      sources={sources}
                    />
                  ))}
                </ul>
              ) : (
                <EmptyState>Nothing matches.</EmptyState>
              )}
            </>
          );
        }}
      </QueryResult>
    </>
  );
}
