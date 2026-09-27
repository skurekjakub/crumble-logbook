import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BuffValue, Deck, FightEvent, GearRec, Mechanic, RuneBuild } from "../src/api/types";
import { bodyRows, renderRoute } from "./view-harness";

const PATH = "/conquest/boss";

const FIGHT_EVENTS = [
  {
    id: 2,
    boss: "pinata",
    recordSlug: null,
    tElapsed: 0,
    event: "engage",
    detail: "Team runs in and collides into a line.",
    confidence: "high",
    sources: ["dc:76135"],
  },
  {
    id: 4,
    boss: "pinata",
    recordSlug: null,
    tElapsed: 10,
    event: "boss_defense_phase_1",
    detail: "Datamine claim: boss DR steps to 10%.",
    confidence: "low",
    sources: ["nv:43653"],
  },
  {
    id: 7,
    boss: "pinata",
    recordSlug: null,
    tElapsed: 30,
    event: "slam_pattern",
    detail: "The 30 s slam: front row ~4.5M / back row ~3.5M HP; ~1.5G = never dies here.",
    confidence: "high",
    sources: ["dc:76135"],
  },
  {
    id: 9,
    boss: "pinata",
    recordSlug: null,
    tElapsed: 41,
    event: "chip_deaths_begin",
    detail: "Cookies begin dying individually around 19 s remaining.",
    confidence: "medium",
    sources: [],
  },
  {
    id: 10,
    boss: "pinata",
    recordSlug: null,
    tElapsed: 43,
    event: "super_jump_wipe",
    detail: "The 17 s super-jump: a certain wipe, including runs at 2.2G team power.",
    confidence: "high",
    sources: ["dc:76135"],
  },
  {
    id: 1,
    boss: "pinata",
    recordSlug: null,
    tElapsed: 60,
    event: "fight_length",
    detail: "Guild Conquest fight lasts 60 s total.",
    confidence: "high",
    sources: ["web:crumbgg:rankings-s5"],
  },
  {
    id: 13,
    boss: "pinata",
    recordSlug: null,
    tElapsed: 60,
    event: "fight_ends",
    detail: "The timer ends the fight; damage already dealt is kept.",
    confidence: "medium",
    sources: ["nv:43653"],
  },
  {
    id: 14,
    boss: "pinata",
    recordSlug: null,
    tElapsed: null,
    event: "unresolved_final_dr_stage",
    detail: "The datamine's implied 99% DR stage is never reached.",
    confidence: "low",
    sources: [],
  },
] satisfies FightEvent[];

/** One grade row per star for a cookie's effect. */
function grades(
  base: Pick<BuffValue, "id" | "cookieKr" | "en" | "effectType">,
  values: readonly number[],
  extra: Partial<Pick<BuffValue, "maxStack" | "base" | "scalesWithCasterAmp" | "target">> = {},
): BuffValue[] {
  return [0, 1, 3, 5, 7, 9].map((star, i) => ({
    ...base,
    id: base.id * 10 + i,
    skillGrade: star,
    fromStar: star,
    valuePct: values[i]!,
    maxStack: 1,
    base: "Fixed",
    scalesWithCasterAmp: true,
    target: "team",
    recordSlug: null,
    sources: ["web:crumbgg:rankings-s5"],
    ...extra,
  }));
}

