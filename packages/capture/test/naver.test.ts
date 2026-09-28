import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readLedger, verifyLedger } from "../src/ledger";
import { listUrl, nvFetch, nvList, parseComments, renderRefused } from "../src/naver";
import type { SeenRequest } from "./helpers";
import { fakeFetch, fixture, testContext } from "./helpers";

const API = "https://apis.naver.com/cafe-web/cafe-articleapi";

/**
 * Builds the fake Naver API for one article: the article, its first
 * comment page, and an image whose content type follows the URL's
 * original file (`.PNG/` → PNG, else JPEG).
 *
 * @param aid - the article id with fixtures under `naver/`
 * @param seen - where to record requests
 * @returns the fetch
 */
function naverApi(aid: string, seen: SeenRequest[] = []) {
  return fakeFetch(
    [
      [`${API}/v2.1/cafes/31688486/articles/${aid}?`, { body: fixture(`naver/${aid}.json`) }],
      [
        `${API}/v2/cafes/31688486/articles/${aid}/comments/pages/1`,
        {
          body: fixture(`naver/${aid}-comments.json`),
        },
      ],
      [
        /pstatic\.net/,
        (url) => ({
          body: new TextEncoder().encode(url),
          headers: { "content-type": url.includes(".PNG/") ? "image/png" : "image/jpeg" },
        }),
      ],
    ],
    seen,
  );
}

describe("naver articles", () => {
  for (const [aid, capturedAt] of [
    ["23875", "2026-09-27T14:35:57Z"],
    ["41983", "2026-09-27T14:34:50Z"],
    ["46167", "2026-09-27T08:42:32Z"],
  ] as const) {
    it(`writes article ${aid} byte for byte as nv_scrape.py did`, async () => {
      const { context } = testContext(naverApi(aid), "capture:naver", new Date(capturedAt));
      await nvFetch(context, "evidence/nv", [aid]);
      const written = readFileSync(join(context.recordDir, `evidence/nv/nv-${aid}.md`), "utf-8");
      expect(written).toBe(fixture(`naver/nv-${aid}.md`));
    });
  }

  it("asks for each image at w1600 and logs it with the article", async () => {
    const seen: SeenRequest[] = [];
    const { context } = testContext(naverApi("41983", seen), "capture:naver");
    const written = await nvFetch(context, "evidence/nv", ["41983"]);
    expect(written).toEqual([
      "evidence/nv/img/nv-41983-1.jpg",
      "evidence/nv/img/nv-41983-2.png",
      "evidence/nv/nv-41983.md",
    ]);
    expect(
      seen.filter((r) => r.url.includes("pstatic")).every((r) => r.url.endsWith("?type=w1600")),
    ).toBe(true);
    const lines = readLedger(context.recordDir).map((e) => e.line);
    expect(lines.at(-1)).toMatchObject({
      url: "https://cafe.naver.com/ccrumble/41983",
      tool: "capture:naver",
    });
    expect(verifyLedger(context.recordDir)).toEqual([]);
  });

  it("writes a refused article with the API's answer, as json.dumps printed it", async () => {
    const refusal = { result: { errorCode: "0004", reason: "멤버 공개" } };
    const { context } = testContext(
      fakeFetch([[`${API}/v2.1/`, { body: JSON.stringify(refusal) }]]),
      "capture:naver",
    );
    await nvFetch(context, "evidence/nv", ["1"]);
    const written = readFileSync(join(context.recordDir, "evidence/nv/nv-1.md"), "utf-8");
    expect(written).toBe(
      '# 1\n\n- url: https://cafe.naver.com/ccrumble/1\n\n(refused: {"result": {"errorCode": "0004", "reason": "\\uba64\\ubc84 \\uacf5\\uac1c"}})\n',
    );
    expect(renderRefused("1", "u", { a: "x".repeat(500) })).toHaveLength(
      "# 1\n\n- url: u\n\n(refused: ".length + 400 + ")\n".length,
    );
  });

  it("marks replies by their parent comment id", () => {
    const comments = parseComments(JSON.parse(fixture("naver/41983-comments.json")));
    expect(comments.map((c) => c.reply)).toEqual([false, true, false, true, true]);
    expect(comments[1]).toEqual({ nick: "서신우", text: "", reply: true });
  });
});

describe("naver listing", () => {
  it("writes one TSV row per article, dated in local time, with its ledger line", async () => {
    const { context } = testContext(
      fakeFetch([
        [/search\.page=1&/, { body: fixture("naver/list-menu9.json") }],
        [/search\.page=2&/, { body: '{"message":{"result":{"articleList":[]}}}' }],
      ]),
      "capture:naver",
    );
    const count = await nvList(context, "evidence/nv/list.tsv", "9", 3);
    const lines = readFileSync(join(context.recordDir, "evidence/nv/list.tsv"), "utf-8")
      .trimEnd()
      .split("\n");
    expect(lines[0]).toBe("id\tdate\tlikes\tcomments\tviews\ttitle\tauthor");
    expect(lines).toHaveLength(count + 1);
    expect(count).toBe(50);
    for (const line of lines.slice(1)) {
      const cells = line.split("\t");
      expect(cells).toHaveLength(7);
      expect(cells[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(readLedger(context.recordDir)[0]!.line.url).toBe(listUrl("9"));
  });

  it("builds the listing URL nv_scrape.py requested", () => {
    expect(listUrl("9", 2)).toBe(
      "https://apis.naver.com/cafe-web/cafe2/ArticleListV2dot1.json?search.clubid=31688486&search.menuid=9&search.queryType=lastArticle&search.page=2&search.perPage=50",
    );
  });
});
