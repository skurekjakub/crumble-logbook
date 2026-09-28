/**
 * The DCInside Cookie Run: Crumble minor gallery (`projectcc`), through the
 * mobile site: search listings, and posts with their images and comments.
 * A port of the retired `dc_scrape.py`, writing the same TSV and Markdown.
 *
 * @module
 */
import type { CaptureContext, StagedFile } from "./context";
import { commitStaged, exists, isCaptured, logCapture, stageText, writeText } from "./context";
import { getText, parseHtml } from "./html";
import { HttpClient, imageExt, MOBILE_UA } from "./http";
import type { HttpOptions } from "./http";
import { headerStamp } from "./time";
import { pyCollapse, pyQuote } from "./text";

/** The gallery id. */
export const GALL = "projectcc";

/** The mobile board's base URL. */
export const BOARD_URL = `https://m.dcinside.com/board/${GALL}`;

/** The pause between items, in milliseconds. */
export const DC_DELAY_MS = 800;

/** One post as a search listing shows it. */
export interface ListRow {
  no: string;
  date: string;
  views: string;
  recs: string;
  comments: string;
  title: string;
  author: string;
}

/** One comment under a post. */
export interface DcComment {
  /** A reply to the comment above it. */
  reply: boolean;
  nick: string;
  text: string;
}

/** A post page's parts, before its images are fetched. */
export interface ParsedPost {
  /** The title, whitespace collapsed; `null` when the page has none. */
  title: string | null;
  /** The author and date line; `""` when the page has none. */
  info: string;
  /** The page's CSRF token, which the comment endpoint wants; `""` when absent. */
  csrf: string;
  /** The body text, each image a `[[IMG<k>]]` line; `"(body not found)"` without a body. */
  text: string;
  /** The body's image URLs, in order: the `k` of each `[[IMG<k>]]`. */
  images: string[];
}

/**
 * Builds a DC client: the mobile user agent and the mobile site as referer.
 *
 * @param overrides - hooks for tests (fetch, sleep, log)
 * @returns the client
 */
export function dcClient(overrides: Partial<HttpOptions> = {}): HttpClient {
  return new HttpClient({
    userAgent: MOBILE_UA,
    headers: { Referer: "https://m.dcinside.com/" },
    delayMs: DC_DELAY_MS,
    ...overrides,
  });
}

/**
 * Builds the URL of one search (or recommended-post) listing page.
 *
 * @param query - a search term; `name:`, `subject:`, `memo:` or `comment:`
 *   searches that field instead of titles and bodies, and `@recommend` lists
 *   the recommended posts (개념글)
 * @param page - the 1-based page
 * @returns the page's URL
 */
export function listPageUrl(query: string, page: number): string {
  if (query === "@recommend") return `${BOARD_URL}?recommend=1&page=${page}`;
  const field = /^(name|subject|memo|comment):/.exec(query);
  const [type, term] = field ? [field[1]!, query.slice(field[0].length)] : ["all", query];
  return `${BOARD_URL}?s_type=${type}&serval=${pyQuote(term)}&page=${page}`;
}

/**
 * Reads the posts of one listing page.
 *
 * @param html - the page's markup
 * @returns one row per post, in page order
 */
export function parseListPage(html: string): ListRow[] {
  const $ = parseHtml(html);
  const rows: ListRow[] = [];
  $("ul.gall-detail-lst > li").each((_, li) => {
    const item = $(li);
    const link = item.find(`a[href*='/board/${GALL}/']`).first();
    if (link.length === 0) return;
    const no = new RegExp(`/board/${GALL}/(\\d+)`).exec(link.attr("href") ?? "")?.[1];
    if (!no) return;
    const subject = item.find(".subjectin").first();
    const title = getText((subject.length > 0 ? subject : link)[0]!, " ");
    const info = item
      .find(".ginfo li")
      .toArray()
      .map((el) => getText(el, ""));
    const count = item.find(".ct").first();
    rows.push({
      no,
      date: info[2] ?? "",
      views: info[3] ?? "",
      recs: info[4] ?? "",
      comments: count.length > 0 ? getText(count[0]!, "") : "",
      title: pyCollapse(title),
      author: info[1] ?? "",
    });
  });
  return rows;
}

/**
 * Formats listing rows as the listing TSV, newest post first.
 *
 * @param rows - the rows, each with the queries that found it
 * @returns the TSV, header included
 */
