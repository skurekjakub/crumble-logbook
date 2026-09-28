/**
 * The Guild Conquest section: its tabs, view copy, boss screen and leaderboard.
 *
 * @module
 */
import type { ModeSection } from "./types";

/** Guild Conquest (길드 토벌전): the Piñata raid. */
export const CONQUEST = {
  id: "conquest",
  kind: "mode",
  label: "Guild Conquest",
  labelKr: "길드 토벌전",
  title: "Piñata Raid Logbook",
  to: "/conquest",
  recordSlug: "001-guild-conquest-meta",
  lede: null,
  stamp: ["updated", "season", "sources", "decks"],
  tabs: [
    { id: "overview", label: "Overview", to: "/conquest" },
    { id: "decks", label: "Decks", to: "/conquest/decks" },
    { id: "runes", label: "Sugar runes", to: "/conquest/runes" },
    { id: "gear", label: "Gear", to: "/conquest/gear" },
    { id: "scores", label: "Scores & RNG", to: "/conquest/scores" },
    { id: "mechanics", label: "Mechanics", to: "/conquest/mechanics" },
    { id: "timeline", label: "Timeline", to: "/conquest/timeline" },
    { id: "boss", label: "Piñata", to: "/conquest/boss" },
  ],
  scope: { mode: "guild_conquest" },
  placeholder: null,
  copy: {
    overview: {
      title: "What the top players do",
      lede: "The load-bearing findings, each with the posts it stands on.",
    },
    decks: {
      title: "Decks",
      lede: "Lineups as the guides post them. Striped slots are deliberate Lv.1 fillers; each cookie's row under its deck says why it's there.",
      topic: "filler_levels",
    },
    runes: {
      title: "Sugar runes",
      lede: 'Raid rune lines per cookie. "All" means every line rolls the same stat. Disputed rows are where posters disagreed; both sides are kept.',
    },
    gear: {
      title: "Gear substats",
      lede: "Laid out like the equipment screen. Notes that apply to the whole set, such as which preset to wear, are under the board.",
    },
    scores: {
      title: "Scores and RNG",
      lede: "Each dot is one posted score: team power across, damage up, both on log scales. Dashed lines mark 배 multiples (damage ÷ power), the unit the Korean community compares runs by. Solid dots have a screenshot behind them; faded dots are claims in text.",
    },
    mechanics: {
      title: "Mechanics",
      lede: "What the community measured or datamined (클뜯). Confidence reflects how well each point is sourced, not how plausible it sounds.",
    },
    timeline: {
      title: "How the meta moved",
      lede: "Patches, new cookies and the decks that followed, oldest first.",
    },
  },
  boss: {
    id: "pinata",
    kr: "지나치게 무거워진 피냐타",
    name: "Piñata",
    facts: [
      { label: "English name", topic: "boss_name" },
      { label: "Element", topic: "boss_element" },
      { label: "Weak to", topic: "boss_weakness" },
      { label: "Score", topic: "boss_score" },
    ],
    topics: {
      buffFormula: "buff_formula",
      debuffFormula: "debuff_formula",
      haste: "haste_breakpoint",
      atkPet: "atk_pet",
    },
    lede: "The Guild Conquest boss on one page: when it hits, what it takes to live through it, what each buffer gives by star, and what to run.",
    deck: "cherry",
    gearContext: "raid",
    catcherKr: "전갈",
    atkPetKr: "와사비문어",
    hasteKr: "브시커",
    debufferKr: "닼초",
    lengthEvent: "fight_length",
    survival: [
      {
        name: "slam",
        anchor: "slam_pattern",
        events: ["slam_pattern", "mob_wave_hit"],
        topic: "survival_slam",
      },
      {
        name: "super-jump wipe",
        anchor: "super_jump_wipe",
        events: ["chip_deaths_begin", "super_jump_wipe"],
        topic: "survival_wipe",
      },
    ],
  },
  leaderboard: {
    title: "crumb.gg leaderboard",
    lede: "The crumb.gg board for one season, in rank order. The players and guilds boards rank by damage; the power board ranks by team power.",
    boards: { players: "Players", guilds: "Guilds", power: "Power" },
  },
  rules: null,
} as const satisfies ModeSection;
