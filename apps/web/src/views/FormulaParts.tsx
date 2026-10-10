import { useId, useState } from "react";
import type { FormulaClaim, FormulaConstant, FormulaStep } from "../api/types";
import { Clamp } from "../components/Clamp";
import { Pill } from "../components/Pill";
import { SourceChips } from "../components/SourceChips";
import {
  confidenceBadge,
  critEdge,
  critTiers,
  expectedCrit,
  formatPct,
  formatTimes,
  parsePct,
  stackingBadge,
  verdictBadge,
} from "../lib/damage-formula";
import type { SourceIndex } from "../lib/sources";

/**
 * The element id of a step's card, which the formula strip links to.
 *
 * @param slug - the step's slug
 * @returns the id
 */
export function stepAnchor(slug: string): string {
  return `step-${slug}`;
}

/**
 * The whole product as one compact line: each multiplier a chip linking to
 * its card, joined by ×, inside the floor.
 *
 * @param props - the formula's multiplier steps, in code order
 * @returns the line
 */
export function FormulaStrip({ factors }: { factors: readonly FormulaStep[] }) {
  return (
    <p className="formula-strip mono" aria-label="Damage formula">
      <span className="fx-op">dmg = ⌊</span>
      {factors.map((step, i) => (
        <span key={step.slug} className="fx-term">
          {i > 0 ? <span className="fx-op">×</span> : null}
          <a
            href={`#${stepAnchor(step.slug)}`}
            className={`fx-chip${step.stacking === "screen" ? " screen" : ""}`}
            title={step.expression}
          >
            {step.name}
          </a>
        </span>
      ))}
      <span className="fx-op">⌋</span>
    </p>
  );
}

/** Props for {@link StepCard}. */
export interface StepCardProps {
  /** The step. */
  step: FormulaStep;
  /** Its number in the pipeline, from 1. */
  number: number;
  /** The server-side constants the step reads. */
  constants: readonly FormulaConstant[];
  /** Id → source, for the chips. */
  sources: SourceIndex;
}

/**
 * One pipeline step as a card, badges and expression first and every line
 * of prose clamped, so the card reads at a glance; its server constants
 * link to their cards, and its sources sit at the foot.
 *
 * @param props - the step, its number, its constants and the source index
 * @returns the card
 */
export function StepCard({ step, number, constants, sources }: StepCardProps) {
  const confidence = confidenceBadge(step.confidence);
  const stacking = step.stacking ? stackingBadge(step.stacking) : null;
  return (
    <article
      id={stepAnchor(step.slug)}
      className={`card fx-step fx-${step.phase}${step.stacking === "screen" ? " screen" : ""}`}
    >
      <div className="fx-step-head">
        <span className="fx-no" aria-hidden="true">
          {number}
        </span>
        <h4>{step.name}</h4>
        <span className="fx-badges">
          <Pill kind={confidence.kind}>{confidence.label}</Pill>
          {stacking ? <Pill kind={stacking.kind}>{stacking.label}</Pill> : null}
        </span>
      </div>
      <code className="fx-expr">{step.expression}</code>
      {step.feeds.length ? (
        <span className="chips fx-feeds" aria-label="Fed by">
          {step.feeds.map((stat) => (
            <span key={stat} className="chip">
              {stat}
            </span>
          ))}
        </span>
      ) : null}
      {step.appliesTo ? (
        <p className="fx-applies">
          <span aria-hidden="true">◎</span> {step.appliesTo}
        </p>
      ) : null}
      <p className="fx-why">
        <Clamp lines={1} perLine={28}>
          {step.why}
        </Clamp>
      </p>
      {step.detail ? (
        <p className="fx-detail muted">
          <Clamp lines={1} perLine={70}>
            {step.detail}
          </Clamp>
        </p>
      ) : null}
      {constants.length ? (
        <span className="chips fx-consts" aria-label="Server constants">
          {constants.map((c) => (
            <a key={c.slug} href={`#const-${c.slug}`} className="chip fx-const">
              {c.symbol} {c.value == null ? "?" : c.value}
            </a>
          ))}
        </span>
      ) : null}
      <div className="fx-foot">
        {step.codeRef ? <span className="fx-ref mono">{step.codeRef}</span> : <span />}
        <SourceChips ids={step.sources} sources={sources} max={2} />
      </div>
    </article>
  );
}

/**
 * A server-side constant as a card: its symbol, whether its value is known,
 * the client field, what it does, the value a community tool assumes, and
 * how to measure it, clamped.
 *
 * @param props - the constant and the source index
 * @returns the card
 */
