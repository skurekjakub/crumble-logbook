import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { useSourceIndex } from "../api/hooks";
import { decksQuery } from "../api/queries";
import type { Deck, DeckCookie } from "../api/types";
import type { ModeSection } from "../app/modes";
import { AtkOrder } from "../components/AtkOrder";
import { CookieName } from "../components/CookieName";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Formation, hasFormation } from "../components/Formation";
import { Kv } from "../components/Kv";
import { Lineup, LineupLegend } from "../components/Lineup";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { ViewHeader } from "../components/ViewHeader";
import type { SourceIndex } from "../lib/sources";

/**
 * A cookie's level requirement as the levels table shows it: the level rule
 * when there is one, else "Lv.<level>", else "–".
 *
 * @param c - a deck cookie
 * @returns the display text
 */
function levelText(c: Pick<DeckCookie, "level" | "levelRule">): string {
  if (c.levelRule) return c.levelRule;
  if (c.level != null && c.level !== "") return `Lv.${c.level}`;
  return "–";
}

/**
 * Per-cookie level requirements with the reason for each, plus the slot and
 * stars columns when any cookie has one; nothing when no cookie has a
 * reason. Stars are free text ("?", "~7 (inferred …)") and show as stored.
 */
function LevelTable({ cookies }: { cookies: readonly DeckCookie[] }) {
  if (!cookies.some((c) => c.why)) return null;
  const columns: Column<DeckCookie>[] = [
    { header: "Cookie", cell: (c) => <CookieName kr={c.cookieKr} en={c.en} /> },
    ...(cookies.some((c) => c.slot)
      ? [{ header: "Slot", cell: (c: DeckCookie) => c.slot ?? "–", className: "n" }]
      : []),
    { header: "Level", cell: levelText, className: "mono" },
    ...(cookies.some((c) => c.stars)
      ? [{ header: "Stars", cell: (c: DeckCookie) => c.stars || "–" }]
      : []),
    { header: "Why", cell: (c) => c.why, className: "wide" },
  ];
  return (
    <details className="levels" open>
      <summary className="label">Levels and why</summary>
      <DataTable rows={cookies} rowKey={(c) => c.id} columns={columns} layout="stack" />
    </details>
  );
}

/** A deck card's DOM id, which the "On this page" list links to. */
const deckId = (d: Pick<Deck, "id">) => `deck-${d.id}`;

/** A bullet list, or null when there are no items (so {@link Kv} drops the row). */
function bullets(items: readonly string[]) {
  if (!items.length) return null;
  return (
    <ul className="clean">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}

/** One deck as a card: formation (or plain lineup when it has no slots), levels, ATK order, pets, perks, formation, swaps, RNG, unorthodox flags and sources. */
function DeckCard({ deck: d, sources }: { deck: Deck; sources: SourceIndex }) {
  const notes = (kind: Deck["notes"][number]["kind"]) =>
    d.notes.filter((n) => n.kind === kind).map((n) => n.text);
  const atkOrder = d.atkOrder?.length ? (
    <>
      <AtkOrder order={d.atkOrder} />
      {d.atkOrderNote ? <div className="muted">{d.atkOrderNote}</div> : null}
    </>
  ) : null;
  const pets = d.pets.length
    ? d.pets.map((p, i) => (
        <Fragment key={`${i}-${p.kr}`}>
          {i > 0 && " · "}
          <CookieName kr={p.kr} en={p.en} inline />
        </Fragment>
      ))
    : null;

  return (
    <article className="card" id={deckId(d)}>
      <div className="card-head">
        <div>
          <h3>
            {d.nameEn} <span className="kr">{d.nameKr ?? ""}</span>
          </h3>
          <div className="muted">{d.summary ?? ""}</div>
        </div>
        <div className="chips">
          <Pill kind={d.status} />
          {d.ceilingText ? <span className="chip">ceiling {d.ceilingText}</span> : null}
        </div>
      </div>
      {hasFormation(d.cookies) ? <Formation cookies={d.cookies} /> : <Lineup cookies={d.cookies} />}
      <LevelTable cookies={d.cookies} />
      <Kv
        rows={[
          ["ATK order", atkOrder],
          ["Pets", pets],
          ["Perks", d.perks],
          ["Formation", d.formation],
          ["Swaps", bullets(notes("substitution"))],
          ["RNG", d.rng],
        ]}
      />
      {notes("unorthodox").map((u, i) => (
        <div className="flag" key={i}>
          {u}
        </div>
      ))}
      <SourceChips ids={d.sources} sources={sources} />
    </article>
  );
}

/**
 * A mode's decks, each as a card, under the mode's heading and the slot
 * legend, with an "On this page" list linking to each card; "No decks
 * recorded yet." when there are none.
 *
 * @param mode - the mode whose decks and copy the view shows
 */
export function DecksView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const decks = useQuery(decksQuery(mode.scope));
  return (
    <QueryResult query={decks} resource="decks">
      {(rows) =>
        rows.length ? (
          <>
            <ViewHeader title={mode.copy.decks?.title ?? "Decks"} lede={mode.copy.decks?.lede} />
            <TocLayout items={rows.map((d) => ({ id: deckId(d), label: d.nameEn }))}>
              <LineupLegend />
              {rows.map((d) => (
                <DeckCard key={d.id} deck={d} sources={sources} />
              ))}
            </TocLayout>
          </>
        ) : (
          <EmptyState>No decks recorded yet.</EmptyState>
        )
      }
    </QueryResult>
  );
}
