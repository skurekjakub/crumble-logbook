import { CITED_ENTITY } from "@crumble/schema";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { CONTENT_KEYS, REGISTRY, TABLE_KEYS, specOf } from "../src/registry";
import { createServices } from "../src/services";
import { testStore } from "./helpers";

/** The routes the app serves, as `METHOD /path`. */
function mountedRoutes(): Set<string> {
  const app = createApp(createServices(testStore()));
  return new Set(app.routes.map((route) => `${route.method} ${route.path}`));
}

describe("the content-type registry", () => {
  it("mounts every registered path, with the full CRUD verbs where the type declares request schemas", () => {
    const routes = mountedRoutes();
    for (const key of TABLE_KEYS) {
      const { path, api } = specOf(key);
      if (!path) continue;
      const base = `/api${path}`;
      expect(routes, `${key}: GET ${base}`).toContain(`GET ${base}`);
      if (!api) continue;
      for (const route of [
        `GET ${base}/:id`,
        `POST ${base}`,
        `PATCH ${base}/:id`,
        `DELETE ${base}/:id`,
      ]) {
        expect(routes, `${key}: ${route}`).toContain(route);
      }
    }
  });

  it("registers every cited entity exactly once, and only cited entities", () => {
    const entities = TABLE_KEYS.flatMap((key) => specOf(key).entity ?? []);
    expect([...entities].sort()).toEqual([...CITED_ENTITY].sort());
  });

  it("gives every content type a path, an entity and request schemas", () => {
    for (const key of CONTENT_KEYS) {
      const { path, entity, api } = specOf(key);
      expect(path, key).toBeDefined();
      expect(entity, key).toBeDefined();
      expect(api, key).toBeDefined();
    }
  });

  it("builds a repo and a service for every content type", () => {
    const store = testStore();
    const services = createServices(store);
    for (const key of CONTENT_KEYS) {
      expect(store.repos[key].count(), key).toBe(0);
      expect(services[key].list(), key).toEqual([]);
    }
  });

  it("lists tables in foreign-key-safe order: every referenced table comes first", () => {
    const position = new Map(TABLE_KEYS.map((key, index) => [REGISTRY[key].table, index] as const));
    for (const [index, key] of TABLE_KEYS.entries()) {
      for (const fk of getTableConfig(specOf(key).table).foreignKeys) {
        const referenced = position.get(fk.reference().foreignTable as never);
        expect(referenced, `${key} references a registered table`).toBeDefined();
        expect(referenced!, `${key} comes after the tables it references`).toBeLessThan(index);
      }
    }
  });
});
