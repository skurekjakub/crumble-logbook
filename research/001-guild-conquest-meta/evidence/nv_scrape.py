"""Scrape the official Cookie Run: Crumble Naver cafe (cafe.naver.com/ccrumble) via its public JSON APIs.

Usage:
    python nv_scrape.py list <out.tsv> <menuId> <pages>
        Write one TSV row per article on that board: id, date, likes, comments, views, title, author.
    python nv_scrape.py fetch <outdir> <articleId> [<articleId> ...]
        Save each article as <outdir>/nv-<id>.md (metadata, body text, comments) and its
        images as <outdir>/img/nv-<id>-<k>.<ext>. Existing .md files are skipped.

Failure: an article the API refuses (members-only, deleted) is written with its error
message instead of a body; network errors skip the item and the run continues.
"""
import os, re, sys, time, json
import requests
from bs4 import BeautifulSoup

CAFE = 31688486
UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
S = requests.Session()
S.headers.update({"User-Agent": UA, "Referer": "https://m.cafe.naver.com/"})
DELAY = 0.6


def cmd_list(out, menu, pages):
    rows = []
    for p in range(1, pages + 1):
        d = S.get("https://apis.naver.com/cafe-web/cafe2/ArticleListV2dot1.json",
                  params={"search.clubid": CAFE, "search.menuid": menu, "search.queryType": "lastArticle",
                          "search.page": p, "search.perPage": 50}, timeout=25).json()
        al = d["message"]["result"].get("articleList", [])
        if not al:
            break
        for a in al:
            rows.append([str(a["articleId"]), time.strftime("%Y-%m-%d", time.localtime(a["writeDateTimestamp"] / 1000)),
                         str(a.get("likeItCount", 0)), str(a.get("commentCount", 0)), str(a.get("readCount", 0)),
                         a["subject"].replace("\t", " "), a.get("writerNickname", "").replace("\t", " ")])
        time.sleep(DELAY)
    with open(out, "w", encoding="utf-8") as f:
        f.write("id\tdate\tlikes\tcomments\tviews\ttitle\tauthor\n")
        for r in rows:
            f.write("\t".join(r) + "\n")
    print(f"wrote {len(rows)} rows to {out}", file=sys.stderr)


def comments(aid):
    """Return (nick, text, is_reply) tuples for an article; empty on failure."""
    out = []
    for page in range(1, 6):
        try:
            d = S.get(f"https://apis.naver.com/cafe-web/cafe-articleapi/v2/cafes/{CAFE}/articles/{aid}/comments/pages/{page}",
                      params={"requestFrom": "A", "orderBy": "asc"}, timeout=25).json()
        except (requests.RequestException, ValueError):
            break
        items = d.get("result", {}).get("comments", {}).get("items", [])
        for c in items:
            out.append((c.get("writer", {}).get("nick", ""), (c.get("content") or "").replace("\n", " "),
                        c.get("id") != c.get("refId")))
        if len(items) < 100:
            break
        time.sleep(DELAY)
    return out


def cmd_fetch(outdir, ids):
    os.makedirs(os.path.join(outdir, "img"), exist_ok=True)
    for aid in ids:
        path = os.path.join(outdir, f"nv-{aid}.md")
        if os.path.exists(path):
            continue
        url = f"https://cafe.naver.com/ccrumble/{aid}"
        try:
            d = S.get(f"https://apis.naver.com/cafe-web/cafe-articleapi/v2.1/cafes/{CAFE}/articles/{aid}",
                      params={"useCafeId": "true"}, timeout=25).json()
        except (requests.RequestException, ValueError) as e:
            print(f"ERR {aid} {e}", file=sys.stderr)
            continue
        art = d.get("result", {}).get("article")
        if not art:
            with open(path, "w", encoding="utf-8") as f:
                f.write(f"# {aid}\n\n- url: {url}\n\n(refused: {json.dumps(d)[:400]})\n")
            continue
        soup = BeautifulSoup(art.get("contentHtml", ""), "html.parser")
        saved = 0
        for img in soup.find_all("img"):
            src = img.get("src") or ""
            if "pstatic" not in src and "naver" not in src:
                img.decompose()
                continue
            src = re.sub(r"\?type=.*$", "", src) + "?type=w1600"
            try:
                ir = S.get(src, timeout=30)
            except requests.RequestException:
                img.replace_with("\n(image failed)\n")
                continue
            saved += 1
            ext = {"image/png": "png", "image/gif": "gif", "image/webp": "webp"}.get(
                ir.headers.get("content-type", "").split(";")[0], "jpg")
            name = f"nv-{aid}-{saved}.{ext}"
            with open(os.path.join(outdir, "img", name), "wb") as f:
                f.write(ir.content)
            img.replace_with(f"\n![[{name}]]\n")
        for br in soup.find_all("br"):
            br.replace_with("\n")
        text = re.sub(r"\n{3,}", "\n\n", soup.get_text("\n", strip=True))
        cms = comments(aid)
        w = art.get("writer", {})
        with open(path, "w", encoding="utf-8") as f:
            f.write(f"# {art.get('subject')}\n\n- url: {url}\n- author: {w.get('nick')}\n")
            f.write(f"- written: {time.strftime('%Y-%m-%d %H:%M', time.localtime(art.get('writeDate', 0) / 1000))}\n")
            f.write(f"- captured: {time.strftime('%Y-%m-%dT%H:%M:%S%z')}\n\n## Body\n\n{text}\n\n## Comments ({len(cms)})\n\n")
            for nick, txt, reply in cms:
                f.write(f"{'  ↳ ' if reply else '- '}{nick}: {txt}\n")
        print(f"saved {aid} ({saved} img, {len(cms)} comments)", file=sys.stderr)
        time.sleep(DELAY)


if __name__ == "__main__":
    if sys.argv[1] == "list":
        cmd_list(sys.argv[2], sys.argv[3], int(sys.argv[4]))
    elif sys.argv[1] == "fetch":
        cmd_fetch(sys.argv[2], sys.argv[3:])
