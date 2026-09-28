/**
 * The team-power mode's curated collections: each file's schema, its
 * checks and its mapping onto the team-power tables. Every row is one the
 * record owns, cited to its own sources. Rows name each other by slug; a
 * write step checks every slug named against the rows stored when it runs
 * (the record's own, written before it, or another record's).
 *
 * @module
 */
import type { PowerPlace } from "@crumble/schema";
import {
  CONFIDENCE,
  COST_TYPE,
  DATA_POINT_KIND,
  PACKAGE_TIER,
  POWER_PLACE,
  STEP_BASIS,
  growthCurveProblem,
  isoDate,
  plannerStepProblem,
  rowSlug,
  sourceId,
  spendingStepProblem,
} from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import type { LinkTarget } from "../registry";
import type { Repos } from "../repos";
import type { RowRefs } from "./collection-kit";
import { collection } from "./collection-kit";
import { parseFile } from "./files";
import { assertUnclaimed } from "./shared";
import type { CitedValues, WriteStep } from "./steps";
import { insertCited } from "./steps";

/** The source ids a curated row cites: at least one. */
const cited = z.array(sourceId).min(1);

/** What every team-power file says about itself; accepted but not imported. */
const header = { about: z.string().min(1), measured: isoDate };

/** A curated text that may be empty; an empty one is stored as `null`. */
const loose = z.string();

/**
 * Stores an empty curated text as `null`.
 *
 * @param text - the text as curated, maybe absent
 * @returns the text, or `null` when it is absent or empty
 */
const orNull = (text: string | null | undefined) => (text == null || text === "" ? null : text);

/** `power-sources.json`: every system that raises displayed team power. */
export const seedPowerSources = z.strictObject({
  ...header,
  efficiency_scale: z.string().min(1),
  sources_list: z
    .array(
      z.strictObject({
        id: rowSlug,
        name_en: z.string().min(1),
        name_kr: z.string().min(1),
        raises: z.string().min(1),
        applies_in: z.strictObject(
          Object.fromEntries(POWER_PLACE.map((place) => [place, z.boolean()])) as Record<
            PowerPlace,
            z.ZodBoolean
          >,
        ),
        materials: z
          .array(
            z.strictObject({
              name: z.string().min(1),
              free: z.string().min(1),
              paid: z.string().min(1),
              note: loose,
            }),
          )
          .min(1),
        cost_type: z.enum(COST_TYPE),
        cost_per_roll: z.string().min(1).optional(),
        cap: z.string().min(1),
        diminishing: loose,
        posted_gains: z.array(
          z.strictObject({
            account: z.string().min(1),
            before: loose,
            after: loose,
            delta: loose,
            cost: loose,
            kind: z.string().min(1),
            sources: cited,
          }),
        ),
        efficiency: z.strictObject({
          early: z.string().min(1),
          mid: z.string().min(1),
          late: z.string().min(1),
          at_2_2g: z.string().min(1),
        }),
        bracket_effect: z.string().min(1),
        spend_order: loose,
        patch_notes: loose,
        confidence: z.enum(CONFIDENCE),
        sources: cited,
      }),
    )
    .min(1),
});
/** Output of {@link seedPowerSources}. */
export type SeedPowerSources = z.output<typeof seedPowerSources>;

/** `power-datapoints.json`: every team-power figure the record found. */
export const seedPowerDataPoints = z.strictObject({
  ...header,
  rows: z.array(
    z.strictObject({
      id: rowSlug,
      kind: z.enum(DATA_POINT_KIND),
      system: rowSlug,
      date: isoDate,
      before_g: z.number().positive().nullable(),
      after_g: z.number().positive().nullable(),
      delta_pct: z.number().nullable(),
      cost: loose,
      note: z.string().min(1),
      sources: cited,
    }),
  ),
});
/** Output of {@link seedPowerDataPoints}. */
export type SeedPowerDataPoints = z.output<typeof seedPowerDataPoints>;

