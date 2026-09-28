import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type {
  GrowthCurve,
  Mechanic,
  PlannerStep,
  PowerBracket,
  PowerDataPoint,
  PowerSource,
  PriceTier,
  ResearchRecord,
  ShopPackage,
  SpendingOrder,
  SpendingStep,
  StageChapter,
} from "../src/api/types";
import { TEAM_POWER } from "../src/app/modes";
import type { Canned } from "./helpers";
import { bodyRows, renderRoute } from "./view-harness";

const SLUG = "005-team-power-growth";
const CITE = ["dc:76135"];

const RECORD = {
  slug: SLUG,
  question: "What raises team power?",
  status: "active",
  startedAt: "2026-09-28",
  updatedAt: "2026-09-28",
  seasonLabel: "Game 1.4.002",
  lede: "What raises team power, free and paid.",
  caveat: "Snapshot of 2026-09-28.",
  mode: "team_power",
  modes: [{ mode: "team_power", lede: "Team power growth.", caveat: "Power is not strength." }],
} satisfies ResearchRecord;

/**
 * Builds a power source.
 *
 * @param id - the row's id
 * @param slug - its slug
 * @param nameEn - its English name
 * @param over - fields to set on top
 * @returns the power source
 */
function source(
  id: number,
  slug: string,
  nameEn: string,
  over: Partial<PowerSource> = {},
): PowerSource {
  return {
    id,
    slug,
    nameEn,
    nameKr: `${nameEn} kr`,
    raises: `What ${nameEn} raises.`,
    appliesIn: ["stage", "rift"],
    materials: [{ name: "material", free: "idle", paid: "packs", note: null }],
    costType: "mixed",
    costPerRoll: null,
    cap: "a cap",
    diminishing: null,
    postedGains: [],
    efficiency: { early: "high: cheap", mid: "medium", late: "low", at22g: "medium; steady" },
    bracketEffect: "Steady.",
    spendOrder: null,
    patchNotes: null,
    confidence: "high",
    recordSlug: SLUG,
    sources: CITE,
    ...over,
  };
}

const SOURCES = [
  source(1, "stellar_link", "Stellar Link", {
    efficiency: {
      early: "high: rolls at 10 SP",
      mid: "high",
      late: "high while new points open",
      at22g: "Up to 8-3 the points come from free pulls. Not comparable per won with plating.",
    },
  }),
  source(2, "plating", "Plating", {
    efficiency: {
      early: "high",
      mid: "medium",
      late: "low",
      at22g: "medium for any slot below 15",
    },
  }),
  source(3, "guild_lab", "Guild Lab", {
    costType: "free",
    efficiency: {
      early: "unmeasured (free)",
      mid: "unmeasured (free)",
      late: "unmeasured (free)",
      at22g: "free and instant to check",
    },
  }),
  source(4, "lineup", "Lineup padding", {
    costType: "free",
    efficiency: { early: "unmeasured", mid: "unmeasured", late: "unmeasured", at22g: "unmeasured" },
  }),
];

/**
 * Builds a data point.
 *
 * @param id - the row's id
 * @param slug - its slug
 * @param over - fields to set on top
 * @returns the data point
 */
function point(id: number, slug: string, over: Partial<PowerDataPoint>): PowerDataPoint {
  return {
    id,
    slug,
    kind: "posted",
    powerSource: "plating",
    date: "2026-09-25",
    beforeG: null,
    afterG: null,
    deltaPct: null,
    cost: null,
    note: `note ${slug}`,
    recordSlug: SLUG,
    sources: CITE,
    ...over,
  };
}

const POINTS = [
  point(1, "stellar8-triangle-2g", {
    powerSource: "stellar_link",
    beforeG: 2,
    afterG: 2.2,
    deltaPct: 10,
    cost: "not posted",
  }),
  point(2, "plate-14-15", { beforeG: 1.6, afterG: 1.625, deltaPct: 1.6 }),
  point(3, "plate-step-price", { kind: "inferred", deltaPct: 1.6, cost: "about ₩14,700" }),
  point(4, "guild-lab-claim", { kind: "claimed", powerSource: "guild_lab", deltaPct: 20 }),
];

/**
 * Builds a package.
 *
 * @param id - the row's id
 * @param slug - its slug
 * @param nameEn - its English name
 * @param over - fields to set on top
 * @returns the package
 */
function pack(id: number, slug: string, nameEn: string, over: Partial<ShopPackage>): ShopPackage {
  return {
    id,
    slug,
    nameKr: `${nameEn} kr`,
    nameEn,
    priceKrw: 6000,
    priceUsd: null,
    usdTier: null,
    usdSource: "not listed",
    kind: "weekly",
    feeds: ["plating"],
    crystalValuePct: null,
    crystalValueBasis: null,
    contents: null,
    verdict: `The verdict on ${nameEn}.`,
    tier: "light",
    recordSlug: SLUG,
    sources: CITE,
    ...over,
  };
}

