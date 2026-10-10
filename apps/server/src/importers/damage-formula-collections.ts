/**
 * The damage formula's curated collections: each file's schema, its
 * checks and its mapping onto the damage formula tables. Every row is one
 * the record owns, cited to its own sources. The seed schemas take each
 * field's rule from the table's insert schema, so a row the importer
 * accepts is one the API would. A constant names the step that reads it,
 * and a claim the mechanic it is recorded as; a write step checks each
 * against the rows stored when it runs.
 *
 * @module
 */
import {
  formulaClaimInsert,
  formulaConstantInsert,
  formulaStepInsert,
  sourceId,
} from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import type { Repos } from "../repos";
import type { RowRefs } from "./collection-kit";
import { assertDistinct, collection, parseRows } from "./collection-kit";
import { assertUnclaimed } from "./shared";
import type { WriteStep } from "./steps";
import { insertCited } from "./steps";

/** The source ids a curated row cites: at least one. */
const cited = z.array(sourceId).min(1);

const step = formulaStepInsert.shape;
const constant = formulaConstantInsert.shape;
const claim = formulaClaimInsert.shape;

/**
 * One entry of `formula-steps.json`, in code order: a step by its curated
 * id, where it sits, its name and expression, the stats that feed it, how
 * their bonuses combine, when it applies, how it is known, its one-line
 * verdict, the longer reading and where in the client it was read. A field
 * that may be `null` may also be left out.
 */
export const seedFormulaStep = z.strictObject({
  id: step.slug,
  phase: step.phase,
  name: step.name,
  expression: step.expression,
  feeds: step.feeds.default([]),
  stacking: step.stacking,
  applies_to: step.appliesTo,
  confidence: step.confidence,
  why: step.why,
  detail: step.detail,
  code_ref: step.codeRef,
  sources: cited,
});
/** Output of {@link seedFormulaStep}. */
export type SeedFormulaStep = z.output<typeof seedFormulaStep>;

/**
 * One entry of `formula-constants.json`: a constant by its curated id, the
 * step that reads it (a formula step's id), its symbol, client field and
 * holder, the authoring tooltip, what it does, its measured value, the
 * value a community tool assumes, and how to measure it. A field that may
 * be `null` may also be left out.
 */
export const seedFormulaConstant = z.strictObject({
  id: constant.slug,
  step: constant.step,
  symbol: constant.symbol,
  field: constant.field,
  holder: constant.holder,
  label_kr: constant.labelKr,
  meaning: constant.meaning,
  value: constant.value,
  candidate: constant.candidate,
  measure: constant.measure,
  sources: cited,
});
/** Output of {@link seedFormulaConstant}. */
export type SeedFormulaConstant = z.output<typeof seedFormulaConstant>;

/**
 * One entry of `formula-claims.json`: a community claim by its curated id,
 * what the code does, the verdict, and, when a research record files the
 * claim as a mechanic, that record and the mechanic's title (`ref`).
 */
export const seedFormulaClaim = z.strictObject({
  id: claim.slug,
  claim: claim.claim,
  code: claim.code,
  verdict: claim.verdict,
  ref: z.strictObject({ record: z.string().min(1), title: z.string().min(1) }).optional(),
  sources: cited,
});
/** Output of {@link seedFormulaClaim}. */
export type SeedFormulaClaim = z.output<typeof seedFormulaClaim>;

/**
 * A step refusing ids another record's rows already hold in a damage
 * formula table. It writes nothing.
 *
 * @param file - the file, as errors name it
 * @param what - what the id names, as errors name it
 * @param rows - the table's stored rows, read when the step runs
 * @param ids - the record's ids, in file order
 * @returns the step
 * @throws {ImportError} (from the step) naming the file, the row and the holding record
 */
function claimIds(
  file: string,
  what: string,
  rows: (repos: Repos) => ReadonlyArray<{ slug: string; recordSlug: string | null }>,
  ids: readonly string[],
): WriteStep {
  return (repos) => {
    const holders = new Map(rows(repos).map((row) => [row.slug, row.recordSlug]));
    assertUnclaimed(file, what, ids, (slug) => holders.get(slug));
  };
}

/**
 * A step checking that every constant names a stored formula step: the
 * record's own, written before it, or another record's. It writes nothing.
 *
 * @param file - the file, as errors name it
 * @param constants - the constants, in file order
 * @returns the step
 * @throws {ImportError} (from the step) naming the file and row of the first constant whose step isn't stored
 */
