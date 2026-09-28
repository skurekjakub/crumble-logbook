import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { decksQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { LineupLegend } from "../components/Lineup";
import { QueryResult } from "../components/QueryResult";
import { TocLayout } from "../components/TocLayout";
import { DeckCard, deckId } from "./DeckCard";
import { ModeViewHeader } from "./ModeViewHeader";

/**
 * A mode's decks, each as a card, under the mode's heading and the slot
 * legend, with an "On this page" list linking to each card; "No decks
 * recorded yet." when there are none.
 *
 * @param mode - the mode whose decks and copy the view shows
 * @returns the decks view
 */
export function DecksView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const decks = useQuery(decksQuery(mode.scope));
  return (
    <QueryResult query={decks} resource="decks">
      {(rows) =>
        rows.length ? (
          <>
            <ModeViewHeader mode={mode} view="decks" fallbackTitle="Decks" />
            <TocLayout items={rows.map((d) => ({ id: deckId(d), label: d.nameEn }))}>
              <LineupLegend />
              {rows.map((d) => (
                <DeckCard key={d.id} deck={d} sources={sources} />
              ))}
            </TocLayout>
          </>
        ) : (
          <EmptyState>No decks recorded yet.</EmptyState>
        )
      }
    </QueryResult>
  );
}