/** `packages.json`: the paid routes, and the KRW-to-USD tiers their inferred prices come from. */
export const seedPackages = z.strictObject({
  ...header,
  price_tiers: z.array(
    z.strictObject({
      krw: z.number().int().positive(),
      usd: z.number().positive(),
      paired_by: z.string().min(1),
      sources: cited,
    }),
  ),
  packages: z.array(
    z.strictObject({
      id: rowSlug,
      name_kr: z.string().min(1),
      name_en: z.string().min(1),
      price_krw: z.number().int().positive(),
      price_usd: z.number().positive().nullable(),
      usd_tier: z.number().positive().optional(),
      usd_source: z.string().min(1),
      kind: z.string().min(1),
      feeds: z.array(rowSlug),
      crystal_value_pct: z.number().positive().nullable(),
      crystal_value_basis: z.string().min(1).optional(),
      contents: z.string().min(1).optional(),
      verdict: z.string().min(1),
      tier: z.enum(PACKAGE_TIER),
      sources: cited,
    }),
  ),
});
/** Output of {@link seedPackages}. */
export type SeedPackages = z.output<typeof seedPackages>;

/** One step of an account stage's order: what to do, on what, what its place rests on and why. */
const seedStageStep = z.strictObject({
  step: z.string().min(1),
  source: rowSlug.optional(),
  package: rowSlug.optional(),
  basis: z.enum(STEP_BASIS),
  basis_note: z.string().min(1).optional(),
  why: loose,
  sources: cited,
});

/** One entry of the ranked order: a power source or a package, and what its place rests on. */
const seedRankedStep = z.strictObject({
  source: rowSlug.optional(),
  package: rowSlug.optional(),
  basis: z.enum(STEP_BASIS),
  basis_note: z.string().min(1).optional(),
});

/**
 * `spending-orders.json`: an order per account stage, each step citing its
 * own sources, and one ranked order of every power source and package,
 * citing the block's sources.
 */
export const seedSpendingOrders = z.strictObject({
  ...header,
  stages: z
    .array(
      z.strictObject({
        id: rowSlug,
        label: z.string().min(1),
        free: z.array(seedStageStep),
        paid: z.array(seedStageStep),
      }),
    )
    .min(1),
  ranked_at_2_2g: z.strictObject({
    id: rowSlug,
    label: z.string().min(1),
    free: z.array(seedRankedStep),
    paid: z.array(seedRankedStep),
    note: z.string().min(1),
    sources: cited,
  }),
});
/** Output of {@link seedSpendingOrders}. */
export type SeedSpendingOrders = z.output<typeof seedSpendingOrders>;

/** `growth-curves.json`: each power source's cost and return curves, as tables. */
export const seedGrowthCurves = z.strictObject({
  ...header,
  curves: z.array(
    z.strictObject({
      id: rowSlug,
      source: rowSlug,
      title: z.string().min(1),
      evidence: z.string().min(1).optional(),
      columns: z.array(z.string().min(1)).min(1),
      rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))).min(1),
      row_sources: z.array(cited).optional(),
      note: z.string().min(1).optional(),
      sources: cited,
    }),
  ),
});
/** Output of {@link seedGrowthCurves}. */
export type SeedGrowthCurves = z.output<typeof seedGrowthCurves>;

/**
 * `power-planner.json`: the steps the planner weighs (`what_a_step_buys`),
 * each with the data point of its gain and its basis. The reach table and
 * the notes around it are accepted but not imported: the planner reads
 * the stored power brackets and stage chapters instead.
 */
