import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { recommendationsQuery, recordQuery, rulesQuery, takeawaysQuery } from "../api/queries";
import type { Mechanic, Recommendation, Takeaway } from "../api/types";
import type { ModeSection, RulesConfig } from "../app/modes";
import { ConfidencePill } from "../components/ConfidencePill";
import { EmptyState } from "../components/EmptyState";
import { Kv } from "../components/Kv";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import type { SourceIndex } from "../lib/sources";
import { ModeViewHeader } from "./ModeViewHeader";

/**
 * The numbered takeaways, each with its detail and sources; "No takeaways yet." when there are none.
 *
 * @param props - the takeaways and the source index
 * @returns the list, or the empty state
 */
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

/**
 * The "for your account" card: each recommendation's summary, changes and sources; nothing when there are none.
 *
 * @param props - the recommendations and the source index
 * @returns the card, or null
 */
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
 * One rule's text, confidence (when below high) and sources.
 *
 * @param props - the rule and the source index
 * @returns the rule's body
 */
function RuleBody({ rule, sources }: { rule: Mechanic; sources: SourceIndex }) {
  return (
    <>
      <div>{rule.body}</div>
      <div className="chips">
        {rule.confidence === "high" ? null : <ConfidencePill confidence={rule.confidence} />}
        <SourceChips ids={rule.sources} sources={sources} />
      </div>
    </>
  );
}

/**
 * A mode's rules: the row titled `config.highlight`, when the config names
 * one, as its own card (the season's buffs), then the rest as a card of
 * title → rule. "No rules
 * recorded yet." when there are none.
 *
 * @param props - the rules, the mode's rules config and the source index
 * @returns the rule cards, or the empty state
 */
function Rules({
  rows,
  config,
  sources,
}: {
  rows: readonly Mechanic[];
  config: RulesConfig;
  sources: SourceIndex;
}) {
  if (!rows.length) return <EmptyState>No rules recorded yet.</EmptyState>;
  const highlight =
    config.highlight === null ? undefined : rows.find((r) => r.title === config.highlight);
  const rest = rows.filter((r) => r !== highlight);
  return (
    <>
      {highlight ? (
        <div className="card buffs">
          <h3>{highlight.title}</h3>
          <RuleBody rule={highlight} sources={sources} />
        </div>
      ) : null}
      {rest.length ? (
        <div className="card">
          <h3>{config.title}</h3>
          <Kv rows={rest.map((r) => [r.title, <RuleBody rule={r} sources={sources} />] as const)} />
        </div>
      ) : null}
    </>
  );
}

/**
 * A mode's overview: its research record's caveats (the mode's own, then the
 * record's), the mode's rules when it files them, the load-bearing
 * takeaways, and the recommendations for the reader's own account. Each
 * block loads on its own, so one failed resource doesn't blank the others.
 *
 * @param mode - the mode whose record, lists and copy the view shows
 * @returns the overview
 */
export function OverviewView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  // The root route reports a failed record; here the caveats are simply left out.
  const caveats = useQuery({
    ...recordQuery(mode.recordSlug ?? ""),
    select: (r) =>
      [r.modes.find((m) => m.mode === mode.scope.mode)?.caveat, r.caveat].filter(
        (c): c is string => !!c,
      ),
    enabled: mode.recordSlug != null,
  }).data;
  const rules = useQuery({ ...rulesQuery(mode.scope), enabled: mode.rules != null });
  const takeaways = useQuery(takeawaysQuery(mode.scope));
  const recommendations = useQuery(recommendationsQuery(mode.recordSlug));

  return (
    <>
      {caveats?.map((c) => (
        <div className="note" key={c}>
          {c}
        </div>
      ))}
      <ModeViewHeader mode={mode} view="overview" fallbackTitle="Overview" />
      {mode.rules ? (
        <QueryResult query={rules} resource="rules">
          {(rows) => <Rules rows={rows} config={mode.rules!} sources={sources} />}
        </QueryResult>
      ) : null}
      <QueryResult query={takeaways} resource="takeaways">
        {(rows) => <Takeaways rows={rows} sources={sources} />}
      </QueryResult>
      <QueryResult query={recommendations} resource="recommendations">
        {(rows) => <AccountCard rows={rows} sources={sources} />}
      </QueryResult>
    </>
  );
}
