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
  | "obsolete"
  | "good"
  | "avoid";

/** The verdict a kind reads as: its colour family and the glyph before its text. */
type Tone = "good" | "info" | "warn" | "bad" | "quiet";

/** Each kind's tone. */
const TONE: Record<PillKind, Tone> = {
  meta: "good",
  high: "good",
  verified: "good",
  good: "good",
  alt: "info",
  medium: "warn",
  claimed: "warn",
  niche: "warn",
  obsolete: "quiet",
  legacy: "quiet",
  low: "bad",
  disputed: "bad",
  avoid: "bad",
};

/** Each tone's glyph, so the verdict reads without colour too. */
const GLYPH: Record<Tone, string> = {
  good: "✓",
  info: "◆",
  warn: "!",
  bad: "✕",
  quiet: "–",
};

/** Props for {@link Pill}. */
export interface PillProps {
  /** Status kind; null or undefined renders nothing. */
  kind: PillKind | null | undefined;
  /** Text to show; defaults to the kind itself. */
  children?: ReactNode;
}

/**
 * A status badge, e.g. a deck tier, a confidence level, or screenshot or
 * claimed evidence: a tinted pill whose glyph and colour give the verdict
 * (good, caution, bad, retired) before its text is read.
 *
 * @param props - the pill's kind and text
 * @returns the pill, or null without a kind
 */
export function Pill({ kind, children }: PillProps) {
  if (!kind) return null;
  const tone = TONE[kind];
  // The glyph is drawn by CSS from the attribute, so it stays out of the pill's text.
  return (
    <span className={`pill ${kind} t-${tone}`} data-glyph={GLYPH[tone]}>
      {children ?? kind}
    </span>
  );
}
