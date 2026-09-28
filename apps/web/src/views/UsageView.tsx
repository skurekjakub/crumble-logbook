import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { useSourceIndex } from "../api/hooks";
import { glossaryQuery, recordQuery, usageQuery } from "../api/queries";
import type { UsageStat } from "../api/types";
import type { ModeSection } from "../app/modes";
import { CookieName } from "../components/CookieName";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { UsageBars, UsageLegend } from "../components/UsageBars";
import type { SourceIndex } from "../lib/sources";
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
 * Reports whether a row cites exactly the sources its sample group cites.
 *
 * @param row - the usage row
 * @param group - the row's sample group
 * @returns `true` if the row's sources match the group's
 */
function citesGroup(row: UsageStat, group: Sample): boolean {
  return (
    row.sources.length === group.sources.length &&
    row.sources.every((s) => group.sources.includes(s))
  );
}

/**
 * One sample's bars: the sample and capture date with its sources, then a bar per subject.
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
  return (
    <>
      <div className="bar-sample">
        <span>{group.sample}</span>
        <span className="muted"> · captured {group.capturedAt}</span>{" "}
        <SourceChips ids={group.sources} sources={sources} />
      </div>
      <UsageBars
        bars={group.rows.map((r) => ({
          key: r.id,
          label: <CookieName kr={r.subject} en={r.en} />,
          detail: r.members?.map((kr, i) => (
            <Fragment key={`${i}-${kr}`}>
              {i > 0 && " · "}
              <CookieName kr={kr} en={en(kr)} inline />
            </Fragment>
          )),
          pct: r.usagePct,
          confirmedPct: r.confirmedPct,
          note: r.note,
          extra: citesGroup(r, group) ? null : <SourceChips ids={r.sources} sources={sources} />,
        }))}
      />
    </>
  );
}

/**
 * A mode's usage figures: one card per kind (cookies, cores, pets, teams),
 * each with a bar list per sample, its capture date and sources, and each
 * figure's own caveat, with an "On this page" list of the kinds shown. The
 * mode's caveat from its research record sits on top. Core members show in English where the glossary knows them. "No
 * usage data recorded yet." when there are none.
 *
 * @param mode - the mode whose usage, record and copy the view shows
 * @returns the usage view
 */
export function UsageView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const usage = useQuery(usageQuery(mode.scope));
  const caveat = useQuery({
    ...recordQuery(mode.recordSlug ?? ""),
    /**
     * Picks the record's caveat for this mode.
     *
     * @param r - the research record
     * @returns the caveat, or null
     */
    select: (r) => r.modes.find((m) => m.mode === mode.scope.mode)?.caveat ?? null,
    enabled: mode.recordSlug != null,
  }).data;
  const glossary = useQuery({
    ...glossaryQuery(),
    /**
     * Indexes the glossary's English names by Korean term.
     *
     * @param entries - the glossary entries
     * @returns Korean term → English name
     */
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
      {caveat ? <div className="note">{caveat}</div> : null}
      <ModeViewHeader mode={mode} view="usage" fallbackTitle="Usage" />
      <QueryResult query={usage} resource="usage figures">
        {(rows) => {
          if (!rows.length) return <EmptyState>No usage data recorded yet.</EmptyState>;
          const kinds = (Object.keys(KIND_LABELS) as UsageStat["kind"][]).filter((kind) =>
            rows.some((r) => r.kind === kind),
          );
          return (
            <TocLayout items={kinds.map((k) => ({ id: kindId(k), label: KIND_LABELS[k] }))}>
              {rows.some((r) => r.confirmedPct != null) ? <UsageLegend /> : null}
              <div className="grid g2">
                {kinds.map((kind) => {
                  const ofKind = rows.filter((r) => r.kind === kind);
                  return (
                    <section className="card" key={kind} id={kindId(kind)}>
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
