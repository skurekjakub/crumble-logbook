import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useSourceIndex } from "../../api/hooks";
import { decksQuery, runeBuildsQuery } from "../../api/queries";
import type { RuneBuild } from "../../api/types";
import type { Column } from "../../components/DataTable";
import { DataTable } from "../../components/DataTable";
import { CookieName } from "../../components/CookieName";
import { Pill } from "../../components/Pill";
import { QueryResult } from "../../components/QueryResult";
import { SourceChips } from "../../components/SourceChips";

/** The runes view's search params: a deck slug and a text query, both optional. */
interface RunesSearch {
  deck?: string;
  q?: string;
}

/** A non-empty string search param, else undefined. */
function stringParam(v: unknown): string | undefined {
  return typeof v === "string" && v !== "" ? v : undefined;
}

export const Route = createFileRoute("/conquest/runes")({
  validateSearch: (search: Record<string, unknown>): RunesSearch => {
    const deck = stringParam(search.deck);
    const q = stringParam(search.q);
    return { ...(deck && { deck }), ...(q && { q }) };
  },
  component: RunesView,
});

/**
 * The rune-builds table: per cookie its rune lines, the reason (with any
 * disputed view beneath it), the decks it applies to and its sources. The
 * deck select and the text filter live in the URL as `?deck=` and `?q=`.
 */
function RunesView() {
  const { deck = "", q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const sources = useSourceIndex();
  const runes = useQuery(runeBuildsQuery());
  const deckNames = useQuery({
    ...decksQuery(),
    select: (decks) => new Map(decks.map((d) => [d.id, d.nameEn])),
  }).data;
  const deckName = (id: string) => deckNames?.get(id) ?? id;

  const setSearch = (patch: RunesSearch) =>
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        return {
          ...(next.deck && { deck: next.deck }),
          ...(next.q && { q: next.q }),
        };
      },
      replace: true,
    });

  const columns: Column<RuneBuild>[] = [
    {
      header: "Cookie",
      cell: (r) => (
        <>
          <CookieName kr={r.cookieKr} en={r.en} />
          {r.disputed ? <Pill kind="disputed" /> : null}
        </>
      ),
    },
    { header: "Rune lines", cell: (r) => <b>{r.lines}</b> },
    {
      header: "Target / why",
      cell: (r) => (
        <>
          <div>{r.why}</div>
          {r.disputed ? (
            <div className="muted">
              <b>Disputed:</b> {r.disputed}
            </div>
          ) : null}
        </>
      ),
    },
    { header: "Decks", cell: (r) => r.decks.map(deckName).join(", ") },
    { header: "Sources", cell: (r) => <SourceChips ids={r.sources} sources={sources} /> },
  ];

  return (
    <>
      <div>
        <h2>Sugar runes</h2>
        <p className="lede">
          Raid rune lines per cookie. "All" means every line rolls the same stat. Disputed rows are
          where posters disagreed; both sides are kept.
        </p>
      </div>
      <QueryResult query={runes} resource="rune builds">
        {(rows) => (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            empty="No rune builds recorded yet."
            filter={{
              value: q,
              onChange: (v) => setSearch({ q: v }),
              text: (r) => `${JSON.stringify(r)} ${r.en ?? ""}`,
              placeholder: "Filter by cookie or stat (e.g. 시커, haste)",
            }}
            select={{
              label: "All decks",
              options: [...new Set(rows.flatMap((r) => r.decks))].map(
                (id) => [id, deckName(id)] as const,
              ),
              value: deck,
              onChange: (v) => setSearch({ deck: v }),
              test: (r, v) => r.decks.includes(v),
            }}
          />
        )}
      </QueryResult>
    </>
  );
}
