import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import {
  decksQuery,
  powerBracketsQuery,
  riftBossesQuery,
  riftClearsQuery,
  riftLevelsQuery,
} from "../api/queries";
import type { Deck, PowerBracket, RiftClear } from "../api/types";
import type { ModeSection, StageConfig } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { CookieName } from "../components/CookieName";
import type { Column, TableFilter, TableSelect } from "../components/DataTable";
import { applyFilters, DataTable, TableTools } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import type { PillKind } from "../components/Pill";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { optionalKey, optionalText } from "../lib/search";
import { entryPower, formatPower } from "../lib/stage";
import { DeckCard } from "./DeckCard";
import { CopyHeader } from "./ModeViewHeader";
import { BracketTag, EvidencePill, PowerCell, Rank, ResultPill, ShortDeckLink } from "./StageParts";

/** Select labels per result. */
const RESULTS: Readonly<Record<RiftClear["result"], string>> = {
  clear: "Cleared",
  fail: "Failed",
};

/** The pill each standing shows, and its text. */
const STANDINGS: Readonly<Record<RiftClear["standing"], readonly [PillKind, string]>> = {
  accepted: ["verified", "accepted"],
  unverified: ["claimed", "unverified"],
  rejected: ["disputed", "rejected"],
};

/** What a posted figure is, per power basis, as a power cell's tooltip says it. */
const BASES: Readonly<Record<NonNullable<RiftClear["powerBasis"]>, string>> = {
  rift: "Rift power, 차원의 힘 included",
};

/** The ids of the page's sections. */
const PARTS = {
  ranked: "rift-15-clears",
  teams: "rift-15-teams",
  bounds: "rift-15-bounds",
} as const;

/** The Rift clears view's search params: a result and a text filter. */
export interface RiftClearsSearch {
  result?: RiftClear["result"];
  q?: string;
}

/**
 * Reads the Rift clears view's search params.
 *
 * @param search - the decoded query values
 * @returns the result and text filter, each dropped when unusable
 */
export function validateRiftClearsSearch(search: Record<string, unknown>): RiftClearsSearch {
  return { result: optionalKey(search.result, RESULTS), q: optionalText(search.q) };
}

/**
 * The level an attempt was made at, as the filter matches it.
 *
 * @param c - the attempt
 * @returns e.g. `S1 · L12`
 */
const levelLabel = (c: Pick<RiftClear, "season" | "level">) => `S${c.season} · L${c.level}`;

/**
 * An attempt's level, large, its season beside it and the level's
 * recommended power under it.
 *
 * @param props - the attempt and its level's recommended power, when known
 * @returns the cell's content
 */
function LevelCell({ clear: c, recommended }: { clear: RiftClear; recommended: number | null }) {
  return (
    <span className="stage-at">
      <b>
        L{c.level} <span className="pw-of">S{c.season}</span>
      </b>
      {recommended === null ? null : <span className="pw-of">of {formatPower(recommended)}</span>}
    </span>
  );
}

/**
 * Where a level's brackets start: the power each bracket of `lines` takes
 * there, a tinted tag each, from the power gate's table.
 *
 * @param props - the recommended power, when known, the bracket table and the kept-damage shares to show
 * @returns the lines, or a dash without a recommended power
 */
function LevelLines({
  recommended,
  brackets,
  lines,
}: {
  recommended: number | null;
  brackets: readonly PowerBracket[];
  lines: readonly number[];
}) {
  if (recommended === null) return <>–</>;
  return (
    <span className="pw">
      {lines.flatMap((share) => {
        const bracket = brackets.find((b) => b.damagePct === share);
        return bracket
          ? [
              <span key={share}>
                <BracketTag pct={share} />{" "}
                {formatPower(entryPower(recommended, bracket.minRatioPct))}
              </span>,
            ]
          : [];
      })}
    </span>
  );
}

/**
 * An attempt's team power, short, with which power the figure is and the
 * 차원의 힘 level under it when the post gives them; the post's wording in
 * the tooltip.
 *
 * @param props - the attempt
 * @returns the cell's content
 */
function TeamPower({ clear: c }: { clear: RiftClear }) {
  const basis = c.powerBasis ? BASES[c.powerBasis] : "power not given as the Rift shows it";
  return (
    <PowerCell posted={c.teamPower} powerG={c.powerG}>
      <span className="pw-of" title={basis}>
        {c.powerBasis === "rift" ? "Rift power" : "basis unknown"}
        {c.riftPowerLevel === null ? "" : ` · 차원의 힘 Lv.${c.riftPowerLevel}`}
      </span>
    </PowerCell>
  );
}

/** Props for {@link RiftClearsView}. */
export interface RiftClearsViewProps {
  /** The stage mode. */
  mode: ModeSection;
  /** Its stage screens' config. */
  stage: StageConfig;
  /** The current search params. */
  search: RiftClearsSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: RiftClearsSearch) => void;
}

