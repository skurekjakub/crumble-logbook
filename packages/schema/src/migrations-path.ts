import { fileURLToPath } from "node:url";

/**
 * Absolute filesystem path to the compiled `migrations` folder, for
 * `migrate(db, { migrationsFolder })` from `drizzle-orm/node-sqlite/migrator`.
 * Node-only: import it from `@crumble/schema/migrations`, not the package
 * root, since it resolves relative to this module's own `file:` URL.
 */
export const migrationsFolder = fileURLToPath(new URL("../migrations", import.meta.url));
