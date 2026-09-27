import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { mechanicsQuery } from "../api/queries";
import type { ModeScope } from "../api/queries";
import type { ModeSection, SharedView } from "../app/modes";
import { ConfidencePill } from "../components/ConfidencePill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";

/**
 * The mode's mechanics filed under `topic`, each as a note with its body,
 * confidence and sources; nothing when none are filed under it.
 */
function TopicNotes({ scope, topic }: { scope: ModeScope; topic: string }) {
  const sources = useSourceIndex();
  const mechanics = useQuery(mechanicsQuery(scope));
  return (
    <QueryResult query={mechanics} resource="mechanics">
      {(rows) =>
        rows
          .filter((m) => m.topic === topic)
          .map((m) => (
            <div key={m.id} className="note">
              {m.body} <ConfidencePill confidence={m.confidence} />{" "}
              <SourceChips ids={m.sources} sources={sources} />
            </div>
          ))
      }
    </QueryResult>
  );
}

/** Props for {@link ModeViewHeader}. */
export interface ModeViewHeaderProps {
  /** The mode whose copy and mechanics the header reads. */
  mode: ModeSection;
  /** Which of the mode's views this heads. */
  view: SharedView;
  /** The heading when the mode has no copy for the view. */
  fallbackTitle: string;
}

/**
 * A mode view's heading and lede from the mode's copy, followed by the
 * cited mechanics of the copy's `topic` when it names one.
 */
export function ModeViewHeader({ mode, view, fallbackTitle }: ModeViewHeaderProps) {
  const copy = mode.copy[view];
  return (
    <>
      <ViewHeader title={copy?.title ?? fallbackTitle} lede={copy?.lede} />
      {copy?.topic ? <TopicNotes scope={mode.scope} topic={copy.topic} /> : null}
    </>
  );
}
