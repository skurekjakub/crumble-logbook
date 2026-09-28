CREATE TABLE `fact_claims` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`record_slug` text NOT NULL,
	`source_id` text NOT NULL,
	CONSTRAINT `fk_fact_claims_source_id_sources_id_fk` FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fact_claims_entity_entity_id_record_slug_source_id_uq` ON `fact_claims` (`entity`,`entity_id`,`record_slug`,`source_id`);--> statement-breakpoint
CREATE INDEX `fact_claims_entity_entity_id_idx` ON `fact_claims` (`entity`,`entity_id`);