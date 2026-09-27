import type { SourceIndex } from "../lib/sources";
import { CookieName } from "./CookieName";
import type { Column } from "./DataTable";
import { Pill } from "./Pill";
import { SourceChips } from "./SourceChips";

/** One rune build; `/api/rune-builds` rows fit as they are. */
export interface RuneBuildLike {
  id: number;
  cookieKr: string;
  en: string | null;
  lines: string;
  why: string;
  disputed: string | null;
  decks: readonly string[];
  sources: readonly string[];
}

/** A rune build's reason, with the disputed view beneath it when there is one. */
export function RuneWhy({ build }: { build: Pick<RuneBuildLike, "why" | "disputed"> }) {
  return (
    <>
      <div>{build.why}</div>
      {build.disputed ? (
        <div className="muted">
          <b>Disputed:</b> {build.disputed}
        </div>
      ) : null}
    </>
  );
}

/** A rune build inside a card: its lines, reason, dispute and sources. */
export function RuneNote({ build, sources }: { build: RuneBuildLike; sources: SourceIndex }) {
  return (
    <div className="boss-note">
      <div>
        <b>{build.lines}</b>
      </div>
      <RuneWhy build={build} />
      <SourceChips ids={build.sources} sources={sources} />
    </div>
  );
}

/** Options for {@link runeBuildColumns}. */
export interface RuneBuildColumnsOptions {
  /** The reason column's heading. */
  whyHeader: string;
  /** When given, adds a Decks column listing each build's decks by this name. */
  deckName?: (id: string) => string;
  /** Id → URL/title for the source chips. */
  sources: SourceIndex;
}

/**
 * The rune-build table's columns: the cookie (with a "disputed" pill), its
 * rune lines, the reason and any dispute, optionally the decks, and the
 * sources.
 *
 * @param options - the reason column's heading, the deck names, the source index
 * @returns the columns for `DataTable`
 */
export function runeBuildColumns({
  whyHeader,
  deckName,
  sources,
}: RuneBuildColumnsOptions): Column<RuneBuildLike>[] {
  return [
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
    { header: whyHeader, cell: (r) => <RuneWhy build={r} /> },
    ...(deckName
      ? [{ header: "Decks", cell: (r: RuneBuildLike) => r.decks.map(deckName).join(", ") }]
      : []),
    { header: "Sources", cell: (r) => <SourceChips ids={r.sources} sources={sources} /> },
  ];
}
