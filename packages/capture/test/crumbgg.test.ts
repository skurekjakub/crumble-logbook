import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { crumbggCapture, ENDPOINTS } from "../src/crumbgg";
import { readLedger, verifyLedger } from "../src/ledger";
import { fakeFetch, fixture, testContext } from "./helpers";

describe("crumb.gg endpoints", () => {
  it("maps each endpoint to the URL and file name the record captures used", () => {
    const cases: Array<[string, string[], string, string]> = [
      [
        "live",
        ["rumble_arena"],
        "https://crumb.gg/pub/live?board=rumble_arena",
        "pub-live-rumble_arena.json",
      ],
      [
        "live-history",
        ["rumble_arena", "2000"],
        "https://crumb.gg/pub/live-history?board=rumble_arena&hours=2000",
        "pub-live-history-rumble_arena-2000h.json",
      ],
      ["leaderboard", [], "https://crumb.gg/pub/leaderboard", "pub-leaderboard.json"],
      ["stats", [], "https://crumb.gg/pub/stats", "pub-stats.json"],
      ["guilds", [], "https://crumb.gg/pub/guilds", "pub-guilds.json"],
      [
        "rankings",
        ["players"],
        "https://crumb.gg/pub/rankings?kind=players",
        "pub-rankings-players.json",
      ],
      ["data", ["meta"], "https://crumb.gg/data/meta.json", "data-meta.json"],
      ["api-meta", [], "https://api.crumb.gg/api/meta", "api-meta.json"],
      [
        "api-live",
        ["guild_conquest_players"],
        "https://api.crumb.gg/api/live?board=guild_conquest_players",
        "api-live-guild_conquest_players.json",
      ],
      [
        "api-rankings",
        ["guilds"],
        "https://api.crumb.gg/api/rankings?kind=guilds",
        "api-rankings-guilds.json",
      ],
      ["api-lookup-status", [], "https://api.crumb.gg/api/lookup/status", "api-lookup-status.json"],
      [
        "api-lookup-suggest",
        ["날씨의아이"],
        "https://api.crumb.gg/api/lookup/suggest?q=%EB%82%A0%EC%94%A8%EC%9D%98%EC%95%84%EC%9D%B4",
        "api-lookup-suggest-날씨의아이.json",
      ],
    ];
    for (const [command, args, url, file] of cases) {
      expect(ENDPOINTS[command]!.url(args), command).toBe(url);
      expect(ENDPOINTS[command]!.file(args), command).toBe(file);
    }
  });

  it("saves the body as received, with its ledger line", async () => {
    const { context } = testContext(
      fakeFetch([["https://crumb.gg/pub/stats", { body: fixture("crumbgg/pub-stats.json") }]]),
      "capture:crumbgg",
    );
    const path = await crumbggCapture(context, "evidence/15-crumbgg", "stats", []);
    expect(path).toBe("evidence/15-crumbgg/pub-stats.json");
    expect(readFileSync(join(context.recordDir, path), "utf-8")).toBe(
      fixture("crumbgg/pub-stats.json"),
    );
    expect(readLedger(context.recordDir)[0]!.line).toMatchObject({
      path,
      url: "https://crumb.gg/pub/stats",
      tool: "capture:crumbgg",
    });
    expect(verifyLedger(context.recordDir)).toEqual([]);
  });

  it("refuses an existing file, wrong arguments, and an endpoint that doesn't answer 200", async () => {
    const { context } = testContext(
      fakeFetch([
        [
          "https://api.crumb.gg/api/lookup/status",
          { body: fixture("crumbgg/api-lookup-status.json") },
        ],
      ]),
      "capture:crumbgg",
    );
    await crumbggCapture(context, "evidence/c", "api-lookup-status", []);
    await expect(crumbggCapture(context, "evidence/c", "api-lookup-status", [])).rejects.toThrow(
      /already exists/,
    );
    await expect(crumbggCapture(context, "evidence/c", "live", [])).rejects.toThrow(/takes: board/);
    await expect(crumbggCapture(context, "evidence/c", "nope", [])).rejects.toThrow(/unknown/);
    await expect(crumbggCapture(context, "evidence/c", "stats", [])).rejects.toThrow(
      /did not answer 200/,
    );
  });
});
