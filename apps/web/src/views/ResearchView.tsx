import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { recordsQuery, sourcesQuery } from "../api/queries";
import type { ResearchRecord } from "../api/types";
import type { ModeSection } from "../app/modes";
import { MODES } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { Kv } from "../components/Kv";
import { QueryResult } from "../components/QueryResult";
import { ViewHeader } from "../components/ViewHeader";

/**
 * The modes a record covers that have screens: the mode it's filed under
 * and every mode it lists, in tab order.
 *
 * @param record - a research record
 * @returns the covered modes' sections
 */
function coveredModes(record: ResearchRecord): ModeSection[] {
  const covered = new Set([record.mode, ...record.modes.map((m) => m.mode)]);
  return MODES.filter((m) => covered.has(m.scope.mode));
}

/**
 * A mode's name linking to its landing page, then a link per screen.
 *
 * @param props - the mode
 * @returns the links
 */
function ModeLinks({ mode }: { mode: ModeSection }) {
  return (
    <div className="mode-links">
      <Link {...mode.link} className="mode-link">
        {mode.label}
      </Link>{" "}
      {mode.labelKr ? <span className="kr">{mode.labelKr}</span> : null}
      <div className="chips">
        {mode.tabs.map((t) => (
          <Link key={t.id} {...t.link} className="chip">
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * One record as a card: slug, question, status, dates, lede, source count and its modes' screens.
 *
 * @param props - the record, and its source count once known
 * @returns the card
 */
function RecordCard({ record, sources }: { record: ResearchRecord; sources: number | undefined }) {
  const modes = coveredModes(record);
  return (
    <article className="card">
      <div className="card-head">
        <div>
          <div className="label">{record.slug}</div>
          <h3>{record.question}</h3>
        </div>
        <div className="chips">
          <span className="chip">{record.status}</span>
          {sources == null ? null : <span className="chip">{sources} sources</span>}
        </div>
      </div>
      {record.lede ? <div className="muted">{record.lede}</div> : null}
      <Kv
        rows={[
          [
            "Dates",
            `Started ${record.startedAt} · Updated ${record.updatedAt}${record.seasonLabel ? ` · ${record.seasonLabel}` : ""}`,
          ],
          ["Screens", modes.length ? modes.map((m) => <ModeLinks key={m.id} mode={m} />) : null],
          ["Folder", <span className="mono">research/{record.slug}/</span>],
          [
            "Evidence",
            <Link to="/research/$slug/captures" params={{ slug: record.slug }}>
              Capture ledger
            </Link>,
          ],
        ]}
      />
    </article>
  );
}

/**
 * The research index: every research record with its slug, question,
 * status, dates, source count, and links to the screens of each mode it
 * covers. "No research records yet." when there are none.
 *
 * @returns the research index
 */
export function ResearchView() {
  const records = useQuery(recordsQuery());
  const counts = useQuery({
    ...sourcesQuery(),
    select: (rows) => {
      const n = new Map<string, number>();
      for (const s of rows) for (const r of s.records) n.set(r, (n.get(r) ?? 0) + 1);
      return n;
    },
  }).data;

  return (
    <>
      <ViewHeader
        title="Research records"
        lede="Each record is one investigated question: its evidence captures, curated findings and verdict live under research/ in the repo. The screens of each mode it covers are built from it."
      />
      <QueryResult query={records} resource="research records">
        {(rows) =>
          rows.length ? (
            rows.map((r) => (
              <RecordCard
                key={r.slug}
                record={r}
                sources={counts?.get(r.slug) ?? (counts ? 0 : undefined)}
              />
            ))
          ) : (
            <EmptyState>No research records yet.</EmptyState>
          )
        }
      </QueryResult>
    </>
  );
}
