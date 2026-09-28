import { text } from "drizzle-orm/sqlite-core";
import { GAME_MODE } from "../enums";

/**
 * Builds a `mode` column: the game mode a row is about.
 *
 * @returns a NOT NULL `GAME_MODE` column defaulting to `guild_conquest`
 */
export function modeColumn() {
  return text("mode", { enum: GAME_MODE }).notNull().default("guild_conquest");
}

/**
 * Builds a `record_slug` column: the research record whose import wrote the
 * row, which a record's re-import (`--replace`) clears and rewrites.
 *
 * @returns a nullable text column; `null` marks a row no import owns, such
 *   as one written through the API
 */
export function recordSlugColumn() {
  return text("record_slug");
}
