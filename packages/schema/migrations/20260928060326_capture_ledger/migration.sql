CREATE TABLE `captures` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`record_slug` text NOT NULL,
	`path` text NOT NULL,
	`url` text,
	`captured_at` text NOT NULL,
	`approx` text,
	`tool` text NOT NULL,
	`sha256` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `captures_record_slug_path_uq` ON `captures` (`record_slug`,`path`);