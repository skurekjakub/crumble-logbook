CREATE TABLE `formula_claims` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`position` integer NOT NULL,
	`claim` text NOT NULL,
	`code` text NOT NULL,
	`verdict` text NOT NULL,
	`ref_record` text,
	`ref_title` text,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `formula_constants` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`position` integer NOT NULL,
	`step` text NOT NULL,
	`symbol` text NOT NULL,
	`field` text NOT NULL,
	`holder` text NOT NULL,
	`label_kr` text,
	`meaning` text NOT NULL,
	`value` real,
	`candidate` text,
	`measure` text NOT NULL,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `formula_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`position` integer NOT NULL,
	`phase` text NOT NULL,
	`name` text NOT NULL,
	`expression` text NOT NULL,
	`feeds` text NOT NULL,
	`stacking` text,
	`applies_to` text,
	`confidence` text NOT NULL,
	`why` text NOT NULL,
	`detail` text,
	`code_ref` text,
	`record_slug` text
);
