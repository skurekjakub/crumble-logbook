CREATE TABLE `rift_unlocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`stage` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rift_unlocks_stage_uq` ON `rift_unlocks` (`stage`);