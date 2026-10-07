import type { CostType, DataPointKind, StepBasis } from "@crumble/schema";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import type { PowerSource, ShopPackage } from "../api/types";
import type { ModeSection } from "../app/modes";
import { modeLink } from "../app/modes";
import type { PillKind } from "../components/Pill";
import { Pill } from "../components/Pill";
import type { EfficiencyGrade } from "../lib/team-power";
import { BASIS_LABELS, COST_TYPES, KIND_LABELS, efficiencyGrade } from "../lib/team-power";

/**
 * The DOM id of a power source's card on the cost and efficiency page.
 *
 * @param slug - the power source's slug
 * @returns the id
 */
export function powerSourceAnchor(slug: string): string {
  return `ps-${slug}`;
}

/** Props for {@link PowerSourceLink}. */
export interface PowerSourceLinkProps {
  /** The team-power mode. */
  mode: ModeSection;
  /** The power source's slug. */
  slug: string;
  /** The power sources, to name it; a slug none has shows as it is. */
  sources: readonly PowerSource[];
  /** Show the Korean name after the English one. */
  withKr?: boolean;
}

/**
 * A power source's name, linking to its card on the cost and efficiency page.
 *
 * @param props - the mode, the slug, the power sources and whether to show the Korean name
 * @returns the link
 */
export function PowerSourceLink({ mode, slug, sources, withKr = false }: PowerSourceLinkProps) {
  const source = sources.find((s) => s.slug === slug);
  return (
    <>
      <Link {...modeLink(mode.id, "/$mode/power-sources")} hash={powerSourceAnchor(slug)}>
        {source?.nameEn ?? slug}
      </Link>
      {withKr && source ? <span className="kr"> {source.nameKr}</span> : null}
    </>
  );
}

/** Props for {@link PackageLink}. */
export interface PackageLinkProps {
  /** The team-power mode. */
  mode: ModeSection;
  /** The package's slug. */
  slug: string;
  /** The packages, to name it; a slug none has shows as it is. */
  packages: readonly ShopPackage[];
  /** Show the Korean name after the English one. */
  withKr?: boolean;
}

/**
 * A package's name, linking to the packages page filtered to it.
 *
 * @param props - the mode, the slug, the packages and whether to show the Korean name
 * @returns the link
 */
export function PackageLink({ mode, slug, packages, withKr = false }: PackageLinkProps) {
  const pack = packages.find((p) => p.slug === slug);
  const name = pack?.nameEn ?? slug;
  return (
    <>
      <Link {...modeLink(mode.id, "/$mode/packages")} search={{ q: name }}>
        {name}
      </Link>
      {withKr && pack ? <span className="kr"> {pack.nameKr}</span> : null}
    </>
  );
}

/** The pill each basis or kind of figure shows: only a posted one is green. */
const BASIS_PILLS: Readonly<Record<StepBasis | DataPointKind, PillKind>> = {
  posted: "verified",
  claimed: "claimed",
  inferred: "alt",
  community: "alt",
  unmeasured: "legacy",
};

/** What each basis or kind of figure means, for its pill's tooltip and the key. */
const BASIS_MEANS: Readonly<Record<StepBasis | DataPointKind, string>> = {
  posted: "a player's own before-and-after figure",
  claimed: "stated, not measured",
  inferred: "the record's own arithmetic",
  community: "the community's stated order",
  unmeasured: "nobody measured it",
};

/** Props for {@link BasisPill}. */
export interface BasisPillProps {
  /** What a step's place rests on, or how a figure is known. */
  basis: StepBasis | DataPointKind;
  /** The record's own wording of the basis, added to the tooltip. */
  note?: string | null;
}

/**
 * How a step's place or a figure is known, as a verdict pill: green only
 * for a player's own measurement. Its meaning and the record's note show
 * on hover.
 *
 * @param props - the basis and the record's note on it
 * @returns the pill
 */
export function BasisPill({ basis, note }: BasisPillProps) {
  const label = basis === "inferred" ? KIND_LABELS.inferred : BASIS_LABELS[basis];
  const tip = [BASIS_MEANS[basis], note].filter(Boolean).join(" · ");
  return (
    <span className="basis-pill" title={tip}>
      <Pill kind={BASIS_PILLS[basis]}>{label}</Pill>
    </span>
  );
}

/**
 * The key to the basis pills, one short line.
 *
 * @param props - the bases the page shows, in order
 * @returns the key
 */
export function BasisKey({
  bases = ["posted", "claimed", "unmeasured", "community"],
}: {
  bases?: ReadonlyArray<StepBasis | DataPointKind>;
}) {
  return (
    <div className="legend-row basis-key" aria-label="How each step is known">
      {bases.map((b) => (
        <span key={b}>
          <BasisPill basis={b} /> {BASIS_MEANS[b]}
        </span>
      ))}
    </div>
  );
}

/** The pill each efficiency grade shows. */
const GRADE_PILLS: Readonly<Record<EfficiencyGrade, PillKind>> = {
  high: "high",
  medium: "medium",
  low: "low",
  none: "legacy",
};

/** Labels per efficiency grade. */
export const GRADE_LABELS: Readonly<Record<EfficiencyGrade, string>> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None",
};

/**
 * The grade an efficiency note leads with, as a pill, the note itself on
 * hover; a quiet dash for a note that leads with no grade.
 *
 * @param props - the record's efficiency note
 * @returns the pill, or the dash
 */
export function GradePill({ note }: { note: string }) {
  const grade = efficiencyGrade(note);
  if (grade === null) {
    return (
      <span className="grade-none" title={note}>
        –
      </span>
    );
  }
  return (
    <span className="grade" title={note}>
      <Pill kind={GRADE_PILLS[grade]}>{GRADE_LABELS[grade]}</Pill>
    </span>
  );
}

/**
 * A power source's cost type as a small tinted tag (free, time-gated,
 * free or paid, paid). Not a verdict, so it carries no glyph.
 *
 * @param props - the cost type
 * @returns the tag
 */
export function CostTag({ type }: { type: CostType }) {
  return <span className={`cost-tag c-${type}`}>{COST_TYPES.find(([t]) => t === type)?.[1]}</span>;
}

/**
 * Drops a search param naming a value the loaded lists don't have, so the
 * URL never keeps a filter the page can't apply.
 *
 * @param value - the param's value, when the URL gives one
 * @param known - the values the page can apply, or undefined while they load
 * @param drop - removes the param from the URL
 */
export function useDropUnknown(
  value: string | undefined,
  known: readonly string[] | undefined,
  drop: () => void,
): void {
  const unknown = value !== undefined && known !== undefined && !known.includes(value);
  useEffect(() => {
    if (unknown) drop();
  }, [unknown, drop]);
}

/** Props for {@link Switch}. */
export interface SwitchProps<V extends string> {
  /** The switch's accessible name. */
  label: string;
  /** `[value, label]` pairs, in order. */
  options: ReadonlyArray<readonly [value: V, label: string]>;
  /** The chosen value. */
  value: V;
  /** Called with the value picked. */
  onChange: (value: V) => void;
}

/**
 * A row of buttons choosing one value, the chosen one pressed.
 *
 * @param props - the name, the options, the chosen value and its setter
 * @returns the switch
 */
export function Switch<V extends string>({ label, options, value, onChange }: SwitchProps<V>) {
  return (
    <div className="switch" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}
