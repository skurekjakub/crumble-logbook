CREATE TABLE `gear_builds` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`mode` text DEFAULT 'guild_conquest' NOT NULL,
	`variant` text,
	`deck_id` text,
	`position` integer NOT NULL,
	`confidence` text NOT NULL,
	`haste_lines` text NOT NULL,
	`accuracy` integer,
	`focus` integer,
	`slots` text NOT NULL,
	`avoid` text NOT NULL,
	`why` text NOT NULL,
	`record_slug` text,
	`obsolete_since` text,
	`obsolete_reason` text,
	CONSTRAINT `fk_gear_builds_deck_id_decks_id_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON DELETE SET NULL
);
