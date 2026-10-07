import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { mechanicsQuery } from "../api/queries";
import type { ModeScope } from "../api/queries";
import type { ModeSection, SharedView, ViewCopy } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { ConfidencePill } from "../components/ConfidencePill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";

/**
 * The mode's mechanics filed under `topic`, as their topic or one of their
 * further topics (`alsoTopics`), each as a callout: its confidence first,
 * its body cut to one line (expanding on demand), its sources last;
 * nothing when none are filed under it.
 *
 * @param props - the mode's scope and the mechanics topic
 * @returns the notes, inside the mechanics query's loading and error states
 */
export function TopicNotes({ scope, topic }: { scope: ModeScope; topic: string }) {
  const sources = useSourceIndex();
  const mechanics = useQuery(mechanicsQuery(scope));
  return (
    <QueryResult query={mechanics} resource="mechanics">
      {(rows) =>
        rows
          .filter((m) => m.topic === topic || m.alsoTopics.includes(topic))
          .map((m) => (
            <div key={m.id} className="callout">
              <ConfidencePill confidence={m.confidence} />
              <span className="callout-body">
                <Clamp lines={1}>{m.body}</Clamp>
              </span>
              <SourceChips ids={m.sources} sources={sources} max={2} />
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
 *
 * @param props - the mode, the view's copy key, and the title to use when the copy has none
 * @returns the header
 */
export function ModeViewHeader({ mode, view, fallbackTitle }: ModeViewHeaderProps) {
  return <CopyHeader scope={mode.scope} copy={mode.copy[view]} fallbackTitle={fallbackTitle} />;
}

/** Props for {@link CopyHeader}. */
export interface CopyHeaderProps {
  /** The mode whose mechanics the copy's `topic` names. */
  scope: ModeScope;
  /** The view's heading, lede and topic, when the mode has copy for it. */
  copy: ViewCopy | undefined;
  /** The heading when there's no copy. */
  fallbackTitle: string;
}

/**
 * A view's heading and lede from its copy, followed by the mode's cited
 * mechanics of the copy's `topic` when it names one: the header of a view
 * whose copy isn't a shared view's, such as a mode-specific screen.
 *
 * @param props - the mode's scope, the view's copy, and the title to use without copy
 * @returns the header
 */
export function CopyHeader({ scope, copy, fallbackTitle }: CopyHeaderProps) {
  return (
    <>
      <ViewHeader title={copy?.title ?? fallbackTitle} lede={copy?.lede} />
      {copy?.topic ? <TopicNotes scope={scope} topic={copy.topic} /> : null}
    </>
  );
}