export const seedPlanner = z.strictObject({
  ...header,
  rows: z.array(
    z.strictObject({
      team_power_g: z.number().positive(),
      reach_55: z.string().min(1),
      reach_35: z.string().min(1),
      reach_15: z.string().min(1),
    }),
  ),
  from_2_2g: z.strictObject({
    rule_of_thumb: z.string().min(1),
    what_a_step_buys: z.array(
      z.strictObject({
        source: rowSlug,
        data_point: rowSlug.optional(),
        basis: z.enum(STEP_BASIS),
        posted_gain: z.string().min(1),
        inferred_reach_35: z.string().min(1),
        sources: cited,
      }),
    ),
    rift: z.string().min(1),
  }),
  sources: cited,
});
/** Output of {@link seedPlanner}. */
export type SeedPlanner = z.output<typeof seedPlanner>;

/**
 * Checks that every value of `values` is new.
 *
 * @param file - the file, as errors name it
 * @param what - the field, as errors name it
 * @param values - the values, in file order
 * @throws {ImportError} naming the file, the index and the value of the first repeat
 */
function assertDistinct(file: string, what: string, values: readonly string[]): void {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value)) throw new ImportError(file, index, `duplicate ${what} "${value}"`);
    seen.add(value);
  });
}

/** One slug a row names, as {@link checkLinks} checks it. */
interface NamedSlug {
  /** The row, as errors name it. */
  row: string | number;
  /** The field that names it, as errors name it. */
  field: string;
  /** The content type the slug names a row of. */
  target: LinkTarget;
  /** The slug. */
  slug: string;
}

/**
 * A step checking that every slug the rows name is a stored row's slug,
 * as the tables stand when it runs. It writes nothing.
 *
 * @param file - the file, as errors name it
 * @param named - every slug the rows name
 * @returns the step
 * @throws {ImportError} (from the step) naming the file, the row and the
 *   first slug no stored row has; the import then writes nothing
 */
function checkLinks(file: string, named: readonly NamedSlug[]): WriteStep {
  return (repos: Repos) => {
    const slugs = new Map<LinkTarget, Set<unknown>>();
    for (const { row, field, target, slug } of named) {
      let stored = slugs.get(target);
      if (!stored) {
        stored = new Set((repos[target].list() as Array<{ slug: unknown }>).map((r) => r.slug));
        slugs.set(target, stored);
      }
      if (!stored.has(slug)) throw new ImportError(file, row, `${field} names ${slug}, not loaded`);
    }
  };
}

/**
 * A step refusing slugs another record's rows already hold in a table.
 *
 * @param file - the file, as errors name it
 * @param what - what the slug names, as errors name it
 * @param target - the table
 * @param slugs - the record's slugs
 * @returns the step
 */
function claimSlugs(
  file: string,
  what: string,
  target: LinkTarget | "growthCurves",
  slugs: readonly string[],
): WriteStep {
  return (repos) => {
    const holders = new Map(
      (repos[target].list() as Array<{ slug: string; recordSlug: string | null }>).map((row) => [
        row.slug,
        row.recordSlug,
      ]),
    );
    assertUnclaimed(file, what, slugs, (slug) => holders.get(slug));
  };
}

/**
 * The source ids a set of rows cites, each once, in first-cited order.
 *
 * @param rows - the rows
 * @returns the source ids
 */
function unionOf(rows: ReadonlyArray<{ sources: readonly string[] }>): string[] {
  return [...new Set(rows.flatMap((row) => row.sources))];
}

/** A step of a spending order, mapped, with its sources. */
type MappedStep = CitedValues<{
  orderSlug: string;
  route: "free" | "paid";
  position: number;
  step: string | null;
  powerSource: string | null;
  packageSlug: string | null;
  basis: (typeof STEP_BASIS)[number];
  basisNote: string | null;
  why: string | null;
}>;

/**
 * Maps a spending order's free and paid steps.
 *
 * @param orderSlug - the order's slug
 * @param routes - the order's free and paid steps, as curated
 * @param sourcesOf - a step's sources
 * @returns the steps, free route first, each numbered on its route
 */
