import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useId } from "react";
import { useSourceIndex } from "../api/hooks";
import { decksQuery, gearRecsQuery, runeBuildsQuery } from "../api/queries";
import type { Deck, DeckCookie, GearRec, RuneBuild } from "../api/types";
import type { ModeSection } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { CookieName } from "../components/CookieName";
import { EmptyState } from "../components/EmptyState";
import { Formation, hasFormation } from "../components/Formation";
import { GearBoard, generalGear } from "../components/GearBoard";
import { Lineup } from "../components/Lineup";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { StancePill } from "../components/RuneBuilds";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { leadDeck, runesFor } from "../lib/best-setup";
import { CURATED } from "../lib/curated";
import { isCurrent } from "../lib/obsolete";
import type { SourceIndex } from "../lib/sources";
import { deckId, withCaptain } from "./DeckCard";
import { deckPage } from "./DeckLink";
import { ModeViewHeader } from "./ModeViewHeader";

/** One deck shown on the page, with the tag that sets it apart (the Rift's), if any. */
interface SetupBlock {
  deck: Deck;
  /** A chip after the deck's tier, e.g. "Dimensional Rift"; null for the lead deck. */
  tag: string | null;
}

/**
 * The DOM id of a deck's block on the page, which its "On this page" link targets.
 *
 * @param deck - the deck
 * @returns `setup-<id>`
 */
const blockId = (deck: Pick<Deck, "id">) => `setup-${deck.id}`;

/**
 * One rune build of a deck's cookie as a row, verdict first: the cookie,
 * the recommended or avoid pill, the rune lines, the why cut to one line,
 * and the sources last.
 *
 * @param props - the build and the source index
 * @returns the row
 */
function RuneRow({ build, sources }: { build: RuneBuild; sources: SourceIndex }) {
  return (
    <li className="setup-rune">
      <CookieName kr={build.cookieKr} en={build.en} />
      <StancePill text={build.lines} />
      <span className="setup-rune-body">
        <span className="setup-rune-lines" {...CURATED}>
          {build.lines}
        </span>
        <span className="setup-rune-why muted" {...CURATED}>
          <Clamp lines={1} perLine={60}>
            {build.why}
          </Clamp>
        </span>
      </span>
      <SourceChips ids={build.sources} sources={sources} max={2} />
    </li>
  );
}

/**
 * The muted row of a deck's cookie that has no rune build for the deck or
 * for every deck.
 *
 * @param props - the cookie
 * @returns the row
 */
function NoRuneRow({ cookie }: { cookie: DeckCookie }) {
  return (
    <li className="setup-rune none">
      <CookieName kr={cookie.cookieKr} en={cookie.en} />
      <span className="muted">No build recorded</span>
    </li>
  );
}

/**
 * A deck's sugar runes, one cookie after another: each cookie's builds
 * linked to the deck, else its builds for every deck, else a muted row.
 * A mode with a cap lists only that many of the deck's first cookies and
 * says how many more the deck's card holds.
 *
 * @param props - the deck, the mode's current rune builds, the cap and the source index
 * @returns the section
 */
