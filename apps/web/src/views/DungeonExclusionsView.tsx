import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSourceIndex } from "../api/hooks";
import { dungeonExclusionsQuery, dungeonLineupsQuery } from "../api/queries";
import type { DungeonExclusion, DungeonLineup } from "../api/types";
import type { DungeonConfig, ModeSection } from "../app/modes";
import { modeLink } from "../app/modes";
import { CookieName } from "../components/CookieName";
import type { Column, TableSelect } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { EXCLUSION_KINDS, EXCLUSION_STATUSES } from "../lib/dungeon";
import { optionalKey } from "../lib/search";
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

/**
 * Links to the published lineups, each by author and date.
 *
 * @param props - the mode, for the links, and the lineups
 * @returns the links, or "–" when there are none
 */
function LineupLinks({ mode, lineups }: { mode: ModeSection; lineups: readonly DungeonLineup[] }) {
  if (!lineups.length) return <>–</>;
  return (
    <>
      {lineups.map((l, i) => (
        <span key={l.id}>
          {i > 0 && " · "}
          <Link {...modeLink(mode.id, "/$mode/lineups")} hash={lineupId(l)}>
            {l.author} {l.date}
          </Link>
        </span>
      ))}
    </>
  );
}

/**
 * The cookies kept out of Crumble Dungeon's first wave: each with its
 * English name, the kind of reason, where it stands (a disputed one
 * marked), why, the published lineups that leave it out and those that
 * keep it in their first wave, and sources. The kind and status filters
 * live in the URL.
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
  const columns: Column<DungeonExclusion>[] = [
    { header: "Cookie", cell: (e) => <CookieName kr={e.cookieKr} en={e.en} /> },
    { header: "Kind", cell: (e) => EXCLUSION_KINDS[e.kind] },
    {
      header: "Status",
      cell: (e) =>
        e.status === "disputed" ? (
          <Pill kind="disputed">{EXCLUSION_STATUSES[e.status]}</Pill>
        ) : (
          EXCLUSION_STATUSES[e.status]
        ),
    },
    { header: "Why", cell: (e) => e.why, className: "wide" },
    {
      header: "Left out by",
      cell: (e) => (
        <LineupLinks mode={mode} lineups={lineups.filter((l) => l.excluded.includes(e.cookieKr))} />
      ),
    },
    {
      header: "Kept by",
      cell: (e) => (
        <LineupLinks mode={mode} lineups={lineups.filter((l) => l.first40.includes(e.cookieKr))} />
      ),
    },
    { header: "Sources", cell: (e) => <SourceChips ids={e.sources} sources={sources} /> },
  ];
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
        {(rows) =>
          rows.length ? (
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(e) => e.id}
              select={select}
              selects={selects}
              layout="stack"
            />
          ) : (
            <EmptyState>No exclusions recorded yet.</EmptyState>
          )
        }
      </QueryResult>
    </>
  );
}
