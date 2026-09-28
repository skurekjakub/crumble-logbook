import { useQuery } from "@tanstack/react-query";
import {
  decksQuery,
  recommendationsQuery,
  rngFactorsQuery,
  runeBuildsQuery,
  stageClearsQuery,
  takeawaysQuery,
  timelineQuery,
} from "../api/queries";
import type { ModeSection, RiftConfig } from "../app/modes";
import { SourceChips } from "../components/SourceChips";
import type { SourceIndex } from "../lib/sources";
import { mentionsAny } from "../lib/stage";

/** One line of the Rift page's list of the record's other Rift findings. */
interface Finding {
  /** A React key, unique across the list. */
  key: string;
  /** What kind of finding it is, or where in the record it sits. */
  label: string;
  /** The finding. */
  text: string;
  /** A second line under it, when the row has one. */
  detail: string | null;
  /** The sources the row cites. */
  sources: readonly string[];
}

/** Props for {@link RiftFindings}. */
export interface RiftFindingsProps {
  /** The stage mode: its scope and research record. */
  mode: ModeSection;
  /** The Rift page's config: its decks and the words that mark a finding as about the Rift. */
  rift: RiftConfig;
  /** The source index the chips link through. */
  sources: SourceIndex;
  /** The card's DOM id, which the page's "On this page" list links to. */
  id: string;
}

/**
 * The record's findings about the Rift that live outside the Rift's own
 * tables and mechanics topic, each with its sources: takeaways, dated
 * events, RNG factors and rune lines, the "for your account" advice, clear
 * notes, and what the decks not played in the Rift say (summary, ceiling,
 * notes, a cookie's why), wherever the text mentions the Rift. Rune lines
 * tied to a Rift deck count too. Mechanics filed under other topics reach
 * the page through their `alsoTopics` instead (see `TopicNotes`).
 *
 * @param props - the stage mode, the Rift config, the source index and the card's id
 * @returns the card, or null when nothing else mentions the Rift
 */
export function RiftFindings({ mode, rift, sources, id }: RiftFindingsProps) {
  /**
   * Tells whether a row's text mentions the Rift.
   *
   * @param text - a row's text
   * @returns `true` if the row is about the Rift
   */
  const about = (text: string) => mentionsAny(text, rift.mentions);
  const takeaways = useQuery(takeawaysQuery(mode.scope)).data ?? [];
  const timeline = useQuery(timelineQuery(mode.scope)).data ?? [];
  const rng = useQuery(rngFactorsQuery(mode.scope)).data ?? [];
  const runes = useQuery(runeBuildsQuery(mode.scope)).data ?? [];
  const advice = useQuery(recommendationsQuery(mode.recordSlug)).data ?? [];
  const clears = useQuery(stageClearsQuery()).data ?? [];
  const decks = useQuery(decksQuery(mode.scope)).data ?? [];
  const items: Finding[] = [
    ...takeaways
      .filter((t) => about(`${t.text} ${t.detail ?? ""}`))
      .map((t) => ({
        key: `t${t.id}`,
        label: "Finding",
        text: t.text,
        detail: t.detail,
        sources: t.sources,
      })),
    ...advice.flatMap((r) =>
      r.changes.filter(about).map((change, index) => ({
        key: `a${r.id}-${index}`,
        label: "For your account",
        text: change,
        detail: null,
        sources: r.sources,
      })),
    ),
    ...timeline
      .filter((e) => about(e.event))
      .map((e) => ({
        key: `e${e.id}`,
        label: e.date,
        text: e.event,
        detail: null,
        sources: e.sources,
      })),
    ...rng
      .filter((f) => about(`${f.factor} ${f.effect} ${f.mitigation ?? ""}`))
      .map((f) => ({
        key: `r${f.id}`,
        label: "Luck",
        text: `${f.factor}: ${f.effect}`,
        detail: f.mitigation,
        sources: f.sources,
      })),
    ...runes
      .filter((r) => about(`${r.lines} ${r.why}`) || r.decks.some((d) => rift.decks.includes(d)))
      .map((r) => ({
        key: `u${r.id}`,
        label: `Runes: ${r.en ?? r.cookieKr}`,
        text: r.lines,
        detail: r.why,
        sources: r.sources,
      })),
    ...decks
      .filter((d) => !rift.decks.includes(d.id))
      .flatMap((d) =>
        [
          ...[d.summary, d.ceilingText].map((text, index) => ({ key: `s${index}`, text })),
          ...d.notes.map((n, index) => ({ key: `n${index}`, text: n.text })),
          ...d.cookies.map((c) => ({
            key: `c${c.id}`,
            text: `${c.en ?? c.cookieKr}: ${c.why}`,
          })),
        ]
          .filter((line): line is { key: string; text: string } => !!line.text && about(line.text))
          .map((line) => ({
            key: `d${d.id}-${line.key}`,
            label: `Deck: ${d.nameEn}`,
            text: line.text,
            detail: null,
            sources: d.sources,
          })),
      ),
    ...clears
      .filter((c) => c.note !== null && about(c.note))
      .map((c) => ({
        key: `c${c.id}`,
        label: `Clear ${c.chapter}-${c.stageNo}`,
        text: c.note!,
        detail: null,
        sources: c.sources,
      })),
  ];
  if (!items.length) return null;
  return (
    <section className="card" id={id}>
      <h3>Elsewhere in the record</h3>
      <ul className="clean rift-findings">
        {items.map((item) => (
          <li key={item.key}>
            <span className="label">{item.label}</span> {item.text}
            {item.detail ? <div className="muted">{item.detail}</div> : null}
            <SourceChips ids={item.sources} sources={sources} />
          </li>
        ))}
      </ul>
    </section>
  );
}
