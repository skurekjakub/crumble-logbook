/**
 * The Guild Conquest section: its tabs, view copy, boss screen and leaderboard.
 *
 * @module
 */
import { modeLink, modeTab } from "./links";
import type { ModeSection } from "./types";

/** Guild Conquest (길드 토벌전): the Piñata raid. */
export const CONQUEST = {
  id: "conquest",
  kind: "mode",
  label: "Guild Conquest",
  labelKr: "길드 토벌전",
  title: "Piñata Raid Logbook",
  to: "/conquest",
  link: modeLink("conquest"),
  recordSlug: "001-guild-conquest-meta",
  lede: null,
  stamp: ["updated", "season", "sources", "decks"],
  tabs: [
    modeTab("conquest", "overview", "Overview", "/$mode"),
    modeTab("conquest", "decks", "Decks", "/$mode/decks"),
    modeTab("conquest", "runes", "Sugar runes", "/$mode/runes"),
    modeTab("conquest", "gear", "Gear", "/$mode/gear"),
    modeTab("conquest", "scores", "Scores & RNG", "/$mode/scores"),
    modeTab("conquest", "mechanics", "Mechanics", "/$mode/mechanics"),
    modeTab("conquest", "timeline", "Timeline", "/$mode/timeline"),
    modeTab("conquest", "boss", "Piñata", "/$mode/boss"),
  ],
  scope: { mode: "guild_conquest" },
  placeholder: null,
  copy: {
    overview: {
      title: "What the top players do",
      lede: ["Ranked findings, the strongest first.", "Each links the posts it stands on."],
    },
    decks: {
      title: "Decks",
      lede: [
        "Best documented lineups, meta first, each with its ceiling.",
        "Striped slots are deliberate Lv.1 fillers.",
        "Each cookie's row says why it's there.",
      ],
      topic: "filler_levels",
    },
    runes: {
      title: "Sugar runes",
      lede: [
        "Raid rune lines per cookie.",
        '"All" means every line rolls the same stat.',
        "Disputed: posters disagree, and both sides are kept.",
      ],
    },
    gear: {
      title: "Gear substats",
      lede: [
        "Laid out like the equipment screen.",
        "Whole-set notes, like which preset to wear, sit below.",
      ],
    },
    scores: {
      title: "Scores and RNG",
      lede: [
        "Ranked by damage; the best run leads.",
        "Solid dots have a screenshot; faded dots are text claims.",
        "Dashed lines mark 배 (damage ÷ power), a normaliser only.",
      ],
    },
    mechanics: {
      title: "Mechanics",
      lede: [
        "What players measured or datamined (클뜯).",
        "Confidence rates the sourcing, not how plausible it sounds.",
      ],
    },
    timeline: {
      title: "How the meta moved",
      lede: ["Patches, new cookies and the decks that followed, oldest first."],
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
    lede: [
      "When it hits, and what it takes to survive.",
      "What each buffer gives by star.",
      "What to run, and the ATK-order check.",
    ],
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
    lede: [
      "One season's crumb.gg board, in rank order.",
      "Players and guilds rank by damage; power by team power.",
    ],
    boards: { players: "Players", guilds: "Guilds", power: "Power" },
  },
  rules: null,
  accountTitle: "Your lineup against the meta",
  stage: null,
  dungeon: null,
  teamPower: null,
  daily: null,
} as const satisfies ModeSection;
