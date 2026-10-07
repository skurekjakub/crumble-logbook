import type {
  Confidence,
  CounterInput,
  GameMode,
  GearSlot,
  SourceSite,
  UsageStatInput,
  Values,
} from "@crumble/schema";
import { GAME_MODE, GEAR_SLOT, SOURCE_SITE, scores, withRunPowers } from "@crumble/schema";
import type { InferInsertModel } from "drizzle-orm";
import { ImportError } from "../../errors";
import type {
  DeckCookieInsert,
  DeckDailyRunInsert,
  DeckInsert,
  DeckNoteInsert,
} from "../../repos/decks";
import type { GlossaryInsert } from "../../repos/glossary";
import type { RecordInsert, RecordModeInsert } from "../../repos/records";
import type { SourceInsert } from "../../repos/sources";
import type { ManifestRecord } from "../manifest";
import type {
  SeedCounter,
  SeedDeck,
  SeedGlossaryEntry,
  SeedMeta,
  SeedScore,
  SeedSource,
  SeedUsage,
} from "./schema";

/** Insert payload for `scores`, as {@link mapScore} produces it. */
export type ScoreInsert = Omit<InferInsertModel<typeof scores>, "id">;

/** A curated deck split into its row and its children. */
export interface MappedDeck {
  deck: DeckInsert;
  cookies: DeckCookieInsert[];
  pets: string[];
  notes: DeckNoteInsert[];
  /** A daily dungeon deck's run facts; `null` for a deck that names none. */
  run: DeckDailyRunInsert | null;
}

/** A mechanic writeup ready to insert, with its sources. */
export interface MappedMechanic {
  values: {
    title: string;
    body: string;
    confidence: Confidence;
    mode: GameMode;
    topic: string | null;
    alsoTopics: string[];
  };
  sources: string[];
}

/**
 * What a `meta.json` yields: the research record row, the modes it covers,
 * the cited "for your account" recommendation, and each mode's rules as
 * mechanics.
 */
export interface MappedMeta {
  record: RecordInsert;
  modes: RecordModeInsert[];
  recommendation: { summary: string; changes: string[]; sources: string[] };
  rules: MappedMechanic[];
}

const RELEVANCE = /^relevance (\d)\/3$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Maps a curated source onto a `sources` row. `summaryEn` and `capturePath`
 * are left for the importer to fill.
 *
 * @param id - the `<site>:<key>` source id
 * @param s - the curated entry
 * @returns the row: `site` from the id prefix; `date` only if it's
 *   `YYYY-MM-DD`, else `null` (e.g. `"?"`); a `"relevance N/3"` signal
 *   becomes `relevance: N`, any other signal becomes `note`; empty titles
 *   become `null`
 * @throws `Error` if `id` has no `dc:`/`nv:`/`web:` prefix
 */
export function mapSource(id: string, s: SeedSource): SourceInsert {
  const site = id.slice(0, id.indexOf(":"));
  if (!(SOURCE_SITE as readonly string[]).includes(site)) {
    throw new Error(`source id "${id}" has no dc:/nv:/web: prefix`);
  }
  const relevance = s.signal ? RELEVANCE.exec(s.signal) : null;
  return {
    id,
    site: site as SourceSite,
    url: s.url,
    title: s.title || null,
    titleEn: s.title_en || null,
    date: s.date && ISO_DATE.test(s.date) ? s.date : null,
    relevance: relevance ? Number(relevance[1]) : null,
    note: s.signal && !relevance ? s.signal : null,
  };
}

/**
 * Maps a curated glossary entry onto a `glossary` row.
 *
 * @param e - the curated entry
 * @returns the row: `kr_short` becomes `shorthand`; an empty `element`,
 *   `class` or `rarity` becomes `null`; `en` is kept as is (possibly
 *   `null`); every field without a column goes into `extra`
 */
export function mapGlossary(e: SeedGlossaryEntry): GlossaryInsert {
  const { kr, kr_short, en, kind, element, class: cls, rarity, ...extra } = e;
  return {
    kr,
    shorthand: kr_short,
    en,
    kind,
    element: element || null,
    class: cls || null,
    rarity: rarity || null,
    extra,
  };
}

/**
 * Maps a curated deck onto its `decks` row and ordered children.
 *
 * @param d - the curated deck
 * @param position - the deck's display position (its index in the file)
 * @returns the deck row (`ceiling` becomes `ceilingText`; absent optional
 *   fields become `null`), its cookie slots (with their formation `slot`,
 *   or `null`), its pets, its notes (`substitutions` as `substitution`
 *   notes followed by `unorthodox` as `unorthodox` notes), and its run
 *   facts when it names a `dungeon` and `auto` (the powers in billions read
 *   from the posted `power` and `recommended_power`; `captain` becomes
 *   `captainKr`), else `null`
 */
