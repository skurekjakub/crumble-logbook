import type { ReactNode } from "react";

/** Pill kinds; each is also the CSS modifier that colours it (see `components.css`). */
export type PillKind =
  | "meta"
  | "alt"
  | "legacy"
  | "niche"
  | "high"
  | "medium"
  | "low"
  | "disputed"
  | "verified"
  | "claimed"
  | "obsolete";

/** Props for {@link Pill}. */
export interface PillProps {
  /** Status kind; null or undefined renders nothing. */
  kind: PillKind | null | undefined;
  /** Text to show; defaults to the kind itself. */
  children?: ReactNode;
}

/**
 * A status pill, e.g. a deck tier, a confidence level, or screenshot/claimed evidence.
 *
 * @param props - the pill's kind and text
 * @returns the pill, or null without a kind
 */
export function Pill({ kind, children }: PillProps) {
  if (!kind) return null;
  return <span className={`pill ${kind}`}>{children ?? kind}</span>;
}
