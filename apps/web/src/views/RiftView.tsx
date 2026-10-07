import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSourceIndex } from "../api/hooks";
import {
  decksQuery,
  powerBracketsQuery,
  riftBossesQuery,
  riftLevelsQuery,
  riftSeasonsQuery,
  riftUnlocksQuery,
  stageChaptersQuery,
} from "../api/queries";
import type {
  PowerBracket,
  RiftBoss,
  RiftLevel,
  RiftSeason,
  RiftUnlock,
  StageChapter,
} from "../api/types";
import type { ModeSection, StageConfig } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { CookieName } from "../components/CookieName";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Pill } from "../components/Pill";
import { PowerField } from "../components/PowerField";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { ViewHeader } from "../components/ViewHeader";
import { optionalInt } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { citedBy } from "../lib/sources";
import {
  bracketAt,
  entryPower,
  formatPower,
  furthest,
  nextBracket,
  parsePower,
  seasonAt,
} from "../lib/stage";
import { DeckCard } from "./DeckCard";
import { TopicNotes } from "./ModeViewHeader";
import { RiftFindings } from "./RiftFindings";
import type { PowerSearch } from "./StageBracketsView";
import { validatePowerSearch } from "./StageBracketsView";
import type { ReachTile } from "./StageParts";
import { BracketTag, ReachTiles } from "./StageParts";

/** The Rift page's search params: the team power as typed, and the season whose levels to list. */
export interface RiftSearch extends PowerSearch {
  season?: number;
}

/**
 * Reads the Rift page's search params.
 *
 * @param search - the decoded query values
 * @returns the typed power and the season, each dropped when unusable
 */
export function validateRiftSearch(search: Record<string, unknown>): RiftSearch {
  return { ...validatePowerSearch(search), season: optionalInt(search.season) };
}

/** Props for {@link RiftView}. */
export interface RiftViewProps {
  /** The stage mode. */
  mode: ModeSection;
  /** Its stage screens' config. */
  stage: StageConfig;
  /** The current search params. */
  search: RiftSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: RiftSearch) => void;
  /** The moment the current season is found from; now, unless a test fixes it. */
  now?: Date;
}

/** The ids of the page's sections, which its "On this page" list links to. */
const PARTS = {
  entry: "rift-entry",
  seasons: "rift-seasons",
  levels: "rift-levels",
  decks: "rift-decks",
  findings: "rift-findings",
} as const;

/** How many levels the levels table lists before "Show all". */
export const LEVELS_SHOWN = 30;

/** The kept-damage shares whose entry power the levels table lists. */
const LEVEL_LINES = [35, 15] as const;

/**
 * The instant's date, as the season table shows it.
 *
 * @param iso - an ISO 8601 instant
 * @returns its UTC date, `YYYY-MM-DD`
 */
const day = (iso: string) => iso.slice(0, 10);

/**
 * The levels a season runs, or every level without one.
 *
 * @param levels - every level
 * @param season - the season, when one is picked
 * @returns the season's levels
 */
const levelsOf = (levels: readonly RiftLevel[], season: RiftSeason | undefined) =>
  season
    ? levels.filter((l) => l.level >= season.firstLevel && l.level <= season.lastLevel)
    : levels;

/**
 * The answer, first and large: for each reported share, the highest level
 * of the season the reader enters at that bracket or better, with the boss
 * players report there.
 *
 * @param props - the season's levels, the reported bosses, the brackets, the reader's power and the shares to report
 * @returns the answer card
 */
function Reach({
  levels,
  bosses,
  brackets,
  power,
  shares,
}: {
  levels: readonly RiftLevel[];
  bosses: readonly RiftBoss[];
  brackets: readonly PowerBracket[];
  power: number;
  shares: readonly number[];
}) {
  const last = levels.at(-1);
  const tiles = shares.flatMap((share): ReachTile[] => {
    const bracket = brackets.find((b) => b.damagePct === share);
    if (!bracket) return [];
    const reached = furthest(levels, (l) => l.recommendedPower, power, bracket.minRatioPct);
    if (!reached) {
      const first = levels[0];
      return [{ share, value: "–", sub: first ? `not yet at L${first.level}` : null, none: true }];
    }
    const boss = bosses.find((b) => b.level === reached.level);
    return [
      {
        share,
        value: `L${reached.level}`,
        sub:
          reached === last ? (
            "every level"
          ) : boss ? (
            <CookieName kr={boss.bossKr} en={boss.bossEn} inline />
          ) : null,
      },
    ];
  });
  return (
    <ReachTiles
      label="How far you climb"
      heading={
        <>
          At {formatPower(power)}
          <span className="unit">highest level per damage share, Rift power</span>
        </>
      }
      tiles={tiles}
    />
  );
}

