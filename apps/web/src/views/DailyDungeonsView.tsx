import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { dailyDungeonClearsQuery, dailyDungeonsQuery, decksQuery } from "../api/queries";
import type { DailyDungeon, DailyDungeonClear, Deck } from "../api/types";
import type { DailyConfig, ModeSection } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { initials } from "../lib/cookie-icons";
import { elementKey, factVerdict, pickDungeon, rankDecks, splitHero } from "../lib/daily-dungeon";
import { optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { ClearList, HeroDeck, RankedDecks } from "./DailyDungeonDecks";
import { CopyHeader } from "./ModeViewHeader";

/** The board's search params: the dungeon shown, by slug. */
export interface DailySearch {
  dungeon?: string;
}

/**
 * Reads the board's search params.
 *
 * @param search - the decoded query values
 * @returns the dungeon's slug, dropped when it isn't a non-empty text
 */
export function validateDailySearch(search: Record<string, unknown>): DailySearch {
  return { dungeon: optionalText(search.dungeon) };
}

/** Props for {@link DailyDungeonsView}. */
export interface DailyDungeonsViewProps {
  /** The daily dungeon mode. */
  mode: ModeSection;
  /** Its board config. */
  daily: DailyConfig;
  /** The current search params. */
  search: DailySearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: DailySearch) => void;
}

/** Props for {@link DungeonTabs}. */
interface DungeonTabsProps {
  /** The dungeons, in the record's order. */
  dungeons: readonly DailyDungeon[];
  /** The shown dungeon's slug. */
  shown: string;
  /** Shows the dungeon with the slug given. */
  onPick: (slug: string) => void;
}

/**
 * The dungeon switcher: a tab per dungeon with its badge, its name and its
 * top stage, the shown one marked.
 *
 * @param props - the dungeons, the shown one's slug, and what picking one does
 * @returns the tab row
 */
