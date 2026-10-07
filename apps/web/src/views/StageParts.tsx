import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { ModeSection } from "../app/modes";
import { Pill } from "../components/Pill";
import type { LifecycleDeck } from "../lib/obsolete";
import { isCurrent } from "../lib/obsolete";
import { bracketStep, compactPower, formatPower, shortDeckName } from "../lib/stage";
import { deckId } from "./DeckCard";
import { deckPage } from "./DeckLink";

/**
 * A kept-damage share as a tag tinted by its step of the bracket scale, so
 * the stage screens read the bracket by colour before the number.
 *
 * @param props - the share, in %, and an optional suffix after the number
 * @returns the tag
 */
export function BracketTag({ pct, children }: { pct: number; children?: ReactNode }) {
  return (
    <span className={`bk bk-${bracketStep(pct)}`}>
      {pct}%{children}
    </span>
  );
}

/**
 * An attempt's result as a verdict pill: cleared or failed.
 *
 * @param props - the result
 * @returns the pill
 */
export function ResultPill({ result }: { result: "clear" | "fail" }) {
  return result === "clear" ? <Pill kind="good">Cleared</Pill> : <Pill kind="avoid">Failed</Pill>;
}

/**
 * What backs an attempt as a pill: a screenshot or video shows it, text only claims it.
 *
 * @param props - the evidence kind
 * @returns the pill
 */
export function EvidencePill({ evidence }: { evidence: string }) {
  return evidence === "text" ? (
    <Pill kind="claimed">text only</Pill>
  ) : (
    <Pill kind="verified">{evidence}</Pill>
  );
}

/**
 * A row's place in a ranking: `#1` large and marked as the best.
 *
 * @param props - the 1-based place, or null for a row outside the ranking
 * @returns the badge, or a dash
 */
export function Rank({ n }: { n: number | null }) {
  if (n === null) return <span className="st-rank-none">–</span>;
  return <span className={n === 1 ? "st-rank r1" : "st-rank"}>#{n}</span>;
}

/**
 * A posted team power the short way, the post's own wording in the tooltip,
 * with the recommended power it faced under it when known.
 *
 * @param props - the power as posted, its figure in G, and the recommended power
 * @returns the cell's content
 */
export function PowerCell({
  posted,
  powerG,
  recommended,
  children,
}: {
  posted: string;
  powerG: number | null;
  recommended?: number | null;
  children?: ReactNode;
}) {
  const short = compactPower(posted, powerG);
  return (
    <span className="pw">
      <b title={posted === short ? undefined : posted}>{short}</b>
      {recommended ? <span className="pw-of">of {formatPower(recommended)}</span> : null}
      {children}
    </span>
  );
}

/**
 * A link to a deck's card on its mode's teams page, named short (the full
 * name in the tooltip), with an "obsolete" pill when the deck is obsolete.
 *
 * @param props - the mode, the deck's id, the deck once loaded, and a hash target on this page instead of the teams page
 * @returns the link
 */
export function ShortDeckLink({
  mode,
  id,
  deck,
  local = false,
}: {
  mode: Pick<ModeSection, "id" | "tabs">;
  id: string;
  deck: LifecycleDeck | undefined;
  local?: boolean;
}) {
  const full = deck?.nameEn ?? id;
  const name = shortDeckName(full);
  const title = name === full ? undefined : full;
  return (
    <span className="deck-link">
      {local ? (
        <a href={`#${deckId({ id })}`} title={title}>
          {name}
        </a>
      ) : (
        <Link {...deckPage(mode)} hash={deckId({ id })} title={title}>
          {name}
        </Link>
      )}
      {deck && !isCurrent(deck) ? (
        <>
          {" "}
          <Pill kind="obsolete" />
        </>
      ) : null}
    </span>
  );
}

/** One tile of a {@link ReachTiles} answer. */
export interface ReachTile {
  /** The kept-damage share the tile is for. */
  share: number;
  /** How far the share reaches: a stage, a level, or a dash. */
  value: ReactNode;
  /** A line under it: the boss there, or why it stops. */
  sub?: ReactNode;
  /** Whether the share reaches nothing. */
  none?: boolean;
}

/**
 * The calculators' answer, first and large: one tile per kept-damage share,
 * each with the furthest stage or level the reader keeps it to.
 *
 * @param props - the heading (the reader's power), the tiles and the region's name
 * @returns the answer card
 */
export function ReachTiles({
  heading,
  tiles,
  label,
}: {
  heading: ReactNode;
  tiles: readonly ReachTile[];
  label: string;
}) {
  return (
    <section className="reach-card" aria-label={label}>
      <h3>{heading}</h3>
      <ol className="reach-tiles">
        {tiles.map((t) => (
          <li key={t.share} className={t.none ? "reach-tile none" : "reach-tile"}>
            <BracketTag pct={t.share}>+</BracketTag>
            <span className="reach-value">{t.value}</span>
            {t.sub ? <span className="reach-sub">{t.sub}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
