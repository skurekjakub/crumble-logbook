CREATE TABLE `account_cookies` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`lineup_id` integer NOT NULL,
	`position` integer NOT NULL,
	`name` text NOT NULL,
	`resource_key` text,
	`level` text,
	`stars` text,
	`skill_level` text,
	`power` text,
	`promotion` text,
	`gear` text NOT NULL,
	`runes` text NOT NULL,
	`pet` text,
	`extra` text NOT NULL,
	CONSTRAINT `fk_account_cookies_lineup_id_account_lineups_id_fk` FOREIGN KEY (`lineup_id`) REFERENCES `account_lineups`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `account_lineups` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`snapshot_id` text NOT NULL,
	`position` integer NOT NULL,
	`lineup` text NOT NULL,
	`label` text,
	`game_mode` text,
	`power` text,
	`captain` text,
	`pets` text NOT NULL,
	`gear_preset` text,
	`deck` text,
	`note` text,
	`extra` text NOT NULL,
	CONSTRAINT `fk_account_lineups_snapshot_id_account_snapshots_id_fk` FOREIGN KEY (`snapshot_id`) REFERENCES `account_snapshots`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `account_roadmap_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`roadmap_id` text NOT NULL,
	`position` integer NOT NULL,
	`priority` text NOT NULL,
	`area` text,
	`action` text NOT NULL,
	`why` text,
	`payoff` text,
	`cost` text,
	`refs` text NOT NULL,
	`extra` text NOT NULL,
	CONSTRAINT `fk_account_roadmap_items_roadmap_id_account_roadmaps_id_fk` FOREIGN KEY (`roadmap_id`) REFERENCES `account_roadmaps`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `account_roadmaps` (
	`id` text PRIMARY KEY,
	`date` text NOT NULL,
	`file` text NOT NULL,
	`snapshot_id` text,
	`verdict` text,
	`parked` text NOT NULL,
	`extra` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `account_snapshots` (
	`id` text PRIMARY KEY,
	`date` text NOT NULL,
	`captured_at` text,
	`file` text NOT NULL,
	`profile` text NOT NULL,
	`pets` text NOT NULL,
	`resources` text NOT NULL,
	`unread` text NOT NULL,
	`extra` text NOT NULL
);