const PACKAGES = [
  pack(1, "keys", "Key Set", { priceUsd: 3.99, usdSource: "listed" }),
  pack(2, "stellar-pack", "Stellar Pack", {
    priceKrw: 32000,
    tier: "medium",
    feeds: ["stellar_link"],
    crystalValuePct: 600,
  }),
  pack(3, "monthly", "Monthly Reward", { priceKrw: 7500, usdTier: 4.99, tier: "light" }),
];

const TIERS: PriceTier[] = [
  { id: 1, krw: 7500, usd: 4.99, pairedBy: "Crumble Pass", recordSlug: SLUG, sources: CITE },
];

/**
 * Builds a spending order.
 *
 * @param id - the row's id
 * @param slug - its slug
 * @param label - its label
 * @param over - fields to set on top
 * @returns the order
 */
function order(
  id: number,
  slug: string,
  label: string,
  over: Partial<SpendingOrder> = {},
): SpendingOrder {
  return {
    id,
    slug,
    kind: "stage",
    label,
    note: null,
    position: id,
    recordSlug: SLUG,
    sources: CITE,
    ...over,
  };
}

const ORDERS = [
  order(1, "mid", "Stages 168–248 (rewards drop)"),
  order(2, "endgame", "Stages 300–328 at ~2–4G (your team)"),
  order(3, "ranked-2.2g", "Ranked at about 2.2G", {
    kind: "ranked",
    note: "Both orders are the community's stated orders.",
  }),
];

/**
 * Builds a spending step.
 *
 * @param id - the row's id
 * @param over - fields to set on top
 * @returns the step
 */
function step(id: number, over: Partial<SpendingStep>): SpendingStep {
  return {
    id,
    orderSlug: "ranked-2.2g",
    route: "free",
    position: id,
    step: null,
    powerSource: null,
    packageSlug: null,
    basis: "community",
    basisNote: null,
    why: null,
    recordSlug: SLUG,
    sources: CITE,
    ...over,
  };
}

const STEPS = [
  step(1, { powerSource: "guild_lab", basis: "claimed" }),
  step(2, { powerSource: "lineup", basis: "unmeasured" }),
  step(3, {
    powerSource: "stellar_link",
    basis: "posted",
    basisNote: "posted up to 8-3; paid past it",
  }),
  step(4, { route: "paid", packageSlug: "keys" }),
  step(5, {
    orderSlug: "endgame",
    step: "Check the guild's research level.",
    powerSource: "guild_lab",
    basis: "claimed",
    why: "Free to check.",
  }),
  step(6, {
    orderSlug: "mid",
    step: "Plating to 15 with free Chocosteel.",
    powerSource: "plating",
    why: "Plates were the advised next step.",
  }),
];

const CURVES: GrowthCurve[] = [
  {
    id: 1,
    slug: "plating-odds",
    powerSource: "plating",
    title: "Plating odds by level",
    columns: ["from", "success_pct"],
    rows: [
      [0, 90],
      [14, 14],
    ],
    rowSources: null,
    note: "Odds from the table.",
    evidence: "evidence/08-extract/plate-rates.json",
    recordSlug: SLUG,
    sources: CITE,
  },
  {
    id: 2,
    slug: "stellar-shapes",
    powerSource: "stellar_link",
    title: "Stellar shapes",
    columns: ["points", "expected_sp"],
    rows: [[8, 1900]],
    rowSources: [["dc:76135"]],
    note: null,
    evidence: null,
    recordSlug: SLUG,
    sources: CITE,
  },
];

/**
 * Builds a planner step.
 *
 * @param id - the row's id
 * @param over - fields to set on top
 * @returns the step
 */
function plannerStep(id: number, over: Partial<PlannerStep>): PlannerStep {
  return {
    id,
    position: id,
    powerSource: "plating",
    dataPoint: null,
    basis: "unmeasured",
    gain: `gain ${id}`,
    reach: `reach ${id}`,
    recordSlug: SLUG,
    sources: CITE,
    ...over,
  };
}

const PLANNER = [
  plannerStep(1, {
    powerSource: "stellar_link",
    dataPoint: "stellar8-triangle-2g",
    basis: "posted",
    gain: "+10% (2G → 2.2G)",
  }),
  plannerStep(2, {
    powerSource: "guild_lab",
    dataPoint: "guild-lab-claim",
    basis: "claimed",
    gain: "one unmeasured claim of ~+20% account total power",
  }),
  plannerStep(3, { dataPoint: "plate-14-15", basis: "posted", gain: "about +1.5%" }),
  plannerStep(4, { powerSource: "lineup", gain: "none: unmeasured" }),
];

