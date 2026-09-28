CREATE TABLE `power_brackets` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`min_ratio_pct` integer NOT NULL,
	`damage_pct` integer NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rift_bosses` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`level` integer NOT NULL,
	`boss_kr` text NOT NULL,
	`boss_en` text,
	`note` text,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `rift_levels` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`level` integer NOT NULL,
	`recommended_power` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rift_seasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`season` integer NOT NULL,
	`first_level` integer NOT NULL,
	`last_level` integer NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stage_chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`chapter` integer NOT NULL,
	`zone_index` integer NOT NULL,
	`zone` text NOT NULL,
	`last_stage` text NOT NULL,
	`boss_kr` text NOT NULL,
	`boss_en` text,
	`recommended_power` integer NOT NULL,
	`accuracy_req` real NOT NULL,
	`focus_req` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stage_clears` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`chapter` integer NOT NULL,
	`stage_no` integer NOT NULL,
	`boss_kr` text NOT NULL,
	`era` text NOT NULL,
	`team_power` text NOT NULL,
	`power_g` real,
	`recommended_power` integer,
	`bracket` integer NOT NULL,
	`result` text NOT NULL,
	`play` text,
	`evidence` text NOT NULL,
	`deck_id` text,
	`note` text,
	`record_slug` text,
	CONSTRAINT `fk_stage_clears_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `stage_zone_slots` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`zone_index` integer NOT NULL,
	`zone_kr` text NOT NULL,
	`zone_en` text NOT NULL,
	`position` integer NOT NULL,
	`stage` text NOT NULL,
	`boss_kr` text NOT NULL,
	`boss_en` text,
	`plan` text NOT NULL,
	`deck_id` text,
	`bracket_note` text,
	`record_slug` text,
	CONSTRAINT `fk_stage_zone_slots_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `power_brackets_min_ratio_pct_uq` ON `power_brackets` (`min_ratio_pct`);--> statement-breakpoint
CREATE UNIQUE INDEX `rift_levels_level_uq` ON `rift_levels` (`level`);--> statement-breakpoint
CREATE UNIQUE INDEX `rift_seasons_season_uq` ON `rift_seasons` (`season`);--> statement-breakpoint
CREATE UNIQUE INDEX `stage_chapters_chapter_uq` ON `stage_chapters` (`chapter`);