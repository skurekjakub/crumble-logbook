"""Append a captures.jsonl line for every file under evidence/ that the ledger doesn't list yet.

Usage:
    python ledger_backfill.py

The scrapers this record reuses unedited (record 001's dc_scrape.py and nv_scrape.py), yt-dlp
and the extraction lanes don't write the ledger themselves; this fills it in afterwards.
url and captured_at come from the capture's own `- url:` / `- captured:` header when it has one
(an image takes its post's), else the source named by the folder, else null and the file's
modification time. Lines already in the ledger are never rewritten.
"""
import datetime, hashlib, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(HERE, "captures.jsonl")
DC = "python:research/001-guild-conquest-meta/evidence/dc_scrape.py"
NV = "python:research/001-guild-conquest-meta/evidence/nv_scrape.py"


def header(md):
    """Return (url, captured ISO string with offset) from a capture's header lines, or (None, None)."""
    if not os.path.exists(md):
        return None, None
    head = open(md, encoding="utf-8").read(2000)
    url = re.search(r"^- url: (\S+)", head, re.M)
    cap = re.search(r"^- captured: (\S+)", head, re.M)
    stamp = None
    if cap:
        stamp = datetime.datetime.strptime(cap.group(1), "%Y-%m-%dT%H:%M:%S%z").isoformat()
    return (url.group(1) if url else None), stamp


def describe(rel):
    """Return (url, captured_at or None, tool) for an evidence path relative to evidence/."""
    parts = rel.split("/")
    name = parts[-1]
    if parts[0] == "02-dc":
        if parts[1:2] == ["dc"]:
            no = re.match(r"(\d+)", name).group(1)
            url, stamp = header(os.path.join(HERE, "02-dc", "dc", f"{no}.md"))
            return url, stamp, DC
        return "https://m.dcinside.com/board/projectcc (search listing; queries in the file's query column)", None, DC
    if parts[0] == "04-naver":
        if parts[1:2] == ["nv"]:
            no = re.match(r"nv-(\d+)", name).group(1)
            url, stamp = header(os.path.join(HERE, "04-naver", "nv", f"nv-{no}.md"))
            return url, stamp, NV
        menu = re.search(r"menu(\d+)", name)
        return (f"https://apis.naver.com/cafe-web/cafe2/ArticleListV2dot1.json?search.clubid=31688486"
                f"&search.menuid={menu.group(1) if menu else '?'}"), None, NV
    if parts[0] == "05-youtube":
        vid = name.split(".")[0]
        return f"https://www.youtube.com/watch?v={vid}", None, "yt-dlp"
    return None, None, "manual"


def main():
    known = set()
    if os.path.exists(LEDGER):
        for line in open(LEDGER, encoding="utf-8"):
            if line.strip():
                known.add(json.loads(line)["path"])
    rows = []
    for root, _, files in os.walk(HERE):
        for f in sorted(files):
            full = os.path.join(root, f)
            rel = os.path.relpath(full, HERE).replace(os.sep, "/")
            path = f"evidence/{rel}"
            if rel == "captures.jsonl" or path in known:
                continue
            url, stamp, tool = describe(rel)
            if stamp is None:
                stamp = datetime.datetime.fromtimestamp(os.path.getmtime(full)).astimezone().isoformat(timespec="seconds")
            data = open(full, "rb").read()
            rows.append({"path": path, "url": url, "captured_at": stamp, "tool": tool,
                         "sha256": hashlib.sha256(data).hexdigest()})
    with open(LEDGER, "a", encoding="utf-8") as out:
        for r in sorted(rows, key=lambda r: r["path"]):
            out.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"appended {len(rows)} lines")


if __name__ == "__main__":
    main()
