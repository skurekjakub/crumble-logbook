import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useSourceIndex } from "../api/hooks";
import { decksQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { LineupLegend } from "../components/Lineup";
import { ObsoleteSection } from "../components/ObsoleteSection";
import { QueryResult } from "../components/QueryResult";
import { TocLayout } from "../components/TocLayout";
import { splitObsolete } from "../lib/obsolete";
import { DeckCard, deckId } from "./DeckCard";
import { ModeViewHeader } from "./ModeViewHeader";

/** The id of the page's Obsolete section. */
const OBSOLETE_ID = "decks-obsolete";

/**
 * A mode's decks, each as a card, under the mode's heading and the slot
 * legend, with an "On this page" list linking to each current card and to
 * the Obsolete section. The obsolete decks end the page in that collapsed
 * section, each card in full under its notice; it opens when the address
 * names one of them. "No decks recorded yet." when there are none, and
 * "No current decks." above the section when every deck is obsolete.
 *
 * @param mode - the mode whose decks and copy the view shows
 * @returns the decks view
 */
export function DecksView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const decks = useQuery(decksQuery(mode.scope));
  const hash = useLocation({ select: (l) => l.hash.replace(/^#/, "") });
  return (
    <QueryResult query={decks} resource="decks">
      {(rows) => {
        if (!rows.length) return <EmptyState>No decks recorded yet.</EmptyState>;
        const { current, obsolete } = splitObsolete(rows);
        const names = new Map(rows.map((d) => [d.id, d.nameEn] as const));
        /**
         * Names a deck by id.
         *
         * @param id - the deck's id
         * @returns its English name, or the id when it isn't listed
         */
        const deckName = (id: string) => names.get(id) ?? id;
        const toc = [
          ...current.map((d) => ({ id: deckId(d), label: d.nameEn })),
          ...(obsolete.length ? [{ id: OBSOLETE_ID, label: "Obsolete" }] : []),
        ];
        return (
          <>
            <ModeViewHeader mode={mode} view="decks" fallbackTitle="Decks" />
            <TocLayout items={toc}>
              <LineupLegend />
              {current.length ? (
                current.map((d) => <DeckCard key={d.id} deck={d} sources={sources} />)
              ) : (
                <EmptyState>No current decks.</EmptyState>
              )}
              <ObsoleteSection
                id={OBSOLETE_ID}
                latest={obsolete[0]?.obsoleteSince ?? null}
                open={obsolete.some((d) => deckId(d) === hash)}
              >
                {obsolete.map((d) => (
                  <DeckCard key={d.id} deck={d} sources={sources} deckName={deckName} />
                ))}
              </ObsoleteSection>
            </TocLayout>
          </>
        );
      }}
    </QueryResult>
  );
}
