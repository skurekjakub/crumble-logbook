ALTER TABLE `decks` ADD `obsolete_since` text;--> statement-breakpoint
ALTER TABLE `decks` ADD `obsolete_reason` text;--> statement-breakpoint
ALTER TABLE `decks` ADD `superseded_by` text;--> statement-breakpoint
ALTER TABLE `rune_builds` ADD `obsolete_since` text;--> statement-breakpoint
ALTER TABLE `rune_builds` ADD `obsolete_reason` text;--> statement-breakpoint
ALTER TABLE `gear_recs` ADD `obsolete_since` text;--> statement-breakpoint
ALTER TABLE `gear_recs` ADD `obsolete_reason` text;--> statement-breakpoint
ALTER TABLE `counters` ADD `obsolete_since` text;--> statement-breakpoint
ALTER TABLE `counters` ADD `obsolete_reason` text;