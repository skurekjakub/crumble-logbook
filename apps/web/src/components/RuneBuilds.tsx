import type { ReactNode } from "react";
import type { SourceIndex } from "../lib/sources";
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
 * One cookie's rune build as a card: the reason first, as the card's main
 * text, then the rune lines, any disputed view, the decks, extra notes and
 * the sources.
 */
export function RuneCard({ build, sources, headingLevel, deckName, children }: RuneCardProps) {
  const H = headingLevel === 3 ? "h3" : "h4";
  return (
    <article className="card rune-card">
      <div className="card-head">
        <H>
          <CookieName kr={build.cookieKr} en={build.en} />
        </H>
        {build.disputed ? <Pill kind="disputed" /> : null}
      </div>
      <p className="rune-why">{build.why}</p>
      <div className="rune-lines">
        <span className="k">Runes</span>
        <span>{build.lines}</span>
      </div>
      {build.disputed ? (
        <div className="muted">
          <b>Disputed:</b> {build.disputed}
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
      <SourceChips ids={build.sources} sources={sources} />
    </article>
  );
}
