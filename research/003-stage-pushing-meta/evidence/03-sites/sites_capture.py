"""Capture structured stage data from community sites, verbatim, into this folder.

Usage:
    python sites_capture.py get <file> <url>
        Save the response body of <url> as <file> (in this folder), byte for byte.
    python sites_capture.py pages <prefix> <url>
        Follow a crumblehub `nextCursor` chain from <url>: page k is saved as
        <prefix>_pNN.json, each later page fetched with `&cursor=<nextCursor>`.

Every file written gets one JSON line in ../captures.jsonl:
{"path","url","captured_at","tool","sha256"}. Plain GET, `User-Agent: Mozilla/5.0`,
no cookies. Failure: a non-200 response is printed and nothing is written for it.
"""
import datetime, hashlib, json, os, sys, time, urllib.parse
import requests

HERE = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(HERE, "..", "captures.jsonl")
SUB = os.path.basename(HERE)
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                                 "(KHTML, like Gecko) Chrome/140.0 Safari/537.36"})


def save(name, url):
    """Fetch url and write its body to name; returns the body bytes or None on failure."""
    r = S.get(url, timeout=60)
    if r.status_code != 200:
        print(f"HTTP {r.status_code} {url}", file=sys.stderr)
        return None
    with open(os.path.join(HERE, name), "wb") as f:
        f.write(r.content)
    stamp = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
    with open(LEDGER, "a", encoding="utf-8") as f:
        f.write(json.dumps({"path": f"evidence/{SUB}/{name}", "url": url, "captured_at": stamp,
                            "tool": "python:evidence/03-sites/sites_capture.py",
                            "sha256": hashlib.sha256(r.content).hexdigest()}, ensure_ascii=False) + "\n")
    print(f"saved {name} ({len(r.content)} B)", file=sys.stderr)
    return r.content


def pages(prefix, url):
    """Save every page of a cursor-paginated crumblehub API listing."""
    k, cursor = 1, None
    while True:
        u = url if cursor is None else f"{url}&cursor={urllib.parse.quote(cursor)}"
        body = save(f"{prefix}_p{k:02d}.json", u)
        if body is None:
            return
        cursor = json.loads(body).get("nextCursor")
        if not cursor:
            return
        k += 1
        time.sleep(1.0)


if __name__ == "__main__":
    if sys.argv[1] == "get":
        save(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == "pages":
        pages(sys.argv[2], sys.argv[3])