function mapSteps<S extends z.output<typeof seedRankedStep> & { step?: string; why?: string }>(
  orderSlug: string,
  routes: { free: readonly S[]; paid: readonly S[] },
  sourcesOf: (step: S) => readonly string[],
): MappedStep[] {
  return (["free", "paid"] as const).flatMap((route) =>
    routes[route].map((step, position) => ({
      values: {
        orderSlug,
        route,
        position,
        step: step.step ?? null,
        powerSource: step.source ?? null,
        packageSlug: step.package ?? null,
        basis: step.basis,
        basisNote: step.basis_note ?? null,
        why: orNull(step.why),
      },
      sources: sourcesOf(step),
    })),
  );
}

/** The team-power mode's collections, by their key in the curated manifest, in write order; every one is optional. */
export const TEAM_POWER_COLLECTIONS = {
  powerSources: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedPowerSources),
    /** @inheritdoc */
    refs: ({ sources_list }): RowRefs[] =>
      sources_list.map((source, index) => ({
        row: index,
        sources: [...source.sources, ...source.posted_gains.flatMap((gain) => gain.sources)],
      })),
    /** @inheritdoc */
    check: (file, { sources_list }) => {
      assertDistinct(
        file,
        "id",
        sources_list.map((source) => source.id),
      );
      sources_list.forEach((source, index) => {
        if (!POWER_PLACE.some((place) => source.applies_in[place])) {
          throw new ImportError(file, index, "applies_in names no place");
        }
      });
    },
    /** @inheritdoc */
    prepare: ({ sources_list }, { file }) => [
      claimSlugs(
        file,
        "power source id",
        "powerSources",
        sources_list.map((source) => source.id),
      ),
      insertCited(
        "powerSources",
        sources_list.map((source) => ({
          values: {
            slug: source.id,
            nameEn: source.name_en,
            nameKr: source.name_kr,
            raises: source.raises,
            appliesIn: POWER_PLACE.filter((place) => source.applies_in[place]),
            materials: source.materials.map((m) => ({ ...m, note: orNull(m.note) })),
            costType: source.cost_type,
            costPerRoll: source.cost_per_roll ?? null,
            cap: source.cap,
            diminishing: orNull(source.diminishing),
            postedGains: source.posted_gains.map((gain) => ({
              account: gain.account,
              before: orNull(gain.before),
              after: orNull(gain.after),
              delta: orNull(gain.delta),
              cost: orNull(gain.cost),
              kind: gain.kind,
              sources: gain.sources,
            })),
            efficiency: {
              early: source.efficiency.early,
              mid: source.efficiency.mid,
              late: source.efficiency.late,
              at22g: source.efficiency.at_2_2g,
            },
            bracketEffect: source.bracket_effect,
            spendOrder: orNull(source.spend_order),
            patchNotes: orNull(source.patch_notes),
            confidence: source.confidence,
          },
          sources: source.sources,
        })),
      ),
    ],
  }),
  powerDataPoints: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedPowerDataPoints),
    /** @inheritdoc */
    refs: ({ rows }): RowRefs[] => rows.map((row, index) => ({ row: index, sources: row.sources })),
    /** @inheritdoc */
    check: (file, { rows }) => {
      assertDistinct(
        file,
        "id",
        rows.map((row) => row.id),
      );
    },
    /** @inheritdoc */
    prepare: ({ rows }, { file }) => [
      checkLinks(
        file,
        rows.map((row, index) => ({
          row: index,
          field: "system",
          target: "powerSources",
          slug: row.system,
        })),
      ),
      claimSlugs(
        file,
        "data point id",
        "powerDataPoints",
        rows.map((row) => row.id),
      ),
      insertCited(
        "powerDataPoints",
        rows.map((row) => ({
          values: {
            slug: row.id,
            kind: row.kind,
            powerSource: row.system,
            date: row.date,
            beforeG: row.before_g,
            afterG: row.after_g,
            deltaPct: row.delta_pct,
            cost: orNull(row.cost),
            note: row.note,
          },
          sources: row.sources,
        })),
      ),
    ],
  }),
  packages: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedPackages),
    /** @inheritdoc */
    refs: ({ packages, price_tiers }): RowRefs[] => [
      ...packages.map((pack, index) => ({ row: index, sources: pack.sources })),
      ...price_tiers.map((tier, index) => ({ row: `price_tiers ${index}`, sources: tier.sources })),
    ],
    /** @inheritdoc */
    check: (file, { packages }) => {
      assertDistinct(
        file,
        "id",
        packages.map((pack) => pack.id),
      );
    },
    /** @inheritdoc */
    prepare: ({ packages, price_tiers }, { file }) => [
      checkLinks(
        file,
        packages.flatMap((pack, index) =>
          pack.feeds.map((slug) => ({
            row: index,
            field: "feeds",
            target: "powerSources" as const,
            slug,
          })),
        ),
      ),
      claimSlugs(
        file,
        "package id",
        "packages",
        packages.map((pack) => pack.id),
      ),
      insertCited(
        "packages",
        packages.map((pack) => ({
          values: {
            slug: pack.id,
            nameKr: pack.name_kr,
            nameEn: pack.name_en,
            priceKrw: pack.price_krw,
            priceUsd: pack.price_usd,
            usdTier: pack.usd_tier ?? null,
            usdSource: pack.usd_source,
            kind: pack.kind,
            feeds: pack.feeds,
            crystalValuePct: pack.crystal_value_pct,
            crystalValueBasis: pack.crystal_value_basis ?? null,
            contents: pack.contents ?? null,
            verdict: pack.verdict,
            tier: pack.tier,
          },
          sources: pack.sources,
        })),
      ),
      insertCited(
        "priceTiers",
        price_tiers.map((tier) => ({
          values: { krw: tier.krw, usd: tier.usd, pairedBy: tier.paired_by },
          sources: tier.sources,
        })),
      ),
    ],
  }),
  spendingOrders: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedSpendingOrders),
    /** @inheritdoc */
    refs: ({ stages, ranked_at_2_2g: ranked }): RowRefs[] => [
      ...stages.flatMap((stage) =>
        (["free", "paid"] as const).flatMap((route) =>
          stage[route].map((step, index) => ({
            row: `${stage.id} ${route} ${index}`,
            sources: step.sources,
          })),
        ),
      ),
      { row: ranked.id, sources: ranked.sources },
    ],
    /** @inheritdoc */
    check: (file, { stages, ranked_at_2_2g: ranked }) => {
      assertDistinct(file, "order id", [...stages.map((stage) => stage.id), ranked.id]);
      for (const order of [...stages, ranked]) {
        for (const route of ["free", "paid"] as const) {
          order[route].forEach((step, index) => {
            const problem = spendingStepProblem({
              powerSource: step.source ?? null,
              packageSlug: step.package ?? null,
            });
            if (problem) throw new ImportError(file, `${order.id} ${route} ${index}`, problem);
          });
        }
      }
    },
    /** @inheritdoc */
    prepare: ({ stages, ranked_at_2_2g: ranked }, { file }) => {
      const orders = [...stages, ranked];
      const steps = [
        ...stages.flatMap((stage) => mapSteps(stage.id, stage, (step) => step.sources)),
        ...mapSteps(ranked.id, ranked, () => ranked.sources),
      ];
      return [
        checkLinks(
          file,
          steps.flatMap(({ values }) => {
            const row = `${values.orderSlug} ${values.route} ${values.position}`;
            return [
              ...(values.powerSource === null
                ? []
                : [
                    {
                      row,
                      field: "source",
                      target: "powerSources" as const,
                      slug: values.powerSource,
                    },
                  ]),
              ...(values.packageSlug === null
                ? []
                : [
                    {
                      row,
                      field: "package",
                      target: "packages" as const,
                      slug: values.packageSlug,
                    },
                  ]),
            ];
          }),
        ),
        claimSlugs(
          file,
          "spending order id",
          "spendingOrders",
          orders.map((order) => order.id),
        ),
        insertCited("spendingOrders", [
          ...stages.map((stage, position) => ({
            values: {
              slug: stage.id,
              kind: "stage" as const,
              label: stage.label,
              note: null,
              position,
            },
            sources: unionOf([...stage.free, ...stage.paid]),
          })),
          {
            values: {
              slug: ranked.id,
              kind: "ranked" as const,
              label: ranked.label,
              note: ranked.note,
              position: stages.length,
            },
            sources: ranked.sources,
          },
        ]),
        insertCited("spendingSteps", steps),
      ];
    },
  }),
  growthCurves: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedGrowthCurves),
    /** @inheritdoc */
    refs: ({ curves }): RowRefs[] =>
      curves.map((curve, index) => ({
        row: index,
        sources: [...curve.sources, ...(curve.row_sources ?? []).flat()],
      })),
    /** @inheritdoc */
    check: (file, { curves }) => {
      assertDistinct(
        file,
        "id",
        curves.map((curve) => curve.id),
      );
      curves.forEach((curve, index) => {
        const problem = growthCurveProblem({ ...curve, rowSources: curve.row_sources ?? null });
        if (problem) throw new ImportError(file, index, problem);
      });
    },
    /** @inheritdoc */
    prepare: ({ curves }, { file }) => [
      checkLinks(
        file,
        curves.map((curve, index) => ({
          row: index,
          field: "source",
          target: "powerSources",
          slug: curve.source,
        })),
      ),
      claimSlugs(
        file,
        "growth curve id",
        "growthCurves",
        curves.map((curve) => curve.id),
      ),
      insertCited(
        "growthCurves",
        curves.map((curve) => ({
          values: {
            slug: curve.id,
            powerSource: curve.source,
            title: curve.title,
            columns: curve.columns,
            rows: curve.rows,
            rowSources: curve.row_sources ?? null,
            note: curve.note ?? null,
            evidence: curve.evidence ?? null,
          },
          sources: curve.sources,
        })),
      ),
    ],
  }),
  plannerSteps: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedPlanner),
    /** @inheritdoc */
    refs: ({ from_2_2g: { what_a_step_buys: steps }, sources }): RowRefs[] => [
      { row: "sources", sources },
      ...steps.map((step, index) => ({ row: `step ${index}`, sources: step.sources })),
    ],
    /** @inheritdoc */
    prepare: ({ from_2_2g: { what_a_step_buys: steps } }, { file }) => [
      checkLinks(
        file,
        steps.flatMap((step, index) => [
          {
            row: `step ${index}`,
            field: "source",
            target: "powerSources" as const,
            slug: step.source,
          },
          ...(step.data_point === undefined
            ? []
            : [
                {
                  row: `step ${index}`,
                  field: "data_point",
                  target: "powerDataPoints" as const,
                  slug: step.data_point,
                },
              ]),
        ]),
      ),
      (repos) => {
        const points = new Map(repos.powerDataPoints.list().map((point) => [point.slug, point]));
        steps.forEach((step, index) => {
          const dataPoint = step.data_point ?? null;
          const problem = plannerStepProblem(
            { basis: step.basis, dataPoint },
            dataPoint === null ? undefined : points.get(dataPoint),
          );
          if (problem) throw new ImportError(file, `step ${index}`, problem);
        });
      },
      insertCited(
        "plannerSteps",
        steps.map((step, position) => ({
          values: {
            position,
            powerSource: step.source,
            dataPoint: step.data_point ?? null,
            basis: step.basis,
            gain: step.posted_gain,
            reach: step.inferred_reach_35,
          },
          sources: step.sources,
        })),
      ),
    ],
  }),
};
