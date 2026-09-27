CREATE TABLE `record_modes` (
	`record_slug` text NOT NULL,
	`mode` text NOT NULL,
	`lede` text,
	`caveat` text,
	CONSTRAINT `record_modes_pk` PRIMARY KEY(`record_slug`, `mode`),
	CONSTRAINT `fk_record_modes_record_slug_research_records_slug_fk` FOREIGN KEY (`record_slug`) REFERENCES `research_records`(`slug`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `counters` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`mode` text DEFAULT 'guild_conquest' NOT NULL,
	`team_deck_id` text NOT NULL,
	`beaten_by_deck_id` text NOT NULL,
	`conditions` text,
	`why` text NOT NULL,
	`confidence` text NOT NULL,
	`record_slug` text,
	CONSTRAINT `fk_counters_team_deck_id_decks_id_fk` FOREIGN KEY (`team_deck_id`) REFERENCES `decks`(`id`),
	CONSTRAINT `fk_counters_beaten_by_deck_id_decks_id_fk` FOREIGN KEY (`beaten_by_deck_id`) REFERENCES `decks`(`id`)
);
--> statement-breakpoint
CREATE TABLE `usage_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`mode` text DEFAULT 'guild_conquest' NOT NULL,
	`kind` text NOT NULL,
	`subject` text NOT NULL,
	`members` text,
	`usage_pct` real NOT NULL,
	`confirmed_pct` real,
	`sample` text NOT NULL,
	`captured_at` text NOT NULL,
	`note` text,
	`record_slug` text
);
--> statement-breakpoint
ALTER TABLE `sources` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `research_records` ADD `mode` text DEFAULT 'guild_conquest' NOT NULL;--> statement-breakpoint
ALTER TABLE `glossary` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `deck_cookies` ADD `slot` text;--> statement-breakpoint
ALTER TABLE `decks` ADD `mode` text DEFAULT 'guild_conquest' NOT NULL;--> statement-breakpoint
ALTER TABLE `decks` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `rune_builds` ADD `mode` text DEFAULT 'guild_conquest' NOT NULL;--> statement-breakpoint
ALTER TABLE `rune_builds` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `gear_recs` ADD `mode` text DEFAULT 'guild_conquest' NOT NULL;--> statement-breakpoint
ALTER TABLE `gear_recs` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `scores` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `rankings` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `mechanics` ADD `mode` text DEFAULT 'guild_conquest' NOT NULL;--> statement-breakpoint
ALTER TABLE `mechanics` ADD `topic` text;--> statement-breakpoint
ALTER TABLE `mechanics` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `rng_factors` ADD `mode` text DEFAULT 'guild_conquest' NOT NULL;--> statement-breakpoint
ALTER TABLE `rng_factors` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `takeaways` ADD `mode` text DEFAULT 'guild_conquest' NOT NULL;--> statement-breakpoint
ALTER TABLE `takeaways` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `timeline` ADD `mode` text DEFAULT 'guild_conquest' NOT NULL;--> statement-breakpoint
ALTER TABLE `timeline` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `recommendations` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `buff_values` ADD `record_slug` text;--> statement-breakpoint
ALTER TABLE `fight_events` ADD `record_slug` text;