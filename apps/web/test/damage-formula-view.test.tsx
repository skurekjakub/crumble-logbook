import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  FormulaClaim,
  FormulaConstant,
  FormulaStep,
  Mechanic,
  ResearchRecord,
  Takeaway,
} from "../src/api/types";
import type { Canned } from "./helpers";
import { renderRoute, VIEW_SOURCES } from "./view-harness";

const SLUG = "007-damage-formula";

const RECORD = {
  slug: SLUG,
  question: "How does the client compute damage?",
  status: "active",
  startedAt: "2026-10-10",
  updatedAt: "2026-10-10",
  seasonLabel: "Client 1.5.002",
  lede: "What multiplies what in a hit's damage.",
  caveat: null,
  mode: "damage_formula",
  modes: [],
} satisfies ResearchRecord;

/**
 * Builds a formula step.
 *
 * @param id - the row's id
 * @param slug - its curated id
 * @param over - fields to set on top
 * @returns the step
 */
function step(id: number, slug: string, over: Partial<FormulaStep> = {}): FormulaStep {
  return {
    id,
    slug,
    position: id,
    phase: "factor",
    name: slug,
    expression: `${slug} expr`,
    feeds: [],
    stacking: "additive",
    appliesTo: null,
    confidence: "read",
    why: `${slug} why`,
    detail: null,
    codeRef: null,
    recordSlug: SLUG,
    sources: ["dc:76135"],
    ...over,
  };
}

const STEPS = [
  step(1, "miss", { phase: "gate", name: "Miss roll", appliesTo: "Only against Avoidance" }),
  step(2, "skill-amp", { name: "Skill amp", feeds: ["Skill AMP"], why: "One pool." }),
  step(3, "damage-reduction", { name: "Enemy DMG RES", stacking: "screen" }),
  step(4, "defense", { name: "Enemy DEF", confidence: "inferred", codeRef: "DamageSystem+0x90" }),
  step(5, "floor", { phase: "result", name: "Floor", stacking: null }),
  step(6, "element", {
    name: "Element",
    stacking: "mixed",
    why: "Light vs Dark: the reduction wins whenever C_dec plus the boss's element RES is above 0.",
  }),
];

const CONSTANTS: FormulaConstant[] = [
  {
    id: 1,
    slug: "c-def",
    position: 0,
    step: "defense",
    symbol: "C_def",
    field: "_combatConstantDefense",
    holder: "DamageSystem+0x90",
    labelKr: "방어 상수",
    meaning: "The DEF at which a hit keeps 59%.",
    value: null,
    candidate: "500 (crumblehub's default)",
    measure: "Two hits at two DEF values.",
    recordSlug: SLUG,
    sources: ["dc:76135"],
  },
];

const CLAIMS: FormulaClaim[] = [
  {
    id: 1,
    slug: "weapon-digits",
    position: 0,
    claim: "Take crit rate when the digits are 30+.",
    code: "Expected damage is linear in crit rate.",
    verdict: "disagrees",
    refRecord: "001-guild-conquest-meta",
    refTitle: "Weapon: crit rate or crit dmg",
    recordSlug: SLUG,
    sources: ["dc:76135"],
  },
  {
    id: 2,
    slug: "crit-tiers",
    position: 1,
    claim: "200% crits twice.",
    code: "Floor of e tiers.",
    verdict: "agrees",
    refRecord: null,
    refTitle: null,
    recordSlug: SLUG,
    sources: ["dc:76135"],
  },
];

/**
 * Builds a mechanic of the formula's record.
 *
 * @param id - the row's id
 * @param topic - its topic
 * @param title - its title
 * @returns the mechanic
 */
function mechanic(id: number, topic: string, title: string): Mechanic {
  return {
    id,
    title,
    body: `${title} body`,
    confidence: "high",
    mode: "damage_formula",
    topic,
    alsoTopics: [],
    recordSlug: SLUG,
    sources: ["dc:76135"],
  };
}

const MECHANICS = [
  mechanic(1, "stacking", "ATK and HP"),
  mechanic(2, "crit", "Raise the lower stat"),
  mechanic(3, "open_question", "Heals"),
  mechanic(4, "method", "Client 1.5.002"),
];

const TAKEAWAYS: Takeaway[] = [
  {
    id: 1,
    position: 0,
    text: "Skill amp is one additive bucket.",
    detail: null,
    mode: "damage_formula",
    recordSlug: SLUG,
    sources: ["dc:76135"],
  },
  {
    id: 2,
    position: 1,
    text: "Don't pay for amp on a debuffer: debuffs never take it.",
    detail: null,
    mode: "damage_formula",
    recordSlug: SLUG,
    sources: ["dc:76135"],
  },
];

const API: Record<string, Canned> = {
  [`/api/records/${SLUG}`]: { body: RECORD },
  [`/api/sources?record=${SLUG}`]: { body: VIEW_SOURCES },
  "/api/formula-steps": { body: STEPS },
  "/api/formula-constants": { body: CONSTANTS },
  "/api/formula-claims": { body: CLAIMS },
  "/api/mechanics?mode=damage_formula": { body: MECHANICS },
  "/api/takeaways?mode=damage_formula": { body: TAKEAWAYS },
};

/**
 * The page section named by its heading.
 *
 * @param name - the heading's text
 * @returns the section
 */
const region = async (name: string) => screen.findByRole("region", { name });