/**
 * Where the Rift opens, on two lines: the stored unlock, cited to its own
 * sources; then, when a stage chapter ends at that stage, its boss,
 * recommended power and the power its 35% bracket takes, cited to the
 * chapter's sources.
 *
 * @param props - the stored unlock (none when no record states it), the stage chapters, the brackets and the source index
 * @returns the card
 */
function Entry({
  unlocks,
  chapters,
  brackets,
  sources,
}: {
  unlocks: readonly RiftUnlock[];
  chapters: readonly StageChapter[];
  brackets: readonly PowerBracket[];
  sources: SourceIndex;
}) {
  const unlock = unlocks[0];
  const gate = unlock && chapters.find((c) => c.lastStage === unlock.stage);
  const at35 = brackets.find((b) => b.damagePct === 35);
  return (
    <section className="card" id={PARTS.entry} aria-labelledby={`${PARTS.entry}-title`}>
      <h3 id={`${PARTS.entry}-title`}>Getting in</h3>
      {unlock ? (
        <p className="fact-line">
          <span className="fact">Opens after clearing</span>
          <b className="big">{unlock.stage}</b>
          <SourceChips ids={unlock.sources} sources={sources} max={2} />
        </p>
      ) : (
        <p className="muted">No record states what opens the Rift.</p>
      )}
      {gate ? (
        <p className="fact-line">
          <CookieName kr={gate.bossKr} en={gate.bossEn} inline />
          <span className="fact">
            <b>{formatPower(gate.recommendedPower)}</b> recommended
          </span>
          {at35 ? (
            <span className="fact">
              <BracketTag pct={35} /> from{" "}
              <b>{formatPower(entryPower(gate.recommendedPower, at35.minRatioPct))}</b>
            </span>
          ) : null}
          <SourceChips ids={gate.sources} sources={sources} max={2} />
        </p>
      ) : null}
    </section>
  );
}

/**
 * One season on a line: running or next as a pill, its levels and its end
 * (or start) date.
 *
 * @param props - the season and whether it is running
 * @returns the line
 */
function SeasonLine({ season, running }: { season: RiftSeason; running: boolean }) {
  return (
    <p className="fact-line">
      {running ? <Pill kind="good">running</Pill> : <Pill kind="alt">next</Pill>}
      <b>Season {season.season}</b>
      <span className="fact">
        levels{" "}
        <b>
          {season.firstLevel}–{season.lastLevel}
        </b>
      </span>
      <span className="fact">
        {running ? "until" : "from"} <b>{day(running ? season.endsAt : season.startsAt)}</b> UTC
      </span>
    </p>
  );
}

/**
 * The Rift's seasons: the current one (or the next, between seasons) and
 * the one after it, a line each, then every scheduled season folded.
 *
 * @param props - the seasons, the current one and the source index
 * @returns the card
 */
function Seasons({
  seasons,
  current,
  sources,
}: {
  seasons: readonly RiftSeason[];
  current: { season: RiftSeason; running: boolean } | undefined;
  sources: SourceIndex;
}) {
  const columns: Column<RiftSeason>[] = [
    {
      header: "Season",
      cell: (s) =>
        s.id === current?.season.id ? (
          <b>
            {s.season} ({current.running ? "running" : "next"})
          </b>
        ) : (
          s.season
        ),
      className: "n",
    },
    { header: "Levels", cell: (s) => `${s.firstLevel}–${s.lastLevel}`, className: "n" },
    { header: "Starts (UTC)", cell: (s) => day(s.startsAt), className: "n" },
    { header: "Ends (UTC)", cell: (s) => day(s.endsAt), className: "n" },
  ];
  const shown = current?.season;
  const next = shown ? seasons.find((s) => s.season === shown.season + 1) : undefined;
  return (
    <section className="card" id={PARTS.seasons} aria-labelledby={`${PARTS.seasons}-title`}>
      <div className="card-row">
        <h3 id={`${PARTS.seasons}-title`}>Seasons</h3>
        <SourceChips ids={citedBy(seasons)} sources={sources} />
      </div>
      {current ? (
        <SeasonLine season={current.season} running={current.running} />
      ) : (
        <p className="muted">No season is running or scheduled.</p>
      )}
      {next && current?.running ? <SeasonLine season={next} running={false} /> : null}
      <details className="levels">
        <summary className="label">Every scheduled season ({seasons.length})</summary>
        <DataTable
          columns={columns}
          rows={seasons}
          rowKey={(s) => s.id}
          empty="No seasons recorded."
        />
      </details>
    </section>
  );
}

