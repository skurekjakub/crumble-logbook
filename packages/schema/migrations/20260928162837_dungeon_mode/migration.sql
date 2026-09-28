CREATE TABLE `dungeon_exclusions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`cookie_kr` text NOT NULL,
	`kind` text NOT NULL,
	`why` text NOT NULL,
	`status` text NOT NULL,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `dungeon_lineups` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`author` text NOT NULL,
	`date` text NOT NULL,
	`deck_id` text,
	`complete` integer NOT NULL,
	`first40` text NOT NULL,
	`excluded` text NOT NULL,
	`atk_order` text NOT NULL,
	`level_rule` text NOT NULL,
	`record_slug` text,
	CONSTRAINT `fk_dungeon_lineups_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `dungeon_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`date` text NOT NULL,
	`player` text,
	`server` text,
	`score_g` real NOT NULL,
	`total_power_g` real,
	`board` text NOT NULL,
	`server_rank` integer,
	`time_left_s` real,
	`cookies_left` integer,
	`evidence` text NOT NULL,
	`standing` text NOT NULL,
	`deck_id` text,
	`atk_order` text,
	`perks` text,
	`preset` text,
	`note` text,
	`record_slug` text,
	CONSTRAINT `fk_dungeon_runs_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE SET NULL
);
