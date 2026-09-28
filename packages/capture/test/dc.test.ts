import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  dcFetch,
  dcList,
  listPageUrl,
  listTsv,
  parseComments,
  parseListPage,
  parsePost,
  pyQuote,
} from "../src/dc";
import { readLedger, verifyLedger } from "../src/ledger";
import type { SeenRequest } from "./helpers";
import { fakeFetch, fixture, testContext } from "./helpers";

/**
 * Builds the fake DC site for one post: its page, its comment answer, and
 * a JPEG for every image URL.
 *
 * @param no - the post number with fixtures under `dc/`
 * @param seen - where to record requests
 * @returns the fetch
 */
function dcSite(no: string, seen: SeenRequest[] = []) {
  return fakeFetch(
    [
      [`https://m.dcinside.com/board/projectcc/${no}`, { body: fixture(`dc/${no}.html`) }],
      ["https://m.dcinside.com/ajax/response-comment", { body: fixture(`dc/${no}-comments.html`) }],
      [
        /viewimage\.php/,
        (url) => ({
          body: new TextEncoder().encode(url),
          headers: { "content-type": "image/jpeg" },
        }),
      ],
    ],
    seen,
  );
}

describe("dc listing", () => {
  it("builds the search URLs dc_scrape.py built", () => {
    expect(listPageUrl("아레나", 2)).toBe(
      "https://m.dcinside.com/board/projectcc?s_type=all&serval=%EC%95%84%EB%A0%88%EB%82%98&page=2",
    );
    expect(listPageUrl("name:현이", 1)).toBe(
      "https://m.dcinside.com/board/projectcc?s_type=name&serval=%ED%98%84%EC%9D%B4&page=1",
    );
    expect(listPageUrl("@recommend", 3)).toBe(
      "https://m.dcinside.com/board/projectcc?recommend=1&page=3",
    );
    expect(pyQuote("a b/c~d")).toBe("a%20b/c~d");
  });

  it("reads every post of a saved listing page", () => {
    const rows = parseListPage(fixture("dc/list-arena.html"));
    expect(rows.length).toBeGreaterThan(10);
    for (const row of rows) {
      expect(row.no).toMatch(/^\d+$/);
      expect(row.title).not.toBe("");
      expect(row.title).not.toMatch(/\s{2}/);
    }
  });

  it("writes the TSV newest first, merging the queries that found a post, with its ledger line", async () => {
    const { context } = testContext(
      fakeFetch([
        [/page=1/, { body: fixture("dc/list-arena.html") }],
        [/page=2/, { body: "<html></html>" }],
      ]),
      "capture:dc",
    );
    const count = await dcList(context, "evidence/01/list.tsv", 5, ["a", "b"]);
    const tsv = readFileSync(join(context.recordDir, "evidence/01/list.tsv"), "utf-8");
    const lines = tsv.trimEnd().split("\n");
    expect(lines[0]).toBe("no\tdate\tviews\trecs\tcomments\tquery\ttitle\tauthor");
    expect(lines).toHaveLength(count + 1);
    const nos = lines.slice(1).map((l) => Number(l.split("\t")[0]));
    expect(nos).toEqual([...nos].sort((x, y) => y - x));
    expect(lines.slice(1).every((l) => l.split("\t")[5] === "a,b")).toBe(true);
    const [entry] = readLedger(context.recordDir);
    expect(entry!.line).toMatchObject({
      path: "evidence/01/list.tsv",
      tool: "capture:dc",
      captured_at: "2026-09-27T16:45:36+02:00",
    });
    expect(verifyLedger(context.recordDir)).toEqual([]);
  });

  it("formats rows as the listing TSV", () => {
    const row = {
      no: "1",
      date: "d",
      views: "v",
      recs: "r",
      comments: "c",
      title: "t",
      author: "a",
    };
    expect(
      listTsv([
        { ...row, query: "q" },
        { ...row, no: "2", query: "q" },
      ]),
    ).toBe(
      "no\tdate\tviews\trecs\tcomments\tquery\ttitle\tauthor\n2\td\tv\tr\tc\tq\tt\ta\n1\td\tv\tr\tc\tq\tt\ta\n",
    );
  });
});

