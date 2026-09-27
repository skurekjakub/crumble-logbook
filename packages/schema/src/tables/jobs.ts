import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { JOB_STATUS } from "../enums";

/** A background job's queued parameters, current status, and running log. */
export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull(),
  params: text("params", { mode: "json" }).$type<unknown>().notNull(),
  status: text("status", { enum: JOB_STATUS }).notNull().default("queued"),
  log: text("log", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  error: text("error"),
  createdAt: text("created_at").notNull(),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
});
