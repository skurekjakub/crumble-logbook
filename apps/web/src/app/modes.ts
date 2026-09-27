/**
 * The app's navigation and mode config: game modes (each with its research
 * record, sub-tabs, API scope, view copy and mode-specific screens) and the
 * shared sections that sit outside any mode. The root route renders the
 * header, mode tabs and sub-tabs from this file alone.
 *
 * A view that serves several modes takes a {@link ModeSection} and reads
 * its scope and copy from it; each mode mounts it at its own static route.
 * A mode-specific screen (the conquest boss screen) takes its own config
 * block from its mode.
 */
import type { ModeScope, RankingBoardFilter } from "../api/queries";
import type { GearRec } from "../api/types";
import type { FileRoutesByTo } from "../routeTree.gen";

/** A navigable app path, checked against the generated route tree. */
export type AppPath = keyof FileRoutesByTo;

/** A figure the header's stamp can show. */
export type StampStat = "updated" | "season" | "sources" | "decks";

/** A sub-tab within a section. */
export interface SectionTab {
  /** Unique within the section; the tab's DOM id is `tab-<section id>-<tab id>`. */
  id: string;
  label: string;
  to: AppPath;
}

/** A view's heading and the lede under it. */
export interface ViewCopy {
  title: string;
  lede: string;
}

/** The views several modes share, by name. */
export type SharedView =
  "overview" | "decks" | "runes" | "gear" | "scores" | "mechanics" | "timeline";

/** What a top-level section has, whether a game mode or a shared page. */
interface SectionBase {
  /** The first path segment, and the tab's DOM id suffix (`tab-<id>`). */
  id: string;
  /** Tab label. */
  label: string;
  /** Korean name shown in the header label instead of `label`, when known. */
  labelKr: string | null;
  /** The header's `<h1>`. */
  title: string;
  to: AppPath;
  /** The research record whose lede, season and update date fill the header; null for none. */
  recordSlug: string | null;
  /** Header lede when there's no record, or the record has none. */
  lede: string | null;
  /** Figures shown in the header stamp, in order. */
  stamp: readonly StampStat[];
  /** Sub-tabs, in order; the first is the section's landing page. Empty for none. */
  tabs: readonly SectionTab[];
}

/**
 * One boss's screen: which boss, which deck its checks read, the cookies
 * and pet its checklist and callouts name, and the fight-event keys it
 * reads. Research findings live in the API data, not here.
 */
export interface BossConfig {
  /** The boss id fight events are stored under. */
  id: string;
  kr: string;
  en: string;
  element: string;
  weakness: string;
  /** The screen's lede. */
  lede: string;
  /** The fight's length in seconds, when no fight event states it. */
  fightSeconds: number;
  /** The deck whose runes and ATK order the screen checks. */
  deck: string;
  /** The gear context the screen shows. */
  gearContext: GearRec["context"];
  /** The cookie levelled to catch a stray beam just below the ranked buffers. */
  catcherKr: string;
  /** The pet whose ATK bonus applies only in battle. */
  atkPetKr: string;
  /** The carry whose haste breakpoint gets a callout (rune-build shorthand). */
  hasteKr: string;
  /** The debuffer whose application chance gets a callout (rune-build shorthand). */
  debufferKr: string;
  /** The fight-event key stating the fight's length. */
  lengthEvent: string;
  /** The fight-event key describing how the fight ends. */
  endEvent: string;
  /** The survival cards: a lethal pattern, its fight-event keys, and the title its mechanics match. */
  survival: readonly { title: string; events: readonly string[]; mechanic: RegExp }[];
}

/** A mode's leaderboard: its heading, and a select label per board it shows. */
export interface LeaderboardConfig extends ViewCopy {
  /** Select label per board; the first is the default. */
  boards: Readonly<Record<RankingBoardFilter, string>>;
}

/** A game mode's section. */
export interface ModeSection extends SectionBase {
  kind: "mode";
  /** How the mode's views scope their API requests. */
  scope: ModeScope;
  /** What the mode's landing page says while it has no screens; null once it has. */
  placeholder: string | null;
  /** Each shared view's heading and lede for this mode. */
  copy: Partial<Record<SharedView, ViewCopy>>;
  /** The mode's boss screen, when it has one. */
  boss: BossConfig | null;
  /** The mode's leaderboard on the scores view, when it has one. */
  leaderboard: LeaderboardConfig | null;
}

/** A section shared by every mode. */
export interface SharedSection extends SectionBase {
  kind: "shared";
}

