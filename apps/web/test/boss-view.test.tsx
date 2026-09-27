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
const BUFF_VALUES = [
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
  ...grades(
    {
      id: 4,
      cookieKr: "다크초코 쿠키",
      en: "Dark Choco Cookie",
      effectType: "DefensePointReductionChance",
    },
    [20, 20, 20, 20, 20, 20],
    { maxStack: 10, scalesWithCasterAmp: false },
  ),
];

const MECHANICS = [
  {
    id: 6,
    mode: "guild_conquest",
    topic: null,
    recordSlug: null,
    title: "Brightseeker haste breakpoint",
    body: "Haste pays off steeply until about 40 total; past about 58 her drones split onto adds.",
    confidence: "medium",
    sources: ["dc:76135"],
  },
  {
    id: 12,
    mode: "guild_conquest",
    topic: null,
    recordSlug: null,
    title: "Surviving the 17 s wipe",
    body: "Posters put the floor at about 9M HP and 45% damage reduction per surviving cookie.",
    confidence: "medium",
    sources: ["nv:43653"],
  },
  {
    id: 16,
    mode: "guild_conquest",
    topic: null,
    recordSlug: null,
    title: "HP to survive the slam",
    body: "Cookies need about 3.5–4M HP to live through the 30 s slam.",
    confidence: "medium",
    sources: [],
  },
  {
    id: 10,
    mode: "guild_conquest",
    topic: null,
    recordSlug: null,
    title: "Octo Wasabi pet",
    body: "The bonus isn't shown on the stat screen, so ATK-order tuning has to add it by hand.",
    confidence: "medium",
    sources: [],
  },
  {
    id: 4,
    mode: "guild_conquest",
    topic: null,
    recordSlug: null,
    title: "Crit above 100%",
    body: "Crit rate past 100% rolls extra crit tiers.",
    confidence: "high",
    sources: [],
  },
] satisfies Mechanic[];

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

const FULL = {
  "/api/fight-events?boss=pinata": { body: FIGHT_EVENTS },
  "/api/buff-values": { body: BUFF_VALUES },
  "/api/mechanics": { body: MECHANICS },
  "/api/rune-builds": { body: RUNE_BUILDS },
  "/api/decks": { body: DECKS },
  "/api/gear-recs": { body: GEAR },
};

const EMPTY = {
  "/api/fight-events?boss=pinata": { body: [] },
  "/api/buff-values": { body: [] },
  "/api/mechanics": { body: [] },
  "/api/rune-builds": { body: [] },
  "/api/decks": { body: [] },
  "/api/gear-recs": { body: [] },
};

/** The page section labelled by the heading `name`. */
const section = (name: string) => screen.getByRole("region", { name });

describe("Piñata boss view", () => {
  it("heads the page with the boss's names, element, weakness, fight length and scoring", async () => {
    await renderRoute(PATH, FULL);
    expect(await screen.findByRole("heading", { level: 2 })).toHaveTextContent(
      "Extra Stuffed Piñata",
    );
    expect(screen.getByText("지나치게 무거워진 피냐타")).toHaveClass("kr");
    const kv = document.querySelector("dl.kv") as HTMLElement;
    expect(within(kv).getByText("Element").nextElementSibling).toHaveTextContent("Dark");
    expect(within(kv).getByText("Weak to").nextElementSibling).toHaveTextContent("Light");
    const length = await within(kv).findByText("60 s");
    expect(length.closest("dd")).toHaveTextContent("60 s");
    expect(
      await within(length.closest("dd")!).findByRole("link", { name: "crumbgg:rankings-s5" }),
    ).toBeVisible();
    expect(within(kv).getByText("Score").nextElementSibling).toHaveTextContent(
      /cumulative damage.*kept even after a wipe/i,
    );
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

  it("shows what it takes to survive the slam and the wipe, from the events and mechanics", async () => {
    await renderRoute(PATH, FULL);
    await screen.findByText("Cookies need about 3.5–4M HP to live through the 30 s slam.");
    const survival = section("Survival");
    const slam = within(survival).getByRole("heading", { name: "The 30 s slam" }).closest(".card")!;
    expect(slam).toHaveTextContent("front row ~4.5M / back row ~3.5M HP");
    expect(slam).toHaveTextContent("30 s · 30 s left");
    expect(slam).toHaveTextContent("3.5–4M HP");
    const wipe = within(survival)
      .getByRole("heading", { name: "The 17 s super-jump wipe" })
      .closest<HTMLElement>(".card")!;
    expect(wipe).toHaveTextContent("9M HP and 45% damage reduction");
    expect(wipe).toHaveTextContent("including runs at 2.2G team power");
    expect(wipe).toHaveTextContent("Cookies begin dying individually");
    expect(await within(wipe).findByRole("link", { name: "Naver 43653" })).toBeVisible();
    expect(survival).not.toHaveTextContent("Crit rate past 100%");
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
    expect(within(buffs).getByText(/value × \(1 \+ the caster's skill amp\)/)).toBeVisible();
    expect(buffs).toHaveTextContent(/Milk Cookie's Crunchy Strong Pediatrician runs ATK%/);
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
    expect(buffs).toHaveTextContent(/Dark Choco Cookie's row is an application chance/);
    expect(buffs).toHaveTextContent(/focus/);
  });

  it("gives the deck's rune guidance, the Brightseeker haste breakpoint and Dark Choco's focus question", async () => {
    await renderRoute(PATH, FULL);
    await screen.findByText(/haste pays off steeply/i);
    const run = section("What to run");
    const haste = within(run)
      .getByText(/haste pays off steeply/i)
      .closest(".card")!;
    expect(haste).toHaveTextContent("Brightseeker haste breakpoint");
    expect(haste).toHaveTextContent("44.6–49.6");
    expect(haste).toHaveTextContent("peeled off onto adds");
    const choco = within(run)
      .getByRole("heading", { name: "Dark Choco: haste or focus" })
      .closest(".card")!;
    expect(choco).toHaveTextContent("focus raises her debuff proc chance");
    expect(choco).toHaveTextContent("DEF shred base application chance: 20% by star");
    const rows = bodyRows(within(run).getByRole("table"));
    expect(rows.map((r) => r[0])).toEqual([
      expect.stringContaining("Brightseeker"),
      expect.stringContaining("Dark Choco"),
    ]);
    expect(rows[0]![2]).toContain("Disputed: At 58.6 haste");
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