/**
 * One season's levels: each level's recommended power, the power its 35%
 * and 15% brackets take, the boss players report there and, with a power,
 * the reader's bracket as a tinted tag and the power the next one up takes.
 * The first {@link LEVELS_SHOWN} levels show; "Show all" lists the rest.
 *
 * @param props - the levels, the reported bosses, the brackets, the reader's power, the season picker and the source index
 * @returns the card
 */
function Levels({
  levels,
  bosses,
  brackets,
  power,
  seasons,
  season,
  onSeason,
  sources,
}: {
  levels: readonly RiftLevel[];
  bosses: readonly RiftBoss[];
  brackets: readonly PowerBracket[];
  power: number | null;
  seasons: readonly RiftSeason[];
  season: RiftSeason | undefined;
  /** Picks the season whose levels to list; `undefined` for every level. */
  onSeason: (season: number | undefined) => void;
  sources: SourceIndex;
}) {
  const [all, setAll] = useState(false);
  const shown = levelsOf(levels, season);
  const listed = all ? shown : shown.slice(0, LEVELS_SHOWN);
  const reported = new Map<number, RiftBoss[]>();
  for (const boss of bosses) reported.set(boss.level, [...(reported.get(boss.level) ?? []), boss]);
  const columns: Column<RiftLevel>[] = [
    { header: "Level", cell: (l) => <span className="rift-lv">{l.level}</span>, className: "n" },
    { header: "Recommended", cell: (l) => formatPower(l.recommendedPower), className: "n" },
    ...LEVEL_LINES.flatMap((share) => {
      const bracket = brackets.find((b) => b.damagePct === share);
      if (!bracket) return [];
      return [
        {
          header: `${share}% from`,
          cell: (l: RiftLevel) => formatPower(entryPower(l.recommendedPower, bracket.minRatioPct)),
          className: "n",
        },
      ];
    }),
    ...(power === null
      ? []
      : [
          {
            header: "Your damage",
            cell: (l: RiftLevel) => {
              const at = bracketAt(brackets, power, l.recommendedPower);
              const next = nextBracket(brackets, at);
              return (
                <span className="pw">
                  {at ? <BracketTag pct={at.damagePct} /> : "–"}
                  {next ? (
                    <span className="pw-of">
                      {next.damagePct}% at{" "}
                      {formatPower(entryPower(l.recommendedPower, next.minRatioPct))}
                    </span>
                  ) : null}
                </span>
              );
            },
          },
        ]),
    {
      header: "Reported boss",
      cell: (l) =>
        (reported.get(l.level) ?? []).map((b) => (
          <div key={b.id} className="boss-cell">
            <span className="boss-name">
              <CookieName kr={b.bossKr} en={b.bossEn} inline />
              <SourceChips ids={b.sources} sources={sources} max={1} />
            </span>
            {b.note ? (
              <span className="muted">
                <Clamp lines={1} perLine={70}>
                  {b.note}
                </Clamp>
              </span>
            ) : null}
          </div>
        )),
      className: "wide",
    },
  ];
  return (
    <section className="card" id={PARTS.levels} aria-labelledby={`${PARTS.levels}-title`}>
      <div className="card-row">
        <h3 id={`${PARTS.levels}-title`}>Levels</h3>
        <SourceChips ids={citedBy(levels)} sources={sources} />
      </div>
      <p className="st-group-lede">Compare with the power the Rift shows, 차원의 힘 included.</p>
      <DataTable
        columns={columns}
        rows={listed}
        rowKey={(l) => l.id}
        empty="No Rift levels recorded."
        select={{
          name: "Season",
          label: "Every level",
          options: seasons.map(
            (s) =>
              [String(s.season), `Season ${s.season} (${s.firstLevel}–${s.lastLevel})`] as const,
          ),
          value: season ? String(season.season) : "",
          onChange: (value) => {
            setAll(false);
            onSeason(value === "" ? undefined : Number(value));
          },
        }}
      />
      {shown.length > listed.length ? (
        <button
          type="button"
          className="show-all"
          onClick={() => {
            setAll(true);
          }}
        >
          Show all {shown.length} levels
        </button>
      ) : null}
    </section>
  );
}

