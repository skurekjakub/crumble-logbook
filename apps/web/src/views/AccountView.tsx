import { useQuery } from "@tanstack/react-query";
import { accountQuery } from "../api/queries";
import type { AccountOverview } from "../api/types";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { ViewHeader } from "../components/ViewHeader";
import { compactFigures, humanize, readingTime } from "../lib/account";
import { optionalText } from "../lib/search";
import { AccountLineups, AccountUnread } from "./AccountLineups";
import { AccountRoadmap } from "./AccountRoadmap";

/** The account view's search params: the snapshot and roadmap to show, by id. */
export interface AccountSearch {
  snapshot?: string;
  roadmap?: string;
}

/**
 * Reads the account view's search params.
 *
 * @param search - the router's decoded query values
 * @returns the snapshot and roadmap ids, each dropped when empty
 */
export function validateAccountSearch(search: Record<string, unknown>): AccountSearch {
  return { snapshot: optionalText(search.snapshot), roadmap: optionalText(search.roadmap) };
}

/** Props for {@link AccountView}. */
export interface AccountViewProps {
  /** The snapshot and roadmap asked for; the latest of each when omitted. */
  search: AccountSearch;
  /** Applies a change to the search params. */
  onSearch: (patch: Partial<AccountSearch>) => void;
}

/** Props for {@link Picker}. */
interface PickerProps {
  /** What it picks, as its label reads. */
  label: string;
  /** The loaded ids, newest first. */
  entries: AccountOverview["snapshots"];
  /** The id asked for; the latest when undefined. */
  value: string | undefined;
  /**
   * Shows another snapshot or roadmap.
   *
   * @param id - the id picked; undefined for the latest
   */
  onPick(id: string | undefined): void;
}

/**
 * A picker between loaded snapshots or roadmaps, shown when more than one
 * is loaded; the latest is the default.
 *
 * @param props - what it picks, the ids loaded (newest first), the one shown, and the setter
 * @returns the select, or null with one or none loaded
 */
function Picker(props: PickerProps) {
  const { label, entries, value } = props;
  if (entries.length < 2) return null;
  // The latest's option has the empty value, so asking for it by id selects it too.
  const selected = value === undefined || value === entries[0]!.id ? "" : value;
  return (
    <label className="acct-pick">
      <span className="label">{label}</span>
      <select
        value={selected}
        onChange={(e) => {
          props.onPick(e.target.value || undefined);
        }}
      >
        {entries.map((entry, i) => (
          <option key={entry.id} value={i === 0 ? "" : entry.id}>
            {entry.id}
            {i === 0 ? " (latest)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * The loaded account: the roadmap first, grouped now, next, later; then
 * the snapshot's lineups, pets and resources; then what the audit couldn't
 * read. Each part says so briefly when it has nothing.
 *
 * @param props - the overview, the ids asked for and the search setter
 * @returns the account's sections
 */
function AccountBody({ data, search, onSearch }: { data: AccountOverview } & AccountViewProps) {
  const { snapshot, roadmap } = data;
  if (!snapshot && !roadmap) return <EmptyState>No account audit yet.</EmptyState>;
  return (
    <>
      {snapshot?.profile.length ? (
        <dl className="acct-profile">
          {snapshot.profile.map((figure) => (
            <div key={figure.name}>
              <dt>{humanize(figure.name)}</dt>
              <dd
                className="mono"
                title={figure.at ? `${figure.value}, read ${figure.at}` : figure.value}
              >
                {compactFigures(figure.value)}
                {figure.at ? <span className="at">{readingTime(figure.at)}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      <section className="acct-section" aria-labelledby="acct-roadmap">
        <div className="acct-section-head">
          <h3 id="acct-roadmap">Roadmap</h3>
          {roadmap ? <span className="chip">{roadmap.date}</span> : null}
          <Picker
            label="Roadmap"
            entries={data.roadmaps}
            value={search.roadmap}
            onPick={(id) => {
              onSearch({ roadmap: id });
            }}
          />
        </div>
        {roadmap && (roadmap.items.length || roadmap.parked.length) ? (
          <AccountRoadmap roadmap={roadmap} />
        ) : (
          <EmptyState>No roadmap yet.</EmptyState>
        )}
      </section>
      <section className="acct-section" aria-labelledby="acct-lineups">
        <div className="acct-section-head">
          <h3 id="acct-lineups">Lineups</h3>
          {snapshot ? (
            <span className="chip" title={snapshot.capturedAt ?? undefined}>
              {snapshot.date}
            </span>
          ) : null}
          <Picker
            label="Snapshot"
            entries={data.snapshots}
            value={search.snapshot}
            onPick={(id) => {
              onSearch({ snapshot: id });
            }}
          />
        </div>
        {snapshot?.lineups.length ? (
          <AccountLineups snapshot={snapshot} />
        ) : (
          <EmptyState>No lineups read yet.</EmptyState>
        )}
        {snapshot ? <AccountUnread unread={snapshot.unread} /> : null}
      </section>
    </>
  );
}

/**
 * The reader's own account: the improvement roadmap and the lineups the
 * last audit read, from `pnpm import:account`. A short empty state when
 * nothing is imported.
 *
 * @param props - the snapshot and roadmap asked for, and the search setter
 * @returns the view
 */
export function AccountView({ search, onSearch }: AccountViewProps) {
  const query = useQuery(accountQuery(search));
  return (
    <>
      <ViewHeader
        title="Account"
        lede={["What to do now, next and later.", "Your lineups as the last audit read them."]}
      />
      <QueryResult query={query} resource="account">
        {(data) => <AccountBody data={data} search={search} onSearch={onSearch} />}
      </QueryResult>
    </>
  );
}
