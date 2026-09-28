/**
 * The official Cookie Run: Crumble Naver cafe (`cafe.naver.com/ccrumble`),
 * through its public JSON APIs: board listings, and articles with their
 * images and comments. A port of the retired `nv_scrape.py`, writing the
 * same TSV and Markdown.
 *
 * @module
 */
import type { CaptureContext, StagedFile } from "./context";
import { commitStaged, exists, isCaptured, logCapture, stageText, writeText } from "./context";
import { getText, parseHtml } from "./html";
import type { HttpOptions } from "./http";
import { HttpClient, imageExt, MOBILE_UA } from "./http";
import { headerStamp, localDate, localMinute } from "./time";
import { pyGet, pyJsonRedump, pyStr } from "./text";

/** The cafe's numeric id. */
export const CAFE = 31688486;

/** The pause between items, in milliseconds. */
export const NV_DELAY_MS = 600;

const LIST_API = "https://apis.naver.com/cafe-web/cafe2/ArticleListV2dot1.json";
const ARTICLE_API = "https://apis.naver.com/cafe-web/cafe-articleapi";

/** One comment under an article. */
export interface NvComment {
  nick: string;
  text: string;
  /** A reply to an earlier comment. */
  reply: boolean;
}

/**
 * Builds a Naver client: the mobile user agent and the mobile cafe as referer.
 *
 * @param overrides - hooks for tests (fetch, sleep, log)
 * @returns the client
 */
export function naverClient(overrides: Partial<HttpOptions> = {}): HttpClient {
  return new HttpClient({
    userAgent: MOBILE_UA,
    headers: { Referer: "https://m.cafe.naver.com/" },
    delayMs: NV_DELAY_MS,
    ...overrides,
  });
}

/**
 * Builds the URL of one page of a board's listing.
 *
 * @param menu - the board's menu id
 * @param page - the 1-based page; omitted, the URL names the listing as a whole
 * @returns the listing API URL
 */
export function listUrl(menu: string, page?: number): string {
  const params = new URLSearchParams({
    "search.clubid": String(CAFE),
    "search.menuid": menu,
    "search.queryType": "lastArticle",
  });
  if (page !== undefined) params.set("search.page", String(page));
  params.set("search.perPage", "50");
  return `${LIST_API}?${params.toString()}`;
}

/**
 * Reads a JSON response body.
 *
 * @param response - the response
 * @returns the parsed body
 * @throws if the body isn't JSON
 */
async function json(response: Response): Promise<Record<string, unknown>> {
  return JSON.parse(await response.text()) as Record<string, unknown>;
}

/**
 * Reads a nested field of parsed JSON, as chained `.get(key, {})` calls.
 *
 * @param value - the parsed JSON
 * @param keys - the path of keys
 * @returns the field, or `undefined` where a step is missing
 */
