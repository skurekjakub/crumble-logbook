import type {
  GearRecInput,
  GearRecRow,
  MechanicInput,
  MechanicRow,
  RecommendationInput,
  RecommendationRow,
  RngFactorInput,
  RngFactorRow,
  TakeawayInput,
  TakeawayRow,
  TimelineEventInput,
  TimelineEventRow,
  Values,
} from "@crumble/schema";
import type { Store } from "../repos";
import type { ContentService } from "./content";
import { createContentService } from "./content";
import type { DeckService } from "./decks";
import { createDeckService } from "./decks";
import type { ExportService } from "./export";
import { createExportService } from "./export";
import type { GlossaryService } from "./glossary";
import { createGlossaryService } from "./glossary";
import type { RankingsService } from "./rankings";
import { createRankingsService } from "./rankings";
import type { RecordsService } from "./records";
import { createRecordsService } from "./records";
import type { RuneBuildService } from "./rune-builds";
import { createRuneBuildService } from "./rune-builds";
import type { ScoreService } from "./scores";
import { createScoreService } from "./scores";
import type { SourcesService } from "./sources";
import { createSourcesService } from "./sources";

/** Every content and score service the server exposes. Later tasks add keys. */
export interface Services {
  mechanics: ContentService<MechanicRow, Values<MechanicInput>>;
  rngFactors: ContentService<RngFactorRow, Values<RngFactorInput>>;
  timeline: ContentService<TimelineEventRow, Values<TimelineEventInput>>;
  takeaways: ContentService<TakeawayRow, Values<TakeawayInput>>;
  gearRecs: ContentService<GearRecRow, Values<GearRecInput>>;
  recommendations: ContentService<RecommendationRow, Values<RecommendationInput>>;
  scores: ScoreService;
  decks: DeckService;
  runeBuilds: RuneBuildService;
  sources: SourcesService;
  glossary: GlossaryService;
  rankings: RankingsService;
  records: RecordsService;
  export: ExportService;
}

/**
 * Builds every service over a shared {@link Store}.
 * @param store - the store services persist through
 * @returns the service set
 */
export function createServices(store: Store): Services {
  return {
    mechanics: createContentService<MechanicRow, Values<MechanicInput>>(store, {
      entity: "mechanic",
      table: (repos) => repos.mechanics,
    }),
    rngFactors: createContentService<RngFactorRow, Values<RngFactorInput>>(store, {
      entity: "rng_factor",
      table: (repos) => repos.rngFactors,
    }),
    timeline: createContentService<TimelineEventRow, Values<TimelineEventInput>>(store, {
      entity: "timeline_event",
      table: (repos) => repos.timeline,
    }),
    takeaways: createContentService<TakeawayRow, Values<TakeawayInput>>(store, {
      entity: "takeaway",
      table: (repos) => repos.takeaways,
    }),
    gearRecs: createContentService<GearRecRow, Values<GearRecInput>>(store, {
      entity: "gear_rec",
      table: (repos) => repos.gearRecs,
    }),
    recommendations: createContentService<RecommendationRow, Values<RecommendationInput>>(store, {
      entity: "recommendation",
      table: (repos) => repos.recommendations,
    }),
    scores: createScoreService(store),
    decks: createDeckService(store),
    runeBuilds: createRuneBuildService(store),
    sources: createSourcesService(store),
    glossary: createGlossaryService(store),
    rankings: createRankingsService(store),
    records: createRecordsService(store),
    export: createExportService(store),
  };
}
