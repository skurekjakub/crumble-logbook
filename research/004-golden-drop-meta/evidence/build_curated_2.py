"""Build curated/usage.json and curated/sources.json from this record's evidence.

Usage:
    python build_curated_2.py

Supersedes build_curated.py (kept unedited as the record of the first build):
a web: id with no WEB entry now takes its url, title and date from its
08-extract lane post, so a new web source needs only an extraction entry.

usage.json: one row per cookie kept in at least half of the published full
lineups, from 06-derived/lineup-usage.json.

sources.json: one entry per source id that any other curated file cites.
dc: and nv: entries take url, title and date from this record's capture
headers; title_en and relevance come from the 08-extract lanes; youtube
entries (web:yt-<id>) read 05-youtube/watch/yt-<id>.txt; other web: ids come
from WEB below, else from their lane post. An id with none of these stops the
run with its name, so nothing uncited or unknown is written.
"""
import glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REC = os.path.dirname(HERE)
CURATED = os.path.join(REC, "curated")

WEB = {
    "web:eoggg-crumble": {"url": "https://eog.gg/games/cookierun-crumble/", "title": "CookieRun: Crumble hub (EOG)", "title_en": "EOG hub: Crumble Dungeon sections (global guild)", "date": "2026-08-14", "signal": "relevance 3/3"},
    "web:crumbleguides-dungeon": {"url": "https://crumbleguides.com/guides/cookie-run-crumble-dungeon", "title": "Cookie Run: Crumble — Crumble Dungeon Mode Guide", "title_en": "Crumble Guides: Crumble Dungeon mode guide (pre-launch)", "date": "2026-07-25", "signal": "relevance 1/3"},
    "web:crumbgg-patches-data": {"url": "https://crumb.gg/data/patches.json", "title": "crumb.gg patches data", "title_en": "crumb.gg patch digest, data file (global)", "date": "2026-09-28", "signal": "relevance 2/3"},
    # Copied verbatim from record 001's curated/sources.json so the shared row agrees.
    "web:sugarpocket-catalog": {"url": "https://cookieruncrumble.app/api/catalog/gameplay + /api/catalog/database", "title": "슈가포켓 게임 데이터 카탈로그 (클라이언트 1.4.002 추출)", "title_en": "Sugar Pocket datamined catalog (client 1.4.002)", "date": "2026-09-23", "signal": "relevance 3/3"},
}


def load(name):
    with open(os.path.join(CURATED, name), encoding="utf-8") as f:
        return json.load(f)


def dump(name, data):
    with open(os.path.join(CURATED, name), "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")


def cited_ids():
    ids = set()

    def walk(v):
        if isinstance(v, dict):
            for k, x in v.items():
                if k == "sources" and isinstance(x, list):
                    ids.update(x)
                else:
                    walk(x)
        elif isinstance(v, list):
            for x in v:
                walk(x)

    for path in glob.glob(os.path.join(CURATED, "*.json")):
        if os.path.basename(path) in ("sources.json", "manifest.json"):
            continue
        with open(path, encoding="utf-8") as f:
            walk(json.load(f))
    return ids


def lane_index():
    idx = {}
    for path in sorted(glob.glob(os.path.join(HERE, "08-extract", "*.json"))):
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        for p in data.get("posts", []):
            prefix = {"dc": "dc:", "naver": "nv:"}.get(p.get("source"), "web:")
            sid = prefix + str(p.get("id", "")).replace("nv-", "")
            idx.setdefault(sid, p)
    return idx


def header(path):
    with open(path, encoding="utf-8") as f:
        lines = f.read().split("\n")
    title = re.sub(r"^#\s*(\[[^\]]*\]\s*)?", "", lines[0]).strip()
    url = date = None
    for l in lines[1:8]:
        if l.startswith("- url:"):
            url = l[6:].strip()
        m = re.search(r"(\d{4})[.-](\d{2})[.-](\d{2})", l)
        if (l.startswith("- author/date:") or l.startswith("- written:") or l.startswith("- published:")) and m:
            date = "-".join(m.groups())
    return title, url, date


def build_usage():
    with open(os.path.join(HERE, "06-derived", "lineup-usage.json"), encoding="utf-8") as f:
        derived = json.load(f)
    sample = "Full 40-cookie Crumble Dungeon lineups published 2026-09-13 to 2026-09-24 (" + ", ".join(derived["full_lineups"]) + ")"
    rows = []
    for c in derived["cookies"]:
        if c["kept_pct"] < 50:
            continue
        rows.append({"mode": "crumble_dungeon", "kind": "cookie", "subject": c["kr"], "usage_pct": c["kept_pct"], "sample": sample, "captured_at": "2026-09-28",
                     "note": "Kept in the top 40 by: " + ", ".join(c["kept_in"]),
                     "sources": ["web:yt-XeD4c3AuQAs", "web:yt-_mvTZSI8hY8", "nv:41500", "nv:45597"]})
    dump("usage.json", rows)
    return len(rows)


def build_sources():
    lanes = lane_index()
    out = {}
    missing = []
    for sid in sorted(cited_ids()):
        site, key = sid.split(":", 1)
        lane = lanes.get(sid, {})
        rel = lane.get("relevance")
        signal = f"relevance {rel}/3" if rel is not None else None
        if site == "dc":
            path = os.path.join(HERE, "02-dc", "dc", f"{key}.md")
        elif site == "nv":
            path = os.path.join(HERE, "04-naver", "nv", f"nv-{key}.md")
        elif key.startswith("yt-"):
            path = os.path.join(HERE, "05-youtube", "watch", f"yt-{key[3:]}.txt")
        else:
            if sid in WEB:
                out[sid] = WEB[sid]
            elif lane.get("url"):
                out[sid] = {"url": lane["url"], "title": lane.get("title_kr") or lane.get("title_en"), "title_en": lane.get("title_en"), "date": lane.get("date"), "signal": signal}
            else:
                missing.append(sid)
            continue
        if not os.path.exists(path):
            missing.append(sid)
            continue
        title, url, date = header(path)
        out[sid] = {"url": url, "title": title, "title_en": lane.get("title_en"), "date": date, "signal": signal}
    if missing:
        sys.exit("no capture, WEB entry or lane post for: " + ", ".join(missing))
    dump("sources.json", out)
    return len(out)


if __name__ == "__main__":
    print(f"usage rows: {build_usage()}")
    print(f"sources: {build_sources()}")
