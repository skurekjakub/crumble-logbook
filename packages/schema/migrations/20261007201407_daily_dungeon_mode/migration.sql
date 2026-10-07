CREATE TABLE `daily_dungeon_clears` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`dungeon` text NOT NULL,
	`stage` integer NOT NULL,
	`power` text,
	`power_g` real,
	`deck_id` text,
	`auto` text,
	`date` text NOT NULL,
	`player` text,
	`evidence` text NOT NULL,
	`note` text,
	`record_slug` text,
	CONSTRAINT `fk_daily_dungeon_clears_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `daily_dungeons` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`position` integer NOT NULL,
	`name_en` text NOT NULL,
	`name_kr` text,
	`drops` text NOT NULL,
	`entry_keys` text,
	`ticket_back_on_loss` integer,
	`quick_clear` integer,
	`entry_note` text,
	`boss_kr` text,
	`boss_en` text,
	`boss_element` text,
	`boss_weakness` text,
	`boss_rotates` integer,
	`boss_rotation` text,
	`top_stage` integer,
	`top_stage_date` text,
	`top_stage_source` text,
	`notes` text NOT NULL,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `deck_daily_dungeons` (
	`deck_id` text PRIMARY KEY,
	`dungeon` text NOT NULL,
	`auto` text NOT NULL,
	`stage` integer,
	`power` text,
	`power_g` real,
	`recommended_power` text,
	`recommended_power_g` real,
	`gear_preset` text,
	`captain_kr` text,
	CONSTRAINT `fk_deck_daily_dungeons_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE CASCADE
);