export function mapDeck(d: SeedDeck, position: number): MappedDeck {
  return {
    deck: {
      id: d.id,
      position,
      nameEn: d.name_en,
      nameKr: d.name_kr ?? null,
      status: d.status,
      ceilingText: d.ceiling ?? null,
      summary: d.summary ?? null,
      formation: d.formation ?? null,
      perks: d.perks ?? null,
      rng: d.rng ?? null,
      atkOrder: d.atk_order ?? null,
      atkOrderNote: d.atk_order_note ?? null,
      mode: d.mode,
    },
    cookies: d.cookies.map((c) => ({
      cookieKr: c.kr,
      level: c.level ?? null,
      levelRule: c.level_rule ?? null,
      stars: c.stars ?? null,
      why: c.why,
      slot: c.slot ?? null,
    })),
    pets: d.pets ?? [],
    notes: [
      ...(d.substitutions ?? []).map((text) => ({ kind: "substitution" as const, text })),
      ...(d.unorthodox ?? []).map((text) => ({ kind: "unorthodox" as const, text })),
    ],
    run:
      d.dungeon === undefined || d.auto === undefined
        ? null
        : withRunPowers({
            dungeon: d.dungeon,
            auto: d.auto,
            stage: d.stage ?? null,
            power: d.power ?? null,
            recommendedPower: d.recommended_power ?? null,
            gearPreset: d.gear_preset ?? null,
            captainKr: d.captain ?? null,
          }),
  };
}

/**
 * Maps a curated gear slot name onto the `GEAR_SLOT` enum.
 *
 * @param slot - a dashed slot name, e.g. `top-left`
 * @returns the enum value with dashes turned into underscores (`top_left`),
 *   or `general` for a name the enum doesn't have
 */
export function mapGearSlot(slot: string): GearSlot {
  const candidate = slot.replaceAll("-", "_");
  return (GEAR_SLOT as readonly string[]).includes(candidate) ? (candidate as GearSlot) : "general";
}

/**
 * Maps a curated score onto a `scores` row.
 *
 * @param s - the curated score
 * @returns the row: `deck` becomes `deckId`, `damage_g`/`power_g` become
 *   `damageG`/`powerG` (a `null` power stays `null`), absent optional
 *   fields become `null`
 */
export function mapScore(s: SeedScore): ScoreInsert {
  return {
    damageG: s.damage_g,
    powerG: s.power_g,
    deckId: s.deck,
    verified: s.verified,
    date: s.date ?? null,
    season: s.season ?? null,
    player: s.player ?? null,
    note: s.note ?? null,
  };
}

/**
 * Maps a curated counter onto a `counters` row.
 *
 * @param c - the curated counter
 * @returns the row: `id` becomes `slug`, `team`/`beaten_by` become
 *   `teamDeckId`/`beatenByDeckId`, absent `conditions` becomes `null`
 */
export function mapCounter(c: SeedCounter): Values<CounterInput> {
  return {
    slug: c.id,
    mode: c.mode,
    teamDeckId: c.team,
    beatenByDeckId: c.beaten_by,
    conditions: c.conditions ?? null,
    why: c.why,
    confidence: c.confidence,
  };
}

/**
 * Maps a curated usage figure onto a `usage_stats` row.
 *
 * @param u - the curated figure
 * @returns the row, snake_case fields camel-cased; absent `members`,
 *   `confirmed_pct` and `note` become `null`
 */
export function mapUsage(u: SeedUsage): Values<UsageStatInput> {
  return {
    mode: u.mode,
    kind: u.kind,
    subject: u.subject,
    members: u.members ?? null,
    usagePct: u.usage_pct,
    confirmedPct: u.confirmed_pct ?? null,
    sample: u.sample,
    capturedAt: u.captured_at,
    note: u.note ?? null,
  };
}

/**
 * Maps a curated `meta.json` and the manifest's record block onto the
 * research record row, its covered modes, the recommendation and the
 * modes' rules.
 *
 * @param meta - the curated meta
 * @param record - the manifest's `record` block (slug, question, status,
 *   start date, optional mode)
 * @returns the record row (`updated` becomes `updatedAt`, `season` becomes
 *   `seasonLabel`, plus `lede` and `caveat`; `mode` is the manifest's,
 *   else the first `GAME_MODE` that `modes` lists), one covered mode per
 *   `modes` block in `GAME_MODE` order, `you` as the recommendation with
 *   its sources, and every block's rules as mechanics of the block's mode
 *   with topic `rules` unless the rule names another
 * @throws {ImportError} naming `import.json`'s `record.mode` when the
 *   manifest states no mode and `meta` has no `modes` block to take one from
 */
export function mapMeta(meta: SeedMeta, record: ManifestRecord): MappedMeta {
  const blocks = GAME_MODE.flatMap((mode) => {
    const block = meta.modes?.[mode];
    return block ? [{ mode, block }] : [];
  });
  const mode = record.mode ?? blocks[0]?.mode;
  if (mode === undefined) {
    throw new ImportError(
      "import.json",
      "record.mode",
      "the record states no mode, and meta.json has no modes block to file it under",
    );
  }
  return {
    record: {
      ...record,
      mode,
      updatedAt: meta.updated,
      seasonLabel: meta.season,
      lede: meta.lede ?? null,
      caveat: meta.caveat ?? null,
    },
    modes: blocks.map(({ mode, block }) => ({
      mode,
      lede: block.lede ?? null,
      caveat: block.caveat ?? null,
    })),
    recommendation: {
      summary: meta.you.summary,
      changes: meta.you.changes,
      sources: meta.you.sources,
    },
    rules: blocks.flatMap(({ mode, block }) =>
      block.rules.map(({ sources, topic, also_topics: alsoTopics, title, body, confidence }) => ({
        values: {
          title,
          body,
          confidence,
          mode,
          topic: topic ?? "rules",
          alsoTopics: alsoTopics ?? [],
        },
        sources,
      })),
    ),
  };
}