/**
 * The documented Dimensional Rift clears at the config's bracket on the
 * power the Rift shows, ranked in the API's order (the clears the record
 * accepts by season, highest level and lowest power first, numbered from
 * #1; then the unverified and rejected claims, unnumbered), a row each:
 * the level large, the boss with its portrait, the team power short, the
 * power the config's brackets take there, standing and evidence as pills,
 * the team (its deck, else the note) and the sources last. Then the teams
 * those clears ran, a card each, once; then, under their own heading, the
 * attempts that bound them: the clears claimed at the bracket without a
 * Rift power, every other bracket's attempts and the failures at the
 * bracket. A boss is named in English as its row names it, else as the
 * Rift bosses do, else as the glossary does. The result and a text filter
 * live in the URL and apply to every list; the text filter matches the
 * level, the boss in Korean and English, the team power, the deck and the
 * note.
 *
 * @param props - the stage mode, its stage config, the search params and their setter
 * @returns the view
 */
export function RiftClearsView({ mode, stage, search, onSearch }: RiftClearsViewProps) {
  const { riftClears: config } = stage;
  const sources = useSourceIndex();
  const clears = useQuery(riftClearsQuery());
  const decks = useQuery({
    ...decksQuery(mode.scope),
    select: (list) => new Map(list.map((d) => [d.id, d] as const)),
  }).data;
  const brackets = useQuery(powerBracketsQuery()).data ?? [];
  const levels = new Map(
    (useQuery(riftLevelsQuery()).data ?? []).map((l) => [l.level, l.recommendedPower] as const),
  );
  const bosses = new Map(
    (useQuery(riftBossesQuery()).data ?? []).flatMap((b) =>
      b.bossEn ? [[b.bossKr, b.bossEn] as const] : [],
    ),
  );
  /**
   * The recommended power of an attempt's level.
   *
   * @param c - the attempt
   * @returns its own, else the stored level's, else null
   */
  const recommendedOf = (c: RiftClear) => c.recommendedPower ?? levels.get(c.level) ?? null;
  /**
   * The English an attempt shows for its boss.
   *
   * @param c - the attempt
   * @returns its own, else the Rift bosses', else the glossary's; null when none is known
   */
  const bossEnOf = (c: RiftClear) => c.bossEn ?? bosses.get(c.bossKr) ?? c.en;
  /**
   * The deck name a row's filter matches.
   *
   * @param c - the attempt
   * @returns the deck's English name (its id before the decks load), or null without a deck
   */
  const deckOf = (c: RiftClear) => (c.deckId ? (decks?.get(c.deckId)?.nameEn ?? c.deckId) : null);
  /**
   * Whether an attempt is one of the ranked clears: a clear at the
   * config's bracket on the power the Rift shows.
   *
   * @param c - the attempt
   * @returns `true` if it is
   */
  const isRanked = (c: RiftClear) =>
    c.bracket === config.bracket && c.result === "clear" && c.powerBasis === "rift";
  const filter: TableFilter<RiftClear> = {
    value: search.q ?? "",
    onChange: (q) => onSearch({ q }),
    text: (c) =>
      [
        levelLabel(c),
        `level ${c.level}`,
        c.bossKr,
        bossEnOf(c) ?? "",
        c.teamPower,
        deckOf(c) ?? "",
        c.note ?? "",
      ].join(" "),
    placeholder: "Filter by level, boss, deck or note",
  };
  const select: TableSelect<RiftClear> = {
    name: "Result",
    label: "Any result",
    options: Object.entries(RESULTS),
    value: search.result ?? "",
    onChange: (value) => onSearch({ result: optionalKey(value, RESULTS) }),
    test: (c, value) => c.result === value,
  };
  const boss: Column<RiftClear> = {
    header: "Boss",
    cell: (c) => <CookieName kr={c.bossKr} en={bossEnOf(c)} />,
  };
  /**
   * An attempt's note, cut to two lines.
   *
   * @param c - the attempt
   * @returns the clamped note, or null without one
   */
  const note = (c: RiftClear) =>
    c.note ? (
      <Clamp lines={2} perLine={50}>
        {c.note}
      </Clamp>
    ) : null;
  const sourcesCol: Column<RiftClear> = {
    header: "Sources",
    cell: (c) => <SourceChips ids={c.sources} sources={sources} max={1} />,
    className: "src",
  };
  /**
   * The ranked clears' columns.
   *
   * @param rankOf - each accepted ranked clear's place, by id
   * @returns the columns
   */
  const rankedColumns = (rankOf: ReadonlyMap<number, number>): Column<RiftClear>[] => [
    { header: "#", cell: (c) => <Rank n={rankOf.get(c.id) ?? null} /> },
    {
      header: "Level",
      cell: (c) => <LevelCell clear={c} recommended={recommendedOf(c)} />,
      className: "n",
    },
    boss,
    { header: "Team power", cell: (c) => <TeamPower clear={c} />, className: "n" },
    {
      header: "Lines",
      cell: (c) => (
        <LevelLines recommended={recommendedOf(c)} brackets={brackets} lines={config.lines} />
      ),
      className: "n",
    },
    {
      header: "Verdict",
      cell: (c) => (
        <span className="verdict">
          <Pill kind={STANDINGS[c.standing][0]}>{STANDINGS[c.standing][1]}</Pill>
          <EvidencePill evidence={c.evidence} />
          {c.play ? <span className="play">{c.play}</span> : null}
        </span>
      ),
    },
    {
      header: "Team",
      cell: (c) =>
        c.deckId ? (
          <span className="pw">
            <ShortDeckLink mode={mode} id={c.deckId} deck={decks?.get(c.deckId)} local />
            {note(c)}
          </span>
        ) : (
          (note(c) ?? "No lineup posted.")
        ),
      className: "wide clear-note",
    },
    sourcesCol,
  ];
  const boundsColumns: Column<RiftClear>[] = [
    {
      header: "Level",
      cell: (c) => <LevelCell clear={c} recommended={recommendedOf(c)} />,
      className: "n",
    },
    boss,
    { header: "Team power", cell: (c) => <TeamPower clear={c} />, className: "n" },
    { header: "Bracket", cell: (c) => <BracketTag pct={c.bracket} /> },
    {
      header: "Result",
      cell: (c) => (
        <span className="verdict">
          <ResultPill result={c.result} />
          <Pill kind={STANDINGS[c.standing][0]}>{STANDINGS[c.standing][1]}</Pill>
        </span>
      ),
    },
    {
      header: "Deck",
      cell: (c) =>
        c.deckId ? <ShortDeckLink mode={mode} id={c.deckId} deck={decks?.get(c.deckId)} /> : "–",
      className: "deck",
    },
    { header: "Note", cell: note, className: "wide clear-note" },
    sourcesCol,
  ];
  return (
    <>
      <CopyHeader scope={mode.scope} copy={config} fallbackTitle="Rift clears" />
      <QueryResult query={clears} resource="Rift clears">
        {(rows) => {
          if (!rows.length) return <EmptyState>No Rift clears recorded yet.</EmptyState>;
          // Places come from the whole ranking, so a filtered row keeps its number.
          const rankOf = new Map(
            rows
              .filter((c) => isRanked(c) && c.standing === "accepted")
              .map((c, i) => [c.id, i + 1] as const),
          );
          const kept = applyFilters(rows, filter, select);
          const ranked = kept.filter(isRanked);
          const bounds = kept.filter((c) => !isRanked(c));
          const teams = [
            ...new Map(
              ranked.flatMap((c): [string, Deck][] => {
                const deck = c.deckId ? decks?.get(c.deckId) : undefined;
                return deck ? [[deck.id, deck]] : [];
              }),
            ).values(),
          ];
          return (
            <>
              <TableTools filter={filter} select={select} />
              {ranked.length + bounds.length === 0 ? (
                <EmptyState>Nothing matches.</EmptyState>
              ) : null}
              {ranked.length ? (
                <section
                  id={PARTS.ranked}
                  className="clears ranked"
                  aria-labelledby={`${PARTS.ranked}-title`}
                >
                  <h3 id={`${PARTS.ranked}-title`}>Clears at {config.bracket}%</h3>
                  <DataTable
                    columns={rankedColumns(rankOf)}
                    rows={ranked}
                    rowKey={(c) => c.id}
                    layout="stack"
                  />
                </section>
              ) : null}
              {teams.length ? (
                <section
                  id={PARTS.teams}
                  className="rift-teams"
                  aria-labelledby={`${PARTS.teams}-title`}
                >
                  <h3 id={`${PARTS.teams}-title`}>Their teams</h3>
                  {teams.map((d) => (
                    <DeckCard key={d.id} deck={d} sources={sources} />
                  ))}
                </section>
              ) : null}
              {bounds.length ? (
                <section
                  id={PARTS.bounds}
                  className="clears"
                  aria-labelledby={`${PARTS.bounds}-title`}
                >
                  <h3 id={`${PARTS.bounds}-title`}>Attempts that bound it</h3>
                  <p className="group-lede">
                    No Rift power, another bracket, or failed at {config.bracket}%.
                  </p>
                  <DataTable
                    columns={boundsColumns}
                    rows={bounds}
                    rowKey={(c) => c.id}
                    layout="stack"
                  />
                </section>
              ) : null}
            </>
          );
        }}
      </QueryResult>
    </>
  );
}
