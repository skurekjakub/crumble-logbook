import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { glossaryQuery, recordQuery, usageQuery } from "../api/queries";
import type { UsageStat } from "../api/types";
import type { ModeSection } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { CookieName } from "../components/CookieName";
import { EmptyState } from "../components/EmptyState";
import { MemberChips } from "../components/Faces";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { UsageBars, UsageLegend } from "../components/UsageBars";
import type { SourceIndex } from "../lib/sources";
import { hoistNote, ownSources } from "../lib/usage";
import { ModeViewHeader } from "./ModeViewHeader";

/** Section heading per usage kind, in display order. */
const KIND_LABELS: Readonly<Record<UsageStat["kind"], string>> = {
  cookie: "Cookies",
  core: "Cores",
  pet: "Pets",
  team: "Teams",
};

/**
 * Builds a kind's card id, which the "On this page" list links to.
 *
 * @param kind - the usage kind
 * @returns `usage-<kind>`
 */
const kindId = (kind: UsageStat["kind"]) => `usage-${kind}`;

/** Usage rows that share a sample and capture date. */
interface Sample {
  sample: string;
  capturedAt: string;
  rows: UsageStat[];
  /** Every source the rows cite, sorted. */
  sources: string[];
}

/**
 * Groups rows by sample and capture date, in first-seen order.
 *
 * @param rows - usage rows of one kind, in list order
 * @returns the groups, each with its rows in list order and every source they cite
 */
function samples(rows: readonly UsageStat[]): Sample[] {
  const groups = new Map<string, Sample>();
  for (const row of rows) {
    const key = `${row.sample}\u0000${row.capturedAt}`;
    const group = groups.get(key) ?? {
      sample: row.sample,
      capturedAt: row.capturedAt,
      rows: [],
      sources: [],
    };
    group.rows.push(row);
    group.sources = [...new Set([...group.sources, ...row.sources])].sort();
    groups.set(key, group);
  }
  return [...groups.values()];
}

/**
 * One sample's bars: the sample and capture date with its sources and the
 * caveat its rows share, then a ranked bar per subject. A cookie or pet
 * shows its portrait; a group (a core, a team, a pet set) shows its name
 * with its members' portraits under the bar.
 *
 * @param props - the sample group, the English namer and the source index
 * @returns the sample line and its bars
 */
function SampleBars({
  group,
  en,
  sources,
}: {
  group: Sample;
  /** Names a Korean term in English, or null when the glossary doesn't know it. */
  en: (kr: string) => string | null;
  sources: SourceIndex;
}) {
  const notes = hoistNote(group.rows.map((r) => r.note));
  const own = ownSources(group.rows);
  return (
    <>
      <div className="bar-sample">
        <span className="bar-sample-text">
          <Clamp lines={1} perLine={70}>
            {group.sample}
          </Clamp>
        </span>
        <span className="muted">captured {group.capturedAt}</span>
        <SourceChips ids={group.sources} sources={sources} max={2} />
      </div>
      {notes.common ? (
        <div className="bar-common muted">
          <Clamp lines={1} perLine={70}>
            {notes.common}
          </Clamp>
        </div>
      ) : null}
      <UsageBars
        bars={group.rows.map((r, i) => {
          const members = r.members ?? [];
          const note = notes.rest[i];
          return {
            key: r.id,
            label: members.length ? (
              <span className="group-name">{r.subject}</span>
            ) : (
              <CookieName kr={r.subject} en={r.en} />
            ),
            detail: members.length ? (
              <MemberChips members={members.map((kr) => ({ kr, en: en(kr) }))} />
            ) : null,
            pct: r.usagePct,
            confirmedPct: r.confirmedPct,
            note: note ? (
              <Clamp lines={1} perLine={60}>
                {note}
              </Clamp>
            ) : null,
            extra: own[i]?.length ? <SourceChips ids={own[i]} sources={sources} max={2} /> : null,
          };
        })}
      />
    </>
  );
}

/**
 * A mode's usage figures: one card per kind (cookies, cores, pets, teams),
 * each with a ranked bar list per sample, its capture date, sources and
 * shared caveat, and each figure's own caveat cut to a line, with an "On
 * this page" list of the kinds shown. The mode's caveat from its research
 * record sits under the heading as a one-line callout. Group members show
 * in English where the glossary knows them. "No usage data recorded yet."
 * when there are none.
 *
 * @param mode - the mode whose usage, record and copy the view shows
 * @returns the usage view
 */
export function UsageView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const usage = useQuery(usageQuery(mode.scope));
  const caveat = useQuery({
    ...recordQuery(mode.recordSlug ?? ""),
    select: (r) => r.modes.find((m) => m.mode === mode.scope.mode)?.caveat ?? null,
    enabled: mode.recordSlug != null,
  }).data;
  const glossary = useQuery({
    ...glossaryQuery(),
    select: (entries) => new Map(entries.map((e) => [e.kr, e.en] as const)),
  }).data;
  /**
   * Names a Korean term in English.
   *
   * @param kr - the Korean term
   * @returns the English name, or null when unknown or the glossary hasn't loaded
   */
  const en = (kr: string) => glossary?.get(kr) ?? null;

  return (
    <>
      <ModeViewHeader mode={mode} view="usage" fallbackTitle="Usage" />
      {caveat ? (
        <div className="callout usage-caveat">
          <Pill kind="medium">caveat</Pill>
          <span className="callout-body">
            <Clamp lines={1}>{caveat}</Clamp>
          </span>
        </div>
      ) : null}
      <QueryResult query={usage} resource="usage figures">
        {(rows) => {
          if (!rows.length) return <EmptyState>No usage data recorded yet.</EmptyState>;
          const kinds = (Object.keys(KIND_LABELS) as UsageStat["kind"][]).filter((kind) =>
            rows.some((r) => r.kind === kind),
          );
          return (
            <TocLayout items={kinds.map((k) => ({ id: kindId(k), label: KIND_LABELS[k] }))}>
              {rows.some((r) => r.confirmedPct != null) ? <UsageLegend /> : null}
              <div className="grid g2 usage-grid">
                {kinds.map((kind) => {
                  const ofKind = rows.filter((r) => r.kind === kind);
                  return (
                    <section className="card usage-card" key={kind} id={kindId(kind)}>
                      <h3>{KIND_LABELS[kind]}</h3>
                      {samples(ofKind).map((g) => (
                        <SampleBars
                          key={`${g.sample}-${g.capturedAt}`}
                          group={g}
                          en={en}
                          sources={sources}
                        />
                      ))}
                    </section>
                  );
                })}
              </div>
            </TocLayout>
          );
        }}
      </QueryResult>
    </>
  );
}
