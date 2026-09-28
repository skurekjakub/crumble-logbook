import type { BossConfig } from "../../app/modes";
import type { SourceIndex } from "../../lib/sources";
import { AtkOrder } from "../AtkOrder";
import { EmptyState } from "../EmptyState";
import { SourceChips } from "../SourceChips";
import type { MechanicLike } from "./notes";
import { FactNote } from "./notes";

/** A Korean name with its English gloss, or `en: null` when unresolved. */
interface NameRefLike {
  kr: string;
  en: string | null;
}

/** What the ATK-order check reads of a deck; `/api/decks` rows fit as they are. */
export interface AtkDeckLike {
  atkOrder: readonly NameRefLike[] | null;
  atkOrderNote: string | null;
  cookies: readonly { cookieKr: string; en: string | null; levelRule: string | null }[];
  pets: readonly NameRefLike[];
  sources: readonly string[];
}

/** Props for {@link AtkCheck}. */
export interface AtkCheckProps {
  /** The boss screen's config; names the catcher and the ATK-order pet. */
  boss: BossConfig;
  /** The deck whose ATK order is checked. */
  deck: AtkDeckLike;
  /** The pet's cited in-battle notes. */
  petNotes: readonly MechanicLike[];
  /** Id → URL/title for the source chips. */
  sources: SourceIndex;
}

/**
 * The deck's ATK-order chain and the in-battle checklist: the catcher sits
 * just under the last ranked cookie once the pet's bonus is added, every
 * ranked cookie sits above the catcher, and the check happens in battle,
 * with the pet's cited notes.
 *
 * @param props - the boss config, the deck, the pet's notes, and the source index
 * @returns the chain and the checklist, or an empty state when the deck has no ATK order
 */
export function AtkCheck({ boss, deck, petNotes, sources }: AtkCheckProps) {
  const order = deck.atkOrder ?? [];
  const catcher = deck.cookies.find((c) => c.cookieKr === boss.catcherKr);
  const catcherName = catcher ? (catcher.en ?? catcher.cookieKr) : null;
  const last = order.at(-1);
  const pet = deck.pets.find((p) => p.kr === boss.atkPetKr);
  const petName = pet ? (pet.en ?? pet.kr) : "the pet";

  if (!order.length) return <EmptyState>No ATK order recorded for this deck yet.</EmptyState>;
  return (
    <>
      <AtkOrder order={order} />
      {deck.atkOrderNote ? <div className="muted">{deck.atkOrderNote}</div> : null}
      <ul className="clean boss-check">
        {catcher && last ? (
          <li>
            {catcherName} stays below {last.en ?? last.kr} once {petName}'s in-battle ATK bonus is
            added.
            {catcher.levelRule ? <div className="muted">{catcher.levelRule}</div> : null}
          </li>
        ) : null}
        {catcher ? (
          <li>
            All {order.length} cookies in the ATK order sit above {catcherName}.
          </li>
        ) : null}
        <li>
          Check the order in battle, not in the lobby.
          {pet ? petNotes.map((m) => <FactNote key={m.id} m={m} sources={sources} />) : null}
        </li>
      </ul>
      <SourceChips ids={deck.sources} sources={sources} />
    </>
  );
}