const TEA = { cookieKr: "실론나이트 쿠키", en: "Tea Knight Cookie" };
const CHOCO_CHANCE = grades(
  {
    id: 4,
    cookieKr: "다크초코 쿠키",
    en: "Dark Choco Cookie",
    effectType: "DefensePointReductionChance",
  },
  [20, 20, 20, 20, 20, 20],
  { maxStack: 10, scalesWithCasterAmp: false },
);
const BUFF_VALUES = [
  // Another debuffer with no English name, listed first: matching Dark Choco by `en` would pick it.
  ...grades(
    { id: 5, cookieKr: "미확인 쿠키", en: null, effectType: "DefensePointReductionChance" },
    [35, 35, 35, 35, 35, 35],
    { scalesWithCasterAmp: false },
  ),
  ...grades({ id: 1, ...TEA, effectType: "BossDamageRateAddition" }, [45, 50, 55, 60, 65, 70]),
  ...grades({ id: 2, ...TEA, effectType: "DefensePointMultiplier" }, [10, 20, 30, 40, 50, 60], {
    maxStack: 2,
    target: "self",
  }),
  ...grades(
    {
      id: 3,
      cookieKr: "바삭튼튼 소아과 의사 우유맛 쿠키",
      en: "Milk Cookie's Crunchy Strong Pediatrician",
      effectType: "AttackPointAddition",
    },
    [6, 6.8, 7.6, 8.4, 9.2, 10],
    { maxStack: 10, base: "CastersAttackPoint" },
  ),
  ...CHOCO_CHANCE,
];

/** A conquest mechanic with defaults for the fields a test doesn't care about. */
function mechanic(
  m: Pick<Mechanic, "id" | "title" | "body" | "confidence" | "topic"> & Partial<Mechanic>,
): Mechanic {
  return { mode: "guild_conquest", recordSlug: null, sources: [], ...m };
}

/** Titles here deliberately don't name what the screen shows them as: the view selects by topic. */
const MECHANICS = [
  mechanic({
    id: 6,
    topic: "haste_breakpoint",
    title: "Drone uptime",
    body: "Haste pays off steeply until about 40 total; past about 58 her drones split onto adds.",
    confidence: "medium",
    sources: ["dc:76135"],
  }),
  mechanic({
    id: 12,
    topic: "survival_wipe",
    title: "Living to the buzzer",
    body: "Posters put the floor at about 9M HP and 45% damage reduction per surviving cookie.",
    confidence: "medium",
    sources: ["nv:43653"],
  }),
  mechanic({
    id: 16,
    topic: "survival_slam",
    title: "First big hit",
    body: "Cookies need about 3.5–4M HP to live through the 30 s slam.",
    confidence: "low",
  }),
  mechanic({
    id: 17,
    topic: null,
    title: "Surviving the slam without topic",
    body: "A survival-sounding title with no topic stays off the boss screen.",
    confidence: "high",
  }),
  mechanic({
    id: 10,
    topic: "atk_pet",
    title: "The pet",
    body: "The bonus isn't shown on the stat screen, so ATK-order tuning has to add it by hand.",
    confidence: "medium",
  }),
  mechanic({
    id: 4,
    topic: null,
    title: "Crit above 100%",
    body: "Crit rate past 100% rolls extra crit tiers.",
    confidence: "high",
  }),
  mechanic({
    id: 20,
    topic: "boss_element",
    title: "Element",
    body: "Dark: the lobby shows the moon icon.",
    confidence: "high",
    sources: ["dc:76135"],
  }),
  mechanic({
    id: 21,
    topic: "boss_weakness",
    title: "Weakness",
    body: "Light: the lobby marks the sun icon.",
    confidence: "high",
    sources: ["nv:43653"],
  }),
  mechanic({
    id: 22,
    topic: "boss_score",
    title: "Scoring",
    body: "Damage dealt before the timer ends the fight; an early wipe keeps its damage.",
    confidence: "medium",
    sources: ["web:crumbgg:rankings-s5"],
  }),
  mechanic({
    id: 23,
    topic: "buff_formula",
    title: "Buff formula",
    body: "A buff is base × value × (1 + the caster's skill amp).",
    confidence: "medium",
    sources: ["web:crumbgg:rankings-s5"],
  }),
  mechanic({
    id: 24,
    topic: "debuff_formula",
    title: "Debuff formula",
    body: "Chance = base chance × (focus ÷ resist + focus% − resist%).",
    confidence: "medium",
    sources: ["dc:76135"],
  }),
];

