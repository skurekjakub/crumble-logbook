import { Link } from "@tanstack/react-router";
import type { AccountItem, AccountRef, AccountRoadmap as Roadmap } from "../api/types";
import type { LinkTarget, ModeSection } from "../app/modes";
import { MODES } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { Pill } from "../components/Pill";
import type { GaugeView, Priority } from "../lib/account";
import { byPriority, gauge } from "../lib/account";
import { deckId } from "./DeckCard";
import { deckPage } from "./DeckLink";

/** Each priority's group label. */
const PRIORITY_LABEL: Record<Priority, string> = { now: "Now", next: "Next", later: "Later" };

/** The tab a reference to a row of each kind lands on, when its mode has that tab. */
const ENTITY_TAB: Record<string, string> = {
  power_source: "power-sources",
  rune_build: "runes",
  gear_rec: "gear",
  mechanic: "mechanics",
  dungeon_exclusion: "exclusions",
};

/**
 * Where a reference that isn't a deck lands: the tab of its mode that
 * shows its kind of row (a record file's name picks it, `curated/runes.json`
 * the runes tab), else the mode's landing page.
 *
 * @param mode - the mode whose screens show the row
 * @param target - the reference
 * @returns the link target
 */
function refPage(mode: ModeSection, target: AccountRef): LinkTarget {
  const name =
    target.entity === "file"
      ? target.id
          .split("/")
          .at(-1)!
          .replace(/\.[^.]+$/, "")
      : (ENTITY_TAB[target.entity ?? ""] ?? "");
  const wanted = [name, name.replace(/^dungeon-/, "")];
  return mode.tabs.find((tab) => wanted.includes(tab.id))?.link ?? mode.link;
}

/**
 * One reference as a chip at the end of a roadmap row: a deck links to its
 * card on its mode's decks page (an obsolete one marked before its label),
 * any other row to its mode's page for that kind of row, and one that
 * isn't loaded shows as a quiet chip. Only the label is cut short.
 *
 * @param props - the reference
 * @returns the chip
 */
export function RefChip({ target }: { target: AccountRef }) {
  const mode = MODES.find((m) => m.scope.mode === target.mode);
  const title = [target.record, target.entity, target.id].filter(Boolean).join(" · ");
  const label = <span className="ref-label">{target.label}</span>;
  if (!target.found || !mode) {
    return (
      <span className="chip ref missing" title={`${title} (not loaded)`}>
        {label}
      </span>
    );
  }
  if (target.entity === "deck") {
    return (
      <Link
        {...deckPage(mode)}
        hash={deckId({ id: target.id })}
        className="chip ref"
        title={target.obsolete ? `${title} (obsolete)` : title}
      >
        {target.obsolete ? <Pill kind="obsolete" /> : null}
        {label}
      </Link>
    );
  }
  return (
    <Link {...refPage(mode, target)} className="chip ref file" title={title}>
      {label}
    </Link>
  );
}

/**
 * A payoff or cost as a badge (see `gauge`), coloured by its verdict, the
 * full text in the tooltip.
 *
 * @param props - the kind of badge, its text and how it reads
 * @returns the badge
 */
function Gauge({ kind, text, view }: { kind: "payoff" | "cost"; text: string; view: GaugeView }) {
  return (
    <span
      className={`pill badge ${kind} t-${view.tone}`}
      data-glyph={kind === "payoff" ? "+" : "−"}
      title={`${kind === "payoff" ? "Payoff" : "Cost"}: ${text}`}
    >
      {view.text}
    </span>
  );
}

/**
 * One roadmap row: the action in a line, its area chip and its payoff and
 * cost badges; beneath, the `why` with what the badges leave out of the
 * payoff and cost, clamped to a line, and the references as chips at the end.
 *
 * @param props - the item
 * @returns the row
 */
function RoadmapRow({ item }: { item: AccountItem }) {
  const payoff = item.payoff ? gauge("payoff", item.payoff, item.size) : null;
  const cost = item.cost ? gauge("cost", item.cost) : null;
  const detail = [
    item.why,
    payoff?.rest ? `Payoff: ${payoff.rest}` : null,
    cost?.rest ? `Cost: ${cost.rest}` : null,
  ].filter((part) => part !== null);
  return (
    <li className={`road-item prio-${item.priority}`}>
      <div className="road-main">
        <span className="road-action">{item.action}</span>
        <span className="road-badges">
          {item.area ? <span className="chip area">{item.area}</span> : null}
          {item.payoff && payoff ? <Gauge kind="payoff" text={item.payoff} view={payoff} /> : null}
          {item.cost && cost ? <Gauge kind="cost" text={item.cost} view={cost} /> : null}
        </span>
      </div>
      {detail.length || item.refs.length ? (
        <div className="road-foot">
          <span className="road-why">
            {detail.length ? (
              <Clamp lines={1} perLine={80}>
                {detail.join(" · ")}
              </Clamp>
            ) : null}
          </span>
          {item.refs.length ? (
            <span className="chips refs">
              {item.refs.map((r, i) => (
                <RefChip key={`${i}-${r.id}`} target={r} />
              ))}
            </span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

/**
 * The roadmap: its verdict, its items grouped now, next, later under
 * coloured priority badges, each item one row, then the avenues it parked.
 *
 * @param props - the roadmap
 * @returns the roadmap
 */
export function AccountRoadmap({ roadmap }: { roadmap: Roadmap }) {
  return (
    <div className="road">
      {roadmap.verdict ? (
        <p className="road-verdict">
          <Clamp lines={2} perLine={90}>
            {roadmap.verdict}
          </Clamp>
        </p>
      ) : null}
      {byPriority(roadmap.items).map((group) => (
        <section key={group.priority} className={`road-group prio-${group.priority}`}>
          <h4>
            <span className={`prio prio-${group.priority}`}>{PRIORITY_LABEL[group.priority]}</span>
          </h4>
          <ol>
            {group.items.map((item) => (
              <RoadmapRow key={item.id} item={item} />
            ))}
          </ol>
        </section>
      ))}
      {roadmap.parked.length ? (
        <section className="road-group prio-parked">
          <h4>
            <span className="prio prio-parked">Parked</span>
          </h4>
          <ol>
            {roadmap.parked.map((avenue, i) => (
              <li key={i} className="road-item">
                <div className="road-main">
                  <span className="road-action">{avenue.avenue}</span>
                </div>
                <div className="road-foot">
                  <span className="road-why">
                    {avenue.why ? (
                      <Clamp lines={1} perLine={80}>
                        {avenue.why}
                      </Clamp>
                    ) : null}
                  </span>
                  {avenue.refs.length ? (
                    <span className="chips refs">
                      {avenue.refs.map((r, j) => (
                        <RefChip key={`${j}-${r.id}`} target={r} />
                      ))}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
