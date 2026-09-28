CREATE TABLE `growth_curves` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`power_source` text NOT NULL,
	`title` text NOT NULL,
	`columns` text NOT NULL,
	`rows` text NOT NULL,
	`row_sources` text,
	`note` text,
	`evidence` text,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `packages` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`name_kr` text NOT NULL,
	`name_en` text NOT NULL,
	`price_krw` integer NOT NULL,
	`price_usd` real,
	`usd_tier` real,
	`usd_source` text NOT NULL,
	`kind` text NOT NULL,
	`feeds` text NOT NULL,
	`crystal_value_pct` real,
	`crystal_value_basis` text,
	`contents` text,
	`verdict` text NOT NULL,
	`tier` text NOT NULL,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `planner_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`position` integer NOT NULL,
	`power_source` text NOT NULL,
	`data_point` text,
	`basis` text NOT NULL,
	`gain` text NOT NULL,
	`reach` text NOT NULL,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `power_data_points` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`kind` text NOT NULL,
	`power_source` text NOT NULL,
	`date` text NOT NULL,
	`before_g` real,
	`after_g` real,
	`delta_pct` real,
	`cost` text,
	`note` text NOT NULL,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `power_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`name_en` text NOT NULL,
	`name_kr` text NOT NULL,
	`raises` text NOT NULL,
	`applies_in` text NOT NULL,
	`materials` text NOT NULL,
	`cost_type` text NOT NULL,
	`cost_per_roll` text,
	`cap` text NOT NULL,
	`diminishing` text,
	`posted_gains` text NOT NULL,
	`efficiency` text NOT NULL,
	`bracket_effect` text NOT NULL,
	`spend_order` text,
	`patch_notes` text,
	`confidence` text NOT NULL,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `price_tiers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`krw` integer NOT NULL,
	`usd` real NOT NULL,
	`paired_by` text NOT NULL,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `spending_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`kind` text NOT NULL,
	`label` text NOT NULL,
	`note` text,
	`position` integer NOT NULL,
	`record_slug` text
);
--> statement-breakpoint
CREATE TABLE `spending_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`order_slug` text NOT NULL,
	`route` text NOT NULL,
	`position` integer NOT NULL,
	`step` text,
	`power_source` text,
	`package_slug` text,
	`basis` text NOT NULL,
	`basis_note` text,
	`why` text,
	`record_slug` text
);