const RUNE_BUILDS = [
  {
    id: 2,
    cookieKr: "브시커",
    en: "Brightseeker Cookie",
    mode: "guild_conquest",
    recordSlug: null,
    lines: "Skill haste first (target 40–50 total with gear)",
    why: "More haste keeps more of her drones up; top posters run 44.6–49.6.",
    disputed: "At 58.6 haste, 1–2 drones peeled off onto adds.",
    decks: ["cherry"],
    sources: ["dc:76135"],
  },
  {
    id: 9,
    cookieKr: "닼초",
    en: "Dark Choco Cookie",
    mode: "guild_conquest",
    recordSlug: null,
    lines: "Skill haste (+ damage reduction)",
    why: "Her DEF shred isn't amplified by skill amp, so haste to reapply it faster.",
    disputed: "One commenter argues focus raises her debuff proc chance.",
    decks: ["cherry"],
    sources: [],
  },
  {
    id: 12,
    cookieKr: "메소",
    en: "Melon Soda Cookie",
    mode: "guild_conquest",
    recordSlug: null,
    lines: "Move speed",
    why: "Placement cookie in the Melon Soda deck.",
    disputed: null,
    decks: ["meso"],
    sources: [],
  },
] satisfies RuneBuild[];

const DECKS = [
  {
    id: "cherry",
    position: 0,
    mode: "guild_conquest",
    recordSlug: null,
    nameEn: "Cherry deck",
    nameKr: "체리덱",
    status: "meta",
    ceilingText: null,
    summary: "The standard deck.",
    formation: null,
    perks: null,
    rng: null,
    atkOrder: [
      { kr: "우유", en: "Milk Cookie's Crunchy Strong Pediatrician" },
      { kr: "브시커", en: "Brightseeker Cookie" },
      { kr: "치케", en: "Cheesecake Cookie" },
    ],
    atkOrderNote: "Order by ATK, not power.",
    cookies: [
      {
        id: 8,
        position: 7,
        cookieKr: "전갈",
        en: "Scorpion Cookie",
        level: null,
        levelRule: "Lv.1–45, keeping ATK ≥10% below the 6th cookie after Octo Wasabi's +8%",
        stars: null,
        slot: null,
        why: "A backstop. Check the order in battle, not in the lobby.",
      },
    ],
    pets: [{ kr: "와사비문어", en: "Octo Wasabi" }],
    notes: [],
    sources: ["nv:43653"],
  },
] satisfies Deck[];

const GEAR = [
  {
    id: 4,
    mode: "guild_conquest",
    recordSlug: null,
    slot: "bottom_left",
    substats: "Damage reduction + HP",
    context: "raid",
    why: "Survive the 30 s slam.",
    sources: [],
  },
  {
    id: 2,
    mode: "guild_conquest",
    recordSlug: null,
    slot: "top_left",
    substats: "Skill amp + crit rate (arena)",
    context: "arena",
    why: "Arena pick.",
    sources: [],
  },
] satisfies GearRec[];

/** The buff-values request for one cookie, as the client encodes it. */
const buffsOf = (cookie: string) => `/api/buff-values?cookie=${encodeURIComponent(cookie)}`;

const FULL = {
  "/api/fight-events?boss=pinata": { body: FIGHT_EVENTS },
  "/api/buff-values": { body: BUFF_VALUES },
  [buffsOf("닼초")]: { body: CHOCO_CHANCE },
  "/api/mechanics?mode=guild_conquest": { body: MECHANICS },
  "/api/rune-builds?mode=guild_conquest": { body: RUNE_BUILDS },
  "/api/decks?mode=guild_conquest": { body: DECKS },
  "/api/gear-recs?mode=guild_conquest": { body: GEAR },
};

const EMPTY = {
  "/api/fight-events?boss=pinata": { body: [] },
  "/api/buff-values": { body: [] },
  [buffsOf("닼초")]: { body: [] },
  "/api/mechanics?mode=guild_conquest": { body: [] },
  "/api/rune-builds?mode=guild_conquest": { body: [] },
  "/api/decks?mode=guild_conquest": { body: [] },
  "/api/gear-recs?mode=guild_conquest": { body: [] },
};