export function listTsv(rows: ReadonlyArray<ListRow & { query: string }>): string {
  const keys = ["no", "date", "views", "recs", "comments", "query", "title", "author"] as const;
  const sorted = [...rows].sort((a, b) => Number(b.no) - Number(a.no));
  return `${keys.join("\t")}\n${sorted.map((row) => `${keys.map((k) => row[k]).join("\t")}\n`).join("")}`;
}

/**
 * Searches the gallery for each query, page by page until a page comes back
 * empty, and writes one TSV row per post (a post several queries find lists
 * them all), with its ledger line. The line's URL is the query's first
 * page, or the board's URL for several queries, which the TSV's `query`
 * column names.
 *
 * @param context - the run
 * @param out - the TSV's record-relative path
 * @param pages - the most pages to read per query
 * @param queries - the search terms (see {@link listPageUrl})
 * @returns the number of posts written
 * @throws if `out` already exists (captures are never overwritten), or the
 *   file or its ledger line can't be written
 */
export async function dcList(
  context: CaptureContext,
  out: string,
  pages: number,
  queries: readonly string[],
): Promise<number> {
  if (exists(context, out)) throw new Error(`${out} already exists`);
  const seen = new Map<string, ListRow & { query: string }>();
  for (const query of queries) {
    for (let page = 1; page <= pages; page++) {
      const response = await context.http.get(listPageUrl(query, page));
      const rows = response ? parseListPage(await response.text()) : [];
      context.log(`${query} p${page}: ${rows.length}`);
      if (rows.length === 0) break;
      for (const row of rows) {
        const known = seen.get(row.no);
        if (known) known.query += `,${query}`;
        else seen.set(row.no, { ...row, query });
      }
      await context.http.pause();
    }
  }
  const at = context.now();
  writeText(context, out, listTsv([...seen.values()]));
  const url = queries.length === 1 ? listPageUrl(queries[0]!, 1) : BOARD_URL;
  logCapture(context, out, url, at);
  context.log(`wrote ${seen.size} rows to ${out}`);
  return seen.size;
}

/**
 * Reads a post page: title, author line, CSRF token, and body text with a
 * `[[IMG<k>]]` line for each gallery image (an `img` or `video` whose
 * source is a `dcimg` or `viewimage` URL).
 *
 * @param html - the page's markup
 * @returns the post's parts
 */
export function parsePost(html: string): ParsedPost {
  const $ = parseHtml(html);
  const title = $(".gallview-tit-box .tit").first();
  const info = $(".gallview-tit-box .ginfo2").first();
  const body = $(".thum-txtin").first();
  const images: string[] = [];
  let text = "(body not found)";
  if (body.length > 0) {
    for (const el of body.find("img, video").toArray()) {
      const node = $(el);
      const src = node.attr("data-original") || node.attr("src") || "";
      if (src.includes("dcimg") || src.includes("viewimage")) {
        images.push(src);
        node.replaceWith(`\n[[IMG${images.length}]]\n`);
      }
    }
    text = getText(body[0]!, "\n");
  }
  return {
    title: title.length > 0 ? pyCollapse(getText(title[0]!, " ")) : null,
    info: info.length > 0 ? getText(info[0]!, " ") : "",
    csrf: $("meta[name=csrf-token]").attr("content") ?? "",
    text,
    images,
  };
}

/**
 * Reads one page of the comment endpoint's answer.
 *
 * @param html - the endpoint's markup
 * @returns the page's comments in order; `[]` when it lists none
 */
export function parseComments(html: string): DcComment[] {
  const $ = parseHtml(html);
  return $("ul.all-comment-lst > li")
    .toArray()
    .map((li) => {
      const item = $(li);
      const nick = item.find(".nick").first();
      const txt = item.find(".txt").first();
      const dccon = item.find("img.written_dccon").first();
      const text = txt.length > 0 ? getText(txt[0]!, " ") : dccon.length > 0 ? "[dccon]" : "";
      return {
        reply: (item.attr("class") ?? "").split(/\s+/).includes("comment-add"),
        nick: nick.length > 0 ? getText(nick[0]!, " ") : "",
        text,
      };
    });
}

/**
 * Fetches a post's comments through the mobile AJAX endpoint, 50 to a page,
 * up to 5 pages; a network error ends the list where it stands.
 *
 * @param context - the run
 * @param no - the post number
 * @param csrf - the post page's CSRF token
 * @returns the comments, in order
 */
