"""Scrape the DCInside Cookie Run: Crumble minor gallery (projectcc) via the mobile site.

Usage:
    python dc_scrape.py list <out.tsv> <pages> <query> [<query> ...]
        Search post titles+bodies for each query (query "@recommend" = 개념글 list)
        and write one TSV row per post: no, date, views, recs, comments, query, title, author.
        A query prefixed "name:", "subject:", "memo:" or "comment:" searches that field
        instead (author nickname, title only, body only, comments), e.g. "name:현이".
    python dc_scrape.py fetch <outdir> <no> [<no> ...]
        Save each post as <outdir>/<no>.md (metadata, body text, comments) and its
        images as <outdir>/img/<no>-<k>.<ext>. Existing .md files are skipped.

Failure: network errors are printed per item and the item is skipped; the run continues.
"""
import os, re, sys, time, json
import requests
from bs4 import BeautifulSoup

GALL = "projectcc"
UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
S = requests.Session()
S.headers.update({"User-Agent": UA, "Referer": "https://m.dcinside.com/"})
DELAY = 0.8


def get(url, **kw):
    """GET with the mobile session; returns the Response or None after 3 failed tries."""
    for attempt in range(3):
        try:
            r = S.get(url, timeout=25, **kw)
            if r.status_code == 200:
                return r
            print(f"  HTTP {r.status_code} {url}", file=sys.stderr)
        except requests.RequestException as e:
            print(f"  ERR {e} {url}", file=sys.stderr)
        time.sleep(2 + attempt * 3)
    return None


def list_page(query, page):
    """Return list-item dicts for one search (or recommend) results page."""
    if query == "@recommend":
        url = f"https://m.dcinside.com/board/{GALL}?recommend=1&page={page}"
    else:
        stype, _, term = query.partition(":") if re.match(r"(name|subject|memo|comment):", query) else ("all", "", query)
        url = f"https://m.dcinside.com/board/{GALL}?s_type={stype}&serval={requests.utils.quote(term)}&page={page}"
    r = get(url)
    if not r:
        return []
    soup = BeautifulSoup(r.text, "html.parser")
    rows = []
    for li in soup.select("ul.gall-detail-lst > li"):
        a = li.select_one("a[href*='/board/%s/']" % GALL)
        if not a:
            continue
        m = re.search(r"/board/%s/(\d+)" % GALL, a["href"])
        if not m:
            continue
        title = (li.select_one(".subjectin") or a).get_text(" ", strip=True)
        info = [x.get_text(strip=True) for x in li.select(".ginfo li")]
        ct = li.select_one(".ct")
        rows.append({
            "no": m.group(1),
            "date": info[2] if len(info) > 2 else "",
            "views": info[3] if len(info) > 3 else "",
            "recs": info[4] if len(info) > 4 else "",
            "comments": ct.get_text(strip=True) if ct else "",
            "title": re.sub(r"\s+", " ", title),
            "author": info[1] if len(info) > 1 else "",
        })
    return rows


def cmd_list(out, pages, queries):
    seen = {}
    for q in queries:
        for p in range(1, pages + 1):
            rows = list_page(q, p)
            print(f"{q} p{p}: {len(rows)}", file=sys.stderr)
            if not rows:
                break
            for row in rows:
                if row["no"] in seen:
                    seen[row["no"]]["query"] += "," + q
                else:
                    row["query"] = q
                    seen[row["no"]] = row
            time.sleep(DELAY)
    with open(out, "w", encoding="utf-8") as f:
        f.write("no\tdate\tviews\trecs\tcomments\tquery\ttitle\tauthor\n")
        for row in sorted(seen.values(), key=lambda r: -int(r["no"])):
            f.write("\t".join(row[k] for k in ["no", "date", "views", "recs", "comments", "query", "title", "author"]) + "\n")
    print(f"wrote {len(seen)} rows to {out}", file=sys.stderr)


