/**
 * The shapes of the app's sections: a game mode's section with its view copy
 * and mode-specific screen blocks, and a shared section outside any mode.
 *
 * @module
 */
import type { ModeScope, RankingBoardFilter } from "../../api/queries";
import type { GearRec } from "../../api/types";
import type { FileRoutesByTo } from "../../routeTree.gen";

/** A route path of the generated route tree, e.g. `/$mode/teams` or `/sources`. */
export type RoutePath = keyof FileRoutesByTo;

/** A route path under a game mode: `/$mode` itself or one of its pages. */
export type ModeRoutePath = Extract<RoutePath, "/$mode" | `/$mode/${string}`>;

/** A route path outside any mode that takes no params. */
export type SharedRoutePath = Exclude<RoutePath, `${string}$${string}`>;

/** A concrete app path, as the address bar shows it, e.g. `/arena/teams`. */
export type AppPath = `/${string}`;

/**
 * Where a link goes, checked against the generated route tree: a page
 * under a mode with the mode's id as its `$mode` param, or a shared page.
 */
export type LinkTarget =
  { to: ModeRoutePath; params: { mode: string } } | { to: SharedRoutePath; params?: undefined };

/** A figure the header's stamp can show. */
export type StampStat = "updated" | "season" | "sources" | "decks";

/** A sub-tab within a section. */
export interface SectionTab {
  /** Unique within the section. */
  id: string;
  label: string;
  /** The tab's concrete path. */
  to: AppPath;
  /** The tab's route, for a link. */
  link: LinkTarget;
}

/**
 * A view's heading and the lede under it. Copy is plain UI text: a research
 * claim the view needs to state goes in a mechanics row, named by `topic`.
 */
export interface ViewCopy {
  title: string;
  /**
   * What the view shows: 1–3 bullets of about 12 words or fewer (AGENTS.md:
   * UI, scannable, not prose). A single string is a one-line explainer.
   */
  lede: string | readonly string[];
  /**
   * The mechanics topic whose cited rows the view shows under its lede,
   * when it has one: rows filed under it, or under it among their `alsoTopics`.
   */
  topic?: string;
}

/** The views several modes share, by name. */
export type SharedView =
  | "overview"
  | "decks"
  | "runes"
  | "gear"
  | "scores"
  | "mechanics"
  | "timeline"
  | "counters"
  | "usage";

/** What a top-level section has, whether a game mode or a shared page. */
interface SectionBase {
  /** The first path segment. */
  id: string;
  /** Tab label. */
  label: string;
  /** Korean name shown in the header label instead of `label`, when known. */
  labelKr: string | null;
  /** The header's `<h1>`. */
  title: string;
  /** The section's concrete path: `/<id>`. */
  to: AppPath;
  /** The section's landing route, for a link. */
  link: LinkTarget;
  /** The research record whose lede, season and update date fill the header; null for none. */
  recordSlug: string | null;
  /** Header lede when there's no record, or the record has none. */
  lede: string | null;
  /** Figures shown in the header stamp, in order. */
  stamp: readonly StampStat[];
  /** Sub-tabs, in order; the first is the section's landing page. Empty for none. */
  tabs: readonly SectionTab[];
}

/** A boss fact shown in the boss screen's header list: its label and the mechanics topic it reads. */
export interface BossFact {
  label: string;
  /** The mechanics topic whose row states the fact, with its confidence and sources. */
  topic: string;
}

/** A lethal pattern's card on the boss screen. */
export interface SurvivalCard {
  /** The pattern's name, lower case; the title adds the countdown at `anchor` ("The 17 s …"). */
  name: string;
  /** The fight-event key whose time names the pattern. */
  anchor: string;
  /** The fight-event keys the card shows, `anchor` included. */
  events: readonly string[];
  /** The mechanics topic of what it takes to live through the pattern. */
  topic: string;
}

/**
 * One boss's screen: which boss, which deck its checks read, the cookies
 * and pet its checklist and callouts name, and the fight-event keys and
 * mechanics topics it reads. Research findings live in the API data, not here.
 */
export interface BossConfig {
  /** The boss id fight events are stored under. */
  id: string;
  /** The boss's Korean name, as the game shows it. */
  kr: string;
  /** The screen's heading: a UI label, not a claim about the English client's name (that's a fact topic). */
  name: string;
  /** The header list's facts, in order, each read from its mechanics topic. */
  facts: readonly BossFact[];
  /** The mechanics topics the screen's callouts read. */
  topics: {
    /** How a buff scales with the caster's skill amp; shown by the buff table. */
    buffFormula: string;
    /** How a debuff's application chance scales; shown by the buff table. */
    debuffFormula: string;
    /** The haste carry's breakpoint; shown on its rune card. */
    haste: string;
    /** The ATK-order pet's in-battle bonus; shown in the ATK-order check. */
    atkPet: string;
  };
  /** The screen's explainer: short bullets, as a view's {@link ViewCopy.lede}. */
  lede: string | readonly string[];
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
  /** The fight-event key stating the fight's length; without it, the track ends at the latest timed event. */
  lengthEvent: string;
  /** The survival cards, in order. */
  survival: readonly SurvivalCard[];
}

