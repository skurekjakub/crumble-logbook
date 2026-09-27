import type { GearSlot, SourceSite } from "@crumble/schema";
import { GEAR_SLOT, SOURCE_SITE, scores } from "@crumble/schema";
import type { InferInsertModel } from "drizzle-orm";
import type { DeckCookieInsert, DeckInsert, DeckNoteInsert } from "../../repos/decks";
import type { GlossaryInsert } from "../../repos/glossary";
import type { RecordInsert } from "../../repos/records";
import type { SourceInsert } from "../../repos/sources";
import type { ManifestRecord } from "../manifest";
import type { SeedDeck, SeedGlossaryEntry, SeedMeta, SeedScore, SeedSource } from "./schema";

/** Insert payload for `scores`, as {@link mapScore} produces it. */
export type ScoreInsert = Omit<InferInsertModel<typeof scores>, "id">;

/** A curated deck split into its row and its ordered children. */
export interface MappedDeck {
  deck: DeckInsert;
  cookies: DeckCookieInsert[];
  pets: string[];
  notes: DeckNoteInsert[];
}

/** The research record row and the cited "for your account" recommendation a `meta.json` yields. */
export interface MappedMeta {
  record: RecordInsert;
  recommendation: { summary: string; changes: string[]; sources: string[] };
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
 *   fields become `null`), its cookie slots, its pets, and its notes:
 *   `substitutions` as `substitution` notes followed by `unorthodox` as
 *   `unorthodox` notes
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
    },
    cookies: d.cookies.map((c) => ({
      cookieKr: c.kr,
      level: c.level ?? null,
      levelRule: c.level_rule ?? null,
      stars: c.stars ?? null,
      why: c.why,
    })),
    pets: d.pets ?? [],
    notes: [
      ...(d.substitutions ?? []).map((text) => ({ kind: "substitution" as const, text })),
      ...(d.unorthodox ?? []).map((text) => ({ kind: "unorthodox" as const, text })),
    ],
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
 * Maps a curated `meta.json` and the manifest's record block onto the
 * research record row and the recommendation.
 *
 * @param meta - the curated meta
 * @param record - the manifest's `record` block (slug, question, status,
 *   start date)
 * @returns the record row (`updated` becomes `updatedAt`, `season` becomes
 *   `seasonLabel`, plus `lede` and `caveat`) and `you` as the
 *   recommendation with its sources
 */
export function mapMeta(meta: SeedMeta, record: ManifestRecord): MappedMeta {
  return {
    record: {
      ...record,
      updatedAt: meta.updated,
      seasonLabel: meta.season,
      lede: meta.lede ?? null,
      caveat: meta.caveat ?? null,
    },
    recommendation: {
      summary: meta.you.summary,
      changes: meta.you.changes,
      sources: meta.you.sources,
    },
  };
}
