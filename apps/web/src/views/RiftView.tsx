import { useQuery } from "@tanstack/react-query";
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
import { CookieName } from "../components/CookieName";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { PowerField } from "../components/PowerField";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { optionalInt } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { citedBy } from "../lib/sources";
import {
  bracketAt,
  entryPower,
  formatPower,
  nextBracket,
  parsePower,
  seasonAt,
} from "../lib/stage";
import { DeckCard } from "./DeckCard";
import { CopyHeader } from "./ModeViewHeader";
import { RiftFindings } from "./RiftFindings";
import type { PowerSearch } from "./StageBracketsView";
import { validatePowerSearch } from "./StageBracketsView";

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

/**
 * The instant's date, as the season table shows it.
 *
 * @param iso - an ISO 8601 instant
 * @returns its UTC date, `YYYY-MM-DD`
 */
const day = (iso: string) => iso.slice(0, 10);

/**
 * Where the Rift opens: the stored unlock, cited to its own sources, then,
 * when a stage chapter ends at that stage, its boss, recommended power and
 * the power its 35% bracket takes, cited to the chapter's sources.
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
    <section className="card" id={PARTS.entry}>
      <h3>Getting in</h3>
      {unlock ? (
        <p>
          The Rift opens after clearing <b>{unlock.stage}</b>.{" "}
          <SourceChips ids={unlock.sources} sources={sources} />
        </p>
      ) : (
        <p className="muted">No record states what opens the Rift.</p>
      )}
      {gate ? (
        <p>
          {gate.lastStage} (<CookieName kr={gate.bossKr} en={gate.bossEn} inline />
          ): {formatPower(gate.recommendedPower)} recommended
          {at35
            ? `, the 35% bracket from ${formatPower(entryPower(gate.recommendedPower, at35.minRatioPct))}`
            : ""}
          . <SourceChips ids={gate.sources} sources={sources} />
        </p>
      ) : null}
    </section>
  );
}

/**
 * The Rift's seasons: the levels each runs and its dates, the current one
 * (or the next, between seasons) marked.
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
    <section className="card" id={PARTS.seasons}>
      <h3>Seasons</h3>
      {shown ? (
        <p>
          Season {shown.season} {current.running ? "is running" : "starts next"}: levels{" "}
          {shown.firstLevel}–{shown.lastLevel},{" "}
          {current.running ? `until ${day(shown.endsAt)}` : `from ${day(shown.startsAt)}`} (UTC).
          {next
            ? ` Then season ${next.season}, levels ${next.firstLevel}–${next.lastLevel}, from ${day(next.startsAt)}.`
            : ""}
        </p>
      ) : (
        <p>No season is running or scheduled.</p>
      )}
      <p className="muted">
        Each season runs a range of levels; later seasons reuse the same range.{" "}
        <SourceChips ids={citedBy(seasons)} sources={sources} />
      </p>
      <details className="levels">
        <summary className="label">Every scheduled season</summary>
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
 * and 15% brackets take, the boss players report there, and, with a
 * power, the reader's bracket and the power the next one up takes.
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
  const shown = season
    ? levels.filter((l) => l.level >= season.firstLevel && l.level <= season.lastLevel)
    : levels;
  const reported = new Map<number, RiftBoss[]>();
  for (const boss of bosses) reported.set(boss.level, [...(reported.get(boss.level) ?? []), boss]);
  const columns: Column<RiftLevel>[] = [
    { header: "Level", cell: (l) => l.level, className: "n" },
    { header: "Recommended", cell: (l) => formatPower(l.recommendedPower), className: "n" },
    ...[35, 15].flatMap((share) => {
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
                <>
                  {at ? `${at.damagePct}%` : "–"}
                  {next ? (
                    <div className="muted">
                      {next.damagePct}% at{" "}
                      {formatPower(entryPower(l.recommendedPower, next.minRatioPct))}
                    </div>
                  ) : null}
                </>
              );
            },
            className: "n",
          },
        ]),
    {
      header: "Reported boss",
      cell: (l) =>
        (reported.get(l.level) ?? []).map((b) => (
          <div key={b.id}>
            <CookieName kr={b.bossKr} en={b.bossEn} inline />
            {b.note ? <div className="muted">{b.note}</div> : null}
            <SourceChips ids={b.sources} sources={sources} />
          </div>
        )),
      className: "wide",
    },
  ];
  return (
    <section className="card" id={PARTS.levels}>
      <h3>Levels</h3>
      <p className="muted">
        Recommended power per level from the game data; a bracket's entry power is its share of it,
        rounded up. Inside the Rift, compare with the power the Rift shows, which 차원의 힘
        inflates. <SourceChips ids={citedBy(levels)} sources={sources} />
      </p>
      <DataTable
        columns={columns}
        rows={shown}
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
          onChange: (value) => onSeason(value === "" ? undefined : Number(value)),
        }}
      />
    </section>
  );
}

/**
 * The Dimensional Rift page: the Rift's rules and caveats (the copy's
 * mechanics topic), where it opens, its seasons, every level of the chosen
 * season with its bracket entry powers, the reported boss and, with a
 * power typed in, the reader's bracket, then the current decks played there and
 * the record's other findings about it. The power and the season live in
 * the URL.
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
      <CopyHeader scope={mode.scope} copy={stage.rift} fallbackTitle="Dimensional Rift" />
      <TocLayout
        items={[
          { id: PARTS.entry, label: "Getting in" },
          { id: PARTS.seasons, label: "Seasons" },
          { id: PARTS.levels, label: "Levels" },
          { id: PARTS.decks, label: "Decks" },
          { id: PARTS.findings, label: "Elsewhere in the record" },
        ]}
      >
        <QueryResult query={brackets} resource="power brackets">
          {(table) => (
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
          )}
        </QueryResult>
        <QueryResult query={seasons} resource="Rift seasons">
          {(seasonRows) => {
            const current = seasonAt(seasonRows, now);
            const picked =
              search.season === undefined
                ? current?.season
                : seasonRows.find((s) => s.season === search.season);
            return (
              <>
                <Seasons seasons={seasonRows} current={current} sources={sources} />
                <PowerField
                  label="Team power in the Rift"
                  value={typed}
                  onChange={(value) => onSearch({ power: value })}
                  power={power}
                  shown={power === null ? null : formatPower(power)}
                />
                <QueryResult query={brackets} resource="power brackets">
                  {(table) => (
                    <QueryResult query={levels} resource="Rift levels">
                      {(levelRows) => (
                        <QueryResult query={bosses} resource="Rift bosses">
                          {(bossRows) => (
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
                          )}
                        </QueryResult>
                      )}
                    </QueryResult>
                  )}
                </QueryResult>
              </>
            );
          }}
        </QueryResult>
        <section id={PARTS.decks}>
          <h3>Decks played in the Rift</h3>
          <QueryResult query={decks} resource="decks">
            {(rows) =>
              rows.length ? (
                rows.map((d) => <DeckCard key={d.id} deck={d} sources={sources} />)
              ) : (
                <EmptyState>No Rift decks recorded yet.</EmptyState>
              )
            }
          </QueryResult>
        </section>
        <RiftFindings mode={mode} rift={stage.rift} sources={sources} id={PARTS.findings} />
      </TocLayout>
    </>
  );
}
