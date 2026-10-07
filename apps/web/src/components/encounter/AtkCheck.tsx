import type { ReactNode } from "react";
import type { BossConfig } from "../../app/modes";
import type { CheckState } from "../../lib/atk-check";
import { catcherCheck, petCheck, rankedAbove } from "../../lib/atk-check";
import type { SourceIndex } from "../../lib/sources";
import { AtkOrder } from "../AtkOrder";
import { Clamp } from "../Clamp";
import { CookieName } from "../CookieName";
import { EmptyState } from "../EmptyState";
import { Pill } from "../Pill";
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

/** Each check state's pill. */
const STATE_PILL = {
  pass: <Pill kind="good">pass</Pill>,
  fail: <Pill kind="avoid">fail</Pill>,
  unknown: <Pill kind="medium">unknown</Pill>,
} as const satisfies Record<CheckState, ReactNode>;

/**
 * One line of the checklist: its state pill first, then what it checks,
 * then any note under it.
 *
 * @param props - the check's pill, its text and its note
 * @returns the list item
 */
function Check({
  pill,
  children,
  note,
}: {
  pill: ReactNode;
  children: ReactNode;
  note?: ReactNode;
}) {
  return (
    <li>
      {pill}
      <div className="check-body">
        <div>{children}</div>
        {note}
      </div>
    </li>
  );
}

/**
 * The deck's ATK-order chain and the checklist, each line led by a pass or
 * fail pill judged from the recorded order: the catcher sits below every
 * ranked cookie once the pet's in-battle bonus is added, and the deck
 * brings that pet. The last line, to check the order in battle, is the
 * reader's to do, with the pet's cited notes.
 *
 * @param props - the boss config, the deck, the pet's notes, and the source index
 * @returns the chain and the checklist, or an empty state when the deck has no ATK order
 */
export function AtkCheck({ boss, deck, petNotes, sources }: AtkCheckProps) {
  const order = deck.atkOrder ?? [];
  if (!order.length) return <EmptyState>No ATK order recorded for this deck yet.</EmptyState>;
  const catcher = deck.cookies.find((c) => c.cookieKr === boss.catcherKr);
  const last = rankedAbove(order, boss.catcherKr).at(-1);
  const pet = deck.pets.find((p) => p.kr === boss.atkPetKr);
  const catcherName = catcher ? (
    <CookieName kr={catcher.cookieKr} en={catcher.en} inline />
  ) : (
    <CookieName kr={boss.catcherKr} en={null} inline />
  );
  const petName = <CookieName kr={pet?.kr ?? boss.atkPetKr} en={pet?.en ?? null} inline />;

  return (
    <>
      <AtkOrder order={order} />
      {deck.atkOrderNote ? (
        <div className="muted">
          <Clamp lines={1}>{deck.atkOrderNote}</Clamp>
        </div>
      ) : null}
      <ul className="checks">
        <Check
          pill={STATE_PILL[catcherCheck(deck, boss.catcherKr)]}
          note={
            catcher?.levelRule ? (
              <div className="muted">
                <Clamp lines={1}>{catcher.levelRule}</Clamp>
              </div>
            ) : null
          }
        >
          {catcherName} sits below{" "}
          {last ? <CookieName kr={last.kr} en={last.en} inline /> : "the ranked cookies"}, the last
          ranked cookie, with the pet's bonus added.
        </Check>
        <Check pill={STATE_PILL[petCheck(deck, boss.atkPetKr)]}>{petName} is in the deck.</Check>
        <Check
          pill={<Pill kind="medium">check</Pill>}
          note={pet ? petNotes.map((m) => <FactNote key={m.id} m={m} sources={sources} />) : null}
        >
          Read the order in battle, not in the lobby.
        </Check>
      </ul>
      <div className="card-foot">
        <SourceChips ids={deck.sources} sources={sources} />
      </div>
    </>
  );
}