describe("/formula", () => {
  it("sits among the shared sections, headed by its record", async () => {
    await renderRoute("/formula", API);
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    expect(within(nav).getByRole("link", { name: "Damage formula" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await screen.findByText("What multiplies what in a hit's damage.")).toBeVisible();
  });

  it("writes the multipliers as one line, each linking to its card, the screen one marked", async () => {
    await renderRoute("/formula", API);
    const strip = await screen.findByLabelText("Damage formula");
    const terms = within(strip).getAllByRole("link");
    expect(terms.map((a) => a.textContent)).toEqual([
      "Skill amp",
      "Enemy DMG RES",
      "Enemy DEF",
      "Element",
    ]);
    expect(terms[0]).toHaveAttribute("href", "#step-skill-amp");
    expect(terms[1]).toHaveClass("screen");
  });

  it("groups the steps by phase, numbered, each with its confidence and stacking badges", async () => {
    await renderRoute("/formula", API);
    const pipeline = await region("Pipeline");
    const cards = await within(pipeline).findAllByRole("article");
    expect(cards.map((c) => within(c).getByRole("heading").textContent)).toEqual([
      "Miss roll",
      "Skill amp",
      "Enemy DMG RES",
      "Enemy DEF",
      "Element",
      "Floor",
    ]);
    expect(within(cards[0]!).getByText("Only against Avoidance", { exact: false })).toBeVisible();
    expect(within(cards[1]!).getByText("adds inside")).toBeVisible();
    expect(within(cards[2]!).getByText("screen stacking")).toBeVisible();
    expect(within(cards[3]!).getByText("inferred")).toBeVisible();
    expect(within(cards[3]!).getByRole("link", { name: "C_def ?" })).toHaveAttribute(
      "href",
      "#const-c-def",
    );
    expect(within(cards[4]!).getByText("adds; RES screens")).toBeVisible();
    expect(within(cards[5]!).queryByText("adds inside")).toBeNull();
  });

  it("cuts a step's long why to one line that expands on demand, and leaves a short one whole", async () => {
    await renderRoute("/formula", API);
    const pipeline = await region("Pipeline");
    const cards = await within(pipeline).findAllByRole("article");
    expect(within(cards[4]!).getByRole("button", { name: "More" })).toBeVisible();
    expect(within(cards[1]!).getByText("One pool.")).toBeVisible();
    expect(within(cards[1]!).queryByRole("button", { name: "More" })).toBeNull();
  });

  it("works out the expected crit and which stat's next point is worth more", async () => {
    await renderRoute("/formula", API);
    const crit = await region("Crit");
    expect(within(crit).getByLabelText("Expected crit multiplier")).toHaveTextContent("×2.35");
    expect(within(crit).getByText("next point: crit DMG")).toBeVisible();
    fireEvent.change(within(crit).getByLabelText(/Crit DMG/), { target: { value: "200" } });
    expect(within(crit).getByText("next point: crit rate")).toBeVisible();
    fireEvent.change(within(crit).getByLabelText(/Crit rate/), { target: { value: "-20" } });
    expect(within(crit).getByLabelText("Expected crit multiplier")).toHaveTextContent("×1");
    expect(within(crit).getByText("next point: crit rate")).toBeVisible();
    fireEvent.change(within(crit).getByLabelText(/Crit rate/), { target: { value: "x" } });
    expect(within(crit).getByRole("alert")).toHaveTextContent("Enter both as percentages");
    expect(await within(crit).findByText("Raise the lower stat")).toBeVisible();
  });

  it("marks each upgrade verdict as a do or, when its wording says so, an avoid", async () => {
    await renderRoute("/formula", API);
    const upgrade = await region("What to upgrade");
    const rows = await within(upgrade).findAllByRole("listitem");
    expect(within(rows[0]!).getByRole("img", { name: "do" })).toHaveTextContent("✓");
    expect(within(rows[1]!).getByRole("img", { name: "avoid" })).toHaveTextContent("✗");
    expect(within(rows[1]!).queryByRole("img", { name: "do" })).toBeNull();
  });

  it("shows each claim's verdict first, a contradicted one as wrong, with where it's recorded", async () => {
    await renderRoute("/formula", API);
    const claims = await region("Community vs code");
    const rows = await within(claims).findAllByRole("listitem");
    expect(within(rows[0]!).getByText("wrong")).toBeVisible();
    expect(within(rows[0]!).getByText("001 · Weapon: crit rate or crit dmg")).toBeVisible();
    expect(within(rows[1]!).getByText("agrees")).toBeVisible();
  });

  it("lists the constants as unknown with their guess, the verdicts, stacking rules and open questions", async () => {
    await renderRoute("/formula", API);
    const constants = await region("Server constants");
    expect(await within(constants).findByText("unknown")).toBeVisible();
    expect(within(constants).getByText("guess: 500 (crumblehub's default)")).toBeVisible();
    const upgrade = await region("What to upgrade");
    expect(await within(upgrade).findByText("Skill amp is one additive bucket.")).toBeVisible();
    expect(await within(await region("Inside a bucket")).findByText("ATK and HP")).toBeVisible();
    expect(await within(await region("Open questions")).findByText("Heals")).toBeVisible();
    expect(await screen.findByRole("contentinfo", { name: "Method" })).toHaveTextContent(
      "Client 1.5.002",
    );
  });
});