function DungeonTabs({ dungeons, shown, onPick }: DungeonTabsProps) {
  return (
    <div className="dd-tabs" role="tablist" aria-label="Dungeon">
      {dungeons.map((d) => {
        const selected = d.slug === shown;
        return (
          <button
            key={d.slug}
            type="button"
            role="tab"
            id={`dd-tab-${d.slug}`}
            aria-selected={selected}
            aria-controls="dd-panel"
            className={selected ? "dd-tab active" : "dd-tab"}
            onClick={() => {
              onPick(d.slug);
            }}
          >
            <span
              className={`dd-badge el-${elementKey(d.bossElement) ?? "none"}`}
              aria-hidden="true"
            >
              {initials(d.nameEn)}
            </span>
            <span className="dd-tab-name">{d.nameEn}</span>
            {d.topStage !== null ? (
              <span className="dd-tab-top" title="Top stage found">
                {d.topStage}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** A yes/no/unknown fact's glyph. */
const VERDICT_GLYPH = { yes: "✓", no: "✕", unknown: "?" } as const;

/**
 * One yes/no fact as a chip: its glyph and colour give the answer before its label.
 *
 * @param props - the label and the fact, `null` when unknown
 * @returns the chip
 */
function FactChip({ label, value }: { label: string; value: boolean | null }) {
  const verdict = factVerdict(value);
  return (
    <span className={`chip dd-fact ${verdict}`} title={`${label}: ${verdict}`}>
      <span aria-hidden="true">{VERDICT_GLYPH[verdict]}</span> {label}
    </span>
  );
}

/**
 * A dungeon's facts as chip rows: the boss (element, weakness, rotation),
 * the entry (keys, ticket back on a loss, quick clear), the drops and the
 * top stage found with its source; then the record's notes, each cut to a line.
 *
 * @param props - the dungeon and the source index
 * @returns the facts
 */
function DungeonFacts({ dungeon: d, sources }: { dungeon: DailyDungeon; sources: SourceIndex }) {
  const element = elementKey(d.bossElement);
  const weakness = elementKey(d.bossWeakness);
  const notes = [d.entryNote, d.bossRotation, ...d.notes].filter((n): n is string => !!n);
  return (
    <div className="dd-facts">
      <div className="dd-fact-row">
        <span className="label">Boss</span>
        {(d.bossEn ?? d.bossKr) ? (
          <span className="chip" title={d.bossKr ?? ""}>
            {d.bossEn ?? d.bossKr}
          </span>
        ) : null}
        <span className={`chip dd-el el-${element ?? "none"}`} title="Boss element">
          {d.bossElement ?? "Element ?"}
        </span>
        <span
          className={`chip dd-el${d.bossWeakness ? " weak" : ""} el-${weakness ?? "none"}`}
          title="Weak to"
        >
          Weak: {d.bossWeakness ?? "?"}
        </span>
        <span className="chip dd-rotation" title="Whether the boss or its element changes">
          {d.bossRotates === null ? "Rotation ?" : d.bossRotates ? "↻ Rotates" : "Fixed boss"}
        </span>
      </div>
      <div className="dd-fact-row">
        <span className="label">Entry</span>
        {d.entryKeys ? <span className="chip">{d.entryKeys}</span> : null}
        <FactChip label="Ticket back on loss" value={d.ticketBackOnLoss} />
        <FactChip label="Quick clear" value={d.quickClear} />
      </div>
      <div className="dd-fact-row">
        <span className="label">Drops</span>
        {d.drops.length ? (
          d.drops.map((drop) => (
            <span key={drop} className="chip">
              {drop}
            </span>
          ))
        ) : (
          <span className="chip">?</span>
        )}
        {d.topStage !== null ? (
          <span className="chip dd-top" title="Highest stage the record found cleared">
            Top {d.topStage}
            {d.topStageDate ? ` · ${d.topStageDate}` : ""}
          </span>
        ) : null}
        <SourceChips ids={d.topStageSource ? [d.topStageSource] : []} sources={sources} />
      </div>
      {notes.length ? (
        <ul className="clean dd-notes">
          {notes.map((note, i) => (
            <li key={i}>
              <Clamp lines={1}>{note}</Clamp>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * The shown dungeon's panel: its name and sources, its facts, the best
 * full-auto deck, the other decks by stage, and the documented clears.
 *
 * @param props - the dungeon, the mode's decks and clears, and the board
 * @returns the panel
 */
function DungeonPanel({
  dungeon,
  decks,
  clears,
  mode,
  daily,
  sources,
}: {
  dungeon: DailyDungeon;
  decks: readonly Deck[];
  clears: readonly DailyDungeonClear[];
  mode: ModeSection;
  daily: DailyConfig;
  sources: SourceIndex;
}) {
  const { hero, rest } = splitHero(rankDecks(decks, dungeon.slug));
  const byId = new Map(decks.map((d) => [d.id, d]));
  const board = { mode, daily, sources };
  return (
    <section
      id="dd-panel"
      className="dd-panel"
      role="tabpanel"
      aria-labelledby={`dd-tab-${dungeon.slug}`}
    >
      <div className="dd-panel-head">
        <h3>
          {dungeon.nameEn} <span className="kr">{dungeon.nameKr ?? ""}</span>
        </h3>
        <SourceChips ids={dungeon.sources} sources={sources} max={2} />
      </div>
      <DungeonFacts dungeon={dungeon} sources={sources} />
      <HeroDeck deck={hero} {...board} />
      <RankedDecks decks={rest} {...board} />
      <ClearList
        clears={clears.filter((c) => c.dungeon === dungeon.slug)}
        decks={byId}
        {...board}
      />
    </section>
  );
}

/**
 * The daily dungeon board: a switcher over the dungeons, then the shown
 * dungeon's facts, its best full-auto deck as the hero, its other decks
 * ranked by stage reached and its documented clears. The dungeon shown
 * lives in the URL (`?dungeon=`); without one, the record's first.
 *
 * @param props - the mode, its board config, the search params and their setter
 * @returns the board
 */
export function DailyDungeonsView({ mode, daily, search, onSearch }: DailyDungeonsViewProps) {
  const sources = useSourceIndex();
  const dungeons = useQuery(dailyDungeonsQuery());
  const decks = useQuery(decksQuery(mode.scope));
  const clears = useQuery(dailyDungeonClearsQuery());
  return (
    <>
      <CopyHeader scope={mode.scope} copy={daily.board} fallbackTitle="Daily dungeons" />
      <QueryResult query={dungeons} resource="daily dungeons">
        {(rows) => {
          const shown = pickDungeon(rows, search.dungeon);
          if (!shown) return <EmptyState>No daily dungeons recorded yet.</EmptyState>;
          return (
            <>
              <DungeonTabs
                dungeons={rows}
                shown={shown.slug}
                onPick={(slug) => {
                  onSearch({ dungeon: slug });
                }}
              />
              <QueryResult query={decks} resource="decks">
                {(deckRows) => (
                  <QueryResult query={clears} resource="clears">
                    {(clearRows) => (
                      <DungeonPanel
                        dungeon={shown}
                        decks={deckRows}
                        clears={clearRows}
                        mode={mode}
                        daily={daily}
                        sources={sources}
                      />
                    )}
                  </QueryResult>
                )}
              </QueryResult>
            </>
          );
        }}
      </QueryResult>
    </>
  );
}
