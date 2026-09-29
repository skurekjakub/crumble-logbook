import { Link } from "@tanstack/react-router";
import type { LinkTarget, ModeSection } from "../app/modes";
import { modeLink } from "../app/modes";
import { Pill } from "../components/Pill";
import type { LifecycleDeck } from "../lib/obsolete";
import { isCurrent } from "../lib/obsolete";
import { deckId } from "./DeckCard";

/** The tab ids a mode's decks page goes by. */
const DECK_TABS: readonly string[] = ["decks", "teams"];

/**
 * The page that holds a mode's deck cards: the mode's decks or teams tab.
 *
 * @param mode - the mode
 * @returns the page's link target
 */
export function deckPage(mode: Pick<ModeSection, "id" | "tabs">): LinkTarget {
  return (
    mode.tabs.find((tab) => DECK_TABS.includes(tab.id))?.link ?? modeLink(mode.id, "/$mode/teams")
  );
}

/** Props for {@link DeckLink}. */
export interface DeckLinkProps {
  /** The mode whose decks page holds the deck's card. */
  mode: Pick<ModeSection, "id" | "tabs">;
  /** The deck's id. */
  id: string;
  /** The deck, once the mode's decks load; its id names it before then. */
  deck: LifecycleDeck | undefined;
}

/**
 * A link to a deck's card on its mode's decks page, named by the deck's
 * English name, with an "obsolete" pill beside it when the deck is obsolete.
 *
 * @param props - the mode, the deck's id and the deck
 * @returns the link
 */
export function DeckLink({ mode, id, deck }: DeckLinkProps) {
  return (
    <span className="deck-link">
      <Link {...deckPage(mode)} hash={deckId({ id })}>
        {deck?.nameEn ?? id}
      </Link>
      <ObsoletePill deck={deck} />
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
      <ObsoletePill deck={deck} />
    </>
  );
}

/**
 * The "obsolete" pill that follows a deck's name, when the deck is obsolete.
 *
 * @param props - the deck, when loaded
 * @returns the pill after a space, or null for a current or unloaded deck
 */
function ObsoletePill({ deck }: { deck: LifecycleDeck | undefined }) {
  if (!deck || isCurrent(deck)) return null;
  return (
    <>
      {" "}
      <Pill kind="obsolete" />
    </>
  );
}
