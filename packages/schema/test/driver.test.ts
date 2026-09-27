import { DatabaseSync } from "node:sqlite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-sqlite";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { describe, expect, it } from "vitest";

const probe = sqliteTable("probe", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

function openProbeDb() {
  const db = drizzle({ client: new DatabaseSync(":memory:") });
  db.run(sql`create table probe (id integer primary key autoincrement, name text not null)`);
  return db;
}

describe("node:sqlite through drizzle", () => {
  it("returns inserted rows synchronously", () => {
    const db = openProbeDb();
    const row = db.insert(probe).values({ name: "milk" }).returning().get();
    expect(row).toEqual({ id: 1, name: "milk" });
  });

  it("rolls back a transaction whose callback throws", () => {
    const db = openProbeDb();
    expect(() =>
      db.transaction((tx) => {
        tx.insert(probe).values({ name: "lost" }).run();
        throw new Error("abort");
      }),
    ).toThrow("abort");
    expect(db.select().from(probe).all()).toEqual([]);
  });
});