def comments(no, csrf):
    """Return comment dicts for a post via the mobile AJAX endpoint (empty list on failure)."""
    out = []
    for cpage in range(1, 6):
        try:
            r = S.post("https://m.dcinside.com/ajax/response-comment",
                       data={"id": GALL, "no": no, "cpage": cpage, "managerskill": "", "del_scope": "1",
                             "csort": ""},
                       headers={"X-Requested-With": "XMLHttpRequest", "X-CSRF-TOKEN": csrf or "",
                                "Referer": f"https://m.dcinside.com/board/{GALL}/{no}"},
                       timeout=25)
        except requests.RequestException:
            break
        soup = BeautifulSoup(r.text, "html.parser")
        items = soup.select("ul.all-comment-lst > li")
        if not items:
            break
        for li in items:
            nick = li.select_one(".nick")
            txt = li.select_one(".txt")
            img = li.select_one("img.written_dccon")
            out.append({
                "reply": "comment-add" in (li.get("class") or []),
                "nick": nick.get_text(" ", strip=True) if nick else "",
                "text": txt.get_text(" ", strip=True) if txt else (img and "[dccon]") or "",
            })
        if len(items) < 50:
            break
        time.sleep(DELAY)
    return out


def cmd_fetch(outdir, nos):
    os.makedirs(os.path.join(outdir, "img"), exist_ok=True)
    for no in nos:
        path = os.path.join(outdir, f"{no}.md")
        if os.path.exists(path):
            continue
        url = f"https://m.dcinside.com/board/{GALL}/{no}"
        r = get(url)
        if not r:
            continue
        soup = BeautifulSoup(r.text, "html.parser")
        tit = soup.select_one(".gallview-tit-box .tit")
        info = soup.select_one(".gallview-tit-box .ginfo2")
        body = soup.select_one(".thum-txtin")
        csrf_el = soup.select_one("meta[name=csrf-token]")
        lines = []
        imgs = []
        if body:
            for el in body.find_all(["img", "video"]):
                src = el.get("data-original") or el.get("src") or ""
                if "dcimg" in src or "viewimage" in src:
                    imgs.append(src)
                    el.replace_with(f"\n[[IMG{len(imgs)}]]\n")
            text = body.get_text("\n", strip=True)
        else:
            text = "(body not found)"
        saved = []
        for k, src in enumerate(imgs, 1):
            ir = get(src, headers={"Referer": url})
            if not ir:
                saved.append(None)
                continue
            ext = {"image/png": "png", "image/gif": "gif", "image/webp": "webp"}.get(
                ir.headers.get("content-type", "").split(";")[0], "jpg")
            name = f"{no}-{k}.{ext}"
            with open(os.path.join(outdir, "img", name), "wb") as f:
                f.write(ir.content)
            saved.append(name)
        for k, name in enumerate(saved, 1):
            text = text.replace(f"[[IMG{k}]]", f"![[{name}]]" if name else f"(image {k} failed)")
        cms = comments(no, csrf_el["content"] if csrf_el else "")
        with open(path, "w", encoding="utf-8") as f:
            f.write(f"# {re.sub(r'\s+', ' ', tit.get_text(' ', strip=True)) if tit else no}\n\n")
            f.write(f"- url: {url}\n- author/date: {info.get_text(' ', strip=True) if info else ''}\n")
            f.write(f"- captured: {time.strftime('%Y-%m-%dT%H:%M:%S%z')}\n\n## Body\n\n{text}\n\n## Comments ({len(cms)})\n\n")
            for c in cms:
                f.write(f"{'  ↳ ' if c['reply'] else '- '}{c['nick']}: {c['text']}\n")
        print(f"saved {no} ({len(saved)} img, {len(cms)} comments)", file=sys.stderr)
        time.sleep(DELAY)


if __name__ == "__main__":
    if sys.argv[1] == "list":
        cmd_list(sys.argv[2], int(sys.argv[3]), sys.argv[4:])
    elif sys.argv[1] == "fetch":
        cmd_fetch(sys.argv[2], sys.argv[3:])
