import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import type { PowerSource, ShopPackage } from "../api/types";
import type { ModeSection } from "../app/modes";
import { modeLink } from "../app/modes";

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
