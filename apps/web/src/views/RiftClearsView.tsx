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
import { CookieName } from "../components/CookieName";
import type { Column, TableFilter, TableSelect } from "../components/DataTable";
import { applyFilters, DataTable, TableTools } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Kv } from "../components/Kv";
import type { PillKind } from "../components/Pill";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { optionalKey, optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { entryPower, formatPower } from "../lib/stage";
import { DeckCard } from "./DeckCard";
import { DeckLink, DeckName } from "./DeckLink";
import { CopyHeader } from "./ModeViewHeader";

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

/** What a posted figure is, per power basis; `null` when the post doesn't say. */
const BASES: Readonly<Record<NonNullable<RiftClear["powerBasis"]>, string>> = {
  rift: "as the Rift shows it, 차원의 힘 included",
  lobby: "from the formation screen, outside the Rift",
};

/** The ids of the page's sections. */
const PARTS = { ranked: "rift-15-clears", bounds: "rift-15-bounds" } as const;

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
 * Builds a clear card's DOM id.
 *
 * @param c - the attempt
 * @returns `rift-clear-<id>`
 */
const clearId = (c: Pick<RiftClear, "id">) => `rift-clear-${c.id}`;

/**
 * The level an attempt was made at, as the page names it.
 *
 * @param c - the attempt
 * @returns e.g. `S1 · L12`
 */
const levelLabel = (c: Pick<RiftClear, "season" | "level">) => `S${c.season} · L${c.level}`;

/**
 * Where a level's brackets start: its recommended power, then the power
 * each bracket of `lines` takes there, from the power gate's table.
 *
 * @param props - the recommended power, when known, the bracket table and the kept-damage shares to show
 * @returns the line, or a dash without a recommended power
 */
function LevelLine({
  recommended,
  brackets,
  lines,
}: {
  recommended: number | null;
  brackets: readonly PowerBracket[];
  lines: readonly number[];
}) {
  if (recommended === null) return <>–</>;
  const entries = lines.flatMap((share) => {
    const bracket = brackets.find((b) => b.damagePct === share);
    return bracket
      ? [`${share}% from ${formatPower(entryPower(recommended, bracket.minRatioPct))}`]
      : [];
  });
  return (
    <>
      {formatPower(recommended)} recommended
      {entries.length ? <div className="muted">{entries.join(" · ")}</div> : null}
    </>
  );
}

/**
 * An attempt's team power as posted, with which power the figure is and
 * the 차원의 힘 level when the post gives them.
 *
 * @param props - the attempt
 * @returns the power
 */
function TeamPower({ clear: c }: { clear: RiftClear }) {
  const basis = c.powerBasis ? BASES[c.powerBasis] : "the post doesn't say which power";
  const level = c.riftPowerLevel === null ? "" : `, 차원의 힘 Lv.${c.riftPowerLevel}`;
  return (
    <>
      {c.teamPower}
      <div className="muted">
        {basis}
        {level}
      </div>
    </>
  );
}

/** What a clear card reads besides the clear. */
interface ClearContext {
  /** The stage mode, for deck links. */
  mode: ModeSection;
  /** Each deck, by id, once the decks load. */
  decks: ReadonlyMap<string, Deck> | undefined;
  /** The power gate's brackets. */
  brackets: readonly PowerBracket[];
  /** The kept-damage shares whose entry power a level shows. */
  lines: readonly number[];
  /**
   * The recommended power of an attempt's level.
   *
   * @param c - the attempt
   * @returns its own, else the stored level's, else null
   */
  recommended(c: RiftClear): number | null;
  /**
   * The English an attempt shows for its boss.
   *
   * @param c - the attempt
   * @returns its own, else the Rift bosses', else the glossary's; null when none is known
   */
  bossEn(c: RiftClear): string | null;
  /** The source index the chips link through. */
  sources: SourceIndex;
}

/**
 * One clear as a card: its level and boss, standing, team (a link to its
 * deck, else the note), team power, the level's recommended power and
 * bracket entry powers, how it was played, what backs it and its sources;
 * then, the first time the page shows the deck, the deck's card under it.
 *
 * @param props - the clear, whether its deck's card is already on the page, and what the card reads besides
 * @returns the card, and the deck's card when it follows
 */
function ClearCard({
  clear: c,
  deckShown,
  context,
}: {
  clear: RiftClear;
  deckShown: boolean;
  context: ClearContext;
}) {
  const { mode, decks, brackets, lines, sources } = context;
  const deck = c.deckId ? decks?.get(c.deckId) : undefined;
  const [kind, standing] = STANDINGS[c.standing];
  const team = c.deckId ? (
    <DeckLink mode={mode} id={c.deckId} deck={deck} />
  ) : (
    (c.note ?? "No lineup posted.")
  );
  return (
    <div className="rift-clear">
      <article className="card" id={clearId(c)} aria-labelledby={`${clearId(c)}-title`}>
        <div className="card-head">
          <div>
            <h3 id={`${clearId(c)}-title`}>
              Season {c.season}, level {c.level}
            </h3>
            <CookieName kr={c.bossKr} en={context.bossEn(c)} inline />
          </div>
          <div className="chips">
            <Pill kind={kind}>{standing}</Pill>
          </div>
        </div>
        <Kv
          rows={[
            ["Team", team],
            ["Team power", <TeamPower clear={c} />],
            [
              "Level",
              <LevelLine recommended={context.recommended(c)} brackets={brackets} lines={lines} />,
            ],
            ["Play", c.play ?? "?"],
            [
              "Evidence",
              <Pill kind={c.evidence === "text" ? "claimed" : "verified"}>{c.evidence}</Pill>,
            ],
            ["Note", c.deckId ? c.note : null],
          ]}
        />
        <SourceChips ids={c.sources} sources={sources} />
      </article>
      {deck && !deckShown ? (
        <div className="rift-clear-team">
          <DeckCard deck={deck} sources={sources} />
        </div>
      ) : null}
    </div>
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
 * The documented Dimensional Rift clears at the config's bracket, in the
 * API's order (the clears the record accepts by season, highest level and
 * lowest power first, then the unverified and rejected claims), each as a
 * card with its team (see {@link ClearCard}); then, under their own
 * heading, the attempts that bound them: every other bracket's attempts
 * and the failures at the bracket, as a table. A boss is named in English
 * as its row names it, else as the Rift bosses do, else as the glossary
 * does. The result and a text filter live in the URL and apply to both
 * lists; the text filter matches the level, the boss in Korean and
 * English, the team power, the deck and the note.
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
  const context: ClearContext = {
    mode,
    decks,
    brackets,
    lines: config.lines,
    /** @inheritdoc */
    recommended: (c) => c.recommendedPower ?? levels.get(c.level) ?? null,
    /** @inheritdoc */
    bossEn: (c) => c.bossEn ?? bosses.get(c.bossKr) ?? c.en,
    sources,
  };
  /**
   * The deck name a row shows.
   *
   * @param c - the attempt
   * @returns the deck's English name (its id before the decks load), or null without a deck
   */
  const deckOf = (c: RiftClear) => (c.deckId ? (decks?.get(c.deckId)?.nameEn ?? c.deckId) : null);
  const filter: TableFilter<RiftClear> = {
    value: search.q ?? "",
    onChange: (q) => onSearch({ q }),
    text: (c) =>
      [
        levelLabel(c),
        `level ${c.level}`,
        c.bossKr,
        context.bossEn(c) ?? "",
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
  const columns: Column<RiftClear>[] = [
    {
      header: "Level",
      cell: (c) => {
        const recommended = context.recommended(c);
        return (
          <>
            {levelLabel(c)}
            {recommended === null ? null : (
              <div className="muted">of {formatPower(recommended)} recommended</div>
            )}
          </>
        );
      },
      className: "n",
    },
    { header: "Boss", cell: (c) => <CookieName kr={c.bossKr} en={context.bossEn(c)} /> },
    { header: "Team power", cell: (c) => c.teamPower },
    { header: "Bracket", cell: (c) => `${c.bracket}%`, className: "n" },
    {
      header: "Result",
      cell: (c) => <span className={`result ${c.result}`}>{RESULTS[c.result]}</span>,
    },
    {
      header: "Standing",
      cell: (c) => <Pill kind={STANDINGS[c.standing][0]}>{STANDINGS[c.standing][1]}</Pill>,
    },
    {
      header: "Deck",
      cell: (c) => (c.deckId ? <DeckName id={c.deckId} deck={decks?.get(c.deckId)} /> : "–"),
    },
    { header: "Note", cell: (c) => c.note ?? "", className: "wide" },
    { header: "Sources", cell: (c) => <SourceChips ids={c.sources} sources={sources} /> },
  ];
  return (
    <>
      <CopyHeader scope={mode.scope} copy={config} fallbackTitle="Rift clears" />
      <QueryResult query={clears} resource="Rift clears">
        {(rows) => {
          if (!rows.length) return <EmptyState>No Rift clears recorded yet.</EmptyState>;
          const kept = applyFilters(rows, filter, select);
          const ranked = kept.filter((c) => c.bracket === config.bracket && c.result === "clear");
          const bounds = kept.filter((c) => !ranked.includes(c));
          const shown = new Set<string>();
          return (
            <>
              <TableTools filter={filter} select={select} />
              {ranked.length + bounds.length === 0 ? (
                <EmptyState>Nothing matches.</EmptyState>
              ) : null}
              {ranked.length ? (
                <section id={PARTS.ranked} aria-labelledby={`${PARTS.ranked}-title`}>
                  <h3 id={`${PARTS.ranked}-title`}>Clears at {config.bracket}%</h3>
                  {ranked.map((c) => {
                    const deckShown = c.deckId !== null && shown.has(c.deckId);
                    if (c.deckId !== null && decks?.has(c.deckId)) shown.add(c.deckId);
                    return (
                      <ClearCard key={c.id} clear={c} deckShown={deckShown} context={context} />
                    );
                  })}
                </section>
              ) : null}
              {bounds.length ? (
                <section id={PARTS.bounds} aria-labelledby={`${PARTS.bounds}-title`}>
                  <h3 id={`${PARTS.bounds}-title`}>Attempts that bound it</h3>
                  <p className="muted">
                    Attempts at other brackets and failures at {config.bracket}%, in the same order.
                  </p>
                  <DataTable columns={columns} rows={bounds} rowKey={(c) => c.id} layout="stack" />
                </section>
              ) : null}
            </>
          );
        }}
      </QueryResult>
    </>
  );
}
