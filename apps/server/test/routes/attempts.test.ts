import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Attempts } from "@crumble/schema";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createAttemptsRepo, parseIni } from "../../src/repos/attempts";
import { createServices } from "../../src/services";
import { readJson, testStore } from "../helpers";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "crumble-attempts-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

/**
 * Writes a file into the macro folder.
 *
 * @param name - the file's name
 * @param lines - its lines
 */
function write(name: string, lines: readonly string[]): void {
  writeFileSync(join(dir, name), lines.join("\n") + "\n");
}

/**
 * Asks the app for the attempts in the macro folder.
 *
 * @param macro - the folder, or null for none
 * @returns the response body
 */
async function getAttempts(macro: string | null = dir): Promise<Attempts> {
  const app = createApp(createServices(testStore(), createAttemptsRepo(macro)));
  return readJson<Attempts>(await app.request("/api/attempts"));
}

describe("GET /api/attempts", () => {
  it("joins each run to its curve, most seconds left first, with the INI's pace rule", async () => {
    write("conquest-loop.ini", [
      "[Prune]",
      "; 2T less 2.5%",
      "MinScore=1950000000000",
      "CheckAtS=30",
    ]);
    write("conquest-runs.csv", [
      "time,run,end,pace_score,final_score",
      "2026-10-11 09:00:00,1,pruned,1661000000000,1902000000000",
      "2026-10-11 09:00:42,2,kept-on-pace,2359000000000,",
    ]);
    write("conquest-curves.csv", [
      "time,t_left,score",
      "2026-10-11 09:00:00,29.700,1695000000000",
      "2026-10-11 09:00:00,30.233,1635000000000",
    ]);
    expect(await getAttempts()).toEqual({
      available: true,
      rule: { minScore: 1950000000000, checkAtS: 30 },
      attempts: [
        {
          time: "2026-10-11 09:00:00",
          run: 1,
          end: "pruned",
          paceScore: 1661000000000,
          finalScore: 1902000000000,
          curve: [
            [30.233, 1635000000000],
            [29.7, 1695000000000],
          ],
        },
        {
          time: "2026-10-11 09:00:42",
          run: 2,
          end: "kept-on-pace",
          paceScore: 2359000000000,
          finalScore: null,
          curve: [],
        },
      ],
    });
  });

  it("skips a row it can't read, such as one the macro is still writing", async () => {
    write("conquest-runs.csv", [
      "time,run,end,pace_score,final_score",
      "2026-10-11 09:00:00,1,pruned,1661000000000,",
      "2026-10-11 09:00:42,2,kept-on",
    ]);
    const body = await getAttempts();
    expect(body.attempts.map((a) => a.run)).toEqual([1]);
    expect(body.rule).toEqual({ minScore: null, checkAtS: null });
  });

  it("reads the files the INI names", async () => {
    write("conquest-loop.ini", ["[Run]", "RunsFile=runs.csv", "CurvesFile=curves.csv"]);
    write("runs.csv", ["time,run,end,pace_score,final_score", "2026-10-11 09:00:00,1,stopped,,"]);
    write("curves.csv", ["time,t_left,score", "2026-10-11 09:00:00,55.100,1000"]);
    const [attempt] = (await getAttempts()).attempts;
    expect(attempt?.curve).toEqual([[55.1, 1000]]);
  });

  it("answers no attempts where the macro hasn't run", async () => {
    const none = { available: false, rule: { minScore: null, checkAtS: null }, attempts: [] };
    expect(await getAttempts()).toEqual(none);
    expect(await getAttempts(null)).toEqual(none);
  });
});

describe("parseIni", () => {
  it("reads keys by section, skipping comments and blank lines", () => {
    const ini = parseIni("[A]\r\n; note\r\nx = 1\r\n\r\n[B]\r\ny=two words\r\n");
    expect(ini.get("A")?.get("x")).toBe("1");
    expect(ini.get("B")?.get("y")).toBe("two words");
  });
});
