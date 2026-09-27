CREATE TABLE `buff_values` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`cookie_kr` text NOT NULL,
	`effect_type` text NOT NULL,
	`skill_grade` integer NOT NULL,
	`from_star` integer NOT NULL,
	`value_pct` real NOT NULL,
	`max_stack` integer,
	`base` text NOT NULL,
	`scales_with_caster_amp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fight_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`boss` text NOT NULL,
	`t_elapsed` real,
	`event` text NOT NULL,
	`detail` text NOT NULL,
	`confidence` text NOT NULL
);