function checkConstantSteps(file: string, constants: readonly SeedFormulaConstant[]): WriteStep {
  return (repos) => {
    const steps = new Set(repos.formulaSteps.list().map((row) => row.slug));
    constants.forEach((row, index) => {
      if (!steps.has(row.step)) {
        throw new ImportError(file, index, `step names ${row.step}, not loaded`);
      }
    });
  };
}

/**
 * A step checking that every claim's `ref` names a stored mechanic: one of
 * that record's whose title is the ref's. The record must be loaded first
 * (records load in number order). It writes nothing.
 *
 * @param file - the file, as errors name it
 * @param claims - the claims, in file order
 * @returns the step
 * @throws {ImportError} (from the step) naming the file and row of the first ref no stored mechanic matches
 */
function checkClaimRefs(file: string, claims: readonly SeedFormulaClaim[]): WriteStep {
  return (repos) => {
    const titles = new Set(
      repos.mechanics.list().map((row) => `${row.recordSlug ?? ""}\u0000${row.title}`),
    );
    claims.forEach((row, index) => {
      if (row.ref === undefined) return;
      if (!titles.has(`${row.ref.record}\u0000${row.ref.title}`)) {
        throw new ImportError(
          file,
          index,
          `ref names mechanic "${row.ref.title}" of record ${row.ref.record}, not loaded`,
        );
      }
    });
  };
}

/** The damage formula collections, keyed as in the curated manifest; steps first, which constants name. */
export const FORMULA_COLLECTIONS = {
  formulaSteps: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseRows(file, raw, seedFormulaStep),
    /** @inheritdoc */
    refs: (steps): RowRefs[] => steps.map((row, index) => ({ row: index, sources: row.sources })),
    /** @inheritdoc */
    check: (file, steps) => {
      assertDistinct(
        file,
        "id",
        steps.map((row) => row.id),
      );
    },
    /** @inheritdoc */
    prepare: (steps, { file }) => [
      claimIds(
        file,
        "formula step id",
        (repos) => repos.formulaSteps.list(),
        steps.map((row) => row.id),
      ),
      insertCited(
        "formulaSteps",
        steps.map((row, position) => ({
          values: {
            slug: row.id,
            position,
            phase: row.phase,
            name: row.name,
            expression: row.expression,
            feeds: row.feeds,
            stacking: row.stacking ?? null,
            appliesTo: row.applies_to ?? null,
            confidence: row.confidence,
            why: row.why,
            detail: row.detail ?? null,
            codeRef: row.code_ref ?? null,
          },
          sources: row.sources,
        })),
      ),
    ],
  }),
  formulaConstants: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseRows(file, raw, seedFormulaConstant),
    /** @inheritdoc */
    refs: (constants): RowRefs[] =>
      constants.map((row, index) => ({ row: index, sources: row.sources })),
    /** @inheritdoc */
    check: (file, constants) => {
      assertDistinct(
        file,
        "id",
        constants.map((row) => row.id),
      );
    },
    /** @inheritdoc */
    prepare: (constants, { file }) => [
      claimIds(
        file,
        "formula constant id",
        (repos) => repos.formulaConstants.list(),
        constants.map((row) => row.id),
      ),
      checkConstantSteps(file, constants),
      insertCited(
        "formulaConstants",
        constants.map((row, position) => ({
          values: {
            slug: row.id,
            position,
            step: row.step,
            symbol: row.symbol,
            field: row.field,
            holder: row.holder,
            labelKr: row.label_kr ?? null,
            meaning: row.meaning,
            value: row.value ?? null,
            candidate: row.candidate ?? null,
            measure: row.measure,
          },
          sources: row.sources,
        })),
      ),
    ],
  }),
  formulaClaims: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseRows(file, raw, seedFormulaClaim),
    /** @inheritdoc */
    refs: (claims): RowRefs[] => claims.map((row, index) => ({ row: index, sources: row.sources })),
    /** @inheritdoc */
    check: (file, claims) => {
      assertDistinct(
        file,
        "id",
        claims.map((row) => row.id),
      );
    },
    /** @inheritdoc */
    prepare: (claims, { file }) => [
      claimIds(
        file,
        "formula claim id",
        (repos) => repos.formulaClaims.list(),
        claims.map((row) => row.id),
      ),
      checkClaimRefs(file, claims),
      insertCited(
        "formulaClaims",
        claims.map((row, position) => ({
          values: {
            slug: row.id,
            position,
            claim: row.claim,
            code: row.code,
            verdict: row.verdict,
            refRecord: row.ref?.record ?? null,
            refTitle: row.ref?.title ?? null,
          },
          sources: row.sources,
        })),
      ),
    ],
  }),
};
