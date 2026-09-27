import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { recommendationsQuery, recordQuery, takeawaysQuery } from "../api/queries";
import type { Recommendation, Takeaway } from "../api/types";
import type { ModeSection } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";
import type { SourceIndex } from "../lib/sources";

/** The numbered takeaways, each with its detail and sources; "No takeaways yet." when there are none. */
function Takeaways({ rows, sources }: { rows: readonly Takeaway[]; sources: SourceIndex }) {
  if (!rows.length) return <EmptyState>No takeaways yet.</EmptyState>;
  return (
    <ol className="take">
      {rows.map((t) => (
        <li key={t.id}>
          <div>
            <div>{t.text}</div>
            {t.detail ? <div className="muted">{t.detail}</div> : null}
            <SourceChips ids={t.sources} sources={sources} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/** The "for your account" card: each recommendation's summary, changes and sources; nothing when there are none. */
function AccountCard({ rows, sources }: { rows: readonly Recommendation[]; sources: SourceIndex }) {
  if (!rows.length) return null;
  return (
    <div className="card">
      <h3>Your lineup against the meta</h3>
      {rows.map((r) => (
        <div key={r.id}>
          <div>{r.summary}</div>
          {r.changes.length ? (
            <ul className="clean">
              {r.changes.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : null}
          <SourceChips ids={r.sources} sources={sources} />
        </div>
      ))}
    </div>
  );
}

/**
 * A mode's overview: its research record's caveat, the load-bearing
 * takeaways, and the recommendations for the reader's own account. Each
 * block loads on its own, so one failed resource doesn't blank the others.
 *
 * @param mode - the mode whose record, lists and copy the view shows
 */
export function OverviewView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  // The root route reports a failed record; here the caveat is simply left out.
  const caveat = useQuery({
    ...recordQuery(mode.recordSlug ?? ""),
    select: (r) => r.caveat,
    enabled: mode.recordSlug != null,
  }).data;
  const takeaways = useQuery(takeawaysQuery(mode.scope));
  const recommendations = useQuery(recommendationsQuery(mode.recordSlug));

  return (
    <>
      {caveat ? <div className="note">{caveat}</div> : null}
      <ViewHeader title={mode.copy.overview?.title ?? "Overview"} lede={mode.copy.overview?.lede} />
      <QueryResult query={takeaways} resource="takeaways">
        {(rows) => <Takeaways rows={rows} sources={sources} />}
      </QueryResult>
      <QueryResult query={recommendations} resource="recommendations">
        {(rows) => <AccountCard rows={rows} sources={sources} />}
      </QueryResult>
    </>
  );
}
