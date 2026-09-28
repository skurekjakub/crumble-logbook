import type { ContentKey } from "../registry";
import { CONTENT_KEYS } from "../registry";
import type { Store } from "../repos";
import type { CapturesService } from "./captures";
import { createCapturesService } from "./captures";
import type { RegisteredService } from "./content";
import { registeredService } from "./content";
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

/**
 * One content service per registered content type, built from its registry
 * entry. Scores replace theirs with {@link ScoreService}, which adds the
 * damage/power ratio.
 */
export type ContentServices = { [K in Exclude<ContentKey, "scores">]: RegisteredService<K> };

/** Every service the server exposes. */
export type Services = ContentServices & {
  scores: ScoreService;
  decks: DeckService;
  runeBuilds: RuneBuildService;
  sources: SourcesService;
  glossary: GlossaryService;
  rankings: RankingsService;
  records: RecordsService;
  captures: CapturesService;
  export: ExportService;
};

/**
 * Builds every service over a shared {@link Store}.
 *
 * @param store - the store services persist through
 * @returns the service set
 */
export function createServices(store: Store): Services {
  const content = Object.fromEntries(
    CONTENT_KEYS.map((key) => [key, registeredService(store, key)]),
  ) as ContentServices;
  return {
    ...content,
    scores: createScoreService(store),
    decks: createDeckService(store),
    runeBuilds: createRuneBuildService(store),
    sources: createSourcesService(store),
    glossary: createGlossaryService(store),
    rankings: createRankingsService(store),
    records: createRecordsService(store),
    captures: createCapturesService(store),
    export: createExportService(store),
  };
}