/** A mode's leaderboard: its heading, and a select label per board it shows. */
export interface LeaderboardConfig extends ViewCopy {
  /** Select label per board; the first is the default. */
  boards: Readonly<Record<RankingBoardFilter, string>>;
}

/** A mode's rules card on its overview: the mode's `rules` mechanics. */
export interface RulesConfig {
  /** The card's heading. */
  title: string;
  /**
   * The title of the rules row shown apart, above the card, as the season's
   * buffs; null for a mode with none.
   */
  highlight: string | null;
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
  /** The overview's rules card, for a mode whose record files its rules as mechanics. */
  rules: RulesConfig | null;
  /** The heading of the overview's card holding the record's advice for the reader's account. */
  accountTitle: string;
  /** The stage-pushing screens, for the stage mode. */
  stage: StageConfig | null;
  /** The Crumble Dungeon screens, for the Crumble Dungeon mode. */
  dungeon: DungeonConfig | null;
  /** The team-power screens, for the team power mode. */
  teamPower: TeamPowerConfig | null;
}

/**
 * The team-power screens: each one's heading, lede and mechanics topic,
 * the spending order the reader lands on, and the damage shares the
 * planner reports a reach for.
 */
export interface TeamPowerConfig {
  /** The free and paid routes: the ranked orders, step by step. */
  routes: ViewCopy;
  /** Every power source on cost and efficiency. */
  powerSources: ViewCopy;
  /** The spending order per account stage. */
  spending: ViewCopy;
  /** The slug of the spending order shown first: the reader's own account stage. */
  defaultOrder: string;
  /** Team power in, stage reach and what the next gains buy out. */
  planner: ViewCopy;
  /** Kept-damage percentages, highest first, whose furthest stage the planner names. */
  reach: readonly number[];
  /** The shop packages with their prices. */
  packages: ViewCopy;
  /** The cost and return curves. */
  curves: ViewCopy;
  /** Every team-power figure the record found. */
  dataPoints: ViewCopy;
}

/**
 * The Crumble Dungeon screens: each one's heading, lede and mechanics
 * topic, and how many cookies deploy first.
 */
export interface DungeonConfig {
  /** The documented scores, ranked by score. */
  runs: ViewCopy;
  /** The published lineups: the first 40, the ATK order, the level rule and what each leaves out. */
  lineups: ViewCopy;
  /** The cookies kept out of the first 40, with the reason and where it stands. */
  exclusions: ViewCopy;
  /** How many of the highest-power cookies deploy at once. */
  firstWave: number;
}

/**
 * The stage-pushing screens: each one's heading, lede and mechanics topic,
 * and the damage shares the bracket calculator reports a reach for.
 */
export interface StageConfig {
  /** The bracket calculator: team power in, bracket per chapter out. */
  brackets: ViewCopy;
  /** The zone layouts and what to bring per boss slot. */
  zones: ZonesConfig;
  /** The documented clears and failures. */
  clears: ViewCopy;
  /** The Dimensional Rift page. */
  rift: RiftConfig;
  /** The Rift clears at one bracket, with the attempts that bound it. */
  riftClears: RiftClearsConfig;
  /** Kept-damage percentages, highest first, whose furthest stage the calculator names. */
  reach: readonly number[];
}

/** The zone board: its copy, and the first chapter whose boss slots the zone layouts fix. */
export interface ZonesConfig extends ViewCopy {
  /** The first chapter from which every chapter of a zone has its layout's boss slots. */
  fixedFrom: number;
}

/**
 * The Dimensional Rift page: its copy (the `topic` names the Rift's rules
 * and caveats), the decks it shows, and the words that mark the record's
 * other findings as being about the Rift.
 */
export interface RiftConfig extends ViewCopy {
  /** The ids of the decks played in the Rift. */
  decks: readonly string[];
  /**
   * A finding whose text mentions any of these is about the Rift, for the
   * record's rows that carry no topic (see `RiftFindings`); a mechanic is
   * about the Rift when it is filed under the Rift's topic.
   */
  mentions: readonly string[];
}

/**
 * The Rift clears page: its copy, the kept-damage bracket whose clears it
 * ranks, and the brackets whose entry power each clear's level shows.
 */
export interface RiftClearsConfig extends ViewCopy {
  /** The kept-damage % whose clears the page ranks; every other attempt bounds it. */
  bracket: number;
  /** Kept-damage percentages whose entry power each level shows, lowest first. */
  lines: readonly number[];
}

/** A section shared by every mode. */
export interface SharedSection extends SectionBase {
  kind: "shared";
}

/** A top-level section: a game mode or a shared page. */
export type Section = ModeSection | SharedSection;
