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
    approximate: false,
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

  it("ranks the free and paid routes with each step's basis pill, and a gain figure only where the record ties a posted one", async () => {
    await renderAt("/team-power/routes");
    const note = (
      await screen.findByText("Both orders are the community's stated orders.")
    ).closest(".callout")!;
    expect(note.querySelector(".pill")).toHaveTextContent("Stated order");
    const free = screen.getByRole("region", { name: "Free route" });
    const items = within(free).getAllByRole("listitem");
    expect(items.map((li) => li.querySelector(".pill")?.textContent)).toEqual([
      "Claimed",
      "Unmeasured",
      "Posted",
    ]);
    expect(items[2]!.querySelector(".pill.verified")).not.toBeNull();
    expect(items[2]!.querySelector(".fig.gain")).toHaveTextContent("+10%2G → 2.2G");
    expect(items[2]!.querySelector(".basis-pill")).toHaveAttribute(
      "title",
      "a player's own before-and-after figure · posted up to 8-3; paid past it",
    );
    expect(items[0]!.querySelector(".fig.gain")).toBeNull();
    expect(items[0]!.querySelector(".fig.none")).toHaveTextContent("not measured");
    expect(items[0]).toHaveTextContent("one unmeasured claim of ~+20% account total power");
    // A step's chips leave out the order's own sources, shown once on its callout.
    expect(items[0]!.querySelector(".chips.src")).toBeNull();
    expect(within(items[0]!).getByRole("link", { name: "Guild Lab" })).toHaveAttribute(
      "href",
      "/team-power/power-sources#ps-guild_lab",
    );
    expect(items[0]!.querySelector(".cost-tag.c-free")).toHaveTextContent("Free");
    const paid = screen.getByRole("region", { name: "Paid route" });
    expect(paid.querySelector(".fig.price")).toHaveTextContent("₩6,000$3.99 · weekly");
    expect(paid).toHaveTextContent("no gain posted");
  });

  it("compares every power source in one table, best grade at the chosen stage first", async () => {
    await renderAt("/team-power/power-sources");
    const table = await screen.findByRole("region", { name: /Compared, best at near 2.2G first/ });
    const rows = gridRows(table);
    // Medium at 2.2G sorts above the ungraded notes; free sorts above mixed within a grade.
    expect(rows.map((r) => r[0])).toEqual([
      "Plating",
      "Guild Lab",
      "Lineup padding",
      "Stellar Link",
    ]);
    expect(rows[0]).toEqual([
      "Plating",
      "Free or paid",
      "High",
      "Medium",
      "Low",
      "Medium",
      "+1.6%",
    ]);
    expect(rows[3]![5]).toBe("–");
    expect(rows[3]![6]).toBe("+10%");
    expect(table.querySelectorAll("th.chosen")).toHaveLength(1);
    expect(table.querySelector("th.chosen")).toHaveTextContent("Near 2.2G");
    fireEvent.click(screen.getByRole("button", { name: "Early" }));
    const early = await screen.findByRole("region", { name: /Compared, best at early first/ });
    expect(gridRows(early).map((r) => r[0])).toEqual([
      "Stellar Link",
      "Plating",
      "Guild Lab",
      "Lineup padding",
    ]);
    expect(document.getElementById("ps-plating")).not.toBeNull();
  });

  it("shows the measured sources' figures side by side, marking the inferred one, and divides nothing", async () => {
    await renderAt("/team-power/power-sources");
    const numbers = await screen.findByRole("region", { name: "Where the record has numbers" });
    expect(numbers.querySelector(".callout")).toHaveTextContent("Gains aren't divided by cost");
    expect(within(numbers).getAllByText("Inferred")).toHaveLength(1);
    expect(numbers).toHaveTextContent("about ₩14,700");
  });

  it("opens the spending order on the reader's stage, and switches stage through the URL", async () => {
    const router = await renderAt("/team-power/spending");
    const free = await screen.findByRole("region", { name: "Free route" });
    await waitFor(() => expect(free).toHaveTextContent("Check the guild's research level."));
    expect(free).toHaveTextContent("Free to check.");
    expect(screen.getByRole("heading", { name: /Stages 300–328 at ~2–4G/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Stages 168–248" }));
    await waitFor(() => expect(router.state.location.search).toEqual({ order: "mid" }));
    await waitFor(() =>
      expect(screen.getByRole("region", { name: "Free route" })).toHaveTextContent(
        "Plating to 15 with free Chocosteel.",
      ),
    );
    // Graded at the order's own stage: plating is medium mid-game.
    expect(
      screen.getByRole("region", { name: "Free route" }).querySelector(".grade .pill"),
    ).toHaveTextContent("Medium");
  });

  it("puts the planner's answer first, and asks for a power before one is typed", async () => {
    await renderAt("/team-power/planner");
    expect(
      await screen.findByText("Type your team power above to see how far it pushes."),
    ).toBeVisible();
    expect(screen.queryByRole("region", { name: "Where you stand" })).toBeNull();
  });

  it("places a typed power on the stages and multiplies only posted gains into reach", async () => {
    await renderAt("/team-power/planner?power=2.2G");
    const standing = await screen.findByRole("region", { name: "Where you stand" });
    const tiles = [...standing.querySelectorAll("li.tile")];
    const at35 = tiles.find((t) => t.textContent.startsWith("35%"))!;
    expect(at35.querySelector(".tile-big")).toHaveTextContent("304-30");
    expect(at35.querySelector(".tile-sub")).toHaveTextContent("Boss 304");
    expect(at35.querySelector(".tile-next")).toHaveTextContent("Next 308-30 at 2.4G (+9.1%)");
    const at55 = tiles.find((t) => t.textContent.startsWith("55%"))!;
    expect(at55).toHaveClass("short");
    expect(at55.querySelector(".tile-big")).toHaveTextContent("Not yet");
    expect(at55.querySelector(".tile-sub")).toHaveTextContent("first: 300-30");
    const buys = await screen.findByRole("region", { name: "What the next gains buy" });
    const rows = bodyRows(buys);
    expect(rows[0]).toEqual(
      expect.arrayContaining([
        "2.42G",
        "– (no change)",
        "308-30 (+1 chapter; the next, 308-30, was +9.1% away)",
        "312-30 (no change)",
      ]),
    );
    expect(rows[1]).toEqual(expect.arrayContaining(["not derived"]));
    const claimRow = buys.querySelectorAll("tbody tr")[1]!;
    expect(claimRow.querySelector(".fig.gain")).toBeNull();
    expect(claimRow.querySelector(".pill.claimed")).toHaveTextContent("Claimed");
    expect(rows[2]).toEqual(expect.arrayContaining(["304-30 (no change)"]));
  });

  it("marks an approximate figure and credits a crossing to the gap it closes, at record 003's real chapter powers", async () => {
    const approximate = POINTS.map((p) =>
      p.slug === "plate-14-15"
        ? { ...p, approximate: true, note: "midpoint used; doesn't say team or total power" }
        : p,
    );
    await renderRoute(
      "/team-power/planner?power=2.2G",
      {
        ...API,
        "/api/power-data-points": { body: approximate },
        "/api/stage-chapters": {
          body: [
            chapter(303, 5.49e9),
            chapter(304, 5.54925e9),
            chapter(305, 5.7e9),
            chapter(306, 5.9e9),
            chapter(307, 6.05e9),
            chapter(308, 6.1215e9),
          ],
        },
      },
      { mode: TEAM_POWER },
    );
    const standing = await screen.findByRole("region", { name: "Where you stand" });
    expect(standing).toHaveTextContent("Next 304-30 at 2.22G (+0.9%)");
    const buys = await screen.findByRole("region", { name: "What the next gains buy" });
    const plating = buys.querySelectorAll("tbody tr")[2]!;
    const cells = [...plating.querySelectorAll("td")].map((td) => td.textContent);
    expect(plating.querySelector(".fig.gain")).toHaveTextContent("≈ +1.6%");
    expect(plating).toHaveTextContent("The figure: midpoint used; doesn't say team or total power");
    expect(cells).toContain("≈ 2.24G");
    expect(cells).toContain("304-30 (+1 chapter; the next, 304-30, was +0.9% away)");
    const stellar = [...buys.querySelectorAll("tbody tr")[0]!.querySelectorAll("td")].map(
      (td) => td.textContent,
    );
    expect(stellar).toContain("2.42G");
    expect(stellar).toContain("307-30 (+4 chapters; the next, 304-30, was +0.9% away)");
  });

  it("titles the overview's account card for this section", async () => {
    await renderRoute(
      "/team-power",
      {
        ...API,
        [`/api/recommendations?record=${SLUG}`]: {
          body: [
            {
              id: 1,
              summary: "At about 2.2G your preset reaches 304-19.",
              changes: ["Check the guild."],
              recordSlug: SLUG,
              sources: CITE,
            },
          ],
        },
      },
      { mode: TEAM_POWER },
    );
    expect(await screen.findByRole("heading", { name: "For your account" })).toBeVisible();
    expect(screen.queryByText("Your lineup against the meta")).toBeNull();
  });

  it("leaves a figure with no before and after, such as a bundled gain, out of the numbers block", async () => {
    const bundled = point(9, "newbie-doubling", {
      powerSource: "stellar_link",
      deltaPct: 100,
      cost: "Stellar, Resolve and gear together",
    });
    await renderRoute(
      "/team-power/power-sources",
      { ...API, "/api/power-data-points": { body: [...POINTS, bundled] } },
      { mode: TEAM_POWER },
    );
    const numbers = await screen.findByRole("region", { name: "Where the record has numbers" });
    expect(numbers).not.toHaveTextContent("Stellar, Resolve and gear together");
    expect(numbers).toHaveTextContent("+10%2G → 2.2G");
    const table = screen.getByRole("region", { name: /Compared, best at/ });
    expect(gridRows(table).find((r) => r[0] === "Stellar Link")![6]).toBe("+10%");
  });

  it("leads each package with a buy or skip verdict and its price, buys first and skips last", async () => {
    await renderRoute(
      "/team-power/packages",
      {
        ...API,
        "/api/packages": {
          body: [
            { ...PACKAGES[0]!, verdict: "Called the worst value in the shop." },
            PACKAGES[1]!,
            { ...PACKAGES[2]!, verdict: "Early must-buy: carries stages 20–30s." },
          ],
        },
      },
      { mode: TEAM_POWER },
    );
    await screen.findByText("Key Set");
    const rows = [...document.querySelector("table")!.querySelectorAll("tbody tr")];
    expect(rows.map((r) => r.querySelector(".pack-name b")?.textContent)).toEqual([
      "Monthly Reward",
      "Stellar Pack",
      "Key Set",
    ]);
    expect(rows[0]!.querySelector(".pill.good")).toHaveTextContent("Buy");
    expect(rows[0]!.querySelector(".fig.price")).toHaveTextContent("₩7,500≈ $4.99");
    expect(rows[1]!.querySelector(".pill")).toBeNull();
    expect(rows[2]!.querySelector(".pill.avoid")).toHaveTextContent("Skip");
  });

  it("drops an unknown order or power source from the URL", async () => {
    const router = await renderAt("/team-power/spending?order=bogus");
    const free = await screen.findByRole("region", { name: "Free route" });
    await waitFor(() => expect(free).toHaveTextContent("Check the guild's research level."));
    await waitFor(() => expect(router.state.location.search).toEqual({}));
    cleanup();
    const curves = await renderAt("/team-power/curves?source=bogus");
    await waitFor(() => expect(curves.state.location.search).toEqual({}));
    expect(await screen.findByRole("region", { name: "Plating odds by level" })).toBeVisible();
  });

  it("filters packages and data points by every figure their rows show", async () => {
    await renderAt("/team-power/packages?q=%243.99");
    await screen.findByText("Key Set");
    expect(screen.queryByText("Stellar Pack")).toBeNull();
    cleanup();
    await renderAt("/team-power/packages?q=Medium%20spender");
    await screen.findByText("Stellar Pack");
    expect(screen.queryByText("Key Set")).toBeNull();
    cleanup();
    await renderAt("/team-power/data-points?q=2.2G");
    await screen.findByText("note stellar8-triangle-2g");
    expect(screen.queryByText("note plate-14-15")).toBeNull();
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
