import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSourceIndex } from "../api/hooks";
import {
  formulaClaimsQuery,
  formulaConstantsQuery,
  formulaStepsQuery,
  mechanicsQuery,
  takeawaysQuery,
} from "../api/queries";
import type { FormulaConstant, FormulaStep, Mechanic } from "../api/types";
import { FORMULA_SCOPE } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { ViewHeader } from "../components/ViewHeader";
import { byTopic } from "../lib/mechanics";
import type { SourceIndex } from "../lib/sources";
import { stance } from "../lib/verdict";
import { ClaimRow, ConstantCard, CritCalculator, FormulaStrip, StepCard } from "./FormulaParts";

/** The mechanics topics the screen reads, each shown in its own section. */
export const FORMULA_TOPICS = {
  stacking: "stacking",
  crit: "crit",
  open: "open_question",
  method: "method",
} as const;

/** The screen's sections, in page order: each heading's id and text. */
const PARTS = {
  pipeline: { id: "fx-pipeline", title: "Pipeline" },
  crit: { id: "fx-crit", title: "Crit" },
  upgrade: { id: "fx-upgrade", title: "What to upgrade" },
  stacking: { id: "fx-stacking", title: "Inside a bucket" },
  constants: { id: "fx-constants", title: "Server constants" },
  claims: { id: "fx-claims", title: "Community vs code" },
  open: { id: "fx-open", title: "Open questions" },
} as const;

/** The "On this page" list: one link per section. */
const TOC = Object.values(PARTS).map((p) => ({ id: p.id, label: p.title }));

/** The pipeline's phases, in order, with the heading each group shows. */
const PHASES = [
  { phase: "gate", title: "Before the product" },
  { phase: "factor", title: "Multipliers, in code order" },
  { phase: "result", title: "After the product" },
] as const;

/**
 * A titled page section, exposed as a region named by its heading.
 *
 * @param props - the section's heading id and text, an optional one-line explainer, and its content
 * @returns the section
 */
function Section({
  part: { id, title },
  lede,
  children,
}: {
  part: { id: string; title: string };
  lede?: string;
  children: ReactNode;
}) {
  return (
    <section className="fx-sec" aria-labelledby={id}>
      <h3 id={id}>{title}</h3>
      {lede ? <p className="fx-lede muted">{lede}</p> : null}
      {children}
    </section>
  );
}

/**
 * Cited mechanics as compact rows: the title in bold, the body clamped to
 * a line, the sources at the end.
 *
 * @param props - the rows, an optional marker shown before each, and the source index
 * @returns the list, or an empty state when there are no rows
 */
function MechanicRows({
  rows,
  mark,
  sources,
}: {
  rows: readonly Mechanic[];
  mark?: string;
  sources: SourceIndex;
}) {
  if (!rows.length) return <EmptyState>Nothing recorded yet.</EmptyState>;
  return (
    <ul className="fx-rows">
      {rows.map((m) => (
        <li key={m.id}>
          {mark ? (
            <span className="fx-mark" aria-hidden="true">
              {mark}
            </span>
          ) : null}
          <span className="fx-row-body">
            <strong>{m.title}</strong>{" "}
            <span className="muted">
              <Clamp lines={1} perLine={80}>
                {m.body}
              </Clamp>
            </span>
          </span>
          <SourceChips ids={m.sources} sources={sources} max={1} />
        </li>
      ))}
    </ul>
  );
}

/**
 * An upgrade verdict's marker: a green tick for one that says what to do,
 * a red cross for one whose wording says what to avoid (see {@link stance}).
 *
 * @param props - the verdict's text
 * @returns the marker, named for assistive tech by its stance
 */
function VerdictMark({ text }: { text: string }) {
  return stance(text) === "avoid" ? (
    <span className="fx-mark avoid" role="img" aria-label="avoid">
      ✗
    </span>
  ) : (
    <span className="fx-mark good" role="img" aria-label="do">
      ✓
    </span>
  );
}

/**
 * The damage formula screen: the whole product as one line over a page of
 * sections, from the pipeline of steps to what to upgrade, how the
 * community's model holds up and what is still open, with the method at
 * the foot. Each block renders its own query, so one failed resource
 * leaves the others in place.
 *
 * @returns the screen
 */