/**
 * Builds a power bracket.
 *
 * @param id - the row's id
 * @param minRatioPct - its lower bound
 * @param damagePct - the damage it keeps
 * @returns the bracket
 */
function bracket(id: number, minRatioPct: number, damagePct: number): PowerBracket {
  return { id, minRatioPct, damagePct, label: `${damagePct}%`, sources: CITE };
}

/**
 * Builds a stage chapter.
 *
 * @param chapter - the chapter number
 * @param recommendedPower - its last stage's recommended power
 * @returns the chapter
 */
function chapter(chapter: number, recommendedPower: number): StageChapter {
  return {
    id: chapter,
    chapter,
    zoneIndex: ((chapter - 1) % 8) + 1,
    zone: "zone",
    lastStage: `${chapter}-30`,
    bossKr: "보스",
    bossEn: `Boss ${chapter}`,
    recommendedPower,
    accuracyReq: 1,
    focusReq: 1,
    sources: CITE,
  };
}

const RULES: Mechanic[] = [
  {
    id: 1,
    title: "Where team power counts",
    body: "Only stages and the Rift compare team power.",
    confidence: "high",
    mode: "team_power",
    topic: "rules",
    alsoTopics: [],
    recordSlug: SLUG,
    sources: CITE,
  },
];

/** Every team-power endpoint, answered from the fixtures above. */
const API: Record<string, Canned> = {
  [`/api/records/${SLUG}`]: { body: RECORD },
  "/api/power-sources": { body: SOURCES },
  "/api/power-data-points": { body: POINTS },
  "/api/packages": { body: PACKAGES },
  "/api/price-tiers": { body: TIERS },
  "/api/spending-orders": { body: ORDERS },
  "/api/spending-steps": { body: STEPS },
  "/api/growth-curves": { body: CURVES },
  "/api/planner-steps": { body: PLANNER },
  "/api/power-brackets": {
    body: [bracket(1, 20, 15), bracket(2, 40, 35), bracket(3, 60, 55), bracket(4, 100, 100)],
  },
  "/api/stage-chapters": {
    body: [chapter(300, 5.0e9), chapter(304, 5.4e9), chapter(308, 6.0e9), chapter(312, 7.0e9)],
  },
  "/api/mechanics?mode=team_power&topic=rules": { body: RULES },
  "/api/mechanics?mode=team_power": { body: RULES },
  "/api/takeaways?mode=team_power": { body: [] },
  "/api/timeline?mode=team_power": { body: [] },
  [`/api/recommendations?record=${SLUG}`]: { body: [] },
};

/**
 * The text of each body row of the table under `root`, its row header first.
 *
 * @param root - an element containing exactly one table
 * @returns one array of cell texts per `<tbody>` row
 */
function gridRows(root: ParentNode): string[][] {
  return [...root.querySelectorAll("tbody tr")].map((tr) =>
    [...tr.querySelectorAll("th, td")].map((cell) => cell.textContent),
  );
}

/**
 * Renders the app at a team-power path against the fixtures.
 *
 * @param path - the URL to open
 * @returns the router
 */
function renderAt(path: string) {
  return renderRoute(path, API, { mode: TEAM_POWER });
}

afterEach(cleanup);