/** A top-level section: a game mode or a shared page. */
export type Section = ModeSection | SharedSection;

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
      lede: "Lineups as the guides post them. Striped slots are deliberate Lv.1 fillers: they're there for a synergy or passive and kept low so Pomegranate's buff never lands on them.",
    },
    runes: {
      title: "Sugar runes",
      lede: 'Raid rune lines per cookie. "All" means every line rolls the same stat. Disputed rows are where posters disagreed; both sides are kept.',
    },
    gear: {
      title: "Gear substats",
      lede: "Laid out like the equipment screen. Since the 9/23 patch raid gear has its own preset, so it doesn't have to double as arena gear.",
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
    en: "Extra Stuffed Piñata",
    element: "Dark",
    weakness: "Light",
    lede: "The Guild Conquest boss on one page: when it hits, what it takes to live through it, what each buffer gives by star, and what to run.",
    fightSeconds: 60,
    deck: "cherry",
    gearContext: "raid",
    catcherKr: "전갈",
    atkPetKr: "와사비문어",
    hasteKr: "브시커",
    debufferKr: "닼초",
    lengthEvent: "fight_length",
    endEvent: "fight_ends",
    survival: [
      { title: "The 30 s slam", events: ["slam_pattern", "mob_wave_hit"], mechanic: /slam/i },
      {
        title: "The 17 s super-jump wipe",
        events: ["chip_deaths_begin", "super_jump_wipe"],
        mechanic: /wipe/i,
      },
    ],
  },
  leaderboard: {
    title: "crumb.gg leaderboard",
    lede: "The crumb.gg board for one season, in rank order. The players and guilds boards rank by damage; the power board ranks by team power.",
    boards: { players: "Players", guilds: "Guilds", power: "Power" },
  },
} as const satisfies ModeSection;

/** Arena (아레나). */
export const ARENA = {
  id: "arena",
  kind: "mode",
  label: "Arena",
  labelKr: null,
  title: "Arena Logbook",
  to: "/arena",
  recordSlug: null,
  lede: "Arena research is in progress; its screens come once the record has findings.",
  stamp: [],
  tabs: [],
  scope: { mode: "arena" },
  placeholder: "Arena research in progress.",
  copy: {},
  boss: null,
  leaderboard: null,
} as const satisfies ModeSection;

/** Rumble Arena (와글와글 아레나). */
export const RUMBLE = {
  id: "rumble",
  kind: "mode",
  label: "Rumble Arena",
  labelKr: null,
  title: "Rumble Arena Logbook",
  to: "/rumble",
  recordSlug: null,
  lede: "Rumble Arena research is in progress; its screens come once the record has findings.",
  stamp: [],
  tabs: [],
  scope: { mode: "rumble_arena" },
  placeholder: "Rumble Arena research in progress.",
  copy: {},
  boss: null,
  leaderboard: null,
} as const satisfies ModeSection;

/** Game modes, in tab order. */
export const MODES: readonly ModeSection[] = [CONQUEST, ARENA, RUMBLE];

/** Sections shared by every mode, in tab order after the modes. */
export const SHARED_SECTIONS: readonly SharedSection[] = [
  {
    id: "sources",
    kind: "shared",
    label: "Sources",
    labelKr: null,
    title: "Crumble Logbook",
    to: "/sources",
    recordSlug: null,
    lede: null,
    stamp: ["sources"],
    tabs: [],
  },
  {
    id: "glossary",
    kind: "shared",
    label: "Glossary",
    labelKr: null,
    title: "Crumble Logbook",
    to: "/glossary",
    recordSlug: null,
    lede: null,
    stamp: [],
    tabs: [],
  },
];

/** Every top-level section, modes first. */
export const SECTIONS: readonly Section[] = [...MODES, ...SHARED_SECTIONS];

/** Whether `pathname` is `to` or lies under it. */
function isUnder(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * The section a path belongs to, by its first segment.
 *
 * @param pathname - a location pathname, e.g. `/conquest/decks`
 * @returns the section, or undefined for `/` and unknown paths
 */
export function sectionForPath(pathname: string): Section | undefined {
  return SECTIONS.find((s) => isUnder(pathname, s.to));
}

/**
 * The sub-tab a path selects: the tab whose path is the longest prefix of it.
 *
 * @param tabs - a section's tabs
 * @param pathname - a location pathname; a trailing slash is ignored
 * @returns the selected tab, or undefined when none matches
 */
export function activeTab(tabs: readonly SectionTab[], pathname: string): SectionTab | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return tabs
    .filter((t) => isUnder(path, t.to))
    .reduce<SectionTab | undefined>(
      (best, t) => (!best || t.to.length > best.to.length ? t : best),
      undefined,
    );
}