export function FormulaView() {
  const sources = useSourceIndex();
  const steps = useQuery(formulaStepsQuery());
  const constants = useQuery(formulaConstantsQuery());
  const claims = useQuery(formulaClaimsQuery());
  const mechanics = useQuery(mechanicsQuery(FORMULA_SCOPE));
  const takeaways = useQuery(takeawaysQuery(FORMULA_SCOPE));

  const mechs = mechanics.data ?? [];
  const consts = constants.data ?? [];

  return (
    <>
      <ViewHeader
        title="What multiplies what"
        lede={[
          "Every bucket multiplies; inside a bucket, buffs add.",
          "Badges: how each step is known, and how it stacks.",
        ]}
      />
      <QueryResult query={steps} resource="formula steps">
        {(rows) =>
          rows.length ? (
            <FormulaStrip factors={rows.filter((s) => s.phase === "factor")} />
          ) : (
            <EmptyState>No damage formula loaded yet.</EmptyState>
          )
        }
      </QueryResult>

      <TocLayout items={TOC}>
        <Section part={PARTS.pipeline} lede="Read from the 1.5.002 client, step by step.">
          <QueryResult query={steps} resource="formula steps">
            {(rows) => <Pipeline steps={rows} constants={consts} sources={sources} />}
          </QueryResult>
        </Section>

        <Section part={PARTS.crit} lede="Expected crit is linear in crit rate, past 100% too.">
          <CritCalculator />
          <MechanicRows rows={byTopic(mechs, FORMULA_TOPICS.crit)} mark="✦" sources={sources} />
        </Section>

        <Section part={PARTS.upgrade}>
          <QueryResult query={takeaways} resource="takeaways">
            {(rows) =>
              rows.length ? (
                <ul className="fx-rows fx-verdicts">
                  {rows.map((t) => (
                    <li key={t.id}>
                      <VerdictMark text={t.text} />
                      <span className="fx-row-body">
                        <strong>{t.text}</strong>
                        {t.detail ? (
                          <>
                            {" "}
                            <span className="muted">
                              <Clamp lines={1} perLine={80}>
                                {t.detail}
                              </Clamp>
                            </span>
                          </>
                        ) : null}
                      </span>
                      <SourceChips ids={t.sources} sources={sources} max={1} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>No upgrade verdicts yet.</EmptyState>
              )
            }
          </QueryResult>
        </Section>

        <Section part={PARTS.stacking} lede="How battle bonuses combine before the product.">
          <QueryResult query={mechanics} resource="mechanics">
            {() => (
              <MechanicRows rows={byTopic(mechs, FORMULA_TOPICS.stacking)} sources={sources} />
            )}
          </QueryResult>
        </Section>

        <Section part={PARTS.constants} lede="Server data, not in the client: measure them.">
          <QueryResult query={constants} resource="formula constants">
            {(rows) =>
              rows.length ? (
                <div className="fx-grid">
                  {rows.map((c) => (
                    <ConstantCard key={c.slug} constant={c} sources={sources} />
                  ))}
                </div>
              ) : (
                <EmptyState>No constants recorded yet.</EmptyState>
              )
            }
          </QueryResult>
        </Section>

        <Section part={PARTS.claims} lede="What players say, checked against the code.">
          <QueryResult query={claims} resource="formula claims">
            {(rows) =>
              rows.length ? (
                <ul className="fx-claims">
                  {rows.map((c) => (
                    <ClaimRow key={c.slug} claim={c} sources={sources} />
                  ))}
                </ul>
              ) : (
                <EmptyState>No claims checked yet.</EmptyState>
              )
            }
          </QueryResult>
        </Section>

        <Section part={PARTS.open}>
          <QueryResult query={mechanics} resource="mechanics">
            {() => (
              <MechanicRows rows={byTopic(mechs, FORMULA_TOPICS.open)} mark="?" sources={sources} />
            )}
          </QueryResult>
        </Section>

        <Method rows={byTopic(mechs, FORMULA_TOPICS.method)} />
      </TocLayout>
    </>
  );
}

/**
 * The pipeline: the steps as numbered cards, grouped by phase in order.
 *
 * @param props - the steps in code order, every constant, and the source index
 * @returns the groups, or an empty state when there are no steps
 */
function Pipeline({
  steps,
  constants,
  sources,
}: {
  steps: readonly FormulaStep[];
  constants: readonly FormulaConstant[];
  sources: SourceIndex;
}) {
  if (!steps.length) return <EmptyState>No damage formula loaded yet.</EmptyState>;
  const number = new Map(steps.map((s, i) => [s.slug, i + 1]));
  return (
    <>
      {PHASES.map(({ phase, title }) => {
        const group = steps.filter((s) => s.phase === phase);
        if (!group.length) return null;
        return (
          <div key={phase} className="fx-phase">
            <h4 className="fx-phase-title">{title}</h4>
            <div className="fx-grid">
              {group.map((step) => (
                <StepCard
                  key={step.slug}
                  step={step}
                  number={number.get(step.slug) ?? 0}
                  constants={constants.filter((c) => c.step === step.slug)}
                  sources={sources}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

/**
 * The method at the foot of the page: client version and tools, small.
 *
 * @param props - the method rows
 * @returns the footer, or nothing without rows
 */
function Method({ rows }: { rows: readonly Mechanic[] }) {
  if (!rows.length) return null;
  return (
    <footer className="fx-method" aria-label="Method">
      {rows.map((m) => (
        <span key={m.id} className="fx-method-item">
          <strong>{m.title}</strong> <span className="muted">{m.body}</span>
        </span>
      ))}
    </footer>
  );
}
