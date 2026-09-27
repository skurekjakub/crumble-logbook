import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import type { BuffValueView } from "../../src/services/buff-values";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/** A fresh app with a glossary entry for Tea Knight and a source to cite. */
function setup() {
  const store = testStore();
  addSource(store, "web:sugarpocket-bundle-1.4.002");
  const services = createServices(store);
  services.glossary.upsert({
    kr: "실론나이트 쿠키",
    shorthand: ["실론"],
    en: "Tea Knight Cookie",
    kind: "cookie",
  });
  return { app: createApp(services), store };
}

/** A buff value POST body for `cookieKr` at `skillGrade`. */
function buff(cookieKr: string, skillGrade: number) {
  return {
    cookieKr,
    effectType: "BossDamageRateAddition",
    skillGrade,
    fromStar: skillGrade,
    valuePct: 45 + skillGrade * 2.5,
    maxStack: 1,
    base: "Fixed",
    scalesWithCasterAmp: true,
    sources: ["web:sugarpocket-bundle-1.4.002"],
  };
}

describe("buff-values routes", () => {
  it("GET /api/buff-values?cookie= filters by the stored name, a shorthand or the English name", async () => {
    const { app } = setup();
    for (const body of [
      buff("실론나이트 쿠키", 9),
      buff("실론나이트 쿠키", 0),
      buff("석류맛 쿠키", 0),
    ]) {
      expect((await app.request("/api/buff-values", jsonBody(body))).status).toBe(201);
    }

    for (const name of ["실론나이트 쿠키", "실론", "tea knight cookie"]) {
      const res = await app.request(`/api/buff-values?cookie=${encodeURIComponent(name)}`);
      expect(res.status).toBe(200);
      const rows = await readJson<BuffValueView[]>(res);
      expect(rows.map((r) => r.skillGrade)).toEqual([0, 9]);
    }
  });

  it("GET /api/buff-values resolves each cookie's English name, null when unresolved", async () => {
    const { app } = setup();
    await app.request("/api/buff-values", jsonBody(buff("실론나이트 쿠키", 9)));
    await app.request("/api/buff-values", jsonBody(buff("석류맛 쿠키", 0)));
    const rows = await readJson<BuffValueView[]>(await app.request("/api/buff-values"));
    expect(rows.map((r) => [r.cookieKr, r.en])).toEqual([
      ["석류맛 쿠키", null],
      ["실론나이트 쿠키", "Tea Knight Cookie"],
    ]);
    expect(rows[1]!.sources).toEqual(["web:sugarpocket-bundle-1.4.002"]);
  });

  it("POST with an unknown base is a 400", async () => {
    const { app } = setup();
    const res = await app.request(
      "/api/buff-values",
      jsonBody({ ...buff("실론나이트 쿠키", 9), base: "CastersDefense" }),
    );
    expect(res.status).toBe(400);
  });
});
