import { Fragment } from "react";
import type { Deck, DeckCookie } from "../api/types";
import { AtkOrder } from "../components/AtkOrder";
import { Clamp } from "../components/Clamp";
import { CookieName } from "../components/CookieName";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { Formation, hasFormation } from "../components/Formation";
import { Kv } from "../components/Kv";
import { Lineup } from "../components/Lineup";
import { ObsoleteNotice } from "../components/ObsoleteNotice";
import { Pill } from "../components/Pill";
import { SourceChips } from "../components/SourceChips";
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
 *
 * @param props - the deck's cookies
 * @returns the collapsible table, or null
 */
function LevelTable({ cookies }: { cookies: readonly DeckCookie[] }) {
  if (!cookies.some((c) => c.why)) return null;
  const columns: Column<DeckCookie>[] = [
    {
      header: "Cookie",
      cell: (c) => <CookieName kr={c.cookieKr} en={c.en} />,
    },
    ...(cookies.some((c) => c.slot)
      ? [
          {
            header: "Slot",
            cell: (c: DeckCookie) => c.slot ?? "–",
            className: "n",
          },
        ]
      : []),
    { header: "Level", cell: levelText, className: "lvl" },
    ...(cookies.some((c) => c.stars)
      ? [
          {
            header: "Stars",
            cell: (c: DeckCookie) => c.stars || "–",
          },
        ]
      : []),
    {
      header: "Why",
      cell: (c) => (c.why ? <Clamp lines={1}>{c.why}</Clamp> : null),
      className: "wide",
    },
  ];
  return (
    <details className="levels" open>
      <summary className="label">Levels and why</summary>
      <DataTable rows={cookies} rowKey={(c) => c.id} columns={columns} layout="stack" />
    </details>
  );
}

/**
 * Builds a deck card's DOM id, which an "On this page" list links to.
 *
 * @param d - the deck
 * @returns `deck-<id>`
 */
export const deckId = (d: Pick<Deck, "id">) => `deck-${d.id}`;

/**
 * Renders a bullet list, or null when there are no items (so {@link Kv} drops the row).
 *
 * @param items - the list's lines
 * @returns the list, or null
 */
function bullets(items: readonly string[]) {
  if (!items.length) return null;
  return (
    <ul className="clean">
      {items.map((x, i) => (
        <li key={i}>
          <Clamp lines={1}>{x}</Clamp>
        </li>
      ))}
    </ul>
  );
}

/**
 * A text cut to one line that expands on demand, or null when there's none
 * (so {@link Kv} drops the row).
 *
 * @param text - the text, or null
 * @returns the clamped text, or null
 */
function clamped(text: string | null) {
  return text?.trim() ? <Clamp lines={1}>{text}</Clamp> : null;
}

/**
 * One deck as a card: formation (or plain lineup when it has no slots),
 * levels, ATK order, pets, perks, formation, swaps, RNG, unorthodox flags
 * and sources. An obsolete deck's card renders in full, headed with its
 * obsolete notice and a link to the deck that superseded it.
 *
 * @param props - the deck, the source index, and a namer for the successor
 * @returns the card
 */
export function DeckCard({
  deck: d,
  sources,
  deckName,
}: {
  deck: Deck;
  sources: SourceIndex;
  /** Names a deck by id, for the successor in an obsolete deck's notice; the id when absent. */
  deckName?: (id: string) => string;
}) {
  /**
   * Lists the texts of the deck's notes of one kind.
   *
   * @param kind - the note kind
   * @returns the notes' texts, in display order
   */
  const notes = (kind: Deck["notes"][number]["kind"]) =>
    d.notes.filter((n) => n.kind === kind).map((n) => n.text);
  const atkOrder = d.atkOrder?.length ? (
    <>
      <AtkOrder order={d.atkOrder} />
      {d.atkOrderNote ? (
        <div className="muted">
          <Clamp lines={1}>{d.atkOrderNote}</Clamp>
        </div>
      ) : null}
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
      {d.obsoleteSince ? (
        <ObsoleteNotice
          since={d.obsoleteSince}
          reason={d.obsoleteReason}
          sources={d.obsoleteSources}
          sourceIndex={sources}
          superseded={
            d.supersededBy ? (
              <a href={`#${deckId({ id: d.supersededBy })}`}>
                {deckName?.(d.supersededBy) ?? d.supersededBy}
              </a>
            ) : null
          }
        />
      ) : null}
      <div className="card-head deck-head">
        <div className="deck-title">
          <h3>
            {d.nameEn} <span className="kr">{d.nameKr ?? ""}</span>
          </h3>
          <div className="chips">
            <Pill kind={d.status} />
            {d.ceilingText ? <span className="chip ceiling">ceiling {d.ceilingText}</span> : null}
          </div>
        </div>
        {d.summary ? (
          <div className="muted">
            <Clamp lines={1}>{d.summary}</Clamp>
          </div>
        ) : null}
      </div>
      {hasFormation(d.cookies) ? <Formation cookies={d.cookies} /> : <Lineup cookies={d.cookies} />}
      <LevelTable cookies={d.cookies} />
      <Kv
        rows={[
          ["ATK order", atkOrder],
          ["Pets", pets],
          ["Perks", clamped(d.perks)],
          ["Formation", clamped(d.formation)],
          ["Swaps", bullets(notes("substitution"))],
          ["RNG", clamped(d.rng)],
        ]}
      />
      {notes("unorthodox").map((u, i) => (
        <div className="flag" key={i}>
          <Clamp lines={1}>{u}</Clamp>
        </div>
      ))}
      <div className="card-foot">
        <SourceChips ids={d.sources} sources={sources} />
      </div>
    </article>
  );
}