/** The page section labelled by the heading `name`. */
const section = (name: string) => screen.getByRole("region", { name });

describe("Piñata boss view", () => {
  it("heads the page with the boss's names and its cited element, weakness, fight length and scoring", async () => {
    await renderRoute(PATH, FULL);
    expect(await screen.findByRole("heading", { level: 2 })).toHaveTextContent(
      "Extra Stuffed Piñata",
    );
    expect(screen.getByText("지나치게 무거워진 피냐타")).toHaveClass("kr");
    const kv = document.querySelector("dl.kv") as HTMLElement;
    const dd = async (label: string) =>
      (await within(kv).findByText(label)).nextElementSibling as HTMLElement;

    const element = await dd("Element");
    expect(element).toHaveTextContent("Dark: the lobby shows the moon icon.");
    expect(within(element).getByText("high")).toHaveClass("pill", "high");
    expect(await within(element).findByRole("link", { name: "DC 76135" })).toBeVisible();

    const weak = await dd("Weak to");
    expect(weak).toHaveTextContent("Light: the lobby marks the sun icon.");
    expect(within(weak).getByText("high")).toHaveClass("pill", "high");
    expect(await within(weak).findByRole("link", { name: "Naver 43653" })).toBeVisible();

    const length = await within(kv).findByText("60 s");
    expect(length.closest("dd")).toHaveTextContent("60 s");
    expect(
      await within(length.closest("dd")!).findByRole("link", { name: "crumbgg:rankings-s5" }),
    ).toBeVisible();

    const score = await dd("Score");
    expect(score).toHaveTextContent("an early wipe keeps its damage");
    expect(within(score).getByText("medium")).toHaveClass("pill", "medium");
    expect(await within(score).findByRole("link", { name: "crumbgg:rankings-s5" })).toBeVisible();
  });

  it("states no element, weakness or scoring the data doesn't hold", async () => {
    await renderRoute(PATH, {
      ...FULL,
      "/api/mechanics?mode=guild_conquest": {
        body: MECHANICS.filter((m) => !m.topic?.startsWith("boss_")),
      },
    });
    const kv = document.querySelector("dl.kv") as HTMLElement;
    expect(await within(kv).findByText("60 s")).toBeVisible();
    expect(within(kv).queryByText("Element")).toBeNull();
    expect(within(kv).queryByText("Weak to")).toBeNull();
    expect(within(kv).queryByText("Score")).toBeNull();
    expect(kv).not.toHaveTextContent(/Dark|Light|wipe/);
  });

  it("places each timed event on a 0–60 s track, with the in-game countdown under it", async () => {
    await renderRoute(PATH, FULL);
    const timeline = await screen.findByRole("region", { name: "Fight timeline" });
    const marks = await within(timeline).findAllByTestId("fight-mark");
    const left = (event: string) => marks.find((m) => m.dataset.event === event)!.style.left;
    expect(left("engage")).toBe("0%");
    expect(left("boss_defense_phase_1")).toBe(`${(10 / 60) * 100}%`);
    expect(left("slam_pattern")).toBe("50%");
    expect(left("super_jump_wipe")).toBe(`${(43 / 60) * 100}%`);
    expect(left("fight_ends")).toBe("100%");
    // The fight's length is the track itself, and an untimed event has no place on it.
    expect(marks.map((m) => m.dataset.event)).not.toContain("fight_length");
    expect(marks.map((m) => m.dataset.event)).not.toContain("unresolved_final_dr_stage");

    const axis = timeline.querySelector(".fe-axis") as HTMLElement;
    expect([...axis.querySelectorAll(".fe-tick")].map((t) => t.textContent)).toEqual([
      "0 s60",
      "10 s50",
      "20 s40",
      "30 s30",
      "40 s20",
      "50 s10",
      "60 s0",
    ]);

    const wipe = within(timeline).getByText("Super jump wipe").closest("li")!;
    expect(wipe).toHaveTextContent("43 s · 17 s left");
    expect(wipe).toHaveTextContent("a certain wipe");
    expect(await within(wipe).findByRole("link", { name: "DC 76135" })).toBeVisible();
  });

  it("hatches low-confidence events and labels them as unverified claims (RF4)", async () => {
    await renderRoute(PATH, FULL);
    const timeline = await screen.findByRole("region", { name: "Fight timeline" });
    const claim = (await within(timeline).findByText("Boss defense phase 1")).closest("li")!;
    expect(claim).toHaveClass("low");
    expect(within(claim).getByText("unverified claim")).toHaveClass("pill", "low");
    const mark = within(timeline)
      .getAllByTestId("fight-mark")
      .find((m) => m.dataset.event === "boss_defense_phase_1")!;
    expect(mark).toHaveClass("low");
    expect(mark).toHaveAttribute("title", expect.stringContaining("unverified claim"));

    const offClock = within(timeline).getByText("Unresolved final dr stage").closest("li")!;
    expect(offClock).toHaveTextContent("Off the clock");
    expect(within(offClock).getByText("unverified claim")).toBeVisible();

    const slam = within(timeline).getByText("Slam pattern").closest("li")!;
    expect(slam).not.toHaveClass("low");
    expect(within(slam).queryByText("unverified claim")).toBeNull();
    expect(within(slam).getByText("high")).toHaveClass("pill", "high");
  });

  it("shows what it takes to survive the slam and the wipe, from the events and the mechanics by topic", async () => {
    await renderRoute(PATH, FULL);
    await screen.findByText("Cookies need about 3.5–4M HP to live through the 30 s slam.");
    const survival = section("Survival");
    const slam = within(survival).getByRole("heading", { name: "The 30 s slam" }).closest(".card")!;
    expect(slam).toHaveTextContent("front row ~4.5M / back row ~3.5M HP");
    expect(slam).toHaveTextContent("30 s · 30 s left");
    expect(slam).toHaveTextContent("First big hit");
    expect(slam).toHaveTextContent("3.5–4M HP");
    const wipe = within(survival)
      .getByRole("heading", { name: "The 17 s super-jump wipe" })
      .closest<HTMLElement>(".card")!;
    expect(wipe).toHaveTextContent("9M HP and 45% damage reduction");
    expect(wipe).toHaveTextContent("including runs at 2.2G team power");
    expect(wipe).toHaveTextContent("Cookies begin dying individually");
    expect(await within(wipe).findByRole("link", { name: "Naver 43653" })).toBeVisible();
    expect(survival).not.toHaveTextContent("Crit rate past 100%");
    expect(survival).not.toHaveTextContent("survival-sounding title");
  });

  it("titles each survival card by the countdown at its event, not a fixed time", async () => {
    await renderRoute(PATH, {
      ...FULL,
      "/api/fight-events?boss=pinata": {
        body: FIGHT_EVENTS.map((e) =>
          e.event === "fight_length"
            ? { ...e, tElapsed: 90 }
            : e.event === "super_jump_wipe"
              ? { ...e, tElapsed: 70 }
              : e,
        ),
      },
    });
    const survival = await screen.findByRole("region", { name: "Survival" });
    expect(await within(survival).findByRole("heading", { name: "The 60 s slam" })).toBeVisible();
    expect(
      within(survival).getByRole("heading", { name: "The 20 s super-jump wipe" }),
    ).toBeVisible();
  });

  it("hatches a low-confidence mechanic in a card and labels it an unverified claim (RF4)", async () => {
    await renderRoute(PATH, FULL);
    const note = (
      await screen.findByText("Cookies need about 3.5–4M HP to live through the 30 s slam.")
    ).closest(".boss-note")!;
    expect(note).toHaveClass("low");
    expect(within(note as HTMLElement).getByText("unverified claim")).toHaveClass("pill", "low");
    const wipeNote = screen
      .getByText(/9M HP and 45% damage reduction/)
      .closest(".boss-note") as HTMLElement;
    expect(wipeNote).not.toHaveClass("low");
    expect(within(wipeNote).getByText("medium")).toHaveClass("pill", "medium");
  });

  it("pivots buff grades into star columns, with Tea Knight's boss-damage buff at 70% from 9★", async () => {
    await renderRoute(PATH, FULL);
    const buffs = await screen.findByRole("region", { name: "Buffs by star" });
    const table = await within(buffs).findByRole("table");
    expect([...table.querySelectorAll("thead th")].map((th) => th.textContent)).toEqual([
      "Cookie",
      "Effect",
      "0★",
      "1★",
      "3★",
      "5★",
      "7★",
      "9★+",
      "Stacks",
      "Sources",
    ]);
    const rows = bodyRows(table);
    const boss = rows.find((r) => r[1]!.startsWith("Boss DMG"))!;
    expect(boss[0]).toContain("Tea Knight Cookie");
    expect(boss.slice(2, 8)).toEqual(["45%", "50%", "55%", "60%", "65%", "70%"]);
    const milk = rows.find((r) => r[1]!.startsWith("ATK +"))!;
    expect(milk[1]).toContain("share of the caster's ATK");
    expect(milk[7]).toBe("10%");
    expect(milk[8]).toBe("×10");
    const formula = within(buffs)
      .getByText("A buff is base × value × (1 + the caster's skill amp).")
      .closest(".boss-note") as HTMLElement;
    expect(within(formula).getByText("medium")).toHaveClass("pill", "medium");
    expect(await within(formula).findByRole("link", { name: "crumbgg:rankings-s5" })).toBeVisible();
    expect(buffs).not.toHaveTextContent(/runs ATK%/);
  });

  it("explains the star columns without claiming a dash holds a value", async () => {
    await renderRoute(PATH, FULL);
    const buffs = await screen.findByRole("region", { name: "Buffs by star" });
    await within(buffs).findByRole("table");
    expect(buffs).toHaveTextContent(/a greyed value is unchanged from the column to its left/i);
  });

  it("writes no formula note of its own when the data has no formula mechanics", async () => {
    await renderRoute(PATH, {
      ...FULL,
      "/api/mechanics?mode=guild_conquest": {
        body: MECHANICS.filter((m) => !m.topic?.endsWith("_formula")),
      },
    });
    const buffs = await screen.findByRole("region", { name: "Buffs by star" });
    await within(buffs).findByRole("table");
    await screen.findByText(/haste pays off steeply/i);
    expect(buffs).not.toHaveTextContent(/skill amp/);
    expect(buffs).not.toHaveTextContent(/focus/);
  });

  it("marks Tea Knight's DEF buff as self-only and Dark Choco's row as an application chance", async () => {
    await renderRoute(PATH, FULL);
    const buffs = await screen.findByRole("region", { name: "Buffs by star" });
    const table = await within(buffs).findByRole("table");
    const trs = [...table.querySelectorAll("tbody tr")] as HTMLElement[];
    const def = trs.find((tr) => tr.textContent!.includes("DEF %"))!;
    expect(within(def).getByText("self only")).toBeVisible();
    expect(trs.at(-1)).toBe(def);
    const team = trs.find((tr) => tr.textContent!.includes("Boss DMG"))!;
    expect(within(team).queryByText("self only")).toBeNull();
    const shred = trs.find((tr) => tr.textContent!.includes("DEF shred"))!;
    expect(within(shred).getByText("chance")).toBeVisible();
    expect(buffs).toHaveTextContent(
      /미확인 쿠키's and Dark Choco Cookie's rows are application chances, not buff sizes/,
    );
    const formula = within(buffs)
      .getByText(/Chance = base chance × \(focus ÷ resist/)
      .closest(".boss-note") as HTMLElement;
    expect(within(formula).getByText("medium")).toHaveClass("pill", "medium");
    expect(await within(formula).findByRole("link", { name: "DC 76135" })).toBeVisible();
  });

  it("gives one card per deck cookie, reason first, with the haste breakpoint and Dark Choco's chance on theirs", async () => {
    await renderRoute(PATH, FULL);
    await screen.findByText(/haste pays off steeply/i);
    const run = section("What to run");
    const cards = [...run.querySelectorAll<HTMLElement>(".rune-card")];
    expect(cards.map((c) => c.querySelector("h4")!.textContent)).toEqual([
      expect.stringContaining("Brightseeker"),
      expect.stringContaining("Dark Choco"),
    ]);
    const [seeker, choco] = cards as [HTMLElement, HTMLElement];
    const why = within(seeker).getByText(/top posters run 44\.6–49\.6/);
    const lines = within(seeker).getByText("Skill haste first (target 40–50 total with gear)");
    expect(why.compareDocumentPosition(lines) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(seeker).toHaveTextContent("Disputed: At 58.6 haste");
    expect(seeker).toHaveTextContent(/haste pays off steeply/i);
    expect(within(seeker).getByText("medium")).toHaveClass("pill", "medium");

    expect(choco).toHaveTextContent("focus raises her debuff proc chance");
    expect(choco).toHaveTextContent("DEF shred base application chance: 20% at every star.");
    expect(within(choco).getByRole("link", { name: /Buffs by star/ })).toHaveAttribute(
      "href",
      "#boss-buffs",
    );
    expect(choco).not.toHaveTextContent("35%");
    expect(within(run).getByText("Damage reduction + HP")).toBeVisible();
    expect(within(run).queryByText("Skill amp + crit rate (arena)")).toBeNull();
  });

  it("checks the Cherry deck's ATK order against the catcher and the pet's in-battle bonus", async () => {
    await renderRoute(PATH, FULL);
    const check = await screen.findByRole("region", { name: "ATK-order check" });
    await within(check).findByText("Brightseeker Cookie");
    expect([...check.querySelectorAll(".order .step")].map((s) => s.textContent)).toEqual([
      "Milk Cookie's Crunchy Strong Pediatrician",
      "Brightseeker Cookie",
      "Cheesecake Cookie",
    ]);
    const items = within(within(check).getByRole("list")).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent(
      "Scorpion Cookie stays below Cheesecake Cookie once Octo Wasabi's in-battle ATK bonus is added.",
    );
    expect(items[0]).toHaveTextContent("Lv.1–45, keeping ATK ≥10% below the 6th cookie");
    expect(items[1]).toHaveTextContent("All 3 cookies in the ATK order sit above Scorpion Cookie.");
    expect(items[2]).toHaveTextContent("Check the order in battle, not in the lobby.");
    expect(items[2]).toHaveTextContent("isn't shown on the stat screen");
  });

  it("shows an empty message in every section when nothing is recorded", async () => {
    await renderRoute(PATH, EMPTY);
    expect(await screen.findByText("No fight events recorded yet.")).toHaveClass("empty");
    expect(await screen.findByText("No survival data recorded yet.")).toHaveClass("empty");
    expect(await screen.findByText("No buff values recorded yet.")).toHaveClass("empty");
    expect(await screen.findByText("No rune builds recorded for this deck yet.")).toHaveClass(
      "empty",
    );
    expect(await screen.findByText("The Cherry deck isn't recorded yet.")).toHaveClass("empty");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Extra Stuffed Piñata");
  });

  it("names the failed resource and keeps the rest of the page", async () => {
    await renderRoute(PATH, {
      ...FULL,
      "/api/fight-events?boss=pinata": { status: 500, body: { error: "internal" } },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load fight events");
    const buffs = await screen.findByRole("region", { name: "Buffs by star" });
    expect(await within(buffs).findByRole("table")).toBeVisible();
  });
});
