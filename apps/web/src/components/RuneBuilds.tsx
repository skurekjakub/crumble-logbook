import type { ReactNode } from "react";
import type { SourceIndex } from "../lib/sources";
import { stance } from "../lib/verdict";
import { Clamp } from "./Clamp";
import { CookieName } from "./CookieName";
import { Pill } from "./Pill";
import { SourceChips } from "./SourceChips";

/** One rune build; `/api/rune-builds` rows fit as they are. */
export interface RuneBuildLike {
  id: number;
  cookieKr: string;
  en: string | null;
  lines: string;
  why: string;
  disputed: string | null;
  decks: readonly string[];
  sources: readonly string[];
}

/** Props for {@link RuneCard}. */
export interface RuneCardProps {
  build: RuneBuildLike;
  /** Id → URL/title for the source chips. */
  sources: SourceIndex;
  /** The cookie name's heading level: 3 under a view's `<h2>`, 4 inside a titled section. */
  headingLevel: 3 | 4;
  /** When given, lists the build's decks by this name. */
  deckName?: (id: string) => string;
  /** Cited notes about this cookie, shown after the dispute. */
  children?: ReactNode;
}

/**
 * The verdict pill of a recommendation: "recommended", or "avoid" when its
 * wording says to stay away (see {@link stance}).
 *
 * @param props - the recommendation's text
 * @returns the pill
 */
export function StancePill({ text }: { text: string }) {
  return stance(text) === "avoid" ? (
    <Pill kind="avoid">avoid</Pill>
  ) : (
    <Pill kind="good">recommended</Pill>
  );
}

/**
 * One cookie's rune build as a card, verdict first: the portrait and name
 * with the recommended or avoid pill (and "disputed" when posters
 * disagree), then the rune lines, the reason and any disputed view each
 * cut short, the decks, extra notes, and the sources last.
 *
 * @param props - the build, the source index, the heading level, the deck namer and extra notes
 * @returns the card
 */
export function RuneCard({ build, sources, headingLevel, deckName, children }: RuneCardProps) {
  const H = headingLevel === 3 ? "h3" : "h4";
  return (
    <article className="card rune-card">
      <div className="card-head rune-head">
        <H>
          <CookieName kr={build.cookieKr} en={build.en} size={40} />
        </H>
        <span className="chips">
          <StancePill text={build.lines} />
          {build.disputed ? <Pill kind="disputed" /> : null}
        </span>
      </div>
      <div className="rune-lines">
        <span className="k">Runes</span>
        <span className="v">{build.lines}</span>
      </div>
      <div className="rune-why">
        <Clamp lines={2}>{build.why}</Clamp>
      </div>
      {build.disputed ? (
        <div className="rune-dispute muted">
          <Clamp lines={1} length={build.disputed.length + 10}>
            <b>Disputed:</b> {build.disputed}
          </Clamp>
        </div>
      ) : null}
      {deckName && build.decks.length ? (
        // One item per deck: a deck's own name can hold a comma ("Cherry deck, Herb version").
        <ul className="rune-decks" aria-label="Decks">
          {build.decks.map((id) => (
            <li key={id}>{deckName(id)}</li>
          ))}
        </ul>
      ) : null}
      {children}
      <div className="card-foot">
        <SourceChips ids={build.sources} sources={sources} />
      </div>
    </article>
  );
}