function DeckRunes({
  deck,
  builds,
  cap,
  sources,
}: {
  deck: Deck;
  builds: readonly RuneBuild[];
  cap: number | null;
  sources: SourceIndex;
}) {
  const id = useId();
  const cookies = cap === null ? deck.cookies : deck.cookies.slice(0, cap);
  const more = deck.cookies.length - cookies.length;
  return (
    <section className="setup-part">
      <h4 id={id}>Sugar runes</h4>
      <ul className="setup-runes" aria-labelledby={id}>
        {cookies.map((c) => {
          const own = runesFor(c, deck.id, builds);
          return own.length ? (
            own.map((b) => <RuneRow key={`${c.id}-${b.id}`} build={b} sources={sources} />)
          ) : (
            <NoRuneRow key={c.id} cookie={c} />
          );
        })}
      </ul>
      {more > 0 ? <p className="muted">{more} more on the deck's card.</p> : null}
    </section>
  );
}

/**
 * The mode's current gear board, as its Gear tab shows it, with a link to
 * the tab for the notes off the board.
 *
 * @param props - the mode, its current gear rows and the source index
 * @returns the section
 */
function SetupGear({
  mode,
  gear,
  sources,
}: {
  mode: ModeSection;
  gear: readonly GearRec[];
  sources: SourceIndex;
}) {
  const id = useId();
  const tab = mode.tabs.find((t) => t.id === "gear");
  const onBoard = gear.length > generalGear(gear).length;
  return (
    <section className="setup-part" aria-labelledby={id}>
      <div className="setup-part-head">
        <h4 id={id}>Gear</h4>
        {tab ? <Link {...tab.link}>All gear notes</Link> : null}
      </div>
      {onBoard ? (
        <GearBoard gear={gear} sources={sources} primary={mode.boss?.gearContext ?? null} />
      ) : (
        <EmptyState>No gear recorded yet.</EmptyState>
      )}
    </section>
  );
}

/**
 * The mode's gear section inside the gear query's loading and error states.
 *
 * @param props - the mode, its current gear query and the source index
 * @returns the section, or the query's state
 */
function GearPart({
  mode,
  gear,
  sources,
}: {
  mode: ModeSection;
  gear: UseQueryResult<GearRec[]>;
  sources: SourceIndex;
}) {
  return (
    <QueryResult query={gear} resource="gear recommendations">
      {(rows) => <SetupGear mode={mode} gear={rows} sources={sources} />}
    </QueryResult>
  );
}

/**
 * One deck's block: its name, tier, ceiling and tag, its formation (or
 * lineup), a link to its full card for the levels and why, then the gear
 * when the block carries it, then the runes per cookie.
 *
 * @param props - the block, the mode, its current rune builds and gear (null when the block carries none), and the source index
 * @returns the block
 */
function DeckBlock({
  block: { deck, tag },
  mode,
  runes,
  gear,
  sources,
}: {
  block: SetupBlock;
  mode: ModeSection;
  runes: UseQueryResult<RuneBuild[]>;
  gear: UseQueryResult<GearRec[]> | null;
  sources: SourceIndex;
}) {
  const cookies = withCaptain(deck);
  const titleId = `${blockId(deck)}-title`;
  return (
    <section className="card setup-block" id={blockId(deck)} aria-labelledby={titleId}>
      <div className="setup-head">
        <h3 id={titleId} title={deck.nameKr ?? undefined}>
          {deck.nameEn}
        </h3>
        <span className="chips">
          <Pill kind={deck.status} />
          {tag ? <span className="chip setup-tag">{tag}</span> : null}
          {deck.ceilingText ? (
            <span className="chip ceiling">ceiling {deck.ceilingText}</span>
          ) : null}
        </span>
      </div>
      {hasFormation(cookies) ? <Formation cookies={cookies} /> : <Lineup cookies={cookies} />}
      <Link {...deckPage(mode)} hash={deckId(deck)} className="setup-card-link">
        Levels and why
      </Link>
      {gear ? <GearPart mode={mode} gear={gear} sources={sources} /> : null}
      <QueryResult query={runes} resource="rune builds">
        {(rows) => (
          <DeckRunes
            deck={deck}
            builds={rows}
            cap={mode.dungeon?.setupRunes ?? null}
            sources={sources}
          />
        )}
      </QueryResult>
    </section>
  );
}

/**
 * A mode's Best setup, its landing page: the deck to run (the first
 * current `meta` deck by the record's position), the mode's gear, and each
 * of the deck's cookies' runes. The stage mode adds a block per deck its
 * Rift config names, with an "On this page" list across the blocks.
 *
 * @param props - the mode whose decks, runes, gear and copy the page shows
 * @returns the page
 */
export function BestSetupView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const decks = useQuery(decksQuery(mode.scope));
  const runes = useQuery(runeBuildsQuery(mode.scope, undefined, { current: true }));
  const gear = useQuery(gearRecsQuery(mode.scope, { current: true }));
  const rift = mode.stage?.rift ?? null;
  return (
    <>
      <ModeViewHeader mode={mode} view="setup" fallbackTitle="Best setup" />
      <QueryResult query={decks} resource="decks">
        {(rows) => {
          const lead = leadDeck(rows, rift?.decks ?? []);
          const riftBlocks = (rift?.decks ?? []).flatMap((id) => {
            const d = rows.find((r) => r.id === id && isCurrent(r));
            return d ? [{ deck: d, tag: rift!.title }] : [];
          });
          const blocks: SetupBlock[] = [
            ...(lead ? [{ deck: lead, tag: null }] : []),
            ...riftBlocks,
          ];
          return (
            <>
              {lead ? null : (
                <>
                  <EmptyState>No current meta deck recorded yet.</EmptyState>
                  <GearPart mode={mode} gear={gear} sources={sources} />
                </>
              )}
              <TocLayout items={blocks.map((b) => ({ id: blockId(b.deck), label: b.deck.nameEn }))}>
                {blocks.map((b) => (
                  <DeckBlock
                    key={b.deck.id}
                    block={b}
                    mode={mode}
                    runes={runes}
                    gear={b.deck === lead ? gear : null}
                    sources={sources}
                  />
                ))}
              </TocLayout>
            </>
          );
        }}
      </QueryResult>
    </>
  );
}
