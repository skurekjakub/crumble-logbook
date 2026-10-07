import type { DailyDungeonClear, Deck } from "../api/types";
import type { DailyConfig, ModeSection } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { CookieIcon } from "../components/CookieIcon";
import { CookieName } from "../components/CookieName";
import { AutoBadge, PowerChips } from "../components/DailyRun";
import { EmptyState } from "../components/EmptyState";
import { Formation, hasFormation } from "../components/Formation";
import { Lineup } from "../components/Lineup";
import { Pill } from "../components/Pill";
import { SourceChips } from "../components/SourceChips";
import { shortName } from "../lib/cookie-icons";
import { compactPower } from "../lib/stage";
import type { SourceIndex } from "../lib/sources";
import { DeckLink } from "./DeckLink";
import { withCaptain } from "./DeckCard";

/** What the deck parts of the board share: the mode, its board config and the source index. */
interface BoardContext {
  /** The daily dungeon mode, whose teams page holds the deck cards. */
  mode: ModeSection;
  /** Its board config. */
  daily: DailyConfig;
  /** Id → URL/title, for the source chips. */
  sources: SourceIndex;
}

/**
 * The stage a run reached as a big figure, or a dash when none is recorded.
 *
 * @param props - the stage
 * @returns the figure
 */
function StageFigure({ stage }: { stage: number | null }) {
  return (
    <span className="dd-stage-fig" title="Stage reached">
      <span className="label">Stage</span>
      <b>{stage ?? "–"}</b>
    </span>
  );
}

/**
 * The cookies of a deck in a row of portraits, the captain first and
 * crowned, the names in each portrait's tooltip.
 *
 * @param props - the deck
 * @returns the portraits
 */
function DeckFaces({ deck }: { deck: Deck }) {
  const cookies = withCaptain(deck).sort((a, b) => Number(b.captain) - Number(a.captain));
  return (
    <span className="dd-faces">
      {cookies.map((c, i) => (
        <span
          key={`${i}-${c.cookieKr}`}
          className={c.captain ? "dd-face captain" : "dd-face"}
          title={[c.en ? shortName(c.en) : c.cookieKr, c.captain ? "captain" : null]
            .filter(Boolean)
            .join(" · ")}
        >
          <CookieIcon kr={c.cookieKr} en={c.en} size={28} />
          {c.captain ? (
            <span className="crown" role="img" aria-label="Captain">
              ♛
            </span>
          ) : null}
        </span>
      ))}
    </span>
  );
}

/**
 * One line of a deck's kit, its label first and its text cut to a line:
 * the mercenary perks (복지) or the gear preset.
 *
 * @param props - the label and the text, null when the deck names none
 * @returns the line, or null without a text
 */
function KitRow({ label, text }: { label: string; text: string | null }) {
  if (!text) return null;
  return (
    <div className="dd-kit">
      <span className="label">{label}</span>
      <Clamp lines={1}>{text}</Clamp>
    </div>
  );
}

/**
 * The hero card: a dungeon's furthest full-auto deck, with its AUTO badge,
 * stage, power and recommended power first, its formation (levels on the
 * portraits, the captain crowned), its pets, perks and gear preset, its
 * mechanism and each cookie's why on demand, and its sources.
 *
 * @param props - the deck, or undefined when no deck runs the dungeon on full auto, and the board
 * @returns the card, or the empty state
 */
