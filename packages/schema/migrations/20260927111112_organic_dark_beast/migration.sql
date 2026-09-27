CREATE TABLE `sources` (
	`id` text PRIMARY KEY,
	`site` text NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`title_en` text,
	`date` text,
	`relevance` integer,
	`note` text,
	`summary_en` text,
	`capture_path` text
);
--> statement-breakpoint
CREATE TABLE `research_records` (
	`slug` text PRIMARY KEY,
	`question` text NOT NULL,
	`status` text NOT NULL,
	`started_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`season_label` text,
	`lede` text,
	`caveat` text
);
--> statement-breakpoint
CREATE TABLE `glossary` (
	`kr` text PRIMARY KEY,
	`shorthand` text NOT NULL,
	`en` text,
	`kind` text NOT NULL,
	`element` text,
	`class` text,
	`rarity` text,
	`extra` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deck_cookies` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`deck_id` text NOT NULL,
	`position` integer NOT NULL,
	`cookie_kr` text NOT NULL,
	`level` text,
	`level_rule` text,
	`stars` text,
	`why` text NOT NULL,
	CONSTRAINT `fk_deck_cookies_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE CASCADE,
	CONSTRAINT "deck_cookies_level_or_rule" CHECK("level" is not null or "level_rule" is not null)
);
--> statement-breakpoint
CREATE TABLE `deck_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`deck_id` text NOT NULL,
	`position` integer NOT NULL,
	`kind` text NOT NULL,
	`text` text NOT NULL,
	CONSTRAINT `fk_deck_notes_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `deck_pets` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`deck_id` text NOT NULL,
	`position` integer NOT NULL,
	`pet_kr` text NOT NULL,
	CONSTRAINT `fk_deck_pets_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `decks` (
	`id` text PRIMARY KEY,
	`position` integer NOT NULL,
	`name_en` text NOT NULL,
	`name_kr` text,
	`status` text NOT NULL,
	`ceiling_text` text,
	`summary` text,
	`formation` text,
	`perks` text,
	`rng` text,
	`atk_order` text,
	`atk_order_note` text
);
--> statement-breakpoint
CREATE TABLE `rune_build_decks` (
	`rune_build_id` integer NOT NULL,
	`deck_id` text NOT NULL,
	CONSTRAINT `rune_build_decks_pk` PRIMARY KEY(`rune_build_id`, `deck_id`),
	CONSTRAINT `fk_rune_build_decks_rune_build_id_rune_builds_id_fk` FOREIGN KEY (`rune_build_id`) REFERENCES `rune_builds`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_rune_build_decks_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `rune_builds` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`cookie_kr` text NOT NULL,
	`lines` text NOT NULL,
	`why` text NOT NULL,
	`disputed` text
);
--> statement-breakpoint
CREATE TABLE `gear_recs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slot` text NOT NULL,
	`substats` text NOT NULL,
	`context` text NOT NULL,
	`why` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`damage_g` real NOT NULL,
	`power_g` real,
	`deck_id` text,
	`verified` integer DEFAULT false NOT NULL,
	`date` text,
	`season` integer,
	`player` text,
	`note` text,
	CONSTRAINT `fk_scores_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `rankings` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`season` integer,
	`board` text NOT NULL,
	`rank` integer NOT NULL,
	`name` text NOT NULL,
	`guild` text,
	`value_g` real NOT NULL,
	`power_g` real,
	`ref` text,
	`captured_at` text NOT NULL,
	`source_id` text NOT NULL,
	CONSTRAINT `fk_rankings_source_id_sources_id_fk` FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`)
);
--> statement-breakpoint
CREATE TABLE `mechanics` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`confidence` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rng_factors` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`factor` text NOT NULL,
	`effect` text NOT NULL,
	`mitigation` text
);
--> statement-breakpoint
CREATE TABLE `takeaways` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`position` integer NOT NULL,
	`text` text NOT NULL,
	`detail` text
);
--> statement-breakpoint
CREATE TABLE `timeline` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`date` text NOT NULL,
	`event` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`summary` text NOT NULL,
	`changes` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `citations` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`source_id` text NOT NULL,
	CONSTRAINT `fk_citations_source_id_sources_id_fk` FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`kind` text NOT NULL,
	`params` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`log` text NOT NULL,
	`error` text,
	`created_at` text NOT NULL,
	`started_at` text,
	`finished_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rankings_board_season_rank_captured_at_uq` ON `rankings` (`board`,`season`,`rank`,`captured_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `citations_entity_entity_id_source_id_uq` ON `citations` (`entity`,`entity_id`,`source_id`);--> statement-breakpoint
CREATE INDEX `citations_entity_entity_id_idx` ON `citations` (`entity`,`entity_id`);