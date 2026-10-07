import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { recommendationsQuery, recordQuery, rulesQuery, takeawaysQuery } from "../api/queries";
import type { Mechanic, Recommendation, Takeaway } from "../api/types";
import type { ModeSection, RulesConfig } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { ConfidencePill } from "../components/ConfidencePill";
import { EmptyState } from "../components/EmptyState";
import { Kv } from "../components/Kv";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import type { SourceIndex } from "../lib/sources";
import { leadSentence } from "../lib/verdict";
import { ModeViewHeader } from "./ModeViewHeader";

/**
 * One finding as a scannable row: its lead sentence in full, the rest of
 * its text and its detail cut to one line, and its sources at the end.
 *
 * @param props - the takeaway and the source index
 * @returns the row
 */
function Finding({ t, sources }: { t: Takeaway; sources: SourceIndex }) {
  const { lead, rest } = leadSentence(t.text);
  const more = [rest, t.detail ?? ""].filter((s) => s.trim()).join(" ");
  return (
    <li>
      <div className="finding">
        <div className="lead">{lead}</div>
        {more ? (
          <div className="muted">
            <Clamp lines={1}>{more}</Clamp>
          </div>
        ) : null}
      </div>
      <SourceChips ids={t.sources} sources={sources} max={2} />
    </li>
  );
}

/**
 * The ranked takeaways, the strongest first, each a {@link Finding} row;
 * "No takeaways yet." when there are none.
 *
 * @param props - the takeaways and the source index
 * @returns the list, or the empty state
 */
function Takeaways({ rows, sources }: { rows: readonly Takeaway[]; sources: SourceIndex }) {
  if (!rows.length) return <EmptyState>No takeaways yet.</EmptyState>;
  return (
    <ol className="take findings">
      {rows.map((t) => (
        <Finding key={t.id} t={t} sources={sources} />
      ))}
    </ol>
  );
}

/**
 * The "for your account" card, bullets first: each recommendation's changes
 * as a to-do list, then its summary cut to one line, then its sources;
 * nothing when there are none.
 *
 * @param props - the card's heading, the recommendations and the source index
 * @returns the card, or null
 */
function AccountCard({
  title,
  rows,
  sources,
}: {
  title: string;
  rows: readonly Recommendation[];
  sources: SourceIndex;
}) {
  if (!rows.length) return null;
  return (
    <section className="card account" aria-labelledby="account-title">
      <h3 id="account-title">{title}</h3>
      {rows.map((r) => (
        <div key={r.id} className="advice">
          {r.changes.length ? (
            <ul className="todo">
              {r.changes.map((c, i) => (
                <li key={i}>
                  <Clamp lines={1}>{c}</Clamp>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="advice-foot">
            <div className="muted">
              <Clamp lines={1}>{r.summary}</Clamp>
            </div>
            <SourceChips ids={r.sources} sources={sources} max={2} />
          </div>
        </div>
      ))}
    </section>
  );
}

/**
 * One rule: its confidence first when below high, its text cut to `lines`
 * lines, and its sources last.
 *
 * @param props - the rule, the source index, and the lines its text shows collapsed
 * @returns the rule's body
 */
function RuleBody({
  rule,
  sources,
  lines = 1,
}: {
  rule: Mechanic;
  sources: SourceIndex;
  lines?: number;
}) {
  return (
    <div className="rule">
      {rule.confidence === "high" ? null : <ConfidencePill confidence={rule.confidence} />}
      <span className="rule-body">
        <Clamp lines={lines}>{rule.body}</Clamp>
      </span>
      <SourceChips ids={rule.sources} sources={sources} max={2} />
    </div>
  );
}

/**
 * A mode's rules: the row titled `config.highlight`, when the config names
 * one, as its own card (the season's buffs), then the rest as a card of
 * title → rule. "No rules recorded yet." when there are none.
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
          <RuleBody rule={highlight} sources={sources} lines={2} />
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
 * A caveat as a one-line callout: a caution pill, then the text cut to one line.
 *
 * @param props - the caveat's text
 * @returns the callout
 */
function Caveat({ text }: { text: string }) {
  return (
    <div className="callout caveat" role="note">
      <Pill kind="medium">caveat</Pill>
      <span className="callout-body note">
        <Clamp lines={1}>{text}</Clamp>
      </span>
    </div>
  );
}

/**
 * A mode's overview: its research record's caveats (the mode's own, then the
 * record's) as one-line callouts, the mode's rules when it files them, the
 * ranked takeaways as scannable rows, and the recommendations for the
 * reader's own account. Each block loads on its own, so one failed resource
 * doesn't blank the others.
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
      {caveats?.length ? (
        <div className="caveats">
          {caveats.map((c) => (
            <Caveat key={c} text={c} />
          ))}
        </div>
      ) : null}
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
        {(rows) => <AccountCard title={mode.accountTitle} rows={rows} sources={sources} />}
      </QueryResult>
    </>
  );
}