export function HeroDeck({
  deck,
  mode,
  daily,
  sources,
}: BoardContext & { deck: Deck | undefined }) {
  if (!deck?.dailyDungeon) {
    return (
      <section className="dd-section" aria-label={daily.heroTitle}>
        <h3>{daily.heroTitle}</h3>
        <EmptyState>No full-auto deck recorded for this dungeon yet.</EmptyState>
      </section>
    );
  }
  const run = deck.dailyDungeon;
  const cookies = withCaptain(deck).map((c) => ({ ...c, note: c.level ? null : c.levelRule }));
  const swaps = deck.notes.filter((n) => n.kind === "substitution");
  return (
    <section className="dd-section" aria-label={daily.heroTitle}>
      <h3>{daily.heroTitle}</h3>
      <article className="card dd-hero">
        <div className="dd-hero-head">
          <AutoBadge auto={run.auto} />
          <StageFigure stage={run.stage} />
          <PowerChips run={run} />
          <span className="dd-hero-name">
            <DeckLink mode={mode} id={deck.id} deck={deck} />
            <Pill kind={deck.status} />
          </span>
        </div>
        {deck.summary ? (
          <div className="dd-mechanism">
            <Clamp lines={1}>{deck.summary}</Clamp>
          </div>
        ) : null}
        {hasFormation(cookies) ? <Formation cookies={cookies} /> : <Lineup cookies={cookies} />}
        {deck.pets.length ? (
          <div className="chips dd-pets">
            <span className="label">Pets</span>
            {deck.pets.map((p, i) => (
              <span key={`${i}-${p.kr}`} className="chip dd-pet" title={p.en ?? p.kr}>
                <CookieIcon kr={p.kr} en={p.en} size={20} />
                {p.en ?? p.kr}
              </span>
            ))}
          </div>
        ) : null}
        <KitRow label="Perks" text={deck.perks} />
        <KitRow label="Gear" text={run.gearPreset} />
        <details className="dd-why">
          <summary className="label">Why each cookie</summary>
          <ul className="clean">
            {deck.cookies.map((c) => (
              <li key={c.id}>
                <CookieName kr={c.cookieKr} en={c.en} inline />
                <Clamp lines={1}>{c.why}</Clamp>
              </li>
            ))}
          </ul>
        </details>
        {swaps.length ? (
          <ul className="clean dd-swaps">
            {swaps.map((s, i) => (
              <li key={i}>
                <Clamp lines={1}>{`Swap: ${s.text}`}</Clamp>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="card-foot">
          <SourceChips ids={deck.sources} sources={sources} />
        </div>
      </article>
    </section>
  );
}

/**
 * A dungeon's other decks, ranked by stage reached: each row leads with
 * its rank, stage and auto badge, then its name, portraits and power, its
 * mechanism cut to a line, and its sources last.
 *
 * @param props - the ranked decks (the hero left out) and the board
 * @returns the list, or null when there are none
 */
export function RankedDecks({ decks, mode, daily, sources }: BoardContext & { decks: Deck[] }) {
  if (!decks.length) return null;
  return (
    <section className="dd-section" aria-label={daily.decksTitle}>
      <h3>{daily.decksTitle}</h3>
      <ol className="dd-ranks">
        {decks.map((deck, i) => {
          const run = deck.dailyDungeon!;
          return (
            <li key={deck.id} className="dd-rank-row">
              <span className="dd-rank">{i + 1}</span>
              <StageFigure stage={run.stage} />
              <span className="dd-rank-body">
                <span className="dd-rank-top">
                  <AutoBadge auto={run.auto} />
                  <DeckLink mode={mode} id={deck.id} deck={deck} />
                  <PowerChips run={run} />
                </span>
                <DeckFaces deck={deck} />
                {deck.summary ? (
                  <span className="dd-mechanism">
                    <Clamp lines={1}>{deck.summary}</Clamp>
                  </span>
                ) : null}
              </span>
              <SourceChips ids={deck.sources} sources={sources} max={2} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** The pill each kind of evidence shows: a screenshot or video shows the clear, text only claims it. */
const EVIDENCE: Readonly<
  Record<DailyDungeonClear["evidence"], { kind: "verified" | "claimed"; label: string }>
> = {
  screenshot: { kind: "verified", label: "screenshot" },
  video: { kind: "verified", label: "video" },
  text: { kind: "claimed", label: "text only" },
};

/**
 * A dungeon's documented clears, as the API ranks them (furthest stage
 * first, then lowest power): rank, stage and auto first, then the deck,
 * power, player, day and evidence, and the sources last.
 *
 * @param props - the dungeon's clears, the mode's decks by id, and the board
 * @returns the list, or null when there are none
 */
export function ClearList({
  clears,
  decks,
  mode,
  daily,
  sources,
}: BoardContext & { clears: DailyDungeonClear[]; decks: ReadonlyMap<string, Deck> }) {
  if (!clears.length) return null;
  return (
    <section className="dd-section" aria-label={daily.clearsTitle}>
      <h3>{daily.clearsTitle}</h3>
      <ol className="dd-clears">
        {clears.map((clear, i) => {
          const evidence = EVIDENCE[clear.evidence];
          return (
            <li key={clear.id} className="dd-clear-row">
              <span className="dd-rank">{i + 1}</span>
              <StageFigure stage={clear.stage} />
              <span className="dd-rank-body">
                <span className="dd-rank-top">
                  <AutoBadge auto={clear.auto} />
                  {clear.deckId ? (
                    <DeckLink mode={mode} id={clear.deckId} deck={decks.get(clear.deckId)} />
                  ) : (
                    <span className="muted">No deck named</span>
                  )}
                  {clear.power !== null ? (
                    <span className="chip dd-power" title={`Team power ${clear.power}`}>
                      {compactPower(clear.power, clear.powerG)}
                    </span>
                  ) : null}
                  <Pill kind={evidence.kind}>{evidence.label}</Pill>
                </span>
                <span className="dd-clear-meta muted">
                  {[clear.player, clear.date].filter(Boolean).join(" · ")}
                </span>
                {clear.note ? (
                  <span className="dd-mechanism">
                    <Clamp lines={1}>{clear.note}</Clamp>
                  </span>
                ) : null}
              </span>
              <SourceChips ids={clear.sources} sources={sources} max={2} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