function dig(value: unknown, ...keys: string[]): unknown {
  let current = value;
  for (const key of keys) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/**
 * Formats listing rows as the listing TSV.
 *
 * @param rows - each row's cells: id, date, likes, comments, views, title, author
 * @returns the TSV, header included
 */
export function listTsv(rows: readonly string[][]): string {
  return `id\tdate\tlikes\tcomments\tviews\ttitle\tauthor\n${rows.map((r) => `${r.join("\t")}\n`).join("")}`;
}

/**
 * Reads the rows of one listing page.
 *
 * @param body - the listing API's parsed answer
 * @param context - the run, for the local date of each article
 * @returns one row per article, or `[]` when the page lists none
 */
export function parseListPage(body: unknown, context: CaptureContext): string[][] {
  const articles = (dig(body, "message", "result", "articleList") ?? []) as Array<
    Record<string, unknown>
  >;
  return articles.map((a) => [
    pyStr(a.articleId),
    localDate(new Date(Number(a.writeDateTimestamp)), context.offsetAt),
    pyStr(pyGet(a, "likeItCount", 0)),
    pyStr(pyGet(a, "commentCount", 0)),
    pyStr(pyGet(a, "readCount", 0)),
    pyStr(a.subject).replaceAll("\t", " "),
    pyStr(pyGet(a, "writerNickname", "")).replaceAll("\t", " "),
  ]);
}

/**
 * Lists a board, 50 articles to a page, until a page comes back empty, and
 * writes one TSV row per article with its ledger line.
 *
 * @param context - the run
 * @param out - the TSV's record-relative path
 * @param menu - the board's menu id
 * @param pages - the most pages to read
 * @returns the number of articles written
 * @throws if `out` already exists, a page doesn't load or isn't JSON, or
 *   the file or its ledger line can't be written
 */
export async function nvList(
  context: CaptureContext,
  out: string,
  menu: string,
  pages: number,
): Promise<number> {
  if (exists(context, out)) throw new Error(`${out} already exists`);
  const rows: string[][] = [];
  for (let page = 1; page <= pages; page++) {
    const body = await json(await context.http.send(listUrl(menu, page)));
    const pageRows = parseListPage(body, context);
    if (pageRows.length === 0) break;
    rows.push(...pageRows);
    await context.http.pause();
  }
  const at = context.now();
  writeText(context, out, listTsv(rows));
  logCapture(context, out, listUrl(menu), at);
  context.log(`wrote ${rows.length} rows to ${out}`);
  return rows.length;
}

/**
 * Reads one page of an article's comments.
 *
 * @param body - the comments API's parsed answer
 * @returns the page's comments; `[]` when it lists none
 */
export function parseComments(body: unknown): NvComment[] {
  const items = (dig(body, "result", "comments", "items") ?? []) as Array<Record<string, unknown>>;
  return items.map((c) => ({
    nick: pyStr(pyGet(pyGet(c, "writer", {}), "nick", "")),
    text: pyStr(c.content || "").replaceAll("\n", " "),
    reply: c.id !== c.refId,
  }));
}

/**
 * Fetches an article's comments, 100 to a page, up to 5 pages; a network
 * or JSON error ends the list where it stands.
 *
 * @param context - the run
 * @param aid - the article id
 * @returns the comments, in order
 */
export async function fetchComments(context: CaptureContext, aid: string): Promise<NvComment[]> {
  const out: NvComment[] = [];
  for (let page = 1; page <= 5; page++) {
    let items: NvComment[];
    try {
      const url = `${ARTICLE_API}/v2/cafes/${CAFE}/articles/${aid}/comments/pages/${page}?requestFrom=A&orderBy=asc`;
      items = parseComments(await json(await context.http.send(url)));
    } catch {
      break;
    }
    out.push(...items);
    if (items.length < 100) break;
    await context.http.pause();
  }
  return out;
}

/** Everything an article capture's Markdown holds. */
export interface ArticleCapture {
  subject: unknown;
  url: string;
  author: unknown;
  /** The header's `- written:` value. */
  written: string;
  /** The header's `- captured:` value. */
  captured: string;
  text: string;
  comments: readonly NvComment[];
}

/**
 * Formats an article capture's Markdown, byte for byte as `nv_scrape.py` wrote it.
 *
 * @param article - the article's parts
 * @returns the Markdown
 */
export function renderArticle(article: ArticleCapture): string {
  const lines = article.comments
    .map((c) => `${c.reply ? "  ↳ " : "- "}${c.nick}: ${c.text}\n`)
    .join("");
  return (
    `# ${pyStr(article.subject)}\n\n- url: ${article.url}\n- author: ${pyStr(article.author)}\n` +
    `- written: ${article.written}\n` +
    `- captured: ${article.captured}\n\n## Body\n\n${article.text}\n\n## Comments (${article.comments.length})\n\n` +
    lines
  );
}

/**
 * Formats the capture of an article the API refused (members-only, deleted).
 *
 * @param aid - the article id
 * @param url - its cafe URL
 * @param body - the API's answer, as JSON text
 * @returns the Markdown, the answer cut to 400 characters of Python's `json.dumps`
 * @throws {SyntaxError} if the answer isn't JSON
 */
export function renderRefused(aid: string, url: string, body: string): string {
  return `# ${aid}\n\n- url: ${url}\n\n(refused: ${pyJsonRedump(body).slice(0, 400)})\n`;
}

/**
 * Saves each article as `<outdir>/nv-<id>.md` (subject, author, dates, body
 * text, comments) and its images as `<outdir>/img/nv-<id>-<k>.<ext>`, each
 * file with its ledger line. An article is fetched whole (article, images,
 * comments) before any of its files is written (see {@link commitStaged}),
 * so a run cut short leaves each article either written or not. An
 * article already captured is skipped, and a rerun keeps the images an
 * earlier run captured; one that won't load is reported and skipped; one
 * the API refuses is written with the refusal instead of a body.
 *
 * @param context - the run
 * @param outdir - the record-relative folder, under `evidence/`
 * @param ids - the article ids
 * @returns the record-relative paths written, in order
 * @throws {LedgerError} naming the file, with nothing of its article
 *   written, when a file of the article differs from its ledger line, has
 *   a line but is missing, or is on disk without a line
 */
export async function nvFetch(
  context: CaptureContext,
  outdir: string,
  ids: readonly string[],
): Promise<string[]> {
  const written: string[] = [];
  for (const aid of ids) {
    const path = `${outdir}/nv-${aid}.md`;
    if (isCaptured(context, path)) continue;
    const url = `https://cafe.naver.com/ccrumble/${aid}`;
    const apiUrl = `${ARTICLE_API}/v2.1/cafes/${CAFE}/articles/${aid}?useCafeId=true`;
    let raw: string;
    let body: Record<string, unknown>;
    try {
      raw = await (await context.http.send(apiUrl)).text();
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch (err) {
      context.log(`ERR ${aid} ${(err as Error).message}`);
      continue;
    }
    const article = dig(body, "result", "article") as Record<string, unknown> | undefined;
    if (!article) {
      const refused = stageText(path, renderRefused(aid, url, raw), url, context.now());
      written.push(...commitStaged(context, [refused]));
      continue;
    }
    const $ = parseHtml(pyStr(pyGet(article, "contentHtml", "")));
    const staged: StagedFile[] = [];
    let saved = 0;
    for (const img of $("img").toArray()) {
      const node = $(img);
      let src = node.attr("src") ?? "";
      if (!src.includes("pstatic") && !src.includes("naver")) {
        node.remove();
        continue;
      }
      src = `${src.replace(/\?type=.*$/, "")}?type=w1600`;
      let image: Response;
      try {
        image = await context.http.send(src, { timeoutMs: 30_000 });
      } catch {
        node.replaceWith("\n(image failed)\n");
        continue;
      }
      saved += 1;
      const name = `nv-${aid}-${saved}.${imageExt(image)}`;
      const bytes = new Uint8Array(await image.arrayBuffer());
      staged.push({ path: `${outdir}/img/${name}`, bytes, url: src, at: context.now() });
      node.replaceWith(`\n![[${name}]]\n`);
    }
    $("br").replaceWith("\n");
    const text = getText($.root()[0]!, "\n").replace(/\n{3,}/g, "\n\n");
    const comments = await fetchComments(context, aid);
    const at = context.now();
    const markdown = renderArticle({
      subject: pyGet(article, "subject"),
      url,
      author: pyGet(pyGet(article, "writer", {}), "nick"),
      written: localMinute(new Date(Number(pyGet(article, "writeDate", 0))), context.offsetAt),
      captured: headerStamp(at, context.offsetAt),
      text,
      comments,
    });
    staged.push(stageText(path, markdown, url, at));
    written.push(...commitStaged(context, staged));
    context.log(`saved ${aid} (${saved} img, ${comments.length} comments)`);
    await context.http.pause();
  }
  return written;
}