/**
 * The Dimensional Rift page: the power field and the answer to it first (how
 * high the typed power climbs in the chosen season at each reported share),
 * then the Rift's rules and caveats (the copy's mechanics topic) as
 * one-line callouts, then where the Rift opens, its seasons, the chosen season's levels with
 * their bracket entry powers, the reported boss and, with a power, the
 * reader's bracket, then the current decks played there and the record's
 * other findings about it. The power and the season live in the URL.
 *
 * @param props - the stage mode, its stage config, the search params, their setter and the moment to look from
 * @returns the page
 */
export function RiftView({ mode, stage, search, onSearch, now = new Date() }: RiftViewProps) {
  const sources = useSourceIndex();
  const brackets = useQuery(powerBracketsQuery());
  const chapters = useQuery(stageChaptersQuery());
  const unlocks = useQuery(riftUnlocksQuery());
  const levels = useQuery(riftLevelsQuery());
  const seasons = useQuery(riftSeasonsQuery());
  const bosses = useQuery(riftBossesQuery());
  const decks = useQuery({
    ...decksQuery(mode.scope, { current: true }),
    select: (list) => list.filter((d) => stage.rift.decks.includes(d.id)),
  });
  const typed = search.power ?? "";
  const power = parsePower(typed);
  return (
    <>
      <ViewHeader title={stage.rift.title} lede={stage.rift.lede} />
      <PowerField
        label="Team power in the Rift"
        value={typed}
        onChange={(value) => onSearch({ power: value })}
        power={power}
        shown={power === null ? null : formatPower(power)}
      />
      <QueryResult query={seasons} resource="Rift seasons">
        {(seasonRows) => {
          const current = seasonAt(seasonRows, now);
          const picked =
            search.season === undefined
              ? current?.season
              : seasonRows.find((s) => s.season === search.season);
          return (
            <QueryResult query={brackets} resource="power brackets">
              {(table) => (
                <QueryResult query={levels} resource="Rift levels">
                  {(levelRows) => (
                    <QueryResult query={bosses} resource="Rift bosses">
                      {(bossRows) => (
                        <>
                          {power === null ? (
                            <p className="reach-prompt">
                              Type your Rift power above to see how high you climb.
                            </p>
                          ) : (
                            <Reach
                              levels={levelsOf(levelRows, picked)}
                              bosses={bossRows}
                              brackets={table}
                              power={power}
                              shares={stage.reach}
                            />
                          )}
                          {stage.rift.topic ? (
                            <TopicNotes scope={mode.scope} topic={stage.rift.topic} />
                          ) : null}
                          <TocLayout
                            items={[
                              { id: PARTS.entry, label: "Getting in" },
                              { id: PARTS.seasons, label: "Seasons" },
                              { id: PARTS.levels, label: "Levels" },
                              { id: PARTS.decks, label: "Decks" },
                              { id: PARTS.findings, label: "Elsewhere in the record" },
                            ]}
                          >
                            <QueryResult query={chapters} resource="stage chapters">
                              {(rows) => (
                                <QueryResult query={unlocks} resource="the Rift's unlock">
                                  {(unlockRows) => (
                                    <Entry
                                      unlocks={unlockRows}
                                      chapters={rows}
                                      brackets={table}
                                      sources={sources}
                                    />
                                  )}
                                </QueryResult>
                              )}
                            </QueryResult>
                            <Seasons seasons={seasonRows} current={current} sources={sources} />
                            <Levels
                              levels={levelRows}
                              bosses={bossRows}
                              brackets={table}
                              power={power}
                              seasons={seasonRows}
                              season={picked}
                              onSeason={(season) => onSearch({ season: season ?? undefined })}
                              sources={sources}
                            />
                            <section id={PARTS.decks} aria-labelledby={`${PARTS.decks}-title`}>
                              <h3 id={`${PARTS.decks}-title`}>Decks played in the Rift</h3>
                              <QueryResult query={decks} resource="decks">
                                {(rows) =>
                                  rows.length ? (
                                    rows.map((d) => (
                                      <DeckCard key={d.id} deck={d} sources={sources} />
                                    ))
                                  ) : (
                                    <EmptyState>No Rift decks recorded yet.</EmptyState>
                                  )
                                }
                              </QueryResult>
                            </section>
                            <RiftFindings
                              mode={mode}
                              rift={stage.rift}
                              sources={sources}
                              id={PARTS.findings}
                            />
                          </TocLayout>
                        </>
                      )}
                    </QueryResult>
                  )}
                </QueryResult>
              )}
            </QueryResult>
          );
        }}
      </QueryResult>
    </>
  );
}
