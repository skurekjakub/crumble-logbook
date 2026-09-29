import { Link } from "@tanstack/react-router";
import { modeLink } from "../app/modes";
import { Pill } from "../components/Pill";
import type { LifecycleDeck } from "../lib/obsolete";
import { isCurrent } from "../lib/obsolete";
import { deckId } from "./DeckCard";

/** Props for {@link DeckLink}. */
export interface DeckLinkProps {
  /** The mode whose teams page holds the deck's card. */
  mode: string;
  /** The deck's id. */
  id: string;
  /** The deck, once the mode's decks load; its id names it before then. */
  deck: LifecycleDeck | undefined;
}

/**
 * A link to a deck's card on its mode's teams page, named by the deck's
 * English name, with an "obsolete" pill beside it when the deck is obsolete.
 *
 * @param props - the mode, the deck's id and the deck
 * @returns the link
 */
export function DeckLink({ mode, id, deck }: DeckLinkProps) {
  return (
    <span className="deck-link">
      <Link {...modeLink(mode, "/$mode/teams")} hash={deckId({ id })}>
        {deck?.nameEn ?? id}
      </Link>
      {deck && !isCurrent(deck) ? (
        <>
          {" "}
          <Pill kind="obsolete" />
        </>
      ) : null}
    </span>
  );
}

/**
 * A deck's name as plain text, with an "obsolete" pill beside it when the
 * deck is obsolete, for a row that names a deck without linking it.
 *
 * @param props - the deck's id and the deck
 * @returns the name
 */
export function DeckName({ id, deck }: Omit<DeckLinkProps, "mode">) {
  return (
    <>
      {deck?.nameEn ?? id}
      {deck && !isCurrent(deck) ? (
        <>
          {" "}
          <Pill kind="obsolete" />
        </>
      ) : null}
    </>
  );
}