describe("dc posts", () => {
  it("reads a post page's title, author line, token, body and image slots", () => {
    const post = parsePost(fixture("dc/73497.html"));
    expect(post.title).toBe("[일반] 바리오방덱 참고만 ㄱㄱ");
    expect(post.info).toMatch(/2026\.09\.23 16:20/);
    expect(post.csrf).toMatch(/^[0-9a-f]+$/);
    expect(post.images).toHaveLength(2);
    expect(post.text).toBe("[[IMG1]]\n[[IMG2]]");
  });

  it("reads comments, replies and nicknames with their marks", () => {
    expect(parseComments(fixture("dc/72838-comments.html"))).toEqual([
      { reply: false, nick: "ㅇㅇ 1", text: "이온 딸크 들개 3탱쓰고 방어피감10 쓰는중" },
      { reply: true, nick: "글쓴 ㅇㅇ", text: "하나는 열정페이쓰고? ㄱㅅㄱㅅ" },
    ]);
    expect(parseComments(fixture("dc/76504-comments.html"))).toEqual([]);
  });

  for (const [no, capturedAt] of [
    ["73497", "2026-09-27T14:41:31Z"],
    ["72838", "2026-09-27T14:44:38Z"],
    ["76504", "2026-09-27T14:45:36Z"],
  ] as const) {
    it(`writes post ${no} byte for byte as dc_scrape.py did`, async () => {
      const seen: SeenRequest[] = [];
      const { context } = testContext(dcSite(no, seen), "capture:dc", new Date(capturedAt));
      await dcFetch(context, "evidence/dc", [no]);
      const written = readFileSync(join(context.recordDir, `evidence/dc/${no}.md`), "utf-8");
      expect(written).toBe(fixture(`dc/${no}.md`));
      const comment = seen.find((r) => r.url.includes("response-comment"))!;
      expect(comment.init.body as string).toContain(`no=${no}`);
    });
  }

  it("saves each image under img/ with its ledger line, then the post's", async () => {
    const { context } = testContext(dcSite("73497"), "capture:dc");
    const written = await dcFetch(context, "evidence/dc", ["73497"]);
    expect(written).toEqual([
      "evidence/dc/img/73497-1.jpg",
      "evidence/dc/img/73497-2.jpg",
      "evidence/dc/73497.md",
    ]);
    const lines = readLedger(context.recordDir).map((e) => e.line);
    expect(lines.map((l) => l.path)).toEqual(written);
    expect(lines[0]!.url).toMatch(/^https:\/\/dcimg3\.dcinside\.co\.kr\/viewimage\.php\?id=/);
    expect(lines[2]!.url).toBe("https://m.dcinside.com/board/projectcc/73497");
    expect(verifyLedger(context.recordDir)).toEqual([]);
  });

  it("marks an image that won't download, and skips a post already captured", async () => {
    const site = fakeFetch([
      ["https://m.dcinside.com/board/projectcc/73497", { body: fixture("dc/73497.html") }],
      ["https://m.dcinside.com/ajax/", { body: fixture("dc/73497-comments.html") }],
    ]);
    const { context } = testContext(site, "capture:dc");
    await dcFetch(context, "evidence/dc", ["73497"]);
    const md = readFileSync(join(context.recordDir, "evidence/dc/73497.md"), "utf-8");
    expect(md).toContain("(image 1 failed)\n(image 2 failed)");
    expect(existsSync(join(context.recordDir, "evidence/dc/img"))).toBe(false);
    expect(await dcFetch(context, "evidence/dc", ["73497"])).toEqual([]);
  });
});