export function ConstantCard({
  constant,
  sources,
}: {
  constant: FormulaConstant;
  sources: SourceIndex;
}) {
  return (
    <article id={`const-${constant.slug}`} className="card fx-constant">
      <div className="fx-step-head">
        <h4 className="mono">{constant.symbol}</h4>
        {constant.value == null ? (
          <Pill kind="low">unknown</Pill>
        ) : (
          <Pill kind="high">{constant.value}</Pill>
        )}
      </div>
      <p className="fx-why">{constant.meaning}</p>
      {constant.candidate ? (
        <span className="chips">
          <span className="chip fx-guess" title="The value a community tool assumes">
            guess: {constant.candidate}
          </span>
        </span>
      ) : null}
      <p className="fx-measure">
        <span className="label">Measure</span>{" "}
        <Clamp lines={2} perLine={60}>
          {constant.measure}
        </Clamp>
      </p>
      <div className="fx-foot">
        <span className="fx-ref mono" title={constant.labelKr ?? undefined}>
          {constant.field} · {constant.holder}
        </span>
        <SourceChips ids={constant.sources} sources={sources} max={2} />
      </div>
    </article>
  );
}

/**
 * A community claim held against the code, as a row: the verdict badge
 * first, the claim, the code's reading clamped, where the claim is
 * recorded, and the sources at the end.
 *
 * @param props - the claim and the source index
 * @returns the row
 */
export function ClaimRow({ claim, sources }: { claim: FormulaClaim; sources: SourceIndex }) {
  const verdict = verdictBadge(claim.verdict);
  const ref =
    claim.refRecord && claim.refTitle
      ? `${/^\d+/.exec(claim.refRecord)?.[0] ?? claim.refRecord} · ${claim.refTitle}`
      : null;
  return (
    <li className={`fx-claim v-${claim.verdict}`}>
      <span className="fx-verdict">
        <Pill kind={verdict.kind}>{verdict.label}</Pill>
      </span>
      <div className="fx-claim-body">
        <p className="fx-claim-text">
          <Clamp lines={2} perLine={70}>
            {claim.claim}
          </Clamp>
        </p>
        <p className="fx-claim-code muted">
          <span className="label">Code</span>{" "}
          <Clamp lines={1} perLine={40}>
            {claim.code}
          </Clamp>
        </p>
      </div>
      <span className="fx-claim-end">
        {ref ? (
          <span className="chip fx-claim-ref" title={`research/${claim.refRecord ?? ""}`}>
            {ref}
          </span>
        ) : null}
        <SourceChips ids={claim.sources} sources={sources} max={2} />
      </span>
    </li>
  );
}

/** The calculator's starting stats: a typical Conquest carry past 100% crit. */
const START = { rate: "135", damage: "100" };

/**
 * The crit calculator: crit rate (after the target's crit RES) and crit
 * DMG in, the expected multiplier, the tiers every hit gets and the chance
 * of one more, and which stat's next point is worth more, out. A field
 * that isn't a percentage shows its error and leaves the result blank.
 *
 * @returns the calculator
 */
export function CritCalculator() {
  const [rate, setRate] = useState(START.rate);
  const [damage, setDamage] = useState(START.damage);
  const id = useId();
  const r = parsePct(rate);
  const d = parsePct(damage);
  const ready = r != null && d != null;
  const tiers = r == null ? null : critTiers(r);
  const edge = ready ? critEdge(r, d) : null;
  return (
    <div className="card fx-calc">
      <div className="fx-calc-fields">
        <label htmlFor={`${id}-rate`}>
          <span className="label">Crit rate − target crit RES</span>
          <span className="fx-input">
            <input
              id={`${id}-rate`}
              inputMode="text"
              value={rate}
              aria-invalid={r == null}
              onChange={(e) => {
                setRate(e.target.value);
              }}
            />
            %
          </span>
        </label>
        <label htmlFor={`${id}-dmg`}>
          <span className="label">Crit DMG</span>
          <span className="fx-input">
            <input
              id={`${id}-dmg`}
              inputMode="decimal"
              value={damage}
              aria-invalid={d == null}
              onChange={(e) => {
                setDamage(e.target.value);
              }}
            />
            %
          </span>
        </label>
      </div>
      {ready && tiers && edge ? (
        <div className="fx-calc-out" aria-live="polite">
          <span className="fx-big mono" aria-label="Expected crit multiplier">
            {formatTimes(expectedCrit(r, d))}
          </span>
          <span className="chips">
            <span className="chip">
              {tiers.sure} sure tier{tiers.sure === 1 ? "" : "s"}
            </span>
            {tiers.chance > 0 ? (
              <span className="chip">
                +{formatPct(tiers.chance, 1)} for tier {tiers.sure + 1}
              </span>
            ) : null}
          </span>
          <span className="fx-next">
            {edge.better === "even" ? (
              <Pill kind="alt">either: even</Pill>
            ) : (
              <Pill kind="good">
                next point: {edge.better === "rate" ? "crit rate" : "crit DMG"}
              </Pill>
            )}
            <span className="muted">
              +1% rate {formatPct(edge.rate)}; +1% DMG {formatPct(edge.damage)}
            </span>
          </span>
        </div>
      ) : (
        <p className="fx-calc-out err" role="alert">
          Enter both as percentages, e.g. 135.
        </p>
      )}
    </div>
  );
}