describe("the team power section", () => {
  it("names the section with the record's Korean name and shows where team power counts", async () => {
    await renderAt("/team-power");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    expect(within(nav).getByRole("link", { name: "Team power 팀투" })).toBeVisible();
    const rules = await screen.findByRole("heading", { name: "What team power decides" });
    expect(rules.parentElement).toHaveTextContent("Only stages and the Rift compare team power.");
    expect(screen.getByText("Power is not strength.")).toBeVisible();
  });

  it("ranks the free and paid routes with each step's basis, and a gain only where the record ties a posted one", async () => {
    await renderAt("/team-power/routes");
    expect(await screen.findByText("Both orders are the community's stated orders.")).toBeVisible();
    const free = screen.getByRole("region", { name: "Free route" });
    const items = within(free).getAllByRole("listitem");
    expect(items.map((li) => li.querySelector(".mark")?.textContent)).toEqual([
      "Claimed",
      "Unmeasured",
      "Posted",
    ]);
    expect(items[2]).toHaveTextContent("+10%");
    expect(items[2]).toHaveTextContent("(2G → 2.2G)");
    expect(items[2]).toHaveTextContent("posted up to 8-3; paid past it");
    expect(items[0]!.querySelector(".gain-figure")).toBeNull();
    expect(items[0]).toHaveTextContent("one unmeasured claim of ~+20% account total power");
    expect(within(items[0]!).getByRole("link", { name: "Guild Lab" })).toHaveAttribute(
      "href",
      "/team-power/power-sources#ps-guild_lab",
    );
    const paid = screen.getByRole("region", { name: "Paid route" });
    expect(paid).toHaveTextContent("₩6,000 · $3.99");
    expect(paid).toHaveTextContent("No posted power figure");
  });

  it("grids cost against the record's grade at the chosen stage, keeping ungraded notes apart", async () => {
    await renderAt("/team-power/power-sources");
    const grid = await screen.findByRole("region", { name: /Cost against efficiency, near 2.2G/ });
    const rows = gridRows(grid);
    const medium = rows.find((r) => r[0] === "Medium")!;
    expect(medium[3]).toBe("Plating");
    const ungraded = rows.find((r) => r[0] === "Not graded or unmeasured")!;
    expect(ungraded[1]).toContain("Guild Lab");
    expect(ungraded[3]).toBe("Stellar Link");
    fireEvent.click(screen.getByRole("button", { name: "Early" }));
    const early = await screen.findByRole("region", { name: /Cost against efficiency, early/ });
    expect(gridRows(early).find((r) => r[0] === "High")![3]).toBe("Stellar LinkPlating");
    expect(document.getElementById("ps-plating")).not.toBeNull();
  });

  it("shows the measured sources' figures side by side, marking the inferred one, and divides nothing", async () => {
    await renderAt("/team-power/power-sources");
    const numbers = await screen.findByRole("region", { name: "Where the record has numbers" });
    expect(numbers).toHaveTextContent("doesn't divide a gain by a cost");
    expect(numbers).toHaveTextContent("Not comparable per won with plating.");
    expect(within(numbers).getAllByText("Inferred")).toHaveLength(1);
    expect(numbers).toHaveTextContent("about ₩14,700");
  });

  it("opens the spending order on the reader's stage, and switches stage through the URL", async () => {
    const router = await renderAt("/team-power/spending");
    expect(await screen.findByText("Check the guild's research level.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Stages 168–248" }));
    await waitFor(() => expect(router.state.location.search).toEqual({ order: "mid" }));
    expect(await screen.findByText("Plating to 15 with free Chocosteel.")).toBeVisible();
  });

  it("places a typed power on the stages and multiplies only posted gains into reach", async () => {
    await renderAt("/team-power/planner?power=2.2G");
    const standing = await screen.findByRole("region", { name: "Where you stand" });
    expect(standing).toHaveTextContent("35% of damage or more: through 304-30 (Boss 304)");
    expect(standing).toHaveTextContent("next, 308-30 at 2.4G (+9.1%)");
    expect(standing).toHaveTextContent("55% of damage or more: not yet at 300-30");
    const buys = await screen.findByRole("region", { name: "What the next gains buy" });
    const rows = bodyRows(buys);
    expect(rows[0]).toEqual(
      expect.arrayContaining([
        "2.42G",
        "– (no change)",
        "308-30 (+1 chapter)",
        "312-30 (no change)",
      ]),
    );
    expect(rows[1]).toEqual(expect.arrayContaining(["not derived"]));
    const claimRow = buys.querySelectorAll("tbody tr")[1]!;
    expect(claimRow.querySelector(".gain-figure")).toBeNull();
    expect(rows[2]).toEqual(expect.arrayContaining(["304-30 (no change)"]));
  });

  it("lists packages with KRW and USD, marking an inferred tier, and filters by spender", async () => {
    const router = await renderAt("/team-power/packages");
    await screen.findByText("Key Set");
    const text = document.querySelector("table")!.textContent;
    expect(text).toContain("$3.99");
    expect(text).toContain("≈ $4.99");
    expect(text).toContain("USD not listed");
    fireEvent.change(screen.getByRole("combobox", { name: "Spender" }), {
      target: { value: "medium" },
    });
    await waitFor(() => expect(router.state.location.search).toEqual({ tier: "medium" }));
    expect(screen.queryByText("Key Set")).toBeNull();
    expect(screen.getByText("Stellar Pack")).toBeVisible();
  });

  it("shows each curve as a table with its columns and per-row sources, filtered by power source", async () => {
    await renderAt("/team-power/curves?source=plating");
    const card = await screen.findByRole("region", { name: "Plating odds by level" });
    expect(within(card).getByRole("columnheader", { name: "success %" })).toBeVisible();
    expect(screen.queryByRole("region", { name: "Stellar shapes" })).toBeNull();
    cleanup();
    await renderAt("/team-power/curves");
    const shapes = await screen.findByRole("region", { name: "Stellar shapes" });
    expect(bodyRows(shapes)[0]).toEqual(["8", "1,900", "DC 76135"]);
  });

  it("filters the data points by how each figure is known", async () => {
    await renderAt("/team-power/data-points?kind=inferred");
    await screen.findByText("note plate-step-price");
    expect(screen.queryByText("note plate-14-15")).toBeNull();
  });
});