export async function fetchComments(
  context: CaptureContext,
  no: string,
  csrf: string,
): Promise<DcComment[]> {
  const out: DcComment[] = [];
  for (let cpage = 1; cpage <= 5; cpage++) {
    let html: string;
    try {
      const response = await context.http.send("https://m.dcinside.com/ajax/response-comment", {
        method: "POST",
        form: { id: GALL, no, cpage, managerskill: "", del_scope: "1", csort: "" },
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrf,
          Referer: `${BOARD_URL}/${no}`,
        },
      });
      html = await response.text();
    } catch {
      break;
    }
    const items = parseComments(html);
    if (items.length === 0) break;
    out.push(...items);
    if (items.length < 50) break;
    await context.http.pause();
  }
  return out;
}

/** Everything a post capture's Markdown holds. */
export interface PostCapture {
  no: string;
  url: string;
  /** The page's title, or `null` to fall back to the post number. */
  title: string | null;
  info: string;
  /** The header's `- captured:` value. */
  captured: string;
  /** The body text, image lines already resolved. */
  text: string;
  comments: readonly DcComment[];
}

/**
 * Formats a post capture's Markdown, byte for byte as `dc_scrape.py` wrote it.
 *
 * @param post - the post's parts
 * @returns the Markdown
 */
export function renderPost(post: PostCapture): string {
  const lines = post.comments
    .map((c) => `${c.reply ? "  ↳ " : "- "}${c.nick}: ${c.text}\n`)
    .join("");
  return (
    `# ${post.title ?? post.no}\n\n` +
    `- url: ${post.url}\n- author/date: ${post.info}\n` +
    `- captured: ${post.captured}\n\n## Body\n\n${post.text}\n\n## Comments (${post.comments.length})\n\n` +
    lines
  );
}

/**
 * Saves each post as `<outdir>/<no>.md` (title, author line, capture time,
 * body text, comments) and its images as `<outdir>/img/<no>-<k>.<ext>`,
 * each file with its ledger line. A post is fetched whole (page, images,
 * comments) before any of its files is written (see {@link commitStaged}),
 * so a run cut short leaves each post either written or not. A post
 * already captured is skipped, and a rerun keeps the images an earlier run
 * captured; a post page that won't load is reported and skipped.
 *
 * @param context - the run
 * @param outdir - the record-relative folder, under `evidence/`
 * @param nos - the post numbers
 * @returns the record-relative paths written, in order
 * @throws {LedgerError} naming the file, with nothing of its post written,
 *   when a file of the post differs from its ledger line, has a line but
 *   is missing, or is on disk without a line
 */
export async function dcFetch(
  context: CaptureContext,
  outdir: string,
  nos: readonly string[],
): Promise<string[]> {
  const written: string[] = [];
  for (const no of nos) {
    const path = `${outdir}/${no}.md`;
    if (isCaptured(context, path)) continue;
    const url = `${BOARD_URL}/${no}`;
    const page = await context.http.get(url);
    if (!page) continue;
    const post = parsePost(await page.text());
    const staged: StagedFile[] = [];
    const saved: Array<string | null> = [];
    for (const [index, src] of post.images.entries()) {
      const image = await context.http.get(src, { headers: { Referer: url } });
      if (!image) {
        saved.push(null);
        continue;
      }
      const name = `${no}-${index + 1}.${imageExt(image)}`;
      const bytes = new Uint8Array(await image.arrayBuffer());
      staged.push({ path: `${outdir}/img/${name}`, bytes, url: src, at: context.now() });
      saved.push(name);
    }
    let text = post.text;
    saved.forEach((name, index) => {
      const k = index + 1;
      text = text.replaceAll(`[[IMG${k}]]`, name ? `![[${name}]]` : `(image ${k} failed)`);
    });
    const comments = await fetchComments(context, no, post.csrf);
    const at = context.now();
    const markdown = renderPost({
      no,
      url,
      title: post.title,
      info: post.info,
      captured: headerStamp(at, context.offsetAt),
      text,
      comments,
    });
    staged.push(stageText(path, markdown, url, at));
    written.push(...commitStaged(context, staged));
    context.log(`saved ${no} (${saved.length} img, ${comments.length} comments)`);
    await context.http.pause();
  }
  return written;
}
