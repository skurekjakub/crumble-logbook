import { describe, expectTypeOf, it } from "vitest";
import type {
  decksQuery,
  GlossaryKindFilter,
  RankingBoardFilter,
  recordQuery,
  scoresQuery,
  SourceSiteFilter,
} from "../src/api/queries";
import type { Deck, NameRef, ResearchRecord, Score, Source } from "../src/api/types";

/** The data type a query options factory resolves to. */
type DataOf<F extends (...args: never[]) => { queryFn?: unknown }> = Awaited<
  ReturnType<Extract<NonNullable<ReturnType<F>["queryFn"]>, (...args: never[]) => unknown>>
>;

// These assertions run under `tsc -p .` (the typecheck gate); at runtime they are no-ops.
describe("API response types inferred through hc<AppType>", () => {
  it("resolves deck names to nullable English", () => {
    expectTypeOf<Deck["cookies"][number]["en"]>().toEqualTypeOf<string | null>();
    expectTypeOf<Deck["pets"]>().toEqualTypeOf<NameRef[]>();
    expectTypeOf<Deck["atkOrder"]>().toEqualTypeOf<NameRef[] | null>();
    expectTypeOf<Deck["sources"]>().toEqualTypeOf<string[]>();
  });

  it("carries the score ratio and nullable power", () => {
    expectTypeOf<Score["ratio"]>().toEqualTypeOf<number | null>();
    expectTypeOf<Score["powerG"]>().toEqualTypeOf<number | null>();
    expectTypeOf<Score["damageG"]>().toEqualTypeOf<number>();
  });

  it("types the record header fields and source links", () => {
    expectTypeOf<ResearchRecord["lede"]>().toEqualTypeOf<string | null>();
    expectTypeOf<ResearchRecord["seasonLabel"]>().toEqualTypeOf<string | null>();
    expectTypeOf<Source["url"]>().toEqualTypeOf<string>();
  });

  it("resolves query factories to the success bodies only", () => {
    expectTypeOf<DataOf<typeof decksQuery>>().toEqualTypeOf<Deck[]>();
    expectTypeOf<DataOf<typeof scoresQuery>>().toEqualTypeOf<Score[]>();
    expectTypeOf<DataOf<typeof recordQuery>>().toEqualTypeOf<ResearchRecord>();
  });

  it("derives the filter unions from the routes' query validators", () => {
    expectTypeOf<SourceSiteFilter>().toEqualTypeOf<"dc" | "nv" | "web">();
    expectTypeOf<GlossaryKindFilter>().toEqualTypeOf<
      "cookie" | "pet" | "stat" | "gear_slot" | "term"
    >();
    expectTypeOf<RankingBoardFilter>().toEqualTypeOf<"players" | "guilds" | "power">();
  });
});
