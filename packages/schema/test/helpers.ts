import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/node-sqlite";
import { migrate } from "drizzle-orm/node-sqlite/migrator";
import { migrationsFolder } from "../src/migrations-path";

/**
 * Opens a fresh in-memory SQLite database with every migration applied.
 * Intended for a single test: each call gets its own isolated database.
 *
 * @returns a drizzle db bound to a `node:sqlite` `:memory:` connection
 * @throws if a migration file is missing or fails to apply
 */
export function createTestDb() {
  const db = drizzle({ client: new DatabaseSync(":memory:") });
  migrate(db, { migrationsFolder });
  return db;
}
