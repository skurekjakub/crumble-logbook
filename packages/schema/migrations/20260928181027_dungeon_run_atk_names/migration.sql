ALTER TABLE `dungeon_runs` ADD `atk_order_note` text;
--> statement-breakpoint
-- `atk_order` now holds a JSON list of Korean names; an earlier row's prose isn't JSON and would fail to read. A re-import fills it again.
UPDATE `dungeon_runs` SET `atk_order` = NULL WHERE `atk_order` IS NOT NULL AND json_valid(`atk_order`) = 0;
